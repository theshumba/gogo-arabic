import { z } from 'zod';

export const unlockAchievementSchema = z.object({
  achievementId: z.string().min(1, 'achievementId is required'),
  context: z.object({
    questId: z.string().optional().default(''),
    wordCount: z.number().int().min(0).optional().default(0),
    cefrLevel: z.string().optional().default(''),
  }).optional().default({}),
});
