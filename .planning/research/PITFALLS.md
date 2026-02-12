# Domain Pitfalls: Root Magic, Equipment/Inventory, Companions

**Domain:** Adding root magic, equipment/inventory, and companion systems to existing Phaser 3 + React + Redux RPG
**Researched:** 2026-02-12
**Context:** v6.0 expansion (Phases 27-32) adding ~148K LOC to existing 50K LOC Arabic learning RPG

---

## Critical Pitfalls

Mistakes that cause rewrites, data corruption, or architectural collapse.

---

### Pitfall 1: Redux State Explosion → localStorage Overflow

**What goes wrong:** Adding `equipmentSlice`, `inventorySlice`, `companionSlice`, and `rootMasterySlice` to redux-persist without migration strategy hits 5MB localStorage limit, causing silent data loss or total save corruption.

**Why it happens:**
- Current: 13 slices already persisted, FSRS cards alone approaching 2-3MB with 1,220 words
- Adding: Equipment (200 items @ ~500 bytes each = 100KB), Inventory (player items + state), Companions (12 companions × dialogue state + relationship + AI state = ~80KB), Root mastery (300+ roots × progress data = ~50KB)
- 5K vocabulary expansion → FSRS cards balloon to 5-10MB alone
- localStorage.setItem() silently fails when quota exceeded (no error in many browsers)

**Consequences:**
- Players lose all save data mid-session (redux-persist fails to write)
- New players hit quota during tutorial, game appears broken
- Impossible to debug without quota monitoring (silent failure)
- Migration from localStorage → IndexedDB requires full data rewrite

**Prevention:**
1. **Phase 27 (BEFORE equipment/inventory):** Implement IndexedDB migration
   - Move FSRS cards (`vocabularySlice.fsrsCards`) to IndexedDB immediately
   - Move battle history (`battleSlice.battleHistory`) to IndexedDB
   - Keep only lightweight slices in localStorage (settings, ui, currentZone, activeQuests)
2. **Phase 29:** Design inventory/equipment with IndexedDB-first
   - Store full item data in IndexedDB, only item IDs in Redux
   - Lazy-load item details on-demand
3. **Implement quota monitoring:**
   ```javascript
   if ('storage' in navigator && 'estimate' in navigator.storage) {
     const { usage, quota } = await navigator.storage.estimate();
     if (usage / quota > 0.8) { warnPlayer(); }
   }
   ```

**Detection:** Monitor `redux-persist` REHYDRATE action timing. If >500ms, quota likely hit.

**Phase assignment:** Phase 26.5 (pre-Phase 27 blocker) — IndexedDB migration for FSRS + battle history

---

### Pitfall 2: EventBus Namespace Collision → Silent Event Drops

**What goes wrong:** Adding 30+ new events for spells, equipment, companions, shops without namespacing collides with existing 35 events. `EVENTS.ITEM_USED` from battle conflicts with `EVENTS.ITEM_USED` from inventory, causing wrong handlers to fire or events to be silently ignored.

**Why it happens:**
- Current: 35 EventBus constants, no enforced namespacing validation
- Phase 28 adds: `SPELL_CAST`, `ELEMENT_DISCOVERED`, `ROOT_MASTERY_GAIN`
- Phase 29 adds: `ITEM_EQUIPPED`, `ITEM_UNEQUIPPED`, `SHOP_PURCHASE`, `INVENTORY_FULL`
- Phase 30 adds: `COMPANION_RECRUITED`, `COMPANION_DIALOGUE`, `COMPANION_ACTION`
- Developers copy-paste event names, forgetting to check `eventBusTypes.js`
- EventBus uses string keys internally — no TypeScript validation

**Consequences:**
- Equipment equip triggers spell cast (wrong handler)
- Companion actions don't fire because battle system already registered same event name
- Debugging nightmare: events emit but nothing happens (no error, just silence)
- Parallel agent work in Phases 28-30 increases risk of duplicate names

**Prevention:**
1. **Phase 27 (during battle system):** Enforce strict namespacing in `eventBusTypes.js`
   ```javascript
   // OLD (collision-prone):
   ITEM_USED: 'item-used'

   // NEW (namespace-safe):
   BATTLE_ITEM_USED: 'react:battle:item-used',
   INVENTORY_ITEM_CONSUMED: 'react:inventory:item-consumed',
   COMPANION_ITEM_GIVEN: 'react:companion:item-given'
   ```
2. **Add runtime validation:**
   ```javascript
   // In EventBus.on():
   if (registeredEvents.has(eventName)) {
     console.error(`EventBus: Duplicate handler for ${eventName}`);
   }
   ```
3. **Document event ownership in `eventBusTypes.js`:**
   ```javascript
   // ── BATTLE SYSTEM (Phases 27-32) ──
   BATTLE_ITEM_USED: 'react:battle:item-used',

   // ── INVENTORY SYSTEM (Phase 29) ──
   INVENTORY_ITEM_CONSUMED: 'react:inventory:item-consumed',
   ```

**Detection:** Event emitted but no handler fires. Check EventBus listener count: `EventBus.listenerCount(eventName)`.

**Phase assignment:** Phase 27 (battle refactor), Phase 29 (inventory), Phase 30 (companions) — each enforces namespace prefix

---

### Pitfall 3: FSRS ↔ Root Mastery Sync Desync → Contradictory Progress

**What goes wrong:** Player masters a root (ك-ت-ب) in root magic system but FSRS cards for derived words (كتاب, مكتوب, كاتب) show "not learned" or "forgotten". Root mastery UI shows 100% but vocabulary quiz shows 30% accuracy. Players lose trust in progression.

**Why it happens:**
- Root mastery (Phase 28) tracks 300+ three-letter roots with 10 affinity levels
- FSRS (vocabularySlice) tracks 5,000+ individual words
- No bidirectional sync: learning derived word doesn't update root mastery, mastering root doesn't auto-learn words
- Root mastery gates spell power, FSRS gates quiz difficulty → conflicting sources of truth
- Each system has independent progression curves (root XP vs FSRS intervals)

**Consequences:**
- Player masters نار (fire) root but can't use fire spells because derived words not in FSRS deck
- Companion teaches root-derived word, FSRS card created, but root mastery doesn't increase
- Battle system checks FSRS for word difficulty, spell system checks root mastery → mismatch
- Analytics show "player spent 10 hours on roots but vocabulary unchanged"

**Prevention:**
1. **Phase 28 (root magic design):** Define sync rules in `rootMasterySlice.js`:
   ```javascript
   // Rule 1: Learning derived word → increment root mastery
   middleware: (store) => (next) => (action) => {
     if (action.type === 'vocabulary/addFsrsCard') {
       const root = extractRoot(action.payload.wordId); // ك-ت-ب from كتاب
       store.dispatch(incrementRootMastery({ root, xp: 10 }));
     }
     return next(action);
   }

   // Rule 2: Root level-up → suggest derived words for review
   if (newLevel > oldLevel) {
     const derived = getDerivedWords(root);
     store.dispatch(addWordsToReviewQueue(derived));
   }
   ```
2. **Create unified "knowledge graph" selector:**
   ```javascript
   selectRootKnowledge(root) {
     const derivedWords = getDerivedWords(root);
     const fsrsCards = selectFsrsCards(state);
     const masteredWords = derivedWords.filter(w => fsrsCards[w]?.card.state === 'Review');
     return {
       rootLevel: state.rootMastery[root]?.level || 0,
       wordsKnown: masteredWords.length,
       wordsTotal: derivedWords.length,
       confidence: masteredWords.length / derivedWords.length
     };
   }
   ```
3. **Battle system uses BOTH sources:**
   ```javascript
   // Spell power = (root mastery × 70%) + (FSRS accuracy × 30%)
   const rootPower = rootMastery[element] || 0;
   const wordAccuracy = fsrsCards[wordId]?.accuracy || 0;
   const spellPower = (rootPower * 0.7) + (wordAccuracy * 0.3);
   ```

**Detection:** Root mastery level increases but vocabulary test scores don't. Check correlation: `rootMastery.level` vs `FSRS cards with same root`.

**Phase assignment:** Phase 28 (root magic) — implement sync middleware. Phase 42 (adaptive difficulty) — validate sync working.

---

### Pitfall 4: Companion AI State Explosion → 100ms+ Frame Time

**What goes wrong:** 12 companions × (dialogue state machine + battle AI + exploration AI + relationship tracking + mood system) updating every frame causes 100-150ms frame time, game becomes unplayable slideshow.

**Why it happens:**
- Each companion has:
  - Dialogue state: greeting/hub/topic/returning (4 states)
  - Battle AI: target selection, action queue, cooldowns (updated every battle frame)
  - Exploration AI: proximity detection, contextual comments (updated every world frame)
  - Relationship: 100-point meter with 6 thresholds
  - Mood: 8 moods × 5 triggers × history tracking
- Naive approach: update all 12 companions every frame
  - 12 companions × ~50 calculations per update = 600 operations/frame
  - At 60 FPS → 36,000 operations/second just for companions
- Phaser update loop runs synchronously — frame budget is 16.6ms

**Consequences:**
- Game runs at 15-20 FPS with companions active
- Battle animations stutter during companion turn
- Mobile devices overheat, drain battery in 30 minutes
- Players disable companions, defeating entire Phase 30 purpose

**Prevention:**
1. **Phase 30 (companion system):** Implement lazy update strategy
   ```javascript
   class CompanionManager {
     update(time, delta) {
       // Only update ACTIVE companion (1 in battle, 1 in exploration)
       const activeCompanions = this.getActiveCompanions(); // Max 2
       activeCompanions.forEach(c => c.update(time, delta));

       // Update inactive companions every 5 seconds (not every frame)
       if (time - this.lastInactiveUpdate > 5000) {
         this.inactiveCompanions.forEach(c => c.updatePassive(time));
         this.lastInactiveUpdate = time;
       }
     }
   }
   ```
2. **Move heavy computation to Web Workers:**
   ```javascript
   // In CompanionBattleAI.decide() — runs 1x per turn, not per frame
   async decide(battleState) {
     const action = await companionAIWorker.calculateAction(battleState);
     return action; // Offloaded to worker thread
   }
   ```
3. **Throttle exploration comments:**
   ```javascript
   // Current: check distance every frame
   update() {
     if (distanceToPlayer < 50) { this.checkForComment(); } // BAD
   }

   // Fixed: throttle to 1x per second
   update(time) {
     if (time - this.lastCommentCheck > 1000) {
       if (distanceToPlayer < 50) { this.checkForComment(); }
       this.lastCommentCheck = time;
     }
   }
   ```
4. **Profile with Phaser debug:**
   ```javascript
   this.scene.sys.game.config.fps = { target: 60, forceSetTimeOut: false };
   this.scene.sys.game.loop.delta > 20 && console.warn('Frame drop', this.scene.sys.game.loop.delta);
   ```

**Detection:** Enable Phaser FPS counter. If <55 FPS with companions active, profile with Chrome DevTools.

**Phase assignment:** Phase 30 (companions) — implement lazy updates from day 1. Phase 61 (performance) — profile and optimize.

---

### Pitfall 5: Equipment Visual Sync Desync → Naked Characters in Battle

**What goes wrong:** Player equips عباءة (cloak) in inventory UI (React), enters battle, Phaser BattleScene renders character with starter outfit because equipment state didn't sync to Phaser sprite manager.

**Why it happens:**
- Equipment state lives in Redux (`equipmentSlice`)
- WorldScene sprite created in `PlayerController.create()` — reads `player.outfit` from Redux
- BattleScene sprite created in `BattleSpriteManager.spawnPlayer()` — ALSO reads `player.outfit`
- Equipment changes dispatch to `equipmentSlice.equipped` but NOT `playerSlice.outfit`
- Two sprite managers (WorldScene + BattleScene) read different state sources
- No EventBus event bridges Redux change → Phaser sprite update

**Consequences:**
- Visual bugs: "I equipped legendary robe but it doesn't show in battle"
- Stat bugs: equipment bonuses apply in stats but sprite doesn't match
- Immersion break: cutscenes show wrong outfit
- Companion gift reactions broken: "Nice cloak!" but player visually wearing thobe

**Prevention:**
1. **Phase 29 (equipment system):** Centralize outfit state in `playerSlice`
   ```javascript
   // equipmentSlice.js
   equipItem(state, action) {
     const item = action.payload;
     state.equipped[item.slot] = item.id;

     // CRITICAL: Update playerSlice.outfit if equipment changes appearance
     if (item.slot === 'robe') {
       store.dispatch(setOutfit(item.appearanceKey)); // Sync to playerSlice
     }
   }
   ```
2. **Listen for outfit changes in BOTH sprite managers:**
   ```javascript
   // PlayerController.js (WorldScene)
   create() {
     this.outfit = store.getState().player.outfit;
     EventBus.on(EVENTS.OUTFIT_CHANGED, ({ outfit }) => {
       this.updateSprite(outfit); // Already implemented
     });
   }

   // BattleSpriteManager.js (BattleScene) — MISSING, add this
   spawnPlayer() {
     const outfit = store.getState().player.outfit;
     this.playerSprite = this.createPlayerSprite(outfit);

     EventBus.on(EVENTS.OUTFIT_CHANGED, ({ outfit }) => {
       this.updatePlayerSprite(outfit); // NEW
     });
   }
   ```
3. **Validate sync in tests:**
   ```javascript
   it('equipping robe updates BattleScene sprite', () => {
     store.dispatch(equipItem({ slot: 'robe', appearanceKey: 'scholar-robe' }));
     const battleOutfit = battleScene.sprites.playerSprite.texture.key;
     expect(battleOutfit).toBe('battle-player-scholar-robe');
   });
   ```

**Detection:** Equip item, enter battle, check if sprite texture matches equipped item. If mismatch, EventBus not wired.

**Phase assignment:** Phase 29 (equipment) — implement outfit sync. Phase 32 (advanced combat) — test with full equipment sets.

---

## Moderate Pitfalls

Cause UX friction, bugs, or technical debt but don't require rewrites.

---

### Pitfall 6: Shop Inventory ↔ World State Coupling → Stale Shop Data

**What goes wrong:** Shop inventory defined in static JSON, doesn't update when world state changes (quest completed, faction reputation increased, season changed). Players complain "shop still sells beginner items even though I'm level 20."

**Why it happens:**
- Phase 29 shop system likely starts with static inventory:
  ```json
  { "shopId": "oasis-merchant", "inventory": ["item1", "item2"] }
  ```
- World state changes (quest completion, reputation gain) live in `narrativeSlice` and `playerSlice`
- No system bridges world state → shop inventory refresh
- Shop UI caches inventory on mount, doesn't re-fetch on state change

**Prevention:**
1. **Phase 29 (economy):** Design shops with dynamic inventory functions:
   ```javascript
   // shops.js
   export const getShopInventory = (shopId, state) => {
     const base = SHOP_BASE_INVENTORY[shopId];
     const playerLevel = state.player.level;
     const reputation = state.narrative.factionReputation['merchants'] || 0;

     // Filter items by level
     let available = base.filter(item => item.minLevel <= playerLevel);

     // Add reputation-locked items
     if (reputation >= 50) {
       available = [...available, ...SHOP_REPUTATION_ITEMS[shopId]];
     }

     // Add seasonal items
     const season = getCurrentSeason();
     if (season === 'ramadan') {
       available = [...available, ...SHOP_SEASONAL_ITEMS['ramadan']];
     }

     return available;
   };
   ```
2. **Re-compute inventory when shop opens:**
   ```javascript
   // ShopOverlay.jsx
   useEffect(() => {
     const inventory = getShopInventory(shopId, store.getState());
     setShopInventory(inventory);
   }, [shopId, playerLevel, factionReputation]); // Re-compute on deps change
   ```
3. **Cache with invalidation:**
   ```javascript
   const shopInventoryCache = new Map(); // { shopId: { inventory, timestamp } }
   const CACHE_TTL = 60000; // 1 minute

   if (cache.has(shopId) && Date.now() - cache.get(shopId).timestamp < CACHE_TTL) {
     return cache.get(shopId).inventory;
   }
   ```

**Detection:** Complete reputation quest, check if shop inventory changes. If static, coupling broken.

**Phase assignment:** Phase 29 (economy) — dynamic inventory. Phase 51 (faction system) — reputation-gated items.

---

### Pitfall 7: Root Spell Combos → Combinatorial Explosion of Edge Cases

**What goes wrong:** 10 elements × 10 elements = 100 possible spell combos. Each combo has unique behavior, element interactions, status effects. Testing 100 combos × 20 enemy types × 5 player levels = 10,000 test cases. Bugs slip through.

**Why it happens:**
- Phase 28 root magic: combining fire + water creates steam, earth + wind creates sandstorm
- Each combo has unique damage formula, status effect, animation, SFX
- No systematic approach to combo behavior → each combo is hand-coded
- Parallel development: one developer codes fire combos, another codes water, conflicts arise

**Prevention:**
1. **Phase 28 (root magic):** Define combo behavior as data, not code
   ```javascript
   // elementCombos.js
   const COMBOS = {
     'fire+water': {
       result: 'steam',
       damageMultiplier: 1.2,
       statusEffect: 'حيرة', // Confusion
       particleColor: 0xcccccc
     },
     'earth+wind': {
       result: 'sandstorm',
       damageMultiplier: 1.5,
       statusEffect: 'عمى', // Blindness
       particleColor: 0xd2b48c
     },
     // ... 100 combos defined as DATA
   };

   // Generic combo resolver
   function resolveCombo(element1, element2) {
     const key = [element1, element2].sort().join('+'); // Normalize order
     return COMBOS[key] || { result: null, damageMultiplier: 1.0 };
   }
   ```
2. **Limit initial combos to 20 (10 primary + 10 adjacent), not all 100:**
   - Fire + Water, Fire + Earth, Fire + Wind (adjacent only)
   - Defer exotic combos (Shadow + Spirit) to Phase 32 (advanced combat)
3. **Property-based testing:**
   ```javascript
   it('all combos produce valid damage', () => {
     ELEMENTS.forEach(e1 => {
       ELEMENTS.forEach(e2 => {
         const combo = resolveCombo(e1, e2);
         expect(combo.damageMultiplier).toBeGreaterThan(0);
         expect(combo.damageMultiplier).toBeLessThan(3.0);
       });
     });
   });
   ```

**Detection:** If combo behaviors copy-pasted with slight tweaks, refactor to data. Check for `if (element === 'fire' && element2 === 'water')` anti-pattern.

**Phase assignment:** Phase 28 (root magic) — data-driven combos. Phase 32 (advanced combat) — expand to full 100.

---

### Pitfall 8: Companion Dialogue State Machine ↔ NPC Dialogue Conflicts

**What goes wrong:** Companion uses same dialogue engine as NPCs (DialogueEngine.js), but companions need always-available state (can't be one-time), interrupts (mid-exploration comments), and relationship-aware branching. Hacking DialogueEngine to support both causes fragile conditional logic.

**Why it happens:**
- Phase 20 DialogueEngine designed for NPCs: greeting → hub → topics → returning
- Phase 30 companions need: contextual comments (no hub), relationship gates, ambient barks
- Temptation: add `if (isCompanion)` branches in DialogueEngine
- Result: 500-line conditional spaghetti, impossible to test

**Prevention:**
1. **Phase 30 (companions):** Create separate `CompanionDialogueManager` that wraps DialogueEngine:
   ```javascript
   class CompanionDialogueManager {
     constructor(companionId, dialogueEngine) {
       this.companionId = companionId;
       this.engine = dialogueEngine; // Reuse for topic trees
       this.ambientBarks = loadAmbientBarks(companionId);
     }

     // Ambient comments (not hub-and-spoke)
     checkAmbientComment(context) {
       const bark = this.ambientBarks.find(b => b.trigger.matches(context));
       if (bark) { return bark.line; }
       return null;
     }

     // Formal conversation (uses DialogueEngine)
     startConversation() {
       return this.engine.start(this.companionId, { isCompanion: true });
     }
   }
   ```
2. **Keep DialogueEngine pure (NPC-only), extend via composition:**
   ```javascript
   // DialogueEngine.js — UNCHANGED
   evaluateCondition(condition) {
     return condition.type === 'flag' && state.narrative.flags[condition.flag];
   }

   // CompanionDialogueManager.js — EXTENDS
   evaluateCondition(condition) {
     if (condition.type === 'relationship') {
       return state.companion.relationships[this.companionId] >= condition.threshold;
     }
     return this.engine.evaluateCondition(condition); // Delegate
   }
   ```
3. **Separate dialogue data schemas:**
   ```javascript
   // npcs.json — hub-and-spoke with topics
   { "greeting": {...}, "hub": {...}, "topics": [...] }

   // companions.json — ambient + formal
   {
     "ambientBarks": [{ "trigger": {...}, "line": "..." }],
     "conversations": [{ "id": "personal-quest-1", "topics": [...] }]
   }
   ```

**Detection:** If DialogueEngine.js has >3 `if (isCompanion)` branches, refactor to separate manager.

**Phase assignment:** Phase 30 (companions) — separate manager from day 1.

---

### Pitfall 9: Item Rarity ↔ Arabic Proficiency Gate → Frustration Loop

**What goes wrong:** Legendary items require reading Arabic descriptions to activate bonuses. Player finds legendary sword, can't use bonus because doesn't know the word حاد ("sharp"). Item feels useless, player frustrated.

**Why it happens:**
- Phase 29 design: "affix vocabulary must be learned before bonus activates"
- Good intent: incentivizes learning
- Bad execution: gates power behind RNG (find item) + RNG (learn specific word)
- Player has no agency: can't choose to learn "sharp" if it's not in current lesson

**Prevention:**
1. **Phase 29 (equipment):** Make item discovery teach the word:
   ```javascript
   // When item drops
   if (!fsrsCards[item.affixWordId]) {
     // Auto-add word to deck with context
     dispatch(addFsrsCard({
       wordId: item.affixWordId,
       source: 'equipment_discovery'
     }));

     // Show "New word discovered!" toast
     EventBus.emit(EVENTS.WORD_DISCOVERED, {
       word: getWord(item.affixWordId),
       context: `You found a ${item.nameArabic}!`
     });
   }
   ```
2. **Partial bonuses for unknown affixes:**
   ```javascript
   const affix = item.affix; // { wordId: 'sharp', bonus: +10 }
   const wordKnown = fsrsCards[affix.wordId]?.card.state === 'Review';

   // Unknown: 50% bonus + hint
   // Known: 100% bonus
   const effectiveBonus = wordKnown ? affix.bonus : Math.floor(affix.bonus * 0.5);

   if (!wordKnown) {
     item.tooltip += ` (Learn "${affix.arabic}" to unlock full power)`;
   }
   ```
3. **Crafting lets player CHOOSE affixes:**
   ```javascript
   // Player selects affix from learned words
   const learnedAdjectives = getLearnedWords({ category: 'adjectives' });
   // Player picks "blessed" because they know that word
   const craftedItem = craftItem(base, { affix: 'blessed' });
   ```

**Detection:** If players hoard legendary items without using them, check if affix words are learned.

**Phase assignment:** Phase 29 (equipment) — auto-teach on discovery. Phase 31 (crafting) — player choice.

---

### Pitfall 10: Companion Recruitment ↔ Party Slot Limits → Missing Content

**What goes wrong:** 12 companions available, only 2 active slots. Players recruit first 2 companions (nearest/easiest), never meet other 10 companions, miss 10 × 3-5 quests = 30-50 quests of content.

**Why it happens:**
- Phase 30 design: max 2 active companions (performance + balance)
- No incentive to swap companions once recruited
- Later companions (zones 5-8) never encountered if party full in zone 1-2
- Companion-specific content (personal quests, story arcs) locked behind recruitment

**Prevention:**
1. **Phase 30 (companions):** Force companion rotation via story:
   ```javascript
   // Quest requires specific companion
   if (quest.requiredCompanion && !isRecruited(quest.requiredCompanion)) {
     questState = 'blocked';
     hint = `Recruit ${companionName} to continue this quest`;
   }

   // Story chapters auto-swap companions
   if (chapter === 'cordoba-arc') {
     forceActiveCompanion('aaliyah'); // Scholar companion for library arc
   }
   ```
2. **Companion camp system (Phase 50):** All companions present at base, can chat even if not active:
   ```javascript
   // Player can visit camp, talk to all 12 companions
   // Active companions join in exploration/battle
   // Inactive companions provide services (shop, crafting, training)
   ```
3. **Companion resonance bonuses:** Each companion buffs specific playstyle:
   - Aaliyah (scholar): +20% XP from grammar lessons
   - Tariq (merchant): +20% shop discounts
   - Rotate companions to optimize for current activity

**Detection:** Analytics: "avg companions recruited per player" — if <4, rotation broken.

**Phase assignment:** Phase 30 (companions) — rotation hooks. Phase 47 (companion quests) — required companions.

---

## Minor Pitfalls

Annoyances, edge cases, or subtle bugs that accumulate into death by a thousand cuts.

---

### Pitfall 11: Spell Casting Animation Lock → Input Buffer Overflow

**What goes wrong:** Player casts spell (1.5s animation), mashes attack button during animation, game buffers 5 attack inputs, executes all 5 after animation ends. Player loses control.

**Prevention:**
- **Phase 28 (root magic):** Disable input during animations, clear buffer on animation end:
  ```javascript
  castSpell(element) {
    this.inputLocked = true;
    this.inputBuffer = []; // Clear stale inputs
    playAnimation('spell-cast', () => {
      this.inputLocked = false;
    });
  }
  ```

**Phase assignment:** Phase 28 (root magic), Phase 32 (advanced combat)

---

### Pitfall 12: Equipment Affix Randomization → Unbalanced Loot

**What goes wrong:** Random affix generation creates "blessed blessed blessed sword" (+30 defense from 3x stacking) or "cursed weak broken dagger" (3 negative affixes). Players save-scum for god rolls.

**Prevention:**
- **Phase 29 (equipment):** Constrain affix pools:
  ```javascript
  const affixes = [];
  const rarityBudget = RARITY_AFFIX_COUNT[item.rarity]; // Common: 1, Legendary: 3

  // Max 1 of each polarity (positive/negative)
  let positiveCount = 0, negativeCount = 0;
  while (affixes.length < rarityBudget) {
    const affix = rollAffix();
    if (affix.isPositive && positiveCount < 2) { affixes.push(affix); positiveCount++; }
    if (affix.isNegative && negativeCount < 1) { affixes.push(affix); negativeCount++; }
  }
  ```

**Phase assignment:** Phase 29 (equipment) — item generation

---

### Pitfall 13: Companion Relationship Decay → Invisible Progress Loss

**What goes wrong:** Companion relationship decays if not interacted with for 7 days. Player takes break, returns, relationship dropped from 80 → 40, doesn't understand why.

**Prevention:**
- **Phase 30 (companions):** Pause decay during player inactivity:
  ```javascript
  const lastLogin = state.player.lastLoginTimestamp;
  const daysSinceLogin = (Date.now() - lastLogin) / (1000 * 60 * 60 * 24);

  // Only decay if player actively played with other companions
  if (daysSinceLogin < 1) {
    applyRelationshipDecay();
  }
  ```
- Show decay warnings: "Tariq misses you. Visit him to maintain friendship."

**Phase assignment:** Phase 30 (companions) — relationship system

---

### Pitfall 14: Root Element ↔ Weather Interaction Missing

**What goes wrong:** Phase 28 defines fire spells weak in rain, but Phase 34 weather system built in isolation. No integration = weather feels cosmetic.

**Prevention:**
- **Phase 28 (root magic):** Define interaction API:
  ```javascript
  // elementInteractions.js
  export const getWeatherModifier = (element, weather) => {
    const MODIFIERS = {
      'fire': { 'rain': 0.5, 'sunny': 1.5 },
      'water': { 'rain': 1.3, 'drought': 0.7 }
    };
    return MODIFIERS[element]?.[weather] || 1.0;
  };
  ```
- **Phase 34 (weather):** Weather system calls this API when rendering effects

**Phase assignment:** Phase 28 (API definition), Phase 34 (implementation)

---

### Pitfall 15: Shop Price Negotiation ↔ Arabic Number Input Edge Cases

**What goes wrong:** Haggling mini-game accepts Arabic numerals (٠-٩) but doesn't handle mixed Eastern/Western (1٢3), copy-paste, or decimal separators (١٬٢٣٤).

**Prevention:**
- **Phase 29 (economy):** Normalize input:
  ```javascript
  const normalizeArabicNumber = (input) => {
    const eastern = input.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
    const cleaned = eastern.replace(/[^\d]/g, ''); // Strip non-digits
    return parseInt(cleaned, 10);
  };
  ```

**Phase assignment:** Phase 29 (economy) — input validation

---

### Pitfall 16: Inventory Grid Layout ↔ Arabic RTL Text Overflow

**What goes wrong:** Item names in Arabic overflow grid cells because RTL text rendering + long compound words (الاستعمالات) don't wrap.

**Prevention:**
- **Phase 29 (inventory):** Fixed-width cells with ellipsis:
  ```css
  .inventory-item-name {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    direction: rtl; /* Force RTL */
  }
  ```

**Phase assignment:** Phase 29 (inventory) — UI layout

---

### Pitfall 17: Companion Battle AI ↔ Player Input Race Condition

**What goes wrong:** Player selects "Attack", companion AI calculates action simultaneously, both dispatch to battleSlice, Redux processes in random order, companion action overwrites player action.

**Prevention:**
- **Phase 30 (companions):** Strict turn order with locks:
  ```javascript
  // BattleStateMachine.js
  _startPlayerTurn() {
    this.turnLock = 'player';
    EventBus.emit(EVENTS.BATTLE_PLAYER_TURN);
  }

  handleAction(action) {
    if (this.turnLock !== 'player') {
      console.warn('Ignoring action: not player turn');
      return;
    }
    // Process action
  }
  ```

**Phase assignment:** Phase 30 (companions) — battle AI integration

---

### Pitfall 18: Equipment Sprite Layering ↔ Phaser Depth Sorting

**What goes wrong:** Player equips cloak, renders behind character body instead of in front. Equip boots, renders on top of robe.

**Prevention:**
- **Phase 29 (equipment):** Define sprite layer order:
  ```javascript
  const EQUIPMENT_LAYERS = {
    'boots': 0,
    'robe': 10,
    'belt': 20,
    'cloak': 30,
    'head': 40
  };

  equipmentSprite.setDepth(EQUIPMENT_LAYERS[slot]);
  ```

**Phase assignment:** Phase 29 (equipment) — sprite rendering

---

### Pitfall 19: Root Mastery XP Curve ↔ Vocabulary XP Curve Mismatch

**What goes wrong:** Root mastery levels up in 2 hours, player level takes 10 hours. Root system feels disconnected from progression.

**Prevention:**
- **Phase 28 (root magic):** Sync XP curves:
  ```javascript
  const rootXPRequired = (level) => playerXPRequired(level) / 10; // Roots level 10x faster
  ```

**Phase assignment:** Phase 28 (root magic) — progression tuning

---

### Pitfall 20: Companion Dialogue ↔ Player Dialogue Choice Tracking Overlap

**What goes wrong:** DialogueEngine tracks player choices in `narrativeSlice.dialogueHistory`, CompanionDialogueManager tracks in `companionSlice.dialogueChoices`. Analytics can't correlate.

**Prevention:**
- **Phase 30 (companions):** Unified choice tracking:
  ```javascript
  // Both systems dispatch to same action
  dispatch(recordDialogueChoice({
    npcId: npcId || companionId,
    choiceId,
    timestamp
  }));
  ```

**Phase assignment:** Phase 30 (companions) — analytics integration

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **Phase 27: Battle Engine** | FSM state transitions skip validation → illegal states | Add state transition guards: `canTransition(from, to)` |
| **Phase 28: Root Magic** | 10 elements × 10 forms × 300 roots = 30K possible spells, untestable | Limit to 50 "canonical" spells, procedural generation for rest |
| **Phase 29: Equipment** | Equipment bonuses stack multiplicatively → exponential power creep | Cap total bonus: `min(rawBonus, MAX_BONUS)` |
| **Phase 30: Companions** | 12 companions × 200 dialogue lines = 2,400 lines, missing translations | Phase 46 translation validation pass required |
| **Phase 31: Crafting** | Recipe discovery too random → players miss core recipes | Guarantee first recipe per profession via tutorial quest |
| **Phase 32: Status Effects** | 20 status effects × 20 status effects = 400 interactions | Only implement 30 "interesting" interactions, rest are no-ops |

---

## Cross-System Integration Checklist

When adding a new system to existing codebase, validate:

- [ ] **Redux:** New slice added to `store.js`, added to persist whitelist if needed
- [ ] **EventBus:** New events namespaced in `eventBusTypes.js`, no collisions
- [ ] **Phaser:** New scene added to BootScene.preload(), scene stack ordering correct
- [ ] **Data files:** New JSON files <100KB each, split if larger
- [ ] **FSRS sync:** If system affects vocabulary, sync with vocabularySlice
- [ ] **World state:** If system affects NPC dialogue, update narrativeSlice
- [ ] **Battle integration:** If system affects combat, update BattleStateMachine
- [ ] **Companion integration:** If system affects companions, update CompanionManager
- [ ] **Tests:** New slice has reducer tests, EventBus listeners have integration tests
- [ ] **Performance:** New update loop <5ms per frame (profile with Chrome DevTools)
- [ ] **Storage:** New persisted data estimated size, validate <5MB total
- [ ] **Assets:** New sprites added to BootScene, lazy-load if >50 assets
- [ ] **Analytics:** New user actions tracked in analytics middleware

---

## High-Risk Periods

**Phase 27-29 (first 3 phases):** Highest integration risk. Battle, magic, and equipment all touch Redux, EventBus, and Phaser. Recommend:
1. Phase 27: Stabilize battle + IndexedDB migration (no new features)
2. Phase 28: Add root magic in isolation (no battle integration yet)
3. Phase 29: Integrate equipment + magic + battle together (integration phase)

**Phase 30 (companions):** Second-highest risk. Touches dialogue, battle, world, and narrative. Recommend:
1. Build CompanionManager in isolation first
2. Integrate with battle (Phase 30a)
3. Integrate with world exploration (Phase 30b)
4. Add companion quests last (Phase 47, much later)

**Phase 31-32:** Lower risk if Phases 27-30 stable. Crafting and status effects are additive.

---

## Success Metrics

Integration successful when:

- [ ] All 592 existing tests pass after each phase
- [ ] localStorage usage <2MB (FSRS in IndexedDB)
- [ ] Phaser FPS >55 with 2 active companions
- [ ] No EventBus namespace collisions (validated in tests)
- [ ] Equipment/root/companion data syncs bidirectionally with FSRS
- [ ] Players recruit average 6+ companions by endgame (rotation working)
- [ ] Battle system supports root spells + equipment + companions without frame drops
- [ ] Save/load preserves all new state (equipment, companions, roots)

---

*Generated: 2026-02-12*
*Confidence: HIGH (based on codebase analysis + domain expertise)*
*Sources: Existing codebase, EXPANSION-COMBAT-RPG.md, TECHNICAL-DEBT-AUDIT.md, domain knowledge of Phaser + React + Redux integration patterns*
