import { motion } from 'framer-motion';
import { containerStyle, headerStyle, titleStyle, bodyStyle, pixelBtnGold, FONTS, COLORS } from '../grammarStyles.js';

const XP_REWARDS = {
  LESSON_COMPLETE: 50,
  PERFECT_LESSON: 100,
};

export default function CompleteStage({ lesson, exerciseScore, quizScore, onBack }) {
  const totalQuestions = lesson.exercises.length + lesson.quiz.length;
  const totalCorrect = exerciseScore + quizScore;
  const percentage = Math.round((totalCorrect / totalQuestions) * 100);
  const isPerfect = totalCorrect === totalQuestions;

  return (
    <motion.div
      style={containerStyle}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div style={headerStyle}>
        <div style={{ width: '80px' }} />
        <div style={titleStyle}>Lesson Complete!</div>
        <div style={{ width: '80px' }} />
      </div>

      <div style={{ ...bodyStyle, textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>
          {isPerfect ? '🏆' : percentage >= 80 ? '⭐' : percentage >= 60 ? '👍' : '📖'}
        </div>

        <div style={{ fontFamily: FONTS.pixel, fontSize: '18px', color: COLORS.brown, marginBottom: '20px' }}>
          {isPerfect ? 'Perfect Score!' : percentage >= 80 ? 'Great Job!' : percentage >= 60 ? 'Good Effort!' : 'Keep Practicing!'}
        </div>

        <div style={{ fontFamily: FONTS.pixel, fontSize: '14px', color: COLORS.dark, marginBottom: '30px' }}>
          Score: {totalCorrect} / {totalQuestions} ({percentage}%)
        </div>

        <div style={{ fontFamily: FONTS.pixel, fontSize: '12px', color: COLORS.darkGold, marginBottom: '40px' }}>
          +{isPerfect ? XP_REWARDS.PERFECT_LESSON : XP_REWARDS.LESSON_COMPLETE} XP
        </div>

        <button onClick={onBack} style={{ ...pixelBtnGold, fontSize: '14px' }}>
          Back to Grammar
        </button>
      </div>
    </motion.div>
  );
}
