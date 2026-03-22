import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { learningProgressMiddleware } from '../learningProgressMiddleware.js';
import playerReducer, { addXP } from '../../slices/playerSlice.js';

describe('learningProgressMiddleware scaffold', () => {
  it('passes all actions through without modification', () => {
    const store = configureStore({
      reducer: { player: playerReducer },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(learningProgressMiddleware),
    });

    store.dispatch(addXP(100));
    expect(store.getState().player.xp).toBe(100);
  });

  it('does not throw on any action type', () => {
    const store = configureStore({
      reducer: { player: playerReducer },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(learningProgressMiddleware),
    });

    const unknownActions = [
      { type: 'grammar/completeLesson', payload: {} },
      { type: 'quests/completeQuest', payload: 'test' },
      { type: 'vocabulary/addFsrsCard', payload: {} },
      { type: 'placement/recordPlacementResult', payload: { assignedLevel: 'A1', rawScore: 8 } },
    ];

    unknownActions.forEach((action) => {
      expect(() => store.dispatch(action)).not.toThrow();
    });
  });
});
