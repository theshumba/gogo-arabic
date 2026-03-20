# Phase 54: World Life Systems — Research

**Researched:** 2026-03-20
**Domain:** Dynamic economy (supply/demand pricing), NPC gossip system, environmental inscriptions, progressive tashkeel fading
**Confidence:** HIGH

---

## Summary

Phase 54 builds four interconnected "world aliveness" systems on top of the Phase 53 foundation. All required infrastructure — factionSlice, economySlice, npcSlice, worldStateSlice, InkDialogueEngine, TashkeelText, EventBus, WORLD_STATE_KEYS — is already in place. No new libraries are needed.

The four systems divide cleanly into independent plans. PricingAgent (plan 01) lives in EconomyFlow.js and writes supply counters into the existing economySlice; ShopOverlay reads from these counters at render time. GossipManager (plan 02) is a new Redux middleware (the same pattern as factionMiddleware) that watches for quest-complete/NPC-interaction events and creates token objects in a new `gossipSlice`; tokens are injected into NPC ink dialogues at conversation start via a new EXTERNAL function binding. Environmental inscriptions (plan 03) extend the 8 existing zone inscriptions to 20+ using the already-established `type: 'inscription'` data pattern in zones.js and the OBJECT_INTERACT EventBus event; touching them dispatches addFsrsCard and optionally addFsrsCard-batch for root family words. Progressive tashkeel (plan 04) extends the existing TashkeelText component and useFormatArabic hook by threading `learningPath` from playerSlice into the opacity calculation.

**Primary recommendation:** All four plans are independent and can be implemented in parallel execution. Start with plan 01 (pricing) and plan 04 (tashkeel) — they are the smallest surface areas. Plan 02 (gossip) is the most architecturally novel but follows the middleware pattern exactly. Plan 03 (inscriptions) is the most content-heavy but mechanically straightforward.

---

## Existing Codebase State (CRITICAL — Read Before Planning)

### What Already Exists

| File | Status | Relevance to Phase 54 |
|------|--------|----------------------|
| `src/store/slices/economySlice.js` | EXISTS — `shopInventories`, `priceModifiers`, `hagglingHistory` | Needs `supplyLevels` field added; `priceModifiers` already exists for per-shop multiplier |
| `src/data/shopGenerator.js` | EXISTS — generates inventory with faction discount at 75 | Needs to call PricingAgent for dynamic price calculation |
| `src/game/systems/EconomyFlow.js` | EXISTS — `resourcePool` per zone, `tick()`, `consumeResources()` | PricingAgent will live here or alongside it; resourcePool is the supply tracking foundation |
| `src/components/Shop/ShopOverlay.jsx` | EXISTS — renders buy/sell tabs, handles purchase/sell | Needs price change indicator (up/down arrow) in ShopInventory |
| `src/store/slices/factionSlice.js` | EXISTS — `alignment` map, `selectPrimaryFaction` | PricingAgent reads `state.faction.alignment` for faction modifier |
| `src/data/factions.js` | EXISTS — 6 factions, shop-to-faction mapping in shopGenerator | `getShopFaction()` already in shopGenerator.js |
| `src/store/slices/npcSlice.js` | EXISTS — `friendship` map `{npcId: 0-100}`, `adjustFriendship` | Gossip threshold check: `state.npc.friendship[npcId] >= 25` |
| `src/store/slices/narrativeSlice.js` | EXISTS — `npcRelationships` (0-5 scale) | NOTE: Two parallel relationship systems exist — see critical gap below |
| `src/game/systems/InkDialogueEngine.js` | EXISTS — `_bindExternalFunctions()`, `syncStateIn()` | Gossip tokens injected via new EXTERNAL binding or syncStateIn expansion |
| `src/data/ink-source/` | EXISTS — 6 ink files (scholar-yusuf, guide-amira, etc.) | Gossip NPC ink files need new knots/variables |
| `src/components/Arabic/TashkeelText.jsx` | EXISTS — renders tashkeel with opacity from `getTashkeelOpacity` | Needs learning path input to compute fading rate |
| `src/hooks/useFormatArabic.js` | EXISTS — `getTashkeelOpacity(wordId)` using FSRS reps+stability | Needs path-aware rate modifier: Scholar fades slower |
| `src/store/slices/playerSlice.js` | EXISTS — `learningPath: null \| 'scholar' \| 'traveler' \| 'historian'` | Source of path for tashkeel rate modifier |
| `src/data/zones.js` | EXISTS — 8 zones each with 1 `type: 'inscription'` object | 8 inscriptions exist; need 12+ more (minimum 3 per zone, currently 1 per zone) |
| `src/data/worldStateKeys.js` | EXISTS — `GOSSIP_*_HEARD` flags, inscription discovery flags per zone | Already has `GOSSIP_LIBRARY_RUMOR_HEARD` etc. and `OASIS_INSCRIPTION_OASIS_1_DISCOVERED` etc. |
| `src/utils/eventBusTypes.js` | EXISTS — `EVENTS.OBJECT_INTERACT` | Inscription interaction uses this event |
| `src/store/slices/timeSlice.js` | EXISTS — `selectDayCount`, `advanceTime` | Supply restoration uses day count for partial restore on rest |
| `src/store/middleware/factionMiddleware.js` | EXISTS — re-entrancy guard, pass-through first pattern | GossipManager middleware follows this pattern exactly |
| `src/data/rootsData.js` | EXISTS — `getRootWords(root)` returns derived word IDs | Inscription root family teaching dispatches these |

### What Does NOT Exist

- `PricingAgent` — no supply/demand price calculator exists anywhere
- `gossipSlice.js` — no gossip token storage in Redux
- `GossipManager` middleware — no gossip propagation logic
- Gossip EXTERNAL function in InkDialogueEngine — `getGossipToken(npcId)` not bound
- Path-aware tashkeel fading rates — `getTashkeelOpacity` ignores `learningPath`
- 12+ additional inscriptions in zones.js — only 1 per zone (8 total)
- `WORLD_STATE_KEYS.GOSSIP_TOKEN_*` per-NPC token flags — not yet defined

### Critical Gap: Two NPC Relationship Systems

This codebase has TWO relationship systems:
1. **`narrativeSlice.npcRelationships[npcId]`** — 0-5 scale, used by InkDialogueEngine EXTERNAL binding `changeRelationship`
2. **`npcSlice.friendship[npcId]`** — 0-100 scale, starts at 50, used by friendshipMiddleware and selectFriendship

The REQUIREMENTS use "relationship ≥ 25" which maps to `npcSlice.friendship`. GossipManager must read from `state.npc.friendship`, NOT `state.narrative.npcRelationships`. The planner must document this choice explicitly in the plan.

---

## Standard Stack

### Core (all already installed)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| `@reduxjs/toolkit` | existing | New gossipSlice, selectors | In use |
| `redux-persist` | existing | gossipSlice does NOT need persistence — tokens are ephemeral (3-day expiry = session-bounded) | In use |
| `react-redux` | existing | ShopOverlay reads new supply state | In use |
| `inkjs` | 2.4.0 | Gossip tokens surface as ink lines | Installed Phase 51 |
| `framer-motion` | existing | Price change indicators in ShopInventory | In use |

### Reference Pattern Files

| Pattern | Source File | Used For |
|---------|-------------|---------|
| Middleware re-entrancy guard + pass-through first | `factionMiddleware.js` | GossipManager structure |
| addFsrsCard dispatch in a non-React context | `FloatingWordObject.js` (store.dispatch directly) | Inscription FSRS dispatch |
| Batch FSRS card dispatch loop | `rootFsrsSyncMiddleware.js` lines 130-138 | Root family word batch dispatch |
| IndexedDB nested persist | `store.js` companionPersistConfig | NOT needed for gossipSlice — use in-memory |
| createDefaultCard() | `factionMiddleware.js` lines 71-82 | Inscription word card creation |
| Supply consumption / resource pool | `EconomyFlow.js` consumeResources() | Supply decrease on purchase |
| Price modifier in economySlice | `economySlice.js` priceModifiers + setPriceModifier | Base for new dynamic price fields |
| EXTERNAL function binding | `InkDialogueEngine.js` _bindExternalFunctions() | Gossip token injection into ink |
| Ink variable sync in | `InkDialogueEngine.js` syncStateIn() | Gossip token as ink variable |
| Zone inscription data shape | `zones.js` lines 128-143 | New inscription objects must match this shape |
| inscription type object handling | `InteractableManager.js` | Must handle `type: 'inscription'` the same way |

---

## Architecture Patterns

### Recommended Project Structure Changes

```
src/
├── store/
│   ├── slices/
│   │   ├── economySlice.js          [EXTEND: add supplyLevels field]
│   │   └── gossipSlice.js           [NEW: gossip token storage]
│   └── middleware/
│       └── gossipMiddleware.js      [NEW: token creation + propagation]
├── game/
│   └── systems/
│       └── EconomyFlow.js           [EXTEND: add PricingAgent methods]
├── data/
│   ├── shopGenerator.js             [EXTEND: call PricingAgent for prices]
│   ├── zones.js                     [EXTEND: add 12+ new inscriptions]
│   ├── inscriptionData.js           [NEW: inscription content data separate from zone coords]
│   └── ink-source/                  [EXTEND: add gossip knots to NPC ink files]
├── components/
│   ├── Shop/
│   │   └── ShopInventory.jsx        [EXTEND: show price direction indicator]
│   └── Arabic/
│       └── TashkeelText.jsx         [EXTEND: path-aware fading rate]
└── hooks/
    └── useFormatArabic.js           [EXTEND: path-aware getTashkeelOpacity]
```

### Pattern 1: PricingAgent Supply/Demand Model (ECON-01, ECON-02, ECON-03)

**What:** A pure function `calculateDynamicPrice(basePrice, supplyLevel, maxSupply, factionId, shopId, factionAlignment)` returns a final price clamped to [50%, 200%] of base. Supply decreases on purchase; partially restores on rest (game day advance).

**Formula (ECON-01):** `price = base × (maxSupply / currentSupply) × factionModifier`

**Supply restoration (ECON-02):** On REST_TAKEN or `time/advanceTime` action where day increments, restore `Math.ceil(maxSupply * 0.25)` per day to a cap of maxSupply.

**Faction modifier (ECON-03):** Allied (score ≥ 75) with the shop's faction → 0.85 multiplier. Hostile is not in requirements, so no hostile markup needed.

**Where to store supply levels:** Add `supplyLevels: {}` field to `economySlice` as `{ [shopId]: { [itemId]: { current: number, max: number } } }`. This persists naturally with the existing localStorage persistence of economySlice.

**Example:**
```javascript
// Source: EconomyFlow.js pattern + ECON-01 formula
export function calculateDynamicPrice(basePrice, supplyLevel, factionModifier = 1.0) {
  const { current, max } = supplyLevel;
  const supplyRatio = max / Math.max(1, current); // avoid divide-by-zero
  const raw = basePrice * supplyRatio * factionModifier;
  const floor = basePrice * 0.5;
  const ceiling = basePrice * 2.0;
  return Math.round(Math.max(floor, Math.min(ceiling, raw)));
}
```

**Price indicator (ECON-04):** ShopInventory renders a `▲` (red) or `▼` (green) indicator when `dynamicPrice !== basePrice`. Store the base price in item data and compare at render.

### Pattern 2: GossipManager — Token Creation and Ink Surfacing (GOSP-01 through GOSP-05)

**What:** A Redux middleware watches for world events (quest complete, notable NPC interaction) and creates gossip tokens in `gossipSlice`. When a player initiates dialogue with an NPC who holds a token, the token's content is injected into the ink story as a variable before `syncStateIn()` runs.

**Token shape:**
```javascript
{
  tokenId: 'gossip_quest_words_of_oasis_20260320',
  topic: 'quest_words_of_oasis_complete',        // world state flag that triggered it
  arabicLine: 'سَمِعتُ أنَّكَ أتمَمتَ...',       // the gossip line in Arabic
  englishHint: 'I heard you completed...',
  grammarNote: 'Past tense verb: أتمَمتَ (atamamta)',
  createdDay: 5,                                  // selectDayCount at token creation
  expiresDay: 8,                                  // createdDay + 3
  heard: false,                                   // marked true after NPC delivers it
}
```

**NPC propagation (GOSP-02):** gossipMiddleware reads `state.npc.friendship` after a triggering event; NPCs with friendship ≥ 25 receive the token in `gossipSlice.npcTokens[npcId]`. Max 2 tokens per NPC — if at cap, oldest one drops.

**Ink surfacing (GOSP-03):** InkDialogueEngine._bindExternalFunctions() gets a new binding:
```javascript
this._story.BindExternalFunction('getGossipToken', (npcId) => {
  const tokens = store.getState().gossip?.npcTokens?.[npcId] || [];
  const active = tokens.find(t => !t.heard && t.expiresDay > currentDay);
  return active ? active.arabicLine : '';
});
```
The ink source file for each NPC gets a new knot at the top that checks this:
```ink
VAR gossip_line = ""
~ gossip_line = getGossipToken(npcId)
{gossip_line != "":
  -> gossip_knot
}
-> main

=== gossip_knot ===
{gossip_line}
~ markGossipHeard(npcId)
-> main
```

**3-day expiry (GOSP-02):** gossipMiddleware pruning pass on every `time/tickTime` or `time/advanceTime` dispatch — remove tokens where `token.expiresDay <= selectDayCount(state)`.

**Not a separate UI (GOSP-03):** Gossip NEVER renders in a separate panel. It only appears as ink dialogue lines within existing DialogueOverlay.

### Pattern 3: Environmental Inscriptions (ENVR-01 through ENVR-04)

**What:** Extend zones.js from 8 inscriptions to 20+ (minimum 3 per zone = 24 total to safely exceed 20). Each inscription is an interactive object with ink content, an FSRS dispatch for unknown words, and optional root family batch dispatch.

**Ink integration (ENVR-02):** Each inscription has an associated `.ink.json` file (or reuses the NPC ink pattern with an inscription-specific knot). The comprehension level check uses `getLearningPath()` and `getFlag()` from InkDialogueEngine EXTERNAL bindings — not new infrastructure.

**Simpler approach:** Most inscriptions do NOT need separate ink files. They trigger the existing `OBJECT_INTERACT` EventBus event, which opens `ObjectInteractionOverlay`. The overlay already handles `taughtWord`, `culturalNote`, and `descriptionArabic`. For unknown-word FSRS dispatch, the interaction handler reads vocabulary state and dispatches `addFsrsCard` for unlearned words in the inscription's `wordIds` array.

**Only inscriptions that need ink are those with player-choice branches** (e.g., "study further" vs "move on"). For a minimum 20 inscriptions, use ink only for 2-3 "enhanced" inscriptions; the rest use ObjectInteractionOverlay.

**FSRS dispatch on encounter (ENVR-03):**
```javascript
// In the inscription interaction handler (InteractableManager or a new InscriptionInteraction class)
const unknownWords = inscription.wordIds.filter(wId => !fsrsCards[wId]);
unknownWords.forEach(wordId => {
  store.dispatch(addFsrsCard({
    wordId,
    card: createDefaultCard(),
    source: `inscription_${inscription.id}`,
  }));
});
```

**Root family teaching (ENVR-04):** For inscriptions that have a `rootFamily` field, call `getRootWords(inscription.rootFamily)` from rootsData.js, then dispatch addFsrsCard for each root word not yet known. This is the same pattern already in rootFsrsSyncMiddleware.

**TASH-03 integration:** Inscriptions pass the player's current proficiency level to determine displayed tashkeel. Use TashkeelText with a wordId for each Arabic word in the inscription text.

### Pattern 4: Progressive Tashkeel Refinement (TASH-01, TASH-02, TASH-03)

**What:** Extend `useFormatArabic.js` getTashkeelOpacity to be path-aware. Scholar fades slower; Traveler fades at the baseline rate; Historian is between.

**Path fading rate multiplier:**

| Learning Path | Rate Multiplier | Effect |
|---------------|----------------|--------|
| null (unknown) | 1.0 | Baseline |
| 'scholar' | 0.5 | Tashkeel fades at half speed — stays visible longer |
| 'historian' | 0.75 | Slightly slower than baseline |
| 'traveler' | 1.0 | Baseline fading rate |

**Implementation in getTashkeelOpacity:**
```javascript
// Source: useFormatArabic.js pattern — add learningPath selector
const learningPath = useSelector(s => s.player.learningPath);

// After existing ambiguous check:
const FADING_RATE = { scholar: 0.5, historian: 0.75, traveler: 1.0 };
const rateMultiplier = FADING_RATE[learningPath] ?? 1.0;

// Adjusted thresholds — Scholar needs 2x the reps to fade:
const adjustedReps = reps * rateMultiplier;  // reps / rateMultiplier would be wrong direction
// Actually invert: Scholar fades MORE SLOWLY, so thresholds are HIGHER:
const fadeThreshold_learning = Math.round(3 / rateMultiplier);   // Scholar: 6, Traveler: 3
const fadeThreshold_familiar = Math.round(7 / rateMultiplier);   // Scholar: 14, Traveler: 7
const fadeThreshold_mastered = Math.round(12 / rateMultiplier);  // Scholar: 24, Traveler: 12
```

**TASH-01 (ambiguous words always retain tashkeel):** Already implemented in TashkeelText.jsx (Phase 52-03). The guard `if (wordMeta?.ambiguous) return 1.0;` is already in both TashkeelText and useFormatArabic.

**TASH-03 (inscription tashkeel matches proficiency):** ObjectInteractionOverlay and any inscription ink dialogue passes `wordId` to TashkeelText — the existing progressive opacity then applies automatically. No special handling needed beyond using TashkeelText with wordIds.

### Anti-Patterns to Avoid

- **Separate gossip UI:** Gossip is ink dialogue lines only. Never build a standalone "rumor board" or gossip panel.
- **Full RL economy:** Requirements say `price = base × (maxSupply/currentSupply) × factionModifier` — use exactly this formula. No ML, no auction mechanics.
- **Hard-coding gossip text in middleware:** Gossip line templates belong in a data file (`gossipTemplates.js`), not embedded in middleware code.
- **Big-bang ink migration for inscriptions:** Most inscriptions use ObjectInteractionOverlay (existing pattern). Only inscriptions with player-choice branches need ink files.
- **Reading npcRelationships for gossip threshold:** Use `state.npc.friendship[npcId]` (0-100 scale) for the ≥25 check, NOT `state.narrative.npcRelationships` (0-5 scale).
- **Re-entrancy in gossipMiddleware:** Must use `_isProcessingGossip` flag like factionMiddleware to prevent dispatch cascade.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| FSRS card creation | Custom card object literal each time | `createDefaultCard()` pattern from factionMiddleware | Consistent state shape |
| Root word lookup | Manual vocabulary filter | `getRootWords(root)` from rootsData.js | Already handles root index |
| NPC friendship lookup | Re-querying npcSlice | `state.npc.friendship[npcId]` — already in npcSlice | Direct O(1) access |
| Shop faction mapping | New map | `getShopFaction(shopId)` in shopGenerator.js | Already exists for all 8 shops |
| Ink story continuation | Custom story walker | `engine.getDialogueLines()` from InkDialogueEngine | Handles syncStateIn + continue loop |
| Day count for gossip expiry | Time calculation from scratch | `selectDayCount(state)` from timeSlice | Already derived correctly |
| Price direction indicator | Complex diff logic | `dynamicPrice > basePrice ? 'up' : dynamicPrice < basePrice ? 'down' : 'same'` | 3-state comparison |

---

## Common Pitfalls

### Pitfall 1: Wrong Relationship System for Gossip
**What goes wrong:** gossipMiddleware filters NPCs using `state.narrative.npcRelationships` (0-5 scale). Score of 2 (= 40% of max) means the NPC has relationship 2/5, but requirement says "≥ 25" which clearly refers to the 0-100 scale in npcSlice.
**Why it happens:** Two parallel relationship systems exist; narrativeSlice has a 50-flag budget warning so it's visible, but npcSlice.friendship is where the actual 0-100 values live.
**How to avoid:** Use `state.npc.friendship[npcId] ?? 50` (default 50 = neutral, already correct). Document in gossipSlice.js which system is authoritative.

### Pitfall 2: Supply Level Initialization
**What goes wrong:** First shop open for a player with no existing supply data returns `undefined` → NaN price.
**Why it happens:** economySlice starts with empty `supplyLevels: {}`.
**How to avoid:** In PricingAgent / ShopOverlay, always default to `{ current: maxSupply, max: maxSupply }` when no supply record exists (full supply = base price = fair starting state). Initialize in economySlice as part of the SHOP_OPEN event handler.

### Pitfall 3: Gossip Token Expiry Using Wall Clock
**What goes wrong:** Token expiry calculated using `Date.now()` + 3 days real time → tokens never expire in short play sessions, expire unexpectedly in long ones.
**Why it happens:** Requirements say "3 game-days" not "3 real days".
**How to avoid:** Store `createdDay: selectDayCount(state)` at token creation. Check `token.expiresDay <= selectDayCount(state)` in gossipMiddleware prune pass.

### Pitfall 4: Ink File Missing EXTERNAL Declaration
**What goes wrong:** inkjs Compiler throws on `~ getGossipToken(npcId)` call without `EXTERNAL getGossipToken(npcId)` at top of ink source file.
**Why it happens:** This is documented in STATE.md and encountered in Phase 51. Every EXTERNAL function call requires declaration.
**How to avoid:** Always add `EXTERNAL markGossipHeard(npcId)` and `EXTERNAL getGossipToken(npcId)` at the top of any ink file that uses gossip. Then bind in `_bindExternalFunctions()`.

### Pitfall 5: Inscription Zone Coverage Count
**What goes wrong:** ENVR-01 requires "at least 20 inscriptions across all 8 zones". There are currently 8 (one per zone). Adding only 12 more risks a single zone having 5+ and another having 1.
**Why it happens:** Content added unevenly during development.
**How to avoid:** Explicitly plan minimum distribution: 2-3 per zone × 8 zones = 16-24. Target 3 per zone = 24 total to safely exceed 20. Distribute thematically (library zone gets scholarly inscriptions, marketplace gets trade inscriptions).

### Pitfall 6: PricingAgent Divide-By-Zero
**What goes wrong:** `max / current` when `current = 0` → price = Infinity → ceiling clamp saves us BUT shows ceiling price even when out of stock is semantically wrong (should show "out of stock" not just "expensive").
**Why it happens:** Items can be bought to zero supply.
**How to avoid:** When `current === 0`, show price at ceiling AND add `outOfStock: true` flag to the item display. Don't disable the purchase — let ceiling price act as the natural deterrent until supply restores.

### Pitfall 7: TashkeelText learningPath Stale Closure
**What goes wrong:** useFormatArabic memoizes getTashkeelOpacity on `[fsrsCards]` but now needs `learningPath` too. If `learningPath` changes and `fsrsCards` did not, the cached function returns the old path's rates.
**Why it happens:** Missing dependency in useCallback deps array.
**How to avoid:** Add `learningPath` to the `useCallback` dependency array in `getTashkeelOpacity`.

---

## Code Examples

### Supply/Demand Price Calculation

```javascript
// Source: ECON-01 formula, clamp from ECON-02
export function calculateDynamicPrice(basePrice, supply, factionModifier = 1.0) {
  // supply: { current: number, max: number }
  const safeCurrent = Math.max(1, supply.current);
  const supplyRatio = supply.max / safeCurrent;
  const raw = Math.round(basePrice * supplyRatio * factionModifier);
  const floor = Math.round(basePrice * 0.5);
  const ceiling = Math.round(basePrice * 2.0);
  return { price: Math.max(floor, Math.min(ceiling, raw)), outOfStock: supply.current === 0 };
}

// Faction modifier lookup
function getFactionModifier(shopId, factionAlignment) {
  const shopFaction = getShopFaction(shopId); // already in shopGenerator.js
  if (!shopFaction) return 1.0;
  const score = factionAlignment[shopFaction] ?? 0;
  return score >= 75 ? 0.85 : 1.0; // ECON-03: Allied = 15% discount
}
```

### GossipManager Middleware Skeleton

```javascript
// Source: factionMiddleware.js pattern
let _isProcessingGossip = false;

export const gossipMiddleware = (store) => (next) => (action) => {
  if (action.type?.startsWith('persist/')) return next(action);
  const result = next(action);
  if (_isProcessingGossip) return result;
  _isProcessingGossip = true;

  try {
    if (action.type === 'quests/completeQuest') {
      const questId = action.payload?.questId || action.payload;
      const template = GOSSIP_TEMPLATES[questId];
      if (template) {
        _propagateGossip(store, template);
      }
    }
    if (action.type === 'time/tickTime' || action.type === 'time/advanceTime') {
      _pruneExpiredTokens(store);
    }
  } finally {
    _isProcessingGossip = false;
  }
  return result;
};

function _propagateGossip(store, template) {
  const state = store.getState();
  const currentDay = selectDayCount(state);
  const friendships = state.npc?.friendship ?? {};

  const token = {
    tokenId: `${template.topic}_${Date.now()}`,
    topic: template.topic,
    arabicLine: template.arabicLine,
    englishHint: template.englishHint,
    grammarNote: template.grammarNote,
    createdDay: currentDay,
    expiresDay: currentDay + 3,
    heard: false,
  };

  Object.entries(friendships)
    .filter(([, score]) => score >= 25)
    .forEach(([npcId]) => {
      store.dispatch(addGossipToken({ npcId, token }));
    });
}
```

### Ink Gossip Knot Pattern

```ink
// Source: established ink pattern from Phase 51 + gossip extension
EXTERNAL getGossipToken(npcId)
EXTERNAL markGossipHeard(npcId)
EXTERNAL changeRelationship(npcId, amount)
// ... other existing EXTERNALs ...

VAR gossip_line = ""
~ gossip_line = getGossipToken("scholar-yusuf")
{gossip_line != "":
  -> check_gossip
}
-> main

=== check_gossip ===
{gossip_line}
~ markGossipHeard("scholar-yusuf")
-> main

=== main ===
// ... existing dialogue ...
```

### Path-Aware Tashkeel Opacity

```javascript
// Source: useFormatArabic.js — extend existing getTashkeelOpacity
const learningPath = useSelector(s => s.player.learningPath);

// Scholar needs 2x more reps before tashkeel fades — multiplier DIVIDES the threshold
const FADE_DIVISOR = { scholar: 2.0, historian: 1.33, traveler: 1.0 };
const divisor = FADE_DIVISOR[learningPath] ?? 1.0;

// Recalculate thresholds with path adjustment
const t_learning  = Math.round(3  * divisor);  // Scholar: 6,  Traveler: 3
const t_familiar  = Math.round(7  * divisor);  // Scholar: 14, Traveler: 7
const t_mastered  = Math.round(13 * divisor);  // Scholar: 26, Traveler: 13
const t_stability = Math.round(30 * divisor);  // Scholar: 60, Traveler: 30

if (reps >= t_mastered && stability > t_stability) return 0;
if (reps >= t_familiar) return 0.25;
if (reps >= t_learning) return 0.5;
return 1.0;
```

### Inscription Interaction FSRS Dispatch

```javascript
// Source: FloatingWordObject.js dispatch pattern + rootFsrsSyncMiddleware batch pattern
function handleInscriptionInteraction(inscription, state) {
  const fsrsCards = state.vocabulary?.fsrsCards ?? {};

  // Dispatch unknown words from inscription text
  (inscription.wordIds || [])
    .filter(wordId => !fsrsCards[wordId])
    .forEach(wordId => {
      store.dispatch(addFsrsCard({
        wordId,
        card: createDefaultCard(),
        source: `inscription_${inscription.id}`,
      }));
    });

  // Dispatch root family words if inscription teaches a root
  if (inscription.rootFamily) {
    const rootWords = getRootWords(inscription.rootFamily);
    (rootWords || [])
      .filter(wordId => !fsrsCards[wordId])
      .slice(0, 5)  // cap at 5 to avoid overwhelming the queue
      .forEach(wordId => {
        store.dispatch(addFsrsCard({
          wordId,
          card: createDefaultCard(),
          source: `inscription_root_${inscription.rootFamily}`,
        }));
      });
  }

  // Set discovery flag
  store.dispatch(setFlag({
    key: `inscription_${inscription.id}_discovered`,
    value: true,
  }));
}
```

---

## State of the Art

| Old Approach | Current Approach | Phase Changed | Impact |
|--------------|------------------|---------------|--------|
| Static price from `itemData.sellPrice * 2` | Dynamic `PricingAgent.calculateDynamicPrice()` | Phase 54 | Prices react to player behavior and faction |
| No NPC gossip — NPCs know nothing about world events | `gossipMiddleware` creates tokens; ink dialogue surfaces them | Phase 54 | NPCs feel aware of the player's deeds |
| 8 inscriptions total (1 per zone) | 20+ inscriptions across 8 zones | Phase 54 | Environmental literacy — Arabic appears in world context |
| FSRS-only tashkeel fading (reps + stability) | Path-aware fading: Scholar retains tashkeel 2x longer | Phase 54 | Learning path has visible, meaningful effect on Arabic display |
| `npcRelationships` in narrativeSlice for ink | `npc.friendship` (0-100) as the canonical relationship for gossip threshold | Phase 53-54 | Consistent scale, correct threshold matching |

**Deprecated/outdated:**
- Static `priceModifiers` object in economySlice: still valid for manual overrides, but dynamic pricing replaces its primary use case
- Raw string gossip flags (`GOSSIP_LIBRARY_RUMOR_HEARD` etc.) in WORLD_STATE_KEYS: these track whether a *rumour* was heard about a zone event, not the new gossip token system — they are separate concerns and should not be confused

---

## Plan-Specific Notes

### 54-01: PricingAgent

- Add `supplyLevels: {}` to economySlice initial state: `{ [shopId]: { [itemId]: { current, max } } }`
- Add reducers: `decreaseSupply({ shopId, itemId, amount })`, `restoreSupply({ shopId, amount })`, `initSupply({ shopId, items })`
- PricingAgent is a pure function in EconomyFlow.js (or a standalone `pricingAgent.js`)
- ShopOverlay initializes supply when it opens (if not yet initialized) via `SHOP_OPEN` handler
- Supply restoration: add a case to `worldStateMiddleware.js` (or new economyMiddleware) for `time/advanceTime` — restore 25% of max per day
- Price direction indicator: `▲` in red, `▼` in green, neither if unchanged — framer-motion minimal animation on mount

### 54-02: GossipManager

- New `gossipSlice.js`: state shape `{ npcTokens: { [npcId]: Token[] } }` — no persistence needed (tokens are session-ephemeral)
- New `gossipMiddleware.js`: add AFTER `factionMiddleware` in store.js concat chain (order: ... worldStateMiddleware, factionMiddleware, gossipMiddleware)
- Add to `InkDialogueEngine._bindExternalFunctions()`: `getGossipToken`, `markGossipHeard`
- New `gossipTemplates.js`: map questId → `{ topic, arabicLine, englishHint, grammarNote }` — start with ~10 templates covering main quest acts
- Add gossip knots to the 5 pilot ink NPCs (scholar-yusuf, guide-amira, librarian-ibrahim, merchant-fatima, student-khalid) — run `npm run ink:compile` after each change
- GOSP-05: grammarNote field in token is displayed in DialogueOverlay as a subtle annotation below the Arabic line

### 54-03: Environmental Inscriptions

- Target: 3 inscriptions per zone = 24 total (exceeds 20 minimum)
- Each zone already has 1 inscription with `rootFamily` — add 2 more per zone, using OBJECT_INTERACT / ObjectInteractionOverlay (not ink) for efficiency
- New `inscriptionData.js` to hold inscription content (arabic text, wordIds, culturalNote) separate from world coordinates in zones.js
- InteractableManager already handles `type: 'inscription'` — verify it dispatches OBJECT_INTERACT with inscription data
- WORLD_STATE_KEYS: add `INSCRIPTION_{ZONE}_{N}_DISCOVERED` entries for each new inscription (follow existing pattern in worldStateKeys.js)

### 54-04: Progressive Tashkeel

- Only 2 files change: `useFormatArabic.js` and `TashkeelText.jsx`
- Add `learningPath` to useCallback deps in `getTashkeelOpacity`
- Scholar path: thresholds doubled → tashkeel visible 2× as long
- Traveler: existing baseline (unchanged)
- Historian: thresholds × 1.33
- No new UI component needed — change is internal to the hook
- TashkeelText.jsx: already has `wordMeta?.ambiguous` guard — this remains highest priority, applied before path check

---

## Open Questions

1. **Inscription word IDs in vocabularyAll.js**
   - What we know: Inscriptions need a `wordIds` array for FSRS dispatch; those word IDs must exist in vocabularyAll.js (5,000+ words from Phase 52)
   - What's unclear: The word IDs to use for new inscriptions (e.g., zone-appropriate trade/sea/mountain vocabulary)
   - Recommendation: Plan 03 writer selects word IDs from vocabularyAll.js using category and CEFR level; A1/A2 words for early zones, B1/B2 for later zones

2. **Supply level defaults per item**
   - What we know: Formula uses `(maxSupply / current)` — maxSupply needs to be defined per item
   - What's unclear: Should all items have the same maxSupply (e.g., 10), or vary by item rarity?
   - Recommendation: Simple approach — max 10 for common items, 5 for rare items, 3 for legendary. Store in item data or as a constant lookup in PricingAgent.

3. **GossipManager triggering on NPC interactions (GOSP-01: "notable interactions")**
   - What we know: Quest completions are straightforward triggers
   - What's unclear: What qualifies as a "notable NPC interaction"? A friendship increase? A teaching moment?
   - Recommendation: Use `npc/adjustFriendship` with `delta > 5` as the trigger for NPC-interaction gossip tokens (significant relationship moments only, not every chat).

---

## Sources

### Primary (HIGH confidence)
- Direct codebase reading: `src/store/slices/economySlice.js`, `src/data/shopGenerator.js`, `src/game/systems/EconomyFlow.js`
- Direct codebase reading: `src/store/slices/npcSlice.js`, `src/store/slices/narrativeSlice.js`
- Direct codebase reading: `src/game/systems/InkDialogueEngine.js`, `src/data/ink-source/scholar-yusuf.ink`
- Direct codebase reading: `src/components/Arabic/TashkeelText.jsx`, `src/hooks/useFormatArabic.js`
- Direct codebase reading: `src/data/zones.js` (inscription shape at lines 128-143)
- Direct codebase reading: `src/store/middleware/factionMiddleware.js` (middleware pattern)
- Direct codebase reading: `src/data/worldStateKeys.js` (GOSSIP_* and INSCRIPTION_* keys)
- Direct codebase reading: `src/store/slices/playerSlice.js` (learningPath field)
- Direct codebase reading: `.planning/STATE.md` (v11.0 context, EXTERNAL declaration requirement)

### Secondary (MEDIUM confidence)
- `.planning/phases/53-faction-reputation-engine/53-RESEARCH.md` — established patterns used in Phase 53

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in use, no new dependencies
- Architecture: HIGH — all 4 systems follow well-established codebase patterns
- Pitfalls: HIGH — relationship system gap (narrativeSlice vs npcSlice) confirmed by direct code reading; supply init and ink EXTERNAL patterns confirmed from STATE.md

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable domain — no fast-moving external deps)
