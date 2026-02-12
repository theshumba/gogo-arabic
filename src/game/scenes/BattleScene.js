/**
 * BattleScene.js — Phaser 3 scene for turn-based combat.
 *
 * Launched via SceneStackManager.pushScene('BattleScene', config).
 * Delegates to subsystems: BattleStateMachine, BattleArena, BattleSpriteManager,
 * BattleEffectManager, BattleHUDManager, BattleDamagePool.
 *
 * React renders the battle menu and Arabic input overlay on top.
 * Communication: EventBus (EVENTS.BATTLE_*) — Phaser never touches DOM, React never touches Phaser.
 */

import Phaser from 'phaser';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';
import { store } from '../../store/store.js';
import { BattleStateMachine } from '../systems/battle/BattleStateMachine.js';
import { BattleArena } from '../systems/battle/BattleArena.js';
import { BattleSpriteManager } from '../systems/battle/BattleSpriteManager.js';
import { BattleEffectManager } from '../systems/battle/BattleEffectManager.js';
import { BattleHUDManager } from '../systems/battle/BattleHUDManager.js';
import { BattleDamagePool } from '../systems/battle/BattleDamagePool.js';
import ScreenShake from '../systems/ScreenShake.js';

export class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');
    this.returnSceneKey = null;
    this.battleConfig = null;

    // Subsystem references
    this.screenShake = null;
    this.arena = null;
    this.sprites = null;
    this.effects = null;
    this.hud = null;
    this.damagePool = null;
    this.stateMachine = null;
  }

  init(data) {
    this.battleConfig = data;
    this.returnSceneKey = data.returnSceneKey || 'WorldScene';
  }

  preload() {
    const { enemyParty = [] } = this.battleConfig;

    // Load enemy battle sprites (if available)
    enemyParty.forEach((enemyId) => {
      const key = `battle-enemy-${enemyId}`;
      if (!this.textures.exists(key)) {
        // Only attempt load if the asset exists — graceful fallback if not
        this.load.spritesheet(key, `/assets/sprites/battle/enemies/${enemyId}.png`, {
          frameWidth: 256,
          frameHeight: 256,
        });
      }
    });

    // Load player battle sprite
    const outfit = store.getState().player.outfit || 'simple-thobe';
    const playerKey = `battle-player-${outfit}`;
    if (!this.textures.exists(playerKey)) {
      this.load.spritesheet(playerKey, `/assets/sprites/battle/player/${outfit}.png`, {
        frameWidth: 256,
        frameHeight: 256,
      });
    }

    // Suppress load errors for missing battle sprites (assets not yet created)
    this.load.on('loaderror', (fileObj) => {
      // eslint-disable-next-line no-console
      console.warn(`[BattleScene] Asset not found (fallback will be used): ${fileObj.key}`);
    });
  }

  create() {
    // Initialize subsystems
    this.screenShake = new ScreenShake(this);
    this.arena = new BattleArena(this, this.battleConfig.zone);
    this.sprites = new BattleSpriteManager(this);
    this.effects = new BattleEffectManager(this);
    this.hud = new BattleHUDManager(this);
    this.damagePool = new BattleDamagePool(this);
    this.stateMachine = new BattleStateMachine(this, this.battleConfig);

    // Build the arena
    this.arena.create();

    // Spawn combatants
    this.sprites.spawnPlayer();
    this.sprites.spawnEnemies(this.battleConfig.enemyParty || []);

    // Initialize HUD
    this.hud.create();

    // Start the battle FSM
    this.stateMachine.start();

    // Listen for React input via EventBus
    this._onActionSelected = ({ action, target }) => {
      this.stateMachine.handleAction(action, target);
    };
    this._onArabicInput = (result) => {
      this.stateMachine.handleArabicInput(result);
    };
    this._onFleeRequested = () => {
      this.stateMachine.handleFlee();
    };
    this._onItemUsed = ({ itemId }) => {
      // Phase 29 stub
      this.stateMachine.handleAction('item', 0);
    };

    EventBus.on(EVENTS.BATTLE_ACTION_SELECTED, this._onActionSelected);
    EventBus.on(EVENTS.BATTLE_ARABIC_INPUT, this._onArabicInput);
    EventBus.on(EVENTS.BATTLE_FLEE_REQUESTED, this._onFleeRequested);
    EventBus.on(EVENTS.BATTLE_ITEM_USED, this._onItemUsed);

    // Notify React that battle is active
    EventBus.emit(EVENTS.BATTLE_STARTED, this.battleConfig);
  }

  update(time, delta) {
    this.stateMachine?.update(time, delta);
    this.sprites?.update(time, delta);
    this.hud?.update(time, delta);
    this.damagePool?.update(time, delta);
  }

  /**
   * Exit battle — pop scene stack, resume calling scene.
   * @param {Object} result - Battle result { victory, accuracy, rewards, ... }
   */
  exitBattle(result) {
    EventBus.emit(EVENTS.BATTLE_ENDED, result);

    // Resume calling scene via SceneStackManager
    const callingScene = this.scene.get(this.returnSceneKey);
    if (callingScene?.sceneStackManager) {
      callingScene.sceneStackManager.popScene();
    } else {
      // Fallback: stop self, resume calling scene directly
      this.scene.stop();
      this.scene.resume(this.returnSceneKey);
    }

    EventBus.emit(EVENTS.PLAYER_UNFREEZE);
  }

  shutdown() {
    // Remove EventBus listeners
    EventBus.off(EVENTS.BATTLE_ACTION_SELECTED, this._onActionSelected);
    EventBus.off(EVENTS.BATTLE_ARABIC_INPUT, this._onArabicInput);
    EventBus.off(EVENTS.BATTLE_FLEE_REQUESTED, this._onFleeRequested);
    EventBus.off(EVENTS.BATTLE_ITEM_USED, this._onItemUsed);

    // Destroy subsystems
    this.stateMachine?.destroy();
    this.arena?.destroy();
    this.sprites?.destroy();
    this.effects?.destroy();
    this.hud?.destroy();
    this.damagePool?.destroy();

    this.screenShake = null;
    this.arena = null;
    this.sprites = null;
    this.effects = null;
    this.hud = null;
    this.damagePool = null;
    this.stateMachine = null;
  }
}
