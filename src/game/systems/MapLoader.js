import { TILE, SAND, GRASS, WATER, ICE_GRASS, STONE, WOOD } from '../../data/zones.js';
import { SPRITE_KEY_MAP } from '../../data/spriteKeyMap.js';

// ================================================================
// Kenmi 16x16 desert tileset keys & frame maps
// ================================================================

// Sand ground tilesets (3 color variants, same layout: 5 cols x 3 rows = 15 frames)
const BEACH_KEYS = [
  'kenmi-desert-tiles-desert-beach-tiles-1',
  'kenmi-desert-tiles-desert-beach-tiles-2',
  'kenmi-desert-tiles-desert-beach-tiles-3',
];
const BEACH_COLS = 5;

// Beach tileset frame indices (per-sheet)
const BEACH = {
  // Sand-water border edges (sand with water cutout)
  CORNER_TL: 0,                       // (0,0) top-left corner
  EDGE_TOP:  1,                        // (1,0) top edge — sand above, water below
  CORNER_TR: 2,                        // (2,0) top-right corner
  SAND_SOLID: 3,                       // (3,0) solid sand fill
  WATER_POOL: 4,                       // (4,0) solid water pool

  EDGE_LEFT:   BEACH_COLS + 0,        // (0,1) left edge — sand left, water right
  WATER_CENTER: BEACH_COLS + 1,       // (1,1) water surrounded by sand
  EDGE_RIGHT:  BEACH_COLS + 2,        // (2,1) right edge — sand right, water left
  SAND_VAR_1:  BEACH_COLS + 3,        // (3,1) inner sand variant
  WATER_VAR:   BEACH_COLS + 4,        // (4,1) water variant

  CORNER_BL:   BEACH_COLS * 2 + 0,   // (0,2) bottom-left corner
  EDGE_BOTTOM: BEACH_COLS * 2 + 1,   // (1,2) bottom edge — sand below, water above
  CORNER_BR:   BEACH_COLS * 2 + 2,   // (2,2) bottom-right corner
  SAND_VAR_2:  BEACH_COLS * 2 + 3,   // (3,2) sand variant 2
  WATER_INNER: BEACH_COLS * 2 + 4,   // (4,2) water inner
};

// Grass tileset (3 cols x 5 rows = 15 frames)
const GRASS_KEY = 'kenmi-desert-tiles-desert-grass';
const GRASS_COLS = 3;

const GRASS_F = {
  CORNER_TL: 0,
  EDGE_TOP:  1,
  CORNER_TR: 2,
  EDGE_LEFT:  GRASS_COLS + 0,
  SOLID:      GRASS_COLS + 1,
  EDGE_RIGHT: GRASS_COLS + 2,
  CORNER_BL:  GRASS_COLS * 2 + 0,
  EDGE_BOTTOM: GRASS_COLS * 2 + 1,
  CORNER_BR:  GRASS_COLS * 2 + 2,
  // Variants in rows 3-4
  VAR_1: GRASS_COLS * 3 + 0,
  VAR_2: GRASS_COLS * 3 + 1,
  VAR_3: GRASS_COLS * 3 + 2,
  VAR_4: GRASS_COLS * 4 + 0,
  VAR_5: GRASS_COLS * 4 + 1,
  VAR_6: GRASS_COLS * 4 + 2,
};

// Water tileset (6 cols x 3 rows = 18 frames)
const WATER_KEY = 'kenmi-desert-tiles-desert-water-tiles-1';
const WATER_COLS = 6;

const WATER_F = {
  // Row 0: top edges
  CORNER_TL: 0,
  EDGE_TOP:  1,
  CORNER_TR: 2,
  SOLID_1:   3,
  SOLID_2:   4,
  SOLID_3:   5,
  // Row 1: mid edges + solid fills
  EDGE_LEFT:   WATER_COLS + 0,
  SOLID_4:     WATER_COLS + 1,
  EDGE_RIGHT:  WATER_COLS + 2,
  SOLID_5:     WATER_COLS + 3,
  SOLID_6:     WATER_COLS + 4,
  SOLID_7:     WATER_COLS + 5,
  // Row 2: bottom edges
  CORNER_BL:    WATER_COLS * 2 + 0,
  EDGE_BOTTOM:  WATER_COLS * 2 + 1,
  CORNER_BR:    WATER_COLS * 2 + 2,
  SOLID_8:      WATER_COLS * 2 + 3,
  SOLID_9:      WATER_COLS * 2 + 4,
  SOLID_10:     WATER_COLS * 2 + 5,
};

// Water foam animation key (20 cols x 3 rows = 60 frames)
const FOAM_KEY = 'kenmi-desert-tiles-desert-water-foam-animation';
const FOAM_COLS = 20;

const KENMI_SCALE = 4; // 16px tiles -> 64px game tiles

/**
 * Simple deterministic hash for seeded pseudo-random per tile.
 * Returns a float in [0, 1).
 */
function tileHash(x, y, seed) {
  let h = (x * 374761 + y * 668265 + seed * 982451) | 0;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = (h >> 16) ^ h;
  return (h & 0x7fffffff) / 0x7fffffff;
}

/**
 * MapLoader
 * Handles tilemap loading, rendering, collision setup, and visual effects
 */
export class MapLoader {
  constructor(scene) {
    this.scene = scene;
    this.groundSprites = [];
    this.objectSprites = [];
    this.decoSprites = [];
    this.animalSprites = [];
    this.wallGroup = null;
    this.exitTriggers = [];
    this.activeTweens = [];
  }

  /**
   * Build a zone's tilemap, objects, and collision
   */
  create(zone, mapWidth, mapHeight) {
    this.groundSprites = [];
    this.objectSprites = [];
    this.decoSprites = [];
    this.animalSprites = [];
    this.exitTriggers = [];
    this.activeTweens.forEach((t) => { if (t) t.remove(); });
    this.activeTweens = [];

    const groundData = zone.buildMap();
    const objects = zone.objects;
    const exits = zone.exits || [];

    // Create collision group
    this.wallGroup = this.scene.physics.add.staticGroup();

    // Render ground tiles
    this.renderGroundTiles(groundData, mapWidth, mapHeight);

    // Water edge shimmer effect
    this.addWaterEdgeEffect(groundData, mapWidth, mapHeight);

    // Setup collision (borders + water)
    this.setupCollision(groundData, mapWidth, mapHeight, exits);

    // Place world objects
    this.placeObjects(objects);

    // Scatter desert decorations on empty sand tiles
    this.scatterDecorations(zone, groundData, mapWidth, mapHeight);

    // Place ambient animals (camels, vultures, scarabs) in desert zones
    this.spawnAmbientAnimals(zone, groundData, mapWidth, mapHeight);

    // Create exit triggers (signposts at zone edges)
    this.createExitTriggers(exits, mapWidth, mapHeight);

    return this.wallGroup;
  }

  // ================================================================
  // Ground tile rendering
  // ================================================================

  /**
   * Render ground tiles — uses Kenmi desert tileset if available, flat colors as fallback
   */
  renderGroundTiles(groundData, mapW, mapH) {
    if (this._hasKenmiTiles()) {
      this._renderKenmiTiles(groundData, mapW, mapH);
    } else {
      this._renderFlatTiles(groundData, mapW, mapH);
    }
  }

  /**
   * Check if Kenmi tileset textures are loaded
   */
  _hasKenmiTiles() {
    return this.scene.textures.exists(BEACH_KEYS[0]);
  }

  /**
   * Fallback: original flat-color tile rendering
   */
  _renderFlatTiles(groundData, mapW, mapH) {
    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        const px = x * TILE + TILE / 2;
        const py = y * TILE + TILE / 2;
        const tileType = groundData[y][x];

        let sprite;
        if (tileType === GRASS) {
          sprite = this.scene.add.image(px, py, 'tile-grass');
        } else if (tileType === WATER) {
          sprite = this.scene.add.image(px, py, 'tile-sand');
          sprite.setTint(0x50b0d8);
        } else if (tileType === ICE_GRASS) {
          sprite = this.scene.add.image(px, py, 'grass-ice');
        } else {
          sprite = this.scene.add.image(px, py, 'tile-sand');
        }
        this.groundSprites.push(sprite);
      }
    }
  }

  /**
   * Kenmi 16x16 desert tileset rendering with auto-tiling.
   * Uses beach-tiles for sand, desert-grass for grass, water-tiles for water.
   * All sprites scaled 4x (16px -> 64px).
   */
  _renderKenmiTiles(groundData, mapW, mapH) {
    // Create foam animation if not yet registered
    this._createFoamAnimations();

    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        const px = x * TILE + TILE / 2;
        const py = y * TILE + TILE / 2;
        const tileType = groundData[y][x];
        const n = this._getNeighbors(groundData, x, y, mapW, mapH);
        const hash = tileHash(x, y, 42);

        let sprite;

        switch (tileType) {
          case GRASS:
          case ICE_GRASS:
            sprite = this._renderGrassTile(px, py, n, hash, tileType);
            break;
          case WATER:
            sprite = this._renderWaterTile(px, py, n, hash, groundData, x, y, mapW, mapH);
            break;
          case SAND:
          case STONE:
          case WOOD:
          default:
            sprite = this._renderSandTile(px, py, n, hash, groundData, x, y, mapW, mapH);
            break;
        }

        sprite.setDepth(0);
        this.groundSprites.push(sprite);
      }
    }
  }

  // ================================================================
  // Kenmi tile renderers
  // ================================================================

  /**
   * Render a sand tile. Checks if any water neighbor exists to pick
   * sand-water border frames from the beach tileset.
   */
  _renderSandTile(px, py, neighbors, hash, groundData, tx, ty, mapW, mapH) {
    const nWater = neighbors.n === WATER;
    const sWater = neighbors.s === WATER;
    const wWater = neighbors.w === WATER;
    const eWater = neighbors.e === WATER;
    const hasWaterNeighbor = nWater || sWater || wWater || eWater;

    if (!hasWaterNeighbor) {
      // Solid sand — pick from 3 color variants for visual variety
      const variantIdx = Math.floor(hash * 3);
      const key = BEACH_KEYS[variantIdx];
      // Use SAND_SOLID (frame 3) or sand variants for extra variety
      const solidFrames = [BEACH.SAND_SOLID, BEACH.SAND_VAR_1, BEACH.SAND_VAR_2];
      const varHash = tileHash(tx, ty, 99);
      const frame = solidFrames[Math.floor(varHash * solidFrames.length)];
      const sprite = this.scene.add.image(px, py, key, frame);
      sprite.setScale(KENMI_SCALE);
      return sprite;
    }

    // Sand bordering water — use beach transition frames
    // Pick the primary beach variant (variant 1 for consistency at transitions)
    const key = BEACH_KEYS[0];
    const frame = this._pickSandWaterFrame(nWater, sWater, wWater, eWater, groundData, tx, ty, mapW, mapH);
    const sprite = this.scene.add.image(px, py, key, frame);
    sprite.setScale(KENMI_SCALE);
    return sprite;
  }

  /**
   * Pick the correct beach-tiles frame for sand bordering water.
   * The beach tileset shows sand with water cutouts, so:
   * - "top edge" = sand on top, water below
   * - Corners are where two edges meet
   */
  _pickSandWaterFrame(nWater, sWater, wWater, eWater, groundData, tx, ty, mapW, mapH) {
    // Also check diagonal neighbors for corner detection
    const nw = (ty > 0 && tx > 0) ? groundData[ty - 1][tx - 1] === WATER : false;
    const ne = (ty > 0 && tx < mapW - 1) ? groundData[ty - 1][tx + 1] === WATER : false;
    const sw = (ty < mapH - 1 && tx > 0) ? groundData[ty + 1][tx - 1] === WATER : false;
    const se = (ty < mapH - 1 && tx < mapW - 1) ? groundData[ty + 1][tx + 1] === WATER : false;

    // Two-edge corners (L-shaped water borders)
    if (nWater && wWater) return BEACH.CORNER_BR;  // water NW -> sand is BR corner
    if (nWater && eWater) return BEACH.CORNER_BL;  // water NE -> sand is BL corner
    if (sWater && wWater) return BEACH.CORNER_TR;  // water SW -> sand is TR corner
    if (sWater && eWater) return BEACH.CORNER_TL;  // water SE -> sand is TL corner

    // Single cardinal edges
    if (nWater) return BEACH.EDGE_BOTTOM; // water above -> bottom edge of sand island
    if (sWater) return BEACH.EDGE_TOP;    // water below -> top edge of sand island
    if (wWater) return BEACH.EDGE_RIGHT;  // water left -> right edge of sand island
    if (eWater) return BEACH.EDGE_LEFT;   // water right -> left edge of sand island

    // Inner corners (only diagonal water neighbor)
    if (nw) return BEACH.CORNER_BR;
    if (ne) return BEACH.CORNER_BL;
    if (sw) return BEACH.CORNER_TR;
    if (se) return BEACH.CORNER_TL;

    // Fallback to solid sand
    return BEACH.SAND_SOLID;
  }

  /**
   * Render a grass tile with auto-tiling edges.
   */
  _renderGrassTile(px, py, neighbors, hash, tileType) {
    const isGrassLike = (t) => t === GRASS || t === ICE_GRASS;
    const nForeign = !isGrassLike(neighbors.n);
    const sForeign = !isGrassLike(neighbors.s);
    const wForeign = !isGrassLike(neighbors.w);
    const eForeign = !isGrassLike(neighbors.e);

    let frame;
    if (!nForeign && !sForeign && !wForeign && !eForeign) {
      // Fully surrounded by grass — solid fill with variation
      const solids = [GRASS_F.SOLID, GRASS_F.VAR_1, GRASS_F.VAR_2, GRASS_F.VAR_3];
      frame = solids[Math.floor(hash * solids.length)];
    } else {
      frame = this._pickEdgeFrame(
        nForeign, sForeign, wForeign, eForeign,
        GRASS_F.CORNER_TL, GRASS_F.EDGE_TOP, GRASS_F.CORNER_TR,
        GRASS_F.EDGE_LEFT, GRASS_F.EDGE_BOTTOM, GRASS_F.EDGE_RIGHT,
        GRASS_F.SOLID,
        GRASS_F.CORNER_BL, GRASS_F.CORNER_BR
      );
    }

    const sprite = this.scene.add.image(px, py, GRASS_KEY, frame);
    sprite.setScale(KENMI_SCALE);

    // Ice-grass: blue tint
    if (tileType === ICE_GRASS) {
      sprite.setTint(0x99ccff);
    }

    return sprite;
  }

  /**
   * Render a water tile with auto-tiling edges.
   * Also places animated foam sprites on water tiles bordering sand.
   */
  _renderWaterTile(px, py, neighbors, hash, groundData, tx, ty, mapW, mapH) {
    const nForeign = neighbors.n !== WATER;
    const sForeign = neighbors.s !== WATER;
    const wForeign = neighbors.w !== WATER;
    const eForeign = neighbors.e !== WATER;

    let frame;
    if (!nForeign && !sForeign && !wForeign && !eForeign) {
      // Fully surrounded by water — solid fill with variation
      const solids = [WATER_F.SOLID_1, WATER_F.SOLID_2, WATER_F.SOLID_3,
                      WATER_F.SOLID_4, WATER_F.SOLID_5];
      frame = solids[Math.floor(hash * solids.length)];
    } else {
      frame = this._pickEdgeFrame(
        nForeign, sForeign, wForeign, eForeign,
        WATER_F.CORNER_TL, WATER_F.EDGE_TOP, WATER_F.CORNER_TR,
        WATER_F.EDGE_LEFT, WATER_F.EDGE_BOTTOM, WATER_F.EDGE_RIGHT,
        WATER_F.SOLID_1,
        WATER_F.CORNER_BL, WATER_F.CORNER_BR
      );
    }

    const sprite = this.scene.add.image(px, py, WATER_KEY, frame);
    sprite.setScale(KENMI_SCALE);

    // Add foam animation overlay on water tiles that border sand
    if (nForeign || sForeign || wForeign || eForeign) {
      this._addFoamOverlay(px, py, nForeign, sForeign, wForeign, eForeign);
    }

    return sprite;
  }

  // ================================================================
  // Auto-tiling helpers
  // ================================================================

  /**
   * Get 4-neighbor tile types (N, S, E, W). Out-of-bounds treated as same type.
   */
  _getNeighbors(groundData, x, y, mapW, mapH) {
    const current = groundData[y][x];
    return {
      n: y > 0 ? groundData[y - 1][x] : current,
      s: y < mapH - 1 ? groundData[y + 1][x] : current,
      w: x > 0 ? groundData[y][x - 1] : current,
      e: x < mapW - 1 ? groundData[y][x + 1] : current,
    };
  }

  /**
   * Generic 4-neighbor edge frame picker.
   * Given which sides are "foreign" (bordering different terrain), picks the
   * appropriate auto-tile frame from a 3x3 block:
   *   TL  T  TR
   *   L   -  R
   *   BL  B  BR
   */
  _pickEdgeFrame(nForeign, sForeign, wForeign, eForeign, TL, T, TR, L, B, R, fallback, BL, BR) {
    // Corner cases (2 adjacent foreign sides)
    if (nForeign && wForeign) return TL;
    if (nForeign && eForeign) return TR;
    if (sForeign && wForeign) return BL !== undefined ? BL : L;
    if (sForeign && eForeign) return BR !== undefined ? BR : R;

    // Single edge cases
    if (nForeign) return T;
    if (sForeign) return B;
    if (wForeign) return L;
    if (eForeign) return R;

    // Fallback (shouldn't normally reach here)
    return fallback;
  }

  /**
   * Check if tile type is sand-like (sand, stone, wood, or unknown)
   */
  _isSandLike(tileType) {
    return tileType === SAND || tileType === STONE || tileType === WOOD;
  }

  // ================================================================
  // Water foam animation
  // ================================================================

  /**
   * Create foam animation configs (run once per zone load)
   */
  _createFoamAnimations() {
    if (!this.scene.textures.exists(FOAM_KEY)) return;
    if (this.scene.anims.exists('water-foam-top')) return;

    // Row 0 (frames 0-19): top/horizontal foam
    this.scene.anims.create({
      key: 'water-foam-top',
      frames: this.scene.anims.generateFrameNumbers(FOAM_KEY, { start: 0, end: FOAM_COLS - 1 }),
      frameRate: 6,
      repeat: -1,
    });
    // Row 1 (frames 20-39): left/vertical foam
    this.scene.anims.create({
      key: 'water-foam-left',
      frames: this.scene.anims.generateFrameNumbers(FOAM_KEY, { start: FOAM_COLS, end: FOAM_COLS * 2 - 1 }),
      frameRate: 6,
      repeat: -1,
    });
    // Row 2 (frames 40-59): bottom/other direction foam
    this.scene.anims.create({
      key: 'water-foam-bottom',
      frames: this.scene.anims.generateFrameNumbers(FOAM_KEY, { start: FOAM_COLS * 2, end: FOAM_COLS * 3 - 1 }),
      frameRate: 6,
      repeat: -1,
    });
  }

  /**
   * Add animated foam sprite overlay on a water tile that borders land.
   */
  _addFoamOverlay(px, py, nForeign, sForeign, wForeign, eForeign) {
    if (!this.scene.textures.exists(FOAM_KEY)) return;

    // Pick the foam animation direction based on which edge borders land
    let animKey = null;
    if (nForeign) animKey = 'water-foam-top';
    else if (sForeign) animKey = 'water-foam-bottom';
    else if (wForeign) animKey = 'water-foam-left';
    else if (eForeign) animKey = 'water-foam-left'; // flip for right side

    if (!animKey || !this.scene.anims.exists(animKey)) return;

    const foam = this.scene.add.sprite(px, py, FOAM_KEY, 0);
    foam.setScale(KENMI_SCALE);
    foam.setDepth(1);
    foam.setAlpha(0.7);
    foam.play(animKey);

    // Flip horizontally for right-side foam
    if (eForeign && !wForeign) {
      foam.setFlipX(true);
    }
    // Flip vertically for bottom foam displayed via top anim
    if (sForeign && !nForeign && animKey === 'water-foam-bottom') {
      foam.setFlipY(true);
    }

    this.groundSprites.push(foam);
  }

  // ================================================================
  // Water edge effects
  // ================================================================

  /**
   * Add shimmer effect to water edges
   */
  addWaterEdgeEffect(groundData, mapW, mapH) {
    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        if (groundData[y][x] !== WATER) continue;
        const adj = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
        ];
        for (const [ax, ay] of adj) {
          if (
            ax >= 0 &&
            ax < mapW &&
            ay >= 0 &&
            ay < mapH &&
            groundData[ay][ax] !== WATER
          ) {
            const px = x * TILE + TILE / 2;
            const py = y * TILE + TILE / 2;
            const edge = this.scene.add.rectangle(px, py, TILE, TILE, 0x66d7ee, 0.3);
            const tween = this.scene.tweens.add({
              targets: edge,
              alpha: { from: 0.15, to: 0.35 },
              duration: 1500,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut',
            });
            this.activeTweens.push(tween);
            this.groundSprites.push(edge);
            break;
          }
        }
      }
    }
  }

  // ================================================================
  // Collision
  // ================================================================

  /**
   * Setup collision: world borders (with exit gaps) and water
   */
  setupCollision(groundData, mapW, mapH, exits) {
    const mapPixelW = mapW * TILE;
    const mapPixelH = mapH * TILE;

    // World border walls (invisible) — skip tiles that have exits
    const exitEdgeTiles = this.buildExitEdgeSet(exits, mapW, mapH);

    for (let x = -1; x <= mapW; x++) {
      if (!exitEdgeTiles.has(`north:${x}`)) {
        this.addInvisibleWall(x * TILE + TILE / 2, -TILE / 2, TILE, TILE);
      }
      if (!exitEdgeTiles.has(`south:${x}`)) {
        this.addInvisibleWall(x * TILE + TILE / 2, mapPixelH + TILE / 2, TILE, TILE);
      }
    }
    for (let y = 0; y < mapH; y++) {
      if (!exitEdgeTiles.has(`west:${y}`)) {
        this.addInvisibleWall(-TILE / 2, y * TILE + TILE / 2, TILE, TILE);
      }
      if (!exitEdgeTiles.has(`east:${y}`)) {
        this.addInvisibleWall(mapPixelW + TILE / 2, y * TILE + TILE / 2, TILE, TILE);
      }
    }

    // Water collision
    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        if (groundData[y][x] === WATER) {
          this.addInvisibleWall(
            x * TILE + TILE / 2,
            y * TILE + TILE / 2,
            TILE,
            TILE
          );
        }
      }
    }
  }

  // ================================================================
  // World objects
  // ================================================================

  /**
   * Place world objects (trees, buildings, etc.) with Y-sorting
   */
  placeObjects(objects) {
    const sortedObjects = [...objects].sort((a, b) => a.y - b.y);
    sortedObjects.forEach((obj) => {
      const px = obj.x * TILE + TILE / 2;
      const py = obj.y * TILE + TILE / 2;

      // Remap old placeholder keys to Kenmi asset keys (backward compatible)
      const kenmiKey = SPRITE_KEY_MAP[obj.key];
      const textureKey = kenmiKey && this.scene.textures.exists(kenmiKey) ? kenmiKey : obj.key;
      const sprite = this.scene.add.image(px, py, textureKey).setOrigin(0.5, 0.8);

      // Kenmi sprites are 16x16 base, need scaling. Old sprites are already correct size.
      if (kenmiKey && this.scene.textures.exists(kenmiKey)) {
        sprite.setScale(KENMI_SCALE);
      }

      this.objectSprites.push(sprite);

      if (obj.collide) {
        const collider = this.wallGroup.create(px, py + 20, null);
        collider.setVisible(false);
        collider.body.setSize(obj.collideW || 40, obj.collideH || 20);
        collider.refreshBody();
      }
    });
  }

  // ================================================================
  // Exit triggers
  // ================================================================

  /**
   * Create exit trigger signposts at zone edges
   */
  createExitTriggers(exits, mapW, mapH) {
    exits.forEach((exit) => {
      const { edge, tileRange, label, labelArabic } = exit;
      const midTile = Math.floor((tileRange[0] + tileRange[1]) / 2);

      let signX, signY;
      if (edge === 'north') {
        signX = midTile * TILE + TILE / 2;
        signY = TILE / 2;
      } else if (edge === 'south') {
        signX = midTile * TILE + TILE / 2;
        signY = (mapH - 1) * TILE + TILE / 2;
      } else if (edge === 'west') {
        signX = TILE / 2;
        signY = midTile * TILE + TILE / 2;
      } else {
        signX = (mapW - 1) * TILE + TILE / 2;
        signY = midTile * TILE + TILE / 2;
      }

      const signSprite = this.scene.add.image(signX, signY, 'gate-pillar').setOrigin(0.5, 0.8).setDepth(9998);
      const signLabel = this.scene.add.text(signX, signY - 50, `${labelArabic}\n${label}`, {
        fontFamily: "'Noto Naskh Arabic', serif",
        fontSize: '12px',
        color: '#e2b659',
        stroke: '#2b292c',
        strokeThickness: 3,
        align: 'center',
      }).setOrigin(0.5).setDepth(9999);

      this.exitTriggers.push({
        ...exit,
        signX,
        signY,
        sprite: signSprite,
        label: signLabel,
      });
    });
  }

  // ================================================================
  // Decoration scattering
  // ================================================================

  /**
   * Scatter Kenmi desert props across empty sand tiles for visual density.
   * Uses seeded randomness for deterministic placement, context-aware prop
   * selection, and clustering near objects/water/edges.
   */
  scatterDecorations(zone, groundData, mapW, mapH) {
    // Only run when Kenmi desert props are loaded
    if (!this.scene.textures.exists('kenmi-desert-props-cactus')) return;

    // Create animated grass animations if not yet registered
    this._createDecoGrassAnimations();

    // Build occupied tile set from zone objects (tile coords)
    const occupiedTiles = new Set();
    const objects = zone.objects || [];
    for (const obj of objects) {
      // Mark the object tile and a 1-tile buffer as occupied
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          occupiedTiles.add(`${obj.x + dx},${obj.y + dy}`);
        }
      }
    }

    // Build exit tile set (tiles near exits where decorations should not appear)
    const exitTiles = new Set();
    const exits = zone.exits || [];
    for (const exit of exits) {
      const [start, end] = exit.tileRange;
      for (let t = start - 1; t <= end + 1; t++) {
        if (exit.edge === 'north' || exit.edge === 'south') {
          const ey = exit.edge === 'north' ? 0 : mapH - 1;
          for (let dy = -1; dy <= 1; dy++) {
            exitTiles.add(`${t},${ey + dy}`);
          }
        } else {
          const ex = exit.edge === 'west' ? 0 : mapW - 1;
          for (let dx = -1; dx <= 1; dx++) {
            exitTiles.add(`${ex + dx},${t}`);
          }
        }
      }
    }

    // Prop sets by context
    const NEAR_WATER_PROPS = [
      'kenmi-desert-props-desert-fern',
      'kenmi-desert-props-fallen-palm-leaves',
      'kenmi-desert-props-desert-grass-props',
    ];
    const NEAR_BUILDING_PROPS = [
      'kenmi-desert-props-desert-pots-sacks',
      'kenmi-desert-props-desert-rugs',
      'kenmi-desert-props-sleeping-mat',
      'kenmi-desert-props-golden-pots',
    ];
    const EDGE_PROPS = [
      'kenmi-desert-props-dead-bush',
      'kenmi-desert-props-desert-fern-dead',
      'kenmi-desert-props-desert-bones',
      'kenmi-desert-props-fallen-palm-leaves-dead',
    ];
    const OPEN_PROPS = [
      'kenmi-desert-props-cactus',
      'kenmi-desert-props-desert-rocks',
      'kenmi-desert-props-dead-bush',
      'kenmi-desert-props-desert-grass-props',
      'kenmi-desert-props-desert-fern',
    ];

    // Animated grass spritesheet keys
    const ANIM_GRASS_KEYS = [
      'kenmi-desert-props-outdoor-decor-animations-desert-grass-1-anim',
      'kenmi-desert-props-outdoor-decor-animations-desert-grass-2-anim',
      'kenmi-desert-props-outdoor-decor-animations-desert-grass-3-anim',
    ];

    const DECO_SEED = 777;

    // Helper: check if tile at (tx,ty) is water
    const isWater = (tx, ty) => {
      if (tx < 0 || tx >= mapW || ty < 0 || ty >= mapH) return false;
      return groundData[ty][tx] === WATER;
    };

    // Helper: check if tile is near water (within radius tiles)
    const nearWater = (tx, ty, radius) => {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (isWater(tx + dx, ty + dy)) return true;
        }
      }
      return false;
    };

    // Helper: check if tile is near an object (within radius tiles)
    const nearObject = (tx, ty, radius) => {
      for (const obj of objects) {
        const dist = Math.max(Math.abs(obj.x - tx), Math.abs(obj.y - ty));
        if (dist <= radius) return true;
      }
      return false;
    };

    // Helper: check if tile is near map edge
    const nearEdge = (tx, ty, radius) => {
      return tx < radius || ty < radius || tx >= mapW - radius || ty >= mapH - radius;
    };

    // Helper: pick from array using hash
    const pickFrom = (arr, hash) => {
      const key = arr[Math.floor(hash * arr.length)];
      // Only pick if texture is loaded
      return this.scene.textures.exists(key) ? key : null;
    };

    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        const tileType = groundData[y][x];

        // --- Animated grass on GRASS tiles (3% chance) ---
        if (tileType === GRASS || tileType === ICE_GRASS) {
          const grassHash = tileHash(x, y, DECO_SEED + 500);
          if (grassHash < 0.03) {
            const animIdx = Math.floor(tileHash(x, y, DECO_SEED + 501) * ANIM_GRASS_KEYS.length);
            const animKey = ANIM_GRASS_KEYS[animIdx];
            if (this.scene.textures.exists(animKey)) {
              const animName = `deco-grass-${animIdx + 1}`;
              this._ensureDecoGrassAnim(animKey, animName);
              const px = x * TILE + TILE / 2;
              const py = y * TILE + TILE / 2;
              const grassSprite = this.scene.add.sprite(px, py, animKey, 0);
              grassSprite.setScale(KENMI_SCALE);
              grassSprite.setDepth(py);
              grassSprite.setAlpha(0.85 + tileHash(x, y, DECO_SEED + 502) * 0.15);
              grassSprite.play(animName);
              this.decoSprites.push(grassSprite);
            }
          }
          continue; // Don't place sand props on grass tiles
        }

        // Only place sand decorations on SAND-like tiles
        if (!this._isSandLike(tileType)) continue;

        // Skip occupied tiles (objects, exits)
        const tileKey = `${x},${y}`;
        if (occupiedTiles.has(tileKey)) continue;
        if (exitTiles.has(tileKey)) continue;

        // Determine placement chance based on context
        const hash1 = tileHash(x, y, DECO_SEED);
        let chance = 0.08; // base 8%

        const isNearObj = nearObject(x, y, 3);
        const isNearWater = nearWater(x, y, 2);
        const isNearEdge = nearEdge(x, y, 2);

        if (isNearObj) chance = 0.20;
        else if (isNearWater) chance = 0.15;
        else if (isNearEdge) chance = 0.12;

        if (hash1 > chance) continue;

        // Pick a prop based on context
        const hash2 = tileHash(x, y, DECO_SEED + 1);
        let propKey = null;

        if (isNearWater) {
          propKey = pickFrom(NEAR_WATER_PROPS, hash2);
        } else if (isNearObj) {
          propKey = pickFrom(NEAR_BUILDING_PROPS, hash2);
        } else if (isNearEdge) {
          propKey = pickFrom(EDGE_PROPS, hash2);
        } else {
          propKey = pickFrom(OPEN_PROPS, hash2);
        }

        if (!propKey) continue;

        // Random offset within tile for natural look
        const offsetX = (tileHash(x, y, DECO_SEED + 2) - 0.5) * 24;
        const offsetY = (tileHash(x, y, DECO_SEED + 3) - 0.5) * 24;

        const px = x * TILE + TILE / 2 + offsetX;
        const py = y * TILE + TILE / 2 + offsetY;

        const sprite = this.scene.add.image(px, py, propKey);
        sprite.setScale(KENMI_SCALE);
        sprite.setDepth(py); // Y-sort depth
        sprite.setAlpha(0.8 + tileHash(x, y, DECO_SEED + 4) * 0.2); // 0.8-1.0

        this.decoSprites.push(sprite);
      }
    }
  }

  /**
   * Create animated grass decoration animations (run once)
   */
  _createDecoGrassAnimations() {
    // Pre-create all 3 grass animation configs
    const grassSheets = [
      { key: 'kenmi-desert-props-outdoor-decor-animations-desert-grass-1-anim', anim: 'deco-grass-1' },
      { key: 'kenmi-desert-props-outdoor-decor-animations-desert-grass-2-anim', anim: 'deco-grass-2' },
      { key: 'kenmi-desert-props-outdoor-decor-animations-desert-grass-3-anim', anim: 'deco-grass-3' },
    ];
    for (const { key, anim } of grassSheets) {
      this._ensureDecoGrassAnim(key, anim);
    }
  }

  /**
   * Ensure a single animated grass animation exists
   */
  _ensureDecoGrassAnim(textureKey, animName) {
    if (this.scene.anims.exists(animName)) return;
    if (!this.scene.textures.exists(textureKey)) return;

    // Get frame count from texture
    const tex = this.scene.textures.get(textureKey);
    const frameCount = tex.frameTotal - 1; // subtract __BASE frame
    if (frameCount <= 0) return;

    this.scene.anims.create({
      key: animName,
      frames: this.scene.anims.generateFrameNumbers(textureKey, { start: 0, end: frameCount - 1 }),
      frameRate: 4 + Math.floor(Math.random() * 3), // 4-6 fps for natural sway
      repeat: -1,
    });
  }

  // ================================================================
  // Ambient animals
  // ================================================================

  /**
   * Spawn ambient desert animals (camels, vultures, scarabs) as non-interactive
   * decoration sprites. Uses seeded placement for deterministic positions.
   */
  spawnAmbientAnimals(zone, groundData, mapW, mapH) {
    // Only spawn if Kenmi animal textures are loaded
    if (!this.scene.textures.exists('kenmi-desert-animals-camel-camel-1')) return;

    // Create animal animations if they don't already exist
    this._createAnimalAnimations();

    // Build occupied tile set from zone objects (with 3-tile buffer)
    const objects = zone.objects || [];
    const occupiedSet = new Set();
    for (const obj of objects) {
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          occupiedSet.add(`${obj.x + dx},${obj.y + dy}`);
        }
      }
    }

    // Helper: check if tile at (tx,ty) is water
    const isWater = (tx, ty) => {
      if (tx < 0 || tx >= mapW || ty < 0 || ty >= mapH) return false;
      return groundData[ty][tx] === WATER;
    };

    // Helper: check if tile is near water (within radius tiles)
    const nearWater = (tx, ty, radius) => {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (isWater(tx + dx, ty + dy)) return true;
        }
      }
      return false;
    };

    // Helper: is tile valid for placement (sand, not occupied, not water, not near water within minDist)
    const isValidSandTile = (tx, ty, minWaterDist) => {
      if (tx < 0 || tx >= mapW || ty < 0 || ty >= mapH) return false;
      if (!this._isSandLike(groundData[ty][tx])) return false;
      if (occupiedSet.has(`${tx},${ty}`)) return false;
      if (minWaterDist > 0 && nearWater(tx, ty, minWaterDist)) return false;
      return true;
    };

    const ANIMAL_SEED = 4242;

    // --- Camels: 2-3 on sand tiles, away from buildings/water ---
    const camelCount = 2 + Math.floor(tileHash(0, 0, ANIMAL_SEED) * 2); // 2 or 3
    const camelVariants = ['kenmi-desert-animals-camel-camel-1', 'kenmi-desert-animals-camel-camel-2', 'kenmi-desert-animals-camel-camel-3'];
    const camelAnimKeys = ['camel-idle-1', 'camel-idle-2', 'camel-idle-3'];

    for (let i = 0; i < camelCount; i++) {
      // Find a valid sand tile using seeded scan
      const seedX = tileHash(i, 0, ANIMAL_SEED + 10);
      const seedY = tileHash(0, i, ANIMAL_SEED + 11);
      let placed = false;

      // Spiral outward from seeded start position
      const startX = Math.floor(seedX * (mapW - 6)) + 3;
      const startY = Math.floor(seedY * (mapH - 6)) + 3;

      for (let r = 0; r < Math.max(mapW, mapH) && !placed; r++) {
        for (let dy = -r; dy <= r && !placed; dy++) {
          for (let dx = -r; dx <= r && !placed; dx++) {
            if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue; // only perimeter
            const tx = startX + dx;
            const ty = startY + dy;
            if (isValidSandTile(tx, ty, 3)) {
              const variantIdx = Math.floor(tileHash(tx, ty, ANIMAL_SEED + 12) * camelVariants.length);
              const textureKey = camelVariants[variantIdx];
              if (!this.scene.textures.exists(textureKey)) continue;

              const animKey = camelAnimKeys[variantIdx];
              const px = tx * TILE + TILE / 2;
              const py = ty * TILE + TILE / 2;

              const sprite = this.scene.add.sprite(px, py, textureKey, 0);
              sprite.setScale(KENMI_SCALE);
              sprite.setDepth(py);
              if (this.scene.anims.exists(animKey)) {
                sprite.play(animKey);
              }
              // Random facing direction
              if (tileHash(tx, ty, ANIMAL_SEED + 13) > 0.5) {
                sprite.setFlipX(true);
              }

              this.animalSprites.push(sprite);
              // Mark tile as occupied so next camel doesn't overlap
              for (let ody = -2; ody <= 2; ody++) {
                for (let odx = -2; odx <= 2; odx++) {
                  occupiedSet.add(`${tx + odx},${ty + ody}`);
                }
              }
              placed = true;
            }
          }
        }
      }
    }

    // --- Vultures: 1-2 near edges of map, flying overhead ---
    const vultureCount = 1 + Math.floor(tileHash(1, 1, ANIMAL_SEED + 20) * 2); // 1 or 2
    const vultureVariants = [
      'kenmi-desert-animals-vulture-vulture-1',
      'kenmi-desert-animals-vulture-vulture-2',
      'kenmi-desert-animals-vulture-vulture-3',
      'kenmi-desert-animals-vulture-vulture-4',
    ];
    const vultureAnimKeys = [
      'vulture-fly-1', 'vulture-fly-2', 'vulture-fly-3', 'vulture-fly-4',
    ];

    for (let i = 0; i < vultureCount; i++) {
      const seedVal = tileHash(i, 2, ANIMAL_SEED + 21);
      // Place near map edges
      let tx, ty;
      const edgeSide = Math.floor(tileHash(i, 3, ANIMAL_SEED + 22) * 4);
      const along = tileHash(i, 4, ANIMAL_SEED + 23);

      if (edgeSide === 0) { // top
        tx = Math.floor(along * mapW);
        ty = Math.floor(seedVal * 3);
      } else if (edgeSide === 1) { // bottom
        tx = Math.floor(along * mapW);
        ty = mapH - 1 - Math.floor(seedVal * 3);
      } else if (edgeSide === 2) { // left
        tx = Math.floor(seedVal * 3);
        ty = Math.floor(along * mapH);
      } else { // right
        tx = mapW - 1 - Math.floor(seedVal * 3);
        ty = Math.floor(along * mapH);
      }

      tx = Math.max(0, Math.min(mapW - 1, tx));
      ty = Math.max(0, Math.min(mapH - 1, ty));

      // Vultures fly, so they don't need valid ground — just need to be on sand-ish area
      if (tx >= 0 && tx < mapW && ty >= 0 && ty < mapH) {
        const variantIdx = Math.floor(tileHash(tx, ty, ANIMAL_SEED + 24) * vultureVariants.length);
        const textureKey = vultureVariants[variantIdx];
        if (!this.scene.textures.exists(textureKey)) continue;

        const animKey = vultureAnimKeys[variantIdx];
        const px = tx * TILE + TILE / 2;
        const py = ty * TILE + TILE / 2;

        const sprite = this.scene.add.sprite(px, py, textureKey, 0);
        sprite.setScale(KENMI_SCALE);
        sprite.setDepth(9000); // High depth — flying above everything
        sprite.setAlpha(0.9);
        if (this.scene.anims.exists(animKey)) {
          sprite.play(animKey);
        }
        // Random facing direction
        if (tileHash(tx, ty, ANIMAL_SEED + 25) > 0.5) {
          sprite.setFlipX(true);
        }

        this.animalSprites.push(sprite);
      }
    }

    // --- Scarabs: 2-4 near water or on open sand ---
    const scarabCount = 2 + Math.floor(tileHash(2, 2, ANIMAL_SEED + 30) * 3); // 2-4
    const scarabVariants = [
      'kenmi-desert-animals-scarab-scarab-black',
      'kenmi-desert-animals-scarab-scarab-brown',
      'kenmi-desert-animals-scarab-scarab-green',
      'kenmi-desert-animals-scarab-scarab-yellow',
    ];
    const scarabAnimKeys = [
      'scarab-crawl-black', 'scarab-crawl-brown', 'scarab-crawl-green', 'scarab-crawl-yellow',
    ];

    for (let i = 0; i < scarabCount; i++) {
      const seedX = tileHash(i, 5, ANIMAL_SEED + 31);
      const seedY = tileHash(5, i, ANIMAL_SEED + 32);
      let placed = false;

      // Try to find sand tile near water (within 3 tiles)
      const startX = Math.floor(seedX * (mapW - 4)) + 2;
      const startY = Math.floor(seedY * (mapH - 4)) + 2;

      for (let r = 0; r < Math.max(mapW, mapH) && !placed; r++) {
        for (let dy = -r; dy <= r && !placed; dy++) {
          for (let dx = -r; dx <= r && !placed; dx++) {
            if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
            const tx = startX + dx;
            const ty = startY + dy;
            if (tx < 0 || tx >= mapW || ty < 0 || ty >= mapH) continue;
            if (!this._isSandLike(groundData[ty][tx])) continue;
            if (occupiedSet.has(`${tx},${ty}`)) continue;
            // Prefer tiles near water (within 3 tiles)
            if (!nearWater(tx, ty, 3) && r < Math.max(mapW, mapH) / 2) continue;

            const variantIdx = Math.floor(tileHash(tx, ty, ANIMAL_SEED + 33) * scarabVariants.length);
            const textureKey = scarabVariants[variantIdx];
            if (!this.scene.textures.exists(textureKey)) continue;

            const animKey = scarabAnimKeys[variantIdx];
            const px = tx * TILE + TILE / 2;
            const py = ty * TILE + TILE / 2;

            const sprite = this.scene.add.sprite(px, py, textureKey, 0);
            sprite.setScale(KENMI_SCALE);
            sprite.setDepth(py);
            if (this.scene.anims.exists(animKey)) {
              sprite.play(animKey);
            }
            // Random facing direction
            if (tileHash(tx, ty, ANIMAL_SEED + 34) > 0.5) {
              sprite.setFlipX(true);
            }

            this.animalSprites.push(sprite);
            occupiedSet.add(`${tx},${ty}`);
            placed = true;
          }
        }
      }
    }
  }

  /**
   * Create Phaser animations for ambient animals (run once per scene).
   * Camels: frames 0-3 at 4fps, Vultures: frames 0-5 at 6fps, Scarabs: frames 0-3 at 4fps.
   */
  _createAnimalAnimations() {
    const scene = this.scene;

    // Camel idle animations (3 variants)
    const camelVariants = [
      { texture: 'kenmi-desert-animals-camel-camel-1', anim: 'camel-idle-1' },
      { texture: 'kenmi-desert-animals-camel-camel-2', anim: 'camel-idle-2' },
      { texture: 'kenmi-desert-animals-camel-camel-3', anim: 'camel-idle-3' },
    ];
    for (const { texture, anim } of camelVariants) {
      if (!scene.anims.exists(anim) && scene.textures.exists(texture)) {
        scene.anims.create({
          key: anim,
          frames: scene.anims.generateFrameNumbers(texture, { frames: [0, 1, 2, 3] }),
          frameRate: 4,
          repeat: -1,
        });
      }
    }

    // Vulture flying animations (4 variants)
    const vultureVariants = [
      { texture: 'kenmi-desert-animals-vulture-vulture-1', anim: 'vulture-fly-1' },
      { texture: 'kenmi-desert-animals-vulture-vulture-2', anim: 'vulture-fly-2' },
      { texture: 'kenmi-desert-animals-vulture-vulture-3', anim: 'vulture-fly-3' },
      { texture: 'kenmi-desert-animals-vulture-vulture-4', anim: 'vulture-fly-4' },
    ];
    for (const { texture, anim } of vultureVariants) {
      if (!scene.anims.exists(anim) && scene.textures.exists(texture)) {
        scene.anims.create({
          key: anim,
          frames: scene.anims.generateFrameNumbers(texture, { frames: [0, 1, 2, 3, 4, 5] }),
          frameRate: 6,
          repeat: -1,
        });
      }
    }

    // Scarab crawl animations (4 color variants)
    const scarabVariants = [
      { texture: 'kenmi-desert-animals-scarab-scarab-black', anim: 'scarab-crawl-black' },
      { texture: 'kenmi-desert-animals-scarab-scarab-brown', anim: 'scarab-crawl-brown' },
      { texture: 'kenmi-desert-animals-scarab-scarab-green', anim: 'scarab-crawl-green' },
      { texture: 'kenmi-desert-animals-scarab-scarab-yellow', anim: 'scarab-crawl-yellow' },
    ];
    for (const { texture, anim } of scarabVariants) {
      if (!scene.anims.exists(anim) && scene.textures.exists(texture)) {
        scene.anims.create({
          key: anim,
          frames: scene.anims.generateFrameNumbers(texture, { frames: [0, 1, 2, 3] }),
          frameRate: 4,
          repeat: -1,
        });
      }
    }
  }

  // ================================================================
  // Helpers
  // ================================================================

  /**
   * Build a set of edge:tile keys where exits exist (to leave gaps in border walls)
   */
  buildExitEdgeSet(exits, _mapW, _mapH) {
    const set = new Set();
    for (const exit of exits) {
      const [start, end] = exit.tileRange;
      for (let t = start; t <= end; t++) {
        set.add(`${exit.edge}:${t}`);
      }
    }
    return set;
  }

  /**
   * Add an invisible wall to the collision group
   */
  addInvisibleWall(x, y, w, h) {
    const wall = this.wallGroup.create(x, y, null);
    wall.setVisible(false);
    wall.body.setSize(w, h);
    wall.refreshBody();
  }

  /**
   * Get ground sprites for cleanup
   */
  getGroundSprites() {
    return this.groundSprites;
  }

  /**
   * Get object sprites for cleanup
   */
  getObjectSprites() {
    return this.objectSprites;
  }

  /**
   * Get exit triggers for zone transition checking
   */
  getExitTriggers() {
    return this.exitTriggers;
  }

  /**
   * Destroy all map elements
   */
  destroy() {
    this.activeTweens.forEach((t) => { if (t) t.remove(); });
    this.activeTweens = [];

    this.groundSprites.forEach((s) => s.destroy());
    this.groundSprites = [];

    this.objectSprites.forEach((s) => s.destroy());
    this.objectSprites = [];

    this.decoSprites.forEach((s) => s.destroy());
    this.decoSprites = [];

    this.animalSprites.forEach((s) => s.destroy());
    this.animalSprites = [];

    this.exitTriggers.forEach((et) => {
      if (et.sprite) et.sprite.destroy();
      if (et.label) et.label.destroy();
    });
    this.exitTriggers = [];

    if (this.wallGroup) {
      this.wallGroup.clear(true, true);
      this.wallGroup = null;
    }
  }
}
