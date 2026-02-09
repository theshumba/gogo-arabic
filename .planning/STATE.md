# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-08)

**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"
**Current focus:** v3.0 Infrastructure & Polish — Phase 11: Architecture Cleanup

## Current Position

Phase: 11 of 13 (Architecture Cleanup)
Plan: 03 of 6 complete
Status: In progress
Last activity: 2026-02-09 — Completed 11-02-PLAN.md (GameLayout Hook Extraction)

Progress: ███░░░ 50% (Wave 1: 11-01, 11-02, 11-03 complete)

## Performance Metrics

**v2.0 Velocity:**
- Total plans completed: 14
- Phases: 9
- Files modified: 253
- Timeline: 1 day

**v3.0 Progress:**
- Phases defined: 4 (phases 10-13)
- Requirements mapped: 26/26 (100% coverage)
- Ready to begin Phase 10 planning

## Accumulated Context

### Decisions

All v2.0 decisions logged in PROJECT.md Key Decisions table with outcomes.

**v3.0 Phase 10 Decisions:**

| Decision | Plan | Rationale | Outcome |
|----------|------|-----------|---------|
| Pre-seeded localStorage state for E2E tests | 10-05 | Complex game flows require advanced state; pre-seeding is faster and more reliable than playing through | Pattern established for future E2E tests |
| Focus E2E tests on React UI, not Phaser canvas | 10-05 | Canvas interaction is brittle; Phaser systems covered by unit tests; E2E should test user-facing overlays | Tests resilient to Phaser implementation changes |
| Chromium-only Playwright project | 10-05 | Simplify CI execution; multi-browser can be added later if needed | Faster test execution |
| Use configureStore directly for middleware tests | 10-04 | createTestStore omits middleware; need real middleware chain for integration tests | Middleware tests accurately verify side effects |
| Use fireEvent instead of userEvent in component tests | 10-04 | userEvent.setup() causing 5-second timeouts on interactions | Tests run faster and more reliably |

**v3.0 Phase 11 Decisions:**

| Decision | Plan | Rationale | Outcome |
|----------|------|-----------|---------|
| ESLint 9 flat config with ESM export default | 11-01 | Project uses "type": "module", flat config is native ESM and future-proof | eslint.config.js with clean structure |
| Include React hooks plugin with recommended rules | 11-01 | Catch React anti-patterns (conditional hooks, missing deps) before runtime | Found 1 real issue in AlphabetModule.jsx |
| Separate Node.js globals for server/ and scripts/ | 11-01 | Build scripts need process, server needs Node APIs, src/ needs browser globals | Zero false positive 'process is not defined' errors |
| eslint-config-prettier as last config entry | 11-01 | Must be last to properly disable ESLint formatting rules that conflict with Prettier | Clean integration, no rule conflicts |
| Keep ActivitiesMenu and PauseMenu inline in GameLayout | 11-02 | Small (60 and 35 lines), colocated, only used by GameLayout - extracting adds file overhead without clarity benefit | GameLayout at 209 lines, well under 300 |
| useEventBusListeners takes navigate as third parameter | 11-02 | Hook needs navigate for 3 handlers - passing it in keeps hook decoupled from router context | Signature: (phaserRef, playSFX, navigate) |
| useKeyboardShortcuts suppresses shortcuts when overlays open | 11-02 | Prevents M/L keys from interfering with dialogue, quizzes, menus, signs | 4 Redux selectors for overlay state |
| Use createSelector only for transformations, not simple property access | 11-03 | Avoids over-memoization while preventing re-renders from array/object recreations | 5 memoized selectors for transformations, 28 plain selectors for properties |
| Export selectors at slice level, not in separate files | 11-03 | Co-location improves discoverability and maintainability | All 12 slices now have consistent selector exports |

### v3.0 Roadmap Structure

**4 phases identified:**
- Phase 10: Testing Foundation (8 requirements) — safety net before refactoring
- Phase 11: Architecture Cleanup (6 requirements) — depends on Phase 10
- Phase 12: Backend Hardening (7 requirements) — depends on Phase 11
- Phase 13: Visual Polish (5 requirements) — depends on Phase 11, can run parallel with Phase 12

**Coverage:** All 26 v3.0 requirements mapped to phases (no orphans)

### Pending Todos

None.

### Blockers/Concerns

**RESOLVED - Phase 10 complete:**
- ✓ 548 passing tests across 31 test files (unit, integration, component, E2E)
- ✓ 12 Redux slice tests, 2 middleware tests, 6 Phaser system tests, 7 component tests, 5 E2E flows
- ✓ Coverage thresholds enforced: 25% stmts / 70% branch / 50% funcs / 25% lines
- ✓ Core business logic (slices, systems, middleware) at 90%+ coverage
- ✓ EventBus cleanup pattern established and verified across all tests

**Ready for Phase 11:**
- All middleware tested before god component extraction
- All major UI components have integration tests with real Redux state
- E2E tests verify critical user flows work end-to-end
- Coverage thresholds prevent regression during refactoring

## Session Continuity

Last session: 2026-02-09
Stopped at: Phase 11 Plan 02 complete - GameLayout hook extraction (607 → 209 lines, 66% reduction)
Resume file: .planning/phases/11-architecture-cleanup/11-02-SUMMARY.md
Next step: Continue with remaining Phase 11 plans (04, 05, 06)

---
*State initialized: 2026-02-08*
*Last updated: 2026-02-09 — Phase 11 Plan 02 complete (GameLayout Hook Extraction)*
