---
phase: 57
plan: 01
subsystem: skill-tree
tags: [redux, skill-trees, xp-routing, save-migration, middleware, data-expansion]
dependency_graph:
  requires: [56-02]
  provides: [SKILL-01, SKILL-02]
  affects: [learningProgressMiddleware, skillTreeSlice, skillTrees, initializeSkillTree, main]
tech_stack:
  added: []
  patterns: [middleware-xp-routing, bulk-unlock-reducer, idempotent-init, persistor-subscribe]
key_files:
  created:
    - src/data/initializeSkillTree.js
    - src/data/__tests__/initializeSkillTree.test.js
  modified:
    - src/data/skillTrees.js
    - src/store/slices/skillTreeSlice.js
    - src/store/middleware/learningProgressMiddleware.js
    - src/store/middleware/__tests__/learningProgressMiddleware.test.js
    - src/main.jsx
decisions:
  - "poetry.completedBattles used (not poetry.history) — confirmed from poetrySlice.js shape"
  - "state.quests (not state.quest) confirmed from store.js rootReducer key"
  - "idempotency gated on skillXP > 0 OR unlockedNodes > 0 (dual guard for safety)"
  - "reading_13 (unlock_npc_branch) placed before reading_14 to satisfy plan requirement for 30 nodes including special reward types"
metrics:
  duration: "8 minutes"
  completed: "2026-03-22"
  tests_before: 1174
  tests_after: 1183
  tests_added: 19
  commits: 2
---

# Phase 57 Plan 01: Skill Tree Infrastructure Summary

**One-liner:** Expanded 6 skill trees from 10-12 to 30 nodes each with 4 new reward types, populated learningProgressMiddleware with XP routing for 6 event types, added bulkUnlockNodes reducer, and created idempotent initializeSkillTree for v11.0 save migration.

## What Was Built

### Task 1: skillTrees.js + learningProgressMiddleware + bulkUnlockNodes

**skillTrees.js expanded to 30 nodes per tree:**
- Reading: 12 → 30 nodes (added reading_13 through reading_30)
- Writing: 12 → 30 nodes (added writing_13 through writing_30)
- Listening: 10 → 30 nodes (added listening_11 through listening_30)
- Speaking: 10 → 30 nodes (added speaking_11 through speaking_30)
- Grammar: 10 → 30 nodes (added grammar_11 through grammar_30)
- Culture: 10 → 30 nodes (added culture_11 through culture_30)

All new nodes follow existing patterns: IDs, names, nameArabic, description, prerequisites (within same tree only), cefrLevel, xpCost, rewards. CEFR distribution fills Pre-A1 through C2 with emphasis on A1-B2 gap nodes.

**Four new reward types placed across trees:**
- `unlock_spell` — grammar_11 (`ك-ت-ب`) — C2, 800 XP
- `unlock_dialogue` — speaking_11 (`merchant_elder_negotiation`) — C2, 800 XP
- `unlock_zone` — culture_11 (`ancient_quarter`) — C2, 800 XP
- `unlock_npc_branch` — reading_13 (`scholar_archive_branch`) — C2, 800 XP

**skillTreeSlice.js — bulkUnlockNodes reducer added:**
- Bypasses XP cost check — used exclusively by initializeSkillTree
- Marks nodes as unlocked without deducting from skillXP
- Guards against duplicate unlocks (idempotent per node)
- Exported alongside unlockNode and addSkillXP

**learningProgressMiddleware.js — XP routing populated:**
- `grammar/completeLesson` → grammar tree +40 XP
- `quests/completeQuest` → culture tree +30 XP
- `achievements/recordPerfectQuiz` → reading tree +20 XP
- `achievements/incrementReviews` → reading tree +10 XP
- `alphabet/completeGroup` → writing tree +25 XP
- `poetry/endPoetryBattle` (won: true) → speaking +30 XP, culture +30 XP

**learningProgressMiddleware.test.js — 10 integration tests:**
- 6 XP routing tests (one per event type)
- 1 negative test (lost poetry battle = 0 XP)
- 1 unknown action test (no XP)
- 2 accumulation tests (multiple events stack correctly)

### Task 2: initializeSkillTree + main.jsx wiring + tests

**initializeSkillTree.js:**
- Reads progress from grammar.completedLessons, quests.quests (completed status), vocabulary.fsrsCards, alphabet.completedGroups, poetry.completedBattles
- Awards proportional XP matching middleware rates (40/30/5/25/30 XP respectively)
- Auto-unlocks nodes by walking tree nodes sorted by xpCost ascending, checking prerequisites
- Dual idempotency guard: returns early if any skillXP > 0 OR any unlockedNodes.length > 0

**main.jsx wiring:**
- Import initializeSkillTree from ./data/initializeSkillTree.js
- persistor.subscribe callback with `bootstrapped` guard
- skillTreeInitCalled flag prevents multiple calls (belt-and-suspenders alongside function's own guard)
- Placed after checkDailyReset dispatch, before ReactDOM.createRoot

**initializeSkillTree.test.js — 9 tests:**
1. Does not dispatch when no prior progress
2. Awards grammar XP proportional to completedLessons (2 lessons = 80 XP)
3. Awards culture XP proportional to completed quests (3 quests = 90 XP)
4. Awards reading XP proportional to learned words (20 cards = 100 XP)
5. Is idempotent — calling twice does not double XP
6. Does not overwrite existing skill tree progress (skillXP > 0 → early return)
7. Auto-unlocks nodes when XP is sufficient (grammar_01 at 75 XP cost unlocked with 80 XP)
8. Awards writing XP proportional to alphabet groups (3 groups = 75 XP)
9. Awards speaking and culture XP for poetry wins (1 win = 30 XP each)

## Test Results

| Suite | Before | After | Added |
|-------|--------|-------|-------|
| learningProgressMiddleware | 2 (scaffold) | 10 | +8 |
| initializeSkillTree | 0 | 9 | +9 |
| Full suite | 1174 | 1183 | +9 |

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written, with one minor clarification:

**Observation (not a deviation):** The plan mentioned `poetry.history` but poetrySlice uses `completedBattles`. Read the slice file as instructed in read_first — used `poetry.completedBattles` which is the correct field. Also confirmed `state.quests` (not `state.quest`) as the key in rootReducer.

## Self-Check: PASSED

All files verified:
- FOUND: src/data/skillTrees.js
- FOUND: src/store/slices/skillTreeSlice.js
- FOUND: src/store/middleware/learningProgressMiddleware.js
- FOUND: src/data/initializeSkillTree.js
- FOUND: src/main.jsx
- FOUND: src/store/middleware/__tests__/learningProgressMiddleware.test.js
- FOUND: src/data/__tests__/initializeSkillTree.test.js

Commits verified:
- 291bd19: feat(57-01): expand 6 skill trees to 30 nodes + XP routing + bulkUnlockNodes
- 412956d: feat(57-01): create initializeSkillTree + wire into main.jsx + tests
