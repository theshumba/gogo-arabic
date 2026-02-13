/**
 * CompanionCard.jsx — Individual companion card for roster display
 *
 * Shows name, title, role, specialty, recruitment status, and relationship bar.
 */

import { motion } from 'framer-motion';
import { COMPANIONS, COMPANION_ROLES, TEACHING_SPECIALTIES } from '../../data/companions.js';
import RelationshipBar from './RelationshipBar.jsx';

const ROLE_ICONS = {
  healer: '💚',
  attacker: '⚔️',
  defender: '🛡️',
  support: '✨',
};

const SPECIALTY_ICONS = {
  grammar: '📖',
  vocabulary: '💬',
  pronunciation: '🗣️',
  culture: '🏛️',
};

export default function CompanionCard({ companion, companionDef, isActive, onClick }) {
  const def = companionDef || COMPANIONS[companion.id];
  if (!def) return null;

  const isRecruited = companion.recruited;
  const activeSlot = isActive?.battle ? 'battle' : isActive?.exploration ? 'exploration' : null;

  return (
    <motion.div
      whileHover={isRecruited ? { scale: 1.02 } : {}}
      onClick={onClick}
      style={{
        width: '220px',
        height: '280px',
        background: isRecruited ? '#1a1a2e' : '#0f0f1a',
        border: `3px solid ${def.colorPalette.primary}`,
        borderRadius: '8px',
        padding: '12px',
        cursor: 'pointer',
        position: 'relative',
        opacity: isRecruited ? 1 : 0.6,
        filter: isRecruited ? 'none' : 'grayscale(0.7)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Recruitment badge */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: isRecruited ? def.colorPalette.primary : '#555',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '8px',
          fontFamily: "'Press Start 2P', monospace",
        }}
      >
        {isRecruited ? 'RECRUITED' : 'LOCKED'}
      </div>

      {/* Active slot indicator */}
      {activeSlot && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            fontSize: '16px',
          }}
        >
          {activeSlot === 'battle' ? '⚔️' : '🧭'}
        </div>
      )}

      {/* Portrait placeholder */}
      <div
        style={{
          width: '100%',
          height: '80px',
          background: `linear-gradient(135deg, ${def.colorPalette.primary}44, ${def.colorPalette.secondary}44)`,
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          marginTop: '24px',
        }}
      >
        {ROLE_ICONS[def.battleRole]}
      </div>

      {/* Name and title */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: '12px',
            fontFamily: "'Press Start 2P', monospace",
            color: def.colorPalette.primary,
            marginBottom: '4px',
          }}
        >
          {def.name}
        </div>
        <div
          style={{
            fontSize: '9px',
            color: '#a0a0a0',
            direction: 'rtl',
          }}
        >
          {def.nameArabic}
        </div>
        <div
          style={{
            fontSize: '8px',
            color: '#ccc',
            fontStyle: 'italic',
            marginTop: '4px',
          }}
        >
          {def.title}
        </div>
      </div>

      {/* Role and specialty badges */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          marginTop: '4px',
        }}
      >
        <div
          style={{
            background: def.colorPalette.secondary,
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {ROLE_ICONS[def.battleRole]} {COMPANION_ROLES[def.battleRole].label}
        </div>
        <div
          style={{
            background: def.colorPalette.accent,
            color: '#1a1a2e',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {SPECIALTY_ICONS[def.teachingSpecialty]} {TEACHING_SPECIALTIES[def.teachingSpecialty].label}
        </div>
      </div>

      {/* Relationship bar (only if recruited) */}
      {isRecruited && (
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
          <RelationshipBar
            value={companion.relationship}
            maxValue={100}
            showLabel={false}
            size="small"
          />
        </div>
      )}
    </motion.div>
  );
}
