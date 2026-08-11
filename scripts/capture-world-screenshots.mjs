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
import {
  CORE_ZONES,
  assertCaptureState,
  buildSeed,
  captureAfterCanvasUpdate,
  hashImage,
  settleMapCamera,
  suppressDomOverlays,
  switchZone,
  waitForWorldScene,
} from './world-capture-helpers.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const BASE_URL = process.env.GOGO_BASE_URL || 'http://localhost:3000';
const OUT_DIR = path.join(repoRoot, 'docs', 'world-shots');
const SEED_KEY = 'persist:gogo-arabic';

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const seed = buildSeed(CORE_ZONES);

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
      await settleMapCamera(page);
      await page.waitForTimeout(250);
      await assertCaptureState(page, zoneId);
      await suppressDomOverlays(page);

      const outPath = path.join(OUT_DIR, `${zoneId}.png`);
      // Phaser's WebGL renderer.snapshot callback can stall indefinitely in headless
      // Chromium during GPU readback. The canvas screenshot workaround is retained, but
      // DOM overlays are hidden above and no full-page fallback is permitted.
      const capture = await captureAfterCanvasUpdate(page, previousHash);
      fs.writeFileSync(outPath, capture.image);
      const hash = hashImage(capture.image);
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
<h1>Gogo Arabic — real rendered zones</h1>
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
