# Phase 57: Skill Tree Infrastructure — Research

**Researched:** 2026-03-22
**Domain:** Redux skill tree XP routing, save migration, reward dispatch, React progressive UI
**Confidence:** HIGH — all findings sourced directly from the project codebase

---

## Summary

Phase 57 expands the existing 6-tree skill system from 10-12 nodes per tree to 30 nodes, populates `learningProgressMiddleware` with XP routing for all six learning event types, adds an `initializeSkillTree(existingPlayerState)` function to prevent retroactive content locking on v11.0 → v12.0 load, introduces four new reward types on skill tree nodes (`unlock_spell`, `unlock_dialogue`, `unlock_zone`, `unlock_npc_branch`), adds a `skill_tree_level` condition to `ActionSetExecutor`, and updates `SkillTreeView` with a proper XP progress bar and progressive disclosure of the next 1-2 unlockable nodes.

All infrastructure slots are already in place: `skillTreeSlice.js` owns `addSkillXP` and `unlockNode`, `learningProgressMiddleware.js` is a pure passthrough scaffold ready to be populated, `skillTrees.js` contains the data definitions, `SkillTreeView.jsx` + `SkillTreeMenu.jsx` render the trees, and `ActionSetExecutor.js` has the requirement-evaluation switch/case to extend. No new npm packages are required.

The primary risk is the `initializeSkillTree` idempotency guarantee: it must run exactly once on first v12.0 load and never retroactively lock nodes for players who have earned them. The migration version is already 11 (Phase 56); `initializeSkillTree` is NOT a redux-persist migration — it is a one-shot initialization function called at app startup that reads existing player state and bulk-dispatches `unlockNode` actions.

**Primary recommendation:** Wire `learningProgressMiddleware` to dispatch `addSkillXP` for each of the six event types, keep all XP amounts small enough to feel earnable within a session, and implement `initializeSkillTree` as a pure function that derives unlock eligibility from `vocabulary.fsrsCards`, `quests`, `grammar.completedLessons`, and existing `skillTree.unlockedNodes` — dispatching via the store rather than mutating persisted state directly.

---

## Standard Stack

### Core (already installed — no new packages)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @reduxjs/toolkit | existing | skillTreeSlice, addSkillXP, unlockNode | All slice work follows existing patterns |
| redux-persist | existing | skillTree persisted to localStorage (root whitelist) | Already configured in store.js |
| react-redux | existing | useSelector/useDispatch in SkillTreeView | Project-wide React-Redux pattern |
| vitest | existing | Tests for middleware, slice, initializeSkillTree | Project-wide test runner |

### No new npm installs required for Phase 57.

---

## Architecture Patterns

### Existing State Shape (skillTreeSlice)

```
state.skillTree = {
  unlockedNodes: {
    reading:   ['reading_01', ...],
    writing:   [],
    listening: [],
    speaking:  [],
    grammar:   [],
    culture:   [],
  },
  skillXP: {
    reading: 0, writing: 0, listening: 0,
    speaking: 0, grammar: 0, culture: 0,
  }
}
```

`skillTree` is in the root localStorage whitelist — persisted via redux-persist at version 11.

### Pattern 1: XP Routing in learningProgressMiddleware

The scaffold at `src/store/middleware/learningProgressMiddleware.js` is a pure passthrough. Populate it by intercepting these action types and dispatching `addSkillXP`:

| Redux action type | Tree to award | XP amount |
|-------------------|---------------|-----------|
| `quests/completeQuest` | `reading` or `culture` (by quest tag, default `culture`) | 30 |
| `grammar/completeLesson` | `grammar` | 40 |
| `achievements/recordPerfectQuiz` | `reading` | 20 |
| `achievements/incrementReviews` | `reading` | 10 |
| `alphabet/completeGroup` (calligraphy proxy) | `writing` | 25 |
| `poetry/endPoetryBattle` (with `won: true`) | `speaking` + `culture` | 30 each |

**Calligraphy note:** `CALLIGRAPHY_STROKE_COMPLETE` is an EventBus event (Phaser→React), not a Redux action. The closest Redux signal for calligraphy is `alphabet/completeGroup`. The plan should use `alphabet/completeGroup` as the proxy for calligraphy letter completion.

**Vocabulary review note:** `achievements/incrementReviews` fires on every quiz answer in `useQuiz.js` (line 246) and in `ReviewSession.jsx` (line 250). This is the standard vocabulary review signal — wire it to `reading` tree XP.

```javascript
// Source: src/store/middleware/learningProgressMiddleware.js (scaffold)
export const learningProgressMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  switch (action.type) {
    case 'grammar/completeLesson':
      store.dispatch(addSkillXP({ treeId: 'grammar', amount: 40 }));
      break;
    case 'quests/completeQuest':
      store.dispatch(addSkillXP({ treeId: 'culture', amount: 30 }));
      break;
    case 'achievements/recordPerfectQuiz':
      store.dispatch(addSkillXP({ treeId: 'reading', amount: 20 }));
      break;
    case 'achievements/incrementReviews':
      store.dispatch(addSkillXP({ treeId: 'reading', amount: 10 }));
      break;
    case 'alphabet/completeGroup':
      store.dispatch(addSkillXP({ treeId: 'writing', amount: 25 }));
      break;
    case 'poetry/endPoetryBattle':
      if (action.payload?.won) {
        store.dispatch(addSkillXP({ treeId: 'speaking', amount: 30 }));
        store.dispatch(addSkillXP({ treeId: 'culture', amount: 30 }));
      }
      break;
  }

  return result;
};
```

**Re-entrancy:** `addSkillXP` does not trigger any of the six monitored action types, so no re-entrancy guard is needed (unlike `achievementMiddleware` which monitors `addXP`).

### Pattern 2: initializeSkillTree(existingPlayerState)

This function lives in `src/data/skillTrees.js` and is called once at app startup (after redux-persist rehydration) to auto-unlock skill tree nodes for v11.0 players. It is NOT a migration — it reads live state and dispatches unlocks.

```javascript
// Source: design based on skillTreeSlice.js + migrations.js patterns
export function initializeSkillTree(store) {
  const state = store.getState();
  const { skillTree, grammar, quests, vocabulary } = state;

  // Guard: already initialized for v12.0 (check a sentinel node)
  if (skillTree.unlockedNodes.grammar.length > 0) return;

  // Derive unlocks from existing progress
  const completedLessons = grammar?.completedLessons?.length ?? 0;
  const completedQuests = Object.values(quests?.quests ?? {})
    .filter(q => q.status === 'completed').length;
  const learnedWords = Object.keys(vocabulary?.fsrsCards ?? {}).length;

  // Dispatch synthetic XP to bootstrap each tree
  // based on existing mastery signals
  if (completedLessons > 0) {
    store.dispatch(addSkillXP({ treeId: 'grammar', amount: completedLessons * 40 }));
  }
  if (completedQuests > 0) {
    store.dispatch(addSkillXP({ treeId: 'culture', amount: completedQuests * 30 }));
  }
  if (learnedWords > 0) {
    store.dispatch(addSkillXP({ treeId: 'reading', amount: learnedWords * 5 }));
  }
}
```

**Idempotency guard:** Must check `unlockedNodes` before dispatching. The sentinel check (`if (skillTree.unlockedNodes.grammar.length > 0) return`) prevents double-initialization on the same save. For brand-new players, all arrays are empty and the function is a no-op (nothing to bootstrap).

**Call site:** In the React app root or in the `persist/REHYDRATE` listener after rehydration completes.

### Pattern 3: New Reward Types (skillTrees.js node data)

Current reward types in skillTrees.js: `badge`, `xp_bonus`, `unlock_content`, `title`.

Four new reward types to add to node definitions (SKILL-03):

| Reward type | What it does | Dispatcher |
|-------------|--------------|------------|
| `unlock_spell` | Grants a new spell root | `discoverRoot` from `magicSlice` |
| `unlock_dialogue` | Unlocks companion dialogue option | `recordDialogueLine` pattern OR `setFlag` in worldState |
| `unlock_zone` | Sets a zone access flag | `setFlag` from `worldStateSlice` |
| `unlock_npc_branch` | Sets a story flag enabling NPC branch | `setFlag` from `worldStateSlice` |

**Key insight:** `unlock_zone` and `unlock_npc_branch` both map to `worldStateSlice.setFlag`. The pattern from `factionGatedContent.js` and `ActionSetExecutor.js` is: set a flag, then content checks that flag via `context.storyFlags`. `unlock_dialogue` follows the same flag pattern.

The reward dispatch happens when `skillTreeSlice.unlockNode` succeeds — the middleware or the UI component needs to detect a newly unlocked node and dispatch the secondary reward action. The cleanest pattern: add a `skillTree/unlockNode` case to `learningProgressMiddleware` that reads the node's reward type and dispatches the reward action.

### Pattern 4: skill_tree_level condition in ActionSetExecutor

Add to `evaluateRequirement` switch in `src/game/systems/ActionSetExecutor.js`:

```javascript
case 'skill_tree_level': {
  // req = { type: 'skill_tree_level', treeId: 'grammar', minNodes: 3 }
  const unlockedCount = context.skillTreeUnlocked?.[req.treeId]?.length ?? 0;
  return unlockedCount >= (req.minNodes ?? 1);
}
```

Add `skillTreeUnlocked` to `buildActionContext()` in `src/game/systems/actionContext.js`:

```javascript
skillTreeUnlocked: state.skillTree?.unlockedNodes || {},
```

### Pattern 5: SkillTreeView XP Bar + Progressive Disclosure

Current `SkillTreeView.jsx` shows a raw XP number (`{currentXP}`) with no progress bar toward next node. Required changes (SKILL-04):

1. **XP progress bar per tree:** Calculate `xpTowardNextNode` by finding the cheapest available (unlockable) node's `xpCost`. Show `currentXP / xpCost` as a CSS width percentage.

2. **Next-node highlighting:** Add `'frontier'` as a new CSS class — nodes that are `'available'` (prereqs met, XP within 0-50 of cost) get a highlight ring.

3. **Locked nodes beyond frontier collapsed:** Nodes with `availability === 'locked'` AND whose immediate prerequisites are not themselves `'available'` should render in a collapsed/summarized state (show count, not full card). The current implementation shows ALL locked nodes at full detail.

The `selectNodeAvailability` selector already returns `'unlocked' | 'available' | 'locked'`. The planner only needs to add `'frontier'` UI logic — the data layer is complete.

**Lazy-load requirement (plan 57-03):** SkillTreeMenu already renders `SkillTreeView` eagerly. Wrap the import in `React.lazy` + `Suspense` to enable lazy-loading per the plan spec.

### Pattern 6: 30-Node Tree Expansion

Current node counts:
- reading: 12, writing: 12, listening: 10, speaking: 10, grammar: 10, culture: 10

Target: 30 nodes per tree.

Each tree needs ~18-20 new nodes at CEFR levels A1–C2 following the existing linear-branching structure. New nodes must:
- Have IDs following the pattern `{treeId}_{nn}` (e.g. `reading_13`)
- Include at least one node with each of the four new reward types across the 6 trees
- Have appropriate `cefrLevel`, `xpCost` (scale up from existing range 50–750), and `prerequisites`

Per SKILL-03, at least one node of each reward type must exist across the 6 trees:
- `unlock_spell`: at least 1 node (suggest grammar tree, grammar_11 or grammar_12)
- `unlock_dialogue`: at least 1 node (suggest speaking tree)
- `unlock_zone`: at least 1 node (suggest reading or culture tree)
- `unlock_npc_branch`: at least 1 node (suggest culture tree)

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| XP-to-next-node progress bar | Custom accumulator state | Compute from `currentXP` + cheapest available node's `xpCost` in the selector/component | Data already in Redux; derived value not stored state |
| Re-entrancy guard in learningProgressMiddleware | A module-level flag like achievementMiddleware | None needed | `addSkillXP` doesn't trigger any monitored actions |
| initializeSkillTree as a migration | Version 12 migration entry in migrations.js | A one-shot function called after REHYDRATE | Migrations run on ALL persist keys; init only needs root state |
| Separate "reward execution" system | New middleware or slice | `setFlag` (worldState) + `discoverRoot` (magic) called from unlockNode listener | Both dispatches are one-liners using existing slice actions |
| D3.js for tree visualization | Radial/force graph | CSS flexbox with existing vertical list | Already confirmed out-of-scope in REQUIREMENTS.md |

---

## Common Pitfalls

### Pitfall 1: Double-initialization of skill trees on hot reload
**What goes wrong:** `initializeSkillTree` dispatches XP every time the app mounts (dev hot reload), so XP balloons with each reload.
**Why it happens:** No idempotency guard or the guard checks a value that resets on each session.
**How to avoid:** Gate on `skillTree.unlockedNodes[primaryTree].length > 0` OR set a one-time flag in playerSlice (e.g. `skillTreeInitialized: true`).
**Warning signs:** XP values in the thousands after a few reloads.

### Pitfall 2: initializeSkillTree called before rehydration completes
**What goes wrong:** `store.getState()` returns initial (empty) state because redux-persist hasn't loaded from localStorage yet.
**Why it happens:** Called at module load time instead of after `REHYDRATE` action.
**How to avoid:** Call inside a `store.subscribe` listener that waits for `_persist.rehydrated === true`, or use the `onBeforeLift` prop of `PersistGate`.
**Warning signs:** All skill trees empty despite player having grammar lessons completed.

### Pitfall 3: Reward dispatch triggers re-entrant addSkillXP
**What goes wrong:** Dispatching `discoverRoot` or `setFlag` from inside `learningProgressMiddleware` cascades through other middleware unnecessarily.
**Why it happens:** Other middleware intercepts `magic/discoverRoot` or `worldState/setFlag`.
**How to avoid:** Check if any existing middleware monitors these action types before adding reward dispatch in learningProgressMiddleware. Currently `achievementMiddleware` does NOT monitor `magic/discoverRoot` or `worldState/setFlag` — safe to dispatch.

### Pitfall 4: unlockNode XP-deduction breaks initializeSkillTree bootstrap
**What goes wrong:** `unlockNode` deducts `node.xpCost` from `skillXP`. If `initializeSkillTree` awards exactly enough XP to unlock nodes AND `unlockNode` is also called, XP goes negative.
**Why it happens:** `initializeSkillTree` awards bulk XP. Separately, `unlockNode` calls deduct XP. If the init also dispatches `unlockNode`, the deduct fires.
**How to avoid:** `initializeSkillTree` should only dispatch `addSkillXP` — it should NOT dispatch `unlockNode` directly. Nodes auto-unlock when the player manually clicks them in SkillTreeView, or via a separate `forceUnlockNode` action that skips the XP guard.

**Alternative approach:** Add a `bulkUnlockNodes` action to `skillTreeSlice` that sets `unlockedNodes` directly without XP deduction — used exclusively by `initializeSkillTree`. This is cleaner than manipulating XP amounts to get the math right.

### Pitfall 5: 30-node expansion breaks existing selectNodeAvailability selector
**What goes wrong:** Nodes with multi-tree prerequisites (e.g. `reading_20` requires both `reading_19` and `grammar_05`) break the prereq check which only looks within one tree.
**Why it happens:** `selectNodeAvailability` checks `state.unlockedNodes[treeId].includes(prereqId)` — cross-tree prereq IDs won't be found.
**How to avoid:** Keep all prerequisites within the same tree. Cross-tree gates should use `ActionSetExecutor` conditions (`skill_tree_level`) rather than node prerequisites.
**Warning signs:** Nodes with cross-tree prereqs always appear `'locked'`.

### Pitfall 6: SkillTreeView renders 30 nodes — performance
**What goes wrong:** Rendering 30 detailed `<button>` nodes is noticeable on mobile (the target platform).
**Why it happens:** No virtualization in the current list rendering.
**How to avoid:** Implement the "collapsed frontier" pattern — show unlocked nodes (always), show the next 1-2 available nodes (highlighted), collapse all deeper locked nodes into a count label. This is the progressive disclosure requirement in SKILL-04.

---

## Code Examples

### Example 1: learningProgressMiddleware with XP routing
```javascript
// Source: src/store/middleware/learningProgressMiddleware.js (to be written)
import { addSkillXP } from '../slices/skillTreeSlice.js';

export const learningProgressMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  switch (action.type) {
    case 'grammar/completeLesson':
      store.dispatch(addSkillXP({ treeId: 'grammar', amount: 40 }));
      break;
    case 'quests/completeQuest':
      store.dispatch(addSkillXP({ treeId: 'culture', amount: 30 }));
      break;
    case 'achievements/recordPerfectQuiz':
      store.dispatch(addSkillXP({ treeId: 'reading', amount: 20 }));
      break;
    case 'achievements/incrementReviews':
      store.dispatch(addSkillXP({ treeId: 'reading', amount: 10 }));
      break;
    case 'alphabet/completeGroup':
      store.dispatch(addSkillXP({ treeId: 'writing', amount: 25 }));
      break;
    case 'poetry/endPoetryBattle':
      if (action.payload?.won) {
        store.dispatch(addSkillXP({ treeId: 'speaking', amount: 30 }));
        store.dispatch(addSkillXP({ treeId: 'culture', amount: 30 }));
      }
      break;
    default:
      break;
  }

  return result;
};
```

### Example 2: bulkUnlockNodes action in skillTreeSlice (for initializeSkillTree)
```javascript
// Source: skillTreeSlice.js pattern — new reducer to add
bulkUnlockNodes(state, action) {
  // payload: { treeId, nodeIds: string[] }
  // Bypasses XP cost — used exclusively by initializeSkillTree
  const { treeId, nodeIds } = action.payload;
  if (!Array.isArray(state.unlockedNodes[treeId])) {
    state.unlockedNodes[treeId] = [];
  }
  nodeIds.forEach((nodeId) => {
    if (!state.unlockedNodes[treeId].includes(nodeId)) {
      state.unlockedNodes[treeId].push(nodeId);
    }
  });
},
```

### Example 3: skill_tree_level condition in ActionSetExecutor
```javascript
// Source: src/game/systems/ActionSetExecutor.js — new case in evaluateRequirement
case 'skill_tree_level': {
  // req = { type: 'skill_tree_level', treeId: 'grammar', minNodes: 3 }
  const unlockedCount = context.skillTreeUnlocked?.[req.treeId]?.length ?? 0;
  return unlockedCount >= (req.minNodes ?? 1);
}
```

### Example 4: New reward type nodes in skillTrees.js
```javascript
// unlock_spell — grammar tree
{
  id: 'grammar_11',
  name: 'Root Magic Unlock',
  nameArabic: 'فتح سحر الجذر',
  description: 'Master verb Form II — تفعيل patterns. Unlocks the Arabic root-magic spell كَتَبَ.',
  prerequisites: ['grammar_10'],
  cefrLevel: 'C2',
  xpCost: 800,
  rewards: { type: 'unlock_spell', value: 'ك-ت-ب' }, // rootId for magicSlice.discoverRoot
},

// unlock_zone — culture tree
{
  id: 'culture_11',
  name: 'Ancient Quarter Access',
  nameArabic: 'دخول الحي القديم',
  description: 'Understanding of Islamic history deep enough to enter the Ancient Quarter.',
  prerequisites: ['culture_10'],
  cefrLevel: 'C2',
  xpCost: 800,
  rewards: { type: 'unlock_zone', value: 'ancient_quarter' }, // worldState flag key
},

// unlock_dialogue — speaking tree
{
  id: 'speaking_11',
  name: 'Merchant Negotiation',
  nameArabic: 'محادثة التاجر',
  description: 'Unlock a secret negotiation dialogue with the Elder Merchant.',
  prerequisites: ['speaking_10'],
  cefrLevel: 'C2',
  xpCost: 800,
  rewards: { type: 'unlock_dialogue', value: 'merchant_elder_negotiation' }, // flag key
},

// unlock_npc_branch — reading tree
{
  id: 'reading_13',
  name: 'Scholar\'s Hidden Archive',
  nameArabic: 'أرشيف العالم المخفي',
  description: 'Read between the lines of the Scholar\'s words — unlock their hidden branch.',
  prerequisites: ['reading_12'],
  cefrLevel: 'C2',
  xpCost: 800,
  rewards: { type: 'unlock_npc_branch', value: 'scholar_archive_branch' }, // flag key
},
```

### Example 5: XP progress bar in SkillTreeView (progressive disclosure)
```javascript
// Source: SkillTreeView.jsx — replace raw XP display
// Find cheapest node the player can work toward
const nextUnlockableNode = tree.nodes
  .filter(n => availability[n.id] !== 'unlocked')
  .sort((a, b) => a.xpCost - b.xpCost)[0];

const xpProgress = nextUnlockableNode
  ? Math.min(100, Math.round((currentXP / nextUnlockableNode.xpCost) * 100))
  : 100;

// In JSX:
<div className={styles.xpBarTrack}>
  <div
    className={styles.xpBarFill}
    style={{ width: `${xpProgress}%`, background: tree.color }}
  />
</div>
<span className={styles.xpText}>
  {currentXP} / {nextUnlockableNode?.xpCost ?? '—'} XP
</span>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Reward type `unlock_content` (generic) | Four typed rewards: `unlock_spell`, `unlock_dialogue`, `unlock_zone`, `unlock_npc_branch` | Phase 57 | Enables targeted Redux dispatch per reward type |
| 10-12 nodes per tree | 30 nodes per tree | Phase 57 | Full CEFR A1-C2 coverage per skill |
| learningProgressMiddleware passthrough | XP routing for 6 event types | Phase 57 | SKILL-01 fulfilled |
| No retroactive init | initializeSkillTree bootstraps v11 saves | Phase 57 | SKILL-02 fulfilled |
| Progressive disclosure missing | Frontier nodes highlighted, deep locked collapsed | Phase 57 | SKILL-04 fulfilled |

---

## Validation Architecture

The following defines exactly how each success criterion is verified. Planner must include these as verification steps in plan tasks.

### Success Criterion 1: XP routing — "completing an activity awards XP to the appropriate tree"

**Verification command:**
```bash
npx vitest run src/store/middleware/__tests__/learningProgressMiddleware.test.js
```

**Test patterns:**
```javascript
describe('learningProgressMiddleware XP routing', () => {
  let store;
  beforeEach(() => {
    store = configureStore({
      reducer: {
        skillTree: skillTreeReducer,
        grammar: grammarReducer,
        quests: questReducer,
        achievements: achievementReducer,
        alphabet: alphabetReducer,
        poetry: poetryReducer,
      },
      middleware: (m) => m().concat(learningProgressMiddleware),
    });
  });

  it('grammar/completeLesson awards 40 XP to grammar tree', () => {
    store.dispatch(completeLesson('al-definite'));
    expect(store.getState().skillTree.skillXP.grammar).toBe(40);
  });

  it('quests/completeQuest awards 30 XP to culture tree', () => {
    store.dispatch(completeQuest('quest_oasis_welcome'));
    expect(store.getState().skillTree.skillXP.culture).toBe(30);
  });

  it('achievements/recordPerfectQuiz awards 20 XP to reading tree', () => {
    store.dispatch(recordPerfectQuiz());
    expect(store.getState().skillTree.skillXP.reading).toBe(20);
  });

  it('achievements/incrementReviews awards 10 XP to reading tree', () => {
    store.dispatch(incrementReviews());
    expect(store.getState().skillTree.skillXP.reading).toBe(10);
  });

  it('alphabet/completeGroup awards 25 XP to writing tree', () => {
    store.dispatch(completeGroup('hamza'));
    expect(store.getState().skillTree.skillXP.writing).toBe(25);
  });

  it('poetry/endPoetryBattle (won) awards 30 XP each to speaking and culture', () => {
    store.dispatch(endPoetryBattle({ won: true, playerScore: 3, npcScore: 1 }));
    expect(store.getState().skillTree.skillXP.speaking).toBe(30);
    expect(store.getState().skillTree.skillXP.culture).toBe(30);
  });

  it('poetry/endPoetryBattle (lost) awards no XP', () => {
    store.dispatch(endPoetryBattle({ won: false, playerScore: 1, npcScore: 3 }));
    expect(store.getState().skillTree.skillXP.speaking).toBe(0);
  });
});
```

### Success Criterion 2: Save migration — "v11.0 save sees skill trees populated"

**Verification command:**
```bash
npx vitest run src/data/__tests__/initializeSkillTree.test.js
```

**Test patterns:**
```javascript
describe('initializeSkillTree', () => {
  it('does not dispatch when no prior progress', () => {
    // Empty state — all counters 0
    // XP stays at 0 across all trees
  });

  it('awards grammar XP proportional to completedLessons', () => {
    // State with grammar.completedLessons = ['al-definite', 'personal-pronouns']
    // Expects grammar XP = 2 * 40 = 80
  });

  it('is idempotent — calling twice does not double XP', () => {
    // First call: grammar XP = 80
    // Second call: grammar XP still 80 (guard prevents re-init)
  });

  it('does not overwrite existing skill tree progress', () => {
    // State with skillTree.unlockedNodes.grammar = ['grammar_01']
    // Function returns early — no new XP dispatched
  });
});
```

### Success Criterion 3: Reward types — "unlocking a node reveals spell/dialogue/zone/NPC branch"

**Verification command:**
```bash
npx vitest run src/data/__tests__/skillTreeRewards.test.js
```

**Test patterns:**
```javascript
describe('skill tree reward types', () => {
  it('at least one unlock_spell node exists across 6 trees', () => {
    const allNodes = Object.values(SKILL_TREES).flatMap(t => t.nodes);
    expect(allNodes.some(n => n.rewards?.type === 'unlock_spell')).toBe(true);
  });

  it('at least one unlock_dialogue node exists', () => {
    const allNodes = Object.values(SKILL_TREES).flatMap(t => t.nodes);
    expect(allNodes.some(n => n.rewards?.type === 'unlock_dialogue')).toBe(true);
  });

  it('at least one unlock_zone node exists', () => {
    const allNodes = Object.values(SKILL_TREES).flatMap(t => t.nodes);
    expect(allNodes.some(n => n.rewards?.type === 'unlock_zone')).toBe(true);
  });

  it('at least one unlock_npc_branch node exists', () => {
    const allNodes = Object.values(SKILL_TREES).flatMap(t => t.nodes);
    expect(allNodes.some(n => n.rewards?.type === 'unlock_npc_branch')).toBe(true);
  });
});

describe('ActionSetExecutor skill_tree_level condition', () => {
  it('matches when unlocked count meets minNodes', () => {
    const context = { skillTreeUnlocked: { grammar: ['grammar_01', 'grammar_02', 'grammar_03'] } };
    const req = { type: 'skill_tree_level', treeId: 'grammar', minNodes: 3 };
    expect(evaluateRequirement(req, context)).toBe(true);
  });

  it('does not match when count is below minNodes', () => {
    const context = { skillTreeUnlocked: { grammar: ['grammar_01'] } };
    const req = { type: 'skill_tree_level', treeId: 'grammar', minNodes: 3 };
    expect(evaluateRequirement(req, context)).toBe(false);
  });
});
```

### Success Criterion 4: SkillTreeView UI — "XP bars and next-node highlights visible"

**Verification approach:** No DOM tests — verify by inspection checklist:

1. `npx vitest run` — all tests pass
2. Open SkillTreeView in browser (`npm run dev`)
3. Dispatch `addSkillXP({ treeId: 'grammar', amount: 40 })` in Redux DevTools
4. Confirm: XP progress bar in Grammar tab advances
5. Dispatch `completeLesson('al-definite')` via Redux DevTools
6. Confirm: grammar XP increases, next unlockable node is highlighted with frontier styling
7. Confirm: deeply locked nodes (2+ steps away) show collapsed summary ("8 more nodes locked"), not full cards

**Code-level check:** Verify `selectNodeAvailability` is called and the return value drives rendering:
```bash
grep -n "frontier\|nextNode\|progressBar\|xpProgress" src/components/Skills/SkillTreeView.jsx
```
This grep must return lines for the new frontier class and XP bar implementation.

### Full Test Suite Pass

After each plan task, run:
```bash
npx vitest run
```

The project has 1166+ tests as of Phase 56. All must continue passing. The learningProgressMiddleware test file already exists with 2 scaffold tests — Phase 57 should expand it.

---

## Open Questions

1. **What XP amounts produce meaningful progression within a session?**
   - What we know: current XP amounts in skillTrees.js range 50–750 per node; players complete ~5-10 grammar lessons per session
   - What's unclear: will 40 XP/lesson feel adequate for unlocking the first grammar node (xpCost: 75)?
   - Recommendation: The first node in each tree should require ≤ 3 typical events to unlock (e.g. 3 grammar lessons = 120 XP, first node costs 75 XP). Adjust XP amounts accordingly.

2. **Where exactly is initializeSkillTree called?**
   - What we know: Must run after redux-persist rehydration completes; `PersistGate` is the standard place
   - What's unclear: The main App.jsx / PersistGate setup is not inspected — need to verify `onBeforeLift` is available
   - Recommendation: Check `src/App.jsx` for `PersistGate` usage; if present, pass `initializeSkillTree` to `onBeforeLift`

3. **Does poetry/endPoetryBattle payload always include won: boolean?**
   - What we know: poetrySlice.js line 86-98: `endPoetryBattle` pushes `{ poemId, poetId, playerScore, npcScore, won, completedAt }`; `action.payload` is the same object
   - What's unclear: nothing — `won` is always in payload
   - Recommendation: Use `action.payload?.won` safely

---

## Sources

### Primary (HIGH confidence)
- `src/data/skillTrees.js` — Complete tree definitions, node structure, existing reward types
- `src/store/slices/skillTreeSlice.js` — addSkillXP, unlockNode, selectNodeAvailability shape
- `src/store/middleware/learningProgressMiddleware.js` — Scaffold ready for population
- `src/store/middleware/achievementMiddleware.js` — ACTION_TO_ACHIEVEMENT_TYPES mapping (shows which Redux action strings to intercept)
- `src/store/store.js` — Middleware chain order, skillTree in whitelist, CURRENT_VERSION=11
- `src/services/storage/migrations.js` — Migration 11 (Phase 56 baseline confirmed)
- `src/game/systems/ActionSetExecutor.js` — Existing requirement types, how to add skill_tree_level
- `src/game/systems/actionContext.js` — buildActionContext shows where skillTreeUnlocked must be added
- `src/components/Skills/SkillTreeView.jsx` — Current XP display (raw number, no bar)
- `src/components/Skills/SkillTreeMenu.jsx` — Tab-based tree navigation, TreeTab progress bar already present
- `src/hooks/useQuiz.js` — incrementReviews dispatch (line 246)
- `src/store/slices/poetrySlice.js` — endPoetryBattle payload shape
- `.planning/phases/56-bug-fixes-redux-foundation/56-02-SUMMARY.md` — Confirms learningProgressMiddleware is last in middleware chain

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all files read directly from project
- Architecture patterns: HIGH — based on actual code, not assumptions
- Pitfalls: HIGH — derived from actual patterns in migrations.js, achievementMiddleware.js, and skillTreeSlice.js
- XP amounts: MEDIUM — chosen to satisfy "earnable within minutes" but not empirically tested

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (stable domain — no external dependencies)
