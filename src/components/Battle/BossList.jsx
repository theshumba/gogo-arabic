import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BOSSES, canChallengeBoss } from '../../data/bosses.js';
import { selectBossesDefeated } from '../../store/slices/battleSlice.js';
import { selectUnlockedZones } from '../../store/slices/playerSlice.js';
import { COLORS, FONTS, pixelBtn, pixelBtnGold, pixelBtnDark } from '../../styles/theme.js';

const styles = {
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  container: {
    background: COLORS.beige,
    border: `4px solid ${COLORS.dark}`,
    padding: '24px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: `
      inset -4px -4px 0px 0px rgba(0,0,0,0.08),
      inset 4px 4px 0px 0px rgba(255,255,255,0.4),
      8px 8px 0px 0px rgba(0,0,0,0.3)
    `,
    fontFamily: FONTS.pixel,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: `2px solid ${COLORS.brown}`,
  },
  title: {
    fontSize: '16px',
    color: COLORS.brown,
    textTransform: 'uppercase',
    letterSpacing: '2px',
    margin: 0,
  },
  closeBtn: {
    ...pixelBtnDark,
    fontSize: '10px',
    padding: '8px 16px',
  },
  bossList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  bossCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.5)',
    border: `2px solid ${COLORS.dark}`,
    position: 'relative',
  },
  bossCardLocked: {
    opacity: 0.5,
    filter: 'grayscale(100%)',
  },
  bossCardDefeated: {
    background: 'rgba(46, 204, 113, 0.1)',
    borderColor: COLORS.green,
  },
  bossSprite: {
    fontSize: '48px',
    lineHeight: 1,
  },
  bossInfo: {
    flex: 1,
  },
  bossName: {
    fontSize: '12px',
    color: COLORS.brown,
    textTransform: 'uppercase',
    margin: '0 0 4px 0',
  },
  bossNameArabic: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '16px',
    color: COLORS.darkGold,
    margin: '0 0 8px 0',
  },
  bossStats: {
    display: 'flex',
    gap: '12px',
    fontSize: '10px',
    color: COLORS.dark,
  },
  bossStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  challengeBtn: {
    ...pixelBtn,
    fontSize: '10px',
    padding: '10px 20px',
  },
  challengeBtnGold: {
    ...pixelBtnGold,
    fontSize: '10px',
    padding: '10px 20px',
  },
  defeatedBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    fontSize: '10px',
    color: COLORS.green,
    background: 'rgba(46, 204, 113, 0.2)',
    padding: '4px 8px',
    border: `1px solid ${COLORS.green}`,
  },
  lockedText: {
    fontSize: '10px',
    color: COLORS.red,
  },
};

/**
 * BossList - Display all available bosses and allow player to challenge them
 *
 * @param {Object} props
 * @param {Function} props.onClose - Callback when overlay is closed
 */
export default function BossList({ onClose }) {
  const navigate = useNavigate();
  const unlockedZones = useSelector(selectUnlockedZones);
  const bossesDefeated = useSelector(selectBossesDefeated);

  const handleChallenge = (bossId) => {
    navigate(`/battle?boss=${bossId}`);
    onClose();
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  const transition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.25, ease: 'easeOut' };

  const buttonProps = reduceMotion
    ? {}
    : { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } };

  return (
    <motion.div
      style={styles.overlay}
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={transition}
      onClick={onClose}
    >
      <motion.div
        style={styles.container}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={transition}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <h2 style={styles.title}>Word Duels</h2>
          <motion.button
            style={styles.closeBtn}
            onClick={onClose}
            {...buttonProps}
          >
            Close
          </motion.button>
        </div>

        <div style={styles.bossList}>
          {BOSSES.map((boss) => {
            const isLocked = !canChallengeBoss(boss.id, unlockedZones);
            const isDefeated = bossesDefeated.includes(boss.id);

            return (
              <div
                key={boss.id}
                style={{
                  ...styles.bossCard,
                  ...(isLocked ? styles.bossCardLocked : {}),
                  ...(isDefeated ? styles.bossCardDefeated : {}),
                }}
              >
                {isDefeated && (
                  <span style={styles.defeatedBadge}>✓ Defeated</span>
                )}

                <div style={styles.bossSprite}>{boss.sprite}</div>

                <div style={styles.bossInfo}>
                  <p style={styles.bossName}>{boss.name}</p>
                  <p style={styles.bossNameArabic}>{boss.nameArabic}</p>

                  <div style={styles.bossStats}>
                    <div style={styles.bossStat}>
                      <span>❤️</span>
                      <span>{boss.hp} HP</span>
                    </div>
                    <div style={styles.bossStat}>
                      <span>⭐</span>
                      <span>Level {boss.difficulty}</span>
                    </div>
                    <div style={styles.bossStat}>
                      <span>🏆</span>
                      <span>{boss.rewards.xp} XP</span>
                    </div>
                  </div>

                  {isLocked && (
                    <p style={styles.lockedText}>
                      Unlock {boss.zone.replace(/_/g, ' ')} to challenge
                    </p>
                  )}
                </div>

                {!isLocked && (
                  <motion.button
                    style={isDefeated ? styles.challengeBtnGold : styles.challengeBtn}
                    onClick={() => handleChallenge(boss.id)}
                    {...buttonProps}
                  >
                    {isDefeated ? 'Rechallenge' : 'Challenge'}
                  </motion.button>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
