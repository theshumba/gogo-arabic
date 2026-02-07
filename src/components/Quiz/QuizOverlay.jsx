import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useQuiz } from '../../hooks/useQuiz.js';
import { EventBus } from '../../utils/eventBus.js';
import ArabicToEnglish from './ArabicToEnglish.jsx';
import EnglishToArabic from './EnglishToArabic.jsx';
import EnglishToTypeArabic from './EnglishToTypeArabic.jsx';
import ListenAndChoose from './ListenAndChoose.jsx';
import MatchPairs from './MatchPairs.jsx';
import vocabulary from '../../data/vocabulary.json';
import { COLORS, FONTS, pixelBtn, pixelBtnGold, pixelPanel } from '../../styles/theme.js';

const QUIZ_TYPE_LABELS = {
  'ar-to-en': 'Arabic > English',
  'en-to-ar': 'English > Arabic',
  'en-to-type-ar': 'Type Arabic',
  'listen': 'Listen & Choose',
  'match': 'Match Pairs',
};

const styles = {
  overlay: {
    position: 'absolute',
    inset: 0,
    background: COLORS.overlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  card: {
    ...pixelPanel,
    background: COLORS.beige,
    border: `4px solid ${COLORS.dark}`,
    padding: '24px 28px',
    color: COLORS.dark,
    textAlign: 'center',
    minWidth: '420px',
    maxWidth: '620px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: `
      inset -4px -4px 0px 0px rgba(0,0,0,0.08),
      inset 4px 4px 0px 0px rgba(255,255,255,0.4),
      8px 8px 0px 0px rgba(0,0,0,0.3)
    `,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: `2px solid ${COLORS.brown}`,
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.brown,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  score: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.gold,
  },
  feedbackRow: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  },
  nextBtn: {
    ...pixelBtn,
    fontSize: '10px',
    padding: '12px 24px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  nextBtnCorrect: {
    background: COLORS.green,
    color: COLORS.white,
    boxShadow: `
      inset -4px -4px 0px 0px rgba(0,0,0,0.2),
      inset 4px 4px 0px 0px rgba(255,255,255,0.2),
      0 4px 0 0 #1a9950
    `,
  },
  nextBtnWrong: {
    background: COLORS.red,
    color: COLORS.white,
    boxShadow: `
      inset -4px -4px 0px 0px rgba(0,0,0,0.2),
      inset 4px 4px 0px 0px rgba(255,255,255,0.2),
      0 4px 0 0 #a01010
    `,
  },
  summary: {
    textAlign: 'center',
    fontFamily: FONTS.pixel,
  },
  summaryTitle: {
    fontFamily: FONTS.pixel,
    fontSize: '14px',
    color: COLORS.brown,
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '8px',
  },
  summaryScore: {
    fontFamily: FONTS.pixel,
    fontSize: '36px',
    color: COLORS.gold,
    margin: '16px 0',
    textShadow: `2px 2px 0px ${COLORS.brown}`,
  },
  summaryMsg: {
    fontFamily: FONTS.pixel,
    fontSize: '8px',
    color: COLORS.brown,
    marginBottom: '8px',
  },
  closeBtn: {
    ...pixelBtnGold,
    marginTop: '20px',
    fontSize: '11px',
    padding: '14px 32px',
  },
};

export default function QuizOverlay() {
  const { quiz, feedback, start, answer, next, close } = useQuiz();
  const overlayData = useSelector((s) => s.ui.quizConfig);
  const [showSummary, setShowSummary] = useState(false);
  const [localFeedback, setLocalFeedback] = useState(null);

  useEffect(() => {
    if (!quiz.active) {
      const words = overlayData?.words || getRandomWords(5);
      const type = overlayData?.quizType || null;
      start(words, type);
      setShowSummary(false);
      setLocalFeedback(null);
    }
  }, []);

  const handleAnswer = useCallback((userAnswer) => {
    answer(userAnswer);
    setLocalFeedback({ selected: userAnswer });
    // Determine correctness to play the right SFX
    const word = quiz.currentWord;
    if (word) {
      const isCorrect =
        (quiz.quizType === 'ar-to-en' || quiz.quizType === 'listen')
          ? userAnswer === word.english
          : (quiz.quizType === 'en-to-ar')
            ? userAnswer === word.arabic
            : userAnswer.replace(/[\u064B-\u065F\u0670]/g, '').trim() === word.arabic.replace(/[\u064B-\u065F\u0670]/g, '').trim();
      EventBus.emit(isCorrect ? 'sfx-correct' : 'sfx-wrong');
    }
  }, [answer, quiz.currentWord, quiz.quizType]);

  const handleNext = useCallback(() => {
    const done = next();
    if (done) {
      setShowSummary(true);
      EventBus.emit('sfx-quest');
    }
    setLocalFeedback(null);
  }, [next]);

  const handleMatchComplete = useCallback((perfect) => {
    // Match pairs counts as one question — score all correct if perfect
    const matchWords = quiz.sessionWords.slice(0, 4);
    matchWords.forEach((w, i) => {
      answer(perfect ? w.english : (i === 0 ? 'wrong' : w.english));
    });
    setShowSummary(true);
    EventBus.emit('sfx-quest');
  }, [quiz.sessionWords, answer]);

  if (showSummary) {
    return (
      <div style={styles.overlay}>
        <div style={styles.card}>
          <div style={styles.summary}>
            <div style={styles.summaryTitle}>Quiz Complete</div>
            <div style={styles.summaryScore}>
              {quiz.sessionScore}/{quiz.sessionTotal}
            </div>
            <p style={styles.summaryMsg}>
              {quiz.sessionScore === quiz.sessionTotal
                ? 'Perfect score!'
                : 'Keep practicing!'}
            </p>
            <button style={styles.closeBtn} onClick={close}>
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Match Pairs mode: show all 4 words at once
  if (quiz.active && quiz.quizType === 'match') {
    const matchWords = quiz.sessionWords.slice(0, 4);
    return (
      <div style={styles.overlay}>
        <div style={styles.card}>
          <div style={styles.header}>
            <span>{QUIZ_TYPE_LABELS['match']}</span>
          </div>
          <MatchPairs
            words={matchWords}
            onComplete={handleMatchComplete}
          />
        </div>
      </div>
    );
  }

  if (!quiz.active || !quiz.currentWord) {
    return null;
  }

  const combinedFeedback = feedback
    ? { ...feedback, selected: localFeedback?.selected }
    : null;

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span>{QUIZ_TYPE_LABELS[quiz.quizType] || quiz.quizType}</span>
          <span style={styles.score}>
            {quiz.sessionScore}/{quiz.sessionTotal}
          </span>
        </div>

        {quiz.quizType === 'ar-to-en' && (
          <ArabicToEnglish
            word={quiz.currentWord}
            choices={quiz.choices}
            feedback={combinedFeedback}
            onAnswer={handleAnswer}
          />
        )}

        {quiz.quizType === 'en-to-ar' && (
          <EnglishToArabic
            word={quiz.currentWord}
            choices={quiz.choices}
            feedback={combinedFeedback}
            onAnswer={handleAnswer}
          />
        )}

        {quiz.quizType === 'en-to-type-ar' && (
          <EnglishToTypeArabic
            word={quiz.currentWord}
            feedback={combinedFeedback}
            onAnswer={handleAnswer}
          />
        )}

        {quiz.quizType === 'listen' && (
          <ListenAndChoose
            word={quiz.currentWord}
            choices={quiz.choices}
            feedback={combinedFeedback}
            onAnswer={handleAnswer}
          />
        )}

        {combinedFeedback && (
          <div style={styles.feedbackRow}>
            <button
              style={{
                ...styles.nextBtn,
                ...(combinedFeedback.correct ? styles.nextBtnCorrect : styles.nextBtnWrong),
              }}
              onClick={handleNext}
            >
              {combinedFeedback.correct ? 'Correct! Next' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function getRandomWords(count) {
  const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
