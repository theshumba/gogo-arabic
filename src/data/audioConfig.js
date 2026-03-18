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

// Zone ambient layers (wind, birds, water — layered on top of BGM)
// Files at: /assets/audio/ambient/{layer}.mp3  (not yet created)
export const ZONE_AMBIENT_LAYERS = {};

// Interior ambient sounds
export const INTERIOR_AMBIENT = {};

// All BGM tracks for preloading reference
export const ALL_BGM_TRACKS = [
  ...Object.values(ZONE_BGM_MAP),
  MENU_BGM,
  QUIZ_BGM,
  'interior',
];

// Zone ambient sound layer configs — multiple environmental sounds per zone
// Each layer: { track: string, volume: number (0-1) }
// Files at: /assets/audio/ambient/ambient-{track}.mp3
// Files do not exist yet — playAmbient silently skips missing files via onloaderror.
export const ZONE_AMBIENT_LAYERS = {
  oasis_village: [
    { track: 'ambient-fountain', volume: 0.4 },
    { track: 'ambient-birds', volume: 0.3 },
  ],
  desert_marketplace: [
    { track: 'ambient-crowd', volume: 0.5 },
    { track: 'ambient-wind', volume: 0.2 },
    { track: 'ambient-bells', volume: 0.15 },
  ],
  ancient_library: [
    { track: 'ambient-pages', volume: 0.3 },
    { track: 'ambient-echo', volume: 0.2 },
  ],
  farmland: [
    { track: 'ambient-wind', volume: 0.4 },
    { track: 'ambient-insects', volume: 0.3 },
  ],
  bedouin_camp: [
    { track: 'ambient-fire', volume: 0.4 },
    { track: 'ambient-wind', volume: 0.3 },
  ],
  mountain_village: [
    { track: 'ambient-wind', volume: 0.5 },
    { track: 'ambient-stream', volume: 0.3 },
  ],
  coastal_port: [
    { track: 'ambient-waves', volume: 0.5 },
    { track: 'ambient-gulls', volume: 0.2 },
    { track: 'ambient-ropes', volume: 0.15 },
  ],
  royal_palace: [
    { track: 'ambient-fountain', volume: 0.3 },
    { track: 'ambient-chimes', volume: 0.2 },
  ],
};

// Interior ambient config — muffled versions
export const INTERIOR_AMBIENT = {
  default: { muffle: 0.3 },  // Reduce ambient volume to 30% inside buildings
};

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
