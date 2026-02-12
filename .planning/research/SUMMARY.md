# Project Research Summary

**Project:** GoGo Arabic v6.0 Combat & RPG Systems
**Domain:** Arabic Learning RPG — Turn-based combat, root magic, equipment, AI companions
**Researched:** 2026-02-12
**Confidence:** HIGH

## Executive Summary

GoGo Arabic v6.0 adds combat RPG systems to an existing 50K LOC Arabic learning game built with React 19 + Phaser 3 + Redux Toolkit. The research reveals that **no new runtime dependencies are needed** — the existing architecture (EventBus, Redux slices, Phaser subsystems, React overlays) scales perfectly to root magic, equipment/inventory, and companion systems. The key finding is that this isn't a tooling problem, it's an implementation problem.

The recommended approach is to extend proven patterns: new Redux slices (magicSlice, inventorySlice, companionSlice) following battleSlice patterns, new Phaser systems (RootMagicManager, EquipmentManager, CompanionManager) following NPCManager patterns, and new React overlays (MagicOverlay, InventoryUI, CompanionUI) following BattleOverlay patterns. The unique educational challenge is **synchronizing root magic mastery with FSRS vocabulary data** — every spell cast must be a learning moment, and progression must reflect actual Arabic proficiency, not just game mechanics.

The critical risks are: (1) **localStorage overflow** — 5MB limit will be exceeded with equipment/companions/root data, requiring IndexedDB migration BEFORE Phase 28, (2) **EventBus namespace collisions** — 30+ new events across 3 phases need strict namespacing to avoid silent failures, and (3) **FSRS-root mastery desync** — two parallel progression systems (vocabulary vs root families) must stay synchronized or players lose trust. All three risks have clear mitigation strategies defined in research.

## Key Findings

### Recommended Stack

The existing v5.0 stack (React 19 + Phaser 3 + Redux Toolkit + Framer Motion + CSS Modules + Vite) already provides everything needed. Research validated that established patterns handle all new features: grid-based inventory (Wardrobe.jsx pattern), companion AI (decision trees reading Redux state), root magic UI (BattleOverlay pattern with Arabic input), and shop haggling (state machine like BattleStateMachine).

**Core technologies (NO CHANGES):**
- **React 19**: Inventory grids, spell builder, companion UI — CSS Grid/Flexbox proven in Wardrobe.jsx (40-item grid)
- **Phaser 3**: Battle companion AI, equipment sprites, root magic VFX — subsystem pattern extends to CompanionManager, RootMagicManager
- **Redux Toolkit**: Equipment state, inventory state, companion state, root mastery — 13 slices proven, 4 new slices follow same pattern
- **Framer Motion**: Item equip animations, spell effects — already used in Wardrobe grid animations, applies to InventoryGrid.jsx
- **Zod**: Item schema validation, equipment affix validation — extend dialogueSchema.js pattern to itemSchema.js

**What NOT to add (explicitly avoided):**
- Drag-and-drop libraries (react-dnd, dnd-kit) — Click-to-equip works better for pixel-art grids, proven in Wardrobe.jsx
- AI/behavior tree libraries (behavior3js) — Companion AI is ~400 LOC decision trees, simpler than library overhead
- UI component libraries (Material-UI, Radix) — Pixel-art aesthetic conflicts, CSS Modules already proven

### Expected Features

Research identified table stakes, competitive differentiators, and anti-features for each system based on RPG genre conventions and educational game requirements.

**Must have (table stakes):**
- **Root Magic:** Spell discovery, MP costs, damage scaling, elemental weaknesses, spell upgrade path (Form I-X verbs)
- **Equipment:** 8 equipment slots, stat comparisons, rarity tiers, sort/filter, quick-equip loadouts, shop system
- **Companions:** 12 recruitable companions, party formation (max 2 active), battle AI by role, relationship meter, personal quests, gifting system

**Should have (competitive advantage):**
- **Root Magic:** Root derivation combos (combining words from same root = combo effects), grammar-based modifiers (dual/plural/passive forms affect spell behavior), semantic field synergies
- **Equipment:** Vocabulary-locked affixes (item bonus unlocks after learning Arabic adjective), historical item lore, haggling mini-game (Arabic number practice)
- **Companions:** Language teaching specializations (each teaches different domain), adaptive dialogue difficulty (Arabic complexity scales with CEFR level), mistake correction, cultural mentorship

**Defer (v2+ or future):**
- Calligraphic spell casting (tactile but high complexity) — defer to v11.0 AAA polish
- Voice pronunciation casting (infrastructure not ready) — future after Phase 43 pronunciation
- Conversational practice with companions (free-form Arabic input) — defer to Phase 41 grammar expansion
- Item inscription system (creative but high validation complexity) — defer to v11.0 polish

### Architecture Approach

All new systems integrate via established patterns: Redux as single source of truth, EventBus for Phaser ↔ React communication, Phaser systems read Redux directly (no hooks), React components use hooks (useSelector/useDispatch). The architecture research confirms **no bridge libraries needed** — existing separation of concerns scales to new systems.

**Major components:**
1. **Redux Slices (NEW)** — magicSlice (root mastery, affinity, equipped spells), inventorySlice (equipment slots, 200-item inventory, shops), companionSlice (12 companions, relationship, mood, active party), all following battleSlice patterns
2. **Phaser Systems (NEW)** — RootMagicManager (spell casting, damage calculation, VFX), EquipmentManager (sprite rendering, stat bonuses), CompanionManager (follower AI, battle AI, idle dialogue triggers), CompanionBattleAI (role-based decision trees)
3. **React Overlays (NEW)** — MagicOverlay (spell hotbar, MP display), InventoryUI (grid layout, comparison tooltips), CompanionUI (roster, relationship bars, gift system), ShopUI (haggling mini-game)
4. **Integration Points** — Modified battleSlice (magic effects, companion actions, equipment bonuses), modified playerSlice (profession levels, crafting recipes), modified vocabularySlice (root family mapping, battle-acquired words), modified narrativeSlice (companion approvals, affinity discovery choices)

**Critical integration pattern:** EventBus namespace enforcement prevents collisions (react:magic:cast, react:inventory:equip, phaser:companion:recruited). All 30+ new events require strict prefixes validated in eventBusTypes.js.

### Critical Pitfalls

Research identified 20 pitfalls across critical/moderate/minor severity. Top 5 by impact:

1. **Redux State Explosion → localStorage Overflow** — Adding 4 new slices to redux-persist hits 5MB localStorage limit, causing silent save data loss. **Mitigation:** Phase 26.5 (pre-Phase 27 blocker) migrate FSRS cards + battle history to IndexedDB, keep only lightweight state in localStorage. Monitor quota: warn at 80% usage.

2. **EventBus Namespace Collision → Silent Event Drops** — 30+ new events (SPELL_CAST, ITEM_EQUIPPED, COMPANION_RECRUITED) without namespacing collide with existing 35 events. **Mitigation:** Enforce strict namespacing (react:battle:item-used vs react:inventory:item-consumed), add runtime validation, document ownership in eventBusTypes.js comments.

3. **FSRS ↔ Root Mastery Desync → Contradictory Progress** — Player masters root (ك-ت-ب) but FSRS shows derived words (كتاب, مكتوب) as "not learned". **Mitigation:** Bidirectional sync via middleware (learning word increments root XP, root level-up suggests derived words for review), unified knowledge graph selector, battle system uses BOTH sources (70% root mastery + 30% FSRS accuracy).

4. **Companion AI State Explosion → 100ms+ Frame Time** — 12 companions × (dialogue + battle AI + exploration AI + relationship + mood) updating every frame = 600 operations/frame, 15 FPS. **Mitigation:** Lazy update strategy (only active companions per frame, inactive every 5 seconds), throttle exploration comments (1x/second not per frame), move battle AI to decision trees called once per turn.

5. **Equipment Visual Sync Desync → Naked Characters in Battle** — Equip robe in React InventoryUI, BattleScene renders starter outfit because equipment state didn't sync to Phaser. **Mitigation:** Centralize outfit in playerSlice, emit EVENTS.OUTFIT_CHANGED when equipment changes, both WorldScene PlayerController and BattleScene BattleSpriteManager listen for sync.

**Additional warnings:**
- Shop inventory must be dynamic (check world state: quest completion, reputation, season) not static JSON to avoid stale data
- Root spell combos need data-driven design (100 combos = 100 YAML entries, not 100 if/else blocks) to avoid combinatorial testing nightmare
- Item rarity gating must auto-teach affix words on discovery (not RNG gate behind RNG) to avoid frustration loops

## Implications for Roadmap

Based on research, v6.0 should be split into 4 phases (not the original 6 phases 27-32). **Critical path: Phase 26.5 IndexedDB migration is a blocker for everything else.**

### Phase 26.5: IndexedDB Migration (BLOCKER)
**Rationale:** localStorage will overflow with equipment/companion/root data. Must migrate BEFORE adding new slices. This is the most critical technical debt item from TECHNICAL-DEBT-AUDIT.md.
**Delivers:**
- FSRS cards moved to IndexedDB (2-3MB freed)
- Battle history moved to IndexedDB (~500KB freed)
- Storage quota monitoring (warn at 80%)
- redux-persist adapter for IndexedDB
**LOC:** ~2,000
**Avoids:** Pitfall 1 (localStorage overflow → save data loss)
**Dependencies:** None — pure infrastructure
**Research needed:** NONE (standard IndexedDB API, well-documented)

### Phase 28: Root Magic & Elemental Affinity
**Rationale:** Battle system (Phase 27) already complete. Root magic is the core educational differentiator and should come before equipment (which enhances root spells). Affinity system must be built alongside root magic to avoid later desync.
**Delivers:**
- magicSlice (root mastery, affinity, equipped spells)
- RootMagicManager Phaser system (spell casting, damage calculation)
- MagicOverlay React component (spell hotbar, MP display)
- 50 root-element mappings with Form I-X verb forms
- Affinity discovery system (50 weighted dialogue/quest choices)
- 10 elemental VFX with Arabic calligraphy particles
**Addresses:** Root derivation combos (FEATURES), grammar-based modifiers (FEATURES), spell discovery (table stakes)
**Avoids:** Pitfall 3 (FSRS-root desync) via bidirectional sync middleware
**Dependencies:** Phase 27 (battle engine), vocabularySlice, grammarSlice
**LOC:** ~22,000 (per EXPANSION-COMBAT-RPG.md)
**Research needed:** NONE (architecture validated, patterns proven)

### Phase 29: Equipment, Inventory & Economy
**Rationale:** With root magic complete, equipment enhances spell power via affinity bonuses and stat boosts. Inventory + shop system must be built together (can't have loot without storage). Haggling mini-game is high-value Arabic number practice.
**Delivers:**
- inventorySlice (equipment slots, 200-item inventory, shops, haggling)
- equipmentSlice (8 slots, stat calculation, affix unlocking)
- EquipmentManager Phaser system (sprite rendering, composite layers)
- InventoryUI React component (grid layout, comparison tooltips, sort by abjad)
- ShopUI with haggling mini-game (Arabic numerals 0-9999)
- Vocabulary-locked affixes (FSRS integration)
- 5 rarity tiers with Arabic color names
- Historical item lore snippets
**Addresses:** Equipment slots (table stakes), haggling mini-game (differentiator), vocabulary-locked affixes (differentiator)
**Avoids:** Pitfall 5 (equipment visual desync) via EVENTS.OUTFIT_CHANGED, Pitfall 9 (item frustration) via auto-teach on discovery, Pitfall 12 (unbalanced loot) via affix constraints
**Uses:** CSS Grid (inventory layout), Framer Motion (equip animations), Zod (item schema validation)
**Dependencies:** Phase 28 (equipment affects root spell power), vocabularySlice (affix unlocking)
**LOC:** ~24,000 (per EXPANSION-COMBAT-RPG.md)
**Research needed:** NONE (Wardrobe.jsx pattern proven for 200-item grids)

### Phase 30: Companion System
**Rationale:** With battle + magic + equipment complete, companions add the final combat layer (AI allies) and exploration layer (language teachers). Companion quests are deferred to Phase 47 (narrative expansion) to keep scope manageable.
**Delivers:**
- companionSlice (12 companions, relationship, mood, active party)
- CompanionManager Phaser system (follower sprites, pathfinding, idle dialogue triggers)
- CompanionBattleAI (role-based decision trees: healer/attacker/defender/support)
- CompanionUI React component (roster, relationship bars, gift system, party formation)
- 12 recruitable companions (2 per major zone, faceless Islamic art style)
- Language teaching specializations (grammar/vocabulary/pronunciation/culture)
- Adaptive dialogue difficulty (Arabic complexity scales with player CEFR level)
- Contextual exploration comments (200+ lines per companion)
- Gifting system (relationship +5 to +20 based on gift quality)
**Addresses:** Battle AI (table stakes), relationship meter (table stakes), teaching roles (differentiator), adaptive difficulty (differentiator)
**Avoids:** Pitfall 4 (AI frame drops) via lazy updates, Pitfall 8 (dialogue engine conflicts) via separate CompanionDialogueManager, Pitfall 10 (missing content) via required companion rotation hooks, Pitfall 13 (relationship decay) via pause during inactivity
**Dependencies:** Phase 27 (battle), Phase 20 (DialogueEngine), questSlice, narrativeSlice
**LOC:** ~28,000 (per EXPANSION-COMBAT-RPG.md, companion quests deferred to Phase 47)
**Research needed:** NONE (NPC patterns extend to companions, DialogueEngine proven)

### Phase Ordering Rationale

- **Phase 26.5 MUST come first:** localStorage overflow is a blocker. Cannot add inventorySlice, companionSlice, or rootMasterySlice without IndexedDB migration.
- **Phase 28 before 29:** Root magic is the educational core and should establish progression before equipment enhances it. Equipment affinity bonuses depend on affinity system existing.
- **Phase 29 before 30:** Companions give gifts (need inventory system), companions have equipment slots (need equipmentSlice), shops teach haggling (establishes economy before companion interactions with merchants).
- **Phase 30 last:** Companions interact with all previous systems (cast spells via root magic, wear equipment, comment on player inventory). Building companions first would create forward dependencies.

**Deferred to later phases:**
- Phase 31: Crafting & Professions (~26K LOC) — extends equipment system, not critical path
- Phase 32: Advanced Combat & Status Effects (~22K LOC) — grammar-based combos, multi-target battles, polish
- Phase 47: Companion Personal Quests (~15K LOC per companion × 12 = 180K total) — narrative content, not v6.0 core systems

### Research Flags

**Phases needing NO additional research** (patterns proven):
- **Phase 26.5:** IndexedDB API is stable, standard patterns well-documented
- **Phase 28:** Root magic uses BattleOverlay pattern + Redux slice pattern (battleSlice validated)
- **Phase 29:** Inventory uses Wardrobe.jsx pattern (40-item grid proven, scales to 200)
- **Phase 30:** Companions use NPCManager pattern + DialogueEngine pattern (both proven)

**Phases needing validation during implementation** (not pre-research):
- **Phase 28:** Root-element mappings (50 roots) need Arabic linguistic validation, not technical research
- **Phase 29:** Item lore snippets need historical accuracy check, not system design research
- **Phase 30:** Companion personalities need cultural sensitivity review, not architecture research

**No `/gsd:research-phase` needed for any v6.0 phases** — all technical patterns validated, domain research complete.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All patterns validated against existing codebase (Wardrobe.jsx, BattleOverlay.jsx, battleSlice.js). No new dependencies needed. |
| Features | MEDIUM | Based on RPG genre conventions (Pokemon, Persona, Final Fantasy) + language learning patterns (Duolingo, FSRS). No live 2026 web research available, but core features timeless. |
| Architecture | HIGH | Integration points verified via EventBus pattern, Redux slice patterns, Phaser subsystem patterns. All code paths traced through existing files. |
| Pitfalls | HIGH | 20 pitfalls identified via codebase analysis (TECHNICAL-DEBT-AUDIT.md, existing bottlenecks) + domain expertise. Mitigation strategies concrete and actionable. |

**Overall confidence:** HIGH

### Gaps to Address

Research was conclusive on technical architecture but has gaps requiring non-research validation:

- **Arabic linguistic accuracy:** 50 root-element mappings need validation by Arabic language expert (not technical research, content review). Scheduled for Phase 28 implementation.
- **Cultural sensitivity:** Companion personalities, item lore, historical references need cultural competency review (Islamic scholars, Arabic educators). Ongoing throughout v6.0.
- **Pedagogical effectiveness:** Root magic teaching efficacy needs SLA (Second Language Acquisition) validation against PEDA requirements from EXPANSION-PEDAGOGY-SLA.md. Validation scheduled post-Phase 28.
- **Equipment balance:** Item stat curves, affix power levels, rarity distributions need playtesting, not research. Tuning scheduled for Phase 29 polish.
- **Companion AI fun factor:** Decision tree complexity vs player enjoyment needs playtesting. Phase 30 includes AI difficulty toggles for iteration.

**None of these gaps require pre-implementation research** — they are content validation, cultural review, or playtesting concerns addressed during/after implementation.

## Sources

### Primary (HIGH confidence)
- **Existing Codebase (verified 2026-02-12):**
  - `src/components/Wardrobe/Wardrobe.jsx` — Grid UI pattern (40-item grid, proves 200-item scaling)
  - `src/components/Battle/BattleOverlay.jsx` — React-Phaser EventBus pattern
  - `src/game/systems/battle/BattleStateMachine.js` — State machine pattern for game logic
  - `src/game/systems/NPCManager.js` — Phaser sprite management, follower AI pattern
  - `src/game/systems/DialogueEngine.js` — Condition evaluation, effect execution (290 LOC proven)
  - `src/store/slices/battleSlice.js` — Redux slice pattern with memoized selectors
  - `src/utils/eventBusTypes.js` — EventBus namespace pattern (35 existing events)
  - `package.json` — Dependency versions verified (React 19.2.4, Phaser 3.90.0, RTK 2.11.2)
- **Research Documents:**
  - `.planning/research/EXPANSION-COMBAT-RPG.md` — Feature requirements, LOC estimates (Phases 27-32, 148K LOC)
  - `.planning/research/TECHNICAL-DEBT-AUDIT.md` — localStorage overflow, asset loading bottlenecks, scaling concerns
  - `.planning/research/AAA-QUALITY-GAPS.md` — UI/UX polish requirements (60 gaps, deferred to v11.0)
  - `.planning/research/STACK.md` — Technology validation (2026-02-12, HIGH confidence)
  - `.planning/research/FEATURES.md` — Feature landscape analysis (2026-02-12, MEDIUM confidence)
  - `.planning/research/ARCHITECTURE-V6-INTEGRATION.md` — Integration patterns (2026-02-12, HIGH confidence)
  - `.planning/research/PITFALLS.md` — Domain pitfalls (2026-02-12, HIGH confidence)

### Secondary (MEDIUM confidence)
- **RPG Design Patterns (training data through early 2025):**
  - Pokemon companion systems (party formation, battle AI, relationship mechanics)
  - Persona 5 social links (confidant progression, dialogue branches, approval system)
  - Final Fantasy spell systems (element weaknesses, MP costs, spell tiers)
  - Stardew Valley inventory (grid layouts, gifting systems, shop mechanics)
  - Fire Emblem support conversations (relationship gates, character specializations)
- **Language Learning Game Design:**
  - Duolingo gamification patterns (streak systems, XP curves, adaptive difficulty)
  - FSRS spaced repetition (vocabulary mastery tracking, confidence intervals)
  - Epistory word-based mechanics (typing as core gameplay, stress-free turn-based)

### Tertiary (LOW confidence, needs validation)
- **2026 Game Design Trends:** No live web research available. Feature priorities based on 2025 training data. Recommend monitoring RPG releases Q1 2026 for emerging patterns.
- **Educational Game Best Practices:** Training data through 2025. Recommend consulting SLA research literature during Phase 28 for root magic pedagogy validation.

---

*Research completed: 2026-02-12*
*Ready for roadmap: yes*
*Orchestrator: Proceed to requirements definition (Phases 26.5, 28-30)*
