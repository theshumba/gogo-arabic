import FactionState from '../models/FactionState.js';
import logger from '../utils/logger.js';

/**
 * Update reputation for a faction. Auto-calculates tier.
 *
 * @route POST /api/v1/factions/update
 * @auth Required
 */
export async function updateReputation(req, res, next) {
  try {
    const { factionId, amount } = req.body;
    const userId = req.userId;

    // Find or create the user's faction state
    let factionState = await FactionState.findOne({ userId });
    if (!factionState) {
      factionState = new FactionState({ userId });
    }

    // Get current faction entry or create default
    const current = factionState.factions.get(factionId) || {
      reputation: 0,
      tier: 'Outsider',
      joinedAt: null,
    };

    // Calculate new reputation, clamped 0-100
    const newReputation = Math.max(0, Math.min(100, current.reputation + amount));
    const newTier = FactionState.calculateTier(newReputation);

    // Set joinedAt on first interaction (reputation > 0)
    const joinedAt = current.joinedAt || (newReputation > 0 ? new Date() : null);

    factionState.factions.set(factionId, {
      reputation: newReputation,
      tier: newTier,
      joinedAt,
    });

    await factionState.save();

    const entry = factionState.factions.get(factionId);
    res.json({
      success: true,
      data: {
        factionId,
        reputation: entry.reputation,
        tier: entry.tier,
        joinedAt: entry.joinedAt,
      },
    });
  } catch (err) {
    logger.error('updateReputation error:', { error: err.message, userId: req.userId });
    next(err);
  }
}

/**
 * Get all faction states for the authenticated user.
 *
 * @route GET /api/v1/factions
 * @auth Required
 */
export async function getAllFactions(req, res, next) {
  try {
    const userId = req.userId;

    const factionState = await FactionState.findOne({ userId }).lean();

    if (!factionState) {
      return res.json({ success: true, data: { factions: {} } });
    }

    // Mongoose Map serializes to an object in lean() queries
    res.json({ success: true, data: { factions: factionState.factions } });
  } catch (err) {
    logger.error('getAllFactions error:', { error: err.message, userId: req.userId });
    next(err);
  }
}

/**
 * Get top players (by reputation) in a specific faction.
 *
 * @route GET /api/v1/factions/:factionId/rankings
 * @auth Required
 */
export async function getFactionRankings(req, res, next) {
  try {
    const { factionId } = req.params;

    // Aggregate: unwind the factions map, filter by factionId, sort by reputation desc
    const rankings = await FactionState.aggregate([
      // Convert Map to array of key-value pairs
      { $project: { userId: 1, factionEntry: { $objectToArray: '$factions' } } },
      // Unwind the array
      { $unwind: '$factionEntry' },
      // Filter by the requested faction
      { $match: { 'factionEntry.k': factionId } },
      // Only include players with reputation > 0
      { $match: { 'factionEntry.v.reputation': { $gt: 0 } } },
      // Sort by reputation descending
      { $sort: { 'factionEntry.v.reputation': -1 } },
      // Limit to top 50
      { $limit: 50 },
      // Project clean output
      {
        $project: {
          _id: 0,
          userId: 1,
          reputation: '$factionEntry.v.reputation',
          tier: '$factionEntry.v.tier',
        },
      },
    ]);

    // Add rank
    const ranked = rankings.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    res.json({ success: true, data: ranked });
  } catch (err) {
    logger.error('getFactionRankings error:', { error: err.message, userId: req.userId });
    next(err);
  }
}
