/**
 * CompanionCard.jsx — Individual companion card for roster display
 *
 * Shows name, title, role, specialty, recruitment status, and relationship bar.
 */

import { motion } from 'framer-motion';
import { COMPANIONS, COMPANION_ROLES, TEACHING_SPECIALTIES } from '../../data/companions.js';
import RelationshipBar from './RelationshipBar.jsx';
import styles from './CompanionCard.module.css';

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
      className={`${styles.card} ${isRecruited ? styles.cardRecruited : styles.cardLocked}`}
      style={{ borderColor: def.colorPalette.primary }}
    >
      {/* Recruitment badge */}
      <div
        className={styles.recruitBadge}
        style={{ background: isRecruited ? def.colorPalette.primary : '#555' }}
      >
        {isRecruited ? 'RECRUITED' : 'LOCKED'}
      </div>

      {/* Active slot indicator */}
      {activeSlot && (
        <div className={styles.activeSlotIcon}>
          {activeSlot === 'battle' ? '⚔️' : '🧭'}
        </div>
      )}

      {/* Portrait placeholder */}
      <div
        className={styles.portrait}
        style={{
          background: `linear-gradient(135deg, ${def.colorPalette.primary}44, ${def.colorPalette.secondary}44)`,
        }}
      >
        {ROLE_ICONS[def.battleRole]}
      </div>

      {/* Name and title */}
      <div className={styles.nameSection}>
        <div className={styles.cardName} style={{ color: def.colorPalette.primary }}>
          {def.name}
        </div>
        <div className={styles.cardNameArabic}>
          {def.nameArabic}
        </div>
        <div className={styles.cardTitle}>
          {def.title}
        </div>
      </div>

      {/* Role and specialty badges */}
      <div className={styles.badges}>
        <div className={styles.roleBadge} style={{ background: def.colorPalette.secondary }}>
          {ROLE_ICONS[def.battleRole]} {COMPANION_ROLES[def.battleRole].label}
        </div>
        <div className={styles.specialtyBadge} style={{ background: def.colorPalette.accent }}>
          {SPECIALTY_ICONS[def.teachingSpecialty]} {TEACHING_SPECIALTIES[def.teachingSpecialty].label}
        </div>
      </div>

      {/* Relationship bar (only if recruited) */}
      {isRecruited && (
        <div className={styles.relationshipSection}>
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
