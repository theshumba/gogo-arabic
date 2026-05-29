/**
 * TouchInputAdapter — Phase 103-03 (MOB-01)
 *
 * Wires a rex VirtualJoyStick into the scene and exposes its output as a
 * cursor-key-compatible object on `scene.touchCursors`, which Player.update()
 * reads alongside the keyboard cursors. The rex plugin (`VirtualJoystickPlugin`)
 * is imported dynamically so:
 *   - it is NOT in the main bundle (loads as its own chunk only on touch devices),
 *   - importing this module headless (tests) never evaluates the Phaser-global
 *     plugin class.
 *
 * Per RESEARCH Pitfall 7 we import the per-plugin path, never the package barrel
 * (the barrel pulls in 7+ MB).
 */

const PLUGIN_KEY = 'rexVirtualJoystick';
const JOYSTICK_RADIUS = 70;

/**
 * @param {Phaser.Scene} scene
 * @returns {Promise<{ joystick: object, destroy: () => void }>}
 */
export async function createTouchInput(scene) {
  const { default: VirtualJoystickPlugin } = await import(
    'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js'
  );

  if (!scene.plugins.get(PLUGIN_KEY)) {
    scene.plugins.install(PLUGIN_KEY, VirtualJoystickPlugin, true);
  }
  const plugin = scene.plugins.get(PLUGIN_KEY);

  const baseX = JOYSTICK_RADIUS + 60;
  const baseY = scene.scale.height - JOYSTICK_RADIUS - 60;

  // Base + thumb are screen-fixed (scrollFactor 0) and drawn above the world.
  const base = scene.add
    .circle(0, 0, JOYSTICK_RADIUS, 0x111122, 0.35)
    .setScrollFactor(0)
    .setDepth(10000);
  const thumb = scene.add
    .circle(0, 0, JOYSTICK_RADIUS * 0.5, 0xf5f0e6, 0.6)
    .setScrollFactor(0)
    .setDepth(10001);

  const joystick = plugin.add(scene, {
    x: baseX,
    y: baseY,
    radius: JOYSTICK_RADIUS,
    base,
    thumb,
    dir: '4dir', // restrict to up/down/left/right to match the grid movement
    forceMin: 16,
    fixed: true,
  });

  // createCursorKeys() returns { up, down, left, right }, each with `.isDown` —
  // drop-in compatible with scene.input.keyboard.createCursorKeys().
  scene.touchCursors = joystick.createCursorKeys();

  // Let TapToInteract ignore taps that land on the joystick (it's canvas-drawn,
  // so the DOM data-touch-control check can't see it).
  scene.touchJoystickRegion = { x: baseX, y: baseY, radius: JOYSTICK_RADIUS * 1.4 };

  return {
    joystick,
    destroy() {
      scene.touchCursors = null;
      scene.touchJoystickRegion = null;
      joystick.destroy();
      base.destroy();
      thumb.destroy();
    },
  };
}
