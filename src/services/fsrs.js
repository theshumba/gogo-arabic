import { createEmptyCard, fsrs, generatorParameters, Rating } from 'ts-fsrs';
import { shuffle } from '../utils/shuffle.js';

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

export { Rating };
