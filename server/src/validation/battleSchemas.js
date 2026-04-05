import { z } from 'zod';

export const logBattleSchema = z.object({
  opponentId: z.string().min(1, 'opponentId is required'),
  opponentName: z.string().optional().default(''),
  zone: z.string().optional().default(''),
  result: z.enum(['win', 'loss', 'flee']),
  duration: z.number().int().min(0).optional().default(0),
  xpEarned: z.number().int().min(0).optional().default(0),
  goldEarned: z.number().int().min(0).optional().default(0),
  vocabTested: z.array(z.string()).max(200).optional().default([]),
  vocabCorrect: z.array(z.string()).max(200).optional().default([]),
});

export const battleHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  zone: z.string().optional(),
});
