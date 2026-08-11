import { describe, expect, it, vi } from 'vitest';
import { subscribeToCanvasRect } from '../canvasRect.js';

function createFakeWindow() {
  return {
    requestAnimationFrame: (callback) => callback(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}

describe('subscribeToCanvasRect', () => {
  it('reports the fitted canvas rect on initial setup and resize events', () => {
    const win = createFakeWindow();
    const canvas = {
      getBoundingClientRect: vi.fn(() => ({
        left: 10,
        top: 20,
        right: 650,
        bottom: 380,
        width: 640,
        height: 360,
      })),
    };
    const scale = {
      on: vi.fn(),
      off: vi.fn(),
      refresh: vi.fn(),
    };
    const game = { canvas, scale };
    const onRect = vi.fn();

    subscribeToCanvasRect(game, onRect, win);

    expect(onRect).toHaveBeenCalledTimes(1);
    const resizeCallback = scale.on.mock.calls[0][1];
    resizeCallback();
    expect(onRect).toHaveBeenCalledTimes(2);
    const windowResizeCallback = win.addEventListener.mock.calls[0][1];
    windowResizeCallback();
    expect(scale.refresh).toHaveBeenCalledTimes(1);
    expect(onRect).toHaveBeenCalledTimes(3);
  });

  it('removes Phaser and window listeners on cleanup', () => {
    const win = createFakeWindow();
    const scale = { on: vi.fn(), off: vi.fn(), refresh: vi.fn() };
    const game = {
      canvas: { getBoundingClientRect: () => ({}) },
      scale,
    };

    const cleanup = subscribeToCanvasRect(game, vi.fn(), win);
    cleanup();

    const resizeCallback = scale.on.mock.calls[0][1];
    expect(scale.off).toHaveBeenCalledWith('resize', resizeCallback);
    expect(win.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
