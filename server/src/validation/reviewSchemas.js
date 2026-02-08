import { z } from 'zod';

/**
 * Validation schemas for review/vocabulary endpoints
 */

const vocabCardSchema = z.object({
  wordId: z.string().min(1, 'wordId is required'),
  due: z.date().or(z.string().transform(str => new Date(str))).optional(),
  stability: z.number().min(0).optional(),
  difficulty: z.number().min(0).max(10).optional(),
  elapsed_days: z.number().min(0).optional(),
  scheduled_days: z.number().min(0).optional(),
  reps: z.number().int().min(0).optional(),
  lapses: z.number().int().min(0).optional(),
  state: z.number().int().min(0).max(3).optional(),
  last_review: z.date().or(z.string().transform(str => new Date(str))).optional(),
});

export const syncCardsSchema = z.object({
  cards: z.array(vocabCardSchema)
    .max(500, 'Cannot sync more than 500 cards at once'),
});
