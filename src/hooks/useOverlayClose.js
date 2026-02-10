import { useEffect, useCallback } from 'react';
import { EventBus } from '../utils/eventBus.js';
import { EVENTS } from '../utils/eventBusTypes.js';

/**
 * useOverlayClose -- centralized overlay dismissal
 * Handles: ESC key, guaranteed unfreeze-player on close and unmount
 *
 * @param {function} onClose - The close handler (dispatch closeX action, etc.)
 * @param {object} options
 * @param {boolean} options.escEnabled - Allow ESC to close (default: true)
 * @param {function} options.beforeClose - Optional guard (return false to prevent close)
 */
export function useOverlayClose(onClose, options = {}) {
  const { escEnabled = true, beforeClose = null } = options;

  const handleClose = useCallback(() => {
    if (beforeClose && beforeClose() === false) return;
    onClose();
    EventBus.emit(EVENTS.PLAYER_UNFREEZE);
  }, [onClose, beforeClose]);

  // ESC key handler
  useEffect(() => {
    if (!escEnabled) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true); // capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [escEnabled, handleClose]);

  // Unmount safety net -- if overlay is removed without explicit close, still unfreeze
  useEffect(() => {
    return () => {
      EventBus.emit(EVENTS.PLAYER_UNFREEZE);
    };
  }, []);

  return handleClose;
}
