import { motion } from 'framer-motion';
import {
  containerStyle, headerStyle, titleStyle, bodyStyle, textStyle, btnStyle,
  choiceStyle, choiceCorrectStyle, choiceWrongStyle, getFeedbackStyle,
  pixelBtnDark, FONTS, COLORS,
} from '../grammarStyles.js';

export default function ExerciseStage({
  lesson, currentIndex, score, answers, matchedPairs, selectedMatchIndex,
  showFeedback, feedbackMessage, formatArabic,
  onAnswerSelect, onMatchSelect, onNext, onQuit,
}) {
  const exercise = lesson.exercises[currentIndex];

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
          Exercise {currentIndex + 1} / {lesson.exercises.length}
        </div>
        <div style={{ fontFamily: FONTS.pixel, fontSize: '12px', color: COLORS.xpGold }}>
          Score: {score}/{lesson.exercises.length}
        </div>
      </div>

      <div style={bodyStyle}>
        {exercise.type === 'fill-blank' && (
          <>
            <div style={{ ...textStyle, fontSize: '14px', textAlign: 'center', marginBottom: '30px' }}>
              {exercise.prompt}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {exercise.options.map((option, idx) => {
                let style = choiceStyle;
                if (showFeedback) {
                  if (option === exercise.answer) style = choiceCorrectStyle;
                  else if (option === answers[currentIndex]) style = choiceWrongStyle;
                }
                return (
                  <button key={idx} onClick={() => onAnswerSelect(option)} style={style} disabled={showFeedback}>
                    {idx + 1}. {option}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {exercise.type === 'translate' && (
          <>
            <div style={{ ...textStyle, fontSize: '14px', textAlign: 'center', marginBottom: '30px' }}>
              Translate: {exercise.prompt}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {exercise.options.map((option, idx) => {
                let style = choiceStyle;
                if (showFeedback) {
                  if (option === exercise.answer) style = choiceCorrectStyle;
                  else if (option === answers[currentIndex]) style = choiceWrongStyle;
                }
                return (
                  <button
                    key={idx}
                    onClick={() => onAnswerSelect(option)}
                    style={{ ...style, fontFamily: FONTS.arabicDisplay, fontSize: '16px' }}
                    disabled={showFeedback}
                  >
                    {idx + 1}. {formatArabic(option)}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {exercise.type === 'match' && (
          <>
            <div style={{ ...textStyle, fontSize: '14px', textAlign: 'center', marginBottom: '30px' }}>
              {exercise.prompt}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
              {exercise.pairs.flatMap((pair, idx) => [
                <button
                  key={`${idx}-0`}
                  onClick={() => onMatchSelect(idx * 2, pair[0])}
                  style={{
                    ...choiceStyle,
                    fontFamily: FONTS.arabicDisplay,
                    fontSize: '16px',
                    background: matchedPairs[idx * 2]
                      ? COLORS.green
                      : selectedMatchIndex === idx * 2
                      ? COLORS.cyan
                      : COLORS.gray,
                    color: COLORS.white,
                  }}
                  disabled={matchedPairs[idx * 2]}
                >
                  {formatArabic(pair[0])}
                </button>,
                <button
                  key={`${idx}-1`}
                  onClick={() => onMatchSelect(idx * 2 + 1, pair[1])}
                  style={{
                    ...choiceStyle,
                    background: matchedPairs[idx * 2 + 1]
                      ? COLORS.green
                      : selectedMatchIndex === idx * 2 + 1
                      ? COLORS.cyan
                      : COLORS.gray,
                    color: COLORS.white,
                  }}
                  disabled={matchedPairs[idx * 2 + 1]}
                >
                  {pair[1]}
                </button>,
              ])}
            </div>
          </>
        )}

        {showFeedback && (
          <>
            <div style={getFeedbackStyle(feedbackMessage)}>{feedbackMessage}</div>
            <button onClick={onNext} style={btnStyle}>Next</button>
          </>
        )}
      </div>
    </motion.div>
  );
}
