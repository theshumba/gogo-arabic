# Roadmap: GoGo Arabic

## Milestones

- ✅ **v2.0 Player Experience Overhaul** — Phases 1-9 (shipped 2026-02-08) → [archive](milestones/v2.0-ROADMAP.md)
- ✅ **v3.0 Infrastructure & Polish** — Phases 10-11 complete, 12-13 deferred (2026-02-09) → [archive](milestones/v3.0-ROADMAP.md)
- ✅ **v4.0 Game Soul & Polish** — Phases 14-18 (shipped 2026-02-10) → [archive](milestones/v4.0-ROADMAP.md)
- ✅ **v5.0 The Real Game** — Phases 19-26 (shipped 2026-02-11) → [archive](milestones/v5.0-ROADMAP.md)
- ✅ **v6.0 Combat & RPG** — Phases 27.1, 28-30 (shipped 2026-02-13) → [archive](milestones/v6.0-ROADMAP.md)
- 🚧 **v6.1 Crafting & Advanced Combat** — Phases 31-32 (in progress)
- 📋 **v7.0 World & Content** — Phases 33-38 (planned)

## Phases

**Phase Numbering:**
- Integer phases (1-32): Planned milestone work
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

### 🚧 v6.1 Crafting & Advanced Combat (In Progress)

**Milestone Goal:** Add crafting professions with Arabic recipes and advanced combat mechanics including status effects, grammar-based combos, and arena challenges.

**Target Features:**
- 6 crafting professions with Arabic recipe names and vocabulary integration
- Status effects system tied to Arabic vocabulary mastery
- Grammar pattern combat combos (sentence structures = attack chains)
- Wave-based arena challenges with progressive difficulty
- Crafting-combat integration (crafted items enhance combat abilities)

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
  1. Battle system supports 20+ status effects with Arabic names (حيرة/Confusion, قوة/Strength, سرعة/Speed, حماية/Protection, سم/Poison, صمت/Silence, عمى/Blindness, شجاعة/Courage, حكمة/Wisdom, بركة/Blessing, etc.)
  2. Applying a status effect in battle requires knowing the Arabic vocabulary word
  3. Status effect vocabulary is auto-added to FSRS review queue when first encountered in battle
  4. Status effect combinations create compound effects (e.g., سرعة + قوة = devastating attack bonus)
  5. Player can execute noun+adjective combos (إضافة constructions) by describing targets accurately for bonus damage
  6. Player can chain verb conjugations across forms (Form I → Form II → Form IV) for escalating damage multipliers
  7. Player can construct complete Arabic sentences for ultimate attacks with combo meter tracking
  8. Combo meter displays with Arabic numerals and builds with consecutive correct Arabic answers
  9. Battle system supports multi-target encounters (up to 4 enemies) with front/back row positioning
  10. Player can use crafted battle items (potions, scrolls, food) during combat via item menu
  11. Player can retreat from battle by correctly answering an Arabic question (vocabulary or grammar)
  12. Post-battle review screen shows all Arabic vocabulary and grammar used with accuracy statistics
  13. Player can enter wave-based survival arena with increasing Arabic difficulty each wave
  14. Player can attempt boss rush mode (all bosses sequentially) with story interludes between battles
  15. Puzzle battles require specific Arabic knowledge patterns (not brute-forceable with stats alone)
  16. Arena has a leaderboard tracking player performance metrics and win streaks

**Plans**: 11 plans in 7 waves

Plans:
- [ ] 32-01-PLAN.md — Status effects expansion (22 effects + compounds) + FSRS middleware + EventBus constants
- [ ] 32-02-PLAN.md — Grammar combo data (noun+adj, verb chains, sentences) + arena challenges + arenaSlice
- [ ] 32-03-PLAN.md — TDD: GrammarComboDetector + CompoundEffectResolver
- [ ] 32-04-PLAN.md — Multi-target battleSlice (enemies array, combo meter) + MultiTargetManager
- [ ] 32-05-PLAN.md — StatusEffectBar + ComboMeter UI components
- [ ] 32-06-PLAN.md — GrammarComboInput + BattleItemMenu + TargetSelector + BattleArabicInput flee mode
- [x] 32-07-PLAN.md — ArenaController (wave survival) + ArenaHUD
- [ ] 32-08-PLAN.md — BossRushController + PuzzleBattleManager + BossRushInterlude
- [ ] 32-09-PLAN.md — PostBattleReview + ArenaLeaderboard
- [ ] 32-10-PLAN.md — BattleStateMachine FSM integration + arabicUsedThisBattle capture
- [ ] 32-11-PLAN.md — BattleOverlay UI wiring + BattleMenu/BattleResult + arenaSlice store registration

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 27.1 → 28 → 29 → 30 → 31 → 32

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
| 32. Status Effects & Advanced Combat | v6.1 | 7/11 | In progress | - |

**Cumulative:** 31 phases shipped, 76 plans complete, 6 milestones

---
*Roadmap created: 2026-02-08*
*Last updated: 2026-02-13 — Phase 31 Crafting & Professions complete (8/8 plans)*
