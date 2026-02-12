# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-12)

**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"
**Current focus:** v6.0 Combat & RPG — Phase 28 COMPLETE, ready for Phase 29

## Current Position

Milestone: v6.0 Combat & RPG
Phase: 29 of 4 phases (Equipment, Inventory & Economy) — IN PROGRESS
Plan: 3 of 4 plans complete
Status: Plan 29-04 COMPLETE — Shop UI with dynamic inventory, buy/sell, and Arabic haggling
Last activity: 2026-02-12 — Completed 29-04-PLAN.md (ShopOverlay, ShopInventory, HagglingGame)

Progress: [███████████████████████████░░░] 89% (56 of 62 estimated plans complete across all milestones)

### Shipped Milestones

| Version | Phases | Plans | Date |
|---------|--------|-------|------|
| v2.0 Player Experience | 1-9 | 14 | 2026-02-08 |
| v3.0 Infrastructure | 10-11 | 11 | 2026-02-09 |
| v4.0 Game Soul & Polish | 14-18 | 8 | 2026-02-10 |
| v5.0 The Real Game | 19-26 | 14 | 2026-02-11 |

## Performance Metrics

**v2.0:** 9 phases, 14 plans, 253 files, 1 day
**v3.0:** 2 phases (of 4), 11 plans, 1 day
**v4.0:** 5 phases, 8 plans, 28 files, 1,526 insertions, 1 day
**v5.0:** 8 phases, 14 plans, 1 day

**Cumulative:** 24 phases, 47 plans shipped across 4 milestones in 4 days

## Test & Build Status

- Tests: 721 passing, 0 failures (baseline 647 + 74 magic system tests, 0 new equipment tests)
- Build: Succeeds, main bundle 580.66KB (160.19KB gzipped) — +32KB from equipment data, +4KB from Phaser integration, +16KB from shop UI
- Git: 8 commits from Phase 29 Plans 01-04 (2 per plan)

## Accumulated Context

### Decisions

All v2.0-v5.0 decisions logged in PROJECT.md Key Decisions table.

Key v6.0 roadmap decisions:
- Phase 27.1 inserted as blocker before Phase 28 — localStorage overflow requires IndexedDB migration FIRST
- Phase ordering: 27.1 (storage) → 28 (magic) → 29 (equipment) → 30 (companions) based on dependencies
- Magic before equipment: Root magic is educational core, equipment enhances magic via affinity bonuses
- Equipment before companions: Companions have equipment slots and give gifts requiring inventory
- All 45 requirements mapped to phases (100% coverage), no orphans

**Phase 27.1 decisions (IndexedDB migration):**
- Nested persistReducer for hybrid storage instead of split namespaces (preserves selector paths)
- Cached IndexedDB connection pattern to avoid repeated open() calls
- Versioned schema (DB_VERSION=1) with upgrade path for future stores
- 80% quota threshold for storage warnings
- 5-second cleanup delay for old localStorage data after migration

**Phase 27.1 Plan 02 decisions (test suite):**
- Real timers required for IndexedDB tests (fake timers prevent async event loop)
- window.indexedDB polyfill in setup.js for adapter compatibility
- Module reset pattern (vi.resetModules + dynamic import) for session flag testing
- vi.mock() at module level for proper mock isolation in middleware tests

**Phase 28 Plan 01 decisions (magic data foundation):**
- XP-based leveling: 100 XP per level, accuracy-based XP gain (5/10/15 for partial/good/perfect)
- Affinity locking after 50 choices with weighted histogram (primary 2x, secondary 1.5x)
- All spells start at Form I with 5 MP cost and 16-30 base damage
- Combos require minimum root levels (2-4) and match element pairs alphabetically
- magicSlice uses IndexedDB nested persistReducer (same pattern as vocabulary and battle)

**Phase 28 Plan 02 decisions (Phaser managers & middleware):**
- RootMagicManager damage formula: base (tier * 20) * mastery (1.0 + level * 0.1) * affinity (2.0/1.5/1.0) * grammar (1.2/1.0/0.5)
- FSRS sync weights: 70% in-game casting, 30% FSRS reviews (rating 3+ = 0.8 accuracy * 0.3 = 0.24 effective)
- Root level-up suggests max 3 derived words to avoid flooding FSRS queue
- Form unlock thresholds: Level 3 → II, Level 5 → III, Level 7 → IV, Level 9 → V
- BattleStateMachine MAGIC_CAST state prompts random word from spell's root via getRootWords
- Magic damage delegated to RootMagicManager with 800ms VFX delay
- DialogueEngine affinity lock emits MAGIC_AFFINITY_LOCKED only once per session

**Phase 28 Plan 03 decisions (magic UI & VFX):**
- MP bar color gradient: green (>50%), yellow (20-50%), red (<20%)
- Spell hotbar only visible during player turn (useSelector state.battle.currentTurn === 'player')
- SpellMenu uses click-to-assign: click slot then spell, or auto-assign to next empty
- Arabic calligraphy VFX: 32px root text floats up 50px over 800ms with element color
- Combo VFX enhanced: 2x particle count, 1.5x duration, 48px combo name text
- All 10 elements have distinct particle configs (ELEMENT_CONFIGS)

**Phase 28 Plan 04 decisions (magic system tests):**
- Reducer testing: Use reducer(initialState, action) directly to avoid IndexedDB persistence issues
- Middleware testing: Mock store with vi.fn() for getState/dispatch, verify via store.dispatch.mock.calls
- RootMagicManager testing: Override scene.time.delayedCall to execute callbacks immediately
- Full regression: 721 tests (647 existing + 74 new), zero regressions, build succeeds
- DialogueEngine test fix: Initialize mock state BEFORE creating engine instance

**Phase 29 Plan 01 decisions (equipment data foundation):**
- inventorySlice uses IndexedDB nested persistReducer (same pattern as magic/battle/vocabulary) at key 'gogo-arabic-inventory'
- economySlice uses localStorage via root whitelist (shop cache is lightweight compared to 200-item inventory)
- 200-item inventory cap enforced in addItem reducer (prevents infinite hoarding)
- Equipment data stored as flat object keyed by itemId for O(1) lookup (not array)
- Affix bonus multipliers: 0.5 for unlearned/learning words, 1.0 for Review state (vocabulary-gated progression)
- Arabic numeral conversion handles U+0660-U+0669 range (Eastern Arabic ٠-٩)
- Set bonuses apply highest threshold met (e.g., 4-piece bonus active if player has 5 pieces equipped)
- Shop pricing formula: item.sellPrice * 2 * reputation modifier
- 8 equipment slots chosen: headCovering, robe, cloak, belt, boots, gloves, accessory1, accessory2 (culturally appropriate)
- 5 rarity tiers: common (white), uncommon (green), rare (blue), epic (purple), legendary (gold) with 0/1/1/2/2 max affixes
- 64 equipment items created spanning all slots and rarities with Arabic names and lore
- 25 Arabic adjective affixes chosen (18 positive, 7 negative) mapping to real Arabic words

**Phase 29 Plan 02 decisions (Phaser integration):**
- Equipment sprites render with 8 depth layers (boots=0, belt=5, robe=10, gloves=15, cloak=20, headCovering=25, accessory1=30, accessory2=35)
- EquipmentStats caches bonuses and refreshes on EQUIPMENT_CHANGED/EQUIPMENT_STATS_UPDATED (optimization)
- Equipment damage is multiplicative, defense divides incoming damage (standard RPG math)
- Battle rewards middleware placed AFTER rootFsrsSyncMiddleware (FSRS sync before affix auto-teach)
- Graceful degradation for missing equipment textures (development can continue without all 64 sprites)

**Phase 29 Plan 04 decisions (shop UI with haggling):**
- Haggle button only shows for items over 100 dirhams (avoid clutter for cheap items)
- Rare+ items require confirmation before selling (prevent accidental valuable item sales)
- Affix discovery toast shows both Arabic and English word, 4s duration for multiple affixes
- Shopkeeper mood emoji changes based on offer quality (neutral/thinking/pleased/offended)
- Prices display in both Eastern Arabic (٨٠٠) and Western (800) numerals
- Haggling discount range: 10-30% via MIN_PRICE/SWEET_SPOT/MERCHANT_TARGET logic
- Reusable ShopInventory component accepts mode prop ('buy'|'sell') for different UIs
- Affix learn status: green dot = learned, yellow dot + 50% badge = unlearned

### Phase 27 Foundation (already committed)

- Turn-based BattleScene with 17-state FSM (BattleStateMachine)
- 5 player actions (Attack/Magic/Item/Defend/Flee)
- Arabic accuracy = damage multiplier (miss/partial/good/perfect)
- 10 elemental VFX, 21 enemies, 18 status effects, 50 root-element mappings
- BattleOverlay + BattleMenu + BattleArabicInput + ComboCounter React components
- battleSlice expanded (14 reducers, 12 selectors)
- 11 BATTLE_* EventBus constants
- Gaps closed in Phase 29-02: rewards now wired via battleRewardsMiddleware (INTG-06)

### v6.0 Phase Structure

**Phase 27.1: IndexedDB Migration (INSERTED)**
- Requirements: STOR-01, STOR-02, STOR-03
- 5 success criteria (FSRS cards to IndexedDB, battle history to IndexedDB, 80% quota warning, auto-migration, redux-persist hybrid)
- Blocker for all other phases — prevents localStorage overflow

**Phase 28: Root Magic & Elemental Affinity**
- Requirements: MGIC-01 through MGIC-12, INTG-01
- 10 success criteria (root discovery, spell casting, MP system, spell hotbar, affinity discovery, power bonuses, combos, VFX, FSRS sync, spell upgrades)
- Depends on: Phase 27.1

**Phase 29: Equipment, Inventory & Economy**
- Requirements: EQUP-01 through EQUP-12, INTG-03, INTG-04, INTG-05, INTG-06
- 11 success criteria (8 equipment slots, stat comparisons, 200-item inventory, rarity tiers, shops, haggling, vocab-locked affixes, auto-teach, item lore, set bonuses, battle rewards wiring)
- Depends on: Phase 28

**Phase 30: Companion System**
- Requirements: COMP-01 through COMP-12, INTG-02
- 11 success criteria (12 recruitable companions, party formation, battle AI, relationship tracking, gifting, exploration dialogue, teaching specializations, adaptive difficulty, faceless sprites, roster UI, regression testing)
- Depends on: Phase 29

### Open Items Carried Forward

- Audio asset files (MP3s) need to be created/sourced
- Only 4 locked doors across 8 zones (partial coverage)
- Backend hardening deferred since v3.0 (Phases 12-13)
- No tests for Phase 27 battle code (~2.6K LOC) — deferred to Phase 31/32 (Advanced Combat)

### Blockers/Concerns

None. Phase 29 Plans 01-04 complete (3 of 4 plans done, 02/03 completed in parallel with 04).

### Pending Todos

None.

## Session Continuity

Last session: 2026-02-12 (Phase 29 Plans 01-04 complete)
Stopped at: 29-04-PLAN.md complete (2 tasks, 2 commits, SUMMARY created)
Next step: Phase 29 complete — ready for Phase 30 (Companion System)

---
*State initialized: 2026-02-08*
*Last updated: 2026-02-12 — Phase 29 Plans 01-04 complete (equipment data, Phaser integration, inventory UI, shop UI), ready for Phase 30*
