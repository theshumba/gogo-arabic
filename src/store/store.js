import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import playerReducer from './slices/playerSlice.js';
import vocabularyReducer from './slices/vocabularySlice.js';
import questReducer from './slices/questSlice.js';
import npcReducer from './slices/npcSlice.js';
import alphabetReducer from './slices/alphabetSlice.js';
import settingsReducer from './slices/settingsSlice.js';
import uiReducer from './slices/uiSlice.js';
import syncReducer from './slices/syncSlice.js';
import achievementReducer from './slices/achievementSlice.js';
import dailyGoalsReducer from './slices/dailyGoalsSlice.js';
import grammarReducer from './slices/grammarSlice.js';
import battleReducer from './slices/battleSlice.js';
import narrativeReducer from './slices/narrativeSlice.js';
import magicReducer from './slices/magicSlice.js';
import inventoryReducer from './slices/inventorySlice.js';
import economyReducer from './slices/economySlice.js';
import companionReducer from './slices/companionSlice.js';
import craftingReducer from './slices/craftingSlice.js';
import arenaReducer from './slices/arenaSlice.js';
import timeReducer from './slices/timeSlice.js';
import weatherReducer from './slices/weatherSlice.js';
import worldStateReducer from './slices/worldStateSlice.js';
import homeReducer from './slices/homeSlice.js';
import statsReducer from './slices/statsSlice.js';
import skillTreeReducer from './slices/skillTreeSlice.js';
import factionReducer from './slices/factionSlice.js';
import gossipReducer from './slices/gossipSlice.js';
import poetryReducer from './slices/poetrySlice.js';
import journalReducer from './slices/journalSlice.js';
import codexReducer from './slices/codexSlice.js';
import endgameReducer from './slices/endgameSlice.js';
import placementReducer from './slices/placementSlice.js';
import cefrProgressReducer from './slices/cefrProgressSlice.js';
import analyticsReducer from './slices/analyticsSlice.js';
import { achievementMiddleware } from './middleware/achievementMiddleware.js';
import { dailyGoalsMiddleware } from './middleware/dailyGoalsMiddleware.js';
import { storageQuotaMiddleware } from './middleware/storageQuotaMiddleware.js';
import { rootFsrsSyncMiddleware } from './middleware/rootFsrsSyncMiddleware.js';
import { battleRewardsMiddleware } from './middleware/battleRewardsMiddleware.js';
import { craftingVocabMiddleware } from './middleware/craftingVocabMiddleware.js';
import { statusEffectVocabMiddleware } from './middleware/statusEffectVocabMiddleware.js';
import { friendshipMiddleware } from './middleware/friendshipMiddleware.js';
import { utilityBonusMiddleware } from './middleware/utilityBonusMiddleware.js';
import { worldStateMiddleware } from './middleware/worldStateMiddleware.js';
import { factionMiddleware } from './middleware/factionMiddleware.js';
import { gossipMiddleware } from './middleware/gossipMiddleware.js';
import { poetryRewardsMiddleware } from './middleware/poetryRewardsMiddleware.js';
import { learningProgressMiddleware } from './middleware/learningProgressMiddleware.js';
import { offlineFsrsMiddleware } from './middleware/offlineFsrsMiddleware.js';
import { grammarFsrsMiddleware } from './middleware/grammarFsrsMiddleware.js';
import indexedDBStorage from '../services/storage/indexedDBAdapter.js';
import { migrate, CURRENT_VERSION } from '../services/storage/migrations.js';

/**
 * HYBRID STORAGE ARCHITECTURE
 *
 * Heavy data (vocabulary, battle, magic, inventory, crafting) persists to IndexedDB via nested persistReducer.
 * Lightweight data (player, settings, quests, economy, etc.) persists to localStorage via root persistReducer.
 *
 * Why nested persistReducer instead of split namespaces?
 * - Preserves existing selector paths (state.vocabulary.*, state.battle.*, state.magic.*, state.inventory.*, state.crafting.*)
 * - No breaking changes for 50K LOC of existing code
 * - Transparent to all consumers of Redux state
 *
 * Migration:
 * - Version 0 (implicit): All state in localStorage 'persist:gogo-arabic'
 * - Version 1: vocabulary + battle moved to IndexedDB, others remain in localStorage
 * - Version 2 (Phase 28): magic added to IndexedDB
 * - Version 3 (Phase 29): inventory added to IndexedDB, economy added to localStorage
 * - Version 4 (Phase 30): companions added to IndexedDB
 * - Version 5 (Phase 31): crafting added to IndexedDB
 * - Version 8 (Phase 50): worldState moved to IndexedDB
 * - Version 9 (Phase 53): faction moved to IndexedDB
 * - Version 10 (Phase 55): poetry added to IndexedDB
 * - Version 11 (Phase 56): placementSlice + cefrProgressSlice added to localStorage; grammar slug migration
 *
 * Storage backends:
 * - localStorage (root): player, quests, alphabet, settings, npc, achievements, dailyGoals, grammar, narrative, economy
 * - IndexedDB (nested): vocabulary, battle, magic, inventory, companions, crafting, worldState, faction, poetry
 * - Not persisted (transient): ui, sync, gossip
 */

// Nested persist configs for heavy slices (IndexedDB)
const vocabularyPersistConfig = {
  key: 'gogo-arabic-vocabulary',
  storage: indexedDBStorage,
  version: CURRENT_VERSION,
  migrate,
};

const battlePersistConfig = {
  key: 'gogo-arabic-battle',
  storage: indexedDBStorage,
  version: CURRENT_VERSION,
  migrate,
};

const magicPersistConfig = {
  key: 'gogo-arabic-magic',
  storage: indexedDBStorage,
  version: CURRENT_VERSION,
  migrate,
};

const inventoryPersistConfig = {
  key: 'gogo-arabic-inventory',
  storage: indexedDBStorage,
  version: CURRENT_VERSION,
  migrate,
};

const companionPersistConfig = {
  key: 'gogo-arabic-companions',
  storage: indexedDBStorage,
  version: CURRENT_VERSION,
  migrate,
};

const craftingPersistConfig = {
  key: 'gogo-arabic-crafting',
  storage: indexedDBStorage,
  version: CURRENT_VERSION,
  migrate,
};

const worldStatePersistConfig = {
  key: 'gogo-arabic-world-state',
  storage: indexedDBStorage,
  version: CURRENT_VERSION,
  migrate,
};

const factionPersistConfig = {
  key: 'gogo-arabic-faction',
  storage: indexedDBStorage,
  version: CURRENT_VERSION,
  migrate,
};

const poetryPersistConfig = {
  key: 'gogo-arabic-poetry',
  storage: indexedDBStorage,
  version: CURRENT_VERSION,
  migrate,
  blacklist: ['activeBattle'], // activeBattle is session-only (like gossip tokens)
};

// Wrap heavy reducers with nested persistReducer
const persistedVocabularyReducer = persistReducer(vocabularyPersistConfig, vocabularyReducer);
const persistedBattleReducer = persistReducer(battlePersistConfig, battleReducer);
const persistedMagicReducer = persistReducer(magicPersistConfig, magicReducer);
const persistedInventoryReducer = persistReducer(inventoryPersistConfig, inventoryReducer);
const persistedCompanionReducer = persistReducer(companionPersistConfig, companionReducer);
const persistedCraftingReducer = persistReducer(craftingPersistConfig, craftingReducer);
const persistedWorldStateReducer = persistReducer(worldStatePersistConfig, worldStateReducer);
const persistedFactionReducer = persistReducer(factionPersistConfig, factionReducer);
const persistedPoetryReducer = persistReducer(poetryPersistConfig, poetryReducer);

// Root persist config (localStorage) — vocabulary, battle, magic, inventory, crafting excluded (they have nested configs)
const persistConfig = {
  key: 'gogo-arabic',
  storage, // localStorage
  whitelist: [
    'player',
    'quests',
    'alphabet',
    'settings',
    'npc',
    'achievements',
    'dailyGoals',
    'grammar',
    'narrative',
    'economy',
    'arena',
    'time',
    'weather',
    'home',
    'stats',
    'skillTree',
    'journal',
    'codex',
    'endgame',
    'placement',
    'cefrProgress',
    'analytics',
  ],
  // NOTE: vocabulary, battle, magic, inventory, companions, crafting REMOVED from whitelist — they use nested persistReducer with IndexedDB
};

const rootReducer = combineReducers({
  player: playerReducer,
  vocabulary: persistedVocabularyReducer, // IndexedDB (nested)
  quests: questReducer,
  npc: npcReducer,
  alphabet: alphabetReducer,
  settings: settingsReducer,
  ui: uiReducer,
  sync: syncReducer,
  achievements: achievementReducer,
  dailyGoals: dailyGoalsReducer,
  grammar: grammarReducer,
  battle: persistedBattleReducer, // IndexedDB (nested)
  narrative: narrativeReducer,
  magic: persistedMagicReducer, // IndexedDB (nested)
  inventory: persistedInventoryReducer, // IndexedDB (nested)
  economy: economyReducer,
  companions: persistedCompanionReducer, // IndexedDB (nested)
  crafting: persistedCraftingReducer, // IndexedDB (nested)
  arena: arenaReducer,
  time: timeReducer,
  weather: weatherReducer,
  worldState: persistedWorldStateReducer, // IndexedDB (nested) — Phase 50
  home: homeReducer,
  stats: statsReducer,
  skillTree: skillTreeReducer,
  faction: persistedFactionReducer, // IndexedDB (nested) — Phase 53
  gossip: gossipReducer,             // NOT persisted — session-ephemeral tokens
  poetry: persistedPoetryReducer,    // IndexedDB (nested) — Phase 55
  journal: journalReducer,
  codex: codexReducer,
  endgame: endgameReducer,
  placement: placementReducer,
  cefrProgress: cefrProgressReducer,
  analytics: analyticsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore all redux-persist actions (root + nested persistReducers generate their own)
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER', 'persist/PURGE', 'persist/FLUSH'],
      },
    }).concat(achievementMiddleware, dailyGoalsMiddleware, storageQuotaMiddleware, rootFsrsSyncMiddleware, battleRewardsMiddleware, craftingVocabMiddleware, statusEffectVocabMiddleware, friendshipMiddleware, utilityBonusMiddleware, worldStateMiddleware, factionMiddleware, gossipMiddleware, poetryRewardsMiddleware, learningProgressMiddleware, offlineFsrsMiddleware, grammarFsrsMiddleware),
});

export const persistor = persistStore(store);
