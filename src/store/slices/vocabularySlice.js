import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  words: [], // loaded from vocabulary-final.json
  fsrsCards: {}, // { wordId: { card: FSRS card object, log: last review log } }
  reviewQueue: [], // word IDs due for review
  stats: { totalReviews: 0, accuracy: 0, streakDays: 0 },
};

const vocabularySlice = createSlice({
  name: 'vocabulary',
  initialState,
  reducers: {
    loadWords(state, action) {
      // payload: array of word objects from vocabulary-final.json
      state.words = action.payload;
    },

    addFsrsCard(state, action) {
      // payload: { wordId, card }
      const { wordId, card } = action.payload;
      state.fsrsCards[wordId] = { card, log: null };
    },

    updateFsrsCard(state, action) {
      // payload: { wordId, card, log }
      const { wordId, card, log } = action.payload;
      if (state.fsrsCards[wordId]) {
        state.fsrsCards[wordId].card = card;
        state.fsrsCards[wordId].log = log;
      } else {
        state.fsrsCards[wordId] = { card, log };
      }
    },

    setReviewQueue(state, action) {
      // payload: array of word IDs
      state.reviewQueue = action.payload;
    },

    updateStats(state, action) {
      // payload: { totalReviews?, accuracy?, streakDays? }
      state.stats = { ...state.stats, ...action.payload };
    },

    markWordLearned(state, action) {
      // payload: wordId
      const wordId = action.payload;
      const word = state.words.find((w) => w.id === wordId);
      if (word) {
        word.learned = true;
      }
    },
  },
});

export const {
  loadWords,
  addFsrsCard,
  updateFsrsCard,
  setReviewQueue,
  updateStats,
  markWordLearned,
} = vocabularySlice.actions;

export default vocabularySlice.reducer;
