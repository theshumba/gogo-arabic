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
- 🚧 **v9.0 Content Depth** — Phases 44-46 (in progress)
- 📋 **v10.0 Onboarding & First 5 Minutes** — Phases 47-49 (planned)
- 📋 **v11.0 Deep Systems & Content Engine** — Phases 50-55 (planned)

## Phases

**Phase Numbering:**
- Integer phases (1-55): Planned milestone work
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

### v9.0 Content Depth (Phases 44-46) — In Progress

**Milestone Goal:** Fill the game with substance — rich NPC dialogue grounded in real Islamic Golden Age history, a fleshed-out quest storyline spanning all zones, and vocabulary expansion from 1,220 to 5,000+ words with CEFR tagging, root family groupings, and semantic clusters.

**Coverage:** 16 requirements across 3 phases (DIAL-01 to DIAL-05, QUEST-01 to QUEST-05, VOCAB-01 to VOCAB-06)

#### Phase 44: NPC Dialogue Expansion
**Goal**: Players encounter NPCs with rich, distinct personalities and historically grounded Arabic and Islamic cultural content that makes every conversation feel educational and alive

**Depends on**: Phase 43 (v8.0 visual overhaul complete — NPC sprites and dialogue UI finalized)

**Requirements**: DIAL-01, DIAL-02, DIAL-03, DIAL-04, DIAL-05

**Success Criteria** (what must be TRUE):
  1. All 23 main NPCs have a clearly distinct voice — talking to any two NPCs feels different in tone, humor, and cultural knowledge (no two NPCs share the same personality template)
  2. At least 8 NPCs reference specific verifiable historical facts from the Islamic Golden Age, Silk Road, or House of Wisdom when conversed with
  3. The game contains 1,543+ total dialogue lines (500+ new lines added to the ~1,043 existing baseline)
  4. When a player learns a new vocabulary word through NPC dialogue, a cultural note surfaces showing either its Arabic loanword survival in English or its historical context of use
  5. Words taught by NPCs via teachWord fields are added to the player's FSRS review queue and appear in the next scheduled review session

**Plans**: 3 plans in 2 waves

Plans:
- [x] 44-01-PLAN.md — Rewrite dialogue for NPCs 1-12 (scholar-yusuf through storyteller-noor) with personality, cultural depth, teachWord, culturalNote
- [x] 44-02-PLAN.md — Rewrite dialogue for NPCs 13-24 (wanderer-ali through guide-amira) with personality, cultural depth, teachWord, culturalNote
- [x] 44-03-PLAN.md — Wire culturalNote display in DialogueOverlay + teachWord/FSRS verification + final line count

#### Phase 45: Quest Storylines
**Goal**: Players have a compelling narrative arc to pursue — an 8-act main storyline plus per-zone side content that makes every Arabic learning moment feel purposeful and story-motivated

**Depends on**: Phase 44 (NPC dialogue expanded — quest dialogues build on the same NPC personalities and cultural grounding)

**Requirements**: QUEST-01, QUEST-02, QUEST-03, QUEST-04, QUEST-05

**Success Criteria** (what must be TRUE):
  1. Player can follow an 8-act main storyline as a time-traveling scholar collecting manuscript pages, with each act unlocking in a different zone and advancing through a readable story
  2. Every zone has at least 2 side quests where Arabic learning is woven into the narrative action — not presented as a bare vocabulary task
  3. Each companion NPC has a personal quest available that, on completion, raises their relationship score and adds a batch of zone-specific vocabulary to the player's FSRS queue
  4. Players can discover hidden Arabic inscriptions placed in the world that, when found, teach a root family grouping and add associated words to review
  5. Quest dialogue branches differently based on the player's chosen learning path (Scholar/Traveler/Historian), so the same quest feels contextually appropriate for each path

**Plans**: 3 plans in 2 waves

Plans:
- [x] 45-01-PLAN.md — 8-act main storyline quests + act dialogue arcs in npcStoryArcs.js (QUEST-01)
- [x] 45-02-PLAN.md — 16 zone side quests + 12 companion personal quests + npcs.json dialogue (QUEST-02, QUEST-03)
- [x] 45-03-PLAN.md — Hidden inscription interactables + learningPath condition engine + per-path dialogue branches (QUEST-04, QUEST-05)

#### Phase 46: Vocabulary Expansion
**Goal**: The FSRS vocabulary system contains 5,000+ words organized so players always encounter the most useful Arabic first, with every word contextualized by CEFR level, root family, and semantic category

**Depends on**: Phase 45 (quest storylines define which vocabulary clusters matter most per zone — vocabulary expansion fills those clusters)

**Requirements**: VOCAB-01, VOCAB-02, VOCAB-03, VOCAB-04, VOCAB-05, VOCAB-06

**Success Criteria** (what must be TRUE):
  1. vocabularyAll.js contains 5,000+ words (expanded from 1,220 baseline), with no duplicate entries
  2. Every word in the vocabulary review UI displays its CEFR level tag (A1, A2, B1, or B2) alongside the Arabic and English
  3. Root Explorer shows complete root family groupings — searching a trilateral root like ك-ت-ب surfaces all derived forms together in one view
  4. Words are browseable by semantic cluster (food, family, travel, nature, body, colors, numbers, etc.) in the vocabulary interface, so a player can study a topic end-to-end
  5. Within each CEFR level, high-frequency words appear before rare ones in new FSRS card generation — a player who just started A2 encounters common words first

**Plans**: 3 plans in 3 waves

Plans:
- [x] 46-01-PLAN.md — Write A1 (500 words) + A2 (1,000 words) into vocabularyExpanded.js with VOCAB-06 schema
- [ ] 46-02-PLAN.md — Append B1 (2,000 words) + B2 (1,500 words) to vocabularyExpanded.js
- [ ] 46-03-PLAN.md — Merge into vocabularyAll.js + CEFR badge in TeacherWordCard + Root Explorer cluster browsing + frequency-ordered FSRS selector

---

### v10.0 Onboarding & First 5 Minutes (Phases 47-49) — Planned

**Milestone Goal:** Create a cinematic, discovery-driven onboarding that teaches the core game loop in under 2 minutes without a single tutorial popup — the first 30 seconds decide if someone keeps playing.

**Coverage:** 18 requirements across 3 phases (INTRO-01 to INTRO-05, PATH-01 to PATH-05, QUEST-01 to QUEST-05, UX-01 to UX-03)

#### Phase 47: Cinematic Intro
**Goal**: New players experience a scripted cinematic opening — text crawl, dawn pan, first floating Arabic word, discovery moment, and Guide Amira's arrival — with no menus or tutorial popups interrupting the flow

**Depends on**: Phase 46 (v9.0 content complete — Amira's dialogue trees and vocabulary data are in place)

**Requirements**: INTRO-01, INTRO-02, INTRO-03, INTRO-04, INTRO-05, UX-01, UX-02

**Success Criteria** (what must be TRUE):
  1. A new player sees a 5-second text crawl ("A young scholar discovers an ancient manuscript...") immediately after the loading screen, before any game UI appears
  2. After the text crawl, the camera fades into Oasis Village at dawn and pans slowly to the player character — no HUD, menus, or overlays are visible during this sequence
  3. A glowing, interactive Arabic word appears floating in the world; the player can walk to it and touch it without any prompt telling them to do so
  4. Touching the first floating word plays a reward animation and teaches the word — no quiz, no explanation screen, just discovery feedback
  5. Guide Amira appears after the first word is learned, delivers one contextual line, and hands the player their first quest — the entire opening from text crawl to quest receipt takes under 60 seconds
  6. The existing 6-step onboarding tutorial is bypassed for new players who have gone through the cinematic intro — the two flows do not both run

**Plans**: 3 plans in 3 waves

Plans:
- [x] 47-01-PLAN.md — CinematicIntroSequencer.js (text crawl + camera fade + dawn pan) + bypass React CinematicIntro in GameLayout
- [x] 47-02-PLAN.md — FloatingWordObject.js (gold glow + Arabic text + proximity SPACE interact + FSRS dispatch) + sequencer integration
- [x] 47-03-PLAN.md — Amira arrival dialogue + setTutorialPhase(awaiting_mentor) + setActiveQuest(tutorial_welcome) + human verify

#### Phase 48: Learning Path Choice
**Goal**: After learning the first word, players are prompted by Guide Amira to choose their Arabic learning focus — Scholar, Traveler, or Historian — and the game immediately begins shaping their experience around that choice

**Depends on**: Phase 47 (cinematic intro complete — Amira is present and first quest has been given)

**Requirements**: PATH-01, PATH-02, PATH-03, PATH-04, PATH-05 *(absorbed into v11.0 Phase 51)*

**Success Criteria** (what must be TRUE):
  1. After the first word is learned, Guide Amira asks "What draws you to Arabic?" — the prompt appears as natural in-world dialogue, not a menu screen
  2. Player picks one of three paths (Scholar القارئ, Traveler المسافر, Historian المؤرخ) through a choice in the existing dialogue system — no new overlay required
  3. All three paths teach the same Fusha Arabic — a player on any path encounters the same language, just in a different word-frequency order and with different NPC emphasis
  4. The chosen path is reflected immediately: the first real quest assigned, the next NPC the player is pointed toward, and the initial FSRS word ordering all differ by path
  5. A player can switch their learning path from the settings/profile at any time; the interface shows a warning that priority bonuses reset on switch

**Plans**: TBD (absorbed into v11.0 Phase 51)

Plans:
- [ ] 48-01-PLAN.md — learningPathSlice (Scholar/Traveler/Historian state + switch action) + path-aware FSRS word ordering
- [ ] 48-02-PLAN.md — PATH-01/PATH-02 Amira dialogue tree + path choice wired to DialogueEngine choice handler
- [ ] 48-03-PLAN.md — PATH-03/PATH-04 path effects (quest routing, NPC relationship bonuses) + PATH-05 switch UI in settings/profile

#### Phase 49: First Quest & Loop Completion
**Goal**: Players complete the first quest by learning 3 Arabic words from village objects, receive a meaningful reward, and finish onboarding having understood the core loop — without a single tutorial popup

**Depends on**: Phase 48 (learning path chosen — first quest content and mentor NPC depend on path)

**Requirements**: QUEST-01, QUEST-02, QUEST-03, QUEST-04, QUEST-05, UX-03 *(absorbed into v11.0 Phase 51)*

**Success Criteria** (what must be TRUE):
  1. Words float visibly above pots, signs, and buildings in the village — the player can see at least 3 interactable floating words without moving far from the start position
  2. Touching each floating word teaches it with visual Arabic script, transliteration, and an audio pronunciation cue — no separate quiz screen required
  3. After learning 3 words, the player receives a gold coin reward, sees an achievement toast ("You know 3 Arabic words!"), and the quest completes — all without leaving the world
  4. The first real quest offered after completion (and the mentor NPC assigned) differs based on the player's chosen learning path — Scholar, Traveler, and Historian each get a thematically matched follow-up
  5. A returning player who has completed onboarding skips directly to the normal game start — onboarding completion is stored in the game's persist layer (IndexedDB) and survives page reload

**Plans**: TBD (absorbed into v11.0 Phase 51)

Plans:
- [ ] 49-01-PLAN.md — FloatingWordObjects for 3+ village items (pots/signs/buildings) + teach-on-touch with visual+audio feedback (QUEST-01, QUEST-02)
- [ ] 49-02-PLAN.md — Quest completion trigger: 3 words learned → gold reward + achievement toast + "You know 3 Arabic words!" (QUEST-03)
- [ ] 49-03-PLAN.md — Path-gated first real quest + mentor NPC assignment + onboarding completion flag in IndexedDB (QUEST-04, QUEST-05, UX-03)

---

### v11.0 Deep Systems & Content Engine (Phases 50-55) — Planned

**Milestone Goal:** Build all the under-the-hood systems that make the game feel alive — bundle optimization, world state machine, inkjs dialogue migration, learning path wiring, faction reputation, dynamic economy, NPC gossip, environmental storytelling, progressive tashkeel refinement, calligraphy mini-game, and Arabic poetry battles. Absorbs v10.0 Phases 48-49.

**Coverage:** 56 requirements across 6 phases (INFRA-01 to INFRA-09, CONT-01 to CONT-08, PATH-01 to PATH-07, FACT-01 to FACT-06, ECON-01 to ECON-04, GOSP-01 to GOSP-05, TASH-01 to TASH-03, ENVR-01 to ENVR-04, CALL-01 to CALL-05, POET-01 to POET-05)

**Visual/UI/world/tileset work is out of scope** — user builds world visuals separately in LDtk.

#### Phase 50: Infrastructure Baseline — COMPLETE (2026-03-19)
**Goal**: The game loads under 500KB and every downstream v11.0 system has the foundation it needs — world state machine, bundle optimization, and zone-based asset loading all in place before any feature work begins

**Depends on**: Phase 49 (v10.0 complete or absorbed)

**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06

**Success Criteria** (what must be TRUE):
  1. Running `npm run build` produces an initial JS bundle under 500KB (down from 862KB), with zone-specific assets excluded from the initial load
  2. Running `npm run build:analyze` opens a treemap in the browser showing which modules account for bundle size
  3. Entering a zone for the first time shows a loading indicator while zone-specific assets load; shared assets (player sprite, UI, common NPCs) are available immediately with no flash
  4. A `WORLD_STATE_KEYS` constants file exists and every world flag write anywhere in the codebase uses a key from that file — no raw string flag names
  5. Quest completion, NPC interactions, and purchases automatically set world state flags without any manual dispatch — worldStateMiddleware handles propagation

**Plans**: 3 plans in 2 waves

Plans:
- [x] 50-01-PLAN.md — rollup-plugin-visualizer install + build:analyze script + lazy-wrap 10 heavy GameLayout overlays to reduce bundle from 1,235KB to under 500KB (INFRA-01, INFRA-03) — 2026-03-19
- [x] 50-02-PLAN.md — BootScene zone-based lazy loading: shared assets upfront, zone assets on transition (INFRA-02) — 2026-03-19
- [x] 50-03-PLAN.md — worldStateSlice (500+ flags, WORLD_STATE_KEYS constants, IndexedDB persist) + worldStateMiddleware (INFRA-04, INFRA-05, INFRA-06) — 2026-03-19

#### Phase 51: Dialogue Foundation & Learning Paths
**Goal**: The dialogue engine supports ink scripting for future narrative work, all 573 missing companion dialogue lines are filled, and players choose a learning path that immediately shapes their FSRS word queue and first quest assignment — absorbing v10.0 Phases 48-49

**Depends on**: Phase 50 (worldStateSlice provides the state machine ink needs to read and write)

**Requirements**: INFRA-07, INFRA-08, INFRA-09, CONT-01, PATH-01, PATH-02, PATH-03, PATH-04, PATH-05, PATH-06, PATH-07

**Success Criteria** (what must be TRUE):
  1. Talking to any of the 5 pilot NPCs runs their dialogue from a compiled `.ink.json` file; talking to any non-migrated NPC runs their legacy JSON dialogue without errors — both paths work simultaneously
  2. All 12 companions have complete dialogue — no companion responds with a placeholder or empty line in any conversation
  3. After the first word is learned in the village, Guide Amira asks "What draws you to Arabic?" as in-world dialogue (no menu overlay), and the player chooses Scholar, Traveler, or Historian
  4. The first real quest assigned and the FSRS word ordering both differ visibly between paths — a Scholar and a Traveler starting fresh see different first NPCs and different new card sequences
  5. A returning player who completed onboarding bypasses the cinematic intro and path prompt entirely and drops into normal gameplay
  6. Player can switch learning path from settings with a visible warning that priority bonuses reset

**Plans**: 6 plans in 3 waves

Plans:
- [x] 51-01-PLAN.md — inkjs install + InkDialogueEngine with adapter fallback (legacy JSON + .ink.json) + 5-NPC pilot migration (INFRA-07, INFRA-08, INFRA-09) — 2026-03-19
- [x] 51-02-PLAN.md — Fill 573 missing companion dialogue lines across 12 companions (CONT-01) — 2026-03-20
- [x] 51-03-PLAN.md — PATH-01/PATH-02: Amira ink dialogue tree for path choice + DialogueOverlay ink mode + useTutorialTrigger integration — 2026-03-20
- [x] 51-04-PLAN.md — PATH-03/PATH-04/PATH-05/PATH-06/PATH-07: FSRS queue reordering by path + path-gated quest/mentor assignment + switch UI + onboarding skip flag — 2026-03-20
- [x] 51-05-PLAN.md — GAP CLOSURE (PATH-03): Wire selectNewCardsByPath into rootFsrsSyncMiddleware + ReviewSession for path-aware FSRS ordering — 2026-03-20
- [x] 51-06-PLAN.md — GAP CLOSURE (PATH-04): Fix mentor NPC hardcode in useTutorialTrigger + fix quest prerequisites format + activate path quest — 2026-03-20

#### Phase 52: Vocabulary Expansion
**Goal**: The FSRS system contains 5,000+ words with domain affinity tags, CEFR levels, root families, semantic clusters, ambiguity flags, and a build-time validation script — giving every downstream system (faction vocab rewards, poetry battles, learning path differentiation) a rich word corpus to draw from

**Depends on**: Phase 51 (learning path wired — path domain affinity tags must be applied during the expansion pass, not retrofitted)

**Requirements**: CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, CONT-08

**Success Criteria** (what must be TRUE):
  1. vocabularyAll.js contains 5,000+ words with no duplicate Arabic entries, each tagged with CEFR level, root, semantic cluster, and domain affinity (Scholar/Traveler/Historian)
  2. Every word card in the review UI shows its CEFR level badge (A1/A2/B1/B2) alongside the Arabic and English
  3. Root Explorer surfaces all derived forms of a trilateral root together — searching ك-ت-ب returns كتاب، كاتب، مكتوب، مكتبة in one grouped view
  4. Words are browseable by semantic cluster in the vocabulary interface — a player can select "food" and review all food-domain words end-to-end
  5. Running `npm run vocab:validate` exits 0 with no duplicate, missing-root, or missing-CEFR-tag warnings
  6. Words tagged `ambiguous: true` retain tashkeel in all UI views regardless of the player's FSRS mastery level

**Plans**: 3 plans in 2 waves

Plans:
- [ ] 52-01-PLAN.md — Expand to 5,000+ words with CEFR, root, semantic cluster, domain affinity, and ambiguity fields (CONT-02, CONT-07)
- [ ] 52-02-PLAN.md — Build-time validation script + CEFR badge in TeacherWordCard + Root Explorer root family groupings (CONT-03, CONT-04, CONT-08)
- [ ] 52-03-PLAN.md — Semantic cluster browsing UI + frequency-ordered FSRS selector per CEFR level + ambiguous word tashkeel lock (CONT-05, CONT-06, CONT-07)

#### Phase 53: Faction Reputation Engine
**Goal**: Six factions track the player's standing across all interactions, gate bonus content at reputation thresholds, and teach faction-specific vocabulary — making every quest completion, purchase, and conversation a meaningful faction investment

**Depends on**: Phase 52 (vocabulary expansion complete — faction-specific vocabulary rewards draw from the full 5,000+ corpus with domain affinity tags already applied)

**Requirements**: FACT-01, FACT-02, FACT-03, FACT-04, FACT-05, FACT-06

**Success Criteria** (what must be TRUE):
  1. A player's faction scores for all 6 factions (Scholars, Merchants, Artisans, Travelers, Guardians, Artists) are visible somewhere in the UI with their current tier label (Neutral/Friendly/Trusted/Allied/Revered)
  2. Completing a quest, making a purchase, or choosing a dialogue option that favors a faction visibly changes that faction's score — the player can see the effect of their choices
  3. Reaching Friendly (25) with a faction unlocks additional dialogue lines from faction NPCs; Trusted (50) unlocks a side quest; Allied (75) grants a shop discount; all main storyline quests remain completable with all factions at 0
  4. ActionSetExecutor accepts `factionRequired` conditions in NPC and zone data — faction-gated content is data-driven, not hardcoded
  5. Each faction teaches at least 10 domain-specific vocabulary words at the Friendly threshold — unlocking those words adds them to the player's FSRS queue

**Plans**: 6 plans in 3 waves

Plans:
- [ ] 53-01-PLAN.md — factionSlice (6 factions, 0-100 scores, tier constants, IndexedDB persist) + factionMiddleware (FACT-01, FACT-02)
- [ ] 53-02-PLAN.md — ActionSetExecutor factionRequired requirement type + faction-gated dialogue/quest/shop data for Scholars and Merchants factions (FACT-03, FACT-04, FACT-05)
- [ ] 53-03-PLAN.md — Remaining 4 factions gated content + faction vocabulary rewards at thresholds + faction score UI (FACT-03, FACT-06)

#### Phase 54: World Life Systems
**Goal**: The world feels alive and reactive — shop prices shift based on supply and player faction standing, NPCs gossip about recent events in ink dialogue, environmental inscriptions teach Arabic in context, and tashkeel fading accounts for ambiguity and learning path

**Depends on**: Phase 53 (faction scores are inputs to dynamic pricing; ink engine from Phase 51 powers gossip and inscription dialogue)

**Requirements**: ECON-01, ECON-02, ECON-03, ECON-04, GOSP-01, GOSP-02, GOSP-03, GOSP-04, GOSP-05, TASH-01, TASH-02, TASH-03, ENVR-01, ENVR-02, ENVR-03, ENVR-04

**Success Criteria** (what must be TRUE):
  1. Shop prices visibly change between visits — buying multiple items of the same type raises the price; waiting and resting partially restores supply and lowers it; price floor is 50% of base, ceiling is 200%
  2. Faction-allied players see a 15% price discount at that faction's shops; a player can observe the price difference by checking faction alignment vs non-aligned shop prices
  3. After completing a quest or notable interaction, at least one NPC who knew the player (relationship ≥ 25) mentions it in their next conversation — gossip tokens surface as natural ink dialogue lines, not a separate gossip UI
  4. At least 20 interactive inscriptions/scrolls are placed across all 8 zones; touching one reads the inscription, adds unknown words to the FSRS queue, and can teach a root family grouping
  5. A word tagged `ambiguous: true` retains its tashkeel regardless of mastery level; a player on the Scholar path loses tashkeel more slowly than a Traveler at equivalent FSRS mastery

**Plans**: 6 plans in 3 waves

Plans:
- [ ] 54-01-PLAN.md — PricingAgent supply/demand model in EconomyFlow.js + faction modifier + price floor/ceiling + ShopOverlay price change indicators (ECON-01, ECON-02, ECON-03, ECON-04)
- [ ] 54-02-PLAN.md — GossipManager: EventBus token creation, NPC propagation (relationship ≥ 25), 3-day expiry, ink dialogue surfacing, heard flag, Arabic grammar annotation (GOSP-01, GOSP-02, GOSP-03, GOSP-04, GOSP-05)
- [ ] 54-03-PLAN.md — 20 environmental inscriptions/scrolls as ink interactions across 8 zones + FSRS queue integration + root family teaching (ENVR-01, ENVR-02, ENVR-03, ENVR-04)
- [ ] 54-04-PLAN.md — Progressive tashkeel refinement: ambiguity-aware fading + learning path fading rate + inscription proficiency-appropriate tashkeel (TASH-01, TASH-02, TASH-03)

#### Phase 55: Mini-Games and Content Polish
**Goal**: Two new Arabic learning mini-games — calligraphy tracing and poetry battles — give players deep, unique practice modes that no other Arabic learning app offers; battle code tests establish a safety net before poetry battles build on the combat system

**Depends on**: Phase 54 (vocabulary expansion from Phase 52 provides the word corpus poetry battles draw from; ink engine from Phase 51 wires poetry battle NPC dialogue)

**Requirements**: CALL-01, CALL-02, CALL-03, CALL-04, CALL-05, POET-01, POET-02, POET-03, POET-04, POET-05

**Success Criteria** (what must be TRUE):
  1. The mini-games hub has a Calligraphy entry; selecting it launches CalligraphyScene as a separate lazy-loaded Phaser scene
  2. Player can trace any of the 28 isolated Arabic letter forms using pointer or touch input; after completing the trace, the scene shows a 1-3 star rating and marks the letter as "practiced" at 2+ stars
  3. Player can find NPC poets in the world and challenge them to a poetry battle; the battle mode presents a fill-in-the-blank verse with 4 FSRS-sourced word choices at appropriate difficulty
  4. Poetry battles are untimed — no countdown, no time pressure; both player and NPC poet fill blanks at their own pace; the winner earns XP and vocabulary rewards
  5. Completing a calligraphy letter at 2+ stars or winning a poetry battle adds the practiced vocabulary to the FSRS review queue

**Plans**: 6 plans in 3 waves

Plans:
- [ ] 55-01-PLAN.md — BattleStateMachine + GrammarComboDetector + StatusEffectBar test coverage (prerequisite for poetry battle builds on combat system)
- [ ] 55-02-PLAN.md — CalligraphyScene: lazy-loaded Phaser scene + pointer path capture + 28 reference stroke paths as JSON (CALL-01, CALL-02, CALL-03)
- [ ] 55-03-PLAN.md — CalligraphyScene: Frechet distance scoring + 3-star feedback + "practiced" flag in alphabet progress + mini-games hub wiring (CALL-04, CALL-05)
- [ ] 55-04-PLAN.md — poetrySlice + 10 curated classical Arabic poems with fill-in-blank positions + FSRS word sourcing (POET-01, POET-02, POET-03)
- [ ] 55-05-PLAN.md — Poetry battle mode UI + NPC poet opponent AI + untimed scoring + XP/vocab rewards + GameLayout wiring (POET-04, POET-05)

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 27.1 → 28 → 29 → 30 → ... → 55

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
| 46. Vocabulary Expansion | v9.0 | 1/3 | In progress | — |
| 47. Cinematic Intro | v10.0 | 3/3 | At checkpoint | 2026-03-19 |
| 48. Learning Path Choice | v10.0 | 0/3 | Not started (absorbed into Phase 51) | — |
| 49. First Quest & Loop Completion | v10.0 | 0/3 | Not started (absorbed into Phase 51) | — |
| 50. Infrastructure Baseline | v11.0 | Complete    | 2026-03-19 | 2026-03-19 |
| 51. Dialogue Foundation & Learning Paths | v11.0 | Complete    | 2026-03-20 | — |
| 52. Vocabulary Expansion | v11.0 | 0/3 | Not started | — |
| 53. Faction Reputation Engine | v11.0 | 0/3 | Not started | — |
| 54. World Life Systems | v11.0 | 0/4 | Not started | — |
| 55. Mini-Games and Content Polish | v11.0 | 0/5 | Not started | — |

**Cumulative:** 46 phases shipped (Phase 45 complete), 133 plans complete, 8 milestones shipped

---
*Roadmap created: 2026-02-08*
*Last updated: 2026-03-19 — v11.0 roadmap added (Phases 50-55, 56 requirements mapped)*
