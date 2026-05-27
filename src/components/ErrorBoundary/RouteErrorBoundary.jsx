import { Component } from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import posthog from 'posthog-js';
import styles from './RouteErrorBoundary.module.css';

// Hook-based error boundary component
export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error('Route error:', error);

  const handleReturnToMenu = () => {
    navigate('/');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <div className={styles.pixelHeart}>💔</div>

      <div className={styles.title}>Oops! Something broke</div>

      <div className={styles.message}>
        An error occurred while loading this page.
        <br />
        Don&apos;t worry, your progress is saved!
      </div>

      {error && (
        <div className={styles.errorDetails}>
          <strong>Error Details:</strong>
          <br />
          {error.message || error.statusText || String(error)}
          <br />
          {error.stack && (
            <>
              <br />
              <strong>Stack Trace:</strong>
              <br />
              {error.stack}
            </>
          )}
        </div>
      )}

      <div className={styles.buttonColumn}>
        <button onClick={handleReturnToMenu} className={styles.btn}>
          Return to Main Menu
        </button>

        <button onClick={handleReload} className={styles.btnOutline}>
          Reload Page
        </button>
      </div>
    </div>
  );
}

/**
 * Phase 102 / OBS-04 — Minimal React error boundary that forwards caught render
 * errors to `posthog.captureException`. Designed to be wrapped around any subtree
 * (route element, layout, panel) that should stay isolated from app-wide crashes.
 *
 * Why a separate class from the default `ErrorBoundaryClass` below:
 *   - This class accepts a custom `fallback` prop (any ReactNode), so callers can
 *     supply context-appropriate fallbacks (route-level, panel-level, modal-level).
 *   - The default `ErrorBoundaryClass` renders a fixed full-screen branded
 *     fallback — appropriate for the app shell only.
 *
 * Opt-out gating: `posthog.captureException` itself respects the SDK-level
 * `opt_out_capturing_by_default: true` configured by Plan 02 in posthogClient.js.
 * When a user is opted out, the call is a no-op at the SDK layer — no event leaves
 * the browser. We therefore call captureException unconditionally here (the test
 * RouteErrorBoundary.test.jsx asserts this contract directly).
 */
export class RouteErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, _errorInfo) {
    // Telemetry must NEVER crash the error-handling path itself.
    try {
      posthog.captureException(error);
    } catch (telemetryErr) {
      if (import.meta.env.DEV) {
        console.warn('[RouteErrorBoundaryClass] captureException failed', telemetryErr);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

// Class-based error boundary for non-route errors (app-shell-wide fallback)
export default class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
    // OBS-04 — forward to PostHog. SDK-level opt-out (opt_out_capturing_by_default
    // in posthogClient.js) gates the wire-level send for opted-out users.
    try {
      posthog.captureException(error);
    } catch (telemetryErr) {
      if (import.meta.env.DEV) {
        console.warn('[ErrorBoundaryClass] captureException failed', telemetryErr);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <div className={styles.pixelHeart}>💔</div>

          <div className={styles.title}>Oops! Something broke</div>

          <div className={styles.message}>
            An error occurred in the application.
            <br />
            Don&apos;t worry, your progress is saved!
          </div>

          {this.state.error && (
            <div className={styles.errorDetails}>
              <strong>Error Details:</strong>
              <br />
              {this.state.error.message || String(this.state.error)}
              <br />
              {this.state.error.stack && (
                <>
                  <br />
                  <strong>Stack Trace:</strong>
                  <br />
                  {this.state.error.stack}
                </>
              )}
            </div>
          )}

          <div className={styles.buttonColumn}>
            <button
              onClick={() => window.location.href = '/'}
              className={styles.btn}
            >
              Return to Main Menu
            </button>

            <button
              onClick={() => window.location.reload()}
              className={styles.btnOutline}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
