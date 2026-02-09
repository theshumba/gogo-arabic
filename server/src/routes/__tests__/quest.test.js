import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { createTestUser } from '../../../test/helpers.js';
import Quest from '../../models/Quest.js';

describe('Quest Routes', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    const { user, token } = await createTestUser();
    authToken = token;
    userId = user._id.toString();
  });

  describe('GET /api/quest', () => {
    it('should return empty quests array for new user', async () => {
      const response = await request(app)
        .get('/api/quest')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination).toBeDefined();
    });

    it('should return user quests', async () => {
      // Create test quests
      await Quest.create([
        {
          userId,
          questId: 'quest_1',
          status: 'active',
          progress: 5,
          target: 10,
        },
        {
          userId,
          questId: 'quest_2',
          status: 'completed',
          progress: 10,
          target: 10,
          completedAt: new Date(),
        },
      ]);

      const response = await request(app)
        .get('/api/quest')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toHaveLength(2);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/quest');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should support pagination', async () => {
      // Create multiple quests
      const quests = Array.from({ length: 25 }, (_, i) => ({
        userId,
        questId: `quest_${i}`,
        status: 'active',
        progress: 0,
        target: 10,
      }));
      await Quest.create(quests);

      const response = await request(app)
        .get('/api/quest?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination.totalPages).toBeGreaterThan(1);
    });
  });

  describe('POST /api/quest/sync', () => {
    it('should sync quests from client', async () => {
      const response = await request(app)
        .post('/api/quest/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quests: [
            {
              questId: 'sync_quest_1',
              status: 'active',
              progress: 3,
              target: 10,
            },
            {
              questId: 'sync_quest_2',
              status: 'completed',
              progress: 5,
              target: 5,
              completedAt: new Date().toISOString(),
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should upsert existing quests', async () => {
      // Create initial quest
      await Quest.create({
        userId,
        questId: 'upsert_quest',
        status: 'active',
        progress: 1,
        target: 10,
      });

      // Sync with updated progress
      const response = await request(app)
        .post('/api/quest/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quests: [
            {
              questId: 'upsert_quest',
              status: 'active',
              progress: 7,
              target: 10,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify the quest was updated
      const updated = response.body.data.find(q => q.questId === 'upsert_quest');
      expect(updated.progress).toBe(7);
    });

    it('should fail with non-array quests', async () => {
      const response = await request(app)
        .post('/api/quest/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quests: 'not-an-array',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/quest/sync')
        .send({
          quests: [],
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with too many quests', async () => {
      const tooManyQuests = Array.from({ length: 201 }, (_, i) => ({
        questId: `quest_${i}`,
        status: 'active',
        progress: 0,
        target: 10,
      }));

      const response = await request(app)
        .post('/api/quest/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quests: tooManyQuests,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Cannot sync more than 200 quests');
    });
  });
});
