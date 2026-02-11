# Roadmap: GoGo Arabic

## Milestones

- SHIPPED **v2.0 Player Experience Overhaul** — Phases 1-9 (shipped 2026-02-08) → [archive](milestones/v2.0-ROADMAP.md)
- PARTIAL **v3.0 Infrastructure & Polish** — Phases 10-11 complete, 12-13 deferred (2026-02-09) → [archive](milestones/v3.0-ROADMAP.md)
- SHIPPED **v4.0 Game Soul & Polish** — Phases 14-18 (shipped 2026-02-10) → [archive](milestones/v4.0-ROADMAP.md)
- 🚧 **v5.0 The Real Game** — Phases 19-26 (in progress)

## Overview

v5.0 transforms GoGo Arabic from a learning app with game skin into an actual game. Players will enter a world that feels alive, purposeful, and structured — where every building can be explored, every object tells a story, and every NPC conversation teaches Arabic in meaningful context. The transformation happens across 8 phases: first establishing narrative infrastructure, then building the dialogue engine that powers all interactions, redesigning onboarding to hook players in 90 seconds, making buildings enterable with interior maps, filling the world with 100+ interactive objects, creating structured progression that always tells players what to do next, integrating vocabulary into the world so learning feels natural, and finally weaving personalized narrative branching throughout.

## Phases

**Phase Numbering:**
- Integer phases (19-26): Planned v5.0 milestone work
- Decimal phases (e.g., 19.1): Urgent insertions (marked with INSERTED)

<details>
<summary>v2.0 Player Experience Overhaul (Phases 1-9) — SHIPPED 2026-02-08</summary>

- [x] Phase 1: Critical Fixes (2/2 plans) — 2026-02-08
- [x] Phase 2: Player Guidance (2/2 plans) — 2026-02-08
- [x] Phase 3: Feature Discoverability (2/2 plans) — 2026-02-08
- [x] Phase 4: Onboarding & HUD (3/3 plans) — 2026-02-08
- [x] Phase 5: Daily Dashboard (1/1 plan) — 2026-02-08
- [x] Phase 6: World Map Upgrade (1/1 plan) — 2026-02-08
- [x] Phase 7: Player Profile & Stats (1/1 plan) — 2026-02-08
- [x] Phase 8: Visual Polish & Sprites (1/1 plan) — 2026-02-08
- [x] Phase 9: Outfit System (1/1 plan) — 2026-02-08

</details>

<details>
<summary>v3.0 Infrastructure & Polish (Phases 10-11) — PARTIAL 2026-02-09</summary>

- [x] Phase 10: Testing Foundation (6/6 plans) — 2026-02-09
- [x] Phase 11: Architecture Cleanup (5/5 plans) — 2026-02-09
- [ ] Phase 12: Backend Hardening — DEFERRED
- [ ] Phase 13: Visual Polish — DEFERRED

</details>

<details>
<summary>v4.0 Game Soul & Polish (Phases 14-18) — SHIPPED 2026-02-10</summary>

**Milestone Goal:** Transform GoGo Arabic from a learning app with RPG graphics into a game that feels alive — with audio, atmosphere, clear progression, interactive world, and triple-A polish.

- [x] Phase 14: Bug Fixes & Stability (1/1 plan) — 2026-02-10
- [x] Phase 15: Audio System (2/2 plans) — 2026-02-10
- [x] Phase 16: Visual Juice (2/2 plans) — 2026-02-10
- [x] Phase 17: Progression Clarity (2/2 plans) — 2026-02-10
- [x] Phase 18: World Life (1/1 plan) — 2026-02-10

</details>

### 🚧 v5.0 The Real Game (In Progress)

**Milestone Goal:** Transform GoGo Arabic from a learning app with game skin into an actual game — epic personalized narrative, living interactive world, and guided structure from minute one.

- [ ] **Phase 19: Infrastructure & Architecture** - EventBus refactor, narrativeSlice, foundation systems
- [ ] **Phase 20: Dialogue System** - DialogueEngine, rich NPC conversations, branching
- [ ] **Phase 21: Guided Onboarding & Mentor** - 90-second tutorial, mentor character, first mission
- [ ] **Phase 22: Buildings & Interiors** - SceneStackManager, enterable buildings, 15 interior maps
- [ ] **Phase 23: Interactive Objects & World Life** - 100+ objects, world depth, exploration rewards
- [ ] **Phase 24: Structured Progression & Gates** - Zone gates, quest chains, "what to do next"
- [ ] **Phase 25: Vocabulary Integration** - Contextualized learning, dialogue-taught words, semantic clusters
- [ ] **Phase 26: Narrative Branching & Polish** - Personalized story, choices, UX polish

## Phase Details

### Phase 19: Infrastructure & Architecture
**Goal**: Establish narrative state management and EventBus architecture to support all v5.0 features without technical debt
**Depends on**: Nothing (foundation for v5.0)
**Requirements**: INFR-01, INFR-02, INFR-03, INFR-04, INFR-05, INFR-06, INFR-07, INFR-08, INFR-09, INFR-10
**Success Criteria** (what must be TRUE):
  1. useEventBusListeners refactored from monolithic 380 LOC into 4+ domain-specific hooks with consistent cleanup
  2. narrativeSlice exists in Redux store tracking story flags, NPC relationships, and world object states with full persistence
  3. All existing 548 tests pass without regressions after infrastructure changes
  4. EventBus uses namespaced naming convention with centralized registry preventing event conflicts
  5. Build bundle remains under 500KB after all infrastructure additions
**Plans:** 4 plans

Plans:
- [ ] 19-01-PLAN.md — EventBus namespaced registry + atomic rename across 21 files
- [ ] 19-02-PLAN.md — narrativeSlice creation + store/test tooling updates + sceneMock extension
- [ ] 19-03-PLAN.md — useEventBusListeners refactor into 5 domain sub-hooks
- [ ] 19-04-PLAN.md — SceneStackManager + Zod dialogue JSON validation

### Phase 20: Dialogue System
**Goal**: NPCs become real characters with personality, multi-topic conversations, and the ability to teach vocabulary through meaningful dialogue
**Depends on**: Phase 19 (needs narrativeSlice for relationship tracking, condition evaluation)
**Requirements**: DLGE-01, DLGE-02, DLGE-03, DLGE-04, DLGE-05, DLGE-06, DLGE-07, DLGE-08, DLGE-09, DLGE-10, DLGE-11, DLGE-12, DLGE-13, DLGE-14
**Success Criteria** (what must be TRUE):
  1. Player can have hub-and-spoke conversations with NPCs selecting from 3+ topics (lore, teaching, gossip, quests)
  2. At least 30 NPCs across zones have deep conversation trees with distinct personality and speech patterns
  3. NPC dialogue changes based on quest state and story progression with new topics unlocking dynamically
  4. Player choices in dialogue affect NPC relationship levels tracked as 0-5 trust meter per NPC
  5. Dialogue can trigger effects: start/complete quests, give items, unlock areas, teach words, change NPC state
**Plans:** 6 plans

Plans:
- [ ] 20-01-PLAN.md — DialogueEngine Phaser system + extended Zod schema + EVENTS constants
- [ ] 20-02-PLAN.md — useDialogue hub-and-spoke rewrite + effect execution wiring
- [ ] 20-03-PLAN.md — DialogueOverlay redesign + TopicSelectionMenu + VocabularyHighlight + RelationshipIndicator
- [ ] 20-04-PLAN.md — Upgrade 15 existing NPCs with personality, topics, conditions, effects
- [ ] 20-05-PLAN.md — Upgrade remaining 8 NPCs + add 7 new NPCs (30 total)
- [ ] 20-06-PLAN.md — WorldScene integration + test updates + manual verification

### Phase 21: Guided Onboarding & Mentor
**Goal**: Player knows exactly what to do from second one — mentor-driven 90-second tutorial that teaches core loop and establishes purpose
**Depends on**: Phase 20 (mentor uses DialogueEngine for all interactions)
**Requirements**: ONBR-01, ONBR-02, ONBR-03, ONBR-04, ONBR-05, ONBR-06, ONBR-07, ONBR-08, ONBR-09, ONBR-10
**Success Criteria** (what must be TRUE):
  1. New player meets mentor character within 30 seconds who explains purpose through in-world dialogue
  2. Player completes guided first mission teaching core loop (explore → talk → quest → learn) in under 90 seconds
  3. Player learns first Arabic word through narrative context within first minute
  4. Old 6-step OnboardingFlow modal completely replaced with in-world mentor-driven playable quest
  5. Mentor character findable throughout game for hints and guidance on what to do next
**Plans**: TBD

Plans:
- [ ] 21-01: TBD

### Phase 22: Buildings & Interiors
**Goal**: World depth — buildings become explorable spaces with NPCs, objects, and purpose instead of decorative facades
**Depends on**: Phase 20 (interior NPCs need dialogue system), Phase 19 (scene lifecycle managed by proper architecture)
**Requirements**: BLDG-01, BLDG-02, BLDG-03, BLDG-04, BLDG-05, BLDG-06, BLDG-07, BLDG-08, BLDG-09, BLDG-10, BLDG-11, BLDG-12
**Success Criteria** (what must be TRUE):
  1. Player can enter at least 15 buildings across zones by interacting with doors
  2. SceneStackManager handles building entry/exit via pause/launch/resume without memory leaks or freezes
  3. Each interior has distinct purpose: shops, library, homes, guild, mosque with relevant NPCs and content
  4. Player exits seamlessly by walking to door and returns to exact exterior position they entered from
  5. Audio crossfades between exterior zone BGM and interior ambient when entering/exiting
**Plans**: TBD

Plans:
- [ ] 22-01: TBD

### Phase 23: Interactive Objects & World Life
**Goal**: World feels alive and worth exploring — 100+ objects teach vocabulary, reward curiosity, and fill empty space with meaning
**Depends on**: Phase 22 (objects live inside buildings), Phase 20 (object lore uses dialogue patterns)
**Requirements**: OBJT-01, OBJT-02, OBJT-03, OBJT-04, OBJT-05, OBJT-06, OBJT-07, OBJT-08, OBJT-09, OBJT-10, OBJT-11, OBJT-12
**Success Criteria** (what must be TRUE):
  1. InteractableManager supports 8 new object types: market stalls, statues, paintings, fountains, lanterns, crates, barrels, cooking pots
  2. At least 100 interactive objects placed across zones and interiors with contextual information
  3. Objects teach vocabulary in semantic clusters aligned with zone themes (market = trade, library = knowledge)
  4. Some objects change state based on quest progress (locked chest → unlockable, broken bridge → repaired)
  5. Object discovery aided by subtle visual cues (sparkle, glow) from existing VFX system
**Plans**: TBD

Plans:
- [ ] 23-01: TBD

### Phase 24: Structured Progression & Gates
**Goal**: Player always knows what to do next — structured progression with zone gates, quest chains, and visible objectives
**Depends on**: Phase 22, Phase 23 (needs content to gate), Phase 20 (quest guidance uses dialogue)
**Requirements**: PROG-01, PROG-02, PROG-03, PROG-04, PROG-05, PROG-06, PROG-07, PROG-08, PROG-09, PROG-10, PROG-11, PROG-12
**Success Criteria** (what must be TRUE):
  1. Zones gated by vocabulary mastery milestones with visible unlock requirements (e.g., "Learn 50 words to cross")
  2. Player always has visible "next objective" indicator showing where to go (compass arrow, quest marker, HUD prompt)
  3. Quest log shows clear next-step instructions for each active quest with progress percentage
  4. Zone gates unlock visibly in world with animations (bridges repair, gates open, paths clear)
  5. World Map shows zone lock/unlock status with specific requirements to unlock each zone
**Plans**: TBD

Plans:
- [ ] 24-01: TBD

### Phase 25: Vocabulary Integration & Contextualized Learning
**Goal**: Arabic learning happens naturally through exploration — vocabulary taught in dialogue, objects, and quests instead of isolated quizzes
**Depends on**: Phase 20 (dialogue system), Phase 23 (objects), Phase 24 (quest structure)
**Requirements**: VCAB-01, VCAB-02, VCAB-03, VCAB-04, VCAB-05, VCAB-06, VCAB-07, VCAB-08, VCAB-09, VCAB-10, VCAB-11, VCAB-12, NARR-01, NARR-02
**Success Criteria** (what must be TRUE):
  1. At least 200 of 1,220 vocabulary words integrated into dialogue and world objects with narrative context
  2. NPC dialogue teaches vocabulary naturally with highlighted Arabic words and inline translation hints
  3. Each zone's NPCs teach vocabulary relevant to zone theme with each NPC owning 10-20 words
  4. Arabic words in dialogue automatically added to FSRS review queue same as quiz-taught words
  5. Difficulty of Arabic in dialogue adapts to player's mastery level (more known words → more Arabic)
**Plans**: TBD

Plans:
- [ ] 25-01: TBD

### Phase 26: Narrative Branching & Polish
**Goal**: Personalized journey — player choices matter, story branches, NPCs react, world changes, all with final UX polish
**Depends on**: Phases 20-25 (needs all systems functional to branch meaningfully)
**Requirements**: NARR-03, NARR-04, NARR-05, NARR-06, NARR-07, NARR-08, NARR-09, NARR-10, NARR-11, NARR-12, UXPL-01, UXPL-02, UXPL-03, UXPL-04, UXPL-05, UXPL-06
**Success Criteria** (what must be TRUE):
  1. At least 3 major branching points in main storyline where player choices lead to different quest outcomes
  2. Main storyline spans all 8 zones with zone-specific arcs that tie into overarching goal
  3. NPC relationship levels unlock exclusive dialogue topics, quests, and rewards at higher trust tiers
  4. World state changes persist permanently (unlocked bridges, opened gates, completed transformations)
  5. All new overlays accessible via keyboard with focus management and RTL Arabic text handling
**Plans**: TBD

Plans:
- [ ] 26-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 19 → 20 → 21 → 22 → 23 → 24 → 25 → 26

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Critical Fixes | v2.0 | 2/2 | Complete | 2026-02-08 |
| 2. Player Guidance | v2.0 | 2/2 | Complete | 2026-02-08 |
| 3. Feature Discoverability | v2.0 | 2/2 | Complete | 2026-02-08 |
| 4. Onboarding & HUD | v2.0 | 3/3 | Complete | 2026-02-08 |
| 5. Daily Dashboard | v2.0 | 1/1 | Complete | 2026-02-08 |
| 6. World Map Upgrade | v2.0 | 1/1 | Complete | 2026-02-08 |
| 7. Player Profile & Stats | v2.0 | 1/1 | Complete | 2026-02-08 |
| 8. Visual Polish & Sprites | v2.0 | 1/1 | Complete | 2026-02-08 |
| 9. Outfit System | v2.0 | 1/1 | Complete | 2026-02-08 |
| 10. Testing Foundation | v3.0 | 6/6 | Complete | 2026-02-09 |
| 11. Architecture Cleanup | v3.0 | 5/5 | Complete | 2026-02-09 |
| 12. Backend Hardening | v3.0 | — | Deferred | — |
| 13. Visual Polish | v3.0 | — | Deferred | — |
| 14. Bug Fixes & Stability | v4.0 | 1/1 | Complete | 2026-02-10 |
| 15. Audio System | v4.0 | 2/2 | Complete | 2026-02-10 |
| 16. Visual Juice | v4.0 | 2/2 | Complete | 2026-02-10 |
| 17. Progression Clarity | v4.0 | 2/2 | Complete | 2026-02-10 |
| 18. World Life | v4.0 | 1/1 | Complete | 2026-02-10 |
| 19. Infrastructure & Architecture | v5.0 | 0/4 | Not started | - |
| 20. Dialogue System | v5.0 | 0/6 | Not started | - |
| 21. Guided Onboarding & Mentor | v5.0 | 0/TBD | Not started | - |
| 22. Buildings & Interiors | v5.0 | 0/TBD | Not started | - |
| 23. Interactive Objects & World Life | v5.0 | 0/TBD | Not started | - |
| 24. Structured Progression & Gates | v5.0 | 0/TBD | Not started | - |
| 25. Vocabulary Integration | v5.0 | 0/TBD | Not started | - |
| 26. Narrative Branching & Polish | v5.0 | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-08*
*Last updated: 2026-02-11 — Phase 20 planned with 6 plans in 4 waves*
