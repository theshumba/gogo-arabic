import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { syncQuests, getQuests } from '../controllers/questController.js';
import { syncQuestsSchema, paginationQuerySchema } from '../validation/questSchemas.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Apply API rate limiter to all routes
router.use(apiLimiter);

router.get('/', authenticate, validate(paginationQuerySchema, 'query'), getQuests);
router.post('/sync', authenticate, validate(syncQuestsSchema), syncQuests);

export default router;
