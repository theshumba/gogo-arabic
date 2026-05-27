/**
 * Phase 102 — Plan 06 GREEN (was Plan 01 RED scaffold)
 *
 * Covers OBS-05 (Phaser perf overlay, 1Hz update, zero cost when off).
 *
 * Asserts the PerfOverlay class (`src/game/ui/PerfOverlay.js`):
 *
 *   - Constructor adds a `scene.time.addEvent` with delay: 1000 (1Hz cadence,
 *     not per-frame — that's the "<=1ms/frame" budget enforcement).
 *   - update() reads scene.game.loop.actualFps, scene.game.loop.delta, and
 *     scene.game.renderer.drawCount (WebGL field).
 *   - update() typeof-guards `performance.memory` so it does NOT throw on
 *     Firefox/Safari (where it's undefined).
 *   - destroy() removes the timer AND destroys the text object.
 *
 * Status: GREEN — Plan 102-06 implemented PerfOverlay.js. The original hard RED
 * gate (`throw new Error('not implemented')`) has been removed now that the
 * module ships.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function makeScene({ fps = 60, delta = 16.6, drawCount = 42 } = {}) {
  const text = {
    setScrollFactor: vi.fn(function () { return this; }),
    setDepth: vi.fn(function () { return this; }),
    setText: vi.fn(),
    destroy: vi.fn(),
  };
  const timer = { remove: vi.fn() };
  const scene = {
    add: { text: vi.fn(() => text) },
    time: { addEvent: vi.fn(() => timer) },
    game: {
      loop: { actualFps: fps, delta },
      renderer: { drawCount },
    },
    _text: text,
    _timer: timer,
  };
  return scene;
}

describe('PerfOverlay (OBS-05, Plan 06)', () => {
  let PerfOverlay;

  beforeEach(async () => {
    vi.resetModules();
    // RED: this throws until Plan 06 creates the module.
    ({ PerfOverlay } = await import('../PerfOverlay.js'));
  });

  it('OBS-05: constructor schedules a 1Hz timer (delay: 1000) — NOT a per-frame update', () => {
    const scene = makeScene();
    // eslint-disable-next-line no-new
    new PerfOverlay(scene);
    expect(scene.time.addEvent).toHaveBeenCalledTimes(1);
    const [config] = scene.time.addEvent.mock.calls[0];
    expect(config.delay).toBe(1000);
    expect(config.loop).toBe(true);
  });

  it('OBS-05: update() reads actualFps, delta, and drawCount', () => {
    const scene = makeScene({ fps: 59.42, delta: 16.81, drawCount: 73 });
    const overlay = new PerfOverlay(scene);
    overlay.update();
    expect(scene._text.setText).toHaveBeenCalled();
    const rendered = scene._text.setText.mock.calls.at(-1)[0];
    expect(rendered).toMatch(/59\.4/);
    expect(rendered).toMatch(/16\.8/);
    expect(rendered).toMatch(/73/);
  });

  it('OBS-05 cross-browser: update() does NOT throw when performance.memory is undefined (Firefox/Safari path)', () => {
    const scene = makeScene();
    const overlay = new PerfOverlay(scene);
    // Simulate Firefox/Safari: `performance` defined but `.memory` absent.
    // jsdom's `performance` is non-configurable, so use `vi.stubGlobal` (which
    // Vitest restores via `unstubAllGlobals`) instead of `Object.defineProperty`.
    vi.stubGlobal('performance', { now: () => 0 });
    try {
      expect(() => overlay.update()).not.toThrow();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  afterEach(() => {
    // Defensive: ensure no stubbed globals leak into other tests.
    vi.unstubAllGlobals();
  });

  it('OBS-05: destroy() removes the timer and destroys the text', () => {
    const scene = makeScene();
    const overlay = new PerfOverlay(scene);
    overlay.destroy();
    expect(scene._timer.remove).toHaveBeenCalledTimes(1);
    expect(scene._text.destroy).toHaveBeenCalledTimes(1);
  });
});
