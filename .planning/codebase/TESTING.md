# Testing Patterns

**Analysis Date:** 2026-02-07

## Test Framework

**Runner:**
- Not detected
- No `jest.config.*`, `vitest.config.*`, or test runner configuration present

**Assertion Library:**
- Not detected
- No test files found in `/src` or `/server` source directories

**Run Commands:**
- Not configured
- package.json contains no test scripts

## Test File Organization

**Location:**
- Not applicable — no tests currently in codebase

**Naming:**
- Standard convention would be: `*.test.js`, `*.spec.js`, `*.test.jsx`, `*.spec.jsx`

**Structure:**
- Not established

## Test Coverage

**Current Status:**
- Zero test coverage — no test files in source

**Requirements:**
- Not enforced

## Critical Areas Without Tests

**High Priority (Core Game Logic):**

1. **Redux Store & Slices** (`src/store/slices/`)
   - Player state management: level progression, XP calculations, streaks
   - Vocabulary state: FSRS card management
   - Quest progression tracking
   - Files: `playerSlice.js`, `vocabularySlice.js`, `questSlice.js`

2. **Spaced Repetition System** (`src/services/fsrs.js`)
   - FSRS card review logic
   - Rating application and scheduling
   - File: `fsrs.js`

3. **Arabic Utility Functions** (`src/utils/arabicUtils.js`)
   - Diacritic stripping
   - Arabic character detection
   - Text normalization for quiz answers
   - Numeric conversion
   - File: `arabicUtils.js`

4. **Quiz Logic** (`src/hooks/useQuiz.js`)
   - Answer validation (accounting for diacritics)
   - Quiz session scoring
   - Distractor selection
   - FSRS integration on answer submission
   - File: `useQuiz.js`

**Medium Priority (Data Access):**

5. **Quiz Types & Selection** (`src/components/Quiz/`)
   - Correct answer detection by quiz type
   - Multiple quiz format handling: ar-to-en, en-to-ar, en-to-type-ar, listen, match
   - Files: `QuizOverlay.jsx`, `ArabicToEnglish.jsx`, `EnglishToArabic.jsx`, etc.

6. **Event Bus System** (`src/utils/eventBus.js`)
   - Event emission/listening
   - Phaser ↔ React communication
   - Files: `eventBus.js`

7. **Audio Manager** (`src/services/audio.js`)
   - Volume control and channel management
   - Ambient audio crossfade
   - SFX caching and playback
   - Pronunciation audio loading
   - Files: `audio.js`

**Lower Priority (UI):**

8. **Character Customization**
   - Outfit selection
   - Head covering selection
   - Skin tone application
   - Files: `CharacterCreation.jsx`, `Player.js` (sprite management)

## Why Testing is Absent

**Technical Reasons:**
- No test runner installed or configured
- No testing framework dependency in package.json
- No test infrastructure scripts

**Codebase Type:**
- Vite + React frontend with Phaser game
- Early-stage learning game (initial commit: Phase 0-3)
- Focus has been on feature delivery over test coverage

## Testing Recommendations

### Phase 1: Critical Unit Tests

**1. Arabic Utilities** (`src/utils/arabicUtils.js`)
```javascript
// Tests needed for:
// - stripDiacritics("مَرْحَبًا") → "مرحبا"
// - isArabic("hello") → false
// - isArabic("مرحبا") → true
// - arabicEquals("مَرْحَبًا", "مرحبا") → true
// - toArabicNumerals(123) → "١٢٣"
```

**2. XP Calculator** (`src/utils/xpCalculator.js`)
```javascript
// Tests needed for:
// - Reward amounts match PRD
// - XP thresholds are cumulative
// - Auto level-up logic in playerSlice
```

**3. FSRS Spaced Repetition** (`src/services/fsrs.js`)
```javascript
// Tests needed for:
// - createNewCard() initializes with correct defaults
// - reviewCard() applies correct scheduling
// - getDueCards() filters correctly
// - Rating enum usage
```

### Phase 2: Integration Tests

**1. Quiz Session Flow** (`src/hooks/useQuiz.js`)
```javascript
// Integration test: start → answer → next → close
// Verify:
// - Score increments correctly
// - FSRS cards update on answer
// - XP awarded on correct answers
// - Quiz completion triggers summary
```

**2. Player Progression** (playerSlice → quizFlow → Redux)
```javascript
// Verify:
// - Correct answers trigger XP gain
// - XP thresholds trigger level-up
// - Streak tracking works across sessions
// - Inventory management
```

**3. Event Bus Communication** (Phaser → React)
```javascript
// Verify:
// - NPC interaction triggers dialogue overlay
// - Zone change events fire correctly
// - Quiz events open overlay with correct config
```

### Recommended Test Setup

**Install (suggested):**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event
```

**Create config:** `vitest.config.js`
```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
});
```

**Add to package.json:**
```json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage"
}
```

### Files Without Test Considerations

**Phaser Game Code** (`src/game/`)
- Testing Phaser directly is complex (requires game loop mocking)
- Recommend integration tests via end-to-end testing (Playwright already installed)
- Focus on Redux state that feeds into Phaser initialization

**React Components** (`src/components/`)
- Simple stateless UI components need basic snapshot/render tests once framework is set up
- Redux-connected components testable via mock store
- Error Boundary already testable at component level

## Existing Testing Infrastructure

**E2E Testing:**
- Playwright installed in devDependencies (`^1.58.2`)
- No playwright configuration present (no `playwright.config.*`)
- Opportunity: add E2E tests for full game flows

**Current Test Output:**
- `/test-results/` directory exists but appears to be output destination only

---

*Testing analysis: 2026-02-07*
