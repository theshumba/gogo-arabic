import { useFormatArabic } from '../../hooks/useFormatArabic.js';
import { COLORS, FONTS } from '../../styles/theme.js';

const BLANK_PLACEHOLDER = '______';

const styles = {
  instruction: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.brown,
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  sentenceBox: {
    background: COLORS.dark,
    border: `4px solid ${COLORS.gray}`,
    padding: '14px 18px',
    marginBottom: '6px',
    direction: 'rtl',
    textAlign: 'center',
    imageRendering: 'pixelated',
  },
  sentence: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '22px',
    color: COLORS.white,
    direction: 'rtl',
    lineHeight: '1.6',
  },
  blank: {
    color: COLORS.gold,
    fontFamily: FONTS.pixel,
    fontSize: '14px',
    letterSpacing: '2px',
  },
  englishHint: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.brown,
    fontStyle: 'italic',
    marginBottom: '16px',
    marginTop: '4px',
  },
  choices: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  choice: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '22px',
    padding: '12px 20px',
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

/**
 * Renders an Arabic sentence with the target word replaced by a blank.
 * Sentence is stored in options[0].sentence — provided by useQuiz buildChoices.
 */
export default function FillInBlank({ word, options, onAnswer, feedback }) {
  const formatArabic = useFormatArabic();

  // The sentence comes from word.exampleSentence; fall back to a simple frame
  const rawSentence = word.exampleSentence?.arabic || null;
  const englishSentence = word.exampleSentence?.english || word.english;

  // Replace the Arabic word (strip diacritics for matching) with a blank marker
  let displaySentence = null;
  if (rawSentence) {
    const normalize = (s) => s.replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '').trim();
    const normalizedArabic = normalize(word.arabic);
    // Try exact match first, then normalized
    const replaced = rawSentence.includes(word.arabic)
      ? rawSentence.replace(word.arabic, BLANK_PLACEHOLDER)
      : rawSentence.replace(
          new RegExp(normalizedArabic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
          BLANK_PLACEHOLDER
        );
    displaySentence = replaced !== rawSentence ? replaced : null;
  }

  const renderSentence = () => {
    if (!displaySentence) {
      return (
        <span style={styles.sentence}>
          <span style={styles.blank}>{BLANK_PLACEHOLDER}</span>
          {' '}
          <span style={{ color: COLORS.light, fontSize: '14px', fontFamily: FONTS.pixel }}>
            ({word.english})
          </span>
        </span>
      );
    }

    const parts = displaySentence.split(BLANK_PLACEHOLDER);
    return (
      <span style={styles.sentence}>
        {parts.map((part, i) => (
          <span key={i}>
            {formatArabic(part)}
            {i < parts.length - 1 && <span style={styles.blank}>{BLANK_PLACEHOLDER}</span>}
          </span>
        ))}
      </span>
    );
  };

  return (
    <div>
      <div style={styles.instruction}>Fill in the blank:</div>
      <div style={styles.sentenceBox}>{renderSentence()}</div>
      <div style={styles.englishHint}>{englishSentence}</div>
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
