---
phase: 34-data-driven-events
plan: 01
subsystem: npc
tags: [action-sets, event-bus, data-driven, npc, requirements, phaser]

# Dependency graph
requires:
  - phase: 33-world-zones
    provides: ScheduleEvaluator.js midnight wrap-around logic, NPCManager interaction pattern
  - phase: 34-data-driven-events
    provides: eventBusTypes.js ACTION_* constants (added in this plan)
provides:
  - evaluateActionSets(actionSets, context) — pure requirement evaluator for data-driven NPC behavior
  - executeActions(actions, emitter) — sequential action executor via EventBus emissions
  - 9 ACTION_* event constants in eventBusTypes.js
affects: [34-02, npc-interaction, quest-system, dialogue-engine]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Action set evaluation: ordered array, first-match-wins, empty requirements = unconditional fallback"
    - "Midnight wrap-around time check: startHour <= endHour ? range check : OR check (identical to ScheduleEvaluator)"
    - "executeActions emits events sequentially, consumers wired in future phases"
    - "ACTION_* event naming: action:{subsystem}:{verb} (e.g. action:quest:start)"

key-files:
  created:
    - src/game/systems/ActionSetExecutor.js
  modified:
    - src/utils/eventBusTypes.js

key-decisions:
  - "ACTION_* event name prefix is 'action:' (not 'phaser:' or 'react:') — these events are system-internal, crossing no Phaser/React boundary yet"
  - "evaluateRequirement returns false for unknown requirement types — fail-safe, forward compatible"
  - "executeActions silently skips unknown action types — forward compatible, no crash on future action type additions"
  - "Empty requirements array = unconditional match — enables default/fallback action set as last entry in array"

patterns-established:
  - "Fallback pattern: place action set with empty requirements[] last in array to guarantee a match"
  - "Pure utility: ActionSetExecutor has no side effects beyond EventBus emissions — fully testable"

# Metrics
duration: 2min
completed: 2026-03-16
---

# Phase 34 Plan 01: ActionSetExecutor Summary

**Pure data-driven NPC behavior engine with 7 requirement types and 9 action types, emitting ACTION_* EventBus events using first-match-wins evaluation order**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-16T15:08:35Z
- **Completed:** 2026-03-16T15:10:11Z
- **Tasks:** 1/1
- **Files modified:** 2

## Accomplishments
- Created `ActionSetExecutor.js` with `evaluateActionSets` and `executeActions` named exports
- Implemented all 7 requirement types: quest, flag, vocab, level, item, time, zone
- Implemented all 9 action type → EventBus event mappings: speech, startQuest, completeQuest, giveItem, teachWord, setFlag, battle, teleport, playSound
- Added 9 ACTION_* event constants to `eventBusTypes.js` following project naming convention
- Time requirement uses identical midnight wrap-around logic as ScheduleEvaluator.js
- Empty requirements array unconditionally matches (default/fallback pattern)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ActionSetExecutor with requirement evaluation** - `60162b8` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/game/systems/ActionSetExecutor.js` - Pure utility: evaluateActionSets + executeActions with full JSDoc
- `src/utils/eventBusTypes.js` - 9 new ACTION_* event constants in Phase 34 section

## Decisions Made
- ACTION_* event names use `action:` prefix rather than `phaser:` or `react:` — these events are emitted by the system engine, not tied to either side of the bridge yet; consumers (quest, dialogue, inventory) wire in plan 34-02+
- `evaluateRequirement` returns `false` for unrecognized requirement types (fail-safe)
- `executeActions` silently skips unknown action types (forward-compatible extension point)
- `flag` requirement defaults `value` to `true` when omitted, matching the most common use case

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `ActionSetExecutor.js` is ready for Plan 34-02 which wires NPCManager to use `evaluateActionSets` + `executeActions` on NPC interaction
- ACTION_* events are registered and ready for consumers (DialogueEngine, questSlice, inventorySlice) to subscribe
- Build passes with 744 modules transformed, no new warnings introduced

---
*Phase: 34-data-driven-events*
*Completed: 2026-03-16*

## Self-Check: PASSED

- FOUND: src/game/systems/ActionSetExecutor.js
- FOUND: src/utils/eventBusTypes.js
- FOUND: .planning/phases/34-data-driven-events/34-01-SUMMARY.md
- FOUND: commit 60162b8
