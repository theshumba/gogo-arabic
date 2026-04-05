import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createRequire } from 'module';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import reviewRoutes from './routes/review.js';
import questRoutes from './routes/quest.js';
import shopRoutes from './routes/shop.js';
import gameRoutes from './routes/game.js';
import npcRoutes from './routes/npc.js';
import worldRoutes from './routes/world.js';
import battleRoutes from './routes/battle.js';
import achievementRoutes from './routes/achievement.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { validateCsrfToken } from './middleware/csrf.js';
import logger from './utils/logger.js';

const require = createRequire(import.meta.url);
const packageJson = require('../../package.json');

const app = express();

// Trust proxy - important for rate limiting and IP logging behind proxies
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS configuration with whitelist
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(origin => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Cookie parsing
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Global rate limiting
app.use(globalLimiter);

// CSRF protection for cookie-based auth
app.use(validateCsrfToken);

// API Routes with versioning (v1)
const API_VERSION = '/api/v1';

app.use(`${API_VERSION}/auth`, authRoutes);
app.use(`${API_VERSION}/user`, userRoutes);
app.use(`${API_VERSION}/review`, reviewRoutes);
app.use(`${API_VERSION}/quest`, questRoutes);
app.use(`${API_VERSION}/shop`, shopRoutes);
app.use(`${API_VERSION}/game`, gameRoutes);
app.use(`${API_VERSION}/npcs`, npcRoutes);
app.use(`${API_VERSION}/world`, worldRoutes);
app.use(`${API_VERSION}/battles`, battleRoutes);
app.use(`${API_VERSION}/achievements`, achievementRoutes);

// Backward compatibility - redirect old API routes to v1
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/quest', questRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/npcs', npcRoutes);
app.use('/api/world', worldRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/achievements', achievementRoutes);

// Health check endpoints
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      version: packageJson.version,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

app.get(`${API_VERSION}/health`, (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      version: packageJson.version,
      apiVersion: 'v1',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Centralized error handler (must be last)
app.use(errorHandler);

export default app;
