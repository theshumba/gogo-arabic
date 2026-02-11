# Expansion Research: Learning & Progression Systems

## Domain Overview

**Estimated LOC**: ~164,000
**Phases**: 39-44
**Core Principle**: Every game system is a learning system in disguise. Progression always means Arabic proficiency progression.

## Current State (v5.0)

- FSRS spaced repetition with 1,220 words across 6 quiz types
- 28 Arabic letters with progressive tashkeel fading
- 7 structured grammar lessons with exercises
- Word Duel boss battles (8 bosses, adaptive difficulty)
- Root Explorer with search and category filtering
- Reading comprehension (8 passages, 4 levels)
- Word search mini-game
- 44 achievements, daily goals, streak milestones
- Learning Path menu (3-stage: alphabet → vocabulary → grammar)

## Phase 39: Vocabulary Expansion to 5,000+ Words (~28K LOC)

### Goal
Expand from 1,220 to 5,000+ vocabulary words organized in semantic clusters, frequency tiers, and domain categories.

### Systems

**Vocabulary Database**
- 5,000+ words organized by:
  - CEFR level: A1 (500), A2 (1000), B1 (1500), B2 (1500), C1 (500+)
  - Frequency rank (based on Arabic frequency corpus)
  - Semantic domain (35 domains: food, travel, family, science, trade, nature, etc.)
  - Zone association (which zones teach which words)
  - Source context (dialogue, object, quest, combat, crafting, etc.)
- Each word entry includes:
  - Arabic (with full tashkeel)
  - Transliteration (standardized system)
  - English translation (primary + alternatives)
  - Root letters (3-letter root)
  - Part of speech
  - Example sentence (Arabic + English)
  - Audio pronunciation (native speaker)
  - Related words (synonyms, antonyms, word family)
  - Cultural note (when applicable)
  - Difficulty rating (1-10)

**Semantic Clustering**
- Words grouped by meaning relationships (not random)
- Cluster types:
  - Thematic (kitchen items, body parts, weather terms)
  - Root family (all words from same root)
  - Grammar sets (verb forms, noun patterns)
  - Situational (at the market, at school, traveling)
- Learning a cluster provides comprehension bonus
- Cluster completion tracked and rewarded
- Zone vocabulary aligned with clusters (market zone = trade cluster)

**Frequency-Based Introduction**
- New words introduced based on frequency + context
- High-frequency words appear early and often
- Low-frequency words appear in specialized contexts
- WordIntroductionManager tracks when/where words were first seen
- Contextual first encounter (word appears in meaningful dialogue, not isolation)
- First encounter always includes: visual context, audio, usage example

**Word Relationships**
- Synonym groups (20% of vocabulary has synonyms)
- Antonym pairs (15% of vocabulary)
- Word families from same root (average 4-6 per root)
- Collocations (common word pairs: يوم جميل, ماء بارد)
- Idiomatic expressions (200+ Arabic idioms)
- Proverbs (100+ Arabic proverbs as reward content)

### Combinatorial Interactions
- Vocabulary ← zone exploration (discover words in world)
- Vocabulary ← dialogue (NPCs teach contextually)
- Vocabulary ← crafting (profession-specific words)
- Vocabulary ← combat (battle-acquired words)
- Vocabulary → FSRS (all words enter spaced repetition)
- Vocabulary clusters → zone themes (semantic alignment)
- Vocabulary frequency → difficulty scaling (common words first)
- Word relationships → puzzle system (synonym/antonym puzzles)

## Phase 40: Skill Trees & Mastery (~30K LOC)

### Goal
Replace linear progression with branching skill trees where players specialize in Arabic language skills that affect gameplay.

### Systems

**Language Skill Trees (6 trees)**

*شجرة القراءة — Reading Tree*
- 30 nodes across 5 tiers
- Skills: letter recognition → word reading → sentence parsing → paragraph comprehension → literary analysis
- Gameplay effects: read signs, decipher texts, solve reading puzzles, access libraries
- Mastery unlocks: speed reading, contextual guessing, genre recognition
- Zone integration: library zones require Reading skills

*شجرة الكتابة — Writing Tree*
- 30 nodes across 5 tiers
- Skills: letter tracing → word spelling → sentence construction → paragraph writing → creative expression
- Gameplay effects: write letters to NPCs, create scrolls, sign contracts, compose poetry
- Mastery unlocks: calligraphy skill, document forging, letter crafting
- Zone integration: calligraphy zone requires Writing skills

*شجرة الاستماع — Listening Tree*
- 30 nodes across 5 tiers
- Skills: letter sounds → word recognition → sentence comprehension → conversation following → dialect understanding
- Gameplay effects: eavesdrop on NPCs, follow spoken directions, understand ambient dialogue
- Mastery unlocks: overhear secrets, understand whispers, fast dialogue comprehension
- Zone integration: Desert of Silence zone requires Listening skills

*شجرة المحادثة — Speaking/Conversation Tree*
- 30 nodes across 5 tiers
- Skills: greetings → basic questions → topic discussion → debate → persuasion
- Gameplay effects: unlock dialogue options, negotiate prices, recruit companions, persuade NPCs
- Mastery unlocks: special dialogue branches, faction negotiations, companion bonding
- Zone integration: marketplace zones reward Conversation skills

*شجرة القواعد — Grammar Tree*
- 30 nodes across 5 tiers
- Skills: noun/verb ID → sentence structure → conjugation → cases → complex grammar (إعراب)
- Gameplay effects: stronger combos, better spell construction, accurate quest interpretation
- Mastery unlocks: grammar combos in battle, precise quest instructions, formal dialogue
- Zone integration: academic zones require Grammar skills

*شجرة الثقافة — Culture Tree*
- 30 nodes across 5 tiers
- Skills: basic customs → food/dress → history → arts → philosophy
- Gameplay effects: NPC respect, zone access, special quests, cultural event participation
- Mastery unlocks: cultural dialogue options, historian quests, artifact identification
- Zone integration: all zones have cultural content to discover

**Skill Point System**
- Earn skill points through:
  - Vocabulary mastery (FSRS reviews)
  - Quest completion
  - Exploration discovery
  - Battle victory
  - Daily goals
  - Achievement unlocks
- Points spent in trees based on player preference
- No respec (choices matter, but enough points to fill 3-4 trees fully)
- Visual tree UI with Arabic labels and progress indicators

**Mastery Levels**
- Per-skill mastery: Beginner (مبتدئ) → Intermediate (متوسط) → Advanced (متقدم) → Expert (خبير) → Master (أستاذ)
- Mastery milestones unlock cosmetic rewards + gameplay bonuses
- Mastery visible on player profile
- Mastery required for some quest chains
- Mastery leaderboard (optional competitive element)

### Combinatorial Interactions
- Skill trees ← every activity in the game awards points
- Reading tree → puzzle access + library content
- Writing tree → crafting quality + scroll creation + NPC letters
- Listening tree → audio comprehension + eavesdropping
- Conversation tree → dialogue options + NPC recruitment + haggling
- Grammar tree → combat combos + spell accuracy
- Culture tree → zone access + NPC respect + artifacts
- All trees → difficulty scaling (auto-adjust based on skill level)

## Phase 41: Grammar System Expansion (~28K LOC)

### Goal
Expand from 7 grammar lessons to 50+ structured lessons covering A1-B2 Arabic grammar with game-integrated exercises.

### Systems

**Grammar Curriculum (50 lessons)**

*A1 Grammar (Lessons 1-12)*
1. Definite article (ال) and sun/moon letters
2. Gender (مذكر/مؤنث) — noun endings
3. Personal pronouns (أنا, أنت, هو, هي, etc.)
4. Simple present tense (الفعل المضارع)
5. Simple past tense (الفعل الماضي)
6. Possessive pronouns (كتابي, كتابك, كتابه)
7. Demonstrative pronouns (هذا, هذه, هؤلاء)
8. Numbers 1-10 (with gender agreement)
9. Basic prepositions (في, على, من, إلى)
10. Adjective agreement (gender + definite)
11. Simple negation (لا, ليس, ما)
12. Question words (من, ما, أين, كيف, لماذا, متى)

*A2 Grammar (Lessons 13-24)*
13. Dual form (المثنى)
14. Sound plurals (masculine + feminine)
15. Broken plurals (common patterns)
16. Idafa construction (الإضافة)
17. Comparative/superlative (أفعل/أفعل)
18. Future tense (سوف/سـ)
19. Imperative mood (الأمر)
20. Numbers 11-100 (complex agreement rules)
21. Verbal nouns (المصدر)
22. Active/passive participles (اسم الفاعل/المفعول)
23. Conjunctions and connectors (و, أو, لكن, ثم, لأن)
24. Conditional sentences (basic: إذا, لو)

*B1 Grammar (Lessons 25-37)*
25. Verb forms I-X (الأوزان) — overview
26. Form II (فعّل) — causative/intensive
27. Form III (فاعل) — reciprocal
28. Form IV (أفعل) — causative
29. Form V (تفعّل) — reflexive of II
30. Form VI (تفاعل) — reciprocal of III
31. Form VII (انفعل) — passive
32. Form VIII (افتعل) — reflexive
33. Nominal sentences (الجملة الاسمية) deep dive
34. Verbal sentences (الجملة الفعلية) deep dive
35. Relative pronouns (الذي, التي, الذين)
36. Exception particles (إلا, غير, سوى)
37. Hal clause (الحال)

*B2 Grammar (Lessons 38-50)*
38. Form IX (افعلّ) — colors/defects
39. Form X (استفعل) — requesting
40. Passive voice (المبني للمجهول) complete
41. إعراب introduction (case endings in practice)
42. Nominative case (المرفوع) usage
43. Accusative case (المنصوب) usage
44. Genitive case (المجرور) usage
45. إنّ and its sisters (إنّ, أنّ, كأنّ, لكنّ, ليت, لعل)
46. كان and its sisters (temporal/state verbs)
47. Conditional sentences advanced (لو, إن, إذا differences)
48. Tamyiz (التمييز) — specification
49. Arabic rhetorical devices (بلاغة basics)
50. Comprehensive review and integration

**Grammar Exercise Types (12 types)**
1. Fill-in-the-blank (select correct form)
2. Conjugation tables (complete the paradigm)
3. Sentence construction (build from components)
4. Error correction (find and fix grammar mistakes)
5. Transformation (change tense/voice/number)
6. Matching (pair grammar rules to examples)
7. Translation with grammar focus
8. Dictation with grammar parsing
9. Cloze passages (paragraph with blanks)
10. Grammar puzzles (crossword with grammar clues)
11. Battle grammar (grammar accuracy = combat power)
12. Dialogue grammar (choose grammatically correct response)

**Grammar in Gameplay**
- GrammarChecker validates player-constructed Arabic in:
  - Battle combo construction
  - Spell casting (root magic)
  - NPC dialogue choices
  - Quest log entries
  - Crafting item naming
  - Letter/scroll writing
- Grammar accuracy provides bonuses across all systems
- Grammar mistakes gently corrected (tooltip with explanation)

### Combinatorial Interactions
- Grammar lessons ← skill tree (Grammar Tree unlocks lessons)
- Grammar exercises ← vocabulary (uses known words)
- Grammar accuracy → battle combos (stronger attacks)
- Grammar accuracy → spell casting (root magic effectiveness)
- Grammar accuracy → dialogue quality (NPC reaction improves)
- Grammar accuracy → crafting quality (named items)
- Grammar → reading comprehension (parse complex texts)
- Grammar → writing ability (compose letters, scrolls)

## Phase 42: Quiz & Assessment Expansion (~25K LOC)

### Goal
Expand from 6 quiz types to 18, with adaptive difficulty, contextual quizzing, and integration into every game system.

### Systems

**New Quiz Types (12 additional)**

*Receptive Skills*
7. Audio recognition (hear Arabic, select meaning)
8. Sentence comprehension (read Arabic sentence, answer question)
9. Passage reading (multi-paragraph, comprehension questions)
10. Listening dialogue (hear conversation, answer questions)
11. Root identification (identify 3-letter root from word)
12. Pattern recognition (identify word pattern/وزن)

*Productive Skills*
13. Free-form Arabic typing (type answer, fuzzy matching)
14. Sentence building (drag words into correct order)
15. Conjugation challenge (conjugate verb in context)
16. Dictation (hear Arabic, type what you hear)
17. Picture description (describe scene in Arabic)
18. Story completion (continue narrative in Arabic)

**Adaptive Quiz Engine**
- AdaptiveQuizManager selects quiz type based on:
  - Word's FSRS state (new → recognition, mature → production)
  - Player's skill tree levels (high listening → more audio quizzes)
  - Recent performance (struggling → easier type, excelling → harder)
  - Context (battle → fast quizzes, study → thorough quizzes)
  - Time of day (short session → quick quizzes, long session → deep)
- Quiz difficulty micro-adjustments every 5 questions
- Performance analytics per quiz type (identify strengths/weaknesses)
- Quiz type rotation prevents boredom (never same type 3x in a row)

**Contextual Assessment**
- In-world quizzes (read Arabic sign to proceed)
- Battle assessment (Arabic accuracy IS the test)
- NPC conversation assessment (correct responses = understanding proof)
- Crafting assessment (follow Arabic recipe = practical test)
- Navigation assessment (follow Arabic directions = applied knowledge)
- Shopping assessment (haggle in Arabic = real-world simulation)

**Assessment Dashboard**
- Detailed performance analytics
- Vocabulary mastery heatmap (which words are strong/weak)
- Grammar accuracy trends over time
- Skill distribution radar chart
- Daily/weekly/monthly progress reports
- Exportable progress reports (PDF with Arabic + English)

### Combinatorial Interactions
- Quiz type ← FSRS state (spaced repetition drives type selection)
- Quiz type ← skill tree (player specialization)
- Quiz context ← current game activity (battle, crafting, dialogue)
- Quiz performance → FSRS update (rating affects interval)
- Quiz performance → skill points (good performance = more points)
- Quiz performance → NPC reactions (grammar accuracy in dialogue)
- Assessment data → difficulty scaling (across all systems)
- Assessment data → companion teaching focus (weak areas)

## Phase 43: Achievement & Reward System Expansion (~28K LOC)

### Goal
Expand from 44 to 250+ achievements spanning every game system, with meaningful rewards that drive continued engagement.

### Systems

**Achievement Categories (250+ total)**

*Language Achievements (80)*
- Vocabulary milestones (100, 500, 1000, 2000, 5000 words)
- Grammar milestones (complete lesson sets)
- Root mastery (master all derivatives of a root)
- Cluster completion (learn all words in semantic cluster)
- Quiz streaks (10, 50, 100 correct in a row)
- Skill tree completion (fill entire tree)
- CEFR level achievement (reach A1, A2, B1, B2)
- Daily review streaks (7, 30, 90, 365 days)

*Exploration Achievements (50)*
- Zone discovery (visit all 24 zones)
- Interior discovery (enter all 100+ buildings)
- Secret discovery (find all 200+ secrets)
- Map completion (100% per zone)
- Treasure hunter (find all chests)
- Artifact collector (collect all cultural artifacts)
- Viewpoint seeker (visit all scenic viewpoints)

*Combat Achievements (40)*
- Battle victories (10, 100, 500, 1000)
- Boss defeats (each boss has unique achievement)
- Combo master (achieve max combo)
- Element master (master all affinities)
- Arena champion (win tournament)
- Perfect battle (no mistakes)
- Speed battle (win under time limit)

*Social Achievements (40)*
- Companion recruitment (recruit all 12)
- Max relationship (reach level 100 with any NPC)
- Faction leader (max reputation with faction)
- Gifting (give 100+ gifts)
- Dialogue master (exhaust all topics with 50 NPCs)
- Cultural ambassador (complete all cultural quests)

*Crafting & Economy (40)*
- Profession mastery (reach level 10 in any profession)
- Recipe collection (learn all recipes in a profession)
- Economic milestones (earn 10K, 100K, 1M gold)
- Trading achievements (complete trade routes)
- Rare item creation (craft legendary items)
- Collector's portfolio (own one of every item type)

**Reward Types**
- Cosmetic rewards (outfits, mount skins, house decorations)
- Gameplay rewards (XP bonuses, gold bonuses, rare items)
- Title rewards (Arabic titles displayed on profile)
- Lore rewards (unlock backstory, historical information)
- Companion rewards (exclusive companion interactions)
- Skill point bonuses (extra points for achievement chains)

**Achievement UI**
- Achievement gallery with progress tracking
- Toast notifications with Arabic achievement names
- Achievement showcase on player profile (pin favorites)
- Achievement rarity indicators (% of players who earned)
- Achievement chains (series of related achievements)
- Secret achievements (hidden until conditions met)

### Combinatorial Interactions
- Achievements ← every game system provides achievements
- Achievement rewards → cosmetics, economy, items, skills, lore
- Achievement progress → player motivation + retention
- Achievement showcase → player profile + social display
- Achievement chains → long-term goals + progression
- Secret achievements → exploration incentive
- Achievement titles → NPC dialogue (NPCs reference titles)

## Phase 44: Adaptive Difficulty & Personalization (~25K LOC)

### Goal
Every system in the game adapts to the individual player — their Arabic level, learning pace, play style, and preferences.

### Systems

**Player Profiling**
- PlayerProfileEngine builds model from:
  - FSRS performance data (which words are easy/hard)
  - Quiz type performance (strengths in reading vs listening)
  - Play patterns (time of day, session length, frequency)
  - Game activity preference (combat vs exploration vs crafting)
  - Learning speed (words per hour, retention rate)
  - Skill tree investments (chosen specializations)
- Profile updated continuously, drives all adaptive systems
- Profile accessible to player as "learning insights" dashboard

**Difficulty Adaptation**
- Global difficulty slider: Story (easy), Normal, Scholar (hard), Master (expert)
- Per-system micro-adjustments:
  - Combat: FSRS data selects word difficulty, timer adjustments
  - Dialogue: Arabic percentage adjusts (more English for struggling, more Arabic for proficient)
  - Puzzles: hint availability and complexity
  - Quests: Arabic requirement strictness
  - Crafting: recipe complexity and error tolerance
- Adaptive thresholds prevent frustration (3 fails → offer hint/skip)
- Challenge mode for advanced players (no hints, full Arabic, timed)

**Personalized Content Selection**
- ContentSelector prioritizes:
  - Weak vocabulary (words player struggles with appear more often)
  - New vocabulary (introduce at optimal pace based on retention rate)
  - Contextual vocabulary (words relevant to current zone/quest)
  - Mixed review (blend old and new for reinforcement)
- NPC dialogue dynamically adjusts Arabic complexity
- Quest descriptions offer progressive Arabic (starts bilingual, shifts to more Arabic)
- UI language gradually shifts to Arabic labels as player improves

**Learning Analytics**
- Comprehensive analytics dashboard:
  - Words learned over time (graph)
  - Retention rate trends
  - Time spent per activity
  - Mastery distribution across CEFR levels
  - Predicted time to next CEFR level
  - Comparative stats (anonymized: "You know more words than 80% of players")
- Weekly learning reports
- Learning streaks and consistency tracking
- Exportable data for external language portfolio

**Personalized Recommendations**
- RecommendationEngine suggests:
  - "Review these 20 words before they expire"
  - "Try the Desert Marketplace — it teaches trade vocabulary you're missing"
  - "Your grammar is strong enough for Lesson 25"
  - "Companion Layla specializes in your weak area: listening"
- Recommendations appear in dashboard, from mentor NPC, and as quest suggestions
- Player can dismiss or follow recommendations

### Combinatorial Interactions
- Player profile ← FSRS + quiz + activity + skill tree data
- Difficulty ← player profile (adapts everything)
- Content selection ← vocabulary state + zone + quest + player preference
- Analytics → recommendations → player behavior → analytics (feedback loop)
- Difficulty → battle + dialogue + puzzles + crafting (affects all)
- Personalization → companion behavior (companions adapt too)
- Learning pace → content introduction rate (don't overwhelm)
- Play style → quest suggestions (combat lovers get battle quests)

## Cross-Domain Integration Summary

| Learning System | Connects To |
|----------------|-------------|
| 5,000 Words | FSRS, Zones, Dialogue, Combat, Crafting, Objects |
| 6 Skill Trees | Progression, Zones, Quests, Achievements, UI |
| 50 Grammar Lessons | Combat combos, Dialogue, Writing, Spells, Reading |
| 18 Quiz Types | FSRS, Context, Difficulty, Analytics |
| 250+ Achievements | All systems (universal reward layer) |
| Adaptive Difficulty | Player profile, All content delivery, All challenge systems |

## LOC Breakdown

| Phase | Component | Estimated LOC |
|-------|-----------|--------------|
| 39 | 5,000+ Words + Clusters + Relationships | 28,000 |
| 40 | 6 Skill Trees + Mastery + Skill Points | 30,000 |
| 41 | 50 Grammar Lessons + 12 Exercise Types | 28,000 |
| 42 | 18 Quiz Types + Adaptive Engine + Dashboard | 25,000 |
| 43 | 250+ Achievements + Rewards + UI | 28,000 |
| 44 | Adaptive Difficulty + Analytics + Personalization | 25,000 |
| **Total** | | **164,000** |

## Pedagogical Foundation

- **FSRS Algorithm**: Spaced repetition drives ALL vocabulary review scheduling
- **Comprehensible Input (Krashen)**: Content always slightly above current level (i+1)
- **Contextual Learning (Nation)**: Words taught in meaningful context, never isolated
- **Four Strands (Nation)**: Meaning-focused input, meaning-focused output, language-focused learning, fluency development — balanced across game systems
- **Active Recall**: Production quizzes (typing, speaking) weighted higher than recognition
- **Interleaving**: Grammar topics and vocabulary domains mixed for better retention
- **Desirable Difficulty (Bjork)**: Challenges optimally calibrated — hard enough to learn, easy enough to not quit

## Design Principles

1. **Learning Through Play**: Game mechanics ARE learning mechanics. No separate "study mode."
2. **Adaptive, Not Punishing**: Difficulty adjusts to keep player in flow state. Failure teaches, doesn't block.
3. **Progress Always Visible**: Player always knows how much Arabic they've learned and what's next.
4. **Arabic Everywhere**: Game UI progressively shifts to Arabic as player improves.
5. **Cultural Respect**: Language teaching includes cultural context. No stereotypes.
