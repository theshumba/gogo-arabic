import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * Extracts game state from user document
 * @param {Object} user - Mongoose user document
 * @returns {Object} Game state object
 */
function extractGameState(user) {
  return {
    player: {
      level: user.level,
      xp: user.xp,
      xpToNext: user.xpToNext,
      dirhams: user.dirhams,
      streak: user.streak,
      lastReviewDate: user.lastReviewDate,
      wordsLearned: user.wordsLearned,
      lettersLearned: user.lettersLearned,
      totalQuizzes: user.totalQuizzes,
      correctAnswers: user.correctAnswers,
      character: user.character,
      inventory: user.inventory,
    },
    settings: user.settings,
  };
}

/**
 * Save game state with conflict detection
 *
 * @route POST /api/v1/game/save
 * @body {Object} { player?: Object, settings?: Object, clientVersion?: number }
 * @auth Required - JWT token
 * @returns {Object} Success: { success: true, data: { syncVersion: number } }
 *                   Conflict: { success: false, error: { code: 'SYNC_CONFLICT', serverState, serverVersion } }
 * @description Updates user document with current game state, detecting version conflicts
 */
export async function saveGame(req, res, next) {
  try {
    const { player, quests, settings, clientVersion } = req.body;

    // Fetch current user to check version
    const user = await User.findById(req.userId);
    if (!user) {
      return next(AppError.notFound('User not found'));
    }

    // Conflict detection - client has provided a version number
    if (clientVersion !== undefined) {
      if (clientVersion > user.syncVersion) {
        // Client ahead of server - shouldn't happen in normal flow
        logger.warn('Client version ahead of server', {
          userId: req.userId,
          clientVersion,
          serverVersion: user.syncVersion,
        });
        return next(
          AppError.badRequest(
            'Client version is ahead of server. Please reload and try again.'
          )
        );
      }

      if (clientVersion < user.syncVersion) {
        // Conflict detected - server has newer data
        logger.info('Sync conflict detected', {
          userId: req.userId,
          clientVersion,
          serverVersion: user.syncVersion,
        });

        return res.status(409).json({
          success: false,
          error: {
            code: 'SYNC_CONFLICT',
            message: 'Server has newer data. Conflict resolution required.',
            serverState: extractGameState(user),
            serverVersion: user.syncVersion,
          },
        });
      }
    }

    // No conflict - proceed with save
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

    // Increment sync version and update last synced timestamp
    updates.syncVersion = user.syncVersion + 1;
    updates.lastSyncedAt = new Date();

    const updatedUser = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    });

    logger.info('Game saved successfully', {
      userId: req.userId,
      syncVersion: updatedUser.syncVersion,
    });

    res.json({
      success: true,
      message: 'Game saved',
      data: {
        syncVersion: updatedUser.syncVersion,
        lastSyncedAt: updatedUser.lastSyncedAt,
      },
    });
  } catch (err) {
    logger.error('saveGame error:', { error: err.message, userId: req.userId });
    next(err);
  }
}

/**
 * Load game state with sync version
 *
 * @route GET /api/v1/game/load
 * @auth Required - JWT token
 * @returns {Object} { success: true, data: { gameState, syncVersion, lastSyncedAt } }
 * @description Returns complete user profile with game progress and sync metadata
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
      data: {
        gameState: extractGameState(user),
        syncVersion: user.syncVersion || 0,
        lastSyncedAt: user.lastSyncedAt,
      },
    });
  } catch (err) {
    logger.error('loadGame error:', { error: err.message, userId: req.userId });
    next(err);
  }
}

/**
 * Resolve sync conflict with merged state
 *
 * @route POST /api/v1/game/resolve
 * @body {Object} { resolvedState: Object, baseVersion: number }
 * @auth Required - JWT token
 * @returns {Object} { success: true, data: { syncVersion: number } }
 * @description Accepts a client-merged state and saves it with version increment
 */
export async function resolveConflict(req, res, next) {
  try {
    const { resolvedState, baseVersion } = req.body;

    // Fetch current user to verify version
    const user = await User.findById(req.userId);
    if (!user) {
      return next(AppError.notFound('User not found'));
    }

    // Verify the client is resolving against the current server version
    if (baseVersion !== user.syncVersion) {
      logger.warn('Conflict resolution version mismatch', {
        userId: req.userId,
        baseVersion,
        serverVersion: user.syncVersion,
      });
      return res.status(409).json({
        success: false,
        error: {
          code: 'SYNC_CONFLICT',
          message: 'Server version changed during resolution. Please retry.',
          serverState: extractGameState(user),
          serverVersion: user.syncVersion,
        },
      });
    }

    // Apply resolved state
    const { player, settings } = resolvedState;
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

    // Increment sync version
    updates.syncVersion = user.syncVersion + 1;
    updates.lastSyncedAt = new Date();

    const updatedUser = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    });

    logger.info('Conflict resolved successfully', {
      userId: req.userId,
      syncVersion: updatedUser.syncVersion,
    });

    res.json({
      success: true,
      message: 'Conflict resolved',
      data: {
        syncVersion: updatedUser.syncVersion,
        lastSyncedAt: updatedUser.lastSyncedAt,
      },
    });
  } catch (err) {
    logger.error('resolveConflict error:', {
      error: err.message,
      userId: req.userId,
    });
    next(err);
  }
}
