import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';

// Import all slice reducers
import playerReducer from '../store/slices/playerSlice.js';
import vocabularyReducer from '../store/slices/vocabularySlice.js';
import questReducer from '../store/slices/questSlice.js';
import npcReducer from '../store/slices/npcSlice.js';
import alphabetReducer from '../store/slices/alphabetSlice.js';
import settingsReducer from '../store/slices/settingsSlice.js';
import uiReducer from '../store/slices/uiSlice.js';
import syncReducer from '../store/slices/syncSlice.js';
import achievementReducer from '../store/slices/achievementSlice.js';
import dailyGoalsReducer from '../store/slices/dailyGoalsSlice.js';
import battleReducer from '../store/slices/battleSlice.js';
import grammarReducer from '../store/slices/grammarSlice.js';
import narrativeReducer from '../store/slices/narrativeSlice.js';
import magicReducer from '../store/slices/magicSlice.js';
import inventoryReducer from '../store/slices/inventorySlice.js';
import economyReducer from '../store/slices/economySlice.js';

/**
 * Creates a test store with optional preloaded state.
 * Does NOT include redux-persist or achievement middleware for simplicity in tests.
 * @param {object} preloadedState - Initial state to merge with defaults
 * @returns {object} Configured Redux store
 */
export function createTestStore(preloadedState = {}) {
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
    battle: battleReducer,
    grammar: grammarReducer,
    narrative: narrativeReducer,
    magic: magicReducer,
    inventory: inventoryReducer,
    economy: economyReducer,
  });

  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

/**
 * Custom render function that wraps components with Redux Provider and MemoryRouter.
 * @param {ReactElement} ui - Component to render
 * @param {object} options - Render options
 * @param {object} options.preloadedState - Initial Redux state
 * @param {object} options.store - Custom store (auto-created if not provided)
 * @param {string} options.route - Initial route for MemoryRouter (default '/')
 * @param {object} options.renderOptions - Additional options passed to RTL render
 * @returns {object} RTL render result + store
 */
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    route = '/',
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          {children}
        </MemoryRouter>
      </Provider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Re-export everything from RTL for convenience
export * from '@testing-library/react';
export { renderWithProviders as render };
