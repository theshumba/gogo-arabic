# Architecture Research: v3.0 Infrastructure & Polish

**Domain:** Arabic Learning RPG - Testing, Refactoring, Backend Hardening, Visual Polish
**Researched:** 2026-02-08
**Confidence:** HIGH

## Executive Summary

GoGo Arabic v2.0 shipped 9 phases with a working React 19 + Phaser 3 + Redux + Express stack. v3.0 focuses on **infrastructure maturity** without major feature additions: comprehensive testing (~80% coverage), GameLayout refactoring (god component → manageable modules), backend hardening (rate limiting + validation already present, add tests + monitoring + security audit), and pixel art integration (sprites exist, need CSS polish + animations).

**Key insight:** Build order matters. Refactor GameLayout BEFORE writing tests for it. Harden backend BEFORE visual polish (polish increases attack surface). Test utilities exist but coverage is ~5% (11 test files, 27K LOC codebase).

## Current Architecture Analysis

### System Overview (v2.0)

```
┌─────────────────────────────────────────────────────────────────┐
│                      React 19 UI Layer                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │  MainMenu  │  │ GameLayout │  │  Dashboard │                 │
│  │            │  │  (608 LOC) │  │            │                 │
│  │ Lazy routes│  │ God Object │  │ Lazy routes│                 │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘                 │
│        │               │               │                         │
├────────┴───────────────┴───────────────┴─────────────────────────┤
│                   EventBus Bridge (Phaser)                       │
│         ← 20 event types, cleanup gaps, direct store access →    │
├─────────────────────────────────────────────────────────────────┤
│                    Phaser 3 Game Engine                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │ WorldScene │  │ PlayerCtrl │  │ NPCManager │                 │
│  │            │  │            │  │            │                 │
│  │ MapLoader  │  │ Collision  │  │ Dialogue   │                 │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘                 │
├────────┴───────────────┴───────────────┴─────────────────────────┤
│                 Redux Toolkit (12 slices)                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                   │
│  │player│ │vocab │ │quests│ │  ui  │ │goals │  + 7 more         │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                   │
├─────────────────────────────────────────────────────────────────┤
│                   Express 5 Backend                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  JWT httpOnly cookies + CSRF + rate limiting + Zod      │    │
│  │  6 route modules, 8 middleware, MongoDB + Mongoose      │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Current Component Breakdown

| Component | LOC | Responsibilities | Issues |
|-----------|-----|------------------|--------|
| **GameLayout.jsx** | 608 | Phaser mount, HUD, 9 overlays, EventBus listeners, wardrobe state, keyboard shortcuts, session tracking, 20 quest handlers | God component, hard to test, mixed concerns |
| **EventBus.js** | 13 | Phaser Events.EventEmitter wrapper | No cleanup utility, listeners can leak |
| **Redux Store** | 12 slices | State management, redux-persist, 2 middleware | Well-structured, needs tests |
| **Phaser Systems** | 5 files | PlayerController, NPCManager, InteractableManager, MapLoader, DOMOverlay | Can't use React hooks, read store directly |
| **Backend** | app.js + 6 routes | Auth, CORS, rate limiting, Zod validation, JWT cookies, CSRF | Hardened, missing tests |
| **CSS** | 25 CSS Modules + inline styles | Mixed paradigm, inconsistent | Needs consolidation |

### Data Flow Patterns

#### 1. Player Interaction → Redux Update
```
Player presses 'E' near NPC
    ↓
Phaser PlayerController detects collision
    ↓
EventBus.emit('npc-interact', { npcId, npcName })
    ↓
GameLayout useEffect listener catches event
    ↓
dispatch(openDialogue({ npcId, npcName }))
    ↓
DialogueOverlay renders (conditional in GameLayout)
```

**Problem:** GameLayout has 20+ EventBus listeners in one massive useEffect. Hard to test, easy to forget cleanup.

#### 2. Quiz Complete → Achievement Unlock
```
QuizOverlay: dispatch(completeQuiz({ result }))
    ↓
achievementMiddleware intercepts action
    ↓
Checks ACHIEVEMENTS.json requirements
    ↓
dispatch(unlockAchievement(id)) if met
    ↓
AchievementToast appears
```

**Pattern works well.** Middleware is testable, decoupled.

#### 3. Backend Sync (not yet implemented)
```
Frontend: dispatch(syncAction)
    ↓
API call to /api/v1/user/progress
    ↓
Backend: Zod validation, JWT auth, rate limit
    ↓
MongoDB update via Mongoose
    ↓
Response: syncReducer updates lastSyncTime
```

**Security:** JWT httpOnly cookies + CSRF tokens. Rate limiting: global 100 req/15min, auth 5 req/15min.

## v3.0 Architecture Refactoring Plan

### Phase 1: GameLayout Refactoring

**Goal:** Split 608-line god component into testable modules.

**New Structure:**
```
src/components/Router/
├── GameLayout.jsx                    # 150 LOC - orchestration only
├── GameLayout.module.css             # existing styles
├── hooks/
│   ├── useEventBusListeners.js       # EventBus setup/cleanup
│   ├── useQuestTracking.js           # Quest progress logic
│   ├── useSessionTracking.js         # Daily goals session timer
│   └── useGameKeyboard.js            # Keyboard shortcuts (M, L, Esc)
├── components/
│   ├── PauseMenu.jsx                 # Extract from GameLayout
│   ├── ActivitiesMenu.jsx            # Extract from GameLayout
│   └── GameOverlays.jsx              # Conditional overlay rendering
└── utils/
    └── questEventHandlers.js         # Pure functions for quest logic
```

**Migration Strategy:**
1. Extract hooks (no behavior change, just move code)
2. Verify build passes
3. Extract PauseMenu/ActivitiesMenu components
4. Verify build passes
5. Extract questEventHandlers pure functions
6. Write tests for extracted units
7. Commit refactored GameLayout

**Testing becomes possible:**
- `useEventBusListeners.test.js` - mock EventBus, verify listeners registered/cleaned
- `useQuestTracking.test.js` - pure logic, verify quest completion conditions
- `questEventHandlers.test.js` - pure functions, easy to test
- `GameLayout.test.jsx` - integration test with mocked hooks

### Phase 2: Testing Infrastructure

**Target:** 80%+ coverage for business logic, 60%+ for UI components.

**Coverage Strategy:**

| Layer | Target | Priority | Approach |
|-------|--------|----------|----------|
| Redux slices | 90%+ | HIGH | Unit tests, all actions/reducers |
| Redux middleware | 85%+ | HIGH | Integration tests with mock store |
| Utils/services | 90%+ | HIGH | Pure functions, easy to test |
| Hooks | 75%+ | MEDIUM | renderHook from RTL |
| UI Components | 60%+ | MEDIUM | RTL, focus on logic not markup |
| Phaser systems | 40%+ | LOW | Mock Phaser, test game logic only |
| E2E critical paths | 5 flows | MEDIUM | Playwright: onboarding, review, quiz, battle, shop |

**Phaser Testing Strategy:**

Phaser classes can't use React hooks. Testing approach:

```javascript
// BAD: Try to test Phaser rendering
test('NPCManager renders sprites', () => {
  // Requires full Phaser context, brittle
});

// GOOD: Test game logic extraction
test('NPCManager.getInteractableNPC returns closest NPC in range', () => {
  const npcs = [
    { x: 100, y: 100, id: 'npc1' },
    { x: 200, y: 200, id: 'npc2' }
  ];
  const playerX = 110;
  const playerY = 110;
  const range = 50;

  expect(getInteractableNPC(npcs, playerX, playerY, range))
    .toBe('npc1');
});
```

**Extract game logic into pure functions in `src/game/utils/`, test those. Don't test Phaser rendering.**

**Test File Organization:**
```
src/
├── components/
│   └── HUD/
│       ├── HUD.jsx
│       └── __tests__/
│           └── HUD.test.jsx          # Colocated tests
├── store/
│   └── slices/
│       ├── playerSlice.js
│       └── __tests__/
│           └── playerSlice.test.js
├── utils/
│   ├── xpCalculator.js
│   └── __tests__/
│       └── xpCalculator.test.js
├── game/
│   └── utils/                         # NEW: extracted game logic
│       ├── npcInteraction.js
│       └── __tests__/
│           └── npcInteraction.test.js
└── test/
    ├── setup.js                       # Global mocks (Howler, Phaser)
    └── testUtils.jsx                  # renderWithProviders helper
```

**Coverage Exclusions (vitest.config.js already has):**
- `src/data/**` - static JSON/JS data
- `src/game/**` - Phaser rendering (test extracted logic only)
- `src/test/**` - test utilities

**New Test Utilities Needed:**

```javascript
// src/test/testUtils.jsx additions
export function createMockEventBus() {
  const listeners = new Map();
  return {
    on: vi.fn((event, handler) => {
      if (!listeners.has(event)) listeners.set(event, []);
      listeners.get(event).push(handler);
    }),
    off: vi.fn((event, handler) => {
      if (!listeners.has(event)) return;
      const handlers = listeners.get(event);
      const idx = handlers.indexOf(handler);
      if (idx > -1) handlers.splice(idx, 1);
    }),
    emit: vi.fn((event, ...args) => {
      if (!listeners.has(event)) return;
      listeners.get(event).forEach(h => h(...args));
    }),
    removeAllListeners: vi.fn(() => listeners.clear())
  };
}

export function mockPhaserGame(scene = {}) {
  return {
    game: {
      scene: {
        getScene: vi.fn(() => scene)
      }
    }
  };
}
```

### Phase 3: Backend Testing & Hardening

**Current State:** Express 5 + JWT httpOnly cookies + CSRF + rate limiting + Zod validation. 1 backend test file.

**Backend Test Strategy:**

```
server/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── __tests__/
│   │       └── authController.test.js  # Unit tests with mocked services
│   ├── routes/
│   │   ├── auth.js
│   │   └── __tests__/
│   │       └── auth.test.js            # Integration tests with supertest
│   ├── middleware/
│   │   ├── rateLimiter.js
│   │   └── __tests__/
│   │       └── rateLimiter.test.js     # Verify limits enforced
│   ├── models/
│   │   ├── User.js
│   │   └── __tests__/
│   │       └── User.test.js            # Mongoose schema validation
│   └── utils/
│       └── __tests__/
│           └── logger.test.js
└── test/
    ├── setup.js                         # Test DB connection
    └── helpers.js                       # createTestUser, cleanDB
```

**Security Hardening Additions:**

1. **Helmet.js already configured** - check CSP headers for Phaser compatibility
2. **MongoDB injection protection** - Mongoose + Zod handles this, add tests
3. **JWT secret validation** - server.js already validates length, good
4. **Input sanitization** - Zod handles, add edge case tests
5. **Error message sanitization** - errorHandler.js should not leak stack traces in prod
6. **Dependency audit** - `npm audit` + Dependabot
7. **Request logging** - requestLogger.js exists, add sensitive field redaction
8. **CORS whitelist** - app.js already configured, add tests

**New Backend Tests Needed:**

| Test Suite | Focus | Priority |
|------------|-------|----------|
| auth.test.js | Registration, login, logout, token refresh | HIGH |
| rateLimiter.test.js | Verify 429 on limit exceeded | HIGH |
| validate.test.js | Zod schema edge cases, XSS attempts | HIGH |
| User.test.js | Schema validation, password hashing | MEDIUM |
| errorHandler.test.js | Error responses don't leak secrets | HIGH |
| csrf.test.js | Token validation, mismatch handling | MEDIUM |

**Backend Test Environment:**

```javascript
// server/test/setup.js
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

export async function setupTestDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}

export async function teardownTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
}
```

### Phase 4: Visual Polish Integration

**Current State:** 20 NPC sprites + 13 outfit sprites exist in `/public/assets/sprites/`. CSS Modules used for components, inline styles in some older files.

**Polish Strategy:**

1. **CSS Consolidation**
   - All new styles → CSS Modules
   - Inline styles → CSS Modules (gradual migration)
   - CSS variables for theme tokens (colors, spacing, z-index already in `src/styles/variables.css`)

2. **Pixel Art Polish**
   - Sprites exist, ensure proper scaling (use `image-rendering: pixelated`)
   - Add idle animations for NPCs (2-3 frame loop)
   - Add walking animations for player (already exists in Player.js sprite)
   - Outfit sprites already integrated (Wardrobe.jsx in v2.0)

3. **UI Animations**
   - Framer Motion already used (AnimatePresence in GameLayout)
   - Add spring animations for modal entry/exit
   - Smooth transitions for HUD elements
   - Toast notifications already animated (AchievementToast, NotificationToast)

4. **Performance Considerations**
   - Lazy-loaded routes already implemented (routes.jsx)
   - Vendor chunking configured (vite.config.js splits Phaser, React, Redux)
   - CSS Modules tree-shake unused styles
   - Asset optimization: sprites already PNG, consider WebP for backgrounds

**CSS Architecture:**

```
src/
├── styles/
│   ├── variables.css          # Design tokens (existing)
│   ├── globals.css            # Resets, body styles
│   └── animations.css         # Shared animation keyframes
├── components/
│   └── HUD/
│       ├── HUD.jsx
│       └── HUD.module.css     # Scoped styles
└── game/
    └── styles/                # Phaser DOM overlays
        └── overlays.css
```

**Image Rendering for Pixel Art:**

```css
/* Add to all pixel art components */
.pixelArt {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
```

## Integration Points for v3.0

### 1. Testing ↔ Refactored Architecture

**Integration:** Refactor GameLayout FIRST, then write tests. Writing tests for 608-line god component is painful.

**Files Modified:**
- `src/components/Router/GameLayout.jsx` (refactor)
- `src/components/Router/hooks/*.js` (new)
- `src/components/Router/__tests__/GameLayout.test.jsx` (new)

**Build Order:**
1. Refactor GameLayout (Phase 1)
2. Write tests for extracted hooks/utils
3. Write integration test for refactored GameLayout
4. Add coverage for Redux slices (independent of refactor)
5. Add coverage for utilities (independent of refactor)

### 2. Backend Tests ↔ Frontend Sync

**Integration:** Backend tests can run independently. Frontend sync not yet implemented.

**Future:** When adding frontend sync, backend tests ensure API contract stability.

**Files:**
- `server/src/routes/__tests__/*.test.js` (new)
- `server/src/controllers/__tests__/*.test.js` (new)

**Build Order:** Backend tests can be written in parallel with frontend refactor.

### 3. Visual Polish ↔ Testing

**Integration:** Visual polish increases UI complexity. Test logic, not styles.

**Testing Focus:**
- Test component behavior (button clicks, form submissions)
- Don't test CSS (brittle, low value)
- Don't test animations (use data-testid to check element presence)

**Build Order:**
1. Consolidate CSS architecture
2. Add pixel art polish (doesn't affect tests)
3. Write tests that focus on logic, not visual output

### 4. EventBus Cleanup ↔ GameLayout Refactor

**Integration:** Extract EventBus logic into `useEventBusListeners` hook. Add cleanup utility.

**New Utility:**

```javascript
// src/utils/eventBus.js enhancement
export function createEventBusManager() {
  const listeners = new Map();

  return {
    on(event, handler) {
      EventBus.on(event, handler);
      if (!listeners.has(event)) listeners.set(event, []);
      listeners.get(event).push(handler);
    },

    off(event, handler) {
      EventBus.off(event, handler);
      if (!listeners.has(event)) return;
      const handlers = listeners.get(event);
      const idx = handlers.indexOf(handler);
      if (idx > -1) handlers.splice(idx, 1);
    },

    cleanup() {
      listeners.forEach((handlers, event) => {
        handlers.forEach(handler => EventBus.off(event, handler));
      });
      listeners.clear();
    }
  };
}
```

**Usage in refactored GameLayout:**

```javascript
// src/components/Router/hooks/useEventBusListeners.js
export function useEventBusListeners() {
  const dispatch = useDispatch();

  useEffect(() => {
    const bus = createEventBusManager();

    bus.on('npc-interact', handleNpcInteract);
    bus.on('zone-change', handleZoneChange);
    // ... other listeners

    return () => bus.cleanup(); // Automatic cleanup
  }, [dispatch]);
}
```

## Build Order & Dependencies

**Recommended Sequence:**

### Sprint 1: Architecture Foundation (Refactor First)
1. **GameLayout Refactor** (3 days)
   - Extract hooks: `useEventBusListeners`, `useQuestTracking`, `useSessionTracking`, `useGameKeyboard`
   - Extract components: `PauseMenu`, `ActivitiesMenu`
   - Extract pure functions: `questEventHandlers.js`
   - Verify build passes after each extraction
   - No behavior changes, just code organization

2. **EventBus Cleanup Utility** (1 day)
   - Add `createEventBusManager` to `src/utils/eventBus.js`
   - Update `useEventBusListeners` to use manager
   - Test no listener leaks remain

**Output:** Testable architecture, GameLayout reduced from 608 LOC → ~150 LOC orchestration.

### Sprint 2: Testing Infrastructure (Test Second)
3. **Test Utilities & Setup** (1 day)
   - Add `createMockEventBus` and `mockPhaserGame` to `testUtils.jsx`
   - Verify vitest.config.js coverage settings

4. **Unit Tests - Redux** (3 days)
   - Test all 12 slices: actions, reducers, selectors
   - Test 2 middleware: achievementMiddleware, dailyGoalsMiddleware
   - Target: 90%+ coverage for Redux layer

5. **Unit Tests - Utils/Hooks** (2 days)
   - Test extracted GameLayout hooks
   - Test pure utility functions (xpCalculator, questHelpers, etc.)
   - Target: 90%+ coverage for utils

6. **Component Tests** (3 days)
   - Test refactored GameLayout (integration test)
   - Test HUD, DialogueOverlay, QuizOverlay (existing test as template)
   - Target: 60%+ coverage for UI components

7. **Phaser Logic Tests** (2 days)
   - Extract game logic to `src/game/utils/`
   - Test pure functions (collision detection, NPC interaction range, etc.)
   - Don't test Phaser rendering
   - Target: 40%+ coverage for extracted logic

**Output:** 80%+ overall coverage, CI-ready test suite.

### Sprint 3: Backend Hardening (Parallel to Frontend)
8. **Backend Test Setup** (1 day)
   - Configure MongoDB memory server for tests
   - Add test helpers (createTestUser, cleanDB)

9. **Backend Unit Tests** (3 days)
   - Test controllers, models, middleware
   - Test Zod schemas with edge cases
   - Test rate limiter enforcement

10. **Backend Integration Tests** (2 days)
    - Test auth flows with supertest
    - Test CSRF protection
    - Test error handling (no secret leakage)

11. **Security Audit** (1 day)
    - Run `npm audit`, fix vulnerabilities
    - Review errorHandler for prod stack trace leakage
    - Verify CORS whitelist
    - Verify rate limits sufficient

**Output:** Hardened backend with 80%+ test coverage, security audit passed.

### Sprint 4: Visual Polish (After Testing)
12. **CSS Consolidation** (2 days)
    - Migrate inline styles → CSS Modules
    - Add shared animation keyframes to `src/styles/animations.css`
    - Verify no visual regressions

13. **Pixel Art Polish** (2 days)
    - Add `image-rendering: pixelated` to all sprites
    - Add NPC idle animations (2-3 frames)
    - Verify player walking animations smooth

14. **UI Animation Polish** (2 days)
    - Add Framer Motion spring animations for modals
    - Polish toast notifications (already animated, refine timing)
    - Add HUD element transitions

15. **Performance Optimization** (1 day)
    - Verify lazy-loading working (already configured)
    - Check bundle sizes (vendor chunks already split)
    - Consider WebP for backgrounds (optional)

**Output:** Polished UI, consistent CSS architecture, optimized assets.

### Sprint 5: Integration & E2E
16. **E2E Critical Paths** (3 days)
    - Onboarding flow (character creation → first NPC)
    - Review session (due cards → quiz → FSRS update)
    - Battle flow (boss selection → word duel → rewards)
    - Shop purchase (select item → buy → inventory update)
    - Quest completion (trigger → progress → reward)

17. **CI/CD Integration** (1 day)
    - Add test scripts to GitHub Actions
    - Add coverage reporting
    - Add bundle size checks

**Output:** E2E coverage, CI pipeline, v3.0 ready to ship.

## Data Flow Changes in v3.0

### Before (v2.0): Monolithic GameLayout
```
GameLayout (608 LOC)
├── 20 EventBus listeners in one useEffect
├── Quest tracking inline
├── Session tracking inline
├── Keyboard shortcuts inline
└── Overlay rendering inline
    → Hard to test, hard to maintain
```

### After (v3.0): Modular Hooks
```
GameLayout (150 LOC - orchestration)
├── useEventBusListeners() → EventBus setup/cleanup
├── useQuestTracking() → Quest logic
├── useSessionTracking() → Session timer
├── useGameKeyboard() → Keyboard shortcuts
└── <GameOverlays /> → Conditional rendering
    → Each hook independently testable
    → Pure function utils fully testable
```

### New Test Data Flow
```
Test Suite
    ↓
createTestStore(preloadedState) → Redux store with test data
    ↓
renderWithProviders(<Component />, { store }) → Component with Redux
    ↓
screen.getByRole() → Query rendered output
    ↓
fireEvent.click() → Simulate user interaction
    ↓
expect(store.getState().player.level).toBe(2) → Assert state change
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Testing Implementation Details

**What people do:** Test internal component state, CSS classes, implementation details.

**Why it's wrong:** Brittle tests that break on refactors, even when behavior unchanged.

**Do this instead:**
```javascript
// BAD: Testing implementation
test('HUD shows statsPanel when statsOpen is true', () => {
  const { container } = render(<HUD />);
  expect(container.querySelector('.statsPanel')).toBeInTheDocument();
});

// GOOD: Testing user-facing behavior
test('HUD shows stats when stats button clicked', () => {
  render(<HUD onMenu={vi.fn()} />);
  const statsButton = screen.getByLabelText(/show stats/i);
  fireEvent.click(statsButton);
  expect(screen.getByText(/Words:/i)).toBeInTheDocument();
});
```

### Anti-Pattern 2: Testing Phaser Rendering

**What people do:** Try to test Phaser sprite rendering, canvas output.

**Why it's wrong:** Requires full Phaser context, slow, brittle, low value.

**Do this instead:** Extract game logic into pure functions, test those.

```javascript
// BAD: Testing Phaser rendering
test('NPCManager renders 140 sprites', () => {
  const scene = new WorldScene();
  const npcManager = new NPCManager(scene);
  expect(scene.children.length).toBe(140); // Brittle, requires Phaser context
});

// GOOD: Test extracted game logic
test('getInteractableNPC returns closest NPC within range', () => {
  const npcs = [
    { x: 100, y: 100, id: 'merchant' },
    { x: 500, y: 500, id: 'guard' }
  ];
  const result = getInteractableNPC(npcs, 110, 110, 50);
  expect(result).toEqual({ x: 100, y: 100, id: 'merchant' });
});
```

### Anti-Pattern 3: Skipping Backend Tests

**What people do:** "Backend is simple CRUD, no need for tests."

**Why it's wrong:** Security vulnerabilities, regression bugs, lack of API contract documentation.

**Do this instead:** Write integration tests for all routes, unit tests for business logic.

### Anti-Pattern 4: God Component Refactor Without Tests

**What people do:** Refactor giant component, forget edge cases, break production.

**Why it's wrong:** No safety net, regressions slip through, lose user trust.

**Do this instead:** Write integration test FIRST (even if it tests god component), then refactor, verify test still passes.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **Current (single-player, local-first)** | Redux-persist to localStorage works. Backend for sync only. |
| **1k-10k users (cloud sync)** | Add Redis for session management. MongoDB with indexes sufficient. Rate limiting critical. |
| **10k-100k users (multiplayer features)** | Add WebSocket for real-time features. Consider CDN for assets. Horizontal scaling for backend. |
| **100k+ users** | Split backend into microservices (auth, game, sync). Use message queue for async operations. |

### Scaling Priorities (v3.0 scope)

1. **First bottleneck:** Backend rate limiting (already present, needs tuning)
   - **Fix:** Monitor rate limit hits, adjust thresholds based on real usage
   - **v3.0 action:** Add logging/monitoring for rate limit hits

2. **Second bottleneck:** MongoDB query performance
   - **Fix:** Add indexes for user queries, progress updates
   - **v3.0 action:** Profile slow queries, add indexes

3. **Third bottleneck:** Frontend bundle size
   - **Fix:** Already code-split, further optimize with dynamic imports
   - **v3.0 action:** Analyze bundle with vite-bundle-visualizer

**Not a bottleneck yet:** Phaser rendering (single canvas, 64x64 tilemap), CSS performance, Redux store size.

## Sources

**Architecture Analysis:**
- Existing codebase: GameLayout.jsx (608 LOC), routes.jsx, store.js, vitest.config.js, vite.config.js
- Redux Toolkit patterns: Official documentation, middleware best practices
- Phaser 3 integration: EventEmitter patterns, DOM overlay techniques
- Testing strategy: Vitest + RTL documentation, existing test examples (HUD.test.jsx)

**Backend Security:**
- Express.js security: Helmet, CORS, rate limiting (already implemented)
- JWT authentication: httpOnly cookies + CSRF (already implemented)
- Zod validation: Schema-based input validation (already implemented)

**Testing Patterns:**
- React Testing Library: Focus on user behavior, not implementation
- Vitest: Jest-compatible API, ESM-first, fast
- Playwright: E2E testing for critical flows

**Visual Polish:**
- CSS Modules: Scoped styles, tree-shaking
- Framer Motion: Spring animations, AnimatePresence (already used)
- Pixel art rendering: `image-rendering: pixelated` for crisp sprites

**Confidence:** HIGH - All recommendations based on existing codebase analysis, established patterns, and standard best practices for React 19 + Phaser 3 + Express applications.

---
*Architecture research for: GoGo Arabic v3.0 Infrastructure & Polish*
*Researched: 2026-02-08*
*Basis: Codebase analysis (27K LOC, 608-line GameLayout, 12 Redux slices, Express 5 backend, 11 existing tests)*
