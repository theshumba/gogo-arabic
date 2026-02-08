import Phaser from 'phaser';
import { TILE, GRASS, WATER, ICE_GRASS } from '../../data/zones.js';

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
   * Render ground tiles (sand, grass, water, ice)
   */
  renderGroundTiles(groundData, mapW, mapH) {
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
      const sprite = this.scene.add.image(px, py, obj.key).setOrigin(0.5, 0.8);
      this.objectSprites.push(sprite);

      if (obj.collide) {
        const collider = this.wallGroup.create(px, py + 20, null);
        collider.setVisible(false);
        collider.body.setSize(obj.collideW || 40, obj.collideH || 20);
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
  buildExitEdgeSet(exits, mapW, mapH) {
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
