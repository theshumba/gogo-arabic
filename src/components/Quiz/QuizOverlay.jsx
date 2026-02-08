import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../../hooks/useQuiz.js';
import { EventBus } from '../../utils/eventBus.js';
import { selectWordsByDifficulty } from '../../utils/wordSelection.js';
import ArabicToEnglish from './ArabicToEnglish.jsx';
import EnglishToArabic from './EnglishToArabic.jsx';
import EnglishToTypeArabic from './EnglishToTypeArabic.jsx';
import ListenAndChoose from './ListenAndChoose.jsx';
import MatchPairs from './MatchPairs.jsx';
import ProgressBar from './ProgressBar.jsx';
import { shuffle } from '../../utils/shuffle.js';
import vocabulary from '../../data/vocabularyAll.js';
import styles from './QuizOverlay.module.css';

const QUIZ_TYPE_LABELS = {
  'ar-to-en': 'Arabic > English',
  'en-to-ar': 'English > Arabic',
  'en-to-type-ar': 'Type Arabic',
  'listen': 'Listen & Choose',
  'match': 'Match Pairs',
};

export default function QuizOverlay() {
  const { quiz, feedback, start, answer, next, close } = useQuiz();
  const overlayData = useSelector((s) => s.ui.quizConfig);
  const playerLevel = useSelector((s) => s.player.level);
  const wordsLearned = useSelector((s) => s.player.wordsLearned);
  const [showSummary, setShowSummary] = useState(false);
  const [localFeedback, setLocalFeedback] = useState(null);

  // Escape key handler - only close on summary screen or if no feedback showing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        // Allow closing on summary screen, or warn on active quiz
        if (showSummary) {
          close();
        } else if (!feedback) {
          // No answer given yet, allow closing
          if (window.confirm('Quit quiz? Progress will be lost.')) {
            close();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSummary, feedback, close]);

  useEffect(() => {
    if (!quiz.active) {
      const words = overlayData?.words || getRandomWords(5, playerLevel, wordsLearned);
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

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  const transition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.25, ease: 'easeOut' };

  const buttonProps = reduceMotion
    ? {}
    : { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } };

  if (showSummary) {
    return (
      <motion.div
        className={styles.overlay}
        onClick={close}
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={transition}
      >
        <motion.div
          className={styles.card}
          onClick={(e) => e.stopPropagation()}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={transition}
        >
          <div className={styles.summary}>
            <div className={styles.summaryTitle}>Quiz Complete</div>
            <div className={styles.summaryScore}>
              {quiz.sessionScore}/{quiz.sessionTotal}
            </div>
            <p className={styles.summaryMsg}>
              {quiz.sessionScore === quiz.sessionTotal
                ? 'Perfect score!'
                : 'Keep practicing!'}
            </p>
            <motion.button
              className={styles.closeBtn}
              onClick={close}
              {...buttonProps}
            >
              Continue
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const handleQuit = useCallback(() => {
    if (window.confirm('Quit quiz? Progress will be lost.')) {
      close();
    }
  }, [close]);

  // Match Pairs mode: show all 4 words at once
  if (quiz.active && quiz.quizType === 'match') {
    const matchWords = quiz.sessionWords.slice(0, 4);
    return (
      <motion.div
        className={styles.overlay}
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={transition}
      >
        <motion.div
          className={styles.card}
          onClick={(e) => e.stopPropagation()}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={transition}
        >
          <div className={styles.header}>
            <button className={styles.quitBtn} onClick={handleQuit}>Quit</button>
            <span>{QUIZ_TYPE_LABELS['match']}</span>
            <div style={{ width: '50px' }} />
          </div>
          <MatchPairs
            words={matchWords}
            onComplete={handleMatchComplete}
          />
        </motion.div>
      </motion.div>
    );
  }

  if (!quiz.active || !quiz.currentWord) {
    return null;
  }

  const combinedFeedback = feedback
    ? { ...feedback, selected: localFeedback?.selected }
    : null;

  // Calculate current question number (sessionTotal + 1 gives us the current question)
  const currentQuestion = quiz.sessionTotal + 1;
  const totalQuestions = quiz.sessionWords.length;

  return (
    <motion.div
      className={styles.overlay}
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={transition}
    >
      <motion.div
        className={styles.card}
        onClick={(e) => e.stopPropagation()}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={transition}
      >
        <div className={styles.header}>
          <button className={styles.quitBtn} onClick={handleQuit}>Quit</button>
          <span>{QUIZ_TYPE_LABELS[quiz.quizType] || quiz.quizType}</span>
          <span className={styles.score}>
            {quiz.sessionScore}/{quiz.sessionTotal}
          </span>
        </div>

        <ProgressBar current={currentQuestion} total={totalQuestions} />

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

        <AnimatePresence mode="wait">
          {combinedFeedback && (
            <motion.div
              className={styles.feedbackRow}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                className={`${styles.nextBtn} ${combinedFeedback.correct ? styles.nextBtnCorrect : styles.nextBtnWrong}`}
                onClick={handleNext}
                {...buttonProps}
              >
                {combinedFeedback.correct ? 'Correct! Next' : 'Next'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function getRandomWords(count, playerLevel, wordsLearned) {
  // Use adaptive selection based on player progression
  return selectWordsByDifficulty(vocabulary, count, playerLevel, wordsLearned);
}
