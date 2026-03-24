/**
 * Offline Sync Service — Phase 72
 *
 * Queues FSRS review results in IndexedDB when offline.
 * Syncs queued reviews when connection is restored.
 * Works both with and without service worker.
 */

const SYNC_DB_NAME = 'gogo-arabic-offline-sync';
const SYNC_STORE = 'review-queue';
const DB_VERSION = 1;

let dbInstance = null;

function openDB() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const request = indexedDB.open(SYNC_DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(SYNC_STORE)) {
        db.createObjectStore(SYNC_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => {
      dbInstance = request.result;
      dbInstance.onclose = () => { dbInstance = null; };
      resolve(dbInstance);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Queue a review result for later sync
 * @param {{ wordId: string, rating: number, card: object }} reviewData
 */
export async function enqueueReview(reviewData) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SYNC_STORE, 'readwrite');
    const store = tx.objectStore(SYNC_STORE);
    store.add({ ...reviewData, timestamp: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get all queued reviews
 * @returns {Promise<Array>}
 */
export async function getQueuedReviews() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SYNC_STORE, 'readonly');
    const store = tx.objectStore(SYNC_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all queued reviews after successful sync
 */
export async function clearReviewQueue() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SYNC_STORE, 'readwrite');
    const store = tx.objectStore(SYNC_STORE);
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get count of queued reviews
 * @returns {Promise<number>}
 */
export async function getQueueCount() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SYNC_STORE, 'readonly');
    const store = tx.objectStore(SYNC_STORE);
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Sync queued reviews by dispatching them to the Redux store
 * @param {Function} dispatch - Redux store.dispatch
 * @param {Function} updateFsrsCard - The action creator from vocabularySlice
 * @returns {Promise<number>} Number of reviews synced
 */
export async function syncQueuedReviews(dispatch, updateFsrsCard) {
  const reviews = await getQueuedReviews();
  if (reviews.length === 0) return 0;

  for (const review of reviews) {
    dispatch(updateFsrsCard({
      wordId: review.wordId,
      rating: review.rating,
      card: review.card,
    }));
  }

  await clearReviewQueue();
  return reviews.length;
}

/**
 * Check if currently online
 * @returns {boolean}
 */
export function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}
