import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  shopInventories: {},     // { shopId: { items: [], lastRestock: timestamp } }
  hagglingHistory: [],     // [{ shopId, itemId, offered, accepted, timestamp }] — last 50
  priceModifiers: {},      // { shopId: multiplier } — reputation-based price adjustments
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

    recordPurchase(state, action) {
      // payload: { shopId, itemId, price, haggled }
      const { shopId, itemId, price, haggled } = action.payload;

      // Track for analytics (currently just logged, could expand to analytics slice)
      console.log(`[economySlice] Purchase: ${itemId} from ${shopId} for ${price} (haggled: ${haggled})`);
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
  },
});

export const {
  setShopInventory,
  recordHaggle,
  recordPurchase,
  setPriceModifier,
  clearShopCache,
} = economySlice.actions;

// ────────────────────────────────────────────────
// Selectors
// ────────────────────────────────────────────────

export const selectShopState = (shopId) => (state) => state.economy.shopInventories[shopId] || null;

export const selectHagglingHistory = (state) => state.economy.hagglingHistory;

export const selectPriceModifier = (shopId) => (state) => state.economy.priceModifiers[shopId] || 1.0;

export default economySlice.reducer;
