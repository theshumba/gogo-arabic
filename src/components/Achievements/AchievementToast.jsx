import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectNewAchievements, dismissAchievementNotification } from '../../store/slices/achievementSlice.js';
import { getAchievementById, RARITY_COLORS } from '../../data/achievements.js';
import { COLORS, FONTS } from '../../styles/theme.js';

const styles = {
  container: {
    position: 'fixed',
    top: '60px', // Below HUD
    right: '20px',
    zIndex: 150,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    pointerEvents: 'none',
  },
  toast: {
    width: '320px',
    background: 'rgba(43, 41, 44, 0.98)',
    border: `4px solid ${COLORS.xpGold}`,
    padding: '16px',
    boxShadow: `
      0 0 20px rgba(226, 182, 89, 0.6),
      inset 0 0 20px rgba(226, 182, 89, 0.1)
    `,
    pointerEvents: 'auto',
    cursor: 'pointer',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  title: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.xpGold,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  body: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  icon: {
    fontSize: '32px',
    lineHeight: 1,
  },
  content: {
    flex: 1,
  },
  name: {
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    marginBottom: '4px',
    lineHeight: 1.3,
  },
  description: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.light,
    lineHeight: 1.4,
    marginBottom: '6px',
  },
  xpReward: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.xpGold,
    fontWeight: 'bold',
  },
  closeBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.light,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px 6px',
  },
  progressBar: {
    width: '100%',
    height: '4px',
    background: COLORS.dark,
    marginTop: '8px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: COLORS.xpGold,
    transition: 'width 5s linear',
  },
};

// Individual toast component
function Toast({ achievementId, onDismiss }) {
  const [progress, setProgress] = useState(100);
  const achievement = getAchievementById(achievementId);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      onDismiss(achievementId);
    }, 5000);

    // Animate progress bar
    const progressTimer = setTimeout(() => {
      setProgress(0);
    }, 100);

    return () => {
      clearTimeout(timer);
      clearTimeout(progressTimer);
    };
  }, [achievementId, onDismiss]);

  if (!achievement) return null;

  const rarityColor = RARITY_COLORS[achievement.rarity] || COLORS.white;

  const toastVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
  };

  const toastVariantsReduced = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const transition = reduceMotion
    ? { duration: 0.2 }
    : { duration: 0.35, ease: 'easeOut' };

  return (
    <motion.div
      style={{
        ...styles.toast,
        borderColor: rarityColor,
        boxShadow: `
          0 0 20px ${rarityColor}80,
          inset 0 0 20px ${rarityColor}20
        `,
      }}
      onClick={() => onDismiss(achievementId)}
      variants={reduceMotion ? toastVariantsReduced : toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={transition}
    >
      <button style={styles.closeBtn} onClick={(e) => { e.stopPropagation(); onDismiss(achievementId); }}>
        ✕
      </button>

      <div style={styles.header}>
        <span style={styles.title}>Achievement Unlocked!</span>
      </div>

      <div style={styles.body}>
        <div style={styles.icon}>{achievement.icon}</div>
        <div style={styles.content}>
          <div style={{ ...styles.name, color: rarityColor }}>
            {achievement.name}
          </div>
          <div style={styles.description}>
            {achievement.description}
          </div>
          <div style={styles.xpReward}>
            +{achievement.xpReward} XP
          </div>
        </div>
      </div>

      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>
    </motion.div>
  );
}

// Container that manages all toasts
export default function AchievementToast() {
  const dispatch = useDispatch();
  const newAchievements = useSelector(selectNewAchievements);

  const handleDismiss = (achievementId) => {
    dispatch(dismissAchievementNotification(achievementId));
  };

  // Show up to 3 toasts at once
  const visibleAchievements = newAchievements.slice(0, 3);

  if (visibleAchievements.length === 0) return null;

  return (
    <div style={styles.container}>
      <AnimatePresence mode="sync">
        {visibleAchievements.map((achievementId) => (
          <Toast
            key={achievementId}
            achievementId={achievementId}
            onDismiss={handleDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
