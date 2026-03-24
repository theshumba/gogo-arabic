import { describe, it, expect } from 'vitest';
import { getDiacriticOpacity, splitTashkeel, hasDiacritics } from '../tashkeelFading.js';

describe('getDiacriticOpacity', () => {
  it('returns 1.0 for null stability (new word)', () => {
    expect(getDiacriticOpacity(null)).toBe(1.0);
  });

  it('returns 1.0 for stability < 3', () => {
    expect(getDiacriticOpacity(0)).toBe(1.0);
    expect(getDiacriticOpacity(2)).toBe(1.0);
    expect(getDiacriticOpacity(2.9)).toBe(1.0);
  });

  it('returns 0.6 for stability 3-9', () => {
    expect(getDiacriticOpacity(3)).toBe(0.6);
    expect(getDiacriticOpacity(5)).toBe(0.6);
    expect(getDiacriticOpacity(9)).toBe(0.6);
  });

  it('returns 0.3 for stability 10-29', () => {
    expect(getDiacriticOpacity(10)).toBe(0.3);
    expect(getDiacriticOpacity(20)).toBe(0.3);
    expect(getDiacriticOpacity(29)).toBe(0.3);
  });

  it('returns 0 for stability >= 30 (mastered)', () => {
    expect(getDiacriticOpacity(30)).toBe(0);
    expect(getDiacriticOpacity(100)).toBe(0);
  });
});

describe('splitTashkeel', () => {
  it('splits Arabic text into base chars and diacritics', () => {
    const result = splitTashkeel('كَبِيرٌ');
    const diacritics = result.filter(r => r.isDiacritic);
    const base = result.filter(r => !r.isDiacritic);
    expect(diacritics.length).toBeGreaterThan(0);
    expect(base.length).toBe(4); // ك ب ي ر
  });

  it('returns empty array for null/empty input', () => {
    expect(splitTashkeel(null)).toEqual([]);
    expect(splitTashkeel('')).toEqual([]);
  });

  it('marks all chars as non-diacritic for plain text', () => {
    const result = splitTashkeel('كبير');
    expect(result.every(r => !r.isDiacritic)).toBe(true);
  });
});

describe('hasDiacritics', () => {
  it('returns true for text with fathah', () => {
    expect(hasDiacritics('كَبِير')).toBe(true);
  });

  it('returns false for plain Arabic', () => {
    expect(hasDiacritics('كبير')).toBe(false);
  });

  it('returns false for empty/null', () => {
    expect(hasDiacritics('')).toBe(false);
  });
});
