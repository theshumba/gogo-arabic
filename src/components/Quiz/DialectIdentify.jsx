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
    padding: '18px 22px',
    marginBottom: '14px',
    textAlign: 'center',
    imageRendering: 'pixelated',
  },
  phrase: {
    fontSize: '28px',
    fontFamily: FONTS.arabicDisplay,
    direction: 'rtl',
    color: COLORS.gold,
    marginBottom: '6px',
    lineHeight: '1.6',
  },
  transliteration: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.light,
    fontStyle: 'italic',
    marginBottom: '4px',
  },
  meaning: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.white,
  },
  choices: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  choice: {
    fontFamily: FONTS.pixel,
    fontSize: '11px',
    padding: '14px 10px',
    border: `4px solid ${COLORS.dark}`,
    background: COLORS.beige,
    color: COLORS.dark,
    cursor: 'pointer',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.08),
      inset 3px 3px 0px 0px rgba(255,255,255,0.4)
    `,
    transition: 'none',
    imageRendering: 'pixelated',
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
  explanation: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.green,
    marginTop: '10px',
    lineHeight: '1.6',
    padding: '8px',
    background: 'rgba(46,204,113,0.08)',
    border: `2px solid rgba(46,204,113,0.2)`,
  },
};

/**
 * DialectIdentify — Dialect identification quiz.
 *
 * Shows an Arabic phrase with transliteration and meaning.
 * Player identifies which dialect: MSA, Egyptian, Levantine, or Gulf.
 *
 * Props:
 *   word     — { dialectItem } with phrase, transliteration, english, dialect, explanation
 *   options  — [{ label, value, correct }] — 4 dialect choices
 *   feedback — null | { correct, selected, correctAnswer }
 *   onAnswer — (value) => void
 */
export default function DialectIdentify({ word, options, onAnswer, feedback }) {
  const formatArabic = useFormatArabic();

  // word.dialectItem holds the full dialect item data set by buildChoices
  const item = word.dialectItem || {};
  const phrase = item.phrase || word.arabic || '';
  const transliteration = item.transliteration || word.transliteration || '';
  const meaning = item.english || word.english || '';
  const explanation = item.explanation || '';

  return (
    <div role="group" aria-label={`Dialect identify: which dialect is "${transliteration || phrase}"?`}>
      <div style={styles.instruction} id="dialect-instruction">Which dialect is this phrase?</div>
      <div style={styles.promptBox} aria-label={`Phrase: ${transliteration || phrase}, meaning: ${meaning}`}>
        <div style={styles.phrase}>{formatArabic(phrase)}</div>
        <div style={styles.transliteration}>{transliteration}</div>
        <div style={styles.meaning}>{meaning}</div>
      </div>
      <div style={styles.choices} role="group" aria-label="Dialect choices" aria-describedby="dialect-instruction">
        {options.map((c, i) => {
          let extraStyle = {};
          if (feedback) {
            if (c.correct) extraStyle = styles.choiceCorrect;
            else if (c.value === feedback.selected && !c.correct) extraStyle = styles.choiceWrong;
          }
          return (
            <button
              key={i}
              style={{ ...styles.choice, ...extraStyle }}
              onClick={() => !feedback && onAnswer(c.value)}
              disabled={!!feedback}
              aria-label={`Dialect ${i + 1}: ${c.label}${feedback && c.correct ? ' (correct answer)' : ''}${feedback && c.value === feedback.selected && !c.correct ? ' (incorrect)' : ''}`}
            >
              {c.label}
            </button>
          );
        })}
      </div>
      {feedback && feedback.correct && explanation && (
        <div style={styles.explanation} role="alert">{explanation}</div>
      )}
      {feedback && !feedback.correct && explanation && (
        <div style={{ ...styles.explanation, color: COLORS.red, background: 'rgba(240,49,49,0.06)', borderColor: 'rgba(240,49,49,0.2)' }} role="alert">
          {explanation}
        </div>
      )}
    </div>
  );
}
