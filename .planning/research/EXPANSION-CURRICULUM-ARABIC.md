# Expansion Research: Arabic Curriculum & Content Design

## Domain Overview

**Purpose**: Define the Arabic language curriculum that drives all 500K+ LOC of game content — vocabulary sequencing, grammar progression, CEFR mapping, pronunciation, root system teaching, and cultural sensitivity guidelines.

## 1. Vocabulary Architecture

### 5,000-Word Expansion Plan

**Frequency-Based Batches**
- Batch 1 (words 1-500): A1 core — survival Arabic. Highest-frequency words. Greetings, pronouns, basic verbs (كان, ذهب, أكل, شرب, كتب, قرأ), numbers 1-20, colors, family, body, food, time.
- Batch 2 (words 501-1,500): A2 functional — daily life. Common adjectives, prepositions, professions, animals, clothing, home, school, weather, emotions, health.
- Batch 3 (words 1,501-3,000): B1 independent — topic discussion. Abstract nouns, formal verbs, compound prepositions, academic terms, trade vocabulary, travel, science basics, history terms.
- Batch 4 (words 3,001-5,000): B2 advanced — nuanced expression. Literary vocabulary, philosophical terms, technical domains, rare synonyms, idiomatic expressions, rhetorical devices.

**Source Corpora**
- Buckwalter/Parkinson "Frequency Dictionary of Arabic" (top 5,000 words by frequency)
- Al-Kitaab vocabulary lists (pedagogically sequenced)
- Kelly & Zuckernick Arabic frequency list (2020 revised)
- Domain-specific additions for game context (not in frequency lists but needed for gameplay)

### Semantic Domain Mapping

| Domain | Words | CEFR | Primary Zones | Game System |
|--------|-------|------|--------------|-------------|
| Greetings/Social | 120 | A1 | All zones | Dialogue |
| Family/People | 150 | A1-A2 | Oasis Village | NPCs |
| Food/Drink | 200 | A1-B1 | Cairo, Damascus | Crafting (cooking) |
| Body/Health | 150 | A1-B1 | Damascus (hammam) | Status effects |
| Home/Furniture | 180 | A2-B1 | Interiors | Objects |
| Nature/Weather | 200 | A2-B1 | Star Oasis, Garden | Weather system |
| Travel/Directions | 180 | A1-B1 | All zones | Navigation |
| Numbers/Math | 100 | A1-B2 | Samarkand, shops | Economy |
| Colors/Shapes | 80 | A1 | Fez, Cordoba | Objects, crafting |
| Professions | 120 | A2-B1 | All zones | NPCs |
| Trade/Commerce | 200 | A2-B2 | Marketplace, Timbuktu | Economy |
| Education/Knowledge | 200 | A2-B2 | Baghdad, libraries | Skill trees |
| Craft/Materials | 180 | B1-B2 | Damascus, Cordoba | Crafting |
| Military/Combat | 150 | B1-B2 | Fortress, Royal Palace | Battle |
| Religion/Culture | 120 | A2-B2 | All zones | Lore |
| Emotions/Abstract | 200 | B1-B2 | Granada, Garden | Narrative |
| Science/Astronomy | 150 | B1-B2 | Baghdad, Samarkand | Puzzles |
| Sea/Navigation | 120 | B1 | Coastal Port, boats | Transport |
| Architecture | 120 | B1-B2 | Cordoba, Cairo | Objects |
| Music/Arts | 80 | B1-B2 | Granada, Garden | Lore |
| Law/Government | 100 | B2 | Royal Palace | Factions |
| Philosophy | 100 | B2 | Baghdad, libraries | Lore |
| Animals | 120 | A1-B1 | Various | Objects, mounts |
| Clothing/Textiles | 100 | A2-B1 | Fez, Damascus | Equipment |
| Tools/Instruments | 100 | B1 | Workshops | Crafting |
| Time/Calendar | 100 | A1-B1 | All zones | Time system |
| Geography/Land | 120 | A2-B1 | World map | Navigation |
| Plants/Agriculture | 100 | B1 | Garden, Oasis | Crafting |
| Writing/Books | 120 | A2-B2 | Libraries, Timbuktu | Lore, skill tree |
| Cooking/Kitchen | 100 | A2-B1 | Interiors | Crafting |
| Medicine/Healing | 100 | B1-B2 | Baghdad (hospital) | Crafting (herbalist) |
| Metals/Mining | 80 | B1-B2 | Damascus, Mountain | Crafting (blacksmith) |
| Games/Entertainment | 60 | A2-B1 | Various | Mini-games |
| Proverbs/Idioms | 200 | B1-B2 | NPCs, lore | Dialogue, codex |
| Historical Terms | 150 | B1-B2 | Real city zones | Lore |

### Requirements
- CURR-01: Vocabulary divided into 4 frequency-based batches aligned with CEFR levels
- CURR-02: Each word assigned to 1-3 semantic domains for clustering
- CURR-03: Each word assigned to 1+ zones where it naturally appears
- CURR-04: Each word has root, part of speech, example sentence, and audio
- CURR-05: Domain vocabulary distributed across zones to avoid front-loading

## 2. Grammar Sequencing

### Pedagogically-Ordered Grammar Scope

**Principle**: Follow natural acquisition order (Krashen) + functional need (Ryding). Grammar is introduced when the game needs it, not when a textbook would order it.

**Zone-Grammar Alignment**

| Zone (CEFR) | Grammar Focus | Why Here |
|-------------|--------------|----------|
| Oasis Village (A1) | Articles, pronouns, basic present, simple questions | Meet NPCs, ask basic questions |
| Desert Marketplace (A2) | Numbers, adjectives, comparatives, imperatives | Buy/sell, describe items, negotiate |
| Ancient Library (A2) | Past tense, possessives, demonstratives, idafa | Talk about history, describe books |
| Baghdad (B1) | Verb forms I-IV, nominal sentences, relative pronouns | Academic discussion, translations |
| Damascus (B1) | Imperative, verbal nouns, active participles | Follow craft instructions |
| Timbuktu (B1) | Conjunctions, conditionals (basic), plurals (broken) | Navigate trade routes, follow complex directions |
| Coastal Port (B1) | Future tense, weather expressions, dual form | Plan journeys, discuss weather, pairs |
| Cordoba (B2) | Passive voice, verb forms V-X, hal clause | Describe architecture, poetry |
| Cairo (B2) | إنّ sisters, كان sisters, case endings intro | Formal speech, scholarly debate |
| Fez (B2) | Tamyiz, exception particles, complex conditionals | Precise craft instructions, detailed descriptions |
| Samarkand (B2) | Mathematical Arabic, إعراب practice | Solve math problems, formal Arabic |
| Granada (B2) | Rhetorical devices, poetic forms | Compose poetry, express emotions |

### Grammar Exercise Integration

Each grammar point has exercises in:
1. **Explicit lesson** (study room) — formal explanation with examples
2. **Dialogue practice** (NPC conversation) — use in context
3. **Quest application** (objectives stated using grammar) — functional use
4. **Battle mechanic** (grammar combos) — gamified practice
5. **Puzzle application** (grammar-based puzzles) — problem-solving

### Requirements
- CURR-06: Grammar follows natural acquisition order (not textbook order)
- CURR-07: Each grammar point introduced in functional context (zone where it's needed)
- CURR-08: Each grammar point practiced across 5+ activity types
- CURR-09: Grammar errors in productive activities provide explanation, not just correction
- CURR-10: Grammar mastery tracked per topic (not just "completed lesson")

## 3. Root System Teaching Methodology

### Arabic Root Pedagogy

**Introduction Sequence**
1. Phase 1 (A1): Concept introduction — "Arabic words come from 3-letter families"
2. Phase 2 (A1): First 20 high-frequency roots with 3-4 derivatives each
3. Phase 3 (A2): Root Explorer tool unlocked, 50 more roots
4. Phase 4 (A2-B1): Root magic system in combat (Phase 28)
5. Phase 5 (B1+): Pattern recognition (وزن system) — predict meaning from root + pattern

**High-Priority Roots (First 50)**

| Root | Meaning | Key Derivatives |
|------|---------|----------------|
| ك-ت-ب | write | كتاب, كاتب, مكتبة, كتابة, مكتوب |
| ع-ل-م | know | عالم, علم, معلم, تعليم, علامة |
| ق-ر-أ | read | قراءة, قارئ, قرآن |
| د-ر-س | study | درس, مدرسة, مدرّس, دراسة |
| ف-ت-ح | open | فتح, مفتاح, فتاح, فاتحة |
| ح-م-ل | carry | حمل, حامل, محمول |
| ع-م-ل | work | عمل, عامل, معمل, عملية |
| ج-م-ع | gather | جمع, جامع, مجموعة, جامعة |
| س-ف-ر | travel | سفر, مسافر, سفير, سفارة |
| ط-ب-خ | cook | طبخ, مطبخ, طابخ, طبّاخ |
| ب-ي-ع | sell | بيع, بائع, مبيعات |
| ش-ر-ب | drink | شرب, مشروب, شراب |
| ح-ك-م | rule/judge | حكم, حاكم, حكمة, محكمة |
| ص-ن-ع | make | صنعة, صانع, مصنع, صناعة |
| ن-ظ-ر | look | نظر, منظر, نظارة, نظرية |
| (35 more in full curriculum) | | |

### Root Magic Integration
- Root = spell foundation (Phase 28)
- Knowing root's derivatives = stronger spells
- Root mastery tracked in FSRS
- Root families displayed in vocabulary explorer
- Root discovery through gameplay (find related words, connect to root)

### Requirements
- CURR-11: Root concept introduced in Act 1 (first hour of gameplay)
- CURR-12: 50 high-frequency roots taught explicitly by end of B1 content
- CURR-13: Root families linked in vocabulary database (automatic discovery)
- CURR-14: Root magic system reinforces root awareness through gameplay
- CURR-15: Root awareness assessment included in skill tree progression

## 4. Pronunciation & Audio

### Arabic Phoneme Inventory

**Sounds Not in English (Priority Teaching)**
- ع (ayn) — voiced pharyngeal fricative
- غ (ghayn) — voiced velar fricative
- ح (ha) — voiceless pharyngeal fricative
- خ (kha) — voiceless velar fricative
- ص (sad) — emphatic s
- ض (dad) — emphatic d
- ط (ta) — emphatic t
- ظ (zha) — emphatic z/dh
- ق (qaf) — voiceless uvular stop
- ه (ha) — voiceless glottal fricative (vs English h)
- ء (hamza) — glottal stop

**Teaching Approach**
- Minimal pairs: contrast similar sounds (ح vs خ, ص vs س, ط vs ت)
- Audio first: hear the sound before seeing the letter
- Native speaker recordings for all 5,000 words
- Phoneme isolation exercises in listening skill tree
- Environmental audio: NPCs speak Arabic with proper pronunciation

**Audio Assets Required**
- 5,000 individual word recordings (native speaker, MSA, clear pronunciation with tashkeel)
- 300+ sentence recordings (for listening comprehension)
- 50+ dialogue recordings (for immersive conversations)
- 28 letter name/sound recordings
- Ambient Arabic speech (market chatter, scholarly murmur, greetings)
- Note: ALL audio is SFX/voice — NO music in the game

### Requirements
- CURR-16: All 5,000 words have native speaker audio pronunciation
- CURR-17: Difficult phonemes (11 non-English sounds) have dedicated practice activities
- CURR-18: Minimal pair exercises for confusable sounds
- CURR-19: Audio pronunciation playable from any word display (tap to hear)
- CURR-20: Ambient Arabic speech in zone soundscapes

## 5. Cultural Sensitivity Guidelines

### Content Principles

**Respectful Representation**
- Historical accuracy: real cities at real periods, researched for accuracy
- Cultural practices shown respectfully and in context
- No stereotyping of Arab/Muslim cultures
- Diversity within Arabic-speaking world represented (North Africa, Levant, Gulf, sub-Saharan)
- Women NPCs in historically accurate roles (scholars, merchants, artisans — not just domestic)

**Hard Constraints (from user)**
- NO music in the game (ambient sounds + SFX only)
- NO eyes or faces on characters (Islamic art tradition — faceless pixel characters)
- NO god or deity characters (no divine beings, no worship mechanics)
- NO gambling mechanics (no loot boxes, no random chance purchases)
- NO alcohol references in positive context
- NO romantic/sexual content

**Cultural Content Guidelines**
- Mosques/prayer referenced culturally (architecture, time-keeping, community) not as religious mechanics
- Historical Islamic scholars celebrated for contributions to knowledge (math, astronomy, medicine, philosophy)
- Arabic calligraphy celebrated as art form
- Arabic poetry and literature featured prominently
- Cultural festivals shown as community events (not religious rituals)
- Hijri calendar referenced for cultural context (time system)
- Food culture featured extensively (halal by default, no need to label)

**Avoiding Problematic Content**
- No "exotic orient" framing — these are real places with real people
- No "white savior" narrative — player is a scholar, not a conqueror
- No military conquest narrative — focus on knowledge, trade, and culture
- No simplified "good vs evil" framing of historical conflicts
- NPCs have nuanced views, not one-dimensional cultural mouthpieces
- No fetishization of Arabic script (it's a living language, not decoration)

### Requirements
- CURR-21: All historical content reviewed for accuracy
- CURR-22: Women NPCs in diverse roles (scholars, merchants, leaders, artisans) not just domestic
- CURR-23: No deity/divine characters or worship mechanics
- CURR-24: No character faces or eyes (Islamic art constraint)
- CURR-25: No music — ambient sounds only
- CURR-26: Cultural practices presented in context with explanation
- CURR-27: Arabic calligraphy treated as serious art form, not decoration
- CURR-28: Player character is a scholar (seeker of knowledge), not a conqueror

## 6. Zone-by-Zone Curriculum Mapping

### Oasis Village (Tutorial — A1)
**Vocabulary**: 50 core words (greetings, directions, basic objects, family, food)
**Grammar**: Definite article, gender, personal pronouns, basic present tense
**Culture**: Village life, hospitality customs, Arabic greetings etiquette
**Root families**: ك-ت-ب (write), ق-ر-أ (read), ع-ل-م (know), س-ل-م (peace)
**Assessment gate**: Read Arabic greeting, respond to basic question

### Desert Marketplace (A2)
**Vocabulary**: 200 words (trade, numbers, food, clothing, animals, adjectives)
**Grammar**: Numbers 1-20, comparatives, adjective agreement, imperatives
**Culture**: Souk culture, haggling etiquette, weights and measures
**Root families**: ب-ي-ع (sell), ش-ر-ي (buy), ث-م-ن (price), ح-س-ب (count)
**Assessment gate**: Complete a purchase in Arabic (haggle for price)

### Ancient Library (A2)
**Vocabulary**: 200 words (books, knowledge, history, writing, time)
**Grammar**: Past tense, possessives, demonstratives, idafa construction
**Culture**: House of learning, manuscript preservation, scholarly tradition
**Root families**: د-ر-س (study), ح-ف-ظ (preserve), ن-ق-ل (transfer), ف-ه-م (understand)
**Assessment gate**: Read and summarize a short Arabic text

### Baghdad (B1)
**Vocabulary**: 300 words (science, medicine, astronomy, translation, academic)
**Grammar**: Verb forms I-IV, nominal sentences, relative pronouns
**Culture**: House of Wisdom, translation movement, Islamic Golden Age science
**Root families**: ت-ر-ج-م (translate), ط-ب-ب (medicine), ح-س-ب (calculate), ف-ل-ك (astronomy)
**Assessment gate**: Participate in scholarly discussion (multi-turn dialogue)

### Damascus (B1)
**Vocabulary**: 250 words (crafts, metals, tools, body, health, directions in souk)
**Grammar**: Imperative mood, verbal nouns, active participles
**Culture**: Damascene metalwork, souk navigation, hammam customs
**Root families**: ص-ن-ع (craft), ح-د-د (metal/iron), ق-ط-ع (cut), ص-ح-ح (health)
**Assessment gate**: Follow Arabic craft instructions to complete an item

### Timbuktu (B1)
**Vocabulary**: 250 words (trade routes, desert, manuscripts, directions, supplies)
**Grammar**: Conjunctions, basic conditionals, broken plurals
**Culture**: Trans-Saharan trade, Sankore University, manuscript tradition
**Root families**: ت-ج-ر (trade), س-ف-ر (travel), خ-ط-ط (manuscript/write), ص-ح-ر (desert)
**Assessment gate**: Navigate a trade route using Arabic directions

### Coastal Port (B1)
**Vocabulary**: 200 words (sea, boats, weather, fishing, navigation)
**Grammar**: Future tense, weather expressions, dual form
**Culture**: Maritime trade, boat building, fishing communities, star navigation
**Root families**: ب-ح-ر (sea), ر-ك-ب (ride/board), ص-ي-د (fish/hunt), ن-ج-م (star)
**Assessment gate**: Give sailing directions using Arabic compass points

### Cordoba (B2)
**Vocabulary**: 300 words (architecture, poetry, gardens, art, geometry)
**Grammar**: Passive voice, verb forms V-X, hal clause
**Culture**: Al-Andalus civilization, coexistence, architectural innovation, Andalusian poetry
**Root families**: ب-ن-ي (build), ش-ع-ر (poetry/feel), ز-ر-ع (plant/cultivate), ه-ن-د-س (engineer)
**Assessment gate**: Compose a simple Arabic poem (2-4 lines with rhyme)

### Cairo (B2)
**Vocabulary**: 300 words (astronomy, festivals, government, food, architecture)
**Grammar**: إنّ sisters, كان sisters, case endings introduction
**Culture**: Fatimid Cairo, Al-Azhar, Khan el-Khalili, Nile culture
**Root families**: ح-ك-م (govern/judge), ع-ي-د (festival), ب-ن-ي (build), ن-ج-م (star)
**Assessment gate**: Formal speech to scholarly council (correct grammar required)

### Remaining Zones (B2)
- Fez: tamyiz, exception particles (color/material vocabulary)
- Samarkand: mathematical Arabic, إعراب practice (number/geometry vocabulary)
- Granada: rhetorical devices, poetic forms (emotional/nature vocabulary)
- Fantasy zones: mixed difficulty, adaptive to player level

## 7. Assessment & Progression Milestones

### CEFR Can-Do Statements Mapped to Game

**A1 Complete (Zone gate: leave Oasis Village)**
- Can understand and use familiar everyday expressions
- Can introduce themselves and ask/answer personal questions
- Game proof: Complete tutorial, have 3 NPC conversations, read 5 signs

**A2 Complete (Zone gate: access B1 zones)**
- Can communicate in simple routine tasks
- Can describe aspects of background, immediate environment, matters of immediate need
- Game proof: Complete marketplace purchase, navigate library, write short message

**B1 Complete (Zone gate: access B2 zones)**
- Can deal with most situations likely to arise while traveling
- Can produce simple connected text on familiar topics
- Game proof: Complete scholarly discussion, follow complex directions, give instructions

**B2 Complete (Game completion)**
- Can understand main ideas of complex text
- Can interact with degree of fluency that makes interaction with native speakers possible
- Game proof: Read complete manuscript, compose poetry, formal debate, write journal in Arabic

### Requirements
- CURR-29: Each zone has explicit CEFR-aligned assessment gate
- CURR-30: Can-do statements mapped to in-game achievements
- CURR-31: Player can see which can-do statements they've demonstrated
- CURR-32: Zone transitions require demonstrated language ability (not just XP)

## 8. Content Volume Estimates

### Text Content

| Content Type | Count | Avg Arabic Words | Total Arabic Words |
|-------------|-------|-----------------|-------------------|
| NPC dialogue lines | 15,000 | 15 | 225,000 |
| Quest descriptions | 250 | 50 | 12,500 |
| Lore codex entries | 300 | 100 | 30,000 |
| Item descriptions | 500 | 20 | 10,000 |
| Environmental text | 1,000 | 5 | 5,000 |
| Grammar explanations | 50 | 200 | 10,000 |
| Cutscene dialogue | 500 | 30 | 15,000 |
| Tutorial text | 100 | 25 | 2,500 |
| **Total** | | | **310,000** |

### Audio Content

| Audio Type | Count | Avg Duration | Total Hours |
|-----------|-------|-------------|-------------|
| Word pronunciations | 5,000 | 2s | 2.8h |
| Sentence recordings | 300 | 5s | 0.4h |
| Dialogue audio | 500 | 8s | 1.1h |
| Ambient Arabic speech | 24 | 5min (loops) | 2.0h |
| SFX | 200 | 1s | 0.06h |
| **Total** | | | **~6.4h** |

## 9. NPC Arabic Specialization Map

### Teaching Distribution

Each NPC has a primary Arabic teaching role:

**Vocabulary Teachers (150 NPCs)**
- Zone merchants teach trade vocabulary through transactions
- Home NPCs teach domestic vocabulary through hospitality
- Craft NPCs teach material/tool vocabulary through instruction
- Scholar NPCs teach academic vocabulary through discussion
- Nature NPCs teach environment vocabulary through exploration

**Grammar Teachers (30 NPCs — Scholar category)**
- Each grammar lesson has a dedicated Scholar NPC
- Scholars found in libraries, universities, study rooms
- Progressive unlocking: new scholars appear as grammar knowledge grows
- Scholars reference each other ("Go talk to the grammar sage in Baghdad")

**Culture Teachers (50 NPCs)**
- Historians teach through lore and stories
- Festival organizers teach through event participation
- Elders teach through wisdom and proverbs
- Artisans teach through demonstration and craft vocabulary

**Pronunciation Coaches (12 NPCs — one per zone)**
- Each zone has a "pronunciation guide" NPC
- Focuses on sounds relevant to zone vocabulary
- Minimal pair practice for confusable sounds
- Encourages and corrects gently

### Requirements
- CURR-33: Every NPC has assigned Arabic teaching specialty
- CURR-34: Vocabulary distribution across NPCs covers all 35 semantic domains
- CURR-35: Grammar scholars available for all 50 grammar lessons
- CURR-36: Pronunciation coaches teach zone-relevant difficult sounds

## 10. Progression Pace Design

### Target Learning Rate

| Metric | Target | Basis |
|--------|--------|-------|
| New words per hour of play | 15-25 | Optimal acquisition rate (Nation) |
| Grammar points per week | 2-3 | Natural order spacing |
| Root families per session | 1-2 | Root concept reinforcement |
| FSRS reviews per session | 30-50 | Optimal session length research |
| Time to A1 | 8-12 hours | Faster than classroom (game motivation) |
| Time to A2 | 25-35 hours | Accelerated through context richness |
| Time to B1 | 60-80 hours | Deep game content at this level |
| Time to B2 | 120-160 hours | Full game completion timeframe |

### Session Design
- **Short session (15 min)**: 1 quest + 20 FSRS reviews + 1 NPC conversation = ~5 new words
- **Medium session (45 min)**: 3 quests + 40 reviews + exploration + 1 battle = ~15 new words
- **Long session (2+ hours)**: Story progression + multiple quests + crafting + reviews = ~30 new words

### Anti-Burnout
- Maximum 50 new words per day (even if player could handle more)
- FSRS review cap per session (configurable: default 50)
- Recommendation to take breaks (after 90 min continuous play)
- "Review only" mode for low-energy sessions
- New content gates ensure vocabulary is acquired before moving forward

### Requirements
- CURR-37: New word introduction rate capped at 15-25 per hour
- CURR-38: FSRS review sessions capped (configurable, default 50)
- CURR-39: Zone gates enforce minimum vocabulary before advancement
- CURR-40: Anti-burnout recommendations after 90 min continuous play
- CURR-41: Game completable in 120-160 hours (B2 achievement)

## Cross-Reference Matrix

| Curriculum Component | Game Phases | PEDA Requirements |
|---------------------|-------------|-------------------|
| 5,000 vocabulary | 39, 25 | PEDA-29, 30, 35, 36, 37 |
| 50 grammar lessons | 41 | PEDA-04, 25, 27 |
| Root system | 28, 39 | PEDA-38, 39 |
| Pronunciation/audio | 39, 44 | PEDA-30, 31 |
| Cultural sensitivity | 47, 51 | PEDA-34 |
| CEFR alignment | 44 | PEDA-54, 55, 56, 57 |
| Zone curriculum | 33, 24 | PEDA-01, 08, 09 |
| NPC teaching | 47, 20 | PEDA-02, 32, 34 |
| Pacing | 44 | PEDA-07, 50, 53 |

## Summary

| Component | Count |
|-----------|-------|
| Vocabulary words | 5,000+ |
| Semantic domains | 35 |
| Grammar lessons | 50 |
| Root families | 700+ (50 explicitly taught) |
| Audio recordings | ~5,800 |
| Arabic text (total) | ~310,000 words |
| CEFR levels covered | A1-B2 |
| Target completion time | 120-160 hours |
| Curriculum requirements | 41 (CURR-01 through CURR-41) |
| Pedagogy requirements | 47 (PEDA-01 through PEDA-57) |
| **Total requirements** | **88** |
