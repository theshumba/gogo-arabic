import { useState, useCallback, useMemo, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { openDialogue } from '../../store/slices/uiSlice.js';
import { selectUnlockedCount } from '../../store/slices/achievementSlice.js';
import { selectPlayerStats } from '../../store/slices/playerSlice.js';
import { selectActiveQuestCount } from '../../store/slices/questSlice.js';
import { selectReviewQueueCount } from '../../store/slices/vocabularySlice.js';
import { EventBus } from '../../utils/eventBus.js';
import styles from './HUD.module.css';
import AchievementPanel from '../Achievements/AchievementPanel.jsx';

function HUD({ onMenu }) {
  const dispatch = useDispatch();
  const [achievementPanelOpen, setAchievementPanelOpen] = useState(false);

  // Use memoized selectors from Redux slices
  const { level, xp, xpToNextLevel, streak, dirhams, wordsLearned } = useSelector(selectPlayerStats);
  const activeQuestCount = useSelector(selectActiveQuestCount);
  const reviewDueCount = useSelector(selectReviewQueueCount);
  const achievementCount = useSelector(selectUnlockedCount);

  const xpPercent = useMemo(() => {
    return xpToNextLevel > 0 ? (xp / xpToNextLevel) * 100 : 0;
  }, [xp, xpToNextLevel]);

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

  return (
    <>
      <div className={styles.container} role="banner" aria-label="Game HUD">
        {/* Left: Level + XP bar */}
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
        </div>

        {/* Center: Streak */}
        <div className={styles.center}>
          <span className={styles.streakText} aria-label={`Current streak: ${streak} days`}>Streak: {streak}</span>
        </div>

        {/* Right: Stats + Buttons */}
        <div className={styles.right}>
          <span className={styles.dirhams} aria-label={`${dirhams} Dirhams currency`}>{dirhams} D</span>
          <span className={styles.statLabel} aria-label={`${wordsLearned} words learned`}>Words: {wordsLearned}</span>

          {/* Quests button with active quest badge */}
          <button
            className={styles.btn}
            onClick={openQuestLog}
            aria-label={`Quest log ${activeQuestCount > 0 ? `${activeQuestCount} active quests` : ''}`}
          >
            Quests
            {activeQuestCount > 0 && (
              <span className={`${styles.badge} ${styles.questBadge}`} aria-hidden="true">
                {activeQuestCount}
              </span>
            )}
          </button>

          {/* Achievements button */}
          <button
            className={styles.btn}
            onClick={openAchievements}
            aria-label={`Achievements ${achievementCount > 0 ? `${achievementCount} unlocked` : ''}`}
          >
            <span role="img" aria-label="trophy">🏆</span>
            {achievementCount > 0 && (
              <span className={`${styles.badge} ${styles.achievementBadge}`} aria-hidden="true">
                {achievementCount}
              </span>
            )}
          </button>

          {/* Review button with due count badge */}
          {reviewDueCount > 0 && (
            <span className={`${styles.badge} ${styles.reviewBadge}`} aria-label={`${reviewDueCount} reviews due`}>
              {reviewDueCount} due
            </span>
          )}

          <button className={styles.btn} onClick={onMenu} aria-label="Open menu">Menu</button>
        </div>
      </div>

      {/* Achievement Panel Overlay */}
      {achievementPanelOpen && (
        <AchievementPanel onClose={closeAchievements} />
      )}
    </>
  );
}

// Memoize component to prevent re-renders when parent updates
export default memo(HUD);
