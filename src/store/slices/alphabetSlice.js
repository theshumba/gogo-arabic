import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  groups: [], // loaded from alphabet.json
  completedGroups: [],
  currentLesson: null, // { groupId, step: 1-5 }
};

const alphabetSlice = createSlice({
  name: 'alphabet',
  initialState,
  reducers: {
    loadGroups(state, action) {
      // payload: array of group objects from alphabet.json
      state.groups = action.payload;
    },

    startLesson(state, action) {
      // payload: groupId
      state.currentLesson = { groupId: action.payload, step: 1 };
    },

    advanceStep(state) {
      if (state.currentLesson && state.currentLesson.step < 5) {
        state.currentLesson.step += 1;
      }
    },

    completeGroup(state, action) {
      // payload: groupId
      const groupId = action.payload;
      if (!state.completedGroups.includes(groupId)) {
        state.completedGroups.push(groupId);
      }
      // Clear current lesson if it matches
      if (state.currentLesson && state.currentLesson.groupId === groupId) {
        state.currentLesson = null;
      }
    },

    resetLesson(state) {
      state.currentLesson = null;
    },
  },
});

export const {
  loadGroups,
  startLesson,
  advanceStep,
  completeGroup,
  resetLesson,
} = alphabetSlice.actions;

export default alphabetSlice.reducer;
