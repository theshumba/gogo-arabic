import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addFsrsCard, updateFsrsCard } from '../store/slices/vocabularySlice.js';
import { addXP, incrementWordsLearned } from '../store/slices/playerSlice.js';
import { incrementReviews, recordPerfectQuiz } from '../store/slices/achievementSlice.js';
import { closeQuiz } from '../store/slices/uiSlice.js';
import { createNewCard, reviewCard, Rating } from '../services/fsrs.js';
import { EventBus } from '../utils/eventBus.js';
import { XP_REWARDS } from '../utils/xpCalculator.js';
import { shuffle } from '../utils/shuffle.js';
import vocabulary from '../data/vocabularyAll.js';

function pickDistractors(correctWord, count = 3) {
  const sameCat = vocabulary.filter(
    (w) => w.category === correctWord.category && w.id !== correctWord.id
  );
  const others = vocabulary.filter(
    (w) => w.category !== correctWord.category && w.id !== correctWord.id
  );
  const pool = [...shuffle(sameCat).slice(0, 2), ...shuffle(others)];
  return shuffle(pool).slice(0, count);
}

const QUIZ_TYPES = ['ar-to-en', 'en-to-ar', 'en-to-type-ar', 'listen'];

export function useQuiz() {
  const dispatch = useDispatch();
  const fsrsCards = useSelector((s) => s.vocabulary.fsrsCards);

  const [quizState, setQuizState] = useState({
    active: false,
    quizType: null,
    sessionWords: [],
    currentWord: null,
    choices: [],
    sessionScore: 0,
    sessionTotal: 0,
  });
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);

  function buildChoices(word, type) {
    const distractors = pickDistractors(word);
    if (type === 'ar-to-en' || type === 'listen') {
      return shuffle([
        { label: word.english, value: word.english, correct: true },
        ...distractors.map((d) => ({ label: d.english, value: d.english, correct: false })),
      ]);
    } else if (type === 'en-to-ar') {
      return shuffle([
        { label: word.arabic, value: word.arabic, correct: true },
        ...distractors.map((d) => ({ label: d.arabic, value: d.arabic, correct: false })),
      ]);
    }
    return [];
  }

  function loadQuestion(words, idx, type) {
    if (idx >= words.length) return;
    const word = words[idx];
    const choices = buildChoices(word, type);
    setQuizState((prev) => ({ ...prev, currentWord: word, choices }));
    setFeedback(null);
  }

  const start = useCallback((words, quizType) => {
    const type = quizType || QUIZ_TYPES[Math.floor(Math.random() * QUIZ_TYPES.length)];
    const shuffled = shuffle(words);
    setQuizState({
      active: true,
      quizType: type,
      sessionWords: shuffled,
      currentWord: null,
      choices: [],
      sessionScore: 0,
      sessionTotal: 0,
    });
    setQuestionIndex(0);
    setFeedback(null);

    // For match type, we don't need to load individual questions
    if (type === 'match') {
      setQuizState((prev) => ({
        ...prev,
        currentWord: shuffled[0] || null,
      }));
      return;
    }

    const word = shuffled[0];
    if (word) {
      const choices = buildChoices(word, type);
      setQuizState((prev) => ({ ...prev, currentWord: word, choices }));
    }
  }, []);

  const answer = useCallback((userAnswer) => {
    const word = quizState.currentWord;
    if (!word) return;

    let correct = false;
    if (quizState.quizType === 'ar-to-en' || quizState.quizType === 'listen') {
      correct = userAnswer === word.english;
    } else if (quizState.quizType === 'en-to-ar') {
      correct = userAnswer === word.arabic;
    } else if (quizState.quizType === 'match') {
      correct = userAnswer === word.english;
    } else {
      const normalize = (s) => s.replace(/[\u064B-\u065F\u0670]/g, '').trim();
      correct = normalize(userAnswer) === normalize(word.arabic);
    }

    setQuizState((prev) => ({
      ...prev,
      sessionScore: prev.sessionScore + (correct ? 1 : 0),
      sessionTotal: prev.sessionTotal + 1,
    }));

    // FSRS card management
    if (!fsrsCards[word.id]) {
      dispatch(addFsrsCard({ wordId: word.id, card: createNewCard() }));
      dispatch(incrementWordsLearned());
    }
    const rating = correct ? Rating.Good : Rating.Again;
    const currentCard = fsrsCards[word.id]?.card || createNewCard();
    const result = reviewCard(currentCard, rating);
    dispatch(updateFsrsCard({ wordId: word.id, card: result.card, log: result.log }));

    // Track review for achievement progress
    dispatch(incrementReviews());

    if (correct) {
      dispatch(addXP(XP_REWARDS.CORRECT_ANSWER));
    }

    const correctAnswer = (quizState.quizType === 'ar-to-en' || quizState.quizType === 'listen')
      ? word.english
      : word.arabic;
    setFeedback({ correct, correctAnswer });
  }, [quizState, fsrsCards, dispatch]);

  const next = useCallback(() => {
    const words = quizState.sessionWords;
    const nextIdx = questionIndex + 1;
    if (nextIdx >= words.length) {
      if (quizState.sessionScore === quizState.sessionTotal && quizState.sessionTotal > 0) {
        dispatch(addXP(XP_REWARDS.PERFECT_QUIZ));
        // Track perfect quiz for achievement progress
        dispatch(recordPerfectQuiz());
      }
      return true;
    }
    setQuestionIndex(nextIdx);
    loadQuestion(words, nextIdx, quizState.quizType);
    return false;
  }, [questionIndex, quizState, dispatch]);

  const close = useCallback(() => {
    setQuizState({
      active: false,
      quizType: null,
      sessionWords: [],
      currentWord: null,
      choices: [],
      sessionScore: 0,
      sessionTotal: 0,
    });
    dispatch(closeQuiz());
    EventBus.emit('unfreeze-player');
  }, [dispatch]);

  const quiz = {
    active: quizState.active,
    quizType: quizState.quizType,
    sessionWords: quizState.sessionWords,
    currentWord: quizState.currentWord,
    choices: quizState.choices,
    sessionScore: quizState.sessionScore,
    sessionTotal: quizState.sessionTotal,
  };

  return { quiz, feedback, start, answer, next, close };
}
