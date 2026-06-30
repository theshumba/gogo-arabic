import { describe, it, expect, vi } from 'vitest';
import { TiledMapLoader } from '../TiledMapLoader.js';

function makeLayer(name) {
  return {
    name,
    setScale: vi.fn().mockReturnThis(),
    setCollisionByExclusion: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };
}

function makeScene(layerNames) {
  const created = layerNames.map(makeLayer);
  const map = {
    tileWidth: 16, widthInPixels: 640, heightInPixels: 480,
    tilesets: [{ name: 'kenmi-desert-tiles-desert-beach-tiles-1' }],
    layers: layerNames.map((n) => ({ name: n, type: 'tilelayer' })),
    addTilesetImage: vi.fn(() => ({})),
    createLayer: vi.fn((name) => created.find((l) => l.name === name)),
    getObjectLayer: vi.fn(() => ({ objects: [] })),
    destroy: vi.fn(),
  };
  return {
    make: { tilemap: () => map },
    physics: { add: { staticGroup: () => ({ clear: vi.fn() }) } },
    cache: { tilemap: { has: () => true } },
    _created: created,
  };
}

describe('TiledMapLoader collision layer', () => {
  it('marks the Collision layer impassable and returns it', () => {
    const scene = makeScene(['Ground', 'Collision']);
    const loader = new TiledMapLoader(scene);
    const result = loader.load('map-oasis-village');
    const collision = scene._created.find((l) => l.name === 'Collision');
    expect(collision.setCollisionByExclusion).toHaveBeenCalledWith([-1, 0]);
    expect(result.collisionLayer).toBe(collision);
  });
});
