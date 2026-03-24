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
    marginBottom: '6px',
    textAlign: 'center',
    imageRendering: 'pixelated',
  },
  expression: {
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
    marginBottom: '2px',
  },
  contextLabel: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.brown,
    marginBottom: '12px',
    fontStyle: 'italic',
  },
  choices: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  choice: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    padding: '14px 16px',
    border: `4px solid ${COLORS.dark}`,
    background: COLORS.beige,
    color: COLORS.dark,
    cursor: 'pointer',
    textAlign: 'left',
    lineHeight: '1.6',
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
 * CulturalContext — Cultural expression matching quiz.
 *
 * Shows an Arabic expression/proverb and asks the player to match it
 * to the correct cultural situation from 4 options.
 *
 * Props:
 *   word     — { culturalItem } with expression, transliteration, explanation
 *   options  — [{ label, value, correct }] — 4 situation descriptions
 *   feedback — null | { correct, selected, correctAnswer }
 *   onAnswer — (value) => void
 */
export default function CulturalContext({ word, options, onAnswer, feedback }) {
  const formatArabic = useFormatArabic();

  const item = word.culturalItem || {};
  const expression = item.expression || word.arabic || '';
  const transliteration = item.transliteration || word.transliteration || '';
  const explanation = item.explanation || '';

  return (
    <div role="group" aria-label={`Cultural context: when is "${transliteration || expression}" used?`}>
      <div style={styles.instruction} id="cc-instruction">When is this expression used?</div>
      <div style={styles.promptBox} aria-label={`Expression: ${transliteration || expression}`}>
        <div style={styles.expression}>{formatArabic(expression)}</div>
        <div style={styles.transliteration}>{transliteration}</div>
      </div>
      <div style={styles.contextLabel}>Match the expression to its cultural context:</div>
      <div style={styles.choices} role="group" aria-label="Context choices" aria-describedby="cc-instruction">
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
              aria-label={`Context ${i + 1}: ${c.label}${feedback && c.correct ? ' (correct answer)' : ''}${feedback && c.value === feedback.selected && !c.correct ? ' (incorrect)' : ''}`}
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
