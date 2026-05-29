import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import './mocks/sceneMock.js';
import { createMockScene } from './mocks/sceneMock.js';

// Mock ReplaceColorPipeline to avoid Phaser dependency
vi.mock('../ReplaceColorPipeline.js', () => ({
  default: class ReplaceColorPipeline {
    constructor(game) {
      this.game = game;
    }
  },
}));

import { MapLoader } from '../MapLoader.js';
import { captureZoneSnapshot } from '../world/WorldSnapshot.js';
import { ZONES } from '../../../data/zones.js';
import { KENMI_FRAME_TABLES } from '../../../data/kenmiFrameTables.js';

// Seed the mock's texture frame counts from the SAME source the fixture
// capturer uses (src/test/fixtures/captureViaVitest.test.js). Without this the
// mock defaults every texture to 1 frame, so _safeFrame clamps differently than
// at capture time and snapshots drift from the committed fixtures.
function seedFrameTotals(scene) {
  for (const [key, table] of Object.entries(KENMI_FRAME_TABLES)) {
    scene.textures._setFrameTotal(key, table.totalFrames);
  }
}

// Phase 97 Plan 01 Wave 0 — RED until Plan 07 commits fixture files at
// src/test/fixtures/world-snapshots/{zoneId}.json.
// Until fixtures exist the fixture-matching tests skip silently (no-op).

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

describe('world snapshot regression', () => {
  for (const zoneId of CORE_ZONES) {
    it(`${zoneId}: snapshot matches committed fixture`, () => {
      const fixturePath = path.resolve(`src/test/fixtures/world-snapshots/${zoneId}.json`);
      if (!fs.existsSync(fixturePath)) return; // regenerate via captureViaVitest.test.js
      const scene = createMockScene();
      seedFrameTotals(scene);
      const loader = new MapLoader(scene);
      const zone = ZONES[zoneId];
      loader.create(zone, zone.mapWidth, zone.mapHeight);
      const snapshot = captureZoneSnapshot(loader, zone, zone.tilesetTheme);
      const expected = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
      expect(snapshot).toEqual(expected);
    });
  }

  // WORLD-09: mountain_village biome parity — decorations.
  // Decorations now live in the objects[] layer (not the legacy decoSprites
  // array, which is why decoCount is 0), so assert against objects[].
  it('mountain_village has snow-biome decoration objects (WORLD-09 deco)', () => {
    const fixturePath = path.resolve('src/test/fixtures/world-snapshots/mountain_village.json');
    if (!fs.existsSync(fixturePath)) return;
    const fx = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    expect(fx.objects.length).toBeGreaterThan(0);
  });

  // KNOWN GAP — ambient ANIMALS for the snow + grass biomes (WORLD-09 animals,
  // WORLD-10) were never built. Lucas's PR-1 added biome props but no animal
  // spawning (see .planning/code-review/lucas-pr-1-review.md §3, items 3 & 4).
  // These stay skipped until ambient-animal spawning ships; making them pass
  // now would require faking the feature. Tracked as a roadmap follow-up.
  it.skip('mountain_village has ambient animals (WORLD-09 animals) — KNOWN GAP: unbuilt', () => {
    const fixturePath = path.resolve('src/test/fixtures/world-snapshots/mountain_village.json');
    if (!fs.existsSync(fixturePath)) return;
    const fx = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    expect(fx.animalCount).toBeGreaterThan(0);
  });

  for (const zoneId of ['farmland', 'coastal_port']) {
    it.skip(`${zoneId} has ambient animals (WORLD-10) — KNOWN GAP: unbuilt`, () => {
      const fixturePath = path.resolve(`src/test/fixtures/world-snapshots/${zoneId}.json`);
      if (!fs.existsSync(fixturePath)) return;
      const fx = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
      expect(fx.animalCount).toBeGreaterThan(0);
    });
  }
});
