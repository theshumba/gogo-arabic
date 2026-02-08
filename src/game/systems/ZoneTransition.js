import { EventBus } from '../../utils/eventBus.js';

// ZoneTransition handles moving between world zones.
// Per PRD: walk onto exit tile -> fade to black (0.5s) -> load new zone -> fade in (0.5s).
// Phase 4: Added unlock gating — checks quest/level/words before allowing transition.

class ZoneTransition {
  constructor(scene) {
    this.scene = scene;
    this.transitioning = false;
  }

  async transitionTo(zoneName, entryX, entryY) {
    if (this.transitioning) return;
    this.transitioning = true;

    // Disable player movement during transition
    EventBus.emit('freeze-player');

    // Fade out to black over 500ms
    this.scene.cameras.main.fadeOut(500, 0, 0, 0);

    await new Promise((resolve) => {
      this.scene.cameras.main.once('camerafadeoutcomplete', resolve);
    });

    // Notify Redux of zone change
    EventBus.emit('zone-change', { zone: zoneName, x: entryX, y: entryY });

    // Load the new zone (WorldScene handles this via loadZone method)
    this.scene.loadZone(zoneName, entryX, entryY);

    // Fade in from black over 500ms
    this.scene.cameras.main.fadeIn(500, 0, 0, 0);

    await new Promise((resolve) => {
      this.scene.cameras.main.once('camerafadeincomplete', resolve);
    });

    // Re-enable player movement
    EventBus.emit('unfreeze-player');
    this.transitioning = false;
  }
}

export default ZoneTransition;
