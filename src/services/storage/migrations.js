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
 *
 * Key design:
 * - Migration function receives already-deserialized state from redux-persist
 * - Data movement happens automatically (redux-persist writes to new storage backend)
 * - Migration returns state unchanged (structure is the same, only storage backend changes)
 * - Cleanup of old localStorage keys happens AFTER successful rehydration (5s delay)
 * - Graceful degradation on migration errors (Pitfall 5)
 */

import { createMigrate } from 'redux-persist';

export const CURRENT_VERSION = 5;

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
};

/**
 * Create redux-persist migration function
 */
export const migrate = createMigrate(migrations, { debug: false });
