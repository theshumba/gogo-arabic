import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  activeBattle: null, // Current boss ID being battled
  playerHP: 100,
  bossHP: 0,
  maxBossHP: 0,
  currentRound: 0,
  streak: 0, // Current streak of correct answers
  bossesDefeated: [], // Array of defeated boss IDs
  battleHistory: [], // Array of recent battle results
  hintsUsed: 0, // Number of hints used in current battle
};

const battleSlice = createSlice({
  name: 'battle',
  initialState,
  reducers: {
    startBattle(state, action) {
      // payload: { bossId, bossHP }
      const { bossId, bossHP } = action.payload;
      state.activeBattle = bossId;
      state.playerHP = 100;
      state.bossHP = bossHP;
      state.maxBossHP = bossHP;
      state.currentRound = 0;
      state.streak = 0;
      state.hintsUsed = 0;
    },

    dealDamage(state, action) {
      // payload: { damage, correct }
      const { damage, correct } = action.payload;

      if (correct) {
        // Player answered correctly - damage the boss
        state.bossHP = Math.max(0, state.bossHP - damage);
        state.streak += 1;
      } else {
        // Player answered incorrectly - take damage
        state.playerHP = Math.max(0, state.playerHP - damage);
        state.streak = 0;
      }

      state.currentRound += 1;
    },

    useHint(state) {
      state.hintsUsed += 1;
    },

    endBattle(state, action) {
      // payload: { victory, accuracy, timeElapsed, rewards }
      const { victory, accuracy, timeElapsed, rewards } = action.payload;

      if (victory && state.activeBattle && !state.bossesDefeated.includes(state.activeBattle)) {
        state.bossesDefeated.push(state.activeBattle);
      }

      // Record battle in history (keep last 20)
      state.battleHistory.unshift({
        bossId: state.activeBattle,
        victory,
        accuracy,
        timeElapsed,
        rewards,
        timestamp: Date.now(),
      });
      state.battleHistory = state.battleHistory.slice(0, 20);

      // Reset active battle
      state.activeBattle = null;
      state.playerHP = 100;
      state.bossHP = 0;
      state.maxBossHP = 0;
      state.currentRound = 0;
      state.streak = 0;
      state.hintsUsed = 0;
    },

    resetBattle(state) {
      state.activeBattle = null;
      state.playerHP = 100;
      state.bossHP = 0;
      state.maxBossHP = 0;
      state.currentRound = 0;
      state.streak = 0;
      state.hintsUsed = 0;
    },
  },
});

export const {
  startBattle,
  dealDamage,
  useHint,
  endBattle,
  resetBattle,
} = battleSlice.actions;

// ========== MEMOIZED SELECTORS ==========

// Select active battle state
export const selectActiveBattle = (state) => state.battle.activeBattle;

// Select battle stats
export const selectBattleStats = createSelector(
  [(state) => state.battle],
  (battle) => ({
    playerHP: battle.playerHP,
    bossHP: battle.bossHP,
    maxBossHP: battle.maxBossHP,
    currentRound: battle.currentRound,
    streak: battle.streak,
    hintsUsed: battle.hintsUsed,
  })
);

// Select defeated bosses
export const selectBossesDefeated = (state) => state.battle.bossesDefeated;

// Select battle history
export const selectBattleHistory = (state) => state.battle.battleHistory;

// Select if boss is defeated
export const selectIsBossDefeated = (bossId) => (state) => {
  return state.battle.bossesDefeated.includes(bossId);
};

// Select battle win rate
export const selectBattleWinRate = createSelector(
  [selectBattleHistory],
  (history) => {
    if (history.length === 0) return 0;
    const wins = history.filter(b => b.victory).length;
    return Math.round((wins / history.length) * 100);
  }
);

export default battleSlice.reducer;
