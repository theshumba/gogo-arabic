import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  openDialogue,
  openQuiz,
  openSign,
  showNotification,
} from '../store/slices/uiSlice.js';
import {
  setCurrentZone,
  unlockZone,
  addDirhams,
  addXP,
  incrementWordsLearned,
  markChestOpened,
  markBookRead,
} from '../store/slices/playerSlice.js';
import {
  addFsrsCard,
} from '../store/slices/vocabularySlice.js';
import {
  updateQuestProgress,
  completeQuest,
  checkPrerequisites,
  visitNpc,
  visitZone,
  recordChestOpened,
} from '../store/slices/questSlice.js';
import { createNewCard } from '../services/fsrs.js';
import { XP_REWARDS } from '../utils/xpCalculator.js';
import vocabulary from '../data/vocabularyAll.js';
import questsData from '../data/quests.json';
import { EventBus } from '../utils/eventBus.js';
import { EVENTS } from '../utils/eventBusTypes.js';
import { audioManager } from '../services/audio.js';
import { store } from '../store/store.js';
import { ZONES } from '../data/zones.js';
import { ZONE_BGM_MAP } from '../data/audioConfig.js';

/**
 * useEventBusListeners
 * Sets up all EventBus listeners for Phaser <-> React communication
 */
export function useEventBusListeners(phaserRef, playSFX, navigate) {
  const dispatch = useDispatch();
  const fsrsCards = useSelector((state) => state.vocabulary.fsrsCards);
  const quests = useSelector((state) => state.quests.quests);
  const newAchievements = useSelector((state) => state.achievements.newAchievements);
  const prevAchievementCountRef = useRef(0);

  // Track word learned for quest progress
  const trackWordLearned = (category) => {
    // Map word categories to quest trackEvents
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

    // Update category-specific quest
    if (event) {
      for (const qd of questsData) {
        if (qd.trackEvent === event && quests[qd.id]?.status === 'active') {
          dispatch(updateQuestProgress({ questId: qd.id, amount: 1 }));
          // Check if quest is now complete
          const current = (quests[qd.id]?.progress || 0) + 1;
          if (current >= qd.target) {
            dispatch(completeQuest(qd.id));
            dispatch(showNotification({ message: `Quest complete: ${qd.title}`, type: 'quest' }));
            dispatch(checkPrerequisites(questsData));
          }
        }
      }
    }

    // Always update "word_learned_any" quests
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

      // Play zone-specific BGM
      const bgmTrack = ZONE_BGM_MAP[zone];
      if (bgmTrack) {
        audioManager.playBGM(bgmTrack);
      }

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
      audioManager.pauseBGM();
      dispatch(openQuiz(quizConfig));
    };

    const handleOpenAlphabet = () => {
      navigate('/alphabet');
    };

    const handleOpenReviewSession = () => {
      navigate('/review');
    };

    const handleOpenWorldMap = () => {
      navigate('/game/map');
    };

    const handleShowSign = ({ arabic, english }) => {
      playSFX('bookopen');
      dispatch(openSign({ arabic, english }));
    };

    const handleBookshelfInteract = ({ category, id, reread }) => {
      playSFX('bookflip');
      // Persist that this bookshelf has been read
      if (!reread) {
        dispatch(markBookRead(id));
      }
      // Find a random word from this category that the player hasn't learned
      const categoryWords = vocabulary.filter((w) => w.category === category);
      const unknownWords = categoryWords.filter((w) => !fsrsCards[w.id]);
      const pool = unknownWords.length > 0 ? unknownWords : categoryWords;
      const word = pool[Math.floor(Math.random() * pool.length)];

      if (word && !reread) {
        // Teach the word if it's new
        if (!fsrsCards[word.id]) {
          dispatch(addFsrsCard({ wordId: word.id, card: createNewCard() }));
          dispatch(incrementWordsLearned());
          dispatch(addXP(XP_REWARDS.NEW_WORD));
          // Track quest progress
          trackWordLearned(word.category);
        }
        dispatch(showNotification({
          message: `${word.arabic} — ${word.english}`,
          type: 'word',
        }));
      } else if (reread) {
        dispatch(showNotification({
          message: `${word.arabic} — ${word.english}`,
          type: 'word',
        }));
      }
      EventBus.emit(EVENTS.PLAYER_UNFREEZE);
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
      dispatch(showNotification({
        message: 'Already opened!',
        type: 'dirhams',
      }));
    };

    const handleDoorLocked = ({ message }) => {
      playSFX('wrong');
      dispatch(showNotification({
        message: message || 'This door is locked.',
        type: 'quest',
      }));
    };

    const handleCheckZoneUnlock = ({ zoneName, entryX, entryY, unlock }) => {
      // If no unlock requirement, allow transition
      if (!unlock) {
        EventBus.emit(EVENTS.ZONE_TRANSITION, { zoneName, entryX, entryY });
        return;
      }
      // Check quest completion
      if (unlock.quest && quests[unlock.quest]?.status !== 'completed') {
        const qd = questsData.find((q) => q.id === unlock.quest);
        playSFX('wrong');
        dispatch(showNotification({
          message: `Locked! Complete: ${qd?.title || unlock.quest}`,
          type: 'quest',
        }));
        return;
      }
      // Check level
      const playerState = store.getState().player;
      if (unlock.minLevel && playerState.level < unlock.minLevel) {
        playSFX('wrong');
        dispatch(showNotification({
          message: `Locked! Need level ${unlock.minLevel}`,
          type: 'quest',
        }));
        return;
      }
      // Check words learned
      if (unlock.minWords && playerState.wordsLearned < unlock.minWords) {
        playSFX('wrong');
        dispatch(showNotification({
          message: `Locked! Need ${unlock.minWords} words learned`,
          type: 'quest',
        }));
        return;
      }
      // All checks passed — unlock the zone and transition
      dispatch(unlockZone(zoneName));
      EventBus.emit(EVENTS.ZONE_TRANSITION, { zoneName, entryX, entryY });
    };

    const handleZoneTransition = ({ zoneName, entryX, entryY }) => {
      playSFX('transition');
      // Get the WorldScene's zoneTransition system and trigger it
      const game = phaserRef.current?.game;
      if (game) {
        const worldScene = game.scene.getScene('WorldScene');
        if (worldScene?.zoneTransition) {
          worldScene.zoneTransition.transitionTo(zoneName, entryX, entryY);
        }
      }
    };

    const handleFastTravel = ({ zoneName }) => {
      // Fast travel from world map — get spawn point from zone data
      const zone = ZONES[zoneName];
      if (!zone) return;
      const entryX = zone.spawnPoint.x * 64;
      const entryY = zone.spawnPoint.y * 64;
      // Get the WorldScene's zoneTransition and trigger it
      const game = phaserRef.current?.game;
      if (game) {
        const worldScene = game.scene.getScene('WorldScene');
        if (worldScene?.zoneTransition) {
          worldScene.zoneTransition.transitionTo(zoneName, entryX, entryY);
        }
      }
    };

    // SFX event handlers (emitted by UI components) + VFX triggers
    const handleSfxCorrect = () => {
      playSFX('correct');
      EventBus.emit(EVENTS.VFX_SHAKE, { intensity: 'light' });
    };
    const handleSfxWrong = () => playSFX('wrong');
    const handleSfxWordlearned = () => playSFX('wordlearned');
    const handleSfxLevelup = () => {
      playSFX('levelup');
      EventBus.emit(EVENTS.VFX_SHAKE, { intensity: 'heavy' });
      EventBus.emit(EVENTS.VFX_PARTICLES_BURST, { config: { count: 30, tint: 0xe2b659 } });
      EventBus.emit(EVENTS.VFX_PARTICLES_CONTINUOUS, { config: { duration: 3000, tint: 0xe2b659 } });
    };
    const handleSfxQuest = () => playSFX('quest');
    const handleSfxClick = () => playSFX('click');

    // BGM resume when quiz closes
    const handleQuizClosed = () => audioManager.resumeBGM();

    EventBus.on(EVENTS.NPC_INTERACT, handleNpcInteract);
    EventBus.on(EVENTS.ZONE_CHANGE, handleZoneChange);
    EventBus.on(EVENTS.QUIZ_OPEN, handleOpenQuiz);
    EventBus.on(EVENTS.ALPHABET_OPEN, handleOpenAlphabet);
    EventBus.on(EVENTS.REVIEW_SESSION_OPEN, handleOpenReviewSession);
    EventBus.on(EVENTS.WORLD_MAP_OPEN, handleOpenWorldMap);
    EventBus.on(EVENTS.SIGN_SHOW, handleShowSign);
    EventBus.on(EVENTS.BOOKSHELF_INTERACT, handleBookshelfInteract);
    EventBus.on(EVENTS.CHEST_OPENED, handleChestOpened);
    EventBus.on(EVENTS.CHEST_EMPTY, handleChestEmpty);
    EventBus.on(EVENTS.DOOR_LOCKED, handleDoorLocked);
    EventBus.on(EVENTS.ZONE_CHECK_UNLOCK, handleCheckZoneUnlock);
    EventBus.on(EVENTS.ZONE_TRANSITION, handleZoneTransition);
    EventBus.on(EVENTS.FAST_TRAVEL, handleFastTravel);
    EventBus.on(EVENTS.SFX_CORRECT, handleSfxCorrect);
    EventBus.on(EVENTS.SFX_WRONG, handleSfxWrong);
    EventBus.on(EVENTS.SFX_WORDLEARNED, handleSfxWordlearned);
    EventBus.on(EVENTS.SFX_LEVELUP, handleSfxLevelup);
    EventBus.on(EVENTS.SFX_QUEST, handleSfxQuest);
    EventBus.on(EVENTS.SFX_CLICK, handleSfxClick);
    EventBus.on(EVENTS.QUIZ_CLOSED, handleQuizClosed);

    return () => {
      EventBus.off(EVENTS.NPC_INTERACT, handleNpcInteract);
      EventBus.off(EVENTS.ZONE_CHANGE, handleZoneChange);
      EventBus.off(EVENTS.QUIZ_OPEN, handleOpenQuiz);
      EventBus.off(EVENTS.ALPHABET_OPEN, handleOpenAlphabet);
      EventBus.off(EVENTS.REVIEW_SESSION_OPEN, handleOpenReviewSession);
      EventBus.off(EVENTS.WORLD_MAP_OPEN, handleOpenWorldMap);
      EventBus.off(EVENTS.SIGN_SHOW, handleShowSign);
      EventBus.off(EVENTS.BOOKSHELF_INTERACT, handleBookshelfInteract);
      EventBus.off(EVENTS.CHEST_OPENED, handleChestOpened);
      EventBus.off(EVENTS.CHEST_EMPTY, handleChestEmpty);
      EventBus.off(EVENTS.DOOR_LOCKED, handleDoorLocked);
      EventBus.off(EVENTS.ZONE_CHECK_UNLOCK, handleCheckZoneUnlock);
      EventBus.off(EVENTS.ZONE_TRANSITION, handleZoneTransition);
      EventBus.off(EVENTS.FAST_TRAVEL, handleFastTravel);
      EventBus.off(EVENTS.SFX_CORRECT, handleSfxCorrect);
      EventBus.off(EVENTS.SFX_WRONG, handleSfxWrong);
      EventBus.off(EVENTS.SFX_WORDLEARNED, handleSfxWordlearned);
      EventBus.off(EVENTS.SFX_LEVELUP, handleSfxLevelup);
      EventBus.off(EVENTS.SFX_QUEST, handleSfxQuest);
      EventBus.off(EVENTS.SFX_CLICK, handleSfxClick);
      EventBus.off(EVENTS.QUIZ_CLOSED, handleQuizClosed);
    };
  }, [dispatch, fsrsCards, quests, playSFX, phaserRef, navigate]);

  // VFX on achievement unlock -- fires when newAchievements array grows
  useEffect(() => {
    if (newAchievements.length > prevAchievementCountRef.current) {
      EventBus.emit(EVENTS.VFX_SHAKE, { intensity: 'medium' });
      EventBus.emit(EVENTS.VFX_PARTICLES_BURST, { config: { count: 25, tint: 0xffd700 } });
    }
    prevAchievementCountRef.current = newAchievements.length;
  }, [newAchievements]);
}
