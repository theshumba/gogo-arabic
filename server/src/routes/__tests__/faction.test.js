import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { createTestUser } from '../../../test/helpers.js';
import FactionState from '../../models/FactionState.js';

describe('Faction Routes', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    const { user, token } = await createTestUser();
    authToken = token;
    userId = user._id.toString();
  });

  // ==================== POST /api/v1/factions/update ====================

  describe('POST /api/v1/factions/update', () => {
    it('should create faction state and update reputation', async () => {
      const response = await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'scholars', amount: 30 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.factionId).toBe('scholars');
      expect(response.body.data.reputation).toBe(30);
      expect(response.body.data.tier).toBe('Member');
      expect(response.body.data.joinedAt).toBeTruthy();
    });

    it('should accumulate reputation across multiple updates', async () => {
      await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'merchants', amount: 20 });

      const response = await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'merchants', amount: 35 });

      expect(response.body.data.reputation).toBe(55);
      expect(response.body.data.tier).toBe('Trusted');
    });

    it('should clamp reputation at 100', async () => {
      const response = await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'artisans', amount: 100 });

      expect(response.body.data.reputation).toBe(100);
      expect(response.body.data.tier).toBe('Elder');
    });

    it('should clamp reputation at 0 (no negative)', async () => {
      const response = await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'travelers', amount: -50 });

      expect(response.body.data.reputation).toBe(0);
      expect(response.body.data.tier).toBe('Outsider');
    });

    it('should handle negative amount reducing existing reputation', async () => {
      await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'guardians', amount: 60 });

      const response = await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'guardians', amount: -20 });

      expect(response.body.data.reputation).toBe(40);
      expect(response.body.data.tier).toBe('Member');
    });

    it('should reject invalid factionId', async () => {
      const response = await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'pirates', amount: 10 });

      expect(response.status).toBe(400);
    });

    it('should reject missing amount', async () => {
      const response = await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'scholars' });

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/factions/update')
        .send({ factionId: 'scholars', amount: 10 });

      expect(response.status).toBe(401);
    });

    it('should track multiple factions independently', async () => {
      await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'scholars', amount: 80 });

      await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'artists', amount: 30 });

      const response = await request(app)
        .get('/api/v1/factions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data.factions.scholars.reputation).toBe(80);
      expect(response.body.data.factions.scholars.tier).toBe('Elder');
      expect(response.body.data.factions.artists.reputation).toBe(30);
      expect(response.body.data.factions.artists.tier).toBe('Member');
    });
  });

  // ==================== Tier auto-calculation ====================

  describe('Tier auto-calculation', () => {
    it('should be Outsider for 0-25', async () => {
      const response = await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'scholars', amount: 25 });

      expect(response.body.data.tier).toBe('Outsider');
    });

    it('should be Member for 26-50', async () => {
      const response = await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'scholars', amount: 26 });

      expect(response.body.data.tier).toBe('Member');
    });

    it('should be Trusted for 51-75', async () => {
      const response = await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'scholars', amount: 51 });

      expect(response.body.data.tier).toBe('Trusted');
    });

    it('should be Elder for 76-100', async () => {
      const response = await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'scholars', amount: 76 });

      expect(response.body.data.tier).toBe('Elder');
    });
  });

  // ==================== GET /api/v1/factions ====================

  describe('GET /api/v1/factions', () => {
    it('should return empty factions for new user', async () => {
      const response = await request(app)
        .get('/api/v1/factions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.factions).toEqual({});
    });

    it('should return all faction states for user', async () => {
      await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'scholars', amount: 40 });

      await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'merchants', amount: 60 });

      const response = await request(app)
        .get('/api/v1/factions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Object.keys(response.body.data.factions)).toHaveLength(2);
      expect(response.body.data.factions.scholars.reputation).toBe(40);
      expect(response.body.data.factions.merchants.reputation).toBe(60);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/factions');

      expect(response.status).toBe(401);
    });

    it('should isolate data between users', async () => {
      // User 1 sets faction
      await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'scholars', amount: 90 });

      // User 2 should see empty
      const { token: token2 } = await createTestUser();
      const response = await request(app)
        .get('/api/v1/factions')
        .set('Authorization', `Bearer ${token2}`);

      expect(response.body.data.factions).toEqual({});
    });
  });

  // ==================== GET /api/v1/factions/:factionId/rankings ====================

  describe('GET /api/v1/factions/:factionId/rankings', () => {
    it('should return empty rankings when no players', async () => {
      const response = await request(app)
        .get('/api/v1/factions/scholars/rankings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return ranked players sorted by reputation', async () => {
      // User 1: scholars = 80
      await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'scholars', amount: 80 });

      // User 2: scholars = 50
      const { token: token2 } = await createTestUser();
      await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${token2}`)
        .send({ factionId: 'scholars', amount: 50 });

      // User 3: scholars = 95
      const { token: token3 } = await createTestUser();
      await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${token3}`)
        .send({ factionId: 'scholars', amount: 95 });

      const response = await request(app)
        .get('/api/v1/factions/scholars/rankings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].reputation).toBe(95);
      expect(response.body.data[0].rank).toBe(1);
      expect(response.body.data[1].reputation).toBe(80);
      expect(response.body.data[1].rank).toBe(2);
      expect(response.body.data[2].reputation).toBe(50);
      expect(response.body.data[2].rank).toBe(3);
    });

    it('should only include the requested faction', async () => {
      // User has scholars and merchants
      await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'scholars', amount: 70 });

      await request(app)
        .post('/api/v1/factions/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ factionId: 'merchants', amount: 40 });

      const response = await request(app)
        .get('/api/v1/factions/merchants/rankings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].reputation).toBe(40);
    });

    it('should reject invalid factionId param', async () => {
      const response = await request(app)
        .get('/api/v1/factions/pirates/rankings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/factions/scholars/rankings');

      expect(response.status).toBe(401);
    });
  });
});
