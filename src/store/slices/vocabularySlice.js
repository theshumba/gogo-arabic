import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  fsrsCards: {}, // { wordId: { card: FSRS card object, log: last review log, source?: string } }
  reviewQueue: [], // word IDs due for review
  stats: { totalReviews: 0, accuracy: 0, streakDays: 0 },
  npcTeacherMap: {}, // { wordId: npcId } — maps word to the NPC who taught it
};

const vocabularySlice = createSlice({
  name: 'vocabulary',
  initialState,
  reducers: {
    addFsrsCard(state, action) {
      // payload: { wordId, card, source? }
      const { wordId, card, source } = action.payload;
      state.fsrsCards[wordId] = { card, log: null, source: source || null };
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

    associateWordWithNpc(state, action) {
      // payload: { wordId, npcId }
      const { wordId, npcId } = action.payload;
      if (!state.npcTeacherMap[wordId]) {
        state.npcTeacherMap[wordId] = npcId;
      }
    },

  },
});

export const {
  addFsrsCard,
  updateFsrsCard,
  setReviewQueue,
  updateStats,
  associateWordWithNpc,
} = vocabularySlice.actions;

// ========== MEMOIZED SELECTORS ==========

// Select FSRS cards
export const selectFsrsCards = (state) => state.vocabulary.fsrsCards;

// Select review queue
export const selectReviewQueue = (state) => state.vocabulary.reviewQueue;

// Select review queue count (memoized)
export const selectReviewQueueCount = createSelector(
  [selectReviewQueue],
  (queue) => queue.length
);

// Select learned word count (memoized)
export const selectLearnedWordCount = createSelector(
  [selectFsrsCards],
  (cards) => Object.keys(cards).length
);

// Select vocabulary stats
export const selectVocabularyStats = (state) => state.vocabulary.stats;

// Select NPC teacher map
export const selectNpcTeacherMap = (state) => state.vocabulary.npcTeacherMap;

// Select all words taught by a specific NPC (memoized)
export const selectNpcVocabulary = createSelector(
  [selectNpcTeacherMap, (_state, npcId) => npcId],
  (npcTeacherMap, npcId) =>
    Object.entries(npcTeacherMap)
      .filter(([, teacherNpcId]) => teacherNpcId === npcId)
      .map(([wordId]) => wordId)
);

// Select vocab mastery by zone (memoized)
// Requires zoneVocabCategories map: { zoneId: [categories] }
const ZONE_VOCAB_CATEGORIES = {
  oasis_village: ['greetings', 'trade'],
  ancient_library: ['numbers', 'colors', 'phrases'],
  desert_marketplace: ['trade', 'food', 'numbers'],
  farmland: ['nature', 'animals', 'body', 'verbs_basic'],
  bedouin_camp: ['time', 'phrases', 'adjectives'],
  mountain_village: ['clothing', 'animals', 'adjectives'],
  coastal_port: ['directions', 'trade', 'food'],
  royal_palace: ['adjectives', 'colors', 'phrases'],
};

export const selectVocabMasteryByZone = createSelector(
  [selectFsrsCards, (_state, zoneId) => zoneId],
  (cards, zoneId) => {
    const categories = ZONE_VOCAB_CATEGORIES[zoneId] || [];
    if (categories.length === 0) return { known: 0, total: 0, percentage: 0 };
    // We count how many FSRS cards the player has for words in these categories
    // Since we don't have the full vocab list here, we count learned words only
    const learnedWordIds = Object.keys(cards);
    // This selector returns the count of zone-relevant learned words
    // (full total requires vocabulary data — computed in components)
    return { known: learnedWordIds.length, categories };
  }
);

/**
 * Select vocabulary words not yet in FSRS, sorted by CEFR level then frequency descending.
 * Used for new card introduction: players always encounter high-frequency words first.
 *
 * @param {Object} state - Redux state
 * @param {Array} allWords - Full vocabulary array (from vocabularyAll.js)
 * @param {number} limit - Max cards to return (default 20)
 */
export const selectNewCardsByFrequency = createSelector(
  [selectFsrsCards, (_state, allWords) => allWords, (_state, _words, limit) => limit ?? 20],
  (cards, allWords, limit) => {
    const CEFR_ORDER = { A1: 1, A2: 2, B1: 3, B2: 4 };
    const unseenWords = allWords.filter((w) => !cards[w.id]);
    return unseenWords
      .sort((a, b) => {
        // Primary: CEFR level ascending (A1 before A2 before B1 before B2)
        const cefrA = CEFR_ORDER[a.cefrLevel] ?? 5;
        const cefrB = CEFR_ORDER[b.cefrLevel] ?? 5;
        if (cefrA !== cefrB) return cefrA - cefrB;
        // Secondary: frequency descending within same CEFR level (higher freq = show first)
        return (b.frequency ?? 0) - (a.frequency ?? 0);
      })
      .slice(0, limit);
  }
);

export default vocabularySlice.reducer;
