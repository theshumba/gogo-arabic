import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  lastSyncTime: null,
  pendingChanges: false,
  isOnline: true,
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setSyncTime(state, action) {
      state.lastSyncTime = action.payload;
    },

    setPendingChanges(state, action) {
      state.pendingChanges = action.payload;
    },

    setOnlineStatus(state, action) {
      state.isOnline = action.payload;
    },
  },
});

export const {
  setSyncTime,
  setPendingChanges,
  setOnlineStatus,
} = syncSlice.actions;

export default syncSlice.reducer;
