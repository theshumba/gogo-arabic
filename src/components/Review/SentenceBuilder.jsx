import { useState, useEffect, useCallback } from 'react';
import { COLORS, FONTS } from '../../styles/theme.js';
import { validateSentence } from '../../utils/sentenceParser.js';

const styles = {
  container: {
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  englishPrompt: {
    fontFamily: FONTS.pixel,
    fontSize: '14px',
    color: COLORS.beige,
    textAlign: 'center',
    marginBottom: '8px',
    lineHeight: '1.6',
  },
  targetWordHint: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.lightGray,
    textAlign: 'center',
    marginBottom: '12px',
  },
  targetWordHighlight: {
    color: COLORS.xpGold,
    fontWeight: 'bold',
  },
  answerArea: {
    minHeight: '80px',
    background: COLORS.dark,
    border: `4px solid ${COLORS.gray}`,
    padding: '12px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'center',
    direction: 'rtl',
    borderRadius: '0px',
    boxShadow: `
      inset -4px -4px 0px 0px rgba(0,0,0,0.4),
      inset 4px 4px 0px 0px rgba(255,255,255,0.05)
    `,
  },
  answerAreaCorrect: {
    borderColor: COLORS.green,
    background: '#1a2e1a',
    animation: 'pulse 0.5s ease-in-out',
  },
  answerAreaWrong: {
    borderColor: COLORS.red,
    background: '#2e1a1a',
    animation: 'shake 0.5s ease-in-out',
  },
  emptyHint: {
    fontFamily: FONTS.pixel,
    fontSize: '8px',
    color: COLORS.lightGray,
    fontStyle: 'italic',
  },
  wordTile: {
    fontFamily: FONTS.arabic,
    fontSize: '24px',
    padding: '8px 16px',
    background: COLORS.beige,
    border: `4px solid ${COLORS.dark}`,
    color: COLORS.dark,
    cursor: 'pointer',
    borderRadius: '0px',
    transition: 'all 0.1s',
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.1),
      inset 3px 3px 0px 0px rgba(255,255,255,0.5),
      0 4px 0 0 ${COLORS.brown}
    `,
    userSelect: 'none',
    direction: 'rtl',
  },
  wordTileHover: {
    transform: 'translateY(-2px)',
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.1),
      inset 3px 3px 0px 0px rgba(255,255,255,0.5),
      0 6px 0 0 ${COLORS.brown}
    `,
  },
  wordTileInAnswer: {
    background: COLORS.xpGold,
    borderColor: COLORS.brown,
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.15),
      inset 3px 3px 0px 0px rgba(255,255,255,0.4),
      0 4px 0 0 #a0842a
    `,
  },
  wordTileDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  divider: {
    height: '2px',
    background: COLORS.gray,
    margin: '8px 0',
  },
  tilesArea: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
    direction: 'rtl',
  },
  feedbackArea: {
    textAlign: 'center',
    marginTop: '12px',
  },
  transliterationText: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.lightGray,
    fontStyle: 'italic',
    marginTop: '8px',
  },
  correctSentence: {
    fontFamily: FONTS.arabic,
    fontSize: '28px',
    direction: 'rtl',
    color: COLORS.green,
    marginTop: '12px',
    lineHeight: '1.6',
  },
  instructionsText: {
    fontFamily: FONTS.pixel,
    fontSize: '7px',
    color: COLORS.lightGray,
    textAlign: 'center',
    marginTop: '8px',
  },
};

// CSS keyframes for animations (injected once)
const injectAnimations = () => {
  if (typeof document === 'undefined' || document.getElementById('sentence-builder-animations')) return;

  const styleSheet = document.createElement('style');
  styleSheet.id = 'sentence-builder-animations';
  styleSheet.textContent = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-8px); }
      75% { transform: translateX(8px); }
    }
  `;
  document.head.appendChild(styleSheet);
};

export default function SentenceBuilder({
  quizData,
  onComplete,
  disabled = false,
}) {
  const [userAnswer, setUserAnswer] = useState([]);
  const [availableWords, setAvailableWords] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    injectAnimations();
  }, []);

  useEffect(() => {
    if (quizData && quizData.allWords) {
      setAvailableWords([...quizData.allWords]);
      setUserAnswer([]);
      setIsSubmitted(false);
      setIsCorrect(false);
      setAttempts(0);
    }
  }, [quizData]);

  const handleTileClick = useCallback((word, isInAnswer) => {
    if (disabled || isSubmitted) return;

    if (isInAnswer) {
      // Remove from answer, add back to available
      setUserAnswer(prev => prev.filter(w => w !== word));
      setAvailableWords(prev => [...prev, word]);
    } else {
      // Add to answer, remove from available
      setUserAnswer(prev => [...prev, word]);
      setAvailableWords(prev => prev.filter(w => w !== word));
    }
  }, [disabled, isSubmitted]);

  const handleSubmit = useCallback(() => {
    if (disabled || isSubmitted || userAnswer.length === 0) return;

    const correct = validateSentence(userAnswer, quizData.correctWords);
    setIsCorrect(correct);
    setIsSubmitted(true);
    setAttempts(prev => prev + 1);

    if (onComplete) {
      onComplete({
        correct,
        attempts: attempts + 1,
        userAnswer,
        correctAnswer: quizData.correctWords,
      });
    }
  }, [disabled, isSubmitted, userAnswer, quizData, onComplete, attempts]);

  const handleReset = useCallback(() => {
    if (disabled || !isSubmitted || isCorrect) return;

    setAvailableWords([...quizData.allWords]);
    setUserAnswer([]);
    setIsSubmitted(false);
  }, [disabled, isSubmitted, isCorrect, quizData]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (disabled) return;

      if (e.key === 'Enter' && !isSubmitted) {
        handleSubmit();
      } else if (e.key === 'Backspace' && !isSubmitted && userAnswer.length > 0) {
        e.preventDefault();
        const lastWord = userAnswer[userAnswer.length - 1];
        handleTileClick(lastWord, true);
      } else if (e.key === 'Escape' && isSubmitted && !isCorrect) {
        handleReset();
      } else if (e.key >= '1' && e.key <= '9' && !isSubmitted) {
        const index = parseInt(e.key) - 1;
        if (index < availableWords.length) {
          handleTileClick(availableWords[index], false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, isSubmitted, isCorrect, userAnswer, availableWords, handleSubmit, handleTileClick, handleReset]);

  if (!quizData) {
    return (
      <div style={styles.container}>
        <div style={styles.englishPrompt}>No sentence data available</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* English prompt */}
      <div style={styles.englishPrompt}>
        {quizData.englishSentence}
      </div>

      {/* Target word hint */}
      <div style={styles.targetWordHint}>
        Build the Arabic sentence using:{' '}
        <span style={styles.targetWordHighlight}>
          {quizData.targetWordEnglish}
        </span>
      </div>

      {/* Answer area */}
      <div
        style={{
          ...styles.answerArea,
          ...(isSubmitted && isCorrect ? styles.answerAreaCorrect : {}),
          ...(isSubmitted && !isCorrect ? styles.answerAreaWrong : {}),
        }}
      >
        {userAnswer.length === 0 ? (
          <div style={styles.emptyHint}>Tap words below to build the sentence</div>
        ) : (
          userAnswer.map((word, index) => (
            <button
              key={`answer-${index}`}
              style={{
                ...styles.wordTile,
                ...styles.wordTileInAnswer,
                ...(isSubmitted ? styles.wordTileDisabled : {}),
              }}
              onClick={() => handleTileClick(word, true)}
              disabled={isSubmitted}
              onMouseEnter={(e) => {
                if (!isSubmitted) {
                  Object.assign(e.target.style, styles.wordTileHover);
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitted) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = styles.wordTileInAnswer.boxShadow;
                }
              }}
            >
              {word}
            </button>
          ))
        )}
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Available word tiles */}
      <div style={styles.tilesArea}>
        {availableWords.map((word, index) => (
          <button
            key={`tile-${index}`}
            style={{
              ...styles.wordTile,
              ...(isSubmitted ? styles.wordTileDisabled : {}),
            }}
            onClick={() => handleTileClick(word, false)}
            disabled={isSubmitted}
            onMouseEnter={(e) => {
              if (!isSubmitted) {
                Object.assign(e.target.style, styles.wordTileHover);
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitted) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = styles.wordTile.boxShadow;
              }
            }}
          >
            {word}
          </button>
        ))}
      </div>

      {/* Feedback area */}
      {isSubmitted && (
        <div style={styles.feedbackArea}>
          {isCorrect ? (
            <>
              <div style={styles.correctSentence}>
                {quizData.correctWords.join(' ')}
              </div>
              {quizData.transliteration && (
                <div style={styles.transliterationText}>
                  {quizData.transliteration}
                </div>
              )}
            </>
          ) : (
            <>
              <div style={styles.correctSentence}>
                Correct: {quizData.correctWords.join(' ')}
              </div>
              {quizData.transliteration && (
                <div style={styles.transliterationText}>
                  {quizData.transliteration}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Instructions */}
      {!isSubmitted && (
        <div style={styles.instructionsText}>
          Keyboard: 1-9 to select tiles | Backspace to undo | Enter to submit
        </div>
      )}
    </div>
  );
}
