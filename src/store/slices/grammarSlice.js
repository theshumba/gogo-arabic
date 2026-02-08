import { createSlice, createSelector } from '@reduxjs/toolkit';
import { grammarLessons } from '../../data/grammar.js';

const initialState = {
  completedLessons: [], // array of lesson IDs
  lessonScores: {}, // { lessonId: { exerciseScore, quizScore, attempts, lastAttempt } }
  currentLessonId: null,
};

const grammarSlice = createSlice({
  name: 'grammar',
  initialState,
  reducers: {
    startLesson(state, action) {
      state.currentLessonId = action.payload;
    },

    completeLesson(state, action) {
      // payload: { lessonId, exerciseScore, quizScore }
      const { lessonId, exerciseScore, quizScore } = action.payload;

      if (!state.completedLessons.includes(lessonId)) {
        state.completedLessons.push(lessonId);
      }

      if (!state.lessonScores[lessonId]) {
        state.lessonScores[lessonId] = {
          exerciseScore: 0,
          quizScore: 0,
          attempts: 0,
          lastAttempt: null,
        };
      }

      const lessonScore = state.lessonScores[lessonId];
      lessonScore.attempts += 1;
      lessonScore.lastAttempt = new Date().toISOString();

      // Keep best scores
      if (exerciseScore > lessonScore.exerciseScore) {
        lessonScore.exerciseScore = exerciseScore;
      }
      if (quizScore > lessonScore.quizScore) {
        lessonScore.quizScore = quizScore;
      }
    },

    recordExerciseProgress(state, action) {
      // payload: { lessonId, score }
      const { lessonId, score } = action.payload;

      if (!state.lessonScores[lessonId]) {
        state.lessonScores[lessonId] = {
          exerciseScore: 0,
          quizScore: 0,
          attempts: 0,
          lastAttempt: null,
        };
      }

      if (score > state.lessonScores[lessonId].exerciseScore) {
        state.lessonScores[lessonId].exerciseScore = score;
      }
    },

    recordQuizProgress(state, action) {
      // payload: { lessonId, score }
      const { lessonId, score } = action.payload;

      if (!state.lessonScores[lessonId]) {
        state.lessonScores[lessonId] = {
          exerciseScore: 0,
          quizScore: 0,
          attempts: 0,
          lastAttempt: null,
        };
      }

      if (score > state.lessonScores[lessonId].quizScore) {
        state.lessonScores[lessonId].quizScore = score;
      }
    },

    clearCurrentLesson(state) {
      state.currentLessonId = null;
    },

    resetGrammarProgress(state) {
      state.completedLessons = [];
      state.lessonScores = {};
      state.currentLessonId = null;
    },
  },
});

export const {
  startLesson,
  completeLesson,
  recordExerciseProgress,
  recordQuizProgress,
  clearCurrentLesson,
  resetGrammarProgress,
} = grammarSlice.actions;

// ========== SELECTORS ==========

export const selectCompletedLessons = (state) => state.grammar.completedLessons;
export const selectLessonScores = (state) => state.grammar.lessonScores;
export const selectCurrentLessonId = (state) => state.grammar.currentLessonId;

// Calculate overall grammar progress (percentage)
export const selectGrammarProgress = createSelector(
  [selectCompletedLessons],
  (completedLessons) => {
    const totalLessons = grammarLessons.length;
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons.length / totalLessons) * 100);
  }
);

// Get lesson score for a specific lesson
export const selectLessonScore = (lessonId) => (state) => {
  return state.grammar.lessonScores[lessonId] || null;
};

// Check if lesson is completed
export const selectIsLessonCompleted = (lessonId) => (state) => {
  return state.grammar.completedLessons.includes(lessonId);
};

// Get lessons by category with completion status
export const selectLessonsByCategory = createSelector(
  [selectCompletedLessons, selectLessonScores],
  (completedLessons, lessonScores) => {
    const lessonsByCategory = {};

    grammarLessons.forEach((lesson) => {
      if (!lessonsByCategory[lesson.category]) {
        lessonsByCategory[lesson.category] = [];
      }

      lessonsByCategory[lesson.category].push({
        ...lesson,
        isCompleted: completedLessons.includes(lesson.id),
        score: lessonScores[lesson.id] || null,
      });
    });

    // Sort lessons within each category by order
    Object.keys(lessonsByCategory).forEach((category) => {
      lessonsByCategory[category].sort((a, b) => a.order - b.order);
    });

    return lessonsByCategory;
  }
);

export default grammarSlice.reducer;
