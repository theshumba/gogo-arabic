/**
 * relationshipDecayMiddleware.test.js — CRITICAL #6 regression coverage.
 *
 * Before the fix, `_lastDecayDate` lived in module scope and reset on every
 * page reload, so the middleware applied a full day of friendship decay every
 * cold start (multiple times per real day on a heavy-use session). The fix
 * persists the date in `state.npc.lastDecayDate` and gates on that.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import {
  relationshipDecayMiddleware,
  getDayKey,
} from '../relationshipDecayMiddleware.js';
import npcReducer, {
  setFriendship,
  setLastDecayDate,
} from '../../slices/npcSlice.js';
import dailyGoalsReducer, {
  startSession,
} from '../../slices/dailyGoalsSlice.js';

function makeStore() {
  return configureStore({
    reducer: { npc: npcReducer, dailyGoals: dailyGoalsReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(relationshipDecayMiddleware),
  });
}

beforeEach(() => {
  vi.useRealTimers();
});

describe('relationshipDecayMiddleware — persisted lastDecayDate', () => {
  it('writes today\'s dayKey to state.npc.lastDecayDate after running', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-15T10:00:00.000Z'));

    const store = makeStore();
    store.dispatch(setFriendship({ npcId: 'amira', value: 80 }));

    store.dispatch(startSession());

    expect(store.getState().npc.lastDecayDate).toBe('2026-05-15');
  });

  it('does NOT re-apply decay on a second startSession the same UTC day (reload simulation)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-15T10:00:00.000Z'));

    const store = makeStore();
    store.dispatch(setFriendship({ npcId: 'amira', value: 80 }));

    store.dispatch(startSession());
    const afterFirstRun = store.getState().npc.friendship.amira;

    // Simulate a page reload: persisted lastDecayDate survives;
    // module-scope state is irrelevant because we removed it.
    store.dispatch(startSession());
    const afterSecondRun = store.getState().npc.friendship.amira;

    expect(afterSecondRun).toBe(afterFirstRun);
  });

  it('applies decay again on a new UTC day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-15T10:00:00.000Z'));

    const store = makeStore();
    store.dispatch(setFriendship({ npcId: 'amira', value: 80 }));

    store.dispatch(startSession());
    const afterDay1 = store.getState().npc.friendship.amira;

    // Roll forward to next UTC day.
    vi.setSystemTime(new Date('2026-05-16T08:00:00.000Z'));
    store.dispatch(startSession());
    const afterDay2 = store.getState().npc.friendship.amira;

    expect(afterDay2).toBeLessThanOrEqual(afterDay1);
    expect(store.getState().npc.lastDecayDate).toBe('2026-05-16');
  });

  it('respects a manually-seeded lastDecayDate from persisted state', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-15T10:00:00.000Z'));

    const store = makeStore();
    store.dispatch(setFriendship({ npcId: 'amira', value: 80 }));
    // Simulate restored persisted state where decay already ran today.
    store.dispatch(setLastDecayDate('2026-05-15'));

    const before = store.getState().npc.friendship.amira;
    store.dispatch(startSession());
    const after = store.getState().npc.friendship.amira;

    expect(after).toBe(before); // no decay this cold start
  });

  it('seeds lastDecayDate when no NPC friendships exist (empty-state path)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-15T10:00:00.000Z'));

    const store = makeStore();
    store.dispatch(startSession());
    expect(store.getState().npc.lastDecayDate).toBe('2026-05-15');
  });
});

describe('relationshipDecayMiddleware — helpers', () => {
  it('getDayKey returns ISO yyyy-mm-dd', () => {
    expect(getDayKey(new Date('2026-05-15T23:59:59.000Z'))).toBe('2026-05-15');
  });
});
