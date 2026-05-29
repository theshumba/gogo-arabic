import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';
import styles from './TouchControls.module.css';

/**
 * TouchControls — Phase 103-03 (MOB-01/02/05)
 *
 * Touch-only HUD layer. The movement joystick itself is drawn on the Phaser
 * canvas by TouchInputAdapter; this React layer provides the Interact action
 * button. The whole container is hidden on desktop via @media (pointer: coarse)
 * in the CSS (MOB-05 — keyboard/mouse path untouched).
 *
 * Every element carries data-touch-control so TapToInteract ignores taps that
 * land here (they must not trigger a world interaction).
 */
export default function TouchControls() {
  const handleInteract = () => EventBus.emit(EVENTS.TOUCH_INTERACT);

  return (
    <div className={styles.touchControls} data-touch-control>
      <button
        type="button"
        className={styles.interactButton}
        data-touch-control
        onPointerDown={handleInteract}
        aria-label="Interact"
      >
        <span aria-hidden="true">✦</span>
      </button>
    </div>
  );
}
