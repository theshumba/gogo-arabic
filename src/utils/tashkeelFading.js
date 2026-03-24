/**
 * Tashkeel (diacritics) fading based on FSRS mastery.
 *
 * As a player masters an Arabic word, the vowel marks (tashkeel) progressively
 * fade, training the player to read without diacritics — the way native Arabic
 * text is typically written.
 *
 * Stability thresholds (FSRS stability value):
 *   - stability < 3:  Full diacritics (opacity 1.0) — still learning
 *   - stability 3-9:  Fading diacritics (opacity 0.6) — intermediate
 *   - stability 10-29: Dim diacritics (opacity 0.3) — well-known
 *   - stability >= 30: Hidden diacritics (opacity 0) — mastered
 */

// Unicode ranges for Arabic diacritical marks (tashkeel)
const DIACRITIC_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/;

/**
 * Calculate diacritic opacity based on FSRS stability.
 * @param {number|null} stability - FSRS stability value (null = new word = full opacity)
 * @returns {number} Opacity value 0-1
 */
export function getDiacriticOpacity(stability) {
  if (stability == null || stability < 3) return 1.0;
  if (stability < 10) return 0.6;
  if (stability < 30) return 0.3;
  return 0;
}

/**
 * Split Arabic text into base characters and diacritics for rendering.
 * Returns an array of { char, isDiacritic } objects.
 *
 * @param {string} text - Arabic text with diacritics
 * @returns {Array<{char: string, isDiacritic: boolean}>}
 */
export function splitTashkeel(text) {
  if (!text) return [];
  const result = [];
  for (const char of text) {
    result.push({
      char,
      isDiacritic: DIACRITIC_REGEX.test(char),
    });
  }
  return result;
}

/**
 * Check if text contains any diacritical marks.
 * @param {string} text
 * @returns {boolean}
 */
export function hasDiacritics(text) {
  return DIACRITIC_REGEX.test(text);
}
