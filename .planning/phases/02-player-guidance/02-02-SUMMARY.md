---
phase: 02-player-guidance
plan: 02
subsystem: ui
tags: [react, redux, phaser, css-modules, eventbus, hud]

# Dependency graph
requires:
  - phase: 02-01
    provides: Quest marker system and active quest tracking in Redux
provides:
  - QuestTracker HUD component showing active quest name, progress, and compass arrow
  - Player position emission from Phaser WorldScene at ~10Hz for compass updates
  - Compass arrow directional guidance pointing toward quest objectives
affects: [Phase 4 (Onboarding), Phase 6 (World Map), Phase 7 (Player Profile)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Phaser-to-React position updates via EventBus (throttled 10Hz)
    - Compass calculation using Math.atan2 for directional arrow
    - Conditional rendering based on distance threshold (128px)

key-files:
  created:
    - src/components/HUD/QuestTracker.jsx
    - src/components/HUD/QuestTracker.module.css
  modified:
    - src/components/HUD/HUD.jsx
    - src/game/scenes/WorldScene.js

key-decisions:
  - "Throttle player position updates to ~10Hz (every 6 frames) to avoid spamming React with 60fps updates"
  - "Hide compass when objective is within 128px (2 tiles) - player is already close enough"
  - "Use CSS transform for compass rotation with 0.15s transition for smooth rotation"
  - "Position QuestTracker below HUD bar at top-left with max-width constraints for mobile"

patterns-established:
  - "Phaser EventBus throttling pattern: Frame counter % N for controlled update rate"
  - "Distance-based UI visibility: Show compass only when objective is far enough to need guidance"
  - "CSS Modules responsive pattern: Desktop-first with 768px and 480px breakpoints"

# Metrics
duration: 1min
completed: 2026-02-08
---

# Phase 2 Plan 2: Quest Objective HUD Summary

**Active quest tracker with rotating compass arrow provides persistent on-screen guidance showing quest name, progress, and direction to objective**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-08T16:51:05Z
- **Completed:** 2026-02-08T16:52:31Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- QuestTracker component displays active quest name, progress count, and progress bar
- Compass arrow calculates angle using Math.atan2 and rotates in real-time as player moves
- Player position emitted from Phaser at ~10Hz (throttled to every 6 frames) for smooth compass updates
- Compass hides gracefully when no objective location available or player within 128px
- Responsive at 768px and 480px breakpoints with proper touch targets

## Task Commits

Each task was committed atomically:

1. **Task 1: Create QuestTracker component with compass arrow and emit player position from Phaser** - `501413f` (feat)
2. **Task 2: Integrate QuestTracker into HUD and verify full build** - `bba9173` (feat)

## Files Created/Modified
- `src/components/HUD/QuestTracker.jsx` - Active quest display with compass arrow component
- `src/components/HUD/QuestTracker.module.css` - QuestTracker styling with responsive breakpoints
- `src/components/HUD/HUD.jsx` - Integrated QuestTracker below HUD bar
- `src/game/scenes/WorldScene.js` - Added player-position-update emission at 10Hz

## Decisions Made

**Throttle player position updates to ~10Hz:**
- Rationale: Compass doesn't need 60fps precision, throttling to every 6 frames reduces React re-render overhead
- Implementation: Frame counter modulo 6 in WorldScene.update()

**Hide compass when objective within 128px:**
- Rationale: Player already close enough, compass not needed for fine navigation
- Implementation: Distance check before rendering compass element

**CSS transform rotation with 0.15s transition:**
- Rationale: Smooth visual rotation without jank, fast enough to feel responsive
- Implementation: `transition: transform 0.15s ease-out` in compassArrow class

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**GUID requirements status:**
- GUID-01: NPC ! markers (completed in 02-01)
- GUID-02: NPC ? markers (completed in 02-01)
- GUID-03: Quest name + progress in HUD (completed in 02-02)
- GUID-04: Compass arrow (completed in 02-02)

**All 4 GUID requirements satisfied.** Phase 2 Player Guidance complete. Ready for Phase 3 (Feature Discoverability) which will expose Grammar, Roots, Reading, and Battles in-game.

## Self-Check: PASSED

All files and commits verified:
- FOUND: src/components/HUD/QuestTracker.jsx
- FOUND: src/components/HUD/QuestTracker.module.css
- FOUND: 501413f (Task 1 commit)
- FOUND: bba9173 (Task 2 commit)

---
*Phase: 02-player-guidance*
*Completed: 2026-02-08*
