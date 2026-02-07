import VocabCard from '../models/VocabCard.js';

export async function getCards(req, res) {
  try {
    const cards = await VocabCard.find({ userId: req.userId });
    res.json({ cards });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get cards' });
  }
}

export async function syncCards(req, res) {
  try {
    const { cards } = req.body;
    const ops = cards.map((card) => ({
      updateOne: {
        filter: { userId: req.userId, wordId: card.wordId },
        update: { $set: { ...card, userId: req.userId } },
        upsert: true,
      },
    }));

    await VocabCard.bulkWrite(ops);
    const updated = await VocabCard.find({ userId: req.userId });
    res.json({ cards: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to sync cards' });
  }
}
