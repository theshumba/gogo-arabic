import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  openDialogue,
  openQuiz,
  openSign,
  toggleMenu,
  showNotification,
} from '../../store/slices/uiSlice.js';
import { startSession, endSession, updateSessionTime } from '../../store/slices/dailyGoalsSlice.js';
import {
  setCurrentZone,
  unlockZone,
  addDirhams,
  addXP,
  incrementWordsLearned,
  markChestOpened,
  markBookRead,
  completeOnboarding,
} from '../../store/slices/playerSlice.js';
import { addFsrsCard } from '../../store/slices/vocabularySlice.js';
import {
  updateQuestProgress,
  completeQuest,
  checkPrerequisites,
  visitNpc,
  visitZone,
  recordChestOpened,
} from '../../store/slices/questSlice.js';
import { createNewCard } from '../../services/fsrs.js';
import { XP_REWARDS } from '../../utils/xpCalculator.js';
import vocabulary from '../../data/vocabularyAll.js';
import questsData from '../../data/quests.json';
import { EventBus } from '../../utils/eventBus.js';
import { store } from '../../store/store.js';
import { ZONES } from '../../data/zones.js';
import { useAudio } from '../../hooks/useAudio.js';

import { PhaserGame } from '../../game/PhaserGame.jsx';
import HUD from '../HUD/HUD.jsx';
import MiniMap from '../HUD/MiniMap.jsx';
import NotificationToast from '../HUD/NotificationToast.jsx';
import DialogueOverlay from '../NPC/DialogueOverlay.jsx';
import QuizOverlay from '../Quiz/QuizOverlay.jsx';
import QuestLog from '../Quest/QuestLog.jsx';
import SignOverlay from '../World/SignOverlay.jsx';
import OnboardingFlow from '../Onboarding/OnboardingFlow.jsx';
import LevelUpModal from '../UI/LevelUpModal.jsx';
import StreakRewardToast from '../Goals/StreakRewardToast.jsx';
import AchievementToast from '../Achievements/AchievementToast.jsx';
import styles from './GameLayout.module.css';

function ActivitiesMenu({ onBack, onNavigate }) {
  const activities = [
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

function PauseMenu({ onResume, onMainMenu, onNavigate }) {
  const [showActivities, setShowActivities] = React.useState(false);

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
        <button onClick={onResume} className={styles.pauseMenuBtnResume}>
          Resume
        </button>
        <button onClick={() => setShowActivities(true)} className={styles.pauseMenuBtnActivities}>
          Activities
        </button>
        <button onClick={onMainMenu} className={styles.pauseMenuBtnMenu}>
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

  const dialogueOpen = useSelector((state) => state.ui.dialogueOpen);
  const dialogueConfig = useSelector((state) => state.ui.dialogueConfig);
  const quizOpen = useSelector((state) => state.ui.quizOpen);
  const menuOpen = useSelector((state) => state.ui.menuOpen);
  const signOpen = useSelector((state) => state.ui.signOpen);
  const fsrsCards = useSelector((state) => state.vocabulary.fsrsCards);
  const quests = useSelector((state) => state.quests.quests);
  const onboardingComplete = useSelector((state) => state.player.onboardingComplete ?? true);

  // Track word learned for quest progress
  const trackWordLearned = (category) => {
    const categoryToEvent = {
      greetings: 'word_learned_greetings',
      trade: 'word_learned_trade',
      numbers: 'word_learned_numbers',
      food: 'word_learned_food',
      family: 'word_learned_family',
      nature: 'word_learned_nature',
      animals: 'word_learned_animals',
      body: 'word_learned_body',
      verbs_basic: 'word_learned_verbs_basic',
      adjectives: 'word_learned_adjectives',
      clothing: 'word_learned_clothing',
      colors: 'word_learned_colors',
      directions: 'word_learned_directions',
      time: 'word_learned_time',
      phrases: 'word_learned_phrases',
    };
    const event = categoryToEvent[category];

    if (event) {
      for (const qd of questsData) {
        if (qd.trackEvent === event && quests[qd.id]?.status === 'active') {
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

    for (const qd of questsData) {
      if (qd.trackEvent === 'word_learned_any' && quests[qd.id]?.status === 'active') {
        dispatch(updateQuestProgress({ questId: qd.id, amount: 1 }));
        const current = (quests[qd.id]?.progress || 0) + 1;
        if (current >= qd.target) {
          dispatch(completeQuest(qd.id));
          dispatch(showNotification({ message: `Quest complete: ${qd.title}`, type: 'quest' }));
          dispatch(checkPrerequisites(questsData));
        }
      }
    }
  };

  // EventBus listeners for Phaser -> React communication
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

    const handleZoneChange = ({ zone }) => {
      dispatch(setCurrentZone(zone));

      // Track zone visit for exploration quests
      dispatch(visitZone(zone));

      // Check zone exploration quests
      for (const qd of questsData) {
        if (qd.type === 'exploration' && qd.trackEvent === 'zones_visited' && quests[qd.id]?.status === 'active') {
          const state = store.getState();
          const zonesVisited = state.quests.zonesVisited || [];
          const visitedCount = zonesVisited.length;
          if (quests[qd.id]) {
            quests[qd.id].progress = visitedCount;
          }
          if (visitedCount >= qd.target) {
            dispatch(completeQuest(qd.id));
            dispatch(showNotification({ message: `Quest complete: ${qd.title}`, type: 'quest' }));
            dispatch(checkPrerequisites(questsData));
          }
        }
      }
    };

    const handleOpenQuiz = (quizConfig) => {
      dispatch(openQuiz(quizConfig));
    };

    const handleOpenAlphabet = () => {
      navigate('/alphabet');
    };

    const handleOpenReviewSession = () => {
      navigate('/review');
    };

    const handleShowSign = ({ arabic, english }) => {
      playSFX('bookopen');
      dispatch(openSign({ arabic, english }));
    };

    const handleBookshelfInteract = ({ category, id, reread }) => {
      playSFX('bookflip');
      if (!reread) {
        dispatch(markBookRead(id));
      }
      const categoryWords = vocabulary.filter((w) => w.category === category);
      const unknownWords = categoryWords.filter((w) => !fsrsCards[w.id]);
      const pool = unknownWords.length > 0 ? unknownWords : categoryWords;
      const word = pool[Math.floor(Math.random() * pool.length)];

      if (word && !reread) {
        if (!fsrsCards[word.id]) {
          dispatch(addFsrsCard({ wordId: word.id, card: createNewCard() }));
          dispatch(incrementWordsLearned());
          dispatch(addXP(XP_REWARDS.NEW_WORD));
          trackWordLearned(word.category);
        }
        dispatch(
          showNotification({
            message: `${word.arabic} — ${word.english}`,
            type: 'word',
          })
        );
      } else if (reread) {
        dispatch(
          showNotification({
            message: `${word.arabic} — ${word.english}`,
            type: 'word',
          })
        );
      }
      EventBus.emit('unfreeze-player');
    };

    const handleChestOpened = ({ amount, id }) => {
      playSFX('chest');
      playSFX('coin');
      dispatch(markChestOpened(id));
      dispatch(addDirhams(amount));
      dispatch(
        showNotification({
          message: `Found ${amount} dirhams!`,
          type: 'dirhams',
        })
      );

      // Track chest opened for treasure hunter quest
      dispatch(recordChestOpened(id));

      // Check treasure hunter quest
      for (const qd of questsData) {
        if (qd.trackEvent === 'chest_opened' && quests[qd.id]?.status === 'active') {
          const state = store.getState();
          const chestsOpened = state.quests.chestsOpened || [];
          const chestsCount = chestsOpened.length;
          if (quests[qd.id]) {
            quests[qd.id].progress = chestsCount;
          }
          if (chestsCount >= qd.target) {
            dispatch(completeQuest(qd.id));
            dispatch(showNotification({ message: `Quest complete: ${qd.title}`, type: 'quest' }));
            dispatch(checkPrerequisites(questsData));
          }
        }
      }
    };

    const handleChestEmpty = () => {
      playSFX('click');
      dispatch(
        showNotification({
          message: 'Already opened!',
          type: 'dirhams',
        })
      );
    };

    const handleCheckZoneUnlock = ({ zoneName, entryX, entryY, unlock }) => {
      if (!unlock) {
        EventBus.emit('zone-transition', { zoneName, entryX, entryY });
        return;
      }
      if (unlock.quest && quests[unlock.quest]?.status !== 'completed') {
        const qd = questsData.find((q) => q.id === unlock.quest);
        playSFX('wrong');
        dispatch(
          showNotification({
            message: `Locked! Complete: ${qd?.title || unlock.quest}`,
            type: 'quest',
          })
        );
        return;
      }
      const playerState = store.getState().player;
      if (unlock.minLevel && playerState.level < unlock.minLevel) {
        playSFX('wrong');
        dispatch(
          showNotification({
            message: `Locked! Need level ${unlock.minLevel}`,
            type: 'quest',
          })
        );
        return;
      }
      if (unlock.minWords && playerState.wordsLearned < unlock.minWords) {
        playSFX('wrong');
        dispatch(
          showNotification({
            message: `Locked! Need ${unlock.minWords} words learned`,
            type: 'quest',
          })
        );
        return;
      }
      dispatch(unlockZone(zoneName));
      EventBus.emit('zone-transition', { zoneName, entryX, entryY });
    };

    const handleZoneTransition = ({ zoneName, entryX, entryY }) => {
      playSFX('transition');
      const game = phaserRef.current?.game;
      if (game) {
        const worldScene = game.scene.getScene('WorldScene');
        if (worldScene?.zoneTransition) {
          worldScene.zoneTransition.transitionTo(zoneName, entryX, entryY);
        }
      }
    };

    const handleFastTravel = ({ zoneName }) => {
      const zone = ZONES[zoneName];
      if (!zone) return;
      const entryX = zone.spawnPoint.x * 64;
      const entryY = zone.spawnPoint.y * 64;
      const game = phaserRef.current?.game;
      if (game) {
        const worldScene = game.scene.getScene('WorldScene');
        if (worldScene?.zoneTransition) {
          worldScene.zoneTransition.transitionTo(zoneName, entryX, entryY);
        }
      }
    };

    const handleSfxCorrect = () => playSFX('correct');
    const handleSfxWrong = () => playSFX('wrong');
    const handleSfxWordlearned = () => playSFX('wordlearned');
    const handleSfxLevelup = () => playSFX('levelup');
    const handleSfxQuest = () => playSFX('quest');
    const handleSfxClick = () => playSFX('click');

    const handleOpenWorldMap = () => {
      navigate('/game/map');
    };

    EventBus.on('npc-interact', handleNpcInteract);
    EventBus.on('open-world-map', handleOpenWorldMap);
    EventBus.on('zone-change', handleZoneChange);
    EventBus.on('open-quiz', handleOpenQuiz);
    EventBus.on('open-alphabet', handleOpenAlphabet);
    EventBus.on('open-review-session', handleOpenReviewSession);
    EventBus.on('show-sign', handleShowSign);
    EventBus.on('bookshelf-interact', handleBookshelfInteract);
    EventBus.on('chest-opened', handleChestOpened);
    EventBus.on('chest-empty', handleChestEmpty);
    EventBus.on('check-zone-unlock', handleCheckZoneUnlock);
    EventBus.on('zone-transition', handleZoneTransition);
    EventBus.on('fast-travel', handleFastTravel);
    EventBus.on('sfx-correct', handleSfxCorrect);
    EventBus.on('sfx-wrong', handleSfxWrong);
    EventBus.on('sfx-wordlearned', handleSfxWordlearned);
    EventBus.on('sfx-levelup', handleSfxLevelup);
    EventBus.on('sfx-quest', handleSfxQuest);
    EventBus.on('sfx-click', handleSfxClick);

    return () => {
      EventBus.off('npc-interact', handleNpcInteract);
      EventBus.off('zone-change', handleZoneChange);
      EventBus.off('open-quiz', handleOpenQuiz);
      EventBus.off('open-alphabet', handleOpenAlphabet);
      EventBus.off('open-review-session', handleOpenReviewSession);
      EventBus.off('show-sign', handleShowSign);
      EventBus.off('bookshelf-interact', handleBookshelfInteract);
      EventBus.off('chest-opened', handleChestOpened);
      EventBus.off('chest-empty', handleChestEmpty);
      EventBus.off('check-zone-unlock', handleCheckZoneUnlock);
      EventBus.off('zone-transition', handleZoneTransition);
      EventBus.off('fast-travel', handleFastTravel);
      EventBus.off('open-world-map', handleOpenWorldMap);
      EventBus.off('sfx-correct', handleSfxCorrect);
      EventBus.off('sfx-wrong', handleSfxWrong);
      EventBus.off('sfx-wordlearned', handleSfxWordlearned);
      EventBus.off('sfx-levelup', handleSfxLevelup);
      EventBus.off('sfx-quest', handleSfxQuest);
      EventBus.off('sfx-click', handleSfxClick);
    };
  }, [dispatch, fsrsCards, quests, playSFX, navigate]);

  // Onboarding handlers
  const handleOnboardingComplete = () => {
    dispatch(completeOnboarding());
    dispatch(showNotification({ message: 'Welcome to GoGo Arabic!', type: 'quest' }));
  };

  const handleOnboardingSkip = () => {
    dispatch(completeOnboarding());
  };

  // Track session time for daily goals
  useEffect(() => {
    // Start session when component mounts
    dispatch(startSession());

    // Update session time every minute
    const sessionTimer = setInterval(() => {
      dispatch(updateSessionTime());
    }, 60000); // Every 60 seconds

    // End session when component unmounts
    return () => {
      clearInterval(sessionTimer);
      dispatch(endSession());
    };
  }, [dispatch]);

  // Keyboard shortcuts (M for map, L for alphabet)
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Don't trigger if a modal/overlay is open
      if (dialogueOpen || quizOpen || menuOpen || signOpen) return;

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        navigate('/game/map');
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        navigate('/alphabet');
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [navigate, dialogueOpen, quizOpen, menuOpen, signOpen]);

  return (
    <div className={styles.container}>
      {/* Phaser canvas - full screen, lowest z-index */}
      <PhaserGame ref={phaserRef} />

      {/* HUD overlay bar */}
      <HUD onMenu={() => dispatch(toggleMenu())} />

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
      {!onboardingComplete && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

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
        />
      )}

      {/* Outlet for nested routes (e.g., /game/map) with AnimatePresence */}
      <AnimatePresence mode="wait">
        <Outlet key={location.pathname} />
      </AnimatePresence>
    </div>
  );
}
