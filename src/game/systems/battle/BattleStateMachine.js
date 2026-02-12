/**
 * BattleStateMachine.js — Core FSM driving turn-based combat.
 *
 * State flow:
 *   INTRO -> TURN_START -> PLAYER_TURN/ENEMY_TURN -> ACTION_SELECT/ENEMY_AI ->
 *   INPUT_PHASE -> RESOLVE_ACTION -> APPLY_DAMAGE -> ANIMATE_HIT ->
 *   TURN_END -> CHECK_END -> VICTORY/DEFEAT or back to TURN_START
 *
 * Communicates with React UI via EventBus and reads/writes Redux store directly.
 * Arabic input accuracy is the primary damage multiplier.
 */

import { EventBus } from '../../../utils/eventBus.js';
import { EVENTS } from '../../../utils/eventBusTypes.js';
import { store } from '../../../store/store.js';
import {
  startBattle,
  dealDamage,
  dealDamageToPlayer,
  healEnemy,
  setPlayerDefending,
  setCurrentTurn,
  spendMP,
  tickStatusEffects,
  recordWordUsed,
  incrementTurn,
  endBattle,
} from '../../../store/slices/battleSlice.js';
import { getEnemy } from '../../../data/enemies.js';
import { calculateDamage } from './BattleDamageCalculator.js';
import { EnemyAI } from './EnemyAI.js';
import { RootMagicManager } from '../magic/RootMagicManager.js';
import { getRootWords } from '../../../data/rootsData.js';

const STATES = Object.freeze({
  IDLE: 'IDLE',
  INTRO: 'INTRO',
  TURN_START: 'TURN_START',
  PLAYER_TURN: 'PLAYER_TURN',
  ACTION_SELECT: 'ACTION_SELECT',
  MAGIC_CAST: 'MAGIC_CAST',
  INPUT_PHASE: 'INPUT_PHASE',
  RESOLVE_ACTION: 'RESOLVE_ACTION',
  APPLY_DAMAGE: 'APPLY_DAMAGE',
  ANIMATE_HIT: 'ANIMATE_HIT',
  ENEMY_TURN: 'ENEMY_TURN',
  ENEMY_ANIMATE: 'ENEMY_ANIMATE',
  APPLY_ENEMY_DAMAGE: 'APPLY_ENEMY_DAMAGE',
  TURN_END: 'TURN_END',
  CHECK_END: 'CHECK_END',
  VICTORY: 'VICTORY',
  DEFEAT: 'DEFEAT',
});

export { STATES as BATTLE_STATES };

export class BattleStateMachine {
  constructor(scene, battleConfig) {
    this.scene = scene;
    this.config = battleConfig;
    this.state = STATES.IDLE;
    this.currentAction = null;
    this.pendingInput = null;
    this.enemyAI = null;
    this.magicManager = null;
    this.isPlayerTurn = true; // Strict turns: player first

    // Initialize enemy AI
    const enemyId = battleConfig.enemyParty?.[0];
    const enemyData = getEnemy(enemyId);
    if (enemyData) {
      const fsrsCards = store.getState().vocabulary?.fsrsCards || {};
      this.enemyAI = new EnemyAI(enemyData, fsrsCards);
    }

    // Initialize magic manager
    this.magicManager = new RootMagicManager(scene);
  }

  start() {
    // Dispatch startBattle to Redux
    const enemyId = this.config.enemyParty?.[0];
    const enemyData = getEnemy(enemyId);

    store.dispatch(
      startBattle({
        bossId: enemyId,
        bossHP: enemyData?.baseHP || 100,
        encounterType: this.config.encounterType || 'random',
        zone: this.config.zone,
        enemyData: enemyData || null,
        playerMaxHP: 100,
        playerMaxMP: 50,
      })
    );

    this._transition(STATES.INTRO);
  }

  update() {
    switch (this.state) {
      case STATES.TURN_START:
        this._nextTurn();
        break;
      case STATES.CHECK_END:
        this._checkBattleEnd();
        break;
      default:
        break;
    }
  }

  // ─── State transitions ─────────────────────────────────────

  _transition(newState) {
    const oldState = this.state;
    this.state = newState;

    EventBus.emit(EVENTS.BATTLE_STATE_CHANGED, {
      from: oldState,
      to: newState,
    });

    this._onEnter(newState);
  }

  _onEnter(state) {
    switch (state) {
      case STATES.INTRO:
        this._playIntro();
        break;
      case STATES.PLAYER_TURN:
        this._startPlayerTurn();
        break;
      case STATES.ACTION_SELECT:
        EventBus.emit(EVENTS.BATTLE_STATE_CHANGED, {
          to: 'ACTION_SELECT',
          actions: this._getAvailableActions(),
        });
        break;
      case STATES.MAGIC_CAST:
        this._handleMagicCast();
        break;
      case STATES.INPUT_PHASE:
        this._promptArabicInput();
        break;
      case STATES.RESOLVE_ACTION:
        this._resolveAction();
        break;
      case STATES.APPLY_DAMAGE:
        this._applyDamage();
        break;
      case STATES.ANIMATE_HIT:
        this._animateHit();
        break;
      case STATES.ENEMY_TURN:
        this._startEnemyTurn();
        break;
      case STATES.ENEMY_ANIMATE:
        this._animateEnemyAction();
        break;
      case STATES.APPLY_ENEMY_DAMAGE:
        this._applyEnemyDamage();
        break;
      case STATES.TURN_END:
        this._endTurn();
        break;
      case STATES.VICTORY:
        this._handleVictory();
        break;
      case STATES.DEFEAT:
        this._handleDefeat();
        break;
    }
  }

  // ─── Turn management ───────────────────────────────────────

  _nextTurn() {
    store.dispatch(incrementTurn());

    if (this.isPlayerTurn) {
      store.dispatch(setCurrentTurn('player'));
      this._transition(STATES.PLAYER_TURN);
    } else {
      store.dispatch(setCurrentTurn('enemy'));
      this._transition(STATES.ENEMY_TURN);
    }
  }

  // ─── Player turn ───────────────────────────────────────────

  _startPlayerTurn() {
    store.dispatch(setPlayerDefending(false));
    this._transition(STATES.ACTION_SELECT);
  }

  _getAvailableActions() {
    const actions = ['attack', 'defend'];

    // Magic if player has MP
    const battleState = store.getState().battle;
    if (battleState.playerMP >= 5) {
      actions.push('magic');
    }

    // Items stub (Phase 29)
    actions.push('item');

    // Flee always available
    actions.push('flee');

    return actions;
  }

  /**
   * Handle player action selection (from React via EventBus).
   */
  handleAction(action, target, slot) {
    if (this.state !== STATES.ACTION_SELECT) return;

    this.currentAction = { type: action, target: target || 0, slot };

    if (action === 'flee') {
      this._handleFlee();
      return;
    }

    if (action === 'defend') {
      store.dispatch(setPlayerDefending(true));
      this._transition(STATES.RESOLVE_ACTION);
      return;
    }

    if (action === 'item') {
      // Item use: stub for Phase 29
      this._transition(STATES.RESOLVE_ACTION);
      return;
    }

    if (action === 'magic') {
      // Magic requires spell slot and transitions to MAGIC_CAST
      this._transition(STATES.MAGIC_CAST);
      return;
    }

    // Attack requires Arabic input
    this._transition(STATES.INPUT_PHASE);
  }

  /**
   * Handle Arabic input result (from React via EventBus).
   */
  handleArabicInput(result) {
    if (this.state !== STATES.INPUT_PHASE) return;
    this.pendingInput = result;
    this._transition(STATES.RESOLVE_ACTION);
  }

  /**
   * Handle flee attempt.
   */
  handleFlee() {
    if (this.state !== STATES.ACTION_SELECT) return;
    this._handleFlee();
  }

  // ─── Magic casting ─────────────────────────────────────────

  _handleMagicCast() {
    const state = store.getState();
    const equippedSpells = state.magic?.equippedSpells || [];
    const spell = equippedSpells[this.currentAction.slot];

    if (!spell) {
      console.error('[BattleStateMachine] No spell in slot', this.currentAction.slot);
      this._transition(STATES.ACTION_SELECT);
      return;
    }

    // Get a random derived word from the spell's root for Arabic input challenge
    const rootInfo = getRootWords(spell.rootId);
    let challengeWord = null;

    if (rootInfo && rootInfo.words && rootInfo.words.length > 0) {
      // Pick a random word from this root
      const randomWordId = rootInfo.words[Math.floor(Math.random() * rootInfo.words.length)];
      // We need to look up the full word data (this is a simplification - in reality we'd use vocabularyAll.js)
      challengeWord = {
        id: randomWordId,
        arabic: randomWordId, // Simplified - actual word would come from vocabulary data
        english: rootInfo.meaning || 'word',
        element: spell.element,
      };
    } else {
      // Fallback: generic word
      challengeWord = {
        id: 'generic',
        arabic: spell.rootId,
        english: 'magic word',
        element: spell.element,
      };
    }

    // Store the spell and target info for later resolution
    this.pendingInput = {
      spell,
      targetIndex: this.currentAction.target || 0,
    };

    // Transition to INPUT_PHASE with the challenge word
    this._transition(STATES.INPUT_PHASE);

    // Emit the prompt with the challenge word
    EventBus.emit(EVENTS.BATTLE_PROMPT_WORD, {
      word: challengeWord,
      difficulty: this._determineDifficulty(),
      action: 'magic',
      timeLimit: this._getTimeLimit(this._determineDifficulty()),
    });
  }

  // ─── Arabic input ──────────────────────────────────────────

  _promptArabicInput() {
    const word = this._selectBattleWord();
    const difficulty = this._determineDifficulty();

    EventBus.emit(EVENTS.BATTLE_PROMPT_WORD, {
      word,
      difficulty,
      action: this.currentAction.type,
      timeLimit: this._getTimeLimit(difficulty),
    });
  }

  _selectBattleWord() {
    // Select from player's vocabulary, weighted toward due/weak words
    const vocabState = store.getState().vocabulary;
    const learnedWords = vocabState?.learnedWords || [];

    if (learnedWords.length === 0) {
      // Fallback: a simple word for new players
      return { id: 'hello', arabic: 'مرحبا', english: 'Hello', element: null };
    }

    // Prefer words that are due for review (FSRS integration)
    const fsrsCards = vocabState?.fsrsCards || {};
    const now = Date.now();
    const dueWords = learnedWords.filter((w) => {
      const card = fsrsCards[w.id];
      if (!card?.card?.due) return true; // No card = new = due
      return new Date(card.card.due).getTime() <= now;
    });

    const pool = dueWords.length > 0 ? dueWords : learnedWords;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  _determineDifficulty() {
    const playerLevel = store.getState().player?.level || 1;
    if (playerLevel <= 3) return 'choice'; // Multiple choice for beginners
    return 'type'; // Free typing for intermediate+
  }

  _getTimeLimit(difficulty) {
    return difficulty === 'choice' ? 15000 : 20000;
  }

  // ─── Damage resolution ─────────────────────────────────────

  _resolveAction() {
    const action = this.currentAction;
    const input = this.pendingInput;

    if (action.type === 'attack') {
      const enemyData = store.getState().battle.enemyData;
      const result = calculateDamage({
        baseDamage: 10,
        accuracy: input?.accuracy || 0,
        timeElapsedMs: input?.timeElapsed || 20000,
        element: null,
        targetElement: enemyData?.element || null,
        streak: store.getState().battle.streak,
        playerLevel: store.getState().player?.level || 1,
        isMagic: false,
      });
      action.resolvedDamage = result.damage;
      action.isMiss = result.isMiss;
      action.isCritical = result.isCritical;
      action.wasCorrect = !result.isMiss;
    } else if (action.type === 'magic') {
      // Magic uses RootMagicManager for damage calculation
      // pendingInput from _handleMagicCast contains spell info
      const spell = input?.spell;
      const targetIndex = input?.targetIndex || 0;
      const accuracy = input?.accuracy || 0;

      if (spell) {
        // Cast spell via RootMagicManager (it handles MP, damage, combos)
        const success = this.magicManager.castSpell(action.slot, targetIndex, accuracy);

        if (success) {
          // RootMagicManager handles damage via delayed call, so we mark action as completed
          action.wasCorrect = true;
          action.isMiss = false;
          action.element = spell.element;
          // Damage is handled by RootMagicManager, not here
          action.resolvedDamage = 0; // Will be applied by manager
        } else {
          // Spell failed (not enough MP)
          action.wasCorrect = false;
          action.isMiss = true;
          action.resolvedDamage = 0;
        }
      } else {
        // Fallback to old magic system if no spell found
        const enemyData = store.getState().battle.enemyData;
        store.dispatch(spendMP(5));
        const result = calculateDamage({
          baseDamage: 12,
          accuracy: input?.accuracy || 0,
          timeElapsedMs: input?.timeElapsed || 20000,
          element: input?.element || null,
          targetElement: enemyData?.element || null,
          streak: store.getState().battle.streak,
          playerLevel: store.getState().player?.level || 1,
          isMagic: true,
        });
        action.resolvedDamage = result.damage;
        action.isMiss = result.isMiss;
        action.isCritical = result.isCritical;
        action.wasCorrect = !result.isMiss;
        action.element = input?.element;
      }
    } else if (action.type === 'defend') {
      action.resolvedDamage = 0;
      action.wasCorrect = true;
    } else if (action.type === 'item') {
      action.resolvedDamage = 0;
      action.wasCorrect = true;
    }

    // Update FSRS for the word used
    if (input?.wordId) {
      store.dispatch(recordWordUsed(input.wordId));
    }

    this._transition(STATES.APPLY_DAMAGE);
  }

  _applyDamage() {
    const { resolvedDamage, wasCorrect, isMiss } = this.currentAction;

    if (isMiss || !wasCorrect) {
      // Player takes counter-damage on miss
      const counterDamage = Math.max(1, Math.floor((resolvedDamage || 5) * 0.5));
      store.dispatch(dealDamage({ damage: counterDamage, correct: false }));
    } else if (resolvedDamage > 0) {
      store.dispatch(dealDamage({ damage: resolvedDamage, correct: true }));
      const streak = store.getState().battle.streak;
      EventBus.emit(EVENTS.BATTLE_COMBO_UPDATE, { streak });
    }

    this._transition(STATES.ANIMATE_HIT);
  }

  _animateHit() {
    const { resolvedDamage, wasCorrect, isMiss, type, element, target, isCritical } =
      this.currentAction;

    const sprites = this.scene.sprites;
    const effects = this.scene.effects;
    const damagePool = this.scene.damagePool;
    const screenShake = this.scene.screenShake;

    if (wasCorrect && !isMiss) {
      // ── Player hits enemy ──
      const playAnim =
        type === 'magic'
          ? (cb) => sprites.playPlayerCast(cb)
          : (cb) => sprites.playPlayerAttack(cb);

      playAnim(() => {
        // Hit-stop
        effects.hitStop(isCritical ? 5 : 3);

        // Screen shake
        screenShake.shake(isCritical ? 'critical' : 'hit');

        // Critical flash
        if (isCritical) {
          effects.screenFlash(0xffd700, 80);
        }

        const afterSpell = () => {
          // Enemy hurt animation
          sprites.playEnemyHurt(target || 0, () => {
            // Floating damage number
            const enemySprite = sprites.enemySprites[target || 0]?.sprite;
            if (enemySprite) {
              damagePool.show(
                enemySprite.x,
                enemySprite.y - 40,
                resolvedDamage,
                isCritical ? 'critical' : 'damage'
              );
            }

            // Update HP bar
            const battleState = store.getState().battle;
            this.scene.hud.setEnemyHP(battleState.bossHP);

            this._transition(STATES.TURN_END);
          });
        };

        // Spell effect (if magic)
        if (type === 'magic' && element) {
          const enemySprite = sprites.enemySprites[target || 0]?.sprite;
          if (enemySprite) {
            effects.playSpellEffect(element, enemySprite.x, enemySprite.y, afterSpell);
          } else {
            afterSpell();
          }
        } else {
          afterSpell();
        }
      });
    } else {
      // ── Player missed ──
      const enemySprite = sprites.enemySprites[target || 0]?.sprite;
      if (enemySprite) {
        damagePool.show(enemySprite.x, enemySprite.y - 40, 'MISS', 'miss');
      }

      const counterDamage = Math.max(1, Math.floor((resolvedDamage || 5) * 0.5));
      sprites.playPlayerHurt(() => {
        if (sprites.playerSprite) {
          damagePool.show(sprites.playerSprite.x, sprites.playerSprite.y - 40, counterDamage, 'damage');
        }
        this.scene.hud.setPlayerHP(store.getState().battle.playerHP);
        this._transition(STATES.TURN_END);
      });

      screenShake.shake('hit');
    }
  }

  // ─── Enemy turn ────────────────────────────────────────────

  _startEnemyTurn() {
    if (!this.enemyAI) {
      this._transition(STATES.TURN_END);
      return;
    }

    const battleState = store.getState().battle;
    const enemyAction = this.enemyAI.decide(battleState);
    this.currentAction = enemyAction;

    EventBus.emit(EVENTS.BATTLE_ENEMY_ACTION, {
      enemyId: enemyAction.enemyId,
      actionType: enemyAction.type,
      intent: enemyAction.intentText,
    });

    // Brief pause to show intent
    this.scene.time.delayedCall(600, () => {
      if (enemyAction.type === 'heal') {
        this._applyEnemyHeal(enemyAction);
      } else if (enemyAction.type === 'defend') {
        // Enemy defend — skip damage, go to turn end
        this._transition(STATES.TURN_END);
      } else {
        this._transition(STATES.ENEMY_ANIMATE);
      }
    });
  }

  _animateEnemyAction() {
    const { enemyIndex } = this.currentAction;
    this.scene.sprites.playEnemyAttack(enemyIndex || 0, () => {
      this._transition(STATES.APPLY_ENEMY_DAMAGE);
    });
  }

  _applyEnemyDamage() {
    const { damage, type } = this.currentAction;
    const effects = this.scene.effects;
    const sprites = this.scene.sprites;
    const damagePool = this.scene.damagePool;
    const screenShake = this.scene.screenShake;

    const isDefending = store.getState().battle.isPlayerDefending;
    const finalDamage = isDefending ? Math.floor(damage * 0.5) : damage;

    store.dispatch(dealDamageToPlayer({ damage: finalDamage }));

    effects.hitStop(2);
    screenShake.shake('hit');

    // Spell effect for special attacks
    if (type === 'special' && this.currentAction.element) {
      const playerSprite = sprites.playerSprite;
      if (playerSprite) {
        effects.playSpellEffect(this.currentAction.element, playerSprite.x, playerSprite.y, () => {});
      }
    }

    const playAnim = isDefending
      ? (cb) => sprites.playPlayerDefend(cb)
      : (cb) => sprites.playPlayerHurt(cb);

    playAnim(() => {
      if (sprites.playerSprite) {
        damagePool.show(sprites.playerSprite.x, sprites.playerSprite.y - 40, finalDamage, 'damage');
      }
      this.scene.hud.setPlayerHP(store.getState().battle.playerHP);
      this._transition(STATES.TURN_END);
    });
  }

  _applyEnemyHeal(action) {
    const amount = action.healAmount || 0;
    store.dispatch(healEnemy({ amount }));
    this.scene.hud.setEnemyHP(store.getState().battle.bossHP);
    this.scene.damagePool.show(
      this.scene.sprites.enemySprites[0]?.sprite?.x || 200,
      (this.scene.sprites.enemySprites[0]?.sprite?.y || 200) - 40,
      `+${amount}`,
      'heal'
    );
    this._transition(STATES.TURN_END);
  }

  // ─── Turn end / check ──────────────────────────────────────

  _endTurn() {
    this.currentAction = null;
    this.pendingInput = null;

    // Alternate turns (strict turn mode)
    this.isPlayerTurn = !this.isPlayerTurn;

    // Tick status effects
    store.dispatch(tickStatusEffects());

    this._transition(STATES.CHECK_END);
  }

  _checkBattleEnd() {
    const battleState = store.getState().battle;

    if (battleState.bossHP <= 0) {
      this._transition(STATES.VICTORY);
    } else if (battleState.playerHP <= 0) {
      this._transition(STATES.DEFEAT);
    } else {
      this._transition(STATES.TURN_START);
    }
  }

  // ─── Intro / Outro ─────────────────────────────────────────

  _playIntro() {
    this.scene.cameras.main.fadeIn(500);

    const enemyData = store.getState().battle.enemyData;
    const enemyName = enemyData?.nameArabic || enemyData?.name || 'Enemy';

    this.scene.time.delayedCall(800, () => {
      EventBus.emit(EVENTS.BATTLE_ENEMY_ACTION, {
        actionType: 'intro',
        intent: `${enemyName} appears!`,
      });

      this.scene.time.delayedCall(1200, () => {
        this._transition(STATES.TURN_START);
      });
    });
  }

  _handleVictory() {
    const sprites = this.scene.sprites;
    sprites.playPlayerVictory();

    sprites.enemySprites.forEach((_, idx) => {
      sprites.playEnemyDefeat(idx, () => {});
    });

    const result = this._calculateRewards(true);

    // Reset magic battle state
    if (this.magicManager) {
      this.magicManager.resetBattleState();
    }

    this.scene.time.delayedCall(2000, () => {
      store.dispatch(endBattle(result));
      this.scene.exitBattle(result);
    });
  }

  _handleDefeat() {
    this.scene.sprites.playPlayerDefeat();
    const result = this._calculateRewards(false);

    // Reset magic battle state
    if (this.magicManager) {
      this.magicManager.resetBattleState();
    }

    this.scene.time.delayedCall(2000, () => {
      store.dispatch(endBattle(result));
      this.scene.exitBattle(result);
    });
  }

  _calculateRewards(victory) {
    const state = store.getState().battle;
    const accuracy = state.currentRound > 0 ? state.wordsUsed.length / state.currentRound : 0;
    const timeElapsed = state.battleStartTimestamp ? Date.now() - state.battleStartTimestamp : 0;

    if (!victory) {
      return {
        victory: false,
        accuracy,
        timeElapsed,
        rewards: { xp: Math.floor(state.currentRound * 5), dirhams: 0 },
        bossId: state.activeBattle,
      };
    }

    const enemyData = state.enemyData;
    const baseXP = enemyData?.xpReward || 100;
    const baseDirhams = enemyData?.dirhamReward || 50;
    const streakBonus = 1 + state.maxStreak * 0.05;
    const accuracyBonus = 1 + accuracy * 0.3;

    return {
      victory: true,
      accuracy,
      timeElapsed,
      rewards: {
        xp: Math.floor(baseXP * streakBonus * accuracyBonus),
        dirhams: Math.floor(baseDirhams * accuracyBonus),
      },
      wordsUsed: state.wordsUsed,
      maxStreak: state.maxStreak,
      bossId: state.activeBattle,
    };
  }

  // ─── Flee ──────────────────────────────────────────────────

  _handleFlee() {
    // 50% base flee chance, higher for random encounters
    const fleeChance = this.config.encounterType === 'boss' ? 0.1 : 0.5;
    const success = Math.random() < fleeChance;

    if (success) {
      const result = this._calculateRewards(false);
      result.fled = true;
      store.dispatch(endBattle(result));
      this.scene.exitBattle(result);
    } else {
      // Failed flee — enemy gets a free turn
      EventBus.emit(EVENTS.BATTLE_STATE_CHANGED, {
        to: 'FLEE_FAILED',
      });
      this.isPlayerTurn = false;
      this._transition(STATES.TURN_END);
    }
  }

  destroy() {
    this.state = STATES.IDLE;
    this.currentAction = null;
    this.pendingInput = null;
    this.enemyAI = null;

    // Reset magic battle state
    if (this.magicManager) {
      this.magicManager.resetBattleState();
      this.magicManager = null;
    }
  }
}
