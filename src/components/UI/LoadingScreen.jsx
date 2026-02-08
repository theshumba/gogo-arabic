import { useEffect, useState } from 'react';

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
};

const bookStyle = {
  width: '80px',
  height: '64px',
  position: 'relative',
  marginBottom: '40px',
};

const bookPageStyle = (delay) => ({
  position: 'absolute',
  width: '40px',
  height: '60px',
  background: '#D4A843',
  border: '3px solid #B8941C',
  transformOrigin: 'left center',
  left: '50%',
  top: '2px',
  animation: `pageFlip 1.2s ${delay}s infinite ease-in-out`,
});

const dotsContainerStyle = {
  display: 'flex',
  gap: '12px',
  marginTop: '24px',
};

const dotStyle = (delay) => ({
  width: '8px',
  height: '8px',
  background: '#D4A843',
  animation: `bounce 1.4s ${delay}s infinite ease-in-out`,
});

const textStyle = {
  fontSize: '14px',
  marginBottom: '8px',
  letterSpacing: '2px',
};

const arabicTextStyle = {
  fontSize: '20px',
  fontFamily: "'Amiri', serif",
  marginTop: '16px',
  direction: 'rtl',
};

const progressBarContainerStyle = {
  width: '200px',
  height: '12px',
  background: '#0F0F1E',
  border: '2px solid #D4A843',
  marginTop: '32px',
  position: 'relative',
  overflow: 'hidden',
};

const progressBarFillStyle = (progress) => ({
  height: '100%',
  background: '#D4A843',
  width: `${progress}%`,
  transition: 'width 0.3s ease-in-out',
});

export default function LoadingScreen() {
  const [dots, setDots] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev % 3) + 1);
    }, 500);

    // Simulate progress (for visual effect only)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Stop at 90%, actual loading will complete it
        return prev + Math.random() * 15;
      });
    }, 300);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes pageFlip {
            0%, 100% {
              transform: rotateY(0deg);
            }
            50% {
              transform: rotateY(-180deg);
            }
          }

          @keyframes bounce {
            0%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-16px);
            }
          }
        `}
      </style>

      {/* Animated Book */}
      <div style={bookStyle}>
        <div
          style={{
            position: 'absolute',
            width: '40px',
            height: '60px',
            background: '#A67C2C',
            border: '3px solid #8B6520',
            left: '0',
            top: '2px',
          }}
        />
        <div style={bookPageStyle('0s')} />
        <div style={bookPageStyle('0.4s')} />
        <div style={bookPageStyle('0.8s')} />
      </div>

      {/* Loading Text */}
      <div style={textStyle}>
        Loading{'.'.repeat(dots)}
      </div>

      {/* Arabic Text - "Loading" in Arabic (جارٍ التحميل) */}
      <div style={arabicTextStyle}>جارٍ التحميل</div>

      {/* Bouncing Dots */}
      <div style={dotsContainerStyle}>
        <div style={dotStyle('0s')} />
        <div style={dotStyle('0.2s')} />
        <div style={dotStyle('0.4s')} />
      </div>

      {/* Progress Bar */}
      <div style={progressBarContainerStyle}>
        <div style={progressBarFillStyle(progress)} />
      </div>
    </div>
  );
}
