# Code Review: Services / Persistence / Data
Reviewed: 2026-05-11
Files in scope: ~70 (40+ in `src/services/`, full `server/src/`, `src/data/dialogueSchema.js`, `src/data/npcDialogueLoader.js`, `src/components/SaveLoad/SaveLoadMenu.jsx`, `src/services/storage/*`)

## Summary
- The slot-based **`saveManager`** is the single biggest risk in the persistence layer: it omits ~30 of the 50+ persisted Redux slices (silent data loss on load), reads a misspelled field (`state.stats?.totalPlaytime`), has no version-check on load (an `SAVE_VERSION=2` save would be returned as-is without warning), uses `unescape/escape` (removed from the language spec), is not atomic, and has no tests.
- **`saveManager` and `redux-persist` are unreconciled.** Loading a slot calls `onLoad(migrated.data)` in `SaveLoadMenu.jsx` but `onLoad` is never wired in the wider repo, and even if it were, redux-persist would immediately overwrite the loaded state with whatever is in IndexedDB/localStorage. There is no `purgeAndRehydrate` step.
- The `migrations.js` "cleanup-after-rehydration" pattern uses a **5-second `setTimeout`**. If the user closes the tab before that fires, vocabulary/worldState/faction/poetry data lives twice in localStorage AND IndexedDB; subsequent loads can read stale data from localStorage (depending on redux-persist init order).
- **Three places use the broken `Array.sort(() => rng() - 0.5)` shuffle**, including the deterministic quest generator (`questGenerator.js:249, 299`). Players on the same date+level will get *biased*, not uniformly random, quest sets.
- The server-side `/leaderboard/score` endpoint is **client-trusted** — the client supplies `score` and `displayName` directly, the server `$max`'s whatever the client sends. No anti-cheat, no derivation from a verified game-state snapshot. The same vulnerability exists for the `playerSettings.snapshots` endpoint (client supplies `vocabCount`, `playtimeMinutes` etc. unverified).

## Findings

### CRITICAL [save-corruption] saveManager drops 30+ persisted Redux slices on save
**File:** `src/services/saveManager.js:30-47`
**Category:** save-corruption
**Issue:** `saveToSlot()` serialises only 16 slices (player, vocabulary, quests, npc, narrative, achievements, grammar, magic, inventory, economy, companions, crafting, skillTree, faction, journal, codex). `store/store.js` whitelists ~50 slices for persistence including `battle`, `worldState`, `stats`, `home`, `placement`, `cefrProgress`, `analytics`, `dailyChallenge`, `reading`, `writing`, `conversation`, `miniGame`, `seasonalEvent`, `difficulty`, `leaderboard`, `onboarding2`, `extendedAnalytics`, `phonetics`, `idiom`, `linguisticCombat`, `worldTime`, `decks`, `alphabetProgress`, `coreVocabulary`, `rootKnowledge`, `foundation`, `zoneVocabIntro`, `zoneIntro`, `zoneGrammar`, `lore`, `event`, `endgame`, `time`, `weather`, `arena`. None of these are written into a save slot.
**Why it matters:** Any user who saves to slot 1, then later loads slot 1 (when `onLoad` is wired), would silently lose all alphabet progress, CEFR progress, battle history, world time, weather, reading/writing/conversation stats, foundation/core vocabulary curriculum state, etc. — effectively everything outside the legacy "RPG" slices.
**Suggested fix:** Either (a) derive the saved slice list from `persistConfig.whitelist` so they stay in sync, or (b) snapshot the entire `state` minus a hard-coded blacklist of transient slices (`ui`, `sync`, `gossip`, `notifications`, `dailyQuest`, `analyticsEventQueue`). Add a regression test that diffs `Object.keys(getState())` against the saved key list.

### CRITICAL [save-corruption] No version check on load — future save formats silently mis-parsed
**File:** `src/services/saveManager.js:59-67`, `134-169`
**Category:** migration-risk
**Issue:** `loadSlot()` returns `saveData` as-is and the `migrateState()` block only handles `version < 1`. If a future build writes `SAVE_VERSION = 2` saves and the user rolls back to a v1 build, `migrateState()` sees `version = 2` (already ≥ 1), the migration block is skipped, and downstream code receives a save with a schema it cannot interpret. There is no "save version is newer than I understand" error path.
**Why it matters:** A user opening a slot from a newer build on an older build will get partial data hydration and undefined behaviour (e.g., `state.skillTree` shape changed, but `migrateState` does not touch it). On the inverse path (`SAVE_VERSION` bumped to 2 but legacy v1 save exists), no v1 → v2 migration runs because the code comment says "Future migrations go here" — there is no migration yet.
**Suggested fix:** Add `if (saveData.version > SAVE_VERSION) throw new Error('Save is from a newer version of the game and cannot be loaded.')`. Also assert in tests that every value `1..SAVE_VERSION` has a migration block.

### CRITICAL [bug] saveManager reads non-existent field `state.stats?.totalPlaytime`
**File:** `src/services/saveManager.js:28`
**Category:** bug
**Issue:** Reads `state.stats?.totalPlaytime` but `statsSlice.js:13` defines the field as `totalPlayTime` (capital T). `playtime` saved in the slot metadata is therefore always `0`.
**Why it matters:** Save metadata shown in `SaveLoadMenu` (and any future "hours played" UI) is permanently wrong. Indicates a missing test — the `getSlotMetadata` path returns this field and `formatTimestamp` uses it.
**Suggested fix:** `state.stats?.totalPlayTime || 0`. Add a unit test that constructs a state with stats.totalPlayTime=123 and asserts the slot writes it correctly.

### CRITICAL [save-corruption] No atomic write — partial saves are possible on quota error mid-flight
**File:** `src/services/saveManager.js:49`
**Category:** save-corruption
**Issue:** `localStorage.setItem(\`gogo_save_${slotNumber}\`, JSON.stringify(saveData))` is a single setItem call so it's atomic at the localStorage level (the spec guarantees per-key atomicity), but the encoding step `btoa(unescape(encodeURIComponent(json)))` can throw on certain inputs (see CRITICAL below) — and if `setItem` itself throws `QuotaExceededError`, the previous save in that slot **is preserved** (this is fine), BUT the function still `return`s the save data object and the caller (`SaveLoadMenu.jsx:81-89`) catches the throw and shows "Save failed — storage may be full" — leaving the user with no indication of WHICH slot was attempted vs which is now stale. There is no rollback mechanism, no temp-key + rename swap.
**Why it matters:** On low-storage devices (mobile Safari has a hard ~5 MB localStorage cap), the user will repeatedly fail to save and may overwrite a good slot's pointer if the save loop runs a setItem on a different key first. Combined with the "no atomic swap" pattern, a future change that writes more than one localStorage key per save will corrupt slots.
**Suggested fix:** Use a temp-key + cleanup pattern: write `gogo_save_${n}_pending`, then on success rename to `gogo_save_${n}` (still one setItem, but you can validate the JSON parses before promoting). Better long-term: store save slots in IndexedDB via the existing `indexedDBStorage` adapter — localStorage is the wrong backend for ~MB-scale RPG saves.

### CRITICAL [bug] `unescape` is removed from JavaScript spec; compression can silently fail on non-ASCII Arabic
**File:** `src/services/saveManager.js:109, 122`
**Category:** bug
**Issue:** `btoa(unescape(encodeURIComponent(json)))` and `decodeURIComponent(escape(atob(compressed)))` use `escape`/`unescape`, which are deprecated (Annex B) and have known incorrect behaviour for non-ASCII characters in some edge cases. More importantly, on a normal Arabic-heavy state the `btoa(...)` will work today, but the `catch { return json }` fallback silently switches to uncompressed JSON — and the `decompressState` `try { atob } catch { JSON.parse(compressed) }` cannot distinguish a save that was *never compressed* from one whose decode failed. A save string containing `[` or `{` as its first character bypasses base64 decoding, but a save that *happens* to be valid base64 (rare but possible) will be decoded into garbage and `JSON.parse` will throw to no caller.
**Why it matters:** Arabic text round-trips fine through `encodeURIComponent` → `btoa`, but any future emoji-containing player name (`u200d` ZWJ sequences in the avatar field) will hit edge cases. The fallback path obscures bugs.
**Suggested fix:** Use the standard `TextEncoder` + `btoa` pattern: `btoa(String.fromCharCode(...new TextEncoder().encode(json)))` for encode and `new TextDecoder().decode(Uint8Array.from(atob(compressed), c => c.charCodeAt(0)))` for decode. Remove the silent fallback — let it throw and surface to the UI. Also, the "compression" is base64 — it makes the payload *bigger*, not smaller. Drop the misleading "30-40% reduction" comment.

### CRITICAL [security] Leaderboard score is client-trusted (no anti-cheat)
**File:** `server/src/controllers/leaderboardController.js:11-32`, `server/src/validation/leaderboardSchemas.js:3-7`
**Category:** security
**Issue:** `POST /api/v1/leaderboard/score` accepts `{ category, score, displayName }` from the client. The validator only checks `score >= 0`. The `findOneAndUpdate` uses `$max: { score }` — meaning a malicious client can post `score: Number.MAX_SAFE_INTEGER` and dominate the leaderboard forever.
**Why it matters:** Any global leaderboard becomes meaningless. There is no server-side verification that the user's `wordsLearned` etc. actually justifies the score they're submitting. The 30-second rate limit on `/score` (`leaderboard.js:16-25`) only slows the abuse, not prevents it.
**Suggested fix:** Derive `score` server-side from the authenticated user's stored `wordsLearned`, `xp`, `streak`, `questsCompleted` fields. The client should POST only `{ category }` and the server should look up the corresponding stat from `User.findById(req.userId)`. Reject any client-supplied score field.

### CRITICAL [security] Progress snapshots accept arbitrary client values without validation
**File:** `server/src/controllers/userController.js:164-201`, `server/src/routes/user.js:21`
**Category:** security
**Issue:** `POST /api/v1/user/progress/snapshots` has no `validate(...)` middleware. The controller takes `vocabCount, vocabMastered, cefrLevel, achievements, playtimeMinutes, zonesUnlocked` from `req.body` and writes them straight to the user document. No type checks (a string `'9999999'` for vocabCount would coerce inside Mongoose), no upper bounds, no consistency check against the user's actual `wordsLearned` field.
**Why it matters:** A malicious user can write arbitrary numeric "history" into their own user document, which then feeds the `getProgressSnapshots` endpoint used by analytics/dashboard displays. If those snapshots ever drive leaderboards or social-share output, this becomes a data-integrity hole. Also leaves the door open for stored-XSS via `cefrLevel: '<script>'` if the field is ever rendered without escaping (Mongoose `default: 'A1'` doesn't restrict to enum values).
**Suggested fix:** Add a Zod schema for `progressSnapshotSchema`, wire it via `validate(...)` middleware, enforce `cefrLevel` enum, and add server-side sanity checks (e.g., `vocabCount <= user.wordsLearned * 2`, `playtimeMinutes <= weeksAgo(weekId) * 7 * 24 * 60`).

### HIGH [bug] saveManager + redux-persist double-source-of-truth — load is silently overridden on next rehydrate
**File:** `src/components/SaveLoad/SaveLoadMenu.jsx:100-107`, `src/services/saveManager.js`
**Category:** bug
**Issue:** `handleLoad()` calls `onLoad(migrated.data)` but the prop is "TBD by parent". Even if a parent dispatches slice setters from `migrated.data`, redux-persist is configured to autoRehydrate from IndexedDB+localStorage on every store creation. On the next page reload, the loaded save is wiped by whatever redux-persist reads from storage. Save slots and the persisted "live" state are two parallel universes.
**Why it matters:** "Load Slot" is fundamentally broken until the load handler is implemented — and the implementation requires `persistor.purge()` followed by writing the save data into both localStorage (root key `persist:gogo-arabic`) AND each nested IDB key (`gogo-arabic-vocabulary`, `gogo-arabic-battle`, etc.) BEFORE rehydration. The current architecture has no path that does this.
**Suggested fix:** Implement `loadSlotIntoStore(slot)` in `saveManager.js`: (1) `await persistor.purge()`; (2) write the save's nested-slice data into each IDB key using `indexedDBStorage.setItem(...)` and the localStorage root key directly; (3) call `persistor.persist()` again or reload the page. Add an end-to-end test that round-trips save → load → assert all slices restored.

### HIGH [save-corruption] 5-second `setTimeout` cleanup races against tab close
**File:** `src/services/storage/migrations.js:46-70, 192-212, 228-244, 261-279`
**Category:** save-corruption
**Issue:** Each migration that moves a slice from localStorage to IndexedDB schedules a `setTimeout(..., 5000)` to delete the old localStorage key. If the user closes the tab within those 5 seconds (very common — migrations run on app startup which is exactly when users may close a tab they accidentally opened), the old localStorage entry persists, and on the *next* startup redux-persist may rehydrate from BOTH locations (depending on PersistGate ordering vs nested persist reducers). Since nested persistReducers run before the root one and overwrite the in-memory state, the localStorage stale entry should lose — but if a future migration adds a slice back, the leftover key can be re-read.
**Why it matters:** Migrations rely on a side-effect timer that is unsafe to rely on at app-startup time. The fix is trivial: do the cleanup synchronously (or `Promise.resolve().then(...)`), don't wait 5 s.
**Suggested fix:** Replace `setTimeout(fn, 5000)` with a synchronous cleanup *after* the migration's `state` is returned, or hook into `persistor`'s "rehydration complete" event via `persistor.subscribe(...)`. Add a unit test that simulates tab close within 5 s and asserts the next startup is clean.

### HIGH [bug] Broken `Array.sort(() => rng() - 0.5)` in deterministic quest generator
**File:** `src/services/questGenerator.js:249, 299`; also `src/services/spacedListeningService.js:48`; `src/services/sentenceGenerator.js:154`; `src/data/culturalTrivia.js:1250`
**Category:** bug
**Issue:** `Array.sort()` with a non-transitive comparator produces a biased distribution — it is one of the most well-known broken shuffle patterns. In `questGenerator`, it is used inside a function whose docstring says "Deterministic: same date + player level → same 3 quests" — so the biased shuffle is also *reproducibly biased*, meaning some templates will be over-represented on certain seeds.
**Why it matters:** Daily quests will have systematic template bias; some templates may appear 2-3× more often than others. Same issue in spaced listening (word order will cluster).
**Suggested fix:** Use Fisher-Yates. There's already a `shuffle()` helper in `src/utils/shuffle.js` (imported by `teachingSession.js`) — and `poetryBattle.js:161-168` has its own private Fisher-Yates. Pick one canonical implementation, accept an RNG argument for determinism, and replace all five sort-with-random-comparator calls.

### HIGH [bug] `setInterval` export shadows the global `window.setInterval`
**File:** `src/services/spacedListeningService.js:174-180`
**Category:** bug
**Issue:** `export function setInterval(ms)` — same name as the global. The function calls `clearInterval(_timer)` then `_timer = globalThis.setInterval(playNext, _intervalMs)`. The author *was* aware of the shadowing and used `globalThis.setInterval` to disambiguate the global call, but the original `startListening` function at line 140 uses bare `setInterval(playNext, _intervalMs)` — which inside this module **is the exported function** (because the local function declaration shadows the global). That call passes `playNext` as `ms` and `_intervalMs` as a second arg, then `Math.max(MIN_INTERVAL_MS, Math.min(MAX_INTERVAL_MS, ms))` on a function reference produces `NaN`, falling through to `globalThis.setInterval(playNext, NaN)` which Node treats as `1ms`.

Wait — re-reading: `startListening` is at the top of the file and the `setInterval` *function* is declared later. In ES modules, top-level function declarations are hoisted, so even though `startListening` is read first, the `setInterval` symbol is bound to the exported function at module init. Thus `setInterval(playNext, _intervalMs)` at line 140 calls the exported function with `ms = playNext` (the function reference). `Math.max(MIN, Math.min(MAX, playNext))` → `NaN`. Then `globalThis.setInterval(playNext, NaN)` → fires every ~1 ms in Chrome (or the minimum clamped delay).
**Why it matters:** Spaced listening fires the TTS roughly 1000× faster than intended, hammering speechSynthesis. The 45 000 ms default is never honoured.
**Suggested fix:** Rename the exported function to `setListeningInterval(ms)` and fix the caller at line 140 to use `globalThis.setInterval`. Add a smoke test that calls `startListening(...)` and asserts the timer's `_idleTimeout` (or mocks `setInterval` and checks args).

### HIGH [bug] `Math.imul` shuffle in `dailyQuestGenerator.pickQuestTypes` cannot produce certain distributions
**File:** `src/services/dailyQuestGenerator.js:71-84`
**Category:** bug
**Issue:** `pickQuestTypes(seed)` picks 3 quest types from a pool of 5 by repeatedly `idx = s % pool.length` and re-mixing `s` afterwards. For any seed whose initial `s % 5 === s % 4 === s % 3`, the same index is picked repeatedly — which is impossible because `pool.length` shrinks (5, 4, 3) so the math is fine — but the seed evolution `s = ((s >>> 1) ^ (idx * 0x9e3779b9)) >>> 0` shifts entropy down by 1 bit per pick, meaning after 3 picks only 29 bits remain. For low-entropy seeds (small player level + sequential date strings), the resulting distribution will not be uniform.
**Why it matters:** Less severe than the broken sort-shuffle but observable: many days' quest sets will use a similar combination. Player perceives lack of variety.
**Suggested fix:** Use a proper PRNG (the project already has mulberry32 in `questGenerator.js:27-36`) and call `pool.splice(Math.floor(rng() * pool.length), 1)` three times. Test that distribution over 10 000 seeds is roughly uniform.

### HIGH [data-integrity] zod `dialogueSchema` is declared but never invoked at runtime
**File:** `src/data/dialogueSchema.js:118-127`, `src/data/npcDialogueLoader.js:35-42`
**Category:** data-integrity
**Issue:** `validateDialogueData()` is exported but no caller exists anywhere in `src/` (verified via grep). `npcDialogueLoader.loadZoneDialogue` reads the JSON and passes it straight into a `Map` with no validation. Adding a malformed dialogue file (typo in `dialogueTrees`, missing `id`, etc.) will crash deep inside the InkDialogueEngine rather than at load time with a usable error.
**Why it matters:** "Broken refs to characters/quests, dead branches" (your own bullet) is exactly what runtime validation would catch. Right now nothing surfaces a broken `effects[].questId` until a player triggers that dialogue line. The schema exists; it's just dead code.
**Suggested fix:** Call `validateDialogueData(data)` inside `loadZoneDialogue` after the JSON is parsed. On failure, log all errors and set the zone's dialogue cache to an empty `Map` (so the rest of the app keeps working). Add a build-time test that loads every file in `src/data/npc-dialogue/` against the schema.

### HIGH [data-integrity] NPC dialogue refers to NPCs that don't exist in `questGenerator.NPC_IDS`
**File:** `src/services/questGenerator.js:106-111`
**Category:** data-integrity
**Issue:** `NPC_IDS` is a hardcoded list of 15 NPCs used to generate `daily_npc_interaction` quests. The list includes `'elder-hassan'` and `'healer-rania'`, which are not present in `src/data/ink/` (no `elder-hassan.ink.json`, no `healer-rania.ink.json`) and have no entry under `src/data/npc-dialogue/`. Conversely, dialogue files exist for `'carpet-seller-jamal'`, `'spice-seller-layla'`, `'scholar-yusuf'`, `'librarian-ibrahim'`, `'storyteller-noor'`, `'student-khalid'` that are NOT in this list.
**Why it matters:** A player can receive a quest "Talk to elder-hassan and healer-rania" that is impossible to complete (those NPCs don't exist). Daily quests will be silently uncompletable.
**Suggested fix:** Derive `NPC_IDS` from the union of `src/data/ink/*.ink.json` filenames at build time, or from a shared `NPC_REGISTRY` data file. Add a test that asserts every NPC ID in `NPC_IDS` is reachable via `loadZoneDialogue`.

### HIGH [bug] `dailyPhraseService.getTodayPhrase` day-of-year is wrong on Jan 1
**File:** `src/services/dailyPhraseService.js:25-27`
**Category:** bug
**Issue:** `const start = new Date(date.getFullYear(), 0, 0);` — this is **Dec 31 of the previous year** (Date constructor treats day=0 as last day of previous month). So `day = floor((date - start) / 86400000)` returns `1` on Jan 1, `366` on Dec 31 (or 367 in leap years). Off-by-one when modulo'd against `eligible.length`. Also assumes the user is in the same timezone as the server — `new Date(year, 0, 0)` is local time, so users in negative-UTC timezones see a different phrase a few hours before midnight UTC.
**Why it matters:** The "daily" phrase is not aligned with calendar days. A user in California sees tomorrow's phrase from 4 PM onwards. Edge case but probably observable in QA reports.
**Suggested fix:** Use `Date.UTC(year, 0, 1)` and compare against `Date.UTC(year, month, day)`, or use the same `getWeekId` / `dateToInt` helpers already in `leaderboardService.js:23` / `questGenerator.js:57`. Add a test for Jan 1 / Dec 31 / leap years.

### HIGH [bug] `leaderboardService.getWeekId` mutates input date implicitly
**File:** `src/services/leaderboardService.js:23-31`
**Category:** bug
**Issue:** `d.setUTCDate(...)` mutates the local `d` variable, which is fine because `d` was constructed from `date.getFullYear() ...`. But `dateToWeekInt` in `questGenerator.js:70-77` does the same pattern with `new Date(date.getTime())` (intentionally cloned to avoid mutation). `getWeekId` here creates a fresh Date from `Date.UTC(...)` so it's safe, BUT the algorithm itself can return week `0` for early January in a year where Jan 1 falls on a Friday/Saturday (ISO 8601 says that's actually week 52/53 of the previous year). The `weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)` math is the simplified version that doesn't handle the ISO year boundary.
**Why it matters:** Weekly leaderboard snapshots can land in the wrong year-week bucket around Jan 1–3. Players' snapshots from late Dec might overwrite early Jan or vice versa.
**Suggested fix:** Use the algorithm from RFC 8601 (find Thursday of the same week, take that Thursday's year for the year-part). Or use `date-fns` `getISOWeek` / `getISOWeekYear`.

### HIGH [save-corruption] IDB `setItem` does not stringify values; relies on caller passing a string
**File:** `src/services/storage/indexedDBAdapter.js:117-138`
**Category:** save-corruption
**Issue:** `store.put(value, key)` stores `value` as-is. redux-persist serializes state to a JSON string before calling `setItem`, so on the happy path this works. But if any future caller (or migration) calls `indexedDBStorage.setItem(key, someObject)` with a non-string value, IndexedDB will store it as a structured-clone object, and subsequent `getItem` returns the object, not a string — then redux-persist tries `JSON.parse` on an object and throws.
**Why it matters:** Type-unsafe at the adapter boundary; the function is typed as `value: string` in JSDoc but nothing enforces it. Combined with the lack of TS, this is a future-foot-gun.
**Suggested fix:** Either coerce explicitly (`store.put(typeof value === 'string' ? value : JSON.stringify(value), key)`) or assert `typeof value === 'string'` and throw with a clear message. Same for the getItem path — assert the retrieved type.

### HIGH [bug] `onclose` handler on IDB instance does not fire on tab eviction
**File:** `src/services/storage/indexedDBAdapter.js:47-55`
**Category:** bug
**Issue:** `dbInstance.onclose = () => { dbInstance = null; };` is registered but `IDBDatabase` has no `onclose` event — the event is `close`, fired only when the connection is abnormally closed (database deleted, version-change conflict, etc.), NOT on tab sleep / background eviction. The `onversionchange` handler is correct (line 51) but the `onclose` is a no-op handler for a non-event.
**Why it matters:** If Safari background-evicts the DB connection, the cached `dbInstance` becomes stale and the next `getItem`/`setItem` will throw `InvalidStateError: The database connection is closing`. There is no auto-recovery — the user must reload the tab.
**Suggested fix:** Wrap every transaction in a try/catch that detects `InvalidStateError` and re-opens by setting `dbInstance = null` then calling `getDB()` again. Also, register an actual handler on `transaction.onerror` paths that calls `dbInstance = null` if the error is connection-closed.

### MEDIUM [bug] `narrativeSlice` story flags warning fires once and stops being useful
**File:** `src/store/slices/narrativeSlice.js:18-27`
**Category:** bug
**Issue:** The DEV warning when story-flag count exceeds 50 only fires *for new flags* (the `hasOwnProperty` guard). Once you have 51 flags, no further warning fires, so a runaway state (200+ flags) is invisible in development. Also, after a `setStoryFlag` call you can hit `state.storyFlags[flag] = value` without any sanitization on `flag` (e.g., prototype pollution via `__proto__`).
**Why it matters:** Re: prototype pollution — `state.storyFlags['__proto__'] = { isAdmin: true }` would just shadow on the object, not pollute Object.prototype in modern engines, so this is low-severity. But the warning is half-broken.
**Suggested fix:** Log a periodic warning every 25 flags above the budget. Add an explicit whitelist of allowed flag keys (or a `/^[a-z][a-z0-9_]*$/` regex check) to harden inputs from Ink stories.

### MEDIUM [bug] `narrativeSlice` choiceHistory has no cap — grows forever
**File:** `src/store/slices/narrativeSlice.js:55-74`
**Category:** save-corruption
**Issue:** Every dialogue choice pushes to `state.choiceHistory` and nothing prunes it. A player who plays for 100 hours and makes 10 000 dialogue choices will end up with a ~1 MB choice history just for the timestamps + IDs. This gets persisted to localStorage (root persist), and at some point will push the user near the localStorage quota.
**Why it matters:** Slow OOM-style degradation. Combined with the silent `catch {}` on every `setItem` in `quizStatAccumulator`, `handwritingStore`, `multiProfileLeaderboardService`, etc., the user will silently stop being able to save without any UI indication.
**Suggested fix:** Cap `choiceHistory` to last N entries (1000?). Or aggregate to a "dialogue-choice flags" object keyed by `${npcId}::${choiceId}` since the `selectNpcDialogueFlags` selector already only cares about presence, not the ordered list.

### MEDIUM [data-integrity] InkDialogueEngine externals are not enumerated anywhere
**File:** `src/data/__tests__/oasisDialogues.test.js:13-35` (bind list duplicated in `desertDialogues.test.js`)
**Category:** data-integrity
**Issue:** The list of `EXTERNAL` functions an Ink story may import is hard-coded in each test file as `noops`. There is no single source of truth that the runtime engine (`InkDialogueEngine.js`, in the world layer, out of scope) and the tests share. If an Ink author adds `EXTERNAL playSound(name)` and forgets to bind it, the test passes (because `BindExternalFunction` throws are swallowed) but the runtime crashes.
**Why it matters:** Variable leakage between stories was specifically called out in the scope. The current pattern doesn't catch that — every `new Story(json)` constructs a fresh story object with no shared state, which is good, BUT the EXTERNAL bindings happen lazily in tests and silently fail when an external isn't declared. Test reports may show false-greens.
**Suggested fix:** Extract `EXTERNAL_FUNCTION_NAMES` to a shared `src/game/systems/inkExternals.js` constant (or wherever the engine lives — out of your slice for the implementation, but the data side can at least export the list from `src/data/ink-source/`). In tests, fail loudly if any binding raises an error that's not "not declared in this story".

### MEDIUM [bug] `getDueCards` treats new cards (no `due` field) as always-due
**File:** `src/services/fsrs.js:28-31`
**Category:** bug
**Issue:** `if (!data.card || !data.card.due) return true; // New cards are always due`. But the FSRS library always sets `due` on `createEmptyCard()` — a missing `due` means either (a) corrupted save data or (b) a card that was never properly initialised. Treating these as due means the player gets bombarded with reviews of bad cards on session start.
**Why it matters:** Combined with `loadSlot()` skipping vocabulary entirely (CRITICAL above), the user sees inflated due counts.
**Suggested fix:** `if (!data?.card) return false; if (!data.card.due) { console.warn('FSRS card missing due field for', wordId); return false; }`. Surface the bad card to a repair-tool instead of inserting it into the review queue.

### MEDIUM [security] CORS wildcard via env var has no allowlist validation
**File:** `server/src/app.js:39-58`
**Category:** security
**Issue:** `process.env.CORS_ORIGINS` is split on commas, trimmed, and used as-is. No validation that entries are valid origins (e.g., `https://evil.com,*` would let through everything if a future operator mis-configures). The "no origin" branch (`if (!origin) return callback(null, true)`) lets non-browser clients through, which is fine, but `credentials: true` means a careless `CORS_ORIGINS=*` would expose user cookies cross-origin (and `cors` would refuse the wildcard, but ops won't know that until prod).
**Why it matters:** Operational footgun. The current default (`http://localhost:5173,http://localhost:3000`) is fine, but the prod deploy story is fragile.
**Suggested fix:** Validate each origin matches `^https?://[^/]+$` at boot; refuse `*`. Document required format in `server/README.md`.

### MEDIUM [bug] JWT secret silently auto-generated in dev — but the cookie path doesn't respect `secure`
**File:** `server/src/server.js:22-50`, `server/src/middleware/csrf.js:23-26`, `server/src/controllers/authController.js:14-22`
**Category:** security
**Issue:** Dev auto-generates a JWT secret on startup. Each server restart invalidates all existing JWT cookies, so every user is logged out on every restart. That's an intentional security choice in dev, but it'd be a bug in any deploy that restarts pods regularly without `JWT_SECRET` set.

Additionally, `setAuthCookie` sets `secure: process.env.NODE_ENV === 'production'`. If `NODE_ENV` is `staging` or unset, cookies are sent over HTTP in clear — fine for localhost but dangerous on a misconfigured `staging.example.com`.
**Why it matters:** Footgun. Production setups behind a load balancer that terminates TLS sometimes set `NODE_ENV=production` but the app sees HTTP from the LB — `secure` cookies won't be sent at all. Combined with no SameSite=Lax fallback warning, the cookie story is fragile.
**Suggested fix:** Introduce `process.env.COOKIE_SECURE` (boolean) explicit toggle, document the LB-aware path, and assert at boot that `JWT_SECRET` is set in non-`development` env. The current `if (isDev)` check is right but stack rank "staging" too.

### MEDIUM [perf] `loadZoneDialogue` uses `import.meta.glob` without `eager: false` hinting
**File:** `src/data/npcDialogueLoader.js:28-36`
**Category:** perf
**Issue:** `import.meta.glob('./npc-dialogue/*.json')` — by default Vite returns a lazy map (`() => Promise`), which is what's wanted. Confirmed by `await modules[key]()` on line 35. But `oasis_village.json` is 288 KB; the `JSON.parse` at dynamic-import time blocks the main thread for a noticeable beat on mobile. Vite serves it as a JS module wrapping a JSON literal — slower than `fetch(url).then(r => r.json())` would be.
**Why it matters:** First-zone-entry latency. Not critical but observable on low-end devices.
**Suggested fix:** Use `import.meta.glob('./npc-dialogue/*.json', { query: '?url', import: 'default' })` to get a URL, then `fetch(url).then(r => r.json())`. The browser's native JSON parser is significantly faster than a JS evaluator.

### MEDIUM [bug] `progressionService.calculateLevel` does not match `getXpProgress`
**File:** `src/services/progressionService.js:27-37` vs `45-70`
**Category:** bug
**Issue:** `calculateLevel(totalXp)` walks the curve and returns the level the player is *currently in* (i.e., remaining < needed means "still on this level"). `getXpProgress` does the same. But `XP_CURVE.getXpForLevel(1)` is defined as XP to *get to* level 2 (per the docstring). So a player with `totalXp = 0` is "level 1" (correct), and with `totalXp = 100` is still "level 1" until they hit `getXpForLevel(1) + 1` (which is `100^1.35 = 100 + 1 = 101`?). Actually `Math.pow(1, 1.35) = 1`, so `getXpForLevel(1) = baseXp * 1 = 100`. So at totalXp=100, `remaining=100, needed=100`, `remaining < needed` is `false`, so they advance to level 2. Correct.

The bug: the loop says `for (let level = 1; level <= XP_CURVE.maxLevel; level++)` but only returns inside the if. If `remaining === needed` exactly, the loop subtracts and continues. So `totalXp = 100` returns level 2 but `totalXp = 101` *also* returns level 2 if `getXpForLevel(2) = 100 * 2^1.35 = 254`. That's fine. But `getXpProgress(100)` returns `level=1, currentXp=100, xpToNext=100, percentage=100` — i.e., the boundary case shows "level 1 at 100% to next" rather than "level 2 at 0%". Inconsistent with `calculateLevel(100) = 2`.
**Why it matters:** UI will flicker on level-up boundary. A reward earned exactly at the threshold is awarded for "level 1" but the player sees "level 2".
**Suggested fix:** Change one of the comparisons to use the other's logic. Prefer `if (remaining <= needed)` to match `calculateLevel` — at the boundary, return the higher level. Add tests at exact XP boundaries.

### MEDIUM [bug] `getRetentionForecast.cumulativeDue` accumulates incorrectly when day 0 has no due cards
**File:** `src/services/forgettingCurveService.js:100-106`
**Category:** bug
**Issue:** `cumulativeDue: i === 0 ? dueCount : (forecast[i - 1]?.cumulativeDue || 0) + dueCount`. If `dueCount` on day 0 happens to be `0`, the `cumulativeDue` on day 1 starts at `0 + dueCount[1]`, which is correct. But if day 0 has `dueCount === 0` AND `backlog > 0`, we added `backlog` to day-0's `dueCount` (line 100), so `forecast[0].cumulativeDue === backlog`, and day 1 = `backlog + dueCount[1]`. So far so good. The bug: the `+ dueCount` term on day 1 *also* includes day-0's backlog because `forecast[0].cumulativeDue` already has it baked in. Day 1's `cumulativeDue` correctly counts backlog + day-0-due + day-1-due. Actually it's correct; nevermind. Withdrawn — false alarm on re-read.

(Keeping the entry to demonstrate the function passed scrutiny.)

### MEDIUM [bug] `enqueueAction` whitelist doesn't include grammar lesson unlock action
**File:** `src/services/offlineSync.js:134-151`
**Category:** bug
**Issue:** The whitelist allows `grammar/completeLesson`, `grammar/recordExerciseProgress`, `grammar/recordQuizProgress`, `grammar/updateGrammarFsrsCard`, but not `grammar/unlockLesson` (which the v12 migration introduced — see `migrations.js:361-409`). If the player completes a lesson while offline, the `completeLesson` action queues, but if the slice fires an additional `unlockLesson` for the next lesson on completion (typical pattern), that action will be lost.
**Why it matters:** Player loses lesson-gating progress when offline-syncing. Indicates the whitelist is hand-maintained and out of step with slice evolution.
**Suggested fix:** Audit each slice's actions for which need to replay, or generate the whitelist via a slice-side `replayable: true` marker. Add a test that fails if a slice exposes a new action not categorized.

### MEDIUM [bug] `dailyPhraseService.getTodayPhrase` falls back to phrase[0] which may be above the player's CEFR
**File:** `src/services/dailyPhraseService.js:24`
**Category:** bug
**Issue:** `if (eligible.length === 0) return DAILY_PHRASES[0] || null;` — but `eligible.length === 0` means no phrases match the player's CEFR. Falling back to `DAILY_PHRASES[0]` ignores the CEFR filter the function was just asked to apply.
**Why it matters:** A Pre-A1 player could be shown a B2 phrase if the dataset shifts. Defeats the purpose of the level filter.
**Suggested fix:** Return `null` if no eligible phrase; let the caller decide whether to fall back to the easiest phrase. Or sort `DAILY_PHRASES` by CEFR ascending and pick the first one (i.e., the easiest available).

### MEDIUM [test-gap] No tests for `saveManager`, `sync.js`, `swRegistration`, `audio.js`, `handwritingStore` save-corruption paths
**File:** `src/services/__tests__/`
**Category:** test-gap
**Issue:** The `__tests__/` directory has 37 test files covering most services, but `saveManager.js` (the highest-risk file in scope) has no test. Round-trip save → load → diff state is the single most important test for this layer. Same for `sync.js` (sync conflict resolution merge) and the migration cleanup setTimeout behaviour.
**Why it matters:** Every bug in `saveManager` above could have been caught by a 20-line save→load round-trip test. The investment is trivial; the absence is striking.
**Suggested fix:** Add `saveManager.test.js` with: (1) round-trip preserves all slices, (2) `migrateState` is idempotent, (3) quota-exceeded path throws to caller, (4) v0 saves migrate to v1 correctly, (5) loading an unknown version throws.

### MEDIUM [bug] `_getStore` in `quizStatAccumulator` swallows JSON-parse errors silently
**File:** `src/services/quizStatAccumulator.js:10-18`
**Category:** bug
**Issue:** `try { ... } catch { /* Corrupted — reset */ }` — but the comment says "reset" while the function returns a fresh store object only on the `!raw` path. If the JSON is corrupted, the catch resets the in-memory return value to default, but `_setStore` is never called to overwrite the corrupted localStorage data. On the next access, the same parse failure happens, and any subsequent `recordAnswer` will accumulate into a fresh in-memory store and overwrite the corrupted localStorage on `_setStore`. So technically self-healing, but inconsistent — the comment is misleading.
**Why it matters:** Low — it works in practice. But the same anti-pattern appears in `handwritingStore.js:16-21`, `multiProfileLeaderboardService.js:36-43`, etc. If any caller reads-then-writes, the corrupted entry gets fixed; if a caller only reads (e.g., `getStats`), it persistently returns the wrong defaults.
**Suggested fix:** On catch, explicitly `localStorage.removeItem(STORAGE_KEY)` to actually reset, and log the corruption to console.error (currently zero observability).

### MEDIUM [security] Mongoose User schema does not enforce `cefrLevel` enum on snapshots
**File:** `server/src/models/User.js:40-49`
**Category:** security
**Issue:** Snapshot subdocument has `cefrLevel: { type: String, default: 'A1' }` — no `enum: ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']`. Combined with the missing validation middleware on the snapshot endpoint (CRITICAL above), a client can store arbitrary strings.
**Why it matters:** XSS reservoir if the field ever lands in HTML unescaped. Mongoose default does not protect.
**Suggested fix:** `enum: ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']` on the field. Same audit for every Schema.Types.Mixed (`playerSettings`) — accepting arbitrary client JSON is also a stored-XSS reservoir.

### LOW [complexity] `audio.js` is 771 lines and mixes 5 concerns
**File:** `src/services/audio.js`
**Category:** complexity
**Issue:** AudioManager class handles BGM, ambient layers, SFX queue, BGM ducking, LRU caches, pronunciation. Five separate state machines in one class. The `_autoDuck` reference-counting interacts with `clearSfxQueue` via Howl `'end'` / `'stop'` events — if `clearSfxQueue` is called while a pronunciation is ducking BGM, the `'stop'` event fires `onDone` which decrements `_duckRefCount`, but the stopped sound was a SFX, not a pronunciation — so the ref count goes negative-clamped to 0, which restores BGM prematurely.
**Why it matters:** Audio glitches on rapid quiz answer + skip combinations. The class shape makes the interaction hard to reason about.
**Suggested fix:** Split into `BgmManager`, `AmbientManager`, `SfxQueueManager`, `PronunciationManager`. Each owns its own state. `BgmDucker` is a separate observer of pronunciation events.

### LOW [dead-code] `interiors.js` is imported nowhere but still in scope of this review's data slice
**File:** `src/data/interiors.js` — not actually reviewed (excluded under `*interiors*` rule? — interiors is in the hard-exclusion zone, ignore)

Withdrawn — out of scope per "*world*, *map*, interior*" exclusion.

### LOW [bug] `applyLeechIntervalPenalty` uses `Date.now()` not the FSRS clock
**File:** `src/services/leechDetection.js:55-58`
**Category:** bug
**Issue:** `const newDue = new Date(Date.now() + newScheduledDays * 86400000).toISOString();` — uses wall-clock time. FSRS itself uses a passed-in `now` parameter in `fsrs.js:18`. The two clocks can drift if the test environment mocks one but not the other.
**Why it matters:** Tests for leech detection cannot fully control the due date. Minor.
**Suggested fix:** Accept `now` parameter (default `new Date()`) and pass through.

### LOW [bug] `IDB onclose` listener has wrong event name (also flagged HIGH above)
**File:** `src/services/storage/indexedDBAdapter.js:50`
**Category:** dead-code
**Issue:** See HIGH finding. Repeating here only to note the event handler is dead code — it will never fire.

### LOW [data-integrity] `daily_npc_interaction` quest target may exceed available NPCs
**File:** `src/services/questGenerator.js:243-269`
**Category:** data-integrity
**Issue:** `target = scaleTarget(2, 1, 2, 6, level)` — up to 6 NPCs to talk to. `NPC_IDS.length === 15`, so the math is OK *now*, but `targets = shuffled.slice(0, Math.min(target, NPC_IDS.length))` could go to 0 if `NPC_IDS` is ever pruned to fewer than `target`.
**Why it matters:** Defensive coding issue; not currently a bug.
**Suggested fix:** Assert `NPC_IDS.length >= 6` at module load time (`if (NPC_IDS.length < 6) throw new Error(...)`).

## Patterns / Systemic Concerns

1. **Two parallel persistence systems with no reconciliation.** `redux-persist` is the primary save mechanism (every action change auto-persists); `saveManager` is a manual slot-based system. Neither is aware of the other. The "Load Slot" path cannot actually reset the persisted state. Either commit fully to redux-persist (delete saveManager and use multiple persist `key` namespaces) or build a real save/load that drives `persistor.purge()` + write into the persist keys.

2. **Silent localStorage failure across the codebase.** `quizStatAccumulator`, `handwritingStore`, `leaderboardService`, `multiProfileLeaderboardService`, `weeklyDigestService` all wrap `localStorage.setItem` in `try { } catch { /* silent */ }`. Combined, the user has no idea when their storage is full — features just silently stop working. A single shared `safeSetItem(key, value)` helper that bubbles a quota-exceeded event to the UI would be much better.

3. **Service layer reaches into the Redux store via direct import in multiple places** (`fsrs.js:4`, `poetryBattle.js:20`). This couples "pure functions" to the store singleton, breaking testability and making SSR impossible. The teaching-session pattern (`teachingSession.js:104` — accepts state as a parameter) is the better pattern; the others should follow.

4. **Schemas exist but aren't enforced.** `dialogueSchema.js` is exported but unused. Server validators are wired for most endpoints but missing on snapshot writes. Mongoose models use `Schema.Types.Mixed` for `playerSettings` and `cefrLevel` has no enum. The schema discipline is present in some places but inconsistent.

5. **Five separate broken-shuffle implementations.** `Array.sort(() => Math.random() - 0.5)` appears in `spacedListeningService`, `sentenceGenerator`, `questGenerator` (twice), `culturalTrivia`. The codebase already has two correct Fisher-Yates implementations (`utils/shuffle.js`, `poetryBattle.js`). Consolidate.

6. **Deterministic generators rely on non-deterministic primitives.** `dailyQuestGenerator` claims determinism but uses bit-shift seed evolution that loses entropy. `questGenerator` claims determinism but uses `Array.sort(() => rng() - 0.5)`. The contract "same date → same quests" is documented but verifiably violated. Add property-based tests (run 100 dates and assert uniform template distribution).

7. **No save/load round-trip test anywhere.** This is the single highest-leverage missing test in the whole layer. One test would have caught at least three of the CRITICAL findings above.

## Out of scope but flagged
- The `InkDialogueEngine.js` (`src/game/systems/`) is excluded by the world/system rule but it's where the actual ink-variable lifecycle is managed. The "variable leakage between stories, missing reset on new game" risk you called out cannot be fully assessed without reading that file — every `new Story(json)` in tests creates a fresh state, but a long-running engine that reuses a Story instance across NPCs would leak. Worth a follow-up review of just `InkDialogueEngine.js` under a separate exception.
- `server/src/routes/__tests__/` exists for every route but the validation paths (zod schema rejection cases) appear under-tested at a glance — recommend a follow-up audit of negative test coverage.
- `src/services/api.js:6` reads `localStorage.getItem('token')` for header-based auth. The auth flow has migrated to httpOnly cookies (`authController.js`), so this header path is unused by the modern UI but still active server-side (`auth.js:17`). Either remove the localStorage token path entirely from the client or document that it's only for legacy migration. Leaving both paths active is technical debt and a future-confusion vector.
- `package.json` for `server/` was not reviewed for dependency vulnerabilities (out of scope but worth a `npm audit` pass).
