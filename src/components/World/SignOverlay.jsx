import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { closeSign } from '../../store/slices/uiSlice.js';
import { EventBus } from '../../utils/eventBus.js';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import styles from './SignOverlay.module.css';

export default function SignOverlay() {
  const dispatch = useDispatch();
  const signData = useSelector((s) => s.ui.signData);

  const handleClose = () => {
    dispatch(closeSign());
    EventBus.emit('unfreeze-player');
  };

  const focusTrapRef = useFocusTrap(!!signData, null);

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
    <div ref={focusTrapRef} className={styles.overlay} onClick={handleClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.arabic}>{signData.arabic}</div>
        <div className={styles.english}>{signData.english}</div>
        <button className={styles.closeBtn} onClick={handleClose}>
          Continue
        </button>
      </div>
    </div>
  );
}
