# Roadmap: GoGo Arabic

## Milestones

- ✅ **v2.0 Player Experience Overhaul** — Phases 1-9 (shipped 2026-02-08) → [archive](milestones/v2.0-ROADMAP.md)
- ✅ **v3.0 Infrastructure & Polish** — Phases 10-11 complete, 12-13 deferred (2026-02-09) → [archive](milestones/v3.0-ROADMAP.md)
- ✅ **v4.0 Game Soul & Polish** — Phases 14-18 (shipped 2026-02-10) → [archive](milestones/v4.0-ROADMAP.md)
- ✅ **v5.0 The Real Game** — Phases 19-26 (shipped 2026-02-11)
- 🚧 **v6.0 Combat & RPG** — Phases 27.1, 28-30 (in progress)

## Overview

v6.0 transforms the battle engine foundation (Phase 27) into a complete combat RPG system. Players will master Arabic through root-based magic where trilateral roots become spells, manage equipment with Arabic affix vocabulary, and recruit 12 AI companions who teach Arabic through conversation and battle. The roadmap addresses the critical localStorage overflow blocker first, then builds the three core systems in dependency order: magic (the educational core), equipment (enhances magic via affinity bonuses), and companions (interact with both systems).

## Phases

**Phase Numbering:**
- Integer phases (1-30): Planned milestone work
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

**Milestone Goal:** Transform GoGo Arabic from a learning app with RPG graphics into a game that feels alive — with audio, atmosphere, clear progression, interactive world, and triple-A polish.

- [x] Phase 14: Bug Fixes & Stability (1/1 plan) — 2026-02-10
- [x] Phase 15: Audio System (2/2 plans) — 2026-02-10
- [x] Phase 16: Visual Juice (2/2 plans) — 2026-02-10
- [x] Phase 17: Progression Clarity (2/2 plans) — 2026-02-10
- [x] Phase 18: World Life (1/1 plan) — 2026-02-10

</details>

<details>
<summary>✅ v5.0 The Real Game (Phases 19-26) — SHIPPED 2026-02-11</summary>

**Milestone Goal:** Transform GoGo Arabic from a learning app with game skin into an actual game — epic personalized narrative, living interactive world, and guided structure from minute one.

- [x] Phase 19: Infrastructure & Architecture (4/4 plans) — 2026-02-11
- [x] Phase 20: Dialogue System (6/6 plans) — 2026-02-11
- [x] Phase 21: Guided Onboarding & Mentor (1/1 plan) — 2026-02-11
- [x] Phase 22: Buildings & Interiors (3/3 plans) — 2026-02-11
- [x] Phase 23: Interactive Objects & World Life (1/1 plan) — 2026-02-11
- [x] Phase 24: Structured Progression & Gates (1/1 plan) — 2026-02-11
- [x] Phase 25: Vocabulary Integration (1/1 plan) — 2026-02-11
- [x] Phase 26: Narrative Branching & Polish (1/1 plan) — 2026-02-11

</details>

### v6.0 Combat & RPG (In Progress)

**Milestone Goal:** Build the combat and RPG core — root-based magic system where Arabic roots become spells, equipment with Arabic-named items, and 12 AI companions that teach Arabic through conversation and battle.

**Foundation:** Phase 27 battle engine already committed (~2.6K LOC) with BattleScene, 17-state FSM, 5 player actions, Arabic accuracy = damage, 10 elemental VFX, 21 enemies, battleSlice, BattleOverlay/BattleMenu React components.

**Note:** Phase 27 exists but has gaps (no world integration, rewards not wired, no FSRS sync). These gaps are addressed by v6.0 integration requirements.

---

### Phase 27.1: IndexedDB Migration (INSERTED)

**Goal:** Prevent save data loss by migrating FSRS cards and battle history to IndexedDB before adding new equipment/companion/magic state.

**Depends on:** Phase 27 (battle engine foundation)

**Requirements:** STOR-01, STOR-02, STOR-03

**Success Criteria** (what must be TRUE):
1. Player's existing FSRS cards (up to 5,000+) are stored in IndexedDB, not localStorage
2. Player's battle history is stored in IndexedDB with query API for recent battles
3. Player sees a warning toast when storage usage exceeds 80% of quota
4. Player's existing save data auto-migrates from localStorage to IndexedDB on first load after update with zero data loss
5. Redux-persist continues to work with hybrid storage (lightweight state in localStorage, heavy data in IndexedDB)

**Plans:** 2 plans

Plans:
- [ ] 27.1-01-PLAN.md — IndexedDB adapter, quota service, and store migration to hybrid persistence
- [ ] 27.1-02-PLAN.md — Tests for storage infrastructure and full regression verification

---

### Phase 28: Root Magic & Elemental Affinity

**Goal:** Players master Arabic trilateral roots through spell casting, where root mastery and FSRS vocabulary accuracy determine spell power, and elemental affinity emerges through gameplay choices.

**Depends on:** Phase 27.1 (IndexedDB migration prevents state overflow)

**Requirements:** MGIC-01, MGIC-02, MGIC-03, MGIC-04, MGIC-05, MGIC-06, MGIC-07, MGIC-08, MGIC-09, MGIC-10, MGIC-11, MGIC-12, INTG-01

**Success Criteria** (what must be TRUE):
1. Player can discover 50 Arabic root-element mappings through NPC dialogue and exploration (e.g., ك-ت-ب = knowledge element)
2. Player can cast spells in battle by selecting a discovered root, with spell damage scaling based on root mastery (FSRS vocabulary accuracy for derived words)
3. Player has an MP bar that depletes on spell cast and fully recovers between battles
4. Player can equip up to 6 spells in a hotbar for quick access during battle turn
5. Player discovers primary and secondary elemental affinity through 50+ weighted choices (dialogue options, quest decisions, exploration behavior)
6. Player's affinity grants observable spell power bonuses (2x for primary, 1.5x for secondary) shown in battle damage numbers
7. Player can combine roots from different elements for combo effects (20 initial combos with distinct VFX)
8. Player sees Arabic calligraphy particle VFX when casting spells, with 10 distinct element visuals
9. Player's root mastery syncs bidirectionally with FSRS — learning derived words increments root XP, high root mastery suggests new derived words for review
10. Player can upgrade spells by learning higher verb forms (Form I-X) of the same root, with visible tier indicators

**Plans:** TBD

Plans:
- [ ] 28-01: TBD

---

### Phase 29: Equipment, Inventory & Economy

**Goal:** Players manage equipment across 8 slots with stat bonuses, build a 200-item inventory with Arabic affix vocabulary, and practice Arabic numerals through shop haggling.

**Depends on:** Phase 28 (equipment affects root spell power via affinity bonuses)

**Requirements:** EQUP-01, EQUP-02, EQUP-03, EQUP-04, EQUP-05, EQUP-06, EQUP-07, EQUP-08, EQUP-09, EQUP-10, EQUP-11, EQUP-12, INTG-03, INTG-04, INTG-05, INTG-06

**Success Criteria** (what must be TRUE):
1. Player can equip items in 8 slots (head covering, robe, cloak, belt, boots, gloves, accessory 1, accessory 2) with visual updates to character sprite in both WorldScene and BattleScene
2. Player can view stat comparison tooltips when inspecting equipment vs currently equipped items (HP/MP/damage/defense differences)
3. Player can manage 200-item inventory with grid UI, sort by type/rarity/Arabic alphabetical order (abjad)
4. Player sees items in 5 rarity tiers with Arabic color names (أبيض/أخضر/أزرق/بنفسجي/ذهبي for common/uncommon/rare/epic/legendary)
5. Player can buy and sell items at zone-specific shops with dynamic inventory based on player level and world state (quest completion, zone unlocks)
6. Player can haggle with shopkeepers using Arabic numerals (0-9999) in a negotiation mini-game, practicing number recognition
7. Player's equipment bonuses only fully activate (100%) for items with Arabic affix words the player has learned via FSRS; unlearned affixes grant 50% bonus
8. Player automatically learns new Arabic vocabulary when discovering items with unknown affix words, with immediate FSRS queue addition
9. Player can view item lore snippets with historical/cultural context for each equipment piece
10. Player benefits from set bonuses when wearing matching themed sets (Scholar's Set, Merchant's Set, etc.) with bonus indicators in equipment UI
11. Battle rewards (XP, gold, items) from Phase 27 engine wire into player progression and inventory systems

**Plans:** TBD

Plans:
- [ ] 29-01: TBD

---

### Phase 30: Companion System

**Goal:** Players recruit 12 faceless companions who act as AI allies in battle and language teachers in exploration, with relationship progression and adaptive Arabic dialogue.

**Depends on:** Phase 29 (companions have equipment slots, give gifts requiring inventory)

**Requirements:** COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, COMP-07, COMP-08, COMP-09, COMP-10, COMP-11, COMP-12, INTG-02

**Success Criteria** (what must be TRUE):
1. Player can recruit 12 companions across zones (minimum 2 per major zone) through story/quest progression
2. Player can form a party with max 2 active companions (1 for battle, 1 for exploration) and swap at any camp/rest point
3. Player's battle companion acts autonomously during player turn using role-based AI (healer prioritizes low HP, attacker targets weakest enemy, defender protects player, support applies buffs)
4. Player can track relationship level (0-100) with each companion via relationship bars in UI, affecting dialogue options and battle performance (higher relationship = better AI decisions)
5. Player can give gifts to companions to increase relationship level (+5 to +20 based on gift quality/preference match)
6. Player's exploration companion follows them in WorldScene and makes contextual Arabic comments about zones, objects, and events (200+ unique lines per companion)
7. Each companion has a language teaching specialization (grammar/vocabulary/pronunciation/culture) that influences their dialogue content and corrections
8. Companion dialogue complexity adapts to player's Arabic proficiency level (more Arabic at higher CEFR levels, more English/transliteration at A1)
9. Companion sprites are faceless (Islamic art style) with distinctive silhouettes, flowing robes, and unique color palettes
10. Player can view companion roster UI showing all 12 companions (recruited/unrecruited), relationship bars, teaching specializations, and recruitment hints
11. All existing 592 tests pass after each phase — no regressions in core game systems

**Plans:** TBD

Plans:
- [ ] 30-01: TBD

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1-26 (complete) -> 27.1 -> 28 -> 29 -> 30

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
| 27.1. IndexedDB Migration | v6.0 | 0/2 | Not started | - |
| 28. Root Magic & Elemental Affinity | v6.0 | 0/? | Not started | - |
| 29. Equipment, Inventory & Economy | v6.0 | 0/? | Not started | - |
| 30. Companion System | v6.0 | 0/? | Not started | - |

**Coverage:**
- v6.0 requirements: 45 total (3 STOR, 12 MGIC, 12 EQUP, 12 COMP, 6 INTG)
- Mapped to phases: 45/45 (100%)
- Unmapped: 0

---
*Roadmap created: 2026-02-08*
*Last updated: 2026-02-12 — Phase 27.1 planned (2 plans)*
