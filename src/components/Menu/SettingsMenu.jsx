import { useSelector, useDispatch } from 'react-redux';
import {
  setAmbientVolume,
  setSfxVolume,
  setPronunciationVolume,
  toggleTransliteration,
  toggleDiacritics,
  setKeyboardMode,
} from '../../store/slices/settingsSlice.js';
import { COLORS, FONTS, pixelBtnDark, pixelPanel, fullScreenBg } from '../../styles/theme.js';

const styles = {
  container: fullScreenBg('/img/pixel-sepia.gif'),
  panel: {
    ...pixelPanel,
    padding: '32px 36px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '440px',
    width: '90%',
  },
  title: {
    fontFamily: FONTS.pixel,
    fontSize: '14px',
    color: COLORS.brown,
    marginBottom: '28px',
  },
  settingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '18px',
    padding: '6px 0',
  },
  label: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.dark,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  slider: {
    width: '140px',
    cursor: 'pointer',
    accentColor: COLORS.xpGold,
  },
  toggleOn: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    padding: '8px 16px',
    border: `4px solid ${COLORS.dark}`,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    background: COLORS.xpGold,
    color: COLORS.brown,
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.2),
      inset 3px 3px 0px 0px rgba(255,255,255,0.3),
      0 3px 0 0 #a0842a
    `,
    transition: 'transform 0.05s',
  },
  toggleOff: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    padding: '8px 16px',
    border: `4px solid ${COLORS.dark}`,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    background: COLORS.gray,
    color: COLORS.white,
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.3),
      inset 3px 3px 0px 0px rgba(255,255,255,0.1),
      0 3px 0 0 #1a191b
    `,
    transition: 'transform 0.05s',
  },
  backBtn: {
    ...pixelBtnDark,
    marginTop: '24px',
    fontSize: '10px',
    padding: '14px 28px',
  },
};

export default function SettingsMenu({ onBack }) {
  const settings = useSelector((s) => s.settings);
  const dispatch = useDispatch();

  return (
    <div style={styles.container}>
      <div style={styles.panel}>
        <div style={styles.title}>Settings</div>

        <div style={styles.settingRow}>
          <span style={styles.label}>Ambience Volume</span>
          <input type="range" min="0" max="100" step="10" value={settings.ambientVolume}
            onChange={(e) => dispatch(setAmbientVolume(+e.target.value))} style={styles.slider} />
        </div>

        <div style={styles.settingRow}>
          <span style={styles.label}>SFX Volume</span>
          <input type="range" min="0" max="100" step="10" value={settings.sfxVolume}
            onChange={(e) => dispatch(setSfxVolume(+e.target.value))} style={styles.slider} />
        </div>

        <div style={styles.settingRow}>
          <span style={styles.label}>Word Audio Volume</span>
          <input type="range" min="0" max="100" step="10" value={settings.pronunciationVolume}
            onChange={(e) => dispatch(setPronunciationVolume(+e.target.value))} style={styles.slider} />
        </div>

        <div style={styles.settingRow}>
          <span style={styles.label}>Show Transliteration</span>
          <button
            style={settings.showTransliteration ? styles.toggleOn : styles.toggleOff}
            onClick={() => dispatch(toggleTransliteration())}
          >
            {settings.showTransliteration ? 'ON' : 'OFF'}
          </button>
        </div>

        <div style={styles.settingRow}>
          <span style={styles.label}>Show Diacritics</span>
          <button
            style={settings.showDiacritics ? styles.toggleOn : styles.toggleOff}
            onClick={() => dispatch(toggleDiacritics())}
          >
            {settings.showDiacritics ? 'ON' : 'OFF'}
          </button>
        </div>

        <div style={styles.settingRow}>
          <span style={styles.label}>Keyboard Mode</span>
          <button
            style={settings.keyboardMode === 'physical' ? styles.toggleOn : styles.toggleOff}
            onClick={() => dispatch(setKeyboardMode(settings.keyboardMode === 'onscreen' ? 'physical' : 'onscreen'))}
          >
            {settings.keyboardMode === 'onscreen' ? 'On-Screen' : 'Physical'}
          </button>
        </div>

        <button style={styles.backBtn} onClick={onBack}>Back to Menu</button>
      </div>
    </div>
  );
}
