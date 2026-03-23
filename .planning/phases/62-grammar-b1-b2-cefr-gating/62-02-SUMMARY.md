---
phase: 62
plan: 62-02
name: Skill Tree Gating for B1/B2 Grammar
subsystem: grammar
tags: [grammar, CEFR, skill-tree, gating, UI, toast]
dependency_graph:
  requires: [grammarSlice@selectLessonsByCategory, skillTreeSlice@unlockedNodes.grammar, grammar.js@cefrLevel]
  provides: [CEFR_GRAMMAR_GATES, selectLessonsByCategory@isCefrLocked, GrammarModule@cefrLockedBadge, GrammarModule@newContentToast]
  affects: [GrammarModule, grammarSlice]
tech_stack:
  added: []
  patterns: [CEFR-gate-selector, localStorage-version-toast]
key_files:
  created: []
  modified:
    - src/store/slices/grammarSlice.js
    - src/store/__tests__/grammarSlice.test.js
    - src/components/Grammar/GrammarModule.jsx
decisions:
  - "CEFR gate enforced at selector level (not in unlockNextLesson reducer) — unlockedLessons array still receives the lesson ID; isUnlocked becomes false at selector time when cefrUnlocked is false"
  - "B1 gate: 3+ grammar tree nodes; B2 gate: 5+ grammar tree nodes; A1/A2 gate: 0 (always accessible)"
  - "CEFR-locked badge text: 'Requires Grammar Tree Level X' with brown (#8B4513) color to visually distinguish from regular Locked (#666)"
  - "New content toast: storedCount > 0 guard ensures fresh installs don't see spurious 'N lessons added' message"
  - "useEffect timer cleared on unmount via cleanup function to prevent setState on unmounted component"
metrics:
  duration: "~3 minutes"
  completed: "2026-03-23"
  commits: [2df9b03, 2692e16]
---

# Phase 62 Plan 02: Skill Tree Gating for B1/B2 Grammar Summary

## One-liner

B1/B2 grammar lessons now CEFR-gated behind Grammar skill tree levels 3 and 5 respectively, with distinct brown "Requires Grammar Tree Level X" badges in GrammarModule UI and a new-content toast for returning players.

## What Was Built

### Task 62-02-01: CEFR gating in grammarSlice

Added `CEFR_GRAMMAR_GATES` constant mapping CEFR levels to required Grammar skill tree node counts:

| CEFR Level | Required Grammar Tree Nodes |
|------------|----------------------------|
| A1 | 0 (always accessible) |
| A2 | 0 (always accessible) |
| B1 | 3 |
| B2 | 5 |

`selectLessonsByCategory` updated with a 4th input selector reading `state.skillTree?.unlockedNodes?.grammar?.length ?? 0`. Each lesson in the result now carries:

- `isCefrLocked: boolean` — true when Grammar tree level < CEFR gate requirement
- `cefrGateLevel: number` — the required node count for this lesson's CEFR level
- `currentTreeLevel: number` — the player's current Grammar tree node count
- `isUnlocked: boolean` — now `unlockedLessons.includes(id) && cefrUnlocked` (CEFR gate enforced here)

The gate is enforced purely at the selector level. `unlockNextLesson` continues to add lesson IDs to the `unlockedLessons` array unconditionally — the selector then masks them if the CEFR gate is not met.

8 new CEFR gating tests added to `grammarSlice.test.js` (55 tests total).

### Task 62-02-02: GrammarModule UI updates

**LessonCard CEFR badge:**
- `badgeText`: `'Requires Grammar Tree Level X'` for CEFR-locked lessons (X = cefrGateLevel)
- `badgeColor`: `#8B4513` (brown) for CEFR-locked, distinct from regular `#666` locked
- Card border also switches to `#8B4513` when CEFR-locked
- Shows `Your level: {currentTreeLevel}` line below the badge for CEFR-locked cards

**New content toast:**
- Reads `gogo_grammar_lesson_count` from localStorage on component mount
- If stored count > 0 and current count is higher: shows `"{N} new grammar lesson(s) added!"` toast
- Toast auto-dismisses after 4 seconds via `setTimeout` with cleanup on unmount
- Stores updated count regardless, so subsequent opens don't re-toast

## Verification Results

```
grammarSlice.test.js: 55/55 tests pass
Full suite: 1414 pass, 1 pre-existing HUD failure (unrelated to grammar)
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Existing grammarSlice tests broke when B1/B2 mock lessons were added**
- **Found during:** Task 62-02-01 test run after extending vi.mock with lesson5 (B1) and lesson6 (B2)
- **Issue:** `selectGrammarProgress` test expected 50% (2/4 lessons) but mock now has 6 lessons → result was 33%; `unlockNextLesson` "last lesson" test used `lesson4` but `lesson6` is now last
- **Fix:** Updated both tests to match new 6-lesson mock (33% progress, lesson6 as last)
- **Files modified:** src/store/__tests__/grammarSlice.test.js
- **Commit:** 2df9b03

## Self-Check: PASSED

- FOUND: src/store/slices/grammarSlice.js
- FOUND: src/components/Grammar/GrammarModule.jsx
- FOUND: src/store/__tests__/grammarSlice.test.js
- FOUND: commit 2df9b03
- FOUND: commit 2692e16
