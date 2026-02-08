import Quest from '../models/Quest.js';
import { AppError } from '../utils/AppError.js';
import logger from '../utils/logger.js';

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

export async function getQuests(req, res, next) {
  try {
    const quests = await Quest.find({ userId: req.userId });
    res.json({ quests });
  } catch (err) {
    logger.error('getQuests error:', { error: err.message, userId: req.userId });
    next(err);
  }
}

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
    res.json({ quests: updated });
  } catch (err) {
    logger.error('syncQuests error:', { error: err.message, userId: req.userId });
    next(err);
  }
}
