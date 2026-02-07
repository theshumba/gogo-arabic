# GOGO ARABIC — Complete Technical Brief

## What This Document Is

This is a comprehensive technical brief for "Gogo Arabic", an Arabic language learning RPG. It contains everything needed to understand, debug, and improve the project: the vision, what exists, what's broken, what assets are available, and what decisions have been made. Use this document as the foundation for all development work.

---

## 1. PROJECT VISION

**Gogo Arabic** is a web-based Arabic learning RPG where players explore a pixel-art world, interact with NPCs who teach Arabic vocabulary, complete quizzes, and progress through a spaced repetition system. Think Pokemon meets Duolingo, but for Arabic, with Islamic art principles.

### Core Principles
- **Faceless characters** — No eyes, no facial features on any character (Islamic art consideration). The koi fish on the main menu are a perfect example — they have no eyes. ALL sprites must follow this rule.
- **No music** — Only ambient environmental sounds (desert wind, bazaar chatter, nature sounds, UI click/chime SFX)
- **Pixel art aesthetic** — Inspired by two reference repos (see Section 4)
- **Arabic-first** — Arabic text should be prominent, beautiful, and correctly rendered (RTL, proper diacritics)
- **Spaced repetition** — FSRS algorithm for long-term vocabulary retention
- **Web-first** — Built with React + Phaser 3, runs in browser

### Two World Types (Future)
1. **Real World** — Historical Islamic cities (Baghdad, Cordoba, Timbuktu, Damascus, Cairo)
2. **Fantasy World** — Fantasy Arabic-themed regions

### Current Scope (MVP)
- One region: "Oasis of Letters" — a desert oasis town
- 3 NPCs: Scholar Yusuf, Merchant Fatima, Student Khalid
- 28-letter alphabet learning module
- ~1500 vocabulary words across categories
- 5 quests
- Shop with clothing/boosts
- Daily spaced repetition review

---

## 2. TECH STACK

```
CLIENT:
  React 19.2.4 + Redux Toolkit 2.11.2 (UI overlays, state management)
  Phaser 3.90.0 (game world rendering — tile maps, sprites, camera, physics)
  Vite 7.3.1 (build tool)
  ts-fsrs 5.2.3 (spaced repetition algorithm)
  Howler.js 2.2.4 (audio — ambient, SFX, word pronunciation)
  redux-persist 6.0.0 (localStorage persistence)

SERVER:
  Express 5.2.1 + Mongoose 9.1.6 (API + MongoDB)
  bcryptjs 3.0.3 + jsonwebtoken 9.0.3 (auth)
  helmet 8.1.0 + cors 2.8.6 (security)

ARCHITECTURE:
  React Layer (UI overlays: menus, quiz, keyboard, HUD, shop, dialogue)
         ↕ EventBus (Phaser.Events.EventEmitter)
  Phaser 3 Engine (tile maps, character movement, NPCs, camera)
         ↕
  Redux Store (shared state, persisted to localStorage)
         ↕
  Express + MongoDB (cloud persistence, auth — scaffolded but not wired)
```

---

## 3. PROJECT FILE STRUCTURE

```
/Users/theshumba/gogo-arabic/
├── vite.config.js                    — Vite config (root: 'client', react plugin)
├── package.json                      — All dependencies (client + server)
│
├── client/
│   ├── index.html                    — Entry HTML (Google Fonts: Press Start 2P, Noto Naskh Arabic)
│   ├── public/
│   │   ├── assets/
│   │   │   ├── audio/                — (empty dirs: ambient/, letters/, sfx/, words/)
│   │   │   ├── backgrounds/          — forest.png, ice.png, sand.png + more
│   │   │   ├── fonts/                — dogicapixel.otf, dogicapixelbold.otf, PixeloidSans.ttf
│   │   │   ├── maps/                 — Tiled .tmx/.tsx files from monster-quest
│   │   │   ├── objects/              — 35+ world decorations (palms, houses, rocks, ruins, etc.)
│   │   │   ├── sprites/              — Character spritesheets (512x512, 4x4 grid = 128x128/frame)
│   │   │   │   ├── player.png        — Main player
│   │   │   │   ├── young_guy.png     — Scholar NPC
│   │   │   │   ├── hat_girl.png      — Merchant NPC
│   │   │   │   ├── blond.png         — Student NPC
│   │   │   │   └── (+ more from monster-quest)
│   │   │   ├── tilesets/             — world.png (640x1344), coast.png, indoor.png, water/
│   │   │   └── ui/                   — 19 UI icons (attack, defense, health, arrows, etc.)
│   │   └── img/                      — GIF backgrounds from SimpleLuke repo
│   │       ├── pixel-fishes.gif      — Main menu background (koi fish)
│   │       ├── pixel-sepia.gif       — Settings background
│   │       ├── char-bg.gif           — Character creation background
│   │       ├── shop-bg2.gif          — Shop background
│   │       └── (+ more GIFs)
│   │
│   └── src/
│       ├── main.jsx                  — React entry (Provider + PersistGate)
│       ├── App.jsx                   — Screen router (menu/game/alphabet/review/settings/char-creation)
│       │
│       ├── styles/
│       │   └── theme.js              — Shared design constants (COLORS, FONTS, pixelBtn variants, pixelPanel)
│       │
│       ├── game/                     — Phaser 3 game engine
│       │   ├── config.js             — 1280x720, Arcade physics, pixelArt: true
│       │   ├── EventBus.js           — Phaser ↔ React event bridge
│       │   ├── PhaserGame.jsx        — React wrapper (forwardRef)
│       │   ├── scenes/
│       │   │   ├── BootScene.js      — Asset preloader with loading bar
│       │   │   └── OasisScene.js     — Main world (40x30 tiles, procedural ground, 25+ objects, 3 NPCs)
│       │   └── sprites/
│       │       ├── Player.js         — 4-dir movement, WASD+arrows, freeze/unfreeze
│       │       └── NPC.js            — Idle anim, interaction hint, name label
│       │
│       ├── components/               — React UI overlays
│       │   ├── Menu/
│       │   │   ├── MainMenu.jsx      — Title screen with GIF bg, buttons
│       │   │   └── SettingsMenu.jsx  — Volume/toggle settings
│       │   ├── HUD/
│       │   │   └── HUD.jsx           — Top bar (level, XP, streak, dirhams, buttons)
│       │   ├── Quiz/
│       │   │   ├── QuizOverlay.jsx   — Quiz session manager
│       │   │   ├── ArabicToEnglish.jsx
│       │   │   ├── EnglishToArabic.jsx
│       │   │   └── EnglishToTypeArabic.jsx
│       │   ├── NPC/
│       │   │   └── DialogueOverlay.jsx — NPC dialogue with branching trees
│       │   ├── Keyboard/
│       │   │   └── ArabicKeyboard.jsx  — 30-key Arabic keyboard
│       │   ├── Alphabet/
│       │   │   └── AlphabetModule.jsx  — 28-letter learning (13 groups, 5-step lessons)
│       │   ├── Review/
│       │   │   └── ReviewSession.jsx   — FSRS daily review
│       │   ├── Quest/
│       │   │   └── QuestLog.jsx        — Quest tracking overlay
│       │   ├── Shop/
│       │   │   └── ShopOverlay.jsx     — Item shop (clothing + boosts)
│       │   └── Character/
│       │       └── CharacterCreation.jsx — Name, skin tone, body type
│       │
│       ├── hooks/
│       │   └── useQuiz.js            — Quiz logic (distractor generation, FSRS card management)
│       │
│       ├── services/
│       │   ├── fsrs.js               — ts-fsrs wrapper (createCard, reviewCard, getDueCards)
│       │   ├── api.js                — Backend API calls (scaffolded)
│       │   └── audio.js              — Howler.js manager (ambient, SFX, words)
│       │
│       ├── utils/
│       │   └── xpCalculator.js       — XP/Dirham reward constants + level curve
│       │
│       ├── redux/
│       │   ├── store.js              — configureStore + persistor
│       │   └── slices/
│       │       ├── playerSlice.js    — Level, XP, dirhams, streak, character, inventory
│       │       ├── sceneSlice.js     — Current scene + overlay state
│       │       ├── quizSlice.js      — Quiz session state
│       │       ├── reviewSlice.js    — FSRS card storage
│       │       ├── questSlice.js     — Quest progress tracking
│       │       ├── shopSlice.js      — Shop items
│       │       └── settingsSlice.js  — Audio volumes, display toggles
│       │
│       └── data/                     — Static game data
│           ├── alphabet.json         — 28 letters, 13 groups, 4 forms each, vowel combos
│           ├── vocabulary.json       — ~500 words (main file)
│           ├── vocabulary_greetings.json          — ~100 greeting words
│           ├── vocabulary_numbers_colors_family.json — ~210 words
│           ├── vocabulary_food_animals_body.json   — ~230 words
│           ├── vocabulary_clothing_nature_trade.json — ~230 words
│           ├── vocabulary_directions_time_verbs.json — ~220 words
│           ├── vocabulary_adjectives_phrases.json  — ~240 words
│           ├── npcs.json             — 3 NPCs with dialogue trees
│           ├── quests.json           — 5 quests
│           └── items.json            — ~30 shop items
│
└── server/
    └── src/
        ├── server.js                 — MongoDB connect + Express listen
        ├── app.js                    — Middleware + route mounting
        ├── models/
        │   ├── User.js               — User schema (bcrypt, character, stats)
        │   ├── VocabCard.js          — FSRS card per user per word
        │   └── Quest.js              — Quest progress per user
        ├── routes/                   — 6 route files (auth, user, review, quest, shop, game)
        ├── controllers/              — 6 controller files
        └── middleware/
            └── auth.js               — JWT verification
```

---

## 4. REFERENCE REPOS (Both cloned locally)

### SimpleLuke/japanese-learning-RPG (`/Users/theshumba/japanese-learning-RPG`)
**What to take from it:**
- GIF animated backgrounds for menu screens (pixel-fishes.gif, pixel-sepia.gif, etc.)
- "Press Start 2P" pixel font usage
- Color palette: Cyan (#06c1de), Beige (#f5f3da), Brown (#391D23), Burgundy (#800200)
- 3D pixel button style (inset shadows, pressed states)
- Scene-based routing pattern (Redux-driven screen switching)
- Character outfit layering system (body + hair + top + bottoms + shoes)
- Shop UI pattern (preview + buy)
- Quiz flow: question → 4 choices → feedback → score → results

### devloos/monster-quest (`/Users/theshumba/monster-quest`)
**What to take from it:**
- ALL pixel art assets (characters, tilesets, objects, backgrounds, UI icons)
- 1280x720 resolution with 64px tiles
- Character spritesheets: 512x512 PNG, 4 columns x 4 rows = 128x128 per frame
  - Row 0: Walk down (frames 0-3)
  - Row 1: Walk left (frames 4-7)
  - Row 2: Walk right (frames 8-11)
  - Row 3: Walk up (frames 12-15)
- Tiled map format (.tmx) with multiple layers (water, bg, shadow, main, top)
- Layer depth ordering (water=0, bg=1, shadow=2, main=3, top=4)
- NPC/Trainer dialogue system with directional facing
- Battle overlay pattern (but we use quiz instead of battle)
- World transition triggers between maps

---

## 5. OTHER REFERENCE REPOS (All cloned locally)

### Arabic Language Data
| Repo | Path | Contents |
|------|------|----------|
| edenmind/OpenArabic | `/Users/theshumba/OpenArabic` | 2000+ words, sentences, translations, 5500+ files |
| risan/quran-json | `/Users/theshumba/quran-json` | Full Quran in JSON format |
| SMenigat/thousand-most-common-words | `/Users/theshumba/thousand-most-common-words` | 1000 most common Arabic words |
| gitzain/quran101 | `/Users/theshumba/quran101` | 101 Quranic verbs with root letters |
| michaelsboost/ArabEngo | `/Users/theshumba/ArabEngo` | 28 Arabic alphabet audio files |
| ARBML/masader | `/Users/theshumba/masader` | Catalogue of 500+ Arabic NLP datasets |
| ARBML/Calliar | `/Users/theshumba/Calliar` | 2500 annotated calligraphic styles |

### Tech Reference
| Repo | Path | Contents |
|------|------|----------|
| open-spaced-repetition/fsrs.js | `/Users/theshumba/fsrs.js` | Spaced repetition algorithm source |
| selmetwa/arabic-virtual-keyboard | `/Users/theshumba/arabic-virtual-keyboard` | Arabic keyboard reference |

---

## 6. KNOWN ISSUES & BUGS

### Critical
1. **Not truly full-screen** — The game canvas is 1280x720 fixed size, centered with margin. On larger monitors there are dark bars. The app wrapper is `100vw x 100vh` but the Phaser canvas doesn't scale to fill it.
2. **Crashes/errors** — The app has crashed on various interactions (exact repro steps unclear — need investigation)
3. **Arabic text missing in places** — Some components may not render Arabic text correctly or at all

### Alphabet Module
4. **"Ta Emphatic Group" shows as two lines** — The group name wraps awkwardly in the card, appearing as if it's two separate groups
5. **Arabic letters not displayed on group cards** — The group cards only show "GROUP: [NAME]" in English, missing the actual Arabic letters that should be prominently displayed

### Visual
6. **Character sprites have faces** — The monster-quest sprites have visible eyes and faces. These need to be edited/replaced to be faceless per Islamic art principles. The koi fish on the main menu are correctly faceless.
7. **NPC portraits are emoji** — DialogueOverlay.jsx uses emoji (📖🏪🎓) instead of actual pixel art NPC portraits
8. **No Arabic font in Phaser** — NPC name labels and hints in the Phaser game world use "Press Start 2P" which doesn't support Arabic characters

### Functionality
9. **Vocabulary files fragmented** — There are 7 separate vocabulary JSON files but `useQuiz.js` and `QuizOverlay.jsx` only import `vocabulary.json` (the main ~500 word file), ignoring the other ~1000 words
10. **No audio implemented** — `audio.js` service exists but nothing actually plays audio anywhere
11. **Server not connected** — Backend is scaffolded but the client doesn't connect to it. Everything runs on localStorage only.
12. **No save/load flow** — No way to explicitly save progress or load from server

### Data
13. **Vocabulary quality unknown** — The ~1500 words were AI-generated and haven't been verified by a native Arabic speaker
14. **NPC dialogue is minimal** — Only 3 NPCs with basic dialogue trees
15. **Quest system is basic** — 5 quests that auto-track, no branching or narrative depth

---

## 7. DESIGN SYSTEM (Current)

### Colors (from `styles/theme.js`)
```
Beige:     #f5f3da    (panel backgrounds)
Brown:     #391D23    (dark text, borders)
Dark:      #2b292c    (Phaser bg, dark panels)
White:     #f4fefa    (light text)
Gray:      #3a373b    (secondary dark)
Gold:      #bfa100    (scores, currency)
XP Gold:   #e2b659    (XP bar, NPC names, accents)
Cyan:      #06c1de    (primary buttons)
Red:       #f03131    (errors, wrong answers)
Green:     #2ecc71    (correct, completed)
Overlay:   rgba(0,0,0,0.85)
```

### Fonts
```
Pixel:    "Press Start 2P" (all UI text)
Arabic:   "Noto Naskh Arabic" (all Arabic text)
Pixeloid: "PixeloidSans" (alternative pixel font)
```

### Button Styles
- **pixelBtn** — Cyan bg, dark text, inset shadow beveling, 4px bottom shadow
- **pixelBtnGold** — Gold bg, brown text, same beveling
- **pixelBtnDark** — Gray bg, white text, same beveling
- **All buttons** — No border-radius (sharp pixel corners), `image-rendering: pixelated`

### Panel Style
- **pixelPanel** — Beige bg, 4px solid dark border, pixel font, sharp corners

---

## 8. GAME DATA SCHEMAS

### Alphabet Letter (alphabet.json)
```json
{
  "id": "ba",
  "letter": "ب",
  "name": "Ba",
  "transliteration": "b",
  "group": "alif",
  "groupName": "Alif Group",
  "forms": {
    "isolated": "ب",
    "initial": "بـ",
    "medial": "ـبـ",
    "final": "ـب"
  },
  "audioRef": "ba",
  "vowelCombinations": [
    { "vowel": "fatha", "arabic": "بَ", "sound": "ba" },
    { "vowel": "kasra", "arabic": "بِ", "sound": "bi" },
    { "vowel": "damma", "arabic": "بُ", "sound": "bu" }
  ]
}
```

### Vocabulary Word (vocabulary.json)
```json
{
  "id": "greet_hello",
  "arabic": "مَرْحَبًا",
  "english": "Hello",
  "transliteration": "marhaban",
  "category": "greetings",
  "difficulty": 1,
  "audioRef": "marhaban",
  "npcSource": "scholar",
  "exampleSentence": {
    "arabic": "مَرْحَبًا يا صَديقي",
    "english": "Hello, my friend",
    "transliteration": "marhaban ya sadiqi"
  }
}
```

### NPC (npcs.json)
```json
{
  "id": "scholar",
  "name": "Scholar Yusuf",
  "nameArabic": "العالم يوسف",
  "sprite": "npc-scholar",
  "role": "teacher",
  "greeting": "Welcome, seeker of knowledge!",
  "dialogueTrees": [
    {
      "id": "intro",
      "trigger": "first_meeting",
      "lines": [
        {
          "speaker": "npc",
          "arabic": "السلام عليكم",
          "english": "Peace be upon you",
          "transliteration": "as-salamu alaykum",
          "teachWord": "greet_peace"
        }
      ]
    }
  ]
}
```

### Quest (quests.json)
```json
{
  "id": "first_letters",
  "title": "Learn Your First Letters",
  "titleArabic": "تعلم حروفك الأولى",
  "description": "Complete alphabet groups 1-3",
  "target": 3,
  "trackEvent": "alphabet_group_complete",
  "autoStart": true,
  "prerequisites": [],
  "reward": { "xp": 200, "dirhams": 50 },
  "npcGiver": "scholar"
}
```

### Shop Item (items.json)
```json
{
  "id": "thobe_white",
  "name": "White Thobe",
  "nameArabic": "ثوب أبيض",
  "type": "clothing",
  "slot": "outfit",
  "price": 200,
  "description": "A traditional white thobe",
  "sprite": "thobe-white",
  "unlockLevel": 1
}
```

---

## 9. WHAT WORKS (As of Feb 7, 2026)

1. **Main Menu** — Beautiful animated koi fish GIF background, pixel-styled buttons, "Gogo Arabic" + "يلا عربي" title. The fish are correctly faceless.
2. **Character Creation** — Pixel art autumn background, name input, skin tone and body type selection, "Begin Your Journey" button
3. **Game World** — Sand tile oasis map renders with grass, water (shimmering edges), palm trees, houses, rocks, ruins. Player walks with WASD/arrows. Camera follows.
4. **NPCs** — 3 NPCs visible in world with name labels and "SPACE" interaction hints
5. **HUD** — Top bar shows level, XP bar, streak, dirhams, word count, Quests and Menu buttons
6. **Alphabet Module** — Shows 13 group cards with progress bars
7. **Build** — Vite builds and dev server runs without errors

---

## 10. KEY DECISIONS ALREADY MADE

1. **Fresh build, not a fork** — SimpleLuke's repo has no actual RPG infrastructure. We reference patterns but build clean.
2. **Phaser 3 for game world** — Not CSS sprite layering. Real game engine with physics, camera, collision.
3. **React for all UI** — Menus, quizzes, dialogue, HUD are React components overlaid on Phaser canvas.
4. **EventBus bridge** — Phaser and React communicate via a shared Phaser.Events.EventEmitter.
5. **FSRS (not Anki SM-2)** — ts-fsrs library for modern spaced repetition.
6. **Custom Arabic keyboard** — Built our own (not selmetwa web component) for key highlighting/disabling in lessons.
7. **Redux Persist** — Offline-first, localStorage. Server sync is optional "save to cloud".
8. **Procedural map** — OasisScene generates the map in code (not Tiled .tmx). Could switch to Tiled later.
9. **Inline styles** — All components use JS inline styles (not CSS/Tailwind). Shared via theme.js.
10. **No music rule** — Ambient sounds only. This is a firm design decision.

---

## 11. SPRITE SHEET LAYOUT (Important)

All character sprites (player and NPCs) from monster-quest follow this layout:

```
512x512 PNG image
4 columns × 4 rows = 16 frames of 128×128 pixels each

Row 0 (frames 0-3):   Walk DOWN
Row 1 (frames 4-7):   Walk LEFT
Row 2 (frames 8-11):  Walk RIGHT
Row 3 (frames 12-15): Walk UP

Each row has 4 animation frames for walking.
Frame 0 of each row = idle pose for that direction.
```

Available spritesheets: player.png, blond.png, hat_girl.png, purple_girl.png, young_girl.png, young_guy.png, straw.png, fire_boss.png, grass_boss.png, water_boss.png

**IMPORTANT**: All these sprites currently have visible faces (eyes, mouth). They need to be modified or replaced with faceless versions.

---

## 12. RUNNING THE PROJECT

```bash
# Install dependencies
cd /Users/theshumba/gogo-arabic && npm install

# Start dev server (client only, no backend needed for MVP)
npx vite --port 3000

# Build for production
npx vite build

# Start backend (requires MongoDB running)
cd server && node src/server.js
```

---

## 13. QUESTIONS TO RESOLVE

The following are areas where decisions need to be made or clarified before further development. These should be discussed thoroughly:

### Visual & Art Style
1. How should the faceless characters look? Should they have a smooth blank oval where the face would be? Or should the face area be covered (hood, veil, shadow)? Or should the sprites be redrawn in a different style entirely?
2. The game world uses procedural tile placement (code-generated). Should we switch to Tiled map editor (.tmx files) for more polished, hand-designed maps? Monster-quest has 8 .tmx maps we could reference.
3. Should the game actually be full-screen (scaling the Phaser canvas to fill the browser window)? Or should it be a fixed aspect ratio with letterboxing?
4. The NPC portraits in dialogue are currently emoji. What should they actually be? Cropped sprite? Custom portrait art? Just the name with a colored frame?
5. Should the water in the oasis be animated (real water tiles with animation frames instead of tinted sand)?

### Arabic Text & Learning
6. Should Arabic text in the Phaser game world (NPC names, interaction hints) be rendered differently since pixel fonts don't support Arabic? Options: use Noto Naskh Arabic in Phaser text, render as bitmap text, or keep Arabic only in React overlays.
7. The vocabulary data (~1500 words) was AI-generated. Should it be verified/replaced with data from the cloned repos (OpenArabic, thousand-most-common-words, etc.)?
8. Should the alphabet module show the Arabic letters on the group selection cards? Currently it only shows English group names.
9. How prominent should transliteration be? Always shown? Toggle? Only in early levels?
10. Should there be a "hear and spell" quiz type where audio plays and the player types what they hear?

### Gameplay
11. What should happen when the player completes all 5 quests? Is there an endgame state?
12. Should NPCs move/wander, or stay fixed in place?
13. Should there be a day/night cycle or weather effects?
14. How should difficulty scaling work? Harder words as you level up? Timed quizzes?
15. Should the shop items have visual effect on the player sprite? (This requires a layered sprite system like SimpleLuke has)

### Technical
16. Should we prioritize fixing all current bugs first, or rebuild specific systems from scratch?
17. Is MongoDB/server auth important for MVP, or is localStorage persistence enough?
18. Should we add proper error boundaries and loading states?
19. Should the quiz types be expanded? (e.g., sentence building, fill-in-the-blank, matching)
20. Should we implement the character outfit/customization system from SimpleLuke (layered sprites)?
