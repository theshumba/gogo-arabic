import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentLevel: null,      // 'A1'|'A2'|'B1'|'B2'|null
  levelHistory: [],        // [{ level, date, source }]
  lastAssessedAt: null,    // ISO string
};

const cefrProgressSlice = createSlice({
  name: 'cefrProgress',
  initialState,
  reducers: {
    setCefrLevel(state, action) {
      const { level, source } = action.payload;
      if (state.currentLevel !== level) {
        state.levelHistory.push({
          level: state.currentLevel,
          date: new Date().toISOString(),
          source: source || 'system',
        });
        state.currentLevel = level;
      }
      state.lastAssessedAt = new Date().toISOString();
    },
    initCefrLevel(state, action) {
      if (!state.currentLevel) {
        state.currentLevel = action.payload;
        state.lastAssessedAt = new Date().toISOString();
      }
    },
  },
});

export const { setCefrLevel, initCefrLevel } = cefrProgressSlice.actions;
export const selectCefrLevel = (state) => state.cefrProgress.currentLevel;
export const selectCefrHistory = (state) => state.cefrProgress.levelHistory;
export default cefrProgressSlice.reducer;
