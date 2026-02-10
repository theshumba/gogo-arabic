import Phaser from 'phaser';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const { width, height } = this.cameras.main;

    // --- Loading bar background ---
    const barW = 400;
    const barH = 20;
    const barX = (width - barW) / 2;
    const barY = height / 2;

    const bg = this.add.rectangle(width / 2, barY, barW + 4, barH + 4, 0x3a373b);
    const fill = this.add
      .rectangle(barX + 2, barY, 0, barH, 0xd4a843)
      .setOrigin(0, 0.5);

    const loadingText = this.add
      .text(width / 2, barY - 40, 'Loading...', {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '14px',
        color: '#f4fefa',
      })
      .setOrigin(0.5);

    const arabicText = this.add
      .text(width / 2, barY - 65, '\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644...', {
        fontFamily: "'Amiri', 'Arial', serif",
        fontSize: '18px',
        color: '#D4A843',
      })
      .setOrigin(0.5);

    this.load.on('progress', (p) => {
      fill.width = barW * p;
    });

    this.load.on('complete', () => {
      bg.destroy();
      fill.destroy();
      loadingText.destroy();
      arabicText.destroy();
    });

    // =========================================================
    // TILESETS
    // =========================================================
    this.load.image('tileset-world', '/assets/tilesets/world.png');
    this.load.image('tileset-coast', '/assets/tilesets/coast.png');
    this.load.image('tileset-indoor', '/assets/tilesets/indoor.png');

    this.load.spritesheet('world-tileset', '/assets/tilesets/world.png', {
      frameWidth: 64,
      frameHeight: 64,
    });

    // =========================================================
    // GROUND TILES
    // =========================================================
    this.load.image('tile-sand', '/assets/sprites/objects/sand.png');
    this.load.image('tile-grass', '/assets/sprites/objects/grass.png');

    // =========================================================
    // PLAYER BODY SPRITESHEETS (12 outfits)
    // =========================================================
    const bodyOutfits = [
      'simple-thobe', 'simple-abaya', 'travellers-cloak',
      'desert-thobe', 'blue-thobe', 'green-abaya',
      'scholars-robe', 'merchants-vest', 'bedouin-wrap',
      'mountain-cloak', 'captains-coat', 'royal-garment',
    ];
    bodyOutfits.forEach((outfit) => {
      this.load.spritesheet(
        `body-${outfit}`,
        `/assets/sprites/player/bodies/${outfit}.png`,
        { frameWidth: 128, frameHeight: 128 }
      );
    });

    // Legacy fallback
    this.load.spritesheet('player', '/assets/sprites/player/bodies/simple-thobe.png', {
      frameWidth: 128,
      frameHeight: 128,
    });

    // =========================================================
    // PLAYER HEAD COVERING SPRITESHEETS (6 coverings)
    // =========================================================
    const headCoverings = ['kufi', 'ghutra', 'turban', 'hijab', 'hood', 'none'];
    headCoverings.forEach((covering) => {
      this.load.spritesheet(
        `head-${covering}`,
        `/assets/sprites/player/heads/${covering}.png`,
        { frameWidth: 128, frameHeight: 128 }
      );
    });

    // =========================================================
    // NPC SPRITES — Faceless versions
    // =========================================================
    const facelessNpcs = [
      'scholar-yusuf', 'merchant-fatima', 'student-khalid',
      'librarian-ibrahim', 'scribe-amina',
      'trader-hassan', 'spice-seller-layla',
      'farmer-omar', 'herbalist-maryam',
      'elder-tariq', 'storyteller-noor',
      'guide-salim', 'weaver-zahra',
      'captain-rashid', 'fishmonger-hana',
      'vizier-abbas', 'princess-aisha', 'guard-hamza',
      'wanderer-ali', 'healer-khadija', 'imam-muhammad',
      'blacksmith-daud', 'poet-rumi',
    ];
    facelessNpcs.forEach((npcId) => {
      this.load.spritesheet(
        `npc-${npcId}`,
        `/assets/sprites/npcs/faceless/${npcId}.png`,
        { frameWidth: 128, frameHeight: 128 }
      );
    });

    // =========================================================
    // NPC PORTRAITS (silhouettes)
    // =========================================================
    facelessNpcs.forEach((npcId) => {
      this.load.image(`portrait-${npcId}`, `/assets/portraits/${npcId}.png`);
    });

    // =========================================================
    // OBJECT SPRITES
    // =========================================================
    this.load.image('palm', '/assets/sprites/objects/palm.png');
    this.load.image('palm-small', '/assets/sprites/objects/palm_small.png');
    this.load.image('palm-alt', '/assets/sprites/objects/palm_alt.png');
    this.load.image('house-small', '/assets/sprites/objects/house_small.png');
    this.load.image('house-small-alt', '/assets/sprites/objects/house_small_alt.png');
    this.load.image('house-large', '/assets/sprites/objects/house_large.png');
    this.load.image('house-large-alt', '/assets/sprites/objects/house_large_alt.png');
    this.load.image('rock1', '/assets/sprites/objects/sandrock1.png');
    this.load.image('rock2', '/assets/sprites/objects/sandrock2.png');
    this.load.image('ruin-pillar', '/assets/sprites/objects/ruin_pillar.png');
    this.load.image('ruin-pillar-broke', '/assets/sprites/objects/ruin_pillar_broke.png');
    this.load.image('ruin-gate', '/assets/sprites/objects/ruin_gate.png');
    this.load.image('green-tree', '/assets/sprites/objects/green_tree.png');
    this.load.image('green-tree-small', '/assets/sprites/objects/green_tree_small.png');
    this.load.image('green-tree-bushy', '/assets/sprites/objects/green_tree_bushy.png');
    this.load.image('grass-ice', '/assets/sprites/objects/grass_ice.png');
    this.load.image('ice-tree', '/assets/sprites/objects/ice_tree.png');
    this.load.image('hospital', '/assets/sprites/objects/hospital.png');
    this.load.image('gate-pillar', '/assets/sprites/objects/gate_pillar.png');
    this.load.image('gate-top', '/assets/sprites/objects/gate_top.png');
    this.load.image('shadow', '/assets/sprites/shadow.png');

    // =========================================================
    // UI ICONS
    // =========================================================
    this.load.image('ui-alert', '/assets/ui/alert.png');
    this.load.image('ui-star', '/assets/ui/star.png');
    this.load.image('ui-health', '/assets/ui/health.png');
    this.load.image('ui-energy', '/assets/ui/energy.png');
    this.load.image('ui-shield', '/assets/ui/shield.png');
    this.load.image('ui-sword', '/assets/ui/sword.png');
    this.load.image('ui-cross', '/assets/ui/cross.png');
    this.load.image('ui-hand', '/assets/ui/hand.png');
    this.load.image('ui-arrows', '/assets/ui/arrows.png');

    // =========================================================
    // BACKGROUNDS
    // =========================================================
    this.load.image('bg-sand', '/assets/backgrounds/sand.png');
    this.load.image('bg-forest', '/assets/backgrounds/forest.png');
    this.load.image('bg-ice', '/assets/backgrounds/ice.png');

    // Audio is handled entirely by Howler.js (AudioManager singleton).
    // No Phaser audio loading needed.
  }

  create() {
    this.scene.start('WorldScene');
    EventBus.emit(EVENTS.SCENE_READY);
  }
}
