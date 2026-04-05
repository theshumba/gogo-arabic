import mongoose from 'mongoose';

const factionEntrySchema = new mongoose.Schema({
  reputation: { type: Number, default: 0, min: 0, max: 100 },
  tier: {
    type: String,
    enum: ['Outsider', 'Member', 'Trusted', 'Elder'],
    default: 'Outsider',
  },
  joinedAt: { type: Date, default: null },
}, { _id: false });

const factionStateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  factions: {
    type: Map,
    of: factionEntrySchema,
    default: () => new Map(),
  },
}, { timestamps: true });

/**
 * Calculate tier from reputation score.
 * 0-25: Outsider, 26-50: Member, 51-75: Trusted, 76-100: Elder
 */
factionStateSchema.statics.calculateTier = function (reputation) {
  if (reputation >= 76) return 'Elder';
  if (reputation >= 51) return 'Trusted';
  if (reputation >= 26) return 'Member';
  return 'Outsider';
};

export default mongoose.model('FactionState', factionStateSchema);
