---
gsd_state_version: 1.0
milestone: v12.0
milestone_name: Learning Systems
status: in_progress
stopped_at: Phase 57 Plan 03 complete — SkillTreeView XP progress bar + frontier highlighting + collapsed locked nodes + lazy-load via React.lazy
last_updated: "2026-03-22T14:07:00Z"
progress:
  total_phases: 9
  completed_phases: 1
  total_plans: 5
  completed_plans: 5
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-22)

**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"
**Current focus:** Phase 57 complete — skill-tree-infrastructure shipped

## Current Position

Phase: 57 (skill-tree-infrastructure) — COMPLETE
Plan: 3 of 3 (57-03 complete — phase done)

Progress: █████░░░░░ (5/5 plans complete across v12.0 so far)

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

**Cumulative:** 55 phases, 163+ plans, 11 milestones

## Accumulated Context

### Key v12.0 Context

- grammar.js has 47 lessons (not 50 as documented) — confirmed by research source inspection
- grammar_lessons achievement never fires — ACTION_TO_ACHIEVEMENT_TYPES missing 'grammar/completeLesson' mapping in achievementMiddleware
- CURRENT_VERSION is 11 (set in Phase 56 for placementSlice + cefrProgressSlice)
- Two new Redux slices added: placementSlice + cefrProgressSlice (both write-once-per-session, no live CEFR regression)
- learningProgressMiddleware now POPULATED (Phase 57-01) — 6 XP routing rules active
- recharts v3.8.0 is the ONE new npm install — React 19 peer dep confirmed; lazy-load in charts-vendor chunk
- html-to-image v1.11.13 is conditional (only if social card needs character art — SVG-only is preferred)
- Skill trees now at 30 nodes each (Phase 57-01 complete) — expanded from 10-12 nodes
- initializeSkillTree wired in main.jsx via persistor.subscribe — idempotent bootstrap for v11.0 saves
- Placement test cap: B1 maximum; default one level below raw score; "Start Lower" escape hatch required
- Achievement expansion: 206 new entries, ship 80-100 meaningful at launch + remainder in patches
- Grammar lesson ID migration: lesson_0 → lesson_verb_present etc. — must complete before any new lesson is authored
- poetry.completedBattles (not poetry.history) — confirmed from poetrySlice.js
- state.quests (not state.quest) — confirmed from store.js rootReducer key mapping
- SkillTreeView (Phase 57-03) is lazy-loaded — code-split chunk, only loaded when player opens skill tree menu
- Frontier nodes (next 1-2 reachable) have pulsing gold highlight; deeply locked nodes collapsed into summary count

### Decisions

| Decision | Context |
|----------|---------|
| GRAM-01/GRAM-03 assigned to Phase 62 | Success criterion (50 lessons, CEFR gates) only fully TRUE after B1-B2 content ships |
| GRAM-02/GRAM-04 assigned to Phase 58 | 12 exercise types + XP wiring verifiable with A1-A2 lessons alone |
| Phase 59 (adaptive) before Phase 60 (quiz types) | New quiz types must inherit adaptive behavior from day one |
| Phase 61 depends on both Phase 58 and 59 | Grammar content for CAT questions + adaptive engine for item selection |
| Phase 63 last before display layer | All achievement event sources must exist before conditions are authored |
| state.grammar accessed directly in isAchievementMet (not destructured) | Keeps diff minimal per plan spec; consistent with surgical change approach |
| migrations object exported separately from migrate | Enables unit tests to instantiate single-migration runners via createMigrate({ N: migrations[N] }) |
| Migration tests use currentVersion=N (not N-1) | redux-persist createMigrate skips migration when inboundVersion === currentVersion; must pass target version |
| placement + cefrProgress use localStorage (not IndexedDB) | Write-once-per-session slices are lightweight; IndexedDB tier reserved for heavy data (vocabulary, battle, magic, inventory, crafting) |
| learningProgressMiddleware is last in .concat() chain | Processes learning events after all reward/state middleware; ready for Phases 57-59 population |
| bulkUnlockNodes bypasses XP deduction | Used exclusively by initializeSkillTree — avoids XP math complications during bootstrap |
| initializeSkillTree gated on skillXP > 0 OR unlockedNodes.length > 0 | Dual guard prevents double-init across both fresh and returning player paths |
| unlock_spell/dialogue/zone/npc_branch placed at C2 nodes | Terminal-tier rewards for SKILL-03 upstream content dispatch |
| unlock_zone/dialogue/npc_branch use distinct setFlag key prefixes | zone_access_/dialogue_/npc_branch_ prevent namespace collisions in worldState.flags |
| unlock_spell dispatches discoverRoot with element: 'earth' | Element is cosmetic/not skill-tree-gating-critical; 'earth' is a valid ROOT_ELEMENTS value |
| skillTreeUnlocked exposed as full unlockedNodes map in actionContext | Avoids per-tree selector calls at context-build time; ActionSetExecutor reads [treeId].length |
| frontierNodeIds limited to slice(0,2) | Plan specifies 1-2 reachable nodes; keeps UI focused on immediate goals |

### Blockers/Concerns

- None

### Pending Todos

- Post-v8.0: SignPanel + ObjectPanel (React to Phaser NineSlice migration) deferred
- Post-v8.0: kenmi-ui-frames-sheet spritesheet registration in BootScene
- Post-v8.0: Delete inert old placeholder .png files in public/assets/sprites/objects/

## Session Continuity

Last session: 2026-03-22
Stopped at: Phase 57 Plan 03 complete — SkillTreeView UI polish + lazy-loading (SKILL-04 shipped)
Resume file: .planning/phases/57-skill-tree-infrastructure/57-03-SUMMARY.md
Next plan: Phase 58 — /gsd:plan-phase 58
