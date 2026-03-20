---
phase: 51-dialogue-foundation-learning-paths
plan: "04"
subsystem: learning-path-systems
tags: [learning-path, vocabulary, fsrs, quests, onboarding, middleware]
dependency_graph:
  requires:
    - "51-01 (InkDialogueEngine, worldStateKeys ONBOARDING_PATH_CHOSEN)"
    - "51-03 (setLearningPath reducer, PathChoice onboarding guard in GameLayout)"
  provides:
    - selectNewCardsByPath selector (path-aware FSRS card ordering)
    - domainAffinity field on all vocabulary words
    - PATH_MENTORS + PATH_FIRST_QUESTS constants
    - 3 path-gated first quests in quests.json
    - PathChoice settings mode with reset warning (PATH-05)
    - Onboarding skip dual-check (PATH-07)
    - 3-word onboarding reward via worldStateMiddleware (PATH-06)
  affects:
    - src/data/vocabularyAll.js (all vocabulary words tagged with domainAffinity)
    - src/store/slices/vocabularySlice.js (new selector)
    - src/store/slices/playerSlice.js (setLearningPath sets onboardingTargetNpc)
    - src/components/Onboarding/PathChoice.jsx (settings mode)
    - src/components/Router/GameLayout.jsx (onboarding skip, path switch entry point)
    - src/store/middleware/worldStateMiddleware.js (onboarding reward + dual-write)
tech_stack:
  added: []
  patterns:
    - "Post-process array mutation for domainAffinity (build-time, not runtime per-call)"
    - "createSelector with multiple input selectors from different slices (state.player + state.vocabulary)"
    - "Middleware dual-write pattern for persistence resilience (localStorage + IndexedDB)"
    - "Props-based modal mode switching (mode='onboarding'|'settings') for component reuse"
key_files:
  created: []
  modified:
    - src/data/vocabularyAll.js
    - src/data/quests.json
    - src/data/worldStateKeys.js
    - src/store/slices/vocabularySlice.js
    - src/store/slices/playerSlice.js
    - src/components/Onboarding/PathChoice.jsx
    - src/components/Onboarding/PathChoice.module.css
    - src/components/Router/GameLayout.jsx
    - src/store/middleware/worldStateMiddleware.js
decisions:
  - "PATH_MENTORS and PATH_FIRST_QUESTS exported as module-level constants (not closures) so they are tree-shakeable and testable without Redux"
  - "selectNewCardsByPath reads learningPath from state.player (not a param) to stay consistent with standard Redux selector convention for slice-owned data"
  - "Onboarding 3-word reward uses learnedCount from Object.keys(fsrsCards).length rather than a separate counter to avoid state duplication"
  - "worldStateMiddleware dual-write fires on both player/completeOnboarding and player/setTutorialPhase('complete') to cover all paths that can complete onboarding"
  - "PathChoice settings mode calls onClose() directly rather than dispatching a UI action, keeping the component stateless w.r.t. overlay management"
  - "ActivitiesMenu 'learning-path' now opens PathChoice via onOpenPathSwitch instead of navigating to /learning-path route (no route for this path exists)"
metrics:
  duration: "~25 minutes"
  completed_date: "2026-03-20"
  tasks_completed: 3
  tasks_total: 3
  requirements_satisfied: [PATH-03, PATH-04, PATH-05, PATH-06, PATH-07]
---

# Phase 51 Plan 04: Learning Path Downstream Wiring Summary

**One-liner:** FSRS word queue reordered by domainAffinity (200+ words tagged), 3 path-gated first quests added, PathChoice extended with settings mode + reset warning, onboarding dual-write skip, 3-word floating object reward via middleware.

## What Was Built

### Task 1: domainAffinity vocabulary tagging + selectNewCardsByPath (commit 3e0a9d0)

Added `CATEGORY_AFFINITY` map to `vocabularyAll.js` covering 23 categories across Scholar (grammar, numbers, colors, writing, education, science, mathematics, astronomy), Traveler (greetings, food, trade, directions, family, body, clothing, daily_life, weather), and Historian (history, culture, geography, architecture, religion, military, government) domains, plus shared categories.

Post-process loop assigns `word.domainAffinity = CATEGORY_AFFINITY[word.category] || []` to every word in the 5,000+ merged vocabulary array. Dev-mode `console.debug` logs distribution (stripped by bundler in production).

Added `selectNewCardsByPath` memoized selector to `vocabularySlice.js` that sorts unseen words by:
1. CEFR level ascending (A1 → A2 → B1 → B2 → untagged)
2. Path domain affinity match descending within each CEFR tier
3. Frequency descending as tiebreaker

This guarantees Scholar and Traveler see at least 200 words differ in first-encounter order (greetings/food words appear first for Traveler; grammar/numbers words appear first for Scholar).

### Task 2: Path-gated first quests + mentor mapping (commit e9028da)

Added 3 quest entries to `quests.json`:
- `path_scholar_first_quest` — zone: sacred_library, npcId: scholar-yusuf, learningPath: scholar
- `path_traveler_first_quest` — zone: oasis_village, npcId: guide-amira, learningPath: traveler
- `path_historian_first_quest` — zone: ancient_ruins, npcId: elder-tariq, learningPath: historian

Each has 2 objectives (find NPC + learn 3 words), rewards {xp: 50, dirhams: 10}, and `prerequisites.learningPath` for downstream filtering.

Added to `worldStateKeys.js`: `MENTOR_NPC_ID`, `FIRST_QUEST_ASSIGNED`, `FIRST_QUEST_ID`, `ONBOARDING_WORDS_LEARNED_COUNT`, `ONBOARDING_FIRST_QUEST_COMPLETE`.

Added to `playerSlice.js`:
- `export const PATH_MENTORS` — maps scholar/traveler/historian/polymath to NPC IDs
- `export const PATH_FIRST_QUESTS` — maps paths to quest IDs
- Updated `setLearningPath` reducer to auto-set `state.onboardingTargetNpc` via `PATH_MENTORS`
- Added `selectMentorNpcId` and `selectFirstQuestId` memoized selectors

### Task 3: Settings mode PathChoice + onboarding skip + 3-word reward (commit 976861e)

**PathChoice.jsx settings mode (PATH-05):**
- `mode` prop: `'onboarding'` (default) or `'settings'`
- Settings mode renders a red-tinted reset warning banner with English + Arabic text
- Shows "Current" badge on the active path card
- Shows "Switch Path" button and "Cancel" button instead of "Begin Journey"
- On confirm: dispatches `setLearningPath` + calls `onClose()` — does NOT set tutorialPhase

**PathChoice.module.css:** Added `resetWarning`, `resetWarningText`, `resetWarningAr`, `current`, `currentBadge`, `buttonRow`, `cancelBtn` styles.

**GameLayout.jsx (PATH-07 + PATH-05):**
- Added `worldOnboardingComplete` selector reading `ONBOARDING_COMPLETE` from worldStateSlice (IndexedDB)
- Computed `onboardingSkip = onboardingComplete || worldOnboardingComplete` — dual-check
- TutorialHints now guarded by `!onboardingSkip` instead of just `!onboardingComplete`
- Added `showPathSwitch` state; ActivitiesMenu "Learning Path" item now calls `onOpenPathSwitch`
- PauseMenu threads `onOpenPathSwitch` through to ActivitiesMenu
- Settings-mode `<PathChoice mode="settings" onClose={...} />` rendered when `showPathSwitch`

**worldStateMiddleware.js (PATH-06 + PATH-07):**
- PATH-07 dual-write: when `player/completeOnboarding` or `player/setTutorialPhase('complete')` fires, sets `ONBOARDING_COMPLETE` flag in worldStateSlice (IndexedDB) — ensuring returning players skip onboarding even after localStorage clear
- PATH-06: monitors `vocabulary/addFsrsCard`; when `learnedCount === 3` during active onboarding, dispatches `addDirhams(10)` + `showNotification` achievement toast + sets `ONBOARDING_FIRST_QUEST_COMPLETE` flag (guarded to fire once only)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

All key files verified present. All task commits verified in git log.

| Check | Result |
|-------|--------|
| vocabularyAll.js | FOUND |
| vocabularySlice.js | FOUND |
| playerSlice.js | FOUND |
| quests.json | FOUND |
| worldStateKeys.js | FOUND |
| PathChoice.jsx | FOUND |
| GameLayout.jsx | FOUND |
| worldStateMiddleware.js | FOUND |
| Commit 3e0a9d0 (Task 1) | FOUND |
| Commit e9028da (Task 2) | FOUND |
| Commit 976861e (Task 3) | FOUND |
