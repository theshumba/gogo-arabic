import { useSelector } from 'react-redux';
import { getDueCards } from '../../services/fsrs.js';
import { audioManager } from '../../services/audio.js';
import { COLORS, FONTS, pixelBtnGold, pixelBtnDark, fullScreenBg } from '../../styles/theme.js';

const styles = {
  container: fullScreenBg('/img/pixel-fishes.gif'),
  title: {
    fontFamily: FONTS.pixel,
    fontSize: '28px',
    color: COLORS.beige,
    textShadow: `3px 3px 0px ${COLORS.brown}, -1px -1px 0px ${COLORS.brown}`,
    marginBottom: '4px',
    animation: 'bounce 2s ease-in-out infinite',
  },
  titleArabic: {
    fontFamily: FONTS.arabic,
    fontSize: '32px',
    color: COLORS.xpGold,
    direction: 'rtl',
    marginBottom: '36px',
    textShadow: `2px 2px 0px ${COLORS.brown}`,
  },
  btnGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    width: '300px',
  },
  btnGold: {
    ...pixelBtnGold,
    width: '100%',
    fontSize: '10px',
    padding: '16px 28px',
  },
  btnDark: {
    ...pixelBtnDark,
    width: '100%',
    fontSize: '10px',
    padding: '14px 28px',
  },
  badge: {
    fontFamily: FONTS.pixel,
    fontSize: '8px',
    background: COLORS.red,
    color: COLORS.white,
    padding: '3px 7px',
    marginLeft: '8px',
    border: `2px solid ${COLORS.dark}`,
  },
  keyframes: `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
  `,
};

export default function MainMenu({ onStartGame, onAlphabet, onReview, onSettings, onCharacterCreation }) {
  const cards = useSelector((s) => s.vocabulary.fsrsCards);
  const player = useSelector((s) => s.player);

  let dueCount = 0;
  try {
    dueCount = getDueCards(cards).length;
  } catch {
    dueCount = 0;
  }

  const hasCharacter = player.name !== '';

  return (
    <div style={styles.container}>
      <style>{styles.keyframes}</style>
      <div style={styles.title}>Gogo Arabic</div>
      <div style={styles.titleArabic}>يلا عربي</div>

      <div style={styles.btnGroup}>
        {hasCharacter ? (
          <button style={styles.btnGold} onClick={() => { audioManager.playSFX('click'); onStartGame(); }}>
            Continue Game
          </button>
        ) : (
          <button style={styles.btnGold} onClick={() => { audioManager.playSFX('click'); onCharacterCreation(); }}>
            New Game
          </button>
        )}

        <button style={styles.btnDark} onClick={() => { audioManager.playSFX('click'); onReview(); }}>
          Daily Reviews
          {dueCount > 0 && <span style={styles.badge}>{dueCount}</span>}
        </button>

        <button style={styles.btnDark} onClick={() => { audioManager.playSFX('click'); onAlphabet(); }}>
          Alphabet
        </button>

        <button style={styles.btnDark} onClick={() => { audioManager.playSFX('click'); onSettings(); }}>
          Settings
        </button>
      </div>
    </div>
  );
}
