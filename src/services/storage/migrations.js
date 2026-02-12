/**
 * Redux-Persist Storage Migrations
 *
 * Handles one-time migration from localStorage-only to hybrid IndexedDB+localStorage.
 *
 * Migration path:
 * - Version 0 (implicit): All state in localStorage under 'persist:gogo-arabic'
 * - Version 1: vocabulary + battle moved to IndexedDB, lightweight slices remain in localStorage
 *
 * Key design:
 * - Migration function receives already-deserialized state from redux-persist
 * - Data movement happens automatically (redux-persist writes to new storage backend)
 * - Migration returns state unchanged (structure is the same, only storage backend changes)
 * - Cleanup of old localStorage keys happens AFTER successful rehydration (5s delay)
 * - Graceful degradation on migration errors (Pitfall 5)
 */

import { createMigrate } from 'redux-persist';

export const CURRENT_VERSION = 1;

/**
 * Migration definitions
 */
const migrations = {
  // Version 0 -> 1: localStorage-only to IndexedDB hybrid
  1: (state) => {
    console.log('[Migration] Starting v0 -> v1: localStorage to IndexedDB hybrid');

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
            console.log('[Migration] Cleaned up old localStorage vocabulary + battle data');
          }
        } catch (cleanupError) {
          console.warn('[Migration] Failed to cleanup old localStorage data:', cleanupError);
          // Non-critical — app still works, just leaves stale data in localStorage
        }
      }, 5000);

      console.log('[Migration] v0 -> v1 complete');
      return state;
    } catch (error) {
      console.error('[Migration] v0 -> v1 failed, returning state unchanged:', error);
      // Graceful degradation — return state as-is and let app continue
      return state;
    }
  },
};

/**
 * Create redux-persist migration function
 */
export const migrate = createMigrate(migrations, { debug: false });
