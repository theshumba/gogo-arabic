---
plan: 40-01
phase: 40
one_liner: "Kenmi buildings replace placeholders + context-aware decoration scattering"
status: complete
---

# Plan 40-01: Buildings & Decorations

## What Was Built
Sprite key remapper (spriteKeyMap.js) maps 16 old placeholder keys to Kenmi equivalents. MapLoader.placeObjects() uses remapper with fallback. Decoration scattering system places context-aware props: cacti/rocks in open desert, pots/rugs near buildings, ferns near water, dead bushes at edges. Animated swaying grass on grass tiles. 8-20% placement chance based on proximity context.

## Key Files
- `src/data/spriteKeyMap.js` — SPRITE_KEY_MAP export
- `src/game/systems/MapLoader.js` — placeObjects() updated, scatterDecorations() added
