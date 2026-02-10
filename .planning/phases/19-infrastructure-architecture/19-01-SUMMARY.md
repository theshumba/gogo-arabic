---
phase: 19-infrastructure-architecture
plan: 01
subsystem: event-system
tags: [eventbus, refactor, naming, constants, registry]
dependency_graph:
  requires: []
  provides: [eventBusTypes.js, namespaced-event-constants]
  affects:
    - src/hooks/useEventBusListeners.js
    - src/game/scenes/WorldScene.js
    - src/game/scenes/BootScene.js
    - src/game/systems/InteractableManager.js
    - src/game/systems/NPCManager.js
    - src/game/systems/ZoneTransition.js
    - src/game/sprites/Player.js
    - src/components/Router/GameLayout.jsx
    - src/components/NPC/DialogueOverlay.jsx
    - src/components/Quiz/QuizOverlay.jsx
    - src/components/UI/LevelUpModal.jsx
    - src/components/HUD/HUD.jsx
    - src/components/HUD/MiniMap.jsx
    - src/components/HUD/QuestTracker.jsx
    - src/components/Onboarding/ContextualOnboarding.jsx
    - src/components/Wardrobe/Wardrobe.jsx
    - src/components/World/WorldMap.jsx
    - src/hooks/useOverlayClose.js
    - src/hooks/useDialogue.js
    - src/hooks/useBattle.js
    - src/hooks/useQuiz.js
tech_stack:
  added: []
  patterns:
    - Centralized event name registry via frozen constant object
    - source:category:action naming convention for EventBus events
key_files:
  created:
    - src/utils/eventBusTypes.js
  modified:
    - src/hooks/useEventBusListeners.js
    - src/game/scenes/WorldScene.js
    - src/game/scenes/BootScene.js
    - src/game/systems/InteractableManager.js
    - src/game/systems/NPCManager.js
    - src/game/systems/ZoneTransition.js
    - src/game/sprites/Player.js
    - src/components/Router/GameLayout.jsx
    - src/components/NPC/DialogueOverlay.jsx
    - src/components/Quiz/QuizOverlay.jsx
    - src/components/UI/LevelUpModal.jsx
    - src/components/HUD/HUD.jsx
    - src/components/HUD/MiniMap.jsx
    - src/components/HUD/QuestTracker.jsx
    - src/components/Onboarding/ContextualOnboarding.jsx
    - src/components/Wardrobe/Wardrobe.jsx
    - src/components/World/WorldMap.jsx
    - src/hooks/useOverlayClose.js
    - src/hooks/useDialogue.js
    - src/hooks/useBattle.js
    - src/hooks/useQuiz.js
    - src/game/systems/__tests__/InteractableManager.test.js
    - src/game/systems/__tests__/NPCManager.test.js
    - src/game/systems/__tests__/ZoneTransition.test.js
decisions:
  - id: D19-01-01
    decision: "Added open-shop (SHOP_OPEN) to event registry — not in original plan inventory but found in useDialogue.js"
    rationale: "Complete inventory requires all raw strings, grep revealed this additional event"
    impact: "Total 33 constants instead of planned 30+"
  - id: D19-01-02
    decision: "Updated 3 test files alongside source files in Task 2 commit"
    rationale: "Tests asserting old event names would break (Rule 1 - Bug). Atomic rename must include tests."
    impact: "Clean test suite — still 551 passing, 3 pre-existing failures only"
metrics:
  duration: "9 minutes"
  completed_date: "2026-02-10"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 24
  tests_before: "551 passing, 3 failing (pre-existing)"
  tests_after: "551 passing, 3 failing (same pre-existing)"
  bundle_size: "279.21KB main (under 500KB limit)"
---

# Phase 19 Plan 01: EventBus Registry + Atomic Rename Summary

**One-liner:** Centralized EventBus event name registry with 33 namespaced constants (`source:category:action`) and atomic rename across 21 source files — zero raw event strings remain.

## Performance

- Duration: ~9 minutes
- Tasks: 2/2 completed
- Files created: 1 (`eventBusTypes.js`)
- Files modified: 24 (21 source + 3 test files)
- Build: 279.21KB main bundle (under 500KB)
- Tests: 551 passing / 554 total (3 pre-existing failures unchanged)

## Accomplishments

1. **Created `src/utils/eventBusTypes.js`** — Single source of truth for all EventBus event names. 33 constants, frozen object, organized by domain (PLAYER, NPC, ZONE, OBJECTS, QUIZ/LEARNING, SFX, VFX, SCENE, BATTLE). Includes full old-to-new mapping comment block.

2. **Atomic rename across 21 source files** — Every `EventBus.on/off/emit` call in the codebase now uses `EVENTS.CONSTANT_NAME` instead of raw strings. Zero raw event string literals remain.

3. **Updated 3 test files** — `InteractableManager.test.js`, `NPCManager.test.js`, `ZoneTransition.test.js` updated to assert new namespaced event names. Tests pass cleanly.

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create eventBusTypes.js registry | 96fef25 | `src/utils/eventBusTypes.js` |
| 2 | Atomic rename all raw strings | 57cbcee | 24 files (21 source + 3 tests) |

## Key Files

**Created:**
- `src/utils/eventBusTypes.js` — 33 namespaced event constants, frozen EVENTS object

**Most significant modifications:**
- `src/hooks/useEventBusListeners.js` — 42 replacements (21 on + 21 off + internal emits)
- `src/game/scenes/WorldScene.js` — 13 replacements
- `src/game/systems/InteractableManager.js` — 10 replacements
- `src/components/HUD/HUD.jsx` — 10 replacements

## Decisions

### D19-01-01: Additional event discovered (open-shop)
The plan listed 30+ events, but grep of the codebase found `open-shop` in `useDialogue.js` which was not in the planned inventory. Added as `SHOP_OPEN: 'react:nav:open-shop'`. Final count: 33 constants.

### D19-01-02: Test files updated as part of atomic rename
Three test files (`InteractableManager.test.js`, `NPCManager.test.js`, `ZoneTransition.test.js`) were asserting old event name strings. These were updated in Task 2's commit as part of the atomic operation — tests asserting `'freeze-player'` would have been false positives against the new event name `'react:player:freeze'`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Test files asserting stale event names**
- **Found during:** Task 2 — running `npx vitest run` after atomic rename
- **Issue:** 3 test files used old raw event string literals in `toHaveBeenCalledWith()` assertions. After renaming source files, these became stale test expectations (asserting `'freeze-player'` when source code now emits `'react:player:freeze'`).
- **Fix:** Added `import { EVENTS } from '../../utils/eventBusTypes.js'` to each test file and replaced all raw string assertions with EVENTS constants
- **Files modified:** `InteractableManager.test.js`, `NPCManager.test.js`, `ZoneTransition.test.js`
- **Commit:** 57cbcee (included in Task 2 atomic commit)

## Next Phase Readiness

This plan unblocks all subsequent Phase 19 plans:
- **19-02 (narrativeSlice):** Can import EVENTS for any narrative event constants (none needed yet, but registry ready)
- **19-03 (useEventBusListeners sub-hooks):** All EVENTS constants available to split into domain sub-hooks
- **19-04 (SceneStackManager + DialogueEngine):** New Phaser systems can emit `EVENTS.BUILDING_*` and `EVENTS.DIALOGUE_*` constants (to be added to registry)

Wave 2 plans (19-03, 19-04) depend on Wave 1 (19-01, 19-02) completing. This plan is complete.

## Self-Check: PASSED

- `src/utils/eventBusTypes.js` — FOUND
- `src/hooks/useEventBusListeners.js` — FOUND (modified)
- Commit 96fef25 (task 1) — FOUND in git log
- Commit 57cbcee (task 2) — FOUND in git log
- Zero raw EventBus strings remaining — VERIFIED
- 551 tests passing — VERIFIED
- Build 279.21KB — VERIFIED
