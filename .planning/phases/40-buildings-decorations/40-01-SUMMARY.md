---
phase: 40-buildings-decorations
plan: 01
subsystem: zone-data
tags: [buildings, biomes, kenmi, zones, sprites]
dependency_graph:
  requires: [39-03-SUMMARY.md, src/data/kenmiCatalog.js, src/game/systems/MapLoader.js]
  provides: [BIOME_BUILDING_SETS, Kenmi building keys in all 24 zones]
  affects: [MapLoader.js placeObjects(), all zone renders in GameScene]
tech_stack:
  added: []
  patterns: [BIOME_BUILDING_SETS constant, getDefaultObjects(tilesetTheme) factory function, biome-driven building dispatch]
key_files:
  created: []
  modified:
    - src/data/spriteKeyMap.js
    - src/data/zones.js
    - src/data/zones/fantasyZones.js
    - src/data/zones/realWorldZones.js
    - src/data/zones/mapPlaceholder.js
decisions:
  - "mapPlaceholder imports BIOME_BUILDING_SETS from spriteKeyMap instead of hardcoding keys — single source of truth"
  - "defaultObjects export preserved as backward-compatible desert alias (getDefaultObjects('desert'))"
  - "gate-pillar key in royal_palace replaced with kenmi-desert-temple-desert-obelisk-small-1 (gate-pillar had no Kenmi mapping)"
metrics:
  duration: "6 minutes"
  completed_date: "2026-03-18"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 40 Plan 01: Zone Building Sprites Summary

Zone-specific Kenmi building sprites across all 24 zones: desert houses with 4 design x 4 color variants in oasis, desert temples in ancient library + royal palace, pergolas + fence walls in marketplace, military tents + lookout towers + palisades in bedouin camp, limestone/stone dark houses in mountain village, wood + inn + fisherman house in coastal port and farmland, mushroom houses in forest of tales, dungeon arches in fortress of secrets, volcano towers in desert of silence.

## Tasks Completed

### Task 1: Expand SPRITE_KEY_MAP with biome building sets + update zone objects to use varied Kenmi keys

Added `BIOME_BUILDING_SETS` export to `src/data/spriteKeyMap.js` covering 7 biomes (desert, grass, snow, military, dungeon, mushroom, volcano). Updated all 8 main zones in `src/data/zones.js` to use Kenmi keys directly in their objects arrays, replacing every old placeholder key.

**Commit:** 5677ac5

Zone-specific replacements:
- **oasis_village**: desert houses 1.1, 1.2, 2.3, 3.1, 4.2 (varied colors — BLDG-01)
- **ancient_library**: 2x desert temples + small houses 1.4/2.4 + obelisk pillars (BLDG-02)
- **desert_marketplace**: 4x pergolas + 2x large desert houses + fence walls along road (BLDG-03)
- **farmland**: barn + wood house 1-blue + wood house 2-red (grass biome)
- **bedouin_camp**: 3x military tents + lookout tower + 2x palisades (BLDG-05)
- **mountain_village**: limestone house 3+4 black + stone house 1+2 black (snow biome)
- **coastal_port**: stone house 3 + inn + fisherman house + wood house 3 red (grass biome)
- **royal_palace**: 2x desert temples + desert house 3.4 + 4.3 + obelisk pillars (BLDG-07)

### Task 2: Update placeholder zones (fantasy + real-world) and mapPlaceholder defaults with biome-correct buildings

Updated `src/data/zones/mapPlaceholder.js` to import `BIOME_BUILDING_SETS` and export `getDefaultObjects(tilesetTheme)` — replaces old `defaultObjects` (4 identical ruin-pillars) with biome-dispatched arrays. Updated all 8 fantasy zones and all 8 real-world zones to call `getDefaultObjects()` with their tilesetTheme.

**Commit:** cf58409

Fantasy zone biome assignments:
- forest_of_tales -> mushroom (shroomlinng houses 1-4) — BLDG-06
- fortress_of_secrets -> dungeon (arches + pillars) — BLDG-04
- desert_of_silence -> volcano (volcano towers)
- mountain_of_words -> snow (limestone/stone black houses)
- sea_of_ink, merchants_island, garden_of_spirits -> grass (wood/stone houses)
- star_oasis -> desert (desert houses)

All 8 real-world zones -> desert (historical Middle East/North Africa settings).

## Verification Results

- `grep -c "key: 'house-small\|house-large'"` in zones.js: **0** (no old keys remain)
- `grep -c "kenmi-"` in zones.js: **182** (all objects use Kenmi keys)
- `grep -c "ruin-pillar"` in mapPlaceholder.js: **0** (old defaultObjects replaced)
- `grep -c "BIOME_BUILDING_SETS"` in spriteKeyMap.js: **2** (export + comment)
- `grep -c "getDefaultObjects"` in fantasyZones.js: **9** (1 import + 8 calls)
- `grep -c "getDefaultObjects"` in realWorldZones.js: **9** (1 import + 8 calls)
- `npm run build`: **passed** (no import errors, 12.19s build time)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] gate-pillar key had no Kenmi mapping**
- **Found during:** Task 1 — royal_palace objects
- **Issue:** `gate-pillar` key was used for palace gate pillars but has no entry in SPRITE_KEY_MAP or BIOME_BUILDING_SETS
- **Fix:** Replaced with `kenmi-desert-temple-desert-obelisk-small-1` (the same key used for ruin-pillar, semantically appropriate for palace gate pillars)
- **Files modified:** src/data/zones.js
- **Commit:** 5677ac5

**2. [Rule 2 - Deviation] mapPlaceholder uses import-based dispatch instead of inline hardcoding**
- **Found during:** Task 2
- **Context:** The plan's `getDefaultObjects` implementation references `biome.small[0]` etc. from imported BIOME_BUILDING_SETS rather than hardcoding key strings in mapPlaceholder.js
- **Result:** Acceptance criteria checking for literal `kenmi-shroom-houses` in mapPlaceholder.js returns 0 — strings live in spriteKeyMap.js (the import source). This is the correct design: single source of truth. The function dispatches correctly at runtime.

## Next Phase Readiness

- Phase 40-02 (decorations/props) can reference `BIOME_BUILDING_SETS` from spriteKeyMap.js for prop selection
- `getDefaultObjects()` is available for any new zones added in future plans
- BLDG-01 through BLDG-07 all addressed

## Self-Check: PASSED

All modified files verified present. Both task commits (5677ac5, cf58409) verified in git history.
