import { adjustFriendship } from '../slices/npcSlice.js';
import questsData from '../../data/quests.json';

// Friendship deltas by event type
const FRIENDSHIP_DELTAS = {
  correctAnswer: 2,      // Answered quiz correctly during NPC interaction
  gift: 5,               // Gave a gift to NPC
  questComplete: 10,     // Completed a quest for this NPC
  ignored: -1,           // Walked away during dialogue (future)
  wrongAnswer: -1,       // Wrong quiz answer during NPC interaction
};

// Build quick lookup: questId -> npcGiver (canonical owner of the quest).
// Quests in data/quests.json use the `npcGiver` field as the NPC associated
// with the quest. Friendship boosts on completion target that NPC.
const QUEST_NPC_LOOKUP = Array.isArray(questsData)
  ? questsData.reduce((acc, q) => {
      if (q && q.id && q.npcGiver) acc[q.id] = q.npcGiver;
      return acc;
    }, {})
  : {};

export const friendshipMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // Listen to quest completion.
  // questSlice.completeQuest payload is the questId STRING (not an object).
  // Map questId -> npcGiver via data/quests.json lookup.
  if (action.type === 'quests/completeQuest') {
    const questId = typeof action.payload === 'string'
      ? action.payload
      : action.payload?.questId;
    const npcId = questId ? QUEST_NPC_LOOKUP[questId] : null;
    if (npcId) {
      store.dispatch(adjustFriendship({ npcId, delta: FRIENDSHIP_DELTAS.questComplete, reason: 'questComplete' }));
    }
  }

  // Listen to gift giving.
  // npcSlice exports `giveNpcGift` -> action type 'npc/giveNpcGift'.
  // Note: npcSlice.giveNpcGift already applies a `relationshipDelta` from the
  // payload (gift table). This middleware adds the small flat "gift" friendship
  // delta as a generic kindness bonus on top, matching FRIENDSHIP_DELTAS table.
  if (action.type === 'npc/giveNpcGift') {
    const { npcId } = action.payload || {};
    if (npcId) {
      store.dispatch(adjustFriendship({ npcId, delta: FRIENDSHIP_DELTAS.gift, reason: 'gift' }));
    }
  }

  return result;
};
