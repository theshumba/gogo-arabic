---
phase: 31-crafting-professions
plan: 02
subsystem: crafting-logic
tags: [tdd, business-logic, pure-functions, vocabulary-gating, testing]
dependency_graph:
  requires: []
  provides:
    - Pure crafting business logic functions
    - Quality calculation (5-tier system)
    - XP gain calculation (accuracy-based)
    - Vocabulary-gated ingredient checks
    - Resource sufficiency validation
    - Profession XP progress calculation
    - Gathering quality distribution
  affects:
    - 31-03 (Crafting UI components will use these functions)
    - 31-04 (Mini-games will call calculateCraftQuality/XPGain)
    - 31-05 (Gathering spots will use calculateGatheringQuality)
tech_stack:
  added: []
  patterns:
    - TDD (RED-GREEN-REFACTOR cycle)
    - Pure functions with dependency injection
    - Mock data for parallel development
    - Comprehensive edge case testing
key_files:
  created:
    - src/utils/craftingLogic.js (192 lines, 7 exports)
    - src/utils/__tests__/craftingLogic.test.js (484 lines, 37 tests)
  modified: []
decisions:
  - decision: "Use dependency injection for RECIPES/RESOURCES data"
    rationale: "Allows testing with mock data while 31-01 creates actual data files in parallel. Makes functions truly pure and testable."
    alternatives_considered:
      - "Import data directly" : "Would fail tests until 31-01 completes"
      - "Use vi.mock() to mock imports" : "Vitest hoisting issues with static imports"
    tags: [architecture, testing]
  - decision: "Level 0 requires 50 XP, levels 1-10 require 100×level XP"
    rationale: "Faster initial progression encourages early crafting engagement. Linear scaling keeps progression predictable."
    alternatives_considered:
      - "Exponential scaling" : "Too punishing at high levels"
      - "Flat 100 XP all levels" : "No sense of increasing mastery"
    tags: [game-balance, progression]
  - decision: "4-tier gathering quality (normal/high/pristine/perfect) vs 5-tier crafting quality"
    rationale: "Gathering has fewer variables (just profession level). Crafting has mini-game accuracy for finer control."
    alternatives_considered:
      - "Same 5-tier system for both" : "Over-complicates gathering"
    tags: [game-design]
metrics:
  duration: "5m 44s"
  completed: 2026-02-13
  commits: 3
  test_coverage: "100% (all functions tested)"
  loc_added: 676
---

# Phase 31 Plan 02: Crafting Logic (TDD) Summary

TDD implementation of 7 pure business logic functions for crafting system: quality calculation, XP gains, vocabulary gating, resource validation, and profession progression.

## Objectives Met

**Original Objective:** TDD the pure crafting business logic: quality calculation, XP gains, vocabulary gating, resource sufficiency checks, and profession leveling math.

**Outcome:** All 7 functions implemented with comprehensive test coverage. 37 tests (484 lines) cover all edge cases including boundary values, empty states, and error conditions.

## What Was Built

### Core Functions

1. **calculateCraftQuality(accuracy)** — 5-tier quality system
   - legendary (≥0.95), epic (>0.80), rare (>0.60), uncommon (>0.40), common (≤0.40)
   - Used by crafting mini-games to determine item quality

2. **calculateXPGain(baseXP, accuracy)** — Accuracy-based XP multipliers
   - Perfect (≥0.95): 1.5× | Good (≥0.80): 1.2× | Standard (≥0.60): 1.0× | Poor (<0.60): 0.5×
   - Always returns integer (Math.floor)

3. **canUseIngredient(resourceId, fsrsCards, RESOURCES)** — Vocabulary gating
   - Returns true only if: resource exists, word in FSRS, and reps > 0
   - Core mechanic: crafting teaches vocabulary through usage

4. **getDisplayableIngredients(recipeId, fsrsCards, RECIPES, RESOURCES)** — UI helper
   - Maps ingredients to { resourceId, quantity, canUse, displayName, hint }
   - Shows Arabic name if unlocked, '???' with hint if locked

5. **hasRequiredResources(recipeId, resources, RECIPES)** — Validation
   - Returns { canCraft: boolean, missing: array }
   - Missing array includes { resourceId, needed, have, shortfall }

6. **calculateProfessionXP(currentXP, currentLevel)** — Progress tracking
   - Level 0: 50 XP to level 1
   - Levels 1-10: 100 XP × level (linear scaling)
   - Returns { current, required, percent }

7. **calculateGatheringQuality(professionLevel, roll)** — 4-tier progression
   - Level 0-2: 80% normal, 20% high
   - Level 3-5: 60% normal, 30% high, 10% pristine
   - Level 6-8: 40% normal, 35% high, 20% pristine, 5% perfect
   - Level 9-10: 20% normal, 30% high, 30% pristine, 20% perfect

### TDD Process

**RED Phase (commit 211521f):**
- Created 37 failing tests covering all 7 functions
- Tests use mock RECIPES/RESOURCES data
- 30 tests failed, 7 passed (expected false/empty cases)

**GREEN Phase (commit 6812c7a):**
- Implemented all 7 functions to pass tests
- All 37 tests passing
- All 1060 project tests passing

**REFACTOR Phase (commit 5ec1fb4):**
- Simplified calculateXPGain (removed intermediate variable)
- Added clearer comments for accuracy thresholds
- All tests still passing

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Dependency injection pattern for data files**
- **Found during:** RED phase - test setup
- **Issue:** Tests tried to import RECIPES/RESOURCES but files don't exist yet (31-01 in parallel)
- **Fix:** Changed functions to accept RECIPES/RESOURCES as optional parameters with defaults
- **Files modified:** craftingLogic.js, craftingLogic.test.js
- **Commit:** 211521f
- **Rationale:** Makes functions pure, testable with mocks, and ready for real data when 31-01 completes

## Test Coverage

**37 tests across 7 functions:**

| Function | Tests | Edge Cases Covered |
|----------|-------|-------------------|
| calculateCraftQuality | 6 | Boundaries (0.95, 0.80, 0.60, 0.40), min/max values |
| calculateXPGain | 6 | All multipliers, integer floor, zero base XP |
| canUseIngredient | 5 | Unknown resource, missing FSRS, reps=0, reps=1 |
| getDisplayableIngredients | 4 | Unlocked, locked, all locked, unknown recipe |
| hasRequiredResources | 5 | Sufficient, insufficient, missing, empty recipe, unknown recipe |
| calculateProfessionXP | 5 | Levels 1-10, level 0, zero/full XP, overflow, integer percent |
| calculateGatheringQuality | 6 | All 4 level ranges, Math.random() fallback, boundaries |

**Coverage:** 100% of exported functions tested

## Integration Points

**Upstream dependencies:** None (pure functions, no external dependencies)

**Downstream consumers (next plans):**
- 31-03: Crafting UI will import these for ingredient display and validation
- 31-04: Mini-games will call calculateCraftQuality and calculateXPGain
- 31-05: Gathering spots will use calculateGatheringQuality
- 31-06: Redux slice will use hasRequiredResources for crafting actions

## Verification

- ✅ `npx vitest run src/utils/__tests__/craftingLogic.test.js` — all 37 tests pass
- ✅ `npx vitest run` — all 1060 project tests pass
- ✅ `npx vite build` — succeeds
- ✅ 7 pure functions exported from craftingLogic.js
- ✅ 484 lines of tests (exceeds 200-line requirement)
- ✅ Vocabulary gating correctly checks FSRS review status (reps > 0)
- ✅ Quality tiers match 5-tier system (common → legendary)
- ✅ XP calculation matches progression curve (100 XP × level)

## Must-Haves Status

All must-have truths verified:

- ✅ Crafting quality calculation produces correct tier based on mini-game accuracy
- ✅ Profession XP gain scales with recipe difficulty and accuracy bonus
- ✅ Vocabulary-gated ingredient check correctly returns usable/locked status
- ✅ Resource sufficiency check validates all ingredients before allowing craft
- ✅ Level-up threshold calculated correctly (100 XP × current level, 50 XP for level 0)

All must-have artifacts delivered:

- ✅ src/utils/craftingLogic.js with 7 pure functions
- ✅ src/utils/__tests__/craftingLogic.test.js with 484 lines (exceeds 200 min)
- ✅ Key links validated (functions accept RECIPES/RESOURCES as parameters)

## Next Phase Readiness

**Blockers:** None

**Ready for:**
- ✅ 31-03 (Crafting UI) — can import and use all 7 functions
- ✅ 31-04 (Mini-games) — quality/XP calculation ready
- ✅ 31-05 (Gathering) — gathering quality calculation ready
- ✅ 31-06 (Redux integration) — validation functions ready

**Notes for next plans:**
- When 31-01 creates actual RECIPES/RESOURCES data files, callers should import them and pass to these functions
- Example usage: `canUseIngredient('paper', fsrsCards, RESOURCES)`
- Functions work with null/undefined data (safe fallbacks)

## Self-Check

Verifying claims made in summary:

```bash
# Check created files exist
[ -f "src/utils/craftingLogic.js" ] && echo "FOUND: craftingLogic.js" || echo "MISSING: craftingLogic.js"
[ -f "src/utils/__tests__/craftingLogic.test.js" ] && echo "FOUND: test file" || echo "MISSING: test file"

# Check commits exist
git log --oneline --all | grep -q "211521f" && echo "FOUND: RED commit" || echo "MISSING: RED commit"
git log --oneline --all | grep -q "6812c7a" && echo "FOUND: GREEN commit" || echo "MISSING: GREEN commit"
git log --oneline --all | grep -q "5ec1fb4" && echo "FOUND: REFACTOR commit" || echo "MISSING: REFACTOR commit"

# Verify test count
grep -c "it(" src/utils/__tests__/craftingLogic.test.js
# Expected: 37

# Verify exports
grep -c "^export function" src/utils/craftingLogic.js
# Expected: 7
```

## Self-Check: PASSED

All verification checks passed:
- ✅ craftingLogic.js exists (192 lines)
- ✅ craftingLogic.test.js exists (484 lines)
- ✅ RED commit 211521f exists
- ✅ GREEN commit 6812c7a exists
- ✅ REFACTOR commit 5ec1fb4 exists
- ✅ 37 tests counted
- ✅ 7 functions exported
