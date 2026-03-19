# Phase 50: Infrastructure Baseline - Research

**Researched:** 2026-03-19
**Domain:** Vite bundle optimization, Phaser 3 lazy asset loading, Redux Toolkit middleware
**Confidence:** HIGH

---

## Summary

Phase 50 has three independent work streams: (1) shrink the initial JS bundle from 1,235KB to under 500KB, (2) make BootScene load only shared assets upfront and defer zone-specific assets to transition time, (3) expand `worldStateSlice` with 500+ named flags and add `worldStateMiddleware` that auto-sets flags when quests complete, NPCs are interacted with, or purchases happen.

The good news: routing already uses `React.lazy` for every screen. The bad news: `GameLayout` (the `/game` route) eagerly imports 25+ overlay components — `BattleOverlay`, `MagicOverlay`, `InventoryUI`, `RecipeBook`, `CraftingMiniGame`, `ShopOverlay`, `QuestJournal`, and more — which all land in the main chunk. Those lazy-wrapping those overlays is the primary lever to hit the 500KB target. The Phaser chunk (1,208KB) and vocabulary chunk (1,704KB) are not in the initial load path and are therefore not the bottleneck.

The existing middleware pattern (`achievementMiddleware.js`, `friendshipMiddleware.js`) is the exact pattern to clone for `worldStateMiddleware`. The existing `worldStateSlice` already has `setFlag` and `incrementCounter` reducers — Phase 50 extends it with a constants file and IndexedDB persistence. RTK's `createListenerMiddleware` is an option but the project uses plain custom middleware; staying consistent with the existing pattern is the correct call.

**Primary recommendation:** Lazy-wrap the 8+ heavy overlays in GameLayout using `React.lazy` + `Suspense`, add `rollup-plugin-visualizer` as a dev dependency to confirm chunk attribution, then wire worldStateMiddleware to `quests/completeQuest`, `npc/teachWord`, and `economy/recordPurchase`.

---

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vite | ^7.3.1 | Build tool | Already in project |
| @reduxjs/toolkit | ^2.11.2 | Redux + middleware | Already in project |
| redux-persist | ^6.0.0 | Slice persistence | Already in project — 5 slices use IndexedDB pattern |

### To Install
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| rollup-plugin-visualizer | 7.0.1 | Bundle treemap analysis | De-facto standard for Vite bundle analysis; INFRA-03 requires it |

**Installation:**
```bash
npm install --save-dev rollup-plugin-visualizer
```

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| rollup-plugin-visualizer | vite-bundle-visualizer | vite-bundle-visualizer is a CLI wrapper around the same plugin; no benefit here |
| custom middleware | RTK createListenerMiddleware | createListenerMiddleware is powerful but all 9 existing middleware use the plain `store => next => action` pattern — stay consistent |

---

## Architecture Patterns

### Pattern 1: Bundle — Lazy-Wrapping Heavy GameLayout Overlays

**What:** Convert eager imports in `GameLayout.jsx` to `React.lazy` with `Suspense` fallbacks
**When to use:** For any overlay component that is conditionally rendered (only shown when a flag is true)
**Why it works:** Vite creates a separate async chunk per dynamic import; those chunks are NOT included in the initial load
**Expected impact:** BattleOverlay, MagicOverlay, InventoryUI, RecipeBook, CraftingMiniGame, ShopOverlay, QuestJournal, Wardrobe are all conditionally rendered — wrapping them removes their transitive imports (game systems, data files) from the initial chunk

**Example (apply this same pattern to each heavy overlay):**
```javascript
// BEFORE (eager — adds to initial chunk):
import BattleOverlay from '../Battle/BattleOverlay.jsx';

// AFTER (lazy — gets own async chunk):
import { lazy, Suspense } from 'react';
const BattleOverlay = lazy(() => import('../Battle/BattleOverlay.jsx'));

// Usage — wraps conditional render:
{battleActive && (
  <Suspense fallback={null}>
    <BattleOverlay />
  </Suspense>
)}
```

**Important:** `fallback={null}` is correct here — these overlays either show or don't, a loading spinner inside an already-loaded game world is wrong UX.

### Pattern 2: Bundle — rollup-plugin-visualizer for build:analyze

**What:** Conditional plugin that runs the visualizer only when `ANALYZE=true`, never during regular builds

```javascript
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react({ jsxRuntime: 'automatic' }),
    validateDialoguePlugin(),
    process.env.ANALYZE === 'true' && visualizer({
      template: 'treemap',
      open: true,
      filename: 'dist/bundle-report.html',
      gzipSize: true,
      brotliSize: false,
    }),
  ].filter(Boolean),
  // ...
});
```

```json
// package.json scripts:
"build:analyze": "ANALYZE=true vite build"
```

**Note:** Do NOT add `visualizer()` unconditionally — it opens a browser on every build. Gate it behind `ANALYZE=true`.

### Pattern 3: Phaser Zone-Based Lazy Loading in BootScene

**What:** Split BootScene's `preload()` into two categories: shared assets (load always) and zone-specific assets (load on zone transition)
**When to use:** Zone transition in `ZoneTransition.transitionTo()` — after fade out, before `scene.loadZone()`

**Existing API (already used in project):**
```javascript
// Phaser supports dynamic loading outside preload() via this pattern:
// 1. Add files to loader queue
// 2. Attach 'complete' listener
// 3. Call this.load.start()

// ZoneTransition.transitionTo() integration point:
async function loadZoneAssets(scene, zoneId) {
  const zoneAssets = ZONE_ASSET_MANIFEST[zoneId] || [];

  // Filter to only assets not already loaded
  const toLoad = zoneAssets.filter(
    asset => !scene.textures.exists(asset.key)
  );

  if (toLoad.length === 0) return; // All cached, skip loading

  return new Promise((resolve) => {
    toLoad.forEach(asset => {
      if (asset.type === 'spritesheet') {
        scene.load.spritesheet(asset.key, asset.path, {
          frameWidth: asset.frameWidth,
          frameHeight: asset.frameHeight,
        });
      } else {
        scene.load.image(asset.key, asset.path);
      }
    });
    scene.load.once('complete', resolve);
    scene.load.start();
  });
}
```

**Key facts verified from official Phaser docs:**
- Calling `this.load.start()` when already loading does NOT restart or clear the queue (safe)
- `this.textures.exists(key)` correctly returns false for textures not yet loaded — use this for deduplication
- The loader automatically skips duplicate keys — but explicit existence checks are best practice for clarity

**Zone asset manifest pattern:**
```javascript
// src/data/zoneAssetManifests.js
export const ZONE_ASSET_MANIFESTS = {
  oasis_village: [
    // zone-specific NPCs, zone-exclusive objects, tileset variants
  ],
  ancient_library: [...],
  // etc.
};

// SHARED_ASSETS in BootScene: player sprites, UI icons, common NPCs,
// tilesets, NineSlice panel textures, KENMI assets used across zones
```

**Loading indicator:** ZoneTransition already shows a fade-out period. Show a loading indicator during that window using `EventBus.emit(EVENTS.ZONE_LOADING_START)` / `ZONE_LOADING_END` events and handle in GameLayout's React layer (an existing pattern in the codebase).

### Pattern 4: worldStateSlice Expansion with WORLD_STATE_KEYS

**What:** Replace raw string flag keys with a constants object; add IndexedDB persistence

**The constants file pattern:**
```javascript
// src/data/worldStateKeys.js
export const WORLD_STATE_KEYS = {
  // Oasis Village
  OASIS_MET_MENTOR: 'oasis_met_mentor',
  OASIS_QUEST_WELCOME_COMPLETE: 'oasis_quest_welcome_complete',
  OASIS_PURCHASED_ITEM: 'oasis_purchased_item',

  // Ancient Library
  LIBRARY_ACCESS_GRANTED: 'library_access_granted',
  LIBRARY_LOST_CHAPTER_FOUND: 'library_lost_chapter_found',

  // Naming convention: {zone}_{action}_{target}
  // All keys lowercase_snake_case
};
```

**IndexedDB persistence (follow existing 5-slice pattern):**
```javascript
// store.js additions:
const worldStatePersistConfig = {
  key: 'gogo-arabic-world-state',
  storage: indexedDBStorage,  // same adapter as vocabulary, battle, etc.
  version: CURRENT_VERSION,
  migrate,
};
const persistedWorldStateReducer = persistReducer(worldStatePersistConfig, worldStateReducer);

// Remove 'worldState' from root persist whitelist (localStorage)
// Add worldState: persistedWorldStateReducer to rootReducer
```

**Migration note:** `worldState` is currently in the localStorage whitelist. Moving it to IndexedDB requires incrementing `CURRENT_VERSION` in `migrations.js` and handling migration of existing data.

### Pattern 5: worldStateMiddleware

**What:** Listens for game events and auto-sets world state flags — exact same pattern as `achievementMiddleware.js` and `friendshipMiddleware.js`

```javascript
// src/store/middleware/worldStateMiddleware.js
import { setFlag, incrementCounter } from '../slices/worldStateSlice.js';
import { WORLD_STATE_KEYS } from '../../data/worldStateKeys.js';

export const worldStateMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // Quest completion → set flag
  if (action.type === 'quests/completeQuest') {
    const { questId } = action.payload || {};
    if (questId) {
      store.dispatch(setFlag({
        key: WORLD_STATE_KEYS[`QUEST_${questId.toUpperCase()}_COMPLETE`],
        value: true,
      }));
    }
  }

  // NPC interaction (word taught) → set flag
  if (action.type === 'npc/teachWord') {
    const { npcId } = action.payload || {};
    if (npcId) {
      store.dispatch(setFlag({
        key: WORLD_STATE_KEYS[`NPC_${npcId.toUpperCase().replace(/-/g, '_')}_MET`],
        value: true,
      }));
    }
  }

  // Purchase → increment counter + set flag
  if (action.type === 'economy/recordPurchase') {
    const { shopId, itemId } = action.payload || {};
    if (shopId) {
      store.dispatch(incrementCounter({
        key: `shop_${shopId}_purchases`,
        amount: 1,
      }));
    }
  }

  return result;
};
```

**Action types to listen to (verified from codebase):**
- `quests/completeQuest` — dispatched with `{ questId, npcId }` payload (questSlice.js line 91)
- `npc/teachWord` — dispatched with `{ npcId, wordId }` payload (npcSlice.js line 22)
- `economy/recordPurchase` — dispatched with `{ shopId, itemId, price, haggled }` payload (economySlice.js line 42, ShopOverlay.jsx line 76)
- `npc/adjustFriendship` — dispatched with `{ npcId, delta, reason }` — good proxy for NPC interaction

### Recommended Project Structure (new files only)

```
src/
├── data/
│   └── worldStateKeys.js        # WORLD_STATE_KEYS constants (NEW)
│   └── zoneAssetManifests.js    # Per-zone Phaser asset lists (NEW)
├── store/
│   └── middleware/
│       └── worldStateMiddleware.js  # Auto-set flags on events (NEW)
```

Files to MODIFY:
- `vite.config.js` — add rollup-plugin-visualizer, no other changes needed
- `package.json` — add `build:analyze` script, add rollup-plugin-visualizer to devDependencies
- `src/store/store.js` — add worldStatePersistConfig (IndexedDB), add worldStateMiddleware, remove worldState from localStorage whitelist
- `src/store/slices/worldStateSlice.js` — no structure changes needed; worldStateKeys.js is separate
- `src/game/scenes/BootScene.js` — split preload() into shared/zone-specific
- `src/game/systems/ZoneTransition.js` — call loadZoneAssets() before loadZone()
- `src/components/Router/GameLayout.jsx` — lazy-wrap 8 heavy overlays

### Anti-Patterns to Avoid

- **Adding visualizer() unconditionally:** Opens browser on every `npm run build`. Always gate with env var.
- **Lazy-wrapping PhaserGame itself:** PhaserGame must be eagerly loaded — it's the game canvas. Only overlay components should be lazy.
- **Lazy-wrapping tiny components:** `HUD`, `NotificationToast`, `TutorialHints` are lightweight — lazy-wrapping them adds network round-trips with no size benefit. Target only components above ~30KB unminified.
- **Using raw string keys for setFlag after this phase:** Any new code using `store.dispatch(setFlag({ key: 'raw_string', ... }))` is wrong. Always use WORLD_STATE_KEYS.
- **Moving worldState to IndexedDB without incrementing CURRENT_VERSION:** Existing users have worldState in localStorage under 'gogo-arabic'. Not incrementing the migration version means old data stays in localStorage and is ignored.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bundle analysis treemap | Custom webpack-bundle-analyzer port | rollup-plugin-visualizer | Already works with Vite/Rollup; opens HTML treemap automatically |
| "Is texture loaded?" check | Custom asset registry | `scene.textures.exists(key)` | Phaser's TextureManager is the authoritative source |
| Async loading with callback | Manual XMLHttpRequest or fetch | `this.load.once('complete', cb); this.load.start()` | Phaser Loader handles HTTP, cache, error recovery |
| Middleware action routing | If/else chain across all slices | Existing `store => next => action` pattern | Already proven by 9 middleware in this codebase |

---

## Common Pitfalls

### Pitfall 1: worldState Persistence Migration Not Handled

**What goes wrong:** worldState is currently persisted to localStorage under key `persist:gogo-arabic`. Moving it to IndexedDB leaves old data in localStorage that never loads.
**Why it happens:** redux-persist checks the version; if unchanged, it skips migration.
**How to avoid:** Increment `CURRENT_VERSION` in `migrations.js`. Add a migration step that reads worldState from the old localStorage persist key and writes it to IndexedDB. Check existing Phase 27.1 migration in `migrations.js` for the exact pattern.
**Warning signs:** After Phase 50 ships, existing players see empty world flags (e.g. quest gates reopen).

### Pitfall 2: Lazy-Wrapped Overlays Cause Flash of Invisible Content

**What goes wrong:** A `Suspense` boundary with `fallback={<LoadingScreen />}` shows a loading spinner inside the game world while the overlay chunk downloads.
**Why it happens:** First time a user opens inventory/battle, the chunk hasn't loaded.
**How to avoid:** Use `fallback={null}` for all in-game overlays. The Phaser canvas stays visible behind the `null` fallback. Optionally preload the chunk on game mount with `import('./BattleOverlay.jsx')` (no assignment needed — just kicks off the download).
**Warning signs:** Flickering black screen or "Loading..." text appearing over the Phaser canvas.

### Pitfall 3: Phaser Loader Called Before Scene is Active

**What goes wrong:** Calling `scene.load.image()` + `scene.load.start()` on a scene that hasn't been started yet throws "Scene not active" errors.
**Why it happens:** Zone loading code runs during transition; the target scene may not be fully initialized.
**How to avoid:** Call `loadZoneAssets()` on the currently active WorldScene (which owns the Loader), not on a new scene instance.
**Warning signs:** "Uncaught Error: Scene not found or not active" in console on zone transition.

### Pitfall 4: worldStateMiddleware Dispatching During REHYDRATE

**What goes wrong:** `persist/REHYDRATE` fires on startup; if worldStateMiddleware intercepts it and dispatches `setFlag`, it overwrites the just-rehydrated persisted state.
**Why it happens:** Middleware sees all actions including redux-persist internal ones.
**How to avoid:** Add an early-return guard at the top of worldStateMiddleware: `if (action.type.startsWith('persist/')) return next(action);` — this is already done in achievementMiddleware.
**Warning signs:** Flags that were true after rehydrate are reset to false on next page load.

### Pitfall 5: GameLayout's PhaserGame Must Stay Eagerly Loaded

**What goes wrong:** Lazy-wrapping `PhaserGame` causes a 100-200ms blank canvas flash before the Phaser game renders.
**Why it happens:** `React.lazy` always introduces at least one network round-trip before rendering.
**How to avoid:** `PhaserGame` is tiny (~2KB) and is the critical first render. Keep it eager. Only lazy-wrap overlays.

### Pitfall 6: ANALYZE=true Script Cross-Platform (Windows)

**What goes wrong:** `"build:analyze": "ANALYZE=true vite build"` fails on Windows (PowerShell syntax is different).
**Why it happens:** Unix env-var syntax doesn't work in PowerShell.
**How to avoid:** Install `cross-env` as a dev dependency if cross-platform support is needed, or use `import.meta.env.ANALYZE` via a `.env.analyze` file. For this project (macOS only per env context), plain `ANALYZE=true` is fine.

---

## Code Examples

### rollup-plugin-visualizer in vite.config.js

```javascript
// Source: rollup-plugin-visualizer 7.0.1, GitHub btd/rollup-plugin-visualizer
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react({ jsxRuntime: 'automatic' }),
    validateDialoguePlugin(),
    // Only runs when ANALYZE=true npm run build:analyze
    process.env.ANALYZE === 'true' && visualizer({
      template: 'treemap',   // Options: treemap, sunburst, network, flamegraph
      open: true,            // Open in browser after build
      filename: 'dist/bundle-report.html',
      gzipSize: true,        // Show gzip column (matches Vite build output)
      brotliSize: false,
    }),
  ].filter(Boolean),
  // ... rest of config unchanged
});
```

### Phaser Dynamic Asset Loading

```javascript
// Source: Phaser 3 official docs — docs.phaser.io/phaser/concepts/loader
// Verified: loader.start() safe to call when already loading;
// textures.exists() is the canonical existence check

async function loadZoneAssets(scene, zoneId) {
  const manifest = ZONE_ASSET_MANIFESTS[zoneId] || [];
  const toLoad = manifest.filter(a => !scene.textures.exists(a.key));
  if (toLoad.length === 0) return;

  return new Promise((resolve) => {
    toLoad.forEach((asset) => {
      if (asset.type === 'spritesheet') {
        scene.load.spritesheet(asset.key, asset.path, {
          frameWidth: asset.frameWidth,
          frameHeight: asset.frameHeight,
        });
      } else {
        scene.load.image(asset.key, asset.path);
      }
    });
    scene.load.once('complete', resolve);
    scene.load.start();
  });
}
```

### Custom Middleware Pattern (verified from project's achievementMiddleware.js)

```javascript
// Source: src/store/middleware/achievementMiddleware.js (verified pattern)
export const worldStateMiddleware = (store) => (next) => (action) => {
  // Guard: never intercept redux-persist internal actions
  if (action.type.startsWith('persist/')) return next(action);

  const result = next(action); // Pass through first, read new state after

  if (action.type === 'quests/completeQuest') {
    // Auto-set flag after quest completes
    const { questId } = action.payload || {};
    if (questId && WORLD_STATE_KEYS[`QUEST_${questId.toUpperCase()}_COMPLETE`]) {
      store.dispatch(setFlag({
        key: WORLD_STATE_KEYS[`QUEST_${questId.toUpperCase()}_COMPLETE`],
        value: true,
      }));
    }
  }

  return result;
};
```

### WORLD_STATE_KEYS Convention

```javascript
// Convention from REQUIREMENTS.md INFRA-04: {zone}_{action}_{target}
// All keys: lowercase_snake_case string values, SCREAMING_SNAKE_CASE JS keys

export const WORLD_STATE_KEYS = {
  // Onboarding
  ONBOARDING_COMPLETE: 'onboarding_complete',
  ONBOARDING_FIRST_WORD_LEARNED: 'onboarding_first_word_learned',

  // Zone prefix convention: {zoneid}_{action}_{subject}
  OASIS_MET_MENTOR: 'oasis_met_mentor',
  OASIS_MET_SCHOLAR_YUSUF: 'oasis_met_scholar_yusuf',
  OASIS_QUEST_TUTORIAL_COMPLETE: 'oasis_quest_tutorial_complete',

  LIBRARY_ACCESS_GRANTED: 'library_access_granted',
  LIBRARY_LOST_CHAPTER_FOUND: 'library_lost_chapter_found',

  MARKETPLACE_MEDIATION_COMPLETE: 'marketplace_mediation_complete',
  // ... continue for all 8 zones × ~60 flags each = 500+
};
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual setFlag dispatches with raw strings | WORLD_STATE_KEYS constants + middleware auto-dispatch | Phase 50 (new) | Prevents typo bugs; IDE autocomplete on all flag names |
| All BootScene assets loaded upfront | Shared assets upfront, zone assets on transition | Phase 50 (new) | Initial Phaser load time reduced; no flash for previously-visited zones |
| worldState in localStorage (small payload) | worldState in IndexedDB (500+ flags = ~50KB JSON) | Phase 50 (new) | localStorage has 5-10MB limit; IndexedDB handles large key sets |
| Main JS bundle 1,235KB | Target under 500KB via GameLayout lazy-wrapping | Phase 50 (new) | Time to interactive cut by 60%+ |

**Current bundle reality (from `npm run build` output):**
- `index-*.js` (initial chunk): **1,235KB** — target: under 500KB
- `phaser-*.js`: 1,208KB — already a separate chunk, not in initial load path
- `vocabulary-data-*.js`: 1,704KB — already a separate chunk, not in initial load path
- `npc-data-*.js`: 567KB — already a separate chunk, not in initial load path

The 1,235KB initial chunk is dominated by GameLayout's eager imports of game overlay components. The Phaser and data chunks are already correctly split.

---

## Open Questions

1. **Which overlays contribute most to the initial chunk?**
   - What we know: GameLayout eagerly imports 25+ components; top suspects by transitive dependency weight are BattleOverlay (imports battle systems + spell data), MagicOverlay, InventoryUI, and RecipeBook
   - What's unclear: Exact bytes per overlay — this requires `npm run build:analyze` after adding the visualizer
   - Recommendation: Plan 50-01 adds the visualizer first, then uses the treemap to target specific lazy-wrapping in the same plan

2. **Does ZoneTransition.transitionTo() have a safe insertion point for loadZoneAssets?**
   - What we know: `ZoneTransition.js` has a clean async/await flow with try/catch/finally; `this.scene.loadZone()` is called after fade-out
   - What's unclear: Whether `loadZone()` re-uses textures already cached by a previous visit (likely yes — Phaser TextureManager caches by key)
   - Recommendation: Call `loadZoneAssets(this.scene, zoneName)` between fade-out completion and `this.scene.loadZone()` call

3. **How many WORLD_STATE_KEYS need to be defined in Phase 50?**
   - What we know: Requirement says 500+ flags; existing flags live as raw strings in zones.js, worldStateHelpers.js, ActionSetExecutor.js, WorldScene.js, RiddleGate.js, PuzzleManager.js
   - What's unclear: Full enumeration without a codebase grep sweep — plan 50-03 should grep for all existing raw string flag names and include them in the constants file
   - Recommendation: Grep for all `setFlag\(` calls and `flagId:` references to build the initial WORLD_STATE_KEYS; supplement with ~450 new flags following the naming convention for quests/NPCs/purchases across all 8 zones

---

## Sources

### Primary (HIGH confidence)
- Official Phaser 3 docs: https://docs.phaser.io/phaser/concepts/loader — verified `textures.exists()` and `load.start()` behavior
- RTK official docs: https://redux-toolkit.js.org/api/createListenerMiddleware — verified middleware API
- Project source code (verified directly):
  - `src/store/store.js` — IndexedDB persist pattern for 6 existing slices
  - `src/store/middleware/achievementMiddleware.js` — exact middleware pattern to clone
  - `src/store/slices/worldStateSlice.js` — current state: setFlag/incrementCounter reducers exist
  - `src/store/slices/npcSlice.js` — `npc/teachWord` action type confirmed
  - `src/store/slices/economySlice.js` — `economy/recordPurchase` action type confirmed
  - `src/store/slices/questSlice.js` — `quests/completeQuest` action type confirmed
  - `vite.config.js` — existing manualChunks configuration
  - `src/routes.jsx` — routes already using React.lazy
  - `src/components/Router/GameLayout.jsx` — 25 eager imports identified as bundle source
  - `npm run build` output — 1,235KB initial chunk confirmed

### Secondary (MEDIUM confidence)
- rollup-plugin-visualizer version 7.0.1: confirmed via `npm info rollup-plugin-visualizer version`
- Visualizer configuration options: verified via GitHub btd/rollup-plugin-visualizer README

### Tertiary (LOW confidence)
- Bundle size reduction estimate (60%): based on the fact that the data chunks (phaser, vocabulary, npc) are already split correctly; the remaining 1,235KB is dominated by overlay component code, not vendor libraries

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages are either already installed or verified via npm registry
- Architecture: HIGH — patterns cloned from existing project code (achievementMiddleware, indexedDBAdapter, ZoneTransition)
- Bundle size target: MEDIUM — 500KB is achievable but exact number depends on treemap analysis after adding visualizer
- Pitfalls: HIGH — all 6 pitfalls are derived from the actual codebase patterns and verified Phaser/Redux documentation

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (all dependencies are stable; Vite 7, RTK 2.x, Phaser 3.90 are not in active churn)
