import { COLORS, FONTS } from '../../styles/theme.js';

/**
 * ProgressBar - Inline-styled quiz progress indicator
 *
 * Usage:
 * <ProgressBar current={3} total={10} />
 *
 * Features:
 * - Smooth animated fill (CSS transition)
 * - Shows "Question X of Y"
 * - Compact vertical space
 * - Matches app color theme
 */

const styles = {
  container: {
    width: '100%',
    marginBottom: '12px',
  },
  label: {
    fontFamily: FONTS.pixel,
    fontSize: '8px',
    color: COLORS.lightGray,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
    textAlign: 'center',
  },
  barBg: {
    width: '100%',
    height: '12px',
    background: COLORS.gray,
    border: `2px solid ${COLORS.dark}`,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
  },
  barFill: {
    height: '100%',
    background: `linear-gradient(180deg, ${COLORS.xpGold} 0%, ${COLORS.darkGold} 100%)`,
    transition: 'width 0.4s ease-out',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)',
    position: 'relative',
  },
  barFillShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
    pointerEvents: 'none',
  },
};

export default function ProgressBar({ current, total }) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div style={styles.container}>
      <div style={styles.label}>
        Question {current} of {total}
      </div>
      <div style={styles.barBg}>
        <div style={{ ...styles.barFill, width: `${percentage}%` }}>
          <div style={styles.barFillShine} />
        </div>
      </div>
    </div>
  );
}
