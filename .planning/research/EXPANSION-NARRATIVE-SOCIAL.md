# Expansion Research: Narrative & Social Systems

## Domain Overview

**Estimated LOC**: ~143,000
**Phases**: 45-51
**Core Principle**: Story drives learning. Every narrative thread teaches Arabic. Every social interaction reinforces language acquisition. Players are pulled forward by wanting to know what happens next.

## Current State (v5.0)

- narrativeSlice in Redux (storyFlags, npcRelationships, worldObjectStates, choiceHistory)
- DialogueEngine with hub-and-spoke conversations, condition evaluation, effect execution
- 30 NPCs with personality and topic trees
- 52 quests across 8 zones with prerequisite chains
- Phase 26 plans narrative branching and polish (not yet implemented)
- Basic quest system with accept/complete/rewards

## Phase 45: Epic Main Storyline (~25K LOC)

### Goal
An 8-act main story spanning all zones that gives the player a compelling reason to learn Arabic and explore the world.

### Story Structure

**Premise**
The player is a young scholar who discovers they can travel between time periods of the Arabic-speaking world through an ancient manuscript. Each zone is a different historical era. The manuscript's pages are scattered — to read them and travel further, the player must learn Arabic. The more Arabic you know, the more of the world you can access and understand.

**8-Act Structure**

*Act 1: The Discovery (Oasis Village — tutorial zone)*
- Player finds the manuscript fragment in the village library
- Mentor character explains: "This text holds the key to traveling through time"
- First Arabic words unlock the first portal
- Teaches: basic greetings, alphabet, core vocabulary (50 words)
- Climax: First successful time travel to Baghdad

*Act 2: The House of Wisdom (Baghdad zone)*
- Player arrives in 800 CE Baghdad, must prove scholarly worth
- Quest chain: gain entry to House of Wisdom by demonstrating Arabic reading
- Meet first companion: a translator who helps bridge language gaps
- Learn about manuscript's origin — it was written by a great polymath
- Teaches: academic vocabulary, formal Arabic, numbers (200 words)
- Climax: Discover manuscript was torn apart and scattered across cities

*Act 3: The Trade Routes (Desert Marketplace + Timbuktu zones)*
- Follow manuscript trail along trade routes
- Must learn trade vocabulary to negotiate passage
- Companion from Baghdad provides cultural context
- Discover a faction collecting manuscript pages for wrong reasons
- Teaches: trade, travel, directional vocabulary (300 words)
- Climax: Manuscript page stolen by antagonist faction

*Act 4: The Artisan's Secret (Damascus + Cordoba zones)*
- Track stolen page to master craftsmen who can decode it
- Must learn crafting vocabulary to work alongside artisans
- Multiple solutions: negotiate, infiltrate, or prove worthiness
- First major branching point: which artisan tradition to follow
- Teaches: craft, material, tool vocabulary (300 words)
- Climax: Decode page reveals manuscript's true power

*Act 5: The Scholar's Trial (Ancient Library + Cairo zones)*
- Manuscript power attracts attention of scholarly council
- Must pass grammar and reading trials to earn council's trust
- Deep dialogue sequences testing conversational Arabic
- Second branching: align with reformist or traditionalist scholars
- Teaches: grammar structures, formal debate vocabulary (400 words)
- Climax: Council reveals location of remaining pages

*Act 6: The Sea Voyage (Coastal Port + Merchants' Island)*
- Journey by sea to collect remaining pages
- Navigation in Arabic, sea vocabulary, trading mini-games
- Companion relationships tested by dangerous journey
- Third branching: route selection affects which zones are visited
- Teaches: nature, sea, weather vocabulary (400 words)
- Climax: Storm separates party, player must navigate alone in Arabic

*Act 7: The Final Pages (Mountain Pass + Fortress + remaining zones)*
- Solo section forces reliance on Arabic skills
- Reunite with companions who've changed based on earlier choices
- Confront antagonist faction (Arabic debate, not violence-focused)
- Collect final manuscript pages
- Teaches: emotional, philosophical vocabulary (500 words)
- Climax: Complete manuscript reveals its message

*Act 8: The Return (All zones — epilogue)*
- Player can now read the complete manuscript
- Manuscript's message: knowledge connects all people across time
- Epilogue visits show consequences of player's choices across all zones
- World state reflects cumulative decisions
- Teaches: review and synthesis of all vocabulary
- Climax: Player writes their own page in the manuscript (in Arabic)

### Systems

**StoryManager**
- StoryProgressionSlice tracks act/chapter/scene
- Scene scripting engine for cutscenes (dialogue + camera + effects)
- Story journal (player can review story so far in Arabic + English)
- Story recap on login (catch up after absence)
- Multiple story paths tracked (3 major branches, 12+ minor variations)
- Story completion percentage visible in UI

**Cutscene System**
- CutsceneEngine plays scripted sequences:
  - Camera movements (pan, zoom, follow)
  - NPC positioning and movement
  - Dialogue sequences (typewriter effect)
  - Screen effects (fade, flash, shake)
  - Ambient audio changes (SFX, no music)
- Cutscenes skippable (but first-time dialogue always shown)
- Cutscene gallery for replay
- All cutscene dialogue in Arabic with toggleable English subtitles

### Combinatorial Interactions
- Main story ← player's Arabic level (story Arabic adapts)
- Main story → zone access (acts unlock zones)
- Main story → companion recruitment (story events trigger)
- Main story ← player choices (3+ major branches)
- Main story → world state (consequences visible)
- Main story ← faction reputation (affects NPC reactions in story)
- Main story → vocabulary introduction (story teaches words in context)
- Story progress → achievement unlocks

## Phase 46: Quest System Overhaul (~22K LOC)

### Goal
Expand from 52 quests to 250+ with quest chains, branching outcomes, and Arabic integration at every step.

### Systems

**Quest Types**
- Main story quests (40 — tied to 8-act structure)
- Zone story quests (80 — 3-4 per zone, zone-specific narratives)
- Companion quests (60 — 5 per companion, personal story arcs)
- Faction quests (40 — reputation-building, political storylines)
- Daily quests (20 rotating — quick language practice with narrative framing)
- Discovery quests (30 — triggered by exploration, no quest giver)

**Quest Complexity**
- Simple: single objective (talk to NPC, deliver item)
- Multi-step: 3-5 objectives in sequence
- Branching: player choices determine different objectives
- Parallel: multiple objectives completable in any order
- Timed: real-time deadline adds urgency
- Repeatable: daily/weekly quests that refresh

**Quest Journal Overhaul**
- QuestJournalSlice in Redux tracking all quest state
- Journal entries in Arabic (with English toggle)
- Quest descriptions include Arabic vocabulary hints
- Active quest tracking on HUD (compass marker + objective text)
- Quest chain visualization (see how quests connect)
- Estimated difficulty and Arabic level requirement per quest
- Quest rewards preview before accepting

**Quest Arabic Integration**
- Quest objectives sometimes stated in Arabic only (higher difficulty)
- Quest items have Arabic names that must be known
- Quest NPCs expect Arabic greetings at higher levels
- Quest puzzles are Arabic-based (see puzzle system)
- Quest rewards include vocabulary unlocks
- Quest dialogue teaches words contextually
- Quest completion reviews Arabic used

### Combinatorial Interactions
- Quests ← main story progression (new quests unlock)
- Quests ← zone access + exploration discoveries
- Quests → world state changes (quest outcomes change world)
- Quests → faction reputation (quest choices affect standing)
- Quests → companion relationships (quests involve companions)
- Quests ← skill tree levels (some quests need specific skills)
- Quests → economy (quest rewards include gold/items)
- Quests → FSRS (quest-taught words enter review queue)

## Phase 47: NPC Expansion — 350+ Characters (~24K LOC)

### Goal
Populate the world with 350+ distinct NPCs, each with personality, schedule, relationship progression, and Arabic teaching specialty.

### Systems

**NPC Categories**
- Story NPCs (30): key characters in main storyline
- Zone NPCs (120): 5 per zone, zone-specific roles and knowledge
- Companion NPCs (12): recruitable, deep relationship arcs
- Merchant NPCs (50): shops across all zones
- Scholar NPCs (30): teach grammar, vocabulary, culture
- Ambient NPCs (60): background characters with brief interactions
- Event NPCs (20): appear during festivals and special events
- Hidden NPCs (28): found through exploration, rare encounters

**NPC Personality System**
- 8 personality traits on spectrums:
  - Formal ↔ Casual (affects Arabic register)
  - Patient ↔ Hurried (affects dialogue speed)
  - Generous ↔ Miserly (affects rewards)
  - Scholarly ↔ Practical (affects vocabulary domain)
  - Friendly ↔ Reserved (affects relationship building pace)
  - Honest ↔ Deceptive (affects quest reliability)
  - Traditional ↔ Progressive (affects cultural perspective)
  - Brave ↔ Cautious (affects quest type they offer)
- Personality affects: dialogue style, Arabic complexity, reward generosity, quest type, relationship speed

**NPC Schedule System**
- NPCs have daily routines (location changes by time of day)
- ScheduleManager tracks NPC positions
- NPCs at home in evening, work during day, social in afternoon
- Some NPCs travel between zones (merchants, scholars)
- Player can learn NPC schedules through dialogue
- Finding NPC teaches time-of-day vocabulary

**NPC Memory System**
- NPCMemoryManager tracks per-NPC:
  - Conversation topics discussed
  - Gifts given/received
  - Quests completed together
  - Player's Arabic mistakes (mentioned gently later)
  - Time since last visit
  - Relationship milestones reached
- NPCs reference past interactions in dialogue
- NPCs form opinions of player based on actions
- NPC gossip network (NPCs talk about player to each other)

**NPC Dialogue Depth**
- Average 50 unique dialogue lines per story/zone NPC
- Average 20 lines per merchant/scholar NPC
- Average 10 lines per ambient NPC
- Total: ~15,000 unique dialogue lines
- All dialogue gradually shifts to more Arabic
- NPCs teach vocabulary through natural conversation
- NPCs correct Arabic mistakes with encouragement

### Combinatorial Interactions
- NPCs ← time system (schedule changes)
- NPCs ← world state (react to changes)
- NPCs ← faction reputation (dialogue differs by standing)
- NPCs ← player's Arabic level (dialogue complexity adapts)
- NPCs → quests (NPCs offer quests based on relationship)
- NPCs → vocabulary (NPCs teach domain-specific words)
- NPCs → economy (merchants stock different items)
- NPCs ← companion system (companions interact with NPCs)
- NPCs ← player choices (remember and react)

## Phase 48: Faction System (~20K LOC)

### Goal
6 factions that the player builds reputation with through actions, quests, and dialogue — each with unique Arabic vocabulary and cultural perspective.

### Systems

**Factions**

*علماء — The Scholars*
- Focus: knowledge, translation, preservation of texts
- Zones: Baghdad, Ancient Library, Timbuktu
- Arabic specialty: academic/formal vocabulary
- Benefits: library access, rare texts, grammar bonuses
- Reputation milestones: student → apprentice → scholar → sage → grand sage

*تجار — The Merchants*
- Focus: trade, economy, cross-cultural exchange
- Zones: Desert Marketplace, Coastal Port, Merchants' Island
- Arabic specialty: trade, numbers, negotiation vocabulary
- Benefits: shop discounts, rare items, trade routes
- Reputation milestones: peddler → trader → merchant → magnate → sultan of trade

*حرفيون — The Artisans*
- Focus: craftsmanship, beauty, material mastery
- Zones: Damascus, Cordoba, Fez
- Arabic specialty: material, craft, tool vocabulary
- Benefits: crafting recipes, rare materials, equipment upgrades
- Reputation milestones: apprentice → craftsman → artisan → master → grand master

*رحالة — The Travelers*
- Focus: exploration, navigation, storytelling
- Zones: Mountain Pass, Star Oasis, all travel routes
- Arabic specialty: directional, weather, nature vocabulary
- Benefits: mount upgrades, travel discounts, hidden zone access
- Reputation milestones: wanderer → wayfarer → explorer → navigator → legendary explorer

*حراس — The Guardians*
- Focus: protection, justice, combat discipline
- Zones: Fortress of Secrets, Royal Palace
- Arabic specialty: military, justice, strength vocabulary
- Benefits: combat bonuses, special equipment, arena access
- Reputation milestones: recruit → guard → sentinel → captain → commander

*فنانون — The Artists*
- Focus: calligraphy, poetry, visual arts
- Zones: Garden District, Granada, Sea of Ink
- Arabic specialty: emotional, aesthetic, literary vocabulary
- Benefits: calligraphy skills, poetry quests, cosmetic rewards
- Reputation milestones: student → practitioner → artist → virtuoso → living legend

**Faction Mechanics**
- Reputation: -100 (hostile) to +100 (exalted) per faction
- Actions affect reputation: quests, dialogue choices, gifting, combat
- Cross-faction tension: helping one faction may slightly lower another
- Faction quests exclusive to reputation level
- Faction NPCs treat player differently based on standing
- Faction vendors have reputation-gated inventory
- Faction events (festivals, competitions, ceremonies)

**Faction Diplomacy**
- Player can mediate between factions
- Alliance system: broker partnerships between compatible factions
- Rivalry system: some factions naturally conflict
- Diplomat achievement chain for resolving faction disputes
- Diplomacy requires high Arabic conversation skill

### Combinatorial Interactions
- Factions ← quest completion + dialogue choices
- Factions → NPC behavior + shop access + quest availability
- Factions → zone access (some areas faction-gated)
- Factions ← companion alignment (companions have faction preferences)
- Factions → world state (faction control affects zone prosperity)
- Factions → vocabulary focus (each faction teaches different domains)
- Factions ← player's Arabic specialty (natural faction alignment)
- Factions → main story branches (faction alignment affects narrative)

## Phase 49: Gift & Relationship System (~18K LOC)

### Goal
Deep relationship mechanics where gifts, conversations, and shared experiences build meaningful bonds with NPCs and companions.

### Systems

**Relationship Levels**
- 0-100 scale per NPC, with named tiers:
  - غريب (Stranger): 0-19 — basic greetings only
  - معرفة (Acquaintance): 20-39 — can ask questions
  - صديق (Friend): 40-59 — personal topics unlock
  - قريب (Close Friend): 60-79 — companion recruitment possible
  - حبيب (Beloved): 80-100 — exclusive quests, dialogue, and rewards
- Relationship growth from: gifts, quests together, correct dialogue, time invested
- Relationship decay from: neglect (slow), hostile actions (fast), faction betrayal

**Gift System**
- 100+ gift items across categories:
  - Food (dates, sweets, bread, coffee) — teaches food vocabulary
  - Books (manuscripts, poetry, maps) — teaches literary vocabulary
  - Crafted items (jewelry, tools, clothing) — teaches material vocabulary
  - Flowers/plants (roses, jasmine, herbs) — teaches nature vocabulary
  - Cultural items (incense, calligraphy sets, instruments) — teaches cultural vocabulary
- NPC gift preferences (each NPC likes/dislikes specific categories)
- Gift quality affects relationship gain
- Gift wrapping mini-game (write Arabic dedication)
- Gift history tracked per NPC

**Shared Experiences**
- Travel together (companion system)
- Battle together (companion combat)
- Quest completion (shared victory)
- Festival attendance (cultural events)
- Study sessions (language practice together)
- Meals together (cooking + eating scene)
- Each shared experience has unique dialogue

**Relationship Rewards**
- New dialogue topics at each tier
- NPC teaches specialized vocabulary at higher levels
- Personal quest chains unlock at Friend level
- Companion recruitment at Close Friend level
- Exclusive items/recipes/skills at Beloved level
- NPC home access at Friend level
- NPC backstory at Close Friend level

### Combinatorial Interactions
- Relationships ← gifts + quests + dialogue + shared experiences
- Relationships → dialogue options + quest access
- Relationships → companion recruitment + behavior
- Relationships → faction reputation (befriending faction members)
- Relationships → NPC teaching quality (closer = more teaching)
- Relationships ← player's Arabic skill (better conversation = faster growth)
- Gift system ← economy + crafting + exploration
- Gift preferences ← NPC personality + culture

## Phase 50: Player Identity & Expression (~18K LOC)

### Goal
Players express their Arabic learning identity through visible customization, titles, and personal narrative choices.

### Systems

**Player Background Choice**
- 4 background options (chosen at game start, affects starting stats):
  - طالب (Student) — bonus to learning speed, start in library
  - تاجر (Merchant) — bonus to gold, start in marketplace
  - رحالة (Traveler) — bonus to exploration, start at crossroads
  - حرفي (Artisan) — bonus to crafting, start in workshop
- Background affects: starting zone, initial quests, NPC introductions, dialogue options
- Background does NOT lock content (all paths accessible eventually)

**Title System**
- 100+ earnable Arabic titles:
  - Language titles (حافظ المفردات — Vocabulary Guardian)
  - Zone titles (سيد الواحة — Lord of the Oasis)
  - Achievement titles (بطل الحروف — Champion of Letters)
  - Faction titles (عالم الكتب — Scholar of Books)
  - Combat titles (محارب الكلمات — Word Warrior)
  - Exploration titles (مستكشف العالم — World Explorer)
- Equipped title displayed above character
- Title affects NPC initial dialogue (respected titles get better reactions)
- Rare titles from hidden achievements

**Player Housing**
- Customizable home base (earned through story progression)
- Room types: study (vocabulary review), workshop (crafting), garden (relaxation), library (reading)
- Furniture placement with Arabic-named items
- Display trophies and achievements
- Companion visits based on relationship
- Housing upgrades through crafting and economy

**Player Journal**
- In-game journal tracking:
  - Story notes (auto-generated summaries)
  - Vocabulary notebook (favorite words, personal notes)
  - NPC relationship log
  - Map annotations (player can write Arabic notes on map)
  - Quest diary (entries generated from quest completion)
- Journal entries progressively shift to Arabic
- Journal sharable (export as PDF/image)

### Combinatorial Interactions
- Background → starting experience + NPC dialogue
- Titles ← achievements + factions + exploration + combat
- Titles → NPC reactions + dialogue options
- Housing ← crafting + economy + story progression
- Housing → companion visits + study bonuses
- Journal ← all activities + vocabulary + quests
- Identity → main story branching (background affects options)

## Phase 51: Lore & World-Building (~16K LOC)

### Goal
Deep world lore told through discoverable texts, NPC stories, and environmental storytelling — all in Arabic with progressive difficulty.

### Systems

**Lore Categories**
- Historical lore (real Arabic/Islamic history, accurately represented)
- Zone lore (each zone's unique history and culture)
- NPC backstories (personal histories revealed through relationship)
- Item lore (legendary items with Arabic-language descriptions)
- Cultural lore (traditions, festivals, customs, etiquette)
- Linguistic lore (history of Arabic language, script evolution)
- Scientific lore (Arabic contributions to math, astronomy, medicine)

**Lore Delivery**
- Codex: discoverable texts organized by category
- Environmental: signs, inscriptions, murals tell stories
- Dialogue: NPCs share lore through conversation
- Quest: quest narratives embed historical information
- Items: rare items have lore descriptions
- Books: findable books with multi-page Arabic text
- Libraries: dedicated lore locations with reading areas

**Codex System**
- CodexSlice in Redux tracking all discovered lore
- 300+ codex entries across categories
- Entries range from 1 paragraph (basic) to 2 pages (deep lore)
- All entries in Arabic (with English translation toggle)
- Reading lore entries teaches vocabulary (words auto-added to FSRS)
- Codex completion percentage tracked per category
- Some entries only discoverable through specific quest paths

**Environmental Storytelling**
- Arabic inscriptions on buildings (translatable as player improves)
- Market price signs in Arabic numerals
- Street names in Arabic (navigational learning)
- Graffiti and wall art with cultural messages
- Cemetery epitaphs (respectful, teaches past tense + memorial vocabulary)
- Bulletin boards with Arabic notices (quests, events, news)

### Combinatorial Interactions
- Lore ← exploration + quests + NPC relationships
- Lore → knowledge (teaches vocabulary through reading)
- Lore → main story (understanding lore unlocks story paths)
- Lore → puzzle hints (lore contains clues)
- Codex → achievements (completion rewards)
- Lore → cultural context (deepens all zone experiences)
- Environmental text → reading skill progression
- Lore books → library zones (must visit to read)

## Cross-Domain Integration Summary

| Narrative System | Connects To |
|-----------------|-------------|
| 8-Act Main Story | Zones, Companions, Factions, Vocabulary, World State |
| 250+ Quests | NPCs, Factions, Economy, Skills, Combat, Learning |
| 350+ NPCs | Dialogue, Factions, Schedules, Memory, Teaching |
| 6 Factions | Zones, NPCs, Economy, Quests, World State |
| Gift/Relationship | NPCs, Companions, Economy, Crafting, Teaching |
| Player Identity | Background, Titles, Housing, Journal, Story Branches |
| Lore & Codex | Reading, Exploration, Quests, Vocabulary, Achievements |

## LOC Breakdown

| Phase | Component | Estimated LOC |
|-------|-----------|--------------|
| 45 | 8-Act Main Story + Cutscenes + StoryManager | 25,000 |
| 46 | 250+ Quests + Journal + Quest Engine | 22,000 |
| 47 | 350+ NPCs + Personality + Schedule + Memory | 24,000 |
| 48 | 6 Factions + Reputation + Diplomacy | 20,000 |
| 49 | Gift System + Relationships + Shared Experiences | 18,000 |
| 50 | Player Identity + Titles + Housing + Journal | 18,000 |
| 51 | Lore + Codex + Environmental Storytelling | 16,000 |
| **Total** | | **143,000** |

## Design Principles

1. **Story Drives Learning**: Player learns Arabic because the story demands it, not because a teacher assigns it.
2. **Faceless Expressiveness**: Characters express emotion through body language, dialogue style, gesture, and calligraphic flourishes — never through facial features.
3. **Ambient Storytelling**: No music during cutscenes. Ambient sounds + SFX + Arabic voice lines create atmosphere.
4. **No Deities**: Story is about human achievement, knowledge, and connection. No worship, no gods, no divine intervention.
5. **Respect for History**: Real historical settings are researched and presented accurately. Fantasy zones are clearly fantastical.
6. **Choice Matters**: Player decisions have visible, permanent consequences that change the world.
