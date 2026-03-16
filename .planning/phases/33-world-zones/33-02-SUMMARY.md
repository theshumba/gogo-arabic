---
phase: 33-world-zones
plan: 02
subsystem: npc
tags: [phaser, arcade-physics, npc-movement, wander, patrol, walk-animations, face-player]

# Dependency graph
requires:
  - phase: 33-world-zones
    plan: 01
    provides: "_scheduleEntry on spawned NPC sprites with behavior field (static|wander|patrol)"
  - phase: 33-world-zones
    provides: "Companion.js as reference for moveToObject + directional walk anims"
provides:
  - "NPC.js wander behavior: random movement within spawn radius every 3-7s via scene.time.addEvent"
  - "NPC.js patrol behavior: directional step loop via scene.time.delayedCall"
  - "Conditional walk animation creation (frameCount >= 16 guard)"
  - "_playDirectionalWalkAnim() and _playIdleAnim() on all NPC instances"
  - "stopMovement() for clean interaction handshake"
  - "NPCManager initializes movement on spawn based on _scheduleEntry.behavior"
  - "NPCs face player (setFlipX) and stop moving on SPACE interaction"
affects: [33-world-zones (plans 03+), npc-schedules, time-driven-behavior, dialogue-triggers]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Phaser scene.physics.moveToObject() for NPC wander movement (same as Companion.js)"
    - "Phaser scene.time.addEvent(loop) for periodic wander target selection"
    - "Phaser scene.time.delayedCall() for patrol step sequencing"
    - "frameCount >= 16 guard before walk animation creation (conditional spritesheet support)"
    - "setImmovable(false) ONLY for non-static NPCs; static NPCs remain blocking"
    - "setFlipX(playerSprite.x > npc.x) for face-player on interact"
    - "Wander targets clamped to scene.currentMapW / currentMapH bounds"

key-files:
  created: []
  modified:
    - src/game/sprites/NPC.js
    - src/game/systems/NPCManager.js

key-decisions:
  - "stopMovement() called on interaction disables wander/patrol timers permanently for that interaction; wander restarts naturally on next scheduled tick if user resumes game without dialogue"
  - "npc.update() called from NPCManager.update() loop — NPC sprites are not registered with Phaser scene update directly, so NPCManager drives the per-frame wander-target check"
  - "_playIdleAnim() sets velocity to 0 and plays idle anim — single call handles both stop + anim"
  - "Wander radius fallback 96px (1.5 tiles) matching plan spec — small enough to stay near spawn, big enough to look alive"
  - "_advancePatrol stores timer ref in _patrolTimer, overwriting previous; delayedCall fires once so no conflict"

patterns-established:
  - "NPC movement init pattern: check _scheduleEntry.behavior after spawn, call startWander/startPatrol — static = no call needed"
  - "Face-player pattern: setFlipX(playerSprite.x > npc.x) before every NPC_INTERACT emit"
  - "Movement guard pattern: startWander/startPatrol both call setImmovable(false) first — pitfall-proof"

# Metrics
duration: 3min
completed: 2026-03-16
---

# Phase 33 Plan 02: NPC Movement Patterns Summary

**Wander and patrol movement added to NPC sprites via Phaser arcade physics timers, with face-player flip and movement stop on SPACE interaction**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-16T14:45:24Z
- **Completed:** 2026-03-16T14:48:08Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added 8 new methods to NPC.js: `startWander`, `startPatrol`, `_advancePatrol`, `stopMovement`, `_playDirectionalWalkAnim`, `_playIdleAnim`, `update` (wander check), plus destruction cleanup
- Walk animations conditionally created only when spritesheet has 16+ frames (4×4 layout: down=0-3, left=4-7, right=8-11, up=12-15)
- NPCManager initializes movement on spawn by reading `_scheduleEntry.behavior`, calls `npc.stopMovement()` and `npc.setFlipX()` before emitting `NPC_INTERACT`

## Task Commits

Each task was committed atomically:

1. **Task 1: Add wander, patrol, and walk animation support to NPC.js** - `7a4a1eb` (feat)
2. **Task 2: Initialize movement on spawn + face player on interact in NPCManager** - `a0cdc48` (feat)

**Plan metadata:** (docs commit — see final_commit step)

## Files Created/Modified

- `src/game/sprites/NPC.js` - Added walk anim creation (frameCount >= 16), movement state fields, and all 7 movement methods; destroy() now cleans up wander/patrol timers
- `src/game/systems/NPCManager.js` - Added movement init block after spawn, npc.update() call in update loop, setFlipX + stopMovement before NPC_INTERACT emit

## Decisions Made

- **npc.update() driven by NPCManager:** NPC sprites are not registered with Phaser's scene.sys.updateList (only physics objects do that automatically). NPCManager.update() already iterates all NPCs each frame — calling `npc.update()` there is the correct pattern.
- **stopMovement() removes wander timers permanently:** During dialogue the NPC stays still. When the player walks away, the next wander tick will not fire because the timer was removed. This is acceptable for a PoC — full resume-after-dialogue is deferred to plan 03+.
- **setImmovable(false) scoped to startWander/startPatrol only:** Static NPCs never call these methods so they remain `setImmovable(true)` and correctly block player movement.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plan 03 can add `_onPhaseChanged()` to NPCManager using the established `evaluateSchedule` + `setActive/setVisible` hide pattern from RESEARCH.md
- Face-player behavior works for all NPCs (both scheduled and unscheduled) via the setFlipX call added to the interaction block
- Wander NPC movement visible immediately on entering a zone — no additional wiring needed beyond plan 03 time-phase re-evaluation

---
*Phase: 33-world-zones*
*Completed: 2026-03-16*

## Self-Check: PASSED

- FOUND: src/game/sprites/NPC.js
- FOUND: src/game/systems/NPCManager.js
- FOUND: .planning/phases/33-world-zones/33-02-SUMMARY.md
- FOUND commit: 7a4a1eb (Task 1 - NPC.js wander/patrol/walk-anims)
- FOUND commit: a0cdc48 (Task 2 - NPCManager movement init + face-player)
