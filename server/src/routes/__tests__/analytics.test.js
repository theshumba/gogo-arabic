import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { createTestUser } from '../../../test/helpers.js';
import AnalyticsEvent from '../../models/AnalyticsEvent.js';

describe('Analytics Routes', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    const { user, token } = await createTestUser();
    authToken = token;
    userId = user._id.toString();
  });

  describe('POST /api/v1/analytics/events', () => {
    it('should ingest a batch of events', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          events: [
            { event: 'session_start', sessionId: 'sess_001', properties: { device: 'mobile' } },
            { event: 'quiz_completed', sessionId: 'sess_001', properties: { score: 85 } },
            { event: 'session_end', sessionId: 'sess_001' },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.ingested).toBe(3);

      const stored = await AnalyticsEvent.find({ userId });
      expect(stored).toHaveLength(3);
    });

    it('should ingest a single event batch', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          events: [
            { event: 'battle_started', properties: { zone: 'oasis', enemyId: 'sand_golem' } },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.data.ingested).toBe(1);
    });

    it('should accept all valid event types', async () => {
      const validEvents = [
        'session_start',
        'session_end',
        'quiz_completed',
        'battle_started',
        'lesson_completed',
        'feature_used',
      ];

      const response = await request(app)
        .post('/api/v1/analytics/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          events: validEvents.map((event) => ({ event })),
        });

      expect(response.status).toBe(201);
      expect(response.body.data.ingested).toBe(6);
    });

    it('should use defaults for optional fields', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          events: [{ event: 'feature_used' }],
        });

      expect(response.status).toBe(201);

      const stored = await AnalyticsEvent.findOne({ userId });
      expect(stored.properties).toEqual({});
      expect(stored.sessionId).toBe('');
      expect(stored.timestamp).toBeDefined();
    });

    it('should accept custom timestamp', async () => {
      const customTime = '2026-03-15T10:30:00.000Z';
      const response = await request(app)
        .post('/api/v1/analytics/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          events: [{ event: 'session_start', timestamp: customTime }],
        });

      expect(response.status).toBe(201);

      const stored = await AnalyticsEvent.findOne({ userId });
      expect(stored.timestamp.toISOString()).toBe(customTime);
    });

    it('should reject invalid event type', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          events: [{ event: 'invalid_event_type' }],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject empty events array', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          events: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject more than 50 events', async () => {
      const events = Array.from({ length: 51 }, () => ({ event: 'feature_used' }));

      const response = await request(app)
        .post('/api/v1/analytics/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ events });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should accept exactly 50 events', async () => {
      const events = Array.from({ length: 50 }, () => ({ event: 'feature_used' }));

      const response = await request(app)
        .post('/api/v1/analytics/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ events });

      expect(response.status).toBe(201);
      expect(response.body.data.ingested).toBe(50);
    });

    it('should reject missing events field', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/events')
        .send({
          events: [{ event: 'session_start' }],
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should isolate events between users', async () => {
      const { token: otherToken } = await createTestUser({ email: 'other@example.com' });

      await request(app)
        .post('/api/v1/analytics/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          events: [{ event: 'session_start' }, { event: 'session_end' }],
        });

      await request(app)
        .post('/api/v1/analytics/events')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          events: [{ event: 'quiz_completed' }],
        });

      const userEvents = await AnalyticsEvent.find({ userId });
      expect(userEvents).toHaveLength(2);
      expect(userEvents.every((e) => e.userId.toString() === userId)).toBe(true);
    });

    it('should rate limit batch ingestion', async () => {
      // First request should succeed
      const first = await request(app)
        .post('/api/v1/analytics/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          events: [{ event: 'session_start' }],
        });

      expect(first.status).toBe(201);

      // Second request within 10s should be rate limited
      const second = await request(app)
        .post('/api/v1/analytics/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          events: [{ event: 'session_end' }],
        });

      expect(second.status).toBe(429);
    });
  });

  describe('TTL index', () => {
    it('should have TTL index on timestamp field', async () => {
      const indexes = await AnalyticsEvent.collection.indexes();
      const ttlIndex = indexes.find(
        (idx) => idx.key && idx.key.timestamp === 1 && idx.expireAfterSeconds != null
      );
      expect(ttlIndex).toBeDefined();
      expect(ttlIndex.expireAfterSeconds).toBe(90 * 24 * 60 * 60);
    });
  });
});
