import mongoose from 'mongoose';

const npcStateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  npcId: { type: String, required: true },
  relationship: { type: Number, default: 50, min: 0, max: 100 },
  dialogueChoices: [{ type: String }],
  questsGiven: [{ type: String }],
  lastInteraction: { type: Date, default: null },
}, { timestamps: true });

npcStateSchema.index({ userId: 1, npcId: 1 }, { unique: true });

export default mongoose.model('NpcState', npcStateSchema);
