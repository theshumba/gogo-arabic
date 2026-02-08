import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * Save game state (player progress, settings)
 *
 * @route POST /api/v1/game/save
 * @body {Object} { player?: Object, settings?: Object }
 * @auth Required - JWT token
 * @returns {Object} { success: true, data: User, message: string }
 * @description Updates user document with current game state
 */
export async function saveGame(req, res, next) {
  try {
    const { player, quests, settings } = req.body;
    const updates = {};

    if (player) {
      updates.level = player.level;
      updates.xp = player.xp;
      updates.xpToNext = player.xpToNext;
      updates.dirhams = player.dirhams;
      updates.streak = player.streak;
      updates.lastReviewDate = player.lastReviewDate;
      updates.wordsLearned = player.wordsLearned;
      updates.lettersLearned = player.lettersLearned;
      updates.totalQuizzes = player.totalQuizzes;
      updates.correctAnswers = player.correctAnswers;
      updates.character = player.character;
      updates.inventory = player.inventory;
    }

    if (settings) {
      updates.settings = settings;
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(AppError.notFound('User not found'));
    }

    logger.info('Game saved', { userId: req.userId });

    res.json({
      success: true,
      message: 'Game saved',
      data: user,
    });
  } catch (err) {
    logger.error('saveGame error:', { error: err.message, userId: req.userId });
    next(err);
  }
}

/**
 * Load game state for the authenticated user
 *
 * @route GET /api/v1/game/load
 * @auth Required - JWT token
 * @returns {Object} { success: true, data: User }
 * @description Returns complete user profile with game progress
 */
export async function loadGame(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return next(AppError.notFound('User not found'));
    }

    logger.info('Game loaded', { userId: req.userId });

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    logger.error('loadGame error:', { error: err.message, userId: req.userId });
    next(err);
  }
}
