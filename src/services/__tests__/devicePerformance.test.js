/**
 * Phase 102 — Plan 07 RED scaffold
 *
 * Covers OBS-06 (10-second warmup FPS sampler → setLowEndFlag).
 *
 * Asserts the `devicePerformance` service (Plan 07 will create
 * `src/services/devicePerformance.js`):
 *
 *   - Collects FPS samples over a 10s warmup window (40 samples @ 250ms).
 *   - Dispatches { isLowEnd: true, avgFps, sampleCount } when avg < 45.
 *   - Dispatches { isLowEnd: false } when avg >= 45 AND deviceMemory >= 4.
 *   - Treats `navigator.deviceMemory === undefined` (Firefox/Safari) as
 *     "not low-end" via the Infinity fallback per RESEARCH Pitfall 4.
 *
 * RED: importing '../devicePerformance.js' throws MODULE_NOT_FOUND until
 * Plan 07 creates the module + the devicePerformanceSlice action.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the slice so we can inspect the dispatched action shape without
// requiring the slice module to exist yet.
vi.mock('../../store/slices/devicePerformanceSlice.js', () => ({
  setLowEndFlag: vi.fn((payload) => ({
    type: 'devicePerformance/setLowEndFlag',
    payload,
  })),
}));

function makeGame(fpsSequence) {
  let i = 0;
  return {
    loop: {
      get actualFps() {
        const v = fpsSequence[Math.min(i, fpsSequence.length - 1)];
        i += 1;
        return v;
      },
    },
  };
}

function makeStore() {
  return { dispatch: vi.fn(), getState: vi.fn(() => ({})) };
}

const ORIGINAL_NAV = globalThis.navigator;

describe('devicePerformance warmup sampler (OBS-06)', () => {
  let startWarmupSampler;

  beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();
    // RED: this import throws MODULE_NOT_FOUND until Plan 07 creates the module.
    ({ startWarmupSampler } = await import('../devicePerformance.js'));
  });

  afterEach(() => {
    vi.useRealTimers();
    // Restore navigator across tests.
    Object.defineProperty(globalThis, 'navigator', {
      value: ORIGINAL_NAV,
      configurable: true,
    });
  });

  it('OBS-06 low-end: after 10s of ~30fps samples on a 2GB device, dispatches setLowEndFlag({ isLowEnd: true, avgFps < 45, sampleCount: 40 })', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { ...ORIGINAL_NAV, deviceMemory: 2 },
      configurable: true,
    });

    const game = makeGame(Array(60).fill(30));
    const store = makeStore();

    startWarmupSampler(game, store);
    // 10,000 ms warmup, sampled every 250 ms → 40 samples.
    vi.advanceTimersByTime(10_000);

    expect(store.dispatch).toHaveBeenCalledTimes(1);
    const [dispatched] = store.dispatch.mock.calls[0];
    expect(dispatched.type).toBe('devicePerformance/setLowEndFlag');
    expect(dispatched.payload.isLowEnd).toBe(true);
    expect(dispatched.payload.avgFps).toBeLessThan(45);
    expect(dispatched.payload.sampleCount).toBe(40);
  });

  it('OBS-06 healthy: after 10s of ~60fps samples on an 8GB device, dispatches setLowEndFlag({ isLowEnd: false })', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { ...ORIGINAL_NAV, deviceMemory: 8 },
      configurable: true,
    });

    const game = makeGame(Array(60).fill(60));
    const store = makeStore();

    startWarmupSampler(game, store);
    vi.advanceTimersByTime(10_000);

    const [dispatched] = store.dispatch.mock.calls[0];
    expect(dispatched.payload.isLowEnd).toBe(false);
  });

  it('OBS-06 Pitfall 4: navigator.deviceMemory === undefined (Firefox/Safari) → treated as Infinity → NOT low-end at 60fps', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { ...ORIGINAL_NAV, deviceMemory: undefined },
      configurable: true,
    });

    const game = makeGame(Array(60).fill(60));
    const store = makeStore();

    startWarmupSampler(game, store);
    vi.advanceTimersByTime(10_000);

    const [dispatched] = store.dispatch.mock.calls[0];
    expect(dispatched.payload.isLowEnd).toBe(false);
  });

  // Plan 102-07 GREEN: sampler + slice + migration v13 all implemented.
  // The hard RED gate from Plan 01 was removed once `startWarmupSampler`,
  // `devicePerformanceSlice`, and `migrations[13]` shipped (commits cbc7433 +
  // this commit).
});
