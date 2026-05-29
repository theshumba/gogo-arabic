// Fragment shader for ReplaceColorPipeline, kept in a Phaser-free module so it
// can be unit-tested without a WebGL context.
//
// Pixels within 0.1 of `targetColor` are replaced with `replaceColor`
// (preserving alpha); everything else passes through untouched. This lets one
// source tile be re-tinted per biome (e.g. green ice-grass → blue snow).
// Callers MUST set `replaceColor` alongside `targetColor` (MapLoader
// ._renderGrassTile does so for both biomes) — an unset uniform renders black.
export const REPLACE_COLOR_FRAG_SHADER = `
precision mediump float;

uniform sampler2D uMainSampler;
uniform vec3 targetColor;
uniform vec3 replaceColor;

varying vec2 outTexCoord;

void main()
{
    vec4 color = texture2D(uMainSampler, outTexCoord);

    float diff = distance(color.rgb, targetColor);

    if (diff < 0.1)
    {
        gl_FragColor = vec4(replaceColor, color.a);
    }
    else
    {
        gl_FragColor = color;
    }
}
`;
