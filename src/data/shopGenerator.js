/**
 * shopGenerator.js — Dynamic shop inventory generator (Phase 29)
 *
 * Generates shop inventory based on:
 * - Player level (filters items by minLevel)
 * - Faction reputation (unlocks reputation items at 50+)
 * - Quest completion (unlocks quest-specific items)
 * - Price modifiers from economySlice
 */

import { SHOP_BASE_ITEMS, SHOP_REPUTATION_ITEMS, SHOP_QUEST_ITEMS } from './shops.js';
import { EQUIPMENT_DATA } from './equipment.js';

/**
 * Generate shop inventory based on game state
 * @param {string} shopId - The shop identifier (e.g., 'oasis_village_shop')
 * @param {Object} gameState - Full Redux state
 * @returns {Array} Array of { itemId, price, available, unlockReason } objects
 */
export function getShopInventory(shopId, gameState) {
  const inventory = [];

  // Extract relevant state
  const playerLevel = gameState.player?.level || 1;
  const completedQuests = gameState.quests?.completed || [];
  const factionReputation = gameState.faction?.alignment || {};
  const priceModifiers = gameState.economy?.priceModifiers || {};

  // Get price modifier for this shop (default 1.0)
  const priceModifier = priceModifiers[shopId] || 1.0;

  // 1. Add base items filtered by player level
  const baseItems = SHOP_BASE_ITEMS[shopId] || [];
  for (const shopItem of baseItems) {
    if (playerLevel >= shopItem.minLevel) {
      const itemData = EQUIPMENT_DATA[shopItem.itemId];
      if (itemData) {
        inventory.push({
          itemId: shopItem.itemId,
          price: Math.round(itemData.sellPrice * 2 * priceModifier), // Buy price is 2x sell price
          available: true,
          unlockReason: 'base',
        });
      }
    }
  }

  // 2. Add reputation items if player has sufficient reputation
  const reputationItems = SHOP_REPUTATION_ITEMS[shopId] || [];
  const shopFaction = getShopFaction(shopId);
  const reputation = factionReputation[shopFaction] || 0;

  // Apply 15% faction discount at Allied (75+) tier
  const factionDiscount = reputation >= 75 ? 0.85 : 1.0;

  for (const shopItem of reputationItems) {
    if (reputation >= 75 && playerLevel >= shopItem.minLevel) {
      const itemData = EQUIPMENT_DATA[shopItem.itemId];
      if (itemData) {
        inventory.push({
          itemId: shopItem.itemId,
          price: Math.round(itemData.sellPrice * 2 * priceModifier * factionDiscount),
          available: true,
          unlockReason: 'reputation',
        });
      }
    }
  }

  // 3. Add quest items if player has completed the required quests
  const questItems = SHOP_QUEST_ITEMS[shopId] || [];
  for (const shopItem of questItems) {
    if (completedQuests.includes(shopItem.questId) && playerLevel >= shopItem.minLevel) {
      const itemData = EQUIPMENT_DATA[shopItem.itemId];
      if (itemData) {
        inventory.push({
          itemId: shopItem.itemId,
          price: Math.round(itemData.sellPrice * 2 * priceModifier),
          available: true,
          unlockReason: 'quest',
        });
      }
    }
  }

  return inventory;
}

/**
 * Map shop IDs to faction names for reputation checks
 * @param {string} shopId - Shop identifier
 * @returns {string} Faction name
 */
function getShopFaction(shopId) {
  const factionMap = {
    sacred_library_shop: 'scholars',
    desert_market_shop: 'merchants',
    royal_palace_shop: 'guardians',
    warriors_guild_shop: 'guardians',
    explorers_outpost_shop: 'travelers',
    healers_temple_shop: 'scholars',
    mystic_bazaar_shop: 'artists',
    oasis_village_shop: 'merchants',
    artisan_workshop_shop: 'artisans',
  };
  return factionMap[shopId] || null;
}
