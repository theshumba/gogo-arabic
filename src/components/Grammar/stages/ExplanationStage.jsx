import { motion } from 'framer-motion';
import { pixelBtnDark, pixelBtnGold } from '../../../styles/theme.js';
import styles from './GrammarStages.module.css';

export default function ExplanationStage({ lesson, formatArabic, onBack, onNext }) {
  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <button onClick={onBack} style={pixelBtnDark}>Back</button>
        <div className={styles.title}>{lesson.title}</div>
        <div className={styles.spacer} />
      </div>

      <div className={styles.body}>
        <div className={styles.arabicText}>{formatArabic(lesson.titleArabic)}</div>
        <div className={styles.sectionTitle}>Lesson {lesson.order} - Difficulty: {'⭐'.repeat(lesson.difficulty)}</div>
        <div className={styles.textPreLine}>{lesson.explanation}</div>
        <button onClick={onNext} style={{ ...pixelBtnGold, marginTop: '20px' }}>Continue to Examples</button>
      </div>
    </motion.div>
  );
}
