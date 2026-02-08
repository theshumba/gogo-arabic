import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { prepareSentenceQuiz } from '../../utils/sentenceParser.js';
import { shuffle } from '../../utils/shuffle.js';
import SentenceBuilder from './SentenceBuilder.jsx';
import ProgressBar from '../Quiz/ProgressBar.jsx';
import vocabulary from '../../data/vocabularyAll.js';
import { COLORS, FONTS, pixelBtnGold, pixelBtnDark } from '../../styles/theme.js';

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
  backBtn: {
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
    overflowY: 'auto',
  },
  progressContainer: {
    width: '100%',
    maxWidth: '600px',
    marginBottom: '16px',
  },
  scoreText: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.lightGray,
    marginBottom: '16px',
  },
  filterRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  filterBtn: {
    ...pixelBtnDark,
    padding: '6px 12px',
    fontSize: '7px',
  },
  filterBtnActive: {
    ...pixelBtnGold,
    padding: '6px 12px',
    fontSize: '7px',
  },
  startBtn: {
    ...pixelBtnGold,
    padding: '12px 32px',
    fontSize: '10px',
  },
  nextBtn: {
    ...pixelBtnGold,
    padding: '10px 24px',
    fontSize: '9px',
    marginTop: '16px',
  },
  summaryContainer: {
    textAlign: 'center',
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
    marginBottom: '20px',
  },
  noWordsMsg: {
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    color: COLORS.beige,
    marginBottom: '12px',
  },
  noWordsSub: {
    fontFamily: FONTS.pixel,
    fontSize: '8px',
    color: COLORS.lightGray,
    marginBottom: '20px',
    maxWidth: '400px',
    lineHeight: '1.6',
  },
  difficultyLabel: {
    fontFamily: FONTS.pixel,
    fontSize: '8px',
    color: COLORS.lightGray,
    marginBottom: '8px',
  },
};

const CATEGORIES = ['all', 'adjectives', 'greetings', 'numbers', 'food', 'colors', 'family', 'directions', 'time', 'verbs'];
const DIFFICULTIES = [1, 2, 3, 4, 5];

export default function SentencePractice({ onBack }) {
  const settings = useSelector((s) => s.settings);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [practiceWords, setPracticeWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [currentQuizData, setCurrentQuizData] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Filter words with example sentences
  const availableWords = vocabulary.filter(w =>
    w.exampleSentence &&
    w.exampleSentence.arabic &&
    w.exampleSentence.english &&
    (selectedCategory === 'all' || w.category === selectedCategory) &&
    (!selectedDifficulty || w.difficulty === selectedDifficulty)
  );

  const startPractice = () => {
    if (availableWords.length === 0) return;

    // Take up to 10 random words
    const words = shuffle(availableWords).slice(0, 10);
    setPracticeWords(words);
    setCurrentIndex(0);
    setScore(0);
    setTotal(0);
    setStarted(true);
    setDone(false);
    setIsAnswered(false);

    // Prepare first quiz
    const quizData = prepareSentenceQuiz(words[0], vocabulary);
    setCurrentQuizData(quizData);
  };

  const handleComplete = (result) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setTotal(prev => prev + 1);
    if (result.correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= practiceWords.length) {
      setDone(true);
      return;
    }

    setCurrentIndex(nextIndex);
    setIsAnswered(false);

    const nextWord = practiceWords[nextIndex];
    const quizData = prepareSentenceQuiz(nextWord, vocabulary);
    setCurrentQuizData(quizData);
  };

  const handleRetry = () => {
    setStarted(false);
    setDone(false);
    setIsAnswered(false);
    setCurrentIndex(0);
    setScore(0);
    setTotal(0);
    setCurrentQuizData(null);
  };

  // Setup screen
  if (!started && !done) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={onBack}>Back</button>
          <div style={styles.headerTitle}>Sentence Practice</div>
          <div />
        </div>

        <div style={styles.body}>
          <div style={styles.difficultyLabel}>Filter by Category:</div>
          <div style={styles.filterRow}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                style={selectedCategory === cat ? styles.filterBtnActive : styles.filterBtn}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={styles.difficultyLabel}>Filter by Difficulty:</div>
          <div style={styles.filterRow}>
            <button
              style={selectedDifficulty === null ? styles.filterBtnActive : styles.filterBtn}
              onClick={() => setSelectedDifficulty(null)}
            >
              All
            </button>
            {DIFFICULTIES.map(diff => (
              <button
                key={diff}
                style={selectedDifficulty === diff ? styles.filterBtnActive : styles.filterBtn}
                onClick={() => setSelectedDifficulty(diff)}
              >
                Level {diff}
              </button>
            ))}
          </div>

          {availableWords.length > 0 ? (
            <>
              <div style={styles.noWordsSub}>
                {availableWords.length} sentence{availableWords.length !== 1 ? 's' : ''} available
              </div>
              <button style={styles.startBtn} onClick={startPractice}>
                Start Practice
              </button>
            </>
          ) : (
            <>
              <div style={styles.noWordsMsg}>No sentences available</div>
              <div style={styles.noWordsSub}>
                Try selecting a different category or difficulty level.
                Not all words have example sentences.
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Summary screen
  if (done) {
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div />
          <div style={styles.headerTitle}>Practice Complete</div>
          <div />
        </div>

        <div style={styles.body}>
          <div style={styles.summaryContainer}>
            <div style={styles.summaryScore}>{score}/{total}</div>
            <div style={styles.summaryMsg}>
              {percentage === 100 ? 'Perfect score!' : percentage >= 80 ? 'Great work!' : 'Keep practicing!'}
            </div>
            <button style={styles.startBtn} onClick={handleRetry}>
              Practice Again
            </button>
            <div style={{ marginTop: '12px' }}>
              <button style={styles.backBtn} onClick={onBack}>
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Practice in progress
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>Quit</button>
        <div style={styles.headerTitle}>Sentence Practice</div>
        <div style={styles.headerProgress}>
          {currentIndex + 1}/{practiceWords.length}
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.progressContainer}>
          <ProgressBar current={currentIndex + 1} total={practiceWords.length} />
        </div>

        <div style={styles.scoreText}>{score}/{total} correct</div>

        {currentQuizData && (
          <SentenceBuilder
            quizData={currentQuizData}
            onComplete={handleComplete}
            disabled={isAnswered}
          />
        )}

        {isAnswered && (
          <button style={styles.nextBtn} onClick={handleNext}>
            {currentIndex + 1 >= practiceWords.length ? 'View Results' : 'Next Sentence'}
          </button>
        )}
      </div>
    </div>
  );
}
