import { useCallback, useEffect, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectLevelUpReward, dismissLevelUpReward } from '../../store/slices/playerSlice.js';
import styles from './LevelUpModal.module.css';

function LevelUpModal() {
  const dispatch = useDispatch();
  const reward = useSelector(selectLevelUpReward);

  const handleDismiss = useCallback(() => {
    dispatch(dismissLevelUpReward());
  }, [dispatch]);

  // Escape key handler
  useEffect(() => {
    if (!reward) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reward, handleDismiss]);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 300,
      },
    },
    exit: { opacity: 0, scale: 0.9 },
  };

  const modalVariantsReduced = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const glowVariants = {
    initial: { opacity: 0.4 },
    animate: {
      opacity: [0.4, 0.8, 0.4],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  if (!reward) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={styles.overlay}
        onClick={handleDismiss}
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{ duration: 0.3 }}
        role="dialog"
        aria-labelledby="level-up-title"
        aria-describedby="level-up-description"
      >
        <motion.div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          variants={reduceMotion ? modalVariantsReduced : modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Animated glow background */}
          {!reduceMotion && (
            <motion.div
              className={styles.glow}
              variants={glowVariants}
              initial="initial"
              animate="animate"
            />
          )}

          {/* Content */}
          <div className={styles.content}>
            <div className={styles.celebration} aria-hidden="true">
              ✨🎉✨
            </div>

            <h2 id="level-up-title" className={styles.title}>
              Level Up!
            </h2>

            <div className={styles.levelDisplay}>
              <span className={styles.levelLabel}>Level</span>
              <span className={styles.levelNumber}>{reward.level}</span>
            </div>

            <div id="level-up-description" className={styles.rewards}>
              <div className={styles.rewardItem}>
                <span className={styles.rewardIcon} aria-hidden="true">
                  💰
                </span>
                <span className={styles.rewardText}>
                  +{reward.dirhams} Dirhams
                </span>
              </div>

              {reward.title && (
                <div className={styles.rewardItem}>
                  <span className={styles.rewardIcon} aria-hidden="true">
                    🏆
                  </span>
                  <span className={styles.rewardText}>
                    Title: {reward.title}
                  </span>
                </div>
              )}
            </div>

            {reward.message && (
              <p className={styles.message}>{reward.message}</p>
            )}

            <button
              className={styles.continueBtn}
              onClick={handleDismiss}
              aria-label="Continue playing"
            >
              Continue
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default memo(LevelUpModal);
