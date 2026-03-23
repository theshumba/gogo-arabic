# Phase 61: CEFR Placement Test — Research

**Researched:** 2026-03-23
**Domain:** CAT placement test, Redux fan-out dispatch, React overlay integration
**Confidence:** HIGH

---

## Summary

Phase 61 builds on a complete Redux foundation established in Phase 56 (`placementSlice`, `cefrProgressSlice`) and a quiz ecosystem from Phases 58-60. All three plans are primarily wiring and authoring work, not infrastructure work. The slices, reducers, and quiz component patterns already exist. The core risk is correctness of the placement logic (one-level-lower default, B1 cap, early-exit threshold) and ensuring the fan-out dispatch pre-unlocks the right grammar lessons and skill tree nodes for each CEFR level.

There is no `batch()` import in this codebase. Sequential `store.dispatch()` calls inside a Redux middleware or a thunk are automatically batched in React 18 via automatic batching — no special import required. The plan summary says "react-redux batch()" but the actual codebase uses the modern pattern of sequential dispatches.

The placement test is NOT an overlay on the game world. It should be a standalone full-screen React component rendered before the main menu or as an overlay on the main menu — using the existing full-screen pattern from `MainMenu.jsx` / `SettingsMenu.jsx`. The game world is Phaser-based; the placement test must be pure React.

**Primary recommendation:** Author `placementEngine.js` as a pure function module, `placementTest.js` as a static data file of 20-30 calibrated items, and `PlacementTestOverlay.jsx` as a self-contained overlay using existing quiz type components. Fan-out dispatch belongs in a thin action creator or inside `PlacementTestOverlay`'s completion handler — NOT in a middleware (to keep the middleware chain clean).

---

## Standard Stack

### Core (already installed — zero new deps)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@reduxjs/toolkit` | existing | `createSlice`, reducers | Already used for all slices |
| `react-redux` | existing | `useDispatch`, `useSelector` | Existing pattern throughout |
| `framer-motion` | existing | Overlay enter/exit animation | Already used in `QuizOverlay.jsx` |
| `redux-persist` | existing | localStorage persistence | `placementSlice` already in whitelist |

### No New Installs Required

All dependencies are already present. The plan summary mentions `batch()` — in React 18 + Redux Toolkit, sequential dispatches in event handlers and effects are automatically batched. Do not import `batch`.

---

## Architecture Patterns

### Recommended File Structure

```
src/
├── data/
│   └── placementTest.js          # 20-30 static CAT items with CEFR tags and domains
├── services/
│   └── placementEngine.js        # Pure functions: scoreTest(), assignLevel(), deriveUnlocks()
└── components/
    └── Placement/
        └── PlacementTestOverlay.jsx  # Full-screen overlay; renders one question at a time
```

### Pattern 1: Static Item Bank (placementTest.js)

Each item has a `cefrLevel` tag and a `domain` tag. The engine selects them in IRT binary-search order.

```javascript
// src/data/placementTest.js
export const PLACEMENT_ITEMS = [
  {
    id: 'placement_001',
    cefrLevel: 'Pre-A1',   // 'Pre-A1' | 'A1' | 'A2' | 'B1'
    domain: 'vocabulary',  // 'vocabulary' | 'grammar' | 'reading' | 'roots' | 'speaking' | 'culture'
    type: 'ar-to-en',      // any key from QUIZ_TYPE_REGISTRY that is simple (no tile-bank)
    // word data compatible with existing quiz type components:
    arabic: 'كتاب',
    english: 'book',
    options: ['book', 'door', 'sun', 'water'],
    correctAnswer: 'book',
  },
  // ... 20-30 items spanning Pre-A1 through B1 across all 6 domains
];

export const PLACEMENT_LEVELS = ['Pre-A1', 'A1', 'A2', 'B1'];
// B1 is the cap — no B2/C1/C2 items
```

**Item count guidance:** 20-30 items (REQUIREMENTS.md says 15-20 CAT questions for the test; 20-30 items in the bank is slightly larger to enable proper binary search selection). The engine picks at most 20-30 questions from the bank adaptively.

### Pattern 2: Pure Engine (placementEngine.js)

```javascript
// src/services/placementEngine.js
import { PLACEMENT_ITEMS, PLACEMENT_LEVELS } from '../data/placementTest.js';
import { CEFR_ORDER } from '../data/quizTypes.js';

// CEFR_ORDER already exported from quizTypes.js: { A1:1, A2:2, B1:3, B2:4 }
// Extend for Pre-A1:
const FULL_CEFR_ORDER = { 'Pre-A1': 0, 'A1': 1, 'A2': 2, 'B1': 3 };

/**
 * IRT binary search: given current difficulty estimate, select next item.
 * Simple approach: track consecutive correct/wrong streaks to adjust.
 * Returns null when bank is exhausted or early-exit triggered.
 */
export function selectNextItem(answeredIds, currentLevelEstimate) { ... }

/**
 * Compute raw score (0-N) from answered items.
 */
export function computeRawScore(answers) { ... }

/**
 * Map raw score to CEFR level (B1 cap) then apply conservative one-level-lower default.
 * @param {number} rawScore
 * @param {number} totalItems
 * @returns {{ rawLevel: string, assignedLevel: string }}
 *   rawLevel = level the score corresponds to
 *   assignedLevel = one level below rawLevel (conservative placement)
 */
export function assignCefrLevel(rawScore, totalItems) { ... }

/**
 * Derive grammar lesson IDs to pre-unlock for a given CEFR level.
 * Returns all grammarLessons where lesson.cefrLevel <= assignedLevel.
 */
export function deriveGrammarUnlocks(assignedLevel) { ... }

/**
 * Derive skill tree node IDs to pre-unlock for a given CEFR level.
 * Returns nodes where node.cefrLevel <= assignedLevel, across all 6 trees.
 * Uses bulkUnlockNodes (bypasses XP) — same pattern as initializeSkillTree.
 */
export function deriveSkillTreeUnlocks(assignedLevel) { ... }
```

### Pattern 3: PlacementTestOverlay.jsx Component Shape

The overlay manages its own local state (current question index, answers, feedback) and calls `onComplete(assignedLevel, rawScore)` when done.

```jsx
// src/components/Placement/PlacementTestOverlay.jsx
export default function PlacementTestOverlay({ onComplete, onSkip }) {
  // Local state
  const [phase, setPhase] = useState('intro'); // 'intro' | 'testing' | 'result'
  const [items, setItems] = useState([]);       // selected items
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);   // { itemId, correct }[]
  const [result, setResult] = useState(null);   // { rawLevel, assignedLevel }

  // On answer: check early-exit (10 consecutive correct)
  // On complete: call assignCefrLevel(), show result screen
  // Result screen: shows assignedLevel + "Start Lower" button
  // "Start Lower": drops one more tier before calling onComplete
}
```

The overlay does NOT call `useQuiz()` — it manages its own simple answer/feedback cycle since placement items are self-contained (they include their own options array). It reuses quiz type renderer components where the item type matches (e.g. `ArabicToEnglish` for `ar-to-en` items).

### Pattern 4: Fan-Out Dispatch in Completion Handler

Fan-out happens in `PlacementTestOverlay`'s `onComplete` callback, dispatched by the parent component (MainMenu or wherever the overlay is mounted). Sequential dispatches are auto-batched in React 18.

```javascript
// In parent component's handlePlacementComplete(assignedLevel, rawScore):
import { recordPlacementResult } from '../store/slices/placementSlice.js';
import { setCefrLevel } from '../store/slices/cefrProgressSlice.js';
import { bulkUnlockNodes } from '../store/slices/skillTreeSlice.js';
import { deriveGrammarUnlocks, deriveSkillTreeUnlocks } from '../services/placementEngine.js';

dispatch(recordPlacementResult({ assignedLevel, rawScore }));
dispatch(setCefrLevel({ level: assignedLevel, source: 'placement' }));

// Pre-unlock grammar lessons
const grammarIds = deriveGrammarUnlocks(assignedLevel);
// Add to unlockedLessons: grammarSlice needs a bulkUnlockLessons reducer (or dispatch unlockNextLesson N times)
// See: pitfall below — grammarSlice only has unlockNextLesson (sequential), not bulk.

// Pre-unlock skill tree nodes (bulkUnlockNodes already exists)
const treeUnlocks = deriveSkillTreeUnlocks(assignedLevel);
for (const [treeId, nodeIds] of Object.entries(treeUnlocks)) {
  dispatch(bulkUnlockNodes({ treeId, nodeIds }));
}
```

### Pattern 5: Grammar Bulk Unlock Gap

`grammarSlice` has `unlockNextLesson` (unlocks one at a time, sequentially by order) but NO `bulkUnlockLessons`. For placement fan-out, Plan 61-03 must either:

1. Add a `bulkUnlockLessons` reducer to `grammarSlice` (preferred — mirrors `bulkUnlockNodes` in skillTreeSlice), OR
2. Dispatch `unlockNextLesson` in a loop (works but triggers middleware side effects per call).

**Recommendation:** Add `bulkUnlockLessons(state, action)` to `grammarSlice` — takes `lessonIds: string[]`, adds them to `unlockedLessons` without triggering sequential XP side effects. Same pattern as `bulkUnlockNodes`.

### Pattern 6: Settings Retake UI

`SettingsMenu.jsx` is a React component at `/settings`. Add a "CEFR Placement Test" section that reads `selectHasCompletedPlacement` and shows:
- Current level + completion date if already taken
- "Retake Placement Test" button with inline warning text
- On click: `dispatch(resetPlacement())`, `dispatch(resetCefrProgress())` (need new action or re-use `initCefrLevel` logic), then render `PlacementTestOverlay`

Note: `cefrProgressSlice` does NOT have a `resetCefrProgress` action today. Plan 61-03 must add one, or reset via `setCefrLevel` with a clearing mechanism. The simplest approach: add `resetCefrProgress()` to `cefrProgressSlice` returning `initialState`.

### Pattern 7: First-Launch Trigger

`MainMenu.jsx` currently checks `player.name !== ''` to distinguish new/returning players. The placement test should appear when:
- Player has a character (`player.name !== ''`), AND
- `placement.hasCompleted === false`

This means `MainMenu.jsx` (or `GameLayout.jsx`) renders `PlacementTestOverlay` as a modal overlay when both conditions are true.

### Anti-Patterns to Avoid

- **Calling `useQuiz()` inside PlacementTestOverlay:** `useQuiz` manages FSRS cards, vocabulary selection, and session state — unnecessary for placement. Write a self-contained state machine.
- **Putting fan-out in learningProgressMiddleware:** Middleware should not handle placement completion. Keep fan-out in the component/thunk layer.
- **Using `batch()` from react-redux:** Not needed in React 18. Sequential dispatches in event handlers are already batched automatically.
- **Tile-bank quiz types in placement:** `WordOrder`, `SentenceBuilder`, `CategorySort` require drag-and-drop tile state management — too complex for placement. Stick to `ar-to-en`, `en-to-ar`, `fill-blank`, `GrammarFill`, `ClozePassage` (simple choice-click types).
- **Testing at B1+ in placement bank:** REQUIREMENTS says B1 cap. No B2/C1/C2 items in placement bank.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CEFR ordering | Custom level comparison | `CEFR_ORDER` from `quizTypes.js` | Already exported, used in adaptive engine |
| Bulk node unlock (skip XP) | Custom XP bypass | `bulkUnlockNodes` from skillTreeSlice | Already exists, used by initializeSkillTree |
| Grammar lesson ordering | Custom sort | `grammarLessons.sort((a,b) => a.order - b.order)` from grammar.js | Existing order field, same pattern as unlockNextLesson |
| Skill tree node CEFR lookup | Custom mapping | `node.cefrLevel` field on every SKILL_TREES node | Already tagged Pre-A1/A1/A2/B1/B2/C1/C2 |
| Quiz renderer components | New Arabic question UI | `ArabicToEnglish`, `FillInBlank`, `GrammarFill`, `ClozePassage` | Already fully styled and functional |
| Overlay focus trap | Custom focus management | `useFocusTrap` hook | Already exists at src/hooks/useFocusTrap.js |

---

## Common Pitfalls

### Pitfall 1: B1 Cap — Don't Assign B2 Even if Score Warrants It

**What goes wrong:** A high-scoring player gets raw level B2 or C1; the test assigns B1 (cap) minus one = A2.
**Why it happens:** The cap and the one-level-lower default interact.
**How to avoid:** Apply the B1 cap BEFORE the one-level-lower step:
  1. Raw score → raw CEFR level
  2. Cap raw level to B1: `rawLevel = min(rawLevel, B1)`
  3. Assign level = one below capped raw level
  4. "Start Lower" button drops one more
**Warning sign:** Test that a 100% score returns `assignedLevel: 'A2'` (B1 cap minus one), NOT 'B1'.

### Pitfall 2: Grammar Lesson Unlock Count vs. Unlock Chain

**What goes wrong:** `bulkUnlockLessons` unlocks grammar lessons by CEFR, but `unlockNextLesson` (called by middleware on lesson completion) uses order-based sequential unlocking. If placement pre-unlocks non-contiguous lessons, the middleware's "next lesson" logic may create gaps.
**Why it happens:** `unlockNextLesson` finds the next lesson by order after the completed one. If non-contiguous lessons are unlocked by placement, completing early lessons won't unlock later ones.
**How to avoid:** `bulkUnlockLessons` should unlock ALL lessons from order 1 up to the highest lesson at the assigned CEFR level (i.e. contiguous unlock from the start). This mirrors migration 12's conservative unlock logic.

### Pitfall 3: Skill Tree Node Prerequisites in Pre-Unlock

**What goes wrong:** `bulkUnlockNodes` bypasses XP but does NOT bypass prerequisite checks — it just pushes IDs into the array without verifying prerequisites.
**Why it happens:** Looking at `skillTreeSlice.js` line 136-146: `bulkUnlockNodes` iterates and pushes without prerequisite checks. This is intentional — it's a bootstrap tool.
**How to avoid:** This is actually correct behavior for placement. When deriving which nodes to pre-unlock, unlock them in prerequisite order (lowest cefrLevel first, respecting the tree's prerequisite chain). The `initializeSkillTree` pattern (sort by xpCost ascending) can be reused.

### Pitfall 4: resetCefrProgress Missing

**What goes wrong:** Settings retake dispatches `resetPlacement()` but `cefrProgressSlice` has no reset action. The level history accumulates incorrectly if the player retakes.
**Why it happens:** `cefrProgressSlice` was written as write-once (Phase 56 design).
**How to avoid:** Add `resetCefrProgress()` to cefrProgressSlice returning `initialState` in Plan 61-03.

### Pitfall 5: Early-Exit Logic Off-by-One

**What goes wrong:** "10 consecutive correct" early exit fires after question 9 (0-indexed) instead of after question 10.
**Why it happens:** Off-by-one in `consecutiveCorrect` counter check.
**How to avoid:** Check `consecutiveCorrect >= 10` AFTER incrementing the counter, not before.

### Pitfall 6: Placement Test Shown on Every Page Load

**What goes wrong:** `placement.hasCompleted` is `false` (initial state) for ALL players who haven't run migration 11 yet, so the test pops up for returning players who have lots of progress.
**Why it happens:** Migration 11 already initializes `placement: { hasCompleted: false }` for existing players. This is correct — existing players SHOULD be offered the test since they have no CEFR level assigned.
**How to avoid:** This is expected behavior. Returning players with existing progress will see the test once. The "Start Lower" and skip options are the UX mitigation.

### Pitfall 7: Pre-A1 Level in CEFR_ORDER

**What goes wrong:** `CEFR_ORDER` in `quizTypes.js` only has `{ A1:1, A2:2, B1:3, B2:4 }` — no `Pre-A1`.
**Why it happens:** Pre-A1 exists in skillTrees.js node definitions but not in quizTypes.js CEFR_ORDER.
**How to avoid:** `placementEngine.js` must define its own extended order: `{ 'Pre-A1': 0, 'A1': 1, 'A2': 2, 'B1': 3 }`. Do NOT modify `CEFR_ORDER` in quizTypes.js (it would break existing tests that assert on the 4-entry shape).

---

## Code Examples

### Example 1: Level Assignment Logic

```javascript
// src/services/placementEngine.js
const PLACEMENT_LEVEL_ORDER = ['Pre-A1', 'A1', 'A2', 'B1'];

export function assignCefrLevel(rawScore, totalItems) {
  // 1. Map score percentage to a raw level
  const pct = rawScore / totalItems;
  let rawLevelIdx;
  if (pct < 0.25)      rawLevelIdx = 0; // Pre-A1
  else if (pct < 0.50) rawLevelIdx = 1; // A1
  else if (pct < 0.75) rawLevelIdx = 2; // A2
  else                 rawLevelIdx = 3; // B1 (cap — never goes higher)

  const rawLevel = PLACEMENT_LEVEL_ORDER[rawLevelIdx];

  // 2. Conservative placement: one level below raw (min: Pre-A1)
  const assignedIdx = Math.max(0, rawLevelIdx - 1);
  const assignedLevel = PLACEMENT_LEVEL_ORDER[assignedIdx];

  // 3. Map Pre-A1 -> 'A1' for cefrProgressSlice (slice only stores A1-B2)
  const storedLevel = assignedLevel === 'Pre-A1' ? 'A1' : assignedLevel;

  return { rawLevel, assignedLevel, storedLevel };
}
```

### Example 2: Grammar Bulk Unlock Reducer (addition to grammarSlice.js)

```javascript
// In grammarSlice reducers:
bulkUnlockLessons(state, action) {
  // payload: string[] of lessonIds
  const lessonIds = action.payload;
  lessonIds.forEach((id) => {
    if (!state.unlockedLessons.includes(id)) {
      state.unlockedLessons.push(id);
    }
  });
},
```

### Example 3: Deriving Grammar Unlocks

```javascript
// src/services/placementEngine.js
import { grammarLessons } from '../data/grammar.js';

const PLACEMENT_CEFR_ORDER = { 'Pre-A1': 0, 'A1': 1, 'A2': 2, 'B1': 3 };

export function deriveGrammarUnlocks(assignedLevel) {
  const assignedOrder = PLACEMENT_CEFR_ORDER[assignedLevel] ?? 0;
  // Unlock all lessons at or below assigned CEFR level, in order
  return grammarLessons
    .filter(l => (PLACEMENT_CEFR_ORDER[l.cefrLevel] ?? 99) <= assignedOrder)
    .sort((a, b) => a.order - b.order)
    .map(l => l.id);
}
```

### Example 4: Deriving Skill Tree Node Unlocks

```javascript
// src/services/placementEngine.js
import { SKILL_TREES, SKILL_TREE_ORDER } from '../data/skillTrees.js';

export function deriveSkillTreeUnlocks(assignedLevel) {
  const assignedOrder = PLACEMENT_CEFR_ORDER[assignedLevel] ?? 0;
  const result = {};

  for (const treeId of SKILL_TREE_ORDER) {
    const tree = SKILL_TREES[treeId];
    // Sort nodes by xpCost (same pattern as initializeSkillTree)
    const eligible = tree.nodes
      .filter(n => (PLACEMENT_CEFR_ORDER[n.cefrLevel] ?? 99) <= assignedOrder)
      .sort((a, b) => a.xpCost - b.xpCost);

    if (eligible.length > 0) {
      result[treeId] = eligible.map(n => n.id);
    }
  }
  return result; // { reading: ['reading_01', ...], grammar: ['grammar_01', 'grammar_02'], ... }
}
```

### Example 5: Fan-Out Dispatch (in completion handler)

```javascript
// In PlacementTestOverlay or parent:
function handlePlacementComplete(assignedLevel, rawScore, storedLevel) {
  dispatch(recordPlacementResult({ assignedLevel, rawScore }));
  dispatch(setCefrLevel({ level: storedLevel, source: 'placement' }));

  // Grammar pre-unlock
  const grammarIds = deriveGrammarUnlocks(assignedLevel);
  dispatch(bulkUnlockLessons(grammarIds));

  // Skill tree pre-unlock (per tree)
  const treeUnlocks = deriveSkillTreeUnlocks(assignedLevel);
  for (const [treeId, nodeIds] of Object.entries(treeUnlocks)) {
    dispatch(bulkUnlockNodes({ treeId, nodeIds }));
  }
}
```

### Example 6: Settings Retake Warning (in SettingsMenu.jsx)

```jsx
// In SettingsMenu:
const placement = useSelector(selectPlacement);
const [showPlacementTest, setShowPlacementTest] = useState(false);

// In JSX:
{placement.hasCompleted && (
  <div>
    <div>CEFR Level: {placement.assignedLevel} (placed {placement.completedAt?.slice(0,10)})</div>
    <button onClick={() => {
      if (window.confirm('Retaking the placement test will reset your CEFR tracking history. Continue?')) {
        dispatch(resetPlacement());
        dispatch(resetCefrProgress());
        setShowPlacementTest(true);
      }
    }}>
      Retake Placement Test
    </button>
  </div>
)}
{showPlacementTest && (
  <PlacementTestOverlay
    onComplete={(assignedLevel, rawScore, storedLevel) => {
      handlePlacementComplete(assignedLevel, rawScore, storedLevel);
      setShowPlacementTest(false);
    }}
    onSkip={() => setShowPlacementTest(false)}
  />
)}
```

---

## Validation Architecture

Test patterns for each success criterion, designed as pure unit tests (no React rendering required for engine logic, integration tests for Redux fan-out).

### Success Criterion 1: New player offered placement test; conservative assignment; "Start Lower" escape hatch

**File:** `src/services/__tests__/placementEngine.test.js`

```javascript
// Test: assignCefrLevel maps score correctly
it('100% score assigns rawLevel B1, assignedLevel A2 (one-lower-than-cap)', () => {
  const { rawLevel, assignedLevel } = assignCefrLevel(30, 30);
  expect(rawLevel).toBe('B1');
  expect(assignedLevel).toBe('A2');
});

it('0% score assigns rawLevel Pre-A1, assignedLevel Pre-A1 (floor)', () => {
  const { rawLevel, assignedLevel } = assignCefrLevel(0, 30);
  expect(rawLevel).toBe('Pre-A1');
  expect(assignedLevel).toBe('Pre-A1'); // can't go below floor
});

it('75% score assigns rawLevel B1, assignedLevel A2', () => {
  const { rawLevel, assignedLevel } = assignCefrLevel(23, 30); // 76%
  expect(rawLevel).toBe('B1');
  expect(assignedLevel).toBe('A2');
});

it('50-74% score assigns rawLevel A2, assignedLevel A1', () => {
  const { assignedLevel } = assignCefrLevel(18, 30); // 60%
  expect(assignedLevel).toBe('A1');
});

// Test: "Start Lower" drops one additional tier
it('startLower reduces assignedLevel by one tier', () => {
  const lower = dropOneTier('A2');
  expect(lower).toBe('A1');
});

it('startLower from A1 stays at A1 (floor)', () => {
  expect(dropOneTier('A1')).toBe('A1');
});
```

**File:** `src/components/Placement/__tests__/PlacementTestOverlay.test.jsx` (integration)

```javascript
// Test: placement test offered on first launch
it('renders PlacementTestOverlay when placement.hasCompleted is false and player has name', () => {
  // Render MainMenu with placement.hasCompleted = false
  // Expect PlacementTestOverlay to be visible
});

it('does NOT render PlacementTestOverlay when placement.hasCompleted is true', () => {
  // Render MainMenu with placement.hasCompleted = true
  // Expect PlacementTestOverlay not to be in document
});
```

### Success Criterion 2: Placement result pre-unlocks appropriate skill tree nodes and grammar lessons

**File:** `src/services/__tests__/placementEngine.test.js`

```javascript
// Grammar unlock derivation
it('deriveGrammarUnlocks for A1 returns only A1 lessons', () => {
  const ids = deriveGrammarUnlocks('A1');
  // All returned IDs must be A1 cefrLevel lessons
  ids.forEach(id => {
    const lesson = grammarLessons.find(l => l.id === id);
    expect(['A1', 'Pre-A1']).toContain(lesson.cefrLevel);
  });
});

it('deriveGrammarUnlocks for A2 includes all A1 AND A2 lessons', () => {
  const a1Ids = deriveGrammarUnlocks('A1');
  const a2Ids = deriveGrammarUnlocks('A2');
  expect(a2Ids.length).toBeGreaterThan(a1Ids.length);
  // All A1 IDs are present in A2 result (superset)
  a1Ids.forEach(id => expect(a2Ids).toContain(id));
});

it('deriveGrammarUnlocks returns lessons in order (no gaps)', () => {
  const ids = deriveGrammarUnlocks('A2');
  const lessons = ids.map(id => grammarLessons.find(l => l.id === id));
  const orders = lessons.map(l => l.order);
  // Orders should be consecutive from 1 upward
  expect(orders[0]).toBe(1);
  for (let i = 1; i < orders.length; i++) {
    expect(orders[i]).toBe(orders[i-1] + 1);
  }
});

// Skill tree unlock derivation
it('deriveSkillTreeUnlocks for A1 returns grammar nodes grammar_01 and grammar_02', () => {
  const unlocks = deriveSkillTreeUnlocks('A1');
  expect(unlocks.grammar).toContain('grammar_01'); // Pre-A1 node
  expect(unlocks.grammar).toContain('grammar_02'); // A1 node
});

it('deriveSkillTreeUnlocks for A1 does NOT include grammar_03 (A2 node)', () => {
  const unlocks = deriveSkillTreeUnlocks('A1');
  expect(unlocks.grammar).not.toContain('grammar_03');
});
```

**File:** `src/store/__tests__/placementFanOut.test.js` (Redux integration)

```javascript
it('fan-out dispatch after A2 placement pre-unlocks A1+A2 grammar lessons', () => {
  // Set up store with grammar + placement + cefrProgress + skillTree reducers
  // Dispatch fan-out
  // Assert: grammar.unlockedLessons contains all A1+A2 lesson IDs
  const unlockedLessons = store.getState().grammar.unlockedLessons;
  const a2GrammarIds = deriveGrammarUnlocks('A2');
  a2GrammarIds.forEach(id => expect(unlockedLessons).toContain(id));
});

it('fan-out dispatch after A1 placement pre-unlocks grammar_01 and grammar_02 skill tree nodes', () => {
  // Dispatch fan-out with assignedLevel = 'A1'
  const unlockedNodes = store.getState().skillTree.unlockedNodes.grammar;
  expect(unlockedNodes).toContain('grammar_01');
  expect(unlockedNodes).toContain('grammar_02');
});

it('fan-out dispatch writes to cefrProgressSlice.currentLevel', () => {
  // After fan-out dispatch with assignedLevel = 'A2', storedLevel = 'A2'
  expect(store.getState().cefrProgress.currentLevel).toBe('A2');
});

it('fan-out dispatch writes to placementSlice.assignedLevel', () => {
  expect(store.getState().placement.assignedLevel).toBe('A2');
  expect(store.getState().placement.hasCompleted).toBe(true);
});
```

### Success Criterion 3: Settings retake with warning; resets CEFR tracking history

**File:** `src/store/__tests__/placementRetake.test.js`

```javascript
it('resetPlacement returns hasCompleted to false and clears assignedLevel', () => {
  store.dispatch(recordPlacementResult({ assignedLevel: 'A2', rawScore: 15 }));
  store.dispatch(resetPlacement());
  expect(store.getState().placement.hasCompleted).toBe(false);
  expect(store.getState().placement.assignedLevel).toBeNull();
});

it('resetCefrProgress clears currentLevel and levelHistory', () => {
  store.dispatch(setCefrLevel({ level: 'A2', source: 'placement' }));
  store.dispatch(resetCefrProgress());
  expect(store.getState().cefrProgress.currentLevel).toBeNull();
  expect(store.getState().cefrProgress.levelHistory).toEqual([]);
});
```

**Component test (Settings integration):**

```javascript
it('SettingsMenu shows retake button when placement.hasCompleted is true', () => {
  // Render SettingsMenu with store where placement.hasCompleted = true
  // Expect "Retake Placement Test" button to be present
});

it('clicking Retake without confirming does not dispatch resetPlacement', () => {
  // Mock window.confirm to return false
  // Click retake button
  // Assert resetPlacement was NOT dispatched
});

it('clicking Retake and confirming dispatches resetPlacement and resetCefrProgress', () => {
  // Mock window.confirm to return true
  // Click retake button
  // Assert both resets were dispatched
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single `placement.hasCompleted` boolean check | Dual check: `hasCompleted + cefrProgress.currentLevel` | Phase 56 | Placement and CEFR tracking are separate concerns |
| `batch()` from react-redux for multi-dispatch | React 18 automatic batching | React 18 | No `batch()` import needed |
| Custom XP-based unlock logic | `bulkUnlockNodes` bypasses XP for bootstrap | Phase 57 | Placement pre-unlock mirrors bootstrap pattern |
| Grammar unlock by completion only | `unlockedLessons` array + `unlockNextLesson` reducer | Phase 58 | New `bulkUnlockLessons` follows same pattern |

---

## Open Questions

1. **Where exactly does PlacementTestOverlay mount?**
   - What we know: MainMenu is rendered at `/`, and it checks `player.name !== ''` for character existence.
   - What's unclear: Should the overlay appear inside `MainMenu` (before seeing the menu) or on top of the menu? The STATE.md and requirements say "offered on first launch" which implies before or immediately after the main menu loads.
   - Recommendation: Render `PlacementTestOverlay` inside `MainMenu.jsx` as a conditional overlay (same z-index pattern as `AudioUnlockOverlay` in main.jsx). This keeps routing untouched.

2. **REQUIREMENTS.md says 15-20 CAT questions; plan says 20-30 calibrated items in the bank**
   - What we know: 15-20 is the questions SHOWN to the player; 20-30 is the bank size for adaptive selection.
   - What's unclear: Is the bank intended to be exactly 20-30 items, or can it be larger?
   - Recommendation: Bank of exactly 30 items (5 per CEFR level × 6 domains). Test stops after 20 questions or early-exit at 10 consecutive correct.

3. **Early-exit threshold**
   - What we know: Plan 61-02 spec says "early-exit at 10 consecutive correct."
   - What's unclear: Does early-exit always assign B1 (highest level), or does it compute from answered items so far?
   - Recommendation: Early-exit computes from items answered so far — not a hard "assign B1" rule. 10 consecutive correct with few items answered should naturally yield a high score percentage.

---

## Sources

### Primary (HIGH confidence)
- Codebase: `/src/store/slices/placementSlice.js` — confirmed shape: `{ hasCompleted, assignedLevel, rawScore, completedAt }`, reducers: `recordPlacementResult`, `resetPlacement`
- Codebase: `/src/store/slices/cefrProgressSlice.js` — confirmed shape: `{ currentLevel, levelHistory, lastAssessedAt }`, reducers: `setCefrLevel`, `initCefrLevel` (no reset action)
- Codebase: `/src/store/slices/grammarSlice.js` — confirmed: `unlockedLessons: ['al-definite']` initial, `unlockNextLesson` sequential-only, NO `bulkUnlockLessons`
- Codebase: `/src/store/slices/skillTreeSlice.js` — confirmed: `bulkUnlockNodes` exists, bypasses XP deduction
- Codebase: `/src/data/skillTrees.js` — confirmed: all 30 nodes per tree have `cefrLevel` field (Pre-A1 through C2), grammar tree has `grammar_01` (Pre-A1), `grammar_02` (A1), `grammar_03` (A2), `grammar_04` (B1)
- Codebase: `/src/data/grammar.js` — confirmed: 43 lessons with `cefrLevel` fields: 13 × A1, 7 × A2, 13 × B1, 10 × B2; all have `order` field starting at 1
- Codebase: `/src/data/quizTypes.js` — confirmed: `CEFR_ORDER = { A1:1, A2:2, B1:3, B2:4 }` (no Pre-A1)
- Codebase: `/src/data/initializeSkillTree.js` — confirmed pattern for bulk unlock: sort by xpCost, walk prerequisites, dispatch `bulkUnlockNodes`
- Codebase: `/src/store/store.js` — confirmed: `placement` and `cefrProgress` in localStorage whitelist; CURRENT_VERSION = 12
- Codebase: `/src/services/storage/migrations.js` — confirmed: migration 11 initializes placement and cefrProgress for existing players

### Secondary (MEDIUM confidence)
- React 18 automatic batching: multiple dispatches in event handlers are automatically batched; no `batch()` import needed. Consistent with absence of `batch` imports in entire codebase.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed from codebase inspection
- Architecture: HIGH — all slice shapes, reducer names, and existing patterns confirmed from source
- Pitfalls: HIGH — all identified from direct source code analysis (missing `bulkUnlockLessons`, missing `resetCefrProgress`, Pre-A1 gap in CEFR_ORDER)
- Validation patterns: HIGH — test patterns mirror existing test files (newSlicesRegistration.test.js, quizTypes.test.js)

**Research date:** 2026-03-23
**Valid until:** 2026-04-23 (stable codebase; re-check if Phases 58-60 files are modified)
