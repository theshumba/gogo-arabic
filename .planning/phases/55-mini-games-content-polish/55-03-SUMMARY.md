---
phase: 55-mini-games-content-polish
plan: 03
subsystem: ui
tags: [phaser, redux, vite, calligraphy, frechet, mini-games]

# Dependency graph
requires:
  - phase: 55-02
    provides: CalligraphyScene with Frechet scoring, frechetDistance.js, calligraphyPaths.json

provides:
  - practicedLetters state in alphabetSlice with markLetterPracticed reducer
  - selectPracticedLetters / selectLetterPracticed selectors
  - CalligraphyScene scoring integrated with Redux: 2+ stars dispatches markLetterPracticed
  - Calligraphy Practice entry in MiniGamesHub (id: calligraphy, launchCalligraphy: true)
  - GameLayout dynamically imports CalligraphyScene on CALLIGRAPHY_LAUNCH_REQUESTED or pending launch
  - Vite calligraphy-game manualChunks entry — CalligraphyScene + calligraphyPaths in own chunk
  - CALLIGRAPHY_LAUNCH_REQUESTED event in eventBusTypes.js

affects:
  - 55-04
  - 55-05
  - future phases using alphabet progress tracking

# Tech tracking
tech-stack:
  added: []
  patterns:
    - window.__pendingCalligraphyLaunch for cross-route Phaser scene launch (MiniGamesHub -> GameLayout)
    - Dynamic import in GameLayout useEffect for lazy Phaser scene registration
    - CALLIGRAPHY_LAUNCH_REQUESTED EventBus event for decoupled launch signaling
    - manualChunks routing to calligraphy-game keeps scene out of initial bundle

key-files:
  created: []
  modified:
    - src/store/slices/alphabetSlice.js
    - src/game/scenes/CalligraphyScene.js
    - src/utils/eventBusTypes.js
    - src/components/MiniGames/MiniGamesHub.jsx
    - src/components/Router/GameLayout.jsx
    - vite.config.js

key-decisions:
  - "window.__pendingCalligraphyLaunch used for MiniGamesHub cross-route launch (same pattern as pending events in other hub pages)"
  - "GameLayout handles both EventBus listener and pending launch on mount for robustness"
  - "sceneStackManager.pushScene preferred; phaserGame.scene.start as fallback if sceneStackManager unavailable"
  - "FSRS dispatch guarded by wordId existence (no current calligraphyPaths entries have wordId)"

patterns-established:
  - "Lazy Phaser scene registration pattern: dynamic import + phaserGame.scene.add + sceneStackManager.pushScene"
  - "best-score-wins pattern in markLetterPracticed: only update if new stars > existing stars"

requirements-completed:
  - CALL-04
  - CALL-05

# Metrics
duration: 20min
completed: 2026-03-20
---

# Phase 55 Plan 03: Calligraphy Scoring + Hub Integration Summary

**Frechet 3-star scoring dispatches markLetterPracticed to alphabetSlice; MiniGamesHub entry dynamically launches CalligraphyScene via GameLayout; Vite routes calligraphy files to separate chunk**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-03-20T23:50:00Z
- **Completed:** 2026-03-20T24:10:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- CalligraphyScene scores strokes with 3-star Frechet distance rating and enhanced visual feedback (stars + accuracy + Practiced!/Try again!)
- 2+ star completion dispatches `markLetterPracticed` to alphabetSlice with best-score-wins logic
- FSRS addFsrsCard dispatch guarded by wordId presence (future-proof for when calligraphyPaths adds wordIds)
- Calligraphy entry added to MiniGamesHub with launchCalligraphy flag
- GameLayout dynamically imports CalligraphyScene on CALLIGRAPHY_LAUNCH_REQUESTED event or window.__pendingCalligraphyLaunch
- Vite manualChunks routes CalligraphyScene + calligraphyPaths.json to dedicated `calligraphy-game` chunk (not in main bundle)

## Task Commits

Each task was committed atomically:

1. **Task 1: Scoring integration + alphabetSlice practicedLetters + FSRS dispatch** - `469e432` (feat)
2. **Task 2: MiniGamesHub entry + Vite chunking + GameLayout wiring** - `4acec62` (feat)

## Files Created/Modified
- `src/store/slices/alphabetSlice.js` - Added practicedLetters initialState, markLetterPracticed reducer, selectPracticedLetters/selectLetterPracticed selectors
- `src/game/scenes/CalligraphyScene.js` - Added store imports, markLetterPracticed/addFsrsCard dispatch, enhanced star+debug+result feedback display
- `src/utils/eventBusTypes.js` - Added CALLIGRAPHY_LAUNCH_REQUESTED event constant
- `src/components/MiniGames/MiniGamesHub.jsx` - Added calligraphy game entry + launchCalligraphy click handler
- `src/components/Router/GameLayout.jsx` - Added CalligraphyScene dynamic launch useEffect
- `vite.config.js` - Added calligraphy-game manualChunks entry

## Decisions Made
- `window.__pendingCalligraphyLaunch` used for cross-route pending launch (MiniGamesHub is at /mini-games, GameLayout at /game — different route trees)
- GameLayout handles both EventBus CALLIGRAPHY_LAUNCH_REQUESTED and pending window property on mount for robustness
- `sceneStackManager.pushScene` preferred over direct scene.start; fallback to `scene.start` if sceneStackManager unavailable
- FSRS dispatch conditional on `wordId` field existing in calligraphyPaths entry — guard allows future wordId addition without code changes

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed duplicate `letterData` const declaration in CalligraphyScene._onStrokeComplete**
- **Found during:** Task 2 (build verification)
- **Issue:** `const letterData` was already declared at top of `_onStrokeComplete`; I added a second `const letterData` for the wordId lookup, causing a "already declared" build error
- **Fix:** Removed duplicate declaration — used already-existing `letterData` variable from top of function
- **Files modified:** `src/game/scenes/CalligraphyScene.js`
- **Verification:** `npm run build` succeeds
- **Committed in:** `4acec62` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** Trivial scope — duplicate variable declaration from copy-paste. No scope creep.

## Issues Encountered
- None beyond the duplicate variable fix above.

## Next Phase Readiness
- All CALL-01 through CALL-05 requirements addressed across plans 55-01 to 55-03
- MiniGamesHub now has 4 entries (word-search, reading, roots, calligraphy)
- alphabetSlice.practicedLetters ready for UI consumption (AlphabetModule can show practiced badges)
- calligraphy-game Vite chunk confirmed in dist/assets/ (~452KB including Phaser dynamic bundle)

---
*Phase: 55-mini-games-content-polish*
*Completed: 2026-03-20*
