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

function makeScene(layerNames, objectLayers = []) {
  const created = layerNames.map(makeLayer);
  const map = {
    tileWidth: 16, widthInPixels: 640, heightInPixels: 480,
    tilesets: [{ name: 'kenmi-desert-tiles-desert-beach-tiles-1' }],
    // Mirror Phaser's PARSED Tilemap shape: map.layers are LayerData with a name but
    // NO `.type`; object groups live in map.objects (ObjectLayer[]), not map.layers.
    layers: layerNames.map((n) => ({ name: n })),
    objects: objectLayers,
    addTilesetImage: vi.fn(() => ({})),
    createLayer: vi.fn((name) => created.find((l) => l.name === name)),
    getObjectLayer: vi.fn((name) => objectLayers.find((o) => o.name === name) || null),
    destroy: vi.fn(),
  };
  return {
    make: { tilemap: () => map },
    physics: { add: { staticGroup: () => ({ clear: vi.fn() }) } },
    cache: { tilemap: { has: () => true } },
    _created: created,
    _map: map,
  };
}

describe('TiledMapLoader collision layer', () => {
  it('creates a TilemapLayer for every tile layer (no .type filter)', () => {
    const scene = makeScene(['Ground', 'Collision']);
    const loader = new TiledMapLoader(scene);
    const result = loader.load('map-oasis-village');
    // The real bug: filtering on layerData.type left ground unrendered. Assert layers exist.
    expect(scene._map.createLayer).toHaveBeenCalledWith('Ground', expect.anything());
    expect(result.layers.Ground).toBeTruthy();
    expect(result.layers.Collision).toBeTruthy();
  });

  it('marks the Collision layer impassable and returns it', () => {
    const scene = makeScene(['Ground', 'Collision']);
    const loader = new TiledMapLoader(scene);
    const result = loader.load('map-oasis-village');
    const collision = scene._created.find((l) => l.name === 'Collision');
    expect(collision.setCollisionByExclusion).toHaveBeenCalledWith([-1, 0]);
    expect(result.collisionLayer).toBe(collision);
  });

  it('reads object layers from map.objects (not map.layers)', () => {
    const exits = { name: 'Exits', objects: [{ id: 1, x: 0, y: 0, properties: [{ name: 'targetZone', value: 'ancient_library' }] }] };
    const scene = makeScene(['Ground'], [exits]);
    const loader = new TiledMapLoader(scene);
    const result = loader.load('map-oasis-village');
    expect(result.objects.Exits).toHaveLength(1);
  });
});
