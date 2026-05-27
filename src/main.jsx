import { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { RouterProvider } from 'react-router-dom';
import { PostHogProvider, PostHogErrorBoundary } from '@posthog/react';
import { store, persistor } from './store/store.js';
import { router } from './routes.jsx';
import { initializeQuests, checkPrerequisites } from './store/slices/questSlice.js';
import { updateStreak } from './store/slices/playerSlice.js';
import { checkDailyReset } from './store/slices/dailyGoalsSlice.js';
import { initializeSkillTree } from './data/initializeSkillTree.js';
import { registerSW } from './services/swRegistration.js';
import { initOfflineSync } from './store/middleware/offlineFsrsMiddleware.js';
import { useAccessibilitySync } from './hooks/useAccessibilitySync.js';
import { initPostHog, getPostHog } from './services/posthogClient.js';
import { initTelemetryEventBusRelay } from './store/middleware/telemetryMiddleware.js';
import questsData from './data/quests.json';
import ErrorBoundaryClass from './components/ErrorBoundary/RouteErrorBoundary.jsx';
import LoadingScreen from './components/UI/LoadingScreen.jsx';
import AudioUnlockOverlay from './components/UI/AudioUnlockOverlay.jsx';
import UpdatePrompt from './components/UI/UpdatePrompt.jsx';

// Initialise PostHog BEFORE any store.dispatch — boot-time events must not be lost
// (RESEARCH Pitfall 5). Graceful no-op when VITE_POSTHOG_KEY is empty.
initPostHog();

// Wire the Phaser EventBus -> PostHog relay (Plan 03 fills in the event handlers;
// today this is a no-op so we own the call-site and avoid touching main.jsx again).
initTelemetryEventBusRelay(store);

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

// Register service worker (production only) with update detection
let setUpdateAvailable = null;

/** Syncs accessibility data-attributes inside the Redux Provider. */
function AccessibilityBridge() {
  useAccessibilitySync();
  return null;
}

/**
 * Phase 102 / OBS-04 — outermost render-error fallback used by
 * `PostHogErrorBoundary` when an error escapes `ErrorBoundaryClass` (defence-in-
 * depth). Kept intentionally minimal: the branded full-screen fallback lives in
 * `ErrorBoundaryClass`; this one is the belt-and-braces "should never fire"
 * surface.
 */
function ErrorFallback() {
  return (
    <div role="alert" style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Something went wrong</h1>
      <p>Please reload the page. Your progress is saved.</p>
    </div>
  );
}

function AppRoot() {
  const [updateReady, setUpdateReady] = useState(false);
  setUpdateAvailable = setUpdateReady;

  return (
    <Provider store={store}>
      <PostHogProvider client={getPostHog()}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <AccessibilityBridge />
          {/*
            Triple-layer error capture (OBS-04):
              1. window.onerror / unhandledrejection — wired in posthogClient.js
                 via capture_exceptions config.
              2. ErrorBoundaryClass — branded full-screen fallback for React
                 render errors; forwards to posthog.captureException.
              3. PostHogErrorBoundary — final safety net if an error somehow
                 escapes ErrorBoundaryClass (defence in depth).
          */}
          <PostHogErrorBoundary fallback={<ErrorFallback />}>
            <ErrorBoundaryClass>
              <AudioUnlockOverlay />
              <RouterProvider router={router} />
              {updateReady && (
                <UpdatePrompt onDismiss={() => setUpdateReady(false)} />
              )}
            </ErrorBoundaryClass>
          </PostHogErrorBoundary>
        </PersistGate>
      </PostHogProvider>
    </Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AppRoot />);

// Register SW after render — callback triggers update prompt
registerSW(() => {
  if (setUpdateAvailable) setUpdateAvailable(true);
});

// Initialize offline FSRS sync — replays queued reviews when back online
initOfflineSync(store);
