import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gogo-arabic';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

async function start() {
  try {
    // Validate JWT_SECRET before starting
    const jwtSecret = process.env.JWT_SECRET;
    const isDev = process.env.NODE_ENV !== 'production';

    if (!jwtSecret || jwtSecret.trim() === '') {
      if (isDev) {
        logger.warn(
          'JWT_SECRET is not set. Using default for local development. ' +
          'DO NOT use this in production!'
        );
        process.env.JWT_SECRET = 'dev-default-secret-do-not-use-in-production!!';
      } else {
        logger.error('JWT_SECRET environment variable is required in production');
        process.exit(1);
      }
    } else if (jwtSecret.length < 32) {
      if (isDev) {
        logger.warn(
          `JWT_SECRET is only ${jwtSecret.length} characters. ` +
          'Use at least 32 characters for adequate security.'
        );
      } else {
        logger.error(
          'JWT_SECRET must be at least 32 characters long in production ' +
          `(current length: ${jwtSecret.length})`
        );
        process.exit(1);
      }
    }

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB', { uri: MONGODB_URI.replace(/:[^:@]+@/, ':****@') });

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        port: PORT,
        env: process.env.NODE_ENV || 'development',
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! Shutting down...', {
        error: err.message,
        stack: err.stack,
      });
      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

  } catch (err) {
    logger.error('Failed to start server', {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  }
}

start();
