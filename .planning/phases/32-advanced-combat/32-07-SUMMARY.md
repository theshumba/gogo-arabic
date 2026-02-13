---
phase: 32-advanced-combat
plan: 07
subsystem: battle
tags: [arena, wave-survival, phaser, react, eventbus, arabic-numerals, framer-motion]

requires:
  - phase: 32-02
    provides: arenaChallenges.js (getWaveConfig, ARENA_MODES), arenaSlice
  - phase: 32-04
    provides: MultiTargetManager, multi-enemy battleSlice
  - phase: 32-05
    provides: ComboMeter with toArabicNumerals pattern
  - phase: 32-06
    provides: BattleItemMenu, TargetSelector, GrammarComboInput
provides:
  - ArenaController (Phaser class for wave progression, scoring, enemy generation)
  - ArenaHUD (React overlay for wave counter, score, streak, timer, results)
affects: [32-08, 32-10, 32-11]

tech-stack:
  added: []
  patterns:
    - "EventBus-driven arena state (no Redux useSelector since arenaSlice not yet in store)"
    - "String-to-numeric difficulty mapping for enemy filtering"
    - "Score formula: base + accuracy + speed + streak + bonus"

key-files:
  created:
    - src/game/systems/battle/ArenaController.js
    - src/components/Battle/ArenaHUD.jsx
    - src/components/Battle/ArenaHUD.module.css
  modified: []

key-decisions:
  - "ArenaHUD reads state from EventBus events, not Redux (arenaSlice not registered in store until 32-11)"
  - "Enemy difficulty mapped from string (easy/medium/hard/expert) to numeric (1-4) for wave tier filtering"
  - "toArabicNumerals recreated locally in ArenaHUD (not exported from ComboMeter — keeping modules independent)"
  - "Timer countdown uses setInterval with 1s ticks (not requestAnimationFrame) — adequate for seconds-level display"

patterns-established:
  - "Arena EventBus protocol: WAVE_START (with maxWaves) -> WAVE_COMPLETE (with totalScore) -> ARENA_COMPLETE (with victory/accuracy)"
  - "Wave scoring: accuracy-over-speed incentivization (both capped at 50 points, but accuracy is percentage-based)"

duration: 3min
completed: 2026-02-13
---

# Phase 32 Plan 07: ArenaController + ArenaHUD Summary

**Wave-based arena controller with difficulty-scaled enemy generation and Arabic-numeral HUD overlay**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-13T15:50:06Z
- **Completed:** 2026-02-13T15:53:33Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments
- ArenaController manages 10-wave survival arena with difficulty scaling by wave tier
- Score formula rewards accuracy over speed: base(100) + accuracy(0-50) + speed(0-50) + streak(20/wave) + bonus(100)
- Enemy generation filters by difficulty tier with boss inclusion on final wave
- ArenaHUD displays wave counter, score, streak, timer bar, bonus objectives, and result screen all in Arabic numerals
- Memory cleanup between waves prevents sprite/effect leaks

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ArenaController** - `51602eb` (feat)
2. **Task 2: Create ArenaHUD component** - `cc68c09` (feat)

## Files Created/Modified
- `src/game/systems/battle/ArenaController.js` - Phaser class: wave progression, enemy generation, scoring, cleanup
- `src/components/Battle/ArenaHUD.jsx` - React overlay: wave counter, score, streak, timer, results with Arabic numerals
- `src/components/Battle/ArenaHUD.module.css` - CSS Module: positioned panels, timer bar, result overlay, RTL, reduced-motion

## Decisions Made
- **EventBus-driven ArenaHUD**: Since arenaSlice is not registered in store.js until 32-11, ArenaHUD reads all state from EventBus events (ARENA_WAVE_START, ARENA_WAVE_COMPLETE, ARENA_COMPLETE) rather than useSelector. This is temporary but correct.
- **String-to-numeric difficulty mapping**: enemies.js uses string difficulty ('easy', 'medium', 'hard', 'expert') while wave tiers need numeric comparisons. Created DIFFICULTY_TIERS map (easy=1, medium=2, hard=3, expert=4).
- **Independent toArabicNumerals**: Recreated the Arabic numeral helper locally in ArenaHUD rather than extracting a shared utility. ComboMeter has the same function. Both are small (5 lines) and extracting a shared module would be over-engineering at this point.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Enemy difficulty type mismatch**
- **Found during:** Task 1 (ArenaController._generateWaveEnemies)
- **Issue:** Plan specified filtering enemies by numeric difficulty 1-5, but enemies.js uses string difficulty ('easy', 'medium', 'hard', 'expert')
- **Fix:** Created DIFFICULTY_TIERS mapping object and numericDifficulty() helper to convert strings to numbers
- **Files modified:** src/game/systems/battle/ArenaController.js
- **Verification:** Build succeeds, enemy filtering works correctly with string difficulties
- **Committed in:** 51602eb (Task 1 commit)

**2. [Rule 3 - Blocking] ArenaHUD cannot use Redux selectors for arenaSlice**
- **Found during:** Task 2 (ArenaHUD design)
- **Issue:** Plan says ArenaHUD reads activeArena from arenaSlice via useSelector, but arenaSlice is not registered in store.js until plan 32-11
- **Fix:** ArenaHUD reads all state from EventBus events instead of Redux. The ARENA_WAVE_START event was enhanced to include maxWaves for the wave counter display.
- **Files modified:** src/components/Battle/ArenaHUD.jsx, src/game/systems/battle/ArenaController.js
- **Verification:** Build succeeds, component renders correctly based on EventBus events
- **Committed in:** cc68c09 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes necessary for correctness. No scope creep. ArenaHUD will transition to Redux selectors when 32-11 registers arenaSlice in store.

## Issues Encountered
- Pre-existing uncommitted changes in eventBusTypes.js (boss rush + puzzle battle events from a prior session). Left untouched — not part of this plan's scope.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ArenaController ready for BossRushController and PuzzleBattleManager (32-08) to extend arena patterns
- ArenaHUD ready for wiring into BattleOverlay (32-11)
- All 1,121 tests passing, build succeeds

## Self-Check: PASSED

- [x] ArenaController.js exists
- [x] ArenaHUD.jsx exists
- [x] ArenaHUD.module.css exists
- [x] Commit 51602eb verified
- [x] Commit cc68c09 verified
- [x] Tests: 1,121 passing
- [x] Build: succeeds

---
*Phase: 32-advanced-combat*
*Completed: 2026-02-13*
