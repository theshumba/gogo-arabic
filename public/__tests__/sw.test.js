import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Phase 103-04 security regression guard. The service worker can't be executed
// directly under vitest, so we assert against its source. The bug being guarded:
// networkFirst must never handle /api/ requests — it writes responses to a cache,
// which leaks auth-bound data across users on a shared device.
const sw = fs.readFileSync(path.resolve('public/sw.js'), 'utf8');

describe('service worker /api/ caching strategy (Phase 103-04)', () => {
  it('routes /api/ through networkOnly, not networkFirst', () => {
    const apiHandler = sw.match(/API_PREFIX\)\)[\s\S]{0,200}/)?.[0]
      ?? sw.match(/startsWith\(API_PREFIX\)[\s\S]{0,200}/)?.[0]
      ?? '';
    expect(apiHandler).toContain('networkOnly');
    expect(apiHandler).not.toMatch(/networkFirst\s*\(/);
  });

  it('no longer defines a networkFirst strategy', () => {
    expect(sw).not.toMatch(/function\s+networkFirst/);
  });

  it('networkOnly never reads from or writes to a cache', () => {
    const fn = sw.match(/async function networkOnly[\s\S]*?\n}/)?.[0] ?? '';
    expect(fn).toBeTruthy();
    expect(fn).not.toContain('cache.put');
    expect(fn).not.toContain('caches.open');
    expect(fn).not.toContain('caches.match');
  });

  it('purges any legacy api cache on activate (no API_CACHE retention)', () => {
    expect(sw).not.toContain('!== API_CACHE');
  });
});
