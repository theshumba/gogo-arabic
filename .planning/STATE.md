---
gsd_state_version: 1.0
milestone: v11.0
milestone_name: Dialogue Foundation & Learning Paths
status: in_progress
stopped_at: "Phase 51 plan 04 complete (51-04-SUMMARY.md created) — Phase 51 all 4 plans complete"
last_updated: "2026-03-20T02:05:00Z"
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 13
  completed_plans: 4
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-19)

**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"
**Current focus:** Phase 51 — dialogue-foundation-learning-paths (COMPLETE)

## Current Position

Phase: 51 (dialogue-foundation-learning-paths) — COMPLETE (all 4 plans done)
Plan: 4 of 4 — COMPLETE

Progress: [████░░░░░░░░░] 4/13 plans complete

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

**Cumulative:** 46 phases, 137+ plans, 9 milestones

## Accumulated Context

### Key v11.0 Context

- inkjs@2.4.0 NOW INSTALLED — InkDialogueEngine adapter created in Phase 51-01
- rollup-plugin-visualizer INSTALLED — use `npm run build:analyze` for treemap; see dist/bundle-report.html
- Bundle NOW 402KB (under 500KB target) — Phase 50-01 complete; safe to add Phase 51 systems
- worldStateSlice is the root dependency: inkjs, factions, gossip, and learning path all write to it
- Adapter pattern for inkjs: check .ink.json first, fallback to legacy JSON — never big-bang migrate all NPCs
- Faction gates must cover bonus content only — all main quests completable at faction score 0
- 573 missing companion dialogue lines — FILLED in Phase 51-02 — zero Array.from placeholders remain
- Phases 48-49 from v10.0 (learning path + first quest) are absorbed into Phase 51
- Visual/UI/world/tileset work explicitly out of scope — user builds in LDtk separately
- EXTERNAL declarations required in .ink source — all ink files must declare EXTERNAL for any function called via ~ syntax
- npm run ink:compile regenerates all .ink.json from src/data/ink-source/*.ink using inkjs/compiler/Compiler
- INK_DIALOGUE_START event pattern: emit {engine, npcData} → DialogueOverlay renders ink story without legacy NPC lookup
- INK_DIALOGUE_END event: emitted by DialogueOverlay on ink story completion; useTutorialTrigger listens to advance phase
- Path-choice ink trigger: SFX_WORDLEARNED in met_mentor phase → InkDialogueEngine.loadPathChoice() → INK_DIALOGUE_START

### Decisions

All v2.0-v10.0 decisions logged in PROJECT.md Key Decisions table.

| Decision | Context | Outcome |
|----------|---------|---------|
| inkjs adapter pattern (not big-bang migration) | Research: 23 NPCs, breaking risk | Pilot 5 NPCs, fallback to legacy JSON |
| AceBase deferred to v12.0 | Bundle cost 200-300KB conflicts with 500KB target | IndexedDB hybrid covers persistence needs |
| Phases 48-49 absorbed into Phase 51 | v10.0 not started, absorb cleaner than maintaining two roadmaps | Single phase delivers full learning path + first quest flow |
| WORLD_STATE_KEYS constants file | 500+ flags, naming chaos risk | {zone}_{action}_{target} convention enforced from Phase 50 day one |
| Faction gates bonus-content-only | Soft-lock risk if faction tied to main quest | Main storyline completable at all-0 faction scores |
| GameLayout lazy at route level (50-01) | Overlay-only lazy wrapping only reduced index to 1,068KB; store+scene deps enter via different path | routes.jsx uses lazy() for GameLayout; index=402KB; game code defers to /game navigation |
| Lazy overlay Suspense fallback=null (50-01) | No spinner flash over Phaser canvas when opening battle/inventory first time | Canvas stays visible; overlays load silently |
| worldState moved to IndexedDB | 562 flags → localStorage 5-10MB limit risk | Nested persistReducer, CURRENT_VERSION=8, migration cleans old data |
| worldStateMiddleware last in chain | Ordering consistency | Added after utilityBonusMiddleware, matches project convention |
| Zone asset manifest (50-02) | BootScene loaded ALL zone tilesets upfront; zone-specific Kenmi tilesets moved to ZONE_ASSET_MANIFESTS | loadZoneAssets() called during ZoneTransition fade-out; TextureManager cache skip on revisit |
| KENMI_CATALOG stays in BootScene (50-02) | Decorative sprites used across all zones; not zone-specific | KENMI_CATALOG loop untouched in BootScene; only desert tileset images moved to ZONE_ASSET_MANIFESTS |
| syncStateOut uses WORLD_STATE_KEYS values (51-01) | Iterating raw ink globalVariables risks polluting Redux store with ink-internal variables | syncStateOut() iterates known WORLD_STATE_KEYS set only |
| EXTERNAL declarations required in .ink (51-01) | inkjs Compiler throws on ~ function calls without EXTERNAL declaration | All .ink source files must declare EXTERNAL at top for all bound functions |
| Zone corrections in companion dialogue (51-02) | Placeholders used wrong zones for Maryam/Nadia/Tariq vs plan spec | Applied plan-spec zones at write time; teaching specialty keys also corrected for Samir/Tariq/Maryam |
| Amira gets ancient_ruins as 4th zone (51-02) | Plan called for adding ancient_ruins zone_comments to Amira | Added 5 entries; Amira now has 4 zones (sacred_library, oasis, market, coast, ruins) |
| Ink path-choice triggered by SFX_WORDLEARNED not path_choice tutorialPhase (51-03) | CinematicIntroSequencer already skips tutorialPhase='path_choice'; word-learned is correct insertion point | useTutorialTrigger fires ink dialogue after SFX_WORDLEARNED in met_mentor phase |
| INK_DIALOGUE_START/END event pair decouples overlay from phase management (51-03) | DialogueOverlay should not own phase transitions | Overlay emits INK_DIALOGUE_END; useTutorialTrigger advances to learned_word |
| PathChoice.jsx preserved for PATH-05 (51-03) | Settings path-switch still needs PathChoice overlay | Guarded with !pathAlreadyChosen in GameLayout; never deleted |
| PATH_MENTORS/PATH_FIRST_QUESTS as module-level constants (51-04) | Exported from playerSlice so they are testable and tree-shakeable without Redux | setLearningPath reducer imports and references PATH_MENTORS directly |
| selectNewCardsByPath reads learningPath from state.player (not param) (51-04) | Consistent with Redux selector convention; avoids passing path as extra arg | Input selector: (state) => state.player.learningPath |
| Onboarding 3-word reward uses Object.keys(fsrsCards).length (51-04) | No separate counter state needed; avoids duplication | worldStateMiddleware checks post-reduction fsrsCards count === 3 |
| worldStateMiddleware dual-write covers both completeOnboarding + setTutorialPhase('complete') (51-04) | Both code paths can complete onboarding; both must write IndexedDB flag | Middleware intercepts both action types |
| ActivitiesMenu 'learning-path' opens PathChoice via onOpenPathSwitch (not route) (51-04) | No /learning-path route exists; settings mode is an overlay not a page | PauseMenu threads onOpenPathSwitch → GameLayout showPathSwitch state |

### Blockers/Concerns

- v9.0 Phase 46 still in progress (46-02 and 46-03 remain) — v10.0/v11.0 can proceed in parallel but Phase 52 (vocab expansion) must not conflict with Phase 46 output
- Phase 47 (Cinematic Intro) at human-verify checkpoint — needs user to verify 5-beat sequence in-game before v10.0 can be closed out

### Pending Todos

- Post-v8.0: SignPanel + ObjectPanel (React to Phaser NineSlice migration) deferred
- Post-v8.0: kenmi-ui-frames-sheet spritesheet registration in BootScene
- Post-v8.0: Delete inert old placeholder .png files in public/assets/sprites/objects/

## Session Continuity

Last session: 2026-03-20
Stopped at: Phase 51 plan 04 complete — PATH-03 through PATH-07 satisfied; Phase 51 fully done
Resume file: (Phase 51 complete — next phase TBD)
