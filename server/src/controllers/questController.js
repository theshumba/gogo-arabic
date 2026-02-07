import Quest from '../models/Quest.js';

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
    const ops = quests.map((q) => ({
      updateOne: {
        filter: { userId: req.userId, questId: q.questId },
        update: { $set: { ...q, userId: req.userId } },
        upsert: true,
      },
    }));

    await Quest.bulkWrite(ops);
    const updated = await Quest.find({ userId: req.userId });
    res.json({ quests: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to sync quests' });
  }
}
