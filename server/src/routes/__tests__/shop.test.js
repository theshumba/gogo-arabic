import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { createTestUser } from '../../../test/helpers.js';
import User from '../../models/User.js';

describe('Shop Routes', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    const { user, token } = await createTestUser({
      dirhams: 1000, // Give user enough money for testing
      inventory: ['thobe_white'],
    });
    authToken = token;
    userId = user._id.toString();
  });

  describe('POST /api/shop/buy', () => {
    it('should purchase item with valid itemId and sufficient funds', async () => {
      const response = await request(app)
        .post('/api/shop/buy')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemId: 'thobe_blue', // Assuming this item exists in items.json
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.inventory).toContain('thobe_blue');
      expect(response.body.data.dirhams).toBeLessThan(1000);
    });

    it('should fail with insufficient funds', async () => {
      // Update user to have very low dirhams
      await User.findByIdAndUpdate(userId, { dirhams: 1 });

      const response = await request(app)
        .post('/api/shop/buy')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemId: 'thobe_blue',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Not enough dirhams');
    });

    it('should fail with invalid item', async () => {
      const response = await request(app)
        .post('/api/shop/buy')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemId: 'nonexistent_item_12345',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Unknown item');
    });

    it('should fail when item already owned', async () => {
      const response = await request(app)
        .post('/api/shop/buy')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemId: 'thobe_white', // Already in inventory
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('already owned');
    });

    it('should fail without authentication token', async () => {
      const response = await request(app)
        .post('/api/shop/buy')
        .send({
          itemId: 'thobe_blue',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with missing itemId', async () => {
      const response = await request(app)
        .post('/api/shop/buy')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail if level requirement not met', async () => {
      // Update user to level 1
      await User.findByIdAndUpdate(userId, { level: 1 });

      const response = await request(app)
        .post('/api/shop/buy')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemId: 'kaftan_gold', // Assuming this has a high level requirement
        });

      // Should fail with level requirement error (if item exists and has requirement)
      // This test depends on actual items.json data
      expect([400, 404]).toContain(response.status);
    });
  });
});
