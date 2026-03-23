---
phase: 61-cefr-placement-test
plan: 03
subsystem: redux+ui
tags: [placement-test, cefr, grammar-slice, settings, retake, fan-out, vitest]

# Dependency graph
requires:
  - plan: 61-01
    provides: deriveGrammarUnlocks, deriveSkillTreeUnlocks from placementEngine.js
  - plan: 61-02
    provides: PlacementTestOverlay component, MainMenu with basic handlePlacementComplete
  - phase: 57-skill-trees-and-cefr
    provides: bulkUnlockNodes, placementSlice, cefrProgressSlice
  - phase: 58-grammar-content
    provides: grammarLessons with cefrLevel + order fields
provides:
  - src/store/slices/grammarSlice.js — bulkUnlockLessons reducer
  - src/store/slices/cefrProgressSlice.js — resetCefrProgress reducer
  - src/components/Menu/MainMenu.jsx — full fan-out dispatch in handlePlacementComplete + handlePlacementSkip
  - src/components/Menu/SettingsMenu.jsx — CEFR Placement section with retake UI
  - src/components/Menu/SettingsMenu.module.css — levelBadge, retakeBtn, retakeWarning classes
  - src/store/__tests__/grammarSlice.test.js — 11 new tests (bulkUnlockLessons, resetCefrProgress, integration)
affects: [phase-62, phase-63, any feature reading unlockedLessons or cefrProgress after placement]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - bulkUnlockLessons mirrors bulkUnlockNodes — idempotent, no XP side effects, just pushes non-duplicate IDs
    - Fan-out dispatch pattern — sequential dispatches in React 18 event handlers are auto-batched; no batch() import needed
    - handleRetakeSkip fallback — records A1 if player cancels mid-retake (prevents placement.hasCompleted:false stuck state)
    - resetCefrProgress returns initialState directly (RTK reducer returning new state, not mutating)

key-files:
  created: []
  modified:
    - src/store/slices/grammarSlice.js
    - src/store/slices/cefrProgressSlice.js
    - src/components/Menu/MainMenu.jsx
    - src/components/Menu/SettingsMenu.jsx
    - src/components/Menu/SettingsMenu.module.css
    - src/store/__tests__/grammarSlice.test.js

key-decisions:
  - "bulkUnlockLessons added after unlockNextLesson in reducers object — mirrors bulkUnlockNodes position in skillTreeSlice"
  - "Mock grammar data updated with cefrLevel field — necessary for integration tests that simulate A1/A2 placement fan-out"
  - "handleRetakeSkip records A1 fallback — player who starts retake but skips gets A1 not null placement state"
  - "SettingsMenu uses window.confirm for retake warning — lightweight, no new overlay/modal component required"

patterns-established:
  - "Fan-out dispatch: deriveGrammarUnlocks(level) → bulkUnlockLessons; deriveSkillTreeUnlocks(level) → per-tree bulkUnlockNodes"
  - "Retake flow: resetPlacement + resetCefrProgress → show PlacementTestOverlay → handleRetakeComplete re-dispatches full fan-out"

requirements-completed: [CEFR-02, CEFR-04]

# Metrics
duration: 5min
completed: 2026-03-23
---

# Phase 61 Plan 03: Fan-out Dispatch + Settings Retake UI Summary

**bulkUnlockLessons reducer + resetCefrProgress reducer + MainMenu full fan-out dispatch + SettingsMenu CEFR retake section with 11 new slice tests — 1400 tests passing**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-23T03:42:15Z
- **Completed:** 2026-03-23T03:47:23Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- `grammarSlice.js`: `bulkUnlockLessons` reducer — idempotent push of lesson IDs, mirrors `bulkUnlockNodes` pattern, no XP deduction or middleware side effects
- `cefrProgressSlice.js`: `resetCefrProgress` reducer — returns `initialState`, resetting `currentLevel`, `levelHistory`, and `lastAssessedAt`
- `MainMenu.jsx` `handlePlacementComplete`: full fan-out — after `recordPlacementResult`+`setCefrLevel`, derives grammar IDs via `deriveGrammarUnlocks(assignedLevel)` and dispatches `bulkUnlockLessons`; derives skill tree nodes via `deriveSkillTreeUnlocks(assignedLevel)` and dispatches `bulkUnlockNodes` per tree
- `MainMenu.jsx` `handlePlacementSkip`: same fan-out for A1 default — skippers also get A1 lessons + nodes pre-unlocked
- `SettingsMenu.jsx`: CEFR Placement section — when `placement.hasCompleted` shows current level badge + placed-on date + "Retake Placement Test" button; when not taken shows "Not yet taken"; retake flow uses `window.confirm` warning → `resetPlacement` + `resetCefrProgress` → `PlacementTestOverlay`
- `SettingsMenu.module.css`: `.levelBadge` (gold pixel border), `.labelValue`, `.retakeBtn` (red 2px border), `.retakeWarning` (8px muted grey)
- `grammarSlice.test.js`: 11 new tests — 5 `bulkUnlockLessons` (add IDs, idempotent, preserves existing, empty no-op, partial overlap), 3 `resetCefrProgress` (returns to initial, clears history, idempotent), 3 fan-out integration (A1 unlocks, A2 unlocks, CEFR reset independent of grammar state)
- 1400 total tests passing (was 1389) — 11 new tests, zero regressions

## Task Commits

1. **Task 1: Slice reducers + fan-out dispatch wiring** - `53c0ccf` (feat)
2. **Task 2: Settings retake UI + slice tests** - `60becda` (feat)

## Files Created/Modified

- `src/store/slices/grammarSlice.js` — added `bulkUnlockLessons` reducer + export
- `src/store/slices/cefrProgressSlice.js` — added `resetCefrProgress` reducer + export
- `src/components/Menu/MainMenu.jsx` — imports `bulkUnlockLessons`, `bulkUnlockNodes`, `deriveGrammarUnlocks`, `deriveSkillTreeUnlocks`; full fan-out in `handlePlacementComplete` and `handlePlacementSkip`
- `src/components/Menu/SettingsMenu.jsx` — CEFR Placement section, retake handlers, PlacementTestOverlay render
- `src/components/Menu/SettingsMenu.module.css` — `.levelBadge`, `.labelValue`, `.retakeBtn`, `.retakeWarning`
- `src/store/__tests__/grammarSlice.test.js` — 11 new tests; mock data updated with `cefrLevel` field

## Decisions Made

- **Mock grammar data updated with cefrLevel:** The existing mock lacked `cefrLevel`, which would have caused the integration tests to import a cefrLevel-less data set. Updated mock adds `cefrLevel: 'A1'` / `'A2'` to the 4 mock lessons — this is a backwards-compatible change since existing tests only used `id`, `category`, `order`.
- **handleRetakeSkip records A1 fallback:** A player who starts retake (placement reset) but then skips the overlay mid-flow would be stuck with `hasCompleted: false`. Recording A1 as fallback is consistent with `handlePlacementSkip` in MainMenu.
- **No batch() import:** React 18 batches sequential `dispatch()` calls inside event handlers automatically. Adding `batch` would be redundant and is explicitly flagged as wrong in the plan.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- `src/store/slices/grammarSlice.js` — FOUND
- `src/store/slices/cefrProgressSlice.js` — FOUND
- `src/components/Menu/MainMenu.jsx` — FOUND
- `src/components/Menu/SettingsMenu.jsx` — FOUND
- `src/components/Menu/SettingsMenu.module.css` — FOUND
- `src/store/__tests__/grammarSlice.test.js` — FOUND
- Commit 53c0ccf — verified
- Commit 60becda — verified

## Self-Check: PASSED

## Next Phase Readiness

- Phase 62 (Grammar B1-B2 content) can proceed — `bulkUnlockLessons` will correctly pre-unlock B1 lessons for B1-placed players once those lessons are authored
- Phase 63 (Achievement Expansion) can dispatch `bulkUnlockLessons` in achievement callbacks if needed
- Placement feature is now complete: item bank (61-01) → overlay component (61-02) → fan-out + retake (61-03)

---
*Phase: 61-cefr-placement-test*
*Completed: 2026-03-23*
