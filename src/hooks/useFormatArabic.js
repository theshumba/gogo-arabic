import { useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { stripDiacritics } from '../utils/arabicUtils.js';

/**
 * Hook that returns a function to conditionally strip Arabic diacritics (harakat)
 * based on the user's showDiacritics setting.
 *
 * Enhanced to support progressive tashkeel fading based on word mastery.
 *
 * Usage:
 *   const formatArabic = useFormatArabic(); // Simple usage (backward compatible)
 *   <div>{formatArabic(someArabicText)}</div>
 *
 *   const { formatArabic, getTashkeelOpacity } = useFormatArabic(); // With mastery
 *   <div style={{ opacity: getTashkeelOpacity('word_123') }}>{someArabicText}</div>
 */
export function useFormatArabic() {
  const showDiacritics = useSelector((s) => s.settings.showDiacritics);
  const fsrsCards = useSelector((s) => s.vocabulary.fsrsCards);

  const formatArabic = useCallback(
    (text) => {
      if (!text || showDiacritics) return text;
      return stripDiacritics(text);
    },
    [showDiacritics]
  );

  /**
   * Calculate tashkeel opacity based on FSRS card mastery level.
   *
   * @param {string} wordId - The vocabulary word ID
   * @returns {number} Opacity value 0-1
   *
   * Mastery levels:
   * - Beginner (state 0-1, reps < 3): opacity 1.0 (full tashkeel)
   * - Learning (state 1-2, reps 3-6): opacity 0.5 (faded)
   * - Familiar (state 2, reps 7-12): opacity 0.25 (very faded)
   * - Mastered (state 2, reps > 12, stability > 30): opacity 0 (no tashkeel)
   */
  const getTashkeelOpacity = useCallback(
    (wordId) => {
      if (!wordId) return 1.0; // No wordId = show full tashkeel

      const fsrsCard = fsrsCards[wordId];
      if (!fsrsCard || !fsrsCard.card) return 1.0; // No card = show full tashkeel

      const { state, reps = 0, stability = 0 } = fsrsCard.card;

      // Beginner: new or early learning
      if (state === 0 || state === 1 || reps < 3) {
        return 1.0;
      }

      // Learning: making progress
      if (reps >= 3 && reps <= 6) {
        return 0.5;
      }

      // Familiar: well practiced
      if (reps >= 7 && reps <= 12) {
        return 0.25;
      }

      // Mastered: high reps and high stability
      if (reps > 12 && stability > 30) {
        return 0;
      }

      // Default for high reps but lower stability
      if (reps > 12) {
        return 0.15;
      }

      // Fallback
      return 1.0;
    },
    [fsrsCards]
  );

  // For backward compatibility, return just the function when destructured as before
  // But also expose getTashkeelOpacity for advanced usage
  const returnValue = formatArabic;
  returnValue.getTashkeelOpacity = getTashkeelOpacity;

  return returnValue;
}
