import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  dialogueOpen: false,
  quizOpen: false,
  menuOpen: false,
  signOpen: false,
  quizConfig: null, // { type, words, context, timer }
  dialogueConfig: null, // { npcId, npcName }
  signData: null, // { arabic, english }
  notification: null, // { message, type }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openDialogue(state, action) {
      // payload: { npcId, npcName }
      state.dialogueOpen = true;
      state.dialogueConfig = action.payload;
    },

    closeDialogue(state) {
      state.dialogueOpen = false;
      state.dialogueConfig = null;
    },

    openQuiz(state, action) {
      // payload: { type, words, context, timer }
      state.quizOpen = true;
      state.quizConfig = action.payload;
    },

    closeQuiz(state) {
      state.quizOpen = false;
      state.quizConfig = null;
    },

    toggleMenu(state) {
      state.menuOpen = !state.menuOpen;
    },

    openSign(state, action) {
      // payload: { arabic, english }
      state.signOpen = true;
      state.signData = action.payload;
    },

    closeSign(state) {
      state.signOpen = false;
      state.signData = null;
    },

    showNotification(state, action) {
      // payload: { message, type }
      state.notification = action.payload;
    },

    clearNotification(state) {
      state.notification = null;
    },

    closeAllOverlays(state) {
      state.dialogueOpen = false;
      state.quizOpen = false;
      state.menuOpen = false;
      state.signOpen = false;
      state.quizConfig = null;
      state.dialogueConfig = null;
      state.signData = null;
    },
  },
});

export const {
  openDialogue,
  closeDialogue,
  openQuiz,
  closeQuiz,
  toggleMenu,
  openSign,
  closeSign,
  showNotification,
  clearNotification,
  closeAllOverlays,
} = uiSlice.actions;

// --- Selectors ---
export const selectDialogueOpen = (state) => state.ui.dialogueOpen;
export const selectDialogueConfig = (state) => state.ui.dialogueConfig;
export const selectQuizOpen = (state) => state.ui.quizOpen;
export const selectQuizConfig = (state) => state.ui.quizConfig;
export const selectMenuOpen = (state) => state.ui.menuOpen;
export const selectSignOpen = (state) => state.ui.signOpen;
export const selectSignData = (state) => state.ui.signData;
export const selectNotification = (state) => state.ui.notification;
export const selectAnyOverlayOpen = createSelector(
  [(state) => state.ui.dialogueOpen, (state) => state.ui.quizOpen, (state) => state.ui.menuOpen, (state) => state.ui.signOpen],
  (dialogueOpen, quizOpen, menuOpen, signOpen) => dialogueOpen || quizOpen || menuOpen || signOpen
);

export default uiSlice.reducer;
