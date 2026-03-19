/**
 * World State Middleware
 *
 * Listens to Redux actions and auto-sets world state flags/counters.
 * Follows the same pattern as achievementMiddleware.js and friendshipMiddleware.js.
 *
 * Action types handled:
 * - quests/completeQuest → sets quest completion flag
 * - npc/teachWord → sets NPC met flag, increments NPC words taught counter
 * - economy/recordPurchase → increments shop purchase counter
 * - npc/adjustFriendship → sets NPC met flag (proxy for meaningful interaction)
 */

import { setFlag, incrementCounter } from '../slices/worldStateSlice.js';
import { questCompleteKey, npcMetKey, shopPurchasesKey } from '../../data/worldStateKeys.js';

export const worldStateMiddleware = (store) => (next) => (action) => {
  // Guard: never intercept redux-persist internal actions
  if (action.type.startsWith('persist/')) return next(action);

  // Pass action through first (middleware reads state AFTER reduction)
  const result = next(action);

  // Quest completion → set flag
  if (action.type === 'quests/completeQuest') {
    const questId = typeof action.payload === 'string' ? action.payload : action.payload?.questId;
    if (questId) {
      const flagKey = questCompleteKey(questId);
      store.dispatch(setFlag({ key: flagKey, value: true }));
    }
  }

  // NPC taught a word → set NPC met flag + increment words taught counter
  if (action.type === 'npc/teachWord') {
    const { npcId } = action.payload || {};
    if (npcId) {
      const metKey = npcMetKey(npcId);
      store.dispatch(setFlag({ key: metKey, value: true }));

      // Increment words taught counter for this NPC
      const wordsKey = `npc_${npcId.replace(/-/g, '_')}_words_taught`;
      store.dispatch(incrementCounter({ key: wordsKey, amount: 1 }));
    }
  }

  // Purchase recorded → increment shop purchase counter
  if (action.type === 'economy/recordPurchase') {
    const { shopId } = action.payload || {};
    if (shopId) {
      const purchaseKey = shopPurchasesKey(shopId);
      store.dispatch(incrementCounter({ key: purchaseKey, amount: 1 }));
    }
  }

  // NPC friendship adjustment → set NPC met flag (any friendship change = met)
  if (action.type === 'npc/adjustFriendship') {
    const { npcId } = action.payload || {};
    if (npcId) {
      const metKey = npcMetKey(npcId);
      store.dispatch(setFlag({ key: metKey, value: true }));
    }
  }

  return result;
};
