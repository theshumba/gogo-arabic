import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from 'vitest';

let mongoServer;

// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key-for-testing-only-32chars!';
process.env.NODE_ENV = 'test';
// Disable rate limiting in tests by setting very high limits
process.env.RATE_LIMIT_GLOBAL = '10000';
process.env.RATE_LIMIT_AUTH = '10000';
process.env.RATE_LIMIT_API = '10000';
process.env.RATE_LIMIT_SHOP = '10000';

beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect mongoose to the in-memory database
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Disconnect and stop the in-memory database
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear all collections after each test for isolation
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
