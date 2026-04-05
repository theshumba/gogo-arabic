import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  displayName: { type: String, required: true, maxlength: 50 },
  category: {
    type: String,
    required: true,
    enum: ['xp', 'wordsLearned', 'streak', 'questsCompleted'],
  },
  score: { type: Number, required: true, min: 0, default: 0 },
  week: { type: String, required: true }, // ISO week string e.g. "2026-W14"
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Fast ranking: find top scores for a category+week
leaderboardSchema.index({ category: 1, week: 1, score: -1 });

// One entry per user per category per week
leaderboardSchema.index({ userId: 1, category: 1, week: 1 }, { unique: true });

/**
 * Get the ISO week string for a given date (Monday-based weeks).
 * Returns format "YYYY-WNN" e.g. "2026-W14"
 */
leaderboardSchema.statics.getISOWeek = function (date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number (Mon=1, Sun=7)
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

export default mongoose.model('Leaderboard', leaderboardSchema);
