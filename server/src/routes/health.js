import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getHealth, getDetailedHealth } from '../controllers/healthController.js';

const router = Router();

// Public — no auth, registered before CSRF in app.js
router.get('/', getHealth);

// Auth required — detailed diagnostics
router.get('/detailed', authenticate, getDetailedHealth);

export default router;
