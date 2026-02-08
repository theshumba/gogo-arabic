import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { openDialogue } from '../../store/slices/uiSlice.js';
import { selectUnlockedCount } from '../../store/slices/achievementSlice.js';
import { EventBus } from '../../game/EventBus.js';
import styles from './HUD.module.css';
import AchievementPanel from '../Achievements/AchievementPanel.jsx';

export default function HUD({ onMenu }) {
  const dispatch = useDispatch();
  const [achievementPanelOpen, setAchievementPanelOpen] = useState(false);

  // Fix: playerSlice uses xpToNextLevel, not xpToNext
  const { level, xp, xpToNextLevel, streak, dirhams, wordsLearned } = useSelector((s) => s.player);

  // Active quests count
  const quests = useSelector((s) => s.quests?.quests ?? {});
  const activeQuestCount = Object.values(quests).filter((q) => q.status === 'active').length;

  // Review due count
  const reviewQueue = useSelector((s) => s.vocabulary?.reviewQueue ?? []);
  const reviewDueCount = reviewQueue.length;

  // Achievement count
  const achievementCount = useSelector(selectUnlockedCount);

  const xpPercent = xpToNextLevel > 0 ? (xp / xpToNextLevel) * 100 : 0;

  const openQuestLog = () => {
    dispatch(openDialogue({ type: 'quest-log' }));
    EventBus.emit('freeze-player');
  };

  const openAchievements = () => {
    setAchievementPanelOpen(true);
    EventBus.emit('freeze-player');
  };

  const closeAchievements = () => {
    setAchievementPanelOpen(false);
    EventBus.emit('unfreeze-player');
  };

  return (
    <>
      <div className={styles.container}>
        {/* Left: Level + XP bar */}
        <div className={styles.left}>
          <span className={styles.levelBadge}>Lv.{level}</span>
          <div className={styles.xpBarOuter}>
            <div className={styles.xpBarFill} style={{ width: `${Math.min(xpPercent, 100)}%` }} />
          </div>
          <span className={styles.xpText}>{xp}/{xpToNextLevel}</span>
        </div>

        {/* Center: Streak */}
        <div className={styles.center}>
          <span className={styles.streakText}>Streak: {streak}</span>
        </div>

        {/* Right: Stats + Buttons */}
        <div className={styles.right}>
          <span className={styles.dirhams}>{dirhams} D</span>
          <span className={styles.statLabel}>Words: {wordsLearned}</span>

          {/* Quests button with active quest badge */}
          <button className={styles.btn} onClick={openQuestLog}>
            Quests
            {activeQuestCount > 0 && (
              <span className={`${styles.badge} ${styles.questBadge}`}>
                {activeQuestCount}
              </span>
            )}
          </button>

          {/* Achievements button */}
          <button className={styles.btn} onClick={openAchievements}>
            🏆
            {achievementCount > 0 && (
              <span className={`${styles.badge} ${styles.achievementBadge}`}>
                {achievementCount}
              </span>
            )}
          </button>

          {/* Review button with due count badge */}
          {reviewDueCount > 0 && (
            <span className={`${styles.badge} ${styles.reviewBadge}`}>
              {reviewDueCount} due
            </span>
          )}

          <button className={styles.btn} onClick={onMenu}>Menu</button>
        </div>
      </div>

      {/* Achievement Panel Overlay */}
      {achievementPanelOpen && (
        <AchievementPanel onClose={closeAchievements} />
      )}
    </>
  );
}
