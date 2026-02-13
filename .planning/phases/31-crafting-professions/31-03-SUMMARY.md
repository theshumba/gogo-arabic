---
phase: 31-crafting-professions
plan: 03
subsystem: crafting
tags: [phaser-systems, resource-gathering, data, tests]
dependency-graph:
  requires: [31-01-data, 31-02-logic]
  provides: [gathering-spots, gathering-manager]
  affects: [world-scene, interactables]
tech-stack:
  added: [GatheringSpotManager]
  patterns: [phaser-manager-pattern, tile-to-pixel-conversion, delayed-respawn]
key-files:
  created:
    - src/game/systems/GatheringSpotManager.js
    - src/data/gatheringSpots.js
    - src/data/__tests__/gatheringSpots.test.js
  modified:
    - src/data/zones.js
decisions:
  - title: "GatheringSpotManager follows InteractableManager pattern"
    rationale: "Consistency with existing codebase, proven proximity detection and interaction handling"
    impact: "WorldScene integration in Plan 08 will be straightforward"
  - title: "Gathering spots use existing sprite keys"
    rationale: "No new assets needed, reuse palm-small/green-tree-small/rock1/rock2"
    impact: "Visual variety limited but no art dependencies"
  - title: "scene.time.delayedCall() for respawns vs polling"
    rationale: "Performance - event-driven respawn is more efficient than checking every frame"
    impact: "Respawns work even when scene paused/resumed"
  - title: "4hr/8hr respawn intervals (not real-time 24hr)"
    rationale: "Accessible gameplay loop, aligns with learning session frequency"
    impact: "Players can gather resources multiple times per day"
  - title: "Cook profession accepted for herb_patch/water_source"
    rationale: "Cook uses herbs/spices/oils - valid overlap with herbalist/alchemist"
    impact: "More flexible resource-to-profession mapping"
metrics:
  duration: "400s (~7 minutes)"
  completed: "2026-02-13T02:49:15Z"
  commits: 2
  files_created: 3
  files_modified: 2
  tests_added: 12
  loc_added: ~1100
---

# Phase 31 Plan 03: Gathering Spot Data & Manager Summary

**One-liner:** Phaser GatheringSpotManager system with 59 gathering spots across 7 zones using delayed-call respawn logic

## What Was Built

### GatheringSpotManager.js (Phaser System)
- **Pattern:** Follows InteractableManager.js exactly (proximity detection, SPACE interaction, hint text)
- **create(zoneId):**
  - Loads spots via `getGatheringSpotsForZone(zoneId)`
  - Checks `craftingSlice.gatheringCooldowns` to restore depleted state on scene load
  - Creates sprites at `(x * 64 + 32, y * 64 + 32)` with 0.6 scale
  - Shows Arabic resource name labels (respects harakat setting via stripDiacritics)
  - Applies gray tint (0x888888) to depleted spots
  - Schedules `scene.time.delayedCall()` for remaining respawn time
  - Adds pulsing alpha tween (0.85→1.0) to ready spots
- **update(playerSprite, interactKey, interactCooldown, setInteractCooldown):**
  - Proximity check: 128px range (2 tiles)
  - Shows `[SPACE]` hint for ready spots, "Depleted" for cooldown spots
  - Handles SPACE interaction with 500ms cooldown
- **gatherResource(spotId):**
  - Calculates quality via `calculateGatheringQuality(professionLevel)` from craftingLogic.js
  - Dispatches `addResource({ resourceId, quantity: 1, quality })` to craftingSlice
  - Dispatches `recordGatheringCooldown({ spotId, timestamp: Date.now() })`
  - Emits `EVENTS.CRAFTING_RESOURCE_GATHERED`, `EVENTS.SFX_CORRECT`, `EVENTS.GATHERING_SPOT_DEPLETED`
  - Sets spot to 'depleted', applies tint, schedules respawn via `scene.time.delayedCall()`
- **respawnSpot(spotId):**
  - Clears tint, re-adds pulsing tween
  - Emits `EVENTS.GATHERING_SPOT_READY`
- **destroy():**
  - Cleans up sprites, labels, hint text, event listeners

### gatheringSpots.js (Data)
- **59 gathering spots** across 7 existing zones (oasis_village: 8, ancient_library: 7, desert_marketplace: 9, farmland: 10, bedouin_camp: 8, mountain_village: 8, coastal_port: 9)
- **6 spots for future zones** (baghdad_marketplace - deferred until those zones exist)
- **5 spot types:**
  - `herb_patch`: chamomile, mint, saffron, sage, thyme, lavender, ginger_root, aloe_vera (green-tree-small sprite)
  - `ore_vein`: copper_ore, iron_ore, gold_ore, silver_ore, lapis_lazuli, tin_ore (rock1/rock2 sprite)
  - `water_source`: rosewater, olive_oil, blessed_water (rock2 sprite)
  - `animal_trace`: wool, cotton, silk, linen, hemp (rock1/rock2 sprite)
  - `papyrus_stand`: papyrus, vellum, paper (palm-small sprite)
- **Respawn intervals:**
  - 14400000ms (4 hours) for common spots (44 spots)
  - 28800000ms (8 hours) for rare spots (15 spots - saffron, lavender, lapis_lazuli, gold_ore, silver_ore, silk, etc.)
- **Helper functions:**
  - `getGatheringSpotsForZone(zoneId)` - returns array of spots for zone
  - `getGatheringSpotCount()` - returns total spot count

### zones.js Updates
- Added `gatheringSpots: true` flag to all 8 zones (oasis_village, ancient_library, desert_marketplace, farmland, bedouin_camp, mountain_village, coastal_port, royal_palace)
- Flag enables GatheringSpotManager initialization in WorldScene (Plan 08)

### gatheringSpots.test.js (Validation)
- **12 comprehensive tests:**
  1. Spot ID/key consistency
  2. Valid resourceId references (all resources exist in RESOURCES)
  3. Valid gatherType (herb_patch/ore_vein/water_source/animal_trace/papyrus_stand)
  4. Positive x/y coordinates
  5. Valid respawnInterval (4hr or 8hr only)
  6. Non-empty spriteKey
  7. Valid zone references (with future zone exceptions)
  8. `getGatheringSpotsForZone()` returns correct spots
  9. `getGatheringSpotsForZone()` returns empty array for unknown zone
  10. `getGatheringSpotCount()` returns correct total
  11. All existing zones have 5+ spots
  12. Profession-to-gatherType matching (cook/herbalist/alchemist for herb_patch, blacksmith/jeweler/calligrapher for ore_vein, weaver for animal_trace, calligrapher for papyrus_stand)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed resourceId references in gatheringSpots.js**
- **Found during:** Test execution after initial data creation
- **Issue:** 13 gathering spots referenced resources not yet created in resources.js (fresh_water, frankincense, rose_water, leather, camel_hair, myrrh, emerald, rosemary, sea_salt, pearl, ginger, turquoise, ruby)
- **Fix:** Replaced with equivalent existing resources matching same professions/types:
  - `fresh_water` → `olive_oil` / `rosewater` (cook/herbalist/alchemist professions)
  - `frankincense` → `lavender` (herbalist)
  - `rose_water` → `rosewater` (cook/herbalist)
  - `leather` → `linen` / `hemp` (weaver)
  - `camel_hair` → `hemp` (weaver)
  - `myrrh` → `aloe_vera` (herbalist)
  - `emerald` → `silver_ore` (blacksmith)
  - `rosemary` → `fenugreek` (herbalist)
  - `sea_salt` → `blessed_water` (alchemist/herbalist)
  - `pearl` → `silk` (weaver)
  - `ginger` → `ginger_root` (herbalist)
  - `turquoise` → `tin_ore` (blacksmith)
  - `ruby` → `gold_ore` (blacksmith)
- **Files modified:** gatheringSpots.js (13 resourceId replacements)
- **Commit:** db9e5f1
- **Justification:** Cannot validate or use gathering spots without valid resource references. Plan implicitly assumed all referenced resources existed, but resources.js contains 204 resources with specific IDs. Replaced with equivalent resources from same profession categories to preserve gameplay balance.

## Verification Results

- [x] GatheringSpotManager exports correctly, follows InteractableManager pattern
- [x] 59 gathering spots defined across 7 existing zones
- [x] All resourceId references valid (100% coverage after Rule 3 fix)
- [x] Respawn logic uses `scene.time.delayedCall()`, not polling
- [x] EventBus events emitted: CRAFTING_RESOURCE_GATHERED, GATHERING_SPOT_READY, GATHERING_SPOT_DEPLETED, SFX_CORRECT
- [x] `npx vite build` succeeds (723.46 KB main bundle, 191.07 KB gzipped)
- [x] `npx vitest run` passes all tests (1072 passing, 12 new)
- [x] Zones.js has `gatheringSpots: true` for all zones
- [x] Helper functions tested and working

## Technical Notes

**Tile-to-pixel conversion:**
```javascript
const px = cfg.x * 64 + 32; // center of tile
const py = cfg.y * 64 + 32;
```

**Cooldown restoration on scene load:**
```javascript
const lastGathered = cooldowns[cfg.id] || 0;
const timeSinceGather = currentTime - lastGathered;
const isDepleted = timeSinceGather < cfg.respawnInterval;

if (isDepleted) {
  const remainingTime = cfg.respawnInterval - timeSinceGather;
  this.scene.time.delayedCall(remainingTime, () => {
    this.respawnSpot(cfg.id);
  });
}
```

**Profession level lookup for quality calculation:**
```javascript
const profession = craftingState?.professions?.[resource.professions[0]];
const professionLevel = profession?.level || 0;
const quality = calculateGatheringQuality(professionLevel); // 'normal' | 'high' | 'pristine' | 'perfect'
```

**Harakat setting support:**
```javascript
const showDiacritics = store.getState().settings?.showDiacritics ?? true;
const labelText = showDiacritics ? rawLabel : stripDiacritics(rawLabel);
```

## Integration Points

- **WorldScene (Plan 08):** Will instantiate GatheringSpotManager in `create()`, call `update()` in scene loop
- **CraftingUI (Plans 04-05):** Resource inventory displays gathered resources with quality tiers
- **ProfessionSystem (Plan 06):** Profession levels affect gathering quality distribution
- **EventBus:** Emits 4 events consumed by React UI (toast notifications, sound effects)

## Next Phase Readiness

**Blockers:** None.

**Recommendations:**
1. WorldScene integration in Plan 08 should check zone's `gatheringSpots` flag before creating manager
2. Consider particle VFX for gathering action (Plan 08 scope)
3. Baghdad zones (baghdad_marketplace, baghdad_house_of_wisdom) need zone definitions before their 6 gathering spots activate
4. Future: Add profession XP gain on gathering (currently only on crafting)

## Self-Check: PASSED

**Created files exist:**
```bash
FOUND: src/game/systems/GatheringSpotManager.js
FOUND: src/data/gatheringSpots.js
FOUND: src/data/__tests__/gatheringSpots.test.js
```

**Modified files exist:**
```bash
FOUND: src/data/zones.js (gatheringSpots: true added to 8 zones)
```

**Commits exist:**
```bash
FOUND: 744760e (Task 1 - GatheringSpotManager and gathering spot data)
FOUND: db9e5f1 (Task 2 - zones.js update and validation tests)
```

**Exports verified:**
```bash
GatheringSpotManager class: 3 occurrences in GatheringSpotManager.js
getGatheringSpotsForZone function: 1 occurrence in gatheringSpots.js
GATHERING_SPOTS object: exported with 65 spots (59 active, 6 for future zones)
```

**Tests verified:**
```bash
gatheringSpots.test.js: 12 tests, all passing
Full test suite: 1072 tests passing (12 new)
```
