import { TILE, SAND, GRASS, WATER, ICE_GRASS, STONE, WOOD } from '../../data/zones.js';

/**
 * Desert tileset frame map (32x32 tiles in 624x448 spritesheet = 19 cols x 14 rows)
 * Row 0-1: Grass auto-tile transitions
 * Row 2-3: Sand/dirt auto-tile transitions
 * Row 4-5: Water auto-tile transitions
 * Row 6-7: Decoration objects
 *
 * For simplified auto-tiling, we pick key frames:
 */
const COLS = 19; // 624 / 32 = 19.5, floor to 19

// Solid fill frames (center of auto-tile blocks)
const FRAME = {
  // Grass solid fills (row 0, various positions)
  GRASS_SOLID: 0 * COLS + 0,        // top-left of grass block = solid grass
  GRASS_VAR1: 0 * COLS + 6,         // grass variation
  GRASS_VAR2: 0 * COLS + 7,         // grass variation with detail

  // Sand solid fills (row 2)
  SAND_SOLID: 2 * COLS + 0,         // solid sand
  SAND_VAR1: 2 * COLS + 6,          // sand variation
  SAND_VAR2: 2 * COLS + 7,          // sand variation with detail

  // Water solid fills (row 4)
  WATER_SOLID: 4 * COLS + 0,        // solid water
  WATER_VAR1: 4 * COLS + 1,         // water variation

  // Grass-to-sand transition edges (row 0-1, cols 8-12)
  GRASS_EDGE_N: 0 * COLS + 9,       // grass with sand on north
  GRASS_EDGE_S: 1 * COLS + 9,       // grass with sand on south
  GRASS_EDGE_W: 0 * COLS + 8,       // grass with sand on west
  GRASS_EDGE_E: 0 * COLS + 10,      // grass with sand on east
  GRASS_CORNER_NW: 0 * COLS + 8,    // grass corner
  GRASS_CORNER_NE: 0 * COLS + 10,   // grass corner
  GRASS_CORNER_SW: 1 * COLS + 8,    // grass corner
  GRASS_CORNER_SE: 1 * COLS + 10,   // grass corner

  // Water-to-sand transition edges (row 4-5, cols 0-5)
  WATER_EDGE_N: 4 * COLS + 1,
  WATER_EDGE_S: 5 * COLS + 1,
  WATER_EDGE_W: 4 * COLS + 0,
  WATER_EDGE_E: 4 * COLS + 2,

  // Decorations (row 6-7)
  DECO_FOOTPRINTS: 6 * COLS + 0,
  DECO_ROCK_SM: 6 * COLS + 1,
  DECO_CACTUS_SM: 6 * COLS + 2,
  DECO_CACTUS_MD: 6 * COLS + 3,
  DECO_SKULL: 6 * COLS + 4,
  DECO_BARREL: 6 * COLS + 5,
};

// Sand variation frames for visual variety
const SAND_FRAMES = [FRAME.SAND_SOLID, FRAME.SAND_VAR1, FRAME.SAND_VAR2];
const GRASS_FRAMES = [FRAME.GRASS_SOLID, FRAME.GRASS_VAR1, FRAME.GRASS_VAR2];

/**
 * MapLoader
 * Handles tilemap loading, rendering, collision setup, and visual effects
 */
export class MapLoader {
  constructor(scene) {
    this.scene = scene;
    this.groundSprites = [];
    this.objectSprites = [];
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

    // Create exit triggers (signposts at zone edges)
    this.createExitTriggers(exits, mapWidth, mapHeight);

    return this.wallGroup;
  }

  /**
   * Render ground tiles using Desert tileset with auto-tile transitions
   */
  renderGroundTiles(groundData, mapW, mapH) {
    const hasDesertTiles = this.scene.textures.exists('desert-tiles');

    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        const px = x * TILE + TILE / 2;
        const py = y * TILE + TILE / 2;
        const tileType = groundData[y][x];

        let sprite;

        if (hasDesertTiles) {
          const frame = this._pickTileFrame(groundData, x, y, mapW, mapH, tileType);
          sprite = this.scene.add.image(px, py, 'desert-tiles', frame);
          // Scale 32x32 tile to fill 64x64 cell
          sprite.setScale(2);
        } else {
          // Fallback to old single-color tiles
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
        }

        sprite.setDepth(0);
        this.groundSprites.push(sprite);
      }
    }

    // Scatter decorative clutter on sand tiles (cacti, rocks, footprints)
    if (hasDesertTiles) {
      this._scatterDecorations(groundData, mapW, mapH);
    }
  }

  /**
   * Pick the correct tileset frame based on terrain type and neighbors.
   * Simple 4-neighbor edge detection for transitions.
   */
  _pickTileFrame(groundData, x, y, mapW, mapH, tileType) {
    // Helper to get neighbor type (out of bounds = same as current)
    const get = (nx, ny) => {
      if (nx < 0 || nx >= mapW || ny < 0 || ny >= mapH) return tileType;
      return groundData[ny][nx];
    };

    const n = get(x, y - 1);
    const s = get(x, y + 1);
    const w = get(x - 1, y);
    const e = get(x + 1, y);

    // Seeded pseudo-random for consistent tile variation
    const hash = ((x * 73856093) ^ (y * 19349663)) >>> 0;

    if (tileType === WATER) {
      // Water with edge detection
      const nIsSand = n !== WATER;
      const sIsSand = s !== WATER;
      const wIsSand = w !== WATER;
      const eIsSand = e !== WATER;

      if (nIsSand && wIsSand) return FRAME.WATER_EDGE_N;
      if (nIsSand && eIsSand) return FRAME.WATER_EDGE_N + 2;
      if (sIsSand && wIsSand) return FRAME.WATER_EDGE_S;
      if (sIsSand && eIsSand) return FRAME.WATER_EDGE_S + 2;
      if (nIsSand) return FRAME.WATER_EDGE_N;
      if (sIsSand) return FRAME.WATER_EDGE_S;
      if (wIsSand) return FRAME.WATER_EDGE_W;
      if (eIsSand) return FRAME.WATER_EDGE_E;
      return FRAME.WATER_SOLID;
    }

    if (tileType === GRASS) {
      // Grass with edge detection against sand
      const nIsSand = n !== GRASS && n !== WATER;
      const sIsSand = s !== GRASS && s !== WATER;
      const wIsSand = w !== GRASS && w !== WATER;
      const eIsSand = e !== GRASS && e !== WATER;

      if (nIsSand && wIsSand) return FRAME.GRASS_CORNER_NW;
      if (nIsSand && eIsSand) return FRAME.GRASS_CORNER_NE;
      if (sIsSand && wIsSand) return FRAME.GRASS_CORNER_SW;
      if (sIsSand && eIsSand) return FRAME.GRASS_CORNER_SE;
      if (nIsSand) return FRAME.GRASS_EDGE_N;
      if (sIsSand) return FRAME.GRASS_EDGE_S;
      if (wIsSand) return FRAME.GRASS_EDGE_W;
      if (eIsSand) return FRAME.GRASS_EDGE_E;
      return GRASS_FRAMES[hash % GRASS_FRAMES.length];
    }

    if (tileType === ICE_GRASS) {
      // Use grass frames with slight tint
      return GRASS_FRAMES[hash % GRASS_FRAMES.length];
    }

    // Default: sand with variation
    return SAND_FRAMES[hash % SAND_FRAMES.length];
  }

  /**
   * Scatter decorative objects (cacti, rocks, footprints) on sand tiles
   * Adds visual variety to break up flat terrain
   */
  _scatterDecorations(groundData, mapW, mapH) {
    const decoFrames = [
      FRAME.DECO_FOOTPRINTS,
      FRAME.DECO_ROCK_SM,
      FRAME.DECO_CACTUS_SM,
      FRAME.DECO_CACTUS_MD,
    ];

    for (let y = 2; y < mapH - 2; y++) {
      for (let x = 2; x < mapW - 2; x++) {
        if (groundData[y][x] !== SAND) continue;

        // ~8% chance to place a decoration on sand
        const hash = ((x * 48271) ^ (y * 65537)) >>> 0;
        if (hash % 100 >= 8) continue;

        // Don't place next to non-sand (keep edges clean)
        const n = groundData[y - 1]?.[x];
        const s = groundData[y + 1]?.[x];
        if (n !== SAND || s !== SAND) continue;

        const px = x * TILE + TILE / 2;
        const py = y * TILE + TILE / 2;
        const frame = decoFrames[hash % decoFrames.length];
        const deco = this.scene.add.image(px, py, 'desert-tiles', frame);
        deco.setScale(2);
        deco.setDepth(1);
        deco.setAlpha(0.7 + (hash % 30) / 100); // Slight alpha variation
        this.groundSprites.push(deco);
      }
    }
  }

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

  /**
   * Place world objects (trees, buildings, etc.) with Y-sorting
   */
  placeObjects(objects) {
    const sortedObjects = [...objects].sort((a, b) => a.y - b.y);
    sortedObjects.forEach((obj) => {
      const px = obj.x * TILE + TILE / 2;
      const py = obj.y * TILE + TILE / 2;
      const sprite = this.scene.add.image(px, py, obj.key);
      // Origin at bottom-center for proper Y-sort overlap illusion
      sprite.setOrigin(0.5, 1.0);
      // Depth = Y position so player walks behind/in front correctly
      sprite.setDepth(py);
      this.objectSprites.push(sprite);

      if (obj.collide) {
        // Collision body at bottom third of sprite for overlap illusion
        const bodyH = Math.min(obj.collideH || 20, 24);
        const collider = this.wallGroup.create(px, py, null);
        collider.setVisible(false);
        collider.body.setSize(obj.collideW || 40, bodyH);
        collider.body.setOffset(-(obj.collideW || 40) / 2, -bodyH);
        collider.refreshBody();
      }
    });
  }

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
