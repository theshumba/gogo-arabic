import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { createTestUser } from '../../../test/helpers.js';

describe('User Routes', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    const { user, token } = await createTestUser();
    authToken = token;
    userId = user._id.toString();
  });

  describe('GET /api/user/profile', () => {
    it('should return user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data._id).toBe(userId);
      expect(response.body.data.email).toBeDefined();
      expect(response.body.data.name).toBeDefined();
      expect(response.body.data.password).toBeUndefined(); // Password should not be returned
    });

    it('should fail without authentication token', async () => {
      const response = await request(app)
        .get('/api/user/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid authentication token', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/user/profile', () => {
    it('should update user profile with valid data', async () => {
      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          character: {
            bodyType: 'athletic',
            skinTone: 'dark',
            outfit: 'thobe_blue',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.character.bodyType).toBe('athletic');
      expect(response.body.data.character.outfit).toBe('thobe_blue');
    });

    it('should update only provided fields', async () => {
      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Partial Update',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Partial Update');
    });

    it('should fail without authentication token', async () => {
      const response = await request(app)
        .put('/api/user/profile')
        .send({
          name: 'Should Fail',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should update settings', async () => {
      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          settings: {
            volumeAmbience: 0.5,
            volumeSFX: 0.8,
            showDiacritics: false,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.settings.volumeAmbience).toBe(0.5);
      expect(response.body.data.settings.showDiacritics).toBe(false);
    });
  });
});
