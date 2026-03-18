---
gsd_state_version: 1.0
milestone: v9.0
milestone_name: Content Depth
status: completed
stopped_at: 46-01 complete — vocabularyExpanded.js created (500 A1 + 1,000 A2 words)
last_updated: "2026-03-18T22:55:00.000Z"
last_activity: 2026-03-18 — Created 37-03 and 37-04 SUMMARY files + fixed 6 build blockers
progress:
  total_phases: 3
  completed_phases: 2
  total_plans: 9
  completed_plans: 7
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-16)

**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"
**Current focus:** v9.0 Content Depth — NPC dialogue expansion (Phase 44), quest storylines (Phase 45), vocabulary expansion (Phase 46)

## Current Position

Milestone: v9.0 Content Depth
Phase: 46 — Vocabulary Expansion (In progress)
Plan: 01 of 03 complete
Status: 46-01 COMPLETE — vocabularyExpanded.js created (500 A1 + 1,000 A2 words)
Last activity: 2026-03-18 — Completed 46-01 (vocabularyExpanded.js — 1,500 Arabic words, VOCAB-06 schema)

Progress (v9.0): [███████░░░░░] 78% (7/9 plans)

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
- Phase 46 progress: 46-01 COMPLETE — vocabularyExpanded.js has 1,500 new words (500 A1 + 1,000 A2); VOCAB-01/VOCAB-02/VOCAB-06 partially satisfied; 46-02 (B1/B2) and 46-03 (merge + Root Explorer) remain
- vocabularyExpanded.js IDs: exp_a1_001–exp_a1_500 (A1), exp_a2_0001–exp_a2_1000 (A2); zero conflicts with vocabulary.json (named IDs) or vocabulary-final.json (p_XXXX)

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
| ID prefix exp_a1_ / exp_a2_ for vocabularyExpanded.js | 46-01 | Guarantees zero collision with vocabulary.json named IDs and vocabulary-final.json p_XXXX IDs |
| A1 frequency 4000–9999, A2 frequency 2000–3999 | 46-01 | Matches vocabulary-final.json conventions for frequency field semantics |
| NPC first-meet journal in useDialogueEvents not useNarrativeEvents | 260318-tot | Avoids duplicate NPC_INTERACT listener; inline in existing handler |
| removeItem uses { itemId, quantity } payload | 260318-tot | inventorySlice schema uses itemId not id; quantity=1 consumed per gift |
| Cultural note codex unlock via custom EventBus event | 260318-tot | dialogue:cultural_note_shown emitted from DialogueBox with guard ref, listened in useDialogueEvents |
| BattleActionQueue is infrastructure only | 37-03 | Wiring to BattleStateMachine deferred to future combat phase |
| Currency exchange rates 100:1 | 37-03 | Cultural authenticity: 100 fils = 1 dirham, 100 dirhams = 1 dinar |
| ActorRegistry is foundation layer | 37-04 | Existing NPCManager/CompanionManager etc. continue working unchanged |
| Singleton actorRegistry matches audioManager pattern | 37-04 | Module-level instance for global Phaser scene access |

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
Stopped at: 37-03/37-04 SUMMARY files created + 6 build blockers fixed
Resume file: Phase 46 Plan 02 — `.planning/phases/46-vocabulary-expansion/46-02-PLAN.md` (B1/B2 words, 2,500 more words)
Note: v7.0 Phase 37 plans 03/04 retroactively documented — artifacts existed since commit 23d462c
