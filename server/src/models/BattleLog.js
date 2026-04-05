import mongoose from 'mongoose';

const battleLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  opponentId: { type: String, required: true },
  opponentName: { type: String, default: '' },
  zone: { type: String, default: '' },
  result: { type: String, enum: ['win', 'loss', 'flee'], required: true },
  duration: { type: Number, default: 0 }, // seconds
  xpEarned: { type: Number, default: 0 },
  goldEarned: { type: Number, default: 0 },
  vocabTested: [{ type: String }],
  vocabCorrect: [{ type: String }],
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

battleLogSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model('BattleLog', battleLogSchema);
