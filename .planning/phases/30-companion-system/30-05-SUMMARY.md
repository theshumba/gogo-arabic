---
phase: 30-companion-system
plan: 05
subsystem: testing
tags: [test-suite, companion-tests, regression, quality-assurance]
completed: 2026-02-13
duration: 37min
dependency_graph:
  requires: [30-01, 30-02, 30-03, 30-04]
  provides: [companion-test-coverage, phase-30-regression-validation]
  affects: []
tech_stack:
  testing:
    - vitest (unit testing framework)
    - vi.mock (module mocking)
    - RTL (React Testing Library patterns)
  patterns:
    - direct reducer testing (avoid IndexedDB in tests)
    - Phaser scene mocking (reusable mocks)
    - EventBus mock pattern (factory functions)
key_files:
  created:
    - src/store/slices/__tests__/companionSlice.test.js
    - src/utils/__tests__/dialogueComplexity.test.js
    - src/utils/__tests__/companionRelationship.test.js
    - src/data/__tests__/companions.test.js
    - src/game/systems/companions/__tests__/CompanionBattleAI.test.js
    - src/game/systems/companions/__tests__/CompanionManager.test.js
    - src/game/systems/companions/__tests__/CompanionContext.test.js
  modified:
    - src/store/__tests__/battleSlice.test.js (added Phase 30 companion fields to initial state)
decisions:
  - choice: "Direct reducer testing pattern"
    rationale: "Calling reducer(initialState, action) avoids IndexedDB persistence issues in tests (same pattern as magicSlice, inventorySlice)"
    alternatives: ["Full store setup with mocked IndexedDB"]
    outcome: "Clean, fast tests without async complexity"
  - choice: "Mock definition order for vi.mock()"
    rationale: "Vitest hoists vi.mock() calls, so mock objects must be defined inline (not as variables)"
    alternatives: ["Top-level variable definitions (causes hoisting errors)"]
    outcome: "All mocks work correctly with proper factory function pattern"
  - choice: "Simplified C2 estimation test"
    rationale: "Array.from().reduce() was too slow (5500 iterations caused timeout), switched to for-loop"
    alternatives: ["Increase test timeout", "Use smaller dataset"]
    outcome: "Test passes in <10ms instead of 6500ms timeout"
  - choice: "Update battleSlice.test.js"
    rationale: "Phase 30-02 added 6 companion fields to battleSlice initial state, existing test needed update"
    alternatives: ["Use partial state matching with expect.objectContaining()"]
    outcome: "Full state validation ensures no unexpected fields creep in"
metrics:
  tests_added: 149
  tests_before: 874
  tests_after: 1023
  test_breakdown:
    companionSlice: 28
    dialogueComplexity: 19
    companionRelationship: 23
    companions_data: 29
    CompanionBattleAI: 24
    CompanionManager: 16
    CompanionContext: 10
  coverage_areas:
    - Redux state management (recruitments, gifts, mood, party)
    - CEFR dialogue scaling (A1-C2 ratios)
    - Relationship tier mapping (5 tiers, battle bonuses)
    - Data integrity (12 companions, 2400+ dialogue lines)
    - Battle AI behavior trees (4 roles, HP/MP thresholds)
    - Companion lifecycle (spawn/despawn/swap)
    - Context triggers (zone changes, cooldowns, battle comments)
  regression_status: "PASS (1023/1023)"
  build_status: "SUCCESS"
---

# Phase 30 Plan 05: Companion System Test Suite

**One-liner:** 149 comprehensive tests for companion state management, battle AI behavior trees, Phaser lifecycle, and data integrity with zero regressions across 1023 total tests.

## Objective

Create comprehensive test coverage for the entire companion system:
1. Redux state management (companionSlice reducers and selectors)
2. Utility functions (CEFR dialogue scaling, relationship tiers)
3. Data integrity (companion definitions, dialogue corpus)
4. Battle AI (behavior trees for all 4 roles)
5. Phaser systems (CompanionManager lifecycle, CompanionContext triggers)
6. Full regression validation (all 874 existing tests must pass)

## Implementation

### Task 1: Redux, Utility, and Data Tests (99 tests)

**companionSlice.test.js (28 tests)**
- Reducer tests: recruitCompanion (idempotent, unknown IDs), setActiveCompanion (slot validation, no duplicates, recruitment check), removeActiveCompanion, giveGift (relationship/mood clamping at 100), updateRelationship (clamping 0-100), setCompanionMood (clamping), recordDialogueLine (FIFO at 50 entries), updateCompanionLevel (min 1), clearBattleCompanionState
- Selector tests: selectAllCompanions, selectCompanion, selectActiveParty, selectRecruitedCompanions, selectCompanionRelationship (with fallback)
- Pattern: Direct reducer testing `reducer(initialState, action)` to avoid IndexedDB persistence complexity

**dialogueComplexity.test.js (19 tests)**
- CEFR ratio mapping (A1=0.2, A2=0.4, B1=0.6, B2=0.7, C1=0.8, C2=0.95)
- Fallback handling (undefined/unknown → 0.5)
- Dialogue scaling logic:
  - A1-A2 (ratio ≤ 0.5): English primary, Arabic secondary, show transliteration
  - B1 (ratio = 0.6): Arabic primary, English secondary, show transliteration
  - B2 (ratio = 0.7): Arabic primary, English secondary, no transliteration
  - C1+ (ratio ≥ 0.8): Arabic primary only (immersion mode), no secondary, no transliteration
- Missing field handling (graceful degradation to available language)
- Deterministic output (no randomness)

**companionRelationship.test.js (23 tests)**
- Tier mapping (5 tiers: stranger 0-19, acquaintance 20-39, friend 40-59, closeFriend 60-79, bestFriend 80-100)
- Battle bonus scaling (0%, 5%, 10%, 15%, 20%)
- Gift bonus calculation (base * 1.5 for preferred gifts, base * 1.0 otherwise)
- Relationship multiplier (1.0 to 1.2 based on tier)
- Boundary validation (negative values, 100 cap)
- Floor to integer (all bonuses return whole numbers)

**companions.test.js (29 tests)**
- Structure: Exactly 12 companions, all IDs start with `companion_`, all required fields present
- Role distribution: All 4 battle roles (healer/attacker/defender/support) have 2+ companions
- Specialty distribution: All 4 teaching specialties (grammar/vocabulary/pronunciation/culture) have 2+ companions
- Zone distribution: All 6 zones have 2+ companions
- No duplicate IDs
- BaseStats validation (hp/mp/damage/defense > 0, all integers)
- ColorPalette validation (primary/secondary/accent hex codes)
- RecruitCondition validation (valid types: quest/storyFlag/relationship/level)
- PreferredGifts validation (all reference valid GIFT_CATEGORIES)
- Utility functions: getCompanion, getCompanionsByZone
- COMPANION_DIALOGUE integration: all 12 companions have dialogue entries, 10+ greetings each, 2400+ total lines

### Task 2: Phaser System Tests + Regression (50 tests)

**CompanionBattleAI.test.js (24 tests)**
- Healer behavior tree: heals player at <40% HP (MP ≥ 15), heals self at <40% HP (MP ≥ 15), light heal player at <70% HP (MP ≥ 10), attacks when HP above thresholds or MP too low
- Attacker behavior tree: uses skill when enemy HP > 50% and MP ≥ 20, power attack when enemy HP < 25% (finish off), basic attack as fallback, skill damage > basic damage
- Defender behavior tree: defends player when HP < 50%, dispels enemy buff when MP ≥ 10, attacks as fallback, no defend when player HP ≥ 50%
- Support behavior tree: buffs strength (no existing buff, MP ≥ 12), buffs defense_up (priority 2, MP ≥ 10), buffs accuracy_up (priority 3, MP ≥ 8), attacks when MP depleted, no duplicate buffs
- General: relationship multiplier scaling (1.0/1.1/1.2 at 0/50/90), damage/heal as integers (Math.floor), action object structure (action + target fields)

**CompanionManager.test.js (16 tests)**
- Constructor: creates instance, spawns if exploration slot already set, listens for party change events
- Spawning: spawns companion with correct position offset (player.x - 60, player.y + 30), uses fallback texture if sprite not loaded, sets depth (player.depth - 1), emits COMPANION_FOLLOW_START
- Despawning: destroys sprite, emits COMPANION_FOLLOW_STOP, clears activeCompanion/activeCompanionId
- Party changes: handles swap (despawn old, spawn new), ignores battle slot changes (only responds to exploration slot), handles null (despawn)
- Update: calls companion.update() and context.evaluateTriggers(), does nothing if no active companion
- Getters: getActiveCompanion, getActiveCompanionId
- Destroy: cleans up EventBus listener, despawns companion, nulls context

**CompanionContext.test.js (10 tests)**
- Zone change trigger: emits COMPANION_CONTEXTUAL_COMMENT on zone entry, respects 10-second cooldown (no emission within cooldown), tracks shown comments (no repeats via shownComments Set), handles null zone gracefully
- Battle comment trigger: emits for victory outcome, emits for defeat outcome, handles missing dialogue gracefully
- Reset: clears shownComments and cooldown (allows re-showing same comments)
- CEFR estimation: estimates A1 for ≤100 cards, estimates C2 for >5000 cards (optimized for-loop instead of Array.from().reduce() to avoid timeout)

**battleSlice.test.js fix**
- Added 6 companion fields to initial state expectation (companionHP, companionMaxHP, companionMP, companionMaxMP, companionEffects, companionDefending)
- These were added in Phase 30-02 but the test wasn't updated

### Test Execution

```bash
# Task 1 tests (99)
npx vitest run src/store/slices/__tests__/companionSlice.test.js          # 28 tests
npx vitest run src/utils/__tests__/dialogueComplexity.test.js             # 19 tests
npx vitest run src/utils/__tests__/companionRelationship.test.js          # 23 tests
npx vitest run src/data/__tests__/companions.test.js                      # 29 tests

# Task 2 tests (50)
npx vitest run src/game/systems/companions/__tests__/CompanionBattleAI.test.js  # 24 tests
npx vitest run src/game/systems/companions/__tests__/CompanionManager.test.js   # 16 tests
npx vitest run src/game/systems/companions/__tests__/CompanionContext.test.js   # 10 tests

# Full regression
npx vitest run  # 1023/1023 tests pass (874 existing + 149 new)
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Mock definition order for vi.mock()**
- **Found during:** CompanionManager.test.js and CompanionContext.test.js creation
- **Issue:** Using top-level variables in vi.mock() factory causes "Cannot access before initialization" error due to Vitest hoisting
- **Fix:** Defined mock objects inline within vi.mock() factory functions instead of as variables
- **Files modified:** CompanionManager.test.js, CompanionContext.test.js
- **Commit:** 3534fe9 (included in Task 2 commit)

**2. [Rule 3 - Blocking] C2 estimation test timeout**
- **Found during:** Full regression run
- **Issue:** `Array.from({ length: 5500 }).reduce()` took 6500ms and timed out
- **Fix:** Replaced with simple for-loop to build fsrsCards object (completes in <10ms)
- **Files modified:** CompanionContext.test.js
- **Commit:** 3534fe9 (included in Task 2 commit)

**3. [Rule 3 - Blocking] battleSlice initial state regression**
- **Found during:** Full regression run
- **Issue:** Test expected 24 fields but initialState had 30 fields (6 companion fields added in Phase 30-02)
- **Fix:** Added 6 companion fields to test expectation (companionHP, companionMaxHP, companionMP, companionMaxMP, companionEffects, companionDefending)
- **Files modified:** src/store/__tests__/battleSlice.test.js
- **Commit:** 3534fe9 (included in Task 2 commit)

## Verification

### Must-Haves (8/8 verified)

1. ✅ **companionSlice reducers correctly manage recruitment, relationships, party, and gifts**
   - 28 reducer tests cover all 9 reducers and 6 selectors
   - Recruitment idempotency, party slot validation, relationship/mood clamping, dialogue history FIFO

2. ✅ **CompanionBattleAI selects correct actions for all 4 roles at various HP/MP thresholds**
   - 24 tests cover healer (3 heal thresholds + fallback), attacker (skill/power/basic), defender (defend/dispel/attack), support (3-priority buff system)
   - Relationship multiplier scaling (1.0/1.1/1.2), integer damage/heal values

3. ✅ **CompanionManager creates and destroys companion sprites correctly**
   - 16 tests cover spawn (position offset, texture fallback, depth), despawn (cleanup), party changes (swap/clear), lifecycle (update/destroy)

4. ✅ **CompanionContext respects 10-second cooldown between comments**
   - Cooldown test verifies no emission within 10s window
   - Reset test verifies cooldown clears properly

5. ✅ **dialogueComplexity returns correct Arabic ratio for each CEFR level**
   - All 6 levels tested (A1=0.2, A2=0.4, B1=0.6, B2=0.7, C1=0.8, C2=0.95)
   - Fallback to 0.5 for undefined/unknown levels
   - Dialogue scaling logic for all threshold transitions

6. ✅ **companionRelationship maps tiers correctly and calculates gift bonuses**
   - All 5 tiers tested (stranger/acquaintance/friend/closeFriend/bestFriend)
   - Gift bonus: 1.5x for preferred, 1.0x otherwise
   - Relationship multiplier: 1.0 to 1.2 based on tier

7. ✅ **Companion data has 12 entries with complete fields covering all zones, roles, and specialties**
   - 29 data integrity tests verify structure, distribution, validation
   - All 6 zones have 2+ companions
   - All 4 roles have 2+ companions
   - All 4 specialties have 2+ companions
   - COMPANION_DIALOGUE has 2400+ lines total

8. ✅ **All 874 existing tests still pass (zero regressions)**
   - Full regression: 1023/1023 tests pass
   - Build: ✓ built in 3.57s (no errors)

## Test Coverage Breakdown

| Category | File | Tests | Focus |
|----------|------|-------|-------|
| **Redux** | companionSlice.test.js | 28 | Reducers, selectors, state mutations |
| **Utils** | dialogueComplexity.test.js | 19 | CEFR scaling, language selection |
| **Utils** | companionRelationship.test.js | 23 | Tier mapping, gift bonuses |
| **Data** | companions.test.js | 29 | Data integrity, validation |
| **Phaser AI** | CompanionBattleAI.test.js | 24 | Behavior trees, role logic |
| **Phaser Lifecycle** | CompanionManager.test.js | 16 | Spawn/despawn, party management |
| **Phaser Context** | CompanionContext.test.js | 10 | Triggers, cooldowns |
| **Regression Fix** | battleSlice.test.js | 1 | Initial state validation |
| **Total** | **7 new + 1 fix** | **150** | **Full companion system** |

## Testing Patterns

### Pattern 1: Direct Reducer Testing
```javascript
// Get initial state by calling reducer with init action
const initialState = companionReducer(undefined, { type: '@@INIT' });

// Test reducer directly (avoids IndexedDB persistence)
const state = companionReducer(initialState, recruitCompanion('companion_amira'));
expect(state.companions.companion_amira.recruited).toBe(true);
```

### Pattern 2: Phaser Scene Mocking
```javascript
import { createMockScene } from '../../__tests__/mocks/sceneMock.js';

const scene = createMockScene({
  playerController: {
    getPlayer: vi.fn(() => ({ x: 100, y: 100, depth: 10 })),
  },
});
```

### Pattern 3: EventBus Mock (Factory Function)
```javascript
// BAD: Top-level variable (hoisting error)
const mockEventBus = { on: vi.fn(), off: vi.fn(), emit: vi.fn() };
vi.mock('...eventBus.js', () => ({ EventBus: mockEventBus }));

// GOOD: Inline factory function
vi.mock('...eventBus.js', () => ({
  EventBus: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
}));
```

### Pattern 4: Optimized Object Creation
```javascript
// BAD: Slow for large datasets (5500 iterations)
Array.from({ length: 5500 }, (_, i) => [`word${i}`, {}]).reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})

// GOOD: Fast for-loop
const fsrsCards = {};
for (let i = 0; i < 5500; i++) {
  fsrsCards[`word${i}`] = {};
}
```

## Success Criteria

- ✅ All new test files created with comprehensive coverage (7 files, 149 tests)
- ✅ Each task committed individually (2 commits: f7048ac, 3534fe9)
- ✅ Full regression: 1023/1023 tests pass (874 existing + 149 new), zero failures
- ✅ Build succeeds with no errors
- ✅ SUMMARY.md created
- ✅ All must-haves verified (8/8)

## Next Phase Readiness

**Phase 30 COMPLETE (5/5 plans)**

Phase 30 is now complete with full test coverage:
- Plan 01: Companion data foundation (companionSlice, COMPANIONS, COMPANION_DIALOGUE)
- Plan 02: Companion battle AI (CompanionBattleAI, battle integration)
- Plan 03: Companion exploration (CompanionManager, CompanionContext, following system)
- Plan 04: Companion UI (CompanionUI roster, PartyPanel, RelationshipBar, gifts, battle display)
- Plan 05: Companion test suite (149 comprehensive tests, zero regressions) ← **CURRENT**

**Ready for:** Phase 31 (Crafting System) or Phase 32 (Advanced Combat)

## Self-Check

✅ **PASSED**

Created files verified:
- ✅ src/store/slices/__tests__/companionSlice.test.js (28 tests pass)
- ✅ src/utils/__tests__/dialogueComplexity.test.js (19 tests pass)
- ✅ src/utils/__tests__/companionRelationship.test.js (23 tests pass)
- ✅ src/data/__tests__/companions.test.js (29 tests pass)
- ✅ src/game/systems/companions/__tests__/CompanionBattleAI.test.js (24 tests pass)
- ✅ src/game/systems/companions/__tests__/CompanionManager.test.js (16 tests pass)
- ✅ src/game/systems/companions/__tests__/CompanionContext.test.js (10 tests pass)

Modified files verified:
- ✅ src/store/__tests__/battleSlice.test.js (26 tests pass including initial state)

Commits verified:
- ✅ f7048ac: test(30-05): add companionSlice, utility, and data integrity tests
- ✅ 3534fe9: test(30-05): add Phaser companion tests and fix battleSlice regression

Full regression verified:
- ✅ 1023/1023 tests pass
- ✅ Build succeeds in 3.57s
