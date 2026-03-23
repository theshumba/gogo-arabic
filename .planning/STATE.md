---
gsd_state_version: 1.0
milestone: v13.0
milestone_name: Systems Polish & Immersion
status: ready_to_plan
stopped_at: v13.0 roadmap created — Phase 65 ready to plan
last_updated: "2026-03-23"
progress:
  total_phases: 7
  completed_phases: 0
  total_plans: 16
  completed_plans: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-22)

**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"
**Current focus:** Phase 65 — bundle-optimization

## Current Position

Phase: 65 of 71 (Bundle Optimization)
Plan: Not started
Status: Ready to plan
Last activity: 2026-03-23 — v13.0 roadmap created, 18 requirements mapped across 7 phases

Progress: [░░░░░░░░░] 0% (v13.0)

### Shipped Milestones

| Version | Phases | Plans | Date |
|---------|--------|-------|------|
| v2.0 Player Experience | 1-9 | 14 | 2026-02-08 |
| v3.0 Infrastructure | 10-11 | 11 | 2026-02-09 |
| v4.0 Game Soul & Polish | 14-18 | 8 | 2026-02-10 |
| v5.0 The Real Game | 19-26 | 18 | 2026-02-11 |
| v6.0 Combat & RPG | 27.1, 28-30 | 16 | 2026-02-13 |
| v6.1 Crafting & Advanced Combat | 31-32 | 19 | 2026-02-18 |
| v7.0 World & Content | 33-37 | 18 | 2026-03-16 |
| v8.0 Visual Overhaul | 38-43 | ~18 | 2026-03-18 |
| v9.0 Content Depth | 44-46 | 9 | 2026-03-18 |
| v10.0 Onboarding | 47 | 3 | 2026-03-19 |
| v11.0 Deep Systems | 50-55 | 25 | 2026-03-21 |
| v12.0 Learning Systems | 56-64 | 22 | 2026-03-23 |

**Cumulative:** 64 phases, 185+ plans, 12 milestones

## Accumulated Context

### Key v12.0 Context

- isFsrsDue/getDistractorTier/pickDistractors exported as pure functions from useQuiz.js (59-01) — testable without React
- quizState now has clusterAccuracy{}, fsrsDueOverride, distractorTier — all reset on close() (59-01)
- pickDistractors easy tier guarantees count-1 cross-category words via explicit partition (not pool shuffle) (59-01)
- getRetrievability(card, now) exported from fsrs.js — returns 0-1 float via scheduler.get_retrievability(card, now, false) (59-01)
- 17 adaptive tests in src/hooks/__tests__/useQuiz.adaptive.test.js — all passing (59-01)
- QUIZ_TYPE_REGISTRY in src/data/quizTypes.js — 18 types (12 active + 6 Phase 60 stubs at minLevel 999) (59-02)
- selectQuizTypeForPlayer pure function: 70% grammar bias when grammar cluster < 70% after 3+ questions (59-02)
- CLUSTER_MAP removed from useQuiz.js — replaced by QUIZ_TYPE_REGISTRY[type]?.cluster lookup (59-02)
- lockedType in quizState: null = adaptive routing, non-null = caller-locked type preserved through session (59-02)
- QuizOverlay QUIZ_TYPE_LABELS derived from QUIZ_TYPE_REGISTRY — single source of truth for type names (59-02)
- 16 quiz type tests in src/data/__tests__/quizTypes.test.js — all passing; full suite 1257 tests green (59-02)
- GrammarFill.jsx shipped (60-01): 15 VERB_PARADIGMS (كَتَبَ/ذَهَبَ/قَرَأَ/فَهِمَ/سَكَنَ/سَافَرَ), wired into useQuiz+QuizOverlay, 5 tests pass
- GrammarFill grading: choices.find(c => c.correct)?.value NOT word.arabic — conjugated form ≠ dictionary form (60-01)
- GrammarFill minLevel: 4 (was 999 stub) — active in adaptive routing for level 4+ players (60-01)
- VERB_PARADIGMS exported from GrammarFill.jsx, imported by useQuiz.js — co-located with component (60-01)
- paradigmContext shape: { verb, root, meaning, paradigm, pronoun } — embedded in each choice option by buildChoices (60-01)
- WordOrder.jsx shipped (60-02): tile-click sentence ordering, "Arrange the words in the correct Arabic word order:", minLevel:5 cefrMin:B1
- ClozePassage.jsx shipped (60-02): passage-with-blank fill, "Read the passage and fill in the blank:", fallback when no exampleSentence, minLevel:4 cefrMin:A2
- SentenceBuilder.jsx latent bug fixed (60-02): tile options are objects {label,value,correct,tile} — extract .label for display, .value for answer
- QUIZ_TYPE_REGISTRY Phase 60 complete: GrammarFill (minLevel:4 cefrMin:A2), ClozePassage (minLevel:4 cefrMin:A2), WordOrder (minLevel:5 cefrMin:B1) all active
- QUIZ_TYPE_REGISTRY deferred: DialectIdentify/RootExpand/CulturalContext at minLevel:999 cefrMin:B2
- 22 quiz type tests in quizTypes.test.js (was 16 — 6 new CEFR routing tests added); 1278 total tests passing (60-02)
- PLACEMENT_ITEMS: 30 calibrated CAT items spanning Pre-A1..B1 across 6 domains (61-01)
- PLACEMENT_LEVELS = ['Pre-A1', 'A1', 'A2', 'B1'] — B1 is the placement cap (61-01)
- placementEngine.js: 7 pure functions — selectNextItem (IRT, 20-item cap), computeRawScore, assignCefrLevel (conservative one-level-lower, B1 cap), dropOneTier (A1=floor), shouldEarlyExit (10 consecutive correct), deriveGrammarUnlocks, deriveSkillTreeUnlocks (61-01)
- PLACEMENT_CEFR_ORDER = {Pre-A1:0, A1:1, A2:2, B1:3} defined locally — does NOT touch CEFR_ORDER in quizTypes.js (61-01)
- assignCefrLevel(30,30) = {rawLevel:'B1', assignedLevel:'A2', storedLevel:'A2'} — confirmed (61-01)
- dropOneTier floor: A1→A1 (and Pre-A1→Pre-A1); idx<=1 check (61-01)
- deriveGrammarUnlocks returns contiguous lessons from order 1 up to assigned CEFR level — avoids unlock chain gaps (61-01)
- deriveSkillTreeUnlocks sorts nodes by xpCost asc per tree; grammar_01/02 at A1, grammar_03 at A2 (61-01)
- 1358 total tests passing (was 1336) — 22 new PlacementTestOverlay integration tests (61-02)
- PlacementTestOverlay.jsx: 3-phase overlay (intro/testing/result), own state machine, does NOT call useQuiz (61-02)
- MainMenu auto-shows PlacementTestOverlay when hasCharacter && !hasCompletedPlacement via useEffect (61-02)
- handlePlacementComplete dispatches recordPlacementResult + setCefrLevel; grammar/skill-tree fan-out deferred to 61-03 (61-02)
- feedbackTimerRef clears on unmount to prevent setState on unmounted component (61-02)
- 1336 total tests passing (was 1278) — 58 new placement tests (61-01)
- grammar.js now has 50 lessons: 20 A1/A2 (Phase 58) + 13 B1 + 17 B2 (Phase 62) — all fully populated (62-01)
- grammar.js had 43 lessons after Phase 58 structural fix; 7 new B2 lessons added in Phase 62 to reach 50
- All 50 lessons: 12+ exercises, 4+ distinct types, 4+ quiz questions — CEFR A1-B2 covered (62-01)
- grammarChecker.test.js now validates all 50 lessons (was A1/A2 only); 23 tests pass (62-01)
- CEFR_GRAMMAR_GATES in grammarSlice.js: A1/A2=0, B1=3, B2=5 — skill tree node count gate (62-02)
- selectLessonsByCategory annotates isCefrLocked, cefrGateLevel, currentTreeLevel on each lesson (62-02)
- isUnlocked = unlockedLessons.includes(id) && cefrUnlocked — CEFR gate fully enforced at selector level (62-02)
- GrammarModule LessonCard shows 'Requires Grammar Tree Level X' badge (brown #8B4513) for CEFR-locked lessons (62-02)
- GrammarModule new-content toast: fires when localStorage gogo_grammar_lesson_count increases (62-02)
- grammarSlice.test.js: 55 tests (was 47; 8 new CEFR gating tests added) (62-02)
- GRAM-03 requirement: B1/B2 CEFR gating — SATISFIED (Phase 62 complete)
- grammar.js was 47 lessons (not 50 as documented) — now 43 after structural fix
- grammar.js had structural bug: 40 lessons were in grammarCategories, not grammarLessons — FIXED (58-01)
- 20 A1-A2 lessons now fully populated: 12+ exercises, 4+ types, 4+ quiz questions each (58-01)
- 9 new exercise types in ExerciseStage.jsx: conjugation-drill, sentence-transformation, word-order, error-identification, multiple-select, true-false, cloze, classify, build-sentence (58-01)
- grammar.js was 47 lessons (not 50 as documented) — now 43 after structural fix
- grammar_lessons achievement never fires — ACTION_TO_ACHIEVEMENT_TYPES missing 'grammar/completeLesson' mapping in achievementMiddleware
- CURRENT_VERSION is 12 (set in Phase 58-02 for grammar.unlockedLessons init)
- grammarSlice has unlockedLessons: ['al-definite'] initial state + unlockNextLesson reducer (58-02)
- learningProgressMiddleware now dispatches unlockNextLesson after grammar/completeLesson (58-02)
- GrammarModule LessonCard shows Locked/New/Completed badges; locked lessons non-clickable (58-02)
- Migration 12 initializes unlockedLessons for existing players from completedLessons (58-02)
- Two new Redux slices added: placementSlice + cefrProgressSlice (both write-once-per-session, no live CEFR regression)
- learningProgressMiddleware now POPULATED (Phase 57-01) — 6 XP routing rules active
- recharts v3.8.0 is the ONE new npm install — React 19 peer dep confirmed; lazy-load in charts-vendor chunk
- html-to-image v1.11.13 is conditional (only if social card needs character art — SVG-only is preferred)
- Skill trees now at 30 nodes each (Phase 57-01 complete) — expanded from 10-12 nodes
- initializeSkillTree wired in main.jsx via persistor.subscribe — idempotent bootstrap for v11.0 saves
- Placement test cap: B1 maximum; default one level below raw score; "Start Lower" escape hatch required
- Achievement expansion: 206 new entries, ship 80-100 meaningful at launch + remainder in patches
- Grammar lesson ID migration: lesson_0 → lesson_verb_present etc. — must complete before any new lesson is authored
- poetry.completedBattles (not poetry.history) — confirmed from poetrySlice.js
- state.quests (not state.quest) — confirmed from store.js rootReducer key mapping
- SkillTreeView (Phase 57-03) is lazy-loaded — code-split chunk, only loaded when player opens skill tree menu
- Frontier nodes (next 1-2 reachable) have pulsing gold highlight; deeply locked nodes collapsed into summary count

### Decisions

| Decision | Context |
|----------|---------|
| Compute distractorTier at loadQuestion call time (not from quizState) | React state batching would cause stale tier if read from quizState inside loadQuestion |
| Easy tier uses explicit partition (not pool shuffle) | pool shuffle allows all-same-category result; partition guarantees count-1 cross-category |
| CLUSTER_MAP replaced by QUIZ_TYPE_REGISTRY[type]?.cluster | QUIZ_TYPE_REGISTRY is canonical; CLUSTER_MAP removed in 59-02 |
| clusterAccuracy resets on close() | Session-ephemeral data; cross-session persistence out of scope per REQUIREMENTS.md |
| GRAM-01/GRAM-03 assigned to Phase 62 | Success criterion (50 lessons, CEFR gates) only fully TRUE after B1-B2 content ships |
| GRAM-02/GRAM-04 assigned to Phase 58 | 12 exercise types + XP wiring verifiable with A1-A2 lessons alone — SHIPPED |
| order-based unlock in unlockNextLesson | Sorts all grammarLessons by order field — works regardless of category |
| migration 12 conservative unlock | al-definite + all completed + one ahead of highest; middleware handles future unlocks |
| Phase 59 (adaptive) before Phase 60 (quiz types) | New quiz types must inherit adaptive behavior from day one |
| GrammarFill grading via choices.find not word.arabic | Conjugated form != dictionary form; choices carry source of truth for correct answer |
| VERB_PARADIGMS co-located in GrammarFill.jsx | Paradigm data lives next to component; exported for useQuiz.js import |
| GrammarFill minLevel 4 (not 999) on ship | Matches conjugation gate; unlocked for level 4+ players immediately |
| Tile bank options are objects not strings | buildChoices returns {label,value,correct,tile} — component extracts .label/.value; same fix in SentenceBuilder |
| Deferred types cefrMin updated to B2 | DialectIdentify/RootExpand/CulturalContext uniformly gated at B2; was B1/A2 (inconsistent) |
| Phase 61 depends on both Phase 58 and 59 | Grammar content for CAT questions + adaptive engine for item selection |
| Phase 63 last before display layer | All achievement event sources must exist before conditions are authored |
| state.grammar accessed directly in isAchievementMet (not destructured) | Keeps diff minimal per plan spec; consistent with surgical change approach |
| migrations object exported separately from migrate | Enables unit tests to instantiate single-migration runners via createMigrate({ N: migrations[N] }) |
| Migration tests use currentVersion=N (not N-1) | redux-persist createMigrate skips migration when inboundVersion === currentVersion; must pass target version |
| placement + cefrProgress use localStorage (not IndexedDB) | Write-once-per-session slices are lightweight; IndexedDB tier reserved for heavy data (vocabulary, battle, magic, inventory, crafting) |
| learningProgressMiddleware is last in .concat() chain | Processes learning events after all reward/state middleware; ready for Phases 57-59 population |
| bulkUnlockNodes bypasses XP deduction | Used exclusively by initializeSkillTree — avoids XP math complications during bootstrap |
| initializeSkillTree gated on skillXP > 0 OR unlockedNodes.length > 0 | Dual guard prevents double-init across both fresh and returning player paths |
| unlock_spell/dialogue/zone/npc_branch placed at C2 nodes | Terminal-tier rewards for SKILL-03 upstream content dispatch |
| unlock_zone/dialogue/npc_branch use distinct setFlag key prefixes | zone_access_/dialogue_/npc_branch_ prevent namespace collisions in worldState.flags |
| unlock_spell dispatches discoverRoot with element: 'earth' | Element is cosmetic/not skill-tree-gating-critical; 'earth' is a valid ROOT_ELEMENTS value |
| skillTreeUnlocked exposed as full unlockedNodes map in actionContext | Avoids per-tree selector calls at context-build time; ActionSetExecutor reads [treeId].length |
| frontierNodeIds limited to slice(0,2) | Plan specifies 1-2 reachable nodes; keeps UI focused on immediate goals |
| dropOneTier A1 as floor (idx <= 1) | storedLevel maps Pre-A1→A1; user can never be placed below A1 in practice |
| PLACEMENT_CEFR_ORDER local 4-level map | CEFR_ORDER in quizTypes.js has no Pre-A1; modifying it would break 22 existing tests |
| bulkUnlockLessons mirrors bulkUnlockNodes | idempotent, no XP deduction, no middleware side effects — placement pre-unlock pattern (61-03) |
| handleRetakeSkip records A1 fallback | player who starts retake but skips overlay gets A1 not null placement state (61-03) |
| No batch() import in fan-out dispatch | React 18 auto-batches sequential dispatch() calls in event handlers (61-03) |

- [Phase 63]: tier field computed from RARITY_TO_TIER at data-definition time (not runtime)
- [Phase 63]: RARITY_TO_TIER: common/uncommon->Bronze, rare->Silver, epic->Gold, legendary->Legendary
- [Phase 63]: quizTypeStats initialized as {} in stats — per-type entries created lazily on first dispatch
- [Phase 63]: recordQuizTypeResult dispatch in useQuiz.js fires for ALL quiz completions (perfect: false resets streak)
- [Phase 63]: SKILL_TREES imported into middleware for skill_tree_complete node count — avoids hardcoding 30
- [Phase 63]: Suspense fallback=null for AchievementPanel — panel has its own overlay backdrop, no spinner needed
- [Phase 63]: cardInfo div wraps cardRarity and tierBadge for horizontal rarity/tier row in AchievementCard

- [Phase 64-01]: recharts v3.8.0 in charts-vendor chunk — React 19 peer dep confirmed; RadarChart + LineChart in CefrProgressReport
- [Phase 64-01]: recordCefrSnapshot write-once-per-day guard + forward-only CEFR rank guard — no regression possible
- [Phase 64-02]: CEFR_MILESTONE_REACHED event (not INK_DIALOGUE_START) — middleware cannot create async InkDialogueEngine; DialogueOverlay handles async load + re-emit
- [Phase 64-02]: setFlag ink external binding in InkDialogueEngine — ink scripts call ~ setFlag("key") to dispatch worldStateSlice
- [Phase 64-03]: SocialShareCard non-lazy in CefrProgressReport — parent already lazy-loaded; SVG-only avoids html-to-image dependency
- [Phase 64-03]: handleShare tries navigator.share first, silent fall-through on cancel to clipboard.writeText
- [Phase 64-03]: z-index 1100 for SocialShareCard backdrop — sits above CefrProgressReport at z-index 1000

- [Phase 62]: Grammar expanded to 50 lessons (13 B1 + 17 B2) — GRAM-01 requirement now satisfied
- [Phase 62]: All 50 lessons pass grammarChecker.test.js data integrity suite (23 tests)
- [Phase 62]: conjugation-drill 'future' paradigm not needed — jussive/subjunctive drills use 'present' or 'past'
- [Phase 62-02]: CEFR gate enforced at selectLessonsByCategory level — unlockNextLesson remains reducer-only, no skillTree access needed
- [Phase 62-02]: CEFR_GRAMMAR_GATES: A1=0, A2=0, B1=3, B2=5 — gates represent Grammar skill tree unlocked node count
- [Phase 62-02]: Brown #8B4513 for CEFR-locked badge distinguishes skill-tree gate from regular content lock (#666)
- [Phase 62-02]: localStorage key 'gogo_grammar_lesson_count' stores lesson count; storedCount>0 guard prevents first-load toast

### Blockers/Concerns

- None

### Pending Todos

- Post-v8.0: SignPanel + ObjectPanel (React to Phaser NineSlice migration) deferred
- Post-v8.0: kenmi-ui-frames-sheet spritesheet registration in BootScene
- Post-v8.0: Delete inert old placeholder .png files in public/assets/sprites/objects/

## Session Continuity

Last session: 2026-03-23
Stopped at: Roadmap created for v13.0 — 7 phases (65-71), 18 requirements mapped, 16 plans estimated
Resume file: None — ready to plan Phase 65
Next plan: `/gsd:plan-phase 65`
