import mongoose from 'mongoose';

const worldStateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  flags: { type: Map, of: mongoose.Schema.Types.Mixed, default: () => new Map() },
  factionControl: { type: Map, of: mongoose.Schema.Types.Mixed, default: () => new Map() },
  zoneEvents: [{ type: mongoose.Schema.Types.Mixed }],
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('WorldState', worldStateSchema);
