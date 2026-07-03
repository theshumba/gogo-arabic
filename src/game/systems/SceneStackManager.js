// For any transition animations added later (door fade, etc.):
// const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// const duration = prefersReducedMotion ? 0 : 300;

/**
 * SceneStackManager — Manages building entry/exit via pause/launch/resume.
 * Follows the WorldScene delegation pattern: instantiated in create(), destroyed in shutdown().
 */
export class SceneStackManager {
  constructor(scene) {
    this.scene = scene;
    this._stack = [];
  }

  /**
   * Enter a building — pause WorldScene, launch interior scene.
   * @param {string} interiorSceneKey - Phaser scene key to launch
   * @param {Object} data - Data to pass to the interior scene
   */
  pushScene(interiorSceneKey, data = {}) {
    this._stack.push(this.scene.scene.key);
    this.scene.scene.pause();
    this.scene.scene.launch(interiorSceneKey, {
      ...data,
      returnSceneKey: this.scene.scene.key,
    });
  }

  /**
   * Exit a building — stop interior scene, resume WorldScene.
   * @returns {string|null} The popped scene key, or null if stack was empty
   */
  popScene() {
    if (this._stack.length === 0) return null;

    // Phaser 3's SceneManager API is getScenes(isActive) — there is no
    // getActiveScenes(), and a Scene has no .manager (only the ScenePlugin at
    // scene.scene does). The old call threw "Cannot read properties of
    // undefined (reading 'getActiveScenes')" on every live interior exit,
    // stranding the player inside (found by the oasis_village world-rebuild
    // door probe, 2026-07-03; the unit mocks had faked the nonexistent API).
    const activeScenes = this.scene.scene.manager.getScenes(true);
    const interiorScene = activeScenes.find(
      (s) => s !== this.scene && s.scene.key !== this.scene.scene.key
    );

    if (interiorScene) {
      interiorScene.scene.stop();
    }

    this.scene.scene.resume();
    return this._stack.pop();
  }

  /** Check if we're inside a building (stack depth > 0) */
  get isInBuilding() {
    return this._stack.length > 0;
  }

  /** Get current stack depth */
  get depth() {
    return this._stack.length;
  }

  destroy() {
    while (this._stack.length > 0) {
      this.popScene();
    }
    this._stack = [];
  }
}
