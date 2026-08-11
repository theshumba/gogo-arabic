import crypto from 'node:crypto';

export const CORE_ZONES = [
  'oasis_village',
  'ancient_library',
  'desert_marketplace',
  'farmland',
  'bedouin_camp',
  'mountain_village',
  'coastal_port',
  'royal_palace',
];

export const ZONE_DIMENSIONS = {
  oasis_village: [40, 30],
  ancient_library: [35, 30],
  desert_marketplace: [45, 35],
  farmland: [45, 35],
  bedouin_camp: [35, 25],
  mountain_village: [40, 30],
  coastal_port: [45, 35],
  royal_palace: [50, 40],
};

export function buildSeed(zones) {
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

export async function waitForWorldScene(page) {
  await page.waitForFunction(() => {
    const g = window.__PHASER_GAME__;
    const s = g?.scene?.getScene?.('WorldScene');
    return !!(s?.scene?.isActive?.());
  }, { timeout: 30_000 });
}

export async function suppressDomOverlays(page) {
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

export async function switchZone(page, zoneId) {
  const [expectedWidth, expectedHeight] = ZONE_DIMENSIONS[zoneId] || [];
  if (!expectedWidth || !expectedHeight) {
    throw new Error(`No expected dimensions registered for zone "${zoneId}"`);
  }

  const state = await page.evaluate(([zone, width, height]) => {
    const s = window.__PHASER_GAME__?.scene?.getScene?.('WorldScene');
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

export async function assertCaptureState(page, zoneId) {
  const [expectedWidth, expectedHeight] = ZONE_DIMENSIONS[zoneId];
  await page.evaluate(([zone, width, height]) => {
    const s = window.__PHASER_GAME__?.scene?.getScene?.('WorldScene');
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

export async function captureAfterCanvasUpdate(page, previousHash) {
  const canvas = page.locator('canvas').first();
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const image = await canvas.screenshot();
    const hash = crypto.createHash('sha256').update(image).digest('hex');
    if (!previousHash || hash !== previousHash) return { image, hash };
    await page.waitForTimeout(200);
  }
  throw new Error(`Canvas did not update after zone switch; previous hash: ${previousHash}`);
}

export function hashImage(image) {
  return crypto.createHash('sha256').update(image).digest('hex');
}

export async function settleMapCamera(page, { zoom, marginTiles = 1 } = {}) {
  return page.evaluate(({ nextZoom, margin }) => {
    const s = window.__PHASER_GAME__?.scene?.getScene?.('WorldScene');
    if (!s) throw new Error('Cannot frame map: WorldScene is missing');
    s.children.list
      .filter((o) => o.depth === 9500 && o.scrollFactorX === 0)
      .forEach((o) => o.destroy());
    const cam = s.cameras.main;
    cam.stopFollow?.();
    cam.setZoom(nextZoom);
    cam.centerOn(s.currentMapW * 64 / 2, s.currentMapH * 64 / 2);
    return {
      width: s.currentMapW,
      height: s.currentMapH,
      zoom: nextZoom,
      marginTiles: margin,
    };
  }, { nextZoom: zoom, margin: marginTiles });
}
