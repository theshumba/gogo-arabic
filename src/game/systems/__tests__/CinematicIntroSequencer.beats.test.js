import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Regression tests for the cinematic-intro beat chain (2026-07-03).
 *
 * Root cause of the "fresh save frozen at boot" bug: run() called
 * cameras.main.fadeIn(duration, r, g, b, false, callback) — but Phaser's
 * Camera.fadeIn has NO force parameter (fadeIn(duration, r, g, b, callback,
 * context), Camera.js:286). The `false` occupied the callback slot, the real
 * callback landed in `context`, and the completion hook never fired: no dawn
 * tint, no text crawl, no camera pan, no floating word — and the PLAYER_FREEZE
 * emitted at the top of run() was never balanced by Beat 3's PLAYER_UNFREEZE.
 *
 * The mock camera below implements Phaser's REAL signatures so any future
 * argument-position drift fails here instead of soft-locking new players.
 */

vi.mock('../../../utils/arabicText.js', () => ({
  createArabicText: vi.fn(() => makeTextObj()),
}));

function makeTextObj() {
  const obj = {
    setOrigin: () => obj,
    setScrollFactor: () => obj,
    setDepth: () => obj,
    setAlpha: () => obj,
    setData: () => obj,
    getData: () => undefined,
    destroy: vi.fn(),
  };
  return obj;
}

function makeScene() {
  const scheduled = []; // { delay, cb }
  const tweens = [];    // configs passed to tweens.add
  const camera = {
    width: 1280,
    height: 800,
    // Phaser Camera.js:286 — fadeIn(duration, red, green, blue, callback, context)
    fadeIn(duration, red, green, blue, callback) {
      camera._fadeCallback = typeof callback === 'function' ? callback : null;
      return camera;
    },
    // Phaser Camera.js — pan(x, y, duration, ease, force, callback, context)
    pan(x, y, duration, ease, force, callback) {
      camera._panCallback = typeof callback === 'function' ? callback : null;
      camera._panTarget = { x, y };
      return camera;
    },
    centerOn: vi.fn(),
    _fadeCallback: null,
    _panCallback: null,
  };
  return {
    cameras: { main: camera },
    input: {
      once: vi.fn(),
      keyboard: { once: vi.fn(), off: vi.fn() },
    },
    time: {
      delayedCall(delay, cb) {
        const t = { delay, cb, remove: vi.fn() };
        scheduled.push(t);
        return t;
      },
    },
    tweens: {
      add(config) {
        tweens.push(config);
        return config;
      },
    },
    add: { text: () => makeTextObj() },
    events: { on: vi.fn(), off: vi.fn() },
    dayNightCycle: { overlay: { setFillStyle: vi.fn(), setAlpha: vi.fn() } },
    playerController: { getPlayer: () => ({ x: 0, y: 0 }) },
    _scheduled: scheduled,
    _tweens: tweens,
  };
}

describe('CinematicIntroSequencer beat chain', () => {
  let CinematicIntroSequencer;

  beforeEach(async () => {
    vi.resetModules();
    ({ CinematicIntroSequencer } = await import('../CinematicIntroSequencer.js'));
  });

  it('run() passes a FUNCTION in fadeIn’s callback slot (Phaser signature has no force param)', () => {
    const scene = makeScene();
    const seq = new CinematicIntroSequencer(scene);
    seq.run();
    expect(scene.cameras.main._fadeCallback).toBeTypeOf('function');
  });

  it('fade-in completion schedules the text crawl (Beat 1)', () => {
    const scene = makeScene();
    const seq = new CinematicIntroSequencer(scene);
    seq.run();
    // simulate Phaser completing the fade
    scene.cameras.main._fadeCallback?.(scene.cameras.main, 1);
    // 10 crawl lines + 1 fade-out timer
    expect(scene._scheduled.length).toBeGreaterThanOrEqual(11);
    // dawn tint applied
    expect(scene.dayNightCycle.overlay.setFillStyle).toHaveBeenCalledWith(0xffdca8);
  });

  it('crawl fade-out starts the camera pan toward spawn (Beat 2)', () => {
    const scene = makeScene();
    const seq = new CinematicIntroSequencer(scene);
    seq.run();
    scene.cameras.main._fadeCallback?.(scene.cameras.main, 1);
    // fire every scheduled crawl timer (lines + fade-out trigger)
    for (const t of [...scene._scheduled]) t.cb();
    // the fade-out tween completes → pan starts
    for (const tw of [...scene._tweens]) tw.onComplete?.();
    expect(scene.cameras.main._panCallback).toBeTypeOf('function');
    expect(scene.cameras.main._panTarget).toEqual({ x: 20 * 64, y: 18 * 64 });
  });
});
