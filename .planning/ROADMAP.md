# Roadmap: GoGo Arabic

## Milestones

- ✅ **v2.0 Player Experience Overhaul** — Phases 1-9 (shipped 2026-02-08) → [archive](milestones/v2.0-ROADMAP.md)
- ✅ **v3.0 Infrastructure & Polish** — Phases 10-11 complete, 12-13 deferred (2026-02-09) → [archive](milestones/v3.0-ROADMAP.md)
- ✅ **v4.0 Game Soul & Polish** — Phases 14-18 (shipped 2026-02-10) → [archive](milestones/v4.0-ROADMAP.md)
- ✅ **v5.0 The Real Game** — Phases 19-26 (shipped 2026-02-11) → [archive](milestones/v5.0-ROADMAP.md)
- ✅ **v6.0 Combat & RPG** — Phases 27.1, 28-30 (shipped 2026-02-13) → [archive](milestones/v6.0-ROADMAP.md)
- ✅ **v6.1 Crafting & Advanced Combat** — Phases 31-32 (shipped 2026-02-18) → [archive](milestones/v6.1-ROADMAP.md)
- ✅ **v7.0 World & Content** — Phases 33-37 (shipped 2026-03-16) → [archive](milestones/v7.0-ROADMAP.md)
- ✅ **v8.0 Visual Overhaul** — Phases 38-43 (shipped 2026-03-18)
- ✅ **v9.0 Content Depth** — Phases 44-46 (shipped 2026-03-18)
- ✅ **v10.0 Onboarding & First 5 Minutes** — Phases 47-49 (shipped 2026-03-19, Phases 48-49 absorbed into v11.0)
- ✅ **v11.0 Deep Systems & Content Engine** — Phases 50-55 (shipped 2026-03-21) → [archive](milestones/v11.0-ROADMAP.md)
- 🚧 **v12.0 Learning Systems** — Phases 56-64 (in progress) → [details](milestones/v12.0-ROADMAP.md)

## Phases

**Phase Numbering:**
- Integer phases (1-64): Planned milestone work
- Decimal phases (27.1): Urgent insertions between phases (marked INSERTED)

<details>
<summary>✅ v2.0 Player Experience Overhaul (Phases 1-9) — SHIPPED 2026-02-08</summary>

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
<summary>✅ v3.0 Infrastructure & Polish (Phases 10-11) — PARTIAL 2026-02-09</summary>

- [x] Phase 10: Testing Foundation (6/6 plans) — 2026-02-09
- [x] Phase 11: Architecture Cleanup (5/5 plans) — 2026-02-09
- [ ] Phase 12: Backend Hardening — DEFERRED
- [ ] Phase 13: Visual Polish — DEFERRED

</details>

<details>
<summary>✅ v4.0 Game Soul & Polish (Phases 14-18) — SHIPPED 2026-02-10</summary>

- [x] Phase 14: Bug Fixes & Stability (1/1 plan) — 2026-02-10
- [x] Phase 15: Audio System (2/2 plans) — 2026-02-10
- [x] Phase 16: Visual Juice (2/2 plans) — 2026-02-10
- [x] Phase 17: Progression Clarity (2/2 plans) — 2026-02-10
- [x] Phase 18: World Life (1/1 plan) — 2026-02-10

</details>

<details>
<summary>✅ v5.0 The Real Game (Phases 19-26) — SHIPPED 2026-02-11</summary>

- [x] Phase 19: Infrastructure & Architecture (4/4 plans) — 2026-02-11
- [x] Phase 20: Dialogue System (6/6 plans) — 2026-02-11
- [x] Phase 21: Guided Onboarding & Mentor (1/1 plan) — 2026-02-11
- [x] Phase 22: Buildings & Interiors (3/3 plans) — 2026-02-11
- [x] Phase 23: Interactive Objects & World Life (1/1 plan) — 2026-02-11
- [x] Phase 24: Structured Progression & Gates (1/1 plan) — 2026-02-11
- [x] Phase 25: Vocabulary Integration (1/1 plan) — 2026-02-11
- [x] Phase 26: Narrative Branching & Polish (1/1 plan) — 2026-02-11

</details>

<details>
<summary>✅ v6.0 Combat & RPG (Phases 27.1, 28-30) — SHIPPED 2026-02-13</summary>

- [x] Phase 27.1: IndexedDB Migration (2/2 plans) — 2026-02-12
- [x] Phase 28: Root Magic & Elemental Affinity (4/4 plans) — 2026-02-12
- [x] Phase 29: Equipment, Inventory & Economy (5/5 plans) — 2026-02-12
- [x] Phase 30: Companion System (5/5 plans) — 2026-02-13

</details>

<details>
<summary>✅ v6.1 Crafting & Advanced Combat (Phases 31-32) — SHIPPED 2026-02-18</summary>

#### Phase 31: Crafting & Professions
**Goal**: Players master 6 crafting professions with Arabic recipes that enhance combat

**Depends on**: Phase 30 (companions can teach professions, economy established for crafted goods)

**Requirements**: CRAFT-01, CRAFT-02, CRAFT-03, CRAFT-04, CRAFT-05, CRAFT-06, CRAFT-07, RSRC-01, RSRC-02, RSRC-03, CINT-01, CINT-02, CINT-03, CINT-04

**Success Criteria** (what must be TRUE):
  1. Player can learn and level up 6 crafting professions (خطاط/Calligrapher, طباخ/Cook, حداد/Blacksmith, عطار/Herbalist, نساج/Weaver, بناء/Builder) with Arabic skill names
  2. Player can discover recipes through exploration and NPC teaching, viewing them in RecipeBook UI with Arabic ingredient names
  3. Crafting mini-game requires Arabic vocabulary knowledge — ingredient usable only if word is learned
  4. Player can gather zone-specific resources with Arabic names from respawning gathering spots in the world
  5. Crafted equipment integrates with existing equipment system (can be best-in-slot)
  6. Crafted consumables (food from Cook, potions from Herbalist) provide battle buffs when used in combat
  7. Calligraphy profession creates enchantment scrolls that enhance equipment with Arabic inscriptions
  8. Each profession teaches approximately 50 domain-specific Arabic vocabulary words integrated with FSRS system
  9. Profession mastery contributes to zone reputation and unlocks new NPC dialogue branches

**Plans**: 8 plans in 4 waves

Plans:
- [x] 31-01-PLAN.md — craftingSlice + data files (professions/recipes/resources) + IndexedDB persistence + EventBus events
- [x] 31-02-PLAN.md — TDD crafting logic (quality calc, XP gains, vocab gating, resource checks)
- [x] 31-03-PLAN.md — GatheringSpotManager (Phaser system) + gathering spot data
- [x] 31-04-PLAN.md — RecipeBook + ProfessionPanel + IngredientSelector UI
- [x] 31-05-PLAN.md — Mini-games: CalligraphyTracing + CookingRecipeOrder + SmithingRhythm
- [x] 31-06-PLAN.md — Mini-games: PlantIdentification + PatternMatching + DirectionalPlacement
- [x] 31-07-PLAN.md — Combat integration (crafted equipment, consumable buffs, enchantment scrolls)
- [x] 31-08-PLAN.md — GameLayout wiring + GatheringSpotManager in WorldScene + NPC/companion integration

#### Phase 32: Status Effects & Advanced Combat
**Goal**: Players use Arabic vocabulary to apply status effects, chain grammar combos, and conquer arena challenges

**Depends on**: Phase 31 (crafted consumables used in advanced battles, profession buffs affect combat)

**Requirements**: STAT-01, STAT-02, STAT-03, STAT-04, COMBO-01, COMBO-02, COMBO-03, COMBO-04, COMBO-05, ADVB-01, ADVB-02, ADVB-03, ADVB-04, ADVB-05, ARENA-01, ARENA-02, ARENA-03, ARENA-04

**Success Criteria** (what must be TRUE):
  1. Battle system supports 20+ status effects with Arabic names tied to vocabulary mastery
  2. Grammar combo system supports noun+adjective, verb conjugation chains, and full sentence constructions
  3. Multi-target battles support up to 4 enemies with front/back row positioning
  4. Wave-based arena, 6-boss rush, and 3 puzzle battle types are all playable
  5. Post-battle review screen shows all Arabic vocabulary and grammar used with accuracy statistics

**Plans**: 11 plans in 7 waves

Plans:
- [x] 32-01-PLAN.md through 32-11-PLAN.md — Complete

</details>

<details>
<summary>✅ v7.0 World & Content (Phases 33-37) — SHIPPED 2026-03-16</summary>

- [x] Phase 33: Living World (NPC Schedules + Movement) (3/3 plans) — 2026-03-16
- [x] Phase 34: Data-Driven Events (ActionSets + Event Scripts) (3/3 plans) — 2026-03-16
- [x] Phase 35: Economy + Home (Production Chains + Decoration) (4/4 plans) — 2026-03-16
- [x] Phase 36: Quest Journal + Audio (Notebook + Buses) (4/4 plans) — 2026-03-16
- [x] Phase 37: Polish + Replay (Randomizer + Settings) (4/4 plans) — 2026-03-16

</details>

<details>
<summary>✅ v8.0 Visual Overhaul (Phases 38-43) — SHIPPED 2026-03-18</summary>

- [x] Phase 38: Asset Pipeline & BootScene (2/2 plans) — 2026-03-16
- [x] Phase 39: Terrain Rendering (3/3 plans) — 2026-03-18
- [x] Phase 40: Buildings & Decorations (3/3 plans) — 2026-03-18
- [x] Phase 41: Characters & Ambient Life (3/3 plans) — 2026-03-18
- [x] Phase 42: Phaser UI & Arabic BitmapFont (3/3 plans) — 2026-03-18
- [x] Phase 43: Zone References & Cleanup (2/2 plans) — 2026-03-18

</details>

<details>
<summary>✅ v9.0 Content Depth (Phases 44-46) — SHIPPED 2026-03-18</summary>

- [x] Phase 44: NPC Dialogue Expansion (3/3 plans) — 2026-03-18
- [x] Phase 45: Quest Storylines (3/3 plans) — 2026-03-18
- [x] Phase 46: Vocabulary Expansion (3/3 plans) — 2026-03-18

</details>

<details>
<summary>✅ v10.0 Onboarding & First 5 Minutes (Phase 47) — SHIPPED 2026-03-19 (Phases 48-49 absorbed into v11.0)</summary>

- [x] Phase 47: Cinematic Intro (3/3 plans) — 2026-03-19
- [x] Phase 48: Learning Path Choice — absorbed into Phase 51
- [x] Phase 49: First Quest & Loop Completion — absorbed into Phase 51

</details>

<details>
<summary>✅ v11.0 Deep Systems & Content Engine (Phases 50-55) — SHIPPED 2026-03-21</summary>

- [x] Phase 50: Infrastructure Baseline (3/3 plans) — 2026-03-19
- [x] Phase 51: Dialogue Foundation & Learning Paths (6/6 plans) — 2026-03-20
- [x] Phase 52: Vocabulary Expansion (3/3 plans) — 2026-03-20
- [x] Phase 53: Faction Reputation Engine (3/3 plans) — 2026-03-20
- [x] Phase 54: World Life Systems (4/4 plans) — 2026-03-20
- [x] Phase 55: Mini-Games and Content Polish (5/5 plans) — 2026-03-21

</details>

---

### v12.0 Learning Systems (Phases 56-64) — In Progress

**Milestone Goal:** Build the teaching systems that make Gogo Arabic a structured Arabic course inside an RPG — 6 skill trees, 50 grammar lessons, 18 quiz types, adaptive difficulty, CEFR diagnostic placement, and 250+ achievements that reward mastery.

**Coverage:** 21 requirements across 9 phases (FIX-01, FIX-02, SKILL-01 to SKILL-04, GRAM-01 to GRAM-04, QUIZ-01 to QUIZ-03, CEFR-01 to CEFR-04, ACH-01 to ACH-04)

Full phase details: [milestones/v12.0-ROADMAP.md](milestones/v12.0-ROADMAP.md)

#### Phase 56: Bug Fixes & Redux Foundation — COMPLETE (2026-03-22)
**Goal**: Two pre-existing bugs are fixed and every downstream v12.0 system has the Redux foundation it needs — no new feature can break because of missing middleware wiring or colliding lesson IDs
**Depends on**: Phase 55 (v11.0 complete)
**Requirements**: FIX-01, FIX-02
**Success Criteria** (what must be TRUE):
  1. Completing any grammar lesson fires achievement checks — a player who finishes lesson_verb_present and has the grammar achievement condition met sees the achievement toast appear in the same session
  2. All existing grammar lesson references in quests, ink dialogue, and FSRS sync use string slug IDs — no numeric index references remain anywhere in the codebase
  3. `placementSlice` and `cefrProgressSlice` are registered in store.js, persisted to IndexedDB with bumped CURRENT_VERSION and migration function, and hydrate without error on a real v11.0 save snapshot
  4. `learningProgressMiddleware` is scaffolded and wired into the Redux middleware chain

Plans:
- [x] 56-01: achievementMiddleware grammar_lessons wiring + grammar lesson slug ID migration (FIX-01, FIX-02)
- [x] 56-02: placementSlice + cefrProgressSlice registration + localStorage persistence + learningProgressMiddleware scaffold — 2026-03-22

#### Phase 57: Skill Tree Infrastructure
**Goal**: Six skill trees reflect everything the player has already learned and gate all future v12.0 content — existing players see their mastery represented, new players earn their first unlocks within minutes
**Depends on**: Phase 56 (learningProgressMiddleware scaffolded; grammar lesson slugs migrated)
**Requirements**: SKILL-01, SKILL-02, SKILL-03, SKILL-04
**Success Criteria** (what must be TRUE):
  1. Completing a quest, grammar lesson, quiz session, vocabulary review, calligraphy letter, or poetry battle awards XP to the appropriate skill tree — the XP bar in SkillTreeView visibly advances
  2. A player who loads their v11.0 save sees their skill trees already populated — nodes are unlocked matching current FSRS mastery, quest completions, and grammar lessons; no earned content is retroactively locked
  3. Unlocking a skill tree node can reveal a new spell, companion dialogue option, zone access flag, or NPC branch — at least one node of each type exists across the 6 trees
  4. SkillTreeView displays XP progress bars per tree and shows the next 1-2 unlockable nodes highlighted; locked nodes beyond the visible frontier are collapsed

Plans:
- [x] 57-01: skillTrees.js expanded to 30 nodes per tree + initializeSkillTree(existingPlayerState) + learningProgressMiddleware XP routing (SKILL-01, SKILL-02)
- [x] 57-02: Skill tree node reward types: unlock_spell, unlock_dialogue, unlock_zone, unlock_npc_branch + ActionSetExecutor skill_tree_level condition (SKILL-03)
- [x] 57-03: SkillTreeView.jsx — one tree at a time, progressive disclosure, XP bars, next-node highlights, lazy-loaded (SKILL-04) — 2026-03-22

#### Phase 58: Grammar A1-A2 + Lesson Wiring
**Goal**: Players who open the Grammar section encounter a meaningful A1-A2 curriculum with real exercise variety, and every completed lesson awards Grammar skill tree XP and auto-unlocks the next lesson
**Depends on**: Phase 57 (Grammar skill tree exists and can receive XP from lesson completion)
**Requirements**: GRAM-02, GRAM-04
**Success Criteria** (what must be TRUE):
  1. Each grammar lesson presents at least 12 distinct exercise types including conjugation drill, sentence transformation, word order, and error identification — a player completing any A1-A2 lesson encounters at least 4 different exercise formats
  2. Completing a grammar lesson immediately awards Grammar skill tree XP visible in SkillTreeView and auto-unlocks the next lesson in sequence

Plans:
- [x] 58-01: 20 A1-A2 grammar lessons in grammar.js with 12 exercise types + grammarChecker vitest + ExerciseStage 12 renderers (GRAM-02) — 2026-03-22
- [x] 58-02: learningProgressMiddleware grammar completion → Grammar skill tree XP + auto-unlock next lesson + lesson sequence gating in GrammarModule + migration 12 (GRAM-04) — 2026-03-22

#### Phase 59: Adaptive Difficulty Engine
**Goal**: Quiz sessions target a 70-85% success rate for every player and adapt question format to player weaknesses — in place before any new quiz types ship
**Depends on**: Phase 57 (skill tree CEFR level data needed for QUIZ_TYPE_REGISTRY cefrMin gates)
**Requirements**: QUIZ-02, QUIZ-03
**Success Criteria** (what must be TRUE):
  1. A player struggling with grammar questions (below 70% accuracy) receives more grammar format questions in subsequent rounds — observable within a single extended quiz session
  2. FSRS-due cards are always eligible regardless of difficulty tier — adaptive engine controls question format only, never filters scheduled cards
  3. A player consistently answering correctly (above 85%) sees distractor difficulty increase — wrong answers become more plausible Arabic words

Plans:
- [x] 59-01: Rolling session accuracy tracker in useQuiz.js + per-content-cluster difficulty tracking + FSRS-due override flag (QUIZ-02) — 2026-03-22
- [ ] 59-02: QUIZ_TYPE_REGISTRY in quizTypes.js with 18 types, minLevel/cefrMin gates + format-selection logic routing grammar-weak players to grammar quiz types (QUIZ-03)

#### Phase 60: Quiz Expansion (Core 3 Types)
**Goal**: Three new quiz types are playable and gated by CEFR level, giving players fundamentally different practice modes compared to the existing 12 types
**Depends on**: Phase 59 (adaptive difficulty engine in place — all new types inherit format selection and FSRS-due override from day one)
**Requirements**: QUIZ-01
**Success Criteria** (what must be TRUE):
  1. A player at A2 CEFR level or above can access GrammarFill quizzes — completing a fill-in-blank conjugation exercise where selecting the correct Arabic verb form is required
  2. A player can complete a WordOrder exercise by arranging Arabic word tokens using drag-and-drop at B1+ — appears in the quiz rotation
  3. A player at A2+ can complete a ClozePassage quiz — reading a short Arabic paragraph with blanks and selecting correct missing words from FSRS-sourced options
  4. All 18 quiz type definitions exist in QUIZ_TYPE_REGISTRY including the three deferred types (DialectIdentify, RootExpand, CulturalContext) marked cefrMin: 'B2'

Plans:
- [ ] 60-01: GrammarFill.jsx — conjugation fill-in-blank with Arabic verb paradigm display + QuizOverlay switch integration (QUIZ-01)
- [ ] 60-02: WordOrder.jsx — extends SentenceBuilder drag-and-drop for sentence arrangement at B1+ (QUIZ-01)
- [ ] 60-03: ClozePassage.jsx — paragraph with FSRS-sourced blank options at A2+ + QUIZ_TYPE_REGISTRY 18-type completion with deferred type stubs (QUIZ-01)

#### Phase 61: CEFR Placement Test
**Goal**: New players start at the right CEFR level — the diagnostic test places them conservatively, pre-unlocks appropriate skill tree nodes and grammar lessons, and gives an escape hatch if placement feels wrong
**Depends on**: Phase 59 (adaptive difficulty engine provides CAT item selection) and Phase 58 (A1-A2 grammar content provides grammar section questions)
**Requirements**: CEFR-01, CEFR-02, CEFR-04
**Success Criteria** (what must be TRUE):
  1. A new player on first launch is offered the placement test; completing it assigns a CEFR level one tier below their raw score with a "Start Lower" button to drop one more tier
  2. After placement test completion, skill tree nodes and grammar lessons appropriate to the assigned CEFR level are pre-unlocked — a player placed at A2 can immediately access A2 grammar lessons
  3. A player can navigate to Settings and retake the placement test with a warning explaining that retaking resets CEFR tracking history

Plans:
- [ ] 61-01: placementTest.js — 20-30 calibrated CAT questions spanning Pre-A1 through B1 across all 6 tree domains + placementEngine.js IRT binary search (CEFR-01)
- [ ] 61-02: PlacementTestOverlay.jsx — reuses existing quiz type components, one-level-lower default, "Start Lower" escape hatch, B1 cap, early-exit at 10 consecutive correct (CEFR-01)
- [ ] 61-03: Placement result fan-out via react-redux batch() — pre-unlock skill tree nodes + grammar lessons + write CEFR level to cefrProgressSlice + settings retake UI (CEFR-02, CEFR-04)

#### Phase 62: Grammar B1-B2 + CEFR Gating
**Goal**: The grammar curriculum is complete at 50 lessons covering A1 through B2, with B1 and B2 lessons gated behind skill tree progression thresholds
**Depends on**: Phase 61 (placement test assigns B1/B2 levels that now need grammar content to unlock; Phase 58 validated lesson schema in production)
**Requirements**: GRAM-01, GRAM-03
**Success Criteria** (what must be TRUE):
  1. The grammar section contains 50 lessons total covering A1 through B2 — a player who has completed all A1 and A2 lessons can see B1 lessons listed (locked behind Grammar tree level 3) and B2 lessons (locked behind Grammar tree level 5)
  2. A player who reaches Grammar tree level 3 sees B1 grammar lessons unlock automatically; reaching level 5 unlocks B2 — attempting to open a locked lesson shows "Requires Grammar Tree Level X" with current level shown
  3. A "New content added" notification appears on first load after this phase ships for existing players whose grammar completion percentage has changed

Plans:
- [ ] 62-01: 30 new B1-B2 grammar lessons in grammar.js completing the 50-lesson curriculum (GRAM-01)
- [ ] 62-02: Skill tree gate enforcement in GrammarOverlay — B1 lessons locked until Grammar tree level 3, B2 until level 5 + "new content" toast for existing players (GRAM-03)

#### Phase 63: Achievement Expansion
**Goal**: The achievement system recognizes mastery across every learning activity — 250+ achievements in 4 tiers give players concrete milestones to pursue and a dedicated panel lets them track progress by category
**Depends on**: Phase 62 (all event sources — skill tree, 50 grammar lessons, quiz expansion, placement — are complete; achievement conditions can be authored accurately)
**Requirements**: ACH-01, ACH-02, ACH-04
**Success Criteria** (what must be TRUE):
  1. The achievements data file contains 250+ entries across at least 15 categories — the Achievements panel shows achievements for vocabulary milestones, grammar completion, quiz streaks, skill tree progress, CEFR level reached, and placement test completion
  2. Every achievement has a tier label (Bronze, Silver, Gold, or Legendary) and the Achievements panel displays the tier badge visually
  3. Achievement progress is visible before completion — a player can filter by category and see how close they are to each unearned achievement

Plans:
- [ ] 63-01: achievements.js expanded with 206 new entries in existing 20-category schema + Bronze/Silver/Gold/Legendary tier field on all achievements (ACH-01, ACH-02)
- [ ] 63-02: New isAchievementMet() requirement types: skill_tree_nodes, skill_tree_complete, quiz_type_streak, cefr_level_reached, placement_complete + quizTypeStats in achievementSlice.stats (ACH-01)
- [ ] 63-03: AchievementsPanel.jsx — category filter tabs, tier badge display, progress bars on incomplete achievements, lazy-loaded (ACH-04)

#### Phase 64: CEFR Reports + Social Sharing
**Goal**: Players can see their CEFR level progress over time as a visual report and share their Arabic learning milestone as a social card — the report never shows CEFR going backwards and the share card works without external image dependencies
**Depends on**: Phase 63 (all upstream data — placement baseline, grammar completions, FSRS aggregation, skill tree state — is complete and stable)
**Requirements**: CEFR-03, ACH-03
**Success Criteria** (what must be TRUE):
  1. A player can open a CEFR Progress Report showing a radar chart of skill distribution across 6 trees and a line chart of CEFR level over time — both charts are visible on the first session after taking the placement test
  2. The CEFR level shown in the progress report never goes backwards — only upward level changes are recorded; write-once-per-session snapshot model
  3. A player can generate a shareable card showing their Arabic learning milestone and either share via Web Share API or copy to clipboard — the card is generated without any external image requests and works in production

Plans:
- [ ] 64-01: recharts install (v3.8.0) + CefrProgressReport.jsx — RadarChart + LineChart, lazy-loaded in charts-vendor chunk; write-once-per-session CEFR snapshot in cefrProgressSlice (CEFR-03)
- [ ] 64-02: Scholar's Scroll ink dialogue — Amira delivers CEFR milestone moments reusing inkjs v11.0 + Amira companion (CEFR-03)
- [ ] 64-03: SocialShareCard.jsx — SVG-only design, Web Share API + clipboard fallback; html-to-image v1.11.13 conditional install (ACH-03)

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 27.1 → 28 → 29 → 30 → ... → 64

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
| 19. Infrastructure & Architecture | v5.0 | 4/4 | Complete | 2026-02-11 |
| 20. Dialogue System | v5.0 | 6/6 | Complete | 2026-02-11 |
| 21. Guided Onboarding & Mentor | v5.0 | 1/1 | Complete | 2026-02-11 |
| 22. Buildings & Interiors | v5.0 | 3/3 | Complete | 2026-02-11 |
| 23. Interactive Objects & World Life | v5.0 | 1/1 | Complete | 2026-02-11 |
| 24. Structured Progression & Gates | v5.0 | 1/1 | Complete | 2026-02-11 |
| 25. Vocabulary Integration | v5.0 | 1/1 | Complete | 2026-02-11 |
| 26. Narrative Branching & Polish | v5.0 | 1/1 | Complete | 2026-02-11 |
| 27.1. IndexedDB Migration | v6.0 | 2/2 | Complete | 2026-02-12 |
| 28. Root Magic & Elemental Affinity | v6.0 | 4/4 | Complete | 2026-02-12 |
| 29. Equipment, Inventory & Economy | v6.0 | 5/5 | Complete | 2026-02-12 |
| 30. Companion System | v6.0 | 5/5 | Complete | 2026-02-13 |
| 31. Crafting & Professions | v6.1 | 8/8 | Complete | 2026-02-13 |
| 32. Status Effects & Advanced Combat | v6.1 | 11/11 | Complete | 2026-02-18 |
| 33. Living World (NPC Schedules + Movement) | v7.0 | 3/3 | Complete | 2026-03-16 |
| 34. Data-Driven Events (ActionSets + Event Scripts) | v7.0 | 3/3 | Complete | 2026-03-16 |
| 35. Economy + Home (Production Chains + Decoration) | v7.0 | 4/4 | Complete | 2026-03-16 |
| 36. Quest Journal + Audio (Notebook + Buses) | v7.0 | 4/4 | Complete | 2026-03-16 |
| 37. Polish + Replay (Randomizer + Settings) | v7.0 | 4/4 | Complete | 2026-03-16 |
| 38. Asset Pipeline & BootScene | v8.0 | 2/2 | Complete | 2026-03-16 |
| 39. Terrain Rendering | v8.0 | 3/3 | Complete | 2026-03-18 |
| 40. Buildings & Decorations | v8.0 | 3/3 | Complete | 2026-03-18 |
| 41. Characters & Ambient Life | v8.0 | 3/3 | Complete | 2026-03-18 |
| 42. Phaser UI & Arabic BitmapFont | v8.0 | 3/3 | Complete | 2026-03-18 |
| 43. Zone References & Cleanup | v8.0 | 2/2 | Complete | 2026-03-18 |
| 44. NPC Dialogue Expansion | v9.0 | 3/3 | Complete | 2026-03-18 |
| 45. Quest Storylines | v9.0 | 3/3 | Complete | 2026-03-18 |
| 46. Vocabulary Expansion | v9.0 | 3/3 | Complete | 2026-03-18 |
| 47. Cinematic Intro | v10.0 | 3/3 | Complete | 2026-03-19 |
| 48. Learning Path Choice | v10.0 | — | Absorbed into Phase 51 | — |
| 49. First Quest & Loop Completion | v10.0 | — | Absorbed into Phase 51 | — |
| 50. Infrastructure Baseline | v11.0 | 3/3 | Complete | 2026-03-19 |
| 51. Dialogue Foundation & Learning Paths | v11.0 | 6/6 | Complete | 2026-03-20 |
| 52. Vocabulary Expansion | v11.0 | 3/3 | Complete | 2026-03-20 |
| 53. Faction Reputation Engine | v11.0 | 3/3 | Complete | 2026-03-20 |
| 54. World Life Systems | v11.0 | 4/4 | Complete | 2026-03-20 |
| 55. Mini-Games and Content Polish | v11.0 | 5/5 | Complete | 2026-03-21 |
| 56. Bug Fixes & Redux Foundation | v12.0 | 1/2 | Complete    | 2026-03-22 |
| 57. Skill Tree Infrastructure | v12.0 | 0/3 | Complete    | 2026-03-22 |
| 58. Grammar A1-A2 + Lesson Wiring | v12.0 | 2/2 | Complete    | 2026-03-22 |
| 59. Adaptive Difficulty Engine | v12.0 | 0/2 | Not started | - |
| 60. Quiz Expansion (Core 3 Types) | v12.0 | 0/3 | Not started | - |
| 61. CEFR Placement Test | v12.0 | 0/3 | Not started | - |
| 62. Grammar B1-B2 + CEFR Gating | v12.0 | 0/2 | Not started | - |
| 63. Achievement Expansion | v12.0 | 0/3 | Not started | - |
| 64. CEFR Reports + Social Sharing | v12.0 | 0/3 | Not started | - |

**Cumulative:** 55 phases shipped, 137+ plans complete, 11 milestones shipped

---
*Roadmap created: 2026-02-08*
*Last updated: 2026-03-22 — Phase 58 COMPLETE (GRAM-02 + GRAM-04: 20 A1-A2 lessons, 12 exercise types, lesson unlock wiring, GrammarModule gating, migration 12)*
