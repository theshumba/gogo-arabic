import { useSelector, useDispatch } from 'react-redux';
import {
  setMasterVolume,
  setBgmVolume,
  setSfxVolume,
  setPronunciationVolume,
  toggleMute,
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
    backgroundColor: '#1a1a2e',
    backgroundImage: 'radial-gradient(circle at 60% 30%, rgba(139, 105, 20, 0.08) 0%, transparent 50%), repeating-linear-gradient(60deg, rgba(212, 168, 67, 0.03) 0px, rgba(212, 168, 67, 0.03) 1px, transparent 1px, transparent 40px)',
  };

  return (
    <div className={styles.container} style={containerStyle}>
      <div className={styles.panel}>
        <div className={styles.title}>Settings</div>

        {/* Audio Section */}
        <div className={styles.volumeSection}>
          <div className={styles.sectionHeading}>Audio</div>

          <div className={styles.settingRow}>
            <span className={styles.label}>Master Volume</span>
            <div className={styles.sliderGroup}>
              <input type="range" min="0" max="100" step="5" value={settings.masterVolume}
                onChange={(e) => dispatch(setMasterVolume(+e.target.value))} className={styles.slider} />
              <span className={styles.volumeValue}>{settings.masterVolume}%</span>
            </div>
          </div>

          <div className={styles.settingRow}>
            <span className={styles.label}>
              {settings.isMuted ? 'Muted' : 'Mute'}
            </span>
            <button
              className={settings.isMuted ? styles.muteBtn + ' ' + styles.muteBtnActive : styles.muteBtn}
              onClick={() => dispatch(toggleMute())}
            >
              {settings.isMuted ? 'UNMUTE' : 'MUTE'}
            </button>
          </div>

          <div className={styles.settingRow}>
            <span className={styles.label}>Music Volume</span>
            <div className={styles.sliderGroup}>
              <input type="range" min="0" max="100" step="5" value={settings.bgmVolume}
                onChange={(e) => dispatch(setBgmVolume(+e.target.value))} className={styles.slider} />
              <span className={styles.volumeValue}>{settings.bgmVolume}%</span>
            </div>
          </div>

          <div className={styles.settingRow}>
            <span className={styles.label}>SFX Volume</span>
            <div className={styles.sliderGroup}>
              <input type="range" min="0" max="100" step="5" value={settings.sfxVolume}
                onChange={(e) => dispatch(setSfxVolume(+e.target.value))} className={styles.slider} />
              <span className={styles.volumeValue}>{settings.sfxVolume}%</span>
            </div>
          </div>

          <div className={styles.settingRow}>
            <span className={styles.label}>Word Audio Volume</span>
            <div className={styles.sliderGroup}>
              <input type="range" min="0" max="100" step="5" value={settings.pronunciationVolume}
                onChange={(e) => dispatch(setPronunciationVolume(+e.target.value))} className={styles.slider} />
              <span className={styles.volumeValue}>{settings.pronunciationVolume}%</span>
            </div>
          </div>
        </div>

        {/* Display Section */}
        <div className={styles.settingsSection}>
          <div className={styles.sectionHeading}>Display</div>

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
        </div>

        <button className={styles.backBtn} onClick={onBack}>Back to Menu</button>
      </div>
    </div>
  );
}
