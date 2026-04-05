import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upsertScore, getTopPlayers, getMyRank } from '../controllers/leaderboardController.js';
import { upsertScoreSchema, categoryParamSchema, leaderboardQuerySchema } from '../validation/leaderboardSchemas.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { AppError } from '../utils/AppError.js';

const router = Router();

// Apply general API rate limiter to all routes
router.use(apiLimiter);

// Score update rate limiter: 1 update per 30s per user
const scoreUpdateLimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `leaderboard:${req.userId || req.ip}`,
  handler: (req, res, next) => {
    next(AppError.tooManyRequests('Score updates limited to once per 30 seconds'));
  },
});

// my-rank must come before :category to avoid matching "my-rank" as a category
router.get('/my-rank/:category', authenticate, validate(categoryParamSchema, 'params'), getMyRank);

// Top players for a category
router.get('/:category', authenticate, validate(categoryParamSchema, 'params'), validate(leaderboardQuerySchema, 'query'), getTopPlayers);

// Upsert score
router.post('/score', authenticate, scoreUpdateLimiter, validate(upsertScoreSchema), upsertScore);

export default router;
