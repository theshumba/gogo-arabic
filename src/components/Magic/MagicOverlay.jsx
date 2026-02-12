/**
 * MagicOverlay.jsx — Spell hotbar overlay shown during battle.
 *
 * Shows 6-slot hotbar with spell icons, MP bar, and affinity indicator.
 * Listens to EventBus for cast completion and MP depletion events.
 * Emits MAGIC_CAST_REQUESTED on spell click.
 */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';
import { selectEquippedSpells, selectAffinity } from '../../store/slices/magicSlice.js';
import { ELEMENT_INFO } from '../../data/rootMagic.js';

function SpellSlot({ spell, slot, playerMP, onClick, onRightClick }) {
  const isEmpty = !spell;
  const disabled = spell && playerMP < spell.mpCost;

  const elementInfo = spell ? ELEMENT_INFO[spell.element] : null;
  const elementColor = elementInfo ? `#${elementInfo.color.toString(16).padStart(6, '0')}` : '#666';

  if (isEmpty) {
    return (
      <button
        className="spell-slot"
        style={{
          width: '64px',
          height: '64px',
          border: '2px solid #444',
          backgroundColor: '#222',
          color: '#666',
          fontSize: '10px',
          fontFamily: "'Press Start 2P', monospace",
          cursor: 'not-allowed',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        disabled
      >
        Empty
      </button>
    );
  }

  return (
    <button
      className="spell-slot"
      onClick={() => !disabled && onClick(slot)}
      onContextMenu={(e) => {
        e.preventDefault();
        onRightClick();
      }}
      style={{
        width: '64px',
        height: '64px',
        border: `2px solid ${elementColor}`,
        backgroundColor: disabled ? '#333' : '#1a1a1a',
        color: disabled ? '#666' : elementColor,
        fontSize: '16px',
        fontFamily: 'Amiri, serif',
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: '4px',
        position: 'relative',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
      }}
      disabled={disabled}
    >
      <div
        style={{
          fontSize: '18px',
          fontWeight: 'bold',
          direction: 'rtl',
        }}
      >
        {spell.rootId}
      </div>
      <div
        style={{
          fontSize: '8px',
          fontFamily: "'Press Start 2P', monospace",
          marginTop: '2px',
        }}
      >
        {elementInfo?.label}
      </div>
      <div
        style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          fontSize: '8px',
          fontFamily: "'Press Start 2P', monospace",
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '2px 4px',
          borderRadius: '2px',
        }}
      >
        {spell.mpCost}
      </div>
    </button>
  );
}

function MPBar({ current, max }) {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  const color = percentage > 50 ? '#32CD32' : percentage > 20 ? '#FFD700' : '#FF4500';

  return (
    <div
      style={{
        width: '100%',
        height: '20px',
        backgroundColor: '#222',
        border: '2px solid #444',
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative',
        marginTop: '8px',
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          height: '100%',
          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '10px',
          fontFamily: "'Press Start 2P', monospace",
          color: '#fff',
          textShadow: '0 0 4px rgba(0, 0, 0, 0.8)',
        }}
      >
        {current}/{max} MP
      </div>
    </div>
  );
}

function AffinityIndicator({ affinity }) {
  if (!affinity.primary) return null;

  const elementInfo = ELEMENT_INFO[affinity.primary];
  const color = `#${elementInfo.color.toString(16).padStart(6, '0')}`;

  return (
    <div
      style={{
        position: 'absolute',
        top: '-40px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: `2px solid ${color}`,
        borderRadius: '4px',
        padding: '4px 8px',
        fontSize: '10px',
        fontFamily: "'Press Start 2P', monospace",
        color,
        whiteSpace: 'nowrap',
      }}
      title={`Primary: ${elementInfo.label} (2x power)`}
    >
      <span style={{ fontFamily: 'Amiri, serif', fontSize: '14px' }}>{elementInfo.arabic}</span>
      {' '}
      <span>2x</span>
    </div>
  );
}

export default function MagicOverlay() {
  const [shakeMP, setShakeMP] = useState(false);
  const [flashSlot, setFlashSlot] = useState(null);

  const currentTurn = useSelector((state) => state.battle.currentTurn);
  const playerMP = useSelector((state) => state.battle.playerMP);
  const playerMaxMP = useSelector((state) => state.battle.playerMaxMP);
  const equippedSpells = useSelector(selectEquippedSpells);
  const affinity = useSelector(selectAffinity);

  const isPlayerTurn = currentTurn === 'player';

  useEffect(() => {
    const onCastComplete = ({ slot }) => {
      setFlashSlot(slot);
      setTimeout(() => setFlashSlot(null), 300);
    };

    const onMPDepleted = () => {
      setShakeMP(true);
      setTimeout(() => setShakeMP(false), 500);
    };

    EventBus.on(EVENTS.MAGIC_CAST_COMPLETE, onCastComplete);
    EventBus.on(EVENTS.MAGIC_MP_DEPLETED, onMPDepleted);

    return () => {
      EventBus.off(EVENTS.MAGIC_CAST_COMPLETE, onCastComplete);
      EventBus.off(EVENTS.MAGIC_MP_DEPLETED, onMPDepleted);
    };
  }, []);

  const handleSpellClick = (slot) => {
    EventBus.emit(EVENTS.MAGIC_CAST_REQUESTED, { slot });
  };

  const handleSpellMenuOpen = () => {
    EventBus.emit(EVENTS.MAGIC_SPELL_MENU_OPEN);
  };

  if (!isPlayerTurn) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 260,
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            position: 'relative',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '2px solid #666',
            borderRadius: '8px',
            padding: '12px',
            minWidth: '420px',
          }}
        >
          <AffinityIndicator affinity={affinity} />

          <div
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
            }}
          >
            {equippedSpells.map((spell, index) => (
              <div
                key={index}
                style={{
                  transform: flashSlot === index ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.3s ease',
                }}
              >
                <SpellSlot
                  spell={spell}
                  slot={index}
                  playerMP={playerMP}
                  onClick={handleSpellClick}
                  onRightClick={handleSpellMenuOpen}
                />
              </div>
            ))}
          </div>

          <motion.div
            animate={shakeMP ? { x: [-4, 4, -4, 4, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <MPBar current={playerMP} max={playerMaxMP} />
          </motion.div>

          <div
            style={{
              marginTop: '8px',
              fontSize: '8px',
              fontFamily: "'Press Start 2P', monospace",
              color: '#888',
              textAlign: 'center',
            }}
          >
            Right-click for spell menu
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
