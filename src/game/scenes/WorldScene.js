import Phaser from 'phaser';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';
import DOMOverlayManager from '../systems/DOMOverlay.js';
import ZoneTransition from '../systems/ZoneTransition.js';
import { PlayerController } from '../systems/PlayerController.js';
import { NPCManager } from '../systems/NPCManager.js';
import { InteractableManager } from '../systems/InteractableManager.js';
import { MapLoader } from '../systems/MapLoader.js';
import ScreenShake from '../systems/ScreenShake.js';
import ParticleEffectManager from '../systems/ParticleEffectManager.js';
import { SceneStackManager } from '../systems/SceneStackManager.js';
import { DialogueEngine } from '../systems/DialogueEngine.js';
import { EquipmentManager } from '../systems/equipment/EquipmentManager.js';
import { CompanionManager } from '../systems/companions/CompanionManager.js';
import { GatheringSpotManager } from '../systems/GatheringSpotManager.js';
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
    this.pendingSpawnPosition = null;

    // Subsystems
    this.domOverlay = null;
    this.zoneTransition = null;
    this.playerController = null;
    this.npcManager = null;
    this.interactableManager = null;
    this.mapLoader = null;
    this.screenShake = null;
    this.particleEffects = null;
    this.sceneStackManager = null;
    this.dialogueEngine = null;
    this.equipmentManager = null;
    this.companionManager = null;
    this.gatheringSpotManager = null;

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
    this.screenShake = new ScreenShake(this);
    this.particleEffects = new ParticleEffectManager(this);
    this.sceneStackManager = new SceneStackManager(this);
    this.dialogueEngine = new DialogueEngine(this);

    // Companion system — must be after PlayerController is created
    this.companionManager = new CompanionManager(this);

    // Load the default zone
    const zone = ZONES.oasis_village;
    this.buildZone('oasis_village', zone.spawnPoint.x * TILE, zone.spawnPoint.y * TILE);

    // Camera setup (delegated to PlayerController for encapsulation)
    this.playerController.setupCamera(this.currentMapW * TILE, this.currentMapH * TILE);

    // EventBus listeners
    EventBus.on(EVENTS.PLAYER_FREEZE, this.handleFreeze, this);
    EventBus.on(EVENTS.PLAYER_UNFREEZE, this.handleUnfreeze, this);
    EventBus.on(EVENTS.VFX_SHAKE, this.handleVfxShake, this);
    EventBus.on(EVENTS.VFX_PARTICLES_BURST, this.handleVfxBurst, this);
    EventBus.on(EVENTS.VFX_PARTICLES_CONTINUOUS, this.handleVfxContinuous, this);
    EventBus.on(EVENTS.DOOR_OPENED, this.handleDoorOpened, this);

    // Input: SPACE for interaction
    this.interactKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // Restore player position when resuming from InteriorScene
    this.events.on('resume', () => {
      if (this.pendingSpawnPosition) {
        const player = this.playerController.getPlayer();
        if (player) {
          player.setPosition(this.pendingSpawnPosition.x, this.pendingSpawnPosition.y);
        }
        this.pendingSpawnPosition = null;
      }
    });

    EventBus.emit(EVENTS.SCENE_READY, this);
  }

  // ============================================================
  // ZONE LOADING
  // ============================================================

  // Called by ZoneTransition to swap zones
  loadZone(zoneName, entryX, entryY) {
    // Guard: don't load if scene is shutting down
    if (!this.scene || !this.scene.isActive()) return;

    this.clearZone();
    this.buildZone(zoneName, entryX, entryY);

    // Update camera for new zone dimensions
    this.playerController.setupCamera(this.currentMapW * TILE, this.currentMapH * TILE);
  }

  // Tear down current zone contents
  clearZone() {
    // Reset DOM overlays
    if (this.domOverlay) {
      this.domOverlay.destroy();
      this.domOverlay = new DOMOverlayManager(this);
      this.domOverlay.init();
    }

    // Destroy equipment manager before player controller
    if (this.equipmentManager) {
      this.equipmentManager.destroy();
      this.equipmentManager = null;
    }

    // Destroy gathering spot manager before zone swap
    if (this.gatheringSpotManager) {
      this.gatheringSpotManager.destroy();
      this.gatheringSpotManager = null;
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

    // Create equipment manager to render equipment sprites on player
    this.equipmentManager = new EquipmentManager(this, player);

    // Spawn NPCs
    this.npcManager.create(zone.npcs, player, wallGroup, this.domOverlay);

    // Spawn interactables
    this.interactableManager.create(zone.interactables, this.mapLoader.getObjectSprites());

    // Initialize gathering spots if zone supports crafting
    if (zone.gatheringSpots) {
      this.gatheringSpotManager = new GatheringSpotManager(this);
      this.gatheringSpotManager.create(zoneName);
    }
  }

  // ============================================================
  // VFX HANDLERS
  // ============================================================

  handleVfxShake({ intensity }) {
    if (this.screenShake) this.screenShake.shake(intensity);
  }

  handleVfxBurst({ x, y, config } = {}) {
    if (!this.particleEffects) return;
    const px = x ?? this.cameras.main.midPoint.x;
    const py = y ?? this.cameras.main.midPoint.y;
    this.particleEffects.burst(px, py, config || {});
  }

  handleVfxContinuous({ x, y, config } = {}) {
    if (!this.particleEffects) return;
    const px = x ?? this.cameras.main.midPoint.x;
    const py = y ?? this.cameras.main.midPoint.y;
    this.particleEffects.continuous(px, py, config || {});
  }

  // ============================================================
  // BUILDING ENTRY
  // ============================================================

  async handleDoorOpened({ id: _id, interiorId, entryPosition }) {
    if (!interiorId) return; // Legacy door without interior
    try {
      const { audioManager } = await import('../../services/audio.js');
      const { INTERIOR_BGM } = await import('../../data/audioConfig.js');
      const bgmTrack = INTERIOR_BGM[interiorId] || INTERIOR_BGM.default || 'interior';
      audioManager.playBGM(bgmTrack);
    } catch (_e) { /* audio not critical */ }
    this.sceneStackManager.pushScene('InteriorScene', { interiorId, entryPosition });
    EventBus.emit(EVENTS.BUILDING_ENTERED, { interiorId });
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

    // Update equipment sprites to follow player
    if (this.equipmentManager) this.equipmentManager.update();

    // Update companion system
    if (this.companionManager) {
      this.companionManager.update(this.time.now, this.game.loop.delta);
    }

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
      EventBus.emit(EVENTS.PLAYER_POSITION_UPDATE, { x: player.x, y: player.y });
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

    // Update gathering spots
    if (this.gatheringSpotManager) {
      this.gatheringSpotManager.update(
        player,
        this.interactKey,
        this.interactCooldown,
        this.setInteractCooldown.bind(this)
      );
    }

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
        EventBus.emit(EVENTS.ZONE_CHECK_UNLOCK, {
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
    if (this.companionManager) {
      this.companionManager.destroy();
      this.companionManager = null;
    }

    if (this.equipmentManager) {
      this.equipmentManager.destroy();
      this.equipmentManager = null;
    }

    if (this.gatheringSpotManager) {
      this.gatheringSpotManager.destroy();
      this.gatheringSpotManager = null;
    }

    if (this.dialogueEngine) {
      this.dialogueEngine.destroy();
      this.dialogueEngine = null;
    }

    if (this.sceneStackManager) {
      this.sceneStackManager.destroy();
      this.sceneStackManager = null;
    }

    // Reset zone transition to prevent stuck state on scene restart
    if (this.zoneTransition) {
      this.zoneTransition.transitioning = false;
    }

    EventBus.off(EVENTS.PLAYER_FREEZE, this.handleFreeze, this);
    EventBus.off(EVENTS.PLAYER_UNFREEZE, this.handleUnfreeze, this);
    EventBus.off(EVENTS.VFX_SHAKE, this.handleVfxShake, this);
    EventBus.off(EVENTS.VFX_PARTICLES_BURST, this.handleVfxBurst, this);
    EventBus.off(EVENTS.VFX_PARTICLES_CONTINUOUS, this.handleVfxContinuous, this);
    EventBus.off(EVENTS.DOOR_OPENED, this.handleDoorOpened, this);

    if (this.particleEffects) {
      this.particleEffects.destroy();
      this.particleEffects = null;
    }

    if (this.domOverlay) {
      this.domOverlay.destroy();
      this.domOverlay = null;
    }
  }
}
