---
plan: 43-01
phase: 43
one_liner: "Zone data migrated to Kenmi keys, 19 old sprite loads removed, Tiled export structure created"
status: complete
---

# Plan 43-01: Zone References & Cleanup

## What Was Built
- 173 object keys in zones.js replaced with Kenmi equivalents (palm → kenmi-desert-props-palm-tree-1, etc.)
- mapPlaceholder.js updated for all 16 real-world and fantasy zones
- 19 old sprite load calls removed from BootScene (tile-sand, tile-grass, palm, houses, rocks, ruins, trees)
- SPRITE_KEY_MAP preserved as legacy fallback for interior definitions
- Tiled-compatible map export README created at public/assets/maps/ with all 24 zones documented
- gate-pillar, gate-top, hospital kept unchanged (still needed)

## Key Files
- `src/data/zones.js` — 173 key replacements across 8 core zones
- `src/data/zones/mapPlaceholder.js` — 4 key replacements for placeholder zones
- `src/game/scenes/BootScene.js` — 19 load calls removed
- `public/assets/maps/README.md` — Tiled collaborator documentation
