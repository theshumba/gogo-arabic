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

// Persisted slices: player, vocabulary, quests, alphabet, settings, npc
// Non-persisted (transient UI state): ui, sync
const persistConfig = {
  key: 'gogo-arabic',
  storage,
  whitelist: ['player', 'vocabulary', 'quests', 'alphabet', 'settings', 'npc'],
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
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
