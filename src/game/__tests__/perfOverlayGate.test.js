import { describe, expect, it } from 'vitest';
import { isPerfOverlayEnabled } from '../perfOverlayGate.js';

describe('isPerfOverlayEnabled', () => {
  it('keeps the overlay off in dev without the perf flag', () => {
    expect(isPerfOverlayEnabled({ search: '' })).toBe(false);
  });

  it('enables the overlay with the perf flag', () => {
    expect(isPerfOverlayEnabled({ search: '?perf=1' })).toBe(true);
  });
});
