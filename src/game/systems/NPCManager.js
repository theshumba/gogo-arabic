import Phaser from 'phaser';
import { NPC } from '../sprites/NPC.js';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';
import { store } from '../../store/store.js';
import { selectNpcQuestMarkers } from '../../store/slices/questSlice.js';
import { shouldSpawnNpc, evaluateSchedule } from './ScheduleEvaluator.js';
import npcsEnriched from '../../data/npcsEnriched.js';
import { selectGameTime } from '../../store/slices/timeSlice.js';

// NPC proximity threshold: 2 tiles = 128px
const INTERACT_RANGE = 64 * 2;

// O(1) lookup map for full NPC data (includes schedule arrays)
const NPC_DATA_MAP = new Map(npcsEnriched.map((n) => [n.id, n]));

/**
 * NPCManager
 * Handles NPC spawning, interaction detection, and dialogue triggering
 */
export class NPCManager {
  constructor(scene) {
    this.scene = scene;
    this.npcs = [];
  }

  /**
   * Spawn NPCs from zone config
   * NPCs with a schedule are only spawned if their schedule matches the
   * current zone and hour. NPCs without a schedule always spawn.
   */
  create(npcConfigs, playerSprite, wallGroup, domOverlay) {
    this.npcs = [];

    // Read current game time and story flags for schedule evaluation
    const { hour } = selectGameTime(store.getState());
    const currentZone = this.scene.currentZone || '';
    const flags = store.getState().narrative?.storyFlags || {};

    npcConfigs.forEach((cfg) => {
      // Schedule filtering: skip NPCs whose schedule doesn't match
      const fullNpcData = NPC_DATA_MAP.get(cfg.id);
      if (fullNpcData && !shouldSpawnNpc(fullNpcData, hour, currentZone, flags)) {
        return; // Not in this zone at this time — skip
      }

      const npcX = cfg.x * 64 + 32;
      const npcY = cfg.y * 64 + 32;

      const npc = new NPC(this.scene, npcX, npcY, {
        id: cfg.id,
        key: cfg.key,
        name: cfg.name,
      });

      // Store active schedule entry on sprite for use by movement system
      if (fullNpcData?.schedule?.length) {
        npc._scheduleEntry = evaluateSchedule(fullNpcData, hour, currentZone, flags);
      }

      this.npcs.push(npc);
      this.scene.physics.add.collider(playerSprite, npc);

      // Create DOM overlay labels for this NPC
      domOverlay.createNpcLabel(
        cfg.id,
        npcX,
        npcY,
        cfg.nameArabic,
        cfg.name
      );

      // Create interaction prompt (starts hidden)
      domOverlay.createInteractionPrompt(cfg.id, npcX, npcY);
    });
  }

  /**
   * Update NPC interaction zones (called every frame)
   * Checks proximity and handles SPACE key for interaction
   */
  update(playerSprite, domOverlay, interactKey, interactCooldown, setInteractCooldown) {
    // Read quest marker state from Redux (Phaser can't use React hooks)
    const markers = selectNpcQuestMarkers(store.getState());
    const onboardingTargetNpc = store.getState().player.onboardingTargetNpc;

    this.npcs.forEach((npc) => {
      const dist = Phaser.Math.Distance.Between(
        playerSprite.x,
        playerSprite.y,
        npc.x,
        npc.y
      );

      const inRange = dist < INTERACT_RANGE;

      // Show/hide the Phaser-rendered hint text on the NPC sprite
      npc.setInteractionHint(inRange);

      // Update quest marker (!, ?, or hidden)
      const marker = markers[npc.npcId] || null;
      npc.setQuestMarker(marker);

      // Update onboarding highlight
      npc.setOnboardingHighlight(!!onboardingTargetNpc && npc.npcId === onboardingTargetNpc);

      // Show/hide the DOM overlay SPACE prompt
      domOverlay.setVisible(`prompt-${npc.npcId}`, inRange);

      // Update DOM overlay positions to track NPC world position
      domOverlay.updatePosition(
        `npc-label-${npc.npcId}`,
        npc.x,
        npc.y
      );
      domOverlay.updatePosition(`prompt-${npc.npcId}`, npc.x, npc.y);

      // Handle SPACE key press for interaction
      if (
        inRange &&
        Phaser.Input.Keyboard.JustDown(interactKey) &&
        !interactCooldown
      ) {
        setInteractCooldown(true);
        this.scene.time.delayedCall(500, () => {
          setInteractCooldown(false);
        });
        EventBus.emit(EVENTS.NPC_INTERACT, {
          npcId: npc.npcId,
          npcName: npc.npcName,
        });
        EventBus.emit(EVENTS.PLAYER_FREEZE);
      }
    });
  }

  /**
   * Trigger interaction with a specific NPC without requiring SPACE press.
   * Used by useTutorialTrigger for auto-greeting Guide Amira.
   */
  autoInteract(npcId) {
    const npc = this.npcs.find((n) => n.npcId === npcId);
    if (!npc) return;

    EventBus.emit(EVENTS.NPC_INTERACT, {
      npcId: npc.npcId,
      npcName: npc.npcName,
      autoTriggered: true,
    });
    EventBus.emit(EVENTS.PLAYER_FREEZE);
  }

  /**
   * Get NPCs for Y-sorting
   */
  getNPCs() {
    return this.npcs;
  }

  /**
   * Destroy all NPCs
   */
  destroy() {
    this.npcs.forEach((npc) => {
      npc.destroy();
    });
    this.npcs = [];
  }
}
