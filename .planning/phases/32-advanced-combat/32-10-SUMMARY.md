---
phase: 32-advanced-combat
plan: 10
subsystem: battle-fsm
tags: [battle, fsm, grammar-combo, multi-target, flee-challenge, arabic-capture]
dependency-graph:
  requires: ["32-01", "32-02", "32-03", "32-04", "32-06"]
  provides: ["BattleStateMachine Phase 32 integration", "arabicReview in battleHistory"]
  affects: ["src/game/systems/battle/BattleStateMachine.js", "src/store/slices/battleSlice.js"]
tech-stack:
  added: []
  patterns: ["EventBus async listener pattern for grammar combo/flee/item responses", "Multi-target damage with row modifiers", "Arabic capture on every input path"]
key-files:
  created: []
  modified:
    - src/game/systems/battle/BattleStateMachine.js
    - src/store/slices/battleSlice.js
decisions:
  - "Flee uses Arabic challenge (accuracy >= 0.8) instead of random chance"
  - "Grammar combo listener uses BATTLE_ARABIC_INPUT event for response"
  - "Item use listener uses BATTLE_ITEM_USED event for response"
  - "Flee word selection favors top 30% most familiar words (higher FSRS stability)"
  - "Multi-target applies dealDamageToEnemy with row modifier, plus dealDamage(0, correct: true) for streak tracking"
  - "Compound effect check occurs after tickStatusEffects in _endTurn"
  - "arabicReview (renamed from arabicUsedThisBattle) in battleHistory for PostBattleReview consumption"
metrics:
  duration: "~12 minutes"
  completed: "2026-02-13"
---

# Phase 32 Plan 10: BattleStateMachine FSM Integration Summary

Extended BattleStateMachine with 6 new FSM states, grammar combo detection, Arabic-based flee, item use, compound effects, and arabicUsedThisBattle capture on every Arabic input path.

## What Was Built

### Task 1: BattleStateMachine Phase 32 Extension (91e6613)

**6 new FSM states added:**
- `GRAMMAR_COMBO` - Player entering grammar combo input (noun+adj, verb chain, sentence)
- `TARGET_SELECT` - Player selecting enemy target in multi-enemy battles
- `ITEM_USE` - Player selecting and consuming battle items
- `FLEE_CHALLENGE` - Arabic question flee (replaces random chance)
- `COMPOUND_CHECK` - Compound effect resolution after status tick
- `ARENA_WAVE_TRANSITION` - Between arena waves (handled by ArenaController)

**Constructor changes:**
- Imports and instantiates GrammarComboDetector with grammar.completedLessons from Redux
- Imports CompoundEffectResolver (static utility)
- Imports and conditionally creates MultiTargetManager for multi-enemy parties
- Tracks `_currentBattleWord` for Arabic capture
- Sets up EventBus listener references for cleanup

**Key integration points:**
- `handleAction('combo')` -> GRAMMAR_COMBO state -> GrammarComboDetector validation -> damage with multiplier
- `handleAction('flee')` -> FLEE_CHALLENGE state -> Arabic word challenge -> accuracy >= 0.8 = escape
- `handleAction('item')` -> ITEM_USE state -> EventBus listener -> consume item + apply buff
- `handleArabicInput()` - CRITICAL: dispatches recordArabicUsed on every normal attack
- `_handleGrammarCombo()` - CRITICAL: dispatches recordArabicUsed on every combo attempt
- `_handleFleeChallenge()` - CRITICAL: dispatches recordArabicUsed on every flee attempt
- `_endTurn()` - calls CompoundEffectResolver.checkForCompounds after tickStatusEffects
- `_applyDamage()` - uses dealDamageToEnemy with row modifiers for multi-target battles
- `_checkBattleEnd()` - uses selectAllEnemiesDefeated for multi-target victory check
- `_handleVictory()/_handleDefeat()` - emits BATTLE_POST_REVIEW with arabicUsedThisBattle data
- `_getAvailableActions()` - adds 'combo' if grammar combos available, 'item' if inventory has items
- `destroy()` - cleans up all EventBus listeners to prevent memory leaks

### Task 2: battleSlice arabicReview in battleHistory (a864ce4)

- Renamed `arabicUsedThisBattle` to `arabicReview` in the endBattle history entry
- Enables PostBattleReview to read historical battle data with Arabic review info
- `recordArabicUsed` reducer verified as correctly defined and exported (from 32-04)

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- Build verification: Blocked by tooling permission issue (user should verify with `npx vite build`)
- Test verification: Blocked by tooling permission issue (user should verify with `npx vitest run`)
- Git commits: Both commits created successfully
- Code review: All imports verified against existing exports, all EventBus constants verified against eventBusTypes.js

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 91e6613 | BattleStateMachine Phase 32 extension (6 states, multi-target, combos, flee, items, arabic capture) |
| 2 | a864ce4 | battleSlice arabicReview in battleHistory |

## Self-Check: PENDING

Build and test verification blocked by Bash permission issue. User should run:
```bash
npx vite build
npx vitest run
```
