import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TapToInteract, RADIUS } from '../TapToInteract.js';

function makeScene() {
  const handlers = {};
  return {
    input: {
      on: vi.fn((ev, fn) => { handlers[ev] = fn; }),
      off: vi.fn(),
    },
    touchJoystickRegion: null,
    _fire(ev, payload) { handlers[ev]?.(payload); },
  };
}

describe('TapToInteract (103-03)', () => {
  let scene, mgr, setCd, tap;

  beforeEach(() => {
    scene = makeScene();
    mgr = { findNearest: vi.fn(() => ({ id: 'obj1' })), activate: vi.fn() };
    setCd = vi.fn();
    tap = new TapToInteract(scene, mgr, () => false, setCd);
  });

  it('registers a pointerdown handler', () => {
    expect(scene.input.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
  });

  it('finds the nearest interactable within RADIUS and activates it on a world tap', () => {
    scene._fire('pointerdown', { worldX: 100, worldY: 200, x: 100, y: 200, event: {} });
    expect(mgr.findNearest).toHaveBeenCalledWith(100, 200, RADIUS);
    expect(mgr.activate).toHaveBeenCalledWith({ id: 'obj1' }, false, setCd);
  });

  it('does nothing when no interactable is in range', () => {
    mgr.findNearest.mockReturnValue(null);
    scene._fire('pointerdown', { worldX: 0, worldY: 0, x: 0, y: 0, event: {} });
    expect(mgr.activate).not.toHaveBeenCalled();
  });

  it('ignores taps on data-touch-control DOM elements (action buttons)', () => {
    const target = { closest: (sel) => (sel === '[data-touch-control]' ? {} : null) };
    scene._fire('pointerdown', { worldX: 100, worldY: 200, x: 100, y: 200, event: { target } });
    expect(mgr.findNearest).not.toHaveBeenCalled();
  });

  it('ignores taps inside the on-canvas joystick region', () => {
    scene.touchJoystickRegion = { x: 130, y: 500, radius: 98 };
    scene._fire('pointerdown', { worldX: 130, worldY: 500, x: 140, y: 510, event: {} });
    expect(mgr.findNearest).not.toHaveBeenCalled();
  });

  it('still handles taps outside the joystick region', () => {
    scene.touchJoystickRegion = { x: 130, y: 500, radius: 98 };
    scene._fire('pointerdown', { worldX: 700, worldY: 100, x: 700, y: 100, event: {} });
    expect(mgr.findNearest).toHaveBeenCalledWith(700, 100, RADIUS);
  });

  it('removes its listener on destroy', () => {
    tap.destroy();
    expect(scene.input.off).toHaveBeenCalledWith('pointerdown', expect.any(Function));
  });
});
