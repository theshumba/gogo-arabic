import User from '../models/User.js';

export async function saveGame(req, res) {
  try {
    const { player, quests, settings } = req.body;
    const updates = {};

    if (player) {
      updates.level = player.level;
      updates.xp = player.xp;
      updates.xpToNext = player.xpToNext;
      updates.dirhams = player.dirhams;
      updates.streak = player.streak;
      updates.lastReviewDate = player.lastReviewDate;
      updates.wordsLearned = player.wordsLearned;
      updates.lettersLearned = player.lettersLearned;
      updates.totalQuizzes = player.totalQuizzes;
      updates.correctAnswers = player.correctAnswers;
      updates.character = player.character;
      updates.inventory = player.inventory;
    }

    if (settings) {
      updates.settings = settings;
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Game saved', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save game' });
  }
}

export async function loadGame(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load game' });
  }
}
