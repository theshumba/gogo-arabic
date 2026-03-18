---
phase: 39-terrain-rendering
plan: 02
subsystem: ui
tags: [phaser3, tilemap, kenmi, pixel-art, biome, terrain, auto-tiling]

# Dependency graph
requires:
  - phase: 39-terrain-rendering-01
    provides: "_renderKenmiTiles, _renderSandTile, _renderGrassTile, _renderWaterTile, foam animation infrastructure"
  - phase: 38-asset-pipeline
    provides: "All 969 Kenmi assets loaded in BootScene including grass/water/foam spritesheets"
provides:
  - "BIOME_TILESETS config object (desert/grass/snow) in MapLoader.js"
  - "Biome parameter wired from create() through renderGroundTiles() to _renderKenmiTiles()"
  - "tilesetTheme field on all 8 main zones in zones.js"
  - "Snow biome using tinted base grass spritesheet (workaround for christmas-grass image-type limitation)"
  - "Biome-aware foam animation with unique per-biome anim key prefixes"
affects: [39-03, 40-decorations, 43-cleanup]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "BIOME_TILESETS config object drives all biome dispatch — add new biomes by extending the table"
    - "Snow biome uses kenmi-base-tiles-grass-grass-tiles-1 spritesheet + 0xaaddff/0xddeeff tints (christmas-grass is image type, cannot use frame indices)"
    - "Foam animations keyed by biome foamKey prefix to avoid cross-biome anim key collisions"
    - "Non-desert sand/grass/water use 3x3 auto-tile block at top-left of respective spritesheets"

key-files:
  created: []
  modified:
    - src/game/systems/MapLoader.js
    - src/data/zones.js

key-decisions:
  - "Snow biome: use kenmi-base-tiles-grass-grass-tiles-1 (spritesheet) with blue tint (0xaaddff for ICE_GRASS, 0xddeeff for sand paths) — kenmi-christmas-decorations-christmass-grass is cataloged as 'image' type and cannot use frame indices"
  - "Non-desert biomes use 3x3 auto-tile region at top-left of sheet (frames 0-8 for 3-col, frames 0-2/16-18/32-34 for 16-col) rather than custom per-biome frame maps"
  - "Foam animation keys prefixed with biome foamKey (sanitised) to support multiple biomes across zones without key collisions"
  - "royal_palace uses 'desert' tilesetTheme — it is a mixed biome zone (SAND+GRASS+WATER+ICE_GRASS all present), and ICE_GRASS gets its blue tint via _renderGrassTile biome-aware tint logic"

patterns-established:
  - "BIOME_TILESETS: extend this table in Plan 39-03 to add dungeon/volcano/mushroom biomes"
  - "tilesetTheme field: add to realWorldZones and fantasyZones in Plan 39-03"

requirements-completed:
  - TILE-06
  - TILE-07

# Metrics
duration: 22min
completed: 2026-03-18
---

# Phase 39 Plan 02: Biome Tileset System Summary

**BIOME_TILESETS config + biome parameter threading from create() through all Kenmi tile renderers + tilesetTheme on 8 main zones enabling desert/grass/snow pixel art terrain**

## Performance

- **Duration:** 22 min
- **Started:** 2026-03-18T00:00:00Z
- **Completed:** 2026-03-18T00:22:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added BIOME_TILESETS constant (desert/grass/snow) to MapLoader.js with per-biome tileset keys, column counts, and tint values
- Threaded `biome` parameter from `create()` -> `renderGroundTiles()` -> `_renderKenmiTiles()` so each zone loads its correct tileset
- Rewrote all Kenmi tile renderers (_renderSandTile, _renderGrassTile, _renderWaterTile, _createFoamAnimations, _addFoamOverlay) to use `_currentBiomeConfig` instead of hardcoded desert-only constants
- Added `tilesetTheme` field to all 8 main zones with correct biome assignments (5 desert, 2 grass, 1 snow)
- Gated `addWaterEdgeEffect` blue shimmer behind `!_hasKenmiTiles()` to prevent double-layer visual artifact

## Task Commits

Each task was committed atomically:

1. **Task 1: Enable Kenmi rendering + BIOME_TILESETS config + biome-aware tile methods** - `4ff4c63` (feat)
2. **Task 2: Add tilesetTheme to all 8 main zones** - `c70813e` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `src/game/systems/MapLoader.js` — BIOME_TILESETS constant, biome parameter wiring, biome-aware renderers for sand/grass/water/foam
- `src/data/zones.js` — tilesetTheme field added to all 8 main zone objects

## Decisions Made
- **Snow biome workaround:** kenmi-christmas-decorations-christmass-grass is `type: 'image'` in the catalog (not a spritesheet), so frame indices cannot be used. Used kenmi-base-tiles-grass-grass-tiles-1 (spritesheet) with 0xaaddff tint for ICE_GRASS and 0xddeeff for sand paths instead.
- **Non-desert frame layout:** All non-desert biomes use the 3x3 auto-tile block at top-left of their respective sheets rather than custom per-biome frame constant objects. Reduces code complexity while providing correct edge/corner auto-tiling.
- **Foam key deduplication:** Foam animation keys are now prefixed by the foam spritesheet key (sanitised) so `desert` and `grass/snow` biomes each have their own animation set — prevents cross-zone key collision when switching zones.
- **royal_palace biome:** Assigned `'desert'` (not a new mixed biome). The ICE_GRASS tiles get their snow-marble look from the biome-aware tint in `_renderGrassTile` regardless of the primary zone biome.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plan 39-03 ready: add dungeon/volcano/mushroom entries to BIOME_TILESETS, add tilesetTheme to all 16 placeholder zones (realWorldZones + fantasyZones)
- All 8 main zones now dispatch to correct biome tileset — no blockers

---
*Phase: 39-terrain-rendering*
*Completed: 2026-03-18*
