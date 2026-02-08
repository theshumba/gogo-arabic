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
    <div className={styles.container} role="main">
      <h1 className={styles.title}>Gogo Arabic</h1>
      <div className={styles.titleArabic} lang="ar" aria-hidden="true">يلا عربي</div>

      <nav className={styles.btnGroup} aria-label="Main menu">
        {hasCharacter ? (
          <button
            className={styles.btnGold}
            onClick={() => { audioManager.playSFX('click'); onStartGame(); }}
            aria-label="Continue your saved game"
          >
            Continue Game
          </button>
        ) : (
          <button
            className={styles.btnGold}
            onClick={() => { audioManager.playSFX('click'); onCharacterCreation(); }}
            aria-label="Start a new game"
          >
            New Game
          </button>
        )}

        <button
          className={styles.btnDark}
          onClick={() => { audioManager.playSFX('click'); onReview(); }}
          aria-label={`Daily vocabulary reviews${dueCount > 0 ? `, ${dueCount} due` : ''}`}
        >
          Daily Reviews
          {dueCount > 0 && <span className={styles.badge} aria-hidden="true">{dueCount}</span>}
        </button>

        <button
          className={styles.btnDark}
          onClick={() => { audioManager.playSFX('click'); onAlphabet(); }}
          aria-label="Learn the Arabic alphabet"
        >
          Alphabet
        </button>

        <button
          className={styles.btnDark}
          onClick={() => { audioManager.playSFX('click'); onSettings(); }}
          aria-label="Open settings"
        >
          Settings
        </button>
      </nav>
    </div>
  );
}
