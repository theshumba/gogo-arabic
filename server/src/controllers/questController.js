import Quest from '../models/Quest.js';

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

export async function getQuests(req, res) {
  try {
    const quests = await Quest.find({ userId: req.userId });
    res.json({ quests });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get quests' });
  }
}

export async function syncQuests(req, res) {
  try {
    const { quests } = req.body;

    if (!Array.isArray(quests)) {
      return res.status(400).json({ message: 'quests must be an array' });
    }

    if (quests.length > MAX_SYNC_ITEMS) {
      return res.status(400).json({ message: `Too many quests (max ${MAX_SYNC_ITEMS})` });
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
    res.status(500).json({ message: 'Failed to sync quests' });
  }
}
