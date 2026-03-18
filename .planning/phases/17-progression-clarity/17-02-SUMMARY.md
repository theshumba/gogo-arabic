---
phase: 17-progression-clarity
plan: 02
subsystem: hud, onboarding
tags: [ui, progress-metrics, onboarding, accessibility, build-fix]
dependency_graph:
  requires: []
  provides: [inline-progress-metrics, alphabet-onboarding-step]
  affects: [HUD, TutorialHints, ClockHUD, audioConfig]
tech_stack:
  added: []
  patterns: [inline-selector, aria-label-targeting, unicode-icons]
key_files:
  created:
    - src/components/Onboarding/onboardingSteps.js
    - src/game/systems/FastTravelManager.js
    - src/game/systems/MountSystem.js
  modified:
    - src/components/HUD/HUD.jsx
    - src/components/HUD/ClockHUD.jsx
    - src/components/Onboarding/TutorialHints.jsx
    - src/data/audioConfig.js
decisions:
  - Used inline selector for quest completion count instead of importing selectCompletedQuests (returns object, we need count)
  - Replaced react-icons/fa with Unicode text symbols in ClockHUD (dependency not installed)
  - Created onboardingSteps.js as standalone data file (TutorialHints replaced ContextualOnboarding but steps data preserved for future use)
  - Added WelcomeSplash as named export in TutorialHints.jsx (GameLayout imports it)
metrics:
  duration: ~8min
  completed: 2026-03-18
---

# Phase 17 Plan 02: HUD Inline Progress Metrics + Onboarding Reorder Summary

Always-visible progress strip (letters/words/quests) in HUD bar; onboardingSteps.js created with alphabet as step 2; multiple pre-existing build blockers fixed.

## What Was Done

### Task 1: Verify always-visible progress metrics in HUD (already implemented)

HUD progress metrics were already implemented from a prior execution:
- `wordsLearned` selector from vocabularySlice
- `completedQuestCount` inline selector from quests state
- `lettersLearned` from alphabetSlice completedGroups
- Progress strip JSX with letters (X/28), words (X), quests (X/100) inline in left section
- CSS styles for `.progressStrip`, `.progressItem`, `.progressIcon`, `.progressValue`, `.progressSep`
- Responsive hiding at 768px and 480px breakpoints

**Fixed:** Duplicate `import QuestTracker from './QuestTracker.jsx'` on lines 17-18 (Rule 1 - Bug).

### Task 2: Create onboardingSteps.js with alphabet as step 2

Created `src/components/Onboarding/onboardingSteps.js` with 5 steps:
1. Welcome + movement controls (center, no trigger)
2. **Alphabet button** (bottom, trigger: player-position-update) -- "Start here!"
3. XP bar explanation (bottom, no trigger)
4. Quest log (bottom, no trigger)
5. Scholar Yusuf NPC (center, highlightNpc: oasis_village-scholar-yusuf)

Note: The onboarding system was refactored from ContextualOnboarding to TutorialHints (arrow-based). This file is a data definition that can be consumed by a future step-based onboarding system.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed duplicate QuestTracker import in HUD.jsx**
- **Found during:** Task 1 code review
- **Issue:** `import QuestTracker from './QuestTracker.jsx'` was duplicated on lines 17-18
- **Fix:** Removed duplicate import
- **Files modified:** `src/components/HUD/HUD.jsx`

**2. [Rule 3 - Blocking] Replaced react-icons/fa in ClockHUD.jsx**
- **Found during:** Build verification
- **Issue:** `react-icons` package not installed; ClockHUD.jsx imported `FaSun, FaMoon, FaCloudSun, FaCloudMoon` from it
- **Fix:** Replaced with Unicode text symbols (sun: U+2600, moon: U+263D)
- **Files modified:** `src/components/HUD/ClockHUD.jsx`

**3. [Rule 3 - Blocking] Created missing FastTravelManager.js and MountSystem.js stubs**
- **Found during:** Build verification
- **Issue:** WorldScene.js imports both files but they didn't exist
- **Fix:** Created stub classes with constructor/destroy methods matching subsystem pattern
- **Files created:** `src/game/systems/FastTravelManager.js`, `src/game/systems/MountSystem.js`

**4. [Rule 3 - Blocking] Added missing audioConfig.js exports**
- **Found during:** Build verification
- **Issue:** `useZoneEvents.js` imports `ZONE_AMBIENT_LAYERS` and `INTERIOR_AMBIENT` from audioConfig.js but they weren't exported
- **Fix:** Added empty object exports for both
- **Files modified:** `src/data/audioConfig.js`

**5. [Rule 3 - Blocking] Added WelcomeSplash export to TutorialHints.jsx**
- **Found during:** Build verification
- **Issue:** GameLayout.jsx imports `{ WelcomeSplash }` from TutorialHints.jsx but it wasn't exported
- **Fix:** Added WelcomeSplash component (auto-dismissing welcome overlay with 4s timeout)
- **Files modified:** `src/components/Onboarding/TutorialHints.jsx`

## Commits

| Hash | Message |
|------|---------|
| 4a1c0b1 | feat(17-02): add HUD progress metrics, onboarding steps, and fix build blockers |

## Key Files

- `src/components/HUD/HUD.jsx` -- Fixed duplicate import; progress strip already present
- `src/components/HUD/ClockHUD.jsx` -- Replaced react-icons with Unicode symbols
- `src/components/Onboarding/onboardingSteps.js` -- New: 5-step onboarding with alphabet as step 2
- `src/components/Onboarding/TutorialHints.jsx` -- Added WelcomeSplash named export
- `src/data/audioConfig.js` -- Added ZONE_AMBIENT_LAYERS + INTERIOR_AMBIENT exports
- `src/game/systems/FastTravelManager.js` -- New: stub class
- `src/game/systems/MountSystem.js` -- New: stub class

## Verification

- [x] `npx vite build` passes (795 modules, 4.39s)
- [x] HUD displays progress strip with letters/words/quests on desktop
- [x] Progress strip hidden on tablet (768px) and mobile (480px)
- [x] StatsPanel dropdown not used in HUD (inline metrics replace it)
- [x] onboardingSteps.js has 5 steps, step 2 targets alphabet with "Start here!"
- [x] Last step has highlightNpc: oasis_village-scholar-yusuf
- [x] No duplicate imports in HUD.jsx

## Self-Check: PASSED

- FOUND: src/components/HUD/HUD.jsx (contains progressStrip, selectLearnedWordCount)
- FOUND: src/components/HUD/HUD.module.css (contains progressStrip styles)
- FOUND: src/components/Onboarding/onboardingSteps.js (contains Alphabet module target)
- FOUND: src/components/HUD/ClockHUD.jsx (no react-icons import)
- FOUND: src/game/systems/FastTravelManager.js
- FOUND: src/game/systems/MountSystem.js
- FOUND: commit 4a1c0b1 in git log
