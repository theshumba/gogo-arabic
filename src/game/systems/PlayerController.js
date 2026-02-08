import { Player } from '../sprites/Player.js';

/**
 * PlayerController
 * Manages player spawn, movement, input handling, and collision setup
 */
export class PlayerController {
  constructor(scene) {
    this.scene = scene;
    this.player = null;
  }

  /**
   * Create player sprite at specified spawn position
   */
  create(spawnX, spawnY, wallGroup) {
    this.player = new Player(this.scene, spawnX, spawnY);
    this.scene.physics.add.collider(this.player, wallGroup);

    const mapPixelW = this.scene.currentMapW * 64;
    const mapPixelH = this.scene.currentMapH * 64;
    this.scene.physics.world.setBounds(0, 0, mapPixelW, mapPixelH);
    this.player.setCollideWorldBounds(true);

    return this.player;
  }

  /**
   * Update player movement (called every frame)
   */
  update() {
    if (this.player) {
      this.player.update();
    }
  }

  /**
   * Freeze player movement (during dialogue/overlays)
   */
  freeze() {
    if (this.player) {
      this.player.freeze();
    }
  }

  /**
   * Unfreeze player movement
   */
  unfreeze() {
    if (this.player) {
      this.player.unfreeze();
    }
  }

  /**
   * Get player reference
   */
  getPlayer() {
    return this.player;
  }

  /**
   * Destroy player sprite
   */
  destroy() {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
  }
}
