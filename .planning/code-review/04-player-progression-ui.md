# Code Review: Player & Progression UI
Reviewed: 2026-05-11
Files in scope: 154 (.jsx components + tests across 34 directories)

## Summary
- **CRITICAL ShopOverlay regression** — `shopId` is read inside `useMemo` deps and bodies (lines 47, 50–69) *before* its `const` declaration on line 72. In JS strict module scope this throws `ReferenceError: Cannot access 'shopId' before initialization` the first time a shop is opened. The whole buy tab is dead.
- **CRITICAL BattleOverlay event-loop foot-gun** — `EVENTS.BATTLE_TARGET_SELECT` is both subscribed to (line 215) *and* emitted (line 281) inside the same component. When a player picks a target, the listener re-fires and re-opens the target selector immediately — multi-enemy attacks effectively can't be resolved from React.
- **HIGH economy/double-claim risk across the board** — `QuestLog.handleClaim`, `DailyChallengeOverlay.handleClaimReward`, and `ShopOverlay.handleHaggleSuccess` all dispatch reward + state-mark in separate dispatches with no idempotency guard. Double-click / rapid-spam can credit XP, dirhams, or items twice before Redux re-renders.
- **HIGH save UX hole** — `SaveLoadMenu` has no overwrite confirmation. Selecting a populated slot in save mode just relabels the button "Overwrite" — one click and the save is gone with no prompt. Compare with the delete flow which *does* use a confirm dialog.
- **MEDIUM perf — broken `createSelector` factories** — `selectNodeAvailability(treeId)`, `selectTreeProgress(treeId)` and similar are *factory* selectors that return a *new* `createSelector` instance on every render → memo cache is per-call, so they always recompute and return a new object reference. Used in `SkillTreeView` and downstream; causes full re-renders of the skill tree on every dispatch.
- **MEDIUM dead-code drift** — Two `PauseMenu.jsx` files, parallel `MiniGameHub.jsx` + `MiniGamesHub.jsx`, parallel `WordSearch.jsx` + `WordSearchGame.jsx`. Tests still exist for the dead variants, giving a false sense of coverage.

## Findings

### CRITICAL ShopOverlay uses `shopId` before declaration
**File:** src/components/Shop/ShopOverlay.jsx:47, 50-69, 72
**Category:** bug
**Issue:** `const shopId = …` is declared on line 72, but lines 47 (`getShopZoneInfo(shopId)`), 50–69 (`shopInventory` useMemo body and its deps array referring to `shopId`) read `shopId` first. Because `const`/`let` bindings are in their temporal-dead-zone until the declaration line, the first call into the component body throws `ReferenceError`. The earlier-declared `dialogueConfig` is what they probably meant to read from. Buy tab cannot render at all.
**Why it matters:** Hard crash on opening any shop — the entire shop subsystem is broken from React side. Achievements wired to shop purchases (`recordShopPurchase`) never fire.
**Suggested fix:** Move `const shopId = dialogueConfig?.shopId || 'oasis_village_shop'` to the top of the component body, immediately after the `useSelector` calls. Also `shopName` / `shopGreeting`.

### CRITICAL BattleOverlay subscribes and emits the same event
**File:** src/components/Battle/BattleOverlay.jsx:215, 281
**Category:** bug
**Issue:** `EventBus.on(EVENTS.BATTLE_TARGET_SELECT, onTargetSelect)` (line 215) listens for the BattleStateMachine asking React to show the target picker. `EventBus.emit(EVENTS.BATTLE_TARGET_SELECT, { targetIndex })` (line 281) uses the *same* event to send the player's choice back. The overlay's own emit re-enters its listener → `setShowTargetSelector(true)` + `setTargetSelectorData(data)` with the click payload, immediately re-opening the picker the player just dismissed.
**Why it matters:** Multi-target battles get stuck in a UI loop. Even single-target flows risk extra state churn because the picker re-opens before the BattleStateMachine has moved on.
**Suggested fix:** Use two distinct events, e.g. `BATTLE_TARGET_PROMPT` (state machine → React) and `BATTLE_TARGET_CHOSEN` (React → state machine). Update `BattleStateMachine.js:1387` to match.

### CRITICAL SaveLoadMenu overwrites populated slots with no confirmation
**File:** src/components/SaveLoad/SaveLoadMenu.jsx:189-195, 77-90
**Category:** save-load
**Issue:** When `mode === 'save'` and the selected slot is non-empty, the primary button just reads "Overwrite" and clicking it goes straight to `handleSave(slot.slot)` → `saveToSlot()`. The previous save data is replaced without any confirm dialog (compare delete flow lines 222–240 which *does* show a confirmation). A misclick destroys hours of progress.
**Why it matters:** Permanent data loss with one mouse click. This is what the user flagged as a top concern in the prompt.
**Suggested fix:** Add an `confirmOverwrite` state mirroring `confirmDelete`. When `!slot.empty` and user clicks "Overwrite", set `confirmOverwrite = slotNumber` and render the same confirm dialog pattern, only actually call `saveToSlot` once confirmed.

### CRITICAL QuestLog reward double-claim race
**File:** src/components/Quest/QuestLog.jsx:39-50
**Category:** economy-exploit
**Issue:** `handleClaim` dispatches `addXP` + `addDirhams` + notification first, then `claimReward(questId)`. Until the reducer marks `rewardClaimed: true` and React re-renders, the "Claim Reward" button is still visible (line 168 condition `status === 'completed' && !rewardClaimed`). A user double-clicking — or any auto-clicker — can fire reward dispatches multiple times before the disable kicks in. Same surface in `handleClaim` does not check `rewardClaimed` itself.
**Why it matters:** Exploitable currency / XP duplication.
**Suggested fix:** Either (a) make `claimReward` reducer idempotent — only return rewards inside the reducer (move the XP/dirham math into a thunk that reads current `rewardClaimed` flag), or (b) add a guard at the top of `handleClaim`: `if (quests[questId]?.rewardClaimed) return;`. Better still, disable the button optimistically with a local state ref.

### CRITICAL DailyChallenge streak reward claim has no idempotency
**File:** src/components/DailyChallenge/DailyChallengeOverlay.jsx:116-121, 845-857
**Category:** economy-exploit
**Issue:** `handleClaimReward(days)` just dispatches `claimStreakReward({ days })` without any local lock or button-disabled state. The unclaimed-rewards list is rendered from `selectUnclaimedStreakRewards`, but multiple clicks in the same animation frame all fire before the next React commit removes the button. Same shape as the quest reward bug.
**Why it matters:** Streak XP bonuses can be claimed multiple times per tier.
**Suggested fix:** Track a `claimingDays` Set in local state. Add the day to it before dispatch, ignore subsequent clicks while it's there. Or disable the button immediately and rely on the slice to verify the reward hasn't been claimed.

### CRITICAL ShopOverlay haggle skips inventory-full check after redundant deduction
**File:** src/components/Shop/ShopOverlay.jsx:180-270
**Category:** economy-exploit
**Issue:** `handleHaggleSuccess` runs `recordHaggle` + `EVENTS.SHOP_HAGGLE_RESULT` + `setHagglingItem(null)` *before* the `if (player.dirhams < finalPrice)` and `if (inventoryFull)` checks (lines 198–209). If the player can't afford the haggled price or has a full inventory, the haggle is recorded as a *success* in achievements/analytics, dispatches `recordHaggle({ success: true })`, but the actual purchase is silently aborted. Also `EventBus.emit(EVENTS.SHOP_HAGGLE_RESULT, …, success: true)` fires regardless. Achievement progress, daily-goal counters, and economy analytics all desync.
**Why it matters:** Achievements awarded for "successful haggles" that didn't transfer a single item. State drift between economy slice and inventory.
**Suggested fix:** Validate dirhams/inventoryFull *first*, then dispatch `recordHaggle`, emit events, and apply the purchase. If validation fails, show toast and bail before any economy bookkeeping.

### HIGH GameLayout welcome-back effect has lint suppression that hides the lifecycle bug
**File:** src/components/Router/GameLayout.jsx:174-183
**Category:** bug
**Issue:** The Welcome Back effect runs once on mount with `// eslint-disable-line react-hooks/exhaustive-deps`. It reads `welcomeBackShown` and `lastPlayedDate` from Redux on mount, but if these change after mount (e.g. Redux rehydrates persisted state asynchronously, common with redux-persist), the overlay will never show even though it should. Conversely if the player completes the overlay flow in another component the local `showWelcomeBack` state desyncs.
**Why it matters:** Returning-player UX is the whole point of this feature — silent failure on rehydration race.
**Suggested fix:** Either include the deps and add a `seenRef` to fire-once, or move the trigger into a small thunk that runs after rehydrate completes and dispatches `markWelcomeBackShown` itself.

### HIGH CharacterPreview canvas leak / stale render
**File:** src/components/Character/CharacterCreation.jsx:39-92
**Category:** bug
**Issue:** Two `new Image()` loads (body + head) inside the `useEffect`. The `onload` callbacks capture the *initial* `outfit/headCovering/skinTone` closure, but if the user changes a selector before both images finish loading, the effect re-runs with new props yet the in-flight `onload` from the previous render still fires and draws to the same canvas — overwriting the new render with stale pixels. No abort flag, no `bodyImg.onload = null` cleanup.
**Why it matters:** Quick clicks during character creation paint a Frankenstein character of the previous outfit + current head, etc.
**Suggested fix:** Add a `let cancelled = false` flag; check `if (cancelled) return;` inside both `onload` callbacks; set `cancelled = true` in the cleanup function returned from the effect.

### HIGH CinematicIntro double-advances tutorial phase on skip
**File:** src/components/Onboarding/CinematicIntro.jsx:39-49
**Category:** bug
**Issue:** `handleSkip` dispatches `setTutorialPhase('path_choice')` immediately. But the running `useEffect` chain (line 30–37) is still ticking — once `visibleLines >= CRAWL_LINES.length` the fadeOut effect (line 39–45) fires another `setTutorialPhase('path_choice')`. If the player skips mid-crawl, the dispatch happens twice (and could clobber a state update made between dispatches by other reducers responding to `setTutorialPhase`).
**Why it matters:** State desync risk in the most sensitive part of onboarding. Worse: clicking Skip then having the auto-finish also dispatch can collide with PathChoice's own `setTutorialPhase('awaiting_mentor')` mid-flight.
**Suggested fix:** Add a `doneRef = useRef(false)` and gate both branches on `if (doneRef.current) return; doneRef.current = true;`.

### HIGH BattleArabicInput timer effect doesn't reset on prompt change
**File:** src/components/Battle/BattleArabicInput.jsx:101-117
**Category:** bug
**Issue:** The countdown `useEffect` depends on `prompt` and `handleSubmit`. `handleSubmit` is recreated every render (it depends on `input` which changes on each keystroke), so the timer interval is torn down and recreated on every keystroke. Each cycle resets the `setTimeRemaining` callback closure but the timing is still mostly OK — the real bug is the *jitter*: a tear-down + restart on every keystroke is sloppy. Worse, `submittedRef.current = false` reset (line 72) only happens when `prompt` changes; if the same prompt reference fires twice for any reason the second emit silently no-ops.
**Why it matters:** Sloppy timer behaviour during typing; potential missed timeouts if the keystroke rate is high enough to keep restarting the interval.
**Suggested fix:** Split `handleSubmit` into a stable callback that reads `input` from a ref; or use `useRef` for the elapsed timer rather than restarting `setInterval`. Add `key={promptId}` to force a remount when prompts change.

### HIGH PlayerProfile crashes on missing currentZone
**File:** src/components/Profile/PlayerProfile.jsx:172
**Category:** bug
**Issue:** `{player.currentZone.replace(/_/g, ' ')}` — no null-guard. If `currentZone` is `null` or `undefined` (which it is for a freshly created character before any zone is entered, or after a save migration), `.replace` throws TypeError and the entire profile screen unmounts behind the nearest error boundary.
**Why it matters:** Profile is reachable from PauseMenu → "/stats" before the player has loaded a zone. Crash with no recovery besides return-to-menu.
**Suggested fix:** `{(player.currentZone || 'unknown').replace(/_/g, ' ')}` or move the formatting into a small helper.

### HIGH QuestLog renders crash when reward is missing
**File:** src/components/Quest/QuestLog.jsx:155-157
**Category:** bug
**Issue:** Line 39–41 guards `qd?.reward` before dispatching, but the render path on line 156 uses `qd.reward.xp` / `qd.reward.dirhams` unconditionally. If any future quest definition is missing a reward field (or a quest data migration removes it), the entire quest log crashes.
**Why it matters:** Data-driven content can break the UI globally. Other places in this file (line 89 `qd.target`) have the same blind-access pattern.
**Suggested fix:** Wrap the reward row in `{qd.reward && (…)}` or compute defaults at the top of `renderQuest`.

### HIGH GiftOverlay missing null-guards on npcPreferences
**File:** src/components/NPC/GiftOverlay.jsx:79-83
**Category:** bug
**Issue:** `const { npcPreferences } = gift;` then `npcPreferences.loved.includes(npcId)` with no check that `npcPreferences` or its arrays exist. If a gift definition is missing this field — or it's a string instead of an array — render throws.
**Why it matters:** Gift system is a major NPC engagement flow; a single malformed gift JSON entry crashes the whole panel.
**Suggested fix:** `if (!npcPreferences) return '❓';` and use `npcPreferences.loved?.includes(npcId)` for each tier.

### HIGH MemoryMatchGame completion useEffect double-fires recordScore
**File:** src/components/MiniGames/MemoryMatchGame.jsx:54-60
**Category:** bug
**Issue:** Effect depends on `[matchedPairs, cards, startTime, selectedSet, dispatch]`. When the last pair matches, `setCompleted(true)` *and* `dispatch(recordMemoryScore(...))` fire. But because `selectedSet` is in the deps array and React 19 may run effects more than once in StrictMode (or if you bounce between selecting a set), there is no `completed` guard inside the effect itself — only its existence stops the timer. The dispatch can fire twice if `cards` reference is re-assigned during the same render cycle.
**Why it matters:** Score-board duplicates / inflated minigame stats.
**Suggested fix:** Add explicit guard: `if (completed) return;` at the top of the effect; track via a ref so React doesn't re-fire.

### HIGH ShopOverlay sell-confirmation logic skips rare-item gate on first call
**File:** src/components/Shop/ShopOverlay.jsx:152-174
**Category:** bug
**Issue:** `handleSell` checks `if ((rarity === 'rare' || …) && !confirmSell)` — but `confirmSell` is React state and `handleSell` is wrapped in `useCallback([…, confirmSell])`. On first sell-click for a rare item, `confirmSell` is `null`, the dialog shows, user clicks "Yes, Sell" → `handleConfirmSellYes` calls `handleSell(itemId, sellPrice, itemData.rarity, itemName)` again. This time `confirmSell` is set, so the gate is bypassed and the sell proceeds. Fine *if* the player went through the dialog. **However:** if the user changes the selected sell item *while* `confirmSell` is set for a different item, the next sell click bypasses the rare-item check entirely.
**Why it matters:** Players can lose rare items by reflex-clicking when the modal is open for a different item.
**Suggested fix:** Compare `confirmSell?.itemId === itemId` rather than just `!confirmSell`. Reset `confirmSell` whenever the user changes selection.

### HIGH Wardrobe uses incompatible inventory shape
**File:** src/components/Wardrobe/Wardrobe.jsx:42-53, 87-88
**Category:** bug
**Issue:** `ownedOutfits` maps `player.inventory` items handling both `string` and `{ itemId }` shapes (line 44), but the same component dispatches `addToInventory({ itemId: outfit.id, equipped: false })` (line 88). That payload shape is wardrobe-specific and differs from `InventoryUI`'s expected `{ itemId, quantity }` (per inventorySlice). Outfits purchased here may not be visible/sellable in the main inventory and vice versa.
**Why it matters:** Two inventory shapes coexist in the same Redux slice; subtle data corruption / lost outfits on save+load.
**Suggested fix:** Normalise on the inventorySlice shape (`{ itemId, quantity, locked }`) and remove the dual-format handling. Use `addItem` from `inventorySlice`, not the legacy `addToInventory` action in `playerSlice`.

### HIGH AudioUnlockOverlay swallows Howler.ctx.resume errors
**File:** src/components/UI/AudioUnlockOverlay.jsx:29-46
**Category:** bug
**Issue:** `Howler.ctx.resume()` returns a Promise that can reject (browser denied) but the result is discarded. Same with the inline `new Howl(...)` — no error handler. If the unlock fails, the overlay closes (`setVisible(false)`) but audio remains locked and the user has no recovery path.
**Why it matters:** Stuck silent audio on mobile with no way for the user to retry.
**Suggested fix:** `await Howler.ctx.resume()`; check `Howler.ctx.state === 'running'` before hiding the overlay; otherwise show "Tap again" message.

### MEDIUM `selectNodeAvailability(treeId)` returns a fresh createSelector each call
**File:** src/store/slices/skillTreeSlice.js:188-210, src/components/Skills/SkillTreeView.jsx:29
**Category:** redux
**Issue:** `selectNodeAvailability = (treeId) => createSelector(...)`. When used as `useSelector(selectNodeAvailability(treeId))`, a new `createSelector` is created on every render. Its memoisation cache is per-instance, so each render is a cold cache → the inner function runs and produces a new object reference. Result: every Redux dispatch re-renders the whole skill tree, and the deep equality check on the inner object never short-circuits. Same anti-pattern for `selectTreeProgress(treeId)`.
**Why it matters:** Skill tree view renders on every unrelated dispatch (UI toggles, dialogue advances, etc.). Cascading re-renders.
**Suggested fix:** Memoise the factory: `const availabilityCache = new Map(); export const selectNodeAvailability = (treeId) => { if (!availabilityCache.has(treeId)) availabilityCache.set(treeId, createSelector(...)); return availabilityCache.get(treeId); };` — or move treeId into the input selector signature.

### MEDIUM HUD `completedQuestCount` selector creates new array reference
**File:** src/components/HUD/HUD.jsx:45-48
**Category:** redux
**Issue:** Inline `useSelector` body calls `Object.values(quests).filter(...).length`. The selector itself returns a number (OK), but the `quests` reference is re-read on every state change. More importantly, `useSelector((s) => s.player)` patterns elsewhere (e.g. MainMenu.jsx:19, Wardrobe.jsx:28, ShopOverlay.jsx:26, ReviewSession.jsx:48) return entire slice objects, triggering re-render on any field change.
**Why it matters:** HUD is on every gameplay frame's React render — minimising churn here matters most. MainMenu and Wardrobe matter less, but ShopOverlay's `player` selector means re-render every dirham change while shopping.
**Suggested fix:** Replace whole-slice selectors with field-scoped ones — `useSelector((s) => s.player.dirhams)`, `useSelector((s) => s.player.level)`, etc.

### MEDIUM Cinematic phase advancement uses `setTimeout` not React state-driven flow
**File:** src/components/Onboarding/CinematicIntro.jsx:30-45
**Category:** complexity
**Issue:** Three independent `useEffect` chains drive the crawl: line-advance, fade-out, dispatch-after-fade. If any timer fires after unmount (route change mid-cinematic), the dispatch on line 42 runs anyway because there's no `isMountedRef` guard. The cleanup-on-fadeOut effect *does* clear its timer, but only after fadingOut becomes true — the line-advance timer (line 35) still fires its dispatch indirectly via the next render.
**Why it matters:** Late dispatches into a navigated-away route cause "unmounted component" warnings and could trigger spurious tutorial transitions.
**Suggested fix:** Combine into one effect that holds a single timeline ref; add an `isMountedRef = useRef(true)` set to false on cleanup.

### MEDIUM DailyChallenge timer cleanup race
**File:** src/components/DailyChallenge/DailyChallengeOverlay.jsx:535-552
**Category:** bug
**Issue:** SpeedQuiz per-question timer effect depends on `[currentQ]` and runs `handleTimeout()` inside `setInterval`. `handleTimeout` is a function declared in the component body — its closure captures the *first* render's `currentQ`, `correctCount` etc. By the time it fires after question advance, the stale closure runs `advanceQuestion(false, 0)` with stale state. Lint-disable on line 552 silences the warning.
**Why it matters:** Score / accuracy may be miscalculated on timeout on later questions.
**Suggested fix:** Use refs for `currentQ`, `correctCount`, `totalScore`; OR depend on those state values and re-create the interval (the current `eslint-disable` hides this).

### MEDIUM EventBus listeners survive HMR / strict-mode double mount
**File:** src/components/Battle/BattleOverlay.jsx:91-239, src/components/HUD/HUD.jsx:54-67
**Category:** bug
**Issue:** EventBus listeners are attached in `useEffect` with cleanup. In React 19 dev mode (StrictMode), effects mount → unmount → mount again. If `EventBus.on` doesn't dedupe by handler identity, listeners can accumulate. The cleanup uses the same function reference so it *should* work, but during HMR the EventBus singleton survives module replacement while components are re-evaluated, leaking handlers.
**Why it matters:** Doubled event handlers fire double dispatches (mostly a dev annoyance, but could ship if EventBus is shared with `window`).
**Suggested fix:** Verify EventBus has idempotent `.on`. Add a dev-only counter `EventBus._listenerCount` to spot leaks.

### MEDIUM Re-render firehose: `useSelector((s) => s.player)` slice-wide reads
**File:** src/components/Menu/MainMenu.jsx:19, src/components/Wardrobe/Wardrobe.jsx:28, src/components/Shop/ShopOverlay.jsx:26, src/components/Review/ReviewSession.jsx:48, src/components/Profile/PlayerProfile.jsx:26, src/components/Menu/SettingsMenu.jsx:25, src/components/WelcomeBack/WelcomeBackOverlay.jsx:12
**Category:** redux
**Issue:** All these read the full slice. Any field change (dirhams, xp, currentZone, outfit, level) re-renders the whole component subtree. Shop interactions in particular fire `addDirhams`/`spendDirhams` on every transaction → ShopOverlay re-renders end-to-end including `ShopInventory` and its 20+ item cards.
**Why it matters:** Sluggish shop interactions, especially on mobile. Wardrobe re-renders all outfit cards every time the player gains XP.
**Suggested fix:** Scope each `useSelector` to the specific field. Where multiple fields are needed, write a memoised selector with `createSelector` that returns a stable object.

### MEDIUM Reviewer test passes stale `score` to checkPerfectQuiz
**File:** src/components/Review/ReviewSession.jsx:264-266
**Category:** bug
**Issue:** Comment acknowledges "stale closures" and reconstructs `finalScore = score + (correct ? 1 : 0)`. But the same flow also dispatches `addXP` *unconditionally* on completion (line 260) without re-validating the answer count. If the user races through and the auto-advance setTimeout fires after the navigate-away, `dispatch` after unmount is silently a no-op but the in-flight Redux update can still land. The `isMountedRef` only gates `setIndex`, not the `dispatch` calls (lines 260–266) which run *before* the ref check.
**Why it matters:** Off-by-one perfect-quiz achievement on the last question's wrong answer; also XP credited after navigation.
**Suggested fix:** Move the `isMountedRef.current` check above the `dispatch` calls, not just above the next-question setters.

### MEDIUM Many overlays self-emit PLAYER_FREEZE/UNFREEZE without coordination
**File:** src/components/HUD/HUD.jsx:101,106,116,148; src/components/Inventory/InventoryUI.jsx:57-62; src/components/Crafting/CraftingMiniGame.jsx:66-71; src/components/Wardrobe/Wardrobe.jsx:34-39; src/components/Battle/BattleOverlay.jsx:80-89; src/components/Router/GameLayout.jsx:308-327
**Category:** bug
**Issue:** Every overlay emits its own freeze/unfreeze. With multiple overlays open (e.g. Inventory open then Daily Goals over it), the inner overlay's unmount emits UNFREEZE while the outer is still open. The GameLayout safety-net (lines 316–327) tries to fix this with a 100ms `setTimeout`, but it races against the inner overlay's cleanup.
**Why it matters:** Player can move during overlay flicker; canvas focus is stolen unpredictably.
**Suggested fix:** Reference-counted freeze in EventBus (`emit('freeze')` increments, `emit('unfreeze')` decrements; only actually freezes when count > 0). Move the freeze logic into a centralized `useOverlayFreeze()` hook.

### MEDIUM `selectFriendship` / `selectGiftsGivenToNpc` factory selectors used inline
**File:** src/components/NPC/GiftOverlay.jsx:112-113, src/components/Quest/QuestJournal.jsx:83
**Category:** redux
**Issue:** `useSelector(selectFriendship(npcId))` creates a new closure each render. Less harmful than the createSelector case because the inner returns a primitive (number) — equality short-circuits — but it still allocates per render and pattern-matches the broken `selectNodeAvailability` style. `selectGiftsGivenToNpc(npcId)` likely returns an array → new reference each call → re-render every dispatch.
**Why it matters:** Background re-renders in NPC dialogue flow.
**Suggested fix:** Use parameterised reselect or accept `npcId` as a hook argument: `useFriendship(npcId)` that returns the memoised slice.

### MEDIUM Achievement panel tab list rebuilds on every render
**File:** src/components/Achievements/AchievementPanel.jsx:110-136
**Category:** complexity
**Issue:** `tabs` is wrapped in `useMemo([])` with empty deps, so it's stable. Fine. But each card render under `activeTab !== 'chains'` iterates `filteredAchievements` (up to 200+ items) and reads `achievementProgress[id]`, `unlockedAchievements[id]` — both are full-slice objects. If achievement slice gets one update (e.g. word learned increments a chain), the whole grid re-renders.
**Why it matters:** Achievement panel feels janky after every quest objective or word review.
**Suggested fix:** Memoise `AchievementCard` more aggressively with a custom `arePropsEqual`; pre-compute `(unlocked, progress)` tuples in a memoised selector keyed by achievement id.

### MEDIUM ErrorBoundary fallback loses route context
**File:** src/components/ErrorBoundary/ErrorBoundary.jsx:37-41
**Category:** bug
**Issue:** `handleReturnToMenu` uses `window.location.href = '/'` which forces a full page reload — kills any in-memory state that wasn't persisted (in-progress quiz, partial inventory transactions). Compare with `RouteErrorBoundary` which uses `navigate('/')` properly.
**Why it matters:** Hard reload after a render error wipes session state that hadn't yet hit redux-persist.
**Suggested fix:** Refactor to a hook-aware wrapper that uses `useNavigate`, or accept an `onReturn` prop and let the parent supply navigation.

### MEDIUM Stamina HUD reads from EventBus, not Redux
**File:** src/components/HUD/HUD.jsx:54-67
**Category:** complexity
**Issue:** Stamina is in two places — Phaser player state (broadcasts via `PLAYER_STAMINA_UPDATE`) and local `useState` in HUD. The HUD never reads from Redux. If a save/load happens, the HUD shows stale stamina until the next event tick.
**Why it matters:** Stamina bar shows wrong value after load. Minor; not save-corrupting.
**Suggested fix:** Mirror stamina into a `playerSlice` field updated by the same EventBus or by Phaser→Redux bridge.

### MEDIUM Onboarding sessionStorage prompt key shared across players
**File:** src/components/HUD/HUD.jsx:71-89
**Category:** bug
**Issue:** `sessionStorage.getItem('alphabet-prompt-shown')` is shared across player profiles on the same browser tab. If User A clears their character and User B starts fresh in the same session, User B never sees the alphabet prompt because A already triggered it.
**Why it matters:** Local-only multi-profile scenario, but breaks the contracted "first-time" UX.
**Suggested fix:** Scope the key to `player.id` or `player.name`, or move the flag into Redux + redux-persist.

### LOW Dead-code: duplicate PauseMenu component
**File:** src/components/UI/PauseMenu.jsx (full file)
**Category:** dead-code
**Issue:** No imports anywhere in `src/`. The active pause menu is `src/components/Router/PauseMenu.jsx` (richer feature set). The UI/ version still has its tests (`UI/__tests__/PauseMenu.test.jsx`) giving false coverage.
**Why it matters:** Future contributors edit the wrong file. Tests give a false safety signal.
**Suggested fix:** Delete `src/components/UI/PauseMenu.jsx` and its test file. If the test cases are valuable, port them to the Router version.

### LOW Dead-code: MiniGameHub vs MiniGamesHub
**File:** src/components/MiniGames/MiniGameHub.jsx
**Category:** dead-code
**Issue:** `routes.jsx` imports `MiniGamesHub` (plural). `MiniGameHub` (singular) is only referenced by its own test file. Same situation as PauseMenu.
**Suggested fix:** Confirm singular version is dead → delete component + test, or delete plural if singular is the future.

### LOW Dead-code: WordSearch vs WordSearchGame
**File:** src/components/MiniGames/WordSearchGame.jsx
**Category:** dead-code
**Issue:** Routes import `WordSearch.jsx`. `WordSearchGame.jsx` exists with its own dispatcher (`recordWordSearchScore`) but is not lazy-loaded anywhere. The `recordWordSearchScore` action might still be needed — verify before deleting.
**Suggested fix:** Confirm and remove.

### LOW LevelUpModal level count-up has an unused setTimeout
**File:** src/components/UI/LevelUpModal.jsx:38-39
**Category:** complexity
**Issue:** `t1 = setTimeout(() => setDisplayLevel(startLevel), 0)` is a no-op — `setDisplayLevel(startLevel)` was already called synchronously on line 36. Comment claims "3-frame count-up" but only t2 actually changes the value.
**Suggested fix:** Remove t1; or implement a real count-up (e.g. step by 1 every 250ms from startLevel to reward.level).

### LOW Unused variable in SkillTreeView
**File:** src/components/Skills/SkillTreeView.jsx:121
**Category:** complexity
**Issue:** `const originalIndex = tree.nodes.indexOf(node);` declared but never used.
**Suggested fix:** Remove.

### LOW HUD has no PropTypes for sub-components
**File:** src/components/HUD/QuestTracker.jsx, src/components/HUD/MiniMap.jsx, src/components/HUD/NotificationToast.jsx, src/components/HUD/StatsPanel.jsx
**Category:** complexity
**Issue:** Mixed prop-typing: HUD.jsx has PropTypes, BattleResult.jsx has PropTypes (oddly imported at line 138 after the export), but most other components have nothing. No TypeScript. No runtime checks.
**Suggested fix:** Pick a consistent strategy: either PropTypes everywhere, or migrate to TS. The current drift is a code-smell warning.

### LOW SaveLoadMenu does not refresh slot metadata if storage changes externally
**File:** src/components/SaveLoad/SaveLoadMenu.jsx:67-69
**Category:** save-load
**Issue:** `refreshSlots` runs once on mount. If another tab in the same browser saves to a slot, this tab's UI is stale until close+reopen.
**Why it matters:** Multi-tab is unusual but easy to test in dev — saves can appear to be "missing".
**Suggested fix:** Listen to `window.addEventListener('storage', ...)` for cross-tab updates.

## Patterns / Systemic Concerns

1. **Selector hygiene drift.** Three distinct anti-patterns coexist: (a) factory selectors that throw away `createSelector` memoisation each call (`selectNodeAvailability`), (b) inline whole-slice selectors (`useSelector((s) => s.player)`) used in hot-render components, and (c) inline composed selectors that return new arrays without `createSelector`. With no lint rule enforcing reselect usage, this will keep degrading. A pre-commit grep for `useSelector\(.*\(.+?\)\(\)` and `useSelector\(\(s\) => s\.\w+\)$` would catch most.

2. **EventBus is global, untyped, and undeduped.** `BATTLE_TARGET_SELECT` event aliasing is the worst case but it points at a general issue: EventBus events serve as both inbound (Phaser → React) and outbound (React → Phaser) channels and the type system can't tell them apart. Either split into two namespaces (`react:` / `phaser:`) or introduce TypeScript discriminated unions.

3. **Idempotency on reward flows.** Reward claims (quest, daily challenge, streak, haggle success) all follow the pattern "dispatch reward → dispatch state mark." The cluster of races would be easier to kill at the slice level: each `claimReward`-style reducer should compute the reward AND mark-claimed in a single dispatch. The component just calls one action.

4. **Overlay player-freeze is reference-count-free.** GameLayout's "safety net" (`setTimeout(unfreeze, 100)`) reveals the architectural smell. A counter approach in the EventBus singleton would remove all the bespoke freeze logic from every component.

5. **Onboarding state lives in too many places.** `tutorialPhase` in player slice, `ONBOARDING_COMPLETE` in worldState flags, `ONBOARDING_PATH_CHOSEN` in worldState flags, `welcomeBackShown` in dailyGoals slice, plus localStorage flags (`alphabet-prompt-shown`). The dual-source guard in GameLayout.jsx:117–122 is a tell. Consolidate.

6. **Animation `reduceMotion` is recomputed on every render.** Almost every overlay calls `const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches` inline. This is a sync DOM call on every render. Should be in a single hook with a media-query listener.

7. **Profile / dashboard derive stats from FSRS cards on every render** (`PlayerProfile.jsx:32-51`, `DailyDashboard.jsx:42-80`). These iterations are wrapped in `useMemo` correctly, but `fsrsCards` deps mean any single review re-runs the calculation across all cards. Acceptable for v1 but worth flagging.

## Out of scope but flagged

- **BattleStateMachine.js:1387** subscribes to `BATTLE_TARGET_SELECT` for inbound. This is half of the bug above. Whoever owns combat must fix both sides simultaneously.
- **redux-persist rehydrate race.** Multiple components read state on mount with `// eslint-disable-line react-hooks/exhaustive-deps`. If redux-persist hasn't completed when these effects run, the gated branches never fire correctly afterward (GameLayout.jsx:174-183 is the worst). This is a store-config concern but it bites every gating effect.
- **worldStateKeys & WORLD_STATE_KEYS.ONBOARDING_COMPLETE** dual-source check in GameLayout.jsx:117-122 is presumably a contractor (Lucas) world-side concern. Worth a heads-up — if Lucas changes the world flag location, GameLayout silently falls back to the legacy localStorage flag.
- **window.__pendingCalligraphyLaunch** in MiniGamesHub.jsx:81 is a global window-state handoff to GameLayout (line 268). Works today, but it's the only such pattern in the codebase and bypasses React's data flow. If route navigation fails, the global leaks across reloads. Worth swapping for a Redux action or sessionStorage with cleanup.
