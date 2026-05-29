/**
 * TapToInteract — Phase 103-03 (MOB-02)
 *
 * On a pointerdown anywhere in the world, find the nearest interactable within
 * RADIUS world-pixels of the tapped point and activate it via the SAME code path
 * as the keyboard interact key. Taps that land on a touch-control element
 * (the virtual joystick / action buttons, marked `data-touch-control`) are
 * ignored so moving the stick never triggers an interaction.
 */

export const RADIUS = 64;

export class TapToInteract {
  /**
   * @param {Phaser.Scene} scene
   * @param {InteractableManager} interactableManager
   * @param {() => boolean} getCooldown  - reads the current interact cooldown flag
   * @param {(v: boolean) => void} setCooldown - sets the interact cooldown flag
   */
  constructor(scene, interactableManager, getCooldown, setCooldown) {
    this.scene = scene;
    this.interactableManager = interactableManager;
    this.getCooldown = getCooldown;
    this.setCooldown = setCooldown;
    this._onPointerDown = this._onPointerDown.bind(this);
    scene.input.on('pointerdown', this._onPointerDown);
  }

  /** True when the tap originated on a touch control (DOM action button) or
   *  inside the on-canvas virtual-joystick region. */
  _isTouchControlTap(pointer) {
    // DOM action buttons (React overlay) mark themselves with data-touch-control.
    const target = pointer && pointer.event && pointer.event.target;
    if (target && typeof target.closest === 'function' && target.closest('[data-touch-control]')) {
      return true;
    }
    // The rex joystick renders on the Phaser canvas, so DOM exclusion can't see
    // it — exclude its screen-space region instead (set by TouchInputAdapter).
    const jr = this.scene.touchJoystickRegion;
    if (jr) {
      const d = Math.hypot(pointer.x - jr.x, pointer.y - jr.y);
      if (d <= jr.radius) return true;
    }
    return false;
  }

  _onPointerDown(pointer) {
    if (this._isTouchControlTap(pointer)) return;
    const obj = this.interactableManager.findNearest(pointer.worldX, pointer.worldY, RADIUS);
    if (obj) {
      this.interactableManager.activate(obj, this.getCooldown(), this.setCooldown);
    }
  }

  destroy() {
    this.scene.input.off('pointerdown', this._onPointerDown);
  }
}
