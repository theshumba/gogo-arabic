import { createSlice, createSelector } from '@reduxjs/toolkit';
import { EQUIPMENT_DATA } from '../../data/equipment.js';
import { calculateTotalEquipmentStats } from '../../utils/itemStats.js';

const initialState = {
  equipped: {
    headCovering: null,
    robe: null,
    cloak: null,
    belt: null,
    boots: null,
    gloves: null,
    accessory1: null,
    accessory2: null,
  },
  items: [],           // [{ itemId: string, quantity: number, locked: boolean }] — max 200
  affixesUnlocked: [], // wordIds the player has discovered via equipment
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    addItem(state, action) {
      // payload: { itemId, quantity = 1 }
      const { itemId, quantity = 1 } = action.payload;

      // Cap at 200 items
      if (state.items.length >= 200) {
        console.warn('[inventorySlice] Inventory full (200 items)');
        return;
      }

      // Check if item already exists
      const existingItem = state.items.find(item => item.itemId === itemId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ itemId, quantity, locked: false });
      }
    },

    removeItem(state, action) {
      // payload: { itemId, quantity = 1 }
      const { itemId, quantity = 1 } = action.payload;

      const existingItem = state.items.find(item => item.itemId === itemId);
      if (!existingItem) {
        console.warn(`[inventorySlice] Cannot remove non-existent item '${itemId}'`);
        return;
      }

      existingItem.quantity -= quantity;

      // Remove from array if quantity reaches 0
      if (existingItem.quantity <= 0) {
        state.items = state.items.filter(item => item.itemId !== itemId);
      }
    },

    equipItem(state, action) {
      // payload: { slot, itemId }
      const { slot, itemId } = action.payload;

      // Validate slot exists
      if (!Object.prototype.hasOwnProperty.call(state.equipped, slot)) {
        console.error(`[inventorySlice] Invalid equipment slot '${slot}'`);
        return;
      }

      // Look up item to verify it's valid equipment
      const itemData = EQUIPMENT_DATA[itemId];
      if (!itemData) {
        console.error(`[inventorySlice] Cannot equip non-existent item '${itemId}'`);
        return;
      }

      // Verify item matches slot
      if (itemData.slot !== slot) {
        console.error(`[inventorySlice] Item '${itemId}' cannot be equipped in slot '${slot}' (requires ${itemData.slot})`);
        return;
      }

      // If slot already has an item, unequip it first
      if (state.equipped[slot]) {
        const previousItemId = state.equipped[slot];
        const existingInventoryItem = state.items.find(item => item.itemId === previousItemId);
        if (existingInventoryItem) {
          existingInventoryItem.quantity += 1;
        } else {
          state.items.push({ itemId: previousItemId, quantity: 1, locked: false });
        }
      }

      // Equip new item
      state.equipped[slot] = itemId;

      // Remove from inventory
      const inventoryItem = state.items.find(item => item.itemId === itemId);
      if (inventoryItem) {
        inventoryItem.quantity -= 1;
        if (inventoryItem.quantity <= 0) {
          state.items = state.items.filter(item => item.itemId !== itemId);
        }
      }
    },

    unequipItem(state, action) {
      // payload: { slot }
      const { slot } = action.payload;

      // Validate slot exists
      if (!Object.prototype.hasOwnProperty.call(state.equipped, slot)) {
        console.error(`[inventorySlice] Invalid equipment slot '${slot}'`);
        return;
      }

      const itemId = state.equipped[slot];
      if (!itemId) {
        console.warn(`[inventorySlice] Slot '${slot}' is already empty`);
        return;
      }

      // Return item to inventory
      const existingItem = state.items.find(item => item.itemId === itemId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ itemId, quantity: 1, locked: false });
      }

      // Clear slot
      state.equipped[slot] = null;
    },

    unlockAffix(state, action) {
      // payload: wordId
      const wordId = action.payload;

      if (!state.affixesUnlocked.includes(wordId)) {
        state.affixesUnlocked.push(wordId);
      }
    },

    sortInventory(state, action) {
      // payload: { sortBy: 'type' | 'rarity' | 'arabic' }
      const { sortBy } = action.payload;

      if (sortBy === 'type') {
        // Sort by slot type
        state.items.sort((a, b) => {
          const slotA = EQUIPMENT_DATA[a.itemId]?.slot || '';
          const slotB = EQUIPMENT_DATA[b.itemId]?.slot || '';
          return slotA.localeCompare(slotB);
        });
      } else if (sortBy === 'rarity') {
        // Sort by rarity level (common=1, legendary=5)
        const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
        state.items.sort((a, b) => {
          const rarityA = rarityOrder[EQUIPMENT_DATA[a.itemId]?.rarity] || 0;
          const rarityB = rarityOrder[EQUIPMENT_DATA[b.itemId]?.rarity] || 0;
          return rarityB - rarityA; // Descending
        });
      } else if (sortBy === 'arabic') {
        // Sort by Arabic name (hijā'ī order approximation using localeCompare)
        state.items.sort((a, b) => {
          const nameA = EQUIPMENT_DATA[a.itemId]?.nameArabic || '';
          const nameB = EQUIPMENT_DATA[b.itemId]?.nameArabic || '';
          return nameA.localeCompare(nameB, 'ar');
        });
      }
    },

    lockItem(state, action) {
      // payload: itemId
      const itemId = action.payload;
      const item = state.items.find(i => i.itemId === itemId);
      if (item) {
        item.locked = true;
      }
    },

    unlockItem(state, action) {
      // payload: itemId
      const itemId = action.payload;
      const item = state.items.find(i => i.itemId === itemId);
      if (item) {
        item.locked = false;
      }
    },

    clearInventory(state) {
      // Reset to initial state (for testing/reset)
      Object.assign(state, initialState);
    },
  },
});

export const {
  addItem,
  removeItem,
  equipItem,
  unequipItem,
  unlockAffix,
  sortInventory,
  lockItem,
  unlockItem,
  clearInventory,
} = inventorySlice.actions;

// ────────────────────────────────────────────────
// Selectors
// ────────────────────────────────────────────────

export const selectEquippedItems = (state) => state.inventory.equipped;

export const selectInventoryItems = (state) => state.inventory.items;

export const selectAffixesUnlocked = (state) => state.inventory.affixesUnlocked;

export const selectInventoryCount = (state) => state.inventory.items.length;

export const selectIsInventoryFull = (state) => state.inventory.items.length >= 200;

/**
 * Compute total equipment stats including affixes and set bonuses
 * Requires access to vocabularySlice for affix multiplier calculation
 */
export const selectEquipmentStats = createSelector(
  [selectEquippedItems, (state) => state.vocabulary],
  (equipped, vocabularyState) => {
    return calculateTotalEquipmentStats(equipped, vocabularyState);
  }
);

export default inventorySlice.reducer;
