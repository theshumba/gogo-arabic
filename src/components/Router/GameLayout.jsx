import React, { useRef, useEffect, lazy, Suspense } from 'react';
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
import { WORLD_STATE_KEYS } from '../../data/worldStateKeys.js';
import LevelUpModal from '../UI/LevelUpModal.jsx';
import StreakRewardToast from '../Goals/StreakRewardToast.jsx';
import AchievementToast from '../Achievements/AchievementToast.jsx';
const BattleOverlay = lazy(() => import('../Battle/BattleOverlay.jsx'));
const MagicOverlay = lazy(() => import('../Magic/MagicOverlay.jsx'));
const SpellMenu = lazy(() => import('../Magic/SpellMenu.jsx'));
const RootDiscoveryToast = lazy(() => import('../Magic/RootDiscoveryToast.jsx'));
const InventoryUI = lazy(() => import('../Inventory/InventoryUI.jsx'));
const RecipeBook = lazy(() => import('../Crafting/RecipeBook.jsx'));
const CraftingMiniGame = lazy(() => import('../Crafting/CraftingMiniGame.jsx'));
const ShopOverlay = lazy(() => import('../Shop/ShopOverlay.jsx'));
const QuestJournal = lazy(() => import('../Quest/QuestJournal.jsx'));
const Wardrobe = lazy(() => import('../Wardrobe/Wardrobe.jsx'));
const FactionPanel = lazy(() => import('../Faction/FactionPanel.jsx'));
import styles from './GameLayout.module.css';

function ActivitiesMenu({ onBack, onNavigate, onOpenPathSwitch }) {
  const activities = [
    {
      id: 'learning-path',
      icon: '\u0645\u0633\u0627\u0631',
      label: 'Learning Path',
      description: 'Change your learning path',
      // No route — handled via onOpenPathSwitch for settings mode PathChoice
      route: null,
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
              onClick={() => {
                if (activity.id === 'learning-path' && onOpenPathSwitch) {
                  onOpenPathSwitch();
                } else if (activity.route) {
                  onNavigate(activity.route);
                }
              }}
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

function PauseMenu({ onResume, onMainMenu, onNavigate, onOpenWardrobe, onOpenPathSwitch, onOpenFactionPanel }) {
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
        onOpenPathSwitch={() => {
          setShowActivities(false);
          if (onOpenPathSwitch) onOpenPathSwitch();
        }}
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
        <button onClick={() => { audioManager.playSFX('click'); if (onOpenFactionPanel) onOpenFactionPanel(); }} className={styles.pauseMenuBtnActivities}>
          Factions
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
  // PATH-07: dual-check — skip onboarding if either localStorage OR IndexedDB flag is set
  const worldOnboardingComplete = useSelector(
    (state) => state.worldState?.flags?.[WORLD_STATE_KEYS.ONBOARDING_COMPLETE] ?? false
  );
  // Resolved skip: either source confirms onboarding done
  const onboardingSkip = onboardingComplete || worldOnboardingComplete;
  const anyOverlayOpen = useSelector(selectAnyOverlayOpen);
  // Guard: PathChoice overlay should not appear if path was already chosen via ink dialogue
  const pathAlreadyChosen = useSelector(
    (state) => state.worldState?.flags?.[WORLD_STATE_KEYS.ONBOARDING_PATH_CHOSEN] ?? false
  );

  const [showWardrobe, setShowWardrobe] = React.useState(false);
  const [showPathSwitch, setShowPathSwitch] = React.useState(false);
  const [showFactionPanel, setShowFactionPanel] = React.useState(false);
  const [zoneLoading, setZoneLoading] = React.useState(false);

  useEffect(() => {
    const onStart = () => setZoneLoading(true);
    const onEnd = () => setZoneLoading(false);
    EventBus.on(EVENTS.ZONE_LOADING_START, onStart);
    EventBus.on(EVENTS.ZONE_LOADING_END, onEnd);
    return () => {
      EventBus.off(EVENTS.ZONE_LOADING_START, onStart);
      EventBus.off(EVENTS.ZONE_LOADING_END, onEnd);
    };
  }, []);

  // Welcome splash — show when arriving at awaiting_mentor (after cinematic + path choice)
  const tutorialPhase = useSelector((state) => state.player.tutorialPhase);
  const prevPhaseRef = useRef(tutorialPhase);
  const [showWelcome, setShowWelcome] = React.useState(false);

  // Trigger welcome splash when transitioning into awaiting_mentor
  useEffect(() => {
    if (prevPhaseRef.current !== 'awaiting_mentor' && tutorialPhase === 'awaiting_mentor' && !onboardingSkip) {
      setShowWelcome(true);
    }
    prevPhaseRef.current = tutorialPhase;
  }, [tutorialPhase, onboardingSkip]);

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

      {/* Zone loading indicator -- shown during zone transition asset loading */}
      {zoneLoading && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#D4A843',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '12px',
          zIndex: 9999,
          pointerEvents: 'none',
        }}>
          Loading zone...
        </div>
      )}

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

      {/* Learning path choice — Scholar/Traveler/Historian (settings fallback only) */}
      {/* The ink dialogue path (PATH-01/PATH-02) never sets tutorialPhase='path_choice'.  */}
      {/* The ONBOARDING_PATH_CHOSEN guard prevents double-display in any edge case.       */}
      {tutorialPhase === 'path_choice' && !pathAlreadyChosen && <PathChoice />}

      {/* PATH-05: Settings-mode path switch (triggered from Activities menu) */}
      {showPathSwitch && (
        <PathChoice mode="settings" onClose={() => setShowPathSwitch(false)} />
      )}

      {/* Tutorial hints (non-blocking arrows/prompts) */}
      {/* PATH-07: skipped for returning players via onboardingSkip dual-check */}
      {!onboardingSkip && tutorialPhase !== 'cinematic_intro' && tutorialPhase !== 'path_choice' && <TutorialHints />}

      {/* Welcome splash — auto-fades after 3 seconds */}
      {showWelcome && <WelcomeSplash onDone={() => setShowWelcome(false)} />}

      {/* Conditional overlays */}
      {dialogueOpen && dialogueConfig?.type === 'quest-log' && <QuestLog />}
      {dialogueOpen && dialogueConfig?.type === 'shop' && (
        <Suspense fallback={null}>
          <ShopOverlay />
        </Suspense>
      )}
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
          onOpenPathSwitch={() => {
            dispatch(toggleMenu());
            setShowPathSwitch(true);
          }}
          onOpenFactionPanel={() => {
            dispatch(toggleMenu());
            setShowFactionPanel(true);
          }}
        />
      )}

      {/* Quest Journal overlay (v7.0) */}
      <AnimatePresence>
        {journalOpen && (
          <Suspense fallback={null}>
            <QuestJournal onClose={() => dispatch(closeJournal())} />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Battle overlay (v6.0 turn-based combat) */}
      <Suspense fallback={null}>
        <BattleOverlay />
      </Suspense>

      {/* Magic overlay (v6.0 spell hotbar) */}
      <Suspense fallback={null}>
        <MagicOverlay />
      </Suspense>

      {/* Spell menu overlay */}
      <Suspense fallback={null}>
        <SpellMenu />
      </Suspense>

      {/* Root discovery toast */}
      <Suspense fallback={null}>
        <RootDiscoveryToast />
      </Suspense>

      {/* Inventory overlay (v6.0 equipment & inventory) */}
      <AnimatePresence>
        {inventoryOpen && (
          <Suspense fallback={null}>
            <InventoryUI onClose={() => dispatch(closeInventory())} />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Wardrobe overlay */}
      <AnimatePresence>
        {showWardrobe && (
          <Suspense fallback={null}>
            <Wardrobe onClose={() => setShowWardrobe(false)} />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Faction panel overlay (Phase 53) */}
      {showFactionPanel && (
        <Suspense fallback={null}>
          <FactionPanel onClose={() => setShowFactionPanel(false)} />
        </Suspense>
      )}

      {/* RecipeBook overlay (v6.1 crafting) */}
      <AnimatePresence>
        {recipeBookOpen && (
          <Suspense fallback={null}>
            <RecipeBook
              onClose={() => dispatch(closeRecipeBook())}
              onSelectRecipe={(recipeId, professionId) => {
                dispatch(closeRecipeBook());
                dispatch(startCraftingMiniGame({ recipeId, professionId }));
              }}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* CraftingMiniGame overlay (v6.1 crafting) */}
      <AnimatePresence>
        {craftingMiniGameActive && craftingRecipeId && craftingProfessionId && (
          <Suspense fallback={null}>
            <CraftingMiniGame
              professionId={craftingProfessionId}
              recipeId={craftingRecipeId}
              onComplete={() => {
                dispatch(endCraftingMiniGame());
              }}
              onCancel={() => dispatch(endCraftingMiniGame())}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Outlet for nested routes (e.g., /game/map) with AnimatePresence */}
      <AnimatePresence mode="wait">
        <Outlet key={location.pathname} />
      </AnimatePresence>
    </div>
  );
}
