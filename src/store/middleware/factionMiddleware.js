/**
 * factionMiddleware.js — Auto-adjusts faction scores on game events
 *
 * Listens for quest completion, purchases, and dialogue choices.
 * Dispatches adjustAlignment to the factionSlice.
 * Follows achievementMiddleware.js pattern (pass-through first, then react).
 */

import { adjustAlignment } from '../slices/factionSlice.js';
import { FACTION_IDS, NPC_FACTION_MAP } from '../../data/factions.js';

// Point values for each game event type
const FACTION_POINTS = {
  QUEST_COMPLETE: 10,
  PURCHASE: 5,
  DIALOGUE_CHOICE: 3,
  NPC_INTERACTION: 2,
};

// Quest ID prefix → faction mapping (quests starting with these prefixes grant faction points)
const QUEST_FACTION_MAP = {
  scholars_: FACTION_IDS.SCHOLARS,
  merchants_: FACTION_IDS.MERCHANTS,
  artisans_: FACTION_IDS.ARTISANS,
  travelers_: FACTION_IDS.TRAVELERS,
  guardians_: FACTION_IDS.GUARDIANS,
  artists_: FACTION_IDS.ARTISTS,
  library_: FACTION_IDS.SCHOLARS,
  market_: FACTION_IDS.MERCHANTS,
  craft_: FACTION_IDS.ARTISANS,
  explore_: FACTION_IDS.TRAVELERS,
  guard_: FACTION_IDS.GUARDIANS,
  poetry_: FACTION_IDS.ARTISTS,
};

// Re-entrancy guard (same pattern as achievementMiddleware)
let _isProcessingFaction = false;

/**
 * Determine which faction a quest belongs to based on its ID prefix.
 * Returns null if no faction match.
 */
function getQuestFaction(questId) {
  if (!questId) return null;
  for (const [prefix, factionId] of Object.entries(QUEST_FACTION_MAP)) {
    if (questId.startsWith(prefix)) return factionId;
  }
  return null;
}

export const factionMiddleware = (store) => (next) => (action) => {
  // Never intercept redux-persist internal actions
  if (action.type?.startsWith('persist/')) return next(action);

  const result = next(action);

  // Prevent re-entrant dispatch cascade
  if (_isProcessingFaction) return result;
  _isProcessingFaction = true;

  try {
    // Auto-fire faction points from quest completion
    if (action.type === 'quests/completeQuest') {
      const questId = action.payload?.questId || action.payload;
      const factionId = getQuestFaction(questId);
      if (factionId) {
        store.dispatch(adjustAlignment({
          factionId,
          amount: FACTION_POINTS.QUEST_COMPLETE,
        }));
      }
    }

    // Auto-fire faction points from shop purchases
    if (action.type === 'economy/recordPurchase') {
      const shopFaction = action.payload?.factionId;
      if (shopFaction && Object.values(FACTION_IDS).includes(shopFaction)) {
        store.dispatch(adjustAlignment({
          factionId: shopFaction,
          amount: FACTION_POINTS.PURCHASE,
        }));
      }
    }

    // Auto-fire faction points from dialogue choices
    if (action.type === 'narrative/recordDialogueChoice') {
      const factionId = action.payload?.factionId;
      const amount = action.payload?.factionAmount ?? FACTION_POINTS.DIALOGUE_CHOICE;
      if (factionId && Object.values(FACTION_IDS).includes(factionId)) {
        store.dispatch(adjustAlignment({
          factionId,
          amount,
        }));
      }
    }

    // Auto-fire faction points from NPC interactions (friendship increase)
    if (action.type === 'npc/updateFriendship') {
      const npcId = action.payload?.npcId;
      const factionId = NPC_FACTION_MAP[npcId];
      if (factionId) {
        store.dispatch(adjustAlignment({
          factionId,
          amount: FACTION_POINTS.NPC_INTERACTION,
        }));
      }
    }
  } finally {
    _isProcessingFaction = false;
  }

  return result;
};
