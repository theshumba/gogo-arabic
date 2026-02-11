# Expansion Research: Combat & RPG Systems

## Domain Overview

**Estimated LOC**: ~148,000
**Phases**: 27-32
**Core Principle**: Every combat mechanic teaches Arabic. Every RPG system reinforces language acquisition. No grinding without learning.

## Current State (v5.0)

- Word Duel boss battles (8 bosses, adaptive difficulty)
- Basic quiz-based combat (6 quiz types)
- No real-time combat, no party system, no equipment
- 1,220 vocabulary words, 28 letters, 7 grammar lessons
- FSRS spaced repetition drives review scheduling

## Phase 27: Battle Engine Overhaul (~25K LOC)

### Goal
Replace quiz-only Word Duels with a full turn-based battle system where Arabic knowledge IS your combat power.

### Systems

**Turn-Based Battle Engine**
- BattleScene (Phaser scene with battle arena, character positions, UI overlays)
- BattleStateMachine: idle → playerTurn → inputPhase → resolution → enemyTurn → resolution → checkEnd
- Action types: Attack, Defend, Skill, Item, Flee
- Each action requires Arabic input (translate word to attack, conjugate verb to defend, complete sentence for skill)
- Accuracy of Arabic input determines action effectiveness (perfect = critical hit, partial = normal, wrong = miss)
- Battle speed scales with player's Arabic proficiency (faster responses = combo bonuses)
- ATB (Active Time Battle) gauge that fills based on vocabulary mastery level
- BattleRenderer handles animations, damage numbers, status effect visuals (all faceless characters)
- BattleAudioManager for ambient battle sounds + SFX (sword clashes, spell effects, hit impacts — NO music)

**Difficulty Scaling**
- DifficultyManager adapts in real-time based on FSRS data
- Easy: multiple choice Arabic → English
- Medium: type the Arabic word (with tashkeel hints)
- Hard: type Arabic from English prompt (no hints)
- Expert: construct full Arabic sentences
- Boss difficulty locked to zone tier (can't over-level past content)

**Battle Rewards**
- XP (feeds into level system)
- Gold (feeds into economy)
- Vocabulary unlocks (new words learned through combat context)
- Equipment drops (feeds into equipment system)
- Reputation gains (feeds into faction system)
- Crafting materials (feeds into crafting system)

### Combinatorial Interactions
- Battle difficulty ← FSRS mastery data
- Battle rewards → economy, equipment, faction reputation
- Battle context → vocabulary acquisition (words learned in battle tagged as "combat-acquired")
- Battle performance → NPC dialogue changes ("I heard you defeated the merchant's challenge!")
- Weather/time affects battle (sandstorm reduces visibility → harder Arabic prompts)

## Phase 28: Elemental Affinity & Arabic Roots (~22K LOC)

### Goal
Arabic root system (جذر) becomes the magic system. Three-letter roots are spell foundations.

### Systems

**Root-Based Magic System**
- 10 elemental affinities mapped to Arabic root categories:
  - نار (fire) — roots related to heat, anger, passion (ح-ر-ق، غ-ض-ب، ح-م-س)
  - ماء (water) — roots related to flow, life, purity (س-ي-ل، ح-ي-ي، ط-ه-ر)
  - تراب (earth) — roots related to strength, building, stability (ب-ن-ي، ق-و-ي، ث-ب-ت)
  - هواء (wind) — roots related to speed, freedom, change (س-ر-ع، ح-ر-ر، غ-ي-ر)
  - نور (light) — roots related to knowledge, truth, guidance (ع-ل-م، ص-د-ق، ه-د-ي)
  - ظل (shadow) — roots related to hidden, secret, mystery (خ-ف-ي، س-ر-ر، غ-م-ض)
  - حجر (stone) — roots related to protection, endurance (ح-م-ي، ص-ب-ر، ح-ص-ن)
  - نبات (plant) — roots related to growth, harvest, nature (ن-م-و، ح-ص-د، ط-ب-ع)
  - حديد (metal) — roots related to craft, trade, precision (ص-ن-ع، ت-ج-ر، د-ق-ق)
  - روح (spirit) — roots related to soul, memory, dreams (ذ-ك-ر، ح-ل-م، ن-ف-س)
- Spell casting: player selects root letters → derives word → applies effect
- Root mastery unlocks stronger derivations (Form I → Form X verbs = stronger spells)
- Spell combos: combining roots from different elements creates compound effects
- RootMasteryTracker persists in Redux, syncs with FSRS

**Affinity Discovery**
- Player discovers affinity through early gameplay choices
- Dialogue choices, quest solutions, and exploration patterns determine primary/secondary affinity
- AffinityCalculator tracks 50+ weighted decisions
- Primary affinity: 2x spell power, exclusive skill tree branch
- Secondary affinity: 1.5x spell power, partial skill tree access
- Can learn all affinities but mastery requires focused study

### Combinatorial Interactions
- Affinity ← player dialogue choices (narrative system)
- Root mastery ← FSRS vocabulary data (learning system)
- Spell effectiveness ← grammar knowledge (conjugation accuracy)
- Elemental interactions ← weather system (fire weak in rain)
- Affinity reputation ← faction alignment (some factions favor elements)
- Spell visuals ← Arabic calligraphy particles (VFX system)

## Phase 29: Equipment & Inventory (~24K LOC)

### Goal
Equipment system where every item has Arabic significance — names, descriptions, lore, and stat bonuses tied to vocabulary mastery.

### Systems

**Equipment Slots**
- 8 slots: head covering (طاقية/عمامة), robe (ثوب), cloak (عباءة), belt (حزام), boots (حذاء), gloves (قفازات), accessory 1, accessory 2
- All equipment rendered on faceless pixel characters (no face/eye slots)
- Equipment sets with bonuses (Scholar's Set: +20% XP from learning, Merchant's Set: +20% gold)
- Rarity tiers: common (أبيض), uncommon (أخضر), rare (أزرق), epic (بنفسجي), legendary (ذهبي)
- Each item has Arabic name + transliteration + meaning as core display

**Inventory Management**
- InventorySlice in Redux (max 200 items, stackable consumables)
- Grid-based inventory UI (Phaser DOMOverlay)
- Sort by: type, rarity, Arabic alphabetical order (teaches abjad ordering)
- Item comparison overlay (equipped vs inspected)
- Quick-equip, auto-equip best, lock items

**Item Generation**
- ItemFactory generates items from templates + affixes
- Affixes are Arabic adjectives (sharp = حاد, blessed = مبارك, swift = سريع)
- Affix vocabulary must be learned before item bonus activates (incentivizes learning)
- Crafted items can have custom Arabic names (player types Arabic name)
- Item lore snippets teach cultural/historical context

**Economy**
- Gold (ذهب) as primary currency
- Shops in each zone with zone-themed inventory
- Haggling mini-game (Arabic number negotiation)
- Supply/demand affected by quest completion and world state
- Auction house between zones (trade caravans)
- Price labels in Arabic numerals (Eastern Arabic: ٠١٢٣٤٥٦٧٨٩)

### Combinatorial Interactions
- Equipment stats ← vocabulary mastery (locked affixes)
- Shop inventory ← world state + quest progress
- Crafting recipes ← exploration discoveries
- Equipment visuals ← outfit system (existing wardrobe)
- Haggling ← Arabic number proficiency
- Item lore ← narrative progression (unlocks backstory)
- Economy ← faction reputation (discounts/markup)

## Phase 30: Companion System (~28K LOC)

### Goal
AI companions that travel with the player, assist in battle, teach Arabic through conversation, and have their own story arcs.

### Systems

**Companion Roster**
- 12 recruitable companions across zones (at least 2 per major zone)
- Each companion has:
  - Unique personality and speech patterns (formal/colloquial/poetic/scholarly)
  - Arabic teaching specialty (grammar, vocabulary, pronunciation, culture)
  - Battle role (attacker, defender, healer, support)
  - Personal quest chain (3-5 quests each = 36-60 companion quests)
  - Relationship meter (0-100, affects dialogue, abilities, story)
  - Idle dialogue that teaches Arabic phrases contextually

**Companion AI**
- CompanionBattleAI: selects actions based on role + situation
- CompanionDialogueAI: contextual comments during exploration
  - Entering new zone: companion comments in Arabic (with translation)
  - Near interactive object: companion hints in Arabic
  - After battle: companion reviews vocabulary used
  - During quest: companion provides Arabic clues
- CompanionMoodSystem: mood affects dialogue tone and battle performance
- Companion learns alongside player (mirrors FSRS progress for immersion)

**Party Management**
- Max 2 active companions (1 battle, 1 exploration)
- PartyFormation affects battle positioning and combo availability
- Companion swap at any camp/rest point
- Companion gift system (items that increase relationship)
- Companion housing in player's home base

**Companion Conversations**
- 200+ unique dialogue lines per companion (12 companions = 2,400+ lines)
- Conversations teach Arabic through natural context
- Language difficulty of companion speech scales with player level
- Companions correct player's Arabic mistakes in dialogue choices
- Bilingual companions (Arabic + English) gradually shift to more Arabic

### Combinatorial Interactions
- Companion recruitment ← quest progress + faction reputation
- Companion dialogue ← player's Arabic level (adaptive difficulty)
- Companion battle performance ← relationship level
- Companion reactions ← narrative choices (approve/disapprove)
- Companion teaching ← FSRS data (focus on weak words)
- Companion mood ← recent events (battle wins, quest fails, gifts)
- Companion quests ← world state + other companion relationships

## Phase 31: Crafting & Professions (~25K LOC)

### Goal
Crafting system where recipes are written in Arabic, ingredient names must be known, and professions teach domain-specific vocabulary.

### Systems

**Professions**
- 6 professions, each teaching ~50 domain-specific Arabic words:
  - خطاط (Calligrapher) — creates scrolls, enchants equipment with Arabic inscriptions
  - طباخ (Cook) — food buffs, ingredient vocabulary, Arabic recipe reading
  - حداد (Blacksmith) — weapons, armor, metal vocabulary, forge mini-game
  - عطار (Herbalist) — potions, plant vocabulary, garden management
  - نساج (Weaver) — clothing, textile vocabulary, pattern design
  - بناء (Builder) — structures, construction vocabulary, base building
- Each profession has 10 skill levels with increasingly complex Arabic requirements
- Profession mastery contributes to zone reputation

**Crafting System**
- Recipe discovery through exploration, NPC teaching, experimentation
- RecipeBook UI with Arabic ingredient names (must know word to use ingredient)
- Crafting mini-games unique to each profession:
  - Calligraphy: trace Arabic letters with precision (Phaser input)
  - Cooking: follow Arabic recipe instructions in correct order
  - Smithing: hammer rhythm game with Arabic counting
  - Herbalism: identify plants by Arabic name
  - Weaving: pattern matching with Arabic geometric designs
  - Building: place components by Arabic directional instructions
- Quality tiers based on Arabic accuracy during crafting
- Rare recipes require reading comprehension of Arabic texts

**Resource Gathering**
- Zone-specific resources with Arabic names
- Gathering spots respawn on real-time schedule (encourages daily play)
- Resource quality affected by tool level and gathering skill
- Some resources only available during certain weather/seasons
- Trading resources between zones via caravan system

### Combinatorial Interactions
- Recipes ← exploration + NPC relationships (gifted recipes)
- Crafting quality ← Arabic accuracy + profession level
- Resources ← zone access + world state + weather
- Crafted items ← equipment system (best gear is crafted)
- Profession reputation ← faction system (guilds)
- Food buffs ← battle system (pre-battle preparation)
- Building ← player housing + base system
- Calligraphy ← Arabic letter mastery (FSRS alphabet data)

## Phase 32: Status Effects & Advanced Combat (~24K LOC)

### Goal
Deep combat mechanics with status effects named in Arabic, combo systems based on grammar, and strategic depth that rewards language mastery.

### Systems

**Status Effects**
- 20+ status effects, all named in Arabic:
  - حيرة (Confusion) — scrambles answer options
  - قوة (Strength) — increases damage
  - سرعة (Speed) — faster ATB fill
  - حماية (Protection) — reduces damage taken
  - سم (Poison) — DOT damage
  - صمت (Silence) — can't use root magic
  - عمى (Blindness) — fewer letters visible in prompts
  - شجاعة (Courage) — immune to fear effects
  - حكمة (Wisdom) — bonus XP from battle
  - بركة (Blessing) — increased item drop rate
- Status effect vocabulary auto-added to FSRS queue
- Applying effects requires knowing the Arabic word
- Status effect combinations create compound effects

**Combo System**
- Grammar-based combos:
  - Noun + Adjective combo (إضافة): describe target accurately for bonus damage
  - Verb conjugation chain: conjugate same root across forms for escalating damage
  - Sentence construction: build complete Arabic sentence for ultimate attack
  - Dual/plural agreement: target multiple enemies with correct Arabic number agreement
- Combo meter builds with consecutive correct answers
- Combo breakers from enemies force tense switches or root changes
- Visual combo counter with Arabic numerals

**Advanced Battle Mechanics**
- Multi-target battles (up to 4 enemies)
- Positioning system (front/back row with different risks/rewards)
- Elemental weaknesses/resistances (tied to root affinity system)
- Battle items (potions, scrolls, food from crafting)
- Retreat mechanic (must answer Arabic question correctly to flee)
- Post-battle review screen showing all Arabic used with accuracy stats
- Battle replays stored for learning review

**Arena & Challenges**
- Weekly challenge arena with leaderboard
- Survival mode (endless waves, increasing Arabic difficulty)
- Boss rush mode (all bosses with story interludes)
- Puzzle battles (specific Arabic knowledge required, not brute force)
- PvE tournaments with seasonal themes

### Combinatorial Interactions
- Status effects ← root magic affinity system
- Combos ← grammar lesson completion
- Battle difficulty ← FSRS + player level + zone
- Battle rewards ← equipment + economy + reputation
- Arena rankings ← player profile stats
- Puzzle battles ← quest requirements (gate progression)
- Post-battle review ← learning system (reinforce weak words)
- Enemy types ← zone + weather + world state + narrative progress

## Cross-Domain Integration Summary

| Combat System | Connects To |
|--------------|-------------|
| Battle Engine | FSRS, Economy, Equipment, Factions, Weather, Narrative |
| Root Magic | Vocabulary, Grammar, Weather, Factions, VFX |
| Equipment | Economy, Crafting, Outfit System, Vocabulary |
| Companions | Quests, Factions, Dialogue, FSRS, Battle AI |
| Crafting | Economy, Equipment, Exploration, Arabic Letters, Professions |
| Status Effects | Root Magic, Grammar, Battle Engine, Vocabulary |
| Combos | Grammar, Battle Engine, Player Level |
| Arena | Leaderboard, Player Profile, Seasonal Events |

## LOC Breakdown

| Phase | Component | Estimated LOC |
|-------|-----------|--------------|
| 27 | Battle Engine + Difficulty + Rewards | 25,000 |
| 28 | Root Magic + Affinity + Spells | 22,000 |
| 29 | Equipment + Inventory + Economy | 24,000 |
| 30 | Companions + AI + Conversations | 28,000 |
| 31 | Crafting + Professions + Resources | 25,000 |
| 32 | Status Effects + Combos + Arena | 24,000 |
| **Total** | | **148,000** |

## Key Dependencies

- Phase 27 depends on: Phase 26 complete (v5.0 finished), FSRS integration
- Phase 28 depends on: Phase 27 (battle engine), Root Explorer (existing)
- Phase 29 depends on: Phase 27 (battle rewards), Phase 28 (elemental items)
- Phase 30 depends on: Phase 20 (dialogue system), Phase 27 (battle), Phase 24 (quests)
- Phase 31 depends on: Phase 29 (items), Phase 23 (interactive objects)
- Phase 32 depends on: Phase 27-28 (battle + magic), Phase 7 grammar lessons

## Design Principles

1. **Arabic First**: Every mechanic requires Arabic knowledge. No way to brute-force combat without learning.
2. **Faceless Characters**: All character art uses Islamic geometric patterns, flowing robes, distinctive silhouettes — never eyes or faces.
3. **Ambient Audio**: Battle sounds are environmental (sand storms, water flow, metal clashing) with SFX. No battle music.
4. **Respectful Content**: No divine beings, no worship mechanics. Magic is rooted in language mastery, not supernatural beings.
5. **Combinatorial Depth**: Every combat system feeds into and draws from at least 3 other game systems.
