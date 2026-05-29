import { REPLACE_COLOR_FRAG_SHADER } from './replaceColorShader.js';

export { REPLACE_COLOR_FRAG_SHADER };

export default class ReplaceColorPipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline {
    constructor(game) {
        super({
            game,
            fragShader: REPLACE_COLOR_FRAG_SHADER,
        });
    }
}