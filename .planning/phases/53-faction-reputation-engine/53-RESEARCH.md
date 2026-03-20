# Phase 53: Faction Reputation Engine — Research

**Researched:** 2026-03-20
**Domain:** Redux Toolkit slice extension, middleware pattern, ActionSetExecutor, FSRS vocabulary, React UI
**Confidence:** HIGH

---

## Summary

Phase 53 builds on an already-substantial foundation. The project has a working `factionSlice.js` with `adjustAlignment` reducers and 6 factions defined in `factions.js`, but the slice is designed around a "primary/secondary alignment bonus" model, not the "0-100 score with tier thresholds" model the requirements specify. The existing slice needs to be extended — not replaced — with tier constants, IndexedDB persistence, and a factionMiddleware that reacts to game actions automatically.

The `ActionSetExecutor` in `src/game/systems/ActionSetExecutor.js` already handles `quest`, `flag`, `vocab`, `level`, `item`, `time`, and `zone` requirement types. Adding `factionRequired` is a single `case` addition in `evaluateRequirement`. Faction-gated content lives in NPC/zone data objects, not in code — that is already the pattern in this codebase.

The vocabulary reward system needs a new mechanism: when an alignment score crosses a tier threshold for the first time, a batch of faction-specific words (filtered from the 5,000+ corpus by `factions.js`'s `vocabCategories`) should be dispatched into the FSRS queue via `addFsrsCard`. The existing `vocabularySlice.addFsrsCard` action handles single cards; a thin loop in `factionMiddleware` handles the batch.

**Primary recommendation:** Extend the existing factionSlice with tier constants and a score-based model, wire factionMiddleware to auto-dispatch `adjustAlignment` on game actions, add `factionRequired` to ActionSetExecutor, write faction-gated data for all 6 factions, and surface faction scores in a new FactionPanel component.

---

## Existing Codebase State (CRITICAL — Read Before Planning)

### What Already Exists

| File | Status | Relevance |
|------|--------|-----------|
| `src/store/slices/factionSlice.js` | EXISTS — alignment model | Needs tier constants + IndexedDB persist + score model |
| `src/data/factions.js` | EXISTS — 6 factions defined | Faction IDs, `vocabCategories`, `npcMembers`, bonuses all present |
| `src/data/factionEvents.js` | EXISTS — 12 rotating events | Can emit faction points during active events |
| `src/store/store.js` | EXISTS — faction in localStorage whitelist | Must move to IndexedDB or add persist config |
| `src/data/worldStateKeys.js` | EXISTS — faction tier flags pre-written | `FACTION_SCHOLARS_FRIENDLY`, `FACTION_SCHOLARS_TRUSTED`, etc. already exist |
| `src/hooks/useZoneEvents.js` | EXISTS — calls `adjustAlignment` for zone quests | Already fires alignment on quest complete |
| `src/data/shopGenerator.js` | EXISTS — reads `factionReputation` | Reads from `narrative.factionReputation`, NOT from `faction.alignment` — gap |
| `src/game/systems/ActionSetExecutor.js` | EXISTS — 7 requirement types | Needs `factionRequired` case added |
| `vocabularySlice.addFsrsCard` | EXISTS | Dispatches one card at a time; loop in middleware for batch |

### What Does NOT Exist

- Tier constants (Neutral=0, Friendly=25, Trusted=50, Allied=75, Revered=100) — need to define
- `factionMiddleware.js` — does not exist; only `useZoneEvents.js` calls `adjustAlignment` manually
- Faction-gated NPC dialogue/quest/shop data for any faction — none written
- Faction vocabulary word lists per faction (10+ words at Friendly threshold) — none written
- FactionPanel UI component — does not exist
- `factionRequired` requirement type in `ActionSetExecutor` — does not exist
- IndexedDB persistence for `factionSlice` — currently in localStorage whitelist only

### Key Gap: shopGenerator.js vs factionSlice

`shopGenerator.js` reads faction reputation from `state.narrative?.factionReputation` (a stale field from an older system), NOT from `state.faction.alignment`. When implementing the Allied (75) shop discount, the planner must decide: update `shopGenerator.js` to read from `state.faction.alignment`, or add a selector bridge. Update `shopGenerator.js` directly — the `narrative.factionReputation` field is vestigial.

---

## Standard Stack

### Core (all already installed)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| `@reduxjs/toolkit` | existing | factionSlice, createSlice, createSelector | In use |
| `redux-persist` | existing | IndexedDB persistence via nested persistReducer | Pattern established |
| `framer-motion` | existing | Animated progress bars (see RelationshipBar.jsx) | In use for UI |
| `react-redux` | existing | useSelector, useDispatch | In use |

### Reference Pattern Files

| Pattern | Source File | Used For |
|---------|-------------|---------|
| Middleware with re-entrancy guard | `achievementMiddleware.js` | factionMiddleware structure |
| Tier-based progress bar | `RelationshipBar.jsx` | FactionBar component |
| IndexedDB nested persist | `store.js` — `companionPersistConfig` | factionSlice IndexedDB config |
| Migration no-op | `migrations.js` v2-4 | Version 9 migration for faction move |
| ActionSet requirement | `ActionSetExecutor.js` switch cases | `factionRequired` case |
| Batch FSRS words | `craftingVocabMiddleware.js` pattern | Faction vocabulary reward loop |

---

## Architecture Patterns

### Recommended Project Structure Changes

```
src/
├── store/
│   ├── slices/
│   │   └── factionSlice.js          ← EXTEND (add tiers, score model, IndexedDB)
│   └── middleware/
│       └── factionMiddleware.js      ← CREATE NEW
├── data/
│   ├── factions.js                   ← EXTEND (add FACTION_TIERS, vocabRewards)
│   └── factionVocab.js               ← CREATE NEW (10+ words per faction)
├── game/
│   └── systems/
│       └── ActionSetExecutor.js      ← EXTEND (add factionRequired case)
└── components/
    └── Faction/
        └── FactionPanel.jsx          ← CREATE NEW
```

### Pattern 1: Extending factionSlice with Tier Model

The existing `factionSlice` uses `alignment` (0+, unbounded). Phase 53 requires 0-100 scores with tier thresholds. Keep backward compatibility — scores stay in `state.faction.alignment` but clamp to 100.

```javascript
// In factions.js — add alongside existing exports
export const FACTION_TIERS = Object.freeze({
  NEUTRAL:  { label: 'Neutral',  labelArabic: 'محايد',   threshold: 0  },
  FRIENDLY: { label: 'Friendly', labelArabic: 'ودي',     threshold: 25 },
  TRUSTED:  { label: 'Trusted',  labelArabic: 'موثوق',   threshold: 50 },
  ALLIED:   { label: 'Allied',   labelArabic: 'حليف',    threshold: 75 },
  REVERED:  { label: 'Revered',  labelArabic: 'موقّر',   threshold: 100 },
});

// Helper: get tier for a given score (0-100)
export function getFactionTier(score) {
  if (score >= 100) return FACTION_TIERS.REVERED;
  if (score >= 75)  return FACTION_TIERS.ALLIED;
  if (score >= 50)  return FACTION_TIERS.TRUSTED;
  if (score >= 25)  return FACTION_TIERS.FRIENDLY;
  return FACTION_TIERS.NEUTRAL;
}
```

**Clamp in `adjustAlignment` reducer:** Change `Math.max(0, ...)` to `Math.max(0, Math.min(100, ...))`. Scores cap at 100.

### Pattern 2: factionMiddleware Structure

Follow `achievementMiddleware.js` exactly — pass action through first, then check triggered action types, dispatch consequences. Track which thresholds have been crossed using the pre-existing `WORLD_STATE_KEYS.FACTION_*_FRIENDLY/TRUSTED/ALLIED` flags to avoid double-firing rewards.

```javascript
// src/store/middleware/factionMiddleware.js
export const factionMiddleware = (store) => (next) => (action) => {
  // Guard: never intercept redux-persist internal actions
  if (action.type.startsWith('persist/')) return next(action);

  const result = next(action);  // Pass through first

  // React to adjustAlignment crossing a tier threshold
  if (action.type === 'faction/adjustAlignment') {
    const { factionId } = action.payload;
    const state = store.getState();
    const score = state.faction.alignment[factionId] ?? 0;
    const prevScore = /* score before action */ ...;

    // Check each tier threshold — dispatch vocab reward on first crossing
    checkAndRewardThreshold(store, factionId, score, prevScore);
  }

  // Auto-adjust faction scores from game events
  if (action.type === 'quests/completeQuest') { ... }
  if (action.type === 'economy/recordPurchase') { ... }
  // dialogue choice handler ...

  return result;
};
```

**Re-entrancy note:** factionMiddleware dispatches `adjustAlignment` and `addFsrsCard`. The achievement middleware already guards against `addFsrsCard` re-entrancy. factionMiddleware should guard against cascading `adjustAlignment` calls with a module-level boolean flag (same pattern as `_isProcessingAchievements`).

**Pre-score problem:** The middleware sees state AFTER reduction. To compare before/after, read state BEFORE `next(action)` for the pre-score, then read after. Do this only for `faction/adjustAlignment` actions.

```javascript
// Pre-reduction score (before next(action))
const preScore = action.type === 'faction/adjustAlignment'
  ? (store.getState().faction.alignment[action.payload.factionId] ?? 0)
  : null;

const result = next(action);

// Post-reduction score (after next(action))
if (action.type === 'faction/adjustAlignment') {
  const postScore = store.getState().faction.alignment[action.payload.factionId] ?? 0;
  checkAndRewardThreshold(store, action.payload.factionId, preScore, postScore);
}
```

### Pattern 3: Adding factionRequired to ActionSetExecutor

Single `case` addition in the `evaluateRequirement` switch. Context object needs `factionScores` added:

```javascript
case 'factionRequired': {
  // req = { type: 'factionRequired', factionId: 'scholars', minScore: 25 }
  const score = context.factionScores?.[req.factionId] ?? 0;
  return score >= req.minScore;
}
```

The context object is built by callers (DialogueEngine, InteractableManager). Those callers need `factionScores: store.getState().faction.alignment` added to the context they pass.

### Pattern 4: Faction Vocabulary Rewards (FACT-06)

Use `factions.js`'s `vocabCategories` field to filter words from `vocabularyAll.js`. Pick the first N words not already in `fsrsCards`. Dispatch `addFsrsCard` for each in a loop.

```javascript
// In factionMiddleware — called when threshold first crossed
function grantFactionVocabReward(store, factionId, tier) {
  const faction = FACTION_BY_ID[factionId];
  if (!faction) return;

  const state = store.getState();
  const knownWords = new Set(Object.keys(state.vocabulary.fsrsCards));
  const allVocab = vocabularyData; // imported from vocabularyAll.js

  const factionWords = allVocab
    .filter(w => faction.vocabCategories.includes(w.category) && !knownWords.has(w.id))
    .slice(0, 10); // at least 10 words per FACT-06

  for (const word of factionWords) {
    store.dispatch(addFsrsCard({
      wordId: word.id,
      card: createNewCard(),  // from src/services/fsrs.js
      source: `faction_${factionId}_${tier}`,
    }));
  }
}
```

**Key**: The `source` field on `addFsrsCard` already exists in `vocabularySlice` — use `source: \`faction_${factionId}_${tier}\`` for traceability.

### Pattern 5: IndexedDB Persistence for factionSlice

Current: `faction` is in the localStorage whitelist in `store.js`. Faction scores are not heavy data (6 numbers), so localStorage is acceptable. However, FACT-01 says "IndexedDB persist" per the plan structure. Check the plan spec — the requirement says "IndexedDB persist" explicitly.

To move to IndexedDB: add a `factionPersistConfig` with `indexedDBStorage`, wrap `factionReducer` in `persistReducer`, remove `'faction'` from root localStorage whitelist, bump `CURRENT_VERSION` to 9, add a no-op migration `9: (state) => state`.

If plan decides localStorage is fine (faction data is tiny — 6 numbers), skip IndexedDB and note the tradeoff. The plan spec says IndexedDB, so plan for IndexedDB.

### Pattern 6: FactionPanel UI

Follow `RelationshipBar.jsx` and `CompanionCard.jsx` as reference. Use `framer-motion` for animated score bars. Show all 6 factions with:
- Faction name (English + Arabic)
- Current score (0-100)
- Tier label (Neutral/Friendly/Trusted/Allied/Revered in English + Arabic)
- Animated progress bar with tier color

Tier colors (suggested, consistent with RelationshipBar pattern):
```javascript
const TIER_COLORS = {
  neutral:  '#7F8C8D',  // Gray
  friendly: '#3498DB',  // Blue
  trusted:  '#2ECC71',  // Green
  allied:   '#9B59B6',  // Purple
  revered:  '#F1C40F',  // Gold
};
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Threshold crossing detection | Custom event system | factionMiddleware reading pre/post score | Middleware already owns post-action state |
| Faction vocab list | Hardcoded word IDs | Filter `vocabularyAll.js` by `factions.vocabCategories` | 5,000+ corpus already tagged; hardcoding creates maintenance debt |
| Score animation | CSS transitions manually | `framer-motion` (already in use in RelationshipBar.jsx) | Already imported; consistent with existing UI |
| Persistence | Manual localStorage write | `redux-persist` nested persistReducer | Already established pattern for IndexedDB |
| Faction NPC detection | Hardcoded npcId → factionId | `NPC_FACTION_MAP` from `useZoneEvents.js` (already built) | Already computed at module load |
| Tier label logic | Inline conditionals everywhere | `getFactionTier(score)` helper in `factions.js` | Single source of truth |

**Key insight:** The NPC_FACTION_MAP (npcId → factionId reverse lookup) is already built in `useZoneEvents.js` at module level. Import `FACTIONS` and rebuild it in `factionMiddleware.js` the same way — or extract to `factions.js` as an export.

---

## Common Pitfalls

### Pitfall 1: Double-Firing Vocabulary Rewards

**What goes wrong:** Player scores 25, drops below 25, scores 25 again — faction vocab words are dispatched twice.

**Why it happens:** Middleware fires on every `adjustAlignment` action, checks if score is now >= threshold without checking if the reward was already given.

**How to avoid:** Use the pre-existing `WORLD_STATE_KEYS.FACTION_SCHOLARS_FRIENDLY` flags in `worldStateSlice`. Before dispatching rewards, check `state.worldState.flags[WORLD_STATE_KEYS.FACTION_SCHOLARS_FRIENDLY]`. After granting, dispatch `setFlag({ key: WORLD_STATE_KEYS.FACTION_SCHOLARS_FRIENDLY, value: true })`.

**Warning signs:** Player receives duplicate vocabulary rewards after scoring oscillates around a threshold.

### Pitfall 2: factionRequired Breaks Content for Faction-Score-0 Players

**What goes wrong:** NPC dialogue or quest uses `factionRequired` with `minScore: 0`, which always passes. Or main storyline content accidentally gets `factionRequired` conditions added.

**Why it happens:** FACT-04 mandates that main storyline quests remain completable at faction 0. If a writer adds `factionRequired` to main quest dialogue branches, players can get locked out.

**How to avoid:** The planner must mark faction-gated content clearly as BONUS content in data files. Main quest action sets must have an empty fallback requirements array (unconditional match). `factionRequired` only goes on BONUS branches, which come BEFORE the unconditional fallback in the action sets array (ActionSetExecutor takes first match).

**Warning signs:** Testing with all factions at 0 blocks completion of any main storyline quest.

### Pitfall 3: shopGenerator.js Reads from Wrong State Path

**What goes wrong:** Allied faction discount (75+ score) does not apply in ShopOverlay because `shopGenerator.js` reads `state.narrative?.factionReputation` instead of `state.faction.alignment`.

**Why it happens:** `shopGenerator.js` was written against an older faction design where reputation lived in `narrativeSlice`.

**How to avoid:** When implementing the Allied shop discount, update `shopGenerator.js` line 26 to read `state.faction?.alignment` instead of `state.narrative?.factionReputation`. Also update `getShopFaction()` to map shop IDs to the new `FACTION_IDS` constants from `factions.js`.

**Warning signs:** Shop prices remain unchanged even when faction score >= 75.

### Pitfall 4: factionMiddleware Middleware Position in Chain

**What goes wrong:** `factionMiddleware` fires before `worldStateMiddleware`, so the world state flag isn't set yet when factionMiddleware tries to read it to guard against double-reward.

**Why it happens:** Middleware order in `store.js` `.concat()` call determines execution order.

**How to avoid:** Add `factionMiddleware` AFTER `worldStateMiddleware` in the chain — same convention as existing middleware. The current order is: `achievementMiddleware, dailyGoalsMiddleware, storageQuotaMiddleware, rootFsrsSyncMiddleware, battleRewardsMiddleware, craftingVocabMiddleware, statusEffectVocabMiddleware, friendshipMiddleware, utilityBonusMiddleware, worldStateMiddleware`. Add `factionMiddleware` last.

**Warning signs:** Double-dispatch on threshold crossing despite the worldState guard check.

### Pitfall 5: FSRS Card Creation for Faction Vocabulary

**What goes wrong:** Dispatching `addFsrsCard` with an empty or undefined `card` object causes FSRS review session to crash.

**Why it happens:** `addFsrsCard` requires a valid FSRS card object, not null. New words that have never been reviewed need a freshly created card via `createNewCard()`.

**How to avoid:** Import `createNewCard` from `src/services/fsrs.js` (same pattern as Phase 51-05 gap closure). Always call `createNewCard()` before dispatching `addFsrsCard` for faction vocab rewards. Check `src/store/middleware/rootFsrsSyncMiddleware.js` for the exact `createNewCard` import pattern.

**Warning signs:** Review session crashes on words that were added via faction rewards.

---

## Code Examples

### factionRequired in ActionSetExecutor

```javascript
// Source: existing src/game/systems/ActionSetExecutor.js switch pattern
case 'factionRequired': {
  // req = { type: 'factionRequired', factionId: 'scholars', minScore: 25 }
  const score = context.factionScores?.[req.factionId] ?? 0;
  return score >= (req.minScore ?? 0);
}
```

Context callers must add `factionScores: store.getState().faction.alignment` to their context object.

### Faction data structure in NPC dialogue (data-driven)

```javascript
// In npcs.json or npcStoryArcs.js — faction-gated bonus dialogue
{
  npcId: 'scholar_ibrahim',
  actionSets: [
    {
      requirements: [
        { type: 'factionRequired', factionId: 'scholars', minScore: 25 }
      ],
      actions: [
        { type: 'speech', npcId: 'scholar_ibrahim', dialogueKey: 'scholars_friendly_greeting' }
      ]
    },
    {
      requirements: [], // unconditional fallback — always reachable
      actions: [
        { type: 'speech', npcId: 'scholar_ibrahim', dialogueKey: 'default_greeting' }
      ]
    }
  ]
}
```

### factionMiddleware threshold check (pre/post score pattern)

```javascript
// Source: established pattern from achievementMiddleware.js
export const factionMiddleware = (store) => (next) => (action) => {
  if (action.type.startsWith('persist/')) return next(action);

  // Capture pre-action score for threshold comparison
  const preScore = action.type === 'faction/adjustAlignment'
    ? (store.getState().faction.alignment[action.payload?.factionId] ?? 0)
    : null;

  const result = next(action);

  if (action.type === 'faction/adjustAlignment' && preScore !== null) {
    const { factionId } = action.payload;
    const postScore = store.getState().faction.alignment[factionId] ?? 0;
    _checkThresholdCrossings(store, factionId, preScore, postScore);
  }

  // Auto-fire faction points from game events
  if (action.type === 'quests/completeQuest') {
    _handleQuestComplete(store, action);
  }

  return result;
};
```

### IndexedDB persist config for factionSlice (store.js addition)

```javascript
// Source: src/store/store.js — identical pattern to companionPersistConfig
const factionPersistConfig = {
  key: 'gogo-arabic-faction',
  storage: indexedDBStorage,
  version: CURRENT_VERSION,
  migrate,
};

const persistedFactionReducer = persistReducer(factionPersistConfig, factionReducer);
// Replace: faction: factionReducer → faction: persistedFactionReducer
// Remove 'faction' from root localStorage whitelist
```

### WORLD_STATE_KEYS additions needed

The `worldStateKeys.js` already has `FACTION_SCHOLARS_FRIENDLY`, `FACTION_SCHOLARS_TRUSTED`, `FACTION_SCHOLARS_ALLIED` etc. for all 6 factions. These are the reward-guard flags. No new keys needed — they are pre-written and waiting.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `narrative.factionReputation` in shopGenerator | `faction.alignment` in factionSlice | shopGenerator.js needs 1-line fix |
| Manual `adjustAlignment` call in useZoneEvents.js | factionMiddleware auto-fires on game events | Consistent, centralized, testable |
| Faction as bonus XP multiplier system (existing factionSlice design) | Faction as 0-100 reputation score with tier unlocks | Both models can coexist — alignment scores serve both purposes |

**Deprecated/outdated:**
- `state.narrative?.factionReputation`: Stale field; shopGenerator.js must read from `state.faction.alignment` instead.
- Unbounded alignment scores: The existing slice allows scores > 100. Phase 53 caps at 100 via clamp in `adjustAlignment`.

---

## Open Questions

1. **Does factionSlice move to IndexedDB or stay in localStorage?**
   - What we know: The plan spec says "IndexedDB persist". Faction state is 6 numbers — tiny — so localStorage would not hit the 5-10MB limit risk.
   - What's unclear: Whether the planner treats "IndexedDB persist" as a hard requirement or a preference.
   - Recommendation: Follow the plan spec — move to IndexedDB. Pattern is established, cost is low (add 5 lines to store.js, add a no-op migration v9). Avoids technical debt if faction state grows later.

2. **How many alignment points should each game event grant?**
   - What we know: `useZoneEvents.js` currently awards 10 points for quest completion. The tiers are 0/25/50/75/100.
   - What's unclear: The exact delta per event type (purchase, dialogue choice, etc.).
   - Recommendation: Quest completion = +10, purchase at faction shop = +5, favorable dialogue choice = +3. These numbers let a player reach Friendly after ~3 relevant quests — achievable without grinding.

3. **Which shops map to which factions for the Allied discount?**
   - What we know: `shopGenerator.js`'s `getShopFaction()` maps shop IDs to old faction names (`'scholars'`, `'merchants'`). These match the new `FACTION_IDS` values.
   - What's unclear: Whether any shops need new faction mappings.
   - Recommendation: The existing mapping in `getShopFaction()` already uses `'scholars'`, `'merchants'` etc. — these match `FACTION_IDS` values. Update the function to use `FACTION_IDS.SCHOLARS` constants for type safety.

4. **How does ActionSetExecutor receive faction scores in context?**
   - What we know: ActionSetExecutor is called by DialogueEngine and InteractableManager with a context object they build manually.
   - What's unclear: Whether all callers of `evaluateActionSets` need updating, or just DialogueEngine.
   - Recommendation: Add `factionScores: store.getState().faction.alignment` to every context object that already reads from the store. Audit all `evaluateActionSets(...)` call sites in the codebase.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase read: `src/store/slices/factionSlice.js` — existing alignment model
- Direct codebase read: `src/data/factions.js` — 6 factions with vocabCategories
- Direct codebase read: `src/data/worldStateKeys.js` — pre-written FACTION_* tier flags
- Direct codebase read: `src/game/systems/ActionSetExecutor.js` — requirement type pattern
- Direct codebase read: `src/store/middleware/achievementMiddleware.js` — middleware structure
- Direct codebase read: `src/store/store.js` — IndexedDB nested persist pattern
- Direct codebase read: `src/data/shopGenerator.js` — faction reputation gap

### Secondary (MEDIUM confidence)
- Direct codebase read: `src/hooks/useZoneEvents.js` — existing adjustAlignment call sites
- Direct codebase read: `src/components/Companions/RelationshipBar.jsx` — UI bar pattern

---

## Metadata

**Confidence breakdown:**
- Existing codebase state: HIGH — read all relevant files directly
- Standard stack: HIGH — all libraries already installed, all patterns established
- Architecture: HIGH — follows exact patterns already proven in Phase 51/52
- Pitfalls: HIGH — identified from direct code reading (shopGenerator gap, double-reward risk, middleware order)
- Code examples: HIGH — adapted directly from existing codebase patterns

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable codebase, no external dependencies to verify)
