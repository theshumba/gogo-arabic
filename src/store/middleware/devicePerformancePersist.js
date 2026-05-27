/**
 * Phase 102 — Plan 07 (OBS-06): Device performance persistence middleware
 *
 * Belt-and-braces companion to the redux-persist root allow-list write of the
 * `devicePerformance` slice. When `setLowEndFlag` fires, this middleware:
 *
 *   1. Lets the reducer apply (call `next(action)` first).
 *   2. Reads the freshly-updated slice from `store.getState()`.
 *   3. Writes the slice JSON to IndexedDB under a dedicated key via the
 *      existing `indexedDBStorage` adapter.
 *
 * Why duplicate the redux-persist write?
 *   - Plan rules item 6 explicitly requires a write hook for the verifier.
 *   - The redux-persist root persist write batches state across many slices;
 *     this middleware writes the single device-performance verdict alone,
 *     so downstream phases (103/104) can fetch it without touching the root
 *     persist key.
 *
 * Safety:
 *   - Wrapped in try/catch — IndexedDB unavailability (Safari private mode,
 *     quota errors) must not crash the dispatch chain. Failures log a
 *     warning in DEV and are swallowed in production.
 *   - Async write does NOT block the middleware return.
 */
import indexedDBStorage from '../../services/storage/indexedDBAdapter.js';

const DEVICE_PERFORMANCE_KEY = 'gogo-arabic-device-performance';
const ACTION_TYPE = 'devicePerformance/setLowEndFlag';

export const devicePerformancePersistMiddleware = (store) => (next) => (action) => {
  // Apply the reducer first so getState() returns the post-action snapshot.
  const result = next(action);

  if (action.type !== ACTION_TYPE) return result;

  try {
    const slice = store.getState().devicePerformance;
    if (!slice) return result;

    // Fire-and-forget — telemetry-grade writes must not block gameplay.
    indexedDBStorage
      .setItem(DEVICE_PERFORMANCE_KEY, JSON.stringify(slice))
      .catch((err) => {
        if (import.meta?.env?.DEV) {
          // eslint-disable-next-line no-console
          console.warn('[devicePerformancePersist] IndexedDB write failed:', err);
        }
      });
  } catch (err) {
    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[devicePerformancePersist] dispatch hook failed:', err);
    }
  }

  return result;
};

export default devicePerformancePersistMiddleware;
