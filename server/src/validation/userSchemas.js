import { z } from 'zod';

/**
 * Validation schemas for user profile endpoints
 */

const characterSchema = z.object({
  bodyType: z.string().optional(),
  skinTone: z.string().optional(),
  outfit: z.string().optional(),
  headwear: z.string().optional().nullable(),
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

export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .trim()
    .optional(),
  character: characterSchema,
  settings: settingsSchema,
});
