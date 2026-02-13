# Phase 30: Companion System - Research

**Researched:** 2026-02-12
**Domain:** AI companion systems, Redux party state management, Phaser follower pathfinding, adaptive Arabic dialogue, battle companion AI
**Confidence:** HIGH

## Summary

Phase 30 adds 12 recruitable companions who follow the player in WorldScene, provide contextual Arabic teaching, and act autonomously in BattleScene. Companions have relationships (0-100), teaching specialties (grammar/vocabulary/pronunciation/culture), battle roles (healer/attacker/defender/support), and unique personalities. This phase builds on existing NPC systems (NPCManager, DialogueEngine, narrativeSlice.npcRelationships) and battle infrastructure (BattleScene, BattleStateMachine, battleSlice).

**Critical architectural decisions:**
1. **CompanionDialogueManager wraps DialogueEngine** (composition, not if/isCompanion branches) — companions reuse existing hub-and-spoke dialogue system with filtered topics based on context
2. **Lazy updates for performance** — only 2 active companions update per frame, inactive companions update every 5 seconds (prevents 12-companion pathfinding from tanking FPS)
3. **Relationship system extends narrativeSlice** — use existing `npcRelationships` for companions (0-5 scale expands to 0-100 via multiplier), no need for separate companionRelationships state
4. **Companion battle AI uses behavior trees** — deterministic priority-based decision making (healer checks party HP → lowest ally → cast heal), not neural networks or complex ML

The existing NPC sprite system (NPC.js with faceless idle animations), DialogueEngine (condition eval, effect execution), and EventBus pattern (EVENTS.NPC_INTERACT) provide strong foundations. Companions are "NPCs with extra steps": they have movement AI, contextual dialogue triggers, and battle participation.

**Primary recommendation:** Build companionSlice with nested persistReducer (IndexedDB) to handle 12 companions × 200 dialogue lines each = ~500KB state. Extend NPC.js → Companion.js subclass with pathfinding. Create CompanionManager (Phaser system) for world following, CompanionBattleAI (decision tree), and CompanionDialogueManager (context-aware wrapper around DialogueEngine).

## Standard Stack

### Core (NO NEW DEPENDENCIES)

All features built with existing v6.0 stack per hard constraint.

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Redux Toolkit | 2.x | companionSlice state management | Already core to app, 16 existing slices |
| redux-persist | 6.x | Nested persistReducer for IndexedDB | Pattern established in Phase 27.1, 28, 29 |
| Phaser 3 | 3.90.0 | Companion sprite rendering, pathfinding | Existing game engine, NPC.js pattern established |
| React 19 | 19.x | CompanionUI React overlay | Existing UI framework, 50+ components |
| Framer Motion | 11.x | Companion recruitment animations | Existing animation library, all overlays use it |

**Installation:** None required (all dependencies already present)

### Supporting Utilities (BUILD, DON'T INSTALL)

| Utility | Purpose | Implementation |
|---------|---------|----------------|
| Companion pathfinding | Follow player with obstacle avoidance | Extend Phaser.Physics.Arcade.Sprite with target tracking |
| Battle AI decision tree | Role-based action selection | `src/game/systems/companions/CompanionBattleAI.js` |
| Context evaluator | Determine when companion should comment | `src/game/systems/companions/CompanionContext.js` |
| Dialogue complexity scaler | Adjust Arabic % based on player CEFR level | `src/utils/dialogueComplexity.js` |
| Relationship tier mapper | Map 0-100 relationship to 5 tiers | `src/utils/companionRelationship.js` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Behavior tree AI | Utility-based AI, GOAP | More dynamic but harder to debug, overkill for 4 battle roles |
| Phaser pathfinding | A* pathfinding library | Phaser's built-in physics sufficient for "follow player" behavior |
| Separate companionRelationships | Extend narrativeSlice.npcRelationships | New slice adds complexity, reuse existing with scale multiplier |
| Real-time contextual comments | Pre-scripted zone/object triggers | Real-time NLP too expensive, static triggers sufficient for 200 lines/companion |

## Architecture Patterns

### Recommended Project Structure

```
src/
├── store/slices/
│   └── companionSlice.js         # NEW: 12 companions, party state, relationships, battle AI state
├── game/
│   ├── sprites/
│   │   └── Companion.js          # NEW: extends NPC.js with pathfinding + contextual dialogue
│   └── systems/
│       └── companions/
│           ├── CompanionManager.js        # NEW: spawn, update, follow player
│           ├── CompanionBattleAI.js       # NEW: behavior tree for battle actions
│           ├── CompanionDialogueManager.js # NEW: wrapper around DialogueEngine
│           └── CompanionContext.js        # NEW: evaluate trigger conditions
├── components/
│   └── Companions/
│       ├── CompanionUI.jsx       # NEW: companion roster overlay
│       ├── CompanionCard.jsx     # NEW: companion portrait + stats
│       ├── PartyPanel.jsx        # NEW: active battle/exploration companion UI
│       └── RelationshipBar.jsx   # NEW: 0-100 relationship progress bar
├── data/
│   ├── companions.js             # NEW: 12 companion definitions (stats, roles, specialties)
│   └── companionDialogue.js      # NEW: 200 contextual lines per companion (2,400 total)
└── utils/
    ├── eventBusTypes.js          # MODIFY: add COMPANION_* events
    ├── dialogueComplexity.js     # NEW: Arabic % scaler
    └── companionRelationship.js  # NEW: relationship tier mapper
```

### Pattern 1: Companion Sprite with Lazy Pathfinding

**What:** Extend NPC.js with follower behavior that updates position only when player moves significantly, with obstacle avoidance using Phaser physics.

**When to use:** Companion follows player in WorldScene (exploration companion slot).

**Example:**
```javascript
// src/game/sprites/Companion.js
import { NPC } from './NPC.js';

export class Companion extends NPC {
  constructor(scene, x, y, config) {
    super(scene, x, y, config);

    this.followTarget = null; // Player sprite
    this.followDistance = 80; // Stay 80px behind
    this.updateInterval = 200; // Update path every 200ms, not every frame
    this.lastUpdateTime = 0;
  }

  setFollowTarget(target) {
    this.followTarget = target;
  }

  update(time, delta) {
    if (!this.followTarget) return;

    // Lazy update: only recalculate path every 200ms
    if (time - this.lastUpdateTime < this.updateInterval) return;
    this.lastUpdateTime = time;

    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.followTarget.x, this.followTarget.y
    );

    // If too far, move toward player
    if (distance > this.followDistance + 32) {
      this.scene.physics.moveToObject(this, this.followTarget, 100);
      this.playWalkAnimation();
    } else {
      // Close enough, stop moving
      this.setVelocity(0, 0);
      this.playIdleAnimation();
    }
  }
}
```

**Why lazy updates?**
- Full pathfinding every frame = 12 companions × 60 FPS = 720 pathfinding calls/sec → FPS tank
- 200ms update interval = 12 companions × 5 Hz = 60 calls/sec → smooth and performant

### Pattern 2: Companion Battle AI — Behavior Tree

**What:** Role-based decision tree where companions select actions based on battle state (ally HP, enemy HP, status effects, MP).

**When to use:** Companion acts autonomously during COMPANION_TURN state in BattleStateMachine.

**Example:**
```javascript
// src/game/systems/companions/CompanionBattleAI.js
export class CompanionBattleAI {
  constructor(companionId, role) {
    this.companionId = companionId;
    this.role = role; // 'healer' | 'attacker' | 'defender' | 'support'
  }

  selectAction(battleState) {
    const { playerHP, playerMaxHP, companionHP, companionMP, enemyHP } = battleState;
    const companionData = store.getState().companions.companions[this.companionId];

    // Role-based behavior tree
    switch (this.role) {
      case 'healer':
        // Priority 1: Heal if ally below 40% HP
        if (playerHP / playerMaxHP < 0.4 && companionMP >= 10) {
          return { action: 'heal', target: 'player', mpCost: 10 };
        }
        // Priority 2: Attack if ally healthy
        return { action: 'attack', target: 0 };

      case 'attacker':
        // Priority 1: Use skill if enemy above 50% HP and enough MP
        if (enemyHP[0] > 50 && companionMP >= 15) {
          return { action: 'skill', target: 0, mpCost: 15 };
        }
        // Priority 2: Basic attack
        return { action: 'attack', target: 0 };

      case 'defender':
        // Priority 1: Defend if player low HP
        if (playerHP / playerMaxHP < 0.5) {
          return { action: 'defend', target: 'player' };
        }
        // Priority 2: Attack
        return { action: 'attack', target: 0 };

      case 'support':
        // Priority 1: Apply buff if no active buffs
        if (!battleState.playerEffects.some(e => e.id === 'strength') && companionMP >= 8) {
          return { action: 'buff', target: 'player', effect: 'strength', mpCost: 8 };
        }
        // Priority 2: Attack
        return { action: 'attack', target: 0 };

      default:
        return { action: 'attack', target: 0 };
    }
  }
}
```

**Why behavior trees over ML/neural networks?**
- Deterministic and debuggable (players can predict companion behavior)
- No training data needed (companions work immediately)
- Lightweight (no runtime model inference)
- Matches existing BattleStateMachine pattern

### Pattern 3: CompanionDialogueManager — Context-Aware Wrapper

**What:** Wraps existing DialogueEngine to inject companion-specific dialogue topics based on world context (zone, nearby objects, recent battles).

**When to use:** Player initiates dialogue with active exploration companion via EVENTS.NPC_INTERACT.

**Example:**
```javascript
// src/game/systems/companions/CompanionDialogueManager.js
import { DialogueEngine } from '../DialogueEngine.js';
import { store } from '../../../store/store.js';
import { EventBus } from '../../../utils/eventBus.js';
import { EVENTS } from '../../../utils/eventBusTypes.js';

export class CompanionDialogueManager {
  constructor(scene) {
    this.scene = scene;
    this.dialogueEngine = new DialogueEngine(scene);
  }

  /**
   * Get available topics for companion, filtered by context
   */
  getCompanionTopics(companionId, context) {
    const companionData = store.getState().companions.companions[companionId];
    const npcData = this._convertCompanionToNPC(companionData);

    // Get base topics from DialogueEngine
    const baseTopics = this.dialogueEngine.getAvailableTopics(npcData);

    // Add contextual topics based on world state
    const contextualTopics = this._getContextualTopics(companionId, context);

    return [...baseTopics, ...contextualTopics]
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Generate contextual dialogue topics based on zone, objects, recent events
   */
  _getContextualTopics(companionId, context) {
    const { zone, nearbyObject, recentBattle } = context;
    const companion = store.getState().companions.companions[companionId];
    const contextTopics = [];

    // Zone-specific comments
    if (zone === 'library' && companion.teachingSpecialty === 'grammar') {
      contextTopics.push({
        treeId: 'contextual_library',
        topic: 'About this library',
        label: 'Can you tell me about this place?',
        priority: 1,
      });
    }

    // Object-specific hints (companion comments on nearby interactables)
    if (nearbyObject === 'ancient_scroll' && companion.teachingSpecialty === 'vocabulary') {
      contextTopics.push({
        treeId: 'contextual_scroll',
        topic: 'Ancient scroll',
        label: 'What does this scroll say?',
        priority: 2,
      });
    }

    // Post-battle review
    if (recentBattle && companion.teachingSpecialty === 'pronunciation') {
      contextTopics.push({
        treeId: 'contextual_battle_review',
        topic: 'Battle review',
        label: 'How did I do in that battle?',
        priority: 3,
      });
    }

    return contextTopics;
  }

  /**
   * Convert companion data to NPC format for DialogueEngine compatibility
   */
  _convertCompanionToNPC(companionData) {
    return {
      id: companionData.id,
      name: companionData.name,
      nameArabic: companionData.nameArabic,
      dialogueTrees: companionData.dialogueTrees || [],
    };
  }
}
```

**Why wrap instead of modify DialogueEngine?**
- DialogueEngine is stable (Phase 20, 874 tests pass) — avoid breaking changes
- Composition > inheritance (DialogueEngine doesn't need companion-specific logic)
- Easy to add/remove contextual triggers without touching core dialogue system

### Pattern 4: Companion Slice with Nested persistReducer (IndexedDB)

**What:** Phase 27.1 established hybrid persistence — heavy slices use IndexedDB via nested persistReducer. Companion state (12 companions × ~40KB each) requires IndexedDB.

**When to use:** companionSlice has large state (dialogue history, AI state, relationship events).

**Example:**
```javascript
// src/store/store.js
import { persistReducer } from 'redux-persist';
import indexedDBStorage from '../services/storage/indexedDBAdapter.js';
import companionReducer from './slices/companionSlice.js';

const companionPersistConfig = {
  key: 'gogo-arabic-companions',
  storage: indexedDBStorage,
  version: 1,
  migrate: async (state) => {
    // Future migration logic if companion schema changes
    return state;
  },
};

const persistedCompanionReducer = persistReducer(companionPersistConfig, companionReducer);

const rootReducer = combineReducers({
  // ... existing slices ...
  companions: persistedCompanionReducer, // IndexedDB (nested)
});
```

**Why IndexedDB, not localStorage?**
- 12 companions × 200 dialogue lines × ~200 bytes = ~480KB companion dialogue alone
- Relationship history, gift tracking, mood events → another ~100KB
- localStorage 5MB limit would be hit with 5K vocabulary expansion + companions
- IndexedDB supports 50MB+ without quota issues

### Pattern 5: Adaptive Arabic Dialogue Complexity

**What:** Companion dialogue difficulty scales with player's CEFR level (A1 = 80% English, C1 = 80% Arabic).

**When to use:** All companion dialogue lines, teaching segments, contextual comments.

**Example:**
```javascript
// src/utils/dialogueComplexity.js
export function scaleDialogueComplexity(dialogueLine, playerCEFRLevel) {
  const { arabic, english, transliteration } = dialogueLine;

  // CEFR level → Arabic percentage mapping
  const arabicRatios = {
    A1: 0.2,  // Beginner: 20% Arabic, 80% English
    A2: 0.4,  // Elementary: 40% Arabic
    B1: 0.6,  // Intermediate: 60% Arabic
    B2: 0.7,  // Upper-intermediate: 70% Arabic
    C1: 0.8,  // Advanced: 80% Arabic
    C2: 0.95, // Mastery: 95% Arabic
  };

  const ratio = arabicRatios[playerCEFRLevel] || 0.5;

  // Blend Arabic and English based on ratio
  // (Simplified — real impl would use word-level mixing)
  if (Math.random() < ratio) {
    return {
      text: arabic,
      secondary: english,
      transliteration,
      language: 'arabic',
    };
  } else {
    return {
      text: english,
      secondary: arabic,
      transliteration,
      language: 'english',
    };
  }
}
```

**Why adaptive dialogue?**
- Beginner players overwhelmed by full Arabic dialogue
- Advanced players bored by constant translations
- Gradual shift mirrors natural language acquisition
- FSRS vocabulary data provides accurate CEFR estimate

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Companion pathfinding | A* pathfinding from scratch | Phaser.Physics.moveToObject() + distance checks | Phaser physics handles obstacle avoidance, collision, velocity |
| Battle AI | Neural network, genetic algorithm | Behavior tree (if/else priority logic) | Deterministic, debuggable, no training data needed |
| Arabic NLP for context | Real-time sentiment analysis | Pre-scripted zone/object triggers | NLP too expensive for real-time, 200 lines/companion = 2,400 scripted lines sufficient |
| Companion animation | Custom animation state machine | Phaser.Anims API + NPC.js idle pattern | Existing NPC animations work for companions |
| Relationship tiers | Complex fuzzy logic | Simple 5-tier thresholds (0-20, 21-40, ...) | Easy to understand, easy to balance |

**Key insight:** Companions are "smart NPCs" not "autonomous agents". Scripted behaviors beat ML complexity for this use case.

## Common Pitfalls

### Pitfall 1: Companion Pathfinding FPS Drop → 12 Companions × 60 FPS = 720 Updates/Sec

**What goes wrong:** Naively updating all 12 companions' pathfinding every frame tanks FPS from 60 → 20-30, especially on lower-end devices.

**Why it happens:**
- Each companion recalculates path to player every frame (60 Hz)
- 12 companions × 60 FPS = 720 pathfinding calls per second
- Even simple Phaser.Physics.moveToObject() × 720/sec causes stutter
- Zone with player + 5 NPCs + 2 active companions + 10 inactive companions = 17 entities updating

**Consequences:**
- Game feels sluggish during exploration
- Mobile devices drop to 20 FPS
- Players disable companions to improve performance
- Bug reports: "companion following is laggy"

**Prevention:**
1. **Lazy update intervals:**
   ```javascript
   // Only update active companions every 200ms
   if (time - lastUpdate < 200) return;

   // Only update inactive companions every 5 seconds
   if (!companion.isActive && time - lastUpdate < 5000) return;
   ```
2. **Stagger updates:**
   ```javascript
   // Update 2 companions per frame, not all 12
   const companionsToUpdate = allCompanions.slice(
     (frameCount % 6) * 2,
     (frameCount % 6) * 2 + 2
   );
   companionsToUpdate.forEach(c => c.update(time, delta));
   ```
3. **Distance culling:**
   ```javascript
   // Don't update companions far offscreen
   const distanceToCamera = Phaser.Math.Distance.Between(
     companion.x, companion.y,
     camera.scrollX + camera.width / 2,
     camera.scrollY + camera.height / 2
   );
   if (distanceToCamera > 1000) return; // Skip distant companions
   ```

**Detection:** Monitor FPS via `game.loop.actualFps`. If below 50 FPS consistently, profile `CompanionManager.update()`.

### Pitfall 2: DialogueEngine Condition Collision → Companion Topics Hide NPC Topics

**What goes wrong:** Adding companion-specific dialogue topics with overlapping conditions (e.g., `relationship >= 3`) hides base NPC topics in DialogueEngine topic list, breaking existing NPC conversations.

**Why it happens:**
- DialogueEngine filters topics by condition, returns first matching set
- Companion dialogue trees added to `npc.dialogueTrees` array
- If companion topic has condition `relationship >= 3` AND base NPC topic has same condition, DialogueEngine might return only one
- No priority tie-breaking logic in existing DialogueEngine

**Consequences:**
- Player recruits companion, NPC's original dialogue disappears
- Quest-critical NPC topics hidden by companion small talk
- Bug reports: "can't start quest with Scholar Yusuf after recruiting Amira"

**Prevention:**
1. **Use priority field for tie-breaking:**
   ```javascript
   // In DialogueEngine.getAvailableTopics():
   const availableTopics = topicTrees
     .filter(tree => this.evaluateCondition(tree.condition))
     .map(tree => ({
       treeId: tree.id,
       topic: tree.topic,
       label: tree.lines[0]?.english || tree.topic,
       priority: tree.priority ?? 99, // Default low priority
     }))
     .sort((a, b) => a.priority - b.priority); // CRITICAL: sort by priority
   ```
2. **Namespace companion topics:**
   ```javascript
   // Companion dialogue trees:
   {
     id: 'companion_amira_zone_comment',
     topic: 'companion:zone_comment', // Prefix with 'companion:'
     condition: { zone: 'library' },
     priority: 10, // Lower priority than quest topics (1-5)
   }
   ```
3. **Filter by NPC type:**
   ```javascript
   // Only include companion topics if NPC is a companion
   const isCompanion = npc.id.startsWith('companion_');
   const topicTrees = isCompanion
     ? npc.dialogueTrees // Include all topics
     : npc.dialogueTrees.filter(t => !t.topic.startsWith('companion:')); // Exclude companion topics
   ```

**Detection:** Test NPC dialogue after companion recruitment. If topics missing, check `DialogueEngine.getAvailableTopics()` return value.

### Pitfall 3: Relationship System Scale Mismatch → narrativeSlice 0-5 vs companionSlice 0-100

**What goes wrong:** Existing `narrativeSlice.npcRelationships` uses 0-5 scale (5 tiers), Phase 30 spec requires 0-100 scale for companions. Using separate `companionRelationships` state duplicates logic, using 0-5 scale loses granularity.

**Why it happens:**
- Phase 20 designed relationship system for 30 NPCs with 5 simple tiers
- Phase 30 companions need 100-point scale for gift system (+5 to +20 per gift)
- Storing 0-100 in existing 0-5 field causes bugs (clamped to 5)
- Creating new `companionRelationships` state duplicates condition logic in DialogueEngine

**Consequences:**
- Companion relationship capped at 5 instead of 100
- Gift bonuses too small (1 point = 20% increase on 0-5 scale)
- DialogueEngine checks `narrativeSlice.npcRelationships`, misses companion data
- Two sources of truth for relationships

**Prevention:**
1. **Use scale multiplier pattern:**
   ```javascript
   // Store companions at 0-100 scale, NPCs at 0-5 scale
   // DialogueEngine handles both:
   export function getRelationshipLevel(npcId, state) {
     const isCompanion = npcId.startsWith('companion_');
     const raw = state.narrative.npcRelationships[npcId] ?? 0;

     // Companions use 0-100 scale, NPCs use 0-5 scale
     return isCompanion ? raw : raw * 20; // Convert NPC 0-5 → 0-100 for unified checks
   }
   ```
2. **Update narrativeSlice clamp logic:**
   ```javascript
   incrementNpcRelationship(state, action) {
     const { npcId, amount = 1 } = action.payload;
     const current = state.npcRelationships[npcId] ?? 0;
     const isCompanion = npcId.startsWith('companion_');
     const maxValue = isCompanion ? 100 : 5; // Different max based on type
     state.npcRelationships[npcId] = Math.max(0, Math.min(maxValue, current + amount));
   }
   ```
3. **Document scale in selector:**
   ```javascript
   /**
    * Get NPC relationship level
    * @returns {number} 0-5 for NPCs, 0-100 for companions
    */
   export const selectNpcRelationship = (npcId) => (state) =>
     state.narrative.npcRelationships[npcId] ?? 0;
   ```

**Detection:** Check relationship value after giving companion gift. If capped at 5 instead of increasing, scale mismatch occurred.

### Pitfall 4: Companion Battle Turn Order Confusion → Player + Companion Turns Overlap

**What goes wrong:** BattleStateMachine transitions player → companion → enemy, but React BattleMenu stays open during companion turn, allowing player to queue actions while companion is acting. Results in action collision or lost inputs.

**Why it happens:**
- BattleStateMachine has states: IDLE → PLAYER_TURN → COMPANION_TURN → ENEMY_TURN → RESOLVE
- BattleMenu (React) opens on PLAYER_TURN, closes on TURN_RESOLVED
- If companion turn is instant, PLAYER_TURN → COMPANION_TURN → TURN_RESOLVED happens in <100ms
- React state update lags behind Phaser FSM state
- EventBus event ordering: BATTLE_STATE_CHANGED (companion_turn) fires before React closes menu

**Consequences:**
- Player sees menu close/reopen rapidly (flicker)
- Clicking "Attack" during companion turn queues action for next player turn (confusing)
- Companion action interrupts player input mid-selection
- Bug reports: "battle UI glitching when companion acts"

**Prevention:**
1. **Explicitly close menu on companion turn:**
   ```javascript
   // In BattleOverlay.jsx:
   useEffect(() => {
     const handleStateChange = ({ newState }) => {
       if (newState === 'COMPANION_TURN') {
         setMenuOpen(false); // Force close
         setInputDisabled(true); // Disable all inputs
       }
       if (newState === 'PLAYER_TURN') {
         setMenuOpen(true);
         setInputDisabled(false);
       }
     };

     EventBus.on(EVENTS.BATTLE_STATE_CHANGED, handleStateChange);
     return () => EventBus.off(EVENTS.BATTLE_STATE_CHANGED, handleStateChange);
   }, []);
   ```
2. **Add companion turn delay:**
   ```javascript
   // In BattleStateMachine.js:
   transitionTo(COMPANION_TURN) {
     // 500ms delay before companion acts (gives React time to close menu)
     this.scene.time.delayedCall(500, () => {
       this.companionBattleAI.selectAction(battleState);
     });
   }
   ```
3. **Visual feedback during companion turn:**
   ```javascript
   // Show "Companion's Turn" overlay while companion acts
   if (battleState === 'COMPANION_TURN') {
     return (
       <div className="companion-turn-overlay">
         <p>{activeCompanion.name}'s Turn</p>
         <CompanionActionAnimation action={companionAction} />
       </div>
     );
   }
   ```

**Detection:** Watch battle flow with console.log() on state changes. If PLAYER_TURN → COMPANION_TURN → PLAYER_TURN happens in <200ms, menu won't have time to close.

### Pitfall 5: Contextual Dialogue Trigger Spam → Companion Comments Every Frame

**What goes wrong:** Companion makes contextual comment every frame when near trigger object (e.g., "Look at that fountain!" × 60 times per second), flooding UI and breaking immersion.

**Why it happens:**
- CompanionContext evaluates triggers every frame in update()
- Trigger condition: `distance < 64 && !comment.shown` is true for 60+ frames
- No cooldown between comments
- EventBus emits COMPANION_DIALOGUE event every frame
- React DialogueOverlay renders each event as a new dialogue box

**Consequences:**
- Dialogue boxes stack on top of each other
- Player can't read text (scrolling too fast)
- Audio SFX plays 60 times (ear-piercing)
- Bug reports: "companion won't shut up"

**Prevention:**
1. **Cooldown timer per trigger:**
   ```javascript
   // src/game/systems/companions/CompanionContext.js
   export class CompanionContext {
     constructor() {
       this.lastCommentTime = 0;
       this.commentCooldown = 10000; // 10 seconds between comments
       this.shownComments = new Set(); // Track shown comment IDs
     }

     evaluateTriggers(companion, player, time) {
       if (time - this.lastCommentTime < this.commentCooldown) return null;

       const nearbyObject = this._getNearbyObject(companion);
       if (!nearbyObject) return null;

       const commentId = `${companion.id}_${nearbyObject.id}`;
       if (this.shownComments.has(commentId)) return null; // Don't repeat

       this.lastCommentTime = time;
       this.shownComments.add(commentId);

       return this._getCommentForObject(companion, nearbyObject);
     }
   }
   ```
2. **Once-per-zone flag:**
   ```javascript
   // Mark contextual comments as "one-time" in data
   const companionDialogue = {
     id: 'zone_library_entrance',
     trigger: 'zone:library',
     oneTime: true, // Only show once per playthrough
     arabic: 'مكتبة جميلة',
     english: 'What a beautiful library',
   };
   ```
3. **Debounce EventBus emission:**
   ```javascript
   // In CompanionManager.update():
   if (shouldEmitComment && time - this.lastEmitTime > 1000) {
     EventBus.emit(EVENTS.COMPANION_CONTEXTUAL_COMMENT, comment);
     this.lastEmitTime = time;
   }
   ```

**Detection:** Enable console logging for EventBus. If COMPANION_CONTEXTUAL_COMMENT fires more than once per second, trigger spam is occurring.

## Code Examples

Verified patterns from existing codebase and Phaser 3 best practices:

### Companion Recruitment via Quest Effect

```javascript
// src/game/systems/DialogueEngine.js (extend with new effect type)
executeEffects(effects, npcId) {
  effects.forEach(effect => {
    // ... existing effect types ...

    case 'recruit_companion': {
      store.dispatch(recruitCompanion(effect.companionId));
      EventBus.emit(EVENTS.COMPANION_RECRUITED, {
        companionId: effect.companionId,
      });
      store.dispatch(showNotification({
        message: `${effect.companionName} joined your party!`,
        type: 'success',
      }));
      break;
    }
  });
}
```

### Companion Active Party Management

```javascript
// src/store/slices/companionSlice.js
setActiveCompanion(state, action) {
  // payload: { slot: 'battle'|'exploration', companionId }
  const { slot, companionId } = action.payload;

  // Validate companion is recruited
  const companion = state.companions[companionId];
  if (!companion || !companion.recruited) {
    console.warn(`[companionSlice] Cannot set unrecruited companion ${companionId}`);
    return;
  }

  // Set active slot
  state.activeParty[slot] = companionId;

  // If setting battle companion, clear exploration companion (max 2 active)
  if (slot === 'battle' && state.activeParty.exploration === companionId) {
    state.activeParty.exploration = null;
  }
  if (slot === 'exploration' && state.activeParty.battle === companionId) {
    state.activeParty.battle = null;
  }
}
```

### Companion Gift System with Relationship Increase

```javascript
// src/store/slices/companionSlice.js
giveGift(state, action) {
  // payload: { companionId, giftId }
  const { companionId, giftId } = action.payload;
  const companion = state.companions[companionId];
  if (!companion) return;

  // Gift quality determines relationship gain
  const giftData = getGiftData(giftId); // From data/gifts.js
  const baseGain = giftData.relationshipGain; // 5-20

  // Preference match bonus (companion likes this gift type)
  const preferenceMatch = companion.preferredGifts?.includes(giftData.category);
  const relationshipGain = preferenceMatch ? baseGain * 1.5 : baseGain;

  // Apply relationship increase
  companion.relationship = Math.min(100, companion.relationship + relationshipGain);
  companion.giftsReceived.push(giftId);
  companion.lastGiftTimestamp = Date.now();

  // Mood increase
  companion.mood = Math.min(100, companion.mood + 10);
}
```

### Companion Contextual Comment Trigger

```javascript
// src/game/systems/companions/CompanionManager.js
checkContextualTriggers(companion, time) {
  const playerZone = store.getState().player.currentZone;
  const playerPos = this.scene.playerController.getPlayer();

  // Zone-based triggers
  if (playerZone === 'library' && companion.teachingSpecialty === 'grammar') {
    const commentId = `${companion.id}_library_entrance`;
    if (!this.shownComments.has(commentId) && time - this.lastCommentTime > 10000) {
      this.shownComments.add(commentId);
      this.lastCommentTime = time;

      EventBus.emit(EVENTS.COMPANION_CONTEXTUAL_COMMENT, {
        companionId: companion.id,
        commentId,
        arabic: 'هذه مكتبة رائعة',
        english: 'This is a wonderful library',
        transliteration: 'hadhihi maktaba ra\'i\'a',
      });
    }
  }

  // Object proximity triggers
  const nearbyObjects = this.scene.interactableManager.getObjectsNear(companion.x, companion.y, 128);
  nearbyObjects.forEach(obj => {
    if (obj.type === 'ancient_scroll' && companion.teachingSpecialty === 'vocabulary') {
      const commentId = `${companion.id}_scroll_${obj.id}`;
      if (!this.shownComments.has(commentId)) {
        this.shownComments.add(commentId);
        EventBus.emit(EVENTS.COMPANION_CONTEXTUAL_COMMENT, {
          companionId: companion.id,
          commentId,
          arabic: 'هذا مخطوط قديم',
          english: 'This is an ancient manuscript',
        });
      }
    }
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| NPC relationship 0-5 scale | Companion relationship 0-100 scale | Phase 30 | More granular gift system, relationship tiers |
| Static NPC dialogue | Contextual companion dialogue based on zone/objects | Phase 30 | Companions feel reactive, not scripted |
| Player-only battles | Player + companion battles | Phase 30 | AI ally makes combat less lonely, teaches strategy |
| NPCs stationary | Companions follow player | Phase 30 | World feels less static, companions feel like party members |
| Dialogue complexity fixed | Adaptive Arabic % based on player CEFR level | Phase 30 | Accessible to beginners, challenging for advanced |

**Deprecated/outdated:**
- **playerSlice.inventory:** Deprecated in Phase 29, use inventorySlice.items
- **narrativeSlice relationship 0-5 clamp for companions:** Still valid but 0-100 scale unlocks more granularity

## Open Questions

1. **Companion sprite rendering order with equipment**
   - What we know: EquipmentManager renders 8 equipment layers on player, companions also have equipment slots
   - What's unclear: Should companions show equipped items visually, or just stat bonuses? If visual, does EquipmentManager handle both player and companion sprites?
   - Recommendation: Phase 30 focuses on companion stats/relationship/dialogue. Visual equipment rendering deferred to Phase 31 (companion equipment expansion) to avoid scope creep. Companions use base sprite only.

2. **Companion idle chatter (companion-to-companion dialogue)**
   - What we know: Phase 30 spec says "no companion idle chatter" is an anti-feature
   - What's unclear: Is "idle chatter" companion-to-companion banter (deferred), or solo contextual comments (in scope)?
   - Recommendation: Solo contextual comments (companion → player) are in scope for Phase 30. Companion-to-companion banter deferred to Phase 47 (NPC expansion, 350+ characters) per EXPANSION-NARRATIVE-SOCIAL.md.

3. **Companion teaching effectiveness tracking**
   - What we know: Each companion has teaching specialty (grammar/vocabulary/pronunciation/culture), affects dialogue content
   - What's unclear: Should we track "words taught by companion X" for analytics? Does companion dialogue auto-add words to FSRS deck?
   - Recommendation: Track teaching source in vocabularySlice (`source: 'companion_amira'`) for analytics. Companion dialogue uses existing `teachWord` effect in DialogueEngine (already auto-adds to FSRS). No new teaching system needed.

4. **Companion swap cooldown**
   - What we know: Player can swap companions at camps/rest points
   - What's unclear: Is there a cooldown (can't swap for 1 hour)? Or unlimited swaps?
   - Recommendation: No cooldown for Phase 30 (keep it simple). If players exploit swapping mid-zone, add 10-minute cooldown in Phase 31 based on player feedback.

5. **Companion level progression**
   - What we know: Companions have `level` field, battle stats scale with level
   - What's unclear: Do companions gain XP alongside player (mirror player level)? Or independent progression?
   - Recommendation: Companions mirror player level (always playerLevel - 2) to avoid balancing nightmare of independent progression. If companion is higher level than player when recruited, they stay at recruitment level until player catches up.

## Sources

### Primary (HIGH confidence)

- **Existing codebase analysis:**
  - `/src/game/systems/NPCManager.js` — NPC spawning, interaction detection, proximity checks
  - `/src/game/systems/DialogueEngine.js` — Hub-and-spoke dialogue, condition evaluation, effect execution
  - `/src/game/sprites/NPC.js` — Faceless sprite rendering, idle animations, quest markers
  - `/src/store/slices/narrativeSlice.js` — Relationship tracking (0-5 scale), story flags, choice history
  - `/src/store/slices/battleSlice.js` — Battle state, turn tracking, status effects
  - `/src/game/scenes/BattleScene.js` — Battle subsystems, EventBus integration, equipment rendering
  - `/src/utils/eventBusTypes.js` — 62 namespaced events, strict naming convention

- **Research documents:**
  - `.planning/research/EXPANSION-COMBAT-RPG.md` — Phase 30 companion system design (28K LOC estimate)
  - `.planning/research/EXPANSION-NARRATIVE-SOCIAL.md` — Companion personality system, dialogue complexity, 200+ lines per companion
  - `.planning/research/ARCHITECTURE-V6-INTEGRATION.md` — companionSlice schema, CompanionBattleAI pattern, integration with existing slices
  - `.planning/research/PITFALLS.md` — Companion pathfinding FPS drop prevention (lazy updates)
  - `.planning/phases/28-root-magic-elemental-affinity/28-RESEARCH.md` — Redux slice pattern, nested persistReducer, EventBus namespacing
  - `.planning/phases/29-equipment-inventory-economy/29-RESEARCH.md` — IndexedDB persistence pattern, vocabulary-locked bonuses, Arabic numeral handling

### Secondary (MEDIUM confidence)

- **Phaser 3 Official Docs:**
  - Phaser.Physics.Arcade.moveToObject() — Built-in pathfinding for follower NPCs
  - Phaser.GameObjects.Sprite.update() — Update loop pattern for custom sprites
  - Phaser.Anims API — Animation state management (idle, walk animations)

- **Redux Toolkit Official Docs:**
  - createSlice() — Immutable state updates with Immer
  - createSelector() — Memoized selectors for computed companion stats
  - persistReducer() — Nested persistence pattern for heavy slices

### Tertiary (LOW confidence)

- **General game dev patterns:**
  - Behavior tree AI for companions (validated against industry standard, not library-specific)
  - Lazy update optimization (common performance pattern in large-entity games)
  - Context-aware dialogue triggers (standard RPG pattern)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All dependencies already present, no new installs
- Architecture: HIGH — Strong existing patterns (NPC.js, DialogueEngine, nested persistReducer)
- Pitfalls: HIGH — Performance issues well-documented in PITFALLS.md, tested in Phase 27-29
- Integration: HIGH — Clear integration points with battleSlice, narrativeSlice, vocabularySlice

**Research date:** 2026-02-12
**Valid until:** 2026-03-14 (30 days — stack is stable, unlikely to change)

**Ready for planning:** All necessary patterns documented, existing systems analyzed, pitfalls identified. Planner can create PLAN.md files.
