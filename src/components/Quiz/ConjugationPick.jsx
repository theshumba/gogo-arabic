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
    marginBottom: '14px',
    textAlign: 'center',
    imageRendering: 'pixelated',
  },
  verbRoot: {
    fontSize: '32px',
    fontFamily: FONTS.arabicDisplay,
    direction: 'rtl',
    color: COLORS.gold,
    marginBottom: '4px',
  },
  pronoun: {
    fontFamily: FONTS.pixel,
    fontSize: '11px',
    color: COLORS.white,
    marginBottom: '2px',
  },
  pronounAr: {
    fontSize: '18px',
    fontFamily: FONTS.arabicDisplay,
    direction: 'rtl',
    color: COLORS.blue,
    marginBottom: '2px',
  },
  verbMeaning: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.light,
    fontStyle: 'italic',
  },
  choices: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  choice: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '20px',
    padding: '14px 10px',
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

// Common Arabic pronouns for conjugation prompts
const PRONOUNS = [
  { en: 'I (أنا)', ar: 'أنا' },
  { en: 'You m. (أنتَ)', ar: 'أنتَ' },
  { en: 'You f. (أنتِ)', ar: 'أنتِ' },
  { en: 'He (هو)', ar: 'هو' },
  { en: 'She (هي)', ar: 'هي' },
  { en: 'We (نحن)', ar: 'نحن' },
];

/**
 * ConjugationPick — given a verb root + pronoun label, pick the correct conjugated form.
 *
 * options[i]: { label: Arabic conjugated form, value: Arabic form, correct: bool, pronoun: { en, ar } }
 * The pronoun to use is embedded in options[0].pronoun (set by useQuiz buildChoices).
 */
export default function ConjugationPick({ word, options, onAnswer, feedback }) {
  const formatArabic = useFormatArabic();

  // Pronoun for this question — stored on the correct option or fall back to a random pick
  const pronounObj = options.find((o) => o.pronoun)?.pronoun
    || PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)];

  return (
    <div>
      <div style={styles.instruction}>Pick the correct conjugation:</div>
      <div style={styles.promptBox}>
        <div style={styles.verbRoot}>{formatArabic(word.arabic)}</div>
        <div style={styles.verbMeaning}>"{word.english}"</div>
        <div style={{ marginTop: '8px' }}>
          <div style={styles.pronoun}>{pronounObj.en}</div>
          <div style={styles.pronounAr}>{formatArabic(pronounObj.ar)}</div>
        </div>
      </div>
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
