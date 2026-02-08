import VocabCard from '../models/VocabCard.js';
import { AppError } from '../utils/AppError.js';
import logger from '../utils/logger.js';

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

export async function getCards(req, res, next) {
  try {
    const cards = await VocabCard.find({ userId: req.userId });
    res.json({ cards });
  } catch (err) {
    logger.error('getCards error:', { error: err.message, userId: req.userId });
    next(err);
  }
}

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
    res.json({ cards: updated });
  } catch (err) {
    logger.error('syncCards error:', { error: err.message, userId: req.userId });
    next(err);
  }
}
