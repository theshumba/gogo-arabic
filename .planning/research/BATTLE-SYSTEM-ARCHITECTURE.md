# Battle System Architecture — Technical Specification

> **Version**: v6.0 Phase 27
> **Scope**: Turn-based Phaser 3 BattleScene replacing the React-only WordDuel overlay
> **Status**: Research & Design
> **Last Updated**: 2026-02-12

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [BattleScene Architecture](#2-battlescene-architecture)
3. [Battle Animation System](#3-battle-animation-system)
4. [Turn-Based Combat Engine](#4-turn-based-combat-engine)
5. [Battle UI — React + Phaser Hybrid](#5-battle-ui--react--phaser-hybrid)
6. [Integration with Redux](#6-integration-with-redux)
7. [Sound Design Integration](#7-sound-design-integration)
8. [Performance Considerations](#8-performance-considerations)
9. [Migration Path from WordDuel](#9-migration-path-from-wordduel)
10. [File Structure](#10-file-structure)
11. [Open Questions](#11-open-questions)

---

## 1. Executive Summary

The current battle system (`WordDuel.jsx` + `useBattle.js`) is a pure React overlay — a quiz with HP bars. It has no Phaser scene, no sprite animations, no hit-stop, no damage numbers, no spell effects. The target is a full Phaser `BattleScene` comparable to Pokemon/Final Fantasy turn-based battles, where Arabic input IS combat power.

### What Changes

| Aspect | Current (v5.0) | Target (v6.0) |
|--------|----------------|----------------|
| Rendering | React DOM overlay | Phaser scene + React input overlay |
| Characters | Emoji sprite in CSS | Animated pixel-art battle sprites |
| Animations | Framer Motion fade/scale | Phaser tweens, sprite sheets, particles |
| Damage feedback | Text in div | Floating damage numbers, screen shake, hit-stop, flash |
| Magic system | None | Root-based Arabic spell system (10 elements) |
| Combat depth | Quiz with HP bars | Turn order, elements, status effects, combos |
| Party | Player only | Player + companion (Phase 30) |

### What Stays

- Arabic input determines combat effectiveness (core mechanic preserved)
- FSRS integration for vocabulary tracking
- Redux battleSlice for state management (expanded, not replaced)
- EventBus for React-Phaser communication
- AudioManager (Howler.js) for all sound
- No music, no faces/eyes, Arabic-first constraints

---

## 2. BattleScene Architecture

### 2.1 Scene Registration

BattleScene must be registered in the Phaser game config alongside existing scenes.

```js
// src/game/config.js — updated
import { BattleScene } from './scenes/BattleScene.js';

export const gameConfig = {
  // ...existing config...
  scene: [BootScene, WorldScene, InteriorScene, BattleScene],
};
```

### 2.2 Scene Lifecycle

BattleScene follows the standard Phaser scene lifecycle but with battle-specific initialization.

```
init(data)     — Receive battle config (enemyId, zone, companions, encounter type)
preload()      — Load battle-specific assets not in BootScene (enemy sprites, spell atlases)
create()       — Build arena, position combatants, initialize subsystems, start intro sequence
update(time,d) — Drive BattleStateMachine, update animations, process ATB gauges
shutdown()     — Clean up all subsystems, pools, listeners; resume WorldScene
```

#### `init(data)` contract:

```js
// Data passed to BattleScene via SceneStackManager.pushScene()
{
  enemyId: 'sand-djinn',          // Enemy data key
  enemyParty: ['sand-djinn'],     // Array for multi-enemy battles (Phase 32)
  zone: 'desert_ruins',           // Current zone (determines arena background)
  companions: ['scholar-yusuf'],  // Active companion IDs (Phase 30, empty initially)
  encounterType: 'story',         // 'random' | 'story' | 'boss' | 'arena'
  returnSceneKey: 'WorldScene',   // Scene to resume on battle end
  difficulty: 'medium',           // Override difficulty (optional)
  preselectedWords: [],           // Force specific vocabulary (for story battles)
}
```

### 2.3 Integration with SceneStackManager

BattleScene uses the existing push/pop pattern from `SceneStackManager`. The WorldScene (or InteriorScene) pauses, BattleScene launches on top, and when battle ends the calling scene resumes.

```js
// Triggering a battle from WorldScene or InteriorScene
// (called from NPCManager encounter trigger or zone random encounter)
handleBattleStart(battleConfig) {
  // Freeze player, pause ambient
  EventBus.emit(EVENTS.PLAYER_FREEZE);
  audioManager.pauseBGM();

  // Push BattleScene onto the stack
  this.sceneStackManager.pushScene('BattleScene', {
    ...battleConfig,
    returnSceneKey: this.scene.key,
  });

  EventBus.emit(EVENTS.BATTLE_STARTED, battleConfig);
}
```

When battle ends, BattleScene pops itself:

```js
// Inside BattleScene.shutdown()
exitBattle(result) {
  // Emit result for React UI to display rewards overlay
  EventBus.emit(EVENTS.BATTLE_ENDED, result);

  // Resume calling scene via SceneStackManager
  const callingScene = this.scene.get(this.returnSceneKey);
  if (callingScene?.sceneStackManager) {
    callingScene.sceneStackManager.popScene();
  }

  // Resume ambient audio
  audioManager.resumeBGM();
  EventBus.emit(EVENTS.PLAYER_UNFREEZE);
}
```

### 2.4 BattleScene Internal Architecture

BattleScene delegates to subsystems, mirroring the WorldScene delegation pattern.

```
BattleScene
  |-- BattleStateMachine     (turn flow FSM)
  |-- BattleArena             (background, stage layout, camera)
  |-- BattleSpriteManager     (combatant sprites, animations)
  |-- BattleEffectManager     (spell VFX, particles, screen flash)
  |-- BattleHUDManager        (HP/MP bars, ATB gauges — Phaser-rendered)
  |-- BattleDamagePool        (object pool for floating damage numbers)
  |-- ScreenShake             (reuse existing system)
  |-- ParticleEffectManager   (reuse existing system)
```

```js
// src/game/scenes/BattleScene.js — skeleton
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
  }

  init(data) {
    this.battleConfig = data;
    this.returnSceneKey = data.returnSceneKey;
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
    this.sprites.spawnEnemies(this.battleConfig.enemyParty);

    // Initialize HUD
    this.hud.create();

    // Start the battle state machine (begins with intro sequence)
    this.stateMachine.start();

    // EventBus listeners for React input
    EventBus.on(EVENTS.BATTLE_ACTION_SELECTED, this.onActionSelected, this);
    EventBus.on(EVENTS.BATTLE_ARABIC_INPUT, this.onArabicInput, this);
    EventBus.on(EVENTS.BATTLE_FLEE_REQUESTED, this.onFleeRequested, this);
  }

  update(time, delta) {
    this.stateMachine.update(time, delta);
    this.sprites.update(time, delta);
    this.hud.update(time, delta);
    this.damagePool.update(time, delta);
  }

  // --- Action handlers (from React UI via EventBus) ---

  onActionSelected({ action, target }) {
    this.stateMachine.handleAction(action, target);
  }

  onArabicInput({ input, wordId, accuracy, timeElapsed }) {
    this.stateMachine.handleArabicInput(input, wordId, accuracy, timeElapsed);
  }

  onFleeRequested() {
    this.stateMachine.handleFlee();
  }

  // --- Exit ---

  exitBattle(result) {
    EventBus.emit(EVENTS.BATTLE_ENDED, result);
    const callingScene = this.scene.get(this.returnSceneKey);
    if (callingScene?.sceneStackManager) {
      callingScene.sceneStackManager.popScene();
    }
  }

  shutdown() {
    EventBus.off(EVENTS.BATTLE_ACTION_SELECTED, this.onActionSelected, this);
    EventBus.off(EVENTS.BATTLE_ARABIC_INPUT, this.onArabicInput, this);
    EventBus.off(EVENTS.BATTLE_FLEE_REQUESTED, this.onFleeRequested, this);

    this.stateMachine?.destroy();
    this.arena?.destroy();
    this.sprites?.destroy();
    this.effects?.destroy();
    this.hud?.destroy();
    this.damagePool?.destroy();
    this.screenShake = null;
  }
}
```

### 2.5 React-Phaser Bridge

The React overlay (battle menu, Arabic input) communicates with BattleScene exclusively through EventBus, following the existing `EVENTS.*` constant pattern. React never directly accesses Phaser objects. Phaser never renders DOM elements (except through DOMOverlay when needed).

**Direction of data flow:**

```
React ──EventBus──> Phaser BattleScene
  BATTLE_ACTION_SELECTED   (player chose Attack/Magic/Item/Defend/Flee)
  BATTLE_ARABIC_INPUT      (player submitted Arabic answer)
  BATTLE_FLEE_REQUESTED    (player chose to flee)
  BATTLE_ITEM_USED         (player used an item)

Phaser BattleScene ──EventBus──> React
  BATTLE_STARTED           (battle initialized, show battle UI)
  BATTLE_ENDED             (battle over, show results overlay)
  BATTLE_STATE_CHANGED     (FSM state transition, update React menu)
  BATTLE_PROMPT_WORD       (show Arabic input prompt to player)
  BATTLE_TURN_RESOLVED     (animation done, enable next input)
  BATTLE_ENEMY_ACTION      (enemy is acting, show enemy intent)
  BATTLE_COMBO_UPDATE      (combo counter changed)

Phaser BattleScene ──Redux store──> (direct read, no hooks)
  store.getState().battle   (read battle state)
  store.getState().player   (read player stats)
  store.getState().vocabulary (read FSRS data for difficulty)
```

---

## 3. Battle Animation System

### 3.1 Battle Sprite Specification

All battle sprites are separate from overworld sprites. Battle sprites are larger (256x256 per frame vs 128x128 overworld) for more expressive animation, while maintaining the faceless art style.

#### Spritesheet Layout (per combatant)

```
Battle spritesheet: 256x256 frames, 8 columns x 4 rows = 32 frames
  Row 0 (frames 0-7):   Idle cycle (8 frames, 6 fps, looping)
  Row 1 (frames 8-15):  Attack sequence (8 frames, 12 fps, play-once)
  Row 2 (frames 16-23): Hurt/flinch (4 frames) + Defend (4 frames)
  Row 3 (frames 24-31): Cast spell (4 frames) + Victory (2 frames) + Defeat (2 frames)
```

#### Asset Keys

```
battle-player-{outfitId}       — Player battle sprites (reuse outfit system)
battle-enemy-{enemyId}         — Enemy battle sprites
battle-companion-{companionId} — Companion battle sprites (Phase 30)
```

These are loaded in `BattleScene.preload()` (not BootScene) to keep initial load small.

```js
// BattleScene.preload() — dynamic asset loading
preload() {
  const { enemyParty, companions } = this.battleConfig;

  // Load enemy sprites
  enemyParty.forEach(enemyId => {
    if (!this.textures.exists(`battle-enemy-${enemyId}`)) {
      this.load.spritesheet(
        `battle-enemy-${enemyId}`,
        `/assets/sprites/battle/enemies/${enemyId}.png`,
        { frameWidth: 256, frameHeight: 256 }
      );
    }
  });

  // Load player battle sprite (based on current outfit)
  const outfit = store.getState().player.outfit || 'simple-thobe';
  if (!this.textures.exists(`battle-player-${outfit}`)) {
    this.load.spritesheet(
      `battle-player-${outfit}`,
      `/assets/sprites/battle/player/${outfit}.png`,
      { frameWidth: 256, frameHeight: 256 }
    );
  }

  // Load spell effect atlases (shared across all battles)
  if (!this.textures.exists('battle-spell-atlas')) {
    this.load.atlas(
      'battle-spell-atlas',
      '/assets/sprites/battle/spells/spell-atlas.png',
      '/assets/sprites/battle/spells/spell-atlas.json'
    );
  }
}
```

### 3.2 BattleSpriteManager

Manages all combatant sprites and their animations.

```js
// src/game/systems/battle/BattleSpriteManager.js
export class BattleSpriteManager {
  constructor(scene) {
    this.scene = scene;
    this.playerSprite = null;
    this.enemySprites = [];       // Array for multi-enemy support
    this.companionSprites = [];   // Phase 30
    this.reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  spawnPlayer() {
    const { width, height } = this.scene.cameras.main;
    const outfit = store.getState().player.outfit || 'simple-thobe';
    const key = `battle-player-${outfit}`;

    // Player positioned on the right side (RTL-friendly: player = protagonist on right)
    this.playerSprite = this.scene.add.sprite(
      width * 0.75,    // Right quarter
      height * 0.55,   // Slightly below center
      key,
      0
    );
    this.playerSprite.setScale(2); // 256 -> 512px display

    // Create animations
    this._createBattleAnims(key, 'player');

    // Start idle
    this.playerSprite.play('player-idle');
  }

  spawnEnemies(enemyParty) {
    const { width, height } = this.scene.cameras.main;

    enemyParty.forEach((enemyId, index) => {
      const key = `battle-enemy-${enemyId}`;

      // Enemies positioned on the left side
      // Multi-enemy: stagger vertically
      const xPos = width * 0.25;
      const yPos = height * 0.45 + (index * 80);

      const sprite = this.scene.add.sprite(xPos, yPos, key, 0);
      sprite.setScale(2);
      sprite.setFlipX(true); // Enemies face right (toward player)

      this._createBattleAnims(key, `enemy-${index}`);
      sprite.play(`enemy-${index}-idle`);

      this.enemySprites.push({
        sprite,
        enemyId,
        animPrefix: `enemy-${index}`,
      });
    });
  }

  _createBattleAnims(textureKey, prefix) {
    const anims = this.scene.anims;

    // Idle: frames 0-7, looping
    if (!anims.exists(`${prefix}-idle`)) {
      anims.create({
        key: `${prefix}-idle`,
        frames: anims.generateFrameNumbers(textureKey, { start: 0, end: 7 }),
        frameRate: 6,
        repeat: -1,
      });
    }

    // Attack: frames 8-15, play once
    if (!anims.exists(`${prefix}-attack`)) {
      anims.create({
        key: `${prefix}-attack`,
        frames: anims.generateFrameNumbers(textureKey, { start: 8, end: 15 }),
        frameRate: 12,
        repeat: 0,
      });
    }

    // Hurt: frames 16-19, play once
    if (!anims.exists(`${prefix}-hurt`)) {
      anims.create({
        key: `${prefix}-hurt`,
        frames: anims.generateFrameNumbers(textureKey, { start: 16, end: 19 }),
        frameRate: 10,
        repeat: 0,
      });
    }

    // Defend: frames 20-23, play once (hold last frame)
    if (!anims.exists(`${prefix}-defend`)) {
      anims.create({
        key: `${prefix}-defend`,
        frames: anims.generateFrameNumbers(textureKey, { start: 20, end: 23 }),
        frameRate: 8,
        repeat: 0,
      });
    }

    // Cast: frames 24-27, play once
    if (!anims.exists(`${prefix}-cast`)) {
      anims.create({
        key: `${prefix}-cast`,
        frames: anims.generateFrameNumbers(textureKey, { start: 24, end: 27 }),
        frameRate: 10,
        repeat: 0,
      });
    }

    // Victory: frames 28-29, loop
    if (!anims.exists(`${prefix}-victory`)) {
      anims.create({
        key: `${prefix}-victory`,
        frames: anims.generateFrameNumbers(textureKey, { start: 28, end: 29 }),
        frameRate: 4,
        repeat: -1,
      });
    }

    // Defeat: frames 30-31, play once (hold last frame)
    if (!anims.exists(`${prefix}-defeat`)) {
      anims.create({
        key: `${prefix}-defeat`,
        frames: anims.generateFrameNumbers(textureKey, { start: 30, end: 31 }),
        frameRate: 4,
        repeat: 0,
      });
    }
  }

  // --- Animation triggers called by BattleStateMachine ---

  playPlayerAttack(onComplete) {
    this._playAndReturn(this.playerSprite, 'player-attack', 'player-idle', onComplete);
  }

  playPlayerHurt(onComplete) {
    this._flashTint(this.playerSprite, 0xff0000, 150);
    this._playAndReturn(this.playerSprite, 'player-hurt', 'player-idle', onComplete);
  }

  playPlayerCast(onComplete) {
    this._playAndReturn(this.playerSprite, 'player-cast', 'player-idle', onComplete);
  }

  playPlayerDefend(onComplete) {
    this._playAndReturn(this.playerSprite, 'player-defend', 'player-idle', onComplete);
  }

  playPlayerVictory() {
    this.playerSprite.play('player-victory');
  }

  playPlayerDefeat() {
    this.playerSprite.play('player-defeat');
  }

  playEnemyAttack(enemyIndex, onComplete) {
    const enemy = this.enemySprites[enemyIndex];
    if (!enemy) return onComplete?.();
    this._playAndReturn(enemy.sprite, `${enemy.animPrefix}-attack`, `${enemy.animPrefix}-idle`, onComplete);
  }

  playEnemyHurt(enemyIndex, onComplete) {
    const enemy = this.enemySprites[enemyIndex];
    if (!enemy) return onComplete?.();
    this._flashTint(enemy.sprite, 0xff0000, 150);
    this._playAndReturn(enemy.sprite, `${enemy.animPrefix}-hurt`, `${enemy.animPrefix}-idle`, onComplete);
  }

  playEnemyDefeat(enemyIndex, onComplete) {
    const enemy = this.enemySprites[enemyIndex];
    if (!enemy) return onComplete?.();
    enemy.sprite.play(`${enemy.animPrefix}-defeat`);
    // Fade out defeated enemy
    this.scene.tweens.add({
      targets: enemy.sprite,
      alpha: 0,
      duration: 800,
      delay: 400,
      onComplete: () => onComplete?.(),
    });
  }

  // --- Helpers ---

  _playAndReturn(sprite, animKey, idleKey, onComplete) {
    sprite.play(animKey);
    sprite.once('animationcomplete', () => {
      sprite.play(idleKey);
      onComplete?.();
    });
  }

  _flashTint(sprite, color, duration) {
    if (this.reduceMotion) return;
    sprite.setTint(color);
    this.scene.time.delayedCall(duration, () => {
      sprite.clearTint();
    });
  }

  update(time, delta) {
    // Future: idle breathing tween, bobbing, shadow pulse
  }

  destroy() {
    this.playerSprite?.destroy();
    this.enemySprites.forEach(e => e.sprite?.destroy());
    this.companionSprites.forEach(c => c.sprite?.destroy());
    this.playerSprite = null;
    this.enemySprites = [];
    this.companionSprites = [];
  }
}
```

### 3.3 Spell Effect Animations (10 Elements)

Each of the 10 Arabic root elements has a distinct visual effect built from particles and tweens. All effects are rendered in Phaser using the existing `ParticleEffectManager` pattern (lazy texture creation, auto-cleanup timers).

| Element | Arabic | Particle Color | Effect Description |
|---------|--------|---------------|-------------------|
| Fire (نار) | `0xFF4500` | Embers rising, orange glow pulse | Burst of orange particles spiraling upward, screen tints warm |
| Water (ماء) | `0x4169E1` | Blue droplets, wave ripple | Horizontal wave of blue particles, splash burst on impact |
| Earth (تراب) | `0x8B4513` | Brown chunks, dust cloud | Particles erupt from below target, ground-pound shake |
| Wind (هواء) | `0x98FB98` | Green wisps, swirl pattern | Circular tween around target, speed lines |
| Light (نور) | `0xFFD700` | Golden rays, star burst | Radial burst from center, golden overlay flash |
| Shadow (ظل) | `0x4B0082` | Purple mist, fade-in | Dark particles encircle target, brief dim overlay |
| Time (زمن) | `0xC0C0C0` | Clock-like rotating particles | Circular motion, target briefly desaturates |
| Knowledge (علم) | `0x00CED1` | Teal sparkles, calligraphy traces | Arabic letter shapes form from particles, dissolve |
| Creation (خلق) | `0xFFFFE0` | White particles, geometric pattern | Islamic geometric pattern builds from particles |
| Protection (حماية) | `0x32CD32` | Green shield, hexagonal lattice | Hexagonal shield forms around target, pulses |

```js
// src/game/systems/battle/BattleEffectManager.js
export class BattleEffectManager {
  constructor(scene) {
    this.scene = scene;
    this.reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.pendingTimers = [];
  }

  /**
   * Play a spell effect at the target position.
   * @param {'fire'|'water'|'earth'|'wind'|'light'|'shadow'|'time'|'knowledge'|'creation'|'protection'} element
   * @param {number} x - Target X
   * @param {number} y - Target Y
   * @param {Function} onComplete - Callback when effect finishes
   */
  playSpellEffect(element, x, y, onComplete) {
    if (this.reduceMotion) {
      // Accessibility: skip animation, immediate callback
      onComplete?.();
      return;
    }

    const config = ELEMENT_CONFIGS[element];
    if (!config) {
      onComplete?.();
      return;
    }

    // Ensure particle texture exists
    this._ensureTexture();

    // Create particle burst with element-specific config
    const emitter = this.scene.add.particles(x, y, 'particle-dot', {
      speed: config.speed,
      lifespan: config.lifespan,
      scale: config.scale,
      tint: config.tint,
      gravityY: config.gravityY ?? 0,
      angle: config.angle ?? { min: 0, max: 360 },
      emitting: false,
    });

    emitter.explode(config.count);

    // Screen flash for powerful spells
    if (config.screenFlash) {
      this.screenFlash(config.screenFlashColor, config.screenFlashDuration);
    }

    // Auto-cleanup and callback
    const timer = this.scene.time.delayedCall(config.lifespan + 200, () => {
      emitter.destroy();
      this._removeTimer(timer);
      onComplete?.();
    });
    this.pendingTimers.push(timer);
  }

  /**
   * Screen flash: brief colored rectangle overlay that fades out.
   * @param {number} color - Hex color (e.g. 0xFFFFFF for white)
   * @param {number} duration - Duration in ms (typically 80-150)
   */
  screenFlash(color = 0xffffff, duration = 100) {
    if (this.reduceMotion) return;

    const { width, height } = this.scene.cameras.main;
    const flash = this.scene.add.rectangle(
      width / 2, height / 2,
      width, height,
      color, 0.6
    );
    flash.setScrollFactor(0); // Fixed to camera
    flash.setDepth(9998);     // Below UI, above sprites

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });
  }

  /**
   * Hit-stop: freeze the game loop for N frames to emphasize impact.
   * Implemented by pausing scene time scale briefly.
   * @param {number} frames - Number of frames to freeze (2-6 typical)
   */
  hitStop(frames = 3) {
    if (this.reduceMotion) return;

    const durationMs = frames * (1000 / 60); // Convert frames to ms at 60fps

    // Pause all tweens and anims by setting time scale to 0
    this.scene.time.timeScale = 0;
    this.scene.tweens.timeScale = 0;
    this.scene.anims.globalTimeScale = 0;

    // Resume after duration (use raw setTimeout since scene time is frozen)
    setTimeout(() => {
      if (this.scene && this.scene.sys && this.scene.sys.isActive()) {
        this.scene.time.timeScale = 1;
        this.scene.tweens.timeScale = 1;
        this.scene.anims.globalTimeScale = 1;
      }
    }, durationMs);
  }

  _ensureTexture() {
    if (this.scene.textures.exists('particle-dot')) return;
    const gfx = this.scene.add.graphics();
    gfx.fillStyle(0xffffff, 1);
    gfx.fillRect(0, 0, 4, 4);
    gfx.generateTexture('particle-dot', 4, 4);
    gfx.destroy();
  }

  _removeTimer(timer) {
    const idx = this.pendingTimers.indexOf(timer);
    if (idx !== -1) this.pendingTimers.splice(idx, 1);
  }

  destroy() {
    for (const timer of this.pendingTimers) {
      if (timer?.remove) timer.remove(false);
    }
    this.pendingTimers = [];
  }
}

// Element-specific particle configurations
const ELEMENT_CONFIGS = {
  fire: {
    tint: 0xFF4500,
    speed: { min: 80, max: 200 },
    lifespan: 600,
    scale: { start: 1.2, end: 0 },
    gravityY: -120,
    count: 30,
    screenFlash: true,
    screenFlashColor: 0xFF6600,
    screenFlashDuration: 80,
  },
  water: {
    tint: 0x4169E1,
    speed: { min: 40, max: 120 },
    lifespan: 800,
    scale: { start: 0.8, end: 0 },
    gravityY: 60,
    count: 25,
    screenFlash: false,
  },
  earth: {
    tint: 0x8B4513,
    speed: { min: 100, max: 250 },
    lifespan: 500,
    scale: { start: 1.5, end: 0 },
    gravityY: 200,
    angle: { min: 240, max: 300 },
    count: 35,
    screenFlash: true,
    screenFlashColor: 0x8B4513,
    screenFlashDuration: 100,
  },
  wind: {
    tint: 0x98FB98,
    speed: { min: 60, max: 180 },
    lifespan: 700,
    scale: { start: 0.6, end: 0 },
    count: 20,
    screenFlash: false,
  },
  light: {
    tint: 0xFFD700,
    speed: { min: 100, max: 300 },
    lifespan: 500,
    scale: { start: 1.0, end: 0 },
    count: 40,
    screenFlash: true,
    screenFlashColor: 0xFFFFFF,
    screenFlashDuration: 60,
  },
  shadow: {
    tint: 0x4B0082,
    speed: { min: 20, max: 80 },
    lifespan: 1000,
    scale: { start: 0.4, end: 1.2 },
    count: 25,
    screenFlash: true,
    screenFlashColor: 0x000000,
    screenFlashDuration: 120,
  },
  time: {
    tint: 0xC0C0C0,
    speed: { min: 30, max: 90 },
    lifespan: 900,
    scale: { start: 0.5, end: 0.5 },
    count: 20,
    screenFlash: false,
  },
  knowledge: {
    tint: 0x00CED1,
    speed: { min: 50, max: 140 },
    lifespan: 700,
    scale: { start: 0.6, end: 0 },
    count: 30,
    screenFlash: true,
    screenFlashColor: 0x00CED1,
    screenFlashDuration: 80,
  },
  creation: {
    tint: 0xFFFFE0,
    speed: { min: 40, max: 100 },
    lifespan: 1000,
    scale: { start: 0.3, end: 0.8 },
    count: 25,
    screenFlash: true,
    screenFlashColor: 0xFFFFFF,
    screenFlashDuration: 100,
  },
  protection: {
    tint: 0x32CD32,
    speed: { min: 20, max: 60 },
    lifespan: 800,
    scale: { start: 0.8, end: 0.4 },
    count: 20,
    screenFlash: false,
  },
};
```

### 3.4 Floating Damage Numbers (Object Pool)

Damage numbers float upward from the impact point with a tween, displaying the damage value with color coding. These are pooled to avoid GC pressure during multi-hit combos.

```js
// src/game/systems/battle/BattleDamagePool.js
const POOL_SIZE = 20;
const FLOAT_DURATION = 800;
const FLOAT_DISTANCE = 60;

export class BattleDamagePool {
  constructor(scene) {
    this.scene = scene;
    this.pool = [];
    this.reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Pre-allocate text objects
    for (let i = 0; i < POOL_SIZE; i++) {
      const text = scene.add.text(0, 0, '', {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '18px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      })
        .setOrigin(0.5)
        .setDepth(10000)
        .setVisible(false)
        .setScrollFactor(0);

      this.pool.push({ text, active: false });
    }
  }

  /**
   * Show a floating damage number.
   * @param {number} x - Screen X position
   * @param {number} y - Screen Y position
   * @param {number|string} value - Damage value or text (e.g. "MISS", "CRITICAL")
   * @param {'damage'|'heal'|'critical'|'miss'|'status'} type
   */
  show(x, y, value, type = 'damage') {
    const entry = this.pool.find(e => !e.active);
    if (!entry) return; // Pool exhausted — skip

    const colors = {
      damage: '#FF4444',
      heal: '#44FF44',
      critical: '#FFD700',
      miss: '#888888',
      status: '#44AAFF',
    };

    const sizes = {
      damage: '18px',
      heal: '16px',
      critical: '24px',
      miss: '14px',
      status: '14px',
    };

    entry.active = true;
    entry.text
      .setPosition(x, y)
      .setText(String(value))
      .setColor(colors[type] || '#ffffff')
      .setFontSize(sizes[type] || '18px')
      .setVisible(true)
      .setAlpha(1)
      .setScale(type === 'critical' ? 1.2 : 1);

    if (this.reduceMotion) {
      // No animation — just show and hide
      this.scene.time.delayedCall(600, () => {
        entry.text.setVisible(false);
        entry.active = false;
      });
      return;
    }

    // Critical hit: pop scale
    if (type === 'critical') {
      this.scene.tweens.add({
        targets: entry.text,
        scale: 1.6,
        duration: 100,
        yoyo: true,
        ease: 'Back.easeOut',
      });
    }

    // Float upward and fade out
    this.scene.tweens.add({
      targets: entry.text,
      y: y - FLOAT_DISTANCE,
      alpha: 0,
      duration: FLOAT_DURATION,
      ease: 'Power2',
      onComplete: () => {
        entry.text.setVisible(false);
        entry.active = false;
      },
    });
  }

  update(time, delta) {
    // Pool is self-managing via tweens; no per-frame logic needed
  }

  destroy() {
    this.pool.forEach(entry => entry.text?.destroy());
    this.pool = [];
  }
}
```

### 3.5 HP/MP Bar Animations

HP and MP bars are Phaser Graphics objects (not DOM), rendered as layered rectangles with smooth easing on value changes.

```js
// src/game/systems/battle/BattleHUDManager.js (HP bar portion)

/**
 * Animated HP bar with smooth easing, flash on damage, and color transitions.
 */
class HPBar {
  constructor(scene, x, y, width, height, config = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.barWidth = width;
    this.barHeight = height;
    this.maxValue = config.maxValue || 100;
    this.currentValue = config.maxValue || 100;
    this.displayValue = this.currentValue; // Smoothly animated

    // Background bar (dark)
    this.bgBar = scene.add.rectangle(x, y, width, height, 0x333333)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(9990);

    // Damage preview bar (shows pending damage in lighter color)
    this.dmgBar = scene.add.rectangle(x, y, width, height, 0xFF6666)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(9991);

    // Main HP bar
    this.hpBar = scene.add.rectangle(x, y, width, height, 0x44CC44)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(9992);

    // HP text
    this.hpText = scene.add.text(x + width / 2, y, '', {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '10px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(9993);

    this._updateDisplay();
  }

  /**
   * Set HP with smooth animation.
   * @param {number} newValue
   * @param {boolean} flash - Flash red on damage
   */
  setValue(newValue, flash = false) {
    const oldValue = this.currentValue;
    this.currentValue = Math.max(0, Math.min(this.maxValue, newValue));

    // Flash bar on damage
    if (flash && newValue < oldValue) {
      this.hpBar.setFillStyle(0xFFFFFF);
      this.scene.time.delayedCall(80, () => {
        this._updateBarColor();
      });
    }

    // Animate the HP bar width
    const targetWidth = (this.currentValue / this.maxValue) * this.barWidth;

    // Damage preview: dmgBar stays at old width briefly, then shrinks
    this.scene.tweens.add({
      targets: this.dmgBar,
      width: targetWidth,
      duration: 600,
      delay: 300, // Delay so player sees the "pending damage" visual
      ease: 'Power2',
    });

    // Main bar moves immediately
    this.scene.tweens.add({
      targets: this.hpBar,
      width: targetWidth,
      duration: 400,
      ease: 'Power2',
      onUpdate: () => {
        // Smoothly interpolate displayed value
        const ratio = this.hpBar.width / this.barWidth;
        this.displayValue = Math.round(ratio * this.maxValue);
        this._updateDisplay();
      },
    });
  }

  _updateBarColor() {
    const ratio = this.currentValue / this.maxValue;
    if (ratio > 0.5) {
      this.hpBar.setFillStyle(0x44CC44);      // Green
    } else if (ratio > 0.25) {
      this.hpBar.setFillStyle(0xCCCC44);      // Yellow
    } else {
      this.hpBar.setFillStyle(0xCC4444);      // Red
    }
  }

  _updateDisplay() {
    this.hpText.setText(`${this.displayValue} / ${this.maxValue}`);
    this._updateBarColor();
  }

  destroy() {
    this.bgBar?.destroy();
    this.dmgBar?.destroy();
    this.hpBar?.destroy();
    this.hpText?.destroy();
  }
}
```

### 3.6 Screen Shake Integration

BattleScene reuses the existing `ScreenShake` system. Additional battle-specific intensities are added.

```js
// Extended INTENSITY_MAP for battle (proposed update to ScreenShake.js)
const INTENSITY_MAP = {
  light:    { duration: 100, intensity: 0.003 },  // quiz correct answer
  medium:   { duration: 200, intensity: 0.008 },  // achievement unlock
  heavy:    { duration: 350, intensity: 0.015 },  // level up
  // New battle intensities:
  hit:      { duration: 120, intensity: 0.005 },  // normal attack landing
  critical: { duration: 250, intensity: 0.012 },  // critical hit
  spell:    { duration: 300, intensity: 0.010 },  // spell impact
  boss:     { duration: 400, intensity: 0.018 },  // boss special attack
};
```

### 3.7 Battle Arena

The arena is a static background image determined by the zone, with optional animated elements (swirling sand, water reflections).

```js
// src/game/systems/battle/BattleArena.js
const ARENA_BACKGROUNDS = {
  oasis_village:   'bg-battle-oasis',
  desert_ruins:    'bg-battle-desert',
  mountain_pass:   'bg-battle-mountain',
  coastal_port:    'bg-battle-coast',
  forest_grove:    'bg-battle-forest',
  ice_cavern:      'bg-battle-ice',
  market_district: 'bg-battle-market',
  library_quarter: 'bg-battle-library',
};

export class BattleArena {
  constructor(scene, zone) {
    this.scene = scene;
    this.zone = zone;
    this.bg = null;
    this.ground = null;
  }

  create() {
    const { width, height } = this.scene.cameras.main;
    const bgKey = ARENA_BACKGROUNDS[this.zone] || 'bg-battle-desert';

    // Full-screen background
    if (this.scene.textures.exists(bgKey)) {
      this.bg = this.scene.add.image(width / 2, height / 2, bgKey)
        .setScrollFactor(0)
        .setDepth(0);
    } else {
      // Fallback gradient background
      this.bg = this.scene.add.rectangle(
        width / 2, height / 2, width, height, 0x1A1A2E
      ).setScrollFactor(0).setDepth(0);
    }

    // Ground plane (semi-transparent rectangle for positioning reference)
    this.ground = this.scene.add.rectangle(
      width / 2,
      height * 0.7,
      width,
      height * 0.4,
      0x2A1A0E,
      0.3
    ).setScrollFactor(0).setDepth(1);
  }

  destroy() {
    this.bg?.destroy();
    this.ground?.destroy();
  }
}
```

---

## 4. Turn-Based Combat Engine

### 4.1 Battle State Machine

The core FSM drives the entire battle flow. Each state represents a distinct phase of a turn-based battle.

```
                              INTRO
                                |
                        (cinematic intro)
                                |
                           TURN_START
                          /          \
                   PLAYER_TURN    ENEMY_TURN  (determined by ATB/turn order)
                        |              |
                  ACTION_SELECT   ENEMY_AI_DECIDE
                        |              |
                  INPUT_PHASE     ENEMY_ANIMATE
                  (Arabic input)       |
                        |         APPLY_ENEMY_DAMAGE
                  RESOLVE_ACTION       |
                        |              |
                  APPLY_DAMAGE    TURN_END
                        |              |
                   ANIMATE_HIT    CHECK_END
                        |          /      \
                   TURN_END    VICTORY   DEFEAT
                        |
                   CHECK_END
                  /      \
              VICTORY   DEFEAT
```

```js
// src/game/systems/battle/BattleStateMachine.js

const STATES = Object.freeze({
  IDLE: 'IDLE',
  INTRO: 'INTRO',
  TURN_START: 'TURN_START',
  PLAYER_TURN: 'PLAYER_TURN',
  ACTION_SELECT: 'ACTION_SELECT',
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

export class BattleStateMachine {
  constructor(scene, battleConfig) {
    this.scene = scene;
    this.config = battleConfig;
    this.state = STATES.IDLE;
    this.turnOrder = [];      // Array of combatant IDs in turn order
    this.turnIndex = 0;
    this.currentAction = null;
    this.pendingInput = null;

    // ATB gauges (optional, can start with strict turns)
    this.atbMode = false;     // false = strict turns, true = ATB
    this.atbGauges = {};      // { combatantId: { current: 0, max: 100, speed: X } }
  }

  start() {
    this._transition(STATES.INTRO);
  }

  update(time, delta) {
    switch (this.state) {
      case STATES.INTRO:
        // Intro is driven by tween/animation callbacks, not update()
        break;
      case STATES.TURN_START:
        this._determineTurnOrder();
        this._nextTurn();
        break;
      case STATES.INPUT_PHASE:
        // Waiting for React input via EventBus — no update logic
        break;
      case STATES.CHECK_END:
        this._checkBattleEnd();
        break;
      default:
        break;
    }

    // ATB gauge fill (if ATB mode enabled)
    if (this.atbMode && this.state === STATES.TURN_START) {
      this._updateATBGauges(delta);
    }
  }

  // --- State transitions ---

  _transition(newState) {
    const oldState = this.state;
    this.state = newState;

    // Notify React of state change
    EventBus.emit(EVENTS.BATTLE_STATE_CHANGED, {
      from: oldState,
      to: newState,
    });

    // Run enter-state logic
    this._onEnter(newState);
  }

  _onEnter(state) {
    switch (state) {
      case STATES.INTRO:
        this._playIntro();
        break;
      case STATES.TURN_START:
        // Handled in update()
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

  // --- Player turn ---

  _startPlayerTurn() {
    this._transition(STATES.ACTION_SELECT);
  }

  _getAvailableActions() {
    // Core actions always available
    const actions = ['attack', 'defend'];

    // Magic available if player has learned any roots
    const roots = store.getState().vocabulary?.rootMastery;
    if (roots && Object.keys(roots).length > 0) {
      actions.push('magic');
    }

    // Items available if player has battle items
    // (Phase 29 — stub for now)
    actions.push('item');

    // Flee always available (but may fail)
    actions.push('flee');

    return actions;
  }

  handleAction(action, target) {
    if (this.state !== STATES.ACTION_SELECT) return;

    this.currentAction = { type: action, target: target || 0 };

    if (action === 'flee') {
      this._handleFlee();
      return;
    }

    if (action === 'defend') {
      // Defend skips Arabic input — immediate resolution
      this._transition(STATES.RESOLVE_ACTION);
      return;
    }

    if (action === 'item') {
      // Item use skips combat Arabic input (Phase 29)
      this._transition(STATES.RESOLVE_ACTION);
      return;
    }

    // Attack and Magic require Arabic input
    this._transition(STATES.INPUT_PHASE);
  }

  // --- Arabic input ---

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

  handleArabicInput(result) {
    if (this.state !== STATES.INPUT_PHASE) return;

    this.pendingInput = result;
    this._transition(STATES.RESOLVE_ACTION);
  }

  // --- Damage resolution ---

  _resolveAction() {
    const action = this.currentAction;
    const input = this.pendingInput;

    if (action.type === 'attack') {
      const damage = this._calculateAttackDamage(input);
      this.currentAction.resolvedDamage = damage;
      this.currentAction.wasCorrect = input?.accuracy >= 0.8;
    } else if (action.type === 'magic') {
      const damage = this._calculateMagicDamage(input);
      this.currentAction.resolvedDamage = damage;
      this.currentAction.element = input?.element;
      this.currentAction.wasCorrect = input?.accuracy >= 0.8;
    } else if (action.type === 'defend') {
      this.currentAction.resolvedDamage = 0;
      this.currentAction.defendBonus = true;
    }

    // Update FSRS for the word used
    if (input?.wordId) {
      this._updateFSRS(input.wordId, input.accuracy >= 0.8);
    }

    this._transition(STATES.APPLY_DAMAGE);
  }

  _applyDamage() {
    const { resolvedDamage, wasCorrect, target } = this.currentAction;

    if (wasCorrect && resolvedDamage > 0) {
      // Dispatch to Redux
      store.dispatch(dealDamage({ damage: resolvedDamage, correct: true }));

      // Update combo
      const streak = store.getState().battle.streak;
      EventBus.emit(EVENTS.BATTLE_COMBO_UPDATE, { streak });
    } else if (!wasCorrect) {
      // Player takes counter-damage on miss
      const counterDamage = Math.floor(resolvedDamage * 0.5);
      store.dispatch(dealDamage({ damage: counterDamage, correct: false }));
    }

    this._transition(STATES.ANIMATE_HIT);
  }

  _animateHit() {
    const { resolvedDamage, wasCorrect, type, element, target } = this.currentAction;

    const sprites = this.scene.sprites;
    const effects = this.scene.effects;
    const damagePool = this.scene.damagePool;
    const screenShake = this.scene.screenShake;

    const isCritical = store.getState().battle.streak >= 3 && wasCorrect;

    if (wasCorrect) {
      // --- Player hits enemy ---

      // 1. Play player attack/cast animation
      const playAnim = type === 'magic'
        ? () => sprites.playPlayerCast(() => step2())
        : () => sprites.playPlayerAttack(() => step2());

      const step2 = () => {
        // 2. Hit-stop on impact
        effects.hitStop(isCritical ? 5 : 3);

        // 3. Screen shake
        screenShake.shake(isCritical ? 'critical' : 'hit');

        // 4. Screen flash for critical
        if (isCritical) {
          effects.screenFlash(0xFFD700, 80);
        }

        // 5. Spell effect (if magic)
        if (type === 'magic' && element) {
          const enemySprite = sprites.enemySprites[target]?.sprite;
          if (enemySprite) {
            effects.playSpellEffect(element, enemySprite.x, enemySprite.y, () => step3());
          } else {
            step3();
          }
        } else {
          step3();
        }
      };

      const step3 = () => {
        // 6. Enemy hurt animation
        sprites.playEnemyHurt(target, () => {
          // 7. Floating damage number
          const enemySprite = sprites.enemySprites[target]?.sprite;
          if (enemySprite) {
            const dmgType = isCritical ? 'critical' : 'damage';
            damagePool.show(
              enemySprite.x,
              enemySprite.y - 40,
              resolvedDamage,
              dmgType
            );
          }

          // 8. Update HP bar
          const battleState = store.getState().battle;
          this.scene.hud.setEnemyHP(battleState.bossHP);

          // Done — move to turn end
          this._transition(STATES.TURN_END);
        });
      };

      playAnim();

    } else {
      // --- Player missed / wrong answer ---
      const counterDamage = Math.floor(resolvedDamage * 0.5);

      // Show "MISS" on enemy
      const enemySprite = sprites.enemySprites[target]?.sprite;
      if (enemySprite) {
        damagePool.show(enemySprite.x, enemySprite.y - 40, 'MISS', 'miss');
      }

      // Player takes counter-damage
      sprites.playPlayerHurt(() => {
        damagePool.show(
          sprites.playerSprite.x,
          sprites.playerSprite.y - 40,
          counterDamage,
          'damage'
        );

        const battleState = store.getState().battle;
        this.scene.hud.setPlayerHP(battleState.playerHP);

        this._transition(STATES.TURN_END);
      });

      screenShake.shake('hit');
    }
  }

  // --- Enemy turn ---

  _startEnemyTurn() {
    // Enemy AI decides action
    const enemyAction = this._enemyAIDecide();
    this.currentAction = enemyAction;

    // Brief pause to show enemy intent
    EventBus.emit(EVENTS.BATTLE_ENEMY_ACTION, {
      enemyId: enemyAction.enemyId,
      actionType: enemyAction.type,
      intent: enemyAction.intentText,
    });

    this.scene.time.delayedCall(600, () => {
      this._transition(STATES.ENEMY_ANIMATE);
    });
  }

  _animateEnemyAction() {
    const { type, enemyIndex } = this.currentAction;
    const sprites = this.scene.sprites;

    sprites.playEnemyAttack(enemyIndex, () => {
      this._transition(STATES.APPLY_ENEMY_DAMAGE);
    });
  }

  _applyEnemyDamage() {
    const { damage, type } = this.currentAction;
    const effects = this.scene.effects;
    const sprites = this.scene.sprites;
    const damagePool = this.scene.damagePool;
    const screenShake = this.scene.screenShake;

    // Check if player is defending
    const isDefending = this._isPlayerDefending();
    const finalDamage = isDefending ? Math.floor(damage * 0.5) : damage;

    // Apply to Redux
    store.dispatch(dealDamage({ damage: finalDamage, correct: false }));

    // Animations
    effects.hitStop(2);
    screenShake.shake('hit');

    if (isDefending) {
      sprites.playPlayerDefend(() => {
        damagePool.show(
          sprites.playerSprite.x,
          sprites.playerSprite.y - 40,
          finalDamage,
          'damage'
        );
        this.scene.hud.setPlayerHP(store.getState().battle.playerHP);
        this._transition(STATES.TURN_END);
      });
    } else {
      sprites.playPlayerHurt(() => {
        damagePool.show(
          sprites.playerSprite.x,
          sprites.playerSprite.y - 40,
          finalDamage,
          'damage'
        );
        this.scene.hud.setPlayerHP(store.getState().battle.playerHP);
        this._transition(STATES.TURN_END);
      });
    }
  }

  // --- Turn management ---

  _endTurn() {
    this.turnIndex++;
    this.currentAction = null;
    this.pendingInput = null;

    // Apply status effect ticks (DOT, regen, etc.)
    this._tickStatusEffects();

    this._transition(STATES.CHECK_END);
  }

  _checkBattleEnd() {
    const battleState = store.getState().battle;

    if (battleState.bossHP <= 0) {
      this._transition(STATES.VICTORY);
    } else if (battleState.playerHP <= 0) {
      this._transition(STATES.DEFEAT);
    } else {
      // Continue to next turn
      this._transition(STATES.TURN_START);
    }
  }

  // --- Intro/Outro ---

  _playIntro() {
    // Camera pan, enemy slide-in, name reveal
    const { width, height } = this.scene.cameras.main;

    // Fade in
    this.scene.cameras.main.fadeIn(500);

    this.scene.time.delayedCall(800, () => {
      // Show enemy name banner
      EventBus.emit(EVENTS.BATTLE_ENEMY_ACTION, {
        actionType: 'intro',
        intent: `${this.config.enemyParty[0]} appears!`,
      });

      this.scene.time.delayedCall(1200, () => {
        this._transition(STATES.TURN_START);
      });
    });
  }

  _handleVictory() {
    const sprites = this.scene.sprites;
    sprites.playPlayerVictory();

    // Defeat animation for all enemies
    sprites.enemySprites.forEach((enemy, idx) => {
      sprites.playEnemyDefeat(idx, () => {});
    });

    // Calculate rewards
    const result = this._calculateRewards(true);

    // Delay then exit
    this.scene.time.delayedCall(2000, () => {
      store.dispatch(endBattle(result));
      this.scene.exitBattle(result);
    });
  }

  _handleDefeat() {
    const sprites = this.scene.sprites;
    sprites.playPlayerDefeat();

    const result = this._calculateRewards(false);

    this.scene.time.delayedCall(2000, () => {
      store.dispatch(endBattle(result));
      this.scene.exitBattle(result);
    });
  }

  destroy() {
    this.state = STATES.IDLE;
    this.currentAction = null;
    this.pendingInput = null;
  }
}
```

### 4.2 Damage Calculation

Arabic accuracy is the primary damage multiplier. The formula rewards both correctness and speed.

```
Base Damage = weaponDamage + (playerLevel * 2)

Accuracy Multiplier:
  - Perfect (100% match, diacritics correct): 1.5x
  - Good (>80% match, root correct):          1.0x
  - Partial (>50% match, some letters):        0.5x
  - Wrong (<50% match):                        0.0x (miss)

Speed Bonus (time to answer):
  - Under 3 seconds:  +20% damage
  - Under 5 seconds:  +10% damage
  - Under 10 seconds: +0%
  - Over 10 seconds:  -10% damage

Element Multiplier (root magic):
  - Super effective:    2.0x
  - Neutral:            1.0x
  - Resisted:           0.5x
  - Immune:             0.0x

Grammar Combo Bonus:
  - 2-streak:  +10%
  - 3-streak:  +25% (CRITICAL — special visual)
  - 5-streak:  +50%
  - 10-streak: +100% (LEGENDARY — unique animation)

Final Damage = floor(baseDamage * accuracyMult * speedBonus * elementMult * comboBonus)
```

```js
// src/game/systems/battle/BattleDamageCalculator.js

export function calculateDamage({
  baseDamage,
  accuracy,       // 0-1 float
  timeElapsedMs,  // time to answer
  element,        // spell element (null for physical)
  targetElement,  // enemy's element affinity
  streak,         // current combo streak
  playerLevel,
  isMagic,
}) {
  // Base
  let damage = baseDamage + (playerLevel * 2);

  // Accuracy multiplier
  let accuracyMult;
  if (accuracy >= 1.0) {
    accuracyMult = 1.5;   // Perfect
  } else if (accuracy >= 0.8) {
    accuracyMult = 1.0;   // Good
  } else if (accuracy >= 0.5) {
    accuracyMult = 0.5;   // Partial
  } else {
    return { damage: 0, isMiss: true, isCritical: false };
  }

  // Speed bonus
  let speedMult = 1.0;
  if (timeElapsedMs < 3000) {
    speedMult = 1.2;
  } else if (timeElapsedMs < 5000) {
    speedMult = 1.1;
  } else if (timeElapsedMs > 10000) {
    speedMult = 0.9;
  }

  // Element multiplier
  let elementMult = 1.0;
  if (isMagic && element && targetElement) {
    elementMult = getElementMultiplier(element, targetElement);
  }

  // Combo bonus
  let comboMult = 1.0;
  let isCritical = false;
  if (streak >= 10) {
    comboMult = 2.0;
    isCritical = true;
  } else if (streak >= 5) {
    comboMult = 1.5;
    isCritical = true;
  } else if (streak >= 3) {
    comboMult = 1.25;
    isCritical = true;
  } else if (streak >= 2) {
    comboMult = 1.1;
  }

  damage = Math.floor(damage * accuracyMult * speedMult * elementMult * comboMult);

  return {
    damage: Math.max(1, damage), // Minimum 1 damage on hit
    isMiss: false,
    isCritical,
    accuracyMult,
    speedMult,
    elementMult,
    comboMult,
  };
}

// Element effectiveness matrix
const ELEMENT_CHART = {
  fire:       { weak: ['water'],     strong: ['wind', 'creation'] },
  water:      { weak: ['earth'],     strong: ['fire', 'time'] },
  earth:      { weak: ['wind'],      strong: ['water', 'shadow'] },
  wind:       { weak: ['fire'],      strong: ['earth', 'knowledge'] },
  light:      { weak: ['shadow'],    strong: ['time', 'protection'] },
  shadow:     { weak: ['light'],     strong: ['knowledge', 'creation'] },
  time:       { weak: ['creation'],  strong: ['protection', 'wind'] },
  knowledge:  { weak: ['protection'],strong: ['shadow', 'fire'] },
  creation:   { weak: ['time'],      strong: ['light', 'earth'] },
  protection: { weak: ['knowledge'], strong: ['water', 'shadow'] },
};

function getElementMultiplier(attackElement, targetElement) {
  const chart = ELEMENT_CHART[attackElement];
  if (!chart) return 1.0;
  if (chart.strong.includes(targetElement)) return 2.0;
  if (chart.weak.includes(targetElement)) return 0.5;
  return 1.0;
}
```

### 4.3 Root Magic System

Arabic 3-letter roots are the foundation of the spell system. Each root belongs to an element category. Casting a spell requires the player to correctly type or identify a word derived from that root.

```js
// src/data/rootMagic.js

/**
 * Root-to-element mapping.
 * Each root is a 3-letter Arabic consonantal root.
 * The element determines the spell's visual effect and type effectiveness.
 */
export const ROOT_ELEMENTS = {
  // Fire (نار) — heat, anger, passion
  'ح-ر-ق': 'fire',    // حرق (burn)
  'غ-ض-ب': 'fire',    // غضب (anger)
  'ح-م-س': 'fire',    // حماس (enthusiasm)
  'س-خ-ن': 'fire',    // سخن (heat)
  'ل-ه-ب': 'fire',    // لهب (flame)

  // Water (ماء) — flow, life, purity
  'س-ي-ل': 'water',   // سيل (flow)
  'ح-ي-ي': 'water',   // حياة (life)
  'ط-ه-ر': 'water',   // طهر (purify)
  'غ-س-ل': 'water',   // غسل (wash)
  'ش-ر-ب': 'water',   // شرب (drink)

  // Earth (تراب) — strength, building, stability
  'ب-ن-ي': 'earth',   // بنى (build)
  'ق-و-ي': 'earth',   // قوي (strong)
  'ث-ب-ت': 'earth',   // ثبت (stable)
  'ص-ل-ب': 'earth',   // صلب (solid)
  'ج-ب-ل': 'earth',   // جبل (mountain)

  // Wind (هواء) — speed, freedom, change
  'س-ر-ع': 'wind',    // سرع (speed)
  'ح-ر-ر': 'wind',    // حرر (free)
  'غ-ي-ر': 'wind',    // غير (change)
  'ط-ي-ر': 'wind',    // طير (fly)
  'ه-ب-ب': 'wind',    // هبب (blow)

  // Light (نور) — knowledge, truth, guidance
  'ع-ل-م': 'light',   // علم (know)
  'ص-د-ق': 'light',   // صدق (truth)
  'ه-د-ي': 'light',   // هدى (guide)
  'ن-و-ر': 'light',   // نور (light)
  'ب-ص-ر': 'light',   // بصر (sight)

  // Shadow (ظل) — hidden, secret, mystery
  'خ-ف-ي': 'shadow',  // خفي (hidden)
  'س-ر-ر': 'shadow',  // سر (secret)
  'غ-م-ض': 'shadow',  // غمض (mystery)
  'ظ-ل-م': 'shadow',  // ظلم (darkness)
  'ح-ج-ب': 'shadow',  // حجب (veil)

  // Time (زمن) — patience, history, fate
  'ص-ب-ر': 'time',    // صبر (patience)
  'ق-د-م': 'time',    // قدم (ancient)
  'ق-د-ر': 'time',    // قدر (destiny)
  'ع-م-ر': 'time',    // عمر (age)
  'ز-م-ن': 'time',    // زمن (time)

  // Knowledge (علم) — wisdom, writing, reading
  'ك-ت-ب': 'knowledge', // كتب (write)
  'ق-ر-أ': 'knowledge', // قرأ (read)
  'ف-ه-م': 'knowledge', // فهم (understand)
  'ح-ك-م': 'knowledge', // حكم (wisdom/judge)
  'د-ر-س': 'knowledge', // درس (study)

  // Creation (خلق) — making, art, design
  'خ-ل-ق': 'creation', // خلق (create)
  'ص-ن-ع': 'creation', // صنع (make)
  'ر-س-م': 'creation', // رسم (draw)
  'ن-ق-ش': 'creation', // نقش (engrave)
  'ش-ك-ل': 'creation', // شكل (form/shape)

  // Protection (حماية) — shield, guard, shelter
  'ح-م-ي': 'protection', // حمى (protect)
  'ح-ص-ن': 'protection', // حصن (fortress)
  'د-ف-ع': 'protection', // دفع (defend)
  'أ-م-ن': 'protection', // أمن (safety)
  'ح-ف-ظ': 'protection', // حفظ (preserve)
};

/**
 * Spell tiers based on verb form mastery.
 * Higher forms = more powerful spells, but require more Arabic knowledge.
 */
export const SPELL_TIERS = {
  I:   { name: 'Basic',      powerMult: 1.0, mpCost: 5  },
  II:  { name: 'Intensive',  powerMult: 1.3, mpCost: 8  },
  III: { name: 'Causative',  powerMult: 1.5, mpCost: 12 },
  IV:  { name: 'Transitive', powerMult: 1.7, mpCost: 15 },
  V:   { name: 'Reflexive',  powerMult: 1.4, mpCost: 10 },
  VI:  { name: 'Mutual',     powerMult: 1.6, mpCost: 14 },
  VII: { name: 'Passive',    powerMult: 1.2, mpCost: 7  },
  VIII:{ name: 'Derived',    powerMult: 1.8, mpCost: 18 },
  IX:  { name: 'Intensive',  powerMult: 1.3, mpCost: 9  },
  X:   { name: 'Seeking',    powerMult: 2.0, mpCost: 25 },
};
```

### 4.4 Enemy AI

Enemy AI uses pattern-based behavior influenced by the player's FSRS data. Enemies "target" words the player is weakest at.

```js
// src/game/systems/battle/EnemyAI.js

export class EnemyAI {
  constructor(enemyData, playerFSRS) {
    this.enemy = enemyData;
    this.fsrs = playerFSRS;
    this.pattern = enemyData.aiPattern || 'balanced';
  }

  /**
   * Decide enemy action based on AI pattern and battle state.
   * @param {Object} battleState - Current battle state from Redux
   * @returns {Object} Action descriptor
   */
  decide(battleState) {
    const patterns = {
      aggressive: this._aggressivePattern,
      defensive: this._defensivePattern,
      balanced: this._balancedPattern,
      adaptive: this._adaptivePattern,
      boss: this._bossPattern,
    };

    const patternFn = patterns[this.pattern] || patterns.balanced;
    return patternFn.call(this, battleState);
  }

  _aggressivePattern(state) {
    // 80% attack, 15% special, 5% defend
    const roll = Math.random();
    if (roll < 0.8) return this._basicAttack(state);
    if (roll < 0.95) return this._specialAttack(state);
    return this._defend();
  }

  _defensivePattern(state) {
    // Heal when low, defend often
    if (state.bossHP < state.maxBossHP * 0.3) return this._heal();
    const roll = Math.random();
    if (roll < 0.4) return this._defend();
    if (roll < 0.8) return this._basicAttack(state);
    return this._specialAttack(state);
  }

  _balancedPattern(state) {
    const roll = Math.random();
    if (roll < 0.5) return this._basicAttack(state);
    if (roll < 0.75) return this._specialAttack(state);
    if (roll < 0.9) return this._defend();
    return this._heal();
  }

  /**
   * Adaptive AI: targets the player's weakest vocabulary.
   * Uses FSRS data to select words the player struggles with,
   * then constructs prompts around those words.
   */
  _adaptivePattern(state) {
    // Find player's weakest words
    const weakWords = Object.entries(this.fsrs)
      .filter(([, card]) => card.card?.stability < 5)
      .sort((a, b) => (a[1].card?.stability || 0) - (b[1].card?.stability || 0))
      .slice(0, 5);

    if (weakWords.length > 0 && Math.random() < 0.6) {
      // Use a "quiz attack" targeting weak vocabulary
      return {
        type: 'quiz_attack',
        damage: this.enemy.baseDamage,
        targetWord: weakWords[Math.floor(Math.random() * weakWords.length)][0],
        intentText: 'The enemy targets your weak point!',
      };
    }

    return this._balancedPattern(state);
  }

  _bossPattern(state) {
    // Phase-based: changes behavior at HP thresholds
    const hpRatio = state.bossHP / state.maxBossHP;

    if (hpRatio > 0.7) {
      return this._balancedPattern(state);
    } else if (hpRatio > 0.3) {
      // Enrage phase: more aggressive, faster
      return this._aggressivePattern(state);
    } else {
      // Desperate phase: special attacks and heals
      if (Math.random() < 0.4) return this._heal();
      return this._specialAttack(state);
    }
  }

  _basicAttack(state) {
    return {
      type: 'attack',
      damage: this.enemy.baseDamage,
      enemyIndex: 0,
      intentText: `${this.enemy.nameArabic} attacks!`,
    };
  }

  _specialAttack(state) {
    return {
      type: 'special',
      damage: Math.floor(this.enemy.baseDamage * 1.5),
      element: this.enemy.element,
      enemyIndex: 0,
      intentText: `${this.enemy.nameArabic} uses a special attack!`,
    };
  }

  _defend() {
    return {
      type: 'defend',
      damage: 0,
      enemyIndex: 0,
      intentText: `${this.enemy.nameArabic} takes a defensive stance.`,
    };
  }

  _heal() {
    return {
      type: 'heal',
      damage: 0,
      healAmount: Math.floor(this.enemy.baseDamage * 0.5),
      enemyIndex: 0,
      intentText: `${this.enemy.nameArabic} recovers!`,
    };
  }
}
```

### 4.5 Status Effects System

Status effects use Arabic names and integrate with vocabulary learning. Applying a status effect requires knowing the Arabic word for it.

```js
// src/data/statusEffects.js

export const STATUS_EFFECTS = {
  // Offensive effects
  poison:    { arabic: 'سم',     turns: 3, dot: 5,  type: 'debuff' },
  burn:      { arabic: 'حرق',    turns: 3, dot: 8,  type: 'debuff' },
  bleed:     { arabic: 'نزيف',   turns: 2, dot: 6,  type: 'debuff' },

  // Defensive effects
  shield:    { arabic: 'درع',    turns: 3, dmgReduce: 0.5, type: 'buff' },
  regen:     { arabic: 'تجدد',   turns: 3, hot: 5,  type: 'buff' },

  // Control effects
  silence:   { arabic: 'صمت',    turns: 2, blockMagic: true, type: 'debuff' },
  slow:      { arabic: 'بطء',    turns: 2, speedReduce: 0.5, type: 'debuff' },
  confuse:   { arabic: 'حيرة',   turns: 1, scrambleChoices: true, type: 'debuff' },

  // Stat modifiers
  strength:  { arabic: 'قوة',    turns: 3, dmgBoost: 1.3, type: 'buff' },
  speed:     { arabic: 'سرعة',   turns: 3, speedBoost: 1.5, type: 'buff' },
  wisdom:    { arabic: 'حكمة',   turns: 3, xpBoost: 1.2, type: 'buff' },
  courage:   { arabic: 'شجاعة',  turns: 3, immuneFear: true, type: 'buff' },
  blessing:  { arabic: 'بركة',   turns: 3, dropBoost: 1.3, type: 'buff' },
  blindness: { arabic: 'عمى',    turns: 2, hideLetters: true, type: 'debuff' },
  fear:      { arabic: 'خوف',    turns: 2, dmgReduce: 0.7, type: 'debuff' },
};
```

### 4.6 Turn Order System

Phase 27 starts with strict turns (player then enemy). ATB mode is a configuration flag for Phase 32 expansion.

**Strict Turn Mode (default):**
1. Player turn
2. Enemy turn
3. Repeat

**ATB Mode (Phase 32):**
- Each combatant has a speed stat that fills an ATB gauge
- When gauge reaches 100%, that combatant acts next
- Vocabulary mastery level affects ATB fill speed (more mastered words = faster gauge)
- Speed status effects modify ATB rate

---

## 5. Battle UI -- React + Phaser Hybrid

### 5.1 Architecture Split

| Component | Rendered By | Reason |
|-----------|------------|--------|
| Arena background | Phaser | Static image, no interaction |
| Character sprites | Phaser | Animations, tweens, depth sorting |
| HP/MP bars | Phaser | Smooth easing, flash effects |
| Floating damage numbers | Phaser | Tweened text objects |
| Screen shake/flash | Phaser | Camera effects |
| Spell particles | Phaser | Particle emitters |
| **Battle menu** | **React** | Complex layout, Arabic text rendering, accessibility |
| **Arabic input field** | **React** | IME support, RTL text, virtual keyboard |
| **Combo counter** | **React** | Animated text with Framer Motion |
| **Enemy info popup** | **React** | Arabic name, element, status icons |
| **Turn order display** | **React** | Phase 32 ATB gauge readout |
| **Battle results** | **React** | Existing BattleResult.jsx pattern |

### 5.2 Battle Menu Component

```jsx
// src/components/Battle/BattleMenu.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';

const MENU_ACTIONS = [
  { id: 'attack',  label: 'Attack',  arabic: 'هجوم',   icon: 'ui-sword',  key: '1' },
  { id: 'magic',   label: 'Magic',   arabic: 'سحر',    icon: 'ui-star',   key: '2' },
  { id: 'item',    label: 'Item',    arabic: 'أداة',    icon: 'ui-health', key: '3' },
  { id: 'defend',  label: 'Defend',  arabic: 'دفاع',   icon: 'ui-shield', key: '4' },
  { id: 'flee',    label: 'Flee',    arabic: 'هروب',   icon: 'ui-arrows', key: '5' },
];

export default function BattleMenu({ visible, availableActions, onAction }) {
  if (!visible) return null;

  const handleAction = (actionId) => {
    EventBus.emit(EVENTS.BATTLE_ACTION_SELECTED, {
      action: actionId,
      target: 0,
    });
    onAction?.(actionId);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="battle-menu"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            direction: 'rtl',
            zIndex: 1000,
          }}
        >
          {MENU_ACTIONS.filter(a => availableActions.includes(a.id)).map(action => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              className="battle-menu-btn"
            >
              <span className="action-arabic">{action.arabic}</span>
              <span className="action-english">{action.label}</span>
              <kbd>{action.key}</kbd>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 5.3 Arabic Input Overlay

The Arabic input overlay is the core learning mechanic in battle. It appears when the player selects Attack or Magic, presenting an Arabic prompt that must be answered correctly to execute the action.

```jsx
// src/components/Battle/BattleArabicInput.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useFormatArabic } from '../../hooks/useFormatArabic.js';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';

export default function BattleArabicInput({ prompt, onSubmit }) {
  const [input, setInput] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(prompt?.timeLimit || 15000);
  const inputRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const formatArabic = useFormatArabic();

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
    startTimeRef.current = Date.now();
  }, [prompt]);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 100) {
          clearInterval(interval);
          handleSubmit('', true);
          return 0;
        }
        return prev - 100;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [prompt]);

  const handleSubmit = useCallback((value, isTimeout = false) => {
    const timeElapsed = Date.now() - startTimeRef.current;

    EventBus.emit(EVENTS.BATTLE_ARABIC_INPUT, {
      input: isTimeout ? '' : (value || input),
      wordId: prompt.word.id,
      accuracy: isTimeout ? 0 : calculateAccuracy(value || input, prompt.word),
      timeElapsed,
      element: prompt.word.element,
    });

    onSubmit?.();
    setInput('');
  }, [input, prompt, onSubmit]);

  if (!prompt) return null;

  // Render varies by difficulty
  return (
    <motion.div
      className="battle-input-overlay"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        position: 'absolute',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        direction: 'rtl',
        zIndex: 1001,
      }}
    >
      {/* Timer bar */}
      <div className="battle-timer-bar">
        <div
          className="battle-timer-fill"
          style={{ width: `${(timeRemaining / prompt.timeLimit) * 100}%` }}
        />
      </div>

      {/* Prompt */}
      {prompt.difficulty === 'choice' && (
        <div className="battle-choices">
          <p className="battle-prompt-text">
            {formatArabic(prompt.word.arabic)}
          </p>
          {prompt.choices.map((choice, idx) => (
            <button
              key={idx}
              onClick={() => handleSubmit(choice.value)}
              className="battle-choice-btn"
            >
              {choice.label}
            </button>
          ))}
        </div>
      )}

      {prompt.difficulty === 'type' && (
        <div className="battle-type-input">
          <p className="battle-prompt-text">
            {prompt.word.english}
          </p>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            placeholder="...اكتب بالعربية"
            dir="rtl"
            className="battle-arabic-input"
            autoComplete="off"
          />
          <button onClick={() => handleSubmit()} className="battle-submit-btn">
            Submit
          </button>
        </div>
      )}
    </motion.div>
  );
}

function calculateAccuracy(input, word) {
  if (!input || !word) return 0;
  const normalize = (s) => s.replace(/[\u064B-\u065F\u0670]/g, '').trim();
  const normalizedInput = normalize(input);
  const normalizedTarget = normalize(word.arabic);

  if (normalizedInput === normalizedTarget) return 1.0;

  // Levenshtein distance for partial credit
  const distance = levenshtein(normalizedInput, normalizedTarget);
  const maxLen = Math.max(normalizedInput.length, normalizedTarget.length);
  if (maxLen === 0) return 0;

  return Math.max(0, 1 - (distance / maxLen));
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) =>
    Array.from({ length: a.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
}
```

### 5.4 Combo Counter

```jsx
// src/components/Battle/ComboCounter.jsx
import { motion, AnimatePresence } from 'framer-motion';

export default function ComboCounter({ streak }) {
  if (streak < 2) return null;

  const tier = streak >= 10 ? 'legendary' : streak >= 5 ? 'epic' : streak >= 3 ? 'critical' : 'normal';

  return (
    <AnimatePresence>
      <motion.div
        key={streak}
        className={`combo-counter combo-${tier}`}
        initial={{ scale: 2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
        style={{
          position: 'absolute',
          top: '50%',
          right: '40px',
          direction: 'rtl',
          zIndex: 1002,
        }}
      >
        <span className="combo-number">{streak}</span>
        <span className="combo-label-arabic">سلسلة</span>
        <span className="combo-label">COMBO</span>
      </motion.div>
    </AnimatePresence>
  );
}
```

### 5.5 Battle Overlay Container

A parent React component wraps all battle UI and listens for EventBus signals from BattleScene.

```jsx
// src/components/Battle/BattleOverlay.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';
import BattleMenu from './BattleMenu.jsx';
import BattleArabicInput from './BattleArabicInput.jsx';
import ComboCounter from './ComboCounter.jsx';
import BattleResult from './BattleResult.jsx';

export default function BattleOverlay() {
  const [battleActive, setBattleActive] = useState(false);
  const [phase, setPhase] = useState('idle');
  const [availableActions, setAvailableActions] = useState([]);
  const [prompt, setPrompt] = useState(null);
  const [enemyAction, setEnemyAction] = useState(null);
  const [battleResult, setBattleResult] = useState(null);

  const streak = useSelector(s => s.battle.streak);

  useEffect(() => {
    const onBattleStarted = (config) => {
      setBattleActive(true);
      setPhase('intro');
      setBattleResult(null);
    };

    const onStateChanged = ({ to, actions }) => {
      setPhase(to);
      if (to === 'ACTION_SELECT' && actions) {
        setAvailableActions(actions);
      }
      if (to !== 'INPUT_PHASE') {
        setPrompt(null);
      }
    };

    const onPromptWord = (wordData) => {
      setPrompt(wordData);
    };

    const onEnemyAction = (data) => {
      setEnemyAction(data);
    };

    const onBattleEnded = (result) => {
      setBattleResult(result);
      setPhase('result');
    };

    EventBus.on(EVENTS.BATTLE_STARTED, onBattleStarted);
    EventBus.on(EVENTS.BATTLE_STATE_CHANGED, onStateChanged);
    EventBus.on(EVENTS.BATTLE_PROMPT_WORD, onPromptWord);
    EventBus.on(EVENTS.BATTLE_ENEMY_ACTION, onEnemyAction);
    EventBus.on(EVENTS.BATTLE_ENDED, onBattleEnded);

    return () => {
      EventBus.off(EVENTS.BATTLE_STARTED, onBattleStarted);
      EventBus.off(EVENTS.BATTLE_STATE_CHANGED, onStateChanged);
      EventBus.off(EVENTS.BATTLE_PROMPT_WORD, onPromptWord);
      EventBus.off(EVENTS.BATTLE_ENEMY_ACTION, onEnemyAction);
      EventBus.off(EVENTS.BATTLE_ENDED, onBattleEnded);
    };
  }, []);

  if (!battleActive) return null;

  return (
    <div className="battle-overlay-container" style={{ pointerEvents: 'none' }}>
      {/* Battle menu — visible during ACTION_SELECT phase */}
      <div style={{ pointerEvents: 'auto' }}>
        <BattleMenu
          visible={phase === 'ACTION_SELECT'}
          availableActions={availableActions}
          onAction={() => setPhase('waiting')}
        />
      </div>

      {/* Arabic input — visible during INPUT_PHASE */}
      <div style={{ pointerEvents: 'auto' }}>
        <BattleArabicInput
          prompt={phase === 'INPUT_PHASE' ? prompt : null}
          onSubmit={() => setPhase('resolving')}
        />
      </div>

      {/* Combo counter — always visible when streak > 1 */}
      <ComboCounter streak={streak} />

      {/* Enemy action intent */}
      {phase === 'ENEMY_TURN' && enemyAction && (
        <div className="enemy-intent" style={{ pointerEvents: 'none' }}>
          <p>{enemyAction.intent}</p>
        </div>
      )}

      {/* Battle result */}
      {phase === 'result' && battleResult && (
        <div style={{ pointerEvents: 'auto' }}>
          <BattleResult
            victory={battleResult.victory}
            bossId={battleResult.bossId}
            onClose={() => {
              setBattleActive(false);
              setPhase('idle');
            }}
          />
        </div>
      )}
    </div>
  );
}
```

---

## 6. Integration with Redux

### 6.1 Expanded battleSlice

The existing `battleSlice.js` needs expansion to support the new systems. The current slice stores basic HP/streak/history. The expanded version adds turn state, active effects, combo tracking, and companion support.

```js
// src/store/slices/battleSlice.js — expanded initialState

const initialState = {
  // --- Existing (preserved) ---
  activeBattle: null,
  playerHP: 100,
  bossHP: 0,
  maxBossHP: 0,
  currentRound: 0,
  streak: 0,
  bossesDefeated: [],
  battleHistory: [],
  hintsUsed: 0,

  // --- New for v6.0 ---
  playerMaxHP: 100,
  playerMP: 50,
  playerMaxMP: 50,

  // Turn tracking
  turnCount: 0,
  currentTurn: null,         // 'player' | 'enemy' | 'companion'
  isPlayerDefending: false,

  // Active status effects
  playerEffects: [],          // [{ id, remainingTurns, ... }]
  enemyEffects: [],

  // Combo system
  grammarCombo: 0,            // Consecutive grammar-correct answers
  maxStreak: 0,               // Highest streak this battle
  wordsUsed: [],              // Word IDs used in this battle (for FSRS)

  // Battle metadata
  encounterType: null,        // 'random' | 'story' | 'boss' | 'arena'
  battleZone: null,           // Zone where battle started
  battleStartTimestamp: null,

  // Enemy details (cached from data for quick access)
  enemyData: null,            // { id, name, nameArabic, element, ... }
};
```

### 6.2 New Reducers

```js
// Key new reducers to add to battleSlice

reducers: {
  // ...existing reducers preserved...

  setPlayerDefending(state, action) {
    state.isPlayerDefending = action.payload;
  },

  applyStatusEffect(state, action) {
    // payload: { target: 'player'|'enemy', effect: { id, remainingTurns, ... } }
    const { target, effect } = action.payload;
    const list = target === 'player' ? state.playerEffects : state.enemyEffects;
    // Remove existing instance of same effect (no stacking)
    const filtered = list.filter(e => e.id !== effect.id);
    filtered.push(effect);
    if (target === 'player') {
      state.playerEffects = filtered;
    } else {
      state.enemyEffects = filtered;
    }
  },

  tickStatusEffects(state) {
    // Reduce remaining turns, remove expired
    state.playerEffects = state.playerEffects
      .map(e => ({ ...e, remainingTurns: e.remainingTurns - 1 }))
      .filter(e => e.remainingTurns > 0);
    state.enemyEffects = state.enemyEffects
      .map(e => ({ ...e, remainingTurns: e.remainingTurns - 1 }))
      .filter(e => e.remainingTurns > 0);
  },

  spendMP(state, action) {
    state.playerMP = Math.max(0, state.playerMP - action.payload);
  },

  restoreMP(state, action) {
    state.playerMP = Math.min(state.playerMaxMP, state.playerMP + action.payload);
  },

  recordWordUsed(state, action) {
    const wordId = action.payload;
    if (!state.wordsUsed.includes(wordId)) {
      state.wordsUsed.push(wordId);
    }
  },

  updateMaxStreak(state) {
    if (state.streak > state.maxStreak) {
      state.maxStreak = state.streak;
    }
  },

  incrementTurn(state) {
    state.turnCount++;
  },
}
```

### 6.3 Battle Results -> playerSlice

When battle ends, rewards flow back into the player state:

```js
// In BattleStateMachine._calculateRewards()
_calculateRewards(victory) {
  const state = store.getState().battle;

  const accuracy = state.currentRound > 0
    ? state.wordsUsed.length / state.currentRound
    : 0;

  const timeElapsed = Date.now() - state.battleStartTimestamp;

  if (!victory) {
    return {
      victory: false,
      accuracy,
      timeElapsed,
      rewards: { xp: Math.floor(state.currentRound * 5), dirhams: 0 },
      bossId: state.activeBattle,
    };
  }

  // Victory rewards scale with performance
  const baseXP = this.config.rewards?.xp || 100;
  const baseDirhams = this.config.rewards?.dirhams || 50;

  const streakBonus = 1 + (state.maxStreak * 0.05);
  const accuracyBonus = 1 + (accuracy * 0.3);

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
```

### 6.4 FSRS Integration

Every word used in battle counts as a review in the FSRS spaced repetition system. This means battle IS study.

```js
// Called after each Arabic input resolution in BattleStateMachine

_updateFSRS(wordId, wasCorrect) {
  const fsrsCards = store.getState().vocabulary.fsrsCards;

  // Create card if first encounter
  if (!fsrsCards[wordId]) {
    store.dispatch(addFsrsCard({
      wordId,
      card: createNewCard(),
    }));
  }

  // Rate based on accuracy
  const rating = wasCorrect ? Rating.Good : Rating.Again;
  const currentCard = fsrsCards[wordId]?.card || createNewCard();
  const result = reviewCard(currentCard, rating);

  store.dispatch(updateFsrsCard({
    wordId,
    card: result.card,
    log: result.log,
  }));

  // Track word as used in this battle
  store.dispatch(recordWordUsed(wordId));
}
```

---

## 7. Sound Design Integration

### 7.1 Battle SFX Registry

All battle sounds use the existing `AudioManager.playSFX()` method. New SFX names are added to the registry.

```
File path convention: /assets/audio/sfx/sfx-{name}.ogg

Required battle SFX (25 sounds):
  ──────────────────────────────────────────────
  Physical combat:
    battle-start         — Battle initiation whoosh
    attack-swing         — Melee attack swing
    attack-hit           — Physical impact
    attack-miss          — Whiff sound
    defend-block         — Shield/guard sound
    critical-hit         — Impactful slam + glass shatter

  Magic/spells:
    spell-cast           — Generic casting start (energy gather)
    spell-fire           — Fire element impact
    spell-water          — Water splash/wave
    spell-earth          — Rumble/ground impact
    spell-wind           — Gust/whoosh
    spell-light          — Bright chime/bell
    spell-shadow         — Dark swoosh/whisper
    spell-time           — Clock tick + reverb
    spell-knowledge      — Page turn + shimmer
    spell-creation       — Hammer/crafting ping
    spell-protection     — Shield energy hum

  Feedback:
    battle-correct       — Correct Arabic answer (reuse sfx-correct)
    battle-wrong         — Wrong answer (reuse sfx-wrong)
    combo-increment      — Combo counter tick up
    combo-break          — Combo broken sound

  Outcomes:
    battle-victory       — Victory fanfare (short, ambient-style)
    battle-defeat        — Defeat sting (somber tone)
    enemy-defeat         — Enemy collapse/fade
    item-use             — Potion/item use sound

  Ambient:
    battle-ambient-desert  — Desert wind + distant sounds (loops)
    battle-ambient-forest  — Forest wildlife + wind (loops)
    battle-ambient-cave    — Dripping water + echoes (loops)
```

### 7.2 Sound Triggering Pattern

Sounds are triggered from BattleScene and BattleStateMachine using the existing `audioManager` singleton. No Phaser audio is used — all audio goes through Howler.js.

```js
// Direct import in Phaser scene files (same pattern as Player.js)
import { audioManager } from '../../services/audio.js';

// In BattleStateMachine:
_animateHit() {
  // ...animation code...
  audioManager.playSFX('attack-hit');
  audioManager.playSFX('battle-correct');
}

// In BattleEffectManager:
playSpellEffect(element, x, y, onComplete) {
  audioManager.playSFX(`spell-${element}`);
  // ...particle code...
}

// On battle start:
_playIntro() {
  audioManager.playSFX('battle-start');
  // Play zone-specific battle ambient
  const zone = this.config.zone;
  const ambientMap = {
    oasis_village: 'desert',
    desert_ruins: 'desert',
    forest_grove: 'forest',
    mountain_pass: 'cave',
    ice_cavern: 'cave',
  };
  const ambientType = ambientMap[zone] || 'desert';
  audioManager.playAmbient(`battle-${ambientType}`);
}
```

### 7.3 Battle Ambient Audio

Battle transitions from zone ambient to battle-specific ambient. On battle end, zone ambient resumes.

```
Entry:  Zone ambient fades out (500ms) -> Battle ambient fades in (500ms)
Exit:   Battle ambient fades out (500ms) -> Zone ambient fades in (500ms)
```

This uses the existing `audioManager.playAmbient()` crossfade mechanism.

---

## 8. Performance Considerations

### 8.1 Object Pooling

The following objects are pooled to prevent GC pressure during battle:

| Object Type | Pool Size | Reason |
|------------|-----------|--------|
| Damage number texts | 20 | Multi-hit combos can spawn many simultaneously |
| Particle emitters | 10 | Spell effects reuse emitters |
| Tween targets | 20 | Reuse completed tweens |

### 8.2 Sprite Atlas Management

Battle assets are loaded on-demand in `BattleScene.preload()`, NOT in `BootScene.preload()`. This keeps the initial game load fast.

```
Load on boot (BootScene):
  - All overworld sprites (player, NPCs, objects, UI)
  - Tilesets
  - ~2MB total

Load on battle entry (BattleScene.preload):
  - Enemy battle sprite for this encounter
  - Player battle sprite (based on current outfit)
  - Spell atlas (if not already cached)
  - Battle backgrounds (if not already cached)
  - ~500KB per battle (cached after first load)
```

### 8.3 Memory Cleanup on Scene Exit

BattleScene's `shutdown()` must aggressively clean up:

```js
shutdown() {
  // 1. Remove EventBus listeners (prevent leaks)
  EventBus.off(EVENTS.BATTLE_ACTION_SELECTED, this.onActionSelected, this);
  EventBus.off(EVENTS.BATTLE_ARABIC_INPUT, this.onArabicInput, this);
  EventBus.off(EVENTS.BATTLE_FLEE_REQUESTED, this.onFleeRequested, this);

  // 2. Destroy subsystems (each cleans own timers/tweens/sprites)
  this.stateMachine?.destroy();
  this.arena?.destroy();
  this.sprites?.destroy();
  this.effects?.destroy();
  this.hud?.destroy();
  this.damagePool?.destroy();

  // 3. Null references
  this.stateMachine = null;
  this.arena = null;
  this.sprites = null;
  this.effects = null;
  this.hud = null;
  this.damagePool = null;
  this.screenShake = null;
  this.battleConfig = null;

  // 4. Clear any lingering scene timers
  this.time.removeAllEvents();

  // 5. Stop all tweens
  this.tweens.killAll();

  // Note: battle-specific textures are NOT unloaded here.
  // They stay in the Phaser texture cache for reuse if player
  // re-encounters the same enemy. Cache is cleared only on
  // full game restart or explicit cache purge.
}
```

### 8.4 Frame Budget

Target: 60fps throughout battle, including spell animations.

| Phase | Budget | Expected Load |
|-------|--------|---------------|
| Idle animation | <1ms | Sprite anim update only |
| Player action | <2ms | Sprite + tween + particles |
| Spell effect | <4ms | Particles + screen effects |
| Damage numbers | <1ms | Pool text position update |
| HUD update | <1ms | Bar width interpolation |
| FSM update | <0.5ms | State check + transition |
| **Total per frame** | **<10ms** | **Well within 16.6ms budget** |

### 8.5 Reduced Motion Support

Every visual system checks `prefers-reduced-motion`:

- Particles: skip emission, immediate callback
- Screen shake: skip
- Screen flash: skip
- Hit-stop: skip
- Damage numbers: show without animation, auto-hide after delay
- Sprite animations: still play (core feedback), but at normal speed (no slow-mo)

---

## 9. Migration Path from WordDuel

### 9.1 Phase 1: Parallel Systems (Week 1-2)

Both WordDuel and BattleScene exist. Story bosses use the new BattleScene. Random encounters continue using WordDuel. This allows incremental testing.

```js
// In battle trigger code:
if (encounter.type === 'boss' || encounter.type === 'story') {
  // New Phaser BattleScene
  sceneStackManager.pushScene('BattleScene', encounter);
} else {
  // Legacy WordDuel React overlay
  EventBus.emit(EVENTS.QUIZ_OPEN, { bossId: encounter.enemyId });
}
```

### 9.2 Phase 2: Full Migration (Week 3-4)

All encounters use BattleScene. WordDuel is deprecated but kept in source for reference. The `useBattle` hook logic is migrated into `BattleStateMachine` (word selection, damage calculation, FSRS updates).

### 9.3 Phase 3: Cleanup (Week 5)

Remove `WordDuel.jsx`, `WordDuel.module.css`, and `useBattle.js`. Update all references. The `BattleResult.jsx` component is preserved and reused by `BattleOverlay`.

---

## 10. File Structure

```
src/game/
  scenes/
    BattleScene.js                    # Main battle scene
  systems/
    battle/
      BattleStateMachine.js           # Turn flow FSM
      BattleArena.js                  # Background, stage layout
      BattleSpriteManager.js          # Combatant sprites + animations
      BattleEffectManager.js          # Spell VFX, screen flash, hit-stop
      BattleHUDManager.js             # HP/MP bars (Phaser-rendered)
      BattleDamagePool.js             # Object pool for floating numbers
      BattleDamageCalculator.js       # Damage formula
      EnemyAI.js                      # AI behavior patterns
      StatusEffectEngine.js           # Buff/debuff tick logic

src/components/
  Battle/
    BattleOverlay.jsx                 # Parent container for all React battle UI
    BattleMenu.jsx                    # Action selection menu
    BattleArabicInput.jsx             # Arabic input prompt
    ComboCounter.jsx                  # Streak counter
    BattleResult.jsx                  # (existing) Victory/defeat screen

src/store/
  slices/
    battleSlice.js                    # (expanded) Battle state

src/data/
  rootMagic.js                        # Root-to-element mapping
  statusEffects.js                    # Status effect definitions
  enemies.js                          # Enemy stat data
  eventBusTypes.js                    # (expanded) Battle event constants

src/hooks/
  useBattleOverlay.js                 # Hook for React battle UI state

assets/
  sprites/battle/
    player/                           # Player battle spritesheets (per outfit)
    enemies/                          # Enemy battle spritesheets
    spells/
      spell-atlas.png                 # Sprite atlas for spell effects
      spell-atlas.json                # Atlas JSON descriptor
  backgrounds/
    battle/                           # Battle arena backgrounds (per zone)
  audio/
    sfx/
      sfx-battle-start.ogg
      sfx-attack-swing.ogg
      sfx-attack-hit.ogg
      sfx-attack-miss.ogg
      sfx-defend-block.ogg
      sfx-critical-hit.ogg
      sfx-spell-cast.ogg
      sfx-spell-fire.ogg
      sfx-spell-water.ogg
      sfx-spell-earth.ogg
      sfx-spell-wind.ogg
      sfx-spell-light.ogg
      sfx-spell-shadow.ogg
      sfx-spell-time.ogg
      sfx-spell-knowledge.ogg
      sfx-spell-creation.ogg
      sfx-spell-protection.ogg
      sfx-combo-increment.ogg
      sfx-combo-break.ogg
      sfx-battle-victory.ogg
      sfx-battle-defeat.ogg
      sfx-enemy-defeat.ogg
      sfx-item-use.ogg
    ambient/
      ambient-battle-desert.mp3
      ambient-battle-forest.mp3
      ambient-battle-cave.mp3
```

---

## 11. Open Questions

### Design Decisions Pending

1. **ATB vs Strict Turns**: Phase 27 starts with strict turns. ATB adds complexity. Should ATB be deferred entirely to Phase 32, or should the infrastructure be wired in Phase 27 with a feature flag?

2. **Battle Sprite Art Pipeline**: 256x256 battle sprites with 32 frames each = 2048x1024 per character. With 12 player outfits + 6 head coverings, that is 72 spritesheets just for the player. Should battle sprites be decoupled from the outfit system (single "battle robe" per character class) to reduce art workload?

3. **Companion Battle Positioning**: When companions join in Phase 30, do they occupy a fixed position on the battle stage, or is there a formation system? The BattleSpriteManager needs to know the max party size for layout calculations.

4. **Multi-Enemy Layout**: Phase 32 adds up to 4 enemies. How should they be positioned? Horizontal line? 2x2 grid? Staggered depth? This affects sprite depth sorting and targeting UI.

5. **Magic Menu Depth**: Does the Magic submenu show all learned spells, or is it filtered by equipped "spell loadout"? A loadout system adds complexity but prevents overwhelming the player.

6. **Flee Mechanic**: Should fleeing require answering an Arabic question correctly (as described in EXPANSION-COMBAT-RPG.md), or should it be a simple probability check? Arabic-gated fleeing reinforces learning but may frustrate players in unwinnable encounters.

7. **Battle Encounter Frequency**: For random encounters, what is the step counter / probability? Too frequent breaks exploration flow. Too rare makes the system feel vestigial. This needs playtesting data.

8. **Save During Battle**: Can players save mid-battle? If so, the entire BattleStateMachine state must be serializable in the Redux persist whitelist. If not, the game must warn players that progress will be lost.

### Technical Risks

1. **Hit-stop via timeScale=0**: Setting Phaser's `time.timeScale` to 0 freezes the scene clock. If any async callbacks depend on scene time (rather than raw `setTimeout`), they will hang. All hit-stop exit paths must use `setTimeout`, not `scene.time.delayedCall`.

2. **React-Phaser state sync**: The BattleScene reads Redux directly but modifies it via `store.dispatch()`. If React re-renders during an animation sequence, it could show intermediate states. Solution: batch Redux updates and emit `BATTLE_TURN_RESOLVED` only after all animations complete.

3. **Arabic IME handling**: Mobile Arabic keyboards with predictive text may fire multiple input events per character. The `BattleArabicInput` component must debounce submissions and handle composition events properly.

4. **Texture memory on mobile**: Loading battle sprites on top of overworld sprites may exceed mobile GPU memory limits. Consider unloading overworld textures while BattleScene is active (since WorldScene is paused) and reloading on resume.

5. **EventBus listener cleanup**: BattleScene registers listeners in `create()` and removes them in `shutdown()`. If `shutdown()` is not called (e.g., scene crash), listeners leak. Consider adding a safety sweep in WorldScene's `resume` handler.

---

## References

- Existing codebase patterns referenced:
  - `/src/game/systems/SceneStackManager.js` — push/pop scene pattern
  - `/src/game/systems/ScreenShake.js` — camera shake + reduced motion
  - `/src/game/systems/ParticleEffectManager.js` — particle burst/continuous + auto-cleanup
  - `/src/game/scenes/BootScene.js` — asset loading + scene lifecycle
  - `/src/game/scenes/WorldScene.js` — subsystem delegation pattern
  - `/src/game/scenes/InteriorScene.js` — push/pop scene consumer pattern
  - `/src/services/audio.js` — AudioManager singleton (Howler.js)
  - `/src/utils/eventBusTypes.js` — EVENTS constant registry
  - `/src/store/slices/battleSlice.js` — existing battle state
  - `/src/components/Battle/WordDuel.jsx` — current battle UI (migration source)
  - `/src/hooks/useBattle.js` — current battle logic (migration source)
  - `/src/game/sprites/Player.js` — sprite compositing, animation pattern
  - `/src/game/sprites/NPC.js` — NPC sprite, idle animation pattern
  - `/src/game/config.js` — Phaser game configuration
  - `/.planning/research/EXPANSION-COMBAT-RPG.md` — expansion plan context
