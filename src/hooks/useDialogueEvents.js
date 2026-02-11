import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openDialogue, showNotification } from '../store/slices/uiSlice.js';
import {
  updateQuestProgress,
  completeQuest,
  checkPrerequisites,
  visitNpc,
} from '../store/slices/questSlice.js';
import questsData from '../data/quests.json';
import { EventBus } from '../utils/eventBus.js';
import { EVENTS } from '../utils/eventBusTypes.js';
import { store } from '../store/store.js';

/**
 * useDialogueEvents — NPC interaction and dialogue event handlers
 */
export function useDialogueEvents(playSFX) {
  const dispatch = useDispatch();
  const quests = useSelector((state) => state.quests.quests);

  useEffect(() => {
    const handleNpcInteract = ({ npcId, npcName }) => {
      playSFX('click');
      dispatch(openDialogue({ npcId, npcName }));

      // Track NPC visit for exploration quests
      dispatch(visitNpc(npcId));

      // Check exploration quests
      for (const qd of questsData) {
        if (qd.type === 'exploration' && quests[qd.id]?.status === 'active') {
          // Count unique NPCs visited for this quest
          const state = store.getState();
          const npcsVisited = state.quests.npcsVisited || [];

          if (qd.requirements?.npcsVisited) {
            // Specific NPCs required
            const requiredNpcs = qd.requirements.npcsVisited;
            const visitedCount = requiredNpcs.filter(npc => npcsVisited.includes(npc)).length;
            dispatch(updateQuestProgress({ questId: qd.id, amount: 0 })); // Update progress display
            if (quests[qd.id]) {
              quests[qd.id].progress = visitedCount;
            }
            if (visitedCount >= qd.target) {
              dispatch(completeQuest(qd.id));
              dispatch(showNotification({ message: `Quest complete: ${qd.title}`, type: 'quest' }));
              dispatch(checkPrerequisites(questsData));
            }
          } else if (qd.requirements?.zone) {
            // NPCs in specific zone
            const currentZone = state.player.currentZone;
            if (currentZone === qd.requirements.zone) {
              dispatch(updateQuestProgress({ questId: qd.id, amount: 1 }));
              const current = (quests[qd.id]?.progress || 0) + 1;
              if (current >= qd.target) {
                dispatch(completeQuest(qd.id));
                dispatch(showNotification({ message: `Quest complete: ${qd.title}`, type: 'quest' }));
                dispatch(checkPrerequisites(questsData));
              }
            }
          }
        }
      }
    };

    EventBus.on(EVENTS.NPC_INTERACT, handleNpcInteract);

    return () => {
      EventBus.off(EVENTS.NPC_INTERACT, handleNpcInteract);
    };
  }, [dispatch, quests, playSFX]);
}
