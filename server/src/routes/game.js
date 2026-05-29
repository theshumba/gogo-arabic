/**
 * @deprecated Phase 103-01 audit (2026-05-29). These /api/v1/game/* routes are a
 * prior cloud-save attempt with no live client consumer (the client sync layer was
 * deleted as dead code). They are kept temporarily so the server is never without
 * save routes, and will be removed — along with this file's tests — when the
 * replacement /api/v1/cloudsave/* routes land in Plan 06/07. Do not build new
 * features against these endpoints.
 */
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { saveGame, loadGame, resolveConflict } from '../controllers/gameController.js';
import { saveGameSchema, resolveConflictSchema } from '../validation/gameSchemas.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Apply API rate limiter to all routes
router.use(apiLimiter);

router.post('/save', authenticate, validate(saveGameSchema), saveGame);
router.get('/load', authenticate, loadGame);
router.post('/resolve', authenticate, validate(resolveConflictSchema), resolveConflict);

export default router;
