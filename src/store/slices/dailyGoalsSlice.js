import { createSlice, createSelector } from '@reduxjs/toolkit';
import { DEFAULT_DAILY_GOALS, areAllGoalsCompleted, getGoalProgress } from '../../data/dailyGoals.js';

const initialState = {
  date: null, // ISO date string for current day
  goals: { ...DEFAULT_DAILY_GOALS },
  allCompleted: false,
  sessionStartTime: null, // Track session time for minutes played
  totalSessionMinutes: 0, // Accumulated minutes for current session
};

const dailyGoalsSlice = createSlice({
  name: 'dailyGoals',
  initialState,
  reducers: {
    // Update a specific daily goal progress
    updateDailyGoal(state, action) {
      // payload: { goalType, amount }
      const { goalType, amount } = action.payload;

      if (!state.goals[goalType]) return;

      // Auto-reset if date has changed
      const today = new Date().toISOString().split('T')[0];
      if (state.date !== today) {
        // Reset all goals for new day
        state.goals = JSON.parse(JSON.stringify(DEFAULT_DAILY_GOALS));
        state.date = today;
        state.allCompleted = false;
        state.totalSessionMinutes = 0;
      }

      // Update the goal
      state.goals[goalType].current = Math.min(
        state.goals[goalType].current + amount,
        state.goals[goalType].target * 2 // Allow slight overflow for display
      );

      // Check if all goals are now completed
      state.allCompleted = areAllGoalsCompleted(state.goals);
    },

    // Set a goal's current value directly
    setGoalProgress(state, action) {
      // payload: { goalType, current }
      const { goalType, current } = action.payload;

      if (!state.goals[goalType]) return;

      const today = new Date().toISOString().split('T')[0];
      if (state.date !== today) {
        state.goals = JSON.parse(JSON.stringify(DEFAULT_DAILY_GOALS));
        state.date = today;
        state.allCompleted = false;
        state.totalSessionMinutes = 0;
      }

      state.goals[goalType].current = current;
      state.allCompleted = areAllGoalsCompleted(state.goals);
    },

    // Manually reset all daily goals (for new day)
    resetDailyGoals(state) {
      const today = new Date().toISOString().split('T')[0];
      state.date = today;
      state.goals = JSON.parse(JSON.stringify(DEFAULT_DAILY_GOALS));
      state.allCompleted = false;
      state.totalSessionMinutes = 0;
    },

    // Check and auto-reset if date has changed
    checkDailyReset(state) {
      const today = new Date().toISOString().split('T')[0];
      if (state.date !== today) {
        state.date = today;
        state.goals = JSON.parse(JSON.stringify(DEFAULT_DAILY_GOALS));
        state.allCompleted = false;
        state.totalSessionMinutes = 0;
      }
    },

    // Track session time
    startSession(state) {
      state.sessionStartTime = Date.now();
    },

    endSession(state) {
      if (state.sessionStartTime) {
        const sessionDuration = Date.now() - state.sessionStartTime;
        const sessionMinutes = Math.floor(sessionDuration / 60000);
        state.totalSessionMinutes += sessionMinutes;
        state.sessionStartTime = null;
      }
    },

    // Update minutes played goal based on session time
    updateSessionTime(state) {
      if (state.sessionStartTime) {
        const currentDuration = Date.now() - state.sessionStartTime;
        const totalMinutes = state.totalSessionMinutes + Math.floor(currentDuration / 60000);

        const today = new Date().toISOString().split('T')[0];
        if (state.date !== today) {
          state.goals = JSON.parse(JSON.stringify(DEFAULT_DAILY_GOALS));
          state.date = today;
          state.allCompleted = false;
          state.totalSessionMinutes = 0;
        }

        state.goals.minutesPlayed.current = totalMinutes;
        state.allCompleted = areAllGoalsCompleted(state.goals);
      }
    },

    // Mark all goals as completed (for testing/admin)
    completeAllGoals(state) {
      Object.keys(state.goals).forEach((goalType) => {
        state.goals[goalType].current = state.goals[goalType].target;
      });
      state.allCompleted = true;
    },
  },
});

export const {
  updateDailyGoal,
  setGoalProgress,
  resetDailyGoals,
  checkDailyReset,
  startSession,
  endSession,
  updateSessionTime,
  completeAllGoals,
} = dailyGoalsSlice.actions;

// ========== SELECTORS ==========

export const selectDailyGoals = (state) => state.dailyGoals.goals;
export const selectDailyGoalsDate = (state) => state.dailyGoals.date;
export const selectAllGoalsCompleted = (state) => state.dailyGoals.allCompleted;

// Get completion status for all goals
export const selectGoalsCompletion = createSelector(
  [selectDailyGoals],
  (goals) => {
    const completion = {};
    Object.entries(goals).forEach(([key, goal]) => {
      completion[key] = {
        completed: goal.current >= goal.target,
        progress: getGoalProgress(goal),
        current: goal.current,
        target: goal.target,
      };
    });
    return completion;
  }
);

// Count completed goals
export const selectCompletedGoalsCount = createSelector(
  [selectDailyGoals],
  (goals) => {
    return Object.values(goals).filter((goal) => goal.current >= goal.target).length;
  }
);

// Get total goal count
export const selectTotalGoalsCount = createSelector(
  [selectDailyGoals],
  (goals) => Object.keys(goals).length
);

// Get overall progress percentage
export const selectOverallProgress = createSelector(
  [selectCompletedGoalsCount, selectTotalGoalsCount],
  (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }
);

export default dailyGoalsSlice.reducer;
