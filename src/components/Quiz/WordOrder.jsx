import { useState, useEffect } from 'react';
import { useFormatArabic } from '../../hooks/useFormatArabic.js';
import { COLORS, FONTS } from '../../styles/theme.js';

const styles = {
  instruction: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.brown,
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  prompt: {
    fontFamily: FONTS.pixel,
    fontSize: '13px',
    margin: '10px 0 14px',
    color: COLORS.dark,
    lineHeight: '1.6',
  },
  dropZone: {
    minHeight: '52px',
    border: `4px solid ${COLORS.dark}`,
    background: COLORS.creamyBeige,
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '10px 12px',
    direction: 'rtl',
    marginBottom: '12px',
    boxShadow: 'inset 3px 3px 0px 0px rgba(0,0,0,0.08)',
    imageRendering: 'pixelated',
  },
  dropZoneCorrect: {
    borderColor: COLORS.green,
    background: 'rgba(46,204,113,0.1)',
  },
  dropZoneWrong: {
    borderColor: COLORS.red,
    background: 'rgba(240,49,49,0.08)',
  },
  tile: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '18px',
    padding: '6px 12px',
    border: `3px solid ${COLORS.dark}`,
    background: COLORS.beige,
    color: COLORS.dark,
    cursor: 'pointer',
    direction: 'rtl',
    boxShadow: 'inset -2px -2px 0px 0px rgba(0,0,0,0.1), inset 2px 2px 0px 0px rgba(255,255,255,0.4)',
    imageRendering: 'pixelated',
  },
  tileUsed: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  tileBank: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    direction: 'rtl',
    marginBottom: '10px',
  },
  correctAnswer: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '18px',
    direction: 'rtl',
    color: COLORS.green,
    marginTop: '6px',
  },
  correctLabel: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.green,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginTop: '4px',
  },
  clearBtn: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    padding: '6px 12px',
    border: `3px solid ${COLORS.dark}`,
    background: COLORS.beige,
    color: COLORS.dark,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    imageRendering: 'pixelated',
    marginBottom: '10px',
  },
};

export default function WordOrder({ word, options, onAnswer, feedback }) {
  const formatArabic = useFormatArabic();

  // Build tile pool from options (array of Arabic word strings)
  const tiles = options || [];

  const [placed, setPlaced] = useState([]);
  const [usedIndices, setUsedIndices] = useState([]);

  // Reset on new word
  useEffect(() => {
    setPlaced([]);
    setUsedIndices([]);
  }, [word?.id]);

  const handleTileClick = (tile, idx) => {
    if (feedback) return;
    if (usedIndices.includes(idx)) return;
    const newPlaced = [...placed, { tile, idx }];
    setPlaced(newPlaced);
    setUsedIndices((prev) => [...prev, idx]);
  };

  const handlePlacedClick = (placedIdx) => {
    if (feedback) return;
    const removed = placed[placedIdx];
    setPlaced((prev) => prev.filter((_, i) => i !== placedIdx));
    setUsedIndices((prev) => prev.filter((i) => i !== removed.idx));
  };

  const handleSubmit = () => {
    if (feedback || placed.length === 0) return;
    const sentence = placed.map((p) => p.tile).join(' ');
    onAnswer(sentence);
  };

  let dropStyle = styles.dropZone;
  if (feedback) {
    dropStyle = { ...dropStyle, ...(feedback.correct ? styles.dropZoneCorrect : styles.dropZoneWrong) };
  }

  return (
    <div>
      <div style={styles.instruction}>Arrange the words in the correct Arabic word order:</div>
      <div style={styles.prompt}>{word.english}</div>

      {/* Drop zone — click placed tile to remove it */}
      <div style={dropStyle}>
        {placed.map((p, i) => (
          <button
            key={i}
            style={styles.tile}
            onClick={() => handlePlacedClick(i)}
            disabled={!!feedback}
          >
            {formatArabic(p.tile)}
          </button>
        ))}
      </div>

      {/* Tile bank */}
      <div style={styles.tileBank}>
        {tiles.map((tile, idx) => {
          const isUsed = usedIndices.includes(idx);
          return (
            <button
              key={idx}
              style={{ ...styles.tile, ...(isUsed ? styles.tileUsed : {}) }}
              onClick={() => handleTileClick(tile, idx)}
              disabled={!!feedback || isUsed}
            >
              {formatArabic(tile)}
            </button>
          );
        })}
      </div>

      {!feedback && placed.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button style={styles.clearBtn} onClick={() => { setPlaced([]); setUsedIndices([]); }}>
            Clear
          </button>
          <button
            style={{
              ...styles.clearBtn,
              background: COLORS.gold,
              color: COLORS.beige,
              borderColor: COLORS.darkGold,
            }}
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      )}

      {feedback && !feedback.correct && (
        <div>
          <div style={styles.correctLabel}>Correct answer:</div>
          <div style={styles.correctAnswer}>{formatArabic(feedback.correctAnswer)}</div>
        </div>
      )}
    </div>
  );
}
