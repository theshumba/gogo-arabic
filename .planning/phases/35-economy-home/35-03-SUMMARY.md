---
phase: 35-economy-home
plan: 03
subsystem: home
tags: [decoration, grid-placement, redux, furniture, utility-metrics]

# Dependency graph
requires:
  - phase: 35-01
    provides: Economy foundation pattern (standalone class, deferred Redux wiring)
provides:
  - UTILITY_CATEGORIES export in furniture.js — 4 categories (Comfort, Knowledge, Hospitality, Barakah) with Arabic labels
  - utilityCategory + utilityValue fields on 8 furniture items (4 existing + 4 new)
  - homeSlice — Redux slice tracking 8x10 placement grid, ownedFurniture list, and utility totals
  - HomeDecoration class — grid-based placement engine with ownership verification and utility queries
affects: [future-home-ui, future-decoration-scene, future-economy-wiring]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Grid state as 2D array in Redux (placementGrid[row][col] = furnitureId | null)
    - Utility recalculation as pure scan on every place/remove (no incremental delta tracking)
    - HomeDecoration class dispatches to Redux via store singleton (same pattern as other game systems)

key-files:
  created:
    - src/store/slices/homeSlice.js
    - src/game/systems/HomeDecoration.js
  modified:
    - src/data/furniture.js

key-decisions:
  - "homeSlice NOT registered in store.js yet — deferred to future plan (follows EconomyFlow deferral pattern from 35-01)"
  - "recalcUtilitiesFromGrid scans full grid on every place/remove (not delta) — simple, correct, performant at 8x10 scale"
  - "barrel and crate have no utilityCategory — they are trade goods, not decorative items (intentional omission)"
  - "ownedFurniture quantity tracked in homeSlice — canPlace() checks ownership before dispatching"

patterns-established:
  - "Furniture utility pattern: utilityCategory (string key) + utilityValue (number) on FURNITURE entries"
  - "Selector factory: selectUtility(category) returns curried selector for single-category reads"

# Metrics
duration: 2min
completed: 2026-03-16
---

# Phase 35 Plan 03: Home Decoration System Summary

**Grid-based home decoration engine with 8x10 placement grid, ownership-verified placement, and 4-category utility scoring (Comfort/Knowledge/Hospitality/Barakah) tracked in homeSlice.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-16T15:42:46Z
- **Completed:** 2026-03-16T15:44:47Z
- **Tasks:** 2/2
- **Files modified:** 3 (furniture.js modified, homeSlice.js + HomeDecoration.js created)

## Accomplishments

- Extended 4 existing furniture items (bookshelf, lantern, pot, chest) with `utilityCategory` and `utilityValue`
- Added 4 new home-specific decoration items: prayer_rug (Barakah 5), study_desk (Knowledge 4), cushion_set (Hospitality 4), incense_burner (Comfort 3)
- Exported `UTILITY_CATEGORIES` with Arabic labels and icons for all 4 categories
- Created `homeSlice` with 8x10 placement grid, owned furniture inventory, and auto-recalculated utility totals
- Created `HomeDecoration` logic class: bounds check, occupancy check, ownership check, Redux dispatch

## Task Commits

Each task was committed atomically:

1. **Task 1: Add utility categories to furniture + create homeSlice** - `08b5ad6` (feat)
2. **Task 2: Create HomeDecoration grid system** - `67cb195` (feat)

**Plan metadata:** (final docs commit — see below)

## Files Created/Modified

- `src/data/furniture.js` — Added utilityCategory/utilityValue to 8 items; added 4 new home items; added UTILITY_CATEGORIES export
- `src/store/slices/homeSlice.js` — New Redux slice: placementGrid 8x10, ownedFurniture, utilities; 4 reducers; 4 selectors
- `src/game/systems/HomeDecoration.js` — New class: canPlace(), place(), remove(), getUtilitySummary(), getFurnitureAt()

## Decisions Made

- **homeSlice not registered in store.js**: Plan explicitly says "Do NOT register in store.js yet" — deferred to future plan, consistent with EconomyFlow standalone pattern from 35-01
- **Full grid rescan on every place/remove**: At 8x10 = 80 cells, a full scan is O(80) — trivially fast, simpler than maintaining delta state
- **barrel/crate have no utilityCategory**: These are trade goods, not decorative items — intentionally excluded (explains why grep count was 9 not 10+)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `homeSlice` ready to register in `store.js` (add to rootReducer + persist whitelist in a future plan)
- `HomeDecoration` ready to instantiate in a future decoration scene or WorldScene
- `UTILITY_CATEGORIES` and `FURNITURE` data ready for React decoration UI components
- Build passes cleanly, no regressions

---
*Phase: 35-economy-home*
*Completed: 2026-03-16*

## Self-Check: PASSED

- FOUND: src/data/furniture.js
- FOUND: src/store/slices/homeSlice.js
- FOUND: src/game/systems/HomeDecoration.js
- FOUND: .planning/phases/35-economy-home/35-03-SUMMARY.md
- FOUND commit: 08b5ad6 (Task 1)
- FOUND commit: 67cb195 (Task 2)
