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
import { achievementMiddleware } from './middleware/achievementMiddleware.js';
import { dailyGoalsMiddleware } from './middleware/dailyGoalsMiddleware.js';

// Persisted slices: player, vocabulary, quests, alphabet, settings, npc, achievements, dailyGoals, grammar, battle
// Non-persisted (transient UI state): ui, sync
const persistConfig = {
  key: 'gogo-arabic',
  storage,
  whitelist: ['player', 'vocabulary', 'quests', 'alphabet', 'settings', 'npc', 'achievements', 'dailyGoals', 'grammar', 'battle'],
};

const rootReducer = combineReducers({
  player: playerReducer,
  vocabulary: vocabularyReducer,
  quests: questReducer,
  npc: npcReducer,
  alphabet: alphabetReducer,
  settings: settingsReducer,
  ui: uiReducer,
  sync: syncReducer,
  achievements: achievementReducer,
  dailyGoals: dailyGoalsReducer,
  grammar: grammarReducer,
  battle: battleReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(achievementMiddleware, dailyGoalsMiddleware),
});

export const persistor = persistStore(store);
