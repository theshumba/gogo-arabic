/**
 * Phase 102 — Plan 07 (OBS-06): Device performance slice
 *
 * Stores ground-truth low-end-device detection captured during a 10s warmup
 * window after the Phaser BootScene completes. Downstream phases 103 (mobile)
 * and 104 (asset pipeline) read `selectIsLowEndDevice` to gate VFX downgrades
 * and atlas-page reduction on weak devices.
 *
 * Shape:
 *   {
 *     isLowEnd:     boolean,           // computed flag — see services/devicePerformance.js
 *     avgFps:       number | null,     // mean of 40 samples over 10s
 *     deviceMemory: number | null,     // navigator.deviceMemory (GB) or Infinity if unavailable
 *     sampleCount:  number,            // 40 in the happy path; 0 before warmup completes
 *   }
 *
 * Persistence: registered in root persist allow-list in store.js. Migration v13
 * in src/services/storage/migrations.js seeds the default state for users
 * upgrading from v12.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLowEnd: false,
  avgFps: null,
  deviceMemory: null,
  sampleCount: 0,
};

const devicePerformanceSlice = createSlice({
  name: 'devicePerformance',
  initialState,
  reducers: {
    /**
     * Replace the slice with the warmup sampler's verdict.
     * Payload shape: { isLowEnd, avgFps, deviceMemory, sampleCount }.
     */
    setLowEndFlag(state, action) {
      state.isLowEnd = action.payload.isLowEnd;
      state.avgFps = action.payload.avgFps;
      state.deviceMemory = action.payload.deviceMemory;
      state.sampleCount = action.payload.sampleCount;
    },
  },
});

export const { setLowEndFlag } = devicePerformanceSlice.actions;

/**
 * Selector used by downstream phases (103 mobile, 104 atlas pipeline) to
 * decide whether to downgrade visual fidelity. Returns `false` if the slice
 * is missing (e.g., before rehydration completes) — better to render high-end
 * for a frame than to flash a downgraded view.
 */
export const selectIsLowEndDevice = (state) => state.devicePerformance?.isLowEnd ?? false;

export const selectDevicePerformance = (state) => state.devicePerformance;

export default devicePerformanceSlice.reducer;
