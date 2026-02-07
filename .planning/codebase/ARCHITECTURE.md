# Architecture

**Analysis Date:** 2026-02-07

## Pattern Overview

**Overall:** Hybrid architecture combining game engine (Phaser) with UI framework (React) + Redux state management

**Key Characteristics:**
- Game canvas rendered by Phaser.js (1280x720 pixel art)
- React overlay layer for all UI (menus, quizzes, HUD, dialogs)
- Redux store handles persistent and transient state
- EventBus bridges Phaser-to-React communication (decouples layers)
- Node.js/Express backend for user persistence, learning analytics, auth
- Two entry points: frontend (React+Phaser), backend (REST API)

## Layers

**Frontend Layer:**
- Purpose: Game presentation and user interaction
- Location: `src/`
- Contains: React components, Redux store, Phaser scenes, utilities
- Depends on: External libraries (Phaser, React, Redux), backend API
- Used by: Browser client

**Phaser Game Layer:**
- Purpose: Render tilemap-based world, manage sprites (player/NPCs), handle physics/collision
- Location: `src/game/`
- Contains: Scene classes, sprite definitions, game config, DOM overlay system
- Depends on: Phaser framework, Redux state (for lock/unlock checks)
- Used by: React App component for world rendering

**React UI Layer:**
- Purpose: Screens, overlays, forms, menus (everything not the world canvas)
- Location: `src/components/`
- Contains: Menu screens, quiz overlays, dialogue UI, HUD elements
- Depends on: Redux store, EventBus for Phaser communication
- Used by: App component for rendering based on `currentScreen` state

**Redux State Layer:**
- Purpose: Centralized state management (persisted and transient)
- Location: `src/store/`
- Contains: 8 slices (player, vocabulary, quests, ui, alphabet, settings, npc, sync)
- Depends on: redux-persist for localStorage caching
- Used by: All React components and App root

**Backend API Layer:**
- Purpose: User persistence, authentication, learning progress sync, analytics
- Location: `server/src/`
- Contains: Express routes, MongoDB models, controllers, auth middleware
- Depends on: Mongoose ODM, JWT for auth, bcryptjs for passwords
- Used by: Frontend via `src/services/api.js`

**Utilities & Services:**
- Purpose: Shared logic (audio, FSRS spaced repetition, XP calculations, event bus)
- Location: `src/utils/`, `src/services/`, `src/hooks/`
- Contains: Audio manager (Howler.js), FSRS card logic, API client, custom hooks
- Depends on: External libraries and Redux
- Used by: Components and scenes

## Data Flow

**Game Start Flow:**

1. `src/main.jsx` → React app boots with Redux Provider + PersistGate
2. Redux store hydrates from localStorage (persisted slices)
3. `App.jsx` sets initial screen to 'menu' (from uiSlice)
4. Player navigates to `setScreen('game')` → App renders PhaserGame component

**World Interaction Flow:**

1. Player presses SPACE near NPC (WorldScene detects input)
2. WorldScene emits `'npc-interact'` event via EventBus
3. App.jsx listens on EventBus, dispatches `openDialogue()` action
4. Redux uiSlice updates `dialogueOpen = true, dialogueConfig = { npcId }`
5. App renders DialogueOverlay component (overlaid on Phaser canvas)
6. Player selects dialogue option → callback dispatches quiz or quest action
7. EventBus emits `'freeze-player'` (Phaser receives, stops player movement)

**Quiz Completion Flow:**

1. QuizOverlay component detects correct/incorrect answer
2. On correct: Dispatch `addFsrsCard()` to vocabularySlice, `addXP()` to playerSlice
3. playerSlice auto-levels if XP threshold exceeded
4. App.jsx tracks word category, dispatches `updateQuestProgress()` if matching quest
5. questSlice checks if quest complete → dispatch `completeQuest()`, show notification
6. EventBus emits `'sfx-correct'`, App.jsx plays audio via Howler

**Zone Transition Flow:**

1. Player walks toward zone boundary
2. WorldScene detects collision with exitTrigger
3. Emits `'check-zone-unlock'` with zone requirements
4. App.jsx checks unlock conditions (level, words, quest completion) from Redux
5. If unlocked: Emit `'zone-transition'` event with target zone name
6. ZoneTransition system (WorldScene) calls `loadZone(zoneName)`
7. WorldScene clears current zone sprites/NPCs, loads new map from ZONES data
8. Redux updates `currentZone` in playerSlice

**State Persistence:**

1. Redux store configured with redux-persist
2. Persisted slices: `['player', 'vocabulary', 'quests', 'alphabet', 'settings', 'npc']`
3. Non-persisted (transient): `ui`, `sync`
4. onChange, data written to localStorage (automatic)
5. Optional: Server sync via `saveGame()` API call

## Key Abstractions

**EventBus (Phaser.Events.EventEmitter):**
- Purpose: Decouple Phaser scenes from React components
- Examples: `src/game/EventBus.js`, used throughout `src/App.jsx` and `src/game/scenes/WorldScene.js`
- Pattern: One-way pub/sub (Phaser emits, React listens; React emits, Phaser listens)

**Redux Slices (Feature-based state):**
- Purpose: Each slice manages one feature domain (player progress, vocabulary cards, quests, UI state)
- Examples: `src/store/slices/playerSlice.js` (level, XP, zone unlock), `src/store/slices/vocabularySlice.js` (FSRS cards), `src/store/slices/uiSlice.js` (current screen, overlay flags)
- Pattern: Redux Toolkit createSlice (auto-generates actions from reducers)

**React Components by Screen:**
- Purpose: Full-screen overlays mounted conditionally by `currentScreen` state
- Examples: `src/components/Menu/MainMenu.jsx`, `src/components/Quiz/QuizOverlay.jsx`, `src/components/Alphabet/AlphabetModule.jsx`
- Pattern: Screen components receive `onBack`, `onNavigate` callbacks to dispatch navigation actions

**Phaser Sprites (Player, NPC, Interactables):**
- Purpose: Game objects with physics, animations, collision detection
- Examples: `src/game/sprites/Player.js`, `src/game/sprites/NPC.js`
- Pattern: Extend Phaser.Physics.Arcade.Sprite, handle input/animation in update()

**Zone Map Data (ZONES constant):**
- Purpose: Declarative map definitions (tilesets, spawn points, NPCs, interactables, unlocks)
- Examples: `src/data/zones.js` (contains all zone configs: oasis_village, sacred_library, etc.)
- Pattern: Zone object contains tileset ref, NPC positions, chest positions, exit triggers, unlock requirements

**FSRS Spaced Repetition Service:**
- Purpose: Calculate review scheduling for vocabulary cards
- Examples: `src/services/fsrs.js` (wraps ts-fsrs library)
- Pattern: Create new card, update after review, schedule next review date

## Entry Points

**Frontend Entry (Browser):**
- Location: `src/main.jsx`
- Triggers: Page load
- Responsibilities: Mount React root, wrap with Redux Provider and PersistGate, render App component

**Game Screen Entry (React → Phaser):**
- Location: `src/App.jsx` (renders `<PhaserGame ref={phaserRef} />`)
- Triggers: Player navigates to 'game' screen
- Responsibilities: Initialize Phaser game instance, forward scene events, listen to EventBus

**Phaser Boot Scene:**
- Location: `src/game/scenes/BootScene.js`
- Triggers: Phaser game initialization
- Responsibilities: Load all game assets (sprites, tilesets, UI icons, audio metadata), emit 'scene-ready'

**Phaser World Scene:**
- Location: `src/game/scenes/WorldScene.js`
- Triggers: BootScene completes
- Responsibilities: Manage player/NPC sprites, collision detection, zone loading, EventBus event handling

**Backend Server Entry:**
- Location: `server/src/server.js`
- Triggers: `npm run server` or `npm run server:dev`
- Responsibilities: Connect to MongoDB, start Express server on port 5000

**API Routes (Express):**
- Location: `server/src/routes/` (auth, user, review, quest, shop, game)
- Triggers: Fetch requests from frontend
- Responsibilities: Validate input, access database, return JSON responses

## Error Handling

**Strategy:** Try-catch at controller layer; error boundaries at React component layer

**Patterns:**

- **Backend Controllers:** Each route controller (authController, gameController, etc.) wraps logic in try-catch, returns 500 on server error
- **React ErrorBoundary:** `src/components/ErrorBoundary/ErrorBoundary.jsx` wraps all screens to catch render errors, displays fallback UI
- **API Client:** `src/services/api.js` request() function checks response.ok, throws Error with message if not ok
- **Phaser Scenes:** No explicit error handling; relies on console logs for debugging (EventBus listeners use defensive checks)

## Cross-Cutting Concerns

**Logging:**

- Frontend: Browser console (console.log in components/scenes)
- Backend: Console logs in controllers (no persistent logging)
- Audio: Howler.js errors logged to browser console

**Validation:**

- Backend: Mongoose schema validation (required fields, types), controller logic checks (email uniqueness, password length)
- Frontend: React controlled inputs, basic field checks before dispatch (quizzes validate answer format)
- Phaser: Collision detection uses bounding box validation

**Authentication:**

- Backend: JWT tokens (7-day expiry) issued by authController
- Frontend: Token stored in localStorage, attached via Authorization header in `api.js`
- Route Protection: `server/src/middleware/auth.js` verifies JWT before accessing protected routes

**State Synchronization:**

- Local-first: Redux-persist syncs all gameplay state to localStorage automatically
- Optional server sync: `saveGame()` API call (not actively used in current implementation)
- Conflict resolution: Client-side state is source of truth; server acts as backup

---

*Architecture analysis: 2026-02-07*
