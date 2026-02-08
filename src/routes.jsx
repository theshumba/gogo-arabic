import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RouteErrorBoundary } from './components/ErrorBoundary/RouteErrorBoundary.jsx';
import NotFoundPage from './components/ErrorBoundary/NotFoundPage.jsx';
import LoadingScreen from './components/UI/LoadingScreen.jsx';
import { ProtectedRoute, CharacterCreationGuard } from './components/Router/ProtectedRoute.jsx';
import GameLayout from './components/Router/GameLayout.jsx';
import { useGameNavigation } from './hooks/useGameNavigation.js';

// Eager-load MainMenu (keep in main bundle for fast initial load)
import MainMenu from './components/Menu/MainMenu.jsx';

// Lazy-load all other screens for code splitting
const CharacterCreation = lazy(() => import('./components/Character/CharacterCreation.jsx'));
const AlphabetModule = lazy(() => import('./components/Alphabet/AlphabetModule.jsx'));
const ReviewSession = lazy(() => import('./components/Review/ReviewSession.jsx'));
const SettingsMenu = lazy(() => import('./components/Menu/SettingsMenu.jsx'));
const WorldMap = lazy(() => import('./components/World/WorldMap.jsx'));

// Stats component (placeholder for now)
function Stats() {
  const { goToMenu } = useGameNavigation();

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1A1A2E',
        color: '#D4A843',
        fontFamily: "'Press Start 2P', cursive",
      }}
    >
      <div style={{ fontSize: '18px', marginBottom: '16px' }}>Stats</div>
      <div style={{ fontSize: '22px', fontFamily: "'Amiri', serif", marginBottom: '32px' }}>
        {'\u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A'}
      </div>
      <button
        onClick={goToMenu}
        style={{
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '11px',
          padding: '12px 24px',
          background: '#D4A843',
          color: '#1A1A2E',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Back
      </button>
    </div>
  );
}

// Route handlers that use the custom hook
function MainMenuRoute() {
  const { goToGame, goToAlphabet, goToReview, goToSettings, goToCharacterCreation } = useGameNavigation();

  return (
    <MainMenu
      onStartGame={goToGame}
      onAlphabet={goToAlphabet}
      onReview={goToReview}
      onSettings={goToSettings}
      onCharacterCreation={goToCharacterCreation}
    />
  );
}

function CharacterCreationRoute() {
  const { goToGame } = useGameNavigation();

  return (
    <CharacterCreationGuard>
      <Suspense fallback={<LoadingScreen />}>
        <CharacterCreation onDone={goToGame} />
      </Suspense>
    </CharacterCreationGuard>
  );
}

function AlphabetRoute() {
  const { goToMenu } = useGameNavigation();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <AlphabetModule onBack={goToMenu} />
    </Suspense>
  );
}

function ReviewRoute() {
  const { goToMenu } = useGameNavigation();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <ReviewSession onBack={goToMenu} />
    </Suspense>
  );
}

function SettingsRoute() {
  const { goToMenu } = useGameNavigation();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <SettingsMenu onBack={goToMenu} />
    </Suspense>
  );
}

function WorldMapRoute() {
  const { goBack } = useGameNavigation();

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 15,
        background: 'rgba(0, 0, 0, 0.3)',
      }}
    >
      <Suspense fallback={<LoadingScreen />}>
        <WorldMap onBack={goBack} />
      </Suspense>
    </div>
  );
}

/**
 * Route configuration using React Router v6
 * Code splitting applied to all routes except MainMenu
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainMenuRoute />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/character/create',
    element: <CharacterCreationRoute />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/alphabet',
    element: <AlphabetRoute />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/review',
    element: <ReviewRoute />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/settings',
    element: <SettingsRoute />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/stats',
    element: <Stats />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/game',
    element: (
      <ProtectedRoute>
        <GameLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: 'map',
        element: <WorldMapRoute />,
      },
    ],
  },
  {
    path: '/404',
    element: <NotFoundPage />,
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
]);
