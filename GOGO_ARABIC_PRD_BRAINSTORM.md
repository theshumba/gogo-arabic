# GOGO ARABIC — PRD Brainstorming Document

## Instructions for Claude

I'm building an Arabic learning RPG called "Gogo Arabic." I need your help brainstorming and refining a detailed PRD (Product Requirements Document) that I will then hand to Claude Code for implementation.

**Your role:** Ask me clarifying questions, challenge my ideas, suggest improvements, and help me think through every detail. When we're done brainstorming, produce a final PRD document that is so specific and detailed that a developer (Claude Code) can implement it without guessing anything.

**Important context:**
- I have multiple GitHub repos already cloned locally with code, assets, and data I want to assemble from
- Some things WILL be built from scratch, but wherever possible I want to reuse existing code/assets/patterns from the repos I've collected
- I've already had a first attempt built by Claude Code. The game world, HUD, and quiz system work but the quality was poor. The main menu with animated koi fish is beautiful. Everything else needs major improvement.
- I get frustrated when Claude Code builds low-quality stuff, so the PRD needs to be extremely specific so there's no room for interpretation

---

## PART 1: What Is Gogo Arabic?

**One-liner:** A web-based pixel-art RPG where you learn Arabic by exploring a world, talking to NPCs, and doing quizzes — like Pokemon meets Duolingo, but for Arabic.

**Platform:** Web browser (React + Phaser 3 game engine)

**Art style:** Retro pixel art (16-bit style), inspired by two specific repos:
- **devloos/monster-quest** — A Pokemon-style RPG with beautiful pixel art (characters, tilesets, world objects, battle backgrounds)
- **SimpleLuke/japanese-learning-RPG** — A Japanese learning quiz game with animated GIF backgrounds, pixel buttons, and a warm cozy aesthetic

### Non-Negotiable Design Rules
1. **ALL characters are faceless** — No eyes, no mouth, no facial features on any human or animal character. This is for Islamic art reasons. The koi fish on the current main menu are a perfect example — they swim but have no faces. This applies to player sprites, NPC sprites, and any living creature.
2. **NO music** — Zero. Only ambient environmental sounds (desert wind, marketplace chatter, water flowing, bird sounds) and UI sound effects (button clicks, correct answer chimes, level-up sounds).
3. **Arabic is prominent** — Arabic text should be large, beautiful, and correctly rendered (right-to-left, with diacritics/tashkeel marks). It should never feel like an afterthought.

---

## PART 2: What I Already Have (Repos & Assets)

### Game/Art Reference Repos (cloned locally)

**1. devloos/monster-quest** (`/Users/theshumba/monster-quest`)
A full Pokemon-style RPG built in Pygame. I'm taking:
- ALL pixel art assets: character spritesheets (512x512, 4x4 grid of 128x128 frames), world tilesets (64x64 tiles), object sprites (palms, houses, rocks, ruins, trees), battle backgrounds, UI icons
- Map design patterns (Tiled .tmx format with layers: water, background, shadow, main, top)
- The game's 1280x720 resolution and 64px tile size
- NPC/dialogue system patterns
- **BUT**: All character sprites have visible faces that need to be removed/covered

**2. SimpleLuke/japanese-learning-RPG** (`/Users/theshumba/japanese-learning-RPG`)
A Japanese learning quiz app built in React/Node/MongoDB. I'm taking:
- Animated GIF backgrounds (pixel-fishes.gif, pixel-sepia.gif, char-bg.gif, shop-bg2.gif, etc.)
- Visual style: "Press Start 2P" pixel font, warm color palette, 3D pixel button styling
- Scene-based routing pattern (Redux state drives which screen shows)
- Character outfit layering system (body + hair + top + bottoms + shoes as separate sprite layers)
- Shop UI pattern
- Quiz flow pattern (question → 4 choices → feedback → next → score summary)
- Backend structure (Express + MongoDB + JWT auth)

### Arabic Language Data Repos (cloned locally)

**3. edenmind/OpenArabic** (`/Users/theshumba/OpenArabic`)
- 5500+ files with Arabic words, sentences, and translations
- Organized by topic/lesson

**4. risan/quran-json** (`/Users/theshumba/quran-json`)
- Complete Quran text in JSON format

**5. SMenigat/thousand-most-common-words** (`/Users/theshumba/thousand-most-common-words`)
- 1000 most frequently used Arabic words

**6. gitzain/quran101** (`/Users/theshumba/quran101`)
- 101 Quranic verbs with root letter analysis

**7. michaelsboost/ArabEngo** (`/Users/theshumba/ArabEngo`)
- 28 Arabic alphabet audio files (one per letter)

**8. ARBML/masader** (`/Users/theshumba/masader`)
- Catalogue of 500+ Arabic NLP datasets (meta-resource for finding more data)

**9. ARBML/Calliar** (`/Users/theshumba/Calliar`)
- 2500 annotated Arabic calligraphic styles

### Tech Reference Repos (cloned locally)

**10. open-spaced-repetition/fsrs.js** (`/Users/theshumba/fsrs.js`)
- The spaced repetition algorithm source code (we use the ts-fsrs npm package)

**11. selmetwa/arabic-virtual-keyboard** (`/Users/theshumba/arabic-virtual-keyboard`)
- Arabic on-screen keyboard reference (we built our own custom version)

---

## PART 3: Current Tech Stack

```
React 19 + Redux Toolkit (UI overlays, state management)
Phaser 3 (game world — tile maps, sprites, camera, physics)
Vite (build tool)
ts-fsrs (spaced repetition algorithm)
Howler.js (audio)
redux-persist (localStorage saving)
Express + MongoDB (backend — scaffolded but not connected yet)
```

**Architecture pattern:**
- Phaser renders the game world (walking, NPCs, environment)
- React renders ALL UI (menus, quizzes, dialogue boxes, HUD, keyboard, shop)
- They communicate via an EventBus (Phaser.Events.EventEmitter)
- Redux store is shared between both

---

## PART 4: What Currently Exists & What's Broken

### What Works
- Main menu with animated koi fish GIF background (BEAUTIFUL — keep this)
- Character creation screen with pixel art autumn background
- Game world renders: sand tiles, grass, water with shimmer, palm trees, houses, rocks, ruins
- Player walks with WASD/arrows, camera follows
- 3 NPCs visible with name labels and "SPACE" interaction hints
- HUD shows level, XP bar, streak, dirhams, word count
- Alphabet module shows 13 group cards
- Quiz system functions (3 types: Arabic→English, English→Arabic, type Arabic)
- Spaced repetition (FSRS) creates and schedules cards
- Redux persist saves state to localStorage

### What's Broken / Bad
1. **Not full-screen** — Dark bars around the game. Doesn't fill the browser window.
2. **Crashes randomly** — Various interaction errors
3. **Arabic text missing** — Some screens don't show Arabic where they should
4. **Alphabet module bugs** — "Ta Emphatic Group" wraps to two lines looking like two groups. Group cards don't show actual Arabic letters, only English names.
5. **Characters have faces** — All sprites from monster-quest have visible eyes/faces. Need faceless versions.
6. **NPC portraits are emoji** — Dialogue box shows 📖🏪🎓 instead of actual character art
7. **Phaser can't render Arabic** — NPC labels in the game world use pixel font that doesn't support Arabic glyphs
8. **Vocabulary fragmented** — 7 separate JSON files but quiz only loads from one (~500 of ~1500 words)
9. **No audio at all** — Audio service exists but nothing plays
10. **No server connection** — Backend scaffolded but client doesn't use it
11. **AI-generated vocabulary** — The ~1500 words haven't been verified against real Arabic data
12. **Procedural map looks repetitive** — The oasis world is generated by code, not hand-designed

---

## PART 5: Data Already Created

### alphabet.json (28 letters in 13 groups)
Each letter has: Arabic character, name, transliteration, 4 positional forms (isolated/initial/medial/final), 3 vowel combinations (fatha/kasra/damma), audio reference.

### vocabulary.json + 6 category files (~1,500 total words)
Categories: greetings, numbers, colors, family, food, animals, body parts, clothing, nature, trade, directions, time, verbs, adjectives, phrases.
Each word has: Arabic (with diacritics), English, transliteration, category, difficulty (1-5), example sentence, NPC source.

### npcs.json (3 NPCs)
Scholar Yusuf (teacher), Merchant Fatima (shopkeeper), Student Khalid (practice partner).
Each has dialogue trees with Arabic/English lines, word-teaching triggers, branching choices.

### quests.json (5 quests)
Learn First Letters, Greetings of the Oasis, Market Talk, Quiz Challenge, Words of the Oasis.

### items.json (~30 items)
Clothing (thobes, kufis, abayas, hijabs) and boosts. Each has Arabic name, price, unlock level.

---

## PART 6: The Screens / User Flow

Here's every screen in the game and what it should do. **This is where I need your help making decisions and refining details.**

### 1. Main Menu
**Current:** Animated koi fish GIF, "Gogo Arabic" title, "يلا عربي" subtitle, buttons for New Game / Continue / Daily Reviews / Alphabet / Settings
**Status:** Works well. I love this screen.

### 2. Character Creation
**Current:** Pixel art autumn background, name input, skin tone (4 options), body type (3 options)
**Needs:** Faceless character preview showing your choices. Possibly more customization options (clothing?).

### 3. Game World (Phaser)
**Current:** 40x30 tile oasis map with sand/grass/water, 25+ objects, 3 NPCs, player movement
**Needs:** Full-screen scaling, better map design, faceless sprites, Arabic-capable text, more NPCs?, zone transitions?

### 4. HUD (in-game)
**Current:** Top bar with level badge, XP bar, streak, dirhams, word count, Quests/Menu buttons
**Needs:** Possibly redesign. Maybe too cramped.

### 5. NPC Dialogue
**Current:** Dark dialogue box at bottom, emoji portrait, Arabic + English + transliteration text, branching choices, word teaching
**Needs:** Real NPC portrait (not emoji), better visual design, smoother flow

### 6. Quiz Overlay
**Current:** 3 types work (Arabic→English multiple choice, English→Arabic multiple choice, type Arabic with on-screen keyboard)
**Needs:** Maybe more quiz types? Better visual feedback? Timer?

### 7. Alphabet Module
**Current:** 13 group cards, 5-step lessons (intro → forms → vowels → recognition quiz → writing quiz)
**Needs:** Arabic letters on cards, fix wrapping bug, possibly better lesson flow

### 8. Daily Review
**Current:** FSRS-based card review with 4 rating buttons (Again/Hard/Good/Easy)
**Needs:** Better UI, streak motivation, summary stats

### 9. Quest Log
**Current:** List of quests with status badges and progress bars
**Needs:** More engaging design, quest narrative

### 10. Shop
**Current:** GIF background, 2 tabs (clothing/boosts), buy/equip buttons
**Needs:** Character preview with purchased items, better item descriptions

### 11. Settings
**Current:** Volume sliders, toggle switches for transliteration/diacritics/keyboard mode
**Needs:** Possibly more settings

---

## PART 7: Questions I Need Help Thinking Through

These are the big open questions. Please help me work through each one:

### Characters & Art
- How do I make faceless sprites? Edit existing monster-quest PNGs? Commission new ones? Use AI image tools? Cover faces with hoods/veils/shadow?
- Should I use the SimpleLuke layered outfit system so players can customize appearance?
- Should NPCs have unique hand-drawn portrait art for dialogue?

### Maps & World
- Should I use Tiled map editor (.tmx files) instead of procedural code generation?
- How many maps should the MVP have? Just the oasis? Multiple connected areas?
- Should the map have interactive objects beyond NPCs (bookshelves, signs, treasure chests)?

### Arabic & Learning
- Should I replace the AI-generated vocabulary with verified data from the cloned Arabic repos?
- How should Arabic text work inside the Phaser game world (NPC names, signs, etc.)?
- Should the game teach Modern Standard Arabic (MSA) or include dialect options?
- What quiz types should exist beyond the current 3?
- How should difficulty progress? By vocabulary difficulty rating? By level?
- Should there be grammar lessons or only vocabulary?

### Audio
- What ambient sounds should each area have?
- Where do I source native Arabic pronunciation audio? (ArabEngo has 28 letter sounds)
- What UI sound effects are needed? (button click, correct, wrong, level up, quest complete, coins)

### Progression
- What happens when you "complete" the oasis region?
- How does the shop interact with the character visually?
- Should there be a leaderboard or social features?
- What's the target: 100 words learned? 500? 1000? 2000?

### Technical
- Should the backend (Express/MongoDB/auth) be part of the MVP or stay localStorage-only?
- Should I add proper error handling and loading states?
- How should the game handle offline/online states?

---

## PART 8: What I Want From This Brainstorm

After we discuss all of the above, I want you to produce a **Final PRD** that includes:

1. **Every screen** described in exact detail (layout, colors, fonts, what each element does)
2. **Every interaction** mapped out (what happens when you click X, what triggers Y)
3. **Every data flow** specified (this quiz loads words from here, scores update this state, etc.)
4. **Asset requirements** with exact sources (use this sprite from monster-quest, this GIF from SimpleLuke, build this from scratch)
5. **Implementation order** — what to build first, second, third
6. **"Use from repo" vs "Build from scratch"** labels on every feature
7. **Specific file references** — "copy /Users/theshumba/monster-quest/graphics/characters/player.png" level specificity

The PRD should be detailed enough that I can hand it to Claude Code and say "build exactly this" with zero ambiguity.

---

Let's start brainstorming. Ask me your first round of questions.
