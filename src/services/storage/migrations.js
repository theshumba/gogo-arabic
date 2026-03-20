/**
 * Redux-Persist Storage Migrations
 *
 * Handles one-time migration from localStorage-only to hybrid IndexedDB+localStorage.
 *
 * Migration path:
 * - Version 0 (implicit): All state in localStorage under 'persist:gogo-arabic'
 * - Version 1: vocabulary + battle moved to IndexedDB, lightweight slices remain in localStorage
 * - Version 2 (Phase 28): magic added to IndexedDB
 * - Version 3 (Phase 29): inventory + economy added
 * - Version 4 (Phase 30): companions added to IndexedDB
 * - Version 5 (Phase 31): crafting added to IndexedDB
 * - Version 8 (Phase 50): worldState moved to IndexedDB
 * - Version 9 (Phase 53): faction moved to IndexedDB
 *
 * Key design:
 * - Migration function receives already-deserialized state from redux-persist
 * - Data movement happens automatically (redux-persist writes to new storage backend)
 * - Migration returns state unchanged (structure is the same, only storage backend changes)
 * - Cleanup of old localStorage keys happens AFTER successful rehydration (5s delay)
 * - Graceful degradation on migration errors (Pitfall 5)
 */

import { createMigrate } from 'redux-persist';

export const CURRENT_VERSION = 9;

/**
 * Migration definitions
 */
const migrations = {
  // Version 0 -> 1: localStorage-only to IndexedDB hybrid
  1: (state) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[Migration] Starting v0 -> v1: localStorage to IndexedDB hybrid');
    }

    try {
      // redux-persist has already deserialized the state from localStorage
      // The new nested persistReducers will now write vocabulary + battle to IndexedDB
      // We just need to return the state and schedule cleanup of old localStorage data

      // Schedule cleanup of old localStorage vocabulary/battle data after rehydration
      setTimeout(() => {
        try {
          const rootKey = 'persist:gogo-arabic';
          const oldData = localStorage.getItem(rootKey);

          if (oldData) {
            const parsed = JSON.parse(oldData);

            // Remove vocabulary and battle (now in IndexedDB)
            // Keep all other slices (they still use localStorage)
            delete parsed.vocabulary;
            delete parsed.battle;

            // Write back the cleaned root key
            localStorage.setItem(rootKey, JSON.stringify(parsed));
            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.log('[Migration] Cleaned up old localStorage vocabulary + battle data');
            }
          }
        } catch (cleanupError) {
          console.warn('[Migration] Failed to cleanup old localStorage data:', cleanupError);
          // Non-critical — app still works, just leaves stale data in localStorage
        }
      }, 5000);

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('[Migration] v0 -> v1 complete');
      }
      return state;
    } catch (error) {
      console.error('[Migration] v0 -> v1 failed, returning state unchanged:', error);
      // Graceful degradation — return state as-is and let app continue
      return state;
    }
  },

  // Version 2-4: Handled by individual nested persistReducers (no-op migrations)
  2: (state) => state,
  3: (state) => state,
  4: (state) => state,

  // Version 5: Crafting added to IndexedDB (Phase 31)
  5: (state) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[Migration] Starting v4 -> v5: crafting added to IndexedDB');
    }

    // New slice, no data to migrate
    // Crafting data will be initialized via nested persistReducer

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[Migration] v4 -> v5 complete');
    }
    return state;
  },
  // Version 6: Force-skip broken tutorial (root persist only)
  6: (state) => {
    // Only apply to root persist config (has player key)
    if (!state || !state.player) return state;
    return {
      ...state,
      player: {
        ...state.player,
        onboardingComplete: true,
        tutorialPhase: 'complete',
      },
    };
  },

  // Version 7: v7.0 World & Content — new slices and fields
  7: (state) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[Migration] Starting v6 -> v7: v7.0 World & Content slices');
    }

    // Initialize home slice if missing
    if (state && !state.home) {
      state.home = {
        placementGrid: Array(8).fill(null).map(() => Array(10).fill(null)),
        ownedFurniture: [],
        utilities: { Comfort: 0, Knowledge: 0, Hospitality: 0, Barakah: 0 },
      };
    }

    // Initialize stats slice if missing
    if (state && !state.stats) {
      state.stats = {
        wordsLearnedToday: 0,
        wordsLearnedAllTime: 0,
        totalAccuracy: { correct: 0, total: 0 },
        zoneTime: {},
        battlesWon: 0,
        battlesLost: 0,
        currentStreak: 0,
        longestStreak: 0,
        sessionsPlayed: 0,
        totalPlayTime: 0,
        lastSessionDate: null,
        dailyStats: [],
      };
    }

    // Initialize friendship in npc slice if missing
    if (state?.npc && !state.npc.friendship) {
      state.npc.friendship = {};
    }

    // Initialize new settings fields
    if (state?.settings) {
      if (state.settings.difficulty === undefined) state.settings.difficulty = 'normal';
      if (state.settings.vowelMarks === undefined) state.settings.vowelMarks = true;
      if (state.settings.hintFrequency === undefined) state.settings.hintFrequency = 'normal';
      if (state.settings.battleSpeed === undefined) state.settings.battleSpeed = 1.0;
      if (state.settings.vocabRandomizerSeed === undefined) state.settings.vocabRandomizerSeed = null;
      if (state.settings.showRomanization === undefined) state.settings.showRomanization = true;
    }

    // Initialize tiered currency in player slice
    if (state?.player && !state.player.currency) {
      state.player.currency = {
        fils: 0,
        dirhams: state.player.dirhams || 0,
        dinars: 0,
      };
    }

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[Migration] v6 -> v7 complete');
    }
    return state;
  },

  // Version 8: worldState moved from localStorage to IndexedDB (Phase 50)
  8: (state) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[Migration] Starting v7 -> v8: worldState moved to IndexedDB');
    }

    // Schedule cleanup of old localStorage worldState data after rehydration
    setTimeout(() => {
      try {
        const rootKey = 'persist:gogo-arabic';
        const oldData = localStorage.getItem(rootKey);

        if (oldData) {
          const parsed = JSON.parse(oldData);

          // Remove worldState from root localStorage persist (now in IndexedDB)
          delete parsed.worldState;

          localStorage.setItem(rootKey, JSON.stringify(parsed));
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log('[Migration] Cleaned up old localStorage worldState data');
          }
        }
      } catch (cleanupError) {
        console.warn('[Migration] Failed to cleanup old localStorage worldState:', cleanupError);
      }
    }, 5000);

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[Migration] v7 -> v8 complete');
    }
    return state;
  },

  // Version 9: faction moved from localStorage to IndexedDB (Phase 53)
  9: (state) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[Migration] Starting v8 -> v9: faction moved to IndexedDB');
    }

    setTimeout(() => {
      try {
        const rootKey = 'persist:gogo-arabic';
        const oldData = localStorage.getItem(rootKey);
        if (oldData) {
          const parsed = JSON.parse(oldData);
          delete parsed.faction;
          localStorage.setItem(rootKey, JSON.stringify(parsed));
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log('[Migration] Cleaned up old localStorage faction data');
          }
        }
      } catch (cleanupError) {
        console.warn('[Migration] Failed to cleanup old localStorage faction:', cleanupError);
      }
    }, 5000);

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[Migration] v8 -> v9 complete');
    }
    return state;
  },
};

/**
 * Create redux-persist migration function
 */
export const migrate = createMigrate(migrations, { debug: false });
