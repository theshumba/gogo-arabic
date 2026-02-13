# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-13)

**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"

**Current focus:** Phase 31 - Crafting & Professions

## Current Position

Milestone: v6.1 Crafting & Advanced Combat
Phase: 31 of 32 (Crafting & Professions)
Plan: 2 of 8 (31-01 and 31-02 complete)
Status: In progress
Last activity: 2026-02-13 — Completed 31-01-PLAN.md (Crafting Data Foundation)

Progress: [████████████████████████████░░] 93% (30/32 phases complete)

### Shipped Milestones

| Version | Phases | Plans | Date |
|---------|--------|-------|------|
| v2.0 Player Experience | 1-9 | 14 | 2026-02-08 |
| v3.0 Infrastructure | 10-11 | 11 | 2026-02-09 |
| v4.0 Game Soul & Polish | 14-18 | 8 | 2026-02-10 |
| v5.0 The Real Game | 19-26 | 18 | 2026-02-11 |
| v6.0 Combat & RPG | 27.1, 28-30 | 16 | 2026-02-13 |

**Cumulative:** 30 phases, 68 plans, 6 milestones, 5 days

## Test & Build Status

- Tests: 1,060 passing, 0 failures
- Build: Succeeds, main bundle 723KB (191KB gzipped)
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

### Open Items Carried Forward

- Bundle 661KB (exceeds 500KB target) — needs lazy loading / code splitting
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

Last session: 2026-02-13 (Phase 31 execution)
Stopped at: Completed 31-01-PLAN.md (Crafting Data Foundation)
Resume file: .planning/phases/31-crafting-professions/31-03-PLAN.md (next)

**Phase 31 Progress:**
- 31-01: Data Foundation — COMPLETE (6 professions, 205 resources, 100 recipes, craftingSlice, IndexedDB, 3 commits)
- 31-02: Crafting Logic (TDD) — COMPLETE (7 functions, 37 tests, 3 commits)
- 31-03-08: UI, mini-games, integration — PENDING

**v6.1 Roadmap Summary:**
- Phase 31: Crafting & Professions (14 requirements, 9 success criteria)
- Phase 32: Status Effects & Advanced Combat (18 requirements, 16 success criteria)
- 100% requirement coverage: 32/32 mapped

---
*State initialized: 2026-02-08*
*Last updated: 2026-02-13 — Completed plan 31-01 (Crafting Data Foundation)*
