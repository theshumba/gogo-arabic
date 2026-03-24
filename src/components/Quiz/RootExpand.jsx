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
  promptBox: {
    background: COLORS.dark,
    border: `4px solid ${COLORS.gray}`,
    padding: '14px 18px',
    marginBottom: '6px',
    textAlign: 'center',
    imageRendering: 'pixelated',
  },
  rootDisplay: {
    fontSize: '36px',
    fontFamily: FONTS.arabicDisplay,
    direction: 'rtl',
    color: COLORS.gold,
    marginBottom: '4px',
    letterSpacing: '8px',
  },
  rootMeaning: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.light,
    fontStyle: 'italic',
    marginBottom: '2px',
  },
  hint: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.brown,
    marginBottom: '12px',
    fontStyle: 'italic',
  },
  choices: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '10px',
  },
  choice: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '20px',
    padding: '12px 10px',
    border: `4px solid ${COLORS.dark}`,
    background: COLORS.beige,
    color: COLORS.dark,
    direction: 'rtl',
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.08),
      inset 3px 3px 0px 0px rgba(255,255,255,0.4)
    `,
    transition: 'none',
    imageRendering: 'pixelated',
    position: 'relative',
  },
  choiceSelected: {
    background: 'rgba(102,215,238,0.15)',
    borderColor: COLORS.blue,
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.08),
      inset 3px 3px 0px 0px rgba(102,215,238,0.3)
    `,
  },
  choiceCorrect: {
    background: 'rgba(46,204,113,0.2)',
    borderColor: COLORS.green,
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.08),
      inset 3px 3px 0px 0px rgba(46,204,113,0.3)
    `,
  },
  choiceWrong: {
    background: 'rgba(240,49,49,0.15)',
    borderColor: COLORS.red,
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.08),
      inset 3px 3px 0px 0px rgba(240,49,49,0.2)
    `,
  },
  choiceMissed: {
    background: 'rgba(46,204,113,0.08)',
    borderColor: COLORS.green,
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.08),
      inset 3px 3px 0px 0px rgba(46,204,113,0.15)
    `,
  },
  englishLabel: {
    fontFamily: FONTS.pixel,
    fontSize: '7px',
    color: COLORS.brown,
    position: 'absolute',
    bottom: '2px',
    left: '4px',
    right: '4px',
    textAlign: 'center',
  },
  submitBtn: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    padding: '10px 20px',
    border: `3px solid ${COLORS.darkGold}`,
    background: COLORS.xpGold,
    color: COLORS.brown,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    imageRendering: 'pixelated',
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.15),
      inset 3px 3px 0px 0px rgba(255,255,255,0.3)
    `,
  },
  submitDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  selectedCount: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.brown,
    marginBottom: '8px',
  },
};

/**
 * RootExpand — Multi-select root expansion quiz.
 *
 * Shows a trilateral Arabic root and 6 word options.
 * Player selects ALL words derived from that root, then submits.
 *
 * Props:
 *   word     — { rootExpansion } with root, rootDisplay, meaning, correctCount
 *   options  — [{ label, value, correct, english }] — 6 options (mix of derived + distractors)
 *   feedback — null | { correct, selected, correctAnswer }
 *   onAnswer — (JSON string of selected values) => void
 */
export default function RootExpand({ word, options, onAnswer, feedback }) {
  const formatArabic = useFormatArabic();

  const [selected, setSelected] = useState(new Set());

  // Reset on new word
  useEffect(() => {
    setSelected(new Set());
  }, [word?.id]);

  const rootData = word.rootExpansion || {};
  const rootDisplay = rootData.rootDisplay || word.arabic || '';
  const rootMeaning = rootData.meaning || '';
  const correctCount = rootData.correctCount || options.filter((o) => o.correct).length;

  const toggleSelection = (value) => {
    if (feedback) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (feedback || selected.size === 0) return;
    // Send as JSON array of selected values
    const selectedArray = Array.from(selected);
    onAnswer(JSON.stringify(selectedArray));
  };

  return (
    <div role="group" aria-label={`Root expansion: select words derived from root "${rootDisplay}" meaning "${rootMeaning}"`}>
      <div style={styles.instruction} id="re-instruction">Select all words derived from this root:</div>
      <div style={styles.promptBox} aria-label={`Root: ${rootDisplay}, meaning: "${rootMeaning}"`}>
        <div style={styles.rootDisplay}>{formatArabic(rootDisplay)}</div>
        <div style={styles.rootMeaning}>Root meaning: "{rootMeaning}"</div>
      </div>
      <div style={styles.hint} aria-label={`Select ${correctCount} correct words, then submit`}>
        Tap to select, then submit ({correctCount} correct words)
      </div>
      <div style={styles.choices} role="group" aria-label="Word choices" aria-describedby="re-instruction">
        {options.map((c, i) => {
          const isSelected = selected.has(c.value);
          let extraStyle = {};

          if (feedback) {
            // After submission: show correct/wrong/missed
            if (c.correct && selected.has(c.value)) {
              extraStyle = styles.choiceCorrect; // correctly selected
            } else if (!c.correct && selected.has(c.value)) {
              extraStyle = styles.choiceWrong; // incorrectly selected
            } else if (c.correct && !selected.has(c.value)) {
              extraStyle = styles.choiceMissed; // missed correct answer
            }
          } else if (isSelected) {
            extraStyle = styles.choiceSelected;
          }

          return (
            <button
              key={i}
              style={{ ...styles.choice, ...extraStyle }}
              onClick={() => toggleSelection(c.value)}
              disabled={!!feedback}
              aria-pressed={isSelected}
              aria-label={`${c.label}${c.english ? ` (${c.english})` : ''}${isSelected ? ' — selected' : ''}${feedback && c.correct && selected.has(c.value) ? ' (correct)' : ''}${feedback && !c.correct && selected.has(c.value) ? ' (incorrect)' : ''}${feedback && c.correct && !selected.has(c.value) ? ' (missed)' : ''}`}
            >
              {formatArabic(c.label)}
              {c.english && <span style={styles.englishLabel}>{c.english}</span>}
            </button>
          );
        })}
      </div>

      {!feedback && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            style={{
              ...styles.submitBtn,
              ...(selected.size === 0 ? styles.submitDisabled : {}),
            }}
            onClick={handleSubmit}
            disabled={selected.size === 0}
            aria-label={`Submit ${selected.size} selected words`}
          >
            Submit
          </button>
          <span style={styles.selectedCount} aria-live="polite">
            {selected.size} selected
          </span>
        </div>
      )}
    </div>
  );
}
