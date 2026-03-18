---
phase: 45-quest-storylines
plan: "01"
subsystem: content
tags: [quests, narrative, dialogue, npc, arabic, story-arcs, rpg]

# Dependency graph
requires:
  - phase: 44-npc-dialogue-expansion
    provides: Dialogue engine with quest_start/quest_complete/story_flag effects, culturalNote, teachWord pipeline
provides:
  - 8-act main storyline quests (act_1 through act_8) in quests.json, type main_story, chained by prerequisites
  - 16 STORY_ACT_ARCS dialogue objects in npcStoryArcs.js (8 start + 8 complete arcs, one per act NPC)
  - Full QUEST-01 narrative spine: time-traveling scholar collecting manuscript pages across all 8 zones
affects: [46-vocabulary-expansion, quest-system, narrative-engine, npcStoryArcs, questSlice]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "STORY_ACT_ARCS array in npcStoryArcs.js: standalone arc objects separate from NPC_EXTRA_DIALOGUE_TREES"
    - "Arc condition chains: act_1 uses quest completion gate; acts 2-8 use storyFlag act_N_complete"
    - "teachWord on final start arc line teaches zone-thematic vocabulary before quest begins"
    - "Completion arcs use storyFlag + quest_complete + relationship_change as triple effect"

key-files:
  created: []
  modified:
    - src/data/quests.json
    - src/data/npcStoryArcs.js

key-decisions:
  - "act_8 npcGiver uses vizier-abbas (royal_palace) not scholar-yusuf (oasis_village) since scholar-yusuf has no presence in royal_palace zone"
  - "STORY_ACT_ARCS added as new exported array, not merged into NPC_EXTRA_DIALOGUE_TREES, keeping act arcs separate from relationship-gated personal trees"
  - "Completion arc condition requires both quest:active AND storyFlag milestone_reached — dual-gate prevents premature completion"
  - "act_1 prerequisite is words_of_oasis (zone-1 mastery gate) not master_of_letters, per plan correction"

patterns-established:
  - "Story arc objects: id, npcId, condition, lines array with Arabic/English/transliteration/teachWord/effects"
  - "Quest chain: each act_N+1 has prerequisites: [act_N_quest_id] creating single linear dependency chain"
  - "Lore field on each quest: one-sentence Islamic Golden Age historical context verifiable fact"

requirements-completed:
  - QUEST-01

# Metrics
duration: 7min
completed: 2026-03-18
---

# Phase 45 Plan 01: Quest Storylines — Main Narrative Spine Summary

**8-act time-traveling scholar manuscript quest chain in quests.json (QUEST-01) with 16 culturally-grounded NPC dialogue arcs in npcStoryArcs.js spanning all 8 zones**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-03-18T13:02:02Z
- **Completed:** 2026-03-18T13:09:21Z
- **Tasks:** 2/2
- **Files modified:** 2

## Accomplishments

- 8 `main_story` quest entries (act_1 through act_8) appended to quests.json, each with storyAct 1-8, distinct zone, prerequisite chain, story-motivated objectives, Arabic title/description, lore field, storyFlag, and xp/dirhams reward scaling with act number
- 16 STORY_ACT_ARCS dialogue objects added to npcStoryArcs.js: one start arc and one completion arc per act NPC, with culturally-grounded Arabic dialogue, teachWord on final start line, and proper quest_start/quest_complete/story_flag effects
- Full QUEST-01 prerequisite chain established: words_of_oasis → act_1 → act_2 → ... → act_8, covering oasis_village, ancient_library, desert_marketplace, farmland, bedouin_camp, mountain_village, coastal_port, royal_palace

## Task Commits

Each task was committed atomically:

1. **Task 1: Add 8-act main storyline to quests.json** - `1a74dde` (feat)
2. **Task 2: Add act dialogue trees to npcStoryArcs.js** - `6e17a51` (feat)

**Plan metadata:** *(docs commit follows)*

## Files Created/Modified

- `src/data/quests.json` — 8 new main_story quest entries appended (act_1 through act_8); 64 → 72 total quests
- `src/data/npcStoryArcs.js` — STORY_ACT_ARCS array added with 16 arc objects; exported alongside NPC_STORY_ARC_META and NPC_EXTRA_DIALOGUE_TREES

## Decisions Made

- **act_8 NPC is vizier-abbas, not scholar-yusuf:** scholar-yusuf lives in oasis_village; royal_palace NPCs are vizier-abbas, princess-aisha, poet-rumi, imam-muhammad. vizier-abbas as first NPC in the zone is the palace gatekeeper and most narratively appropriate for the act_8 grand finale.
- **STORY_ACT_ARCS is a new top-level export:** Kept separate from NPC_EXTRA_DIALOGUE_TREES (which appends to individual NPC dialogue trees). Act arcs are structured differently — they are standalone arc condition objects consumed by DialogueEngine when evaluating arc conditions per NPC interaction.
- **Dual-gate completion condition:** Each completion arc requires both `quest: active` AND `storyFlag: act_N_milestone_reached` to prevent premature quest completion when NPC is visited before objective is done.

## Deviations from Plan

None — plan executed exactly as written. act_8 NPC selection (vizier-abbas as royal_palace fallback) was explicitly anticipated by the plan's "fall back to first NPC in that zone" instruction.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- QUEST-01 complete: all 8 acts available as quest chain, narrative spine established
- questSlice.js will handle act completion tracking via storyFlag (act_N_complete) already in place
- Phase 45 Plan 02 can now add branching (Scholar/Traveler/Historian path divergence at act_5)
- Vocabulary expansion (Phase 46) can reference act quest ids for context-linked word sets

## Self-Check: PASSED

- src/data/quests.json: FOUND
- src/data/npcStoryArcs.js: FOUND
- .planning/phases/45-quest-storylines/45-01-SUMMARY.md: FOUND
- Commit 1a74dde (Task 1): FOUND
- Commit 6e17a51 (Task 2): FOUND
- Commit 3e89156 (metadata): FOUND

---
*Phase: 45-quest-storylines*
*Completed: 2026-03-18*
