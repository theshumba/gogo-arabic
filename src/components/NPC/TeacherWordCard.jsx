import { useSelector } from 'react-redux';
import vocabulary from '../../data/vocabularyAll.js';
import styles from './DialogueOverlay.module.css';

/**
 * TeacherWordCard
 * The word teaching card shown during vocabulary lessons
 */
export default function TeacherWordCard({ wordId }) {
  const cards = useSelector((s) => s.vocabulary.fsrsCards);

  const word = vocabulary.find((w) => w.id === wordId);
  if (!word) return null;

  const alreadyKnown = !!cards[wordId];

  return (
    <div className={styles.teachContainer}>
      <span className={styles.teachBadge}>
        {alreadyKnown ? 'Review' : 'New Word!'}
      </span>
      <div className={styles.wordCard}>
        <div className={styles.wordCardArabic}>{word.arabic}</div>
        <div className={styles.wordCardEnglish}>{word.english}</div>
        <div className={styles.wordCardTranslit}>{word.transliteration}</div>
      </div>
    </div>
  );
}
