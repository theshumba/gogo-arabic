# Phase 55: Mini-Games and Content Polish — Research

**Researched:** 2026-03-20
**Domain:** Phaser 3 scene architecture, Frechet distance scoring, Redux slice patterns, Arabic poetry data, battle system test coverage
**Confidence:** HIGH

---

## Summary

Phase 55 delivers two original Arabic learning mini-games (calligraphy tracing as a dedicated lazy-loaded Phaser scene, and poetry battles as a new battle mode), plus test coverage for the existing combat system before poetry battles extend it. All three systems are greenfield additions that slot into well-established project patterns.

The calligraphy scene is a new Phaser scene (not a React route) launched via the existing `SceneStackManager.pushScene()` pattern, registered lazily in `gameConfig.scene[]` at runtime, and wired into MiniGamesHub with a route entry in `routes.jsx`. The existing crafting `CalligraphyTracing.jsx` uses pixel-comparison scoring (O(n^2) per pixel), which is not reusable for the 28-letter isolated form use case — the plan uses Frechet distance on captured point arrays instead, which is the correct algorithm for stroke path comparison. Poetry battles do NOT extend `BattleStateMachine` or `BattleScene`; they are a separate UI overlay backed by a new `poetrySlice`, keeping the combat system untouched. The 55-01 test plan adds unit-test coverage for `BattleStateMachine`, `GrammarComboDetector`, and `StatusEffectBar` — these are standalone additions with no production code changes.

**Primary recommendation:** Implement in plan order (01 tests → 02-03 CalligraphyScene → 04-05 poetry). The Frechet distance implementation is entirely in pure JS (no library needed); the 28 reference paths are authored as JSON arrays of `{x, y}` normalized to a 0-1 unit square. Poetry battles are a pure Redux + React feature with no Phaser involvement.

---

## Standard Stack

### Core (already installed, verified from package.json)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| phaser | ^3.90.0 | CalligraphyScene rendering, pointer input capture | All game scenes use Phaser 3 |
| @reduxjs/toolkit | ^2.11.2 | poetrySlice state management, calligraphy progress flag | All slices use RTK |
| ts-fsrs | ^5.2.3 | FSRS word sourcing for poetry fill-in-the-blank options | Used in fsrs.js/vocabularySlice |
| framer-motion | ^11.15.0 | Poetry battle UI animations | Used across all battle overlays |
| vitest | ^3.0.0 | Test runner for 55-01 coverage plan | Project test framework |

### No New Dependencies Required

All five plans for Phase 55 use only libraries already in `package.json`. The Frechet distance algorithm is hand-rolled in pure JS (50-80 lines; fast enough for 28 reference paths at runtime). No new npm packages are needed.

---

## Architecture Patterns

### Recommended Project Structure for Phase 55

```
src/
├── game/
│   └── scenes/
│       └── CalligraphyScene.js         # New: lazy-loaded Phaser scene
├── store/
│   └── slices/
│       └── poetrySlice.js              # New: poetry battle state
├── data/
│   ├── calligraphyPaths.json           # New: 28 reference stroke paths
│   └── poems.js                        # New: 10 curated classical poems
├── components/
│   ├── MiniGames/
│   │   └── MiniGamesHub.jsx            # Modify: add Calligraphy entry
│   └── Poetry/
│       └── PoetryBattleOverlay.jsx     # New: poetry battle UI
└── game/
    └── systems/
        └── battle/
            └── __tests__/
                └── BattleStateMachine.test.js  # New in 55-01
```

### Pattern 1: Lazy-Loaded Phaser Scene (CALL-01)

CalligraphyScene is NOT in the initial `gameConfig.scene[]` array. The scene is added dynamically via Phaser's scene plugin before first use.

**How Phaser lazy scene registration works** (verified from SceneStackManager pattern in codebase):

```javascript
// In PhaserGame.jsx or on first CalligraphyScene launch:
// 1. Dynamic import to keep it out of the initial bundle
const { CalligraphyScene } = await import('./scenes/CalligraphyScene.js');
// 2. Register with running Phaser instance if not already registered
if (!game.scene.getScene('CalligraphyScene')) {
  game.scene.add('CalligraphyScene', CalligraphyScene, false);
}
// 3. Launch via existing SceneStackManager pattern
worldScene.sceneStackManager.pushScene('CalligraphyScene', { letterId });
```

vite.config.js manualChunks should add `CalligraphyScene.js` and `calligraphyPaths.json` to a new `calligraphy-game` chunk to keep them out of the initial bundle.

**Bundle chunk registration:**
```javascript
// In vite.config.js manualChunks:
if (id.includes('src/game/scenes/CalligraphyScene') ||
    id.includes('src/data/calligraphyPaths')) {
  return 'calligraphy-game';
}
if (id.includes('src/data/poems') ||
    id.includes('src/components/Poetry/')) {
  return 'poetry-game';
}
```

### Pattern 2: Pointer Input Path Capture in Phaser (CALL-02)

Phaser 3 pointer input is accessed via `this.input.on('pointerdown'/'pointermove'/'pointerup')`. The captured path is a plain array of `{x, y}` objects normalized to 0-1 range against scene dimensions.

```javascript
// Source: Phaser 3 input API (verified against project's existing pointer patterns)
// In CalligraphyScene create():
this._strokePath = [];
this._isDrawing = false;

this.input.on('pointerdown', (ptr) => {
  this._isDrawing = true;
  this._strokePath = [this._normalize(ptr.x, ptr.y)];
});
this.input.on('pointermove', (ptr) => {
  if (!this._isDrawing) return;
  this._strokePath.push(this._normalize(ptr.x, ptr.y));
  this._drawStrokeSegment(ptr);
});
this.input.on('pointerup', () => {
  this._isDrawing = false;
  this._onStrokeComplete();
});

_normalize(x, y) {
  return { x: x / this.scale.width, y: y / this.scale.height };
}
```

### Pattern 3: 28 Reference Paths as JSON (CALL-03)

The 28 isolated Arabic letter forms (ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي) each get one reference path stored in `calligraphyPaths.json`. Each path is an array of normalized `{x, y}` points sampled from the canonical stroke direction for that letter's isolated form.

```json
{
  "ا": { "letterId": "alif", "unicode": "\u0627", "referencePath": [{"x": 0.5, "y": 0.1}, ...] },
  "ب": { "letterId": "ba",   "unicode": "\u0628", "referencePath": [...] },
  ...
}
```

IMPORTANT: Only isolated letter forms in scope — per REQUIREMENTS.md Out of Scope: "Positional letter forms (initial/medial/final) in calligraphy: Start with 28 isolated forms; positional forms in v12.0".

### Pattern 4: Frechet Distance Scoring (CALL-04)

The discrete Frechet distance is the correct algorithm for stroke similarity. It accounts for path shape regardless of drawing speed (unlike DTW which double-counts). The algorithm runs in O(mn) with dynamic programming and is fast for path lengths up to ~500 points.

```javascript
// Source: Discrete Frechet distance algorithm (verified algorithm correctness)
// Pure JS, no library. Place in CalligraphyScene.js or a utils/frechetDistance.js.

function discreteFrechetDistance(P, Q) {
  const m = P.length;
  const n = Q.length;
  if (m === 0 || n === 0) return Infinity;

  const ca = Array.from({ length: m }, () => new Float32Array(n).fill(-1));

  function euclidean(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function c(i, j) {
    if (ca[i][j] > -1) return ca[i][j];
    const d = euclidean(P[i], Q[j]);
    if (i === 0 && j === 0) { ca[i][j] = d; }
    else if (i === 0)        { ca[i][j] = Math.max(c(0, j - 1), d); }
    else if (j === 0)        { ca[i][j] = Math.max(c(i - 1, 0), d); }
    else {
      ca[i][j] = Math.max(Math.min(c(i-1,j), c(i-1,j-1), c(i,j-1)), d);
    }
    return ca[i][j];
  }

  return c(m - 1, n - 1);
}

// Map Frechet distance to 1-3 star rating:
// distance < 0.15 → 3 stars
// distance < 0.30 → 2 stars (counts as "practiced", CALL-05)
// distance >= 0.30 → 1 star
function rateStroke(frechetDist) {
  if (frechetDist < 0.15) return 3;
  if (frechetDist < 0.30) return 2;
  return 1;
}
```

Path lengths differ between player and reference. Resample both to 64 points before comparison to normalize speed variation without changing path shape.

### Pattern 5: Alphabet Progress "Practiced" Flag (CALL-05)

The existing `alphabetSlice.js` tracks `completedGroups[]`. Phase 55 needs per-letter "practiced" tracking separate from the group-completion system. Add to `alphabetSlice`:

```javascript
// New state field:
practicedLetters: {}, // { letterId: { stars: 2, practicedAt: timestamp } }

// New reducer:
markLetterPracticed(state, action) {
  // payload: { letterId, stars }
  const { letterId, stars } = action.payload;
  if (stars >= 2) {
    state.practicedLetters[letterId] = { stars, practicedAt: Date.now() };
  }
},
```

The calligraphy letter's `wordIds` (loaded from calligraphyPaths.json) are dispatched to `addFsrsCard` on completion at 2+ stars, same as inscription words.

### Pattern 6: Poetry Slice (POET-01 through POET-05)

`poetrySlice.js` follows the exact same RTK pattern as `gossipSlice.js`, `factionSlice.js`, etc.

```javascript
const initialState = {
  activeBattle: null, // { poem, playerScore, npcScore, currentBlankIndex, choices, status }
  completedBattles: [], // [{ poemId, playerScore, npcScore, won, completedAt }]
  unlockedPoems: [], // poemIds unlocked via NPC interaction
};
```

Poetry battles are pure React/Redux — no new Phaser scene. The battle mode UI is a React overlay (`PoetryBattleOverlay.jsx`) that opens when a NPC poet interaction triggers `POETRY_BATTLE_START` event (pattern: same as `BATTLE_STARTED` event from BattleScene).

### Pattern 7: NPC Poet Integration (POET-01)

NPC poets are added to `npcs.json` in each zone. They trigger poetry battles via the existing ActionSet pattern with a new `action: poetry:start-battle` type in `ActionSetExecutor`. The Ink dialogue engine handles the NPC's pre-battle dialogue (same as gossip NPCs).

```javascript
// In npcs.json (NPC poet example):
{
  "id": "poet-amjad",
  "zone": "ancient_library",
  "type": "poet",
  "dialogue": { ... },
  "actionSets": [
    {
      "trigger": "interact",
      "actions": [
        { "type": "dialogue", "key": "challenge" },
        { "type": "poetry:start-battle", "poetId": "poet-amjad" }
      ]
    }
  ]
}
```

### Pattern 8: FSRS Word Sourcing for Poetry Fill-in-the-Blank (POET-03)

The four word choices for each blank are selected using the existing `selectNewCardsByPath` and `selectFsrsCards` selectors:

```javascript
// 4 choices: 1 correct + 3 distractors at similar CEFR level and difficulty
function getPoetryChoices(correctWordId, cefrLevel, state) {
  const allCards = selectFsrsCards(state);
  const known = Object.keys(allCards);
  // Get words at same CEFR level the player has encountered (known or reviewed)
  const candidates = vocabulary.filter(w =>
    w.cefrLevel === cefrLevel &&
    w.id !== correctWordId &&
    known.includes(w.id)
  );
  const distractors = shuffle(candidates).slice(0, 3);
  return shuffle([correctWordId, ...distractors.map(w => w.id)]);
}
```

### Anti-Patterns to Avoid

- **Extending BattleStateMachine for poetry:** Poetry battles have no HP/MP/damage — they are score-comparison, not combat. Adding a poetry "mode" to BattleStateMachine would pollute the FSM with non-combat states. Use a separate overlay.
- **Pixel comparison for CalligraphyScene:** The existing `CalligraphyTracing.jsx` (crafting mini-game, Phase 31) uses pixel bitmap comparison — O(n^2) per pixel and requires canvas render. CalligraphyScene uses path coordinate arrays (Frechet distance), which is faster and more accurate for stroke shape.
- **Eagerly registering CalligraphyScene in gameConfig.js:** Adding it to the static `scene: [...]` array includes the scene code in the initial game bundle, defeating the lazy-load requirement (CALL-01). Use dynamic `game.scene.add()` after dynamic import.
- **Timed poetry battles:** POET-04 explicitly prohibits timers. Do not add a countdown anywhere in PoetryBattleOverlay.
- **Storing gossip in IndexedDB:** Follow the decision from STATE.md: `gossipSlice` is NOT persisted. `poetrySlice.activeBattle` should also be session-only (not persisted), but `completedBattles` and `unlockedPoems` should be persisted in IndexedDB (follow factionSlice pattern).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| FSRS word difficulty sourcing | Custom difficulty scoring | `selectNewCardsByPath` + `selectFsrsCards` from vocabularySlice | FSRS already tracks per-word mastery and CEFR |
| Discrete Frechet distance | Custom scoring heuristic | 50-line pure JS Frechet (see Pattern 4) | Standard algorithm with well-known properties; pixel comparison is wrong |
| Poetry battle NPC dialogue | New dialogue engine | Existing InkDialogueEngine + NPC_INTERACT event | Ink handles pre-battle banter for free |
| Pointer capture on mobile | Custom touch handling | Phaser 3 input plugin (`this.input.on()`) | Phaser normalizes mouse/touch events already |
| Redux slice persistence | Custom localStorage | `redux-persist` nested `persistReducer` (same as factionSlice, worldStateSlice) | Already established CURRENT_VERSION migration pattern |
| XP/reward dispatch | Custom reward system | Existing `playerSlice.gainXP` + `addFsrsCard` | XP and FSRS already wired |

---

## Common Pitfalls

### Pitfall 1: CalligraphyScene Not in Initial gameConfig.scene[]
**What goes wrong:** Adding `CalligraphyScene` to the static `scene: [BootScene, WorldScene, InteriorScene, BattleScene]` array in `game/config.js` includes the file and its imports (calligraphyPaths.json) in the initial bundle, breaking CALL-01's lazy-load requirement.
**Why it happens:** It's the easiest way to register a scene.
**How to avoid:** Register with `game.scene.add('CalligraphyScene', CalligraphyScene, false)` after a dynamic import inside a handler. The `false` third argument prevents auto-start.
**Warning signs:** Bundle size increases when CalligraphyScene is added; `npm run build:analyze` shows it in the main chunk.

### Pitfall 2: Path Length Mismatch in Frechet Scoring
**What goes wrong:** Player draws quickly (10 points), reference has 200 points. Frechet distance is artificially large because the paths have very different densities.
**Why it happens:** Frechet distance is sensitive to sampling density differences.
**How to avoid:** Resample both player path and reference path to a fixed count (64 points) using linear interpolation before comparing. The resampling function is ~20 lines.
**Warning signs:** Fast-drawn letters always score 1 star even when shape is correct.

### Pitfall 3: Poetry Battle Choices Missing Correct Answer
**What goes wrong:** When the player's FSRS card library has fewer than 3 known words at the correct CEFR level, the choice generator has fewer than 3 distractors. If error handling is missing, the correct answer might not be in the choices array.
**Why it happens:** Early-game state: player knows very few words.
**How to avoid:** The `choices` array must always include the correct word ID. Fill remaining distractor slots from the full vocabulary (not just known words) if the known pool is too small.
**Warning signs:** Poetry battle shows fewer than 4 choices or shows no correct option.

### Pitfall 4: Phaser Scene Pointer Events Leaking After CalligraphyScene Exits
**What goes wrong:** Pointer event listeners registered in CalligraphyScene's `create()` continue firing after the scene is stopped, causing errors when the scene's graphics objects are destroyed.
**Why it happens:** Phaser `this.input.on()` listeners are automatically cleaned up when the scene stops — but only if registered via the scene's own input plugin (`this.input.on()`), not the game-level `game.input.on()`.
**How to avoid:** Always use `this.input.on()` (scene-level) not `this.game.input.on()` (game-level). Scene stop/shutdown events destroy the scene's input plugin automatically.
**Warning signs:** Console errors like "Cannot read properties of destroyed GameObjects" after returning from CalligraphyScene.

### Pitfall 5: BattleStateMachine Tests Require Store Mock
**What goes wrong:** BattleStateMachine imports `store` directly and calls `store.getState()`, `store.dispatch()` throughout. Tests that try to instantiate BattleStateMachine without a store will throw.
**Why it happens:** BattleStateMachine is a service-layer class that reads Redux store directly (documented decision in STATE.md: "Service module not a React component; avoids prop-drilling").
**How to avoid:** The test setup must configure a real or mock Redux store. The existing vitest setup (`src/test/setup.js`) can be checked for store setup patterns. Use `configureStore` with the real reducers to create an isolated test store per test.
**Warning signs:** `store.getState is not a function` errors in BattleStateMachine tests.

### Pitfall 6: Frechet Distance on Very Short Strokes
**What goes wrong:** A stroke with only 1-2 points (quick tap) computes a Frechet distance against the reference path that looks like a valid score.
**Why it happens:** Single-point paths have Frechet distance = distance from that point to nearest reference point, which can accidentally be small.
**How to avoid:** Minimum stroke length check: if the captured path has fewer than 5 points, show a "trace the complete stroke" feedback instead of scoring.
**Warning signs:** Short taps score 2+ stars unexpectedly.

---

## Code Examples

### CalligraphyScene Scene Registration (Lazy)

```javascript
// Source: Verified pattern from SceneStackManager.pushScene() in this codebase
// In the handler that launches CalligraphyScene from MiniGamesHub or NPC trigger:

async function launchCalligraphyScene(game, letterId) {
  // Dynamic import — keeps CalligraphyScene out of initial bundle
  const { CalligraphyScene } = await import('../game/scenes/CalligraphyScene.js');

  if (!game.scene.getScene('CalligraphyScene')) {
    game.scene.add('CalligraphyScene', CalligraphyScene, false);
  }

  const worldScene = game.scene.getScene('WorldScene');
  worldScene.sceneStackManager.pushScene('CalligraphyScene', {
    letterId,
    returnSceneKey: 'WorldScene',
  });
}
```

### Poetry Slice Structure

```javascript
// Source: Verified pattern from gossipSlice.js, factionSlice.js in this codebase
import { createSlice } from '@reduxjs/toolkit';

const poetrySlice = createSlice({
  name: 'poetry',
  initialState: {
    activeBattle: null,
    completedBattles: [],
    unlockedPoems: [],
  },
  reducers: {
    startPoetryBattle(state, action) {
      // payload: { poemId, poem, poetId }
      const { poemId, poem, poetId } = action.payload;
      state.activeBattle = {
        poemId, poetId,
        blanks: poem.blanks,      // [{ blankIndex, wordId, cefrLevel }]
        playerAnswers: [],
        npcAnswers: [],
        currentBlankIndex: 0,
        status: 'in_progress',
      };
    },
    submitPlayerAnswer(state, action) {
      // payload: { blankIndex, wordId, isCorrect }
      const { blankIndex, wordId, isCorrect } = action.payload;
      if (state.activeBattle) {
        state.activeBattle.playerAnswers[blankIndex] = { wordId, isCorrect };
      }
    },
    setNpcAnswers(state, action) {
      // payload: npcAnswers array [{ blankIndex, isCorrect }]
      if (state.activeBattle) {
        state.activeBattle.npcAnswers = action.payload;
      }
    },
    endPoetryBattle(state, action) {
      // payload: { won, playerScore, npcScore }
      const { won, playerScore, npcScore } = action.payload;
      if (state.activeBattle) {
        const result = {
          poemId: state.activeBattle.poemId,
          playerScore,
          npcScore,
          won,
          completedAt: Date.now(),
        };
        state.completedBattles.push(result);
        state.activeBattle = null;
      }
    },
    unlockPoem(state, action) {
      const poemId = action.payload;
      if (!state.unlockedPoems.includes(poemId)) {
        state.unlockedPoems.push(poemId);
      }
    },
  },
});
```

### Discrete Frechet Distance + Resampling

```javascript
// Source: Verified algorithm correctness — standard discrete Frechet DP

function resamplePath(path, targetCount) {
  if (path.length === 0) return [];
  if (path.length === 1) return Array(targetCount).fill(path[0]);

  // Compute cumulative arc lengths
  const lengths = [0];
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i-1].x;
    const dy = path[i].y - path[i-1].y;
    lengths.push(lengths[i-1] + Math.sqrt(dx*dx + dy*dy));
  }
  const totalLength = lengths[lengths.length - 1];

  const resampled = [];
  for (let k = 0; k < targetCount; k++) {
    const target = (k / (targetCount - 1)) * totalLength;
    let i = lengths.findIndex(l => l >= target);
    if (i <= 0) { resampled.push(path[0]); continue; }
    if (i >= path.length) { resampled.push(path[path.length - 1]); continue; }
    const t = (target - lengths[i-1]) / (lengths[i] - lengths[i-1]);
    resampled.push({
      x: path[i-1].x + t * (path[i].x - path[i-1].x),
      y: path[i-1].y + t * (path[i].y - path[i-1].y),
    });
  }
  return resampled;
}

function discreteFrechetDistance(P, Q) {
  const m = P.length, n = Q.length;
  const ca = new Float32Array(m * n).fill(-1);
  const idx = (i, j) => i * n + j;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function c(i, j) {
    if (ca[idx(i,j)] >= 0) return ca[idx(i,j)];
    const d = dist(P[i], Q[j]);
    let result;
    if (i === 0 && j === 0) result = d;
    else if (i === 0)       result = Math.max(c(0, j-1), d);
    else if (j === 0)       result = Math.max(c(i-1, 0), d);
    else result = Math.max(Math.min(c(i-1,j), c(i-1,j-1), c(i,j-1)), d);
    ca[idx(i,j)] = result;
    return result;
  }
  return c(m-1, n-1);
}

// Usage in CalligraphyScene:
const RESAMPLE_COUNT = 64;
const playerResampled = resamplePath(this._strokePath, RESAMPLE_COUNT);
const refResampled    = resamplePath(referencePath,    RESAMPLE_COUNT);
const frechet = discreteFrechetDistance(playerResampled, refResampled);
const stars = frechet < 0.15 ? 3 : frechet < 0.30 ? 2 : 1;
```

### BattleStateMachine Test Setup

```javascript
// Source: Verified pattern from GrammarComboDetector.test.js in this codebase
// vitest + jsdom + configureStore from @reduxjs/toolkit

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { BattleStateMachine, BATTLE_STATES } from '../BattleStateMachine';
import battleReducer from '../../../../store/slices/battleSlice';
import vocabularyReducer from '../../../../store/slices/vocabularySlice';
import grammarReducer from '../../../../store/slices/grammarSlice';

// BattleStateMachine imports `store` directly from '../../../store/store.js'
// Must mock the store module before instantiating BSM
vi.mock('../../../../store/store.js', () => ({
  store: configureStore({
    reducer: {
      battle: battleReducer,
      vocabulary: vocabularyReducer,
      grammar: grammarReducer,
    },
  }),
}));

describe('BattleStateMachine', () => {
  let mockScene;
  beforeEach(() => {
    // Phaser scene mock — BSM calls scene.time.delayedCall, scene.tweens.add, etc.
    mockScene = {
      time: { delayedCall: vi.fn(), addEvent: vi.fn() },
      tweens: { add: vi.fn() },
      scene: { stop: vi.fn() },
      exitBattle: vi.fn(),
    };
  });

  it('starts in IDLE state', () => {
    const bsm = new BattleStateMachine(mockScene, { enemyParty: ['desert_snake'] });
    expect(bsm.state).toBe(BATTLE_STATES.IDLE);
  });
  // ... etc
});
```

### StatusEffectBar Tests

```javascript
// Source: Verified from StatusEffectBar.jsx and existing test patterns
// Uses @testing-library/react, vi.mock for framer-motion (see existing test files)

import { render, screen } from '@testing-library/react';
import StatusEffectBar from '../StatusEffectBar';

describe('StatusEffectBar', () => {
  it('renders nothing when effects is empty', () => {
    const { container } = render(<StatusEffectBar effects={[]} target="player" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders visible effects up to maxVisible', () => {
    const effects = [
      { id: 'burn', remainingTurns: 2 },
      { id: 'freeze', remainingTurns: 1 },
    ];
    render(<StatusEffectBar effects={effects} target="player" maxVisible={5} />);
    // statusEffects.js 'burn' has arabic نار — abbreviated to first 3 chars
    expect(screen.getAllByRole('generic').length).toBeGreaterThan(0);
  });

  it('shows overflow badge when effects exceed maxVisible', () => {
    const effects = Array.from({ length: 7 }, (_, i) => ({ id: `burn`, remainingTurns: i+1 }));
    render(<StatusEffectBar effects={effects} target="player" maxVisible={5} />);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});
```

---

## State of the Art

| Old Approach | Current Approach | Impact for Phase 55 |
|--------------|------------------|---------------------|
| Pixel bitmap comparison (CalligraphyTracing.jsx) | Frechet distance on normalized path arrays | More accurate for stroke shape; faster; no canvas dependency |
| Crafting CalligraphyTracing (single-letter, timed) | CalligraphyScene (28 letters, untimed, Phaser scene) | Different scope — do not reuse the component |
| BattleStateMachine for all fight modes | Separate poetrySlice + React overlay | Poetry is vocabulary scoring, not combat damage |

---

## Open Questions

1. **How to author the 28 reference stroke paths**
   - What we know: They must be normalized `{x, y}` arrays representing the canonical stroke direction for each isolated letter form
   - What's unclear: Whether to derive them from Unicode stroke data (algorithmically) or hand-author 28 paths manually
   - Recommendation: Hand-author the 28 paths as JSON in `calligraphyPaths.json`; each path needs ~20-60 points; start with geometric approximations and tweak. Algorithmic derivation from fonts is disproportionate effort for 28 letters.

2. **NPC poet placement in zones**
   - What we know: POET-01 says "accessible via NPC poets in zones" — no specific zones named
   - What's unclear: Which zones get poets and how many
   - Recommendation: 1 poet per zone, 8 zones, all using the same pool of 10 poems. Each poet has their own personality via Ink dialogue but shares the poem data.

3. **Poetry NPC AI difficulty**
   - What we know: POET-05 says "NPC poet also fills blanks; scores compared; winner earns XP"
   - What's unclear: How the NPC "fills blanks" — is it simulated with a configurable accuracy or actually drawn from FSRS
   - Recommendation: NPC accuracy is a fixed configurable value per poet (e.g., 0.6 for beginner poets, 0.85 for master poets). This keeps the system deterministic and testable without needing the NPC to have its own FSRS state.

4. **Vitest coverage ratchet**
   - What we know: vitest.config.js has coverage thresholds ratcheted to 24%/73%/39%/24% (statements/branches/functions/lines)
   - What's unclear: Adding new test files may raise or maintain coverage; if BattleStateMachine is large, its test coverage could lift the function threshold
   - Recommendation: Run `npm run test:coverage` after 55-01 and update thresholds upward in vitest.config.js if the new tests push coverage above current ratchet values.

---

## Sources

### Primary (HIGH confidence)
- Codebase: `src/game/config.js` — verified scene registration pattern `[BootScene, WorldScene, InteriorScene, BattleScene]`
- Codebase: `src/game/systems/SceneStackManager.js` — verified `pushScene()` / `popScene()` pattern used for all auxiliary scenes
- Codebase: `src/game/scenes/BattleScene.js` — verified how scenes are pushed and how EventBus communicates with React
- Codebase: `src/game/systems/battle/BattleStateMachine.js` — verified `BATTLE_STATES`, FSM structure, store import pattern
- Codebase: `src/game/systems/battle/GrammarComboDetector.js` — verified test structure and class API
- Codebase: `src/components/Battle/StatusEffectBar.jsx` — verified component interface
- Codebase: `src/components/Crafting/minigames/CalligraphyTracing.jsx` — verified NOT reusable for Phase 55 (different scope, pixel comparison)
- Codebase: `src/components/MiniGames/MiniGamesHub.jsx` — verified where calligraphy entry must be added
- Codebase: `src/routes.jsx` — verified lazy import pattern and `/mini-games/*` route structure
- Codebase: `src/services/fsrs.js` + `src/store/slices/vocabularySlice.js` — verified `selectNewCardsByPath`, `addFsrsCard`
- Codebase: `src/store/slices/alphabetSlice.js` — verified where `practicedLetters` state must be added
- Codebase: `src/utils/eventBusTypes.js` — verified no `POETRY_*` or `CALLIGRAPHY_*` events exist (must be added)
- Codebase: `vite.config.js` — verified `manualChunks` pattern for new lazy chunk registration
- Codebase: `vitest.config.js` — verified test environment, setup file, coverage ratchet thresholds
- Codebase: `.planning/REQUIREMENTS.md` — verified CALL-01 through CALL-05, POET-01 through POET-05 spec
- Codebase: `.planning/STATE.md` — verified "gossip NOT persisted" decision, store import pattern for service modules

### Secondary (MEDIUM confidence)
- Discrete Frechet Distance algorithm: well-established O(mn) DP algorithm; verified correctness of the implementation above against published algorithm description. The thresholds (0.15, 0.30) are recommendations — will need calibration against real player input during implementation.

### Tertiary (LOW confidence)
- Resampling count of 64 points: heuristic recommendation based on the algorithm literature. Too few points (< 32) loses shape fidelity; too many (> 128) adds computation without accuracy benefit for single-stroke letters. Requires empirical validation during implementation.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed, verified from package.json
- Architecture: HIGH — all patterns are existing codebase patterns, directly verified
- Calligraphy scoring algorithm: HIGH (algorithm correctness) / MEDIUM (threshold values)
- Poetry battle design: HIGH — pure Redux slice + React overlay, no novel patterns
- Test coverage plan: HIGH — verified test file locations, existing test patterns, store mock requirement

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable tech stack; no fast-moving dependencies)
