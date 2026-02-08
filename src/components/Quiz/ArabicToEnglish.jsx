import { useFormatArabic } from '../../hooks/useFormatArabic.js';
import { COLORS, FONTS } from '../../styles/theme.js';

const styles = {
  prompt: {
    fontSize: '36px',
    fontFamily: FONTS.arabic,
    direction: 'rtl',
    margin: '12px 0 8px',
    color: COLORS.gold,
    textShadow: `1px 1px 0px ${COLORS.brown}`,
  },
  transliteration: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    fontStyle: 'italic',
    color: COLORS.brown,
    marginBottom: '16px',
  },
  choices: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  choice: {
    fontFamily: FONTS.pixel,
    fontSize: '11px',
    padding: '14px 22px',
    border: `4px solid ${COLORS.dark}`,
    background: COLORS.beige,
    color: COLORS.dark,
    cursor: 'pointer',
    textAlign: 'left',
    letterSpacing: '0.5px',
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.08),
      inset 3px 3px 0px 0px rgba(255,255,255,0.4)
    `,
    transition: 'none',
    imageRendering: 'pixelated',
  },
  choiceHover: {
    background: COLORS.creamyBeige,
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
};

export default function ArabicToEnglish({ word, choices, feedback, onAnswer }) {
  const formatArabic = useFormatArabic();

  return (
    <div>
      <div style={styles.prompt}>{formatArabic(word.arabic)}</div>
      {word.transliteration && (
        <div style={styles.transliteration}>{word.transliteration}</div>
      )}
      <div style={styles.choices}>
        {choices.map((c, i) => {
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
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
