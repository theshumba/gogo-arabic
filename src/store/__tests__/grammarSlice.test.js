import { describe, it, expect, beforeEach, vi } from 'vitest';
import grammarReducer, {
  startLesson,
  completeLesson,
  recordExerciseProgress,
  recordQuizProgress,
  clearCurrentLesson,
  resetGrammarProgress,
  unlockNextLesson,
  selectCompletedLessons,
  selectLessonScores,
  selectCurrentLessonId,
  selectGrammarProgress,
  selectLessonScore,
  selectIsLessonCompleted,
  selectUnlockedLessons,
  selectIsLessonUnlocked,
  selectLessonsByCategory,
} from '../slices/grammarSlice.js';

// Mock the grammar lessons data
vi.mock('../../data/grammar.js', () => ({
  grammarLessons: [
    { id: 'lesson1', category: 'nouns', order: 1 },
    { id: 'lesson2', category: 'nouns', order: 2 },
    { id: 'lesson3', category: 'verbs', order: 3 },
    { id: 'lesson4', category: 'verbs', order: 4 },
  ],
  grammarCategories: [
    { id: 'nouns', name: 'Nouns' },
    { id: 'verbs', name: 'Verbs' },
  ],
}));

describe('grammarSlice', () => {
  let initialState;

  beforeEach(() => {
    initialState = grammarReducer(undefined, { type: 'unknown' });
  });

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(initialState).toEqual({
        completedLessons: [],
        unlockedLessons: ['al-definite'],
        lessonScores: {},
        currentLessonId: null,
      });
    });

    it('should include al-definite in unlockedLessons', () => {
      expect(initialState.unlockedLessons).toEqual(['al-definite']);
    });
  });

  describe('startLesson', () => {
    it('should set current lesson ID', () => {
      const state = grammarReducer(initialState, startLesson('lesson1'));

      expect(state.currentLessonId).toBe('lesson1');
    });

    it('should replace existing current lesson', () => {
      const startState = { ...initialState, currentLessonId: 'lesson1' };
      const state = grammarReducer(startState, startLesson('lesson2'));

      expect(state.currentLessonId).toBe('lesson2');
    });
  });

  describe('completeLesson', () => {
    it('should mark lesson as completed and store scores', () => {
      const payload = {
        lessonId: 'lesson1',
        exerciseScore: 85,
        quizScore: 90,
      };
      const state = grammarReducer(initialState, completeLesson(payload));

      expect(state.completedLessons).toContain('lesson1');
      expect(state.lessonScores['lesson1']).toBeDefined();
      expect(state.lessonScores['lesson1'].exerciseScore).toBe(85);
      expect(state.lessonScores['lesson1'].quizScore).toBe(90);
      expect(state.lessonScores['lesson1'].attempts).toBe(1);
      expect(state.lessonScores['lesson1'].lastAttempt).toBeDefined();
    });

    it('should not duplicate lesson in completedLessons', () => {
      const startState = {
        ...initialState,
        completedLessons: ['lesson1'],
      };

      const state = grammarReducer(
        startState,
        completeLesson({ lessonId: 'lesson1', exerciseScore: 80, quizScore: 85 })
      );

      expect(state.completedLessons).toEqual(['lesson1']);
      expect(state.completedLessons).toHaveLength(1);
    });

    it('should keep best scores across multiple attempts', () => {
      // First attempt
      let state = grammarReducer(
        initialState,
        completeLesson({ lessonId: 'lesson1', exerciseScore: 70, quizScore: 75 })
      );

      // Second attempt with better exercise score
      state = grammarReducer(
        state,
        completeLesson({ lessonId: 'lesson1', exerciseScore: 85, quizScore: 70 })
      );

      expect(state.lessonScores['lesson1'].exerciseScore).toBe(85);
      expect(state.lessonScores['lesson1'].quizScore).toBe(75);
      expect(state.lessonScores['lesson1'].attempts).toBe(2);
    });

    it('should increment attempts counter', () => {
      let state = grammarReducer(
        initialState,
        completeLesson({ lessonId: 'lesson1', exerciseScore: 80, quizScore: 85 })
      );

      state = grammarReducer(
        state,
        completeLesson({ lessonId: 'lesson1', exerciseScore: 90, quizScore: 95 })
      );

      expect(state.lessonScores['lesson1'].attempts).toBe(2);
    });
  });

  describe('recordExerciseProgress', () => {
    it('should record exercise score for new lesson', () => {
      const state = grammarReducer(
        initialState,
        recordExerciseProgress({ lessonId: 'lesson1', score: 75 })
      );

      expect(state.lessonScores['lesson1']).toBeDefined();
      expect(state.lessonScores['lesson1'].exerciseScore).toBe(75);
      expect(state.lessonScores['lesson1'].quizScore).toBe(0);
    });

    it('should update exercise score if better', () => {
      const startState = {
        ...initialState,
        lessonScores: {
          lesson1: {
            exerciseScore: 70,
            quizScore: 80,
            attempts: 0,
            lastAttempt: null,
          },
        },
      };

      const state = grammarReducer(
        startState,
        recordExerciseProgress({ lessonId: 'lesson1', score: 85 })
      );

      expect(state.lessonScores['lesson1'].exerciseScore).toBe(85);
      expect(state.lessonScores['lesson1'].quizScore).toBe(80);
    });

    it('should not update exercise score if worse', () => {
      const startState = {
        ...initialState,
        lessonScores: {
          lesson1: {
            exerciseScore: 90,
            quizScore: 80,
            attempts: 0,
            lastAttempt: null,
          },
        },
      };

      const state = grammarReducer(
        startState,
        recordExerciseProgress({ lessonId: 'lesson1', score: 70 })
      );

      expect(state.lessonScores['lesson1'].exerciseScore).toBe(90);
    });
  });

  describe('recordQuizProgress', () => {
    it('should record quiz score for new lesson', () => {
      const state = grammarReducer(
        initialState,
        recordQuizProgress({ lessonId: 'lesson1', score: 85 })
      );

      expect(state.lessonScores['lesson1']).toBeDefined();
      expect(state.lessonScores['lesson1'].quizScore).toBe(85);
      expect(state.lessonScores['lesson1'].exerciseScore).toBe(0);
    });

    it('should update quiz score if better', () => {
      const startState = {
        ...initialState,
        lessonScores: {
          lesson1: {
            exerciseScore: 80,
            quizScore: 75,
            attempts: 0,
            lastAttempt: null,
          },
        },
      };

      const state = grammarReducer(
        startState,
        recordQuizProgress({ lessonId: 'lesson1', score: 90 })
      );

      expect(state.lessonScores['lesson1'].quizScore).toBe(90);
      expect(state.lessonScores['lesson1'].exerciseScore).toBe(80);
    });

    it('should not update quiz score if worse', () => {
      const startState = {
        ...initialState,
        lessonScores: {
          lesson1: {
            exerciseScore: 80,
            quizScore: 95,
            attempts: 0,
            lastAttempt: null,
          },
        },
      };

      const state = grammarReducer(
        startState,
        recordQuizProgress({ lessonId: 'lesson1', score: 80 })
      );

      expect(state.lessonScores['lesson1'].quizScore).toBe(95);
    });
  });

  describe('clearCurrentLesson', () => {
    it('should clear current lesson ID', () => {
      const startState = { ...initialState, currentLessonId: 'lesson1' };
      const state = grammarReducer(startState, clearCurrentLesson());

      expect(state.currentLessonId).toBeNull();
    });

    it('should not affect completed lessons or scores', () => {
      const startState = {
        ...initialState,
        currentLessonId: 'lesson1',
        completedLessons: ['lesson1', 'lesson2'],
        lessonScores: {
          lesson1: { exerciseScore: 85, quizScore: 90, attempts: 1 },
        },
      };

      const state = grammarReducer(startState, clearCurrentLesson());

      expect(state.currentLessonId).toBeNull();
      expect(state.completedLessons).toEqual(['lesson1', 'lesson2']);
      expect(state.lessonScores).toEqual(startState.lessonScores);
    });
  });

  describe('resetGrammarProgress', () => {
    it('should reset all grammar progress', () => {
      const startState = {
        completedLessons: ['lesson1', 'lesson2'],
        unlockedLessons: ['lesson1', 'lesson2', 'lesson3'],
        lessonScores: {
          lesson1: { exerciseScore: 85, quizScore: 90, attempts: 2 },
          lesson2: { exerciseScore: 80, quizScore: 85, attempts: 1 },
        },
        currentLessonId: 'lesson3',
      };

      const state = grammarReducer(startState, resetGrammarProgress());

      expect(state).toEqual(initialState);
    });

    it('should reset unlockedLessons to [\'al-definite\']', () => {
      const startState = {
        completedLessons: ['lesson1'],
        unlockedLessons: ['lesson1', 'lesson2'],
        lessonScores: {},
        currentLessonId: null,
      };

      const state = grammarReducer(startState, resetGrammarProgress());

      expect(state.unlockedLessons).toEqual(['al-definite']);
    });
  });

  describe('unlockNextLesson', () => {
    it('should unlock the next lesson by order', () => {
      const startState = {
        ...initialState,
        unlockedLessons: ['lesson1'],
        completedLessons: ['lesson1'],
      };
      const state = grammarReducer(startState, unlockNextLesson({ completedLessonId: 'lesson1' }));
      expect(state.unlockedLessons).toContain('lesson2');
    });

    it('should not duplicate an already-unlocked lesson', () => {
      const startState = {
        ...initialState,
        unlockedLessons: ['lesson1', 'lesson2'],
        completedLessons: ['lesson1'],
      };
      const state = grammarReducer(startState, unlockNextLesson({ completedLessonId: 'lesson1' }));
      expect(state.unlockedLessons.filter(id => id === 'lesson2')).toHaveLength(1);
    });

    it('should handle completing the last lesson gracefully', () => {
      const startState = {
        ...initialState,
        unlockedLessons: ['lesson1', 'lesson2', 'lesson3', 'lesson4'],
        completedLessons: ['lesson1', 'lesson2', 'lesson3', 'lesson4'],
      };
      const state = grammarReducer(startState, unlockNextLesson({ completedLessonId: 'lesson4' }));
      // No crash, no new lesson added
      expect(state.unlockedLessons).toHaveLength(4);
    });

    it('should handle unknown lesson ID gracefully', () => {
      const state = grammarReducer(initialState, unlockNextLesson({ completedLessonId: 'nonexistent' }));
      expect(state.unlockedLessons).toEqual(['al-definite']);
    });

    it('should unlock across categories (lesson1 nouns → lesson2 nouns by order)', () => {
      const startState = {
        ...initialState,
        unlockedLessons: ['lesson1'],
        completedLessons: ['lesson1'],
      };
      const state = grammarReducer(startState, unlockNextLesson({ completedLessonId: 'lesson1' }));
      // lesson2 has order 2 (next after order 1), regardless of category
      expect(state.unlockedLessons).toContain('lesson2');
    });
  });

  describe('selectors', () => {
    const mockState = {
      grammar: {
        completedLessons: ['lesson1', 'lesson2'],
        unlockedLessons: ['lesson1', 'lesson2'],
        lessonScores: {
          lesson1: {
            exerciseScore: 85,
            quizScore: 90,
            attempts: 2,
            lastAttempt: '2026-02-09T00:00:00Z',
          },
          lesson2: {
            exerciseScore: 75,
            quizScore: 80,
            attempts: 1,
            lastAttempt: '2026-02-08T00:00:00Z',
          },
        },
        currentLessonId: 'lesson3',
      },
    };

    it('selectCompletedLessons should return completed lessons array', () => {
      const lessons = selectCompletedLessons(mockState);
      expect(lessons).toEqual(['lesson1', 'lesson2']);
    });

    it('selectLessonScores should return lesson scores object', () => {
      const scores = selectLessonScores(mockState);
      expect(scores).toEqual(mockState.grammar.lessonScores);
    });

    it('selectCurrentLessonId should return current lesson ID', () => {
      const lessonId = selectCurrentLessonId(mockState);
      expect(lessonId).toBe('lesson3');
    });

    it('selectGrammarProgress should calculate percentage', () => {
      // Mock has 2 completed out of 4 total lessons = 50%
      const progress = selectGrammarProgress(mockState);
      expect(progress).toBe(50);
    });

    it('selectLessonScore should return score for specific lesson', () => {
      const score = selectLessonScore('lesson1')(mockState);
      expect(score).toEqual({
        exerciseScore: 85,
        quizScore: 90,
        attempts: 2,
        lastAttempt: '2026-02-09T00:00:00Z',
      });
    });

    it('selectLessonScore should return null for non-existent lesson', () => {
      const score = selectLessonScore('nonexistent')(mockState);
      expect(score).toBeNull();
    });

    it('selectIsLessonCompleted should return true for completed lesson', () => {
      const isCompleted = selectIsLessonCompleted('lesson1')(mockState);
      expect(isCompleted).toBe(true);
    });

    it('selectIsLessonCompleted should return false for incomplete lesson', () => {
      const isCompleted = selectIsLessonCompleted('lesson3')(mockState);
      expect(isCompleted).toBe(false);
    });

    it('selectLessonsByCategory should annotate isUnlocked on lesson objects', () => {
      const lessonsByCategory = selectLessonsByCategory(mockState);
      const nounLessons = lessonsByCategory['nouns'];
      expect(nounLessons).toBeDefined();
      const lesson1 = nounLessons.find(l => l.id === 'lesson1');
      expect(lesson1).toBeDefined();
      expect(lesson1.isUnlocked).toBe(true);
    });

    it('selectLessonsByCategory should mark locked lessons as isUnlocked: false', () => {
      const lessonsByCategory = selectLessonsByCategory(mockState);
      const verbLessons = lessonsByCategory['verbs'];
      expect(verbLessons).toBeDefined();
      const lesson3 = verbLessons.find(l => l.id === 'lesson3');
      expect(lesson3).toBeDefined();
      expect(lesson3.isUnlocked).toBe(false);
    });
  });

  describe('selectors - unlockedLessons', () => {
    it('selectUnlockedLessons returns unlockedLessons array', () => {
      const mockState = { grammar: { ...initialState, unlockedLessons: ['lesson1', 'lesson2'] } };
      expect(selectUnlockedLessons(mockState)).toEqual(['lesson1', 'lesson2']);
    });

    it('selectIsLessonUnlocked returns true for unlocked lesson', () => {
      const mockState = { grammar: { ...initialState, unlockedLessons: ['lesson1'] } };
      expect(selectIsLessonUnlocked('lesson1')(mockState)).toBe(true);
    });

    it('selectIsLessonUnlocked returns false for locked lesson', () => {
      const mockState = { grammar: { ...initialState, unlockedLessons: ['lesson1'] } };
      expect(selectIsLessonUnlocked('lesson3')(mockState)).toBe(false);
    });
  });
});
