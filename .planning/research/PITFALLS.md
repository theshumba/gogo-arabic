# Pitfalls Research — v12.0 Learning Systems

**Domain:** Adding skill trees, grammar expansion, adaptive quizzes, placement tests, and achievement systems to an existing Arabic learning RPG with FSRS, 5,029 words, 3 learning paths, and 44 achievements.
**Researched:** 2026-03-22
**Overall confidence:** HIGH (game design pitfalls), MEDIUM (Arabic-specific CEFR scaling), HIGH (state/migration pitfalls from project codebase knowledge)

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or player soft-locks.

---

### Pitfall 1: Skill Tree State Breaks Existing Save Data

**What goes wrong:** Adding a new `skillTreeSlice` to Redux without a migration plan causes the IndexedDB persist layer (added in v6.0) to throw hydration errors on existing saves. Players who open the app post-update lose their save or see crashes on boot.

**Why it happens:** The project uses `nested persistReducer` for 5 slices with version vectors. Adding a new slice without bumping `persistConfig.version` and registering a migration function means redux-persist either rejects the stale shape or silently drops the new slice, leaving skill nodes in an undefined state.

**Consequences:** Every existing player (44 achievements, 5,029 vocab words, quest progress) hits a white-screen crash or silent data loss on first load after the update.

**Prevention:**
- Bump `persistConfig.version` on every new persisted slice.
- Write a migration function that seeds `skillTreeSlice` with all nodes locked (the correct initial state for existing players).
- Never assume default state hydrates correctly for existing users — always test migrations against a snapshot of real save data from v11.0.
- Test path: create a save in v11.0, build v12.0, load the save, assert skill nodes are locked and no console errors appear.

**Detection:** Console errors on boot (`Cannot read properties of undefined, reading 'nodes'`), missing skill tree UI state, or IndexedDB version mismatch warnings.

**Phase:** Skill Tree phase must include migration step as Wave 1, before any node logic.

---

### Pitfall 2: Skill Tree Nodes Gating Already-Learned Content

**What goes wrong:** Designing skill trees where unlocking a node is required to *use* content the player already knows. A player who has reviewed 400 FSRS words and reached CEFR B1 finds that the "Reading" skill tree shows those words as locked behind a node they never unlocked.

**Why it happens:** This is the "cutting through core abilities" trap. Skill trees added retroactively to existing progression systems often treat unlock state as the source of truth, ignoring the pre-existing mastery data already in FSRS.

**Consequences:** Long-term players feel punished and confused. New players miss the problem entirely. The disconnect between FSRS mastery state and skill tree node state creates two conflicting "progress" displays.

**Prevention:**
- On first skill tree initialization, auto-unlock all nodes whose prerequisite content the player already satisfies (FSRS mastery threshold, CEFR level, or completed quests).
- Skill trees should reflect mastery, not gate it. Nodes visualize what the player has achieved — they do not unlock capabilities they already possess.
- Write a `initializeSkillTree(existingPlayerState)` function that seeds the tree from FSRS stats, quest completion, and CEFR level at install time.

**Detection:** Existing player with CEFR B1 placement sees skill tree fully locked. FSRS cards marked "mature" but tree shows them as inaccessible.

**Phase:** Skill Tree design phase. Must be specified in the data model before any node rendering is built.

---

### Pitfall 3: Adaptive Quiz Difficulty Diverges from FSRS Scheduling

**What goes wrong:** The new adaptive quiz engine adjusts difficulty independently of FSRS. A word FSRS has scheduled for review (stability score low, due today) gets filtered out of adaptive quizzes because the adaptive engine classifies it as "too hard" for the player's current difficulty band. The player never reviews it. FSRS retention drops silently.

**Why it happens:** Two systems — FSRS and an adaptive difficulty engine — both try to control which words appear. Without explicit integration contracts, they silently override each other.

**Consequences:** FSRS retention rates degrade. Players fail to consolidate vocabulary. The educational core promise of the game breaks without any visible error.

**Prevention:**
- Establish a clear priority hierarchy: FSRS-due cards are *always* eligible regardless of adaptive difficulty band. The adaptive engine controls *how* a word is quizzed (question format, time pressure, distractor difficulty), not *whether* it appears.
- Treat adaptive difficulty as a presentation layer on top of FSRS scheduling, not a replacement scheduler.
- Add a `fsrs_override: true` flag to any quiz session item drawn from FSRS due queue.

**Detection:** FSRS retention metric (already tracked in project) drops after v12.0 ships. "Overdue" word count climbs despite active play.

**Phase:** Adaptive Quiz phase. Integration contract with FSRS must be defined in the plan before any difficulty algorithm is coded.

---

### Pitfall 4: Placement Test Places Players Too High, Causing Immediate Disengagement

**What goes wrong:** The diagnostic placement test uses multiple-choice grammar questions and vocabulary recognition (receptive knowledge) to assess CEFR level. This systematically over-places players — a learner with receptive B1 knowledge but productive A2 output gets placed at B1. They immediately hit quiz types requiring active production and fail repeatedly.

**Why it happens:** A 2023 European Language Council study found 62% of learners placing themselves a full CEFR level higher than actual ability on vocabulary/grammar recognition tests. Recognition is easier than production; multiple-choice inflates scores.

**Consequences:** Players experience frustration in the first session, attribute it to the game being "too hard," and churn. This is especially damaging because the placement test is the first substantial interaction for new players.

**Prevention:**
- Default the placement test to place players *one level lower* than the raw score indicates.
- Use at minimum one productive question type (sentence ordering, fill-in-blank without choices) in addition to recognition questions.
- Always offer a "Start Lower" option at the end of the placement test with copy like "Not sure? Start from A1 — you can always skip ahead."
- Cap the initial placement at B1 maximum (since content beyond B1 requires confirmed prior knowledge).

**Detection:** Post-placement churn rate. If players who complete the placement test have lower D1 retention than players who skipped it and started at A1, over-placement is occurring.

**Phase:** Placement Test phase. The scoring algorithm and level assignment formula must be specified before the question bank is built.

---

### Pitfall 5: Achievement Dilution — 250 Achievements Become Meaningless

**What goes wrong:** Expanding from 44 to 250+ achievements fills the achievement list with low-effort completion markers ("+5 words reviewed", "opened the game 3 days in a row", "visited zone 2"). Players stop looking at achievements because nothing feels earned. The motivational signal collapses.

**Why it happens:** Research on achievement systems confirms that "overwhelming users with dozens of potential achievements dilutes their meaning." The overjustification effect compounds this: giving external rewards for every small action trains players to expect constant external validation, which tanks intrinsic motivation when rewards stop.

**Consequences:** Players ignore the achievement panel entirely. The 206 new achievements produce zero motivational lift. Development time is wasted on content nobody experiences.

**Prevention:**
- Gate the 250 number as the system maximum, not the launch target. Ship 80-100 meaningful achievements first, add the rest in content patches.
- Apply the clarity test to every achievement: does it teach a mechanic, reward a distinct milestone, or celebrate mastery? If not, cut it.
- Tier the achievements: Bronze (accessible to all), Silver (active engagement), Gold (mastery), Legendary (rare, aspirational). Players should earn Bronze achievements, chase Silver, admire Gold from a distance, and encounter Legendary only via community channels.
- Ensure first-session players earn at least 3 achievements in their first 20 minutes, and that those achievements feel genuinely rewarding, not trivially automatic.

**Detection:** Achievement panel open rate drops after expansion. Player survey data shows "I never look at achievements."

**Phase:** Achievement expansion phase. Tier taxonomy and quality bar must be defined before any new achievement data is written.

---

### Pitfall 6: Grammar Expansion (7 to 50 Lessons) Breaks Existing Lesson References

**What goes wrong:** Grammar lesson IDs in quests, NPC dialogue ink scripts, and FSRS-to-grammar sync (added in v6.0 bidirectional sync) are hardcoded as indices 0-6 (`lesson_0` through `lesson_6`). Expanding to 50 lessons using the same index scheme means existing references collide or break when the array is reordered.

**Why it happens:** Small systems often use numeric indices for IDs because there are only 7 items. The assumption breaks at 50+ items when ordering changes.

**Consequences:** Existing quest triggers that reference grammar lessons by index fire on the wrong lesson. FSRS grammar accuracy damage multiplier (v6.0) applies to the wrong lesson type. Players see incorrect grammar content in NPC dialogue.

**Prevention:**
- Before writing any new lesson, audit all existing references to grammar lessons in: `questSlice`, ink dialogue files, `grammarSlice`, and the FSRS-grammar sync middleware.
- Migrate to string slug IDs (`lesson_verb_present`, `lesson_noun_plural`) rather than numeric indices.
- Write a one-time migration script that replaces all `lesson_0` through `lesson_6` references with slugs.
- Add build-time validation: any grammar lesson reference in quests or ink files must match a key in `grammarLessons.js`.

**Detection:** Quest triggers fire at wrong point in lesson progression. FSRS damage multiplier logs show wrong lesson being credited.

**Phase:** Grammar expansion phase Wave 1 must be ID migration before any new lesson is authored.

---

### Pitfall 7: Social Sharing Cards Blocked by CORS and Canvas Security

**What goes wrong:** The "I learned X Arabic words" shareable card feature uses html2canvas (or equivalent) to screenshot a DOM element containing the player's stats. The screenshot is blank or throws an error because the element includes images served from a CDN (Kenmi assets in `public/assets/kenmi/`) that hit CORS restrictions when drawn to canvas.

**Why it happens:** Browser security taints a canvas as soon as any cross-origin image is drawn without explicit CORS headers. Even locally-served images can trigger this if they redirect to a CDN. html2canvas has documented issues with this that have never been fully resolved (open GitHub issues since 2018).

**Consequences:** The social sharing feature is non-functional in production for any player with CDN-served assets. Developers test on localhost where CORS is not enforced and ship broken feature.

**Prevention:**
- Design the social card to use only inline SVG, CSS gradients, and text — no external image dependencies.
- If avatar/character images are needed on the card, pre-encode them as base64 at card-render time using a server-side endpoint that fetches and encodes the image.
- Test social card generation specifically in production build with assets served from their real URLs, not localhost.
- Alternative: use a server-side card generation endpoint (Express already exists in project) that renders the card as a PNG and returns a URL to share.

**Detection:** Social card appears blank in production but works in development. Browser console shows `SecurityError: The operation is insecure` or `Tainted canvas cannot be exported`.

**Phase:** Social sharing phase. Architecture decision (client-side vs server-side card generation) must be made before implementation begins.

---

### Pitfall 8: CEFR Progress Report Requires Authoritative Level Inference That Does Not Exist

**What goes wrong:** Building a CEFR progress report assumes a clean mapping of player activity to CEFR level over time. In practice, CEFR level is never directly stored — it is inferred from FSRS mastery percentages, grammar lesson completion, and quiz accuracy. When these signals disagree (player passed 40/50 A2 grammar lessons but has 60% FSRS retention on A2 words), the level display oscillates and users see their CEFR level go backwards.

**Why it happens:** CEFR level inference from multiple activity signals is inherently noisy. The project already tags vocab with CEFR level (v11.0), but there is no single canonical "current CEFR level" value in any slice — CEFR is currently used as a content tag, not a player state.

**Consequences:** Progress report shows misleading regression ("you went from B1 to A2"). Players lose trust in the metric. The CEFR display creates support burden explaining why level dropped.

**Prevention:**
- Define a canonical `playerCefrLevel` as a computed, write-once-per-session value — it can only go up, never down.
- Compute it from a weighted formula: 40% FSRS mastery rate for CEFR-tagged vocab, 30% grammar lesson completion by CEFR tier, 30% quiz accuracy on CEFR-tagged content.
- Display CEFR as a range ("approaching A2 → A2 → confident A2 → approaching B1") rather than a discrete jump, which hides noise in the signal.
- Store CEFR snapshots with timestamps, not live computed values, so the progress report reads from stable historical data.

**Detection:** Player completes 3 sessions, progress report shows A2 → B1 → A2. CEFR level changes on page refresh without any new activity.

**Phase:** CEFR Progress Report phase. Level inference algorithm must be fully specified and tested on synthetic data before any UI is built.

---

## Moderate Pitfalls

---

### Pitfall 9: Skill Tree Visual Overwhelm (Choice Paralysis)

**What goes wrong:** 6 skill trees rendered simultaneously overwhelms new players. Path of Exile's passive tree is the canonical example of this failure mode — impressive but paralyzing.

**Prevention:** Show one skill tree at a time, selected via a tab or category menu. Collapse locked branches by default. Show only the next 1-2 unlockable nodes prominently, with deeper nodes greyed but visible. Apply progressive disclosure: show basic nodes in full detail, advanced nodes as silhouettes until prerequisites are met.

**Phase:** Skill Tree UI phase. Information architecture review before component build.

---

### Pitfall 10: Adaptive Quiz Engine Converges to a Single Difficulty Plateau

**What goes wrong:** The adaptive difficulty algorithm stabilizes around one difficulty level per player and stops adjusting. A player who is A2 overall but B1 in verb conjugation gets stuck at the A2 average for verb quizzes because the algorithm uses global averages instead of per-skill-area tracking.

**Prevention:** Track difficulty per content cluster (vocabulary by CEFR+topic tag, grammar by lesson type, reading by passage level). Difficulty must adapt independently in each dimension. A player can be quizzed at A2 for numbers and B1 for greetings simultaneously.

**Phase:** Adaptive Quiz phase. Data model for per-cluster difficulty tracking must be defined before algorithm implementation.

---

### Pitfall 11: Grammar Lesson Content Not Tied to In-World Vocabulary

**What goes wrong:** 50 grammar lessons teach abstract grammatical patterns using example words that do not appear in the player's FSRS vocabulary deck. The disconnect makes lessons feel like a separate classroom game, breaking the immersion that defines Gogo Arabic's educational value.

**Prevention:** Each grammar lesson's example vocabulary must be drawn exclusively from the 5,029-word dataset and filtered to words the player has already encountered (FSRS `state !== 'new'`). If the player has not encountered enough relevant words, the lesson introduces them first via NPC dialogue or a short flashcard segment.

**Phase:** Grammar content authoring phase. Lesson template must include a `vocabulary_prerequisites` field validated against the vocab dataset at build time.

---

### Pitfall 12: Achievement Triggers Fire Multiple Times (Double-Granting)

**What goes wrong:** An achievement like "Review 1,000 words" fires the toast notification and grants the reward every time the review count crosses 1,000 — including when the IndexedDB state is re-hydrated on boot, causing the achievement toast to replay on every app open.

**Why it happens:** Achievement condition checks run against current state without checking `alreadyGranted`. Redux state hydration re-runs selectors on the initial state load, which can re-trigger threshold checks.

**Prevention:**
- Store a `grantedAt` timestamp on every achievement entry. Achievement trigger checks must always verify `!achievement.grantedAt` before firing.
- Achievement evaluation must only fire on state *changes* (action-triggered middleware), not on state *reads* (selectors/hydration).
- The existing `achievementMiddleware` pattern (v1.0) already handles the check — new achievements must go through the same middleware, not bypass it with direct dispatch.

**Phase:** Achievement expansion phase. All 206 new achievements must route through existing `achievementMiddleware` before any new trigger is written.

---

### Pitfall 13: Placement Test Frustrates Players with Prior Knowledge Who Cannot Skip Questions

**What goes wrong:** An advanced learner (heritage speaker, prior study) must answer 30+ A1-level questions before the adaptive algorithm allows them to reach B1 content. They abandon the placement test and start at A1 anyway — the worst possible first impression for a sophisticated learner.

**Prevention:**
- Start the adaptive placement test at A2 (not A1), since a true beginner will correct quickly downward in 2-3 questions.
- Allow the player to self-select "I've studied Arabic before" / "Complete beginner" as the very first placement question to skip to the appropriate starting tier.
- Cap placement test length at 20 questions with an early-exit trigger: if the player answers 10 consecutive questions correctly at B1 level, place at B1 and exit.

**Phase:** Placement Test phase. Test flow specification must include early-exit conditions.

---

## Minor Pitfalls

---

### Pitfall 14: Skill Tree Node Names Not in Arabic

The skill tree for an Arabic learning game should label nodes in Arabic with transliteration, not generic English names. Missing this makes the tree feel disconnected from the cultural identity of the product.

**Prevention:** Node labels follow the same Arabic-first pattern as equipment and inventory items (established in v6.0). English subtitle only.

---

### Pitfall 15: Achievement Icons Not Accessible

250+ achievement icons need alt text and ARIA labels. Missing this breaks WCAG AA compliance (existing project requirement) for the achievement panel.

**Prevention:** Every achievement entry in the data schema must include an `ariaLabel` field. The achievement panel component must use it.

---

### Pitfall 16: Grammar Lesson Exercise Types Require Arabic Keyboard Input

12 exercise types per lesson sounds comprehensive, but if any exercise type requires free-form Arabic text input, it is blocked by the "no voice recognition" out-of-scope constraint and requires implementing an Arabic virtual keyboard. This scope expands significantly.

**Prevention:** Constrain exercise types to input-free or selection-based formats: multiple choice, ordering (drag), fill-in from word bank, matching. No free-form text input unless a pre-built Arabic keyboard component already exists in the codebase.

---

### Pitfall 17: Social Card Share Not Mobile-Friendly

The share card assumes Web Share API (`navigator.share`) which has good mobile support but inconsistent desktop support. A desktop-only fallback (copy-to-clipboard) is required, or the share button silently does nothing on desktop Chrome.

**Prevention:** Always check `navigator.share` availability. If absent, fall back to copy-to-clipboard with a "Link copied!" toast.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Skill Tree data model | Breaks existing save data without migration | Write `createMigrate` migration that seeds locked tree before any UI |
| Skill Tree initialization | Re-locks already-mastered content for existing players | `initializeSkillTree(playerState)` auto-unlocks nodes based on FSRS + quest state |
| Adaptive Quiz engine | Overrides FSRS scheduling silently | Priority hierarchy: FSRS-due cards always eligible; adaptive engine controls format only |
| Grammar expansion | Breaks existing lesson ID references in quests and ink | Migrate to slug IDs before authoring new lessons |
| Grammar content | Vocabulary disconnected from player's known words | `vocabulary_prerequisites` field validated at build time |
| Placement test scoring | Over-places players, causes first-session churn | Default one level lower; always offer "start lower" escape hatch |
| Placement test UX | Wastes advanced learner's time | Self-select prior knowledge; early-exit at 10 consecutive correct B1 answers |
| Achievement expansion | Dilution destroys motivational value | Tier system + quality gate before authoring; launch 80-100, not 250 |
| Achievement triggers | Double-grants on hydration | Route through existing middleware; check `grantedAt` on every trigger |
| CEFR progress reports | Level goes backwards, erodes trust | Write-once-per-session level; store snapshots, not live computed values |
| Social sharing cards | CORS breaks canvas screenshot in production | Server-side card generation or SVG-only card design; test in production build |
| Any new Redux slice | State hydration breaks existing saves | Always bump persist version + write migration function |

---

## Inherited Pitfalls (Still Active from v11.0)

The following pitfalls from v11.0 remain relevant for v12.0 and have not been resolved:

- **Untested battle code (~2.6K LOC):** Any phase that touches Word Duel adaptive difficulty (quiz expansion) risks silent regressions. Add battle code tests before modifying battle quiz types.
- **Bundle regression risk:** v12.0 adds 6 skill trees, 50 grammar lessons, 18 quiz types, and 250 achievement definitions — significant JSON/data payload. Bundle must be checked after each phase. Grammar lesson data and achievement definitions should be lazy-loaded, not bundled upfront.
- **FSRS-root mastery sync:** Grammar accuracy damage multiplier (v6.0 FSRS-root sync) must remain valid after grammar lesson expansion changes lesson IDs and coverage. Verify sync contract after grammar migration.

---

## Sources

- [Achievement Design 101 — Game Developer](https://www.gamedeveloper.com/design/achievement-design-101) — MEDIUM confidence
- [Designing and Building a Robust Achievement System — Game Developer](https://www.gamedeveloper.com/design/designing-and-building-a-robust-comprehensive-achievement-system) — MEDIUM confidence
- [What Makes Achievement Systems Work (And Why Most Fail) — Trophy](https://trophy.so/blog/what-makes-achievement-systems-work) — MEDIUM confidence
- [The Overjustification Effect and Game Achievements — Game Developer](https://www.gamedeveloper.com/design/the-overjustification-effect-and-game-achievements) — MEDIUM confidence
- [Keys to Meaningful Skill Trees — GDKeys](https://gdkeys.com/keys-to-meaningful-skill-trees/) — MEDIUM confidence
- [html2canvas CORS Issue #1544 — GitHub](https://github.com/niklasvh/html2canvas/issues/1544) — HIGH confidence
- [Placement Tests and CEFR Levels — yourfuturecareer.org](https://yourfuturecareer.org/placement-tests-for-language-courses-how-to-accurately-assess-cefr-levels) — MEDIUM confidence
- [Dynamic Placement Test Guide — easygrader.net](https://www.easygrader.net/blog/dynamic-placement-test/) — MEDIUM confidence
- [Redux Persist Migration Guide — ExpertBeacon](https://expertbeacon.com/the-complete-guide-to-redux-persist-for-seamless-state-migration/) — HIGH confidence
- [Repeated Mistakes in App-Based Language Learning — ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0360131523002439) — HIGH confidence (peer-reviewed)
- [FSRS Algorithm Overview — DeepWiki](https://deepwiki.com/open-spaced-repetition/rs-fsrs/3.1-fsrs-algorithm-overview) — HIGH confidence
- Project codebase: `PROJECT.md`, v6.0-v11.0 known tech debt, FSRS-grammar sync (v6.0), IndexedDB persist layer (v6.0), achievement middleware (v1.0) — HIGH confidence
