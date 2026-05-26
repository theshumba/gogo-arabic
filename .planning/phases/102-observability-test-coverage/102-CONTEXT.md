# Phase 102: Observability & Test Coverage - Context

**Gathered:** 2026-05-26
**Status:** CONTEXT stub — NOT yet planned. Run `/gsd-plan-phase 102` when ready.
**Source:** Orchestrator-captured from v17.5 Platform Foundation milestone brief

<domain>
## Phase Boundary

Install the signal layer for every later phase. Wire PostHog product analytics, crash/error reporting, an in-game performance overlay with a low-end-device mode flag, and a Playwright smoke suite that exercises the golden learning path. Net result: when a learner hits a bug, drops off, or sees jank, we can see it.

This is the first phase of v17.5 Platform Foundation. It does NOT change any gameplay, learning loop, or user-facing UI surface beyond a dev-only perf overlay.

</domain>

<decisions>
## Implementation Decisions (locked at stub time)

### Scope
- **In scope:**
  - PostHog product analytics SDK wired into the React shell with named events for the canonical learning loop (quest start/complete, FSRS review, zone enter, lesson complete, teaching session start/end, dashboard view).
  - PostHog session replay enabled with masking for any user-entered text.
  - Crash + uncaught-error capture into PostHog (single tool — no Sentry).
  - Phaser-side perf overlay: FPS, frame time, draw calls, heap MB. Toggle with a debug key combo or `?perf=1` URL flag. Off by default in production.
  - Low-end-device mode flag: detected via device memory + frame budget over a warm-up window, persisted in IndexedDB. Future phases (103/104) read it to gate effects/atlas size.
  - Playwright smoke suite covering: boot to title, start new game, walk one zone, talk to one NPC, take one FSRS review, save+reload restores state. Run in CI on PRs.
- **Out of scope:**
  - Custom dashboards in PostHog (manual setup post-merge — not in-codebase work).
  - Replacing the existing vitest suite. Playwright is *additive* — smoke only.
  - Adding telemetry to server (`server/src/server.js`) — frontend instrumentation only this phase. Server telemetry deferred.
  - Voice-recognition pronunciation analytics, AI-tutor analytics — separate future phases.

### Hard Constraints
- **PII discipline:** No raw Arabic text the learner types or speaks gets sent to PostHog. Mask all user-input fields in session replay. Event properties must be enums/IDs only (e.g., `quest_id: "zone-1-bazaar-greetings"`), never free text.
- Telemetry must be opt-out-able via a settings toggle. Default: opt-in for adults, opt-out under 13 (read existing onboarding age data).
- Perf overlay must add ≤1ms per frame when active and 0 cost when off (compile-time gated or early-return).
- Playwright suite must run in CI in <3 minutes.
- Cannot block the existing 2535+ vitest tests — green test count must remain green.

### Depends On
- Phase 97 (Visual Rebuild — Lucas's PR merged 2026-04) — stable visual layer so perf overlay measures real frames, not broken rendering.
- Phase 27.1 IndexedDB Migration — low-end-device flag persisted into the existing IndexedDB store.

### Preserve
- All existing onboarding age-gate logic (used to default opt-out for <13).
- Redux-persist behaviour — telemetry is a parallel observer, not part of state persistence.
- BootScene timing — instrumentation must not extend boot perceptibly.

### Requirements (to be defined during plan-phase)
- Preliminary: OBS-01 (PostHog SDK wired), OBS-02 (canonical learning-loop events emitted), OBS-03 (session replay with PII masking), OBS-04 (uncaught error capture), OBS-05 (perf overlay with toggle), OBS-06 (low-end-device flag detected + persisted), OBS-07 (opt-out toggle in settings, default per age), OBS-08 (Playwright smoke suite green in CI), OBS-09 (no regressions in existing vitest count).

</decisions>

<canonical_refs>
## Canonical References

- `.planning/PROJECT.md` — feature inventory
- `.planning/STATE.md` — current state
- `src/main.jsx` / `src/App.jsx` — React shell entry for SDK init
- `src/game/scenes/` — Phaser scenes (perf overlay attaches here)
- `src/store/` — Redux setup, for opt-out toggle slice
- `src/services/persistence/` (Phase 27.1) — IndexedDB layer for low-end flag
- `package.json` — vite + vitest + playwright already installed
- PostHog organization: FrameCoach (id `019d2bf5-3889-0000-1412-5918dc7408b0`) — reuse, do NOT create a new org
- PostHog project: separate Gogo Arabic project to be created in FrameCoach org during plan phase (do not co-mingle with FrameCoach Default project 148422)

</canonical_refs>

<specifics>
## Specific Ideas
- Use posthog-js with `autocapture: false` — emit only the canonical events, keeps volume predictable and PII-safe by default
- Event-name convention: `domain.action` (e.g., `quest.completed`, `fsrs.reviewed`, `zone.entered`) so Insights are easy to build later
- Perf overlay: small React component overlaying Phaser canvas, reads `game.loop.actualFps` + `performance.memory.usedJSHeapSize` once per second
- Low-end heuristic: average FPS < 45 over first 10 seconds OR `navigator.deviceMemory < 4` → set flag
- Playwright smoke: one spec file, one happy-path test — keep it boring, it's a gate not a coverage tool
- Use Playwright's `test.use({ video: 'retain-on-failure' })` so CI failures give a video out-of-the-box

</specifics>

<deferred>
## Deferred Ideas
- A/B experimentation via PostHog feature flags — useful but not needed for observability foundation
- Server-side telemetry (`server/src/server.js`) — separate phase, needs auth model first
- Custom error grouping / Sentry-style stack-trace UI — PostHog covers the 80%; revisit if it falls short
- Cohort analytics (retention curves, learning-velocity buckets) — dashboard work, not code work, do post-merge
- Performance budgets as CI gates (e.g., fail build if bundle >X MB) — Phase 104 territory

</deferred>

---

*Phase: 102-observability-test-coverage*
*Context stubbed: 2026-05-26. Run `/gsd-plan-phase 102` to produce RESEARCH + PLAN + VALIDATION.*
*Depends on Phase 97 (visual layer) being merged. Independent of Phase 98 — can ship in parallel.*
