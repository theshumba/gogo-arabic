---
phase: 54-world-life-systems
plan: 04
subsystem: ui
tags: [arabic, tashkeel, diacritics, learning-path, fsrs, react, redux]

# Dependency graph
requires:
  - phase: 52-vocabulary-expansion
    provides: "TashkeelText component with wordMeta?.ambiguous guard (CONT-07)"
  - phase: 51-learning-path-integration
    provides: "learningPath field in playerSlice (null | scholar | traveler | historian)"

provides:
  - "Path-aware getTashkeelOpacity: Scholar retains tashkeel 2x longer than Traveler"
  - "FADE_DIVISOR module-level constant for path-to-rate mapping"
  - "learningPath in useCallback deps prevents stale closure on path change"

affects: [TashkeelText, inscriptions, any component using getTashkeelOpacity]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Module-level constant (FADE_DIVISOR) for path-rate mapping — avoids re-creating object per render"
    - "useCallback deps expanded to include learningPath alongside fsrsCards"

key-files:
  created: []
  modified:
    - src/hooks/useFormatArabic.js

key-decisions:
  - "FADE_DIVISOR at module level (not inside hook) to avoid object allocation on every render"
  - "learningPath added to useCallback deps — prevents stale closure when path changes without fsrsCards changing (Pitfall 7)"
  - "t_mastered uses 13 (not 12) for cleaner boundary semantics — reps >= t_mastered is exclusive upper bound"
  - "TashkeelText.jsx needs no changes — formatArabic changes reference when learningPath changes, memo recomputes correctly"

patterns-established:
  - "Path-aware threshold pattern: const divisor = LOOKUP[path] ?? 1.0; const t = Math.round(baseline * divisor)"

requirements-completed: [TASH-01, TASH-02, TASH-03]

# Metrics
duration: 8min
completed: 2026-03-20
---

# Phase 54 Plan 04: Progressive Tashkeel Summary

**Path-aware tashkeel fading via FADE_DIVISOR lookup — Scholar retains diacritics 2x longer than Traveler, Historian 1.33x, with learningPath added to useCallback deps**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-20T22:40:00Z
- **Completed:** 2026-03-20T22:48:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Added module-level `FADE_DIVISOR = { scholar: 2.0, historian: 1.33, traveler: 1.0 }` constant to `useFormatArabic.js`
- Added `learningPath` selector reading from `state.player.learningPath`
- Rewrote `getTashkeelOpacity` with path-adjusted thresholds (t_learning, t_familiar, t_mastered, t_stability)
- Added `learningPath` to `useCallback` deps array — prevents stale closure when path changes
- TASH-01 ambiguous word guard preserved as highest-priority check before any path calculation
- TashkeelText.jsx and inscriptions (via TashkeelText) benefit automatically — zero additional code changes

## Task Commits

Each task was committed atomically:

1. **Task 1: Add path-aware tashkeel fading rate to useFormatArabic** - `bd0568c` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/hooks/useFormatArabic.js` - Added FADE_DIVISOR constant, learningPath selector, path-aware threshold calculation in getTashkeelOpacity, learningPath added to useCallback deps

## Decisions Made
- `FADE_DIVISOR` placed at module level (not inside the hook) to avoid creating a new object on every render — module-level constants are allocated once
- `t_mastered` threshold uses 13 (matching plan spec) rather than 12 (the old hardcoded value) — boundary semantics are cleaner with `reps < t_mastered` exclusive upper bound
- No changes to TashkeelText.jsx — the existing `useMemo([showDiacritics, wordId, formatArabic, wordMeta])` already includes `formatArabic`, which creates a new reference when `learningPath` changes (via `getTashkeelOpacity` being recreated), so the memo recomputes correctly

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None — single-file change, build passed first try.

## Next Phase Readiness
- Phase 54 plan 04 complete
- Phase 54 fully complete (plans 01-04 all done)
- All 4 world-life systems shipped: dynamic pricing (01), gossip system (02), environmental inscriptions (03), path-aware tashkeel (04)
- No blockers for Phase 55

---
*Phase: 54-world-life-systems*
*Completed: 2026-03-20*
