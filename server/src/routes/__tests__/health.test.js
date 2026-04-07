/**
 * health.test.js
 * GROW-025 — Health check and status API endpoint
 * Routes: GET /health, GET /health/detailed
 */
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { createTestUser } from '../../../test/helpers.js';

describe('Health Routes', () => {
  // ── GET /health ───────────────────────────────────────────────────────────

  describe('GET /health', () => {
    it('returns 200 with required fields', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBeDefined();
      expect(res.body.uptime).toBeGreaterThanOrEqual(0);
      expect(res.body.version).toBeDefined();
      expect(res.body.database).toMatch(/^(connected|disconnected)$/);
      expect(res.body.timestamp).toBeDefined();
    });

    it('returns a valid ISO timestamp', async () => {
      const res = await request(app).get('/health');
      expect(() => new Date(res.body.timestamp)).not.toThrow();
      expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
    });

    it('is accessible without authentication', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
    });

    it('includes responseMs field', async () => {
      const res = await request(app).get('/health');
      expect(typeof res.body.responseMs).toBe('number');
      expect(res.body.responseMs).toBeGreaterThanOrEqual(0);
    });

    it('responds within 100ms', async () => {
      const start = Date.now();
      await request(app).get('/health');
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(100);
    });

    it('database field is connected when MongoDB is up (MongoMemoryServer)', async () => {
      const res = await request(app).get('/health');
      // MongoMemoryServer is running in tests — expect connected
      expect(res.body.database).toBe('connected');
      expect(res.body.status).toBe('ok');
    });
  });

  // ── GET /health/detailed ──────────────────────────────────────────────────

  describe('GET /health/detailed', () => {
    let authToken;

    beforeEach(async () => {
      const { token } = await createTestUser();
      authToken = token;
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).get('/health/detailed');
      expect(res.status).toBe(401);
    });

    it('returns 200 with auth and includes memory + requestCount', async () => {
      const res = await request(app)
        .get('/health/detailed')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBeDefined();
      expect(res.body.database).toBeDefined();
      expect(res.body.memory).toBeDefined();
      expect(typeof res.body.memory.heapUsedMB).toBe('number');
      expect(typeof res.body.memory.heapTotalMB).toBe('number');
      expect(typeof res.body.memory.rssMB).toBe('number');
      expect(typeof res.body.requestCount).toBe('number');
    });

    it('includes all basic health fields in detailed response', async () => {
      const res = await request(app)
        .get('/health/detailed')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.body.uptime).toBeGreaterThanOrEqual(0);
      expect(res.body.version).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.responseMs).toBeGreaterThanOrEqual(0);
    });

    it('requestCount increases with each request', async () => {
      const r1 = await request(app)
        .get('/health/detailed')
        .set('Authorization', `Bearer ${authToken}`);

      const r2 = await request(app)
        .get('/health/detailed')
        .set('Authorization', `Bearer ${authToken}`);

      expect(r2.body.requestCount).toBeGreaterThan(r1.body.requestCount);
    });
  });
});
