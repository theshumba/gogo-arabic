import Phaser from 'phaser';

/**
 * NPC sprite using 128x128 frames from monster-quest character spritesheets.
 * Same layout as Player: 4 cols × 4 rows
 * NPCs use a slow idle animation cycling through the down-facing frames.
 */
export class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, { id, key, name }) {
    super(scene, x, y, key, 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setImmovable(true);
    this.setSize(40, 30);
    this.setOffset(44, 90);

    this.npcId = id;
    this.npcName = name;

    // Idle animation — cycle through down-facing frames (row 0: frames 0-3)
    const animKey = `${id}-idle`;
    if (!scene.anims.exists(animKey)) {
      scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
        frameRate: 3,
        repeat: -1,
      });
    }
    this.anims.play(animKey);

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
  }

  setInteractionHint(visible) {
    this.hintText.setVisible(visible);
    this.hintText.setPosition(this.x, this.y - 70);
    this.nameLabel.setPosition(this.x, this.y - 56);
    this.questMarker.setPosition(this.x, this.y - 85);
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
}
