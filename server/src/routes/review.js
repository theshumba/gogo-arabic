import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { syncCards, getCards } from '../controllers/reviewController.js';
import { syncCardsSchema } from '../validation/reviewSchemas.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Apply API rate limiter to all routes
router.use(apiLimiter);

router.get('/cards', authenticate, getCards);
router.post('/sync', authenticate, validate(syncCardsSchema), syncCards);

export default router;
