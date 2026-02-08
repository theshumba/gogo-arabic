import { createSlice } from '@reduxjs/toolkit';

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
} = uiSlice.actions;

export default uiSlice.reducer;
