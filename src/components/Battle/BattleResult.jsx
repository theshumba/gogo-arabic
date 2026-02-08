import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { getBossById } from '../../data/bosses.js';
import { COLORS, FONTS, pixelBtnGold } from '../../styles/theme.js';

const styles = {
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 260,
  },
  card: {
    background: COLORS.beige,
    border: `4px solid ${COLORS.dark}`,
    padding: '32px',
    color: COLORS.dark,
    textAlign: 'center',
    minWidth: '400px',
    maxWidth: '500px',
    boxShadow: `
      inset -4px -4px 0px 0px rgba(0,0,0,0.08),
      inset 4px 4px 0px 0px rgba(255,255,255,0.4),
      8px 8px 0px 0px rgba(0,0,0,0.3)
    `,
    fontFamily: FONTS.pixel,
  },
  title: {
    fontSize: '20px',
    color: COLORS.brown,
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '16px',
  },
  victoryTitle: {
    color: COLORS.green,
  },
  defeatTitle: {
    color: COLORS.red,
  },
  bossSprite: {
    fontSize: '64px',
    margin: '16px 0',
    filter: 'grayscale(100%)',
  },
  victorySpriteFilter: {
    filter: 'none',
  },
  bossName: {
    fontSize: '14px',
    color: COLORS.brown,
    marginBottom: '8px',
  },
  bossNameArabic: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '20px',
    color: COLORS.darkGold,
    marginBottom: '16px',
  },
  dialogue: {
    fontFamily: FONTS.pixel,
    fontSize: '11px',
    color: COLORS.dark,
    lineHeight: '1.6',
    padding: '16px',
    background: 'rgba(0, 0, 0, 0.05)',
    border: `2px solid ${COLORS.brown}`,
    marginBottom: '20px',
  },
  stats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px',
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.5)',
    border: `2px solid ${COLORS.dark}`,
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: COLORS.brown,
  },
  statLabel: {
    fontWeight: 'normal',
  },
  statValue: {
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  rewards: {
    marginTop: '16px',
    padding: '16px',
    background: 'rgba(226, 182, 89, 0.2)',
    border: `2px solid ${COLORS.gold}`,
  },
  rewardsTitle: {
    fontSize: '12px',
    color: COLORS.gold,
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  rewardRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    fontSize: '14px',
    color: COLORS.brown,
  },
  rewardItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  continueBtn: {
    ...pixelBtnGold,
    marginTop: '24px',
    fontSize: '12px',
    padding: '14px 32px',
  },
};

/**
 * BattleResult - Shows victory/defeat screen after battle
 *
 * @param {Object} props
 * @param {string} props.bossId - ID of the boss that was battled
 * @param {boolean} props.victory - Whether player won
 * @param {Function} props.onClose - Callback when user clicks continue
 */
export default function BattleResult({ bossId, victory, onClose }) {
  const boss = getBossById(bossId);
  const battleHistory = useSelector((s) => s.battle.battleHistory);

  if (!boss) return null;

  // Get the most recent battle result for this boss
  const result = battleHistory[0];
  const accuracy = result?.accuracy || 0;
  const timeElapsed = result?.timeElapsed || 0;
  const rewards = result?.rewards || { xp: 0, dirhams: 0 };

  const timeInSeconds = Math.floor(timeElapsed / 1000);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  const transition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.3, ease: 'easeOut' };

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
    >
      <motion.div
        style={styles.card}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={transition}
      >
        <h1 style={{
          ...styles.title,
          ...(victory ? styles.victoryTitle : styles.defeatTitle),
        }}>
          {victory ? 'Victory!' : 'Defeated'}
        </h1>

        <div style={{
          ...styles.bossSprite,
          ...(victory ? styles.victorySpriteFilter : {}),
        }}>
          {boss.sprite}
        </div>

        <p style={styles.bossName}>{boss.name}</p>
        <p style={styles.bossNameArabic}>{boss.nameArabic}</p>

        <div style={styles.dialogue}>
          {victory ? boss.dialogue.defeat : boss.dialogue.victory}
        </div>

        <div style={styles.stats}>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>Accuracy:</span>
            <span style={styles.statValue}>{accuracy}%</span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>Time:</span>
            <span style={styles.statValue}>{timeInSeconds}s</span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>Result:</span>
            <span style={{
              ...styles.statValue,
              color: victory ? COLORS.green : COLORS.red,
            }}>
              {victory ? 'VICTORY' : 'DEFEAT'}
            </span>
          </div>
        </div>

        {victory && rewards.xp > 0 && (
          <div style={styles.rewards}>
            <p style={styles.rewardsTitle}>Rewards Earned</p>
            <div style={styles.rewardRow}>
              <div style={styles.rewardItem}>
                <span>⭐</span>
                <span>{rewards.xp} XP</span>
              </div>
              <div style={styles.rewardItem}>
                <span>💰</span>
                <span>{rewards.dirhams} Dirhams</span>
              </div>
            </div>
          </div>
        )}

        <motion.button
          style={styles.continueBtn}
          onClick={onClose}
          {...buttonProps}
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
