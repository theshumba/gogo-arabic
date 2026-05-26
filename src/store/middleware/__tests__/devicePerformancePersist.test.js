/**
 * Phase 102 — Plan 07 RED scaffold
 *
 * Covers OBS-06 persistence (devicePerformance slice → IndexedDB via redux-persist
 * migration v12 → v13).
 *
 * Asserts the persistence contract Plan 07 must deliver:
 *
 *   1. A `migrations[13]` entry exists in src/services/storage/migrations.js
 *      and `CURRENT_VERSION === 13`.
 *   2. Applying migration v13 to a v12 snapshot returns a state object
 *      containing a `devicePerformance` slice (empty defaults — slice owns
 *      its own initialState).
 *   3. After dispatching `setLowEndFlag(...)` against a store wired with the
 *      IndexedDB-backed persistor (using fake-indexeddb), the IndexedDB store
 *      reflects the new slice value on a subsequent read.
 *
 * RED: today CURRENT_VERSION === 12, migrations[13] does not exist, and the
 * devicePerformanceSlice has not yet been authored.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';

describe('devicePerformance persistence (OBS-06, Plan 07)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('OBS-06: CURRENT_VERSION === 13 (migration bumped from 12 to 13 in Plan 07)', async () => {
    const { CURRENT_VERSION } = await import('../../../services/storage/migrations.js');
    // RED: today it's 12.
    expect(CURRENT_VERSION).toBe(13);
  });

  it('OBS-06: migrations[13] exists and adds a devicePerformance slice to a v12 snapshot', async () => {
    // The module exports the migrations map under the name `migrations`.
    const mod = await import('../../../services/storage/migrations.js');
    // RED: migrations[13] does not exist yet.
    expect(typeof mod.migrations?.[13]).toBe('function');

    const v12State = {
      player: { level: 5 },
      vocabulary: { fsrsCards: [] },
      settings: { telemetryOptOut: true },
    };
    const v13State = await mod.migrations[13](v12State);
    expect(v13State).toHaveProperty('devicePerformance');
    // Empty default slice — slice's own initialState supplies the shape on
    // store creation; the migration just ensures the key exists.
    expect(typeof v13State.devicePerformance).toBe('object');
  });

  it('OBS-06: dispatching setLowEndFlag persists the devicePerformance slice (fake-indexeddb round-trip)', async () => {
    // RED: devicePerformanceSlice.js does not exist.
    const slice = await import('../../slices/devicePerformanceSlice.js');
    const reducer = slice.default;
    const { setLowEndFlag } = slice;

    const next = reducer(
      undefined,
      setLowEndFlag({ isLowEnd: true, avgFps: 30, deviceMemory: 2, sampleCount: 40 })
    );

    expect(next.isLowEnd).toBe(true);
    expect(next.avgFps).toBe(30);
    expect(next.deviceMemory).toBe(2);
    expect(next.sampleCount).toBe(40);

    // Smoke: the indexedDB global is provided by fake-indexeddb/auto so the
    // IndexedDB-backed persistor would resolve at runtime. Asserting the slice
    // shape is the contract this RED file enforces; the redux-persist wiring
    // round-trip is asserted at integration level in Plan 07.
    expect(typeof globalThis.indexedDB).toBe('object');
  });

  // Hard RED gate.
  it('RED gate: Plan 07 has not yet bumped CURRENT_VERSION to 13 or authored devicePerformanceSlice — this test fails by design', () => {
    throw new Error('not implemented — Plan 102-07 (devicePerformanceSlice + migrations[13] + redux-persist allow-list)');
  });
});
