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
  }).strict().optional(),
  inventory: z.array(inventoryItemSchema).max(500).optional(),
}).strict().optional();

const settingsSchema = z.object({
  volumeAmbience: z.number().min(0).max(1).optional(),
  volumeSFX: z.number().min(0).max(1).optional(),
  volumeWords: z.number().min(0).max(1).optional(),
  showTransliteration: z.boolean().optional(),
  showDiacritics: z.boolean().optional(),
  keyboardMode: z.enum(['standard', 'advanced']).optional(),
  difficulty: z.enum(['easy', 'normal', 'hard']).optional(),
}).strict().optional();

const questSchema = z.object({
  id: z.string(),
  status: z.enum(['active', 'completed', 'failed', 'available']),
  progress: z.number().int().min(0).optional(),
  target: z.number().int().min(1).optional(),
  completedAt: z.string().datetime().optional().nullable(),
}).strict();

export const saveGameSchema = z.object({
  player: playerSchema,
  quests: z.record(z.string(), questSchema).optional(),
  settings: settingsSchema,
  clientVersion: z.number().int().min(0).optional(), // For conflict detection
}).strict();

/**
 * Validation schema for conflict resolution endpoint
 */
export const resolveConflictSchema = z.object({
  resolvedState: z.object({
    player: playerSchema,
    quests: z.record(z.string(), questSchema).optional(),
    settings: settingsSchema,
  }).strict(),
  baseVersion: z.number().int().min(0), // Server version being resolved against
}).strict();
