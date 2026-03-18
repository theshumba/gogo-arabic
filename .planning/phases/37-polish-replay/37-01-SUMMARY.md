---
phase: 37-polish-replay
plan: 01
subsystem: gameplay
tags: [vocabulary, randomizer, seeded-prng, difficulty, settings, redux]

requires:
  - phase: 36-world-systems
    provides: "settingsSlice Redux slice, zone system"
provides:
  - "VocabRandomizer class with seeded PRNG and category-grouped zone assignment"
  - "Difficulty settings (difficulty, vowelMarks, hintFrequency, battleSpeed, vocabRandomizerSeed, showRomanization)"
  - "Selectors for all difficulty settings"
affects: [gameplay-tuning, ui-settings-panel, battle-system, vocabulary-display]

tech-stack:
  added: []
  patterns: ["seeded PRNG (mulberry32) for reproducible shuffles", "Fisher-Yates shuffle with seeded random"]

key-files:
  created:
    - src/game/systems/VocabRandomizer.js
  modified:
    - src/store/slices/settingsSlice.js

key-decisions:
  - "Mulberry32 PRNG for deterministic, seedable shuffles"
  - "Categories stay grouped — shuffled as units, not scattered across zones"
  - "A1/beginner categories always assigned to first zone (oasis_village)"

patterns-established:
  - "Seeded randomization pattern: constructor(seed) + _random() + _shuffle(arr) for any future randomized systems"

requirements-completed: []

duration: 3min
completed: 2026-03-18
---

# Phase 37 Plan 01: Vocabulary Randomizer + Difficulty Settings Summary

**Seeded VocabRandomizer with Fisher-Yates shuffle keeping category groups intact, plus 6 difficulty settings in settingsSlice**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-18T22:54:54Z
- **Completed:** 2026-03-18T22:58:39Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- VocabRandomizer class with seeded PRNG (mulberry32) for reproducible word-to-zone shuffles across playthroughs
- Category grouping constraint ensures thematically related words stay together
- A1/beginner words always assigned to starter zone (oasis_village)
- 6 new difficulty settings added to settingsSlice with reducers and selectors

## Task Commits

Both tasks were committed together in a prior session:

1. **Task 1: Create VocabRandomizer** - `cb395b6` (feat)
2. **Task 2: Add difficulty settings to settingsSlice** - `cb395b6` (feat)

**Build fixes:** `9002d30` (fix: resolve build errors from missing modules/exports)

## Files Created/Modified
- `src/game/systems/VocabRandomizer.js` - Seeded vocabulary zone assignment shuffler (65 lines)
- `src/store/slices/settingsSlice.js` - Added difficulty, vowelMarks, hintFrequency, battleSpeed, vocabRandomizerSeed, showRomanization

## Decisions Made
- Mulberry32 chosen as PRNG — fast, good distribution, deterministic from seed
- Categories shuffled as whole units (round-robin across zones) rather than individual words
- A1-only categories forced to zone[0] before round-robin starts

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Duplicate QuestTracker import in HUD.jsx**
- **Found during:** Build verification
- **Issue:** `import QuestTracker from './QuestTracker.jsx'` duplicated on lines 17-18
- **Fix:** Removed duplicate line
- **Files modified:** src/components/HUD/HUD.jsx
- **Verification:** Build passes
- **Committed in:** 9002d30

**2. [Rule 3 - Blocking] Missing FastTravelManager.js**
- **Found during:** Build verification
- **Issue:** WorldScene.js imports FastTravelManager but file did not exist
- **Fix:** Created stub implementation with FAST_TRAVEL event listener and zone transition
- **Files modified:** src/game/systems/FastTravelManager.js (new)
- **Verification:** Build passes
- **Committed in:** 9002d30

**3. [Rule 3 - Blocking] Missing MountSystem.js**
- **Found during:** Build verification
- **Issue:** WorldScene.js imports MountSystem but file did not exist
- **Fix:** Created stub with mount/dismount/speed multiplier methods
- **Files modified:** src/game/systems/MountSystem.js (new)
- **Verification:** Build passes
- **Committed in:** 9002d30

**4. [Rule 3 - Blocking] Missing ZONE_AMBIENT_LAYERS and INTERIOR_AMBIENT exports**
- **Found during:** Build verification
- **Issue:** useZoneEvents.js imports these from audioConfig.js but they were not exported
- **Fix:** Added both exports with zone-specific ambient sound layer configurations
- **Files modified:** src/data/audioConfig.js
- **Verification:** Build passes
- **Committed in:** 9002d30

**5. [Rule 3 - Blocking] Missing WelcomeSplash export**
- **Found during:** Build verification
- **Issue:** GameLayout.jsx imports { WelcomeSplash } from TutorialHints.jsx but it was not defined
- **Fix:** Added WelcomeSplash component with game title, subtitle, and "Begin" button
- **Files modified:** src/components/Onboarding/TutorialHints.jsx
- **Verification:** Build passes
- **Committed in:** 9002d30

**6. [Rule 3 - Blocking] Missing react-icons dependency**
- **Found during:** Build verification
- **Issue:** ClockHUD.jsx imports from react-icons/fa but package not installed
- **Fix:** Ran npm install react-icons
- **Files modified:** package.json, package-lock.json
- **Verification:** Build passes
- **Committed in:** 9002d30

---

**Total deviations:** 6 auto-fixed (1 bug, 5 blocking)
**Impact on plan:** All auto-fixes necessary for build to pass. No scope creep.

## Issues Encountered
None beyond the build fixes documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- VocabRandomizer ready for integration with vocabulary loading pipeline
- Difficulty settings ready for UI settings panel
- Build is green

---
*Phase: 37-polish-replay*
*Completed: 2026-03-18*
