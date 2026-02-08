/**
 * Adaptive word selection based on player progression
 * Weights word selection by difficulty (1=easy, 2=medium, 3=hard) based on player level/words learned
 */
import { shuffle } from './shuffle.js';

/**
 * Get difficulty weights based on player progression
 * @param {number} playerLevel - Current player level
 * @param {number} wordsLearned - Number of words learned so far
 * @returns {Object} Weights for each difficulty level {1: weight, 2: weight, 3: weight}
 */
export function getDifficultyWeights(playerLevel, wordsLearned) {
  // Early game (level 1-3 or <50 words learned): 70% difficulty 1, 25% difficulty 2, 5% difficulty 3
  if (playerLevel <= 3 || wordsLearned < 50) {
    return { 1: 0.70, 2: 0.25, 3: 0.05 };
  }

  // Mid game (level 4-7 or 50-200 words): 40% difficulty 1, 40% difficulty 2, 20% difficulty 3
  if (playerLevel <= 7 || wordsLearned < 200) {
    return { 1: 0.40, 2: 0.40, 3: 0.20 };
  }

  // Late game (level 8+ or 200+ words): 25% difficulty 1, 40% difficulty 2, 35% difficulty 3
  return { 1: 0.25, 2: 0.40, 3: 0.35 };
}

/**
 * Select random words weighted by difficulty based on player progression
 * @param {Array} words - Array of word objects with difficulty field
 * @param {number} count - Number of words to select
 * @param {number} playerLevel - Current player level
 * @param {number} wordsLearned - Number of words learned
 * @returns {Array} Selected words
 */
export function selectWordsByDifficulty(words, count, playerLevel, wordsLearned) {
  const weights = getDifficultyWeights(playerLevel, wordsLearned);

  // Group words by difficulty
  const wordsByDifficulty = {
    1: words.filter(w => w.difficulty === 1),
    2: words.filter(w => w.difficulty === 2),
    3: words.filter(w => w.difficulty === 3),
  };

  // Calculate how many words to select from each difficulty level
  const counts = {
    1: Math.round(count * weights[1]),
    2: Math.round(count * weights[2]),
    3: Math.round(count * weights[3]),
  };

  // Adjust counts to ensure we get exactly 'count' words
  const total = counts[1] + counts[2] + counts[3];
  if (total < count) {
    // Add remaining to difficulty 2 (medium)
    counts[2] += (count - total);
  } else if (total > count) {
    // Remove excess from difficulty 1 (easy)
    counts[1] -= (total - count);
  }

  // Select random words from each difficulty level
  const selected = [];

  for (const difficulty of [1, 2, 3]) {
    const pool = wordsByDifficulty[difficulty];
    const neededCount = counts[difficulty];

    if (pool.length === 0) continue;

    // Shuffle and take needed amount (or all if pool is smaller)
    selected.push(...shuffle(pool).slice(0, Math.min(neededCount, pool.length)));
  }

  // If we don't have enough words, fill with any remaining words
  if (selected.length < count) {
    const remaining = words.filter(w => !selected.includes(w));
    selected.push(...shuffle(remaining).slice(0, count - selected.length));
  }

  // Shuffle final selection and return
  return shuffle(selected).slice(0, count);
}
