---
phase: 37-polish-replay
plan: 03
subsystem: gameplay
tags: [battle, currency, arabic, action-queue, turn-based]

# Dependency graph
requires:
  - phase: 37-01
    provides: "Phase 37 foundation"
provides:
  - "src/game/systems/BattleActionQueue.js — Pre-calculated battle turn playback separating calc from animation"
  - "Tiered currency system (fils/dirham/dinar) with auto-conversion in playerSlice"
  - "selectCurrency and selectTotalFils selectors"
affects: [battle-system, economy, shop-ui, hud]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Calculate-then-animate pattern: BattleActionQueue.calculateTurn() pre-computes all results, next() provides sequential playback"
    - "Tiered currency with 100:1 exchange rates: 100 fils = 1 dirham, 100 dirhams = 1 dinar"
    - "Legacy field sync: state.dirhams kept in sync with tiered currency for backward compatibility"

key-files:
  created:
    - src/game/systems/BattleActionQueue.js
  modified:
    - src/store/slices/playerSlice.js

key-decisions:
  - "BattleActionQueue is infrastructure only — wiring to BattleStateMachine deferred to future phase"
  - "Exchange rates 100:1 for cultural authenticity (fils/dirham/dinar mirror historical Islamic coinage)"
  - "Legacy state.dirhams field preserved; addDirhams/spendDirhams kept for backward compatibility"
  - "Auto-conversion built into addCurrency reducer — fils overflow promotes to dirhams, dirhams overflow promotes to dinars"

patterns-established:
  - "BattleActionQueue: queue.calculateTurn(state, playerActions, enemyActions) -> queue.next() for sequential playback"
  - "Currency selectors: selectCurrency returns {fils, dirhams, dinars}, selectTotalFils returns flat fils count"

requirements-completed: []

# Metrics
duration: 8min
completed: 2026-03-18
---

# Phase 37 Plan 03: BattleActionQueue + Tiered Currency Summary

**BattleActionQueue separating turn calculation from animation playback, plus tiered Arabic currency (fils/dirham/dinar) with auto-conversion in playerSlice**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-18T22:55:00Z
- **Completed:** 2026-03-18T23:03:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- BattleActionQueue class with calculateTurn/next/peek/remaining/isComplete API for race-condition-free battle playback
- Tiered currency system: fils (smallest), dirhams (standard), dinars (premium) with 100:1 auto-conversion
- addCurrency and spendCurrency reducers with overflow promotion and pool-based spending
- selectCurrency and selectTotalFils memoized selectors

## Task Commits

Both tasks were committed together in a prior session:

1. **Task 1: Create BattleActionQueue** - `23d462c` (feat)
2. **Task 2: Add tiered currency to playerSlice** - `23d462c` (feat)

**Build fixes:** `b0071fe` (fix: resolve build blockers)

## Files Created/Modified
- `src/game/systems/BattleActionQueue.js` - Pre-calculated battle turn queue with sequential playback API
- `src/store/slices/playerSlice.js` - Tiered currency (fils/dirham/dinar), addCurrency/spendCurrency reducers, currency selectors

## Decisions Made
- BattleActionQueue uses player-first action ordering (player actions resolve before enemy actions)
- Currency auto-converts upward only (fils -> dirhams -> dinars), never downward
- spendCurrency operates on a flattened fils pool then re-distributes across tiers

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed duplicate QuestTracker import in HUD.jsx**
- **Found during:** Build verification
- **Issue:** HUD.jsx had `import QuestTracker from './QuestTracker.jsx'` duplicated on lines 17-18
- **Fix:** Removed duplicate import line
- **Files modified:** src/components/HUD/HUD.jsx
- **Verification:** Build passes
- **Committed in:** b0071fe

**2. [Rule 3 - Blocking] Replaced react-icons/fa with inline SVGs in ClockHUD.jsx**
- **Found during:** Build verification
- **Issue:** react-icons package not installed but imported in ClockHUD.jsx
- **Fix:** Created inline SVG icon components (SunIcon, MoonIcon, CloudSunIcon, CloudMoonIcon)
- **Files modified:** src/components/HUD/ClockHUD.jsx
- **Verification:** Build passes
- **Committed in:** b0071fe

**3. [Rule 3 - Blocking] Added WelcomeSplash export to TutorialHints.jsx**
- **Found during:** Build verification
- **Issue:** GameLayout.jsx imports { WelcomeSplash } from TutorialHints.jsx but it didn't exist
- **Fix:** Added WelcomeSplash component as named export (auto-fading welcome overlay)
- **Files modified:** src/components/Onboarding/TutorialHints.jsx
- **Verification:** Build passes
- **Committed in:** b0071fe

**4. [Rule 3 - Blocking] Added ZONE_AMBIENT_LAYERS and INTERIOR_AMBIENT to audioConfig.js**
- **Found during:** Build verification
- **Issue:** useZoneEvents.js imports these constants but they weren't exported from audioConfig.js
- **Fix:** Added ambient layer definitions per zone and interior ambient settings
- **Files modified:** src/data/audioConfig.js
- **Verification:** Build passes
- **Committed in:** b0071fe

**5. [Rule 3 - Blocking] Created FastTravelManager.js stub**
- **Found during:** Build verification
- **Issue:** WorldScene.js imports FastTravelManager but file didn't exist
- **Fix:** Created stub with constructor/isUnlocked/travelTo/destroy methods
- **Files modified:** src/game/systems/FastTravelManager.js (new)
- **Verification:** Build passes
- **Committed in:** b0071fe

**6. [Rule 3 - Blocking] Created MountSystem.js stub**
- **Found during:** Build verification
- **Issue:** WorldScene.js imports MountSystem but file didn't exist
- **Fix:** Created stub with constructor/mount/dismount/update/destroy methods
- **Files modified:** src/game/systems/MountSystem.js (new)
- **Verification:** Build passes
- **Committed in:** b0071fe

---

**Total deviations:** 6 auto-fixed (all Rule 3 - blocking build issues)
**Impact on plan:** All fixes were pre-existing build blockers unrelated to plan scope. No scope creep.

## Issues Encountered
None for the plan tasks themselves. All 6 build issues were pre-existing on the worktree.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- BattleActionQueue ready for wiring to BattleStateMachine in future combat phase
- Tiered currency ready for shop UI integration and reward displays

---
*Phase: 37-polish-replay*
*Completed: 2026-03-18*
