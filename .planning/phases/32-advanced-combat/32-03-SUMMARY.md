---
phase: 32-advanced-combat
plan: 03
subsystem: battle, grammar, effects
tags: [grammar-combos, compound-effects, tdd, arabic-validation, lesson-gating, verb-chains, noun-adjective]

# Dependency graph
requires:
  - phase: 32-01
    provides: "STATUS_EFFECTS, COMPOUND_EFFECTS, detectCompoundEffect()"
  - phase: 32-02
    provides: "NOUN_ADJ_COMBOS, VERB_CHAIN_PATTERNS, SENTENCE_TEMPLATES from grammarCombos.js"
provides:
  - "GrammarComboDetector class for validating Arabic grammar patterns in combat"
  - "CompoundEffectResolver class for detecting and resolving compound status effects"
  - "49 tests covering grammar combo detection and compound effect resolution"
affects: [32-04, 32-05, 32-06, 32-07, 32-08, 32-09, 32-10, 32-11]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Exact-match-first for diacritical Arabic verb forms, normalized fallback for user input"
    - "Partial credit scoring for sentence combos (accuracy = matched slots / 3)"
    - "Pure static class pattern for CompoundEffectResolver (no store dependency)"
    - "Dual-gated combo availability: lesson completion + CEFR level threshold"

key-files:
  created:
    - src/game/systems/battle/GrammarComboDetector.js
    - src/game/systems/battle/__tests__/GrammarComboDetector.test.js
    - src/game/systems/battle/CompoundEffectResolver.js
    - src/game/systems/battle/__tests__/CompoundEffectResolver.test.js
  modified: []

key-decisions:
  - "Exact-match-first for verb forms: Arabic diacritics (shadda etc.) distinguish Form I from Form II, so diacritics must be preserved for verb matching, with normalized fallback"
  - "Lesson gate checked before template matching in detectSentenceCombo: returns specific 'lesson not completed' reason rather than generic 'no match'"
  - "resolveCompounds picks first compound match in COMPOUND_EFFECTS iteration order when multiple are possible"

patterns-established:
  - "GrammarComboDetector: constructor(completedLessons), method per combo type returning { valid, damageMultiplier, comboType, ... }"
  - "CompoundEffectResolver: pure static methods, delegates to detectCompoundEffect() from statusEffects.js"
  - "stripDiacritics() utility for normalized Arabic comparison (removes U+0610-U+061A, U+064B-U+065F, U+0670)"

# Metrics
duration: 4min
completed: 2026-02-13
---

# Phase 32 Plan 03: Grammar Combo Detector & Compound Effect Resolver Summary

**TDD GrammarComboDetector (noun+adj, verb chains, sentence combos with lesson gating) and CompoundEffectResolver (compound status effect detection/resolution) with 49 tests**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-13T15:34:21Z
- **Completed:** 2026-02-13T15:38:49Z
- **Tasks:** 2 (TDD, 4 commits)
- **Files created:** 4

## Accomplishments

- GrammarComboDetector validates 3 combo types (noun+adjective, verb conjugation chains, sentence construction) with lesson and CEFR level gating
- CompoundEffectResolver detects all 6 compound effects (resilience, corrosion, petrify, clarity, berserk, doom) and resolves component replacement
- 49 new tests (30 GrammarComboDetector + 19 CompoundEffectResolver), bringing total to 1,121
- Exact-match-first verb form strategy preserves Arabic diacritical distinctions between conjugation forms

## Task Commits

Each task followed RED-GREEN-REFACTOR TDD cycle:

1. **Task 1: TDD GrammarComboDetector**
   - RED: `2fb2e80` (test) - 26 failing tests for all combo types and edge cases
   - GREEN: `0a96d0b` (feat) - Implementation with lesson gating, all 30 tests passing
2. **Task 2: TDD CompoundEffectResolver**
   - RED: `ba5a3e0` (test) - 18 failing tests for compound detection, resolution, Arabic lookup
   - GREEN: `e8f696d` (feat) - Pure static class implementation, all 19 tests passing

## Files Created/Modified

- `src/game/systems/battle/GrammarComboDetector.js` - Grammar combo validation with 4 methods (detectNounAdjectiveCombo, detectVerbConjugationChain, detectSentenceCombo, getAvailableComboTypes)
- `src/game/systems/battle/__tests__/GrammarComboDetector.test.js` - 30 tests covering all combo types, lesson gating, edge cases, Arabic input handling
- `src/game/systems/battle/CompoundEffectResolver.js` - Compound effect detection and resolution with 3 static methods
- `src/game/systems/battle/__tests__/CompoundEffectResolver.test.js` - 19 tests covering all 6 compounds, replacement logic, Arabic name lookup

## Decisions Made

- **Exact-match-first for verb forms:** Arabic diacritics (especially shadda) distinguish verb Form I (kataba) from Form II (kattaba). Stripping diacritics would collapse both to the same consonant skeleton. Solution: try exact string match first, fall back to normalized comparison. This preserves form distinction while allowing flexible user input.
- **Lesson gate before template matching:** In detectSentenceCombo, check lesson availability first so the error reason specifically mentions "lesson not completed" rather than the generic "no match" message.
- **First-match compound priority:** When multiple compounds are possible (e.g., strength+shield=resilience AND strength+courage=berserk), resolveCompounds picks the first match in COMPOUND_EFFECTS iteration order. This is deterministic and predictable.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Verb form matching required exact-match-first strategy**
- **Found during:** Task 1 GREEN phase (GrammarComboDetector implementation)
- **Issue:** Plan said "strip diacritics for comparison" but stripping diacritics collapses verb Form I and Form II to identical strings, causing Form II to always match as Form I (wrong multiplier)
- **Fix:** Added two-pass matching: exact match first (preserving diacritics), normalized fallback second
- **Files modified:** src/game/systems/battle/GrammarComboDetector.js
- **Verification:** "escalates damage multiplier per chain link" test passes with correct Form II multiplier (1.2)
- **Committed in:** 0a96d0b (Task 1 GREEN commit)

---

**Total deviations:** 1 auto-fixed (1 bug - diacritical verb form distinction)
**Impact on plan:** Essential correction. Without this fix, verb chain combos would always return Form I multiplier regardless of actual form used.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- GrammarComboDetector ready for GrammarComboSystem integration (32-05)
- CompoundEffectResolver ready for StatusEffectManager / BattleTurnManager integration (32-04, 32-05)
- Both classes are pure logic with no store/scene dependency, easily composable
- All 1,121 tests pass, build succeeds (862KB main bundle)

## Self-Check: PASSED

All files verified present. All commit hashes found in git log.

---
*Phase: 32-advanced-combat*
*Completed: 2026-02-13*
