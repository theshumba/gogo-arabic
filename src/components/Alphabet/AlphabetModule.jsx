import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addXP } from '../../store/slices/playerSlice.js';
import { XP_REWARDS } from '../../utils/xpCalculator.js';
import { shuffle } from '../../utils/shuffle.js';
import ArabicKeyboard from '../Keyboard/ArabicKeyboard.jsx';
import alphabetData from '../../data/alphabet.json';
import { COLORS, FONTS, pixelBtnGold, pixelBtnDark, pixelPanel } from '../../styles/theme.js';

const { letters, groups } = alphabetData;

// Steps: intro -> forms -> vowels -> recognition -> writing
const STEPS = ['intro', 'forms', 'vowels', 'recognition', 'writing'];

const styles = {
  container: {
    width: '100%',
    height: '100%',
    background: COLORS.dark,
    color: COLORS.white,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: FONTS.pixel,
    imageRendering: 'pixelated',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: `4px solid ${COLORS.gray}`,
    background: COLORS.dark,
    boxShadow: `
      inset 0 -3px 0 0 rgba(0,0,0,0.3)
    `,
  },
  backBtn: {
    ...pixelBtnDark,
    padding: '8px 16px',
    fontSize: '9px',
  },
  title: {
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    color: COLORS.xpGold,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  headerProgress: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.lightGray,
  },
  body: {
    flex: 1,
    overflow: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  // Group list
  groupGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
    width: '100%',
    maxWidth: '800px',
  },
  groupCard: {
    ...pixelPanel,
    background: COLORS.beige,
    border: `4px solid ${COLORS.dark}`,
    padding: '14px',
    cursor: 'pointer',
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.15),
      inset 3px 3px 0px 0px rgba(255,255,255,0.4),
      0 4px 0 0 ${COLORS.brown}
    `,
    transition: 'transform 0.05s',
  },
  groupCardComplete: {
    border: `4px solid ${COLORS.green}`,
    background: '#e8f8e8',
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.1),
      inset 3px 3px 0px 0px rgba(255,255,255,0.3),
      0 4px 0 0 #1a9a4a
    `,
  },
  groupCardLocked: {
    opacity: 0.4,
    cursor: 'default',
  },
  groupName: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.brown,
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  groupLetters: {
    fontSize: '28px',
    fontFamily: FONTS.arabic,
    direction: 'rtl',
    letterSpacing: '8px',
    color: COLORS.dark,
  },
  groupProgress: {
    marginTop: '10px',
    height: '6px',
    background: COLORS.dark,
    border: `2px solid ${COLORS.dark}`,
    overflow: 'hidden',
  },
  groupProgressFill: {
    height: '100%',
    background: COLORS.green,
    transition: 'width 0.3s',
  },
  // Letter lesson
  bigLetter: {
    fontSize: '120px',
    fontFamily: FONTS.arabic,
    color: COLORS.xpGold,
    lineHeight: 1.2,
    textShadow: `3px 3px 0 ${COLORS.brown}`,
  },
  letterName: {
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    marginTop: '10px',
    color: COLORS.lightGray,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  sectionTitle: {
    fontFamily: FONTS.pixel,
    fontSize: '11px',
    marginBottom: '12px',
    color: COLORS.xpGold,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  formsRow: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginTop: '20px',
    flexWrap: 'wrap',
  },
  formBox: {
    ...pixelPanel,
    textAlign: 'center',
    padding: '14px 18px',
    background: COLORS.gray,
    border: `4px solid ${COLORS.dark}`,
    color: COLORS.white,
    minWidth: '90px',
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.3),
      inset 3px 3px 0px 0px rgba(255,255,255,0.08)
    `,
  },
  formLabel: {
    fontFamily: FONTS.pixel,
    fontSize: '8px',
    color: COLORS.lightGray,
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  formLetter: {
    fontSize: '48px',
    fontFamily: FONTS.arabic,
    color: COLORS.white,
  },
  vowelRow: {
    display: 'flex',
    gap: '14px',
    justifyContent: 'center',
    marginTop: '20px',
  },
  vowelBox: {
    ...pixelPanel,
    textAlign: 'center',
    padding: '14px 20px',
    background: COLORS.gray,
    border: `4px solid ${COLORS.dark}`,
    color: COLORS.white,
    cursor: 'pointer',
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.3),
      inset 3px 3px 0px 0px rgba(255,255,255,0.08),
      0 3px 0 0 #1a191b
    `,
  },
  vowelArabic: {
    fontSize: '40px',
    fontFamily: FONTS.arabic,
    color: COLORS.white,
  },
  vowelSound: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.xpGold,
    marginTop: '6px',
  },
  vowelLabel: {
    fontFamily: FONTS.pixel,
    fontSize: '7px',
    color: COLORS.lightGray,
    marginTop: '4px',
    textTransform: 'uppercase',
  },
  // Quiz
  quizPrompt: {
    fontFamily: FONTS.pixel,
    fontSize: '11px',
    color: COLORS.lightGray,
    marginBottom: '20px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textAlign: 'center',
  },
  quizChoices: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    maxWidth: '400px',
    width: '100%',
  },
  quizChoice: {
    ...pixelPanel,
    padding: '16px',
    border: `4px solid ${COLORS.dark}`,
    background: COLORS.beige,
    color: COLORS.dark,
    fontSize: '36px',
    fontFamily: FONTS.arabic,
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.15),
      inset 3px 3px 0px 0px rgba(255,255,255,0.4),
      0 4px 0 0 ${COLORS.brown}
    `,
    transition: 'transform 0.05s',
  },
  quizCorrect: {
    background: '#c8f7c8',
    border: `4px solid ${COLORS.green}`,
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.1),
      inset 3px 3px 0px 0px rgba(255,255,255,0.3),
      0 4px 0 0 #1a9a4a
    `,
  },
  quizWrong: {
    background: '#f7c8c8',
    border: `4px solid ${COLORS.red}`,
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.1),
      inset 3px 3px 0px 0px rgba(255,255,255,0.3),
      0 4px 0 0 #a01010
    `,
  },
  // Writing quiz input display
  writingDisplay: {
    fontSize: '48px',
    fontFamily: FONTS.arabic,
    minHeight: '64px',
    padding: '8px 20px',
    background: COLORS.gray,
    border: `4px solid ${COLORS.dark}`,
    marginBottom: '10px',
    direction: 'rtl',
    color: COLORS.white,
    textAlign: 'center',
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.3),
      inset 3px 3px 0px 0px rgba(255,255,255,0.05)
    `,
  },
  writingCorrectBorder: {
    border: `4px solid ${COLORS.green}`,
  },
  writingWrongBorder: {
    border: `4px solid ${COLORS.red}`,
  },
  writingError: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.red,
    marginBottom: '8px',
  },
  // Buttons
  nextBtn: {
    ...pixelBtnGold,
    marginTop: '24px',
    padding: '12px 28px',
    fontSize: '10px',
  },
  stepDots: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    margin: '14px 0',
  },
  dot: {
    width: '10px',
    height: '10px',
    background: COLORS.gray,
    border: `2px solid ${COLORS.dark}`,
  },
  dotActive: {
    background: COLORS.xpGold,
    border: `2px solid ${COLORS.brown}`,
  },
  dotDone: {
    background: COLORS.green,
    border: `2px solid #1a9a4a`,
  },
};

export default function AlphabetModule({ onBack }) {
  const dispatch = useDispatch();
  useSelector((s) => s.player.lettersLearned);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [currentLetterIdx, setCurrentLetterIdx] = useState(0);
  const [step, setStep] = useState(0); // index into STEPS
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [writingInput, setWritingInput] = useState('');
  const [writingResult, setWritingResult] = useState(null);

  const groupedLetters = useMemo(() => {
    const map = {};
    letters.forEach((l) => {
      if (!map[l.group]) map[l.group] = [];
      map[l.group].push(l);
    });
    return map;
  }, []);

  // Generate quiz choices (must be before early returns to satisfy hook rules)
  const quizChoices = useMemo(() => {
    if (selectedGroup === null) return [];
    const gl = groupedLetters[selectedGroup] || [];
    const cl = gl[currentLetterIdx];
    if (!cl) return [];
    const sameGroup = gl.filter((l) => l.id !== cl.id);
    const otherLetters = letters.filter(
      (l) => l.group !== selectedGroup && l.id !== cl.id
    );
    const pool = [...sameGroup, ...shuffle(otherLetters)];
    const distractors = pool.slice(0, 3);
    return shuffle([...distractors, cl]);
  }, [selectedGroup, currentLetterIdx, groupedLetters]);

  // Group list view
  if (selectedGroup === null) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={onBack}>Back</button>
          <div style={styles.title}>Arabic Alphabet</div>
          <div style={styles.headerProgress}>
            {completedIds.size}/28 letters
          </div>
        </div>
        <div style={styles.body}>
          <div style={styles.groupGrid}>
            {groups.map((g) => {
              const groupLetters = groupedLetters[g.number] || [];
              const done = groupLetters.filter((l) => completedIds.has(l.id)).length;
              const total = groupLetters.length;
              const isComplete = done === total && total > 0;
              return (
                <div
                  key={g.number}
                  style={{ ...styles.groupCard, ...(isComplete ? styles.groupCardComplete : {}) }}
                  onClick={() => {
                    setSelectedGroup(g.number);
                    setCurrentLetterIdx(0);
                    setStep(0);
                    setQuizAnswer(null);
                    setWritingInput('');
                    setWritingResult(null);
                  }}
                >
                  <div style={styles.groupName}>Group {g.number}: {g.name}</div>
                  <div style={styles.groupLetters}>
                    {groupLetters.map((l) => l.letter).join(' ')}
                  </div>
                  <div style={styles.groupProgress}>
                    <div style={{ ...styles.groupProgressFill, width: `${(done / total) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Letter lesson view
  const groupLettersList = groupedLetters[selectedGroup] || [];
  const currentLetter = groupLettersList[currentLetterIdx];
  if (!currentLetter) {
    setSelectedGroup(null);
    return null;
  }

  const currentStep = STEPS[step];

  const goNextStep = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      setQuizAnswer(null);
      setWritingInput('');
      setWritingResult(null);
    } else {
      // Letter complete
      if (!completedIds.has(currentLetter.id)) {
        setCompletedIds(new Set([...completedIds, currentLetter.id]));
        dispatch(addXP(XP_REWARDS.LETTER_LEARNED));
      }
      // Next letter or back to group list
      if (currentLetterIdx < groupLettersList.length - 1) {
        setCurrentLetterIdx(currentLetterIdx + 1);
        setStep(0);
        setQuizAnswer(null);
        setWritingInput('');
        setWritingResult(null);
      } else {
        setSelectedGroup(null);
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => setSelectedGroup(null)}>
          Back
        </button>
        <div style={styles.title}>
          {currentLetter.name} — Group {selectedGroup}
        </div>
        <div style={styles.headerProgress}>
          {currentLetterIdx + 1}/{groupLettersList.length}
        </div>
      </div>

      {/* Step dots */}
      <div style={styles.stepDots}>
        {STEPS.map((s, i) => (
          <div
            key={s}
            style={{
              ...styles.dot,
              ...(i === step ? styles.dotActive : {}),
              ...(i < step ? styles.dotDone : {}),
            }}
          />
        ))}
      </div>

      <div style={styles.body}>
        {/* Step 1: Introduction */}
        {currentStep === 'intro' && (
          <>
            <div style={styles.bigLetter}>{currentLetter.letter}</div>
            <div style={styles.letterName}>
              {currentLetter.name} — &ldquo;{currentLetter.transliteration}&rdquo;
            </div>
            <button style={styles.nextBtn} onClick={goNextStep}>
              Next: Four Forms
            </button>
          </>
        )}

        {/* Step 2: Four Forms */}
        {currentStep === 'forms' && (
          <>
            <div style={styles.sectionTitle}>
              Four Forms of {currentLetter.name}
            </div>
            <div style={styles.formsRow}>
              {['isolated', 'initial', 'medial', 'final'].map((form) => (
                <div key={form} style={styles.formBox}>
                  <div style={styles.formLabel}>{form}</div>
                  <div style={styles.formLetter}>{currentLetter.forms[form]}</div>
                </div>
              ))}
            </div>
            <button style={styles.nextBtn} onClick={goNextStep}>
              Next: Vowel Sounds
            </button>
          </>
        )}

        {/* Step 3: Vowel Sounds */}
        {currentStep === 'vowels' && (
          <>
            <div style={styles.sectionTitle}>
              {currentLetter.name} with Vowels
            </div>
            <div style={styles.vowelRow}>
              {currentLetter.vowelCombinations.map((vc) => (
                <div key={vc.vowel} style={styles.vowelBox}>
                  <div style={styles.vowelArabic}>{vc.arabic}</div>
                  <div style={styles.vowelSound}>{vc.sound}</div>
                  <div style={styles.vowelLabel}>{vc.vowel}</div>
                </div>
              ))}
            </div>
            <button style={styles.nextBtn} onClick={goNextStep}>
              Next: Recognition Quiz
            </button>
          </>
        )}

        {/* Step 4: Recognition Quiz */}
        {currentStep === 'recognition' && (
          <>
            <div style={styles.quizPrompt}>
              Find the letter &ldquo;{currentLetter.name}&rdquo; ({currentLetter.transliteration})
            </div>
            <div style={styles.quizChoices}>
              {quizChoices.map((l) => {
                let extra = {};
                if (quizAnswer) {
                  if (l.id === currentLetter.id) extra = styles.quizCorrect;
                  else if (l.id === quizAnswer && l.id !== currentLetter.id) extra = styles.quizWrong;
                }
                return (
                  <button
                    key={l.id}
                    style={{ ...styles.quizChoice, ...extra }}
                    onClick={() => {
                      if (!quizAnswer) setQuizAnswer(l.id);
                    }}
                    disabled={!!quizAnswer}
                  >
                    {l.letter}
                  </button>
                );
              })}
            </div>
            {quizAnswer && (
              <button style={styles.nextBtn} onClick={goNextStep}>
                Next: Writing Quiz
              </button>
            )}
          </>
        )}

        {/* Step 5: Writing Quiz */}
        {currentStep === 'writing' && (
          <>
            <div style={styles.quizPrompt}>
              Type the letter &ldquo;{currentLetter.name}&rdquo; ({currentLetter.transliteration})
            </div>
            <div style={{
              ...styles.writingDisplay,
              ...(writingResult === null
                ? {}
                : writingResult
                  ? styles.writingCorrectBorder
                  : styles.writingWrongBorder),
            }}>
              {writingInput || '\u200B'}
            </div>
            {writingResult !== null && !writingResult && (
              <div style={styles.writingError}>
                Correct answer: {currentLetter.letter}
              </div>
            )}
            {writingResult === null ? (
              <ArabicKeyboard
                onKeyPress={(k) => setWritingInput(writingInput + k)}
                onBackspace={() => setWritingInput(writingInput.slice(0, -1))}
                onSubmit={() => {
                  const correct = writingInput.trim() === currentLetter.letter;
                  setWritingResult(correct);
                }}
                highlightedKeys={[]}
              />
            ) : (
              <button style={styles.nextBtn} onClick={goNextStep}>
                {currentLetterIdx < groupLettersList.length - 1 ? 'Next Letter' : 'Complete Group'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
