import { Component } from 'react';

// PRD color palette
const BG_DARK = '#1A1A2E';
const GOLD_ACCENT = '#D4A843';

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: BG_DARK,
    padding: '32px',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '24px',
    color: GOLD_ACCENT,
    fontFamily: "'Press Start 2P', cursive",
  },
  heading: {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '18px',
    color: '#FFFFFF',
    marginBottom: '8px',
    textAlign: 'center',
    lineHeight: 1.6,
  },
  headingArabic: {
    fontFamily: "'Noto Kufi Arabic', sans-serif",
    fontSize: '22px',
    color: GOLD_ACCENT,
    direction: 'rtl',
    marginBottom: '32px',
    textAlign: 'center',
  },
  details: {
    fontFamily: 'monospace',
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '12px 16px',
    borderRadius: '4px',
    maxWidth: '500px',
    maxHeight: '120px',
    overflow: 'auto',
    marginBottom: '32px',
    wordBreak: 'break-word',
    textAlign: 'left',
    width: '100%',
  },
  buttonGroup: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  btnPrimary: {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '11px',
    padding: '14px 28px',
    border: 'none',
    cursor: 'pointer',
    background: GOLD_ACCENT,
    color: BG_DARK,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    boxShadow: `
      inset -4px -4px 0px 0px rgba(0,0,0,0.2),
      inset 4px 4px 0px 0px rgba(255,255,255,0.2),
      0 4px 0 0 #9e7a2a
    `,
    transition: 'transform 0.05s',
  },
  btnSecondary: {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '11px',
    padding: '14px 28px',
    border: `2px solid ${GOLD_ACCENT}`,
    cursor: 'pointer',
    background: 'transparent',
    color: GOLD_ACCENT,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'transform 0.05s',
  },
};

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
        <div style={styles.container}>
          <div style={styles.icon}>!</div>

          <div style={styles.heading}>Something went wrong</div>
          <div style={styles.headingArabic}>{'\u062D\u062F\u062B \u062E\u0637\u0623 \u0645\u0627'}</div>

          <div style={styles.details}>{errorMessage}</div>

          <div style={styles.buttonGroup}>
            <button
              style={styles.btnPrimary}
              onClick={this.handleTryAgain}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Try Again
            </button>

            <button
              style={styles.btnSecondary}
              onClick={this.handleReturnToMenu}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
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
