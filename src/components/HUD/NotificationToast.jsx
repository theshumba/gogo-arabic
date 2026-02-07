import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
const ANIM_DURATION = 300; // slide/fade animation duration in ms

const styles = {
  wrapper: {
    position: 'absolute',
    top: '38px', // just below the HUD bar
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 101,
    pointerEvents: 'none',
    display: 'flex',
    justifyContent: 'center',
  },
  toast: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    padding: '6px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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
    fontSize: '7px',
    fontWeight: 'bold',
    padding: '2px 5px',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.15)',
    lineHeight: 1,
    letterSpacing: '0.5px',
  },
  message: {
    fontFamily: FONTS.pixel,
    fontSize: '8px',
    lineHeight: 1.3,
    letterSpacing: '0.3px',
  },
  levelUpGlow: {
    textShadow: `0 0 8px ${COLORS.xpGold}, 0 0 16px ${COLORS.xpGold}`,
    fontSize: '10px',
  },
};

export default function NotificationToast() {
  const dispatch = useDispatch();
  const notification = useSelector((s) => s.ui.notification);

  // Phase: 'entering' | 'visible' | 'exiting' | 'hidden'
  const [phase, setPhase] = useState('hidden');
  const [displayData, setDisplayData] = useState(null);
  const [rendered, setRendered] = useState(false);
  const timerRef = useRef(null);
  const animTimerRef = useRef(null);
  const rafRef = useRef(null);

  // Handle notification lifecycle
  useEffect(() => {
    // Clear any existing timers when notification changes
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (notification) {
      // New notification arrived: store it and begin enter animation
      setDisplayData(notification);
      setRendered(false);
      setPhase('entering');

      // After enter animation completes, mark as visible
      animTimerRef.current = setTimeout(() => {
        setPhase('visible');
      }, ANIM_DURATION);

      // Auto-dismiss after delay
      timerRef.current = setTimeout(() => {
        setPhase('exiting');

        // After exit animation, clear from Redux and hide
        animTimerRef.current = setTimeout(() => {
          setPhase('hidden');
          setDisplayData(null);
          dispatch(clearNotification());
        }, ANIM_DURATION);
      }, DISMISS_DELAY);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [notification, dispatch]);

  // Trigger the slide-down animation via double-rAF to ensure browser paints
  // the initial state before transitioning to the visible state
  useEffect(() => {
    if (phase === 'entering') {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          setRendered(true);
        });
      });
    }
  }, [phase]);

  // Nothing to render
  if (phase === 'hidden' || !displayData) return null;

  const { message, type } = displayData;
  const typeStyle = TYPE_STYLES[type] || TYPE_STYLES.xp;

  // Compute animation transform + opacity based on phase
  let animTransform = 'translateY(0)';
  let animOpacity = 1;

  if (phase === 'entering' && !rendered) {
    // Initial entering state: offscreen above, invisible
    animTransform = 'translateY(-20px)';
    animOpacity = 0;
  } else if (phase === 'entering' && rendered) {
    // Triggered state: slide into place
    animTransform = 'translateY(0)';
    animOpacity = 1;
  } else if (phase === 'exiting') {
    animTransform = 'translateY(-8px)';
    animOpacity = 0;
  }

  const toastStyle = {
    ...styles.toast,
    background: typeStyle.isLevelUp ? undefined : typeStyle.background,
    backgroundImage: typeStyle.isLevelUp ? typeStyle.background : undefined,
    border: typeStyle.border,
    color: typeStyle.color,
    transform: animTransform,
    opacity: animOpacity,
    transition: `transform ${ANIM_DURATION}ms ease-out, opacity ${ANIM_DURATION}ms ease-out`,
  };

  return (
    <div style={styles.wrapper}>
      <div style={toastStyle}>
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
      </div>
    </div>
  );
}
