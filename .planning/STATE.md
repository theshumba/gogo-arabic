---
gsd_state_version: 1.0
milestone: v9.0
milestone_name: Content Depth
status: in_progress
stopped_at: Phase 44 Plan 01 complete — 12 NPCs expanded with Islamic Golden Age dialogue
last_updated: "2026-03-18T08:00:00.000Z"
last_activity: "2026-03-18 — 44-01 complete: 541 lines, 157 teachWords, 49 culturalNotes across 12 NPCs"
progress:
  total_phases: 3
  completed_phases: 0
  total_plans: 9
  completed_plans: 1
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-16)

**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"
**Current focus:** v9.0 Content Depth — NPC dialogue expansion (Phase 44), quest storylines (Phase 45), vocabulary expansion (Phase 46)

## Current Position

Milestone: v9.0 Content Depth
Phase: 44 — NPC Dialogue Expansion (in progress)
Plan: 01 of 3 complete
Status: In progress
Last activity: 2026-03-18 — Completed 44-01 (NPCs 1-12 dialogue expansion)

Progress (v9.0): [█░░░░░░░░░░░] 11% (1/9 plans)

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

- Starting dialogue count: ~1,043 lines — target 1,543+ (500+ new lines via DIAL-03)
- 23 main NPCs need rewritten dialogue trees (DIAL-01)
- teachWord field integration requires wiring to existing FSRS fsrsSlice (DIAL-05)
- 8-act main storyline uses time-traveling scholar collecting manuscript pages across all 8 zones (QUEST-01)
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
Stopped at: 44-01 complete — NPCs 1-12 dialogue expanded
Resume file: `.planning/phases/44-npc-dialogue-expansion/44-02-PLAN.md`
