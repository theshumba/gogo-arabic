import { useNavigate } from 'react-router-dom';

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

const notFoundCodeStyle = {
  fontSize: '64px',
  marginBottom: '24px',
  color: '#E85D75',
  textShadow: '4px 4px 0px #0F0F1E',
};

const titleStyle = {
  fontSize: '18px',
  marginBottom: '16px',
  color: '#D4A843',
};

const arabicTextStyle = {
  fontSize: '22px',
  fontFamily: "'Amiri', serif",
  marginBottom: '32px',
  direction: 'rtl',
};

const messageStyle = {
  fontSize: '12px',
  marginBottom: '40px',
  maxWidth: '500px',
  lineHeight: '1.8',
  color: '#B8941C',
};

const buttonStyle = {
  fontFamily: "'Press Start 2P', cursive",
  fontSize: '11px',
  padding: '14px 28px',
  background: '#D4A843',
  color: '#1A1A2E',
  border: 'none',
  cursor: 'pointer',
  transition: 'transform 0.1s',
};

const camelStyle = {
  fontSize: '48px',
  marginBottom: '24px',
};

export default function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div style={containerStyle}>
      <div style={camelStyle}>🐪</div>

      <div style={notFoundCodeStyle}>404</div>

      <div style={titleStyle}>Page Not Found</div>

      <div style={arabicTextStyle}>الصفحة غير موجودة</div>

      <div style={messageStyle}>
        This page doesn't exist in the desert.
        <br />
        Perhaps it was lost in a sandstorm...
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={handleGoHome}
          style={buttonStyle}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Main Menu
        </button>

        <button
          onClick={handleGoBack}
          style={{
            ...buttonStyle,
            background: 'transparent',
            color: '#D4A843',
            border: '2px solid #D4A843',
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
