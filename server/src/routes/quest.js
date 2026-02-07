import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { syncQuests, getQuests } from '../controllers/questController.js';

const router = Router();
router.get('/', authenticate, getQuests);
router.post('/sync', authenticate, syncQuests);
export default router;
