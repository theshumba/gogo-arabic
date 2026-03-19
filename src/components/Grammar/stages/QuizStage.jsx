import { motion } from 'framer-motion';
import {
  containerStyle, headerStyle, titleStyle, bodyStyle, textStyle, btnStyle,
  choiceStyle, choiceCorrectStyle, choiceWrongStyle, getFeedbackStyle,
  pixelBtnDark, FONTS, COLORS,
} from '../grammarStyles.js';

export default function QuizStage({
  lesson, currentIndex, score, answers,
  showFeedback, feedbackMessage,
  onAnswerSelect, onNext, onQuit,
}) {
  const quizItem = lesson.quiz[currentIndex];

  return (
    <motion.div
      style={containerStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div style={headerStyle}>
        <button onClick={onQuit} style={pixelBtnDark}>Quit</button>
        <div style={titleStyle}>
          Quiz {currentIndex + 1} / {lesson.quiz.length}
        </div>
        <div style={{ fontFamily: FONTS.pixel, fontSize: '12px', color: COLORS.xpGold }}>
          Score: {score}/{lesson.quiz.length}
        </div>
      </div>

      <div style={bodyStyle}>
        <div style={{ ...textStyle, fontSize: '14px', textAlign: 'center', marginBottom: '30px' }}>
          {quizItem.question}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {quizItem.options.map((option, idx) => {
            let style = choiceStyle;
            if (showFeedback) {
              if (idx === quizItem.correct) style = choiceCorrectStyle;
              else if (option === answers[currentIndex]) style = choiceWrongStyle;
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
            <div style={getFeedbackStyle(feedbackMessage)}>
              {feedbackMessage}
              {quizItem.explanation && (
                <div style={{ marginTop: '10px', fontSize: '11px' }}>{quizItem.explanation}</div>
              )}
            </div>
            <button onClick={onNext} style={btnStyle}>
              {currentIndex < lesson.quiz.length - 1 ? 'Next' : 'Finish'}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
