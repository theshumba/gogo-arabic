import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { saveNpcState, getNpcState, getAllNpcStates } from '../controllers/npcController.js';
import { saveNpcStateSchema, npcIdParamSchema } from '../validation/npcSchemas.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Batch load all NPC states (must come before :npcId routes)
router.get('/states', authenticate, getAllNpcStates);

// Single NPC state
router.get('/:npcId/state', authenticate, validate(npcIdParamSchema, 'params'), getNpcState);
router.post('/:npcId/state', authenticate, validate(npcIdParamSchema, 'params'), validate(saveNpcStateSchema), saveNpcState);

export default router;
