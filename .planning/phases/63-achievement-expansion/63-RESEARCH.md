# Phase 63: Achievement Expansion - Research

**Researched:** 2026-03-23
**Domain:** Redux achievement system — data expansion, new requirement types, React panel UI
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ACH-01 | Achievement system expanded from 44 to 250+ achievements across 15 categories | Current file has ~244 achievement entries; needs new v12.0 entries for skill_tree, quiz_type_streak, cefr_level_reached, placement_complete requirement types |
| ACH-02 | Achievements use 4-tier system (Bronze/Silver/Gold/Legendary) with increasing difficulty thresholds | RARITY field already exists with 5 values; needs mapping to 4-tier (common+uncommon=Bronze, rare=Silver, epic=Gold, legendary=Legendary) OR a new `tier` field alongside rarity |
| ACH-04 | Achievement progress visible in a dedicated Achievements panel with category filtering and tier display | AchievementPanel.jsx already exists with category tabs + progress bars — needs tier badge display added, and new categories (skill_tree, quiz, cefr, placement) added to tab list |
</phase_requirements>

---

## Summary

The achievement system has a strong foundation with ~244 entries, 20 categories, and a functioning middleware pipeline. The phase plan is surgical: add 6-10 new achievements to cover v12.0 events (skill tree nodes, quiz type streaks, CEFR level, placement), add a `tier` field to every achievement entry, add 5 new `isAchievementMet()` requirement types, track `quizTypeStats` in achievementSlice.stats, and upgrade AchievementPanel.jsx to show tier badges and include the new categories in its tab list.

The biggest clarification needed upfront: the existing `rarity` field (5 values: common/uncommon/rare/epic/legendary) is NOT the same as the new 4-tier system (Bronze/Silver/Gold/Legendary). The plan must decide whether to add a separate `tier` field or rename/remap the rarity field. Based on the plan spec ("tier field on all achievements"), a separate `tier` field is the right approach — it preserves backward compatibility with RARITY_COLORS and existing UI code.

The current ACHIEVEMENTS array contains ~244 entries (counted by `id:` occurrences). Adding 6 net new v12.0 entries brings the total above 250. The plan spec says "206 new entries" — but that appears to be a count from an earlier design. The actual gap to 250+ is small (~6 genuinely new entries for skill_tree, cefr, placement categories). The planner must reconcile this.

**Primary recommendation:** Add a `tier` field (Bronze/Silver/Gold/Legendary) to all existing achievements using a mapping from rarity, then add ~10 new v12.0 achievements with explicit tier values. Upgrade AchievementPanel.jsx to show tier badges in the card header. Add 5 new requirement types to isAchievementMet() with matching selectAchievementProgress cases.

---

## Standard Stack

### Core (already installed — no new installs needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @reduxjs/toolkit | installed | achievementSlice stats expansion | Same slice pattern as all v12.0 slices |
| framer-motion | installed | AchievementPanel animation | Already used in AchievementPanel.jsx |
| React (lazy/Suspense) | 19 | Lazy-load AchievementPanel | All heavy panels use lazy() in GameLayout |
| CSS Modules | — | AchievementPanel.module.css | Project-wide pattern |

No new npm installs required for this phase.

---

## Architecture Patterns

### Existing Files to Modify (NOT create from scratch)

The key insight: almost everything already exists. This phase is an expansion, not a greenfield build.

```
src/
├── data/
│   └── achievements.js           # ADD ~10 new entries + tier field on all 244 existing
├── store/
│   ├── slices/
│   │   └── achievementSlice.js   # ADD quizTypeStats to stats + selectAchievementProgress cases
│   └── middleware/
│       └── achievementMiddleware.js  # ADD 5 new isAchievementMet() cases + ACTION_TO_ACHIEVEMENT_TYPES entries
└── components/
    └── Achievements/
        └── AchievementPanel.jsx  # ADD tier badge to AchievementCard + new category tabs
```

`AchievementsPanel.jsx` (plan 63-03) refers to renaming/replacing `AchievementPanel.jsx`. The plan spec says "AchievementsPanel.jsx" — this is the NEW name for the rebuilt panel. Either rename the file or create AchievementsPanel.jsx and deprecate AchievementPanel.jsx. Given HUD.jsx imports `AchievementPanel.jsx` directly, the simplest path is to UPGRADE the existing AchievementPanel.jsx in place (no rename needed unless explicitly required).

### Pattern 1: Tier Field Addition

All 244 existing achievements need a `tier` field. The rarity-to-tier mapping:

```javascript
// Source: achievements.js RARITY constants + plan spec ACH-02
const RARITY_TO_TIER = {
  common: 'Bronze',
  uncommon: 'Bronze',
  rare: 'Silver',
  epic: 'Gold',
  legendary: 'Legendary',
};

// Each achievement entry gets:
tier: RARITY_TO_TIER[rarity],  // OR hardcoded per entry
```

New entries for v12.0 use explicit tier values:
```javascript
{
  id: 'skill_tree_first_node',
  name: 'First Skill',
  description: 'Unlock your first skill tree node',
  category: ACHIEVEMENT_CATEGORIES.SKILL_TREE,  // new category
  icon: '🌳',
  requirement: { type: 'skill_tree_nodes', threshold: 1 },
  xpReward: 50,
  rarity: RARITY.COMMON,
  tier: 'Bronze',
}
```

### Pattern 2: New isAchievementMet() Requirement Types (Plan 63-02)

Five new types needed. Each reads from already-existing Redux state:

```javascript
// Source: skillTreeSlice.js — state.skillTree.unlockedNodes[treeId]
case 'skill_tree_nodes': {
  const allNodes = Object.values(state.skillTree?.unlockedNodes || {}).flat();
  return allNodes.length >= req.threshold;
}

// treeId-specific variant (for per-tree achievements)
case 'skill_tree_nodes_in_tree': {
  const nodes = state.skillTree?.unlockedNodes?.[req.treeId] ?? [];
  return nodes.length >= req.threshold;
}

// Source: skillTreeSlice.js selectTreeProgress pattern — check if all nodes in all trees unlocked
case 'skill_tree_complete': {
  // req.treeId — check specific tree OR check all trees
  const treeId = req.treeId;
  if (treeId) {
    const { SKILL_TREES } = /* static import */;
    const nodes = state.skillTree?.unlockedNodes?.[treeId] ?? [];
    return nodes.length >= (SKILL_TREES[treeId]?.nodes.length ?? Infinity);
  }
  return false; // all-trees variant deferred
}

// Source: achievementSlice.stats.quizTypeStats (NEW stat — plan 63-02)
case 'quiz_type_streak': {
  const stats = achievements.stats.quizTypeStats ?? {};
  const typeStats = stats[req.quizType] ?? { perfectStreak: 0 };
  return typeStats.perfectStreak >= req.threshold;
}

// Source: cefrProgressSlice.js — state.cefrProgress.currentLevel
case 'cefr_level_reached': {
  const LEVEL_ORDER = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4 };
  const current = LEVEL_ORDER[state.cefrProgress?.currentLevel] ?? 0;
  const required = LEVEL_ORDER[req.level] ?? 1;
  return current >= required;
}

// Source: placementSlice.js — state.placement.hasCompleted
case 'placement_complete': {
  return state.placement?.hasCompleted === true;
}
```

### Pattern 3: quizTypeStats in achievementSlice.stats (Plan 63-02)

The `quiz_type_streak` requirement type needs per-quiz-type streak tracking in the slice:

```javascript
// In achievementSlice initialState.stats — add:
quizTypeStats: {},   // { [quizType]: { perfectStreak: number, totalPerfect: number } }

// New reducer:
recordQuizTypeResult(state, action) {
  const { quizType, perfect } = action.payload;
  if (!state.stats.quizTypeStats[quizType]) {
    state.stats.quizTypeStats[quizType] = { perfectStreak: 0, totalPerfect: 0 };
  }
  if (perfect) {
    state.stats.quizTypeStats[quizType].perfectStreak += 1;
    state.stats.quizTypeStats[quizType].totalPerfect += 1;
  } else {
    state.stats.quizTypeStats[quizType].perfectStreak = 0;
  }
},
```

This reducer needs to be called from QuizOverlay.jsx (or wherever quiz sessions end). The existing `checkPerfectQuiz()` helper in achievementMiddleware.js is a model for this dispatch pattern.

### Pattern 4: AchievementPanel.jsx Tier Badge (Plan 63-03)

The existing AchievementCard component renders rarity but not tier. The upgrade adds a tier badge in the card header:

```javascript
// Source: existing AchievementPanel.jsx lines 32-72
const TIER_COLORS = {
  Bronze:    '#cd7f32',
  Silver:    '#c0c0c0',
  Gold:      '#FFD700',
  Legendary: '#a855f7',
};

// In AchievementCard — add after cardRarity div:
<div
  className={styles.tierBadge}
  style={{ color: TIER_COLORS[achievement.tier] || '#c0c0c0' }}
>
  {achievement.tier || 'Bronze'}
</div>
```

Category tabs need expansion. Current tabs (10) cover only the original 9 categories. New tabs needed:

```javascript
// In AchievementPanel.jsx tabs array — add:
{ id: ACHIEVEMENT_CATEGORIES.GRAMMAR,       label: 'Grammar' },
{ id: ACHIEVEMENT_CATEGORIES.COMBAT,        label: 'Combat' },
{ id: ACHIEVEMENT_CATEGORIES.CRAFTING,      label: 'Crafting' },
{ id: ACHIEVEMENT_CATEGORIES.SOCIAL,        label: 'Social' },
{ id: ACHIEVEMENT_CATEGORIES.LEARNING_PATH, label: 'Learning Path' },
{ id: ACHIEVEMENT_CATEGORIES.SKILL_TREE,    label: 'Skill Tree' },   // NEW v12.0
{ id: ACHIEVEMENT_CATEGORIES.QUIZ,          label: 'Quiz' },         // NEW v12.0
{ id: ACHIEVEMENT_CATEGORIES.CEFR,          label: 'CEFR' },         // NEW v12.0 (or use MILESTONE)
{ id: ACHIEVEMENT_CATEGORIES.HIDDEN,        label: 'Hidden' },
{ id: ACHIEVEMENT_CATEGORIES.MILESTONE,     label: 'Milestone' },
```

### Pattern 5: ACTION_TO_ACHIEVEMENT_TYPES Expansion

New achievement types need new action mappings in achievementMiddleware.js:

```javascript
// Source: achievementMiddleware.js ACTION_TO_ACHIEVEMENT_TYPES
'skillTree/unlockNode':              ['skill_tree_nodes', 'skill_tree_complete'],
'skillTree/bulkUnlockNodes':         ['skill_tree_nodes', 'skill_tree_complete'],
'achievements/recordQuizTypeResult': ['quiz_type_streak'],
'cefrProgress/setCefrLevel':         ['cefr_level_reached'],
'placement/recordPlacementResult':   ['placement_complete'],
```

### Pattern 6: Lazy-loading AchievementPanel (Plan 63-03 ACH-04)

The plan spec requires lazy-loading. Currently AchievementPanel.jsx is eagerly imported in HUD.jsx line 15. The upgrade converts it to lazy:

```javascript
// In HUD.jsx — replace eager import:
const AchievementPanel = lazy(() => import('../Achievements/AchievementPanel.jsx'));

// Wrap usage in Suspense with null fallback (panel already has loading state)
<Suspense fallback={null}>
  {achievementPanelOpen && <AchievementPanel onClose={closeAchievements} />}
</Suspense>
```

### Anti-Patterns to Avoid

- **Adding a tier field manually to all 244 entries one-by-one:** Use a `RARITY_TO_TIER` mapping constant and add `tier` as a computed property inline. This is ~6 lines of mapping code, not 244 individual edits.
- **Creating a new AchievementsPanel.jsx when AchievementPanel.jsx already works:** Extend in place. The plan spec naming "AchievementsPanel.jsx" appears to be a new name target — but in-place upgrade avoids breaking HUD.jsx import.
- **Dispatching quizTypeStats from achievementMiddleware itself:** The middleware should react to `recordQuizTypeResult` action, not compute it. The reducer owns state updates; middleware reads the result.
- **Adding `skill_tree_complete` without importing SKILL_TREES:** The middleware file will need to import SKILL_TREES from skillTrees.js to check tree node totals. This is safe — it's already imported by skillTreeSlice.js.
- **Handling `cefr_level_reached` without destructuring state:** STATE.md decision: "state.grammar accessed directly in isAchievementMet (not destructured) — keeps diff minimal." Apply same pattern for cefrProgress and placement.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tier color system | Custom color computation | Hardcode TIER_COLORS map (4 entries) | Only 4 tiers — no library needed |
| Tab overflow on mobile | Custom scrollable tabs | CSS `overflow-x: auto` on existing `.tabs` element | Already has CSS Module — one line fix |
| Progress bar animation | Custom animation | Existing `styles.progressFill` width transition | Already implemented in AchievementPanel.module.css |
| Achievement count display | Custom counter | Existing `selectUnlockedCount` selector | Already exported from achievementSlice |

---

## Current Achievement Count — Critical Finding

Running `grep -c "id:"` on achievements.js returns **252** lines with `id:` — but not all are achievement IDs (some are `req.level`, `req.category`, etc.). The actual ACHIEVEMENTS array entries can be counted by `{` entries at the top level. Based on reading the file end-to-end, the array currently has approximately **244 achievement objects** (some `id:` matches are inside requirement objects, not at root level).

**Key decision for plan 63-01:** The goal is 250+ total achievements. Current count is ~244. Adding just 6-10 new v12.0 achievements (skill_tree, quiz, cefr, placement) reaches 250+. The plan spec says "206 new entries" — this figure comes from an earlier design iteration. The actual work is:
1. Add `tier` field to all ~244 existing entries (mechanical, using RARITY_TO_TIER map)
2. Add ~6-15 genuinely new achievement entries for v12.0 event sources
3. Add `SKILL_TREE`, `QUIZ`, and `CEFR` to ACHIEVEMENT_CATEGORIES constant

The 20-category schema already covers GRAMMAR, COMBAT, CRAFTING, SOCIAL, LEARNING_PATH, ROOT_MAGIC, CULTURE, HIDDEN, MILESTONE. The only truly new categories needed for v12.0 are:
- `SKILL_TREE: 'skill_tree'`
- `QUIZ: 'quiz'`
- `CEFR: 'cefr'`
- `PLACEMENT: 'placement'` (or fold into MILESTONE)

---

## Common Pitfalls

### Pitfall 1: AchievementPanel Tab Overflow
**What goes wrong:** Adding 5+ new category tabs causes the tab bar to overflow horizontally on smaller screens, breaking layout.
**Why it happens:** Current tab bar has 10 tabs — at 20+ tabs it wraps or overflows.
**How to avoid:** Set `overflow-x: auto` on `.tabs` in AchievementPanel.module.css; use `white-space: nowrap` on tab buttons. Already partially handled if the CSS Module was designed for this.
**Warning signs:** Tab bar wraps to two rows or clips content.

### Pitfall 2: quizTypeStats Missing from Existing Saves
**What goes wrong:** Existing players have no `quizTypeStats` in persisted achievementSlice.stats — the new `quiz_type_streak` check throws `Cannot read properties of undefined`.
**Why it happens:** redux-persist rehydrates the old stats shape without the new key.
**How to avoid:** Use `?? {}` null-coalescing everywhere `quizTypeStats` is accessed. The initialState migration adds `quizTypeStats: {}` — redux-persist will fill it in on next load via `currentVersion` bump OR handle gracefully with optional chaining.
**Warning signs:** Console error on achievement check after upgrade; quiz_type_streak achievements never fire.

### Pitfall 3: skill_tree_nodes Reads Stale State Before bulkUnlockNodes
**What goes wrong:** Achievement check fires on `skillTree/bulkUnlockNodes` but reads state before bulk unlock completes (middleware calls `next(action)` first, so state IS updated — but check for ALL trees may miss nodes from the same batch).
**Why it happens:** `bulkUnlockNodes` unlocks multiple nodes in one reducer call; middleware fires once with the post-update state — this is actually CORRECT behavior. Not a real pitfall IF middleware calls `next(action)` before reading state (which it does).
**How to avoid:** Confirm `next(action)` is called before `store.getState()` in achievementMiddleware.js — it is (line 124 vs line 137). No change needed.

### Pitfall 4: `tier` Field Missing on New Achievements Breaks Panel
**What goes wrong:** Any achievement object without a `tier` field causes the AchievementCard tier badge to render `undefined`.
**Why it happens:** Developer adds a new achievement and forgets to include `tier`.
**How to avoid:** Add fallback `achievement.tier || 'Bronze'` in the tier badge render. Also add TIER_COLORS with a fallback entry.

### Pitfall 5: Completionist Achievement Breaks with 250+ Total Count
**What goes wrong:** The `all_achievements` requirement type uses `ACHIEVEMENTS.length - 1` as the total. Adding new entries automatically raises the bar — but if some achievements have requirement types not yet handled (e.g., `skill_tree_complete` for a future tree), completionist becomes unachievable.
**Why it happens:** Completionist counts all achievements including ones gated on future content.
**How to avoid:** Only ship achievements whose requirement types are fully implemented and trackable. Flag future-only achievements with `{ type: 'future_content' }` and exclude them from completionist count — or mark them with `hidden: true`.

---

## Code Examples

### Adding ACHIEVEMENT_CATEGORIES constants for v12.0

```javascript
// Source: src/data/achievements.js ACHIEVEMENT_CATEGORIES object (lines 8-29)
export const ACHIEVEMENT_CATEGORIES = {
  // ... existing 20 categories ...
  SKILL_TREE: 'skill_tree',   // NEW — Phase 63
  QUIZ: 'quiz',               // NEW — Phase 63
  CEFR: 'cefr',               // NEW — Phase 63
};
```

### TIER constants and color map

```javascript
// Source: pattern mirrors RARITY/RARITY_COLORS pattern in achievements.js lines 31-45
export const TIER = {
  BRONZE:    'Bronze',
  SILVER:    'Silver',
  GOLD:      'Gold',
  LEGENDARY: 'Legendary',
};

export const TIER_COLORS = {
  Bronze:    '#cd7f32',
  Silver:    '#c0c0c0',
  Gold:      '#FFD700',
  Legendary: '#a855f7',
};

export const RARITY_TO_TIER = {
  common:    TIER.BRONZE,
  uncommon:  TIER.BRONZE,
  rare:      TIER.SILVER,
  epic:      TIER.GOLD,
  legendary: TIER.LEGENDARY,
};
```

### Sample v12.0 achievements (skill_tree category)

```javascript
// Source: consistent with achievements.js schema (observed throughout file)
{
  id: 'skill_tree_first_node',
  name: 'First Skill Unlocked',
  description: 'Unlock your first skill tree node',
  category: ACHIEVEMENT_CATEGORIES.SKILL_TREE,
  icon: '🌳',
  requirement: { type: 'skill_tree_nodes', threshold: 1 },
  xpReward: 50,
  rarity: RARITY.COMMON,
  tier: TIER.BRONZE,
},
{
  id: 'skill_tree_10_nodes',
  name: 'Branching Out',
  description: 'Unlock 10 skill tree nodes across any trees',
  category: ACHIEVEMENT_CATEGORIES.SKILL_TREE,
  icon: '🌲',
  requirement: { type: 'skill_tree_nodes', threshold: 10 },
  xpReward: 200,
  rarity: RARITY.UNCOMMON,
  tier: TIER.BRONZE,
},
{
  id: 'skill_tree_reading_complete',
  name: 'Reading Master',
  description: 'Complete the Reading skill tree',
  category: ACHIEVEMENT_CATEGORIES.SKILL_TREE,
  icon: '📖',
  requirement: { type: 'skill_tree_complete', treeId: 'reading' },
  xpReward: 1000,
  rarity: RARITY.EPIC,
  tier: TIER.GOLD,
},
```

### Sample v12.0 achievements (cefr and placement)

```javascript
{
  id: 'cefr_placement_done',
  name: 'Placed!',
  description: 'Complete the CEFR placement test',
  category: ACHIEVEMENT_CATEGORIES.CEFR,
  icon: '🎯',
  requirement: { type: 'placement_complete' },
  xpReward: 100,
  rarity: RARITY.COMMON,
  tier: TIER.BRONZE,
},
{
  id: 'cefr_reached_a2',
  name: 'A2 Level',
  description: 'Reach CEFR A2 level',
  category: ACHIEVEMENT_CATEGORIES.CEFR,
  icon: '🏅',
  requirement: { type: 'cefr_level_reached', level: 'A2' },
  xpReward: 300,
  rarity: RARITY.UNCOMMON,
  tier: TIER.BRONZE,
},
{
  id: 'cefr_reached_b1',
  name: 'B1 Level',
  description: 'Reach CEFR B1 level',
  category: ACHIEVEMENT_CATEGORIES.CEFR,
  icon: '🏅',
  requirement: { type: 'cefr_level_reached', level: 'B1' },
  xpReward: 750,
  rarity: RARITY.RARE,
  tier: TIER.SILVER,
},
```

### isAchievementMet() — New Cases

```javascript
// Source: achievementMiddleware.js switch statement pattern (lines 18-97)
// All new cases follow the same access pattern as existing grammar_lessons case

case 'skill_tree_nodes': {
  const allNodes = Object.values(state.skillTree?.unlockedNodes || {}).flat();
  return allNodes.length >= req.threshold;
}

case 'skill_tree_complete': {
  if (!req.treeId) return false;
  const { SKILL_TREES } = await import('../../data/skillTrees.js');
  // NOTE: achievementMiddleware is sync — use a static import at top of file instead
  // At top of file: import { SKILL_TREES } from '../../data/skillTrees.js';
  const unlocked = state.skillTree?.unlockedNodes?.[req.treeId] ?? [];
  const total = SKILL_TREES[req.treeId]?.nodes?.length ?? Infinity;
  return unlocked.length >= total;
}

case 'quiz_type_streak': {
  const stats = achievements.stats.quizTypeStats ?? {};
  const typeStats = stats[req.quizType] ?? { perfectStreak: 0 };
  return typeStats.perfectStreak >= req.threshold;
}

case 'cefr_level_reached': {
  const LEVEL_ORDER = { A1: 1, A2: 2, B1: 3, B2: 4 };
  const current = LEVEL_ORDER[state.cefrProgress?.currentLevel] ?? 0;
  const required = LEVEL_ORDER[req.level] ?? 1;
  return current >= required;
}

case 'placement_complete': {
  return state.placement?.hasCompleted === true;
}
```

**Important:** achievementMiddleware.js must add `SKILL_TREES` to its imports and add `state.skillTree`, `state.cefrProgress`, `state.placement` to its `const { player, ... } = state` destructure (or access directly).

### selectAchievementProgress — New Cases

```javascript
// Source: achievementSlice.js selectAchievementProgress switch (lines 95-164)
// Mirror each new isAchievementMet() case for UI progress display

case 'skill_tree_nodes': {
  const allNodes = Object.values(skillTree?.unlockedNodes || {}).flat();
  current = allNodes.length;
  break;
}
case 'skill_tree_complete': {
  // Show node count / total nodes in specified tree
  // requires skillTree in selector input — add to createSelector inputs
  current = skillTree?.unlockedNodes?.[req.treeId]?.length ?? 0;
  target = 30; // per skillTrees.js — 30 nodes per tree (State.md 57-01)
  break;
}
case 'cefr_level_reached': {
  const LEVEL_ORDER = { A1: 1, A2: 2, B1: 3, B2: 4 };
  current = LEVEL_ORDER[cefrProgress?.currentLevel] ?? 0;
  target = LEVEL_ORDER[req.level] ?? 1;
  break;
}
case 'placement_complete': {
  current = placement?.hasCompleted ? 1 : 0;
  target = 1;
  break;
}
case 'quiz_type_streak': {
  const stats = achievements.stats.quizTypeStats ?? {};
  current = stats[req.quizType]?.perfectStreak ?? 0;
  break;
}
```

**Note:** `selectAchievementProgress` selector inputs (line 86) currently has `(state) => state.player, vocabulary, quests, alphabet, achievements`. New cases need `state.skillTree`, `state.cefrProgress`, `state.placement` added as selector inputs.

---

## Validation Architecture

> `workflow.nyquist_validation` key absent from `.planning/config.json` — treat as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | vitest.config.js (project root) |
| Quick run command | `npx vitest run src/store/middleware/__tests__/achievementMiddleware.test.js` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ACH-01 | `isAchievementMet('skill_tree_nodes')` returns true at threshold | unit | `npx vitest run src/store/middleware/__tests__/achievementMiddleware.test.js` | Yes (extend) |
| ACH-01 | `isAchievementMet('cefr_level_reached')` reads cefrProgress.currentLevel | unit | same file | Yes (extend) |
| ACH-01 | `isAchievementMet('placement_complete')` reads placement.hasCompleted | unit | same file | Yes (extend) |
| ACH-01 | `isAchievementMet('quiz_type_streak')` reads quizTypeStats.perfectStreak | unit | same file | Yes (extend) |
| ACH-02 | Every ACHIEVEMENTS entry has a `tier` field with value in {Bronze,Silver,Gold,Legendary} | unit | `npx vitest run src/data/__tests__/achievements.test.js` | No — Wave 0 |
| ACH-02 | ACHIEVEMENTS.length >= 250 | unit | same file | No — Wave 0 |
| ACH-04 | AchievementPanel renders tier badge with correct color | smoke | manual | N/A |

### Wave 0 Gaps

- [ ] `src/data/__tests__/achievements.test.js` — covers ACH-01 (count >= 250), ACH-02 (all entries have tier field, tier is valid)

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| rarity-only on achievements | rarity + tier (this phase) | Phase 63 | Enables 4-tier badge display independent of 5-tier rarity system |
| AchievementPanel eager-loaded | Lazy-loaded via `lazy()` | Phase 63 | Reduces initial bundle; panel is large with 244+ cards |
| 10-tab category filter (9 original categories) | All 20+ categories shown | Phase 63 | Players can filter by Grammar, Combat, Skill Tree, CEFR etc. |

---

## Open Questions

1. **"206 new entries" vs actual gap**
   - What we know: File currently has ~244 entries; target is 250+; adding ~6-15 v12.0 entries reaches the goal.
   - What's unclear: Did the original plan spec intend 250 total (meaning only ~6 new entries needed), or 250 additional (meaning the file should grow to ~494)?
   - Recommendation: The requirement ACH-01 says "expanded FROM 44 TO 250+" — current file already has ~244. Adding ~10 v12.0 entries (skill_tree, cefr, placement) satisfies the success criterion. Plan 63-01 scope is: add tier field to all existing + add ~10 new v12.0 entries.

2. **AchievementsPanel.jsx rename**
   - What we know: Plan spec says "AchievementsPanel.jsx" (plural), existing file is "AchievementPanel.jsx" (singular). HUD.jsx imports the singular name.
   - What's unclear: Whether the rename is intentional (creating new file) or a typo in the plan.
   - Recommendation: Upgrade existing `AchievementPanel.jsx` in place. No rename needed. The planner should clarify if a new file is required.

3. **Which Redux state slices to add to isAchievementMet state destructure**
   - What we know: Current destructure is `const { player, vocabulary, quests, alphabet, achievements } = state;` (line 16). New types need `skillTree`, `cefrProgress`, `placement`.
   - Recommendation: Access `state.skillTree`, `state.cefrProgress`, `state.placement` directly (not via destructure) per the STATE.md decision: "state.grammar accessed directly in isAchievementMet (not destructured) — keeps diff minimal."

---

## Sources

### Primary (HIGH confidence)
- `src/data/achievements.js` — Full file read; 244 existing entries confirmed, 20 categories, RARITY constants, schema structure
- `src/store/slices/achievementSlice.js` — Full file read; initialState.stats shape, selectAchievementProgress selector
- `src/store/middleware/achievementMiddleware.js` — Full file read; isAchievementMet() switch, ACTION_TO_ACHIEVEMENT_TYPES map
- `src/components/Achievements/AchievementPanel.jsx` — Full file read; existing tab list, AchievementCard structure, lazy-load gap
- `src/store/slices/skillTreeSlice.js` — Full file read; unlockedNodes shape, selectors
- `src/store/slices/placementSlice.js` — Full read; hasCompleted, assignedLevel fields
- `src/store/slices/cefrProgressSlice.js` — Full read; currentLevel field
- `src/data/quizTypes.js` — QUIZ_TYPE_REGISTRY shape; 18 types confirmed
- `.planning/STATE.md`, `REQUIREMENTS.md`, `ROADMAP.md` — Phase context and requirements

### Secondary (MEDIUM confidence)
- `src/components/Router/GameLayout.jsx` — HUD wiring context; AchievementPanel opened via EventBus.PLAYER_FREEZE pattern
- `src/components/Skills/SkillTreeView.jsx` — Lazy-load pattern reference for AchievementPanel migration

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all files read directly, no assumptions
- Architecture: HIGH — existing patterns confirmed from source
- Pitfalls: HIGH — derived from actual code structure, not speculation
- New requirement types: HIGH — state shapes confirmed from slice files

**Research date:** 2026-03-23
**Valid until:** 2026-04-22 (stable; no external dependencies)
