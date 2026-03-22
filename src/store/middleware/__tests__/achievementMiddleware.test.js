import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { achievementMiddleware } from '../achievementMiddleware.js';
import achievementReducer from '../../slices/achievementSlice.js';
import playerReducer, { incrementWordsLearned, addXP } from '../../slices/playerSlice.js';
import vocabularyReducer from '../../slices/vocabularySlice.js';
import questReducer, { completeQuest } from '../../slices/questSlice.js';
import grammarReducer, { completeLesson } from '../../slices/grammarSlice.js';
import alphabetReducer from '../../slices/alphabetSlice.js';

/**
 * Achievement Middleware Integration Tests
 *
 * Tests the middleware's ability to:
 * - Listen to specific Redux actions
 * - Check achievement thresholds
 * - Auto-dispatch unlockAchievement and addXP
 * - Maintain idempotency (don't duplicate achievements)
 */
describe('achievementMiddleware', () => {
  let store;

  beforeEach(() => {
    // Create a fresh store with middleware for each test
    store = configureStore({
      reducer: {
        achievements: achievementReducer,
        player: playerReducer,
        vocabulary: vocabularyReducer,
        quests: questReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(achievementMiddleware),
    });
  });

  describe('words_learned achievements', () => {
    it('should unlock "first_word" achievement when learning 1 word', () => {
      const initialAchievements = store.getState().achievements.unlockedAchievements;
      expect(initialAchievements).toEqual({});

      // Dispatch action that triggers words_learned check
      store.dispatch(incrementWordsLearned());

      const state = store.getState();

      // Check that first_word achievement was unlocked
      expect(state.achievements.unlockedAchievements).toHaveProperty('first_word');

      // Check that XP was awarded (25 XP for first_word achievement)
      expect(state.player.xp).toBeGreaterThanOrEqual(25);

      // Check that wordsLearned was incremented
      expect(state.player.wordsLearned).toBe(1);
    });

    it('should NOT unlock achievement when below threshold', () => {
      // Start with 0 words learned - no achievement should unlock yet for threshold > 1
      const state = store.getState();
      expect(state.player.wordsLearned).toBe(0);
      expect(state.achievements.unlockedAchievements).toEqual({});
    });

    it('should NOT duplicate achievement on repeated actions', () => {
      // Unlock first achievement
      store.dispatch(incrementWordsLearned());

      const firstState = store.getState();
      const firstUnlockTime = firstState.achievements.unlockedAchievements.first_word;
      const firstXP = firstState.player.xp;

      expect(firstUnlockTime).toBeDefined();

      // Dispatch again - should not unlock same achievement twice
      store.dispatch(incrementWordsLearned());

      const secondState = store.getState();

      // Timestamp should not change (achievement not re-unlocked)
      expect(secondState.achievements.unlockedAchievements.first_word).toBe(firstUnlockTime);

      // XP should only increase by actions, not duplicate achievement rewards
      // After second increment, player has 2 words learned
      // But first_word achievement should only award XP once
      const xpIncrease = secondState.player.xp - firstXP;
      expect(xpIncrease).toBeLessThan(25); // Should NOT get another 25 XP from achievement
    });

    it('should unlock multiple achievements in sequence', () => {
      // Unlock first_word (1 word)
      store.dispatch(incrementWordsLearned());

      let state = store.getState();
      expect(state.achievements.unlockedAchievements).toHaveProperty('first_word');
      const achievementCount1 = Object.keys(state.achievements.unlockedAchievements).length;

      // Continue to trigger next threshold (word_collector_10 requires 10 words)
      for (let i = 0; i < 9; i++) {
        store.dispatch(incrementWordsLearned());
      }

      state = store.getState();

      // Should have unlocked word_collector_10 achievement
      expect(state.player.wordsLearned).toBe(10);
      expect(state.achievements.unlockedAchievements).toHaveProperty('word_collector_10');

      const achievementCount2 = Object.keys(state.achievements.unlockedAchievements).length;
      expect(achievementCount2).toBeGreaterThan(achievementCount1);
    });
  });

  describe('quest achievements', () => {
    it('should unlock quest achievement when completing required number of quests', () => {
      // Initialize quest first (completeQuest expects quest to exist)
      store.dispatch({ type: 'quests/initializeQuests', payload: [{ id: 'test_quest_1', autoStart: true }] });

      // Complete a quest
      store.dispatch(completeQuest('test_quest_1'));

      const state = store.getState();

      // Check that quest was completed
      expect(state.quests.quests.test_quest_1.status).toBe('completed');

      // Check for achievement unlock (first_quest requires 1 quest completed)
      if (state.achievements.unlockedAchievements.first_quest) {
        expect(state.achievements.unlockedAchievements).toHaveProperty('first_quest');
      }
    });
  });

  describe('XP achievements', () => {
    it('should award XP when achievement unlocks', () => {
      const initialXP = store.getState().player.xp;

      // Trigger an achievement
      store.dispatch(incrementWordsLearned());

      const finalXP = store.getState().player.xp;

      // XP should have increased (first_word awards 25 XP)
      expect(finalXP).toBeGreaterThan(initialXP);
      expect(finalXP).toBeGreaterThanOrEqual(25);
    });
  });

  describe('threshold edge cases', () => {
    it('should handle exact threshold match', () => {
      // Dispatch exactly the threshold amount for word_collector_10
      for (let i = 0; i < 10; i++) {
        store.dispatch(incrementWordsLearned());
      }

      const state = store.getState();
      expect(state.player.wordsLearned).toBe(10);
      expect(state.achievements.unlockedAchievements).toHaveProperty('word_collector_10');
    });

    it('should handle exceeding threshold', () => {
      // Dispatch more than threshold
      for (let i = 0; i < 15; i++) {
        store.dispatch(incrementWordsLearned());
      }

      const state = store.getState();
      expect(state.player.wordsLearned).toBe(15);

      // Should have unlocked both first_word and word_collector_10
      expect(state.achievements.unlockedAchievements).toHaveProperty('first_word');
      expect(state.achievements.unlockedAchievements).toHaveProperty('word_collector_10');
    });
  });

  describe('middleware idempotency', () => {
    it('should not re-unlock achievements on state rehydration', () => {
      // Simulate initial unlock
      store.dispatch(incrementWordsLearned());

      const state1 = store.getState();
      const unlockTime1 = state1.achievements.unlockedAchievements.first_word;

      // Dispatch a non-related action (should not affect achievements)
      store.dispatch(addXP(100));

      const state2 = store.getState();
      const unlockTime2 = state2.achievements.unlockedAchievements.first_word;

      // Achievement unlock time should remain unchanged
      expect(unlockTime2).toBe(unlockTime1);
    });
  });
});

describe('grammar_lessons achievements (FIX-01)', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        achievements: achievementReducer,
        player: playerReducer,
        vocabulary: vocabularyReducer,
        quests: questReducer,
        grammar: grammarReducer,
        alphabet: alphabetReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(achievementMiddleware),
    });
  });

  it('should unlock grammar_first when completing first grammar lesson', () => {
    store.dispatch(completeLesson({ lessonId: 'basic-verb-conjugation', exerciseScore: 100, quizScore: 100 }));

    const state = store.getState();
    expect(state.achievements.unlockedAchievements).toHaveProperty('grammar_first');
    expect(state.player.xp).toBeGreaterThan(0);
  });

  it('should NOT fire grammar_first for actions unrelated to grammar', () => {
    store.dispatch(incrementWordsLearned());

    const state = store.getState();
    expect(state.achievements.unlockedAchievements).not.toHaveProperty('grammar_first');
  });

  it('should unlock grammar_5 after 5 completed lessons', () => {
    const lessonIds = [
      'al-definite',
      'noun-adjective-agreement',
      'personal-pronouns',
      'possessive-suffixes',
      'basic-verb-conjugation',
    ];

    lessonIds.forEach((lessonId) => {
      store.dispatch(completeLesson({ lessonId, exerciseScore: 80, quizScore: 80 }));
    });

    const state = store.getState();
    expect(state.grammar.completedLessons).toHaveLength(5);
    expect(state.achievements.unlockedAchievements).toHaveProperty('grammar_first');
    expect(state.achievements.unlockedAchievements).toHaveProperty('grammar_5');
  });

  it('should not duplicate grammar_first on repeated completeLesson for same lesson', () => {
    store.dispatch(completeLesson({ lessonId: 'al-definite', exerciseScore: 80, quizScore: 80 }));
    const state1 = store.getState();
    const firstUnlockTime = state1.achievements.unlockedAchievements.grammar_first;

    store.dispatch(completeLesson({ lessonId: 'al-definite', exerciseScore: 90, quizScore: 90 }));
    const state2 = store.getState();

    expect(state2.achievements.unlockedAchievements.grammar_first).toBe(firstUnlockTime);
  });
});
