import Phaser from 'phaser';
import { EventBus } from '../../utils/eventBus.js';
import DOMOverlayManager from '../systems/DOMOverlay.js';
import ZoneTransition from '../systems/ZoneTransition.js';
import { PlayerController } from '../systems/PlayerController.js';
import { NPCManager } from '../systems/NPCManager.js';
import { InteractableManager } from '../systems/InteractableManager.js';
import { MapLoader } from '../systems/MapLoader.js';
import { ZONES, TILE } from '../../data/zones.js';

// ============================================================
// WORLD SCENE
// Main scene orchestrator — delegates to subsystems
// ============================================================
export class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
    this.frozen = false;
    this.interactCooldown = false;
    this.currentZone = 'oasis_village';
    this.currentMapW = 40;
    this.currentMapH = 30;

    // Subsystems
    this.domOverlay = null;
    this.zoneTransition = null;
    this.playerController = null;
    this.npcManager = null;
    this.interactableManager = null;
    this.mapLoader = null;

    // Input
    this.interactKey = null;
  }

  create() {
    // Initialize subsystems
    this.domOverlay = new DOMOverlayManager(this);
    this.domOverlay.init();
    this.zoneTransition = new ZoneTransition(this);
    this.playerController = new PlayerController(this);
    this.npcManager = new NPCManager(this);
    this.interactableManager = new InteractableManager(this);
    this.mapLoader = new MapLoader(this);

    // Load the default zone
    const zone = ZONES.oasis_village;
    this.buildZone('oasis_village', zone.spawnPoint.x * TILE, zone.spawnPoint.y * TILE);

    // Camera setup
    const mapPixelW = this.currentMapW * TILE;
    const mapPixelH = this.currentMapH * TILE;
    this.cameras.main.startFollow(this.playerController.getPlayer(), true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, mapPixelW, mapPixelH);
    this.cameras.main.setBackgroundColor('#1A1A2E');

    // EventBus listeners
    EventBus.on('freeze-player', this.handleFreeze, this);
    EventBus.on('unfreeze-player', this.handleUnfreeze, this);

    // Input: SPACE for interaction
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
    this.cameras.main.startFollow(this.playerController.getPlayer(), true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, mapPixelW, mapPixelH);
  }

  // Tear down current zone contents
  clearZone() {
    // Reset DOM overlays
    if (this.domOverlay) {
      this.domOverlay.destroy();
      this.domOverlay = new DOMOverlayManager(this);
      this.domOverlay.init();
    }

    // Destroy subsystems
    this.mapLoader.destroy();
    this.npcManager.destroy();
    this.interactableManager.destroy();
    this.playerController.destroy();
  }

  // Build a zone by name (data-driven from zones.js)
  buildZone(zoneName, spawnX, spawnY) {
    this.currentZone = zoneName;

    const zone = ZONES[zoneName];
    if (!zone) {
      console.error(`Unknown zone: ${zoneName}`);
      return;
    }

    this.currentMapW = zone.mapWidth;
    this.currentMapH = zone.mapHeight;

    // Build map (ground, objects, collision, exits)
    const wallGroup = this.mapLoader.create(zone, zone.mapWidth, zone.mapHeight);

    // Spawn player
    const player = this.playerController.create(spawnX, spawnY, wallGroup);

    // Spawn NPCs
    this.npcManager.create(zone.npcs, player, wallGroup, this.domOverlay);

    // Spawn interactables
    this.interactableManager.create(zone.interactables, this.mapLoader.getObjectSprites());
  }

  // ============================================================
  // HELPERS
  // ============================================================

  handleFreeze() {
    this.frozen = true;
    this.playerController.freeze();
  }

  handleUnfreeze() {
    this.frozen = false;
    this.playerController.unfreeze();
  }

  setInteractCooldown(value) {
    this.interactCooldown = value;
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
    this.playerController.update();

    // Y-sort all sprites for depth ordering
    const player = this.playerController.getPlayer();
    const npcs = this.npcManager.getNPCs();
    const allSprites = [player, ...npcs].filter(Boolean);
    allSprites.forEach((s) => {
      s.setDepth(s.y);
    });

    // Emit player position for HUD compass (throttled: every 6 frames ~10Hz at 60fps)
    this._frameCount = (this._frameCount || 0) + 1;
    if (this._frameCount % 6 === 0) {
      EventBus.emit('player-position-update', { x: player.x, y: player.y });
    }

    // Check NPC interaction zones
    this.npcManager.update(
      player,
      this.domOverlay,
      this.interactKey,
      this.interactCooldown,
      this.setInteractCooldown.bind(this)
    );

    // Check interactive object zones
    this.interactableManager.update(
      player,
      this.interactKey,
      this.interactCooldown,
      this.setInteractCooldown.bind(this)
    );

    // Check exit trigger zones
    this.checkExitTriggers();

    // Update DOM overlay positions every frame
    if (this.domOverlay) this.domOverlay.update();
  }

  // Check if player has walked into an exit trigger region
  checkExitTriggers() {
    const player = this.playerController.getPlayer();
    if (!player || this.zoneTransition.transitioning) return;

    const px = player.x;
    const py = player.y;
    const tileX = Math.floor(px / TILE);
    const tileY = Math.floor(py / TILE);

    const exitTriggers = this.mapLoader.getExitTriggers();

    for (const exit of exitTriggers) {
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
