import { useState } from 'react';
import { audioManager } from '../../services/audio.js';
import { COLORS, FONTS } from '../../styles/theme.js';

const styles = {
  instruction: {
    fontFamily: FONTS.pixel,
    fontSize: '8px',
    color: COLORS.brown,
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  prompt: {
    fontSize: '36px',
    fontFamily: FONTS.arabic,
    direction: 'rtl',
    margin: '12px 0 8px',
    color: COLORS.gold,
    textShadow: `1px 1px 0px ${COLORS.brown}`,
  },
  playBtn: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    padding: '12px 24px',
    border: `4px solid ${COLORS.dark}`,
    background: COLORS.cyan,
    color: COLORS.dark,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.2),
      inset 3px 3px 0px 0px rgba(255,255,255,0.2),
      0 3px 0 0 #048a9e
    `,
    margin: '12px 0 16px',
  },
  choices: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  choice: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    padding: '12px 20px',
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
  },
  choiceCorrect: {
    background: 'rgba(46,204,113,0.2)',
    borderColor: COLORS.green,
  },
  choiceWrong: {
    background: 'rgba(240,49,49,0.15)',
    borderColor: COLORS.red,
  },
};

export default function ListenAndChoose({ word, choices, feedback, onAnswer }) {
  const [played, setPlayed] = useState(false);

  const playAudio = () => {
    audioManager.playWord(word.id);
    setPlayed(true);
  };

  return (
    <div>
      <div style={styles.instruction}>Listen and choose the English meaning:</div>

      {/* Show the Arabic word as prompt (visible to help learners) */}
      <div style={styles.prompt}>{word.arabic}</div>

      <button style={styles.playBtn} onClick={playAudio}>
        {played ? 'Play Again' : 'Play Audio'}
      </button>

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
