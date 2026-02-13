/**
 * Crafting Logic - Pure business logic functions for crafting system
 * Phase 31 Plan 02 - TDD implementation
 *
 * Functions that need RECIPES/RESOURCES accept them as parameters for testability
 */

/**
 * Calculate craft quality tier based on mini-game accuracy
 * @param {number} accuracy - Accuracy score (0-1)
 * @returns {string} Quality tier: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
 */
export function calculateCraftQuality(accuracy) {
  // TODO: Implement quality calculation
  return 'common';
}

/**
 * Calculate XP gain with accuracy-based multiplier
 * @param {number} baseXP - Base XP from recipe
 * @param {number} accuracy - Accuracy score (0-1)
 * @returns {number} Final XP (integer)
 */
export function calculateXPGain(baseXP, accuracy) {
  // TODO: Implement XP calculation
  return 0;
}

/**
 * Check if player can use ingredient (vocabulary-gated)
 * @param {string} resourceId - Resource ID to check
 * @param {object} fsrsCards - FSRS cards object
 * @param {object} RESOURCES - Resources data object (injected for testing)
 * @returns {boolean} True if resource unlocked and word reviewed
 */
export function canUseIngredient(resourceId, fsrsCards, RESOURCES = null) {
  // TODO: Implement vocabulary gating
  return false;
}

/**
 * Get displayable ingredients with vocabulary gating
 * @param {string} recipeId - Recipe ID
 * @param {object} fsrsCards - FSRS cards object
 * @param {object} RECIPES - Recipes data object (injected for testing)
 * @param {object} RESOURCES - Resources data object (injected for testing)
 * @returns {array} Array of { resourceId, quantity, canUse, displayName, hint }
 */
export function getDisplayableIngredients(recipeId, fsrsCards, RECIPES = null, RESOURCES = null) {
  // TODO: Implement ingredient display logic
  return [];
}

/**
 * Check if player has required resources for recipe
 * @param {string} recipeId - Recipe ID
 * @param {array} resources - Player's resource inventory
 * @param {object} RECIPES - Recipes data object (injected for testing)
 * @returns {object} { canCraft: boolean, missing: array }
 */
export function hasRequiredResources(recipeId, resources, RECIPES = null) {
  // TODO: Implement resource sufficiency check
  return { canCraft: false, missing: [] };
}

/**
 * Calculate profession XP progress
 * @param {number} currentXP - Current XP amount
 * @param {number} currentLevel - Current profession level
 * @returns {object} { current, required, percent }
 */
export function calculateProfessionXP(currentXP, currentLevel) {
  // TODO: Implement XP progress calculation
  return { current: 0, required: 0, percent: 0 };
}

/**
 * Calculate gathering quality based on profession level
 * @param {number} professionLevel - Current profession level (0-10)
 * @param {number} roll - Random roll value (0-1), uses Math.random() if not provided
 * @returns {string} Quality tier: 'normal' | 'high' | 'pristine' | 'perfect'
 */
export function calculateGatheringQuality(professionLevel, roll) {
  // TODO: Implement gathering quality distribution
  return 'normal';
}
