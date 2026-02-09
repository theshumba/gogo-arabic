import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectNewAchievements, dismissAchievementNotification } from '../../store/slices/achievementSlice.js';
import { getAchievementById, RARITY_COLORS } from '../../data/achievements.js';
import styles from './AchievementToast.module.css';

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

  const rarityColor = RARITY_COLORS[achievement.rarity] || '#f4fefa';

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

  // Dynamic inline styles for rarity-specific colors
  const toastInlineStyle = {
    borderColor: rarityColor,
    boxShadow: `
      0 0 20px ${rarityColor}80,
      inset 0 0 20px ${rarityColor}20
    `,
  };

  return (
    <motion.div
      className={styles.toast}
      style={toastInlineStyle}
      onClick={() => onDismiss(achievementId)}
      variants={reduceMotion ? toastVariantsReduced : toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={transition}
    >
      <button className={styles.closeBtn} onClick={(e) => { e.stopPropagation(); onDismiss(achievementId); }}>
        ✕
      </button>

      <div className={styles.header}>
        <span className={styles.title}>Achievement Unlocked!</span>
      </div>

      <div className={styles.body}>
        <div className={styles.icon}>{achievement.icon}</div>
        <div className={styles.content}>
          <div className={styles.name} style={{ color: rarityColor }}>
            {achievement.name}
          </div>
          <div className={styles.description}>
            {achievement.description}
          </div>
          <div className={styles.xpReward}>
            +{achievement.xpReward} XP
          </div>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
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
    <div className={styles.container}>
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
