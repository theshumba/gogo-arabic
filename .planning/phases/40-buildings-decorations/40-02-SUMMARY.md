---
phase: 40-buildings-decorations
plan: 02
subsystem: rendering
tags: [kenmi, decorations, phaser, sprites, map-generation, props]

dependency_graph:
  requires:
    - phase: 40-01
      provides: Kenmi building sprites in all 24 zones (BIOME_BUILDING_SETS, zone objects updated)
    - phase: 38-02
      provides: 969 Kenmi assets loaded upfront in BootScene
  provides:
    - PROP_CROP_REGIONS constant mapping 19 multi-item prop sheets to 16x16 crop grids
    - _createDecoSprite() helper for correct single-item rendering from multi-item sheets
    - scatterDecorations() active and biome-aware (desert + grass)
    - Clustering pass adding 2-4 props per building near each structure
  affects: [GameScene, any zone rendering, visual density, biome-specific decoration]

tech-stack:
  added: []
  patterns:
    - "PROP_CROP_REGIONS table + _createDecoSprite() pattern for multi-item sheet rendering without spritesheets"
    - "Biome guard at top of scatter method: skip non-desert/grass biomes to avoid rendering wrong props"
    - "Clustering pass runs after tile scatter loop: building-anchored groups of 2-4 props"

key-files:
  created: []
  modified:
    - src/game/systems/MapLoader.js

key-decisions:
  - "PROP_CROP_REGIONS uses setCrop() on Phaser Image objects — no spritesheet registration needed for static multi-item sheets"
  - "Large single-object images (palm-tree, acacia-tree, dead-tree) render at scale(1) not scale(4) — they are already 48-240px, not 16x16 tiles"
  - "Biome guard skips dungeon/volcano/mushroom/snow — those biomes have no dedicated decoration prop packs yet"
  - "Duplicate const biome declaration removed from lower half of scatterDecorations after moving it to method top"
  - "Cluster building filter uses key.includes() checks matching house/tent/temple/pergola/tower/arch/inn/barn/shroom"

patterns-established:
  - "_createDecoSprite(px, py, propKey, hash): use this for all new static prop placement (not raw scene.add.image)"
  - "PROP_CROP_REGIONS: extend this table when adding new multi-item prop sheets in future phases"

requirements-completed: [DECO-01, DECO-02, DECO-06, DECO-07]

duration: 18min
completed: 2026-03-18
---

# Phase 40 Plan 02: Decoration Scattering Summary

**Kenmi multi-item prop sheets rendered as individual cropped items via PROP_CROP_REGIONS + _createDecoSprite(), enabling 20+ context-clustered desert and grass decorations per zone with 2-4 building clusters**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-03-18T01:15:00Z
- **Completed:** 2026-03-18T01:33:00Z
- **Tasks:** 2 of 2
- **Files modified:** 1

## Accomplishments

- scatterDecorations() is now active in MapLoader.create() — every desert and grass zone loads with 20+ decoration props
- Multi-item prop sheets (rocks, pots, rugs, bones, cacti, etc.) now crop to individual 16x16 items before 4x scaling — no more giant blob rendering
- Clustering pass adds 2-4 props per building (pots/rugs/fire-pits for desert, barrels/hay-bales for grass) with bounds/occupancy/water checks
- DECO-01 (desert props), DECO-02 (clustering), DECO-06 (dead trees/bushes at edges), DECO-07 (20+ per zone) all satisfied

## Task Commits

1. **Task 1: Fix decoration prop scaling and enable scatterDecorations** - `5dcfd8f` (feat)
2. **Task 2: Add clustering logic (groups of 2-4 props near buildings/paths)** - `0222890` (feat)

## Files Created/Modified

- `src/game/systems/MapLoader.js` — Added PROP_CROP_REGIONS constant (19 entries), _createDecoSprite() method, biome-aware prop sets for grass zones, updated placement density chances, uncommented scatterDecorations call, added clustering pass

## Decisions Made

- Used `setCrop()` on Phaser Image objects rather than registering new spritesheets — multi-item image sheets can crop without any catalog changes
- Large single-object prop images (palm trees, acacia tree, dead tree: 48-240px wide) render at `scale(1)` since they're already at game-appropriate size, not 16x16 tiles
- Biome guard (`if biome !== 'desert' && biome !== 'grass') return`) — dungeon/volcano/mushroom/snow skip decoration scattering for now
- Removed duplicate `const biome = zone.tilesetTheme || 'desert'` that was declared at the bottom of scatterDecorations (method now declares it at the top)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Duplicate `biome` const removed from lower half of scatterDecorations**
- **Found during:** Task 1 (while reorganising scatterDecorations biome guard)
- **Issue:** Plan said to add biome check at top of method but `const biome = zone.tilesetTheme || 'desert'` already existed lower in the method body — keeping both would cause a `SyntaxError: Identifier 'biome' has already been declared` at runtime
- **Fix:** Removed the lower duplicate, kept the new declaration at top of method
- **Files modified:** src/game/systems/MapLoader.js
- **Verification:** Build passes without errors
- **Committed in:** 5dcfd8f (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Necessary correctness fix — duplicate const would crash at runtime. No scope creep.

## Issues Encountered

None - plan executed smoothly. Actual PNG dimensions were checked against plan's crop region assumptions and matched the 16x16 grid layout as expected.

## Next Phase Readiness

- Phase 40-03 can build on active decoration system
- PROP_CROP_REGIONS is the canonical table for multi-item sheet rendering — extend it for any new packs
- scatterDecorations biome guard can be relaxed in future phases when dungeon/mushroom/volcano prop packs are added
- Bundle size unchanged (PROP_CROP_REGIONS is pure data, no new imports)

---
*Phase: 40-buildings-decorations*
*Completed: 2026-03-18*

## Self-Check: PASSED

- FOUND: src/game/systems/MapLoader.js
- FOUND: .planning/phases/40-buildings-decorations/40-02-SUMMARY.md
- FOUND: 5dcfd8f (feat(40-02): fix decoration prop scaling and enable scatterDecorations)
- FOUND: 0222890 (feat(40-02): add clustering pass for 2-4 props near buildings)
