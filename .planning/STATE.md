---
gsd_state_version: 1.0
milestone: v16.0
milestone_name: Visual Rebuild
status: review-fix sweep in flight
stopped_at: Phase 97 closed; code-review remediation in progress
last_updated: "2026-05-17T03:30:00.000Z"
last_activity: 2026-05-17 -- 4-agent swarm landed 8 commits on fix/redux-state-2026-05-15
progress:
  total_phases: 18
  completed_phases: 10
  total_plans: 55
  completed_plans: 31
  percent: 56
---

# Project State

## Project Reference

See: .planning/PROJECT.md
**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world.
**Current focus:** v16.0 Phase 97 (Visual Rebuild) is in-tree complete; 6 parallel branches are absorbing findings from the master code review before merge to main.

## Current Position

Active branch: `fix/redux-state-2026-05-15`
Phase: 97 of 101 (v16.0)
Status: Phase 97 complete, code-review remediation ~70%, no deploy phase exists

Progress: [████████░░] 80% v16.0 — 1 of 1 planned phase complete; remediation ongoing

### Shipped Milestones

(See prior STATE.md history through v15.0 — unchanged. Adding:)

| Version | Phases | Plans | Date |
|---------|--------|-------|------|
| v16.0 Visual Rebuild | 97 | 8 | 2026-05-15 (in-tree, not deployed) |

**Cumulative:** 86 phases in-tree, 237+ plans, 16 milestones.

## v16.0 — Phase 97 Visual/World Layer Rebuild

All 8 plans closed:
- 97-01 → 97-04: snapshot fixtures + WORLD-AUDIT scaffolding
- 97-05: snow/grass biome parity (WORLD-09, WORLD-10)
- 97-06: dangling Kenmi reference cleanup (WORLD-01)
- 97-07: 8 zone snapshot capture (WORLD-02, 07, 12)
- 97-08: WORLD-AUDIT execution summary (WORLD-04, 05, 08)

**Lucas PR rejected** — out-of-scope (deleted 20+ shipped overlay imports, broke snapshot tests, broken shader). Not merged.

**Verification gap:** No human browser walk-through of all 8 zones since 97-08 closure. WorldSnapshot test suite (11 tests) is still failing — expected during rebuild; rebaseline scheduled as part of pre-deploy verification.

## Code-Review Remediation State (2026-05-17)

6 parallel fix branches absorbing master review findings:
- `fix/redux-state-2026-05-15` ← **active branch**, 8 swarm commits today + earlier review-01 work
- `fix/services-persistence-2026-05-15` (separate worktree)
- `fix/game-systems-2026-05-15` (separate worktree)
- `fix/learning-components-2026-05-15` (separate worktree)
- `fix/player-ui-2026-05-15` (separate worktree)
- `fix/infra-utils-tests-2026-05-15` (separate worktree)

6 stashes accumulated across these branches — review before discarding.

### Today's swarm (4 agents, opus, 8 commits)

| Branch (merged into active) | Fix |
|---|---|
| swarm/middleware-criticals | loginReward REHYDRATE gate; FSRS payload shape (battle/zone/poetry); tutorialMiddleware onboarding2 |
| swarm/persistence-srs | indexedDBAdapter null-deref guard; forgettingCurveService + HUD fake-time test fixtures + getRetentionHealth null-card skip |
| swarm/lint-test-infra | eslint cjs/mjs override; eventBus import depth in 2 middleware tests |
| swarm/react-hooks-violations | CraftingResult 5 hooks-after-early-return violations |
| (post-swarm chore) | eslint ignore `.claude/worktrees` |

## Test Health

- **5650 tests / 5623 passing / 19 failing across 5 files**
  - `WorldSnapshot.test.js` (11) — expected, rebaseline pending
  - `zoneReviewMiddleware.test.js` (5) — logic failures; loads now but `each middleware provided to configureStore must be a function` error; not the swarm's scope
  - `datasetValidation.test.js` (2) — content drift (scholars 29/30, chains 19/20)
  - `settingsSlice.test.js` (1) — initial-state key-count drift (20 expected, 22 actual)
  - `battle.integration.test.js` — pre-existing
- **Lint: 24 errors / 263 warnings** (down from 153/263 pre-swarm; worktree-recursion masked this)

## Blockers / Concerns

**Newly surfaced — not yet ticketed:**
1. `src/store/slices/onboardingSlice.js` selectors (lines 123, 172, 173, 179-180, 188-189) all read `state.onboarding` while the slice mounts as `onboarding2`. Tutorial selectors return `undefined` in production. Same family as the swarm-A/3 tutorialMiddleware fix.
2. `src/components/PoetryBattleOverlay.jsx:140` dispatches `addFsrsCard` with `card: null` — sibling to the swarm-A/2 fix.
3. `src/components/HUD/HUD.jsx:8,36` imports `selectReviewQueueCount` and assigns it to `reviewDueCount` — value never read; dead code.
4. `getRetentionHealth` has no app-side caller — confirm intentional vs stale.
5. 15 of remaining 24 lint errors are `react-hooks/rules-of-hooks` in non-CraftingResult components (Agent D's scope was the 5 found at original audit; Agent C's lint-config fix exposed more).

**Strategic decisions needed (carried from audit):**
- Lucas contract — paid/refunded/re-scoped? No recorded decision.
- Ship target — web only? Deferred Phase 12 (backend) blocks anything beyond localStorage/IndexedDB.
- Phase 98 (Codebase Audit & Refactor, 7 plans drafted) — execute or defer to ship?
- 86-96 phase stubs (Ramadan, leaderboards, tutorial refresh, idioms, etc.) — kill, defer, or fold into post-launch backlog?
- **No deploy phase exists anywhere in ROADMAP.** Needs to be created.

## Roadmap Forward

| Phase | Milestone | Status | Notes |
|---|---|---|---|
| 97 Visual/World Rebuild | v16.0 | ✅ in-tree complete | Browser walkthrough still pending |
| 98 Codebase Audit & Refactor | v17.0 | 7 plans drafted, 2 are stubs | Hygiene; defer-or-execute call |
| 99 Curriculum Orchestrator | v18.0 | CONTEXT stub only | Post-ship |
| 100 Dynamic NPC AI w/ Memory | v18.0 | CONTEXT stub only | Post-ship |
| 101 Procedural Quest Generation | v18.0 | CONTEXT stub only | Post-ship |
| 86–96 | unassigned | 11 empty stubs | Content backlog; 98-06 supposed to triage |
| **(missing)** Deploy | — | not in roadmap | **Critical gap** |

## Ralph status

Intentionally paused (Phase 98 plan explicitly pauses Ralph). `scripts/ralph/progress.txt` last written 2026-04-09. 65 unfinished user stories across 6 PRDs are dead weight if Ralph is not resuming.

## Session Continuity

Last session: 2026-05-17 (this one)
Stopped at: 4-agent swarm merged, STATE.md refreshed, follow-up bugs flagged but unticketed
Resume: pick from the "Newly surfaced" blockers list OR address the 4 strategic decisions OR begin Phase 98 execution
