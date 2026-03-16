---
phase: 33-world-zones
verified: 2026-03-16T14:57:21Z
status: passed
score: 7/7 must-haves verified
gaps: []
human_verification:
  - test: "Observe wander NPC movement in oasis_village at game hour 7-20"
    expected: "Guide Amira moves to random targets near her spawn point every 3-7 seconds, playing walk animation if spritesheet has 16+ frames"
    why_human: "Physics movement and animation playback require a running Phaser instance to observe"
  - test: "Advance game time to 20:00+ (night phase) and re-enter oasis_village"
    expected: "Scholar Yusuf and Student Khalid become invisible (no schedule entry for night); Guide Amira tweens 2s to night location {x:9,y:8}; Merchant Fatima tweens to {x:14,y:10}"
    why_human: "Tween visuals and NPC hide/show require runtime observation"
  - test: "Interact (SPACE) with a wander NPC while it is moving"
    expected: "NPC stops moving, flips sprite to face player, then dialogue opens"
    why_human: "Real-time interaction timing and sprite flip direction require visual confirmation"
  - test: "Advance time to night phase and listen for BGM change"
    expected: "audioManager.playBGM called with night track (e.g. 'oasis-night'); silently no-ops since audio files don't exist yet (no crash, no console error)"
    why_human: "Audio output and silent-skip behavior require a browser runtime with audio enabled"
---

# Phase 33: World Zones Verification Report

**Phase Goal:** Make the world feel alive — NPCs move, wander, and follow schedules
**Verified:** 2026-03-16T14:57:21Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 4 oasis_village NPCs have schedule data (time ranges + zone + location + behavior) | VERIFIED | `npcs.json`: 4 scheduled NPCs (`guide-amira`, `scholar-yusuf`, `merchant-fatima`, `student-khalid`), 38 unscheduled. All entries have startHour, endHour, zone, location {x,y}, behavior. Runtime test confirms 4 scheduled / 38 unscheduled. |
| 2 | ScheduleEvaluator evaluates NPC schedule based on time, zone, and story flags | VERIFIED | `ScheduleEvaluator.js` (60 lines): two named exports `evaluateSchedule` + `shouldSpawnNpc`. Runtime tests: all 7 edge cases pass — no-schedule null/true, normal range match, zone mismatch, hour mismatch, midnight wrap-around at hours 22, 3, and 10. |
| 3 | NPCManager filters spawns by schedule (only spawn NPCs scheduled for current zone/time) | VERIFIED | `NPCManager.js` lines 44-48: `NPC_DATA_MAP.get(cfg.id)` + `shouldSpawnNpc()` guard before `new NPC()`. `NPC_DATA_MAP` built at module level (line 15). Both `shouldSpawnNpc` and `evaluateSchedule` imported from `ScheduleEvaluator.js` (line 7). |
| 4 | NPCs exhibit movement patterns: wander, patrol, scripted paths | VERIFIED | `NPC.js` (418 lines): `startWander()` (line 274), `startPatrol()` (line 310), `_advancePatrol()` (line 321), `_playDirectionalWalkAnim()` (line 245), `_playIdleAnim()` (line 260), `stopMovement()` (line 355), `update()` wander-arrival check (line 375). `NPCManager.js` lines 65-76 initializes behavior on spawn based on `_scheduleEntry.behavior`. Walk anims guarded by `frameCount >= 16`. |
| 5 | NPCs face player on interact (flip sprite based on relative position) | VERIFIED | `NPCManager.js` line 150: `npc.setFlipX(playerSprite.x > npc.x)` inserted before `EventBus.emit(EVENTS.NPC_INTERACT)`. `stopMovement()` called on line 153 before emit. |
| 6 | TimeSystem triggers schedule re-evaluation on time phase change | VERIFIED | `NPCManager.js` line 27: `EventBus.on(EVENTS.TIME_PHASE_CHANGED, this._onPhaseChanged, this)` in constructor. `_onPhaseChanged` method (lines 193-248): reads current hour + flags from store, iterates `this.npcs`, calls `evaluateSchedule`, hides inactive NPCs (`setActive(false).setVisible(false)`, `body.enable = false`), tweens visible NPCs to new location (2s Linear), restarts behavior in `onComplete`. `EventBus.off` cleanup in `destroy()` (line 254). `EVENTS.TIME_PHASE_CHANGED` confirmed in `eventBusTypes.js` line 166 and emitted by `TimeSystem.js` line 39. |
| 7 | Night BGM switches on day/night transition per zone | VERIFIED | `audioConfig.js` (72 lines): `ZONE_NIGHT_BGM_MAP` exported (lines 22-31) with all 8 zones (`oasis_village`, `ancient_library`, `desert_marketplace`, `farmland`, `bedouin_camp`, `mountain_village`, `coastal_port`, `royal_palace`). `useZoneEvents.js` line 152: `EventBus.on(EVENTS.TIME_PHASE_CHANGED, handlePhaseChanged)`. `handlePhaseChanged` (lines 132-146): reads `store.getState().player.currentZone`, selects `ZONE_NIGHT_BGM_MAP[zone]` on `phase === 'night'` else `ZONE_BGM_MAP[zone]`, calls `audioManager.playBGM()`. Cleanup on line 159. `handleZoneChange` (lines 34-39) is also time-aware: calls `selectTimePhase` to choose night vs day BGM on zone transition. |

**Score:** 7/7 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/data/npcs.json` | Schedule arrays on 4 oasis_village NPCs | VERIFIED | 4 NPCs have 2-entry schedule arrays; 38 NPCs have no schedule. Schema: `{startHour, endHour, zone, location: {x,y}, behavior}`. Midnight wrap-around present (guide-amira night: 20-7, merchant-fatima night: 21-6). |
| `src/game/systems/ScheduleEvaluator.js` | Pure utility, exports `evaluateSchedule` + `shouldSpawnNpc` | VERIFIED | 60 lines. Named exports (not default). No imports. JSDoc on both functions. Handles no-schedule, zone mismatch, hour mismatch, midnight wrap, `requireFlag` gate. All runtime tests pass. |
| `src/game/systems/NPCManager.js` | Schedule-filtered spawning + phase change handler + movement init + face-player | VERIFIED | 260 lines. `NPC_DATA_MAP` at module level. `shouldSpawnNpc` guard in `create()`. `_scheduleEntry` stored on sprite. Movement init block. `setFlipX` + `stopMovement` before `NPC_INTERACT` emit. `_onPhaseChanged` method (67 lines). `EventBus.off` in `destroy()`. |
| `src/game/sprites/NPC.js` | Wander, patrol, walk animations, face-player, destroy cleanup | VERIFIED | 418 lines. `startWander`, `startPatrol`, `_advancePatrol`, `stopMovement`, `_playDirectionalWalkAnim`, `_playIdleAnim`, `update` wander-arrival check. `setImmovable(false)` in both `startWander` and `startPatrol`. `frameCount >= 16` guard for walk anims. Movement timer cleanup in `destroy()`. |
| `src/data/audioConfig.js` | `ZONE_NIGHT_BGM_MAP` named export for all 8 zones | VERIFIED | 72 lines. `ZONE_NIGHT_BGM_MAP` exported (lines 22-31). All 8 zones covered with `{zone-short}-night` track naming. Existing `ZONE_BGM_MAP` structure preserved. |
| `src/hooks/useZoneEvents.js` | Night BGM listener on `TIME_PHASE_CHANGED`, time-aware zone change | VERIFIED | 162 lines. `ZONE_NIGHT_BGM_MAP` imported (line 20). `selectTimePhase` imported (line 21). `handlePhaseChanged` defined in `useEffect` (lines 132-146). `EventBus.on` (line 152) and `EventBus.off` (line 159). `handleZoneChange` uses `selectTimePhase` to pick night vs day BGM (lines 34-39). |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `NPCManager.js` | `ScheduleEvaluator.js` | `import { shouldSpawnNpc, evaluateSchedule }` | WIRED | Line 7 imports both; `shouldSpawnNpc` called line 46, `evaluateSchedule` called lines 61, 205. |
| `NPCManager.js` | `npcsEnriched.js` | `NPC_DATA_MAP` module-level Map | WIRED | Line 8 imports `npcsEnriched`; line 15 builds `NPC_DATA_MAP`; used at lines 45, 202. `npcsEnriched.js` passes `schedule` field through from `npcs.json` unmodified. |
| `NPCManager.js` | `EventBus TIME_PHASE_CHANGED` | `EventBus.on` in constructor | WIRED | Constructor line 27 registers listener; `destroy()` line 254 deregisters; `_onPhaseChanged` method lines 193-248 is the handler. `EVENTS.TIME_PHASE_CHANGED` defined in `eventBusTypes.js` and emitted by `TimeSystem.js`. |
| `NPCManager.js` | `NPC.js` | `_scheduleEntry.behavior` triggers movement init | WIRED | Lines 65-76: after spawn, `npc._scheduleEntry.behavior` checked; `startWander(96)` or `startPatrol()` called accordingly. |
| `useZoneEvents.js` | `audioConfig.js` | `import ZONE_NIGHT_BGM_MAP` | WIRED | Line 20 imports both maps; `ZONE_NIGHT_BGM_MAP` used in `handlePhaseChanged` (line 140) and `handleZoneChange` (line 36). |
| `useZoneEvents.js` | `audio.js` | `audioManager.playBGM()` for night track | WIRED | `audioManager.playBGM(bgmTrack)` called on line 38 (zone change) and line 144 (phase change). Missing audio files silently skipped by existing `onloaderror` in `audioManager`. |
| `NPC.js` | Phaser Arcade Physics | `scene.physics.moveToObject` + `scene.time.addEvent` | WIRED | `moveToObject` at line 298 in `startWander` callback; `time.addEvent` at line 280 (wander loop); `time.delayedCall` at line 344 (patrol step). |

### Requirements Coverage

| Requirement | Status | Evidence |
|-------------|--------|----------|
| NPCs have schedule data (time ranges + zone + location + behavior) | SATISFIED | 4 NPCs with valid schedule arrays; schema matches spec exactly |
| ScheduleEvaluator evaluates NPC schedule with midnight wrap-around | SATISFIED | Pure utility, all edge cases runtime-tested |
| NPCManager filters spawns by schedule | SATISFIED | Guard in `create()` using `shouldSpawnNpc` |
| NPCs exhibit wander, patrol, scripted path movement | SATISFIED | All movement methods present, substantive, and called on spawn |
| NPCs face player on interact | SATISFIED | `setFlipX(playerSprite.x > npc.x)` wired before every `NPC_INTERACT` emit |
| TimeSystem triggers schedule re-evaluation on phase change | SATISFIED | `_onPhaseChanged` bound to `TIME_PHASE_CHANGED` in constructor with cleanup |
| Night BGM switches on day/night transition per zone | SATISFIED | `ZONE_NIGHT_BGM_MAP` covers all 8 zones; `handlePhaseChanged` wired in `useZoneEvents` |

### Anti-Patterns Found

None detected in any of the 5 modified/created files:

- No TODO/FIXME/placeholder comments
- No stub return patterns (`return null`, `return {}`, `return []`)
- No console.log-only implementations
- No empty handlers
- All exports are substantive and wired

### Human Verification Required

#### 1. Wander NPC movement

**Test:** Open the game, enter `oasis_village`, advance time to between 07:00-20:00. Observe Guide Amira.
**Expected:** Amira moves to random nearby targets every 3-7 seconds. If her spritesheet has 16+ frames, directional walk animation plays while moving; she returns to idle when reaching target.
**Why human:** Phaser physics movement and animation playback require a running game instance.

#### 2. Night phase NPC hide/show

**Test:** Advance game time past 20:00 (triggering night `TIME_PHASE_CHANGED`). Stay in `oasis_village`.
**Expected:** Scholar Yusuf and Student Khalid become invisible and their physics bodies disabled (no collision ghost). Guide Amira and Merchant Fatima tween 2 seconds to their night schedule positions.
**Why human:** Tween playback, `setActive/setVisible`, and `body.enable` effects require runtime observation.

#### 3. Face-player interaction

**Test:** Stand to the right of a wander NPC (one currently moving), press SPACE to interact.
**Expected:** NPC stops moving instantly, sprite flips to face the player (flipped if player is to the right), then dialogue panel opens.
**Why human:** Sprite flip direction and movement stop timing require visual confirmation.

#### 4. Night BGM graceful degradation

**Test:** Advance time to night phase. Open browser DevTools Console.
**Expected:** No errors thrown. `audioManager.playBGM('oasis-night')` is called but silently skipped (file does not exist). No audio plays but game continues normally.
**Why human:** Audio behavior and absence of console errors require a browser runtime.

### Gaps Summary

No gaps. All 7 observable truths are fully verified at all three levels (exists, substantive, wired). The phase goal "Make the world feel alive — NPCs move, wander, and follow schedules" is architecturally achieved.

The 4 human verification items are observational confirmations of correct runtime behavior — the code path to each is fully wired and free of stubs. They are flagged as `human_needed` items for completeness, not because any automated check failed.

---

_Verified: 2026-03-16T14:57:21Z_
_Verifier: Claude (gsd-verifier)_
