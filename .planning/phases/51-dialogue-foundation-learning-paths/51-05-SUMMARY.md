---
phase: 51-dialogue-foundation-learning-paths
plan: "05"
subsystem: vocabulary

tags: [fsrs, redux, learning-path, path-affinity, selectNewCardsByPath, gap-closure]

requires:
  - phase: 51-04
    provides: selectNewCardsByPath selector in vocabularySlice + domainAffinity tags on 5000+ words

provides:
  - selectNewCardsByPath imported and called in rootFsrsSyncMiddleware.js (Sync Direction 2)
  - getNewCardsForSession exported from fsrs.js (calls selectNewCardsByPath via store)
  - ReviewSession fills remaining session slots with path-ordered new words
  - PATH-03 gap closure: Scholar vs Traveler see different first-encounter word sequences

affects:
  - ReviewSession (path-ordered new card introduction)
  - rootFsrsSyncMiddleware (root level-up word suggestions)
  - fsrs service (getNewCardsForSession utility)

tech-stack:
  added: []
  patterns:
    - "Service modules (fsrs.js) may import store directly for selector access without prop-drilling"
    - "Redux createSelector used from service layer via store.getState() snapshot"
    - "isNew flag on session entries distinguishes due-card reviews from new-word introductions"

key-files:
  created: []
  modified:
    - src/store/middleware/rootFsrsSyncMiddleware.js
    - src/services/fsrs.js
    - src/components/Review/ReviewSession.jsx

key-decisions:
  - "fsrs.js imports store directly (not via prop) — acceptable for service module, not a React component"
  - "Fallback to unordered filter in rootFsrsSyncMiddleware when no root words appear in path-ordered list (edge case: root with no path-matched words)"
  - "New word entries carry isNew: true + card: null; addFsrsCard dispatched on first answer to create FSRS card"
  - "Deduplication of new word slots vs due cards via Set to avoid showing same word twice"

patterns-established:
  - "selectNewCardsByPath is the canonical entry point for all new-word introduction — no code should pick arbitrary/unordered words"
  - "reviewCard() requires a card object — always create via createNewCard() before calling reviewCard for isNew entries"

requirements-completed: []

duration: 15min
completed: 2026-03-20
---

# Phase 51 Plan 05: PATH-03 Gap Closure — selectNewCardsByPath Wired Summary

**selectNewCardsByPath connected to FSRS pipeline in 2 files: root level-up suggests path-affinity words; ReviewSession fills empty slots with path-ordered new words so Scholar and Traveler see different first encounters**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-20T01:34:00Z
- **Completed:** 2026-03-20T01:49:24Z
- **Tasks:** 2 of 2
- **Files modified:** 3

## Accomplishments

- Closed PATH-03 gap: `selectNewCardsByPath` was defined in vocabularySlice but never called anywhere; now imported and used in 2 production files
- Root level-up (Sync Direction 2 in rootFsrsSyncMiddleware) now picks derived words in path-affinity order, with a safe fallback for edge cases
- ReviewSession now mixes due cards with up to (20 - dueCount) path-ordered new words, so players with few due cards still encounter words relevant to their path
- `getNewCardsForSession` exported from fsrs.js provides a clean, reusable entry point for any future code that needs path-ordered new cards
- New word first-encounter creates FSRS card via `addFsrsCard` + reviews it immediately via `updateFsrsCard`, keeping vocabulary state coherent

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire selectNewCardsByPath into rootFsrsSyncMiddleware + fsrs.js** - `6b8b0f9` (feat)
2. **Task 2: Wire getNewCardsForSession into ReviewSession** - `af1bbbc` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/store/middleware/rootFsrsSyncMiddleware.js` - Imports selectNewCardsByPath + vocabulary; Sync Direction 2 now sorts root-derived words by path affinity before slicing to 3; fallback to unordered filter if no path-matched words
- `src/services/fsrs.js` - Imports selectNewCardsByPath, store, vocabulary; exports `getNewCardsForSession(maxCards)` function
- `src/components/Review/ReviewSession.jsx` - Imports getNewCardsForSession + createNewCard + addFsrsCard; sessionCards initialization fills remaining slots with path-ordered new words; autoRateAndAdvance creates FSRS card on first new-word encounter

## Decisions Made

- **fsrs.js imports store directly**: Service module (not React component) — acceptable pattern for accessing Redux state without prop-drilling through component tree.
- **Fallback in rootFsrsSyncMiddleware**: If a root has no words matching the path-ordered list (unusual edge case), falls back to the original unordered filter. Prevents silent failures.
- **isNew flag + null card**: New word entries use `card: null` + `isNew: true`. Before calling `reviewCard()`, a fresh card is created via `createNewCard()` and dispatched via `addFsrsCard`. This ensures FSRS state stays consistent.
- **Deduplication on new slots**: New word IDs filtered against the Set of due word IDs to avoid presenting the same word twice in one session.

## Deviations from Plan

None — plan executed exactly as written. The plan's pseudocode was directly applicable; no structural changes needed beyond what was specified.

## Issues Encountered

None. Build passed on first attempt after each task.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- PATH-03 is fully closed: `selectNewCardsByPath` is no longer orphaned
- `domainAffinity` field on 5,000+ words now has real effect on word presentation order
- Phase 51 gap closure complete (51-01 through 51-05 all done)
- Next: Phase 52 (vocabulary expansion) or Phase 47 human-verify checkpoint

---
*Phase: 51-dialogue-foundation-learning-paths*
*Completed: 2026-03-20*

## Self-Check: PASSED

- FOUND: src/store/middleware/rootFsrsSyncMiddleware.js
- FOUND: src/services/fsrs.js
- FOUND: src/components/Review/ReviewSession.jsx
- FOUND: .planning/phases/51-dialogue-foundation-learning-paths/51-05-SUMMARY.md
- FOUND: commit 6b8b0f9 (Task 1)
- FOUND: commit af1bbbc (Task 2)
