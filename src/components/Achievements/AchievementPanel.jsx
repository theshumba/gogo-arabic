import { useState, useCallback, useMemo, memo } from 'react';
import { useSelector } from 'react-redux';
import {
  selectUnlockedAchievements,
  selectAchievementProgress,
  selectUnlockedCount,
  selectTotalAchievementXP,
} from '../../store/slices/achievementSlice.js';
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  getAchievementsByCategory,
  RARITY_COLORS,
} from '../../data/achievements.js';
import { COLORS, FONTS } from '../../styles/theme.js';

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  panel: {
    width: '100%',
    maxWidth: '1200px',
    maxHeight: '90vh',
    background: COLORS.dark,
    border: `4px solid ${COLORS.xpGold}`,
    boxShadow: `0 0 40px rgba(226, 182, 89, 0.4)`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    background: COLORS.brown,
    borderBottom: `4px solid ${COLORS.xpGold}`,
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.pixel,
    fontSize: '18px',
    color: COLORS.xpGold,
    textTransform: 'uppercase',
  },
  stats: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
  },
  stat: {
    fontFamily: FONTS.pixel,
    fontSize: '11px',
    color: COLORS.white,
  },
  statValue: {
    color: COLORS.xpGold,
    fontWeight: 'bold',
  },
  closeBtn: {
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    padding: '8px 16px',
    background: COLORS.gray,
    color: COLORS.white,
    border: `2px solid ${COLORS.light}`,
    cursor: 'pointer',
    textTransform: 'uppercase',
  },
  tabs: {
    display: 'flex',
    background: COLORS.gray,
    borderBottom: `2px solid ${COLORS.light}`,
    overflowX: 'auto',
    flexShrink: 0,
  },
  tab: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    padding: '12px 16px',
    background: 'none',
    border: 'none',
    color: COLORS.light,
    cursor: 'pointer',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: COLORS.dark,
    color: COLORS.xpGold,
    borderTop: `3px solid ${COLORS.xpGold}`,
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  card: {
    background: COLORS.gray,
    border: `3px solid ${COLORS.light}`,
    padding: '16px',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  cardUnlocked: {
    borderColor: COLORS.xpGold,
    boxShadow: `0 0 10px rgba(226, 182, 89, 0.3)`,
  },
  cardLocked: {
    opacity: 0.5,
    filter: 'grayscale(0.8)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '12px',
  },
  cardIcon: {
    fontSize: '32px',
    lineHeight: 1,
  },
  cardIconLocked: {
    filter: 'grayscale(1) brightness(0.6)',
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    marginBottom: '4px',
    lineHeight: 1.3,
  },
  cardDescription: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.light,
    lineHeight: 1.4,
    marginBottom: '8px',
  },
  cardRarity: {
    fontFamily: FONTS.pixel,
    fontSize: '8px',
    textTransform: 'uppercase',
    marginBottom: '6px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: `2px solid ${COLORS.dark}`,
  },
  xpBadge: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.xpGold,
    fontWeight: 'bold',
  },
  unlockedDate: {
    fontFamily: FONTS.pixel,
    fontSize: '8px',
    color: COLORS.light,
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: COLORS.dark,
    border: `2px solid ${COLORS.light}`,
    overflow: 'hidden',
    marginTop: '8px',
  },
  progressFill: {
    height: '100%',
    background: COLORS.xpGold,
    transition: 'width 0.3s',
  },
  progressText: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.xpGold,
    marginTop: '4px',
  },
};

// Memoize achievement card to prevent re-renders
const AchievementCard = memo(function AchievementCard({ achievement, isUnlocked, unlockedDate, progress }) {
  const rarityColor = RARITY_COLORS[achievement.rarity] || COLORS.white;
  const { current, target } = progress;
  const progressPercent = useMemo(
    () => (target > 0 ? Math.min((current / target) * 100, 100) : 0),
    [current, target]
  );

  return (
    <div
      style={{
        ...styles.card,
        ...(isUnlocked ? { ...styles.cardUnlocked, borderColor: rarityColor } : styles.cardLocked),
      }}
    >
      <div style={styles.cardHeader}>
        <div style={{
          ...styles.cardIcon,
          ...(isUnlocked ? {} : styles.cardIconLocked),
        }}>
          {isUnlocked ? achievement.icon : '🔒'}
        </div>
        <div style={styles.cardContent}>
          <div style={{ ...styles.cardName, color: rarityColor }}>
            {isUnlocked ? achievement.name : '???'}
          </div>
          <div style={styles.cardRarity}>
            {achievement.rarity}
          </div>
        </div>
      </div>

      <div style={styles.cardDescription}>
        {isUnlocked ? achievement.description : 'Hidden achievement'}
      </div>

      {!isUnlocked && (
        <>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progressPercent}%` }} />
          </div>
          <div style={styles.progressText}>
            {current}/{target}
          </div>
        </>
      )}

      <div style={styles.cardFooter}>
        <span style={styles.xpBadge}>+{achievement.xpReward} XP</span>
        {isUnlocked && unlockedDate && (
          <span style={styles.unlockedDate}>
            {new Date(unlockedDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
});

function AchievementPanel({ onClose }) {
  const [activeTab, setActiveTab] = useState('all');
  const unlockedAchievements = useSelector(selectUnlockedAchievements);
  const achievementProgress = useSelector(selectAchievementProgress);
  const unlockedCount = useSelector(selectUnlockedCount);
  const totalXP = useSelector(selectTotalAchievementXP);

  const tabs = useMemo(() => [
    { id: 'all', label: 'All' },
    { id: ACHIEVEMENT_CATEGORIES.VOCABULARY, label: 'Vocabulary' },
    { id: ACHIEVEMENT_CATEGORIES.ALPHABET, label: 'Alphabet' },
    { id: ACHIEVEMENT_CATEGORIES.QUESTS, label: 'Quests' },
    { id: ACHIEVEMENT_CATEGORIES.STREAKS, label: 'Streaks' },
    { id: ACHIEVEMENT_CATEGORIES.XP, label: 'XP' },
    { id: ACHIEVEMENT_CATEGORIES.EXPLORATION, label: 'Exploration' },
    { id: ACHIEVEMENT_CATEGORIES.REVIEW, label: 'Review' },
    { id: ACHIEVEMENT_CATEGORIES.ECONOMY, label: 'Economy' },
    { id: ACHIEVEMENT_CATEGORIES.SPECIAL, label: 'Special' },
  ], []);

  const filteredAchievements = useMemo(
    () => (activeTab === 'all' ? ACHIEVEMENTS : getAchievementsByCategory(activeTab)),
    [activeTab]
  );

  const handleTabClick = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.title}>Achievements</div>
            <div style={styles.stats}>
              <span style={styles.stat}>
                <span style={styles.statValue}>{unlockedCount}</span> / {ACHIEVEMENTS.length} Unlocked
              </span>
              <span style={styles.stat}>
                <span style={styles.statValue}>{totalXP.toLocaleString()}</span> XP Earned
              </span>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            Close
          </button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.tabActive : {}),
              }}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={styles.content}>
          <div style={styles.grid}>
            {filteredAchievements.map((achievement) => {
              const isUnlocked = !!unlockedAchievements[achievement.id];
              const unlockedDate = unlockedAchievements[achievement.id];
              const progress = achievementProgress[achievement.id] || { current: 0, target: 1 };

              return (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={isUnlocked}
                  unlockedDate={unlockedDate}
                  progress={progress}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoize component
export default memo(AchievementPanel);
