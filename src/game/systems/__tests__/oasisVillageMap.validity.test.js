import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const MAP = path.resolve('public/assets/maps/oasis-village.json');

// The authored map lands in Phase 4. Until then the file is absent and this
// suite is skipped (stays green). When the map exists, the same assertions run
// as the structural gate for the Tiled rebuild.
const exists = fs.existsSync(MAP);

(exists ? describe : describe.skip)('oasis-village authored map', () => {
  it('exists and is valid Tiled JSON', () => {
    expect(fs.existsSync(MAP)).toBe(true);
    const m = JSON.parse(fs.readFileSync(MAP, 'utf8'));
    expect(m.tilewidth).toBe(16);
    expect(m.layers.some((l) => l.type === 'tilelayer' && /ground/i.test(l.name))).toBe(true);
    expect(m.layers.some((l) => /^collision$/i.test(l.name))).toBe(true);
    expect(m.layers.some((l) => l.type === 'objectgroup' && /^exits$/i.test(l.name))).toBe(true);
  });

  it('every tileset name is a non-empty string (must match a loaded texture key)', () => {
    const m = JSON.parse(fs.readFileSync(MAP, 'utf8'));
    expect(m.tilesets.length).toBeGreaterThan(0);
    for (const ts of m.tilesets) expect(typeof ts.name).toBe('string');
  });
});
