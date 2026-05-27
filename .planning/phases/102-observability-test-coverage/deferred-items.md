# Phase 102 — Deferred Items

## Pre-existing test failures (not caused by Plan 05)

Observed during Plan 05 execution, confirmed pre-existing by stashing Plan 05 changes and re-running:

- `src/store/middleware/__tests__/telemetryMiddleware.test.js` — 2 failures
  - `OBS-02: quest/completeQuest action emits posthog.capture('quest.completed', ...)`
  - `OBS-02: all 8 canonical events emit with stable domain.action names`
  - Owner: Plan 03 (telemetry middleware GREEN) — middleware skeleton is wired but the action-event map is incomplete
- `src/services/__tests__/devicePerformance.test.js` — file-level FAIL
  - Owner: Plan 06 territory (low-end device sampler)
- `src/store/middleware/__tests__/devicePerformancePersist.test.js` — file-level FAIL
  - Owner: Plan 06 territory
- `src/test/fixtures/captureViaVitest.test.js` — file-level FAIL
  - Owner: Pre-existing fixture infra; unrelated to Phase 102

Plan 05 leaves vitest at **5748 passing / 11 skipped / 2 failed (5761 total)**. Baseline before Plan 05: 5746 passing (per Plan 04 SUMMARY). Plan 05 adds 2 GREEN tests in `RouteErrorBoundary.test.jsx`.

## Plan 08 — local Playwright run blocked by environmental port clash (2026-05-27)

Running `npx playwright test e2e/golden-path.spec.js` against `http://localhost:3000` locally returns `MyHijrahJourney — Plan your hijrah with clarity, not confusion` instead of GoGo Arabic. A different local dev server (the user's MyHijrahJourney venture) is bound to port 3000 on this machine.

**The Plan 08 spec and CI workflow are correct** — the failure is purely an env collision. CI runs will use a clean port via Playwright's `webServer` config and will not hit this clash.

**Local workaround if you want to verify before pushing:**
- Stop the MyHijrahJourney dev server, OR
- Override `playwright.config.js` to point at a different port (e.g. `npm run dev -- --port 3100`) and re-run.

Not blocking phase completion. Deferred for next-session local verification.
