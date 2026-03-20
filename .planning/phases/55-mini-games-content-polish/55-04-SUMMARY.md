---
phase: 55-mini-games-content-polish
plan: 04
subsystem: vocabulary-learning
tags: [redux, rtk, poetry, fsrs, indexeddb, redux-persist, vocabulary, arabic-literature]

# Dependency graph
requires:
  - phase: 53-factions
    provides: factionSlice IndexedDB persist pattern with nested persistReducer + CURRENT_VERSION
  - phase: 54-world-life-systems
    provides: gossipSlice (session-ephemeral pattern), worldStateMiddleware ordering
  - phase: 52-vocabulary-expansion
    provides: vocabularyAll.js 5000-word corpus with cefrLevel tags, selectFsrsCards selector
provides:
  - poetrySlice with startPoetryBattle/submitPlayerAnswer/advanceBlank/setNpcAnswers/endPoetryBattle/unlockPoem/setChoices
  - 10 curated classical Arabic poems (public domain) with fill-in-blank positions
  - poetryBattle.js service: getPoetryChoices (FSRS-sourced), generateNpcAnswers, calculatePoetryScore
  - POETRY_BATTLE_START/END/ANSWER_SUBMITTED events in eventBusTypes.js
  - IndexedDB persist config for poetry (completedBattles/unlockedPoems persisted, activeBattle session-only)
  - migrations.js CURRENT_VERSION bumped to 10
affects: [55-05-poetry-overlay, future-npc-poets, poetry-battle-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Nested persistReducer with IndexedDB blacklisting session-only fields (activeBattle)
    - Service module imports store directly for Redux state access (same as fsrs.js)
    - FSRS-sourced word choices with 3-tier fallback (known/same-CEFR → corpus/same-CEFR → corpus/any-CEFR)
    - Configurable NPC accuracy (0.0-1.0) for deterministic, testable AI simulation

key-files:
  created:
    - src/store/slices/poetrySlice.js
    - src/data/poems.js
    - src/services/poetryBattle.js
  modified:
    - src/store/store.js
    - src/services/storage/migrations.js
    - src/utils/eventBusTypes.js
    - vite.config.js

key-decisions:
  - "activeBattle blacklisted from IndexedDB persist — session-only like gossipSlice npcTokens"
  - "NPC poet accuracy is configurable float (0.0-1.0) not FSRS-based — deterministic, testable"
  - "getPoetryChoices 3-tier fallback: known-words → corpus same-CEFR → corpus any-CEFR (Pitfall 3 guard)"
  - "poems.js uses classical/symbolic wordIds not vocabulary corpus IDs — blank words are classical Arabic not in modern corpus"
  - "getBlanksForBattle helper added to service (not in plan) — avoids duplicating blank-flatten logic in 55-05"

patterns-established:
  - "Poetry battle is separate from BattleStateMachine — pure Redux + React overlay, no Phaser, no HP/MP/damage"
  - "3-tier distractor fallback ensures 4 choices always generated regardless of FSRS card count"
  - "NPC AI = Math.random() < npcAccuracy per blank — deterministic mock, configurable per poet difficulty"

requirements-completed:
  - POET-01
  - POET-02
  - POET-03

# Metrics
duration: 6min
completed: 2026-03-20
---

# Phase 55 Plan 04: Poetry Battle Data + State Layer Summary

**poetrySlice with IndexedDB persistence, 10 classical Arabic poems (Al-Mutanabbi through Labid ibn Rabiah), and FSRS-sourced fill-in-blank choice generation service**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-20T23:44:06Z
- **Completed:** 2026-03-20T23:50:06Z
- **Tasks:** 2
- **Files modified:** 7 (4 modified + 3 created)

## Accomplishments

- poetrySlice registered in Redux store with nested IndexedDB persistReducer — completedBattles and unlockedPoems persisted, activeBattle session-only (blacklisted)
- 10 curated classical Arabic poems from Al-Mutanabbi, Abu Tammam, Imru' al-Qais, Al-Ma'arri, Ibn Zaydun, Al-Khansa, Abu Nuwas, Hassan ibn Thabit, Al-Buhturi, Labid ibn Rabi'ah — each with 3-5 fill-in-blank positions spanning A2-B2 CEFR
- poetryBattle.js service with 3-tier FSRS-sourced distractor fallback and configurable NPC accuracy simulation
- CURRENT_VERSION bumped to 10 with v9→v10 localStorage cleanup migration

## Task Commits

Each task was committed atomically:

1. **Task 1: poetrySlice + store registration + IndexedDB persistence** - `3b7acd0` (feat)
2. **Task 2: 10 curated poems + poetry battle service** - `217a34e` (feat)

**Plan metadata:** committed with SUMMARY.md as final docs commit

## Files Created/Modified

- `src/store/slices/poetrySlice.js` — Redux slice with battle state management, 7 reducers, 5 selectors including memoized selectPoetryWins
- `src/data/poems.js` — 10 classical Arabic poems (POEMS array + getPoemById + getPoemBlanks helpers)
- `src/services/poetryBattle.js` — getPoetryChoices (FSRS-sourced, 3-tier fallback), generateNpcAnswers, calculatePoetryScore, getBlanksForBattle
- `src/store/store.js` — poetryPersistConfig + persistedPoetryReducer + poetry entry in rootReducer + updated architecture comment
- `src/services/storage/migrations.js` — CURRENT_VERSION 9→10, v10 migration with localStorage poetry key cleanup
- `src/utils/eventBusTypes.js` — POETRY_BATTLE_START, POETRY_BATTLE_END, POETRY_ANSWER_SUBMITTED events
- `vite.config.js` — poetry-game manualChunks entry for src/data/poems and src/components/Poetry/

## Decisions Made

- **activeBattle session-only**: Follows gossipSlice pattern — an in-progress battle session should reset on reload, preventing stale state. completedBattles and unlockedPoems are worth persisting.
- **Classical wordIds**: Blank words in poems.js use symbolic IDs like `azm_classical`, not vocabulary corpus IDs, because classical Arabic vocabulary (azm, kiram, etc.) is not in the modern 5000-word corpus. The service's fallback mechanism handles these correctly.
- **getBlanksForBattle added**: Not in plan spec but needed by 55-05 to avoid duplicating the blank-flatten logic. Applied Rule 2 (missing critical functionality for correct operation of the next plan).
- **NPC accuracy configurable not FSRS-based**: Keeps poetry AI deterministic and testable. Poet difficulty mapped to float constants: 0.5 beginner, 0.7 intermediate, 0.85 advanced, 0.95 master.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added getBlanksForBattle helper to poetryBattle.js**
- **Found during:** Task 2 (creating poetryBattle.js)
- **Issue:** 55-05 (PoetryBattleOverlay) needs a flat blank list from poem data for battle initialization. Without this helper, 55-05 would need to duplicate the blank-flatten logic.
- **Fix:** Added `getBlanksForBattle(poemId)` function that flattens poem.lines[].blanks into ordered array with blankIndex assigned
- **Files modified:** src/services/poetryBattle.js
- **Verification:** Function logic verified against poems.js structure; build passes
- **Committed in:** 217a34e (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical functionality)
**Impact on plan:** Essential utility for 55-05 overlay. No scope creep — getBlanksForBattle is a pure data helper, no state or side effects.

## Issues Encountered

- eventBusTypes.js was modified by a parallel agent (55-02 added calligraphy events). Re-read file before edit; appended poetry events after CALENDAR_EVENT_ACTIVE — no conflict.
- migrations.js edit: replacement string was accidentally placed after the closing `};` of migrations object. Caught immediately via file re-read and fixed in same task pass.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- poetrySlice, poems.js, and poetryBattle.js are ready for 55-05 PoetryBattleOverlay consumption
- POETRY_BATTLE_START event can be emitted from NPC ActionSet to trigger the overlay
- getBlanksForBattle used in overlay to initialize battle session with startPoetryBattle dispatch
- No blockers for 55-05

## Self-Check: PASSED

All created files verified present:
- FOUND: src/store/slices/poetrySlice.js
- FOUND: src/data/poems.js
- FOUND: src/services/poetryBattle.js

All commits verified in git log:
- FOUND: 3b7acd0 (Task 1)
- FOUND: 217a34e (Task 2)

---
*Phase: 55-mini-games-content-polish*
*Completed: 2026-03-20*
