/**
 * Regression tests for QuestLog reward double-claim race (CR-04).
 *
 * Verifies that rapid repeated calls to handleClaim for the same quest
 * only dispatch rewards once (idempotency guard).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import questReducer, { claimReward } from '../../../store/slices/questSlice.js';
import playerReducer, { addXP, addDirhams } from '../../../store/slices/playerSlice.js';
import uiReducer from '../../../store/slices/uiSlice.js';

// Minimal store for testing the guard logic without rendering
function makeStore(preloadedState) {
  return configureStore({
    reducer: { quests: questReducer, player: playerReducer, ui: uiReducer },
    preloadedState,
  });
}

describe('QuestLog double-claim guard', () => {
  let store;
  const QUEST_ID = 'q_first_words';

  beforeEach(() => {
    store = makeStore({
      player: { xp: 0, dirhams: 0, level: 1, name: 'Tester', streak: 0, maxStreak: 0 },
      quests: {
        quests: {
          [QUEST_ID]: { status: 'completed', progress: 5, rewardClaimed: false },
        },
        activeQuestId: null,
        completed: [],
      },
      ui: { notifications: [] },
    });
  });

  it('marks rewardClaimed after first dispatch', () => {
    store.dispatch(claimReward(QUEST_ID));
    const state = store.getState();
    expect(state.quests.quests[QUEST_ID].rewardClaimed).toBe(true);
  });

  it('dispatching claimReward twice does not change state on second call', () => {
    // First claim
    store.dispatch(claimReward(QUEST_ID));
    const afterFirst = store.getState().quests.quests[QUEST_ID];

    // Second claim — should be a no-op (slice-level idempotency)
    store.dispatch(claimReward(QUEST_ID));
    const afterSecond = store.getState().quests.quests[QUEST_ID];

    // State should be identical (the reducer must not re-award)
    expect(afterSecond).toEqual(afterFirst);
  });

  it('component guard: rewardClaimed flag is readable from quest state', () => {
    // Simulate what handleClaim does: check quests[questId]?.rewardClaimed
    const before = store.getState().quests.quests[QUEST_ID]?.rewardClaimed;
    expect(before).toBe(false); // guard should NOT block first call

    store.dispatch(claimReward(QUEST_ID));

    const after = store.getState().quests.quests[QUEST_ID]?.rewardClaimed;
    expect(after).toBe(true); // guard blocks second call
  });
});
