import { createSlice } from '@reduxjs/toolkit';
import { getXPForLevel } from '../../utils/xpCalculator.js';

const initialState = {
  name: '',
  skinTone: 0, // index 0-3
  outfit: 'simple-thobe', // outfit ID matching body spritesheet filename
  headCovering: 'kufi', // kufi, ghutra, turban, hijab, hood, none
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  dirhams: 0,
  wordsLearned: 0,
  streak: 0,
  lastPlayedDate: null,
  currentZone: 'oasis_village',
  unlockedZones: ['oasis_village'],
  inventory: [], // { itemId, equipped }
  position: { x: 640, y: 400 },
  boosts: [], // { type, expiresAt }
  openedChests: [], // array of chest IDs that have been opened
  readBooks: [], // array of bookshelf IDs that have been read
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setName(state, action) {
      state.name = action.payload;
    },

    setSkinTone(state, action) {
      state.skinTone = action.payload;
    },

    setOutfit(state, action) {
      state.outfit = action.payload;
    },

    setHeadCovering(state, action) {
      state.headCovering = action.payload;
    },

    addXP(state, action) {
      state.xp += action.payload;

      // Auto level-up: keep levelling while XP exceeds the threshold for next level
      let nextLevelThreshold = getXPForLevel(state.level + 1);
      while (state.xp >= nextLevelThreshold) {
        state.level += 1;
        nextLevelThreshold = getXPForLevel(state.level + 1);
      }

      // xpToNextLevel = how much total XP is needed for the next level
      state.xpToNextLevel = nextLevelThreshold;
    },

    addDirhams(state, action) {
      state.dirhams += action.payload;
    },

    spendDirhams(state, action) {
      state.dirhams = Math.max(0, state.dirhams - action.payload);
    },

    incrementWordsLearned(state) {
      state.wordsLearned += 1;
    },

    updateStreak(state) {
      const today = new Date().toDateString();
      if (state.lastPlayedDate === today) return;

      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (state.lastPlayedDate === yesterday) {
        state.streak += 1;
      } else {
        state.streak = 1;
      }
      state.lastPlayedDate = today;
    },

    setCurrentZone(state, action) {
      state.currentZone = action.payload;
    },

    unlockZone(state, action) {
      const zone = action.payload;
      if (!state.unlockedZones.includes(zone)) {
        state.unlockedZones.push(zone);
      }
    },

    addToInventory(state, action) {
      // payload: { itemId, equipped? }
      const item = action.payload;
      const existing = state.inventory.find((i) => i.itemId === item.itemId);
      if (!existing) {
        state.inventory.push({ itemId: item.itemId, equipped: item.equipped ?? false });
      }
    },

    equipItem(state, action) {
      // payload: itemId string
      const itemId = action.payload;
      const item = state.inventory.find((i) => i.itemId === itemId);
      if (item) {
        item.equipped = true;
      }
    },

    setPosition(state, action) {
      // payload: { x, y }
      state.position = action.payload;
    },

    addBoost(state, action) {
      // payload: { type, expiresAt }
      state.boosts.push(action.payload);
    },

    removeExpiredBoosts(state) {
      const now = Date.now();
      state.boosts = state.boosts.filter((b) => b.expiresAt > now);
    },

    markChestOpened(state, action) {
      const chestId = action.payload;
      if (!chestId || typeof chestId !== 'string') return;
      if (!state.openedChests) state.openedChests = [];
      if (!state.openedChests.includes(chestId)) {
        state.openedChests.push(chestId);
      }
    },

    markBookRead(state, action) {
      const bookId = action.payload;
      if (!bookId || typeof bookId !== 'string') return;
      if (!state.readBooks) state.readBooks = [];
      if (!state.readBooks.includes(bookId)) {
        state.readBooks.push(bookId);
      }
    },
  },
});

export const {
  setName,
  setSkinTone,
  setOutfit,
  setHeadCovering,
  addXP,
  addDirhams,
  spendDirhams,
  incrementWordsLearned,
  updateStreak,
  setCurrentZone,
  unlockZone,
  addToInventory,
  equipItem,
  setPosition,
  addBoost,
  removeExpiredBoosts,
  markChestOpened,
  markBookRead,
} = playerSlice.actions;

export default playerSlice.reducer;
