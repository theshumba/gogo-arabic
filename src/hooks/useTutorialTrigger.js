import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setTutorialPhase,
  completeOnboarding,
  setOnboardingTargetNpc,
} from '../store/slices/playerSlice.js';
import { EventBus } from '../utils/eventBus.js';
import { EVENTS } from '../utils/eventBusTypes.js';

const MENTOR_NPC_ID = 'guide-amira';
const SCHOLAR_NPC_ID = 'scholar-yusuf';
// Proximity threshold: 2 tiles = 128px
const PROXIMITY_THRESHOLD = 128;
// Mentor position in world pixels (tile 14, 18 * 64)
const MENTOR_X = 14 * 64;
const MENTOR_Y = 18 * 64;

/**
 * useTutorialTrigger
 *
 * Listens for player proximity to Guide Amira and drives the tutorial flow.
 * - 'awaiting_mentor': Shows arrow to Amira, auto-opens dialogue on proximity
 * - 'met_mentor': Waiting for word learn (tracked via DIALOGUE_ENDED)
 * - 'learned_word': Shows arrow to Scholar Yusuf
 * - 'met_yusuf': Tutorial complete
 * - 'complete': Onboarding done
 */
export function useTutorialTrigger() {
  const dispatch = useDispatch();
  const tutorialPhase = useSelector((s) => s.player.tutorialPhase);
  const onboardingComplete = useSelector((s) => s.player.onboardingComplete);
  const hasTriggeredRef = useRef(false);

  // Auto-trigger dialogue with Amira when player gets close
  const handlePositionUpdate = useCallback(
    ({ x, y }) => {
      if (tutorialPhase !== 'awaiting_mentor' || hasTriggeredRef.current) return;

      const dist = Math.sqrt(
        (x - MENTOR_X) ** 2 + (y - MENTOR_Y) ** 2
      );

      if (dist < PROXIMITY_THRESHOLD) {
        hasTriggeredRef.current = true;
        // Auto-trigger NPC interaction (no SPACE needed)
        EventBus.emit(EVENTS.NPC_INTERACT, {
          npcId: MENTOR_NPC_ID,
          npcName: 'Guide Amira',
          autoTriggered: true,
        });
        EventBus.emit(EVENTS.PLAYER_FREEZE);
        dispatch(setTutorialPhase('met_mentor'));
      }
    },
    [tutorialPhase, dispatch]
  );

  // Listen for dialogue end events to advance tutorial
  const handleDialogueEnded = useCallback(
    ({ npcId }) => {
      if (onboardingComplete) return;

      if (npcId === MENTOR_NPC_ID && tutorialPhase === 'met_mentor') {
        // After first mentor dialogue, player has learned مرحبا
        dispatch(setTutorialPhase('learned_word'));
        // Highlight Scholar Yusuf
        dispatch(setOnboardingTargetNpc('oasis_village-scholar-yusuf'));
      }

      if (npcId === SCHOLAR_NPC_ID && tutorialPhase === 'learned_word') {
        // Player talked to Yusuf — tutorial complete
        dispatch(setTutorialPhase('met_yusuf'));
        dispatch(setOnboardingTargetNpc(null));
        dispatch(setTutorialPhase('complete'));
        dispatch(completeOnboarding());
      }
    },
    [tutorialPhase, onboardingComplete, dispatch]
  );

  // Set up event listeners
  useEffect(() => {
    if (onboardingComplete) return;

    EventBus.on(EVENTS.PLAYER_POSITION_UPDATE, handlePositionUpdate);
    EventBus.on(EVENTS.DIALOGUE_ENDED, handleDialogueEnded);

    // Highlight Amira when awaiting mentor
    if (tutorialPhase === 'awaiting_mentor') {
      dispatch(setOnboardingTargetNpc('oasis_village-guide-amira'));
    }

    return () => {
      EventBus.off(EVENTS.PLAYER_POSITION_UPDATE, handlePositionUpdate);
      EventBus.off(EVENTS.DIALOGUE_ENDED, handleDialogueEnded);
    };
  }, [onboardingComplete, tutorialPhase, handlePositionUpdate, handleDialogueEnded, dispatch]);

  return { tutorialPhase, onboardingComplete };
}
