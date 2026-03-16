---
phase: 33-world-zones
plan: 03
subsystem: npc
tags: [phaser, npc-schedules, time-system, day-night-cycle, bgm, audio, react-hooks]

# Dependency graph
requires:
  - phase: 33-world-zones
    plan: 01
    provides: "ScheduleEvaluator.evaluateSchedule, NPC_DATA_MAP, _scheduleEntry on spawned sprites"
  - phase: 33-world-zones
    plan: 02
    provides: "NPC.startWander, NPC.startPatrol, NPC.stopMovement — movement methods for phase-change tween callbacks"
  - phase: 31-crafting
    provides: "TimeSystem, timeSlice, selectTimePhase, TIME_PHASES, TIME_PHASE_CHANGED event"
provides:
  - "NPCManager._onPhaseChanged: hides/shows/tweens NPCs when time phase transitions"
  - "ZONE_NIGHT_BGM_MAP in audioConfig.js for all 8 zones"
  - "Night BGM switching in useZoneEvents on TIME_PHASE_CHANGED"
  - "Time-aware BGM selection on zone change (day vs night tracks)"
affects: [33-world-zones (plans 04+), audio-system, npc-schedules, time-driven-behavior]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "EventBus.on/off with context binding (this) in Phaser class constructors for TIME_PHASE_CHANGED"
    - "Guard pattern: check this.npcs.length before processing phase changes (prevents crash on initial fire)"
    - "Tween-to-new-location on phase change (2s Linear) then restart behavior in onComplete callback"
    - "Time-aware BGM selection: check selectTimePhase before choosing ZONE_BGM_MAP vs ZONE_NIGHT_BGM_MAP"
    - "React hook TIME_PHASE_CHANGED listener co-located with ZONE_CHANGE handler in useZoneEvents"

key-files:
  created: []
  modified:
    - src/game/systems/NPCManager.js
    - src/data/audioConfig.js
    - src/hooks/useZoneEvents.js

key-decisions:
  - "NPCManager registers TIME_PHASE_CHANGED in constructor and deregisters in destroy() — follows DayNightCycle.js EventBus pattern"
  - "Tween duration 2s (not instant teleport) — smooth visual transition when NPCs relocate at phase change"
  - "body.enable = false when hiding NPCs — fully disables physics for hidden NPCs, no collision ghost"
  - "handlePhaseChanged defined inside useEffect (not useCallback) — matches existing hook pattern in file"
  - "ZONE_NIGHT_BGM_MAP track names follow {zone-short}-night convention — files do not exist yet, audioManager silently skips via onloaderror"

patterns-established:
  - "NPC phase-change pattern: evaluateSchedule -> hide/show -> tween + restart behavior"
  - "Time-aware BGM pattern: selectTimePhase from store at every BGM selection point"
  - "Night ambient naming: {zone-short}-night (oasis-night, library-night, etc.)"

# Metrics
duration: 2min
completed: 2026-03-16
---

# Phase 33 Plan 03: Time Phase NPC Re-evaluation + Night BGM Summary

**NPCManager._onPhaseChanged handler hides/tweens scheduled NPCs on time transitions, plus ZONE_NIGHT_BGM_MAP for all 8 zones with time-aware BGM switching in useZoneEvents**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-16T14:51:04Z
- **Completed:** 2026-03-16T14:53:16Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added TIME_PHASE_CHANGED listener to NPCManager constructor with proper EventBus.off cleanup in destroy() — NPCs with schedules are re-evaluated when time transitions occur
- _onPhaseChanged hides NPCs with no matching schedule entry (physics body disabled), and tweens visible NPCs 2s to their new schedule location before restarting wander/patrol/static behavior
- Added ZONE_NIGHT_BGM_MAP export to audioConfig.js covering all 8 zones with `{zone-short}-night` track names; missing files handled gracefully by existing audioManager.playBGM onloaderror
- useZoneEvents.js handleZoneChange is now time-aware (uses night BGM if phase === 'night'), and a new handlePhaseChanged listener switches BGM whenever time crosses into/out of night

## Task Commits

Each task was committed atomically:

1. **Task 1: Add schedule re-evaluation on TIME_PHASE_CHANGED to NPCManager** - `f7d7114` (feat)
2. **Task 2: Add ZONE_NIGHT_BGM_MAP and night BGM switching** - `45a906a` (feat)

**Plan metadata:** (docs commit — see final_commit step)

## Files Created/Modified

- `src/game/systems/NPCManager.js` - Added TIME_PHASE_CHANGED listener in constructor, _onPhaseChanged method (67 lines), EventBus.off in destroy()
- `src/data/audioConfig.js` - Added ZONE_NIGHT_BGM_MAP export for all 8 zones
- `src/hooks/useZoneEvents.js` - Added ZONE_NIGHT_BGM_MAP import + selectTimePhase import; made handleZoneChange time-aware; added handlePhaseChanged listener with cleanup

## Decisions Made

- **body.enable = false for hidden NPCs:** Fully disables physics collisions for NPCs that are hidden at night — prevents invisible collision walls in the scene.
- **Tween 2s Linear on phase change:** Smooth relocation rather than instant teleport matches the gradual day-night transition aesthetic.
- **handlePhaseChanged defined inside useEffect:** Consistent with existing handleZoneChange, handleZoneTransition, handleFastTravel pattern — no useCallback needed.
- **ZONE_NIGHT_BGM_MAP track names don't exist yet:** Intentional. audioManager.playBGM silently skips missing files via onloaderror. Night ambient files can be added incrementally.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Living world system is complete: NPCs appear/disappear/relocate as day turns to night (plans 01+02+03)
- Night ambient audio infrastructure in place — audio team can add `bgm-{zone}-night.mp3` files to `public/assets/audio/bgm/` to activate night sounds without code changes
- Phase 33 plan 04+ can focus on zone-specific ambient effects, weather integration, or expanding schedules to remaining 38 NPCs

---
*Phase: 33-world-zones*
*Completed: 2026-03-16*

## Self-Check: PASSED

- FOUND: src/game/systems/NPCManager.js
- FOUND: src/data/audioConfig.js
- FOUND: src/hooks/useZoneEvents.js
- FOUND: .planning/phases/33-world-zones/33-03-SUMMARY.md
- FOUND commit: f7d7114 (Task 1 - NPCManager TIME_PHASE_CHANGED handler)
- FOUND commit: 45a906a (Task 2 - ZONE_NIGHT_BGM_MAP + night BGM switching)
