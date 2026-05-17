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

/**
 * Hard cap on the JSON payload size for a progress snapshot.
 * 100 KB is far larger than any plausible snapshot (the current shape is
 * ~8 fields totalling well under 1 KB) — set here as a defence-in-depth
 * limit against accidental or malicious large submissions.
 */
export const MAX_SNAPSHOT_BYTES = 100 * 1024;

/**
 * CEFR levels accepted on a snapshot.
 * Matches the canonical scale used everywhere in the client.
 */
export const CEFR_LEVELS = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * Defensible caps on snapshot numeric fields.
 * Sized similarly to MAX_LEADERBOARD_SCORE — well above the largest
 * plausible weekly delta for each field, low enough to block obvious
 * malicious values.
 */
const SNAPSHOT_LIMITS = {
  vocabCount:      100_000,   // Arabic high-frequency vocab is ~12K; cap allows future expansion.
  vocabMastered:   100_000,   // Cannot exceed vocabCount; enforced cross-field below.
  achievements:    10_000,    // Far more than the full achievement catalogue.
  playtimeMinutes: 525_600,   // 1 year in minutes — a single weekly snapshot cannot legitimately exceed this.
  zonesUnlocked:   1_000,     // Game has dozens of zones; 1000 is a comfortable upper bound.
};

/**
 * Schema for POST /api/v1/user/progress/snapshots.
 *
 * Notes:
 *   - `weekId` is a regex-validated ISO week string (`YYYY-WNN`).
 *   - `takenAt` is an ISO-8601 datetime.
 *   - `cefrLevel` is restricted to the CEFR enum; this also closes the
 *     stored-XSS surface flagged in the code review (the field was
 *     previously accepted as arbitrary string and could land in HTML).
 *   - vocabMastered ≤ vocabCount is enforced as a refinement.
 *   - .strict() rejects unknown fields.
 */
export const progressSnapshotSchema = z.object({
  weekId: z.string()
    .regex(/^\d{4}-W\d{2}$/, 'weekId must match YYYY-WNN'),
  takenAt: z.string().datetime({ message: 'takenAt must be an ISO-8601 datetime' }),
  vocabCount: z.number().int().min(0).max(SNAPSHOT_LIMITS.vocabCount).optional().default(0),
  vocabMastered: z.number().int().min(0).max(SNAPSHOT_LIMITS.vocabMastered).optional().default(0),
  cefrLevel: z.enum(CEFR_LEVELS).optional().default('A1'),
  achievements: z.number().int().min(0).max(SNAPSHOT_LIMITS.achievements).optional().default(0),
  playtimeMinutes: z.number().int().min(0).max(SNAPSHOT_LIMITS.playtimeMinutes).optional().default(0),
  zonesUnlocked: z.number().int().min(0).max(SNAPSHOT_LIMITS.zonesUnlocked).optional().default(0),
}).strict().refine(
  (data) => data.vocabMastered <= data.vocabCount,
  { message: 'vocabMastered cannot exceed vocabCount', path: ['vocabMastered'] },
);
