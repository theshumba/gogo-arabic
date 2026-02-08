# Roadmap: GoGo Arabic

## Milestones

- SHIPPED **v2.0 Player Experience Overhaul** — Phases 1-9 (shipped 2026-02-08) → [archive](milestones/v2.0-ROADMAP.md)
- IN PROGRESS **v3.0 Infrastructure & Polish** — Phases 10-13 (started 2026-02-08)

## Phases

<details>
<summary>v2.0 Player Experience Overhaul (Phases 1-9) — SHIPPED 2026-02-08</summary>

- [x] Phase 1: Critical Fixes (2/2 plans) — 2026-02-08
- [x] Phase 2: Player Guidance (2/2 plans) — 2026-02-08
- [x] Phase 3: Feature Discoverability (2/2 plans) — 2026-02-08
- [x] Phase 4: Onboarding & HUD (3/3 plans) — 2026-02-08
- [x] Phase 5: Daily Dashboard (1/1 plan) — 2026-02-08
- [x] Phase 6: World Map Upgrade (1/1 plan) — 2026-02-08
- [x] Phase 7: Player Profile & Stats (1/1 plan) — 2026-02-08
- [x] Phase 8: Visual Polish & Sprites (1/1 plan) — 2026-02-08
- [x] Phase 9: Outfit System (1/1 plan) — 2026-02-08

</details>

### v3.0 Infrastructure & Polish (In Progress)

**Milestone Goal:** Pay down technical debt with comprehensive testing (80%+ coverage), architecture cleanup, backend hardening, performance optimization, and visual polish.

**Phase Numbering:** v3.0 continues from v2.0, starting at Phase 10.

---

#### Phase 10: Testing Foundation

**Goal:** Establish comprehensive test coverage as safety net before refactoring

**Depends on:** Phase 9 (v2.0 complete)

**Requirements:** TEST-01, TEST-02, TEST-03, TEST-04, TEST-05, TEST-06, TEST-07, TEST-08

**Success Criteria** (what must be TRUE):
1. All 12 Redux slices have passing unit tests covering reducers, actions, and selectors
2. Component tests cover HUD, DialogueOverlay, QuizOverlay, PauseMenu, DailyDashboard, WorldMap, and PlayerProfile with user interaction scenarios
3. Achievement middleware and daily goals middleware have integration tests verifying action sequences and side effects
4. Backend API tests exist for all 6 route files using supertest with mongodb-memory-server
5. E2E tests cover 5+ critical flows (auth, review session, quest completion, shop purchase, fast travel) using Playwright
6. Phaser game systems (MapLoader, NPCManager, PlayerController, DOMOverlay) have unit tests with proper scene mocks
7. Test coverage reaches 80%+ overall with thresholds enforced in vitest.config.js
8. EventBus listeners are cleaned up in global test teardown preventing cross-test contamination

**Plans:** TBD (estimate 3-4 plans)

Plans:
- [ ] 10-01: TBD
- [ ] 10-02: TBD
- [ ] 10-03: TBD

---

#### Phase 11: Architecture Cleanup

**Goal:** Refactor god component and establish architecture standards with test safety net in place

**Depends on:** Phase 10 (testing foundation complete)

**Requirements:** ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05, PERF-02

**Success Criteria** (what must be TRUE):
1. GameLayout is split into manageable sub-components with no file exceeding 300 lines
2. EventBus listeners are extracted into reusable custom hooks (useGameEvents, usePhaserBridge, useOverlayManager)
3. Inline styles in older components are migrated to CSS Modules with consistent naming conventions
4. ESLint and Prettier are configured with npm scripts (lint, lint:fix, format, format:check) enforcing code quality
5. All Redux slices use memoized selectors (createSelector) for array filtering and object transformations
6. Overlay z-index stack remains functional after refactoring (all 9 overlays render in correct order)

**Plans:** TBD (estimate 2-3 plans)

Plans:
- [ ] 11-01: TBD
- [ ] 11-02: TBD

---

#### Phase 12: Backend Hardening

**Goal:** Harden database and API with connection pooling, transactions, validation, and security improvements

**Depends on:** Phase 11 (architecture stable)

**Requirements:** BACK-01, BACK-02, BACK-03, BACK-04, BACK-05, BACK-06, PERF-01

**Success Criteria** (what must be TRUE):
1. MongoDB connection uses explicit pool configuration (maxPoolSize, minPoolSize, timeouts) with connection monitoring
2. Database indexes exist on frequently queried fields (User.email, userId+syncVersion compound, timestamps)
3. Sync endpoint uses MongoDB transactions for atomic version updates preventing race conditions
4. Per-user rate limiting is active alongside IP-based limits
5. All API endpoints validate request bodies using comprehensive Zod schemas
6. NoSQL injection prevention middleware (express-mongo-sanitize) protects all routes
7. Query optimization (projections, lean() queries, selective population) reduces response payloads by 30-50%

**Plans:** TBD (estimate 2 plans)

Plans:
- [ ] 12-01: TBD
- [ ] 12-02: TBD

---

#### Phase 13: Visual Polish

**Goal:** Replace placeholder visuals with consistent pixel art system for professional aesthetic

**Depends on:** Phase 11 (architecture stable, can run parallel with Phase 12)

**Requirements:** VPOL-01, VPOL-02, VPOL-03, VPOL-04, VPOL-05

**Success Criteria** (what must be TRUE):
1. HUD emoji icons are replaced with consistent 16x16 pixel art icons from a spritesheet
2. All 20 faceless NPC sprites have 2-frame idle animations running continuously
3. Player animation logic is centralized in a sprite animation state machine
4. Particle effects play on achievement unlock, level up, and quest completion
5. CSS pixel art rendering rules (image-rendering: pixelated) are applied to game canvas and all sprites

**Plans:** TBD (estimate 1-2 plans)

Plans:
- [ ] 13-01: TBD

---

## Progress

**Execution Order:**
Phases execute sequentially: 10 → 11 → 12/13 (12 and 13 can run in parallel after 11)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Critical Fixes | v2.0 | 2/2 | Complete | 2026-02-08 |
| 2. Player Guidance | v2.0 | 2/2 | Complete | 2026-02-08 |
| 3. Feature Discoverability | v2.0 | 2/2 | Complete | 2026-02-08 |
| 4. Onboarding & HUD | v2.0 | 3/3 | Complete | 2026-02-08 |
| 5. Daily Dashboard | v2.0 | 1/1 | Complete | 2026-02-08 |
| 6. World Map Upgrade | v2.0 | 1/1 | Complete | 2026-02-08 |
| 7. Player Profile & Stats | v2.0 | 1/1 | Complete | 2026-02-08 |
| 8. Visual Polish & Sprites | v2.0 | 1/1 | Complete | 2026-02-08 |
| 9. Outfit System | v2.0 | 1/1 | Complete | 2026-02-08 |
| 10. Testing Foundation | v3.0 | 0/TBD | Not started | - |
| 11. Architecture Cleanup | v3.0 | 0/TBD | Not started | - |
| 12. Backend Hardening | v3.0 | 0/TBD | Not started | - |
| 13. Visual Polish | v3.0 | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-08*
*Last updated: 2026-02-08 — v3.0 phases 10-13 added*
