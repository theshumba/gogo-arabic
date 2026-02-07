import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store.js';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={<LoadingScreen />} persistor={persistor}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </PersistGate>
  </Provider>
);

function LoadingScreen() {
  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#1A1A2E', color: '#D4A843',
      fontFamily: "'Press Start 2P', cursive",
    }}>
      <div style={{ fontSize: '14px', marginBottom: '12px' }}>Loading...</div>
      <div style={{ fontSize: '18px', fontFamily: "'Amiri', serif" }}>{'\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644'}</div>
    </div>
  );
}
