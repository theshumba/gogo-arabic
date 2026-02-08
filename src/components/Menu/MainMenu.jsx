import { useSelector } from 'react-redux';
import { getDueCards } from '../../services/fsrs.js';
import { audioManager } from '../../services/audio.js';
import styles from './MainMenu.module.css';

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
    <div className={styles.container}>
      <div className={styles.title}>Gogo Arabic</div>
      <div className={styles.titleArabic}>يلا عربي</div>

      <div className={styles.btnGroup}>
        {hasCharacter ? (
          <button className={styles.btnGold} onClick={() => { audioManager.playSFX('click'); onStartGame(); }}>
            Continue Game
          </button>
        ) : (
          <button className={styles.btnGold} onClick={() => { audioManager.playSFX('click'); onCharacterCreation(); }}>
            New Game
          </button>
        )}

        <button className={styles.btnDark} onClick={() => { audioManager.playSFX('click'); onReview(); }}>
          Daily Reviews
          {dueCount > 0 && <span className={styles.badge}>{dueCount}</span>}
        </button>

        <button className={styles.btnDark} onClick={() => { audioManager.playSFX('click'); onAlphabet(); }}>
          Alphabet
        </button>

        <button className={styles.btnDark} onClick={() => { audioManager.playSFX('click'); onSettings(); }}>
          Settings
        </button>
      </div>
    </div>
  );
}
