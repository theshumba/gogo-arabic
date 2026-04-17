# Phase 98 — Validation Architecture

**Derived from:** 98-RESEARCH.md Validation Architecture section
**Purpose:** Single source of truth for how Phase 98 validates itself — what commands run, what invariants hold, what artifacts are expected.

This document is referenced from every plan in Phase 98 (01-07). The executor consults this file to know which validation commands to run at each commit, at each wave merge, and at the phase gate.

## Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest 3.0 (already installed, see vitest.config.js) |
| Config file | vitest.config.js (root) |
| Quick run command | `npm run test:run` |
| Full suite command | `npm run test:run && npm run test:e2e` |
| Coverage command | `npm run test:coverage` |
| Coverage summary JSON | coverage/coverage-summary.json |
| Lint command | `npm run lint` |
| Build command | `npm run build` |
| Vocab validation | `npm run vocab:validate` |
| Ink compile | `npm run ink:compile` |
| Smoke tests | `npx playwright test tests/e2e/smoke/phase98-smoke.spec.js` |
| Feature invariants | `npx vitest run src/test/phase98-invariants.test.js` |

## Requirements-to-Test Map

| Req ID | Behaviour | Test Type | Automated Command | Owner Plan |
|--------|-----------|-----------|-------------------|------------|
| HEALTH-01 | 98-AUDIT.md exists before any refactor commits | File existence | `test -f .planning/phases/98-codebase-audit-and-refactor/98-AUDIT.md` | 98-01 |
| HEALTH-02 | Every deletion has a ticked DELETIONS.md row | Commit-body grep | `git log --grep='DELETIONS.md row' ...` | 98-03 |
| HEALTH-03 | Zero silent deletions (git invariant) | Post-plan script | Grep `delete mode` without DELETIONS ref | 98-03, 98-06 |
| HEALTH-04 | Coverage above or equal to baseline per refactored directory | Coverage ratchet | `npm run test:coverage` | 98-02, 98-07 |
| HEALTH-05 | All tests pass at every commit | `npm run test:run` exit 0 | `npm run test:run` | all plans |
| HEALTH-06 | Feature smoke tests pass | Playwright spec | `npx playwright test tests/e2e/smoke/phase98-smoke.spec.js` | 98-07 |
| HEALTH-07 | Test-count invariant at or above 2535 | vitest output | `npm run test:run` then parse count | all plans |
| HEALTH-08 | Dependency graph SVG artifact present | File existence | `test -f .planning/phases/98-codebase-audit-and-refactor/98-01-DEPENDENCY-GRAPH.svg` | 98-01 |
| HEALTH-09 | Phases 86-96 each have disposition | AUDIT.md section 8 | `grep -c '^### Phase 8' .../98-AUDIT.md` | 98-01, 98-06 |
| HEALTH-10 | Ralph pipeline untouched OR each change user-approved | git diff scripts/ralph | manual verify | 98-01, 98-07 |
| HEALTH-11 | Every refactor commit atomic | git log | one commit per AUDIT section reference | 98-03..98-06 |
| HEALTH-12 | Bundle size less than or equal to baseline | `du -sb dist` | comparison to baseline | 98-07 |
| HEALTH-13 | Test runtime within 20% of baseline | `time npm run test:run` | comparison to baseline | 98-07 |
| HEALTH-14 | LOC reduced by target (10% aspirational) without feature loss | `wc -l` + smoke tests | comparison to baseline | 98-07 |

## Sampling Rate

| Gate | Commands |
|------|----------|
| Per-task commit | `npm run test:run && npm run lint` |
| Per refactor touching a system | The invariant test for that system's feature count (see phase98-invariants.test.js) |
| Per wave merge | `npm run test:run && npm run test:coverage && npm run build` |
| Phase gate (Plan 07) | All three numeric invariants (test count at or above 2535, bundle size at or below baseline, test runtime within 20%) + `tests/e2e/smoke/phase98-smoke.spec.js` all 15 green |

## Wave-0 Artifact Creation Checklist (Plan 01)

- [ ] .planning/phases/98-codebase-audit-and-refactor/98-AUDIT.md
- [ ] .planning/phases/98-codebase-audit-and-refactor/98-DELETIONS.md
- [ ] .planning/phases/98-codebase-audit-and-refactor/98-01-DEPENDENCY-GRAPH.svg
- [ ] .planning/phases/98-codebase-audit-and-refactor/98-01-BASELINE.json
- [ ] .planning/phases/98-codebase-audit-and-refactor/98-01-COVERAGE-HEATMAP.md
- [ ] knip.json (root)
- [ ] .dependency-cruiser.cjs (root)
- [ ] tests/e2e/smoke/phase98-smoke.spec.js
- [ ] src/test/phase98-invariants.test.js
- [ ] devDependencies added: knip, depcheck, madge, dependency-cruiser
- [ ] scripts/ralph/prd.json renamed to prd.json.paused-for-phase98

## Regression Detection Invariants

The three numeric invariants are the key novel safety net for Phase 98:

1. **Test-count invariant:** phase98-baseline.json records `testCount: 2535` (or higher). Every commit runs vitest run, parses test count, asserts count is at or above baseline. Anything less fails the commit.

2. **Bundle-size invariant:** phase98-baseline.json records pre-phase dist/ byte count (after `npm run build`). Every commit touching build-relevant code runs npm run build and asserts new size less than or equal to baseline.

3. **Test-runtime invariant:** phase98-baseline.json records pre-phase `npm run test:run` wall time. 20% regression window is tolerated; beyond that, the commit is flagged for review (not auto-failed) because runtime can be noisy.

Together, these three form the "this refactor didn't secretly break things" safety net.

## Smoke-Test Failure Policy

If any of the 15 Playwright smoke tests fails at ANY point during Phase 98:
1. Stop the current plan immediately.
2. git revert the most recent commit if it's the cause.
3. Record the failure in the current plan's SUMMARY.md.
4. Open an AUDIT.md addendum noting the regression.
5. Do NOT proceed to the next task until smoke green.

Smoke tests are the load-bearing feature-preservation gate. A red smoke test is the signal that the refactor broke a user-visible feature.

## Coverage Ratchet Policy

At the start of Phase 98, `vitest.config.js` has thresholds: statements 24, branches 73, functions 39, lines 24 (approximate, verify from the actual file).

Plan 02 raises directory-level coverage for refactor-target directories. Plan 07 ratchets the GLOBAL thresholds upward to lock in the gain, using:

```
new_threshold = min(achieved_global_percentage, current_threshold + 5)
```

This prevents over-ratcheting (thresholds higher than current state would fail the next test run) and under-ratcheting (wasting the uplift).

## Security Validation

Phase 98 has minimal security surface (refactor phase, no new inputs/endpoints/crypto). The relevant invariants:

| Pattern | Control |
|---------|---------|
| server/src/middleware/ listed as knip entry point | NEVER flagged as unused |
| server/src/validation/*.js changes require schema-round-trip test | enforced per refactor |
| server/src/app.js middleware chain read-only | forbidden-target list in Plans 04/05 |
| env-var references (JWT_SECRET, MONGODB_URI) | never renamed or removed |

## Commands Quick Reference

```bash
# Full validation sweep (run at phase gate)
npm run test:run && \
npm run lint && \
npm run build && \
npx vitest run src/test/phase98-invariants.test.js && \
npx playwright test tests/e2e/smoke/phase98-smoke.spec.js && \
npm run test:coverage

# Baseline capture (Plan 01 Task 2)
find src server scripts -type f \( -name '*.js' -o -name '*.jsx' \) ! -name '*.test.*' | xargs wc -l | tail -1
du -sb dist | awk '{print $1}'
git rev-parse HEAD

# Static analysis (Plan 01 Task 3)
npx knip --reporter text
npx knip --reporter json
npx depcheck --json
npx madge --circular --extensions js,jsx src/
npx depcruise --config .dependency-cruiser.cjs --output-type dot src/ | dot -Tsvg > .planning/phases/98-codebase-audit-and-refactor/98-01-DEPENDENCY-GRAPH.svg

# HEALTH-03 git invariant audit (Plan 03 Task 3, Plan 07 Task 1)
git log --since="<phase start>" --pretty=format:"%H %s%n%b" | awk '/^[a-f0-9]{40}/{sha=$1; next} /delete mode/ && !/DELETIONS.md row/{print "VIOLATION: " sha; bad=1} END{exit bad}'
```

## References

- 98-RESEARCH.md Validation Architecture section (full rationale)
- 98-CONTEXT.md Hard Guardrails (non-negotiable invariants)
- vitest.config.js (coverage thresholds and reporters)
- playwright.config.js (smoke-test runner config)
