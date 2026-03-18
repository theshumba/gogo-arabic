---
phase: 37-polish-replay
plan: 04
subsystem: infrastructure
tags: [actor-registry, migrations, save-data, lifecycle, redux-persist]

# Dependency graph
requires:
  - phase: 37-01
    provides: "Phase 37 foundation"
  - phase: 37-03
    provides: "Tiered currency for migration initialization"
provides:
  - "src/game/systems/ActorRegistry.js — Unified actor lifecycle registry with singleton export"
  - "v7 save migration initializing home, stats, friendship, currency, and settings fields"
affects: [npc-manager, companion-manager, interactable-manager, save-system, new-player-flow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Singleton registry pattern: actorRegistry exported as module-level instance (matches audioManager pattern)"
    - "Actor entry: { id, type, sprite, data, active } stored in Map with secondary Set index by type"
    - "Migration pattern: check for missing fields/slices, initialize with defaults, preserve existing data"

key-files:
  created:
    - src/game/systems/ActorRegistry.js
  modified:
    - src/services/storage/migrations.js

key-decisions:
  - "ActorRegistry is a foundation — existing managers (NPCManager, CompanionManager, etc.) continue working unchanged"
  - "Singleton pattern (actorRegistry) matches audioManager convention for global access"
  - "Migration v7 initializes home grid as 8x10, stats with full tracking fields, currency from existing dirhams"
  - "findNearest helper uses Euclidean distance on sprite positions for spatial queries"

patterns-established:
  - "ActorRegistry: register(id, type, sprite, data) -> get(id) | getByType(type) | findNearest(type, x, y)"
  - "Migration version bumping: increment CURRENT_VERSION, add numbered key to migrations object"

requirements-completed: []

# Metrics
duration: 5min
completed: 2026-03-18
---

# Phase 37 Plan 04: ActorRegistry + Save Migrations Summary

**Unified ActorRegistry with register/unregister/getByType/findNearest + v7.0 save migrations for home, stats, friendship, currency, and settings fields**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-18T23:03:00Z
- **Completed:** 2026-03-18T23:08:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- ActorRegistry class with Map-based storage and Set-based type indexing for O(1) lookups
- Singleton `actorRegistry` export for global access across Phaser scenes
- findNearest spatial query for proximity-based actor lookups
- v7 migration initializing 5 new state areas: home slice, stats slice, NPC friendship, tiered currency, and difficulty/display settings

## Task Commits

Both tasks were committed together in a prior session:

1. **Task 1: Create ActorRegistry** - `23d462c` (feat)
2. **Task 2: Update save migrations for v7.0 slices** - `23d462c` (feat)

## Files Created/Modified
- `src/game/systems/ActorRegistry.js` - Unified actor lifecycle registry with register/unregister/get/getByType/getAll/getActive/setActive/updateData/count/clear/findNearest
- `src/services/storage/migrations.js` - v7 migration: home (8x10 grid + furniture + utilities), stats (12 tracking fields), friendship, currency (fils/dirhams/dinars from legacy dirhams), settings (difficulty, vowelMarks, hintFrequency, battleSpeed, vocabRandomizerSeed, showRomanization)

## Decisions Made
- ActorRegistry uses Map + Set dual index rather than a single object for O(1) id lookups and efficient type iteration
- Migration preserves existing dirhams value when initializing tiered currency
- showRomanization defaulted to true (not in original plan but present in migration - appropriate for new players)

## Deviations from Plan
None - plan artifacts already implemented exactly as specified. Build fixes covered in 37-03-SUMMARY.md.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ActorRegistry ready for gradual migration of NPCManager, CompanionManager, InteractableManager actors
- Save migrations handle all v7.0 fields — safe for existing players to upgrade
- CURRENT_VERSION at 7 — next migration would be version 8

---
*Phase: 37-polish-replay*
*Completed: 2026-03-18*
