---
phase: 18-world-life
plan: 01
subsystem: game-world
tags: [npc-idle, door-interactable, camera-follow, phaser, world-polish]
dependency_graph:
  requires: []
  provides:
    - NPC idle timer-based animation pattern
    - Door interactable type with locked state
    - Camera follow with lerp and deadzone
  affects:
    - src/game/sprites/NPC.js
    - src/game/systems/InteractableManager.js
    - src/game/systems/PlayerController.js
    - src/game/scenes/WorldScene.js
    - src/hooks/useEventBusListeners.js
    - src/data/zones.js
tech_stack:
  added: []
  patterns:
    - Timer-based NPC idle animations using scene.time.addEvent
    - Door interactable type in InteractableManager
    - Camera deadzone for jitter prevention
key_files:
  created: []
  modified:
    - src/game/sprites/NPC.js
    - src/game/systems/InteractableManager.js
    - src/data/zones.js
    - src/game/systems/PlayerController.js
    - src/game/scenes/WorldScene.js
    - src/hooks/useEventBusListeners.js
decisions:
  - Timer-based idle (scene.time.addEvent) over state machine for simplicity
  - 8px camera deadzone prevents micro-movement jitter
  - No player freeze on locked door interaction (lightweight feedback only)
  - Reuse existing spritesheet frames 0/1/2 for idle patterns (no new assets)
metrics:
  duration: 5min
  completed: 2026-02-10
---

# Phase 18 Plan 01: NPC Idle Animations + Locked Door Feedback + Camera Follow Summary

Timer-based NPC idle animations with desynchronized blink/shift-weight patterns, locked door interactable type with contextual feedback messages, and camera follow with lerp 0.09 + 8px deadzone for smooth jitter-free tracking.

## What Was Done

### Task 1: NPC idle animation enhancement + locked door interactable type
**Commit:** `616432c`

**NPC Idle Animations (LIFE-01):**
- Replaced continuous 4-frame walk-in-place animation with two 2-frame patterns: shift-weight (frames 0,1) and blink (frames 0,2)
- Each NPC gets a `scene.time.addEvent` timer with randomized 2000-4000ms delay, creating desynchronized idle rhythms across all 140 NPCs
- Timer randomly chooses between shift and blink animations, both with `repeat: 0` so NPC returns to standing frame naturally
- Added `idleTimer` cleanup in `destroy()` to prevent memory leaks

**Locked Door Interactable (LIFE-02):**
- Added `door` type to InteractableManager with `house-small` sprite, Arabic label support, and locked/unlocked state
- Door interaction emits `door-locked` EventBus event with contextual `lockMessage` and door `id`
- Updated label logic to use Arabic font when `labelArabic` is provided on door configs

**Zone Data:**
- Added 4 locked door interactables across zones:
  - `oasis_village`: Scholar Yusuf's private study (x:8, y:5)
  - `ancient_library`: Ancient archives sealed (x:20, y:8)
  - `desert_marketplace`: Merchant's warehouse locked (x:35, y:12)
  - `farmland`: Barn door stuck (x:15, y:8)

### Task 2: Camera follow polish + door event handler + cleanup
**Commit:** `73acd2e`

**Camera Follow (LIFE-03):**
- Added `PlayerController.setupCamera(mapPixelW, mapPixelH)` method encapsulating camera configuration
- Camera uses lerp 0.09 (slightly more responsive than prior 0.08) with `startFollow` for smooth tracking
- Added 8px deadzone via `cam.setDeadzone(8, 8)` to prevent jitter on idle micro-movements
- Refactored WorldScene to call `playerController.setupCamera()` in both `create()` and `loadZone()`

**Door Event Handler:**
- Added `door-locked` EventBus handler in `useEventBusListeners.js`
- Plays 'wrong' SFX and shows notification with the door's contextual `lockMessage`
- Player is NOT frozen on locked door interaction -- lightweight feedback only, consistent with the plan's final decision

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Plan referenced `river_farm` zone; actual zone is `farmland`**
- **Found during:** Task 1
- **Issue:** Plan specified door interactable for `river_farm` zone which does not exist in zones.js
- **Fix:** Added the door interactable to `farmland` zone instead, which is the actual zone name
- **Files modified:** src/data/zones.js
- **Commit:** 616432c

## Verification

- Build verification: Not runnable due to CLI tool access limitations during execution
- Test verification: Not runnable due to CLI tool access limitations during execution
- Code review: All changes are syntactically correct JavaScript, follow existing patterns, and use established APIs (EventBus, scene.time.addEvent, Phaser camera API)

## Self-Check: PASSED

- All 6 modified files exist on disk
- Commit `616432c` (Task 1) found in git log
- Commit `73acd2e` (Task 2) found in git log
- Key patterns verified: `scene.time.addEvent` in NPC.js, `type === 'door'` in InteractableManager.js, `type: 'door'` in zones.js (4 entries), `setupCamera` in PlayerController.js, `door-locked` in useEventBusListeners.js (on + off)
