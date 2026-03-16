---
phase: 34-data-driven-events
plan: 03
subsystem: npc
tags: [step-triggers, action-sets, event-bus, data-driven, phaser, world-scene]

# Dependency graph
requires:
  - phase: 34-data-driven-events
    provides: ActionSetExecutor.js evaluateActionSets + executeActions, ACTION_* EventBus constants (34-01)
  - phase: 34-data-driven-events
    provides: buildActionContext() in NPCManager, NPCManager actionSets.interact wiring (34-02)
provides:
  - stepTriggers array on oasis_village zone (3 proof-of-concept triggers)
  - actionContext.js shared utility — buildActionContext(zoneOverride) for any system
  - WorldScene._checkStepTriggers(player) — tile-position detection, oneShot/cooldown guards, actionSet evaluation
  - Step triggers reset on zone change (buildZone reinitializes all trigger state)
affects: [34-04+, zone-system, npc-interaction, narrative-system]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Step trigger detection: tile-position AABB check against zone.stepTriggers[] in WorldScene.update()"
    - "oneShot: tracked via in-memory Set (_stepTriggersFired), reset on zone load"
    - "cooldown: tracked via timestamp map (_stepTriggerCooldowns), reset on zone load"
    - "Shared context builder: buildActionContext(zoneOverride?) in actionContext.js — imported by both NPCManager and WorldScene"
    - "Backward compatible: zones without stepTriggers work unchanged (treated as empty array)"

key-files:
  created:
    - src/game/systems/actionContext.js
  modified:
    - src/data/zones.js
    - src/game/scenes/WorldScene.js
    - src/game/systems/NPCManager.js

key-decisions:
  - "buildActionContext extracted to shared actionContext.js — both NPCManager and WorldScene share one implementation"
  - "buildActionContext accepts optional zoneOverride — WorldScene passes this.currentZone for precise context; NPCManager passes nothing (falls back to Redux player.currentZone)"
  - "Step trigger state reset inside buildZone(), not clearZone() — state is zone-scoped; initializing at top of buildZone() before zone.stepTriggers is loaded ensures clean slate for every zone"
  - "oneShot guard also covers flagOnFire triggers — both prevent repeat fires (the flag action fires, then trigger is silenced in-memory)"
  - "3 PoC triggers on oasis_village only — pattern established, other zones deferred"

patterns-established:
  - "Zone step trigger pattern: add stepTriggers[] to zone data object with id/x/y/width/height/oneShot/cooldown/actionSets"
  - "Shared context builder: any Phaser system needing requirement evaluation imports buildActionContext from actionContext.js"

# Metrics
duration: 4min
completed: 2026-03-16
---

# Phase 34 Plan 03: Step Triggers Summary

**Invisible floor zones wired to ActionSetExecutor in WorldScene.update() via shared actionContext utility, with tile-position AABB detection, oneShot and cooldown guards, and automatic reset on zone change**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-16T15:19:09Z
- **Completed:** 2026-03-16T15:23:21Z
- **Tasks:** 2/2
- **Files modified:** 4 (1 created)

## Accomplishments
- Added 3 proof-of-concept `stepTriggers` to `oasis_village`: oasis-welcome (oneShot near spawn), marketplace-hint (30s cooldown near market), ruins-echo (oneShot at ruins entrance)
- Extracted `buildActionContext()` from NPCManager to shared `src/game/systems/actionContext.js` (accepts optional `zoneOverride` parameter)
- NPCManager updated to import from shared utility — no behavior change
- WorldScene now imports `evaluateActionSets`, `executeActions`, and `buildActionContext`
- `buildZone()` initializes `_stepTriggers`, `_stepTriggerCooldowns`, `_stepTriggersFired` and loads `zone.stepTriggers || []`
- `_checkStepTriggers(player)` checks tile-position AABB, enforces oneShot and cooldown, evaluates actionSets, fires matched actions via EventBus
- Step triggers reset automatically on every zone change via `buildZone()` re-initialization
- Build passes: 748 modules transformed, no new warnings

## Task Commits

Each task was committed atomically:

1. **Task 1: Add stepTriggers to zone data** - `31a0df7` (feat)
2. **Task 2: Add step trigger detection to WorldScene.update()** - `57cf9f1` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/data/zones.js` - stepTriggers array with 3 PoC triggers added to oasis_village
- `src/game/systems/actionContext.js` - Shared buildActionContext(zoneOverride?) utility, extracted from NPCManager
- `src/game/scenes/WorldScene.js` - Imports, _stepTrigger state in buildZone(), _checkStepTriggers() method, update() call
- `src/game/systems/NPCManager.js` - Now imports buildActionContext from actionContext.js; local definition removed

## Decisions Made
- `buildActionContext` extracted to shared util — WorldScene needed it; duplicating 10-line helper would diverge silently. Shared import is the correct pattern.
- `buildActionContext(zoneOverride)` accepts optional override — WorldScene has the authoritative `this.currentZone` at Phaser level; Redux `player.currentZone` may lag on zone transition. NPCManager omits the arg (no regression).
- Step trigger state initialized at top of `buildZone()`, before zone data is accessed — ensures `_stepTriggers = []` if the zone has none, and all cooldown/fired state is wiped clean every zone load.
- `oneShot || flagOnFire` both add to `_stepTriggersFired` — a trigger with `flagOnFire` but no explicit `oneShot: true` should still not re-fire once the flag is set; the in-memory set prevents this within the session.

## Deviations from Plan

None - plan executed exactly as written. The shared utility extraction was explicitly called for in the plan spec.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Step trigger infrastructure is complete and wired — any zone can now define `stepTriggers[]` and WorldScene will detect and fire them automatically
- `buildActionContext` is now a shared utility — any future Phaser system (e.g. GatheringSpotManager, DayNightCycle triggers) can import and use it
- 3 PoC triggers on oasis_village fire `speech`/`setFlag`/`playSound` actions via EventBus — consumers (DialogueEngine, narrativeSlice, audioManager) need to be wired in Plan 34-04+
- Build passes cleanly: 748 modules transformed, no new warnings

---
*Phase: 34-data-driven-events*
*Completed: 2026-03-16*

## Self-Check: PASSED

- FOUND: src/game/systems/actionContext.js
- FOUND: src/data/zones.js
- FOUND: src/game/scenes/WorldScene.js
- FOUND: src/game/systems/NPCManager.js
- FOUND: .planning/phases/34-data-driven-events/34-03-SUMMARY.md
- FOUND: commit 31a0df7 (Task 1)
- FOUND: commit 57cf9f1 (Task 2)
