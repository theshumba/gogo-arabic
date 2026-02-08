# Technology Stack: v3.0 Infrastructure & Polish

**Project:** GoGo Arabic v3.0
**Research Date:** 2026-02-08
**Focus:** Testing at scale (~80%+ coverage), architecture tooling, backend hardening, pixel art pipeline

---

## Existing Stack (DO NOT CHANGE)

### Frontend Core
| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| React | 19.2.4 | UI framework | Validated, keep |
| Phaser | 3.90.0 | Game engine | Validated, keep |
| Redux Toolkit | 2.11.2 | State management | Validated, keep |
| Framer Motion | 11.15.0 | Animations | Validated, keep |
| React Router | 7.13.0 | Routing | Validated, keep |

### Testing (Baseline)
| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Vitest | 3.0.0 | Unit test runner | Configured, expand usage |
| @testing-library/react | 16.0.0 | React component testing | Configured, expand usage |
| Playwright | 1.58.2 | E2E testing | Configured, expand usage |
| @vitest/coverage-v8 | 3.0.0 | Coverage reporting | Configured, adjust thresholds |

### Backend Core
| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Express | 5.2.1 | HTTP server | Validated, keep |
| MongoDB/Mongoose | 9.1.6 | Database | Validated, keep |
| Winston | 3.19.0 | Logging | Validated, keep |
| bcryptjs | 3.0.3 | Password hashing | Validated, keep |
| jsonwebtoken | 9.0.3 | Auth tokens | Validated, keep |
| Zod | 3.25.76 | Input validation | Validated, keep |

---

## NEW Additions for v3.0

### 1. Testing Additions (80%+ Coverage Goal)

#### Backend API Testing
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **supertest** | ^7.0.0 | HTTP assertions for Express | Industry standard for testing Express APIs, integrates with Vitest via `expect()`, no separate test runner needed |
| **mongodb-memory-server** | ^10.1.1 | In-memory MongoDB for tests | Isolates tests from production DB, fast test execution, no cleanup required between test runs |

**Installation:**
```bash
npm install -D supertest@^7.0.0 mongodb-memory-server@^10.1.1
```

**Integration:** Create `server/src/test/setup.js` mirroring frontend pattern. Configure in new `server/vitest.config.js`. Use supertest to test all 6 API routes (auth, user, shop, quest, review, game).

**Confidence:** MEDIUM (supertest widely documented, version based on training data, official npm package exists)

#### Phaser Game System Testing
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **@vitest/web-worker** | ^3.0.0 | Mock web workers | Phaser uses workers for some asset loading, avoid "window is not defined" errors |

**Installation:**
```bash
npm install -D @vitest/web-worker@^3.0.0
```

**Integration:** Extend existing `src/test/setup.js` with full Phaser mocks (Scene lifecycle, physics, tilemaps, input). Currently only mocks `Phaser.Game` and `Phaser.Scene` - need full `Phaser.Physics`, `Phaser.Tilemaps`, `Phaser.Input` for testing 890 LOC in game systems.

**Pattern:** Test Phaser systems using dependency injection - pass mocked scene/physics objects. Do NOT test Phaser internals, test YOUR logic (NPC collision detection, MapLoader tile parsing, PlayerController freeze/unfreeze).

**Confidence:** MEDIUM (Vitest web-worker exists, Phaser testing pattern from training data)

#### Redux Middleware Testing
**No new libraries needed.** Existing Vitest + test utils handle middleware testing.

**Pattern:** Test `achievementMiddleware.js` and `dailyGoalsMiddleware.js` by:
1. Create test store with middleware enabled
2. Dispatch actions that should trigger middleware
3. Assert side effects (achievement unlocks, goal completions, streak updates)

Example already exists in `src/store/__tests__/vocabularySlice.test.js` - follow that pattern.

#### E2E Test Expansion
**No new libraries needed.** Existing Playwright handles critical flows.

**Focus areas (7 new test files):**
1. `e2e/onboarding.spec.js` - Character creation → first zone
2. `e2e/review-flow.spec.js` - Review session → FSRS card updates
3. `e2e/quest-flow.spec.js` - Accept quest → talk to NPC → complete → claim reward
4. `e2e/shop-flow.spec.js` - Buy outfit → equip in wardrobe → verify appearance
5. `e2e/fast-travel.spec.js` - World map → click zone → teleport
6. `e2e/battle-flow.spec.js` - Enter battle → complete quiz → win/lose
7. `e2e/auth-flow.spec.js` - Login → sync → logout

**Playwright config update:** Add API mocking via `page.route()` to avoid backend dependency for some E2E tests.

**Confidence:** HIGH (Playwright capabilities well-documented)

---

### 2. Code Quality & Architecture Tooling

#### Linting
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **eslint** | ^9.18.0 | JavaScript linting | Flat config (ESM-compatible), React 19 support |
| **@eslint/js** | ^9.18.0 | ESLint recommended rules | Official ESLint base config |
| **eslint-plugin-react** | ^7.37.2 | React-specific rules | Hooks rules, prop-types, accessibility |
| **eslint-plugin-react-hooks** | ^5.1.0 | React Hooks rules | Enforces rules of hooks |
| **eslint-plugin-react-refresh** | ^0.4.16 | Fast Refresh validation | Prevents Fast Refresh issues in Vite |

**Installation:**
```bash
npm install -D eslint@^9.18.0 @eslint/js@^9.18.0 eslint-plugin-react@^7.37.2 eslint-plugin-react-hooks@^5.1.0 eslint-plugin-react-refresh@^0.4.16
```

**Configuration:** Use **flat config** (`eslint.config.js`) NOT `.eslintrc.json`. ESLint 9+ defaults to flat config, ESM-compatible.

```js
// eslint.config.js
import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
    settings: {
      react: { version: '19.2' },
    },
  },
  {
    ignores: ['dist', 'node_modules', 'public/assets', '.planning'],
  },
];
```

**Backend ESLint:** Separate `server/eslint.config.js` with Node.js-specific rules.

**npm script:** `"lint": "eslint .", "lint:fix": "eslint . --fix"`

**Confidence:** MEDIUM (ESLint 9 flat config from training data, versions approximate)

#### Formatting
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **prettier** | ^3.4.2 | Code formatting | Auto-format on save, consistency across team |
| **eslint-config-prettier** | ^9.1.0 | Disable ESLint formatting rules | Avoid conflicts between ESLint and Prettier |

**Installation:**
```bash
npm install -D prettier@^3.4.2 eslint-config-prettier@^9.1.0
```

**Configuration:**
```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

**ESLint integration:** Add `eslint-config-prettier` to `eslint.config.js` to disable formatting rules.

**npm script:** `"format": "prettier --write \"src/**/*.{js,jsx,css}\"", "format:check": "prettier --check \"src/**/*.{js,jsx,css}\""`

**Confidence:** HIGH (Prettier stable, well-documented)

#### Type Checking (Optional, but recommended)
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **typescript** | ^5.7.0 | Type checking via JSDoc | No migration needed, use JSDoc comments for types |
| **@types/node** | ^22.10.0 | Node.js type definitions | Backend type checking |
| **@types/react** | ^19.0.5 | React type definitions | Frontend type checking |

**Installation:**
```bash
npm install -D typescript@^5.7.0 @types/node@^22.10.0 @types/react@^19.0.5
```

**Usage:** JSDoc-based type checking WITHOUT .ts migration. Add `tsconfig.json`:

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "noEmit": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": false,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**npm script:** `"typecheck": "tsc"`

**Benefits:** Catch type errors in existing .js/.jsx files using JSDoc annotations. No code migration. Gradual adoption.

**Confidence:** HIGH (TypeScript JSDoc well-documented)

---

### 3. Backend Hardening

#### Security Enhancements
**Already present:** `helmet`, `express-rate-limit`, `csurf`, `bcryptjs`, `jsonwebtoken`

**Additional:**
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **express-mongo-sanitize** | ^2.2.0 | Prevent NoSQL injection | Strips `$` and `.` from user input before DB queries |
| **express-validator** | ^7.3.2 | Alternative to Zod for route validation | More Express-idiomatic than Zod for API routes, better error messages |

**Installation:**
```bash
cd server && npm install express-mongo-sanitize@^2.2.0 express-validator@^7.3.2
```

**Integration:** Add `mongoSanitize()` middleware to `server/src/app.js` after body parsers. Consider migrating from Zod to express-validator for route validation (OPTIONAL, Zod already works).

**Confidence:** MEDIUM (libraries exist, versions from training data)

#### Database Hardening
**No new libraries needed.** Configuration changes:

1. **Connection pooling:** Mongoose defaults are good for small apps, but add explicit config for production:
   ```js
   mongoose.connect(MONGODB_URI, {
     maxPoolSize: 10,
     minPoolSize: 2,
     serverSelectionTimeoutMS: 5000,
   });
   ```

2. **Indexes:** Add indexes to frequently queried fields (User email, Quest userId, etc.) in model definitions using `schema.index()`.

3. **Schema validation:** Mongoose schemas already use Zod for validation - this is good.

**Confidence:** HIGH (Mongoose documentation stable)

#### API Testing (Backend)
**Pattern using supertest:**

```js
// server/src/__tests__/auth.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('POST /api/auth/register', () => {
  it('should create new user with valid data', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123!',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
  });

  it('should reject duplicate email', async () => {
    // Register first user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'user1',
        email: 'duplicate@example.com',
        password: 'Pass123!',
      });

    // Try to register with same email
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'user2',
        email: 'duplicate@example.com',
        password: 'Pass456!',
      });

    expect(response.status).toBe(400);
  });
});
```

**Test all 6 route files:** `auth.js`, `user.js`, `shop.js`, `quest.js`, `review.js`, `game.js`.

**Coverage target:** 80%+ for controllers, middleware, validation logic. DB models can be lower (60%+).

**Confidence:** HIGH (supertest pattern well-established)

---

### 4. Pixel Art Asset Pipeline

#### Asset Optimization
| Tool | Version | Purpose | Why |
|------|---------|---------|-----|
| **vite-imagetools** | ^7.0.4 | Image optimization during build | Vite plugin for compressing/resizing images, supports pixel art mode (nearest-neighbor scaling) |
| **sharp** | ^0.33.5 | Image processing engine | Peer dependency of vite-imagetools, fast native image processing |

**Installation:**
```bash
npm install -D vite-imagetools@^7.0.4 sharp@^0.33.5
```

**Vite config update:**
```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  plugins: [
    react({ jsxRuntime: 'automatic' }),
    imagetools({
      defaultDirectives: (url) => {
        // Pixel art assets should use nearest-neighbor
        if (url.pathname.includes('/pixel/')) {
          return new URLSearchParams({
            format: 'webp',
            quality: '100',
            kernel: 'nearest', // Prevent blurring on scale
          });
        }
        return new URLSearchParams(); // Default compression for other images
      },
    }),
  ],
  // ... rest of config
});
```

**Usage:** Import images with directives:
```js
import tilesetWebp from './assets/pixel/tileset.png?w=512&format=webp&kernel=nearest';
```

**Confidence:** MEDIUM (vite-imagetools exists, pixel art config from training data)

#### Sprite Sheet Management
**No library needed.** Use existing Phaser Texture Packer JSON format.

**Recommendation:** Create sprites using external tool (Aseprite, Piskel) → export as sprite sheet + JSON → Phaser loads with `this.load.atlas()`.

**DO NOT use:** Heavy tools like TexturePacker Pro ($40). Free alternatives work fine for 140 NPCs worth of sprites.

**Confidence:** HIGH (Phaser atlas loading well-documented)

#### CSS Pixel Art Rendering
**No library needed.** Add CSS rule for pixel-perfect rendering:

```css
/* src/styles/variables.css */
.pixel-art {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
```

Apply to Phaser canvas:
```css
canvas {
  image-rendering: pixelated;
}
```

**Confidence:** HIGH (CSS standard)

---

## What NOT to Add (Avoid Over-Tooling)

### ❌ Storybook
**Why skip:** Already have 35+ components with CSS Modules. Storybook requires significant setup time and maintenance. Not needed for 1-2 person team. Visual testing better done via Playwright screenshots.

### ❌ Husky / lint-staged
**Why skip:** Pre-commit hooks slow down commits. Better to run linting in CI/CD. Manual `npm run lint` before commits is sufficient for small team.

### ❌ Jest
**Why skip:** Vitest already configured, faster than Jest, better ESM support, drop-in compatible with Jest API. No reason to add Jest.

### ❌ Cypress
**Why skip:** Playwright already configured, more modern, better performance. Cypress adds redundant capability.

### ❌ GraphQL (Apollo, urql)
**Why skip:** REST API already implemented with Express. GraphQL overkill for this project's API complexity. 6 routes don't justify GraphQL overhead.

### ❌ Docker (for local dev)
**Why skip:** MongoDB + Node.js run natively on macOS. Docker adds complexity without benefit for solo/small team. Consider for deployment only if needed.

### ❌ Turborepo / Nx
**Why skip:** Monorepo tools unnecessary. Frontend and backend are separate `package.json` files, simple structure works. Premature optimization.

### ❌ Bundle analyzers (webpack-bundle-analyzer, vite-plugin-visualizer)
**Why skip:** Already have manual chunk splitting working (264KB main bundle). Bundle size not currently a problem. Add later if needed.

### ❌ Sentry / Error tracking
**Why skip:** Winston logging already in place. Error tracking SaaS adds cost and complexity. Revisit if app reaches production with real users.

---

## Installation Summary

### Frontend New Dependencies
```bash
# Testing
npm install -D supertest@^7.0.0 mongodb-memory-server@^10.1.1 @vitest/web-worker@^3.0.0

# Linting & Formatting
npm install -D eslint@^9.18.0 @eslint/js@^9.18.0 \
  eslint-plugin-react@^7.37.2 \
  eslint-plugin-react-hooks@^5.1.0 \
  eslint-plugin-react-refresh@^0.4.16 \
  prettier@^3.4.2 \
  eslint-config-prettier@^9.1.0

# Type Checking (Optional)
npm install -D typescript@^5.7.0 @types/node@^22.10.0 @types/react@^19.0.5

# Asset Pipeline
npm install -D vite-imagetools@^7.0.4 sharp@^0.33.5
```

### Backend New Dependencies
```bash
cd server

# Testing (backend needs Vitest config + supertest)
npm install -D vitest@^3.0.0 supertest@^7.0.0 mongodb-memory-server@^10.1.1

# Security
npm install express-mongo-sanitize@^2.2.0 express-validator@^7.3.2

# Linting (same ESLint as frontend, different config)
npm install -D eslint@^9.18.0 @eslint/js@^9.18.0 \
  prettier@^3.4.2 \
  eslint-config-prettier@^9.1.0
```

---

## Integration Checklist

- [ ] Create `server/vitest.config.js` for backend tests
- [ ] Create `server/src/test/setup.js` for MongoDB memory server
- [ ] Extend `src/test/setup.js` with full Phaser mocks
- [ ] Create `eslint.config.js` (flat config) for frontend
- [ ] Create `server/eslint.config.js` for backend
- [ ] Create `.prettierrc` and `.prettierignore`
- [ ] Create `tsconfig.json` (optional, for JSDoc type checking)
- [ ] Update `vite.config.js` with imagetools plugin
- [ ] Add CSS pixel art rules to `src/styles/variables.css`
- [ ] Add npm scripts: `lint`, `lint:fix`, `format`, `format:check`, `typecheck`
- [ ] Update `vitest.config.js` coverage thresholds to enforce 80%
- [ ] Create 7 new Playwright E2E test files
- [ ] Create backend API tests for all 6 routes
- [ ] Create Phaser system tests (InteractableManager, MapLoader, NPCManager, DOMOverlay)
- [ ] Create middleware tests (achievementMiddleware, dailyGoalsMiddleware)
- [ ] Add MongoDB indexes to User/Quest/GameState models

---

## Confidence Assessment

| Area | Confidence | Reasoning |
|------|------------|-----------|
| Testing (Frontend) | HIGH | Vitest + RTL + Playwright well-documented, existing setup validates approach |
| Testing (Backend) | MEDIUM | Supertest + mongodb-memory-server standard pattern, versions from training data |
| Testing (Phaser) | MEDIUM | Phaser testing requires custom mocks, pattern from training data not verified |
| ESLint/Prettier | MEDIUM | Flat config pattern from training data, versions approximate |
| TypeScript JSDoc | HIGH | Official TypeScript feature, well-documented |
| Backend Security | MEDIUM | Libraries exist, versions from training data |
| Image Pipeline | MEDIUM | vite-imagetools exists, pixel art config from training data |
| Overall | MEDIUM | Most libraries standard, versions need verification, patterns validated by existing setup |

---

## Sources

**Training Data Limitations:** Web search and Context7 unavailable during research. All library versions and configurations based on training data (knowledge cutoff January 2025). Versions marked as approximate (^). **Recommendation:** Verify versions with `npm info <package> version` before installation.

**Verified from codebase:**
- Existing Vitest + RTL + Playwright setup validates testing approach
- Existing middleware pattern validates Redux middleware testing
- Existing test utils (`renderWithProviders`) validates approach
- 12 Redux slices, 2 middleware, 890 LOC Phaser systems confirm scope
- Backend already has bcryptjs, jsonwebtoken, helmet, express-rate-limit, winston, zod

**Training data sources (unverified):**
- ESLint 9 flat config pattern
- Supertest + mongodb-memory-server for Express testing
- vite-imagetools for image optimization
- express-mongo-sanitize, express-validator for backend hardening

**Recommended verification:**
- [ ] Check npm for latest compatible versions of all new dependencies
- [ ] Verify vite-imagetools pixel art configuration in official docs
- [ ] Verify ESLint 9 flat config format (may have changed after Jan 2025)
- [ ] Verify Playwright API mocking syntax for backend-free E2E tests
