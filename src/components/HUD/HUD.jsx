import { useSelector, useDispatch } from 'react-redux';
import { openDialogue } from '../../store/slices/uiSlice.js';
import { EventBus } from '../../game/EventBus.js';
import { COLORS, FONTS, pixelBtnDark } from '../../styles/theme.js';

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '8px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(43,41,44,0.92)',
    borderBottom: `4px solid ${COLORS.dark}`,
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    color: COLORS.white,
    pointerEvents: 'none',
    zIndex: 100,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  levelBadge: {
    background: COLORS.brown,
    border: `2px solid ${COLORS.xpGold}`,
    color: COLORS.xpGold,
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    padding: '4px 8px',
    fontWeight: 'bold',
    lineHeight: 1,
  },
  xpBarOuter: {
    width: '90px',
    height: '10px',
    background: COLORS.dark,
    border: `2px solid ${COLORS.light}`,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    background: COLORS.xpGold,
    transition: 'width 0.3s',
  },
  xpText: {
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    color: COLORS.xpGold,
  },
  streakText: {
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    color: COLORS.white,
  },
  dirhams: {
    fontFamily: FONTS.pixel,
    fontSize: '14px',
    color: COLORS.xpGold,
    fontWeight: 'bold',
  },
  statLabel: {
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    color: COLORS.white,
  },
  btn: {
    ...pixelBtnDark,
    padding: '6px 10px',
    fontSize: '12px',
    pointerEvents: 'auto',
    letterSpacing: '0.5px',
    position: 'relative',
    boxShadow: `
      inset -2px -2px 0px 0px rgba(0,0,0,0.3),
      inset 2px 2px 0px 0px rgba(255,255,255,0.1),
      0 2px 0 0 #1a191b
    `,
  },
  badge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    minWidth: '16px',
    height: '16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    fontWeight: 'bold',
    lineHeight: 1,
    padding: '0 4px',
    border: `2px solid ${COLORS.dark}`,
    pointerEvents: 'none',
  },
  questBadge: {
    background: COLORS.green,
    color: COLORS.dark,
  },
  reviewBadge: {
    background: COLORS.blue,
    color: COLORS.dark,
  },
};

export default function HUD({ onMenu }) {
  const dispatch = useDispatch();

  // Fix: playerSlice uses xpToNextLevel, not xpToNext
  const { level, xp, xpToNextLevel, streak, dirhams, wordsLearned } = useSelector((s) => s.player);

  // Active quests count
  const quests = useSelector((s) => s.quests?.quests ?? {});
  const activeQuestCount = Object.values(quests).filter((q) => q.status === 'active').length;

  // Review due count
  const reviewQueue = useSelector((s) => s.vocabulary?.reviewQueue ?? []);
  const reviewDueCount = reviewQueue.length;

  const xpPercent = xpToNextLevel > 0 ? (xp / xpToNextLevel) * 100 : 0;

  const openQuestLog = () => {
    dispatch(openDialogue({ type: 'quest-log' }));
    EventBus.emit('freeze-player');
  };

  return (
    <div style={styles.container}>
      {/* Left: Level + XP bar */}
      <div style={styles.left}>
        <span style={styles.levelBadge}>Lv.{level}</span>
        <div style={styles.xpBarOuter}>
          <div style={{ ...styles.xpBarFill, width: `${Math.min(xpPercent, 100)}%` }} />
        </div>
        <span style={styles.xpText}>{xp}/{xpToNextLevel}</span>
      </div>

      {/* Center: Streak */}
      <div style={styles.center}>
        <span style={styles.streakText}>Streak: {streak}</span>
      </div>

      {/* Right: Stats + Buttons */}
      <div style={styles.right}>
        <span style={styles.dirhams}>{dirhams} D</span>
        <span style={styles.statLabel}>Words: {wordsLearned}</span>

        {/* Quests button with active quest badge */}
        <button style={styles.btn} onClick={openQuestLog}>
          Quests
          {activeQuestCount > 0 && (
            <span style={{ ...styles.badge, ...styles.questBadge }}>
              {activeQuestCount}
            </span>
          )}
        </button>

        {/* Review button with due count badge */}
        {reviewDueCount > 0 && (
          <span style={{ ...styles.badge, ...styles.reviewBadge, position: 'relative', top: 0, right: 0, pointerEvents: 'auto' }}>
            {reviewDueCount} due
          </span>
        )}

        <button style={styles.btn} onClick={onMenu}>Menu</button>
      </div>
    </div>
  );
}
