# Phase 39: Terrain Rendering — Research

**Researched:** 2026-03-17
**Domain:** Phaser 3 sprite-based tilemap rendering, Kenmi pixel art tileset auto-tiling
**Confidence:** HIGH

---

## Summary

Phase 39 replaces the flat-colored-square MapLoader terrain with real Kenmi 16x16 pixel art tiles scaled 4x to the 64px game grid. The complete rendering logic (`_renderKenmiTiles`, `_renderSandTile`, `_renderGrassTile`, `_renderWaterTile`, foam animations) already exists in `MapLoader.js` from a prior session — but was disabled by a TODO comment in `renderGroundTiles` that forces the flat fallback. The core plan is therefore: (1) fix `renderGroundTiles` to call `_renderKenmiTiles`, verify frame indices are correct, test all desert tiles; (2) add a `tilesetTheme` field to zone definitions and a biome dispatch layer so non-desert zones render their correct tilesets; (3) extend foam animation and the shimmer tween (`addWaterEdgeEffect`) to not double-up.

All Kenmi tile assets are already loaded upfront in BootScene via KENMI_CATALOG. No new loading code is needed. The 8 main zones in `zones.js` plus 8 real-world and 8 fantasy placeholder zones are code-generated from `buildMap()` functions — the TiledMapLoader path for Tiled JSON files coexists but is only used when a map JSON is cached (none exist yet for these zones). Phase 39 operates entirely on the code-generated path.

**Primary recommendation:** Fix `renderGroundTiles` to call `_renderKenmiTiles` for desert zones first (one line change + frame verification), then build a `BIOME_TILESETS` config table and a `biome` field on zones to drive non-desert tileset dispatch.

---

## User Constraints

No CONTEXT.md exists for this phase. Constraints come from STATE.md, REQUIREMENTS.md, and the additional_context provided.

### Locked Decisions
- No Tiled Map Editor manual workflow in Phase 39 — maps are defined as 2D arrays in code (`buildMap()`). TiledMapLoader exists but is only triggered when a Tiled JSON is cached (none exist for Phase 39 zones).
- TILE constant = 64, 16x16 tiles scale 4x. No game logic changes allowed.
- All 969 Kenmi assets are loaded upfront in BootScene (Phase 38 complete). No new load calls needed.
- Phase 43 (cleanup) removes old placeholder sprites — do NOT remove `tile-sand`, `tile-grass`, `grass-ice` in Phase 39; they remain as fallback.
- `addWaterEdgeEffect` (the rectangle shimmer tween) must be removed or gated for zones that use real water tiles, to avoid visual double-up.

### Claude's Discretion
- Which dungeon tileset variant (dungeon-1, dungeon-2, dungeon-3) to use for fortress/library interiors.
- Whether non-desert biomes reuse the existing `_pickEdgeFrame` helper or get their own per-biome frame maps.
- Frame index mapping for base grass blob tiles (16x10 grid — which frames map to which auto-tile positions).

### Deferred Ideas (OUT OF SCOPE)
- Tiled `.tmx` map files (v9.0 TILED-01 through TILED-03)
- Decoration scattering (Phase 40, `scatterDecorations` already written but commented out)
- Ambient animal spawning (Phase 41)
- Any gameplay changes

---

## Standard Stack

### Core (all already installed and loaded)
| Asset Key Pattern | Pack | Purpose | Tile Grid |
|---|---|---|---|
| `kenmi-desert-tiles-desert-beach-tiles-{1,2,3}` | desert/tiles | Sand ground, 3 color variants | 5×3 = 15 frames |
| `kenmi-desert-tiles-desert-grass` | desert/tiles | Desert oasis grass | 3×5 = 15 frames |
| `kenmi-desert-tiles-desert-water-tiles-{1,2,3}` | desert/tiles | Desert water, 3 variants | 6×3 = 18 frames |
| `kenmi-desert-tiles-desert-water-foam-animation` | desert/tiles | Animated shoreline foam | 20×3 = 60 frames |
| `kenmi-desert-tiles-desert-cliff-tiles-{1,2,3}` | desert/tiles | Cliff/rock transitions | spritesheet |
| `kenmi-base-tiles-grass-grass-tiles-1` | base/tiles/grass | Forest/farmland base grass | 16×10 = 160 frames |
| `kenmi-base-tiles-grass-grass-tiles-1-blob-test` | base/tiles/grass | Blob tileset for grass | 7×7 = 49 frames |
| `kenmi-base-tiles-water-water-tile-1` | base/tiles/water | Base pack water | 3×5 = 15 frames |
| `kenmi-base-tiles-water-water-foam-animation` | base/tiles/water | Base water foam | spritesheet |
| `kenmi-christmas-decorations-christmass-grass` | christmas | Snow/Christmas grass tiles | 8×5 = 40 frames |
| `kenmi-dungeons-dungeon-1-dungeon-1` | dungeons/dungeon-1 | Dungeon floor/wall tileset | 13×13 = 169 frames (image, not spritesheet) |
| `kenmi-volcano-tiles-volcano-tiles` | volcano/tiles | Lava/rock tileset | 29×9 = 261 frames |
| `kenmi-volcano-tiles-volcano-lava-buble` | volcano/tiles | Animated lava bubbles | 11×1 = 11 frames |
| `kenmi-shroom-tiles-shroomlands-grass-green-tiles` | shroomlands/tiles | Mushroom grass | 11×12 = 132 frames |
| `kenmi-shroom-tiles-shroomlands-grass-blue-tiles` | shroomlands/tiles | Mushroom grass blue variant | spritesheet |
| `kenmi-shroom-tiles-shroomlands-grass-purple-tiles` | shroomlands/tiles | Mushroom grass purple variant | spritesheet |

### Key Finding: Christmas Pack Has No Snow Ground Tiles
The christmas pack has only characters (reindeer, santa), decorations (snowman, gingerbread-house, chocolate-chimney), and `christmass-grass.png` (8×5 tiles = snow-grass hybrid). There are no dedicated snow ground tiles. For mountain/snow zones the correct approach is to use `christmass-grass.png` as the primary ground tile with `ICE_GRASS` tile type mapped to it, plus the `kenmi-base-tiles-grass-grass-tiles-*` in ice-tinted form.

### Key Finding: dungeon-1.png is an 'image' type, not a spritesheet
Per the catalog entry: `{ key: "kenmi-dungeons-dungeon-1-dungeon-1", type: 'image' }`. It is a 208×208 pixel PNG (13×13 tiles). To use it for programmatic rendering, each tile must be drawn via `scene.add.image(px, py, key).setCrop(...)` or by loading it as a spritesheet with `frameWidth: 16, frameHeight: 16` — but since BootScene loads it as an image, it cannot use frame indices. **Resolution: use `kenmi-dungeons-dungeon-1-dungeon-1-sewer-tileset` for programmatic rendering** — it is also an image but smaller. Alternatively, for Phase 39 dungeon floors: use `dungeon-1-sewer-tileset.png` (cataloged as image) or simply pick a solid stone tile from the base cliff pack (`kenmi-base-tiles-cliff-stone-cliff-1-tile`) which IS a spritesheet.

### Supporting
| Library | Purpose | When to Use |
|---------|---------|-------------|
| `phaser-animated-tiles` | Tiled map tile animations | Phase 39 does NOT use Tiled maps — use Phaser `anims` API directly instead |
| Phaser `anims.create` + `sprite.play` | Frame animation for foam | Already implemented in `_createFoamAnimations()` |

---

## Architecture Patterns

### Current MapLoader Flow (code path that matters)

```
WorldScene.create(zoneName)
  → tiledMapLoader.hasMap(zoneName) → false (no Tiled JSON cached)
  → mapLoader.create(zone, mapWidth, mapHeight)
      → zone.buildMap()              // returns 2D array of tile type constants
      → renderGroundTiles()          // CURRENTLY calls _renderFlatTiles (WRONG)
      → addWaterEdgeEffect()         // adds rectangle shimmer — must be removed when Kenmi tiles active
      → setupCollision()             // border walls + water blockers (unchanged)
      → placeObjects()               // zone.objects placed as sprites (unchanged)
      → createExitTriggers()         // signposts at edges (unchanged)
```

### The Single Fix for Desert Zones (Plan 39-01)

The `_renderKenmiTiles` method is complete and correct. The only issue is in `renderGroundTiles`:

```javascript
// Current (BROKEN):
renderGroundTiles(groundData, mapW, mapH) {
  // TODO: Fix Kenmi terrain rendering (wrong frame indices cause tiling artifacts)
  this._renderFlatTiles(groundData, mapW, mapH);
}

// Fixed:
renderGroundTiles(groundData, mapW, mapH, biome = 'desert') {
  if (this._hasKenmiTiles()) {
    this._renderKenmiTiles(groundData, mapW, mapH, biome);
  } else {
    this._renderFlatTiles(groundData, mapW, mapH);
  }
}
```

The "wrong frame indices" comment is from a prior debugging session — the frame maps (`BEACH`, `GRASS_F`, `WATER_F`) and `_pickSandWaterFrame` / `_pickEdgeFrame` logic in MapLoader.js are internally consistent. The frame constants are calculated from column-count arithmetic, not hardcoded magic numbers.

### Pattern: Zone Biome Field

Zones need a `tilesetTheme` property to dispatch to the correct tileset. Add it to zone definitions:

```javascript
// In zones.js (zones that need it — desert zones can omit for backward compat)
const mountain_village = {
  id: 'mountain_village',
  tilesetTheme: 'snow',     // NEW field
  // ...
};

const farmland = {
  id: 'farmland',
  tilesetTheme: 'grass',    // NEW field
  // ...
};
```

Biome → tileset mapping table (in MapLoader.js or a new BiomeTilesets.js):

| `tilesetTheme` | Zones | Primary ground key | Water key | Foam key |
|---|---|---|---|---|
| `'desert'` (default) | oasis_village, ancient_library, desert_marketplace, bedouin_camp, most real-world/fantasy | `kenmi-desert-tiles-desert-beach-tiles-{1,2,3}` | `kenmi-desert-tiles-desert-water-tiles-1` | `kenmi-desert-tiles-desert-water-foam-animation` |
| `'grass'` | farmland, coastal_port | `kenmi-base-tiles-grass-grass-tiles-1` | `kenmi-base-tiles-water-water-tile-1` | `kenmi-base-tiles-water-water-foam-animation` |
| `'snow'` | mountain_village | `kenmi-christmas-decorations-christmass-grass` | `kenmi-base-tiles-water-water-tile-1` (tinted blue) | `kenmi-base-tiles-water-water-foam-animation` |
| `'dungeon'` | fortress_interior zones | `kenmi-base-tiles-cave-cave-floor-1` | `kenmi-base-tiles-cave-cave-water` | `kenmi-base-tiles-cave-cave-water-animation` |
| `'volcano'` | volcano/magical fantasy zones | `kenmi-volcano-tiles-volcano-tiles` | `kenmi-volcano-tiles-volcano-lava-buble` (animated) | `kenmi-volcano-tiles-volcano-lava-buble` |
| `'mushroom'` | forest_of_tales, shroomlands fantasy | `kenmi-shroom-tiles-shroomlands-grass-green-tiles` | `kenmi-base-tiles-water-water-tile-1` | `kenmi-base-tiles-water-water-foam-animation` |

**Important:** Royal Palace uses GRASS, SAND, WATER, and ICE_GRASS all in one map. It does NOT have a single biome — use `'desert'` for SAND, base grass tiles for GRASS, and ice-tint blue for ICE_GRASS.

### Pattern: Per-Biome Tile Frame Maps

Each biome tileset has a different sprite grid. Separate frame constant objects are needed. The existing pattern in MapLoader.js is correct:

```javascript
// Desert (already exists):
const BEACH = { CORNER_TL: 0, EDGE_TOP: 1, ... }  // 5-col grid

// Base grass (16x10 grid — blob tileset approach):
const BASE_GRASS_F = {
  // Row 0-2 in grass-tiles-1.png are a 3x3 auto-tile set (first 9 frames)
  SOLID: 4,           // center solid grass
  EDGE_TOP: 1,
  EDGE_BOTTOM: 7,
  EDGE_LEFT: 3,
  EDGE_RIGHT: 5,
  CORNER_TL: 0,
  CORNER_TR: 2,
  CORNER_BL: 6,
  CORNER_BR: 8,
  // Rows 3-9 are variant fills
  VAR_1: 16, VAR_2: 17, ...
}
```

**Critical note:** The base grass `grass-tiles-1.png` is 16×10 (160 frames). The blob test sheets (`grass-tiles-1-blob-test.png`) are 7×7 = 49 frames using a Wang/blob layout. For simplicity in Phase 39, use `grass-tiles-1.png` with the standard 3×3 auto-tile region at top-left (frames 0-8), not the blob sheets. The blob sheets require a 47-case lookup that is out of scope.

### Pattern: Removing Water Shimmer Tween Conflict

`addWaterEdgeEffect` in MapLoader.js adds a blue-tinted rectangle overlay + alpha tween on water-edge tiles. When Kenmi tiles are active, this creates a visible blue box overlay on top of the pixel art. Fix:

```javascript
// In MapLoader.create():
this.renderGroundTiles(groundData, mapWidth, mapHeight, biome);

// Only add shimmer for flat tiles fallback — skip when Kenmi tiles active
if (!this._hasKenmiTiles()) {
  this.addWaterEdgeEffect(groundData, mapWidth, mapHeight);
}
```

---

## Zone → Biome Mapping

### 8 Main Zones (zones.js)

| Zone ID | Current Tile Types | `tilesetTheme` | Notes |
|---|---|---|---|
| `oasis_village` | SAND, GRASS, WATER | `'desert'` | Already works with existing `_renderKenmiTiles` |
| `ancient_library` | SAND, GRASS, WATER | `'desert'` | Same desert tileset |
| `desert_marketplace` | SAND, GRASS, WATER | `'desert'` | Same desert tileset |
| `farmland` | SAND, GRASS, WATER | `'grass'` | Base RPG grass/farmland tiles (TILE-06) |
| `bedouin_camp` | SAND, GRASS | `'desert'` | Desert tileset, no water |
| `mountain_village` | ICE_GRASS, SAND, GRASS, WATER | `'snow'` | ICE_GRASS → christmas grass tiles (TILE-07) |
| `coastal_port` | SAND, GRASS, WATER | `'grass'` | Base RPG, large water section (TILE-06) |
| `royal_palace` | GRASS, SAND, WATER, ICE_GRASS | `'desert'` | Mixed; ICE_GRASS used for marble look, tint blue |

### 16 Placeholder Zones (realWorldZones + fantasyZones)

All 16 use `buildPlaceholderMap()` which returns a simple 40×30 all-SAND grid. They render as a flat sand field. All real-world zones: `'desert'` biome. Fantasy zones requiring specific tilesets:

| Zone ID | `tilesetTheme` | Reason |
|---|---|---|
| `star_oasis` | `'desert'` | Desert night theme |
| `mountain_of_words` | `'snow'` | Mountain setting |
| `sea_of_ink` | `'grass'` | Ink ocean, base water |
| `forest_of_tales` | `'mushroom'` | ShroomLands (TILE-10) |
| `city_of_mirrors` | `'desert'` | Desert city |
| `garden_of_roots` | `'grass'` | Garden setting |
| `fortress_of_silence` | `'dungeon'` | Dungeon pack (TILE-08) |
| `volcano_of_creation` | `'volcano'` | Volcano pack (TILE-09) |
| All 8 real-world zones | `'desert'` | All Sahara/Middle East settings |

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Frame index for auto-tiling | Custom 8-direction lookup | `_pickEdgeFrame` helper (already in MapLoader.js) | Already handles all 4-neighbor edge + corner cases |
| Seeded random per tile | `Math.random()` or `Date.now()` | `tileHash(x, y, seed)` (already in MapLoader.js) | Deterministic, no flickering on re-render |
| Water foam animation | Custom tween system | Phaser `anims.create` + `sprite.play` (already in `_createFoamAnimations`) | Built-in frame looping |
| Tileset version detection | Check asset file | `scene.textures.exists(key)` | Already in `_hasKenmiTiles()` |
| Biome dispatch | if/else chains in rendering | `BIOME_TILESETS` config object | Cleaner, extensible for Phase 40+ |

---

## Common Pitfalls

### Pitfall 1: Frame Index Arithmetic Off-By-One
**What goes wrong:** Frame index = `row * COLS + col`. If COLS is wrong, every tile shows the wrong frame.
**Why it happens:** `desert-beach-tiles-1.png` is 5 columns (verified: 80px / 16 = 5). `desert-grass.png` is 3 columns (verified: 48px / 16 = 3). These are already correct in MapLoader.js.
**How to avoid:** Use the verified tile grid dimensions above. Double-check by looking at frame 0 (top-left) in Phaser's debug display.

### Pitfall 2: Spritesheet vs Image Type in Catalog
**What goes wrong:** Calling `scene.add.image(x, y, key, frameIndex)` on a texture loaded as `image` ignores the frame argument — renders full texture.
**Why it happens:** `dungeon-1.png`, `dungeon-1-arch.png`, `dungeon-1-arch-open.png` and other dungeon files are cataloged as `type: 'image'`, not `'spritesheet'`.
**How to avoid:** For programmatic tile rendering, use only keys that are `type: 'spritesheet'` in the catalog. For dungeon biome: use `kenmi-base-tiles-cave-cave-floor-1` (spritesheet) for the floor, not `kenmi-dungeons-dungeon-1-dungeon-1`.
**Warning signs:** All tiles render as identical full-sheet blobs instead of individual frames.

### Pitfall 3: Water Shimmer Tween Double-Layer
**What goes wrong:** Blue rectangle overlays appear on top of rendered water tiles, obscuring the pixel art.
**Why it happens:** `addWaterEdgeEffect` creates a blue rectangle on every water tile bordering non-water. It runs regardless of whether Kenmi tiles are active.
**How to avoid:** Gate `addWaterEdgeEffect` behind `!this._hasKenmiTiles()` check in `MapLoader.create()`.

### Pitfall 4: ICE_GRASS Biome Confusion
**What goes wrong:** `ICE_GRASS` renders as desert grass with a blue tint instead of snow-appropriate tiles.
**Why it happens:** The current `_renderGrassTile` handles ICE_GRASS by applying a `0x99ccff` tint to the desert grass tile. For snow zones, it should use the christmas grass sheet.
**How to avoid:** Pass `biome` parameter into `_renderGrassTile`. If `biome === 'snow'`, use `christmass-grass` key instead of desert grass key.

### Pitfall 5: `buildPlaceholderMap` Returns All-SAND
**What goes wrong:** Fantasy/real-world zones render as one biome color because buildPlaceholderMap returns a flat SAND grid.
**Why it happens:** `buildPlaceholderMap` is a stub — one solid tile type, no transitions.
**How to avoid:** For Phase 39, this is acceptable — placeholder zones show solid ground tiles in the correct biome color. No auto-tiling needed for all-same-type grids (the solid fallback frame is used). Just ensure the correct `tilesetTheme` maps the solid tile to the right color.

### Pitfall 6: `addWaterEdgeEffect` Depth Conflict
**What goes wrong:** The shimmer rectangles have no depth set — they default to depth 0 and may render above the ground sprites if Phaser renders them last.
**Why it happens:** `this.scene.add.rectangle(...)` creates at depth 0 by default.
**How to avoid:** Already irrelevant if shimmer is gated off for Kenmi tiles (Pitfall 3 fix). If kept for fallback, set `.setDepth(-1)` on rectangles.

---

## Code Examples

### Enable Kenmi Rendering (the core change)

```javascript
// src/game/systems/MapLoader.js
// Source: direct code inspection 2026-03-17

create(zone, mapWidth, mapHeight) {
  // ...existing setup...
  const biome = zone.tilesetTheme || 'desert';

  this.renderGroundTiles(groundData, mapWidth, mapHeight, biome);

  // Only run shimmer for flat-tile fallback
  if (!this._hasKenmiTiles()) {
    this.addWaterEdgeEffect(groundData, mapWidth, mapHeight);
  }
  // ...rest unchanged...
}

renderGroundTiles(groundData, mapW, mapH, biome = 'desert') {
  if (this._hasKenmiTiles()) {
    this._renderKenmiTiles(groundData, mapW, mapH, biome);
  } else {
    this._renderFlatTiles(groundData, mapW, mapH);
  }
}
```

### Biome Config Table (new constant)

```javascript
// src/game/systems/MapLoader.js or src/data/BiomeTilesets.js

const BIOME_TILESETS = {
  desert: {
    sandKeys: [
      'kenmi-desert-tiles-desert-beach-tiles-1',
      'kenmi-desert-tiles-desert-beach-tiles-2',
      'kenmi-desert-tiles-desert-beach-tiles-3',
    ],
    sandCols: 5,
    grassKey: 'kenmi-desert-tiles-desert-grass',
    grassCols: 3,
    waterKey: 'kenmi-desert-tiles-desert-water-tiles-1',
    waterCols: 6,
    foamKey: 'kenmi-desert-tiles-desert-water-foam-animation',
    foamCols: 20,
  },
  grass: {
    sandKeys: ['kenmi-base-tiles-grass-grass-tiles-1'], // solid grass for sand-type tiles
    sandCols: 16,
    grassKey: 'kenmi-base-tiles-grass-grass-tiles-1',
    grassCols: 16,
    waterKey: 'kenmi-base-tiles-water-water-tile-1',
    waterCols: 3,
    foamKey: 'kenmi-base-tiles-water-water-foam-animation',
    foamCols: 20,
  },
  snow: {
    sandKeys: ['kenmi-christmas-decorations-christmass-grass'], // snow paths
    sandCols: 8,
    grassKey: 'kenmi-christmas-decorations-christmass-grass',
    grassCols: 8,
    waterKey: 'kenmi-base-tiles-water-water-tile-1',
    waterCols: 3,
    foamKey: 'kenmi-base-tiles-water-water-foam-animation',
    foamCols: 20,
    iceTint: 0xaaddff,
  },
  dungeon: {
    sandKeys: ['kenmi-base-tiles-cave-cave-floor-1'],
    sandCols: 5,  // verify actual column count
    grassKey: 'kenmi-base-tiles-cave-cave-floor-2',
    grassCols: 5,
    waterKey: 'kenmi-base-tiles-cave-cave-water',
    waterCols: 4,
    foamKey: 'kenmi-base-tiles-cave-cave-water-animation',
    foamCols: 8,
  },
  volcano: {
    sandKeys: ['kenmi-volcano-tiles-volcano-tiles'],
    sandCols: 29,
    grassKey: 'kenmi-volcano-tiles-volcano-tiles',
    grassCols: 29,
    waterKey: 'kenmi-volcano-tiles-volcano-lava-buble',  // lava = water equivalent
    waterCols: 11,
    foamKey: 'kenmi-volcano-tiles-volcano-lava-buble',
    foamCols: 11,
  },
  mushroom: {
    sandKeys: ['kenmi-shroom-tiles-shroomlands-grass-green-tiles'],
    sandCols: 11,
    grassKey: 'kenmi-shroom-tiles-shroomlands-grass-green-tiles',
    grassCols: 11,
    waterKey: 'kenmi-base-tiles-water-water-tile-1',
    waterCols: 3,
    foamKey: 'kenmi-base-tiles-water-water-foam-animation',
    foamCols: 20,
  },
};
```

### Zone tilesetTheme Field Addition

```javascript
// src/data/zones.js — add to each zone object

const farmland = {
  id: 'farmland',
  tilesetTheme: 'grass',   // NEW: drives MapLoader biome dispatch
  // ...all existing fields unchanged...
};

const mountain_village = {
  id: 'mountain_village',
  tilesetTheme: 'snow',
  // ...
};
```

### Confirmed Desert Tile Frame Maps (verified from actual PNG dimensions)

```javascript
// desert-beach-tiles-1.png = 80×48px = 5 cols × 3 rows = 15 frames
const BEACH_COLS = 5;
const BEACH = {
  CORNER_TL: 0, EDGE_TOP: 1, CORNER_TR: 2, SAND_SOLID: 3, WATER_POOL: 4,
  EDGE_LEFT: 5, WATER_CENTER: 6, EDGE_RIGHT: 7, SAND_VAR_1: 8, WATER_VAR: 9,
  CORNER_BL: 10, EDGE_BOTTOM: 11, CORNER_BR: 12, SAND_VAR_2: 13, WATER_INNER: 14,
};

// desert-grass.png = 48×80px = 3 cols × 5 rows = 15 frames
const GRASS_COLS = 3;
const GRASS_F = {
  CORNER_TL: 0, EDGE_TOP: 1, CORNER_TR: 2,
  EDGE_LEFT: 3, SOLID: 4, EDGE_RIGHT: 5,
  CORNER_BL: 6, EDGE_BOTTOM: 7, CORNER_BR: 8,
  VAR_1: 9, VAR_2: 10, VAR_3: 11,
  VAR_4: 12, VAR_5: 13, VAR_6: 14,
};

// desert-water-tiles-1.png = 96×48px = 6 cols × 3 rows = 18 frames
const WATER_COLS = 6;
const WATER_F = {
  CORNER_TL: 0, EDGE_TOP: 1, CORNER_TR: 2, SOLID_1: 3, SOLID_2: 4, SOLID_3: 5,
  EDGE_LEFT: 6, SOLID_4: 7, EDGE_RIGHT: 8, SOLID_5: 9, SOLID_6: 10, SOLID_7: 11,
  CORNER_BL: 12, EDGE_BOTTOM: 13, CORNER_BR: 14, SOLID_8: 15, SOLID_9: 16, SOLID_10: 17,
};

// desert-water-foam-animation.png = 320×48px = 20 cols × 3 rows = 60 frames
const FOAM_COLS = 20;
// Row 0 (0-19): top foam; Row 1 (20-39): left foam; Row 2 (40-59): bottom foam
```

These match the constants already in MapLoader.js exactly. The existing code is correct.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|---|---|---|
| Flat colored rectangles (`tile-sand`, `tile-grass`, `grass-ice`) | Kenmi 16x16 pixel art sprites scaled 4x | Full visual transformation |
| `addWaterEdgeEffect` blue rectangle tween | Animated foam sprites (`_addFoamOverlay`) | Proper pixel art water animation |
| Single tileset for all zones | Biome-dispatched tileset per zone | Desert/grass/snow/dungeon/volcano/mushroom |
| `_renderFlatTiles` always called | `_renderKenmiTiles` with biome parameter | Prerequisite for v8.0 visual overhaul |

**Important historical note:** `_renderKenmiTiles` was implemented and then disabled (the TODO comment says "wrong frame indices cause tiling artifacts"). Based on code inspection, the frame maps are arithmetically correct. The "artifacts" may have been a visual interpretation issue (the tiles looked different than expected but were technically correct), or there may be a specific edge case in `_pickSandWaterFrame` involving diagonal-only neighbors. Plan 39-01 should enable the code and test systematically — oasis_village has both sand-water and sand-grass transitions that will cover the main cases.

---

## Plan Structure Guidance

Based on the research, the three planned plans map cleanly:

### Plan 39-01: Enable Desert Tileset (TILE-01, TILE-02, TILE-03, TILE-04, TILE-05)
**Scope:** Fix `renderGroundTiles` to call `_renderKenmiTiles`, gate `addWaterEdgeEffect`, verify frame maps, test oasis_village + all desert zones.
- Change `renderGroundTiles` to dispatch to `_renderKenmiTiles` when Kenmi textures exist
- Add `biome` parameter threading from `MapLoader.create` → `renderGroundTiles` → `_renderKenmiTiles`
- Gate `addWaterEdgeEffect` behind `!this._hasKenmiTiles()`
- Add `tilesetTheme: 'desert'` to 5 desert zones (oasis_village, ancient_library, desert_marketplace, bedouin_camp) — optional since 'desert' is the default
- Verify all 3 sand color variants display across the map
- Verify foam animation plays on shoreline tiles

### Plan 39-02: Biome Tileset System (TILE-06, TILE-07)
**Scope:** Add `BIOME_TILESETS` config, add `tilesetTheme` to remaining zones, implement per-biome rendering for grass and snow biomes.
- Add `BIOME_TILESETS` constant to MapLoader.js (or BiomeTilesets.js)
- Add `tilesetTheme` to farmland, mountain_village, coastal_port, royal_palace zones
- Thread biome config into `_renderGrassTile` and `_renderWaterTile`
- Handle ICE_GRASS in snow biome using christmas grass tiles
- Test mountain_village (snow) and farmland (grass)

### Plan 39-03: Dungeon, Volcano, Mushroom Biomes + Placeholder Zones (TILE-08, TILE-09, TILE-10)
**Scope:** Add dungeon/volcano/mushroom biome configs, add `tilesetTheme` to all fantasy zones, verify all 24 zones render pixel art (no flat squares).
- Add dungeon, volcano, mushroom entries to BIOME_TILESETS
- Add `tilesetTheme` to all 8 fantasy zones (src/data/zones/fantasyZones.js) and 8 real-world zones
- Note: dungeon biome must use cave floor spritesheet keys, NOT dungeon-1.png (image type)
- Verify volcano lava animation (lava-buble key is spritesheet, 11 frames)
- Final check: open every zone, confirm no flat colored squares anywhere

---

## Open Questions

1. **What caused the original "tiling artifacts" in `_renderKenmiTiles`?**
   - What we know: The code was disabled with a TODO comment. The frame arithmetic appears correct.
   - What's unclear: Whether there was a specific visual issue (wrong corner tile) or a crash.
   - Recommendation: Enable it in Plan 39-01, run in browser, screenshot each biome transition. If a specific tile placement looks wrong, the `_pickSandWaterFrame` direction logic (N/S/E/W semantics) may need a sign flip.

2. **Base grass blob tileset frame layout (grass-tiles-1.png, 16×10)**
   - What we know: Sheet is 256×160px = 16 cols × 10 rows = 160 frames. The blob test sheets are 7×7.
   - What's unclear: Whether rows 0-2 (first 3 rows of 16 cols = 48 frames) follow a standard RPG Maker XP/VX auto-tile layout or a custom layout.
   - Recommendation: Start with the simplest approach — use just frames from the first row (0-15) as variants (solid grass fills), skip auto-tiling for grass biome in 39-02. The desert grass `_renderGrassTile` pattern can be ported once the blob layout is confirmed visually.

3. **dungeon-1.png is cataloged as 'image', not 'spritesheet'**
   - What we know: Can't use frame indices directly on image-type textures in Phaser 3.
   - What's unclear: Whether BootScene needs a special override to reload it as a spritesheet.
   - Recommendation: Use `kenmi-base-tiles-cave-cave-floor-1` (cataloged as spritesheet) for dungeon biome floors. It's the most semantically correct choice and avoids the image-type limitation entirely.

---

## Sources

### Primary (HIGH confidence — direct code inspection)
- `/Users/theshumba/Documents/GitHub/gogo-arabic/src/game/systems/MapLoader.js` — full implementation of `_renderKenmiTiles`, frame maps, auto-tiling helpers, foam animation, water shimmer
- `/Users/theshumba/Documents/GitHub/gogo-arabic/src/data/kenmiCatalog.js` — all 969 asset keys with type annotations (spritesheet vs image)
- `/Users/theshumba/Documents/GitHub/gogo-arabic/src/data/zones.js` — all 8 main zone definitions, `buildMap()` functions, tile type constants (SAND=0, GRASS=1, WATER=2, ICE_GRASS=3)
- `/Users/theshumba/Documents/GitHub/gogo-arabic/public/assets/kenmi/` — physical file structure, all tile PNG files present
- Python PIL measurements of key PNG files — exact pixel dimensions and tile grid counts

### Secondary (MEDIUM confidence)
- `/Users/theshumba/Documents/GitHub/gogo-arabic/src/game/scenes/WorldScene.js` — confirmed that Tiled path is only triggered when `tiledMapLoader.hasMap(zoneName)` returns true; code-generated path is the active path for all current zones
- `/Users/theshumba/Documents/GitHub/gogo-arabic/src/game/scenes/BootScene.js` — confirmed KENMI_CATALOG loop loads all 969 assets including all tile spritesheets
- `.planning/phases/39-terrain-rendering/39-01-SUMMARY.md` — confirms Plan 39-01 was previously started (rendering code was built) but the full desert activation is incomplete

---

## Metadata

**Confidence breakdown:**
- Standard stack (Kenmi tile keys and dimensions): HIGH — verified from actual files
- Architecture (MapLoader internal structure): HIGH — full source read
- Frame maps for desert tiles: HIGH — PNG dimensions verified against constants in code
- Frame maps for non-desert biomes: MEDIUM — PNG dimensions verified but frame layout unknown without visual inspection
- Pitfalls: HIGH — identified from direct code analysis, not speculation

**Research date:** 2026-03-17
**Valid until:** Stable — Kenmi assets are purchased/local, no external dependencies
