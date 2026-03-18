/**
 * MountSystem — stub
 *
 * Placeholder for the mount/ride system. Currently a no-op
 * to unblock the build. Full implementation will be added
 * when the mount feature is developed.
 */
export class MountSystem {
  constructor(scene) {
    this.scene = scene;
  }

  mount(/* type */) {
    // No-op — mount system not yet implemented
  }

  unmount() {
    // No-op
  }

  destroy() {
    this.scene = null;
  }
}
