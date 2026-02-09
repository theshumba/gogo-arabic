import '@testing-library/jest-dom';
import { beforeEach, afterEach, vi } from 'vitest';

// Mock Phaser module to prevent loading errors
vi.mock('phaser', () => ({
  default: {
    Events: {
      EventEmitter: class EventEmitter {
        constructor() {
          this.events = {};
        }
        on(event, fn) {
          if (!this.events[event]) this.events[event] = [];
          this.events[event].push(fn);
        }
        emit(event, ...args) {
          if (this.events[event]) {
            this.events[event].forEach(fn => fn(...args));
          }
        }
        removeAllListeners() {
          this.events = {};
        }
      }
    },
    Game: class Game {
      constructor() {}
      destroy() {}
    },
    Scene: class Scene {},
    AUTO: 'AUTO',
  },
}));

// Mock HTMLCanvasElement for Phaser
HTMLCanvasElement.prototype.getContext = () => ({
  fillStyle: '',
  fillRect: () => {},
  clearRect: () => {},
  getImageData: () => ({ data: [] }),
  putImageData: () => {},
  createImageData: () => [],
  setTransform: () => {},
  drawImage: () => {},
  save: () => {},
  restore: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  closePath: () => {},
  stroke: () => {},
  translate: () => {},
  scale: () => {},
  rotate: () => {},
  arc: () => {},
  fill: () => {},
  measureText: () => ({ width: 0 }),
  transform: () => {},
  rect: () => {},
  clip: () => {},
});

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
  Events: {
    EventEmitter: class EventEmitter {
      constructor() {
        this.events = {};
      }
      on(event, fn) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(fn);
      }
      emit(event, ...args) {
        if (this.events[event]) {
          this.events[event].forEach(fn => fn(...args));
        }
      }
      removeAllListeners() {
        this.events = {};
      }
    }
  }
};

// Set up fake timers with fixed date to prevent test flakiness
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-02-09T00:00:00Z'));
});

// Clean up after each test
afterEach(async () => {
  // EventBus cleanup - dynamically import to use mocked version
  const { EventBus } = await import('../utils/eventBus.js');
  if (EventBus && EventBus.removeAllListeners) {
    EventBus.removeAllListeners();
  }
  vi.clearAllMocks();
  vi.useRealTimers();
});
