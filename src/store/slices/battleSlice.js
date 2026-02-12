import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  // --- Existing (preserved from v5.0) ---
  activeBattle: null, // Current enemy ID being battled
  playerHP: 100,
  bossHP: 0,
  maxBossHP: 0,
  currentRound: 0,
  streak: 0, // Current streak of correct answers
  bossesDefeated: [], // Array of defeated boss/enemy IDs
  battleHistory: [], // Array of recent battle results
  hintsUsed: 0, // Number of hints used in current battle

  // --- New for v6.0 Phase 27 ---
  playerMaxHP: 100,
  playerMP: 50,
  playerMaxMP: 50,

  // Turn tracking
  turnCount: 0,
  currentTurn: null, // 'player' | 'enemy' | 'companion'
  isPlayerDefending: false,

  // Active status effects
  playerEffects: [], // [{ id, remainingTurns, ... }]
  enemyEffects: [],

  // Combo system
  grammarCombo: 0, // Consecutive grammar-correct answers
  maxStreak: 0, // Highest streak this battle
  wordsUsed: [], // Word IDs used in this battle (for FSRS tracking)

  // Battle metadata
  encounterType: null, // 'random' | 'story' | 'boss' | 'arena'
  battleZone: null, // Zone where battle started
  battleStartTimestamp: null,

  // Enemy details (cached from data for quick access)
  enemyData: null, // { id, name, nameArabic, element, ... }
};

const battleSlice = createSlice({
  name: 'battle',
  initialState,
  reducers: {
    startBattle(state, action) {
      // payload: { bossId, bossHP, encounterType?, zone?, enemyData?, playerMaxHP?, playerMaxMP? }
      const { bossId, bossHP, encounterType, zone, enemyData, playerMaxHP, playerMaxMP } = action.payload;
      state.activeBattle = bossId;
      state.playerMaxHP = playerMaxHP || 100;
      state.playerHP = state.playerMaxHP;
      state.playerMaxMP = playerMaxMP || 50;
      state.playerMP = state.playerMaxMP;
      state.bossHP = bossHP;
      state.maxBossHP = bossHP;
      state.currentRound = 0;
      state.streak = 0;
      state.hintsUsed = 0;
      state.turnCount = 0;
      state.currentTurn = null;
      state.isPlayerDefending = false;
      state.playerEffects = [];
      state.enemyEffects = [];
      state.grammarCombo = 0;
      state.maxStreak = 0;
      state.wordsUsed = [];
      state.encounterType = encounterType || null;
      state.battleZone = zone || null;
      state.battleStartTimestamp = Date.now();
      state.enemyData = enemyData || null;
    },

    dealDamage(state, action) {
      // payload: { damage, correct }
      const { damage, correct } = action.payload;

      if (correct) {
        // Player answered correctly - damage the boss
        state.bossHP = Math.max(0, state.bossHP - damage);
        state.streak += 1;
        if (state.streak > state.maxStreak) {
          state.maxStreak = state.streak;
        }
      } else {
        // Player answered incorrectly - take damage
        state.playerHP = Math.max(0, state.playerHP - damage);
        state.streak = 0;
      }

      state.currentRound += 1;
    },

    dealDamageToPlayer(state, action) {
      // payload: { damage } — used by enemy attacks
      const { damage } = action.payload;
      const isDefending = state.isPlayerDefending;
      const finalDamage = isDefending ? Math.floor(damage * 0.5) : damage;
      state.playerHP = Math.max(0, state.playerHP - finalDamage);
    },

    healEnemy(state, action) {
      // payload: { amount }
      const { amount } = action.payload;
      state.bossHP = Math.min(state.maxBossHP, state.bossHP + amount);
    },

    setPlayerDefending(state, action) {
      state.isPlayerDefending = action.payload;
    },

    setCurrentTurn(state, action) {
      state.currentTurn = action.payload;
    },

    spendMP(state, action) {
      state.playerMP = Math.max(0, state.playerMP - action.payload);
    },

    restoreMP(state, action) {
      state.playerMP = Math.min(state.playerMaxMP, state.playerMP + action.payload);
    },

    applyStatusEffect(state, action) {
      // payload: { target: 'player'|'enemy', effect: { id, remainingTurns, ... } }
      const { target, effect } = action.payload;
      const list = target === 'player' ? state.playerEffects : state.enemyEffects;
      // Remove existing instance of same effect (no stacking)
      const filtered = list.filter((e) => e.id !== effect.id);
      filtered.push(effect);
      if (target === 'player') {
        state.playerEffects = filtered;
      } else {
        state.enemyEffects = filtered;
      }
    },

    tickStatusEffects(state) {
      // Reduce remaining turns, remove expired
      state.playerEffects = state.playerEffects
        .map((e) => ({ ...e, remainingTurns: e.remainingTurns - 1 }))
        .filter((e) => e.remainingTurns > 0);
      state.enemyEffects = state.enemyEffects
        .map((e) => ({ ...e, remainingTurns: e.remainingTurns - 1 }))
        .filter((e) => e.remainingTurns > 0);
    },

    recordWordUsed(state, action) {
      const wordId = action.payload;
      if (!state.wordsUsed.includes(wordId)) {
        state.wordsUsed.push(wordId);
      }
    },

    incrementTurn(state) {
      state.turnCount++;
    },

    useHint(state) {
      state.hintsUsed += 1;
    },

    endBattle(state, action) {
      // payload: { victory, accuracy, timeElapsed, rewards, wordsUsed?, maxStreak?, bossId? }
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
        maxStreak: state.maxStreak,
        wordsUsed: state.wordsUsed.length,
        encounterType: state.encounterType,
        timestamp: Date.now(),
      });
      state.battleHistory = state.battleHistory.slice(0, 20);

      // Reset active battle
      state.activeBattle = null;
      state.playerHP = state.playerMaxHP;
      state.playerMP = state.playerMaxMP;
      state.bossHP = 0;
      state.maxBossHP = 0;
      state.currentRound = 0;
      state.streak = 0;
      state.hintsUsed = 0;
      state.turnCount = 0;
      state.currentTurn = null;
      state.isPlayerDefending = false;
      state.playerEffects = [];
      state.enemyEffects = [];
      state.grammarCombo = 0;
      state.maxStreak = 0;
      state.wordsUsed = [];
      state.encounterType = null;
      state.battleZone = null;
      state.battleStartTimestamp = null;
      state.enemyData = null;
    },

    resetBattle(state) {
      state.activeBattle = null;
      state.playerHP = state.playerMaxHP;
      state.playerMP = state.playerMaxMP;
      state.bossHP = 0;
      state.maxBossHP = 0;
      state.currentRound = 0;
      state.streak = 0;
      state.hintsUsed = 0;
      state.turnCount = 0;
      state.currentTurn = null;
      state.isPlayerDefending = false;
      state.playerEffects = [];
      state.enemyEffects = [];
      state.grammarCombo = 0;
      state.maxStreak = 0;
      state.wordsUsed = [];
      state.encounterType = null;
      state.battleZone = null;
      state.battleStartTimestamp = null;
      state.enemyData = null;
    },
  },
});

export const {
  startBattle,
  dealDamage,
  dealDamageToPlayer,
  healEnemy,
  setPlayerDefending,
  setCurrentTurn,
  spendMP,
  restoreMP,
  applyStatusEffect,
  tickStatusEffects,
  recordWordUsed,
  incrementTurn,
  useHint,
  endBattle,
  resetBattle,
} = battleSlice.actions;

// ========== MEMOIZED SELECTORS ==========

export const selectActiveBattle = (state) => state.battle.activeBattle;

export const selectBattleStats = createSelector(
  [(state) => state.battle],
  (battle) => ({
    playerHP: battle.playerHP,
    playerMaxHP: battle.playerMaxHP,
    playerMP: battle.playerMP,
    playerMaxMP: battle.playerMaxMP,
    bossHP: battle.bossHP,
    maxBossHP: battle.maxBossHP,
    currentRound: battle.currentRound,
    streak: battle.streak,
    maxStreak: battle.maxStreak,
    hintsUsed: battle.hintsUsed,
    turnCount: battle.turnCount,
    isPlayerDefending: battle.isPlayerDefending,
  })
);

export const selectBossesDefeated = (state) => state.battle.bossesDefeated;
export const selectBattleHistory = (state) => state.battle.battleHistory;
export const selectPlayerEffects = (state) => state.battle.playerEffects;
export const selectEnemyEffects = (state) => state.battle.enemyEffects;
export const selectEnemyData = (state) => state.battle.enemyData;
export const selectBattleStreak = (state) => state.battle.streak;

export const selectIsBossDefeated = (bossId) => (state) => {
  return state.battle.bossesDefeated.includes(bossId);
};

export const selectBattleWinRate = createSelector(
  [selectBattleHistory],
  (history) => {
    if (history.length === 0) return 0;
    const wins = history.filter((b) => b.victory).length;
    return Math.round((wins / history.length) * 100);
  }
);

export default battleSlice.reducer;
