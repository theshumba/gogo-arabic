# Project Research Summary

**Project:** Gogo Arabic — v12.0 Learning Systems
**Domain:** Arabic Learning RPG — CEFR-aligned skill progression, adaptive quizzing, grammar expansion, placement testing, achievement systems
**Researched:** 2026-03-22
**Confidence:** HIGH

## Executive Summary

Gogo Arabic v12.0 extends a mature 196K+ LOC codebase with seven interconnected learning systems: 6 skill trees with unlockable node progression, grammar expansion from 7 to 50 lessons, quiz expansion from 6 to 18 types, an adaptive difficulty engine, a CEFR diagnostic placement test, achievement expansion from 44 to 250+, and CEFR progress reports with social sharing. The foundational infrastructure — Redux Toolkit (31 slices), ts-fsrs (5,029 words with CEFR tags), FSRS scheduling, quiz rendering, grammar lesson system, and achievement middleware — already exists and is proven at scale. The dominant build pattern is data expansion and logic extension on existing systems, not new architecture. Only one new npm package is required (`recharts` v3.8.0 for assessment dashboard charts), and two new Redux slices are needed (`placementSlice` and `cefrProgressSlice`).

The recommended build order is dependency-driven: fix existing bugs first (grammar achievement mapping missing, lesson count is 47 not 50), then skill tree infrastructure (all other features surface through or are gated by trees), then grammar expansion at A1-A2, then adaptive difficulty engine, then quiz expansion, then placement test, then B1-B2 grammar, then achievement expansion, and finally CEFR reports and social sharing. This order ensures adaptive difficulty is in place before new quiz types launch and grammar content exists before the placement test uses it. The pre-existing grammar_lessons achievement bug must be fixed in Wave 1 before any new achievement work begins.

The primary risks are data integrity and UX quality. Save data migration is non-negotiable: any new persisted Redux slice without a migration function crashes existing players on first load. Skill trees must auto-unlock nodes for content existing players have already mastered, not gate it retroactively. The adaptive difficulty engine must treat FSRS-due cards as always eligible (format-only adaptation, never a scheduling override). The placement test must default to placing players one level below raw score to avoid the documented 62% over-placement problem. Achievement expansion must be tiered and quality-gated — shipping all 250 at once dilutes motivational value. These five risks appear across all four research files as the most critical implementation constraints.

---

## Key Findings

### Recommended Stack

The v12.0 stack is the existing stack plus one new package. All seven feature systems are buildable with the already-installed React 19 + Redux Toolkit + ts-fsrs + Phaser 3 + Framer Motion + inkjs combination. No structural changes are needed.

**Core technologies:**
- `recharts` v3.8.0 — radar charts for skill distribution, line charts for CEFR progression in assessment dashboard. Only confirmed new install. React 19 peer dependency explicitly confirmed via npm registry.
- `html-to-image` v1.11.13 — conditional; only if social share card is in scope. Preferred over unmaintained `html2canvas` for correct RTL Arabic text handling via SVG foreignObject.
- `@reduxjs/toolkit` v2.11.2 — two new slices (`placementSlice`, `cefrProgressSlice`) and one new middleware (`learningProgressMiddleware`) follow the established 31-slice, 5-middleware pattern.
- `ts-fsrs` v5.2.3 — FSRS card state and CEFR tag data are the primary signals for adaptive difficulty. No API changes needed.
- `vite.config.js` — add `charts-vendor` and `share-vendor` manual chunk entries to keep initial bundle unaffected by recharts (~180KB) and html-to-image (~40KB).

**What NOT to install:** react-flow (overkill for linear tier list nodes), dnd-kit (SentenceBuilder already exists), NLP libraries (custom `GrammarChecker.js` with lookup tables is sufficient for finite A1-B2 rules), TensorFlow (FSRS stability scores are enough for adaptive difficulty), Recharts v2.x (React 19 incompatible — v3.8.0 only), XState (placement test is 20-30 linear questions, not a complex state machine).

### Expected Features

**Must have (table stakes):**
- Skill trees (6 trees: Reading, Writing, Listening, Conversation, Grammar, Culture) with node unlock progression, prerequisite validation, and CEFR-gated tiers. Players who chose Scholar/Traveler/Historian path expect that choice to manifest as visible, branching specialization. Without trees, the paths are cosmetic labels.
- Grammar expansion to 50 lessons covering A1-B2 with 12 exercise types per lesson. 7 lessons for a system claiming A1-B2 coverage is sparse; intermediate players have vocabulary they cannot use grammatically.
- Adaptive difficulty engine across all 18 quiz types. Word Duel battles already have adaptive difficulty (v1.0 feature); not extending this to all quiz types creates inconsistent experience.
- CEFR diagnostic placement test (15-20 questions, CAT algorithm, 5-8 minutes). Without it, new players start at A1 regardless of prior knowledge. Research confirms 62% of learners self-place a full level too high.
- Achievement expansion (44 to 250+). With 5,029 vocabulary words, 52 quests, 50 grammar lessons, and 6 skill trees, 44 achievements is sparse. Achievement-earners are 30% more likely to complete language courses.

**Should have (differentiators):**
- Skill tree nodes that unlock RPG abilities (new spells, dialogue options, boss finishers) — not just content gates. This bridges language progress with gameplay feeling different.
- Learning path specialization in tree shape: Scholar sees Grammar tree expanded, Traveler sees Conversation expanded, Historian sees Culture expanded.
- CEFR Progress Reports delivered as in-world "Scholar's Scroll" via Amira's inkjs dialogue. Same data, emotionally resonant delivery reusing existing ink integration.
- Social "I learned X Arabic words" shareable card — Duolingo's Year in Review virality model, implemented client-side with SVG-only design.

**Defer to v13.0:**
- Audio-dependent quiz types (listening comprehension, dictation) — only if TTS infrastructure exists; do not block milestone.
- Three lower-priority quiz type components (DialectIdentify, RootExpand, CulturalContext) — depend on B2/C1 nodes most players won't reach in MVP.
- Skill tree respec via learning path change.
- CEFR writing assessment with open-ended Arabic composition grading — requires NLP infrastructure.

**Anti-features (do not build):**
- Free-form skill point allocation — breaks pedagogical sequencing; gate nodes by CEFR level achieved, not arbitrary point spend.
- LLM-generated quiz questions — Arabic grammar accuracy unreliable; all questions from 5,029-word vetted vocabulary.
- Voice recognition quiz type — explicitly out of scope; Arabic phoneme accuracy issues (emphatics, pharyngeals, uvulars).
- Time-spent-only achievements — decouples reward from learning; all achievements require demonstrated mastery.
- Competitive leaderboards for achievements — negative effects on educational completion for non-top-performers.

### Architecture Approach

The architecture is extension-first: 2 new Redux slices, 1 new middleware, 3 new data files, and 6 new React components added to an already-functional system. The major integration pattern is action-triggered middleware (same as battleRewardsMiddleware and factionMiddleware) routing cross-system XP and CEFR advancement. Two critical existing systems need targeted fixes before feature work: the grammar_lessons achievement bug (action mapping missing from `achievementMiddleware`) and grammar lesson ID migration from numeric indices to string slugs.

**Major components:**
1. `placementSlice` + `PlacementTestOverlay.jsx` — diagnostic test state machine, reuses existing quiz type components, writes to cefrProgressSlice and skillTreeSlice on completion via batch dispatch in middleware.
2. `cefrProgressSlice` + `CefrProgressReport.jsx` — canonical write-once-per-session CEFR level with historical snapshots; feeds progress report and social card. Level stored as snapshots, never live-computed, preventing backwards regression.
3. `learningProgressMiddleware` — cross-system routing: grammar completion → Grammar skill XP, skill node unlock → player XP reward, placement completion → batch grants + CEFR level set. Kept separate from `achievementMiddleware` to avoid ballooning that file's switch/case table.
4. `QUIZ_TYPE_REGISTRY` in `quizTypes.js` — 18 quiz type metadata with `minLevel`/`cefrMin` gates; higher quiz types unlock as player CEFR advances.
5. Extended data files — `grammar.js` (47 → 50 lessons), `skillTrees.js` (~10-12 nodes per tree → 30 per tree), `achievements.js` (+206 entries in existing 20-category schema).

**Key data flows:**
- FSRS card stability drives adaptive quiz difficulty. FSRS-due cards are always eligible; adaptive engine controls question format and distractor difficulty only.
- Placement test result fans out via `react-redux batch()` in `learningProgressMiddleware` to avoid 20 cascading React re-renders.
- CEFR level is write-once-per-session, stored as snapshots, preventing the "level went backwards" trust problem in progress reports.
- `achievementMiddleware` re-entrancy guard already exists — all 206 new achievements must route through it, checking `grantedAt` before firing.

### Critical Pitfalls

1. **Save data breaks without migration** — Every new persisted Redux slice must bump `persistConfig.version` and include a migration function seeding default state. Test against a real v11.0 save snapshot before shipping. Consequences if missed: white-screen crash or silent data loss for all existing players.
2. **Skill trees retroactively locking already-mastered content** — On first initialization, run `initializeSkillTree(existingPlayerState)` to auto-unlock nodes the player already satisfies via FSRS mastery, quest completion, and CEFR level. Trees must reflect mastery, not gate it.
3. **Adaptive difficulty overriding FSRS scheduling silently** — FSRS-due cards are always eligible regardless of adaptive difficulty band. Without this rule, FSRS retention rates degrade silently as the adaptive engine filters out due cards. Add `fsrs_override: true` flag to quiz session items from the FSRS due queue.
4. **Placement test over-placing players** — Default placement one level below raw score. Include at least one productive question type (not only multiple-choice recognition). Always offer "Start Lower" escape hatch. Cap initial placement at B1. Recognition tests systematically overestimate ability; 62% over-placement documented in European Language Council research.
5. **Achievement dilution from shipping all 250 at once** — Tier the system (Bronze/Silver/Gold/Legendary). Ship 80-100 meaningful achievements at launch, add the rest in content patches. Apply the clarity test: does this achievement teach a mechanic, reward a distinct milestone, or celebrate mastery? If not, cut it.
6. **Grammar lesson ID references breaking at scale** — Existing numeric IDs (lesson_0 through lesson_6) in quest triggers, ink dialogue, and FSRS sync will collide when ordering changes. Migrate to string slug IDs before authoring any new lesson.
7. **Social share card CORS failure in production** — Design the card using only inline SVG, CSS gradients, and text — no external image dependencies. Canvas is tainted by any cross-origin image. Test specifically in production build with assets at real CDN URLs.

---

## Implications for Roadmap

Based on combined research, the dependency graph drives a clear 9-phase build sequence. The critical constraint: adaptive difficulty engine and skill tree infrastructure must be early because grammar, quiz expansion, and achievements all depend on them. Two pre-existing bugs must be fixed before any new feature work begins.

### Phase 1: Bug Fixes and Migration Foundation
**Rationale:** Two pre-existing issues block downstream work. The grammar_lessons achievement mapping is missing from `achievementMiddleware` — grammar achievements have never fired. Grammar lesson count is 47, not 50 as documented. These must be fixed before any new feature is authored. Migration foundation prevents save data crashes for all subsequent phases.
**Delivers:** `grammar/completeLesson` wired in `achievementMiddleware.ACTION_TO_ACHIEVEMENT_TYPES`; grammar lesson slug ID migration (lesson_0 → lesson_verb_present etc.); `placementSlice` + `cefrProgressSlice` registered in store.js with `persistConfig.version` bump and migration function; `learningProgressMiddleware` scaffolded.
**Avoids:** Pitfalls 1, 6, 12 (save data breaks, broken lesson references, double-grants on hydration).

### Phase 2: Skill Tree Infrastructure
**Rationale:** All other v12.0 features surface through or are gated by skill trees. Grammar lessons unlock via tree nodes; quiz difficulty ceiling comes from tree level; achievements require tree completion events; placement test results feed tree unlock state. Must come before grammar expansion, quiz expansion, or placement test.
**Delivers:** Skill tree nodes expanded from ~10-12 to 30 per tree; `initializeSkillTree(existingPlayerState)` for existing players; SkillTreeView with progressive disclosure UI (one tree at a time, collapsed locked branches, next 1-2 unlockable nodes highlighted); learning path branch differentiation (Scholar/Traveler/Historian-specific nodes per tree).
**Avoids:** Pitfalls 2 and 9 (retroactive content locking for existing players; visual overwhelm from 6 trees simultaneously).

### Phase 3: Grammar Expansion A1-A2
**Rationale:** Grammar tree (Phase 2) provides the gating structure; now populate its first tier. A1-A2 first (lower content risk, validates lesson schema) before B1-B2. Grammar content is required for the placement test's grammar section (Phase 6).
**Delivers:** 20 new lessons (bringing A1-A2 total to ~27 lessons), 12 exercise types per lesson including conjugation drill, fill-in-blank, sentence transformation; `GrammarChecker.js` utility (rule-based lookup, no NLP library); `vocabulary_prerequisites` field per lesson validated against 5,029-word dataset at build time.
**Avoids:** Pitfall 11 (grammar vocabulary disconnected from player's known words).

### Phase 4: Adaptive Difficulty Engine
**Rationale:** Must be in place before quiz expansion ships — otherwise all 12 new quiz types launch at fixed difficulty, creating poor UX from day one. Also required by the placement test CAT item selection algorithm.
**Delivers:** Rolling accuracy tracker in `useQuiz.js` (local state, session-only, not Redux-persisted); `QUIZ_TYPE_REGISTRY` with `minLevel`/`cefrMin` gates; adaptive tier (1-5) feeding existing `wordSelection.js selectWordsByDifficulty`; per-content-cluster difficulty tracking (not a single global average). Priority hierarchy: FSRS-due cards always eligible; adaptive engine controls format only.
**Avoids:** Pitfall 3 (adaptive difficulty overriding FSRS scheduling), Pitfall 10 (convergence to a single difficulty plateau).

### Phase 5: Quiz Expansion (Core 3 New Types)
**Rationale:** Adaptive engine (Phase 4) is in place. Start with the three buildable new types (GrammarFill, WordOrder, ClozePassage). Three deferred components (DialectIdentify, RootExpand, CulturalContext) depend on B2/C1 tree nodes most players won't reach in MVP — defer to Phase 7 or v13.0.
**Delivers:** `GrammarFill.jsx`, `WordOrder.jsx` (extends existing SentenceBuilder), `ClozePassage.jsx`; `quizTypes.js` registry with all 18 types defined including deferred types; CEFR-gated unlock behavior wired so higher quiz types appear as player advances.
**Uses:** Existing `QuizOverlay.jsx` switch pattern, existing `SentenceBuilder.jsx` drag-and-drop.

### Phase 6: CEFR Placement Test
**Rationale:** Adaptive engine (Phase 4) provides CAT item selection. Grammar content (Phase 3) provides grammar section questions. Skill tree (Phase 2) is ready to receive placement result and unlock the appropriate tier.
**Delivers:** `PlacementTestOverlay.jsx` (reuses existing quiz type components); `placementTest.js` (20-30 calibrated questions spanning Pre-A1 through B1 across all 6 tree domains); `placementEngine.js` (30-line IRT binary search); self-select prior knowledge option ("I've studied Arabic before" skips to A2 start); early-exit at 10 consecutive B1 correct; "Start Lower" escape hatch on results screen; cap at B1 maximum.
**Avoids:** Pitfalls 4 and 13 (over-placement causing first-session churn; advanced learner forced through A1 questions).

### Phase 7: Grammar Expansion B1-B2
**Rationale:** A1-A2 lessons (Phase 3) are live and the lesson schema is validated in production. B1-B2 extends the same pattern with 30 more lessons. Kept separate to reduce content risk per phase.
**Delivers:** 30 new B1-B2 lessons (total: 50 lessons), completing `selectGrammarProgress` to 100%. "New content added" toast for existing players whose displayed percentage will drop from ~94% to ~56% on first load after expansion.

### Phase 8: Achievement Expansion
**Rationale:** Must be late — achievements trigger on all prior systems. All event sources (skill tree, grammar, quiz, placement) must exist before achievement conditions can be authored accurately.
**Delivers:** 206 new achievement entries in existing 20-category schema; new `isAchievementMet()` requirement types for `skill_tree_nodes`, `skill_tree_complete`, `quiz_type_streak`, `cefr_level_reached`, `placement_complete`; `quizTypeStats` field in `achievementSlice.stats`; tiered system (Bronze/Silver/Gold/Legendary). Ship 80-100 at launch; remainder in content patches.
**Avoids:** Pitfalls 5 and 12 (achievement dilution from all 250 at once; double-grants — all new achievements route through existing `achievementMiddleware` with `grantedAt` check).

### Phase 9: CEFR Progress Reports and Social Sharing
**Rationale:** Requires all upstream data: placement baseline, grammar completion data, FSRS aggregation by CEFR tier, skill tree strength data. Purely a reading/display layer — no writes back to upstream state.
**Delivers:** `CefrProgressReport.jsx` with recharts `RadarChart` (skill distribution) + `LineChart` (CEFR over time), both lazy-loaded in `charts-vendor` chunk; Scholar's Scroll ink dialogue for CEFR milestone moments (reuses Amira companion + existing inkjs v11.0); `SocialShareCard.jsx` (SVG-only, no external image dependencies; Web Share API with clipboard copy fallback for desktop).
**Uses:** `recharts` v3.8.0 (the one new npm install); `html-to-image` v1.11.13 (conditional — only if character images needed on card).
**Avoids:** Pitfall 7 (CORS canvas failure — SVG-only card design), Pitfall 8 (CEFR level going backwards — write-once-per-session snapshot model).

### Phase Ordering Rationale

- Phase 1 fixes two active bugs that would cause silent failures downstream and lays the Redux migration foundation that every new slice depends on.
- Phase 2 is required before Phases 3, 5, and 6 because skill trees provide the gating structure for grammar lessons, quiz type unlocks, and placement test result mapping.
- Phases 3 and 4 have no mutual dependency and could be built in parallel if capacity allows, but Phase 3 content is needed by Phase 6.
- Phase 4 (adaptive difficulty) must precede Phase 5 (quiz expansion) to avoid new quiz types launching at fixed difficulty.
- Phase 6 (placement test) requires both Phase 3 (grammar questions) and Phase 4 (CAT item selection).
- Phase 7 extends Phase 3's proven pattern with no architectural risk; can be pulled earlier if grammar content team has capacity.
- Phase 8 waits for all trigger sources to exist — achievement conditions reference all prior systems.
- Phase 9 is the display/sharing layer — purely reads upstream state, no write dependencies on any other phase.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 6 (Placement Test):** CAT algorithm scoring formula and CEFR boundary calibration. The IRT binary search is simple, but the question bank calibration — which specific words represent each CEFR band accurately for a game context — requires careful content decisions. Scoring algorithm must be fully specified before the question bank is authored.
- **Phase 8 (Achievement Expansion):** Achievement condition definition for 206 entries is significant content work. Need clarity on which events are already instrumented in EventBus (74 constants) versus which need new constants, and the exact `isAchievementMet()` requirement type cases for the new types.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Bug Fixes):** 4-line code fix + Redux persist migration. Both are well-documented standard patterns, already proven in this codebase.
- **Phase 2 (Skill Trees):** Infrastructure already exists. Data expansion and node count increase, not new architecture.
- **Phase 3 and 7 (Grammar Expansion):** `grammar.js` schema is established at 47 lessons. Content authoring at scale with no architectural unknowns.
- **Phase 4 (Adaptive Difficulty):** FSRS signals are the correct inputs. Algorithm is pure JS priority weighting, well-understood.
- **Phase 5 (Quiz Expansion):** `QuizOverlay` switch pattern scales linearly; SentenceBuilder extends cleanly.
- **Phase 9 (Reports/Social):** recharts is established; ink dialogue integration is proven from v11.0.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | package.json + node_modules verified; recharts v3.8.0 peerDependencies confirmed via npm registry; all other systems confirmed buildable on existing packages without new libraries |
| Features | MEDIUM-HIGH | CEFR Arabic grammar topics from authoritative sources; CAT/IRT patterns from peer-reviewed research; skill tree design from game design literature; exercise-type count recommendations reasoned from domain knowledge, not empirically verified |
| Architecture | HIGH | All source files directly inspected; slice inventory verified; existing bug (grammar_lessons never fire) confirmed via ACTION_TO_ACHIEVEMENT_TYPES inspection; grammar.js lesson count confirmed at 47; quiz types confirmed at 12 existing (not 18) |
| Pitfalls | HIGH | Save data migration and Redux persist patterns from official docs; html2canvas CORS from confirmed open GitHub issues (open since 2018); placement test over-placement from peer-reviewed European Language Council study; achievement dilution from game design research with documented examples |

**Overall confidence:** HIGH

### Gaps to Address

- **Grammar lesson vocabulary prerequisites build-time validation:** The lesson template must include a `vocabulary_prerequisites` field validated against the 5,029-word dataset. The validation tooling does not yet exist and must be built in Phase 3 Wave 1.
- **Social card CORS testing in production:** `html-to-image` is recommended over `html2canvas` for RTL handling, but production CORS behavior with Kenmi assets at `public/assets/kenmi/` must be verified. SVG-only card design (no images) is the safest path and recommended.
- **Audio infrastructure for listening/dictation quiz types:** These two types are deferred pending TTS infrastructure. If TTS is confirmed during Phase 5 planning, the quiz type count changes.
- **`unlock_content` node reward type:** Several existing skill tree nodes have `rewards: { type: 'unlock_content', value: 'beginner_passages' }` with no wired content. Phase 2 will track the unlock in state; the actual content (story_library, news_feed) is out of scope for v12.0.
- **ts-fsrs patch upgrade:** v5.3.1 is available (v5.2.3 installed). Change log not reviewed. Assess during Phase 4 when FSRS signals are wired into adaptive difficulty.

---

## Sources

### Primary (HIGH confidence)
- `package.json` + `node_modules/` — All installed versions verified 2026-03-22
- `src/store/slices/` — 31 slice files inspected; achievementSlice, skillTreeSlice, grammarSlice, vocabularySlice architecture verified
- `src/components/Quiz/QuizOverlay.jsx` — 12 quiz types confirmed (not 18)
- `src/data/grammar.js` — 47 lessons confirmed (not 50 as documented)
- `src/data/achievements.js` — 2,633 lines, 20 categories confirmed
- `src/data/skillTrees.js` — 6 trees, ~10-12 nodes each confirmed
- `vite.config.js` — manualChunks strategy verified; skill-data, grammar-data chunks confirmed
- `npm info recharts` — v3.8.0 peerDependencies `react: "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"` confirmed
- html2canvas CORS Issue #1544 — GitHub (confirmed open, unresolved since 2018)
- Redux Persist Migration Guide — ExpertBeacon
- IRT adaptive language learning — IEEE Xplore peer-reviewed paper
- Spaced retrieval practice — retrievalpractice.org research PDF
- FSRS Algorithm Overview — DeepWiki

### Secondary (MEDIUM confidence)
- Arabic CEFR grammar framework — arabiclang.online (authoritative Arabic CEFR framework)
- Arabic vocabulary counts per CEFR level — earabiclearning.com
- Duolingo skill tree design — duolingo.fandom.com (official community wiki)
- Computerized Adaptive Testing — assess.com
- Duolingo Year in Review — blog.duolingo.com (official Duolingo blog)
- CEFR placement tests + 62% over-placement finding — yourfuturecareer.org
- Achievement dilution research — gamedeveloper.com, trophy.so
- Meaningful skill tree design — gdkeys.com
- Overjustification effect in game achievements — gamedeveloper.com
- Adaptive learning technology 2025 — flowsparks.com
- Grammar lesson exercise design — eslbase.com
- html-to-image vs html2canvas RTL comparison — community-verified

### Tertiary (LOW confidence — validate during implementation)
- ts-fsrs v5.2.3 → v5.3.1 upgrade impact — change log not reviewed; assess during Phase 4
- html-to-image v1.11.13 React 19 compatibility — community reports, not official docs

---
*Research completed: 2026-03-22*
*Ready for roadmap: yes*
