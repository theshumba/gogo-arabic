import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { COLORS, FONTS, pixelBtnGold, pixelBtnDark } from '../../styles/theme.js';
import { generateWordSearch, checkSelection, getSelectionCells } from '../../utils/wordSearchGenerator.js';

/**
 * WordSearch Component
 *
 * Interactive Arabic word search puzzle mini-game.
 *
 * Features:
 * - NxN grid with hidden Arabic words
 * - Click/drag to select words
 * - Words can be horizontal (RTL) or vertical
 * - Highlighted found words
 * - Difficulty levels (easy/medium/hard)
 * - Category selection from vocabulary
 * - Timer and score tracking
 * - Celebration on completion
 */
export default function WordSearch({ onBack }) {
  const vocabularyState = useSelector((state) => state.vocabulary);
  const allWords = vocabularyState.words || [];

  const [difficulty, setDifficulty] = useState(null);
  const [category, setCategory] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [foundWords, setFoundWords] = useState(new Set());
  const [selecting, setSelecting] = useState(false);
  const [selection, setSelection] = useState(null);
  const [highlightedCells, setHighlightedCells] = useState(new Set());
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Get available categories
  const categories = useMemo(() => {
    const cats = new Set();
    allWords.forEach(word => {
      if (word.category) cats.add(word.category);
    });
    return Array.from(cats).sort();
  }, [allWords]);

  // Timer
  useEffect(() => {
    if (!startTime || showCelebration) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, showCelebration]);

  // Check for completion
  useEffect(() => {
    if (puzzle && foundWords.size === puzzle.wordPositions.length && foundWords.size > 0) {
      setShowCelebration(true);
    }
  }, [foundWords, puzzle]);

  const getDifficultySettings = (diff) => {
    switch (diff) {
      case 'easy':
        return { gridSize: 8, wordCount: 4 };
      case 'medium':
        return { gridSize: 10, wordCount: 6 };
      case 'hard':
        return { gridSize: 12, wordCount: 8 };
      default:
        return { gridSize: 10, wordCount: 6 };
    }
  };

  const handleStartGame = () => {
    if (!difficulty || !category) return;

    const { gridSize, wordCount } = getDifficultySettings(difficulty);

    // Get words from selected category
    const categoryWords = allWords
      .filter(w => w.category === category)
      .slice(0, wordCount * 3); // Get more words than needed

    if (categoryWords.length < wordCount) {
      alert(`Not enough words in category ${category}. Need at least ${wordCount} words.`);
      return;
    }

    // Shuffle and select words
    const shuffled = [...categoryWords].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, wordCount);

    // Generate puzzle
    const newPuzzle = generateWordSearch(
      selectedWords.map(w => w.arabic),
      gridSize
    );

    // Attach English meanings to word positions
    newPuzzle.wordPositions = newPuzzle.wordPositions.map(pos => {
      const word = selectedWords.find(w =>
        w.arabic.replace(/[\u064B-\u065F\u0670]/g, '').replace(/\s/g, '') === pos.word
      );
      return {
        ...pos,
        english: word?.english || '',
        originalArabic: word?.arabic || pos.word,
      };
    });

    setPuzzle(newPuzzle);
    setFoundWords(new Set());
    setHighlightedCells(new Set());
    setStartTime(Date.now());
    setElapsedTime(0);
    setShowCelebration(false);
  };

  const handleCellMouseDown = (row, col) => {
    setSelecting(true);
    setSelection({ startRow: row, startCol: col, endRow: row, endCol: col });
  };

  const handleCellMouseEnter = (row, col) => {
    if (!selecting || !selection) return;

    // Only allow horizontal or vertical selections
    const { startRow, startCol } = selection;

    if (row === startRow) {
      // Horizontal selection
      setSelection({ ...selection, endRow: row, endCol: col });
    } else if (col === startCol) {
      // Vertical selection
      setSelection({ ...selection, endRow: row, endCol: col });
    }
  };

  const handleCellMouseUp = () => {
    if (!selecting || !selection || !puzzle) {
      setSelecting(false);
      setSelection(null);
      return;
    }

    // Check if selection matches any word
    const match = checkSelection(selection, puzzle.wordPositions);

    if (match && !foundWords.has(match.word)) {
      // Found a new word!
      const newFound = new Set(foundWords);
      newFound.add(match.word);
      setFoundWords(newFound);

      // Highlight cells permanently
      const cells = getSelectionCells(selection);
      const newHighlighted = new Set(highlightedCells);
      cells.forEach(cell => {
        newHighlighted.add(`${cell.row},${cell.col}`);
      });
      setHighlightedCells(newHighlighted);
    }

    setSelecting(false);
    setSelection(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setDifficulty(null);
    setCategory(null);
    setPuzzle(null);
    setFoundWords(new Set());
    setHighlightedCells(new Set());
    setStartTime(null);
    setElapsedTime(0);
    setShowCelebration(false);
  };

  // Setup screen
  if (!puzzle) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Word Search</h1>
          <h2 style={styles.titleArabic}>البحث عن الكلمات</h2>
          <p style={styles.subtitle}>
            Find hidden Arabic words in the grid. Words can be horizontal (right-to-left) or vertical.
          </p>
        </div>

        <div style={styles.setupPanel}>
          {/* Difficulty selection */}
          <div style={styles.setupSection}>
            <h3 style={styles.setupLabel}>Select Difficulty:</h3>
            <div style={styles.buttonGroup}>
              {['easy', 'medium', 'hard'].map((diff) => {
                const settings = getDifficultySettings(diff);
                return (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    style={{
                      ...pixelBtnGold,
                      ...(difficulty === diff ? styles.selectedButton : {}),
                      margin: '4px',
                      minWidth: '140px',
                    }}
                  >
                    {diff.toUpperCase()}
                    <div style={styles.buttonSubtext}>
                      {settings.gridSize}x{settings.gridSize}, {settings.wordCount} words
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category selection */}
          {difficulty && (
            <div style={styles.setupSection}>
              <h3 style={styles.setupLabel}>Select Category:</h3>
              <div style={styles.buttonGroup}>
                {categories.slice(0, 10).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    style={{
                      ...pixelBtnDark,
                      ...(category === cat ? styles.selectedButton : {}),
                      margin: '4px',
                      fontSize: '10px',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Start button */}
          {difficulty && category && (
            <button
              onClick={handleStartGame}
              style={{
                ...pixelBtnGold,
                marginTop: '20px',
                fontSize: '14px',
              }}
            >
              Start Game
            </button>
          )}
        </div>

        <button onClick={onBack} style={{ ...pixelBtnDark, marginTop: '20px' }}>
          Back to Mini-Games
        </button>
      </div>
    );
  }

  // Game screen
  const currentSelection = selecting && selection ? getSelectionCells(selection) : [];

  return (
    <div style={styles.container}>
      {/* Game header */}
      <div style={styles.gameHeader}>
        <div style={styles.gameInfo}>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Time:</span> {formatTime(elapsedTime)}
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Found:</span> {foundWords.size} / {puzzle.wordPositions.length}
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Difficulty:</span> {difficulty}
          </div>
        </div>
      </div>

      <div style={styles.gameContainer}>
        {/* Grid */}
        <div
          style={{
            ...styles.gridContainer,
            gridTemplateColumns: `repeat(${puzzle.grid.length}, 1fr)`,
          }}
          onMouseLeave={() => {
            setSelecting(false);
            setSelection(null);
          }}
        >
          {puzzle.grid.map((row, rowIdx) =>
            row.map((letter, colIdx) => {
              const cellKey = `${rowIdx},${colIdx}`;
              const isHighlighted = highlightedCells.has(cellKey);
              const isCurrentSelection = currentSelection.some(
                cell => cell.row === rowIdx && cell.col === colIdx
              );

              return (
                <div
                  key={cellKey}
                  style={{
                    ...styles.gridCell,
                    ...(isHighlighted ? styles.foundCell : {}),
                    ...(isCurrentSelection ? styles.selectingCell : {}),
                  }}
                  onMouseDown={() => handleCellMouseDown(rowIdx, colIdx)}
                  onMouseEnter={() => handleCellMouseEnter(rowIdx, colIdx)}
                  onMouseUp={handleCellMouseUp}
                >
                  {letter}
                </div>
              );
            })
          )}
        </div>

        {/* Word list */}
        <div style={styles.wordList}>
          <h3 style={styles.wordListTitle}>Words to Find:</h3>
          {puzzle.wordPositions.map((pos, idx) => {
            const isFound = foundWords.has(pos.word);
            return (
              <div
                key={idx}
                style={{
                  ...styles.wordItem,
                  ...(isFound ? styles.foundWordItem : {}),
                }}
              >
                <div style={styles.wordArabic}>
                  {isFound && '✓ '}
                  {pos.originalArabic}
                </div>
                <div style={styles.wordEnglish}>{pos.english}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Celebration overlay */}
      {showCelebration && (
        <div style={styles.celebrationOverlay}>
          <div style={styles.celebrationPanel}>
            <h2 style={styles.celebrationTitle}>🎉 Congratulations! 🎉</h2>
            <p style={styles.celebrationText}>
              You found all {puzzle.wordPositions.length} words!
            </p>
            <p style={styles.celebrationTime}>
              Time: {formatTime(elapsedTime)}
            </p>
            <div style={styles.celebrationActions}>
              <button onClick={handleStartGame} style={pixelBtnGold}>
                Play Again
              </button>
              <button onClick={handleReset} style={pixelBtnDark}>
                New Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={styles.controls}>
        <button onClick={handleReset} style={pixelBtnDark}>
          New Game
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
  setupPanel: {
    background: COLORS.white,
    border: `4px solid ${COLORS.brown}`,
    padding: '30px',
    maxWidth: '700px',
    textAlign: 'center',
  },
  setupSection: {
    marginBottom: '30px',
  },
  setupLabel: {
    fontSize: '14px',
    marginBottom: '12px',
    color: COLORS.brown,
  },
  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '8px',
  },
  buttonSubtext: {
    fontSize: '7px',
    marginTop: '4px',
    opacity: 0.8,
  },
  selectedButton: {
    transform: 'translateY(2px)',
    opacity: 0.9,
  },
  gameHeader: {
    width: '100%',
    maxWidth: '1000px',
    marginBottom: '20px',
  },
  gameInfo: {
    display: 'flex',
    justifyContent: 'space-around',
    background: COLORS.white,
    border: `3px solid ${COLORS.brown}`,
    padding: '12px',
  },
  stat: {
    fontSize: '11px',
    color: COLORS.brown,
  },
  statLabel: {
    fontWeight: 'bold',
  },
  gameContainer: {
    display: 'flex',
    gap: '20px',
    maxWidth: '1000px',
    alignItems: 'flex-start',
  },
  gridContainer: {
    display: 'grid',
    gap: '2px',
    background: COLORS.brown,
    border: `4px solid ${COLORS.brown}`,
    padding: '2px',
    userSelect: 'none',
  },
  gridCell: {
    background: COLORS.white,
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: FONTS.arabicDisplay,
    fontSize: '20px',
    color: COLORS.brown,
    cursor: 'pointer',
    minWidth: '30px',
    minHeight: '30px',
    transition: 'background 0.1s',
  },
  selectingCell: {
    background: COLORS.cyan,
  },
  foundCell: {
    background: COLORS.green,
    color: COLORS.white,
  },
  wordList: {
    background: COLORS.white,
    border: `4px solid ${COLORS.brown}`,
    padding: '16px',
    minWidth: '200px',
    maxWidth: '300px',
  },
  wordListTitle: {
    fontSize: '12px',
    color: COLORS.brown,
    marginBottom: '12px',
    textAlign: 'center',
  },
  wordItem: {
    padding: '8px',
    marginBottom: '8px',
    background: COLORS.beige,
    border: `2px solid ${COLORS.brown}`,
  },
  foundWordItem: {
    background: COLORS.green,
    color: COLORS.white,
  },
  wordArabic: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '16px',
    direction: 'rtl',
    marginBottom: '4px',
  },
  wordEnglish: {
    fontSize: '9px',
  },
  celebrationOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  celebrationPanel: {
    background: COLORS.white,
    border: `6px solid ${COLORS.xpGold}`,
    padding: '40px',
    textAlign: 'center',
    maxWidth: '500px',
  },
  celebrationTitle: {
    fontSize: '20px',
    color: COLORS.xpGold,
    marginBottom: '16px',
  },
  celebrationText: {
    fontSize: '14px',
    color: COLORS.brown,
    marginBottom: '12px',
  },
  celebrationTime: {
    fontSize: '16px',
    color: COLORS.darkGold,
    marginBottom: '24px',
  },
  celebrationActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  controls: {
    marginTop: '20px',
  },
};
