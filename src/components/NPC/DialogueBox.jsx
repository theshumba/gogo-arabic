import { useSelector } from 'react-redux';
import { useTypewriter } from '../../hooks/useTypewriter.js';
import styles from './DialogueOverlay.module.css';

/**
 * DialogueBox
 * The dialogue bubble UI showing speaker name, Arabic text, English text, and continue prompt
 * Now features typewriter effect for dialogue text
 */
export default function DialogueBox({ npc, line, onAdvance, portrait, teachWordCard }) {
  const settings = useSelector((s) => s.settings);

  const isPlayerSpeaking = line.speaker === 'player';
  const speakerName = isPlayerSpeaking ? 'You' : npc.name;

  // Typewriter effect for Arabic text
  const arabicTypewriter = useTypewriter(line.arabic, 30);
  // Typewriter effect for English text (starts after Arabic completes)
  const englishTypewriter = useTypewriter(
    arabicTypewriter.isComplete ? line.english : '',
    25
  );
  // Typewriter effect for transliteration (starts after English completes)
  const translitTypewriter = useTypewriter(
    englishTypewriter.isComplete ? line.transliteration : '',
    20
  );

  // Determine if all text is fully revealed
  const allComplete =
    arabicTypewriter.isComplete &&
    (!line.english || englishTypewriter.isComplete) &&
    (!line.transliteration || !settings?.showTransliteration || translitTypewriter.isComplete);

  // Handle advance - first skip typing, then advance to next line
  const handleAdvance = () => {
    if (!allComplete) {
      // Skip all typing animations
      arabicTypewriter.skip();
      englishTypewriter.skip();
      translitTypewriter.skip();
    } else {
      // All text revealed, advance to next line
      onAdvance();
    }
  };

  return (
    <div
      className={styles.dialogueBox}
      onClick={handleAdvance}
      role="button"
      tabIndex={0}
      aria-label={allComplete ? 'Continue dialogue' : 'Skip typing animation'}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleAdvance();
        }
      }}
    >
      {/* Portrait */}
      {portrait}
      <div className={styles.content}>
        <div className={styles.speakerName} role="heading" aria-level="2">
          {speakerName}
        </div>
        {line.arabic && (
          <div className={styles.arabicLine} lang="ar">
            {arabicTypewriter.displayText}
          </div>
        )}
        {line.english && arabicTypewriter.isComplete && (
          <div className={styles.englishLine}>{englishTypewriter.displayText}</div>
        )}
        {settings?.showTransliteration && line.transliteration && englishTypewriter.isComplete && (
          <div
            className={styles.translitLine}
            aria-label={`Transliteration: ${line.transliteration}`}
          >
            {translitTypewriter.displayText}
          </div>
        )}
        {/* Teach word card - only show when all text is revealed */}
        {allComplete && teachWordCard}
      </div>
      <div className={styles.continueHint} role="status" aria-live="polite">
        {allComplete ? (
          <>
            Space / Enter / Click to continue{' '}
            <span className={styles.continueIndicator}>▼</span>
          </>
        ) : (
          'Click or press Space to skip typing...'
        )}
      </div>
    </div>
  );
}
