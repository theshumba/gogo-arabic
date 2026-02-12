/**
 * shops.js — Shop inventory configurations by zone (Phase 29)
 *
 * Each shop has:
 * - Base items (always available if player level meets minLevel)
 * - Reputation items (unlocked at reputation >= 50)
 * - Quest items (unlocked by specific quest completion)
 */

export const SHOP_BASE_ITEMS = {
  oasis_village_shop: [
    { itemId: 'simple_kufi', minLevel: 1 },
    { itemId: 'simple_taqiyah', minLevel: 1 },
    { itemId: 'travelers_thobe', minLevel: 1 },
    { itemId: 'simple_cloak', minLevel: 1 },
    { itemId: 'simple_hizam', minLevel: 1 },
    { itemId: 'simple_sandals', minLevel: 1 },
    { itemId: 'simple_gloves', minLevel: 1 },
    { itemId: 'prayer_beads', minLevel: 1 },
  ],

  sacred_library_shop: [
    { itemId: 'scholars_kufi', minLevel: 3 },
    { itemId: 'scholars_robe', minLevel: 3 },
    { itemId: 'scholars_cloak', minLevel: 3 },
    { itemId: 'scholars_belt', minLevel: 3 },
    { itemId: 'scholars_khuff', minLevel: 3 },
    { itemId: 'calligraphers_gloves', minLevel: 5 },
    { itemId: 'compass_of_qibla', minLevel: 4 },
    { itemId: 'ancient_inkwell', minLevel: 6 },
    { itemId: 'silver_ring', minLevel: 2 },
  ],

  desert_market_shop: [
    { itemId: 'merchants_turban', minLevel: 3 },
    { itemId: 'merchants_abaya', minLevel: 3 },
    { itemId: 'merchants_bisht', minLevel: 3 },
    { itemId: 'merchants_sash', minLevel: 3 },
    { itemId: 'merchants_shoes', minLevel: 3 },
    { itemId: 'desert_bisht', minLevel: 5 },
    { itemId: 'amulet_of_fortune', minLevel: 4 },
    { itemId: 'silver_ring', minLevel: 2 },
  ],

  royal_palace_shop: [
    { itemId: 'royal_ghutra', minLevel: 5 },
    { itemId: 'royal_kaftan', minLevel: 5 },
    { itemId: 'burda_of_blessing', minLevel: 8 },
    { itemId: 'astrolabe', minLevel: 7 },
    { itemId: 'emerald_pendant', minLevel: 7 },
  ],

  warriors_guild_shop: [
    { itemId: 'warriors_helmet', minLevel: 7 },
    { itemId: 'warriors_jubbah', minLevel: 7 },
    { itemId: 'warriors_farwa', minLevel: 7 },
    { itemId: 'warriors_mintaqa', minLevel: 7 },
    { itemId: 'warriors_boots', minLevel: 7 },
    { itemId: 'warriors_gauntlets', minLevel: 7 },
  ],

  explorers_outpost_shop: [
    { itemId: 'explorers_amama', minLevel: 5 },
    { itemId: 'explorers_thobe', minLevel: 2 },
    { itemId: 'explorers_rida', minLevel: 5 },
    { itemId: 'explorers_belt', minLevel: 5 },
    { itemId: 'explorers_boots', minLevel: 5 },
  ],

  healers_temple_shop: [
    { itemId: 'healers_robe', minLevel: 5 },
    { itemId: 'burda_of_blessing', minLevel: 8 },
    { itemId: 'emerald_pendant', minLevel: 7 },
    { itemId: 'prayer_beads', minLevel: 1 },
  ],

  mystic_bazaar_shop: [
    { itemId: 'ancient_inkwell', minLevel: 6 },
    { itemId: 'compass_of_qibla', minLevel: 4 },
    { itemId: 'astrolabe', minLevel: 7 },
    { itemId: 'amulet_of_fortune', minLevel: 4 },
    { itemId: 'silver_ring', minLevel: 2 },
    { itemId: 'emerald_pendant', minLevel: 7 },
  ],
};

/**
 * Items unlocked when player has faction reputation >= 50
 */
export const SHOP_REPUTATION_ITEMS = {
  sacred_library_shop: [
    { itemId: 'crown_of_wisdom', minLevel: 10 },
    { itemId: 'robe_of_stars', minLevel: 10 },
  ],

  desert_market_shop: [
    { itemId: 'belt_of_power', minLevel: 10 },
  ],

  royal_palace_shop: [
    { itemId: 'crown_of_wisdom', minLevel: 10 },
    { itemId: 'ring_of_solomon', minLevel: 10 },
  ],

  warriors_guild_shop: [
    { itemId: 'belt_of_power', minLevel: 10 },
    { itemId: 'boots_of_wind', minLevel: 10 },
  ],

  mystic_bazaar_shop: [
    { itemId: 'cloak_of_shadows', minLevel: 10 },
    { itemId: 'gloves_of_mastery', minLevel: 10 },
    { itemId: 'ring_of_solomon', minLevel: 10 },
  ],
};

/**
 * Items unlocked by completing specific quests
 */
export const SHOP_QUEST_ITEMS = {
  sacred_library_shop: [
    { itemId: 'gloves_of_mastery', minLevel: 10, questId: 'library_master_quest' },
  ],

  warriors_guild_shop: [
    { itemId: 'cloak_of_shadows', minLevel: 10, questId: 'shadow_warrior_quest' },
  ],

  mystic_bazaar_shop: [
    { itemId: 'robe_of_stars', minLevel: 10, questId: 'astrology_quest' },
    { itemId: 'boots_of_wind', minLevel: 10, questId: 'wind_djinn_quest' },
  ],
};
