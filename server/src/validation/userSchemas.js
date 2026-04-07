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

/**
 * Player settings schema — mirrors settingsSlice initialState.
 * Uses .strict() to reject any unknown fields.
 */
export const playerSettingsSchema = z.object({
  showTransliteration:    z.boolean().optional(),
  showDiacritics:         z.boolean().optional(),
  keyboardMode:           z.enum(['onscreen', 'physical']).optional(),
  masterVolume:           z.number().int().min(0).max(100).optional(),
  ambientVolume:          z.number().int().min(0).max(100).optional(),
  bgmVolume:              z.number().int().min(0).max(100).optional(),
  sfxVolume:              z.number().int().min(0).max(100).optional(),
  pronunciationVolume:    z.number().int().min(0).max(100).optional(),
  isMuted:                z.boolean().optional(),
  textSize:               z.enum(['small', 'medium', 'large']).optional(),
  difficulty:             z.enum(['easy', 'normal', 'hard']).optional(),
  vowelMarks:             z.boolean().optional(),
  hintFrequency:          z.enum(['always', 'normal', 'rare', 'never']).optional(),
  battleSpeed:            z.number().refine((v) => [0.5, 1.0, 1.5, 2.0].includes(v), {
    message: 'battleSpeed must be 0.5, 1.0, 1.5, or 2.0',
  }).optional(),
  vocabRandomizerSeed:    z.number().nullable().optional(),
  showRomanization:       z.boolean().optional(),
  colorBlindMode:         z.enum(['none', 'protanopia', 'deuteranopia', 'tritanopia']).optional(),
  fontScale:              z.number().min(0.8).max(1.5).optional(),
  reducedMotion:          z.boolean().optional(),
  highContrast:           z.boolean().optional(),
  screenReaderMode:       z.boolean().optional(),
  pronunciationPractice:  z.boolean().optional(),
  spacedListeningEnabled: z.boolean().optional(),
}).strict();

export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .trim()
    .optional(),
  character: characterSchema,
  settings: settingsSchema,
});
