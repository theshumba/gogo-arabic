import NpcState from '../models/NpcState.js';
import { AppError } from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * Save NPC state for the authenticated user
 *
 * @route POST /api/v1/npcs/:npcId/state
 * @auth Required
 */
export async function saveNpcState(req, res, next) {
  try {
    const { npcId } = req.params;
    const updateData = { ...req.body, userId: req.userId, npcId };

    const npcState = await NpcState.findOneAndUpdate(
      { userId: req.userId, npcId },
      { $set: updateData },
      { upsert: true, new: true, runValidators: true },
    );

    res.json({ success: true, data: npcState });
  } catch (err) {
    logger.error('saveNpcState error:', { error: err.message, userId: req.userId });
    next(err);
  }
}

/**
 * Load NPC state for the authenticated user
 *
 * @route GET /api/v1/npcs/:npcId/state
 * @auth Required
 */
export async function getNpcState(req, res, next) {
  try {
    const { npcId } = req.params;
    const npcState = await NpcState.findOne({ userId: req.userId, npcId });

    if (!npcState) {
      return next(AppError.notFound(`No state found for NPC: ${npcId}`));
    }

    res.json({ success: true, data: npcState });
  } catch (err) {
    logger.error('getNpcState error:', { error: err.message, userId: req.userId });
    next(err);
  }
}

/**
 * Load all NPC states for the authenticated user (batch load on login)
 *
 * @route GET /api/v1/npcs/states
 * @auth Required
 */
export async function getAllNpcStates(req, res, next) {
  try {
    const states = await NpcState.find({ userId: req.userId }).sort({ npcId: 1 });
    res.json({ success: true, data: states });
  } catch (err) {
    logger.error('getAllNpcStates error:', { error: err.message, userId: req.userId });
    next(err);
  }
}
