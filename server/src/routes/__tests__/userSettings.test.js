/**
 * userSettings.test.js
 * GROW-024 — Player settings sync API tests
 * Routes: GET /api/v1/user/settings, POST /api/v1/user/settings
 */
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { createTestUser } from '../../../test/helpers.js';

describe('User Settings Routes', () => {
  let authToken;

  beforeEach(async () => {
    const { token } = await createTestUser();
    authToken = token;
  });

  // ── GET /api/v1/user/settings ─────────────────────────────────────────────

  describe('GET /api/v1/user/settings', () => {
    it('returns empty settings for a new user', async () => {
      const res = await request(app)
        .get('/api/v1/user/settings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.settings).toBeDefined();
      expect(res.body.data.syncVersion).toBeDefined();
    });

    it('returns 401 without auth token', async () => {
      const res = await request(app).get('/api/v1/user/settings');
      expect(res.status).toBe(401);
    });

    it('returns saved settings after a POST', async () => {
      await request(app)
        .post('/api/v1/user/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ masterVolume: 80, isMuted: false });

      const res = await request(app)
        .get('/api/v1/user/settings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.settings.masterVolume).toBe(80);
      expect(res.body.data.settings.isMuted).toBe(false);
    });
  });

  // ── POST /api/v1/user/settings ────────────────────────────────────────────

  describe('POST /api/v1/user/settings', () => {
    it('saves valid settings and returns them', async () => {
      const res = await request(app)
        .post('/api/v1/user/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ masterVolume: 75, showTransliteration: true, difficulty: 'hard' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.settings.masterVolume).toBe(75);
      expect(res.body.data.settings.showTransliteration).toBe(true);
      expect(res.body.data.settings.difficulty).toBe('hard');
    });

    it('increments syncVersion on each save', async () => {
      const r1 = await request(app)
        .post('/api/v1/user/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ masterVolume: 50 });

      const r2 = await request(app)
        .post('/api/v1/user/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ masterVolume: 60 });

      expect(r2.body.data.syncVersion).toBeGreaterThan(r1.body.data.syncVersion);
    });

    it('merges partial settings (last-write-wins)', async () => {
      await request(app)
        .post('/api/v1/user/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ masterVolume: 50, isMuted: false });

      await request(app)
        .post('/api/v1/user/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ masterVolume: 90 });

      const res = await request(app)
        .get('/api/v1/user/settings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.body.data.settings.masterVolume).toBe(90);
      expect(res.body.data.settings.isMuted).toBe(false); // preserved from first POST
    });

    it('rejects unknown fields (Zod strict)', async () => {
      const res = await request(app)
        .post('/api/v1/user/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ unknownField: 'bad', masterVolume: 50 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects masterVolume > 100', async () => {
      const res = await request(app)
        .post('/api/v1/user/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ masterVolume: 150 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects masterVolume < 0', async () => {
      const res = await request(app)
        .post('/api/v1/user/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ masterVolume: -1 });

      expect(res.status).toBe(400);
    });

    it('rejects invalid battleSpeed value', async () => {
      const res = await request(app)
        .post('/api/v1/user/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ battleSpeed: 0.75 });

      expect(res.status).toBe(400);
    });

    it('accepts valid battleSpeed values', async () => {
      for (const speed of [0.5, 1.0, 1.5, 2.0]) {
        const res = await request(app)
          .post('/api/v1/user/settings')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ battleSpeed: speed });

        expect(res.status).toBe(200);
        expect(res.body.data.settings.battleSpeed).toBe(speed);
      }
    });

    it('returns 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/v1/user/settings')
        .send({ masterVolume: 50 });

      expect(res.status).toBe(401);
    });
  });
});
