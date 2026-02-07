import { useCallback } from 'react';
import { COLORS, FONTS, pixelBtnDark, pixelBtnGold } from '../../styles/theme.js';

const ROWS = [
  ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر'],
  ['ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف'],
  ['ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي', 'ة', 'ء'],
];

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'center',
    direction: 'rtl',
    padding: '14px',
    background: COLORS.dark,
    border: `4px solid ${COLORS.gray}`,
    marginTop: '12px',
    imageRendering: 'pixelated',
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.4),
      inset 3px 3px 0px 0px rgba(255,255,255,0.05)
    `,
  },
  row: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'center',
  },
  key: {
    width: '40px',
    height: '44px',
    border: `4px solid ${COLORS.dark}`,
    background: COLORS.beige,
    color: COLORS.dark,
    fontSize: '20px',
    fontFamily: FONTS.arabic,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `
      inset -2px -2px 0px 0px rgba(0,0,0,0.15),
      inset 2px 2px 0px 0px rgba(255,255,255,0.5),
      0 3px 0 0 ${COLORS.brown}
    `,
    transition: 'transform 0.05s',
  },
  keyHighlighted: {
    background: COLORS.xpGold,
    border: `4px solid ${COLORS.brown}`,
    color: COLORS.dark,
    boxShadow: `
      inset -2px -2px 0px 0px rgba(0,0,0,0.2),
      inset 2px 2px 0px 0px rgba(255,255,255,0.3),
      0 3px 0 0 #a0842a
    `,
  },
  keyDisabled: {
    opacity: 0.3,
    cursor: 'default',
  },
  controlRow: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'center',
    marginTop: '6px',
  },
  backspaceKey: {
    ...pixelBtnDark,
    height: '40px',
    padding: '0 16px',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceKey: {
    ...pixelBtnDark,
    height: '40px',
    width: '160px',
    padding: '0 16px',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitKey: {
    ...pixelBtnGold,
    height: '40px',
    padding: '0 20px',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default function ArabicKeyboard({
  onKeyPress,
  onBackspace,
  onSubmit,
  onSpace,
  highlightedKeys = [],
  disabledKeys = [],
  showSubmit = true,
  showSpace = false,
}) {
  const handleKey = useCallback((letter) => {
    if (disabledKeys.includes(letter)) return;
    onKeyPress(letter);
  }, [onKeyPress, disabledKeys]);

  return (
    <div style={styles.container}>
      {ROWS.map((row, ri) => (
        <div key={ri} style={styles.row}>
          {row.map((letter) => {
            const isHighlighted = highlightedKeys.includes(letter);
            const isDisabled = disabledKeys.includes(letter);
            return (
              <button
                key={letter}
                style={{
                  ...styles.key,
                  ...(isHighlighted ? styles.keyHighlighted : {}),
                  ...(isDisabled ? styles.keyDisabled : {}),
                }}
                onClick={() => handleKey(letter)}
                disabled={isDisabled}
              >
                {letter}
              </button>
            );
          })}
        </div>
      ))}

      <div style={styles.controlRow}>
        <button style={styles.backspaceKey} onClick={onBackspace}>
          Backspace
        </button>
        {showSpace && (
          <button style={styles.spaceKey} onClick={onSpace}>
            Space
          </button>
        )}
        {showSubmit && (
          <button style={styles.submitKey} onClick={onSubmit}>
            Submit
          </button>
        )}
      </div>
    </div>
  );
}
