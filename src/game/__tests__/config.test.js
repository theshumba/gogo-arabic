import { describe, it, expect, vi } from 'vitest';
import Phaser from 'phaser';

// config.js imports the scene classes, which transitively pull in PlayerController
// and other Phaser-runtime code that can't load headless. Stub them — the scale
// config under test is defined in config.js itself, not in the scenes.
vi.mock('../scenes/BootScene.js', () => ({ BootScene: class BootScene {} }));
vi.mock('../scenes/WorldScene.js', () => ({ WorldScene: class WorldScene {} }));
vi.mock('../scenes/InteriorScene.js', () => ({ InteriorScene: class InteriorScene {} }));
vi.mock('../scenes/BattleScene.js', () => ({ BattleScene: class BattleScene {} }));

const { gameConfig, GAME_WIDTH, GAME_HEIGHT } = await import('../config.js');

// MOB-03: Phaser must scale with FIT (uniform aspect-preserving) + pixelArt so
// tiles stay crisp on mobile, rather than RESIZE which stretches to the viewport.
describe('Phaser game config — mobile scaling (103-02)', () => {
  it('uses Phaser.Scale.FIT, not RESIZE', () => {
    expect(gameConfig.scale.mode).toBe(Phaser.Scale.FIT);
    expect(gameConfig.scale.mode).not.toBe(Phaser.Scale.RESIZE);
  });

  it('centers the canvas in both axes', () => {
    expect(gameConfig.scale.autoCenter).toBe(Phaser.Scale.CENTER_BOTH);
  });

  it('keeps pixel-art crisp (pixelArt + roundPixels, no antialias)', () => {
    expect(gameConfig.pixelArt).toBe(true);
    expect(gameConfig.roundPixels).toBe(true);
    expect(gameConfig.antialias).toBe(false);
  });

  it('renders at a fixed 1280×720 base resolution', () => {
    expect(gameConfig.width).toBe(GAME_WIDTH);
    expect(gameConfig.height).toBe(GAME_HEIGHT);
    expect(GAME_WIDTH).toBe(1280);
    expect(GAME_HEIGHT).toBe(720);
  });
});
