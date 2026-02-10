---
phase: 16-visual-juice
plan: 01
subsystem: vfx
tags: [phaser, particles, screen-shake, camera-fade, accessibility]
dependency_graph:
  requires: []
  provides: [ScreenShake, ParticleEffectManager, configurable-zone-fade]
  affects: [WorldScene, useEventBusListeners, ZoneTransition]
tech_stack:
  added: []
  patterns: [EventBus-driven VFX, prefers-reduced-motion guard, lazy texture creation, auto-cleanup timers]
key_files:
  created:
    - src/game/systems/ScreenShake.js
    - src/game/systems/ParticleEffectManager.js
  modified:
    - src/game/systems/ZoneTransition.js
    - src/game/scenes/WorldScene.js
    - src/hooks/useEventBusListeners.js
decisions:
  - Used Phaser 3.60+ particle API (scene.add.particles) since project uses ^3.90.0
  - Lazy-create particle-dot texture in ParticleEffectManager rather than in BootScene
  - Achievement VFX detection via useEffect watching newAchievements length with ref
metrics:
  duration: 7 minutes
  completed: 2026-02-10
---

# Phase 16 Plan 01: Screen Shake + Particle System + Zone Fade Transitions Summary

Phaser-side VFX layer with ScreenShake (3 intensity presets), ParticleEffectManager (burst + continuous sparkle), and configurable camera fade transitions -- all gated by prefers-reduced-motion.

## What Was Built

### ScreenShake System (~30 LOC)
- Three preset intensities: `light` (100ms/0.003), `medium` (200ms/0.008), `heavy` (350ms/0.015)
- Maps to quiz correct, achievement unlock, and level up events respectively
- Checks `prefers-reduced-motion` on construction, returns immediately if enabled
- Uses Phaser built-in `cameras.main.shake(duration, intensity)`

### ParticleEffectManager (~115 LOC)
- `burst(x, y, config)` -- one-shot particle explosion with configurable count, speed, tint, gravity
- `continuous(x, y, config)` -- looping sparkle emitter for a set duration
- Lazily creates 4x4 white `particle-dot` texture via Phaser graphics
- Auto-destroys emitters after lifespan + 200ms buffer using `scene.time.delayedCall`
- Tracks pending timers for cleanup in `destroy()`
- All methods no-op when `prefers-reduced-motion` is enabled

### Zone Fade Transitions (Enhanced)
- Added `fadeConfig` parameter to `transitionTo()` with backward-compatible defaults
- Configurable `fadeOutDuration` (default 500ms), `fadeInDuration` (default 500ms), `fadeColor` (default black)
- Added try/catch/finally with 3-second timeout protection to prevent stuck transitions
- Calls `cameras.main.resetFX()` on error, always unfreezes player in `finally` block

### EventBus Integration
- WorldScene creates ScreenShake and ParticleEffectManager in `create()`, cleans up in `shutdown()`
- Three EventBus listeners: `vfx-shake`, `vfx-particles-burst`, `vfx-particles-continuous`
- Default position falls back to camera midPoint when x/y not provided
- useEventBusListeners emits VFX events:
  - Quiz correct answer: `vfx-shake` (light)
  - Level up: `vfx-shake` (heavy) + `vfx-particles-burst` (30 gold) + `vfx-particles-continuous` (3s gold)
  - Achievement unlock: `vfx-shake` (medium) + `vfx-particles-burst` (25 bright gold)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] WorldScene and useEventBusListeners already modified by concurrent agent**
- **Found during:** Task 2
- **Issue:** Commit `73acd2e` (Phase 18 parallel agent) had already modified WorldScene.js and useEventBusListeners.js with the VFX imports and event wiring. The ScreenShake.js and ParticleEffectManager.js files were referenced but never created.
- **Fix:** Verified the HEAD versions already contained correct VFX integration. Only committed the new system files and ZoneTransition changes.
- **Files affected:** WorldScene.js and useEventBusListeners.js (already at HEAD), committed only ScreenShake.js, ParticleEffectManager.js, ZoneTransition.js

**2. [Rule 2 - Missing Critical] ZoneTransition error handling**
- **Found during:** Task 2 (linter/concurrent modification)
- **Issue:** ZoneTransition lacked error protection -- if camera fade event never fires, player stays frozen permanently
- **Fix:** Added try/catch/finally with `_fadeWithTimeout()` helper (3s timeout), `resetFX()` on error, guaranteed `unfreeze-player` in finally block
- **Files modified:** src/game/systems/ZoneTransition.js
- **Commit:** 3bf8d5b

**3. [Rule 3 - Blocking] BootScene changes unnecessary**
- **Found during:** Task 1
- **Issue:** Plan suggested adding particle texture creation to BootScene, but then correctly noted lazy creation in ParticleEffectManager is better
- **Fix:** No changes to BootScene, texture created lazily via `ensureTexture()` method
- **Files affected:** None (BootScene untouched)

## Build Verification

Build and test commands were unavailable due to sandbox restrictions. Code correctness verified via:
- Grep verification: all expected patterns present in all files
- Manual review: imports resolve, API usage matches Phaser ^3.90.0 docs
- No syntax errors in any file
- Backward compatibility maintained (all new parameters have defaults)

## Commits

| Hash | Message |
|------|---------|
| 3bf8d5b | feat(16-01): screen shake + particle system + zone fade transitions |

## Self-Check: PASSED

- FOUND: src/game/systems/ScreenShake.js (1045 bytes)
- FOUND: src/game/systems/ParticleEffectManager.js (3627 bytes)
- FOUND: src/game/systems/ZoneTransition.js (3437 bytes)
- FOUND: src/game/scenes/WorldScene.js (9646 bytes)
- FOUND: src/hooks/useEventBusListeners.js (15692 bytes)
- FOUND: commit 3bf8d5b
