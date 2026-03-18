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

// Zone name -> Night ambient BGM track mapping (crickets, wind, etc.)
// Audio files at: /assets/audio/bgm/bgm-{trackName}.mp3
// Files do not exist yet — audioManager.playBGM() silently skips missing files via onloaderror.
export const ZONE_NIGHT_BGM_MAP = {
  oasis_village: 'oasis-night',
  ancient_library: 'library-night',
  desert_marketplace: 'marketplace-night',
  farmland: 'farmland-night',
  bedouin_camp: 'bedouin-night',
  mountain_village: 'mountain-night',
  coastal_port: 'port-night',
  royal_palace: 'palace-night',
};

// Special tracks (not zone-based)
export const MENU_BGM = 'menu';
export const QUIZ_BGM = 'quiz';

// Interior ID -> BGM track mapping
export const INTERIOR_BGM = {
  default: 'interior',
};

// Zone ambient sound layers (layered on top of BGM)
// Each zone can have multiple ambient tracks mixed at different volumes.
export const ZONE_AMBIENT_LAYERS = {
  oasis_village: [{ track: 'water-flowing', volume: 0.3 }, { track: 'birds', volume: 0.2 }],
  ancient_library: [{ track: 'pages-rustling', volume: 0.15 }],
  desert_marketplace: [{ track: 'crowd-chatter', volume: 0.25 }, { track: 'wind-light', volume: 0.1 }],
  farmland: [{ track: 'birds', volume: 0.3 }, { track: 'wind-light', volume: 0.15 }],
  bedouin_camp: [{ track: 'fire-crackle', volume: 0.3 }, { track: 'wind-desert', volume: 0.2 }],
  mountain_village: [{ track: 'wind-mountain', volume: 0.25 }],
  coastal_port: [{ track: 'waves', volume: 0.3 }, { track: 'seagulls', volume: 0.15 }],
  royal_palace: [{ track: 'fountain', volume: 0.2 }],
};

// Interior ambient sound mapping
export const INTERIOR_AMBIENT = {
  default: [{ track: 'room-tone', volume: 0.1 }],
  library: [{ track: 'pages-rustling', volume: 0.15 }],
  shop: [{ track: 'crowd-chatter', volume: 0.1 }],
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
