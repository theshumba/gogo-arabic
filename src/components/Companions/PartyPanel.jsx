/**
 * PartyPanel.jsx — Active party management panel
 *
 * Shows 2 slots (battle and exploration) with controls to assign/remove companions.
 */

import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  selectActiveParty,
  selectAllCompanions,
  selectRecruitedCompanions,
  setActiveCompanion,
  removeActiveCompanion,
} from '../../store/slices/companionSlice.js';
import { COMPANIONS } from '../../data/companions.js';
import RelationshipBar from './RelationshipBar.jsx';

export default function PartyPanel() {
  const dispatch = useDispatch();
  const activeParty = useSelector(selectActiveParty);
  const allCompanions = useSelector(selectAllCompanions);
  const recruitedCompanions = useSelector(selectRecruitedCompanions);

  const [selectingSlot, setSelectingSlot] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  const handleChangeSlot = useCallback((slot) => {
    setSelectingSlot(slot);
  }, []);

  const handleSelectCompanion = useCallback((companionId) => {
    if (!selectingSlot) return;

    // Check if companion is already in the other slot
    const otherSlot = selectingSlot === 'battle' ? 'exploration' : 'battle';
    if (activeParty[otherSlot] === companionId) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 2000);
      return;
    }

    dispatch(setActiveCompanion({ slot: selectingSlot, companionId }));
    setSelectingSlot(null);
  }, [selectingSlot, activeParty, dispatch]);

  const handleRemove = useCallback((slot) => {
    dispatch(removeActiveCompanion(slot));
  }, [dispatch]);

  const renderSlot = (slot, label, icon) => {
    const companionId = activeParty[slot];
    const companion = companionId ? allCompanions[companionId] : null;
    const companionDef = companionId ? COMPANIONS[companionId] : null;

    return (
      <div
        style={{
          width: '280px',
          background: '#1a1a2e',
          border: '2px solid #4A90D9',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Slot header */}
        <div
          style={{
            fontSize: '10px',
            fontFamily: "'Press Start 2P', monospace",
            color: '#4A90D9',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '16px' }}>{icon}</span>
          {label}
        </div>

        {/* Companion details or empty state */}
        {companion && companionDef ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: `linear-gradient(135deg, ${companionDef.colorPalette.primary}66, ${companionDef.colorPalette.secondary}66)`,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                {slot === 'battle' ? '⚔️' : '🧭'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: companionDef.colorPalette.primary }}>
                  {companionDef.name}
                </div>
                <div style={{ fontSize: '8px', color: '#a0a0a0' }}>
                  {companionDef.title}
                </div>
              </div>
            </div>

            <RelationshipBar
              value={companion.relationship}
              maxValue={100}
              showLabel={false}
              size="small"
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleChangeSlot(slot)}
                style={{
                  flex: 1,
                  background: '#4A90D9',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  fontSize: '8px',
                  fontFamily: "'Press Start 2P', monospace",
                  cursor: 'pointer',
                }}
              >
                Change
              </button>
              <button
                onClick={() => handleRemove(slot)}
                style={{
                  flex: 1,
                  background: '#E74C3C',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  fontSize: '8px',
                  fontFamily: "'Press Start 2P', monospace",
                  cursor: 'pointer',
                }}
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => handleChangeSlot(slot)}
            style={{
              background: '#2C3E50',
              color: '#a0a0a0',
              border: '2px dashed #4A90D9',
              borderRadius: '4px',
              padding: '24px',
              fontSize: '10px',
              fontFamily: "'Press Start 2P', monospace",
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '24px' }}>➕</span>
            Assign Companion
          </button>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Active party slots */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        {renderSlot('battle', 'Battle Companion', '⚔️')}
        {renderSlot('exploration', 'Exploration Companion', '🧭')}
      </div>

      {/* Warning toast */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#E74C3C',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '10px',
              fontFamily: "'Press Start 2P', monospace",
              zIndex: 10000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
          >
            Companion is already in the other slot!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Companion selection modal */}
      <AnimatePresence>
        {selectingSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectingSlot(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#1a1a2e',
                border: '3px solid #4A90D9',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
            >
              <h2
                style={{
                  fontSize: '12px',
                  fontFamily: "'Press Start 2P', monospace",
                  color: '#4A90D9',
                  marginBottom: '16px',
                  textAlign: 'center',
                }}
              >
                Select Companion for {selectingSlot === 'battle' ? 'Battle' : 'Exploration'}
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                }}
              >
                {recruitedCompanions.map((companion) => {
                  const companionDef = COMPANIONS[companion.id];
                  return (
                    <motion.button
                      key={companion.id}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleSelectCompanion(companion.id)}
                      style={{
                        background: '#2C3E50',
                        border: `2px solid ${companionDef.colorPalette.primary}`,
                        borderRadius: '8px',
                        padding: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ fontSize: '11px', color: companionDef.colorPalette.primary }}>
                        {companionDef.name}
                      </div>
                      <div style={{ fontSize: '8px', color: '#a0a0a0', marginTop: '4px' }}>
                        {companionDef.title}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <button
                onClick={() => setSelectingSlot(null)}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  background: '#E74C3C',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '12px',
                  fontSize: '10px',
                  fontFamily: "'Press Start 2P', monospace",
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
