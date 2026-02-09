import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { createTestUser } from '../../../test/helpers.js';
import User from '../../models/User.js';

describe('Game Routes', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    const { user, token } = await createTestUser();
    authToken = token;
    userId = user._id.toString();
  });

  describe('GET /api/game/load', () => {
    it('should load game state when authenticated', async () => {
      const response = await request(app)
        .get('/api/game/load')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.gameState).toBeDefined();
      expect(response.body.data.gameState.player).toBeDefined();
      expect(response.body.data.gameState.player.level).toBeDefined();
      expect(response.body.data.syncVersion).toBeDefined();
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/game/load');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/game/save', () => {
    it('should save game state successfully', async () => {
      const response = await request(app)
        .post('/api/game/save')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          player: {
            level: 5,
            xp: 500,
            xpToNext: 600,
            dirhams: 150,
            streak: 3,
            wordsLearned: 50,
            lettersLearned: 10,
            totalQuizzes: 25,
            correctAnswers: 20,
            character: {
              bodyType: 'default',
              skinTone: 'medium',
              outfit: 'thobe_blue',
            },
            inventory: ['thobe_white', 'thobe_blue'],
          },
          settings: {
            volumeAmbience: 0.5,
            volumeSFX: 0.7,
            showDiacritics: true,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.syncVersion).toBeDefined();
      expect(response.body.data.syncVersion).toBeGreaterThan(0);

      // Verify data was saved
      const user = await User.findById(userId);
      expect(user.level).toBe(5);
      expect(user.xp).toBe(500);
      expect(user.dirhams).toBe(150);
    });

    it('should increment sync version on save', async () => {
      const user = await User.findById(userId);
      const initialVersion = user.syncVersion;

      const response = await request(app)
        .post('/api/game/save')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          player: {
            level: 2,
            xp: 100,
            xpToNext: 200,
            dirhams: 100,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.syncVersion).toBe(initialVersion + 1);
    });

    it('should detect sync conflict when client version is behind', async () => {
      // Simulate server having newer version
      await User.findByIdAndUpdate(userId, { syncVersion: 5 });

      const response = await request(app)
        .post('/api/game/save')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientVersion: 3, // Client is behind
          player: {
            level: 3,
            xp: 200,
          },
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('SYNC_CONFLICT');
      expect(response.body.error.serverState).toBeDefined();
      expect(response.body.error.serverVersion).toBe(5);
    });

    it('should accept save when client version matches server', async () => {
      // Set server version to 2
      await User.findByIdAndUpdate(userId, { syncVersion: 2 });

      const response = await request(app)
        .post('/api/game/save')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientVersion: 2, // Matches server
          player: {
            level: 4,
            xp: 300,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.syncVersion).toBe(3);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/game/save')
        .send({
          player: { level: 5 },
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/game/resolve', () => {
    it('should resolve conflict with merged state', async () => {
      // Set up a conflict scenario
      await User.findByIdAndUpdate(userId, {
        syncVersion: 5,
        level: 10,
        dirhams: 500,
      });

      const response = await request(app)
        .post('/api/game/resolve')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          baseVersion: 5,
          resolvedState: {
            player: {
              level: 11, // Merged higher level
              xp: 1000,
              xpToNext: 1200,
              dirhams: 600, // Merged higher dirhams
              streak: 5,
              wordsLearned: 100,
              lettersLearned: 20,
              totalQuizzes: 50,
              correctAnswers: 45,
              character: {
                bodyType: 'default',
                skinTone: 'medium',
                outfit: 'thobe_white',
              },
              inventory: ['thobe_white'],
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.syncVersion).toBe(6);

      // Verify merged state was saved
      const user = await User.findById(userId);
      expect(user.level).toBe(11);
      expect(user.dirhams).toBe(600);
    });

    it('should fail if base version does not match current server version', async () => {
      await User.findByIdAndUpdate(userId, { syncVersion: 5 });

      const response = await request(app)
        .post('/api/game/resolve')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          baseVersion: 3, // Does not match server version 5
          resolvedState: {
            player: {
              level: 5,
              xp: 400,
            },
          },
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('SYNC_CONFLICT');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/game/resolve')
        .send({
          baseVersion: 1,
          resolvedState: { player: { level: 5 } },
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
