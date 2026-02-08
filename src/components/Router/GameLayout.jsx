import { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  openDialogue,
  openQuiz,
  openSign,
  toggleMenu,
  showNotification,
} from '../../store/slices/uiSlice.js';
import {
  setCurrentZone,
  unlockZone,
  addDirhams,
  addXP,
  incrementWordsLearned,
  markChestOpened,
  markBookRead,
} from '../../store/slices/playerSlice.js';
import { addFsrsCard } from '../../store/slices/vocabularySlice.js';
import { updateQuestProgress, completeQuest, checkPrerequisites } from '../../store/slices/questSlice.js';
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
import NotificationToast from '../HUD/NotificationToast.jsx';
import DialogueOverlay from '../NPC/DialogueOverlay.jsx';
import QuizOverlay from '../Quiz/QuizOverlay.jsx';
import QuestLog from '../Quest/QuestLog.jsx';
import SignOverlay from '../World/SignOverlay.jsx';

const gameLayoutStyle = {
  width: '100%',
  height: '100%',
  position: 'relative',
};

function PauseMenu({ onResume, onMainMenu }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(26, 26, 46, 0.85)',
      }}
    >
      <div
        style={{
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '18px',
          color: '#D4A843',
          marginBottom: '32px',
        }}
      >
        Paused
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={onResume}
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '11px',
            padding: '14px 28px',
            background: '#D4A843',
            color: '#1A1A2E',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Resume
        </button>
        <button
          onClick={onMainMenu}
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '11px',
            padding: '14px 28px',
            background: 'transparent',
            color: '#D4A843',
            border: '2px solid #D4A843',
            cursor: 'pointer',
          }}
        >
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
  const { playSFX } = useAudio();

  const dialogueOpen = useSelector((state) => state.ui.dialogueOpen);
  const dialogueConfig = useSelector((state) => state.ui.dialogueConfig);
  const quizOpen = useSelector((state) => state.ui.quizOpen);
  const menuOpen = useSelector((state) => state.ui.menuOpen);
  const signOpen = useSelector((state) => state.ui.signOpen);
  const fsrsCards = useSelector((state) => state.vocabulary.fsrsCards);
  const quests = useSelector((state) => state.quests.quests);

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
    };

    const handleZoneChange = ({ zone }) => {
      dispatch(setCurrentZone(zone));
    };

    const handleOpenQuiz = (quizConfig) => {
      dispatch(openQuiz(quizConfig));
    };

    const handleOpenAlphabet = () => {
      navigate('/alphabet');
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

    EventBus.on('npc-interact', handleNpcInteract);
    EventBus.on('zone-change', handleZoneChange);
    EventBus.on('open-quiz', handleOpenQuiz);
    EventBus.on('open-alphabet', handleOpenAlphabet);
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
      EventBus.off('show-sign', handleShowSign);
      EventBus.off('bookshelf-interact', handleBookshelfInteract);
      EventBus.off('chest-opened', handleChestOpened);
      EventBus.off('chest-empty', handleChestEmpty);
      EventBus.off('check-zone-unlock', handleCheckZoneUnlock);
      EventBus.off('zone-transition', handleZoneTransition);
      EventBus.off('fast-travel', handleFastTravel);
      EventBus.off('sfx-correct', handleSfxCorrect);
      EventBus.off('sfx-wrong', handleSfxWrong);
      EventBus.off('sfx-wordlearned', handleSfxWordlearned);
      EventBus.off('sfx-levelup', handleSfxLevelup);
      EventBus.off('sfx-quest', handleSfxQuest);
      EventBus.off('sfx-click', handleSfxClick);
    };
  }, [dispatch, fsrsCards, quests, playSFX]);

  return (
    <div style={gameLayoutStyle}>
      {/* Phaser canvas - full screen, lowest z-index */}
      <PhaserGame ref={phaserRef} />

      {/* HUD overlay bar */}
      <HUD onMenu={() => dispatch(toggleMenu())} />

      {/* Toast notifications */}
      <NotificationToast />

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
            // Use EventBus to navigate to prevent circular dependencies
            window.location.href = '/';
          }}
        />
      )}

      {/* Outlet for nested routes (e.g., /game/map) */}
      <Outlet />
    </div>
  );
}
