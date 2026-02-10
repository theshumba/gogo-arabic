import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { toggleMenu, selectAnyOverlayOpen } from '../../store/slices/uiSlice.js';
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
import ContextualOnboarding from '../Onboarding/ContextualOnboarding.jsx';
import LevelUpModal from '../UI/LevelUpModal.jsx';
import StreakRewardToast from '../Goals/StreakRewardToast.jsx';
import AchievementToast from '../Achievements/AchievementToast.jsx';
import Wardrobe from '../Wardrobe/Wardrobe.jsx';
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

  // UI state selectors
  const dialogueOpen = useSelector((state) => state.ui.dialogueOpen);
  const dialogueConfig = useSelector((state) => state.ui.dialogueConfig);
  const quizOpen = useSelector((state) => state.ui.quizOpen);
  const menuOpen = useSelector((state) => state.ui.menuOpen);
  const signOpen = useSelector((state) => state.ui.signOpen);
  const onboardingComplete = useSelector((state) => state.player.onboardingComplete ?? true);

  const [showWardrobe, setShowWardrobe] = React.useState(false);

  // Safety net selector
  const anyOverlayOpen = useSelector(selectAnyOverlayOpen);

  // Safety net: if no overlays are open, ensure player is unfrozen
  useEffect(() => {
    if (!anyOverlayOpen && !showWardrobe) {
      // Small delay to avoid race with overlay close animations
      const timer = setTimeout(() => {
        EventBus.emit(EVENTS.PLAYER_UNFREEZE);
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

      {/* Onboarding overlay (highest priority) */}
      {!onboardingComplete && <ContextualOnboarding />}

      {/* Conditional overlays */}
      {dialogueOpen && dialogueConfig?.type === 'quest-log' && <QuestLog />}
      {dialogueOpen && dialogueConfig?.type !== 'quest-log' && <DialogueOverlay />}
      {quizOpen && <QuizOverlay />}
      {signOpen && <SignOverlay />}
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

      {/* Wardrobe overlay */}
      <AnimatePresence>
        {showWardrobe && <Wardrobe onClose={() => setShowWardrobe(false)} />}
      </AnimatePresence>

      {/* Outlet for nested routes (e.g., /game/map) with AnimatePresence */}
      <AnimatePresence mode="wait">
        <Outlet key={location.pathname} />
      </AnimatePresence>
    </div>
  );
}
