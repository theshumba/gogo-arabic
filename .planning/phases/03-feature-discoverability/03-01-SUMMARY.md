---
phase: 03-feature-discoverability
plan: 01
subsystem: ui
tags: [react, react-router-dom, pause-menu, world-map, navigation, bosses]

# Dependency graph
requires:
  - phase: 01-critical-fixes
    provides: Z-index tokens, CSS Modules pattern, EventBus review navigation
  - phase: 02-player-guidance
    provides: Quest tracking, world map foundation
provides:
  - In-game Activities menu exposing Grammar, Roots, Reading, Mini-Games
  - Boss challenge nodes on world map for Word Duel battles
  - Verified review badge navigation (from Phase 1)
affects: [06-world-map-upgrade, 04-onboarding-hud]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Inline sub-component pattern (ActivitiesMenu within GameLayout)
    - Boss node positioning with offset constants
    - Responsive grid collapse (2x2 → 1 column at 480px)

key-files:
  created: []
  modified:
    - src/components/Router/GameLayout.jsx
    - src/components/Router/GameLayout.module.css
    - src/components/World/WorldMap.jsx
    - src/components/World/WorldMap.module.css

key-decisions:
  - "Inline ActivitiesMenu component instead of separate file (simple, single-use component)"
  - "Cyan background for Activities button to differentiate from Resume/Main Menu"
  - "Boss nodes offset (+6x, -3y) from zone centers to avoid overlap"
  - "Hide boss labels at 480px, keep sprite + difficulty for mobile clarity"

patterns-established:
  - "Sub-menu pattern: useState toggle between parent menu and sub-view with Back button"
  - "Boss node filtering: only render for unlocked zones"
  - "Legend expansion: add new item types to existing legend array"

# Metrics
duration: 6min
completed: 2026-02-08
---

# Phase 3 Plan 1: Feature Discoverability Summary

**Activities menu with 4 feature cards (Grammar/Roots/Reading/Mini-Games) and boss challenge nodes with emoji sprites on world map**

## Performance

- **Duration:** 6 minutes
- **Started:** 2026-02-08T18:14:01Z
- **Completed:** 2026-02-08T18:20:00Z
- **Tasks:** 3 (2 implementation, 1 verification)
- **Files modified:** 4

## Accomplishments
- Players can access all 4 hidden learning features (Grammar, Roots, Reading, Mini-Games) from pause menu without leaving game
- All 8 boss challenges visible on world map for unlocked zones with clear difficulty indicators
- Review badge navigation verified (DISC-03 satisfied by existing Phase 1 implementation)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Activities menu to PauseMenu** - `dc70ac3` (feat)
   - ActivitiesMenu sub-component with 4 feature cards
   - Sub-menu navigation pattern with Back button
   - Responsive 2x2 grid → 1 column at 480px

2. **Task 2: Add boss challenge nodes to WorldMap** - `3418ee8` (feat)
   - renderBossNode function with emoji sprite, names, difficulty stars
   - Boss nodes only shown for unlocked zones
   - Navigates to `/battle?boss={id}` on click
   - Added boss icon to map legend

3. **Task 3: Verify review badge functionality** - No commit (verification only)
   - Confirmed HUD → EventBus → GameLayout → navigate('/review') chain intact
   - All 4 checks passed, DISC-03 satisfied

## Files Created/Modified
- `src/components/Router/GameLayout.jsx` - Added ActivitiesMenu component, Activities button, sub-menu state management
- `src/components/Router/GameLayout.module.css` - Activities menu styles (grid, cards, button), responsive breakpoints
- `src/components/World/WorldMap.jsx` - Boss node rendering, BOSS_OFFSETS, useNavigate import, legend update
- `src/components/World/WorldMap.module.css` - Boss node styles (sprite, labels, difficulty), responsive (hide labels at 480px)

## Decisions Made
- **Inline component:** ActivitiesMenu defined in GameLayout.jsx instead of separate file (simple, single-use component, reduces file proliferation)
- **Cyan Activities button:** Used `var(--color-cyan)` to differentiate from Resume (gold) and Main Menu (transparent border)
- **Boss offset positioning:** BOSS_OFFSETS (+6x, -3y) places bosses slightly right and above zone dots to avoid overlap
- **Mobile boss labels:** Hidden at 480px, keep sprite + difficulty stars (reduced clutter, key info preserved)
- **Import React explicitly:** Added React import for useState (not auto-imported in this file)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Build passed on all attempts, no regressions, all functionality worked as specified.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Feature discoverability foundation complete
- All 4 hidden features (Grammar, Roots, Reading, Mini-Games) now accessible in-game
- Boss challenges visible on world map
- Review sessions confirmed accessible from HUD
- Ready for Phase 4 (Onboarding & HUD improvements)
- Phase 3 Plan 2 can proceed (onboarding tooltips for new players)

## Self-Check: PASSED

All claimed files and commits verified:
- ✓ src/components/Router/GameLayout.jsx exists
- ✓ src/components/Router/GameLayout.module.css exists
- ✓ src/components/World/WorldMap.jsx exists
- ✓ src/components/World/WorldMap.module.css exists
- ✓ Commit dc70ac3 exists (Task 1)
- ✓ Commit 3418ee8 exists (Task 2)

---
*Phase: 03-feature-discoverability*
*Completed: 2026-02-08*
