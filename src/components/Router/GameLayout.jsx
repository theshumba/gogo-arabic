import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { toggleMenu, selectAnyOverlayOpen, selectInventoryOpen, closeInventory, selectRecipeBookOpen, closeRecipeBook, selectCraftingMiniGameActive, selectCraftingRecipeId, selectCraftingProfessionId, startCraftingMiniGame, endCraftingMiniGame, selectJournalOpen, openJournal, closeJournal } from '../../store/slices/uiSlice.js';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';
import { audioManager } from '../../services/audio.js';
import { useAudio } from '../../hooks/useAudio.js';
import { useEventBusListeners } from '../../hooks/useEventBusListeners.js';
import { useSessionTracking } from '../../hooks/useSessionTracking.js';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts.js';

import { PhaserGame } from '../../game/PhaserGame.jsx';

import HUD from '../HUD/HUD.jsx';
import MiniMap from '../HUD/MiniMap.jsx';
import NotificationToast from '../HUD/NotificationToast.jsx';
import DialogueOverlay from '../NPC/DialogueOverlay.jsx';
import QuizOverlay from '../Quiz/QuizOverlay.jsx';
import QuestLog from '../Quest/QuestLog.jsx';
import SignOverlay from '../World/SignOverlay.jsx';
import ObjectInteractionOverlay from '../World/ObjectInteractionOverlay.jsx';
import TutorialHints, { WelcomeSplash } from '../Onboarding/TutorialHints.jsx';
import CinematicIntro from '../Onboarding/CinematicIntro.jsx';
import PathChoice from '../Onboarding/PathChoice.jsx';
import { useTutorialTrigger } from '../../hooks/useTutorialTrigger.js';
import LevelUpModal from '../UI/LevelUpModal.jsx';
import StreakRewardToast from '../Goals/StreakRewardToast.jsx';
import AchievementToast from '../Achievements/AchievementToast.jsx';
import Wardrobe from '../Wardrobe/Wardrobe.jsx';
import BattleOverlay from '../Battle/BattleOverlay.jsx';
import MagicOverlay from '../Magic/MagicOverlay.jsx';
import SpellMenu from '../Magic/SpellMenu.jsx';
import RootDiscoveryToast from '../Magic/RootDiscoveryToast.jsx';
import InventoryUI from '../Inventory/InventoryUI.jsx';
import RecipeBook from '../Crafting/RecipeBook.jsx';
import CraftingMiniGame from '../Crafting/CraftingMiniGame.jsx';
import ShopOverlay from '../Shop/ShopOverlay.jsx';
import QuestJournal from '../Quest/QuestJournal.jsx';
import styles from './GameLayout.module.css';

function ActivitiesMenu({ onBack, onNavigate }) {
  const activities = [
    {
      id: 'learning-path',
      icon: '\u0645\u0633\u0627\u0631',
      label: 'Learning Path',
      description: 'See your learning progression',
      route: '/learning-path',
    },
    {
      id: 'grammar',
      icon: 'قواعد',
      label: 'Grammar',
      description: 'Learn Arabic grammar rules',
      route: '/grammar',
    },
    {
      id: 'roots',
      icon: 'جذور',
      label: 'Word Roots',
      description: 'Explore Arabic root patterns',
      route: '/roots',
    },
    {
      id: 'reading',
      icon: 'قراءة',
      label: 'Reading',
      description: 'Practice reading Arabic passages',
      route: '/mini-games/reading',
    },
    {
      id: 'minigames',
      icon: 'ألعاب',
      label: 'Mini-Games',
      description: 'Fun vocabulary practice games',
      route: '/mini-games',
    },
  ];

  return (
    <div className={styles.pauseMenuOverlay}>
      <div className={styles.pauseMenuTitle}>Activities</div>
      <div className={styles.activitiesMenu}>
        <div className={styles.activitiesGrid}>
          {activities.map((activity) => (
            <button
              key={activity.id}
              className={styles.activityCard}
              onClick={() => onNavigate(activity.route)}
              aria-label={`${activity.label} - ${activity.description}`}
            >
              <div className={styles.activityCardArabic} lang="ar" aria-hidden="true">
                {activity.icon}
              </div>
              <div className={styles.activityCardLabel}>{activity.label}</div>
              <div className={styles.activityCardDesc}>{activity.description}</div>
            </button>
          ))}
        </div>
        <button onClick={onBack} className={styles.activitiesBackBtn}>
          Back
        </button>
      </div>
    </div>
  );
}

function PauseMenu({ onResume, onMainMenu, onNavigate, onOpenWardrobe }) {
  const [showActivities, setShowActivities] = React.useState(false);

  // ESC key handler for pause menu
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onResume();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onResume]);

  if (showActivities) {
    return (
      <ActivitiesMenu
        onBack={() => setShowActivities(false)}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className={styles.pauseMenuOverlay}>
      <div className={styles.pauseMenuTitle}>Paused</div>
      <div className={styles.pauseMenuButtons}>
        <button onClick={() => { audioManager.playSFX('click'); onResume(); }} className={styles.pauseMenuBtnResume}>
          Resume
        </button>
        <button onClick={() => { audioManager.playSFX('click'); setShowActivities(true); }} className={styles.pauseMenuBtnActivities}>
          Activities
        </button>
        <button onClick={() => { audioManager.playSFX('click'); onNavigate('/stats'); }} className={styles.pauseMenuBtnActivities}>
          Profile
        </button>
        <button onClick={() => { audioManager.playSFX('click'); onOpenWardrobe(); }} className={styles.pauseMenuBtnActivities}>
          Wardrobe
        </button>
        <button onClick={() => { audioManager.playSFX('click'); onNavigate('/skill-tree'); }} className={styles.pauseMenuBtnActivities}>
          Skill Trees
        </button>
        <button onClick={() => { audioManager.playSFX('click'); onNavigate('/codex'); }} className={styles.pauseMenuBtnActivities}>
          Codex
        </button>
        <button onClick={() => { audioManager.playSFX('click'); onNavigate('/save-load'); }} className={styles.pauseMenuBtnActivities}>
          Save / Load
        </button>
        <button onClick={() => { audioManager.playSFX('click'); onNavigate('/completion'); }} className={styles.pauseMenuBtnActivities}>
          Completion
        </button>
        <button onClick={() => { audioManager.playSFX('click'); onMainMenu(); }} className={styles.pauseMenuBtnMenu}>
          Main Menu
        </button>
      </div>
    </div>
  );
}

/**
 * Layout component for /game/* routes
 * Keeps Phaser canvas mounted across sub-route navigation
 * Handles all EventBus listeners for Phaser <-> React communication
 */
export default function GameLayout() {
  const phaserRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { playSFX } = useAudio();

  // Custom hooks for EventBus, session tracking, and keyboard shortcuts
  useEventBusListeners(phaserRef, playSFX, navigate);
  useSessionTracking();
  useKeyboardShortcuts();
  useTutorialTrigger();

  // UI state selectors — declared early so the emergency reset effect below can use them
  const dialogueOpen = useSelector((state) => state.ui.dialogueOpen);
  const dialogueConfig = useSelector((state) => state.ui.dialogueConfig);
  const quizOpen = useSelector((state) => state.ui.quizOpen);
  const menuOpen = useSelector((state) => state.ui.menuOpen);
  const signOpen = useSelector((state) => state.ui.signOpen);
  const objectInspectOpen = useSelector((state) => state.ui.objectInspectOpen);
  const inventoryOpen = useSelector(selectInventoryOpen);
  const recipeBookOpen = useSelector(selectRecipeBookOpen);
  const craftingMiniGameActive = useSelector(selectCraftingMiniGameActive);
  const craftingRecipeId = useSelector(selectCraftingRecipeId);
  const craftingProfessionId = useSelector(selectCraftingProfessionId);
  const journalOpen = useSelector(selectJournalOpen);
  const onboardingComplete = useSelector((state) => state.player.onboardingComplete ?? true);
  const anyOverlayOpen = useSelector(selectAnyOverlayOpen);

  const [showWardrobe, setShowWardrobe] = React.useState(false);

  // Welcome splash — show when arriving at awaiting_mentor (after cinematic + path choice)
  const tutorialPhase = useSelector((state) => state.player.tutorialPhase);
  const prevPhaseRef = useRef(tutorialPhase);
  const [showWelcome, setShowWelcome] = React.useState(false);

  // Trigger welcome splash when transitioning into awaiting_mentor
  useEffect(() => {
    if (prevPhaseRef.current !== 'awaiting_mentor' && tutorialPhase === 'awaiting_mentor' && !onboardingComplete) {
      setShowWelcome(true);
    }
    prevPhaseRef.current = tutorialPhase;
  }, [tutorialPhase, onboardingComplete]);

  // J key toggles journal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'j' || e.key === 'J') {
        if (!anyOverlayOpen || journalOpen) {
          e.preventDefault();
          dispatch(journalOpen ? closeJournal() : openJournal());
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [anyOverlayOpen, journalOpen, dispatch]);

  // Freeze player when React overlays open (recipe book, crafting, inventory)
  // These overlays steal keyboard focus from the Phaser canvas, so movement
  // stops even without an explicit PLAYER_FREEZE. This ensures the game state
  // is consistent with the input state.
  useEffect(() => {
    if (recipeBookOpen || craftingMiniGameActive || inventoryOpen) {
      EventBus.emit(EVENTS.PLAYER_FREEZE);
    }
  }, [recipeBookOpen, craftingMiniGameActive, inventoryOpen]);

  // Safety net: if no overlays are open, ensure player is unfrozen
  // and refocus the Phaser canvas so keyboard input resumes.
  useEffect(() => {
    if (!anyOverlayOpen && !showWardrobe) {
      // Small delay to avoid race with overlay close animations
      const timer = setTimeout(() => {
        EventBus.emit(EVENTS.PLAYER_UNFREEZE);
        // Refocus the Phaser canvas so arrow keys work again
        const canvas = document.querySelector('canvas');
        if (canvas) canvas.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [anyOverlayOpen, showWardrobe]);

  return (
    <div className={styles.container}>
      {/* Phaser canvas - full screen, lowest z-index */}
      <PhaserGame ref={phaserRef} />

      {/* HUD overlay bar */}
      <HUD onMenu={() => { audioManager.playSFX('click'); dispatch(toggleMenu()); }} />

      {/* MiniMap - bottom right corner */}
      {location.pathname === '/game' && <MiniMap />}

      {/* Toast notifications */}
      <NotificationToast />

      {/* Achievement toast */}
      <AchievementToast />

      {/* Streak reward toast */}
      <StreakRewardToast />

      {/* Level up modal */}
      <LevelUpModal />

      {/* Phase 47: CinematicIntro replaced by Phaser-native sequence in CinematicIntroSequencer.js */}

      {/* Learning path choice — Scholar/Traveler/Historian */}
      {tutorialPhase === 'path_choice' && <PathChoice />}

      {/* Tutorial hints (non-blocking arrows/prompts) */}
      {!onboardingComplete && tutorialPhase !== 'cinematic_intro' && tutorialPhase !== 'path_choice' && <TutorialHints />}

      {/* Welcome splash — auto-fades after 3 seconds */}
      {showWelcome && <WelcomeSplash onDone={() => setShowWelcome(false)} />}

      {/* Conditional overlays */}
      {dialogueOpen && dialogueConfig?.type === 'quest-log' && <QuestLog />}
      {dialogueOpen && dialogueConfig?.type === 'shop' && <ShopOverlay />}
      {dialogueOpen && dialogueConfig?.type !== 'quest-log' && dialogueConfig?.type !== 'shop' && <DialogueOverlay />}
      {quizOpen && <QuizOverlay />}
      {signOpen && <SignOverlay />}
      {objectInspectOpen && <ObjectInteractionOverlay />}
      {menuOpen && (
        <PauseMenu
          onResume={() => dispatch(toggleMenu())}
          onMainMenu={() => {
            dispatch(toggleMenu());
            navigate('/');
          }}
          onNavigate={(path) => {
            dispatch(toggleMenu());
            navigate(path);
          }}
          onOpenWardrobe={() => {
            dispatch(toggleMenu());
            setShowWardrobe(true);
          }}
        />
      )}

      {/* Quest Journal overlay (v7.0) */}
      <AnimatePresence>
        {journalOpen && <QuestJournal onClose={() => dispatch(closeJournal())} />}
      </AnimatePresence>

      {/* Battle overlay (v6.0 turn-based combat) */}
      <BattleOverlay />

      {/* Magic overlay (v6.0 spell hotbar) */}
      <MagicOverlay />

      {/* Spell menu overlay */}
      <SpellMenu />

      {/* Root discovery toast */}
      <RootDiscoveryToast />

      {/* Inventory overlay (v6.0 equipment & inventory) */}
      <AnimatePresence>
        {inventoryOpen && <InventoryUI onClose={() => dispatch(closeInventory())} />}
      </AnimatePresence>

      {/* Wardrobe overlay */}
      <AnimatePresence>
        {showWardrobe && <Wardrobe onClose={() => setShowWardrobe(false)} />}
      </AnimatePresence>

      {/* RecipeBook overlay (v6.1 crafting) */}
      <AnimatePresence>
        {recipeBookOpen && (
          <RecipeBook
            onClose={() => dispatch(closeRecipeBook())}
            onSelectRecipe={(recipeId, professionId) => {
              dispatch(closeRecipeBook());
              dispatch(startCraftingMiniGame({ recipeId, professionId }));
            }}
          />
        )}
      </AnimatePresence>

      {/* CraftingMiniGame overlay (v6.1 crafting) */}
      <AnimatePresence>
        {craftingMiniGameActive && craftingRecipeId && craftingProfessionId && (
          <CraftingMiniGame
            professionId={craftingProfessionId}
            recipeId={craftingRecipeId}
            onComplete={() => {
              dispatch(endCraftingMiniGame());
            }}
            onCancel={() => dispatch(endCraftingMiniGame())}
          />
        )}
      </AnimatePresence>

      {/* Outlet for nested routes (e.g., /game/map) with AnimatePresence */}
      <AnimatePresence mode="wait">
        <Outlet key={location.pathname} />
      </AnimatePresence>
    </div>
  );
}
