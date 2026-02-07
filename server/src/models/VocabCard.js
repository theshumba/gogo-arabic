import mongoose from 'mongoose';

const vocabCardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  wordId: { type: String, required: true },
  // FSRS card fields
  due: { type: Date, default: Date.now },
  stability: { type: Number, default: 0 },
  difficulty: { type: Number, default: 0 },
  elapsed_days: { type: Number, default: 0 },
  scheduled_days: { type: Number, default: 0 },
  reps: { type: Number, default: 0 },
  lapses: { type: Number, default: 0 },
  state: { type: Number, default: 0 }, // 0=New, 1=Learning, 2=Review, 3=Relearning
  last_review: { type: Date, default: null },
}, { timestamps: true });

vocabCardSchema.index({ userId: 1, wordId: 1 }, { unique: true });

export default mongoose.model('VocabCard', vocabCardSchema);
