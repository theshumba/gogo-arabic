/**
 * learningProgressMiddleware.js
 *
 * Wires learning events to CEFR progress and skill tree XP.
 * Scaffolded in Phase 56; populated in Phases 57-59.
 *
 * Kept separate from achievementMiddleware to avoid switch/case bloat.
 */

export const learningProgressMiddleware = (_store) => (next) => (action) => {
  return next(action);
};
