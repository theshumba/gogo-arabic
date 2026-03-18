/**
 * FastTravelManager — Handles fast travel between discovered zones.
 * Listens for FAST_TRAVEL events and triggers zone transitions.
 */
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';

export class FastTravelManager {
  constructor(scene) {
    this.scene = scene;
    this._listener = null;
    this._init();
  }

  _init() {
    this._listener = ({ zoneName }) => {
      this.travelToZone(zoneName);
    };
    EventBus.on(EVENTS.FAST_TRAVEL, this._listener);
  }

  /**
   * Travel to a specific zone by triggering zone transition.
   * @param {string} zoneName - Target zone ID
   */
  travelToZone(zoneName) {
    if (!zoneName || !this.scene) return;
    EventBus.emit(EVENTS.ZONE_TRANSITION, { targetZone: zoneName });
  }

  /**
   * Check player's current location for fast travel points.
   * @param {number} x - Player world X
   * @param {number} y - Player world Y
   * @param {string} currentZone - Current zone ID
   */
  checkCurrentLocation(x, y, currentZone) {
    // Placeholder — future: detect proximity to fast travel points
  }

  destroy() {
    if (this._listener) {
      EventBus.off(EVENTS.FAST_TRAVEL, this._listener);
      this._listener = null;
    }
    this.scene = null;
  }
}
