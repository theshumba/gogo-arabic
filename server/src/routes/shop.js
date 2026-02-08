import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { buyItem } from '../controllers/shopController.js';
import { buyItemSchema } from '../validation/shopSchemas.js';
import { shopLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Use shop-specific rate limiter (stricter than API limiter)
router.post('/buy', shopLimiter, authenticate, validate(buyItemSchema), buyItem);

export default router;
