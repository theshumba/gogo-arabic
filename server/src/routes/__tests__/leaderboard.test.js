import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { createTestUser } from '../../../test/helpers.js';
import Leaderboard from '../../models/Leaderboard.js';

describe('Leaderboard Routes', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    const { user, token } = await createTestUser();
    authToken = token;
    userId = user._id.toString();
  });

  describe('POST /api/v1/leaderboard/score', () => {
    it('should create a new leaderboard entry', async () => {
      const response = await request(app)
        .post('/api/v1/leaderboard/score')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'xp', score: 500, displayName: 'TestPlayer' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.category).toBe('xp');
      expect(response.body.data.score).toBe(500);
      expect(response.body.data.displayName).toBe('TestPlayer');
      expect(response.body.data.week).toBeDefined();
    });

    it('should update score if higher (upsert)', async () => {
      const week = Leaderboard.getISOWeek(new Date());
      // Seed a lower score directly
      await Leaderboard.create({
        userId, category: 'xp', score: 100, displayName: 'TestPlayer', week,
      });

      const response = await request(app)
        .post('/api/v1/leaderboard/score')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'xp', score: 500, displayName: 'TestPlayer' });

      expect(response.status).toBe(200);
      expect(response.body.data.score).toBe(500);
    });

    it('should NOT lower an existing score', async () => {
      const week = Leaderboard.getISOWeek(new Date());
      // Seed a higher score directly
      await Leaderboard.create({
        userId, category: 'xp', score: 1000, displayName: 'TestPlayer', week,
      });

      const response = await request(app)
        .post('/api/v1/leaderboard/score')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'xp', score: 200, displayName: 'TestPlayer' });

      expect(response.status).toBe(200);
      expect(response.body.data.score).toBe(1000);
    });

    it('should reject invalid category', async () => {
      const response = await request(app)
        .post('/api/v1/leaderboard/score')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'invalid', score: 100, displayName: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject negative score', async () => {
      const response = await request(app)
        .post('/api/v1/leaderboard/score')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'xp', score: -10, displayName: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject non-integer score', async () => {
      const response = await request(app)
        .post('/api/v1/leaderboard/score')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'xp', score: 1.5, displayName: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject score above MAX_LEADERBOARD_SCORE cap', async () => {
      const response = await request(app)
        .post('/api/v1/leaderboard/score')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'xp', score: 10_000_001, displayName: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject Number.MAX_SAFE_INTEGER (classic cheat)', async () => {
      const response = await request(app)
        .post('/api/v1/leaderboard/score')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'xp', score: Number.MAX_SAFE_INTEGER, displayName: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject unknown fields in body (strict schema)', async () => {
      const response = await request(app)
        .post('/api/v1/leaderboard/score')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'xp', score: 100, displayName: 'Test', userId: 'someOtherUserId' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject missing displayName', async () => {
      const response = await request(app)
        .post('/api/v1/leaderboard/score')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'xp', score: 100 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/leaderboard/score')
        .send({ category: 'xp', score: 100, displayName: 'Test' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should rate limit score updates (1 per 30s per user)', async () => {
      // First request succeeds
      const res1 = await request(app)
        .post('/api/v1/leaderboard/score')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'xp', score: 100, displayName: 'Test' });
      expect(res1.status).toBe(200);

      // Second rapid request from same user should be rate limited
      const res2 = await request(app)
        .post('/api/v1/leaderboard/score')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'xp', score: 200, displayName: 'Test' });
      expect(res2.status).toBe(429);
    });
  });

  describe('GET /api/v1/leaderboard/:category', () => {
    it('should return top players for a category', async () => {
      const week = Leaderboard.getISOWeek(new Date());
      const { user: user2 } = await createTestUser({ email: 'player2@example.com' });
      const { user: user3 } = await createTestUser({ email: 'player3@example.com' });

      await Leaderboard.create([
        { userId, category: 'xp', score: 300, displayName: 'Player1', week },
        { userId: user2._id, category: 'xp', score: 500, displayName: 'Player2', week },
        { userId: user3._id, category: 'xp', score: 100, displayName: 'Player3', week },
      ]);

      const response = await request(app)
        .get('/api/v1/leaderboard/xp')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      // Sorted by score descending
      expect(response.body.data[0].displayName).toBe('Player2');
      expect(response.body.data[0].rank).toBe(1);
      expect(response.body.data[1].displayName).toBe('Player1');
      expect(response.body.data[1].rank).toBe(2);
      expect(response.body.data[2].displayName).toBe('Player3');
      expect(response.body.data[2].rank).toBe(3);
    });

    it('should respect limit parameter', async () => {
      const week = Leaderboard.getISOWeek(new Date());
      const entries = [];
      for (let i = 0; i < 5; i++) {
        const { user: u } = await createTestUser({ email: `limit${i}@example.com` });
        entries.push({ userId: u._id, category: 'xp', score: (i + 1) * 100, displayName: `P${i}`, week });
      }
      await Leaderboard.create(entries);

      const response = await request(app)
        .get('/api/v1/leaderboard/xp?limit=3')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data).toHaveLength(3);
    });

    it('should return empty array when no entries', async () => {
      const response = await request(app)
        .get('/api/v1/leaderboard/xp')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('should only return current week entries', async () => {
      const currentWeek = Leaderboard.getISOWeek(new Date());
      const oldWeek = '2025-W01';

      await Leaderboard.create([
        { userId, category: 'xp', score: 500, displayName: 'Current', week: currentWeek },
      ]);
      // Insert old week entry for a different user to avoid unique index conflict
      const { user: oldUser } = await createTestUser({ email: 'old@example.com' });
      await Leaderboard.create([
        { userId: oldUser._id, category: 'xp', score: 999, displayName: 'Old', week: oldWeek },
      ]);

      const response = await request(app)
        .get('/api/v1/leaderboard/xp')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].displayName).toBe('Current');
    });

    it('should reject invalid category', async () => {
      const response = await request(app)
        .get('/api/v1/leaderboard/invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/leaderboard/xp');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/leaderboard/my-rank/:category', () => {
    it('should return user rank and surrounding players', async () => {
      const week = Leaderboard.getISOWeek(new Date());
      const users = [];
      for (let i = 0; i < 5; i++) {
        const { user: u } = await createTestUser({ email: `rank${i}@example.com` });
        users.push(u);
      }

      await Leaderboard.create([
        { userId: users[0]._id, category: 'xp', score: 500, displayName: 'P1', week },
        { userId: users[1]._id, category: 'xp', score: 400, displayName: 'P2', week },
        { userId, category: 'xp', score: 300, displayName: 'Me', week },
        { userId: users[2]._id, category: 'xp', score: 200, displayName: 'P4', week },
        { userId: users[3]._id, category: 'xp', score: 100, displayName: 'P5', week },
      ]);

      const response = await request(app)
        .get('/api/v1/leaderboard/my-rank/xp')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rank).toBe(3);
      expect(response.body.data.entry.displayName).toBe('Me');
      expect(response.body.data.surrounding.length).toBeGreaterThanOrEqual(3);
    });

    it('should return null rank for user with no entry', async () => {
      const response = await request(app)
        .get('/api/v1/leaderboard/my-rank/xp')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.rank).toBeNull();
      expect(response.body.data.entry).toBeNull();
      expect(response.body.data.surrounding).toEqual([]);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/leaderboard/my-rank/xp');

      expect(response.status).toBe(401);
    });
  });

  describe('Weekly isolation', () => {
    it('should use ISO week format (YYYY-WNN)', () => {
      const week = Leaderboard.getISOWeek(new Date('2026-04-06')); // Monday
      expect(week).toMatch(/^\d{4}-W\d{2}$/);
    });

    it('should return same week for Mon-Sun within a week', () => {
      // 2026-04-06 is a Monday
      const mon = Leaderboard.getISOWeek(new Date('2026-04-06'));
      const sun = Leaderboard.getISOWeek(new Date('2026-04-12'));
      expect(mon).toBe(sun);
    });

    it('should return different week across Monday boundary', () => {
      const sun = Leaderboard.getISOWeek(new Date('2026-04-12')); // Sunday
      const mon = Leaderboard.getISOWeek(new Date('2026-04-13')); // Next Monday
      expect(sun).not.toBe(mon);
    });
  });
});
