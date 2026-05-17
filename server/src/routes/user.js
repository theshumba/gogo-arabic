import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { getProfile, updateProfile, getSettings, saveSettings, getProgressSnapshots, saveProgressSnapshot } from '../controllers/userController.js';
import { updateProfileSchema, playerSettingsSchema, progressSnapshotSchema, MAX_SNAPSHOT_BYTES } from '../validation/userSchemas.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { AppError } from '../utils/AppError.js';

const router = Router();

// Apply API rate limiter to all routes
router.use(apiLimiter);

/**
 * Hard size guard for snapshot writes — runs BEFORE the JSON parser
 * has a chance to balloon a malicious payload into a parsed object.
 * The global `express.json({ limit: '1mb' })` in app.js is the outer cap;
 * this is a tighter, snapshot-specific cap (100KB) per the code review.
 */
function snapshotSizeGuard(req, res, next) {
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (Number.isFinite(contentLength) && contentLength > MAX_SNAPSHOT_BYTES) {
    return next(AppError.badRequest(`Snapshot payload exceeds ${MAX_SNAPSHOT_BYTES} bytes`));
  }
  next();
}

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);

router.get('/settings', authenticate, getSettings);
router.post('/settings', authenticate, validate(playerSettingsSchema), saveSettings);

// Weekly progress snapshots (append-only)
router.get('/progress/snapshots', authenticate, getProgressSnapshots);
router.post(
  '/progress/snapshots',
  authenticate,
  snapshotSizeGuard,
  validate(progressSnapshotSchema),
  saveProgressSnapshot,
);

export default router;
