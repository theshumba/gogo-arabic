/**
 * FactionPanel.jsx — Displays all 6 faction reputation scores with tier progress bars (Phase 53)
 *
 * Shows each faction's:
 * - Icon + name (English + Arabic)
 * - 0-100 score with animated bar
 * - Tier label (Neutral/Friendly/Trusted/Allied/Revered in English + Arabic)
 *
 * Follows RelationshipBar.jsx pattern for animated bars.
 */

import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectFactionRanks } from '../../store/slices/factionSlice.js';
import { getFactionTier } from '../../data/factions.js';

const TIER_COLORS = {
  Neutral:  '#7F8C8D',  // Gray
  Friendly: '#3498DB',  // Blue
  Trusted:  '#2ECC71',  // Green
  Allied:   '#9B59B6',  // Purple
  Revered:  '#F1C40F',  // Gold
};

function FactionBar({ faction, score }) {
  const tier = getFactionTier(score);
  const color = TIER_COLORS[tier.label] || TIER_COLORS.Neutral;
  const percentage = Math.min(100, Math.max(0, score));

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 12px',
      background: '#1a1a2e',
      borderRadius: '8px',
      border: `1px solid ${color}33`,
    }}>
      {/* Faction icon */}
      <span style={{ fontSize: '24px', minWidth: '32px', textAlign: 'center' }}>
        {faction.icon}
      </span>

      {/* Name + bar + tier */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Faction name */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '4px',
        }}>
          <span style={{
            fontSize: '12px',
            fontFamily: "'Press Start 2P', monospace",
            color: '#f4fefa',
          }}>
            {faction.name}
          </span>
          <span style={{
            fontSize: '11px',
            fontFamily: "'Noto Sans Arabic', sans-serif",
            color: '#f4fefa99',
            direction: 'rtl',
          }}>
            {faction.nameArabic}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: '14px',
          background: '#0d0d1a',
          border: `1px solid ${color}55`,
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${color}dd, ${color})`,
              borderRadius: '3px',
            }}
          />
          {/* Score text overlay */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '8px',
            fontFamily: "'Press Start 2P', monospace",
            color: '#f4fefa',
            textShadow: '0 0 4px rgba(0, 0, 0, 0.8)',
            pointerEvents: 'none',
          }}>
            {Math.round(score)}/100
          </div>
        </div>

        {/* Tier label */}
        <div style={{
          marginTop: '2px',
          fontSize: '9px',
          fontFamily: "'Press Start 2P', monospace",
          color: color,
          textAlign: 'center',
        }}>
          {tier.label} / {tier.labelArabic}
        </div>
      </div>
    </div>
  );
}

export default function FactionPanel({ onClose }) {
  const factionRanks = useSelector(selectFactionRanks);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '420px',
          maxHeight: '80vh',
          background: '#0a0a1a',
          border: '2px solid #3498DB55',
          borderRadius: '12px',
          padding: '20px',
          zIndex: 1000,
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          borderBottom: '1px solid #ffffff22',
          paddingBottom: '12px',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '14px',
            fontFamily: "'Press Start 2P', monospace",
            color: '#f4fefa',
          }}>
            Faction Standing
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: '1px solid #ffffff44',
                borderRadius: '4px',
                color: '#f4fefa',
                cursor: 'pointer',
                padding: '4px 8px',
                fontSize: '10px',
                fontFamily: "'Press Start 2P', monospace",
              }}
            >
              X
            </button>
          )}
        </div>

        {/* Faction list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {factionRanks.map(({ faction, score }) => (
            <FactionBar key={faction.id} faction={faction} score={score} />
          ))}
        </div>

        {/* Tier legend */}
        <div style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid #ffffff22',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center',
        }}>
          {Object.entries(TIER_COLORS).map(([label, color]) => (
            <span key={label} style={{
              fontSize: '8px',
              fontFamily: "'Press Start 2P', monospace",
              color: color,
            }}>
              {label}
            </span>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
