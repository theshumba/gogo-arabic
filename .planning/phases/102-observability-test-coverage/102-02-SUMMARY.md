---
phase: 102-observability-test-coverage
plan: 02
subsystem: observability/posthog
tags: [observability, telemetry, posthog, privacy, opt-out, OBS-01, OBS-03, OBS-04, OBS-07]
requires:
  - 102-01 (Wave 0 RED scaffolds for OBS-01..07 — landed in commits a4119c8 + e41c804)
provides:
  - PostHog SDK loaded + initialised before first store.dispatch
  - opt-OUT-default telemetry gate (Redux slice + SDK config — belt+braces)
  - SettingsMenu Privacy toggle wired to slice AND SDK
  - telemetryMiddleware skeleton registered in store (Plan 03 fills vocabulary)
  - initTelemetryEventBusRelay call-site in main.jsx (Plan 03 fills handlers)
affects:
  - src/main.jsx (boot sequencing)
  - src/store/store.js (middleware chain)
  - vite.config.js (manualChunks bundle split)
tech-stack:
  added:
    - posthog-js@1.376.2 (peer of @posthog/react@1.9.1)
    - "@posthog/react@1.9.1 (PostHogProvider)"
  patterns:
    - Module-scoped initialised-flag idempotency guard (posthogClient._initialized)
    - Belt+braces opt-out (Redux slice short-circuit AND SDK opt_out_capturing)
    - Vendor-chunk isolation for upgrade-stable hashing (posthog-vendor)
    - Graceful no-op when env key empty (deferred PostHog org creation)
key-files:
  created:
    - src/services/posthogClient.js
    - src/store/middleware/telemetryMiddleware.js
    - .env.example
  modified:
    - src/main.jsx
    - src/store/store.js
    - src/store/slices/settingsSlice.js
    - src/store/__tests__/settingsSlice.test.js
    - src/components/Menu/SettingsMenu.jsx
    - src/components/Menu/__tests__/SettingsMenuTelemetry.test.jsx
    - src/services/__tests__/posthogClient.test.js
    - vite.config.js
    - package.json
    - package-lock.json
decisions:
  - Skeleton-then-fill split — Plan 02 registers telemetryMiddleware in store with empty ACTION_EVENT_MAP; Plan 03 only edits the middleware file, never store.js. Keeps the registration commit and the vocabulary commit independent (easier revert, smaller diffs).
  - handleTelemetryToggle exported from SettingsMenu — Plan 01 RED test calls it directly (Plan 04 alternative would have been an inline arrow function, but a named export gives the test a stable surface).
  - captureCanvas intentionally omitted (not set to false) — keeps the config minimal and self-documenting; tests assert "not true" which is satisfied by omission.
  - Privacy section placed BEFORE Data Export — surfaces the opt-out toggle higher up in the settings flow (more visible to users who actually care).
metrics:
  duration: 18m
  completed: 2026-05-27
---

# Phase 102 Plan 02: PostHog SDK install + opt-out-default + telemetry middleware skeleton — Summary

PostHog SDK (posthog-js@1.376.2 + @posthog/react@1.9.1) installed, initialised in `main.jsx` BEFORE the first `store.dispatch`, defaults to opt-OUT for ALL users (no age-gate per RESEARCH Pitfall 7), and wired through a SettingsMenu "Share anonymous usage data" toggle that hits BOTH the Redux slice (middleware short-circuit) AND the SDK (`opt_in_capturing`/`opt_out_capturing` belt+braces). Telemetry middleware ships as a registered skeleton — Plan 03 fills in the canonical event vocabulary without touching store configuration.

## Outcome

- **5744 vitest passing** (baseline was 5623 — +121 net) across 277 files. Pre-existing 19 failing dropped to 6 failing (3 in `telemetryMiddleware.test.js` and 3 in `RouteErrorBoundary.test.jsx`, both Plan 03 / Plan 05 territory respectively).
- **Three Plan 01 RED scaffolds turned GREEN by Plan 02:** `posthogClient.test.js` (7/7), `SettingsMenuTelemetry.test.jsx` (5/5), and the existing `settingsSlice.test.js` initial-state shape test.
- **PostHog SDK is dormant** — `VITE_POSTHOG_KEY` is empty in `.env.local`, so `initPostHog()` is a graceful no-op until the user manually creates a "Gogo Arabic" project in the FrameCoach PostHog org and fills the key in.
- **Build chunking preserved:** new `posthog-vendor` `manualChunks` entry isolates the SDK so app-chunk hashes don't churn on SDK upgrades (RESEARCH Pitfall 2).

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | d7afa55 | Install posthog-js@1.376.2 + @posthog/react@1.9.1; add posthog-vendor chunk; create .env.example |
| 2 | b89d8b5 | Author posthogClient.js + wire initPostHog() BEFORE first store.dispatch; add PostHogProvider |
| 3 | bc6505c | settingsSlice.telemetryOptOut + SettingsMenu Privacy toggle + telemetryMiddleware skeleton |

## Files Modified / Created

**Created (3):**
- `src/services/posthogClient.js` — canonical `posthog.init()` config wrapper; exports `initPostHog`, `getPostHog`, `optInTelemetry`, `optOutTelemetry`. Idempotent (`_initialized` module flag), graceful no-op when key missing.
- `src/store/middleware/telemetryMiddleware.js` — pass-through skeleton with opt-out short-circuit + try/catch envelope. Exports `telemetryMiddleware`, `ACTION_EVENT_MAP` (currently `{}`), `initTelemetryEventBusRelay` (currently no-op).
- `.env.example` — repo-root template documenting `VITE_POSTHOG_KEY` (blank) + `VITE_POSTHOG_HOST` (https://eu.i.posthog.com — EU residency for UK user).

**Modified (8):**
- `src/main.jsx` — import `initPostHog` + `getPostHog` + `initTelemetryEventBusRelay`; call `initPostHog()` and `initTelemetryEventBusRelay(store)` BEFORE the four `store.dispatch(...)` calls; wrap `<Provider>` children with `<PostHogProvider client={getPostHog()}>`.
- `src/store/store.js` — import `telemetryMiddleware`, append to `getDefaultMiddleware().concat(...)` chain (placed last so it sees actions after all other middleware processing).
- `src/store/slices/settingsSlice.js` — add `telemetryOptOut: true` to `initialState`; add `setTelemetryOptOut` reducer + `selectTelemetryOptOut` selector; export `setTelemetryOptOut` action.
- `src/store/__tests__/settingsSlice.test.js` — add `telemetryOptOut: true` to the initial-state shape assertion (was the pre-existing "key-count drift" failure in STATE.md; now GREEN).
- `src/components/Menu/SettingsMenu.jsx` — new Privacy section with "Share anonymous usage data" toggle; toggle handler dispatches `setTelemetryOptOut(next)` AND calls the exported `handleTelemetryToggle(optedIn)` function (which routes to `optInTelemetry()` / `optOutTelemetry()` from posthogClient).
- `src/components/Menu/__tests__/SettingsMenuTelemetry.test.jsx` — remove the Plan 01 hard-RED gate `it()` block.
- `src/services/__tests__/posthogClient.test.js` — remove the Plan 01 hard-RED gate `it()` block.
- `vite.config.js` — add `posthog-vendor` entry to `manualChunks` for `node_modules/posthog-js` and `node_modules/@posthog/react`.
- `package.json` + `package-lock.json` — pin `posthog-js@^1.376.2`, `@posthog/react@^1.9.1`.

## RED → GREEN transitions

| Test file | Before | After |
|-----------|--------|-------|
| `src/services/__tests__/posthogClient.test.js` | 0/7 passing (module didn't exist + hard RED gate) | **7/7 GREEN** |
| `src/components/Menu/__tests__/SettingsMenuTelemetry.test.jsx` | 0/5 passing (slice key + handler export both missing + hard RED gate) | **5/5 GREEN** |
| `src/store/__tests__/settingsSlice.test.js` | 33/35 passing (initial-state shape mismatch) | **35/35 GREEN** |
| `src/store/middleware/__tests__/telemetryMiddleware.test.js` | 0/6 passing (module didn't exist) | **3/6 GREEN** (opt-out short-circuit + resilience GREEN; canonical-event vocabulary still RED — Plan 03 territory) |

## Deviations from Plan

### None blocking. Two minor observations:

**1. [Note] Plan 03 tests partially GREEN as a side-effect.** The Plan 02 skeleton's opt-out short-circuit + try/catch envelope is enough to turn 3 of the 6 `telemetryMiddleware.test.js` assertions GREEN (the opt-out short-circuit test, the resilience test, and one other). The remaining 3 (canonical-event vocabulary, PII filter, hard RED gate) are still RED — they require `ACTION_EVENT_MAP` to be populated, which is explicitly Plan 03's job per the Plan 02 PLAN.md `<must_haves>`. The orchestrator's `<execution_rules>` rule 11 ("these MUST all be GREEN") is in tension with the plan file itself, which scopes the middleware vocabulary to Plan 03. I followed the plan file (skeleton only) rather than implementing Plan 03 inside Plan 02. Touching the canonical event vocabulary now would be scope creep and would invalidate Plan 03's planned diff.

**2. [Note] `captureCanvas` is omitted rather than explicitly set to `false`.** The Plan 01 RED test accepts either omission or explicit `false`. Omission keeps the config minimal and self-documenting (a code comment explains why). Acceptable per the test's `expect(config.session_recording?.captureCanvas).not.toBe(true)` assertion.

## Threat Flags

None — no new network surface, no new auth paths, no new file-access patterns introduced beyond what `<threat_model>` already covers. The PostHog SDK introduces an egress path to `https://eu.i.posthog.com` which is gated by the `opt_out_capturing_by_default: true` flag AND the empty `VITE_POSTHOG_KEY` (no init runs until a key is filled in).

## Known Stubs

**1. `ACTION_EVENT_MAP` is empty in `telemetryMiddleware.js`.**
- File: `src/store/middleware/telemetryMiddleware.js` line 31
- Reason: Plan 03 (Wave 2) fills in the 8 canonical learning-loop event names (quest.started, quest.completed, fsrs.reviewed, zone.entered, lesson.completed, teaching.started, teaching.completed, dashboard.viewed) and their property extractors. Intentional per the Plan 02 PLAN.md `<must_haves>`.

**2. `initTelemetryEventBusRelay()` is a no-op in `telemetryMiddleware.js`.**
- File: `src/store/middleware/telemetryMiddleware.js` line 62
- Reason: Plan 03 wires the Phaser-side EventBus (`EVENTS.ZONE_ENTERED` etc.) to `posthog.capture` here. The Plan 02 `main.jsx` already calls the stub so Plan 03 only needs to edit one file.

**3. `VITE_POSTHOG_KEY` is empty in `.env.local`.**
- File: `.env.local` line 9
- Reason: User deferred PostHog org creation per Plan 01 Task 3. `initPostHog()` graceful-no-ops until the key is filled. User will create the org manually after Plan 02 ships.

## Self-Check: PASSED

- `src/services/posthogClient.js` ✓ exists
- `src/store/middleware/telemetryMiddleware.js` ✓ exists
- `.env.example` ✓ exists
- Commit `d7afa55` ✓ found in git log
- Commit `b89d8b5` ✓ found in git log
- Commit `bc6505c` ✓ found in git log
- Targeted suites: posthogClient 7/7 GREEN, SettingsMenuTelemetry 5/5 GREEN, settingsSlice 35/35 GREEN
- telemetryMiddleware 3/6 GREEN (3 remaining are Plan 03 territory by design)
- vitest baseline maintained: 5744 passing >= 5623 ✓
