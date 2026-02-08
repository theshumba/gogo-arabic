---
phase: 02-player-guidance
plan: 01
subsystem: ui, game-systems
tags: [redux, phaser, quest-system, npc-markers, player-guidance]

# Dependency graph
requires:
  - phase: 01-critical-fixes
    provides: CSS Modules pattern, useFocusTrap hook, responsive overlay design
provides:
  - activeQuestId state in Redux (quest tracking)
  - Quest marker selectors (selectNpcQuestMarkers, selectActiveQuest, selectActiveQuestObjectiveLocation)
  - Visual NPC quest markers (! for available, ? for turn-in)
  - Quest tracking UI in QuestLog with "Track Quest" buttons
  - NPC ID mapping (quest npcGiver role → full NPC ID from zones.js)
affects: [02-02-quest-objective-hud, 02-03-compass-pointer, future-quest-system-work]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Quest marker priority system (turn-in ? > available !)"
    - "NPC ID mapping pattern (npcGiver_zone → full NPC ID)"
    - "Phaser Redux integration (store.getState in game loop)"
    - "Memoized selectors for Phaser-accessed Redux state"

key-files:
  created: []
  modified:
    - src/store/slices/questSlice.js
    - src/game/sprites/NPC.js
    - src/game/systems/NPCManager.js
    - src/components/Quest/QuestLog.jsx
    - src/components/Quest/QuestLog.module.css

key-decisions:
  - "Quest marker depth 10000 (above name label 9999, hint text 9999)"
  - "Memoized selectors for quest markers prevent per-frame recalculation overhead"
  - "Auto-select first active quest on initialization and when tracked quest completes"
  - "Priority system: turn-in marker (green ?) takes precedence over available marker (golden !)"

patterns-established:
  - "Pattern 1: Phaser reading Redux state via store.getState() in game loop (can't use hooks)"
  - "Pattern 2: Memoized selectors (createSelector) for Phaser-accessed state (performance optimization)"
  - "Pattern 3: NPC marker lifecycle - create in constructor, update in NPCManager.update, destroy in NPCManager.destroy"

# Metrics
duration: 7min
completed: 2026-02-08
---

# Phase 2 Plan 1: NPC Quest Markers + Active Quest Tracking Summary

**Visual quest markers above NPCs (golden ! for available quests, green ? for turn-ins) with quest tracking UI in QuestLog, powered by Redux selectors and auto-selection logic**

## Performance

- **Duration:** 7 minutes
- **Started:** 2026-02-08T16:45:46Z
- **Completed:** 2026-02-08T16:53:27Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- NPCs dynamically show quest markers based on quest state (golden ! for available, green ? for completable)
- Players can select any active quest as their tracked quest from the QuestLog
- First active quest auto-selected on initialization, next active quest auto-selected when tracked quest completes
- Redux selectors provide quest marker data, active quest details, and objective locations for future HUD/compass work

## Task Commits

Each task was committed atomically:

1. **Task 1: Add activeQuestId state, setActiveQuest reducer, and memoized selectors to questSlice** - `607f14c` (feat)
2. **Task 2: Add quest marker sprites to NPCs and "Set Active" button to QuestLog** - `b7f23be` (feat)

## Files Created/Modified
- `src/store/slices/questSlice.js` - Added activeQuestId state, setActiveQuest reducer, selectNpcQuestMarkers selector (! vs ?), selectActiveQuest selector (merged state + definition), selectActiveQuestObjectiveLocation selector (NPC coords), auto-selection logic in initializeQuests/completeQuest, NPC_GIVER_TO_ID mapping
- `src/game/sprites/NPC.js` - Added questMarker Phaser.Text sprite (depth 10000, y-85), setQuestMarker method (exclamation/question/hidden), position update in setInteractionHint
- `src/game/systems/NPCManager.js` - Import store + selectNpcQuestMarkers, read markers from Redux each frame, call npc.setQuestMarker(marker), destroy questMarker in cleanup
- `src/components/Quest/QuestLog.jsx` - Import setActiveQuest and activeQuestId selector, render "Track Quest" / "Tracking" button for active quests, dispatch setActiveQuest on click
- `src/components/Quest/QuestLog.module.css` - Added .trackBtn, .trackBtnActive styles (blue/green, pixel-art theme), 44px touch targets on mobile (768px, 480px breakpoints)

## Decisions Made
- **Quest marker depth 10000:** Above name label (9999) and hint text (9999) to ensure visibility
- **Memoized selectors for markers:** selectNpcQuestMarkers uses createSelector to prevent per-frame recalculation (Phaser update loop calls store.getState every frame)
- **Auto-selection logic:** initializeQuests selects first active quest if none set, completeQuest selects next active quest if tracked quest finishes - reduces player friction
- **Priority system:** Turn-in marker (?) takes precedence over available marker (!) when same NPC has both (common during quest chains)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Quest marker infrastructure complete, ready for Plan 02 (Quest Objective HUD)
- selectActiveQuest and selectActiveQuestObjectiveLocation provide all data needed for HUD overlay
- selectNpcQuestMarkers already powering visual markers, can be reused for minimap/compass indicators

## Self-Check: PASSED

All files verified:
- src/store/slices/questSlice.js: FOUND
- src/game/sprites/NPC.js: FOUND
- src/game/systems/NPCManager.js: FOUND
- src/components/Quest/QuestLog.jsx: FOUND
- src/components/Quest/QuestLog.module.css: FOUND

All commits verified:
- 607f14c: FOUND
- b7f23be: FOUND

---
*Phase: 02-player-guidance*
*Completed: 2026-02-08*
