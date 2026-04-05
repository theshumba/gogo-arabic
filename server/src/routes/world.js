import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { saveWorldState, getWorldState } from '../controllers/worldController.js';
import { saveWorldStateSchema } from '../validation/worldSchemas.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Load world state
router.get('/state', authenticate, getWorldState);

// Save world state (additive merge)
router.post('/state', authenticate, validate(saveWorldStateSchema), saveWorldState);

export default router;
