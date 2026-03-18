---
gsd_state_version: 1.0
milestone: v9.0
milestone_name: Content Depth
status: in_progress
stopped_at: 45-03 complete — QUEST-04 + QUEST-05 done (8 inscriptions + learningPath branching)
last_updated: "2026-03-18T13:32:03Z"
last_activity: 2026-03-18 — Completed 45-03 (8 inscription interactables + learningPath dialogue branches)
progress:
  total_phases: 3
  completed_phases: 1
  total_plans: 9
  completed_plans: 5
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-16)

**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"
**Current focus:** v9.0 Content Depth — NPC dialogue expansion (Phase 44), quest storylines (Phase 45), vocabulary expansion (Phase 46)

## Current Position

Milestone: v9.0 Content Depth
Phase: 45 — Quest Storylines (COMPLETE)
Plan: 03 of 03 complete — Phase 45 fully done
Status: Phase 45 COMPLETE — all 5 QUEST requirements (QUEST-01 through QUEST-05) satisfied
Last activity: 2026-03-18 — Completed 45-03 (8 inscription interactables + learningPath dialogue branches)

Progress (v9.0): [██████░░░░░░] 67% (6/9 plans)

### Shipped Milestones

| Version | Phases | Plans | Date |
|---------|--------|-------|------|
| v2.0 Player Experience | 1-9 | 14 | 2026-02-08 |
| v3.0 Infrastructure | 10-11 | 11 | 2026-02-09 |
| v4.0 Game Soul & Polish | 14-18 | 8 | 2026-02-10 |
| v5.0 The Real Game | 19-26 | 18 | 2026-02-11 |
| v6.0 Combat & RPG | 27.1, 28-30 | 16 | 2026-02-13 |
| v6.1 Crafting & Advanced Combat | 31-32 | 19 | 2026-02-18 |
| v7.0 World & Content | 33-37 | 18 | 2026-03-16 |
| v8.0 Visual Overhaul | 38-43 | ~18 | 2026-03-18 |

**Cumulative:** 43 phases, 127+ plans, 8 milestones

## Accumulated Context

### Key v9.0 Context

- Phase 44 COMPLETE: all 5 DIAL requirements satisfied
- Total dialogue lines: 1,544 (target: 1,543+) — DIAL-03 COMPLETE
- DIAL-01 COMPLETE: all 23 main NPCs + guide-amira rewritten with distinct Islamic Golden Age personalities
- DIAL-02 COMPLETE: 17 NPCs reference specific verifiable Islamic Golden Age historical facts (target: 8+)
- DIAL-04 COMPLETE: culturalNote fields render in DialogueBox UI with red accent (#E63946) styling
- DIAL-05 COMPLETE: teachWord-to-FSRS pipeline verified (454 teachWord fields, 0 invalid refs)
- 111 total culturalNote fields across all NPCs
- QUEST-01 COMPLETE: 8-act main storyline (time-traveling scholar + manuscript pages) in quests.json + 16 STORY_ACT_ARCS in npcStoryArcs.js
- QUEST-02 COMPLETE: 16 side quests (2/zone × 8 zones) with narrative-embedded Arabic learning objectives
- QUEST-03 COMPLETE: 12 companion personal quests in quests.json + 12 companion NPC entries in npcs.json with personal_quest start/complete dialogue trees
- QUEST-04 COMPLETE: 8 hidden inscription interactables in zones.js (one per zone), type:'inscription', each with rootFamily, rootWords[4], culturalNote
- QUEST-05 COMPLETE: DialogueEngine.evaluateCondition supports { learningPath: 'scholar'|'traveler'|'historian' } conditions; 8 act start arcs have 3 learningPath-branched lines each; 12 companion personal_quest trees have 3 learningPath-branched lines each
- Phase 45 COMPLETE: all 5 QUEST requirements satisfied
- Total quests in quests.json: 100 (64 original + 8 main story + 16 side + 12 companion)
- Total NPCs in npcs.json: 56 (44 original + 12 companions)
- Quest branching by learningPath (Scholar/Traveler/Historian) already exists in narrativeSlice (QUEST-05)
- vocabularyAll.js currently has 1,220 words — expand to 5,000+ (VOCAB-01)
- CEFR targets: A1 (500), A2 (1,000), B1 (2,000), B2 (1,500) = 5,000 total (VOCAB-02)
- Root Explorer already exists and searches by root — expansion adds family groupings display (VOCAB-03)

### Decisions

All v2.0-v8.0 decisions logged in PROJECT.md Key Decisions table.

| Decision | Context | Outcome |
|----------|---------|---------|
| Add new trees vs. rewrite existing | 44-01 | Added new trees (3-6 per NPC), preserving all existing hub/quest/topic trees |
| teachWord IDs use vocabulary.json format | 44-01 | IDs like `big_1`, `head_1`, `water_w13` — verified against vocabulary.json before use |
| guide-amira gets return_visit trees with NPC routing | 44-02 | Amira now actively routes players to content NPCs; amira_npc_hints is a choice-branch after progress_check |
| player-choice branches use next pointers to named trees | 44-02 | Cleaner than inline choices; lets engine's handleChoice() navigate between trees |
| culturalNote added to DialogueBox.jsx not DialogueOverlay.jsx | 44-03 | DialogueBox is where line content renders; DialogueOverlay only orchestrates phases/choices |
| Cultural note shown only when allComplete | 44-03 | Matches teachWordCard timing — prevents note appearing during typewriter animation |
| act_8 NPC is vizier-abbas, not scholar-yusuf | 45-01 | scholar-yusuf is in oasis_village; vizier-abbas is first NPC in royal_palace zone and most narratively fitting |
| STORY_ACT_ARCS is a new top-level export | 45-01 | Act arcs are standalone condition-based objects, separate from NPC_EXTRA_DIALOGUE_TREES appended trees |
| Companions mapped to base 8 zones (sacred_library→ancient_library etc.) | 45-02 | companions.js zone names differ slightly from zones.js zone ids; mapped each to closest base 8 zone |
| companion_fatima and companion_tariq (ancient_ruins) mapped to royal_palace | 45-02 | ancient_ruins is not a standalone base zone; both are late-game companions fitting royal_palace/master_of_arabic gate |
| Companions added as full NPC entries in npcs.json | 45-02 | Consistent with existing NPC format; DialogueEngine looks up NPCs by id, needs full entry |
| rootWords use real verified vocabulary IDs | 45-03 | All rootWords arrays use IDs confirmed in vocabulary.json before writing (write_1, sea_w23, etc.) |
| filterLines helper added to DialogueEngine | 45-03 | Mirrors getFilteredChoices pattern; enables line-level learningPath filtering without breaking existing flow |
| learningPath lines appended at end of lines array | 45-03 | null-path players see lines 0-2 (unchanged); path players also see their matching variant line |

### Blockers/Concerns

- Bundle at 862KB (well over 500KB target) — vocabulary expansion (5,000 words) will increase bundle further; lazy loading deferred to post-v9.0
- 573 missing companion dialogue lines noted in tech debt — Phase 44 is the opportunity to close this gap
- Post-v8.0 todos still pending: SignPanel/ObjectPanel Phaser migration, kenmi-ui-frames-sheet spritesheet registration, old placeholder PNGs deletion

### Pending Todos

- Post-v8.0: SignPanel + ObjectPanel (React to Phaser NineSlice migration) deferred
- Post-v8.0: kenmi-ui-frames-sheet spritesheet registration in BootScene (PanelFactory kenmi preset wiring)
- Post-v8.0: Delete inert old placeholder .png files in public/assets/sprites/objects/

## Session Continuity

Last session: 2026-03-18
Stopped at: 45-03 complete — Phase 45 DONE (QUEST-01 through QUEST-05 all satisfied)
Resume file: Phase 46 (Vocabulary Expansion) — `/gsd:plan-phase 46` to plan vocabulary expansion to 5,000+ words
