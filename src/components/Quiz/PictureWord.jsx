import { useFormatArabic } from '../../hooks/useFormatArabic.js';
import { COLORS, FONTS } from '../../styles/theme.js';

// Category emoji icons (text-only, no images needed)
const CATEGORY_ICONS = {
  food: '🍽',
  animals: '🐾',
  body: '💪',
  colors: '🎨',
  numbers: '🔢',
  family: '👪',
  nature: '🌿',
  travel: '✈',
  time: '⏰',
  adjectives: '✨',
  verbs: '⚡',
  places: '🏛',
  clothing: '👕',
  household: '🏠',
  general: '📖',
};

const styles = {
  instruction: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.brown,
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  hintCard: {
    background: COLORS.dark,
    border: `4px solid ${COLORS.gray}`,
    padding: '16px 18px',
    marginBottom: '14px',
    textAlign: 'center',
    imageRendering: 'pixelated',
  },
  categoryIcon: {
    fontSize: '28px',
    marginBottom: '6px',
  },
  categoryBadge: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.cyan,
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: '8px',
  },
  description: {
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    color: COLORS.white,
    lineHeight: '1.7',
  },
  choices: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  choice: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '20px',
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
  translitHint: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.light,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: '4px',
  },
};

/**
 * PictureWord — given a description/category hint, pick the correct Arabic word.
 * Text-only, no images. Uses category + english description as the clue.
 *
 * options[i]: { label: Arabic, value: Arabic, correct: bool, english: string }
 */
export default function PictureWord({ word, options, onAnswer, feedback }) {
  const formatArabic = useFormatArabic();
  const icon = CATEGORY_ICONS[word.category] || CATEGORY_ICONS.general;

  return (
    <div>
      <div style={styles.instruction}>Which Arabic word matches?</div>
      <div style={styles.hintCard}>
        <div style={styles.categoryIcon}>{icon}</div>
        <div style={styles.categoryBadge}>{word.category}</div>
        <div style={styles.description}>{word.english}</div>
        {word.transliteration && (
          <div style={styles.translitHint}>({word.transliteration})</div>
        )}
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
