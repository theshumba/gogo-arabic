---
phase: 32-advanced-combat
plan: 09
subsystem: battle-ui
tags: [post-battle-review, arena-leaderboard, arabic-analytics, arabic-numerals, rtl, css-modules]

requires:
  - phase: 32-02
    provides: "arenaSlice with leaderboard data and selectArenaLeaderboard selector"
  - phase: 32-04
    provides: "battleSlice with arabicUsedThisBattle and recordArabicUsed reducer"
  - phase: 32-05
    provides: "StatusEffectBar + ComboMeter with toArabicNumerals() pattern"
  - phase: 32-07
    provides: "ArenaController + ArenaHUD for arena mode framework"
provides:
  - "PostBattleReview component showing per-word accuracy, grammar combos, status effects, and practice CTA"
  - "ArenaLeaderboard component with 3-mode tab navigation and ranked score display"
affects: [32-10, 32-11]

tech-stack:
  added: []
  patterns:
    - "Props-based leaderboard data (arenaSlice not in store until 32-11)"
    - "EventBus REVIEW_SESSION_OPEN emission for vocabulary practice integration"
    - "Vocabulary aggregation by word with weakness-first sorting"

key-files:
  created:
    - "src/components/Battle/PostBattleReview.jsx"
    - "src/components/Battle/PostBattleReview.module.css"
    - "src/components/Battle/ArenaLeaderboard.jsx"
    - "src/components/Battle/ArenaLeaderboard.module.css"
  modified: []

key-decisions:
  - "PostBattleReview sorts vocabulary table by accuracy ascending (weakest first) for learning prioritization"
  - "ArenaLeaderboard accepts data via props (not Redux) since arenaSlice not in store until 32-11"
  - "toArabicNumerals() recreated locally in both components (independent from ComboMeter) for module isolation"
  - "Practice Weak Words button emits EVENTS.REVIEW_SESSION_OPEN with weak word IDs array"
  - "Top 3 arena ranks get gold/silver/bronze styling with star decoration for 1st place"

patterns-established:
  - "Vocabulary aggregation: group arabicUsedThisBattle by word, compute avgAccuracy, sort by weakness"
  - "Color-coded accuracy badges: green >= 80%, yellow 50-79%, red < 80%"
  - "Props-based leaderboard pattern: ready for Redux switch when arenaSlice added to store"

duration: 5min
completed: 2026-02-13
---

# Phase 32 Plan 09: PostBattleReview + ArenaLeaderboard Summary

**Post-battle Arabic review with per-word accuracy analytics and 3-mode arena leaderboard with Arabic-Indic numeral ranked display**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-13T15:57:46Z
- **Completed:** 2026-02-13T16:02:26Z
- **Tasks:** 2/2
- **Files modified:** 4

## Accomplishments
- PostBattleReview shows all Arabic vocabulary used in battle, aggregated by word with accuracy color-coding (green/yellow/red) and weakness-first sorting
- PostBattleReview displays grammar combo attempts with success/fail indicators, combo type labels in Arabic (إضافة/تصريف/جملة), and multiplier values
- PostBattleReview shows status effects encountered (player and enemy) with Arabic names from statusEffects.js data
- PostBattleReview "Practice Weak Words" CTA emits EVENTS.REVIEW_SESSION_OPEN with weak word IDs for FSRS review integration
- ArenaLeaderboard displays top 10 scores per mode with Arabic-Indic numerals, gold/silver/bronze rank styling
- ArenaLeaderboard tab navigation in Arabic: ساحة البقاء / تحدي الرؤساء / معارك الألغاز
- ArenaLeaderboard shows player rank banner when outside top 10, empty state "لا نتائج بعد" when no scores exist

## Task Commits

Each task was committed atomically:

1. **Task 1: PostBattleReview component** - `461cc81` (feat)
2. **Task 2: ArenaLeaderboard component** - `d82489c` (feat)

## Files Created/Modified
- `src/components/Battle/PostBattleReview.jsx` - Full-screen overlay with 5 sections: overall stats grid, vocabulary table, grammar combos, status effects, practice CTA
- `src/components/Battle/PostBattleReview.module.css` - RTL layout, gold theme, responsive 2x2/3-col stats grid, color-coded accuracy badges, scrollable table
- `src/components/Battle/ArenaLeaderboard.jsx` - 3-mode tab navigation, top 10 score table, player highlight, rank banner, props-based data
- `src/components/Battle/ArenaLeaderboard.module.css` - RTL layout, gold/silver/bronze rank colors, star decoration for 1st place, empty state styling

## Decisions Made
- PostBattleReview sorts vocabulary table by accuracy ascending (weakest words first) to prioritize learning reinforcement
- ArenaLeaderboard accepts leaderboard data via props instead of Redux selectors since arenaSlice is not yet integrated into store.js (deferred to 32-11)
- toArabicNumerals() recreated locally in both components rather than importing from ComboMeter — maintains module isolation and avoids coupling
- Practice Weak Words button fires EventBus event with weak word IDs for FSRS vocabulary review integration
- Top 3 arena ranks get special styling: gold (#ffd700) with star for 1st, silver (#c0c0c0) for 2nd, bronze (#cd7f32) for 3rd
- Accuracy in ArenaLeaderboard stored as decimal (0.0-1.0) from arenaSlice, displayed as percentage with Arabic numerals

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Ready for 32-10 (next plan in Phase 32)
- PostBattleReview ready for integration into BattleResult flow (show "Review Arabic" button)
- ArenaLeaderboard ready for Redux integration when arenaSlice added to store in 32-11
- Both components use consistent Arabic-Indic numeral pattern for UI consistency

## Self-Check: PASSED

All 4 created files verified on disk. Both task commits (461cc81, d82489c) verified in git log.

---
*Phase: 32-advanced-combat*
*Completed: 2026-02-13*
