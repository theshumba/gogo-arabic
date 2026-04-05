import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { createTestUser } from '../../../test/helpers.js';
import NpcState from '../../models/NpcState.js';

describe('NPC Routes', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    const { user, token } = await createTestUser();
    authToken = token;
    userId = user._id.toString();
  });

  describe('POST /api/v1/npcs/:npcId/state', () => {
    it('should save NPC state for a new NPC', async () => {
      const response = await request(app)
        .post('/api/v1/npcs/merchant_ali/state')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          relationship: 75,
          dialogueChoices: ['greeted', 'asked_about_wares'],
          questsGiven: ['fetch_spices'],
          lastInteraction: '2026-04-05T12:00:00Z',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.npcId).toBe('merchant_ali');
      expect(response.body.data.relationship).toBe(75);
      expect(response.body.data.dialogueChoices).toEqual(['greeted', 'asked_about_wares']);
      expect(response.body.data.questsGiven).toEqual(['fetch_spices']);
    });

    it('should upsert existing NPC state', async () => {
      // Create initial state
      await NpcState.create({
        userId,
        npcId: 'scholar_fatima',
        relationship: 50,
        dialogueChoices: ['intro'],
      });

      // Update state
      const response = await request(app)
        .post('/api/v1/npcs/scholar_fatima/state')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ relationship: 80 });

      expect(response.status).toBe(200);
      expect(response.body.data.relationship).toBe(80);

      // Verify only one record exists
      const count = await NpcState.countDocuments({ userId, npcId: 'scholar_fatima' });
      expect(count).toBe(1);
    });

    it('should reject relationship out of range', async () => {
      const response = await request(app)
        .post('/api/v1/npcs/merchant_ali/state')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ relationship: 150 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject negative relationship', async () => {
      const response = await request(app)
        .post('/api/v1/npcs/merchant_ali/state')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ relationship: -10 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/npcs/merchant_ali/state')
        .send({ relationship: 50 });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should save state with empty body (defaults)', async () => {
      const response = await request(app)
        .post('/api/v1/npcs/guard_omar/state')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.npcId).toBe('guard_omar');
      expect(response.body.data.relationship).toBe(50); // default
    });
  });

  describe('GET /api/v1/npcs/:npcId/state', () => {
    it('should load NPC state', async () => {
      await NpcState.create({
        userId,
        npcId: 'merchant_ali',
        relationship: 65,
        dialogueChoices: ['greeted'],
        questsGiven: [],
      });

      const response = await request(app)
        .get('/api/v1/npcs/merchant_ali/state')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.npcId).toBe('merchant_ali');
      expect(response.body.data.relationship).toBe(65);
    });

    it('should return 404 for missing NPC state', async () => {
      const response = await request(app)
        .get('/api/v1/npcs/nonexistent_npc/state')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should not return other user NPC state', async () => {
      const { user: otherUser } = await createTestUser({ email: 'other@example.com' });
      await NpcState.create({
        userId: otherUser._id,
        npcId: 'merchant_ali',
        relationship: 90,
      });

      const response = await request(app)
        .get('/api/v1/npcs/merchant_ali/state')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/npcs/merchant_ali/state');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/npcs/states', () => {
    it('should return all NPC states for user', async () => {
      await NpcState.create([
        { userId, npcId: 'merchant_ali', relationship: 65 },
        { userId, npcId: 'scholar_fatima', relationship: 80 },
        { userId, npcId: 'guard_omar', relationship: 30 },
      ]);

      const response = await request(app)
        .get('/api/v1/npcs/states')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
    });

    it('should return empty array for new user', async () => {
      const response = await request(app)
        .get('/api/v1/npcs/states')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toHaveLength(0);
    });

    it('should not return other user NPC states', async () => {
      const { user: otherUser } = await createTestUser({ email: 'other2@example.com' });
      await NpcState.create([
        { userId, npcId: 'merchant_ali', relationship: 65 },
        { userId: otherUser._id, npcId: 'merchant_ali', relationship: 90 },
      ]);

      const response = await request(app)
        .get('/api/v1/npcs/states')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].relationship).toBe(65);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/npcs/states');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return states sorted by npcId', async () => {
      await NpcState.create([
        { userId, npcId: 'zara_healer', relationship: 40 },
        { userId, npcId: 'ali_merchant', relationship: 60 },
        { userId, npcId: 'omar_guard', relationship: 55 },
      ]);

      const response = await request(app)
        .get('/api/v1/npcs/states')
        .set('Authorization', `Bearer ${authToken}`);

      const npcIds = response.body.data.map(s => s.npcId);
      expect(npcIds).toEqual(['ali_merchant', 'omar_guard', 'zara_healer']);
    });
  });
});
