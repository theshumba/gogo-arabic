import mongoose from 'mongoose';

const questSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  questId: { type: String, required: true },
  status: { type: String, enum: ['locked', 'active', 'completed'], default: 'locked' },
  progress: { type: Number, default: 0 },
  target: { type: Number, required: true },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

questSchema.index({ userId: 1, questId: 1 }, { unique: true });

export default mongoose.model('Quest', questSchema);
