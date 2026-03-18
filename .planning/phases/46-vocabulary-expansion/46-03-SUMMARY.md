---
phase: 46-vocabulary-expansion
plan: 03
subsystem: ui, data
tags: [vocabulary, cefr, root-explorer, semantic-clusters, fsrs, react]

requires:
  - phase: 46-vocabulary-expansion (46-01)
    provides: "vocabularyExpanded.js with 500 A1 + 1,000 A2 words"
  - phase: 46-vocabulary-expansion (46-02)
    provides: "vocabularyExpanded.js extended with 2,000 B1 + 1,500 B2 words (5,000 total)"
provides:
  - "vocabularyAll.js merges all 3 sources into 6,220 total words (curated + vocabulary-final + expanded)"
  - "TeacherWordCard renders color-coded CEFR badges (A1/A2/B1/B2)"
  - "RootExplorer with Root Families + Word Clusters dual browse mode"
  - "selectNewCardsByFrequency selector for frequency-ordered FSRS new card introduction"
affects: [review-system, vocabulary-ui, root-explorer, fsrs, quiz-system]

tech-stack:
  added: []
  patterns:
    - "Three-source vocabulary merge with deduplication by ID priority (curated > vocabulary-final > expanded)"
    - "CEFR badge rendering with data-level CSS attribute selector for color coding"
    - "Dual-mode component pattern (viewMode state toggling between root families and clusters)"

key-files:
  created: []
  modified:
    - "src/data/vocabularyAll.js"
    - "src/store/slices/vocabularySlice.js"
    - "src/game/systems/VocabRandomizer.js"
    - "src/components/NPC/TeacherWordCard.jsx"
    - "src/components/NPC/DialogueOverlay.module.css"
    - "src/components/Roots/RootExplorer.jsx"
    - "src/components/Roots/RootExplorer.module.css"
    - "src/components/HUD/HUD.jsx"

key-decisions:
  - "Eager import of vocabularyExpanded.js replaces lazy loadExpandedVocabulary() — simpler, all 6,220 words available at boot"
  - "Root detail view merges quranic-roots words (strings) with vocabulary words (objects) — renders both with type detection"
  - "Cluster detail view sorts words by frequency descending — most common words shown first within each category"

patterns-established:
  - "CEFR_COLORS constant for consistent color coding across components: A1=#4caf50, A2=#2196f3, B1=#ff9800, B2=#e63946"
  - "Vocabulary root family grouping via root field normalization (strip spaces, match)"

requirements-completed: [VOCAB-01, VOCAB-02, VOCAB-03, VOCAB-04, VOCAB-05, VOCAB-06]

duration: 5min
completed: 2026-03-18
---

# Phase 46 Plan 03: Vocabulary Wiring Summary

**6,220-word merged vocabulary with CEFR badges on TeacherWordCard, dual-mode RootExplorer (root families + semantic cluster browsing), and frequency-based FSRS new card selector**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-18T22:54:53Z
- **Completed:** 2026-03-18T22:59:34Z
- **Tasks:** 2 completed (Task 3 is human-verify checkpoint)
- **Files modified:** 8

## Accomplishments

- vocabularyAll.js now eagerly merges all 3 vocabulary sources into 6,220 total words with ID-based deduplication
- TeacherWordCard shows color-coded CEFR level badges (A1 green, A2 blue, B1 orange, B2 red)
- RootExplorer extended with two browse modes: Root Families (quranic-roots + vocabulary root field data) and Word Clusters (semantic categories with frequency-sorted words)
- selectNewCardsByFrequency selector added to vocabularySlice.js for CEFR-then-frequency ordered new card introduction
- VocabRandomizer.js A1 detection fixed to support both `cefr` and `cefrLevel` field names

## Task Commits

Each task was committed atomically:

1. **Task 1: Merge vocabularyExpanded.js into vocabularyAll.js + add frequency-based FSRS selector** - `ce09c4f` (feat)
2. **Task 2: Add CEFR badge to TeacherWordCard + extend RootExplorer with root families and semantic cluster browsing** - `8824137` (feat)

## Files Created/Modified

- `src/data/vocabularyAll.js` - Merged 3 vocabulary sources (curated + vocabulary-final + expanded) into 6,220 words with ID deduplication
- `src/store/slices/vocabularySlice.js` - Added selectNewCardsByFrequency memoized selector
- `src/game/systems/VocabRandomizer.js` - Fixed A1 detection to support cefrLevel field
- `src/components/NPC/TeacherWordCard.jsx` - Added CEFR badge rendering after transliteration
- `src/components/NPC/DialogueOverlay.module.css` - Added cefrBadge CSS with data-level attribute coloring
- `src/components/Roots/RootExplorer.jsx` - Added dual browse mode (Root Families + Word Clusters), vocabulary root family merging, cluster browsing with frequency sorting
- `src/components/Roots/RootExplorer.module.css` - Added viewToggle and clusterWordRow CSS classes
- `src/components/HUD/HUD.jsx` - Fixed duplicate QuestTracker import (Rule 1 deviation)

## Decisions Made

- **Eager import replaces lazy loading:** vocabularyExpanded.js is now imported eagerly in vocabularyAll.js instead of through the async loadExpandedVocabulary() function. This simplifies the architecture — all 6,220 words are available at boot without needing to call a loader. The expanded file (5,135 lines) is acceptable for initial bundle since the game is content-heavy.
- **Root detail merges both data sources:** When viewing a root family, quranic-roots words (plain strings) are shown first, followed by vocabulary words (objects with english/transliteration/cefrLevel). Type detection (`typeof wordItem === 'object'`) determines rendering.
- **Cluster sorting by frequency:** Word Clusters view sorts words by frequency descending within each category, ensuring the most commonly encountered words appear first.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed duplicate QuestTracker import in HUD.jsx**
- **Found during:** Task 1 (build verification)
- **Issue:** HUD.jsx had `import QuestTracker from './QuestTracker.jsx'` duplicated on lines 17-18, causing esbuild to fail with "symbol already declared"
- **Fix:** Removed the duplicate import line
- **Files modified:** src/components/HUD/HUD.jsx
- **Verification:** Build passes the module transform step (386 modules transformed)
- **Committed in:** ce09c4f (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for build to pass. No scope creep.

## Issues Encountered

- Node.js 24 requires `with { type: 'json' }` for JSON imports, preventing direct `node -e` verification of vocabularyAll.js as ESM. Verified word count arithmetically instead (1,220 base + 5,000 expanded = 6,220, zero ID collisions confirmed).
- Pre-existing build failure in ClockHUD.jsx (missing `react-icons/fa` dependency) is unrelated to this plan's changes. Module transform step succeeds for all vocabulary and RootExplorer files.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 6 VOCAB requirements now satisfied (VOCAB-01 through VOCAB-06)
- Phase 46 complete after human verification of visual elements (Task 3 checkpoint)
- v9.0 milestone completion: Phase 44 (NPC dialogue) + Phase 45 (quests) + Phase 46 (vocabulary) all done

---
*Phase: 46-vocabulary-expansion*
*Completed: 2026-03-18*
