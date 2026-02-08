import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { closeSign } from '../../store/slices/uiSlice.js';
import { EventBus } from '../../utils/eventBus.js';
import { COLORS, FONTS, pixelBtnGold, pixelPanel } from '../../styles/theme.js';

const styles = {
  overlay: {
    position: 'absolute',
    inset: 0,
    background: COLORS.overlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  card: {
    ...pixelPanel,
    background: '#3e2a14',
    border: `6px solid ${COLORS.brown}`,
    padding: '32px 40px',
    textAlign: 'center',
    minWidth: '320px',
    maxWidth: '480px',
    boxShadow: `
      inset -4px -4px 0px 0px rgba(0,0,0,0.2),
      inset 4px 4px 0px 0px rgba(255,255,255,0.1),
      8px 8px 0px 0px rgba(0,0,0,0.4)
    `,
  },
  arabic: {
    fontFamily: FONTS.arabic,
    fontSize: '36px',
    color: COLORS.xpGold,
    direction: 'rtl',
    marginBottom: '16px',
    textShadow: `2px 2px 0px ${COLORS.darkBrown}`,
  },
  english: {
    fontFamily: FONTS.pixel,
    fontSize: '11px',
    color: COLORS.beige,
    letterSpacing: '1px',
    marginBottom: '24px',
  },
  closeBtn: {
    ...pixelBtnGold,
    fontSize: '10px',
    padding: '12px 28px',
  },
};

export default function SignOverlay() {
  const dispatch = useDispatch();
  const signData = useSelector((s) => s.ui.signData);

  const handleClose = () => {
    dispatch(closeSign());
    EventBus.emit('unfreeze-player');
  };

  // Escape key handler
  useEffect(() => {
    if (!signData) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [signData]);

  if (!signData) return null;

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        <div style={styles.arabic}>{signData.arabic}</div>
        <div style={styles.english}>{signData.english}</div>
        <button style={styles.closeBtn} onClick={handleClose}>
          Continue
        </button>
      </div>
    </div>
  );
}
