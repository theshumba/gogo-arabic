---
phase: 47-cinematic-intro
plan: 03
subsystem: ui
tags: [phaser, redux, dialogue, cinematic, onboarding, tutorial, arabic]

# Dependency graph
requires:
  - phase: 47-02
    provides: FloatingWordObject, _spawnFloatingWord, _onWordLearned hook in CinematicIntroSequencer
  - phase: 47-01
    provides: CinematicIntroSequencer base, text crawl, camera pan, WorldScene wiring
provides:
  - _triggerAmiraArrival(): pans camera to Guide Amira at (896, 1152), triggers DialogueBox
  - _showAmiraDialogue(): shows 2-line Arabic/English arrival dialogue for Guide Amira
  - _completeSequence(): dispatches setTutorialPhase('awaiting_mentor') and setActiveQuest('tutorial_welcome'), calls cleanup()
  - Full 5-beat cinematic sequence wired end-to-end in CinematicIntroSequencer.js
affects:
  - phase-48
  - phase-49
  - TutorialHints (now activates on 'awaiting_mentor')
  - questSlice (tutorial_welcome becomes active quest)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Redux dispatch from Phaser system: import { store } from store.js, call store.dispatch() directly"
    - "Cinematic beat chaining: each beat method checks this._active and calls the next beat as its terminal action"
    - "DialogueBox.show(npcName, messages, onComplete): onComplete fires after final message dismiss"

key-files:
  created: []
  modified:
    - src/game/systems/CinematicIntroSequencer.js

key-decisions:
  - "_triggerAmiraArrival() emits PLAYER_FREEZE before the camera pan — DialogueBox.show() also emits PLAYER_FREEZE internally, so freeze is safely redundant"
  - "_showAmiraDialogue() falls through to _completeSequence() if this.scene.dialogueBox is null — safe fallback prevents sequence hanging on scene setup edge cases"
  - "setActiveQuest('tutorial_welcome') dispatched in _completeSequence() — relies on questSlice.initializeQuests having already set tutorial_welcome status to 'active' (autoStart: true guarantees this)"

patterns-established:
  - "Beat chain termination: _completeSequence() is the canonical terminus — sets Redux state, then calls cleanup()"
  - "Sequence guard: every method checks if (!this._active) return — prevents stale callbacks on destroyed sequencer"

requirements-completed:
  - INTRO-05
  - UX-02

# Metrics
duration: 12min
completed: 2026-03-19
---

# Phase 47 Plan 03: Amira Arrival + Sequence Completion Summary

**Beat 5 (INTRO-05) wired: Guide Amira camera pan, 2-line Arabic/English DialogueBox, and Redux dispatch to 'awaiting_mentor' + 'tutorial_welcome' — full 5-beat cinematic sequence now end-to-end in CinematicIntroSequencer.js**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-19T11:15:49Z
- **Completed:** 2026-03-19T11:28:00Z
- **Tasks:** 1 of 2 (Task 2 is human-verify checkpoint)
- **Files modified:** 1

## Accomplishments
- Added `_triggerAmiraArrival()`: freezes player, pans camera 1000ms to tile (14,18) = world (896, 1152)
- Added `_showAmiraDialogue()`: shows Guide Amira's two-line arrival dialogue via existing DialogueBox API
- Added `_completeSequence()`: dispatches `setTutorialPhase('awaiting_mentor')` and `setActiveQuest('tutorial_welcome')`, then calls `cleanup()` to unfreeze player
- Updated `_onWordLearned()` with `this._active` guard and direct call to `_triggerAmiraArrival()`
- Confirmed `cleanup()` already emits `PLAYER_UNFREEZE` (from Plan 47-02) — no change needed
- Imported `store`, `setTutorialPhase`, and `setActiveQuest` — consistent with established project pattern

## Task Commits

Each task was committed atomically:

1. **Task 1: Add _triggerAmiraArrival() to CinematicIntroSequencer and wire into _onWordLearned()** - `a6ead59` (feat)

**Plan metadata:** pending final commit after human-verify

## Files Created/Modified
- `src/game/systems/CinematicIntroSequencer.js` - Added 3 new methods (_triggerAmiraArrival, _showAmiraDialogue, _completeSequence), updated _onWordLearned(), added 3 imports

## Decisions Made
- Imported `setTutorialPhase` from `playerSlice` directly (not via store.dispatch wrapper) — consistent with all other Phaser system files
- `_showAmiraDialogue()` has a null-guard for `this.scene.dialogueBox` — if for any reason dialogueBox isn't initialized, sequence falls through to `_completeSequence()` rather than hanging
- `setActiveQuest('tutorial_welcome')` will only succeed if the quest status is 'active' in Redux (guaranteed by `autoStart: true` in quests.json + `initializeQuests` in WorldScene)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Full 5-beat cinematic sequence is complete and awaiting human-verify (Task 2 checkpoint)
- After human approval: Phase 47 is complete — Phase 48 can begin
- TutorialHints arrow to Amira will appear immediately after cinematic ends (phase transitions to 'awaiting_mentor')
- tutorial_welcome quest will be set as activeQuestId after sequence completes

---
*Phase: 47-cinematic-intro*
*Completed: 2026-03-19*
