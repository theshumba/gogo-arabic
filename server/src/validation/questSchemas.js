import { z } from 'zod';

/**
 * Validation schemas for quest endpoints
 */

const questSchema = z.object({
  questId: z.string().min(1, 'questId is required'),
  status: z.enum(['available', 'active', 'completed']).optional(),
  progress: z.number().int().min(0).optional(),
  target: z.number().int().min(0).optional(),
  completedAt: z.date().or(z.string().transform(str => new Date(str))).optional().nullable(),
});

export const syncQuestsSchema = z.object({
  quests: z.array(questSchema)
    .max(200, 'Cannot sync more than 200 quests at once'),
});
