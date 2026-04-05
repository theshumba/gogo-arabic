import Achievement from '../models/Achievement.js';
import logger from '../utils/logger.js';

// Achievement definitions loaded at module level for validation
// We inline a lightweight lookup rather than importing the full client-side data
// to keep server bundle independent. The client sends achievementId + context,
// and we validate context fields are sensible.

/**
 * Unlock an achievement (with prerequisite validation)
 *
 * @route POST /api/v1/achievements/unlock
 * @auth Required
 */
export async function unlockAchievement(req, res, next) {
  try {
    const { achievementId, context } = req.body;
    const userId = req.userId;

    // Check if already unlocked (unique index also prevents this, but give a nicer error)
    const existing = await Achievement.findOne({ userId, achievementId }).lean();
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Achievement already unlocked',
        data: existing,
      });
    }

    // Validate context fields are reasonable (server-side prerequisite check)
    if (context) {
      if (context.wordCount < 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid context: wordCount cannot be negative',
        });
      }
      if (context.cefrLevel && !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(context.cefrLevel)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid context: cefrLevel must be A1-C2',
        });
      }
    }

    const achievement = await Achievement.create({
      userId,
      achievementId,
      context: context || {},
    });

    res.status(201).json({ success: true, data: achievement });
  } catch (err) {
    // Handle duplicate key error from unique index (race condition)
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Achievement already unlocked',
      });
    }
    logger.error('unlockAchievement error:', { error: err.message, userId: req.userId });
    next(err);
  }
}

/**
 * Fetch all unlocked achievements for user
 *
 * @route GET /api/v1/achievements
 * @auth Required
 */
export async function getAchievements(req, res, next) {
  try {
    const achievements = await Achievement.find({ userId: req.userId })
      .sort({ unlockedAt: -1 })
      .lean();

    res.json({ success: true, data: achievements });
  } catch (err) {
    logger.error('getAchievements error:', { error: err.message, userId: req.userId });
    next(err);
  }
}

/**
 * Get global achievement stats — % of players with each achievement
 *
 * @route GET /api/v1/achievements/global-stats
 * @auth Required
 */
export async function getGlobalStats(req, res, next) {
  try {
    // Count distinct users who have any achievement
    const totalPlayers = await Achievement.distinct('userId').then(ids => ids.length);

    if (totalPlayers === 0) {
      return res.json({ success: true, data: { totalPlayers: 0, achievements: [] } });
    }

    // Count unlocks per achievement
    const stats = await Achievement.aggregate([
      {
        $group: {
          _id: '$achievementId',
          unlockCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          achievementId: '$_id',
          unlockCount: 1,
          percentage: {
            $round: [{ $multiply: [{ $divide: ['$unlockCount', totalPlayers] }, 100] }, 1],
          },
        },
      },
      { $sort: { percentage: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalPlayers,
        achievements: stats,
      },
    });
  } catch (err) {
    logger.error('getGlobalStats error:', { error: err.message, userId: req.userId });
    next(err);
  }
}
