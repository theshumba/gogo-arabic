---
phase: 47-cinematic-intro
plan: 02
subsystem: game-objects
tags: [phaser, arabic, word-discovery, fsrs, particle-effects, dialogue-box, tweens, redux]

# Dependency graph
requires:
  - phase: 47-cinematic-intro/47-01
    provides: CinematicIntroSequencer with _onPanComplete hook, DialogueBox wired in WorldScene

provides:
  - FloatingWordObject Phaser game object (glow + bob + SPACE interaction)
  - FSRS card dispatch on word discovery (q_0002: كِتَاب / book)
  - _spawnFloatingWord() in CinematicIntroSequencer — Beat 3 (INTRO-03)
  - onWordLearned hook in CinematicIntroSequencer — for Plan 47-03 wiring

affects:
  - 47-03 (Amira arrival — hooks via sequencer.onWordLearned)
  - vocabularySlice (addFsrsCard called with source: cinematic_intro)
  - playerSlice (incrementWordsLearned called on discovery)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - FloatingWordObject pattern: standalone Phaser class (not Phaser.GameObjects.Container subclass), owns tweens + destroy
    - Scene 'update' event listener pattern for per-frame proximity checks (registered/deregistered by sequencer)
    - World-position Graphics glow circle with yoyo alpha tween
    - createArabicText() for in-world Arabic word rendering

key-files:
  created:
    - src/game/objects/FloatingWordObject.js
  modified:
    - src/game/systems/CinematicIntroSequencer.js

key-decisions:
  - "FloatingWordObject uses scene.events.on('update', ...) pattern registered by sequencer — sequencer owns the listener lifecycle, not the object"
  - "PLAYER_UNFREEZE emitted in _spawnFloatingWord() — player walks naturally to the word, no forced movement"
  - "onWordLearned hook initialized in constructor as null — Plan 47-03 assigns it at sequencer creation time"
  - "DialogueBox advance() wired in WorldScene.update() already — FloatingWordObject does not need to wire SPACE for dialogue"

patterns-established:
  - "FloatingWordObject pattern: glow (Graphics) + arabicText (createArabicText) + englishText, all managed by a single class with destroy()"
  - "Sequencer owns update listener lifecycle: registers in _spawnFloatingWord(), deregisters in _onWordLearned() and cleanup()"

requirements-completed:
  - INTRO-03
  - INTRO-04
  - UX-01

# Metrics
duration: 18min
completed: 2026-03-19
---

# Phase 47 Plan 02: FloatingWordObject + Sequencer Wiring Summary

**Phaser-native gold word discovery object: pulsing glow + Arabic text bob tween + SPACE interact dispatching FSRS card and firing onWordLearned hook for Plan 47-03**

## Performance

- **Duration:** 18 min
- **Started:** 2026-03-19T11:10:00Z
- **Completed:** 2026-03-19T11:28:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- FloatingWordObject.js — standalone Phaser class with gold glow circle (Graphics, alpha 0.1–0.45 yoyo), Arabic word via createArabicText(), English label, vertical bob tween (±8px, 1200ms)
- SPACE proximity interaction (128px range): destroys visuals, fires particle burst (count 30, tint 0xd4a843), dispatches addFsrsCard + incrementWordsLearned, shows DialogueBox 'Word Found'
- CinematicIntroSequencer._onPanComplete() now calls _spawnFloatingWord() — spawns the word at world (896, 1088), registers scene 'update' listener, emits PLAYER_UNFREEZE
- onWordLearned hook exposed on sequencer — Plan 47-03 assigns this to trigger Amira arrival

## Task Commits

1. **Task 1: Create FloatingWordObject.js** - `0f3a93d` (feat)
2. **Task 2: Wire FloatingWordObject into CinematicIntroSequencer** - `7cab02c` (feat)

## Files Created/Modified

- `src/game/objects/FloatingWordObject.js` — New: FloatingWordObject class with glow, bob, SPACE interact, FSRS dispatch, DialogueBox show
- `src/game/systems/CinematicIntroSequencer.js` — Modified: import + FIRST_WORD constant + _floatingWord/_updateBound properties + _spawnFloatingWord() + _onWordLearned() + cleanup() update

## Decisions Made

- FloatingWordObject uses `scene.events.on('update', ...)` registered by the sequencer rather than registering in the object's own constructor — sequencer owns the listener lifecycle so cleanup is centralized in one place
- PLAYER_UNFREEZE fires in `_spawnFloatingWord()` — player should walk naturally to the word with no forced guidance (UX-01: zero menus, everything in-world, organic discovery)
- DialogueBox advance() is already wired in WorldScene.update() via SPACE/ENTER — FloatingWordObject's SPACE key check is purely for the proximity+interact trigger, not dialogue advancement

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- FloatingWordObject complete and tested structurally
- CinematicIntroSequencer._spawnFloatingWord() wired to _onPanComplete() — Beat 3 live
- sequencer.onWordLearned hook ready — Plan 47-03 assigns this callback to trigger Amira's arrival scene (Beat 5)
- Plan 47-03 can proceed immediately

## Self-Check: PASSED

- `src/game/objects/FloatingWordObject.js` — FOUND
- `src/game/systems/CinematicIntroSequencer.js` — FOUND
- `.planning/phases/47-cinematic-intro/47-02-SUMMARY.md` — FOUND
- Commit `0f3a93d` (Task 1) — FOUND
- Commit `7cab02c` (Task 2) — FOUND

---
*Phase: 47-cinematic-intro*
*Completed: 2026-03-19*
