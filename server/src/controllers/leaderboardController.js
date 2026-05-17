import Leaderboard from '../models/Leaderboard.js';
import logger from '../utils/logger.js';

/**
 * Upsert score for a category (current week).
 * Only updates if new score is higher than existing.
 *
 * Security:
 *   - Body is validated by upsertScoreSchema (.strict()) — unknown fields,
 *     non-integer scores, and scores above MAX_LEADERBOARD_SCORE are rejected
 *     at the route level before we get here.
 *   - userId is taken from req.userId (set by `authenticate` middleware from
 *     the verified JWT). Any userId in the body is rejected by .strict().
 *   - Duplicate-submission window is enforced by `scoreUpdateLimiter` on the
 *     route (1 request / 30s / user).
 *
 * @route POST /api/v1/leaderboard/score
 * @auth Required
 */
export async function upsertScore(req, res, next) {
  try {
    const { category, score, displayName } = req.body;
    const userId = req.userId;

    // Defensive: req.userId MUST be set by the authenticate middleware.
    // If it isn't, refuse to write rather than create an orphaned record.
    if (!userId) {
      logger.warn('upsertScore: missing req.userId on authenticated route');
      return next(new Error('Authentication context missing'));
    }

    const week = Leaderboard.getISOWeek(new Date());

    const entry = await Leaderboard.findOneAndUpdate(
      { userId, category, week },
      {
        $max: { score },
        $set: { displayName, updatedAt: new Date() },
        $setOnInsert: { userId, category, week },
      },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    res.json({ success: true, data: entry });
  } catch (err) {
    logger.error('upsertScore error:', { error: err.message, userId: req.userId });
    next(err);
  }
}

/**
 * Get top players for a category this week.
 *
 * @route GET /api/v1/leaderboard/:category
 * @auth Required
 */
export async function getTopPlayers(req, res, next) {
  try {
    const { category } = req.params;
    const { limit } = req.validatedQuery || { limit: 50 };
    const week = Leaderboard.getISOWeek(new Date());

    const entries = await Leaderboard.find({ category, week })
      .sort({ score: -1 })
      .limit(limit)
      .lean();

    // Add rank to each entry
    const ranked = entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    res.json({ success: true, data: ranked });
  } catch (err) {
    logger.error('getTopPlayers error:', { error: err.message, userId: req.userId });
    next(err);
  }
}

/**
 * Get user's rank and surrounding players for a category this week.
 *
 * @route GET /api/v1/leaderboard/my-rank/:category
 * @auth Required
 */
export async function getMyRank(req, res, next) {
  try {
    const { category } = req.params;
    const userId = req.userId;
    const week = Leaderboard.getISOWeek(new Date());

    // Find user's entry
    const userEntry = await Leaderboard.findOne({ userId, category, week }).lean();

    if (!userEntry) {
      return res.json({
        success: true,
        data: { rank: null, entry: null, surrounding: [] },
      });
    }

    // Count players with higher score = rank - 1
    const higherCount = await Leaderboard.countDocuments({
      category,
      week,
      score: { $gt: userEntry.score },
    });
    const rank = higherCount + 1;

    // Get surrounding players (2 above, 2 below by score)
    const above = await Leaderboard.find({
      category,
      week,
      score: { $gt: userEntry.score },
    })
      .sort({ score: 1 })
      .limit(2)
      .lean();

    const below = await Leaderboard.find({
      category,
      week,
      score: { $lt: userEntry.score },
    })
      .sort({ score: -1 })
      .limit(2)
      .lean();

    // Build surrounding list: above (reversed to desc) + user + below
    const surrounding = [
      ...above.reverse().map((e, i) => ({ ...e, rank: rank - (above.length - i) })),
      { ...userEntry, rank },
      ...below.map((e, i) => ({ ...e, rank: rank + 1 + i })),
    ];

    res.json({
      success: true,
      data: { rank, entry: userEntry, surrounding },
    });
  } catch (err) {
    logger.error('getMyRank error:', { error: err.message, userId: req.userId });
    next(err);
  }
}
