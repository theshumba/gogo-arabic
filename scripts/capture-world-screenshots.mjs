#!/usr/bin/env node
/**
 * Capture REAL rendered screenshots of all 8 core world zones.
 *
 * Unlike scripts/capture-world-snapshots.js — which uses a headless MOCK that records
 * the *shape* MapLoader produces "without actually rendering" — this script boots the
 * actual game in a real Chromium via Playwright, drives Phaser through every zone using
 * the dev-exposed `window.__PHASER_GAME__`, and screenshots the live <canvas>.
 *
 * The output PNGs are the thing a human (or a vision-capable model) can actually LOOK at
 * to judge whether the world renders correctly — closing the visual feedback loop that
 * the structural snapshot/e2e checks never provided (a blank or scrambled canvas still
 * passes "canvas is visible, non-zero size").
 *
 * Usage:
 *   npm run dev            # in one terminal (or let Playwright reuse :3000)
 *   node scripts/capture-world-screenshots.mjs
 *
 * Output: docs/world-shots/{zoneId}.png  (+ _index.html contact sheet)
 *
 * Requires: @playwright/test (already a devDependency) and its chromium browser
 *   (npx playwright install chromium  — run once if the browser is missing).
 */

import { chromium } from '@playwright/test';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const BASE_URL = process.env.GOGO_BASE_URL || 'http://localhost:3000';
const OUT_DIR = path.join(repoRoot, 'docs', 'world-shots');
const SEED_KEY = 'persist:gogo-arabic';

const CORE_ZONES = [
  'oasis_village',
  'ancient_library',
  'desert_marketplace',
  'farmland',
  'bedouin_camp',
  'mountain_village',
  'coastal_port',
  'royal_palace',
];

const ZONE_DIMENSIONS = {
  oasis_village: [40, 30],
  ancient_library: [35, 30],
  desert_marketplace: [45, 35],
  farmland: [45, 35],
  bedouin_camp: [35, 25],
  mountain_village: [40, 30],
  coastal_port: [45, 35],
  royal_palace: [50, 40],
};

/**
 * A complete redux-persist snapshot so the app boots straight into WorldScene,
 * bypassing title + character creation. Mirrors e2e/golden-path.spec.js#seedSnapshot,
 * but with ALL zones unlocked so loadZone() into any of them succeeds.
 * `now` is injected (scripts can't call Date.now()) so the seed is deterministic per run.
 */
function buildSeed(now, zones) {
  // Minimal shape proven to boot straight into WorldScene. Other slices (vocabulary,
  // quests, battle, worldState…) now live in IndexedDB per the v1→v12 migrations, so
  // seeding them into this localStorage blob is unnecessary and risks conflicting with
  // the migration layer. We only need a rehydrated player to skip character creation.
  return {
    player: JSON.stringify({
      name: 'ShotTester',
      level: 5,
      xp: 500,
      dirhams: 500,
      currentZone: 'oasis_village',
      position: { x: 100, y: 100 },
      inventory: [],
      outfit: 'simple-thobe',
      unlockedZones: zones,
      onboardingComplete: true,
      tutorialPhase: 'done',
    }),
    _persist: JSON.stringify({ version: -1, rehydrated: true }),
  };
}

async function waitForWorldScene(page) {
  // Real readiness: WorldScene exists AND is active on the live Phaser game instance.
  // (Not just "a canvas element is in the DOM" — that's the check that always passes.)
  try {
    await page.waitForFunction(() => {
      const g = window.__PHASER_GAME__;
      if (!g) return false;
      const s = g.scene && g.scene.getScene && g.scene.getScene('WorldScene');
      return !!(s && s.scene && s.scene.isActive());
    }, { timeout: 30_000 });
  } catch (err) {
    const state = await page.evaluate(() => ({
      url: location.href,
      hasGame: !!window.__PHASER_GAME__,
      scenes: window.__PHASER_GAME__
        ? window.__PHASER_GAME__.scene.scenes.map((s) => ({ k: s.scene.key, active: s.scene.isActive() }))
        : null,
      hasCanvas: !!document.querySelector('canvas'),
      body: document.body.innerText.slice(0, 200),
    }));
    console.error('[capture] readiness failed. Page state:', JSON.stringify(state, null, 2));
    throw err;
  }
}

async function suppressDomOverlays(page) {
  await page.evaluate(() => {
    const container = document.querySelector('#phaser-container')?.parentElement;
    if (container) {
      for (const child of container.children) {
        if (child.id !== 'phaser-container') child.style.visibility = 'hidden';
      }
    }

    const perfOverlay = window.__PERF_OVERLAY__;
    if (perfOverlay) {
      perfOverlay.destroy();
      delete window.__PERF_OVERLAY__;
    }
  });
}

async function switchZone(page, zoneId) {
  const [expectedWidth, expectedHeight] = ZONE_DIMENSIONS[zoneId] || [];
  if (!expectedWidth || !expectedHeight) {
    throw new Error(`No expected dimensions registered for zone "${zoneId}"`);
  }

  // loadZone() is synchronous. Verify the live scene state instead of treating its
  // undefined return value as evidence that a switch completed.
  const state = await page.evaluate(([zone, width, height]) => {
    const g = window.__PHASER_GAME__;
    const s = g && g.scene.getScene('WorldScene');
    if (!s || !s.scene.isActive()) {
      throw new Error(`Cannot switch to "${zone}": WorldScene is not active`);
    }
    s._suppressZoneToast = true;
    s.loadZone(zone);

    return {
      liveZone: s.currentZone,
      mapWidth: s.currentMapW,
      mapHeight: s.currentMapH,
      mapReady: s.currentZone === zone &&
        s.currentMapW === width &&
        s.currentMapH === height &&
        !!s.playerController?.getPlayer?.() &&
        (s.usingTiledMap ? !!s.currentTiledMap : !!s.mapLoader?.wallGroup),
    };
  }, [zoneId, expectedWidth, expectedHeight]);

  if (state.liveZone !== zoneId) {
    throw new Error(`Zone switch mismatch: requested "${zoneId}", live scene is "${state.liveZone}"`);
  }
  if (!state.mapReady) {
    throw new Error(
      `Zone map did not finish loading for "${zoneId}": ` +
      `live="${state.liveZone}" dimensions=${state.mapWidth}x${state.mapHeight}`,
    );
  }
  return state;
}

async function assertCaptureState(page, zoneId) {
  const [expectedWidth, expectedHeight] = ZONE_DIMENSIONS[zoneId];
  await page.evaluate(([zone, width, height]) => {
    const s = window.__PHASER_GAME__?.scene?.getScene('WorldScene');
    const liveZone = s?.currentZone;
    if (liveZone !== zone) {
      throw new Error(`Capture zone mismatch: requested "${zone}", live scene is "${liveZone}"`);
    }
    const mapReady = s?.currentMapW === width &&
      s?.currentMapH === height &&
      !!s.playerController?.getPlayer?.() &&
      (s.usingTiledMap ? !!s.currentTiledMap : !!s.mapLoader?.wallGroup);
    if (!mapReady) {
      throw new Error(
        `Capture map is not ready for "${zone}": ` +
        `live="${liveZone}" dimensions=${s?.currentMapW}x${s?.currentMapH}`,
      );
    }
  }, [zoneId, expectedWidth, expectedHeight]);
}

async function captureAfterCanvasUpdate(page, previousHash) {
  const canvas = page.locator('canvas').first();
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const image = await canvas.screenshot();
    const hash = crypto.createHash('sha256').update(image).digest('hex');
    if (!previousHash || hash !== previousHash) return { image, hash };
    await page.waitForTimeout(200);
  }
  throw new Error(`Canvas did not update after zone switch; previous hash: ${previousHash}`);
}

// Give the Phaser render loop a few frames to draw the freshly-built zone before the shot.
async function settleFrames(page, frames = 12) {
  await page.evaluate(
    (n) => new Promise((resolve) => {
      let count = 0;
      const tick = () => (++count >= n ? resolve() : requestAnimationFrame(tick));
      requestAnimationFrame(tick);
    }),
    frames,
  );
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const now = 1_700_000_000_000; // fixed epoch — deterministic seed, no Date.now()
  const seed = buildSeed(now, CORE_ZONES);

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message));

  const results = [];
  const hashes = new Map();
  let previousHash = null;

  try {
    // Origin first so localStorage writes land on the app origin (golden-path rationale).
    await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(([key, data]) => localStorage.setItem(key, JSON.stringify(data)), [SEED_KEY, seed]);

    await page.goto(BASE_URL + '/game', { waitUntil: 'domcontentloaded' });
    await waitForWorldScene(page);
    await page.waitForTimeout(1_000); // allow the first rendered scene to settle

    for (const zoneId of CORE_ZONES) {
      const errorsBefore = consoleErrors.length;
      await switchZone(page, zoneId);
      await page.waitForTimeout(500);
      await page.evaluate(() => {
        const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
        s.children.list
          .filter((o) => o.depth === 9500 && o.scrollFactorX === 0)
          .forEach((o) => o.destroy());
        const cam = s.cameras.main;
        if (cam.stopFollow) cam.stopFollow();
        const w = s.currentMapW * 64;
        const h = s.currentMapH * 64;
        cam.centerOn(w / 2, h / 2);
      });
      await page.waitForTimeout(250);
      await assertCaptureState(page, zoneId);
      await suppressDomOverlays(page);

      const outPath = path.join(OUT_DIR, `${zoneId}.png`);
      // Phaser's WebGL renderer.snapshot callback can stall indefinitely in headless
      // Chromium during GPU readback. The canvas screenshot workaround is retained, but
      // DOM overlays are hidden above and no full-page fallback is permitted.
      const capture = await captureAfterCanvasUpdate(page, previousHash);
      fs.writeFileSync(outPath, capture.image);
      const hash = capture.hash;
      const duplicateZone = hashes.get(hash);
      if (duplicateZone) {
        throw new Error(
          `Duplicate screenshot hash for "${zoneId}" and "${duplicateZone}": ${hash}`,
        );
      }
      hashes.set(hash, zoneId);
      previousHash = hash;

      const newErrors = consoleErrors.slice(errorsBefore);
      results.push({ zoneId, status: 'ok', file: `${zoneId}.png`, errors: newErrors, hash });
      console.log(`OK  ${zoneId} → ${outPath} [${hash}]${newErrors.length ? `  [${newErrors.length} console err]` : ''}`);
    }
  } finally {
    await browser.close();
  }

  // Contact sheet so all 8 can be eyeballed at once.
  const sheet = `<!doctype html><meta charset=utf8><title>Gogo world shots</title>
<style>body{background:#111;color:#ccc;font:14px system-ui;margin:0;padding:20px}
h1{font-weight:600}figure{display:inline-block;margin:8px;vertical-align:top}
img{display:block;width:480px;border:1px solid #333;background:#000}
figcaption{padding:4px 2px}.bad{color:#ff8a8a}</style>
<h1>Gogo Arabic — real rendered zones (${new Date(now).toISOString().slice(0,10)})</h1>
${results.map((r) => `<figure><img src="${r.file}" loading=lazy>
<figcaption class="${r.status === 'ok' ? '' : 'bad'}">${r.zoneId} — ${r.status}${r.reason ? ': ' + r.reason : ''}${r.errors.length ? ` · ${r.errors.length} console err` : ''}</figcaption></figure>`).join('\n')}`;
  fs.writeFileSync(path.join(OUT_DIR, '_index.html'), sheet);

  const bad = results.filter((r) => r.status !== 'ok').length;
  console.log(`\nWrote ${results.length} screenshots to ${OUT_DIR} (${bad} with issues).`);
  console.log(`Contact sheet: ${path.join(OUT_DIR, '_index.html')}`);
}

main().catch((err) => {
  console.error('[capture-world-screenshots] fatal:', err);
  process.exit(1);
});
