import { useSelector, useDispatch } from 'react-redux';
import {
  setAmbientVolume,
  setSfxVolume,
  setPronunciationVolume,
  toggleTransliteration,
  toggleDiacritics,
  setKeyboardMode,
} from '../../store/slices/settingsSlice.js';
import styles from './SettingsMenu.module.css';

export default function SettingsMenu({ onBack }) {
  const settings = useSelector((s) => s.settings);
  const dispatch = useDispatch();

  // Dynamic background image (fullScreenBg function pattern)
  const containerStyle = {
    backgroundImage: 'url(/img/pixel-sepia.gif)',
  };

  return (
    <div className={styles.container} style={containerStyle}>
      <div className={styles.panel}>
        <div className={styles.title}>Settings</div>

        <div className={styles.settingRow}>
          <span className={styles.label}>Ambience Volume</span>
          <input type="range" min="0" max="100" step="10" value={settings.ambientVolume}
            onChange={(e) => dispatch(setAmbientVolume(+e.target.value))} className={styles.slider} />
        </div>

        <div className={styles.settingRow}>
          <span className={styles.label}>SFX Volume</span>
          <input type="range" min="0" max="100" step="10" value={settings.sfxVolume}
            onChange={(e) => dispatch(setSfxVolume(+e.target.value))} className={styles.slider} />
        </div>

        <div className={styles.settingRow}>
          <span className={styles.label}>Word Audio Volume</span>
          <input type="range" min="0" max="100" step="10" value={settings.pronunciationVolume}
            onChange={(e) => dispatch(setPronunciationVolume(+e.target.value))} className={styles.slider} />
        </div>

        <div className={styles.settingRow}>
          <span className={styles.label}>Show Transliteration</span>
          <button
            className={settings.showTransliteration ? styles.toggleOn : styles.toggleOff}
            onClick={() => dispatch(toggleTransliteration())}
          >
            {settings.showTransliteration ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className={styles.settingRow}>
          <span className={styles.label}>Show Harakat</span>
          <button
            className={settings.showDiacritics ? styles.toggleOn : styles.toggleOff}
            onClick={() => dispatch(toggleDiacritics())}
          >
            {settings.showDiacritics ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className={styles.settingRow}>
          <span className={styles.label}>Keyboard Mode</span>
          <button
            className={settings.keyboardMode === 'physical' ? styles.toggleOn : styles.toggleOff}
            onClick={() => dispatch(setKeyboardMode(settings.keyboardMode === 'onscreen' ? 'physical' : 'onscreen'))}
          >
            {settings.keyboardMode === 'onscreen' ? 'On-Screen' : 'Physical'}
          </button>
        </div>

        <button className={styles.backBtn} onClick={onBack}>Back to Menu</button>
      </div>
    </div>
  );
}
