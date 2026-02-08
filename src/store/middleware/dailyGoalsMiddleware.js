/**
 * Daily Goals Middleware
 *
 * Automatically tracks player actions and updates daily goal progress
 */

import { updateDailyGoal, checkDailyReset } from '../slices/dailyGoalsSlice.js';
import { DAILY_GOAL_TYPES } from '../../data/dailyGoals.js';
import { addXP } from '../slices/playerSlice.js';
import { ALL_GOALS_BONUS_XP, areAllGoalsCompleted } from '../../data/dailyGoals.js';

// Map action types to daily goal types
const ACTION_TO_GOAL_MAPPING = {
  'player/incrementWordsLearned': {
    goalType: DAILY_GOAL_TYPES.WORDS_LEARNED,
    amount: 1,
  },
  'achievements/incrementReviews': {
    goalType: DAILY_GOAL_TYPES.REVIEWS_DONE,
    amount: 1,
  },
  // Quiz completion will be tracked manually via a custom action
};

export const dailyGoalsMiddleware = (store) => (next) => (action) => {
  // Pass the action through first
  const result = next(action);

  // Check for date reset on any action
  if (action.type.startsWith('player/') || action.type.startsWith('vocabulary/')) {
    store.dispatch(checkDailyReset());
  }

  // Track mapped actions
  const goalMapping = ACTION_TO_GOAL_MAPPING[action.type];
  if (goalMapping) {
    const state = store.getState();
    const goalsBefore = state.dailyGoals.goals;
    const wasCompleted = areAllGoalsCompleted(goalsBefore);

    // Update the goal
    store.dispatch(updateDailyGoal({
      goalType: goalMapping.goalType,
      amount: goalMapping.amount,
    }));

    // Check if all goals are now completed (and weren't before)
    const stateAfter = store.getState();
    const goalsAfter = stateAfter.dailyGoals.goals;
    const isNowCompleted = areAllGoalsCompleted(goalsAfter);

    if (!wasCompleted && isNowCompleted) {
      // Award bonus XP for completing all goals
      store.dispatch(addXP(ALL_GOALS_BONUS_XP));
    }

    // Award XP for completing individual goals
    const goalAfter = goalsAfter[goalMapping.goalType];
    const goalBefore = goalsBefore[goalMapping.goalType];
    if (goalAfter.current >= goalAfter.target && goalBefore.current < goalBefore.target) {
      // Goal just completed
      store.dispatch(addXP(goalAfter.xpReward));
    }
  }

  // Handle quiz completion (custom tracking)
  if (action.type === 'ui/closeQuiz') {
    // Check if quiz was passed (this would need to be in the action payload)
    // For now, we'll track this separately via a helper function
  }

  return result;
};

/**
 * Helper function to record quiz completion
 * Call this from quiz overlay when quiz is passed
 */
export function recordQuizCompletion(dispatch, passed) {
  if (passed) {
    dispatch(updateDailyGoal({
      goalType: DAILY_GOAL_TYPES.QUIZZES_PASSED,
      amount: 1,
    }));
  }
}
