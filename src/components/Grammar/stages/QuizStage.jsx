import { motion } from 'framer-motion';
import { COLORS, pixelBtnDark, pixelBtnGold } from '../../../styles/theme.js';
import styles from './GrammarStages.module.css';

const choiceBase = {
  ...pixelBtnDark,
  margin: '10px',
  minWidth: '200px',
};

const choiceCorrect = {
  ...choiceBase,
  background: COLORS.green,
  color: COLORS.white,
};

const choiceWrong = {
  ...choiceBase,
  background: COLORS.red,
  color: COLORS.white,
};

export default function QuizStage({
  lesson, currentIndex, score, answers,
  showFeedback, feedbackMessage,
  onAnswerSelect, onNext, onQuit,
}) {
  const quizItem = lesson.quiz[currentIndex];

  const feedbackClass = feedbackMessage.includes('Correct') ? styles.feedbackCorrect : styles.feedbackWrong;

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <button onClick={onQuit} style={pixelBtnDark}>Quit</button>
        <div className={styles.title}>
          Quiz {currentIndex + 1} / {lesson.quiz.length}
        </div>
        <div className={styles.scoreDisplay}>
          Score: {score}/{lesson.quiz.length}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.promptCenter}>
          {quizItem.question}
        </div>

        <div className={styles.choicesWrap}>
          {quizItem.options.map((option, idx) => {
            let style = choiceBase;
            if (showFeedback) {
              if (idx === quizItem.correct) style = choiceCorrect;
              else if (option === answers[currentIndex]) style = choiceWrong;
            }
            return (
              <button key={idx} onClick={() => onAnswerSelect(option)} style={style} disabled={showFeedback}>
                {idx + 1}. {option}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <>
            <div className={feedbackClass}>
              {feedbackMessage}
              {quizItem.explanation && (
                <div className={styles.quizExplanation}>{quizItem.explanation}</div>
              )}
            </div>
            <button onClick={onNext} style={{ ...pixelBtnGold, marginTop: '20px' }}>
              {currentIndex < lesson.quiz.length - 1 ? 'Next' : 'Finish'}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
