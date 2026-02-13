import { Component } from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';

const containerStyle = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#1A1A2E',
  color: '#D4A843',
  fontFamily: "'Press Start 2P', cursive",
  padding: '20px',
  textAlign: 'center',
};

const titleStyle = {
  fontSize: '24px',
  marginBottom: '24px',
  color: '#E85D75',
};

const messageStyle = {
  fontSize: '12px',
  marginBottom: '32px',
  maxWidth: '600px',
  lineHeight: '1.8',
  color: '#D4A843',
};

const errorDetailsStyle = {
  fontSize: '10px',
  marginBottom: '32px',
  maxWidth: '700px',
  padding: '16px',
  background: '#0F0F1E',
  border: '2px solid #E85D75',
  color: '#E85D75',
  fontFamily: 'monospace',
  textAlign: 'left',
  overflowX: 'auto',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

const buttonStyle = {
  fontFamily: "'Press Start 2P', cursive",
  fontSize: '11px',
  padding: '14px 28px',
  background: '#D4A843',
  color: '#1A1A2E',
  border: 'none',
  cursor: 'pointer',
  marginBottom: '12px',
};

const buttonOutlineStyle = {
  fontFamily: "'Press Start 2P', cursive",
  fontSize: '11px',
  padding: '14px 28px',
  background: 'transparent',
  color: '#D4A843',
  border: '2px solid #D4A843',
  cursor: 'pointer',
};

const pixelHeartStyle = {
  fontSize: '32px',
  marginBottom: '24px',
  filter: 'grayscale(1)',
};

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
    <div style={containerStyle}>
      <div style={pixelHeartStyle}>💔</div>

      <div style={titleStyle}>Oops! Something broke</div>

      <div style={messageStyle}>
        An error occurred while loading this page.
        <br />
        Don&apos;t worry, your progress is saved!
      </div>

      {error && (
        <div style={errorDetailsStyle}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button onClick={handleReturnToMenu} style={buttonStyle}>
          Return to Main Menu
        </button>

        <button onClick={handleReload} style={buttonOutlineStyle}>
          Reload Page
        </button>
      </div>
    </div>
  );
}

// Class-based error boundary for non-route errors
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
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={containerStyle}>
          <div style={pixelHeartStyle}>💔</div>

          <div style={titleStyle}>Oops! Something broke</div>

          <div style={messageStyle}>
            An error occurred in the application.
            <br />
            Don&apos;t worry, your progress is saved!
          </div>

          {this.state.error && (
            <div style={errorDetailsStyle}>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => window.location.href = '/'}
              style={buttonStyle}
            >
              Return to Main Menu
            </button>

            <button
              onClick={() => window.location.reload()}
              style={buttonOutlineStyle}
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
