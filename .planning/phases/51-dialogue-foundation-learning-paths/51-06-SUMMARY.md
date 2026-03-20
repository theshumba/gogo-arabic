---
phase: 51-dialogue-foundation-learning-paths
plan: "06"
subsystem: onboarding
tags: [redux, quests, tutorial, learning-path, ink-dialogue]

# Dependency graph
requires:
  - phase: 51-04
    provides: PATH_MENTORS and PATH_FIRST_QUESTS constants exported from playerSlice.js
  - phase: 51-03
    provides: INK_DIALOGUE_END event pattern and useTutorialTrigger ink-phase wiring
provides:
  - Path-aware mentor NPC routing in useTutorialTrigger (4 locations, runtime lookup)
  - PATH-04 gap closure: each learning path now routes to its correct mentor NPC
  - Path quest activation via checkPrerequisites dispatch in handleInkEnd
  - TypeError-free checkPrerequisites: all path quest prerequisites are now valid arrays
affects: [phase-52, phase-53, quest-system, onboarding-flow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Runtime PATH_MENTORS lookup: store.getState().player.learningPath read inside handler, not at hook mount"
    - "prerequisites as quest-ID arrays, not learningPath object — learningPath field gates display, not unlock"

key-files:
  created: []
  modified:
    - src/hooks/useTutorialTrigger.js
    - src/data/quests.json

key-decisions:
  - "PATH_MENTORS[learningPath] read at runtime inside each event handler — not cached at mount to avoid stale closure on path selection"
  - "prerequisites changed to ['tutorial_welcome'] not [] — prevents all 3 path quests activating at app startup before path is chosen"
  - "handleInkEnd dispatches checkPrerequisites(questsData) instead of a new activateQuest action — avoids questSlice API changes"
  - "SCHOLAR_NPC_ID constant fully removed; only MENTOR_NPC_ID (guide-amira) remains for awaiting_mentor phase"
  - "Phase name 'met_yusuf' preserved unchanged for save-file compatibility despite mentor being path-variable"

patterns-established:
  - "Path mentor routing: PATH_MENTORS[store.getState().player.learningPath] || 'guide-amira' — consistent fallback"
  - "Quest prerequisites: always array of quest IDs, never object — learningPath field on quest def is for display filtering only"

requirements-completed: []

# Metrics
duration: 5min
completed: 2026-03-20
---

# Phase 51 Plan 06: Dialogue Foundation Gap Closure Summary

**PATH-04 gap closed: useTutorialTrigger now routes to path-specific mentor NPCs at runtime and path quest prerequisites fixed from objects to arrays, eliminating TypeError in checkPrerequisites**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-20T01:46:45Z
- **Completed:** 2026-03-20T01:49:10Z
- **Tasks:** 2 of 2
- **Files modified:** 2

## Accomplishments

- Removed hardcoded `SCHOLAR_NPC_ID` constant from `useTutorialTrigger.js`; all 4 NPC-routing locations now call `PATH_MENTORS[learningPath]` at runtime
- `handleInkEnd` now dispatches `checkPrerequisites(questsData)` after ink dialogue ends, activating the path-specific first quest
- All 3 path quest `prerequisites` fields changed from `{ "learningPath": "..." }` objects to `["tutorial_welcome"]` arrays — `checkPrerequisites` no longer throws TypeError

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix useTutorialTrigger to use PATH_MENTORS and activate path quest** - `3393030` (fix)
2. **Task 2: Fix path quest prerequisites format in quests.json** - `b66a85a` (fix)

## Files Created/Modified

- `src/hooks/useTutorialTrigger.js` - Replaced SCHOLAR_NPC_ID with PATH_MENTORS runtime lookups at 4 locations; added checkPrerequisites dispatch in handleInkEnd; fixed handleDialogueEnded to check path-specific mentor
- `src/data/quests.json` - path_scholar_first_quest, path_traveler_first_quest, path_historian_first_quest prerequisites changed from objects to `["tutorial_welcome"]` arrays

## Decisions Made

- Used `["tutorial_welcome"]` instead of `[]` for prerequisites — empty array causes all 3 path quests to activate at app startup (before path chosen); `tutorial_welcome` gates them to post-onboarding flow
- Dispatched `checkPrerequisites(questsData)` in `handleInkEnd` — reuses existing questSlice API without needing a new `activateQuest` action
- Left `'met_yusuf'` phase name unchanged — changing would break existing save files; comment documents the misleading name
- MENTOR_NPC_ID (guide-amira) preserved for `awaiting_mentor` phase — only SCHOLAR_NPC_ID removed since Amira is always the initial onboarding mentor regardless of path

## Deviations from Plan

None - plan executed exactly as written. The plan's "FINAL DECISION" analysis in Task 2 pre-resolved the prerequisites design, and the implementation matched the specified approach.

## Issues Encountered

None. Both files modified cleanly; build passed first attempt after each task.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- PATH-04 gap fully closed: Traveler path routes to guide-amira, Historian to elder-tariq, Scholar to scholar-yusuf
- checkPrerequisites runs without TypeError on all quests.json entries
- Path-specific first quest activates after ink dialogue completion via handleInkEnd
- Phase 52 (vocab expansion) can proceed without PATH-04 concerns

---
*Phase: 51-dialogue-foundation-learning-paths*
*Completed: 2026-03-20*

## Self-Check: PASSED

- src/hooks/useTutorialTrigger.js: FOUND
- src/data/quests.json: FOUND
- 51-06-SUMMARY.md: FOUND
- Commit 3393030 (Task 1): FOUND
- Commit b66a85a (Task 2): FOUND
