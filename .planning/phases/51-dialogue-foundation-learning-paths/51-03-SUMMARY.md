---
phase: 51-dialogue-foundation-learning-paths
plan: 03
subsystem: ui
tags: [inkjs, dialogue, onboarding, learning-path, react, redux, eventbus]

requires:
  - phase: 51-01
    provides: InkDialogueEngine with loadForNpc, syncStateIn/syncStateOut, BindExternalFunction bindings

provides:
  - guide-amira-path.ink: Ink source with 3-choice path dialogue (Scholar/Traveler/Historian)
  - guide-amira-path.ink.json: Compiled ink story for path choice
  - InkDialogueEngine.loadPathChoice(): Loads path-choice ink story specifically
  - DialogueOverlay ink dialogue mode: Renders ink lines + clickable choices, emits INK_DIALOGUE_END
  - useTutorialTrigger ink trigger: After first word learned, fires ink path-choice then advances phase
  - GameLayout PathChoice guard: ONBOARDING_PATH_CHOSEN prevents double-display

affects: [51-04, 52-vocab-expansion, onboarding-flow, tutorial-trigger-hook]

tech-stack:
  added: []
  patterns:
    - INK_DIALOGUE_START event carries engine + npcData — DialogueOverlay renders any ink story without knowing NPC ID
    - INK_DIALOGUE_END event decouples dialogue close from phase advancement — hook handles phase, overlay handles UI
    - Ink path-choice triggered by SFX_WORDLEARNED in met_mentor phase (not by tutorialPhase='path_choice')

key-files:
  created:
    - src/data/ink-source/guide-amira-path.ink
    - src/data/ink/guide-amira-path.ink.json
  modified:
    - src/game/systems/InkDialogueEngine.js
    - src/components/NPC/DialogueOverlay.jsx
    - src/components/Router/GameLayout.jsx
    - src/hooks/useTutorialTrigger.js
    - src/utils/eventBusTypes.js

key-decisions:
  - "Ink path-choice triggered by SFX_WORDLEARNED (not tutorialPhase='path_choice') — Phaser CinematicIntroSequencer already skips 'path_choice' entirely; triggering from word-learned is the correct insertion point"
  - "DialogueOverlay handles ink rendering as a separate mode — no NPC lookup needed; ink story is self-contained with npcData passed in event payload"
  - "INK_DIALOGUE_END + INK_DIALOGUE_START event pair decouples overlay lifecycle from phase management — useTutorialTrigger remains the single source of truth for phase transitions"
  - "ONBOARDING_PATH_CHOSEN guard in GameLayout added as safety net — ink flow never sets tutorialPhase='path_choice' so PathChoice is safe but guarded for edge cases"
  - "PathChoice.jsx NOT deleted — remains available for PATH-05 settings path-switch feature"

patterns-established:
  - "Pattern: Ink overlay mode — emit INK_DIALOGUE_START {engine, npcData} to trigger ink dialogue in DialogueOverlay without opening legacy NPC dialogue"
  - "Pattern: Ink completion flow — syncStateOut() on close flushes all Redux dispatches from ink BindExternalFunction calls (setLearningPath, setFlag ONBOARDING_PATH_CHOSEN)"

requirements-completed:
  - PATH-01
  - PATH-02

duration: 30min
completed: 2026-03-20
---

# Phase 51 Plan 03: Amira Path-Choice Ink Dialogue Summary

**Amira asks 'What draws you to Arabic?' via inkjs dialogue after first word learned — Scholar/Traveler/Historian choice dispatches setLearningPath through BindExternalFunction and gates the legacy PathChoice overlay**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-03-20T00:50:45Z
- **Completed:** 2026-03-20T01:21:00Z
- **Tasks:** 2
- **Files modified:** 7 (2 created, 5 modified)

## Accomplishments

- Authored `guide-amira-path.ink` with 3-choice dialogue (Scholar/Traveler/Historian), already-chosen guard, and path_confirmed closing knot — compiled to `guide-amira-path.ink.json` (inkVersion 21)
- Added `InkDialogueEngine.loadPathChoice()` targeting `guide-amira-path.ink.json` specifically
- Wired ink dialogue rendering into `DialogueOverlay` via `INK_DIALOGUE_START` event — Arabic lines (dir=rtl) and gold choice buttons render without legacy NPC data lookup
- Updated `useTutorialTrigger` to fire ink path-choice after `SFX_WORDLEARNED` (met_mentor phase), with fallback for save-reload players where path is already chosen
- Guarded `PathChoice` overlay in `GameLayout` with `!pathAlreadyChosen` — prevents double-display in any edge case

## Task Commits

1. **Task 1: Author Amira path-choice ink tree + compile** - `0cfb566` (feat)
2. **Task 2: Wire ink choices into DialogueOverlay + suppress PathChoice** - `eee61de` (feat)

**Plan metadata:** (docs commit pending)

## Files Created/Modified

- `src/data/ink-source/guide-amira-path.ink` - Ink source: 3-path dialogue with EXTERNAL declarations, already-chosen guard, path_confirmed knot
- `src/data/ink/guide-amira-path.ink.json` - Compiled ink story (inkVersion 21)
- `src/game/systems/InkDialogueEngine.js` - Added `loadPathChoice()` method for path-specific story loading
- `src/components/NPC/DialogueOverlay.jsx` - Added ink dialogue mode: event listener, state, ink line/choice rendering, syncStateOut on close
- `src/utils/eventBusTypes.js` - Added `INK_DIALOGUE_START` and `INK_DIALOGUE_END` events
- `src/hooks/useTutorialTrigger.js` - After SFX_WORDLEARNED in met_mentor, fires ink dialogue; after INK_DIALOGUE_END, advances to learned_word
- `src/components/Router/GameLayout.jsx` - Added `pathAlreadyChosen` selector, updated PathChoice condition with guard

## Decisions Made

- Ink path-choice is triggered by `SFX_WORDLEARNED` when `tutorialPhase === 'met_mentor'` — this is the correct insertion point because the Phaser-native CinematicIntroSequencer already skips `'path_choice'` entirely (dispatches `'awaiting_mentor'` directly).
- `INK_DIALOGUE_START`/`INK_DIALOGUE_END` event pair keeps DialogueOverlay and useTutorialTrigger decoupled — overlay owns the UI lifecycle, hook owns the phase transition.
- `PathChoice.jsx` preserved unchanged for future PATH-05 (settings path-switch).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed conflicting setTutorialPhase dispatches from DialogueOverlay**
- **Found during:** Task 2 (wiring ink choices)
- **Issue:** Plan spec said DialogueOverlay should dispatch `setTutorialPhase('awaiting_mentor')` after ink dialogue ends, but `useTutorialTrigger` is the correct owner of phase transitions — double-dispatch would cause wrong phase ('awaiting_mentor' instead of 'learned_word')
- **Fix:** Removed all `setTutorialPhase` dispatches from DialogueOverlay's ink completion handlers; DialogueOverlay only calls `syncStateOut()` + emits `INK_DIALOGUE_END`. `useTutorialTrigger` handles the phase advancement.
- **Files modified:** `src/components/NPC/DialogueOverlay.jsx`
- **Verification:** Phase flow verified: word learned → ink dialogue → INK_DIALOGUE_END → learned_word phase
- **Committed in:** `eee61de` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug prevention)
**Impact on plan:** Essential correctness fix — prevents tutorial phase regression to 'awaiting_mentor' after path choice.

## Issues Encountered

- CinematicIntroSequencer discovery: The Phaser-native cinematic sequencer already dispatches `setTutorialPhase('awaiting_mentor')` directly (skipping 'path_choice') — the old React CinematicIntro.jsx that dispatched 'path_choice' is commented out in GameLayout. This meant `path_choice` tutorialPhase was already dead code for Phase 47+ players. The ink trigger was correctly placed at `SFX_WORDLEARNED` instead.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- PATH-01 and PATH-02 complete: Amira's path-choice ink dialogue is wired end-to-end
- `guide-amira-path.ink.json` compiled and available — any future ink story can follow the same pattern
- `INK_DIALOGUE_START`/`INK_DIALOGUE_END` event pair ready for reuse in future scripted ink dialogue sequences
- Phase 51-04 (first quest flow) can use the same `InkDialogueEngine.loadPathChoice()` pattern for other triggered dialogues

## Self-Check: PASSED

- src/data/ink-source/guide-amira-path.ink: FOUND
- src/data/ink/guide-amira-path.ink.json: FOUND
- Commit 0cfb566: FOUND
- Commit eee61de: FOUND

---
*Phase: 51-dialogue-foundation-learning-paths*
*Completed: 2026-03-20*
