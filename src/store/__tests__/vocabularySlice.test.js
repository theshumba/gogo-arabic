import { describe, it, expect, beforeEach } from 'vitest';
import vocabularyReducer, {
  loadWords,
  addFsrsCard,
  updateFsrsCard,
  setReviewQueue,
  updateStats,
  markWordLearned,
  selectFsrsCards,
  selectReviewQueue,
  selectReviewQueueCount,
  selectLearnedWordCount,
  selectVocabularyStats,
} from '../slices/vocabularySlice.js';

describe('vocabularySlice', () => {
  let initialState;

  beforeEach(() => {
    initialState = {
      words: [],
      fsrsCards: {},
      reviewQueue: [],
      stats: { totalReviews: 0, accuracy: 0, streakDays: 0 },
    };
  });

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(vocabularyReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('loadWords', () => {
    it('should load vocabulary words', () => {
      const words = [
        { id: 1, arabic: 'كتاب', english: 'book' },
        { id: 2, arabic: 'قلم', english: 'pen' },
      ];
      const state = vocabularyReducer(initialState, loadWords(words));
      expect(state.words).toEqual(words);
      expect(state.words).toHaveLength(2);
    });

    it('should replace existing words', () => {
      const oldWords = [{ id: 1, arabic: 'old', english: 'old' }];
      const newWords = [{ id: 2, arabic: 'new', english: 'new' }];

      let state = vocabularyReducer(initialState, loadWords(oldWords));
      state = vocabularyReducer(state, loadWords(newWords));

      expect(state.words).toEqual(newWords);
      expect(state.words).toHaveLength(1);
    });
  });

  describe('addFsrsCard', () => {
    it('should add new FSRS card for word', () => {
      const card = { due: new Date().toISOString(), reps: 0, lapses: 0 };
      const state = vocabularyReducer(initialState, addFsrsCard({ wordId: 'word1', card }));

      expect(state.fsrsCards).toHaveProperty('word1');
      expect(state.fsrsCards.word1.card).toEqual(card);
      expect(state.fsrsCards.word1.log).toBeNull();
    });

    it('should add multiple cards for different words', () => {
      const card1 = { due: new Date().toISOString(), reps: 0 };
      const card2 = { due: new Date().toISOString(), reps: 0 };

      let state = vocabularyReducer(initialState, addFsrsCard({ wordId: 'word1', card: card1 }));
      state = vocabularyReducer(state, addFsrsCard({ wordId: 'word2', card: card2 }));

      expect(Object.keys(state.fsrsCards)).toHaveLength(2);
      expect(state.fsrsCards.word1).toBeDefined();
      expect(state.fsrsCards.word2).toBeDefined();
    });
  });

  describe('updateFsrsCard', () => {
    it('should update existing FSRS card', () => {
      const initialCard = { due: new Date().toISOString(), reps: 0 };
      const startState = {
        ...initialState,
        fsrsCards: { word1: { card: initialCard, log: null } },
      };

      const updatedCard = { due: new Date().toISOString(), reps: 1 };
      const log = { rating: 3, timestamp: new Date() };

      const state = vocabularyReducer(
        startState,
        updateFsrsCard({ wordId: 'word1', card: updatedCard, log })
      );

      expect(state.fsrsCards.word1.card).toEqual(updatedCard);
      expect(state.fsrsCards.word1.log).toEqual(log);
    });

    it('should create new card entry if word does not exist', () => {
      const card = { due: new Date().toISOString(), reps: 1 };
      const log = { rating: 3 };

      const state = vocabularyReducer(
        initialState,
        updateFsrsCard({ wordId: 'newWord', card, log })
      );

      expect(state.fsrsCards.newWord).toBeDefined();
      expect(state.fsrsCards.newWord.card).toEqual(card);
      expect(state.fsrsCards.newWord.log).toEqual(log);
    });
  });

  describe('setReviewQueue', () => {
    it('should set review queue', () => {
      const queue = ['word1', 'word2', 'word3'];
      const state = vocabularyReducer(initialState, setReviewQueue(queue));

      expect(state.reviewQueue).toEqual(queue);
    });

    it('should replace existing queue', () => {
      const startState = { ...initialState, reviewQueue: ['old1', 'old2'] };
      const newQueue = ['new1', 'new2', 'new3'];

      const state = vocabularyReducer(startState, setReviewQueue(newQueue));

      expect(state.reviewQueue).toEqual(newQueue);
      expect(state.reviewQueue).not.toContain('old1');
    });
  });

  describe('updateStats', () => {
    it('should update vocabulary stats', () => {
      const state = vocabularyReducer(
        initialState,
        updateStats({ totalReviews: 10, accuracy: 0.85 })
      );

      expect(state.stats.totalReviews).toBe(10);
      expect(state.stats.accuracy).toBe(0.85);
    });

    it('should merge with existing stats', () => {
      const startState = {
        ...initialState,
        stats: { totalReviews: 5, accuracy: 0.8, streakDays: 3 },
      };

      const state = vocabularyReducer(startState, updateStats({ totalReviews: 10 }));

      expect(state.stats.totalReviews).toBe(10);
      expect(state.stats.accuracy).toBe(0.8);
      expect(state.stats.streakDays).toBe(3);
    });
  });

  describe('markWordLearned', () => {
    it('should mark word as learned', () => {
      const words = [
        { id: 'word1', arabic: 'كتاب', english: 'book', learned: false },
        { id: 'word2', arabic: 'قلم', english: 'pen', learned: false },
      ];

      const startState = { ...initialState, words };
      const state = vocabularyReducer(startState, markWordLearned('word1'));

      const word = state.words.find(w => w.id === 'word1');
      expect(word.learned).toBe(true);
    });

    it('should not affect other words', () => {
      const words = [
        { id: 'word1', arabic: 'كتاب', english: 'book' },
        { id: 'word2', arabic: 'قلم', english: 'pen' },
      ];

      const startState = { ...initialState, words };
      const state = vocabularyReducer(startState, markWordLearned('word1'));

      const word2 = state.words.find(w => w.id === 'word2');
      expect(word2.learned).toBeUndefined();
    });

    it('should handle marking non-existent word gracefully', () => {
      const words = [{ id: 'word1', arabic: 'كتاب' }];
      const startState = { ...initialState, words };

      const state = vocabularyReducer(startState, markWordLearned('nonexistent'));

      expect(state.words).toHaveLength(1);
    });
  });

  describe('selectors', () => {
    const mockState = {
      vocabulary: {
        words: [
          { id: 'word1', arabic: 'كتاب' },
          { id: 'word2', arabic: 'قلم' },
        ],
        fsrsCards: {
          word1: { card: { reps: 5 }, log: null },
          word2: { card: { reps: 3 }, log: null },
          word3: { card: { reps: 1 }, log: null },
        },
        reviewQueue: ['word1', 'word2', 'word4'],
        stats: { totalReviews: 50, accuracy: 0.9, streakDays: 7 },
      },
    };

    it('selectFsrsCards should return FSRS cards object', () => {
      const cards = selectFsrsCards(mockState);
      expect(cards).toEqual(mockState.vocabulary.fsrsCards);
      expect(Object.keys(cards)).toHaveLength(3);
    });

    it('selectReviewQueue should return review queue', () => {
      const queue = selectReviewQueue(mockState);
      expect(queue).toEqual(['word1', 'word2', 'word4']);
    });

    it('selectReviewQueueCount should return queue length', () => {
      const count = selectReviewQueueCount(mockState);
      expect(count).toBe(3);
    });

    it('selectLearnedWordCount should return number of cards', () => {
      const count = selectLearnedWordCount(mockState);
      expect(count).toBe(3); // word1, word2, word3 have cards
    });

    it('selectVocabularyStats should return stats object', () => {
      const stats = selectVocabularyStats(mockState);
      expect(stats).toEqual({
        totalReviews: 50,
        accuracy: 0.9,
        streakDays: 7,
      });
    });
  });
});
