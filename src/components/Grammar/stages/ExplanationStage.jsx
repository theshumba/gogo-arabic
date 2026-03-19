import { motion } from 'framer-motion';
import { containerStyle, headerStyle, titleStyle, bodyStyle, arabicTextStyle, sectionTitleStyle, textStyle, btnStyle, pixelBtnDark } from '../grammarStyles.js';

export default function ExplanationStage({ lesson, formatArabic, onBack, onNext }) {
  return (
    <motion.div
      style={containerStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div style={headerStyle}>
        <button onClick={onBack} style={pixelBtnDark}>Back</button>
        <div style={titleStyle}>{lesson.title}</div>
        <div style={{ width: '80px' }} />
      </div>

      <div style={bodyStyle}>
        <div style={arabicTextStyle}>{formatArabic(lesson.titleArabic)}</div>
        <div style={sectionTitleStyle}>Lesson {lesson.order} - Difficulty: {'⭐'.repeat(lesson.difficulty)}</div>
        <div style={{ ...textStyle, whiteSpace: 'pre-line' }}>{lesson.explanation}</div>
        <button onClick={onNext} style={btnStyle}>Continue to Examples</button>
      </div>
    </motion.div>
  );
}
