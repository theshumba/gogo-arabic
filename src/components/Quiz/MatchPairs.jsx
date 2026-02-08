import { useState, useCallback } from 'react';
import { shuffle } from '../../utils/shuffle.js';
import { COLORS, FONTS } from '../../styles/theme.js';

const styles = {
  instruction: {
    fontFamily: FONTS.pixel,
    fontSize: '8px',
    color: COLORS.brown,
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  columnHeader: {
    fontFamily: FONTS.pixel,
    fontSize: '7px',
    color: COLORS.gray,
    textTransform: 'uppercase',
    textAlign: 'center',
    padding: '4px 0',
    borderBottom: `2px solid ${COLORS.dark}`,
    marginBottom: '4px',
  },
  card: {
    padding: '10px 14px',
    border: `4px solid ${COLORS.dark}`,
    background: COLORS.beige,
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: `
      inset -2px -2px 0px 0px rgba(0,0,0,0.08),
      inset 2px 2px 0px 0px rgba(255,255,255,0.4)
    `,
  },
  cardArabic: {
    fontFamily: FONTS.arabic,
    fontSize: '20px',
    direction: 'rtl',
    color: COLORS.dark,
  },
  cardEnglish: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.dark,
  },
  cardSelected: {
    borderColor: COLORS.xpGold,
    background: '#fdf8e8',
    boxShadow: `
      inset -2px -2px 0px 0px rgba(0,0,0,0.1),
      inset 2px 2px 0px 0px rgba(226,182,89,0.3),
      0 0 0 2px ${COLORS.xpGold}
    `,
  },
  cardMatched: {
    borderColor: COLORS.green,
    background: 'rgba(46,204,113,0.15)',
    opacity: 0.6,
    cursor: 'default',
  },
  cardWrong: {
    borderColor: COLORS.red,
    background: 'rgba(240,49,49,0.15)',
  },
  resultRow: {
    marginTop: '16px',
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    textAlign: 'center',
    color: COLORS.brown,
  },
};

export default function MatchPairs({ words, onComplete }) {
  // words: array of 4 word objects with arabic & english
  const [arabicOrder] = useState(() => shuffle(words));
  const [englishOrder] = useState(() => shuffle(words));
  const [selectedArabic, setSelectedArabic] = useState(null);
  const [selectedEnglish, setSelectedEnglish] = useState(null);
  const [matched, setMatched] = useState(new Set());
  const [wrongPair, setWrongPair] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);

  const checkMatch = useCallback((arId, enId) => {
    setAttempts((a) => a + 1);
    if (arId === enId) {
      const newMatched = new Set(matched);
      newMatched.add(arId);
      setMatched(newMatched);
      setSelectedArabic(null);
      setSelectedEnglish(null);
      if (newMatched.size === words.length) {
        setTimeout(() => onComplete(errors === 0), 500);
      }
    } else {
      setErrors((e) => e + 1);
      setWrongPair({ arabic: arId, english: enId });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedArabic(null);
        setSelectedEnglish(null);
      }, 800);
    }
  }, [matched, words.length, errors, onComplete]);

  const handleArabicClick = (wordId) => {
    if (matched.has(wordId) || wrongPair) return;
    setSelectedArabic(wordId);
    if (selectedEnglish !== null) {
      checkMatch(wordId, selectedEnglish);
    }
  };

  const handleEnglishClick = (wordId) => {
    if (matched.has(wordId) || wrongPair) return;
    setSelectedEnglish(wordId);
    if (selectedArabic !== null) {
      checkMatch(selectedArabic, wordId);
    }
  };

  const getArabicStyle = (wordId) => {
    if (matched.has(wordId)) return { ...styles.card, ...styles.cardArabic, ...styles.cardMatched };
    if (wrongPair?.arabic === wordId) return { ...styles.card, ...styles.cardArabic, ...styles.cardWrong };
    if (selectedArabic === wordId) return { ...styles.card, ...styles.cardArabic, ...styles.cardSelected };
    return { ...styles.card, ...styles.cardArabic };
  };

  const getEnglishStyle = (wordId) => {
    if (matched.has(wordId)) return { ...styles.card, ...styles.cardEnglish, ...styles.cardMatched };
    if (wrongPair?.english === wordId) return { ...styles.card, ...styles.cardEnglish, ...styles.cardWrong };
    if (selectedEnglish === wordId) return { ...styles.card, ...styles.cardEnglish, ...styles.cardSelected };
    return { ...styles.card, ...styles.cardEnglish };
  };

  return (
    <div>
      <div style={styles.instruction}>Match the Arabic words to their English meanings:</div>
      <div style={styles.grid}>
        <div style={styles.column}>
          <div style={styles.columnHeader}>Arabic</div>
          {arabicOrder.map((w) => (
            <button
              key={`ar-${w.id}`}
              style={getArabicStyle(w.id)}
              onClick={() => handleArabicClick(w.id)}
              disabled={matched.has(w.id) || !!wrongPair}
            >
              {w.arabic}
            </button>
          ))}
        </div>
        <div style={styles.column}>
          <div style={styles.columnHeader}>English</div>
          {englishOrder.map((w) => (
            <button
              key={`en-${w.id}`}
              style={getEnglishStyle(w.id)}
              onClick={() => handleEnglishClick(w.id)}
              disabled={matched.has(w.id) || !!wrongPair}
            >
              {w.english}
            </button>
          ))}
        </div>
      </div>
      <div style={styles.resultRow}>
        {matched.size}/{words.length} matched
      </div>
    </div>
  );
}
