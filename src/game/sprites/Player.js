import Phaser from 'phaser';
import { store } from '../../store/store.js';

/**
 * Player sprite with 2-layer compositing (body + head covering).
 *
 * The body sprite is the physics-enabled main sprite.
 * The head covering sprite is a non-physics sprite that follows the body
 * and animates in sync.
 *
 * Spritesheet layout: 4 cols × 4 rows (512x512 total, 128x128 frames)
 *   Row 0 (frames 0-3): Walk down
 *   Row 1 (frames 4-7): Walk left
 *   Row 2 (frames 8-11): Walk right
 *   Row 3 (frames 12-15): Walk up
 */

// Skin tone tint values (applied as multiply tint)
// These shift the baked-in medium skin tone to the target
const SKIN_TINTS = [
  0xFFF5E8,  // 0 = light  (brighten slightly)
  0xFFFFFF,  // 1 = medium (no change)
  0xE8D0B0,  // 2 = tan    (darken slightly)
  0xC0A080,  // 3 = dark   (darken more)
];

// Map outfit IDs from Redux to body spritesheet keys
const OUTFIT_KEYS = {
  'simple-thobe': 'body-simple-thobe',
  'simple-abaya': 'body-simple-abaya',
  'travellers-cloak': 'body-travellers-cloak',
  'desert-thobe': 'body-desert-thobe',
  'blue-thobe': 'body-blue-thobe',
  'green-abaya': 'body-green-abaya',
  'scholars-robe': 'body-scholars-robe',
  'merchants-vest': 'body-merchants-vest',
  'bedouin-wrap': 'body-bedouin-wrap',
  'mountain-cloak': 'body-mountain-cloak',
  'captains-coat': 'body-captains-coat',
  'royal-garment': 'body-royal-garment',
};

// Map head covering IDs to spritesheet keys
const HEAD_KEYS = {
  'kufi': 'head-kufi',
  'ghutra': 'head-ghutra',
  'turban': 'head-turban',
  'hijab': 'head-hijab',
  'hood': 'head-hood',
  'none': 'head-none',
};

// Fallback keys
const DEFAULT_BODY = 'body-simple-thobe';
const DEFAULT_HEAD = 'head-kufi';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    // Read player state from Redux
    const state = store.getState().player;
    const bodyKey = OUTFIT_KEYS[state.outfit] || DEFAULT_BODY;
    const headKey = HEAD_KEYS[state.headCovering] || DEFAULT_HEAD;
    const skinTint = SKIN_TINTS[state.skinTone] ?? SKIN_TINTS[1];

    // Use a fallback if the body texture isn't loaded
    const textureKey = scene.textures.exists(bodyKey) ? bodyKey : 'player';

    super(scene, x, y, textureKey, 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Store current keys
    this.bodyKey = textureKey;
    this.headKey = headKey;
    this.skinTint = skinTint;

    // Physics body — smaller hitbox
    this.setSize(40, 30);
    this.setOffset(44, 90);

    this.speed = 200;
    this.isFrozen = false;
    this.lastDir = 'down';

    // Apply skin tone tint to body
    this.setTint(skinTint);

    // --- Head covering sprite (non-physics, follows body) ---
    const headTextureKey = scene.textures.exists(headKey) ? headKey : null;
    if (headTextureKey) {
      this.headSprite = scene.add.sprite(x, y, headTextureKey, 0);
      this.headSprite.setTint(skinTint);
    } else {
      this.headSprite = null;
    }

    // --- Create animations for body ---
    this._createAnims(scene, this.bodyKey, 'body');

    // --- Create animations for head ---
    if (this.headSprite && headTextureKey) {
      this._createAnims(scene, headTextureKey, 'head');
    }

    // --- Input ---
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  _createAnims(scene, textureKey, prefix) {
    const dirs = [
      { key: `${prefix}-walk-down`, row: 0 },
      { key: `${prefix}-walk-left`, row: 1 },
      { key: `${prefix}-walk-right`, row: 2 },
      { key: `${prefix}-walk-up`, row: 3 },
    ];

    dirs.forEach(({ key, row }) => {
      if (!scene.anims.exists(key)) {
        scene.anims.create({
          key,
          frames: scene.anims.generateFrameNumbers(textureKey, {
            start: row * 4,
            end: row * 4 + 3,
          }),
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    ['down', 'left', 'right', 'up'].forEach((dir, i) => {
      const idleKey = `${prefix}-idle-${dir}`;
      if (!scene.anims.exists(idleKey)) {
        scene.anims.create({
          key: idleKey,
          frames: [{ key: textureKey, frame: i * 4 }],
          frameRate: 1,
        });
      }
    });
  }

  /**
   * Play animation on both body and head in sync.
   */
  _playAnim(animSuffix, ignoreIfPlaying = true) {
    this.anims.play(`body-${animSuffix}`, ignoreIfPlaying);
    if (this.headSprite) {
      this.headSprite.anims.play(`head-${animSuffix}`, ignoreIfPlaying);
    }
  }

  /**
   * Change outfit at runtime (e.g., from shop).
   */
  changeOutfit(outfitId) {
    const newBodyKey = OUTFIT_KEYS[outfitId];
    if (!newBodyKey || !this.scene.textures.exists(newBodyKey)) return;

    this.bodyKey = newBodyKey;
    this.setTexture(newBodyKey);
    this._createAnims(this.scene, newBodyKey, 'body');
    this._playAnim(`idle-${this.lastDir}`, false);
  }

  /**
   * Change head covering at runtime.
   */
  changeHeadCovering(coveringId) {
    const newHeadKey = HEAD_KEYS[coveringId];
    if (!newHeadKey || !this.scene.textures.exists(newHeadKey)) return;

    this.headKey = newHeadKey;
    if (this.headSprite) {
      this.headSprite.setTexture(newHeadKey);
    } else {
      this.headSprite = this.scene.add.sprite(this.x, this.y, newHeadKey, 0);
      this.headSprite.setTint(this.skinTint);
    }
    this._createAnims(this.scene, newHeadKey, 'head');
    this._playAnim(`idle-${this.lastDir}`, false);
  }

  freeze() {
    this.isFrozen = true;
    this.setVelocity(0, 0);
    this._playAnim(`idle-${this.lastDir}`);
  }

  unfreeze() {
    this.isFrozen = false;
  }

  update() {
    if (this.isFrozen) return;

    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;

    this.setVelocity(0, 0);

    if (left) {
      this.setVelocityX(-this.speed);
      this._playAnim('walk-left');
      this.lastDir = 'left';
    } else if (right) {
      this.setVelocityX(this.speed);
      this._playAnim('walk-right');
      this.lastDir = 'right';
    } else if (up) {
      this.setVelocityY(-this.speed);
      this._playAnim('walk-up');
      this.lastDir = 'up';
    } else if (down) {
      this.setVelocityY(this.speed);
      this._playAnim('walk-down');
      this.lastDir = 'down';
    } else {
      this._playAnim(`idle-${this.lastDir}`);
    }

    // Normalize diagonal movement
    if ((left || right) && (up || down)) {
      this.body.velocity.normalize().scale(this.speed);
    }

    // Keep head sprite in sync with body position and depth
    if (this.headSprite) {
      this.headSprite.setPosition(this.x, this.y);
      this.headSprite.setDepth(this.depth + 1);
    }
  }

  destroy(fromScene) {
    if (this.headSprite) {
      this.headSprite.destroy();
      this.headSprite = null;
    }
    super.destroy(fromScene);
  }
}

export { SKIN_TINTS, OUTFIT_KEYS, HEAD_KEYS };
