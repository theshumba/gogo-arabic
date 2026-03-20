---
phase: 55-mini-games-content-polish
plan: 02
subsystem: calligraphy-mini-game
tags: [phaser-scene, pointer-input, frechet-distance, arabic-letters, mini-game]
dependency_graph:
  requires:
    - src/utils/eventBus.js
    - src/utils/eventBusTypes.js
    - Phaser 3 (already installed)
  provides:
    - src/game/scenes/CalligraphyScene.js
    - src/utils/frechetDistance.js
    - src/data/calligraphyPaths.json
  affects:
    - src/utils/eventBusTypes.js (CALLIGRAPHY_STROKE_COMPLETE + CALLIGRAPHY_SCENE_EXIT events added)
    - 55-03 will register CalligraphyScene dynamically and wire MiniGamesHub
tech_stack:
  added: []
  patterns:
    - Lazy Phaser scene (not in gameConfig.scene[], registered dynamically at runtime)
    - Scene-level pointer input (this.input.on() not game.input.on())
    - Dynamic JSON import inside async create() to keep data out of initial bundle
    - Arc-length path resampling + discrete Frechet distance DP algorithm
key_files:
  created:
    - src/game/scenes/CalligraphyScene.js
    - src/utils/frechetDistance.js
    - src/data/calligraphyPaths.json
  modified:
    - src/utils/eventBusTypes.js
decisions:
  - id: dynamic-json-import-in-create
    decision: calligraphyPaths.json loaded via dynamic import() inside async create()
    rationale: Keeps the 28-letter reference paths out of the initial bundle per CALL-01; scene is already lazy-registered so async create() is acceptable
  - id: ara-length-resampling-64pts
    decision: Both player and reference paths resampled to 64 points before Frechet comparison
    rationale: Prevents path-density mismatch (Pitfall 2); 64 is sufficient for single-stroke letters
  - id: scene-level-pointer-events
    decision: this.input.on() used for all pointer listeners (not game.input.on())
    rationale: Phaser destroys scene input plugin on scene stop, preventing listener leaks (Pitfall 4)
  - id: float32array-memo-table
    decision: Frechet DP memo table uses Float32Array(m*n)
    rationale: Minimizes GC pressure for ~64x64 = 4096 cell comparisons per stroke
metrics:
  duration_minutes: 20
  completed_date: "2026-03-20"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 55 Plan 02: CalligraphyScene and Reference Paths Summary

**One-liner:** Lazy Phaser scene with scene-level pointer stroke capture, Frechet distance scoring via arc-length resampled paths, and 28 normalized Arabic letter reference paths.

---

## What Was Built

### Task 1: CalligraphyScene.js + frechetDistance.js (commit eee7d7d)

**`src/utils/frechetDistance.js`** — Pure utility module, no side effects:
- `resamplePath(path, targetCount=64)`: arc-length parameterization + linear interpolation; handles empty/single-point edge cases
- `discreteFrechetDistance(P, Q)`: O(mn) DP algorithm using `Float32Array(m*n)` for memo table; returns `Infinity` for empty paths

**`src/game/scenes/CalligraphyScene.js`** — 297-line lazy Phaser scene:
- `super({ key: 'CalligraphyScene' })` — NOT in `gameConfig.scene[]`
- `init(data)` accepts `{ letterId, returnSceneKey }`
- `async create()` — background, dynamic JSON import, reference path display (faint guide overlay), player stroke layer, header text, Back/Clear buttons
- Scene-level pointer input (`this.input.on()`) — pointerdown resets stroke, pointermove draws gold segment, pointerup scores stroke if >= 5 points
- `_normalize(x, y)` maps screen coords to 0-1 drawing area (10% x-padding, 15% top header, 75% height)
- `_onStrokeComplete()` — resample both paths to 64pts, compute Frechet distance, map to 1-3 stars, emit `CALLIGRAPHY_STROKE_COMPLETE`, auto-clear after 2s
- `_exitScene()` emits `CALLIGRAPHY_SCENE_EXIT` and calls `this.scene.stop()`

**`src/utils/eventBusTypes.js`** updated with:
- `CALLIGRAPHY_STROKE_COMPLETE: 'phaser:calligraphy:stroke-complete'`
- `CALLIGRAPHY_SCENE_EXIT: 'phaser:calligraphy:scene-exit'`

### Task 2: calligraphyPaths.json (commit 1859685)

**`src/data/calligraphyPaths.json`** — 28 isolated Arabic letter reference stroke paths:
- Keys: alif, ba, ta, tha, jim, hha, kha, dal, dhal, ra, zay, sin, shin, sad, dad, tta, dhha, ain, ghain, fa, qaf, kaf, lam, mim, nun, haa, waw, ya
- Each entry: `{ letterId, unicode, nameArabic, nameEnglish, referencePath: [{x, y}...] }`
- All coordinates normalized to 0-1; Arabic right-to-left strokes authored accordingly (x: high → low)
- Point counts: 16 minimum (ra, zay), up to 37 (sin, shin) — all above 15-point requirement
- Geometric approximations authored per isolated letter form only (positional forms deferred to v12.0 per REQUIREMENTS.md)

---

## Verification Results

All acceptance criteria met:

| Check | Result |
|-------|--------|
| CalligraphyScene.js exists, class defined, key set | PASS |
| pointerdown / pointermove / pointerup listeners | PASS |
| CalligraphyScene NOT in config.js scene[] | PASS |
| frechetDistance.js exports resamplePath + discreteFrechetDistance | PASS |
| frechetDistance.js contains Float32Array | PASS |
| calligraphyPaths.json exists, 28 entries | PASS |
| All 28 entries: letterId, unicode, referencePath | PASS |
| All referencePaths >= 15 points | PASS (min=16) |
| All x,y values in [0, 1] | PASS |
| alif unicode = \u0627 | PASS |
| ya unicode = \u064a | PASS |
| npm run build succeeds | PASS |

---

## Deviations from Plan

**1. [Rule 2 - Missing] Added CALLIGRAPHY events to eventBusTypes.js**
- Found during: Task 1
- Issue: CalligraphyScene.js references EVENTS.CALLIGRAPHY_STROKE_COMPLETE and EVENTS.CALLIGRAPHY_SCENE_EXIT which did not exist in eventBusTypes.js
- Fix: Added both constants to the EVENTS object in eventBusTypes.js following the established `source:category:action` naming convention
- Files modified: src/utils/eventBusTypes.js
- Commit: eee7d7d

**2. [Rule 1 - Bug] Fixed ra and zay path point counts**
- Found during: Task 2 verification
- Issue: ra and zay initially had 13 points each (below 15-point minimum per acceptance criteria)
- Fix: Extended both paths to 16 points by adding interpolated waypoints along the natural stroke arc
- Files modified: src/data/calligraphyPaths.json
- Commit: 1859685

---

## Self-Check: PASSED

- FOUND: src/game/scenes/CalligraphyScene.js
- FOUND: src/utils/frechetDistance.js
- FOUND: src/data/calligraphyPaths.json
- FOUND: commit eee7d7d (Task 1)
- FOUND: commit 1859685 (Task 2)

---

## What 55-03 Receives

- CalligraphyScene importable via `import { CalligraphyScene } from '../game/scenes/CalligraphyScene.js'`
- Register with: `game.scene.add('CalligraphyScene', CalligraphyScene, false)` (dynamic, not in config)
- Launch with: `sceneStackManager.pushScene('CalligraphyScene', { letterId, returnSceneKey })`
- calligraphyPaths.json keys to use as `letterId` values
- CALLIGRAPHY_STROKE_COMPLETE event provides `{ letterId, stars, frechetDistance }` for alphabetSlice progress
