---
phase: 102-observability-test-coverage
plan: 102-01
type: baseline
measured_at: 2026-05-26
measured_by: executor (Plan 102-01 Task 1)
branch: fix/redux-state-2026-05-15
purpose: Pre-install regression baseline for Phase 102. Plan 09 reads these numbers to verify no regressions before phase exit.
---

# Phase 102 Plan 01 — Pre-Install Baseline

## Bundle Size (npm run build)

Measured on branch `fix/redux-state-2026-05-15` on 2026-05-26.

### Main entry chunk
- `dist/assets/index-C3IR43db.js` — **121.95 KB** raw / **34.98 KB** gzipped

### Vendor chunks of interest (gzip)
| Chunk | Raw KB | Gzip KB |
|---|---|---|
| phaser | 1,208.02 | 332.18 |
| GameLayout | 1,036.67 | 269.99 |
| vocab-extended | 917.23 | 166.06 |
| vocab-core | 788.28 | 77.65 |
| react-vendor | 303.42 | 97.01 |
| charts-vendor | 329.31 | 90.44 |
| ink-vendor | 127.94 | 31.70 |
| misc-vendor | 119.26 | 36.90 |
| redux-vendor | 28.76 | 10.28 |
| router-vendor | 86.50 | 29.36 |
| poetry-game (lazy) | 1,467.19 | 400.83 |

### Bundle constraints (per PROJECT.md)
- Main bundle target: **<500 KB** raw — currently 121.95 KB (well under).
- PROJECT.md mentions historical "402KB main" — this refers to the aggregate eagerly-loaded payload pre-route-split, not the current `index-*.js` entry chunk.

### Bundle delta budget for Phase 102
- `posthog-js` (Plan 02 install) adds ~50 KB gzipped to a new dedicated `posthog-vendor` chunk (will require a `manualChunks` entry in `vite.config.js`).
- Session replay extension is lazy-loaded by posthog-js — does NOT inflate initial download.
- **bundle_baseline_kb: 121.95** (raw, main entry chunk)
- **bundle_baseline_gzip_kb: 34.98**

## Vitest Suite

### Documented baseline (per STATE.md, 2026-05-17)
- **vitest_baseline: 5623**
- Total: 5650 tests / 5623 passing / 19 known-failing across 5 files

### STATE.md known-failing files (5)
1. `src/game/scenes/__tests__/WorldSnapshot.test.js` — 11 failures, expected (rebaseline pending v16.0 visual rebuild)
2. `src/store/middleware/__tests__/zoneReviewMiddleware.test.js` — 5 failures (middleware-not-a-function error)
3. `src/services/__tests__/datasetValidation.test.js` — 2 failures (content drift: scholars 29/30, chains 19/20)
4. `src/store/slices/__tests__/settingsSlice.test.js` — 1 failure (initial-state key-count drift, 20 expected vs 22 actual)
5. `src/game/__tests__/battle.integration.test.js` — pre-existing failure (count not separately tallied in STATE.md)

### Actual measurement on 2026-05-26 (Task 1 run)
Command: `npm run test:run`

- Test Files: 274 passed | 1 failed | 1 skipped (276 total)
- Tests: **5725 passed | 11 skipped (5736 total)**
- Duration: 24.60s

**Drift versus STATE.md:**
- Total tests grew from 5650 → 5736 (+86) since 2026-05-17.
- Passing grew from 5623 → 5725 (+102) — most STATE.md known-failures have been resolved on this branch.
- The 5 STATE.md known-failing files now appear to be PASSING in the current vitest run — the only failing suite captured today is `src/test/fixtures/captureViaVitest.test.js` (TypeError `Cannot read properties of undefined (reading 'WebGL')` in `src/game/systems/ReplaceColorPipeline.js:1` — Phaser-renderer-not-defined in jsdom; this is a vitest environment limitation, not a Plan 102 regression).

### OBS-09 regression rule (THIS phase exit gate)

> Phase 102 MUST exit with vitest passing count **≥ 5623** AND the identity of pre-existing failures unchanged (no NEW failures introduced).
>
> The literal anchor for downstream grep: **vitest_baseline: 5623**
>
> If the actual measurement on Plan 09 verification differs, Plan 09 must record both `vitest_baseline: 5623` (the STATE.md anchor) AND the actual fresh measurement, and verify the delta is non-negative.

## PostHog Project Metadata

| Field | Value |
|---|---|
| Organization | FrameCoach |
| Organization ID | `019d2bf5-3889-0000-1412-5918dc7408b0` |
| Project name | Gogo Arabic (NEW — to be created in Task 3 checkpoint) |
| Project ID | TBD — captured during Task 3 human-verify checkpoint, will replace this placeholder |
| Region | EU (per UK user data residency) |
| Host | `https://eu.i.posthog.com` |
| Default project to AVOID | Default project 148422 (FrameCoach Default — do NOT co-mingle Gogo Arabic events here) |

### Required env vars (NOT in `.env.example` yet — Plan 02 adds them)
- **`VITE_POSTHOG_KEY`** — Public ingest key from new Gogo Arabic project (Project Settings → Project API Key). Starts with `phc_`. Safe to ship in client bundle (PostHog enforces per-origin allow-list).
- **`VITE_POSTHOG_HOST`** — Defaults to `https://eu.i.posthog.com` in code; override allowed for future US migration.

### Authorized URLs to allow-list in PostHog project settings (Task 3 step)
- `http://localhost:3000` (Vite dev server)
- Production URL — TBD (deploy phase not yet authored — see STATE.md "critical gap")

## Performance Budgets

### OBS-05 PerfOverlay budget
- **Active (overlay on, `?perf=1` or DEV):** ≤ 1 ms / frame.
- **Inactive (overlay off):** 0 ms / frame — achieved via dynamic import (`await import('./PerfOverlay.js')`) so Vite tree-shakes the module out of production bundles when the URL/DEV flag is absent.
- Update cadence: 1 Hz (`scene.time.addEvent({ delay: 1000 })`) — not per-frame.
- Canvas recording (PostHog `session_recording.captureCanvas`) MUST remain OFF (Phaser 120 → 25 fps regression risk per posthog-js #3273).

### OBS-08 Playwright smoke budget
- **< 3 minutes CI runtime** for the golden-path spec.
- Existing `playwright.config.js` already sets `reuseExistingServer: true` and `video: 'retain-on-failure'`.
- New spec must use `workers: 1` and `retries: 0` for fast failure.

### OBS-06 device performance heuristic
- Warmup window: 10 s, sample interval 250 ms (40 samples).
- Threshold: avg FPS < 45 OR `navigator.deviceMemory < 4 GB`.
- Fallback: `navigator.deviceMemory ?? Infinity` (Firefox/Safari don't expose it — treat as "not low-end" per RESEARCH Pitfall 4).

## Plan 09 Verification Anchors

When Plan 09 (regression check) runs, it MUST grep this file for:
- `bundle_baseline_kb: 121.95` (raw KB, main entry chunk)
- `bundle_baseline_gzip_kb: 34.98`
- `vitest_baseline: 5623`
- `VITE_POSTHOG_KEY`
- `eu.i.posthog.com`

Failure to find any of these anchors indicates this baseline file was tampered with — Plan 09 should treat as a blocker.

## Deviations from Plan Task 1 expectations

1. **Vitest count drift:** STATE.md captured 5623 passing on 2026-05-17; today's run shows 5725 passing on the same branch (`fix/redux-state-2026-05-15`). Recorded both — the OBS-09 gate uses the STATE.md anchor (5623) per acceptance criteria, but the actual measured pass count is healthier than the baseline (no regression risk).
2. **STATE.md known-failing files now pass:** The 5 files listed as "known-failing" in STATE.md appear to be passing in today's full-suite run; the only failure observed is `src/test/fixtures/captureViaVitest.test.js` (Phaser/WebGL not available in jsdom — unrelated to Phase 102).
3. **PostHog project ID is `TBD`** — will be filled in by the human verifier during Task 3 checkpoint.
