/**
 * ComboCounter.jsx — Animated combo streak display during battle.
 *
 * Shows when streak >= 2. Tiers: normal (2), critical (3+), epic (5+), legendary (10+).
 * Spring animation on each increment. Arabic label "سلسلة" (chain/combo).
 */

import { motion, AnimatePresence } from 'framer-motion';
import styles from './ComboCounter.module.css';

const reduceMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const TIER_STYLES = {
  normal: { color: '#FFFFFF', glow: 'none', sizeClass: 'comboNumberNormal' },
  critical: { color: '#FFD700', glow: '0 0 10px rgba(255, 215, 0, 0.5)', sizeClass: 'comboNumberCritical' },
  epic: { color: '#FF6600', glow: '0 0 15px rgba(255, 102, 0, 0.6)', sizeClass: 'comboNumberEpic' },
  legendary: { color: '#FF0000', glow: '0 0 20px rgba(255, 0, 0, 0.7)', sizeClass: 'comboNumberLegendary' },
};

function getTier(streak) {
  if (streak >= 10) return 'legendary';
  if (streak >= 5) return 'epic';
  if (streak >= 3) return 'critical';
  return 'normal';
}

export default function ComboCounter({ streak }) {
  if (streak < 2) return null;

  const tier = getTier(streak);
  const tierStyle = TIER_STYLES[tier];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={streak}
        initial={reduceMotion ? { opacity: 1 } : { scale: 2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { scale: 0.5, opacity: 0 }}
        transition={
          reduceMotion
            ? { duration: 0.1 }
            : { type: 'spring', stiffness: 300, damping: 15 }
        }
        className={styles.comboWrapper}
      >
        <div
          className={`${styles.comboNumber} ${styles[tierStyle.sizeClass]}`}
          style={{
            color: tierStyle.color,
            textShadow: tierStyle.glow,
          }}
        >
          {streak}
        </div>
        <div
          className={styles.comboArabicLabel}
          style={{ color: tierStyle.color }}
          lang="ar"
        >
          سلسلة
        </div>
        <div
          className={styles.comboEnglishLabel}
          style={{ color: tierStyle.color }}
        >
          COMBO
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
