import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  shopInventories: {},     // { shopId: { items: [], lastRestock: timestamp } }
  hagglingHistory: [],     // [{ shopId, itemId, offered, accepted, timestamp }] — last 50
  priceModifiers: {},      // { shopId: multiplier } — reputation-based price adjustments
  supplyLevels: {},        // { [shopId]: { [itemId]: { current: number, max: number } } }
};

const economySlice = createSlice({
  name: 'economy',
  initialState,
  reducers: {
    setShopInventory(state, action) {
      // payload: { shopId, items }
      const { shopId, items } = action.payload;

      state.shopInventories[shopId] = {
        items,
        lastRestock: Date.now(),
      };
    },

    recordHaggle(state, action) {
      // payload: { shopId, itemId, offered, accepted, success }
      const { shopId, itemId, offered, accepted, success } = action.payload;

      state.hagglingHistory.push({
        shopId,
        itemId,
        offered,
        accepted,
        success,
        timestamp: Date.now(),
      });

      // Cap at 50 entries
      if (state.hagglingHistory.length > 50) {
        state.hagglingHistory.shift();
      }
    },

    recordPurchase(_state, _action) {
      // payload: { shopId, itemId, price, haggled }
      // Analytics tracking placeholder — expand to analytics slice in v10.0
    },

    setPriceModifier(state, action) {
      // payload: { shopId, modifier }
      const { shopId, modifier } = action.payload;

      state.priceModifiers[shopId] = modifier;
    },

    clearShopCache(state) {
      // Clear all cached inventories (trigger restock)
      state.shopInventories = {};
    },

    // ── ECON-01/02: Supply level management ──────────────────────────────────

    /**
     * initSupply — seed supply levels for a shop on first open (idempotent).
     * payload: { shopId: string, items: [{ itemId: string, max: number }] }
     * Already-initialized items are left untouched so purchases are preserved.
     */
    initSupply(state, action) {
      const { shopId, items } = action.payload;
      if (!state.supplyLevels[shopId]) {
        state.supplyLevels[shopId] = {};
      }
      for (const { itemId, max } of items) {
        if (state.supplyLevels[shopId][itemId] === undefined) {
          state.supplyLevels[shopId][itemId] = { current: max, max };
        }
      }
    },

    /**
     * decreaseSupply — reduce current supply for a single item after purchase.
     * payload: { shopId: string, itemId: string, amount: number }
     * Clamped to 0 — current never goes negative.
     */
    decreaseSupply(state, action) {
      const { shopId, itemId, amount } = action.payload;
      const entry = state.supplyLevels[shopId]?.[itemId];
      if (entry) {
        entry.current = Math.max(0, entry.current - amount);
      }
    },

    /**
     * restoreSupply — partially restore supply across all items in a shop after a rest.
     * payload: { shopId: string, restorePercent?: number }
     * Default restorePercent = 0.25 (25% of max restored per rest).
     */
    restoreSupply(state, action) {
      const { shopId, restorePercent = 0.25 } = action.payload;
      const shopSupply = state.supplyLevels[shopId];
      if (!shopSupply) return;
      for (const itemId of Object.keys(shopSupply)) {
        const entry = shopSupply[itemId];
        const restore = Math.ceil(entry.max * restorePercent);
        entry.current = Math.min(entry.max, entry.current + restore);
      }
    },
  },
});

export const {
  setShopInventory,
  recordHaggle,
  recordPurchase,
  setPriceModifier,
  clearShopCache,
  initSupply,
  decreaseSupply,
  restoreSupply,
} = economySlice.actions;

// ────────────────────────────────────────────────
// Selectors
// ────────────────────────────────────────────────

export const selectShopState = (shopId) => (state) => state.economy.shopInventories[shopId] || null;

export const selectHagglingHistory = (state) => state.economy.hagglingHistory;

export const selectPriceModifier = (shopId) => (state) => state.economy.priceModifiers[shopId] || 1.0;

/** ECON-01: Select supply levels for a specific shop. */
export const selectSupplyLevels = (shopId) => (state) => state.economy.supplyLevels[shopId] || {};

export default economySlice.reducer;
