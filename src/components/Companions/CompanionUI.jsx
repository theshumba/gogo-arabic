/**
 * CompanionUI.jsx — Main companion roster overlay
 *
 * Shows all 12 companions with filter tabs, party management panel,
 * and detailed view with gift-giving interface.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  selectAllCompanions,
  selectActiveParty,
  selectRecruitedCompanions,
  giveGift,
} from '../../store/slices/companionSlice.js';
import { selectInventoryItems, removeItem } from '../../store/slices/inventorySlice.js';
import { COMPANIONS, COMPANION_ROLES, TEACHING_SPECIALTIES, GIFT_CATEGORIES } from '../../data/companions.js';
import { getGiftBonus } from '../../utils/companionRelationship.js';
import { EQUIPMENT_DATA } from '../../data/equipment.js';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';
import CompanionCard from './CompanionCard.jsx';
import PartyPanel from './PartyPanel.jsx';
import RelationshipBar from './RelationshipBar.jsx';

export default function CompanionUI({ onClose }) {
  const dispatch = useDispatch();
  const allCompanions = useSelector(selectAllCompanions);
  const activeParty = useSelector(selectActiveParty);
  const recruitedCompanions = useSelector(selectRecruitedCompanions);
  const inventoryItems = useSelector(selectInventoryItems);

  const [selectedCompanionId, setSelectedCompanionId] = useState(null);
  const [filterTab, setFilterTab] = useState('all');
  const [showGiftMenu, setShowGiftMenu] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showGiftMenu) {
          setShowGiftMenu(false);
        } else if (selectedCompanionId) {
          setSelectedCompanionId(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, selectedCompanionId, showGiftMenu]);

  // Filter companions
  const filteredCompanions = useMemo(() => {
    const companionArray = Object.values(allCompanions);

    if (filterTab === 'recruited') {
      return companionArray.filter(c => c.recruited);
    }
    if (filterTab === 'locked') {
      return companionArray.filter(c => !c.recruited);
    }
    if (Object.keys(COMPANION_ROLES).includes(filterTab)) {
      return companionArray.filter(c => {
        const def = COMPANIONS[c.id];
        return def && def.battleRole === filterTab;
      });
    }
    if (Object.keys(TEACHING_SPECIALTIES).includes(filterTab)) {
      return companionArray.filter(c => {
        const def = COMPANIONS[c.id];
        return def && def.teachingSpecialty === filterTab;
      });
    }

    return companionArray;
  }, [allCompanions, filterTab]);

  // Handle companion card click
  const handleCompanionClick = useCallback((companionId) => {
    setSelectedCompanionId(companionId);
  }, []);

  // Handle gift selection
  const handleGiveGift = useCallback((giftItemId) => {
    if (!selectedCompanionId) return;

    const companion = allCompanions[selectedCompanionId];
    const companionDef = COMPANIONS[selectedCompanionId];
    if (!companion || !companionDef) return;

    // Determine gift category from item data
    const itemData = EQUIPMENT_DATA[giftItemId];
    let giftCategory = 'food'; // default fallback

    // Map item categories to gift categories
    if (itemData) {
      if (itemData.slot === 'accessory1' || itemData.slot === 'accessory2') {
        giftCategory = 'gems';
      }
      // For Phase 30, we'll use a simple heuristic
      // In Phase 31 (crafting), we'll have proper gift items
      // For now, accessories = gems, everything else = crafts
      else {
        giftCategory = 'crafts';
      }
    }

    const relationshipGain = getGiftBonus(giftCategory, companionDef.preferredGifts);

    // Dispatch gift action
    dispatch(giveGift({
      companionId: selectedCompanionId,
      giftId: giftItemId,
      relationshipGain,
      timestamp: Date.now(),
    }));

    // Remove item from inventory
    dispatch(removeItem({ itemId: giftItemId, quantity: 1 }));

    // Emit event
    EventBus.emit(EVENTS.COMPANION_GIFT_GIVEN, {
      companionId: selectedCompanionId,
      giftId: giftItemId,
      relationshipGain,
    });

    setShowGiftMenu(false);
  }, [selectedCompanionId, allCompanions, dispatch]);

  const selectedCompanion = selectedCompanionId ? allCompanions[selectedCompanionId] : null;
  const selectedCompanionDef = selectedCompanionId ? COMPANIONS[selectedCompanionId] : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '90%',
            maxWidth: '1200px',
            height: '90vh',
            background: '#1a1a2e',
            border: '3px solid #4A90D9',
            borderRadius: '12px',
            padding: '24px',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '16px',
                  fontFamily: "'Press Start 2P', monospace",
                  color: '#4A90D9',
                  marginBottom: '8px',
                }}
              >
                Companions / الرفاق
              </h1>
              <div style={{ fontSize: '10px', color: '#a0a0a0' }}>
                Recruited: {recruitedCompanions.length}/12
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#E74C3C',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '12px 16px',
                fontSize: '12px',
                fontFamily: "'Press Start 2P', monospace",
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          {/* Party Panel */}
          <div style={{ marginBottom: '24px' }}>
            <PartyPanel />
          </div>

          {/* Filter tabs */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px',
              flexWrap: 'wrap',
            }}
          >
            {[
              { key: 'all', label: 'All' },
              { key: 'recruited', label: 'Recruited' },
              { key: 'locked', label: 'Locked' },
              { key: 'healer', label: 'Healers' },
              { key: 'attacker', label: 'Attackers' },
              { key: 'defender', label: 'Defenders' },
              { key: 'support', label: 'Support' },
              { key: 'grammar', label: 'Grammar' },
              { key: 'vocabulary', label: 'Vocabulary' },
              { key: 'pronunciation', label: 'Pronunciation' },
              { key: 'culture', label: 'Culture' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key)}
                style={{
                  background: filterTab === tab.key ? '#4A90D9' : '#2C3E50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  fontSize: '8px',
                  fontFamily: "'Press Start 2P', monospace",
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Companion grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredCompanions.map((companion) => {
              const isActive = {
                battle: activeParty.battle === companion.id,
                exploration: activeParty.exploration === companion.id,
              };

              return (
                <CompanionCard
                  key={companion.id}
                  companion={companion}
                  companionDef={COMPANIONS[companion.id]}
                  isActive={isActive}
                  onClick={() => handleCompanionClick(companion.id)}
                />
              );
            })}
          </div>

          {/* Detail view modal */}
          <AnimatePresence>
            {selectedCompanionId && selectedCompanion && selectedCompanionDef && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCompanionId(null)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1001,
                }}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: '600px',
                    maxHeight: '80vh',
                    background: '#1a1a2e',
                    border: `3px solid ${selectedCompanionDef.colorPalette.primary}`,
                    borderRadius: '12px',
                    padding: '24px',
                    overflowY: 'auto',
                  }}
                >
                  {/* Companion name and title */}
                  <h2
                    style={{
                      fontSize: '14px',
                      fontFamily: "'Press Start 2P', monospace",
                      color: selectedCompanionDef.colorPalette.primary,
                      marginBottom: '8px',
                    }}
                  >
                    {selectedCompanionDef.name} - {selectedCompanionDef.nameArabic}
                  </h2>
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#a0a0a0',
                      marginBottom: '16px',
                    }}
                  >
                    {selectedCompanionDef.title} / {selectedCompanionDef.titleArabic}
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: '10px',
                      color: '#ccc',
                      lineHeight: '1.6',
                      marginBottom: '16px',
                    }}
                  >
                    {selectedCompanionDef.description}
                  </p>

                  {/* Stats */}
                  {selectedCompanion.recruited && (
                    <div
                      style={{
                        background: '#2C3E50',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '16px',
                      }}
                    >
                      <div style={{ fontSize: '10px', color: '#4A90D9', marginBottom: '8px' }}>
                        Base Stats
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '8px',
                          fontSize: '9px',
                          color: '#ccc',
                        }}
                      >
                        <div>HP: {selectedCompanionDef.baseStats.hp}</div>
                        <div>MP: {selectedCompanionDef.baseStats.mp}</div>
                        <div>Damage: {selectedCompanionDef.baseStats.damage}</div>
                        <div>Defense: {selectedCompanionDef.baseStats.defense}</div>
                      </div>
                    </div>
                  )}

                  {/* Relationship bar */}
                  {selectedCompanion.recruited && (
                    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                      <RelationshipBar value={selectedCompanion.relationship} maxValue={100} />
                    </div>
                  )}

                  {/* Recruitment requirement (if not recruited) */}
                  {!selectedCompanion.recruited && (
                    <div
                      style={{
                        background: '#E74C3C',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '16px',
                        fontSize: '10px',
                        color: '#fff',
                      }}
                    >
                      <strong>How to recruit:</strong> Find them in{' '}
                      {selectedCompanionDef.zone.replace(/_/g, ' ')}
                      {selectedCompanionDef.recruitCondition.type === 'quest' &&
                        ` (Complete quest: ${selectedCompanionDef.recruitCondition.value})`}
                      {selectedCompanionDef.recruitCondition.type === 'level' &&
                        ` (Reach level ${selectedCompanionDef.recruitCondition.value})`}
                      {selectedCompanionDef.recruitCondition.type === 'relationship' &&
                        ` (Build relationship to ${selectedCompanionDef.recruitCondition.value})`}
                      {selectedCompanionDef.recruitCondition.type === 'storyFlag' &&
                        ` (Story event: ${selectedCompanionDef.recruitCondition.value})`}
                    </div>
                  )}

                  {/* Actions (if recruited) */}
                  {selectedCompanion.recruited && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setShowGiftMenu(true)}
                        style={{
                          flex: 1,
                          background: selectedCompanionDef.colorPalette.accent,
                          color: '#1a1a2e',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '12px',
                          fontSize: '10px',
                          fontFamily: "'Press Start 2P', monospace",
                          cursor: 'pointer',
                        }}
                      >
                        🎁 Give Gift
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedCompanionId(null)}
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
                    Close
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gift menu */}
          <AnimatePresence>
            {showGiftMenu && selectedCompanionId && selectedCompanionDef && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowGiftMenu(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.95)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1002,
                }}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: '500px',
                    maxHeight: '80vh',
                    background: '#1a1a2e',
                    border: `3px solid ${selectedCompanionDef.colorPalette.primary}`,
                    borderRadius: '12px',
                    padding: '24px',
                    overflowY: 'auto',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '12px',
                      fontFamily: "'Press Start 2P', monospace",
                      color: selectedCompanionDef.colorPalette.primary,
                      marginBottom: '16px',
                    }}
                  >
                    Select Gift for {selectedCompanionDef.name}
                  </h3>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '12px',
                    }}
                  >
                    {inventoryItems
                      .filter((item) => item.quantity > 0)
                      .slice(0, 20) // Show max 20 items
                      .map((item) => {
                        const itemData = EQUIPMENT_DATA[item.itemId];
                        if (!itemData) return null;

                        return (
                          <motion.button
                            key={item.itemId}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleGiveGift(item.itemId)}
                            style={{
                              background: '#2C3E50',
                              border: '2px solid #4A90D9',
                              borderRadius: '8px',
                              padding: '12px',
                              cursor: 'pointer',
                              textAlign: 'center',
                            }}
                          >
                            <div style={{ fontSize: '9px', color: '#4A90D9' }}>
                              {itemData.name}
                            </div>
                            <div style={{ fontSize: '7px', color: '#a0a0a0', marginTop: '4px' }}>
                              x{item.quantity}
                            </div>
                          </motion.button>
                        );
                      })}
                  </div>

                  <button
                    onClick={() => setShowGiftMenu(false)}
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
