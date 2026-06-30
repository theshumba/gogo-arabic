import { describe, it, expect, vi } from 'vitest';
import '../../systems/__tests__/mocks/sceneMock.js';
import { createMockScene } from '../../systems/__tests__/mocks/sceneMock.js';
import { MapLoader } from '../../systems/MapLoader.js';

// MapLoader imports ReplaceColorPipeline, which extends a Phaser WebGL base the
// sceneMock's phaser stub does not provide. Mock it (same pattern as MapLoader.test.js).
vi.mock('../../systems/ReplaceColorPipeline.js', () => ({
  default: class ReplaceColorPipeline {
    constructor(game) {
      this.game = game;
    }
  },
}));

describe('MapLoader.placeObjectsOnly', () => {
  it('places one sprite per zone object without building ground', () => {
    const scene = createMockScene();
    const loader = new MapLoader(scene);
    const zone = { objects: [
      { key: 'kenmi-desert-props-desert-rugs', x: 5, y: 5 },
      { key: 'kenmi-desert-buildings-desert-house-1', x: 8, y: 3 },
    ] };
    const sprites = loader.placeObjectsOnly(zone);
    expect(sprites).toHaveLength(2);
  });

  it('does not crash on collide:true objects (initializes wallGroup in the Tiled path)', () => {
    const scene = createMockScene();
    const loader = new MapLoader(scene);
    // create() never ran, so wallGroup is null until placeObjectsOnly sets it.
    expect(loader.wallGroup).toBeFalsy();
    const zone = { objects: [
      { key: 'kenmi-desert-buildings-desert-house-1', x: 8, y: 3, collide: true },
    ] };
    expect(() => loader.placeObjectsOnly(zone)).not.toThrow();
    expect(loader.wallGroup).toBeTruthy();
  });
});
