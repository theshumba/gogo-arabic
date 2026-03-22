---
phase: 57
plan: 02
subsystem: skill-tree
tags: [redux, skill-trees, reward-dispatch, middleware, action-set-executor, action-context, content-gating]
dependency_graph:
  requires: [57-01]
  provides: [SKILL-03]
  affects: [learningProgressMiddleware, ActionSetExecutor, actionContext, skillTreeRewards.test]
tech_stack:
  added: []
  patterns: [middleware-reward-dispatch, skill-tree-level-gating, action-context-snapshot]
key_files:
  created:
    - src/data/__tests__/skillTreeRewards.test.js
  modified:
    - src/store/middleware/learningProgressMiddleware.js
    - src/game/systems/ActionSetExecutor.js
    - src/game/systems/actionContext.js
decisions:
  - "unlock_zone/dialogue/npc_branch all use setFlag with distinct key prefixes (zone_access_/dialogue_/npc_branch_) to avoid namespace collisions in worldState.flags"
  - "unlock_spell dispatches discoverRoot with element: 'earth' — element is cosmetic and not skill-tree-gating-critical"
  - "skill_tree_level defaults minNodes to 1 when field omitted — safe default matches intent"
  - "skillTreeUnlocked exposed as full unlockedNodes map in actionContext — avoids per-tree selectors at context-build time"
metrics:
  duration: "7 minutes"
  completed: "2026-03-22"
  tests_before: 1183
  tests_after: 1193
  tests_added: 10
  commits: 1
---

# Phase 57 Plan 02: Skill Tree Reward Wiring Summary

**One-liner:** Wired skill tree node reward dispatch through learningProgressMiddleware (unlock_spell → discoverRoot, unlock_zone/dialogue/npc_branch → setFlag) and added skill_tree_level requirement to ActionSetExecutor for content gating via context.skillTreeUnlocked.

## What Was Built

### Task 1: Reward dispatch + skill_tree_level condition + actionContext field + tests

**learningProgressMiddleware.js — reward dispatch on skillTree/unlockNode:**
- New `skillTree/unlockNode` case added to the switch statement
- Imports: `SKILL_TREES` (data), `discoverRoot` (magicSlice), `setFlag` (worldStateSlice)
- `unlock_spell`: dispatches `discoverRoot({ rootId: node.rewards.value, element: 'earth' })`
- `unlock_zone`: dispatches `setFlag({ key: 'zone_access_{value}', value: true })`
- `unlock_dialogue`: dispatches `setFlag({ key: 'dialogue_{value}', value: true })`
- `unlock_npc_branch`: dispatches `setFlag({ key: 'npc_branch_{value}', value: true })`
- Inner switch uses separate key prefixes to avoid worldState.flags namespace collisions
- Non-reward node types (badge, xp_bonus, unlock_content) fall through default → no dispatch

**ActionSetExecutor.js — skill_tree_level requirement case:**
- New case before `default` in `evaluateRequirement()`
- `req = { type: 'skill_tree_level', treeId: 'grammar', minNodes: 3 }`
- Reads `context.skillTreeUnlocked?.[req.treeId]?.length ?? 0`
- Returns `unlockedCount >= (req.minNodes ?? 1)` — defaults to minNodes=1 if omitted
- JSDoc updated to document `skillTreeUnlocked` context field

**actionContext.js — skillTreeUnlocked in context snapshot:**
- `skillTreeUnlocked: state.skillTree?.unlockedNodes || {}` added after `factionScores`
- Returns full unlockedNodes map (treeId → string[]) from Redux state
- Used by ActionSetExecutor's skill_tree_level condition without per-tree selector calls

**skillTreeRewards.test.js — 10 tests:**

Reward type existence (4 tests):
1. `unlock_spell` node exists with string value — grammar_11 (`ك-ت-ب`)
2. `unlock_dialogue` node exists with string value — speaking_11 (`merchant_elder_negotiation`)
3. `unlock_zone` node exists with string value — culture_11 (`ancient_quarter`)
4. `unlock_npc_branch` node exists with string value — reading_13 (`scholar_archive_branch`)

ActionSetExecutor skill_tree_level conditions (6 tests):
5. Matches when unlocked count exactly meets minNodes (3/3)
6. Does not match when count is below minNodes (3/5)
7. Does not match when tree is missing from skillTreeUnlocked ({})
8. Matches when unlocked count exceeds minNodes (5 > 3)
9. Matches with default minNodes=1 when 1 node unlocked (no minNodes field)
10. Does not match when skillTreeUnlocked is absent from context entirely

## Test Results

| Suite | Before | After | Added |
|-------|--------|-------|-------|
| skillTreeRewards (new) | 0 | 10 | +10 |
| Full suite | 1183 | 1193 | +10 |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

Files verified:
- FOUND: src/store/middleware/learningProgressMiddleware.js
- FOUND: src/game/systems/ActionSetExecutor.js
- FOUND: src/game/systems/actionContext.js
- FOUND: src/data/__tests__/skillTreeRewards.test.js

Commits verified:
- f584bfe: feat(57-02): wire skill tree node reward dispatch + skill_tree_level condition
