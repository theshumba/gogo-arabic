# GOGO ARABIC -- PRODUCT REQUIREMENTS DOCUMENT (FINAL)

**Version:** 1.0
**Date:** 7 February 2026
**Purpose:** This document is the single source of truth for building Gogo Arabic. It contains every decision, every screen spec, every data flow, and every asset reference. Claude Code should implement exactly what is described here with zero guesswork.

---

## TABLE OF CONTENTS

1. Product Overview
2. Non-Negotiable Design Rules
3. Tech Stack and Architecture
4. Asset Sources and File References
5. Data Pipeline (Vocabulary, Quran, Audio)
6. World Design (8 Zones)
7. NPC System
8. Screen-by-Screen Specifications
9. Quiz System (8 Quiz Types)
10. Progression System (XP, Levels, Quests)
11. Shop System
12. Audio System
13. Backend and Sync
14. Error Handling
15. Implementation Phases

---

## 1. PRODUCT OVERVIEW

**One-liner:** A web-based pixel-art RPG where you learn Quranic and Classical Arabic by exploring a world, talking to NPCs, and doing quizzes. Pokemon meets Duolingo, but for Arabic with a Quranic-first vocabulary.

**Platform:** Desktop web browser (primary), mobile web (best-effort, not optimised)
**Resolution:** Responsive scaling. The game fills the entire browser window. Pixel art uses nearest-neighbour (CSS `image-rendering: pixelated`) scaling to stay crisp at any size. Base design resolution is 1280x720. All UI elements scale proportionally with the viewport.
**Art style:** Retro pixel art (16-bit style)
**Fonts:**
- English UI: "Press Start 2P" (Google Font, pixel style)
- Arabic decorative/title text: "Amiri" (Google Font, traditional calligraphic feel)
- Arabic body/quiz text: "Noto Kufi Arabic" (Google Font, clean and highly readable)

**Learning approach:** Quranic-first. Core vocabulary is drawn from the Quran and hadith. Everyday practical words (greetings, numbers, directions, food) supplement the Quranic core for gameplay purposes. Each Quranic word cites its surah and ayah source. Basic grammar is tied to vocabulary (word type, root letters, verb forms) rather than taught as a separate module.

**Target vocabulary:** 2000+ words for v1.

---

## 2. NON-NEGOTIABLE DESIGN RULES

These three rules override every other design decision. If any feature, asset, or screen violates these rules, it must be changed.

### Rule 1: ALL characters are faceless
No eyes, no mouth, no facial features on any human or animal character sprite, portrait, or icon. This applies to:
- Player character (all outfit spritesheets)
- All NPC sprites
- Any animal sprites (birds, camels, fish, etc.)
- NPC dialogue portraits (use silhouettes, see section 7)
- Character creation preview
- Shop character preview

**Implementation:** Take existing monster-quest character spritesheets (which have faces) and edit them to add head coverings (kufis, ghutras, hijabs, turbans, hoods) that obscure the face area entirely. Each head covering should look intentional and culturally appropriate, not like a censor bar. The existing koi fish on the main menu are a perfect reference: they are animated but have no facial features.

### Rule 2: NO music
Zero music tracks. Audio consists only of:
- Ambient environmental loops (one per zone)
- UI sound effects (button clicks, correct/wrong chimes, level-up, etc.)
- Arabic pronunciation audio (letter sounds and word-level TTS)

### Rule 3: Arabic is prominent
Arabic text must be large, beautiful, and correctly rendered everywhere it appears. Specifically:
- Arabic text always renders right-to-left (RTL)
- Diacritics/tashkeel marks are always displayed by default (user can toggle off in settings)
- Arabic is never smaller than its English translation on the same screen
- Arabic uses Amiri font for titles/decorative and Noto Kufi Arabic for body text
- Arabic text inside the Phaser game world uses DOM overlays (HTML divs positioned over the canvas) for guaranteed correct rendering

---

## 3. TECH STACK AND ARCHITECTURE

```
Frontend:
  React 19 + Redux Toolkit    (all UI: menus, quizzes, dialogue, HUD, keyboard, shop)
  Phaser 3                     (game world: tile maps, sprites, camera, movement)
  Vite                         (build tool)
  ts-fsrs                      (spaced repetition algorithm)
  Howler.js                    (audio playback)
  redux-persist                (localStorage saving)

Backend:
  Express.js                   (REST API)
  MongoDB                      (database)
  Google OAuth                 (authentication)

Communication:
  EventBus (Phaser.Events.EventEmitter) bridges Phaser and React
  Redux store is shared between both layers
```

### Architecture pattern
- **Phaser** renders the game world only: tile maps, character sprites, NPC sprites, object sprites, camera following, collision detection, zone transitions
- **React** renders ALL user interface: main menu, character creation, HUD overlay, NPC dialogue boxes, quiz overlays, alphabet module, daily review, quest log, shop, settings, world map, stats/leaderboard
- **DOM overlays** render Arabic text that appears in the game world (NPC name labels, sign text, interaction prompts). These are absolutely-positioned HTML elements that track Phaser world coordinates via the camera position, updated each frame
- **EventBus** handles communication: Phaser emits events like `npc-interact`, `zone-exit`, `object-interact`; React listens and shows appropriate UI. React emits events like `dialogue-complete`, `quiz-done`; Phaser listens and resumes gameplay
- **Redux** is the single source of truth for all game state: player stats, inventory, quest progress, vocabulary progress, FSRS card states, settings

### State shape (Redux)
```
{
  player: {
    name: string,
    skinTone: number,
    outfit: string,
    level: number,
    xp: number,
    xpToNextLevel: number,
    dirhams: number,
    wordsLearned: number,
    streak: number,
    lastPlayedDate: string,
    currentZone: string,
    unlockedZones: string[],
    inventory: { itemId: string, equipped: boolean }[],
    position: { x: number, y: number }
  },
  vocabulary: {
    words: VocabWord[],
    fsrsCards: FSRSCard[],
    reviewQueue: string[],
    stats: { totalReviews: number, accuracy: number, streakDays: number }
  },
  quests: {
    active: Quest[],
    completed: Quest[],
    available: Quest[]
  },
  npcs: {
    dialogueState: { [npcId]: { lastLine: number, wordsTeught: string[] } }
  },
  alphabet: {
    groups: AlphabetGroup[],
    completedGroups: string[],
    currentLesson: { groupId: string, step: number } | null
  },
  settings: {
    showTransliteration: boolean,
    showDiacritics: boolean,
    keyboardMode: 'onscreen' | 'physical',
    ambientVolume: number,
    sfxVolume: number,
    pronunciationVolume: number
  },
  ui: {
    currentScreen: string,
    dialogueOpen: boolean,
    quizOpen: boolean,
    menuOpen: boolean
  },
  sync: {
    lastSyncTime: string,
    pendingChanges: boolean,
    isOnline: boolean
  }
}
```

---

## 4. ASSET SOURCES AND FILE REFERENCES

### From devloos/monster-quest (`/Users/theshumba/monster-quest`)

| Asset | Source path | Usage | Modification needed |
|-------|-----------|-------|-------------------|
| Player spritesheet | `/graphics/characters/player.png` | Player walking sprite (512x512, 4x4 grid of 128x128 frames) | Remove face, add head covering variants |
| NPC spritesheets | `/graphics/characters/*.png` | NPC walking sprites | Remove faces, add unique head coverings |
| Sand tileset | `/graphics/tilesets/sand.png` | Oasis, Desert, Souk, Bedouin, Farm zones | None |
| Grass tileset | `/graphics/tilesets/grass.png` | Oasis, Farm, Palace zones | None |
| Water tileset | `/graphics/tilesets/water.png` | Oasis, Port zones | None |
| Mountain tileset | `/graphics/tilesets/mountain.png` (if exists) | Mountain zone | None |
| Palm trees | `/graphics/objects/palms.png` | Oasis, Desert zones | None |
| Houses | `/graphics/objects/houses.png` | Village zones | None |
| Rocks | `/graphics/objects/rocks.png` | All outdoor zones | None |
| Ruins | `/graphics/objects/ruins.png` | Desert, Library zones | None |
| Trees | `/graphics/objects/trees.png` | Farm, Mountain zones | None |
| Battle backgrounds | `/graphics/backgrounds/*.png` | Possible quiz backgrounds | None |
| UI icons | `/graphics/ui/*.png` | HUD elements, buttons | None |

**Note:** Claude Code must explore the full `/graphics/` directory tree to catalogue all available assets. The above is based on the PRD brainstorm document; the actual file names and paths may vary. Run `find /Users/theshumba/monster-quest/graphics -type f -name "*.png"` to get the complete list.

### From SimpleLuke/japanese-learning-RPG (`/Users/theshumba/japanese-learning-RPG`)

| Asset | Source path | Usage | Modification needed |
|-------|-----------|-------|-------------------|
| Koi fish GIF | `/client/src/assets/pixel-fishes.gif` (or similar) | Main menu background | None (already in use, keep as-is) |
| Pixel sepia GIF | `/client/src/assets/pixel-sepia.gif` | Character creation background | None |
| Shop background GIF | `/client/src/assets/shop-bg2.gif` | Shop screen background | None |
| Other animated GIFs | `/client/src/assets/*.gif` | Various screen backgrounds | None |
| 3D pixel button CSS | `/client/src/styles/` or component files | Button styling reference | Adapt to Gogo Arabic colour palette |
| Character layering system | `/client/src/components/Character/` | Reference for outfit display | Adapt pattern, but use pre-composed outfits instead of layers |

**Note:** Claude Code must explore `/client/src/assets/` and `/client/src/` to find all GIF files and component patterns. Run `find /Users/theshumba/japanese-learning-RPG -type f \( -name "*.gif" -o -name "*.css" \)` to catalogue.

### From Arabic data repos

| Repo | Path | Usage |
|------|------|-------|
| risan/quran-json | `/Users/theshumba/quran-json` | Primary vocabulary source (Quranic words, ayah references) |
| gitzain/quran101 | `/Users/theshumba/quran101` | 101 Quranic verbs with root letter analysis |
| SMenigat/thousand-most-common-words | `/Users/theshumba/thousand-most-common-words` | Cross-reference for common words, gap-filling |
| edenmind/OpenArabic | `/Users/theshumba/OpenArabic` | Supplementary sentences, translations, topic organisation |
| michaelsboost/ArabEngo | `/Users/theshumba/ArabEngo` | 28 Arabic letter audio files |
| ARBML/Calliar | `/Users/theshumba/Calliar` | Arabic calligraphic style reference (decorative use) |

### Built from scratch

- Faceless character spritesheets (edited from monster-quest originals)
- Pre-composed outfit spritesheets (10-15 complete outfits as 512x512 spritesheets)
- NPC silhouette portraits (solid coloured silhouettes with distinctive head covering outlines)
- Zone-specific tile map layouts (hand-designed as JSON/code arrays)
- Interactive object sprites (bookshelves, signs, treasure chests, wells) if not available in monster-quest
- All quest dialogue content
- All NPC dialogue trees
- World map UI screen
- Stats/leaderboard UI screen
- TTS-generated Arabic word audio files (2000+ words via Google Cloud TTS)
- Ambient sound loops (sourced from freesound.org or similar free libraries)
- UI sound effects (sourced from freesound.org or similar free libraries)

---

## 5. DATA PIPELINE (VOCABULARY, QURAN, AUDIO)

This is a pre-game-build phase. Claude Code builds scripts that extract, transform, and output reviewable data files. The user reviews and approves before the data is wired into the game.

### Step 1: Extract Quranic vocabulary
**Input:** `/Users/theshumba/quran-json` (complete Quran in JSON)
**Process:**
1. Parse all surahs and ayahs
2. Tokenise Arabic text into individual words
3. Remove duplicates (same root word)
4. For each unique word, record: Arabic (with diacritics), English meaning, transliteration, source surah number, source ayah number, frequency count across the Quran
5. Sort by frequency (most common Quranic words first)
6. Target: extract the top 1500 most frequent unique Quranic words

**Output:** `quranic-vocabulary-raw.json`

### Step 2: Extract root letter data
**Input:** `/Users/theshumba/quran101` (101 Quranic verbs with root analysis)
**Process:**
1. Parse verb entries
2. For each verb, extract: Arabic verb, English meaning, 3-letter root, verb pattern/form
3. Cross-reference with Step 1 output to enrich matching words with root data

**Output:** `quranic-roots.json`

### Step 3: Fill practical vocabulary gaps
**Input:** `/Users/theshumba/thousand-most-common-words` (1000 common words)
**Process:**
1. Parse the 1000 common words list
2. Identify words NOT already in the Quranic vocabulary set
3. Add essential everyday words (greetings, numbers 1-100, colours, family terms, food, directions, body parts) that are needed for gameplay
4. Tag these as `source: "common"` vs Quranic words tagged `source: "quran"`
5. Target: add 500+ practical words to supplement the 1500 Quranic words

**Output:** `practical-vocabulary-raw.json`

### Step 4: Merge and structure for game use
**Process:**
1. Merge Quranic and practical vocabulary into one unified file
2. Assign each word:
   - `id`: unique identifier
   - `arabic`: Arabic text with full diacritics
   - `english`: English translation
   - `transliteration`: romanised pronunciation
   - `source`: "quran" | "common"
   - `quranRef`: { surah: number, ayah: number } | null
   - `rootLetters`: string | null (3-letter root if known)
   - `partOfSpeech`: "noun" | "verb" | "adjective" | "adverb" | "preposition" | "particle" | "phrase"
   - `difficulty`: 1-5 (based on frequency: 1 = most common, 5 = rare)
   - `category`: thematic category for zone assignment (see zone table below)
   - `exampleSentence`: { arabic: string, english: string } | null
   - `zone`: which game zone teaches this word
3. Distribute words across 8 zones (approximately 250 words per zone)
4. Ensure difficulty progression: earlier zones (Oasis, Library) get difficulty 1-2 words; later zones get difficulty 3-5

**Output:** `vocabulary-final.json` (this is the file the user reviews)

### Step 5: Generate Arabic audio
**Input:** `vocabulary-final.json` (after user approval)
**Process:**
1. For each word, call Google Cloud TTS API with:
   - Language: `ar-XA`
   - Voice: a natural-sounding Arabic voice (e.g. `ar-XA-Standard-A`)
   - Text: the Arabic word with diacritics
   - Output format: MP3, 22050Hz
2. Save each audio file as `audio/words/{wordId}.mp3`
3. Copy ArabEngo letter audio files from `/Users/theshumba/ArabEngo` to `audio/letters/`

**Output:** `audio/words/` directory (2000+ MP3 files), `audio/letters/` directory (28 MP3 files)

### Zone-to-category mapping

| Zone | Primary categories | Difficulty range |
|------|-------------------|-----------------|
| Oasis Village | Greetings, family, daily life, basic Quranic terms (Allah, bismillah, salaam) | 1-2 |
| Ancient Library/Madrasa | Alphabet, reading, writing, core Quranic vocabulary (iman, salah, tawbah) | 1-2 |
| Desert Marketplace/Souk | Numbers, trade, food, money, haggling phrases | 2-3 |
| Farmland/Fields | Nature, body parts, verbs of action, animals | 2-3 |
| Bedouin Camp | Time, storytelling, phrases, weather, Quranic narrative words | 3-4 |
| Mountain Village | Weather, animals, clothing, survival, Quranic descriptive words | 3-4 |
| Coastal Port | Travel, directions, boats, trade goods, Quranic journey words | 4-5 |
| Royal Palace/Garden | Formal speech, adjectives, colours, governance, advanced Quranic vocabulary | 4-5 |

---

## 6. WORLD DESIGN (8 ZONES)

All maps are hand-designed in code as JSON tile arrays. Each zone is a distinct map that loads independently.

### Global map specs
- **Tile size:** 64x64 pixels
- **Map sizes:** vary by zone (see below), minimum 30x25 tiles, maximum 50x40 tiles
- **Layers per map:** water, background (sand/grass/stone), shadows, main (walls/objects), top (tree canopies, roofs), collision
- **Tilesets:** sourced from monster-quest `/graphics/tilesets/`
- **Zone exits:** specific tiles at map edges that trigger zone transitions (screen fade to black, load new zone, fade in)
- **Interactive objects:** each zone has bookshelves, signs, treasure chests, and/or ambient objects (wells, fountains) placed at specific coordinates

### Progression structure
- **Linear (first 3):** Oasis Village >> Ancient Library >> Desert Marketplace. Player must complete each to unlock the next.
- **Semi-open (remaining 5):** After completing the Souk, the remaining 5 zones unlock based on the player's level and word count. Player chooses which to visit in any order.

| Zone | Unlock requirement |
|------|-------------------|
| Oasis Village | Always available (starter zone) |
| Ancient Library/Madrasa | Complete Oasis Village main quest |
| Desert Marketplace/Souk | Complete Library main quest |
| Farmland/Fields | Level 8+ and 400+ words learned |
| Bedouin Camp | Level 11+ and 600+ words learned |
| Mountain Village | Level 14+ and 800+ words learned |
| Coastal Port | Level 17+ and 1200+ words learned |
| Royal Palace/Garden | Level 20+ and 1600+ words learned |

(Zone unlock passes from the shop bypass these requirements.)

### Zone 1: Oasis Village
- **Size:** 40x30 tiles
- **Tileset palette:** Sand base, grass patches, water (oasis pool/stream), palm trees, small mud-brick houses, wells, pottery, market stalls
- **Ambient sound:** Desert wind with distant bird calls and gentle water flowing
- **NPCs:** 3-4 (village elder/teacher, a friendly neighbour, a child practice partner, optional wandering merchant)
- **Interactive objects:** 2 bookshelves (word of the day), 3 signs (Arabic text), 1 treasure chest (hidden behind a palm tree, 50 dirhams), 1 well (ambient splash sound on interact)
- **Zone exits:** East edge leads to Ancient Library. South edge leads to Desert (locked until Souk completed, then opens to world map fast travel)
- **Main quest chain:** "Welcome to the Oasis" (3-4 steps: meet the elder, learn 10 greeting words, practice with the child NPC, deliver a message to the neighbour)
- **Vocabulary focus:** ~250 words (greetings, family, basic Quranic terms)

### Zone 2: Ancient Library/Madrasa
- **Size:** 35x30 tiles
- **Tileset palette:** Stone/sandstone interior and exterior, bookshelves as wall tiles, scrolls, candles/lanterns, arched doorways, courtyard with fountain
- **Ambient sound:** Quiet room tone, occasional page turning, distant fountain, writing/quill sounds
- **NPCs:** 2-3 (head librarian/scholar, a scribe, a student)
- **Interactive objects:** 5+ bookshelves (each teaches a different alphabet group or Quranic term), 2 signs (Arabic calligraphy), 1 treasure chest (behind a bookshelf, alphabet-themed reward)
- **Zone exits:** West edge returns to Oasis Village. East edge leads to Desert Marketplace.
- **Main quest chain:** "The Lost Scrolls" (4-5 steps: help the librarian catalogue scrolls, learn all 13 alphabet groups, pass a recognition quiz, find a hidden scroll, read an ayah)
- **Vocabulary focus:** ~250 words (alphabet mastery, reading, core Quranic vocabulary)

### Zone 3: Desert Marketplace/Souk
- **Size:** 45x35 tiles (larger to feel bustling)
- **Tileset palette:** Sand base, colourful market stalls with awnings, crates, barrels, carpets on ground, hanging lanterns, narrow alleyways
- **Ambient sound:** Marketplace chatter, crowd murmur, occasional merchant calling out, clinking coins
- **NPCs:** 5-6 (spice merchant, cloth seller, fruit vendor, goldsmith, a haggling customer, a guard)
- **Interactive objects:** 4 market stall signs (Arabic price lists), 2 treasure chests (hidden in alleyways), 1 bookshelf (merchant's account book)
- **Zone exits:** West edge returns to Library. Multiple edges open to world map fast travel (unlocks semi-open progression).
- **Main quest chain:** "The Art of the Deal" (4-5 steps: learn numbers, buy an item using Arabic, haggle with the cloth seller, help the spice merchant translate for a customer, earn your first 100 dirhams)
- **Vocabulary focus:** ~250 words (numbers, trade, food, money, haggling phrases)

### Zone 4: Farmland/Fields
- **Size:** 45x35 tiles
- **Tileset palette:** Dirt/earth base, green crop rows, fences, barns, irrigation channels, scattered trees, haystacks, animals (faceless chickens, goats, camels)
- **Ambient sound:** Bird sounds, rustling crops, distant animal sounds, gentle breeze
- **NPCs:** 1-2 (farmer, farmer's helper)
- **Interactive objects:** 3 signs (crop labels in Arabic), 1 bookshelf (farmer's almanac), 2 treasure chests (in barn, behind haystack)
- **Zone exits:** Edges connect to world map fast travel.
- **Main quest chain:** "Seeds of Knowledge" (3-4 steps: learn nature vocabulary by helping plant crops, identify animals, describe body parts when treating an injured goat, complete an action verbs quiz)
- **Vocabulary focus:** ~250 words (nature, body parts, verbs of action, animals)

### Zone 5: Bedouin Camp
- **Size:** 35x25 tiles (smaller, intimate)
- **Tileset palette:** Deep sand/dune colours, large tents (black/brown), campfire, camel resting area, star-viewing spot, woven rugs
- **Ambient sound:** Desert wind (stronger than Oasis), crackling campfire, distant camel sounds, night insects
- **NPCs:** 2-3 (camp elder/storyteller, a traveller, a young herder)
- **Interactive objects:** 2 signs (direction markers in Arabic), 1 bookshelf (storyteller's scroll collection), 1 treasure chest (buried in sand near tent edge), 1 campfire (ambient warmth animation on interact)
- **Zone exits:** Edges connect to world map fast travel.
- **Main quest chain:** "Tales Under the Stars" (4-5 steps: sit with the elder to hear a Quranic story, learn time-related vocabulary, practise telling a short story using phrase vocabulary, help the traveller with directions)
- **Vocabulary focus:** ~250 words (time, storytelling, phrases, weather, Quranic narrative words)

### Zone 6: Mountain Village
- **Size:** 40x30 tiles
- **Tileset palette:** Rocky/grey stone base, sparse vegetation, stone houses with flat roofs, mountain paths, snow-capped peaks in background (top layer), goats on ledges
- **Ambient sound:** Mountain wind, distant bird of prey cry, goat bells, echoing footsteps
- **NPCs:** 2-3 (village chief, a weaver, a shepherd)
- **Interactive objects:** 2 signs (trail markers in Arabic), 1 bookshelf (weaver's pattern descriptions), 2 treasure chests (on difficult-to-reach ledge, inside a cave entrance)
- **Zone exits:** Edges connect to world map fast travel.
- **Main quest chain:** "The Mountain Path" (3-4 steps: learn weather vocabulary from the shepherd, describe clothing for cold weather, help the weaver label patterns, identify mountain animals)
- **Vocabulary focus:** ~250 words (weather, animals, clothing, survival, Quranic descriptive words)

### Zone 7: Coastal Port
- **Size:** 45x35 tiles
- **Tileset palette:** Sand meeting blue water, wooden docks/piers, boats (small dhows), warehouses, rope/nets, lighthouse, seagulls (faceless), fish market stalls
- **Ambient sound:** Waves crashing, seagulls, dock creaking, rope pulling, distant ship horns
- **NPCs:** 4-5 (harbour master, a dhow captain, a fishmonger, a navigator, a customs officer)
- **Interactive objects:** 3 signs (dock labels and ship names in Arabic), 2 bookshelves (navigation charts), 2 treasure chests (in warehouse, on dock edge)
- **Zone exits:** Edges connect to world map fast travel.
- **Main quest chain:** "Voyage of Words" (4-5 steps: learn directions from the navigator, help the harbour master label cargo, buy fish using Arabic, help the captain prepare for a voyage using Quranic journey words)
- **Vocabulary focus:** ~250 words (travel, directions, boats, trade goods, Quranic journey words)

### Zone 8: Royal Palace/Garden
- **Size:** 50x40 tiles (largest, most detailed)
- **Tileset palette:** Ornate stone/marble, mosaic floors, arched colonnades, fountain courtyard, lush garden with hedges and flowers, throne room interior, gold/blue colour accents
- **Ambient sound:** Palace fountain, garden birds, gentle wind through trees, distant formal conversation
- **NPCs:** 3-4 (royal advisor, palace guard, court poet, a visiting scholar)
- **Interactive objects:** 4 bookshelves (palace library with advanced Quranic texts), 3 signs (formal Arabic inscriptions), 2 treasure chests (in garden maze, in a hidden palace room), 1 fountain (ambient water animation)
- **Zone exits:** Edges connect to world map fast travel.
- **Main quest chain:** "Words of the Court" (5-6 steps: learn formal greetings from the advisor, describe the garden using adjectives and colours, compose a short formal sentence, discuss governance vocabulary with the scholar, pass an advanced Quranic vocabulary quiz to earn the court poet's respect)
- **Vocabulary focus:** ~250 words (formal speech, adjectives, colours, governance, advanced Quranic vocabulary)

---

## 7. NPC SYSTEM

### NPC density by zone

| Zone | NPC count | Rationale |
|------|-----------|-----------|
| Oasis Village | 3-4 | Small friendly village |
| Ancient Library/Madrasa | 2-3 | Quiet scholarly place |
| Desert Marketplace/Souk | 5-6 | Bustling, crowded |
| Farmland/Fields | 1-2 | Sparse, rural |
| Bedouin Camp | 2-3 | Small tight-knit community |
| Mountain Village | 2-3 | Remote settlement |
| Coastal Port | 4-5 | Busy trading hub |
| Royal Palace/Garden | 3-4 | Guards, advisors, royalty |

**Total: approximately 22-30 NPCs across the whole game.**

### NPC interaction flow
1. Player walks near an NPC (within 2 tiles). A DOM overlay shows the NPC's name in Arabic (Amiri font) and English, plus a "SPACE" prompt.
2. Player presses SPACE. Phaser emits `npc-interact` event with the NPC's ID.
3. React shows the dialogue overlay (see Screen spec section 8.5).
4. Dialogue progresses line by line. Each line shows: Arabic text (Noto Kufi, large), English translation (smaller), transliteration (smallest, toggleable via settings).
5. At key points, the NPC "teaches" a word. The word appears in a highlighted card showing Arabic, English, transliteration, and a "play audio" button. The word is added to the player's vocabulary and an FSRS card is created.
6. Branching choices appear as 2-3 buttons (in Arabic with English subtitles). The player's choice affects which words are taught and which side quests are offered.
7. When dialogue ends, React emits `dialogue-complete`. Phaser resumes gameplay.

### NPC dialogue depth
- **Early zones (Oasis, Library, Souk):** Short dialogues, 5-10 lines per conversation, simple branching (1-2 choice points). Teach 3-5 new words per conversation.
- **Mid zones (Farmland, Bedouin, Mountain):** Medium dialogues, 10-15 lines, moderate branching (2-3 choice points). Teach 5-8 new words per conversation.
- **Late zones (Port, Palace):** Long dialogues, 15-25 lines, complex branching (3-4 choice points). Teach 8-12 new words per conversation. Include Quranic ayah quotations within dialogue.

### NPC portraits (silhouettes)
Each NPC has a unique silhouette portrait displayed in the dialogue box. These are solid-coloured silhouettes with distinctive outlines:
- **Shape defined by:** head covering type (kufi, ghutra, hijab, turban, hood), shoulder width, any held item (book, staff, basket)
- **Colour:** Each NPC has a unique silhouette colour (warm earth tones: terracotta, deep blue, forest green, burgundy, sand gold, etc.)
- **Size:** 96x96 pixels, displayed in the top-left corner of the dialogue box
- **Format:** PNG with transparent background
- **Total needed:** 22-30 unique silhouettes

---

## 8. SCREEN-BY-SCREEN SPECIFICATIONS

### 8.1 Main Menu

**Status:** Keep the existing koi fish animated GIF background. Update buttons for new features.

**Layout:**
- **Background:** Full-screen animated pixel-fishes.gif (from SimpleLuke repo, already in use)
- **Title:** "Gogo Arabic" in Press Start 2P font, white with dark pixel shadow, centred horizontally, top 25% of screen
- **Subtitle:** "يلا عربي" in Amiri font, golden colour (#D4A843), centred below title
- **Buttons:** Vertically stacked, centred, bottom 50% of screen. 3D pixel button style (from SimpleLuke CSS). Each button has English text in Press Start 2P and Arabic subtitle in Noto Kufi.

**Buttons (top to bottom):**
1. "New Game" / "لعبة جديدة" -- starts character creation
2. "Continue" / "متابعة" -- loads saved game, goes to game world (greyed out if no save exists)
3. "World Map" / "خريطة العالم" -- opens world map screen (greyed out if no save exists)
4. "Daily Review" / "مراجعة يومية" -- opens FSRS review session
5. "Alphabet" / "الأبجدية" -- opens alphabet module
6. "Settings" / "الإعدادات" -- opens settings screen

**Interactions:**
- Hover on button: slight scale-up (1.05x) and brightness increase
- Click button: 3D button press animation (from SimpleLuke pattern), button click SFX, navigate to target screen
- If no save data exists, "Continue" and "World Map" buttons are visually dimmed (50% opacity) and show a tooltip "Start a new game first" on hover

### 8.2 Character Creation

**Background:** pixel-sepia.gif (from SimpleLuke repo)

**Layout:**
- **Title:** "Create Your Character" / "أنشئ شخصيتك" at top
- **Character preview:** Centre of screen, shows a large (256x256) preview of the player character with current selections. The character is faceless with the selected head covering.
- **Name input:** Text field with placeholder "Enter your name" / "أدخل اسمك". Accepts both Latin and Arabic characters. Max 20 characters.
- **Skin tone selector:** 4 circular colour swatches in a horizontal row. Colours: light (#F5D0A9), medium (#D4A76A), tan (#A67B4B), dark (#6B4226). Selected swatch has a golden border.
- **Head covering selector:** Horizontal scrollable row of 6 options: Kufi, Ghutra, Turban, Hijab, Hood, None. Each option shows a small preview icon. Selected option has golden border.
- **Starting outfit selector:** Horizontal scrollable row of 3 basic outfits: Simple Thobe (white), Simple Abaya (black), Traveller's Cloak (brown). Selected has golden border.
- **"Begin Journey" / "ابدأ الرحلة" button:** Bottom centre, 3D pixel style, golden colour. Only enabled when name is entered.

**Interactions:**
- Changing any selector instantly updates the character preview
- Clicking "Begin Journey" saves character data to Redux, plays a short transition animation (fade to black with "بسم الله الرحمن الرحيم" text), then loads Oasis Village

### 8.3 Game World (Phaser)

**Rendering:**
- Phaser canvas fills the entire browser window (responsive scaling with nearest-neighbour)
- Camera follows the player character, centred
- Tile maps render with layers in order: water, background, shadow, main, top
- Collision layer prevents walking through walls, objects, water

**Player character:**
- Uses the pre-composed outfit spritesheet selected in character creation
- 512x512 spritesheet: 4x4 grid of 128x128 frames
- Row 0: walk down (4 frames), Row 1: walk left (4 frames), Row 2: walk right (4 frames), Row 3: walk up (4 frames)
- Animation: 8 FPS walk cycle, idle = frame 0 of current direction
- Movement: WASD or arrow keys, 4 pixels per frame movement speed
- Collision: 64x64 collision box centred on the bottom half of the sprite (so the character can walk "behind" tall objects)

**NPC characters:**
- Same spritesheet format as player (512x512, 4x4 grid)
- Idle animation: gently shift between frame 0 and frame 1 every 2 seconds
- DOM overlay above each NPC showing name in Arabic (Amiri font, 14px) and English (Press Start 2P, 10px)
- When player is within 2 tiles: DOM overlay adds a pulsing "SPACE" interaction prompt
- When player is further than 2 tiles: interaction prompt hidden

**Interactive objects:**
- Bookshelves, signs, treasure chests, wells/fountains placed at specific tile coordinates per zone
- Each has a small sparkle/glow particle effect to indicate interactivity
- When player is within 1 tile: DOM overlay shows interaction prompt ("SPACE to read" / "SPACE to open")
- SPACE triggers the appropriate UI overlay (bookshelf shows word card, sign shows Arabic text, chest shows reward popup, well plays splash SFX)

**Zone transitions:**
- Walking onto a zone exit tile triggers: movement disabled, screen fades to black (0.5s), new zone loads, player placed at the entry point of the new zone, screen fades in (0.5s), movement enabled
- Zone exit tiles are clearly marked with a path/road leading off the edge of the map

### 8.4 HUD (In-Game Overlay)

**Position:** Top of screen, full width, semi-transparent dark background (rgba(0,0,0,0.7)), 48px height.

**Left section (player info):**
- Level badge: circular badge showing current level number (Press Start 2P, gold text on dark background)
- XP bar: horizontal bar, 120px wide, showing XP progress to next level. Fill colour: gradient from green to gold. Text above: "XP: {current}/{needed}"
- Streak flame icon + streak count (e.g. "🔥 7" but use a pixel fire icon, not an emoji)

**Centre section (stats):**
- Dirhams: coin icon + count (e.g. "⬡ 1,250")
- Words learned: book icon + count (e.g. "📖 342")

**Right section (buttons):**
- "Quests" button (opens quest log)
- "Map" button (opens world map)
- "Menu" button (opens pause menu with options: Resume, Settings, Main Menu, Save & Quit)

**All icons are pixel art, not emoji.** If suitable icons exist in monster-quest `/graphics/ui/`, use those. Otherwise, create simple 16x16 or 24x24 pixel icons.

### 8.5 NPC Dialogue Overlay

**Position:** Bottom 30% of screen, full width, layered over the game world (game world is visible but dimmed behind).

**Layout:**
- **Background:** Dark semi-transparent panel (rgba(20, 15, 10, 0.9)) with pixel-art border (1px gold outline with corner decorations)
- **Portrait:** NPC silhouette (96x96) in top-left of the dialogue box
- **NPC name:** To the right of the portrait, in Amiri font (Arabic) and Press Start 2P (English), gold colour
- **Dialogue text area:** Below the name, full width minus portrait space
  - Line 1: Arabic text in Noto Kufi, 24px, white
  - Line 2: English translation, 14px, light grey (#AAAAAA)
  - Line 3: Transliteration, 12px, muted gold (#B8A070), only shown if settings.showTransliteration is true
- **Advance indicator:** Bottom-right corner, small pulsing triangle icon indicating "click/SPACE to continue"
- **Choice buttons:** When dialogue branches, 2-3 buttons appear below the text area. Each button shows Arabic (Noto Kufi, 16px) with English subtitle (10px). 3D pixel button style.

**Word teaching card:** When an NPC teaches a word, a highlighted card appears in the centre of the dialogue box:
- Card background: warm parchment colour (#F5E6C8) with dark border
- Arabic word: Amiri font, 32px, centred, dark brown
- English meaning: 16px, centred below
- Transliteration: 12px, muted, below English
- Speaker icon button: plays the word's TTS audio
- "Got it" / "فهمت" button: dismisses the card and continues dialogue
- The word is automatically added to the player's vocabulary and an FSRS card is created at this moment

**Interactions:**
- SPACE or click anywhere advances dialogue one line
- Clicking a choice button selects that branch
- ESC closes dialogue (emits `dialogue-complete`)
- During dialogue, player movement is disabled

### 8.6 Quiz Overlay

**Position:** Full-screen overlay on top of the game world (game world is fully hidden behind an opaque background).

**Background:** A subtle animated GIF or a solid colour with slight grain texture. Use a zone-appropriate battle background from monster-quest if available, otherwise a dark blue (#1A1A2E) with subtle particle effect.

**Common quiz UI elements (present on all 8 types):**
- **Top bar:** Quiz type label (e.g. "اختر الترجمة الصحيحة" / "Choose the correct translation"), progress indicator (e.g. "5/10"), timer (optional, see below)
- **Bottom bar:** "Skip" button (left), streak indicator showing current consecutive correct answers (centre), "Quit Quiz" button (right)
- **Feedback on answer:**
  - Correct: green flash on selected answer, correct answer chime SFX, XP popup (+10 XP), streak count increments
  - Wrong: red flash on selected answer, correct answer highlighted in green, wrong answer buzz SFX, streak resets to 0, brief display of the correct answer for 2 seconds
- **Auto-advance:** After feedback displays for 1.5 seconds (correct) or 3 seconds (wrong), automatically move to next question

**Timer:** Optional, controlled by quiz context. NPC quizzes have no timer. Daily review has no timer. Quest challenge quizzes have a 15-second timer per question (timer bar at top, changes colour from green to yellow to red).

### Quiz Type 1: Arabic to English (Multiple Choice) [EXISTING -- improve UI]
- **Prompt:** Arabic word displayed large (Amiri, 40px) at top centre
- **Audio button:** Speaker icon next to the Arabic word, plays TTS audio on click
- **Choices:** 4 English options in a 2x2 grid of buttons (Press Start 2P, 16px)
- **Distractor logic:** 3 wrong answers are randomly selected from the same category and similar difficulty level

### Quiz Type 2: English to Arabic (Multiple Choice) [EXISTING -- improve UI]
- **Prompt:** English word displayed (Press Start 2P, 24px) at top centre
- **Choices:** 4 Arabic options in a 2x2 grid (Noto Kufi, 24px). Each button also shows transliteration in smaller text if setting is enabled.
- **Audio:** Each choice button has a small speaker icon that plays the Arabic word's audio on hover/tap

### Quiz Type 3: Type the Arabic Word (On-Screen Keyboard) [EXISTING -- improve UI]
- **Prompt:** English word displayed at top. Below it, a Quranic reference if applicable (e.g. "سورة البقرة ٢:٢٥٥")
- **Input field:** Large text field showing typed Arabic in real-time (Noto Kufi, 32px, RTL)
- **On-screen keyboard:** Full Arabic keyboard layout at bottom 40% of screen. Keys are 3D pixel button style. Each key plays a soft click SFX on press.
- **Keyboard layout:** Based on `/Users/theshumba/arabic-virtual-keyboard` reference but custom-built. Includes: all 28 letters, hamza variants, taa marbuta, alef maqsura, diacritic keys (fatha, kasra, damma, shadda, sukun, tanwin), space, backspace
- **Submit button:** "Check" / "تحقق" button. Validates input against correct answer. Tolerant of missing diacritics if setting showDiacritics is false.

### Quiz Type 4: Listen and Identify [NEW]
- **Prompt:** A large speaker icon with "Listen" / "استمع" text. Auto-plays the TTS audio of the target word on load.
- **Replay button:** "Play again" button to re-hear the audio
- **Choices:** 4 Arabic word options in a 2x2 grid (Noto Kufi, 24px). Player must identify which Arabic word matches the audio they heard.
- **No English shown** in the prompt (this tests pure listening comprehension)

### Quiz Type 5: Match Pairs [NEW]
- **Layout:** Two columns. Left column: 5 Arabic words (Noto Kufi, 20px). Right column: 5 English meanings (Press Start 2P, 14px). Both columns are shuffled.
- **Interaction:** Player clicks an Arabic word (highlights it), then clicks the matching English meaning. If correct: both items turn green and are "locked" (cannot be re-selected). If wrong: both items flash red briefly, then deselect.
- **Completion:** When all 5 pairs are matched, show summary (time taken, mistakes made), award XP.
- **Audio:** Each Arabic word has a small speaker icon that plays its audio when the word is clicked (before matching).

### Quiz Type 6: Fill in the Blank [NEW]
- **Prompt:** An Arabic sentence (from Quran or example sentences) with one word replaced by "______". The sentence is displayed in Noto Kufi, 24px. English translation shown below with the missing word also blanked.
- **If Quranic:** Show surah and ayah reference below the sentence
- **Choices:** 4 Arabic word options (the correct word + 3 distractors from the same category)
- **On correct answer:** The blank fills in with the correct word, highlighted in gold. Brief flash of the complete ayah.

### Quiz Type 7: Root Letter Identification [NEW]
- **Prompt:** An Arabic word displayed large (Amiri, 40px). Below it: "What are the root letters?" / "ما هي الحروف الأصلية؟"
- **Choices:** 4 options, each showing a 3-letter root in Arabic (e.g. "ك ت ب", "ع ل م", "ق ر أ", "ح م د")
- **On correct answer:** Show a brief explanation: "The root {root} means {meaning} and appears in words like {example1}, {example2}"
- **Data source:** `quran101` repo root letter data

### Quiz Type 8: Word Building [NEW]
- **Prompt:** English meaning displayed at top (e.g. "he wrote"). Below it, a row of empty letter slots (one per letter in the Arabic word).
- **Letter bank:** A scattered/shuffled set of Arabic letter tiles below the slots. Includes the correct letters plus 2-3 distractor letters.
- **Interaction:** Player drags letters from the bank to the slots (or clicks letter then clicks slot). Letters snap into place. If RTL order is correct so far, no feedback. If all slots are filled correctly, success animation.
- **Reset button:** Clears all slots back to the letter bank
- **Hint button (if player has hint tokens):** Reveals one correct letter in its correct position

### 8.7 Alphabet Module

**Access:** From main menu or from in-game menu.

**Background:** Subtle parchment texture or pixel-sepia.gif

**Layout:**
- **Title:** "The Arabic Alphabet" / "الأبجدية العربية" (Amiri, 28px)
- **13 group cards** displayed in a scrollable grid (3 columns, 5 rows, last row has 1 card). Each card is 180x120px.

**Each group card shows:**
- Group name in English (Press Start 2P, 12px) e.g. "Ba Group"
- The Arabic letters in that group displayed large (Amiri, 28px) e.g. "ب ت ث"
- A progress indicator (0/5 steps completed, shown as 5 small dots)
- Gold border if completed, grey border if not started, blue border if in progress
- **FIX:** The "Ta Emphatic Group" card must NOT wrap to two lines. If the English name is too long, abbreviate or reduce font size for that card only.

**Clicking a group card opens the 5-step lesson:**

**Step 1: Introduction**
- Each letter shown large (Amiri, 64px) with name, transliteration, and audio play button
- Brief description of the sound
- "Next" button advances to step 2

**Step 2: Letter Forms**
- Shows all 4 positional forms (isolated, initial, medial, final) for each letter in the group
- Each form shown in Amiri, 48px, with a label below
- Example word using each form
- "Next" button advances to step 3

**Step 3: Vowel Combinations**
- Each letter shown with fatha, kasra, and damma diacritics
- Audio play button for each combination (letter + vowel sound)
- "Next" button advances to step 4

**Step 4: Recognition Quiz**
- 5-question quiz using Quiz Type 1 (Arabic to English) focused only on the letters in this group
- Must score 4/5 or higher to pass

**Step 5: Writing Quiz**
- 5-question quiz using Quiz Type 3 (type the Arabic) focused on this group's letters
- Must score 3/5 or higher to pass

**Completion:** Passing both quizzes marks the group as complete. Returning to the grid shows the updated progress.

### 8.8 Daily Review

**Access:** From main menu or in-game menu.

**Background:** Subtle animated background (pixel-sepia.gif or similar warm-toned GIF)

**Pre-review screen:**
- Shows: "Daily Review" / "المراجعة اليومية"
- Cards due today: count (e.g. "23 cards due")
- Current streak: flame icon + day count
- "Start Review" / "ابدأ المراجعة" button

**Review flow:**
- One card at a time, full screen
- **Front of card:** Arabic word large (Amiri, 40px), audio play button
- Player tries to recall the meaning, then taps "Show Answer" / "أظهر الإجابة"
- **Back of card:** English meaning, transliteration, example sentence, Quran reference (if applicable), root letters (if known)
- **4 rating buttons** at the bottom (3D pixel style):
  - "Again" / "مرة أخرى" (red) -- FSRS rating 1
  - "Hard" / "صعب" (orange) -- FSRS rating 2
  - "Good" / "جيد" (green) -- FSRS rating 3
  - "Easy" / "سهل" (blue) -- FSRS rating 4
- Rating button pressed: card is scheduled by FSRS algorithm, next card loads
- Correct answer chime on Good/Easy, neutral sound on Hard, "try again" sound on Again

**Post-review summary:**
- Total cards reviewed
- Accuracy breakdown (Again/Hard/Good/Easy percentages)
- Streak status (maintained or broken)
- XP earned (base: 5 XP per card reviewed, bonus: +2 XP for Good, +5 XP for Easy)
- "Done" button returns to previous screen

### 8.9 Quest Log

**Access:** From HUD "Quests" button or in-game menu.

**Background:** Parchment/scroll texture overlay on darkened game world

**Layout:**
- **Title:** "Quest Log" / "سجل المهام"
- **Two tabs:** "Active" (default) and "Completed"
- **Quest list:** Vertical scrollable list of quest cards

**Each quest card shows:**
- Quest name in English and Arabic (Amiri for Arabic, Press Start 2P for English)
- Quest giver NPC name and silhouette icon
- Zone where the quest takes place
- Progress bar (e.g. "2/4 steps completed")
- Brief description of current objective
- Reward preview (XP amount, dirham amount, item if applicable)

**Clicking a quest card expands it** to show:
- Full quest description/narrative
- List of all steps with checkmarks for completed ones
- Current step highlighted
- "Track" button: sets this as the tracked quest, showing a subtle objective reminder on the HUD

### 8.10 World Map

**Access:** From HUD "Map" button or main menu.

**Layout:**
- **Full-screen stylised pixel art map** showing all 8 zones as distinct locations on a hand-drawn-style map
- Each zone is represented by a small illustrated icon (oasis with palm tree, library building, market stalls, farm, tents, mountain, port with boat, palace)
- Paths/roads connect adjacent zones
- **Unlocked zones:** full colour, clickable. Hovering shows zone name (Arabic + English), level range, word count, completion percentage.
- **Locked zones:** greyed out/faded, with a small lock icon. Hovering shows unlock requirements ("Level 14+ and 800+ words needed").
- **Current zone:** glowing golden border around the icon
- **Player indicator:** small player character icon on the current zone

**Interactions:**
- Click an unlocked zone: confirmation popup "Travel to {zone name}?" with "Go" / "Cancel" buttons
- Clicking "Go": screen fades to black, zone loads, player appears at that zone's entry point
- Click a locked zone: tooltip showing unlock requirements
- "Close" button (top-right corner) returns to game world

### 8.11 Shop

**Access:** From talking to a merchant NPC in any zone.

**Background:** shop-bg2.gif (from SimpleLuke repo) or zone-appropriate background

**Layout:**
- **Title:** "Shop" / "المتجر" with merchant NPC name
- **Player dirhams:** Displayed prominently in top-right (coin icon + count)
- **Character preview:** Left 30% of screen, showing the player character at large scale (256x256) wearing currently equipped outfit. Updates in real-time when previewing items.
- **Item tabs:** Right 70% of screen, with tabs at top:
  1. "Clothing" / "الملابس"
  2. "Accessories" / "الإكسسوارات"
  3. "Boosts" / "التعزيزات"

**Clothing tab:**
- Grid of outfit cards (3 columns)
- Each card shows: outfit preview image, name in Arabic and English, price in dirhams, required level (if any)
- States: "Buy" (can afford), "Too Expensive" (greyed out, can't afford), "Owned" (purchased), "Equipped" (currently wearing, golden border)
- Clicking an owned outfit: "Equip" button
- Clicking a buyable outfit: "Buy for {price}?" confirmation popup
- **Available outfits (pre-composed spritesheets):**
  1. Simple Thobe (white) -- starter, free
  2. Simple Abaya (black) -- starter, free
  3. Traveller's Cloak (brown) -- starter, free
  4. Desert Thobe (sand) -- 200 dirhams
  5. Blue Thobe -- 200 dirhams
  6. Green Abaya -- 200 dirhams
  7. Scholar's Robe (dark blue with trim) -- 500 dirhams, level 5
  8. Merchant's Vest (colourful) -- 500 dirhams, level 8
  9. Bedouin Wrap (red/white) -- 750 dirhams, level 11
  10. Mountain Cloak (grey/brown, heavy) -- 750 dirhams, level 14
  11. Captain's Coat (navy) -- 1000 dirhams, level 17
  12. Royal Garment (gold/purple) -- 2000 dirhams, level 20

**Accessories tab:**
- Similar grid layout
- Items: prayer beads (3 colours), travel bag, messenger satchel, decorative scarf (4 colours)
- Prices: 100-500 dirhams
- Accessories show on the character preview but may not show on the walking sprite (visual limitation noted in UI)

**Boosts tab:**
- List layout (not grid)
- Each boost shows: name (Arabic + English), description, price, duration/quantity
- Available boosts:
  - XP Boost (x1.5 XP for 1 hour) -- 150 dirhams
  - XP Mega Boost (x2 XP for 30 minutes) -- 300 dirhams
  - Streak Shield (protects streak for 1 missed day) -- 200 dirhams
  - Hint Token (x3 pack, use in quizzes) -- 100 dirhams
  - Hint Token (x10 pack) -- 250 dirhams
  - Zone Unlock Pass -- 500 dirhams (unlocks any one locked zone regardless of level/word count)

### 8.12 Settings

**Access:** From main menu or in-game pause menu.

**Layout:**
- **Title:** "Settings" / "الإعدادات"
- **Sections:**

**Audio:**
- Ambient sound volume: slider (0-100), default 70
- SFX volume: slider (0-100), default 80
- Pronunciation volume: slider (0-100), default 100

**Learning:**
- Show transliteration: toggle (default ON). When OFF, transliteration is hidden in dialogue, quiz choices, and word cards.
- Show diacritics: toggle (default ON). When OFF, Arabic text is displayed without tashkeel marks. Quiz type 3 (type Arabic) accepts answers without diacritics.
- Keyboard mode: toggle between "On-screen keyboard" and "Physical keyboard". Physical keyboard mode hides the on-screen keyboard and accepts typed input directly.

**Display:**
- Text size: 3 options (Small / Medium / Large). Affects all Arabic text sizes proportionally. Default: Medium.

**Account:**
- Sign in with Google (if not signed in)
- Sync status indicator (last synced time, or "Not signed in")
- "Sync Now" button (manual sync trigger)
- "Sign Out" button

**Data:**
- "Reset Progress" button with double confirmation ("Are you sure? This cannot be undone." then "Type RESET to confirm")

### 8.13 Stats / Leaderboard

**Access:** From in-game menu or a "Stats" button in the HUD (if space allows, otherwise in the pause menu).

**Personal Stats tab:**
- Total words learned
- Total words reviewed
- Overall accuracy percentage
- Current streak (days)
- Longest streak (days)
- Total time played
- Favourite zone (most time spent)
- Quiz type accuracy breakdown (8 bars showing accuracy per quiz type)
- Words per category pie chart or bar chart
- Quranic words learned vs. common words learned

**Leaderboard tab (requires backend):**
- Title: "Top Learners" / "أفضل المتعلمين"
- Table showing: Rank, Player Name, Level, Words Learned, Streak
- Top 50 players
- Player's own rank highlighted wherever they appear
- "Weekly" / "All Time" toggle
- If not signed in: message "Sign in to see the leaderboard" with Google OAuth button

---

## 9. QUIZ SYSTEM (8 QUIZ TYPES)

See section 8.6 for full visual specifications of each quiz type.

### Quiz triggering contexts
Quizzes are triggered in 4 contexts, each with different word selection logic:

1. **NPC quiz:** Triggered by an NPC during dialogue (e.g. "Let me test what you've learned!"). Words are drawn from the words that NPC has taught. 5-10 questions. No timer.

2. **Quest quiz:** Triggered by a quest step (e.g. "Pass the market quiz to prove you can haggle"). Words are drawn from the quest's associated vocabulary. 10 questions. 15-second timer per question.

3. **Daily review quiz:** Triggered from the Daily Review screen. Words are drawn from the FSRS review queue (cards due today). Number of questions = number of due cards. No timer. Uses the FSRS rating flow (Again/Hard/Good/Easy) instead of standard correct/wrong.

4. **Free practice quiz:** Triggered from the in-game menu "Practice" option. Player can select: category, zone, difficulty, and quiz type. 10 questions. No timer.

### Quiz type selection logic
When a quiz is triggered (except free practice, where the player chooses), the quiz type for each question is selected semi-randomly:
- For any given set of 10 questions, use at least 3 different quiz types
- Weighted towards quiz types the player has lower accuracy on (adaptive difficulty)
- Quiz types 7 (root letters) and 8 (word building) only appear for words that have root letter data
- Quiz type 4 (listen and identify) only appears for words that have TTS audio generated
- Quiz type 6 (fill in the blank) only appears for words that have an example sentence or Quran reference

### Scoring
- Correct answer: +10 XP, +1 to word's "correct" count
- Wrong answer: +0 XP, +1 to word's "incorrect" count (word is added to a "needs practice" list)
- Streak bonus: every 5 consecutive correct answers in a quiz session grants +25 bonus XP
- Perfect quiz (10/10): +50 bonus XP and a "Perfect!" animation

---

## 10. PROGRESSION SYSTEM (XP, LEVELS, QUESTS)

### XP sources

| Action | XP earned |
|--------|----------|
| Correct quiz answer | 10 |
| Streak bonus (every 5 correct in a row) | 25 |
| Perfect quiz (10/10) | 50 bonus |
| Daily review card (rated Good) | 7 |
| Daily review card (rated Easy) | 10 |
| Daily review card (rated Hard) | 5 |
| Daily review card (rated Again) | 2 |
| New word learned (from NPC) | 15 |
| Quest step completed | 50 |
| Main quest completed | 200 |
| Side quest completed | 100 |
| First NPC interaction in a zone | 25 |
| Treasure chest opened | 10 |
| Bookshelf read | 5 |
| Sign read | 5 |
| Daily login (maintaining streak) | 20 |

### Level curve
Exponential curve. Each level requires more XP than the last.

| Level | Total XP required | Cumulative XP |
|-------|-------------------|--------------|
| 1 | 0 | 0 |
| 2 | 100 | 100 |
| 3 | 250 | 350 |
| 4 | 450 | 800 |
| 5 | 700 | 1,500 |
| 6 | 1,000 | 2,500 |
| 7 | 1,400 | 3,900 |
| 8 | 1,800 | 5,700 |
| 9 | 2,300 | 8,000 |
| 10 | 2,800 | 10,800 |
| 11 | 3,500 | 14,300 |
| 12 | 4,200 | 18,500 |
| 13 | 5,000 | 23,500 |
| 14 | 6,000 | 29,500 |
| 15 | 7,000 | 36,500 |
| 16 | 8,200 | 44,700 |
| 17 | 9,500 | 54,200 |
| 18 | 11,000 | 65,200 |
| 19 | 12,500 | 77,700 |
| 20 | 14,000 | 91,700 |
| 21+ | +2,000 per level | continues |

### Level-up event
When XP crosses the threshold:
1. Level-up fanfare SFX plays
2. Golden "LEVEL UP!" / "مستوى جديد!" banner animation drops from top of screen
3. Shows: new level number, what was unlocked (if any zone becomes available)
4. "Continue" button dismisses

### Dirham earning

| Action | Dirhams earned |
|--------|---------------|
| Quest step completed | 20 |
| Main quest completed | 100 |
| Side quest completed | 50 |
| Perfect quiz (10/10) | 25 |
| Treasure chest opened | 10-50 (random) |
| Daily login | 10 |
| First zone visit | 50 |

### Streak system
- Streak increments by 1 for each day the player completes at least one daily review session or one quiz
- Streak resets to 0 if a day is missed (unless a Streak Shield is active)
- Streak Shield: consumed automatically if a day is missed while the player has one in inventory. The streak is preserved and the shield is removed.
- Streak milestones: 7 days (bronze badge), 30 days (silver badge), 100 days (gold badge), 365 days (diamond badge). Badges shown on stats page.

### Quest structure

**Main quests (1 per zone, 8 total):**
- 3-6 steps each
- Each step is one of: talk to NPC, learn X new words, complete a quiz with Y% accuracy, deliver an item, interact with an object
- Completing all steps awards large XP and dirhams, and may unlock the next zone

**Side quests (2-4 per zone, ~20 total):**
- 1-3 steps each
- Usually given by non-teacher NPCs
- More varied: collect words from signs, complete a timed quiz, find a hidden treasure chest, help an NPC translate something
- Awards moderate XP and dirhams

---

## 11. SHOP SYSTEM

See section 8.11 for full visual specifications.

### Outfit system (pre-composed spritesheets)
Each outfit is a complete 512x512 spritesheet (4x4 grid of 128x128 frames) showing the player character in that outfit from all 4 directions with walk animation. The character is always faceless with the head covering selected at character creation.

This means: for each outfit, there need to be variants for each head covering type (6 head coverings x 12 outfits = 72 spritesheets total). To reduce this, the head covering can be rendered as a separate overlay sprite that always draws on top of the body sprite, composited at runtime. This is simpler than full layering because it's only 2 layers (body + head) rather than 5+.

**Implementation:** The player's walking sprite is composed of 2 Phaser sprites stacked:
1. Body sprite (outfit spritesheet, includes everything below the neck)
2. Head covering sprite (head covering spritesheet, includes head and covering)

Both sprites animate in sync (same frame, same direction). This gives 12 body outfits x 6 head coverings = 72 combinations with only 18 spritesheets (12 bodies + 6 heads).

### Skin tone
Skin tone affects the body spritesheet colour. Options:
1. Create 4 skin tone variants of each body spritesheet (4 x 12 = 48 body spritesheets)
2. OR use Phaser tint to shift the skin colour at runtime (simpler but less precise)

**Recommendation:** Use Phaser tint for MVP. It's simpler and avoids creating 48 separate files. The 4 tint values are defined in the character creation config.

---

## 12. AUDIO SYSTEM

All audio is managed through Howler.js. Three independent volume channels: ambient, SFX, pronunciation.

### Ambient sounds (one loop per zone)

| Zone | Sound description | Filename |
|------|------------------|----------|
| Oasis Village | Desert wind, distant birds, gentle water | `ambient-oasis.mp3` |
| Ancient Library | Quiet room tone, page turning, fountain | `ambient-library.mp3` |
| Desert Marketplace | Crowd chatter, merchant calls, coins | `ambient-souk.mp3` |
| Farmland | Birds, rustling crops, breeze | `ambient-farm.mp3` |
| Bedouin Camp | Strong desert wind, campfire crackle | `ambient-bedouin.mp3` |
| Mountain Village | Mountain wind, goat bells, eagle cry | `ambient-mountain.mp3` |
| Coastal Port | Waves, seagulls, dock creaking | `ambient-port.mp3` |
| Royal Palace | Fountain, garden birds, wind in trees | `ambient-palace.mp3` |

**Source:** freesound.org (Creative Commons licensed). Claude Code should search for and download appropriate clips, then loop them. Each ambient file should be 30-60 seconds long and loop seamlessly.

**Behaviour:** When entering a zone, the current ambient fades out (0.5s), the new zone's ambient fades in (0.5s). Ambient plays on loop at the user's ambient volume setting.

### UI sound effects

| Event | Sound description | Filename |
|-------|------------------|----------|
| Button click | Soft pixel "blip" | `sfx-click.mp3` |
| Correct answer | Bright chime/ding | `sfx-correct.mp3` |
| Wrong answer | Low buzz/thud | `sfx-wrong.mp3` |
| Level up | Ascending fanfare (3 notes, no melody) | `sfx-levelup.mp3` |
| Quest complete | Achievement sound (2-3 bright notes) | `sfx-quest.mp3` |
| Coin collect | Coin clink | `sfx-coin.mp3` |
| Word learned | Soft "sparkle" sound | `sfx-wordlearned.mp3` |
| Chest open | Creak + sparkle | `sfx-chest.mp3` |
| Zone transition | Whoosh/fade sound | `sfx-transition.mp3` |
| Streak milestone | Special chime | `sfx-streak.mp3` |

**Source:** freesound.org or similar. All files should be short (0.5-2 seconds), MP3 format.

### Arabic pronunciation audio
- **Letters:** 28 files from ArabEngo repo (`/Users/theshumba/ArabEngo`). Copy to `audio/letters/`.
- **Words:** 2000+ files generated via Google Cloud TTS (see data pipeline section 5). Stored in `audio/words/{wordId}.mp3`.
- **Playback:** Triggered by speaker icon buttons in dialogue, quizzes, daily review, and alphabet module.

---

## 13. BACKEND AND SYNC

### Architecture
- **Primary storage:** localStorage via redux-persist. The game works fully offline.
- **Backend:** Express.js REST API + MongoDB. Used for: user accounts, cloud save sync, leaderboard.
- **Auth:** Google OAuth only. No email/password.

### API endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/google` | Google OAuth login, returns JWT |
| GET | `/auth/me` | Get current user info |
| GET | `/save` | Get user's cloud save data |
| PUT | `/save` | Upload/update cloud save data |
| GET | `/leaderboard` | Get leaderboard (query: weekly/alltime, limit) |
| POST | `/leaderboard/update` | Update user's leaderboard entry |

### Sync logic
1. On app load: check if user is signed in (JWT in localStorage). If yes, attempt to fetch cloud save from `/save`.
2. **Conflict resolution:** Compare `lastModified` timestamps. If cloud save is newer, prompt user: "A newer save was found in the cloud. Use cloud save or keep local?" If local is newer, auto-upload to cloud.
3. **Periodic sync:** Every 5 minutes while playing (if online), auto-upload current state to `/save`.
4. **On save-worthy events:** After quest completion, level up, or shop purchase, trigger an immediate sync.
5. **Offline handling:** If a sync fails (no internet), set `sync.pendingChanges = true`. On next successful connection, upload pending changes.
6. **Visual indicator:** Small cloud icon in HUD. Green check = synced. Yellow spinner = syncing. Red X = offline/sync failed.

### MongoDB schema

**User:**
```
{
  googleId: string,
  email: string,
  displayName: string,
  createdAt: Date,
  lastLogin: Date
}
```

**Save:**
```
{
  userId: ObjectId (ref User),
  gameState: Object (entire Redux state),
  lastModified: Date,
  version: number (for migration)
}
```

**Leaderboard:**
```
{
  userId: ObjectId (ref User),
  displayName: string,
  level: number,
  wordsLearned: number,
  streak: number,
  lastUpdated: Date
}
```

---

## 14. ERROR HANDLING

Every screen and overlay must have an error boundary (React ErrorBoundary component) that catches crashes and shows a friendly fallback UI instead of a blank screen or browser error.

**Error boundary fallback UI:**
- Background: solid dark colour matching the screen's theme
- Centre message: "Something went wrong" / "حدث خطأ ما" (Noto Kufi + Press Start 2P)
- "Try Again" button: reloads the current screen/component
- "Return to Menu" button: navigates to main menu
- Error details logged to console for debugging

**Loading states:**
- Every screen that loads data (zone maps, quiz questions, shop items, leaderboard) shows a loading indicator while fetching
- Loading indicator: small animated pixel spinner (not a generic browser spinner)
- If loading takes more than 5 seconds: show "Taking longer than expected..." message
- If loading fails: show error state with retry button

**Offline detection:**
- Monitor `navigator.onLine` and `window.addEventListener('online'/'offline')`
- When going offline: show a subtle banner at top of screen "You're offline. Progress is saved locally." (auto-dismiss after 5 seconds)
- When coming back online: show "Back online!" banner, trigger sync

---

## 15. IMPLEMENTATION PHASES

Build in this order. Each phase should produce a working, testable game. If any phase has quality issues, stop and fix before proceeding.

### Phase 0: Data Pipeline (pre-build)
1. Build vocabulary extraction scripts (section 5, steps 1-4)
2. Run extraction, output `vocabulary-final.json` for user review
3. After user approval, generate TTS audio files (section 5, step 5)
4. Source and prepare ambient sounds and UI SFX files
5. Catalogue all monster-quest assets (full file tree scan)
6. Catalogue all SimpleLuke assets (GIFs, CSS patterns)

### Phase 1: Core Infrastructure Fixes
1. Fix responsive scaling (game fills browser window, nearest-neighbour pixel scaling)
2. Set up font loading (Press Start 2P, Amiri, Noto Kufi Arabic via Google Fonts)
3. Implement DOM overlay system for Arabic text in Phaser world
4. Set up Howler.js audio system with 3 volume channels
5. Add error boundaries to every existing screen
6. Fix the Redux state shape to match the spec in section 3
7. Wire up the approved `vocabulary-final.json` as the single vocabulary source

### Phase 2: Character and Sprite System
1. Edit monster-quest player spritesheet to create faceless body spritesheets (12 outfits)
2. Create 6 head covering spritesheets
3. Implement 2-layer sprite compositing in Phaser (body + head)
4. Implement Phaser tint for skin tone variants
5. Edit monster-quest NPC spritesheets to be faceless (one per NPC role, ~8-10 unique base sprites recoloured for 22-30 NPCs)
6. Create 22-30 NPC silhouette portrait PNGs (96x96)
7. Update character creation screen with new options and live preview

### Phase 3: Zone 1 -- Oasis Village (Complete Vertical Slice)
1. Hand-design the Oasis Village map in code (40x30 tiles)
2. Place all objects, NPCs, interactive objects, zone exits
3. Implement NPC dialogue system with silhouette portraits
4. Write all Oasis Village NPC dialogue trees
5. Implement word teaching flow (NPC teaches word, FSRS card created)
6. Implement interactive objects (bookshelves, signs, treasure chests, wells)
7. Set up ambient sound for Oasis Village
8. Implement all 8 quiz types with full visual spec
9. Implement the quest system (main quest + side quests for Oasis)
10. Implement XP, levelling, and dirham earning
11. Update HUD to match spec (pixel art icons, not emoji)
12. Test the complete Oasis Village experience end-to-end

### Phase 4: Remaining Zones
1. Build Zone 2: Ancient Library (map, NPCs, dialogue, quests, objects)
2. Build Zone 3: Desert Marketplace (map, NPCs, dialogue, quests, objects)
3. Implement zone transition system (walking exits + world map fast travel)
4. Build Zone 4: Farmland
5. Build Zone 5: Bedouin Camp
6. Build Zone 6: Mountain Village
7. Build Zone 7: Coastal Port
8. Build Zone 8: Royal Palace
9. Implement zone unlock logic (level + word count gating)
10. Add ambient sounds for all zones
11. Test world map navigation and progression flow

### Phase 5: Polish and Secondary Systems
1. Build the Shop screen (full spec from section 8.11)
2. Build the Alphabet Module (full spec from section 8.7)
3. Build the Daily Review screen (full spec from section 8.8)
4. Build the Quest Log screen (full spec from section 8.9)
5. Build the World Map screen (full spec from section 8.10)
6. Build the Stats/Leaderboard screen (full spec from section 8.13)
7. Update the Main Menu with new buttons
8. Update Settings screen with all options
9. Implement streak system with streak shields

### Phase 6: Backend and Sync
1. Set up Express server with MongoDB connection
2. Implement Google OAuth flow
3. Implement save/load cloud sync endpoints
4. Implement sync logic on the client (section 13)
5. Implement leaderboard endpoints and UI
6. Add sync status indicator to HUD
7. Test offline/online transitions

### Phase 7: Final Polish
1. Full playthrough testing of all 8 zones
2. Fix any Arabic rendering issues
3. Verify all audio plays correctly
4. Performance optimisation (lazy loading zones, sprite atlas packing)
5. Mobile best-effort pass (touch controls for movement, tap targets for UI)
6. Cross-browser testing (Chrome, Firefox, Safari, Edge)
7. Fix any remaining crashes or error states

---

## APPENDIX A: COLOUR PALETTE

| Name | Hex | Usage |
|------|-----|-------|
| Background Dark | #1A1A2E | Quiz backgrounds, dark overlays |
| Panel Dark | #14100A (90% opacity) | Dialogue box, HUD background |
| Gold Accent | #D4A843 | Arabic title text, selected borders, XP bar |
| Parchment | #F5E6C8 | Word cards, quest log background |
| Muted Gold | #B8A070 | Transliteration text |
| Text White | #FFFFFF | Primary Arabic text |
| Text Light Grey | #AAAAAA | English translations |
| Correct Green | #4CAF50 | Correct answer flash, XP bar fill |
| Wrong Red | #E53935 | Wrong answer flash, "Again" button |
| Hard Orange | #FF9800 | "Hard" button |
| Good Green | #66BB6A | "Good" button |
| Easy Blue | #42A5F5 | "Easy" button |
| Skin Light | #F5D0A9 | Skin tone option 1 |
| Skin Medium | #D4A76A | Skin tone option 2 |
| Skin Tan | #A67B4B | Skin tone option 3 |
| Skin Dark | #6B4226 | Skin tone option 4 |

## APPENDIX B: FILE STRUCTURE (TARGET)

```
gogo-arabic/
├── public/
│   └── assets/
│       ├── audio/
│       │   ├── ambient/          (8 zone ambient loops)
│       │   ├── sfx/              (10+ UI sound effects)
│       │   ├── letters/          (28 letter audio from ArabEngo)
│       │   └── words/            (2000+ TTS word audio files)
│       ├── sprites/
│       │   ├── player/
│       │   │   ├── bodies/       (12 outfit body spritesheets)
│       │   │   └── heads/        (6 head covering spritesheets)
│       │   ├── npcs/             (8-10 base NPC spritesheets)
│       │   └── objects/          (interactive object sprites)
│       ├── tilesets/             (from monster-quest)
│       ├── backgrounds/          (GIFs from SimpleLuke, battle bgs from monster-quest)
│       ├── portraits/            (22-30 NPC silhouette PNGs)
│       ├── ui/                   (pixel art icons for HUD, buttons)
│       └── maps/                 (JSON tile map definitions, 8 zones)
├── src/
│   ├── components/               (React UI components)
│   │   ├── MainMenu/
│   │   ├── CharacterCreation/
│   │   ├── HUD/
│   │   ├── Dialogue/
│   │   ├── Quiz/
│   │   │   ├── ArabicToEnglish.jsx
│   │   │   ├── EnglishToArabic.jsx
│   │   │   ├── TypeArabic.jsx
│   │   │   ├── ListenIdentify.jsx
│   │   │   ├── MatchPairs.jsx
│   │   │   ├── FillBlank.jsx
│   │   │   ├── RootLetters.jsx
│   │   │   └── WordBuilding.jsx
│   │   ├── Alphabet/
│   │   ├── DailyReview/
│   │   ├── QuestLog/
│   │   ├── WorldMap/
│   │   ├── Shop/
│   │   ├── Settings/
│   │   ├── Stats/
│   │   ├── ArabicKeyboard/
│   │   └── ErrorBoundary/
│   ├── game/                     (Phaser game code)
│   │   ├── scenes/
│   │   │   ├── BootScene.js
│   │   │   ├── WorldScene.js     (main game world)
│   │   │   └── zones/            (zone-specific map configs)
│   │   ├── entities/
│   │   │   ├── Player.js
│   │   │   ├── NPC.js
│   │   │   └── InteractiveObject.js
│   │   ├── systems/
│   │   │   ├── DOMOverlay.js     (Arabic text over Phaser)
│   │   │   ├── AudioManager.js
│   │   │   └── ZoneTransition.js
│   │   └── PhaserGame.js         (Phaser init + config)
│   ├── store/                    (Redux)
│   │   ├── store.js
│   │   ├── slices/
│   │   │   ├── playerSlice.js
│   │   │   ├── vocabularySlice.js
│   │   │   ├── questSlice.js
│   │   │   ├── npcSlice.js
│   │   │   ├── alphabetSlice.js
│   │   │   ├── settingsSlice.js
│   │   │   ├── uiSlice.js
│   │   │   └── syncSlice.js
│   │   └── persist.js
│   ├── services/
│   │   ├── fsrs.js               (spaced repetition)
│   │   ├── api.js                (backend API calls)
│   │   ├── auth.js               (Google OAuth)
│   │   └── sync.js               (sync logic)
│   ├── data/
│   │   ├── vocabulary-final.json
│   │   ├── alphabet.json
│   │   ├── npcs.json
│   │   ├── quests.json
│   │   ├── items.json
│   │   └── zones/                (per-zone NPC dialogue, quest data)
│   ├── utils/
│   │   ├── eventBus.js
│   │   ├── arabicUtils.js        (RTL helpers, diacritic stripping)
│   │   └── xpCalculator.js
│   ├── App.jsx
│   └── main.jsx
├── server/
│   ├── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── save.js
│   │   └── leaderboard.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Save.js
│   │   └── Leaderboard.js
│   └── middleware/
│       └── auth.js               (JWT verification)
├── scripts/
│   ├── extract-quran-vocab.js
│   ├── extract-roots.js
│   ├── merge-vocabulary.js
│   ├── generate-tts-audio.js
│   └── catalogue-assets.js
├── package.json
├── vite.config.js
└── README.md
```

---

**END OF PRD**

This document contains every decision made during the brainstorming process. Claude Code should implement exactly what is specified here, consulting specific sections for visual specs, data flows, and asset sources. When in doubt, refer back to the three non-negotiable design rules in section 2.
