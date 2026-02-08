import { useState, useEffect, useMemo } from 'react';
import { COLORS, FONTS, pixelBtnGold, pixelBtnDark } from '../../styles/theme.js';
import { useFormatArabic } from '../../hooks/useFormatArabic.js';
import { PASSAGES, getPassagesByDifficulty } from '../../data/readingPassages.js';

/**
 * ReadingExercise Component
 *
 * Reading comprehension exercises with Arabic passages.
 *
 * Features:
 * - Arabic text with RTL support
 * - Toggle English translation
 * - Toggle transliteration
 * - Highlighted vocabulary words with definitions
 * - Multiple choice comprehension questions
 * - Score tracking
 * - Difficulty filtering
 * - Keyboard controls (1-4 for answers, T for translation, Enter to continue)
 */
export default function ReadingExercise({ onBack }) {
  const formatArabic = useFormatArabic();
  const [difficulty, setDifficulty] = useState(null);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Get passages for selected difficulty
  const passages = useMemo(() => {
    return difficulty ? getPassagesByDifficulty(difficulty) : PASSAGES;
  }, [difficulty]);

  const passage = passages[currentPassageIndex];
  const question = passage?.questions[currentQuestion];
  const totalQuestions = passage?.questions.length || 0;

  // Reset when changing passage
  useEffect(() => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResults(false);
    setShowTranslation(false);
    setShowTransliteration(false);
  }, [currentPassageIndex, difficulty]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Number keys for answers (only when question is active)
      if (!showResults && question && !selectedAnswer) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= question.options.length) {
          setSelectedAnswer(num - 1);
        }
      }

      // T to toggle translation
      if (e.key.toLowerCase() === 't') {
        setShowTranslation(prev => !prev);
      }

      // Enter to continue
      if (e.key === 'Enter') {
        if (selectedAnswer !== null && !showResults) {
          handleSubmitAnswer();
        } else if (showResults && currentPassageIndex < passages.length - 1) {
          handleNextPassage();
        }
      }

      // Escape to go back
      if (e.key === 'Escape') {
        if (showResults) {
          setShowResults(false);
          setCurrentQuestion(0);
          setAnswers([]);
        } else if (difficulty !== null) {
          setDifficulty(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedAnswer, showResults, question, currentPassageIndex, passages.length, difficulty]);

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    // Move to next question or show results
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  };

  const handleNextPassage = () => {
    if (currentPassageIndex < passages.length - 1) {
      setCurrentPassageIndex(currentPassageIndex + 1);
    }
  };

  const calculateScore = () => {
    if (!passage || answers.length === 0) return 0;
    const correct = answers.filter((ans, idx) => ans === passage.questions[idx].correct).length;
    return Math.round((correct / passage.questions.length) * 100);
  };

  if (!difficulty) {
    // Difficulty selection screen
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Reading Comprehension</h1>
          <h2 style={styles.titleArabic}>فهم القراءة</h2>
          <p style={styles.subtitle}>
            Practice reading Arabic passages and answer comprehension questions
          </p>
        </div>

        <div style={styles.difficultySelector}>
          <p style={{ fontSize: '12px', marginBottom: '20px' }}>Select Difficulty Level:</p>
          {[1, 2, 3, 4].map((level) => {
            const count = getPassagesByDifficulty(level).length;
            return (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                style={{
                  ...pixelBtnGold,
                  margin: '8px',
                  minWidth: '200px',
                }}
              >
                Level {level} ({count} passages)
              </button>
            );
          })}
          <button
            onClick={() => setDifficulty('all')}
            style={{
              ...pixelBtnDark,
              margin: '8px',
              minWidth: '200px',
            }}
          >
            All Levels ({PASSAGES.length} passages)
          </button>
        </div>

        <button onClick={onBack} style={{ ...pixelBtnDark, marginTop: '20px' }}>
          Back to Mini-Games
        </button>
      </div>
    );
  }

  if (!passage) {
    return (
      <div style={styles.container}>
        <p style={styles.errorText}>No passages available for this difficulty.</p>
        <button onClick={() => setDifficulty(null)} style={pixelBtnGold}>
          Back
        </button>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const correctCount = answers.filter((ans, idx) => ans === passage.questions[idx].correct).length;

    return (
      <div style={styles.container}>
        <div style={styles.resultsPanel}>
          <h2 style={styles.resultsTitle}>Results</h2>
          <div style={styles.scoreDisplay}>
            <div style={styles.scoreNumber}>{score}%</div>
            <div style={styles.scoreDetails}>
              {correctCount} out of {totalQuestions} correct
            </div>
          </div>

          {/* Answer review */}
          <div style={styles.answerReview}>
            {passage.questions.map((q, idx) => {
              const userAnswer = answers[idx];
              const isCorrect = userAnswer === q.correct;

              return (
                <div key={idx} style={styles.reviewItem}>
                  <div style={styles.reviewQuestion}>
                    Q{idx + 1}: {q.question}
                  </div>
                  <div style={isCorrect ? styles.correctAnswer : styles.wrongAnswer}>
                    Your answer: {q.options[userAnswer]}
                    {!isCorrect && ` ✗`}
                    {isCorrect && ` ✓`}
                  </div>
                  {!isCorrect && (
                    <div style={styles.correctAnswerHint}>
                      Correct: {q.options[q.correct]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={styles.resultsActions}>
            {currentPassageIndex < passages.length - 1 && (
              <button onClick={handleNextPassage} style={pixelBtnGold}>
                Next Passage
              </button>
            )}
            <button
              onClick={() => {
                setCurrentQuestion(0);
                setSelectedAnswer(null);
                setAnswers([]);
                setShowResults(false);
              }}
              style={pixelBtnDark}
            >
              Retry
            </button>
            <button onClick={() => setDifficulty(null)} style={pixelBtnDark}>
              Back to Levels
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Progress indicator */}
      <div style={styles.progressBar}>
        <div style={styles.progressText}>
          Passage {currentPassageIndex + 1} of {passages.length} |
          Question {currentQuestion + 1} of {totalQuestions}
        </div>
      </div>

      {/* Passage title */}
      <div style={styles.passageHeader}>
        <h2 style={styles.passageTitle}>{passage.title}</h2>
        <h3 style={styles.passageTitleArabic}>{formatArabic(passage.titleArabic)}</h3>
        <div style={styles.difficultyBadge}>Level {passage.difficulty}</div>
      </div>

      {/* Arabic passage */}
      <div style={styles.passageBox}>
        <p style={styles.arabicText}>{formatArabic(passage.arabic)}</p>

        {/* Toggle buttons */}
        <div style={styles.toggleButtons}>
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            style={{
              ...pixelBtnDark,
              fontSize: '9px',
              padding: '8px 12px',
              margin: '4px',
            }}
          >
            {showTranslation ? 'Hide' : 'Show'} Translation (T)
          </button>
          <button
            onClick={() => setShowTransliteration(!showTransliteration)}
            style={{
              ...pixelBtnDark,
              fontSize: '9px',
              padding: '8px 12px',
              margin: '4px',
            }}
          >
            {showTransliteration ? 'Hide' : 'Show'} Transliteration
          </button>
        </div>

        {showTranslation && (
          <p style={styles.translationText}>{passage.english}</p>
        )}

        {showTransliteration && (
          <p style={styles.transliterationText}>{passage.transliteration}</p>
        )}
      </div>

      {/* Question */}
      <div style={styles.questionBox}>
        <p style={styles.questionText}>
          Question {currentQuestion + 1}: {question.question}
        </p>
        {question.questionArabic && (
          <p style={styles.questionArabic}>{question.questionArabic}</p>
        )}

        {/* Answer options */}
        <div style={styles.optionsGrid}>
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedAnswer(idx)}
              style={{
                ...pixelBtnGold,
                ...(selectedAnswer === idx ? styles.selectedOption : {}),
                margin: '8px 4px',
                textAlign: 'left',
                position: 'relative',
              }}
            >
              <span style={styles.optionNumber}>{idx + 1}.</span> {option}
            </button>
          ))}
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmitAnswer}
          disabled={selectedAnswer === null}
          style={{
            ...pixelBtnGold,
            marginTop: '16px',
            opacity: selectedAnswer === null ? 0.5 : 1,
            cursor: selectedAnswer === null ? 'not-allowed' : 'pointer',
          }}
        >
          Submit Answer (Enter)
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    background: COLORS.beige,
    overflow: 'auto',
    padding: '20px',
    boxSizing: 'border-box',
    fontFamily: FONTS.pixel,
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontFamily: FONTS.pixel,
    fontSize: '20px',
    color: COLORS.brown,
    margin: '0 0 10px 0',
  },
  titleArabic: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '28px',
    color: COLORS.darkGold,
    margin: '0 0 10px 0',
    direction: 'rtl',
  },
  subtitle: {
    fontSize: '10px',
    color: COLORS.brown,
    maxWidth: '600px',
    margin: '0 auto',
  },
  difficultySelector: {
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto',
  },
  progressBar: {
    background: COLORS.white,
    border: `3px solid ${COLORS.brown}`,
    padding: '12px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  progressText: {
    fontSize: '10px',
    color: COLORS.brown,
  },
  passageHeader: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  passageTitle: {
    fontSize: '16px',
    color: COLORS.brown,
    margin: '0 0 8px 0',
  },
  passageTitleArabic: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '22px',
    color: COLORS.darkGold,
    margin: '0 0 8px 0',
    direction: 'rtl',
  },
  difficultyBadge: {
    display: 'inline-block',
    background: COLORS.xpGold,
    color: COLORS.brown,
    padding: '6px 12px',
    fontSize: '8px',
    border: `2px solid ${COLORS.brown}`,
  },
  passageBox: {
    background: COLORS.white,
    border: `4px solid ${COLORS.brown}`,
    padding: '24px',
    marginBottom: '20px',
    maxWidth: '800px',
    margin: '0 auto 20px',
  },
  arabicText: {
    fontFamily: FONTS.arabicBody,
    fontSize: '20px',
    lineHeight: '1.8',
    color: COLORS.brown,
    direction: 'rtl',
    textAlign: 'right',
    margin: '0 0 16px 0',
  },
  toggleButtons: {
    textAlign: 'center',
    marginTop: '16px',
  },
  translationText: {
    fontSize: '12px',
    lineHeight: '1.6',
    color: COLORS.darkGold,
    marginTop: '16px',
    padding: '12px',
    background: COLORS.creamyBeige,
    border: `2px solid ${COLORS.oliveGreen}`,
  },
  transliterationText: {
    fontSize: '11px',
    lineHeight: '1.6',
    color: COLORS.gray,
    marginTop: '12px',
    fontStyle: 'italic',
  },
  questionBox: {
    background: COLORS.creamyBeige,
    border: `4px solid ${COLORS.brown}`,
    padding: '24px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  questionText: {
    fontSize: '12px',
    color: COLORS.brown,
    marginBottom: '8px',
    fontWeight: 'bold',
  },
  questionArabic: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '16px',
    color: COLORS.darkGold,
    direction: 'rtl',
    marginBottom: '16px',
  },
  optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  optionNumber: {
    display: 'inline-block',
    minWidth: '20px',
  },
  selectedOption: {
    background: COLORS.oliveGreen,
    transform: 'translateY(2px)',
  },
  resultsPanel: {
    maxWidth: '800px',
    margin: '0 auto',
    background: COLORS.white,
    border: `4px solid ${COLORS.brown}`,
    padding: '30px',
  },
  resultsTitle: {
    fontSize: '18px',
    textAlign: 'center',
    color: COLORS.brown,
    marginBottom: '20px',
  },
  scoreDisplay: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  scoreNumber: {
    fontSize: '48px',
    color: COLORS.xpGold,
    fontFamily: FONTS.pixel,
  },
  scoreDetails: {
    fontSize: '12px',
    color: COLORS.brown,
    marginTop: '8px',
  },
  answerReview: {
    marginBottom: '30px',
  },
  reviewItem: {
    marginBottom: '16px',
    padding: '12px',
    background: COLORS.beige,
    border: `2px solid ${COLORS.brown}`,
  },
  reviewQuestion: {
    fontSize: '10px',
    color: COLORS.brown,
    marginBottom: '6px',
  },
  correctAnswer: {
    fontSize: '10px',
    color: COLORS.green,
  },
  wrongAnswer: {
    fontSize: '10px',
    color: COLORS.red,
  },
  correctAnswerHint: {
    fontSize: '9px',
    color: COLORS.darkGold,
    marginTop: '4px',
  },
  resultsActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  errorText: {
    textAlign: 'center',
    fontSize: '12px',
    color: COLORS.red,
    marginBottom: '20px',
  },
};
