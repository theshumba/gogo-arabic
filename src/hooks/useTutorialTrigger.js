import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setTutorialPhase,
  completeOnboarding,
  setOnboardingTargetNpc,
} from '../store/slices/playerSlice.js';
import { store } from '../store/store.js';
import { WORLD_STATE_KEYS } from '../data/worldStateKeys.js';
import { InkDialogueEngine } from '../game/systems/InkDialogueEngine.js';
import { EventBus } from '../utils/eventBus.js';
import { EVENTS } from '../utils/eventBusTypes.js';

const MENTOR_NPC_ID = 'guide-amira';
const SCHOLAR_NPC_ID = 'scholar-yusuf';

/**
 * useTutorialTrigger
 *
 * Drives the full onboarding flow:
 *
 * Tutorial phases:
 * - 'cinematic_intro': Black screen text crawl (CinematicIntro component)
 * - 'path_choice': Scholar/Traveler/Historian selection (PathChoice component)
 * - 'awaiting_mentor': Auto-intro fires, freezes player, opens Guide Amira dialogue
 * - 'met_mentor': Waiting for word learn
 * - 'learned_word': Shows arrow to Scholar Yusuf
 * - 'first_words_quest': Player exploring, learning words from objects
 * - 'met_yusuf': Tutorial complete
 * - 'complete': Onboarding done
 */
export function useTutorialTrigger() {
  const dispatch = useDispatch();
  const tutorialPhase = useSelector((s) => s.player.tutorialPhase);
  const onboardingComplete = useSelector((s) => s.player.onboardingComplete);
  const autoIntroFired = useRef(false);

  // --- Auto-intro when cinematic + path choice are done ---
  useEffect(() => {
    if (tutorialPhase !== 'awaiting_mentor') return;
    if (autoIntroFired.current) return;
    autoIntroFired.current = true;

    EventBus.emit(EVENTS.PLAYER_FREEZE);
    dispatch(setOnboardingTargetNpc(MENTOR_NPC_ID));

    const timer = setTimeout(() => {
      EventBus.emit(EVENTS.NPC_INTERACT, {
        npcId: MENTOR_NPC_ID,
        npcName: 'Guide Amira',
        autoTriggered: true,
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [tutorialPhase, dispatch]);

  // --- Track dialogue end to advance tutorial phases ---
  useEffect(() => {
    if (onboardingComplete) return;

    const handleDialogueEnded = ({ npcId }) => {
      if (tutorialPhase === 'awaiting_mentor' && npcId === MENTOR_NPC_ID) {
        dispatch(setTutorialPhase('met_mentor'));
        dispatch(setOnboardingTargetNpc(null));
      } else if (tutorialPhase === 'learned_word' && npcId === SCHOLAR_NPC_ID) {
        dispatch(setTutorialPhase('met_yusuf'));
        dispatch(setOnboardingTargetNpc(null));
        dispatch(setTutorialPhase('complete'));
        dispatch(completeOnboarding());
      }
    };

    EventBus.on(EVENTS.DIALOGUE_ENDED, handleDialogueEnded);
    return () => EventBus.off(EVENTS.DIALOGUE_ENDED, handleDialogueEnded);
  }, [tutorialPhase, onboardingComplete, dispatch]);

  // --- Track word learned: fire ink path-choice dialogue, then advance phase ---
  useEffect(() => {
    if (tutorialPhase !== 'met_mentor') return;

    const handleWordLearned = async () => {
      // Check if path was already chosen (returning players / save reload)
      const pathAlreadyChosen = store.getState().worldState?.flags?.[WORLD_STATE_KEYS.ONBOARDING_PATH_CHOSEN];
      if (pathAlreadyChosen) {
        dispatch(setTutorialPhase('learned_word'));
        dispatch(setOnboardingTargetNpc(SCHOLAR_NPC_ID));
        return;
      }

      // PATH-01 / PATH-02: Fire Amira's path-choice ink dialogue
      // After ink story ends, DialogueOverlay dispatches setTutorialPhase('awaiting_mentor')
      // which causes the welcome splash but then useTutorialTrigger re-fires auto-intro.
      // Instead: listen for INK_DIALOGUE_END and then advance to learned_word.
      const engine = new InkDialogueEngine(null, null);
      await engine.loadPathChoice();

      if (!engine.isInkLoaded) {
        // Fallback: skip ink path if file missing — advance normally
        dispatch(setTutorialPhase('learned_word'));
        dispatch(setOnboardingTargetNpc(SCHOLAR_NPC_ID));
        return;
      }

      // Emit ink dialogue start with Amira's NPC data
      EventBus.emit(EVENTS.INK_DIALOGUE_START, {
        engine,
        npcData: { id: 'guide-amira', name: 'Guide Amira — أميرة' },
      });

      // After ink dialogue ends, advance tutorial phase
      const handleInkEnd = () => {
        dispatch(setTutorialPhase('learned_word'));
        dispatch(setOnboardingTargetNpc(SCHOLAR_NPC_ID));
        EventBus.off(EVENTS.INK_DIALOGUE_END, handleInkEnd);
      };
      EventBus.on(EVENTS.INK_DIALOGUE_END, handleInkEnd);
    };

    EventBus.on(EVENTS.SFX_WORDLEARNED, handleWordLearned);
    return () => EventBus.off(EVENTS.SFX_WORDLEARNED, handleWordLearned);
  }, [tutorialPhase, dispatch]);

  // --- Set onboarding target NPC based on current phase ---
  useEffect(() => {
    if (onboardingComplete) return;

    if (tutorialPhase === 'awaiting_mentor') {
      dispatch(setOnboardingTargetNpc(MENTOR_NPC_ID));
    } else if (tutorialPhase === 'learned_word') {
      dispatch(setOnboardingTargetNpc(SCHOLAR_NPC_ID));
    }
  }, [tutorialPhase, onboardingComplete, dispatch]);

  return { tutorialPhase, onboardingComplete };
}
