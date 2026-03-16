---
plan: 41-01
phase: 41
one_liner: "23 NPCs mapped to Kenmi sprites + ambient camels/vultures/scarabs"
status: complete
---

# Plan 41-01: Characters & Ambient Life

## What Was Built
NPC_KEY_MAP maps 23 NPC sprite keys to Kenmi desert person/trader/pharaoh/base RPG variants. NPC.js auto-detects Kenmi sprites, uses 16x16 frames at 4x scale with adjusted hitbox and 3-frame walk animations per direction. Ambient animals: 2-3 camels, 1-2 vultures, 2-4 scarabs per desert zone with idle animations. Seeded deterministic placement. Player sprite deferred (complex 2-layer compositing).

## Key Files
- `src/data/spriteKeyMap.js` — NPC_KEY_MAP export added
- `src/game/sprites/NPC.js` — Kenmi sprite detection + animation setup
- `src/game/systems/MapLoader.js` — spawnAmbientAnimals() + _createAnimalAnimations()
