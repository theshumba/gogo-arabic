import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  openSign,
  showNotification,
} from '../store/slices/uiSlice.js';
import {
  addDirhams,
  addXP,
  incrementWordsLearned,
  markChestOpened,
  markBookRead,
} from '../store/slices/playerSlice.js';
import { addFsrsCard } from '../store/slices/vocabularySlice.js';
import {
  updateQuestProgress,
  completeQuest,
  checkPrerequisites,
  recordChestOpened,
} from '../store/slices/questSlice.js';
import { createNewCard } from '../services/fsrs.js';
import { XP_REWARDS } from '../utils/xpCalculator.js';
import vocabulary from '../data/vocabularyAll.js';
import questsData from '../data/quests.json';
import { EventBus } from '../utils/eventBus.js';
import { EVENTS } from '../utils/eventBusTypes.js';
import { store } from '../store/store.js';

/**
 * useObjectEvents — Sign, bookshelf, chest, and door event handlers
 */
export function useObjectEvents(playSFX) {
  const dispatch = useDispatch();
  const fsrsCards = useSelector((state) => state.vocabulary.fsrsCards);
  const quests = useSelector((state) => state.quests.quests);

  useEffect(() => {
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

      // Update category-specific quest
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

    EventBus.on(EVENTS.SIGN_SHOW, handleShowSign);
    EventBus.on(EVENTS.BOOKSHELF_INTERACT, handleBookshelfInteract);
    EventBus.on(EVENTS.CHEST_OPENED, handleChestOpened);
    EventBus.on(EVENTS.CHEST_EMPTY, handleChestEmpty);
    EventBus.on(EVENTS.DOOR_LOCKED, handleDoorLocked);

    return () => {
      EventBus.off(EVENTS.SIGN_SHOW, handleShowSign);
      EventBus.off(EVENTS.BOOKSHELF_INTERACT, handleBookshelfInteract);
      EventBus.off(EVENTS.CHEST_OPENED, handleChestOpened);
      EventBus.off(EVENTS.CHEST_EMPTY, handleChestEmpty);
      EventBus.off(EVENTS.DOOR_LOCKED, handleDoorLocked);
    };
  }, [dispatch, fsrsCards, quests, playSFX]);
}
