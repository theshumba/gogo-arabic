import Quest from '../models/Quest.js';
import { AppError } from '../utils/AppError.js';
import logger from '../utils/logger.js';
import { paginate, paginationMeta, parsePaginationQuery } from '../utils/pagination.js';

const MAX_SYNC_ITEMS = 200;

// Whitelist of allowed fields for Quest updates
const ALLOWED_QUEST_FIELDS = [
  'questId', 'status', 'progress', 'target', 'completedAt',
];

function sanitizeQuest(quest) {
  const clean = {};
  for (const key of ALLOWED_QUEST_FIELDS) {
    if (quest[key] !== undefined) {
      clean[key] = quest[key];
    }
  }
  return clean;
}

/**
 * Get paginated quests for the authenticated user
 *
 * @route GET /api/v1/quest
 * @query {number} [page=1] - Page number (1-indexed)
 * @query {number} [limit=20] - Items per page (max 100)
 * @auth Required - JWT token
 * @returns {Object} { success: true, data: Quest[], pagination: PaginationMeta }
 */
export async function getQuests(req, res, next) {
  try {
    // Use validatedQuery if available (from validate middleware), otherwise fall back to req.query
    const queryData = req.validatedQuery || req.query;
    const { page, limit } = parsePaginationQuery(queryData);
    const { skip, limit: safeLimit } = paginate({ page, limit });

    const [quests, total] = await Promise.all([
      Quest.find({ userId: req.userId })
        .skip(skip)
        .limit(safeLimit)
        .sort({ createdAt: -1 }),
      Quest.countDocuments({ userId: req.userId }),
    ]);

    res.json({
      success: true,
      data: quests,
      pagination: paginationMeta(total, page, safeLimit),
    });
  } catch (err) {
    logger.error('getQuests error:', { error: err.message, userId: req.userId });
    next(err);
  }
}

/**
 * Sync quests from client to server (bulk upsert)
 *
 * @route POST /api/v1/quest/sync
 * @body {Object} { quests: Quest[] } - Array of quest objects to sync
 * @auth Required - JWT token
 * @returns {Object} { success: true, data: Quest[] } - All quests after sync
 */
export async function syncQuests(req, res, next) {
  try {
    const { quests } = req.body;

    if (!Array.isArray(quests)) {
      return next(AppError.badRequest('quests must be an array'));
    }

    if (quests.length > MAX_SYNC_ITEMS) {
      return next(AppError.badRequest(`Too many quests (max ${MAX_SYNC_ITEMS})`));
    }

    const ops = quests
      .filter((q) => q.questId && typeof q.questId === 'string')
      .map((q) => ({
        updateOne: {
          filter: { userId: req.userId, questId: q.questId },
          update: { $set: { ...sanitizeQuest(q), userId: req.userId } },
          upsert: true,
        },
      }));

    if (ops.length > 0) {
      await Quest.bulkWrite(ops);
    }

    const updated = await Quest.find({ userId: req.userId });
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    logger.error('syncQuests error:', { error: err.message, userId: req.userId });
    next(err);
  }
}
