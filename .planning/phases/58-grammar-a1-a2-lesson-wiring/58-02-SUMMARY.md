---
phase: 58-grammar-a1-a2-lesson-wiring
plan: 02
subsystem: grammar
tags: [grammar, redux, middleware, migration, UI, gating, lesson-unlock]
dependency_graph:
  requires: [58-01]
  provides: [grammar-lesson-unlock-state, auto-unlock-middleware, lesson-gating-UI, migration-12]
  affects: [grammarSlice, learningProgressMiddleware, GrammarModule, migrations]
tech_stack:
  added: []
  patterns: [order-based-sequential-unlock, migration-state-init, badge-based-lock-UI]
key_files:
  created: []
  modified:
    - src/store/slices/grammarSlice.js
    - src/store/__tests__/grammarSlice.test.js
    - src/store/middleware/learningProgressMiddleware.js
    - src/store/middleware/__tests__/learningProgressMiddleware.test.js
    - src/components/Grammar/GrammarModule.jsx
    - src/services/storage/migrations.js
    - src/services/storage/__tests__/migrations.test.js
decisions:
  - id: order-based-unlock
    decision: unlockNextLesson finds next lesson by global order field across all categories
    rationale: Single sorted pass — works regardless of category, consistent with grammar.js order field convention
  - id: migration-12-conservative
    decision: Migration 12 unlocks al-definite + all completed + one lesson ahead of highest completed
    rationale: Generous unlock for existing players without over-unlocking; middleware handles subsequent unlocks on next completion
  - id: gating-via-isUnlocked-flag
    decision: selectLessonsByCategory annotates isUnlocked on lesson objects so GrammarModule needs no extra selector call
    rationale: Single source of truth in selector; GrammarModule reads from lessonsByCategory only
metrics:
  duration_minutes: 4
  completed_date: 2026-03-22
---

# Phase 58 Plan 02: Grammar Lesson Unlock Wiring Summary

Grammar lesson completion auto-unlocks the next lesson in order, with Locked/New/Completed UI badges in GrammarModule and migration 12 initializing unlockedLessons for existing players.

## What Was Built

### Task 1: grammarSlice unlock state + unlockNextLesson reducer + selectors

**grammarSlice.js:**
- `unlockedLessons: ['al-definite']` added to `initialState` — first lesson always unlocked for new players
- `unlockNextLesson(state, action)` reducer — sorts all grammarLessons by `order`, finds next after completed lesson's order, pushes to `unlockedLessons` if not already present; handles unknown IDs and last-lesson edge case gracefully
- `resetGrammarProgress` updated to reset `unlockedLessons` back to `['al-definite']`
- `selectUnlockedLessons` selector — returns `state.grammar.unlockedLessons`
- `selectIsLessonUnlocked(lessonId)` selector — returns boolean for a specific lesson
- `selectLessonsByCategory` extended with third input `selectUnlockedLessons` — annotates `isUnlocked: boolean` on every lesson object returned

**grammarSlice.test.js (36 tests):**
- Updated mock to give lessons distinct global orders (1, 2, 3, 4) instead of per-category orders
- Added `grammarCategories` to mock
- Updated initial state test to include `unlockedLessons: ['al-definite']`
- Added `describe('unlockNextLesson')` — 5 tests: next-by-order, no-duplicate, last-lesson graceful, unknown-ID graceful, cross-category
- Added `describe('selectors - unlockedLessons')` — 3 tests: selectUnlockedLessons, selectIsLessonUnlocked true/false
- Added 2 tests for `selectLessonsByCategory` `isUnlocked` annotation
- Updated `resetGrammarProgress` test to check `unlockedLessons` resets

### Task 2: Middleware auto-unlock + GrammarModule gating + Migration 12

**learningProgressMiddleware.js:**
- Import `unlockNextLesson` from grammarSlice
- Updated JSDoc to document `unlockNextLesson` dispatch
- `grammar/completeLesson` case now dispatches both `addSkillXP` and `unlockNextLesson({ completedLessonId: action.payload.lessonId })`

**learningProgressMiddleware.test.js (12 tests):**
- Added integration test: completing `al-definite` → `noun-adjective-agreement` appears in `unlockedLessons`
- Added edge-case test: completing `formal-letter` (last lesson, order 42) → no crash, no `undefined` in unlocked list

**GrammarModule.jsx — LessonCard gating:**
- `cardStyle`: grey background (`#e8e8e8`) + grey border (`#999`) + `opacity: 0.5` + `cursor: not-allowed` for locked; hover effects gated on `lesson.isUnlocked`
- `statusBadgeStyle`: green for completed, gray for unlocked-new, `#666` for locked
- Badge text: `'Completed'` | `'New'` | `'Locked'`
- `motion.div` `onClick`, `onMouseEnter`, `whileTap` — all gated on `lesson.isUnlocked`
- Parent `LessonCard` `onClick` prop is `undefined` for locked lessons

**migrations.js:**
- `CURRENT_VERSION` bumped from 11 to 12
- Migration 12: if `grammar.unlockedLessons` is not an array, initializes it as `Set(['al-definite', ...completed, nextAfterHighestCompleted])` using inline `ORDERED_LESSON_IDS` array (43 entries)

**migrations.test.js:**
- Updated `CURRENT_VERSION equals 11` → `CURRENT_VERSION equals 12`

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

**Files exist:**
- `src/store/slices/grammarSlice.js` — YES (modified)
- `src/store/__tests__/grammarSlice.test.js` — YES (modified)
- `src/store/middleware/learningProgressMiddleware.js` — YES (modified)
- `src/store/middleware/__tests__/learningProgressMiddleware.test.js` — YES (modified)
- `src/components/Grammar/GrammarModule.jsx` — YES (modified)
- `src/services/storage/migrations.js` — YES (modified)
- `src/services/storage/__tests__/migrations.test.js` — YES (modified)

**Commits exist:**
- `559b45a` — feat(58-02): add unlockedLessons state + unlockNextLesson reducer + selectors — YES
- `c6c8e02` — feat(58-02): wire auto-unlock in middleware + lesson gating UI + migration 12 — YES

**Test results:**
- grammarSlice.test.js: 36/36 PASS
- learningProgressMiddleware.test.js: 12/12 PASS
- Full suite: 1224/1224 PASS

## Self-Check: PASSED
