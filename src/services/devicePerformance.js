/**
 * Phase 102 — Plan 07 (OBS-06): Low-end-device warmup sampler
 *
 * Samples `game.loop.actualFps` every 250 ms for 10 seconds (40 samples) and
 * dispatches `setLowEndFlag` with the verdict. Designed to be called ONCE
 * after the Phaser BootScene completes — re-entry is a no-op.
 *
 * Heuristic (RESEARCH Pattern 4):
 *   isLowEnd = avgFps < 45 OR navigator.deviceMemory < 4
 *
 * Pitfall 4 (Firefox / Safari): `navigator.deviceMemory` is Chromium-only.
 * Missing values are treated as Infinity so non-Chromium users fall back to
 * the FPS-only heuristic — better to misclassify a Safari user as high-end
 * than to misclassify every Safari user as low-end.
 *
 * Phase 103 (mobile) and Phase 104 (asset pipeline) read the persisted
 * verdict via `selectIsLowEndDevice` to downgrade VFX and atlas page count.
 */
import { setLowEndFlag } from '../store/slices/devicePerformanceSlice.js';

const WARMUP_MS = 10_000;
const SAMPLE_INTERVAL_MS = 250;
// Heuristic thresholds (RESEARCH Pattern 4).
const FPS_THRESHOLD = 45;
const MEMORY_THRESHOLD_GB = 4;

// Module-scoped re-entry guard (T-102-21 mitigation).
let _started = false;

/**
 * Reset the started flag. Test-only — production code must not call this.
 * Exposed because the sampler is module-singleton and tests need a clean
 * slate between cases.
 */
export function _resetForTests() {
  _started = false;
}

/**
 * Start a 10-second FPS warmup. Idempotent: second call is a no-op.
 *
 * @param {object} game  - Phaser game instance exposing `game.loop.actualFps`.
 * @param {object} store - Redux store exposing `dispatch`.
 */
export function startWarmupSampler(game, store) {
  if (_started) return;
  _started = true;

  const samples = [];
  const startedAt = Date.now();

  const id = setInterval(() => {
    // Read actualFps each tick — Phaser updates this every frame.
    samples.push(game.loop.actualFps);

    if (Date.now() - startedAt >= WARMUP_MS) {
      clearInterval(id);

      const avgFps =
        samples.length > 0
          ? samples.reduce((a, b) => a + b, 0) / samples.length
          : 0;

      // Pitfall 4: navigator.deviceMemory is undefined on Firefox/Safari —
      // treat as Infinity so the OR-clause never trips on those browsers.
      const deviceMemory =
        typeof navigator !== 'undefined' && navigator.deviceMemory
          ? navigator.deviceMemory
          : Infinity;

      const isLowEnd = avgFps < FPS_THRESHOLD || deviceMemory < MEMORY_THRESHOLD_GB;

      store.dispatch(
        setLowEndFlag({
          isLowEnd,
          avgFps,
          deviceMemory,
          sampleCount: samples.length,
        })
      );
    }
  }, SAMPLE_INTERVAL_MS);
}
