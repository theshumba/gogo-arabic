import { Component } from 'react';
import posthog from 'posthog-js';
import cssStyles from './ErrorBoundary.module.css';

/**
 * ErrorBoundary -- catches render errors in child components and
 * shows a user-friendly fallback UI with retry / return-to-menu options.
 *
 * Must be a class component because React error boundaries require
 * getDerivedStateFromError and componentDidCatch lifecycle methods.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Log full details to console for debugging
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo?.componentStack);

    // OBS-04 — forward to PostHog. SDK-level opt-out gate
    // (opt_out_capturing_by_default in posthogClient.js) keeps opted-out users
    // off the wire; telemetry must never crash the error path itself.
    try {
      posthog.captureException(error, {
        extra: { componentStack: errorInfo?.componentStack, source: 'ErrorBoundary' },
      });
    } catch (telemetryErr) {
      if (import.meta.env.DEV) {
        console.warn('[ErrorBoundary] captureException failed', telemetryErr);
      }
    }
  }

  handleTryAgain = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReturnToMenu = () => {
    // Navigate to root using window.location since class components
    // cannot use React Router hooks
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Unknown error';

      return (
        <div className={cssStyles.container}>
          <div className={cssStyles.icon}>!</div>

          <div className={cssStyles.heading}>Something went wrong</div>
          <div className={cssStyles.headingArabic}>{'\u062D\u062F\u062B \u062E\u0637\u0623 \u0645\u0627'}</div>

          <div className={cssStyles.details}>{errorMessage}</div>

          <div className={cssStyles.buttonGroup}>
            <button
              className={cssStyles.btnPrimary}
              onClick={this.handleTryAgain}
            >
              Try Again
            </button>

            <button
              className={cssStyles.btnSecondary}
              onClick={this.handleReturnToMenu}
            >
              Return to Menu
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
