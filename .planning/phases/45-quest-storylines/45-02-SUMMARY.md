---
phase: 45-quest-storylines
plan: "02"
subsystem: content
tags: [quests, side-quests, companions, npcs, dialogue, arabic-learning, fsrs]

# Dependency graph
requires:
  - phase: 44-npc-dialogue-expansion
    provides: expanded dialogue tree format + teachWord/effects pipeline verified
  - phase: 45-quest-storylines plan 01
    provides: main story quest structure and zone quest ids used as prerequisites
provides:
  - 16 side quests (2/zone × 8 zones) embedded with narrative Arabic-learning objectives
  - 12 companion personal quests with relationshipIncrease rewards
  - 12 companion NPC entries in npcs.json with personal_quest start/complete dialogue trees
affects: [QuestSystem, CompanionSystem, NarrativeSlice, DialogueEngine, FSRSPipeline]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "side_quest type with narrative objectives (not bare vocabulary tasks)"
    - "companion_quest type with relationshipIncrease: 2 reward field"
    - "personal_quest_{name} / personal_quest_{name}_complete dialogue tree pair per companion"
    - "teachWords array on quest objects as informational reference for NPC dialogue"

key-files:
  created: []
  modified:
    - src/data/quests.json
    - src/data/npcs.json

key-decisions:
  - "Companion NPCs added as new NPC entries in npcs.json (not embedded elsewhere) — consistent with existing NPC format"
  - "Companion zones mapped to base 8 zones: sacred_library→ancient_library, coastal_town→coastal_port, desert_market→desert_marketplace, mountain_pass/ancient_ruins→mountain_village/royal_palace"
  - "storyFlag condition keys follow zone_completion_quest_id + '_complete' pattern for engine readability"
  - "personal_quest_complete trees use quest_complete + relationship_change + teach_word effects to satisfy questMiddleware and FSRSPipeline"

patterns-established:
  - "Side quest NPC givers use full NPC id (scholar-yusuf, not scholar) for unambiguous lookup"
  - "Companion quest dialogue opening line uses companion's catchphrase (companions.js personality.catchphrase)"
  - "teachWords on quest = informational array; teach_word effects on dialogue lines = actual FSRS trigger"

requirements-completed: [QUEST-02, QUEST-03]

# Metrics
duration: 22min
completed: 2026-03-18
---

# Phase 45 Plan 02: Side Quests + Companion Quests Summary

**28 new quests shipped: 16 narrative side quests (2/zone) and 12 companion personal quests with FSRS-linked dialogue trees and relationship rewards**

## Performance

- **Duration:** ~22 min
- **Started:** 2026-03-18T12:52:00Z
- **Completed:** 2026-03-18T13:14:50Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- 16 side quests across all 8 zones — each has Arabic learning embedded as narrative action (blessing rituals, translation tasks, recitation ceremonies) not bare vocabulary objectives
- 12 companion personal quests in quests.json — each with 3 narrative objectives, `reward.relationshipIncrease: 2`, and `teachWords` array
- 12 companion NPC entries added to npcs.json — each with `personal_quest_{name}` (quest_start) and `personal_quest_{name}_complete` (quest_complete + relationship_change + teach_word x2) dialogue trees
- Total quests: 100 (was 88 after 45-01 main story quests)
- Build passes, JSON valid

## Task Commits

Each task was committed atomically:

1. **Task 1: Add 16 side quests (2/zone) to quests.json** - `de3b883` (feat)
2. **Task 2: Add 12 companion personal quests + NPC dialogue trees** - `70717ef` (feat)

## Files Created/Modified
- `/Users/theshumba/Documents/GitHub/gogo-arabic/src/data/quests.json` - +28 quests (16 side_quest + 12 companion_quest), now 100 total
- `/Users/theshumba/Documents/GitHub/gogo-arabic/src/data/npcs.json` - +12 companion NPC entries each with 2 dialogue trees (personal_quest + personal_quest_complete), now 56 NPCs

## Decisions Made

**Companion zone mapping:** companions.js uses zone names that differ slightly from zones.js (e.g. `sacred_library` vs `ancient_library`, `coastal_town` vs `coastal_port`, `desert_market` vs `desert_marketplace`). Mapped each companion to the closest base 8 zone and used the corresponding prerequisite.

**companion_fatima and companion_tariq (ancient_ruins):** Neither has a zone in the base 8 — `ancient_ruins` is referenced but doesn't exist as a standalone zone. Mapped both to `royal_palace` with `["master_of_arabic"]` prerequisite, fitting their archaeologist/defender roles in the late-game world.

**Full NPC entries vs. bare dialogue-tree injection:** Added companions as complete NPC objects (with id, name, portrait, role, greeting, dialogueTrees) rather than attempting to inject dialogue into non-existent existing companion entries. This is consistent with the existing npcs.json NPC format and the DialogueEngine lookup pattern.

## Deviations from Plan

**1. [Rule 1 - Deviation from count expectation] Total quests 100, not 92**
- The plan's verification script expected 92 total quests. The discrepancy is because 45-01 (main story quests, 8 acts) ran before 45-02 and added 8 quests to the file, bringing the pre-task-1 total from 64 to 72. After 45-02: 72 + 16 side + 12 companion = 100. This is correct — the plan's "expected 92" figure was based on the 64-quest baseline in the 45-02-PLAN.md context, before 45-01 had run. No fix needed.

## Issues Encountered

The file had been modified since planning (45-01 main story quests added). The edit tool detected this on the first append attempt. Re-read the tail of the file, confirmed the new ending line, and applied the edit correctly.

## Next Phase Readiness

- QUEST-02 COMPLETE: 16 side quests, 2 per zone, narrative-embedded objectives
- QUEST-03 COMPLETE: 12 companion personal quests with relationship rewards and FSRS dialogue trees
- Ready for Phase 45 Plan 03 (if it exists) or Phase 46 (Vocabulary Expansion)
- Note: companion NPCs are not yet wired to Phaser zone spawning (no position data in companion entries) — this is expected; companion recruitment system handles placement

## Self-Check: PASSED

- FOUND: src/data/quests.json
- FOUND: src/data/npcs.json
- FOUND: .planning/phases/45-quest-storylines/45-02-SUMMARY.md
- FOUND: commit de3b883 (Task 1 — 16 side quests)
- FOUND: commit 70717ef (Task 2 — 12 companion quests + NPC dialogue)

---
*Phase: 45-quest-storylines*
*Completed: 2026-03-18*
