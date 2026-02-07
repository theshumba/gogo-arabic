import Phaser from 'phaser';
import { EventBus } from '../EventBus.js';
import { Player } from '../sprites/Player.js';
import { NPC } from '../sprites/NPC.js';
import DOMOverlayManager from '../systems/DOMOverlay.js';
import ZoneTransition from '../systems/ZoneTransition.js';
import { ZONES, TILE, SAND, GRASS, WATER, ICE_GRASS } from '../../data/zones.js';

// NPC proximity threshold: 2 tiles = 128px
const INTERACT_RANGE = TILE * 2;

// ============================================================
// WORLD SCENE
// ============================================================
export class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
    this.player = null;
    this.npcs = [];
    this.interactables = [];
    this.exitTriggers = [];
    this.openedChests = new Set();
    this.readBooks = new Set();
    this.frozen = false;
    this.interactCooldown = false;
    this.domOverlay = null;
    this.zoneTransition = null;
    this.currentZone = 'oasis_village';
    this.currentMapW = 40;
    this.currentMapH = 30;
    this.groundSprites = [];
    this.objectSprites = [];
    this.wallGroup = null;
  }

  create() {
    // Initialize systems
    this.domOverlay = new DOMOverlayManager(this);
    this.domOverlay.init();
    this.zoneTransition = new ZoneTransition(this);

    // Load the default zone
    const zone = ZONES.oasis_village;
    this.buildZone('oasis_village', zone.spawnPoint.x * TILE, zone.spawnPoint.y * TILE);

    // --- Camera setup ---
    const mapPixelW = this.currentMapW * TILE;
    const mapPixelH = this.currentMapH * TILE;
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, mapPixelW, mapPixelH);
    this.cameras.main.setBackgroundColor('#1A1A2E');

    // --- EventBus listeners ---
    EventBus.on('freeze-player', this.handleFreeze, this);
    EventBus.on('unfreeze-player', this.handleUnfreeze, this);

    // --- Input: SPACE for interaction ---
    this.interactKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    EventBus.emit('scene-ready', this);
  }

  // ============================================================
  // ZONE LOADING
  // ============================================================

  // Called by ZoneTransition to swap zones
  loadZone(zoneName, entryX, entryY) {
    this.clearZone();
    this.buildZone(zoneName, entryX, entryY);

    // Update camera bounds for new zone dimensions
    const mapPixelW = this.currentMapW * TILE;
    const mapPixelH = this.currentMapH * TILE;
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, mapPixelW, mapPixelH);
  }

  // Tear down current zone contents
  clearZone() {
    // Remove DOM overlays
    if (this.domOverlay) {
      this.domOverlay.destroy();
      this.domOverlay = new DOMOverlayManager(this);
      this.domOverlay.init();
    }

    // Destroy ground tiles
    this.groundSprites.forEach((s) => s.destroy());
    this.groundSprites = [];

    // Destroy object sprites
    this.objectSprites.forEach((s) => s.destroy());
    this.objectSprites = [];

    // Destroy NPCs
    this.npcs.forEach((npc) => {
      if (npc.hintText) npc.hintText.destroy();
      if (npc.nameLabel) npc.nameLabel.destroy();
      npc.destroy();
    });
    this.npcs = [];

    // Destroy interactables
    this.interactables.forEach((obj) => {
      if (obj.sprite) obj.sprite.destroy();
      if (obj.label) obj.label.destroy();
      if (obj.hintText) obj.hintText.destroy();
    });
    this.interactables = [];

    // Destroy exit trigger sprites
    this.exitTriggers.forEach((et) => {
      if (et.sprite) et.sprite.destroy();
      if (et.label) et.label.destroy();
    });
    this.exitTriggers = [];

    // Destroy collision group
    if (this.wallGroup) {
      this.wallGroup.clear(true, true);
    }

    // Destroy player
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
  }

  // Build a zone by name (data-driven from zones.js)
  buildZone(zoneName, spawnX, spawnY) {
    this.currentZone = zoneName;

    const zone = ZONES[zoneName];
    if (!zone) {
      console.error(`Unknown zone: ${zoneName}`);
      return;
    }

    const MAP_W = zone.mapWidth;
    const MAP_H = zone.mapHeight;
    this.currentMapW = MAP_W;
    this.currentMapH = MAP_H;

    const groundData = zone.buildMap();
    const objects = zone.objects;
    const npcConfigs = zone.npcs;
    const interactableConfigs = zone.interactables;
    const exits = zone.exits || [];

    const mapPixelW = MAP_W * TILE;
    const mapPixelH = MAP_H * TILE;

    // --- Render ground tiles ---
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const px = x * TILE + TILE / 2;
        const py = y * TILE + TILE / 2;
        const tileType = groundData[y][x];

        let sprite;
        if (tileType === GRASS) {
          sprite = this.add.image(px, py, 'tile-grass');
        } else if (tileType === WATER) {
          sprite = this.add.image(px, py, 'tile-sand');
          sprite.setTint(0x50b0d8);
        } else if (tileType === ICE_GRASS) {
          sprite = this.add.image(px, py, 'grass-ice');
        } else {
          sprite = this.add.image(px, py, 'tile-sand');
        }
        this.groundSprites.push(sprite);
      }
    }

    // --- Water edge shimmer effect ---
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
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
            ax < MAP_W &&
            ay >= 0 &&
            ay < MAP_H &&
            groundData[ay][ax] !== WATER
          ) {
            const px = x * TILE + TILE / 2;
            const py = y * TILE + TILE / 2;
            const edge = this.add.rectangle(px, py, TILE, TILE, 0x66d7ee, 0.3);
            this.tweens.add({
              targets: edge,
              alpha: { from: 0.15, to: 0.35 },
              duration: 1500,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut',
            });
            this.groundSprites.push(edge);
            break;
          }
        }
      }
    }

    // --- Collision group ---
    this.wallGroup = this.physics.add.staticGroup();

    // World border walls (invisible) — skip tiles that have exits
    const exitEdgeTiles = this.buildExitEdgeSet(exits, MAP_W, MAP_H);

    for (let x = -1; x <= MAP_W; x++) {
      if (!exitEdgeTiles.has(`north:${x}`)) {
        this.addInvisibleWall(x * TILE + TILE / 2, -TILE / 2, TILE, TILE);
      }
      if (!exitEdgeTiles.has(`south:${x}`)) {
        this.addInvisibleWall(x * TILE + TILE / 2, mapPixelH + TILE / 2, TILE, TILE);
      }
    }
    for (let y = 0; y < MAP_H; y++) {
      if (!exitEdgeTiles.has(`west:${y}`)) {
        this.addInvisibleWall(-TILE / 2, y * TILE + TILE / 2, TILE, TILE);
      }
      if (!exitEdgeTiles.has(`east:${y}`)) {
        this.addInvisibleWall(mapPixelW + TILE / 2, y * TILE + TILE / 2, TILE, TILE);
      }
    }

    // Water collision
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
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

    // --- Place world objects (Y-sorted for depth) ---
    const sortedObjects = [...objects].sort((a, b) => a.y - b.y);
    sortedObjects.forEach((obj) => {
      const px = obj.x * TILE + TILE / 2;
      const py = obj.y * TILE + TILE / 2;
      const sprite = this.add.image(px, py, obj.key).setOrigin(0.5, 0.8);
      this.objectSprites.push(sprite);

      if (obj.collide) {
        const collider = this.wallGroup.create(px, py + 20, null);
        collider.setVisible(false);
        collider.body.setSize(obj.collideW || 40, obj.collideH || 20);
        collider.refreshBody();
      }
    });

    // --- Player ---
    this.player = new Player(this, spawnX, spawnY);
    this.physics.add.collider(this.player, this.wallGroup);
    this.physics.world.setBounds(0, 0, mapPixelW, mapPixelH);
    this.player.setCollideWorldBounds(true);

    // --- NPCs ---
    npcConfigs.forEach((cfg) => {
      const npcX = cfg.x * TILE;
      const npcY = cfg.y * TILE;

      const npc = new NPC(this, npcX, npcY, {
        id: cfg.id,
        key: cfg.key,
        name: cfg.name,
      });
      this.npcs.push(npc);
      this.physics.add.collider(this.player, npc);

      // Create DOM overlay labels for this NPC
      this.domOverlay.createNpcLabel(
        cfg.id,
        npcX,
        npcY,
        cfg.nameArabic,
        cfg.name
      );

      // Create interaction prompt (starts hidden)
      this.domOverlay.createInteractionPrompt(cfg.id, npcX, npcY);
    });

    // --- Interactive Objects ---
    interactableConfigs.forEach((cfg) => {
      const px = cfg.x * TILE + TILE / 2;
      const py = cfg.y * TILE + TILE / 2;

      // Choose sprite based on type
      let spriteKey;
      if (cfg.type === 'sign') spriteKey = 'gate-pillar';
      else if (cfg.type === 'bookshelf') spriteKey = 'ruin-pillar';
      else if (cfg.type === 'chest') spriteKey = 'rock1';

      const sprite = this.add.image(px, py, spriteKey).setOrigin(0.5, 0.8);
      sprite.setScale(0.7);
      this.objectSprites.push(sprite);

      // Label above the object
      const labelText = cfg.type === 'sign' ? cfg.textArabic
        : cfg.type === 'bookshelf' ? 'Bookshelf'
        : 'Chest';
      const label = this.add.text(px, py - 50, labelText, {
        fontFamily: cfg.type === 'sign' ? "'Noto Naskh Arabic', serif" : "'Press Start 2P', monospace",
        fontSize: cfg.type === 'sign' ? '14px' : '7px',
        color: '#e2b659',
        stroke: '#2b292c',
        strokeThickness: 3,
        align: 'center',
      }).setOrigin(0.5).setDepth(9999);

      // Interaction hint (hidden by default)
      const hintText = this.add.text(px, py + 30, '[SPACE]', {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '7px',
        color: '#f4fefa',
        stroke: '#2b292c',
        strokeThickness: 2,
      }).setOrigin(0.5).setVisible(false).setDepth(9999);

      this.interactables.push({
        ...cfg,
        sprite,
        label,
        hintText,
        worldX: px,
        worldY: py,
      });
    });

    // --- Exit Triggers (signposts at zone edges) ---
    exits.forEach((exit) => {
      const { edge, tileRange, label, labelArabic } = exit;
      const midTile = Math.floor((tileRange[0] + tileRange[1]) / 2);

      let signX, signY;
      if (edge === 'north') {
        signX = midTile * TILE + TILE / 2;
        signY = TILE / 2;
      } else if (edge === 'south') {
        signX = midTile * TILE + TILE / 2;
        signY = (MAP_H - 1) * TILE + TILE / 2;
      } else if (edge === 'west') {
        signX = TILE / 2;
        signY = midTile * TILE + TILE / 2;
      } else {
        signX = (MAP_W - 1) * TILE + TILE / 2;
        signY = midTile * TILE + TILE / 2;
      }

      const signSprite = this.add.image(signX, signY, 'gate-pillar').setOrigin(0.5, 0.8).setDepth(9998);
      const signLabel = this.add.text(signX, signY - 50, `${labelArabic}\n${label}`, {
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

  // Build a set of edge:tile keys where exits exist (to leave gaps in border walls)
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

  // ============================================================
  // HELPERS
  // ============================================================

  addInvisibleWall(x, y, w, h) {
    const wall = this.wallGroup.create(x, y, null);
    wall.setVisible(false);
    wall.body.setSize(w, h);
    wall.refreshBody();
  }

  handleFreeze() {
    this.frozen = true;
    if (this.player) this.player.freeze();
  }

  handleUnfreeze() {
    this.frozen = false;
    if (this.player) this.player.unfreeze();
  }

  // ============================================================
  // FRAME UPDATE
  // ============================================================

  update() {
    if (this.frozen) {
      // Still update overlays so they track correctly while frozen
      if (this.domOverlay) this.domOverlay.update();
      return;
    }

    // Update player movement
    if (this.player) this.player.update();

    // Y-sort all sprites for depth ordering
    const allSprites = [this.player, ...this.npcs].filter(Boolean);
    allSprites.forEach((s) => {
      s.setDepth(s.y);
    });

    // Check NPC interaction zones
    this.npcs.forEach((npc) => {
      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        npc.x,
        npc.y
      );

      const inRange = dist < INTERACT_RANGE;

      // Show/hide the Phaser-rendered hint text on the NPC sprite
      npc.setInteractionHint(inRange);

      // Show/hide the DOM overlay SPACE prompt
      this.domOverlay.setVisible(`prompt-${npc.npcId}`, inRange);

      // Update DOM overlay positions to track NPC world position
      this.domOverlay.updatePosition(
        `npc-label-${npc.npcId}`,
        npc.x,
        npc.y
      );
      this.domOverlay.updatePosition(`prompt-${npc.npcId}`, npc.x, npc.y);

      // Handle SPACE key press for interaction
      if (
        inRange &&
        Phaser.Input.Keyboard.JustDown(this.interactKey) &&
        !this.interactCooldown
      ) {
        this.interactCooldown = true;
        this.time.delayedCall(500, () => {
          this.interactCooldown = false;
        });
        EventBus.emit('npc-interact', {
          npcId: npc.npcId,
          npcName: npc.npcName,
        });
        EventBus.emit('freeze-player');
      }
    });

    // Check interactive object zones
    let nearInteractable = false;
    this.interactables.forEach((obj) => {
      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        obj.worldX,
        obj.worldY
      );
      const inRange = dist < INTERACT_RANGE;
      obj.hintText.setVisible(inRange);

      if (
        inRange &&
        !nearInteractable &&
        Phaser.Input.Keyboard.JustDown(this.interactKey) &&
        !this.interactCooldown
      ) {
        nearInteractable = true;
        this.interactCooldown = true;
        this.time.delayedCall(500, () => {
          this.interactCooldown = false;
        });
        this.handleInteractable(obj);
      }
    });

    // Check exit trigger zones — player walks off map edge
    this.checkExitTriggers();

    // Update DOM overlay positions every frame
    if (this.domOverlay) this.domOverlay.update();
  }

  // Check if player has walked into an exit trigger region
  checkExitTriggers() {
    if (!this.player || this.zoneTransition.transitioning) return;

    const px = this.player.x;
    const py = this.player.y;
    const tileX = Math.floor(px / TILE);
    const tileY = Math.floor(py / TILE);

    for (const exit of this.exitTriggers) {
      const [start, end] = exit.tileRange;
      let triggered = false;

      if (exit.edge === 'north' && tileY <= 0 && tileX >= start && tileX <= end) {
        triggered = true;
      } else if (exit.edge === 'south' && tileY >= this.currentMapH - 1 && tileX >= start && tileX <= end) {
        triggered = true;
      } else if (exit.edge === 'west' && tileX <= 0 && tileY >= start && tileY <= end) {
        triggered = true;
      } else if (exit.edge === 'east' && tileX >= this.currentMapW - 1 && tileY >= start && tileY <= end) {
        triggered = true;
      }

      if (triggered) {
        // Calculate entry position in target zone
        const targetZone = ZONES[exit.targetZone];
        if (!targetZone) return;

        let entryX, entryY;
        const entry = targetZone.entries?.[exit.targetEntry];
        if (entry) {
          entryX = entry.x * TILE;
          entryY = entry.y * TILE;
        } else {
          entryX = targetZone.spawnPoint.x * TILE;
          entryY = targetZone.spawnPoint.y * TILE;
        }

        // Check unlock requirements via EventBus
        EventBus.emit('check-zone-unlock', {
          zoneName: exit.targetZone,
          entryX,
          entryY,
          unlock: targetZone.unlock,
        });
        return;
      }
    }
  }

  handleInteractable(obj) {
    if (obj.type === 'sign') {
      EventBus.emit('show-sign', {
        arabic: obj.textArabic,
        english: obj.textEnglish,
      });
      EventBus.emit('freeze-player');
    } else if (obj.type === 'bookshelf') {
      if (!this.readBooks.has(obj.id)) {
        this.readBooks.add(obj.id);
        EventBus.emit('bookshelf-interact', {
          category: obj.category,
          id: obj.id,
        });
        EventBus.emit('freeze-player');
      } else {
        EventBus.emit('bookshelf-interact', {
          category: obj.category,
          id: obj.id,
          reread: true,
        });
        EventBus.emit('freeze-player');
      }
    } else if (obj.type === 'chest') {
      if (!this.openedChests.has(obj.id)) {
        this.openedChests.add(obj.id);
        const amount = Math.floor(
          Math.random() * (obj.maxDirhams - obj.minDirhams + 1)
        ) + obj.minDirhams;
        EventBus.emit('chest-opened', { amount, id: obj.id });
        // Visual feedback: tint the chest to show it's opened
        if (obj.sprite) obj.sprite.setTint(0x666666);
      } else {
        EventBus.emit('chest-empty', { id: obj.id });
      }
    }
  }

  // ============================================================
  // CLEANUP
  // ============================================================

  shutdown() {
    EventBus.off('freeze-player', this.handleFreeze, this);
    EventBus.off('unfreeze-player', this.handleUnfreeze, this);

    if (this.domOverlay) {
      this.domOverlay.destroy();
      this.domOverlay = null;
    }
  }
}
