# GOGO ARABIC — Master Overview for AI Agent Brain

> **Purpose of this document:** This is the single comprehensive reference for any AI agent working on Gogo Arabic. It covers what the project is, why it exists, every technical decision made, the full architecture, the codebase structure, the current state, and the roadmap ahead. Read this first before touching any code.

---

## 1. WHAT IS GOGO ARABIC?

**Gogo Arabic** is a web-based pixel-art RPG for learning Quranic and Classical Arabic. Players explore a stylised historical Arabic world, talk to NPCs who teach vocabulary, complete Arabic-based quizzes, build items, fight battles using Arabic grammar, and track long-term vocabulary retention via spaced repetition. The high-level pitch: **Pokémon meets Duolingo, built for Arabic with Islamic art principles.**

### The Core Loop

```
Explore world → Talk to NPC → Learn Arabic word → Practice via quiz → 
Earn XP/Dirhams → Level up → Unlock new zones → More words → Repeat
```

Every mechanic in the game is tied to Arabic learning. The player never grinds without learning something. There is no way to progress purely through stats or money — Arabic knowledge is always the key.

### Story Premise

A young scholar discovers an ancient manuscript that enables travel between historical Arabic cities across time: Baghdad in 800 CE, Cordoba in 950 CE, Timbuktu in 1500 CE. The manuscript's pages are scattered across the world. To read them and travel further, you must learn Arabic.

### Target Vision

- **~800K+ LOC** at full completion
- **120–160 hours** of gameplay
- **24 zones** (historical Islamic cities + fantasy Arabic-themed regions)
- **42+ NPCs**, **63+ quests**, **5,000+ vocabulary words**, **18 quiz types**, **6 crafting professions**, **50 spells**, **64 equipment items**

### Platform

- **Primary:** Desktop web browser
- **Best-effort:** Mobile web (not optimised)
- **Resolution:** Responsive, fills full browser window. Base design: 1280×720. Pixel art uses `image-rendering: pixelated` (nearest-neighbour) for crisp upscaling.

---

## 2. HARD CONSTRAINTS (NEVER VIOLATE)

These are non-negotiable design rules that override every other decision:

| Rule | Detail |
|------|--------|
| **No eyes/faces** | All characters — player, NPCs, animals — are faceless. Islamic art tradition. No eyes, no mouth, no facial features. Head coverings (kufis, ghutras, hijabs, turbans, hoods) obscure the face intentionally. The koi fish on the main menu are the reference: animated, but no facial features. |
| **No music** | Zero music tracks. Audio is ambient loops only (desert wind, bazaar chatter, nature sounds) + UI SFX (button clicks, correct/wrong chimes) + Arabic pronunciation TTS. |
| **Arabic-first** | Arabic text is always large, beautiful, and correctly rendered. Always RTL. Diacritics (tashkeel) shown by default. Arabic is never smaller than its English translation on the same screen. Uses Amiri font (titles) and Noto Kufi Arabic (body/quiz). |
| **No god/deity characters** | No divine beings, no worship mechanics as game systems. |
| **Culturally respectful** | Accurate history, no stereotypes. |
| **No romance options** | Cultural sensitivity (Islamic context). |
| **No loot boxes or gacha** | Predatory mechanics undermine educational trust. |
| **No pay-to-win** | Inappropriate for an educational product. |

---

## 3. LEARNING PHILOSOPHY

- **Quranic-first vocabulary.** Core word list is drawn from the Quran and Hadith. Every Quranic word in game cites its Surah and Ayah source.
- **Everyday words supplement.** Greetings, numbers, directions, food — practical words needed for gameplay — supplement the Quranic core. Tagged `source: "common"` vs `source: "quran"`.
- **Spaced Repetition (FSRS).** The `ts-fsrs` library (a modern successor to Anki's SM-2) schedules every vocabulary word the player encounters. "Again / Hard / Good / Easy" ratings drive the schedule. Words decay and resurface at optimal intervals for long-term memory.
- **Grammar embedded in play.** Grammar is taught through vocabulary (word types, root letters, verb forms) rather than as a standalone dry module. Battle grammar combos reward players for constructing noun+adjective agreements, verb chains, and complete Arabic sentences.
- **CEFR-scaled dialogue.** NPC dialogue shifts Arabic/English ratio based on CEFR level. Early NPCs speak mostly English; advanced ones speak mostly Arabic.
- **No grinding without learning.** You cannot brute-force XP. Arabic knowledge gates progression.

---

## 4. TECH STACK (Full)

### Client

| Technology | Version | Role |
|---|---|---|
| React | 19.2.4 | All UI: menus, quizzes, HUD, dialogue, shop, inventory, battle overlays |
| Phaser 3 | 3.90.0 | Game world: tile maps, sprites, camera, physics, collision, scene management |
| Redux Toolkit | 2.11.2 | Global state management (29 slices) |
| redux-persist | 6.0.0 | Persistence layer (localStorage + IndexedDB) |
| ts-fsrs | 5.2.3 | Spaced repetition algorithm for vocabulary cards |
| Howler.js | 2.2.4 | Audio: ambient loops, SFX, Arabic word pronunciation |
| React Router DOM | 7.13.0 | Client-side routing |
| Framer Motion | 11.15.0 | UI animations |
| Zod | 4.3.6 | Runtime data validation (NPC dialogue schema) |
| Vite | 7.3.1 | Build tool, code splitting, dev server |
| Vitest | 3.0.0 | Unit/integration testing (1,121 tests, all passing) |
| Playwright | — | E2E tests |
| ESLint 9 | 9.39.2 | Linting (flat config) |
| Prettier 3 | — | Code formatting |

### Server (Scaffolded, Not Yet Wired)

| Technology | Version | Role |
|---|---|---|
| Express | 5.2.1 | REST API |
| Mongoose | 9.1.6 | MongoDB ODM |
| bcryptjs | 3.0.3 | Password hashing |
| jsonwebtoken | 9.0.3 | JWT authentication |
| helmet | 8.1.0 | Security headers |
| cors | 2.8.6 | CORS handling |

> **Note:** The backend is fully scaffolded (models, routes, controllers, auth middleware) but the client does not connect to it yet. Everything currently runs on localStorage/IndexedDB only. Server wiring is planned for v10.0.

---

## 5. ARCHITECTURE

### The Two-Layer Pattern

```
┌──────────────────────────────────────────────────────────────────┐
│  REACT LAYER (UI Overlays)                                       │
│  Main Menu, Character Creation, HUD, Dialogue, Quiz, Inventory, │
│  Shop, Battle UI, Crafting, Alphabet Module, Daily Review,       │
│  World Map, Quest Log, Settings                                  │
└──────────────────┬───────────────────────────────────────────────┘
                   │  EventBus (Phaser.Events.EventEmitter)
                   │  74+ named events in eventBusTypes.js
┌──────────────────▼───────────────────────────────────────────────┐
│  PHASER 3 LAYER (Game World)                                     │
│  Tile maps, character/NPC sprites, camera, collision,           │
│  zone transitions, interactable objects, battle scene           │
└──────────────────┬───────────────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────────────┐
│  REDUX STORE (Shared State)                                      │
│  29 slices, 9 middleware, hybrid persist                        │
│  Both React and Phaser read from / dispatch to this store       │
└──────────────────┬───────────────────────────────────────────────┘
                   │  (future)
┌──────────────────▼───────────────────────────────────────────────┐
│  EXPRESS + MONGODB (Cloud Persistence, Not Yet Wired)           │
└──────────────────────────────────────────────────────────────────┘
```

### The EventBus

`src/utils/eventBus.js` — A singleton `Phaser.Events.EventEmitter` that bridges Phaser and React. 74+ event constants are namespaced in `src/utils/eventBusTypes.js`. Examples:
- Phaser emits: `NPC_INTERACT`, `ZONE_EXIT`, `OBJECT_INTERACT`, `BATTLE_START`
- React emits: `DIALOGUE_COMPLETE`, `QUIZ_DONE`, `REVIEW_SESSION_OPEN`, `BATTLE_FLEE_RESULT`

### The DOM Overlay System

Arabic text in the Phaser game world (NPC name labels, interaction prompts, sign text) cannot use Phaser's built-in text renderer — pixel fonts don't support Arabic characters. Solution: absolutely-positioned HTML elements overlaid on the canvas, tracking Phaser world coordinates via camera position each frame. This guarantees correct RTL rendering with proper Arabic fonts.

### Hybrid Storage

Heavy data lives in IndexedDB to prevent localStorage overflow. Light data lives in localStorage.

| Data | Storage |
|------|---------|
| Vocabulary cards, battle state, crafting, companions, magic, inventory | IndexedDB (via nested `persistReducer`) |
| Player, quests, alphabet, settings, NPCs, achievements, dailyGoals, grammar, narrative, economy | localStorage |
| UI state, sync state | Not persisted (transient) |

---

## 6. REDUX STORE — 19 SLICES

| Slice | Storage | Contents |
|---|---|---|
| `playerSlice` | localStorage | Level, XP, dirhams, streak, character data, inventory list, currentZone, position |
| `vocabularySlice` | IndexedDB | FSRS cards, word states, review queue, stats |
| `questSlice` | localStorage | Active, completed, and available quests |
| `battleSlice` | IndexedDB | Battle session state, history, arabicReview |
| `arenaSlice` | localStorage | Arena wave data, leaderboard, boss rush progress |
| `craftingSlice` | IndexedDB | Profession levels, XP, crafted items log |
| `companionSlice` | IndexedDB | Unlocked companions, affinity levels, abilities |
| `magicSlice` | IndexedDB | Unlocked spells, XP |
| `inventorySlice` | IndexedDB | Equipment, consumables, equipped items, enchantments |
| `alphabetSlice` | localStorage | 13 group progress, currentLesson |
| `settingsSlice` | localStorage | Audio volumes, showDiacritics, showTransliteration, keyboardMode |
| `npcSlice` | localStorage | Per-NPC dialogue state (lastLine, wordsTaught) |
| `achievementsSlice` | localStorage | Unlocked achievements |
| `dailyGoalsSlice` | localStorage | Daily goal progress |
| `grammarSlice` | localStorage | Grammar lesson completion |
| `narrativeSlice` | localStorage | Story flags, chapter progression |
| `economySlice` | localStorage | Shop unlock states, trade history |
| `uiSlice` | Not persisted | currentScreen, which overlays are open |
| `syncSlice` | Not persisted | lastSyncTime, pendingChanges, isOnline |

### Middleware (7 total)

| Middleware | Purpose |
|---|---|
| `achievementMiddleware` | Checks action dispatches for achievement unlock conditions |
| `battleRewardsMiddleware` | Distributes XP/Dirhams/items on battle completion |
| `craftingVocabMiddleware` | Auto-syncs crafting ingredient vocabulary to FSRS queue |
| `dailyGoalsMiddleware` | Tracks daily goal progress events |
| `rootFsrsSyncMiddleware` | Master FSRS sync — keeps vocabulary cards in sync with encounters |
| `statusEffectVocabMiddleware` | Auto-adds status effect Arabic words to FSRS queue |
| `storageQuotaMiddleware` | Monitors localStorage/IndexedDB quota, warns before overflow |

---

## 7. PHASER SCENES

### BootScene (`src/game/scenes/BootScene.js`)
Asset preloader. Loads all 77 assets (sprites, tilesets, audio) upfront during the initial loading screen with a loading bar. **Known tech debt:** needs zone-based lazy loading — this causes the initial load to be slow.

### WorldScene (`src/game/scenes/WorldScene.js`)
The main overworld. Tile-based world (64×64px tiles) with:
- `PlayerController` — WASD/arrow movement, freeze/unfreeze, zone transition detection
- `NPCManager` — Manages all NPC sprites, idle animations, proximity detection
- `InteractableManager` — Bookshelves, signs, treasure chests, gathering spots
- `MapLoader` — Loads zone tilemaps and switches between them
- `GatheringSpotManager` — Respawning resource nodes with 4hr/8hr timers
- `DialogueEngine` — Evaluates NPC dialogue conditions and drives dialogue sequences
- `SceneStackManager` — Handles interior scene push/pop (enter building, exit building)
- DOM overlay system for Arabic name labels + interaction prompts

### BattleScene (`src/game/scenes/BattleScene.js`)
Turn-based battle arena. Drives the `BattleStateMachine`. Player sprites + up to 4 enemy sprites with front/back row positioning. React overlays handle all battle UI.

### InteriorScene (`src/game/scenes/InteriorScene.js`)
Interior tilemap renderer for buildings. Stacked on top of WorldScene via SceneStackManager. 15+ enterable building interiors planned.

---

## 8. GAME SYSTEMS

### Player Movement (`src/game/sprites/Player.js`)
- WASD and arrow key movement, 4-direction walking animations (8 FPS)
- 512×512 spritesheet, 4×4 grid, 128×128 per frame
  - Row 0: Walk down | Row 1: Walk left | Row 2: Walk right | Row 3: Walk up
- `freeze()` / `unfreeze()` — called when dialogue/quiz opens
- 64×64 collision box centred on sprite's bottom half

### NPC System (`src/game/sprites/NPC.js`)
- Same spritesheet format as player
- Idle: gently shifts between frame 0 and frame 1 of current direction every 2s
- DOM overlay above each NPC: Arabic name (Amiri font) + English name + "SPACE" prompt when player is within 2 tiles
- All NPC data defined in `src/data/npcs.json`, enriched via `src/data/npcsEnriched.js` (barrel module — always import NPCs from here, never directly from `npcs.json`)
- NPC dialogue validated at build time via a custom Vite plugin using the Zod schema in `dialogueSchema.js`

### Dialogue System (`src/game/systems/DialogueEngine.js`)
- Evaluates conditions per dialogue line (story flags, vocabulary knowledge, player level, quest state)
- Story arcs overlay base NPC data via `npcStoryArcs.js` → merged in `npcsEnriched.js`
- Dialogue tree: `trigger` → `lines[]` → optional `choices[]` → optional `effects[]` (give item, set flag, start quest, teach word)
- CEFR-scaled: A1 NPCs speak mostly English, B2/C1 NPCs speak mostly Arabic

### Battle System (`src/game/systems/battle/`)

The battle system is the most complex part of the codebase. Architecture:

```
BattleStateMachine.js (FSM core)
  ├── States: PLAYER_TURN, GRAMMAR_COMBO, ITEM_USE, TARGET_SELECT, 
  │           COMPANION_TURN, ENEMY_TURN, FLEE_CHALLENGE, WIN, LOSE
  ├── ArenaController.js       — Wave-based survival mode
  ├── BossRushController.js    — Sequential boss gauntlet with story interludes
  ├── PuzzleBattleManager.js   — Arabic knowledge puzzles (single answer, not brute-forceable)
  ├── GrammarComboDetector.js  — Detects noun+adj, verb chain, sentence combos
  ├── CompoundEffectResolver.js — Resolves compound status effects from combinations
  └── MultiTargetManager.js   — Data-push pattern for up to 4 enemies (front/back rows)
```

**Arabic = Attack Power:** Answering Arabic questions correctly deals full damage. Wrong answer = reduced/no damage. The player's Arabic knowledge directly scales their effectiveness in battle.

**Grammar Combos:** Players can chain Arabic grammar structures for massively increased damage:
- **Noun+Adjective (إضافة):** Two-word combo
- **Verb Chain:** Conjugate 3+ verbs in sequence
- **Full Sentence:** Subject + verb + object = ultimate attack

**24 Status Effects:** All with Arabic names and required vocabulary knowledge to apply. Status effect vocabulary auto-added to FSRS review queue. Combinations create compound effects.

**Retreat Mechanic:** To flee battle, the player must correctly answer an Arabic challenge (accuracy ≥ 0.8), using words from the top 30% most familiar (highest FSRS stability). Fair but still educational.

### Root Magic System (`src/data/rootMagic.js`)
50 spells derived from Arabic trilateral roots. Spell power scales with Arabic vocabulary mastery. Spells have Arabic names and use root letters as their "source." Example: root `ك-ت-ب` (write) powers literacy-themed spells.

### Crafting System (`src/game/systems/`)

6 professions, each with a unique mini-game and Arabic vocabulary integration:

| Profession | Arabic | Mini-game | Focus |
|---|---|---|---|
| Calligrapher | خطاط | CalligraphyTracing — pixel-overlap accuracy | Arabic letter writing |
| Cook | طباخ | CookingRecipeOrder — Fisher-Yates shuffle sequence | Food vocabulary |
| Blacksmith | حداد | SmithingRhythm — requestAnimationFrame timing | Tool/weapon vocab |
| Herbalist | عطار | PlantIdentification — embedded descriptions | Nature vocabulary |
| Weaver | نساج | PatternMatching — Unicode shape icons (■●▲★◆) | Pattern/color vocab |
| Builder | بناء | DirectionalPlacement — emoji for building elements | Construction vocab |

**Vocabulary gating:** Locked ingredients show as `???`. To unlock, player must learn the Arabic word for that ingredient (opens FSRS review session). All mini-games use CSS Grid (not Canvas) for accessibility and performance.

**Gathering spots:** `GatheringSpotManager` places resource nodes in world zones with 4hr/8hr respawn timers. `scene.time.delayedCall()` for respawns (event-driven, not polling).

**Progression:** Level 0 profession requires 50 XP; levels 1–10 require `100 × level` XP. 4-tier gathering quality vs 5-tier crafting quality (crafting has mini-game accuracy component).

### Companion System (`src/game/systems/companions/`)

12 companions, each with:
- Unique personality and Arabic teaching focus
- Behaviour tree AI (not state machines)
- Affinity level that grows through interaction and gifting
- Unique abilities unlocked at affinity thresholds
- Custom dialogue lines (573 lines still missing content — known gap)
- Companion sprite PNGs (12 still missing art assets — known gap)

### Spaced Repetition (FSRS)

`ts-fsrs` (v5.2.3) implements the Free Spaced Repetition Scheduler, a modern successor to Anki's SM-2. Every vocabulary word the player encounters creates an FSRS card. Cards are rated "Again / Hard / Good / Easy" in the Daily Review. The algorithm calculates the optimal next review date for long-term retention. XP rewards: +5 per card, +2 for Good, +5 for Easy.

---

## 9. QUIZ TYPES

| # | Type | Status |
|---|---|---|
| 1 | Arabic → English (multiple choice) | ✅ Implemented |
| 2 | English → Arabic (multiple choice) | ✅ Implemented |
| 3 | Type the Arabic word (on-screen keyboard) | ✅ Implemented |
| 4 | Listen and identify | Planned (v8.0) |
| 5 | Match pairs | Planned (v8.0) |
| 6 | Fill in the blank (Quranic sentences) | Planned (v8.0) |
| 7 | Root letter identification | Planned (v8.0) |
| 8 | Word building (drag letters) | Planned (v8.0) |
| 9–18 | 10 additional types | Planned (v8.0) |

All quiz types share: correct/wrong SFX, auto-advance after feedback, XP popup, streak counter. NPC quizzes and daily review have no timer. Quest challenge quizzes have a 15-second timer.

---

## 10. ZONES (8 Current, 24 Planned)

### Current 8 Zones

| Zone | Tiles | Theme | Vocab Focus | Unlock |
|---|---|---|---|---|
| Oasis Village | 40×30 | Desert oasis starter town | Greetings, family, basic Quranic | Always available |
| Ancient Library/Madrasa | 35×30 | Stone library, courtyards | Alphabet, reading, core Quranic | Complete Oasis quest |
| Desert Marketplace/Souk | 45×35 | Bustling market | Numbers, trade, food, money | Complete Library quest |
| Farmland/Fields | 45×35 | Rural farmland | Nature, body parts, verbs, animals | Level 8+, 400+ words |
| Bedouin Camp | 35×25 | Desert tents, campfire | Time, storytelling, weather | Level 11+, 600+ words |
| Mountain Village | 40×30 | Rocky mountain settlement | Weather, animals, clothing | Level 14+, 800+ words |
| Coastal Port | 45×35 | Busy harbour, boats | Travel, directions, trade | Level 17+, 1200+ words |
| Royal Palace/Garden | 50×40 | Ornate palace + gardens | Formal speech, governance | Level 20+, 1600+ words |

### 24 Planned Zones (v7.0)

Historical Islamic cities: Baghdad (800 CE), Cordoba (950 CE), Timbuktu (1500 CE), Damascus, Cairo, Fez, Samarkand, Granada — plus fantasy Arabic-themed regions.

---

## 11. NPCs

- **Current:** 42+ NPCs defined in `npcs.json`
- **Target:** 350+ NPCs (v9.0)
- **Dialogue structure:** Each NPC has multiple dialogue trees, each with a trigger condition, lines with Arabic+English+transliteration, optional word-teaching moments, and branching choices.

NPCs have:
- `personality: { tone, mood }` (object — NOT string — important for Zod validation)
- `vocabulary` condition: `{ wordId, mastered? }` (not `{ min: number }`)
- `storyFlag` condition: `{ key, value }` (not just `{ flag: "name" }`)
- Interior variants use `-interior` suffix (e.g., `scholar-yusuf-interior`)

NPC portraits are **silhouettes** — solid coloured shapes with distinctive head covering outlines. No faces. 96×96px PNG, transparent background.

---

## 12. VOCABULARY DATA

- **Current:** `vocabulary-final.json` — 1,220 words
- **Schema per word:**

```json
{
  "id": "greet_hello",
  "arabic": "مَرْحَبًا",
  "english": "Hello",
  "transliteration": "marhaban",
  "category": "greetings",
  "difficulty": 1,
  "source": "common",
  "quranRef": { "surah": 2, "ayah": 255 } | null,
  "rootLetters": "r-h-b" | null,
  "partOfSpeech": "noun" | "verb" | "adjective" | "adverb" | "preposition" | "particle" | "phrase",
  "zone": "oasis_village",
  "audioRef": "marhaban",
  "exampleSentence": {
    "arabic": "مَرْحَبًا يا صَديقي",
    "english": "Hello, my friend",
    "transliteration": "marhaban ya sadiqi"
  }
}
```

- **Target:** 5,000+ words (v8.0)
- Data sourced from: OpenArabic (2000+ words), Quran JSON, thousand-most-common-words, quran101 (101 Quranic verbs with root analysis)

---

## 13. AUDIO SYSTEM

**Rule: NO MUSIC.** Zero music tracks. Ever.

Audio consists of:
- **Ambient loops** (one per zone): desert wind, bazaar chatter, library quiet, campfire crackling, waves, market noise, mountain wind, palace fountain
- **SFX**: button click, correct chime, wrong buzz, level-up fanfare, chest open, splash, etc.
- **Arabic pronunciation**: TTS-generated MP3s for each vocabulary word. 28 letter audio files from ArabEngo repo.

Audio managed by `src/services/audio.js` (Howler.js wrapper). `audioManager` singleton pattern.

---

## 14. FONTS & DESIGN SYSTEM

### Fonts

| Font | Use |
|---|---|
| Press Start 2P | All English UI text (pixel/retro aesthetic) |
| Amiri | Arabic titles, decorative, NPC names, word-teaching cards |
| Noto Kufi Arabic | Arabic body text, quiz text, all readable Arabic content |

### Colours

| Token | Hex | Use |
|---|---|---|
| Beige | `#f5f3da` | Panel backgrounds |
| Brown | `#391D23` | Dark text, borders |
| Dark | `#2b292c` | Phaser background, dark panels |
| White | `#f4fefa` | Light text |
| Gray | `#3a373b` | Secondary dark |
| Gold | `#bfa100` | Scores, currency display |
| XP Gold | `#e2b659` | XP bar, NPC names, accents |
| Cyan | `#06c1de` | Primary buttons |
| Red | `#f03131` | Errors, wrong answers |
| Green | `#2ecc71` | Correct answers, completed tasks |

### UI Patterns

- **pixelBtn** — Cyan bg, dark text, inset shadow bevel, 4px bottom shadow, no border-radius (sharp pixel corners)
- **pixelBtnGold** — Gold variant
- **pixelBtnDark** — Dark gray variant
- **pixelPanel** — Beige bg, 4px solid dark border, sharp corners, pixel font
- CSS Modules for all new components (`.module.css`)
- `useOverlayClose` hook on all overlays (ESC / click-outside)
- `useFocusTrap` for WCAG AA keyboard accessibility
- `useReducedMotion` check on all VFX/animations

---

## 15. KEY SCREEN SPECIFICATIONS

### Main Menu
Full-screen animated pixel-fishes.gif (koi fish background). Title: "Gogo Arabic" + "يلا عربي". Buttons: New Game, Continue, World Map, Daily Review, Alphabet, Settings.

### Character Creation
char-bg.gif background. Name input (Arabic + Latin). Skin tone selector (4 swatches). Head covering (6 types: Kufi, Ghutra, Turban, Hijab, Hood, None). Starting outfit (3 options). Character preview updates live. On "Begin Journey": transition with "بسم الله الرحمن الرحيم" text.

### HUD (In-Game)
Top bar, full width, rgba(0,0,0,0.7) background, 48px height. Left: level badge + XP bar + streak. Centre: dirhams + words learned. Right: Quests button, Map button, Menu button.

### NPC Dialogue Overlay
Bottom 30% of screen. Dark panel with gold pixel-art border. NPC silhouette portrait (96×96, top-left). NPC name in Arabic (Amiri) + English (Press Start 2P). Three text lines per dialogue entry: Arabic (Noto Kufi, 24px, white), English (14px, grey), Transliteration (12px, muted gold, toggleable). Word-teaching card: parchment-coloured card with Arabic (Amiri 32px), English, transliteration, audio button.

### Quiz Overlay
Full-screen. Zone-appropriate background. Top bar: quiz type label, progress (e.g. "5/10"), optional timer. Bottom bar: Skip, streak counter, Quit Quiz. Correct: green flash + chime + XP popup + streak++. Wrong: red flash, correct highlighted, buzz SFX, streak reset, 2s delay.

### Alphabet Module
13 group cards in scrollable grid. Each card: group name + Arabic letters displayed (Amiri, 28px) + progress dots. Clicking: 5-step lesson (Introduction → Letter Forms → Vowel Combinations → Recognition Quiz → Writing Quiz). Must score 4/5 and 3/5 respectively to complete.

### World Map
Full-screen pixel-art stylised map. 8 (then 24) zone icons on a hand-drawn-style landscape. Unlocked zones: full colour, clickable. Locked zones: faded + lock icon + unlock requirements tooltip. Current zone: golden border. Fast travel via click.

---

## 16. PROJECT FILE STRUCTURE

```
gogo-arabic/
├── .planning/                    # All planning documents
│   ├── PROJECT.md               # Project definition and key decisions
│   ├── ROADMAP.md               # Phase tracking
│   ├── STATE.md                 # Current state — ALWAYS check here before starting work
│   ├── REQUIREMENTS.md          # v6.1 requirements
│   ├── MASTER-PLAN.md           # Full v6-v11 master plan
│   ├── MILESTONES.md            # Milestone archive
│   ├── milestones/              # Archived milestone roadmaps
│   ├── phases/                  # Phase plans and summaries by phase number
│   └── research/                # 20 research documents (one per major feature area)
│
├── src/
│   ├── main.jsx                 # React entry (Provider + PersistGate)
│   ├── routes.jsx               # React Router v7 (all app routes)
│   │
│   ├── components/              # 31 component directories, 174 files
│   │   ├── Battle/              # 26 files — all combat UI overlays
│   │   ├── Crafting/            # 13 files — crafting system UI
│   │   ├── Companions/          # 5 files — companion panel UI
│   │   ├── NPC/                 # 11 files — dialogue overlay system
│   │   ├── HUD/                 # 14 files — heads-up display
│   │   ├── Quiz/                # 8 files — 3 quiz types implemented
│   │   ├── World/               # 6 files — world interaction overlays
│   │   ├── Shop/                # 4 files — shop + haggling UI
│   │   ├── Inventory/           # 3 files — equipment display
│   │   ├── Magic/               # 3 files — spell system UI
│   │   ├── Alphabet/            # Alphabet learning module
│   │   ├── Review/              # FSRS daily review UI
│   │   ├── Quest/               # Quest log overlay
│   │   ├── Menu/                # Main menu + settings
│   │   └── Character/           # Character creation
│   │
│   ├── data/                    # 43 static data files
│   │   ├── npcs.json            # 42+ NPCs with full dialogue trees
│   │   ├── npcsEnriched.js      # Barrel module — ALWAYS import NPCs from here
│   │   ├── npcStoryArcs.js      # Story arc overlays for NPCs
│   │   ├── vocabulary-final.json # 1,220 words (the authoritative word list)
│   │   ├── quests.json          # 63 quests
│   │   ├── statusEffects.js     # 24 status effects with Arabic names
│   │   ├── grammarCombos.js     # Grammar combo definitions
│   │   ├── arenaChallenges.js   # Arena wave / boss rush / puzzle configs
│   │   ├── rootMagic.js         # 50 spells derived from Arabic roots
│   │   ├── equipment.js         # 64 equipment items (IMMUTABLE — do not modify)
│   │   ├── companions.js        # 12 companions with abilities + dialogue
│   │   ├── professions.js       # 6 crafting professions (flat-object, O(1) lookup)
│   │   ├── recipes.js           # 100 crafting recipes
│   │   ├── resources.js         # Gathering resources
│   │   ├── zones.js             # Zone configurations  
│   │   ├── grammar.js           # Grammar lesson definitions
│   │   └── interiors/           # Building interior zone data
│   │
│   ├── game/                    # Phaser 3 game layer
│   │   ├── config.js            # 1280×720, Arcade physics, pixelArt: true
│   │   ├── PhaserGame.jsx       # React wrapper (forwardRef, bridges Phaser into React)
│   │   ├── EventBus.js          # The event bridge singleton
│   │   ├── scenes/              # 4 Phaser scenes
│   │   │   ├── BootScene.js     # Asset preloader (77 assets)
│   │   │   ├── WorldScene.js    # Main overworld
│   │   │   ├── BattleScene.js   # Turn-based battle
│   │   │   └── InteriorScene.js # Building interiors
│   │   ├── sprites/             # Phaser sprite classes
│   │   │   ├── Player.js        # Player movement, animation, freeze
│   │   │   ├── NPC.js           # NPC idle, proximity, name label
│   │   │   └── Companion.js     # Companion sprite (follows player)
│   │   └── systems/             # Game subsystems
│   │       ├── battle/          # 14 battle system files (see Battle System section)
│   │       ├── companions/      # 4 companion AI files
│   │       ├── equipment/       # 2 equipment calculation files
│   │       ├── magic/           # 2 magic system files
│   │       ├── DialogueEngine.js      # NPC dialogue evaluator
│   │       ├── GatheringSpotManager.js # Resource node respawns
│   │       ├── InteractableManager.js  # Objects (bookshelves, chests, signs)
│   │       ├── NPCManager.js          # NPC lifecycle management
│   │       ├── MapLoader.js           # Zone tilemap loader
│   │       ├── PlayerController.js    # Player input + zone transition
│   │       └── SceneStackManager.js   # Interior scene push/pop
│   │
│   ├── hooks/                   # 19 custom React hooks
│   │   ├── useQuiz.js           # Quiz session logic + FSRS card management
│   │   ├── useOverlayClose.js   # ESC + click-outside for overlays
│   │   ├── useFocusTrap.js      # WCAG AA keyboard trap for overlays
│   │   └── useReducedMotion.js  # Respects prefers-reduced-motion
│   │
│   ├── store/                   # Redux store
│   │   ├── store.js             # 29 slices, 9 middleware, hybrid persist config
│   │   ├── slices/              # 19 Redux slices (see section 6)
│   │   └── middleware/          # 9 middleware files (see section 6)
│   │
│   ├── services/                # External service wrappers
│   │   ├── fsrs.js              # ts-fsrs wrapper (createCard, reviewCard, getDueCards)
│   │   ├── audio.js             # audioManager singleton (Howler.js)
│   │   ├── api.js               # Backend API calls (scaffolded, not yet connected)
│   │   └── storage/             # IndexedDB adapter + migrations (v5 current)
│   │
│   ├── utils/                   # 28 utility files
│   │   ├── eventBus.js          # EventBus singleton instance
│   │   ├── eventBusTypes.js     # 74+ named event constants
│   │   ├── xpCalculator.js      # XP/Dirham reward constants + level curve
│   │   └── toArabicNumerals.js  # Convert 0-9 to ٠-٩ (used throughout UI)
│   │
│   └── styles/                  # Theme + CSS variables
│       └── theme.js             # COLORS, FONTS, pixelBtn variants, pixelPanel
│
├── server/                      # Express 5 backend (scaffolded, not wired)
│   └── src/
│       ├── server.js            # MongoDB connect + listen
│       ├── app.js               # Middleware + route mounting
│       ├── models/              # User, VocabCard, Quest (Mongoose schemas)
│       ├── routes/              # 6 route files (auth, user, review, quest, shop, game)
│       ├── controllers/         # 6 controllers
│       └── middleware/auth.js   # JWT middleware
│
├── public/                      # Static assets served by Vite
│   ├── assets/sprites/          # Character/NPC spritesheets (PNG, 512×512, 4×4 grid)
│   ├── assets/tilesets/         # Tile images (world.png, coast.png, indoor.png)
│   ├── assets/audio/            # Ambient, SFX, word MP3s (many still empty dirs)
│   ├── assets/objects/          # World decoration sprites (35+)
│   ├── assets/ui/               # UI icons
│   └── img/                     # GIF backgrounds (pixel-fishes.gif, pixel-sepia.gif, etc.)
│
├── e2e/                         # Playwright E2E tests
├── scripts/                     # Build/data scripts
├── tests/                       # Additional test infrastructure
│
├── vite.config.js               # Custom dialogue validation plugin + manual chunk splitting
├── vitest.config.js             # jsdom, coverage thresholds (25/70/50/25)
├── eslint.config.js             # ESLint 9 flat config
├── package.json                 # All dependencies
│
└── Planning Docs (root level):
    ├── GOGO_ARABIC_PRD_FINAL.md    # Full product requirements (73KB)
    ├── GOGO_ARABIC_TECHNICAL_BRIEF.md # Technical summary (earlier state)
    ├── GOGO_ARABIC_PRD_BRAINSTORM.md  # Early brainstorm
    └── HANDOFF.md                  # Current handoff document for AI agents
```

---

## 17. CURRENT STATE & VERSIONING

### Shipped Milestones

| Version | Description | Phases | Plans | Date |
|---|---|---|---|---|
| v2.0 | Player Experience Overhaul | 1–9 | 14 | 2026-02-08 |
| v3.0 | Infrastructure & Polish | 10–11 | 11 | 2026-02-09 |
| v4.0 | Game Soul & Polish | 14–18 | 8 | 2026-02-10 |
| v5.0 | The Real Game | 19–26 | 18 | 2026-02-11 |
| v6.0 | Combat & RPG | 27.1, 28–30 | 16 | 2026-02-13 |
| v6.1 | Crafting & Advanced Combat | 31–32 | 19 | 2026-02-18 |

**Cumulative:** 32 phases, 95+ plans, 6 shipped milestones, built in ~10 days

### Current Stats
- **Tests:** 1,121 passing, 0 failing (62 test files)
- **Build:** Succeeds. Main bundle 862KB (223KB gzipped)
- **LOC:** ~110K
- **Commits:** 302+
- **Git tags:** v6.0, v6.1

### Next Milestone: v7.0 — World & Content

| Phase | Description | ~LOC |
|---|---|---|
| 33 | 24 zones (historical cities + fantasy) | 28K |
| 34 | Weather + time system (8 weather types, day/night, seasons) | 22K |
| 35 | 100+ building interiors | 25K |
| 36 | Dynamic world state engine (500+ variables, consequences) | 24K |
| 37 | 200+ secrets + 15 Arabic puzzle types + exploration rewards | 24K |
| 38 | Transport system (mounts, caravans, boats, fast travel) | 24K |

### Full Roadmap

| Version | Phases | ~LOC | Focus |
|---|---|---|---|
| v7.0 World & Content | 33–38 | 147K | 24 zones, weather, 100+ buildings, world state, secrets, transport |
| v8.0 Learning & Progression | 39–44 | 164K | 5000+ vocabulary, 6 skill trees, 50 grammar lessons, 18 quiz types, 250+ achievements |
| v9.0 Narrative & Social | 45–51 | 143K | 8-act main story, 250+ quests, 350+ NPCs, 6 factions, gifts, housing, codex |
| v10.0 Infrastructure | 52–57 | 108K | Backend v2, state overhaul, performance, 2000+ tests, content pipeline, save system |
| v11.0 AAA Polish | 58–63 | 88K | World polish, onboarding, accessibility, game feel, UI polish, endgame |

---

## 18. KNOWN TECH DEBT

| Issue | Severity | Fix Planned |
|---|---|---|
| Bundle 862KB (target 500KB) | Medium | Lazy loading / code splitting (v10.0) |
| BootScene loads ALL 77 assets upfront | Medium | Zone-based lazy loading (v10.0) |
| No tests for Phase 27 battle code (~2.6K LOC) | Medium | v10.0 |
| ShopOverlay + CompanionUI not wired to GameLayout | Low | ~25 lines to fix, can be done anytime |
| 573 missing companion dialogue lines | Content | Ongoing content work |
| 12 missing companion sprite PNGs | Art | Ongoing art work |
| Backend not connected; localStorage only | Medium | v10.0 |

---

## 19. DEV COMMANDS

```bash
# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev

# Run all tests (single run)
npm run test:run

# Run tests in watch mode
npm run test

# Production build (also validates NPC dialogue via Vite plugin)
npm run build

# Linting
npm run lint

# Formatting
npm run format

# Start backend (requires local MongoDB)
cd server && node src/server.js
```

---

## 20. CRITICAL PATTERNS FOR AGENTS

### Before Starting Any Work
1. Read `.planning/STATE.md` — tells you exactly where we are and what's next
2. Read `.planning/MASTER-PLAN.md` — the full phase-by-phase roadmap
3. Read the current phase plan in `.planning/phases/[phase]/[plan]-PLAN.md`
4. Check `npm run test:run` passes before touching anything

### NPC Data Rules
- **Always import NPCs from `npcsEnriched.js`**, never directly from `npcs.json`
- `personality` must be `{ tone, mood }` object, not a string
- `vocabulary` condition: `{ wordId, mastered? }` not `{ min: number }`
- `storyFlag` condition: `{ key, value }` not `{ flag: "name" }`
- Interior NPC IDs use `-interior` suffix

### Redux Patterns
- Heavy data (vocabulary, battle, crafting, etc.) → IndexedDB nested `persistReducer`
- Light data (player, quests, settings, etc.) → localStorage root persistor
- Selectors use `createSelector` for memoization
- New slices must be added to `store.js` combineReducers AND the persist whitelist

### EventBus Pattern
- All cross-layer events go through EventBus (never direct calls between Phaser and React)
- Event constants live in `eventBusTypes.js` — add new events there first
- Always clean up EventBus listeners in `useEffect` return functions

### Component Patterns
- All new components use CSS Modules (`.module.css`) — not inline styles
- Arabic numerals: use `toArabicNumerals()` utility for all displayed numbers
- Overlays must use `useOverlayClose` and `useFocusTrap`

### Battle System
- `equipment.js` is IMMUTABLE — add stats via enchantments stored separately
- `calculateTotalBattleStats` (dynamic, including buffs) vs `calculateTotalEquipmentStats` (static)
- `MultiTargetManager` is data-push only — never reads Redux directly

### Testing
- 62 test files, 1,121 tests — all must pass before any commit
- Coverage thresholds: statements 25%, branches 70%, functions 50%, lines 25%
- Uses `fake-indexeddb` for IndexedDB mocking
- `npm run build` must succeed (validates NPC dialogue schema via Zod)

---

## 21. ASSET SOURCES

| Source | Location | What It Provides |
|---|---|---|
| devloos/monster-quest | `/Users/theshumba/monster-quest` | All pixel art: character spritesheets, tilesets, objects, backgrounds, UI icons |
| SimpleLuke/japanese-learning-RPG | `/Users/theshumba/japanese-learning-RPG` | GIF backgrounds, 3D pixel CSS button style, colour palette reference |
| edenmind/OpenArabic | `/Users/theshumba/OpenArabic` | 2000+ Arabic words, sentences, translations |
| risan/quran-json | `/Users/theshumba/quran-json` | Full Quran in JSON (primary vocab source) |
| SMenigat/thousand-most-common-words | `/Users/theshumba/thousand-most-common-words` | 1000 most common Arabic words |
| gitzain/quran101 | `/Users/theshumba/quran101` | 101 Quranic verbs with root letters |
| michaelsboost/ArabEngo | `/Users/theshumba/ArabEngo` | 28 Arabic letter audio files |
| ARBML/Calliar | `/Users/theshumba/Calliar` | Arabic calligraphic style reference |

> **Important:** All character sprites from monster-quest have been edited to remove faces. Any new sprite additions must be faceless.

---

## 22. PLANNING FILES MAP

| File | Purpose |
|---|---|
| `.planning/STATE.md` | Current state, where we are, what's next. READ THIS FIRST. |
| `.planning/PROJECT.md` | Project definition, key decisions log (all v2.0–v6.1 decisions) |
| `.planning/ROADMAP.md` | Phase tracking with completion status |
| `.planning/MASTER-PLAN.md` | Full v6–v11 master plan |
| `.planning/REQUIREMENTS.md` | v6.1 feature requirements |
| `.planning/MILESTONES.md` | Milestone archive |
| `.planning/research/EXPANSION-WORLD-CONTENT.md` | v7.0 world design research |
| `.planning/research/EXPANSION-LEARNING-PROGRESSION.md` | v8.0 learning system research |
| `.planning/research/EXPANSION-NARRATIVE-SOCIAL.md` | v9.0 story/social research |
| `.planning/research/EXPANSION-INFRASTRUCTURE.md` | v10.0 backend/infra research |
| `.planning/research/EXPANSION-PEDAGOGY-SLA.md` | 47 pedagogy requirements |
| `.planning/research/EXPANSION-CURRICULUM-ARABIC.md` | 41 Arabic curriculum requirements |
| `.planning/research/AAA-QUALITY-GAPS.md` | 60 polish gaps for v11.0 |
| `.planning/research/BATTLE-SYSTEM-ARCHITECTURE.md` | Deep battle system design doc |
| `.planning/research/ASSET-PIPELINE.md` | Sprite atlas, audio, Islamic art pipeline |
| `.planning/research/UI-UX-DESIGN-SYSTEM.md` | Design tokens, components, accessibility |
| `.planning/research/BACKEND-ARCHITECTURE-V2.md` | API v2, MongoDB, Redis, save system |
| `.planning/research/TECHNICAL-DEBT-AUDIT.md` | Known tech debt and scaling concerns |

---

*Last updated: 2026-03-19. Based on v10.0 codebase (~110K LOC, 29 slices, 9 middleware).*
