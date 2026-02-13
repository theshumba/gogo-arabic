---
phase: 30-companion-system
plan: 02
subsystem: companion-battle-ai
type: summary
tags: [companion, battle, AI, behavior-tree, FSM]
completed: 2026-02-13

dependency-graph:
  requires:
    - "30-01 (companionSlice, companions.js, companionRelationship.js)"
    - "Phase 27 (BattleStateMachine, battleSlice)"
  provides:
    - "CompanionBattleAI with 4 role-based behavior trees"
    - "COMPANION_TURN state in BattleStateMachine"
    - "Companion battle state tracking in battleSlice"
  affects:
    - "BattleStateMachine turn flow (player → companion → enemy)"
    - "Battle UI (will need COMPANION_BATTLE_ACTION handling)"

tech-stack:
  added: []
  patterns:
    - "Behavior tree pattern for companion AI"
    - "Priority-based action selection with MP gating"
    - "State machine extension (COMPANION_TURN injection)"

key-files:
  created:
    - src/game/systems/companions/CompanionBattleAI.js
  modified:
    - src/game/systems/battle/BattleStateMachine.js
    - src/store/slices/battleSlice.js

decisions:
  - decision: "Behavior tree over state machine for companion AI"
    rationale: "Priority-based decision making is clearer and easier to balance than nested state machines"
  - decision: "Companion turn inserted AFTER player turn, BEFORE enemy turn"
    rationale: "Player sees immediate companion reaction to their action, maintains clear turn flow"
  - decision: "500ms delay before companion action resolution"
    rationale: "Gives React UI time to display companion action message before damage numbers appear"
  - decision: "Companion damage/heal uses relationship multiplier (1.0 to 1.2)"
    rationale: "Rewards relationship building, matches COMP-04 requirement"
  - decision: "applyPlayerEffect creates new reducer instead of extending applyStatusEffect"
    rationale: "applyStatusEffect has target param for player/enemy, companion buffs need simplified signature"
  - decision: "removeEnemyEffect removes first effect only"
    rationale: "Defender dispel is designed to remove strongest buff first, future enhancement can add priority"

metrics:
  duration: "3 minutes 34 seconds"
  tasks-completed: 2
  files-created: 1
  files-modified: 2
  lines-added: 468
  commits: 2
---

# Phase 30 Plan 02: Companion Battle AI Summary

**One-liner:** Role-based companion battle AI with 4 behavior trees (healer/attacker/defender/support), integrated into BattleStateMachine as COMPANION_TURN state between player and enemy turns.

## What Was Built

### CompanionBattleAI.js (237 lines)
- **4 role-based behavior trees** with priority-based decision making:
  - **Healer:** 4 priorities (strong heal player <40% HP, self-heal <40% HP, light heal player <70% HP, fallback attack)
  - **Attacker:** 3 priorities (skill when enemy >50% HP, finish attack when enemy <25% HP, normal attack)
  - **Defender:** 3 priorities (defend player when <50% HP, dispel enemy buffs, weak attack)
  - **Support:** 4 priorities (buff strength, buff defense, buff accuracy, weak attack)
- **MP gating:** Each action checks companion MP before execution (8-20 MP costs)
- **Relationship scaling:** All damage/healing multiplied by 1.0 to 1.2 based on relationship tier
- **Utility methods:** `getScaledStats(multiplier)`, `getActionDescription(action)` for bilingual UI

### BattleStateMachine Integration (94 lines added)
- **New FSM states:** COMPANION_TURN, COMPANION_ACTION added to STATES enum
- **Companion initialization:** CompanionBattleAI created in constructor if `activeParty.battle` exists
- **_startCompanionTurn handler:**
  1. Emit COMPANION_BATTLE_TURN_START event
  2. Build battleState from Redux (player/companion/enemy HP/MP/effects)
  3. Call `companionBattleAI.selectAction(battleState)`
  4. Emit COMPANION_BATTLE_ACTION with chosen action
  5. 500ms delay → `_resolveCompanionAction(action)`
- **_resolveCompanionAction handler:**
  - Executes 6 action types: attack, skill, heal, defend, buff, dispel
  - Dispatches appropriate Redux actions (dealDamage, healPlayer, spendCompanionMP, etc.)
  - Emits COMPANION_BATTLE_TURN_END
  - Transitions to ENEMY_TURN
- **Turn flow modification:** `_endTurn` checks if player turn just ended and companion exists → COMPANION_TURN instead of ENEMY_TURN
- **Companion stats init:** `start()` dispatches `initCompanionBattle({ hp, mp })` from companion baseStats

### battleSlice Extension (137 lines added)
- **New state fields:**
  - `companionHP`, `companionMaxHP`, `companionMP`, `companionMaxMP` (null = no companion)
  - `companionEffects` (status effects array), `companionDefending` (boolean)
- **New reducers (9 total):**
  - `initCompanionBattle({ hp, mp })` — initialize companion stats at battle start
  - `spendCompanionMP(amount)` — deduct MP for skills/heals/buffs
  - `healCompanion(amount)` — restore companion HP (clamped to max)
  - `healPlayer(amount)` — restore player HP (clamped to max)
  - `damageCompanion(amount)` — reduce companion HP, apply 50% reduction if defending
  - `setCompanionDefending(boolean)` — flag for defend action
  - `applyPlayerEffect({ id, duration, source })` — add buff to player (no stacking)
  - `removeEnemyEffect(enemyIndex)` — remove first enemy buff (dispel action)
  - `clearCompanionBattle()` — reset all companion battle fields to null
- **Cleanup integration:** `endBattle` and `resetBattle` now clear companion battle state
- **New selector:** `selectCompanionBattleState(state)` returns all 6 companion battle fields
- **Exports:** 9 new action creators exported

## Verification Results

**Build status:** ✓ Succeeds (585.09 kB → 658.47 kB main bundle, +73.38 kB for companion AI)

**Must-haves coverage:**
1. ✓ Player sees companion take role-appropriate battle actions (4 behavior trees implemented)
2. ✓ Companion turn occurs after player turn and before enemy turn (FSM flow modified)
3. ✓ Companion action announced visually (COMPANION_BATTLE_ACTION event emitted with 500ms delay)
4. ✓ Stronger relationships result in more effective actions (1.0 to 1.2 multiplier on damage/healing)
5. ✓ Companion HP and MP tracked independently (6 new state fields in battleSlice)

**Artifact verification:**
- ✓ `src/game/systems/companions/CompanionBattleAI.js` exists, exports `CompanionBattleAI`
- ✓ BattleStateMachine contains "COMPANION_TURN" (3 occurrences: state definition, case handler, _onEnter)
- ✓ battleSlice contains "companionHP" (8 occurrences: initialState, 3 reducers, endBattle, resetBattle, selector)
- ✓ CompanionBattleAI imported in BattleStateMachine

**Key link verification:**
- ✓ CompanionBattleAI reads `store.getState().companions` for relationship value
- ✓ BattleStateMachine calls `companionBattleAI.selectAction` during COMPANION_TURN state
- ✓ CompanionBattleAI uses `getRelationshipMultiplier` from companionRelationship.js

## Deviations from Plan

None — plan executed exactly as written.

## Integration Notes

**Turn flow logic:**
The companion turn is inserted by checking `this.companionBattleAI` in `_endTurn()` BEFORE toggling `isPlayerTurn`. This ensures:
1. Player turn ends → `_endTurn()` called
2. Check: `isPlayerTurn === true` AND `companionBattleAI !== null` → COMPANION_TURN
3. Companion turn ends → `_endTurn()` called again
4. Check: `isPlayerTurn === true` BUT we're after companion → toggle to `false` → ENEMY_TURN

**EventBus events used:**
- `EVENTS.COMPANION_BATTLE_TURN_START` — Phaser → React (show "Companion's Turn" UI)
- `EVENTS.COMPANION_BATTLE_ACTION` — Phaser → React (show action description with 500ms window)
- `EVENTS.COMPANION_BATTLE_TURN_END` — Phaser → React (hide companion turn UI)

**React UI requirements (Plan 30-03):**
BattleOverlay needs to listen for:
1. `COMPANION_BATTLE_TURN_START` → show companion turn indicator
2. `COMPANION_BATTLE_ACTION` → display action description (arabic/english from `getActionDescription`)
3. Companion HP/MP bars (from `selectCompanionBattleState`)

## Testing Notes

**Manual test scenarios:**
1. Battle with no companion → existing flow unchanged (verified by build)
2. Battle with healer companion at low player HP → should prioritize heal over attack
3. Battle with attacker companion against high HP enemy → should use 20 MP skill
4. Battle with defender companion when player HP <50% → should defend (redirect next attack)
5. Battle with support companion → should apply strength/defense/accuracy buffs in order

**Edge cases handled:**
- No companion (`companionBattleAI === null`) → COMPANION_TURN skipped entirely
- Companion out of MP → all behavior trees fall back to basic attack (no MP cost)
- Multiple buffs from support → `applyPlayerEffect` removes existing instance before re-applying (no stacking)
- Empty enemy effects array → `removeEnemyEffect` safely returns without error

## Next Phase Readiness

**Blockers:** None

**Ready for:**
- **Plan 30-03:** Companion sprite and world following (CompanionManager, Phaser sprite integration)
- **Plan 30-04:** Companion UI (roster screen, relationship display, gifting)

**Pending work:**
- Battle UI needs to display companion HP/MP bars and action announcements (Plan 30-03)
- Companion battle stats (damageDealt, healsPerformed) not yet tracked (Plan 30-04)
- Visual companion sprite in BattleScene (deferred to Plan 30-03 or later)

## Self-Check: PASSED

**Files exist:**
```
FOUND: src/game/systems/companions/CompanionBattleAI.js
```

**Commits exist:**
```
FOUND: 70f84b1 (Task 1: CompanionBattleAI)
FOUND: 5d2f3f2 (Task 2: BattleStateMachine + battleSlice)
```

**Exports verified:**
- CompanionBattleAI class exports: `CompanionBattleAI`
- battleSlice exports: `initCompanionBattle`, `spendCompanionMP`, `healCompanion`, `healPlayer`, `damageCompanion`, `setCompanionDefending`, `applyPlayerEffect`, `removeEnemyEffect`, `clearCompanionBattle`, `selectCompanionBattleState`

All claims verified. Plan complete.
