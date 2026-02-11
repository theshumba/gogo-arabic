# Expansion Research: World & Content

## Domain Overview

**Estimated LOC**: ~147,000
**Phases**: 33-38
**Core Principle**: The world itself teaches Arabic. Every zone, building, object, sign, and environment is a language lesson waiting to be discovered.

## Current State (v5.0)

- 8 zones: oasis_village, ancient_library, desert_marketplace, coastal_port, royal_palace, garden_district, mountain_pass, + 1 more
- 140 NPCs with basic dialogue
- Pipoya RPG tilesets (16x16, 32x32)
- Phase 22 plans enterable buildings (15 interiors)
- Phase 23 plans 100+ interactive objects
- No weather, no time system, no dynamic world state beyond quest flags

## Phase 33: Expanded World — 24 Zones (~28K LOC)

### Goal
Triple the world size with historically and culturally authentic zones that teach Arabic through environmental immersion.

### Real World Cities (8 new zones)

**بغداد — Baghdad (House of Wisdom Era, ~800 CE)**
- Zone theme: Knowledge, science, translation
- Key locations: بيت الحكمة (House of Wisdom), paper mills, astronomical observatory, hospital
- Arabic focus: Academic vocabulary, scientific terms, numbers, formal Arabic
- 15 NPCs: scholars, translators, astronomers, physicians, librarians
- 8 quests: translate manuscripts, assist astronomers, learn medical terms
- Ambient: fountain water, quill scratching, scholarly murmur, page turning

**قرطبة — Cordoba (Al-Andalus, ~950 CE)**
- Zone theme: Architecture, poetry, coexistence
- Key locations: المسجد الكبير (Great Mosque), gardens, bridges, markets
- Arabic focus: Architectural terms, poetry, descriptive adjectives, colors
- 15 NPCs: architects, poets, gardeners, merchants, artisans
- 8 quests: design gardens, compose poetry, restore mosaics
- Ambient: water channels, birdsong, hammering stone, market chatter

**تمبكتو — Timbuktu (Songhai Empire, ~1500 CE)**
- Zone theme: Trade, manuscripts, Saharan culture
- Key locations: Sankore University, manuscript libraries, salt market, caravanserai
- Arabic focus: Trade vocabulary, directions, manuscript reading, Saharan terms
- 15 NPCs: manuscript keepers, salt traders, caravan leaders, university scholars
- 8 quests: recover lost manuscripts, navigate desert trade routes, catalog library
- Ambient: desert wind, camel bells, distant call to prayer, sand shifting

**دمشق — Damascus (Umayyad Era, ~700 CE)**
- Zone theme: Craftsmanship, swordmaking, souks
- Key locations: الجامع الأموي (Umayyad Mosque courtyard), souk al-hamidiyyah, sword workshops, hammam
- Arabic focus: Craft vocabulary, metals, tools, body/health terms, directions
- 15 NPCs: swordsmiths, souk vendors, bath attendants, textile merchants
- 8 quests: forge a damascene blade, navigate the souk, learn bath etiquette
- Ambient: hammer on steel, souk haggling, water splashing, fabric rustling

**القاهرة — Cairo (Fatimid Era, ~1000 CE)**
- Zone theme: Architecture, astronomy, festivals
- Key locations: الأزهر (Al-Azhar), Khan el-Khalili, citadel, Nile waterfront
- Arabic focus: Celestial terms, festival words, food, architectural vocabulary
- 15 NPCs: astronomers, festival organizers, boat builders, spice merchants, bakers
- 8 quests: chart stars, prepare festival, build felucca, master spice blending
- Ambient: Nile water, festival drums, market bustle, wind through minarets

**فاس — Fez (Marinid Era, ~1300 CE)**
- Zone theme: Leather crafting, dyeing, mazes
- Key locations: تنابرة (tanneries), Qarawiyyin library, medina maze, dye workshops
- Arabic focus: Color vocabulary, material names, spatial directions, profession words
- 12 NPCs: leather workers, dyers, maze guides, librarians
- 6 quests: learn tanning process, navigate medina, restore ancient texts
- Ambient: vat bubbling, leather stretching, narrow-alley echoes, dye splashing

**سمرقند — Samarkand (Timurid Era, ~1400 CE)**
- Zone theme: Paper, silk, mathematics
- Key locations: Registan, paper workshops, silk road caravanserai, observatory
- Arabic focus: Mathematical terms, geometry, silk/textile vocabulary, astronomical words
- 12 NPCs: mathematicians, paper makers, silk traders, astronomers
- 6 quests: solve geometric puzzles, craft paper, calculate star positions
- Ambient: loom clacking, water in paper mills, astronomical instruments clicking

**غرناطة — Granada (Nasrid Era, ~1350 CE)**
- Zone theme: Poetry, gardens, farewell
- Key locations: الحمراء (Alhambra gardens), Generalife, poetry circles, fountain courts
- Arabic focus: Emotional vocabulary, nature words, poetry forms, farewells
- 12 NPCs: poets, gardeners, fountain engineers, historians
- 6 quests: compose qasida, restore fountain system, preserve heritage
- Ambient: fountain cascades, nightingale song, wind through arches, pen on paper

### Fantasy Arabic Regions (8 new zones)

**واحة النجوم — Star Oasis**
- Theme: Navigation, astronomy, night desert
- Arabic focus: Star names, directions, time words
- Unique mechanic: Celestial navigation puzzles using Arabic star names

**جبل الكلمات — Mountain of Words**
- Theme: Ancient language, root discovery
- Arabic focus: Root letters, word derivation, morphology
- Unique mechanic: Climb by deriving words from roots carved in stone

**بحر الحبر — Sea of Ink**
- Theme: Calligraphy, written word
- Arabic focus: Letter forms (initial/medial/final), calligraphy styles
- Unique mechanic: Navigate ink sea by writing correct letter forms

**غابة الحكايات — Forest of Tales**
- Theme: Storytelling, 1001 Nights inspiration
- Arabic focus: Narrative vocabulary, past tense, story structure
- Unique mechanic: Stories unlock paths — tell tales to proceed

**صحراء الصمت — Desert of Silence**
- Theme: Listening, comprehension
- Arabic focus: Listening comprehension, pronunciation, minimal text
- Unique mechanic: All instructions spoken in Arabic (native audio)

**جزيرة التجار — Merchants' Island**
- Theme: Trade, economics, negotiation
- Arabic focus: Numbers, currency, haggling, comparative adjectives
- Unique mechanic: Trade economy simulation with Arabic-only transactions

**قلعة الأسرار — Fortress of Secrets**
- Theme: Puzzles, riddles, logic
- Arabic focus: Riddle vocabulary, conditional sentences, logic words
- Unique mechanic: Arabic riddle locks and cipher puzzles

**حديقة الأرواح — Garden of Spirits**
- Theme: Nature, seasons, growth (NOTE: spirits = breath of life in nature, NOT supernatural beings)
- Arabic focus: Nature vocabulary, seasons, weather, growth verbs
- Unique mechanic: Garden grows as player learns — visible vocabulary progress

### Zone Infrastructure

**ZoneManager Overhaul**
- Dynamic zone loading (lazy load zone data on entry)
- Zone streaming for adjacent zones (preload neighbors)
- Zone instance state persisted in Redux (visited, completion %, discovered objects)
- Zone events triggered by narrative progress, time, and player level
- Zone-specific ambient soundscapes (no music, layered ambient loops)
- Zone difficulty scaling (vocabulary tier matches zone requirements)

### Combinatorial Interactions
- Zone access ← vocabulary mastery gates (Phase 24)
- Zone content ← quest state + narrative progress
- Zone NPCs ← faction reputation affects dialogue
- Zone resources ← crafting system needs zone materials
- Zone ambient ← weather system modifies sounds
- Zone events ← time system + world state
- Zone discovery → achievements + player profile stats

## Phase 34: Weather & Time System (~22K LOC)

### Goal
Dynamic weather and time create a living world where conditions affect gameplay, Arabic learning, and atmosphere.

### Systems

**Time System**
- 24-hour cycle: each real minute = 1 game hour (24 min = full day)
- الفجر (dawn), الصباح (morning), الظهر (noon), العصر (afternoon), المغرب (sunset), العشاء (night)
- Time-of-day affects: NPC schedules, shop hours, available quests, ambient sounds, lighting
- Prayer time indicators (cultural, not religious mechanic — teaches time vocabulary)
- Arabic clock overlay: teaches telling time in Arabic
- Seasonal cycle: 4 seasons across 28-day months (real-time week = 1 season)
- Seasons affect: available resources, NPC dialogue, zone appearance, festivals

**Weather System**
- 8 weather types per zone (zone-appropriate):
  - صحو (clear), غائم (cloudy), مطر (rain), عاصفة رملية (sandstorm), ضباب (fog), ثلج (snow — mountain only), حر شديد (extreme heat), ريح (wind)
- Weather vocabulary auto-taught on first encounter
- Weather affects gameplay:
  - Sandstorm: reduced visibility, harder reading prompts, bonus desert vocabulary
  - Rain: slower movement, water-related vocabulary boost, plant growth
  - Fog: hidden objects revealed, mystery vocabulary, exploration bonus
  - Clear: full visibility, normal gameplay, sun-related vocabulary
- WeatherEngine with transition system (gradual changes, not instant)
- Weather forecast NPC teaches future tense in Arabic
- Ambient audio layers per weather type (rain sounds, wind howling, sand pelting)

**Day/Night Visual System**
- Phaser lighting with color temperature shifts
- Lanterns, torches, and firelight in night scenes
- Some NPCs only appear at night (night market, storytellers)
- Night exploration teaches night/dark vocabulary
- Star visibility at night (connects to astronomy zones)
- Shadow system (Islamic geometric shadow patterns)

### Combinatorial Interactions
- Weather ← zone type (desert zones get sandstorms, not snow)
- Weather → battle difficulty (sandstorm = harder prompts)
- Weather → crafting (some recipes need specific weather)
- Weather → NPC behavior (seek shelter in storms)
- Time → NPC schedules (shops open/close, NPCs move)
- Time → quest availability (some quests time-gated)
- Seasons → resource availability (harvesting cycles)
- Seasons → festivals (cultural events with special quests)
- Weather/time vocabulary → FSRS (contextual learning)

## Phase 35: Building Interiors Expansion (~25K LOC)

### Goal
Every building is explorable with meaningful content — 100+ unique interiors that teach Arabic through environmental storytelling.

### Systems

**Interior Types (100+ total across 24 zones)**

*Residential (30)*
- Varied by zone culture and wealth level
- Interactive furniture with Arabic labels
- Resident NPCs with daily routines
- Hidden items and lore objects
- Each home teaches domestic vocabulary

*Commercial (25)*
- Shops (weapons, armor, potions, food, materials)
- Workshops (blacksmith, tailor, carpenter, potter)
- Market stalls (haggling mini-game)
- Each shop has specialized Arabic vocabulary
- Shop inventory affected by zone economy

*Educational (15)*
- Libraries with readable Arabic texts
- Schools with grammar lesson NPCs
- Observatories with astronomy puzzles
- Archives with historical documents
- Study rooms for focused vocabulary practice

*Public (15)*
- Hammam (bath house — teaches body vocabulary)
- Caravanserai (inn — teaches travel vocabulary)
- Courthouse (teaches formal/legal vocabulary)
- Hospital (teaches medical vocabulary)
- Kitchen/bakery (teaches food vocabulary)

*Special (15+)*
- Hidden rooms (discovered through quests)
- Boss lairs (battle arenas)
- Puzzle rooms (Arabic-based puzzles)
- Companion homes (personal spaces)
- Player housing (customizable)

**Interior Generation System**
- InteriorFactory creates interiors from templates + zone style
- Tilemap templates for each interior type
- Zone-specific furniture and decoration sets
- Dynamic NPC placement based on time of day
- Interior ambient audio (no music — footsteps, fire crackling, tools working)
- Phaser scene stacking (SceneStackManager from Phase 19)

**Interactive Furniture**
- 50+ furniture types with Arabic names
- Interact to learn: tap object → see Arabic name + transliteration + audio
- Some furniture contains items (chests, shelves, cabinets)
- Furniture state persists (opened/unopened, broken/repaired)
- Vocabulary from furniture interactions added to FSRS

### Combinatorial Interactions
- Interior access ← zone access + quest progress
- Interior NPCs ← time of day + relationship level
- Interior items ← crafting materials + quest items
- Shop inventory ← economy + world state + weather
- Interior discovery → achievements + map completion
- Interior lore → narrative progression + vocabulary
- Player housing ← crafting + economy + companion gifts
- Interior puzzles ← grammar + vocabulary mastery

## Phase 36: Dynamic World State (~24K LOC)

### Goal
The world responds to everything the player does — quest completions change the environment, NPC behaviors shift, and the landscape evolves.

### Systems

**World State Engine**
- WorldStateSlice in Redux tracking 500+ state variables
- State categories:
  - Zone states (prosperity, safety, culture level per zone)
  - NPC states (alive, moved, transformed, relationship)
  - Building states (built, destroyed, upgraded, locked)
  - Resource states (depleted, abundant, seasonal)
  - Political states (faction control, alliances, conflicts)
- State change triggers: quest completion, player choice, time passage, faction events
- State persistence across sessions (localStorage + cloud sync)

**Visual World Changes**
- Zone appearance changes based on state:
  - Restored zones: more NPCs, better shops, decorations appear
  - Neglected zones: fewer NPCs, boarded shops, debris
  - Liberated zones: celebrations, new buildings, grateful NPCs
- Building construction/destruction animations
- NPC population changes (immigration/emigration based on prosperity)
- Resource regrowth/depletion visible in world

**Consequence System**
- Every quest choice has visible consequences
- ConsequenceEngine tracks cause → effect chains
- Delayed consequences (choice in Zone A affects Zone C hours later)
- NPC memory of player actions (dialogue references past choices)
- Irreversible decisions with clear warnings in Arabic
- Multiple world endings based on cumulative state

**World Events**
- Scheduled events (festivals, markets, competitions)
- Random events (caravan arrives, sandstorm damages, travelers visit)
- Player-triggered events (complete quest chain → celebration)
- Cross-zone events (trade route opened → both zones prosper)
- Event calendar with Arabic date system (Hijri calendar reference)

### Combinatorial Interactions
- World state ← every quest completion + player choice
- World state → NPC dialogue + shop inventory + zone appearance
- World state → available quests (new quests spawn based on state)
- World state ← faction reputation (faction-controlled zones change)
- World state → weather patterns (restored areas get better weather)
- World state → companion reactions (approve/disapprove of changes)
- World state → economy (prosperous zones = better prices)
- World state persistence ← save system + cloud sync

## Phase 37: Secrets, Puzzles & Exploration (~24K LOC)

### Goal
Reward curiosity with hidden content, Arabic-based puzzles, and exploration mechanics that make every corner worth investigating.

### Systems

**Secret Discovery System**
- 200+ hidden secrets across all zones
- Secret types:
  - Hidden rooms (tap specific wall patterns)
  - Buried treasure (dig at Arabic riddle locations)
  - Invisible ink messages (use item to reveal)
  - Camouflaged NPCs (speak Arabic passphrase)
  - Secret passages (solve Arabic word puzzles to open)
- SecretTracker in Redux persists discoveries
- Discovery hints from NPC dialogue, books, environmental clues
- Collectible sets (find all secrets in a zone for bonus)

**Arabic Puzzle Types**
- 15 puzzle mechanics:
  1. Word locks (spell Arabic word to open)
  2. Root derivation chains (derive 5 words from one root)
  3. Sentence construction gates (build grammatically correct sentence)
  4. Arabic number sequences (complete mathematical patterns)
  5. Letter form matching (connect initial/medial/final forms)
  6. Calligraphy tracing (precision drawing of Arabic letters)
  7. Translation stones (translate inscription to reveal path)
  8. Anagram puzzles (rearrange Arabic letters)
  9. Rhyming gates (find the rhyming Arabic word)
  10. Grammar correction (fix the grammatically incorrect sign)
  11. Vocabulary classification (sort words into correct categories)
  12. Arabic crosswords (themed crossword puzzles)
  13. Cipher decoding (decrypt Arabic-to-Arabic ciphers)
  14. Story completion (fill in missing Arabic words in narrative)
  15. Dialogue puzzles (say the right thing to the right NPC)
- Puzzle difficulty scales with player level and zone tier
- Hint system (costs gold, provides partial solution)

**Exploration Rewards**
- ExplorationXP separate from combat XP
- Map completion percentage per zone (visible on world map)
- Explorer rank titles in Arabic (مبتدئ → مستكشف → رحالة → مغامر → أسطورة)
- Unique items only found through exploration (not drops)
- Lore books that piece together zone history
- Viewpoints (scenic locations with cultural commentary in Arabic)
- Achievement chains for systematic exploration

**Treasure & Collectibles**
- 50 treasure chests with scaling rewards
- 100 collectible cultural artifacts (each teaches vocabulary)
- 24 zone postcards (artistic zone overview cards)
- 12 companion souvenirs (gifts for companions)
- Treasure maps readable only in Arabic (progressive difficulty)
- Ancient coins that teach Arabic numeral history

### Combinatorial Interactions
- Secrets ← quest progress (some secrets require quest items)
- Puzzles ← vocabulary mastery + grammar knowledge
- Exploration rewards → equipment + economy + achievements
- Treasure ← zone state (some treasures only in restored zones)
- Collectibles → player profile + companion gifts
- Lore books → narrative understanding (required for some quests)
- Map completion → zone reputation + fast travel unlock
- Puzzle hints ← companion specialty (companions help solve)

## Phase 38: Transport & Travel (~24K LOC)

### Goal
Movement between zones becomes its own gameplay system — caravans, boats, horses, and magical travel that teach Arabic along the way.

### Systems

**Transport Types**
- Walking (default, slowest, most exploration)
- Horse/Camel riding (faster, learned through quest)
  - Mount vocabulary, care vocabulary
  - Mount stamina system (rest at oases)
  - Mount bonding (relationship system)
- Caravan travel (zone-to-zone, time passes, random events)
  - Caravan conversation mini-game (talk to travelers in Arabic)
  - Trade goods transport (buy low, sell high between zones)
  - Caravan defense events (Arabic-combat hybrid)
- Boat travel (coastal/river zones)
  - Navigation vocabulary, sea vocabulary
  - Fishing mini-game (catches teach fish names in Arabic)
  - Sea exploration (discover islands)
- Fast travel (unlocked per zone through exploration)
  - World map teleport to discovered locations
  - Cost: gold or vocabulary review (answer questions to travel free)

**Travel Events**
- Random encounters during travel:
  - Merchant caravan (buy rare items)
  - Lost traveler (help with Arabic directions)
  - Storyteller (listen to tale in Arabic)
  - Bandits (combat encounter)
  - Scenic viewpoint (vocabulary reward)
  - Weather change (teaches weather words)
- Event frequency based on travel distance and mode
- Some events only trigger on specific routes
- Event chains (help same traveler multiple times)

**Mount System**
- 6 mount types: horse, camel, donkey, elephant (special), carpet (magical reward), boat
- Mount stats: speed, stamina, cargo capacity
- Mount care: feeding (food vocabulary), grooming, resting
- Mount abilities: camel resists sandstorm, horse faster on roads, boat for water
- Mount appearance customization (saddles, blankets, decorations)
- Mount acquired through quests, purchase, or taming mini-game

**Navigation System**
- Compass with Arabic directional labels (شمال، جنوب، شرق، غرب)
- Star-based navigation at night (Arabic star names)
- Map annotations in Arabic (player can label locations)
- Waypoint system with Arabic name entry
- Distance shown in Arabic numerals
- Travel time estimation teaches Arabic time expressions

### Combinatorial Interactions
- Transport ← zone access + economy (buy mounts)
- Travel events ← world state + narrative progress
- Caravan trade ← economy system (buy/sell goods)
- Mount care ← crafting (food, saddles, medicine)
- Navigation vocabulary → FSRS (directional words)
- Fishing ← resource system (ingredients for cooking)
- Fast travel ← exploration completion (discover to unlock)
- Travel conversation ← dialogue system + companion interactions
- Boat travel ← weather system (storms prevent sailing)

## Cross-Domain Integration Summary

| World System | Connects To |
|-------------|-------------|
| 24 Zones | Vocabulary gates, quests, factions, resources, economy |
| Weather/Time | Battle, crafting, NPC schedules, ambient audio, resources |
| 100+ Interiors | NPCs, items, puzzles, lore, economy, quests |
| World State | Every system — the central integration hub |
| Secrets/Puzzles | Vocabulary, grammar, exploration, achievements, lore |
| Transport | Economy, combat, vocabulary, navigation, companions |

## LOC Breakdown

| Phase | Component | Estimated LOC |
|-------|-----------|--------------|
| 33 | 24 Zones + ZoneManager | 28,000 |
| 34 | Weather + Time + Seasons | 22,000 |
| 35 | 100+ Interiors + Furniture | 25,000 |
| 36 | World State Engine + Consequences | 24,000 |
| 37 | Secrets + Puzzles + Exploration | 24,000 |
| 38 | Transport + Mounts + Navigation | 24,000 |
| **Total** | | **147,000** |

## Design Principles

1. **Culturally Authentic**: Real cities at real historical periods, researched for accuracy. Fantasy zones inspired by Arabic/Islamic aesthetics.
2. **Faceless Art**: All characters faceless. Distinguish through clothing, posture, accessories, silhouette, and Arabic calligraphy name tags.
3. **Ambient Immersion**: No music. Each zone has unique ambient soundscape — wind, water, market sounds, nature, tools, voices (Arabic speech).
4. **No Deities**: No shrines to gods, no divine quests, no worship mechanics. Cultural and historical content only.
5. **Everything Teaches**: Signs in Arabic, shop names in Arabic, NPC greetings in Arabic, directional markers in Arabic. The world IS the textbook.
