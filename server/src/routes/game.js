import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { saveGame, loadGame } from '../controllers/gameController.js';

const router = Router();
router.post('/save', authenticate, saveGame);
router.get('/load', authenticate, loadGame);
export default router;
