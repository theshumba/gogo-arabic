---
gsd_state_version: 1.0
milestone: v12.0
milestone_name: Learning Systems
status: ready_to_plan
stopped_at: Roadmap created — Phase 56 ready to plan
last_updated: "2026-03-22"
progress:
  total_phases: 9
  completed_phases: 0
  total_plans: 23
  completed_plans: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-22)

**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"
**Current focus:** Phase 56 — bug-fixes-redux-foundation

## Current Position

Phase: 56 of 64 (Bug Fixes & Redux Foundation)
Plan: Not started
Status: Ready to plan
Last activity: 2026-03-22 — v12.0 roadmap created, 21 requirements mapped across 9 phases

Progress: [░░░░░░░░░] 0% (v12.0)

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
| v9.0 Content Depth | 44-46 | 9 | 2026-03-18 |
| v10.0 Onboarding | 47 | 3 | 2026-03-19 |
| v11.0 Deep Systems | 50-55 | 25 | 2026-03-21 |

**Cumulative:** 55 phases, 159+ plans, 11 milestones

## Accumulated Context

### Key v12.0 Context

- grammar.js has 47 lessons (not 50 as documented) — confirmed by research source inspection
- grammar_lessons achievement never fires — ACTION_TO_ACHIEVEMENT_TYPES missing 'grammar/completeLesson' mapping in achievementMiddleware
- CURRENT_VERSION is 10 (set in Phase 55 for poetry IndexedDB) — v12.0 must bump to 11 for placementSlice + cefrProgressSlice
- Two new Redux slices needed: placementSlice + cefrProgressSlice (both write-once-per-session, no live CEFR regression)
- learningProgressMiddleware is new (separate from achievementMiddleware to avoid switch/case bloat)
- recharts v3.8.0 is the ONE new npm install — React 19 peer dep confirmed; lazy-load in charts-vendor chunk
- html-to-image v1.11.13 is conditional (only if social card needs character art — SVG-only is preferred)
- Skill trees already exist at ~10-12 nodes each in skillTrees.js — expand to 30 nodes per tree
- initializeSkillTree(existingPlayerState) must run on first v12.0 load to prevent retroactive content locking
- Placement test cap: B1 maximum; default one level below raw score; "Start Lower" escape hatch required
- Achievement expansion: 206 new entries, ship 80-100 meaningful at launch + remainder in patches
- Grammar lesson ID migration: lesson_0 → lesson_verb_present etc. — must complete before any new lesson is authored

### Decisions

| Decision | Context |
|----------|---------|
| GRAM-01/GRAM-03 assigned to Phase 62 | Success criterion (50 lessons, CEFR gates) only fully TRUE after B1-B2 content ships |
| GRAM-02/GRAM-04 assigned to Phase 58 | 12 exercise types + XP wiring verifiable with A1-A2 lessons alone |
| Phase 59 (adaptive) before Phase 60 (quiz types) | New quiz types must inherit adaptive behavior from day one |
| Phase 61 depends on both Phase 58 and 59 | Grammar content for CAT questions + adaptive engine for item selection |
| Phase 63 last before display layer | All achievement event sources must exist before conditions are authored |

### Blockers/Concerns

- None at roadmap stage

### Pending Todos

- Post-v8.0: SignPanel + ObjectPanel (React to Phaser NineSlice migration) deferred
- Post-v8.0: kenmi-ui-frames-sheet spritesheet registration in BootScene
- Post-v8.0: Delete inert old placeholder .png files in public/assets/sprites/objects/

## Session Continuity

Last session: 2026-03-22
Stopped at: Roadmap created for v12.0 — 9 phases (56-64), 21 requirements mapped, 23 plans estimated
Resume file: None — ready to plan Phase 56
Next plan: `/gsd:plan-phase 56`
