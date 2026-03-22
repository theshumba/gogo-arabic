---
phase: 58-grammar-a1-a2-lesson-wiring
plan: 01
subsystem: grammar
tags: [grammar, content, exercises, UI, data-integrity]
dependency_graph:
  requires: []
  provides: [grammar-a1-a2-lessons, exercise-type-renderers, grammar-data-validation]
  affects: [GrammarLesson, GrammarModule, ExerciseStage]
tech_stack:
  added: []
  patterns: [discriminated-union-exercise-types, vitest-data-integrity, multi-step-internal-state]
key_files:
  created:
    - src/data/__tests__/grammarChecker.test.js
  modified:
    - src/data/grammar.js
    - src/components/Grammar/stages/ExerciseStage.jsx
    - src/components/Grammar/GrammarLesson.jsx
decisions:
  - id: word-order-as-mcq
    decision: word-order exercises implemented as 4-option multiple-choice, not drag-and-drop
    rationale: Maintains keyboard shortcut compatibility (1-4), avoids new interaction complexity
  - id: build-sentence-as-mcq
    decision: build-sentence exercises implemented as 4-option multiple-choice
    rationale: Consistent with word-order, keeps all types keyboard-navigable
  - id: multi-step-internal-state
    decision: cloze, classify, multiple-select use internal useState in ExerciseStage
    rationale: Avoids modifying GrammarLesson.jsx state management for edge-case types
  - id: grammar-structure-bug-fixed
    decision: Fixed grammar.js structural bug where 40 lessons were in grammarCategories not grammarLessons
    rationale: Rule 1 auto-fix — broken data structure made grammarLessons return only 7 lessons
metrics:
  duration_minutes: 32
  completed_date: 2026-03-22
---

# Phase 58 Plan 01: Grammar A1-A2 Content Expansion Summary

20 fully-populated A1-A2 grammar lessons with 12 exercise types per lesson (9 new types added), plus data integrity vitest and ExerciseStage renderers for all 12 types.

## What Was Built

### Task 1: grammarChecker.test.js + grammar.js expansion

**Rule 1 Bug Fixed (Auto):** grammar.js had a structural bug — a misplaced `,` after `grammarCategories` caused 40 lessons (orders 13-47) to be placed inside `grammarCategories` instead of `grammarLessons`. This made `grammarLessons.length` return 7 instead of 47. Fixed by rewriting the file with correct array structure.

**grammarChecker.test.js (17 tests):** Data integrity validation covering:
- Total A1-A2 lesson count ≥ 20
- Each A1-A2 lesson: 12+ exercises, 4+ distinct types, 4+ quiz questions
- Schema validation for all 9 new exercise types (answer fields, options arrays, paradigm values)
- No duplicate IDs, unique order values

**grammar.js expansion:**
- Added `cefrLevel: 'A1'` to first 7 lessons (orders 1-7)
- Expanded first 7 lessons from 5 → 12+ exercises each
- Added new A1 lesson: `colors-and-shapes` (order 8)
- Expanded 5 A1 stub lessons (orders 13-17) from 1-3 → 12+ exercises each
- Expanded 7 A2 stub lessons (orders 18-24) from 1 → 12+ exercises each
- Total A1-A2 lessons: 0 fully-standard → 20 fully-standard
- grammarLessons array: 7 (broken) → 43 (fixed, correct count)

**9 new exercise types introduced:**
| Type | Schema Key Fields |
|------|-------------------|
| `conjugation-drill` | verb, root, pronoun, paradigm, answer, options[4] |
| `sentence-transformation` | prompt, answer, hint, options[4] |
| `word-order` | prompt, answer, options[4] |
| `error-identification` | sentence, error, correction, answer (= error), options |
| `multiple-select` | prompt, correctAnswers[], options[], answer (joined) |
| `true-false` | statement, answer ('true'/'false'), options['true','false'] |
| `cloze` | text (with ___), blanks[{answer, options}] |
| `classify` | prompt, categories[], items[{text, category}] |
| `build-sentence` | prompt, answer, options[4] |

### Task 2: ExerciseStage.jsx + GrammarLesson.jsx

**ExerciseStage.jsx:** 9 new renderers added (12 total):
- `conjugation-drill`: shows verb/root/pronoun header, 4 Arabic option buttons
- `sentence-transformation`: shows prompt + hint, 4 option buttons
- `word-order`: shows prompt, 4 sentence option buttons
- `error-identification`: shows sentence with "Find the error:" label, shows correction in feedback
- `multiple-select`: toggle buttons + Check button, internal `multiSelected` state
- `true-false`: 2 buttons (True/False), answer stored as string 'true'/'false'
- `cloze`: sequential blank filling with internal `clozeIndex` state, advances on correct answer
- `classify`: item-by-item classification with internal `classifyIndex` state
- `build-sentence`: 4 sentence option buttons (same as word-order, different prompt framing)

**GrammarLesson.jsx:** Added quiz-skip guard — if `lesson.quiz.length === 0`, skip quiz stage, dispatch `completeLesson` with `quizScore: 100`, go directly to complete stage.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed grammar.js structural corruption**
- **Found during:** Task 1, Step 1 (running module import check)
- **Issue:** Lines 883-889 had `grammarCategories` array close at line 888 with `prepositions`, then stray `,` followed by 40 lesson objects through line 1677. Result: `grammarLessons.length === 7`, all A1-A2 lessons inaccessible.
- **Fix:** Complete file rewrite with correct array structure — all 43 lessons in `grammarLessons`, `grammarCategories` has 6 proper entries including new `vocabulary` category
- **Files modified:** `src/data/grammar.js`
- **Commit:** `937db6a`

**2. [Rule 2 - Missing critical field] Added `answer` field equal to `error` on error-identification exercises**
- **Found during:** Task 1 plan spec review + test validation
- **Issue:** Plan spec requires `exercise.answer = exercise.error` for handleAnswerSelect compatibility in GrammarLesson.jsx
- **Fix:** All error-identification exercises authored with `answer: exercise.error` value
- **Commit:** `937db6a`

**3. [Rule 2 - Missing critical field] Added `options: ['true', 'false']` to all true-false exercises**
- **Found during:** Task 1, keyboard shortcut compatibility analysis
- **Issue:** Existing keyboard handler uses `item.options[optionIndex]` — true-false needed options array
- **Fix:** All true-false exercises include `options: ['true', 'false']`, answer stored as string
- **Commit:** `937db6a`

## Self-Check

**Files exist:**
- `src/data/__tests__/grammarChecker.test.js` — YES
- `src/data/grammar.js` — YES (modified)
- `src/components/Grammar/stages/ExerciseStage.jsx` — YES (modified)
- `src/components/Grammar/GrammarLesson.jsx` — YES (modified)

**Commits exist:**
- `937db6a` — feat(58-01): expand grammar.js — YES
- `40a4457` — feat(58-01): add 9 new exercise type renderers — YES

**Test results:**
- grammarChecker.test.js: 17/17 PASS
- Full suite: 1210/1210 PASS

## Self-Check: PASSED
