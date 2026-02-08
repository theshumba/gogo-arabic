import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { clearNotification } from '../../store/slices/uiSlice.js';
import { COLORS, FONTS } from '../../styles/theme.js';

/**
 * Notification type color mapping
 * - xp: gold highlight for XP gains
 * - dirhams: gold for currency gains
 * - quest: green for quest progress/completion
 * - word: blue for new words learned
 * - level-up: special gradient for level-up celebrations
 */
const TYPE_STYLES = {
  xp: {
    background: COLORS.brown,
    border: `3px solid ${COLORS.xpGold}`,
    color: COLORS.xpGold,
    icon: '+XP',
  },
  dirhams: {
    background: COLORS.brown,
    border: `3px solid ${COLORS.xpGold}`,
    color: COLORS.xpGold,
    icon: 'D',
  },
  quest: {
    background: '#0d2b1a',
    border: `3px solid ${COLORS.green}`,
    color: COLORS.green,
    icon: '!',
  },
  word: {
    background: '#0d1b2b',
    border: `3px solid ${COLORS.blue}`,
    color: COLORS.blue,
    icon: 'Aa',
  },
  'level-up': {
    background: `linear-gradient(135deg, ${COLORS.brown} 0%, #3d1a00 50%, ${COLORS.brown} 100%)`,
    border: `3px solid ${COLORS.xpGold}`,
    color: COLORS.xpGold,
    icon: 'LV',
    isLevelUp: true,
  },
};

const DISMISS_DELAY = 3000; // 3 seconds before auto-dismiss

const styles = {
  wrapper: {
    position: 'absolute',
    top: '44px', // just below the HUD bar
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 101,
    pointerEvents: 'none',
    display: 'flex',
    justifyContent: 'center',
  },
  toast: {
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    whiteSpace: 'nowrap',
    imageRendering: 'pixelated',
    boxShadow: `
      inset -2px -2px 0px 0px rgba(0,0,0,0.3),
      inset 2px 2px 0px 0px rgba(255,255,255,0.1),
      0 3px 0 0 rgba(0,0,0,0.4),
      0 4px 12px rgba(0,0,0,0.5)
    `,
  },
  iconBadge: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '3px 6px',
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.2)',
    lineHeight: 1,
    letterSpacing: '0.5px',
  },
  message: {
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    lineHeight: 1.3,
    letterSpacing: '0.3px',
  },
  levelUpGlow: {
    textShadow: `0 0 8px ${COLORS.xpGold}, 0 0 16px ${COLORS.xpGold}`,
    fontSize: '14px',
  },
};

export default function NotificationToast() {
  const dispatch = useDispatch();
  const notification = useSelector((s) => s.ui.notification);
  const timerRef = useRef(null);

  // Handle notification lifecycle
  useEffect(() => {
    // Clear any existing timers when notification changes
    if (timerRef.current) clearTimeout(timerRef.current);

    if (notification) {
      // Auto-dismiss after delay
      timerRef.current = setTimeout(() => {
        dispatch(clearNotification());
      }, DISMISS_DELAY);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [notification, dispatch]);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const toastVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

  const toastVariantsReduced = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const transition = reduceMotion
    ? { duration: 0.2 }
    : { duration: 0.3, ease: 'easeOut' };

  if (!notification) return null;

  const { message, type } = notification;
  const typeStyle = TYPE_STYLES[type] || TYPE_STYLES.xp;

  const toastStyle = {
    ...styles.toast,
    background: typeStyle.isLevelUp ? undefined : typeStyle.background,
    backgroundImage: typeStyle.isLevelUp ? typeStyle.background : undefined,
    border: typeStyle.border,
    color: typeStyle.color,
  };

  return (
    <div style={styles.wrapper}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${type}-${message}`}
          style={toastStyle}
          variants={reduceMotion ? toastVariantsReduced : toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={transition}
        >
          {/* Type icon badge */}
          <span style={{ ...styles.iconBadge, color: typeStyle.color }}>
            {typeStyle.icon}
          </span>

          {/* Message text */}
          <span style={{
            ...styles.message,
            ...(typeStyle.isLevelUp ? styles.levelUpGlow : {}),
          }}>
            {message}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
