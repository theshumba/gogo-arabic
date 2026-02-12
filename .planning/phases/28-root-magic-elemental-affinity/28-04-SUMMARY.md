---
phase: 28-root-magic-elemental-affinity
plan: 04
subsystem: testing
tags: [vitest, tdd, unit-tests, integration-tests, regression, test-coverage]

# Dependency graph
requires:
  - phase: 28-01
    provides: magicSlice with 9 reducers and 8 selectors, spellData.js, elementCombos.js
  - phase: 28-02
    provides: RootMagicManager damage calculation, rootFsrsSyncMiddleware bidirectional sync
  - phase: 28-03
    provides: MagicOverlay, SpellMenu, RootDiscoveryToast React components
provides:
  - 74 comprehensive tests covering magic system (50 for data/slice, 24 for middleware/manager)
  - Full regression verification (721 total tests passing)
  - Build verification (main bundle 527.91KB, under 500KB gzipped)
  - DialogueEngine test fix for magic state compatibility
affects: [29-equipment-inventory, 30-companion-system]

# Tech tracking
tech-stack:
  added: []
  patterns: [reducer-pattern-testing, middleware-testing, damage-calculation-testing, mock-store-pattern]

key-files:
  created:
    - src/store/slices/__tests__/magicSlice.test.js
    - src/data/__tests__/spellData.test.js
    - src/data/__tests__/elementCombos.test.js
    - src/store/middleware/__tests__/rootFsrsSyncMiddleware.test.js
    - src/game/systems/magic/__tests__/RootMagicManager.test.js
  modified:
    - src/game/systems/__tests__/DialogueEngine.test.js

key-decisions:
  - "Reducer pattern testing: use reducer(initialState, action) directly to avoid IndexedDB persistence issues"
  - "Middleware testing: mock store with getState/dispatch, verify actions dispatched via store.dispatch.mock.calls"
  - "RootMagicManager testing: mock scene.time.delayedCall to execute callbacks immediately for synchronous tests"
  - "DialogueEngine test fix: initialize mock state BEFORE creating engine instance (constructor reads state)"
  - "Full regression: 647 existing + 74 new = 721 total tests, zero regressions"

patterns-established:
  - "Use vi.mock() at module level for Redux store and EventBus mocks"
  - "Create mock store with vi.fn() for getState/dispatch, filter mock.calls for verification"
  - "Use createMockScene() helper with overrides for Phaser scene mocking"
  - "Test data integrity: check exact counts, required fields, element/root mappings, unique IDs"
  - "Test selectors with wrapped state: const mockState = { magic: state }"

# Metrics
duration: 5min
completed: 2026-02-12
---

# Phase 28 Plan 04: Magic System Test Suite Summary

**Comprehensive test coverage for magic system: 74 new tests covering magicSlice reducers/selectors, spellData/elementCombos data integrity, rootFsrsSyncMiddleware bidirectional sync, and RootMagicManager damage calculation, plus full regression verification**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-12T17:21:19Z
- **Completed:** 2026-02-12T17:26:29Z
- **Tasks:** 2
- **Files modified:** 6 (5 created, 1 modified)

## Accomplishments

- 31 magicSlice tests: all 9 reducers (discoverRoot, recordRootUse, unlockForm, recordAffinityChoice, equipSpell, unequipSpell, recordCombo, clearBattleState, setLastCastTimestamp) and 8 selectors
- 10 spellData tests: structure validation, ROOT_ELEMENTS mapping, element distribution (5 per element), lookup functions
- 9 elementCombos tests: structure validation, ELEMENT_INFO mapping, checkCombo logic with level requirements, getCombosByElement
- 12 rootFsrsSyncMiddleware tests: FSRS→Root sync (6), Root→FSRS sync (3), form unlock (3)
- 12 RootMagicManager tests: damage calculation with 4 multipliers (9), castSpell MP validation and dispatches (3)
- Full regression: All 721 tests pass (647 existing + 74 new), build succeeds, bundle under 500KB gzipped

## Task Commits

Each task was committed atomically:

1. **Task 1: Write magicSlice, spellData, and elementCombos tests** - `6a47286` (test)
2. **Task 2: Write middleware and manager tests, then full regression** - `7a9dd66` (test)

## Files Created/Modified

**Created:**
- `src/store/slices/__tests__/magicSlice.test.js` - 31 tests covering all reducers and selectors
- `src/data/__tests__/spellData.test.js` - 10 data integrity tests (50 spells, ROOT_ELEMENTS mapping)
- `src/data/__tests__/elementCombos.test.js` - 9 data integrity tests (20 combos, ELEMENT_INFO mapping)
- `src/store/middleware/__tests__/rootFsrsSyncMiddleware.test.js` - 12 tests for bidirectional FSRS↔Root sync
- `src/game/systems/magic/__tests__/RootMagicManager.test.js` - 12 tests for damage calculation and spell casting

**Modified:**
- `src/game/systems/__tests__/DialogueEngine.test.js` - Added magic state to mock store, moved engine initialization after state setup

## Decisions Made

**Testing Patterns:**
- Reducer testing: Use `reducer(initialState, action)` directly instead of configureStore to avoid IndexedDB persistence issues in tests
- Middleware testing: Mock store with `vi.fn()` for getState/dispatch, verify dispatched actions via `store.dispatch.mock.calls`
- RootMagicManager testing: Override `scene.time.delayedCall` to execute callbacks immediately for synchronous test execution
- Selector testing: Wrap state in parent object (`{ magic: state }`) to match real Redux structure

**Test Coverage:**
- All 9 magicSlice reducers tested with edge cases (duplicate discovery, undiscovered roots, affinity locking thresholds)
- All 8 selectors tested including memoized selectors (selectAffinityBonuses)
- Data integrity: Exact counts (50 spells, 20 combos), required fields, ROOT_ELEMENTS/ELEMENT_INFO mapping, unique IDs
- Middleware: FSRS rating→accuracy mapping (3/4 → 0.8, 2 → 0.5), level-up suggestions (max 3 words), form unlock thresholds
- Damage calculation: All 4 multipliers (base, mastery, affinity, grammar), stacking, minimum 1 damage

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] DialogueEngine tests failing due to missing magic state**
- **Found during:** Task 2 (full regression run)
- **Issue:** DialogueEngine constructor reads `store.getState().magic.affinity` in constructor, but existing test mocked state did not include magic slice
- **Fix:** Added magic state to mockState object in DialogueEngine.test.js beforeEach, moved engine initialization after state setup
- **Files modified:** src/game/systems/__tests__/DialogueEngine.test.js
- **Verification:** All 28 DialogueEngine tests pass, full test suite at 721 passing
- **Committed in:** 7a9dd66 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary fix for backward compatibility. All existing tests continue to pass.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 05 (Documentation) or Phase 28 completion:**
- ✓ All magic system components have comprehensive test coverage
- ✓ Zero regressions across all 647 existing tests
- ✓ Build succeeds: main bundle 527.91KB (144.96KB gzipped, under 500KB limit)
- ✓ Test count: 721 total (647 existing + 74 new)
- ✓ All data integrity validated: 50 spells, 20 combos, ROOT_ELEMENTS mapping
- ✓ All critical paths tested: root discovery → mastery → affinity → spell equipping → damage calculation
- ✓ Bidirectional sync tested: FSRS→Root XP, Root→FSRS suggestions, level→form unlock

**Test Coverage Breakdown:**
- magicSlice: 31 tests (100% of reducers and selectors)
- spellData: 10 tests (structure, mapping, lookup)
- elementCombos: 9 tests (structure, mapping, combo logic)
- rootFsrsSyncMiddleware: 12 tests (3 sync directions)
- RootMagicManager: 12 tests (damage calculation, casting)
- **Total new tests:** 74
- **Total test suite:** 721 (647 baseline + 74 new)

**Blockers:** None.

---
*Phase: 28-root-magic-elemental-affinity*
*Completed: 2026-02-12*

## Self-Check: PASSED

All created files exist on disk:
- ✓ src/store/slices/__tests__/magicSlice.test.js
- ✓ src/data/__tests__/spellData.test.js
- ✓ src/data/__tests__/elementCombos.test.js
- ✓ src/store/middleware/__tests__/rootFsrsSyncMiddleware.test.js
- ✓ src/game/systems/magic/__tests__/RootMagicManager.test.js

All commits exist in git log:
- ✓ 6a47286 (Task 1: magicSlice, spellData, elementCombos tests)
- ✓ 7a9dd66 (Task 2: middleware, manager tests, DialogueEngine fix)

Full regression verification:
- ✓ npx vitest run: 721 tests pass (647 existing + 74 new)
- ✓ npx vite build: succeeds, main bundle 527.91KB (144.96KB gzipped)
