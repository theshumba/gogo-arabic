import { describe, it, expect, beforeEach, vi } from 'vitest';
import { enqueueReview, getQueuedReviews, clearReviewQueue, getQueueCount, syncQueuedReviews, isOnline } from '../offlineSync.js';
import 'fake-indexeddb/auto';

describe('offlineSync', () => {
  beforeEach(async () => {
    // Clear the queue before each test
    await clearReviewQueue().catch(() => {});
  });

  describe('enqueueReview', () => {
    it('should add a review to the queue', async () => {
      await enqueueReview({ wordId: 'kitab', rating: 3, card: { due: '2026-03-24' } });
      const reviews = await getQueuedReviews();
      expect(reviews).toHaveLength(1);
      expect(reviews[0].wordId).toBe('kitab');
      expect(reviews[0].rating).toBe(3);
      expect(reviews[0].timestamp).toBeDefined();
    });

    it('should queue multiple reviews', async () => {
      await enqueueReview({ wordId: 'kitab', rating: 3, card: {} });
      await enqueueReview({ wordId: 'qalam', rating: 4, card: {} });
      await enqueueReview({ wordId: 'bayt', rating: 1, card: {} });
      const reviews = await getQueuedReviews();
      expect(reviews).toHaveLength(3);
    });
  });

  describe('getQueueCount', () => {
    it('should return 0 for empty queue', async () => {
      const count = await getQueueCount();
      expect(count).toBe(0);
    });

    it('should return correct count after enqueue', async () => {
      await enqueueReview({ wordId: 'kitab', rating: 3, card: {} });
      await enqueueReview({ wordId: 'qalam', rating: 4, card: {} });
      const count = await getQueueCount();
      expect(count).toBe(2);
    });
  });

  describe('clearReviewQueue', () => {
    it('should clear all queued reviews', async () => {
      await enqueueReview({ wordId: 'kitab', rating: 3, card: {} });
      await enqueueReview({ wordId: 'qalam', rating: 4, card: {} });
      await clearReviewQueue();
      const count = await getQueueCount();
      expect(count).toBe(0);
    });
  });

  describe('syncQueuedReviews', () => {
    it('should dispatch each queued review and clear the queue', async () => {
      await enqueueReview({ wordId: 'kitab', rating: 3, card: { due: '2026-03-24' } });
      await enqueueReview({ wordId: 'qalam', rating: 4, card: { due: '2026-03-25' } });

      const dispatch = vi.fn();
      const updateFsrsCard = vi.fn((payload) => ({ type: 'vocabulary/updateFsrsCard', payload }));

      const synced = await syncQueuedReviews(dispatch, updateFsrsCard);

      expect(synced).toBe(2);
      expect(dispatch).toHaveBeenCalledTimes(2);

      // Queue should be cleared
      const count = await getQueueCount();
      expect(count).toBe(0);
    });

    it('should return 0 when queue is empty', async () => {
      const dispatch = vi.fn();
      const synced = await syncQueuedReviews(dispatch, vi.fn());
      expect(synced).toBe(0);
      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('isOnline', () => {
    it('should return a boolean', () => {
      const result = isOnline();
      expect(typeof result).toBe('boolean');
    });
  });
});
