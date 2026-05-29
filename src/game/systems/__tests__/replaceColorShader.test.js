import { describe, it, expect } from 'vitest';
import { REPLACE_COLOR_FRAG_SHADER } from '../replaceColorShader.js';

// Regression guard for the Lucas-merge caveat: the snow shader previously
// hardcoded its output to white (vec4(1.0, 1.0, 1.0, color.a)), so the snow
// biome's iceGrassTint was never applied. The shader must instead output the
// `replaceColor` uniform so MapLoader can re-tint per biome.
describe('ReplaceColor fragment shader', () => {
  it('declares both targetColor and replaceColor uniforms', () => {
    expect(REPLACE_COLOR_FRAG_SHADER).toMatch(/uniform\s+vec3\s+targetColor\s*;/);
    expect(REPLACE_COLOR_FRAG_SHADER).toMatch(/uniform\s+vec3\s+replaceColor\s*;/);
  });

  it('outputs replaceColor on a match, preserving alpha', () => {
    expect(REPLACE_COLOR_FRAG_SHADER).toMatch(/gl_FragColor\s*=\s*vec4\(\s*replaceColor\s*,\s*color\.a\s*\)/);
  });

  it('does not hardcode the matched output to white', () => {
    expect(REPLACE_COLOR_FRAG_SHADER).not.toMatch(/vec4\(\s*1\.0\s*,\s*1\.0\s*,\s*1\.0\s*,\s*color\.a\s*\)/);
  });
});
