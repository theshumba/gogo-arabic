import { Router } from 'express';
import { register, login, logout, verifyAuth } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validation/authSchemas.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { generateCsrfToken, getCsrfToken } from '../middleware/csrf.js';

const router = Router();

// Auth endpoints with strict rate limiting
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/verify', authenticate, verifyAuth);

// CSRF token endpoint
router.get('/csrf-token', generateCsrfToken, getCsrfToken);

export default router;
