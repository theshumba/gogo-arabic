---
phase: 35-economy-home
plan: "04"
subsystem: store
tags: [redux, middleware, home, persistence, friendship, utility-bonus]

# Dependency graph
requires:
  - phase: 35-02
    provides: friendshipMiddleware (created, pending store registration)
  - phase: 35-03
    provides: homeSlice (created, pending store registration)
provides:
  - utilityBonusMiddleware — applies Knowledge (+XP) and Hospitality (+friendship) bonuses from home utilities
  - homeSlice registered in Redux store with localStorage persistence
  - friendshipMiddleware active in Redux middleware chain
  - utilityBonusMiddleware active in Redux middleware chain
affects: [future-home-ui, future-decoration-scene, future-economy-wiring, npc-dialogue, quest-rewards]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Middleware pull-not-push for Comfort/Barakah — game systems read selectUtility() when needed, no push dispatch"
    - "Infinite loop guard via action.meta.utilityBonus flag — bonus dispatches marked to prevent re-triggering"
    - "Slices middleware co-located in slices/ dir (friendshipMiddleware, utilityBonusMiddleware) vs store middleware in middleware/ dir"

key-files:
  created:
    - src/store/slices/utilityBonusMiddleware.js
  modified:
    - src/store/store.js

key-decisions:
  - "utilityBonusMiddleware infinite loop prevention via action.meta.utilityBonus flag — bonus dispatches set this flag to prevent re-triggering"
  - "Comfort and Barakah are pull-based (not middleware) — game systems call selectUtility(category) when needed, no push needed"
  - "home persisted to localStorage (not IndexedDB) — 8x10 grid + owned furniture is lightweight, fits in localStorage"
  - "Knowledge bonus: +1 XP per 10 Knowledge utility; Hospitality bonus: +1 friendship per 20 Hospitality utility"

patterns-established:
  - "Bonus dispatch guard: check action.meta.utilityBonus before dispatching bonus to prevent middleware infinite loops"
  - "Pull-vs-push decision: push (middleware) for additive bonuses; pull (selector) for passive/contextual bonuses"

# Metrics
duration: 4min
completed: 2026-03-16
---

# Phase 35 Plan 04: Store Wiring Summary

**utilityBonusMiddleware wires home utility scores to Knowledge (+XP) and Hospitality (+friendship) bonuses via Redux middleware, with homeSlice, friendshipMiddleware, and utilityBonusMiddleware all registered in the store.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-16T15:47:11Z
- **Completed:** 2026-03-16T15:51:00Z
- **Tasks:** 2/2
- **Files modified:** 2 (new utilityBonusMiddleware.js, modified store.js)

## Accomplishments

- Created `utilityBonusMiddleware` — Knowledge bonus (+1 XP per 10 Knowledge) on `player/addXp` and `fsrs/recordReview`; Hospitality bonus (+1 friendship per 20 Hospitality) on `npc/adjustFriendship`; infinite loop prevention via `action.meta.utilityBonus` flag
- Registered `homeReducer` in `rootReducer` at `state.home`
- Added `'home'` to localStorage persist whitelist
- Registered `friendshipMiddleware` and `utilityBonusMiddleware` in the middleware chain (after existing middleware)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create utilityBonusMiddleware** - `27c1d04` (feat)
2. **Task 2: Register new slices and middleware in store.js** - `98cc782` (feat)

**Plan metadata:** (final docs commit — see below)

## Files Created/Modified

- `src/store/slices/utilityBonusMiddleware.js` — New Redux middleware: Knowledge bonus (+XP), Hospitality bonus (+friendship), Comfort/Barakah pull-based
- `src/store/store.js` — Added homeReducer import+registration, home in whitelist, friendshipMiddleware+utilityBonusMiddleware imports+registration

## Decisions Made

- **Infinite loop guard**: `action.meta.utilityBonus = true` on bonus dispatches prevents middleware from re-triggering on its own dispatches
- **Pull-not-push for Comfort/Barakah**: These bonuses are contextual (recovery speed, drop rate) — game systems query `selectUtility('Comfort')` or `selectUtility('Barakah')` when needed, no middleware dispatch needed
- **home in localStorage (not IndexedDB)**: 8x10 grid (80 cells) + owned furniture list is well within localStorage limits; consistent with existing lightweight slices pattern

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Home utility bonuses are now active: placing Knowledge furniture boosts XP gain, Hospitality furniture amplifies friendship gains
- Friendship system is live: quiz answers, quest completions, and gifts all update per-NPC friendship scores
- `selectUtility('Comfort')` and `selectUtility('Barakah')` ready for battle/loot system consumers in future phases
- Build passes cleanly, no regressions

---
*Phase: 35-economy-home*
*Completed: 2026-03-16*

## Self-Check: PASSED

- FOUND: src/store/slices/utilityBonusMiddleware.js
- FOUND: src/store/store.js (modified)
- FOUND: .planning/phases/35-economy-home/35-04-SUMMARY.md
- FOUND commit: 27c1d04 (Task 1)
- FOUND commit: 98cc782 (Task 2)
