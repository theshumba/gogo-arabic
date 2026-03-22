# Feature Landscape: v12.0 Learning Systems

**Domain:** Arabic Learning RPG — Skill Trees, Grammar Expansion, Quiz Expansion, Adaptive Difficulty, CEFR Placement, Achievement System
**Researched:** 2026-03-22
**Confidence:** MEDIUM-HIGH (live web research + official docs + existing codebase analysis)

---

## Context: What Already Exists

Before cataloguing what to build, these v11.0 systems are confirmed shipped and available as foundations:

| System | What It Gives v12.0 |
|--------|---------------------|
| FSRS with 5,029 words (CEFR/root/cluster/affinity tags) | Adaptive scheduling, per-word mastery scores, proficiency data per level |
| 6 quiz types | Baseline; v12.0 expands to 18 |
| 7 grammar lessons | Baseline; v12.0 expands to 50 |
| 44 achievements | Baseline; v12.0 expands to 250+ |
| 3 learning paths (Scholar/Traveler/Historian) | Path affinity already wired; skill trees will branch per path |
| Root magic system (50 spells, 10 elements) | Natural anchor for Grammar/Writing skill tree nodes |
| 6-faction reputation engine | Faction mastery = natural achievement category |
| Calligraphy tracing mini-game (28 letters) | Writing skill tree can gate calligraphy challenges |
| Poetry battles (10 poems, 8 NPC poets) | Grammar/Culture skill trees can surface these as node rewards |
| Word duel boss battles | Existing adaptive difficulty in boss battles; v12.0 extends to all quiz types |
| CEFR vocabulary tags (A1–B2) on all 5,029 words | Placement test can use FSRS response data as implicit proficiency signal |
| 12 AI companions with CEFR-scaled dialogue | Companions can mentor specific skill tree branches |

---

## Table Stakes (Players Expect These)

Features whose absence makes v12.0 feel incomplete or internally inconsistent.

### 1. Skill Tree — 6 Trees with Node Unlock Progression

**Why expected:** Players who chose Scholar/Traveler/Historian path (v4.0/v11.0) expect that choice to manifest as visible, branching specialisation. Without a skill tree, the paths are cosmetic labels. The project explicitly requires "6 skill trees (Reading, Writing, Listening, Conversation, Grammar, Culture) with unlockable node progression."

**What standard behavior looks like:**

Duolingo's skill tree (historical) and Path (current) establish the genre norm: skills are organised in rows/branches. A player must complete prerequisite nodes before unlocking descendants. Each node has a mastery level (e.g., 1–5 crowns). Unlocking a node requires earning skill points, reaching a CEFR level, or completing a prior node. Nodes are not locked forever — they decay if vocabulary mastery drops (spaced repetition signals decay).

For a language RPG specifically, the Tyranny model is more apt: skill tree nodes that unlock because of in-world *actions* (joined a faction, completed a quest) not just grinding. Dynamic unlocks based on player narrative choices drive the "RPG" half of "language learning RPG."

The 6-tree structure (Reading, Writing, Listening, Conversation, Grammar, Culture) maps directly to the CEFR four-skills model plus two RPG-specific extensions:

| Tree | Primary CEFR Skill | RPG Anchor | Node Count (estimate) |
|------|-------------------|-----------|----------------------|
| Reading | Reading | Environmental inscriptions, scrolls, books | ~15 nodes |
| Writing | Writing | Calligraphy tracing, sentence composition | ~15 nodes |
| Listening | Listening | Companion dialogue comprehension, ambient audio | ~12 nodes |
| Conversation | Speaking/interaction | NPC dialogue, haggling, gift exchanges | ~15 nodes |
| Grammar | Grammar | Root magic, verb form upgrades | ~18 nodes |
| Culture | Cultural knowledge | Faction lore, poetry battles, historical sites | ~15 nodes |

**Complexity:** HIGH — new Redux slice (`skillTreeSlice`), persistent unlock state per player, UI component for 6 trees, dependency graph for node prerequisites, integration with FSRS mastery and quest completion triggers.

**Dependency on existing:** FSRS mastery scores (unlock trigger), quest system (quest-complete triggers), faction engine (faction-gated nodes), root magic (Grammar tree nodes), calligraphy mini-game (Writing tree nodes), poetry battles (Culture tree nodes).

---

### 2. Grammar Expansion — 7 to 50 Lessons Covering A1–B2

**Why expected:** 7 grammar lessons for a system claiming to cover A1–B2 is sparse. Standard Arabic grammar courses for this range require at least 40–60 topics. Players who reached intermediate CEFR levels (B1/B2) via FSRS will encounter vocabulary they cannot use grammatically — they need the underlying structures.

**What standard behavior looks like:**

Research on Arabic MSA CEFR grammar confirms the following topic distribution:

**A1 (8–10 lessons):** Basic nominal/verbal sentences, noun-adjective agreement, case-based tanween endings, demonstrative pronouns, attached pronouns, singular present/past/future for regular verbs, negation (مَا / لا), basic question words (ما/من/أين/متى), construct phrases (إضافة), numbers 1–10.

**A2 (10–12 lessons):** Dual forms across cases, regular plural formation (broken/sound), plural pronoun agreement, numbers tens/hundreds, full verb conjugation (Forms I–IX), negation with لَمْ, imperative mood, لَيْسَ and كَانَ, active participles, subjunctive mood, compound sentences with coordination/subordination.

**B1 (12–14 lessons):** Adverb formation, comparative/superlative, irregular verb conjugation, passive voice, relative clauses (الذي/التي), past continuous, conditional sentences (إن/إذا/لو), broken plural patterns, verbal nouns (مصدر), participle agreement rules, time/sequencing connectors.

**B2 (10–14 lessons):** Advanced modality, construct state (إضافة) with multiple possessors, complex subordination, subjunctive after ان/لن, passive voice in all forms, advanced sentence structures, stylistic formal/informal register switching, classical vs. MSA variation markers.

**Exercise types per lesson (12 required per lesson):**

Industry standard for grammar lessons in language apps: at minimum, 4–6 exercise types per lesson to move from recognition to production. 12 per lesson for a "structured Arabic course" means:

1. Read/explain — grammar rule with Arabic examples (no interaction)
2. Multiple choice — identify the correct form
3. Fill-in-the-blank — type or select missing word/ending
4. Sentence building — arrange scrambled Arabic words into correct order
5. Error correction — spot and fix the grammatical error
6. Translation (Arabic → English) — comprehension check
7. Translation (English → Arabic) — production check
8. Conjugation drill — complete a paradigm table
9. Root identification — identify the root and form pattern
10. Sentence transformation — rewrite sentence in different tense/voice
11. Passage comprehension — short text with grammar-targeted questions
12. Free production — construct a sentence using the target structure (multiple-choice scaffolded for MVP)

**Complexity:** HIGH — 50 lessons × 12 exercise types = 600 lesson-exercise instances of content. Infrastructure is manageable (one `GrammarLesson` component with exercise type renderer); content authoring is the bottleneck.

**Dependency on existing:** 7 existing grammar lessons define the component shape. FSRS vocabulary data (5,029 words with CEFR tags) provides the vocabulary for examples. Grammar tree nodes in skill tree unlock lessons.

---

### 3. Quiz Expansion — 6 to 18 Quiz Types

**Why expected:** 6 quiz types is the v1.0 MVP. A "structured course" requires enough quiz variety that the same vocabulary is practised from different cognitive angles — recognition, recall, production, listening, context. Research (Duolingo English Test, IRT-based adaptive testing) confirms that quiz variety directly improves retention over single-format repetition.

**Existing 6 quiz types** (from PROJECT.md): Multiple choice, Word Duel boss battles, Reading comprehension, Word search, Calligraphy tracing, Poetry battles.

**12 new quiz types to add (total 18):**

| # | Quiz Type | Cognitive Operation | Complexity | CEFR Range |
|---|-----------|---------------------|------------|-----------|
| 7 | Listening comprehension | Audio → meaning | MEDIUM (TTS or pre-recorded audio) | A1–B2 |
| 8 | Dictation | Audio → Arabic typing | MEDIUM | A2–B2 |
| 9 | Sentence unscramble (Arabic word order) | Syntax production | LOW (existing sentence builder infrastructure) | A1–B2 |
| 10 | Sentence translation (EN → AR) | Full production | MEDIUM | A2–B2 |
| 11 | Cloze passage (reading + fill-blank) | Contextual recognition | MEDIUM | B1–B2 |
| 12 | Root family matching | Morphological awareness | LOW (root data exists) | A2–B2 |
| 13 | Verb conjugation drill | Grammar production | LOW (paradigm tables) | A2–B2 |
| 14 | Picture-word matching | Visual-lexical association | MEDIUM (needs image assets) | A1–A2 |
| 15 | Odd-one-out (semantic category) | Semantic classification | LOW | A1–B1 |
| 16 | Dialogue completion | Pragmatic competence | MEDIUM (needs short dialogues) | A2–B2 |
| 17 | Timed spelling sprint | Orthographic production under pressure | LOW | A1–B2 |
| 18 | Grammar error correction | Metalinguistic awareness | LOW | B1–B2 |

**Complexity:** MEDIUM overall. The quiz renderer infrastructure exists. Each new quiz type needs: (a) a React component, (b) a question generator that pulls from FSRS/vocabulary data, (c) integration with FSRS to score responses. Listening comprehension is MEDIUM-HIGH if audio is required — defer unless TTS is available.

**Dependency on existing:** FSRS vocabulary (5,029 words), root data, grammar lesson content (for types 13, 18), existing quiz infrastructure.

---

### 4. Adaptive Difficulty Engine

**Why expected:** Word Duel boss battles already have adaptive difficulty (v1.0). The project now requires this to extend to all 18 quiz types. Players who encounter quiz questions far above or below their CEFR level disengage — too hard causes frustration, too easy causes boredom. The "just right" zone (Vygotsky's Zone of Proximal Development) requires dynamic difficulty targeting.

**What standard behavior looks like:**

Industry consensus (Duolingo, IRT research, 2025 adaptive learning research) converges on three approaches:

**Approach 1: FSRS-native (recommended for this project)**
The FSRS algorithm already scores every word's difficulty (D), stability (S), and retrievability (R) per player. These are the right signals. The adaptive engine reads FSRS state and adjusts:
- Question pool: select words at 70–85% retrievability (the optimal interval for retention without frustration)
- Question format difficulty: easier types (multiple choice) for words with R < 50%, harder types (fill-blank, typing) for words with R > 80%
- Number of distractors in multiple choice: 2 distractors for A1, 3 for A2, 4 for B1+

**Approach 2: Item Response Theory (IRT)**
IRT estimates learner ability θ and item difficulty β. Select items where |θ − β| < 1 SD for maximum information. Requires per-item difficulty calibration over time. Better for placement tests than ongoing quizzes.

**Approach 3: Rule-based CEFR gating**
Simple: player is at CEFR level X → only show X and X+1 vocabulary. Crude but effective and already partially implemented via CEFR vocabulary tags.

**Recommended design:** FSRS-native for ongoing quiz sessions (leverage existing data). IRT for placement test only (one-time assessment). Rule-based CEFR gating as fallback/floor.

**Specific adaptive behaviors:**

| Signal | Adaptation |
|--------|-----------|
| 3 correct in a row | Increase question difficulty (harder quiz type or higher-stability word) |
| 2 incorrect in a row | Decrease difficulty (easier quiz type, re-introduce easier words) |
| FSRS retrievability < 30% | Force review before quiz session starts |
| CEFR level mismatch (word B2, player A1) | Exclude from session until player reaches B1+ |
| Quiz type = listening comprehension | Increase wait time allowance, reduce time pressure |

**Complexity:** MEDIUM. The data already exists in FSRS state. The engine is a selector/middleware layer that re-ranks quiz candidates before session start. No new libraries needed.

**Dependency on existing:** FSRS slice (all signals available), vocabulary CEFR tags, existing Word Duel adaptive logic (extend pattern).

---

### 5. CEFR Diagnostic Placement Test

**Why expected:** New players or returning players who lapsed need to start at the right level. Placing a B1 speaker at A1 is insulting; placing an A1 speaker at B1 causes immediate failure. CEFR placement is the industry standard (Busuu, Pearson, NGL all have placement tests). A 2023 study found 62% of learners self-place one level too high — diagnostic testing corrects this.

**What standard behavior looks like:**

Computerised Adaptive Testing (CAT) is the gold standard for efficient placement:
1. Start at middle difficulty (A2/B1 boundary)
2. Each response updates the proficiency estimate
3. Next question is selected to maximise information at current estimate (item closest to current θ)
4. Stop when standard error < threshold OR question count reaches maximum (15–25 questions is industry norm)
5. Map final θ to CEFR level: A1/A2/B1/B2

For Gogo Arabic specifically, the placement test should cover all four skills reflected in the game's quiz types:
- Vocabulary recognition (multiple choice, 6–8 questions)
- Grammar comprehension (fill-blank with known vocabulary, 4–5 questions)
- Reading comprehension (short passage, 2–3 questions)
- Optional listening (2 questions if audio available)

**Total: 15–20 questions, 5–8 minutes.**

After placement, the player receives:
- Their CEFR starting level
- A "diagnostic card" showing strength/weakness areas by skill
- Their skill trees unlocked to the appropriate tier
- FSRS queue pre-seeded with the correct level vocabulary

**CEFR Progress Reports** (companion feature): Monthly or milestone-triggered reports showing level advancement over time. Format: "You started at A1. You're now A2 in Reading, A1+ in Writing." Driven by FSRS mastery aggregated by CEFR tier.

**Complexity:** MEDIUM. CAT algorithm is a known pattern (select items near current estimate, update estimate after each response). The item pool already exists (5,029 words with CEFR tags). Redux middleware to track placement session state. One placement test component.

**Dependency on existing:** FSRS vocabulary with CEFR tags, grammar lesson content (for grammar section), CEFR progress tracking infrastructure.

---

### 6. Achievement Expansion — 44 to 250+ Achievements

**Why expected:** 44 achievements for a game with 6 quiz types, 8 zones, 52 quests, 50 grammar lessons, 5,029 vocabulary words, 12 companions, and 6 skill trees is sparse — most categories have no achievements at all. Players who complete major milestones (all Grammar tree nodes, 100 vocabulary words, reached B1) expect recognition. Research shows achievement-earners are 30% more likely to complete language courses.

**What standard behavior looks like:**

Achievement systems in language learning apps follow a tier/category pattern. Effective systems have:
- **Progressive tiered achievements** (bronze/silver/gold or 1/2/3 stars) — not just binary. "Learned 10/100/500 words" not just "learned words."
- **Diverse categories** — reward all play styles (explorer, grinder, social player, precision learner)
- **Hidden achievements** — discovered through unusual actions, creates discovery delight
- **Social/shareable achievements** — Duolingo's viral success partly due to shareable milestone moments
- **Time-sensitive achievements** — streak-based, monthly challenges create urgency

**Recommended 250+ achievement categories:**

| Category | Count | Examples | Tier Pattern |
|----------|-------|---------|-------------|
| Vocabulary milestones | 25 | Learned 10/50/100/500/1000/2500/5029 words | Bronze/Silver/Gold/Platinum |
| CEFR level achievements | 12 | Reached A1/A2/B1/B2 in Reading/Writing/Grammar | One per level × skill |
| Streak achievements | 15 | 3/7/14/30/60/100/365 day streaks | Progressive |
| Grammar mastery | 25 | Completed 1/5/10/25/50 grammar lessons | Tiered |
| Quiz performance | 30 | 10/50/100 perfect quizzes, 90%+ accuracy runs, all quiz types tried | Performance |
| Skill tree | 30 | First node unlocked, all nodes in one tree, all 6 trees complete | Completion |
| Root magic | 15 | Discovered 5/20/50 spells, used all 10 elements, unlocked all combos | Discovery |
| Exploration | 25 | Visited all zones, found all inscriptions, read all scrolls, unlocked all buildings | Exploration |
| Social/Companion | 20 | Max relationship with 1/6/12 companions, received gifts, gave gifts | Relationship |
| Economy | 15 | Haggled 10/50/100 times, visited all shops, spent 1000/5000/10000 dinars | Economy |
| Faction | 20 | Joined a faction, max tier in 1/3/6 factions, unlocked faction-only vocabulary | Faction |
| Calligraphy | 15 | First letter traced, 3-star on 1/10/28 letters, full alphabet mastered | Mastery |
| Poetry | 15 | Won first poetry battle, won 5/10 battles, unlocked all 10 poems | Combat |
| Hidden/Secret | 25 | Discovered by unusual actions (haggled in Arabic numerals 50 times, read all inscriptions in one zone) | Discovery |
| Placement/Diagnostic | 5 | Took placement test, skipped to A2/B1/B2, improved one full level | Milestone |

**Total: ~292 achievements** — well above the 250+ target.

**Social "I learned X Arabic words" cards:**

Duolingo's Year in Review (shareable card with XP, streak, minutes) goes viral every year. The mechanic: a visually branded card generated client-side (HTML Canvas or CSS), downloadable as PNG or shareable via Web Share API. For Gogo Arabic, the card shows:
- Total Arabic words learned
- Current CEFR level
- Longest streak
- Skill tree completion percentage
- One decorative Arabic phrase the player mastered

Implementation: CSS-to-canvas or `html2canvas` (existing dependency? check), Web Share API for native sharing on mobile. Simple, high-impact, no backend needed.

**Complexity:** MEDIUM-HIGH. 250+ achievements = significant content authoring but straightforward infrastructure (Redux slice + progress selectors). Social card = LOW complexity. Achievement unlock toast notifications already exist (v4.0). The bottleneck is defining all 250+ achievement conditions and integrating them with the right event sources.

**Dependency on existing:** Achievement toast system (v4.0), EventBus (74 constants), all progress Redux slices, FSRS data, quest system, skill trees (once built).

---

## Differentiators (These Set v12.0 Apart)

Features that go beyond genre expectations and make Gogo Arabic the reference for language learning RPGs.

### 7. Skill Tree Nodes That Unlock RPG Abilities (Not Just Content)

**Value:** Generic language apps (Duolingo, Babbel) unlock "the next lesson." An RPG must unlock *gameplay capabilities* — new spell elements, new haggling options, new companion abilities, new dialogue paths with NPCs. The skill tree is the bridge between "language progress" and "game feels different."

**What this looks like:**

| Skill Tree | Grammar Node Example | RPG Unlock |
|------------|---------------------|------------|
| Grammar | Master verb conjugation (Forms I–IX) | Unlock 8 new root magic spells that require verb form mastery |
| Writing | 3-star all 28 letter positions | Unlock calligraphy-based boss finisher animation |
| Conversation | Master imperative mood (A2) | NPCs respond to player commands in Arabic |
| Culture | Complete all poetry battle poems | Unlock Scholar faction tier 4 access |
| Reading | Read all 24 environmental inscriptions | Unlock hidden lore zone |

**Complexity:** MEDIUM-HIGH. Requires integration with root magic, faction engine, quest system. Each unlock is a single Redux action gated by skill tree state.

**Dependency on existing:** Root magic (v6.0), faction engine (v11.0), quest system (v1.0), environmental inscriptions (v11.0).

---

### 8. Skill Tree Shapes That Reflect Learning Paths

**Value:** Scholar/Traveler/Historian paths (v4.0/v11.0) currently affect FSRS queue ordering. In v12.0, they should visibly shape which skill tree branches are emphasised — Scholar sees Grammar tree expanded with extra nodes, Traveler sees Conversation tree expanded, Historian sees Culture tree expanded. Players feel their path choice mattered at the structural level.

**What this looks like:**
- Each tree has a "core path" (same for all players) plus "path-specific branch nodes" (only visible to one learning path)
- Scholar-exclusive Grammar nodes: 5 extra nodes on Classical Arabic morphology
- Traveler-exclusive Conversation nodes: 5 extra nodes on travel/commerce dialogue
- Historian-exclusive Culture nodes: 5 extra nodes on Islamic Golden Age vocabulary and history

**Complexity:** MEDIUM. Conditional rendering in skill tree UI based on `learningPath` Redux state. The nodes are authored content, not dynamic.

**Dependency on existing:** Learning path Redux state (v11.0), skill tree infrastructure (built in this milestone).

---

### 9. CEFR Progress Reports as In-World "Scholar's Scroll"

**Value:** Raw CEFR level display is clinical. Wrapping the progress report as an in-world artifact (a "Scholar's Scroll" from Amira the companion, delivered at CEFR milestone moments) makes the same data emotionally resonant. Amira's ink dialogue already exists — this is a new `ACHIEVEMENT_CEFR_LEVEL_UP` event that triggers a special dialogue and scroll presentation.

**Complexity:** LOW. Reuses inkjs dialogue engine + existing CEFR progress tracking. One new ink knot per CEFR milestone (8 knots: A1→A2, A2→B1, B1→B2, per skill area).

**Dependency on existing:** inkjs (v11.0), Amira companion dialogue, EventBus, FSRS CEFR tracking.

---

## Anti-Features (Do Not Build These)

| Feature | Why Requested | Why Not | What to Do Instead |
|---------|---------------|---------|-------------------|
| **Free-form skill point allocation** (Pokémon-style) | "Let me choose which tree to level up" | With only one player and language progression that has real cognitive dependencies, free point allocation lets players skip Writing to max Grammar — breaks pedagogical sequencing. CEFR prerequisites exist for a reason. | Gate nodes by CEFR level achieved, not by arbitrary point spend. Progress in the tree by *demonstrating* skill, not by choosing to invest points. |
| **Skill tree respec** (full reset) | "I want to change my learning path" | Respecting wipes mastery data and lets players game the placement test. Creates false progression signal. | Allow learning path preference change, but preserve all node unlock history. New path reveals hidden branches; old progress stays. |
| **Achievements for time spent, not mastery** | "Log in for 7 days" | Pure time achievements decouple reward from learning. Player can open app, do nothing, close it. Duolingo's worst UX decision. | All achievements require demonstrated mastery (quiz performance, vocab retention, grammar accuracy). Streak achievements measure consistent engagement but only trigger after at least one session activity. |
| **LLM-generated quiz questions** | "AI can generate infinite new questions" | LLM-generated Arabic is unreliable for grammar accuracy. Errors in grammar quizzes actively teach wrong patterns. Generated distractors in multiple choice often contain subtle errors that pass LLM review. | Curate all quiz questions from the 5,029-word vetted vocabulary. Grammar questions authored by rule-based generators with validated Arabic forms. |
| **Voice recognition quiz type** | "Have players pronounce words" | Explicitly out of scope (PROJECT.md). Infrastructure not ready, accuracy issues on Arabic phonemes (emphatics, pharyngeals, uvulars), WCAG implications for hearing-impaired users. | Listening comprehension (input) yes. Speaking production (output) no. TTS for audio output only. |
| **Competitive leaderboard for achievements** | "Show who has the most achievements" | Leaderboards for educational progress create anxiety for slower learners, discourage beginners, and have known negative effects on educational completion rates for non-top-performers. | Show personal milestones and personalised progress cards. "You're in the top 15% of players who started this week" framing (relative to own cohort) if comparison is needed. |
| **Purchasable achievement unlocks** | "Pay to unlock premium achievements" | Explicitly out of scope (PROJECT.md: no real-money item shop). Undermines educational trust. | All achievements earned purely through demonstrated language skill. |
| **Grammar lessons as video** | "Embed YouTube grammar explanations" | External dependency, embedding latency, doesn't integrate with FSRS, loses gamification context. | Text + interactive exercises, with Arabic script rendered inline via the existing font stack. |

---

## Feature Dependencies Map

```
Skill Trees (6 trees, node graph)
    └── required by --> Grammar expansion (Grammar tree gates lessons)
    └── required by --> Adaptive quiz sessions (tree level sets difficulty ceiling)
    └── requires ──> FSRS mastery scores (node unlock trigger)
    └── requires ──> Quest completion events (quest-gated nodes)
    └── requires ──> Faction engine (faction-gated nodes)
    └── enhances ──> Root magic (Grammar tree unlocks new spells)
    └── enhances ──> Calligraphy mini-game (Writing tree levels)
    └── enhances ──> Poetry battles (Culture tree levels)
    └── integrates ──> Learning path (Scholar/Traveler/Historian shapes branches)

Grammar Expansion (7 → 50 lessons, 12 exercise types each)
    └── requires ──> Grammar skill tree (lessons unlock via tree nodes)
    └── requires ──> FSRS vocabulary (vocabulary used in exercise content)
    └── enhances ──> Adaptive difficulty engine (grammar difficulty signals)
    └── enhances ──> Quiz expansion (grammar-targeted quiz types 13, 18)
    └── feeds ──> Placement test (grammar section questions)

Quiz Expansion (6 → 18 quiz types)
    └── requires ──> Adaptive difficulty engine (all 18 types feed difficulty signals)
    └── requires ──> FSRS vocabulary (item pool for all quiz types)
    └── enhances ──> Skill tree node activities (nodes include quiz challenges)
    └── soft-requires ──> Audio assets for listening comprehension (quiz types 7, 8)
    └── requires ──> Grammar lessons (for types 13, 18)

Adaptive Difficulty Engine
    └── requires ──> FSRS mastery data (primary signal — already exists)
    └── requires ──> CEFR vocabulary tags (gating signal — already exists)
    └── enhances ──> All 18 quiz types
    └── feeds ──> Placement test item selection (CAT algorithm)
    └── independent of ──> Skill trees, grammar lessons (orthogonal concern)

CEFR Placement Test
    └── requires ──> Adaptive difficulty engine (CAT item selection)
    └── requires ──> FSRS vocabulary with CEFR tags (item pool)
    └── requires ──> Grammar lesson questions (grammar section)
    └── feeds ──> Skill tree unlock state (placement result unlocks appropriate tier)
    └── feeds ──> FSRS queue initialisation (pre-seeds the right CEFR level words)
    └── feeds ──> CEFR progress reports

CEFR Progress Reports
    └── requires ──> Placement test (baseline)
    └── requires ──> FSRS CEFR-aggregated mastery
    └── integrates ──> inkjs + Amira companion dialogue (Scholar's Scroll delivery)
    └── feeds ──> Social sharing card content

Achievement Expansion (44 → 250+)
    └── requires ──> Skill trees (tree completion achievements)
    └── requires ──> Grammar expansion (grammar lesson completion achievements)
    └── requires ──> Quiz expansion (quiz-type-specific achievements)
    └── requires ──> Placement test (diagnostic achievements)
    └── requires ──> All existing systems (vocabulary, faction, calligraphy, poetry)
    └── uses ──> EventBus (74 existing constants + new achievement events)
    └── uses ──> Existing achievement toast system (v4.0)

Social Sharing Cards
    └── requires ──> FSRS vocabulary count (word count stat)
    └── requires ──> CEFR progress reports (current level)
    └── requires ──> Streak data (existing)
    └── independent of ──> Skill trees (can launch before trees complete)
    └── uses ──> html2canvas or CSS-to-canvas (check existing deps)
```

### Build Order (Critical Path)

The critical constraint: **adaptive difficulty engine and skill tree infrastructure must be early** because grammar lessons, quiz expansion, and achievements all depend on them.

```
Phase 1 — Skill Tree Infrastructure
    Reason: All other v12.0 features surface through or are gated by skill trees.
    Delivers: skillTreeSlice, 6 tree definitions, node unlock logic, UI.

Phase 2 — Grammar Expansion (A1–A2 first)
    Reason: Grammar tree (Phase 1) is built; now populate its first nodes.
    A1–A2 first (20 lessons) before B1–B2 (30 lessons) — lower content risk.

Phase 3 — Adaptive Difficulty Engine
    Reason: Must be in place before quiz expansion ships — otherwise new quiz
    types launch at fixed difficulty, creating bad UX from day one.

Phase 4 — Quiz Expansion (first 6 new types)
    Reason: Adaptive engine (Phase 3) is ready. Start with low-complexity types
    (unscramble, root matching, conjugation drill) before audio-dependent types.

Phase 5 — CEFR Placement Test
    Reason: Adaptive engine (Phase 3) provides CAT item selection. Grammar content
    (Phase 2) provides grammar section questions. Skill tree (Phase 1) receives
    placement result to unlock correct tier.

Phase 6 — Grammar Expansion (B1–B2)
    Reason: A1–A2 lessons (Phase 2) are live and tested. B1–B2 extends the pattern.

Phase 7 — Achievement Expansion (44 → 250+)
    Reason: Must be last major phase — achievements trigger on all prior systems.
    Social sharing card ships alongside.
```

---

## MVP Definition for v12.0

### Build First (Phase Foundation)

- Skill tree slice + 6 tree definitions with ~15 nodes each
- Node unlock conditions: FSRS mastery threshold, quest completion, CEFR level
- Skill tree UI: visual graph with locked/unlocked/mastered states
- Grammar lessons A1–A2 (20 lessons, 12 exercise types each)
- Adaptive difficulty engine reading FSRS signals

### Core Systems (Phase Middle)

- Quiz expansion: 6 low-complexity new types (unscramble, root matching, conjugation, cloze, odd-one-out, error correction)
- CEFR placement test (15–20 questions, CAT algorithm, result feeds skill tree unlock)
- CEFR progress reports as in-world Scholar's Scroll

### Differentiating Systems (Phase Late)

- Grammar lessons B1–B2 (30 more lessons)
- Quiz expansion: remaining 6 types (including listening if audio assets available)
- Achievement expansion (250+ across all categories)
- Social sharing card ("I learned X Arabic words")

### Defer to v13.0

- **Skill tree respec via learning path change** — Keep path-switching simple for now
- **Audio-dependent quiz types (listening, dictation)** — Only if TTS infrastructure exists; do not block milestone
- **CEFR writing assessment** (open-ended Arabic composition grading) — Requires NLP infrastructure, out of scope

---

## Complexity Summary

| Feature | Complexity | Bottleneck | Dependencies on Existing |
|---------|-----------|-----------|--------------------------|
| Skill trees (6 trees, UI, unlock logic) | HIGH | Redux slice + UI graph component | FSRS, quests, faction |
| Grammar expansion A1–A2 (20 lessons) | MEDIUM-HIGH | Content authoring (20 × 12 exercises) | Grammar component exists |
| Grammar expansion B1–B2 (30 lessons) | MEDIUM-HIGH | Content authoring (30 × 12 exercises) | Grammar component exists |
| Adaptive difficulty engine | MEDIUM | Algorithm design, FSRS signal wiring | FSRS (exists), CEFR tags (exist) |
| Quiz expansion (12 new types) | MEDIUM | Component per quiz type | FSRS (exists), quiz infrastructure |
| CEFR placement test | MEDIUM | CAT algorithm + UI flow | FSRS, grammar lessons, skill tree |
| CEFR progress reports | LOW | FSRS aggregation + ink dialogue | inkjs (v11.0), FSRS |
| Achievement expansion (250+) | MEDIUM-HIGH | Achievement condition definitions | EventBus, toast system, all systems |
| Social sharing card | LOW | html2canvas + card design | Stats slices, FSRS |

---

## Sources

- [Arabic CEFR grammar topics — arabiclang.online](https://arabiclang.online/articles/arabic-language-proficiency-levels-a-cefr-based-framework-for-msa-learners) — MEDIUM confidence (authoritative Arabic CEFR framework)
- [Arabic vocabulary counts per CEFR level — earabiclearning.com](https://earabiclearning.com/blog/2026/01/arabic-vocabulary-by-level/) — MEDIUM confidence (A1: 500–700, A2: 800–1200, B1: 1500–2000, B2: 2500–3500)
- [Arabic grammar by CEFR level — kalimah-center.com](https://kalimah-center.com/arabic-language-levels/) — MEDIUM confidence
- [Duolingo skill tree design — duolingo.fandom.com](https://duolingo.fandom.com/wiki/Language_tree) — HIGH confidence (official community wiki)
- [Meaningful skill trees design principles — gdkeys.com](https://gdkeys.com/keys-to-meaningful-skill-trees/) — MEDIUM confidence
- [Computerized Adaptive Testing (CAT) — assess.com](https://assess.com/computerized-adaptive-testing/) — HIGH confidence
- [IRT in adaptive language learning — ieeexplore.ieee.org](https://ieeexplore.ieee.org/document/8937383/) — HIGH confidence (peer-reviewed)
- [Adaptive learning technology 2025 — flowsparks.com](https://www.flowsparks.com/resources/adaptive-learning-technology) — MEDIUM confidence
- [Duolingo gamification — strivecloud.io](https://www.strivecloud.io/blog/gamification-examples-boost-user-retention-duolingo) — MEDIUM confidence
- [Duolingo Year in Review — blog.duolingo.com](https://blog.duolingo.com/year-in-review-behind-the-scenes/) — HIGH confidence (official Duolingo blog)
- [CEFR placement tests 2025 — yourfuturecareer.org](https://yourfuturecareer.org/placement-tests-for-language-courses-how-to-accurately-assess-cefr-levels) — MEDIUM confidence
- [62% self-placement error finding — yourfuturecareer.org placement test article] — MEDIUM confidence
- [Grammar lesson exercise design — eslbase.com](https://www.eslbase.com/teaching/moving-beyond-gap-fills/) — MEDIUM confidence
- [Spaced retrieval practice — retrievalpractice.org](https://pdf.retrievalpractice.org/SpacingGuide.pdf) — HIGH confidence (research PDF)
- [Achievement badges 30% course completion — easternpeak.com](https://easternpeak.com/blog/how-to-build-a-language-learning-app/) — MEDIUM confidence
- Existing codebase: PROJECT.md, FSRS vocabulary data (5,029 words), achievement system (v4.0), EventBus constants — HIGH confidence (direct inspection)

---

*Feature research for: Gogo Arabic v12.0 Learning Systems*
*Researched: 2026-03-22*
*Confidence: MEDIUM-HIGH (CEFR Arabic grammar topics from authoritative sources; CAT/IRT patterns from peer-reviewed and official sources; skill tree design from game design literature; confidence drops to MEDIUM for specific exercise-type count recommendations, which are reasoned from domain knowledge)*
