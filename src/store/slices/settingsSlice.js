import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showTransliteration: true,
  showDiacritics: true,
  keyboardMode: 'onscreen', // 'onscreen' | 'physical'
  masterVolume: 70, // 0-100 — scales all audio channels
  ambientVolume: 70, // 0-100 — kept for backward compat
  bgmVolume: 70, // 0-100 — background music
  sfxVolume: 80,
  pronunciationVolume: 100,
  isMuted: false,
  textSize: 'medium', // 'small' | 'medium' | 'large'
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleTransliteration(state) {
      state.showTransliteration = !state.showTransliteration;
    },

    toggleDiacritics(state) {
      state.showDiacritics = !state.showDiacritics;
    },

    setKeyboardMode(state, action) {
      state.keyboardMode = action.payload;
    },

    setMasterVolume(state, action) {
      state.masterVolume = Math.max(0, Math.min(100, action.payload));
    },

    setAmbientVolume(state, action) {
      state.ambientVolume = Math.max(0, Math.min(100, action.payload));
    },

    setBgmVolume(state, action) {
      state.bgmVolume = Math.max(0, Math.min(100, action.payload));
    },

    setSfxVolume(state, action) {
      state.sfxVolume = Math.max(0, Math.min(100, action.payload));
    },

    setPronunciationVolume(state, action) {
      state.pronunciationVolume = Math.max(0, Math.min(100, action.payload));
    },

    toggleMute(state) {
      state.isMuted = !state.isMuted;
    },

    setTextSize(state, action) {
      state.textSize = action.payload;
    },
  },
});

export const {
  toggleTransliteration,
  toggleDiacritics,
  setKeyboardMode,
  setMasterVolume,
  setAmbientVolume,
  setBgmVolume,
  setSfxVolume,
  setPronunciationVolume,
  toggleMute,
  setTextSize,
} = settingsSlice.actions;

// --- Selectors ---
export const selectShowTransliteration = (state) => state.settings.showTransliteration;
export const selectShowDiacritics = (state) => state.settings.showDiacritics;
export const selectKeyboardMode = (state) => state.settings.keyboardMode;
export const selectMasterVolume = (state) => state.settings.masterVolume;
export const selectAmbientVolume = (state) => state.settings.ambientVolume;
export const selectBgmVolume = (state) => state.settings.bgmVolume;
export const selectSfxVolume = (state) => state.settings.sfxVolume;
export const selectPronunciationVolume = (state) => state.settings.pronunciationVolume;
export const selectIsMuted = (state) => state.settings.isMuted;
export const selectTextSize = (state) => state.settings.textSize;
export const selectSettings = (state) => state.settings;

export default settingsSlice.reducer;
