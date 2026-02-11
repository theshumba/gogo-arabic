/**
 * Interior Registry — data-driven definitions for all 15 building interiors.
 * Each interior provides: map builder, objects, NPCs, interactables (with exit door).
 * Interiors are entered via door interactables in their parent zone.
 */

import { SAND, GRASS, WATER } from './zones.js';

// ============================================================
// LAYOUT TEMPLATE BUILDERS
// ============================================================

/**
 * Small house (10x8) — stone floor (SAND), carpet area (GRASS) in center.
 */
function buildSmallHouse(W = 10, H = 8) {
  const m = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      let tile = SAND;
      // Carpet area in center
      if (x >= 3 && x <= W - 4 && y >= 2 && y <= H - 3) tile = GRASS;
      row.push(tile);
    }
    m.push(row);
  }
  return m;
}

/**
 * Large house (14x10) — stone floor with two carpet areas.
 */
function buildLargeHouse(W = 14, H = 10) {
  const m = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      let tile = SAND;
      // Left carpet area
      if (x >= 2 && x <= 5 && y >= 2 && y <= H - 3) tile = GRASS;
      // Right carpet area
      if (x >= 8 && x <= 11 && y >= 2 && y <= H - 3) tile = GRASS;
      row.push(tile);
    }
    m.push(row);
  }
  return m;
}

/**
 * Shop (12x10) — counter area at top (GRASS strip at y=2).
 */
function buildShop(W = 12, H = 10) {
  const m = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      let tile = SAND;
      // Counter strip at top
      if (y === 2 && x >= 2 && x <= W - 3) tile = GRASS;
      // Display area behind counter
      if (y >= 3 && y <= 4 && x >= 2 && x <= W - 3) tile = GRASS;
      row.push(tile);
    }
    m.push(row);
  }
  return m;
}

/**
 * Library room (16x12) — reading area (GRASS) in center.
 */
function buildLibraryRoom(W = 16, H = 12) {
  const m = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      let tile = SAND;
      // Central reading area
      if (x >= 4 && x <= W - 5 && y >= 3 && y <= H - 4) tile = GRASS;
      row.push(tile);
    }
    m.push(row);
  }
  return m;
}

/**
 * Mosque (18x14) — prayer area (GRASS), ablution area (WATER corner).
 */
function buildMosque(W = 18, H = 14) {
  const m = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      let tile = SAND;
      // Prayer area (large central GRASS)
      if (x >= 3 && x <= W - 4 && y >= 2 && y <= H - 4) tile = GRASS;
      // Ablution area (WATER in bottom-right corner)
      if (x >= W - 5 && x <= W - 2 && y >= H - 4 && y <= H - 2) tile = WATER;
      row.push(tile);
    }
    m.push(row);
  }
  return m;
}

// ============================================================
// OASIS VILLAGE INTERIORS (3)
// ============================================================

const scholar_house_interior = {
  id: 'scholar_house_interior',
  name: "Scholar's Study",
  nameArabic: 'مَكتَبَة الشَّيخ',
  zone: 'oasis_village',
  mapWidth: 14,
  mapHeight: 10,
  buildMap: () => buildLargeHouse(14, 10),
  spawnPoint: { x: 7, y: 8 },

  objects: [
    { key: 'ruin-pillar', x: 1, y: 1, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 12, y: 1, collide: true, collideW: 20, collideH: 20 },
    { key: 'rock1', x: 3, y: 1, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 10, y: 1, collide: true, collideW: 30, collideH: 20 },
  ],

  npcs: [
    { id: 'scholar-yusuf-interior', key: 'npc-scholar-yusuf', name: 'Scholar Yusuf', nameArabic: 'الشَّيْخ يوسُف', x: 7, y: 3 },
  ],

  interactables: [
    { id: 'exit-door', type: 'door', x: 7, y: 9, isExit: true, labelArabic: 'خروج', labelEnglish: 'Exit' },
    { id: 'bookshelf-scholar-study-1', type: 'bookshelf', x: 2, y: 1, category: 'greetings' },
    { id: 'bookshelf-scholar-study-2', type: 'bookshelf', x: 11, y: 1, category: 'phrases' },
  ],
};

const merchant_house_interior = {
  id: 'merchant_house_interior',
  name: "Merchant's Home",
  nameArabic: 'بَيْت فاطِمَة',
  zone: 'oasis_village',
  mapWidth: 10,
  mapHeight: 8,
  buildMap: () => buildSmallHouse(10, 8),
  spawnPoint: { x: 5, y: 6 },

  objects: [
    { key: 'rock1', x: 1, y: 1, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 8, y: 1, collide: true, collideW: 30, collideH: 20 },
  ],

  npcs: [
    { id: 'merchant-fatima-interior', key: 'npc-merchant-fatima', name: 'Merchant Fatima', nameArabic: 'التّاجِرَة فاطِمَة', x: 5, y: 3 },
  ],

  interactables: [
    { id: 'exit-door', type: 'door', x: 5, y: 7, isExit: true, labelArabic: 'خروج', labelEnglish: 'Exit' },
    { id: 'chest-merchant-home', type: 'chest', x: 8, y: 1, minDirhams: 10, maxDirhams: 30 },
  ],
};

const oasis_guild_interior = {
  id: 'oasis_guild_interior',
  name: "Adventurer's Guild",
  nameArabic: 'نادي المُغامِرين',
  zone: 'oasis_village',
  mapWidth: 14,
  mapHeight: 10,
  buildMap: () => buildLargeHouse(14, 10),
  spawnPoint: { x: 7, y: 8 },

  objects: [
    { key: 'ruin-pillar', x: 1, y: 1, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 12, y: 1, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 1, y: 5, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 12, y: 5, collide: true, collideW: 20, collideH: 20 },
    { key: 'rock1', x: 6, y: 1, collide: true, collideW: 30, collideH: 20 },
  ],

  npcs: [],

  interactables: [
    { id: 'exit-door', type: 'door', x: 7, y: 9, isExit: true, labelArabic: 'خروج', labelEnglish: 'Exit' },
    { id: 'bookshelf-guild-quests', type: 'bookshelf', x: 3, y: 1, category: 'phrases' },
    { id: 'sign-guild-board', type: 'sign', x: 7, y: 2, textArabic: 'لَوحَة المَهام', textEnglish: 'Quest Board' },
  ],
};

// ============================================================
// ANCIENT LIBRARY INTERIORS (2)
// ============================================================

const library_archive_interior = {
  id: 'library_archive_interior',
  name: 'Archives',
  nameArabic: 'الأَرشيف',
  zone: 'ancient_library',
  mapWidth: 16,
  mapHeight: 12,
  buildMap: () => buildLibraryRoom(16, 12),
  spawnPoint: { x: 8, y: 10 },

  objects: [
    { key: 'ruin-pillar', x: 2, y: 2, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 13, y: 2, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 2, y: 8, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 13, y: 8, collide: true, collideW: 20, collideH: 20 },
    { key: 'rock1', x: 1, y: 1, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 14, y: 1, collide: true, collideW: 30, collideH: 20 },
  ],

  npcs: [
    { id: 'librarian-interior', key: 'npc-librarian-ibrahim', name: 'Librarian Ibrahim', nameArabic: 'أَمين المَكتَبَة إبراهيم', x: 8, y: 4 },
  ],

  interactables: [
    { id: 'exit-door', type: 'door', x: 8, y: 11, isExit: true, labelArabic: 'خروج', labelEnglish: 'Exit' },
    { id: 'bookshelf-archive-1', type: 'bookshelf', x: 4, y: 2, category: 'numbers' },
    { id: 'bookshelf-archive-2', type: 'bookshelf', x: 11, y: 2, category: 'colors' },
    { id: 'bookshelf-archive-3', type: 'bookshelf', x: 4, y: 8, category: 'phrases' },
    { id: 'bookshelf-archive-4', type: 'bookshelf', x: 11, y: 8, category: 'greetings' },
  ],
};

const library_study_interior = {
  id: 'library_study_interior',
  name: 'Study Room',
  nameArabic: 'غُرفَة الدِّراسَة',
  zone: 'ancient_library',
  mapWidth: 10,
  mapHeight: 8,
  buildMap: () => buildSmallHouse(10, 8),
  spawnPoint: { x: 5, y: 6 },

  objects: [
    { key: 'rock1', x: 1, y: 1, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 8, y: 1, collide: true, collideW: 30, collideH: 20 },
    { key: 'ruin-pillar-broke', x: 1, y: 5, collide: true, collideW: 20, collideH: 20 },
  ],

  npcs: [],

  interactables: [
    { id: 'exit-door', type: 'door', x: 5, y: 7, isExit: true, labelArabic: 'خروج', labelEnglish: 'Exit' },
    { id: 'bookshelf-study-1', type: 'bookshelf', x: 3, y: 1, category: 'numbers' },
    { id: 'bookshelf-study-2', type: 'bookshelf', x: 6, y: 1, category: 'phrases' },
  ],
};

// ============================================================
// DESERT MARKETPLACE INTERIORS (3)
// ============================================================

const spice_shop_interior = {
  id: 'spice_shop_interior',
  name: 'Spice Shop',
  nameArabic: 'دُكّان البُهارات',
  zone: 'desert_marketplace',
  mapWidth: 12,
  mapHeight: 10,
  buildMap: () => buildShop(12, 10),
  spawnPoint: { x: 6, y: 8 },

  objects: [
    { key: 'rock1', x: 1, y: 1, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 10, y: 1, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock1', x: 1, y: 5, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 10, y: 5, collide: true, collideW: 30, collideH: 20 },
  ],

  npcs: [
    { id: 'spice-merchant-interior', key: 'npc-spice-seller-layla', name: 'Spice Seller Layla', nameArabic: 'بائِعَة التَّوابِل لَيلى', x: 6, y: 3 },
  ],

  interactables: [
    { id: 'exit-door', type: 'door', x: 6, y: 9, isExit: true, labelArabic: 'خروج', labelEnglish: 'Exit' },
    { id: 'sign-spice-counter', type: 'sign', x: 6, y: 2, textArabic: 'بُهارات طازَجَة', textEnglish: 'Fresh Spices' },
  ],
};

const textile_shop_interior = {
  id: 'textile_shop_interior',
  name: 'Textile Shop',
  nameArabic: 'دُكّان الأَقمِشَة',
  zone: 'desert_marketplace',
  mapWidth: 12,
  mapHeight: 10,
  buildMap: () => buildShop(12, 10),
  spawnPoint: { x: 6, y: 8 },

  objects: [
    { key: 'rock1', x: 1, y: 1, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 10, y: 1, collide: true, collideW: 30, collideH: 20 },
    { key: 'ruin-pillar-broke', x: 1, y: 6, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar-broke', x: 10, y: 6, collide: true, collideW: 20, collideH: 20 },
  ],

  npcs: [
    { id: 'textile-merchant-interior', key: 'npc-trader-hassan', name: 'Trader Hassan', nameArabic: 'التّاجِر حَسَّان', x: 6, y: 3 },
  ],

  interactables: [
    { id: 'exit-door', type: 'door', x: 6, y: 9, isExit: true, labelArabic: 'خروج', labelEnglish: 'Exit' },
    { id: 'sign-textile-counter', type: 'sign', x: 6, y: 2, textArabic: 'أَقمِشَة فاخِرَة', textEnglish: 'Fine Textiles' },
  ],
};

const market_warehouse_interior = {
  id: 'market_warehouse_interior',
  name: 'Warehouse',
  nameArabic: 'المَخزَن',
  zone: 'desert_marketplace',
  mapWidth: 14,
  mapHeight: 10,
  buildMap: () => buildLargeHouse(14, 10),
  spawnPoint: { x: 7, y: 8 },

  objects: [
    { key: 'rock1', x: 2, y: 2, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 11, y: 2, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock1', x: 2, y: 6, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 11, y: 6, collide: true, collideW: 30, collideH: 20 },
    { key: 'ruin-pillar', x: 6, y: 1, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 7, y: 1, collide: true, collideW: 20, collideH: 20 },
  ],

  npcs: [],

  interactables: [
    { id: 'exit-door', type: 'door', x: 7, y: 9, isExit: true, labelArabic: 'خروج', labelEnglish: 'Exit' },
    { id: 'chest-warehouse-1', type: 'chest', x: 2, y: 1, minDirhams: 20, maxDirhams: 60 },
    { id: 'chest-warehouse-2', type: 'chest', x: 11, y: 1, minDirhams: 25, maxDirhams: 70 },
  ],
};

// ============================================================
// FARMLAND INTERIORS (1)
// ============================================================

const farmhouse_interior = {
  id: 'farmhouse_interior',
  name: "Farmer's House",
  nameArabic: 'بَيْت المُزارِع',
  zone: 'farmland',
  mapWidth: 10,
  mapHeight: 8,
  buildMap: () => buildSmallHouse(10, 8),
  spawnPoint: { x: 5, y: 6 },

  objects: [
    { key: 'rock1', x: 1, y: 1, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 8, y: 1, collide: true, collideW: 30, collideH: 20 },
    { key: 'green-tree-small', x: 1, y: 4, collide: true, collideW: 30, collideH: 20 },
  ],

  npcs: [
    { id: 'farmer-interior', key: 'npc-farmer-omar', name: 'Farmer Omar', nameArabic: 'المُزارِع عُمَر', x: 5, y: 3 },
  ],

  interactables: [
    { id: 'exit-door', type: 'door', x: 5, y: 7, isExit: true, labelArabic: 'خروج', labelEnglish: 'Exit' },
    { id: 'bookshelf-farmhouse', type: 'bookshelf', x: 4, y: 1, category: 'nature' },
  ],
};

// ============================================================
// BEDOUIN CAMP INTERIORS (1)
// ============================================================

const bedouin_tent_interior = {
  id: 'bedouin_tent_interior',
  name: "Elder's Tent",
  nameArabic: 'خَيْمَة الشَّيْخ',
  zone: 'bedouin_camp',
  mapWidth: 12,
  mapHeight: 10,
  buildMap: () => buildSmallHouse(12, 10),
  spawnPoint: { x: 6, y: 8 },

  objects: [
    { key: 'rock1', x: 1, y: 1, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 10, y: 1, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock1', x: 1, y: 6, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 10, y: 6, collide: true, collideW: 30, collideH: 20 },
  ],

  npcs: [
    { id: 'bedouin-elder-interior', key: 'npc-elder-tariq', name: 'Elder Tariq', nameArabic: 'الشَّيخ طارِق', x: 6, y: 3 },
  ],

  interactables: [
    { id: 'exit-door', type: 'door', x: 6, y: 9, isExit: true, labelArabic: 'خروج', labelEnglish: 'Exit' },
    { id: 'bookshelf-tent', type: 'bookshelf', x: 5, y: 1, category: 'time' },
  ],
};

// ============================================================
// MOUNTAIN VILLAGE INTERIORS (2)
// ============================================================

const mountain_home_interior = {
  id: 'mountain_home_interior',
  name: "Elder's Home",
  nameArabic: 'بَيْت الشَّيْخ',
  zone: 'mountain_village',
  mapWidth: 10,
  mapHeight: 8,
  buildMap: () => buildSmallHouse(10, 8),
  spawnPoint: { x: 5, y: 6 },

  objects: [
    { key: 'rock1', x: 1, y: 1, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 8, y: 1, collide: true, collideW: 30, collideH: 20 },
  ],

  npcs: [
    { id: 'mountain-elder-interior', key: 'npc-guide-salim', name: 'Guide Salim', nameArabic: 'الدَّليل سَليم', x: 5, y: 3 },
  ],

  interactables: [
    { id: 'exit-door', type: 'door', x: 5, y: 7, isExit: true, labelArabic: 'خروج', labelEnglish: 'Exit' },
    { id: 'bookshelf-mountain-home', type: 'bookshelf', x: 4, y: 1, category: 'adjectives' },
  ],
};

const mountain_mosque_interior = {
  id: 'mountain_mosque_interior',
  name: 'Mosque',
  nameArabic: 'المَسْجِد',
  zone: 'mountain_village',
  mapWidth: 18,
  mapHeight: 14,
  buildMap: () => buildMosque(18, 14),
  spawnPoint: { x: 9, y: 12 },

  objects: [
    { key: 'ruin-pillar', x: 3, y: 2, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 14, y: 2, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 3, y: 7, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 14, y: 7, collide: true, collideW: 20, collideH: 20 },
    { key: 'rock1', x: 1, y: 1, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 16, y: 1, collide: true, collideW: 30, collideH: 20 },
  ],

  npcs: [
    { id: 'imam-interior', key: 'npc-imam-muhammad', name: 'Imam Muhammad', nameArabic: 'الإمام مُحَمَّد', x: 9, y: 4 },
  ],

  interactables: [
    { id: 'exit-door', type: 'door', x: 9, y: 13, isExit: true, labelArabic: 'خروج', labelEnglish: 'Exit' },
    { id: 'bookshelf-mosque-1', type: 'bookshelf', x: 5, y: 2, category: 'greetings' },
    { id: 'bookshelf-mosque-2', type: 'bookshelf', x: 12, y: 2, category: 'phrases' },
    { id: 'sign-mihrab', type: 'sign', x: 9, y: 2, textArabic: 'المِحراب', textEnglish: 'The Mihrab' },
  ],
};

// ============================================================
// COASTAL PORT INTERIORS (2)
// ============================================================

const port_tavern_interior = {
  id: 'port_tavern_interior',
  name: 'Tavern',
  nameArabic: 'حانَة البَحّارَة',
  zone: 'coastal_port',
  mapWidth: 14,
  mapHeight: 10,
  buildMap: () => buildLargeHouse(14, 10),
  spawnPoint: { x: 7, y: 8 },

  objects: [
    { key: 'ruin-pillar', x: 1, y: 1, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 12, y: 1, collide: true, collideW: 20, collideH: 20 },
    { key: 'rock1', x: 6, y: 2, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 7, y: 2, collide: true, collideW: 30, collideH: 20 },
  ],

  npcs: [
    { id: 'tavern-keeper-interior', key: 'npc-captain-rashid', name: 'Captain Rashid', nameArabic: 'القُبطان رَشيد', x: 7, y: 3 },
  ],

  interactables: [
    { id: 'exit-door', type: 'door', x: 7, y: 9, isExit: true, labelArabic: 'خروج', labelEnglish: 'Exit' },
    { id: 'bookshelf-tavern', type: 'bookshelf', x: 3, y: 1, category: 'food' },
    { id: 'sign-tavern-menu', type: 'sign', x: 7, y: 1, textArabic: 'قائِمَة الطَّعام', textEnglish: 'Menu' },
  ],
};

const port_warehouse_interior = {
  id: 'port_warehouse_interior',
  name: 'Port Warehouse',
  nameArabic: 'مَخْزَن المِيناء',
  zone: 'coastal_port',
  mapWidth: 14,
  mapHeight: 10,
  buildMap: () => buildLargeHouse(14, 10),
  spawnPoint: { x: 7, y: 8 },

  objects: [
    { key: 'rock1', x: 2, y: 2, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 11, y: 2, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock1', x: 2, y: 6, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 11, y: 6, collide: true, collideW: 30, collideH: 20 },
    { key: 'ruin-pillar', x: 6, y: 1, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 7, y: 1, collide: true, collideW: 20, collideH: 20 },
  ],

  npcs: [],

  interactables: [
    { id: 'exit-door', type: 'door', x: 7, y: 9, isExit: true, labelArabic: 'خروج', labelEnglish: 'Exit' },
    { id: 'chest-port-wh-1', type: 'chest', x: 2, y: 1, minDirhams: 30, maxDirhams: 100 },
    { id: 'chest-port-wh-2', type: 'chest', x: 11, y: 1, minDirhams: 35, maxDirhams: 110 },
  ],
};

// ============================================================
// ROYAL PALACE INTERIORS (1)
// ============================================================

const palace_throne_interior = {
  id: 'palace_throne_interior',
  name: 'Throne Room',
  nameArabic: 'قاعَة العَرش',
  zone: 'royal_palace',
  mapWidth: 18,
  mapHeight: 14,
  buildMap: () => buildMosque(18, 14),
  spawnPoint: { x: 9, y: 12 },

  objects: [
    { key: 'ruin-pillar', x: 3, y: 2, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 14, y: 2, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 3, y: 5, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 14, y: 5, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 3, y: 8, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 14, y: 8, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-gate', x: 9, y: 1, collide: true, collideW: 120, collideH: 40 },
    { key: 'rock1', x: 1, y: 1, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 16, y: 1, collide: true, collideW: 30, collideH: 20 },
  ],

  npcs: [
    { id: 'vizier-interior', key: 'npc-vizier-abbas', name: 'Vizier Abbas', nameArabic: 'الوَزير عَبّاس', x: 9, y: 4 },
  ],

  interactables: [
    { id: 'exit-door', type: 'door', x: 9, y: 13, isExit: true, labelArabic: 'خروج', labelEnglish: 'Exit' },
    { id: 'bookshelf-throne-1', type: 'bookshelf', x: 5, y: 2, category: 'adjectives' },
    { id: 'bookshelf-throne-2', type: 'bookshelf', x: 12, y: 2, category: 'colors' },
    { id: 'sign-throne', type: 'sign', x: 9, y: 2, textArabic: 'عَرش المَلِك', textEnglish: "The King's Throne" },
    { id: 'chest-throne-room', type: 'chest', x: 16, y: 11, minDirhams: 80, maxDirhams: 250 },
  ],
};

// ============================================================
// INTERIOR REGISTRY
// ============================================================

export const INTERIORS = {
  scholar_house_interior,
  merchant_house_interior,
  oasis_guild_interior,
  library_archive_interior,
  library_study_interior,
  spice_shop_interior,
  textile_shop_interior,
  market_warehouse_interior,
  farmhouse_interior,
  bedouin_tent_interior,
  mountain_home_interior,
  mountain_mosque_interior,
  port_tavern_interior,
  port_warehouse_interior,
  palace_throne_interior,
};
