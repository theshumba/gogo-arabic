import { z } from 'zod';

/**
 * Validation schemas for game save/load endpoints
 */

const inventoryItemSchema = z.string().or(
  z.object({
    itemId: z.string(),
    equipped: z.boolean().optional(),
  })
);

const playerSchema = z.object({
  level: z.number().int().min(1).max(1000).optional(),
  xp: z.number().int().min(0).optional(),
  xpToNext: z.number().int().min(0).optional(),
  dirhams: z.number().int().min(0).optional(),
  streak: z.number().int().min(0).optional(),
  lastReviewDate: z.date().or(z.string().transform(str => new Date(str))).optional().nullable(),
  wordsLearned: z.number().int().min(0).optional(),
  lettersLearned: z.number().int().min(0).max(28).optional(),
  totalQuizzes: z.number().int().min(0).optional(),
  correctAnswers: z.number().int().min(0).optional(),
  character: z.object({
    bodyType: z.string().optional(),
    skinTone: z.string().optional(),
    outfit: z.string().optional(),
    headwear: z.string().optional().nullable(),
  }).optional(),
  inventory: z.array(inventoryItemSchema).max(500).optional(),
}).optional();

const settingsSchema = z.object({
  volumeAmbience: z.number().min(0).max(1).optional(),
  volumeSFX: z.number().min(0).max(1).optional(),
  volumeWords: z.number().min(0).max(1).optional(),
  showTransliteration: z.boolean().optional(),
  showDiacritics: z.boolean().optional(),
  keyboardMode: z.enum(['standard', 'advanced']).optional(),
  difficulty: z.enum(['easy', 'normal', 'hard']).optional(),
}).optional();

export const saveGameSchema = z.object({
  player: playerSchema,
  quests: z.any().optional(), // Handled by quest sync endpoint
  settings: settingsSchema,
});
