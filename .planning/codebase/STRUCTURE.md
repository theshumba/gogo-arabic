# Codebase Structure

**Analysis Date:** 2026-02-07

## Directory Layout

```
gogo-arabic/
├── src/                           # Frontend source code (React + Phaser)
│   ├── main.jsx                   # React root, Redux Provider entry
│   ├── App.jsx                    # Main app orchestrator, screen router
│   ├── game/                      # Phaser game engine
│   │   ├── config.js              # Phaser game config (resolution, physics, scenes)
│   │   ├── PhaserGame.jsx         # React wrapper for Phaser game instance
│   │   ├── EventBus.js            # Shared event emitter for Phaser↔React
│   │   ├── scenes/                # Phaser scenes
│   │   │   ├── BootScene.js       # Asset loading, scene initialization
│   │   │   └── WorldScene.js      # Main gameplay (player, NPCs, tilemap, collision)
│   │   ├── sprites/               # Game objects
│   │   │   ├── Player.js          # Player character sprite & controls
│   │   │   └── NPC.js             # Non-player characters (dialogue triggers)
│   │   └── systems/               # Custom Phaser systems
│   │       ├── DOMOverlay.js      # HTML text overlays for NPC names, signs
│   │       └── ZoneTransition.js  # Zone loading/unloading logic
│   ├── components/                # React UI components (screens & overlays)
│   │   ├── Menu/                  # Main menu, settings, pause
│   │   │   ├── MainMenu.jsx
│   │   │   └── SettingsMenu.jsx
│   │   ├── Character/             # Character creation screen
│   │   │   └── CharacterCreation.jsx
│   │   ├── Alphabet/              # Arabic alphabet learning module
│   │   │   └── AlphabetModule.jsx
│   │   ├── Review/                # FSRS spaced repetition review session
│   │   │   └── ReviewSession.jsx
│   │   ├── Quiz/                  # Quiz overlays (5 quiz types)
│   │   │   ├── QuizOverlay.jsx    # Quiz dispatcher
│   │   │   ├── ArabicToEnglish.jsx
│   │   │   ├── EnglishToArabic.jsx
│   │   │   ├── EnglishToTypeArabic.jsx
│   │   │   ├── ListenAndChoose.jsx
│   │   │   └── MatchPairs.jsx
│   │   ├── NPC/                   # NPC dialogue interface
│   │   │   └── DialogueOverlay.jsx
│   │   ├── Quest/                 # Quest tracking & log
│   │   │   └── QuestLog.jsx
│   │   ├── Shop/                  # In-game shop for cosmetics
│   │   │   └── ShopOverlay.jsx
│   │   ├── World/                 # World features (map, signs)
│   │   │   ├── WorldMap.jsx
│   │   │   └── SignOverlay.jsx
│   │   ├── HUD/                   # Heads-up display (during gameplay)
│   │   │   ├── HUD.jsx            # XP bar, level, currency display
│   │   │   └── NotificationToast.jsx
│   │   ├── Keyboard/              # Arabic keyboard input
│   │   │   └── ArabicKeyboard.jsx
│   │   └── ErrorBoundary/         # React error catching
│   │       └── ErrorBoundary.jsx
│   ├── store/                     # Redux state management
│   │   ├── store.js               # Redux store config, persistence setup
│   │   └── slices/                # Redux Toolkit slices (feature-based state)
│   │       ├── playerSlice.js     # Player profile, level, XP, zone unlocks, inventory
│   │       ├── vocabularySlice.js # Vocabulary cards, FSRS metadata
│   │       ├── questSlice.js      # Quest status, progress, completion
│   │       ├── uiSlice.js         # Current screen, overlay flags (dialogue/quiz open)
│   │       ├── alphabetSlice.js   # Alphabet learning progress
│   │       ├── settingsSlice.js   # Game settings (volume, difficulty)
│   │       ├── npcSlice.js        # NPC dialogue state
│   │       └── syncSlice.js       # Server sync status
│   ├── services/                  # External service clients
│   │   ├── api.js                 # REST API client (fetch wrapper)
│   │   ├── audio.js               # Howler.js audio manager
│   │   └── fsrs.js                # Spaced repetition logic (ts-fsrs wrapper)
│   ├── hooks/                     # React custom hooks
│   │   ├── useAudio.js            # Audio manager hook
│   │   └── useQuiz.js             # Quiz state management hook
│   ├── utils/                     # Utility functions
│   │   ├── eventBus.js            # Legacy EventBus (same as src/game/EventBus.js)
│   │   ├── xpCalculator.js        # XP reward constants/calculations
│   │   └── arabicUtils.js         # Arabic text utilities
│   ├── data/                      # Game data (JSON configurations)
│   │   ├── zones.js               # Zone definitions (tilemap, NPCs, interactables, unlocks)
│   │   ├── vocabulary.json        # All vocabulary words (flat list)
│   │   ├── vocabulary-final.json  # Extended vocabulary (raw import)
│   │   ├── alphabet.json          # Arabic letters with diacritics
│   │   ├── quests.json            # Quest definitions (title, targets, prerequisites, rewards)
│   │   ├── npcs.json              # NPC data (names, dialogue, quest associations)
│   │   ├── items.json             # Shop items (cosmetics, prices)
│   │   └── [category]/*.json      # Vocabulary by category (greetings, food, etc.)
│   └── styles/                    # Styling & theme constants
│       └── theme.js               # Color palette, font configs, reusable CSS-in-JS styles
│
├── server/                        # Backend source (Node.js + Express + MongoDB)
│   └── src/
│       ├── server.js              # Entry point (port 5000, MongoDB connect)
│       ├── app.js                 # Express app config (middleware, routes)
│       ├── models/                # MongoDB schemas (Mongoose)
│       │   ├── User.js            # User document (profile, progress, settings)
│       │   ├── VocabCard.js       # FSRS card metadata per user
│       │   └── Quest.js           # Quest progress per user
│       ├── controllers/           # Route handlers (business logic)
│       │   ├── authController.js  # Register, login, JWT token generation
│       │   ├── userController.js  # Get/update profile
│       │   ├── gameController.js  # Save/load game state
│       │   ├── reviewController.js # Sync FSRS cards
│       │   ├── questController.js # Sync quest progress
│       │   └── shopController.js  # Shop inventory, purchases
│       ├── routes/                # Express route handlers
│       │   ├── auth.js            # POST /register, /login
│       │   ├── user.js            # GET/PUT /profile
│       │   ├── game.js            # POST /save, GET /load
│       │   ├── review.js          # POST /sync, GET /cards
│       │   ├── quest.js           # POST /sync
│       │   └── shop.js            # GET /inventory, POST /purchase
│       └── middleware/
│           └── auth.js            # JWT verification middleware
│
├── public/                        # Static assets (served at root)
│   └── assets/                    # Game sprites, tilesets, audio, fonts
│       ├── sprites/               # Character & NPC spritesheets
│       ├── tilesets/              # Tilemap graphics
│       ├── audio/                 # Music & sound effects
│       ├── backgrounds/           # Full-screen backdrops
│       ├── fonts/                 # Custom fonts (Amiri Arabic, Press Start 2P)
│       ├── ui/                    # UI icons
│       ├── portraits/             # NPC portrait silhouettes
│       ├── objects/               # Interactive object sprites (chest, bookshelf, etc.)
│       └── maps/                  # Tilemap JSON files (if Tiled maps used)
│
├── scripts/                       # Build/setup scripts
│   ├── seed-db.js                 # Populate MongoDB with initial data
│   ├── build-alphabet.js          # Generate alphabet asset from alphabet.json
│   ├── build-vocabulary.js        # Process vocabulary data
│   └── sprite-gen/                # Asset generation tools
│
├── dist/                          # Build output (Vite)
│   └── assets/                    # Bundled assets
│
├── vite.config.js                 # Vite bundler config (React plugin, dev proxy to /api)
├── package.json                   # Frontend dependencies
├── package-lock.json
└── .planning/                     # GSD documentation directory
    └── codebase/                  # Analysis documents (ARCHITECTURE.md, STRUCTURE.md, etc.)
```

## Directory Purposes

**src/ - Frontend**

Purpose: All React and Phaser code for the game client
Contains: Components, game logic, state management, utilities, static data
Key dependency: React 19, Phaser 3, Redux Toolkit

**src/game/ - Game Engine**

Purpose: Phaser-specific code (scenes, sprites, systems)
Contains: Phaser scene classes, game objects, event bus
Isolated: Does not import from src/components; communicates via EventBus

**src/components/ - UI Layer**

Purpose: React screens and overlays
Contains: Full-screen components, modal overlays, UI widgets
Pattern: Folder per feature (Menu, Quiz, Character, etc.) with related JSX files

**src/store/ - State Management**

Purpose: Redux configuration and feature slices
Contains: One slice file per major feature, store configuration
Pattern: Redux Toolkit (slices auto-generate actions/reducers)

**src/services/ - External APIs**

Purpose: Third-party service integration
Contains: REST API client, audio engine, spaced repetition logic
Pattern: Singleton or hook-based services

**src/data/ - Game Configuration**

Purpose: Static game data (zones, vocabulary, quests, NPCs)
Contains: JSON and JS configuration files
Pattern: Imported by components/scenes and passed as props or through Redux

**server/ - Backend API**

Purpose: User persistence, authentication, analytics
Contains: Express routes, MongoDB models, controllers
Pattern: MVC (Models, Controllers, Routes) with middleware

**public/ - Static Assets**

Purpose: Game media (sprites, audio, fonts)
Contains: All game art and sound files
Served: Directly via HTTP (no processing)

**scripts/ - Automation**

Purpose: One-off build/setup tasks
Contains: Database seeding, asset generation
Usage: Run via `npm run [script-name]`

## Key File Locations

**Entry Points:**

- `src/main.jsx` - React app bootstrap (DOM root mount)
- `src/App.jsx` - Main orchestrator (screen routing, event binding)
- `server/src/server.js` - Backend server startup

**Core Game Logic:**

- `src/game/scenes/WorldScene.js` - Main gameplay (player movement, NPCs, collision, zone loading)
- `src/App.jsx` - Game state orchestration (Redux dispatch, EventBus listening)
- `src/store/slices/playerSlice.js` - Level, XP, zone progression logic

**Quiz System:**

- `src/components/Quiz/QuizOverlay.jsx` - Quiz dispatcher (selects quiz type)
- `src/components/Quiz/[Type].jsx` - Individual quiz implementations (5 types)
- `src/hooks/useQuiz.js` - Quiz state management
- `src/store/slices/vocabularySlice.js` - FSRS card tracking

**API Communication:**

- `src/services/api.js` - HTTP client for all backend calls
- `server/src/app.js` - Express app with route mounting
- `server/src/controllers/` - Business logic for each API feature

**Configuration & Data:**

- `src/data/zones.js` - Zone definitions (tilemap, NPCs, interactables, unlocks)
- `src/data/vocabulary.json` - Vocabulary word master list
- `src/data/quests.json` - Quest configurations (targets, prerequisites, rewards)
- `src/data/npcs.json` - NPC definitions and dialogue trees
- `src/styles/theme.js` - Global design tokens (colors, fonts, reusable styles)

**Testing & Build:**

- `vite.config.js` - Frontend bundler config (React plugin, dev proxy)
- `server/package.json` - Backend dependencies (separate from root package.json)

## Naming Conventions

**Files:**

- React components: PascalCase, one component per file (e.g., `QuizOverlay.jsx`)
- Utility functions: camelCase (e.g., `xpCalculator.js`)
- Redux slices: camelCase ending with "Slice" (e.g., `playerSlice.js`)
- Phaser scenes/sprites: PascalCase (e.g., `WorldScene.js`, `Player.js`)
- JSON data: kebab-case or snake_case (e.g., `vocabulary-final.json`, `quests.json`)

**Directories:**

- Feature components: PascalCase (e.g., `src/components/Quiz/`, `src/components/Menu/`)
- System directories: lowercase (e.g., `src/game/`, `src/utils/`, `src/services/`)
- Redux: `src/store/slices/`

**Variables & Functions:**

- Component props: camelCase (e.g., `onNavigate`, `quizConfig`)
- Redux actions: camelCase (e.g., `setScreen`, `openDialogue`, `addXP`)
- Phaser objects: camelCase (e.g., `this.player`, `this.npcs`, `this.interactables`)
- Game constants: UPPER_SNAKE_CASE (e.g., `INTERACT_RANGE`, `TILE`, `GAME_WIDTH`)

## Where to Add New Code

**New Feature (e.g., new quest type or minigame):**

1. Create folder under `src/components/[FeatureName]/`
2. Add component JSX file: `src/components/[FeatureName]/[Component].jsx`
3. If feature needs state: Add Redux slice at `src/store/slices/[feature]Slice.js`
4. If feature needs API: Add methods to `src/services/api.js`
5. If feature needs data: Add JSON to `src/data/` and import in component
6. Connect to App.jsx: Add screen condition in render or as overlay
7. Add event handlers to App.jsx EventBus listeners if Phaser communication needed

**New Component/Module (shared UI element):**

- Pure utility: `src/utils/[utilName].js` (no side effects)
- Service/API: `src/services/[service].js`
- React hook: `src/hooks/use[HookName].js`
- Styled component: Define styles in component file or import from `src/styles/theme.js`

**New Phaser Sprite or System:**

1. Sprite class: `src/game/sprites/[SpriteName].js` (extend Phaser.Physics.Arcade.Sprite)
2. System class: `src/game/systems/[SystemName].js` (utility logic used by scenes)
3. Update `src/game/scenes/WorldScene.js` to instantiate sprite/system
4. If sprite is interactive: Add EventBus emit in sprite update logic
5. If sprite requires asset: Add asset load call to `src/game/scenes/BootScene.js` preload()

**New Zone/Map:**

1. Add zone data to `src/data/zones.js` (ZONES constant)
2. Include: tileset ref, spawn point, NPC positions, chest positions, exit triggers, unlock conditions
3. Update `src/game/scenes/WorldScene.js` buildZone() if custom tileset handling needed
4. Add assets to `public/assets/` (tilesets, sprites)

**New Quiz Type:**

1. Create `src/components/Quiz/[NewType].jsx` component
2. Import in `src/components/Quiz/QuizOverlay.jsx`
3. Add case to dispatcher logic (quizConfig.type switch)
4. Update `QUIZ_TYPE_LABELS` constant with UI label

**Backend API Endpoint:**

1. Create model in `server/src/models/` if new data type
2. Create controller in `server/src/controllers/` with async functions
3. Create route file in `server/src/routes/` (import controller, define Express routes)
4. Mount route in `server/src/app.js`: `app.use('/api/[path]', routes)`
5. Export API function in `src/services/api.js`

## Special Directories

**src/data/ - Game Content**

- Purpose: Declarative game configurations (not code)
- Generated: Some files (vocabulary-final.json) built via build scripts
- Committed: Yes (all files)
- Note: Zones.js is hardcoded; Quests/NPCs/Vocabulary are JSON for easy editing

**public/assets/ - Game Media**

- Purpose: All sprite/audio/font assets used by game
- Generated: Some spritesheets may be generated from source images
- Committed: Yes (all assets)
- Note: Organized by type (sprites/tilesets/audio/fonts/etc.)

**dist/ - Build Output**

- Purpose: Bundled and minified frontend (output of Vite)
- Generated: Yes (build process)
- Committed: No (gitignored)
- Generated by: `npm run build`

**.planning/codebase/ - Architecture Documentation**

- Purpose: GSD reference docs (ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md)
- Generated: Manually or via GSD tools
- Committed: Yes
- Used by: /gsd:plan-phase and /gsd:execute-phase commands

---

*Structure analysis: 2026-02-07*
