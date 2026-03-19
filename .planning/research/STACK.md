# Stack Research — v11.0 Deep Systems & Content Engine

**Project:** GoGo Arabic v11.0 (17 new systems layered onto 196K+ LOC codebase)
**Researched:** 2026-03-19
**Confidence:** HIGH for inkjs integration | MEDIUM for AceBase | HIGH for bundle optimization | HIGH for calligraphy | HIGH for faction/world-state patterns

---

## Executive Summary

The existing stack (React 19 + Phaser 3 + Redux Toolkit + Vite 7) handles most v11.0 systems without new dependencies. **Two new npm packages are required:** `inkjs` for ink dialogue scripting, and `rollup-plugin-visualizer` for bundle analysis. AceBase is listed as "already installed" in milestone context but is **NOT in node_modules or package.json** — this needs resolving. The bundle optimization is achievable with existing Vite manualChunks patterns already in place.

**Critical finding:** inkjs v2.4.0 and acebase v1.29.5 are NOT installed despite the milestone context claiming they are. Both need `npm install`.

---

## New Dependencies Needed

### Required: Install Now

| Package | Version | Purpose | Why Needed |
|---------|---------|---------|------------|
| `inkjs` | `^2.4.0` | Ink narrative scripting runtime | Compiles `.ink` files to JSON, runs branching dialogue via `Story.Continue()` / `ChooseChoiceIndex()`. Replaces hardcoded JSON dialogue trees. Zero dependencies, 0-dep, works in browser. |
| `rollup-plugin-visualizer` | `^5.12.0` | Bundle composition analysis | Dev-only. Generates interactive treemap showing which modules are eating bundle size. Required to identify what to cut from 862KB → 500KB target. |

### Already Claimed But NOT Installed (Verify First)

| Package | Status | Action |
|---------|--------|--------|
| `inkjs` | NOT in package.json or node_modules | `npm install inkjs` |
| `acebase` | NOT in package.json or node_modules | Decision needed — see AceBase section below |

---

## System-by-System Stack Decisions

### 1. inkjs Dialogue Engine

**Decision: Use inkjs v2.4.0 — install it**

inkjs is the official JavaScript port of inkle's ink scripting language. Version 2.4.0 was released February 17, 2025. Zero dependencies, browser-compatible, well-maintained (regular releases through 2023-2025).

**Why ink over the existing JSON dialogue system:**
The existing DialogueEngine reads from npcs.json with flat hub-and-spoke arrays. ink provides conditional branching (`{visited_kira}`, `{faction_rep > 50}`), knots/stitches as named sections, `CHOICE` syntax, variable tracking, and `ChoosePathString("knot.stitch")` for jumping to scenes. All of this replaces hundreds of lines of custom conditional logic in DialogueEngine.js with declarative `.ink` files.

**Core API (HIGH confidence, verified on GitHub):**
```javascript
import { Story } from 'inkjs';

// Load compiled JSON (output of ink Compiler or Inky editor)
const story = new Story(compiledInkJSON);

// Advance narrative
while (story.canContinue) {
  const text = story.Continue();
  // render text
}

// Present choices
const choices = story.currentChoices; // [{ text, index }]
story.ChooseChoiceIndex(0);

// Jump to named knot
story.ChoosePathString('desert_zone.meet_merchant');

// Read/write ink variables (faction rep, world flags)
story.variablesState['faction_scholar_rep'] = 45;
const rep = story.variablesState['faction_scholar_rep'];
```

**Integration point:** Replace DialogueEngine.js JSON parsing. Load `.ink.json` files per NPC/zone via dynamic import. Keep EventBus (`EVENTS.DIALOGUE_START`, `EVENTS.DIALOGUE_END`) unchanged — only the engine internals change.

**Bundle impact:** inkjs adds ~120KB unminified. Assign to its own chunk in vite.config.js:
```javascript
if (id.includes('node_modules/inkjs')) return 'inkjs-vendor';
```

---

### 2. AceBase Realtime Sync

**Decision: DEFER — evaluate whether it's actually needed for v11.0**

**Status found:** AceBase v1.29.5 (released October 2, 2024) — actively maintained, last update 5 months ago. However, it is NOT installed in this project despite the milestone context claiming it is.

**The problem with adding AceBase now:**
- The project already has IndexedDB hybrid persistence (v6.0, 5 slices via redux-persist) for offline storage
- The backend (Express 5 + MongoDB) already handles cloud sync with version vectors and conflict resolution (v1.0)
- AceBase would add a third persistence layer, creating three competing sources of truth: MongoDB (backend), IndexedDB (frontend persist), and AceBase (?)
- Bundle cost: acebase adds ~200-300KB — a major problem when the target is 862KB → 500KB

**What AceBase actually provides that the current stack doesn't:**
- Live data proxy: automatic object mutation tracking without manual `dispatch()` calls
- Real-time cross-tab sync: changes in tab A immediately reflect in tab B
- Observable queries: `ref.on('value', callback)` pattern

**Recommendation: Replace AceBase's intended role with plain Redux + redux-persist patterns.** The "replace manual CRUD" goal can be achieved with RTK's `createAsyncThunk` + `useSelector` memoization, not a new database layer. If the world state machine needs 500+ variables tracked, a dedicated `worldStateSlice` with IndexedDB persistence is architecturally cleaner than AceBase.

**If the team insists on AceBase:** Install `acebase@^1.29.5`. Use browser-mode only (IndexedDB backend, no server). The live data proxy API allows `proxy.world_flags.desert_gate_open = true` to auto-persist — but this conflicts with Redux's unidirectional data flow.

**MEDIUM confidence** on this recommendation — the tradeoffs depend on how much real-time cross-tab sync matters for this single-player game.

---

### 3. Faction Reputation Engine

**Decision: Plain Redux slice — no new library**

A `factionSlice` with 6 faction objects is the right pattern. Each faction has a reputation score (0-100), tier thresholds (hostile/neutral/friendly/revered), and content gates. This is 150 lines of Redux, not a library problem.

```javascript
// factionSlice.js
const initialState = {
  factions: {
    scholars: { reputation: 0, tier: 'neutral', unlockedContent: [] },
    merchants: { reputation: 0, tier: 'neutral', unlockedContent: [] },
    guardians: { reputation: 0, tier: 'neutral', unlockedContent: [] },
    poets: { reputation: 0, tier: 'neutral', unlockedContent: [] },
    travelers: { reputation: 0, tier: 'neutral', unlockedContent: [] },
    ancient_order: { reputation: 0, tier: 'neutral', unlockedContent: [] },
  }
};
```

**Content gating pattern:** `selectCanEnterZone(zoneId)` selector checks faction tier + vocabulary count. All existing zone-gate infrastructure from v7.0 (`ActionSetExecutor`, `visibilityFlag`) supports this without changes.

---

### 4. World State Machine (500+ Variables)

**Decision: `worldStateSlice` with IndexedDB persistence — no XState, no external library**

XState is overkill. The 500+ variables are not a state machine with transitions — they're a flat key-value store of flags: `{ desert_gate_open: true, met_elder_ibrahim: false, ... }`. XState adds 60KB for transition modeling that isn't needed here.

**Pattern:**
```javascript
// worldStateSlice.js
const worldStateSlice = createSlice({
  name: 'worldState',
  initialState: { flags: {}, counters: {}, timestamps: {} },
  reducers: {
    setFlag: (state, action) => { state.flags[action.payload.key] = action.payload.value; },
    incrementCounter: (state, action) => { state.counters[action.payload.key] = (state.counters[action.payload.key] || 0) + 1; },
  }
});
```

**Ink integration:** inkjs `variablesState` syncs bidirectionally with this slice — reading Redux flags into ink variables before each dialogue, writing ink variable changes back to Redux after.

**Persistence:** Add `worldState` to the existing IndexedDB persist configuration (already proven in v6.0 for 5 slices).

---

### 5. Dynamic Market Simulation

**Decision: Pure JavaScript agent logic — no library**

Agent-based market pricing is 200 lines of math, not a library problem. Each NPC merchant has a `pricingAgent` object with supply/demand state:

```javascript
class PricingAgent {
  constructor(basePrice, supplyLevel, demandFactors) { ... }

  recalculatePrice(playerPurchaseHistory, timeOfDay, factionRep) {
    const demand = this.demandFactors.reduce((acc, f) => acc * f.weight, 1.0);
    const supply = this.supplyLevel / this.maxSupply;
    return Math.floor(this.basePrice * (demand / supply) * this.factionModifier);
  }
}
```

Runs on zone entry and after each purchase. No realtime needed — deterministic recalculation. Integrates with existing `economySlice` from v6.0.

---

### 6. Calligraphy Mini-Game (Letter Tracing)

**Decision: Phaser 3 Graphics API — no Canvas library**

Phaser 3 already has Graphics drawing, pointer input, and path tracking. No external library needed.

**Technique:**
1. Render reference letter path using Phaser `Graphics.strokePath()` with a template outline
2. Track `this.input.on('pointermove', ...)` to capture player stroke coordinates
3. Compare player path against reference path using Frechet distance (simple 2D math) — score is deviation from ideal stroke
4. Render accuracy feedback using Phaser `Graphics.lineStyle(thickness, color)`

**Why no library (Fabric.js, Atrament, etc.):** The game already runs in a Phaser canvas context. Adding a second canvas library creates two canvas renderers fighting for control. Phaser's built-in pointer events + Graphics are sufficient for letter-tracing accuracy scoring.

**Verified:** Phaser 3 official examples include "Stroke Path" demonstrating this exact pattern. Touch/pointer events work identically on mobile and desktop.

---

### 7. Arabic Poetry Battles

**Decision: Pure React + existing FSRS integration — no library**

Fill-in-the-blank poetry is a quiz variant. The existing quiz infrastructure (6 quiz types, FSRS integration) is directly extendable:
- New quiz type: `POETRY_FILL`
- Data structure: `{ poem: string[], blanks: [{ index, word, arabicWord }], difficultyLevel }`
- Scoring: combines answer accuracy with timing (streak mechanic from existing battle system)

No new library needed. Reuses existing `QuizOverlay.jsx` patterns with a custom poem rendering component.

---

### 8. Bundle Optimization (862KB → 500KB)

**Decision: rollup-plugin-visualizer (new dev dependency) + Vite manualChunks refinement**

The current vite.config.js already has a solid manualChunks strategy. The problem is identifying what's actually bloating the 862KB — that requires visualization first.

**Step 1: Diagnose with rollup-plugin-visualizer**
```javascript
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  react({ jsxRuntime: 'automatic' }),
  validateDialoguePlugin(),
  visualizer({ open: true, gzipSize: true, brotliSize: true }) // dev only
]
```

**Step 2: Expected wins based on codebase analysis:**

| Optimization | Estimated Savings | Technique |
|-------------|------------------|-----------|
| inkjs lazy-loaded | ~120KB from initial load | Dynamic import only when dialogue opens |
| Game overlays lazy-loaded | ~80-120KB | `React.lazy()` for InventoryGrid, QuestJournal, etc. |
| Vocabulary data deferred | ~150KB | Already split to `vocabulary-data` chunk, ensure not in initial |
| NPC data deferred | ~60KB | Already split to `npc-data` chunk |
| Phaser scene lazy-loading | ~100KB+ | Load non-starter zones on demand via `scene.launch()` |

**Target strategy:** Initial load = React shell + auth + loading screen + BootScene only. Defer all game data, overlays, and inkjs until after initial render.

**Current Vite config status:** Already splits Phaser, React, Redux, vocabulary-data, npc-data into separate chunks. The 862KB likely reflects the main app chunk + untracked large imports. Visualizer will reveal the exact culprit.

---

## Full Package Change Summary

### Install (New)
```bash
npm install inkjs@^2.4.0
npm install -D rollup-plugin-visualizer@^5.12.0
```

### Verify Installation (Context Says Installed, But They Are Not)
```bash
# These are NOT in node_modules or package.json — install before any v11.0 phase
npm install inkjs@^2.4.0   # dialogue engine migration
# npm install acebase@^1.29.5  # DEFER — see decision above
```

### No Changes Needed
```bash
# Everything else already installed and sufficient:
# react@19.2.4, phaser@3.90.0, @reduxjs/toolkit@2.11.2
# framer-motion@11.15.0, redux-persist@6.0.0, ts-fsrs@5.2.3
# zod@4.3.6, howler@2.2.4
```

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **XState** | 60KB for state machine modeling not needed — world flags are flat key-value, not transition graphs | Plain `worldStateSlice` with Redux |
| **Fabric.js / Atrament** | Second canvas renderer conflicts with Phaser's canvas context | Phaser 3 `Graphics` API + pointer events |
| **AceBase** (for now) | 200-300KB bundle cost; third persistence layer conflicts with existing IndexedDB + MongoDB; single-player game doesn't need real-time cross-tab sync | `worldStateSlice` + IndexedDB persist (already proven) |
| **React Query / SWR** | Server state management libraries for REST/GraphQL — overkill when Express 5 backend already handles sync | Existing `createAsyncThunk` patterns in Redux slices |
| **react-konva** | Canvas-in-React abstraction for calligraphy tracing | Phaser 3 Graphics (already integrated, no React-canvas bridge needed) |
| **GreenSock (GSAP)** | Animation library already covered by Framer Motion + Phaser tweens | Existing `Phaser.Tweens` + Framer Motion |
| **Immer standalone** | RTK bundles Immer internally — no separate install needed | RTK's `createSlice` (already mutable write syntax works) |

---

## Version Compatibility

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| `inkjs` | 2.4.0 | React 19, Vite 7, all browsers | Zero deps. Works via ESM import. Add to manualChunks. |
| `rollup-plugin-visualizer` | ~5.12.0 | Vite 7 (uses Rollup 4 internally) | Dev dependency only. Does not affect production bundle. |
| `acebase` | 1.29.5 | React 19, IndexedDB (browser) | Last release Oct 2024. Single maintainer. Evaluate before committing. |

---

## Integration Points for Phases

### inkjs → DialogueEngine.js
- Load compiled `.ink.json` per zone via dynamic import (not all upfront)
- `InkDialogueEngine.js` wraps `inkjs.Story`, exposes `advance()`, `getChoices()`, `jumpToKnot()`
- EventBus interface unchanged: `EVENTS.DIALOGUE_START` / `EVENTS.DIALOGUE_END`
- `narrativeSlice` stores ink save state (`story.state.toJson()`) for persistence

### worldStateSlice → inkjs
- Before dialogue: inject Redux flags into `story.variablesState`
- After dialogue: sync ink variable mutations back to Redux via `setFlag` dispatches
- Bidirectional sync pattern — same approach as existing FSRS-root mastery sync (v6.0)

### factionSlice → ActionSetExecutor
- Existing `ActionSetExecutor` (9 actions, 7 requirements from v7.0) gains `factionRequired` requirement type
- No new infrastructure — one new requirement type in existing executor

### Bundle optimization → vite.config.js
- Add `rollup-plugin-visualizer` to existing plugins array (dev only)
- Add inkjs to `manualChunks` (loaded lazily)
- Add `React.lazy()` to heavy overlays (InventoryGrid, QuestJournal, CompanionPanel)

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| inkjs (for dialogue scripting) | Keep JSON dialogue trees | JSON trees can't handle 500+ world state variables conditionally — would require rewriting DialogueEngine from scratch anyway |
| Phaser Graphics (calligraphy) | Fabric.js or Atrament | Two canvas renderers conflict; Phaser already handles input events correctly |
| Plain Redux slice (world state) | XState | 60KB cost; FSM transition modeling adds complexity without benefit for flat flag stores |
| rollup-plugin-visualizer | vite-bundle-analyzer | rollup-plugin-visualizer is more mature, Vite-compatible, generates treemap/sunburst views |
| Defer AceBase | Add AceBase now | Bundle cost + architectural conflict with existing IndexedDB persist makes it a v12.0 consideration |

---

## Sources

- [inkjs GitHub (inkle)](https://github.com/inkle/inkjs) — Official repo, API reference, v2.4.0 release Feb 2025 (MEDIUM confidence — no Context7 entry, GitHub verified)
- [inkjs GitHub (y-lohse fork)](https://github.com/y-lohse/inkjs) — Releases page, v2.4.0 confirmed Feb 17 2025 (MEDIUM confidence)
- [AceBase GitHub](https://github.com/appy-one/acebase) — v1.29.5 release Oct 2, 2024, 521 stars, actively maintained (MEDIUM confidence — single maintainer risk)
- [rollup-plugin-visualizer GitHub](https://github.com/btd/rollup-plugin-visualizer) — Vite integration, Node.js 22 requirement confirmed (MEDIUM confidence)
- [Phaser 3 Graphics Docs](https://docs.phaser.io/phaser/concepts/gameobjects/graphics) — strokePath, pointer events for tracing mini-game (HIGH confidence — official docs)
- [Vite manualChunks discussion](https://github.com/vitejs/vite/discussions/17730) — Code splitting patterns for large apps (MEDIUM confidence)
- Existing `package.json` (frontend + server) — All installed versions verified 2026-03-19 (HIGH confidence)
- Existing `vite.config.js` — Current manualChunks strategy analyzed 2026-03-19 (HIGH confidence)
- `node_modules/` inspection — Confirmed inkjs and acebase NOT installed (HIGH confidence)

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| inkjs API | MEDIUM | GitHub verified, not in Context7. Core `Story` API stable since v2.0. |
| AceBase recommendation | MEDIUM | Single maintainer; "don't add it yet" is defensive but evidence-based |
| Bundle optimization | HIGH | Vite manualChunks well-documented, existing config analyzed |
| Calligraphy (Phaser Graphics) | HIGH | Phaser official docs confirm Graphics + pointer events sufficient |
| Faction/world-state (plain Redux) | HIGH | 17 existing slices prove the pattern scales |
| inkjs not installed | HIGH | Verified by inspecting node_modules and package.json |

---

*Stack research for: v11.0 Deep Systems & Content Engine (inkjs, AceBase, faction system, world state, dynamic market, calligraphy, poetry battles, bundle optimization)*
*Researched: 2026-03-19*
*Confidence: HIGH (installation status verified; new packages identified; patterns confirmed against existing 196K LOC codebase)*
