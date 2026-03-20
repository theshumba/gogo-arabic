---
phase: 54-world-life-systems
plan: 02
subsystem: dialogue
tags: [redux, inkjs, gossip, npc, middleware, slice, ink, arabic-learning]

# Dependency graph
requires:
  - phase: 54-01
    provides: economySlice wiring and store patterns
  - phase: 53-01
    provides: factionMiddleware pattern (re-entrancy guard, pass-through-first) and npcSlice.friendship path
  - phase: 51-01
    provides: InkDialogueEngine._bindExternalFunctions pattern and EXTERNAL declaration requirement

provides:
  - gossipSlice with addGossipToken/markTokenHeard/pruneExpiredTokens/selectNpcTokens
  - gossipMiddleware with friendship-filtered token propagation (>= 25) and time-based pruning
  - 10 gossip templates with Arabic gossip lines + grammar notes (GOSSIP_TEMPLATES)
  - getGossipToken/markGossipHeard/getGossipGrammarNote EXTERNAL bindings in InkDialogueEngine
  - gossip_knot in 5 pilot ink NPCs: scholar-yusuf, guide-amira, librarian-ibrahim, merchant-fatima, student-khalid

affects: [54-03, 54-04, dialogue-system, npc-system, quest-system]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "gossipMiddleware re-entrancy guard (_isProcessingGossip) — same pattern as factionMiddleware"
    - "Gossip tokens as session-ephemeral Redux state (NOT persisted): gossip: gossipReducer outside whitelist"
    - "EXTERNAL ink functions reading gossip state: getGossipToken/markGossipHeard/getGossipGrammarNote"
    - "gossip_knot pattern in ink: check token -> optional branch -> deliver -> mark heard -> return to main"

key-files:
  created:
    - src/store/slices/gossipSlice.js
    - src/store/middleware/gossipMiddleware.js
    - src/data/gossipTemplates.js
  modified:
    - src/store/store.js
    - src/game/systems/InkDialogueEngine.js
    - src/data/ink-source/scholar-yusuf.ink
    - src/data/ink-source/guide-amira.ink
    - src/data/ink-source/librarian-ibrahim.ink
    - src/data/ink-source/merchant-fatima.ink
    - src/data/ink-source/student-khalid.ink
    - src/data/ink/scholar-yusuf.ink.json
    - src/data/ink/guide-amira.ink.json
    - src/data/ink/librarian-ibrahim.ink.json
    - src/data/ink/merchant-fatima.ink.json
    - src/data/ink/student-khalid.ink.json

key-decisions:
  - "gossip: gossipReducer NOT in root persistConfig whitelist — tokens are session-ephemeral; 3-day expiry means they reset correctly on page reload"
  - "gossipMiddleware appended after factionMiddleware in concat chain — ordering consistency"
  - "state.npc.friendship used (0-100 scale) for >= 25 threshold, NOT state.narrative.npcRelationships (0-5 tier)"
  - "Grammar annotations as bracketed text [{gossip_grammar}] in ink — passes through DialogueOverlay unchanged since it renders currentInkLine directly in <p> tag without stripping brackets"

patterns-established:
  - "Gossip knot pattern: VAR gossip_line + VAR gossip_grammar at top, check before -> main, gossip_knot delivers line + grammar + markGossipHeard + returns to main"
  - "EXTERNAL declarations added to existing ink files: always append after existing EXTERNALs, add VARs after existing VARs"

requirements-completed: [GOSP-01, GOSP-02, GOSP-03, GOSP-04, GOSP-05]

# Metrics
duration: 25min
completed: 2026-03-20
---

# Phase 54 Plan 02: Gossip System Summary

**Redux gossip token system + InkDialogueEngine EXTERNAL bindings delivering quest-aware Arabic gossip with grammar annotations through natural ink dialogue in 5 pilot NPCs**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-03-20T22:29:00Z
- **Completed:** 2026-03-20T22:54:00Z
- **Tasks:** 2 of 2
- **Files modified:** 13

## Accomplishments

- gossipSlice: in-memory npcTokens store (max 2/NPC), addGossipToken/markTokenHeard/pruneExpiredTokens/selectNpcTokens
- gossipMiddleware: creates tokens on quest completion (GOSSIP_TEMPLATES lookup) and notable friendship changes (delta > 5), propagates only to NPCs with friendship >= 25, prunes on time advance
- 10 gossip templates covering 10 quest archetypes: each with Arabic past-tense sentence + English hint + grammar note
- InkDialogueEngine: three new EXTERNAL bindings (getGossipToken, markGossipHeard, getGossipGrammarNote) reading live gossip state
- 5 pilot ink NPCs: scholar-yusuf, guide-amira, librarian-ibrahim, merchant-fatima, student-khalid all have gossip_knot; tokens surface as first lines before entering main knot
- All ink files compile clean (11 files); build exits 0

## Task Commits

Each task was committed atomically:

1. **Task 1: Create gossipSlice + gossipMiddleware + gossipTemplates + wire into store** - `8c7dce8` (feat)
2. **Task 2: Bind gossip EXTERNAL functions in InkDialogueEngine + add gossip knots to 5 pilot ink NPCs** - `5a1111c` (feat)

## Files Created/Modified

- `src/store/slices/gossipSlice.js` - In-memory gossip token storage; addGossipToken/markTokenHeard/pruneExpiredTokens/selectNpcTokens
- `src/store/middleware/gossipMiddleware.js` - Token creation on quest complete + friendship propagation + time-based pruning
- `src/data/gossipTemplates.js` - 10 quest completion templates with arabicLine + englishHint + grammarNote
- `src/store/store.js` - gossip: gossipReducer (NOT persisted) added to rootReducer; gossipMiddleware appended after factionMiddleware
- `src/game/systems/InkDialogueEngine.js` - Imports markTokenHeard + selectDayCount; binds getGossipToken/markGossipHeard/getGossipGrammarNote
- `src/data/ink-source/scholar-yusuf.ink` - EXTERNAL declarations + VAR gossip_line/gossip_grammar + gossip_knot
- `src/data/ink-source/guide-amira.ink` - Same gossip_knot pattern
- `src/data/ink-source/librarian-ibrahim.ink` - Same gossip_knot pattern
- `src/data/ink-source/merchant-fatima.ink` - Same gossip_knot pattern
- `src/data/ink-source/student-khalid.ink` - Same gossip_knot pattern
- `src/data/ink/*.ink.json` - Recompiled from updated .ink sources (5 files)

## Decisions Made

- **gossip NOT persisted**: Tokens are session-ephemeral by design (3-day expiry means they naturally expire; resetting on page reload is acceptable and avoids stale token contamination)
- **state.npc.friendship for propagation threshold**: npcSlice has 0-100 friendship scale; narrativeSlice has 0-5 tier; plan explicitly requires npc.friendship >= 25
- **Grammar annotations as `[{gossip_grammar}]` brackets**: DialogueOverlay renders ink `currentInkLine` directly in a `<p>` tag without any text filtering, so brackets pass through untouched — no changes to DialogueOverlay needed

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

- Gossip system fully wired; any quest completion with a matching GOSSIP_TEMPLATES key will propagate tokens to eligible NPCs
- 5 pilot ink NPCs will surface gossip as their opening lines when tokens are present
- New quest completions can be added to GOSSIP_TEMPLATES without code changes
- Grammar annotations visible in DialogueOverlay ink rendering path

---
*Phase: 54-world-life-systems*
*Completed: 2026-03-20*
