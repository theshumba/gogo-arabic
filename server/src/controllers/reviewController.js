import VocabCard from '../models/VocabCard.js';
import { AppError } from '../utils/AppError.js';
import logger from '../utils/logger.js';
import { paginate, paginationMeta, parsePaginationQuery } from '../utils/pagination.js';

const MAX_SYNC_ITEMS = 500;

// Whitelist of allowed fields for VocabCard updates
const ALLOWED_CARD_FIELDS = [
  'wordId', 'due', 'stability', 'difficulty', 'elapsed_days',
  'scheduled_days', 'reps', 'lapses', 'state', 'last_review',
];

function sanitizeCard(card) {
  const clean = {};
  for (const key of ALLOWED_CARD_FIELDS) {
    if (card[key] !== undefined) {
      clean[key] = card[key];
    }
  }
  return clean;
}

/**
 * Get paginated vocabulary cards for the authenticated user
 *
 * @route GET /api/v1/review/cards
 * @query {number} [page=1] - Page number (1-indexed)
 * @query {number} [limit=20] - Items per page (max 100)
 * @auth Required - JWT token
 * @returns {Object} { success: true, data: VocabCard[], pagination: PaginationMeta }
 */
export async function getCards(req, res, next) {
  try {
    const { page, limit } = parsePaginationQuery(req.query);
    const { skip, limit: safeLimit } = paginate({ page, limit });

    const [cards, total] = await Promise.all([
      VocabCard.find({ userId: req.userId })
        .skip(skip)
        .limit(safeLimit)
        .sort({ due: 1, last_review: -1 }),
      VocabCard.countDocuments({ userId: req.userId }),
    ]);

    res.json({
      success: true,
      data: cards,
      pagination: paginationMeta(total, page, safeLimit),
    });
  } catch (err) {
    logger.error('getCards error:', { error: err.message, userId: req.userId });
    next(err);
  }
}

/**
 * Sync vocabulary cards from client to server (bulk upsert)
 *
 * @route POST /api/v1/review/sync
 * @body {Object} { cards: VocabCard[] } - Array of vocab card objects to sync
 * @auth Required - JWT token
 * @returns {Object} { success: true, data: VocabCard[] } - All cards after sync
 */
export async function syncCards(req, res, next) {
  try {
    const { cards } = req.body;

    if (!Array.isArray(cards)) {
      return next(AppError.badRequest('cards must be an array'));
    }

    if (cards.length > MAX_SYNC_ITEMS) {
      return next(AppError.badRequest(`Too many cards (max ${MAX_SYNC_ITEMS})`));
    }

    const ops = cards
      .filter((card) => card.wordId && typeof card.wordId === 'string')
      .map((card) => ({
        updateOne: {
          filter: { userId: req.userId, wordId: card.wordId },
          update: { $set: { ...sanitizeCard(card), userId: req.userId } },
          upsert: true,
        },
      }));

    if (ops.length > 0) {
      await VocabCard.bulkWrite(ops);
    }

    const updated = await VocabCard.find({ userId: req.userId });
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    logger.error('syncCards error:', { error: err.message, userId: req.userId });
    next(err);
  }
}
