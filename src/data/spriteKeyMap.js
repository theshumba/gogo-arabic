/**
 * BIOME_BUILDING_SETS — Maps each tilesetTheme to its Kenmi building key arrays.
 * Consumed by mapPlaceholder.js and zone data files to select biome-appropriate buildings.
 */
export const BIOME_BUILDING_SETS = {
  desert: {
    small: [
      'kenmi-desert-houses-desert-house-1.1',
      'kenmi-desert-houses-desert-house-1.2',
      'kenmi-desert-houses-desert-house-1.3',
      'kenmi-desert-houses-desert-house-1.4',
      'kenmi-desert-houses-desert-house-2.1',
      'kenmi-desert-houses-desert-house-2.2',
      'kenmi-desert-houses-desert-house-2.3',
      'kenmi-desert-houses-desert-house-2.4',
    ],
    large: [
      'kenmi-desert-houses-desert-house-3.1',
      'kenmi-desert-houses-desert-house-3.2',
      'kenmi-desert-houses-desert-house-3.3',
      'kenmi-desert-houses-desert-house-3.4',
      'kenmi-desert-houses-desert-house-4.1',
      'kenmi-desert-houses-desert-house-4.2',
      'kenmi-desert-houses-desert-house-4.3',
      'kenmi-desert-houses-desert-house-4.4',
    ],
    temple: 'kenmi-desert-temple-desert-temple',
    pergola: 'kenmi-desert-houses-pergola',
    fence: 'kenmi-desert-props-desert-fencewall',
    obelisk: 'kenmi-desert-temple-desert-obelisk-1',
    obeliskSmall: 'kenmi-desert-temple-desert-obelisk-small-1',
  },
  grass: {
    small: [
      'kenmi-base-buildings-buildings-houses-wood-house-1-wood-base-blue',
      'kenmi-base-buildings-buildings-houses-wood-house-2-wood-base-blue',
      'kenmi-base-buildings-buildings-houses-wood-house-3-wood-base-red',
      'kenmi-base-buildings-buildings-houses-wood-house-4-wood-green-blue',
      'kenmi-base-buildings-buildings-houses-wood-house-5-wood-base-black',
    ],
    large: [
      'kenmi-base-buildings-buildings-houses-stone-house-1-stone-base-blue',
      'kenmi-base-buildings-buildings-houses-stone-house-2-stone-base-blue',
      'kenmi-base-buildings-buildings-houses-stone-house-3-stone-green-blue',
      'kenmi-base-buildings-buildings-unique-buildings-inn-inn-blue',
      'kenmi-base-buildings-buildings-unique-buildings-fisherman-house-fisherman-house-base-blue',
    ],
    barn: 'kenmi-base-buildings-buildings-unique-buildings-barn-barn-base-blue',
    stall: 'kenmi-base-buildings-buildings-unique-buildings-stalls-market-stalls',
  },
  snow: {
    small: [
      'kenmi-base-buildings-buildings-houses-stone-house-1-stone-base-black',
      'kenmi-base-buildings-buildings-houses-stone-house-2-stone-base-black',
      'kenmi-base-buildings-buildings-houses-limestone-house-1-limestone-base-black',
      'kenmi-base-buildings-buildings-houses-limestone-house-2-limestone-base-black',
    ],
    large: [
      'kenmi-base-buildings-buildings-houses-limestone-house-3-limestone-base-black',
      'kenmi-base-buildings-buildings-houses-limestone-house-4-limestone-base-black',
      'kenmi-base-buildings-buildings-houses-limestone-house-5-limestone-base-black',
      'kenmi-base-buildings-buildings-unique-buildings-inn-inn-black',
    ],
  },
  military: {
    tent: 'kenmi-military-military-tents',
    lookout: 'kenmi-military-lookout-towers',
    palisade: 'kenmi-military-palisade',
  },
  dungeon: {
    arch: 'kenmi-dungeons-dungeon-1-dungeon-1-arch',
    archOpen: 'kenmi-dungeons-dungeon-1-dungeon-1-arch-open',
    pillars: 'kenmi-dungeons-dungeon-1-dungeon-1-pillars',
    gate: 'kenmi-dungeons-dungeon-1-dungeon-1-gate-closed',
    stairs: 'kenmi-dungeons-dungeon-1-dungeon-1-stairs',
  },
  mushroom: {
    small: [
      'kenmi-shroom-houses-shroomlinng-house-1',
      'kenmi-shroom-houses-shroomlinng-house-2',
    ],
    large: [
      'kenmi-shroom-houses-shroomlinng-house-3',
      'kenmi-shroom-houses-shroomlinng-house-3.5',
    ],
  },
  volcano: {
    tower: 'kenmi-volcano-buildings-volcano-tower',
  },
};

/**
 * LEGACY FALLBACK — Maps old placeholder sprite keys to Kenmi asset keys.
 *
 * As of v8.0 Phase 43, zone data files (zones.js, mapPlaceholder.js) reference
 * Kenmi keys directly. This map is kept for backward compatibility with any
 * interior definitions or third-party code that may still reference old keys.
 * It can be removed once all consumers are verified to use Kenmi keys directly.
 */
export const SPRITE_KEY_MAP = {
  'palm': 'kenmi-desert-props-palm-tree-1',
  'palm-small': 'kenmi-desert-props-palm-tree-2',
  'palm-alt': 'kenmi-desert-props-palm-tree-1',
  'house-small': 'kenmi-desert-houses-desert-house-1.1',
  'house-small-alt': 'kenmi-desert-houses-desert-house-2.1',
  'house-large': 'kenmi-desert-houses-desert-house-3.1',
  'house-large-alt': 'kenmi-desert-houses-desert-house-4.1',
  'rock1': 'kenmi-desert-props-desert-rocks',
  'rock2': 'kenmi-desert-props-desert-rocks',
  'ruin-pillar': 'kenmi-desert-temple-desert-obelisk-small-1',
  'ruin-pillar-broke': 'kenmi-desert-temple-desert-obelisk-small-2',
  'ruin-gate': 'kenmi-desert-temple-desert-obelisk-1',
  'green-tree': 'kenmi-desert-props-acacia-tree',
  'green-tree-small': 'kenmi-desert-props-halfdead-tree',
  'green-tree-bushy': 'kenmi-desert-props-ambarakaman-plant',
  'ice-tree': 'kenmi-desert-props-dead-tree',
};

/**
 * Maps old NPC sprite keys to Kenmi character sprite keys.
 * Used by NPC.js to render Kenmi art with existing zone NPC data.
 * Keys not in this map fall back to the original 128x128 sprite behavior.
 */
export const NPC_KEY_MAP = {
  // Desert scholars/elders → person variants
  'npc-scholar-yusuf': 'kenmi-desert-npc-desert-person-1',
  'npc-student-khalid': 'kenmi-desert-npc-desert-person-2',
  'npc-librarian-ibrahim': 'kenmi-desert-npc-desert-person-3',
  'npc-scribe-amina': 'kenmi-desert-npc-desert-person-4',
  'npc-imam-muhammad': 'kenmi-desert-npc-desert-person-1',
  'npc-poet-rumi': 'kenmi-desert-npc-desert-person-3',
  'npc-elder-tariq': 'kenmi-desert-npc-pharaoh',
  'npc-storyteller-noor': 'kenmi-desert-npc-desert-person-4',

  // Merchants/traders → trader variants
  'npc-merchant-fatima': 'kenmi-desert-npc-traders-desert-trader-1',
  'npc-spice-seller-layla': 'kenmi-desert-npc-traders-desert-trader-2',
  'npc-trader-hassan': 'kenmi-desert-npc-traders-desert-trader-3',

  // Role-specific → base RPG premade NPCs
  'npc-farmer-omar': 'kenmi-base-npcs-premade-farmer-bob',
  'npc-herbalist-maryam': 'kenmi-base-npcs-premade-chef-chloe',
  'npc-blacksmith-daud': 'kenmi-base-npcs-premade-miner-mike',
  'npc-weaver-zahra': 'kenmi-base-npcs-premade-bartender-katy',
  'npc-fishmonger-hana': 'kenmi-base-npcs-premade-fisherman-fin',
  'npc-captain-rashid': 'kenmi-desert-npc-desert-person-2',
  'npc-healer-khadija': 'kenmi-desert-npc-desert-person-4',

  // Authority figures
  'npc-vizier-abbas': 'kenmi-desert-npc-pharaoh',
  'npc-princess-aisha': 'kenmi-desert-npc-traders-desert-trader-1',
  'npc-guard-hamza': 'kenmi-desert-npc-desert-person-3',

  // Wanderers/guides
  'npc-wanderer-ali': 'kenmi-desert-npc-desert-person-2',
  'npc-guide-salim': 'kenmi-desert-npc-desert-person-1',
  'npc-guide-amira': 'kenmi-desert-npc-traders-desert-trader-2',
};

/**
 * Set of NPC sprite keys belonging to female characters.
 * Used by NPC.js to apply hijab head covering overlay.
 * Female NPCs identified from character names and roles in npcs.json.
 */
export const FEMALE_NPC_IDS = new Set([
  'npc-merchant-fatima',      // Fatima
  'npc-scribe-amina',         // Amina
  'npc-spice-seller-layla',   // Layla
  'npc-herbalist-maryam',     // Maryam
  'npc-storyteller-noor',     // Noor
  'npc-weaver-zahra',         // Zahra
  'npc-healer-khadija',       // Khadija
  'npc-princess-aisha',       // Aisha
  'npc-fishmonger-hana',      // Hana
  'npc-guide-amira',          // Amira
]);

/**
 * Hijab tint color — a warm off-white that blends with Kenmi desert palette.
 * Applied as multiply tint to the hijab overlay rectangle.
 */
export const NPC_HIJAB_TINT = 0xF5E6D3;

/**
 * Maps enemy IDs from enemies.js to Kenmi overworld sprite keys.
 * Used by BattleSpriteManager as fallback when 256x256 battle sprites are unavailable.
 * Desert Warriors: 2 weapon types (atgier, bow) x 2 color variants = 4 warriors
 * Mummy: 1 variant (desert/enemies/mummy.png)
 *
 * Enemies not in this map will attempt to load battle-enemy-{id} (256x256) as before.
 * Kenmi keys rotate through 5 textures to provide visual variety.
 */
export const ENEMY_KENMI_MAP = {
  // Oasis Village enemies
  'sand-scarab':    'kenmi-desert-enemies-desert-warrior-atgier-1',
  'dust-sprite':    'kenmi-desert-enemies-desert-warrior-bow-1',
  'oasis-guardian': 'kenmi-desert-enemies-mummy',

  // Ancient Library enemies
  'ink-wraith':      'kenmi-desert-enemies-desert-warrior-bow-2',
  'scroll-golem':    'kenmi-desert-enemies-desert-warrior-atgier-2',
  'keeper-of-words': 'kenmi-desert-enemies-mummy',

  // Desert Marketplace enemies
  'sand-djinn':       'kenmi-desert-enemies-desert-warrior-atgier-1',
  'mirage-thief':     'kenmi-desert-enemies-desert-warrior-bow-1',
  'merchant-prince':  'kenmi-desert-enemies-desert-warrior-atgier-2',

  // Coastal Port enemies
  'sea-serpent':  'kenmi-desert-enemies-desert-warrior-bow-2',
  'storm-caller': 'kenmi-desert-enemies-desert-warrior-atgier-1',
  'tide-lord':    'kenmi-desert-enemies-mummy',

  // Royal Palace enemies
  'palace-sentinel': 'kenmi-desert-enemies-desert-warrior-atgier-2',
  'shadow-vizier':   'kenmi-desert-enemies-mummy',

  // Garden District enemies
  'thorn-vine':     'kenmi-desert-enemies-desert-warrior-bow-1',
  'blossom-spirit': 'kenmi-desert-enemies-desert-warrior-bow-2',

  // Mountain Pass enemies
  'rock-elemental':  'kenmi-desert-enemies-desert-warrior-atgier-2',
  'wind-hawk':       'kenmi-desert-enemies-desert-warrior-bow-1',
  'mountain-elder':  'kenmi-desert-enemies-mummy',
};
