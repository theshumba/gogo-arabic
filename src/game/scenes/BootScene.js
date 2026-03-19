import Phaser from 'phaser';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';
import { KENMI_CATALOG } from '../../data/kenmiCatalog.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // --- Preload PixelAE Arabic font for Phaser Canvas text ---
    const pixelAERegular = new FontFace(
      'PixelAE',
      "url('/assets/fonts/PixelAE-Regular.ttf')"
    );
    const pixelAEBold = new FontFace(
      'PixelAE',
      "url('/assets/fonts/PixelAE-Bold.ttf')",
      { weight: 'bold' }
    );
    Promise.all([pixelAERegular.load(), pixelAEBold.load()])
      .then((fonts) => {
        fonts.forEach((f) => document.fonts.add(f));
        console.log('[BootScene] PixelAE fonts loaded');
      })
      .catch((err) => {
        console.warn('[BootScene] PixelAE font failed to load:', err);
      });

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

    // =========================================================
    // GROUND TILES (flat fallback — needed until Kenmi terrain is fixed)
    // =========================================================
    this.load.image('tile-sand', '/assets/sprites/objects/sand.png');
    this.load.image('tile-grass', '/assets/sprites/objects/grass.png');
    this.load.image('grass-ice', '/assets/sprites/objects/grass_ice.png');

    // Old placeholder object sprites (palm, house-*, rock*, ruin-*, green-tree*, ice-tree)
    // have been fully replaced by Kenmi keys in zone data and InteractableManager.
    // These load calls are no longer needed — assets stay on disk but are not loaded.

    this.load.spritesheet('world-tileset', '/assets/tilesets/world.png', {
      frameWidth: 64,
      frameHeight: 64,
    });

    this.load.spritesheet('desert-tiles', '/assets/tilesets/desert-32x32/Desert Tileset 32x32/DESERT TILESET 32x32.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

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
    // OBJECT SPRITES (legacy — only exit markers + special)
    // Old placeholder sprites (palm, house-*, rock*, ruin-*, green-tree*,
    // ice-tree) have been replaced by Kenmi keys directly in zone data.
    // =========================================================
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

    // =========================================================
    // BDRAGON PANEL ASSETS (for future spritesheet extraction)
    // =========================================================
    this.load.image('bdragon-border-1', '/assets/ui/bdragon-panels/Border All 1.png');
    this.load.image('bdragon-border-2', '/assets/ui/bdragon-panels/Border All 2.png');
    this.load.image('bdragon-border-3', '/assets/ui/bdragon-panels/Border All 3.png');
    this.load.image('bdragon-border-4', '/assets/ui/bdragon-panels/Border All 4.png');
    this.load.image('bdragon-deco-1', '/assets/ui/bdragon-panels/Deco All 1.png');
    this.load.image('bdragon-deco-2', '/assets/ui/bdragon-panels/Deco All 2.png');

    // =========================================================
    // RPG UI KIT — Main tile sheet for NineSlice panels
    // =========================================================
    this.load.image('rpg-ui-tiles', '/assets/ui/rpg-ui-kit/PNG/Main_tiles.png');
    this.load.image('rpg-ui-buttons', '/assets/ui/rpg-ui-kit/PNG/Buttons.png');
    this.load.image('rpg-ui-icons', '/assets/ui/rpg-ui-kit/PNG/Icons.png');

    // =========================================================
    // TILED MAP JSON FILES
    // =========================================================
    // Add Tiled JSON maps here as zones are built in Tiled Map Editor.
    // Convention: key = "map-{zone-id-with-hyphens}", path = "/assets/maps/{zone}.json"
    // Example: this.load.tilemapTiledJSON('map-oasis-village', '/assets/maps/oasis-village.json');
    this.load.tilemapTiledJSON('map-test-map', '/assets/maps/test-map.json');

    // =========================================================
    // KENMI CUTE FANTASY ASSETS — loaded from catalog
    // =========================================================
    // NOTE: Tiled map tileset aliases (short keys like 'desert-beach-tiles-1')
    // are registered AFTER loading via texture key aliases in create(), not here.
    // Loading the same file path as both image and spritesheet causes Phaser to
    // skip spritesheet frame slicing, resulting in black squares.
    // Register error handler once (fires per failed asset)
    this.load.on('loaderror', (file) => {
      console.warn(`[BootScene] Failed to load asset: ${file.key} @ ${file.url}`);
    });

    for (const entry of KENMI_CATALOG) {
      if (entry.type === 'spritesheet') {
        this.load.spritesheet(entry.key, entry.path, {
          frameWidth: entry.frameWidth,
          frameHeight: entry.frameHeight,
        });
      } else {
        this.load.image(entry.key, entry.path);
      }
    }
  }

  create() {
    // Generate pixel art panel textures for NineSlice use
    this._generatePanelTextures();

    // Register short-key aliases for Tiled map tileset references.
    // The actual textures were loaded as spritesheets via KENMI_CATALOG with long keys.
    // Tiled JSON files reference short keys, so we create aliases that point to the same texture.
    const tiledAliases = [
      ['desert-beach-tiles-1', 'kenmi-desert-tiles-desert-beach-tiles-1'],
      ['desert-beach-tiles-2', 'kenmi-desert-tiles-desert-beach-tiles-2'],
      ['desert-beach-tiles-3', 'kenmi-desert-tiles-desert-beach-tiles-3'],
      ['desert-grass', 'kenmi-desert-tiles-desert-grass'],
      ['desert-water-tiles-1', 'kenmi-desert-tiles-desert-water-tiles-1'],
      ['desert-water-tiles-2', 'kenmi-desert-tiles-desert-water-tiles-2'],
      ['desert-water-tiles-3', 'kenmi-desert-tiles-desert-water-tiles-3'],
    ];
    for (const [alias, sourceKey] of tiledAliases) {
      if (this.textures.exists(sourceKey) && !this.textures.exists(alias)) {
        const source = this.textures.get(sourceKey);
        this.textures.addImage(alias, source.getSourceImage());
      }
    }

    this.scene.start('WorldScene');
    EventBus.emit(EVENTS.SCENE_READY);
  }

  // ===========================================================
  // Panel texture generation
  // ===========================================================

  /**
   * Generate small pixel art panel textures at runtime using Phaser Graphics.
   * These are used as NineSlice sources — corners stay fixed, edges/center stretch.
   */
  _generatePanelTextures() {
    // Dark panel with gold border (dialogues, menus)
    this._makePanel('panel-dark', 48, 48, {
      bg: 0x1a1a2e, bgAlpha: 0.95,
      border: 0xd4a843, borderWidth: 3, cornerSize: 6,
    });

    // Parchment panel (inventory, quest journal)
    this._makePanel('panel-parchment', 48, 48, {
      bg: 0x3d2b1f, bgAlpha: 0.95,
      border: 0x8b6914, borderWidth: 3, cornerSize: 6,
    });

    // Red accent panel (battle, warnings)
    this._makePanel('panel-red', 48, 48, {
      bg: 0x2e1a1a, bgAlpha: 0.95,
      border: 0xe63946, borderWidth: 3, cornerSize: 6,
    });

    // Tooltip (small, muted)
    this._makePanel('panel-tooltip', 32, 32, {
      bg: 0x2a2a3e, bgAlpha: 0.92,
      border: 0x666680, borderWidth: 2, cornerSize: 4,
    });
  }

  /**
   * Draw a single pixel art panel texture and register it in Phaser's texture manager.
   *
   * Layout for a 48x48 source with borderWidth=3, cornerSize=6:
   *   - Outer border stroke (3px wide)
   *   - Brighter corner accents at each corner (6px along each edge)
   *   - Solid fill interior
   *
   * @param {string} key  - Texture key to register.
   * @param {number} w    - Source texture width.
   * @param {number} h    - Source texture height.
   * @param {object} opts - Drawing options.
   */
  _makePanel(key, w, h, opts) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const bw = opts.borderWidth;
    const halfBw = Math.floor(bw / 2);

    // Background fill (inset by border width)
    g.fillStyle(opts.bg, opts.bgAlpha ?? 1);
    g.fillRect(bw, bw, w - bw * 2, h - bw * 2);

    // Border stroke
    g.lineStyle(bw, opts.border, 1);
    g.strokeRect(halfBw, halfBw, w - bw, h - bw);

    // Corner accents — small bright marks at each corner for pixel art style
    const cs = opts.cornerSize;
    g.fillStyle(opts.border, 1);

    // Top-left corner
    g.fillRect(0, 0, cs, bw);
    g.fillRect(0, 0, bw, cs);

    // Top-right corner
    g.fillRect(w - cs, 0, cs, bw);
    g.fillRect(w - bw, 0, bw, cs);

    // Bottom-left corner
    g.fillRect(0, h - bw, cs, bw);
    g.fillRect(0, h - cs, bw, cs);

    // Bottom-right corner
    g.fillRect(w - cs, h - bw, cs, bw);
    g.fillRect(w - bw, h - cs, bw, cs);

    g.generateTexture(key, w, h);
    g.destroy();
  }
}
