/**
 * SpellMenu.jsx — Full spell management overlay.
 *
 * Shows all discovered spells with element filtering, mastery indicators,
 * and hotbar assignment. Opens via MAGIC_SPELL_MENU_OPEN event.
 */

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';
import {
  selectDiscoveredRoots,
  selectAllRootMastery,
  selectEquippedSpells,
  equipSpell,
  unequipSpell,
} from '../../store/slices/magicSlice.js';
import { ELEMENT_INFO } from '../../data/rootMagic.js';
import { SPELLS, getSpellsByElement } from '../../data/spellData.js';
import { SPELL_TIERS } from '../../data/rootMagic.js';

const ELEMENT_ORDER = [
  'fire',
  'water',
  'earth',
  'wind',
  'light',
  'shadow',
  'time',
  'knowledge',
  'creation',
  'protection',
];

function SpellCard({ spell, mastery, isEquipped, isLocked, onClick }) {
  const elementInfo = ELEMENT_INFO[spell.element];
  const elementColor = `#${elementInfo.color.toString(16).padStart(6, '0')}`;

  const level = mastery?.level || 1;
  const xp = mastery?.xp || 0;
  const xpInLevel = xp % 100;
  const xpProgress = xpInLevel / 100;

  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      whileHover={!isLocked ? { scale: 1.05 } : {}}
      whileTap={!isLocked ? { scale: 0.95 } : {}}
      style={{
        backgroundColor: isLocked
          ? '#1a1a1a'
          : `${elementColor}1a`,
        border: `2px solid ${isEquipped ? '#FFD700' : elementColor}`,
        borderRadius: '8px',
        padding: '12px',
        cursor: isLocked ? 'not-allowed' : 'pointer',
        opacity: isLocked ? 0.5 : 1,
        position: 'relative',
        textAlign: 'center',
        minWidth: '140px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      {isEquipped && (
        <div
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            fontSize: '8px',
            fontFamily: "'Press Start 2P', monospace",
            color: '#FFD700',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '2px 4px',
            borderRadius: '2px',
          }}
        >
          EQUIPPED
        </div>
      )}

      <div
        style={{
          fontSize: '24px',
          fontFamily: 'Amiri, serif',
          fontWeight: 'bold',
          color: elementColor,
          direction: 'rtl',
        }}
      >
        {spell.rootId}
      </div>

      <div
        style={{
          fontSize: '10px',
          fontFamily: "'Press Start 2P', monospace",
          color: '#fff',
        }}
      >
        {spell.name}
      </div>

      <div
        style={{
          fontSize: '9px',
          fontFamily: 'Amiri, serif',
          color: '#aaa',
        }}
      >
        {spell.nameArabic}
      </div>

      {!isLocked && (
        <>
          <div
            style={{
              fontSize: '8px',
              fontFamily: "'Press Start 2P', monospace",
              color: elementColor,
              marginTop: '4px',
            }}
          >
            Lvl {level}
          </div>

          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#222',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${xpProgress * 100}%`,
                height: '100%',
                backgroundColor: elementColor,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </>
      )}

      <div
        style={{
          fontSize: '8px',
          fontFamily: "'Press Start 2P', monospace",
          color: '#888',
          marginTop: '4px',
        }}
      >
        Form {spell.form} • {spell.mpCost} MP
      </div>

      {isLocked && (
        <div
          style={{
            fontSize: '8px',
            fontFamily: "'Press Start 2P', monospace",
            color: '#ff4444',
            marginTop: '4px',
          }}
        >
          Requires Form {spell.form}
        </div>
      )}
    </motion.button>
  );
}

function HotbarSlot({ index, spell, onClick }) {
  const elementInfo = spell ? ELEMENT_INFO[spell.element] : null;
  const elementColor = elementInfo ? `#${elementInfo.color.toString(16).padStart(6, '0')}` : '#444';

  return (
    <button
      onClick={onClick}
      style={{
        width: '48px',
        height: '48px',
        border: `2px solid ${elementColor}`,
        backgroundColor: spell ? '#1a1a1a' : '#222',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          fontSize: '8px',
          fontFamily: "'Press Start 2P', monospace",
          color: '#666',
        }}
      >
        {index + 1}
      </div>
      {spell ? (
        <div
          style={{
            fontSize: '12px',
            fontFamily: 'Amiri, serif',
            color: elementColor,
            direction: 'rtl',
          }}
        >
          {spell.rootId.split('-')[0]}
        </div>
      ) : (
        <div
          style={{
            fontSize: '8px',
            fontFamily: "'Press Start 2P', monospace",
            color: '#666',
          }}
        >
          Empty
        </div>
      )}
    </button>
  );
}

export default function SpellMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSlot, setSelectedSlot] = useState(null);

  const dispatch = useDispatch();
  const discoveredRoots = useSelector(selectDiscoveredRoots);
  const rootMastery = useSelector(selectAllRootMastery);
  const equippedSpells = useSelector(selectEquippedSpells);

  useEffect(() => {
    const onOpen = () => {
      setIsOpen(true);
      EventBus.emit(EVENTS.PLAYER_FREEZE);
    };

    const onClose = () => {
      setIsOpen(false);
      setSelectedSlot(null);
      EventBus.emit(EVENTS.PLAYER_UNFREEZE);
    };

    EventBus.on(EVENTS.MAGIC_SPELL_MENU_OPEN, onOpen);
    EventBus.on(EVENTS.MAGIC_SPELL_MENU_CLOSE, onClose);

    return () => {
      EventBus.off(EVENTS.MAGIC_SPELL_MENU_OPEN, onOpen);
      EventBus.off(EVENTS.MAGIC_SPELL_MENU_CLOSE, onClose);
    };
  }, []);

  const handleClose = () => {
    EventBus.emit(EVENTS.MAGIC_SPELL_MENU_CLOSE);
  };

  const handleSpellClick = (spell) => {
    if (selectedSlot !== null) {
      // Assign to selected slot
      dispatch(equipSpell({ slot: selectedSlot, rootId: spell.rootId, form: spell.form }));
      setSelectedSlot(null);
    } else {
      // Auto-assign to next empty slot
      const emptySlot = equippedSpells.findIndex((s) => !s);
      if (emptySlot !== -1) {
        dispatch(equipSpell({ slot: emptySlot, rootId: spell.rootId, form: spell.form }));
      } else {
        // Show slot picker
        setSelectedSlot(0);
      }
    }
  };

  const handleSlotClick = (index) => {
    if (equippedSpells[index]) {
      // Unequip
      dispatch(unequipSpell(index));
    } else {
      // Select slot for assignment
      setSelectedSlot(index);
    }
  };

  // Filter spells
  const discoveredSpells = SPELLS.filter((spell) => discoveredRoots.includes(spell.rootId));
  const filteredSpells =
    selectedFilter === 'all'
      ? discoveredSpells
      : discoveredSpells.filter((spell) => spell.element === selectedFilter);

  // Count spells per element
  const elementCounts = {};
  ELEMENT_ORDER.forEach((element) => {
    elementCounts[element] = discoveredSpells.filter((s) => s.element === element).length;
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 500,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '16px',
              color: '#fff',
            }}
          >
            Spells
          </h2>
          <button
            onClick={handleClose}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '14px',
              color: '#fff',
              backgroundColor: '#444',
              border: 'none',
              padding: '8px 16px',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            X
          </button>
        </div>

        {/* Element filter tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setSelectedFilter('all')}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '10px',
              color: selectedFilter === 'all' ? '#000' : '#fff',
              backgroundColor: selectedFilter === 'all' ? '#fff' : '#333',
              border: selectedFilter === 'all' ? '2px solid #FFD700' : '2px solid #666',
              padding: '6px 12px',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            All ({discoveredSpells.length})
          </button>
          {ELEMENT_ORDER.map((element) => {
            const elementInfo = ELEMENT_INFO[element];
            const color = `#${elementInfo.color.toString(16).padStart(6, '0')}`;
            const count = elementCounts[element];

            return (
              <button
                key={element}
                onClick={() => setSelectedFilter(element)}
                style={{
                  fontFamily: 'Amiri, serif',
                  fontSize: '12px',
                  color: selectedFilter === element ? '#000' : color,
                  backgroundColor: selectedFilter === element ? color : '#333',
                  border: `2px solid ${color}`,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                }}
              >
                {elementInfo.arabic} ({count})
              </button>
            );
          })}
        </div>

        {/* Spell grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
            flex: 1,
          }}
        >
          {filteredSpells.map((spell) => {
            const mastery = rootMastery[spell.rootId];
            const isLocked = !mastery?.formsUnlocked?.includes(spell.form);
            const isEquipped = equippedSpells.some(
              (s) => s?.rootId === spell.rootId && s?.form === spell.form
            );

            return (
              <SpellCard
                key={spell.id}
                spell={spell}
                mastery={mastery}
                isEquipped={isEquipped}
                isLocked={isLocked}
                onClick={() => !isLocked && handleSpellClick(spell)}
              />
            );
          })}
        </div>

        {/* Hotbar assignment area */}
        <div
          style={{
            borderTop: '2px solid #666',
            paddingTop: '16px',
          }}
        >
          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '10px',
              color: '#888',
              marginBottom: '8px',
              textAlign: 'center',
            }}
          >
            {selectedSlot !== null
              ? `Select a spell to assign to slot ${selectedSlot + 1}`
              : 'Hotbar (click to unequip, or select then click spell)'}
          </div>
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
                  border: selectedSlot === index ? '2px solid #FFD700' : '2px solid transparent',
                  borderRadius: '6px',
                  padding: '2px',
                }}
              >
                <HotbarSlot index={index} spell={spell} onClick={() => handleSlotClick(index)} />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
