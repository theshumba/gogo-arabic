/**
 * Centralized audio configuration.
 * Maps zones to BGM tracks and defines SFX names for consistent usage.
 */

// Zone name -> BGM track mapping
// Files at: /assets/audio/bgm/bgm-{trackName}.mp3
export const ZONE_BGM_MAP = {
  oasis_village: 'oasis',
  ancient_library: 'library',
  desert_marketplace: 'marketplace',
  farmland: 'farmland',
  bedouin_camp: 'bedouin',
  mountain_village: 'mountain',
  coastal_port: 'port',
  royal_palace: 'palace',
};

// Special tracks (not zone-based)
export const MENU_BGM = 'menu';
export const QUIZ_BGM = 'quiz';

// Interior ID -> BGM track mapping
export const INTERIOR_BGM = {
  default: 'interior',
};

// All BGM tracks for preloading reference
export const ALL_BGM_TRACKS = [
  ...Object.values(ZONE_BGM_MAP),
  MENU_BGM,
  QUIZ_BGM,
  'interior',
];

// SFX categories for consistent naming
export const SFX_NAMES = {
  // UI
  CLICK: 'click',
  MENU_OPEN: 'bookopen',
  MENU_CLOSE: 'click',
  ERROR: 'wrong',
  // Quiz
  CORRECT: 'correct',
  WRONG: 'wrong',
  QUIZ_COMPLETE: 'quest',
  STREAK: 'streak',
  // Actions
  CHEST: 'chest',
  COIN: 'coin',
  TRANSITION: 'transition',
  FOOTSTEP: 'footstep',
  NPC_INTERACT: 'click',
  WORD_LEARNED: 'wordlearned',
  LEVEL_UP: 'levelup',
  BOOK_OPEN: 'bookopen',
  BOOK_FLIP: 'bookflip',
};
