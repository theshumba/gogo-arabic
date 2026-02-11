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
    // --- Phase 23: Interactive Objects ---
    { id: 'lantern-scholar-1', type: 'lantern', x: 5, y: 2, labelArabic: 'فانوس', labelEnglish: 'Study Lantern', descriptionEnglish: 'A brass lantern illuminating the scholar\'s reading desk.', vocabWordId: 'shukran', vocabCategory: 'greetings', repeatable: true },
    { id: 'painting-scholar-1', type: 'painting', x: 9, y: 3, labelArabic: 'لوحة', labelEnglish: 'Calligraphy Scroll', descriptionEnglish: 'A framed scroll of beautiful Arabic calligraphy hanging on the study wall.', culturalNote: 'Arabic calligraphy is often called the art of the soul.', vocabWordId: 'afwan', vocabCategory: 'greetings', repeatable: true },
    { id: 'pot-scholar-1', type: 'pot', x: 4, y: 6, labelArabic: 'قِدر', labelEnglish: 'Ink Pot', descriptionEnglish: 'A small clay pot of dark ink used by the scholar for writing.', vocabWordId: 'naam', vocabCategory: 'greetings', repeatable: true },
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
    // --- Phase 23: Interactive Objects ---
    { id: 'barrel-merchant-1', type: 'barrel', x: 3, y: 1, labelArabic: 'برميل', labelEnglish: 'Trade Barrel', descriptionEnglish: 'A barrel of goods Fatima has acquired through shrewd trading.', vocabWordId: 'coin_w47', vocabCategory: 'trade', repeatable: true },
    { id: 'pot-merchant-1', type: 'pot', x: 7, y: 4, labelArabic: 'قِدر', labelEnglish: 'Tea Pot', descriptionEnglish: 'A pot of mint tea kept warm for customers and guests.', vocabWordId: 'habibi', vocabCategory: 'greetings', repeatable: true },
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
    // --- Phase 23: Interactive Objects ---
    { id: 'lantern-guild-1', type: 'lantern', x: 4, y: 4, labelArabic: 'فانوس', labelEnglish: 'Guild Lantern', descriptionEnglish: 'A hanging lantern lighting the guild hall where adventurers gather.', vocabWordId: 'yalla', vocabCategory: 'greetings', repeatable: true },
    { id: 'crate-guild-1', type: 'crate', x: 10, y: 3, labelArabic: 'صندوق', labelEnglish: 'Supply Crate', descriptionEnglish: 'A crate of supplies donated by grateful villagers for adventurers.', vocabWordId: 'laa', vocabCategory: 'greetings', loot: { type: 'dirhams', min: 5, max: 15 }, repeatable: false, stateChange: 'inspected' },
    { id: 'painting-guild-1', type: 'painting', x: 10, y: 1, labelArabic: 'لوحة', labelEnglish: 'Map of Zones', descriptionEnglish: 'A hand-painted map showing all eight zones of the world.', vocabWordId: 'mashaallaah', vocabCategory: 'greetings', repeatable: true },
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
    // --- Phase 23: Interactive Objects ---
    { id: 'lantern-archive-1', type: 'lantern', x: 7, y: 3, labelArabic: 'فانوس', labelEnglish: 'Archive Lantern', descriptionEnglish: 'A tall lantern keeping the archive dimly lit to preserve the ancient manuscripts.', vocabWordId: 'num_8', vocabCategory: 'numbers', repeatable: true },
    { id: 'crate-archive-1', type: 'crate', x: 7, y: 7, labelArabic: 'صندوق', labelEnglish: 'Manuscript Crate', descriptionEnglish: 'A crate of uncatalogued scrolls and codices from the golden age of learning.', culturalNote: 'The House of Wisdom in Baghdad translated Greek, Persian, and Indian texts into Arabic.', vocabWordId: 'num_12', vocabCategory: 'numbers', loot: { type: 'dirhams', min: 10, max: 25 }, repeatable: false, stateChange: 'inspected' },
    { id: 'painting-archive-1', type: 'painting', x: 8, y: 2, labelArabic: 'لوحة', labelEnglish: 'Illuminated Map', descriptionEnglish: 'A beautifully illuminated medieval map showing the known world.', vocabWordId: 'color_brown', vocabCategory: 'colors', repeatable: true },
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
    // --- Phase 23: Interactive Objects ---
    { id: 'lantern-study-1', type: 'lantern', x: 5, y: 3, labelArabic: 'فانوس', labelEnglish: 'Reading Lantern', descriptionEnglish: 'A small oil lantern placed on the study desk for late-night reading.', vocabWordId: 'num_6', vocabCategory: 'numbers', repeatable: true },
    { id: 'pot-study-1', type: 'pot', x: 8, y: 4, labelArabic: 'قِدر', labelEnglish: 'Ink Pot', descriptionEnglish: 'A pot of black ink with a reed pen resting beside it.', vocabWordId: 'yes_1', vocabCategory: 'phrases', repeatable: true },
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
    // --- Phase 23: Interactive Objects ---
    { id: 'barrel-spice-1', type: 'barrel', x: 3, y: 3, labelArabic: 'برميل', labelEnglish: 'Cinnamon Barrel', descriptionEnglish: 'A barrel overflowing with fragrant cinnamon sticks from distant lands.', culturalNote: 'Arab traders kept their spice sources secret to maintain monopoly pricing.', vocabWordId: 'coffee_1', vocabCategory: 'food', repeatable: true },
    { id: 'pot-spice-1', type: 'pot', x: 9, y: 3, labelArabic: 'قِدر', labelEnglish: 'Spice Pot', descriptionEnglish: 'A pot of freshly ground turmeric, its golden colour bright and vivid.', vocabWordId: 'vegetables_1', vocabCategory: 'food', repeatable: true },
    { id: 'pot-spice-2', type: 'pot', x: 4, y: 7, labelArabic: 'قِدر', labelEnglish: 'Saffron Pot', descriptionEnglish: 'A tiny pot of precious saffron threads, worth more than gold by weight.', vocabWordId: 'weight_w39', vocabCategory: 'trade', repeatable: true },
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
    // --- Phase 23: Interactive Objects ---
    { id: 'crate-textile-1', type: 'crate', x: 3, y: 3, labelArabic: 'صندوق', labelEnglish: 'Silk Crate', descriptionEnglish: 'A crate of imported Chinese silk, soft to the touch and richly dyed.', vocabWordId: 'customer_w40', vocabCategory: 'trade', repeatable: true },
    { id: 'barrel-textile-1', type: 'barrel', x: 9, y: 4, labelArabic: 'برميل', labelEnglish: 'Dye Barrel', descriptionEnglish: 'A barrel of indigo dye, staining the wood a deep blue.', vocabWordId: 'sandals_w3', vocabCategory: 'clothing', repeatable: true },
    { id: 'painting-textile-1', type: 'painting', x: 3, y: 7, labelArabic: 'لوحة', labelEnglish: 'Pattern Display', descriptionEnglish: 'A sample board showing intricate weaving patterns available for order.', vocabWordId: 'quality_w41', vocabCategory: 'trade', repeatable: true },
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
    // --- Phase 23: Interactive Objects ---
    { id: 'barrel-warehouse-1', type: 'barrel', x: 4, y: 4, labelArabic: 'برميل', labelEnglish: 'Trade Barrel', descriptionEnglish: 'A heavy barrel of olive oil ready for export to the coastal port.', vocabWordId: 'trade_w42', vocabCategory: 'trade', repeatable: true },
    { id: 'crate-warehouse-1', type: 'crate', x: 9, y: 4, labelArabic: 'صندوق', labelEnglish: 'Goods Crate', descriptionEnglish: 'A crate packed with textiles and spices for the next trade caravan.', vocabWordId: 'caravan_w43', vocabCategory: 'trade', loot: { type: 'dirhams', min: 8, max: 20 }, repeatable: false, stateChange: 'inspected' },
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
    // --- Phase 23: Interactive Objects ---
    { id: 'pot-farmhouse-1', type: 'pot', x: 7, y: 3, labelArabic: 'قِدر', labelEnglish: 'Stew Pot', descriptionEnglish: 'A pot of thick farm stew simmering over the hearth. It smells of onions and lamb.', vocabWordId: 'fire_w25', vocabCategory: 'nature', repeatable: true },
    { id: 'barrel-farmhouse-1', type: 'barrel', x: 2, y: 4, labelArabic: 'برميل', labelEnglish: 'Grain Barrel', descriptionEnglish: 'A barrel of stored grain to last through the dry season.', vocabWordId: 'desert_w17', vocabCategory: 'nature', repeatable: true },
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
    // --- Phase 23: Interactive Objects ---
    { id: 'lantern-tent-1', type: 'lantern', x: 3, y: 3, labelArabic: 'فانوس', labelEnglish: 'Tent Lantern', descriptionEnglish: 'A small oil lantern casting warm light inside the tent during long desert nights.', vocabWordId: 'week_1', vocabCategory: 'time', repeatable: true },
    { id: 'pot-tent-1', type: 'pot', x: 8, y: 3, labelArabic: 'قِدر', labelEnglish: 'Coffee Dallah', descriptionEnglish: 'A traditional dallah coffee pot, its long spout polished from years of use.', culturalNote: 'The dallah coffee pot is a symbol of Arab hospitality, featured on Saudi and Emirati currency.', vocabWordId: 'year_1', vocabCategory: 'time', repeatable: true },
    { id: 'painting-tent-1', type: 'painting', x: 8, y: 1, labelArabic: 'لوحة', labelEnglish: 'Desert Tapestry', descriptionEnglish: 'A woven tapestry showing a caravan crossing dunes under a crescent moon.', vocabWordId: 'do_you_speak_arabic_1', vocabCategory: 'phrases', repeatable: true },
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
    // --- Phase 23: Interactive Objects ---
    { id: 'pot-mthome-1', type: 'pot', x: 7, y: 3, labelArabic: 'قِدر', labelEnglish: 'Herbal Tea Pot', descriptionEnglish: 'A pot of mountain sage tea, brewed fresh each morning.', vocabWordId: 'small_1', vocabCategory: 'adjectives', repeatable: true },
    { id: 'painting-mthome-1', type: 'painting', x: 2, y: 3, labelArabic: 'لوحة', labelEnglish: 'Mountain Vista', descriptionEnglish: 'A painting showing the view from the village looking down across misty valleys.', vocabWordId: 'fast_1', vocabCategory: 'adjectives', repeatable: true },
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
    // --- Phase 23: Interactive Objects ---
    { id: 'lantern-mosque-1', type: 'lantern', x: 6, y: 5, labelArabic: 'فانوس', labelEnglish: 'Prayer Lantern', descriptionEnglish: 'A beautiful glass lantern hanging in the prayer hall, its light warm and inviting.', culturalNote: 'Mosque lamps are a major art form in Islamic culture, often decorated with Quranic verses.', vocabWordId: 'bismillaah', vocabCategory: 'greetings', repeatable: true },
    { id: 'lantern-mosque-2', type: 'lantern', x: 11, y: 5, labelArabic: 'فانوس', labelEnglish: 'Prayer Lantern', descriptionEnglish: 'A matching lantern illuminating the eastern side of the prayer hall.', vocabWordId: 'alhamdulillaah', vocabCategory: 'greetings', repeatable: true },
    { id: 'painting-mosque-1', type: 'painting', x: 9, y: 4, labelArabic: 'لوحة', labelEnglish: 'Geometric Panel', descriptionEnglish: 'An intricate geometric tile panel with interlocking stars and hexagons.', culturalNote: 'Islamic geometric patterns use mathematics to create infinite, repeating designs symbolising the infinite nature of God.', vocabWordId: 'thank_you_very_much_1', vocabCategory: 'phrases', repeatable: true },
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
    // --- Phase 23: Interactive Objects ---
    { id: 'barrel-tavern-1', type: 'barrel', x: 10, y: 1, labelArabic: 'برميل', labelEnglish: 'Date Wine Barrel', descriptionEnglish: 'A barrel of sweet date wine, a favourite among the port sailors.', vocabWordId: 'juice_1', vocabCategory: 'food', repeatable: true },
    { id: 'lantern-tavern-1', type: 'lantern', x: 4, y: 5, labelArabic: 'فانوس', labelEnglish: 'Tavern Lantern', descriptionEnglish: 'A flickering lantern above the tavern counter, its light warm and hazy.', vocabWordId: 'far_1', vocabCategory: 'directions', repeatable: true },
    { id: 'painting-tavern-1', type: 'painting', x: 10, y: 4, labelArabic: 'لوحة', labelEnglish: 'Sea Monster Painting', descriptionEnglish: 'A dramatic painting of a sailor battling a sea serpent, likely exaggerated.', vocabWordId: 'chicken_1', vocabCategory: 'food', repeatable: true },
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
    // --- Phase 23: Interactive Objects ---
    { id: 'barrel-portwh-1', type: 'barrel', x: 5, y: 3, labelArabic: 'برميل', labelEnglish: 'Cargo Barrel', descriptionEnglish: 'A sealed barrel of imported goods awaiting collection by merchants.', vocabWordId: 'ship_w44', vocabCategory: 'trade', loot: { type: 'dirhams', min: 10, max: 25 }, repeatable: false, stateChange: 'inspected' },
    { id: 'crate-portwh-1', type: 'crate', x: 9, y: 5, labelArabic: 'صندوق', labelEnglish: 'Shipping Crate', descriptionEnglish: 'A large crate of ceramics packed in straw for safe transport.', vocabWordId: 'port_w45', vocabCategory: 'trade', repeatable: true },
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
    // --- Phase 23: Interactive Objects ---
    { id: 'lantern-throne-1', type: 'lantern', x: 6, y: 3, labelArabic: 'فانوس', labelEnglish: 'Royal Lantern', descriptionEnglish: 'A magnificent golden lantern encrusted with rubies, illuminating the throne room.', culturalNote: 'Royal courts in the Islamic golden age were renowned for their opulent lighting and decoration.', vocabWordId: 'color_orange', vocabCategory: 'colors', repeatable: true },
    { id: 'lantern-throne-2', type: 'lantern', x: 11, y: 3, labelArabic: 'فانوس', labelEnglish: 'Royal Lantern', descriptionEnglish: 'A matching golden lantern on the eastern side of the throne.', vocabWordId: 'no_1', vocabCategory: 'phrases', repeatable: true },
    { id: 'painting-throne-1', type: 'painting', x: 6, y: 6, labelArabic: 'لوحة', labelEnglish: 'Dynasty Painting', descriptionEnglish: 'A sweeping painting depicting the royal dynasty across five generations.', vocabWordId: 'rich_1', vocabCategory: 'adjectives', repeatable: true },
    { id: 'painting-throne-2', type: 'painting', x: 11, y: 6, labelArabic: 'لوحة', labelEnglish: 'Coronation Painting', descriptionEnglish: 'A grand scene of the current ruler\'s coronation, attended by scholars and poets.', vocabWordId: 'color_blue', vocabCategory: 'colors', repeatable: true },
    { id: 'statue-throne-1', type: 'statue', x: 7, y: 9, labelArabic: 'تمثال', labelEnglish: 'Eagle Statue', descriptionEnglish: 'A bronze eagle with outstretched wings, the royal emblem of the palace.', vocabWordId: 'heavy_1', vocabCategory: 'adjectives', repeatable: true },
    { id: 'pot-throne-1', type: 'pot', x: 2, y: 10, labelArabic: 'قِدر', labelEnglish: 'Oud Burner', descriptionEnglish: 'An ornate oud burner filling the throne room with the scent of agarwood.', culturalNote: 'Burning oud is a traditional greeting of honour for important guests in the Arab world.', vocabWordId: 'i_love_1', vocabCategory: 'phrases', repeatable: true },
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
