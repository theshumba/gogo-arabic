import { useState, useEffect } from 'react';
import { useFormatArabic } from '../../hooks/useFormatArabic.js';
import { COLORS, FONTS } from '../../styles/theme.js';

/**
 * VERB_PARADIGMS — Embedded conjugation data sourced from grammar.js conjugation-drill exercises.
 * Each entry provides a verb root + paradigm context + correct form + distractors.
 * Used by useQuiz.js buildChoices to generate GrammarFill options.
 * Exported so useQuiz.js can import without circular issues.
 */
export const VERB_PARADIGMS = [
  // كَتَبَ (to write) — present tense
  {
    verb: 'كَتَبَ',
    root: 'ك-ت-ب',
    meaning: 'to write',
    paradigm: 'present',
    pronoun: { en: 'I (أنا)', ar: 'أنا' },
    correctForm: 'أكتب',
    distractors: ['يكتب', 'تكتب', 'نكتب'],
  },
  {
    verb: 'كَتَبَ',
    root: 'ك-ت-ب',
    meaning: 'to write',
    paradigm: 'present',
    pronoun: { en: 'He (هو)', ar: 'هو' },
    correctForm: 'يكتب',
    distractors: ['أكتب', 'تكتب', 'نكتب'],
  },
  {
    verb: 'كَتَبَ',
    root: 'ك-ت-ب',
    meaning: 'to write',
    paradigm: 'present',
    pronoun: { en: 'We (نحن)', ar: 'نحن' },
    correctForm: 'نكتب',
    distractors: ['أكتب', 'يكتب', 'تكتب'],
  },
  // ذَهَبَ (to go) — present tense
  {
    verb: 'ذَهَبَ',
    root: 'ذ-ه-ب',
    meaning: 'to go',
    paradigm: 'present',
    pronoun: { en: 'We (نحن)', ar: 'نحن' },
    correctForm: 'نذهب',
    distractors: ['أذهب', 'يذهب', 'تذهب'],
  },
  {
    verb: 'ذَهَبَ',
    root: 'ذ-ه-ب',
    meaning: 'to go',
    paradigm: 'present',
    pronoun: { en: 'I (أنا)', ar: 'أنا' },
    correctForm: 'أذهب',
    distractors: ['يذهب', 'تذهب', 'نذهب'],
  },
  {
    verb: 'ذَهَبَ',
    root: 'ذ-ه-ب',
    meaning: 'to go',
    paradigm: 'present',
    pronoun: { en: 'He (هو)', ar: 'هو' },
    correctForm: 'يذهب',
    distractors: ['أذهب', 'تذهب', 'نذهب'],
  },
  // قَرَأَ (to read) — present tense
  {
    verb: 'قَرَأَ',
    root: 'ق-ر-أ',
    meaning: 'to read',
    paradigm: 'present',
    pronoun: { en: 'I (أنا)', ar: 'أنا' },
    correctForm: 'أقرأ',
    distractors: ['يقرأ', 'تقرأ', 'نقرأ'],
  },
  {
    verb: 'قَرَأَ',
    root: 'ق-ر-أ',
    meaning: 'to read',
    paradigm: 'present',
    pronoun: { en: 'She (هي)', ar: 'هي' },
    correctForm: 'تقرأ',
    distractors: ['أقرأ', 'يقرأ', 'نقرأ'],
  },
  // فَهِمَ (to understand) — present tense
  {
    verb: 'فَهِمَ',
    root: 'ف-ه-م',
    meaning: 'to understand',
    paradigm: 'present',
    pronoun: { en: 'I (أنا)', ar: 'أنا' },
    correctForm: 'أفهم',
    distractors: ['يفهم', 'تفهم', 'نفهم'],
  },
  {
    verb: 'فَهِمَ',
    root: 'ف-ه-م',
    meaning: 'to understand',
    paradigm: 'present',
    pronoun: { en: 'He (هو)', ar: 'هو' },
    correctForm: 'يفهم',
    distractors: ['أفهم', 'تفهم', 'نفهم'],
  },
  // سَكَنَ (to live/dwell) — present tense
  {
    verb: 'سَكَنَ',
    root: 'س-ك-ن',
    meaning: 'to live/dwell',
    paradigm: 'present',
    pronoun: { en: 'We (نحن)', ar: 'نحن' },
    correctForm: 'نسكن',
    distractors: ['أسكن', 'يسكن', 'تسكن'],
  },
  {
    verb: 'سَكَنَ',
    root: 'س-ك-ن',
    meaning: 'to live/dwell',
    paradigm: 'present',
    pronoun: { en: 'You m. (أنتَ)', ar: 'أنتَ' },
    correctForm: 'تسكن',
    distractors: ['أسكن', 'يسكن', 'نسكن'],
  },
  // سَافَرَ (to travel) — present tense
  {
    verb: 'سَافَرَ',
    root: 'س-ف-ر',
    meaning: 'to travel',
    paradigm: 'present',
    pronoun: { en: 'I (أنا)', ar: 'أنا' },
    correctForm: 'أسافر',
    distractors: ['يسافر', 'تسافر', 'نسافر'],
  },
  {
    verb: 'سَافَرَ',
    root: 'س-ف-ر',
    meaning: 'to travel',
    paradigm: 'present',
    pronoun: { en: 'He (هو)', ar: 'هو' },
    correctForm: 'يسافر',
    distractors: ['أسافر', 'تسافر', 'نسافر'],
  },
  {
    verb: 'سَافَرَ',
    root: 'س-ف-ر',
    meaning: 'to travel',
    paradigm: 'present',
    pronoun: { en: 'We (نحن)', ar: 'نحن' },
    correctForm: 'نسافر',
    distractors: ['أسافر', 'يسافر', 'تسافر'],
  },
];

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
  verbMeaning: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.light,
    fontStyle: 'italic',
    marginBottom: '6px',
  },
  paradigmLabel: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.white,
    marginBottom: '6px',
    textTransform: 'lowercase',
  },
  pronounAr: {
    fontSize: '18px',
    fontFamily: FONTS.arabicDisplay,
    direction: 'rtl',
    color: COLORS.blue,
    marginBottom: '2px',
  },
  pronoun: {
    fontFamily: FONTS.pixel,
    fontSize: '11px',
    color: COLORS.white,
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

/**
 * GrammarFill — Conjugation fill-in-blank quiz.
 *
 * Shows a verb root + paradigm context (pronoun + tense) and 4 conjugated form choices.
 * The correct answer is a conjugated form from VERB_PARADIGMS (not word.arabic).
 *
 * options[i]: { label, value, correct, paradigmContext: { verb, root, meaning, paradigm, pronoun } }
 * paradigmContext is set by useQuiz buildChoices — all display data comes from options[0].paradigmContext.
 */
export default function GrammarFill({ word, options, onAnswer, feedback }) {
  const formatArabic = useFormatArabic();

  // Deterministic paradigm index seeded from word.id — reset when word changes
  const [paradigmIndex, setParadigmIndex] = useState(() => {
    return word?.id ? word.id.charCodeAt(0) % VERB_PARADIGMS.length : 0;
  });

  useEffect(() => {
    setParadigmIndex(word?.id ? word.id.charCodeAt(0) % VERB_PARADIGMS.length : 0);
  }, [word?.id]);

  // All display data comes from paradigmContext on the first option
  const paradigmContext = options[0]?.paradigmContext;

  // Fallback to embedded data if paradigmContext not yet populated (e.g. during test)
  const displayVerb = paradigmContext?.verb || VERB_PARADIGMS[paradigmIndex]?.verb || '';
  const displayRoot = paradigmContext?.root || VERB_PARADIGMS[paradigmIndex]?.root || '';
  const displayMeaning = paradigmContext?.meaning || VERB_PARADIGMS[paradigmIndex]?.meaning || '';
  const displayParadigm = paradigmContext?.paradigm || VERB_PARADIGMS[paradigmIndex]?.paradigm || '';
  const displayPronoun = paradigmContext?.pronoun || VERB_PARADIGMS[paradigmIndex]?.pronoun || { en: '', ar: '' };

  return (
    <div>
      <div style={styles.instruction}>Complete the conjugation:</div>
      <div style={styles.promptBox}>
        <div style={styles.verbRoot}>{formatArabic(displayVerb)}</div>
        <div style={styles.verbMeaning}>"{displayMeaning}"</div>
        <div style={styles.paradigmLabel}>{displayParadigm} tense</div>
        <div style={styles.pronounAr}>{formatArabic(displayPronoun.ar)}</div>
        <div style={styles.pronoun}>{displayPronoun.en}</div>
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
