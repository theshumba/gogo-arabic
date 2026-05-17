import { describe, it, expect } from 'vitest';
import { progressSnapshotSchema, CEFR_LEVELS } from '../userSchemas.js';

describe('progressSnapshotSchema', () => {
  const valid = {
    weekId: '2026-W20',
    takenAt: '2026-05-17T10:00:00.000Z',
    vocabCount: 100,
    vocabMastered: 50,
    cefrLevel: 'A2',
    achievements: 5,
    playtimeMinutes: 240,
    zonesUnlocked: 3,
  };

  it('accepts a well-formed snapshot', () => {
    expect(() => progressSnapshotSchema.parse(valid)).not.toThrow();
  });

  it('defaults numeric fields to 0 when omitted', () => {
    const parsed = progressSnapshotSchema.parse({
      weekId: valid.weekId,
      takenAt: valid.takenAt,
    });
    expect(parsed.vocabCount).toBe(0);
    expect(parsed.vocabMastered).toBe(0);
    expect(parsed.achievements).toBe(0);
    expect(parsed.playtimeMinutes).toBe(0);
    expect(parsed.zonesUnlocked).toBe(0);
    expect(parsed.cefrLevel).toBe('A1');
  });

  it('rejects malformed weekId', () => {
    expect(() => progressSnapshotSchema.parse({ ...valid, weekId: '2026-99' })).toThrow();
    expect(() => progressSnapshotSchema.parse({ ...valid, weekId: 'last-week' })).toThrow();
  });

  it('rejects malformed takenAt', () => {
    expect(() => progressSnapshotSchema.parse({ ...valid, takenAt: 'yesterday' })).toThrow();
  });

  it('rejects non-enum cefrLevel (XSS-reservoir defence)', () => {
    expect(() => progressSnapshotSchema.parse({ ...valid, cefrLevel: '<script>' })).toThrow();
    expect(() => progressSnapshotSchema.parse({ ...valid, cefrLevel: 'XYZ' })).toThrow();
  });

  it('accepts every CEFR level in the canonical enum', () => {
    for (const level of CEFR_LEVELS) {
      expect(() => progressSnapshotSchema.parse({ ...valid, cefrLevel: level })).not.toThrow();
    }
  });

  it('rejects negative numeric fields', () => {
    expect(() => progressSnapshotSchema.parse({ ...valid, vocabCount: -1 })).toThrow();
    expect(() => progressSnapshotSchema.parse({ ...valid, playtimeMinutes: -10 })).toThrow();
  });

  it('rejects non-integer numeric fields', () => {
    expect(() => progressSnapshotSchema.parse({ ...valid, vocabCount: 1.5 })).toThrow();
  });

  it('rejects oversized vocabCount', () => {
    expect(() => progressSnapshotSchema.parse({ ...valid, vocabCount: 200_000 })).toThrow();
  });

  it('rejects oversized playtimeMinutes (>1 year)', () => {
    expect(() => progressSnapshotSchema.parse({ ...valid, playtimeMinutes: 600_000 })).toThrow();
  });

  it('rejects oversized achievements', () => {
    expect(() => progressSnapshotSchema.parse({ ...valid, achievements: 100_000 })).toThrow();
  });

  it('rejects vocabMastered > vocabCount (cross-field consistency)', () => {
    expect(() =>
      progressSnapshotSchema.parse({ ...valid, vocabCount: 10, vocabMastered: 100 })
    ).toThrow();
  });

  it('rejects unknown fields (strict mode prevents spoofing)', () => {
    expect(() =>
      progressSnapshotSchema.parse({ ...valid, userId: 'someoneElsesId' })
    ).toThrow();
    expect(() =>
      progressSnapshotSchema.parse({ ...valid, wordsLearned: 99999 })
    ).toThrow();
  });

  it('rejects string-coerced numerics (Mongoose would have accepted "999")', () => {
    expect(() => progressSnapshotSchema.parse({ ...valid, vocabCount: '999' })).toThrow();
  });
});
