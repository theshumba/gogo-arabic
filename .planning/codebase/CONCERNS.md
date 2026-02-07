# Codebase Concerns

**Analysis Date:** 2026-02-07

## Tech Debt

**Duplicate XP/Leveling Logic:**
- Issue: XP table and level calculation logic duplicated in two places - hardcoded array in `src/utils/xpCalculator.js` and Redux state in `src/store/slices/playerSlice.js`. Both maintain identical tables but independently.
- Files: `src/utils/xpCalculator.js` (lines 1-22), `src/store/slices/playerSlice.js` (lines 4-24)
- Impact: Risk of desynchronization if one is updated and the other isn't. Single source of truth missing. Future level adjustments must be coordinated across two files.
- Fix approach: Move XP table to shared constant in a centralized config file (e.g., `src/config/progression.js`). Both utilities should import from this source. Update the local implementation to reference the single table.

**EventBus Dual Locations:**
- Issue: `EventBus` exported from two locations: canonical location at `src/utils/eventBus.js` and re-export wrapper at `src/game/EventBus.js`. Some imports use `../utils/eventBus.js`, others use `../game/EventBus.js`. Creates maintainability confusion and fragile import paths.
- Files: `src/game/EventBus.js` (re-exports from `src/utils/eventBus.js`), imported inconsistently across codebase
- Impact: Refactoring becomes harder. Two mental models of where the EventBus lives. Easy to introduce circular dependencies.
- Fix approach: Deprecate `src/game/EventBus.js` wrapper. Migrate all imports to `src/utils/eventBus.js`. Remove the wrapper file once migration complete.

**Repetitive Shuffle Implementation:**
- Issue: Fisher-Yates shuffle implemented inline in 5 separate locations using `Math.random() - 0.5`. Implementation spreads across UI components (`QuizOverlay.jsx`, `AlphabetModule.jsx`, `ReviewSession.jsx`, `MatchPairs.jsx`, `DialogueOverlay.jsx`) and services (`fsrs.js`).
- Files: `src/services/fsrs.js:33`, `src/hooks/useQuiz.js:14-17`, `src/components/Quiz/QuizOverlay.jsx`, `src/components/Alphabet/AlphabetModule.jsx`, `src/components/Review/ReviewSession.jsx`, `src/components/Quiz/MatchPairs.jsx`, `src/components/NPC/DialogueOverlay.jsx`
- Impact: Maintenance burden. Inconsistent randomization quality (some use `.sort(() => Math.random() - 0.5)` which is suboptimal for shuffling). Hard to audit all shuffle sites.
- Fix approach: Create `src/utils/shuffle.js` with tested Fisher-Yates implementation. Export `shuffle()` and `shuffleSubset()` utilities. Replace all inline implementations with imports.

**Inline Math.random() for Randomization:**
- Issue: Random number generation scattered throughout codebase without seeding or consistent strategy. Uses include: treasure chest amounts (`WorldScene.js:593-595`), quiz question selection (`useQuiz.js:74`), shuffle operations, letter distractor selection (`AlphabetModule.jsx:426`). No centralized entropy management.
- Files: Multiple - `src/game/scenes/WorldScene.js`, `src/hooks/useQuiz.js`, `src/components/*.jsx`, `src/services/fsrs.js`
- Impact: Cannot reproduce bugs or test with deterministic values. Difficult to balance game difficulty or predict output distributions. No seeding capability for testing.
- Fix approach: Create `src/utils/random.js` singleton with methods: `randInt(min, max)`, `randChoice(array)`, `shuffle(array)`. Add optional seed support. Replace all `Math.random()` calls with this utility.

## Known Bugs

**Player Freeze State Not Synchronized:**
- Symptoms: Player can interact with multiple objects simultaneously. Interaction cooldown (500ms) exists but freeze state may not persist across zone transitions. Possible to queue multiple "freeze-player" events without corresponding "unfreeze-player".
- Files: `src/game/scenes/WorldScene.js` (lines 410-418, 424-515), `src/game/systems/ZoneTransition.js` (lines 13-43)
- Trigger: Rapidly interact with NPCs/objects while zone transition is queued, or interact during the transition fade animation.
- Workaround: Add check in update loop to verify frozen state matches expected state from Redux.

**Audio File Loading Silently Fails:**
- Symptoms: Missing audio files (e.g., word pronunciation, ambient zone music) fail silently with `console.warn()` only. No user feedback that audio didn't load. Ambient music may stop midway without indication.
- Files: `src/services/audio.js` (lines 91-95 for ambient, 146-149 for SFX, 173-175 for word, 191-193 for letter)
- Trigger: Navigate to zone with missing ambient track, or speak word with no pronunciation file.
- Workaround: Monitor console for warning messages. Pre-test all audio asset filenames.

**XP Calculation Cumulative Bug Risk:**
- Symptoms: `playerSlice.js` addXP reducer uses cumulative logic (line 80-87) that recalculates level multiple times per update. If XP table entry is off-by-one, level progression breaks silently.
- Files: `src/store/slices/playerSlice.js` (lines 76-88)
- Trigger: Gain XP that would skip multiple levels, or XP that lands exactly on a threshold.
- Workaround: Verify XP values received match expected thresholds. Test edge cases like 99 XP at level 19.

**Zone Unlock Checks Not Enforced Server-Side:**
- Symptoms: Zone unlock requirements checked only in client (`WorldScene.js:556-561`) via EventBus emit. No backend validation prevents a manipulated client from accessing locked zones.
- Files: `src/game/scenes/WorldScene.js` (lines 556-561), `src/services/api.js` - saveGame/loadGame endpoints have no unlock gate
- Impact: Users can modify localStorage to unlock zones without meeting requirements, breaking progression. No audit trail of unlock acquisition.
- Fix approach: Move zone unlock validation to backend. Backend should reject `loadGame` if state contains unlocked zones that don't match completion requirements. Client checks are UX only.

## Security Considerations

**Token Storage in localStorage:**
- Risk: Authentication token stored in plaintext in localStorage (`src/services/api.js:4`). Vulnerable to XSS attacks - any injected script can steal the token. No httpOnly flag possible with localStorage.
- Current mitigation: Redux-persist only persists non-sensitive game state. Token is NOT persisted by Redux.
- Recommendations:
  1. Move token to httpOnly, Secure cookie (requires backend coordination).
  2. If localStorage unavoidable, encrypt before storage.
  3. Add Content-Security-Policy header to prevent inline scripts.
  4. Audit all places calling `localStorage.getItem('token')` - only `src/services/api.js:4` currently.

**Direct HTML Injection via innerHTML:**
- Risk: `DOMOverlay.js:98` uses `innerHTML` to set overlay content. If NPC names or zone labels come from untrusted sources, XSS possible.
- Files: `src/game/systems/DOMOverlay.js` (lines 27-37, 98)
- Current mitigation: All content comes from hardcoded `src/data/zones.js` or Redux state. No user input sanitized into HTML.
- Recommendations:
  1. Continue avoiding user input in overlays.
  2. If user-generated content added, use `textContent` or sanitize with DOMPurify.
  3. Audit overlay creation calls (lines 60-83 are safe).

**No Input Validation on API Requests:**
- Risk: `src/services/api.js` passes user input directly to JSON.stringify and fetch without validation. Register/login accept any string for `name`, `email`, `password`.
- Files: `src/services/api.js` (lines 22-26)
- Impact: Backend must validate, but client accepts any input. Could send malformed requests or bypass client-side UX checks.
- Recommendations:
  1. Add schema validation (zod/yup) before API calls.
  2. Validate email format, password requirements client-side.
  3. Cap string lengths to prevent abuse.

**No CSRF Protection on API Endpoints:**
- Risk: Fetch requests in `src/services/api.js` include no CSRF token. Endpoints like `/game/save`, `/review/sync` could be called from other origins if CORS is permissive.
- Recommendations:
  1. Backend should enforce SameSite cookie policy.
  2. Add CSRF token to POST/PUT requests (requires backend coordination).
  3. Verify backend uses httpOnly + Secure cookies, not token in header as sole protection.

## Performance Bottlenecks

**Inefficient Shuffle Algorithm:**
- Problem: `fsrs.js:33` and multiple components use `array.sort(() => Math.random() - 0.5)`. This is O(n*log(n)) and produces non-uniform distribution.
- Files: `src/services/fsrs.js:33`, `src/components/Quiz/QuizOverlay.jsx:293`, `src/components/Alphabet/AlphabetModule.jsx:436-438`, `src/components/Review/ReviewSession.jsx:237-239`, `src/components/Quiz/MatchPairs.jsx:86`, `src/components/NPC/DialogueOverlay.jsx:410`
- Cause: Using sort as shuffle is computationally wasteful and mathematically incorrect for randomization. Better is Fisher-Yates O(n) algorithm.
- Improvement path: Replace with proper Fisher-Yates in shared `src/utils/shuffle.js`. Measurable gain at scale (hundreds of array items).

**DOM Overlay Position Update Every Frame:**
- Problem: `DOMOverlay.js:update()` (line 122) recalculates screen positions for ALL overlays every frame, even those not visible. Gets called from `WorldScene.update()` every frame (~60fps).
- Files: `src/game/systems/DOMOverlay.js` (lines 122-138), called from `src/game/scenes/WorldScene.js:514`
- Cause: Unconditional update of all overlays without checking visibility first (line 128 checks visibility but only for rendering, not for skipping calculation).
- Improvement path:
  1. Cache camera and canvas scale values.
  2. Only recalculate positions for visible overlays.
  3. Consider throttling to 30fps or update only when camera moved.
  4. For production: profile with DevTools Performance tab to measure actual impact.

**Zone Loading Recreates All Sprites:**
- Problem: `WorldScene.buildZone()` (lines 134-385) creates full zone from scratch on every zone load. No sprite recycling or pooling. With 40x30 map (1200 ground tiles + 80+ objects), this is expensive every transition.
- Files: `src/game/scenes/WorldScene.js` (lines 134-385)
- Cause: Data-driven approach is clean but unoptimized. No pooling, caching, or lazy loading.
- Improvement path:
  1. Lazy-render only visible region first (tiles within camera bounds).
  2. Pool and reuse sprite objects for tiles.
  3. Render ground layer to tilemap once rather than individual sprites.
  4. Test with large maps (80x60+) to find breaking point.

**Phrase Distractor Selection O(n^2):**
- Problem: `NPC/DialogueOverlay.jsx:410`, `Review/ReviewSession.jsx:237-239` and similar filter learned vocabulary repeatedly, creating new arrays per distractor selection. For 500+ learned words, this is slow.
- Files: `src/components/NPC/DialogueOverlay.jsx`, `src/components/Review/ReviewSession.jsx`, `src/components/Quiz/QuizOverlay.jsx`
- Cause: Inline filtering on every quiz start. No caching of word categories or precomputed distractor pools.
- Improvement path: Cache vocabulary indexed by category at app start. Build distractor pool once per quiz session.

## Fragile Areas

**Zones.js Data Structure (907 lines):**
- Files: `src/data/zones.js`
- Why fragile: Single massive file containing all zone definitions (oasis_village through every zone). Coordinates are hardcoded as tile indices (x, y). Collision data hardcoded per object. Renaming a zone ID, NPC ID, or object key breaks references across WorldScene, NPC dialogue, quests, and Redux state.
- Safe modification:
  1. Use linter to enforce zone ID consistency.
  2. Create schema validation to ensure all NPC IDs are referenced in dialogue data.
  3. Map object keys to actual sprite asset names - validate assets exist at build time.
  4. Consider splitting into separate files per zone once it exceeds 1200 lines.
- Test coverage: No unit tests visible. Zone loading relies on integration testing in WorldScene.

**WorldScene.update() with Multiple Loops (424-515):**
- Files: `src/game/scenes/WorldScene.js` (lines 424-515)
- Why fragile: Updates player, NPCs, exit triggers, and overlays all in one method. Tight coupling between NPC proximity, interaction hints, and DOM updates. If any single step fails or takes too long, whole update stalls. No clear separation of concerns.
- Safe modification:
  1. Extract NPC interaction loop to separate method.
  2. Extract exit trigger checking to separate method.
  3. Extract overlay updates to DOMOverlay class (already partially extracted).
  4. Add early-return guards to skip expensive operations if not needed.
- Test coverage: Phaser scenes are hard to unit test. Recommend integration tests for movement/interaction boundaries.

**Redux Persist Whitelist (store.js:19):**
- Files: `src/store/store.js` (lines 16-20)
- Why fragile: Redux persist whitelist manually maintained. If new slices added but not whitelisted, silent data loss on refresh. If slice removed from whitelist but old data exists, orphaned data in localStorage.
- Safe modification:
  1. Document why each slice is/isn't persisted (comments in persistConfig).
  2. Add build-time check to ensure all reducer names match whitelist.
  3. Add console.warn if unexpected keys found in localStorage on rehydrate.
- Test coverage: No visible tests for persist rehydration. Recommend testing localStorage round-trip for each persisted slice.

**AudioManager Singleton State:**
- Files: `src/services/audio.js`
- Why fragile: Global singleton `audioManager` with mutable state (sfxCache, currentZone, volumes). Multiple React components or Phaser scenes could call methods simultaneously, causing race conditions. No cleanup on scene shutdown visible.
- Safe modification:
  1. Add reset() method to clear SFX cache on zone transitions.
  2. Document that only one ambient track can play at a time - prevent queuing.
  3. Add locks/flags to prevent simultaneous ambientPlayback() calls.
- Test coverage: Audio system untested. Recommend mocking Howl and testing volume transitions, cache behavior, and cross-fade timing.

## Scaling Limits

**Vocabulary Data Structure:**
- Current capacity: No visible limit in code, but `useQuiz.js:21-28` filters across all vocabulary (vocabulary imported from JSON, size unknown).
- Limit: With 1000+ words, `pickDistractors()` filtering becomes slow. Each quiz start filters entire vocabulary multiple times.
- Scaling path: Pre-compute category index at app startup. Build distractor pool once. Cache results per word.

**Zone Definitions in Single File:**
- Current capacity: 8 zones defined in `src/data/zones.js` (907 lines). Each zone has objects, NPCs, interactables, exits arrays.
- Limit: At 20+ zones, file exceeds 2000 lines (hard to maintain). At 100+ zones, load time becomes noticeable.
- Scaling path: Split zones into separate files `src/data/zones/{zoneName}.js`. Create zone registry that lazy-loads. Preload only adjacent zones.

**Player Inventory Array (playerSlice.js):**
- Current capacity: `inventory: []` is unbounded array. No max capacity enforced. `addToInventory()` (lines 126-133) allows unlimited items.
- Limit: With 100+ inventory items, Redux state size grows, persist serialization slows, React re-renders all items on any inventory change.
- Scaling path: Implement inventory limit (e.g., 20 slots). Add pagination or category filtering in UI. Consider moving inventory to separate store slice for isolated updates.

**DOM Overlay Rendering:**
- Current capacity: `DOMOverlay.overlays` Map holds all active overlays. Position update runs every frame for all overlays.
- Limit: With 50+ overlays (many NPCs/interactables on screen), DOM queries and CSS recalculations add up. Not visible until testing with 30+ sprites visible.
- Scaling path: Batch DOM updates. Use CSS transforms for position (already done). Consider virtual scrolling for large overlay lists.

## Dependencies at Risk

**Howler.js (Audio Library):**
- Risk: Howler 2.2.4 is maintained but not frequently updated. If audio format support becomes critical issue, may need to migrate to Web Audio API directly. No fallback if Howler fails to load.
- Impact: Audio breaks silently (only console.warn). Could break in browsers with non-standard Web Audio support.
- Migration plan: Fallback to native `<audio>` tags for basic playback. Maintain Howler wrapper for advanced features (fade, groups).

**redux-persist (6.0.0):**
- Risk: Package not actively updated recently. Blacklist/whitelist API is older pattern (modern approach is to serialize custom). Potential issue with large localStorage writes on slow devices.
- Impact: Persistence may fail silently on quota exceeded. No progress indicator for large saves.
- Migration plan: Consider zustand or another modern state library if Redux complexity grows. Or migrate to IndexedDB for larger storage.

**ts-fsrs (5.2.3):**
- Risk: Spaced repetition algorithm from external library. Changes to algorithm behavior would affect all users. No custom modifications possible without forking.
- Impact: If bug found in algorithm, all users affected globally.
- Migration plan: Maintain algorithm in vendor lock. Monitor release notes. Test any updates thoroughly before deploying.

## Missing Critical Features

**Offline-First Sync Strategy:**
- Problem: API service (`src/services/api.js`) has no offline handling. Redux sync state exists (syncSlice.js) but not implemented. User loses progress if offline.
- Blocks: Offline gameplay, progress backup, cloud sync across devices.
- Recommendation: Implement Queue pattern: if network fails, queue changes locally. Sync when online. Add progress indicator to UI.

**Session Recovery:**
- Problem: No visible session state. If browser crashes mid-quiz or mid-zone-transition, user has to restart. No way to resume.
- Blocks: Mobile experience. Users expect save-on-every-action in game-like apps.
- Recommendation: Persist quiz session state. Auto-save game position every N seconds.

**Input Validation & Error Boundaries:**
- Problem: Only one ErrorBoundary visible (`src/components/ErrorBoundary/ErrorBoundary.jsx`). API errors not caught. Phaser scene errors would crash entire game.
- Blocks: Production readiness. Error handling scattered, no central strategy.
- Recommendation:
  1. Wrap API calls in try-catch.
  2. Add error recovery UI (retry buttons).
  3. Extend ErrorBoundary to cover all routes.

## Test Coverage Gaps

**Untested Area: Quiz Logic:**
- What's not tested: `useQuiz.js` (185 lines) handles question generation, answer validation, scoring. No visible tests.
- Files: `src/hooks/useQuiz.js`, `src/components/Quiz/QuizOverlay.jsx`, `src/components/Review/ReviewSession.jsx`
- Risk: Bug in distractor selection (e.g., correct answer not in choices), scoring logic (e.g., streak not incremented), or FSRS integration could go unnoticed.
- Priority: High - core gameplay mechanic.

**Untested Area: Zone Transitions:**
- What's not tested: `ZoneTransition.js` and `WorldScene.loadZone()` chain (46 lines + 131 lines). Camera positioning, unlock gates, entry point calculation not validated.
- Files: `src/game/systems/ZoneTransition.js`, `src/game/scenes/WorldScene.js`
- Risk: Player spawns in collision, camera bounds wrong, exit trigger never fires, zone doesn't unload properly.
- Priority: High - core game loop.

**Untested Area: Redux State Persistence:**
- What's not tested: Redux-persist rehydration, whitelist enforcement, state shape migrations.
- Files: `src/store/store.js`, all slice reducers
- Risk: Old localStorage causes app to crash, slice merge conflicts, data loss on version upgrade.
- Priority: Medium - affects existing player saves.

**Untested Area: Audio System:**
- What's not tested: Fade transitions, file loading errors, cache behavior, volume synchronization across channels.
- Files: `src/services/audio.js`
- Risk: Audio cuts out unexpectedly, volume gets stuck, memory leaks in Howl instances.
- Priority: Medium - impacts UX but not critical to gameplay.

**Untested Area: API Integration:**
- What's not tested: Login flow, token refresh, sync conflict resolution, network timeout handling.
- Files: `src/services/api.js`, anywhere EventBus emits sync events
- Risk: User tokens expire silently, sync fails without feedback, network errors cause state corruption.
- Priority: Medium-High - blocking feature for cloud save.

---

*Concerns audit: 2026-02-07*
