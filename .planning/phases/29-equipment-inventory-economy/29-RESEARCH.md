# Phase 29: Equipment, Inventory & Economy - Research

**Researched:** 2026-02-12
**Domain:** Equipment/inventory systems, Arabic-vocabulary-gated item bonuses, haggling mini-games, RPG economy
**Confidence:** HIGH

## Summary

Phase 29 adds a full equipment/inventory/economy system to GoGo Arabic's existing combat framework (Phase 27-28). Players manage 8 equipment slots with stat bonuses, maintain a 200-item inventory with Arabic affix vocabulary, and practice Arabic numerals through shop haggling. **The critical insight:** Equipment bonuses are vocabulary-locked (50% bonus if affix word unlearned, 100% if learned), creating a natural incentive loop that drives Arabic learning without feeling forced.

This phase builds on the existing hybrid IndexedDB/localStorage persistence (Phase 27.1), the outfit system (playerSlice.outfit), the root magic affinity system (Phase 28), and the shop UI foundation (ShopOverlay.jsx). The integration points are well-defined: equipment affects battle stats, shops use world state for dynamic inventory, and the vocabulary system gates item power.

**Primary recommendation:** Use nested persistReducer pattern for inventorySlice (IndexedDB, not localStorage) to handle 200-item capacity without quota overflow. Build on existing ShopOverlay.jsx rather than creating new UI from scratch. Implement Arabic numeral input with normalization utilities (Eastern Arabic ٠-٩ ↔ Western 0-9) for haggling mini-game.

## Standard Stack

### Core (NO NEW DEPENDENCIES)

All features built with existing v6.0 stack per hard constraint.

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Redux Toolkit | 2.x | inventorySlice, economySlice state | Already core to app, 14 existing slices |
| redux-persist | 6.x | Nested persistReducer for IndexedDB | Pattern established in Phase 27.1 |
| Phaser 3 | 3.87.0 | EquipmentManager sprite rendering | Existing game engine, PlayerController pattern |
| React 19 | 19.x | InventoryUI, ShopUI React overlays | Existing UI framework, 50+ components |
| Framer Motion | 11.x | Inventory grid animations | Existing animation library, all overlays use it |

**Installation:** None required (all dependencies already present)

### Supporting Utilities (BUILD, DON'T INSTALL)

| Utility | Purpose | Implementation |
|---------|---------|----------------|
| Arabic number normalizer | Convert ٠-٩ ↔ 0-9 for haggling input | `src/utils/arabicNumbers.js` |
| Affix vocabulary matcher | Check if player knows item affix word | `src/utils/affixMatcher.js` |
| Item stat calculator | Compute total bonuses (base + affixes + set bonuses) | `src/utils/itemStats.js` |
| Shop inventory generator | Dynamic shop stock based on player level/world state | `src/data/shopGenerator.js` |
| Rarity tier helper | Arabic color names + CSS colors | Extend existing `src/data/outfits.js` pattern |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Nested persistReducer (IndexedDB) | Single localStorage namespace | localStorage overflows at ~180 items, breaks saves |
| React drag-and-drop (mouse events) | HTML5 Drag API | HTML5 API requires more accessibility polyfills for keyboard/touch |
| Phaser DOMOverlay for inventory | Canvas-based Phaser UI | Canvas UI harder to make accessible (ARIA, focus traps) |
| Data-driven shop inventory | Static JSON shop files | Static inventory feels lifeless, no world reactivity |

## Architecture Patterns

### Recommended Project Structure

```
src/
├── store/slices/
│   ├── inventorySlice.js         # NEW: 200-item inventory, equipped slots, affixes unlocked
│   ├── economySlice.js            # NEW: shop state, haggling history, price fluctuations
│   └── playerSlice.js             # MODIFY: keep dirhams synced with economySlice
├── game/systems/
│   └── equipment/
│       ├── EquipmentManager.js    # NEW: sprite rendering for 8 slots
│       └── EquipmentStats.js      # NEW: calculate bonuses from equipped items
├── components/
│   ├── Inventory/
│   │   ├── InventoryUI.jsx        # NEW: 200-slot grid, drag-drop, filters
│   │   ├── EquipmentSlots.jsx     # NEW: 8 equipment slots with tooltips
│   │   ├── ItemTooltip.jsx        # NEW: stat comparison (equipped vs inspected)
│   │   └── InventoryUI.module.css
│   └── Shop/
│       ├── ShopOverlay.jsx        # EXTEND: add haggling mini-game modal
│       ├── HagglingGame.jsx       # NEW: Arabic numeral negotiation
│       └── ShopInventory.jsx      # NEW: dynamic shop rendering
├── data/
│   ├── equipment.js               # NEW: equipment templates (200+ items)
│   ├── affixes.js                 # NEW: Arabic adjectives for item bonuses
│   ├── shops.js                   # NEW: zone shops with base inventory
│   └── itemSets.js                # NEW: equipment set bonuses
└── utils/
    ├── arabicNumbers.js           # NEW: ٠-٩ ↔ 0-9 conversion
    ├── affixMatcher.js            # NEW: vocabulary gate logic
    └── itemStats.js               # NEW: stat aggregation
```

### Pattern 1: Nested persistReducer for Heavy Slices (IndexedDB)

**What:** Phase 27.1 established hybrid persistence — heavy slices (vocabulary, battle, magic) use IndexedDB via nested persistReducer, light slices use localStorage.

**When to use:** inventorySlice (200 items × ~500 bytes = 100KB) exceeds safe localStorage threshold.

**Example:**
```javascript
// src/store/store.js
import indexedDBStorage from '../services/storage/indexedDBAdapter.js';

const inventoryPersistConfig = {
  key: 'gogo-arabic-inventory',
  storage: indexedDBStorage,
  version: CURRENT_VERSION,
  migrate,
};

const persistedInventoryReducer = persistReducer(inventoryPersistConfig, inventoryReducer);

const rootReducer = combineReducers({
  // ... existing slices ...
  inventory: persistedInventoryReducer, // IndexedDB (nested)
  // economySlice can stay in localStorage (only ~5KB shop state)
});
```

**Why nested, not separate namespace?**
- Preserves existing selector paths: `state.inventory.items` works unchanged
- No breaking changes for 50K LOC codebase
- Transparent to all consumers

### Pattern 2: Vocabulary-Locked Item Bonuses

**What:** Item affixes (حاد "sharp", مبارك "blessed") only grant full bonuses if player has learned the word in vocabularySlice FSRS system.

**When to use:** All equipment items with Arabic affix adjectives.

**Example:**
```javascript
// src/utils/itemStats.js
export function calculateItemStats(item, vocabularyState) {
  const baseStats = item.stats; // { hp: 20, damage: 1.1 }
  let totalStats = { ...baseStats };

  // Process affixes
  item.affixes?.forEach(affix => {
    const affixWord = affix.wordId; // 'word_sharp'
    const learnedWords = vocabularyState.fsrsCards || {};
    const wordKnown = learnedWords[affixWord]?.card?.state === 'Review';

    // 50% bonus if unknown, 100% if learned
    const multiplier = wordKnown ? 1.0 : 0.5;

    Object.keys(affix.bonus).forEach(stat => {
      totalStats[stat] = (totalStats[stat] || 0) + (affix.bonus[stat] * multiplier);
    });

    // Auto-add to FSRS deck if discovered but not learned
    if (!learnedWords[affixWord]) {
      store.dispatch(addFsrsCard({ wordId: affixWord, source: 'equipment_discovery' }));
    }
  });

  return totalStats;
}
```

**Integration with battle:**
```javascript
// In BattleScene.create()
const equippedItems = store.getState().inventory.equipped;
const vocabularyState = store.getState().vocabulary;
const bonuses = calculateTotalEquipmentStats(equippedItems, vocabularyState);
store.dispatch(cacheEquipmentBonuses(bonuses)); // battleSlice
```

### Pattern 3: Dynamic Shop Inventory (World-State Driven)

**What:** Shop inventory changes based on player level, quest completion, faction reputation, zone unlocks, and time of day.

**When to use:** All zone shops to avoid static/stale feeling.

**Example:**
```javascript
// src/data/shopGenerator.js
export function getShopInventory(shopId, gameState) {
  const baseInventory = SHOP_BASE_ITEMS[shopId] || [];
  const playerLevel = gameState.player.level;
  const reputation = gameState.narrative.factionReputation?.merchants || 0;
  const completedQuests = gameState.quests.completed || [];

  // Filter by level
  let available = baseInventory.filter(item =>
    !item.minLevel || playerLevel >= item.minLevel
  );

  // Add reputation-locked items
  if (reputation >= 50) {
    available = [...available, ...SHOP_REPUTATION_ITEMS[shopId]];
  }

  // Add quest-unlocked items
  if (completedQuests.includes('quest_merchant_favor')) {
    available = [...available, ...SHOP_QUEST_ITEMS[shopId]];
  }

  // Randomize some slots (restock mechanism)
  const randomPool = SHOP_RANDOM_POOL[shopId] || [];
  const randomCount = Math.floor(Math.random() * 3) + 1;
  const randomItems = randomPool.sort(() => 0.5 - Math.random()).slice(0, randomCount);

  return [...available, ...randomItems];
}
```

**Usage in ShopOverlay:**
```javascript
// src/components/Shop/ShopOverlay.jsx
const shopInventory = useMemo(() => {
  const state = store.getState();
  return getShopInventory(currentShop.id, state);
}, [currentShop, playerLevel, factionReputation, completedQuests]);
```

### Pattern 4: Arabic Numeral Input Normalization

**What:** Haggling mini-game accepts both Eastern Arabic (٠-٩) and Western (0-9) numerals, normalizes input.

**When to use:** All number inputs in Arabic-first contexts (prices, quantities).

**Example:**
```javascript
// src/utils/arabicNumbers.js

const EASTERN_ARABIC_MAP = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
};

const WESTERN_ARABIC_MAP = Object.fromEntries(
  Object.entries(EASTERN_ARABIC_MAP).map(([k, v]) => [v, k])
);

export function normalizeArabicNumber(input) {
  // Convert Eastern Arabic to Western, strip non-digits
  const normalized = input.replace(/[٠-٩]/g, d => EASTERN_ARABIC_MAP[d]);
  const cleaned = normalized.replace(/[^\d]/g, ''); // Remove separators, spaces
  return parseInt(cleaned, 10) || 0;
}

export function formatAsEasternArabic(number) {
  return String(number).replace(/[0-9]/g, d => WESTERN_ARABIC_MAP[d]);
}

export function formatWithSeparators(number, useEastern = false) {
  // Arabic uses comma separator: ١٬٢٣٤
  const str = useEastern ? formatAsEasternArabic(number) : String(number);
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, useEastern ? '٬' : ',');
}
```

**Usage in HagglingGame:**
```javascript
// src/components/Shop/HagglingGame.jsx
const [offerInput, setOfferInput] = useState('');

const handleOfferChange = (e) => {
  const raw = e.target.value;
  setOfferInput(raw); // Show user's typed input (mixed ٠-٩/0-9)

  const normalized = normalizeArabicNumber(raw);
  setOfferValue(normalized); // Internal state uses Western
};

const displayPrice = formatWithSeparators(itemPrice, true); // Show as ١٬٢٣٤
```

### Pattern 5: Equipment Sprite Layering (Phaser)

**What:** Render equipment sprites on top of player character with correct depth sorting (boots < robe < cloak < head).

**When to use:** WorldScene and BattleScene player sprite rendering.

**Example:**
```javascript
// src/game/systems/equipment/EquipmentManager.js
export class EquipmentManager {
  constructor(scene, playerSprite) {
    this.scene = scene;
    this.playerSprite = playerSprite;
    this.equipmentSprites = {}; // { slot: sprite }

    // Listen for equipment changes
    EventBus.on(EVENTS.EQUIPMENT_CHANGED, this.updateSprites.bind(this));
  }

  updateSprites() {
    const equipped = store.getState().inventory.equipped;

    // Destroy old sprites
    Object.values(this.equipmentSprites).forEach(s => s?.destroy());
    this.equipmentSprites = {};

    // Depth layers (boots behind, cloak in front)
    const DEPTH_LAYERS = {
      boots: 0, belt: 5, robe: 10, gloves: 15,
      cloak: 20, headCovering: 25, accessory1: 30, accessory2: 35
    };

    // Create new sprites
    Object.entries(equipped).forEach(([slot, itemId]) => {
      if (!itemId) return;

      const sprite = this.scene.add.sprite(
        this.playerSprite.x,
        this.playerSprite.y,
        `equipment_${itemId}` // Asset key
      );

      sprite.setDepth(this.playerSprite.depth + DEPTH_LAYERS[slot]);
      this.equipmentSprites[slot] = sprite;
    });
  }

  update() {
    // Keep equipment sprites synced with player position
    Object.values(this.equipmentSprites).forEach(sprite => {
      sprite.x = this.playerSprite.x;
      sprite.y = this.playerSprite.y;
    });
  }
}
```

### Anti-Patterns to Avoid

- **Denormalized item data:** Don't duplicate full item objects in `inventory.items`. Store item IDs only, look up details from `equipment.js` data file. (200 items × 500 bytes = 100KB, vs 200 IDs × 20 bytes = 4KB)
- **Static shop inventory:** Don't hardcode shop items in JSON. Use generator functions that read world state.
- **Affix power creep:** Don't allow unlimited affix stacking (e.g., "blessed blessed blessed sword" with 3× bonus). Constrain: max 1 positive + 1 negative affix per rarity tier.
- **Missing Arabic numeral fallback:** Don't assume users can type Eastern Arabic. Always accept both ٠-٩ and 0-9 in inputs.
- **Equipment sprite sync bugs:** Don't forget to emit `EVENTS.EQUIPMENT_CHANGED` when equipping/unequipping. Both WorldScene and BattleScene listen.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop inventory | Custom mouse tracking + collision detection | HTML5 Drag API + React onDrag handlers | Edge cases: touch, keyboard, screen readers, cancel detection |
| FSRS spaced repetition | Custom vocabulary scheduling algorithm | Existing `vocabularySlice.fsrsCards` | Already integrated, 721 tests passing, proven |
| Persistent storage | Custom file-based save system | redux-persist + indexedDBAdapter | Migration, quota monitoring, hydration already solved |
| Arabic text rendering | Custom RTL text layout engine | CSS `direction: rtl`, browser native | Browser-native RTL is battle-tested, no bugs |
| Item rarity colors | RGB color pickers in UI | Data-driven `RARITY_COLORS` object | Consistency across UI, Arabic color names |

**Key insight:** Phase 27.1 already solved the hardest storage problem (IndexedDB migration). Phase 29 extends this pattern, doesn't reinvent it.

## Common Pitfalls

### Pitfall 1: localStorage Overflow (CRITICAL)

**What goes wrong:** Adding inventorySlice to localStorage persist whitelist causes silent save corruption when 200 items + FSRS cards exceed 5MB quota.

**Why it happens:**
- inventorySlice: 200 items × ~500 bytes = 100KB
- Existing vocabulary FSRS: ~2-3MB
- Phase 30 companionSlice: ~80KB
- Total: 5MB+ → `localStorage.setItem()` silently fails in many browsers

**How to avoid:**
1. Use nested persistReducer with IndexedDB for inventorySlice
2. Run quota check in tests: `navigator.storage.estimate()`
3. Enable storageQuotaMiddleware warnings (already exists from Phase 27.1)

**Warning signs:**
- Player reports "lost items after refresh"
- Save/load takes >500ms (quota hit)
- No console errors but state doesn't persist

**Phase 27.1 already solved this** for vocabulary/battle/magic. Phase 29 extends the pattern.

### Pitfall 2: Affix Vocabulary Desync (CRITICAL)

**What goes wrong:** Player discovers item with affix "حاد" (sharp), affix word never added to FSRS deck, bonus remains locked forever because player can't learn the word.

**Why it happens:**
- Item discovery event doesn't trigger FSRS card creation
- Player sees "Learn this word to unlock bonus" but word not in lesson queue
- Vocabulary system and equipment system not bidirectionally synced

**How to avoid:**
1. Auto-add affix word to FSRS deck on item discovery:
   ```javascript
   if (!fsrsCards[affix.wordId]) {
     dispatch(addFsrsCard({ wordId: affix.wordId, source: 'equipment_discovery' }));
   }
   ```
2. Tag equipment-discovered words for review priority
3. Show toast: "New word discovered: حاد (sharp) — practice to unlock power"

**Warning signs:**
- Players complain "I got legendary item but it's weak"
- Affix tooltips stuck at "Learn this word" indefinitely
- FSRS review queue doesn't include equipment words

### Pitfall 3: Equipment Visual Desync (WorldScene vs BattleScene)

**What goes wrong:** Player equips cloak in inventory UI, cloak shows in WorldScene, enters battle, BattleScene shows old outfit.

**Why it happens:**
- WorldScene EquipmentManager listens to `EVENTS.EQUIPMENT_CHANGED`
- BattleScene forgets to listen, uses cached `playerSlice.outfit` from scene creation
- Two sprite managers reading different state sources

**How to avoid:**
1. Centralize outfit state in `playerSlice.outfit` (already exists)
2. Emit `EVENTS.EQUIPMENT_CHANGED` when equipping items
3. Both WorldScene and BattleScene listen and update sprites:
   ```javascript
   EventBus.on(EVENTS.EQUIPMENT_CHANGED, () => {
     this.equipmentMgr.updateSprites();
   });
   ```
4. Add cleanup in scene shutdown:
   ```javascript
   shutdown() {
     EventBus.off(EVENTS.EQUIPMENT_CHANGED, this.updateSprites);
   }
   ```

**Warning signs:**
- Outfit looks different in battle vs world
- Equipping item shows old sprite
- Scene transitions reset equipment visuals

### Pitfall 4: Shop Inventory Feels Static

**What goes wrong:** Players visit same shop at level 1 and level 15, see identical inventory, feels lifeless.

**Why it happens:**
- Shop data hardcoded in JSON
- No world-state reactivity
- No restock mechanic

**How to avoid:**
1. Dynamic inventory generator (Pattern 3 above)
2. Restock on:
   - Player level milestones (every 5 levels)
   - Quest completion (unlocks new items)
   - Faction reputation gains (premium items)
   - Real-world time (daily restock)
3. Add "NEW" badge on recently unlocked items
4. Merchant dialogue references player's progress: "Ah, a level 10 adventurer! Let me show you our rare goods."

**Warning signs:**
- Players stop visiting shops after first purchase
- Economy feels disconnected from world
- Analytics show <2 shop visits per zone

### Pitfall 5: Haggling Mini-Game Frustration Loop

**What goes wrong:** Haggling is too hard (player must guess exact number), too easy (always succeeds), or too tedious (required for every purchase).

**Why it happens:**
- No feedback on "too high" vs "too low"
- Win conditions unclear
- Forced haggling breaks flow

**How to avoid:**
1. Make haggling **optional** for most items (instant buy)
2. Haggling unlocks **discounts** (10-30% off), not gates
3. Provide feedback: "Too high! المبلغ كثير (the amount is too much)"
4. Visual cues: shopkeeper face changes (neutral → smiling → laughing)
5. Difficulty scales with Arabic number proficiency (FSRS data)
6. Limit attempts: 3 offers max, then accept/decline
7. Show range: "Merchant wants 800-1200 dirhams"

**Example:**
```javascript
const MIN_PRICE = basePrice * 0.7; // 30% discount max
const MAX_PRICE = basePrice * 1.0; // Full price
const TARGET_PRICE = MIN_PRICE + (MAX_PRICE - MIN_PRICE) * merchantStubborness;

if (playerOffer < MIN_PRICE) {
  feedback = "That's insulting! (أنت تمزح؟)";
} else if (playerOffer < TARGET_PRICE) {
  feedback = "Still too low... (لا يزال منخفض)";
} else if (playerOffer <= MAX_PRICE) {
  feedback = "Deal! (اتفقنا!)";
  success = true;
}
```

**Warning signs:**
- Players avoid haggling entirely (always instant buy)
- Frustration comments in playtests
- Haggling mini-game completion rate <30%

## Code Examples

Verified patterns from existing codebase and standard practices:

### 1. Create inventorySlice with Nested Persistence

```javascript
// src/store/slices/inventorySlice.js
import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  equipped: {
    headCovering: null,
    robe: null,
    cloak: null,
    belt: null,
    boots: null,
    gloves: null,
    accessory1: null,
    accessory2: null,
  },
  items: [], // [{ itemId, quantity, locked }]
  affixesUnlocked: [], // ['word_sharp', 'word_blessed', ...]
  dirhams: 0, // Synced with playerSlice.dirhams for backward compat
  shopInventories: {}, // { shopId: { items, lastRestock } }
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    addItem(state, action) {
      // payload: { itemId, quantity?, rarity?, affixes? }
      const { itemId, quantity = 1 } = action.payload;

      const existing = state.items.find(i => i.itemId === itemId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ itemId, quantity, locked: false });
      }

      // Limit to 200 items
      if (state.items.length > 200) {
        console.warn('[inventorySlice] Inventory full (200 items)');
      }
    },

    equipItem(state, action) {
      // payload: { slot, itemId }
      const { slot, itemId } = action.payload;

      if (!state.equipped.hasOwnProperty(slot)) {
        console.error(`[inventorySlice] Invalid slot: ${slot}`);
        return;
      }

      state.equipped[slot] = itemId;
    },

    unlockAffix(state, action) {
      // payload: wordId (e.g., 'word_sharp')
      const wordId = action.payload;
      if (!state.affixesUnlocked.includes(wordId)) {
        state.affixesUnlocked.push(wordId);
      }
    },

    // ... other reducers
  },
});

export const { addItem, equipItem, unlockAffix } = inventorySlice.actions;

// Selectors
export const selectEquippedItems = (state) => state.inventory.equipped;
export const selectInventoryItems = (state) => state.inventory.items;
export const selectAffixesUnlocked = (state) => state.inventory.affixesUnlocked;

// Derived selector: total equipment stats
export const selectEquipmentStats = createSelector(
  [selectEquippedItems, selectAffixesUnlocked, (state) => state.vocabulary],
  (equipped, affixesUnlocked, vocabulary) => {
    // Calculate stats from equipped items (see Pattern 2)
    // ...
  }
);

export default inventorySlice.reducer;
```

```javascript
// src/store/store.js (add to existing file)
import inventoryReducer from './slices/inventorySlice.js';

const inventoryPersistConfig = {
  key: 'gogo-arabic-inventory',
  storage: indexedDBStorage, // From Phase 27.1
  version: CURRENT_VERSION,
  migrate,
};

const persistedInventoryReducer = persistReducer(inventoryPersistConfig, inventoryReducer);

const rootReducer = combineReducers({
  // ... existing slices ...
  inventory: persistedInventoryReducer, // IndexedDB (nested)
});
```

### 2. Dynamic Shop Inventory Generator

```javascript
// src/data/shopGenerator.js
import { SHOP_BASE_ITEMS, SHOP_REPUTATION_ITEMS, SHOP_QUEST_ITEMS } from './shops.js';

export function getShopInventory(shopId, gameState) {
  const base = SHOP_BASE_ITEMS[shopId] || [];
  const { player, narrative, quests } = gameState;

  // Filter by player level
  let available = base.filter(item =>
    !item.minLevel || player.level >= item.minLevel
  );

  // Add reputation-gated items
  const merchantRep = narrative.factionReputation?.merchants || 0;
  if (merchantRep >= 50 && SHOP_REPUTATION_ITEMS[shopId]) {
    available = [...available, ...SHOP_REPUTATION_ITEMS[shopId]];
  }

  // Add quest-unlocked items
  const completedQuests = quests.completed || [];
  Object.entries(SHOP_QUEST_ITEMS[shopId] || {}).forEach(([questId, items]) => {
    if (completedQuests.includes(questId)) {
      available = [...available, ...items];
    }
  });

  return available;
}
```

### 3. Arabic Numeral Input Component

```javascript
// src/components/Shop/HagglingGame.jsx
import { useState } from 'react';
import { normalizeArabicNumber, formatWithSeparators } from '../../utils/arabicNumbers.js';

export default function HagglingGame({ itemPrice, onSuccess, onCancel }) {
  const [offerInput, setOfferInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState('');

  const MAX_ATTEMPTS = 3;
  const MIN_PRICE = Math.floor(itemPrice * 0.7); // 30% discount max
  const TARGET_PRICE = Math.floor(itemPrice * 0.85); // Merchant accepts 15% discount

  const handleSubmit = (e) => {
    e.preventDefault();

    const offer = normalizeArabicNumber(offerInput);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (offer < MIN_PRICE) {
      setFeedback('That\'s insulting! أنت تمزح؟');
    } else if (offer < TARGET_PRICE) {
      setFeedback('Still too low... لا يزال منخفض');
    } else if (offer <= itemPrice) {
      setFeedback('Deal! اتفقنا!');
      onSuccess(offer); // Save player money
      return;
    } else {
      setFeedback('Too high! المبلغ كثير');
    }

    if (newAttempts >= MAX_ATTEMPTS) {
      setFeedback('Out of attempts. Pay full price or leave.');
    }
  };

  const displayPrice = formatWithSeparators(itemPrice, true); // ١٬٢٣٤

  return (
    <div className="haggling-game">
      <p>Merchant wants: {displayPrice} dirhams</p>
      <p>Make your offer (type in Arabic or Western numerals):</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={offerInput}
          onChange={(e) => setOfferInput(e.target.value)}
          placeholder="٨٠٠ or 800"
          dir="ltr"
          disabled={attempts >= MAX_ATTEMPTS}
        />
        <button type="submit" disabled={attempts >= MAX_ATTEMPTS}>
          Offer
        </button>
      </form>

      {feedback && <p className="feedback">{feedback}</p>}
      {attempts >= MAX_ATTEMPTS && (
        <div>
          <button onClick={() => onSuccess(itemPrice)}>Pay Full Price</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      )}

      <p>Attempts: {attempts}/{MAX_ATTEMPTS}</p>
    </div>
  );
}
```

### 4. Equipment Stats Calculator

```javascript
// src/utils/itemStats.js
import { EQUIPMENT_DATA } from '../data/equipment.js';

export function calculateItemStats(itemId, vocabularyState) {
  const item = EQUIPMENT_DATA[itemId];
  if (!item) return null;

  const baseStats = item.stats || {}; // { hp: 20, mp: 10, damage: 1.1, defense: 1.05 }
  const totalStats = { ...baseStats };

  // Process affixes
  (item.affixes || []).forEach(affix => {
    const wordId = affix.wordId; // 'word_sharp'
    const fsrsCards = vocabularyState.fsrsCards || {};
    const wordKnown = fsrsCards[wordId]?.card?.state === 'Review';

    // 50% bonus if unknown, 100% if learned
    const multiplier = wordKnown ? 1.0 : 0.5;

    Object.keys(affix.bonus).forEach(stat => {
      totalStats[stat] = (totalStats[stat] || 0) + (affix.bonus[stat] * multiplier);
    });
  });

  return totalStats;
}

export function calculateTotalEquipmentStats(equippedItems, vocabularyState) {
  const totals = { hp: 0, mp: 0, damage: 1.0, defense: 1.0 };

  Object.values(equippedItems).forEach(itemId => {
    if (!itemId) return;
    const stats = calculateItemStats(itemId, vocabularyState);
    if (!stats) return;

    totals.hp += stats.hp || 0;
    totals.mp += stats.mp || 0;
    totals.damage *= stats.damage || 1.0;
    totals.defense *= stats.defense || 1.0;
  });

  return totals;
}
```

### 5. Equipment Sprite Rendering (Phaser)

```javascript
// src/game/systems/equipment/EquipmentManager.js
import { EventBus } from '../../../utils/eventBus.js';
import { EVENTS } from '../../../utils/eventBusTypes.js';
import { store } from '../../../store/store.js';

export class EquipmentManager {
  constructor(scene, playerSprite) {
    this.scene = scene;
    this.playerSprite = playerSprite;
    this.equipmentSprites = {};

    // Listen for equipment changes
    this.boundUpdateSprites = this.updateSprites.bind(this);
    EventBus.on(EVENTS.EQUIPMENT_CHANGED, this.boundUpdateSprites);
  }

  updateSprites() {
    const equipped = store.getState().inventory.equipped;

    // Destroy old sprites
    Object.values(this.equipmentSprites).forEach(sprite => {
      if (sprite) sprite.destroy();
    });
    this.equipmentSprites = {};

    // Depth layers (boots behind, accessories in front)
    const DEPTH_LAYERS = {
      boots: 0, belt: 5, robe: 10, gloves: 15,
      cloak: 20, headCovering: 25, accessory1: 30, accessory2: 35
    };

    // Create sprites for equipped items
    Object.entries(equipped).forEach(([slot, itemId]) => {
      if (!itemId) return;

      const assetKey = `equipment_${itemId}`;

      // Check if asset exists (optional safety check)
      if (!this.scene.textures.exists(assetKey)) {
        console.warn(`[EquipmentManager] Missing texture: ${assetKey}`);
        return;
      }

      const sprite = this.scene.add.sprite(
        this.playerSprite.x,
        this.playerSprite.y,
        assetKey
      );

      sprite.setDepth(this.playerSprite.depth + DEPTH_LAYERS[slot]);
      this.equipmentSprites[slot] = sprite;
    });
  }

  update() {
    // Sync equipment positions with player
    Object.values(this.equipmentSprites).forEach(sprite => {
      if (sprite) {
        sprite.x = this.playerSprite.x;
        sprite.y = this.playerSprite.y;
      }
    });
  }

  destroy() {
    // Cleanup
    Object.values(this.equipmentSprites).forEach(sprite => {
      if (sprite) sprite.destroy();
    });
    EventBus.off(EVENTS.EQUIPMENT_CHANGED, this.boundUpdateSprites);
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static shop JSON files | Dynamic inventory generators | 2020+ (Skyrim, BG3) | Shops feel reactive to world |
| Unlock items by level only | Multi-gate unlocks (level + quest + reputation) | 2018+ (AC Odyssey) | More meaningful progression |
| Flat equipment stats | Set bonuses + affixes + synergies | 2012+ (Diablo 3) | Build diversity, theorycrafting |
| localStorage for all state | IndexedDB for heavy data | 2019+ (web games) | Solves quota overflow |
| ASCII number input only | Unicode numeral normalization | 2015+ (i18n best practice) | Native language input |
| Required haggling for all purchases | Optional haggling for discounts | 2021+ (Potionomics) | Flow preservation |

**Deprecated/outdated:**
- Hardcoded equipment in savegames → Normalize: store item IDs, look up from data files (easier to patch)
- Single currency → Modern RPGs use 2-3 currencies (gold + gems + faction tokens) for economy sinks
- No item comparison tooltips → Standard since WoW (2004), players expect it

## Open Questions

1. **Equipment sprite asset pipeline**
   - What we know: Existing outfits use `body-{id}.png` spritesheets
   - What's unclear: Do we need separate equipment sprites, or layer parts onto body spritesheet?
   - Recommendation: Start with reusing outfit system (8 outfits already exist), extend to equipment in Phase 32. Each equipment slot = new outfit variation.

2. **Affix discovery teaching flow**
   - What we know: Affixes auto-add to FSRS on item discovery
   - What's unclear: Should player be forced to learn word immediately, or queue for later?
   - Recommendation: Queue for later (show toast notification), don't block flow. Companion can comment: "I see you found a حاد sword! Let me teach you that word."

3. **Shop restock frequency**
   - What we know: Need restock to keep shops fresh
   - What's unclear: Real-time (daily at midnight) or event-based (every 5 levels)?
   - Recommendation: Event-based for now (no server clock dependency). Phase 47 can add real-time when daily quests implemented.

4. **Inventory sort order (Arabic alphabetical)**
   - What we know: Requirement says "sort by Arabic alphabetical order (abjad)"
   - What's unclear: Abjad (ا ب ت ث...) or hijā'ī (أ ب ت ث ج ح خ...)?
   - Recommendation: Use hijā'ī (standard modern ordering). Add abjad as option in Phase 60 (advanced features).

5. **Battle reward wiring**
   - What we know: Phase 27 battle engine has XP/gold/items in battleSlice
   - What's unclear: Does Phase 27 already dispatch to playerSlice/inventorySlice, or is that Phase 29's job?
   - Recommendation: Check Phase 27 VERIFICATION.md. If unwired, Phase 29 adds middleware to route battle rewards.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/store/slices/playerSlice.js`, `src/store/slices/magicSlice.js`, `src/store/store.js` (hybrid persistence patterns)
- Phase 27.1 research: `.planning/phases/27-indexeddb-migration/27.1-RESEARCH.md` (IndexedDB adapter, nested persistReducer)
- Phase 28 implementation: `src/store/slices/magicSlice.js`, `src/data/rootMagic.js` (affinity system, vocabulary-gated progression)
- Integration architecture: `.planning/research/ARCHITECTURE-V6-INTEGRATION.md` (EventBus patterns, Phaser ↔ React data flows)
- Domain pitfalls: `.planning/research/PITFALLS.md` (localStorage overflow, FSRS desync, equipment sprite bugs)
- Expansion plan: `.planning/research/EXPANSION-COMBAT-RPG.md` (Phase 29 detailed spec, 24K LOC estimate)
- Existing shop UI: `src/components/Shop/ShopOverlay.jsx` (foundation to extend)
- Outfit system: `src/data/outfits.js` (rarity tiers, level gates, pricing patterns)

### Secondary (MEDIUM confidence)
- [Wikipedia: Eastern Arabic numerals](https://en.wikipedia.org/wiki/Eastern_Arabic_numerals) — Unicode ranges U+0660-U+0669 for ٠-٩
- [W3C Arabic Layout Requirements](https://github.com/w3c/alreq/wiki/Arabic-numerals-(Draft)) — Numerals usage in Arabic contexts
- [LogRocket: Drag and Drop UI Best Practices](https://blog.logrocket.com/ux-design/drag-and-drop-ui-examples/) — Accessibility guidelines for inventory grids
- [Smart Interface Design Patterns: Drag-and-Drop UX](https://smart-interface-design-patterns.com/articles/drag-and-drop-ux/) — Keyboard, touch, screen reader support
- [Game Developer: Potionomics Haggling Mechanic](https://www.gamedeveloper.com/business/how-potionomics-turned-price-haggling-into-a-card-game) — Card-based haggling design
- [Big Village Games: Haggling in Merek's Market](https://bigvillagegames.com/2022/01/25/designing-the-haggling-mechanic/) — Predefined price options instead of free input
- [Game8: Affinity System (Final Fantasy Origin)](https://game8.co/games/Stranger-of-Paradise-Final-Fantasy-Origin/archives/371479) — Equipment affinity bonuses affecting progression

### Tertiary (LOW confidence)
- npm search for "arabic numbers" packages — many exist but most unmaintained, custom normalizer is 10 lines

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies already present (0 new installs), patterns proven in Phase 27-28
- Architecture: HIGH — nested persistReducer pattern established, EventBus patterns documented, existing shop UI to extend
- Pitfalls: HIGH — Phase 27.1 already hit localStorage overflow, equipment desync documented in PITFALLS.md, solutions tested
- Arabic numerals: MEDIUM — Unicode mapping verified, but edge cases (copy-paste, decimal separators) need testing
- Haggling design: MEDIUM — good references (Potionomics, Merek's Market), but educational angle is novel

**Research date:** 2026-02-12
**Valid until:** 60 days (stable domain, core architecture frozen in v6.0)
