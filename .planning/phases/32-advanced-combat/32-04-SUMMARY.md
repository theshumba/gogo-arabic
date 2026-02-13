---
phase: 32-advanced-combat
plan: 04
subsystem: battle, redux
tags: [multi-target, combo-meter, row-positioning, enemy-party, targeting]

# Dependency graph
requires:
  - phase: 27-battle-system
    provides: "battleSlice with single-enemy battle state, BattleSpriteManager enemy sprites"
  - phase: 32-01
    provides: "24 status effects, compound effects, statusEffectVocabMiddleware"
provides:
  - "battleSlice enemies[] array with per-enemy HP, effects, row, defeated tracking"
  - "Multi-target reducers: initMultiTargetBattle, dealDamageToEnemy, applyEnemyEffectMulti, tickEnemyEffectsMulti"
  - "Combo meter state and reducers: updateComboMeter, resetComboMeter"
  - "Grammar combo state management: setGrammarComboState, clearGrammarComboState"
  - "Arabic usage tracking per battle: recordArabicUsed, selectArabicUsedThisBattle"
  - "MultiTargetManager class for Phaser scene enemy positioning and targeting"
  - "Row damage modifiers: Front->Front 1.0, Back->Front 1.0, Front->Back 0.8, Back->Back 0.7"
affects: [32-05, 32-06, 32-07, 32-08, 32-09, 32-10, 32-11]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "enemies[] array mirrors Redux state with sprite references in Phaser manager"
    - "bossHP backward compat: sum of all living enemy HP synced on every damage action"
    - "MultiTargetManager receives data push, no Redux read — keeps Phaser testable"
    - "Row-based depth perception: back row sprites scaled 1.6x vs front row 2x"

key-files:
  created:
    - "src/game/systems/battle/MultiTargetManager.js"
  modified:
    - "src/store/slices/battleSlice.js"
    - "src/store/__tests__/battleSlice.test.js"

key-decisions:
  - "bossHP kept as sum of all enemies[] HP for full backward compatibility with single-enemy code"
  - "enemies[] first 2 entries default to front row, remaining to back row (matches typical RPG party layout)"
  - "MultiTargetManager does not read Redux — data-push pattern keeps it testable without store mocking"
  - "Back row sprites use 1.6x scale (vs 2x front) for visual depth perception"

patterns-established:
  - "dealDamageToEnemy syncs bossHP after each hit — all existing single-enemy code reads bossHP unchanged"
  - "arabicUsedThisBattle included in battleHistory entries for post-battle review screens"
  - "MultiTargetManager.setEnemySprite() bridges BattleSpriteManager sprites to targeting logic"

# Metrics
duration: 3min
completed: 2026-02-13
---

# Phase 32 Plan 04: Multi-Target & Combo Meter Summary

**battleSlice extended with enemies[] array, combo meter, row positioning, and MultiTargetManager for up to 4-enemy encounters with row damage modifiers**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-13T15:34:35Z
- **Completed:** 2026-02-13T15:37:41Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Extended battleSlice with 7 new state fields (enemies[], comboMeter, maxComboMeter, grammarComboState, targetIndex, playerRow, arabicUsedThisBattle)
- Added 11 new reducers for multi-target battles, combo meter, grammar combo state, and Arabic usage tracking
- Added 7 new selectors including memoized selectActiveEnemies and selectAllEnemiesDefeated
- Created MultiTargetManager class with row-based positioning, damage modifiers, and target selection for up to 4 enemies
- Maintained full backward compatibility: bossHP auto-synced as sum of enemies[] HP
- Updated existing test initial state assertion for new fields; all 1,072 tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend battleSlice for multi-enemy and combo meter** - `39bc83c` (feat)
2. **Task 2: Create MultiTargetManager** - `6c5a1bf` (feat)

## Files Created/Modified

- `src/store/slices/battleSlice.js` - Extended with enemies[], comboMeter, grammarComboState, 11 new reducers, 7 new selectors
- `src/game/systems/battle/MultiTargetManager.js` - Multi-enemy positioning, targeting, row damage modifiers (224 LOC)
- `src/store/__tests__/battleSlice.test.js` - Updated initial state assertion with Phase 32 fields

## Decisions Made

- **bossHP backward compat via sum:** Rather than creating a separate HP field, bossHP is auto-synced as the sum of all enemies[] HP values on every damage action. This means all existing code that reads bossHP (BattleStateMachine, BattleHUDManager, EnemyAI, etc.) continues working without modification.
- **First 2 enemies default to front row:** Matches typical RPG party layout where melee units are in front. Can be overridden per-enemy via the row property.
- **MultiTargetManager no Redux coupling:** The class receives data via initEnemies() and setEnemySprite() rather than reading the store. This follows the established pattern where Phaser managers are data-driven for testability.
- **Back row smaller scale (1.6x vs 2x):** Visual depth cue that back row enemies are further away, consistent with the existing BattleSpriteManager sprite sizing.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- battleSlice multi-target foundation complete for BattleTurnManager integration (32-05)
- MultiTargetManager ready for BattleSpriteManager bridging via setEnemySprite()
- Combo meter state ready for grammar combo detection integration (32-05, 32-06)
- arabicUsedThisBattle tracking ready for post-battle review screens (32-09)
- All 1,072 existing tests pass, build succeeds

## Self-Check: PASSED

All files verified present. All commit hashes found in git log.

---
*Phase: 32-advanced-combat*
*Completed: 2026-02-13*
