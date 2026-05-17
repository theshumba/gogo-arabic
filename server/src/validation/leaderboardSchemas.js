import { z } from 'zod';

/**
 * Defensible upper bound on any single weekly leaderboard score.
 *
 * Derivation (see src/utils/xpCalculator.js):
 *   - Max level = 100, XP needed to reach lvl 100 ≈ 14_000 + 80*2000 ≈ 174_000.
 *   - Weekly cumulative XP for a hyper-active player (16h/day, every XP
 *     reward maxed at ~200/quest) tops out well under 1_000_000.
 *   - "wordsLearned" — total Arabic high-frequency vocab is ~12_000;
 *     most ambitious learners cover under 50_000 lifetime words.
 *   - "streak" — measured in days; even a decade of unbroken streak is
 *     under 4_000.
 *   - "questsCompleted" — at peak ~20 quests/day, a year is ~7_300.
 *
 * 10_000_000 is therefore ~10× the most extreme imaginable weekly value
 * across every category, leaving headroom for future scoring formulas
 * (combo multipliers, event bonuses) while still rejecting the classic
 * client-side cheat of submitting Number.MAX_SAFE_INTEGER.
 *
 * If/when a derived-server-side score replaces client-supplied score
 * (the long-term fix per the code review), this cap can be deleted —
 * the server will recompute from authoritative User fields.
 */
export const MAX_LEADERBOARD_SCORE = 10_000_000;

export const upsertScoreSchema = z.object({
  category: z.enum(['xp', 'wordsLearned', 'streak', 'questsCompleted']),
  score: z.number()
    .int('Score must be an integer')
    .min(0, 'Score must be non-negative')
    .max(MAX_LEADERBOARD_SCORE, `Score must not exceed ${MAX_LEADERBOARD_SCORE}`)
    .refine((v) => Number.isFinite(v), { message: 'Score must be a finite number' }),
  displayName: z.string().min(1, 'displayName is required').max(50).trim(),
}).strict(); // reject unknown fields (e.g., client-supplied userId)

export const categoryParamSchema = z.object({
  category: z.enum(['xp', 'wordsLearned', 'streak', 'questsCompleted']),
});

export const leaderboardQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});
