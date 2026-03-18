---
phase: 20-dialogue-system
plan: 06
subsystem: dialogue, world-scene, tests
tags: [integration, dialogue-engine, hub-and-spoke, tests]
dependency_graph:
  requires: [20-02, 20-03, 20-05]
  provides: [dialogue-engine-integration, dialogue-overlay-tests]
  affects: [WorldScene, DialogueOverlay]
tech_stack:
  added: []
  patterns: [subsystem-lifecycle, hub-and-spoke-dialogue, mock-per-test]
key_files:
  created: []
  modified: []
decisions:
  - DialogueEngine follows SceneStackManager lifecycle pattern (constructor null, create instantiate, shutdown destroy)
  - Tests mutate shared mockUseDialogue object in beforeEach for per-test isolation
  - TopicSelectionMenu, ConversationHistory, RelationshipIndicator mocked as simple divs with data-testid
metrics:
  duration: ~3min (verification only — all code was pre-existing)
  completed: 2026-03-18
---

# Phase 20 Plan 06: Wire DialogueEngine into WorldScene + Verify End-to-End Summary

DialogueEngine fully integrated into WorldScene lifecycle; 7 DialogueOverlay tests passing with hub-and-spoke API mocks; build clean.

## What Was Done

### Task 1: Verify DialogueEngine wiring + tests (already implemented)

All work from this plan was already completed in prior executions:

**WorldScene.js integration (confirmed present):**
- Line 14: `import { DialogueEngine } from '../systems/DialogueEngine.js'`
- Line 62: `this.dialogueEngine = null` in constructor
- Line 104: `this.dialogueEngine = new DialogueEngine(this)` in create()
- Lines 702-705: destroy + null in shutdown()

**DialogueOverlay.test.jsx (confirmed present, 7 tests passing):**
1. `should render NPC name and dialogue text` -- basic rendering
2. `should not render when dialogueOpen is false` -- closed state
3. `should have accessible dialog role` -- ARIA compliance
4. `should handle Escape key to close dialogue` -- keyboard interaction
5. `should render topic selection in hub phase for hub-and-spoke NPCs` -- hub phase
6. `should show relationship indicator when displaying choices for hub-and-spoke NPC` -- relationship UI
7. `should use filteredChoices for hub-and-spoke NPCs` -- filtered choices

**Mock setup covers all useDialogue fields:**
- Original: currentTree, lineIndex, close, advance, handleChoice, showCulturalMenu, setShowCulturalMenu
- Hub-and-spoke: phase, availableTopics, selectTopic, topicsDiscussed, filteredChoices, resumeAfterQuiz, isHubAndSpoke

### Task 2: Checkpoint (human-verify)

Reached checkpoint for manual verification of end-to-end dialogue flow.

## Deviations from Plan

None -- plan executed exactly as written (all code was already in place from prior executions).

## Commits

No new commits needed -- all code verified as already present and working.

## Verification

- [x] `npx vite build` passes (795 modules, 4.39s)
- [x] DialogueEngine imported and instantiated in WorldScene.create()
- [x] DialogueEngine destroyed in WorldScene.shutdown()
- [x] 7 DialogueOverlay tests pass (vitest run)
- [x] Mock returns backward-compatible defaults (phase: greeting, isHubAndSpoke: false)
- [x] Hub phase test verifies TopicSelectionMenu rendering
- [x] Relationship indicator test verifies RelationshipIndicator rendering
- [x] Filtered choices test verifies filteredChoices usage

## Self-Check: PASSED

- FOUND: src/game/scenes/WorldScene.js (contains DialogueEngine import + instantiation + destroy)
- FOUND: src/components/NPC/__tests__/DialogueOverlay.test.jsx (7 test cases)
- FOUND: src/game/systems/DialogueEngine.js (the engine itself)
- FOUND: src/hooks/useDialogue.js (hub-and-spoke hook)
