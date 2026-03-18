/**
 * FastTravelManager — stub
 *
 * Placeholder for the fast-travel system. Currently a no-op
 * to unblock the build. Full implementation will be added
 * when the fast-travel feature is developed.
 */
export class FastTravelManager {
  constructor(scene) {
    this.scene = scene;
  }

  destroy() {
    this.scene = null;
  }
}
