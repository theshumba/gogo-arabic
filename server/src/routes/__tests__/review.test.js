import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { createTestUser } from '../../../test/helpers.js';
import VocabCard from '../../models/VocabCard.js';

describe('Review Routes', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    const { user, token } = await createTestUser();
    authToken = token;
    userId = user._id.toString();
  });

  describe('GET /api/review/cards', () => {
    it('should return empty cards array for new user', async () => {
      const response = await request(app)
        .get('/api/review/cards')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination).toBeDefined();
    });

    it('should return user vocabulary cards', async () => {
      // Create test cards
      await VocabCard.create([
        {
          userId,
          wordId: 'word_1',
          due: new Date(),
          stability: 1.5,
          difficulty: 5.0,
          reps: 2,
          state: 1,
        },
        {
          userId,
          wordId: 'word_2',
          due: new Date(Date.now() + 86400000), // Tomorrow
          stability: 2.0,
          difficulty: 4.5,
          reps: 3,
          state: 2,
        },
      ]);

      const response = await request(app)
        .get('/api/review/cards')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toHaveLength(2);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/review/cards');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should support pagination', async () => {
      // Create many cards
      const cards = Array.from({ length: 50 }, (_, i) => ({
        userId,
        wordId: `word_${i}`,
        due: new Date(),
        stability: 1.0,
        difficulty: 5.0,
        reps: 0,
        state: 0,
      }));
      await VocabCard.create(cards);

      const response = await request(app)
        .get('/api/review/cards?page=1&limit=20')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(20);
      expect(response.body.pagination.totalPages).toBeGreaterThan(1);
    });
  });

  describe('POST /api/review/sync', () => {
    it('should sync vocabulary cards from client', async () => {
      const response = await request(app)
        .post('/api/review/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cards: [
            {
              wordId: 'sync_word_1',
              due: new Date().toISOString(),
              stability: 1.5,
              difficulty: 5.0,
              reps: 1,
              state: 1,
              last_review: new Date().toISOString(),
            },
            {
              wordId: 'sync_word_2',
              due: new Date().toISOString(),
              stability: 2.0,
              difficulty: 4.0,
              reps: 2,
              state: 2,
              last_review: new Date().toISOString(),
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should upsert existing cards', async () => {
      // Create initial card
      await VocabCard.create({
        userId,
        wordId: 'upsert_word',
        due: new Date(),
        stability: 1.0,
        difficulty: 5.0,
        reps: 1,
        state: 1,
      });

      // Sync with updated data
      const response = await request(app)
        .post('/api/review/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cards: [
            {
              wordId: 'upsert_word',
              due: new Date().toISOString(),
              stability: 3.0,
              difficulty: 4.0,
              reps: 5,
              state: 2,
              last_review: new Date().toISOString(),
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify the card was updated
      const updated = response.body.data.find(c => c.wordId === 'upsert_word');
      expect(updated.reps).toBe(5);
      expect(updated.stability).toBe(3.0);
    });

    it('should fail with non-array cards', async () => {
      const response = await request(app)
        .post('/api/review/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cards: 'not-an-array',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/review/sync')
        .send({
          cards: [],
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with too many cards', async () => {
      const tooManyCards = Array.from({ length: 501 }, (_, i) => ({
        wordId: `word_${i}`,
        due: new Date().toISOString(),
        stability: 1.0,
        difficulty: 5.0,
        reps: 0,
        state: 0,
      }));

      const response = await request(app)
        .post('/api/review/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cards: tooManyCards,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Cannot sync more than 500 cards');
    });

    it('should fail validation with cards missing wordId', async () => {
      const response = await request(app)
        .post('/api/review/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cards: [
            {
              // Missing wordId - should fail validation
              due: new Date().toISOString(),
              stability: 1.0,
              difficulty: 5.0,
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('wordId');
    });
  });
});
