# Project Research Summary

**Project:** GoGo Arabic v3.0 Infrastructure & Polish
**Domain:** Educational game infrastructure hardening
**Researched:** 2026-02-08
**Confidence:** MEDIUM

## Executive Summary

GoGo Arabic v3.0 focuses on infrastructure maturity after completing 9 phases of v2.0. The codebase has critical gaps: 13.12% test coverage, 607-line god component (GameLayout), no linting/formatting, EventBus singleton causing memory leaks, and backend connection pooling issues. Research reveals this is a testing-first milestone requiring systematic hardening across four areas: comprehensive testing (unit/integration/E2E), architecture cleanup (god component refactor, hook extraction), backend hardening (connection pooling, atomic sync, rate limiting), and visual polish (pixel art icon system, sprite consistency).

The recommended approach is bottom-up: establish testing foundation first (60-70% coverage target), then refactor architecture with test safety net in place, followed by backend hardening and visual polish. Key risk is EventBus memory leaks during test teardown and god component refactoring breaking z-index overlay stack. Mitigation requires careful test setup (clear EventBus listeners in afterEach), keeping all overlays in single component tree, and comprehensive E2E coverage before refactoring.

The research reveals a mature codebase with clear patterns (Redux Toolkit, CSS modules, EventBus architecture) that needs hardening, not rebuilding. Existing test patterns (vocabularySlice.test.js, HUD.test.jsx) provide blueprints. The 4-phase structure (Testing → Architecture → Backend → Visual) minimizes risk by establishing safety nets before architectural changes.

## Key Findings

### Recommended Stack

Research validates existing stack (React 19, Phaser 3, Redux Toolkit, Vitest, Playwright) and identifies targeted additions for v3.0. No framework changes required.

**Core technologies:**
- **supertest** ^7.0.0: HTTP assertions for Express API testing — industry standard, integrates with existing Vitest setup
- **mongodb-memory-server** ^10.1.1: In-memory DB for backend tests — isolates tests, no cleanup needed
- **@vitest/web-worker** ^3.0.0: Mock web workers for Phaser testing — prevent "window is not defined" errors
- **eslint** ^9.18.0 + plugins: Flat config ESM-compatible, React 19 support — currently no linting exists
- **prettier** ^3.4.2: Auto-formatting — 25+ CSS modules need consistency
- **express-mongo-sanitize** ^2.2.0: Prevent NoSQL injection — strips $ and . from user input
- **vite-imagetools** ^7.0.4: Image optimization with pixel art mode (nearest-neighbor scaling)

**What NOT to add:**
- Storybook (too much setup for 35 components, 1-2 person team)
- Jest (Vitest already configured, faster)
- GraphQL (6 REST routes don't justify overhead)
- Docker for local dev (MongoDB + Node native on macOS)

### Expected Features

Research identifies clear feature hierarchy: table stakes (must fix), differentiators (quality boost), anti-features (explicit scope limits).

**Must have (table stakes):**
- **Unit tests for Redux slices** — 1.85% coverage unacceptable; expand from 7 files to all 12 slices
- **Component tests for UI** — Replicate HUD.test.jsx pattern (322 lines) for overlays
- **Integration tests for middleware** — Achievement/goals middleware has complex logic chains
- **Extract god component logic** — 607-line GameLayout unmaintainable; split EventBus listeners
- **Database indexes** — No indexes on User.email, sync queries; add compound indexes
- **Atomic sync operations** — Race conditions possible; use MongoDB transactions
- **Pixel art icon system** — HUD uses emoji (🎯📊⚔️); replace with 16x16 spritesheet
- **NPC idle animations** — 20 faceless NPCs lack consistent idle loops

**Should have (competitive):**
- **E2E tests with Playwright** — 5-10 critical paths (auth flow, review session, quest complete)
- **Phaser scene unit tests** — Test MapLoader, NPCManager, PlayerController in isolation
- **Hook extraction** — Extract useGameEvents, usePhaserBridge, useOverlayManager
- **Query optimization** — Add projection, lean() queries; reduce payload 30-50%
- **ESLint + Prettier** — No config exists; eslint flat config + prettier

**Defer (v2+):**
- **100% test coverage** — Target 60-70% instead
- **Microservices refactor** — Overkill for single-user game
- **Complete TypeScript migration** — Incremental only

### Architecture Approach

Research confirms test pyramid (700 unit, 50 integration, 8 E2E) with tests in `__tests__` folders next to source. Key patterns: test data factories, Redux store with middleware, centralized Phaser mocks, supertest API testing, MongoDB in-memory isolation.

**Major components:**
1. **Testing infrastructure** — Vitest + RTL + Playwright foundation exists; extend with Phaser mocks, supertest, mongodb-memory-server
2. **Redux middleware testing** — Mock store pattern from vocabularySlice.test.js; test achievement/goals middleware side effects
3. **Phaser system testing** — Dependency injection for scene/physics; test NPC collision, MapLoader parsing, PlayerController freeze/unfreeze (NOT Phaser internals)
4. **Backend API testing** — Supertest + in-memory MongoDB for all 6 routes; 80%+ controller coverage
5. **E2E flow testing** — 7 new Playwright specs (onboarding, review-flow, quest-flow, shop-flow, fast-travel, battle-flow, auth-flow)

### Critical Pitfalls

Top 5 pitfalls from research with prevention strategies:

1. **EventBus memory leaks during test teardown** — Phaser.Events.EventEmitter singleton persists between tests causing cross-contamination. Prevention: Add `EventBus.removeAllListeners()` in `afterEach()` global test setup.

2. **God component refactoring breaks overlay z-index stack** — When splitting 607-line GameLayout, moving overlays breaks z-index hierarchy (7 overlays in specific order). Prevention: Keep overlays in same component tree, extract logic NOT JSX.

3. **Phaser scene mocking assumes React lifecycle** — Mocking scenes causes "scene.textures.exists is not a function" because mocks assume sync lifecycle but Phaser is async. Prevention: Create async-aware Phaser mocks with texture loading simulation.

4. **Missing MongoDB connection pooling under load** — Backend crashes at 100+ concurrent users with "connection pool exhausted". Default pool size (5) insufficient. Prevention: Set maxPoolSize=50, minPoolSize=10, add connection monitoring.

5. **Sprite atlas mismatch between data and assets** — outfits.js has 8 outfit IDs that don't match sprite filenames, causing silent fallback. Prevention: Add validation script in CI to check ID→file mapping.

## Implications for Roadmap

Based on research, suggested 4-phase structure prioritizes safety nets before refactoring:

### Phase 1: Testing Foundation
**Rationale:** Establish comprehensive test coverage BEFORE refactoring god component. Safety net prevents regression during architectural changes.

**Delivers:**
- 60-70% test coverage (up from 13.12%)
- All 12 Redux slices tested + selectors
- Component tests for HUD, DialogueOverlay, QuizOverlay, PauseMenu
- Middleware tests for achievement + daily goals systems
- 7 E2E Playwright specs for critical flows
- Backend API tests for all 6 routes (supertest + mongodb-memory-server)
- Phaser system tests with proper mocks

**Addresses:** Unit tests for Redux slices (table stakes), Component tests (table stakes), Integration tests for middleware (table stakes), E2E tests (differentiator)

**Avoids:** EventBus memory leaks (setup global afterEach cleanup), Phaser scene mocking issues (async-aware mocks), Flaky tests (use waitFor, proper cleanup)

### Phase 2: Architecture Cleanup
**Rationale:** Refactor god component and extract hooks WITH test safety net in place. Dependencies require testing foundation complete first.

**Delivers:**
- GameLayout split into manageable components (300-line max)
- Extracted hooks: useGameEvents, usePhaserBridge, useOverlayManager
- CSS modules migration (replace inline styles)
- ESLint + Prettier config (flat config for ESM)
- Design tokens in variables.css

**Uses:** ESLint ^9.18.0, Prettier ^3.4.2 from stack research

**Implements:** Hook extraction pattern, CSS modules consistency

**Addresses:** Extract god component logic (table stakes), Consistent styling (table stakes), Hook extraction (differentiator), ESLint + Prettier (differentiator)

**Avoids:** God component refactoring breaking z-index (keep overlays in tree), Unbounded EventBus listener growth (idempotent add/remove pattern), CSS modules class name collisions (BEM-like naming)

### Phase 3: Backend Hardening
**Rationale:** Database and API hardening after frontend testing/refactor complete. Independent from frontend changes.

**Delivers:**
- MongoDB connection pooling (maxPoolSize=50, minPoolSize=10)
- Database indexes (User.email, compound userId+syncVersion)
- Atomic sync operations (MongoDB transactions)
- Per-user rate limiting (JWT-based, 10 req/min)
- Comprehensive request validation (Zod schemas all endpoints)
- Query optimization (projections, lean(), selective population)
- Security middleware (express-mongo-sanitize, express-validator)

**Uses:** express-mongo-sanitize ^2.2.0, express-validator ^7.3.2 from stack research

**Addresses:** Database indexes (table stakes), Atomic sync operations (table stakes), Request validation (table stakes), Rate limiting per user (table stakes), Query optimization (differentiator)

**Avoids:** MongoDB connection pool exhaustion (explicit config + monitoring), CSRF token race condition (fetch token in root App.jsx), Rate limiter using IP behind Cloudflare (use CF-Connecting-IP header)

### Phase 4: Visual Polish
**Rationale:** Aesthetic improvements after core infrastructure stable. Lowest priority but important for professional feel.

**Delivers:**
- Pixel art icon system (replace emoji with 16x16 spritesheet)
- NPC idle animations (2-frame loops for all 20 faceless NPCs)
- Sprite animation state machine (centralize Player 16-state logic)
- Particle effects (achievement unlock, level up, quest complete)
- CSS pixel art rendering rules (image-rendering: pixelated)
- Vite imagetools plugin (pixel art mode with nearest-neighbor scaling)

**Uses:** vite-imagetools ^7.0.4, sharp ^0.33.5 from stack research

**Addresses:** Pixel art icon system (table stakes), NPC idle animations (table stakes), Sprite animation state machine (differentiator)

**Avoids:** Sprite atlas mismatch (validation script in CI), Sprite loading blocks initial render (lazy load per zone)

### Phase Ordering Rationale

- **Testing first (P1)** because refactoring god component (P2) is high-risk without safety net. Existing test patterns provide clear blueprints.
- **Architecture cleanup second (P2)** because it depends on test coverage for regression protection. God component refactor touches 100+ files.
- **Backend hardening third (P3)** because it's independent from frontend changes and can proceed in parallel if needed. Standard patterns, low risk.
- **Visual polish last (P4)** because it's purely aesthetic, no architectural dependencies. Lowest priority but completes professional feel.

Dependencies:
- P1 → P2: Testing foundation required before god component refactor
- P2 can block P3/P4 if imports are broken, but P3/P4 are otherwise independent
- P3 and P4 can run in parallel after P2 complete

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Architecture Cleanup):** God component refactor touches 100+ files. Run `/gsd:research-phase` to analyze import dependency tree and refactor extraction strategy.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Testing Foundation):** Existing test patterns + well-documented tools (Vitest, RTL, Playwright, supertest)
- **Phase 3 (Backend Hardening):** Standard MongoDB/Express patterns, stable documentation
- **Phase 4 (Visual Polish):** Established Phaser animation patterns, CSS pixel art rules

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Library versions from training data (Jan 2025), need npm verification. Patterns validated by existing setup. |
| Features | HIGH | Based on codebase analysis (13.12% coverage, 607-line GameLayout). Clear gaps and patterns. |
| Architecture | HIGH | Existing test patterns (vocabularySlice.test.js, HUD.test.jsx) provide blueprints. Clear component structure. |
| Pitfalls | MEDIUM | EventBus/Phaser integration pitfalls from codebase analysis (HIGH confidence). Testing patterns from training data (MEDIUM confidence). |

**Overall confidence:** MEDIUM

Research is strong on what to do (features, architecture patterns) but library versions need verification. Codebase analysis provides high confidence on pitfalls and current state. Training data provides medium confidence on testing patterns and tool integration.

### Gaps to Address

Gaps requiring validation during implementation:

- **Library version compatibility:** All versions (supertest ^7.0.0, mongodb-memory-server ^10.1.1, eslint ^9.18.0, etc.) from training data. Run `npm info <package> version` to verify latest compatible versions before installation.
- **ESLint 9 flat config format:** Flat config pattern from training data may have changed after Jan 2025. Verify official ESLint docs during Phase 2.
- **Playwright API mocking syntax:** Backend-free E2E tests using `page.route()` pattern from training data. Verify Playwright docs during Phase 1.
- **vite-imagetools pixel art configuration:** Nearest-neighbor scaling config from training data. Verify vite-imagetools docs during Phase 4.
- **Phaser + Vitest integration:** Phaser 3.90 + Vitest 3.0 testing patterns from training data, not verified. Test Phaser mocking strategy early in Phase 1.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/components/Router/GameLayout.jsx` (607 lines, 20+ EventBus listeners)
- Codebase analysis: `src/utils/eventBus.js` (Phaser.Events.EventEmitter singleton)
- Codebase analysis: `src/game/sprites/Player.js` (421 lines, outfit mapping)
- Codebase analysis: `src/data/outfits.js` (8 outfits defined)
- Codebase analysis: `server/src/server.js` (MongoDB connection)
- Codebase analysis: Existing test patterns (`vocabularySlice.test.js`, `HUD.test.jsx`)
- Codebase analysis: Current test coverage (13.12% overall, game/ excluded)
- Codebase analysis: 25+ CSS module files, mixed inline styles

### Secondary (MEDIUM confidence)
- Training data: Supertest + mongodb-memory-server for Express testing patterns
- Training data: Vitest + RTL + Playwright best practices
- Training data: ESLint 9 flat config format (may have changed after Jan 2025)
- Training data: Phaser testing patterns with mocked scenes
- Training data: React 19 + Phaser 3 integration patterns
- Training data: MongoDB connection pooling best practices

### Tertiary (LOW confidence)
- Training data: Library versions (all marked as approximate ^)
- Training data: vite-imagetools pixel art configuration
- Training data: express-validator vs Zod comparison

---
*Research completed: 2026-02-08*
*Ready for roadmap: yes*
