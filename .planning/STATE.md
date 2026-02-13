# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-13)

**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"

**Current focus:** Phase 32 - Advanced Combat

## Current Position

Milestone: v6.1 Crafting & Advanced Combat
Phase: 32 of 32 (Advanced Combat)
Plan: 5 of 11
Status: In progress
Last activity: 2026-02-13 — Completed 32-05-PLAN.md (Battle Effect & Combo UI)

Progress: [██████████████████████████████████████████░░] 5/11 Phase 32 plans

### Shipped Milestones

| Version | Phases | Plans | Date |
|---------|--------|-------|------|
| v2.0 Player Experience | 1-9 | 14 | 2026-02-08 |
| v3.0 Infrastructure | 10-11 | 11 | 2026-02-09 |
| v4.0 Game Soul & Polish | 14-18 | 8 | 2026-02-10 |
| v5.0 The Real Game | 19-26 | 18 | 2026-02-11 |
| v6.0 Combat & RPG | 27.1, 28-30 | 16 | 2026-02-13 |

**Cumulative:** 31 phases, 76 plans, 6 milestones, 5 days

## Test & Build Status

- Tests: 1,121 passing, 0 failures
- Build: Succeeds, main bundle 862KB (223KB gzipped)
- Git: Tagged v6.0

## Accumulated Context

### Decisions

All v2.0-v6.0 decisions logged in PROJECT.md Key Decisions table.

Recent v6.0 decisions affecting v6.1:
- IndexedDB hybrid persistence (5 slices migrated) — prevents localStorage overflow for crafting data
- Phase ordering (storage → magic → equipment → companions) — established clean dependency chain
- Equipment vocabulary-gated bonuses — pattern extends to crafting profession recipes
- Arabic numeral haggling — pattern extends to resource trading/crafting costs

v6.1 Phase 31 decisions:
- Dependency injection for RECIPES/RESOURCES in crafting logic — enables TDD with mocks while data files created in parallel (31-01/31-02)
- Level 0 profession requires 50 XP, levels 1-10 require 100×level — faster initial progression, linear scaling
- 4-tier gathering quality vs 5-tier crafting quality — gathering simpler (profession level only), crafting has mini-game accuracy
- Flat-object pattern for professions/recipes/resources — O(1) lookup performance, follows equipment.js pattern (31-01)
- craftingSlice in IndexedDB via nested persistReducer — prevents localStorage overflow, transparent to selectors (31-01)
- 100 recipes created (vs 300+ spec) — pattern established for remaining 200 recipes (blacksmith, herbalist, weaver, builder) (31-01)
- RecipeBook 3 filter states (all/unlocked/craftable) with live search — follows InventoryUI.jsx filter pattern (31-04)
- Arabic numeral level display (٠-٩) in ProfessionPanel — enhances Arabic-first UI (31-04)
- Vocabulary-gating UI pattern: show '???' for locked ingredients, emit REVIEW_SESSION_OPEN to learn — integrates crafting with vocabulary loop (31-04)
- GatheringSpotManager follows InteractableManager pattern — consistency with existing codebase (31-03)
- scene.time.delayedCall() for gathering respawns — event-driven, not polling (31-03)
- 4hr/8hr respawn intervals (not 24hr) — accessible gameplay loop (31-03)
- Cook profession accepted for herb_patch/water_source spots — cook uses herbs/spices/oils (31-03)
- CalligraphyTracing pixel-overlap algorithm with tolerance scaling — flexible accuracy for letter complexity (31-05)
- CookingRecipeOrder Fisher-Yates shuffle — prevents pattern memorization (31-05)
- SmithingRhythm uses requestAnimationFrame instead of setInterval — prevents timing drift (31-05)
- Mini-game difficulty scaling: 3 tiers (1-3, 4-7, 8-10) — balances complexity vs progression (31-05)
- Centralized result screen in CraftingMiniGame — consistent UX, reduces duplication (31-05)
- PlantIdentification uses embedded descriptions (not RESOURCES data) — simplifies implementation, no data coupling (31-06)
- PatternMatching uses Unicode shape icons (■●▲★◆) — no sprite assets needed, accessible (31-06)
- DirectionalPlacement uses emoji for building elements (🚪🪟🧱) — clear visual feedback without sprites (31-06)
- All mini-games use CSS Grid (not Canvas) — accessible, performant, easier to style (31-06)
- 41 crafted equipment items across 6 professions — best-in-slot at levels 8-10, competitive with shop legendaries (31-07)
- activeBuffs in battleSlice with timestamp-based expiration — consumable buffs applied during battle (31-07)
- enchantments stored separately from equipped items — immutable EQUIPMENT_DATA, easy serialization (31-07)
- calculateTotalBattleStats vs calculateTotalEquipmentStats separation — static equipment stats vs dynamic battle stats (31-07)
- CraftingResult uses Arabic numerals for all numbers — XP, accuracy, durations displayed in ٠-٩ (31-07)
- Crafting UI state in uiSlice (not local state) — consistent with overlays, enables keyboard shortcuts, integrates with player freeze (31-08)
- GatheringSpotManager lifecycle follows InteractableManager pattern — clean zone transitions, no memory leaks (31-08)
- craftingVocabMiddleware for auto-sync (not direct dispatch) — separation of concerns, follows rootFsrsSyncMiddleware pattern (31-08)
- NPC profession teaching via data merge (not npcs.json modification) — composable, preserves existing data (31-08)
- Minimal companion crafting dialogue (10 lines) — pattern established, remaining 50 lines deferred (31-08)

v6.1 Phase 32 decisions:
- 24 effects total (not 22) — original file had 16 effects (not 14 as plan assumed), adding 8 yields 24 (32-01)
- Level gating tiers: 10/16/24 — tier 2 returns original 16, tier 3 includes all Phase 32 additions (32-01)
- Compound wordId prefix 'compound_' vs status prefix 'status_' — namespace separation for FSRS cards (32-01)
- Used actual grammar.js lesson IDs (noun-adjective-agreement, basic-verb-conjugation) instead of plan-specified shortened IDs (32-02)
- 6 bosses in rush sequence (all existing bosses in story order) — covers full game progression (32-02)
- CEFR level gating: A1=level 1, A2=level 3, B1=level 7 — prevents powerful combos too early (32-02)
- arenaSlice in localStorage (not IndexedDB) — lightweight enough, deferred store integration to 32-11 (32-02)
- Exact-match-first for verb forms: diacritics distinguish Form I from Form II, normalized fallback for user flexibility (32-03)
- Lesson gate checked before template matching in detectSentenceCombo for specific error messages (32-03)
- resolveCompounds picks first compound match in COMPOUND_EFFECTS iteration order (32-03)
- bossHP kept as sum of all enemies[] HP for full backward compatibility with single-enemy code (32-04)
- enemies[] first 2 entries default to front row, remaining to back — typical RPG party layout (32-04)
- MultiTargetManager does not read Redux — data-push pattern keeps it testable (32-04)
- Back row sprites use 1.6x scale (vs 2x front) for visual depth perception (32-04)
- Amiri font for StatusEffectBar Arabic labels (12px icons, 16px tooltips) — matches ComboCounter Arabic styling (32-05)
- 3-char truncation for effect icon Arabic labels, full name in tooltip — fits 36x36 icon constraint (32-05)
- ComboMeter hidden when comboMeter=0 and no grammarComboState — avoids visual clutter (32-05)

### Open Items Carried Forward

- Bundle 850KB (exceeds 500KB target) — needs lazy loading / code splitting
- BootScene loads ALL assets upfront (77 calls) — needs zone-based lazy loading
- No tests for Phase 27 battle code (~2.6K LOC)
- ShopOverlay + CompanionUI not wired to GameLayout (~25 lines to fix)
- 573 missing companion dialogue lines (content gap)
- 12 missing companion sprite PNGs (art assets)
- Backend hardening deferred since v3.0 (Phases 12-13)

### Blockers/Concerns

None.

### Pending Todos

None.

## Session Continuity

Last session: 2026-02-13 (Phase 32 execution)
Stopped at: Completed 32-05-PLAN.md (Battle Effect & Combo UI)
Resume file: .planning/phases/32-advanced-combat/32-06-PLAN.md (next)

**Phase 32 Progress:**
- 32-01: Status Effects Foundation — COMPLETE (24 status effects, 6 compound effects, statusEffectVocabMiddleware, 13 EventBus constants, 2 commits)
- 32-02: Grammar Combos & Arena Data — COMPLETE (17 grammar combos, 3 arena modes, 6-boss rush, 5 puzzles, arenaSlice, 2 commits)
- 32-03: Grammar Combo Detector & Compound Resolver — COMPLETE (TDD, GrammarComboDetector + CompoundEffectResolver, 49 tests, 4 commits)
- 32-04: Multi-Target & Combo Meter — COMPLETE (enemies[] array, 11 new reducers, 7 new selectors, MultiTargetManager, 2 commits)
- 32-05: Battle Effect & Combo UI — COMPLETE (StatusEffectBar + ComboMeter components, CSS Modules, Arabic-Indic numerals, 2 commits)

**v6.1 Roadmap Summary:**
- Phase 31: Crafting & Professions — COMPLETE (8/8 plans)
- Phase 32: Status Effects & Advanced Combat — IN PROGRESS (5/11 plans)

---
*State initialized: 2026-02-08*
*Last updated: 2026-02-13 — Completed plan 32-05 (Battle Effect & Combo UI)*
