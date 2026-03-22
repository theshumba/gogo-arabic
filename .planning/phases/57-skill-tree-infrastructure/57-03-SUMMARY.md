---
phase: 57
plan: 03
subsystem: skill-tree
tags: [skill-trees, ui, react-lazy, code-splitting, frontier-ux, xp-progress]
dependency_graph:
  requires: [57-01, 57-02]
  provides: [SKILL-04]
  affects: [SkillTreeView, SkillTreeView.module.css, SkillTreeMenu]
tech_stack:
  added: []
  patterns: [react-lazy-code-splitting, suspense-fallback, frontier-progressive-disclosure, xp-progress-bar]
key_files:
  created: []
  modified:
    - src/components/Skills/SkillTreeView.jsx
    - src/components/Skills/SkillTreeView.module.css
    - src/components/Skills/SkillTreeMenu.jsx
decisions:
  - "frontierNodeIds limited to slice(0,2) — plan specifies 1-2 reachable nodes to keep UI focused"
  - "visibleNodes filter uses 'available' status from selector for non-frontier visible nodes"
  - "originalIndex tracked but not used in render — removed from final output (no-op deviation)"
  - "xpValue font-size reduced from 10px to 8px to accommodate fraction format without overflow"
metrics:
  duration: "3 minutes"
  completed: "2026-03-22"
  tests_before: 1193
  tests_after: 1193
  tests_added: 0
  commits: 2
---

# Phase 57 Plan 03: Skill Tree UI Polish Summary

**One-liner:** Updated SkillTreeView with XP progress bar (current/target values with tree-color fill), frontier node pulsing gold highlight for next 1-2 reachable nodes, collapsed locked node summary count, all 8 reward type labels, and lazy-loaded the component via React.lazy + Suspense in SkillTreeMenu.

## What Was Built

### Task 1: SkillTreeView XP progress bar, frontier highlighting, collapsed locked nodes, new reward labels

**XP progress bar (Part A):**
- Replaced raw `{currentXP}` display with a full progress bar
- Computes `nextUnlockableNode` — cheapest non-unlocked node sorted by xpCost ascending
- `xpProgress` clamped to 100% (shows MAX when all nodes are unlocked)
- Bar rendered with `xpBarTrack` (flex track) + `xpBarFill` (colored fill at `tree.color`)
- XP value shown as `{currentXP} / {nextUnlockableNode?.xpCost ?? 'MAX'} XP`

**Frontier highlighting (Part B):**
- `frontierNodeIds` Set: locked/available nodes whose prerequisites are all unlocked, limited to first 2
- `getNodeClass` returns `styles.node + styles.available + styles.frontier` for frontier nodes
- `.frontier` CSS: gold border + `frontierPulse` 2s ease-in-out animation with box-shadow glow

**Collapsed locked nodes (Part C):**
- `visibleNodes` filter: unlocked + available + frontier nodes only
- `collapsedCount` = total nodes - visible nodes
- Renders full cards only for visible nodes; appends `collapsedLocked` summary after `</ul>`
- Summary reads: `"{n} more node{s} locked"` with dashed border and dimmed pixel font

**New reward labels (Part D):**
- Extended `getRewardLabel` switch for all 8 types:
  - `unlock_spell` → `'Unlocks spell'`
  - `unlock_dialogue` → `'Unlocks dialogue'`
  - `unlock_zone` → `'Unlocks zone'`
  - `unlock_npc_branch` → `'Unlocks NPC branch'`

**CSS additions to SkillTreeView.module.css:**
- `.xpBarTrack`: flex: 1, height 6px, rgba track with border
- `.xpBarFill`: height 100%, 0.4s width transition
- `.frontier`: gold border-color, box-shadow, frontierPulse animation
- `@keyframes frontierPulse`: 0%/100% subtle glow → 50% stronger glow
- `.collapsedLocked`: pixel font, dashed border, 0.5 opacity
- `.xpBar` updated: `gap: 0` to tighten label + track + value layout

### Task 2: Lazy-load SkillTreeView in SkillTreeMenu via React.lazy + Suspense

- Static `import SkillTreeView from './SkillTreeView.jsx'` removed
- Replaced with `const SkillTreeView = lazy(() => import('./SkillTreeView.jsx'))`
- `Suspense` and `lazy` added to the React destructure import
- `<SkillTreeView treeId={activeTreeId} />` wrapped in `<Suspense>` with pixel-font fallback
- Fallback text: `"Loading skill tree..."` in `--font-pixel` 8px `--color-light-gray`
- SkillTreeView chunk is now code-split; only loaded when player opens the skill tree menu

## Test Results

| Suite | Before | After | Added |
|-------|--------|-------|-------|
| Full suite | 1193 | 1193 | 0 |

No new tests added — this plan is pure UI enhancement over existing Redux selectors. Existing selectors (`selectNodeAvailability`, `selectSkillXP`) tested in prior plans.

## Deviations from Plan

None — plan executed exactly as written.

Minor observation: `originalIndex` was briefly computed during node map render but was not needed in the final JSX. Removed from the committed code.

## Self-Check: PASSED

Files verified:
- FOUND: src/components/Skills/SkillTreeView.jsx (contains: frontier, xpBarTrack, xpBarFill, collapsedLocked, xpProgress, nextUnlockableNode, unlock_spell, unlock_npc_branch)
- FOUND: src/components/Skills/SkillTreeView.module.css (contains: xpBarTrack, xpBarFill, frontier, frontierPulse, collapsedLocked)
- FOUND: src/components/Skills/SkillTreeMenu.jsx (contains: lazy, Suspense, import('./SkillTreeView.jsx'), no static import)

Commits verified:
- 6ba444a: feat(57-03): add XP progress bar, frontier highlighting, collapsed locked nodes, reward labels
- 9af2172: feat(57-03): lazy-load SkillTreeView via React.lazy + Suspense in SkillTreeMenu
