import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { RouterProvider } from 'react-router-dom';
import { store, persistor } from './store/store.js';
import { router } from './routes.jsx';
import { initializeQuests, checkPrerequisites } from './store/slices/questSlice.js';
import { updateStreak } from './store/slices/playerSlice.js';
import { checkDailyReset } from './store/slices/dailyGoalsSlice.js';
import questsData from './data/quests.json';
import ErrorBoundaryClass from './components/ErrorBoundary/RouteErrorBoundary.jsx';
import LoadingScreen from './components/UI/LoadingScreen.jsx';

// Initialize app state on boot
store.dispatch(initializeQuests(questsData));
store.dispatch(checkPrerequisites(questsData));
store.dispatch(updateStreak()); // Update streak and check for rewards
store.dispatch(checkDailyReset()); // Reset daily goals if needed

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={<LoadingScreen />} persistor={persistor}>
      <ErrorBoundaryClass>
        <RouterProvider router={router} />
      </ErrorBoundaryClass>
    </PersistGate>
  </Provider>
);
