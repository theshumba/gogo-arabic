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
