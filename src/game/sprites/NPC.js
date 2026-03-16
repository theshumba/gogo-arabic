import Phaser from 'phaser';

/**
 * NPC sprite using 128x128 frames from monster-quest character spritesheets.
 * Same layout as Player: 4 cols × 4 rows
 * NPCs use a slow idle animation cycling through the down-facing frames.
 *
 * Movement patterns (added in Phase 33):
 *   - static: default, setImmovable(true), no movement
 *   - wander: random movement within radius of spawn, setImmovable(false)
 *   - patrol: directional step-based movement loop, setImmovable(false)
 */
export class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, { id, key, name }) {
    // Use fallback texture if the NPC sprite didn't load
    const textureKey = scene.textures.exists(key) ? key : 'player';

    super(scene, x, y, textureKey, 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setImmovable(true);
    this.setSize(40, 30);
    this.setOffset(44, 90);

    this.npcId = id;
    this.npcName = name;

    // Only create idle animations if the texture has enough frames
    const idleKey = `${id}-idle`;
    const blinkKey = `${id}-blink`;
    const texture = scene.textures.get(textureKey);
    const frameCount = texture?.getFrameNames?.()?.length || Object.keys(texture?.frames || {}).length;
    const hasEnoughFrames = frameCount >= 3;

    if (hasEnoughFrames) {
      if (!scene.anims.exists(idleKey)) {
        scene.anims.create({
          key: idleKey,
          frames: scene.anims.generateFrameNumbers(textureKey, { frames: [0, 1] }),
          frameRate: 4,
          repeat: 0,
        });
      }
      if (!scene.anims.exists(blinkKey)) {
        scene.anims.create({
          key: blinkKey,
          frames: scene.anims.generateFrameNumbers(textureKey, { frames: [0, 2] }),
          frameRate: 6,
          repeat: 0,
        });
      }
    }

    // Conditionally create walk animations if the spritesheet has 16+ frames
    // (4x4 layout: row 0=walk-down, row 1=walk-left, row 2=walk-right, row 3=walk-up)
    this._hasWalkAnims = false;
    if (frameCount >= 16) {
      const walkDown = `${id}-walk-down`;
      const walkLeft = `${id}-walk-left`;
      const walkRight = `${id}-walk-right`;
      const walkUp = `${id}-walk-up`;

      if (!scene.anims.exists(walkDown)) {
        scene.anims.create({
          key: walkDown,
          frames: scene.anims.generateFrameNumbers(textureKey, { frames: [0, 1, 2, 3] }),
          frameRate: 8,
          repeat: -1,
        });
      }
      if (!scene.anims.exists(walkLeft)) {
        scene.anims.create({
          key: walkLeft,
          frames: scene.anims.generateFrameNumbers(textureKey, { frames: [4, 5, 6, 7] }),
          frameRate: 8,
          repeat: -1,
        });
      }
      if (!scene.anims.exists(walkRight)) {
        scene.anims.create({
          key: walkRight,
          frames: scene.anims.generateFrameNumbers(textureKey, { frames: [8, 9, 10, 11] }),
          frameRate: 8,
          repeat: -1,
        });
      }
      if (!scene.anims.exists(walkUp)) {
        scene.anims.create({
          key: walkUp,
          frames: scene.anims.generateFrameNumbers(textureKey, { frames: [12, 13, 14, 15] }),
          frameRate: 8,
          repeat: -1,
        });
      }
      this._hasWalkAnims = true;
    }

    // Store idle key for use in _playIdleAnim
    this._idleKey = idleKey;

    // Movement state (Phase 33)
    this._wanderTimer = null;
    this._wanderTarget = null;
    this._spawnX = x;
    this._spawnY = y;
    this._wanderRadius = 96;
    this._patrolTimer = null;
    this._patrolPath = null;
    this._patrolDurations = null;
    this._patrolIndex = 0;

    // Start on standing frame
    this.setFrame(0);

    // Timer-based idle cycle: randomly play shift or blink every 2-4s
    this.idleTimer = scene.time.addEvent({
      delay: 2000 + Math.random() * 2000,
      loop: true,
      callback: () => {
        if (!this.active) return;
        const anim = Math.random() < 0.5 ? idleKey : blinkKey;
        // Guard: only play if animation exists (texture may have failed to load)
        if (scene.anims.exists(anim)) {
          this.anims.play(anim);
        }
      },
    });

    // Interaction hint text with pixel font
    this.hintText = scene.add.text(x, y - 70, 'SPACE', {
      fontFamily: "'Press Start 2P'",
      fontSize: '8px',
      color: '#f4fefa',
      backgroundColor: '#2b292c',
      padding: { x: 6, y: 4 },
    }).setOrigin(0.5).setVisible(false).setDepth(9999);

    // Add name label above NPC
    this.nameLabel = scene.add.text(x, y - 56, name, {
      fontFamily: "'Press Start 2P'",
      fontSize: '7px',
      color: '#e2b659',
    }).setOrigin(0.5).setVisible(true).setDepth(9999);

    // Quest marker (! or ?) above NPC head
    this.questMarker = scene.add.text(x, y - 85, '', {
      fontFamily: "'Press Start 2P'",
      fontSize: '14px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setVisible(false).setDepth(10000);

    // Onboarding highlight elements
    this.onboardingArrow = scene.add.text(x, y - 100, '\u25BC', {
      fontFamily: "'Press Start 2P'",
      fontSize: '16px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setVisible(false).setDepth(10001);

    this.onboardingGlow = scene.add.circle(x, y + 10, 50, 0xFFD700, 0.3)
      .setVisible(false)
      .setDepth(5);

    this._onboardingVisible = false;
    this._arrowTween = null;
    this._glowTween = null;
  }

  setInteractionHint(visible) {
    this.hintText.setVisible(visible);
    this.hintText.setPosition(this.x, this.y - 70);
    this.nameLabel.setPosition(this.x, this.y - 56);
    this.questMarker.setPosition(this.x, this.y - 85);
    this.onboardingArrow.setPosition(this.x, this.y - 100);
    this.onboardingGlow.setPosition(this.x, this.y + 10);
  }

  setQuestMarker(type) {
    if (type === 'exclamation') {
      this.questMarker.setText('!').setColor('#FFD700').setVisible(true);
    } else if (type === 'question') {
      this.questMarker.setText('?').setColor('#00FF00').setVisible(true);
    } else {
      this.questMarker.setVisible(false);
    }
  }

  setOnboardingHighlight(visible) {
    if (this._onboardingVisible === visible) return;
    if (!this.scene) return;
    this._onboardingVisible = visible;

    // Kill existing tweens first
    if (this._arrowTween) {
      this._arrowTween.remove();
      this._arrowTween = null;
    }
    if (this._glowTween) {
      this._glowTween.remove();
      this._glowTween = null;
    }

    this.onboardingArrow.setVisible(visible);
    this.onboardingGlow.setVisible(visible);

    if (visible) {
      this._arrowTween = this.scene.tweens.add({
        targets: this.onboardingArrow,
        y: this.y - 110,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this._glowTween = this.scene.tweens.add({
        targets: this.onboardingGlow,
        scaleX: 1.4,
        scaleY: 1.4,
        alpha: 0.15,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    } else {
      // Reset to initial state
      this.onboardingArrow.setPosition(this.x, this.y - 100);
      this.onboardingGlow.setScale(1).setAlpha(0.3);
    }
  }

  // ---------------------------------------------------------------------------
  // Movement pattern methods (Phase 33: Living World)
  // ---------------------------------------------------------------------------

  /**
   * Play directional walk animation based on current velocity.
   * No-op if spritesheet doesn't have walk anim frames.
   */
  _playDirectionalWalkAnim() {
    if (!this._hasWalkAnims) return;
    const vx = this.body.velocity.x;
    const vy = this.body.velocity.y;
    const id = this.npcId;
    if (Math.abs(vx) > Math.abs(vy)) {
      this.anims.play(vx < 0 ? `${id}-walk-left` : `${id}-walk-right`, true);
    } else {
      this.anims.play(vy < 0 ? `${id}-walk-up` : `${id}-walk-down`, true);
    }
  }

  /**
   * Stop movement and return to idle frame/animation.
   */
  _playIdleAnim() {
    this.setVelocity(0, 0);
    if (this._idleKey && this.scene?.anims?.exists(this._idleKey)) {
      this.anims.play(this._idleKey);
    } else {
      this.setFrame(0);
      this.anims.stop();
    }
  }

  /**
   * Start wander behavior: NPC moves to random targets near spawn every 3-7s.
   * MUST call setImmovable(false) — default is true and blocks physics movement.
   */
  startWander(radius) {
    this.setImmovable(false);
    this._spawnX = this.x;
    this._spawnY = this.y;
    this._wanderRadius = radius || 96;

    this._wanderTimer = this.scene.time.addEvent({
      delay: 3000 + Math.random() * 4000,
      loop: true,
      callback: () => {
        if (!this.active) return;

        // Pick random target within radius of spawn
        const angle = Math.random() * Math.PI * 2;
        const dist = 32 + Math.random() * this._wanderRadius;
        let tx = this._spawnX + Math.cos(angle) * dist;
        let ty = this._spawnY + Math.sin(angle) * dist;

        // Clamp to map bounds
        const mapW = this.scene.currentMapW || 2048;
        const mapH = this.scene.currentMapH || 2048;
        tx = Phaser.Math.Clamp(tx, 32, mapW - 32);
        ty = Phaser.Math.Clamp(ty, 32, mapH - 32);

        this.scene.physics.moveToObject(this, { x: tx, y: ty }, 40);
        this._playDirectionalWalkAnim();
        this._wanderTarget = { x: tx, y: ty };
      },
    });
  }

  /**
   * Start patrol behavior: NPC steps through directional path in a loop.
   * @param {string[]} path - Array of direction strings: 'right'|'left'|'up'|'down'|'stand'
   * @param {number[]} durations - Duration in ms for each step (same length as path)
   */
  startPatrol(path, durations) {
    this.setImmovable(false);
    this._patrolPath = path;
    this._patrolDurations = durations;
    this._patrolIndex = 0;
    this._advancePatrol();
  }

  /**
   * Execute current patrol step then schedule the next one.
   */
  _advancePatrol() {
    if (!this._patrolPath || !this._patrolPath.length) return;

    const step = this._patrolPath[this._patrolIndex];
    const dur = this._patrolDurations?.[this._patrolIndex] || 2000;

    const dirMap = {
      right: { vx: 40, vy: 0 },
      left: { vx: -40, vy: 0 },
      up: { vx: 0, vy: -40 },
      down: { vx: 0, vy: 40 },
      stand: { vx: 0, vy: 0 },
    };

    const { vx, vy } = dirMap[step] || { vx: 0, vy: 0 };
    this.setVelocity(vx, vy);

    if (step !== 'stand') {
      this._playDirectionalWalkAnim();
    } else {
      this._playIdleAnim();
    }

    this._patrolTimer = this.scene.time.delayedCall(dur, () => {
      if (!this.active) return;
      this._patrolIndex = (this._patrolIndex + 1) % this._patrolPath.length;
      this._advancePatrol();
    });
  }

  /**
   * Stop all movement: zero velocity, play idle, remove timers.
   * Called when player interacts with NPC.
   */
  stopMovement() {
    this.setVelocity(0, 0);
    this._playIdleAnim();

    if (this._wanderTimer) {
      this._wanderTimer.remove();
      this._wanderTimer = null;
    }
    this._wanderTarget = null;

    if (this._patrolTimer) {
      this._patrolTimer.remove(false);
      this._patrolTimer = null;
    }
  }

  /**
   * Called every frame by the scene update loop (if wander is active).
   * Checks if NPC reached its wander target; stops velocity if so.
   */
  update() {
    if (!this._wanderTarget) return;
    const dist = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this._wanderTarget.x,
      this._wanderTarget.y
    );
    if (dist < 8) {
      this.setVelocity(0, 0);
      if (this._hasWalkAnims) {
        this.setFrame(0);
        this.anims.stop();
      }
      this._wanderTarget = null;
    }
  }

  // ---------------------------------------------------------------------------

  destroy(fromScene) {
    // Stop idle timer
    if (this.idleTimer) this.idleTimer.remove();

    // Stop movement timers (Phase 33)
    if (this._wanderTimer) this._wanderTimer.remove();
    if (this._patrolTimer) this._patrolTimer.remove(false);

    // Stop onboarding tweens
    if (this._arrowTween) this._arrowTween.remove();
    if (this._glowTween) this._glowTween.remove();

    // Destroy onboarding elements
    if (this.onboardingArrow) this.onboardingArrow.destroy();
    if (this.onboardingGlow) this.onboardingGlow.destroy();

    // Destroy other NPC elements
    if (this.hintText) this.hintText.destroy();
    if (this.nameLabel) this.nameLabel.destroy();
    if (this.questMarker) this.questMarker.destroy();

    super.destroy(fromScene);
  }
}
