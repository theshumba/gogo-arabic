---
phase: 60-quiz-expansion-core-3-types
plan: 02
subsystem: ui
tags: [react, quiz, arabic, word-order, cloze-passage, vitest, testing-library]

# Dependency graph
requires:
  - phase: 60-01
    provides: GrammarFill component + useQuiz GrammarFill wiring + QUIZ_TYPE_REGISTRY with GrammarFill at minLevel:4
  - phase: 59-adaptive-difficulty-engine
    provides: selectQuizTypeForPlayer routing, QUIZ_TYPE_REGISTRY 18-type structure
provides:
  - WordOrder.jsx: sentence word-ordering quiz using tile click pattern from SentenceBuilder
  - ClozePassage.jsx: paragraph cloze quiz with FSRS-sourced blank options
  - useQuiz.js: WordOrder/ClozePassage buildChoices, answer grading, correctAnswer assignment
  - QuizOverlay.jsx: WordOrder + ClozePassage render blocks + SFX grading blocks
  - quizTypes.js: GrammarFill/ClozePassage (minLevel:4 cefrMin:A2), WordOrder (minLevel:5 cefrMin:B1), deferred 3 at minLevel:999 cefrMin:B2
  - WordOrder.test.jsx: 5 component tests
  - ClozePassage.test.jsx: 5 component tests
  - quizTypes.test.js: 22 tests (updated active/deferred assertions + 5 new CEFR routing tests)
affects: [60-03, 61-grammar-cat, 63-achievement-expansion]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "WordOrder tile normalization: options are objects {label,value,correct,tile} — extract .label for display, .value for answer (same fix applied to SentenceBuilder)"
    - "ClozePassage follows FillInBlank 4-prop contract: word + options + onAnswer + feedback"
    - "WordOrder follows SentenceBuilder 4-prop contract with different instruction text and B1 CEFR gate"
    - "Tile bank components receive object options from buildChoices — always normalize tile.label/tile.value before React render"

key-files:
  created:
    - src/components/Quiz/WordOrder.jsx
    - src/components/Quiz/ClozePassage.jsx
    - src/components/Quiz/__tests__/WordOrder.test.jsx
    - src/components/Quiz/__tests__/ClozePassage.test.jsx
  modified:
    - src/hooks/useQuiz.js
    - src/components/Quiz/QuizOverlay.jsx
    - src/data/quizTypes.js
    - src/data/__tests__/quizTypes.test.js
    - src/components/Quiz/SentenceBuilder.jsx

key-decisions:
  - "WordOrder instruction: 'Arrange the words in the correct Arabic word order:' (not sentence/tiles)"
  - "ClozePassage passage label added ('Passage') in dark box, 20px Arabic text (vs FillInBlank 22px) for readability"
  - "QUIZ_TYPE_REGISTRY: GrammarFill cefrMin updated A1→A2 (matching plan spec); WordOrder cefrMin B1; ClozePassage cefrMin A2"
  - "Deferred types: DialectIdentify/RootExpand/CulturalContext cefrMin updated to B2 per plan"
  - "SentenceBuilder latent bug fixed inline (no new plan needed — Rule 1 auto-fix)"

requirements-completed: [QUIZ-01]

# Metrics
duration: ~7min
completed: 2026-03-22
---

# Phase 60 Plan 02: WordOrder + ClozePassage Quiz Types Summary

**WordOrder tile-click quiz and ClozePassage passage-fill quiz: 15 active quiz types + 3 deferred stubs, real CEFR gating in registry, 10 new component tests + 6 new registry tests, 1278 total tests passing**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-03-22T23:25:56Z
- **Completed:** 2026-03-22T23:32:26Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- WordOrder.jsx (204 lines): tile-click sentence ordering quiz cloned from SentenceBuilder with "Arrange the words in the correct Arabic word order:" instruction, handles both string and object tile options
- ClozePassage.jsx (175 lines): passage-with-blank quiz based on FillInBlank pattern, "Read the passage and fill in the blank:", fallback when no exampleSentence, "Passage" label in dark box
- useQuiz.js: buildChoices adds WordOrder (sentence split into tiles) + ClozePassage (shuffled Arabic choices); answer() grades both types; correctAnswer assignment for both
- QuizOverlay.jsx: imports + renders both new components, SFX grading blocks for WordOrder and ClozePassage
- quizTypes.js: GrammarFill (minLevel:4, cefrMin:A2), ClozePassage (minLevel:4, cefrMin:A2), WordOrder (minLevel:5, cefrMin:B1) — all 3 active; DialectIdentify/RootExpand/CulturalContext remain at minLevel:999, cefrMin:B2
- quizTypes.test.js: 22 total tests — old stub test replaced with active/deferred assertions + 5 new CEFR routing tests (GrammarFill A2+, GrammarFill not A1, WordOrder B1+, WordOrder not A2, ClozePassage A2+)
- 5 WordOrder component tests + 5 ClozePassage component tests — all pass
- Full suite: 1278 tests pass (was 1257+GrammarFill=1262, now 1278 with 16 new tests)

## Task Commits

Each task was committed atomically:

1. **Task 1: WordOrder.jsx + ClozePassage.jsx + useQuiz.js wiring** — `d11acdc` (feat)
2. **Task 2: QuizOverlay wiring + registry update + component tests + SentenceBuilder fix** — `befcda9` (feat)

**Plan metadata:** see final commit

## Files Created/Modified

- `src/components/Quiz/WordOrder.jsx` — Tile-click word ordering quiz, instruction text distinct from SentenceBuilder
- `src/components/Quiz/ClozePassage.jsx` — Passage with blank quiz, graceful fallback when exampleSentence absent
- `src/components/Quiz/__tests__/WordOrder.test.jsx` — 5 tests: tile bank, click-to-place, submit, return-to-bank, feedback disable
- `src/components/Quiz/__tests__/ClozePassage.test.jsx` — 5 tests: blank visible, 4 choices, onAnswer, fallback, disabled
- `src/hooks/useQuiz.js` — WordOrder + ClozePassage buildChoices, answer grading, correctAnswer assignment
- `src/components/Quiz/QuizOverlay.jsx` — WordOrder + ClozePassage imports, render blocks, SFX grading
- `src/data/quizTypes.js` — Active type minLevel/cefrMin values updated; deferred types cefrMin updated to B2
- `src/data/__tests__/quizTypes.test.js` — 22 tests (stub test replaced + 6 new active/deferred/CEFR tests)
- `src/components/Quiz/SentenceBuilder.jsx` — Latent tile object bug fixed (Rule 1)

## Decisions Made

- GrammarFill cefrMin updated from A1 to A2 to match plan spec exactly
- WordOrder/ClozePassage tile bank normalization: options arrive as objects {label, value, correct, tile} — component extracts .label for display, .value for answer. Same fix applied to SentenceBuilder
- Deferred types cefrMin changed from B1/A2 to B2 — all three now uniformly gated at B2

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed tile object rendering crash in WordOrder (and SentenceBuilder)**
- **Found during:** Task 2 (WordOrder test run)
- **Issue:** `buildChoices('WordOrder')` and `buildChoices('sentence-build')` return option objects `{label, value, correct, tile}`, but SentenceBuilder/WordOrder passed the whole object to `formatArabic(tile)` — React throws "Objects are not valid as a React child"
- **Fix:** In `handleTileClick`: normalize `tile` to string via `tile?.value ?? tile`. In tile bank render: extract `tile?.label ?? tile` for display. Applied identically to both WordOrder.jsx and SentenceBuilder.jsx
- **Files modified:** src/components/Quiz/WordOrder.jsx, src/components/Quiz/SentenceBuilder.jsx
- **Verification:** All 5 WordOrder tests pass; 1278 suite tests pass
- **Committed in:** befcda9 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — latent rendering bug in SentenceBuilder propagated to WordOrder)
**Impact on plan:** Critical fix — without it, both `sentence-build` and `WordOrder` quiz types would crash in production on any tile-based quiz. No scope creep.

## Issues Encountered

None beyond the auto-fixed tile bug above.

## Next Phase Readiness

- 15 active quiz types + 3 deferred stubs — QUIZ-01 fully satisfied
- Phase 60 complete — all 3 new quiz types (GrammarFill, WordOrder, ClozePassage) wired and tested
- SentenceBuilder latent bug fixed — sentence-build quiz type now works correctly in production
- Phase 61 (Grammar CAT) and Phase 63 (Achievement Expansion) can proceed

## Self-Check: PASSED

All created files exist. All commits verified.

- FOUND: src/components/Quiz/WordOrder.jsx
- FOUND: src/components/Quiz/ClozePassage.jsx
- FOUND: src/components/Quiz/__tests__/WordOrder.test.jsx
- FOUND: src/components/Quiz/__tests__/ClozePassage.test.jsx
- FOUND: .planning/phases/60-quiz-expansion-core-3-types/60-02-SUMMARY.md
- FOUND: commit d11acdc (Task 1)
- FOUND: commit befcda9 (Task 2)

---
*Phase: 60-quiz-expansion-core-3-types*
*Completed: 2026-03-22*
