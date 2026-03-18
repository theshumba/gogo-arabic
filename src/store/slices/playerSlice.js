import { createSlice, createSelector } from '@reduxjs/toolkit';
import { getXPForLevel } from '../../utils/xpCalculator.js';
import { getLevelReward } from '../../data/levelRewards.js';
import { getStreakReward } from '../../data/streakRewards.js';

const initialState = {
  name: '',
  skinTone: 0, // index 0-3
  outfit: 'simple-thobe', // outfit ID matching body spritesheet filename
  headCovering: 'kufi', // kufi, ghutra, turban, hijab, hood, none
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  dirhams: 0,
  currency: { fils: 0, dirhams: 0, dinars: 0 },
  wordsLearned: 0,
  streak: 0,
  lastPlayedDate: null,
  maxStreak: 0, // Highest streak ever achieved
  streakRewardsEarned: [], // Array of streak milestones already rewarded
  titles: [], // Array of earned titles
  currentTitle: null, // Currently equipped title
  currentZone: 'oasis_village',
  unlockedZones: ['oasis_village'],
  inventory: [], // { itemId, equipped }
  position: { x: 640, y: 400 },
  boosts: [], // { type, expiresAt }
  openedChests: [], // array of chest IDs that have been opened
  readBooks: [], // array of bookshelf IDs that have been read
  levelUpRewards: null, // Pending level-up reward to display
  streakRewardPending: null, // Pending streak reward to display
  onboardingComplete: false, // New players start the tutorial
  tutorialPhase: 'cinematic_intro', // New players see cinematic first, then awaiting_mentor
  mentorAvailable: true, // Guide Amira can be found for hints
  onboardingTargetNpc: null, // NPC ID to highlight during onboarding (e.g., 'guide-amira')
  learningPath: null, // null | 'scholar' | 'traveler' | 'historian' | 'polymath'
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
      const levelsGained = [];

      while (state.xp >= nextLevelThreshold) {
        state.level += 1;
        levelsGained.push(state.level);
        nextLevelThreshold = getXPForLevel(state.level + 1);
      }

      // xpToNextLevel = how much total XP is needed for the next level
      state.xpToNextLevel = nextLevelThreshold;

      // Award level-up rewards for the highest level gained
      if (levelsGained.length > 0) {
        const highestLevel = levelsGained[levelsGained.length - 1];
        const reward = getLevelReward(highestLevel);

        // Add dirhams reward
        state.dirhams += reward.dirhams;

        // Add title if provided
        if (reward.title && !state.titles.includes(reward.title)) {
          state.titles.push(reward.title);
        }

        // Store reward for modal display
        state.levelUpRewards = {
          level: highestLevel,
          dirhams: reward.dirhams,
          title: reward.title,
          message: reward.message,
        };
      }
    },

    addDirhams(state, action) {
      state.dirhams += action.payload;
    },

    spendDirhams(state, action) {
      state.dirhams = Math.max(0, state.dirhams - action.payload);
    },

    addCurrency(state, action) {
      const { fils = 0, dirhams = 0, dinars = 0 } = action.payload;
      if (!state.currency) state.currency = { fils: 0, dirhams: 0, dinars: 0 };
      state.currency.fils += fils;
      state.currency.dirhams += dirhams;
      state.currency.dinars += dinars;
      // Auto-convert: 100 fils → 1 dirham
      if (state.currency.fils >= 100) {
        const convert = Math.floor(state.currency.fils / 100);
        state.currency.dirhams += convert;
        state.currency.fils %= 100;
      }
      // Auto-convert: 100 dirhams → 1 dinar
      if (state.currency.dirhams >= 100) {
        const convert = Math.floor(state.currency.dirhams / 100);
        state.currency.dinars += convert;
        state.currency.dirhams %= 100;
      }
    },

    spendCurrency(state, action) {
      const totalFils = action.payload.totalFils || 0;
      if (!state.currency) return;
      let pool = state.currency.dinars * 10000 + state.currency.dirhams * 100 + state.currency.fils;
      if (pool < totalFils) return;
      pool -= totalFils;
      state.currency.dinars = Math.floor(pool / 10000);
      pool %= 10000;
      state.currency.dirhams = Math.floor(pool / 100);
      state.currency.fils = pool % 100;
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

      // Update max streak
      if (state.streak > state.maxStreak) {
        state.maxStreak = state.streak;
      }

      // Check for streak milestone rewards
      const streakReward = getStreakReward(state.streak);
      if (streakReward && !state.streakRewardsEarned.includes(state.streak)) {
        // Mark this streak milestone as earned
        state.streakRewardsEarned.push(state.streak);

        // Award XP bonus (will be added via middleware)
        // Award dirhams
        state.dirhams += streakReward.dirhams;

        // Award title if provided
        if (streakReward.title && !state.titles.includes(streakReward.title)) {
          state.titles.push(streakReward.title);
        }

        // Store reward for toast display
        state.streakRewardPending = {
          days: streakReward.days,
          xp: streakReward.xp,
          dirhams: streakReward.dirhams,
          title: streakReward.title,
          message: streakReward.message,
        };
      }
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

    dismissLevelUpReward(state) {
      state.levelUpRewards = null;
    },

    dismissStreakReward(state) {
      state.streakRewardPending = null;
    },

    setCurrentTitle(state, action) {
      // payload: title string or null
      const title = action.payload;
      if (title === null || state.titles.includes(title)) {
        state.currentTitle = title;
      }
    },

    addTitle(state, action) {
      // payload: title string
      const title = action.payload;
      if (title && !state.titles.includes(title)) {
        state.titles.push(title);
      }
    },

    completeOnboarding(state) {
      state.onboardingComplete = true;
    },

    setTutorialPhase(state, action) {
      const validPhases = [
        'cinematic_intro', 'path_choice', 'awaiting_mentor',
        'met_mentor', 'learned_word', 'first_words_quest',
        'met_yusuf', 'complete',
      ];
      if (validPhases.includes(action.payload)) {
        state.tutorialPhase = action.payload;
        if (action.payload === 'complete') {
          state.onboardingComplete = true;
        }
      }
    },

    setLearningPath(state, action) {
      const validPaths = ['scholar', 'traveler', 'historian', 'polymath'];
      if (validPaths.includes(action.payload)) {
        state.learningPath = action.payload;
      }
    },

    setOnboardingTargetNpc(state, action) {
      state.onboardingTargetNpc = action.payload;
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
  addCurrency,
  spendCurrency,
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
  dismissLevelUpReward,
  dismissStreakReward,
  setCurrentTitle,
  addTitle,
  completeOnboarding,
  setTutorialPhase,
  setLearningPath,
  setOnboardingTargetNpc,
} = playerSlice.actions;

// ========== MEMOIZED SELECTORS ==========

// Select player stats (returns a stable object reference)
export const selectPlayerStats = createSelector(
  [(state) => state.player],
  (player) => ({
    level: player.level,
    xp: player.xp,
    xpToNextLevel: player.xpToNextLevel,
    streak: player.streak,
    dirhams: player.dirhams,
    wordsLearned: player.wordsLearned,
  })
);

// Select player inventory
export const selectInventory = (state) => state.player.inventory;

// Select inventory item IDs only (memoized array)
export const selectInventoryIds = createSelector(
  [selectInventory],
  (inventory) => inventory.map((item) => item.itemId || item)
);

// Select player appearance
export const selectPlayerAppearance = createSelector(
  [(state) => state.player],
  (player) => ({
    skinTone: player.skinTone,
    outfit: player.outfit,
    headCovering: player.headCovering,
  })
);

// Select unlocked zones
export const selectUnlockedZones = (state) => state.player.unlockedZones;

// Select current zone
export const selectCurrentZone = (state) => state.player.currentZone;

// Select titles
export const selectTitles = (state) => state.player.titles;
export const selectCurrentTitle = (state) => state.player.currentTitle;

// Select pending rewards
export const selectLevelUpReward = (state) => state.player.levelUpRewards;
export const selectStreakReward = (state) => state.player.streakRewardPending;

// Select streak info
export const selectStreakInfo = createSelector(
  [(state) => state.player],
  (player) => ({
    current: player.streak,
    max: player.maxStreak,
    lastPlayed: player.lastPlayedDate,
  })
);

// Select onboarding state
export const selectOnboardingState = createSelector(
  [(state) => state.player],
  (player) => ({
    tutorialPhase: player.tutorialPhase,
    complete: player.onboardingComplete,
    targetNpc: player.onboardingTargetNpc,
    mentorAvailable: player.mentorAvailable,
  })
);

export const selectCurrency = (state) => state.player?.currency || { fils: 0, dirhams: 0, dinars: 0 };
export const selectTotalFils = (state) => {
  const c = state.player?.currency || { fils: 0, dirhams: 0, dinars: 0 };
  return c.dinars * 10000 + c.dirhams * 100 + c.fils;
};

export default playerSlice.reducer;
