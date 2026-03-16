---
phase: 33-world-zones
plan: 01
subsystem: npc
tags: [phaser, schedules, npcs, time-system, redux, pure-utility]

# Dependency graph
requires:
  - phase: 32-advanced-combat
    provides: Stable Redux store structure with narrative.storyFlags
  - phase: 31-crafting
    provides: Time system (timeSlice, selectGameTime, TIME_PHASES)
provides:
  - Schedule arrays on 4 oasis_village NPCs (guide-amira, scholar-yusuf, merchant-fatima, student-khalid)
  - ScheduleEvaluator pure utility (evaluateSchedule, shouldSpawnNpc)
  - NPCManager schedule-filtered spawning with NPC_DATA_MAP
  - _scheduleEntry stored on spawned NPC sprites for movement system
affects: [33-world-zones (plans 02+), npc-movement, time-driven-behavior]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Declarative schedule arrays on NPC data (Majora's Mask / Animal Crossing pattern)"
    - "Pure utility evaluator with midnight wrap-around logic for time ranges"
    - "Module-level Map for O(1) NPC data lookup by id"
    - "Spawn-time schedule filtering: skip NPCs not scheduled for current zone/time"
    - "_scheduleEntry stored on sprite for downstream movement system consumption"

key-files:
  created:
    - src/game/systems/ScheduleEvaluator.js
  modified:
    - src/data/npcs.json
    - src/game/systems/NPCManager.js

key-decisions:
  - "4 proof-of-concept NPCs receive schedules (guide-amira, scholar-yusuf, merchant-fatima, student-khalid) — pattern established for all 42+ NPCs"
  - "NPCs without schedule array always spawn unconditionally (backward compatible)"
  - "scholar-yusuf and student-khalid have no night entry — they disappear at night (go indoors)"
  - "Schedule filtering occurs at spawn time, not at runtime re-evaluation (re-evaluation deferred to plan 02+)"
  - "_scheduleEntry stored on NPC sprite at spawn time for movement system to consume without re-evaluating"

patterns-established:
  - "Schedule schema: { startHour, endHour, zone, location: {x, y}, behavior: static|wander|patrol }"
  - "Midnight wrap-around: startHour > endHour means the range crosses midnight"
  - "No schedule entry for a time = NPC is indoors/hidden (not explicitly absent — just no matching entry)"

# Metrics
duration: 4min
completed: 2026-03-16
---

# Phase 33 Plan 01: NPC Schedule Data + ScheduleEvaluator Summary

**Declarative NPC schedule arrays on 4 oasis_village NPCs with a pure ScheduleEvaluator utility and schedule-filtered spawning in NPCManager**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-16T14:39:35Z
- **Completed:** 2026-03-16T14:42:59Z
- **Tasks:** 3
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments

- Added 2-entry schedule arrays to guide-amira, scholar-yusuf, merchant-fatima, and student-khalid in npcs.json — 38 NPCs remain schedule-free (backward compatible)
- Created ScheduleEvaluator.js: pure stateless utility with `evaluateSchedule()` and `shouldSpawnNpc()`, handling midnight wrap-around and optional story flag gates
- Wired NPCManager.create() to skip NPCs whose schedule doesn't match current zone/hour, using a module-level NPC_DATA_MAP for O(1) lookup

## Task Commits

Each task was committed atomically:

1. **Task 1: Add schedule arrays to 4 oasis_village NPCs** - `77e3d1b` (feat)
2. **Task 2: Create ScheduleEvaluator pure utility** - `d3efcd5` (feat)
3. **Task 3: Wire NPCManager to filter spawns by schedule** - `e1b21f5` (feat)

**Plan metadata:** (docs commit — see final_commit step)

## Files Created/Modified

- `src/data/npcs.json` - Added schedule arrays to 4 oasis_village NPCs; 38 NPCs untouched
- `src/game/systems/ScheduleEvaluator.js` - NEW: pure utility, evaluateSchedule + shouldSpawnNpc exports
- `src/game/systems/NPCManager.js` - Added imports, NPC_DATA_MAP, schedule guard in create(), _scheduleEntry on spawn

## Decisions Made

- **4 proof-of-concept NPCs (not all 42):** The plan specified these 4 as the PoC. Pattern documented for future expansion.
- **scholar-yusuf/student-khalid have no night entry:** "Going indoors" is modelled as absence of a matching schedule entry, not an explicit hide flag. Cleaner data model.
- **_scheduleEntry on sprite at spawn time:** Avoids re-evaluating the schedule every frame. Movement system in plan 02+ reads this.
- **NPC_DATA_MAP at module level:** O(1) lookup — built once when module loads, not on every create() call.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Foundation complete for NPC movement (plan 02): `_scheduleEntry` on sprites has `behavior` field (static/wander/patrol) for NPC.js movement logic
- Foundation complete for time-driven schedule re-evaluation (plan 03+): ScheduleEvaluator is pure and reusable by NPCManager._onPhaseChanged()
- All 38 unscheduled NPCs continue to spawn unconditionally — no regressions

---
*Phase: 33-world-zones*
*Completed: 2026-03-16*

## Self-Check: PASSED

- FOUND: src/data/npcs.json
- FOUND: src/game/systems/ScheduleEvaluator.js
- FOUND: src/game/systems/NPCManager.js
- FOUND: .planning/phases/33-world-zones/33-01-SUMMARY.md
- FOUND commit: 77e3d1b (Task 1)
- FOUND commit: d3efcd5 (Task 2)
- FOUND commit: e1b21f5 (Task 3)
