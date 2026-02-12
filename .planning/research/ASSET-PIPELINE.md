# Asset Pipeline Technical Specification

## GoGo Arabic: 8 Zones to 24 Zones, 140 NPCs to 350+ NPCs, 13 SFX to 200+ Sounds

**Document Version**: 1.0
**Date**: 2026-02-12
**Scope**: Complete pixel art and audio asset pipeline for v6.0-v10.0 expansion
**Prerequisite Reading**: EXPANSION-WORLD-CONTENT.md, EXPANSION-COMBAT-RPG.md, EXPANSION-SUMMARY.md

---

## Table of Contents

1. [Current State Audit](#1-current-state-audit)
2. [Sprite Asset Requirements](#2-sprite-asset-requirements)
3. [Sprite Atlas Pipeline](#3-sprite-atlas-pipeline)
4. [Tilemap Pipeline](#4-tilemap-pipeline)
5. [Audio Asset Pipeline](#5-audio-asset-pipeline)
6. [Asset Streaming Architecture](#6-asset-streaming-architecture)
7. [Islamic Art Style Guide](#7-islamic-art-style-guide)
8. [Asset Budget and Performance](#8-asset-budget-and-performance)
9. [Placeholder-to-Final Pipeline](#9-placeholder-to-final-pipeline)
10. [Implementation Phases](#10-implementation-phases)

---

## 1. Current State Audit

### 1.1 Asset Inventory (v5.0)

| Category | Count | Format | Location |
|----------|-------|--------|----------|
| Player body spritesheets | 12 | PNG 512x512 (128x128 frames, 4x4 grid) | `public/assets/sprites/player/bodies/` |
| Player head coverings | 6 | PNG 512x512 (128x128 frames, 4x4 grid) | `public/assets/sprites/player/heads/` |
| Faceless NPC spritesheets | 23 | PNG 512x512 (128x128 frames, 4x4 grid) | `public/assets/sprites/npcs/faceless/` |
| NPC portraits (silhouettes) | 23 | PNG (individual images) | `public/assets/portraits/` |
| Object sprites | 33 | PNG (individual images, varied sizes) | `public/assets/sprites/objects/` |
| Tilesets | 3 | PNG (world, coast, indoor) | `public/assets/tilesets/` |
| Ground tiles | 2 | PNG (sand.png, grass.png) | `public/assets/sprites/objects/` |
| Background images | 3 | PNG (sand, forest, ice) | `public/assets/backgrounds/` |
| Placeholder GIF backgrounds | 7 | GIF (Japanese-themed) | `public/assets/backgrounds/` |
| UI icons | 9 | PNG (individual images) | `public/assets/ui/` |
| SFX files | 14 | OGG | `public/assets/audio/sfx/` |
| Letter pronunciations | 28 | MP3 | `public/assets/audio/letters/` |
| Ambient tracks | 0 | (referenced but missing) | `public/assets/audio/ambient/` |
| Word pronunciations | 0 | (none exist yet) | `public/assets/audio/words/` |
| TMX map files | 7 | TMX (Tiled format, unused) | `public/assets/maps/` |
| Legacy sprites (pre-faceless) | 17 | PNG (root-level dupes) | `public/assets/sprites/` |

**Total asset files**: ~255
**Total estimated size**: ~25MB (22.4MB are the 7 placeholder GIFs alone)

### 1.2 Current Loading Architecture

`BootScene.js` loads ALL 77+ assets synchronously in a single `preload()` call:

```
BootScene.preload()
  -> 3 tileset images
  -> 2 ground tile images
  -> 12 player body spritesheets
  -> 1 legacy player spritesheet
  -> 6 head covering spritesheets
  -> 23 NPC spritesheets
  -> 23 NPC portrait images
  -> 22 object sprites
  -> 9 UI icons
  -> 3 background images
  -> (77+ total Phaser load calls)
```

All assets are loaded before `WorldScene` starts. No lazy loading, no zone-based partitioning, no atlas packing.

### 1.3 Current Sprite Specifications

**Player sprites**: 128x128 frames, 4 columns x 4 rows = 16 frames per sheet (512x512 PNG)
- Row 0 (frames 0-3): Walk down
- Row 1 (frames 4-7): Walk left
- Row 2 (frames 8-11): Walk right
- Row 3 (frames 12-15): Walk up

**NPC sprites**: Same 128x128 frame layout as player, but only frames 0-2 used (idle shift + blink)

**Player compositing**: 2-layer system (body sprite + head covering sprite overlaid), skin tone via tint multiply

### 1.4 Current Audio Architecture

Howler.js-based `AudioManager` singleton with 5 channels (master, ambient, bgm, sfx, pronunciation):
- SFX: Lazy-loaded on first play, cached in plain object (`sfxCache`)
- Ambient: Single Howl per zone, crossfade on transition, files at `/assets/audio/ambient/ambient-{zoneName}.mp3` (but **no files exist** in this directory)
- BGM: Single Howl, crossfade, files at `/assets/audio/bgm/bgm-{trackName}.mp3` (but **no files exist** -- the game has NO music by design, though BGM code is present)
- Pronunciation: LRU cache (50 words, 28 letters), lazy-loaded from `/assets/audio/words/{wordId}.mp3` and `/assets/audio/letters/{letter}.mp3`

### 1.5 Current Map System

Maps are NOT loaded from Tiled TMX files. Instead, each zone defines a `buildMap()` function that procedurally generates a 2D tile array (sand/grass/water/ice) in JavaScript. `MapLoader.js` reads this array and creates individual `Phaser.GameObjects.Image` instances per tile cell -- one image per 64x64 cell. For a 40x30 zone, that is 1,200 individual image objects.

7 TMX files exist in `public/assets/maps/` but are unused.

### 1.6 Critical Problems

1. **No lazy loading**: All 77+ assets load upfront. At 350+ NPCs and 24 zones, this becomes 500+ load calls before the game starts.
2. **No atlas packing**: Every sprite is a separate HTTP request. 33 object sprites = 33 requests.
3. **One image per tile**: A 40x30 map creates 1,200 Phaser images. A 60x40 map creates 2,400. This does not scale.
4. **22.4MB placeholder GIFs**: Japanese-themed animated backgrounds completely wrong for the game's aesthetic.
5. **Zero pronunciation audio**: 5,000+ word pronunciations need to be generated.
6. **Zero ambient audio**: All zone ambient references point to nonexistent files.
7. **Legacy sprite duplication**: ~17 pre-faceless sprites exist at the root level alongside the faceless versions.
8. **No WebP**: All images are PNG with no modern format optimization.

---

## 2. Sprite Asset Requirements

### 2.1 Player Character Sprites

#### Overworld (existing pattern, expanded)

| Asset | Frame Size | Sheet Layout | Frames | Sheets | Purpose |
|-------|-----------|--------------|--------|--------|---------|
| Body outfits | 128x128 | 4x4 | 16 | 24 (+12 new) | Walk 4-dir, idle 4-dir |
| Head coverings | 128x128 | 4x4 | 16 | 10 (+4 new) | Synced overlay |
| **Subtotal** | | | | **34 sheets** | |

New outfits for expansion (v6.0-v9.0):
- `battle-tunic`, `mage-robe`, `assassin-cloak`, `heavy-armor`
- `damascene-silk`, `timbuktu-indigo`, `cordoba-embroidered`, `cairo-linen`
- `samarkand-brocade`, `fez-leather`, `granada-court`, `bedouin-nomad`

New head coverings:
- `scholar-cap`, `battle-helm`, `desert-veil`, `artisan-headband`

#### Battle Sprites (NEW for v6.0)

| Asset | Frame Size | Sheet Layout | Frames | Sheets | Purpose |
|-------|-----------|--------------|--------|--------|---------|
| Player battle idle | 128x128 | 4x1 | 4 | 1 | Breathing animation |
| Player attack poses | 128x128 | 6x1 | 6 | 4 | Slash, thrust, cast, defend |
| Player hit reaction | 128x128 | 3x1 | 3 | 1 | Flinch, knockback, recover |
| Player cast spell | 128x128 | 8x1 | 8 | 1 | Root magic casting |
| Player victory | 128x128 | 4x1 | 4 | 1 | Celebration pose |
| Player defeat | 128x128 | 4x1 | 4 | 1 | Collapse (respectful) |
| **Subtotal** | | | | **9 sheets** | |

#### Emotes and Interaction (NEW for v9.0)

| Asset | Frame Size | Sheet Layout | Frames | Sheets | Purpose |
|-------|-----------|--------------|--------|--------|---------|
| Emote bubbles | 64x64 | 8x1 | 8 | 1 | Confusion, joy, surprise, anger, thought, gratitude, greeting, farewell |
| Interaction anims | 128x128 | 4x4 | 16 | 1 | Reading, writing, praying, crafting |
| **Subtotal** | | | | **2 sheets** | |

**Total player sheets: 45** (~45 x ~40KB avg = ~1.8MB uncompressed)

### 2.2 NPC Sprites

#### NPC Tiers

Not all 350+ NPCs need unique spritesheets. Use a tiered system:

| Tier | Count | Unique Sheet | Animation Frames | Description |
|------|-------|-------------|------------------|-------------|
| **A - Major NPCs** | 30 | Yes (unique) | 16 (4-dir walk + idle) | Quest-givers, companions, faction leaders |
| **B - Named NPCs** | 80 | Semi-unique (base + recolor) | 8 (2-dir walk + idle) | Shop owners, teachers, zone-specific |
| **C - Generic NPCs** | 120 | Shared (10 base archetypes) | 4 (down-idle + blink) | Citizens, guards, workers |
| **D - Crowd NPCs** | 120+ | Shared (5 archetypes) | 2 (idle only) | Market crowds, background |

#### NPC Base Archetypes (recolorable via Phaser tint)

10 archetypes for Tier C, 5 for Tier D:

**Tier C archetypes**: `scholar`, `merchant`, `guard`, `artisan`, `farmer`, `elder`, `child`, `noble`, `worker`, `traveler`
**Tier D archetypes**: `crowd-male-a`, `crowd-male-b`, `crowd-female-a`, `crowd-female-b`, `crowd-child`

Each archetype has variants via clothing tint + head covering combination:
- 4 skin tones (existing tint system)
- 3-5 clothing color presets per zone
- 4 head covering options

This gives 10 archetypes x 4 tones x 4 coverings = 160 visual variants from 10 base sheets.

#### NPC Sprite Budget

| Asset | Frame Size | Sheets | Approx Size |
|-------|-----------|--------|-------------|
| 30 Tier A unique | 128x128, 4x4 | 30 | 1.2MB |
| 80 Tier B (20 bases x 4 recolors) | 128x128, 2x4 | 20 | 400KB |
| 10 Tier C archetypes | 128x128, 2x2 | 10 | 100KB |
| 5 Tier D archetypes | 128x128, 1x2 | 5 | 30KB |
| **Total** | | **65 sheets** | **~1.7MB** |

#### NPC Portraits

| Asset | Size | Count | Approx Size |
|-------|------|-------|-------------|
| Tier A portraits (unique silhouette) | 256x256 | 30 | 300KB |
| Tier B portraits (archetype + variation) | 256x256 | 20 bases | 200KB |
| Tier C/D (no portrait, text-only dialogue) | -- | 0 | 0 |
| **Total** | | **50 portraits** | **~500KB** |

### 2.3 Enemy and Battle Sprites (NEW for v6.0)

| Asset | Frame Size | Sheet Layout | Sheets | Purpose |
|-------|-----------|--------------|--------|---------|
| 20 enemy types (idle+attack+hit+defeat) | 128x128 | 6x4 (24 frames) | 20 | Battle opponents |
| 8 boss sprites (larger, more frames) | 192x192 | 8x6 (48 frames) | 8 | Zone bosses |
| 10 spell effect animations | 128x128 | 8x1 | 10 | Root magic visuals |
| Damage number font | 32x32 per glyph | atlas | 1 | Battle UI |
| Status effect icons | 32x32 | 8x4 atlas | 1 | Buff/debuff indicators |
| **Total** | | | **40 sheets** | **~2.0MB** |

Enemy types (faceless, per hard constraint):
- `sand-djinn`, `ink-elemental`, `paper-golem`, `dust-wraith`, `stone-guardian`
- `wind-spirit`, `water-serpent`, `fire-phoenix`, `shadow-jackal`, `light-wisp`
- `root-tangler`, `grammar-sphinx`, `vowel-viper`, `consonant-cobra`, `verb-vulture`
- `market-mimic`, `scroll-phantom`, `star-moth`, `dune-scorpion`, `tide-crab`

### 2.4 Environment Tile Assets

| Asset | Tile Size | Sheet Size | Sheets | Purpose |
|-------|----------|-----------|--------|---------|
| Shared base tileset | 64x64 | 1024x1024 | 1 | Sand, grass, water, stone, paths |
| Baghdad tileset | 64x64 | 1024x1024 | 1 | Abbasid architecture, paper mill tiles |
| Cordoba tileset | 64x64 | 1024x1024 | 1 | Umayyad arches, garden tiles |
| Timbuktu tileset | 64x64 | 1024x1024 | 1 | Mud-brick, desert university |
| Damascus tileset | 64x64 | 1024x1024 | 1 | Souk corridors, workshop tiles |
| Cairo tileset | 64x64 | 1024x1024 | 1 | Fatimid minarets, Nile tiles |
| Fez tileset | 64x64 | 1024x1024 | 1 | Tannery vats, medina walls |
| Samarkand tileset | 64x64 | 1024x1024 | 1 | Registan tiles, silk patterns |
| Granada tileset | 64x64 | 1024x1024 | 1 | Alhambra gardens, fountain tiles |
| Fantasy base tileset | 64x64 | 1024x1024 | 1 | Magical terrain variants |
| Interior tileset (expanded) | 64x64 | 1024x1024 | 1 | Floors, carpets, walls, furniture bases |
| Animated tiles (water, torches, grass) | 64x64 | 256x256 | 3 | 4-frame animations |
| **Total** | | | **14 sheets** | **~2.8MB** |

### 2.5 Object Sprites

| Category | Count | Avg Size | Total Approx |
|----------|-------|----------|-------------|
| Furniture (tables, shelves, carpets, cushions) | 40 | 4KB | 160KB |
| Containers (chests, pots, barrels, crates, baskets) | 30 | 4KB | 120KB |
| Nature (trees, rocks, flowers, bushes) | 40 | 6KB | 240KB |
| Architecture (doors, windows, arches, columns, walls) | 50 | 8KB | 400KB |
| Market (stalls, goods, signs, carts) | 40 | 5KB | 200KB |
| Workshop (anvils, looms, kilns, tools, materials) | 30 | 4KB | 120KB |
| Educational (books, scrolls, quills, ink, astrolabes) | 30 | 3KB | 90KB |
| Water features (fountains, wells, canals, waterfalls) | 20 | 5KB | 100KB |
| Lighting (lanterns, torches, candles, braziers) | 15 | 3KB | 45KB |
| Signs and labels (Arabic signboards) | 25 | 3KB | 75KB |
| Animated objects (4-frame sheets) | 20 | 16KB | 320KB |
| **Total** | **340** | | **~1.9MB** |

These will be packed into zone-specific atlases (see section 3).

### 2.6 UI Sprites

| Asset | Format | Count | Size |
|-------|--------|-------|------|
| Button states (normal, hover, pressed, disabled) | 4-state sheet | 8 types | 80KB |
| Islamic geometric border frames | 9-slice PNG | 6 variants | 60KB |
| Inventory slot frames | 64x64 | 1 sheet | 10KB |
| Equipment slot icons | 32x32 atlas | 1 sheet (64 icons) | 40KB |
| Skill tree icons | 48x48 atlas | 1 sheet (60 icons) | 50KB |
| Status bar frames (health, mana, stamina, XP) | sliced | 4 | 20KB |
| Map markers and pins | 32x32 atlas | 1 sheet (20 icons) | 15KB |
| Notification badges | 24x24 atlas | 1 sheet | 8KB |
| Cursor set (pointer, interact, attack, speak, grab) | 32x32 | 1 sheet | 10KB |
| Faction emblems | 64x64 | 6 | 24KB |
| **Total** | | | **~320KB** |

### 2.7 Total Sprite Asset Summary

| Category | Sheets/Files | Estimated Size |
|----------|-------------|----------------|
| Player sprites | 45 | 1.8MB |
| NPC sprites + portraits | 115 | 2.2MB |
| Enemy/battle sprites | 40 | 2.0MB |
| Tilesets | 14 | 2.8MB |
| Object sprites | 340 | 1.9MB |
| UI sprites | ~30 | 0.3MB |
| **TOTAL** | **~584 assets** | **~11.0MB** (uncompressed PNG) |
| **After WebP + atlas packing** | **~80 atlas files** | **~4.5MB** |

---

## 3. Sprite Atlas Pipeline

### 3.1 Tool Recommendation

**Primary: free-tex-packer-core (npm)**
- Free, open source, runs as Node.js script
- Outputs Phaser 3-compatible JSON hash or JSON array atlas format
- Integrates into npm build scripts and CI
- No GUI dependency (headless atlas generation)

**Secondary: TexturePacker (for artists)**
- GUI tool for manual atlas design and previewing
- Exports same Phaser 3 atlas format
- Used during art creation, NOT in the build pipeline
- Free tier sufficient for development; Pro for trimming and polygon packing

**Not recommended: ShoeBox** (discontinued, Flash-based)

### 3.2 Source Directory Structure

```
assets-source/                          # Git-tracked raw sprites (NOT in public/)
  player/
    bodies/
      simple-thobe/
        walk-down-0.png ... walk-down-3.png
        walk-left-0.png ... walk-up-3.png
      battle/
        idle-0.png ... idle-3.png
        attack-slash-0.png ... attack-slash-5.png
    heads/
      kufi/
        walk-down-0.png ... walk-up-3.png
  npcs/
    tier-a/
      scholar-yusuf/
        walk-down-0.png ... walk-up-3.png
      merchant-fatima/
        ...
    tier-b/
      bases/
        merchant-base/
          walk-down-0.png ... idle-1.png
    tier-c/
      archetypes/
        scholar/
          idle-0.png idle-1.png blink-0.png blink-1.png
    tier-d/
      archetypes/
        crowd-male-a/
          idle-0.png idle-1.png
  enemies/
    sand-djinn/
      idle-0.png ... defeat-3.png
    bosses/
      zone-boss-baghdad/
        idle-0.png ... special-attack-7.png
  objects/
    zone-shared/
      palm.png, rock1.png, ...
    zone-baghdad/
      house-of-wisdom.png, paper-mill.png, ...
    zone-cordoba/
      arch-horseshoe.png, fountain-lion.png, ...
    animated/
      torch/
        frame-0.png ... frame-3.png
      water/
        frame-0.png ... frame-3.png
  tilesets/
    base-shared/
      sand-01.png ... water-04.png
    zone-baghdad/
      abbasid-floor-01.png ... dome-roof-04.png
  ui/
    buttons/
      btn-primary-normal.png ... btn-primary-disabled.png
    frames/
      islamic-border-01.png ... islamic-border-06.png
    icons/
      skill-reading.png ... skill-culture.png
  effects/
    spells/
      fire-burst/
        frame-0.png ... frame-7.png
```

### 3.3 Generated Atlas Output Structure

```
public/assets/atlas/                    # Build-generated (gitignored)
  core/
    player-overworld.json + .png        # All player body/head walk sprites
    player-battle.json + .png           # All battle poses
    ui-shared.json + .png               # All UI elements
    effects.json + .png                 # Spell effects
  zone/
    zone-oasis-village.json + .png      # Zone-specific objects + tiles
    zone-baghdad.json + .png
    zone-cordoba.json + .png
    zone-timbuktu.json + .png
    zone-damascus.json + .png
    zone-cairo.json + .png
    zone-fez.json + .png
    zone-samarkand.json + .png
    zone-granada.json + .png
    zone-star-oasis.json + .png
    zone-mountain-words.json + .png
    zone-sea-ink.json + .png
    zone-forest-tales.json + .png
    zone-desert-silence.json + .png
    zone-merchants-island.json + .png
    zone-fortress-secrets.json + .png
    zone-garden-spirits.json + .png
    (... 8 existing zones too)
  npcs/
    npcs-tier-a.json + .png             # 30 major NPC sheets
    npcs-tier-b.json + .png             # 20 base recolorable sheets
    npcs-tier-c.json + .png             # 10 archetype sheets
    npcs-tier-d.json + .png             # 5 crowd sheets
    portraits-tier-a.json + .png        # 30 unique portraits
    portraits-tier-b.json + .png        # 20 base portraits
  enemies/
    enemies-shared.json + .png          # 20 enemy type sheets
    bosses.json + .png                  # 8 boss sheets
  tileset/
    tileset-shared.json + .png          # Base terrain tileset
    tileset-{zoneName}.json + .png      # Per-zone architectural tilesets
    tileset-animated.json + .png        # Animated tile frames
    tileset-interior.json + .png        # Interior floor/wall tiles
```

### 3.4 Build-Time Atlas Generation

**npm script: `build:atlas`**

```json
{
  "scripts": {
    "build:atlas": "node scripts/generate-atlases.js",
    "prebuild": "npm run build:atlas",
    "dev:atlas": "node scripts/generate-atlases.js --watch"
  }
}
```

**`scripts/generate-atlases.js` design:**

```javascript
// Pseudocode for atlas generation script
import { packAsync } from 'free-tex-packer-core';
import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';

const ATLAS_CONFIGS = [
  {
    name: 'player-overworld',
    input: 'assets-source/player/bodies/**/*.png',
    output: 'public/assets/atlas/core/',
    maxWidth: 2048,
    maxHeight: 2048,
    padding: 2,
    allowRotation: false,  // Phaser spritesheets don't support rotation
    exporter: 'Phaser3',
  },
  {
    name: 'zone-baghdad',
    input: [
      'assets-source/objects/zone-baghdad/**/*.png',
      'assets-source/objects/zone-shared/**/*.png',  // Include shared objects
    ],
    output: 'public/assets/atlas/zone/',
    maxWidth: 2048,
    maxHeight: 2048,
  },
  // ... one config per atlas
];

async function generateAtlas(config) {
  const files = await glob(config.input);
  const images = await Promise.all(
    files.map(async (f) => ({
      path: path.basename(f, '.png'),  // Frame name = filename sans extension
      contents: await fs.readFile(f),
    }))
  );

  const result = await packAsync(images, {
    textureName: config.name,
    width: config.maxWidth,
    height: config.maxHeight,
    padding: config.padding || 2,
    allowRotation: config.allowRotation ?? false,
    exporter: config.exporter || 'Phaser3',
    packer: 'OptimalPacker',
    removeFileExtension: true,
  });

  for (const item of result) {
    await fs.writeFile(
      path.join(config.output, item.name),
      item.buffer
    );
  }
}
```

### 3.5 Vite Plugin Integration

Add a Vite plugin that runs atlas generation on dev server start and watches for changes:

```javascript
// vite.config.js addition
function atlasGeneratorPlugin() {
  return {
    name: 'atlas-generator',
    async buildStart() {
      const { generateAllAtlases } = await import('./scripts/generate-atlases.js');
      await generateAllAtlases();
    },
    configureServer(server) {
      // Watch assets-source/ for changes, regenerate affected atlas
      server.watcher.add('assets-source/**/*.png');
      server.watcher.on('change', async (file) => {
        if (file.includes('assets-source')) {
          const { regenerateAffectedAtlas } = await import('./scripts/generate-atlases.js');
          await regenerateAffectedAtlas(file);
        }
      });
    },
  };
}
```

### 3.6 Frame Naming Conventions

Frame names within atlases follow a strict hierarchy:

```
{category}-{subject}-{action}-{direction}-{frame}

Examples:
  player-simple-thobe-walk-down-0
  player-simple-thobe-walk-down-1
  player-kufi-walk-left-2
  npc-scholar-yusuf-walk-up-3
  npc-merchant-base-idle-down-0
  enemy-sand-djinn-attack-0
  obj-palm-0
  obj-torch-anim-2
  tile-baghdad-floor-abbasid-01
  ui-btn-primary-normal
  effect-fire-burst-4
```

Rules:
- All lowercase, hyphen-separated
- No spaces, no underscores in frame names
- Animated sequences end with numeric index (0-based)
- Direction encoding: `down`, `left`, `right`, `up`
- Tile coordinates: `col-row` format when relevant

### 3.7 Migration from Individual Sprites to Atlases

**Phase 1 (v6.0)**: Generate atlases alongside existing individual sprites. `BootScene` loads atlases where available, falls back to individual sprites. This allows incremental migration.

**Phase 2 (v7.0)**: All new zone content uses atlases exclusively. Begin migrating existing 8 zones.

**Phase 3 (v10.0)**: Remove all individual sprite loading. `BootScene` loads only core atlases. Zone atlases loaded by `AssetStreamingManager`.

---

## 4. Tilemap Pipeline

### 4.1 Transition from Procedural to Tiled Maps

The current `buildMap()` procedural approach creates 1,200+ individual Phaser images per zone. This must be replaced with Tiled tilemaps that Phaser renders as single GPU-batched layers.

**Benefits of Tiled tilemaps:**
- Single draw call per layer (vs. 1,200 individual draws)
- Built-in collision layer support
- Artist-friendly visual editor
- Standard JSON export format
- Animated tile support in Phaser 3
- Object layers for NPC spawn points, interactable positions

### 4.2 Tiled Map Editor Workflow

#### Zone Map Dimensions

| Zone Type | Grid Size | Tile Size | Pixel Size | Layers |
|-----------|----------|-----------|-----------|--------|
| Small zone (village, camp) | 40x30 | 64x64 | 2560x1920 | 5 |
| Medium zone (city district) | 60x40 | 64x64 | 3840x2560 | 6 |
| Large zone (full city) | 80x60 | 64x64 | 5120x3840 | 7 |
| Interior (small house) | 10x8 | 64x64 | 640x512 | 4 |
| Interior (large building) | 20x16 | 64x64 | 1280x1024 | 5 |
| Battle arena | 16x12 | 64x64 | 1024x768 | 4 |

#### Layer Stack (bottom to top)

```
Layer 0: Ground          (terrain tiles: sand, grass, water, stone, carpet)
Layer 1: Ground Detail   (cracks, moss, patterns, path edges, threshold tiles)
Layer 2: Decoration Low  (shadows, ground-level objects: carpets, puddles, flowers)
Layer 3: Collision       (invisible, marks impassable tiles — walls, water, barriers)
Layer 4: Objects         (furniture, containers, vegetation — Y-sorted with characters)
Layer 5: Overhead        (roofs, archways, tree canopy — rendered above player)
Layer 6: Interaction     (invisible, marks interactable zones — doors, chests, signs)
```

#### Object Layers (Tiled object groups)

```
NPC Spawns:    { id, npcTier, archetype, patrol: [{x,y}...], schedule }
Interactables: { id, type, category, locked, unlockFlag }
Exit Zones:    { edge, tileRange, targetZone, targetSpawn }
Ambient Zones: { soundId, radius, volume }  // For localized ambient sounds
Light Sources: { type, radius, color, flicker }
```

### 4.3 Tileset Organization

**Shared base tileset** (`tileset-shared.png`, 1024x1024):
- 16x16 tile grid within 1024x1024 = 256 tiles
- Row 0-3: Sand variants (16 tiles), grass variants (16), water (16), stone (16)
- Row 4-7: Path tiles (straight, corner, T, cross), transitions (sand-to-grass, etc.)
- Row 8-11: Common walls, floors, roofing
- Row 12-15: Reserved for animated tile references

**Per-zone tileset** (`tileset-{zoneName}.png`, 1024x1024):
- Zone-specific architectural tiles
- Unique decorative patterns
- Zone-specific ground details
- Cultural motifs (see section 7)

**Interior tileset** (`tileset-interior.png`, 1024x1024):
- Floor types (wood, carpet, tile, marble)
- Wall segments (mud-brick, stone, plaster)
- Furniture tiles (shelving, counter, cabinet)
- Interior decorations

### 4.4 Animated Tile Support in Phaser 3

Phaser 3 supports animated tiles via the `animatedTiles` plugin or manual implementation.

**Recommended approach: Custom AnimatedTileManager**

```javascript
// Tile IDs in Tiled that should animate:
// Water: tile 48 -> frames [48, 49, 50, 51] at 4fps
// Torch: tile 112 -> frames [112, 113, 114, 115] at 8fps
// Grass sway: tile 64 -> frames [64, 65] at 2fps

class AnimatedTileManager {
  constructor(scene, tilemap) {
    this.scene = scene;
    this.tilemap = tilemap;
    this.animatedTiles = [];
  }

  registerAnimatedTile(tileId, frames, frameRate) {
    this.animatedTiles.push({
      tileId,
      frames,
      frameRate,
      elapsed: 0,
      currentFrame: 0,
    });
  }

  update(delta) {
    for (const anim of this.animatedTiles) {
      anim.elapsed += delta;
      const frameDuration = 1000 / anim.frameRate;
      if (anim.elapsed >= frameDuration) {
        anim.elapsed -= frameDuration;
        anim.currentFrame = (anim.currentFrame + 1) % anim.frames.length;
        // Update all tiles with this ID across all layers
        this.tilemap.layers.forEach(layer => {
          layer.data.forEach(row => {
            row.forEach(tile => {
              if (tile.index === anim.tileId) {
                tile.index = anim.frames[anim.currentFrame];
              }
            });
          });
        });
      }
    }
  }
}
```

### 4.5 Export Format and Loading

**Export**: Tiled maps exported as JSON (`.json`, not `.tmx`).

**Tiled export settings**:
- Format: JSON map format
- Embed tilesets: No (external tileset references)
- Tile layer format: CSV (compact)
- Tile render order: Right-down

**File location**:
```
public/assets/maps/
  zones/
    oasis-village.json
    baghdad.json
    cordoba.json
    ...
  interiors/
    scholar-house.json
    merchant-shop.json
    ...
  battle/
    arena-desert.json
    arena-library.json
    ...
```

**Loading in Phaser 3**:

```javascript
// In zone manifest loader (not BootScene)
this.load.tilemapTiledJSON('map-baghdad', '/assets/maps/zones/baghdad.json');
this.load.image('tileset-shared', '/assets/atlas/tileset/tileset-shared.png');
this.load.image('tileset-baghdad', '/assets/atlas/tileset/tileset-baghdad.png');

// In create():
const map = this.make.tilemap({ key: 'map-baghdad' });
const sharedTiles = map.addTilesetImage('shared', 'tileset-shared');
const zoneTiles = map.addTilesetImage('baghdad', 'tileset-baghdad');

const ground = map.createLayer('Ground', [sharedTiles, zoneTiles]);
const detail = map.createLayer('Ground Detail', [sharedTiles, zoneTiles]);
const collision = map.createLayer('Collision', [sharedTiles, zoneTiles]);
collision.setCollisionByExclusion([-1]); // All non-empty tiles collide
collision.setVisible(false);
```

### 4.6 MapLoader Refactoring Plan

The existing `MapLoader.js` must be refactored to support both procedural maps (backward compatibility) and Tiled JSON maps:

```javascript
class MapLoader {
  create(zone, mapWidth, mapHeight) {
    if (zone.tilemapKey) {
      return this.createFromTilemap(zone);  // New path
    }
    return this.createFromProcedural(zone, mapWidth, mapHeight);  // Legacy path
  }

  createFromTilemap(zone) {
    const map = this.scene.make.tilemap({ key: zone.tilemapKey });
    // ... Tiled-based setup
  }

  createFromProcedural(zone, mapWidth, mapHeight) {
    // ... existing buildMap() logic (unchanged)
  }
}
```

---

## 5. Audio Asset Pipeline

### 5.1 Current Audio Inventory

| Category | Count | Format | Status |
|----------|-------|--------|--------|
| SFX | 14 | OGG | Working |
| Letter pronunciations | 28 | MP3 | Working |
| Zone ambients | 0 | -- | Referenced but missing |
| Word pronunciations | 0 | -- | Not started |
| BGM tracks | 0 | -- | Not needed (NO music constraint) |

### 5.2 SFX Expansion (14 to 200+)

#### Category Breakdown

**UI SFX (15 total, 8 new)**

| SFX Name | File | Duration | Description |
|----------|------|----------|-------------|
| `click` | (existing) | 100ms | Button press |
| `bookopen` | (existing) | 300ms | Menu open |
| `bookflip` | (existing) | 200ms | Page turn |
| `wrong` | (existing) | 300ms | Error feedback |
| `hover` | NEW | 50ms | Button hover |
| `tab-switch` | NEW | 100ms | Tab navigation |
| `notification` | NEW | 200ms | Alert popup |
| `inventory-open` | NEW | 200ms | Bag opening |
| `inventory-close` | NEW | 150ms | Bag closing |
| `equip` | NEW | 200ms | Item equipped |
| `unequip` | NEW | 150ms | Item removed |
| `map-open` | NEW | 300ms | World map unfurl |
| `scroll-write` | NEW | 400ms | Quill on paper |
| `menu-confirm` | NEW | 150ms | Selection confirmed |
| `menu-cancel` | NEW | 100ms | Selection cancelled |

**Battle SFX (25 total, all new)**

| SFX Name | Duration | Description |
|----------|----------|-------------|
| `sword-slash` | 200ms | Physical attack |
| `sword-clash` | 300ms | Parry/block |
| `shield-block` | 200ms | Defend action |
| `spell-cast` | 400ms | Magic initiation |
| `spell-fire` | 500ms | Fire element release |
| `spell-water` | 500ms | Water element release |
| `spell-earth` | 400ms | Earth element impact |
| `spell-wind` | 500ms | Wind element whoosh |
| `spell-light` | 400ms | Light element flash |
| `spell-shadow` | 500ms | Shadow element creep |
| `spell-stone` | 300ms | Stone element crack |
| `spell-plant` | 400ms | Plant element grow |
| `spell-metal` | 300ms | Metal element ring |
| `spell-spirit` | 600ms | Spirit element hum |
| `hit-light` | 150ms | Minor damage |
| `hit-heavy` | 250ms | Major damage |
| `hit-critical` | 400ms | Critical hit |
| `miss` | 200ms | Attack whiff |
| `heal` | 400ms | Health restoration |
| `buff-apply` | 300ms | Status buff |
| `debuff-apply` | 300ms | Status debuff |
| `combo-chain` | 200ms | Combo continuation |
| `battle-start` | 500ms | Encounter begin |
| `battle-victory` | 800ms | Victory fanfare (SFX, not music) |
| `battle-defeat` | 600ms | Defeat sting |

**Environment SFX (15 total, all new)**

| SFX Name | Duration | Description |
|----------|----------|-------------|
| `door-open` | 300ms | Wooden door creak |
| `door-close` | 250ms | Door shutting |
| `door-locked` | 200ms | Locked door rattle |
| `water-splash` | 300ms | Fountain, well |
| `fire-crackle` | 400ms | Torch, brazier |
| `wind-gust` | 600ms | Desert wind |
| `sand-shift` | 300ms | Walking on sand |
| `stone-step` | 150ms | Walking on stone |
| `wood-creak` | 200ms | Floor boards |
| `fabric-rustle` | 200ms | Tent, curtain |
| `pottery-break` | 300ms | Pot shatter |
| `metalwork-hammer` | 300ms | Blacksmith ambient |
| `loom-weave` | 400ms | Weaving sound |
| `paper-rustle` | 200ms | Manuscript handling |
| `bell-chime` | 500ms | Market bell, alert |

**NPC Interaction SFX (20 total, all new)**

| SFX Name | Duration | Description |
|----------|----------|-------------|
| `npc-greet-male` | 300ms | Male greeting vocalization (no words) |
| `npc-greet-female` | 300ms | Female greeting vocalization |
| `npc-agree` | 200ms | Agreement vocalization |
| `npc-disagree` | 200ms | Disagreement vocalization |
| `npc-surprise` | 200ms | Surprise vocalization |
| `npc-laugh` | 400ms | Laughter |
| `npc-hmm` | 300ms | Thinking/pondering |
| `npc-whisper` | 300ms | Secret/gossip |
| `npc-call` | 400ms | Calling out |
| `npc-merchant-hello` | 300ms | Merchant greeting |
| `npc-crowd-murmur` | 800ms | Background crowd |
| `npc-child-play` | 400ms | Children playing |
| `npc-scholar-read` | 300ms | Reading aloud murmur |
| `shop-purchase` | 200ms | Transaction complete |
| `quest-accept` | 300ms | Quest accepted |
| `quest-complete` | 500ms | Quest completed |
| `gift-give` | 300ms | Gift exchange |
| `reputation-up` | 400ms | Faction gain |
| `reputation-down` | 300ms | Faction loss |
| `companion-join` | 400ms | Companion recruited |

**Learning SFX (12 total, 4 existing + 8 new)**

| SFX Name | Duration | Description |
|----------|----------|-------------|
| `correct` | (existing) | 200ms | Correct answer |
| `wrong` | (existing) | 300ms | Wrong answer |
| `wordlearned` | (existing) | 400ms | New word acquired |
| `levelup` | (existing) | 500ms | Level up |
| `streak` | (existing) | 300ms | Streak milestone |
| `mastery` | NEW | 500ms | Word fully mastered |
| `root-discover` | NEW | 400ms | Arabic root identified |
| `grammar-unlock` | NEW | 400ms | Grammar rule learned |
| `skill-point` | NEW | 200ms | Skill point earned |
| `quiz-start` | NEW | 300ms | Quiz begins |
| `quiz-timer` | NEW | 200ms | Timer warning |
| `pronunciation-perfect` | NEW | 300ms | Perfect pronunciation match |
| `calligraphy-stroke` | NEW | 200ms | Calligraphy practice |

**Footstep Variants (8 total, 1 existing + 7 new)**

| SFX Name | Description |
|----------|-------------|
| `footstep` | (existing) Generic footstep |
| `footstep-sand` | NEW - Soft sand crunch |
| `footstep-stone` | NEW - Hard stone tap |
| `footstep-wood` | NEW - Wooden floor thud |
| `footstep-grass` | NEW - Grass rustle |
| `footstep-water` | NEW - Shallow water splash |
| `footstep-carpet` | NEW - Muffled carpet step |
| `footstep-snow` | NEW - Snow crunch |

**Interaction SFX (15 total, 4 existing + 11 new)**

| SFX Name | Duration | Description |
|----------|----------|-------------|
| `chest` | (existing) | 300ms | Chest open |
| `coin` | (existing) | 200ms | Dirham pickup |
| `coins2` | (existing) | 300ms | Multiple coins |
| `transition` | (existing) | 400ms | Zone transition |
| `item-pickup` | NEW | 200ms | Generic item get |
| `item-drop` | NEW | 200ms | Item discarded |
| `craft-start` | NEW | 300ms | Crafting begins |
| `craft-success` | NEW | 400ms | Crafting complete |
| `craft-fail` | NEW | 300ms | Crafting failed |
| `lock-pick` | NEW | 400ms | Lock mechanism |
| `lock-open` | NEW | 300ms | Lock opened |
| `secret-found` | NEW | 500ms | Hidden item discovered |
| `puzzle-piece` | NEW | 200ms | Puzzle element placed |
| `puzzle-complete` | NEW | 500ms | Puzzle solved |
| `achievement` | NEW | 600ms | Achievement unlocked |

**Total SFX: ~110 individual sounds**

### 5.3 Audio Format Specifications

| Format | Use Case | Settings | Why |
|--------|----------|----------|-----|
| **OGG Vorbis** | SFX (primary) | 44.1kHz, mono, VBR q4 (~96kbps) | Small files, good quality, supported by Howler.js |
| **MP3** | SFX (fallback) | 44.1kHz, mono, 96kbps CBR | Safari fallback (Safari has spotty OGG) |
| **OGG Vorbis** | Ambient loops | 44.1kHz, stereo, VBR q5 (~128kbps) | Longer files benefit from VBR |
| **MP3** | Ambient (fallback) | 44.1kHz, stereo, 128kbps CBR | Safari fallback |
| **MP3** | Pronunciations | 22.05kHz, mono, 64kbps CBR | Speech doesn't need high fidelity |
| **OGG** | Audio sprites | 44.1kHz, mono, VBR q4 | Combined SFX for fewer HTTP requests |

**Howler.js format priority**: `['.ogg', '.mp3']` -- Howler picks the first supported format.

### 5.4 Ambient Sound Design

**Architecture: Layered ambient system**

Each zone has a base ambient loop plus optional layered tracks that blend based on player location, weather, and time of day.

#### Zone Ambient Tracks (24 zones)

| Zone | Base Loop (30s) | Layer 1 | Layer 2 | Layer 3 |
|------|----------------|---------|---------|---------|
| Oasis Village | Desert wind + birds | Fountain water | Market chatter (near souk) | Children playing (daytime) |
| Ancient Library | Quiet room tone | Page turning | Quill scratching | Distant footsteps |
| Desert Marketplace | Crowd murmur | Metal clanging | Animal sounds | Merchant calls |
| Coastal Port | Waves + seagulls | Boat creaking | Dock activity | Net hauling |
| Royal Palace | Grand hall reverb | Fountain courtyard | Guard footsteps | Fabric rustling |
| Baghdad | Scholarly murmur | Fountain + quills | Paper mill water | Observatory gears |
| Cordoba | Water channels | Birdsong | Hammer on stone | Market chatter |
| Timbuktu | Desert wind | Camel bells | Distant call (atmospheric) | Sand shifting |
| Damascus | Souk haggling | Hammer on steel | Water splashing | Fabric rustling |
| Cairo | Nile water | Festival drums | Market bustle | Wind through structures |
| Fez | Vat bubbling | Leather stretching | Narrow-alley echoes | Dye splashing |
| Samarkand | Loom clacking | Water in mills | Instrument clicking | Silk rustling |
| Granada | Fountain cascade | Nightingale | Wind through arches | Pen on paper |
| Star Oasis | Night desert silence | Cricket chorus | Celestial hum | Sand whisper |
| Mountain of Words | Mountain wind | Stone echo | Distant rumble | Ice crack |
| Sea of Ink | Liquid flow | Pen scratch | Ink drip | Wave-like pulse |
| Forest of Tales | Forest ambience | Story whispers | Animal rustle | Leaf fall |
| Desert of Silence | Near silence | Heartbeat | Breathing | Wind trace |
| Merchants' Island | Harbor sounds | Coin clinking | Barrel rolling | Rope creaking |
| Fortress of Secrets | Deep stone echo | Mechanism clicks | Water drip | Distant rumble |
| Garden of Spirits | Garden ambience | Water features | Insect buzz | Growth sounds |
| (+ existing 3 more) | ... | ... | ... | ... |

**Interior ambient variants**:
Each building type modifies the zone ambient by adding a reverb/muffled version of the base + interior-specific sounds (fireplace, kitchen, workshop).

**Weather layer overlays**:
- Rain: layered rain loop (light, medium, heavy)
- Sandstorm: wind + sand pelt loop
- Wind: graduated wind loop (breeze, gust, howl)
- Thunder: random thunder crack events

#### Ambient File Specifications

| Track Type | Duration | Size (OGG) | Count | Total |
|-----------|----------|-----------|-------|-------|
| Base zone loop | 30-60s | 80-150KB | 24 | ~2.4MB |
| Layer tracks | 15-30s | 40-80KB | 72 | ~4.3MB |
| Interior variants | 15-30s | 40-80KB | 30 | ~1.8MB |
| Weather overlays | 30-60s | 80-150KB | 8 | ~0.9MB |
| **Total ambient** | | | **134 tracks** | **~9.4MB** |

### 5.5 Arabic Pronunciation Pipeline

**Scale**: 5,000+ unique words, each needing an audio file.

#### TTS Provider Comparison

| Provider | Arabic Quality | Cost (5K words) | Format | Offline Batch | Recommendation |
|----------|---------------|-----------------|--------|---------------|----------------|
| **Google Cloud TTS** | Good (WaveNet voices) | ~$20 (WaveNet) | MP3/OGG/WAV | Yes (batch API) | Primary choice |
| Azure Cognitive Services | Very Good (Neural voices) | ~$16 (neural) | MP3/WAV | Yes | Best quality |
| Amazon Polly | Decent (Standard) | ~$4 (standard) | MP3/OGG | Yes | Budget option |
| ElevenLabs | Excellent | ~$100+ | MP3 | Yes | Too expensive |
| Mozilla TTS (local) | Poor for Arabic | Free | WAV | Yes | Not recommended |

**Recommended: Google Cloud TTS (WaveNet) with Azure as validation cross-check**

#### Pronunciation Generation Pipeline

```
scripts/generate-pronunciations.js
  1. Read src/data/vocabulary-final.json
  2. For each word entry:
     a. Extract Arabic text (with tashkeel/diacritics)
     b. Call Google Cloud TTS API:
        - Voice: ar-XA-Wavenet-A (male) or ar-XA-Wavenet-B (female)
        - Speaking rate: 0.85 (slightly slow for learners)
        - Audio encoding: MP3 at 22050Hz mono
     c. Post-process with ffmpeg:
        - Normalize volume to -16 LUFS
        - Trim silence (leading/trailing)
        - Compress to 64kbps MP3
     d. Save to public/assets/audio/words/{wordId}.mp3
  3. Generate manifest: word-audio-manifest.json
  4. Log missing/failed words for manual review
```

**Batch processing script**:

```javascript
// scripts/generate-pronunciations.js (pseudocode)
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import vocabulary from '../src/data/vocabulary-final.json';
import { exec } from 'child_process';

const client = new TextToSpeechClient();
const BATCH_SIZE = 50;  // API rate limit consideration
const DELAY_MS = 1000;  // Between batches

async function generateWord(wordId, arabicText) {
  const [response] = await client.synthesizeSpeech({
    input: { text: arabicText },
    voice: {
      languageCode: 'ar-XA',
      name: 'ar-XA-Wavenet-A',
    },
    audioConfig: {
      audioEncoding: 'MP3',
      sampleRateHertz: 22050,
      speakingRate: 0.85,
    },
  });

  // Write raw TTS output
  const rawPath = `temp/raw-${wordId}.mp3`;
  await fs.writeFile(rawPath, response.audioContent);

  // Post-process with ffmpeg
  const outPath = `public/assets/audio/words/${wordId}.mp3`;
  await execPromise(
    `ffmpeg -i ${rawPath} -af "silenceremove=1:0:-50dB:1:0:-50dB,loudnorm=I=-16" -ab 64k -ar 22050 -ac 1 ${outPath}`
  );

  await fs.unlink(rawPath);
}

async function generateAll() {
  const words = Object.entries(vocabulary);
  for (let i = 0; i < words.length; i += BATCH_SIZE) {
    const batch = words.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(([id, data]) => generateWord(id, data.arabic))
    );
    console.log(`Generated ${i + batch.length}/${words.length}`);
    await sleep(DELAY_MS);
  }
}
```

#### Pronunciation File Estimates

| Category | Count | Avg Size | Total |
|----------|-------|----------|-------|
| Word pronunciations (5,000) | 5,000 | 8KB | ~40MB |
| Letter pronunciations (28) | 28 (existing) | 12KB | 336KB |
| Phrase pronunciations (200) | 200 | 15KB | 3MB |
| **Total pronunciation** | **5,228** | | **~43MB** |

This is too large to ship in the initial bundle. See section 6 for streaming strategy.

### 5.6 Audio Sprite Generation

Combine related SFX into audio sprites (single file with time markers) to reduce HTTP requests:

```
public/assets/audio/sprites/
  sfx-ui.ogg + sfx-ui.json          # 15 UI sounds in one file
  sfx-battle.ogg + sfx-battle.json   # 25 battle sounds
  sfx-env.ogg + sfx-env.json         # 15 environment sounds
  sfx-npc.ogg + sfx-npc.json         # 20 NPC sounds
  sfx-learn.ogg + sfx-learn.json     # 12 learning sounds
  sfx-steps.ogg + sfx-steps.json     # 8 footstep variants
  sfx-interact.ogg + sfx-interact.json # 15 interaction sounds
```

**Generation tool: audiosprite (npm package)**

```bash
npx audiosprite -f howler2 -o public/assets/audio/sprites/sfx-ui \
  assets-source/audio/sfx/ui/*.ogg
```

Output JSON format (Howler.js compatible):
```json
{
  "src": ["sfx-ui.ogg", "sfx-ui.mp3"],
  "sprite": {
    "click": [0, 100],
    "hover": [200, 50],
    "bookopen": [350, 300],
    "notification": [750, 200]
  }
}
```

**Howler.js integration**:
```javascript
const uiSprite = new Howl({
  src: ['/assets/audio/sprites/sfx-ui.ogg', '/assets/audio/sprites/sfx-ui.mp3'],
  sprite: spriteConfig.sprite,
});
uiSprite.play('click');
```

### 5.7 Audio Directory Structure

```
public/assets/audio/
  sprites/
    sfx-ui.ogg + .json
    sfx-battle.ogg + .json
    sfx-env.ogg + .json
    sfx-npc.ogg + .json
    sfx-learn.ogg + .json
    sfx-steps.ogg + .json
    sfx-interact.ogg + .json
  ambient/
    base/
      ambient-oasis-village.ogg
      ambient-baghdad.ogg
      ambient-cordoba.ogg
      ... (24 zones)
    layers/
      layer-fountain.ogg
      layer-crowd-murmur.ogg
      layer-birdsong.ogg
      ... (72 layers)
    interior/
      interior-house-fire.ogg
      interior-library-quiet.ogg
      interior-workshop-metal.ogg
      ... (30 variants)
    weather/
      weather-rain-light.ogg
      weather-rain-heavy.ogg
      weather-sandstorm.ogg
      weather-wind-breeze.ogg
      weather-wind-howl.ogg
      weather-thunder.ogg
      weather-snow.ogg
      weather-heat-haze.ogg
  letters/
    ا.mp3 ... ي.mp3                    # (28 existing)
  words/
    w-0001.mp3 ... w-5000.mp3          # Generated pronunciation files
  phrases/
    p-greeting-01.mp3 ... p-farewell-20.mp3

assets-source/audio/                    # Pre-processed source audio (not in public/)
  sfx/
    ui/
      click.wav, hover.wav, ...
    battle/
      sword-slash.wav, ...
    env/
      door-open.wav, ...
  ambient/
    raw/
      oasis-village-base.wav
      ...
```

### 5.8 Audio Asset Budget Summary

| Category | Files | Size |
|----------|-------|------|
| SFX sprites (7 sprite files) | 14 (7 ogg + 7 json) | ~800KB |
| Ambient base loops | 24 | ~2.4MB |
| Ambient layers | 72 | ~4.3MB |
| Interior ambients | 30 | ~1.8MB |
| Weather overlays | 8 | ~0.9MB |
| Letter pronunciations | 28 | ~340KB |
| Word pronunciations | 5,000 | ~40MB |
| Phrase pronunciations | 200 | ~3MB |
| **Total** | **5,376** | **~53.5MB** |

Note: Word pronunciations (~40MB) are streaming-only. The player never downloads all 5,000 at once. Effective per-session audio is <5MB.

---

## 6. Asset Streaming Architecture

### 6.1 Design Overview

Replace the "load everything in BootScene" approach with a zone-based streaming system that loads assets on demand, preloads adjacent zones, and unloads distant assets.

```
                    BootScene (core assets only)
                           |
                    AssetStreamingManager
                    /        |         \
            ZoneManifest  LoadQueue  MemoryManager
                |            |           |
          manifest.json   Priority    LRU Eviction
          per zone        Queue       (max memory cap)
```

### 6.2 AssetStreamingManager

```javascript
/**
 * Manages zone-based asset loading, preloading, and memory management.
 * Replaces monolithic BootScene loading for zone-specific assets.
 */
class AssetStreamingManager {
  constructor(scene) {
    this.scene = scene;
    this.manifests = new Map();       // zoneId -> manifest data
    this.loadedZones = new Set();     // Currently loaded zone asset sets
    this.loadQueue = new PriorityQueue(); // { zoneId, priority, callback }
    this.maxMemoryMB = 64;            // Maximum asset memory budget
    this.currentMemoryMB = 0;
    this.loading = false;
  }

  /**
   * Load a zone manifest file (lightweight JSON listing required assets)
   */
  async loadManifest(zoneId) {
    if (this.manifests.has(zoneId)) return this.manifests.get(zoneId);

    const response = await fetch(`/assets/manifests/${zoneId}.json`);
    const manifest = await response.json();
    this.manifests.set(zoneId, manifest);
    return manifest;
  }

  /**
   * Load all assets for a zone (called on zone entry)
   */
  async loadZone(zoneId, priority = 'critical') {
    const manifest = await this.loadManifest(zoneId);

    // Check memory budget, evict if needed
    if (this.currentMemoryMB + manifest.estimatedSizeMB > this.maxMemoryMB) {
      this.evictDistantZones(zoneId);
    }

    // Queue assets by priority
    for (const asset of manifest.assets) {
      this.queueAsset(asset, priority);
    }

    return this.processQueue();
  }

  /**
   * Preload adjacent zone assets (called when player nears boundary)
   */
  preloadAdjacentZones(currentZoneId, adjacentZoneIds) {
    for (const adjId of adjacentZoneIds) {
      if (!this.loadedZones.has(adjId)) {
        this.loadZone(adjId, 'preload');
      }
    }
  }

  /**
   * Unload assets for zones far from current position
   */
  evictDistantZones(currentZoneId) {
    const adjacentZones = this.getAdjacentZones(currentZoneId);
    const keepZones = new Set([currentZoneId, ...adjacentZones]);

    for (const loadedZone of this.loadedZones) {
      if (!keepZones.has(loadedZone)) {
        this.unloadZone(loadedZone);
      }
    }
  }

  /**
   * Unload all assets for a specific zone
   */
  unloadZone(zoneId) {
    const manifest = this.manifests.get(zoneId);
    if (!manifest) return;

    for (const asset of manifest.assets) {
      if (asset.type === 'atlas') {
        this.scene.textures.remove(asset.key);
      } else if (asset.type === 'image') {
        this.scene.textures.remove(asset.key);
      } else if (asset.type === 'tilemapJSON') {
        this.scene.cache.tilemap.remove(asset.key);
      }
    }

    this.currentMemoryMB -= manifest.estimatedSizeMB;
    this.loadedZones.delete(zoneId);
  }

  /**
   * Process the load queue with priority ordering
   */
  async processQueue() {
    if (this.loading) return;
    this.loading = true;

    return new Promise((resolve) => {
      const loader = this.scene.load;

      while (!this.loadQueue.isEmpty()) {
        const item = this.loadQueue.dequeue();
        switch (item.type) {
          case 'atlas':
            loader.atlas(item.key, item.pngUrl, item.jsonUrl);
            break;
          case 'image':
            loader.image(item.key, item.url);
            break;
          case 'tilemapJSON':
            loader.tilemapTiledJSON(item.key, item.url);
            break;
          case 'audio':
            // Audio loaded via Howler, not Phaser
            break;
        }
      }

      loader.once('complete', () => {
        this.loading = false;
        resolve();
      });

      loader.start();
    });
  }
}
```

### 6.3 Zone Manifest Files

Each zone has a JSON manifest listing every asset it needs:

```json
// public/assets/manifests/baghdad.json
{
  "zoneId": "baghdad",
  "version": 2,
  "estimatedSizeMB": 0.45,
  "adjacentZones": ["damascus", "star-oasis", "timbuktu"],
  "assets": [
    {
      "type": "tilemapJSON",
      "key": "map-baghdad",
      "url": "/assets/maps/zones/baghdad.json",
      "priority": "critical",
      "sizeMB": 0.02
    },
    {
      "type": "atlas",
      "key": "zone-baghdad",
      "pngUrl": "/assets/atlas/zone/zone-baghdad.png",
      "jsonUrl": "/assets/atlas/zone/zone-baghdad.json",
      "priority": "critical",
      "sizeMB": 0.15
    },
    {
      "type": "image",
      "key": "tileset-baghdad",
      "url": "/assets/atlas/tileset/tileset-baghdad.png",
      "priority": "critical",
      "sizeMB": 0.08
    },
    {
      "type": "atlas",
      "key": "npcs-baghdad",
      "pngUrl": "/assets/atlas/npcs/zone-baghdad-npcs.png",
      "jsonUrl": "/assets/atlas/npcs/zone-baghdad-npcs.json",
      "priority": "high",
      "sizeMB": 0.12
    },
    {
      "type": "image",
      "key": "bg-baghdad",
      "url": "/assets/backgrounds/baghdad.webp",
      "priority": "low",
      "sizeMB": 0.08
    }
  ],
  "audio": {
    "ambient": "ambient-baghdad",
    "layers": ["layer-fountain", "layer-quills", "layer-paper-mill"],
    "footstepType": "stone"
  }
}
```

**Manifest generation** is automated alongside atlas generation:

```json
{
  "scripts": {
    "build:manifests": "node scripts/generate-manifests.js",
    "build:assets": "npm run build:atlas && npm run build:manifests"
  }
}
```

### 6.4 Loading Priority System

| Priority | When Loaded | Examples |
|----------|------------|---------|
| **boot** | BootScene (before game starts) | Player sprites, core UI, shared tileset, SFX sprites |
| **critical** | Zone enter (blocking, shows loading screen) | Zone tilemap, zone tileset, zone object atlas |
| **high** | Zone enter (non-blocking, loads in background) | Zone NPC sprites, zone portraits |
| **preload** | Player approaches zone boundary | Adjacent zone critical assets |
| **low** | Idle time, background loading | Decorative assets, weather layers, pronunciation audio |
| **on-demand** | When needed (e.g., word pronunciation) | Individual word audio files, battle sprites |

### 6.5 What Stays in BootScene

The refactored `BootScene` loads ONLY the universally needed core assets:

```javascript
// New BootScene.preload() — reduced from 77+ calls to ~15
preload() {
  // Core atlases (always needed)
  this.load.atlas('player-overworld',
    '/assets/atlas/core/player-overworld.png',
    '/assets/atlas/core/player-overworld.json');
  this.load.atlas('ui-shared',
    '/assets/atlas/core/ui-shared.png',
    '/assets/atlas/core/ui-shared.json');

  // Shared tileset (used by all zones)
  this.load.image('tileset-shared', '/assets/atlas/tileset/tileset-shared.png');

  // Shadow and particle textures
  this.load.image('shadow', '/assets/sprites/shadow.png');

  // Loading screen background
  this.load.image('bg-loading', '/assets/backgrounds/loading.webp');
}
```

Everything else moves to `AssetStreamingManager` and zone manifests.

### 6.6 Preload-on-Approach

When the player moves within a configurable distance of a zone boundary exit, begin preloading the adjacent zone:

```javascript
// In WorldScene.update()
const PRELOAD_DISTANCE = 5 * TILE; // 5 tiles from exit

for (const exit of this.mapLoader.getExitTriggers()) {
  const dist = Phaser.Math.Distance.Between(
    this.player.x, this.player.y,
    exit.signX, exit.signY
  );

  if (dist < PRELOAD_DISTANCE && !this.preloadedZones.has(exit.targetZone)) {
    this.preloadedZones.add(exit.targetZone);
    this.assetStreaming.loadZone(exit.targetZone, 'preload');
  }
}
```

### 6.7 Loading Screen with Arabic Vocabulary Tips

During zone transitions (when critical assets are loading), display an Arabic learning tip:

```javascript
class ZoneLoadingScreen {
  constructor(scene) {
    this.scene = scene;
    this.tips = [
      { arabic: 'صَبْر', english: 'Patience', transliteration: 'sabr' },
      { arabic: 'سَفَر', english: 'Journey', transliteration: 'safar' },
      { arabic: 'عِلْم', english: 'Knowledge', transliteration: 'ilm' },
      // ... 50+ tips, rotated randomly
    ];
  }

  show() {
    const tip = this.tips[Math.floor(Math.random() * this.tips.length)];
    // Display Arabic word large, English below, loading bar at bottom
    // Player sees vocabulary even during loading — every moment teaches
  }
}
```

### 6.8 Memory Management

**Target memory budget**: 64MB for textures (configurable based on device)

**Eviction policy**: LRU by zone. When loading a new zone would exceed the budget:
1. Find the most-distant loaded zone (not adjacent to current)
2. Unload its textures and tilemap cache
3. Repeat until there is enough room

**Device capability detection**:
```javascript
function getMemoryBudget() {
  // navigator.deviceMemory (Chrome only, approximate)
  const deviceMemGB = navigator.deviceMemory || 4;
  if (deviceMemGB <= 2) return 32;  // Low-end: 32MB texture budget
  if (deviceMemGB <= 4) return 64;  // Mid-range: 64MB
  return 128;                        // High-end: 128MB
}
```

### 6.9 Pronunciation Audio Streaming

Word pronunciations (5,000 files, ~40MB total) use the existing `AudioManager.playWord()` pattern which already lazy-loads via Howler.js with an LRU cache of 50 entries. This is sufficient. Enhancements:

1. **Increase LRU cache to 100** for the expanded 5,000-word vocabulary
2. **Predictive preload**: When a word appears in dialogue text, begin loading its audio before the player clicks "listen"
3. **Batch download**: When entering a zone, download the 20-30 vocabulary words associated with that zone as a batch in the background

```javascript
// Enhanced AudioManager method
async preloadZoneWords(zoneId) {
  const manifest = await fetch(`/assets/manifests/${zoneId}.json`);
  const { vocabularyWordIds } = await manifest.json();

  // Background-load each word audio
  for (const wordId of vocabularyWordIds) {
    if (!this.wordCache.get(wordId)) {
      const howl = new Howl({
        src: [`/assets/audio/words/${wordId}.mp3`],
        preload: true,
        volume: 0,  // Don't play, just cache
      });
      this.wordCache.set(wordId, howl);
    }
  }
}
```

---

## 7. Islamic Art Style Guide

### 7.1 Core Principles

**Mandatory constraints**:
- NO eyes or facial features on any character (human or creature)
- NO musical instruments depicted (ambient SFX only, consistent with NO music rule)
- NO depiction of prophets, angels, or divine beings
- NO idolatrous imagery (statues of humans/animals are acceptable only as broken ruins)
- NO inappropriate content (no alcohol, gambling, or romantic content)

**Design philosophy**:
- Emotion through body language, posture, gesture, and clothing
- Beauty through geometric patterns, calligraphy, and architecture
- Cultural authenticity over fantasy stereotyping
- Historical accuracy per city/era

### 7.2 Faceless Character Design Patterns

#### Conveying Emotion Without Faces

| Emotion | Body Language | Pixel Art Implementation |
|---------|-------------|------------------------|
| Happy/Welcoming | Arms slightly raised, slight forward lean | 2-frame animation: neutral -> arms-up |
| Sad/Worried | Hunched shoulders, head slightly down | Smaller sprite height, slower idle |
| Angry/Frustrated | Rigid posture, arms crossed or fists | 1-frame static, red tint pulse on body |
| Surprised | Slight jump, arms spread | 2-frame: normal -> raised position |
| Thinking | Hand to chin area (below face), tilted head | 1-frame with hand-to-chin pose |
| Grateful | Slight bow, hand on chest | 2-frame bow animation |
| Greeting | Hand raised in salaam gesture | 2-frame: neutral -> hand-raised |
| Farewell | Hand raised, slight turn | 2-frame: wave -> quarter-turn |

**Emote bubbles** supplement body language:
- `!` = surprise/alert (existing quest marker pattern)
- `?` = confusion/curiosity
- `...` = thinking/processing
- Heart = gratitude (NOT romantic -- placed on chest area)
- Star = achievement/discovery
- Swirl = frustration/confusion
- Book = teaching/knowledge

#### Head Covering as Identity

Head coverings are the primary visual differentiator between NPCs since faces are absent:

| Covering | Cultural Context | Visual Weight |
|----------|-----------------|--------------|
| Kufi (قلنسوة) | Everyday male head covering | Small, rounded, various colors |
| Ghutra (غترة) | Gulf/Bedouin male | Flowing, high visual impact |
| Turban (عمامة) | Scholar, elder, formal | Large, indicates status |
| Hijab (حجاب) | Female covering | Frames face area, various draping |
| Hood (طاقية) | Traveler, mystery | Shadowed face area |
| Scholar's cap | Academic identity | Flat-topped, often white |
| Battle helm | Warrior/guard | Metallic, functional |
| Desert veil | Desert travelers | Wrapped, windblown |
| Artisan headband | Craftspeople | Cloth tie, functional |

### 7.3 Islamic Geometric Patterns

Use authentic Islamic geometric patterns for:
- UI border frames (9-slice scaled)
- Floor tile decorations
- Wall ornaments in interiors
- Loading screen backgrounds
- Inventory/menu backgrounds

#### Pattern Types

| Pattern | Complexity | Use Case | Construction |
|---------|-----------|----------|-------------|
| 4-fold star | Simple | Buttons, small frames | Square grid, rotated squares |
| 6-fold rosette | Medium | Menu borders, floor tiles | Hexagonal grid, overlapping circles |
| 8-fold star (octagram) | Medium | Palace interiors, frames | Octagonal grid |
| 12-fold complex | High | Special UI, Alhambra-inspired | Dodecagonal grid |
| Arabesque vine | Medium | Scroll borders, book frames | Flowing curves from central stem |
| Muqarnas (3D geometric) | High | Ceiling decorations in interiors | Nested squinches |

**Pixel art simplification**: At 64x64 tile resolution, complex patterns must be simplified. Use 4-fold and 6-fold patterns for most tiles. Reserve 8-fold and 12-fold for larger UI elements rendered at higher resolution.

### 7.4 Architecture Styles per Historical City

| City | Era | Key Architectural Features | Pixel Art Tileset Notes |
|------|-----|---------------------------|------------------------|
| **Baghdad** | Abbasid ~800 CE | Round city walls, iwan arches, stucco decoration, wind towers | Mud-brick warm tones, pointed arches, courtyard layouts |
| **Cordoba** | Umayyad ~950 CE | Horseshoe arches, red-white voussoirs, double-arch columns | Distinctive red/white alternating arch tiles, garden court tiles |
| **Timbuktu** | Songhai ~1500 CE | Mud-brick minarets, Sudano-Sahelian style, flat roofs, protruding wooden beams (toron) | Earthy browns, wooden beam protrusions as tile details, sandy textures |
| **Damascus** | Umayyad ~700 CE | Ablaq (alternating stone colors), pointed arches, hammam domes | Light/dark stone alternation, souk corridor tiles |
| **Cairo** | Fatimid ~1000 CE | Keel arches, carved stucco, mashrabiya screens, minarets | Ornate carved patterns, screen lattice tiles, minaret silhouettes |
| **Fez** | Marinid ~1300 CE | Zellige mosaic, riad courtyards, narrow medina passages | Colorful geometric floor tiles, narrow passage tiles, fountain tiles |
| **Samarkand** | Timurid ~1400 CE | Blue-tiled domes, tall portals, majolica tilework, geometric facades | Blue and turquoise dominant palette, large portal structures |
| **Granada** | Nasrid ~1350 CE | Muqarnas ceilings, Alhambra-style stucco, Court of Lions, water channels | Delicate stucco patterns, fountain court tiles, garden channel tiles |

### 7.5 Calligraphy Integration

Arabic calligraphy serves as both decoration and teaching element:

**In-world calligraphy**:
- Signs and labels rendered in Naskh script (most readable for learners)
- Decorative inscriptions in Thuluth script (formal, architectural)
- Book/scroll contents in Naskh
- Shop signs in Ruq'ah (casual, commercial)

**UI calligraphy**:
- Zone names displayed in Naskh with tashkeel
- Menu headers in stylized Naskh
- Achievement titles in Thuluth
- Learning cards in clear Naskh with full diacritics

**Font integration** (already in project):
- Amiri (used for Arabic loading text) -- Naskh style, suitable for body text
- Noto Naskh Arabic (used for exit labels) -- Clear, highly readable

**Additional fonts needed**:
- A Thuluth-style display font for headers and decorative text
- A Kufi-style font for geometric/architectural inscriptions

### 7.6 Color Palettes per Zone/Era

Each zone has a primary palette of 8-12 colors that define its visual identity:

**Baghdad (Abbasid)**:
```
#D4A843 (gold)   #8B6914 (dark gold)   #F5E6C8 (cream)
#5C3D2E (dark wood)   #A0522D (sienna)   #E8D5B7 (sandstone)
#2B4162 (deep blue)   #1B6B93 (teal)    #F4FEFA (white)
```

**Cordoba (Umayyad)**:
```
#C41E3A (crimson)   #F5F5DC (ivory)   #8B4513 (saddle brown)
#006400 (dark green)   #FFD700 (gold)   #800020 (burgundy)
#FFFFF0 (ivory white)   #D2691E (chocolate)   #2F4F4F (dark slate)
```

**Timbuktu (Songhai)**:
```
#C4A35A (desert gold)   #8B7355 (khaki)   #654321 (dark brown)
#DEB887 (burlywood)   #D2B48C (tan)   #F5DEB3 (wheat)
#A0522D (sienna)   #800000 (maroon)   #FFFACD (lemon chiffon)
```

**Damascus (Umayyad)**:
```
#F5F5F5 (white stone)   #333333 (dark stone)   #D4A843 (gold)
#708090 (slate)   #B8860B (dark goldenrod)   #F0E68C (khaki)
#2F4F4F (dark teal)   #CD853F (peru)   #FAEBD7 (antique white)
```

**Cairo (Fatimid)**:
```
#DAA520 (goldenrod)   #8B4513 (saddle brown)   #F0E68C (khaki)
#006064 (teal dark)   #FFE4B5 (moccasin)   #800020 (burgundy)
#D2691E (chocolate)   #FAFAD2 (light goldenrod)   #2C3E50 (midnight blue)
```

**Fez (Marinid)**:
```
#1A5276 (Fez blue)   #16A085 (turquoise)   #F39C12 (amber)
#FFFFFF (white zellige)   #27AE60 (emerald)   #8E44AD (amethyst)
#E74C3C (vermillion)   #F5DEB3 (wheat)   #5D4037 (dark earth)
```

**Samarkand (Timurid)**:
```
#1565C0 (Samarkand blue)   #00838F (deep cyan)   #FFD54F (amber light)
#0097A7 (teal)   #004D40 (dark teal)   #FFF8E1 (ivory)
#311B92 (deep indigo)   #E8EAF6 (lavender)   #BF360C (deep orange)
```

**Granada (Nasrid)**:
```
#8D6E63 (warm brown)   #D7CCC8 (warm grey)   #FF8F00 (amber)
#4E342E (dark earth)   #A1887F (rose taupe)   #FFECB3 (light amber)
#33691E (olive)   #F5F5DC (beige)   #795548 (brown)
```

**Fantasy zones** use heightened/magical versions of the base palettes with glowing accents.

### 7.7 What to Avoid

| Category | Avoid | Instead |
|----------|-------|---------|
| Characters | Eyes, eyebrows, mouth, nose, facial hair | Silhouette head shape, head covering, body posture |
| Religion | Prayer as game mechanic, mosque interiors as dungeons, Quran verses as spell text | Prayer times as time-teaching, mosque courtyards (exterior), original Arabic text |
| Women | Revealing clothing, objectification, damsel tropes | Full covering, capable characters, scholars/merchants/leaders |
| Violence | Gore, blood, graphic death | Clean hit effects, "defeated" not "killed", poetic battle language |
| Culture | Orientalist stereotypes, "exotic" framing, belly dancers, magic carpets | Authentic historical detail, diverse roles, real occupations |
| Animals | Pigs, dogs in negative context | Cats (culturally positive), horses, camels, birds |
| Imagery | Idols, religious icons, crosses, Stars of David | Geometric patterns, calligraphy, architectural motifs |
| Supernatural | Jinn as enemies, black magic, occult symbols | Elemental beings (wind/water/fire spirits), root magic (linguistic), nature forces |

---

## 8. Asset Budget and Performance

### 8.1 Budget Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Initial page load (HTML + JS + CSS) | <200KB gzipped | Fast first paint, even on 3G |
| BootScene asset load (core sprites) | <500KB | <3s on average broadband |
| Per-zone asset package | <500KB | <2s transition between zones |
| Total shipped assets (all zones) | <20MB (images) + <10MB (audio) | Reasonable CDN bill |
| Word pronunciations (streaming) | <8KB per word | On-demand, never all at once |
| In-memory texture budget | 64MB (configurable) | Mid-range laptop GPU |
| Maximum atlas size | 2048x2048 | WebGL texture size limit (safe) |
| Maximum audio in memory | 20MB | Howler.js instances |

### 8.2 Image Optimization Pipeline

#### Format Strategy

| Format | Use Case | Savings vs PNG | Browser Support |
|--------|----------|---------------|-----------------|
| **WebP** | Primary format for all images | 25-35% smaller | 97%+ browsers |
| **PNG** | Fallback for legacy browsers | Baseline | 100% |
| **AVIF** | Future consideration (v10.0+) | 50% smaller than WebP | ~90% |

#### Optimization Pipeline

```bash
# Build script: scripts/optimize-images.sh

# Step 1: Generate WebP from PNG sources
for f in public/assets/atlas/**/*.png; do
  cwebp -q 90 -m 6 "$f" -o "${f%.png}.webp"
done

# Step 2: Optimize PNG fallbacks
for f in public/assets/atlas/**/*.png; do
  pngquant --quality=80-95 --strip --speed 1 "$f" -o "$f" --force
done

# Step 3: Compress atlases (sprite sheets need lossless for pixel art)
for f in public/assets/atlas/**/*.png; do
  optipng -o7 "$f"
done
```

**Phaser 3 WebP loading with fallback**:

```javascript
// Utility: load image with WebP preference
function loadImageWithFallback(loader, key, basePath) {
  // Check WebP support (cached)
  if (supportsWebP) {
    loader.image(key, `${basePath}.webp`);
  } else {
    loader.image(key, `${basePath}.png`);
  }
}

// WebP detection (run once at startup)
const supportsWebP = document.createElement('canvas')
  .toDataURL('image/webp')
  .startsWith('data:image/webp');
```

#### Pixel Art Specific Considerations

- **No anti-aliasing**: Pixel art must use nearest-neighbor scaling. Lossy WebP compression can introduce blurring. Use `cwebp -q 100 -lossless` for sprite sheets and `cwebp -q 90` for backgrounds.
- **Phaser texture filtering**: Set `pixelArt: true` in Phaser game config (already set in the project).
- **Atlas padding**: 2px padding between frames to prevent texture bleeding during scaling.

### 8.3 Audio Optimization

| Technique | Savings | Implementation |
|-----------|---------|---------------|
| OGG Vorbis over MP3 | ~20% smaller | Primary format |
| Mono for SFX | 50% vs stereo | All SFX are mono |
| Lower sample rate for speech | 30% (44.1->22.05kHz) | Pronunciation files |
| Audio sprites | Fewer HTTP requests | 7 sprite files instead of 110 individual |
| Volume normalization | Consistent quality | ffmpeg loudnorm filter |
| Silence trimming | 5-20% per file | ffmpeg silenceremove filter |
| Streaming ambient | No upfront cost | Load on zone enter, not at boot |

### 8.4 CDN Strategy

```
Production Architecture:

  [Client Browser]
        |
  [CloudFlare CDN]  <-- Edge caching, Brotli compression
        |
  [Origin: S3/R2]   <-- Static asset storage

CDN Configuration:
  /assets/atlas/*     -> Cache-Control: public, max-age=31536000, immutable
  /assets/audio/*     -> Cache-Control: public, max-age=31536000, immutable
  /assets/maps/*      -> Cache-Control: public, max-age=31536000, immutable
  /assets/manifests/* -> Cache-Control: public, max-age=3600  (zone manifests may update)

Asset Fingerprinting:
  Build step appends content hash: zone-baghdad.a1b2c3d4.png
  Manifest references include hash: { "url": "/assets/atlas/zone/zone-baghdad.a1b2c3d4.png" }
  This enables immutable caching with instant invalidation on content change.
```

### 8.5 Service Worker Caching

```javascript
// sw.js — Cache strategy for game assets
const CACHE_NAME = 'gogo-arabic-assets-v1';

const PRECACHE_URLS = [
  // Core assets precached on install
  '/assets/atlas/core/player-overworld.png',
  '/assets/atlas/core/player-overworld.json',
  '/assets/atlas/core/ui-shared.png',
  '/assets/atlas/core/ui-shared.json',
  '/assets/atlas/tileset/tileset-shared.png',
  '/assets/audio/sprites/sfx-ui.ogg',
  '/assets/audio/sprites/sfx-ui.json',
];

// Cache-first for static assets (images, audio, maps)
// Network-first for manifests (may update between sessions)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/assets/')) {
    if (url.pathname.includes('/manifests/')) {
      // Network-first for manifests
      event.respondWith(
        fetch(event.request)
          .then(response => {
            const cache = caches.open(CACHE_NAME);
            cache.then(c => c.put(event.request, response.clone()));
            return response;
          })
          .catch(() => caches.match(event.request))
      );
    } else {
      // Cache-first for all other assets
      event.respondWith(
        caches.match(event.request)
          .then(cached => cached || fetch(event.request)
            .then(response => {
              const cache = caches.open(CACHE_NAME);
              cache.then(c => c.put(event.request, response.clone()));
              return response;
            })
          )
      );
    }
  }
});
```

### 8.6 Performance Budget Breakdown

**Estimated total asset sizes after optimization**:

| Category | Raw Size | After Optimization | Loaded at Boot | Loaded per Zone |
|----------|---------|-------------------|----------------|-----------------|
| Player sprites (45 sheets) | 1.8MB | 1.0MB (WebP) | 400KB (overworld only) | 0 |
| NPC sprites (115 sheets) | 2.2MB | 1.3MB | 0 | ~80KB |
| Enemy sprites (40 sheets) | 2.0MB | 1.2MB | 0 | ~60KB (if battle zone) |
| Tilesets (14 sheets) | 2.8MB | 1.7MB | 100KB (shared) | ~100KB |
| Objects (340 sprites) | 1.9MB | 1.1MB | 0 | ~80KB |
| UI sprites (30 files) | 0.3MB | 0.2MB | 200KB (all) | 0 |
| Maps (24 zone + 100 interior) | 2.0MB | 1.5MB | 0 | ~15KB |
| SFX (7 sprite files) | 0.8MB | 0.6MB | 300KB (UI + common) | ~80KB |
| Ambient audio (134 tracks) | 9.4MB | 7.0MB | 0 | ~300KB |
| Pronunciations (5,228 files) | 43MB | 35MB | 0 | ~50KB (preloaded words) |
| **TOTAL** | **66.2MB** | **49.6MB** | **~1.0MB** | **~500KB** |

---

## 9. Placeholder-to-Final Pipeline

### 9.1 Current Placeholder Inventory

| File | Type | Size | Status | Replacement Priority |
|------|------|------|--------|---------------------|
| `wardrobe-bg.gif` | Japanese wardrobe room | ~3.2MB | Placeholder | P1 (player sees this in character creation) |
| `char-bg.gif` | Japanese character screen | ~3.2MB | Placeholder | P1 (character creation screen) |
| `shop-bg2.gif` | Japanese shop | ~3.2MB | Placeholder | P1 (shop UI background) |
| `japanese-room-background.gif` | Japanese room interior | ~3.2MB | Placeholder | P2 (used in some interiors) |
| `pixel-sepia.gif` | Sepia Japanese scene | ~3.2MB | Placeholder | P2 (menu background) |
| `pixel-noodles.gif` | Japanese noodle shop | ~3.2MB | Placeholder | P3 (unused?) |
| `pixel-fishes.gif` | Japanese fish market | ~3.2MB | Placeholder | P3 (unused?) |
| **17 legacy NPC sprites** | Non-faceless characters | ~0.3MB | Deprecated | P1 (remove entirely) |

**Total placeholder size**: ~22.4MB (GIFs) + ~0.3MB (legacy sprites) = ~22.7MB

### 9.2 Replacement Priority Order

**P1 — Immediate (v6.0 prerequisite):**
1. Remove `wardrobe-bg.gif` -> Replace with `wardrobe-bg.webp` (Islamic-patterned dressing room, geometric tiles, clothing racks with thobes/abayas)
2. Remove `char-bg.gif` -> Replace with `char-creation-bg.webp` (Geometric pattern background, warm tones, calligraphy border)
3. Remove `shop-bg2.gif` -> Replace with `shop-bg.webp` (Souk interior, shelves with goods, warm lantern lighting)
4. Remove 17 legacy sprites from `public/assets/sprites/` root (blond.png, hat_girl.png, etc.)

**P2 — Before v7.0 (World expansion):**
5. Remove `japanese-room-background.gif` -> Replace with `interior-default-bg.webp` (Generic Islamic interior, stone walls, carpet, lantern)
6. Remove `pixel-sepia.gif` -> Replace with `menu-bg.webp` (Desert panorama with distant city silhouettes, warm sepia tones)

**P3 — Cleanup (v7.0):**
7. Remove `pixel-noodles.gif` and `pixel-fishes.gif` (likely unused, verify references first)

### 9.3 Interim Solution

Before final art is ready, replace GIF placeholders with lightweight procedural alternatives:

```javascript
// Interim: Generate background programmatically
function createIslamicPatternBG(scene, width, height, palette) {
  const graphics = scene.make.graphics({ add: false });

  // Base color fill
  graphics.fillStyle(palette.base, 1);
  graphics.fillRect(0, 0, width, height);

  // Islamic geometric pattern overlay
  const patternSize = 64;
  for (let y = 0; y < height; y += patternSize) {
    for (let x = 0; x < width; x += patternSize) {
      // 4-fold star pattern
      graphics.fillStyle(palette.accent, 0.15);
      graphics.fillRect(x + patternSize/4, y + patternSize/4,
                       patternSize/2, patternSize/2);
      // Rotated square (diamond)
      // ... simplified geometric construction
    }
  }

  // Border frame
  graphics.lineStyle(4, palette.border, 0.8);
  graphics.strokeRect(8, 8, width - 16, height - 16);

  graphics.generateTexture('bg-temp', width, height);
  graphics.destroy();
}
```

This produces a ~2KB procedural background instead of a 3.2MB GIF, with the correct Islamic aesthetic, usable immediately.

### 9.4 Legacy Sprite Cleanup

Files to remove from `public/assets/sprites/` root level:
```
blond.png, emo.png, floral.png, gentleman-hair.png, wavy.png,
spaghetti.png, basic-clothes.png, dress.png, skirt.png, pants.png,
shoes.png, eyes.png, char1.png, player.png,
purple_girl.png, young_girl.png, young_guy.png
```

Files to remove from `public/assets/sprites/npcs/` (non-faceless):
```
blond.png, fire_boss.png, grass_boss.png, hat_girl.png,
player.png, purple_girl.png, straw.png, water_boss.png,
young_girl.png, young_guy.png
```

Verify no code references these before removal. The faceless versions in `npcs/faceless/` are the canonical sprites.

---

## 10. Implementation Phases

### Phase 1: Foundation (v6.0, Phase 27-28)

**Priority**: Unblock combat system development

1. Set up `assets-source/` directory structure
2. Install `free-tex-packer-core`, create `scripts/generate-atlases.js`
3. Create atlas generation npm scripts (`build:atlas`, `dev:atlas`)
4. Generate core atlases from existing sprites (player, UI)
5. Create `AssetStreamingManager` skeleton (core loading API)
6. Refactor `BootScene` to load core atlases instead of individual sprites
7. Create battle sprite placeholders (colored rectangles with labels)
8. Create SFX audio sprites for UI and battle categories
9. Remove P1 placeholder GIFs, replace with procedural backgrounds
10. Remove legacy non-faceless sprites

**Deliverables**: Atlas pipeline working, BootScene load count drops from 77+ to ~15, battle system can begin with placeholder art.

### Phase 2: Zone Streaming (v7.0, Phase 33-34)

**Priority**: Enable 24-zone world without loading all assets upfront

1. Create zone manifest JSON files for all 8 existing zones
2. Implement `AssetStreamingManager.loadZone()` with priority queue
3. Implement preload-on-approach for adjacent zones
4. Implement memory management (LRU eviction)
5. Create `ZoneLoadingScreen` with Arabic vocabulary tips
6. Begin Tiled map conversion for existing 8 zones
7. Refactor `MapLoader` to support both procedural and Tiled maps
8. Create shared base tileset (1024x1024)
9. Create first 2 new zone tilesets (Baghdad, Cordoba)
10. Set up ambient audio for existing 8 zones (base loops)

**Deliverables**: Zone-based streaming working, first Tiled maps functional, ambient audio playing.

### Phase 3: Content Pipeline (v7.0-v8.0, Phase 35-39)

**Priority**: Scale content creation

1. Create remaining 14 zone tilesets
2. Generate zone atlases for all 24 zones
3. Create NPC tier system (A/B/C/D) with archetype base sheets
4. Generate NPC atlases per zone
5. Implement animated tile system
6. Create 100+ interior Tiled maps
7. Set up Google Cloud TTS pronunciation pipeline
8. Generate first 1,000 word pronunciations
9. Create ambient layer system (base + layers + weather)
10. Create all zone ambient base loops

**Deliverables**: All zones have visual assets, pronunciation pipeline operational, ambient audio complete.

### Phase 4: Polish and Optimization (v10.0, Phase 54)

**Priority**: Performance and final quality

1. Complete WebP conversion pipeline
2. Implement service worker caching
3. Set up CDN with content-hash fingerprinting
4. Complete all 5,000 word pronunciations
5. Final image optimization pass (pngquant, optipng, cwebp)
6. Audio normalization pass (loudnorm all files)
7. Remove all procedural map fallbacks (Tiled-only)
8. Implement device capability detection for memory budgets
9. Performance profiling and budget verification
10. Create automated asset budget CI check (fail build if over budget)

**Deliverables**: Production-ready asset pipeline, all budgets met, CDN configured.

---

## Appendix A: Tool Installation

```bash
# Atlas generation
npm install --save-dev free-tex-packer-core glob

# Audio sprite generation
npm install --save-dev audiosprite

# Image optimization (system-level)
brew install webp optipng pngquant  # macOS
# apt install webp optipng pngquant  # Ubuntu

# Audio processing (system-level)
brew install ffmpeg  # macOS

# TTS (for pronunciation generation)
npm install --save-dev @google-cloud/text-to-speech

# Tiled map editor (download separately)
# https://www.mapeditor.org/ — free, open source
```

## Appendix B: Phaser 3 Atlas Loading Reference

```javascript
// Loading atlas
this.load.atlas('key', 'texture.png', 'atlas.json');

// Using atlas frame
this.add.image(x, y, 'key', 'frame-name');

// Creating animation from atlas
this.anims.create({
  key: 'walk-down',
  frames: this.anims.generateFrameNames('key', {
    prefix: 'player-walk-down-',
    start: 0,
    end: 3,
  }),
  frameRate: 8,
  repeat: -1,
});

// Spritesheet from atlas frame (sub-sprite)
// Not natively supported — use atlas frames directly instead of
// spritesheet sub-indexing. This is why the atlas naming convention
// encodes direction and frame number in the frame name.
```

## Appendix C: Size Estimation Formulas

```
PNG sprite size (uncompressed RGBA):
  width * height * 4 bytes (RGBA)
  128x128 sprite = 65,536 bytes = 64KB raw

PNG sprite size (compressed, pixel art):
  ~40-60% of raw for pixel art with large flat areas
  128x128 sprite = ~25-40KB compressed PNG

WebP sprite size (lossless, pixel art):
  ~65-75% of PNG for pixel art
  128x128 sprite = ~18-28KB WebP

Atlas (2048x2048, mostly filled):
  PNG: ~400-600KB
  WebP: ~280-420KB

OGG audio:
  Mono, 44.1kHz, q4: ~12KB per second of audio
  Stereo, 44.1kHz, q5: ~16KB per second

MP3 pronunciation:
  Mono, 22.05kHz, 64kbps: ~8KB per second
  Average word pronunciation (1.5s): ~12KB
  5,000 words * 8KB average: ~40MB
```

---

*Generated: 2026-02-12*
*Source files analyzed: BootScene.js, audio.js, audioConfig.js, Player.js, NPC.js, zones.js, interiors.js, MapLoader.js, vite.config.js*
*Related docs: EXPANSION-WORLD-CONTENT.md, EXPANSION-COMBAT-RPG.md, EXPANSION-SUMMARY.md*
