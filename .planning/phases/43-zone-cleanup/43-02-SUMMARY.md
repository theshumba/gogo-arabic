---
plan: 43-02
phase: 43
subsystem: zone-cleanup
one_liner: "Old placeholder sprite loads removed from BootScene, InteractableManager migrated to Kenmi keys, Tiled JSON export created for all 24 zones"
status: complete
tags: [cleanup, sprites, kenmi, tiled, export, interactables]
dependency_graph:
  requires: ["43-01"]
  provides: ["PIPE-04", "PIPE-05"]
  affects: ["BootScene", "InteractableManager", "src/assets/maps"]
tech_stack:
  added: []
  patterns: ["Tiled Map Editor JSON format", "Kenmi sprite key convention"]
key_files:
  created:
    - src/assets/maps/zone-export.json
  modified:
    - src/game/scenes/BootScene.js
    - src/game/systems/InteractableManager.js
    - src/game/systems/__tests__/InteractableManager.test.js
decisions:
  - "InteractableManager.js WORLD_OBJECT_SPRITES and type->sprite key dispatch updated to Kenmi keys (matched test update)"
  - "zone-export.json is static reference only — not imported at runtime, not in Vite bundle"
  - "Placeholder zones (16 real-world + fantasy) include 4-5 default objects from getDefaultObjects() biome dispatch"
metrics:
  duration: "~20 minutes"
  completed_date: "2026-03-18"
---

# Phase 43 Plan 02: Zone Cleanup — BootScene + Tiled Export Summary

## What Was Built

### Task 1: Remove Old Placeholder Sprite Loads

Removed the 16-entry LEGACY OBJECT SPRITES block from BootScene.js (lines 87-103 in original):
- palm, palm-small, palm-alt
- house-small, house-small-alt, house-large, house-large-alt
- rock1, rock2
- ruin-pillar, ruin-pillar-broke, ruin-gate
- green-tree, green-tree-small, green-tree-bushy, ice-tree

Ground tile fallbacks preserved (tile-sand, tile-grass, grass-ice) — still used by MapLoader._renderFlatTiles.

Updated InteractableManager.js to use Kenmi keys throughout:
- sign: `kenmi-desert-temple-desert-obelisk-small-2`
- bookshelf: `kenmi-desert-temple-desert-obelisk-small-1`
- chest: `kenmi-desert-props-desert-rocks`
- door: `kenmi-desert-houses-desert-house-1.1`
- WORLD_OBJECT_SPRITES: all 8 types mapped to Kenmi keys (fountain, statue, painting, lantern, stall, barrel, crate, pot)

Updated InteractableManager.test.js assertions at lines 85-87 to match new Kenmi keys.

### Task 2: Tiled-Compatible JSON Export

Created `src/assets/maps/zone-export.json` — a 965-line static reference file documenting all 24 zones in Tiled Map Editor JSON format conventions:

- 8 core zones (zones.js): Full layers with actual objects, NPCs, interactables, exits
- 8 real-world zones (realWorldZones.js): Dimensions, tilesetTheme, spawnPoint, 4 default biome buildings
- 8 fantasy zones (fantasyZones.js): Same structure as real-world placeholders

Every zone has: `width`, `height`, `tilesetTheme`, `spawnPoint`, and 5 layers (ground, objects, npcs, interactables, exits). All object keys use `kenmi-` prefixes.

## Key Files

- `src/game/scenes/BootScene.js` — 16 legacy load calls removed, comment updated
- `src/game/systems/InteractableManager.js` — All sprite keys migrated to Kenmi
- `src/game/systems/__tests__/InteractableManager.test.js` — Test assertions updated
- `src/assets/maps/zone-export.json` — NEW: Tiled-compatible JSON for all 24 zones

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated InteractableManager.js alongside test updates**
- **Found during:** Task 1
- **Issue:** Plan said to update test assertions (lines 85-87) to reference Kenmi keys, but the actual sprite dispatch in InteractableManager.js still used old keys (rock1, ruin-pillar, gate-pillar, house-small). Updating only the test without updating InteractableManager would make tests test the wrong behavior.
- **Fix:** Updated both `WORLD_OBJECT_SPRITES` mapping and the `sign/bookshelf/chest/door` sprite key dispatch in InteractableManager.js to use Kenmi keys, then updated tests to match.
- **Files modified:** `src/game/systems/InteractableManager.js`, `src/game/systems/__tests__/InteractableManager.test.js`
- **Commit:** 0741482

## Self-Check: PASSED

| File | Status |
|------|--------|
| `src/assets/maps/zone-export.json` | FOUND |
| `src/game/scenes/BootScene.js` | FOUND |
| `src/game/systems/InteractableManager.js` | FOUND |
| `src/game/systems/__tests__/InteractableManager.test.js` | FOUND |
| `.planning/phases/43-zone-cleanup/43-02-SUMMARY.md` | FOUND |

Commits: `0741482` (Task 1), `3c81435` (Task 2) — both verified in git log.
