---
phase: 59-adaptive-difficulty-engine
plan: 01
subsystem: quiz
tags: [fsrs, adaptive-difficulty, distractor-scaling, session-tracking, vitest, useQuiz]

# Dependency graph
requires:
  - phase: 55-calligraphy-poetry
    provides: vocabulary with category/difficulty fields used by pickDistractors
  - phase: 58-grammar-a1-a2-lesson-wiring
    provides: grammarSlice and lesson infrastructure that cluster accuracy tracks against

provides:
  - isFsrsDue(card) pure function exported from useQuiz.js
  - getDistractorTier(score, total) pure function exported from useQuiz.js
  - pickDistractors(word, count, tier) exported with easy/normal/hard tier logic
  - getRetrievability(card, now) helper exported from fsrs.js
  - CLUSTER_MAP constant mapping 12 quiz types to 5 content clusters
  - quizState.clusterAccuracy — per-cluster session accuracy tracking
  - quizState.fsrsDueOverride — FSRS-due flag per current word
  - quizState.distractorTier — current distractor difficulty tier
  - 17-test suite in src/hooks/__tests__/useQuiz.adaptive.test.js

affects:
  - 59-02 (QUIZ_TYPE_REGISTRY + selectQuizTypeForPlayer will read clusterAccuracy)
  - 60-quiz-types (new quiz types inherit adaptive behavior immediately)
  - 61-diagnostic-placement (adaptive difficulty engine already in place)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pure function export pattern: adaptive helpers exported from hooks for unit testing without React"
    - "Compute-at-call-time pattern: tier derived from sessionScore/sessionTotal in loadQuestion, not from stale state"
    - "Deterministic easy tier: guarantee N-1 cross-category picks before shuffle, not pool randomization"

key-files:
  created:
    - src/hooks/__tests__/useQuiz.adaptive.test.js
  modified:
    - src/hooks/useQuiz.js
    - src/services/fsrs.js

key-decisions:
  - "Compute distractorTier at loadQuestion call time (not from quizState) to avoid React stale state batching"
  - "Easy tier guarantees count-1 cross-category distractors via explicit partition, not combined-pool shuffle"
  - "CLUSTER_MAP lives in useQuiz.js (not quizTypes.js) to avoid circular imports before quizTypes.js exists"
  - "getRetrievability returns 1.0 for new cards (reps=0) avoiding division by zero in FSRS formula"
  - "clusterAccuracy resets on close() — session-ephemeral data, not persisted to Redux"

patterns-established:
  - "Pure helper export: isFsrsDue/getDistractorTier/pickDistractors exported so tests never need React test utilities"
  - "Adaptive state colocated with quiz session state (not Redux) — cluster accuracy is session-ephemeral"

requirements-completed: [QUIZ-02]

# Metrics
duration: 3min
completed: 2026-03-22
---

# Phase 59 Plan 01: Adaptive Difficulty Engine — Session Tracking Summary

**Rolling session accuracy tracker, per-cluster difficulty tracking, FSRS-due override, and tiered distractor scaling added to useQuiz.js with three testable pure function exports**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-22T20:38:58Z
- **Completed:** 2026-03-22T20:42:17Z
- **Tasks:** 2
- **Files modified:** 3 (useQuiz.js, fsrs.js, new test file)

## Accomplishments

- Exported `isFsrsDue`, `getDistractorTier`, `pickDistractors` as pure functions from useQuiz.js — testable without React mocking
- Extended `quizState` with `clusterAccuracy`, `fsrsDueOverride`, `distractorTier` — all reset on `close()`
- `pickDistractors` now scales difficulty: easy tier guarantees 2+ cross-category distractors; hard tier returns same-category same-difficulty words
- `getRetrievability` added to fsrs.js wrapping `scheduler.get_retrievability(card, now, false)` for 0-1 float output
- 17-test suite covers all 3 pure functions: 7 isFsrsDue cases, 6 getDistractorTier cases, 4 pickDistractors tier behavior cases

## Task Commits

1. **Task 1: Add adaptive helpers + session state to useQuiz.js + fsrs.js** — `9c7924f` (feat)
2. **Task 2: Create useQuiz.adaptive.test.js with 17 unit tests** — `810035d` (feat, includes Rule 1 auto-fix)

## Files Created/Modified

- `src/hooks/useQuiz.js` — Added CLUSTER_MAP, isFsrsDue, getDistractorTier, pickDistractors(with tier); extended quizState; answer() tracks clusterAccuracy; loadQuestion/start/close/next updated; quiz return object extended
- `src/services/fsrs.js` — Added getRetrievability export (0-1 float via ts-fsrs scheduler)
- `src/hooks/__tests__/useQuiz.adaptive.test.js` — NEW: 17 unit tests for all three pure functions

## Decisions Made

- **Compute tier at call time**: `getDistractorTier(prev.sessionScore, prev.sessionTotal)` called inside `setQuizState` updater in `loadQuestion` — avoids React stale state pitfall documented in Research
- **Easy tier partition approach**: Instead of combining `others.slice(0,3) + sameCat` and re-shuffling (which produces random results), the fix explicitly takes `min(count-1, others.length)` from `others` then fills remainder from `sameCat` — deterministic guarantee of 2+ cross-category words
- **CLUSTER_MAP in useQuiz.js**: Placed here rather than importing from quizTypes.js (which doesn't exist yet until 59-02) to avoid missing-module errors; 59-02 will optionally centralize

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Easy tier pickDistractors could return 0 cross-category distractors**
- **Found during:** Task 2 (test run — `expect(crossCat.length).toBeGreaterThanOrEqual(2)` failed)
- **Issue:** The plan's easy-tier pool formula `[...shuffle(others).slice(0,3), ...shuffle(sameCat)]` then `shuffle(pool).slice(0,count)` does not guarantee cross-category results — for words with large same-category pools, random slice returns all same-category
- **Fix:** Replaced with explicit partition: take `min(count-1, others.length)` from others, fill remainder from sameCat, then shuffle only the final combined result
- **Files modified:** `src/hooks/useQuiz.js` (pickDistractors easy-tier branch)
- **Verification:** All 17 tests pass including the `crossCat.length >= 2` assertion
- **Committed in:** `810035d` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — Bug)
**Impact on plan:** Auto-fix necessary for correctness — the plan's intent was "mostly cross-category" but the implementation would produce random outcomes. The fix makes this deterministic.

## Issues Encountered

None beyond the easy-tier bug caught by tests.

## Next Phase Readiness

- Pure functions `isFsrsDue`, `getDistractorTier`, `pickDistractors` are exported and tested — ready for Phase 59-02 and 60 consumers
- `clusterAccuracy` is available on the `quiz` return object — Phase 59-02's `selectQuizTypeForPlayer` can read it directly
- `QUIZ_TYPES` inline array still in useQuiz.js — Phase 59-02 will replace this with QUIZ_TYPE_REGISTRY import
- Full test suite green: 1241 tests, 71 files, no regressions

---
*Phase: 59-adaptive-difficulty-engine*
*Completed: 2026-03-22*
