import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { logBattle, getBattleHistory, getBattleStats } from '../controllers/battleController.js';
import { logBattleSchema, battleHistoryQuerySchema } from '../validation/battleSchemas.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Stats must come before parameterized routes
router.get('/stats', authenticate, getBattleStats);

// Battle history with optional query filters
router.get('/history', authenticate, validate(battleHistoryQuerySchema, 'query'), getBattleHistory);

// Log a battle result
router.post('/log', authenticate, validate(logBattleSchema), logBattle);

export default router;
