---
phase: 102-observability-test-coverage
plan: 07
subsystem: observability / device-detection
tags: [obs-06, device-performance, low-end-detection, indexeddb-migration, redux-persist]
requires: [102-01, 102-02, 102-05, 102-06]
provides:
  - devicePerformanceSlice
  - selectIsLowEndDevice selector
  - startWarmupSampler (10s FPS sampler)
  - migration v13 (devicePerformance default seed)
affects:
  - src/store/store.js (combineReducers + persist allow-list + middleware chain)
  - src/services/storage/migrations.js (CURRENT_VERSION 12 -> 13)
  - src/game/PhaserGame.jsx (sampler kickoff in SCENE_READY callback)
tech_stack:
  added: []
  patterns: [redux-toolkit-slice, redux-persist-allowlist, indexeddb-additive-migration]
key_files:
  created:
    - src/store/slices/devicePerformanceSlice.js
    - src/services/devicePerformance.js
    - src/store/middleware/devicePerformancePersist.js
  modified:
    - src/store/store.js
    - src/services/storage/migrations.js
    - src/services/storage/__tests__/migrations.test.js
    - src/game/PhaserGame.jsx
    - src/services/__tests__/devicePerformance.test.js
    - src/store/middleware/__tests__/devicePerformancePersist.test.js
decisions:
  - "Sampler wired in PhaserGame.jsx (not main.jsx) — only call-site where game.loop is in scope"
  - "FPS threshold = 45 fps (Phaser sustained-low-end benchmark from RESEARCH Pattern 4)"
  - "Memory threshold = 4 GB (Chromium deviceMemory bucket boundary)"
  - "Migration v13 is additive-only — preserves every v12 key via spread"
  - "Belt-and-braces middleware writes a dedicated IndexedDB key alongside the redux-persist root write"
metrics:
  duration: ~12 minutes
  commits: 2
  tasks_completed: 2
  files_created: 3
  files_modified: 6
  red_tests_turned_green: 6
  total_vitest_passing: 5757
completed_at: 2026-05-27
---

# Phase 102 Plan 07: Low-end device sampler + devicePerformanceSlice + migration v13 Summary

Ground-truth low-end-device detection ships end-to-end. A 10-second FPS sampler runs once after the Phaser BootScene completes, classifies the device using `avgFps < 45 OR navigator.deviceMemory < 4`, dispatches `setLowEndFlag`, and the verdict persists across reload via redux-persist root allow-list + migration v13. Phases 103 (mobile) and 104 (asset pipeline) consume the verdict via `selectIsLowEndDevice(state)`.

## One-liner

Ships the OBS-06 detection pipeline: 10s warmup FPS sampler + `devicePerformanceSlice` + IndexedDB migration v12 → v13 + belt-and-braces persist middleware + PhaserGame `SCENE_READY` kickoff.

## What changed

### Task 1 — `devicePerformanceSlice` + store registration (commit `cbc7433`)

- **Created** `src/store/slices/devicePerformanceSlice.js` with initial state `{ isLowEnd: false, avgFps: null, deviceMemory: null, sampleCount: 0 }`. Exports `setLowEndFlag` action, `selectIsLowEndDevice` selector, and `selectDevicePerformance` selector.
- **Modified** `src/store/store.js`: imported the reducer, registered `devicePerformance: devicePerformanceReducer` in `combineReducers`, and added `'devicePerformance'` to the root persist whitelist so the verdict survives reload.

### Task 2 — Sampler + migration + persist middleware + game wiring (commit `02e23a5`)

- **Created** `src/services/devicePerformance.js`:
  - `startWarmupSampler(game, store)` — 10s window, 250ms cadence, 40 samples.
  - Heuristic: `isLowEnd = avgFps < FPS_THRESHOLD || deviceMemory < MEMORY_THRESHOLD_GB` where `FPS_THRESHOLD = 45` and `MEMORY_THRESHOLD_GB = 4`.
  - **Pitfall 4 fallback:** `navigator.deviceMemory` absent (Firefox/Safari) → `Infinity` so the OR-clause never trips on non-Chromium browsers.
  - Module-scoped `_started` boolean guards re-entry (T-102-21).
- **Modified** `src/services/storage/migrations.js`:
  - `CURRENT_VERSION` bumped 12 → 13.
  - New `migrations[13]` is additive only — spreads `...state` and seeds the default `devicePerformance` slice when absent. **T-102-20 mitigation:** every existing v12 key is preserved.
- **Modified** `src/services/storage/__tests__/migrations.test.js`: bumped the version assertion 12 → 13 to match.
- **Created** `src/store/middleware/devicePerformancePersist.js`: writes the slice JSON to a dedicated IndexedDB key (`gogo-arabic-device-performance`) on every `setLowEndFlag` dispatch. Fire-and-forget; try/catch wrapped; never blocks the dispatch chain.
- **Modified** `src/store/store.js`: wired `devicePerformancePersistMiddleware` into the middleware chain (after `telemetryMiddleware`).
- **Modified** `src/game/PhaserGame.jsx`: kicked off `startWarmupSampler(game, store)` in the `EVENTS.SCENE_READY` callback. This is the only call-site where the Phaser `game` instance — and therefore `game.loop.actualFps` — is in scope. Wrapped in try/catch so telemetry can never crash gameplay.
- **Modified** the two Plan-01 RED test files to remove the hard "throw not-implemented" RED gates now that Plan 07 has shipped the implementation.

## Decisions made

| Decision | Choice | Why |
|---|---|---|
| Sampler integration point | `PhaserGame.jsx` `SCENE_READY` callback | Only call-site where the Phaser `game` instance (and `game.loop`) is in scope. `main.jsx` does not have access to the game instance. |
| FPS threshold | 45 fps | Sustained-low-end benchmark per RESEARCH Pattern 4. Anything below 45fps for 10s is treated as constrained. |
| Memory threshold | 4 GB | Chromium `deviceMemory` bucket boundary (1/2/4/8/16). Devices reporting 2 GB are the low-end target. |
| Firefox/Safari fallback | `deviceMemory ?? Infinity` | Pitfall 4: better to misclassify a Safari user as high-end than misclassify EVERY Safari user as low-end. The FPS-only heuristic still catches genuinely weak Safari devices. |
| Migration shape | Additive, idempotent | T-102-20: every existing v12 key is preserved via `...state` spread. The slice's own `initialState` is the source of truth at store-creation; the migration just guarantees the key exists for users upgrading. |
| Belt-and-braces middleware | Yes — dedicated key write | Per plan rules item 6. The redux-persist root allow-list write batches state across many slices; the dedicated key write gives Phase 103/104 a single-slice fetch path. |

## Threat-model dispositions

| Threat ID | Disposition | Mitigation shipped |
|---|---|---|
| T-102-20 (Migration corrupts v12 state) | mitigate | Migration v13 is additive only — spreads `...state` and seeds default. Migration test asserts no key loss. |
| T-102-21 (Sampler runs more than once) | mitigate | Module-scoped `_started` boolean. Test verifies second call is a no-op. |
| T-102-22 (deviceMemory disclosure) | accept | Coarse Chrome-bucketed value, no identification risk. Not sent to PostHog this phase. |

## Tests

- **Targeted:** `npx vitest run src/services/__tests__/devicePerformance.test.js src/store/middleware/__tests__/devicePerformancePersist.test.js` → **6/6 GREEN**.
- **Full suite:** `npx vitest run` → **5757 passing / 11 skipped / 1 file failing**.
  - Baseline before Plan 07: 5751 passing.
  - +6 from the two RED test files turning GREEN. Net regression: **0**.
  - The 1 failing file (`src/test/fixtures/captureViaVitest.test.js`) is pre-existing and already documented in `.planning/phases/102-observability-test-coverage/deferred-items.md`. Confirmed by stashing this plan's changes and re-running — failure persists. Out of scope per execution rules.

## Commits

| SHA | Message |
|---|---|
| `cbc7433` | `feat(102-07): create devicePerformanceSlice + register in root persist` |
| `02e23a5` | `feat(102-07): warmup sampler + migration v13 + persist middleware + game wiring` |

## Deviations from plan

**1. [Rule 1 — Bug] Updated `migrations.test.js` `CURRENT_VERSION` assertion 12 → 13**

- **Found during:** Task 2 full-suite verification.
- **Issue:** `src/services/storage/__tests__/migrations.test.js` hard-coded `expect(CURRENT_VERSION).toBe(12)` — directly broken by the v12 → v13 bump.
- **Fix:** Updated the assertion to `.toBe(13)` with a comment crediting Plan 102-07.
- **Files modified:** `src/services/storage/__tests__/migrations.test.js`.
- **Commit:** `02e23a5` (bundled with the migration bump because the test asserts the migration's version constant).

**2. [Rule 2 — Plan-instructed cleanup] Removed Plan-01 hard RED gates from the two test files**

- **Found during:** Task 2 verification.
- **Issue:** Both `src/services/__tests__/devicePerformance.test.js` and `src/store/middleware/__tests__/devicePerformancePersist.test.js` had a final `it('RED gate ... fails by design', () => throw)` block. Plan 07 must turn the files GREEN; the gates would have left them red.
- **Fix:** Replaced each gate with a comment crediting the Plan-07 commits that made the gate obsolete.
- **Files modified:** the two test files.
- **Commit:** `02e23a5`.

## Self-Check: PASSED

- `src/store/slices/devicePerformanceSlice.js` — FOUND
- `src/services/devicePerformance.js` — FOUND
- `src/store/middleware/devicePerformancePersist.js` — FOUND
- `src/services/storage/migrations.js` `CURRENT_VERSION = 13` — FOUND
- `src/store/store.js` `devicePerformance` reducer + persist whitelist + middleware — FOUND
- `src/game/PhaserGame.jsx` `startWarmupSampler` kickoff — FOUND
- Commit `cbc7433` — FOUND in git log
- Commit `02e23a5` — FOUND in git log
- Targeted vitest run — 6/6 GREEN
- Full vitest pass count ≥ 5751 baseline — 5757 PASSING
