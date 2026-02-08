import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { WorldScene } from './scenes/WorldScene.js';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const gameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, WorldScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'phaser-container',
    // Mobile-friendly scaling
    min: {
      width: 320,
      height: 240,
    },
    max: {
      width: GAME_WIDTH * 2,
      height: GAME_HEIGHT * 2,
    },
  },
  backgroundColor: '#1A1A2E',
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true,
  },
  // Mobile optimizations
  input: {
    touch: {
      capture: true,
    },
  },
};
