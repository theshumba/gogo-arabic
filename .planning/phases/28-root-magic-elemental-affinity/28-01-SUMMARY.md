---
phase: 28-root-magic-elemental-affinity
plan: 01
subsystem: magic
tags: [redux, indexeddb, magic-system, arabic-roots, spell-data, combos, eventbus]

# Dependency graph
requires:
  - phase: 27.1-indexeddb-migration
    provides: IndexedDB nested persistReducer pattern and adapter
provides:
  - magicSlice with root discovery, mastery tracking, affinity progression, and spell equipping
  - 50 spell definitions (5 per element, mapped to Arabic roots)
  - 20 combo definitions (element pair interactions with multipliers)
  - 15 MAGIC_* EventBus constants for React-Phaser communication
  - Redux store wiring with IndexedDB persistence for magic state
affects: [29-equipment-inventory, 30-companion-system, 28-02-phaser-managers, 28-03-react-ui]

# Tech tracking
tech-stack:
  added: []
  patterns: [redux-slice, nested-persistReducer, memoized-selectors, data-driven-spells]

key-files:
  created:
    - src/store/slices/magicSlice.js
    - src/data/spellData.js
    - src/data/elementCombos.js
  modified:
    - src/utils/eventBusTypes.js
    - src/store/store.js

key-decisions:
  - "XP-based leveling: 100 XP per level, accuracy-based XP gain (5/10/15 for partial/good/perfect)"
  - "Affinity locking: After 50 choices, weighted histogram computes primary (2x) and secondary (1.5x) multipliers"
  - "All spells start at Form I (basic form) with 5 MP cost and 16-30 base damage"
  - "Combos require minimum root levels (2-4) and match element pairs alphabetically"
  - "magicSlice uses IndexedDB nested persistReducer (same pattern as vocabulary and battle)"

patterns-established:
  - "Root discovery → mastery tracking → affinity locking → spell equipping (full lifecycle)"
  - "Data-driven spell and combo definitions (no hardcoded values)"
  - "Memoized selectors for affinity bonuses and spell power calculations"
  - "EventBus strict namespacing: source:category:action (react/phaser:magic:event-name)"

# Metrics
duration: 4min
completed: 2026-02-12
---

# Phase 28 Plan 01: Root Magic Data Foundation Summary

**Redux state management, 50 spells, 20 combos, 15 EventBus constants, and IndexedDB persistence for the root magic system**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-12T17:02:22Z
- **Completed:** 2026-02-12T17:06:42Z
- **Tasks:** 2
- **Files modified:** 5 (2 created, 3 modified)

## Accomplishments

- magicSlice created with 9 reducers and 8 memoized selectors
- 50 spell definitions mapped to Arabic roots (5 per element across 10 elements)
- 20 combo definitions with thematic element pairs and status effects
- 15 MAGIC_* EventBus constants with strict source:category:action namespacing
- magicSlice wired into Redux store with IndexedDB nested persistReducer

## Task Commits

Each task was committed atomically:

1. **Task 1: Create magicSlice with full state management** - `3a4c572` (feat)
2. **Task 2: Create spell data, combo data, EventBus events, and wire store** - `e5e76ab` (feat)

## Files Created/Modified

**Created:**
- `src/store/slices/magicSlice.js` - Redux slice with discoveredRoots, rootMastery, affinity, equippedSpells state
- `src/data/spellData.js` - 50 spell definitions with Arabic names, base damage, MP costs, status effects
- `src/data/elementCombos.js` - 20 combo definitions with damage multipliers, VFX types, level requirements

**Modified:**
- `src/utils/eventBusTypes.js` - Added 15 MAGIC_* events after BATTLE v6.0 section
- `src/store/store.js` - Wired magicSlice with IndexedDB nested persistReducer (magicPersistConfig)

## Decisions Made

**XP and Leveling:**
- 100 XP per level threshold (level = floor(xp/100) + 1)
- Accuracy-based XP gain: perfect (≥0.95) = 15 XP, good (≥0.7) = 10 XP, partial = 5 XP
- All roots start at level 1 with Form I unlocked

**Affinity System:**
- Affinity locks after 50 discovery choices
- Weighted histogram computes primary (2x multiplier) and secondary (1.5x multiplier)
- Primary and secondary based on highest and second-highest element weight sums

**Spell Design:**
- All 50 spells start at Form I (basic form)
- Base damage ranges from 16-30 depending on root meaning
- MP cost = 5 (from SPELL_TIERS.I.mpCost)
- Status effects vary: burn, regen, cleanse, defense_up, attack_up, paralyzed, blind, slow, reveal, etc.

**Combo Design:**
- 20 combos covering thematic element pairs (fire+water = steam, earth+fire = magma, etc.)
- Damage multipliers range from 1.3x to 1.8x
- Root level requirements: 2-4 (both roots must meet requirement)
- Elements sorted alphabetically for consistent lookup

**Storage:**
- magicSlice uses IndexedDB nested persistReducer (same pattern as vocabulary and battle)
- Key: 'gogo-arabic-magic', storage: indexedDBStorage, version: CURRENT_VERSION
- NOT in root persistConfig whitelist (has its own nested config)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 02 (Phaser Managers):**
- magicSlice exports all required actions and selectors
- 50 spells accessible via getSpellByRoot(rootId, form) and getSpellsByElement(element)
- 20 combos accessible via checkCombo(spell1, spell2, rootMastery) and getCombosByElement(element)
- 15 MAGIC_* EventBus constants available in EVENTS object
- Redux store.magic.* state accessible from all scenes and components

**Blockers:** None.

**Verification:**
- ✓ `npx vite build` succeeds (458KB main bundle, under 500KB limit)
- ✓ magicSlice exports 9 actions and 8 selectors
- ✓ spellData.js has exactly 50 spells
- ✓ elementCombos.js has exactly 20 combos
- ✓ eventBusTypes.js has exactly 15 MAGIC_* constants with no collisions
- ✓ store.js has magic reducer with IndexedDB nested persistReducer

---
*Phase: 28-root-magic-elemental-affinity*
*Completed: 2026-02-12*

## Self-Check: PASSED

All created files exist on disk:
- ✓ src/store/slices/magicSlice.js
- ✓ src/data/spellData.js
- ✓ src/data/elementCombos.js

All commits exist in git log:
- ✓ 3a4c572 (Task 1: magicSlice)
- ✓ e5e76ab (Task 2: spell data, combos, events, store wiring)
