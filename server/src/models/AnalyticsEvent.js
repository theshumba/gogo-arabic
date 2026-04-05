import mongoose from 'mongoose';

const VALID_EVENTS = [
  'session_start',
  'session_end',
  'quiz_completed',
  'battle_started',
  'lesson_completed',
  'feature_used',
];

const analyticsEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  event: { type: String, enum: VALID_EVENTS, required: true },
  properties: { type: mongoose.Schema.Types.Mixed, default: {} },
  sessionId: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

// TTL index: auto-delete events older than 90 days
analyticsEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Index for querying user events by time
analyticsEventSchema.index({ userId: 1, timestamp: -1 });

export { VALID_EVENTS };
export default mongoose.model('AnalyticsEvent', analyticsEventSchema);
