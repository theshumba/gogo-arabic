/**
 * BattleMenu.jsx — Action selection during player turn.
 *
 * Shows Attack, Magic, Item, Defend, Flee buttons with Arabic labels.
 * Positioned bottom-right, RTL layout. Keyboard shortcuts 1-5.
 * Only visible during ACTION_SELECT state.
 */

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';
import { audioManager } from '../../services/audio.js';

const MENU_ACTIONS = [
  { id: 'attack', label: 'Attack', arabic: 'هجوم', key: '1' },
  { id: 'magic', label: 'Magic', arabic: 'سحر', key: '2' },
  { id: 'item', label: 'Item', arabic: 'أداة', key: '3' },
  { id: 'defend', label: 'Defend', arabic: 'دفاع', key: '4' },
  { id: 'flee', label: 'Flee', arabic: 'هروب', key: '5' },
];

const reduceMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function BattleMenu({ visible, availableActions, onAction }) {
  const handleAction = useCallback(
    (actionId) => {
      audioManager.playSFX('click');
      EventBus.emit(EVENTS.BATTLE_ACTION_SELECTED, {
        action: actionId,
        target: 0,
      });
      onAction?.(actionId);
    },
    [onAction]
  );

  // Keyboard shortcuts (1-5)
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e) => {
      const action = MENU_ACTIONS.find((a) => a.key === e.key);
      if (action && availableActions.includes(action.id)) {
        e.preventDefault();
        handleAction(action.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, availableActions, handleAction]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="battle-menu"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: reduceMotion ? 0.1 : 0.2 }}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            direction: 'rtl',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {MENU_ACTIONS.filter((a) => availableActions.includes(a.id)).map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              aria-label={`${action.label} (${action.key})`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 18px',
                background: 'rgba(26, 26, 46, 0.92)',
                border: '2px solid rgba(226, 182, 89, 0.6)',
                color: '#f5f0e8',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '11px',
                cursor: 'pointer',
                direction: 'rtl',
                minWidth: '180px',
              }}
            >
              <span style={{ fontFamily: "'Amiri', serif", fontSize: '16px' }} lang="ar">
                {action.arabic}
              </span>
              <span style={{ fontSize: '10px', opacity: 0.7 }}>{action.label}</span>
              <kbd
                style={{
                  marginRight: 'auto',
                  fontSize: '9px',
                  opacity: 0.5,
                  background: 'rgba(255,255,255,0.1)',
                  padding: '2px 6px',
                  borderRadius: '2px',
                }}
              >
                {action.key}
              </kbd>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
