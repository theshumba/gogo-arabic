import { createEmptyCard, fsrs, generatorParameters, Rating } from 'ts-fsrs';
import { shuffle } from '../utils/shuffle.js';
import { selectNewCardsByPath } from '../store/slices/vocabularySlice.js';
import { store } from '../store/store.js';
import vocabulary from '../data/vocabularyAll.js';

const params = generatorParameters();
const scheduler = fsrs(params);

export function createNewCard() {
  return createEmptyCard();
}

export function reviewCard(card, rating) {
  // rating: 1=Again, 2=Hard, 3=Good, 4=Easy
  const ratingMap = { 1: Rating.Again, 2: Rating.Hard, 3: Rating.Good, 4: Rating.Easy };
  const result = scheduler.repeat(card, new Date());
  const selectedRating = ratingMap[rating] || Rating.Good;
  return result[selectedRating];
}

export function getDueCards(cards) {
  // cards: { wordId: { card, log } }
  // Returns array of wordIds whose cards are due for review (due date <= now)
  const now = new Date();
  return Object.entries(cards)
    .filter(([_, data]) => {
      if (!data.card || !data.card.due) return true; // New cards are always due
      return new Date(data.card.due) <= now;
    })
    .map(([wordId]) => wordId);
}

export function getSessionCards(cards, maxCards = 20) {
  const due = getDueCards(cards);
  // Shuffle and take up to maxCards
  return shuffle(due).slice(0, maxCards);
}

/**
 * Get new (unseen) cards ordered by learning path affinity for session introduction.
 * Used by ReviewSession to mix new cards into review when due cards are exhausted.
 * PATH-03: Scholar and Traveler see different first-encounter word sequences.
 * @param {number} maxCards - Maximum new cards to return (default 5)
 * @returns {string[]} Array of wordIds ordered by path affinity
 */
export function getNewCardsForSession(maxCards = 5) {
  const state = store.getState();
  const pathOrdered = selectNewCardsByPath(state, vocabulary, maxCards);
  return pathOrdered.map(w => w.id);
}

/**
 * Get FSRS retrievability for a card as a 0-1 float.
 * Returns 1.0 for new cards (reps=0).
 * @param {Object} card - FSRS card object from vocabulary state
 * @param {Date} [now] - reference date (defaults to current time)
 * @returns {number} 0-1 float (1 = perfectly retained)
 */
export function getRetrievability(card, now = new Date()) {
  if (!card || card.reps === 0 || !card.stability) return 1.0;
  return scheduler.get_retrievability(card, now, false);
}

export { Rating };
