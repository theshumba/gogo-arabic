---
phase: 41-characters-ambient-life
plan: 03
subsystem: ui
tags: [phaser, kenmi, sprites, battle, enemies, ambient-life, animation]

# Dependency graph
requires:
  - phase: 41-01
    provides: NPC_KEY_MAP, Kenmi sprite pipeline, spawnAmbientAnimals() + _createAnimalAnimations() in MapLoader.js
  - phase: 41-02
    provides: FEMALE_NPC_IDS, hijab overlay — confirmed Kenmi sprite system working end-to-end

provides:
  - ENEMY_KENMI_MAP (19 enemy IDs mapped to 5 Kenmi desert warrior/mummy sprites) exported from spriteKeyMap.js
  - BattleSpriteManager._createKenmiBattleAnims() for walk-cycle-based battle animations on 16x16 Kenmi sprites
  - Kenmi fallback path in spawnEnemies() — 6x scale, idle/attack/hurt/defend/cast/victory/defeat anims
  - BattleScene.preload() skips 256x256 load when Kenmi texture already available
  - spawnAmbientAnimals() enabled in all desert-themed zones (uncommented call)
  - Desert-zone-only guard in spawnAmbientAnimals() — non-desert biomes skip animal spawning
  - safeFrames() helper in _createAnimalAnimations() — bounds frame indices to actual spritesheet count

affects:
  - Phase 43 cleanup (confirms Kenmi battle/animal system works before placeholder removal)
  - Any future battle sprite additions (uses ENEMY_KENMI_MAP pattern)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Kenmi fallback pattern in battle — check `!textures.exists(battleKey)` before trying Kenmi, preserves 256x256 path for future art
    - Walk-cycle row mapping for battle anims — row 0 (down, frames 0-2) = idle, row 2 (right, frames 24-26) = attack, row 3 (up, frames 36-38) = cast
    - safeFrames() defensive helper — `Object.keys(tex.frames).length - 1` for actual count, Math.min to bound requested count

key-files:
  created: []
  modified:
    - src/data/spriteKeyMap.js
    - src/game/systems/battle/BattleSpriteManager.js
    - src/game/scenes/BattleScene.js
    - src/game/systems/MapLoader.js

key-decisions:
  - "ENEMY_KENMI_MAP uses actual enemy IDs from enemies.js — plan had some wrong IDs (knowledge-keeper vs keeper-of-words, sand-bandit doesn't exist); all 19 actual enemy IDs mapped"
  - "useKenmi check requires all three: kenmiKey exists in map, Kenmi texture loaded, 256x256 battle texture NOT loaded — ensures Kenmi is only fallback"
  - "Kenmi battle sprites scaled 6x (16px * 6 = 96px) — visible at battle scene resolution; 256x256 remain at 2x"
  - "_createKenmiBattleAnims uses walk-cycle rows: idle=walk-down(0-2), attack=walk-right(24-26), cast=walk-up(36-38) — semantically mapped to character movement direction"
  - "safeFrames() subtracts 1 from Object.keys(tex.frames).length to account for __BASE pseudo-frame in Phaser texture registry"
  - "Desert-zone guard checks zone.tilesetTheme, defaults to 'desert' if missing — matches existing biome dispatch pattern in MapLoader"

patterns-established:
  - "Enemy Kenmi fallback pattern: check !textures.exists(battleKey) to confirm 256x256 is unavailable — ensures Kenmi never overrides real battle art"
  - "safeFrames defensive helper: reusable pattern for any Kenmi animation with uncertain frame counts"

requirements-completed: [CHAR-04, ANIM-01, ANIM-02, ANIM-03, ANIM-04]

# Metrics
duration: 5min
completed: 2026-03-18
---

# Phase 41 Plan 03: Enemy Kenmi Sprites + Ambient Animals Summary

**ENEMY_KENMI_MAP (19 enemies) + Kenmi battle fallback with walk-cycle anims + ambient camels/vultures/scarabs enabled in desert zones**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-18T01:41:40Z
- **Completed:** 2026-03-18T01:46:40Z
- **Tasks:** 2 (+ checkpoint:human-verify pending)
- **Files modified:** 4

## Accomplishments
- Exported `ENEMY_KENMI_MAP` from `spriteKeyMap.js` — maps all 19 actual enemy IDs to 5 Kenmi desert warrior/mummy sprite keys with variant rotation for visual diversity
- Added `_createKenmiBattleAnims()` to `BattleSpriteManager` — creates idle (walk-down), attack (walk-right lunge), hurt (quick flash), defend (brace), cast (walk-up), victory, defeat animations from Kenmi 12-col x 20-row spritesheets
- Updated `spawnEnemies()` to detect and use Kenmi fallback at 6x scale when 256x256 battle sprites are missing
- Updated `BattleScene.preload()` to skip 256x256 load when Kenmi texture already loaded (eliminates 404 console errors)
- Uncommented `spawnAmbientAnimals()` call in `MapLoader.loadZone()` — enables camels (2-3), vultures (1-2), scarabs (2-4) in all desert zones
- Added desert-zone-only guard — non-desert biomes (grass, snow, dungeon, volcano, mushroom) skip animal spawning
- Added `safeFrames()` helper in `_createAnimalAnimations()` — prevents animation errors when spritesheet has fewer frames than expected

## Task Commits

Each task was committed atomically:

1. **Task 1: Add ENEMY_KENMI_MAP and wire Kenmi enemy sprites into battle system** - `8a848df` (feat)
2. **Task 2: Enable ambient animals in desert zones** - `b653fa7` (feat)

## Files Created/Modified
- `src/data/spriteKeyMap.js` — Added `ENEMY_KENMI_MAP` export (19 enemy IDs → 5 Kenmi keys)
- `src/game/systems/battle/BattleSpriteManager.js` — Added `import ENEMY_KENMI_MAP`, updated `spawnEnemies()` with Kenmi fallback path, added `_createKenmiBattleAnims()` method
- `src/game/scenes/BattleScene.js` — Added `import ENEMY_KENMI_MAP`, updated `preload()` to skip 256x256 when Kenmi available
- `src/game/systems/MapLoader.js` — Uncommented `spawnAmbientAnimals()` call, added desert-zone guard, added `safeFrames()` helper in `_createAnimalAnimations()`

## Decisions Made
- All 19 actual enemy IDs mapped (plan had 9 wrong IDs — corrected against real enemies.js data)
- Kenmi battle sprites at 6x scale (16 * 6 = 96px) — large enough to read at battle scene resolution
- `safeFrames()` uses `Object.keys(tex.frames).length - 1` to account for Phaser's `__BASE` pseudo-frame
- Desert-zone guard uses `zone.tilesetTheme || 'desert'` matching the existing biome dispatch convention

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected enemy IDs in ENEMY_KENMI_MAP**
- **Found during:** Task 1
- **Issue:** Plan's sample ENEMY_KENMI_MAP had wrong enemy IDs: `knowledge-keeper` (should be `keeper-of-words`), `sand-bandit`, `market-djinn`, `crop-pest`, `water-serpent`, `harvest-spirit`, `desert-wolf`, `sand-viper`, `storm-elemental`, `ice-djinn`, `mountain-troll`, `frost-wraith`, `sea-raider`, `reef-spirit`, `kraken-spawn`, `palace-guard-shadow`, `cursed-vizier`, `throne-guardian` — none of these exist in enemies.js
- **Fix:** Read enemies.js first, mapped all 19 actual enemy IDs: sand-scarab, dust-sprite, oasis-guardian, ink-wraith, scroll-golem, keeper-of-words, sand-djinn, mirage-thief, merchant-prince, sea-serpent, storm-caller, tide-lord, palace-sentinel, shadow-vizier, thorn-vine, blossom-spirit, rock-elemental, wind-hawk, mountain-elder
- **Files modified:** `src/data/spriteKeyMap.js`
- **Committed in:** 8a848df (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug: wrong enemy IDs in plan's sample map)
**Impact on plan:** Essential correction — using wrong IDs would mean ENEMY_KENMI_MAP entries never match actual enemies encountered in battle. No scope creep.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- CHAR-04: Enemy sprites now use Kenmi Desert Warriors/Mummy as fallback in battle (all 19 enemies mapped)
- ANIM-01: Camels (3 variants, 2-3 per zone) with idle animation enabled
- ANIM-02: Vultures (4 variants, 1-2 per zone) with flying animation enabled
- ANIM-03: Scarabs (4 variants, 2-4 per zone) with crawl animation near water
- ANIM-04: Animals are purely decorative (scene.add.sprite, no physics body)
- Phase 41 plans 41-01, 41-02, 41-03 all shipped — awaiting checkpoint:human-verify
- Phase 43 (cleanup/placeholder removal) can proceed after checkpoint approval

## Self-Check: PASSED

All expected files verified:
- `src/data/spriteKeyMap.js` contains `ENEMY_KENMI_MAP` export
- `src/game/systems/battle/BattleSpriteManager.js` contains import, spawnEnemies Kenmi path, `_createKenmiBattleAnims`
- `src/game/scenes/BattleScene.js` contains import and Kenmi preload guard
- `src/game/systems/MapLoader.js` contains uncommented call, tilesetTheme guard, safeFrames helper

Commits 8a848df and b653fa7 verified in git log.

---
*Phase: 41-characters-ambient-life*
*Completed: 2026-03-18*
