---
phase: 32-advanced-combat
plan: 02
subsystem: data, combat, state
tags: [grammar, arabic, combos, arena, redux, leaderboard, verb-forms, noun-adjective]

# Dependency graph
requires:
  - phase: 27-battle-system
    provides: battleSlice pattern, enemy data
  - phase: 32-01
    provides: statusEffects.js pattern reference
provides:
  - Grammar combo data (noun+adj, verb chains, sentence templates)
  - Arena challenge configurations (survival, boss rush, puzzle)
  - arenaSlice for arena state management and leaderboards
affects: [32-03, 32-04, 32-05, 32-06, 32-07, 32-08, 32-09, 32-10, 32-11]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Grammar-gated combat combos: lesson completion + CEFR level = combo unlock"
    - "Verb chain escalation: Form I -> II -> IV with increasing multipliers"
    - "Arena leaderboard: top 10 per mode, sorted by score desc"
    - "Wave scaling function: enemyCount, hpMultiplier, arabicDifficulty scale with wave number"

key-files:
  created:
    - src/data/grammarCombos.js
    - src/data/arenaChallenges.js
    - src/store/slices/arenaSlice.js
  modified: []

key-decisions:
  - "Used actual grammar.js lesson IDs (noun-adjective-agreement, basic-verb-conjugation) instead of plan-specified shortened IDs"
  - "6 bosses in rush sequence (all existing bosses in story order) instead of 5-8 range"
  - "arenaSlice uses localStorage (not IndexedDB) — lightweight enough, no nested persistReducer needed"
  - "CEFR level gating: A1=level 1, A2=level 3, B1=level 7 — prevents access to powerful combos too early"

patterns-established:
  - "Grammar combo pattern: { id, requiredLesson, comboType, cefrLevel, damageMultiplier } for lesson-gated combat abilities"
  - "getAvailableCombos(completedLessons, playerLevel) filtering pattern for dual-gated content"
  - "Arena mode config: { id, name, nameArabic, description, maxWaves, unlockLevel } for mode definitions"
  - "Wave scaling function pattern: returns config object based on wave number with progressive difficulty"

# Metrics
duration: 4min
completed: 2026-02-13
---

# Phase 32 Plan 02: Grammar Combos & Arena Data Summary

**Grammar combo definitions (17 combos across 3 types) with lesson/level gating, arena challenge configs (3 modes, wave scaling, 6-boss rush, 5 puzzles), and arenaSlice with top-10 leaderboards**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-13T15:27:58Z
- **Completed:** 2026-02-13T15:31:49Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments
- 8 noun+adjective combos, 5 verb chain patterns, 4 sentence templates with authentic Arabic content
- Grammar combos dual-gated by completed lessons AND player level (CEFR thresholds)
- 3 arena modes (survival, boss rush, puzzle) with wave scaling function
- 6-boss rush sequence with Arabic/English narrative interludes between fights
- 5 puzzle battle configurations tied to specific grammar lessons
- arenaSlice with leaderboard tracking (top 10 per mode), challenge completion, streak tracking

## Task Commits

Each task was committed atomically:

1. **Task 1: Create grammar combo data definitions** - `0ea4ac7` (feat)
2. **Task 2: Create arena challenge data and arenaSlice** - `2de5044` (feat)

## Files Created/Modified
- `src/data/grammarCombos.js` - 17 grammar combos (8 noun+adj, 5 verb chain, 4 sentence), getAvailableCombos helper
- `src/data/arenaChallenges.js` - 3 arena modes, wave scaling, 6-boss rush sequence, 5 puzzle battles
- `src/store/slices/arenaSlice.js` - Arena Redux slice with leaderboard, challenge completion, puzzle progress

## Decisions Made
- **Used actual grammar.js lesson IDs:** Plan specified `noun-adj-agreement` and `verb-forms`, but actual IDs in grammar.js are `noun-adjective-agreement` and `basic-verb-conjugation`. Used real IDs for correctness.
- **6 bosses in rush sequence:** All 6 existing bosses from enemies.js used in story order (oasis-guardian through mountain-elder).
- **CEFR gating thresholds:** A1=level 1+, A2=level 3+, B1=level 7+ prevents access to powerful combos too early.
- **arenaSlice NOT added to store.js:** Plan explicitly defers to 32-11 for integration.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected requiredLesson IDs to match grammar.js**
- **Found during:** Task 1 (Grammar combo data definitions)
- **Issue:** Plan specified `noun-adj-agreement` and `verb-forms` as requiredLesson values, but grammar.js uses `noun-adjective-agreement` and `basic-verb-conjugation`
- **Fix:** Used actual grammar.js lesson IDs for all combos
- **Files modified:** src/data/grammarCombos.js
- **Verification:** getAvailableCombos correctly filters with real lesson IDs
- **Committed in:** 0ea4ac7 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Essential correction — using wrong lesson IDs would break all combo gating.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Grammar combo data ready for StatusEffectManager (32-03) and GrammarComboSystem (32-04)
- Arena challenge data ready for ArenaManager (32-06) and ArenaUI (32-07)
- arenaSlice ready for store integration (32-11)
- All data files use consistent patterns with existing codebase (elementCombos.js, enemies.js, battleSlice.js)

## Self-Check: PASSED

- FOUND: src/data/grammarCombos.js
- FOUND: src/data/arenaChallenges.js
- FOUND: src/store/slices/arenaSlice.js
- FOUND: commit 0ea4ac7 (Task 1)
- FOUND: commit 2de5044 (Task 2)
- Build: succeeds

---
*Phase: 32-advanced-combat*
*Completed: 2026-02-13*
