import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  quests: {},       // { [questId]: { status, progress, rewardClaimed } }
};

const questSlice = createSlice({
  name: 'quests',
  initialState,
  reducers: {
    initializeQuests(state, action) {
      // payload: quests.json array
      // Only initialize entries that don't already exist (preserves persisted data)
      const questDefs = action.payload;
      for (const qd of questDefs) {
        if (!state.quests[qd.id]) {
          state.quests[qd.id] = {
            status: qd.autoStart ? 'active' : 'locked',
            progress: 0,
            rewardClaimed: false,
          };
        }
      }
    },

    checkPrerequisites(state, action) {
      // payload: quests.json array (need full definitions to read prerequisites)
      const questDefs = action.payload;
      for (const qd of questDefs) {
        const entry = state.quests[qd.id];
        if (!entry || entry.status !== 'locked') continue;

        // A quest unlocks when every prerequisite is completed
        const allMet = qd.prerequisites.every((preId) => {
          const pre = state.quests[preId];
          return pre && pre.status === 'completed';
        });

        if (allMet) {
          entry.status = 'active';
        }
      }
    },

    updateQuestProgress(state, action) {
      // payload: { questId, amount }
      const { questId, amount } = action.payload;
      const entry = state.quests[questId];
      if (entry && entry.status === 'active') {
        entry.progress = (entry.progress ?? 0) + amount;
      }
    },

    completeQuest(state, action) {
      // payload: questId
      const questId = action.payload;
      const entry = state.quests[questId];
      if (entry && entry.status === 'active') {
        entry.status = 'completed';
        entry.completedAt = Date.now();
      }
    },

    claimReward(state, action) {
      // payload: questId
      const questId = action.payload;
      const entry = state.quests[questId];
      if (entry && entry.status === 'completed' && !entry.rewardClaimed) {
        entry.rewardClaimed = true;
      }
    },
  },
});

export const {
  initializeQuests,
  checkPrerequisites,
  updateQuestProgress,
  completeQuest,
  claimReward,
} = questSlice.actions;

// ========== MEMOIZED SELECTORS ==========

// Select all quests
export const selectAllQuests = (state) => state.quests.quests;

// Select active quests (memoized to avoid recalculating)
export const selectActiveQuests = createSelector(
  [selectAllQuests],
  (quests) => Object.entries(quests)
    .filter(([, quest]) => quest.status === 'active')
    .reduce((acc, [id, quest]) => ({ ...acc, [id]: quest }), {})
);

// Select active quest count (memoized)
export const selectActiveQuestCount = createSelector(
  [selectActiveQuests],
  (activeQuests) => Object.keys(activeQuests).length
);

// Select completed quests (memoized)
export const selectCompletedQuests = createSelector(
  [selectAllQuests],
  (quests) => Object.entries(quests)
    .filter(([, quest]) => quest.status === 'completed')
    .reduce((acc, [id, quest]) => ({ ...acc, [id]: quest }), {})
);

export default questSlice.reducer;
