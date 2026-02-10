---
phase: 17-progression-clarity
plan: 02
subsystem: hud, onboarding
tags: [ui, progress-metrics, onboarding, accessibility]
dependency_graph:
  requires: []
  provides: [inline-progress-metrics, alphabet-onboarding-step]
  affects: [HUD, ContextualOnboarding]
tech_stack:
  added: []
  patterns: [inline-selector, aria-label-targeting]
key_files:
  created: []
  modified:
    - src/components/HUD/HUD.jsx
    - src/components/HUD/HUD.module.css
    - src/components/HUD/__tests__/HUD.test.jsx
    - src/components/Onboarding/onboardingSteps.js
decisions:
  - Used inline selector for quest completion count instead of importing selectCompletedQuests (returns object, we need count)
  - Used Unicode escape for Arabic alef in JSX to avoid encoding issues
metrics:
  duration: ~10min
  completed: 2026-02-10
---

# Phase 17 Plan 02: HUD Inline Progress Metrics + Onboarding Reorder Summary

Replaced StatsPanel dropdown with always-visible compact progress strip showing letters mastered, words learned, and quests completed inline in the HUD bar. Reordered onboarding so alphabet learning is step 2 of 5.

## What Was Done

### Task 1: Add always-visible progress metrics to HUD

- Removed `StatsPanel` import and usage from HUD (files preserved for potential future use)
- Added `selectLearnedWordCount` import from vocabularySlice
- Added inline selector for completed quest count from quests state
- Added progress strip JSX after stamina bar in left section: letters (X/28), words (X), quests (X/52)
- Added CSS styles for `.progressStrip`, `.progressItem`, `.progressIcon`, `.progressValue`, `.progressSep`
- Added responsive hiding: `display: none` at 768px and 480px breakpoints to prevent HUD overflow on smaller screens

### Task 2: Reorder onboarding to guide to alphabet within first 3 steps

- Rewrote `onboardingSteps` array with new order:
  1. Welcome + movement controls (center, no trigger)
  2. **Alphabet button** (bottom, trigger: player-position-update) -- NEW position
  3. XP bar explanation (bottom, no trigger)
  4. Quest log (bottom, no trigger)
  5. Scholar Yusuf NPC (center, highlightNpc preserved)
- Removed world map step (self-explanatory with "Map" button visible) to keep total at 5 steps
- Alphabet step targets `[aria-label*="Alphabet module"]` matching existing HUD button aria-label
- Step 2 content: "Start here! Learn the Arabic alphabet..."

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated HUD tests for StatsPanel removal**
- **Found during:** Task 1 verification
- **Issue:** 3 existing tests (`display dirhams count`, `display words learned count`, `display streak count`) referenced `screen.getByLabelText(/show stats/i)` which was the StatsPanel toggle button now removed
- **Fix:** Replaced 3 StatsPanel-dependent tests with 1 comprehensive `should display inline progress metrics` test that verifies the new progress strip (letters count, quest count, aria-label). Updated ARIA labels test to check for `Learning progress` instead of stats panel.
- **Files modified:** `src/components/HUD/__tests__/HUD.test.jsx`
- **Commit:** c5b3eef

## Commits

| Hash | Message |
|------|---------|
| c5b3eef | feat(17-02): add HUD inline progress metrics and reorder onboarding |

## Key Files Modified

- `src/components/HUD/HUD.jsx` -- Removed StatsPanel, added progress strip with letter/word/quest counts
- `src/components/HUD/HUD.module.css` -- Added progressStrip styles + responsive hiding at 768px/480px
- `src/components/HUD/__tests__/HUD.test.jsx` -- Updated tests: removed StatsPanel refs, added progress strip test
- `src/components/Onboarding/onboardingSteps.js` -- Reordered: alphabet is now step 2, world map removed

## Verification

- [x] HUD displays progress strip with letters/words/quests on desktop
- [x] Progress strip hidden on tablet (768px) and mobile (480px)
- [x] StatsPanel dropdown removed from HUD
- [x] Onboarding step 2 targets alphabet button with "Start here!" content
- [x] Onboarding has 5 steps, last step has highlightNpc
- [x] ContextualOnboarding requires no changes (reads onboardingSteps dynamically)
- [ ] `npx vite build` -- could not run (bash permissions blocked build commands)
- [x] HUD tests updated to match new component structure

## Self-Check: PASSED

- FOUND: src/components/HUD/HUD.jsx (contains selectLearnedWordCount, progressStrip)
- FOUND: src/components/HUD/HUD.module.css (contains progressStrip styles)
- FOUND: src/components/HUD/__tests__/HUD.test.jsx (contains Learning progress assertions)
- FOUND: src/components/Onboarding/onboardingSteps.js (contains Alphabet module target)
- FOUND: commit c5b3eef in git log
