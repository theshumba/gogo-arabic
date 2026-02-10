# Phase 19: Infrastructure & Architecture - Research

**Researched:** 2026-02-10
**Domain:** Redux Toolkit slice authoring, React hook decomposition, Phaser 3 scene lifecycle, EventBus namespacing, build-time JSON validation
**Confidence:** HIGH (all findings verified from live codebase — no external libraries needed)

---

## Summary

Phase 19 is a pure refactoring and scaffolding phase — no new user-visible features. Its job is to make the codebase safe for v5.0's 20+ new EventBus events and multi-scene narrative state. The work breaks into five atomic deliverables: (1) split the monolithic `useEventBusListeners.js` into 4 domain-specific sub-hooks, (2) create `eventBusTypes.js` as a centralized event name registry with namespace convention, (3) author `narrativeSlice` as the 13th Redux slice with full persistence, (4) extend `testUtils.jsx` and `sceneMock.js` to support the new slice and new Phaser scene APIs, and (5) add a Vite build-time JSON schema validator for dialogue data.

The existing delegation pattern in WorldScene (`this.systemName = new SystemClass(this)` in `create()`, `destroy()` in `clearZone()`, `EventBus.off(...)` in `shutdown()`) is the canonical pattern for all new Phaser systems. The persistence mechanism (redux-persist whitelist array in `store.js`) is already in place — narrativeSlice simply needs to be added to the whitelist. The test tooling pattern (vitest + `createMockScene()` from `sceneMock.js`) is already established for new game system tests.

The one operational risk is the pre-existing 3 failing tests in `DailyDashboard.test.jsx` and `HUD.test.jsx`. These pre-date Phase 19 and must NOT be introduced as regressions. The INFR-09 requirement ("548 tests pass") refers to the state before these failures, but the actual current count is 554 tests with 3 pre-existing failures that are out of scope.

**Primary recommendation:** Do all five deliverables in order — eventBusTypes first (all other work depends on it), then narrativeSlice, then hook refactor, then test tooling, then JSON validation.

---

## Standard Stack

### Core (already installed — zero new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @reduxjs/toolkit | ^2.x | createSlice, createSelector, combineReducers | Project standard for all 12 existing slices |
| redux-persist | ^6.0.0 | Automatic localStorage persistence via whitelist | Already persists 10 of 12 slices |
| Phaser 3 | ^3.90.0 | EventEmitter (EventBus), Scene lifecycle | Project-wide game engine |
| React 19 | ^19.2.4 | Hooks (useEffect, useDispatch, useSelector) | Project-wide UI framework |
| Vitest | ^3.0.0 | Unit tests for slices, hooks, systems | Project-wide test runner |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | (current) | renderWithProviders for component tests | When testing React hooks that use Redux |
| Zod / AJV | NOT installed | JSON schema validation | For INFR-04 only — use Zod (already in React ecosystem) or a lightweight custom validator |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Flat `eventBusTypes.js` registry | TypeScript enums | TS enums require TS migration — project is JavaScript; plain const object is idiomatic |
| Zod for dialogue JSON validation | AJV, Joi, manual validation | Zod is zero-config, tree-shakes well, works at Vite build time; AJV requires more setup |
| New Redux slice for buildings | Extending playerSlice | narrativeSlice is the right owner — building states are world state, not player state |

**Installation:**
```bash
# No new dependencies needed for core work (INFR-01 through INFR-03, INFR-05 through INFR-10)
# For INFR-04 (dialogue JSON validation), only if not already present:
npm install zod
```

---

## Architecture Patterns

### Recommended Project Structure for Phase 19 Additions
```
src/
├── utils/
│   ├── eventBus.js               # Existing — unchanged
│   └── eventBusTypes.js          # NEW — centralized event name registry
├── store/
│   ├── store.js                  # MODIFIED — add narrativeReducer + whitelist
│   └── slices/
│       └── narrativeSlice.js     # NEW — 13th slice
├── hooks/
│   ├── useEventBusListeners.js   # MODIFIED — thin orchestrator, imports sub-hooks
│   ├── useDialogueEvents.js      # NEW — sub-hook
│   ├── useBuildingEvents.js      # NEW — sub-hook
│   ├── useObjectEvents.js        # NEW — sub-hook
│   └── useNarrativeEvents.js     # NEW — sub-hook
└── test/
    └── testUtils.jsx             # MODIFIED — add narrativeReducer
```

### Pattern 1: EventBus Namespaced Registry (eventBusTypes.js)

**What:** A single file that exports all EventBus event name constants, organized by namespace (`source:category:action`).
**When to use:** Every EventBus.on/off/emit call in the entire codebase must reference a constant from this file — never a raw string.

**Example:**
```javascript
// src/utils/eventBusTypes.js
// Centralized EventBus event registry.
// Convention: source:category:action (kebab-case within segments)
// Source: phaser | react | narrative | building | object
// Category: functional grouping
// Action: what happened

export const EVENTS = {
  // === PLAYER LIFECYCLE ===
  PLAYER_FREEZE: 'phaser:player:freeze',
  PLAYER_UNFREEZE: 'phaser:player:unfreeze',
  PLAYER_POSITION_UPDATE: 'phaser:player:position-update',

  // === NPC / DIALOGUE ===
  NPC_INTERACT: 'phaser:npc:interact',
  DIALOGUE_OPEN: 'react:dialogue:open',
  DIALOGUE_CHOICE_MADE: 'react:dialogue:choice-made',
  DIALOGUE_TOPIC_SELECTED: 'react:dialogue:topic-selected',
  DIALOGUE_CLOSED: 'react:dialogue:closed',

  // === ZONE / TRAVEL ===
  ZONE_CHANGE: 'phaser:zone:change',
  ZONE_TRANSITION: 'phaser:zone:transition',
  ZONE_CHECK_UNLOCK: 'phaser:zone:check-unlock',
  FAST_TRAVEL: 'react:zone:fast-travel',

  // === OBJECTS / INTERACTABLES ===
  SIGN_SHOW: 'phaser:object:sign-show',
  BOOKSHELF_INTERACT: 'phaser:object:bookshelf-interact',
  CHEST_OPENED: 'phaser:object:chest-opened',
  CHEST_EMPTY: 'phaser:object:chest-empty',
  DOOR_LOCKED: 'phaser:object:door-locked',
  DOOR_OPENED: 'phaser:object:door-opened',
  OBJECT_INSPECT: 'phaser:object:inspect',

  // === BUILDINGS ===
  BUILDING_ENTER: 'phaser:building:enter',
  BUILDING_EXIT: 'phaser:building:exit',

  // === NARRATIVE ===
  NARRATIVE_FLAG_SET: 'react:narrative:flag-set',
  NARRATIVE_RELATIONSHIP_CHANGED: 'react:narrative:relationship-changed',

  // === QUIZ / LEARNING ===
  QUIZ_OPEN: 'phaser:quiz:open',
  QUIZ_CLOSED: 'react:quiz:closed',
  REVIEW_SESSION_OPEN: 'phaser:quiz:open-review',
  ALPHABET_OPEN: 'phaser:quiz:open-alphabet',
  WORLD_MAP_OPEN: 'phaser:nav:open-world-map',

  // === SFX (React -> Phaser direction) ===
  SFX_CORRECT: 'react:sfx:correct',
  SFX_WRONG: 'react:sfx:wrong',
  SFX_WORDLEARNED: 'react:sfx:wordlearned',
  SFX_LEVELUP: 'react:sfx:levelup',
  SFX_QUEST: 'react:sfx:quest',
  SFX_CLICK: 'react:sfx:click',

  // === VFX ===
  VFX_SHAKE: 'phaser:vfx:shake',
  VFX_PARTICLES_BURST: 'phaser:vfx:particles-burst',
  VFX_PARTICLES_CONTINUOUS: 'phaser:vfx:particles-continuous',

  // === SCENE ===
  SCENE_READY: 'phaser:scene:ready',
};
```

### Pattern 2: Domain Sub-Hook Decomposition

**What:** Break `useEventBusListeners.js` into 4 sub-hooks, each owning one domain. The parent hook becomes a thin orchestrator that calls all sub-hooks.
**When to use:** The monolith is 424 lines and adding v5.0 events would push it past 600. Each sub-hook is independently testable.

**Example:**
```javascript
// src/hooks/useEventBusListeners.js (after refactor)
// Thin orchestrator — delegates to domain sub-hooks.
// Each sub-hook owns its own EventBus.on/off registrations.

import { useDialogueEvents } from './useDialogueEvents.js';
import { useBuildingEvents } from './useBuildingEvents.js';
import { useObjectEvents } from './useObjectEvents.js';
import { useNarrativeEvents } from './useNarrativeEvents.js';
// Plus any events that don't fit a sub-hook (SFX, VFX, achievements)
import { useMiscEvents } from './useMiscEvents.js';

export function useEventBusListeners(phaserRef, playSFX, navigate) {
  useDialogueEvents(phaserRef, playSFX, navigate);
  useBuildingEvents(phaserRef, playSFX);
  useObjectEvents(playSFX);
  useNarrativeEvents();
  useMiscEvents(phaserRef, playSFX, navigate);
}
```

**Domain ownership breakdown:**

| Sub-hook | Events owned | Dependencies |
|----------|-------------|-------------|
| `useDialogueEvents` | NPC_INTERACT, DIALOGUE_*, NPC visit quest tracking | dispatch, quests, playSFX, navigate |
| `useBuildingEvents` | BUILDING_ENTER, BUILDING_EXIT, ZONE_CHANGE, ZONE_TRANSITION, ZONE_CHECK_UNLOCK, FAST_TRAVEL | dispatch, quests, phaserRef, playSFX |
| `useObjectEvents` | SIGN_SHOW, BOOKSHELF_INTERACT, CHEST_OPENED, CHEST_EMPTY, DOOR_LOCKED | dispatch, fsrsCards, playSFX |
| `useNarrativeEvents` | NARRATIVE_FLAG_SET, NARRATIVE_RELATIONSHIP_CHANGED | dispatch |
| `useMiscEvents` | QUIZ_OPEN/CLOSED, REVIEW/ALPHABET/MAP opens, SFX_*, VFX triggers | dispatch, playSFX, navigate, newAchievements |

Each sub-hook follows the **same cleanup pattern**:
```javascript
// Consistent cleanup pattern — every sub-hook must use this structure
import { useEffect } from 'react';
import { EventBus } from '../utils/eventBus.js';
import { EVENTS } from '../utils/eventBusTypes.js';

export function useBuildingEvents(phaserRef, playSFX) {
  useEffect(() => {
    const handleBuildingEnter = ({ buildingId, interiorScene }) => {
      // ... handler logic
    };

    EventBus.on(EVENTS.BUILDING_ENTER, handleBuildingEnter);

    return () => {
      EventBus.off(EVENTS.BUILDING_ENTER, handleBuildingEnter);
    };
  }, [phaserRef, playSFX]);
}
```

### Pattern 3: narrativeSlice

**What:** 13th Redux slice. Single source of truth for all narrative state: story flags, NPC relationships, world object states, and player choices.
**When to use:** Any time v5.0 features need to read or write narrative state.

**Example:**
```javascript
// src/store/slices/narrativeSlice.js
import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  // Story progression flags — structured enums, not ad-hoc booleans
  // Format: { flagKey: value } where value is a string stage name or number
  storyFlags: {},

  // NPC relationship levels — 0 to 5 trust meter per NPC
  // Format: { npcId: number }
  npcRelationships: {},

  // World object states — for objects that change (locked chest -> open, broken bridge -> repaired)
  // Format: { objectId: 'state-string' }
  worldObjectStates: {},

  // Player choices log — for dialogue history and conditional branching
  // Format: [{ npcId, choiceId, timestamp }]
  choiceHistory: [],

  // Building visit tracking
  visitedBuildings: [],
};

const narrativeSlice = createSlice({
  name: 'narrative',
  initialState,
  reducers: {
    setStoryFlag(state, action) {
      // payload: { flag: string, value: string | number }
      const { flag, value } = action.payload;
      state.storyFlags[flag] = value;
    },

    setNpcRelationship(state, action) {
      // payload: { npcId: string, level: number (0-5) }
      const { npcId, level } = action.payload;
      state.npcRelationships[npcId] = Math.max(0, Math.min(5, level));
    },

    incrementNpcRelationship(state, action) {
      // payload: { npcId: string, amount: number }
      const { npcId, amount = 1 } = action.payload;
      const current = state.npcRelationships[npcId] ?? 0;
      state.npcRelationships[npcId] = Math.max(0, Math.min(5, current + amount));
    },

    setWorldObjectState(state, action) {
      // payload: { objectId: string, objectState: string }
      const { objectId, objectState } = action.payload;
      state.worldObjectStates[objectId] = objectState;
    },

    recordChoice(state, action) {
      // payload: { npcId: string, choiceId: string }
      const { npcId, choiceId } = action.payload;
      state.choiceHistory.push({
        npcId,
        choiceId,
        timestamp: new Date().toISOString(),
      });
    },

    markBuildingVisited(state, action) {
      // payload: buildingId string
      const buildingId = action.payload;
      if (!state.visitedBuildings.includes(buildingId)) {
        state.visitedBuildings.push(buildingId);
      }
    },

    resetNarrativeProgress(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setStoryFlag,
  setNpcRelationship,
  incrementNpcRelationship,
  setWorldObjectState,
  recordChoice,
  markBuildingVisited,
  resetNarrativeProgress,
} = narrativeSlice.actions;

// ========== SELECTORS ==========

export const selectStoryFlags = (state) => state.narrative.storyFlags;
export const selectNpcRelationships = (state) => state.narrative.npcRelationships;
export const selectWorldObjectStates = (state) => state.narrative.worldObjectStates;
export const selectChoiceHistory = (state) => state.narrative.choiceHistory;
export const selectVisitedBuildings = (state) => state.narrative.visitedBuildings;

export const selectStoryFlag = (flag) => (state) =>
  state.narrative.storyFlags[flag] ?? null;

export const selectNpcRelationship = (npcId) => (state) =>
  state.narrative.npcRelationships[npcId] ?? 0;

export const selectWorldObjectState = (objectId) => (state) =>
  state.narrative.worldObjectStates[objectId] ?? null;

export const selectHasMadeChoice = (npcId, choiceId) => createSelector(
  [selectChoiceHistory],
  (history) => history.some((c) => c.npcId === npcId && c.choiceId === choiceId)
);

export default narrativeSlice.reducer;
```

### Pattern 4: store.js Updates for narrativeSlice

**What:** Add narrativeSlice to the combineReducers call AND to the redux-persist whitelist.

**Example:**
```javascript
// src/store/store.js — changes needed
import narrativeReducer from './slices/narrativeSlice.js';

// Add to persistConfig whitelist:
const persistConfig = {
  key: 'gogo-arabic',
  storage,
  whitelist: ['player', 'vocabulary', 'quests', 'alphabet', 'settings', 'npc',
              'achievements', 'dailyGoals', 'grammar', 'battle', 'narrative'], // <-- add 'narrative'
};

// Add to rootReducer:
const rootReducer = combineReducers({
  // ... existing 12 slices ...
  narrative: narrativeReducer, // <-- add this
});
```

### Pattern 5: WorldScene Delegation for New Phaser Systems

**What:** New Phaser systems (DialogueEngine, SceneStackManager) follow the exact existing pattern — instantiated in `create()`, destroyed in `clearZone()`/`shutdown()`.

**Example:**
```javascript
// src/game/systems/SceneStackManager.js
export class SceneStackManager {
  constructor(scene) {
    this.scene = scene; // WorldScene reference
    this._stack = []; // Track pushed scenes for pop behavior
  }

  /**
   * Enter a building — pause WorldScene, launch interior scene.
   * @param {string} interiorSceneKey - Phaser scene key to launch
   * @param {object} data - Data to pass to the interior scene
   */
  pushScene(interiorSceneKey, data = {}) {
    this._stack.push(this.scene.scene.key);
    this.scene.scene.pause();
    this.scene.scene.launch(interiorSceneKey, data);
  }

  /**
   * Exit a building — stop interior scene, resume WorldScene.
   */
  popScene() {
    const currentActive = this.scene.sys.scene.manager.getActiveScenes()
      .find((s) => s !== this.scene);
    if (currentActive) {
      currentActive.scene.stop();
    }
    this.scene.scene.resume();
    this._stack.pop();
  }

  destroy() {
    this._stack = [];
  }
}
```

```javascript
// Addition to WorldScene.js create():
this.sceneStackManager = new SceneStackManager(this);
```

```javascript
// Addition to WorldScene.js shutdown():
if (this.sceneStackManager) {
  this.sceneStackManager.destroy();
  this.sceneStackManager = null;
}
```

### Pattern 6: testUtils.jsx Update for narrativeSlice

**What:** `testUtils.jsx` manually builds the store from all reducers. When narrativeSlice is added, testUtils must include it, or tests that render components touching narrative state will throw.

**Example:**
```javascript
// src/test/testUtils.jsx — changes needed
import narrativeReducer from '../store/slices/narrativeSlice.js';

export function createTestStore(preloadedState = {}) {
  const rootReducer = combineReducers({
    // ... existing 12 reducers ...
    narrative: narrativeReducer, // <-- add this
  });
  // ...
}
```

### Pattern 7: Phaser prefers-reduced-motion (without React hooks)

**What:** Phaser systems cannot use React hooks. For INFR-10, Phaser animations respect `prefers-reduced-motion` by reading the media query directly.

**Example:**
```javascript
// In any Phaser system that adds animations (door transitions, object glows):
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const duration = prefersReducedMotion ? 0 : 300;
```

### Anti-Patterns to Avoid
- **Raw strings in EventBus calls:** `EventBus.on('npc-interact', ...)` — always use `EVENTS.NPC_INTERACT` from eventBusTypes.js.
- **Merging narrative state into playerSlice:** playerSlice already handles player stats (XP, level, zone). Narrative state (story flags, NPC relationships) belongs in narrativeSlice to maintain single responsibility.
- **Sub-hooks sharing state across hook boundaries via closure:** Each sub-hook should be self-contained. Shared Redux state is accessed via `useSelector` inside each sub-hook independently.
- **Forgetting EventBus.off in sub-hook cleanup:** Every sub-hook's useEffect return MUST clean up all registered listeners. Missing cleanup causes listener stacking on hot-reload.
- **Adding narrativeSlice to persist whitelist but not to testUtils:** Both changes must happen atomically, or tests that render any component accessing `state.narrative` will throw "Cannot read properties of undefined."

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Persistent narrative state | Custom localStorage reads/writes | redux-persist (already configured) | Handles serialization, rehydration, migrations |
| Event name conflicts | Runtime collision detection | eventBusTypes.js constants + code review | Static constants catch typos at dev time; no runtime overhead |
| NPC relationship clamping (0-5) | Custom validators everywhere | `Math.max(0, Math.min(5, value))` inside the reducer | Reducers are the enforcement point — clamp once in `setNpcRelationship` |
| JSON schema validation | Custom recursive validator | Zod schema at build time (Vite plugin or `vite:build` hook) | Zod is typesafe, composable, produces clear error messages |
| Scene state machine | Custom enum + transition logic | Phaser's built-in `scene.pause/launch/resume` | Phaser handles the underlying WebGL context — don't bypass it |

**Key insight:** All the infrastructure problems in Phase 19 have existing solutions in the current stack. The work is wiring, not inventing.

---

## Common Pitfalls

### Pitfall 1: EventBus Listener Stacking
**What goes wrong:** Sub-hooks are called on every render. If cleanup is missing from any sub-hook's useEffect return, each re-render adds another listener. Handlers fire N times instead of once.
**Why it happens:** Moving from one monolithic useEffect to 4+ sub-hooks increases the surface area for missed cleanups.
**How to avoid:** Every sub-hook must mirror its `EventBus.on(event, handler)` registrations with `EventBus.off(event, handler)` in the cleanup function. The existing monolith does this correctly — copy the pattern exactly.
**Warning signs:** EventBus handlers firing multiple times for a single event; Redux state updating 2x per interaction.

### Pitfall 2: narrativeSlice Missing from testUtils
**What goes wrong:** Tests that render components touching `state.narrative` throw `TypeError: Cannot read properties of undefined (reading 'storyFlags')`.
**Why it happens:** `testUtils.jsx` creates the store manually and must be updated in sync with `store.js`. When adding a new slice, both files must change in the same task.
**How to avoid:** narrativeSlice addition task must atomically update both `store.js` and `testUtils.jsx`.
**Warning signs:** Cascade of test failures after narrativeSlice is added; error mentions `state.narrative`.

### Pitfall 3: EventBus Event Name Rename Breaks WorldScene
**What goes wrong:** WorldScene.js and InteractableManager.js register listeners using old flat string names (`freeze-player`, `unfreeze-player`, etc.). Renaming these to the new namespace convention without updating WorldScene breaks the game.
**Why it happens:** The refactor touches both the React side (useEventBusListeners) and the Phaser side (WorldScene). Both must be updated together.
**How to avoid:** Use the EVENTS registry from eventBusTypes.js in BOTH React hooks AND Phaser systems. The migration must update all callers.
**Warning signs:** Player gets stuck (freeze-player event not received); VFX don't fire; zone transitions break.

### Pitfall 4: redux-persist Whitelist Missing 'narrative'
**What goes wrong:** narrativeSlice state is lost on page refresh — story flags reset, NPC relationships reset, world object states reset.
**Why it happens:** The `whitelist` in `persistConfig` must be manually updated; redux-persist does not auto-discover new slices.
**How to avoid:** The narrativeSlice task must update the whitelist in the same commit as creating the slice.
**Warning signs:** FSRS progress, quests, and player stats persist correctly but narrative state resets to initial on reload.

### Pitfall 5: Scene pause/launch Memory Leaks
**What goes wrong:** Launching an interior scene without destroying it on exit leaves orphan DOM elements, event listeners, and physics bodies from the interior scene.
**Why it happens:** `scene.pause()` pauses WorldScene but `scene.launch()` for the interior doesn't automatically clean up when stopped.
**How to avoid:** SceneStackManager.popScene() must call `interiorScene.scene.stop()` (not just pause) before resuming WorldScene. Interior scenes must implement `shutdown()` to clean up all subsystems, matching WorldScene's existing shutdown pattern.
**Warning signs:** Memory usage grows with each building entry/exit; phantom physics collisions from destroyed interior.

### Pitfall 6: Pre-existing Test Failures (3 tests)
**What goes wrong:** Phase 19 appears to introduce regressions that were actually pre-existing.
**Why it happens:** As of 2026-02-10, the test suite has 554 tests with 3 pre-existing failures: `DailyDashboard.test.jsx` (2 tests) and `HUD.test.jsx` (1 test). INFR-09 says "548 tests pass" but the actual baseline is 551 passing + 3 pre-existing failures.
**How to avoid:** Document the 3 pre-existing failures as out-of-scope for Phase 19. INFR-09 success criterion means "no NEW failures introduced." The 3 failures must be explicitly excluded from regression reporting.
**Warning signs:** CI shows 3 failures — these are expected and should not block Phase 19 completion.

---

## Code Examples

Verified patterns from live codebase:

### How WorldScene currently registers/cleans up EventBus listeners (copy this pattern)
```javascript
// Source: src/game/scenes/WorldScene.js lines 60-71 / 287-291
// In create():
EventBus.on('freeze-player', this.handleFreeze, this);
EventBus.on('unfreeze-player', this.handleUnfreeze, this);

// In shutdown():
EventBus.off('freeze-player', this.handleFreeze, this);
EventBus.off('unfreeze-player', this.handleUnfreeze, this);
```

### How redux-persist whitelist works (add 'narrative' here)
```javascript
// Source: src/store/store.js lines 22-26
const persistConfig = {
  key: 'gogo-arabic',
  storage,
  whitelist: ['player', 'vocabulary', 'quests', 'alphabet', 'settings',
              'npc', 'achievements', 'dailyGoals', 'grammar', 'battle'],
  // Add 'narrative' to this array when narrativeSlice is created
};
```

### How existing slices export named selectors (follow this pattern in narrativeSlice)
```javascript
// Source: src/store/slices/grammarSlice.js lines 107-128
export const selectCompletedLessons = (state) => state.grammar.completedLessons;
export const selectGrammarProgress = createSelector(
  [selectCompletedLessons],
  (completedLessons) => { /* memoized computation */ }
);
// Parameterized selector pattern:
export const selectIsLessonCompleted = (lessonId) => (state) =>
  state.grammar.completedLessons.includes(lessonId);
```

### How InteractableManager reads store directly (Phaser can't use hooks)
```javascript
// Source: src/game/systems/InteractableManager.js lines 42-45
const openedChests = store.getState().player.openedChests || [];
// For future Phaser systems reading narrativeSlice:
const worldObjectState = store.getState().narrative.worldObjectStates[objectId];
```

### How createMockScene is extended for new Phaser APIs (add scene.launch/pause/resume)
```javascript
// Source: src/game/systems/__tests__/mocks/sceneMock.js — current scene mock
// Add to the defaultScene.scene object for SceneStackManager tests:
scene: {
  start: vi.fn(),
  key: 'TestScene',
  // ADD THESE for SceneStackManager:
  pause: vi.fn(),
  resume: vi.fn(),
  launch: vi.fn(),
  stop: vi.fn(),
  isActive: vi.fn(() => true),
  getScene: vi.fn(() => null),
  manager: {
    getActiveScenes: vi.fn(() => []),
  },
},
```

### How sub-hooks cleanup was validated in the global test setup
```javascript
// Source: src/test/setup.js lines 116-124
afterEach(async () => {
  const { EventBus } = await import('../utils/eventBus.js');
  if (EventBus && EventBus.removeAllListeners) {
    EventBus.removeAllListeners(); // Full cleanup between tests
  }
  vi.clearAllMocks();
  vi.useRealTimers();
});
// This global cleanup means per-test listener leaks are caught in isolation
// but production-mode stacking still needs per-hook cleanup.
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Monolithic useEventBusListeners (21 events) | 4+ domain sub-hooks | Phase 19 | Each sub-hook independently testable and extendable |
| Flat event strings (`npc-interact`) | Namespaced registry (`phaser:npc:interact`) | Phase 19 | Prevents collisions as event count grows from 21 to 40+ |
| No narrative state persistence | narrativeSlice + redux-persist | Phase 19 | Story flags, NPC relationships survive page refreshes |
| Manual scene management in WorldScene | SceneStackManager system | Phase 19 (foundation) / Phase 21 (use) | Building entry/exit without memory leaks |

**Deprecated/outdated after Phase 19:**
- Raw event strings in EventBus calls: replaced by `EVENTS.EVENT_NAME` constants
- The monolithic `useEventBusListeners.js` single useEffect: replaced by the thin orchestrator pattern

---

## Open Questions

1. **Should existing event names be renamed to namespace convention or kept for backward compatibility?**
   - What we know: WorldScene and InteractableManager use old flat names. React hooks use old flat names. Both sides must be updated together.
   - What's unclear: Whether to rename all 21 existing events (breaking change, atomic migration required) or add new namespaced names and deprecate old ones (less risky but leaves technical debt).
   - Recommendation: Rename all 21 existing events in one atomic task. The codebase is small enough. Keep a mapping comment in eventBusTypes.js for any event whose name changed significantly.

2. **Dialogue JSON validation at build time vs. runtime?**
   - What we know: INFR-04 says "validated at build time." The dialogue data is currently in `npcs.json` (~220KB).
   - What's unclear: Whether to validate at Vite build time (fails the build on bad data) or at app startup (logs warnings but doesn't fail).
   - Recommendation: Use a Vite plugin or `vite.config.js` `buildStart` hook with Zod to validate `src/data/npcs.json` structure at build time. This catches malformed trees before they reach production.

3. **narrativeSlice story flag budget (50 flags) — how to enforce?**
   - What we know: NARR-02 caps flags at 50. Requirements say flags use "enums and numbered stages, not booleans."
   - What's unclear: Whether to enforce the cap in the reducer (throw/warn if >50 flags) or rely on code review.
   - Recommendation: Add a DEV-mode console.warn in `setStoryFlag` when `Object.keys(state.storyFlags).length >= 50`. Don't throw — warn. The cap is a design constraint, not a hard runtime error.

---

## Sources

### Primary (HIGH confidence)
- Live codebase at `/Users/theshumba/Documents/GitHub/gogo-arabic/src/` — all architectural claims verified by direct file reads
- `src/hooks/useEventBusListeners.js` — 424 lines, 21 EventBus.on calls verified by grep
- `src/store/store.js` — 12-slice configuration, redux-persist whitelist verified
- `src/game/scenes/WorldScene.js` — delegation pattern, shutdown cleanup verified
- `src/game/systems/__tests__/mocks/sceneMock.js` — mock API surface verified
- `src/test/testUtils.jsx` — manual store construction without persist verified
- `src/test/setup.js` — fake timers at `2026-02-09T00:00:00Z` verified
- Build output: `index` bundle = 276.83KB (well under 500KB limit)
- Test run: 554 total tests, 551 passing, 3 pre-existing failures (DailyDashboard ×2, HUD ×1)

### Secondary (MEDIUM confidence)
- `.planning/REQUIREMENTS.md` — INFR-01 through INFR-10 requirements text
- `.planning/RESEARCH-REPORT-EXPANDED.md` — v5.0 design research on EventBus pitfalls, narrative patterns

### Tertiary (LOW confidence — not applicable)
- No external sources required: all research is from the live codebase and project documents.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries are existing project dependencies, versions confirmed from package.json
- Architecture patterns: HIGH — all patterns are direct extractions from live source files
- Pitfalls: HIGH — verified by code inspection (listener cleanup pattern, persist whitelist pattern, testUtils manual construction)
- Test count: HIGH — confirmed by running `npx vitest run` directly (554 tests, 3 pre-existing failures)

**Research date:** 2026-02-10
**Valid until:** 2026-03-12 (30 days — stable, no fast-moving external dependencies)
