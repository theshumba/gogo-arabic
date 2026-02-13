---
phase: 30-companion-system
plan: 03
subsystem: companions-phaser-integration
tags: [companion-sprite, companion-manager, dialogue-wrapper, context-triggers]
dependency_graph:
  requires: [30-01-companion-data]
  provides: [companion-world-follow, companion-dialogue-context, companion-recruitment]
  affects: [world-scene, dialogue-engine, narrative-slice]
tech_stack:
  added: []
  patterns: [composition-over-inheritance, lazy-pathfinding, cooldown-system]
key_files:
  created:
    - src/game/sprites/Companion.js
    - src/game/systems/companions/CompanionManager.js
    - src/game/systems/companions/CompanionContext.js
    - src/game/systems/companions/CompanionDialogueManager.js
  modified:
    - src/game/scenes/WorldScene.js
    - src/game/systems/DialogueEngine.js
    - src/store/slices/narrativeSlice.js
decisions:
  - Companion extends NPC (inheritance) but hides interaction hints (companions follow, not interacted with)
  - Lazy pathfinding: 200ms update interval to reduce frame overhead
  - Teleport at 500px distance to handle zone transitions without pathfinding lag
  - CompanionDialogueManager uses composition, not modification of DialogueEngine
  - _estimateCEFR duplicated in CompanionDialogueManager and CompanionContext (intentional decoupling)
  - DialogueEngine.executeEffects() made async to support recruit_companion dynamic import
  - narrativeSlice companion relationship uses companion_ prefix check (0-100 for companions, 0-5 for NPCs)
metrics:
  duration: 4 minutes
  tasks_completed: 2
  files_created: 4
  files_modified: 3
  commits: 2
  lines_added: 486
  lines_removed: 5
  completed_date: 2026-02-13
---

# Phase 30 Plan 03: Companion Phaser Integration Summary

**One-liner:** Companion sprite with lazy pathfinding following player, CompanionManager lifecycle integration, and context-aware dialogue wrapper.

## What Was Built

### Task 1: Companion Sprite and CompanionManager
- **Companion.js** extends NPC with:
  - Lazy pathfinding: recalculates every 200ms (not every frame)
  - 4-directional walk animations (up/down/left/right) using standard 4x4 spritesheet
  - 80px follow distance with sweet spot logic (moves if >112px, stops if <80px)
  - Teleport at 500px+ distance for zone transitions
  - Hidden interaction hints (companions follow, don't get interacted with)
  - Name label colored with companion's primary palette color
- **CompanionManager.js**:
  - Spawns/despawns exploration companion based on activeParty.exploration
  - Listens to COMPANION_PARTY_CHANGED event for real-time updates
  - Graceful texture fallback to 'npc-default' if companion sprite not loaded
  - Renders companion at player.depth - 1 (behind player)
  - Calls CompanionContext.evaluateTriggers() every frame (cooldown inside)
- **CompanionContext.js**:
  - Zone change trigger: emits COMPANION_CONTEXTUAL_COMMENT on zone enter
  - 10-second cooldown between comments (prevents spam)
  - Shown comments tracking (Set) to avoid repeating same comment
  - CEFR estimation from vocabulary count for dialogue scaling
  - Battle comment support via emitBattleComment() method
- **WorldScene.js** integration:
  - companionManager instantiated in create() after PlayerController
  - update() calls companionManager.update(time, delta)
  - shutdown() destroys companionManager before equipmentManager

### Task 2: CompanionDialogueManager and DialogueEngine Modification
- **CompanionDialogueManager.js**:
  - getTopics() returns 5 category types: greeting, zone, teaching, personal, gift
  - Relationship-gated personal topic (Friend+ tiers only)
  - getDialogueForTopic() scales complexity via scaleDialogueComplexity()
  - CEFR estimation: A1 (0-100), A2 (101-500), B1 (501-1500), B2 (1501-3000), C1 (3001-5000), C2 (5001+)
  - No scene dependency (pure data manager)
- **DialogueEngine.js**:
  - Added recruit_companion effect type
  - Dynamic import of recruitCompanion action to avoid circular dependency
  - executeEffects() made async (changed forEach to for...of loop)
  - Emits COMPANION_RECRUITED event on recruitment
- **narrativeSlice.js**:
  - setNpcRelationship: clamps to 100 for companion_ prefixed IDs, 5 for NPCs
  - incrementNpcRelationship: same 0-100 vs 0-5 logic
  - Backward compatible (existing NPC relationships unchanged)

## Deviations from Plan

None - plan executed exactly as written.

## Integration Points

### With Phase 30 Plan 01 (Companion Data)
- Uses COMPANIONS data for spawn config (spriteKey, colorPalette, teachingSpecialty)
- Uses COMPANION_DIALOGUE via getDialogueForContext, getTeachingDialogue, getZoneDialogue
- Reads companionSlice activeParty.exploration for spawn trigger
- Uses scaleDialogueComplexity and getRelationshipTier utilities

### With Phase 30 Plan 02 (Companion Battle AI)
- CompanionContext.emitBattleComment() will be called after battle ends
- Battle companion slot separate from exploration (only 1 sprite at a time)

### With Existing Systems
- Companion extends NPC (inherits idle animations, name label, physics body)
- WorldScene lifecycle follows same pattern as equipmentManager
- DialogueEngine recruit_companion effect integrates with quest system
- narrativeSlice relationship tracking supports both NPCs and companions

## Must-Have Verification

**Truths:**
- ✅ Companion sprite extends NPC with lazy pathfinding (200ms update interval)
- ✅ CompanionManager spawns/despawns active exploration companion
- ✅ CompanionManager instantiated in WorldScene.create(), updated in update(), destroyed in shutdown
- ✅ CompanionDialogueManager wraps DialogueEngine with context-aware topic injection (composition)
- ✅ CompanionContext evaluates zone/object/battle triggers with 10-second cooldown
- ✅ DialogueEngine supports recruit_companion effect type
- ✅ narrativeSlice allows 0-100 relationship scale for companion IDs (0-5 for NPCs)

**Artifacts:**
- ✅ src/game/sprites/Companion.js exports Companion class
- ✅ src/game/systems/companions/CompanionManager.js exports CompanionManager class
- ✅ src/game/systems/companions/CompanionDialogueManager.js exports CompanionDialogueManager class
- ✅ src/game/systems/companions/CompanionContext.js exports CompanionContext class

**Key Links:**
- ✅ Companion extends NPC via `class Companion extends NPC`
- ✅ CompanionManager creates Companion instances via `new Companion()`
- ✅ CompanionDialogueManager wraps DialogueEngine (composition, not inheritance)
- ✅ CompanionContext looks up COMPANION_DIALOGUE via getDialogueForContext
- ✅ WorldScene instantiates CompanionManager via `this.companionManager = new CompanionManager(this)`

## Known Issues

None.

## Next Steps

**Phase 30 Plan 04:** Companion UI (roster, party management, relationship display)
**Phase 30 Plan 05:** Test suite for companion system (integration tests for all 5 plans)

## Self-Check: PASSED

**File existence:**
```
✅ FOUND: src/game/sprites/Companion.js
✅ FOUND: src/game/systems/companions/CompanionManager.js
✅ FOUND: src/game/systems/companions/CompanionContext.js
✅ FOUND: src/game/systems/companions/CompanionDialogueManager.js
```

**Commits:**
```
✅ FOUND: 991d470 (Task 1: Companion sprite and CompanionManager)
✅ FOUND: 3969bac (Task 2: CompanionDialogueManager and recruit_companion)
```

**Integration:**
```
✅ WorldScene.js imports CompanionManager
✅ WorldScene.js instantiates companionManager in create()
✅ WorldScene.js calls companionManager.update() in update()
✅ WorldScene.js destroys companionManager in shutdown()
✅ DialogueEngine.js has recruit_companion case in executeEffects
✅ narrativeSlice.js has isCompanion check in setNpcRelationship
✅ narrativeSlice.js has isCompanion check in incrementNpcRelationship
```

---

**Completed:** 2026-02-13 at 00:10:13 UTC
**Duration:** 4 minutes (00:06:33 to 00:10:13)
**Task commits:** 991d470, 3969bac
