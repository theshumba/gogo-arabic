import { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleMenu } from './store/slices/uiSlice.js';
import { loadWords } from './store/slices/vocabularySlice.js';
import { initializeQuests, checkPrerequisites } from './store/slices/questSlice.js';
import vocabulary from './data/vocabularyAll.js';
import questsData from './data/quests.json';
import { useAudio } from './hooks/useAudio.js';
import { useEventBusListeners } from './hooks/useEventBusListeners.js';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx';
import styles from './App.module.css';

// Game screen components
import { PhaserGame } from './game/PhaserGame.jsx';
import HUD from './components/HUD/HUD.jsx';
import NotificationToast from './components/HUD/NotificationToast.jsx';
import AchievementToast from './components/Achievements/AchievementToast.jsx';
import DialogueOverlay from './components/NPC/DialogueOverlay.jsx';
import QuizOverlay from './components/Quiz/QuizOverlay.jsx';
import QuestLog from './components/Quest/QuestLog.jsx';
import SignOverlay from './components/World/SignOverlay.jsx';
import PauseMenu from './components/UI/PauseMenu.jsx';

export default function App() {
  const phaserRef = useRef(null);
  const dispatch = useDispatch();
  const { playSFX } = useAudio();

  // Read overlay state from Redux
  const dialogueOpen = useSelector((state) => state.ui.dialogueOpen);
  const dialogueConfig = useSelector((state) => state.ui.dialogueConfig);
  const quizOpen = useSelector((state) => state.ui.quizOpen);
  const menuOpen = useSelector((state) => state.ui.menuOpen);
  const signOpen = useSelector((state) => state.ui.signOpen);

  // Initialize quests and vocabulary on app boot
  useEffect(() => {
    dispatch(loadWords(vocabulary));
    dispatch(initializeQuests(questsData));
    dispatch(checkPrerequisites(questsData));
  }, [dispatch]);

  // Setup EventBus listeners for Phaser <-> React communication
  useEventBusListeners(phaserRef, playSFX);

  // Legacy: This component is no longer the app entry point.
  // Navigation is handled by React Router (see src/routes.jsx and src/main.jsx).
  // This component is kept for backward compatibility with EventBus listeners
  // that bridge Phaser <-> React communication.
  return (
    <div id="app" className={styles.appContainer}>
      <ErrorBoundary>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {/* Phaser canvas - full screen, lowest z-index */}
          <PhaserGame ref={phaserRef} />

          {/* HUD overlay bar */}
          <HUD onMenu={() => dispatch(toggleMenu())} />

          {/* Toast notifications (appears below HUD) */}
          <NotificationToast />
          <AchievementToast />

          {/* Conditional overlays */}
          {dialogueOpen && dialogueConfig?.type === 'quest-log' && <QuestLog />}
          {dialogueOpen && dialogueConfig?.type !== 'quest-log' && <DialogueOverlay />}
          {quizOpen && <QuizOverlay />}
          {signOpen && <SignOverlay />}
          {menuOpen && (
            <PauseMenu
              onResume={() => dispatch(toggleMenu())}
              onMainMenu={() => dispatch(toggleMenu())}
            />
          )}
        </div>
      </ErrorBoundary>
    </div>
  );
}
