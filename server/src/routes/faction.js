import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateReputation, getAllFactions, getFactionRankings } from '../controllers/factionController.js';
import { updateReputationSchema, factionIdParamSchema } from '../validation/factionSchemas.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Apply general API rate limiter to all routes
router.use(apiLimiter);

// Get all faction states for user
router.get('/', authenticate, getAllFactions);

// Rankings must come before :factionId to avoid "rankings" being parsed as a factionId
router.get('/:factionId/rankings', authenticate, validate(factionIdParamSchema, 'params'), getFactionRankings);

// Update reputation for a faction
router.post('/update', authenticate, validate(updateReputationSchema), updateReputation);

export default router;
