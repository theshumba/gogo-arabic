/**
 * Zone Registry — data-driven definitions for all 8 world zones.
 * Each zone provides: map builder, objects, NPCs, interactables, exits, and unlock rules.
 */

const TILE = 64;
const SAND = 0;
const GRASS = 1;
const WATER = 2;
const ICE_GRASS = 3;

// ============================================================
// ZONE 1: Oasis Village (40×30)
// ============================================================

function buildOasisMap() {
  const W = 40, H = 30;
  const m = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      let tile = SAND;
      const cx = 20, cy = 14;
      const dx = (x - cx) / 4, dy = (y - cy) / 2.5;
      if (dx * dx + dy * dy < 1) tile = WATER;
      const gx = (x - cx) / 5.5, gy = (y - cy) / 3.5;
      if (gx * gx + gy * gy < 1 && tile !== WATER) tile = GRASS;
      if (x >= 7 && x <= 11 && y >= 4 && y <= 7) tile = GRASS;
      if (x >= 30 && x <= 34 && y >= 22 && y <= 25) tile = GRASS;
      row.push(tile);
    }
    m.push(row);
  }
  return m;
}

const oasis_village = {
  id: 'oasis_village',
  name: 'Oasis Village',
  nameArabic: 'واحَة الحُروف',
  mapWidth: 40,
  mapHeight: 30,
  buildMap: buildOasisMap,
  spawnPoint: { x: 14, y: 20 },
  vocabCategories: ['greetings', 'trade'],

  objects: [
    { key: 'palm', x: 15, y: 11, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm', x: 25, y: 10, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm-alt', x: 18, y: 17, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm', x: 23, y: 18, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm-small', x: 16, y: 13, collide: true, collideW: 20, collideH: 16 },
    { key: 'palm-small', x: 24, y: 15, collide: true, collideW: 20, collideH: 16 },
    { key: 'palm', x: 5, y: 8, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm-alt', x: 35, y: 6, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm', x: 3, y: 22, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm-small', x: 37, y: 20, collide: true, collideW: 20, collideH: 16 },
    { key: 'palm', x: 12, y: 26, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm-alt', x: 28, y: 4, collide: true, collideW: 30, collideH: 20 },
    { key: 'house-small', x: 8, y: 3, collide: true, collideW: 180, collideH: 80 },
    { key: 'green-tree-small', x: 5, y: 5, collide: true, collideW: 30, collideH: 20 },
    { key: 'green-tree-small', x: 12, y: 5, collide: true, collideW: 30, collideH: 20 },
    { key: 'ruin-pillar', x: 6, y: 3, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 11, y: 3, collide: true, collideW: 20, collideH: 20 },
    { key: 'house-small-alt', x: 10, y: 14, collide: true, collideW: 180, collideH: 80 },
    { key: 'rock1', x: 8, y: 16, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 13, y: 16, collide: true, collideW: 30, collideH: 20 },
    { key: 'house-large', x: 32, y: 22, collide: true, collideW: 240, collideH: 100 },
    { key: 'green-tree', x: 29, y: 24, collide: true, collideW: 40, collideH: 20 },
    { key: 'ruin-pillar-broke', x: 35, y: 25, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-gate', x: 20, y: 2, collide: true, collideW: 120, collideH: 40 },
    { key: 'ruin-pillar', x: 17, y: 2, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar-broke', x: 23, y: 2, collide: true, collideW: 20, collideH: 20 },
    { key: 'rock1', x: 2, y: 14, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 36, y: 15, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock1', x: 15, y: 27, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 30, y: 8, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock1', x: 7, y: 20, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 38, y: 27, collide: true, collideW: 30, collideH: 20 },
    { key: 'house-large-alt', x: 34, y: 10, collide: true, collideW: 240, collideH: 100 },
    { key: 'house-small', x: 2, y: 3, collide: true, collideW: 180, collideH: 80 },
  ],

  npcs: [
    { id: 'scholar-yusuf', key: 'npc-scholar-yusuf', name: 'Scholar Yusuf', nameArabic: 'الشَّيْخ يوسُف', x: 9, y: 6 },
    { id: 'merchant-fatima', key: 'npc-merchant-fatima', name: 'Merchant Fatima', nameArabic: 'التّاجِرَة فاطِمَة', x: 12, y: 16 },
    { id: 'student-khalid', key: 'npc-student-khalid', name: 'Student Khalid', nameArabic: 'الطّالِب خالِد', x: 33, y: 25 },
  ],

  interactables: [
    { id: 'sign-oasis', type: 'sign', x: 19, y: 5, textArabic: 'واحَة الحُروف', textEnglish: 'Oasis of Letters' },
    { id: 'sign-market', type: 'sign', x: 9, y: 13, textArabic: 'السُّوق', textEnglish: 'The Market' },
    { id: 'sign-study', type: 'sign', x: 7, y: 4, textArabic: 'مَكْتَبَة الشَّيْخ', textEnglish: "Scholar's Library" },
    { id: 'bookshelf-scholar', type: 'bookshelf', x: 10, y: 4, category: 'greetings' },
    { id: 'bookshelf-student', type: 'bookshelf', x: 31, y: 23, category: 'phrases' },
    { id: 'chest-ruins', type: 'chest', x: 21, y: 3, minDirhams: 10, maxDirhams: 30 },
    { id: 'chest-hidden', type: 'chest', x: 2, y: 26, minDirhams: 15, maxDirhams: 50 },
    { id: 'door-scholar-house', type: 'door', x: 8, y: 5, locked: true, lockMessage: "Scholar Yusuf's private study. This door is locked.", labelArabic: '\u0628\u0627\u0628', labelEnglish: 'Door' },
  ],

  exits: [
    {
      id: 'oasis-to-library',
      edge: 'north',
      tileRange: [17, 23],
      targetZone: 'ancient_library',
      targetEntry: 'from_oasis',
      label: 'Ancient Library',
      labelArabic: 'المَكتَبَة القَديمَة',
    },
  ],

  unlock: null, // Starting zone — always unlocked

  entries: {
    from_library: { x: 20, y: 3 },
  },
};

// ============================================================
// ZONE 2: Ancient Library (35×30)
// ============================================================

function buildLibraryMap() {
  const W = 35, H = 30;
  const m = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      let tile = SAND;
      // Stone courtyard (grass tiles) in center
      if (x >= 10 && x <= 24 && y >= 8 && y <= 22) tile = GRASS;
      // Inner reading garden
      if (x >= 14 && x <= 20 && y >= 12 && y <= 18) tile = GRASS;
      // Small reflecting pool
      if (x >= 16 && x <= 18 && y >= 14 && y <= 16) tile = WATER;
      // Garden path entrance from south
      if (x >= 16 && x <= 18 && y >= 22 && y <= 29) tile = GRASS;
      // Garden path to north
      if (x >= 16 && x <= 18 && y >= 0 && y <= 8) tile = GRASS;
      row.push(tile);
    }
    m.push(row);
  }
  return m;
}

const ancient_library = {
  id: 'ancient_library',
  name: 'Ancient Library',
  nameArabic: 'المَكتَبَة القَديمَة',
  mapWidth: 35,
  mapHeight: 30,
  buildMap: buildLibraryMap,
  spawnPoint: { x: 17, y: 27 },
  vocabCategories: ['numbers', 'colors', 'phrases'],

  objects: [
    // Library building structures
    { key: 'house-large', x: 14, y: 5, collide: true, collideW: 240, collideH: 100 },
    { key: 'house-large-alt', x: 20, y: 5, collide: true, collideW: 240, collideH: 100 },
    { key: 'house-small', x: 8, y: 10, collide: true, collideW: 180, collideH: 80 },
    { key: 'house-small-alt', x: 26, y: 10, collide: true, collideW: 180, collideH: 80 },
    // Pillars lining courtyard
    { key: 'ruin-pillar', x: 10, y: 8, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 10, y: 14, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 10, y: 20, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 24, y: 8, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 24, y: 14, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 24, y: 20, collide: true, collideW: 20, collideH: 20 },
    // Broken pillars for ruins atmosphere
    { key: 'ruin-pillar-broke', x: 6, y: 4, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar-broke', x: 28, y: 4, collide: true, collideW: 20, collideH: 20 },
    // Trees around library
    { key: 'green-tree', x: 4, y: 15, collide: true, collideW: 40, collideH: 20 },
    { key: 'green-tree', x: 30, y: 15, collide: true, collideW: 40, collideH: 20 },
    { key: 'green-tree-small', x: 12, y: 24, collide: true, collideW: 30, collideH: 20 },
    { key: 'green-tree-small', x: 22, y: 24, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm', x: 3, y: 8, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm-alt', x: 31, y: 8, collide: true, collideW: 30, collideH: 20 },
    // Rocks
    { key: 'rock1', x: 2, y: 20, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 32, y: 20, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock1', x: 5, y: 27, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 29, y: 27, collide: true, collideW: 30, collideH: 20 },
    // Gate entrance
    { key: 'ruin-gate', x: 17, y: 22, collide: true, collideW: 120, collideH: 40 },
  ],

  npcs: [
    { id: 'librarian-ibrahim', key: 'npc-librarian-ibrahim', name: 'Librarian Ibrahim', nameArabic: 'أَمين المَكتَبَة إبراهيم', x: 17, y: 11 },
    { id: 'scribe-amina', key: 'npc-scribe-amina', name: 'Scribe Amina', nameArabic: 'الكاتِبَة أَمينَة', x: 12, y: 16 },
  ],

  interactables: [
    { id: 'sign-library-gate', type: 'sign', x: 17, y: 23, textArabic: 'المَكتَبَة القَديمَة', textEnglish: 'The Ancient Library' },
    { id: 'sign-reading-room', type: 'sign', x: 14, y: 11, textArabic: 'غُرفَة القِراءَة', textEnglish: 'Reading Room' },
    { id: 'bookshelf-numbers', type: 'bookshelf', x: 11, y: 11, category: 'numbers' },
    { id: 'bookshelf-colors', type: 'bookshelf', x: 23, y: 11, category: 'colors' },
    { id: 'bookshelf-phrases', type: 'bookshelf', x: 17, y: 8, category: 'phrases' },
    { id: 'chest-library', type: 'chest', x: 7, y: 6, minDirhams: 20, maxDirhams: 60 },
    { id: 'chest-library-hidden', type: 'chest', x: 30, y: 25, minDirhams: 25, maxDirhams: 70 },
    { id: 'door-archive', type: 'door', x: 20, y: 8, locked: true, lockMessage: 'The ancient archives are sealed.', labelArabic: '\u0628\u0627\u0628', labelEnglish: 'Door' },
  ],

  exits: [
    {
      id: 'library-to-oasis',
      edge: 'south',
      tileRange: [15, 19],
      targetZone: 'oasis_village',
      targetEntry: 'from_library',
      label: 'Oasis Village',
      labelArabic: 'واحَة الحُروف',
    },
    {
      id: 'library-to-marketplace',
      edge: 'east',
      tileRange: [12, 18],
      targetZone: 'desert_marketplace',
      targetEntry: 'from_library',
      label: 'Desert Marketplace',
      labelArabic: 'سوق الصَّحراء',
    },
  ],

  unlock: { quest: 'words_of_oasis' },

  entries: {
    from_oasis: { x: 17, y: 27 },
    from_marketplace: { x: 33, y: 15 },
  },
};

// ============================================================
// ZONE 3: Desert Marketplace (45×35)
// ============================================================

function buildMarketplaceMap() {
  const W = 45, H = 35;
  const m = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      let tile = SAND;
      // Main market road running east-west
      if (y >= 15 && y <= 19 && x >= 5 && x <= 39) tile = GRASS;
      // North-south cross street
      if (x >= 20 && x <= 24 && y >= 5 && y <= 29) tile = GRASS;
      // Market square at intersection
      if (x >= 18 && x <= 26 && y >= 13 && y <= 21) tile = GRASS;
      // Small fountain in center
      if (x >= 21 && x <= 23 && y >= 16 && y <= 18) tile = WATER;
      row.push(tile);
    }
    m.push(row);
  }
  return m;
}

const desert_marketplace = {
  id: 'desert_marketplace',
  name: 'Desert Marketplace',
  nameArabic: 'سوق الصَّحراء',
  mapWidth: 45,
  mapHeight: 35,
  buildMap: buildMarketplaceMap,
  spawnPoint: { x: 5, y: 17 },
  vocabCategories: ['trade', 'food', 'numbers'],

  objects: [
    // Market stalls (houses)
    { key: 'house-small', x: 10, y: 12, collide: true, collideW: 180, collideH: 80 },
    { key: 'house-small-alt', x: 10, y: 22, collide: true, collideW: 180, collideH: 80 },
    { key: 'house-small', x: 30, y: 12, collide: true, collideW: 180, collideH: 80 },
    { key: 'house-small-alt', x: 30, y: 22, collide: true, collideW: 180, collideH: 80 },
    { key: 'house-large', x: 22, y: 4, collide: true, collideW: 240, collideH: 100 },
    { key: 'house-large-alt', x: 22, y: 28, collide: true, collideW: 240, collideH: 100 },
    // Palms lining the road
    { key: 'palm', x: 7, y: 14, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm', x: 7, y: 20, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm-alt', x: 37, y: 14, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm-alt', x: 37, y: 20, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm-small', x: 15, y: 9, collide: true, collideW: 20, collideH: 16 },
    { key: 'palm-small', x: 29, y: 9, collide: true, collideW: 20, collideH: 16 },
    // Gate at market entrance
    { key: 'ruin-gate', x: 22, y: 2, collide: true, collideW: 120, collideH: 40 },
    // Rocks along edges
    { key: 'rock1', x: 3, y: 8, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 41, y: 8, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock1', x: 3, y: 28, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 41, y: 28, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock1', x: 15, y: 31, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 35, y: 31, collide: true, collideW: 30, collideH: 20 },
    // Scattered palms
    { key: 'palm', x: 40, y: 5, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm-alt', x: 4, y: 5, collide: true, collideW: 30, collideH: 20 },
  ],

  npcs: [
    { id: 'spice-seller-layla', key: 'npc-spice-seller-layla', name: 'Spice Seller Layla', nameArabic: 'بائِعَة التَّوابِل لَيلى', x: 15, y: 17 },
    { id: 'trader-hassan', key: 'npc-trader-hassan', name: 'Trader Hassan', nameArabic: 'التّاجِر حَسَّان', x: 29, y: 17 },
    { id: 'guard-hamza', key: 'npc-guard-hamza', name: 'Guard Hamza', nameArabic: 'الحارِس حَمزَة', x: 22, y: 8 },
  ],

  interactables: [
    { id: 'sign-market-main', type: 'sign', x: 22, y: 3, textArabic: 'سوق الصَّحراء', textEnglish: 'Desert Marketplace' },
    { id: 'sign-spice-stall', type: 'sign', x: 12, y: 17, textArabic: 'التَّوابِل', textEnglish: 'Spices' },
    { id: 'sign-trade-stall', type: 'sign', x: 32, y: 17, textArabic: 'البَضائِع', textEnglish: 'Goods' },
    { id: 'bookshelf-market-food', type: 'bookshelf', x: 11, y: 13, category: 'food' },
    { id: 'bookshelf-market-trade', type: 'bookshelf', x: 31, y: 13, category: 'trade' },
    { id: 'bookshelf-market-numbers', type: 'bookshelf', x: 22, y: 6, category: 'numbers' },
    { id: 'chest-market-hidden', type: 'chest', x: 40, y: 3, minDirhams: 25, maxDirhams: 80 },
    { id: 'chest-market-corner', type: 'chest', x: 3, y: 32, minDirhams: 20, maxDirhams: 65 },
    { id: 'door-warehouse', type: 'door', x: 35, y: 12, locked: true, lockMessage: "The merchant's warehouse is locked.", labelArabic: '\u0628\u0627\u0628', labelEnglish: 'Door' },
  ],

  exits: [
    {
      id: 'market-to-library',
      edge: 'west',
      tileRange: [15, 19],
      targetZone: 'ancient_library',
      targetEntry: 'from_marketplace',
      label: 'Ancient Library',
      labelArabic: 'المَكتَبَة القَديمَة',
    },
    {
      id: 'market-to-farmland',
      edge: 'north',
      tileRange: [19, 25],
      targetZone: 'farmland',
      targetEntry: 'from_marketplace',
      label: 'Farmland',
      labelArabic: 'الأَرض الزِّراعِيَّة',
    },
  ],

  unlock: { quest: 'master_of_letters', minLevel: 5 },

  entries: {
    from_library: { x: 3, y: 17 },
    from_farmland: { x: 22, y: 3 },
  },
};

// ============================================================
// ZONE 4: Farmland (45×35)
// ============================================================

function buildFarmlandMap() {
  const W = 45, H = 35;
  const m = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      let tile = SAND;
      // Large grass fields
      if (x >= 5 && x <= 20 && y >= 5 && y <= 15) tile = GRASS;
      if (x >= 25 && x <= 40 && y >= 5 && y <= 15) tile = GRASS;
      if (x >= 10 && x <= 35 && y >= 20 && y <= 30) tile = GRASS;
      // Irrigation canal
      if (x >= 22 && x <= 23 && y >= 3 && y <= 32) tile = WATER;
      // Small pond
      if (x >= 36 && x <= 39 && y >= 25 && y <= 28) tile = WATER;
      // Path
      if (y >= 16 && y <= 19 && x >= 3 && x <= 42) tile = SAND;
      row.push(tile);
    }
    m.push(row);
  }
  return m;
}

const farmland = {
  id: 'farmland',
  name: 'Farmland',
  nameArabic: 'الأَرض الزِّراعِيَّة',
  mapWidth: 45,
  mapHeight: 35,
  buildMap: buildFarmlandMap,
  spawnPoint: { x: 22, y: 33 },
  vocabCategories: ['nature', 'animals', 'body', 'verbs_basic'],

  objects: [
    // Farm buildings
    { key: 'house-large', x: 10, y: 3, collide: true, collideW: 240, collideH: 100 },
    { key: 'house-small', x: 35, y: 3, collide: true, collideW: 180, collideH: 80 },
    { key: 'house-small-alt', x: 8, y: 22, collide: true, collideW: 180, collideH: 80 },
    // Trees around fields
    { key: 'green-tree', x: 5, y: 5, collide: true, collideW: 40, collideH: 20 },
    { key: 'green-tree', x: 20, y: 5, collide: true, collideW: 40, collideH: 20 },
    { key: 'green-tree-bushy', x: 25, y: 5, collide: true, collideW: 40, collideH: 20 },
    { key: 'green-tree-bushy', x: 40, y: 5, collide: true, collideW: 40, collideH: 20 },
    { key: 'green-tree-small', x: 10, y: 15, collide: true, collideW: 30, collideH: 20 },
    { key: 'green-tree-small', x: 35, y: 15, collide: true, collideW: 30, collideH: 20 },
    { key: 'green-tree', x: 15, y: 20, collide: true, collideW: 40, collideH: 20 },
    { key: 'green-tree', x: 30, y: 20, collide: true, collideW: 40, collideH: 20 },
    // Rocks along edges
    { key: 'rock1', x: 2, y: 10, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 42, y: 10, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock1', x: 2, y: 30, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 42, y: 30, collide: true, collideW: 30, collideH: 20 },
    // Palm trees
    { key: 'palm', x: 40, y: 22, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm-alt', x: 3, y: 18, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm-small', x: 42, y: 18, collide: true, collideW: 20, collideH: 16 },
  ],

  npcs: [
    { id: 'farmer-omar', key: 'npc-farmer-omar', name: 'Farmer Omar', nameArabic: 'المُزارِع عُمَر', x: 12, y: 10 },
    { id: 'herbalist-maryam', key: 'npc-herbalist-maryam', name: 'Herbalist Maryam', nameArabic: 'العَشّابَة مَريَم', x: 33, y: 25 },
  ],

  interactables: [
    { id: 'sign-farm-entrance', type: 'sign', x: 22, y: 32, textArabic: 'الأَرض الزِّراعِيَّة', textEnglish: 'The Farmland' },
    { id: 'sign-farm-barn', type: 'sign', x: 10, y: 4, textArabic: 'المَزرَعَة', textEnglish: 'The Farm' },
    { id: 'bookshelf-nature', type: 'bookshelf', x: 7, y: 8, category: 'nature' },
    { id: 'bookshelf-animals', type: 'bookshelf', x: 37, y: 8, category: 'animals' },
    { id: 'bookshelf-body', type: 'bookshelf', x: 20, y: 25, category: 'body' },
    { id: 'chest-farm-hidden', type: 'chest', x: 42, y: 3, minDirhams: 30, maxDirhams: 90 },
    { id: 'chest-farm-pond', type: 'chest', x: 36, y: 30, minDirhams: 25, maxDirhams: 75 },
    { id: 'door-barn', type: 'door', x: 15, y: 8, locked: true, lockMessage: 'The barn door is stuck.', labelArabic: '\u0628\u0627\u0628', labelEnglish: 'Door' },
  ],

  exits: [
    {
      id: 'farm-to-marketplace',
      edge: 'south',
      tileRange: [19, 25],
      targetZone: 'desert_marketplace',
      targetEntry: 'from_farmland',
      label: 'Desert Marketplace',
      labelArabic: 'سوق الصَّحراء',
    },
    {
      id: 'farm-to-bedouin',
      edge: 'east',
      tileRange: [15, 19],
      targetZone: 'bedouin_camp',
      targetEntry: 'from_farmland',
      label: 'Bedouin Camp',
      labelArabic: 'مُخَيَّم البَدو',
    },
  ],

  unlock: { quest: 'merchant_master', minLevel: 8, minWords: 400 },

  entries: {
    from_marketplace: { x: 22, y: 33 },
    from_bedouin: { x: 43, y: 17 },
  },
};

// ============================================================
// ZONE 5: Bedouin Camp (35×25)
// ============================================================

function buildBedouinMap() {
  const W = 35, H = 25;
  const m = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      let tile = SAND;
      // Central campfire area
      if (x >= 14 && x <= 20 && y >= 10 && y <= 16) tile = GRASS;
      // Tent areas (small grass patches)
      if (x >= 5 && x <= 10 && y >= 6 && y <= 10) tile = GRASS;
      if (x >= 24 && x <= 30 && y >= 6 && y <= 10) tile = GRASS;
      if (x >= 5 && x <= 10 && y >= 16 && y <= 20) tile = GRASS;
      row.push(tile);
    }
    m.push(row);
  }
  return m;
}

const bedouin_camp = {
  id: 'bedouin_camp',
  name: 'Bedouin Camp',
  nameArabic: 'مُخَيَّم البَدو',
  mapWidth: 35,
  mapHeight: 25,
  buildMap: buildBedouinMap,
  spawnPoint: { x: 3, y: 13 },
  vocabCategories: ['time', 'phrases', 'adjectives'],

  objects: [
    // Tent structures
    { key: 'house-small', x: 7, y: 6, collide: true, collideW: 180, collideH: 80 },
    { key: 'house-small-alt', x: 27, y: 6, collide: true, collideW: 180, collideH: 80 },
    { key: 'house-small', x: 7, y: 17, collide: true, collideW: 180, collideH: 80 },
    // Central gathering area
    { key: 'rock1', x: 16, y: 12, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 18, y: 14, collide: true, collideW: 30, collideH: 20 },
    // Scattered palms
    { key: 'palm', x: 2, y: 5, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm-alt', x: 32, y: 5, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm', x: 2, y: 20, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm-small', x: 32, y: 20, collide: true, collideW: 20, collideH: 16 },
    { key: 'palm', x: 17, y: 3, collide: true, collideW: 30, collideH: 20 },
    // Edge rocks
    { key: 'rock1', x: 12, y: 22, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 25, y: 22, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock1', x: 30, y: 15, collide: true, collideW: 30, collideH: 20 },
  ],

  npcs: [
    { id: 'elder-tariq', key: 'npc-elder-tariq', name: 'Elder Tariq', nameArabic: 'الشَّيخ طارِق', x: 17, y: 13 },
    { id: 'storyteller-noor', key: 'npc-storyteller-noor', name: 'Storyteller Noor', nameArabic: 'الحَكّاءَة نور', x: 8, y: 8 },
    { id: 'wanderer-ali', key: 'npc-wanderer-ali', name: 'Wanderer Ali', nameArabic: 'الرَّحّالَة عَلي', x: 27, y: 8 },
  ],

  interactables: [
    { id: 'sign-camp', type: 'sign', x: 3, y: 12, textArabic: 'مُخَيَّم البَدو', textEnglish: 'Bedouin Camp' },
    { id: 'sign-elder-tent', type: 'sign', x: 14, y: 10, textArabic: 'خَيمَة الشَّيخ', textEnglish: "Elder's Tent" },
    { id: 'bookshelf-time', type: 'bookshelf', x: 9, y: 18, category: 'time' },
    { id: 'bookshelf-adjectives', type: 'bookshelf', x: 29, y: 8, category: 'adjectives' },
    { id: 'chest-camp-hidden', type: 'chest', x: 31, y: 22, minDirhams: 30, maxDirhams: 100 },
    { id: 'chest-camp-tent', type: 'chest', x: 5, y: 7, minDirhams: 25, maxDirhams: 80 },
  ],

  exits: [
    {
      id: 'bedouin-to-farmland',
      edge: 'west',
      tileRange: [11, 15],
      targetZone: 'farmland',
      targetEntry: 'from_bedouin',
      label: 'Farmland',
      labelArabic: 'الأَرض الزِّراعِيَّة',
    },
    {
      id: 'bedouin-to-mountain',
      edge: 'north',
      tileRange: [15, 19],
      targetZone: 'mountain_village',
      targetEntry: 'from_bedouin',
      label: 'Mountain Village',
      labelArabic: 'قَرية الجَبَل',
    },
  ],

  unlock: { quest: 'natures_scholar', minLevel: 11, minWords: 600 },

  entries: {
    from_farmland: { x: 3, y: 13 },
    from_mountain: { x: 17, y: 3 },
  },
};

// ============================================================
// ZONE 6: Mountain Village (40×30)
// ============================================================

function buildMountainMap() {
  const W = 40, H = 30;
  const m = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      let tile = ICE_GRASS;
      // Rocky mountain paths
      if ((y >= 13 && y <= 16) || (x >= 18 && x <= 21)) tile = SAND;
      // Village clearing
      if (x >= 12 && x <= 28 && y >= 8 && y <= 22) tile = GRASS;
      // Mountain stream
      if (x >= 30 && x <= 31 && y >= 3 && y <= 27) tile = WATER;
      // Small pond
      if (x >= 20 && x <= 23 && y >= 18 && y <= 20) tile = WATER;
      row.push(tile);
    }
    m.push(row);
  }
  return m;
}

const mountain_village = {
  id: 'mountain_village',
  name: 'Mountain Village',
  nameArabic: 'قَرية الجَبَل',
  mapWidth: 40,
  mapHeight: 30,
  buildMap: buildMountainMap,
  spawnPoint: { x: 20, y: 27 },
  vocabCategories: ['clothing', 'animals', 'adjectives'],

  objects: [
    // Village buildings
    { key: 'house-large', x: 15, y: 9, collide: true, collideW: 240, collideH: 100 },
    { key: 'house-large-alt', x: 25, y: 9, collide: true, collideW: 240, collideH: 100 },
    { key: 'house-small', x: 14, y: 18, collide: true, collideW: 180, collideH: 80 },
    { key: 'house-small-alt', x: 26, y: 18, collide: true, collideW: 180, collideH: 80 },
    // Mountain trees (ice trees and green)
    { key: 'ice-tree', x: 4, y: 6, collide: true, collideW: 30, collideH: 20 },
    { key: 'ice-tree', x: 8, y: 4, collide: true, collideW: 30, collideH: 20 },
    { key: 'ice-tree', x: 35, y: 6, collide: true, collideW: 30, collideH: 20 },
    { key: 'ice-tree', x: 37, y: 4, collide: true, collideW: 30, collideH: 20 },
    { key: 'green-tree', x: 12, y: 14, collide: true, collideW: 40, collideH: 20 },
    { key: 'green-tree', x: 28, y: 14, collide: true, collideW: 40, collideH: 20 },
    { key: 'green-tree-bushy', x: 6, y: 20, collide: true, collideW: 40, collideH: 20 },
    { key: 'green-tree-bushy', x: 34, y: 20, collide: true, collideW: 40, collideH: 20 },
    // Rocks and pillars
    { key: 'rock1', x: 3, y: 14, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 37, y: 14, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock1', x: 8, y: 26, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 33, y: 26, collide: true, collideW: 30, collideH: 20 },
    { key: 'ruin-pillar', x: 18, y: 8, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 22, y: 8, collide: true, collideW: 20, collideH: 20 },
  ],

  npcs: [
    { id: 'guide-salim', key: 'npc-guide-salim', name: 'Guide Salim', nameArabic: 'الدَّليل سَليم', x: 20, y: 13 },
    { id: 'weaver-zahra', key: 'npc-weaver-zahra', name: 'Weaver Zahra', nameArabic: 'النَّسّاجَة زَهراء', x: 15, y: 20 },
    { id: 'healer-khadija', key: 'npc-healer-khadija', name: 'Healer Khadija', nameArabic: 'المُعالِجَة خَديجَة', x: 27, y: 20 },
  ],

  interactables: [
    { id: 'sign-mountain', type: 'sign', x: 20, y: 26, textArabic: 'قَرية الجَبَل', textEnglish: 'Mountain Village' },
    { id: 'sign-weaver', type: 'sign', x: 13, y: 18, textArabic: 'بَيت النَّسّاجَة', textEnglish: "Weaver's House" },
    { id: 'bookshelf-clothing', type: 'bookshelf', x: 16, y: 10, category: 'clothing' },
    { id: 'bookshelf-animals-mt', type: 'bookshelf', x: 24, y: 10, category: 'animals' },
    { id: 'bookshelf-adj-mt', type: 'bookshelf', x: 20, y: 16, category: 'adjectives' },
    { id: 'chest-mountain-stream', type: 'chest', x: 32, y: 15, minDirhams: 35, maxDirhams: 110 },
    { id: 'chest-mountain-peak', type: 'chest', x: 5, y: 3, minDirhams: 40, maxDirhams: 120 },
  ],

  exits: [
    {
      id: 'mountain-to-bedouin',
      edge: 'south',
      tileRange: [17, 23],
      targetZone: 'bedouin_camp',
      targetEntry: 'from_mountain',
      label: 'Bedouin Camp',
      labelArabic: 'مُخَيَّم البَدو',
    },
    {
      id: 'mountain-to-port',
      edge: 'east',
      tileRange: [12, 18],
      targetZone: 'coastal_port',
      targetEntry: 'from_mountain',
      label: 'Coastal Port',
      labelArabic: 'المِيناء',
    },
  ],

  unlock: { quest: 'tales_of_desert', minLevel: 14, minWords: 800 },

  entries: {
    from_bedouin: { x: 20, y: 27 },
    from_port: { x: 38, y: 15 },
  },
};

// ============================================================
// ZONE 7: Coastal Port (45×35)
// ============================================================

function buildPortMap() {
  const W = 45, H = 35;
  const m = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      let tile = SAND;
      // Harbor water on the east side
      if (x >= 35) tile = WATER;
      // Dock area (grass path along water edge)
      if (x >= 32 && x <= 34 && y >= 5 && y <= 30) tile = GRASS;
      // Town center
      if (x >= 10 && x <= 25 && y >= 12 && y <= 22) tile = GRASS;
      // Main road to dock
      if (y >= 16 && y <= 18 && x >= 5 && x <= 34) tile = GRASS;
      row.push(tile);
    }
    m.push(row);
  }
  return m;
}

const coastal_port = {
  id: 'coastal_port',
  name: 'Coastal Port',
  nameArabic: 'المِيناء',
  mapWidth: 45,
  mapHeight: 35,
  buildMap: buildPortMap,
  spawnPoint: { x: 3, y: 17 },
  vocabCategories: ['directions', 'trade', 'food'],

  objects: [
    // Port buildings
    { key: 'house-large', x: 15, y: 10, collide: true, collideW: 240, collideH: 100 },
    { key: 'house-large-alt', x: 22, y: 10, collide: true, collideW: 240, collideH: 100 },
    { key: 'house-small', x: 10, y: 22, collide: true, collideW: 180, collideH: 80 },
    { key: 'house-small-alt', x: 22, y: 22, collide: true, collideW: 180, collideH: 80 },
    // Dock structures
    { key: 'ruin-pillar', x: 33, y: 8, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 33, y: 14, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 33, y: 20, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 33, y: 26, collide: true, collideW: 20, collideH: 20 },
    // Palms near coast
    { key: 'palm', x: 30, y: 5, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm-alt', x: 30, y: 30, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm', x: 5, y: 8, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm-alt', x: 5, y: 26, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm-small', x: 28, y: 12, collide: true, collideW: 20, collideH: 16 },
    // Rocks
    { key: 'rock1', x: 3, y: 5, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 3, y: 30, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock1', x: 15, y: 30, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 25, y: 5, collide: true, collideW: 30, collideH: 20 },
    // Green trees in town
    { key: 'green-tree', x: 10, y: 14, collide: true, collideW: 40, collideH: 20 },
    { key: 'green-tree-small', x: 25, y: 14, collide: true, collideW: 30, collideH: 20 },
  ],

  npcs: [
    { id: 'captain-rashid', key: 'npc-captain-rashid', name: 'Captain Rashid', nameArabic: 'القُبطان رَشيد', x: 33, y: 17 },
    { id: 'fishmonger-hana', key: 'npc-fishmonger-hana', name: 'Fishmonger Hana', nameArabic: 'بائِعَة السَّمَك هَناء', x: 18, y: 17 },
    { id: 'blacksmith-daud', key: 'npc-blacksmith-daud', name: 'Blacksmith Daud', nameArabic: 'الحَدّاد داوُد', x: 12, y: 24 },
  ],

  interactables: [
    { id: 'sign-port', type: 'sign', x: 5, y: 17, textArabic: 'المِيناء', textEnglish: 'The Coastal Port' },
    { id: 'sign-dock', type: 'sign', x: 32, y: 6, textArabic: 'رَصيف السُّفُن', textEnglish: 'Ship Dock' },
    { id: 'sign-smithy', type: 'sign', x: 11, y: 23, textArabic: 'الحِدادَة', textEnglish: 'The Smithy' },
    { id: 'bookshelf-directions', type: 'bookshelf', x: 16, y: 11, category: 'directions' },
    { id: 'bookshelf-port-trade', type: 'bookshelf', x: 23, y: 11, category: 'trade' },
    { id: 'bookshelf-port-food', type: 'bookshelf', x: 18, y: 23, category: 'food' },
    { id: 'chest-port-dock', type: 'chest', x: 34, y: 28, minDirhams: 40, maxDirhams: 130 },
    { id: 'chest-port-alley', type: 'chest', x: 8, y: 8, minDirhams: 35, maxDirhams: 110 },
  ],

  exits: [
    {
      id: 'port-to-mountain',
      edge: 'west',
      tileRange: [15, 19],
      targetZone: 'mountain_village',
      targetEntry: 'from_port',
      label: 'Mountain Village',
      labelArabic: 'قَرية الجَبَل',
    },
    {
      id: 'port-to-palace',
      edge: 'north',
      tileRange: [19, 25],
      targetZone: 'royal_palace',
      targetEntry: 'from_port',
      label: 'Royal Palace',
      labelArabic: 'القَصر المَلَكي',
    },
  ],

  unlock: { quest: 'mountain_wisdom', minLevel: 17, minWords: 1200 },

  entries: {
    from_mountain: { x: 3, y: 17 },
    from_palace: { x: 22, y: 3 },
  },
};

// ============================================================
// ZONE 8: Royal Palace (50×40)
// ============================================================

function buildPalaceMap() {
  const W = 50, H = 40;
  const m = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      let tile = GRASS;
      // Palace courtyard — stone (sand tile)
      if (x >= 15 && x <= 35 && y >= 10 && y <= 30) tile = SAND;
      // Inner garden
      if (x >= 20 && x <= 30 && y >= 15 && y <= 25) tile = GRASS;
      // Central fountain
      if (x >= 23 && x <= 27 && y >= 18 && y <= 22) tile = WATER;
      // Grand entrance path
      if (x >= 23 && x <= 27 && y >= 30 && y <= 39) tile = SAND;
      // Side gardens
      if (x >= 5 && x <= 12 && y >= 12 && y <= 28) tile = GRASS;
      if (x >= 38 && x <= 45 && y >= 12 && y <= 28) tile = GRASS;
      // Outer walls (ice grass for marble look)
      if (y <= 3 || y >= 37 || x <= 2 || x >= 47) tile = ICE_GRASS;
      row.push(tile);
    }
    m.push(row);
  }
  return m;
}

const royal_palace = {
  id: 'royal_palace',
  name: 'Royal Palace',
  nameArabic: 'القَصر المَلَكي',
  mapWidth: 50,
  mapHeight: 40,
  buildMap: buildPalaceMap,
  spawnPoint: { x: 25, y: 37 },
  vocabCategories: ['adjectives', 'colors', 'phrases'],

  objects: [
    // Palace structures
    { key: 'house-large', x: 20, y: 8, collide: true, collideW: 240, collideH: 100 },
    { key: 'house-large-alt', x: 30, y: 8, collide: true, collideW: 240, collideH: 100 },
    { key: 'house-large', x: 15, y: 15, collide: true, collideW: 240, collideH: 100 },
    { key: 'house-large-alt', x: 35, y: 15, collide: true, collideW: 240, collideH: 100 },
    // Palace walls / pillars
    { key: 'ruin-pillar', x: 15, y: 10, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 35, y: 10, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 15, y: 20, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 35, y: 20, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 15, y: 30, collide: true, collideW: 20, collideH: 20 },
    { key: 'ruin-pillar', x: 35, y: 30, collide: true, collideW: 20, collideH: 20 },
    // Grand gate
    { key: 'ruin-gate', x: 25, y: 30, collide: true, collideW: 120, collideH: 40 },
    { key: 'gate-pillar', x: 22, y: 30, collide: true, collideW: 20, collideH: 20 },
    { key: 'gate-pillar', x: 28, y: 30, collide: true, collideW: 20, collideH: 20 },
    // Garden trees
    { key: 'green-tree', x: 7, y: 15, collide: true, collideW: 40, collideH: 20 },
    { key: 'green-tree', x: 7, y: 25, collide: true, collideW: 40, collideH: 20 },
    { key: 'green-tree', x: 42, y: 15, collide: true, collideW: 40, collideH: 20 },
    { key: 'green-tree', x: 42, y: 25, collide: true, collideW: 40, collideH: 20 },
    { key: 'green-tree-bushy', x: 22, y: 16, collide: true, collideW: 40, collideH: 20 },
    { key: 'green-tree-bushy', x: 28, y: 16, collide: true, collideW: 40, collideH: 20 },
    { key: 'green-tree-bushy', x: 22, y: 24, collide: true, collideW: 40, collideH: 20 },
    { key: 'green-tree-bushy', x: 28, y: 24, collide: true, collideW: 40, collideH: 20 },
    // Palms in outer gardens
    { key: 'palm', x: 9, y: 13, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm-alt', x: 41, y: 13, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm', x: 9, y: 27, collide: true, collideW: 30, collideH: 20 },
    { key: 'palm-alt', x: 41, y: 27, collide: true, collideW: 30, collideH: 20 },
    // Rocks at edges
    { key: 'rock1', x: 5, y: 5, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 44, y: 5, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock1', x: 5, y: 35, collide: true, collideW: 30, collideH: 20 },
    { key: 'rock2', x: 44, y: 35, collide: true, collideW: 30, collideH: 20 },
  ],

  npcs: [
    { id: 'vizier-abbas', key: 'npc-vizier-abbas', name: 'Vizier Abbas', nameArabic: 'الوَزير عَبّاس', x: 25, y: 13 },
    { id: 'princess-aisha', key: 'npc-princess-aisha', name: 'Princess Aisha', nameArabic: 'الأَميرَة عائِشَة', x: 20, y: 20 },
    { id: 'poet-rumi', key: 'npc-poet-rumi', name: 'Poet Rumi', nameArabic: 'الشّاعِر الرّومي', x: 30, y: 20 },
    { id: 'imam-muhammad', key: 'npc-imam-muhammad', name: 'Imam Muhammad', nameArabic: 'الإمام مُحَمَّد', x: 8, y: 20 },
  ],

  interactables: [
    { id: 'sign-palace', type: 'sign', x: 25, y: 36, textArabic: 'القَصر المَلَكي', textEnglish: 'The Royal Palace' },
    { id: 'sign-throne', type: 'sign', x: 25, y: 11, textArabic: 'قاعَة العَرش', textEnglish: 'Throne Room' },
    { id: 'sign-garden', type: 'sign', x: 20, y: 16, textArabic: 'الحَديقَة', textEnglish: 'The Garden' },
    { id: 'bookshelf-palace-adj', type: 'bookshelf', x: 17, y: 10, category: 'adjectives' },
    { id: 'bookshelf-palace-colors', type: 'bookshelf', x: 33, y: 10, category: 'colors' },
    { id: 'bookshelf-palace-phrases', type: 'bookshelf', x: 25, y: 17, category: 'phrases' },
    { id: 'chest-palace-throne', type: 'chest', x: 25, y: 9, minDirhams: 60, maxDirhams: 200 },
    { id: 'chest-palace-garden', type: 'chest', x: 43, y: 20, minDirhams: 50, maxDirhams: 180 },
  ],

  exits: [
    {
      id: 'palace-to-port',
      edge: 'south',
      tileRange: [22, 28],
      targetZone: 'coastal_port',
      targetEntry: 'from_palace',
      label: 'Coastal Port',
      labelArabic: 'المِيناء',
    },
  ],

  unlock: { quest: 'port_of_knowledge', minLevel: 20, minWords: 1600 },

  entries: {
    from_port: { x: 25, y: 37 },
  },
};

// ============================================================
// ZONE REGISTRY
// ============================================================

export const ZONES = {
  oasis_village,
  ancient_library,
  desert_marketplace,
  farmland,
  bedouin_camp,
  mountain_village,
  coastal_port,
  royal_palace,
};

// Ordered list for world map rendering
export const ZONE_ORDER = [
  'oasis_village',
  'ancient_library',
  'desert_marketplace',
  'farmland',
  'bedouin_camp',
  'mountain_village',
  'coastal_port',
  'royal_palace',
];

// Tile type constants for external use
export { SAND, GRASS, WATER, ICE_GRASS, TILE };
