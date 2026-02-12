/**
 * BattleEffectManager.js — Spell VFX, screen flash, and hit-stop.
 *
 * Each of the 10 Arabic root elements has distinct particle configurations.
 * Reuses the lazy particle-dot texture pattern from ParticleEffectManager.
 * Respects prefers-reduced-motion for accessibility.
 */

// Element-specific particle configurations
const ELEMENT_CONFIGS = {
  fire: {
    tint: 0xff4500,
    speed: { min: 80, max: 200 },
    lifespan: 600,
    scale: { start: 1.2, end: 0 },
    gravityY: -120,
    count: 30,
    screenFlash: true,
    screenFlashColor: 0xff6600,
    screenFlashDuration: 80,
  },
  water: {
    tint: 0x4169e1,
    speed: { min: 40, max: 120 },
    lifespan: 800,
    scale: { start: 0.8, end: 0 },
    gravityY: 60,
    count: 25,
    screenFlash: false,
  },
  earth: {
    tint: 0x8b4513,
    speed: { min: 100, max: 250 },
    lifespan: 500,
    scale: { start: 1.5, end: 0 },
    gravityY: 200,
    angle: { min: 240, max: 300 },
    count: 35,
    screenFlash: true,
    screenFlashColor: 0x8b4513,
    screenFlashDuration: 100,
  },
  wind: {
    tint: 0x98fb98,
    speed: { min: 60, max: 180 },
    lifespan: 700,
    scale: { start: 0.6, end: 0 },
    count: 20,
    screenFlash: false,
  },
  light: {
    tint: 0xffd700,
    speed: { min: 100, max: 300 },
    lifespan: 500,
    scale: { start: 1.0, end: 0 },
    count: 40,
    screenFlash: true,
    screenFlashColor: 0xffffff,
    screenFlashDuration: 60,
  },
  shadow: {
    tint: 0x4b0082,
    speed: { min: 20, max: 80 },
    lifespan: 1000,
    scale: { start: 0.4, end: 1.2 },
    count: 25,
    screenFlash: true,
    screenFlashColor: 0x000000,
    screenFlashDuration: 120,
  },
  time: {
    tint: 0xc0c0c0,
    speed: { min: 30, max: 90 },
    lifespan: 900,
    scale: { start: 0.5, end: 0.5 },
    count: 20,
    screenFlash: false,
  },
  knowledge: {
    tint: 0x00ced1,
    speed: { min: 50, max: 140 },
    lifespan: 700,
    scale: { start: 0.6, end: 0 },
    count: 30,
    screenFlash: true,
    screenFlashColor: 0x00ced1,
    screenFlashDuration: 80,
  },
  creation: {
    tint: 0xffffe0,
    speed: { min: 40, max: 100 },
    lifespan: 1000,
    scale: { start: 0.3, end: 0.8 },
    count: 25,
    screenFlash: true,
    screenFlashColor: 0xffffff,
    screenFlashDuration: 100,
  },
  protection: {
    tint: 0x32cd32,
    speed: { min: 20, max: 60 },
    lifespan: 800,
    scale: { start: 0.8, end: 0.4 },
    count: 20,
    screenFlash: false,
  },
};

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
   * @param {string} element - One of the 10 element names
   * @param {number} x - Target X
   * @param {number} y - Target Y
   * @param {Function} onComplete - Callback when effect finishes
   */
  playSpellEffect(element, x, y, onComplete) {
    if (this.reduceMotion) {
      onComplete?.();
      return;
    }

    const config = ELEMENT_CONFIGS[element];
    if (!config) {
      onComplete?.();
      return;
    }

    this._ensureTexture();

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

    if (config.screenFlash) {
      this.screenFlash(config.screenFlashColor, config.screenFlashDuration);
    }

    const timer = this.scene.time.delayedCall(config.lifespan + 200, () => {
      emitter.destroy();
      this._removeTimer(timer);
      onComplete?.();
    });
    this.pendingTimers.push(timer);
  }

  /**
   * Screen flash: brief colored rectangle overlay that fades out.
   * @param {number} color - Hex color (e.g. 0xFFFFFF)
   * @param {number} duration - Duration in ms
   */
  screenFlash(color = 0xffffff, duration = 100) {
    if (this.reduceMotion) return;

    const { width, height } = this.scene.cameras.main;
    const flash = this.scene.add
      .rectangle(width / 2, height / 2, width, height, color, 0.6)
      .setScrollFactor(0)
      .setDepth(9998);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });
  }

  /**
   * Hit-stop: freeze scene time for N frames to emphasize impact.
   * Uses raw setTimeout since scene time is paused.
   * @param {number} frames - Number of frames to freeze (2-6 typical)
   */
  hitStop(frames = 3) {
    if (this.reduceMotion) return;

    const durationMs = frames * (1000 / 60);

    this.scene.time.timeScale = 0;
    this.scene.tweens.timeScale = 0;
    this.scene.anims.globalTimeScale = 0;

    setTimeout(() => {
      if (this.scene?.sys?.isActive()) {
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
