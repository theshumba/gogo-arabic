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

export default settingsSlice.reducer;
