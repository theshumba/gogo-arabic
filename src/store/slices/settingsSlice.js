import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showTransliteration: true,
  showDiacritics: true,
  keyboardMode: 'onscreen', // 'onscreen' | 'physical'
  ambientVolume: 70, // 0-100
  sfxVolume: 80,
  pronunciationVolume: 100,
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

    setAmbientVolume(state, action) {
      state.ambientVolume = Math.max(0, Math.min(100, action.payload));
    },

    setSfxVolume(state, action) {
      state.sfxVolume = Math.max(0, Math.min(100, action.payload));
    },

    setPronunciationVolume(state, action) {
      state.pronunciationVolume = Math.max(0, Math.min(100, action.payload));
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
  setAmbientVolume,
  setSfxVolume,
  setPronunciationVolume,
  setTextSize,
} = settingsSlice.actions;

// --- Selectors ---
export const selectShowTransliteration = (state) => state.settings.showTransliteration;
export const selectShowDiacritics = (state) => state.settings.showDiacritics;
export const selectKeyboardMode = (state) => state.settings.keyboardMode;
export const selectAmbientVolume = (state) => state.settings.ambientVolume;
export const selectSfxVolume = (state) => state.settings.sfxVolume;
export const selectPronunciationVolume = (state) => state.settings.pronunciationVolume;
export const selectTextSize = (state) => state.settings.textSize;
export const selectSettings = (state) => state.settings;

export default settingsSlice.reducer;
