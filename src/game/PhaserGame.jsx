import { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import Phaser from 'phaser';
import { gameConfig } from './config.js';
import { EventBus } from '../utils/eventBus.js';
import { EVENTS } from '../utils/eventBusTypes.js';
import { store } from '../store/store.js';
import { startWarmupSampler } from '../services/devicePerformance.js';

export const PhaserGame = forwardRef(function PhaserGame({ onSceneReady }, ref) {
  const gameRef = useRef(null);
  const containerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    game: gameRef.current,
    scene: gameRef.current?.scene?.getScene('WorldScene'),
  }));

  useEffect(() => {
    if (gameRef.current) return;

    const config = {
      ...gameConfig,
      parent: containerRef.current,
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;
    // Expose for debugging (dev only)
    if (import.meta.env.DEV) {
      window.__PHASER_GAME__ = game;
    }

    // When WorldScene is ready, notify parent and optionally mount the perf overlay.
    EventBus.once(EVENTS.SCENE_READY, async () => {
      const worldScene = game.scene.getScene('WorldScene');
      if (onSceneReady) onSceneReady(worldScene);

      // Plan 102-07 (OBS-06): kick off the 10s low-end-device warmup sampler.
      // Wired here (NOT in main.jsx) because this is the only call-site where
      // the Phaser `game` instance — and therefore `game.loop.actualFps` — is
      // in scope. Idempotent: re-entry is guarded by a module-scoped flag.
      try {
        startWarmupSampler(game, store);
      } catch (err) {
        // Telemetry must never crash gameplay (RESEARCH Pitfall 5 mirror).
        // eslint-disable-next-line no-console
        console.warn('[devicePerformance] sampler failed to start:', err);
      }

      // Plan 102-06 (OBS-05): gated dynamic import of PerfOverlay.
      // - `?perf=1` URL flag OR `import.meta.env.DEV` → load and mount.
      // - Production build without the flag → `await import` is NOT reached, so
      //   Vite tree-shakes PerfOverlay.js into its own chunk that the prod bundle
      //   never fetches. Zero runtime cost when off (T-102-19 mitigation,
      //   RESEARCH Pitfall 6).
      // - PerfOverlay is local-only debug instrumentation — no PostHog/telemetry
      //   coupling here. (TODO Plan 03: optional perf-session tag.)
      const perfEnabled =
        import.meta.env.DEV ||
        new URLSearchParams(window.location.search).has('perf');
      if (perfEnabled && worldScene) {
        try {
          const { default: PerfOverlay } = await import('./ui/PerfOverlay.js');
          const overlay = new PerfOverlay(worldScene);
          if (import.meta.env.DEV) {
            window.__PERF_OVERLAY__ = overlay;
          }
        } catch (err) {
          // Overlay is non-essential — log and continue.
          // eslint-disable-next-line no-console
          console.warn('[PerfOverlay] failed to load:', err);
        }
      }
    });

    return () => {
      // Tear down the perf overlay first so its timer/text don't reference a
      // destroyed scene.
      if (typeof window !== 'undefined' && window.__PERF_OVERLAY__) {
        try { window.__PERF_OVERLAY__.destroy(); } catch (_) { /* noop */ }
        delete window.__PERF_OVERLAY__;
      }
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // Container fills parent, Phaser scales inside
  return (
    <div
      ref={containerRef}
      id="phaser-container"
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    />
  );
});
