import jwt from 'jsonwebtoken';
import User from '../src/models/User.js';

/**
 * Generate a valid JWT token for testing
 * @param {string} userId - The user's MongoDB ObjectId
 * @returns {string} JWT token
 */
export function createAuthToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

/**
 * Create a test user in the database and return user + token
 * @param {Object} overrides - Fields to override default test user data
 * @returns {Promise<{user: Object, token: string}>}
 */
export async function createTestUser(overrides = {}) {
  const defaultUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`, // Unique email per test
    password: 'password123',
    inventory: ['thobe_white'],
  };

  const user = await User.create({ ...defaultUser, ...overrides });
  const token = createAuthToken(user._id.toString());

  return { user, token };
}
