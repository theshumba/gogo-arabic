/**
 * statusEffects.js — Battle status effects with Arabic names (v6.0 Phase 27)
 *
 * Each status effect teaches Arabic vocabulary through combat.
 * Effects integrate with the learning system — knowing the Arabic word
 * for an effect helps the player understand and counter it.
 */

export const STATUS_EFFECTS = {
  // ── Offensive (damage over time) ──
  poison: {
    arabic: 'سُمّ',
    transliteration: 'summ',
    english: 'Poison',
    turns: 3,
    dot: 5,
    type: 'debuff',
    description: 'Deals damage each turn.',
  },
  burn: {
    arabic: 'حَرق',
    transliteration: 'harq',
    english: 'Burn',
    turns: 3,
    dot: 8,
    type: 'debuff',
    description: 'Fire burns the target each turn.',
  },
  bleed: {
    arabic: 'نَزيف',
    transliteration: 'nazīf',
    english: 'Bleed',
    turns: 2,
    dot: 6,
    type: 'debuff',
    description: 'Open wounds cause ongoing damage.',
  },

  // ── Defensive (healing / reduction) ──
  shield: {
    arabic: 'دِرع',
    transliteration: 'dirʿ',
    english: 'Shield',
    turns: 3,
    dmgReduce: 0.5,
    type: 'buff',
    description: 'Reduces incoming damage by half.',
  },
  regen: {
    arabic: 'تَجَدُّد',
    transliteration: 'tajaddud',
    english: 'Regeneration',
    turns: 3,
    hot: 5,
    type: 'buff',
    description: 'Restores health each turn.',
  },

  // ── Control (disable / hinder) ──
  silence: {
    arabic: 'صَمت',
    transliteration: 'ṣamt',
    english: 'Silence',
    turns: 2,
    blockMagic: true,
    type: 'debuff',
    description: 'Cannot cast spells.',
  },
  slow: {
    arabic: 'بُطء',
    transliteration: 'buṭʾ',
    english: 'Slow',
    turns: 2,
    speedReduce: 0.5,
    type: 'debuff',
    description: 'Reduces speed, delaying turns.',
  },
  confuse: {
    arabic: 'حَيرة',
    transliteration: 'ḥayra',
    english: 'Confusion',
    turns: 1,
    scrambleChoices: true,
    type: 'debuff',
    description: 'Answer choices are scrambled.',
  },

  // ── Stat boosts ──
  strength: {
    arabic: 'قُوَّة',
    transliteration: 'quwwa',
    english: 'Strength',
    turns: 3,
    dmgBoost: 1.3,
    type: 'buff',
    description: 'Increases attack damage by 30%.',
  },
  speed: {
    arabic: 'سُرعة',
    transliteration: 'surʿa',
    english: 'Haste',
    turns: 3,
    speedBoost: 1.5,
    type: 'buff',
    description: 'Increases speed by 50%.',
  },
  wisdom: {
    arabic: 'حِكمة',
    transliteration: 'ḥikma',
    english: 'Wisdom',
    turns: 3,
    xpBoost: 1.2,
    type: 'buff',
    description: 'Earn 20% more XP from this battle.',
  },
  courage: {
    arabic: 'شَجاعة',
    transliteration: 'shajāʿa',
    english: 'Courage',
    turns: 3,
    immuneFear: true,
    type: 'buff',
    description: 'Immune to fear effects.',
  },
  blessing: {
    arabic: 'بَرَكة',
    transliteration: 'baraka',
    english: 'Blessing',
    turns: 3,
    dropBoost: 1.3,
    type: 'buff',
    description: 'Increases reward drops by 30%.',
  },

  // ── Stat debuffs ──
  blindness: {
    arabic: 'عَمى',
    transliteration: 'ʿamā',
    english: 'Blindness',
    turns: 2,
    hideLetters: true,
    type: 'debuff',
    description: 'Some Arabic letters are hidden in prompts.',
  },
  fear: {
    arabic: 'خَوف',
    transliteration: 'khawf',
    english: 'Fear',
    turns: 2,
    dmgReduce: 0.7,
    type: 'debuff',
    description: 'Reduces attack power by 30%.',
  },
  weakness: {
    arabic: 'ضَعف',
    transliteration: 'ḍaʿf',
    english: 'Weakness',
    turns: 2,
    dmgReduce: 0.6,
    type: 'debuff',
    description: 'Reduces attack power by 40%.',
  },
};

/**
 * Get a status effect by ID.
 * @param {string} effectId
 * @returns {Object|undefined}
 */
export function getStatusEffect(effectId) {
  return STATUS_EFFECTS[effectId];
}

/**
 * Get all buff effects.
 * @returns {[string, Object][]}
 */
export function getBuffs() {
  return Object.entries(STATUS_EFFECTS).filter(([, e]) => e.type === 'buff');
}

/**
 * Get all debuff effects.
 * @returns {[string, Object][]}
 */
export function getDebuffs() {
  return Object.entries(STATUS_EFFECTS).filter(([, e]) => e.type === 'debuff');
}
