import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { completeLesson, recordExerciseProgress, recordQuizProgress } from '../../store/slices/grammarSlice.js';
import { addXP } from '../../store/slices/playerSlice.js';
import { COLORS, FONTS, pixelBtnGold, pixelBtnDark } from '../../styles/theme.js';
import { useFormatArabic } from '../../hooks/useFormatArabic.js';
import { grammarLessons } from '../../data/grammar.js';

const XP_REWARDS = {
  EXERCISE_CORRECT: 5,
  QUIZ_CORRECT: 10,
  LESSON_COMPLETE: 50,
  PERFECT_LESSON: 100,
};

export default function GrammarLesson({ lessonId, onBack }) {
  const dispatch = useDispatch();
  const formatArabic = useFormatArabic();
  const lesson = grammarLessons.find((l) => l.id === lessonId);

  const [stage, setStage] = useState('explanation'); // explanation, examples, rules, exercises, quiz, complete
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [exerciseAnswers, setExerciseAnswers] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [matchedPairs, setMatchedPairs] = useState({});
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [exerciseScore, setExerciseScore] = useState(0);
  const [quizScore, setQuizScore] = useState(0);

  if (!lesson) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: COLORS.beige,
          fontFamily: FONTS.pixel,
          color: COLORS.dark,
        }}
      >
        <div>Lesson not found</div>
        <button onClick={onBack} style={{ ...pixelBtnDark, marginLeft: '20px' }}>
          Back
        </button>
      </div>
    );
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onBack();
      }

      if (stage === 'exercises' || stage === 'quiz') {
        const exercise = stage === 'exercises' ? lesson.exercises[currentExerciseIndex] : null;
        const quiz = stage === 'quiz' ? lesson.quiz[currentQuizIndex] : null;
        const item = exercise || quiz;

        if (item && item.type !== 'match' && !showFeedback) {
          if (e.key >= '1' && e.key <= '4') {
            const optionIndex = parseInt(e.key) - 1;
            if (item.options && item.options[optionIndex]) {
              handleAnswerSelect(item.options[optionIndex]);
            }
          }
        }

        if (e.key === 'Enter' && showFeedback) {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [stage, currentExerciseIndex, currentQuizIndex, showFeedback]);

  const handleAnswerSelect = (answer) => {
    if (showFeedback) return;

    const isExercise = stage === 'exercises';
    const currentIndex = isExercise ? currentExerciseIndex : currentQuizIndex;
    const item = isExercise ? lesson.exercises[currentIndex] : lesson.quiz[currentIndex];

    const isCorrect = answer === item.answer || answer === item.correct;

    if (isExercise) {
      setExerciseAnswers({ ...exerciseAnswers, [currentIndex]: answer });
      if (isCorrect) {
        setExerciseScore(exerciseScore + 1);
        dispatch(addXP(XP_REWARDS.EXERCISE_CORRECT));
      }
    } else {
      setQuizAnswers({ ...quizAnswers, [currentIndex]: answer });
      if (isCorrect) {
        setQuizScore(quizScore + 1);
        dispatch(addXP(XP_REWARDS.QUIZ_CORRECT));
      }
    }

    setFeedbackMessage(isCorrect ? 'Correct!' : `Wrong! The answer is: ${item.answer || item.options[item.correct]}`);
    setShowFeedback(true);
  };

  const handleMatchSelect = (index, value) => {
    if (showFeedback) return;

    const exercise = lesson.exercises[currentExerciseIndex];

    if (selectedMatchIndex === null) {
      setSelectedMatchIndex(index);
    } else {
      const firstPair = exercise.pairs[selectedMatchIndex];
      const secondPair = exercise.pairs[index];

      // Check if it's a correct match
      const isMatch =
        (firstPair[0] === secondPair[0] && firstPair[1] === secondPair[1]) ||
        (firstPair[0] === secondPair[1] && firstPair[1] === secondPair[0]);

      if (isMatch && selectedMatchIndex !== index) {
        const newMatched = { ...matchedPairs, [selectedMatchIndex]: true, [index]: true };
        setMatchedPairs(newMatched);

        // Check if all pairs matched
        if (Object.keys(newMatched).length === exercise.pairs.length * 2) {
          setExerciseScore(exerciseScore + 1);
          dispatch(addXP(XP_REWARDS.EXERCISE_CORRECT));
          setFeedbackMessage('All pairs matched!');
          setShowFeedback(true);
        }
      }

      setSelectedMatchIndex(null);
    }
  };

  const handleNext = () => {
    setShowFeedback(false);
    setFeedbackMessage('');

    if (stage === 'exercises') {
      if (currentExerciseIndex < lesson.exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setMatchedPairs({});
        setSelectedMatchIndex(null);
      } else {
        // Record exercise progress
        dispatch(recordExerciseProgress({
          lessonId: lesson.id,
          score: Math.round((exerciseScore / lesson.exercises.length) * 100),
        }));
        setStage('quiz');
      }
    } else if (stage === 'quiz') {
      if (currentQuizIndex < lesson.quiz.length - 1) {
        setCurrentQuizIndex(currentQuizIndex + 1);
      } else {
        // Record quiz progress
        const quizScorePercent = Math.round((quizScore / lesson.quiz.length) * 100);
        dispatch(recordQuizProgress({
          lessonId: lesson.id,
          score: quizScorePercent,
        }));

        // Complete lesson
        const exerciseScorePercent = Math.round((exerciseScore / lesson.exercises.length) * 100);
        dispatch(completeLesson({
          lessonId: lesson.id,
          exerciseScore: exerciseScorePercent,
          quizScore: quizScorePercent,
        }));

        // Perfect lesson bonus
        if (exerciseScore === lesson.exercises.length && quizScore === lesson.quiz.length) {
          dispatch(addXP(XP_REWARDS.PERFECT_LESSON));
        } else {
          dispatch(addXP(XP_REWARDS.LESSON_COMPLETE));
        }

        setStage('complete');
      }
    }
  };

  const containerStyle = {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: COLORS.beige,
    overflowY: 'auto',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    background: COLORS.brown,
    borderBottom: `4px solid ${COLORS.darkBrown}`,
  };

  const titleStyle = {
    fontFamily: FONTS.pixel,
    fontSize: '16px',
    color: COLORS.xpGold,
    textAlign: 'center',
    flex: 1,
  };

  const bodyStyle = {
    flex: 1,
    padding: '40px',
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
  };

  const sectionTitleStyle = {
    fontFamily: FONTS.pixel,
    fontSize: '14px',
    color: COLORS.brown,
    marginBottom: '20px',
  };

  const arabicTextStyle = {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '18px',
    color: COLORS.brown2,
    marginBottom: '10px',
  };

  const textStyle = {
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    lineHeight: '1.8',
    color: COLORS.dark,
    marginBottom: '20px',
  };

  const exampleBoxStyle = {
    background: COLORS.white,
    border: `3px solid ${COLORS.brown}`,
    padding: '20px',
    marginBottom: '15px',
  };

  const btnStyle = {
    ...pixelBtnGold,
    marginTop: '20px',
  };

  const choiceStyle = {
    ...pixelBtnDark,
    margin: '10px',
    minWidth: '200px',
  };

  const choiceCorrectStyle = {
    ...choiceStyle,
    background: COLORS.green,
    color: COLORS.white,
  };

  const choiceWrongStyle = {
    ...choiceStyle,
    background: COLORS.red,
    color: COLORS.white,
  };

  const feedbackStyle = {
    fontFamily: FONTS.pixel,
    fontSize: '14px',
    color: feedbackMessage.includes('Correct') ? COLORS.green : COLORS.red,
    marginTop: '20px',
    padding: '15px',
    background: COLORS.white,
    border: `3px solid ${feedbackMessage.includes('Correct') ? COLORS.green : COLORS.red}`,
  };

  // EXPLANATION STAGE
  if (stage === 'explanation') {
    return (
      <motion.div
        style={containerStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div style={headerStyle}>
          <button onClick={onBack} style={pixelBtnDark}>
            Back
          </button>
          <div style={titleStyle}>{lesson.title}</div>
          <div style={{ width: '80px' }} />
        </div>

        <div style={bodyStyle}>
          <div style={arabicTextStyle}>{formatArabic(lesson.titleArabic)}</div>
          <div style={sectionTitleStyle}>Lesson {lesson.order} - Difficulty: {'⭐'.repeat(lesson.difficulty)}</div>

          <div style={{ ...textStyle, whiteSpace: 'pre-line' }}>{lesson.explanation}</div>

          <button onClick={() => setStage('examples')} style={btnStyle}>
            Continue to Examples
          </button>
        </div>
      </motion.div>
    );
  }

  // EXAMPLES STAGE
  if (stage === 'examples') {
    return (
      <motion.div
        style={containerStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div style={headerStyle}>
          <button onClick={() => setStage('explanation')} style={pixelBtnDark}>
            Back
          </button>
          <div style={titleStyle}>Examples</div>
          <div style={{ width: '80px' }} />
        </div>

        <div style={bodyStyle}>
          <div style={sectionTitleStyle}>Study these examples:</div>

          {lesson.examples.map((example, idx) => (
            <div key={idx} style={exampleBoxStyle}>
              <div style={{ fontFamily: FONTS.arabicDisplay, fontSize: '24px', color: COLORS.brown, marginBottom: '10px' }}>
                {formatArabic(example.arabic)}
              </div>
              <div style={{ fontFamily: FONTS.pixel, fontSize: '12px', color: COLORS.dark, marginBottom: '5px' }}>
                {example.english}
              </div>
              <div style={{ fontFamily: FONTS.pixel, fontSize: '10px', color: COLORS.gray, marginBottom: '5px' }}>
                {example.transliteration}
              </div>
              <div style={{ fontFamily: FONTS.pixel, fontSize: '10px', color: COLORS.darkGold }}>
                {example.breakdown}
              </div>
            </div>
          ))}

          <button onClick={() => setStage('rules')} style={btnStyle}>
            Continue to Rules
          </button>
        </div>
      </motion.div>
    );
  }

  // RULES STAGE
  if (stage === 'rules') {
    return (
      <motion.div
        style={containerStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div style={headerStyle}>
          <button onClick={() => setStage('examples')} style={pixelBtnDark}>
            Back
          </button>
          <div style={titleStyle}>Key Rules</div>
          <div style={{ width: '80px' }} />
        </div>

        <div style={bodyStyle}>
          <div style={sectionTitleStyle}>Remember these rules:</div>

          {lesson.rules.map((rule, idx) => (
            <div key={idx} style={exampleBoxStyle}>
              <div style={{ fontFamily: FONTS.pixel, fontSize: '12px', color: COLORS.brown, marginBottom: '10px', fontWeight: 'bold' }}>
                {rule.rule}
              </div>
              <div style={{ fontFamily: FONTS.pixel, fontSize: '11px', color: COLORS.dark }}>
                Example: {rule.example}
              </div>
            </div>
          ))}

          <button onClick={() => setStage('exercises')} style={btnStyle}>
            Start Exercises
          </button>
        </div>
      </motion.div>
    );
  }

  // EXERCISES STAGE
  if (stage === 'exercises') {
    const exercise = lesson.exercises[currentExerciseIndex];

    return (
      <motion.div
        style={containerStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div style={headerStyle}>
          <button onClick={onBack} style={pixelBtnDark}>
            Quit
          </button>
          <div style={titleStyle}>
            Exercise {currentExerciseIndex + 1} / {lesson.exercises.length}
          </div>
          <div style={{ fontFamily: FONTS.pixel, fontSize: '12px', color: COLORS.xpGold }}>
            Score: {exerciseScore}/{lesson.exercises.length}
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
                    else if (option === exerciseAnswers[currentExerciseIndex]) style = choiceWrongStyle;
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(option)}
                      style={style}
                      disabled={showFeedback}
                    >
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
                    else if (option === exerciseAnswers[currentExerciseIndex]) style = choiceWrongStyle;
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(option)}
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
                    onClick={() => handleMatchSelect(idx * 2, pair[0])}
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
                    onClick={() => handleMatchSelect(idx * 2 + 1, pair[1])}
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
              <div style={feedbackStyle}>{feedbackMessage}</div>
              <button onClick={handleNext} style={btnStyle}>
                Next
              </button>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  // QUIZ STAGE
  if (stage === 'quiz') {
    const quizItem = lesson.quiz[currentQuizIndex];

    return (
      <motion.div
        style={containerStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div style={headerStyle}>
          <button onClick={onBack} style={pixelBtnDark}>
            Quit
          </button>
          <div style={titleStyle}>
            Quiz {currentQuizIndex + 1} / {lesson.quiz.length}
          </div>
          <div style={{ fontFamily: FONTS.pixel, fontSize: '12px', color: COLORS.xpGold }}>
            Score: {quizScore}/{lesson.quiz.length}
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
                else if (option === quizAnswers[currentQuizIndex]) style = choiceWrongStyle;
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(option)}
                  style={style}
                  disabled={showFeedback}
                >
                  {idx + 1}. {option}
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <>
              <div style={feedbackStyle}>
                {feedbackMessage}
                {quizItem.explanation && (
                  <div style={{ marginTop: '10px', fontSize: '11px' }}>{quizItem.explanation}</div>
                )}
              </div>
              <button onClick={handleNext} style={btnStyle}>
                {currentQuizIndex < lesson.quiz.length - 1 ? 'Next' : 'Finish'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  // COMPLETE STAGE
  if (stage === 'complete') {
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

  return null;
}
