---
phase: 64-cefr-reports-social-sharing
plan: 02
subsystem: narrative-dialogue
tags: [ink-dialogue, cefr, milestone, amira, middleware, eventbus]
dependency_graph:
  requires: [cefrProgressSlice, worldStateSlice, InkDialogueEngine, learningProgressMiddleware]
  provides: [guide-amira-cefr.ink, guide-amira-cefr.ink.json, CEFR_MILESTONE_REACHED event, setFlag ink binding, loadForNpcWithContext method]
  affects: [DialogueOverlay, InkDialogueEngine, learningProgressMiddleware]
tech_stack:
  added: []
  patterns: [ink-dialogue, eventbus-middleware-emit, context-variable-injection]
key_files:
  created:
    - src/data/ink-source/guide-amira-cefr.ink
    - src/data/ink/guide-amira-cefr.ink.json
  modified:
    - src/store/middleware/learningProgressMiddleware.js
    - src/game/systems/InkDialogueEngine.js
    - src/utils/eventBusTypes.js
    - src/components/NPC/DialogueOverlay.jsx
    - src/test/testUtils.jsx
decisions:
  - "CEFR_MILESTONE_REACHED event (not INK_DIALOGUE_START) from middleware — middleware cannot create async InkDialogueEngine; event carries npcId+context for DialogueOverlay to load engine"
  - "setFlag ink external binding added to InkDialogueEngine — ink scripts call ~ setFlag(key) which dispatches to worldStateSlice"
  - "loadForNpcWithContext(npcId, context) method — injects context variables after load, before syncStateIn overwrites them"
  - "cefrProgressReducer added to testUtils.jsx — shared test store missing slice, caused 12 HUD test failures from parallel Plan 01 changes"
metrics:
  duration: 5 minutes
  completed: 2026-03-23
---

# Phase 64 Plan 02: Scholar's Scroll CEFR Milestone Dialogue Summary

Scholar's Scroll ink dialogue for Amira (guide-amira-cefr.ink) with 4 CEFR milestone knots (A1-B2), compiled to JSON, with learningProgressMiddleware triggering Amira's celebratory Arabic dialogue once per level via EventBus.

## What Was Built

### Task 1: Scholar's Scroll ink dialogue source + compile

Created `src/data/ink-source/guide-amira-cefr.ink` with 4 milestone knots:
- `milestone_a1`: مبروك يا صديقي! — +10 relationship, sets `cefr_milestone_a1_shown`
- `milestone_a2`: ما شاء الله! — +15 relationship, sets `cefr_milestone_a2_shown`
- `milestone_b1`: يا سلام! — +20 relationship, sets `cefr_milestone_b1_shown`
- `milestone_b2`: لا أصدق! — +25 relationship, sets `cefr_milestone_b2_shown`

Each knot has: Arabic congratulations line, English context line, Arabic detail line, 2 player response choices in Arabic.

Compiled to `src/data/ink/guide-amira-cefr.ink.json` (4658 bytes). All 12 existing ink files recompiled with zero regressions.

### Task 2: CEFR milestone dialogue trigger wiring

**`learningProgressMiddleware.js`** — new `cefrProgress/setCefrLevel` case:
- Extracts `level` from `action.payload.level`
- Checks `worldState.flags[cefr_milestone_${level.toLowerCase()}_shown]` — if set, skips (once-per-level guard)
- Emits `EventBus.emit(EVENTS.CEFR_MILESTONE_REACHED, { npcId: 'guide-amira-cefr', context: { cefr_level: level } })`

**`InkDialogueEngine.js`** — three additions:
1. `setFlag` external binding: ink `~ setFlag("key")` dispatches `setFlag({ key, value: true })` to worldStateSlice
2. `syncStateIn` extended: syncs `cefr_level` from `state.cefrProgress?.currentLevel`
3. `loadForNpcWithContext(npcId, context)` method: calls `loadForNpc` then injects context variables into `variablesState`

**`eventBusTypes.js`** — added `CEFR_MILESTONE_REACHED: 'react:cefr:milestone-reached'`

**`DialogueOverlay.jsx`** — new `useEffect` listens for `CEFR_MILESTONE_REACHED`:
- Creates `new InkDialogueEngine(null, null)` (null scene, matching useTutorialTrigger pattern)
- Calls `engine.loadForNpcWithContext(milestoneNpcId, context)` async
- Emits `INK_DIALOGUE_START` with loaded engine + Amira npcData to trigger existing dialogue UI

**`testUtils.jsx`** — added `cefrProgressReducer` to shared test store

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Added setFlag external binding to InkDialogueEngine**
- **Found during:** Task 1 — ink script calls `~ setFlag("cefr_milestone_a1_shown")` but `setFlag` was not bound as external
- **Issue:** Without the binding, inkjs throws a runtime error when the milestone knot fires
- **Fix:** Added `BindExternalFunction('setFlag', ...)` that dispatches to worldStateSlice
- **Files modified:** `src/game/systems/InkDialogueEngine.js`
- **Commit:** 9a0ccfe

**2. [Rule 1 - Bug] Used CEFR_MILESTONE_REACHED event instead of plan's NPC_DIALOGUE_START**
- **Found during:** Task 2 — `EVENTS.NPC_DIALOGUE_START` does not exist in eventBusTypes.js; `INK_DIALOGUE_START` requires a pre-loaded engine object (not just npcId + context)
- **Issue:** Middleware cannot create async `InkDialogueEngine` (browser-only Phaser dependency, async load)
- **Fix:** Added `CEFR_MILESTONE_REACHED` event; middleware emits it with `npcId` + `context`; `DialogueOverlay` handles it by loading the engine then re-emitting `INK_DIALOGUE_START` — same pattern as `useTutorialTrigger.js`
- **Files modified:** `src/utils/eventBusTypes.js`, `src/components/NPC/DialogueOverlay.jsx`, `src/store/middleware/learningProgressMiddleware.js`
- **Commit:** 9a0ccfe

**3. [Rule 2 - Missing critical functionality] Added cefrProgressReducer to shared test store**
- **Found during:** Task 2 verification (`npx vitest run`)
- **Issue:** Parallel Plan 01 agent added `selectCefrLevel` to HUD.jsx but did not add `cefrProgress` to `testUtils.jsx` — caused 12 HUD test failures (`state.cefrProgress.currentLevel` undefined)
- **Fix:** Added `cefrProgressReducer` import + slice registration to `testUtils.jsx`
- **Files modified:** `src/test/testUtils.jsx`
- **Commit:** 9a0ccfe

## Test Results

- 1421 tests passing (1422 total)
- 1 pre-existing failure: `HUD Component > should render achievement panel when achievement button is clicked` — not caused by this plan; existed before plan 64-02 started

## Self-Check: PASSED

- `src/data/ink-source/guide-amira-cefr.ink` — EXISTS
- `src/data/ink/guide-amira-cefr.ink.json` — EXISTS (4658 bytes)
- Commit 52558ca — EXISTS
- Commit 9a0ccfe — EXISTS
- `grep 'cefrProgress/setCefrLevel' src/store/middleware/learningProgressMiddleware.js` — FOUND
- `grep 'cefr_milestone' src/store/middleware/learningProgressMiddleware.js` — FOUND
- `grep 'guide-amira-cefr' src/store/middleware/learningProgressMiddleware.js` — FOUND
