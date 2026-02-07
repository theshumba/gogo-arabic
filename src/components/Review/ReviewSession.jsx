import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateFsrsCard } from '../../store/slices/vocabularySlice.js';
import { addXP, updateStreak } from '../../store/slices/playerSlice.js';
import { reviewCard, getDueCards, Rating } from '../../services/fsrs.js';
import { XP_REWARDS } from '../../utils/xpCalculator.js';
import ArabicKeyboard from '../Keyboard/ArabicKeyboard.jsx';
import vocabulary from '../../data/vocabulary.json';
import { COLORS, FONTS, pixelPanel, pixelBtnGold, pixelBtnDark } from '../../styles/theme.js';

const QUIZ_TYPES = ['ar-to-en', 'en-to-ar', 'en-to-type-ar'];

const styles = {
  container: {
    width: '100%',
    height: '100%',
    background: COLORS.dark,
    color: COLORS.white,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: FONTS.pixel,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    borderBottom: `4px solid ${COLORS.gray}`,
    background: COLORS.dark,
  },
  quitBtn: {
    ...pixelBtnDark,
    padding: '5px 12px',
    fontSize: '8px',
  },
  headerTitle: {
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    color: COLORS.beige,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  headerProgress: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.lightGray,
  },
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  scoreText: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.lightGray,
    marginBottom: '16px',
  },
  arabicWord: {
    fontSize: '48px',
    fontFamily: FONTS.arabic,
    direction: 'rtl',
    color: COLORS.xpGold,
    marginBottom: '8px',
  },
  englishWord: {
    fontFamily: FONTS.pixel,
    fontSize: '14px',
    color: COLORS.beige,
    marginBottom: '16px',
  },
  transliteration: {
    fontFamily: FONTS.pixel,
    fontSize: '8px',
    color: COLORS.lightGray,
    fontStyle: 'italic',
    marginBottom: '16px',
  },
  choicesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
    maxWidth: '400px',
  },
  choice: {
    ...pixelPanel,
    padding: '10px 16px',
    background: COLORS.beige,
    border: `4px solid ${COLORS.dark}`,
    color: COLORS.dark,
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: `
      inset -4px -4px 0px 0px rgba(0,0,0,0.08),
      inset 4px 4px 0px 0px rgba(255,255,255,0.4),
      0 4px 0 0 ${COLORS.brown}
    `,
  },
  choiceArabic: {
    fontFamily: FONTS.arabic,
    fontSize: '20px',
    direction: 'rtl',
  },
  choiceCorrect: {
    borderColor: COLORS.green,
    background: '#eafaf1',
    boxShadow: `
      inset -4px -4px 0px 0px rgba(0,0,0,0.08),
      inset 4px 4px 0px 0px rgba(255,255,255,0.4),
      0 4px 0 0 #1fa855
    `,
  },
  choiceWrong: {
    borderColor: COLORS.red,
    background: '#fdeaea',
    boxShadow: `
      inset -4px -4px 0px 0px rgba(0,0,0,0.08),
      inset 4px 4px 0px 0px rgba(255,255,255,0.4),
      0 4px 0 0 #c02020
    `,
  },
  ratingRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '20px',
  },
  ratingBtn: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    padding: '8px 16px',
    border: 'none',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: COLORS.white,
  },
  ratingAgain: {
    background: COLORS.red,
    boxShadow: `
      inset -4px -4px 0px 0px rgba(0,0,0,0.2),
      inset 4px 4px 0px 0px rgba(255,255,255,0.2),
      0 4px 0 0 #c02020
    `,
  },
  ratingHard: {
    background: '#e67e22',
    boxShadow: `
      inset -4px -4px 0px 0px rgba(0,0,0,0.2),
      inset 4px 4px 0px 0px rgba(255,255,255,0.2),
      0 4px 0 0 #b56510
    `,
  },
  ratingGood: {
    background: COLORS.green,
    boxShadow: `
      inset -4px -4px 0px 0px rgba(0,0,0,0.2),
      inset 4px 4px 0px 0px rgba(255,255,255,0.2),
      0 4px 0 0 #1fa855
    `,
  },
  ratingEasy: {
    background: '#3498db',
    boxShadow: `
      inset -4px -4px 0px 0px rgba(0,0,0,0.2),
      inset 4px 4px 0px 0px rgba(255,255,255,0.2),
      0 4px 0 0 #2178b0
    `,
  },
  summaryScore: {
    fontFamily: FONTS.pixel,
    fontSize: '32px',
    color: COLORS.xpGold,
    margin: '16px 0',
  },
  summaryMsg: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.lightGray,
  },
  doneBtn: {
    ...pixelBtnGold,
    marginTop: '24px',
    padding: '10px 28px',
    fontSize: '10px',
  },
  noReviewMsg: {
    fontFamily: FONTS.pixel,
    fontSize: '14px',
    color: COLORS.beige,
    marginBottom: '12px',
  },
  noReviewSub: {
    fontFamily: FONTS.pixel,
    fontSize: '8px',
    color: COLORS.lightGray,
    marginBottom: '20px',
  },
  inputDisplay: {
    direction: 'rtl',
    fontSize: '32px',
    fontFamily: FONTS.arabic,
    padding: '10px 16px',
    minHeight: '52px',
    background: COLORS.dark,
    border: `4px solid ${COLORS.gray}`,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: '4px',
    width: '100%',
    maxWidth: '400px',
  },
  inputCorrect: {
    borderColor: COLORS.green,
  },
  inputWrong: {
    borderColor: COLORS.red,
  },
  correctAnswer: {
    fontFamily: FONTS.arabic,
    fontSize: '18px',
    direction: 'rtl',
    color: COLORS.green,
    marginTop: '4px',
  },
};

function generateChoices(correctWord) {
  const others = vocabulary
    .filter((w) => w.id !== correctWord.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  return [...others, correctWord].sort(() => Math.random() - 0.5);
}

export default function ReviewSession({ onBack }) {
  const dispatch = useDispatch();
  const cards = useSelector((s) => s.vocabulary.fsrsCards);
  const settings = useSelector((s) => s.settings);

  const [sessionCards] = useState(() => {
    const due = getDueCards(cards);
    return due.sort((a, b) => new Date(a.card.due) - new Date(b.card.due)).slice(0, 20);
  });
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selected, setSelected] = useState(null);
  const [typingInput, setTypingInput] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(false);
  const [quizType, setQuizType] = useState(() =>
    QUIZ_TYPES[Math.floor(Math.random() * QUIZ_TYPES.length)]
  );
  const [choices, setChoices] = useState(() => {
    const entry = sessionCards[0];
    if (!entry) return [];
    const w = vocabulary.find((v) => v.id === entry.wordId);
    return w ? generateChoices(w) : [];
  });

  /* ---------- No reviews due ---------- */
  if (sessionCards.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.quitBtn} onClick={onBack}>Back</button>
          <div style={styles.headerTitle}>Daily Review</div>
          <div />
        </div>
        <div style={styles.body}>
          <div style={styles.noReviewMsg}>No reviews due!</div>
          <p style={styles.noReviewSub}>Learn more words and come back later.</p>
          <button style={styles.doneBtn} onClick={onBack}>Back to Menu</button>
        </div>
      </div>
    );
  }

  /* ---------- Summary screen ---------- */
  if (done) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div />
          <div style={styles.headerTitle}>Review Complete</div>
          <div />
        </div>
        <div style={styles.body}>
          <div style={styles.summaryScore}>{score}/{total}</div>
          <p style={styles.summaryMsg}>
            {score === total ? 'Perfect review!' : 'Keep it up!'}
          </p>
          <button style={styles.doneBtn} onClick={onBack}>Back to Menu</button>
        </div>
      </div>
    );
  }

  const currentEntry = sessionCards[index];
  const currentWord = currentEntry
    ? vocabulary.find((w) => w.id === currentEntry.wordId)
    : null;

  if (!currentWord) {
    if (!done) { setDone(true); }
    return null;
  }

  /* ---------- Handlers ---------- */
  const handleAnswer = (answer) => {
    if (answered) return;
    let correct = false;
    if (quizType === 'ar-to-en') correct = answer === currentWord.english;
    else if (quizType === 'en-to-ar') correct = answer === currentWord.arabic;
    setSelected(answer);
    setIsCorrect(correct);
    setAnswered(true);
    setTotal((t) => t + 1);
    if (correct) setScore((s) => s + 1);
    // Quiz result tracked locally via score/total state
  };

  const handleTypingSubmit = () => {
    if (typingDone) return;
    const normalize = (s) => s.replace(/[\u064B-\u065F\u0670]/g, '').trim();
    const correct = normalize(typingInput) === normalize(currentWord.arabic);
    setIsCorrect(correct);
    setTypingDone(true);
    setAnswered(true);
    setTotal((t) => t + 1);
    if (correct) setScore((s) => s + 1);
    // Quiz result tracked locally via score/total state
  };

  const handleRating = (rating) => {
    const result = reviewCard(currentEntry.card, rating);
    dispatch(updateFsrsCard({
      wordId: currentEntry.wordId,
      card: result.card,
      log: result.log,
    }));

    const nextIdx = index + 1;
    if (nextIdx >= sessionCards.length) {
      dispatch(addXP(XP_REWARDS.DAILY_REVIEW_COMPLETE));
      dispatch(updateStreak());
      setDone(true);
    } else {
      setIndex(nextIdx);
      setAnswered(false);
      setIsCorrect(false);
      setSelected(null);
      setTypingInput('');
      setTypingDone(false);
      setQuizType(QUIZ_TYPES[Math.floor(Math.random() * QUIZ_TYPES.length)]);
      const nextWord = vocabulary.find((w) => w.id === sessionCards[nextIdx].wordId);
      setChoices(nextWord ? generateChoices(nextWord) : []);
    }
  };

  /* ---------- Active review ---------- */
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.quitBtn} onClick={onBack}>Quit</button>
        <div style={styles.headerTitle}>Daily Review</div>
        <div style={styles.headerProgress}>{index + 1}/{sessionCards.length}</div>
      </div>

      <div style={styles.body}>
        <div style={styles.scoreText}>{score}/{total} correct</div>

        {/* Arabic -> English */}
        {quizType === 'ar-to-en' && (
          <>
            <div style={styles.arabicWord}>{currentWord.arabic}</div>
            {settings.showTransliteration && (
              <div style={styles.transliteration}>{currentWord.transliteration}</div>
            )}
            <div style={styles.choicesGrid}>
              {choices.map((w) => {
                let extra = {};
                if (answered) {
                  if (w.id === currentWord.id) extra = styles.choiceCorrect;
                  else if (w.english === selected && w.id !== currentWord.id) extra = styles.choiceWrong;
                }
                return (
                  <button key={w.id} style={{ ...styles.choice, ...extra }}
                    onClick={() => handleAnswer(w.english)} disabled={answered}>
                    {w.english}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* English -> Arabic */}
        {quizType === 'en-to-ar' && (
          <>
            <div style={styles.englishWord}>{currentWord.english}</div>
            <div style={styles.choicesGrid}>
              {choices.map((w) => {
                let extra = {};
                if (answered) {
                  if (w.id === currentWord.id) extra = styles.choiceCorrect;
                  else if (w.arabic === selected && w.id !== currentWord.id) extra = styles.choiceWrong;
                }
                return (
                  <button key={w.id} style={{ ...styles.choice, ...styles.choiceArabic, ...extra }}
                    onClick={() => handleAnswer(w.arabic)} disabled={answered}>
                    {w.arabic}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* English -> Type Arabic */}
        {quizType === 'en-to-type-ar' && (
          <>
            <div style={styles.englishWord}>{currentWord.english}</div>
            <div style={{
              ...styles.inputDisplay,
              ...(typingDone ? (isCorrect ? styles.inputCorrect : styles.inputWrong) : {}),
            }}>
              {typingInput || '\u200B'}
            </div>
            {typingDone && !isCorrect && (
              <div style={styles.correctAnswer}>
                {currentWord.arabic}
              </div>
            )}
            {!typingDone && (
              <ArabicKeyboard
                onKeyPress={(k) => setTypingInput(typingInput + k)}
                onBackspace={() => setTypingInput(typingInput.slice(0, -1))}
                onSubmit={handleTypingSubmit}
              />
            )}
          </>
        )}

        {/* FSRS Rating buttons */}
        {answered && (
          <div style={styles.ratingRow}>
            <button style={{ ...styles.ratingBtn, ...styles.ratingAgain }}
              onClick={() => handleRating(Rating.Again)}>Again</button>
            <button style={{ ...styles.ratingBtn, ...styles.ratingHard }}
              onClick={() => handleRating(Rating.Hard)}>Hard</button>
            <button style={{ ...styles.ratingBtn, ...styles.ratingGood }}
              onClick={() => handleRating(Rating.Good)}>Good</button>
            <button style={{ ...styles.ratingBtn, ...styles.ratingEasy }}
              onClick={() => handleRating(Rating.Easy)}>Easy</button>
          </div>
        )}
      </div>
    </div>
  );
}
