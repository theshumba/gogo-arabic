# Coding Conventions

**Analysis Date:** 2026-02-07

## Naming Patterns

**Files:**
- React components: PascalCase with `.jsx` extension (`MainMenu.jsx`, `ErrorBoundary.jsx`, `QuizOverlay.jsx`)
- Utility/service files: camelCase with `.js` extension (`arabicUtils.js`, `audioManager.js`, `eventBus.js`)
- Redux slices: camelCase with `.js` extension (`playerSlice.js`, `vocabularySlice.js`)
- Phaser classes: PascalCase with `.js` extension (`Player.js`, `WorldScene.js`, `BootScene.js`)
- Configuration files: camelCase with `.js` extension (`config.js`, `theme.js`)

**Functions:**
- React components and hooks: PascalCase (exported defaults) or camelCase for named exports
- Pure functions and utilities: camelCase (`stripDiacritics()`, `isArabic()`, `arabicEquals()`, `pickDistractors()`)
- Phaser class methods: camelCase with underscore prefix for private methods (`_createAnims()`, `_playAnim()`)
- Redux action creators: camelCase (`setName()`, `addXP()`, `updateStreak()`)

**Variables:**
- Constants: SCREAMING_SNAKE_CASE (`GAME_WIDTH`, `GAME_HEIGHT`, `XP_REWARDS`, `QUIZ_TYPES`)
- State variables: camelCase (`playerState`, `currentScreen`, `quizState`)
- Configuration objects: camelCase (`gameConfig`, `persistConfig`, `bgUrl`)
- Style objects: camelCase (`pixelBtnGold`, `fullScreenBg`, `styles`)

**Types:**
- Redux state slices: camelCase (`player`, `vocabulary`, `ui`, `quests`)
- Redux action types: Implicit in RTK `createSlice` (e.g., `player/setName`)
- Quiz types: kebab-case strings (`'ar-to-en'`, `'en-to-ar'`, `'en-to-type-ar'`, `'listen'`, `'match'`)
- Zone identifiers: kebab-case strings (`'oasis_village'`, `'simple-thobe'`, `'body-simple-thobe'`)

## Code Style

**Formatting:**
- No explicit formatter configured (no .prettierrc, eslint, or biome.json)
- Code uses consistent spacing with 2-space indentation (inferred)
- JavaScript spread operator used extensively (`{ ...pixelBtn }`, `...distractors.map()`)
- Object destructuring for imports: `import { useState, useEffect } from 'react'`

**Linting:**
- No linter configuration detected
- Console methods used for warnings/errors: `console.error()`, `console.warn()`
- Error logging follows pattern: `console.error('[ServiceName] Message:', error)`
- Logging prefixed with service/component name in brackets: `[ErrorBoundary]`, `[AudioManager]`

## Import Organization

**Order:**
1. External packages (React, Redux, third-party)
2. Internal modules (services, store, utils, components)
3. Data files (JSON imports)
4. Styles and theme constants

**Examples:**
```javascript
// From App.jsx - standard import order
import { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setScreen, openDialogue, ... } from './store/slices/uiSlice.js';
import { audioManager } from '../../services/audio.js';
import { COLORS, FONTS, pixelBtnGold } from '../../styles/theme.js';

// From MainMenu.jsx - with data imports
import { getDueCards } from '../../services/fsrs.js';
import { audioManager } from '../../services/audio.js';
import { COLORS, FONTS, ... } from '../../styles/theme.js';
```

**Path Aliases:**
- No path aliases configured
- Relative paths used throughout: `../../services/audio.js`, `../store/store.js`

## Error Handling

**Patterns:**
- Try-catch not heavily used in source code
- Error boundary pattern for React component errors: `ErrorBoundary.jsx` wraps sections with try-catch logic at class component level
- Graceful degradation approach: missing audio files trigger `console.warn()` but don't throw (`audio.js` lines 174-175, 192-193)
- Fallback values for missing data: `dueCount = 0` on error (`MainMenu.jsx` lines 64-68)
- Safe property access with optional chaining: `errorInfo?.componentStack`, `qd?.title`, `zone?.entries`

**Error Recovery:**
- ErrorBoundary provides "Try Again" and "Return to Menu" buttons
- Audio manager silently continues if file doesn't exist (non-blocking)
- Quiz safely handles missing words: returns empty array if not found
- Phaser config fallback: uses generic 'player' texture if specific outfit texture doesn't exist (`Player.js` line 66)

## Logging

**Framework:** Native `console` object (no logging library)

**Patterns:**
- Error logs use `console.error()` with context prefix
- Warning logs use `console.warn()` for non-critical issues like missing assets
- Format: `console.error('[ContextName] Message:', error)`
- Log context examples:
  - `[ErrorBoundary]` for component errors
  - `[AudioManager]` for audio file loading issues
  - Emitted from Phaser scenes: `console.error('Unknown zone: ${zoneName}')`

**When to log:**
- Asset loading failures (audio, textures)
- Unrecoverable component render errors
- Zone configuration errors
- No logging for normal application flow (quiz answers, NPC interactions)

## Comments

**When to Comment:**
- Complex algorithms: XP threshold calculations in `playerSlice.js` have comments explaining level progression
- Non-obvious logic: Diacritic normalization regex documented inline
- Large blocks of functionality: Redux slice comments explain persisted vs non-persisted state (`store.js` line 14-15)
- Function purpose: Class methods include JSDoc-style comments explaining behavior

**JSDoc/TSDoc:**
- Not systematically used across codebase
- Found selectively in service classes and complex functions
- Example from `audio.js`:
  ```javascript
  /**
   * Play ambient loop for a zone with crossfade.
   * Current ambient fades out over 500ms, new one fades in over 500ms.
   * @param {string} zoneName - e.g. "oasis", "market", "desert"
   */
  playAmbient(zoneName) { ... }
  ```
- Example from `Player.js`:
  ```javascript
  /**
   * Player sprite with 2-layer compositing (body + head covering).
   * [detailed explanation of spritesheet layout]
   */
  ```

## Function Design

**Size:**
- Small focused functions: most utility functions 1-10 lines (e.g., `stripDiacritics()`, `isArabic()`)
- Medium components: 20-50 lines for stateless UI components
- Large components: 100+ lines for screens with complex event handling (e.g., `App.jsx` ~475 lines)
- Hook size: 25-50 lines typical (e.g., `useQuiz()` 186 lines, `useAudio()` 31 lines)

**Parameters:**
- Destructuring in function signatures: `export default function MainMenu({ onStartGame, onAlphabet, ... })`
- Object parameters for related data: Redux dispatch payloads like `{ itemId, equipped }`
- Callback props passed as handler functions: `onAnswer`, `onComplete`, `onBack`

**Return Values:**
- Components return JSX (React.ReactElement)
- Hooks return object with methods/state: `{ quiz, feedback, start, answer, next, close }`
- Services return singleton objects or Howl instances
- Utility functions return primitives: boolean, string, number, array
- Redux selectors return state slices

## Module Design

**Exports:**
- Components: default export as PascalCase function or class
- Constants: named exports (e.g., `export const GAME_WIDTH = 1280`)
- Utilities: named exports for helper functions (e.g., `export function stripDiacritics()`)
- Redux: default export for reducer, named exports for actions
- Services: singleton instance exports (e.g., `export const audioManager = new AudioManager()`)

**Patterns from files:**
```javascript
// Component export (App.jsx)
export default function App() { ... }

// Utility exports (arabicUtils.js)
export function stripDiacritics(text) { ... }
export function isArabic(text) { ... }
export function arabicEquals(a, b) { ... }

// Redux slice (playerSlice.js)
export const { setName, setSkinTone, ... } = playerSlice.actions;
export default playerSlice.reducer;

// Service singleton (audio.js)
export const audioManager = new AudioManager();

// Configuration constants (config.js)
export const GAME_WIDTH = 1280;
export const gameConfig = { ... };
```

**Barrel Files:**
- Not used in this codebase
- Imports always reference specific files directly: `from './store/slices/uiSlice.js'`

## Architecture Patterns

**State Management:**
- Redux with Redux Toolkit for centralized state
- Redux Persist for persistence of game progress
- Non-persisted UI state separated from game state
- Slices: player, vocabulary, quests, npc, alphabet, settings (persisted); ui, sync (transient)

**Event Communication:**
- EventBus singleton (`utils/eventBus.js`) for Phaser → React communication
- Phaser emits events: `'npc-interact'`, `'zone-change'`, `'open-quiz'`, `'check-zone-unlock'`, `'sfx-*'`
- React listens and dispatches Redux actions or triggers transitions

**Service Layer:**
- Singleton pattern for services: `audioManager`, `EventBus`
- Services encapsulate domain logic: audio playback, FSRS spaced repetition, API calls
- Services accessed by components via hooks or direct import

**Component Structure:**
- Screen components map to UI states: `MainMenu`, `CharacterCreation`, `AlphabetModule`
- Overlay components: `DialogueOverlay`, `QuizOverlay`, `SignOverlay` conditional rendered on game screen
- HUD component: persistent UI bar on game screen

---

*Convention analysis: 2026-02-07*
