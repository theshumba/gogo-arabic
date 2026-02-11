---
phase: 20
plan: 01
subsystem: dialogue
tags: [dialogue-engine, schema, conditions, effects, hub-and-spoke, phaser-system]
requires: [narrativeSlice, questSlice, uiSlice, eventBusTypes, dialogueSchema]
provides: [DialogueEngine, extended-dialogueSchema, dialogue-EVENTS]
affects: [npcs.json-validation, dialogue-system-foundation]
tech_stack:
  added: []
  patterns: [condition-evaluation, effect-execution, hub-and-spoke-trees, phaser-system-pattern]
key_files:
  created:
    - src/game/systems/DialogueEngine.js
    - src/game/systems/__tests__/DialogueEngine.test.js
  modified:
    - src/data/dialogueSchema.js
    - src/utils/eventBusTypes.js
key_decisions:
  - decision: "Extended dialogueSchema with all new fields optional for backward compatibility"
    rationale: "Existing npcs.json validates without modification, allows incremental adoption"
  - decision: "DialogueEngine reads state via store.getState(), mutates via store.dispatch()"
    rationale: "Follows NPCManager/SceneStackManager pattern — Phaser systems can't use React hooks"
  - decision: "Condition evaluation uses AND-combination for multiple conditions"
    rationale: "All conditions must pass — provides clear, predictable logic"
  - decision: "teach_word and give_item effects emit events rather than directly mutating state"
    rationale: "React components handle FSRS card creation; inventory system not yet implemented (Phase 25+)"
  - decision: "relationship_change emits DIALOGUE_RELATIONSHIP_CHANGED for UI feedback"
    rationale: "Enables real-time UI updates (e.g., heart animation) during conversation"
duration: 4m 32s
started: 2026-02-11T01:12:14Z
completed: 2026-02-11T01:16:46Z
---

# Phase 20 Plan 01: DialogueEngine Core + Schema

**One-liner:** DialogueEngine Phaser system evaluates conditions against Redux state, executes 9 effect types, filters hub-and-spoke topics, and powers dynamic NPC conversations with extended Zod schema validation.

## Performance

- **Duration:** 4 minutes 32 seconds
- **Start:** 2026-02-11 01:12:14 UTC
- **End:** 2026-02-11 01:16:46 UTC
- **Tasks:** 2/2 completed
- **Files:** 2 created, 2 modified (4 total)
- **Test coverage:** 28 new tests (all passing)
- **Build:** Passes, 280.85 kB main bundle (well under 500KB limit)

## Accomplishments

### Task 1: Extended dialogueSchema.js + Added EVENTS constants

Extended Zod schema to validate hub-and-spoke dialogue data with conditions, effects, and personality:

**New schemas added:**
1. `conditionSchema` — validates when dialogue lines/choices are visible
   - `quest`: check quest status (active, completed, not_started)
   - `storyFlag`: check story flag key/value
   - `relationship`: check NPC relationship level (min/max range)
   - `vocabulary`: check if player has learned a word
   - `not`: recursive negation for complex logic
2. `effectSchema` — validates what happens after dialogue choices
   - 9 effect types: quest_start, quest_complete, relationship_change, story_flag, teach_word, give_item, unlock_area, change_npc_state, open_shop
3. `personalitySchema` — NPC personality traits (tone, catchphrase, interests, mood)
4. `inlineVocabSchema` — highlighted vocabulary words in dialogue

**Extended existing schemas:**
- `dialogueLineSchema`: added `condition`, `effects`, `inlineVocab` fields
- `dialogueLineSchema.choices[]`: added `condition`, `effects`, `topic` fields
- `dialogueTreeSchema`: added `topic`, `condition`, `returnToHub`, `priority` fields
- `npcSchema`: added `personality`, `zone`, `topics` fields

**All new fields optional** — existing npcs.json validates without modification.

**Added 5 dialogue lifecycle EVENTS:**
- `DIALOGUE_TOPIC_SELECTED` — player selected a topic from hub menu
- `DIALOGUE_EFFECT_EXECUTED` — dialogue effect executed (for UI feedback)
- `DIALOGUE_QUIZ_REQUESTED` — request mid-dialogue quiz
- `DIALOGUE_ENDED` — dialogue conversation ended normally
- `DIALOGUE_RELATIONSHIP_CHANGED` — relationship changed during dialogue

### Task 2: Created DialogueEngine Phaser system + unit tests

Created DialogueEngine as a Phaser system following NPCManager/SceneStackManager pattern:

**Core methods:**
1. `evaluateCondition(condition)` — returns boolean based on Redux state
   - Checks quest status, story flags, relationship levels, vocabulary mastery
   - Supports recursive `not` negation
   - AND-combines multiple conditions
2. `getAvailableTopics(npc)` — filters dialogue trees by condition, sorts by priority
   - Returns hub-and-spoke topic menu
3. `getFilteredChoices(choices)` — removes choices that fail condition check
4. `executeEffects(effects, npcId)` — executes 9 effect types
   - Dispatches Redux actions for quest changes, relationship changes, story flags
   - Emits events for teach_word, give_item, unlock_area, change_npc_state, open_shop
   - Emits DIALOGUE_RELATIONSHIP_CHANGED for UI feedback
5. `recordPlayerChoice(npcId, choiceId)` — logs choice to narrativeSlice
6. `shouldReturnToHub(tree)` — checks if tree returns to topic menu after completion
7. `destroy()` — cleanup method

**Unit tests:** 28 tests covering:
- Condition evaluation (quest, story flag, relationship, vocabulary, NOT, AND-combination)
- Topic filtering and priority sorting
- Choice filtering
- All 9 effect types
- Player choice recording
- Hub return logic

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 07fc26d | Extended dialogue schema with conditions/effects and added lifecycle EVENTS |
| 2 | 1933ba9 | Created DialogueEngine Phaser system with condition evaluation and effect execution |

## Files Created

- `src/game/systems/DialogueEngine.js` (268 lines) — DialogueEngine Phaser system
- `src/game/systems/__tests__/DialogueEngine.test.js` (410 lines) — 28 unit tests

## Files Modified

- `src/data/dialogueSchema.js` — Extended Zod schema for hub-and-spoke dialogue (+75 lines)
- `src/utils/eventBusTypes.js` — Added 5 dialogue lifecycle EVENTS (+6 lines)

## Decisions Made

1. **Backward compatibility:** All new schema fields are optional so existing npcs.json validates without modification. Enables incremental adoption.

2. **Phaser system pattern:** DialogueEngine follows NPCManager/SceneStackManager pattern — constructor takes scene, reads state via `store.getState()`, mutates via `store.dispatch()`. Phaser classes can't use React hooks.

3. **AND-combination for conditions:** All conditions in a condition object must pass (AND logic). Provides clear, predictable logic. For OR logic, use multiple dialogue trees.

4. **Effect delegation:** `teach_word` and `give_item` emit events rather than directly mutating state. React components handle FSRS card creation (useDialogue hook). Inventory system not yet implemented (Phase 25+).

5. **UI feedback events:** `relationship_change` emits `DIALOGUE_RELATIONSHIP_CHANGED` event with `{ npcId, amount, newLevel }` payload. Enables real-time UI updates (e.g., heart animation) during conversation.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

**Phase 20 Plan 01 complete.** DialogueEngine foundation ready.

**Next:** Plan 02 — DialogueOverlay React component (Wave 1, depends on Plan 01).

**Blockers:** None.

**Notes:**
- DialogueEngine is created but not yet integrated into WorldScene (happens in Plan 02)
- Schema validates at build time via existing Vite plugin
- All new EVENTS constants follow namespaced `source:category:action` convention
- Test count increased from 561 to 589 (28 new tests, all passing)
- 3 pre-existing test failures remain (DailyDashboard x2, HUD x1) — no regressions

## Self-Check: PASSED

**Files exist:**
```
FOUND: src/game/systems/DialogueEngine.js
FOUND: src/game/systems/__tests__/DialogueEngine.test.js
FOUND: src/data/dialogueSchema.js
FOUND: src/utils/eventBusTypes.js
```

**Commits exist:**
```
FOUND: 07fc26d
FOUND: 1933ba9
```

**Tests pass:**
```
28/28 DialogueEngine tests pass
586/589 total tests pass (3 pre-existing failures)
```

**Build passes:**
```
✓ Vite build successful
✓ Dialogue schema validation passed
✓ Main bundle: 280.85 kB (under 500KB limit)
```
