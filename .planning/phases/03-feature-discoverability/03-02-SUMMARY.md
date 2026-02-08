---
phase: 03-feature-discoverability
plan: 02
subsystem: npc-dialogue
tags: [npc, dialogue, feature-discovery, contextual-hints, user-guidance]

# Dependency graph
requires:
  - phase: 02-player-guidance
    provides: NPC interaction system with dialogue trees and quest markers
provides:
  - Contextual NPC dialogue hints for Grammar, Roots, Reading, and Mini-Games features
  - Optional hint dialogue trees (trigger: "hint") accessible via player choice
  - 4 NPCs with feature-discovery dialogue paths
affects: [phase-04-onboarding, phase-05-daily-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Contextual feature discovery via NPC dialogue hints"
    - "Optional hint dialogue trees (never auto-selected, player-initiated only)"

key-files:
  created: []
  modified:
    - "src/data/npcs.json"

key-decisions:
  - "Hint trees use trigger 'hint' (never auto-selected, only reachable via player choice)"
  - "Each hint provides 3 lines of contextual dialogue mentioning the feature and how to access it"
  - "NPCs chosen based on thematic fit: scholar=grammar, librarian=roots, storyteller=reading, merchant=mini-games"

patterns-established:
  - "Feature discovery via contextual NPC hints (organic, not forced)"
  - "Hint dialogue trees as optional player-initiated content"

# Metrics
duration: 2min
completed: 2026-02-08
---

# Phase 3 Plan 2: NPC Feature Hints Summary

**4 NPCs now provide contextual dialogue hints for discovering Grammar, Roots, Reading, and Mini-Games features through optional player-initiated conversations**

## Performance

- **Duration:** 2 minutes
- **Started:** 2026-02-08T18:15:10Z
- **Completed:** 2026-02-08T18:18:03Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Scholar Yusuf mentions Grammar lessons through "Tell me about grammar lessons" dialogue choice
- Librarian Ibrahim mentions Word Roots exploration through "Tell me about word roots" dialogue choice
- Storyteller Noor mentions Reading passages through "Do you have stories to read?" dialogue choice
- Merchant Fatima mentions Mini-Games through "Are there practice games?" dialogue choice
- All hints are optional (player-initiated via dialogue choices, never forced into conversation flow)
- Each hint provides clear instructions on accessing the feature (pause menu → Activities)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add hint dialogue trees and choices to 4 NPCs** - `d6a726d` (feat)
2. **Task 2: Verify hint dialogue flow works end-to-end** - `068e95c` (test)

## Files Created/Modified
- `src/data/npcs.json` - Added 4 hint dialogue trees (hint_grammar, hint_roots, hint_reading, hint_minigames) and hint choices to return_default trees for Scholar Yusuf, Librarian Ibrahim, Storyteller Noor, and Merchant Fatima

## Decisions Made

**Hint tree trigger: "hint"**
- Ensures hints are never auto-selected by pickDialogueTree function
- Only reachable via player choice from return_default dialogue tree
- Maintains natural conversation flow (hints are optional, not forced)

**NPC selection based on thematic fit:**
- Scholar Yusuf (teaches alphabet/grammar) → Grammar lessons
- Librarian Ibrahim (teaches numbers, library zone) → Word Roots
- Storyteller Noor (teaches adjectives through stories) → Reading passages
- Merchant Fatima (teaches trade vocabulary) → Mini-Games

**3-line hint structure:**
- Line 1: Introduction/question about the feature
- Line 2: Benefit/description of the feature
- Line 3: Explicit instructions on how to access it (pause menu → Activities)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. The existing useDialogue.js `handleChoice` function already supported `choice.next` navigation (lines 258-266), so no code changes were needed beyond adding the hint trees and choices to npcs.json.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 3 Plan 3 (Battle system hints):**
- NPC hint pattern established and working
- Can extend to remaining NPCs for battle system discovery
- All 4 existing hints tested and verified

**Contribution to DISC-04 requirement:**
- DISC-04 requires 3+ features discoverable through contextual hints
- This plan delivers 4 features (Grammar, Roots, Reading, Mini-Games)
- All hints are contextual (thematically fit NPC roles) and optional (player choice)

## Self-Check: PASSED

All claims verified:
- ✓ Modified file exists: src/data/npcs.json
- ✓ Commits exist: d6a726d (Task 1), 068e95c (Task 2)
- ✓ All 4 NPCs have hint trees: hint_grammar, hint_roots, hint_reading, hint_minigames
- ✓ Build passes: npx vite build succeeds

---
*Phase: 03-feature-discoverability*
*Completed: 2026-02-08*
