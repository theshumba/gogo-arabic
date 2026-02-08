# Feature Landscape: Infrastructure & Polish

**Domain:** Infrastructure hardening for existing Arabic learning RPG
**Researched:** 2026-02-08

## Table Stakes

Features users/developers expect in a production-ready game. Missing = feels incomplete or unprofessional.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **TESTING: Unit tests for Redux slices** | Core business logic must be tested; 1.85% coverage unacceptable | Low | Already have 7 files, expand to 12 slices + selectors |
| **TESTING: Component tests for UI** | React components need regression protection | Medium | Already have HUD test (322 lines), replicate pattern |
| **TESTING: Integration tests for middleware** | Achievement/goals middleware has complex logic chains | Medium | Mock store, test action sequences |
| **ARCH: Extract god component logic** | 607-line GameLayout is unmaintainable | High | Split EventBus listeners, overlay management, state sync |
| **ARCH: Consistent styling approach** | Mixed CSS modules (25 files) + inline styles confuses contributors | Low | Migrate inline → CSS modules, use design tokens |
| **BACKEND: Database indexes** | No indexes = slow queries at scale (User.email, sync queries) | Low | Add compound indexes for userId+timestamps |
| **BACKEND: Atomic sync operations** | Race conditions possible with version-based sync | Medium | Use MongoDB transactions for syncVersion updates |
| **BACKEND: Request validation** | Zod schemas exist but need comprehensive coverage | Low | Validate all endpoint inputs, reject malformed data |
| **BACKEND: Rate limiting per user** | Current rate limit is IP-based only | Low | Add JWT-based user limits (prevents multi-IP abuse) |
| **VISUAL: Pixel art icon system** | HUD uses emoji (🎯📊⚔️), inconsistent with pixel aesthetic | Medium | Replace emoji with 16x16 icons, use spritesheet |
| **VISUAL: NPC idle animations** | 20 faceless NPCs exist but some lack idle loops | Low | Add 2-frame idle to all NPCs, ensure consistency |

## Differentiators

Features that elevate quality but aren't expected. Valuable for polish and credibility.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **TESTING: E2E tests with Playwright** | Catch integration bugs (routing, auth flow, game→UI bridge) | High | Playwright already installed, write 5-10 critical paths |
| **TESTING: Phaser scene unit tests** | Test MapLoader, NPCManager, PlayerController in isolation | High | Mock Phaser APIs, test game logic without rendering |
| **TESTING: Visual regression tests** | Detect UI breakage (pixel art misalignment, CSS changes) | Medium | Percy/Chromatic for screenshot diffs |
| **TESTING: Performance benchmarks** | Track bundle size, Redux action latency, render times | Medium | Vitest bench + Lighthouse CI |
| **ARCH: Hook extraction** | GameLayout has inline EventBus logic, extract to hooks | Medium | useGameEvents, usePhaserBridge, useOverlayManager |
| **ARCH: Component composition** | Replace monolithic overlays with slot/portal patterns | High | DialogueOverlay → Header/Body/Footer slots |
| **ARCH: State machine for UI** | Menu/pause/dialogue states managed ad-hoc, use XState | High | Explicit transitions prevent invalid states |
| **BACKEND: Query optimization** | Add projection (exclude unused fields), use lean() queries | Low | Reduce payload size 30-50% |
| **BACKEND: Background jobs** | Streak calculation, stale review queue cleanup | Medium | Use node-cron or Bull queue |
| **BACKEND: Observability** | Structured logging exists (Winston), add metrics/tracing | Medium | Prometheus metrics, OpenTelemetry traces |
| **BACKEND: Audit logging** | Track auth attempts, sync conflicts, shop purchases | Low | Separate audit collection for forensics |
| **VISUAL: Sprite animation state machine** | Player has 16 states (walk4×sprint4×idle4×boost4), manage explicitly | Medium | Centralize animation logic, debug transitions |
| **VISUAL: Parallax background layers** | Enhance zone atmosphere with depth | Low | 2-3 layers per zone, CSS or Phaser TileSprite |
| **VISUAL: Particle effects** | Quest complete, level up, achievement unlock sparkles | Low | Phaser particles or CSS animations |
| **CODE QUALITY: ESLint + Prettier** | No config exists, inconsistent formatting | Low | eslint-config-react-app + prettier, fix on save |
| **CODE QUALITY: Pre-commit hooks** | Prevent broken builds, enforce tests | Low | Husky + lint-staged, run tests + lint on commit |
| **CODE QUALITY: TypeScript migration** | 35K LOC JavaScript, types prevent bugs | Very High | Incremental: start with utils, hooks, new files |
| **CODE QUALITY: Bundle analysis** | Understand code splitting effectiveness | Low | Vite plugin-visualizer, optimize lazy routes |

## Anti-Features

Features to explicitly NOT build in this milestone. Avoid scope creep.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Full test coverage (100%)** | Diminishing returns; 100% = testing implementation details | Target 60-70% coverage, focus on critical paths |
| **Microservices refactor** | Overkill for single-user game, premature optimization | Keep Express monolith, optimize queries instead |
| **Custom animation engine** | Phaser already handles spritesheets well | Use Phaser's built-in anims, don't reinvent |
| **Real-time multiplayer** | Not in scope, massive complexity | Defer to v4.0 if ever needed |
| **Automated UI testing for every component** | Brittle, slow, expensive to maintain | E2E for flows, unit for logic, visual regression for styling |
| **Backend test mocks for MongoDB** | Complex, maintenance burden | Use in-memory MongoDB for integration tests instead |
| **Complete TypeScript migration** | Blocks all other work for months | Incremental adoption only |
| **Custom CSS framework** | Reinventing Tailwind/styled-components | Stick with CSS modules, add design tokens |

## Feature Dependencies

```
Testing Foundation
├─ Redux slice tests → Middleware tests (need store setup)
├─ Component tests → E2E tests (reuse test utils)
└─ Phaser tests → Visual regression (need scene renders)

Architecture Refactor
├─ GameLayout split → Hook extraction (smaller surface)
├─ Hook extraction → State machine (centralized logic)
└─ CSS modules migration → Design tokens (consistent vars)

Backend Hardening
├─ Database indexes → Query optimization (faster reads)
├─ Atomic sync → Audit logging (track conflicts)
└─ Rate limiting → Observability (monitor abuse)

Visual Polish
├─ Icon system → Animation state machine (shared spritesheets)
├─ NPC idle animations → Particle effects (reuse anim setup)
└─ Sprite state machine → Parallax layers (Phaser fluency)
```

## MVP Recommendation

Prioritize features with highest impact-to-effort ratio:

### Phase 1: Testing Foundation (Week 1-2)
1. **Redux slice tests** — Cover all 12 slices + selectors (Low complexity, HIGH impact)
2. **Component tests** — HUD, DialogueOverlay, QuizOverlay, PauseMenu (Medium complexity, MEDIUM impact)
3. **Middleware tests** — Achievement + Daily Goals middleware (Medium complexity, HIGH impact)
4. **E2E smoke tests** — Auth flow, review session, quest complete (High complexity, HIGH impact)

**Target:** 60% test coverage, CI/CD confidence

### Phase 2: Architecture Cleanup (Week 3-4)
1. **GameLayout split** — Extract PauseMenuManager, OverlayManager, EventBusListener components (High complexity, HIGH impact)
2. **Hook extraction** — `useGameEvents`, `usePhaserBridge`, `useOverlayManager` (Medium complexity, MEDIUM impact)
3. **CSS modules migration** — Replace inline styles in older components (Low complexity, LOW impact)
4. **ESLint + Prettier** — Config + pre-commit hooks (Low complexity, MEDIUM impact)

**Target:** 300-line max per file, consistent patterns

### Phase 3: Backend Hardening (Week 5-6)
1. **Database indexes** — User.email, User.lastSyncedAt, compound userId+syncVersion (Low complexity, HIGH impact)
2. **Atomic sync** — MongoDB transactions for sync endpoint (Medium complexity, HIGH impact)
3. **Rate limiting** — Per-user limits (10 req/min), IP limits (100 req/min) (Low complexity, MEDIUM impact)
4. **Request validation** — Zod schemas for all endpoints (Low complexity, MEDIUM impact)
5. **Query optimization** — Projections, lean(), selective population (Low complexity, MEDIUM impact)

**Target:** Zero race conditions, <100ms P95 latency

### Phase 4: Visual Polish (Week 7-8)
1. **Pixel art icons** — Replace emoji with 16x16 spritesheet (Medium complexity, MEDIUM impact)
2. **NPC idle animations** — 2-frame loops for all 20 faceless NPCs (Low complexity, LOW impact)
3. **Animation state machine** — Centralize Player animation logic (Medium complexity, LOW impact)
4. **Particle effects** — Achievement unlock, level up, quest complete (Low complexity, MEDIUM impact)

**Target:** Consistent pixel aesthetic, polished feel

## Defer to Later Milestones

These are valuable but not critical for v3.0:

- **TypeScript migration** — Incremental, start in v3.1+ (Very High complexity)
- **Phaser scene tests** — Nice-to-have, tricky to mock (High complexity)
- **Visual regression tests** — Requires CI budget, defer to v3.2 (Medium complexity)
- **State machine (XState)** — Over-engineering for current scale (High complexity)
- **Background jobs** — Not critical until 1K+ users (Medium complexity)
- **Observability metrics** — Winston logging sufficient for now (Medium complexity)
- **Parallax backgrounds** — Pure polish, no gameplay impact (Low complexity)

## Complexity Notes

### Testing Complexity Factors
- **Low:** Vitest + RTL setup already exists, pattern established (slice/component tests)
- **Medium:** Need new patterns (middleware mocking, EventBus testing)
- **High:** Phaser/E2E require browser automation, async timing issues

### Architecture Complexity Factors
- **Low:** Simple refactors (CSS modules, linting config)
- **Medium:** Hook extraction requires understanding EventBus lifecycle
- **High:** GameLayout split touches 100+ files importing it, risky

### Backend Complexity Factors
- **Low:** Config changes (indexes, rate limits, validation schemas)
- **Medium:** Code changes to sync logic (transactions, atomic updates)
- **High:** Schema migrations if needed (would block, not planned)

### Visual Complexity Factors
- **Low:** Static assets (icons, 2-frame idle loops)
- **Medium:** Animation state management (centralized logic)
- **High:** Shader effects or 3D (not planned)

## Dependencies on Existing Code

### Testing depends on:
- `src/test/testUtils.jsx` — Already provides `renderWithProviders`, `createTestStore`
- `vitest.config.js` — Coverage excludes game/ and data/, good defaults
- Mock EventBus pattern from `HUD.test.jsx` — Reuse for other components

### Architecture depends on:
- `src/components/Router/GameLayout.jsx` (607 lines) — God component to split
- EventBus listeners (lines 200-500) — Extract to custom hooks
- 25 CSS module files — Extend pattern to older components with inline styles

### Backend depends on:
- `server/src/models/User.js` — Add indexes to schema
- `server/src/controllers/*.js` — Add transactions to sync controller
- `server/src/middleware/auth.js` — Enhance for per-user rate limits
- Zod validation already used in some routes — Expand coverage

### Visual depends on:
- Player spritesheet (512x512, 4x4 grid) — Already structured well
- 20 faceless NPC sprites in `/public/assets/sprites/npcs/faceless/` — Need idle anims
- Phaser animation setup in `Player.js` lines 167, 182 — Replicate pattern

## Sources

Research based on codebase analysis:
- Existing test patterns: `src/store/__tests__/vocabularySlice.test.js` (177 lines), `src/components/HUD/__tests__/HUD.test.jsx` (322 lines)
- Current architecture: `src/components/Router/GameLayout.jsx` (607 lines), 25 CSS modules, mixed inline styles
- Backend structure: `server/src/server.js` (graceful shutdown, JWT validation), `server/src/models/User.js` (no indexes), `server/src/middleware/auth.js` (cookie + header auth)
- Sprite assets: `/public/assets/sprites/player/` (bodies, heads), `/public/assets/sprites/npcs/faceless/` (20 NPCs)
- Build config: `package.json` (Vitest, Playwright, no ESLint/Prettier), `vitest.config.js` (coverage excludes game/)
