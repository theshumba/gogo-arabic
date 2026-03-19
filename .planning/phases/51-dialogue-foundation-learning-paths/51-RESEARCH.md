# Phase 51: Dialogue Foundation & Learning Paths — Research

**Researched:** 2026-03-19
**Domain:** inkjs dialogue engine, Redux/ink state bridging, FSRS queue ordering, onboarding path wiring
**Confidence:** HIGH (codebase read directly; inkjs verified via official repo; patterns from existing middleware confirmed)

---

## Summary

Phase 51 has four distinct workstreams that share one integration surface: the existing `DialogueEngine.js` must grow into an `InkDialogueEngine.js` adapter that runs either a compiled `.ink.json` Story or falls back to the legacy JSON tree without changing any caller code. inkjs 2.4.0 is the correct install — it ships as a zero-dependency ES module, dynamic-imports cleanly into Vite's code splitting, and its `variablesState` proxy maps directly onto Redux `setFlag`/`selectFlag` from `worldStateSlice`.

The companion dialogue problem is simpler than it looks: 11 of 12 companions (all except Amira) use `Array.from({length: N})` to generate blocks where every line shares the same Arabic phrase. The structure is correct — ID, arabic, english, transliteration, context/trigger fields all exist — but the text needs to be written as 151 unique lines per companion. Amira has 171 real lines and needs ~29 more. The REQUIREMENTS number of 573 covers the lines across a subset of companions that are highest-priority to fix before v11.0 ships (the planning assumption is ~52 unique lines per companion × 11 companions).

The learning path system already has a `setLearningPath` reducer in `playerSlice` and a `PathChoice` React overlay, but the overlay currently fires as a screen menu (`tutorialPhase === 'path_choice'`). PATH-01 requires it to come from Amira's dialogue tree as an in-world choice — meaning the ink tree must dispatch `setLearningPath` through a `BindExternalFunction` call when the player picks. The FSRS new-card selector `selectNewCardsByFrequency` sorts by CEFR then frequency; adding a path-domain affinity sort is a small extension on top of the existing comparator.

**Primary recommendation:** Install inkjs as a runtime dependency, create `InkDialogueEngine.js` that wraps ink `Story` with a legacy JSON fallback adapter, use `BindExternalFunction` to bridge ink variables into Redux dispatches, author a single `.ink` file for Amira's path-choice tree plus 4 additional pilot NPCs, and extend `selectNewCardsByFrequency` with a domain-affinity sort tier.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| inkjs | 2.4.0 | Compiled `.ink.json` story runtime | Official JS port of inkle's ink; zero deps; ESM; latest Feb 2026 |
| ts-fsrs | 5.2.3 | FSRS spaced repetition scheduling | Already installed; new-card selector `selectNewCardsByFrequency` already in slice |
| @reduxjs/toolkit | 2.11.2 | State management | Already installed; `worldStateSlice` is the ink↔Redux bridge |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Inky (desktop app) | latest | Author and compile `.ink` → `.ink.json` | Writing Amira's path-choice tree and 4 pilot NPC trees; install separately on machine, not in project |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| inkjs | yarn-spinner, Twine | inkjs is lighter, browser-native, established JS port; ink scripting is explicitly required by INFRA-07 |
| Dynamic import for `.ink.json` | Fetch from public/ | Dynamic import is tree-shakeable and gets its own Vite chunk (INFRA-08 requirement); fetch is simpler but not chunk-split |

**Installation:**
```bash
npm install inkjs
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── game/systems/
│   ├── DialogueEngine.js         # Existing legacy engine (DO NOT MODIFY)
│   └── InkDialogueEngine.js      # NEW: adapter wrapping ink Story + legacy fallback
├── data/
│   └── ink/                      # NEW: compiled .ink.json files (one per NPC)
│       ├── guide-amira.ink.json
│       ├── scholar-yusuf.ink.json
│       └── ... (4 more pilot NPCs)
public/
└── (no ink files here — dynamic import handles Vite chunks, not public/)
```

### Pattern 1: Adapter with Legacy Fallback (INFRA-07, INFRA-08)

**What:** `InkDialogueEngine` tries to load `{npcId}.ink.json` via dynamic import; if no ink file exists, it delegates all calls to the legacy `DialogueEngine`. Both paths satisfy the same interface.

**When to use:** Every NPC interaction after Phase 51. Pilot 5 NPCs have ink files; all others fall back automatically.

**Example:**
```javascript
// Source: adapter pattern — no external ref, project convention
export class InkDialogueEngine {
  constructor(scene, legacyDialogueEngine) {
    this.scene = scene;
    this.legacy = legacyDialogueEngine;
    this._story = null;
    this._inkLoaded = false;
  }

  async loadForNpc(npcId) {
    try {
      // INFRA-08: dynamic import gives .ink.json its own Vite chunk
      const mod = await import(`../data/ink/${npcId}.ink.json`);
      const { Story } = await import('inkjs');
      this._story = new Story(mod.default);
      this._bindExternalFunctions();
      this._inkLoaded = true;
    } catch {
      // No .ink.json for this NPC — use legacy path
      this._inkLoaded = false;
    }
  }

  // INFRA-09: sync Redux flags INTO ink before dialogue starts
  syncStateIn() {
    if (!this._inkLoaded) return;
    const state = store.getState();
    const flags = state.worldState.flags;
    for (const [key, value] of Object.entries(flags)) {
      try {
        this._story.variablesState[key] = value;
      } catch { /* ink variable not declared in .ink — skip */ }
    }
  }

  // INFRA-09: flush ink variable mutations OUT to Redux after dialogue ends
  syncStateOut() {
    if (!this._inkLoaded) return;
    // Only flush keys that are in WORLD_STATE_KEYS values
    const knownValues = new Set(Object.values(WORLD_STATE_KEYS));
    for (const varName of this._story.variablesState._globalVariables?.keys() ?? []) {
      if (knownValues.has(varName)) {
        const val = this._story.variablesState[varName];
        store.dispatch(setFlag({ key: varName, value: val }));
      }
    }
  }
}
```

### Pattern 2: BindExternalFunction for Redux Dispatch (INFRA-09)

**What:** Bind named functions into ink so `.ink` scripts can call Redux actions (setLearningPath, startQuest, etc.) as if they were ink functions.

**When to use:** Any ink dialogue that needs to modify game state — learning path choice, quest starts, relationship changes.

**Example:**
```javascript
// Source: inkjs official README — BindExternalFunction pattern
_bindExternalFunctions() {
  // PATH-01/PATH-02: allow ink script to set learning path via choice
  this._story.BindExternalFunction('setLearningPath', (path) => {
    store.dispatch(setLearningPath(path));
    store.dispatch(setFlag({ key: WORLD_STATE_KEYS.ONBOARDING_PATH_CHOSEN, value: true }));
  });

  // Quest start from ink
  this._story.BindExternalFunction('startQuest', (questId) => {
    store.dispatch(updateQuestProgress({ questId, amount: 0 }));
  });

  // Relationship change from ink
  this._story.BindExternalFunction('changeRelationship', (npcId, amount) => {
    store.dispatch(incrementNpcRelationship({ npcId, amount }));
  });

  // Read Redux state from ink (returns value to ink)
  this._story.BindExternalFunction('getFlag', (key) => {
    return store.getState().worldState.flags[key] ?? false;
  });
}
```

### Pattern 3: ink Path-Choice Tree Structure

**What:** Amira's path-choice `.ink` script uses ink choices to present Scholar/Traveler/Historian and calls the external `setLearningPath` function.

**When to use:** 51-03 — Amira's path-choice ink tree.

**Example:**
```ink
// guide-amira-path.ink (authored, compiled to .ink.json with Inky)
=== what_draws_you ===
ما الذي يجذبك إلى العربية؟ {playerName}
~ temp path_chosen = ""

* [القارئ — Scholar of Texts]
  ~ path_chosen = "scholar"
  يا للروعة! طريق العلم والقراءة ينتظرك.
  -> confirm_path

* [المسافر — Traveler of Lands]
  ~ path_chosen = "traveler"
  رائع! العربية ستفتح لك أبواب العالم.
  -> confirm_path

* [المؤرخ — Keeper of History]
  ~ path_chosen = "historian"
  ممتاز! التاريخ يبدأ من اللغة.
  -> confirm_path

= confirm_path
~ setLearningPath(path_chosen)
-> END
```

### Pattern 4: Path-Aware FSRS Queue Ordering (PATH-03)

**What:** Extend `selectNewCardsByFrequency` in `vocabularySlice.js` to add a third sort tier: words whose `domainAffinity` field matches the player's current learning path are boosted to the front within each CEFR level.

**When to use:** 51-04 — after path is chosen, new FSRS cards are served in path-biased order.

**Example:**
```javascript
// Extension to selectNewCardsByFrequency in vocabularySlice.js
export const selectNewCardsByPath = createSelector(
  [selectFsrsCards, selectLearningPath, (_state, allWords) => allWords],
  (cards, learningPath, allWords) => {
    const CEFR_ORDER = { A1: 1, A2: 2, B1: 3, B2: 4 };
    const unseenWords = allWords.filter((w) => !cards[w.id]);

    return unseenWords.sort((a, b) => {
      // Tier 1: CEFR level ascending
      const cefrA = CEFR_ORDER[a.cefrLevel] ?? 5;
      const cefrB = CEFR_ORDER[b.cefrLevel] ?? 5;
      if (cefrA !== cefrB) return cefrA - cefrB;

      // Tier 2: path domain affinity match (boost words matching player path)
      if (learningPath) {
        const aMatch = (a.domainAffinity ?? []).includes(learningPath) ? 1 : 0;
        const bMatch = (b.domainAffinity ?? []).includes(learningPath) ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch; // higher match = earlier
      }

      // Tier 3: frequency descending
      return (b.frequency ?? 0) - (a.frequency ?? 0);
    });
  }
);
```

Note: `domainAffinity` field does not yet exist in vocabulary words — it will be added in Phase 52. For Phase 51, PATH-03 requires "minimum 200 words differ in first-encounter order between paths", which means the field must exist on at least 200+ words. The 51-04 plan must add `domainAffinity` to the A1 vocabulary subset that's already in `vocabularyAll.js`.

### Anti-Patterns to Avoid
- **Big-bang migration:** Never migrate all 56 NPCs to ink at once. Pilot 5 NPCs only; the adapter handles the rest via legacy fallback.
- **Ink managing quest logic:** Ink is for narrative text; all quest state lives in Redux. Ink scripts call `BindExternalFunction` to trigger Redux actions — never `story.variablesState` for quest IDs.
- **Loading ink at BootScene:** `.ink.json` files must load via dynamic import when the NPC is first approached, not at boot. INFRA-08 requires a separate Vite chunk — eager loading would embed it in the main bundle.
- **Keeping PathChoice overlay for new players:** PATH-01 requires the path prompt to come from Amira's in-world dialogue. The existing `PathChoice.jsx` overlay (triggered by `tutorialPhase === 'path_choice'`) must be deprecated for new players; the ink dialogue tree replaces it.
- **Using ink's `variablesState` as the Redux store proxy:** Ink variables are synced TO ink before dialogue and flushed FROM ink after — they are not live Redux mirrors during a scene.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dialogue scripting with choices | Custom JSON choice engine | inkjs Story | Ink handles choice loops, variable state, divert graphs, conditional text — hand-rolling duplicates mature work |
| Compiled ink story format | Custom JSON format parser | Inklecate / Inky compiler | inkjs runtime expects `.ink.json` compiled by the official inklecate compiler; non-standard JSON won't work |
| FSRS scheduling algorithm | Custom spaced repetition | ts-fsrs (already installed) | FSRS algorithm is mathematically complex; ts-fsrs is already wired in vocabularySlice |
| Ink variable ↔ Redux bridge | Manual serialization loop | variablesState proxy + known-keys filter | inkjs 2.x provides ES2015 Proxy access; filter by WORLD_STATE_KEYS to avoid clobbering unrelated ink vars |

**Key insight:** inkjs is a thin runtime — it plays back compiled story files. The complexity is in the adapter plumbing (syncStateIn/syncStateOut + BindExternalFunction) and in authoring `.ink` source files. The authoring tooling (Inky desktop app) is separate from the project.

---

## Common Pitfalls

### Pitfall 1: ink Variable Name Collisions
**What goes wrong:** `variablesState` sync tries to write a Redux flag key like `oasis_npc_guide_amira_met` into ink, but that variable was never declared in the `.ink` script — inkjs throws a runtime warning or silently ignores it.
**Why it happens:** `syncStateIn()` iterates all worldState flags and tries to set them all into ink, but ink only exposes variables that are declared with `VAR` in the `.ink` source.
**How to avoid:** In `syncStateIn()`, wrap each write in a try/catch or check `this._story.variablesState._globalVariables.has(key)` before writing. Only sync flags that have a matching `VAR` declaration in the `.ink` script.
**Warning signs:** Console warns "Trying to set a variable that doesn't exist" during dialogue.

### Pitfall 2: Dynamic Import of JSON in Vite
**What goes wrong:** `import('../data/ink/guide-amira.ink.json')` works in dev but fails in production because Vite doesn't automatically include JSON files matched by dynamic import patterns unless the path is a string literal.
**Why it happens:** Vite's chunk analysis requires static string analysis for dynamic imports. A variable like `` `../data/ink/${npcId}.ink.json` `` may not resolve all chunks at build time.
**How to avoid:** Use a `switch` or `import.meta.glob` to enumerate all ink files explicitly.
```javascript
// Vite-safe: import.meta.glob pre-generates all chunk entries
const INK_FILES = import.meta.glob('../data/ink/*.ink.json');
const loader = INK_FILES[`../data/ink/${npcId}.ink.json`];
if (loader) {
  const mod = await loader();
  // ...
}
```
**Warning signs:** Works in `npm run dev` but NPCs silently fall back to legacy JSON after `npm run build`.

### Pitfall 3: tutorialPhase 'path_choice' Overlay Conflict
**What goes wrong:** If the new ink Amira dialogue fires AND the old `PathChoice` overlay triggers simultaneously, the player sees both a dialogue box and the overlay.
**Why it happens:** `GameLayout.jsx` renders `<PathChoice />` when `tutorialPhase === 'path_choice'`. If Amira's ink tree dispatches to tutorialPhase during the ink dialogue, the overlay appears on top.
**How to avoid:** After ink path choice is implemented, ensure the ink tree sets `tutorialPhase` to something that does NOT match `'path_choice'` (e.g., stays at `'awaiting_mentor'` and transitions to `'complete'` only after path is dispatched). The old PathChoice overlay becomes a fallback for returning players who skipped onboarding.
**Warning signs:** Two UI elements appear simultaneously when first word is learned.

### Pitfall 4: 573 Missing Lines — Scope Confusion
**What goes wrong:** Plan confuses "rewriting all 11 companions × 151 lines = 1661 lines" with the actual CONT-01 requirement of 573 lines.
**Why it happens:** The `companionDialogue.js` structure shows all 11 non-Amira companions using `Array.from` generating placeholder text — but CONT-01 only mandates filling the 573 _missing_ lines, not a full rewrite of all placeholder lines.
**How to avoid:** CONT-01 says "All 573 missing companion dialogue lines are filled across 12 companions." Interpret this as: fill the unique lines that complete each companion to their target line count. The 573 figure from the requirements doc is the authoritative number; do not expand scope to rewrite all 1661.
**Warning signs:** Plan 51-02 time estimate balloons well beyond 1 session if scope is misread.

### Pitfall 5: FSRS domainAffinity Field Not Present
**What goes wrong:** PATH-03 selector sorts by `domainAffinity` but no vocabulary words in `vocabularyAll.js` have that field yet (it is defined as a Phase 52 field in CONT-02).
**Why it happens:** PATH-03 was written assuming the full 5000-word corpus from Phase 52 exists at the time of Phase 51.
**How to avoid:** In Plan 51-04, add `domainAffinity` to a minimum of 200+ words from the *existing* A1/A2 vocabulary that's already in `vocabularyAll.js`. This satisfies the "minimum 200 words differ" success criterion with a forward-compatible field that Phase 52 will expand to the full corpus.
**Warning signs:** Scholar and Traveler see identical first-card sequences → PATH-03 success criterion fails.

### Pitfall 6: onboardingComplete Flag Skip Logic
**What goes wrong:** PATH-07 requires returning players to skip cinematic intro and path prompt. The `onboardingComplete` flag in `playerSlice` is persisted to localStorage, but if the player cleared localStorage they lose the skip.
**Why it happens:** `playerSlice` persists to localStorage (root persistReducer), not IndexedDB.
**How to avoid:** The `ONBOARDING_COMPLETE` flag in `worldStateSlice` (IndexedDB) must ALSO be set when onboarding completes — it is the authoritative skip signal. The `onboardingComplete` in `playerSlice` is the React-side guard; `WORLD_STATE_KEYS.ONBOARDING_COMPLETE` in worldState is the Phaser-side guard. Both must be set.

---

## Code Examples

### inkjs Install and Basic Story Setup
```javascript
// Source: inkjs README (github.com/y-lohse/inkjs, version 2.4.0)
import { Story } from 'inkjs';

// Load compiled .ink.json (from dynamic import)
const storyData = await import('../data/ink/guide-amira.ink.json');
const story = new Story(storyData.default);

// Advance story
while (story.canContinue) {
  const text = story.Continue();
  console.log(text);           // current line of narrative
}

// Access choices
const choices = story.currentChoices;
// choices[i].text — display text
// story.ChooseChoiceIndex(i) — pick a choice

// Read / write variables
const val = story.variablesState['player_path'];
story.variablesState['player_path'] = 'scholar';

// Bind external JS function callable from .ink
story.BindExternalFunction('setLearningPath', (path) => {
  store.dispatch(setLearningPath(path));
});
```

### import.meta.glob for Vite-Safe Dynamic Import
```javascript
// Source: Vite docs (vite.dev/guide/features#glob-import)
const INK_FILES = import.meta.glob('../data/ink/*.ink.json');

async function loadInkForNpc(npcId) {
  const key = `../data/ink/${npcId}.ink.json`;
  const loader = INK_FILES[key];
  if (!loader) return null;
  const mod = await loader();
  return mod.default;
}
```

### Vite manualChunks for inkjs Vendor Bundle
```javascript
// Add to vite.config.js manualChunks — keep inkjs out of main bundle
manualChunks(id) {
  if (id.includes('node_modules/inkjs')) {
    return 'ink-vendor';
  }
  // ... existing chunks
}
```

### worldStateMiddleware Pattern (established in Phase 50-03)
```javascript
// Source: src/store/middleware/worldStateMiddleware.js (project file)
// Pattern for new middleware: store => next => action
export const someMiddleware = (store) => (next) => (action) => {
  if (action.type.startsWith('persist/')) return next(action);
  const result = next(action);
  // read state AFTER action is applied
  const state = store.getState();
  // dispatch side-effects as needed
  return result;
};
```

### selectLearningPath selector (playerSlice already has learningPath)
```javascript
// Source: src/store/slices/playerSlice.js (line 36, 289-293)
// learningPath is already in playerSlice initial state — no new slice needed
export const selectLearningPath = (state) => state.player.learningPath;
// Valid values: null | 'scholar' | 'traveler' | 'historian' | 'polymath'
// setLearningPath action already exported from playerSlice
```

### Onboarding Skip Check (PATH-07)
```javascript
// Source: src/store/slices/playerSlice.js (lines 201, 225-229 in GameLayout)
// onboardingComplete already in playerSlice AND as WORLD_STATE_KEYS.ONBOARDING_COMPLETE in worldState
// Check BOTH for robustness:
const onboardingDone =
  store.getState().player.onboardingComplete ||
  store.getState().worldState.flags[WORLD_STATE_KEYS.ONBOARDING_COMPLETE];
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| PathChoice.jsx overlay (tutorialPhase === 'path_choice') | Amira ink dialogue tree in-world | Phase 51 | PATH-01: path choice appears as NPC dialogue, not menu |
| All NPC dialogue in npcs.json / npcsEnriched.js | Pilot NPCs use compiled .ink.json; others keep JSON | Phase 51 | INFRA-07: both paths coexist |
| selectNewCardsByFrequency (CEFR + frequency sort) | selectNewCardsByPath (CEFR + path affinity + frequency) | Phase 51 | PATH-03: Scholar/Traveler see different first-encounter order |
| learningPath set via PathChoice UI dispatch | learningPath set via ink BindExternalFunction in Amira dialogue | Phase 51 | PATH-02: choice handled inside dialogue system |

**Deprecated/outdated:**
- `PathChoice.jsx` overlay trigger via `tutorialPhase === 'path_choice'`: replaced for new players by Amira's ink dialogue tree. The component itself stays as a settings-accessible path-switch UI (PATH-05 uses it).

---

## Open Questions

1. **What are the 5 pilot NPCs for ink migration?**
   - What we know: requirement says "5-NPC pilot migration" but does not name them
   - What's unclear: which NPCs have the most narrative value and the simplest dialogue trees to migrate first
   - Recommendation: Guide Amira (mandatory — PATH-01 requires her ink tree), Scholar Yusuf (main quest act 1), Merchant Fatima (commerce dialogue), Student Khalid (tutorial NPC), and one zone-specific NPC (e.g., librarian-ibrahim for ancient library). Planner should confirm the 5 names in plan 51-01.

2. **Exact count of the 573 missing lines and per-companion distribution**
   - What we know: CONT-01 says 573 across 12 companions; Amira has 171 real lines (target 200+); all other 11 companions have Array.from placeholder lines (151 each, all identical text)
   - What's unclear: The REQUIREMENTS doc says 573 — does this mean 11 companions × 52 new lines each + Amira's 29? Or is it based on a prior audit of companion categories with gaps?
   - Recommendation: Treat 573 as the authoritative number. Write ~52 unique lines per non-Amira companion and ~29 for Amira. Plan 51-02 should target exactly 573 unique new lines split across categories.

3. **Does vocabularyAll.js have any `domainAffinity` field today?**
   - What we know: No — `selectNewCardsByFrequency` only uses `cefrLevel` and `frequency`. PATH-03 requires the field.
   - What's unclear: Whether the plan should add domainAffinity to the existing vocabulary in 51-04, or defer entirely to Phase 52
   - Recommendation: Add `domainAffinity` array to a minimum of 200 A1 words in `vocabularyAll.js` within Plan 51-04 so PATH-03 success criterion is met. Phase 52 will add it to the full 5000-word corpus.

---

## Sources

### Primary (HIGH confidence)
- `src/game/systems/DialogueEngine.js` — existing engine, interface to wrap
- `src/store/slices/playerSlice.js` — `learningPath`, `setLearningPath`, `onboardingComplete`, `tutorialPhase` all confirmed present
- `src/store/slices/vocabularySlice.js` — `selectNewCardsByFrequency` implementation confirmed; `setReviewQueue` action confirmed
- `src/store/slices/worldStateSlice.js` — `setFlag`, `selectFlag`, IndexedDB persist confirmed (Phase 50)
- `src/data/worldStateKeys.js` — `ONBOARDING_PATH_CHOSEN`, `PATH_SCHOLAR_CHOSEN` etc. already defined
- `src/data/companionDialogue.js` — companion dialogue structure confirmed; 11 of 12 use Array.from placeholders
- `src/components/Onboarding/PathChoice.jsx` — existing overlay confirmed; dispatches `setLearningPath` + `setTutorialPhase`
- `src/components/Router/GameLayout.jsx` — `tutorialPhase === 'path_choice'` renders `<PathChoice />`
- `src/data/quests.json` — quests have `learningPath: null` field (stub ready for PATH-04 path-gated quests)
- `package.json` — inkjs NOT installed (must be added); ts-fsrs 5.2.3 confirmed present
- `vite.config.js` — `manualChunks` pattern confirmed; inkjs vendor chunk must be added
- inkjs GitHub README (github.com/y-lohse/inkjs) — version 2.4.0, Story API, variablesState, BindExternalFunction confirmed
- inkle/ink WritingWithInk.md — knot/stitch/choice/divert/VAR syntax confirmed

### Secondary (MEDIUM confidence)
- inkjs npm page — version 2.4.0 confirmed via WebFetch of GitHub repo (npm page returned 403)
- `.planning/phases/50-infrastructure-baseline/50-03-SUMMARY.md` — worldStateMiddleware pattern, WORLD_STATE_KEYS decisions confirmed

### Tertiary (LOW confidence)
- WebSearch result: Redux ↔ inkjs state sync discussion (y-lohse/inkjs medium post, ~2018) — broad pattern confirmed but code examples are old; verified against current inkjs 2.x API

---

## Metadata

**Confidence breakdown:**
- inkjs install + API: HIGH — verified via official GitHub repo (version 2.4.0, Feb 2026)
- Adapter pattern: HIGH — DialogueEngine.js read directly; interface is clear
- State bridging (variablesState ↔ Redux): HIGH — API confirmed; implementation is plumbing, not discovery
- Companion dialogue structure: HIGH — companionDialogue.js read directly; Array.from placeholders confirmed
- FSRS queue ordering: HIGH — selectNewCardsByFrequency read directly; extension is additive
- domainAffinity field gap: HIGH — vocabularyAll.js and vocabularySlice both read directly; field does not exist
- import.meta.glob Vite pattern: MEDIUM — Vite docs confirm glob pattern; not tested in this specific project yet

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (30 days — inkjs is stable; worldStateSlice established in Phase 50)
