---
phase: 32-advanced-combat
plan: 01
subsystem: battle, data, middleware
tags: [status-effects, arabic-vocabulary, fsrs, compound-effects, eventbus, redux-middleware]

# Dependency graph
requires:
  - phase: 27-battle-system
    provides: "STATUS_EFFECTS (14 original effects), battleSlice applyStatusEffect action"
  - phase: 31-crafting
    provides: "craftingVocabMiddleware pattern for FSRS auto-sync"
provides:
  - "24 status effects with Arabic names, transliterations, and mechanical properties"
  - "6 compound effects with component pair detection"
  - "statusEffectVocabMiddleware for auto-queuing battle vocabulary to FSRS"
  - "13 new EventBus constants for Phase 32 battle mechanics"
  - "detectCompoundEffect() helper for compound triggering"
  - "getStatusEffectsByLevel() for progressive effect unlocking"
affects: [32-02, 32-03, 32-04, 32-05, 32-06, 32-07, 32-08, 32-09, 32-10, 32-11]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Compound effects from component pairs with shouldReplace for cleanup"
    - "Level-gated data access to prevent FSRS queue flooding"
    - "Vocab middleware per subsystem (crafting, status effects) dispatching addFsrsCard"

key-files:
  created:
    - "src/store/middleware/statusEffectVocabMiddleware.js"
  modified:
    - "src/data/statusEffects.js"
    - "src/store/store.js"
    - "src/utils/eventBusTypes.js"

key-decisions:
  - "24 effects (not 22) — original file had 16 effects (not 14 as plan assumed), adding 8 yields 24"
  - "Level gating tiers: 10/16/24 — tier 2 returns original 16, tier 3 includes all Phase 32 additions"
  - "Compound wordId prefix 'compound_' vs status prefix 'status_' — namespace separation for FSRS cards"

patterns-established:
  - "statusEffectVocabMiddleware: listen for battle/applyStatusEffect, check compound flag, queue Arabic to FSRS"
  - "detectCompoundEffect returns shouldReplace array for component cleanup"
  - "EFFECT_ORDER derived from Object.keys for stable level gating"

# Metrics
duration: 3min
completed: 2026-02-13
---

# Phase 32 Plan 01: Status Effects Foundation Summary

**24 status effects with Arabic vocabulary, 6 compound effects, FSRS auto-sync middleware, and 13 Phase 32 EventBus constants**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-13T15:27:04Z
- **Completed:** 2026-02-13T15:30:08Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Expanded STATUS_EFFECTS from 16 to 24 entries, each with Arabic name, transliteration, English translation, and mechanical properties
- Created 6 compound effects (resilience, corrosion, petrify, clarity, berserk, doom) with component pair detection
- Built statusEffectVocabMiddleware that auto-queues status effect Arabic vocabulary to FSRS review on battle application
- Registered 13 new EventBus constants for Phase 32 battle mechanics (status effects, combos, flee, arena)
- Added level-gated effect access (10/16/24 by player level tier) to prevent FSRS queue flooding

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand status effects to 24 and add compound effect definitions** - `c0d73f5` (feat)
2. **Task 2: Create statusEffectVocabMiddleware and register Phase 32 EventBus constants** - `96fc16f` (feat)

## Files Created/Modified

- `src/data/statusEffects.js` - 24 status effects, 6 compound effects, detectCompoundEffect(), getStatusEffectsByLevel()
- `src/store/middleware/statusEffectVocabMiddleware.js` - Auto-sync status effect Arabic vocabulary to FSRS on applyStatusEffect
- `src/store/store.js` - Registered statusEffectVocabMiddleware in middleware chain
- `src/utils/eventBusTypes.js` - 13 new Phase 32 EventBus constants (battle + arena)

## Decisions Made

- **24 effects total (not 22):** The original file contained 16 effects (not 14 as the plan assumed). Adding 8 new effects yields 24. This is the correct count based on the actual codebase state.
- **Level gating tiers preserved:** Kept 10 and 16 for first two tiers (level 1-5 and 6-10), with all 24 for level 11+. Tier 2 (16) exactly matches the original effect set, which is semantically clean.
- **Compound wordId prefix separation:** `status_` for regular effects, `compound_` for compound effects prevents namespace collisions in FSRS cards.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected effect count assumption (16 existing, not 14)**
- **Found during:** Task 1 (Expand status effects)
- **Issue:** Plan assumed 14 existing effects but the actual file contained 16 (blindness and fear were miscounted in planning)
- **Fix:** Added all 8 new effects as planned, yielding 24 total instead of 22. Level gating adjusted to 10/16/24 tiers.
- **Files modified:** src/data/statusEffects.js
- **Verification:** `Object.keys(STATUS_EFFECTS).length` returns 24, `getStatusEffectsByLevel()` returns correct tier counts
- **Committed in:** c0d73f5 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — incorrect count assumption)
**Impact on plan:** Minimal. All effects present, level gating works correctly, just 2 more effects than plan anticipated.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Status effects data foundation complete for all Phase 32 plans
- Compound effect detection ready for BattleTurnManager integration (32-02)
- EventBus constants registered for arena, combo chain, flee, and target selection systems
- Middleware auto-syncs vocabulary, ready for immediate use in battle encounters
- All 1,072 existing tests pass, build succeeds (860KB main bundle)

## Self-Check: PASSED

All files verified present. All commit hashes found in git log.

---
*Phase: 32-advanced-combat*
*Completed: 2026-02-13*
