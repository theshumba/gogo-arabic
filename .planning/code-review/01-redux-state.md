# Code Review: Redux State Management
Reviewed: 2026-05-11
Files in scope: ~140 (62 slices, 45 middleware, 1 selector, 27 store tests, 28 slice tests, store.js, migrations.js, indexedDBAdapter.js)
Depth: standard, with cross-file checks where action types span files

## Summary

- **CRITICAL save-data hazard**: the root `persistConfig` in `src/store/store.js` is missing both `version` and `migrate`. Every migration that touches root-state slices (player, grammar, settings, home, stats, npc — i.e. migrations 6, 7, 11, 12) never runs. They are wired only to nested IndexedDB configs where the targeted state keys do not exist.
- **Multiple grind/exploit bugs from non-persisted module-level state** in middleware: `dailyQuestMiddleware`, `quizDailyGoalsMiddleware`, `zoneEntryReviewMiddleware`, `zoneReviewMiddleware`, `relationshipDecayMiddleware` all gate "once-per-day" logic on module variables that reset every page reload — players can repeatedly claim daily bonuses by refreshing.
- **Three middlewares are entirely dead**: `tutorialMiddleware` reads `state.onboarding` while the store registers it at `state.onboarding2`; `utilityBonusMiddleware` listens for `player/addXp` (slice exports `addXP`); `friendshipMiddleware` listens for `npc/giveGift` / payload `{npcId}` that the actual slice never produces.
- **Four middlewares are not registered in `configureStore` at all**: `companionXpMiddleware`, `progressSnapshotMiddleware`, `skillTreeXpMiddleware`, `vocabRateMiddleware` — fully tested but never wired.
- **`addFsrsCard` is called with the wrong payload shape from at least three callers** (`battleRewardsMiddleware`, `zoneIntroMiddleware`, `poetryRewardsMiddleware`) — the reducer destructures `{wordId, card, source}` but callers pass flat FSRS fields, so the card data is silently dropped (`card: undefined`).
- Dozens of reducers contain side effects (`Date.now()`, `new Date()`, `Math.random()`), and many "selectors" return fresh `{}` / `[]` fallbacks on every call — breaking referential equality and forcing re-renders.

## Findings

### CRITICAL Root persistConfig has no `version` or `migrate` — every migration that targets root state is silently a no-op
**File:** `src/store/store.js:217-269`
**Category:** migration-risk / save-corruption
**Issue:** Lines 144–202 attach `{ version: CURRENT_VERSION, migrate }` to every *nested* IndexedDB persist config (vocabulary, battle, magic, inventory, companions, crafting, worldState, faction, poetry). The root `persistConfig` (line 217, key `'gogo-arabic'`) has neither field. Migrations 6 (force-skip broken tutorial), 7 (init home/stats/friendship/currency/settings), 11 (grammar slug remap + placement/cefrProgress init), and 12 (grammar `unlockedLessons` init) all guard on `state.player`, `state.grammar`, `state.settings`, etc. — keys that exist only in the root persist. Because the migrate function never runs for the root, those migrations never execute against a real user's localStorage payload. They *appear* to run because the IndexedDB nested configs also invoke `migrate(state, currentVersion)`, but those calls receive nested slice state (`{ fsrsCards, ... }` etc.) where `state.player` and `state.grammar` are undefined, so the migration bodies hit `if (!state.player) return state` and exit.
**Why it matters:** Every player who ever upgrades across these versions will keep numeric grammar lesson IDs forever (FIX-02 fails), miss `placement`/`cefrProgress` initialization, miss the tutorial-skip flag, and miss `grammar.unlockedLessons` — meaning the grammar lesson gate will be locked forever. Schema drift between releases is unguarded.
**Suggested fix:** Add `version: CURRENT_VERSION` and `migrate` to the root `persistConfig`:
```js
const persistConfig = {
  key: 'gogo-arabic',
  storage,
  version: CURRENT_VERSION,
  migrate,
  whitelist: [...],
};
```
Add a test that round-trips a stale v10 localStorage payload through the real `persistReducer` and asserts the v11/v12 migrations actually mutate the state.

### CRITICAL `tutorialMiddleware` reads from the wrong state key — auto-trigger is completely broken
**File:** `src/store/middleware/tutorialMiddleware.js:54`
**Category:** bug / dead-code
**Issue:** Line 54 does `const onboarding = state.onboarding;`. But `store.js:316` registers the onboarding reducer at key `onboarding2: onboardingReducer`. The slice name is `'onboarding'` (so action types are correct) but the state path is `state.onboarding2`. Line 56 `if (!onboarding) return result;` always short-circuits — the entire feature ships dead.
**Why it matters:** Tutorial steps `vocab_intro → first_quiz → first_battle → crafting_intro → quest_intro` never auto-complete on first feature use. No tests caught this because the middleware test (if any) presumably uses a custom store shape.
**Suggested fix:** Change to `const onboarding = state.onboarding2;`. Audit the rest of the codebase for `state.onboarding` references that may have the same bug. Decide whether `onboarding2` is the canonical key going forward — if so, rename the slice; if not, rename the reducer registration.

### CRITICAL `addFsrsCard` is dispatched with the wrong payload shape from three middlewares — card data is silently lost
**Files:**
- `src/store/middleware/battleRewardsMiddleware.js:72-81`
- `src/store/middleware/zoneIntroMiddleware.js:74-88`
- `src/store/middleware/poetryRewardsMiddleware.js:55-59`

**Category:** bug
**Issue:** `vocabularySlice.addFsrsCard` (line 25–29) destructures `{ wordId, card, source }` from the payload. The three callers above pass `{ wordId, state, difficulty, stability, last_review, due, reps, lapses, source }` (flat FSRS fields, no `card` wrapper). The reducer therefore writes `state.fsrsCards[wordId] = { card: undefined, log: null, source: ... }`. Subsequent `selectDueCardCount`, `selectWordsAtRisk`, `selectLeechCount`, etc. all read `data.card` and find `undefined`. The auto-taught words from battle rewards, zone intros, and poetry battles will never be scheduled, never appear in review queues, and never count toward FSRS metrics.
**Why it matters:** Players who fight battles, complete zone intros, or win poetry battles silently lose all their unlocked vocabulary from the spaced repetition system. The cards exist but are functionally inert.
**Suggested fix:** Wrap the FSRS fields in a `card:` property, or use the shared `createDefaultCard()` helper that `factionMiddleware.js:71-82` already defines correctly.

### CRITICAL Daily-quest bonus XP is grindable via page refresh — module state, not persisted
**File:** `src/store/middleware/dailyQuestMiddleware.js:51-61, 66-74` and `src/store/slices/dailyQuestSlice.js`
**Category:** bug / save-corruption-light (currency/XP exploit)
**Issue:** `store.js:323` comments `dailyQuestReducer  // transient — not persisted (middleware re-generates on date change)` — confirmed not in whitelist. The slice's `bonusAwarded` field, the `quests` array, and `date` all reset on every page reload. `ensureDailyQuests` regenerates today's quests (deterministic from level + date — same quests each time), and `bonusAwarded` defaults to `false`. A player can complete 3 daily quests, claim `DAILY_QUEST_BONUS_XP` (150 XP), reload, complete the same 3 quests again, claim again — indefinitely.
**Why it matters:** Trivial XP exploit. Also breaks the documented "history" tracking — the `history: []` field with `MAX_HISTORY = 7` (slice line 11) is never populated because the date check in `loadDailyQuests` only runs after the prior date was set, which never persists.
**Suggested fix:** Add `'dailyQuest'` to the root persist whitelist in `store.js:220-267`. Verify daily generation respects the persisted `date` field (it already does in `ensureDailyQuests`).

### CRITICAL `quizDailyGoalsMiddleware` claim reward exploit + same-minute dedup drops legit completions
**File:** `src/store/middleware/quizDailyGoalsMiddleware.js:29-34, 94-105`
**Category:** bug (exploit + lost data)
**Issue:** `_daily` is a module-level singleton. On every page load `_daily.rewardDispatched = false` and `_daily.reviewsCompleted = 0`. A player can complete 3 quizzes, claim the daily-goals reward, reload, complete 3 more, claim again. Separately, the 1-minute `lastQuizMinute` dedup (line 56) drops a second legitimate quiz completion within the same UTC minute — a fast user finishing a 30-second quiz immediately after a 20-second quiz will silently lose progress.
**Why it matters:** Same grinding exploit as daily quests, plus loss of legitimate progress for fast players.
**Suggested fix:** Move counters into the `dailyGoals` slice (already persisted) and key on `goalDate`. Remove the 1-minute dedup or replace with a per-quiz-ID dedup that doesn't lose distinct sessions.

### CRITICAL Relationship-decay middleware uses module-level `_lastDecayDate` — runs on every app session, not every day
**File:** `src/store/middleware/relationshipDecayMiddleware.js:31, 53-59, 79`
**Category:** bug / save-corruption
**Issue:** `_lastDecayDate` is `null` on every page load. Line 55: `const daysSince = _lastDecayDate ? daysBetween(_lastDecayDate, todayKey) : 1`. After a reload the value is null, so `daysSince = 1` — meaning the middleware applies a full day of friendship decay every time the user opens the app, even if they refreshed five minutes ago. Over a heavy-use day with five reloads, NPCs lose five days of friendship.
**Why it matters:** Persistent NPC friendship value is silently decayed multiple times per real day, breaking faction tier crossings, relationship achievements, and gift preferences.
**Suggested fix:** Persist `lastDecayDate` inside the `npc` slice (or `time` slice) and read it from Redux state instead of module scope. `_resetDecayState` is already exported.

### CRITICAL `learningProgressMiddleware` emits CEFR milestone events with no flag-set — fires every dispatch forever
**File:** `src/store/middleware/learningProgressMiddleware.js:63-77`
**Category:** bug
**Issue:** The comment claims "Emit milestone event once per CEFR level — guarded by worldState flag". The code reads `flags[milestoneKey]` and only emits if absent, but it **never dispatches `setFlag` to mark the milestone shown**. Therefore every subsequent `cefrProgress/setCefrLevel` for the same level re-emits the EventBus event — and `cefrProgressMiddleware` re-checks/dispatches CEFR level after almost every vocabulary review.
**Why it matters:** The "Guide Amira CEFR milestone" cinematic / dialogue can fire dozens of times per session if the player stays at the same CEFR level. UI flicker, audio spam, possible analytics double-count.
**Suggested fix:** After `EventBus.emit`, dispatch `setFlag({ key: milestoneKey, value: true })`.

### CRITICAL `leechDetectionMiddleware` halves a leech card's interval on every review — interval collapses geometrically
**File:** `src/store/middleware/leechDetectionMiddleware.js:33-49`
**Category:** bug
**Issue:** Every time a leech card (`lapses >= 5`) is reviewed, the middleware re-dispatches `updateFsrsCard` with `applyLeechIntervalPenalty(card)` (which halves `scheduled_days`). The penalty is applied on every review of an already-leeched card — there is no idempotency check. After 10 reviews, the interval is the original divided by 1024.
**Why it matters:** Once a card becomes a leech, the player is locked into reviewing it every session indefinitely, even after they start answering correctly.
**Suggested fix:** Track `lastLeechPenaltyApplied` on the card (or a `leechPenalized: true` flag) and skip the penalty if already applied this lapse-count tier. Alternatively, apply the penalty only on the lapse-count *transition* (lapses crossed from 4 → 5).

### CRITICAL Reentrant REHYDRATE race: login reward grants "first ever" bonus to returning players
**File:** `src/store/middleware/loginRewardMiddleware.js:29-55`
**Category:** bug / save-corruption (currency/XP)
**Issue:** Nine nested `persistReducer` configs + one root config means redux-persist fires *ten* separate `persist/REHYDRATE` actions on app start. The vocabulary/battle/magic/etc. nested rehydrate actions fire **before** the root rehydrate. When the first nested REHYDRATE fires, `state.player?.lastLoginDate` is still the initial-state default `null` (root hasn't rehydrated yet). Line 39 hits the "First ever login" branch and dispatches `processLoginReward` with day-1 reward. Then the root REHYDRATE arrives, `lastLoginDate` is now the today value just dispatched, so subsequent REHYDRATEs short-circuit. Returning players are silently treated as first-time logins on every cold start.
**Why it matters:** Free XP/dirhams/items every cold start. Streaks reset constantly because the "first ever" path doesn't increment `loginStreak`.
**Suggested fix:** Gate on `action.key === 'gogo-arabic'` (the root persist key) so the middleware only runs for the root rehydrate, not every nested one.

### HIGH `selectCompanionBattleState` and `selectComboMeter` return fresh object literals on every call — breaks memoization
**File:** `src/store/slices/battleSlice.js:536-543, 577-580`
**Category:** redux (selector misuse)
**Issue:** Both selectors are plain functions that build a new object literal every call. Components using `useSelector(selectCompanionBattleState)` re-render on *every* action, not just battle state changes, because referential equality fails.
**Why it matters:** During a battle every action (`incrementTurn`, `dealDamage`, `tickStatusEffects`, even unrelated `ui/...`) causes companion HUD and combo meter components to re-render. Manifests as input lag during fast combat.
**Suggested fix:** Wrap in `createSelector`.

### HIGH `friendshipMiddleware` listens for action types that no slice produces
**File:** `src/store/middleware/friendshipMiddleware.js:17, 27-32, 37-42`
**Category:** bug / dead-code
**Issue:**
- Line 17: `quiz/recordAnswer` — no quiz slice exists; comment admits this.
- Line 27-32: `quests/completeQuest` destructures `{ questId, npcId }` from `action.payload`, but `questSlice.completeQuest` dispatches `action.payload = questId` (a string).
- Line 37: `npc/giveGift` — the npcSlice exports `giveNpcGift` (action type `npc/giveNpcGift`). Wrong action type.
**Why it matters:** Friendship deltas for correct quiz answers, completed quests, and gifts never apply via this middleware.
**Suggested fix:** Rewrite to listen for `npc/giveNpcGift` and to read `npcId` from a quest-definition lookup. Remove dead `quiz/recordAnswer` branch.

### HIGH `utilityBonusMiddleware` listens for non-existent action types and corrupts payloads when it does fire
**File:** `src/store/middleware/utilityBonusMiddleware.js:7-21, 24-33`
**Category:** bug / dead-code
**Issue:**
- Line 7: `player/addXp` (lowercase p) — actual action is `player/addXP` (uppercase XP). Dead.
- Line 9: `action.payload?.xp` — `addXP` payload is a number, not `{xp}`. The check always fails.
- Line 14-18 (if ever taken): dispatches `{ type: 'player/addXp', payload: { xp: knowledgeBonus, ... } }` which the actual `player/addXP` reducer would treat as `state.xp += { xp: 1, source: ... }` → `NaN`. **Save corruption** the moment this is ever wired correctly.
- Line 27-31: For the friendship bonus branch, `payload: { ...action.payload, delta: hospitalityBonus }` *overwrites* the original delta with the small bonus instead of adding to it.
**Why it matters:** Currently inert, but flagging because any future fix to the action-type typo will instantly corrupt player XP.
**Suggested fix:** Fix action types to `player/addXP`, `vocabulary/updateFsrsCard`. Read payload as a number for addXP. For hospitality, add `delta: action.payload.delta + hospitalityBonus`.

### HIGH `loreMiddleware` cases on wrong action types — multiple dead branches
**File:** `src/store/middleware/loreMiddleware.js:99-103, 106-114`
**Category:** dead-code / bug
**Issue:**
- Line 99: case `'player/addXp'` (lowercase p) — never matches actual `player/addXP`. Level-reach lore entries never unlock.
- Line 106: case `'battle/recordVictory'` — no such action in battleSlice (battles end via `battle/endBattle`). Battle-win lore entries never unlock.
**Suggested fix:** Change to `'player/addXP'` and `'battle/endBattle'` (and read `victory` from payload for the latter).

### HIGH Four middlewares exist with full test coverage but are never registered in the store
**File:** `src/store/store.js:346` (the `.concat(...)` chain)
**Category:** dead-code
**Issue:** The following middlewares are exported, tested, but absent from the `.concat(...)` chain in `configureStore`:
- `companionXpMiddleware` — companion battle XP never awarded.
- `progressSnapshotMiddleware`
- `skillTreeXpMiddleware` — overlaps with `learningProgressMiddleware`.
- `vocabRateMiddleware`
**Suggested fix:** Either wire them up (and write integration tests against the real store) or delete them along with their test files.

### HIGH `inventorySlice` mutating operations bypass the `MAX_INVENTORY_SIZE` cap
**File:** `src/store/slices/inventorySlice.js:73-118, 120-146, 247-263`
**Category:** bug
**Issue:** `equipItem` (line 103, when unequipping the previous slot occupant) pushes to `state.items` without checking cap. `unequipItem` (line 141) same. `buyBackItem` (line 258) same. Only `addItem` (line 47) enforces the 200 cap.
**Why it matters:** The 200-cap is bypassable. State can grow unbounded, eventually choking IndexedDB.
**Suggested fix:** Extract a private `_pushItemRespectingCap(state, item)` helper used by all four mutating reducers.

### HIGH `inventorySlice.buyBackItem` accepts a negative or out-of-bounds `index` silently
**File:** `src/store/slices/inventorySlice.js:247-263`
**Category:** bug
**Issue:** `state.buyBackHistory.splice(index, 1)` interprets a negative index as offset-from-end. If `index` is negative, `splice(-1, 1)` deletes the *last* element, possibly a different entry.
**Suggested fix:** Add `if (!Number.isInteger(index) || index < 0 || index >= state.buyBackHistory.length) return;` at the top.

### HIGH `poetryRewardsMiddleware` and the PoetryBattleOverlay both dispatch `addXP(50)` on win — XP is doubled
**File:** `src/store/middleware/poetryRewardsMiddleware.js:48-49`
**Category:** bug
**Issue:** The comment claims double-dispatch is "idempotent-safe because the overlay runs first and the middleware is a safety net." That is true for `addFsrsCard` (guarded by `!fsrsCards[wordId]`) but **false for `addXP`** — every call adds the amount unconditionally. The player receives 100 XP per poetry-battle win, not the documented 50.
**Suggested fix:** Either remove the dispatch from `PoetryBattleOverlay.jsx` (single source of truth in middleware) or remove it from this middleware.

### HIGH `questChainMiddleware` re-grants chain reward XP every time *any* chain quest completes after the first
**File:** `src/store/middleware/questChainMiddleware.js:32-41`
**Category:** bug
**Issue:** `isChainComplete(chain.chainId, state.quests)` returns true once every quest in the chain is `status: 'completed'`. The middleware grants `reward.xp` without tracking whether the reward was already paid.
**Suggested fix:** Track granted chain IDs in a new slice field (e.g., `state.quests.chainRewardsClaimed: []`) and check it before dispatch.

### HIGH `economyMiddleware.applyDailyDecay` loses information when more than one day elapses
**File:** `src/store/middleware/economyMiddleware.js:75-78` (and `slices/economySlice.js:137-144`)
**Category:** bug
**Issue:** The dispatch is `applyDailyDecay({ dayKey })` — singular. The reducer subtracts a fixed `0.1` regardless of days elapsed. If a player skips 30 days, the multipliers decay by 0.1 (one day's worth), not 3.0.
**Suggested fix:** Pass `days` to `applyDailyDecay` and have the reducer compound the decay. Or delete `applyDailyDecay` and rely solely on `economyDecayMiddleware`'s `bulkApplyEconomyDecay`.

### HIGH `selectInventory` collision: playerSlice exports legacy `selectInventory(state) => state.player.inventory` alongside inventorySlice's selectors
**File:** `src/store/slices/playerSlice.js:444` vs. `src/store/slices/inventorySlice.js:348`
**Category:** complexity / bug-risk
**Issue:** `playerSlice` still maintains `state.player.inventory` (an `[{itemId, equipped}]` array) and exposes `selectInventory`. The new system is `state.inventory.items`. Components that import the wrong one get stale data.
**Suggested fix:** Pick one source of truth. If `inventory` slice is canonical, deprecate `playerSlice.inventory` field + actions and add a migration that moves items.

### HIGH `processLoginReward` adds reward item, `resetLoginStreak` does not — inconsistent reward grant on streak reset
**File:** `src/store/slices/playerSlice.js:329-354`
**Category:** bug
**Issue:** Both reducers receive `{ todayUTC, reward }`. `processLoginReward` (line 339-342) adds `reward.item` to inventory if present. `resetLoginStreak` (line 345-354) ignores `reward.item` entirely.
**Suggested fix:** Mirror the item-grant logic from `processLoginReward` into `resetLoginStreak`.

### HIGH Multiple middlewares throw on non-string `action.type` (functions, symbols)
**Files:**
- `src/store/middleware/worldStateMiddleware.js:24`
- `src/store/middleware/divergentExperienceMiddleware.js:45`
- `src/store/middleware/questTimerMiddleware.js:59`
**Category:** bug
**Issue:** Plain `.startsWith` on `action.type` throws `TypeError` if `action.type` is undefined.
**Suggested fix:** Use `typeof action.type === 'string' && action.type.startsWith(...)` consistently.

### HIGH `analyticsMiddleware` strips achievement IDs from analytics events
**File:** `src/store/middleware/analyticsMiddleware.js:55-60`
**Category:** bug / analytics-data-loss
**Issue:** `unlockAchievement(achievementId)` dispatches with `action.payload = achievementId` (a string). The analytics builder does `action.payload?.id ?? action.payload?.achievementId ?? null` — both undefined, so the field falls through to `null`. Every `achievement_unlocked` event sent to `/api/analytics` has `achievementId: null`.
**Suggested fix:** `achievementId: typeof action.payload === 'string' ? action.payload : (action.payload?.id ?? action.payload?.achievementId ?? null)`.

### MEDIUM Many selectors return fresh `{}` / `[]` fallbacks, breaking referential equality
**Files (representative sample):**
- `playerSlice.js:497-501` (`selectCurrency`, `selectTotalFils`)
- `vocabularySlice.js:276` (`selectSuspendedCards`)
- `analyticsEventQueueSlice.js:81` (`selectEventQueue`)
- `dailyQuestSlice.js:88-91`
- `economySlice.js:215, 219, 222, 227, 234, 243` (factory selectors that return a fresh function each call AND a fresh fallback)
**Category:** redux (selector misuse)
**Suggested fix:** Cache `{}`/`[]` as module-level constants. For economy factory selectors, memoize the factory output with a per-key cache.

### MEDIUM Reducer side effects (`Date.now()`, `new Date()`, `Math.random()`) are pervasive
**Files (representative):**
- `playerSlice.js:169-179, 252`
- `vocabularySlice.js:66-77`
- `questSlice.js:91-107, 161-169, 240-249`
- `economySlice.js:26, 40`
- `battleSlice.js:124, 237, 340, 352, 445`
- `inventorySlice.js:233`
- `achievementSlice.js:29, 47, 50`
- `analyticsEventQueueSlice.js:27-29, 44-46, 57`
- `notificationSlice.js:60, 94`
**Category:** redux (anti-pattern), determinism
**Suggested fix:** Compute timestamps at the dispatch site. For randomness, generate IDs at dispatch.

### MEDIUM `selectVocabMasteryByZone` returns two different shapes
**File:** `src/store/slices/vocabularySlice.js:141-153`
**Category:** bug (API inconsistency)
**Issue:** Empty-zone branch returns `{ known: 0, total: 0, percentage: 0 }`; non-empty branch returns `{ known: N, categories: [...] }` (no `total`, no `percentage`).
**Suggested fix:** Always return the same shape.

### MEDIUM `relationshipMiddleware` dispatches actions that no reducer listens for
**File:** `src/store/middleware/relationshipMiddleware.js:26-46, 77-96`
**Category:** dead-code
**Issue:** `relationship/tierReached`, `relationship/preferencesRevealed`, `relationship/specialQuestUnlocked` are dispatched but no slice handles them.
**Suggested fix:** Either create a slice to consume them or switch to `EventBus.emit`.

### MEDIUM Schema drift between migration 11 and migration 12 grammar lesson tables
**File:** `src/services/storage/migrations.js:297-308, 374-386`
**Category:** migration-risk
**Issue:** Migration 11's `LESSON_SLUGS` array has 41 entries; migration 12's `ORDERED_LESSON_IDS` has 43 entries. A player whose numeric lesson IDs survived migration 11 with the *old* mapping table may find that index 7 maps to `numbers-1-10` in their state but `colors-and-shapes` in the unlock-graph used by migration 12.
**Suggested fix:** Define `ORDERED_LESSON_IDS` once in `data/grammar.js`, import it into both migrations. Add a test that asserts indices match.

### MEDIUM `zoneEntryReviewMiddleware` cooldown is set inside an async `.then()` — race condition on rapid zone switches
**File:** `src/store/middleware/zoneEntryReviewMiddleware.js:120-152`
**Category:** bug (race)
**Issue:** `_zoneCooldowns[zoneId] = now;` runs inside `loadVocabByZone().then(...)`. A second `world/enterZone` can sneak through with the same zone and re-trigger the review.
**Suggested fix:** Set the cooldown synchronously *before* the async load. Persist cooldowns in Redux state.

### MEDIUM `zoneReviewMiddleware` and `zoneEntryReviewMiddleware` overlap
**Files:** `src/store/middleware/zoneReviewMiddleware.js`, `src/store/middleware/zoneEntryReviewMiddleware.js`
**Category:** complexity / dead-code-risk
**Issue:** Two different middlewares fire micro-review prompts: one on `player/setCurrentZone`, one on `world/enterZone`. Different cooldowns, different thresholds, different selection logic.
**Suggested fix:** Pick the canonical trigger and delete the other. The urgency-sorted version is more sophisticated.

### MEDIUM `foundationMiddleware` and `alphabetGateMiddleware` silently drop `world/enterZone`
**Files:** `src/store/middleware/foundationMiddleware.js:18-28`, `src/store/middleware/alphabetGateMiddleware.js:17-38`
**Category:** redux (anti-pattern)
**Issue:** Returning `undefined` means downstream middlewares and the store never see the action. Any caller using `await store.dispatch(...)` for a thunk gets `undefined` and cannot tell whether the action was blocked.
**Suggested fix:** Either return a sentinel rejected action (e.g., `{ type: 'world/enterZone/blocked', reason: 'foundation' }`) or use a thunk wrapper.

### LOW Inventory `equipItem` lacks a check for already-equipped same-slot item
**File:** `src/store/slices/inventorySlice.js:73-118`
**Category:** complexity
**Suggested fix:** Early return if `state.equipped[slot] === itemId`.

### LOW `gossipMiddleware` token IDs collide on same-millisecond dispatches
**File:** `src/store/middleware/gossipMiddleware.js:87-88`
**Suggested fix:** Append a per-call counter or `Math.random().toString(36)` suffix.

### LOW `storageQuotaMiddleware` "once per session" flag is module-level — leaks across Jest tests
**File:** `src/store/middleware/storageQuotaMiddleware.js:24`
**Suggested fix:** Export a `_resetQuotaCheck()` helper for tests.

### LOW `antiFrustrationMiddleware` references `EVENTS.TEACHING_MOMENT_TRIGGER` which is not exported
**File:** `src/store/middleware/antiFrustrationMiddleware.js:60, 80`
**Suggested fix:** Add the constant to `eventBusTypes.js`.

### LOW `magicSlice.recordRootUse` floors at 5 XP regardless of accuracy
**File:** `src/store/slices/magicSlice.js:50-81`
**Suggested fix:** Either remove the `else` floor or document that all FSRS contributions are flat-5 XP.

### LOW `offlineFsrsMiddleware` swallows enqueue and sync errors in production
**File:** `src/store/middleware/offlineFsrsMiddleware.js:21-23, 47-49`
**Suggested fix:** Send a Sentry/PostHog event on sync failure. Add a queue size cap with FIFO eviction.

### LOW `dailyGoalsMiddleware` would crash if `goalsBefore[goalType]` is undefined
**File:** `src/store/middleware/dailyGoalsMiddleware.js:76-80`
**Suggested fix:** Null-guard.

### LOW `worldTimeMiddleware` matches `'@@redux/INIT'` literally — Redux 5.x uses a suffix
**File:** `src/store/middleware/worldTimeMiddleware.js:97`
**Suggested fix:** `action.type.startsWith('@@redux/INIT')` with the `typeof` guard.

## Patterns / Systemic Concerns

1. **Module-level singleton state as a "once-per-day" guard is the single biggest source of bugs**: `_lastTriggerTime`, `_zoneCooldowns`, `_lastDecayDate`, `_daily.rewardDispatched`, `_isProcessing*` flags. Almost every "once per X" guard implemented this way breaks on page reload. Recommend a rule: **any state used for de-dup or cooldown must live in Redux**, not a module variable.

2. **`addFsrsCard` payload contract is unenforced and silently dropped**. Three different callers pass the wrong shape; the slice happily accepts it because immer doesn't complain about extra fields and destructuring `card` returns undefined.

3. **Selector fallback objects (`?? {}` / `?? []`) are an epidemic** across slices. Every one is a re-render hazard pre-rehydration.

4. **Reducers contain side effects everywhere** (`Date.now`, `new Date`, `Math.random`). Inconsistent enforcement — some compute timestamps at dispatch (good), others in the reducer (bad).

5. **Action type drift between slice and consumer** is unguarded. Multiple middlewares listen for action types that no slice produces. Suggest exporting action type *constants* from each slice and importing them in middlewares.

6. **REHYDRATE fires 10 times on startup** (one root + nine nested). Several middlewares don't account for this. Recommend a helper that unwraps the persist key.

7. **The "select X with a factory" pattern is broken**: each call returns a new function, defeating memoization. Adopt parameterized `createSelector` instances cached by key.

8. **Test coverage is shape-only for the hybrid persistence layer**. Recommend adding an integration test that round-trips a v10 root persist payload through the real `persistReducer`.

9. **Dead actions, dead types, dead branches everywhere**. Suggest a build-time check: enumerate all `action.type` constants imported in middleware, intersect with the set of action types created by `createSlice` action creators, fail CI on mismatches.

## Out of scope but flagged

- `src/services/storage/indexedDBAdapter.js:50-54` — `dbInstance.onclose` and `onversionchange` invalidate the cache, but `getDB()` doesn't retry on a stale `dbInstance`. Could cause `InvalidStateError` on subsequent calls.
- Numerous selectors in `vocabularySlice` import `vocabularyAll` data at module scope and feed it into `createSelector`. Means the entire vocabulary dataset is in the selector's closure — worth noting if you start tree-shaking.
- `state.player.inventory` (legacy array) coexisting with `state.inventory.items` (current) is a major duplication.
- `createDefaultCard()` helper is duplicated across `factionMiddleware`, `statusEffectVocabMiddleware`, and `rootFsrsSyncMiddleware`. Extract to `services/fsrs.js`.
