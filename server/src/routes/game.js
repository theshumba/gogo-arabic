import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { saveGame, loadGame } from '../controllers/gameController.js';
import { saveGameSchema } from '../validation/gameSchemas.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Apply API rate limiter to all routes
router.use(apiLimiter);

router.post('/save', authenticate, validate(saveGameSchema), saveGame);
router.get('/load', authenticate, loadGame);

export default router;
