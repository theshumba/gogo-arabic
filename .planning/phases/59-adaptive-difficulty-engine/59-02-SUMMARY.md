---
phase: 59-adaptive-difficulty-engine
plan: 02
subsystem: quiz
tags: [quiz-types, adaptive-difficulty, format-routing, grammar-weak, cefr-gating, vitest, useQuiz, QuizOverlay]

# Dependency graph
requires:
  - phase: 59-01
    provides: clusterAccuracy session state in useQuiz.js + CLUSTER_MAP pattern to replace

provides:
  - QUIZ_TYPE_REGISTRY with 18 types (12 active + 6 Phase 60 stubs at minLevel 999)
  - CEFR_ORDER constant for level comparison
  - selectQuizTypeForPlayer(clusterAccuracy, playerLevel, cefrLevel) pure function
  - useQuiz.start() uses selectQuizTypeForPlayer for initial type selection
  - loadQuestion() re-evaluates quiz type per question based on accumulated cluster accuracy
  - lockedType mechanism: preserves caller-specified quiz type through session
  - QuizOverlay.QUIZ_TYPE_LABELS derived from QUIZ_TYPE_REGISTRY (single source of truth)
  - 16-test suite in src/data/__tests__/quizTypes.test.js

affects:
  - 60-quiz-types (6 Phase 60 stubs ready in registry at minLevel 999 — lowered when renderers ship)
  - 61-diagnostic-placement (adaptive format routing already active for all quiz sessions)
  - QuizOverlay.jsx (labels now derived from registry, backward compatible)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pure data registry pattern: QUIZ_TYPE_REGISTRY in quizTypes.js imported by both useQuiz and QuizOverlay"
    - "Caller lock pattern: lockedType preserves explicit quiz type choice through session; null = adaptive"
    - "CEFR gate bypass: null cefrLevel passes all cefrMin gates (no placement = no gate)"
    - "minLevel 999 sentinel: Phase 60 types registered now but cannot fire until Phase 60 lowers gates"

key-files:
  created:
    - src/data/quizTypes.js
    - src/data/__tests__/quizTypes.test.js
  modified:
    - src/hooks/useQuiz.js
    - src/components/Quiz/QuizOverlay.jsx

key-decisions:
  - "Phase 60 types use minLevel: 999 not active: false — simpler, no new field, players cannot reach 999"
  - "lockedType is internal (not in quiz return object) — callers don't need to know about it"
  - "QUIZ_TYPE_LABELS in QuizOverlay derived from registry — single source of truth for type names"
  - "CLUSTER_MAP removed from useQuiz.js — QUIZ_TYPE_REGISTRY[type]?.cluster is the canonical lookup"
  - "Format routing re-evaluated on every loadQuestion call — responsive adaptation within single session"

patterns-established:
  - "Registry-first type metadata: all quiz type data lives in QUIZ_TYPE_REGISTRY, derived in consumers"
  - "Pure function call pattern: selectQuizTypeForPlayer receives all data as params, no store imports"

requirements-completed: [QUIZ-03]

# Metrics
duration: 4min
completed: 2026-03-22
---

# Phase 59 Plan 02: Adaptive Difficulty Engine — Format Routing Summary

**QUIZ_TYPE_REGISTRY with 18 types, selectQuizTypeForPlayer grammar-weak routing, lockedType session lock, and QuizOverlay label derivation from registry**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-22T20:45:38Z
- **Completed:** 2026-03-22T20:49:11Z
- **Tasks:** 2
- **Files modified:** 4 (quizTypes.js new, quizTypes.test.js new, useQuiz.js, QuizOverlay.jsx)

## Accomplishments

- Created `src/data/quizTypes.js` as a pure data/utility file — QUIZ_TYPE_REGISTRY with 18 types (12 existing at real minLevels + 6 Phase 60 stubs at minLevel 999), CEFR_ORDER constant, isCefrEligible helper, selectQuizTypeForPlayer pure function
- Grammar-weak routing: 70% bias toward grammar cluster types when grammar accuracy < 70% after 3+ grammar questions
- cefrLevel null = passes all cefrMin gates (no placement test taken = no level gate applies)
- useQuiz.js: CLUSTER_MAP and QUIZ_TYPES inline array removed; replaced by QUIZ_TYPE_REGISTRY import + selectQuizTypeForPlayer
- useQuiz.js: lockedType added to quizState — null when adaptive, non-null when caller specified explicit type
- useQuiz.js: start() uses selectQuizTypeForPlayer for initial type; loadQuestion() re-evaluates type per question
- QuizOverlay.jsx: QUIZ_TYPE_LABELS derived from QUIZ_TYPE_REGISTRY (backward compatible, single source of truth)
- 16-test suite covers registry completeness, Phase 60 gating, CEFR gating, grammar-weak bias, min-sample guard, fallback

## Task Commits

1. **Task 1: Create quizTypes.js** — `6301399` (feat)
2. **Task 2: Wire + tests** — `e196ee8` (feat)

## Files Created/Modified

- `src/data/quizTypes.js` — NEW: CEFR_ORDER, QUIZ_TYPE_REGISTRY (18 entries), isCefrEligible (private), selectQuizTypeForPlayer (exported pure function)
- `src/data/__tests__/quizTypes.test.js` — NEW: 16 unit tests for registry, CEFR ordering, and selectQuizTypeForPlayer routing
- `src/hooks/useQuiz.js` — Removed CLUSTER_MAP and QUIZ_TYPES array; added imports for quizTypes.js and cefrProgressSlice; added lockedType to quizState; start() uses selectQuizTypeForPlayer; loadQuestion() re-evaluates type per question; answer() uses QUIZ_TYPE_REGISTRY[type]?.cluster; close() resets lockedType
- `src/components/Quiz/QuizOverlay.jsx` — Added QUIZ_TYPE_REGISTRY import; QUIZ_TYPE_LABELS now derived from registry via Object.fromEntries

## Decisions Made

- **minLevel 999 sentinel**: Phase 60 types gated via high minLevel rather than an `active: false` flag — no new field needed, players cannot reach level 999, Phase 60 simply lowers the minLevel values when renderers ship
- **lockedType internal only**: Caller-specified quiz type is stored as `lockedType` in quizState but not exposed in the returned `quiz` object — internal implementation detail, callers only need quizType
- **CLUSTER_MAP replaced**: With QUIZ_TYPE_REGISTRY now available, `CLUSTER_MAP` in useQuiz.js is redundant. Replaced `CLUSTER_MAP[type]` with `QUIZ_TYPE_REGISTRY[type]?.cluster` for single source of truth
- **Format routing per question**: `loadQuestion()` re-evaluates quiz type on each call using accumulated `clusterAccuracy` — adaptive response is visible within a single extended session (matches QUIZ-03 requirement)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Test Results

- `src/data/__tests__/quizTypes.test.js` — 16 tests passing
- `src/hooks/__tests__/useQuiz.adaptive.test.js` — 17 tests passing (59-01 regression check)
- Full suite — 1257 tests passing across 72 files, no regressions

## Next Phase Readiness

- QUIZ_TYPE_REGISTRY is the canonical registry for Phase 60 — just lower minLevel on the 6 stub types when renderers ship
- selectQuizTypeForPlayer is fully operational — Phase 61 diagnostic placement can use it immediately
- All adaptive infrastructure (59-01 + 59-02) complete — Phase 60 quiz types inherit adaptive behavior from day one
- Phase 59 requirements complete: QUIZ-02 (59-01) + QUIZ-03 (59-02)

---
*Phase: 59-adaptive-difficulty-engine*
*Completed: 2026-03-22*
