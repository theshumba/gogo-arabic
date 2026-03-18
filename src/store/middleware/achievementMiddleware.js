/**
 * Achievement Middleware
 *
 * Listens to Redux actions and checks if any achievements should be unlocked.
 * Auto-dispatches unlockAchievement and addXP when conditions are met.
 */

import { ACHIEVEMENTS } from '../../data/achievements.js';
import vocabularyData from '../../data/vocabularyAll.js';
import { unlockAchievement, recordPerfectQuiz } from '../slices/achievementSlice.js';
import { addXP } from '../slices/playerSlice.js';

// Helper to check if an achievement requirement is met
function isAchievementMet(achievement, state) {
  const req = achievement.requirement;
  const { player, vocabulary, quests, alphabet, achievements } = state;

  switch (req.type) {
    case 'words_learned':
      return player.wordsLearned >= req.threshold;

    case 'letters_learned': {
      const lettersCount = alphabet.completedGroups?.length || 0;
      return lettersCount >= req.threshold;
    }

    case 'quests_completed': {
      const completedCount = Object.values(quests.quests || {}).filter((q) => q.status === 'completed').length;
      return completedCount >= req.threshold;
    }

    case 'streak':
      return player.streak >= req.threshold;

    case 'level':
      return player.level >= req.threshold;

    case 'xp_total':
      return player.xp >= req.threshold;

    case 'zones_unlocked':
      return (player.unlockedZones?.length || 0) >= req.threshold;

    case 'chests_opened':
      return (player.openedChests?.length || 0) >= req.threshold;

    case 'books_read':
      return (player.readBooks?.length || 0) >= req.threshold;

    case 'reviews_completed':
      return achievements.stats.totalReviews >= req.threshold;

    case 'review_streak':
      return achievements.stats.reviewStreakDays >= req.threshold;

    case 'shop_purchases':
      return achievements.stats.shopPurchases >= req.threshold;

    case 'dirhams_spent':
      return achievements.stats.dirhamsSpent >= req.threshold;

    case 'dirhams_held':
      return player.dirhams >= req.threshold;

    case 'category_complete': {
      const categoryWords = vocabularyData.filter((w) => w.category === req.category);
      const learnedInCategory = categoryWords.filter((w) => vocabulary.fsrsCards[w.id]);
      return learnedInCategory.length === categoryWords.length && categoryWords.length > 0;
    }

    case 'perfect_quiz':
      return achievements.stats.perfectQuizzes >= 1;

    case 'study_time_after': {
      const hour = new Date().getHours();
      return hour >= req.hour;
    }

    case 'study_time_before': {
      const hour = new Date().getHours();
      return hour < req.hour;
    }

    case 'all_achievements': {
      const totalAchievements = ACHIEVEMENTS.length - 1; // Exclude completionist itself
      const unlockedCount = Object.keys(achievements.unlockedAchievements).length;
      return unlockedCount >= totalAchievements;
    }

    default:
      return false;
  }
}

// Map of action types to achievement types that should be checked
const ACTION_TO_ACHIEVEMENT_TYPES = {
  'player/incrementWordsLearned': ['words_learned', 'category_complete', 'study_time_after', 'study_time_before'],
  'player/addXP': ['xp_total', 'study_time_after', 'study_time_before'],
  'player/updateStreak': ['streak'],
  'player/unlockZone': ['zones_unlocked'],
  'player/markChestOpened': ['chests_opened'],
  'player/markBookRead': ['books_read'],
  'alphabet/completeGroup': ['letters_learned'],
  'quests/completeQuest': ['quests_completed'],
  'achievements/incrementReviews': ['reviews_completed', 'review_streak'],
  'achievements/recordPerfectQuiz': ['perfect_quiz'],
  'achievements/recordShopPurchase': ['shop_purchases', 'dirhams_spent'],
  'player/spendDirhams': ['dirhams_spent'],
  'player/addDirhams': ['dirhams_held'],
};

// Re-entrancy guard: prevents infinite dispatch cascade when addXP triggers
// achievement checks which dispatch more addXP
let _isProcessingAchievements = false;

export const achievementMiddleware = (store) => (next) => (action) => {
  // Pass the action through first
  const result = next(action);

  // Early return for actions that don't affect achievements
  const typesToCheck = ACTION_TO_ACHIEVEMENT_TYPES[action.type];
  if (!typesToCheck) return result;

  // Prevent re-entrant dispatch cascade
  if (_isProcessingAchievements) return result;
  _isProcessingAchievements = true;

  try {
    // Get the updated state only for relevant actions
    const state = store.getState();
    const unlockedAchievements = state.achievements?.unlockedAchievements || {};

    // Find achievements that match the types to check
    const relevantAchievements = ACHIEVEMENTS.filter((achievement) =>
      typesToCheck.includes(achievement.requirement.type)
    );

    // Collect all XP rewards to batch into a single dispatch
    let totalXpReward = 0;

    // Check each relevant achievement
    relevantAchievements.forEach((achievement) => {
      // Skip if already unlocked
      if (unlockedAchievements[achievement.id]) return;

      // Check if the achievement is now met
      if (isAchievementMet(achievement, state)) {
        // Unlock the achievement
        store.dispatch(unlockAchievement(achievement.id));

        // Accumulate XP reward instead of dispatching immediately
        totalXpReward += achievement.xpReward;
      }
    });

    // Dispatch batched XP reward once (avoids re-entrant addXP cascade)
    if (totalXpReward > 0) {
      store.dispatch(addXP(totalXpReward));
    }

    // Check for completionist achievement after dispatches settle
    queueMicrotask(() => {
      const newState = store.getState();
      const completionist = ACHIEVEMENTS.find((a) => a.requirement.type === 'all_achievements');
      if (completionist && !newState.achievements.unlockedAchievements[completionist.id]) {
        if (isAchievementMet(completionist, newState)) {
          store.dispatch(unlockAchievement(completionist.id));
          store.dispatch(addXP(completionist.xpReward));
        }
      }
    });
  } finally {
    _isProcessingAchievements = false;
  }

  return result;
};

// Special helper for quiz completion (called from quiz overlay)
export function checkPerfectQuiz(correctCount, totalCount, dispatch) {
  if (correctCount === totalCount && totalCount > 0) {
    dispatch(recordPerfectQuiz());
  }
}
