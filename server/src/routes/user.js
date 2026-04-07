import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { getProfile, updateProfile, getSettings, saveSettings, getProgressSnapshots, saveProgressSnapshot } from '../controllers/userController.js';
import { updateProfileSchema, playerSettingsSchema } from '../validation/userSchemas.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Apply API rate limiter to all routes
router.use(apiLimiter);

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);

router.get('/settings', authenticate, getSettings);
router.post('/settings', authenticate, validate(playerSettingsSchema), saveSettings);

// Weekly progress snapshots (append-only)
router.get('/progress/snapshots', authenticate, getProgressSnapshots);
router.post('/progress/snapshots', authenticate, saveProgressSnapshot);

export default router;
