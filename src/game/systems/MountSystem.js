/**
 * MountSystem — Handles mount (camel) riding for faster overworld travel.
 * Mounts increase player movement speed and change sprite animation.
 */

export class MountSystem {
  constructor(scene) {
    this.scene = scene;
    this.currentMount = null;
    this.speedMultiplier = 1.0;
  }

  /**
   * Mount a rideable creature.
   * @param {string} mountType - Mount type (e.g. 'camel', 'horse')
   */
  mount(mountType) {
    if (this.currentMount) return; // Already mounted
    this.currentMount = mountType;
    this.speedMultiplier = mountType === 'camel' ? 1.8 : 1.5;
  }

  /**
   * Dismount current mount.
   */
  dismount() {
    this.currentMount = null;
    this.speedMultiplier = 1.0;
  }

  /**
   * Check if player is currently mounted.
   * @returns {boolean}
   */
  isMounted() {
    return this.currentMount !== null;
  }

  /**
   * Get current speed multiplier.
   * @returns {number}
   */
  getSpeedMultiplier() {
    return this.speedMultiplier;
  }

  destroy() {
    this.currentMount = null;
    this.scene = null;
  }
}
