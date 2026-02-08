import { useSelector } from 'react-redux';
import styles from './DialogueOverlay.module.css';

/**
 * DialogueBox
 * The dialogue bubble UI showing speaker name, Arabic text, English text, and continue prompt
 */
export default function DialogueBox({ npc, line, onAdvance, portrait, teachWordCard }) {
  const settings = useSelector((s) => s.settings);

  const isPlayerSpeaking = line.speaker === 'player';
  const speakerName = isPlayerSpeaking ? 'You' : npc.name;

  return (
    <div
      className={styles.dialogueBox}
      onClick={onAdvance}
      role="button"
      tabIndex={0}
      aria-label="Continue dialogue"
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onAdvance();
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
            {line.arabic}
          </div>
        )}
        {line.english && <div className={styles.englishLine}>{line.english}</div>}
        {settings?.showTransliteration && line.transliteration && (
          <div
            className={styles.translitLine}
            aria-label={`Transliteration: ${line.transliteration}`}
          >
            {line.transliteration}
          </div>
        )}
        {/* Teach word card */}
        {teachWordCard}
      </div>
      <div className={styles.continueHint} role="status" aria-live="polite">
        Space / Enter / Click to continue
      </div>
    </div>
  );
}
