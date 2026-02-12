---
phase: 28-root-magic-elemental-affinity
plan: 02
subsystem: magic
tags: [phaser, redux-middleware, battle-system, dialogue-system, fsrs-sync]

# Dependency graph
requires:
  - phase: 28-01
    provides: magicSlice, spellData, elementCombos, EventBus MAGIC_* constants
provides:
  - RootMagicManager for spell casting in battle with damage calculation
  - AffinityTracker for affinity analysis (progress, top elements, prediction)
  - rootFsrsSyncMiddleware for bidirectional FSRS ↔ root mastery sync
  - BattleStateMachine MAGIC_CAST state for spell casting flow
  - DialogueEngine discover_root and affinity_choice effects
affects: [28-03-react-ui, 29-equipment-inventory, 30-companion-system]

# Tech tracking
tech-stack:
  added: []
  patterns: [phaser-system-class, redux-middleware, bidirectional-sync, accuracy-multipliers]

key-files:
  created:
    - src/game/systems/magic/RootMagicManager.js
    - src/game/systems/magic/AffinityTracker.js
    - src/store/middleware/rootFsrsSyncMiddleware.js
  modified:
    - src/store/store.js
    - src/game/systems/battle/BattleStateMachine.js
    - src/game/systems/DialogueEngine.js

key-decisions:
  - "RootMagicManager calculates damage: base (tier * 20) * mastery (1.0 + level * 0.1) * affinity (2.0/1.5/1.0) * grammar (1.2/1.0/0.5)"
  - "FSRS reviews contribute 30% weight to root XP (rating 3+ = 0.8 accuracy, rating 2 = 0.5, rating 1 = 0.3)"
  - "Root level-up suggests up to 3 derived words for FSRS queue to avoid flooding"
  - "Form unlocks: Level 3 → Form II, Level 5 → Form III, Level 7 → Form IV, Level 9 → Form V"
  - "BattleStateMachine MAGIC_CAST state prompts Arabic word derived from spell's root"
  - "Magic damage delegated to RootMagicManager via delayed call (800ms for VFX)"
  - "DialogueEngine affinity lock emits MAGIC_AFFINITY_LOCKED only once per session"

patterns-established:
  - "Phaser system class pattern (no Scene inheritance, receives scene reference)"
  - "Redux middleware bidirectional sync (action → side effect → action)"
  - "Accuracy-based XP gain with weighted contributions (70% in-game, 30% FSRS)"
  - "Combo tracking via recent cast history (last 5 spells, cap)"

# Metrics
duration: 4min
completed: 2026-02-12
---

# Phase 28 Plan 02: Phaser Managers & Middleware Summary

**Spell casting engine with RootMagicManager damage calculation, rootFsrsSyncMiddleware bidirectional sync, and battle/dialogue integration**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-12T17:11:15Z
- **Completed:** 2026-02-12T17:15:33Z
- **Tasks:** 2
- **Files modified:** 6 (3 created, 3 modified)

## Accomplishments

- RootMagicManager created: spell casting, damage calculation with 4 multipliers, combo detection
- AffinityTracker created: read-only affinity analysis (progress, top elements, prediction)
- rootFsrsSyncMiddleware created: 3-way sync (FSRS→root, root→FSRS, root→form unlock)
- BattleStateMachine MAGIC_CAST state integrated: prompts root-derived word, delegates to RootMagicManager
- DialogueEngine discover_root and affinity_choice effects: dispatch actions, emit events, show notifications

## Task Commits

Each task was committed atomically:

1. **Task 1: Create RootMagicManager, AffinityTracker, and rootFsrsSyncMiddleware** - `da7217e` (feat)
2. **Task 2: Integrate magic into BattleStateMachine and DialogueEngine** - `0cb687f` (feat)

## Files Created/Modified

**Created:**
- `src/game/systems/magic/RootMagicManager.js` - Spell casting with damage calculation (mastery + affinity + grammar multipliers), combo tracking
- `src/game/systems/magic/AffinityTracker.js` - Static analysis methods: getAffinityProgress, getTopElements, predictAffinity
- `src/store/middleware/rootFsrsSyncMiddleware.js` - Bidirectional FSRS sync: vocabulary/updateFsrsCard → recordRootUse (30% weight), magic/recordRootUse → addFsrsCard (3 words max), form unlock thresholds

**Modified:**
- `src/store/store.js` - Added rootFsrsSyncMiddleware to Redux middleware chain (after storageQuotaMiddleware)
- `src/game/systems/battle/BattleStateMachine.js` - Added MAGIC_CAST state, RootMagicManager instance, _handleMagicCast method, magic resolution in _resolveAction, resetBattleState calls
- `src/game/systems/DialogueEngine.js` - Added discoverRoot and recordAffinityChoice imports, _affinityWasLocked tracker, discover_root and affinity_choice effect handlers

## Decisions Made

**Damage Calculation:**
- Base damage = spell tier powerMult * 20 (Form I = 1.0 * 20 = 20 base)
- Mastery multiplier = 1.0 + (root level * 0.1) — Level 1 = 1.1x, Level 10 = 2.0x
- Affinity multiplier = 2.0 if primary, 1.5 if secondary, 1.0 otherwise
- Grammar multiplier = 1.2 if accuracy ≥0.95, 1.0 if ≥0.7, 0.5 otherwise
- Final damage = Math.floor(base * mastery * affinity * grammar), minimum 1

**FSRS Sync Weights:**
- In-game spell casting: accuracy * 0.7 = 0.665 effective for 0.95 accuracy → ~10 XP (good tier)
- FSRS review: (rating-based accuracy) * 0.3 = 0.24 effective for rating 3 → ~5 XP (partial tier)
- Net contribution: ~70% from in-game casting, ~30% from FSRS reviews

**Root Level-Up FSRS Suggestions:**
- Limit to 3 derived words per level-up to avoid flooding review queue
- Only suggest words not already in fsrsCards (filter before dispatching addFsrsCard)
- Source tagged as 'root_mastery_unlock' for tracking

**Form Unlock Thresholds:**
- Level 3 → Form II (intensive)
- Level 5 → Form III (causative)
- Level 7 → Form IV (transitive)
- Level 9 → Form V (reflexive)
- Emit MAGIC_FORM_UNLOCKED event for UI feedback

**Battle Integration:**
- MAGIC_CAST state between ACTION_SELECT and INPUT_PHASE
- handleAction(action, target, slot) — magic requires slot parameter
- _handleMagicCast gets random word from spell's root via getRootWords (simplified word lookup)
- _resolveAction delegates to magicManager.castSpell with 800ms VFX delay
- All existing states (attack, defend, item, flee) unchanged

**Dialogue Integration:**
- discover_root effect: dispatch discoverRoot, emit MAGIC_ROOT_DISCOVERED, show notification
- affinity_choice effect: dispatch recordAffinityChoice, check for lock, emit MAGIC_AFFINITY_LOCKED once
- _affinityWasLocked flag prevents duplicate MAGIC_AFFINITY_LOCKED events in same session

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 03 (React UI):**
- RootMagicManager exports castSpell method callable from BattleStateMachine
- AffinityTracker exports static analysis methods for React components
- rootFsrsSyncMiddleware wired into Redux store (automatic bidirectional sync)
- BattleStateMachine MAGIC_CAST state emits BATTLE_PROMPT_WORD event for React
- DialogueEngine handles discover_root and affinity_choice effects from npcs.json
- All MAGIC_* EventBus constants available for React listeners

**Verification:**
- ✓ `npx vite build` succeeds (index bundle 525.67 KB, under warning threshold)
- ✓ MAGIC_CAST state exists in BattleStateMachine STATES object
- ✓ discover_root and affinity_choice cases exist in DialogueEngine executeEffects
- ✓ rootFsrsSyncMiddleware wired into store.js middleware chain (line 110)
- ✓ RootMagicManager instantiated in BattleStateMachine constructor
- ✓ resetBattleState called on victory, defeat, and destroy

**Blockers:** None.

---
*Phase: 28-root-magic-elemental-affinity*
*Completed: 2026-02-12*

## Self-Check: PASSED

All created files exist on disk:
- ✓ src/game/systems/magic/RootMagicManager.js
- ✓ src/game/systems/magic/AffinityTracker.js
- ✓ src/store/middleware/rootFsrsSyncMiddleware.js

All commits exist in git log:
- ✓ da7217e (Task 1: RootMagicManager, AffinityTracker, rootFsrsSyncMiddleware)
- ✓ 0cb687f (Task 2: BattleStateMachine and DialogueEngine integration)
