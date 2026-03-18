import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addFsrsCard, updateFsrsCard } from '../store/slices/vocabularySlice.js';
import { addXP, incrementWordsLearned } from '../store/slices/playerSlice.js';
import { incrementReviews, recordPerfectQuiz } from '../store/slices/achievementSlice.js';
import { closeQuiz } from '../store/slices/uiSlice.js';
import { createNewCard, reviewCard, Rating } from '../services/fsrs.js';
import { EventBus } from '../utils/eventBus.js';
import { EVENTS } from '../utils/eventBusTypes.js';
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

const QUIZ_TYPES = [
  'ar-to-en',
  'en-to-ar',
  'en-to-type-ar',
  'listen',
  'root-identify',
  'fill-blank',
  'transliterate',
  'picture-word',
  'conjugation',
];

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
    }

    if (type === 'en-to-ar') {
      return shuffle([
        { label: word.arabic, value: word.arabic, correct: true },
        ...distractors.map((d) => ({ label: d.arabic, value: d.arabic, correct: false })),
      ]);
    }

    // root-identify: show 4 possible roots (trilateral letters)
    if (type === 'root-identify') {
      const correctRoot = word.root || word.rootLetters || word.arabic.slice(0, 3);
      const distRoots = distractors.map((d) => d.root || d.rootLetters || d.arabic.slice(0, 3));
      return shuffle([
        { label: correctRoot, value: correctRoot, correct: true },
        ...distRoots.map((r) => ({ label: r, value: r, correct: false })),
      ]);
    }

    // fill-blank: Arabic choices (same as en-to-ar)
    if (type === 'fill-blank') {
      return shuffle([
        { label: word.arabic, value: word.arabic, correct: true },
        ...distractors.map((d) => ({ label: d.arabic, value: d.arabic, correct: false })),
      ]);
    }

    // picture-word: Arabic choices with english hint embedded
    if (type === 'picture-word') {
      return shuffle([
        { label: word.arabic, value: word.arabic, correct: true, english: word.english },
        ...distractors.map((d) => ({ label: d.arabic, value: d.arabic, correct: false, english: d.english })),
      ]);
    }

    // conjugation: use arabic choices as stand-ins for conjugated forms
    if (type === 'conjugation') {
      const PRONOUNS = [
        { en: 'I (أنا)', ar: 'أنا' },
        { en: 'You m. (أنتَ)', ar: 'أنتَ' },
        { en: 'You f. (أنتِ)', ar: 'أنتِ' },
        { en: 'He (هو)', ar: 'هو' },
        { en: 'She (هي)', ar: 'هي' },
        { en: 'We (نحن)', ar: 'نحن' },
      ];
      const pronoun = PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)];
      return shuffle([
        { label: word.arabic, value: word.arabic, correct: true, pronoun },
        ...distractors.map((d) => ({ label: d.arabic, value: d.arabic, correct: false, pronoun })),
      ]);
    }

    // sentence-build: tiles are the words of the example sentence (or word itself split)
    if (type === 'sentence-build') {
      const sentence = word.exampleSentence?.arabic || word.arabic;
      // Split on spaces, strip leading/trailing punctuation but preserve Arabic letters
      const tiles = sentence
        .split(/\s+/)
        .map((t) => t.trim())
        .filter(Boolean);
      return tiles.map((t, i) => ({ label: t, value: t, correct: i === 0, tile: true }));
    }

    // category-sort: 6 words split between this word's category and a neighbouring category
    if (type === 'category-sort') {
      const sameCat = vocabulary
        .filter((w) => w.category === word.category && w.id !== word.id)
        .slice(0, 2);
      const otherCat = distractors.slice(0, 3);
      const allWords = [
        ...shuffle([word, ...sameCat]).slice(0, 3).map((w) => ({
          label: w.arabic, value: w.arabic, correct: true, category: word.category,
        })),
        ...shuffle(otherCat).slice(0, 3).map((w) => ({
          label: w.arabic, value: w.arabic, correct: false, category: w.category,
        })),
      ];
      return shuffle(allWords);
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

    const normalize = (s) => s.replace(/[\u064B-\u065F\u0670]/g, '').trim();

    let correct = false;
    if (quizState.quizType === 'ar-to-en' || quizState.quizType === 'listen') {
      correct = userAnswer === word.english;
    } else if (quizState.quizType === 'en-to-ar') {
      correct = userAnswer === word.arabic;
    } else if (quizState.quizType === 'match') {
      correct = userAnswer === word.english;
    } else if (quizState.quizType === 'root-identify') {
      const correctRoot = word.root || word.rootLetters || word.arabic.slice(0, 3);
      correct = normalize(userAnswer) === normalize(correctRoot);
    } else if (quizState.quizType === 'fill-blank' || quizState.quizType === 'picture-word' || quizState.quizType === 'conjugation') {
      correct = normalize(userAnswer) === normalize(word.arabic);
    } else if (quizState.quizType === 'transliterate') {
      const correctTranslit = (word.transliteration || word.arabic).toLowerCase().trim();
      correct = userAnswer.toLowerCase().trim() === correctTranslit;
    } else if (quizState.quizType === 'sentence-build') {
      const expectedSentence = (word.exampleSentence?.arabic || word.arabic)
        .split(/\s+/)
        .map((t) => t.trim())
        .filter(Boolean)
        .join(' ');
      correct = normalize(userAnswer) === normalize(expectedSentence);
    } else if (quizState.quizType === 'category-sort') {
      // userAnswer is JSON of { [catA]: [...tiles], [catB]: [...tiles] }
      try {
        const buckets = JSON.parse(userAnswer);
        const allCorrect = Object.entries(buckets).every(([cat, tiles]) =>
          tiles.every((tile) => {
            const vocabWord = vocabulary.find((w) => normalize(w.arabic) === normalize(tile.label || tile));
            return vocabWord ? vocabWord.category === cat : false;
          })
        );
        correct = allCorrect;
      } catch {
        correct = false;
      }
    } else {
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

    let correctAnswer;
    if (quizState.quizType === 'ar-to-en' || quizState.quizType === 'listen') {
      correctAnswer = word.english;
    } else if (quizState.quizType === 'transliterate') {
      correctAnswer = word.transliteration || word.arabic;
    } else if (quizState.quizType === 'root-identify') {
      correctAnswer = word.root || word.rootLetters || word.arabic.slice(0, 3);
    } else if (quizState.quizType === 'sentence-build') {
      correctAnswer = word.exampleSentence?.arabic || word.arabic;
    } else {
      correctAnswer = word.arabic;
    }
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
    EventBus.emit(EVENTS.PLAYER_UNFREEZE);
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
