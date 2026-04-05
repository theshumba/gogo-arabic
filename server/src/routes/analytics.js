import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { batchIngestEvents } from '../controllers/analyticsController.js';
import { batchIngestSchema } from '../validation/analyticsSchemas.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { AppError } from '../utils/AppError.js';

const router = Router();

// Apply general API rate limiter to all routes
router.use(apiLimiter);

// Analytics batch ingest rate limiter: 1 batch per 10s per user
const analyticsIngestLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `analytics:${req.userId || req.ip}`,
  handler: (req, res, next) => {
    next(AppError.tooManyRequests('Analytics batch limited to once per 10 seconds'));
  },
});

// Batch ingest events
router.post('/events', authenticate, analyticsIngestLimiter, validate(batchIngestSchema), batchIngestEvents);

export default router;
