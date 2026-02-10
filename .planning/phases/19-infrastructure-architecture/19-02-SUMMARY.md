---
phase: 19-infrastructure-architecture
plan: 02
subsystem: infra
tags: [redux, redux-toolkit, redux-persist, phaser, vitest, narrative, story-flags, npc-relationships]

# Dependency graph
requires: []
provides:
  - narrativeSlice: 13th Redux slice tracking story flags, NPC relationships, world object states, choice history, building visits
  - narrative state persisted to localStorage via redux-persist whitelist
  - testUtils.jsx updated with narrativeReducer for test correctness
  - sceneMock.js extended with pause/resume/launch/stop/isActive/getScene/manager APIs for SceneStackManager tests
affects:
  - 19-03-useEventBusListeners refactor (useNarrativeEvents sub-hook will dispatch to narrativeSlice)
  - 19-04-SceneStackManager (uses scene lifecycle mocks from sceneMock.js)
  - 20-dialogue-system (DialogueEngine dispatches setStoryFlag, recordChoice, setNpcRelationship)
  - 21-guided-onboarding (mentor system uses NPC relationships)
  - 22-buildings (markBuildingVisited, setWorldObjectState)
  - 23-interactive-objects (setWorldObjectState per object)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "narrativeSlice pattern: parameterized selector factories (selectStoryFlag(flag) => state => ...) for single-value lookups"
    - "narrativeSlice pattern: createSelector memoized selectors for derived data (selectHasMadeChoice)"
    - "NPC relationship model: integer 0-5 trust level clamped with Math.max/Math.min"
    - "Story flag budget guard: DEV-mode console.warn when flags >= 50"
    - "sceneMock extension: add only, never remove — preserves backward compatibility"

key-files:
  created:
    - src/store/slices/narrativeSlice.js
  modified:
    - src/store/store.js
    - src/test/testUtils.jsx
    - src/game/systems/__tests__/mocks/sceneMock.js

key-decisions:
  - "narrativeSlice uses initialState spread in resetNarrativeProgress (return { ...initialState }) rather than Object.assign for immutability safety"
  - "selectHasMadeChoice uses createSelector for memoization since it iterates choiceHistory array on every call"
  - "selectNarrativeFlagCount exported as plain selector (not memoized) — O(1) Object.keys call, memoization overhead not warranted"
  - "sys.scene.manager added to sceneMock to support this.scene.sys.scene.manager access pattern in SceneStackManager"

patterns-established:
  - "Pattern: All Redux slices must export named selectors (established in v3.0, followed here)"
  - "Pattern: Parameterized selectors return (state) => value | null | 0 (not undefined) for safe destructuring"
  - "Pattern: sceneMock additions are additive only — never remove or rename existing properties"

# Metrics
duration: 2min
completed: 2026-02-10
---

# Phase 19 Plan 02: narrativeSlice + Store Wiring Summary

**13th Redux slice for narrative state (story flags, NPC relationships, world object states) with localStorage persistence via redux-persist, plus scene lifecycle mocks for upcoming SceneStackManager tests**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-10T20:40:57Z
- **Completed:** 2026-02-10T20:42:42Z
- **Tasks:** 2 completed
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments

- Created `narrativeSlice.js` (127 lines): 7 action reducers + 10 selectors following established grammarSlice pattern
- Wired `narrativeReducer` into `store.js` combineReducers + persist whitelist atomically with slice creation
- Updated `testUtils.jsx` createTestStore to include `narrativeReducer` — prevents `TypeError: Cannot read properties of undefined (reading 'storyFlags')` in future component tests
- Extended `sceneMock.js` with `scene.pause/resume/launch/stop/isActive/getScene/manager` and `sys.scene.manager` — all 101 existing game system tests still pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Create narrativeSlice and wire into store with persistence** - `b682137` (feat)
2. **Task 2: Extend sceneMock with scene lifecycle APIs for SceneStackManager** - `c8d31ef` (feat)

**Plan metadata:** TBD (docs commit)

## Files Created/Modified

- `src/store/slices/narrativeSlice.js` — 13th Redux slice: 7 reducers, 10 selectors, 5-field initial state, DEV budget guard
- `src/store/store.js` — Added narrativeReducer to combineReducers + 'narrative' to persist whitelist
- `src/test/testUtils.jsx` — Added narrativeReducer to createTestStore combineReducers
- `src/game/systems/__tests__/mocks/sceneMock.js` — Added scene lifecycle APIs + sys.scene.manager

## Decisions Made

- Used `return { ...initialState }` in `resetNarrativeProgress` rather than Immer mutation — produces clean fresh state for new game
- `selectHasMadeChoice` uses `createSelector` for memoization since it calls `Array.prototype.some` over unbounded choiceHistory
- `selectNarrativeFlagCount` is a plain selector — `Object.keys` count is O(1) on keys, overhead not worth memoization
- Added `sys.scene.manager.getActiveScenes` to sceneMock in addition to `scene.manager.getActiveScenes` — SceneStackManager will access both `this.scene.manager` and `this.scene.sys.scene.manager` patterns depending on context

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all verification steps passed on first run.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- narrativeSlice ready for use by Plan 19-03 (useNarrativeEvents sub-hook) and Plan 19-04 (SceneStackManager dispatching world object state)
- sceneMock lifecycle mocks ready for Plan 19-04 SceneStackManager unit tests
- Narrative state will persist across page refresh (in whitelist) — no rehydration issues expected
- 551/554 tests pass (3 pre-existing failures in DailyDashboard x2, HUD x1 — NOT regressions from this plan)

---
*Phase: 19-infrastructure-architecture*
*Completed: 2026-02-10*

## Self-Check: PASSED

- FOUND: `src/store/slices/narrativeSlice.js`
- FOUND: `src/store/store.js`
- FOUND: `src/test/testUtils.jsx`
- FOUND: `src/game/systems/__tests__/mocks/sceneMock.js`
- FOUND commit `b682137` (feat(19-02): create narrativeSlice)
- FOUND commit `c8d31ef` (feat(19-02): extend sceneMock)
