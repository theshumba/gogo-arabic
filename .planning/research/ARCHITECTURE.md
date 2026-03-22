# Architecture Research — v12.0 Learning Systems

**Researched:** 2026-03-22
**Confidence:** HIGH (all findings verified against actual source code)
**Scope:** Integration of skill trees, 50 grammar lessons, 18 quiz types, adaptive difficulty, placement tests, 250+ achievements with existing Redux/Phaser/FSRS architecture.

---

## What Already Exists (Do Not Rebuild)

Before listing what is NEW, it is critical to understand what v11.0 already shipped — building on existing work rather than rewriting it is the central discipline for this milestone.

| System | File | Status |
|--------|------|--------|
| skillTreeSlice | `src/store/slices/skillTreeSlice.js` | COMPLETE — unlockNode, addSkillXP, 3 memoized selectors |
| SKILL_TREES data | `src/data/skillTrees.js` | COMPLETE — 6 trees, 64 nodes, CEFR-tagged |
| SkillTreeMenu + SkillTreeView | `src/components/Skills/` | COMPLETE — tab UI, node unlock UI |
| grammarSlice | `src/store/slices/grammarSlice.js` | COMPLETE — completedLessons, lessonScores, all reducers |
| grammar.js data | `src/data/grammar.js` | COMPLETE — 47 lessons, CEFR-tagged, exercises + quiz arrays |
| GrammarLesson + GrammarModule | `src/components/Grammar/` | COMPLETE — 5-stage lesson flow, dispatch to grammarSlice |
| achievementSlice | `src/store/slices/achievementSlice.js` | COMPLETE — unlockAchievement, newAchievements queue, stats |
| achievementMiddleware | `src/store/middleware/achievementMiddleware.js` | COMPLETE — action→type map, isAchievementMet, XP batching, re-entrancy guard |
| achievements.js data | `src/data/achievements.js` | ~44 current definitions, 15+ category constants including GRAMMAR, SKILL_TREE placeholders |
| QuizOverlay | `src/components/Quiz/QuizOverlay.jsx` | COMPLETE — 12 quiz type components wired |
| useQuiz hook | `src/hooks/useQuiz.js` | COMPLETE — FSRS card lifecycle, 9 quiz types in QUIZ_TYPES array |
| wordSelection.js | `src/utils/wordSelection.js` | COMPLETE — difficulty 1-5 weighting by player level |
| FSRS service | `src/services/fsrs.js` | COMPLETE — ts-fsrs, reviewCard, getDueCards, path-sorted new cards |

---

## What Is NEW for v12.0

### New Redux Slices (2)

#### 1. `placementSlice` — Diagnostic placement test state
**Why new slice:** Placement test is a one-time session-scoped flow with its own state machine (not persisted until complete). It also produces the `cefrLevel` assignment that feeds grammarSlice gating and skill tree unlock eligibility — a distinct concern from player progression.

```
State shape:
  status: 'idle' | 'active' | 'complete'
  currentQuestionIndex: number
  answers: [{ questionId, correct, cefrLevel, treeId }]
  startedAt: ISO string | null
  completedAt: ISO string | null
  result: {
    assignedCefrLevel: 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | null
    treeUnlocks: { reading: nodeId[], writing: nodeId[], ... }
    grammarUnlocks: lessonId[]
    summary: { correct, total, byTree: {} }
  } | null

Reducers:
  startPlacement()
  answerQuestion({ questionId, correct, cefrLevel, treeId })
  completePlacement()    // computes result from answers
  resetPlacement()
```

**Persistence:** localStorage (root persist whitelist). Small, needed across sessions.

**Downstream:** `completePlacement` triggers `addSkillXP` (batch grant) + `grammarSlice` pre-unlock via `completeLesson` for lessons below assigned level + achievement check via existing `achievementMiddleware`.

#### 2. `cefrProgressSlice` — CEFR level advancement tracking over time
**Why new slice:** `grammarSlice` tracks lesson scores but has no concept of current CEFR level achieved, when the player graduated each level, or historical snapshots for the progress report UI. `playerSlice` tracks level/XP but not CEFR progression. A separate slim slice is the cleanest boundary.

```
State shape:
  currentLevel: 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  levelHistory: [{ level, achievedAt, triggerType: 'placement' | 'grammar' | 'quiz' }]
  reportData: {
    weeklyAccuracy: [{ week, accuracy }]   // last 12 weeks
    lessonVelocity: number                  // lessons/week average
    strongestTree: treeId | null
    weakestTree: treeId | null
  }

Reducers:
  setCefrLevel({ level, triggerType })
  recordReportSnapshot({ accuracy, lessonsThisWeek })
  refreshTreeStrengths()                    // recomputes from skillTreeSlice data
```

**Persistence:** localStorage (root whitelist). Always small.

---

### New Middleware (1)

#### `learningProgressMiddleware` — Cross-system XP routing + CEFR advancement

**Why new middleware rather than extending achievementMiddleware:**
`achievementMiddleware` already has a re-entrancy guard and a focused action→type dispatch table. Adding grammar, skill tree, placement, and CEFR concern to it would balloon the switch/case to 30+ branches and risk cascading dispatch bugs. A dedicated middleware keeps concerns separated and follows the established pattern (battleRewardsMiddleware, factionMiddleware, etc.).

**Responsibilities:**
1. `grammar/completeLesson` → dispatch `addSkillXP({ treeId: 'grammar', amount })` + check CEFR level-up
2. `skillTree/unlockNode` → dispatch `addXP` (player XP reward from node) + check CEFR update
3. `placement/completePlacement` → dispatch batch `addSkillXP` + batch `completeLesson` unlocks + `cefrProgress/setCefrLevel`
4. `grammar/completeLesson` (for 50th lesson) → emit `achievements/checkAll` for grammar_50 achievement

**Action dispatch table:**
```js
const LEARNING_ACTIONS = {
  'grammar/completeLesson':     ['grammar_skillxp', 'cefr_check'],
  'skillTree/unlockNode':       ['player_xp_reward', 'cefr_check'],
  'placement/completePlacement':['placement_grants', 'cefr_set'],
  'quiz/recordAdaptiveResult':  ['adaptive_difficulty_update'],
};
```

Note: `grammar/completeLesson` is already dispatched but NOT in `achievementMiddleware`'s `ACTION_TO_ACHIEVEMENT_TYPES`. This is the existing gap — grammar_lessons achievements (grammar_5, grammar_10, grammar_25, grammar_50) currently never fire. The new middleware fixes this by wiring `grammar/completeLesson` → check grammar_lessons achievement types, then delegating to `achievementMiddleware` via action dispatch.

---

### New Data Files (3)

#### 1. `src/data/placementTest.js` — 20-30 diagnostic questions
```js
// Structure per question:
{
  id: 'pt_reading_a1_01',
  treeId: 'reading',          // which skill tree this question probes
  cefrLevel: 'A1',            // level this question represents
  type: 'ar-to-en' | 'grammar-rule' | 'sentence-build' | ...,
  word: wordObject | null,    // null for grammar-rule type
  grammarLessonId: null | id, // for grammar-type questions
  // ... standard quiz question fields
}
```

Questions are drawn from each tree (reading: 3-4, writing: 2, listening: 2, speaking: 2, grammar: 4-5, culture: 2) spanning Pre-A1 through B1. The result algorithm counts correct answers per CEFR band and assigns the highest band where the player achieves >70%.

**No new component needed** — placement test reuses existing quiz type components (ArabicToEnglish, FillInBlank, SentenceBuilder, ConjugationPick) inside a new `PlacementTestOverlay.jsx`.

#### 2. `src/data/quizTypes.js` — Registry for 18 quiz type metadata
The 12 quiz types are already implemented as components. The registry adds the 6 new types and provides unlock conditions, difficulty ranges, and display metadata:
```js
export const QUIZ_TYPE_REGISTRY = {
  'ar-to-en': { component: 'ArabicToEnglish', minLevel: 1, cefrMin: 'A1', ... },
  'grammar-fill': { component: 'GrammarFill', minLevel: 3, cefrMin: 'A1', ... },
  'cloze-passage': { component: 'ClozePassage', minLevel: 8, cefrMin: 'B1', ... },
  // ... all 18 types
};
```

The 6 new quiz type components to build:
| New Quiz Type | Component | Description |
|---------------|-----------|-------------|
| `grammar-fill` | `GrammarFill.jsx` | Fill grammatical form in sentence (verb conjugation, case ending) |
| `cloze-passage` | `ClozePassage.jsx` | Multi-blank paragraph fill using context |
| `word-order` | `WordOrder.jsx` | Drag-and-drop Arabic word ordering (extends SentenceBuilder) |
| `dialect-identify` | `DialectIdentify.jsx` | Match phrase to dialect (unlocked at C1 listening node) |
| `root-expand` | `RootExpand.jsx` | Given root, produce form I/II/V verb (uses rootMagic data) |
| `cultural-context` | `CulturalContext.jsx` | Match Arabic phrase to cultural situation |

#### 3. `src/data/achievements.js` — EXPAND (not replace)
The file already has 2,633 lines and the correct category constants. The expansion adds ~206 new achievement entries across:
- Skill tree milestones: 60 entries (10 per tree × 6 trees: first_node, 25%, 50%, 75%, all_nodes, each_level_complete)
- Grammar expansion: 10 entries (lesson_20, lesson_30, lesson_40, all_categories, all_a1, all_a2, all_b1, all_b2, perfect_grammar_week, grammar_combo_master)
- Quiz type mastery: 36 entries (2 per quiz type × 18 types: first_use, 10_correct_streak)
- Adaptive difficulty: 6 entries (reach_hard, stay_hard_10, adaptive_plateau_break, etc.)
- Placement + CEFR: 15 entries (placement_complete, placed_a1, placed_a2, cefr_advanced, etc.)
- Social: 5 entries (share_100_words, share_500_words, etc.)
- Secret/hidden: 20+ entries

New requirement types to add to `isAchievementMet()` in achievementMiddleware:
```
'grammar_lessons'         → already has data entries, NOT wired (BUG — fix now)
'skill_tree_nodes'        → state.skillTree.unlockedNodes[treeId].length
'skill_tree_complete'     → selectTreeProgress(treeId).percentage === 100
'quiz_type_streak'        → new stats field in achievementSlice
'cefr_level_reached'      → cefrProgressSlice.currentLevel
'placement_complete'      → placementSlice.status === 'complete'
'quiz_types_used'         → new stats field counting distinct types used
```

---

### Modified Files (existing, targeted changes)

#### `src/store/slices/grammarSlice.js` — 2 additions
1. Add `cefrLevel` field to `lessonScores` entries (sourced from grammar.js data, populated on `completeLesson`)
2. Add `lessonsByLevel` selector using existing `cefrLevel` tags on grammar.js lessons

The existing 47-lesson data already has `cefrLevel` tags from order 1-47. The 3 missing lessons (grammar.js stops at order 47, milestone requires 50) need to be added to `grammar.js` data — orders 48, 49, 50 covering B2/C1 content.

#### `src/store/slices/achievementSlice.js` — 2 additions
1. Expand `stats` object: add `quizTypeStats: {}` (maps quiz type → correct streak count), `quizTypesUsed: Set` (serialized as array)
2. Add `recordQuizTypeResult({ quizType, correct })` reducer

#### `src/store/middleware/achievementMiddleware.js` — 1 fix + 3 additions
**Fix (existing bug):** Add `'grammar/completeLesson': ['grammar_lessons']` to `ACTION_TO_ACHIEVEMENT_TYPES`. This is currently missing — grammar_lessons achievements never fire.

**Additions:**
```js
'skillTree/unlockNode': ['skill_tree_nodes', 'skill_tree_complete'],
'placement/completePlacement': ['placement_complete', 'cefr_level_reached'],
'achievements/recordQuizTypeResult': ['quiz_type_streak', 'quiz_types_used'],
```

Add corresponding cases to `isAchievementMet()` — these read from the two new slices.

#### `src/hooks/useQuiz.js` — adaptive difficulty integration
Add `adaptiveDifficulty` state: tracks rolling accuracy (last 10 answers). After each answer:
- accuracy > 85% for 3 consecutive: difficulty tier +1 (up to 5)
- accuracy < 50% for 3 consecutive: difficulty tier -1 (down to 1)

The difficulty tier feeds into `wordSelection.js`'s existing `selectWordsByDifficulty` which already implements the 5-tier difficulty weight system. No new algorithm needed — just wire the adaptive tier into the existing `getTargetDifficulty()` call.

Store the adaptive tier in `uiSlice` (transient — resets each session). Do NOT persist it.

#### `src/store/store.js` — 2 slice registrations
```js
// Add to combineReducers:
placement: placementReducer,      // localStorage persist
cefrProgress: cefrProgressReducer, // localStorage persist

// Add to whitelist:
'placement', 'cefrProgress'

// Add to middleware chain:
learningProgressMiddleware
```

**Storage impact:** Both new slices are small (< 10KB). localStorage is correct — no IndexedDB needed.

**Migration:** Bump `CURRENT_VERSION` to 11 in migrations.js. Migration is trivial (new keys initialize to default state).

#### `src/utils/eventBusTypes.js` — 3 new events
```js
PLACEMENT_COMPLETE: 'react:placement:complete',
CEFR_LEVEL_UP: 'react:learning:cefr-level-up',
QUIZ_TYPE_UNLOCKED: 'react:quiz:type-unlocked',
```

---

### New React Components (6)

| Component | Path | What It Does |
|-----------|------|-------------|
| `PlacementTestOverlay` | `src/components/Quiz/PlacementTestOverlay.jsx` | Full-screen diagnostic (20-30 Qs), reuses quiz type components, dispatches to placementSlice |
| `CefrProgressReport` | `src/components/Profile/CefrProgressReport.jsx` | Timeline chart of CEFR advancement + tree strength bars, uses cefrProgressSlice |
| `SocialShareCard` | `src/components/UI/SocialShareCard.jsx` | Generates shareable canvas image "I learned X Arabic words" using html2canvas or CSS export |
| `GrammarFill` | `src/components/Quiz/GrammarFill.jsx` | New quiz type component — grammar cloze |
| `ClozePassage` | `src/components/Quiz/ClozePassage.jsx` | New quiz type — multi-blank passage |
| `WordOrder` | `src/components/Quiz/WordOrder.jsx` | New quiz type — drag word ordering |

Three more quiz type components (DialectIdentify, RootExpand, CulturalContext) are lower priority — they depend on listening and culture skill tree nodes being unlocked at B2/C1, which most players won't reach in MVP. Flag for Phase 2 of this milestone.

---

## Data Flow Diagrams

### Placement Test → System Grants
```
Player opens PlacementTestOverlay
  → placementSlice.startPlacement()
  → QuizType components render questions from placementTest.js
  → Each answer: placementSlice.answerQuestion()
  → On final answer: placementSlice.completePlacement()
    → result.assignedCefrLevel computed from answers
    → result.treeUnlocks computed (nodes up to assigned level)
    → result.grammarUnlocks computed (lessons up to assigned level)

  → learningProgressMiddleware intercepts 'placement/completePlacement'
    → For each treeUnlock: dispatch(addSkillXP({ treeId, amount }))
    → For each grammarUnlock: dispatch(completeLesson({ lessonId, ... }))
    → dispatch(cefrProgress/setCefrLevel({ level, triggerType: 'placement' }))
    → achievementMiddleware fires on addSkillXP/completeLesson cascades

  → EventBus.emit(PLACEMENT_COMPLETE, { level })
    → PlacementResultScreen shows summary
    → uiSlice.openCefrReport()
```

### Grammar Lesson → Skill Tree → Achievement
```
Player completes grammar lesson
  → GrammarLesson dispatches completeLesson({ lessonId, exerciseScore, quizScore })
  → grammarSlice.completedLessons updated

  → achievementMiddleware intercepts 'grammar/completeLesson' [AFTER FIX]
    → checks grammar_lessons achievements (threshold 1/5/10/25/50)
    → dispatches unlockAchievement + addXP if met

  → learningProgressMiddleware intercepts 'grammar/completeLesson'
    → dispatches addSkillXP({ treeId: 'grammar', amount: scoreBasedXP })
    → checks if cefrLevel should advance (all lessons at level X complete?)
      → if yes: dispatch(cefrProgress/setCefrLevel({ level: 'A2', ... }))
      → EventBus.emit(CEFR_LEVEL_UP)
```

### Adaptive Difficulty → Quiz Type Selection
```
useQuiz tracks rolling accuracy (last 10 answers in local state)
  → After each answer: recalculate adaptive tier (1-5)
  → Adaptive tier stored in component state (NOT Redux — session-only)
  → On next question: getTargetDifficulty(adaptiveTier) from wordSelection.js
  → Returns weighted pool of words at appropriate difficulty
  → selectQuizType(word) also gates on QUIZ_TYPE_REGISTRY.minLevel
    → Quiz types with cefrMin: 'B1' only appear once player CEFR ≥ B1
```

### Skill Tree Node Unlock → Player XP + Achievement
```
Player clicks unlock in SkillTreeView
  → dispatch(unlockNode({ treeId, nodeId }))
  → skillTreeSlice validates prereqs + XP, marks unlocked

  → learningProgressMiddleware intercepts 'skillTree/unlockNode'
    → reads node.rewards from SKILL_TREES data
    → if reward.type === 'xp_bonus': dispatch(addXP(reward.value))
    → if reward.type === 'title': dispatch(addTitle(reward.value))
    → if reward.type === 'unlock_content': emit EventBus.QUIZ_TYPE_UNLOCKED
    → dispatch(cefrProgress/refreshTreeStrengths())

  → achievementMiddleware intercepts resulting 'player/addXP'
    → checks xp_total achievements
  → achievementMiddleware intercepts 'skillTree/unlockNode' [AFTER ADDITION]
    → checks skill_tree_nodes, skill_tree_complete
```

---

## Component Boundaries

| Component | Reads From | Writes To | Notes |
|-----------|------------|-----------|-------|
| PlacementTestOverlay | placementSlice, placementTest.js | placementSlice | Reuses quiz type sub-components |
| SkillTreeMenu/View | skillTreeSlice, SKILL_TREES | skillTreeSlice.unlockNode | Already wired, no changes needed |
| GrammarModule/Lesson | grammarSlice, grammar.js | grammarSlice | Already wired, only extend grammar.js data |
| QuizOverlay + useQuiz | vocabularySlice, uiSlice | vocabularySlice, achievementSlice | Add adaptive tier (local state) + 6 new type components |
| CefrProgressReport | cefrProgressSlice, skillTreeSlice, grammarSlice | — | Read-only display |
| AchievementPanel | achievementSlice | achievementSlice (dismiss) | Add new req types to isAchievementMet only |
| SocialShareCard | playerSlice, vocabularySlice | — | Renders to canvas, no Redux writes |

---

## Build Order (Dependency-Driven)

This order respects the dependency graph: slices must exist before middleware can dispatch to them, data must exist before components render it, bug fixes precede features that depend on the fixed behavior.

```
Step 1: Fix grammar_lessons achievement bug
  → Add 'grammar/completeLesson' to ACTION_TO_ACHIEVEMENT_TYPES in achievementMiddleware.js
  → Add 'grammar_lessons' case to isAchievementMet()
  → No new files, 4 lines of code, immediate correctness win
  → UNBLOCKS: all grammar achievement checking

Step 2: Expand grammar.js to 50 lessons
  → Add lessons 48-50 (B2/C1 content, full exercises + quiz arrays)
  → grammarSlice.selectGrammarProgress already uses grammarLessons.length — auto-correct
  → UNBLOCKS: grammar_50 achievement, selectGrammarProgress = 100%

Step 3: New slices — placementSlice + cefrProgressSlice
  → src/store/slices/placementSlice.js
  → src/store/slices/cefrProgressSlice.js
  → Register in store.js (combineReducers + whitelist + migrations.js v11)
  → UNBLOCKS: placement middleware, CEFR report component

Step 4: learningProgressMiddleware
  → src/store/middleware/learningProgressMiddleware.js
  → Wires grammar→skillXP, skillTree→playerXP, placement→grants, quiz→adaptive stats
  → Register in store.js middleware chain
  → UNBLOCKS: skill tree XP accumulation from real gameplay, CEFR level advancement

Step 5: Placement test data + overlay
  → src/data/placementTest.js (20-30 questions across 6 trees and Pre-A1→B1)
  → src/components/Quiz/PlacementTestOverlay.jsx (reuses quiz type components)
  → Add PLACEMENT_COMPLETE, CEFR_LEVEL_UP events to eventBusTypes.js
  → UNBLOCKS: CEFR level assignment from test, tree + grammar pre-unlocks

Step 6: Adaptive difficulty wiring in useQuiz
  → Add rolling accuracy tracker (local state) to useQuiz.js
  → Feed adaptive tier into wordSelection.js selectWordsByDifficulty call
  → Add QUIZ_TYPE_REGISTRY in quizTypes.js with minLevel/cefrMin gates
  → Expand QUIZ_TYPES array in useQuiz.js from 9 to 12 (3 new types that are CEFR-gated)
  → UNBLOCKS: harder quiz types unlocking at higher CEFR levels

Step 7: 6 new quiz type components (3 core now, 3 deferred)
  → GrammarFill.jsx, ClozePassage.jsx, WordOrder.jsx (build now)
  → DialectIdentify.jsx, RootExpand.jsx, CulturalContext.jsx (defer — need B2/C1 nodes)
  → Wire into QuizOverlay.jsx component map and QUIZ_TYPE_LABELS
  → UNBLOCKS: 15 quiz type total coverage (3 more deferred to later phases)

Step 8: Achievement expansion in achievements.js
  → Extend achievementSlice.stats with quizTypeStats
  → Add recordQuizTypeResult reducer
  → Add new achievement requirement type cases to achievementMiddleware.isAchievementMet()
  → Add new action entries to ACTION_TO_ACHIEVEMENT_TYPES
  → Add 206 new achievement entries to achievements.js
  → UNBLOCKS: full 250+ achievement count

Step 9: CEFR Progress Report + Social Share
  → CefrProgressReport.jsx (reads cefrProgressSlice + skillTreeSlice + grammarSlice)
  → SocialShareCard.jsx (renders canvas with word count, uses html2canvas or CSS clip-to-image)
  → Wire CefrProgressReport into PlayerProfile route/tab
  → UNBLOCKS: CEFR progress reports, shareable social cards
```

---

## Persistence Decisions

| Slice | Storage | Rationale |
|-------|---------|-----------|
| placementSlice | localStorage | Small, infrequently written, needs cross-session durability |
| cefrProgressSlice | localStorage | Small, infrequently written |
| skillTree (existing) | localStorage | Already in whitelist — correct, no change |
| grammar (existing) | localStorage | Already in whitelist — correct, no change |
| achievements (existing) | localStorage | Already in whitelist — correct, no change |

No new IndexedDB keys. Total new localStorage footprint: ~5KB worst case.

---

## Integration Risk Points

1. **Achievement middleware re-entrancy with grammar fix:** When `grammar/completeLesson` is added to `ACTION_TO_ACHIEVEMENT_TYPES`, `isAchievementMet` must read `state.grammar.completedLessons.length`. This requires adding `grammar` to the destructured state in `isAchievementMet()`. The existing re-entrancy guard (`_isProcessingAchievements`) already protects against cascade.

2. **Placement batch dispatch performance:** `completePlacement` may trigger 10-20 `completeLesson` dispatches and 6 `addSkillXP` dispatches in sequence. Use `batch()` from react-redux to group these, or dispatch a single `placement/applyGrants` action and handle all grants inside `learningProgressMiddleware` with one `batch()` call. This avoids 20 React re-renders.

3. **grammar.js total count drives selectGrammarProgress:** The selector uses `grammarLessons.length` as the denominator. When lessons expand from 47 to 50, all existing players' displayed percentage drops (was 7/7 = 100%, now becomes 7/50 = 14%). This is expected behavior. Display a brief "New content added" toast on first load after expansion — wire this to a worldState flag or migration step.

4. **SocialShareCard canvas export:** `html2canvas` adds ~80KB to the bundle. Use `<canvas>` with native 2D API instead (draws text + Arabic word count with Arabic numerals via existing `arabicNumbers.js`). Avoids new dependency.

5. **Adaptive difficulty and FSRS interaction:** The adaptive difficulty tier controls WHICH words are shown (difficulty weighting). FSRS controls WHEN those cards are due. These are orthogonal — adaptive difficulty only applies to new/due word selection in QuizOverlay sessions, not the ReviewSession. No conflict.

6. **Skill tree node rewards `unlock_content` type:** Several nodes have `rewards: { type: 'unlock_content', value: 'beginner_passages' }`. The content identifiers (beginner_passages, story_library, verb_drills, etc.) are not currently wired to any actual content. For v12.0, wire these to EventBus `QUIZ_TYPE_UNLOCKED` or a worldState flag. The content itself (story_library, news_feed, etc.) is out of scope — the unlock is tracked in state, content will render in future phases.

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Existing slice/middleware inventory | HIGH | Read all source files directly |
| achievement bug (grammar_lessons never fire) | HIGH | Verified ACTION_TO_ACHIEVEMENT_TYPES — key missing |
| grammar.js lesson count (47, not 50) | HIGH | Counted lesson objects in file |
| Quiz types (12 exist, 6 new needed) | HIGH | Read QuizOverlay.jsx QUIZ_TYPE_LABELS + components directory |
| Storage tier decisions | HIGH | Verified current persist config in store.js |
| New slice state shapes | MEDIUM | Designed to match existing patterns — final shape may evolve in implementation |
| Placement test question count (20-30) | MEDIUM | Derived from CEFR band coverage — exact count a design decision |
| Social share implementation (native canvas) | MEDIUM | html2canvas alternative viable but avoid new dep |
