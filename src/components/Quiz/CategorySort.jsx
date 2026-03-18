import { useState, useEffect } from 'react';
import { useFormatArabic } from '../../hooks/useFormatArabic.js';
import { COLORS, FONTS } from '../../styles/theme.js';

const styles = {
  instruction: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.brown,
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  columnsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '12px',
  },
  column: {
    border: `4px solid ${COLORS.dark}`,
    background: COLORS.creamyBeige,
    minHeight: '90px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '8px',
    imageRendering: 'pixelated',
  },
  columnLabel: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.brown,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    borderBottom: `2px solid ${COLORS.brown}`,
    paddingBottom: '4px',
    marginBottom: '4px',
  },
  columnTile: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '18px',
    direction: 'rtl',
    padding: '4px 8px',
    border: `2px solid ${COLORS.dark}`,
    background: COLORS.beige,
    color: COLORS.dark,
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: 'inset -2px -2px 0px 0px rgba(0,0,0,0.08)',
    imageRendering: 'pixelated',
  },
  columnTileCorrect: {
    background: 'rgba(46,204,113,0.2)',
    borderColor: COLORS.green,
  },
  columnTileWrong: {
    background: 'rgba(240,49,49,0.15)',
    borderColor: COLORS.red,
  },
  tileBank: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    direction: 'rtl',
    justifyContent: 'center',
    marginBottom: '10px',
  },
  bankTile: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '18px',
    direction: 'rtl',
    padding: '8px 14px',
    border: `3px solid ${COLORS.dark}`,
    background: COLORS.beige,
    color: COLORS.dark,
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: 'inset -2px -2px 0px 0px rgba(0,0,0,0.1), inset 2px 2px 0px 0px rgba(255,255,255,0.4)',
    imageRendering: 'pixelated',
  },
  submitBtn: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    padding: '8px 18px',
    border: `3px solid ${COLORS.darkGold}`,
    background: COLORS.gold,
    color: COLORS.beige,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    imageRendering: 'pixelated',
    display: 'block',
    margin: '0 auto',
  },
};

/**
 * CategorySort — sort 6 words into 2 categories.
 *
 * options shape (from useQuiz):
 *   options = [
 *     { value: 'cat_a', label: 'Category A', correct: true, category: 'food' },
 *     ...
 *   ]
 *
 * For this quiz type, options are the 6 word tiles to sort.
 * options[i].category = which bucket it belongs to.
 * The two categories are derived from the unique categories in options.
 */
export default function CategorySort({ word, options, onAnswer, feedback }) {
  const formatArabic = useFormatArabic();

  // Derive the two category names from options
  const categories = [...new Set(options.map((o) => o.category))].slice(0, 2);
  const [catA, catB] = categories;

  const [buckets, setBuckets] = useState({ [catA]: [], [catB]: [] });
  const [remaining, setRemaining] = useState(options.map((o, i) => ({ ...o, idx: i })));
  const [pendingWord, setPendingWord] = useState(null);

  // Reset on new question
  useEffect(() => {
    setBuckets({ [catA]: [], [catB]: [] });
    setRemaining(options.map((o, i) => ({ ...o, idx: i })));
    setPendingWord(null);
  }, [word?.id]);

  const handleBankClick = (item) => {
    if (feedback) return;
    setPendingWord(item);
  };

  const handleBucketClick = (cat) => {
    if (feedback || !pendingWord) return;
    setBuckets((prev) => ({ ...prev, [cat]: [...prev[cat], pendingWord] }));
    setRemaining((prev) => prev.filter((r) => r.idx !== pendingWord.idx));
    setPendingWord(null);
  };

  const handleBucketTileClick = (cat, item) => {
    if (feedback) return;
    // Return to bank
    setBuckets((prev) => ({ ...prev, [cat]: prev[cat].filter((t) => t.idx !== item.idx) }));
    setRemaining((prev) => [...prev, item]);
    if (pendingWord?.idx === item.idx) setPendingWord(null);
  };

  const handleSubmit = () => {
    if (feedback) return;
    // Encode answer as JSON so useQuiz can evaluate it
    const answer = JSON.stringify(buckets);
    onAnswer(answer);
  };

  const allPlaced = remaining.length === 0;

  const getTileStyle = (item, inBucket) => {
    if (!feedback) return inBucket ? styles.columnTile : styles.bankTile;
    const correct = item.category === (inBucket ? item._bucket : null);
    // After feedback, color each tile
    if (feedback) {
      const isCorrect = item.category === item._bucket;
      const base = inBucket ? styles.columnTile : styles.bankTile;
      return {
        ...base,
        ...(isCorrect ? styles.columnTileCorrect : styles.columnTileWrong),
      };
    }
    return inBucket ? styles.columnTile : styles.bankTile;
  };

  return (
    <div>
      <div style={styles.instruction}>
        {pendingWord
          ? `Place "${formatArabic(pendingWord.label)}" into a category:`
          : 'Sort the words into categories:'}
      </div>

      <div style={styles.columnsRow}>
        {[catA, catB].map((cat) => (
          <div
            key={cat}
            style={{
              ...styles.column,
              borderColor: pendingWord ? COLORS.cyan : COLORS.dark,
              cursor: pendingWord ? 'pointer' : 'default',
            }}
            onClick={() => pendingWord && handleBucketClick(cat)}
          >
            <div style={styles.columnLabel}>{cat}</div>
            {buckets[cat].map((item) => {
              const isCorrect = feedback ? item.category === cat : null;
              return (
                <button
                  key={item.idx}
                  style={{
                    ...styles.columnTile,
                    ...(feedback
                      ? isCorrect
                        ? styles.columnTileCorrect
                        : styles.columnTileWrong
                      : {}),
                  }}
                  onClick={(e) => { e.stopPropagation(); handleBucketTileClick(cat, item); }}
                  disabled={!!feedback}
                >
                  {formatArabic(item.label)}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Word bank */}
      {remaining.length > 0 && (
        <div style={styles.tileBank}>
          {remaining.map((item) => (
            <button
              key={item.idx}
              style={{
                ...styles.bankTile,
                borderColor: pendingWord?.idx === item.idx ? COLORS.cyan : COLORS.dark,
                outline: pendingWord?.idx === item.idx ? `2px solid ${COLORS.cyan}` : 'none',
              }}
              onClick={() => handleBankClick(item)}
              disabled={!!feedback}
            >
              {formatArabic(item.label)}
            </button>
          ))}
        </div>
      )}

      {!feedback && allPlaced && (
        <button style={styles.submitBtn} onClick={handleSubmit}>
          Submit
        </button>
      )}
    </div>
  );
}
