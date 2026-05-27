/**
 * PerfOverlay — In-game performance overlay (FPS / Δms / draw calls / heap MB)
 *
 * Phase 102 — Plan 06 (OBS-05)
 *
 * Why 1Hz (not per-frame):
 *   The overall budget is ≤1ms/frame when active and 0ms when off. A per-frame
 *   `update()` hook would pay text-rendering cost on every tick (60Hz). Instead
 *   we schedule a Phaser `time.addEvent` at delay: 1000 (1Hz, loop: true): most
 *   frames pay zero overhead, one frame per second pays a tiny amount for the
 *   `setText` DOM/canvas write. See RESEARCH Pattern 3 + T-102-17.
 *
 * Why typeof-guard on `performance.memory`:
 *   `performance.memory` (`usedJSHeapSize`) is a Chromium-only extension. On
 *   Firefox and Safari `performance.memory` is `undefined`. We `typeof`-guard
 *   the global `performance` reference itself too — `globalThis.performance`
 *   can be redefined in tests (Plan 01 simulates the Firefox/Safari path) and
 *   we must not throw.
 *
 * Why dynamic-import-only consumption from PhaserGame.jsx:
 *   `await import('./ui/PerfOverlay.js')` lets Vite split this module into its
 *   own chunk that is NOT included in the main bundle when `?perf=1` is absent
 *   and we're not in DEV mode. The static-import path would ship the overlay
 *   to every production user. See RESEARCH Pitfall 6 + T-102-19.
 *
 * Why no PostHog import here:
 *   This overlay is local-only debug instrumentation — it does NOT phone home.
 *   Plan 03 may later tag the perf session with a feature flag on the PostHog
 *   side; until then no telemetry coupling. (TODO Plan 03: optional perf-session tag.)
 */
export class PerfOverlay {
  constructor(scene) {
    this.scene = scene;
    this.text = scene.add.text(8, 8, '', {
      font: '12px monospace',
      color: '#00ff88',
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: { x: 4, y: 2 },
    }).setScrollFactor(0).setDepth(99999);

    // 1Hz update — keeps overhead ≤1ms/frame (one read per second, not per frame).
    // T-102-17 mitigation: literal `delay: 1000` is asserted by the Plan 01 unit test.
    this.timer = scene.time.addEvent({
      delay: 1000,
      callback: this.update,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    const fps = this.scene.game.loop.actualFps.toFixed(1);
    const frameMs = this.scene.game.loop.delta.toFixed(1);
    // Canvas renderer lacks `drawCount`; fall back to 'n/a' instead of NaN/undefined.
    const draws = this.scene.game.renderer.drawCount ?? 'n/a';
    // Firefox/Safari: `performance.memory` is undefined. Chromium-only API.
    const heap = (typeof performance !== 'undefined' && performance.memory?.usedJSHeapSize)
      ? `${(performance.memory.usedJSHeapSize / 1048576).toFixed(0)}MB`
      : 'n/a';
    this.text.setText(`FPS ${fps}  Δ${frameMs}ms  draws ${draws}  heap ${heap}`);
  }

  destroy() {
    this.timer?.remove();
    this.text?.destroy();
    this.timer = null;
    this.text = null;
  }
}

// Default export for the `const { default: PerfOverlay } = await import(...)` consumer
// pattern in PhaserGame.jsx. Named export is what the unit test imports.
export default PerfOverlay;
