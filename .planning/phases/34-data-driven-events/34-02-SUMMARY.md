---
phase: 34-data-driven-events
plan: 02
subsystem: npc
tags: [action-sets, event-bus, data-driven, npc, visibility-flags, phaser, cutscene]

# Dependency graph
requires:
  - phase: 34-data-driven-events
    provides: ActionSetExecutor.js evaluateActionSets + executeActions, ACTION_* EventBus constants (34-01)
  - phase: 33-world-zones
    provides: NPCManager NPC_DATA_MAP, shouldSpawnNpc, evaluateSchedule, visibilityFlag spawn pattern
provides:
  - actionSets on 4 proof-of-concept NPCs (scholar-yusuf, merchant-fatima, student-khalid, guide-amira)
  - visibilityFlag + showWhenTrue on 2 story-gated NPCs (mysterious-traveler, night-guard)
  - EventScriptRunner.js — sequential async command executor for cutscene-like sequences
  - buildActionContext() helper — Redux state snapshot for requirement evaluation
  - NPCManager.create() visibilityFlag check — story-gated NPCs skip spawn if flag mismatch
  - NPCManager.update() actionSets.interact evaluation on SPACE key press before default dialogue
affects: [34-03, npc-interaction, quest-system, dialogue-engine, story-gating]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ActionSet-first interaction: evaluate actionSets.interact before emitting NPC_INTERACT fallback"
    - "Story gating via visibilityFlag + showWhenTrue: skip spawn if flag state doesn't match"
    - "buildActionContext() pure snapshot: reads Redux state once per interaction, no caching"
    - "EventScriptRunner: async for-loop over commands, per-command delay, stop() breaks loop"
    - "NPC with empty actionSets fallthrough: NPCs without actionSets or unmatched sets still use classic NPC_INTERACT"

key-files:
  created:
    - src/game/systems/EventScriptRunner.js
  modified:
    - src/data/npcs.json
    - src/game/systems/NPCManager.js

key-decisions:
  - "actionSets added only to 4 PoC NPCs — pattern established for all 42+ NPCs in later plans"
  - "Fallback preserved: NPCs without actionSets or with no matching set still emit classic NPC_INTERACT, ensuring backward compatibility with existing DialogueEngine"
  - "buildActionContext() reads vocabMastery as empty object with TODO — FSRS mastery wiring deferred to future phase"
  - "visibilityFlag check placed after schedule check in create() — schedule gates time/zone, visibilityFlag gates story progress; both independent"
  - "EventScriptRunner emits ACTION_{type.toUpperCase()} on emitter (not EVENTS.ACTION_*) — raw string, consumers can listen on either"

patterns-established:
  - "Story-gated NPC pattern: add visibilityFlag + showWhenTrue to NPC data, NPCManager.create() filters at spawn time"
  - "ActionSet-first NPC interaction: check fullData.actionSets.interact before falling through to NPC_INTERACT"

# Metrics
duration: 3min
completed: 2026-03-16
---

# Phase 34 Plan 02: NPC ActionSets + EventScriptRunner Summary

**actionSets wired on 4 PoC NPCs with story-gated visibility flags, NPCManager evaluating data-driven behavior on interact, and EventScriptRunner for sequential cutscene command execution**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-16T15:12:42Z
- **Completed:** 2026-03-16T15:15:43Z
- **Tasks:** 2/2
- **Files modified:** 3

## Accomplishments
- Added `actionSets.interact` to 4 proof-of-concept NPCs (scholar-yusuf, merchant-fatima, student-khalid, guide-amira) with quest-gated, flag-gated, level-gated, item-gated, and fallback action sets
- Added 2 new story-gated NPCs (mysterious-traveler, night-guard) with `visibilityFlag` + `showWhenTrue: true`
- Created `EventScriptRunner.js` with async sequential command execution, per-command delay support, and `stop()` for early termination
- Wired `NPCManager.create()` with visibilityFlag check — story-gated NPCs skip spawn if flag doesn't match `showWhenTrue`
- Wired `NPCManager.update()` to evaluate `actionSets.interact` on SPACE key press, executing matched action set via `executeActions(EventBus)` before falling through to classic `NPC_INTERACT`
- Added `buildActionContext()` helper reading Redux state snapshot (quests, flags, level, time, zone, inventory)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add actionSets and visibilityFlag to proof-of-concept NPCs** - `f7cb2b4` (feat)
2. **Task 2: Create EventScriptRunner + wire NPCManager** - `e276285` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/data/npcs.json` - actionSets on 4 PoC NPCs; 2 new story-gated NPCs with visibilityFlag
- `src/game/systems/EventScriptRunner.js` - Sequential async command executor with stop() support
- `src/game/systems/NPCManager.js` - evaluateActionSets import, buildActionContext(), visibilityFlag check in create(), actionSets evaluation in update()

## Decisions Made
- Fallback preserved: NPCs without actionSets or with no matching set still emit classic `NPC_INTERACT` — backward compatible with existing DialogueEngine wiring
- `buildActionContext()` returns empty `vocabMastery: {}` with TODO comment — FSRS mastery wiring deferred to a future phase per plan spec
- `visibilityFlag` check placed after schedule check in `create()` — the two gates are independent (schedule = time/zone, visibilityFlag = story state)
- `EventScriptRunner._executeCommand()` emits `ACTION_{type.toUpperCase()}` (not `EVENTS.ACTION_*`) — allows raw string keys; consumers listen to specific EVENTS constants

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `NPCManager` now evaluates `actionSets.interact` on every NPC interaction — ready for Plan 34-03 which wires ACTION_* event consumers (DialogueEngine, questSlice, narrativeSlice, inventorySlice)
- `EventScriptRunner` is ready to be used in cutscene sequences driven by proximity or story triggers
- `buildActionContext()` provides quest/flag/level/time/zone context — vocabMastery TODO deferred to FSRS integration phase
- Build passes cleanly: 746 modules transformed, no new warnings

---
*Phase: 34-data-driven-events*
*Completed: 2026-03-16*

## Self-Check: PASSED

- FOUND: src/game/systems/EventScriptRunner.js
- FOUND: src/game/systems/NPCManager.js
- FOUND: src/data/npcs.json
- FOUND: .planning/phases/34-data-driven-events/34-02-SUMMARY.md
- FOUND: commit f7cb2b4 (Task 1)
- FOUND: commit e276285 (Task 2)
