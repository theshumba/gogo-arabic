# GoGo Arabic

## What This Is

An Arabic language learning RPG built with React 19, Phaser 3, Redux Toolkit, and Express 5 + MongoDB. Players explore a pixel-art world with 8 zones, 140 NPCs, and 52 quests while learning 1,220 Arabic vocabulary words and 28 letters through FSRS spaced repetition, 6 quiz types, sentence building, grammar lessons, and word duel battles. The game features a root-based magic system where Arabic trilateral roots become elemental spells, equipment with 64 Arabic-named items across 8 slots, an economy with zone shops and Arabic numeral haggling, 12 AI companions with battle roles and CEFR-adaptive Arabic dialogue, zone-specific ambient audio with SFX, screen shake and particle effects, a 3-stage learning path, quest guidance systems, daily dashboard, fast-travel world map, player profile with stats, NPC idle animations, and outfit customization.

## Core Value

Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"

## Requirements

### Validated

- FSRS spaced repetition with 1,220 words and 6 quiz types — v1.0
- 52 quests across 8 zones with prerequisite chains — v1.0
- 7 structured grammar lessons with exercises — v1.0
- Word Duel boss battles (8 bosses, adaptive difficulty) — v1.0
- Root Explorer with search and category filtering — v1.0
- Reading comprehension (8 passages, 4 levels) — v1.0
- Word search mini-game — v1.0
- Onboarding tutorial (6 steps) — v1.0
- Daily goals, streak milestones, level-up rewards, 44 achievements — v1.0
- Typewriter dialogue with cultural NPC content — v1.0
- Sprint (Shift key), MiniMap (M key), World Map — v1.0
- Cloud sync with version vectors and conflict resolution — v1.0
- Backend: JWT cookies, CSRF, rate limiting, Zod, Helmet, pagination — v1.0
- Framer Motion route transitions and overlay animations — v1.0
- Accessibility: ARIA labels, keyboard nav, reduced motion support — v1.0
- Z-index system + clickable review badge + mobile-responsive overlays + focus traps — v2.0
- NPC quest markers (!/?) + active quest HUD + compass arrow — v2.0
- Activities menu + boss nodes on map + NPC dialogue hints — v2.0
- Contextual onboarding tooltips + streamlined HUD + bundle splitting (264KB) — v2.0
- Daily Dashboard with streak, reviews, goals, activity suggestions — v2.0
- World Map fast travel + zone completion % + locked zone teasers — v2.0
- Player Profile with stats, streak calendar, achievement showcase — v2.0
- Progressive tashkeel fading based on FSRS mastery — v2.0
- Wardrobe system with 12 outfits, shop, and equip — v2.0
- 548-test suite (unit, component, integration, E2E) with coverage thresholds — v3.0
- GameLayout refactored (607->209 lines) + ESLint 9 + Prettier 3 — v3.0
- 7 components migrated to CSS Modules + 33 named Redux selectors — v3.0
- Zone BGM with 800ms crossfade + UI/quiz/action SFX + footstep system + 4 volume sliders + mute + mobile audio unlock — v4.0
- Screen shake (3 presets) + particle effects (burst/continuous) + zone fade transitions + level-up celebration + achievement toasts — v4.0
- Learning Path menu (3-stage) + DailyDashboard progress metrics + HUD progress strip + onboarding reorder — v4.0
- NPC idle animations (desynchronized) + locked door feedback + lerp camera follow — v4.0
- Overlay close guarantees + movement unlock safety nets + zone transition timeout + empty quiz states + dialogue overflow — v4.0
- EventBus (74 namespaced constants) + narrativeSlice + DialogueEngine + 30 NPCs with dialogue trees — v5.0
- Mentor-driven in-world onboarding + 15 enterable buildings + 142 interactive objects — v5.0
- Zone gates with mastery requirements + vocabulary integration on 42 NPCs and 142 objects — v5.0
- Story arcs spanning all zones + branching quests + relationship-gated dialogue — v5.0
- IndexedDB hybrid persistence (5 slices) + auto-migration from localStorage + 80% quota warning — v6.0
- Root magic: 50 spells from Arabic trilateral roots, 10 elements, 20 combos, verb form upgrades, calligraphy VFX — v6.0
- Affinity discovery through 50+ gameplay choices, primary 2x / secondary 1.5x spell power bonuses — v6.0
- Bidirectional FSRS-root mastery sync + grammar accuracy damage multiplier — v6.0
- Equipment: 8 slots, 64 items, 5 rarity tiers (Arabic color names), stat comparisons, set bonuses — v6.0
- Inventory: 200-item grid UI, sort by type/rarity/Arabic order, vocabulary-gated affix bonuses — v6.0
- Economy: 8 zone shops, dynamic inventory, Arabic numeral haggling, auto-teach affixes — v6.0
- 12 AI companions: 4 battle roles, CEFR-scaled dialogue, relationship 0-100, gift system — v6.0
- Companion battle AI (behavior trees) + COMPANION_TURN state in battle FSM — v6.0
- Companion following (lazy pathfinding) + contextual Arabic comments + teaching specializations — v6.0
- battleRewardsMiddleware wiring XP/gold/items from battles to progression — v6.0

- NPC schedules + wander/patrol movement + night ambient BGM + schedule re-evaluation on time change — v7.0
- ActionSetExecutor (9 actions, 7 requirements) + EventScriptRunner + step triggers + visibilityFlag — v7.0
- EconomyFlow production chains + friendship system (0-100, 4 tiers) + home decoration (8x10 grid, 4 utilities) — v7.0
- QuestJournal (3 tabs) + ambient sound layers + building muffle + AutoSave (3min) + GameplayStats + sub-zones — v7.0
- VocabRandomizer + difficulty settings + CalendarEvents + TownKnowledge + BattleActionQueue + tiered currency (fils/dirham/dinar) + ActorRegistry — v7.0

### Active

## Current Milestone: v12.0 Learning Systems

**Goal:** Build the teaching systems that make Gogo Arabic a structured Arabic course inside an RPG — 6 skill trees, 50 grammar lessons, 18 quiz types, adaptive difficulty, diagnostic placement, and 250+ achievements that reward mastery.

**Target features:**
- 6 skill trees (Reading, Writing, Listening, Conversation, Grammar, Culture) with unlockable node progression
- Grammar expansion from 7 to 50 lessons covering A1-B2 with 12 exercise types per lesson
- Quiz expansion from 6 to 18 quiz types with adaptive difficulty engine
- Diagnostic placement test to start players at their correct CEFR level
- CEFR progress reports showing level advancement over time
- Achievement expansion from 44 to 250+ achievements across all categories
- Shareable "I learned X Arabic words" social cards

**Previous milestone:** v11.0 Deep Systems & Content Engine (Phases 50-55, shipped 2026-03-21)

## Shipped: v11.0 Deep Systems & Content Engine (2026-03-21)

**Delivered:** 6 phases (50-55), 24 plans, 83 commits across 2 days. All under-the-hood systems that make the game feel alive.

- Bundle optimized from 1,235KB to 402KB (67% reduction) + zone-based lazy loading + world state machine (562 flags) — Phase 50
- inkjs dialogue engine with legacy fallback + 573 companion dialogue lines filled + Scholar/Traveler/Historian learning paths with in-world Amira ink dialogue — Phase 51
- 5,029 words with CEFR/root/cluster/affinity tags + build-time vocab:validate + ambiguous tashkeel lock — Phase 52
- 6-faction reputation engine with tiers, middleware, ActionSetExecutor gating, vocab rewards, FactionPanel UI — Phase 53
- Dynamic economy (supply/demand + faction pricing) + NPC gossip system (ink surfacing + grammar) + 24 environmental inscriptions + path-aware tashkeel — Phase 54
- Calligraphy tracing mini-game (28 letters, Frechet distance, MiniGamesHub) + poetry battles (10 classical poems, 8 NPC poets, untimed, XP rewards) — Phase 55

**Previous milestone:** v10.0 Onboarding & First 5 Minutes (Phase 47 code complete, Phases 48-49 absorbed into v11.0)

### Out of Scope

- Multiplayer/real-time features — High complexity, single-player focus
- Mobile native app — Web-first, responsive CSS covers mobile
- TypeScript migration — Too large, not blocking UX issues
- OAuth login — Email/password sufficient
- Admin dashboard — Not user-facing
- Voice recognition — Complex ML, accuracy issues, high dev cost
- Full NPC schedules (Stardew-style) — High complexity, frustrating for quest-finding
- Day/night cycle — Complex, not core to "soul" feeling
- Procedural quests — Educational content needs curation
- Arabic dialect switching — Confuses learners, exponential content
- Romance options for companions — Cultural sensitivity (Islamic context)
- Companion permadeath — Too punishing for educational game
- Loot boxes / gacha mechanics — Predatory, undermines educational trust
- Real-money item shop — Pay-to-win, inappropriate for education
- Free-form spell creation — Balance nightmare, curated 50 canonical spells
- Voice pronunciation casting — Infrastructure not ready
- Calligraphic tactile spell casting — Defer to v11.0 AAA polish

## Context

**v6.0 shipped (2026-02-13):** 4 phases (27.1, 28-30), 16 plans, 160 files, 30,270 insertions. IndexedDB hybrid persistence, root magic system (50 spells, 20 combos, FSRS sync), equipment/inventory/economy (64 items, 8 slots, shops, haggling), 12 AI companions (battle AI, CEFR dialogue, relationships). All 1,023 tests pass. Bundle: 661KB.

**v5.0 shipped (2026-02-11):** 8 phases, 14 plans. Narrative infrastructure, dialogue system, mentor onboarding, buildings, interactive objects, progression gates, vocabulary integration, narrative branching.

**v4.0 shipped (2026-02-10):** 5 phases, 8 plans. Audio system, visual juice, learning progression, world life, bug fixes.

**v3.0 partial (2026-02-09):** 2 phases. Testing foundation (548 tests), architecture cleanup. Backend hardening deferred.

**v2.0 shipped (2026-02-08):** 9 phases, 14 plans. Quest guidance, feature discoverability, daily dashboard, world map, player profile, outfits.

**Codebase:** ~196K LOC (JS/JSX/CSS/JSON frontend). React 19 + Phaser 3 + Redux Toolkit (17 slices, 6 middleware) + Express 5 + MongoDB.

**Known tech debt:**
- ~~Bundle 661KB~~ → 402KB (Phase 50, lazy-loaded overlays + lazy GameLayout)
- ~~BootScene loads ALL assets upfront~~ → Zone-based lazy loading (Phase 50, shared upfront + zone on-demand)
- No tests for Phase 27 battle code (~2.6K LOC)
- ShopOverlay + CompanionUI not wired to GameLayout (~25 lines to fix)
- 573 missing companion dialogue lines, 12 missing companion sprite PNGs (content/art gaps)

## Constraints

- **Tech stack**: React 19 + Phaser 3 + Redux Toolkit + Express 5 + MongoDB (established, no changes)
- **Browser**: Modern browsers, no IE11
- **Mobile**: Responsive web, minimum 375px viewport
- **Performance**: Main bundle < 500KB after splitting (402KB as of Phase 50)
- **Accessibility**: WCAG AA compliance for all overlays, prefers-reduced-motion for all VFX
- **Cultural**: No music, no eyes/faces, no deity characters. Arabic-first, culturally respectful, historically accurate.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| CSS Modules for new components | Consistency, responsive breakpoints, accessibility | Good — used across all v2.0+ components |
| useFocusTrap for all overlays | WCAG AA compliance, hook already exists | Good — wired to all 9 overlays |
| Phaser DOMOverlay for NPC markers | Existing system, minimal overhead | Good — quest markers render cleanly |
| Custom Framer Motion tooltips (not react-joyride) | React 19 incompatibility with joyride | Good — zero new dependencies |
| Skip TypeScript migration | UX fixes are higher priority, too large | Good — avoided scope creep |
| 5-agent parallel execution | Independent features, speed | Good — shipped simultaneously |
| Vocabulary data imported directly (not in Redux) | Reduces store size, simplifies selectors | Good — cleaner architecture |
| Zero new dependencies for v4.0 | Howler.js + Phaser 3 + Framer Motion already installed | Good — no bloat |
| audioManager singleton pattern | Central audio control, easy volume sync | Good — clean separation |
| useOverlayClose hook for overlay management | Centralize ESC/click-outside, prevent stuck states | Good — 6 overlays, no freezes |
| prefers-reduced-motion gate for all VFX | WCAG AA, respect user preferences | Good — 27 files check preference |
| Nested persistReducer for IndexedDB | Preserves selector paths while using IndexedDB backend | Good — transparent to components |
| Phase ordering: storage → magic → equipment → companions | Dependency chain: IndexedDB prevents overflow, magic is educational core, equipment enhances magic, companions use both | Good — clean layered build |
| Behavior trees for companion AI | Priority-based decisions clearer than state machines for NPC roles | Good — 4 role-based trees |
| CompanionDialogueManager composition (not modification) | Avoids coupling to DialogueEngine internals | Good — clean separation |
| CEFR-based dialogue scaling | Adaptive Arabic/English ratios match learner level | Good — A1-C2 progression |
| Equipment vocabulary-gated bonuses | Motivates learning: 50% unlearned, 100% learned | Good — educational incentive |
| Arabic numeral haggling | Teaches Eastern Arabic numerals through gameplay | Good — unique learning mechanic |

---
*Last updated: 2026-03-22 after Phase 56 (Bug Fixes & Redux Foundation) complete — grammar achievement wiring fixed, v11 migration shipped, placementSlice + cefrProgressSlice + learningProgressMiddleware scaffolded*
