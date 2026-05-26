# Phase 102: Observability & Test Coverage — Research

**Researched:** 2026-05-26
**Domain:** PostHog product analytics + session replay + crash capture, Phaser perf overlay with low-end-device detection, Playwright smoke suite (additive)
**Confidence:** HIGH for SDK choice + APIs; MEDIUM for canvas-recording cost (real-world data is benchmark-driven); MEDIUM for opt-out-under-13 logic because the codebase has no age-gate yet (gap surfaced below)

## Summary

The phase installs a signal layer across a React 19 + Phaser 3 + Redux Toolkit + IndexedDB app (~5650 vitest tests today, not the 2535 the CONTEXT file references — STATE.md confirms the current count). The standard stack is `posthog-js` + `@posthog/react`. PostHog's React 19 compat is verified through `peerDependencies` (`react: ">=16.8.0"`). PostHog's session replay supports both DOM masking (`maskAllInputs`) and a separate `captureCanvas` toggle that defaults OFF — important because the Phaser canvas is where 100% of gameplay happens and PostHog's canvas recorder is the single biggest perf risk in the literature (a documented case dropped a WebGL map from 120 → 25 fps when canvas recording was on).

Exception capture in posthog-js v1.376.2 uses the `capture_exceptions` config object (NOT `enable_exception_autocapture` — that's the older v1.275 API). It wraps `window.onerror` and `window.onunhandledrejection` and exposes `posthog.captureException(error, props)` for manual cases. A `PostHogErrorBoundary` component is shipped from `@posthog/react` and slots cleanly above the existing `ErrorBoundaryClass` in `src/main.jsx`.

For Phaser perf, `game.loop.actualFps` is the canonical FPS source. `performance.memory.usedJSHeapSize` is Chromium-only and non-standard — must `typeof` guard. Phaser exposes `game.renderer.drawCount` (WebGL) for draw calls. Low-end detection uses a combination of `navigator.deviceMemory` (also Chromium-only) plus a 10-second warm-up FPS sample.

Playwright is already installed at v1.58.2 with `playwright.config.js` and 6 e2e specs (`smoke`, `auth`, `fast-travel`, `quest-completion`, `review-session`, `shop-purchase`). The phase ADDS a hardened smoke spec covering the golden path; it does not start from scratch. The existing `review-session.spec.js` already demonstrates the pattern of seeding state via `page.evaluate` AFTER a navigation (with a comment explaining the about:blank origin pitfall). Playwright 1.51+ supports `storageState({ indexedDB: true })` — directly useful for OBS-08 save+reload-restores-state.

**CRITICAL CODEBASE GAP:** there is **no age-gate logic** anywhere in `src/components/Onboarding/` or `src/store/slices/`. CONTEXT.md and OBS-07 both assume "existing onboarding age data" — but it doesn't exist. The planner must treat OBS-07 as having an unmet prerequisite (either add a one-question age check during onboarding, or default everyone to opt-in for adults and surface this gap to the user for a decision).

Three smaller codebase corrections to flag:
- `services/persistence/` does NOT exist. IndexedDB lives at `src/services/storage/indexedDBAdapter.js` (DB name `gogo-arabic-idb`, store `redux-state`, current DB_VERSION 1, current migration version 12).
- Existing onboarding slice mounts as `onboarding2` (not `onboarding`) — STATE.md flagged this as a live bug in `selectors`.
- The CONTEXT references 2535 tests; STATE.md says 5650 total, 5623 passing, 19 known failing on master. OBS-09 should be "no NEW regressions" against the current 5623 green count.

**Primary recommendation:** Use `posthog-js` v1.376.2 + `@posthog/react` v1.9.1. Init in `src/main.jsx` BEFORE `ReactDOM.createRoot`. Disable autocapture, disable canvas recording, enable `capture_exceptions` with all defaults, mask all inputs in session replay. Build the perf overlay as a Phaser-side `Phaser.GameObjects.Text` updated at 1Hz (not every frame) plus a React DOM badge for heap. Compile-gate via `import.meta.env.DEV || new URLSearchParams(location.search).has('perf')`. Persist low-end flag via a NEW redux slice (`devicePerformanceSlice`) included in the IndexedDB persist allow-list — same pattern as existing slices.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| PostHog SDK init + global config | React shell (`src/main.jsx`) | — | Single instance lifetime owns identify/reset; must run before `createRoot` so events from initial dispatches are captured |
| Canonical event emission (`quest.completed`, etc.) | Redux middleware (NEW `telemetryMiddleware.js`) | EventBus (`src/utils/eventBus.js`) for Phaser-originated events | Redux dispatches are the canonical "something happened in the game" point; EventBus relays Phaser-only signals (e.g. `zone.entered`) up to Redux |
| Session replay + PII masking | React shell init | DOM (input fields marked `ph-no-capture`) | Replay runs on DOM; the Phaser canvas is recorded via canvas capture which we explicitly disable |
| Uncaught error capture | React shell init (`capture_exceptions: true`) | `PostHogErrorBoundary` wraps app inside existing `ErrorBoundaryClass` | Init catches `window.onerror`/`onunhandledrejection`; the boundary catches React render errors; both flow to PostHog |
| Perf overlay (FPS, draw calls, frame time) | Phaser scene overlay (`src/game/ui/PerfOverlay.js` NEW) | React badge for heap MB (Chromium-only) | Phaser owns canvas-frame data; React owns DOM measurements like `performance.memory` |
| Low-end-device detection + flag | NEW service `src/services/devicePerformance.js` | NEW Redux slice `devicePerformanceSlice` persisted via IndexedDB | Detection is pure logic; persistence is a slice; downstream phases (103/104) consume via selectors |
| Telemetry opt-out toggle | NEW Settings panel section in `src/components/Menu/SettingsMenu.jsx` | NEW `settingsSlice.telemetryOptOut` boolean + side-effect to call `posthog.opt_out_capturing()` | Settings UI is the existing surface; side-effect lives in a slice listener / middleware |
| Playwright smoke spec | E2E test layer (`e2e/golden-path.spec.js` NEW) | — | Runs in CI, uses Vite dev server, exercises the full stack including IndexedDB |
| Anonymous distinct_id | React shell init via PostHog `bootstrap.distinctID` | localStorage-backed (PostHog default) | No login means no `identify(userId)`; PostHog auto-generates and persists a UUID; we may bootstrap a stable ID from the existing `playerSlice.id` if one exists, otherwise let PostHog default |

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Scope — In:**
- PostHog product analytics SDK wired into the React shell with named events for the canonical learning loop (quest start/complete, FSRS review, zone enter, lesson complete, teaching session start/end, dashboard view).
- PostHog session replay enabled with masking for any user-entered text.
- Crash + uncaught-error capture into PostHog (single tool — no Sentry).
- Phaser-side perf overlay: FPS, frame time, draw calls, heap MB. Toggle with a debug key combo or `?perf=1` URL flag. Off by default in production.
- Low-end-device mode flag: detected via device memory + frame budget over a warm-up window, persisted in IndexedDB. Future phases (103/104) read it to gate effects/atlas size.
- Playwright smoke suite covering: boot to title, start new game, walk one zone, talk to one NPC, take one FSRS review, save+reload restores state. Run in CI on PRs.

**Scope — Out:**
- Custom dashboards in PostHog (manual setup post-merge — not in-codebase work).
- Replacing the existing vitest suite. Playwright is *additive* — smoke only.
- Adding telemetry to server (`server/src/server.js`) — frontend instrumentation only this phase.
- Voice-recognition pronunciation analytics, AI-tutor analytics.

**Hard Constraints:**
- **PII discipline:** No raw Arabic text the learner types or speaks gets sent to PostHog. Mask all user-input fields in session replay. Event properties must be enums/IDs only, never free text.
- Telemetry opt-out-able via settings toggle. Default opt-in for adults, opt-out under 13 (read existing onboarding age data).
- Perf overlay ≤1ms per frame when active, 0 cost when off (compile-time gated or early-return).
- Playwright suite <3 minutes in CI.
- Existing vitest test count must remain green.

**PostHog org/project:** Reuse FrameCoach org `019d2bf5-3889-0000-1412-5918dc7408b0`. Create a NEW project for Gogo Arabic. Do NOT co-mingle with FrameCoach Default project 148422.

**Depends on:** Phase 97 (Visual Rebuild) merged. Phase 27.1 IndexedDB layer (already in tree).

**Preserve:** Onboarding age-gate logic (see GAP note below), redux-persist behaviour (telemetry is parallel observer, not part of state persistence), BootScene timing.

### Claude's Discretion

- Exact event-name conventions (CONTEXT suggested `domain.action` like `quest.completed` — keeping this).
- Exact low-end heuristic thresholds (CONTEXT suggested avg FPS < 45 over 10s OR `navigator.deviceMemory < 4` — recommend keeping but exposing as constants).
- Implementation of perf overlay (Phaser text vs React overlay vs hybrid).
- Where the opt-out toggle lives in Settings UI hierarchy.
- Vite-side perf-overlay tree-shaking strategy (compile-time `import.meta.env.DEV` gate vs URL param vs both).
- Playwright spec file structure (one mega-spec vs one spec per step — recommend one mega-spec for the smoke contract).

### Deferred Ideas (OUT OF SCOPE)

- A/B experimentation via PostHog feature flags.
- Server-side telemetry (`server/src/server.js`).
- Custom error grouping / Sentry-style stack-trace UI.
- Cohort analytics dashboards (post-merge dashboard work).
- Performance budgets as CI gates (Phase 104).

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **OBS-01** | PostHog SDK wired into React shell, `autocapture: false`, identified per anonymous session ID | `posthog-js` v1.376.2 + `@posthog/react` v1.9.1; init pattern below; PostHog auto-generates anonymous `distinct_id` and persists it in localStorage (default `persistence: 'localStorage+cookie'`) — no manual identify needed unless we want to bootstrap from an existing player ID |
| **OBS-02** | Canonical learning-loop events with stable names + enum/ID-only properties | Wire via NEW `src/store/middleware/telemetryMiddleware.js` listening to specific Redux actions + EventBus relays for Phaser-side events (`zone.entered`). Event-name convention `domain.action`. Property schema documented below |
| **OBS-03** | Session replay enabled, user-typed inputs masked | `session_recording: { maskAllInputs: true, captureCanvas: false }` — explicitly disable canvas to avoid the WebGL perf hit; PostHog already masks password/email by default, `maskAllInputs: true` is stricter |
| **OBS-04** | Uncaught errors + unhandled promise rejections captured | `capture_exceptions: true` (or `{ capture_unhandled_errors: true, capture_unhandled_rejections: true, capture_console_errors: false }`) — wraps `window.onerror` and `window.onunhandledrejection`. Add `PostHogErrorBoundary` inside existing `ErrorBoundaryClass` for React render errors. Existing `RouteErrorBoundary.componentDidCatch` should also call `posthog.captureException` |
| **OBS-05** | Perf overlay (FPS, frame time, draw calls, heap MB), `?perf=1` or debug key combo, ≤1ms when on, 0 cost when off | Phaser overlay reads `game.loop.actualFps`, `game.loop.delta`, `game.renderer.drawCount` (WebGL only), `performance.memory.usedJSHeapSize` (Chromium-only). Update at 1Hz (not per-frame) — that's the "≤1ms" budget. Compile-gate the import behind `import.meta.env.DEV || URL flag` so it tree-shakes out of prod |
| **OBS-06** | Low-end-device flag, IndexedDB-persisted | NEW service collects 10s of `game.loop.actualFps` samples; if avg < 45 OR `navigator.deviceMemory < 4` → flag = true. Persist via NEW `devicePerformanceSlice` added to the existing IndexedDB persist allow-list (bump `CURRENT_VERSION` from 12 → 13 in `src/services/storage/migrations.js`) |
| **OBS-07** | Telemetry opt-out toggle in settings, default opt-out under 13 | **GAP: no age-gate exists in codebase.** Planner must either (a) add a one-question age step to onboarding, or (b) make telemetry default opt-OUT for everyone and require an active opt-in (safer default that bypasses the age question). Recommend (b) — far simpler, COPPA-safe by default, single user action to opt in. Plumb through `settingsSlice.telemetryOptOut` (boolean, default `false` = opted-out) and call `posthog.opt_out_capturing()` / `posthog.opt_in_capturing()` from the toggle handler |
| **OBS-08** | Playwright smoke suite — boot → title → new game → walk zone → NPC → FSRS review → save+reload, <3 min, `video: 'retain-on-failure'` | `playwright.config.js` already has `video: 'retain-on-failure'`. NEW spec `e2e/golden-path.spec.js`. Use Playwright 1.51+ `storageState({ indexedDB: true })` for the save-reload step (current installed version 1.58.2 supports this) |
| **OBS-09** | Existing vitest suite green, zero regressions | **Baseline correction: 5650 tests / 5623 passing / 19 known-failing across 5 files** per STATE.md (CONTEXT.md's 2535 is stale). Phase 102 must keep the green count at ≥5623. The 19 pre-existing failures are out of scope |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `posthog-js` | ^1.376.2 | Product analytics + session replay + error tracking SDK | Single-tool decision per CONTEXT (no Sentry). Published 2026-05-26 (today, latest). 6+ year package, GitHub.com/PostHog/posthog-js (3k+ stars). No postinstall script. Bundle: ~50KB core, lazy-loads replay |
| `@posthog/react` | ^1.9.1 | React-specific bindings: `PostHogProvider`, `usePostHog`, `PostHogErrorBoundary` | Official wrapper. peerDependency `react: ">=16.8.0"` so React 19 OK. Published 2026-05-21. No postinstall script |

### Supporting (already installed — no new install)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `playwright` | ^1.58.2 | E2E browser automation | Already installed + 6 specs exist; ADD one more spec for OBS-08 |
| `@reduxjs/toolkit` | ^2.11.2 | Slice + middleware patterns | Telemetry middleware + devicePerformanceSlice |
| `redux-persist` | ^6.0.0 | IndexedDB persistence | Add devicePerformanceSlice to allow-list, bump migration version |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `posthog-js` + `@posthog/react` | `posthog-js` only (skip the React package) | The React package only adds `PostHogProvider`/`PostHogErrorBoundary`/`usePostHog`. We use `PostHogErrorBoundary` and `usePostHog` so the small extra footprint is worth it. Keep both |
| Custom error boundary + manual `captureException` | Just use `PostHogErrorBoundary` | We already have `ErrorBoundaryClass` in `RouteErrorBoundary.jsx`. Recommend: add `posthog.captureException(error)` inside the existing `componentDidCatch`, AND wrap children with `PostHogErrorBoundary` for cleaner stacks. Belt + braces |
| Phaser overlay text | React DOM overlay above canvas | Phaser text reads `game.loop.actualFps` directly from the game's frame; React overlay has to bounce through state or refs. Phaser native is simpler. EXCEPTION: heap MB lives in `performance.memory` which is a DOM API — that one piece stays React |

**Installation:**

```bash
npm install posthog-js@^1.376.2 @posthog/react@^1.9.1
```

**Version verification:**

```bash
npm view posthog-js version      # 1.376.2 (2026-05-26 modified, registered 2020-02-20)
npm view @posthog/react version  # 1.9.1 (2026-05-21 modified, registered 2025-07-23)
npm view posthog-js scripts.postinstall      # empty — no postinstall
npm view @posthog/react scripts.postinstall  # empty — no postinstall
npm view @posthog/react peerDependencies     # react: >=16.8.0 (React 19 OK)
```

## Package Legitimacy Audit

slopcheck was NOT available in this research environment (Python pip not installed). Per protocol, both packages are tagged `[ASSUMED]` for slopcheck purposes; the planner should add a `checkpoint:human-verify` task before `npm install`. Manual diligence performed below:

| Package | Registry | Age | Downloads (npm trend) | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------------------|-------------|-----------|-------------|
| `posthog-js` | npm | 6 yrs 3 mo (created 2020-02-20) | High (1M+/wk per npm-stat) | github.com/PostHog/posthog-js | [ASSUMED — gate unavailable] | Approved subject to human verify; manual checks all green: well-known company, public repo, no postinstall |
| `@posthog/react` | npm | 10 mo (created 2025-07-23) | Recent but rising | (same org, github.com/PostHog/posthog-js — monorepo) | [ASSUMED — gate unavailable] | Approved subject to human verify; manual checks: same org as `posthog-js`, peer-depends on `posthog-js ">=1.257.2"`, no postinstall |

**Packages removed due to slopcheck [SLOP] verdict:** none (gate unavailable).
**Packages flagged as suspicious [SUS]:** none from manual review; both are first-party PostHog packages.

**Planner instruction:** before the install task runs, insert `checkpoint:human-verify` so the user can run `pip install slopcheck && slopcheck install posthog-js @posthog/react --json` locally and confirm.

## Architecture Patterns

### System Architecture Diagram

```
                          ┌─────────────────────────────────────────────────────────┐
                          │                       PostHog Cloud                      │
                          │             (Gogo Arabic project, FrameCoach org)        │
                          └────────────────────────▲────────────────────────────────┘
                                                   │ HTTPS batched events
                                                   │ (lazy-loaded session replay)
   ┌───────────────────────────────────────────────┴────────────────────────────────┐
   │                                  Browser                                        │
   │                                                                                 │
   │  ┌──────────────────────────────────────────────────────────────────────────┐  │
   │  │ React Shell (src/main.jsx)                                               │  │
   │  │                                                                          │  │
   │  │  posthog.init(token, {                                                   │  │
   │  │    autocapture: false,                                                   │  │
   │  │    capture_exceptions: true,                                             │  │
   │  │    session_recording: { maskAllInputs: true, captureCanvas: false }      │  │
   │  │  })                                                                      │  │
   │  │                                                                          │  │
   │  │  ┌─────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐ │  │
   │  │  │ PostHogProvider     │→ │ ErrorBoundaryClass    │→ │ RouterProvider  │ │  │
   │  │  │                     │  │  (calls              │  │                 │ │  │
   │  │  │   PostHogError      │  │   posthog.capture    │  │ ┌─────────────┐ │ │  │
   │  │  │   Boundary inside)  │  │   Exception)         │  │ │ SettingsMenu│ │ │  │
   │  │  └─────────────────────┘  └──────────────────────┘  │ │ (opt-out    │ │ │  │
   │  │                                                      │ │  toggle)    │ │ │  │
   │  │                                                      │ └─────────────┘ │ │  │
   │  │                                                      │ ┌─────────────┐ │ │  │
   │  │                                                      │ │ PhaserGame  │ │ │  │
   │  │                                                      │ └──────┬──────┘ │ │  │
   │  └──────────────────────────────────────────────────────┴────────┼────────┘  │
   │                                                                  │           │
   │  ┌───────────────────────────────────────────────────────────────▼────────┐  │
   │  │ Phaser Canvas                                                          │  │
   │  │                                                                        │  │
   │  │  ┌────────────────┐   ┌───────────────┐    ┌──────────────────────┐   │  │
   │  │  │ BootScene/     │   │ PerfOverlay   │    │ devicePerformance    │   │  │
   │  │  │ WorldScene/etc │   │ (dev-only,    │    │  Sampler (10s warm-  │   │  │
   │  │  │                │   │  ?perf=1)     │    │  up FPS + nav.       │   │  │
   │  │  │   emits        │   │               │    │  deviceMemory)       │   │  │
   │  │  │   EventBus     │   │  reads        │    │                      │   │  │
   │  │  │   events       │   │  game.loop.   │    │  → dispatches        │   │  │
   │  │  └────────┬───────┘   │  actualFps    │    │     setLowEndFlag    │   │  │
   │  │           │           └───────────────┘    └──────────┬───────────┘   │  │
   │  └───────────┼───────────────────────────────────────────┼──────────────┘   │
   │              │                                           │                   │
   │  ┌───────────▼───────────────────────────────────────────▼──────────────┐   │
   │  │ Redux Store                                                          │   │
   │  │                                                                      │   │
   │  │  ┌────────────────────────────────────────────────────────────────┐ │   │
   │  │  │  telemetryMiddleware                                            │ │   │
   │  │  │  ──────────────────                                             │ │   │
   │  │  │  - listens to: questSlice.completeQuest, fsrsReview,            │ │   │
   │  │  │    lessonCompleted, teachingStart/End, dashboardViewed          │ │   │
   │  │  │  - relays EventBus 'zone.entered'                               │ │   │
   │  │  │  - reads settingsSlice.telemetryOptOut → no-op if true          │ │   │
   │  │  │  - emits posthog.capture('domain.action', { enumProps })        │ │   │
   │  │  └────────────────────────────────────────────────────────────────┘ │   │
   │  │                                                                      │   │
   │  │  Slices: settings (+ telemetryOptOut), devicePerformance (NEW),     │   │
   │  │  ...all existing 60 slices unchanged                                 │   │
   │  └──────────────────────────────────────────────────────────────────────┘   │
   │                                  │                                          │
   │  ┌───────────────────────────────▼──────────────────────────────────────┐  │
   │  │ IndexedDB (gogo-arabic-idb / redux-state)                            │  │
   │  │ Migration v12 → v13: add devicePerformance to persist allow-list     │  │
   │  └──────────────────────────────────────────────────────────────────────┘  │
   └────────────────────────────────────────────────────────────────────────────┘

   ┌────────────────────────────────────────────────────────────────────────────┐
   │ Playwright (e2e/golden-path.spec.js, additive to 6 existing specs)         │
   │                                                                            │
   │  1. page.goto('/')                                                         │
   │  2. New Game → assert canvas + character creation                          │
   │  3. Walk one zone (keypress + assert position via __PHASER_GAME__ probe)   │
   │  4. Interact with one NPC (keypress E + assert dialogue overlay)           │
   │  5. Trigger one FSRS review + assert quiz overlay                          │
   │  6. ctx.storageState({ indexedDB: true }) → reload → assert state restored │
   └────────────────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure (only NEW files shown)

```
src/
├── main.jsx                              # MODIFY: add posthog.init + PostHogProvider wrap
├── services/
│   ├── posthogClient.js                  # NEW: init wrapper, exports getPostHog()
│   ├── devicePerformance.js              # NEW: 10s warm-up FPS sampler + flag setter
│   └── storage/
│       └── migrations.js                 # MODIFY: bump v12 → v13, add devicePerformance
├── store/
│   ├── store.js                          # MODIFY: register telemetryMiddleware, add devicePerformanceSlice to persist
│   ├── middleware/
│   │   └── telemetryMiddleware.js        # NEW: action-listener → posthog.capture
│   └── slices/
│       ├── devicePerformanceSlice.js     # NEW: { isLowEnd: boolean, warmupSampleCount, avgFps, deviceMemory }
│       └── settingsSlice.js              # MODIFY: add telemetryOptOut: boolean
├── game/
│   ├── ui/
│   │   └── PerfOverlay.js                # NEW: Phaser overlay, dev-gated import
│   └── PhaserGame.jsx                    # MODIFY: gated mount of PerfOverlay
├── components/
│   ├── ErrorBoundary/
│   │   └── RouteErrorBoundary.jsx        # MODIFY: add posthog.captureException in componentDidCatch
│   └── Menu/
│       └── SettingsMenu.jsx              # MODIFY: add Telemetry section with opt-in toggle
└── utils/
    └── eventBusTypes.js                  # MODIFY: add TELEMETRY_* event names if needed for relays

e2e/
└── golden-path.spec.js                   # NEW: the OBS-08 smoke spec

.env.example                              # NEW (or MODIFY): document VITE_POSTHOG_KEY + VITE_POSTHOG_HOST
.github/workflows/
└── ci.yml                                # MODIFY: add `- name: Playwright smoke` step
```

### Pattern 1: PostHog Init in main.jsx (BEFORE createRoot)

**What:** Initialise the SDK once, at module-evaluation time, before any React render. This guarantees that the very first dispatch (e.g. `store.dispatch(initializeQuests(...))` on line 22 of current `main.jsx`) is observable.

**When to use:** Always — this is the only place init lives.

**Example:**
```javascript
// src/main.jsx (NEW lines marked +)
+ import posthog from 'posthog-js';
+ import { PostHogProvider, PostHogErrorBoundary } from '@posthog/react';
  import { useState } from 'react';
  import ReactDOM from 'react-dom/client';
  // ...existing imports...

+ // Init PostHog BEFORE any React render or store dispatch.
+ // - autocapture: false → emit only canonical events (PII control)
+ // - capture_exceptions: true → window.onerror + onunhandledrejection
+ // - session_recording.captureCanvas: false → DO NOT record Phaser canvas (perf)
+ // - session_recording.maskAllInputs: true → no learner-typed Arabic in replays
+ // - persistence: localStorage+cookie is the default → anonymous distinct_id auto-generated
+ if (import.meta.env.VITE_POSTHOG_KEY) {
+   posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
+     api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com',
+     autocapture: false,
+     capture_pageview: true,        // 1 pageview is fine; we're a SPA so this fires once
+     capture_pageleave: true,
+     capture_exceptions: {
+       capture_unhandled_errors: true,
+       capture_unhandled_rejections: true,
+       capture_console_errors: false,
+     },
+     session_recording: {
+       maskAllInputs: true,
+       // CRITICAL: do NOT enable captureCanvas — Phaser is 100% canvas, recording it
+       // is documented to drop WebGL apps from 120 → 25 fps (see Pitfalls)
+       // Omitting captureCanvas leaves it off; setting it explicitly false also OK
+     },
+     // Default opt-out: telemetry off until user opts in (handles the no-age-gate gap)
+     opt_out_capturing_by_default: true,
+     // Defaults version pins config defaults so PostHog doesn't silently change them
+     defaults: '2026-01-30',
+   });
+ }

  function AppRoot() {
    // ...existing AppRoot body...
    return (
+     <PostHogProvider client={posthog}>
        <Provider store={store}>
          <PersistGate loading={<LoadingScreen />} persistor={persistor}>
            <AccessibilityBridge />
+           <PostHogErrorBoundary fallback={<ErrorFallback />}>
              <ErrorBoundaryClass>
                {/* ...existing children... */}
              </ErrorBoundaryClass>
+           </PostHogErrorBoundary>
          </PersistGate>
        </Provider>
+     </PostHogProvider>
    );
  }
```
Source: [PostHog React docs](https://posthog.com/docs/libraries/react), [PostHog JS config](https://posthog.com/docs/libraries/js/config), [capture_exceptions](https://posthog.com/docs/error-tracking/capture)

### Pattern 2: Telemetry Middleware (Redux action listener)

**What:** A typed Redux middleware that maps specific actions/EventBus events → `posthog.capture('domain.action', enumProps)`. Centralises the event vocabulary in one file.

**When to use:** For every canonical learning-loop event (OBS-02).

**Example:**
```javascript
// src/store/middleware/telemetryMiddleware.js (NEW)
import posthog from 'posthog-js';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';

// Action-type → event-name mapping. Keep this file the single source of truth.
const ACTION_EVENT_MAP = {
  'quest/startQuest':       'quest.started',
  'quest/completeQuest':    'quest.completed',
  'vocabulary/reviewCard':  'fsrs.reviewed',
  'grammar/completeLesson': 'lesson.completed',
  // ...
};

// Property-extractor functions. Return ONLY enums/IDs. NEVER include free text.
const PROP_EXTRACTORS = {
  'quest.completed': (action) => ({
    quest_id: action.payload.questId,           // OK: ID
    zone_id: action.payload.zoneId,             // OK: ID
    objectives_count: action.payload.objectives?.length ?? 0,  // OK: number
    // NOT: action.payload.questTitle — free text — FORBIDDEN
  }),
  'fsrs.reviewed': (action) => ({
    word_id: action.payload.wordId,             // OK: ID
    rating: action.payload.rating,              // OK: enum (1-4)
    cefr_level: action.payload.cefrLevel,       // OK: enum (A1..C2)
    // NOT: action.payload.arabicText — learner-facing Arabic — FORBIDDEN
  }),
  // ...
};

export const telemetryMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const eventName = ACTION_EVENT_MAP[action.type];
  if (!eventName) return result;

  // Honor opt-out: read from settings slice. posthog.opt_out_capturing() also
  // hard-stops at the SDK layer, but this guards against initialised-but-opted-out
  // bursts during boot.
  const optedOut = store.getState().settings?.telemetryOptOut === true;
  if (optedOut) return result;

  try {
    const extractor = PROP_EXTRACTORS[eventName];
    const props = extractor ? extractor(action) : {};
    posthog.capture(eventName, props);
  } catch (err) {
    // Telemetry must NEVER crash the app
    if (import.meta.env.DEV) console.warn('[telemetry] capture failed', err);
  }
  return result;
};

// EventBus relay for Phaser-originated events (zone.entered fires from WorldScene)
export const initTelemetryEventBusRelay = (store) => {
  EventBus.on(EVENTS.ZONE_ENTERED, (payload) => {
    if (store.getState().settings?.telemetryOptOut === true) return;
    posthog.capture('zone.entered', { zone_id: payload.zoneId });
  });
};
```
Source: PostHog `capture` semantics — [JavaScript SDK](https://posthog.com/docs/libraries/js)

### Pattern 3: Phaser Perf Overlay (1Hz update, dev-gated)

**What:** A Phaser overlay that reads `game.loop.actualFps`, `game.loop.delta`, and (WebGL only) `game.renderer.drawCount`. Heap memory uses `performance.memory.usedJSHeapSize` (Chromium-only, must `typeof`-guard).

**When to use:** When `import.meta.env.DEV` OR `?perf=1` URL param is present.

**Example:**
```javascript
// src/game/ui/PerfOverlay.js (NEW)
export class PerfOverlay {
  constructor(scene) {
    this.scene = scene;
    this.text = scene.add.text(8, 8, '', {
      font: '12px monospace',
      color: '#00ff88',
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: { x: 4, y: 2 },
    }).setScrollFactor(0).setDepth(99999);
    // 1Hz update — keeps overhead ≤1ms/frame (one read per second, not per frame)
    this.timer = scene.time.addEvent({
      delay: 1000,
      callback: this.update,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    const fps = this.scene.game.loop.actualFps.toFixed(1);
    const frameMs = this.scene.game.loop.delta.toFixed(1);
    const draws = this.scene.game.renderer.drawCount ?? 'n/a'; // Canvas renderer lacks this
    const heap = (typeof performance !== 'undefined' && performance.memory?.usedJSHeapSize)
      ? `${(performance.memory.usedJSHeapSize / 1048576).toFixed(0)}MB`
      : 'n/a';  // Firefox/Safari → no performance.memory
    this.text.setText(`FPS ${fps}  Δ${frameMs}ms  draws ${draws}  heap ${heap}`);
  }

  destroy() {
    this.timer?.remove();
    this.text?.destroy();
  }
}

// src/game/PhaserGame.jsx (MODIFY in scene-ready callback)
//
// const perfEnabled = import.meta.env.DEV ||
//                     new URLSearchParams(window.location.search).has('perf');
// if (perfEnabled) {
//   const { PerfOverlay } = await import('./ui/PerfOverlay.js');  // dynamic import → tree-shake from prod
//   new PerfOverlay(worldScene);
// }
```

### Pattern 4: Low-end-device sampler

```javascript
// src/services/devicePerformance.js (NEW)
import { setLowEndFlag } from '../store/slices/devicePerformanceSlice.js';

const WARMUP_MS = 10_000;
const SAMPLE_INTERVAL_MS = 250;  // 40 samples over 10s
const FPS_THRESHOLD = 45;
const MEMORY_THRESHOLD_GB = 4;

export function startWarmupSampler(game, store) {
  const samples = [];
  const startedAt = Date.now();
  const id = setInterval(() => {
    samples.push(game.loop.actualFps);
    if (Date.now() - startedAt >= WARMUP_MS) {
      clearInterval(id);
      const avgFps = samples.reduce((a, b) => a + b, 0) / samples.length;
      const deviceMemory = navigator.deviceMemory ?? Infinity;  // Chromium-only; assume "fine" if absent
      const isLowEnd = avgFps < FPS_THRESHOLD || deviceMemory < MEMORY_THRESHOLD_GB;
      store.dispatch(setLowEndFlag({ isLowEnd, avgFps, deviceMemory, sampleCount: samples.length }));
    }
  }, SAMPLE_INTERVAL_MS);
}
```

### Pattern 5: Playwright save+restore via storageState

```javascript
// e2e/golden-path.spec.js (NEW)
import { test, expect } from '@playwright/test';

test('golden path — boot, walk, NPC, FSRS, save+reload', async ({ page, context }) => {
  // 1. Boot
  await page.goto('/');
  await expect(page).toHaveTitle(/gogo arabic/i);
  await expect(page.locator('canvas')).toBeVisible({ timeout: 5000 });

  // 2. Start new game (button text/role TBD by planner — inspect MainMenu component)
  await page.getByRole('button', { name: /new game|start/i }).click();
  // ... character creation steps ...

  // 3. Walk one tile (keyboard event on window — config.js puts listener on window)
  await page.keyboard.press('ArrowDown');
  // Assert via debug hook the game exposes on window.__PHASER_GAME__ (already set in PhaserGame.jsx:28 for dev)
  // For e2e, mirror this hook outside DEV by exporting on window in test mode

  // 4. Talk to one NPC + 5. one FSRS review — selectors TBD per existing overlay testids

  // 6. Save+restore via storageState({ indexedDB: true })
  const saved = await context.storageState({ indexedDB: true });
  await page.reload();
  await expect(page.locator('canvas')).toBeVisible();
  // Assert player position/state persisted via Redux dev probe or visible XP/level
});
```
Source: [Playwright release notes for IndexedDB storageState](https://playwright.dev/docs/release-notes) (1.51+)

### Anti-Patterns to Avoid

- **Enabling `captureCanvas` in session recording.** The Phaser canvas IS the gameplay. Capture would be ~50% main-thread cost (documented PostHog issue #3273 — WebGL maps dropping from 120 to 25 fps). Replays would show only the React DOM chrome around the canvas — which is exactly what we want for opt-out replay UX anyway.
- **Calling `posthog.capture(...)` directly from components or services.** Centralise via `telemetryMiddleware`. Direct calls scatter the event vocabulary, miss the opt-out gate, and make PII review impossible.
- **Forgetting the opt-out gate inside the middleware.** PostHog's own opt-out (`posthog.opt_out_capturing()`) is the last line of defence, but the middleware should short-circuit too — saves CPU during opted-out play.
- **Reading `performance.memory` without a `typeof` guard.** Firefox and Safari don't expose it. Throws or returns undefined respectively.
- **Updating the perf overlay every frame.** Update at 1Hz (`scene.time.addEvent({ delay: 1000 })`). Per-frame DOM/text mutation is itself a perf cost.
- **Inlining VITE_POSTHOG_KEY in committed source.** Use `.env.local` (gitignored) for the real key; ship `.env.example` with the var name.
- **Putting `posthog.init()` after `createRoot()`.** Events from `store.dispatch(initializeQuests(...))` (line 22 of `main.jsx`) would be missed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Event batching/retry/dedup | Custom `fetch` to `/track` | `posthog-js` `.capture()` | Network resilience, browser visibility/unload handling, batching, rate-limit are all in the SDK |
| Anonymous user IDs | UUID + localStorage by hand | PostHog default `persistence: 'localStorage+cookie'` distinct_id | Already auto-generated, survives page reload, deduped across tabs |
| `window.onerror` + `window.onunhandledrejection` listeners | Custom handlers | `capture_exceptions: true` | SDK normalises stack traces, attaches breadcrumbs, deduplicates |
| Source-map upload for stack traces | Custom CI step | PostHog source-map upload via `posthog-cli` (post-merge dashboard work — out of scope this phase) | Out of scope; document for future |
| Session replay rrweb integration | Custom recorder | PostHog session replay (lazy-loaded by default) | rrweb config + payload upload is a project on its own |
| FPS counter | Custom requestAnimationFrame counter | `game.loop.actualFps` | Phaser already computes it; reading is O(1) |
| Playwright storage seeding | Bespoke `localStorage` shim | `context.storageState({ indexedDB: true })` | Built-in in Playwright 1.51+; works for IndexedDB too |
| Opt-out persistence | Custom localStorage key | PostHog's own `opt_out_capturing()` (stores in its own persistence) + a Redux mirror for UI | PostHog handles wire-level opt-out; Redux mirror powers the toggle UI |

**Key insight:** PostHog's value is the *integrated* analytics + replay + error stack. Once we install it, almost every problem in this phase has a 1-line API. The custom work is (a) the canonical event vocabulary and (b) the perf overlay — that's it.

## Runtime State Inventory

> This phase is greenfield instrumentation, not a rename/refactor. However, OBS-06 introduces NEW persistent state (low-end-device flag in IndexedDB), and OBS-07 introduces a new opt-out preference. Documenting the inventory for completeness.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | NEW: `devicePerformance` slice persisted to `gogo-arabic-idb` / `redux-state` (existing IndexedDB layer at `src/services/storage/indexedDBAdapter.js`). NEW: `settings.telemetryOptOut` persisted to localStorage (settings slice is in the localStorage allow-list). NEW: PostHog's own `posthog` localStorage key (auto-managed by SDK, contains anonymous distinct_id) | Migration v12 → v13 in `src/services/storage/migrations.js` to add `devicePerformance` to IndexedDB allow-list |
| Live service config | NEW: PostHog project to be created in FrameCoach org during plan-phase; API key stored in CI secret and developer `.env.local`. NOT in git | Planner step: create PostHog project, capture project key, document where it lives (recommend GitHub Actions secret + Vercel/host env var for prod) |
| OS-registered state | None — purely browser-based | None — verified by checking that no service workers, scheduled tasks, or OS-level installers are touched. Existing `src/services/swRegistration.js` is unchanged |
| Secrets/env vars | NEW: `VITE_POSTHOG_KEY` (public ingest key — safe to ship in client bundle since PostHog enforces per-origin domain restrictions in project settings). NEW: `VITE_POSTHOG_HOST` (defaults to `https://eu.i.posthog.com` if absent, for EU data residency — confirm with user) | Add to `.env.example`. CI: add as a GitHub Actions repo secret |
| Build artifacts | None new. `dist/` size will grow by `posthog-js` (~50KB core + lazy replay chunk). Bundle visualizer (`npm run build:analyze`) will show this | None — bundle size impact is documented in Pitfalls |

## Common Pitfalls

### Pitfall 1: Canvas session-recording destroys Phaser FPS
**What goes wrong:** Enabling `session_recording.captureCanvas` calls `getImageData` (or equivalent) on the canvas every 4 frames (PostHog's default). For a 1280×720 Phaser canvas this is heavy — documented PostHog issue #3273 shows a WebGL map dropping from 120 → 25 fps with rrweb consuming 55% of main thread.
**Why it happens:** `getImageData` on WebGL canvases is unavoidably slow (must round-trip GPU→CPU).
**How to avoid:** Leave `captureCanvas` OUT of the `session_recording` config (default is OFF). Replays will show the DOM around the canvas — which is what we want since the canvas contains no user-typed text anyway.
**Warning signs:** Drop in `game.loop.actualFps` after PostHog opt-in toggles to ON. Add a dev-only assertion in `PerfOverlay`: warn if FPS drops >20% after telemetry activation.

### Pitfall 2: `posthog-js` bundle bloat
**What goes wrong:** Adding posthog-js can bump the main vendor chunk by ~50KB gzipped. The session replay extension lazy-loads (~80KB more) but only when a recording is active.
**Why it happens:** posthog-js core is ~50KB gzipped; the rrweb-based recorder is lazy-loaded on demand.
**How to avoid:** PostHog already lazy-loads the recorder. Add a `posthog` entry to `vite.config.js manualChunks` to put it in its own vendor chunk, so cache hits aren't invalidated by app code changes. Run `npm run build:analyze` post-install to baseline the delta. Bundle constraint per PROJECT.md is <500KB main; we have headroom (currently 402KB).
**Warning signs:** `npm run build:analyze` showing posthog inside `misc-vendor`. Pin to its own chunk.

### Pitfall 3: `performance.memory` is non-standard, Chromium-only
**What goes wrong:** Reading `performance.memory.usedJSHeapSize` in Firefox throws; in Safari it's `undefined`.
**How to avoid:** Always `typeof performance !== 'undefined' && performance.memory?.usedJSHeapSize`. Display "n/a" when absent.

### Pitfall 4: `navigator.deviceMemory` is Chromium-only too
**What goes wrong:** Same family — Firefox/Safari return `undefined`.
**How to avoid:** `navigator.deviceMemory ?? Infinity` — treat "unknown" as "not low-end" rather than misclassifying every Safari user as low-end.

### Pitfall 5: PostHog init AFTER first store dispatch loses early events
**What goes wrong:** Current `main.jsx` dispatches `initializeQuests`, `checkPrerequisites`, `updateStreak`, `checkDailyReset` at module-eval (lines 22-25), BEFORE `ReactDOM.createRoot`. If we put `posthog.init(...)` inside `AppRoot`, those four boot events are silently dropped.
**How to avoid:** Init at the very top of `main.jsx`, before the existing dispatches.
**Warning signs:** PostHog Live Events shows missing `quest.initialized` / etc. on first load.

### Pitfall 6: `?perf=1` URL flag bundling
**What goes wrong:** If `PerfOverlay` is statically imported, it ships in production even though we only want it for `?perf=1` opt-in.
**How to avoid:** `await import('./ui/PerfOverlay.js')` (dynamic import) only when the flag is set. Vite tree-shakes the chunk out of the main bundle.

### Pitfall 7: Default opt-out for under-13 with no age-gate
**What goes wrong:** OBS-07 says "default opt-out for <13 per existing onboarding age data". The codebase has NO age-gate (verified by grep across `src/components/Onboarding/`, `src/store/slices/onboardingSlice.js`, `playerSlice.js`, `settingsSlice.js`).
**How to avoid:** Default everyone to opt-OUT (`opt_out_capturing_by_default: true`); require an explicit opt-IN via the settings toggle. This is COPPA-safe by default and matches the spirit of OBS-07. Document in PLAN as an explicit deviation from CONTEXT, flag for user confirmation.
**Warning signs:** PostHog reporting "0 events" after launch is the expected baseline until users actively opt in.

### Pitfall 8: Playwright dev-server cold-start eating the <3 min budget
**What goes wrong:** Vite cold start + first-load Phaser asset loading can eat 60-90 seconds. Add a serial smoke spec of 6 steps and you blow the budget.
**How to avoid:** `playwright.config.js` already sets `reuseExistingServer: true` — keep that. Run the smoke spec single-worker (`workers: 1`) for the new spec. Use `await page.waitForSelector('canvas', { state: 'visible' })` not `waitForTimeout`. Skip retries on the smoke spec for fast failure (`retries: 0` for this spec only via `test.describe.configure({ retries: 0 })`).
**Warning signs:** CI step duration creeping past 2 minutes.

### Pitfall 9: PostHog data residency — EU vs US host
**What goes wrong:** PostHog's default `api_host` is `https://us.i.posthog.com` (US). If the user is in the UK (per memory) and wants EU data residency, this needs `https://eu.i.posthog.com`.
**How to avoid:** Make `api_host` come from `VITE_POSTHOG_HOST` env var. Default to `https://eu.i.posthog.com` since the user is UK-based, and document the choice.

### Pitfall 10: Existing onboarding slice mounts as `onboarding2` not `onboarding`
**What goes wrong:** STATE.md (line 90-91) flags this as a live bug — selectors in `onboardingSlice.js` read `state.onboarding` while the slice mounts as `onboarding2`. If the telemetry middleware references onboarding state for opt-out logic, this will silently fail.
**How to avoid:** Use `state.onboarding2` directly OR fix the upstream bug first. Don't read onboarding for opt-out logic in this phase — read `state.settings.telemetryOptOut` only.

## Code Examples

(see Pattern 1-5 above — verified APIs)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `enable_exception_autocapture: true` | `capture_exceptions: { capture_unhandled_errors, capture_unhandled_rejections, capture_console_errors }` | posthog-js v1.275+ | Use new API; the old one still works but is undocumented in latest docs |
| Manual rrweb integration | `posthog-js` built-in session recording (lazy-loaded extension) | posthog-js v1.x throughout | Use built-in |
| Sentry for error tracking + PostHog for analytics | PostHog single-tool covers both (`capture_exceptions` + `captureException`) | PostHog Error Tracking GA in 2024-2025 | Per CONTEXT decision — single tool, no Sentry |
| Playwright `localStorage` workarounds for auth | `storageState({ indexedDB: true })` | Playwright 1.51+ (current 1.58.2 installed) | Use built-in for OBS-08 save+restore step |
| `posthog-js` only for React | `@posthog/react` adds `PostHogProvider`/`PostHogErrorBoundary`/`usePostHog` | Package created 2025-07-23 | Install both |

**Deprecated/outdated:**
- `posthog-js-lite` is for non-browser environments (React Native, Node). Don't use it here.
- The pre-2025 `posthog-react` package (without the `@` scope) is the old npm name — use `@posthog/react`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | EU data residency preferred (`eu.i.posthog.com`) given UK user | Pitfall 9, Pattern 1 | If user wants US, swap `VITE_POSTHOG_HOST`. Low risk — single env var |
| A2 | Default opt-OUT for everyone (since no age-gate exists) | OBS-07, Pitfall 7 | User may want opt-in default. RECOMMEND user confirms in discuss-phase. Medium risk — affects data volume |
| A3 | `posthog-js` and `@posthog/react` are first-party packages from PostHog Inc | Package Legitimacy Audit | Manual verification (org name, github repo URL, no postinstall) confirms — but slopcheck couldn't run. Planner must insert `checkpoint:human-verify` |
| A4 | The 2535 test count in CONTEXT is stale; current count is 5650 (5623 passing) | OBS-09 | If user expects 2535-as-baseline, OBS-09 verification breaks. Recommend correcting in PLAN |
| A5 | `services/persistence/` referenced in CONTEXT does not exist — IndexedDB is at `services/storage/` | Architecture Patterns, Project Structure | Low risk — straightforward path correction in PLAN |
| A6 | OBS-06 "low-end-device flag persisted in IndexedDB" maps to a NEW `devicePerformanceSlice` added to the existing IndexedDB allow-list, NOT a standalone IndexedDB entry | OBS-06, Project Structure | Low risk — matches existing pattern for 10+ other slices |
| A7 | Playwright `storageState({ indexedDB: true })` works with our IndexedDB schema (`gogo-arabic-idb` / `redux-state`) | OBS-08, Pattern 5 | Low — well-tested Playwright feature since 1.51 |
| A8 | `posthog.init()` before `ReactDOM.createRoot` is safe — no React imports needed at that point | Pattern 1, Pitfall 5 | Low — posthog is framework-agnostic |
| A9 | The on-disk Phaser scenes (`BootScene`, `WorldScene`, `InteriorScene`, `BattleScene`) all benefit from the same `PerfOverlay` instance if mounted on `WorldScene` (since scenes overlay each other) | Pattern 3 | Medium — may need per-scene mount; planner verifies |
| A10 | `capture_pageview: true` (one event per SPA load) is desirable; we are not a route-heavy SPA so this is fine | Pattern 1 | Low — single boot event |
| A11 | The CI run-time impact of one Playwright golden-path spec is <30 seconds incremental on top of current vitest (which takes ~3-5 min) | Pitfall 8 | Medium — depends on Vite cold-start; planner should measure |
| A12 | `posthog.capture(eventName, props)` is non-blocking and fires-and-forgets at the network layer (uses `navigator.sendBeacon` for page-unload events) | Pattern 2 | Low — well-documented SDK behaviour |

## Open Questions

1. **Default telemetry stance: opt-in vs opt-out by default?**
   - What we know: CONTEXT says "default opt-in for adults, opt-out under 13"; codebase has no age-gate.
   - What's unclear: whether user wants us to (a) add a quick age step to onboarding to make CONTEXT work as-stated, or (b) just default everyone to opt-out (recommended in this research).
   - Recommendation: surface in discuss-phase. Default to (b) for safety; user can promote to (a) with a follow-up phase that adds the age step.

2. **PostHog data region: EU vs US?**
   - What we know: user is UK-based per memory; FrameCoach org's existing project 148422 region is unknown from this research environment.
   - What's unclear: which region the new Gogo Arabic project should use.
   - Recommendation: ask user before creating the PostHog project. Default to EU.

3. **Should the existing `RouteErrorBoundary` post to PostHog too, or only `PostHogErrorBoundary`?**
   - What we know: `RouteErrorBoundary` is a separate route-error handler; `ErrorBoundaryClass` is the generic React boundary.
   - What's unclear: whether wrapping with both `PostHogErrorBoundary` and `ErrorBoundaryClass` would cause duplicate captures.
   - Recommendation: have `RouteErrorBoundary.componentDidCatch` call `posthog.captureException(error)` directly; let `PostHogErrorBoundary` handle the non-route case. Verify no duplicates by checking PostHog event volume after one staged error.

4. **PostHog `bootstrap.distinctID` from existing player ID?**
   - What we know: `playerSlice` has a `name` field but unclear if there's a stable random ID per save slot.
   - What's unclear: whether seeding PostHog's distinct_id from a player-side ID is worth it (would unify events across reinstalls if the user manually transfers their save).
   - Recommendation: skip in v1 — let PostHog auto-generate. Revisit if cross-device analytics becomes useful (after SYNC-01 in Phase 103).

5. **Test count drift in CONTEXT vs STATE — which one is canonical for OBS-09?**
   - What we know: CONTEXT says 2535+, STATE says 5650/5623 passing.
   - What's unclear: which baseline the user wants tracked.
   - Recommendation: use 5623-as-baseline (today's actual passing count). PLAN should re-baseline at plan-phase start.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All build/test | ✓ (CI: 22) | per `.github/workflows/ci.yml` | — |
| npm | Install | ✓ | — | — |
| Vite | Dev server + build | ✓ | 7.3.1 | — |
| Vitest | Unit tests | ✓ | 3.0.0 | — |
| Playwright | E2E | ✓ | 1.58.2 | — |
| Chromium (Playwright bundled) | E2E test browser | ✓ (via `npx playwright install chromium`) | bundled with playwright 1.58 | — |
| PostHog cloud project | Telemetry destination | ✗ (project does not exist yet) | — | Must be created in plan-phase (FrameCoach org, new project) |
| `VITE_POSTHOG_KEY` env var | SDK init | ✗ (not in `.env.example` yet) | — | Add to `.env.example`; CI secret; if missing at runtime, init is skipped (Pattern 1) — graceful degradation |
| slopcheck | Package legitimacy gate | ✗ (`pip` not installed in this environment) | — | Planner must insert `checkpoint:human-verify` task before `npm install posthog-js @posthog/react` |
| `pip` (Python) | Install slopcheck | ✗ | — | Document install path: `brew install python` or use existing python via pyenv |

**Missing dependencies with no fallback:**
- PostHog project (must be created — a 5-min UI task during plan or pre-execution)

**Missing dependencies with fallback:**
- VITE_POSTHOG_KEY (graceful skip in init — Pattern 1 wraps init in `if (import.meta.env.VITE_POSTHOG_KEY)`)
- slopcheck (`checkpoint:human-verify` substitute)

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework (unit) | Vitest 3.0.0 + @testing-library/react 16 + jsdom 25 + fake-indexeddb 6 |
| Framework (e2e) | Playwright 1.58.2 (Chromium) |
| Config files | `vite.config.js` (root, vitest reads it), `playwright.config.js` |
| Quick run | `npx vitest run src/store/middleware/__tests__/telemetryMiddleware.test.js` |
| Full unit suite | `npm run test:run` |
| E2E suite | `npm run test:e2e` |
| Phase gate | Full vitest green AT or above 5623 + new Playwright golden-path green |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| OBS-01 | PostHog init called with `autocapture: false` when VITE_POSTHOG_KEY present | unit (mock posthog) | `npx vitest run src/services/__tests__/posthogClient.test.js` | ❌ Wave 0 |
| OBS-02 | Action `quest/completeQuest` triggers `posthog.capture('quest.completed', {quest_id, zone_id, objectives_count})` with no free text | unit (mock posthog) | `npx vitest run src/store/middleware/__tests__/telemetryMiddleware.test.js` | ❌ Wave 0 |
| OBS-03 | Init config includes `session_recording.maskAllInputs: true` and `captureCanvas` is unset/false | unit (assert config object passed) | same as OBS-01 | ❌ Wave 0 |
| OBS-04 | Init config includes `capture_exceptions: { capture_unhandled_errors: true, capture_unhandled_rejections: true }`; `RouteErrorBoundary.componentDidCatch` calls `posthog.captureException` | unit | `npx vitest run src/components/ErrorBoundary/__tests__/RouteErrorBoundary.test.jsx` | ❌ Wave 0 |
| OBS-05 | `PerfOverlay` updates at 1Hz; reads `game.loop.actualFps`; is not imported in production build (verify via bundle-analyzer assertion) | unit + manual bundle inspection | `npx vitest run src/game/ui/__tests__/PerfOverlay.test.js` + `npm run build:analyze` | ❌ Wave 0 |
| OBS-06 | After 10s warmup, `setLowEndFlag` dispatched with correct boolean; flag survives reload via redux-persist | unit (fake-indexeddb + fake-timers) | `npx vitest run src/services/__tests__/devicePerformance.test.js` | ❌ Wave 0 |
| OBS-07 | Toggle opt-out in SettingsMenu calls `posthog.opt_out_capturing()`; opt-in calls `posthog.opt_in_capturing()`; default state is opted-out | component test | `npx vitest run src/components/Menu/__tests__/SettingsMenuTelemetry.test.jsx` | ❌ Wave 0 |
| OBS-08 | Playwright golden-path spec green | e2e | `npx playwright test e2e/golden-path.spec.js` | ❌ Wave 0 |
| OBS-09 | Full vitest suite passes ≥5623 tests | regression | `npm run test:run` then `grep -c PASS` | ✅ existing infra |

### Sampling Rate

- **Per task commit:** `npx vitest run <touched-test>`
- **Per wave merge:** `npm run test:run && npx playwright test e2e/golden-path.spec.js`
- **Phase gate:** Full suite green (5623+ vitest + golden-path playwright) before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/services/__tests__/posthogClient.test.js` — covers OBS-01, OBS-03, OBS-04 (init config assertions)
- [ ] `src/store/middleware/__tests__/telemetryMiddleware.test.js` — covers OBS-02 (event vocabulary + PII gate)
- [ ] `src/services/__tests__/devicePerformance.test.js` — covers OBS-06 (warmup sampler with fake-timers)
- [ ] `src/components/ErrorBoundary/__tests__/RouteErrorBoundary.test.jsx` — covers OBS-04 (boundary → posthog)
- [ ] `src/game/ui/__tests__/PerfOverlay.test.js` — covers OBS-05 (1Hz update + early-return when disabled)
- [ ] `src/components/Menu/__tests__/SettingsMenuTelemetry.test.jsx` — covers OBS-07 (opt-in/out toggle)
- [ ] `e2e/golden-path.spec.js` — covers OBS-08
- [ ] No new framework install needed — vitest, fake-indexeddb, playwright all present

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V1 Architecture | yes | Document data flow to PostHog; PII boundary at the telemetry middleware (event property extractors are the single PII-control point) |
| V2 Authentication | no | No auth code in this phase |
| V3 Session Management | partial | PostHog session_id is its own concept; isolate from app session |
| V4 Access Control | no | — |
| V5 Input Validation | yes | Validate event-property extractors return only enums/IDs — enforce via the `PROP_EXTRACTORS` shape in `telemetryMiddleware.js` |
| V6 Cryptography | no | PostHog handles TLS; no app-side crypto |
| V7 Error Handling & Logging | yes | `capture_exceptions: true` enables PostHog as the error sink; `RouteErrorBoundary` also calls `captureException`. NO server-side logging changes |
| V8 Data Protection | yes | PII discipline: session-replay masks inputs; canvas recording OFF; event properties enum-only |
| V9 Communications | yes | HTTPS-only to PostHog (default). `api_host` config |
| V10 Configuration | yes | `VITE_POSTHOG_KEY` via env var; never committed |
| V11 Business Logic | no | — |
| V12 Files & Resources | no | — |
| V13 API & Web Services | no | — |
| V14 Configuration | yes | CSP policy: PostHog origins must be allow-listed (`https://eu.i.posthog.com`, `https://eu-assets.i.posthog.com`). If app currently sets CSP via meta or headers, add these |

### Known Threat Patterns for posthog-js in a learning RPG

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| PII leak of Arabic learner text via session replay | Information Disclosure | `maskAllInputs: true`, `captureCanvas: false`, class `ph-no-capture` on any free-text DOM nodes (e.g., conversation builder, writing canvas) |
| PII leak via event properties (free-text quest titles, NPC names) | Information Disclosure | Strict enum/ID-only event-property extractors in `telemetryMiddleware.PROP_EXTRACTORS`; PR review checklist forbids `payload.title`/`payload.text` in extractors |
| PII leak via uncaught error messages containing user text | Information Disclosure | Audit thrown errors; ensure no `throw new Error(userInputText)` patterns; PostHog's exception captures the message — verify error messages are template strings |
| Distinct_id correlation with cookie-tracked data outside posthog | Privacy | Use anonymous distinct_id (default); avoid `identify(realUserId)` until SYNC-01 lands and we have intentional cross-device linking |
| Replay payload size DOS-ing low-end devices | DoS (client) | Canvas recording OFF; `session_recording.recordCrossOriginIframes: false` (default); rate_limiting defaults are fine |
| CSP bypass via PostHog inline scripts | Tampering | posthog-js does NOT use inline scripts; the lazy-load fetches from `https://eu-assets.i.posthog.com`. Update CSP to allow that origin only |
| Opt-out bypass | Privacy/Compliance | Belt+braces: middleware short-circuit on `settings.telemetryOptOut === true` AND `posthog.opt_out_capturing()` at SDK layer. Unit-test both layers |
| Token leak via client bundle | Information Disclosure | `VITE_POSTHOG_KEY` is a public ingest key (safe in client by design); restrict by allowed domains in PostHog project settings post-creation |

## Project Constraints (from CLAUDE.md)

No `./CLAUDE.md` exists in the project root (verified by Read tool). Planner therefore relies on PROJECT.md constraints:
- Tech stack: React 19 + Phaser 3 + Redux Toolkit + Express 5 + MongoDB — established, no changes
- Browsers: modern, no IE11
- Mobile: 375px min viewport
- Performance: main bundle <500KB (currently 402KB; posthog-js ~50KB headroom OK)
- Accessibility: WCAG AA; prefers-reduced-motion for VFX
- Cultural: no music, no eyes/faces, no deity characters — N/A for this phase

## Sources

### Primary (HIGH confidence)
- [PostHog React docs](https://posthog.com/docs/libraries/react) — init pattern, PostHogProvider, PostHogErrorBoundary
- [PostHog JavaScript config](https://posthog.com/docs/libraries/js/config) — autocapture, session_recording, capture_exceptions, opt_out_capturing_by_default
- [PostHog session replay canvas-recording](https://posthog.com/docs/session-replay/canvas-recording) — `captureCanvas` config + perf warning
- [PostHog error tracking installation — React](https://posthog.com/docs/error-tracking/installation/react) — PostHogErrorBoundary, captureException signature
- [PostHog capture exceptions](https://posthog.com/docs/error-tracking/capture) — `capture_exceptions: { capture_unhandled_errors, capture_unhandled_rejections, capture_console_errors }`
- [PostHog session replay privacy](https://posthog.com/docs/session-replay/privacy) — `maskAllInputs`, `maskTextSelector`, `ph-no-capture` class
- npm registry verification: `npm view posthog-js`, `npm view @posthog/react` (peer deps, no postinstall, publish dates)
- Codebase inspection: `src/main.jsx`, `src/services/storage/indexedDBAdapter.js`, `src/services/storage/migrations.js`, `src/store/slices/settingsSlice.js`, `src/components/Menu/SettingsMenu.jsx`, `src/game/PhaserGame.jsx`, `src/game/config.js`, `playwright.config.js`, `e2e/*.spec.js`, `.github/workflows/ci.yml`
- `.planning/STATE.md` for current test counts and known-failing tests

### Secondary (MEDIUM confidence)
- [PostHog session replay bundle/perf issue #3273](https://github.com/PostHog/posthog-js/issues/3273) — documented WebGL canvas-recording cost
- [Playwright release notes](https://playwright.dev/docs/release-notes) — `storageState({ indexedDB: true })` since 1.51
- [Phaser 3 optimization article](https://franzeus.medium.com/how-i-optimized-my-phaser-3-action-game-in-2025-5a648753f62b) — `game.loop.actualFps` access pattern
- WebSearch (verified): "How I optimized my Phaser 3 action game" published at phaser.io news (cross-confirms FPS read pattern)

### Tertiary (LOW confidence — flagged)
- `navigator.deviceMemory` and `performance.memory` browser support tables (MDN — not refetched in this session; widely-known Chromium-only APIs)
- PostHog EU vs US default region behavior — `defaults: '2026-01-30'` may change region defaults; verify in dev with one test event

## Metadata

**Confidence breakdown:**
- Standard stack (posthog-js + @posthog/react): HIGH — verified via npm registry + official docs; first-party from PostHog org
- Architecture patterns (init in main.jsx, middleware, perf overlay, sampler): HIGH — directly from docs + matches existing codebase patterns
- Session replay canvas pitfall: HIGH — documented in PostHog GitHub issue + docs warn
- Phaser FPS/draw-call APIs: HIGH for `actualFps`, MEDIUM for `drawCount` (WebGL-only field name; verify against Phaser 3.90 in plan execution)
- Low-end-device heuristic: MEDIUM — thresholds (FPS<45, deviceMemory<4) are reasonable defaults but unvalidated against this specific game's profile
- Playwright `storageState({ indexedDB: true })`: HIGH — confirmed feature since 1.51, installed 1.58.2
- Opt-out-under-13 logic: LOW — no age-gate exists in codebase, planner must resolve gap
- slopcheck verdict on posthog packages: NOT RUN (tool unavailable) — fallback to `checkpoint:human-verify`

**Research date:** 2026-05-26
**Valid until:** 2026-06-25 (30 days — posthog-js publishes weekly; recheck `posthog.init` signature if executing after this date)
