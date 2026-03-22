import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { RouterProvider } from 'react-router-dom';
import { store, persistor } from './store/store.js';
import { router } from './routes.jsx';
import { initializeQuests, checkPrerequisites } from './store/slices/questSlice.js';
import { updateStreak } from './store/slices/playerSlice.js';
import { checkDailyReset } from './store/slices/dailyGoalsSlice.js';
import { initializeSkillTree } from './data/initializeSkillTree.js';
import questsData from './data/quests.json';
import ErrorBoundaryClass from './components/ErrorBoundary/RouteErrorBoundary.jsx';
import LoadingScreen from './components/UI/LoadingScreen.jsx';
import AudioUnlockOverlay from './components/UI/AudioUnlockOverlay.jsx';

// Initialize app state on boot
store.dispatch(initializeQuests(questsData));
store.dispatch(checkPrerequisites(questsData));
store.dispatch(updateStreak()); // Update streak and check for rewards
store.dispatch(checkDailyReset()); // Reset daily goals if needed

// Initialize skill trees for existing players after rehydration completes.
// Called once — the function is idempotent and returns early if XP already exists.
let skillTreeInitCalled = false;
persistor.subscribe(() => {
  const { bootstrapped } = persistor.getState();
  if (bootstrapped && !skillTreeInitCalled) {
    skillTreeInitCalled = true;
    initializeSkillTree(store);
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={<LoadingScreen />} persistor={persistor}>
      <ErrorBoundaryClass>
        <AudioUnlockOverlay />
        <RouterProvider router={router} />
      </ErrorBoundaryClass>
    </PersistGate>
  </Provider>
);
