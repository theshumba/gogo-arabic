import { describe, it, expect } from 'vitest';
import { State } from 'ts-fsrs';
import { getAffixMultiplier, getUnlearnedAffixes } from '../affixMatcher.js';

// ts-fsrs numeric State enum: New=0, Learning=1, Review=2, Relearning=3.
// The vocabulary slice stores FSRS entries as { card, log } wrappers —
// so vocabularyState.fsrsCards[id] = { card: { state: 2, ... }, log: {...} }.

describe('affixMatcher', () => {
  describe('getAffixMultiplier', () => {
    // REGRESSION: the old code accessed entry.state directly (skipping the .card
    // wrapper) and compared against the string 'Review'. Both bugs combined so that
    // every affix always returned 0.5 regardless of mastery.

    it('returns 1.0 for learned word (FSRS State.Review = 2, correct { card } wrapper)', () => {
      const vocabularyState = {
        fsrsCards: {
          word_sharp: { card: { state: State.Review }, log: {} },
        },
      };

      const multiplier = getAffixMultiplier('word_sharp', vocabularyState);
      expect(multiplier).toBe(1.0);
    });

    it('returns 0.5 for unlearned word (FSRS State.Learning = 1)', () => {
      const vocabularyState = {
        fsrsCards: {
          word_sharp: { card: { state: State.Learning }, log: {} },
        },
      };

      const multiplier = getAffixMultiplier('word_sharp', vocabularyState);
      expect(multiplier).toBe(0.5);
    });

    it('returns 0.5 for word in New state (State.New = 0)', () => {
      const vocabularyState = {
        fsrsCards: {
          word_sharp: { card: { state: State.New }, log: {} },
        },
      };

      const multiplier = getAffixMultiplier('word_sharp', vocabularyState);
      expect(multiplier).toBe(0.5);
    });

    it('returns 0.5 for word in Relearning state (State.Relearning = 3)', () => {
      const vocabularyState = {
        fsrsCards: {
          word_sharp: { card: { state: State.Relearning }, log: {} },
        },
      };

      const multiplier = getAffixMultiplier('word_sharp', vocabularyState);
      expect(multiplier).toBe(0.5);
    });

    it('returns 0.5 for undiscovered word (no FSRS card)', () => {
      const vocabularyState = {
        fsrsCards: {},
      };

      const multiplier = getAffixMultiplier('word_sharp', vocabularyState);
      expect(multiplier).toBe(0.5);
    });

    it('handles missing vocabulary state gracefully', () => {
      const vocabularyState = {};

      const multiplier = getAffixMultiplier('word_sharp', vocabularyState);
      expect(multiplier).toBe(0.5);
    });

    it('handles null fsrsCards gracefully', () => {
      const vocabularyState = {
        fsrsCards: null,
      };

      const multiplier = getAffixMultiplier('word_sharp', vocabularyState);
      expect(multiplier).toBe(0.5);
    });

    it('handles undefined vocabularyState gracefully', () => {
      const multiplier = getAffixMultiplier('word_sharp', { fsrsCards: undefined });
      expect(multiplier).toBe(0.5);
    });

    it('returns 0.5 when entry exists but inner card is missing', () => {
      // Edge case: entry wrapper present but no .card property
      const vocabularyState = {
        fsrsCards: {
          word_sharp: { log: {} }, // no .card
        },
      };

      const multiplier = getAffixMultiplier('word_sharp', vocabularyState);
      expect(multiplier).toBe(0.5);
    });

    it('uses numeric enum — string "Review" does NOT trigger 1.0', () => {
      // Regression guard: ensure we never compare card.state === 'Review' (string)
      const vocabularyState = {
        fsrsCards: {
          word_sharp: { card: { state: 'Review' }, log: {} }, // wrong type (string)
        },
      };

      // State.Review is 2 (number). 'Review' !== 2, so should return 0.5.
      const multiplier = getAffixMultiplier('word_sharp', vocabularyState);
      expect(multiplier).toBe(0.5);
    });
  });

  describe('getUnlearnedAffixes', () => {
    it('returns empty array (placeholder implementation)', () => {
      // Current implementation returns [] to avoid circular dependency
      const vocabularyState = {
        fsrsCards: {},
      };

      const result = getUnlearnedAffixes('simple_kufi', vocabularyState);
      expect(result).toEqual([]);
    });

    it('handles missing vocabularyState', () => {
      const result = getUnlearnedAffixes('simple_kufi', undefined);
      expect(result).toEqual([]);
    });
  });
});
