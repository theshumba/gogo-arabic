#!/usr/bin/env node
/**
 * Capture one fitted whole-map image for each core outdoor zone.
 *
 * Usage:
 *   GOGO_BASE_URL=http://localhost:3001 npm run capture:world-fullmap
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
  settleMapCamera,
  suppressDomOverlays,
  switchZone,
  waitForWorldScene,
} from './world-capture-helpers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const BASE_URL = process.env.GOGO_BASE_URL || 'http://localhost:3000';
const OUT_DIR = path.join(repoRoot, 'docs', 'world-shots', 'fullmap');
const SEED_KEY = 'persist:gogo-arabic';
const VIEWPORT = { width: 2560, height: 1440 };
const TILE = 64;
const MARGIN = 1.08;
const BASE_VIEW = { width: 1280, height: 720 };

function fitZoom(width, height) {
  return Math.min(
    BASE_VIEW.width / (width * TILE * MARGIN),
    BASE_VIEW.height / (height * TILE * MARGIN),
  );
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const seed = buildSeed(CORE_ZONES);
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();
  const hashes = new Map();
  const results = [];
  let previousHash = null;

  try {
    await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(([key, data]) => localStorage.setItem(key, JSON.stringify(data)), [SEED_KEY, seed]);
    await page.goto(BASE_URL + '/game', { waitUntil: 'domcontentloaded' });
    await waitForWorldScene(page);
    await page.waitForTimeout(1_000);

    for (const zoneId of CORE_ZONES) {
      await switchZone(page, zoneId);
      await page.waitForTimeout(500);
      const state = await page.evaluate(() => {
        const s = window.__PHASER_GAME__?.scene?.getScene?.('WorldScene');
        return { width: s.currentMapW, height: s.currentMapH };
      });
      const zoom = fitZoom(state.width, state.height);
      await settleMapCamera(page, { zoom });
      await page.waitForTimeout(250);
      await assertCaptureState(page, zoneId);
      await suppressDomOverlays(page);

      const capture = await captureAfterCanvasUpdate(page, previousHash);
      const duplicateZone = hashes.get(capture.hash);
      if (duplicateZone) {
        throw new Error(
          `Duplicate whole-map screenshot hash for "${zoneId}" and "${duplicateZone}": ${capture.hash}`,
        );
      }
      hashes.set(capture.hash, zoneId);
      previousHash = capture.hash;

      const outPath = path.join(OUT_DIR, `${zoneId}.png`);
      fs.writeFileSync(outPath, capture.image);
      const result = {
        zoneId,
        file: outPath,
        hash: capture.hash,
        bytes: capture.image.length,
        width: VIEWPORT.width,
        height: VIEWPORT.height,
        mapWidth: state.width,
        mapHeight: state.height,
        zoom,
      };
      results.push(result);
      console.log(
        `OK  ${zoneId} → ${outPath} ` +
        `(${result.width}x${result.height}, zoom=${zoom.toFixed(5)}, ` +
        `${result.bytes} bytes, ${result.hash})`,
      );
    }
  } finally {
    await browser.close();
  }

  const sheet = `<!doctype html><meta charset=utf-8><title>Gogo world full-map shots</title>
<style>body{background:#111;color:#ccc;font:14px system-ui;margin:0;padding:20px}
h1{font-weight:600}figure{display:inline-block;margin:8px;vertical-align:top}
img{display:block;width:640px;border:1px solid #333;background:#000}
figcaption{padding:4px 2px}</style>
<h1>Gogo Arabic — whole-map renders</h1>
${results.map((r) => `<figure><img src="${r.zoneId}.png" loading=lazy>
<figcaption>${r.zoneId} — ${r.width}×${r.height}, map ${r.mapWidth}×${r.mapHeight}, zoom ${r.zoom.toFixed(5)}</figcaption></figure>`).join('\n')}`;
  fs.writeFileSync(path.join(OUT_DIR, '_index.html'), sheet);
  console.log(`\nWrote ${results.length} whole-map screenshots to ${OUT_DIR}`);
  console.log(`Contact sheet: ${path.join(OUT_DIR, '_index.html')}`);
}

main().catch((err) => {
  console.error('[capture-world-fullmap] fatal:', err);
  process.exit(1);
});
