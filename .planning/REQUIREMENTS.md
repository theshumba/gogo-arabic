# Requirements: v3.0 Infrastructure & Polish

**Milestone:** v3.0 Infrastructure & Polish
**Created:** 2026-02-08
**Coverage target:** 80%+ test coverage
**Scope:** Testing, Architecture, Backend Hardening, Performance, Visual Polish

---

## Testing Foundation

- [ ] **TEST-01**: All 12 Redux slices have unit tests covering reducers, actions, and selectors
- [ ] **TEST-02**: Component tests exist for HUD, DialogueOverlay, QuizOverlay, PauseMenu, DailyDashboard, WorldMap, and PlayerProfile
- [ ] **TEST-03**: Achievement middleware and daily goals middleware have integration tests covering action sequences and side effects
- [ ] **TEST-04**: Backend API tests exist for all 6 route files (auth, user, shop, quest, review, game) using supertest + mongodb-memory-server
- [ ] **TEST-05**: E2E tests cover 5+ critical user flows (auth, review session, quest completion, shop purchase, fast travel) using Playwright
- [ ] **TEST-06**: Phaser game systems (MapLoader, NPCManager, PlayerController, DOMOverlay) have unit tests with proper scene mocks
- [ ] **TEST-07**: Test coverage reaches 80%+ overall with coverage thresholds enforced in vitest.config.js
- [ ] **TEST-08**: EventBus listeners are cleaned up in global test teardown (afterEach) to prevent cross-test contamination

## Architecture Cleanup

- [ ] **ARCH-01**: GameLayout (607 lines) is split into sub-components with no file exceeding 300 lines
- [ ] **ARCH-02**: EventBus listeners are extracted into custom hooks (useGameEvents, usePhaserBridge, useOverlayManager)
- [ ] **ARCH-03**: Inline styles in older components are migrated to CSS Modules with consistent naming
- [ ] **ARCH-04**: ESLint (flat config) and Prettier are configured with npm scripts (lint, lint:fix, format, format:check)
- [ ] **ARCH-05**: Memoized selectors (createSelector) replace plain selector functions in all Redux slices

## Backend Hardening

- [ ] **BACK-01**: MongoDB connection uses explicit pool config (maxPoolSize, minPoolSize, timeouts) with connection monitoring
- [ ] **BACK-02**: Database indexes exist on frequently queried fields (User.email, userId+syncVersion compound, timestamps)
- [ ] **BACK-03**: Sync endpoint uses MongoDB transactions for atomic version updates (prevents race conditions)
- [ ] **BACK-04**: Per-user rate limiting is implemented alongside existing IP-based limits
- [ ] **BACK-05**: All API endpoints have comprehensive Zod validation schemas for request bodies
- [ ] **BACK-06**: NoSQL injection prevention middleware (express-mongo-sanitize) is active on all routes

## Performance

- [ ] **PERF-01**: Query optimization applied (projections, lean() queries, selective population) to reduce response payloads
- [ ] **PERF-02**: Redux selectors that perform array filtering or object transformations use createSelector for memoization

## Visual Polish

- [ ] **VPOL-01**: HUD emoji icons are replaced with consistent 16x16 pixel art icons from a spritesheet
- [ ] **VPOL-02**: All 20 faceless NPC sprites have 2-frame idle animations
- [ ] **VPOL-03**: Player animation logic is centralized in a sprite animation state machine
- [ ] **VPOL-04**: Particle effects play on achievement unlock, level up, and quest completion
- [ ] **VPOL-05**: CSS pixel art rendering rules (image-rendering: pixelated) are applied to game canvas and sprites

---

## Traceability

| Requirement | Phase | Category | Priority | Status |
|-------------|-------|----------|----------|--------|
| TEST-01 | Phase 10 | Testing | Must Have | Pending |
| TEST-02 | Phase 10 | Testing | Must Have | Pending |
| TEST-03 | Phase 10 | Testing | Must Have | Pending |
| TEST-04 | Phase 10 | Testing | Must Have | Pending |
| TEST-05 | Phase 10 | Testing | Should Have | Pending |
| TEST-06 | Phase 10 | Testing | Should Have | Pending |
| TEST-07 | Phase 10 | Testing | Must Have | Pending |
| TEST-08 | Phase 10 | Testing | Must Have | Pending |
| ARCH-01 | Phase 11 | Architecture | Must Have | Pending |
| ARCH-02 | Phase 11 | Architecture | Must Have | Pending |
| ARCH-03 | Phase 11 | Architecture | Should Have | Pending |
| ARCH-04 | Phase 11 | Architecture | Should Have | Pending |
| ARCH-05 | Phase 11 | Architecture | Should Have | Pending |
| PERF-02 | Phase 11 | Performance | Should Have | Pending |
| BACK-01 | Phase 12 | Backend | Must Have | Pending |
| BACK-02 | Phase 12 | Backend | Must Have | Pending |
| BACK-03 | Phase 12 | Backend | Must Have | Pending |
| BACK-04 | Phase 12 | Backend | Should Have | Pending |
| BACK-05 | Phase 12 | Backend | Should Have | Pending |
| BACK-06 | Phase 12 | Backend | Must Have | Pending |
| PERF-01 | Phase 12 | Performance | Should Have | Pending |
| VPOL-01 | Phase 13 | Visual | Should Have | Pending |
| VPOL-02 | Phase 13 | Visual | Should Have | Pending |
| VPOL-03 | Phase 13 | Visual | Nice to Have | Pending |
| VPOL-04 | Phase 13 | Visual | Nice to Have | Pending |
| VPOL-05 | Phase 13 | Visual | Should Have | Pending |

**Coverage:** 26/26 requirements mapped to phases (100%)

---

## Out of Scope

- 100% test coverage (diminishing returns past 80%)
- TypeScript migration (incremental adoption only, not this milestone)
- Storybook or visual regression testing infrastructure
- Microservices refactoring
- Real-time multiplayer
- Docker for local development
- GraphQL migration

---
*Requirements defined: 2026-02-08*
*26 requirements across 5 categories*
*Traceability updated: 2026-02-08 — all requirements mapped to phases 10-13*
