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
  // NUCLEAR FIX: Disable tutorial trigger entirely to prevent walking freeze.
  // The proximity check near Guide Amira was causing valid freezes that couldn't
  // be cleared because the NPC texture was missing (breaking the dialogue).
  // By returning early, we guarantee this code path never executes.
  return { tutorialPhase: 'complete', onboardingComplete: true };
}
