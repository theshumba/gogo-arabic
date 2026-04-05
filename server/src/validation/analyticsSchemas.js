import { z } from 'zod';

const VALID_EVENTS = [
  'session_start',
  'session_end',
  'quiz_completed',
  'battle_started',
  'lesson_completed',
  'feature_used',
];

const analyticsEventItemSchema = z.object({
  event: z.enum(VALID_EVENTS),
  properties: z.record(z.unknown()).optional().default({}),
  sessionId: z.string().optional().default(''),
  timestamp: z.string().datetime().optional(),
});

export const batchIngestSchema = z.object({
  events: z
    .array(analyticsEventItemSchema)
    .min(1, 'At least 1 event is required')
    .max(50, 'Maximum 50 events per batch'),
});
