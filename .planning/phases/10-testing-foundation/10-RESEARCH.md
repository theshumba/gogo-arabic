# Phase 10: Testing Foundation - Research

**Researched:** 2026-02-09
**Domain:** JavaScript testing stack (Vitest, Playwright, React Testing Library, Supertest)
**Confidence:** HIGH

## Summary

Phase 10 establishes comprehensive test coverage across all architectural layers before refactoring work begins. The codebase already has Vitest 3.0, Playwright 1.58, and React Testing Library 16.0 configured, with minimal test coverage (2 Redux slices, 1 component, 3 utilities, 1 smoke E2E). The testing foundation must cover 12 Redux slices (1,806 total LOC), 2 middleware files, 55+ React components, 6 Phaser game systems, and 6 backend routes. Current gaps include: no backend tests (supertest/mongodb-memory-server not installed), no Phaser system tests, no middleware tests, and no E2E tests for critical flows beyond smoke tests.

The standard stack leverages Vitest for unit/integration tests (10-20x faster than Jest on large codebases), Playwright for E2E (auto-waiting, cross-browser), React Testing Library with user-event for component interaction, and supertest + mongodb-memory-server for backend API tests. Key architectural challenge: testing Phaser systems requires scene mocks and direct Redux store reads (Phaser can't use React hooks). EventBus cleanup in test teardown is critical to prevent listener leaks across tests.

**Primary recommendation:** Layer testing as unit (Redux slices, utilities, Phaser logic) → integration (middleware chains, component + Redux) → E2E (critical flows). Mock Phaser/Howler at setup, use MSW for API mocks in component tests, and enforce 80% coverage thresholds with per-file overrides for complex systems. Run tests serially when using mongodb-memory-server to prevent multiple instances.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vitest | ^3.0.0 | Unit/integration test runner | Vite-native, 10-20x faster than Jest, ESM/JSX support built-in, browser mode for React components |
| React Testing Library | ^16.0.0 | Component testing | Official React team recommendation, focuses on user behavior not implementation, accessible queries improve tests + a11y |
| @testing-library/user-event | ^14.0.0 | User interaction simulation | Simulates full interaction sequences (keydown → keyup → change), more realistic than fireEvent |
| Playwright | ^1.58.2 | E2E testing | Auto-waiting reduces flakiness, cross-browser (Chrome/Safari/Firefox/Edge), stable and fast in 2026 |
| supertest | ^7.0.0+ | HTTP assertion library | Express integration test standard, fluent API for request/response validation |
| mongodb-memory-server | ^10.0.0+ | In-memory MongoDB | Isolated test databases, no external dependencies, fast setup/teardown |
| @vitest/coverage-v8 | ^3.0.0 | Code coverage | V8 native coverage provider, accurate branch/statement tracking |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/jest-dom | ^6.0.0 | Custom matchers | Already installed, provides `.toBeInTheDocument()`, `.toHaveAttribute()` etc. |
| jsdom | ^25.0.0 | DOM implementation | Already installed, required for Vitest browser environment |
| Mock Service Worker (MSW) | ^2.0.0+ | API mocking | Recommended for component tests that make HTTP requests (intercepts at network level) |
| happy-dom | Alternative to jsdom | Alternative DOM | Faster than jsdom, consider if test suite grows slow (not needed yet) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vitest | Jest | Jest is slower (no Vite integration), but has wider ecosystem support. Stick with Vitest for Vite projects. |
| Playwright | Cypress | Cypress has better DX/debugging UI, but Playwright has better cross-browser support and is faster in CI. |
| supertest | fetch + vitest | Supertest provides cleaner API, middleware integration, and cookie/session handling out of box. |
| mongodb-memory-server | Real MongoDB | Real DB is slower, requires external setup, but is 100% accurate. Use in-memory for unit/integration, real DB for staging. |

**Installation:**
```bash
# Frontend tests (already installed)
npm install --save-dev vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom playwright

# Backend tests (NEW - needs installation)
cd server
npm install --save-dev vitest supertest mongodb-memory-server

# Optional: MSW for component API mocking (NEW)
npm install --save-dev msw@latest
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── test/
│   ├── setup.js                    # Global setup (Howler, Phaser mocks)
│   ├── testUtils.jsx               # renderWithProviders, createTestStore
│   └── factories/                  # Test data factories (NEW)
│       ├── playerFactory.js
│       ├── questFactory.js
│       └── vocabularyFactory.js
├── store/
│   ├── slices/
│   │   ├── playerSlice.js
│   │   └── __tests__/
│   │       └── playerSlice.test.js # Colocated with slice
│   └── middleware/
│       ├── achievementMiddleware.js
│       └── __tests__/
│           └── achievementMiddleware.test.js
├── components/
│   ├── HUD/
│   │   ├── HUD.jsx
│   │   └── __tests__/
│   │       └── HUD.test.jsx        # Colocated with component
│   └── NPC/
│       ├── DialogueOverlay.jsx
│       └── __tests__/
│           └── DialogueOverlay.test.jsx
├── game/
│   └── systems/
│       ├── NPCManager.js
│       └── __tests__/
│           └── NPCManager.test.js  # Phaser system tests
├── utils/
│   ├── eventBus.js
│   └── __tests__/
│       └── eventBus.test.js
└── services/
    └── __tests__/
        └── fsrs.test.js            # Already exists

server/
├── src/
│   ├── routes/
│   │   ├── auth.js
│   │   └── __tests__/
│   │       └── auth.test.js        # Backend API tests (NEW)
│   ├── controllers/
│   │   └── __tests__/              # (NEW)
│   └── models/
│       └── __tests__/              # (NEW)
└── test/
    ├── setup.js                    # mongodb-memory-server setup (NEW)
    └── helpers.js                  # JWT/auth helpers (NEW)

e2e/
├── smoke.spec.js                   # Already exists
├── auth.spec.js                    # (NEW)
├── review-session.spec.js          # (NEW)
├── quest-completion.spec.js        # (NEW)
├── shop-purchase.spec.js           # (NEW)
└── fast-travel.spec.js             # (NEW)
```

### Pattern 1: Redux Slice Unit Tests (Reducers + Selectors)
**What:** Test reducers with plain action objects, test selectors with mock state
**When to use:** All 12 Redux slices (10 untested currently)
**Example:**
```javascript
// Source: Existing playerSlice.test.js (lines 95-125)
import { describe, it, expect, beforeEach } from 'vitest';
import playerReducer, { addXP, selectPlayerStats } from '../slices/playerSlice.js';

describe('playerSlice', () => {
  let initialState;

  beforeEach(() => {
    initialState = playerReducer(undefined, { type: 'unknown' });
  });

  describe('addXP', () => {
    it('should level up when XP threshold is reached', () => {
      const state = playerReducer(initialState, addXP(100));
      expect(state.xp).toBe(100);
      expect(state.level).toBe(2);
    });

    it('should update xpToNextLevel after leveling', () => {
      const state = playerReducer(initialState, addXP(100));
      expect(state.xpToNextLevel).toBe(250); // Level 3 threshold
    });
  });

  describe('selectors', () => {
    it('selectPlayerStats should return player stats', () => {
      const mockState = {
        player: { level: 5, xp: 700, xpToNextLevel: 1000, streak: 3, dirhams: 150, wordsLearned: 25 }
      };
      const stats = selectPlayerStats(mockState);
      expect(stats).toEqual({ level: 5, xp: 700, xpToNextLevel: 1000, streak: 3, dirhams: 150, wordsLearned: 25 });
    });
  });
});
```

### Pattern 2: Redux Middleware Integration Tests (Action Sequences)
**What:** Dispatch real actions to a test store with middleware, assert side effects
**When to use:** achievementMiddleware, dailyGoalsMiddleware
**Example:**
```javascript
// Source: Redux docs + existing middleware patterns
import { describe, it, expect, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { achievementMiddleware } from '../middleware/achievementMiddleware.js';
import achievementReducer, { unlockAchievement } from '../slices/achievementSlice.js';
import playerReducer, { incrementWordsLearned, addXP } from '../slices/playerSlice.js';
import vocabularyReducer from '../slices/vocabularySlice.js';

describe('achievementMiddleware', () => {
  function createTestStoreWithMiddleware() {
    return configureStore({
      reducer: {
        player: playerReducer,
        achievements: achievementReducer,
        vocabulary: vocabularyReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(achievementMiddleware),
    });
  }

  it('should unlock achievement and award XP when words learned threshold is met', () => {
    const store = createTestStoreWithMiddleware();

    // Set up state where player has 9 words learned (threshold is 10)
    for (let i = 0; i < 9; i++) {
      store.dispatch(incrementWordsLearned());
    }

    const beforeXP = store.getState().player.xp;
    const beforeAchievements = Object.keys(store.getState().achievements.unlockedAchievements);

    // Trigger the 10th word
    store.dispatch(incrementWordsLearned());

    const afterState = store.getState();

    // Should unlock the "First 10 Words" achievement
    expect(afterState.achievements.unlockedAchievements).toHaveProperty('first_10_words');

    // Should award XP (achievement xpReward)
    expect(afterState.player.xp).toBeGreaterThan(beforeXP);
  });
});
```

### Pattern 3: Component Integration Tests (Component + Redux)
**What:** Render component with real Redux store, simulate user interactions, assert UI updates
**When to use:** HUD, DialogueOverlay, QuizOverlay, PauseMenu, DailyDashboard, WorldMap, PlayerProfile
**Example:**
```javascript
// Source: Existing HUD.test.jsx (lines 228-235) + React Testing Library docs
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../test/testUtils.jsx';
import userEvent from '@testing-library/user-event';
import HUD from '../HUD.jsx';

describe('HUD Component', () => {
  it('should call onMenu when Menu button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnMenu = vi.fn();

    renderWithProviders(<HUD onMenu={mockOnMenu} />);

    const menuButton = screen.getByLabelText(/open menu/i);
    await user.click(menuButton);

    expect(mockOnMenu).toHaveBeenCalledTimes(1);
  });

  it('should open quest log when Quests button is clicked', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<HUD />);

    const questsButton = screen.getByLabelText(/quest log/i);
    await user.click(questsButton);

    const state = store.getState();
    expect(state.ui.dialogueOpen).toBe(true);
    expect(state.ui.dialogueConfig.type).toBe('quest-log');
  });
});
```

### Pattern 4: Phaser System Unit Tests (Scene Mocks)
**What:** Mock Phaser.Scene, test game logic without rendering
**When to use:** NPCManager, PlayerController, MapLoader, DOMOverlay, InteractableManager, ZoneTransition
**Example:**
```javascript
// Source: Phaser forum discussions + existing codebase patterns
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NPCManager } from '../NPCManager.js';
import { store } from '../../../store/store.js';

// Mock Phaser
vi.mock('phaser', () => ({
  default: {
    Math: {
      Distance: {
        Between: vi.fn((x1, y1, x2, y2) => {
          const dx = x2 - x1;
          const dy = y2 - y1;
          return Math.sqrt(dx * dx + dy * dy);
        })
      }
    },
    Input: {
      Keyboard: {
        JustDown: vi.fn()
      }
    }
  }
}));

describe('NPCManager', () => {
  let mockScene;
  let npcManager;

  beforeEach(() => {
    mockScene = {
      physics: {
        add: {
          collider: vi.fn()
        }
      },
      time: {
        delayedCall: vi.fn()
      }
    };

    npcManager = new NPCManager(mockScene);
  });

  it('should create NPCs from config', () => {
    const npcConfigs = [
      { id: 'npc_001', x: 10, y: 15, key: 'merchant', name: 'Ali', nameArabic: 'علي' }
    ];

    const mockPlayer = { x: 640, y: 640 };
    const mockWalls = {};
    const mockDOMOverlay = {
      createNpcLabel: vi.fn(),
      createInteractionPrompt: vi.fn()
    };

    npcManager.create(npcConfigs, mockPlayer, mockWalls, mockDOMOverlay);

    expect(npcManager.npcs).toHaveLength(1);
    expect(mockDOMOverlay.createNpcLabel).toHaveBeenCalledWith(
      'npc_001', 640, 960, 'علي', 'Ali'
    );
  });

  it('should detect when player is in interaction range', () => {
    // Test proximity detection logic
    const npcConfigs = [{ id: 'npc_001', x: 10, y: 10, key: 'merchant', name: 'Ali', nameArabic: 'علي' }];
    const mockPlayer = { x: 640, y: 640 }; // 10 tiles * 64px = 640px
    const mockDOMOverlay = {
      createNpcLabel: vi.fn(),
      createInteractionPrompt: vi.fn(),
      setVisible: vi.fn(),
      updatePosition: vi.fn()
    };

    npcManager.create(npcConfigs, mockPlayer, {}, mockDOMOverlay);

    const interactKey = {};
    npcManager.update(mockPlayer, mockDOMOverlay, interactKey, false, vi.fn());

    // Player is at same position as NPC, should be in range (INTERACT_RANGE = 128)
    expect(mockDOMOverlay.setVisible).toHaveBeenCalledWith('prompt-npc_001', true);
  });
});
```

### Pattern 5: Backend API Integration Tests (Supertest + MongoDB Memory)
**What:** Spin up in-memory MongoDB, test Express routes with real DB operations
**When to use:** All 6 backend routes (auth, user, shop, quest, review, game)
**Example:**
```javascript
// Source: AppSignal blog, Medium articles on supertest + mongodb-memory-server
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../server.js'; // Export app without calling listen()
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

describe('Auth Routes', () => {
  let mongoServer;
  let authToken;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear all collections between tests
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('POST /api/auth/register', () => {
    it('should create a new user and return JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          playerName: 'TestPlayer'
        })
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');

      // Verify user was created in DB
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
    });

    it('should reject duplicate email', async () => {
      // Create first user
      await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'Pass123!',
        playerName: 'Player1'
      });

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Pass456!',
          playerName: 'Player2'
        })
        .expect(400);

      expect(response.body.error).toMatch(/already exists/i);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user before each login test
      await request(app).post('/api/auth/register').send({
        email: 'login@example.com',
        password: 'LoginPass123!',
        playerName: 'LoginPlayer'
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'LoginPass123!'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'login@example.com');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword!'
        })
        .expect(401);

      expect(response.body.error).toMatch(/invalid credentials/i);
    });
  });
});
```

### Pattern 6: E2E Critical User Flows (Playwright)
**What:** Test full user journeys across multiple pages with real backend
**When to use:** Auth, review session, quest completion, shop purchase, fast travel
**Example:**
```javascript
// Source: Playwright docs + BrowserStack best practices
import { test, expect } from '@playwright/test';

test.describe('Review Session Flow', () => {
  test('user can complete a review session and earn XP', async ({ page }) => {
    // Navigate to app
    await page.goto('/');

    // Assume character already created (or create one)
    await page.getByRole('button', { name: /continue/i }).click();

    // Navigate to review from dashboard
    await page.getByRole('button', { name: /start review/i }).click();

    // Wait for quiz overlay to appear
    await expect(page.getByText(/review session/i)).toBeVisible();

    // Answer first question (assume it's multiple choice)
    const choices = page.getByRole('button', { name: /^[A-D]\./ });
    await choices.first().click();

    // Continue through session (assume 5 words)
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: /next/i }).click();
      const choices = page.getByRole('button', { name: /^[A-D]\./ });
      await choices.first().click();
    }

    // Complete session
    await page.getByRole('button', { name: /finish/i }).click();

    // Verify results screen
    await expect(page.getByText(/session complete/i)).toBeVisible();

    // Verify XP was awarded
    const xpText = await page.getByText(/\+\d+ XP/i).textContent();
    expect(xpText).toMatch(/\+\d+ XP/);

    // Close results
    await page.getByRole('button', { name: /close|continue/i }).click();

    // Verify back to game
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('review session handles incorrect answers', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('button', { name: /start review/i }).click();

    // Intentionally select wrong answer (last choice)
    const choices = page.getByRole('button', { name: /^[A-D]\./ });
    await choices.last().click();

    // Should show feedback (wrong answer indicator)
    await expect(page.getByText(/incorrect|try again/i)).toBeVisible();

    // Move to next question
    await page.getByRole('button', { name: /next/i }).click();

    // Verify session continues
    await expect(page.getByText(/review session/i)).toBeVisible();
  });
});
```

### Pattern 7: EventBus Cleanup in Tests
**What:** Remove all EventBus listeners in afterEach to prevent cross-test contamination
**When to use:** Global test teardown for components using EventBus
**Example:**
```javascript
// Source: EventBus implementation + memory leak prevention practices
import { afterEach, vi } from 'vitest';
import { EventBus } from '../utils/eventBus.js';

// In src/test/setup.js
afterEach(() => {
  // Clear all EventBus listeners after each test
  EventBus.removeAllListeners();

  // Reset all vi.fn() mocks
  vi.clearAllMocks();
});

// In component tests that use EventBus
import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '../../utils/eventBus.js';

describe('Component with EventBus', () => {
  it('should emit event on interaction', () => {
    const emitSpy = vi.spyOn(EventBus, 'emit');

    // ... render component, trigger action ...

    expect(emitSpy).toHaveBeenCalledWith('event-name', payload);

    // Cleanup is handled by global afterEach
  });
});
```

### Anti-Patterns to Avoid
- **Testing implementation details:** Don't test internal state, component methods, or private functions. Test user-visible behavior and outcomes.
- **Mocking Redux hooks/selectors:** Don't mock `useSelector` or selector functions. Use real Redux store with `renderWithProviders`.
- **Shallow rendering:** Don't use shallow rendering. React Testing Library forces integration testing, which is better.
- **Snapshot testing:** Avoid snapshots for UI (they're brittle). Use semantic queries and assertions instead.
- **Testing libraries, not code:** Don't test that Redux Toolkit works. Test your reducers/actions/selectors.
- **Over-mocking in E2E:** Don't mock backend in E2E tests. Use real server or staging environment.
- **Ignoring async cleanup:** Don't forget to cleanup EventBus listeners, timers, and subscriptions.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Test data factories | Manual test state objects | Factory functions (createTestPlayer, createTestQuest) | State objects have 15+ fields, easy to miss required fields, factories ensure valid defaults |
| Scene mocking for Phaser | Full Phaser.Scene mock with all methods | Minimal mock with only used methods + vi.fn() for others | Phaser.Scene has 100+ methods, only 5-10 used per test, over-mocking wastes time |
| MongoDB test setup | Custom in-memory DB or Docker | mongodb-memory-server | Handles setup/teardown, port conflicts, data isolation automatically |
| HTTP request testing | Manual fetch + assertions | supertest | Handles cookies, sessions, multipart, error cases, status codes elegantly |
| User interaction | fireEvent | @testing-library/user-event | fireEvent only triggers single event, user-event simulates full interaction sequence (keydown → keypress → keyup → change) |
| Coverage reporting | Manual istanbul setup | @vitest/coverage-v8 | Vite-integrated, zero config, glob-based thresholds, auto-update feature |
| API mocking | Custom fetch interceptors | Mock Service Worker (MSW) | MSW intercepts at network level, works in tests + browser, type-safe handlers |
| Test utilities | Inline Provider wrappers | Centralized `renderWithProviders`, `createTestStore` | Reduces boilerplate, ensures consistent setup, easier to update globally |

**Key insight:** Testing infrastructure is deceptively complex. Factories prevent test data drift, proper mocking reduces test brittleness, and standard utilities make tests maintainable. Don't hand-roll what the ecosystem has debugged for years.

## Common Pitfalls

### Pitfall 1: EventBus Listener Leaks Across Tests
**What goes wrong:** Tests fail with "MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 listeners added."
**Why it happens:** EventBus is a singleton Phaser.Events.EventEmitter shared across tests. Components add listeners in useEffect but tests don't cleanup between runs. Listener count grows: test1=2, test2=4, test3=6... → warning at 11.
**How to avoid:** Add global `afterEach(() => EventBus.removeAllListeners())` to `src/test/setup.js`. Ensures clean slate for each test.
**Warning signs:** Intermittent failures, "possible memory leak" warnings, tests pass individually but fail when run together.

### Pitfall 2: Multiple mongodb-memory-server Instances
**What goes wrong:** Tests fail with "Port 27017 already in use" or hang indefinitely.
**Why it happens:** Parallel test execution starts multiple in-memory MongoDB instances. Each tries to bind to random port, but cleanup races cause port conflicts.
**How to avoid:** Run backend tests serially with `vitest --run --no-threads` or set `poolOptions: { threads: { singleThread: true } }` in vitest.config.js for server tests. Start MongoMemoryServer in global setup, share instance across tests.
**Warning signs:** Tests timeout, port conflict errors, "EADDRINUSE" errors.

### Pitfall 3: Phaser Scene State Persists Between Tests
**What goes wrong:** Second test using Phaser scene fails because first test's scene is still running.
**Why it happens:** Phaser.Game instance not destroyed after test. Scene.update() keeps running, events fire, state mutates.
**How to avoid:** Mock Phaser.Game in `src/test/setup.js` with no-op destroy(). Don't create real Phaser instances in unit tests. Use scene mocks with manual cleanup in `afterEach`.
**Warning signs:** Tests fail when run in sequence but pass individually, "scene is already running" errors.

### Pitfall 4: Testing Reducers with Immer-Mutated State
**What goes wrong:** Test expects state to be immutable, but reducer uses Immer (Redux Toolkit default). Assertion `expect(state).not.toBe(initialState)` fails because Immer returns draft proxy.
**Why it happens:** Redux Toolkit reducers use Immer for "mutable" updates that become immutable. Test code expects vanilla objects.
**How to avoid:** Don't test for reference equality on RTK reducers. Test field values: `expect(state.level).toBe(2)`. Use `JSON.parse(JSON.stringify(state))` if you need plain object.
**Warning signs:** Tests fail with "expected objects to not be equal", Immer draft objects in console logs.

### Pitfall 5: Component Tests Missing Router Context
**What goes wrong:** Component test fails with "useNavigate() may only be used in context of Router".
**Why it happens:** Component uses `useNavigate`, `useParams`, or `Link`, but test renders without `<MemoryRouter>`.
**How to avoid:** `renderWithProviders` already wraps in MemoryRouter (line 70 of testUtils.jsx). Use it for all component tests. Pass `route` option to set initial URL: `renderWithProviders(<Component />, { route: '/game/map' })`.
**Warning signs:** "may only be used in context of Router" errors, "Cannot read property 'pathname' of undefined".

### Pitfall 6: Coverage Excludes Tested Files
**What goes wrong:** Coverage report shows 0% despite having tests.
**Why it happens:** `vitest.config.js` excludes directories with `coverage.exclude: ['src/game/**']` (line 16). Tests exist but coverage tool skips them.
**How to avoid:** Review `coverage.include` and `coverage.exclude` config. Remove `src/game/**` exclusion for Phase 10. Use glob-based per-file thresholds for complex files: `thresholds: { 'src/game/**': { lines: 60 } }`.
**Warning signs:** Coverage shows 0% for tested files, files missing from coverage report.

### Pitfall 7: Async State Updates in Component Tests
**What goes wrong:** Test checks for UI update immediately after action, assertion fails: "Expected element to be visible, received: not found".
**Why it happens:** Redux action triggers async middleware (e.g., achievement unlock), React batches state updates, DOM updates on next tick. Test assertion runs before update completes.
**How to avoid:** Use `await waitFor(() => expect(...).toBeVisible())` from @testing-library/react. Use `await user.click()` (user-event is async). Don't use `fireEvent` (synchronous).
**Warning signs:** Intermittent failures, "not found" errors, adding `setTimeout` "fixes" test.

### Pitfall 8: Hardcoded Date/Time in Tests
**What goes wrong:** Streak tests fail on different days: `expect(streak).toBe(1)` fails when last played date is "yesterday".
**Why it happens:** `updateStreak` reducer uses `new Date().toDateString()` (playerSlice line 173). Test relies on wall-clock time.
**How to avoid:** Mock `Date` in tests: `vi.setSystemTime(new Date('2026-02-09'))`, or inject date as dependency. Use factories with explicit dates: `createPlayerState({ lastPlayedDate: '2026-02-08' })`.
**Warning signs:** Tests pass locally, fail in CI, fail at midnight, "expected 1 got 0" on date-related assertions.

## Code Examples

Verified patterns from official sources:

### Testing RTK Middleware with configureStore
```javascript
// Source: https://redux.js.org/usage/writing-tests
import { configureStore } from '@reduxjs/toolkit';
import { achievementMiddleware } from '../middleware/achievementMiddleware';
import achievementReducer from '../slices/achievementSlice';
import playerReducer from '../slices/playerSlice';

function setupStoreWithMiddleware(preloadedState) {
  return configureStore({
    reducer: {
      achievements: achievementReducer,
      player: playerReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(achievementMiddleware),
    preloadedState,
  });
}

// Test that middleware dispatches side-effect actions
it('unlocks achievement when threshold met', () => {
  const store = setupStoreWithMiddleware();
  store.dispatch(incrementWordsLearned());

  const state = store.getState();
  expect(state.achievements.unlockedAchievements).toHaveProperty('first_word');
});
```

### Using userEvent for Realistic Interactions
```javascript
// Source: https://testing-library.com/docs/user-event/intro/
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

it('handles text input with full event sequence', async () => {
  const user = userEvent.setup(); // Always call setup() first

  render(<SearchInput />);

  const input = screen.getByRole('textbox');

  // Types character by character, fires keydown/keyup/change for each
  await user.type(input, 'مرحبا');

  expect(input).toHaveValue('مرحبا');
});

it('handles keyboard shortcuts', async () => {
  const user = userEvent.setup();
  render(<DialogueOverlay />);

  // Simulates full key press (keydown → keyup)
  await user.keyboard('{Escape}');

  expect(screen.queryByText(/dialogue/i)).not.toBeInTheDocument();
});
```

### Coverage Thresholds with Glob Patterns
```javascript
// Source: https://vitest.dev/config/coverage
// vitest.config.js
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/test/**', 'src/data/**'],

      // Global thresholds (applies to all files not matched by glob)
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,

        // Per-file/glob overrides
        'src/game/**/*.js': {
          lines: 60,  // Phaser systems harder to test
          branches: 50,
        },
        'src/components/**/*.jsx': {
          lines: 85,  // Components easier to test
          functions: 85,
        },
      },

      // Auto-update thresholds when coverage improves
      autoUpdate: true,
    },
  },
});
```

### MongoDB Memory Server Setup
```javascript
// Source: https://blog.appsignal.com/2025/06/18/testing-mongodb-in-node-with-the-mongodb-memory-server.html
// server/test/setup.js
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

export async function setupTestDB() {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}

export async function teardownTestDB() {
  await mongoose.disconnect();
  await mongoServer.stop();
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

// In vitest.config.js (server)
export default defineConfig({
  test: {
    globalSetup: './test/setup.js',
    poolOptions: {
      threads: {
        singleThread: true, // Prevent multiple MongoDB instances
      },
    },
  },
});
```

### Playwright Page Object Pattern
```javascript
// Source: https://playwright.dev/ + BrowserStack best practices
// e2e/pages/ReviewPage.js
export class ReviewPage {
  constructor(page) {
    this.page = page;
    this.startButton = page.getByRole('button', { name: /start review/i });
    this.choiceButtons = page.getByRole('button', { name: /^[A-D]\./ });
    this.nextButton = page.getByRole('button', { name: /next/i });
    this.finishButton = page.getByRole('button', { name: /finish/i });
    this.resultsHeading = page.getByText(/session complete/i);
  }

  async start() {
    await this.startButton.click();
    await this.page.waitForSelector('text=/review session/i');
  }

  async answerQuestion(choiceIndex = 0) {
    const choices = await this.choiceButtons.all();
    await choices[choiceIndex].click();
  }

  async completeSession(questionCount = 5) {
    for (let i = 0; i < questionCount - 1; i++) {
      await this.answerQuestion();
      await this.nextButton.click();
    }
    await this.answerQuestion();
    await this.finishButton.click();
  }

  async getXPAwarded() {
    const xpText = await this.page.getByText(/\+\d+ XP/i).textContent();
    const match = xpText.match(/\+(\d+) XP/);
    return match ? parseInt(match[1], 10) : 0;
  }
}

// e2e/review-session.spec.js
import { test, expect } from '@playwright/test';
import { ReviewPage } from './pages/ReviewPage';

test('complete review session and earn XP', async ({ page }) => {
  await page.goto('/');

  const reviewPage = new ReviewPage(page);
  await reviewPage.start();
  await reviewPage.completeSession(5);

  await expect(reviewPage.resultsHeading).toBeVisible();

  const xp = await reviewPage.getXPAwarded();
  expect(xp).toBeGreaterThan(0);
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Jest | Vitest | 2021-2022 | 10-20x faster test execution, native ESM/JSX, Vite integration |
| fireEvent | @testing-library/user-event v14 | 2022 | More realistic interactions, full event sequences, better async handling |
| Enzyme | React Testing Library | 2018-2019 | Focus on user behavior not implementation, better React 18+ support |
| Cypress | Playwright | 2020-2021 | Better cross-browser, faster, auto-waiting, no flake from network delays |
| Docker MongoDB | mongodb-memory-server | 2019 | No external dependencies, faster startup, isolated databases per test |
| coverage.provider: 'c8' | coverage.provider: 'v8' | Vitest 1.0 (2023) | Native V8 coverage, more accurate, better performance |
| Snapshot testing UI | Semantic assertions | 2019-2020 | Less brittleness, readable failures, tests describe intent |
| Redux mock store | Real store in tests | RTK 1.0 (2019) | Tests integration not mocks, catches middleware bugs, configureStore makes it easy |

**Deprecated/outdated:**
- **Jest for Vite projects:** Vitest is faster and requires zero config for Vite. Jest needs transforms, babel, slow startup.
- **fireEvent for user interactions:** user-event v14 simulates realistic interaction sequences. fireEvent only dispatches single event.
- **Shallow rendering (Enzyme):** Removed in React 18. RTL forces integration testing which catches more bugs.
- **redux-mock-store:** Don't mock Redux. Use real store with test middleware. RTK makes this trivial.
- **istanbul CLI for coverage:** Use @vitest/coverage-v8. Integrated, zero config, glob-based thresholds.

## Open Questions

1. **MSW Integration**
   - What we know: MSW recommended for API mocking in component tests. Intercepts at network level, works in browser + tests.
   - What's unclear: Should Phase 10 include MSW setup for component tests that call backend? Or defer to Phase 11 (refactoring)?
   - Recommendation: Include basic MSW setup if any component tests need it (DailyDashboard fetches data?). Otherwise defer. Flag in PLAN.md.

2. **Test Data Management Strategy**
   - What we know: 1,220 vocab words, 140 NPCs, 52 quests. Tests need realistic data. Factories prevent drift.
   - What's unclear: Should factories use real data files (`vocabularyAll.js`, `npcs.json`) or simplified fixtures? Trade-off: realism vs. test speed.
   - Recommendation: Use real data for integration/E2E. Use minimal fixtures for unit tests (5-10 words, 2-3 NPCs). Document in PLAN.md.

3. **Phaser Testing Depth**
   - What we know: 6 Phaser systems (NPCManager, PlayerController, etc.). Phaser is hard to unit test (rendering, physics).
   - What's unclear: What level of coverage is realistic for Phaser systems? 60%? 40%? Which parts to skip (rendering, collisions)?
   - Recommendation: Test business logic (proximity detection, quest markers, dialogue triggering). Mock physics/rendering. Aim for 50-60% coverage. E2E tests cover rendering.

4. **Backend Test Environment Variables**
   - What we know: Backend uses JWT_SECRET, DATABASE_URL from .env. Tests need test-specific config.
   - What's unclear: Should tests use .env.test? Hard-coded test values? process.env overrides in setup?
   - Recommendation: Use hard-coded test values in `server/test/setup.js` (`process.env.JWT_SECRET = 'test-secret'`). Don't rely on .env in tests.

5. **E2E Test Data Reset**
   - What we know: E2E tests hit real frontend + backend. Data persists in redux-persist localStorage.
   - What's unclear: Should E2E tests clear localStorage before each test? Use separate test user accounts? Run against clean DB?
   - Recommendation: Use Playwright's `storageState` to save/restore localStorage. Create test user in beforeEach, delete in afterEach. Use staging DB not prod.

## Sources

### Primary (HIGH confidence)
- [Redux Official Docs: Writing Tests](https://redux.js.org/usage/writing-tests) - Redux team recommendations for testing RTK apps
- [Vitest Coverage Config](https://vitest.dev/config/coverage) - Official coverage threshold documentation
- [React Testing Library: user-event](https://testing-library.com/docs/user-event/intro/) - Official user-event API and best practices
- [Playwright Official Docs](https://playwright.dev/) - E2E testing guide and API reference
- [AppSignal Blog: Testing MongoDB with Memory Server](https://blog.appsignal.com/2025/06/18/testing-mongodb-in-node-with-the-mongodb-memory-server.html) - 2025 guide to mongodb-memory-server

### Secondary (MEDIUM confidence)
- [OneUpTime Blog: Unit Test React with Vitest (2026-01-15)](https://oneuptime.com/blog/post/2026-01-15-unit-test-react-vitest-testing-library/view) - Recent Vitest + RTL best practices
- [BrowserStack: Playwright Best Practices (2026)](https://www.browserstack.com/guide/playwright-best-practices) - 15 best practices for Playwright testing
- [Medium: Testing Redux Middleware with RTK](https://prajnavantha.medium.com/testing-redux-middleware-and-mocking-apis-with-rtk-22e36d80df5f) - Middleware testing patterns
- [Medium: HTTP Tests with Vitest, MongoDB, Supertest](https://medium.com/@burzhuas/a-simple-guide-to-setting-up-http-level-tests-with-vitest-mongodb-and-supertest-1c5c90d22321) - Backend testing setup guide
- [DeviQA: Playwright E2E Guide (2025)](https://www.deviqa.com/blog/guide-to-playwright-end-to-end-testing-in-2025/) - Comprehensive E2E testing guide

### Tertiary (LOW confidence - community resources)
- [DEV Community: Testing Phaser with Vitest](https://dev.to/davidmorais/testing-phaser-games-with-vitest-3kon) - Phaser testing strategies (2022, needs verification)
- [Phaser Discourse: Mocking Scene Objects](https://phaser.discourse.group/t/mocking-or-using-scene-and-other-phaser-objects-in-unit-tests/2185) - Community discussion on Phaser mocks
- [cri.dev: EventEmitter Memory Leaks](https://cri.dev/posts/2020-07-16-How-to-fix-possible-EventEmitter-memory-leak-detected/) - Debugging EventEmitter leaks (2020, still relevant)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Vitest, RTL, Playwright, supertest are industry standard for this stack in 2026
- Architecture: HIGH - Patterns verified from official docs and existing codebase
- Pitfalls: MEDIUM-HIGH - Based on common issues in forums + existing test setup analysis

**Research date:** 2026-02-09
**Valid until:** 2026-04-09 (60 days - testing ecosystem stable, monthly Vitest/Playwright releases but no breaking changes expected)

**Codebase analysis:**
- Current test coverage: ~5% (2 slices, 1 component, 3 utilities, 1 E2E)
- Lines to test: ~8,000+ (1,806 in slices, 4,000+ in components, 2,000+ in game systems, backend unknown)
- Missing infrastructure: Backend testing (supertest, mongodb-memory-server), test factories, EventBus cleanup, Phaser mocks
- Strengths: renderWithProviders utility, good slice test examples, Playwright configured
- Weaknesses: No middleware tests, no component integration tests, game systems untested, no backend tests
