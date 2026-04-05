import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { createTestUser } from '../../../test/helpers.js';
import WorldState from '../../models/WorldState.js';

describe('World State Routes', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    const { user, token } = await createTestUser();
    authToken = token;
    userId = user._id.toString();
  });

  describe('POST /api/v1/world/state', () => {
    it('should create world state for new user', async () => {
      const response = await request(app)
        .post('/api/v1/world/state')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          flags: { met_scholar: true, quest_intro_complete: true },
          factionControl: { oasis: 'merchants' },
          zoneEvents: [{ eventId: 'evt_1', zone: 'oasis', type: 'discovery' }],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.flags).toMatchObject({ met_scholar: true, quest_intro_complete: true });
      expect(response.body.data.factionControl).toMatchObject({ oasis: 'merchants' });
      expect(response.body.data.zoneEvents).toHaveLength(1);
    });

    it('should merge flags additively (OR logic)', async () => {
      // Create initial state with some flags
      await WorldState.create({
        userId,
        flags: { met_scholar: true, unlock_library: true },
        factionControl: {},
        zoneEvents: [],
      });

      // Send new flags — should merge, not replace
      const response = await request(app)
        .post('/api/v1/world/state')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          flags: { met_guard: true, unlock_market: true },
        });

      expect(response.status).toBe(200);
      // Original flags preserved
      expect(response.body.data.flags.met_scholar).toBe(true);
      expect(response.body.data.flags.unlock_library).toBe(true);
      // New flags added
      expect(response.body.data.flags.met_guard).toBe(true);
      expect(response.body.data.flags.unlock_market).toBe(true);
    });

    it('should merge factionControl additively', async () => {
      await WorldState.create({
        userId,
        flags: {},
        factionControl: { oasis: 'merchants' },
        zoneEvents: [],
      });

      const response = await request(app)
        .post('/api/v1/world/state')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          factionControl: { desert: 'nomads' },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.factionControl.oasis).toBe('merchants');
      expect(response.body.data.factionControl.desert).toBe('nomads');
    });

    it('should deduplicate zone events by eventId', async () => {
      await WorldState.create({
        userId,
        flags: {},
        factionControl: {},
        zoneEvents: [{ eventId: 'evt_1', zone: 'oasis', type: 'discovery' }],
      });

      const response = await request(app)
        .post('/api/v1/world/state')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          zoneEvents: [
            { eventId: 'evt_1', zone: 'oasis', type: 'discovery' }, // duplicate
            { eventId: 'evt_2', zone: 'desert', type: 'battle' },   // new
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.data.zoneEvents).toHaveLength(2);
    });

    it('should save with empty body (defaults)', async () => {
      const response = await request(app)
        .post('/api/v1/world/state')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject invalid zoneEvents shape', async () => {
      const response = await request(app)
        .post('/api/v1/world/state')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          zoneEvents: [{ invalid: true }],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/world/state')
        .send({ flags: { test: true } });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should not overwrite existing flags with new save', async () => {
      // First save
      await request(app)
        .post('/api/v1/world/state')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ flags: { flag_a: true, flag_b: true } });

      // Second save with only new flags
      const response = await request(app)
        .post('/api/v1/world/state')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ flags: { flag_c: true } });

      expect(response.body.data.flags.flag_a).toBe(true);
      expect(response.body.data.flags.flag_b).toBe(true);
      expect(response.body.data.flags.flag_c).toBe(true);
    });
  });

  describe('GET /api/v1/world/state', () => {
    it('should load world state', async () => {
      await WorldState.create({
        userId,
        flags: { met_scholar: true },
        factionControl: { oasis: 'merchants' },
        zoneEvents: [{ eventId: 'evt_1', zone: 'oasis', type: 'discovery' }],
      });

      const response = await request(app)
        .get('/api/v1/world/state')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.flags.met_scholar).toBe(true);
      expect(response.body.data.factionControl.oasis).toBe('merchants');
      expect(response.body.data.zoneEvents).toHaveLength(1);
    });

    it('should return empty state for new user', async () => {
      const response = await request(app)
        .get('/api/v1/world/state')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.flags).toEqual({});
      expect(response.body.data.factionControl).toEqual({});
      expect(response.body.data.zoneEvents).toEqual([]);
      expect(response.body.data.lastUpdated).toBeNull();
    });

    it('should not return other user world state', async () => {
      const { user: otherUser } = await createTestUser({ email: 'other@example.com' });
      await WorldState.create({
        userId: otherUser._id,
        flags: { secret_flag: true },
        factionControl: {},
        zoneEvents: [],
      });

      const response = await request(app)
        .get('/api/v1/world/state')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.flags).toEqual({});
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/world/state');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
