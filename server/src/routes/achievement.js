import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { unlockAchievement, getAchievements, getGlobalStats } from '../controllers/achievementController.js';
import { unlockAchievementSchema } from '../validation/achievementSchemas.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Global stats must come before parameterized routes
router.get('/global-stats', authenticate, getGlobalStats);

// Fetch all unlocked achievements for user
router.get('/', authenticate, getAchievements);

// Unlock an achievement
router.post('/unlock', authenticate, validate(unlockAchievementSchema), unlockAchievement);

export default router;
