# Gogo Arabic — Combined Master To-Do List

**Created:** 2026-03-17
**Current state:** 103K LOC, v7.0 shipped, v8.0 visual overhaul in progress
**Target:** 800K+ LOC, 120-160 hours gameplay, A1-B2 Arabic

**Guiding principle:** Strip the game visually naked (except loading screen), rebuild with Kenmi pixel art, deepen content and systems, polish to AAA feel. One stunning zone is worth more than 24 rough ones.

**Loading screen (koi fish + Gogo Arabic + Yala Arabic) — DO NOT TOUCH. Ever.**

---

## TIER 1: Visual Rebuild (Do First)
*Strip and rebuild everything the player sees. Kenmi pixel art everywhere.*

### 1A. Design Oasis Village in Tiled (YOU — manual work)
- [ ] Design the first zone (40×30 at 16x16) in Tiled Map Editor using Kenmi desert tileset
- [ ] Paint terrain: sand base, grass around oasis, water pool, dirt paths between buildings
- [ ] Place buildings: desert houses, temple, pergola, market stalls
- [ ] Place decorations: cacti clusters, palm trees, pots, rugs, bones, campfire
- [ ] Mark collision layer (walls, water, building footprints)
- [ ] Mark object layers (NPC spawns, exits, interactables)
- [ ] Export as JSON → `public/assets/maps/oasis-village.json`
- [ ] Test in game, iterate until it looks like the reference screenshots

### 1B. Strip All Current In-Game UI (Claude)
- [ ] Remove or hide ALL React CSS overlays for in-game elements (dialogue, NPC prompts, sign overlays, object interaction overlays)
- [ ] Keep ONLY: loading screen, HUD top bar (level/DAD/map/quests/luggage), main menu, settings, profile, wardrobe
- [ ] Replace in-game dialogue with Phaser DialogueBox (already built)
- [ ] Replace NPC name labels from DOM overlay to Phaser text sprites
- [ ] Replace sign/object interaction popups with Phaser NineSlice panels
- [ ] Use Kenmi UI frames (8 color variants) for all in-game panels
- [ ] Use Kenmi UI bars for health/XP/stamina
- [ ] Use Kenmi UI icons for in-game buttons
- [ ] Use Kenmi pixel font for in-game English text
- [ ] Use PixelAE font for in-game Arabic text

### 1C. Rebuild Player & NPC Sprites (Claude)
- [ ] Replace player sprite with Kenmi character (decide which one)
- [ ] Handle the outfit/head covering system with Kenmi sprites (may need simplification)
- [ ] All 23 NPCs render as Kenmi characters with walk animations
- [ ] Female NPC hijab variants created (pixel modification)
- [ ] Enemy sprites use Kenmi desert warriors + mummy
- [ ] Ambient animals (camels, vultures, scarabs) in desert zones

### 1D. Design Remaining Zones in Tiled (YOU — one at a time)
- [ ] Ancient Library (35×30) — Kenmi desert + dungeon tiles
- [ ] Desert Marketplace (38×28) — Kenmi desert + market props
- [ ] Farmland (36×26) — Kenmi base RPG grass/path tiles
- [ ] Bedouin Camp (40×30) — Kenmi desert + military camp
- [ ] Mountain Village (42×32) — Kenmi christmas snow tiles
- [ ] Coastal Port (38×28) — Kenmi base RPG water/beach
- [ ] Royal Palace (44×32) — Kenmi desert + dungeon
- [ ] Building interiors — Kenmi dungeon/temple interior tiles
- [ ] Real-world zones (Baghdad, Cordoba, etc.) — when ready
- [ ] Fantasy zones — when ready

---

## TIER 2: Sound & Atmosphere (Do Alongside Tier 1)
*Professional ambient soundscapes transform the feel more than code.*

### 2A. Zone Ambient Audio
- [ ] Commission or source 8 unique ambient loops (one per zone biome):
  - Desert: wind, distant sand, occasional hawk cry
  - Oasis: water flowing, birds, insects
  - Marketplace: crowd chatter, metal clanging, fabric rustling
  - Library: quiet echoes, page turning, distant footsteps
  - Farmland: wind through crops, animal sounds
  - Mountain: wind howling, rocks, distant thunder
  - Port: waves, seagulls, creaking wood, rope
  - Palace: grand echoes, fountain, guards' footsteps
- [ ] Source from Freesound.org (CC0) or commission ($50-100 on Fiverr)
- [ ] Wire into existing audio system (zone BGM crossfade already works)

### 2B. SFX Polish
- [ ] UI sounds: panel open/close, button click, text typewriter tick
- [ ] NPC interaction: conversation start chime, gift received
- [ ] Combat: hit, miss, spell cast, level up fanfare
- [ ] World: footsteps on sand/stone/grass (already partially done), door open/close
- [ ] Arabic-specific: correct answer ding, vocabulary learned flourish, review complete

---

## TIER 3: Onboarding & First 5 Minutes (Do After Tier 1 Zone Is Done)
*The first 30 seconds decide if someone keeps playing.*

### 3A. Cinematic Intro
- [ ] 5-second text crawl after loading screen: "A young scholar discovers an ancient manuscript..."
- [ ] Fade into Oasis Village at dawn, camera slowly panning to player character
- [ ] First floating Arabic word appears in the world (glowing, interactive)
- [ ] Player walks to it, touches it, learns first word — reward animation
- [ ] Guide Amira appears, speaks ONE line, gives first quest
- [ ] No menus, no settings, no explanation — pure discovery

### 3B. Learning Path Choice (During Onboarding)
- [ ] After first word learned, Guide Amira asks: "What draws you to Arabic?"
- [ ] Player picks one of three FOCUS PATHS (affects word order, NPC emphasis, quest priority):
  - **Path of the Scholar** (القارئ) — Reading focus: Quranic vocabulary, classical texts, literary Arabic, calligraphy. Prioritizes reading comprehension, root analysis, formal register. Scholar Yusuf becomes primary mentor.
  - **Path of the Traveler** (المسافر) — Conversational focus: greetings, directions, food, shopping, daily life. Prioritizes speaking phrases, practical vocab, social situations. Guide Amira becomes primary mentor.
  - **Path of the Historian** (المؤرخ) — Cultural focus: historical terms, place names, scientific Arabic, trade vocabulary. Prioritizes world exploration, cultural notes, faction knowledge. Elder Tariq becomes primary mentor.
- [ ] ALL paths teach the same Fusha (MSA) — no dialects. The difference is WHICH words come first and WHICH NPCs/quests are highlighted
- [ ] Path choice affects: vocabulary ordering, NPC relationship bonuses, quest recommendations, achievement categories, skill tree emphasis
- [ ] Player can switch paths later (but loses priority bonuses)
- [ ] This creates replayability — "I did Scholar path, now I want Traveler" = different experience

### 3C. First Quest Flow
- [ ] "Learn 3 Arabic words from objects in the village" — words float above pots, signs, buildings
- [ ] Each word teaches with visual + Arabic + transliteration + audio
- [ ] After 3 words: reward (gold coins, achievement toast, "You know 3 Arabic words!")
- [ ] Guide Amira asks the Path choice question (3B above)
- [ ] Based on path: different first real quest and mentor NPC
- [ ] Player has learned the core loop in under 2 minutes without a single tutorial popup

---

## TIER 4: Content Depth (Do After Tiers 1-3 Are Solid)
*The game has systems. Now fill them with substance.*

### 4A. NPC Dialogue & Cultural Content (Researched from real history)
- [ ] Rewrite all 23 NPC dialogue trees with personality, cultural depth, humor
- [ ] Each NPC teaches something unique about Arabic culture/history, sourced from real historical records:
  - **Merchant Fatima**: Silk Road trade routes, how Arabic numerals spread to Europe, the word "algorithm" coming from Al-Khwarizmi's name, spice trade vocabulary
  - **Scholar Yusuf**: Arabic calligraphy traditions (6 canonical scripts), poetry of Al-Mutanabbi, the concept of ijazah (scholarly license), Bayt al-Hikma translations
  - **Guide Amira**: Journey of learning Arabic as a non-native, the difference between Fusha and dialects, how Arabic spread across 22 countries, modern Arabic media
  - **Librarian Ibrahim**: 400,000 books in Cordoba's library, paper-making from China via Samarkand, the translation movement, Arabic contributions to optics (Ibn al-Haytham)
  - **Farmer Omar**: Arabic agricultural revolution (irrigation, crop rotation), words English borrowed from Arabic (cotton, sugar, orange, lemon, algebra, zero)
  - **Blacksmith Daud**: Damascus steel secrets, Arabic metallurgy terms, geometric patterns in Islamic art (mathematical basis)
  - **Imam Muhammad**: Arabic as language of the Quran, how tajweed (pronunciation rules) preserved the language, the concept of fasaha (eloquence)
  - **Healer Khadija**: Ibn Sina's Canon of Medicine, Arabic medical vocabulary still used today, the hospital (bimaristan) as Arabic invention
  - **Captain Rashid**: Arabic navigation terms (admiral = amir al-bahr), the astrolabe, monsoon trade routes
  - **Princess Aisha**: Women scholars in Islamic history (Fatima al-Fihri founded world's first university), female poets, Scheherazade
  - **Poet Rumi**: Arabic poetry forms (qasida, ghazal), the power of the Arabic root system for wordplay, calligraphy as meditation
- [ ] Add 500+ new dialogue lines across all NPCs
- [ ] Add cultural notes that appear when vocabulary is learned ("Did you know the word 'check' in chess comes from Arabic شاه (shah)?")
- [ ] Cultural notes sourced from: Islamic Golden Age history, Cambridge History of Arabic Literature, 1001 Inventions project

### 4B. Quest Storylines
- [ ] Flesh out the main story: time-traveling scholar, manuscript pages
- [ ] 8-act structure spanning all zones
- [ ] Zone-specific side quests with Arabic learning tied to narrative
- [ ] Companion personal quests (fill the 573 missing dialogue lines)
- [ ] Discovery quests: find hidden Arabic inscriptions in the world

### 4C. Vocabulary Expansion (from Master Plan v8.0 → now v9.0)
- [ ] Expand from 1,220 to 5,000+ words
- [ ] Frequency-based ordering (most common words first)
- [ ] Semantic clusters (food words, family words, travel words)
- [ ] Root family groupings (ك-ت-ب root → كتاب، كاتب، مكتوب، مكتبة)
- [ ] CEFR-tagged: A1 (500), A2 (1,000), B1 (2,000), B2 (1,500)

---

## TIER 5: Learning Systems (Do After Content Exists)
*Build the teaching systems around the content.*

### 5A. Skill Trees (from Master Plan)
- [ ] 6 skill trees: Reading, Writing, Listening, Conversation, Grammar, Culture
- [ ] Visual skill tree UI (unlockable nodes, prerequisites)
- [ ] Each node teaches a specific concept with exercises
- [ ] Progression unlocks new zones, NPC dialogue, quest lines

### 5B. Grammar Expansion (from Master Plan)
- [ ] Expand from 7 to 50 grammar lessons
- [ ] A1: basic sentences, pronouns, simple verbs
- [ ] A2: past/present/future, questions, negation
- [ ] B1: verb forms, relative clauses, conditionals
- [ ] B2: literary Arabic, formal register, complex structures
- [ ] 12 exercise types per lesson

### 5C. Quiz & Assessment (from Master Plan)
- [ ] Expand from 6 to 18 quiz types
- [ ] Adaptive engine that adjusts difficulty based on performance
- [ ] Diagnostic assessment at game start to place players at right level
- [ ] Progress reports showing CEFR level advancement

### 5D. Achievements (from Master Plan)
- [ ] Expand from 44 to 250+ achievements
- [ ] Categories: vocabulary milestones, grammar mastery, exploration, social, combat, crafting
- [ ] Shareable "I learned X Arabic words" cards for social media

---

## TIER 6: Narrative & Social Systems (from Master Plan v9.0)
*The story that pulls players forward. Every player's journey is different.*

### 6A. Divergent Experience Engine
- [ ] Player choices create REAL consequences — not just dialogue flavor
- [ ] Faction alignment (Scholars/Merchants/Artisans/Travelers/Guardians/Artists) gates content:
  - Scholars: unlock library archives, formal Arabic, calligraphy quests, academic NPCs
  - Merchants: unlock trade routes, negotiation Arabic, caravan travel, market quests
  - Artisans: unlock crafting masters, technical Arabic, workshop interiors, creation quests
  - Travelers: unlock hidden zones, geographic Arabic, mount system, exploration quests
  - Guardians: unlock fortress areas, military Arabic, combat training, protection quests
  - Artists: unlock poetry circles, literary Arabic, music halls (ambient), performance quests
- [ ] NPC relationships shape what Arabic you learn — befriend a chef, learn food words; befriend a sailor, learn navigation words
- [ ] World state variables (500+) remembered: helped rebuild library? New books + NPCs appear. Ignored the merchant's request? She sells to someone else, prices change
- [ ] Daily/weekly rotating events: market festival, scholarly debate, caravan arrival, storm, eclipse — each with unique vocabulary and quests
- [ ] Vocabulary-as-character-build: the Arabic words you know unlock abilities, dialogue options, and areas. Two players with 500 words but different words have completely different game experiences

### 6B. Main Storyline
- [ ] 8-act main storyline with manuscript page collection
- [ ] 250+ quests (main, zone, companion, faction, daily, discovery)
- [ ] 350+ NPCs with personality, schedules, memory, gossip
- [ ] 6 factions: Scholars, Merchants, Artisans, Travelers, Guardians, Artists
- [ ] Gift + relationship system (100+ gifts)
- [ ] Player identity: backgrounds, titles, housing, journal
- [ ] Lore codex: 300+ entries, environmental storytelling

---

## TIER 7: Infrastructure (from Master Plan v10.0)
*Scale the foundation for 800K LOC. New tools from docx research integrated.*

- [ ] Backend v2: API, MongoDB 15+ collections, Redis, CDN
- [ ] AceBase integration: realtime live object sync (installed) replacing manual CRUD for save states
- [ ] State management overhaul: 25+ Redux slices, normalization
- [ ] Performance: code splitting, Web Workers, streaming, bundle < 500KB, Phaser custom-build to strip unused modules
- [ ] Testing: expand to 2,000+ tests, Playwright E2E, Visual Regression Tracker for pixel art
- [ ] Content pipeline: vocabulary, dialogue, quest authoring tools
- [ ] Save system: 3 slots, cloud sync, compression, migration
- [ ] Migrate dialogue system to inkjs (installed) — ink scripting for branching narrative instead of hardcoded JSON
- [ ] Integrate CAMeL Arabic Frequency Lists (17.3B token corpus) for vocabulary ordering
- [ ] Integrate Arabic CEFR Classified List (8,834 lemmas mapped A1-C2) for level gating
- [ ] Replace js-arabic-reshaper with mapbox-gl-rtl-text (ICU-based, production-proven) for Arabic rendering
- [ ] Tiled MCP server (cloned at .mcp/tiled-mcp-server) for AI-assisted map creation
- [ ] economia-style agent-based market simulation for dynamic NPC pricing

---

## TIER 8: AAA Polish (from Master Plan v11.0)
*The difference between "feature complete" and "feels like a real game."*

- [ ] World polish: environmental animations, footsteps on every surface, transitions, loading tips
- [ ] Onboarding overhaul: gradual HUD reveal, contextual hints (replaces Tier 3 quick fix with full system)
- [ ] Accessibility: color blind modes, font scale, screen reader, input remapping
- [ ] Game feel: hit-stop, floating damage numbers, camera choreography, screen shake tuning
- [ ] UI polish: menu transitions, PixelButton system, HUD redesign, gamepad support
- [ ] Endgame: New Game+, arena leaderboards, completionist tracker, weekly rotation

---

## Installed Packages (Ready to Use)

| Package | Purpose | Status |
|---------|---------|--------|
| phaser3-rex-plugins | RTL text, UI sizers, dialogue, inventory, pathfinding | Installed |
| phaser-animated-tiles | Tiled map tile animations | Installed |
| inkjs | Ink narrative scripting (80 Days, Heaven's Vault) | Installed |
| acebase | Realtime NoSQL with live object sync | Installed |
| js-arabic-reshaper | Arabic letter joining (to be replaced by mapbox-gl-rtl-text later) | Installed |
| tiled-mcp-server | AI-assisted Tiled map creation | Cloned at .mcp/ |

## Order of Operations

```
NOW        → Tier 1A (you design Oasis Village in Tiled)
           → Tier 1B + 1C (I strip in-game UI + rebuild with Kenmi while you design)
PARALLEL   → Tier 2A (source ambient audio)
THEN       → Tier 3 (onboarding — needs the good-looking zone first)
           → Tier 4A (NPC dialogue rewrite with cultural depth)
ONGOING    → Tier 1D (you design more zones over time)
           → Tier 4B + 4C (quest storylines + vocabulary expansion to 5,000 words)
AFTER      → Tier 5 (learning systems: skill trees, grammar, quizzes, achievements)
           → Tier 6 (narrative: divergent experience engine, factions, 8-act story)
LATER      → Tier 7 (infrastructure: inkjs migration, AceBase sync, CAMeL frequency lists, Tiled MCP)
LAST       → Tier 8 (AAA polish: game feel, accessibility, endgame)
```

## After /clear, Say This:

> "Continue with the NEXT-STEPS.md to-do list. Read `.planning/NEXT-STEPS.md` for the combined master plan. I'm working on Tiled maps — you work on Tier 1B (strip in-game UI and rebuild with Kenmi pixel art panels)."

Or if you want me to work on something specific:

> "Continue with NEXT-STEPS.md. Work on Tier [X] — [specific task]."

---

*Combined master to-do list — replaces original MASTER-PLAN.md phase numbering for post-v8.0 work.*
*Original master plan research docs (.planning/research/EXPANSION-*.md) remain valid references.*
*All resources saved in memory: gogo-arabic-plugins-resources.md + gogo-arabic-docx-resources.md*
*Last updated: 2026-03-17*
