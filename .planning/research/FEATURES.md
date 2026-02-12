# Feature Research: Root Magic, Equipment, & Companion Systems

**Domain:** Arabic Learning RPG — Language-based spell systems, inventory/economy, AI companions
**Researched:** 2026-02-12
**Confidence:** MEDIUM (based on RPG genre conventions + existing game architecture analysis)

**Note on Sources:** This research is based on training data knowledge of RPG systems (Final Fantasy, Pokemon, Persona, Skyrim, Divinity), language learning games (Duolingo, Babbel), and hybrid systems. No live web research was available, so findings are marked MEDIUM confidence and should be validated against current 2026 game design trends.

---

## Feature Landscape

### 1. ROOT MAGIC SYSTEM (Language-Based Spell Casting)

#### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Spell Discovery** | Players expect to unlock spells through gameplay, not have everything from start | MEDIUM | Already mapped: 50 root-element mappings exist. Need unlock progression. |
| **Mana/Resource System** | Spell casting needs cost/limitation to prevent spam | LOW | Already exists: playerMP/playerMaxMP in battleSlice |
| **Damage Scaling** | Spell power must scale with player level/mastery | MEDIUM | Requires: root mastery level × grammar accuracy × affinity bonus |
| **Visual Feedback** | Distinct visual for each element/root family | HIGH | 10 elements = 10+ particle systems. Currently: basic ParticleEffectManager exists. |
| **Spell List UI** | Browse, search, filter learned spells | MEDIUM | Similar to existing Root Explorer. Dependencies: vocabulary mastery data. |
| **MP Recovery** | In-battle and out-of-battle MP restoration | LOW | Already stubbed: restoreMP action. Need: rest points, items, turn regen. |
| **Elemental Weaknesses** | Rock-paper-scissors interactions (fire > plant, water > fire) | MEDIUM | Need: enemy element data + weakness multiplier matrix (10x10) |
| **Target Selection** | Single target vs multi-target spells | MEDIUM | Depends on Phase 32 multi-target battles |
| **Spell Upgrade Path** | Same root → stronger forms (Form I → Form X verbs) | HIGH | Requires: Arabic morphology system + 10 verb forms per root family |

**Dependencies:**
- Root Explorer (exists in v5.0)
- FSRS vocabulary mastery (exists)
- Grammar lesson completion tracking (partial — 7 lessons exist, need 50)
- Affinity discovery system (planned Phase 28)

#### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Root Derivation Combos** | Combining different words from same root creates combo effects (ك-ت-ب: كِتَاب + كَاتِب = scholar's blessing) | HIGH | Core pedagogical value: teaches morphological relationships. Requires derivation graph data. |
| **Grammar-Based Modifiers** | Correct conjugation/declension adds effects (dual = hits 2 enemies, plural = AOE, passive = reflect) | VERY HIGH | Unique to language learning. Teaches grammatical concepts through mechanics. Complex validation. |
| **Calligraphic Casting** | Trace Arabic letters during spell cast for power boost (touchscreen/mouse mini-game) | MEDIUM | Tactile learning, teaches letter forms. Similar to DS game letter tracing. |
| **Sentence Construction Ultimates** | Building grammatically correct sentences = most powerful attacks | HIGH | Ultimate teaching moment. Already planned in Phase 32 combos. |
| **Semantic Field Synergies** | Casting related roots in sequence (all water-meaning roots) creates chain bonus | MEDIUM | Teaches semantic relationships. Requires semantic tagging of 5,000+ words. |
| **Arabic Pronunciation Power** | (Future) Speaking word aloud correctly amplifies spell (Web Speech API) | VERY HIGH | Deferred until voice infrastructure. Would be groundbreaking for pronunciation. |

**Unique Selling Point:** No other RPG teaches a real language through magic. Every spell cast is a learning moment.

#### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Free-form Spell Creation** | "Let players invent their own spells!" | Arabic has ~10K roots, exponential combinations = balance nightmare, impossible to validate | **Structured discovery:** Predefined spells from authentic root meanings, player unlocks through mastery |
| **Dual-Language Casting** | "Let players cast in English or Arabic for accessibility" | Undermines core learning loop, creates crutch | **Difficulty tiers:** Easy mode = multiple choice Arabic, never English casting |
| **Pure Element System (no language)** | "Just pick fire/water element, skip the Arabic" | Defeats entire purpose of game, reduces to generic RPG | **Hard constraint:** Every spell requires Arabic input, period. |
| **Real-Time Spell Input** | "Type Arabic word during action time limit" | Too stressful for learners, creates negative affect, violates Krashen low-filter principle | **Turn-based prompts:** Arabic input during player turn with no time pressure (optional challenge mode) |
| **Automatic Best Spell Selection** | "AI picks optimal spell for me" | Removes decision-making, no exposure to vocabulary variety | **Spell recommendations:** Suggest 3 options with Arabic meanings, player chooses |

---

### 2. EQUIPMENT & INVENTORY SYSTEM

#### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Equipment Slots** | Standard body parts with gear | LOW | Already planned: 8 slots (head, robe, cloak, belt, boots, gloves, 2 accessories) |
| **Stat Comparisons** | See current vs new gear stats | LOW | Standard RPG pattern: green/red numbers, side-by-side panel |
| **Rarity Tiers** | Visual distinction between common/rare/legendary | LOW | Already planned: 5 tiers with Arabic color names |
| **Sort & Filter** | By type, rarity, stats, acquisition date | MEDIUM | Already planned: includes Arabic alphabetical (teaches abjad order) |
| **Auto-Sort/Auto-Equip** | QOL for managing 200+ items | LOW | Standard convenience feature |
| **Equipment Durability** | Gear wears out or requires repair | MEDIUM | Common in survival/crafting RPGs. Drives economy loop. |
| **Weight/Carry Limit** | Can't hoard infinitely | LOW | Or use slot limit (200 items). Weight more realistic but finicky. |
| **Quick-Equip Loadouts** | Save/swap equipment sets | MEDIUM | Essential for elemental strategy (fire set vs water enemy) |
| **Tooltips** | Hover for full item details | LOW | Already standard in existing UI patterns |
| **Stacking** | Consumables stack to save space | LOW | Already planned for consumables |

**Dependencies:**
- Crafting system (Phase 31) for gear sources
- Economy/shops (Phase 29) for buying/selling
- Battle system (Phase 27) for stat effects

#### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Vocabulary-Locked Affixes** | Item bonus only activates after learning the Arabic adjective (حاد sharp, مبارك blessed) | MEDIUM | Directly teaches adjectives, creates motivation to learn. FSRS integration. |
| **Historical Item Lore** | Every item has Arabic cultural/historical context snippet | MEDIUM | Educational value. Teaches Islamic Golden Age history, crafts, trade. |
| **Arabic Naming Rights** | Player names crafted items in Arabic (keyboard input, validation) | MEDIUM | Writing practice, ownership, creative expression. |
| **Haggling Mini-Game** | Arabic number negotiation at shops (type price in Eastern Arabic numerals) | HIGH | Teaches numbers 0-9999, practical haggling phrases, cultural practice. |
| **Set Bonuses with Themes** | Scholar's Set, Merchant's Set, Artisan's Set (teach domain vocabulary) | MEDIUM | Thematic vocabulary clusters (profession-specific words). |
| **Equipment as Quest Items** | Some gear pieces are quest objectives (find the lost sword = learn weapon vocab) | LOW | Story integration, vocabulary exposure. |
| **Inscription System** | Engrave Arabic phrases onto weapons (player types phrase, gets custom stat) | HIGH | Creative writing, teaches blessing/protection phrases. |

**Unique Angle:** Every piece of equipment is a vocabulary lesson with cultural context.

#### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Loot Box Gacha** | "Exciting random rewards!" | Predatory monetization, removes agency, gambling mechanics inappropriate for educational game | **Crafting + Discovery:** Deterministic rewards from exploration, quests, crafting |
| **Infinite Inventory** | "Just let me keep everything" | Removes strategic decisions, analysis paralysis with 1000+ items | **200-slot limit:** Forces curation, selling creates economy engagement |
| **Transmog/Cosmetic Override** | "Wear stats but look different" | Already solved by outfit system (12 outfits cosmetic, equipment stats separate) | **Layered system:** Outfit = appearance, equipment = stats (don't merge) |
| **Real-Money Item Shop** | "Monetization through gear sales" | Pay-to-win, undermines learning loop, inappropriate for education | **Earned progression:** All gear through gameplay, crafting, quests |
| **Weapon Durability on Hit** | "Realistic wear and tear" | Tedious micromanagement, punishes experimentation, creates anxiety | **Optional repair:** Gear has condition, low = reduced stats, repair at blacksmith (not breakage) |

---

### 3. COMPANION SYSTEM (AI Party Members)

#### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Companion Recruitment** | Find/unlock companions through story | LOW | Already planned: 12 companions, 2 per major zone |
| **Party Formation** | Choose active companion(s) from roster | LOW | Already planned: max 2 active (1 battle, 1 exploration) |
| **Battle AI** | Companions act autonomously in combat | MEDIUM | Already planned: CompanionBattleAI by role (attacker/defender/healer/support) |
| **Companion Stats** | Each has unique abilities, strengths, weaknesses | MEDIUM | Level progression, equipment slots, skill trees |
| **Relationship Meter** | Friendship/trust increases through interaction | LOW | Standard 0-100 meter, affects dialogue/abilities |
| **Companion Quests** | Personal storylines for each companion | HIGH | Already planned: 3-5 quests each = 36-60 quests total |
| **Gifting System** | Give items to raise relationship | LOW | Pokemon Amie, Stardew Valley pattern |
| **Dialogue Variety** | Context-aware comments during exploration | MEDIUM | Already planned: 200+ lines per companion |
| **Swap Anywhere** | Change active companion at camps/towns | LOW | Prevents backtracking frustration |
| **Companion Dismissal** | Send companion away if player wants solo | LOW | Player agency, optional challenge |

**Dependencies:**
- NPC dialogue system (exists in v5.0: hub-and-spoke, conditions, effects)
- Quest system (exists: 52 quests, need expansion to 250+)
- Battle system (Phase 27)
- Relationship tracking (new slice needed)

#### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Language Teaching Roles** | Each companion specializes (grammar, vocabulary, pronunciation, culture) | MEDIUM | Persona-style social link + education. 12 companions = 12 Arabic sub-domains. |
| **Adaptive Dialogue Difficulty** | Companion Arabic complexity scales with player CEFR level | HIGH | Early: mostly English. Mid: bilingual. Late: mostly Arabic. Drives immersion. |
| **Mistake Correction** | Companion gently corrects player's Arabic errors in dialogue choices | MEDIUM | Pedagogical value: immediate feedback, low-pressure. Shows correct form. |
| **Conversational Practice** | Dialogue trees are language practice (player types Arabic responses) | HIGH | Beyond multiple choice: free-form input with validation. Advanced feature. |
| **Cultural Mentorship** | Companions explain cultural context of words, phrases, customs | MEDIUM | Educational content delivery through relationship. Builds cultural competency. |
| **Companion Memory** | Remembers previous conversations, player's learning progress, past events | HIGH | Creates continuity, personalization. Requires event tracking + dialogue state. |
| **Battle Combo Synergies** | Specific companion + player spell combos (teach paired vocabulary) | MEDIUM | Fire companion + water player = steam (بخار). Teaches related concepts. |
| **Mood-Based Teaching** | Companion mood affects teaching style (encouraging, challenging, playful) | MEDIUM | Emotional intelligence, adapts to player performance. |
| **Idle Conversations** | Companions chat with each other in player's party (teach natural dialogue) | HIGH | Realistic language exposure, social dynamics. Multiple companions = interactions. |

**Unique Value:** No other game combines JRPG companion depth with language pedagogy.

#### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Romance Options** | "Persona/Fire Emblem have romance!" | Cultural insensitivity (Islamic context), scope creep, inappropriate for some age groups | **Deep Friendship:** Meaningful platonic bonds, mentorship, found family themes |
| **Permadeath** | "Stakes and tension!" | Too punishing for educational game, losing language teacher = frustration | **Defeat = Temporary:** Companion unavailable until rest, no permanent loss |
| **Companion PvP** | "Let companions fight each other" | Tonal mismatch (collaborative learning game), narrative dissonance | **Cooperative Focus:** Companions train together, spar for practice (friendly) |
| **Full Party Control** | "Manual control all 3 party members" | Overwhelming for learners, slows combat, complex UI | **Trust the AI:** Player controls self, companions act autonomously (can suggest actions) |
| **Companion Karma/Evil Paths** | "Morality system for companions" | Binary good/evil inappropriate for nuanced cultural teaching | **Personality Differences:** Companions have perspectives, not morality meters |

---

## Feature Dependencies

### Dependency Graph

```
ROOT MAGIC SYSTEM
    └──requires──> FSRS Vocabulary Data (exists)
    └──requires──> Root Explorer (exists)
    └──requires──> Grammar Lessons (partial: 7/50)
    └──requires──> Affinity System (Phase 28)
    └──enhances──> Battle System (Phase 27)
    └──enhances──> Companion Combos (Phase 30)

EQUIPMENT SYSTEM
    └──requires──> Battle Stats (Phase 27)
    └──requires──> Economy/Shops (Phase 29)
    └──requires──> Crafting System (Phase 31)
    └──requires──> Inventory Slice (new)
    └──enhances──> Player Customization (outfit system exists)
    └──conflicts──> Outfit cosmetics (need separation)

COMPANION SYSTEM
    └──requires──> NPC Dialogue Engine (exists)
    └──requires──> Quest System (exists, needs expansion)
    └──requires──> Battle System (Phase 27)
    └──requires──> Relationship Slice (new)
    └──requires──> Party Formation System (new)
    └──enhances──> Language Teaching (core value)
    └──enhances──> Narrative Depth (Phase 45)
    └──enhances──> Root Magic (combos)
    └──enhances──> Equipment (companion gear)
```

### Critical Paths

1. **Root Magic** MUST come after Battle Engine (Phase 27) and concurrent with Affinity (Phase 28)
2. **Equipment** MUST come after Battle Stats and before Crafting provides gear sources (Phases 27 → 29 → 31)
3. **Companions** CAN start after Battle + Dialogue both exist (Phases 27 + 20 complete → Phase 30)

### System Interactions

| System A | System B | Interaction Type | Notes |
|----------|----------|------------------|-------|
| Root Magic | FSRS | Data Dependency | Spell power scales with vocabulary mastery |
| Root Magic | Grammar | Mechanic Enhancement | Grammar accuracy = spell modifiers |
| Root Magic | Companions | Combo System | Paired spell casting with companion |
| Equipment | Vocabulary | Learning Gate | Affix bonuses locked behind word knowledge |
| Equipment | Economy | Resource Sink | Buying/selling/repairing drives dirham use |
| Equipment | Crafting | Supply Chain | Crafted gear is endgame best-in-slot |
| Companions | Quests | Content Source | Each companion = 3-5 quests |
| Companions | Dialogue | Teaching Delivery | Companions teach through conversation |
| Companions | Battle | Tactical Depth | AI companions provide strategic options |
| All Three | Battle | Convergence | Root magic + equipment stats + companion AI = core combat loop |

---

## Complexity Assessment

### Root Magic System
- **Total Estimated LOC:** 22,000 (per Phase 28 estimate)
- **High Complexity Components:**
  - Root derivation validation (Arabic morphology engine)
  - Grammar-based modifiers (conjugation/declension checking)
  - Affinity calculation from gameplay choices
  - Semantic field tagging for synergies
- **Medium Complexity:**
  - Spell unlock progression
  - Element weakness matrix
  - MP management
  - Visual effects per element
- **Low Complexity:**
  - Spell list UI
  - Basic damage scaling
  - Target selection

### Equipment & Inventory System
- **Total Estimated LOC:** 24,000 (per Phase 29 estimate)
- **High Complexity Components:**
  - Haggling mini-game (number input + validation + NPC AI negotiation)
  - Item generation with affixes (procedural + vocabulary lookup)
  - Inscription system (free-form Arabic text validation)
- **Medium Complexity:**
  - Vocabulary-locked affixes (FSRS integration)
  - Set bonus calculations
  - Equipment durability
  - Quick-equip loadouts
- **Low Complexity:**
  - Basic inventory CRUD
  - Stat comparisons
  - Sort/filter
  - Tooltips

### Companion System
- **Total Estimated LOC:** 28,000 (per Phase 30 estimate)
- **High Complexity Components:**
  - Adaptive dialogue difficulty (CEFR-based language scaling)
  - Companion memory (event tracking + dialogue state persistence)
  - Battle combo synergies (paired action detection)
  - Idle conversations (multi-NPC dialogue engine)
  - Conversational practice (free-form Arabic input validation)
- **Medium Complexity:**
  - Companion battle AI (role-based decision trees)
  - Context-aware comments (trigger system)
  - Mood system (state machine)
  - Relationship progression
  - Teaching role specialization
- **Low Complexity:**
  - Recruitment flags
  - Party formation swapping
  - Gifting system
  - Basic dialogue delivery

---

## MVP Definition for v6.0 (Phases 27-32)

### Root Magic: Launch With (Phase 28)

- [x] 50 root-element mappings (already planned)
- [x] 10 elemental affinities with weakness matrix
- [x] Affinity discovery system (50+ weighted choices)
- [x] MP cost + recovery mechanics
- [x] Spell damage scaling (root mastery × grammar accuracy × affinity)
- [x] Basic particle effects per element
- [x] Spell list UI with search/filter
- [ ] **DEFER:** Calligraphic casting (tactile but high complexity, save for v11.0 polish)
- [ ] **DEFER:** Voice pronunciation casting (infrastructure not ready)

### Equipment: Launch With (Phase 29)

- [x] 8 equipment slots with stat bonuses
- [x] 5 rarity tiers (Arabic color names)
- [x] Inventory system (200 slot limit, sort/filter including abjad order)
- [x] Shop system with zone-themed inventory
- [x] Haggling mini-game (Arabic numbers 0-9999)
- [x] Vocabulary-locked affixes (FSRS integration)
- [x] Equipment sets with thematic bonuses
- [x] Item lore snippets (cultural/historical context)
- [ ] **DEFER:** Arabic inscription system (high complexity, diminishing returns for v6.0)
- [ ] **DEFER:** Equipment durability (Phase 31 crafting has repair, add then)

### Companions: Launch With (Phase 30)

- [x] 12 recruitable companions (2 per major zone)
- [x] Party formation (max 2 active: 1 battle, 1 exploration)
- [x] Companion battle AI (4 role patterns)
- [x] Relationship meter (0-100, affects dialogue/abilities)
- [x] 3-5 personal quests per companion (36-60 total)
- [x] Gifting system (100+ gifts planned Phase 49)
- [x] 200+ dialogue lines per companion (2,400+ total)
- [x] Language teaching specialization (each has domain)
- [x] Adaptive difficulty (Arabic complexity scales with player level)
- [x] Contextual exploration comments
- [ ] **DEFER:** Conversational practice (free-form input too complex for Phase 30, revisit Phase 41 grammar lessons)
- [ ] **DEFER:** Idle companion-to-companion chatter (nice-to-have, Phase 47 NPC schedules)
- [ ] **DEFER:** Mistake correction in dialogue choices (Phase 41 grammar expansion)

---

## Feature Prioritization Matrix

### Root Magic Features

| Feature | User Value | Implementation Cost | Priority | Phase |
|---------|------------|---------------------|----------|-------|
| Spell unlock progression | HIGH | MEDIUM | P1 | 28 |
| MP system | HIGH | LOW | P1 | 28 |
| Element weaknesses | HIGH | MEDIUM | P1 | 28 |
| Damage scaling | HIGH | MEDIUM | P1 | 28 |
| Visual effects | HIGH | HIGH | P1 | 28 |
| Spell list UI | HIGH | MEDIUM | P1 | 28 |
| Root derivation combos | VERY HIGH | HIGH | P1 | 28 |
| Grammar modifiers | VERY HIGH | VERY HIGH | P1 | 32 |
| Semantic synergies | MEDIUM | MEDIUM | P2 | 39 |
| Calligraphic casting | MEDIUM | MEDIUM | P3 | 58+ |
| Voice casting | HIGH | VERY HIGH | P3 | Future |

### Equipment Features

| Feature | User Value | Implementation Cost | Priority | Phase |
|---------|------------|---------------------|----------|-------|
| Equipment slots + stats | HIGH | LOW | P1 | 29 |
| Inventory management | HIGH | LOW | P1 | 29 |
| Shop system | HIGH | MEDIUM | P1 | 29 |
| Haggling mini-game | HIGH | HIGH | P1 | 29 |
| Vocabulary-locked affixes | VERY HIGH | MEDIUM | P1 | 29 |
| Rarity tiers | MEDIUM | LOW | P1 | 29 |
| Set bonuses | MEDIUM | MEDIUM | P1 | 29 |
| Item lore | MEDIUM | MEDIUM | P1 | 29 |
| Quick-equip loadouts | MEDIUM | MEDIUM | P2 | 32 |
| Durability/repair | MEDIUM | MEDIUM | P2 | 31 |
| Inscription system | MEDIUM | HIGH | P3 | 58+ |
| Arabic naming | MEDIUM | MEDIUM | P3 | 58+ |

### Companion Features

| Feature | User Value | Implementation Cost | Priority | Phase |
|---------|------------|---------------------|----------|-------|
| 12 companions recruit | HIGH | LOW | P1 | 30 |
| Party formation | HIGH | LOW | P1 | 30 |
| Battle AI | HIGH | MEDIUM | P1 | 30 |
| Relationship meter | HIGH | LOW | P1 | 30 |
| Personal quests | VERY HIGH | HIGH | P1 | 30 |
| 200+ dialogue/companion | HIGH | HIGH | P1 | 30 |
| Teaching specialization | VERY HIGH | MEDIUM | P1 | 30 |
| Adaptive difficulty | VERY HIGH | HIGH | P1 | 30 |
| Contextual comments | HIGH | MEDIUM | P1 | 30 |
| Gifting system | MEDIUM | LOW | P1 | 30/49 |
| Mistake correction | HIGH | MEDIUM | P2 | 41 |
| Companion memory | HIGH | HIGH | P2 | 47 |
| Battle combos | MEDIUM | MEDIUM | P2 | 32 |
| Mood system | MEDIUM | MEDIUM | P2 | 47 |
| Conversational practice | HIGH | VERY HIGH | P3 | 41+ |
| Idle chatter | MEDIUM | HIGH | P3 | 47+ |

**Priority Key:**
- **P1:** Must have for v6.0 launch (Phases 27-32)
- **P2:** Should have, add during expansion (Phases 33-51)
- **P3:** Nice to have, polish phase (Phases 58-63) or future

---

## Competitor/Reference Analysis

### Language-Based Magic Systems

| Game | Approach | Lessons for GoGo Arabic |
|------|----------|-------------------------|
| **Scribblenauts** | Type any English word, object appears | Creativity inspiring but no structured learning. We need: guided discovery + mastery reinforcement. |
| **Epistory** | Type words to defeat enemies (action typing) | Real-time typing too stressful for learners. We use: turn-based prompts, no time pressure. |
| **BookWorm Adventures** | Spell words from letter tiles (Scrabble-like) | Word-building is engaging but requires existing English literacy. We need: Arabic input from prompts, teach vocabulary first. |
| **Ni no Kuni** | Spell names are pseudo-language, no real learning | Beautiful aesthetic but missed educational opportunity. We do: real Arabic, every spell teaches. |
| **Final Fantasy VIII** | Draw/Junction magic system (complex) | Deep but overwhelming for new players. We balance: simple MP cost, complex mastery/grammar layers optional. |

**Our Differentiator:** Only game where spell mechanics teach real language morphology and grammar.

### Equipment/Inventory Systems

| Game | Approach | Lessons for GoGo Arabic |
|------|----------|-------------------------|
| **Pokemon** | Simple bag with category tabs, minimal stats | Accessible for all ages. We adopt: clear categories, minimal cognitive load. |
| **Skyrim** | Weight-based, grid-less, extensive sorting | Weight can be tedious. We use: slot limit (200) simpler than weight math. |
| **Stardew Valley** | Grid-based, expandable, chest storage | Grid intuitive for organization. We add: Arabic alphabetical sort teaches abjad. |
| **Divinity Original Sin 2** | Complex crafting recipes, item combinations | Depth for enthusiasts. We include: 6 professions with recipes (Phase 31). |
| **Persona 5** | Equipment with unique skills, no durability | Skill-focused gear interesting. We do: vocabulary-locked affixes similar concept. |

**Our Differentiator:** Every item is vocabulary/culture lesson with lore snippets.

### Companion/Party Systems

| Game | Approach | Lessons for GoGo Arabic |
|------|----------|-------------------------|
| **Persona 5** | Social links, confidant abilities, deep personal stories | Gold standard for companion depth. We adopt: relationship progression, personal quests, unlockable abilities. |
| **Fire Emblem Three Houses** | Support conversations, tea time, gifts, class mentorship | Mentorship angle perfect for our teaching companions. We use: companions as teachers. |
| **Pokemon** | Simple party swap, minimal personality (until recent games) | Too shallow for our narrative needs. We go deeper: full personalities, dialogue. |
| **Mass Effect 2** | Loyalty missions, relationship affects ending, squad banter | Loyalty missions = companion quests. Squad banter = contextual comments. We adopt both. |
| **Final Fantasy X** | Sphere Grid shared progression, swap mid-battle | Mid-battle swap too complex for learners. We use: swap at camps only. |
| **Dragon Age Origins** | Approval system, companion gifts, origin stories | Approval = our relationship meter. Gifts work well. We include: 100+ gifts. |

**Our Differentiator:** Companions are language teachers with pedagogical specializations, adaptive to learner CEFR level.

---

## Sources

**Existing Game Architecture Analysis:**
- `/src/store/slices/battleSlice.js` — Battle state (HP, MP, status effects, turns)
- `/src/store/slices/playerSlice.js` — Player progression (level, XP, inventory, dirhams, outfit)
- `/src/store/slices/npcSlice.js` — NPC dialogue tracking
- `/src/data/enemies.js` — Enemy data (21 enemies, elements, zones, AI patterns)
- `.planning/research/EXPANSION-COMBAT-RPG.md` — Phase 27-32 specifications (148K LOC)
- `.planning/research/AAA-QUALITY-GAPS.md` — Polish requirements (60 gaps, 88K LOC)

**RPG Genre Knowledge (Training Data, MEDIUM Confidence):**
- Final Fantasy series (I-XV) — magic systems, equipment, party mechanics
- Pokemon (Gen I-VIII) — companion systems, type weaknesses, progression
- Persona (3-5) — social links, confidants, turn-based combat
- Fire Emblem — support systems, relationship mechanics
- Mass Effect — loyalty missions, squad dynamics
- Skyrim, Divinity Original Sin — inventory systems, crafting
- Scribblenauts, Epistory — word-based gameplay (not educational)

**Educational Game Knowledge (Training Data, MEDIUM Confidence):**
- Duolingo — gamification patterns, adaptive difficulty, spaced repetition
- Babbel — conversation practice structures
- Rosetta Stone — immersion principles
- Language learning research (Krashen, Nation, FSRS) — pedagogical foundations

**Limitations:**
- No live web research conducted (WebSearch/WebFetch unavailable)
- Cannot verify 2026 current trends in game design
- Relying on training data through early 2025
- Recommend validation against current RPG releases, language learning apps, and game design postmortems

---

*Feature research for: Arabic Learning RPG (Root Magic, Equipment, Companions)*
*Researched: 2026-02-12*
*Confidence: MEDIUM (genre conventions + architecture analysis, no live web validation)*
