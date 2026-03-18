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
    fontSize: '38px',
    fontFamily: FONTS.arabicDisplay,
    direction: 'rtl',
    margin: '12px 0 6px',
    color: COLORS.gold,
    textShadow: `1px 1px 0px ${COLORS.brown}`,
  },
  english: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.brown,
    marginBottom: '18px',
    fontStyle: 'italic',
  },
  choices: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  choice: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '22px',
    padding: '14px 12px',
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

export default function RootIdentifier({ word, options, onAnswer, feedback }) {
  const formatArabic = useFormatArabic();

  return (
    <div>
      <div style={styles.instruction}>Identify the trilateral root:</div>
      <div style={styles.prompt}>{formatArabic(word.arabic)}</div>
      <div style={styles.english}>{word.english}</div>
      <div style={styles.choices}>
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
            >
              {formatArabic(c.label)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
