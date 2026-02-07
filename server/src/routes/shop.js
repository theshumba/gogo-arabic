import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { buyItem } from '../controllers/shopController.js';

const router = Router();
router.post('/buy', authenticate, buyItem);
export default router;
