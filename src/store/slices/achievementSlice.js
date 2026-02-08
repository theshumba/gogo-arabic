import { createSlice, createSelector } from '@reduxjs/toolkit';
import { ACHIEVEMENTS, getAchievementById } from '../../data/achievements.js';
import vocabularyData from '../../data/vocabularyAll.js';

const initialState = {
  unlockedAchievements: {}, // { achievementId: timestamp }
  newAchievements: [], // Queue of achievement IDs to show as toasts
  stats: {
    totalReviews: 0,
    reviewStreakDays: 0,
    lastReviewDate: null,
    perfectQuizzes: 0,
    shopPurchases: 0,
    dirhamsSpent: 0,
  },
};

const achievementSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    unlockAchievement(state, action) {
      // payload: achievementId
      const achievementId = action.payload;
      if (!state.unlockedAchievements[achievementId]) {
        state.unlockedAchievements[achievementId] = Date.now();
        state.newAchievements.push(achievementId);
      }
    },

    dismissAchievementNotification(state, action) {
      // payload: achievementId
      const achievementId = action.payload;
      state.newAchievements = state.newAchievements.filter((id) => id !== achievementId);
    },

    clearAllNotifications(state) {
      state.newAchievements = [];
    },

    // Stats tracking for achievement triggers
    incrementReviews(state) {
      state.stats.totalReviews += 1;
      const today = new Date().toDateString();
      if (state.stats.lastReviewDate === today) return;

      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (state.stats.lastReviewDate === yesterday) {
        state.stats.reviewStreakDays += 1;
      } else {
        state.stats.reviewStreakDays = 1;
      }
      state.stats.lastReviewDate = today;
    },

    recordPerfectQuiz(state) {
      state.stats.perfectQuizzes += 1;
    },

    recordShopPurchase(state, action) {
      // payload: amount spent
      const amount = action.payload;
      state.stats.shopPurchases += 1;
      state.stats.dirhamsSpent += amount;
    },
  },
});

export const {
  unlockAchievement,
  dismissAchievementNotification,
  clearAllNotifications,
  incrementReviews,
  recordPerfectQuiz,
  recordShopPurchase,
} = achievementSlice.actions;

// ========== SELECTORS ==========

export const selectUnlockedAchievements = (state) => state.achievements.unlockedAchievements;
export const selectNewAchievements = (state) => state.achievements.newAchievements;
export const selectAchievementStats = (state) => state.achievements.stats;

// Get achievement progress for display (e.g., "47/50 words")
export const selectAchievementProgress = createSelector(
  [(state) => state.player, (state) => state.vocabulary, (state) => state.quests, (state) => state.alphabet, (state) => state.achievements],
  (player, vocabulary, quests, alphabet, achievements) => {
    const progress = {};

    ACHIEVEMENTS.forEach((achievement) => {
      const req = achievement.requirement;
      let current = 0;
      let target = req.threshold || 1;

      switch (req.type) {
        case 'words_learned':
          current = player.wordsLearned;
          break;
        case 'letters_learned':
          current = alphabet.completedGroups?.length || 0;
          break;
        case 'quests_completed':
          current = Object.values(quests.quests || {}).filter((q) => q.status === 'completed').length;
          break;
        case 'streak':
          current = player.streak;
          break;
        case 'level':
          current = player.level;
          break;
        case 'xp_total':
          current = player.xp;
          break;
        case 'zones_unlocked':
          current = player.unlockedZones?.length || 0;
          break;
        case 'chests_opened':
          current = player.openedChests?.length || 0;
          break;
        case 'books_read':
          current = player.readBooks?.length || 0;
          break;
        case 'reviews_completed':
          current = achievements.stats.totalReviews;
          break;
        case 'review_streak':
          current = achievements.stats.reviewStreakDays;
          break;
        case 'shop_purchases':
          current = achievements.stats.shopPurchases;
          break;
        case 'dirhams_spent':
          current = achievements.stats.dirhamsSpent;
          break;
        case 'dirhams_held':
          current = player.dirhams;
          break;
        case 'category_complete': {
          // Count words learned in this category
          const categoryWords = vocabularyData.filter((w) => w.category === req.category);
          const learnedInCategory = categoryWords.filter((w) => vocabulary.fsrsCards[w.id]).length;
          current = learnedInCategory;
          target = categoryWords.length;
          break;
        }
        case 'perfect_quiz':
          current = achievements.stats.perfectQuizzes;
          target = 1;
          break;
        case 'study_time_after':
        case 'study_time_before':
          // These are one-time triggers, not progress-based
          current = achievements.unlockedAchievements[achievement.id] ? 1 : 0;
          target = 1;
          break;
        case 'all_achievements': {
          const totalAchievements = ACHIEVEMENTS.length - 1; // Exclude completionist itself
          current = Object.keys(achievements.unlockedAchievements).length;
          target = totalAchievements;
          break;
        }
        default:
          break;
      }

      progress[achievement.id] = { current, target };
    });

    return progress;
  }
);

// Check if an achievement is unlocked
export const selectIsAchievementUnlocked = (achievementId) => (state) =>
  !!state.achievements.unlockedAchievements[achievementId];

// Get unlocked achievement count
export const selectUnlockedCount = createSelector([selectUnlockedAchievements], (unlocked) => Object.keys(unlocked).length);

// Get total XP earned from achievements
export const selectTotalAchievementXP = createSelector([selectUnlockedAchievements], (unlocked) => {
  let total = 0;
  Object.keys(unlocked).forEach((id) => {
    const achievement = getAchievementById(id);
    if (achievement) total += achievement.xpReward;
  });
  return total;
});

export default achievementSlice.reducer;
