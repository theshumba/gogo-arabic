import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { createTestUser } from '../../../test/helpers.js';
import Achievement from '../../models/Achievement.js';

describe('Achievement Routes', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    const { user, token } = await createTestUser();
    authToken = token;
    userId = user._id.toString();
  });

  describe('POST /api/v1/achievements/unlock', () => {
    it('should unlock an achievement', async () => {
      const response = await request(app)
        .post('/api/v1/achievements/unlock')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          achievementId: 'first_word',
          context: { wordCount: 1, cefrLevel: 'A1' },
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.achievementId).toBe('first_word');
      expect(response.body.data.context.wordCount).toBe(1);
      expect(response.body.data.context.cefrLevel).toBe('A1');
      expect(response.body.data.unlockedAt).toBeDefined();
    });

    it('should unlock with minimal data (no context)', async () => {
      const response = await request(app)
        .post('/api/v1/achievements/unlock')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ achievementId: 'word_collector_10' });

      expect(response.status).toBe(201);
      expect(response.body.data.achievementId).toBe('word_collector_10');
      expect(response.body.data.context.wordCount).toBe(0);
      expect(response.body.data.context.questId).toBe('');
    });

    it('should prevent duplicate unlock (409 Conflict)', async () => {
      await request(app)
        .post('/api/v1/achievements/unlock')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ achievementId: 'first_word' });

      const response = await request(app)
        .post('/api/v1/achievements/unlock')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ achievementId: 'first_word' });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already unlocked');
    });

    it('should allow different users to unlock the same achievement', async () => {
      const { token: otherToken } = await createTestUser({ email: 'other@example.com' });

      const res1 = await request(app)
        .post('/api/v1/achievements/unlock')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ achievementId: 'first_word' });

      const res2 = await request(app)
        .post('/api/v1/achievements/unlock')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ achievementId: 'first_word' });

      expect(res1.status).toBe(201);
      expect(res2.status).toBe(201);
    });

    it('should reject invalid cefrLevel in context', async () => {
      const response = await request(app)
        .post('/api/v1/achievements/unlock')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          achievementId: 'first_word',
          context: { cefrLevel: 'Z9' },
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('cefrLevel');
    });

    it('should reject missing achievementId', async () => {
      const response = await request(app)
        .post('/api/v1/achievements/unlock')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ context: { wordCount: 5 } });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject empty achievementId', async () => {
      const response = await request(app)
        .post('/api/v1/achievements/unlock')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ achievementId: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/achievements/unlock')
        .send({ achievementId: 'first_word' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should unlock with quest context', async () => {
      const response = await request(app)
        .post('/api/v1/achievements/unlock')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          achievementId: 'quest_starter',
          context: { questId: 'oasis_intro_quest' },
        });

      expect(response.status).toBe(201);
      expect(response.body.data.context.questId).toBe('oasis_intro_quest');
    });
  });

  describe('GET /api/v1/achievements', () => {
    it('should return all unlocked achievements for user', async () => {
      await Achievement.create([
        { userId, achievementId: 'first_word', context: { wordCount: 1 } },
        { userId, achievementId: 'word_collector_10', context: { wordCount: 10 } },
        { userId, achievementId: 'quest_starter', context: { questId: 'q1' } },
      ]);

      const response = await request(app)
        .get('/api/v1/achievements')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
    });

    it('should return achievements sorted by newest first', async () => {
      await Achievement.create([
        { userId, achievementId: 'a_old', unlockedAt: new Date('2026-01-01') },
        { userId, achievementId: 'a_new', unlockedAt: new Date('2026-03-01') },
        { userId, achievementId: 'a_mid', unlockedAt: new Date('2026-02-01') },
      ]);

      const response = await request(app)
        .get('/api/v1/achievements')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data[0].achievementId).toBe('a_new');
      expect(response.body.data[1].achievementId).toBe('a_mid');
      expect(response.body.data[2].achievementId).toBe('a_old');
    });

    it('should return empty array for new user', async () => {
      const response = await request(app)
        .get('/api/v1/achievements')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('should not return other user achievements', async () => {
      const { user: otherUser } = await createTestUser({ email: 'other2@example.com' });
      await Achievement.create([
        { userId, achievementId: 'first_word' },
        { userId: otherUser._id, achievementId: 'word_collector_10' },
      ]);

      const response = await request(app)
        .get('/api/v1/achievements')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].achievementId).toBe('first_word');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/achievements');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/achievements/global-stats', () => {
    it('should return percentage of players with each achievement', async () => {
      const { user: user2 } = await createTestUser({ email: 'user2@example.com' });
      const { user: user3 } = await createTestUser({ email: 'user3@example.com' });

      // All 3 users have first_word, 2 have word_collector_10, 1 has quest_starter
      await Achievement.create([
        { userId, achievementId: 'first_word' },
        { userId: user2._id, achievementId: 'first_word' },
        { userId: user3._id, achievementId: 'first_word' },
        { userId, achievementId: 'word_collector_10' },
        { userId: user2._id, achievementId: 'word_collector_10' },
        { userId, achievementId: 'quest_starter' },
      ]);

      const response = await request(app)
        .get('/api/v1/achievements/global-stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalPlayers).toBe(3);

      const stats = response.body.data.achievements;
      const firstWord = stats.find(s => s.achievementId === 'first_word');
      const wordCollector = stats.find(s => s.achievementId === 'word_collector_10');
      const questStarter = stats.find(s => s.achievementId === 'quest_starter');

      expect(firstWord.percentage).toBe(100);
      expect(firstWord.unlockCount).toBe(3);
      expect(wordCollector.percentage).toBeCloseTo(66.7, 0);
      expect(wordCollector.unlockCount).toBe(2);
      expect(questStarter.percentage).toBeCloseTo(33.3, 0);
      expect(questStarter.unlockCount).toBe(1);
    });

    it('should return empty stats when no achievements exist', async () => {
      const response = await request(app)
        .get('/api/v1/achievements/global-stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.totalPlayers).toBe(0);
      expect(response.body.data.achievements).toEqual([]);
    });

    it('should sort by percentage descending', async () => {
      const { user: user2 } = await createTestUser({ email: 'user2b@example.com' });
      await Achievement.create([
        { userId, achievementId: 'common_one' },
        { userId: user2._id, achievementId: 'common_one' },
        { userId, achievementId: 'rare_one' },
      ]);

      const response = await request(app)
        .get('/api/v1/achievements/global-stats')
        .set('Authorization', `Bearer ${authToken}`);

      const stats = response.body.data.achievements;
      expect(stats[0].achievementId).toBe('common_one');
      expect(stats[1].achievementId).toBe('rare_one');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/achievements/global-stats');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
