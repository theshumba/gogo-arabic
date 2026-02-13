/**
 * RelationshipBar.jsx — Animated relationship progress bar with tier colors
 *
 * Shows 0-100 relationship progress with tier-based color gradients.
 * Displays Arabic + English tier labels.
 */

import { motion } from 'framer-motion';
import { getRelationshipTier } from '../../utils/companionRelationship.js';

const TIER_COLORS = {
  stranger: '#7F8C8D',       // Gray
  acquaintance: '#3498DB',   // Blue
  friend: '#2ECC71',         // Green
  closeFriend: '#9B59B6',    // Purple
  bestFriend: '#F1C40F',     // Gold
};

export default function RelationshipBar({ value, maxValue = 100, tier, showLabel = true, size = 'normal' }) {
  const tierData = tier || getRelationshipTier(value);
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const color = TIER_COLORS[Object.keys(TIER_COLORS).find(key =>
    tierData.label.toLowerCase().replace(' ', '') === key
  )] || TIER_COLORS.stranger;

  const dimensions = size === 'small'
    ? { width: '100px', height: '8px' }
    : { width: '200px', height: '16px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {/* Progress bar container */}
      <div
        style={{
          width: dimensions.width,
          height: dimensions.height,
          background: '#1a1a2e',
          border: `1px solid ${color}`,
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Filled portion */}
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

        {/* Value text overlay */}
        {size === 'normal' && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '10px',
              fontFamily: "'Press Start 2P', monospace",
              color: '#f4fefa',
              textShadow: '0 0 4px rgba(0, 0, 0, 0.8)',
              pointerEvents: 'none',
            }}
          >
            {Math.round(value)}/{maxValue}
          </div>
        )}
      </div>

      {/* Tier label */}
      {showLabel && (
        <div style={{
          fontSize: size === 'small' ? '8px' : '10px',
          color: color,
          fontFamily: "'Press Start 2P', monospace",
          textAlign: 'center',
        }}>
          {tierData.label} / {tierData.labelArabic}
        </div>
      )}
    </div>
  );
}
