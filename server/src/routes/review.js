import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { syncCards, getCards } from '../controllers/reviewController.js';

const router = Router();
router.get('/cards', authenticate, getCards);
router.post('/sync', authenticate, syncCards);
export default router;
