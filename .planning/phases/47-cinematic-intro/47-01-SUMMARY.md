---
phase: 47-cinematic-intro
plan: "01"
subsystem: ui
tags: [phaser, cinematic, onboarding, arabic-text, camera, animation]

# Dependency graph
requires:
  - phase: 42-visual-overhaul
    provides: createArabicText() + DialogueBox at depth 10000 — crawl placed at depth 9800 below it
  - phase: 44-content-depth
    provides: guide-amira dialogue trees and tutorialPhase/onboardingComplete in playerSlice
  - phase: 38-visual-overhaul
    provides: DayNightCycle overlay (depth 9000, MULTIPLY blend) with 0xffdca8 dawn tint

provides:
  - CinematicIntroSequencer class with 7 methods: run(), _applyDawnTint(), _startTextCrawl(), _fadeOutCrawl(), _skipCrawl(), _startCameraPan(), _onPanComplete()
  - Text crawl: 10 CRAWL_LINES (Arabic + English), depth 9800, scroll-factor 0, 500ms stagger, skip on pointer/SPACE
  - Camera sequence: 1500ms fade-in from black → dawn tint (0xffdca8, alpha 0.3) → 2500ms pan to oasis_village spawn (14*64, 20*64)
  - PLAYER_FREEZE at sequence start, PLAYER_UNFREEZE in cleanup()
  - onPanComplete hook for Plan 47-02 FloatingWordObject integration
  - WorldScene wired: introSequencer triggered in create() after SCENE_READY, cleaned up in shutdown()
  - GameLayout: React <CinematicIntro /> bypassed (commented out, import kept on disk)

affects:
  - 47-02 (FloatingWordObject must hook via introSequencer.onPanComplete)
  - 47-03 (Path choice beat wires in after FloatingWordObject interaction)
  - Any future onboarding flow changes must update tutorialPhase guard in WorldScene.create()

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Phaser-native cinematic (no React DOM overlay): text at depth 9800, setScrollFactor(0), alpha tweens
    - Timer tracking pattern: all delayedCall() refs stored in this._timers[] for individual cancellation in skip
    - Pan hook pattern: sequencer.onPanComplete = () => { ... } for cross-plan chaining without coupling

key-files:
  created:
    - src/game/systems/CinematicIntroSequencer.js
  modified:
    - src/game/scenes/WorldScene.js
    - src/components/Router/GameLayout.jsx

key-decisions:
  - "Depth 9800 for crawl text — below DialogueBox (10000) and above DayNightCycle overlay (9000)"
  - "Per-timer cancel in _skipCrawl() via this._timers[].remove(false) — avoids removeAllEvents() which would break other scene timers"
  - "onPanComplete callback hook (not EventBus) for Plan 47-02 — sequencer owns its lifecycle, no public event name coupling"
  - "CinematicIntro import left in GameLayout.jsx (not deleted) — bypass via comment per UX-02 constraint"
  - "Guard placed AFTER EventBus.emit(EVENTS.SCENE_READY) — all systems ready before sequencer.run() calls PLAYER_FREEZE"

patterns-established:
  - "Phaser cinematic pattern: freeze player → Phaser-only rendering → hook for next beat → unfreeze in cleanup()"
  - "Multi-beat sequencer pattern: constructor initializes hooks as null, Plans 47-02/03 assign them before run()"

requirements-completed:
  - INTRO-01
  - INTRO-02
  - UX-01

# Metrics
duration: 2min
completed: "2026-03-19"
---

# Phase 47 Plan 01: Cinematic Intro Sequencer Summary

**Phaser-native text crawl (10 lines, Arabic + English) with 1500ms camera fade-in, dawn tint (0xffdca8), and 2500ms pan to oasis_village spawn — React CinematicIntro bypassed**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-19T11:04:42Z
- **Completed:** 2026-03-19T11:07:03Z
- **Tasks:** 2
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments
- Created CinematicIntroSequencer.js with all 7 required methods, skip logic, and PLAYER_FREEZE/UNFREEZE lifecycle
- Wired sequencer into WorldScene.create() with onboardingComplete + tutorialPhase guard, and shutdown() cleanup
- Bypassed React <CinematicIntro /> in GameLayout.jsx (comment replaces JSX element; import kept per UX-02)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create CinematicIntroSequencer.js (text crawl + camera fade + dawn pan)** - `f1cfb4f` (feat)
2. **Task 2: Wire sequencer into WorldScene.create() + bypass React CinematicIntro in GameLayout** - `a07403d` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `src/game/systems/CinematicIntroSequencer.js` — Full orchestrator: text crawl, camera fade, dawn tint, pan, skip, cleanup
- `src/game/scenes/WorldScene.js` — Import, constructor init (introSequencer = null), create() trigger, shutdown() cleanup
- `src/components/Router/GameLayout.jsx` — Line 286: `<CinematicIntro />` replaced by comment; import preserved

## Decisions Made
- Depth 9800 for crawl text: below DialogueBox (10000), above DayNightCycle overlay (9000) — correct Z-order
- Per-timer cancellation in `_skipCrawl()` via `this._timers[].remove(false)` — avoids `removeAllEvents()` which would break other scene timers
- `onPanComplete` callback (not EventBus event) for Plan 47-02 hook — sequencer owns its lifecycle cleanly
- CinematicIntro import left in GameLayout.jsx, not deleted — bypass via comment per UX-02 constraint
- Sequencer trigger placed after `EventBus.emit(EVENTS.SCENE_READY)` — ensures all systems initialized before freeze

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness
- Plan 47-02 can wire in immediately via `this.introSequencer.onPanComplete = () => { ... }` in WorldScene after the sequencer is created
- `cinematic:pan_complete` EventBus event also emitted at pan end for any loose listeners
- Plans 47-02 and 47-03 complete the remaining 3 beats (FloatingWordObject + path choice)

---
*Phase: 47-cinematic-intro*
*Completed: 2026-03-19*

## Self-Check: PASSED
