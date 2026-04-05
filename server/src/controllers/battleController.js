import mongoose from 'mongoose';
import BattleLog from '../models/BattleLog.js';
import logger from '../utils/logger.js';

/**
 * Log a battle result
 *
 * @route POST /api/v1/battles/log
 * @auth Required
 */
export async function logBattle(req, res, next) {
  try {
    const battleLog = await BattleLog.create({
      ...req.body,
      userId: req.userId,
    });

    res.status(201).json({ success: true, data: battleLog });
  } catch (err) {
    logger.error('logBattle error:', { error: err.message, userId: req.userId });
    next(err);
  }
}

/**
 * Fetch battle history with optional filters
 *
 * @route GET /api/v1/battles/history?limit=50&zone=oasis
 * @auth Required
 */
export async function getBattleHistory(req, res, next) {
  try {
    const { limit, zone } = req.validatedQuery || req.query;
    const filter = { userId: req.userId };
    if (zone) {
      filter.zone = zone;
    }

    const history = await BattleLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit) || 50);

    res.json({ success: true, data: history });
  } catch (err) {
    logger.error('getBattleHistory error:', { error: err.message, userId: req.userId });
    next(err);
  }
}

/**
 * Get aggregated battle stats
 *
 * @route GET /api/v1/battles/stats
 * @auth Required
 */
export async function getBattleStats(req, res, next) {
  try {
    const userId = req.userId;

    const [stats] = await BattleLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalBattles: { $sum: 1 },
          wins: { $sum: { $cond: [{ $eq: ['$result', 'win'] }, 1, 0] } },
          losses: { $sum: { $cond: [{ $eq: ['$result', 'loss'] }, 1, 0] } },
          flees: { $sum: { $cond: [{ $eq: ['$result', 'flee'] }, 1, 0] } },
          avgDuration: { $avg: '$duration' },
          totalXp: { $sum: '$xpEarned' },
          totalGold: { $sum: '$goldEarned' },
        },
      },
    ]);

    if (!stats) {
      return res.json({
        success: true,
        data: {
          totalBattles: 0,
          wins: 0,
          losses: 0,
          flees: 0,
          winRate: 0,
          avgDuration: 0,
          totalXp: 0,
          totalGold: 0,
          bestStreak: 0,
        },
      });
    }

    // Calculate best win streak from ordered battle logs
    const battles = await BattleLog.find({ userId })
      .sort({ timestamp: 1 })
      .select('result')
      .lean();

    let bestStreak = 0;
    let currentStreak = 0;
    for (const battle of battles) {
      if (battle.result === 'win') {
        currentStreak += 1;
        if (currentStreak > bestStreak) {
          bestStreak = currentStreak;
        }
      } else {
        currentStreak = 0;
      }
    }

    const winRate = stats.totalBattles > 0
      ? Math.round((stats.wins / stats.totalBattles) * 100) / 100
      : 0;

    res.json({
      success: true,
      data: {
        totalBattles: stats.totalBattles,
        wins: stats.wins,
        losses: stats.losses,
        flees: stats.flees,
        winRate,
        avgDuration: Math.round(stats.avgDuration || 0),
        totalXp: stats.totalXp,
        totalGold: stats.totalGold,
        bestStreak,
      },
    });
  } catch (err) {
    logger.error('getBattleStats error:', { error: err.message, userId: req.userId });
    next(err);
  }
}
