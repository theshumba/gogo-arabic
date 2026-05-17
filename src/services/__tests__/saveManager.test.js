/**
 * saveManager.test.js — Round-trip and migration tests for saveManager.
 *
 * Tests:
 * 1. round-trip preserves all saved slices
 * 2. TRANSIENT_SLICES are excluded from saves
 * 3. playtime reads totalPlayTime (capital T) from stats
 * 4. migrateState is idempotent for v1 saves
 * 5. v0 saves migrate to v1 correctly
 * 6. loading a save from a newer version throws
 * 7. quota-exceeded path propagates to caller
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  saveToSlot,
  loadSlot,
  deleteSlot,
  migrateState,
  SAVE_VERSION,
  SAVE_SLOTS,
} from '../saveManager.js';

// ─── localStorage mock ──────────────────────────────────────────────────────

const storage = {};
const mockLocalStorage = {
  getItem: (key) => storage[key] ?? null,
  setItem: (key, value) => { storage[key] = value; },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
};

beforeEach(() => {
  Object.keys(storage).forEach((k) => delete storage[k]);
  vi.stubGlobal('localStorage', mockLocalStorage);
  // TextEncoder / TextDecoder are available in the vitest jsdom/node env
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─── Minimal Redux store mock ────────────────────────────────────────────────

/**
 * Build a representative state object that mirrors the slices in store.js.
 * Only the keys matter for the round-trip test; values are stubs.
 */
function buildMockState(overrides = {}) {
  return {
    // Persisted — root localStorage
    player:             { name: 'Amira', level: 5, currentZone: 'oasis_village', xp: 250 },
    quests:             { activeQuests: [], completedQuests: [] },
    alphabet:           { learned: ['ا', 'ب'] },
    settings:           { isMuted: false, masterVolume: 70 },
    npc:                { friendship: {} },
    achievements:       { unlocked: ['first_word'] },
    dailyGoals:         { completed: 0 },
    grammar:            { completedLessons: ['al-definite'], unlockedLessons: ['al-definite'] },
    narrative:          { storyFlags: {}, choiceHistory: [] },
    economy:            { dirhams: 100 },
    arena:              { rating: 1000 },
    time:               { tick: 42 },
    weather:            { current: 'sunny' },
    home:               { placementGrid: [] },
    stats:              { totalPlayTime: 360, wordsLearnedAllTime: 50 },
    skillTree:          { unlockedNodes: {} },
    journal:            { entries: [] },
    codex:              { unlockedEntries: [] },
    endgame:            { phase: 0 },
    placement:          { hasCompleted: false },
    cefrProgress:       { currentLevel: 'A1' },
    analytics:          { sessionsThisWeek: 2 },
    event:              { active: null },
    lore:               { unlockedLore: [] },
    dailyChallenge:     { completed: false },
    reading:            { xp: 0 },
    writing:            { xp: 0 },
    conversation:       { xp: 0 },
    miniGame:           { highScores: {} },
    seasonalEvent:      { active: null },
    difficulty:         { current: 'normal' },
    leaderboard:        { weeklySnapshots: [] },
    onboarding2:        { step: 0 },
    extendedAnalytics:  { events: [] },
    phonetics:          { practiced: [] },
    idiom:              { learned: [] },
    linguisticCombat:   { wins: 0 },
    worldTime:          { hour: 8 },
    decks:              { active: null },
    alphabetProgress:   { mastered: [] },
    coreVocabulary:     { learned: [] },
    rootKnowledge:      { known: [] },
    foundation:         { completed: false },
    zoneVocabIntro:     { seen: {} },
    zoneIntro:          { seen: {} },
    zoneGrammar:        { active: null },
    // Persisted — nested IndexedDB
    vocabulary:         { fsrsCards: {}, learnedWords: [] },
    battle:             { history: [], wins: 0 },
    magic:              { spells: [] },
    inventory:          { items: [] },
    companions:         { active: [] },
    crafting:           { recipes: {} },
    worldState:         { flags: {} },
    faction:            { alignment: {} },
    poetry:             { poems: [] },
    // Transient — should be EXCLUDED from saves
    ui:                 { modal: null },
    sync:               { pending: [] },
    gossip:             { tokens: [] },
    notifications:      { items: [] },
    dailyQuest:         { quests: [] },
    analyticsEventQueue:{ queue: [] },
    microReview:        { pending: [] },
    ...overrides,
  };
}

function buildMockStore(stateOverrides = {}) {
  return { getState: () => buildMockState(stateOverrides) };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('saveManager — round-trip', () => {
  it('save then load returns the same non-transient slice values', async () => {
    const store = buildMockStore();
    const state = store.getState();

    await saveToSlot(1, store);
    const loaded = loadSlot(1);

    expect(loaded).not.toBeNull();
    const data = loaded.data;

    // Every non-transient slice present in state must survive the round-trip
    const TRANSIENT = new Set(['ui', 'sync', 'gossip', 'notifications', 'dailyQuest', 'analyticsEventQueue', 'microReview']);
    const persistedKeys = Object.keys(state).filter((k) => !TRANSIENT.has(k));

    for (const key of persistedKeys) {
      expect(data[key], `slice '${key}' missing after load`).toBeDefined();
      expect(data[key]).toEqual(state[key]);
    }
  });

  it('transient slices are NOT present in saved data', async () => {
    const store = buildMockStore();
    await saveToSlot(1, store);
    const loaded = loadSlot(1);

    const TRANSIENT = ['ui', 'sync', 'gossip', 'notifications', 'dailyQuest', 'analyticsEventQueue', 'microReview'];
    for (const key of TRANSIENT) {
      expect(loaded.data[key], `transient slice '${key}' should not be in save`).toBeUndefined();
    }
  });

  it('slot metadata captures correct playtime from stats.totalPlayTime', async () => {
    const store = buildMockStore({ stats: { totalPlayTime: 12345 } });
    await saveToSlot(2, store);
    const loaded = loadSlot(2);

    expect(loaded.playtime).toBe(12345);
  });

  it('slot metadata is correct', async () => {
    const store = buildMockStore();
    await saveToSlot(1, store);
    const loaded = loadSlot(1);

    expect(loaded.playerName).toBe('Amira');
    expect(loaded.playerLevel).toBe(5);
    expect(loaded.currentZone).toBe('oasis_village');
    expect(loaded.version).toBe(SAVE_VERSION);
    expect(typeof loaded.timestamp).toBe('number');
  });

  it('returns null for empty slot', () => {
    expect(loadSlot(2)).toBeNull();
  });

  it('deleteSlot removes the slot', async () => {
    await saveToSlot(3, buildMockStore());
    expect(loadSlot(3)).not.toBeNull();
    deleteSlot(3);
    expect(loadSlot(3)).toBeNull();
  });

  it('SAVE_SLOTS is 3', () => {
    expect(SAVE_SLOTS).toBe(3);
  });
});

describe('saveManager — migrateState', () => {
  it('is idempotent for current-version saves', async () => {
    const store = buildMockStore();
    await saveToSlot(1, store);
    const loaded = loadSlot(1);

    const once = migrateState(loaded);
    const twice = migrateState(once);

    expect(twice.data).toEqual(once.data);
    expect(twice.version).toBe(SAVE_VERSION);
  });

  it('migrates v0 saves to v1 — adds missing skillTree, faction, journal, codex', () => {
    const v0Save = {
      version: 0,
      data: {
        player: { name: 'Test', level: 1, currentZone: 'oasis_village' },
        vocabulary: { fsrsCards: {} },
        // No skillTree, faction, journal, codex
      },
    };

    const migrated = migrateState(v0Save);

    expect(migrated.version).toBe(1);
    expect(migrated.data.skillTree).toBeDefined();
    expect(migrated.data.faction).toBeDefined();
    expect(migrated.data.journal).toBeDefined();
    expect(migrated.data.codex).toBeDefined();
  });

  it('does not overwrite existing v0 slices during migration', () => {
    const v0Save = {
      version: 0,
      data: {
        skillTree: { unlockedNodes: { 'fire-words': true } },
        faction: { alignment: { merchants: 50 } },
      },
    };

    const migrated = migrateState(v0Save);
    expect(migrated.data.skillTree.unlockedNodes['fire-words']).toBe(true);
    expect(migrated.data.faction.alignment.merchants).toBe(50);
  });

  it('throws when save version is newer than SAVE_VERSION', () => {
    const futureSave = {
      version: SAVE_VERSION + 1,
      data: { player: {} },
    };

    expect(() => migrateState(futureSave)).toThrow(/newer version/);
  });
});

describe('saveManager — quota-exceeded path', () => {
  it('propagates QuotaExceededError to caller', async () => {
    const throwingStorage = {
      ...mockLocalStorage,
      setItem: () => {
        const err = new DOMException('QuotaExceededError');
        err.name = 'QuotaExceededError';
        throw err;
      },
      getItem: mockLocalStorage.getItem,
      removeItem: mockLocalStorage.removeItem,
    };
    vi.stubGlobal('localStorage', throwingStorage);

    await expect(saveToSlot(1, buildMockStore())).rejects.toThrow();
  });
});
