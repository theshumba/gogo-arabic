import { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { openDialogue } from '../../store/slices/uiSlice.js';
import { selectUnlockedCount } from '../../store/slices/achievementSlice.js';
import { selectPlayerStats } from '../../store/slices/playerSlice.js';
import { selectActiveQuestCount } from '../../store/slices/questSlice.js';
import { selectReviewQueueCount } from '../../store/slices/vocabularySlice.js';
import { selectCompletedGoalsCount, selectTotalGoalsCount } from '../../store/slices/dailyGoalsSlice.js';
import { EventBus } from '../../utils/eventBus.js';
import styles from './HUD.module.css';
import AchievementPanel from '../Achievements/AchievementPanel.jsx';
import DailyGoalsPanel from '../Goals/DailyGoalsPanel.jsx';
import SyncIndicator from './SyncIndicator.jsx';

function HUD({ onMenu }) {
  const dispatch = useDispatch();
  const [achievementPanelOpen, setAchievementPanelOpen] = useState(false);
  const [dailyGoalsPanelOpen, setDailyGoalsPanelOpen] = useState(false);
  const [stamina, setStamina] = useState(100);
  const [maxStamina, setMaxStamina] = useState(100);
  const [showStamina, setShowStamina] = useState(false);

  // Use memoized selectors from Redux slices
  const { level, xp, xpToNextLevel, streak, dirhams, wordsLearned } = useSelector(selectPlayerStats);
  const activeQuestCount = useSelector(selectActiveQuestCount);
  const reviewDueCount = useSelector(selectReviewQueueCount);
  const achievementCount = useSelector(selectUnlockedCount);
  const completedGoalsCount = useSelector(selectCompletedGoalsCount);
  const totalGoalsCount = useSelector(selectTotalGoalsCount);
  const completedGroups = useSelector((s) => s.alphabet.completedGroups || []);

  // Calculate letters learned (7 groups × 4 letters = 28 total)
  const lettersLearned = completedGroups.length * 4;
  const totalLetters = 28;

  // Listen for stamina updates from player
  useEffect(() => {
    const handleStaminaUpdate = ({ stamina, maxStamina, isSprinting }) => {
      setStamina(stamina);
      setMaxStamina(maxStamina);
      setShowStamina(isSprinting || stamina < maxStamina);
    };

    EventBus.on('player-stamina-update', handleStaminaUpdate);

    return () => {
      EventBus.off('player-stamina-update', handleStaminaUpdate);
    };
  }, []);

  // Show prompt to learn first letter
  useEffect(() => {
    // Only show once per session when player has 0 letters learned
    if (lettersLearned === 0) {
      const hasSeenPrompt = sessionStorage.getItem('alphabet-prompt-shown');
      if (!hasSeenPrompt) {
        const timer = setTimeout(() => {
          dispatch({
            type: 'ui/showNotification',
            payload: {
              message: 'Start learning the Arabic alphabet! Press L or click أ ب button.',
              type: 'quest'
            }
          });
          sessionStorage.setItem('alphabet-prompt-shown', 'true');
        }, 3000); // Show after 3 seconds

        return () => clearTimeout(timer);
      }
    }
  }, [lettersLearned, dispatch]);

  const xpPercent = useMemo(() => {
    return xpToNextLevel > 0 ? (xp / xpToNextLevel) * 100 : 0;
  }, [xp, xpToNextLevel]);

  const staminaPercent = useMemo(() => {
    return maxStamina > 0 ? (stamina / maxStamina) * 100 : 0;
  }, [stamina, maxStamina]);

  const openQuestLog = useCallback(() => {
    dispatch(openDialogue({ type: 'quest-log' }));
    EventBus.emit('freeze-player');
  }, [dispatch]);

  const openAchievements = useCallback(() => {
    setAchievementPanelOpen(true);
    EventBus.emit('freeze-player');
  }, []);

  const closeAchievements = useCallback(() => {
    setAchievementPanelOpen(false);
    EventBus.emit('unfreeze-player');
  }, []);

  const openDailyGoals = useCallback(() => {
    setDailyGoalsPanelOpen(true);
    EventBus.emit('freeze-player');
  }, []);

  const closeDailyGoals = useCallback(() => {
    setDailyGoalsPanelOpen(false);
    EventBus.emit('unfreeze-player');
  }, []);

  const openMap = useCallback(() => {
    EventBus.emit('open-world-map');
  }, []);

  const openAlphabet = useCallback(() => {
    EventBus.emit('open-alphabet');
  }, []);

  const openReviewSession = useCallback(() => {
    EventBus.emit('open-review-session');
  }, []);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const buttonProps = reduceMotion
    ? {}
    : { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } };

  return (
    <>
      <div className={styles.container} role="banner" aria-label="Game HUD">
        {/* Left: Level + XP bar + Stamina bar */}
        <div className={styles.left}>
          <span className={styles.levelBadge} aria-label={`Level ${level}`}>Lv.{level}</span>
          <div
            className={styles.xpBarOuter}
            role="progressbar"
            aria-label="Experience progress to next level"
            aria-valuenow={xp}
            aria-valuemin={0}
            aria-valuemax={xpToNextLevel}
          >
            <div className={styles.xpBarFill} style={{ width: `${Math.min(xpPercent, 100)}%` }} />
          </div>
          <span className={styles.xpText} aria-label={`${xp} XP out of ${xpToNextLevel}`}>{xp}/{xpToNextLevel}</span>

          {/* Stamina bar - only visible when sprinting or recharging */}
          {showStamina && (
            <div
              className={styles.staminaBarOuter}
              role="progressbar"
              aria-label="Sprint stamina"
              aria-valuenow={Math.round(stamina)}
              aria-valuemin={0}
              aria-valuemax={maxStamina}
            >
              <div className={styles.staminaBarFill} style={{ width: `${Math.min(staminaPercent, 100)}%` }} />
            </div>
          )}
        </div>

        {/* Center: Streak + Sync Indicator */}
        <div className={styles.center}>
          <span className={styles.streakText} aria-label={`Current streak: ${streak} days`}>Streak: {streak}</span>
          <SyncIndicator />
        </div>

        {/* Right: Stats + Buttons */}
        <div className={styles.right}>
          <span className={styles.dirhams} aria-label={`${dirhams} Dirhams currency`}>{dirhams} D</span>
          <span className={styles.statLabel} aria-label={`${wordsLearned} words learned`}>Words: {wordsLearned}</span>

          {/* Alphabet/Letters button with progress badge */}
          <motion.button
            className={`${styles.btn} ${styles.lettersBtn} ${lettersLearned === 0 ? styles.lettersPulse : ''}`}
            onClick={openAlphabet}
            aria-label={`Alphabet module. ${lettersLearned} of ${totalLetters} letters learned. Press L key.`}
            {...buttonProps}
          >
            <span role="img" aria-label="letters">أ ب</span>
            {lettersLearned < totalLetters && (
              <span className={`${styles.badge} ${styles.lettersBadge}`} aria-hidden="true">
                {lettersLearned}/{totalLetters}
              </span>
            )}
          </motion.button>

          {/* Map button */}
          <motion.button
            className={`${styles.btn} ${styles.mapBtn}`}
            onClick={openMap}
            aria-label="Open world map (M key)"
            {...buttonProps}
          >
            Map
          </motion.button>

          {/* Quests button with active quest badge */}
          <motion.button
            className={styles.btn}
            onClick={openQuestLog}
            aria-label={`Quest log ${activeQuestCount > 0 ? `${activeQuestCount} active quests` : ''}`}
            {...buttonProps}
          >
            Quests
            {activeQuestCount > 0 && (
              <span className={`${styles.badge} ${styles.questBadge}`} aria-hidden="true">
                {activeQuestCount}
              </span>
            )}
          </motion.button>

          {/* Daily Goals button */}
          <motion.button
            className={styles.btn}
            onClick={openDailyGoals}
            aria-label={`Daily goals ${completedGoalsCount}/${totalGoalsCount} completed`}
            {...buttonProps}
          >
            <span role="img" aria-label="target">🎯</span>
            {completedGoalsCount > 0 && (
              <span className={`${styles.badge} ${styles.goalBadge}`} aria-hidden="true">
                {completedGoalsCount}/{totalGoalsCount}
              </span>
            )}
          </motion.button>

          {/* Achievements button */}
          <motion.button
            className={styles.btn}
            onClick={openAchievements}
            aria-label={`Achievements ${achievementCount > 0 ? `${achievementCount} unlocked` : ''}`}
            {...buttonProps}
          >
            <span role="img" aria-label="trophy">🏆</span>
            {achievementCount > 0 && (
              <span className={`${styles.badge} ${styles.achievementBadge}`} aria-hidden="true">
                {achievementCount}
              </span>
            )}
          </motion.button>

          {/* Review button with due count badge */}
          {reviewDueCount > 0 && (
            <motion.button
              className={`${styles.btn} ${styles.reviewBtn}`}
              onClick={openReviewSession}
              aria-label={`Start review session - ${reviewDueCount} words due`}
              {...buttonProps}
            >
              Review
              <span className={`${styles.badge} ${styles.reviewBadge}`} aria-hidden="true">
                {reviewDueCount}
              </span>
            </motion.button>
          )}

          <motion.button
            className={styles.btn}
            onClick={onMenu}
            aria-label="Open menu"
            {...buttonProps}
          >
            Menu
          </motion.button>
        </div>
      </div>

      {/* Achievement Panel Overlay */}
      {achievementPanelOpen && (
        <AchievementPanel onClose={closeAchievements} />
      )}

      {/* Daily Goals Panel Overlay */}
      {dailyGoalsPanelOpen && (
        <DailyGoalsPanel onClose={closeDailyGoals} />
      )}
    </>
  );
}

// Memoize component to prevent re-renders when parent updates
export default memo(HUD);
