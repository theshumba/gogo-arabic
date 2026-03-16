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
import { store } from '../../store/store.js';
import { GatheringSpotManager } from '../systems/GatheringSpotManager.js';
import { ZONES, TILE } from '../../data/zones.js';
import { TimeSystem } from '../systems/TimeSystem.js';
import { WeatherSystem } from '../systems/WeatherSystem.js';
import { DayNightCycle } from '../systems/DayNightCycle.js';
import { WorldStateManager } from '../systems/WorldStateManager.js';
import { PuzzleManager } from '../systems/PuzzleManager.js';
import { FastTravelManager } from '../systems/FastTravelManager.js';
import { MountSystem } from '../systems/MountSystem.js';
import { getInterior } from '../../data/interiors/registry.js';
import { AutoSave } from '../systems/AutoSave.js';
import { GameplayStats } from '../systems/GameplayStats.js';
import { evaluateActionSets, executeActions } from '../systems/ActionSetExecutor.js';
import { buildActionContext } from '../systems/actionContext.js';


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
    this.timeSystem = null;
    this.weatherSystem = null;
    this.dayNightCycle = null;

    // Input
    this.interactKey = null;
  }

  create() {
    // Reset state flags (Phaser reuses scene instances, constructor only runs once)
    this.frozen = false;
    this.interactCooldown = false;

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
    this.timeSystem = new TimeSystem(this);
    this.weatherSystem = new WeatherSystem(this);
    this.dayNightCycle = new DayNightCycle(this);
    this.worldStateManager = new WorldStateManager(this); // Init World State Manager
    this.puzzleManager = new PuzzleManager(this);         // Init Puzzle Manager
    this.fastTravelManager = new FastTravelManager(this); // Init Fast Travel Manager
    this.mountSystem = new MountSystem(this);             // Init Mount System
    this.sceneStackManager = new SceneStackManager(this);
    this.dialogueEngine = new DialogueEngine(this);

    // Sync Time to World State
    const updateTimeFlags = (phase) => {
      if (!this.worldStateManager) return;
      this.worldStateManager.setFlag('time_phase', phase);
      this.worldStateManager.setFlag('is_night', phase === 'night');
    };

    EventBus.on(EVENTS.TIME_PHASE_CHANGED, updateTimeFlags);

    // Initial sync
    const initialPhase = this.timeSystem.lastPhase || 'day'; // Fallback
    updateTimeFlags(initialPhase);

    // Cleanup listener on shutdown
    this.events.once('shutdown', () => {
      EventBus.off(EVENTS.TIME_PHASE_CHANGED, updateTimeFlags);
    });

    // Companion system — must be after PlayerController is created
    this.companionManager = new CompanionManager(this);

    // Load the default zone
    const zone = ZONES.oasis_village;
    this.buildZone('oasis_village', zone.spawnPoint.x * TILE, zone.spawnPoint.y * TILE);

    // AutoSave + GameplayStats (Phase 36)
    this.autoSave = new AutoSave();
    this.autoSave.start();
    this.gameplayStats = new GameplayStats();
    this.gameplayStats.start();

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

    // Input: M for Mount (Temp binding)
    this.input.keyboard.on('keydown-M', () => {
      if (this.mountSystem && !this.frozen) {
        this.mountSystem.mount('camel');
      }
    });

    // Restore player position when resuming from InteriorScene
    // Use off first to prevent listener accumulation across scene restarts
    this.events.off('resume');
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

    // Step trigger state — reset for every zone load
    this._stepTriggers = [];
    this._stepTriggerCooldowns = {}; // triggerId → lastFireTime (ms)
    this._stepTriggersFired = new Set(); // triggerId → true for oneShot tracking

    const zone = ZONES[zoneName];
    if (!zone) {
      console.error(`Unknown zone: ${zoneName}`);
      return;
    }

    this.currentMapW = zone.mapWidth;
    this.currentMapH = zone.mapHeight;

    // Load step triggers from zone data (Phase 34-03)
    this._stepTriggers = zone.stepTriggers || [];

    // Sub-area state (Phase 36)
    this._subAreas = zone.subAreas || [];
    this._currentSubArea = null;

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

  handleFastTravel({ zoneName }) {
    if (this.fastTravelManager) {
      this.fastTravelManager.travelToZone(zoneName);
    } else {
      // Fallback if manager fails
      this.loadZone(zoneName);
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================

  handleFreeze() {
    // Only freeze if this scene is actively running (not paused by InteriorScene)
    if (!this.scene || !this.scene.isActive()) return;
    this.frozen = true;
    this.playerController.freeze();
  }

  handleUnfreeze() {
    // Only unfreeze if this scene is actively running
    if (!this.scene || !this.scene.isActive()) return;
    this.frozen = false;
    this.playerController.unfreeze();
  }

  setInteractCooldown(value) {
    this.interactCooldown = value;
  }

  // ============================================================
  // FRAME UPDATE
  // ============================================================

  update(time, delta) {
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

    // Check step trigger zones (Phase 34-03)
    if (this._stepTriggers && this._stepTriggers.length && player) {
      this._checkStepTriggers(player);
    }

    // Check sub-area boundaries (Phase 36)
    if (this._subAreas && this._subAreas.length && player) {
      this._checkSubArea(player);
    }

    // Check exit trigger zones
    this.checkExitTriggers();

    // Update DOM overlay positions every frame
    if (this.domOverlay) this.domOverlay.update();

    // Update time system
    if (this.timeSystem) this.timeSystem.update(time, delta);
    if (this.weatherSystem) this.weatherSystem.update(time, delta);

    // Check fast travel unlocks
    if (this.fastTravelManager && this.playerController) {
      const p = this.playerController.getPlayer();
      if (p) {
        this.fastTravelManager.checkCurrentLocation(p.x, p.y, this.currentZone);
      }
    }
  }

  // ============================================================
  // STEP TRIGGERS (Phase 34-03)
  // ============================================================

  /**
   * Check if the player is standing inside any step trigger zone.
   * Fires the first matched actionSet for each triggered zone,
   * respecting cooldown and oneShot constraints.
   *
   * @param {Phaser.GameObjects.Sprite} player - Player sprite with x/y world coords
   */
  _checkStepTriggers(player) {
    const px = Math.floor(player.x / TILE);
    const py = Math.floor(player.y / TILE);
    const now = this.time.now;

    for (const trigger of this._stepTriggers) {
      // Check if player tile position is within trigger bounds
      if (px < trigger.x || px >= trigger.x + (trigger.width || 1)) continue;
      if (py < trigger.y || py >= trigger.y + (trigger.height || 1)) continue;

      // Check oneShot: skip if already fired this session
      if (trigger.oneShot && this._stepTriggersFired.has(trigger.id)) continue;

      // Check cooldown: skip if fired too recently
      const lastFire = this._stepTriggerCooldowns[trigger.id] || 0;
      if (trigger.cooldown && now - lastFire < trigger.cooldown) continue;

      // Evaluate actionSets using the shared context builder
      const context = buildActionContext(this.currentZone);
      const matched = evaluateActionSets(trigger.actionSets, context);
      if (!matched) continue;

      // Fire: execute actions, record timing, track oneShot
      executeActions(matched.actions, EventBus);
      this._stepTriggerCooldowns[trigger.id] = now;
      if (trigger.oneShot || trigger.flagOnFire) {
        this._stepTriggersFired.add(trigger.id);
      }
    }
  }

  // ============================================================
  // SUB-AREA DETECTION (Phase 36)
  // ============================================================

  _checkSubArea(player) {
    const px = Math.floor(player.x / TILE);
    const py = Math.floor(player.y / TILE);

    let currentArea = null;
    for (const area of this._subAreas) {
      if (px >= area.x && px < area.x + (area.width || 1) &&
          py >= area.y && py < area.y + (area.height || 1)) {
        currentArea = area;
        break;
      }
    }

    const prevArea = this._currentSubArea;
    if (currentArea?.id !== prevArea?.id) {
      if (prevArea) EventBus.emit(EVENTS.SUB_AREA_EXIT, { area: prevArea });
      if (currentArea) EventBus.emit(EVENTS.SUB_AREA_ENTER, { area: currentArea });
      this._currentSubArea = currentArea;
    }
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
    if (this.autoSave) { this.autoSave.stop(); this.autoSave = null; }
    if (this.gameplayStats) { this.gameplayStats.stop(); this.gameplayStats = null; }

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

    // Destroy WorldStateManager (has Redux subscription that leaks if not cleaned up)
    if (this.worldStateManager) {
      this.worldStateManager.destroy();
      this.worldStateManager = null;
    }

    // Destroy PuzzleManager
    if (this.puzzleManager) {
      if (this.puzzleManager.destroy) this.puzzleManager.destroy();
      this.puzzleManager = null;
    }

    // Destroy FastTravelManager
    if (this.fastTravelManager) {
      this.fastTravelManager = null;
    }

    // Reset zone transition to prevent stuck state on scene restart
    if (this.zoneTransition) {
      this.zoneTransition.transitioning = false;
    }

    // Clean up resume listener
    this.events.off('resume');

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

    if (this.timeSystem) {
      this.timeSystem.destroy();
      this.timeSystem = null;
    }

    if (this.weatherSystem) {
      this.weatherSystem.destroy();
      this.weatherSystem = null;
    }

    if (this.dayNightCycle) {
      this.dayNightCycle.destroy();
      this.dayNightCycle = null;
    }

    if (this.mountSystem) {
      this.mountSystem.destroy();
      this.mountSystem = null;
    }
  }
}
