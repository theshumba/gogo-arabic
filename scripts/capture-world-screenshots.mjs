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

async function switchZone(page, zoneId) {
  // Drive the scene directly — WorldScene hardcodes oasis_village on boot and does not
  // read currentZone, so programmatic loadZone() is the deterministic way to reach a zone.
  const ok = await page.evaluate((zone) => {
    const g = window.__PHASER_GAME__;
    const s = g && g.scene.getScene('WorldScene');
    if (!s || typeof s.loadZone !== 'function') return { ok: false, reason: 'no loadZone' };
    try {
      // Suppress the ZoneToast banner for this build. buildZone consumes AND resets the
      // flag (WorldScene.js:380-381), so it must be re-set before EVERY loadZone call —
      // otherwise the ~1s zone cadence stacks several 2.8s toasts into a garbled
      // "MOROYALAPALACEGE" pile-up at the top of every shot.
      s._suppressZoneToast = true;
      // entryX/entryY omitted → buildZone uses the zone's own spawn handling.
      s.loadZone(zone);
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: String(err && err.message || err) };
    }
  }, zoneId);
  return ok;
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

  try {
    // Origin first so localStorage writes land on the app origin (golden-path rationale).
    await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(([key, data]) => localStorage.setItem(key, JSON.stringify(data)), [SEED_KEY, seed]);

    await page.goto(BASE_URL + '/game', { waitUntil: 'domcontentloaded' });
    await waitForWorldScene(page);
    await settleFrames(page, 30); // generous initial warmup for texture loads

    for (const zoneId of CORE_ZONES) {
      const errorsBefore = consoleErrors.length;
      let status = 'ok';
      let reason = '';

      const sw = await switchZone(page, zoneId);
      if (!sw.ok) {
        status = 'switch-failed';
        reason = sw.reason || '';
      } else {
        await settleFrames(page, 15);
        // Center the camera on the actual zone content before the shot. The programmatic
        // loadZone() path leaves the camera parked at world origin (0,0) following a player
        // sprite that is itself parked there — so every prior screenshot only captured the
        // empty top-left corner of each 45x35 map while all the stalls/buildings/NPCs sit
        // in the middle. We must stopFollow() (otherwise the follow re-snaps the camera back
        // to the origin) and centre on the map middle, where zone content is authored.
        await page.evaluate(() => {
          const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
          // Belt-and-braces: destroy any in-flight zone toasts from earlier navigation.
          // ZoneToast labels are the only depth-9500 / scrollFactor-0 objects in the scene.
          s.children.list
            .filter((o) => o.depth === 9500 && o.scrollFactorX === 0)
            .forEach((o) => o.destroy());
          const cam = s.cameras.main;
          if (cam.stopFollow) cam.stopFollow();
          const w = (s.currentMapW || 45) * 64;
          const h = (s.currentMapH || 35) * 64;
          cam.centerOn(w / 2, h / 2);
        });
        await settleFrames(page, 6);
      }

      const outPath = path.join(OUT_DIR, `${zoneId}.png`);
      try {
        // Capture the canvas element only. Phaser's WebGL renderer.snapshot callback can
        // stall indefinitely in headless Chromium during GPU readback; a Playwright
        // locator screenshot reads the displayed canvas without compositing React HUD DOM.
        await page.locator('canvas').screenshot({ path: outPath });
      } catch (err) {
        // Fall back to a full-page shot so we still capture *something* to look at.
        await page.screenshot({ path: outPath, fullPage: false });
        if (status === 'ok') { status = 'canvas-shot-failed'; reason = String(err.message); }
      }

      const newErrors = consoleErrors.slice(errorsBefore);
      results.push({ zoneId, status, reason, file: `${zoneId}.png`, errors: newErrors });
      const tag = status === 'ok' ? 'OK ' : '!! ';
      console.log(`${tag}${zoneId} → ${outPath}${reason ? '  (' + reason + ')' : ''}${newErrors.length ? `  [${newErrors.length} console err]` : ''}`);
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
