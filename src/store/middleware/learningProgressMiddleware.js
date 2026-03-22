/**
 * learningProgressMiddleware.js
 *
 * Wires learning events to skill tree XP.
 * Populated in Phase 57 with 6 XP routing rules.
 *
 * Kept separate from achievementMiddleware to avoid switch/case bloat.
 *
 * XP routing table:
 *   grammar/completeLesson         → grammar tree   +40 XP
 *   quests/completeQuest           → culture tree   +30 XP
 *   achievements/recordPerfectQuiz → reading tree   +20 XP
 *   achievements/incrementReviews  → reading tree   +10 XP
 *   alphabet/completeGroup         → writing tree   +25 XP
 *   poetry/endPoetryBattle (won)   → speaking tree  +30 XP
 *                                  → culture tree   +30 XP
 *
 * Re-entrancy: addSkillXP does not trigger any of the monitored action types,
 * so no re-entrancy guard is needed.
 */

import { addSkillXP } from '../slices/skillTreeSlice.js';

export const learningProgressMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  switch (action.type) {
    case 'grammar/completeLesson':
      store.dispatch(addSkillXP({ treeId: 'grammar', amount: 40 }));
      break;
    case 'quests/completeQuest':
      store.dispatch(addSkillXP({ treeId: 'culture', amount: 30 }));
      break;
    case 'achievements/recordPerfectQuiz':
      store.dispatch(addSkillXP({ treeId: 'reading', amount: 20 }));
      break;
    case 'achievements/incrementReviews':
      store.dispatch(addSkillXP({ treeId: 'reading', amount: 10 }));
      break;
    case 'alphabet/completeGroup':
      store.dispatch(addSkillXP({ treeId: 'writing', amount: 25 }));
      break;
    case 'poetry/endPoetryBattle':
      if (action.payload?.won) {
        store.dispatch(addSkillXP({ treeId: 'speaking', amount: 30 }));
        store.dispatch(addSkillXP({ treeId: 'culture', amount: 30 }));
      }
      break;
    default:
      break;
  }

  return result;
};
