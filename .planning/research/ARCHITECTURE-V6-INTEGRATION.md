# Architecture Integration: Root Magic, Equipment/Inventory, and Companions

**Project:** GoGo Arabic v6.0 Combat & RPG Systems
**Researched:** 2026-02-12
**Confidence:** HIGH

## Executive Summary

This document defines how root magic, equipment/inventory/economy, and companion systems integrate with GoGo Arabic's existing architecture (Redux slices, EventBus, Phaser systems, React overlays, DialogueEngine). The key integration principles are:

1. **Redux as single source of truth** — all persistent state lives in Redux slices
2. **EventBus for Phaser ↔ React communication** — never cross-contaminate
3. **Phaser systems read Redux directly** — no hooks, use `store.getState()` and `store.dispatch()`
4. **React components use hooks** — `useSelector`, `useDispatch`, custom hooks like `useDialogue`
5. **Combinatorial explosion by design** — every system affects every other system

---

## System Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                         REACT OVERLAY LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┤
│  │ BattleOverlay│  │MagicOverlay  │  │InventoryUI   │  │CompanionUI   │
│  │ (existing)   │  │   (NEW)      │  │   (NEW)      │  │   (NEW)      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┤
│         │                 │                 │                 │         │
│         └─────────────────┴─────────────────┴─────────────────┘         │
│                                  ↕ EventBus                             │
├────────────────────────────────────────────────────────────────────────┤
│                         PHASER SCENE LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┤
│  │ BattleScene  │  │RootMagicMgr  │  │  EquipmentMgr│  │CompanionMgr  │
│  │ (existing)   │  │   (NEW)      │  │   (NEW)      │  │   (NEW)      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┤
│         │                 │                 │                 │         │
│         └─────────────────┴─────────────────┴─────────────────┘         │
│                     ↓ store.getState(), store.dispatch()                │
├────────────────────────────────────────────────────────────────────────┤
│                         REDUX STATE LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┤
│  │ battleSlice  │  │ magicSlice   │  │inventorySlice│  │companionSlice│
│  │ (existing+)  │  │   (NEW)      │  │   (NEW)      │  │   (NEW)      │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ playerSlice  │  │vocabularySlice│ │narrativeSlice│                  │
│  │ (modified)   │  │ (modified)   │  │ (modified)   │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
├────────────────────────────────────────────────────────────────────────┤
│                      MIDDLEWARE & UTILITIES                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┤
│  │achievement   │  │dailyGoals    │  │companionAI   │  │ economyUtils │
│  │Middleware    │  │Middleware    │  │  (NEW)       │  │   (NEW)      │
│  │ (modified)   │  │ (modified)   │  │              │  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┤
└────────────────────────────────────────────────────────────────────────┘
```

---

## New Redux Slices

### 1. `magicSlice.js` (Root Magic System)

**State:**
```javascript
{
  // Root mastery tracking
  rootMastery: {
    'ك-ت-ب': { timesUsed: 12, formsUnlocked: ['I', 'II', 'III'], element: 'knowledge' },
    'ح-ر-ق': { timesUsed: 5, formsUnlocked: ['I'], element: 'fire' },
  },

  // Discovered root families (player must discover roots before using)
  discoveredRoots: ['ك-ت-ب', 'ح-ر-ق', 'ق-ر-أ'],

  // Unlocked spell forms (Form I-X)
  unlockedForms: { I: true, II: true, III: false /* ... */ },

  // Elemental affinity (primary + secondary)
  affinity: {
    primary: 'light',      // 2x spell power
    secondary: 'knowledge', // 1.5x spell power
    discoveryChoices: 14,   // Weighted decision count (50 needed to lock affinity)
  },

  // Active spells (hotbar)
  equippedSpells: [
    { rootId: 'ك-ت-ب', form: 'I', element: 'knowledge', mpCost: 5 },
    { rootId: 'ح-ر-ق', form: 'II', element: 'fire', mpCost: 8 },
    null, null, null, null, // 6 spell slots total
  ],

  // Battle-specific state (cleared after battle)
  activeCombos: [], // Grammar-based combo chains
  lastCastTimestamp: null,
}
```

**Actions:**
```javascript
discoverRoot({ rootId, element })
unlockForm(formNumber) // I-X
recordRootUse({ rootId, form, accuracy })
setAffinity({ type: 'primary'|'secondary', element })
recordAffinityChoice({ choice, weight }) // Dialogue/quest choices
equipSpell({ slot, rootId, form })
clearBattleState() // Called on battle end
```

**Selectors:**
```javascript
selectDiscoveredRoots(state)
selectRootMastery(state, rootId)
selectAffinity(state)
selectEquippedSpells(state)
selectAvailableSpells(state) // Derives from discoveredRoots + unlockedForms + vocabulary
```

**Integration Points:**
- **vocabularySlice:** Root discovery requires knowing words from that root family
- **battleSlice:** MP costs, spell damage calculations
- **narrativeSlice:** Affinity choices tracked via dialogue/quest effects
- **grammarSlice:** Unlocking higher forms (III+) requires grammar lesson completion

---

### 2. `inventorySlice.js` (Equipment & Items)

**State:**
```javascript
{
  // Equipment slots (8 slots + 2 accessories)
  equipped: {
    headCovering: null, // itemId or null
    robe: 'item_123',
    cloak: null,
    belt: 'item_456',
    boots: null,
    gloves: null,
    accessory1: 'item_789',
    accessory2: null,
  },

  // Inventory (max 200 items)
  items: [
    { itemId: 'item_123', quantity: 1, rarity: 'rare', locked: false },
    { itemId: 'item_consumable_potion', quantity: 5, rarity: 'common', locked: false },
  ],

  // Affix vocabulary tracking (locked affixes until word learned)
  affixesUnlocked: ['حاد', 'مبارك', 'سريع'], // Arabic adjectives

  // Currency
  dirhams: 350, // Moved from playerSlice (keep playerSlice.dirhams for backward compat)

  // Shop state
  shopInventories: {
    'shop_oasis_merchant': { lastRestock: timestamp, items: [...] },
  },

  // Crafted item registry (custom Arabic names)
  customNames: {
    'item_custom_sword_001': 'سيف النور', // Player-typed Arabic names
  },
}
```

**Actions:**
```javascript
addItem({ itemId, quantity, rarity, affixes })
removeItem({ itemId, quantity })
equipItem({ slot, itemId })
unequipItem(slot)
unlockAffix(affixWord) // Called when vocabulary learned
lockItem(itemId) // Prevent accidental sale
updateShopInventory({ shopId, items, timestamp })
addCustomName({ itemId, arabicName })
```

**Selectors:**
```javascript
selectInventoryItems(state)
selectEquippedItems(state)
selectItemStats(state, itemId) // Calculates total stats including affixes
selectAvailableAffixes(state, itemId) // Only unlocked affixes
selectDirhams(state)
```

**Integration Points:**
- **vocabularySlice:** Affix activation requires knowing the Arabic word
- **playerSlice:** Equipment affects max HP/MP, stat bonuses
- **battleSlice:** Consumable item usage during battle
- **questSlice:** Quest rewards add items
- **narrativeSlice:** Shop prices affected by NPC relationships

---

### 3. `companionSlice.js` (AI Companions)

**State:**
```javascript
{
  // All companions (recruited + unrecruited)
  companions: {
    'companion_amira': {
      id: 'companion_amira',
      name: 'Amira',
      nameArabic: 'أميرة',
      recruited: true,
      relationship: 45, // 0-100

      // Battle stats
      level: 8,
      hp: 80,
      maxHP: 80,
      mp: 40,
      maxMP: 40,
      battleRole: 'healer',

      // Teaching specialty
      teachingSpecialty: 'grammar',
      teachingDialogues: ['grammar_past_tense', 'grammar_plurals'],

      // Personality
      personality: 'scholarly',
      speechPattern: 'formal',

      // Mood system
      mood: 75, // 0-100, affects dialogue tone and battle performance
      lastGiftTimestamp: null,
      giftsReceived: ['gift_book', 'gift_calligraphy_set'],

      // Quest chain
      personalQuestChain: ['quest_companion_amira_1', 'quest_companion_amira_2'],
      currentQuestStep: 1,
    },
  },

  // Active party (max 2 companions: 1 battle, 1 exploration)
  activeParty: {
    battle: 'companion_amira',
    exploration: null,
  },

  // Companion battle AI state (cleared after battle)
  battleState: {
    'companion_amira': {
      turnsSinceLast: 0,
      priorityTarget: null,
    },
  },

  // Idle dialogue queue (contextual comments)
  idleDialogueQueue: [
    { companionId: 'companion_amira', dialogueId: 'idle_library_entrance', timestamp },
  ],
}
```

**Actions:**
```javascript
recruitCompanion(companionId)
setActiveCompanion({ slot: 'battle'|'exploration', companionId })
incrementRelationship({ companionId, amount })
giveGift({ companionId, giftId })
updateMood({ companionId, delta })
recordCompanionAction({ companionId, actionType }) // Battle or teaching
queueIdleDialogue({ companionId, dialogueId, context })
clearBattleState() // Called on battle end
```

**Selectors:**
```javascript
selectCompanion(state, companionId)
selectActiveCompanions(state) // Returns { battle, exploration }
selectRecruitedCompanions(state)
selectCompanionTeachingDialogues(state, companionId)
selectCompanionBattleStats(state, companionId)
selectCompanionMood(state, companionId)
```

**Integration Points:**
- **battleSlice:** Companion HP/MP, battle AI decisions
- **vocabularySlice:** Companions teach words, adjust to player's weak areas (FSRS)
- **questSlice:** Companion personal quest chains
- **narrativeSlice:** Companion approval/disapproval of player choices
- **dialogueEngine:** Companion-specific dialogue trees

---

## Modified Existing Slices

### `battleSlice.js` (Existing — Additions)

**New State:**
```javascript
{
  // Add to existing state
  activeMagicEffects: [
    { spellId, rootId, element, remainingTurns, potency },
  ],
  companionActions: [
    { companionId, action, target, result },
  ],
  equipmentBonuses: { // Cached from inventorySlice during battle start
    damageBonus: 1.2,
    defenseBonus: 1.1,
    mpRegenBonus: 5,
  },
}
```

**New Actions:**
```javascript
applyMagicEffect({ spellId, rootId, element, duration, potency })
recordCompanionTurn({ companionId, action, target, result })
cacheEquipmentBonuses(bonuses) // Called on battle start
```

---

### `playerSlice.js` (Existing — Modifications)

**Keep for backward compatibility:**
```javascript
dirhams // Keep synced with inventorySlice.dirhams
inventory // Deprecated, migrate to inventorySlice
```

**New State:**
```javascript
{
  // Profession levels (6 professions)
  professions: {
    calligrapher: 0, // 0-10
    cook: 0,
    blacksmith: 0,
    herbalist: 0,
    weaver: 0,
    builder: 0,
  },

  // Crafting unlocks
  knownRecipes: ['recipe_sword_basic', 'recipe_potion_health'],
}
```

---

### `vocabularySlice.js` (Existing — Additions)

**New State:**
```javascript
{
  // Root family mapping (wordId → rootId)
  wordRoots: {
    'word_kataba': 'ك-ت-ب',
    'word_kitab': 'ك-ت-ب',
    'word_maktab': 'ك-ت-ب',
  },

  // Battle-acquired words (tagged for context)
  battleAcquired: ['word_sword', 'word_shield'],
}
```

**New Actions:**
```javascript
tagWordAsBattleAcquired(wordId)
associateWordWithRoot({ wordId, rootId })
```

---

### `narrativeSlice.js` (Existing — Additions)

**New State:**
```javascript
{
  // Companion approval tracking
  companionApprovals: {
    'companion_amira': [
      { choiceId: 'choice_help_scholar', approval: +10, timestamp },
      { choiceId: 'choice_skip_prayer', approval: -5, timestamp },
    ],
  },

  // Affinity discovery choices (for magicSlice)
  affinityChoices: [
    { choiceId: 'choice_library', element: 'knowledge', weight: 5 },
  ],
}
```

**New Actions:**
```javascript
recordCompanionApproval({ companionId, choiceId, delta })
recordAffinityChoice({ choiceId, element, weight })
```

---

## EventBus Integration

### New Events (Add to `eventBusTypes.js`)

```javascript
// ──────────────────────────────────────────────────
// MAGIC — Root magic system events
// ──────────────────────────────────────────────────
/** React → Phaser: player cast a spell */
MAGIC_CAST: 'react:magic:cast',
/** Phaser → React: spell effect animation complete */
MAGIC_EFFECT_COMPLETE: 'phaser:magic:effect-complete',
/** Phaser → React: root discovery triggered (new root unlocked) */
MAGIC_ROOT_DISCOVERED: 'phaser:magic:root-discovered',
/** React → React: open magic spell menu */
MAGIC_MENU_OPEN: 'react:magic:menu-open',

// ──────────────────────────────────────────────────
// INVENTORY — Equipment and items
// ──────────────────────────────────────────────────
/** React → React: open inventory UI */
INVENTORY_OPEN: 'react:inventory:open',
/** React → Redux: equip item to slot */
INVENTORY_EQUIP: 'react:inventory:equip',
/** React → Redux: use consumable item */
INVENTORY_USE_ITEM: 'react:inventory:use-item',
/** Phaser → React: item dropped from loot */
INVENTORY_ITEM_ADDED: 'phaser:inventory:item-added',
/** React → React: shop UI opened */
SHOP_OPENED: 'react:shop:opened',

// ──────────────────────────────────────────────────
// COMPANION — AI companion events
// ──────────────────────────────────────────────────
/** Phaser → React: companion recruited */
COMPANION_RECRUITED: 'phaser:companion:recruited',
/** React → Phaser: set active companion (battle/exploration) */
COMPANION_SET_ACTIVE: 'react:companion:set-active',
/** Phaser → React: companion idle dialogue triggered */
COMPANION_IDLE_DIALOGUE: 'phaser:companion:idle-dialogue',
/** Phaser → React: companion battle action executed */
COMPANION_BATTLE_ACTION: 'phaser:companion:battle-action',
/** React → Redux: give gift to companion */
COMPANION_GIVE_GIFT: 'react:companion:give-gift',
/** React → React: open companion UI */
COMPANION_UI_OPEN: 'react:companion:ui-open',
```

---

## Phaser Systems Integration

### 1. RootMagicManager (NEW Phaser System)

**Location:** `src/game/systems/magic/RootMagicManager.js`

**Responsibilities:**
- Read player's equipped spells from `magicSlice`
- Validate MP cost before spell cast
- Trigger Phaser VFX for spell animations (BattleEffectManager)
- Calculate damage based on root mastery + affinity + grammar accuracy
- Emit `MAGIC_EFFECT_COMPLETE` when animation finishes

**Pattern:** Similar to `BattleStateMachine` — reads Redux, dispatches actions, emits events

**Key Methods:**
```javascript
class RootMagicManager {
  constructor(scene) { /* ... */ }

  // Cast spell (called from BattleScene during player turn)
  castSpell(spellSlot, targetEnemyIndex) {
    const spell = store.getState().magic.equippedSpells[spellSlot];
    const playerMP = store.getState().battle.playerMP;

    if (playerMP < spell.mpCost) {
      EventBus.emit(EVENTS.SHOW_NOTIFICATION, { text: 'Not enough MP!' });
      return false;
    }

    store.dispatch(spendMP(spell.mpCost));
    this.scene.effects.playSpellEffect(spell.element, targetEnemyIndex);

    // Wait for VFX, then calculate damage
    this.scene.time.delayedCall(800, () => {
      const damage = this._calculateSpellDamage(spell);
      store.dispatch(dealDamageToEnemy({ damage }));
      EventBus.emit(EVENTS.MAGIC_EFFECT_COMPLETE);
    });

    return true;
  }

  _calculateSpellDamage(spell) {
    const rootMastery = store.getState().magic.rootMastery[spell.rootId];
    const affinity = store.getState().magic.affinity;
    const grammarAccuracy = 0.95; // TODO: get from input accuracy

    let baseDamage = spell.form === 'I' ? 20 : 30; // Simplified
    let multiplier = 1.0;

    if (affinity.primary === spell.element) multiplier *= 2.0;
    if (affinity.secondary === spell.element) multiplier *= 1.5;
    if (rootMastery?.timesUsed > 10) multiplier *= 1.2;

    return Math.floor(baseDamage * multiplier * grammarAccuracy);
  }
}
```

---

### 2. EquipmentManager (NEW Phaser System)

**Location:** `src/game/systems/equipment/EquipmentManager.js`

**Responsibilities:**
- Read equipped items from `inventorySlice`
- Render equipment sprites on player character (Phaser sprite layers)
- Update sprite when equipment changes (listens to EventBus `INVENTORY_EQUIP`)
- Calculate total stat bonuses (HP/MP/damage/defense)

**Pattern:** Similar to `NPCManager` — spawns/updates sprites, reads Redux

**Key Methods:**
```javascript
class EquipmentManager {
  constructor(scene, playerSprite) {
    this.scene = scene;
    this.playerSprite = playerSprite;
    this.equipmentSprites = {}; // { slot: sprite }

    EventBus.on(EVENTS.INVENTORY_EQUIP, this._onEquipmentChanged.bind(this));
  }

  updatePlayerSprite() {
    const equipped = store.getState().inventory.equipped;

    // Destroy old sprites
    Object.values(this.equipmentSprites).forEach(s => s?.destroy());
    this.equipmentSprites = {};

    // Create new sprites
    if (equipped.robe) {
      this.equipmentSprites.robe = this.scene.add.sprite(
        this.playerSprite.x,
        this.playerSprite.y,
        `equipment_robe_${equipped.robe}`
      ).setDepth(this.playerSprite.depth - 1);
    }

    // ... repeat for all slots
  }

  _onEquipmentChanged() {
    this.updatePlayerSprite();
  }

  calculateBonuses() {
    const equipped = store.getState().inventory.equipped;
    const items = store.getState().inventory.items;

    let bonuses = { hp: 0, mp: 0, damage: 1.0, defense: 1.0 };

    Object.values(equipped).forEach(itemId => {
      if (!itemId) return;
      const item = items.find(i => i.itemId === itemId);
      // TODO: lookup item stats from data file
      bonuses.hp += item?.stats?.hp || 0;
    });

    return bonuses;
  }
}
```

---

### 3. CompanionManager (NEW Phaser System)

**Location:** `src/game/systems/companion/CompanionManager.js`

**Responsibilities:**
- Spawn companion sprites in WorldScene and BattleScene
- Follow player during exploration (pathfinding)
- Execute companion battle AI (calls `CompanionBattleAI.decide()`)
- Trigger idle dialogue based on context (zone entry, object proximity)
- Render companion UI indicators (relationship hearts, speech bubbles)

**Pattern:** Similar to `NPCManager` — manages sprites, reads Redux, emits events

**Key Methods:**
```javascript
class CompanionManager {
  constructor(scene) {
    this.scene = scene;
    this.companionSprites = {}; // { companionId: sprite }
    this.idleDialogueCooldown = 0;
  }

  spawnActiveCompanions() {
    const activeParty = store.getState().companion.activeParty;

    if (activeParty.exploration) {
      this._spawnCompanion(activeParty.exploration, 'exploration');
    }
  }

  _spawnCompanion(companionId, role) {
    const companion = store.getState().companion.companions[companionId];
    const sprite = this.scene.add.sprite(
      this.scene.player.x - 64,
      this.scene.player.y,
      `companion_${companionId}`
    );

    this.companionSprites[companionId] = sprite;
  }

  update(playerSprite) {
    // Follow player (pathfinding logic)
    Object.entries(this.companionSprites).forEach(([id, sprite]) => {
      const dist = Phaser.Math.Distance.Between(
        playerSprite.x, playerSprite.y, sprite.x, sprite.y
      );

      if (dist > 80) {
        // Move towards player
        const angle = Phaser.Math.Angle.Between(
          sprite.x, sprite.y, playerSprite.x, playerSprite.y
        );
        sprite.x += Math.cos(angle) * 2;
        sprite.y += Math.sin(angle) * 2;
      }
    });

    // Idle dialogue triggers
    this._checkIdleDialogue();
  }

  _checkIdleDialogue() {
    if (this.idleDialogueCooldown > 0) {
      this.idleDialogueCooldown--;
      return;
    }

    const activeParty = store.getState().companion.activeParty;
    const currentZone = store.getState().player.currentZone;

    // Context: zone entry
    if (activeParty.exploration && currentZone === 'ancient_library') {
      EventBus.emit(EVENTS.COMPANION_IDLE_DIALOGUE, {
        companionId: activeParty.exploration,
        dialogueId: 'idle_library_entrance',
      });
      this.idleDialogueCooldown = 600; // 10 seconds at 60fps
    }
  }
}
```

---

### 4. CompanionBattleAI (NEW System, similar to EnemyAI)

**Location:** `src/game/systems/battle/CompanionBattleAI.js`

**Responsibilities:**
- Decide companion actions during battle based on role (healer/attacker/support)
- Adapt to battle state (heal when player low HP, attack when safe)
- Learn from player's FSRS data (teach weak words after battle)

**Pattern:** Pure logic class, no Phaser dependency

```javascript
export class CompanionBattleAI {
  constructor(companionData, battleState) {
    this.companion = companionData;
    this.battleState = battleState;
  }

  decide() {
    switch (this.companion.battleRole) {
      case 'healer':
        return this._healerPattern();
      case 'attacker':
        return this._attackerPattern();
      case 'support':
        return this._supportPattern();
      default:
        return this._defaultPattern();
    }
  }

  _healerPattern() {
    const playerHP = this.battleState.playerHP;
    const playerMaxHP = this.battleState.playerMaxHP;

    if (playerHP < playerMaxHP * 0.5) {
      return {
        type: 'heal',
        target: 'player',
        amount: 30,
        intentText: `${this.companion.nameArabic} heals you!`,
      };
    }

    return this._attackerPattern();
  }

  _attackerPattern() {
    return {
      type: 'attack',
      target: 'enemy',
      damage: this.companion.level * 5,
      intentText: `${this.companion.nameArabic} attacks!`,
    };
  }
}
```

---

## React Components Integration

### 1. MagicOverlay (NEW Component)

**Location:** `src/components/Magic/MagicOverlay.jsx`

**Responsibilities:**
- Display spell hotbar (6 equipped spells)
- Show MP cost, root letters, element icon
- Handle spell casting (emit `MAGIC_CAST` event)
- Display root discovery notifications

**Pattern:** Similar to `BattleOverlay` — listens to EventBus, uses `useSelector`

```jsx
export default function MagicOverlay() {
  const equippedSpells = useSelector(state => state.magic.equippedSpells);
  const playerMP = useSelector(state => state.battle.playerMP);

  const handleSpellCast = (slot) => {
    const spell = equippedSpells[slot];
    if (playerMP < spell.mpCost) return;

    EventBus.emit(EVENTS.MAGIC_CAST, { slot });
  };

  return (
    <div className="magic-hotbar">
      {equippedSpells.map((spell, idx) => (
        <SpellButton
          key={idx}
          spell={spell}
          onClick={() => handleSpellCast(idx)}
          disabled={!spell || playerMP < spell.mpCost}
        />
      ))}
    </div>
  );
}
```

---

### 2. InventoryUI (NEW Component)

**Location:** `src/components/Inventory/InventoryUI.jsx`

**Responsibilities:**
- Grid-based inventory display (200 item max)
- Equipment slots with drag-and-drop
- Item comparison tooltip
- Sort by rarity/type/Arabic alphabetical

**Pattern:** Full-screen overlay, similar to WorldMap

```jsx
export default function InventoryUI() {
  const items = useSelector(state => state.inventory.items);
  const equipped = useSelector(state => state.inventory.equipped);
  const dispatch = useDispatch();

  const handleEquip = (slot, itemId) => {
    dispatch(equipItem({ slot, itemId }));
  };

  return (
    <div className="inventory-ui">
      <EquipmentSlots equipped={equipped} onEquip={handleEquip} />
      <ItemGrid items={items} />
    </div>
  );
}
```

---

### 3. CompanionUI (NEW Component)

**Location:** `src/components/Companion/CompanionUI.jsx`

**Responsibilities:**
- Companion roster (recruited + unrecruited)
- Relationship bars, gift button, personal quest status
- Active party selection (battle + exploration slots)
- Companion teaching dialogue launcher

**Pattern:** Full-screen overlay

```jsx
export default function CompanionUI() {
  const companions = useSelector(state => state.companion.companions);
  const activeParty = useSelector(state => state.companion.activeParty);
  const dispatch = useDispatch();

  const handleSetActive = (slot, companionId) => {
    dispatch(setActiveCompanion({ slot, companionId }));
    EventBus.emit(EVENTS.COMPANION_SET_ACTIVE, { slot, companionId });
  };

  return (
    <div className="companion-ui">
      <ActivePartyPanel activeParty={activeParty} />
      <CompanionRoster companions={companions} onSetActive={handleSetActive} />
    </div>
  );
}
```

---

## DialogueEngine Integration

### Companion Dialogue Extension

**Location:** Modify `src/game/systems/DialogueEngine.js`

**New Condition Types:**
```javascript
// Add to evaluateCondition()

// Check companion relationship level
if (condition.companionRelationship) {
  const companionId = condition.companionRelationship.companionId;
  const companion = state.companion.companions[companionId];
  const level = companion?.relationship || 0;

  if (condition.companionRelationship.min !== undefined && level < condition.companionRelationship.min) {
    return false;
  }
}

// Check companion recruited status
if (condition.companionRecruited) {
  const companionId = condition.companionRecruited.companionId;
  const companion = state.companion.companions[companionId];
  const recruited = companion?.recruited || false;

  if (recruited !== condition.companionRecruited.recruited) {
    return false;
  }
}

// Check root mastery
if (condition.rootMastery) {
  const rootId = condition.rootMastery.rootId;
  const root = state.magic.rootMastery[rootId];
  const timesUsed = root?.timesUsed || 0;

  if (timesUsed < condition.rootMastery.minUses) {
    return false;
  }
}
```

**New Effect Types:**
```javascript
// Add to executeEffect()

if (effect.type === 'recruit_companion') {
  store.dispatch(recruitCompanion(effect.companionId));
  EventBus.emit(EVENTS.COMPANION_RECRUITED, { companionId: effect.companionId });
}

if (effect.type === 'discover_root') {
  store.dispatch(discoverRoot({ rootId: effect.rootId, element: effect.element }));
  EventBus.emit(EVENTS.MAGIC_ROOT_DISCOVERED, { rootId: effect.rootId });
}

if (effect.type === 'give_item') {
  store.dispatch(addItem({
    itemId: effect.itemId,
    quantity: effect.quantity || 1,
    rarity: effect.rarity || 'common',
  }));
  EventBus.emit(EVENTS.INVENTORY_ITEM_ADDED, { itemId: effect.itemId });
}

if (effect.type === 'affinity_choice') {
  store.dispatch(recordAffinityChoice({
    choiceId: effect.choiceId,
    element: effect.element,
    weight: effect.weight || 1,
  }));
}
```

---

## BattleScene Integration

### Modify `BattleScene.create()`

```javascript
create() {
  // ... existing subsystems ...

  // NEW: Initialize root magic manager
  this.rootMagic = new RootMagicManager(this);

  // NEW: Initialize companion manager (if companion in party)
  const activeParty = store.getState().companion.activeParty;
  if (activeParty.battle) {
    this.companionMgr = new CompanionManager(this);
    this.companionMgr.spawnBattleCompanion(activeParty.battle);
  }

  // NEW: Cache equipment bonuses for this battle
  const equipMgr = new EquipmentManager(this.scene, null); // No player sprite in battle
  const bonuses = equipMgr.calculateBonuses();
  store.dispatch(cacheEquipmentBonuses(bonuses));

  // ... rest of existing code ...
}
```

### Modify `BattleStateMachine` Turn Flow

```javascript
// In BattleStateMachine._nextTurn()

_nextTurn() {
  const activeParty = store.getState().companion.activeParty;

  if (this.isPlayerTurn) {
    this._transition(STATES.PLAYER_TURN);
  } else if (activeParty.battle && !this.companionTurnTaken) {
    // Companion turn
    this._transition(STATES.COMPANION_TURN);
  } else {
    // Enemy turn
    this._transition(STATES.ENEMY_TURN);
  }
}

// NEW state handler
_handleCompanionTurn() {
  const activeParty = store.getState().companion.activeParty;
  const companion = store.getState().companion.companions[activeParty.battle];
  const battleState = store.getState().battle;

  const ai = new CompanionBattleAI(companion, battleState);
  const action = ai.decide();

  // Execute action
  if (action.type === 'heal') {
    // TODO: implement heal logic
  } else if (action.type === 'attack') {
    store.dispatch(dealDamageToEnemy({ damage: action.damage }));
  }

  EventBus.emit(EVENTS.COMPANION_BATTLE_ACTION, action);

  this.companionTurnTaken = true;
  this._transition(STATES.TURN_END);
}
```

---

## Data Flow Examples

### Example 1: Casting a Root Magic Spell

```
1. Player clicks spell button in MagicOverlay
   ↓
2. MagicOverlay emits EVENTS.MAGIC_CAST { slot: 2 }
   ↓
3. BattleScene receives event, calls rootMagic.castSpell(2, targetIndex)
   ↓
4. RootMagicManager:
   - Reads magicSlice.equippedSpells[2] and battle.playerMP
   - Validates MP cost
   - Dispatches spendMP(cost) to battleSlice
   - Triggers Phaser VFX via BattleEffectManager
   ↓
5. After 800ms VFX delay:
   - Calculates damage (root mastery × affinity × grammar accuracy)
   - Dispatches dealDamageToEnemy({ damage })
   - Dispatches recordRootUse({ rootId, form, accuracy })
   - Emits EVENTS.MAGIC_EFFECT_COMPLETE
   ↓
6. BattleStateMachine receives event, transitions to next state
```

---

### Example 2: Equipping an Item

```
1. Player drags item to equipment slot in InventoryUI
   ↓
2. InventoryUI dispatches equipItem({ slot: 'robe', itemId: 'item_123' })
   ↓
3. inventorySlice reducer updates state.equipped.robe = 'item_123'
   ↓
4. InventoryUI emits EVENTS.INVENTORY_EQUIP { slot: 'robe', itemId: 'item_123' }
   ↓
5. EquipmentManager (in WorldScene) receives event:
   - Reads inventorySlice.equipped
   - Destroys old robe sprite
   - Creates new robe sprite `equipment_robe_item_123`
   ↓
6. achievementMiddleware checks if equipping this rarity unlocks achievement
   ↓
7. If item has locked affix (Arabic word not learned):
   - Item displays with grayed-out stat
   - Player sees "Learn 'مبارك' to unlock bonus"
```

---

### Example 3: Companion Idle Dialogue

```
1. Player enters ancient_library zone with companion Amira active
   ↓
2. CompanionManager.update() checks context (zone entry + activeParty.exploration)
   ↓
3. CompanionManager emits EVENTS.COMPANION_IDLE_DIALOGUE {
     companionId: 'companion_amira',
     dialogueId: 'idle_library_entrance'
   }
   ↓
4. React CompanionIdleOverlay receives event:
   - Reads companionSlice.companions['companion_amira']
   - Fetches dialogue text from data file
   - Displays floating speech bubble: "Look at all these manuscripts!"
   ↓
5. After 3 seconds, bubble fades out
   ↓
6. CompanionManager sets cooldown (no more idle dialogue for 10 seconds)
```

---

### Example 4: Dialogue Effect Unlocks Root

```
1. Player talks to Sage NPC, selects topic "Ancient Fire Magic"
   ↓
2. DialogueEngine.executeEffect() processes effect:
   {
     type: 'discover_root',
     rootId: 'ح-ر-ق',
     element: 'fire'
   }
   ↓
3. DialogueEngine dispatches discoverRoot({ rootId: 'ح-ر-ق', element: 'fire' })
   ↓
4. magicSlice reducer adds 'ح-ر-ق' to discoveredRoots array
   ↓
5. DialogueEngine emits EVENTS.MAGIC_ROOT_DISCOVERED { rootId: 'ح-ر-ق' }
   ↓
6. React RootDiscoveryNotification displays:
   - "New Root Discovered! ح-ر-ق (burn)"
   - "Element: Fire 🔥"
   - "Learn words from this root to unlock spells"
   ↓
7. achievementMiddleware checks if discoveredRoots.length >= 10 → unlock achievement
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Cross-Contaminating Phaser and React

**What not to do:**
```javascript
// ❌ BAD: Phaser system trying to use React hooks
class BadSystem {
  constructor(scene) {
    const items = useSelector(state => state.inventory.items); // ERROR!
  }
}

// ❌ BAD: React component directly manipulating Phaser sprites
function BadComponent() {
  const scene = useContext(PhaserSceneContext);
  scene.add.sprite(100, 100, 'player'); // ERROR!
}
```

**Do this instead:**
```javascript
// ✅ GOOD: Phaser reads Redux directly
class GoodSystem {
  constructor(scene) {
    const items = store.getState().inventory.items;
  }
}

// ✅ GOOD: React emits event, Phaser handles sprite
function GoodComponent() {
  const handleClick = () => {
    EventBus.emit(EVENTS.SPAWN_SPRITE, { x: 100, y: 100 });
  };
}
```

---

### Anti-Pattern 2: Denormalized Redux State

**What not to do:**
```javascript
// ❌ BAD: Duplicating companion data in multiple slices
{
  companion: {
    companions: { 'amira': { hp: 80, ... } }
  },
  battle: {
    companionHP: { 'amira': 80 } // DUPLICATE!
  }
}
```

**Do this instead:**
```javascript
// ✅ GOOD: Single source of truth, selectors for derived data
{
  companion: {
    companions: { 'amira': { hp: 80, ... } }
  }
}

// Selector
const selectCompanionBattleStats = createSelector(
  [state => state.companion.companions],
  companions => Object.fromEntries(
    Object.entries(companions).map(([id, c]) => [id, { hp: c.hp, mp: c.mp }])
  )
);
```

---

### Anti-Pattern 3: Missing EventBus Cleanup

**What not to do:**
```javascript
// ❌ BAD: Registering listener without cleanup
useEffect(() => {
  EventBus.on(EVENTS.MAGIC_CAST, handleCast);
  // Missing cleanup! Memory leak on unmount
}, []);
```

**Do this instead:**
```javascript
// ✅ GOOD: Always return cleanup function
useEffect(() => {
  EventBus.on(EVENTS.MAGIC_CAST, handleCast);
  return () => {
    EventBus.off(EVENTS.MAGIC_CAST, handleCast);
  };
}, []);
```

---

### Anti-Pattern 4: Deeply Nested Dialogue Conditions

**What not to do:**
```javascript
// ❌ BAD: Unreadable nested conditions in dialogue data
{
  condition: {
    quest: { id: 'quest_1', status: 'active' },
    storyFlag: { key: 'met_sage', value: true },
    relationship: { min: 3 },
    vocabulary: { wordId: 'word_fire' },
    companionRecruited: { companionId: 'amira', recruited: true }
  }
}
```

**Do this instead:**
```javascript
// ✅ GOOD: Use AND/OR/NOT logic for clarity
{
  condition: {
    and: [
      { quest: { id: 'quest_1', status: 'active' } },
      { or: [
        { storyFlag: { key: 'met_sage', value: true } },
        { relationship: { min: 3 } }
      ]},
      { vocabulary: { wordId: 'word_fire' } }
    ]
  }
}
```

---

## Build Order Recommendations

### Phase 27: Battle Engine + Root Magic Foundation
**Order:**
1. `magicSlice.js` — State structure first
2. EventBus constants — Add `MAGIC_*` events
3. `RootMagicManager.js` — Phaser system
4. `MagicOverlay.jsx` — React UI
5. Integrate with `BattleScene` — Hook into turn flow
6. Test: Cast Form I spell, validate MP cost, damage calculation

**Dependencies:** Requires existing `battleSlice`, `vocabularySlice`, `grammarSlice`

---

### Phase 28: Equipment System
**Order:**
1. `inventorySlice.js` — State structure
2. Equipment data files — `src/data/equipment.js`, `src/data/affixes.js`
3. `EquipmentManager.js` — Phaser sprite rendering
4. `InventoryUI.jsx` — React grid UI
5. Integrate with `playerSlice` — Stat bonuses
6. Dialogue effects — `give_item` effect type
7. Test: Equip robe, verify sprite renders, stat bonus applies

**Dependencies:** Requires `vocabularySlice` (affix unlocking)

---

### Phase 29: Companion System
**Order:**
1. `companionSlice.js` — State structure
2. Companion data files — `src/data/companions.js`
3. `CompanionBattleAI.js` — Pure logic class
4. `CompanionManager.js` — Phaser sprites + pathfinding
5. `CompanionUI.jsx` — React UI
6. Integrate with `BattleStateMachine` — Add companion turn
7. Dialogue effects — `recruit_companion` effect type
8. Test: Recruit companion, verify battle turn, idle dialogue trigger

**Dependencies:** Requires `battleSlice`, `narrativeSlice`, `DialogueEngine`

---

### Phase 30: Economy & Shop System
**Order:**
1. Extend `inventorySlice` — Add shop state
2. Shop data files — `src/data/shops.js`
3. `ShopUI.jsx` — React shop overlay
4. Haggling mini-game — `src/components/Shop/HagglingGame.jsx`
5. NPC shop integration — Dialogue effect `open_shop`
6. Test: Buy item, haggle successfully, verify inventory update

**Dependencies:** Requires `inventorySlice`, `narrativeSlice` (NPC relationships affect prices)

---

## Scaling Considerations

### Current Architecture (v5.0) Bottlenecks
1. **localStorage overflow** — 5MB limit, FSRS cards will exceed with 5K words
2. **Monolithic data files** — `npcs.json` 424KB, `zones.js` 1031 lines
3. **No lazy loading** — BootScene loads all assets upfront (77+ calls)

### v6.0+ Mitigation Strategies

| Concern | Solution | Phase |
|---------|----------|-------|
| localStorage 5MB limit | Migrate to IndexedDB (vocabularySlice, companionSlice) | Phase 52 |
| Monolithic npcs.json | Split into per-zone files (`npcs/oasis_village.json`) | Phase 56 |
| Asset preload bloat | Zone-based lazy loading, CDN for large assets | Phase 54 |
| Redux state size | Normalize data (item IDs instead of full objects) | Phase 53 |
| Battle turn lag | Memoize selectors, pre-calculate damage tables | Phase 54 |

### Normalized Data Pattern (Phase 53)

**Current (denormalized):**
```javascript
{
  inventory: {
    items: [
      { itemId: 'item_123', name: 'Iron Sword', nameArabic: 'سيف حديد', stats: {...}, rarity: 'rare' },
      { itemId: 'item_123', name: 'Iron Sword', ... } // DUPLICATE if player has 2
    ]
  }
}
```

**Normalized (better scaling):**
```javascript
{
  inventory: {
    itemRegistry: { // Reference data (loaded once)
      'item_123': { name: 'Iron Sword', nameArabic: 'سيف حديد', stats: {...}, rarity: 'rare' }
    },
    playerItems: [ // Player owns (item ID + quantity)
      { itemId: 'item_123', quantity: 2, equipped: false }
    ]
  }
}
```

---

## Testing Integration

### New Test Files Required

```
src/store/slices/__tests__/magicSlice.test.js
src/store/slices/__tests__/inventorySlice.test.js
src/store/slices/__tests__/companionSlice.test.js
src/game/systems/magic/__tests__/RootMagicManager.test.js
src/game/systems/equipment/__tests__/EquipmentManager.test.js
src/game/systems/companion/__tests__/CompanionManager.test.js
src/game/systems/companion/__tests__/CompanionBattleAI.test.js
src/components/Magic/__tests__/MagicOverlay.test.jsx
src/components/Inventory/__tests__/InventoryUI.test.jsx
src/components/Companion/__tests__/CompanionUI.test.jsx
```

### Integration Test Scenarios

**Test 1: Root Magic → Battle Damage**
```javascript
it('should apply affinity bonus to spell damage', () => {
  // Setup: Player has fire affinity, casts fire spell
  store.dispatch(setAffinity({ type: 'primary', element: 'fire' }));
  store.dispatch(equipSpell({ slot: 0, rootId: 'ح-ر-ق', form: 'I' }));

  const manager = new RootMagicManager(mockScene);
  const damage = manager._calculateSpellDamage(
    store.getState().magic.equippedSpells[0]
  );

  // Expect: 2x damage for primary affinity
  expect(damage).toBeGreaterThan(20 * 2 * 0.9); // baseDamage * affinity * accuracy
});
```

**Test 2: Equipment Bonus → Battle HP**
```javascript
it('should apply equipment HP bonus to player max HP', () => {
  // Setup: Equip item with +20 HP
  store.dispatch(addItem({ itemId: 'item_helmet_hp', stats: { hp: 20 } }));
  store.dispatch(equipItem({ slot: 'headCovering', itemId: 'item_helmet_hp' }));

  const bonuses = new EquipmentManager(mockScene).calculateBonuses();

  // Expect: Bonus includes +20 HP
  expect(bonuses.hp).toBe(20);
});
```

**Test 3: Companion AI → Battle Action**
```javascript
it('should heal player when HP below 50%', () => {
  const companion = { battleRole: 'healer', nameArabic: 'أميرة', level: 5 };
  const battleState = { playerHP: 40, playerMaxHP: 100 };

  const ai = new CompanionBattleAI(companion, battleState);
  const action = ai.decide();

  expect(action.type).toBe('heal');
  expect(action.amount).toBeGreaterThan(0);
});
```

---

## Sources

**Architecture References:**
- Existing codebase: `src/store/store.js`, `src/utils/eventBusTypes.js`, `src/game/systems/DialogueEngine.js`
- Research documents: `.planning/research/EXPANSION-COMBAT-RPG.md`, `EXPANSION-SUMMARY.md`
- Redux Toolkit patterns: [Redux Toolkit Best Practices](https://redux-toolkit.js.org/usage/usage-guide)
- Phaser 3 patterns: Existing `BattleScene.js`, `NPCManager.js`, `InteractableManager.js`

**Confidence Level:** HIGH
- All integration points verified against existing code
- EventBus pattern confirmed via `eventBusTypes.js`
- Redux slice structure validated via `battleSlice.js`, `playerSlice.js`
- Phaser ↔ React communication pattern verified via `BattleScene.js` + `BattleOverlay.jsx`

---

*Architecture integration research for: GoGo Arabic v6.0 Combat & RPG Systems*
*Researched: 2026-02-12*
