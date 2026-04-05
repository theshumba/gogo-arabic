import { z } from 'zod';

export const upsertScoreSchema = z.object({
  category: z.enum(['xp', 'wordsLearned', 'streak', 'questsCompleted']),
  score: z.number().int().min(0, 'Score must be non-negative'),
  displayName: z.string().min(1, 'displayName is required').max(50).trim(),
});

export const categoryParamSchema = z.object({
  category: z.enum(['xp', 'wordsLearned', 'streak', 'questsCompleted']),
});

export const leaderboardQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});
