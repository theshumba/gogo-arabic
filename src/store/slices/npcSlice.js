import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dialogueState: {}, // { [npcId]: { lastLine: 0, wordsTaught: [] } }
};

const npcSlice = createSlice({
  name: 'npc',
  initialState,
  reducers: {
    updateDialogueState(state, action) {
      // payload: { npcId, lastLine }
      const { npcId, lastLine } = action.payload;
      if (!state.dialogueState[npcId]) {
        state.dialogueState[npcId] = { lastLine: 0, wordsTaught: [] };
      }
      state.dialogueState[npcId].lastLine = lastLine;
    },

    teachWord(state, action) {
      // payload: { npcId, wordId }
      const { npcId, wordId } = action.payload;
      if (!state.dialogueState[npcId]) {
        state.dialogueState[npcId] = { lastLine: 0, wordsTaught: [] };
      }
      if (!state.dialogueState[npcId].wordsTaught.includes(wordId)) {
        state.dialogueState[npcId].wordsTaught.push(wordId);
      }
    },

    resetNpcDialogue(state, action) {
      // payload: npcId
      const npcId = action.payload;
      if (state.dialogueState[npcId]) {
        state.dialogueState[npcId] = { lastLine: 0, wordsTaught: [] };
      }
    },
  },
});

export const {
  updateDialogueState,
  teachWord,
  resetNpcDialogue,
} = npcSlice.actions;

export default npcSlice.reducer;
