/**
 * craftingSlice.js — Crafting and profession state management for Phase 31
 *
 * Manages 6 professions with levels, XP, unlocked recipes, and gathered resources.
 * Follows patterns from magicSlice.js (XP/leveling) and inventorySlice.js (item stacking).
 */

import { createSlice, createSelector } from '@reduxjs/toolkit';
import { RECIPES } from '../../data/recipes.js';
import { PROFESSIONS } from '../../data/professions.js';

const initialState = {
  professions: {},           // { [professionId]: { level, xp, recipesUnlocked: [], craftCount } }
  resources: [],             // [{ resourceId, quantity, quality }]
  discoveredRecipes: [],     // [recipeIds] found via exploration/NPC
  gatheringCooldowns: {},    // { [spotId]: lastGatheredTimestamp }
};

const craftingSlice = createSlice({
  name: 'crafting',
  initialState,
  reducers: {
    learnProfession(state, action) {
      // payload: { professionId }
      const { professionId } = action.payload;

      // Validate profession exists
      if (!PROFESSIONS[professionId]) {
        console.error(`[craftingSlice] Invalid profession '${professionId}'`);
        return;
      }

      // Skip if already learned
      if (state.professions[professionId]) {
        return;
      }

      // Initialize profession at level 0
      state.professions[professionId] = {
        level: 0,
        xp: 0,
        recipesUnlocked: [],
        craftCount: 0,
      };
    },

    addProfessionXP(state, action) {
      // payload: { professionId, xp }
      const { professionId, xp } = action.payload;

      if (!state.professions[professionId]) {
        console.error(`[craftingSlice] Cannot add XP to unknown profession '${professionId}'`);
        return;
      }

      const profession = state.professions[professionId];
      const professionData = PROFESSIONS[professionId];

      // Add XP
      profession.xp += xp;

      // Auto-level if threshold reached (100 XP × level)
      const xpPerLevel = professionData.xpPerLevel || 100;
      const newLevel = Math.floor(profession.xp / xpPerLevel);

      if (newLevel > profession.level && newLevel <= professionData.maxLevel) {
        profession.level = newLevel;
      }
    },

    levelUpProfession(state, action) {
      // payload: { professionId }
      const { professionId } = action.payload;

      if (!state.professions[professionId]) {
        console.error(`[craftingSlice] Cannot level up unknown profession '${professionId}'`);
        return;
      }

      const profession = state.professions[professionId];
      const professionData = PROFESSIONS[professionId];

      // Increment level (max 10)
      if (profession.level < professionData.maxLevel) {
        profession.level += 1;

        // Reset XP overflow
        const xpPerLevel = professionData.xpPerLevel || 100;
        profession.xp = profession.xp % xpPerLevel;
      }
    },

    unlockRecipe(state, action) {
      // payload: { recipeId, professionId }
      const { recipeId, professionId } = action.payload;

      // Validate recipe exists
      const recipe = RECIPES[recipeId];
      if (!recipe) {
        console.error(`[craftingSlice] Invalid recipe '${recipeId}'`);
        return;
      }

      // Validate profession learned
      if (!state.professions[professionId]) {
        console.error(`[craftingSlice] Cannot unlock recipe for unknown profession '${professionId}'`);
        return;
      }

      const profession = state.professions[professionId];

      // Check min level requirement
      if (profession.level < recipe.minLevel) {
        console.warn(`[craftingSlice] Profession level ${profession.level} too low for recipe '${recipeId}' (requires ${recipe.minLevel})`);
        return;
      }

      // Add to profession's unlocked recipes (avoid duplicates)
      if (!profession.recipesUnlocked.includes(recipeId)) {
        profession.recipesUnlocked.push(recipeId);
      }

      // Add to global discovered recipes (avoid duplicates)
      if (!state.discoveredRecipes.includes(recipeId)) {
        state.discoveredRecipes.push(recipeId);
      }
    },

    addResource(state, action) {
      // payload: { resourceId, quantity, quality = 'common' }
      const { resourceId, quantity, quality = 'common' } = action.payload;

      // Find existing resource with same ID and quality
      const existingResource = state.resources.find(
        r => r.resourceId === resourceId && r.quality === quality
      );

      if (existingResource) {
        // Stack resources (cap at 999 per type+quality)
        existingResource.quantity = Math.min(existingResource.quantity + quantity, 999);
      } else {
        // Add new resource entry
        state.resources.push({
          resourceId,
          quantity: Math.min(quantity, 999),
          quality,
        });
      }
    },

    removeResource(state, action) {
      // payload: { resourceId, quantity, quality = 'common' }
      const { resourceId, quantity, quality = 'common' } = action.payload;

      // Find resource
      const existingResource = state.resources.find(
        r => r.resourceId === resourceId && r.quality === quality
      );

      if (!existingResource) {
        console.warn(`[craftingSlice] Cannot remove non-existent resource '${resourceId}' (${quality})`);
        return;
      }

      // Subtract quantity
      existingResource.quantity -= quantity;

      // Remove from array if quantity reaches 0
      if (existingResource.quantity <= 0) {
        state.resources = state.resources.filter(
          r => !(r.resourceId === resourceId && r.quality === quality)
        );
      }
    },

    craftItem(state, action) {
      // payload: { recipeId, quality = 'common' }
      const { recipeId } = action.payload;

      // Validate recipe exists
      const recipe = RECIPES[recipeId];
      if (!recipe) {
        console.error(`[craftingSlice] Cannot craft unknown recipe '${recipeId}'`);
        return;
      }

      // Increment craft count for profession
      const profession = state.professions[recipe.professionId];
      if (profession) {
        profession.craftCount += 1;
      }

      // Note: XP gain, ingredient removal, and result item addition handled by caller
      // This reducer just tracks the craft count for statistics
    },

    recordGatheringCooldown(state, action) {
      // payload: { spotId, timestamp }
      const { spotId, timestamp } = action.payload;

      state.gatheringCooldowns[spotId] = timestamp;
    },

    resetProfession(state, action) {
      // payload: { professionId }
      const { professionId } = action.payload;

      if (state.professions[professionId]) {
        delete state.professions[professionId];
      }
    },
  },
});

// ────────────────────────────────────────────────
// SELECTORS
// ────────────────────────────────────────────────

/**
 * Basic selectors
 */
export const selectProfessions = (state) => state.crafting.professions;
export const selectResources = (state) => state.crafting.resources;
export const selectDiscoveredRecipes = (state) => state.crafting.discoveredRecipes;
export const selectGatheringCooldowns = (state) => state.crafting.gatheringCooldowns;

/**
 * Memoized selector: Get profession by key
 */
export const selectProfessionByKey = createSelector(
  [selectProfessions, (state, professionId) => professionId],
  (professions, professionId) => professions[professionId] || null
);

/**
 * Memoized selector: Get profession level
 */
export const selectProfessionLevel = createSelector(
  [selectProfessions, (state, professionId) => professionId],
  (professions, professionId) => {
    const profession = professions[professionId];
    return profession ? profession.level : 0;
  }
);

/**
 * Memoized selector: Get resource quantity by ID and quality
 */
export const selectResourceQuantity = createSelector(
  [selectResources, (state, resourceId, quality = 'common') => ({ resourceId, quality })],
  (resources, { resourceId, quality }) => {
    const resource = resources.find(
      r => r.resourceId === resourceId && r.quality === quality
    );
    return resource ? resource.quantity : 0;
  }
);

/**
 * Memoized selector: Get all unlocked recipes for a profession
 */
export const selectRecipesForProfession = createSelector(
  [selectProfessions, (state, professionId) => professionId],
  (professions, professionId) => {
    const profession = professions[professionId];
    return profession ? profession.recipesUnlocked : [];
  }
);

/**
 * Memoized selector: Get all learned profession IDs
 */
export const selectLearnedProfessions = createSelector(
  [selectProfessions],
  (professions) => Object.keys(professions)
);

/**
 * Memoized selector: Check if gathering spot is on cooldown
 */
export const selectIsGatheringSpotOnCooldown = createSelector(
  [selectGatheringCooldowns, (state, spotId, cooldownDuration) => ({ spotId, cooldownDuration })],
  (cooldowns, { spotId, cooldownDuration }) => {
    const lastGathered = cooldowns[spotId];
    if (!lastGathered) return false;

    const now = Date.now();
    const timeSince = now - lastGathered;
    return timeSince < cooldownDuration;
  }
);

/**
 * Memoized selector: Get all resources grouped by resourceId (sum all qualities)
 */
export const selectResourcesSummed = createSelector(
  [selectResources],
  (resources) => {
    const summed = {};
    resources.forEach(r => {
      if (!summed[r.resourceId]) {
        summed[r.resourceId] = 0;
      }
      summed[r.resourceId] += r.quantity;
    });
    return summed;
  }
);

// ────────────────────────────────────────────────
// EXPORTS
// ────────────────────────────────────────────────

export const {
  learnProfession,
  addProfessionXP,
  levelUpProfession,
  unlockRecipe,
  addResource,
  removeResource,
  craftItem,
  recordGatheringCooldown,
  resetProfession,
} = craftingSlice.actions;

export default craftingSlice.reducer;
