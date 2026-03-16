# Requirements: GoGo Arabic v8.0

**Defined:** 2026-03-16
**Core Value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"

## v8.0 Requirements

### Terrain & Tileset

- [ ] **TILE-01**: All zones render 16x16 Kenmi desert tileset (scaled 4x to 64px game grid) instead of flat colored squares
- [ ] **TILE-02**: Auto-tiling renders correct terrain transitions (sand↔grass, sand↔water, sand↔cliff) using 4-neighbor edge detection
- [ ] **TILE-03**: Sand tiles display seeded random variations (3+ variants) so terrain doesn't look uniform
- [ ] **TILE-04**: Water tiles use Kenmi animated water foam at shoreline edges
- [ ] **TILE-05**: Desert zones use desert tileset (3 color variations for sand/water/cliff)
- [ ] **TILE-06**: Forest/farmland zones use base RPG pack grass/path/water tiles
- [ ] **TILE-07**: Mountain/snow zones use Christmas pack snow tiles
- [ ] **TILE-08**: Dungeon/fortress interiors use Dungeon pack floor/wall tiles
- [ ] **TILE-09**: Volcano/magical zones use Volcano pack lava/rock tiles
- [ ] **TILE-10**: Shroomlands zones use ShroomLands pack mushroom grass tiles

### Buildings & Structures

- [ ] **BLDG-01**: Oasis Village uses Kenmi desert houses (4 designs × 4 color variants) replacing placeholder houses
- [ ] **BLDG-02**: Desert Temple replaces placeholder large buildings in library/palace zones
- [ ] **BLDG-03**: Pergola and fence walls used for market/bazaar areas
- [ ] **BLDG-04**: Dungeon pack arches, pillars, gates used for fortress/library interiors
- [ ] **BLDG-05**: Military camp pack tents, palisades, lookout towers used for Bedouin Camp zone
- [ ] **BLDG-06**: ShroomLands mushroom houses used for Forest of Tales zone
- [ ] **BLDG-07**: Temple interior tileset used for building interiors in desert zones

### Decorations & Props

- [ ] **DECO-01**: Desert zones filled with Kenmi props (cacti, rocks, bones, pots, sacks, rugs, campfires, palm trees, acacia trees)
- [ ] **DECO-02**: Decoration placement uses clustering algorithms (groups of 2-4 near buildings, along paths) not uniform random scatter
- [ ] **DECO-03**: Animated decorations render in-game (grass sway, campfire flicker, water foam, flies)
- [ ] **DECO-04**: Obelisks and golden pots placed at key landmarks (temple entrances, quest locations)
- [ ] **DECO-05**: Sleeping mats, water sacks, and trader camps placed near NPC spawn points
- [ ] **DECO-06**: Dead trees and dead bushes used in barren/edge areas of desert zones
- [ ] **DECO-07**: Each zone has minimum 20 decoration objects for visual density

### Characters & NPCs

- [ ] **CHAR-01**: Player sprite replaced with Kenmi character (16x16 base, 4-direction walk animations)
- [ ] **CHAR-02**: Desert NPCs use Kenmi Desert_Person sprites (4 variants + Pharaoh + 3 Traders)
- [ ] **CHAR-03**: Female NPC sprites have hijab head covering variants (pixel-modified from base sprites)
- [ ] **CHAR-04**: Enemy encounters use Kenmi Desert Warriors (2 weapon types × 2 variants) and Mummy
- [ ] **CHAR-05**: Non-desert NPCs use base RPG pack premade NPCs (Chef, Farmer, Fisherman, etc.)
- [ ] **CHAR-06**: All NPC sprites have idle and walk animations loaded from spritesheets

### Animals & Ambient Life

- [ ] **ANIM-01**: Camels (3 variants) placed as ambient sprites in desert zones with idle/walk animations
- [ ] **ANIM-02**: Vultures (4 variants) placed as ambient flying sprites in desert zones
- [ ] **ANIM-03**: Scarabs (4 color variants) placed as small ambient insects near water/ruins
- [ ] **ANIM-04**: Animals are non-interactive decoration sprites (no collision, no dialogue) that add world life

### UI Overhaul

- [ ] **UI-01**: In-game dialogue box renders inside Phaser Canvas (NineSlice panel, typewriter text, blinking cursor) instead of React DOM overlay
- [ ] **UI-02**: NPC interaction prompts render as Phaser sprites (not DOM overlay elements)
- [ ] **UI-03**: Kenmi UI pack frames used for in-game panels (8 color variants available)
- [ ] **UI-04**: Kenmi UI pack bars used for health/XP/stamina displays
- [ ] **UI-05**: Kenmi UI pack icons used for inventory/quest/map buttons
- [ ] **UI-06**: Kenmi pixel font (5x7) used for in-game Phaser text where appropriate
- [ ] **UI-07**: React overlays (HUD bar, menu, settings, profile, wardrobe) remain as React — only in-game elements move to Phaser

### Arabic Text

- [ ] **ARAB-01**: Pixel AE BitmapFont loaded and used for Arabic text inside Phaser Canvas
- [ ] **ARAB-02**: js-arabic-reshaper integrated for correct Arabic letter joining in BitmapFont
- [ ] **ARAB-03**: RTL text direction handled correctly for Arabic strings in Phaser text objects
- [ ] **ARAB-04**: Zone names, NPC labels, and sign text render in Arabic using BitmapFont (not DOM overlay)

### Asset Pipeline

- [ ] **PIPE-01**: All 13 Kenmi packs cataloged and copied to project assets directory with consistent naming
- [ ] **PIPE-02**: BootScene loads Kenmi spritesheets with correct frame dimensions per asset type
- [ ] **PIPE-03**: Zone data files reference Kenmi sprite keys instead of placeholder keys
- [ ] **PIPE-04**: Tiled-compatible JSON map export structure established for future collaborator handoff
- [ ] **PIPE-05**: Old placeholder sprites removed from project (tile-sand, tile-grass, placeholder houses/trees)

## v9.0 Requirements (Deferred)

### Tiled Editor Integration

- **TILED-01**: All zones editable in Tiled Map Editor as .tmx files
- **TILED-02**: Tiled auto-mapping rules configured for terrain transitions
- **TILED-03**: Tiled object layers define NPC spawns, interactables, exits

### Advanced Visual

- **VIS-01**: Parallax scrolling background layers per zone
- **VIS-02**: Dynamic lighting/shadow system
- **VIS-03**: Weather particle effects (rain, sandstorm, snow) rendered in Phaser

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full Tiled map editor workflow | v8.0 focuses on art replacement; Tiled editing deferred to v9.0 |
| Spine/skeletal animations | Overkill for 16x16 pixel art, spritesheet frames sufficient |
| WebGL shaders for lighting | Complexity doesn't match pixel art style |
| New game mechanics | v8.0 is visual-only, no gameplay changes |
| Sound redesign | Audio system works, only visuals changing |
| New zones or NPCs | Reskinning existing 24 zones, not adding new ones |
| React overlay redesign | HUD/menu/settings stay React; only in-game elements move to Phaser |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PIPE-01 | Phase 38 | Pending |
| PIPE-02 | Phase 38 | Pending |
| TILE-01 | Phase 39 | Pending |
| TILE-02 | Phase 39 | Pending |
| TILE-03 | Phase 39 | Pending |
| TILE-04 | Phase 39 | Pending |
| TILE-05 | Phase 39 | Pending |
| TILE-06 | Phase 39 | Pending |
| TILE-07 | Phase 39 | Pending |
| TILE-08 | Phase 39 | Pending |
| TILE-09 | Phase 39 | Pending |
| TILE-10 | Phase 39 | Pending |
| BLDG-01 | Phase 40 | Pending |
| BLDG-02 | Phase 40 | Pending |
| BLDG-03 | Phase 40 | Pending |
| BLDG-04 | Phase 40 | Pending |
| BLDG-05 | Phase 40 | Pending |
| BLDG-06 | Phase 40 | Pending |
| BLDG-07 | Phase 40 | Pending |
| DECO-01 | Phase 40 | Pending |
| DECO-02 | Phase 40 | Pending |
| DECO-03 | Phase 40 | Pending |
| DECO-04 | Phase 40 | Pending |
| DECO-05 | Phase 40 | Pending |
| DECO-06 | Phase 40 | Pending |
| DECO-07 | Phase 40 | Pending |
| CHAR-01 | Phase 41 | Pending |
| CHAR-02 | Phase 41 | Pending |
| CHAR-03 | Phase 41 | Pending |
| CHAR-04 | Phase 41 | Pending |
| CHAR-05 | Phase 41 | Pending |
| CHAR-06 | Phase 41 | Pending |
| ANIM-01 | Phase 41 | Pending |
| ANIM-02 | Phase 41 | Pending |
| ANIM-03 | Phase 41 | Pending |
| ANIM-04 | Phase 41 | Pending |
| UI-01 | Phase 42 | Pending |
| UI-02 | Phase 42 | Pending |
| UI-03 | Phase 42 | Pending |
| UI-04 | Phase 42 | Pending |
| UI-05 | Phase 42 | Pending |
| UI-06 | Phase 42 | Pending |
| UI-07 | Phase 42 | Pending |
| ARAB-01 | Phase 42 | Pending |
| ARAB-02 | Phase 42 | Pending |
| ARAB-03 | Phase 42 | Pending |
| ARAB-04 | Phase 42 | Pending |
| PIPE-03 | Phase 43 | Pending |
| PIPE-04 | Phase 43 | Pending |
| PIPE-05 | Phase 43 | Pending |

**Coverage:**
- v8.0 requirements: 50 total (10 TILE + 7 BLDG + 7 DECO + 6 CHAR + 4 ANIM + 7 UI + 4 ARAB + 5 PIPE)
- Mapped to phases: 50
- Unmapped: 0

*Note: Initial requirements file listed 39 total — the correct count from enumerated IDs is 50.*

---
*Requirements defined: 2026-03-16*
*Last updated: 2026-03-16 — Traceability populated after roadmap creation (Phases 38-43)*
