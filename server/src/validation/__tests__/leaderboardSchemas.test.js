import { describe, it, expect } from 'vitest';
import { upsertScoreSchema, MAX_LEADERBOARD_SCORE } from '../leaderboardSchemas.js';

describe('upsertScoreSchema', () => {
  const valid = { category: 'xp', score: 100, displayName: 'Tester' };

  it('accepts a well-formed body', () => {
    expect(() => upsertScoreSchema.parse(valid)).not.toThrow();
  });

  it('rejects non-integer score', () => {
    expect(() => upsertScoreSchema.parse({ ...valid, score: 1.5 })).toThrow();
  });

  it('rejects negative score', () => {
    expect(() => upsertScoreSchema.parse({ ...valid, score: -1 })).toThrow();
  });

  it('rejects score above MAX_LEADERBOARD_SCORE', () => {
    expect(() => upsertScoreSchema.parse({ ...valid, score: MAX_LEADERBOARD_SCORE + 1 })).toThrow();
  });

  it('rejects Number.MAX_SAFE_INTEGER', () => {
    expect(() => upsertScoreSchema.parse({ ...valid, score: Number.MAX_SAFE_INTEGER })).toThrow();
  });

  it('rejects Infinity', () => {
    expect(() => upsertScoreSchema.parse({ ...valid, score: Infinity })).toThrow();
  });

  it('rejects NaN', () => {
    expect(() => upsertScoreSchema.parse({ ...valid, score: NaN })).toThrow();
  });

  it('rejects unknown category', () => {
    expect(() => upsertScoreSchema.parse({ ...valid, category: 'cheaterCategory' })).toThrow();
  });

  it('rejects empty displayName', () => {
    expect(() => upsertScoreSchema.parse({ ...valid, displayName: '' })).toThrow();
  });

  it('rejects unknown fields (strict mode prevents userId spoofing)', () => {
    expect(() =>
      upsertScoreSchema.parse({ ...valid, userId: 'someoneElsesId' })
    ).toThrow();
  });

  it('accepts boundary value MAX_LEADERBOARD_SCORE exactly', () => {
    expect(() => upsertScoreSchema.parse({ ...valid, score: MAX_LEADERBOARD_SCORE })).not.toThrow();
  });

  it('accepts score = 0', () => {
    expect(() => upsertScoreSchema.parse({ ...valid, score: 0 })).not.toThrow();
  });
});
