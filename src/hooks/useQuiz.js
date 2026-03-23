import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addFsrsCard, updateFsrsCard } from '../store/slices/vocabularySlice.js';
import { addXP, incrementWordsLearned } from '../store/slices/playerSlice.js';
import { incrementReviews, recordPerfectQuiz, recordQuizTypeResult } from '../store/slices/achievementSlice.js';
import { closeQuiz } from '../store/slices/uiSlice.js';
import { createNewCard, reviewCard, Rating } from '../services/fsrs.js';
import { EventBus } from '../utils/eventBus.js';
import { EVENTS } from '../utils/eventBusTypes.js';
import { XP_REWARDS } from '../utils/xpCalculator.js';
import { shuffle } from '../utils/shuffle.js';
import vocabulary from '../data/vocabularyAll.js';
import { QUIZ_TYPE_REGISTRY, selectQuizTypeForPlayer } from '../data/quizTypes.js';
import { selectCefrLevel } from '../store/slices/cefrProgressSlice.js';
import { VERB_PARADIGMS } from '../components/Quiz/GrammarFill.jsx';

export function isFsrsDue(card) {
  if (!card || !card.due) return true;
  return new Date(card.due) <= new Date();
}

export function getDistractorTier(score, total) {
  if (total < 3) return 'normal';
  const accuracy = score / total;
  if (accuracy < 0.70) return 'easy';
  if (accuracy > 0.85) return 'hard';
  return 'normal';
}

export function pickDistractors(correctWord, count = 3, tier = 'normal') {
  const sameCat = vocabulary.filter(
    (w) => w.category === correctWord.category && w.id !== correctWord.id
  );
  const others = vocabulary.filter(
    (w) => w.category !== correctWord.category && w.id !== correctWord.id
  );

  if (tier === 'hard') {
    const sameDifficulty = sameCat.filter(w => w.difficulty === correctWord.difficulty);
    const pool = sameDifficulty.length >= count
      ? sameDifficulty
      : [...sameDifficulty, ...sameCat];
    return shuffle(pool).slice(0, count);
  }

  if (tier === 'easy') {
    // Easy: guarantee at least (count - 1) cross-category distractors for clearly wrong answers
    const crossCount = Math.min(count - 1, others.length);
    const crossPool = shuffle(others).slice(0, crossCount);
    const remaining = count - crossPool.length;
    const fillPool = remaining > 0 ? shuffle(sameCat).slice(0, remaining) : [];
    return shuffle([...crossPool, ...fillPool]).slice(0, count);
  }

  // Normal: existing behavior
  const pool = [...shuffle(sameCat).slice(0, 2), ...shuffle(others)];
  return shuffle(pool).slice(0, count);
}

export function useQuiz() {
  const dispatch = useDispatch();
  const fsrsCards = useSelector((s) => s.vocabulary.fsrsCards);
  const cefrLevel = useSelector(selectCefrLevel);
  const playerLevel = useSelector((s) => s.player.level);

  const [quizState, setQuizState] = useState({
    active: false,
    quizType: null,
    lockedType: null,
    sessionWords: [],
    currentWord: null,
    choices: [],
    sessionScore: 0,
    sessionTotal: 0,
    clusterAccuracy: {},
    fsrsDueOverride: false,
    distractorTier: 'normal',
  });
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);

  function buildChoices(word, type, tier = 'normal') {
    const distractors = pickDistractors(word, 3, tier);

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

    // GrammarFill: conjugation fill-in-blank from embedded VERB_PARADIGMS
    if (type === 'GrammarFill') {
      const idx = word.id ? word.id.charCodeAt(0) % VERB_PARADIGMS.length : 0;
      const paradigm = VERB_PARADIGMS[idx];
      const paradigmContext = {
        verb: paradigm.verb,
        root: paradigm.root,
        meaning: paradigm.meaning,
        paradigm: paradigm.paradigm,
        pronoun: paradigm.pronoun,
      };
      return shuffle([
        { label: paradigm.correctForm, value: paradigm.correctForm, correct: true, paradigmContext },
        ...paradigm.distractors.map((f) => ({ label: f, value: f, correct: false, paradigmContext })),
      ]);
    }

    // WordOrder: tiles are the words of the example sentence (or word itself)
    if (type === 'WordOrder') {
      const sentence = word.exampleSentence?.arabic || word.arabic;
      const tiles = sentence.split(/\s+/).map((t) => t.trim()).filter(Boolean);
      return tiles.map((t, i) => ({ label: t, value: t, correct: i === 0, tile: true }));
    }

    // ClozePassage: Arabic choices (same as fill-blank)
    if (type === 'ClozePassage') {
      return shuffle([
        { label: word.arabic, value: word.arabic, correct: true },
        ...distractors.map((d) => ({ label: d.arabic, value: d.arabic, correct: false })),
      ]);
    }

    return [];
  }

  function loadQuestion(words, idx, type, fsrsCardsRef, pLevel, cLevel) {
    if (idx >= words.length) return;
    const word = words[idx];
    const card = fsrsCardsRef?.[word.id]?.card;
    const isDue = isFsrsDue(card);
    setQuizState((prev) => {
      const tier = getDistractorTier(prev.sessionScore, prev.sessionTotal);
      // Re-evaluate quiz type based on accumulated cluster accuracy (format routing)
      // Respect lockedType when caller explicitly specified a quiz type at session start
      const effectiveType = prev.lockedType
        ? prev.lockedType
        : selectQuizTypeForPlayer(prev.clusterAccuracy, pLevel, cLevel);
      const choices = buildChoices(word, effectiveType, tier);
      return { ...prev, currentWord: word, choices, quizType: effectiveType, fsrsDueOverride: isDue, distractorTier: tier };
    });
    setFeedback(null);
  }

  const start = useCallback((words, quizType) => {
    const type = quizType || selectQuizTypeForPlayer(
      {},  // empty clusterAccuracy at session start
      playerLevel,
      cefrLevel
    );
    const shuffled = shuffle(words);
    setQuizState({
      active: true,
      quizType: type,
      lockedType: quizType || null,
      sessionWords: shuffled,
      currentWord: null,
      choices: [],
      sessionScore: 0,
      sessionTotal: 0,
      clusterAccuracy: {},
      fsrsDueOverride: false,
      distractorTier: 'normal',
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
      const card = fsrsCards[word.id]?.card;
      const isDue = isFsrsDue(card);
      const tier = 'normal'; // first question always normal (0 answers so far)
      const choices = buildChoices(word, type, tier);
      setQuizState((prev) => ({ ...prev, currentWord: word, choices, fsrsDueOverride: isDue }));
    }
  }, [fsrsCards, playerLevel, cefrLevel]);

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
    } else if (quizState.quizType === 'GrammarFill') {
      // Grade against the correct conjugated form in choices, NOT word.arabic
      const correctForm = quizState.choices.find((c) => c.correct)?.value || '';
      correct = normalize(userAnswer) === normalize(correctForm);
    } else if (quizState.quizType === 'WordOrder') {
      const expectedSentence = (word.exampleSentence?.arabic || word.arabic)
        .split(/\s+/).map((t) => t.trim()).filter(Boolean).join(' ');
      correct = normalize(userAnswer) === normalize(expectedSentence);
    } else if (quizState.quizType === 'ClozePassage') {
      correct = normalize(userAnswer) === normalize(word.arabic);
    } else {
      correct = normalize(userAnswer) === normalize(word.arabic);
    }

    const cluster = QUIZ_TYPE_REGISTRY[quizState.quizType]?.cluster ?? 'vocabulary';
    setQuizState((prev) => ({
      ...prev,
      sessionScore: prev.sessionScore + (correct ? 1 : 0),
      sessionTotal: prev.sessionTotal + 1,
      clusterAccuracy: {
        ...prev.clusterAccuracy,
        [cluster]: {
          correct: (prev.clusterAccuracy[cluster]?.correct ?? 0) + (correct ? 1 : 0),
          total: (prev.clusterAccuracy[cluster]?.total ?? 0) + 1,
        },
      },
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
    } else if (quizState.quizType === 'GrammarFill') {
      correctAnswer = quizState.choices.find((c) => c.correct)?.value || word.arabic;
    } else if (quizState.quizType === 'WordOrder') {
      correctAnswer = word.exampleSentence?.arabic || word.arabic;
    } else if (quizState.quizType === 'ClozePassage') {
      correctAnswer = word.arabic;
    } else {
      correctAnswer = word.arabic;
    }
    setFeedback({ correct, correctAnswer });
  }, [quizState, fsrsCards, dispatch]);

  const next = useCallback(() => {
    const words = quizState.sessionWords;
    const nextIdx = questionIndex + 1;
    if (nextIdx >= words.length) {
      const wasPerfect = quizState.sessionScore === quizState.sessionTotal && quizState.sessionTotal > 0;
      if (wasPerfect) {
        dispatch(addXP(XP_REWARDS.PERFECT_QUIZ));
        // Track perfect quiz for achievement progress
        dispatch(recordPerfectQuiz());
      }
      // Track per-quiz-type streak for quiz_type_streak achievements
      if (quizState.quizType) {
        dispatch(recordQuizTypeResult({ quizType: quizState.quizType, perfect: wasPerfect }));
      }
      return true;
    }
    setQuestionIndex(nextIdx);
    loadQuestion(words, nextIdx, quizState.quizType, fsrsCards, playerLevel, cefrLevel);
    return false;
  }, [questionIndex, quizState, dispatch, playerLevel, cefrLevel]);

  const close = useCallback(() => {
    setQuizState({
      active: false,
      quizType: null,
      lockedType: null,
      sessionWords: [],
      currentWord: null,
      choices: [],
      sessionScore: 0,
      sessionTotal: 0,
      clusterAccuracy: {},
      fsrsDueOverride: false,
      distractorTier: 'normal',
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
    clusterAccuracy: quizState.clusterAccuracy,
    fsrsDueOverride: quizState.fsrsDueOverride,
    distractorTier: quizState.distractorTier,
  };

  return { quiz, feedback, start, answer, next, close };
}
