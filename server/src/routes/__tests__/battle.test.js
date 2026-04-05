import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { createTestUser } from '../../../test/helpers.js';
import BattleLog from '../../models/BattleLog.js';

describe('Battle Routes', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    const { user, token } = await createTestUser();
    authToken = token;
    userId = user._id.toString();
  });

  describe('POST /api/v1/battles/log', () => {
    it('should log a battle result', async () => {
      const response = await request(app)
        .post('/api/v1/battles/log')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          opponentId: 'sand_golem',
          opponentName: 'Sand Golem',
          zone: 'oasis',
          result: 'win',
          duration: 120,
          xpEarned: 50,
          goldEarned: 25,
          vocabTested: ['kitab', 'qalam', 'bayt'],
          vocabCorrect: ['kitab', 'qalam'],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.opponentId).toBe('sand_golem');
      expect(response.body.data.opponentName).toBe('Sand Golem');
      expect(response.body.data.zone).toBe('oasis');
      expect(response.body.data.result).toBe('win');
      expect(response.body.data.duration).toBe(120);
      expect(response.body.data.xpEarned).toBe(50);
      expect(response.body.data.goldEarned).toBe(25);
      expect(response.body.data.vocabTested).toEqual(['kitab', 'qalam', 'bayt']);
      expect(response.body.data.vocabCorrect).toEqual(['kitab', 'qalam']);
    });

    it('should log a loss result', async () => {
      const response = await request(app)
        .post('/api/v1/battles/log')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          opponentId: 'desert_wyrm',
          result: 'loss',
          duration: 60,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.result).toBe('loss');
      expect(response.body.data.opponentId).toBe('desert_wyrm');
    });

    it('should log a flee result', async () => {
      const response = await request(app)
        .post('/api/v1/battles/log')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          opponentId: 'sand_golem',
          result: 'flee',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.result).toBe('flee');
    });

    it('should reject invalid result value', async () => {
      const response = await request(app)
        .post('/api/v1/battles/log')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          opponentId: 'sand_golem',
          result: 'draw',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject missing opponentId', async () => {
      const response = await request(app)
        .post('/api/v1/battles/log')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          result: 'win',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject missing result', async () => {
      const response = await request(app)
        .post('/api/v1/battles/log')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          opponentId: 'sand_golem',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/battles/log')
        .send({
          opponentId: 'sand_golem',
          result: 'win',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should use defaults for optional fields', async () => {
      const response = await request(app)
        .post('/api/v1/battles/log')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          opponentId: 'sand_golem',
          result: 'win',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.duration).toBe(0);
      expect(response.body.data.xpEarned).toBe(0);
      expect(response.body.data.goldEarned).toBe(0);
      expect(response.body.data.vocabTested).toEqual([]);
      expect(response.body.data.vocabCorrect).toEqual([]);
    });
  });

  describe('GET /api/v1/battles/history', () => {
    it('should return battle history sorted by newest first', async () => {
      await BattleLog.create([
        { userId, opponentId: 'enemy_a', result: 'win', timestamp: new Date('2026-01-01') },
        { userId, opponentId: 'enemy_b', result: 'loss', timestamp: new Date('2026-01-03') },
        { userId, opponentId: 'enemy_c', result: 'win', timestamp: new Date('2026-01-02') },
      ]);

      const response = await request(app)
        .get('/api/v1/battles/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].opponentId).toBe('enemy_b');
      expect(response.body.data[1].opponentId).toBe('enemy_c');
      expect(response.body.data[2].opponentId).toBe('enemy_a');
    });

    it('should filter by zone', async () => {
      await BattleLog.create([
        { userId, opponentId: 'enemy_a', result: 'win', zone: 'oasis' },
        { userId, opponentId: 'enemy_b', result: 'loss', zone: 'desert' },
        { userId, opponentId: 'enemy_c', result: 'win', zone: 'oasis' },
      ]);

      const response = await request(app)
        .get('/api/v1/battles/history?zone=oasis')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(b => b.zone === 'oasis')).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const battles = Array.from({ length: 10 }, (_, i) => ({
        userId,
        opponentId: `enemy_${i}`,
        result: 'win',
      }));
      await BattleLog.create(battles);

      const response = await request(app)
        .get('/api/v1/battles/history?limit=3')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
    });

    it('should return empty array for new user', async () => {
      const response = await request(app)
        .get('/api/v1/battles/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('should not return other user battle history', async () => {
      const { user: otherUser } = await createTestUser({ email: 'other@example.com' });
      await BattleLog.create([
        { userId, opponentId: 'enemy_a', result: 'win' },
        { userId: otherUser._id, opponentId: 'enemy_b', result: 'loss' },
      ]);

      const response = await request(app)
        .get('/api/v1/battles/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].opponentId).toBe('enemy_a');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/battles/history');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/battles/stats', () => {
    it('should return aggregated stats', async () => {
      await BattleLog.create([
        { userId, opponentId: 'e1', result: 'win', duration: 100, xpEarned: 50, goldEarned: 20 },
        { userId, opponentId: 'e2', result: 'win', duration: 80, xpEarned: 40, goldEarned: 15 },
        { userId, opponentId: 'e3', result: 'loss', duration: 60, xpEarned: 10, goldEarned: 5 },
        { userId, opponentId: 'e4', result: 'flee', duration: 30, xpEarned: 0, goldEarned: 0 },
      ]);

      const response = await request(app)
        .get('/api/v1/battles/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalBattles).toBe(4);
      expect(response.body.data.wins).toBe(2);
      expect(response.body.data.losses).toBe(1);
      expect(response.body.data.flees).toBe(1);
      expect(response.body.data.winRate).toBe(0.5);
      expect(response.body.data.avgDuration).toBe(68); // Math.round((100+80+60+30)/4)
      expect(response.body.data.totalXp).toBe(100);
      expect(response.body.data.totalGold).toBe(40);
    });

    it('should calculate best win streak', async () => {
      await BattleLog.create([
        { userId, opponentId: 'e1', result: 'win', timestamp: new Date('2026-01-01') },
        { userId, opponentId: 'e2', result: 'win', timestamp: new Date('2026-01-02') },
        { userId, opponentId: 'e3', result: 'win', timestamp: new Date('2026-01-03') },
        { userId, opponentId: 'e4', result: 'loss', timestamp: new Date('2026-01-04') },
        { userId, opponentId: 'e5', result: 'win', timestamp: new Date('2026-01-05') },
        { userId, opponentId: 'e6', result: 'win', timestamp: new Date('2026-01-06') },
      ]);

      const response = await request(app)
        .get('/api/v1/battles/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data.bestStreak).toBe(3);
    });

    it('should return empty stats for new user', async () => {
      const response = await request(app)
        .get('/api/v1/battles/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.totalBattles).toBe(0);
      expect(response.body.data.wins).toBe(0);
      expect(response.body.data.losses).toBe(0);
      expect(response.body.data.winRate).toBe(0);
      expect(response.body.data.bestStreak).toBe(0);
    });

    it('should not include other user battles in stats', async () => {
      const { user: otherUser } = await createTestUser({ email: 'other2@example.com' });
      await BattleLog.create([
        { userId, opponentId: 'e1', result: 'win', xpEarned: 50 },
        { userId: otherUser._id, opponentId: 'e2', result: 'win', xpEarned: 100 },
      ]);

      const response = await request(app)
        .get('/api/v1/battles/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data.totalBattles).toBe(1);
      expect(response.body.data.totalXp).toBe(50);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/battles/stats');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
