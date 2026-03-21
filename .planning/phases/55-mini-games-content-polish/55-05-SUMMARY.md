---
phase: 55-mini-games-content-polish
plan: 05
subsystem: ui
tags: [react, redux, phaser, poetry, npc, middleware, eventbus]

# Dependency graph
requires:
  - phase: 55-04
    provides: poetrySlice + poetryBattle service + 10 poems data

provides:
  - PoetryBattleOverlay React component (untimed fill-in-blank UI with 4 choices)
  - 8 NPC poet entries in npcs.json (1 per zone, schema-valid)
  - ActionSetExecutor poetry:start-battle action type
  - GameLayout POETRY_BATTLE_START/END EventBus wiring with PLAYER_FREEZE/UNFREEZE
  - poetryRewardsMiddleware — addXP(50) + addFsrsCard on win + SFX_QUEST
  - Full end-to-end poetry battle flow from NPC interaction to reward grant

affects: [56, 57, quest-system, npc-system, vocabulary-system]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Pre-reducer state read in middleware (read storeAPI.getState() before next(action) to capture activeBattle before endPoetryBattle nulls it)
    - Schema-valid poet NPCs: all npcs.json entries must have greeting.arabic/english + dialogueTrees[] regardless of NPC type
    - poetryBattleData state in GameLayout: null = no battle, truthy = render PoetryBattleOverlay

key-files:
  created:
    - src/components/Poetry/PoetryBattleOverlay.jsx
    - src/components/Poetry/PoetryBattleOverlay.module.css
    - src/store/middleware/poetryRewardsMiddleware.js
  modified:
    - src/data/npcs.json
    - src/game/systems/ActionSetExecutor.js
    - src/components/Router/GameLayout.jsx
    - src/store/store.js

key-decisions:
  - "poetryRewardsMiddleware uses addXP (not gainXP) — matches actual playerSlice action export"
  - "NPC poets require schema-valid greeting.arabic/english + dialogueTrees[] for Vite validation plugin — actionSets kept as custom passthrough field"
  - "dialogue in npcs.json kept as text key in dialogueTrees[].id matching the actionSet dialogueKey for speech action routing"
  - "PLAYER_FREEZE emitted on POETRY_BATTLE_START, PLAYER_UNFREEZE on POETRY_BATTLE_END — keeps movement halted during overlay"

patterns-established:
  - "Pre-reducer state capture: read storeAPI.getState() before next(action) in middleware when action reducer nulls the relevant slice"
  - "Poet NPC schema: greeting (arabic/english/transliteration) + dialogueTrees with 1 tree matching actionSets speech dialogueKey"

requirements-completed: [POET-04, POET-05]

# Metrics
duration: 45min
completed: 2026-03-21
---

# Phase 55 Plan 05: Poetry Battle UI + NPC Wiring Summary

**Untimed fill-in-blank poetry battle with 8 NPC poets across all zones — PoetryBattleOverlay React overlay, ActionSetExecutor routing, GameLayout wiring, and middleware XP/FSRS rewards**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-03-21T00:00:00Z
- **Completed:** 2026-03-21T00:45:00Z
- **Tasks:** 2 (Task 1 completed by previous agent session, Task 2 completed in this session)
- **Files modified:** 7

## Accomplishments

- PoetryBattleOverlay.jsx (385 lines) — full-screen RTL Arabic overlay with fill-in-blank verse display, 4 choice buttons, NPC scoring comparison panel, win/lose result banner, and XP/vocabulary reward list — no timer anywhere (POET-04 compliant)
- 8 NPC poets placed across all game zones (oasis, library, market, desert, ruins, caves, coast, mountain) with thematic Arabic dialogue and configurable accuracy (0.5 beginner to 0.85 master)
- ActionSetExecutor handles `poetry:start-battle` action type via POETRY_BATTLE_START EventBus emit
- GameLayout listens for POETRY_BATTLE_START/END, dispatches startPoetryBattle to Redux, manages poetryBattleData state, and freezes/unfreezes player movement
- poetryRewardsMiddleware intercepts `poetry/endPoetryBattle` on win: addXP(50) + addFsrsCard for correctly answered words + SFX_QUEST victory sound
- Vite build passes including npcs.json dialogue schema validation

## Task Commits

1. **Task 1: PoetryBattleOverlay React component + CSS module** - `c4f849a` (feat) — completed by previous agent session
2. **Task 2: NPC poets + ActionSetExecutor + GameLayout + poetryRewardsMiddleware** - `340493d` (feat)

## Files Created/Modified

- `src/components/Poetry/PoetryBattleOverlay.jsx` — Full RTL poetry battle overlay component
- `src/components/Poetry/PoetryBattleOverlay.module.css` — Dark theme styling with `.overlay`, `.choicesGrid`, `.scorePanel` classes
- `src/data/npcs.json` — 8 new NPC poet entries (1 per zone) with schema-valid greeting/dialogueTrees/actionSets
- `src/game/systems/ActionSetExecutor.js` — Added `poetry:start-battle` case with EventBus emit
- `src/components/Router/GameLayout.jsx` — Lazy PoetryBattleOverlay import, POETRY_BATTLE_START/END event handlers, PLAYER_FREEZE/UNFREEZE, poetryBattleData state
- `src/store/middleware/poetryRewardsMiddleware.js` — New middleware for XP + FSRS rewards on win
- `src/store/store.js` — poetryRewardsMiddleware imported and appended to middleware chain

## Decisions Made

- `poetryRewardsMiddleware` uses `addXP(50)` (the actual playerSlice export), not `gainXP` as the plan mentioned — verified against playerSlice.js
- Pre-reducer state capture pattern: reading `storeAPI.getState()` before `next(action)` because `endPoetryBattle` reducer nulls `activeBattle` immediately
- NPC poet npcs.json entries include both the schema-required `greeting`/`dialogueTrees` fields AND the data-driven `actionSets` object (passthrough allowed via Zod `.passthrough()`)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] NPC poet entries lacked required greeting/dialogueTrees fields causing Vite build failure**
- **Found during:** Task 2 (build verification step)
- **Issue:** The 8 NPC poet entries used `dialogue.greeting.lines[]` (custom format) and had no `greeting.arabic/english` or `dialogueTrees` fields. The `dialogueSchema.js` Vite validation plugin requires all NPC entries to have `greeting: { arabic, english }` and `dialogueTrees: [{ id, lines: [...] }]` with at least 1 entry. Build error: `[56.greeting] Invalid input: expected object, received undefined` × 8 poets.
- **Fix:** Added schema-compliant `greeting` (with `arabic`, `english`, `transliteration`) and `dialogueTrees` (single tree per poet with Arabic + English lines) to each of the 8 poet NPCs. The original `dialogue` and `actionSets` fields were preserved as passthrough extras.
- **Files modified:** `src/data/npcs.json`
- **Verification:** `npm run build` succeeded with `[validate-dialogue] NPC data validated successfully`
- **Committed in:** `340493d` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Essential for build compliance. No scope creep. The fix made poet NPCs fully schema-compatible while preserving all poetry-battle action wiring.

## Issues Encountered

- Task 2 files were already partially written as uncommitted changes when this agent session started (previous agent had done some wiring). All changes were verified correct, schema fix applied, then committed together.

## Next Phase Readiness

- Complete poetry battle flow is wired end-to-end: NPC interaction → ActionSetExecutor → POETRY_BATTLE_START → GameLayout → Redux → PoetryBattleOverlay → poetryRewardsMiddleware
- Phase 55 (mini-games-content-polish) is now complete — all 5 plans done
- Phase 56 can begin; poetry system provides vocabulary reinforcement via FSRS and XP rewards

---
*Phase: 55-mini-games-content-polish*
*Completed: 2026-03-21*
