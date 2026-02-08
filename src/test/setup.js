import '@testing-library/jest-dom';

// Mock Howler audio library
global.Howl = class Howl {
  constructor() {}
  play() {}
  stop() {}
  pause() {}
  volume() {}
  fade() {}
  on() {}
};

global.Howler = {
  mute: () => {},
  volume: () => {},
  stop: () => {},
};

// Mock Phaser
global.Phaser = {
  Game: class Game {
    constructor() {}
    destroy() {}
  },
  Scene: class Scene {},
  AUTO: 'AUTO',
};
