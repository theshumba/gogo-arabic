---
phase: 102-observability-test-coverage
plan: 06
subsystem: phaser-perf-instrumentation
tags: [observability, perf-overlay, OBS-05, tree-shaking, dynamic-import, phaser]
requirements: [OBS-05]
dependency_graph:
  requires:
    - Plan 102-01 (RED scaffold: src/game/ui/__tests__/PerfOverlay.test.js)
    - Phaser 3.x scene-ready event bus (EventBus + EVENTS.SCENE_READY)
  provides:
    - PerfOverlay class (1Hz FPS/Δms/draws/heap overlay, typeof-guarded)
    - Dynamic-import gating in PhaserGame.jsx (?perf=1 || DEV)
    - Production tree-shaking — dedicated chunk dist/assets/PerfOverlay-*.js
  affects:
    - Plan 102-07 (low-end-device sampler can read real numbers via overlay)
    - Plan 102-09 (regression check has a manual visual sanity overlay)
tech_stack:
  added: []
  patterns:
    - "Dynamic ESM import as Vite tree-shake boundary (`await import('./ui/PerfOverlay.js')`)"
    - "Phaser scene-time event for 1Hz cadence (`scene.time.addEvent({ delay: 1000, loop: true })`)"
    - "typeof guard for Chromium-only `performance.memory` (Firefox/Safari safe)"
    - "vi.stubGlobal/unstubAllGlobals for jsdom-protected globals in unit tests"
key_files:
  created:
    - src/game/ui/PerfOverlay.js
  modified:
    - src/game/PhaserGame.jsx
    - src/game/ui/__tests__/PerfOverlay.test.js
decisions:
  - "1Hz cadence via Phaser's scene.time.addEvent (not requestAnimationFrame, not Phaser scene.update). Phaser's TimerEvent already pauses when the scene is paused — one less lifecycle concern."
  - "Named export AND default export from PerfOverlay.js. The unit test imports `{ PerfOverlay }`; PhaserGame.jsx imports `{ default: PerfOverlay }`. Supporting both means future consumers don't need to know the internals."
  - "Hold the overlay instance on window.__PERF_OVERLAY__ in DEV only (not in `?perf=1` prod sessions) — keeps the prod surface free of debug globals."
  - "Cleanup teardown in PhaserGame.jsx destroys the overlay BEFORE Phaser.Game.destroy so the 1Hz timer never references a dead scene."
metrics:
  duration_seconds: 265
  duration_human: "~4 minutes"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 2
  vitest_passing_before: 5623
  vitest_passing_after: 5739
  vitest_delta: "+116 (includes other plans' GREEN landings since baseline)"
  prod_chunk_size_bytes: 738
  completed_at: "2026-05-27T01:15:00Z"
---

# Phase 102 Plan 06: Phaser PerfOverlay (FPS/Δms/draws/heap) Summary

**One-liner:** Shipped a 1Hz Phaser perf overlay (`FPS Δms draws heap`) gated behind `?perf=1` or `import.meta.env.DEV`, with Vite dynamic-import tree-shaking the 738-byte chunk out of the production main bundle.

## What Was Built

### Task 1: `src/game/ui/PerfOverlay.js` (NEW, 73 lines)

A `PerfOverlay` class with three methods:

- **`constructor(scene)`** — Creates a Phaser text object (`scene.add.text(8, 8, '', { font: '12px monospace', color: '#00ff88', backgroundColor: 'rgba(0,0,0,0.6)' }).setScrollFactor(0).setDepth(99999)`) and a 1Hz Phaser timer (`scene.time.addEvent({ delay: 1000, callback: this.update, callbackScope: this, loop: true })`). The literal `delay: 1000` is asserted by the Plan 01 unit test (T-102-17 mitigation).
- **`update()`** — Reads `scene.game.loop.actualFps` (1-decimal), `scene.game.loop.delta` (1-decimal), `scene.game.renderer.drawCount` (fallback `'n/a'` for canvas renderer), and `performance.memory.usedJSHeapSize` (in MB; `'n/a'` when `performance.memory` is undefined — Firefox/Safari path). Writes `FPS x.x  Δy.yms  draws Z  heap NMB`.
- **`destroy()`** — Calls `timer.remove()` and `text.destroy()`, then nulls both refs; safe to call twice.

Both **named** (`export class PerfOverlay`) and **default** (`export default PerfOverlay`) exports cover the two consumer patterns (unit test imports named; PhaserGame imports default).

### Task 2: `src/game/PhaserGame.jsx` (MODIFIED, +35/-3)

Extended the existing `EventBus.once(EVENTS.SCENE_READY, ...)` callback to be `async` and append the gated dynamic-import block:

```js
const perfEnabled =
  import.meta.env.DEV ||
  new URLSearchParams(window.location.search).has('perf');
if (perfEnabled && worldScene) {
  try {
    const { default: PerfOverlay } = await import('./ui/PerfOverlay.js');
    const overlay = new PerfOverlay(worldScene);
    if (import.meta.env.DEV) window.__PERF_OVERLAY__ = overlay;
  } catch (err) { /* non-essential — warn and continue */ }
}
```

The cleanup hook (returned from `useEffect`) tears down `window.__PERF_OVERLAY__` (if set) before `gameRef.current.destroy(true)`, so the 1Hz timer never references a dead scene.

### Test fix: `src/game/ui/__tests__/PerfOverlay.test.js` (MODIFIED)

Two changes:

1. **Removed the hard RED gate test** (`throw new Error('not implemented')`) — its purpose was to keep CI red until Plan 06 implemented the module; that contract is now satisfied.
2. **Fixed a bug in the Firefox/Safari simulation test** (Rule 1 auto-fix): `Object.defineProperty(globalThis, 'performance', ...)` throws `Cannot assign to read only property 'performance'` in jsdom because the property is non-configurable. Switched to `vi.stubGlobal('performance', { now: () => 0 })` + `vi.unstubAllGlobals()`, which Vitest tracks properly. The behavior under test (production code handling `performance.memory === undefined`) is unchanged.

## Verification

| Check | Command | Result |
| --- | --- | --- |
| Unit test GREEN | `npx vitest run src/game/ui/__tests__/PerfOverlay.test.js` | **4/4 passed** |
| Full vitest suite | `npx vitest run` | **5739 passed** (baseline 5623 → +116; 6 failures are pre-existing RED gates in Plans 02/03/04/05/07, none in Plan 06) |
| Production build | `npm run build` | **Exit 0** |
| Chunk-split verified | `find dist -name '*PerfOverlay*'` | `dist/assets/PerfOverlay-BVyOHynt.js` (738 bytes) — dedicated chunk |
| Tree-shaking verified | `grep -c "actualFps\|delay:1000\|drawCount" dist/assets/GameLayout-*.js` | **0** — the main GameLayout bundle does NOT inline the overlay |
| Implementation localized | `grep -c "actualFps\|drawCount" dist/assets/PerfOverlay-*.js` | **1** — the overlay implementation lives only in its own chunk |

**Zero-cost-when-off promise**: confirmed. Production users who don't visit with `?perf=1` never fetch the PerfOverlay chunk; the main bundle has no reference to `actualFps`, `drawCount`, or `delay:1000`.

## Acceptance Criteria

Task 1:
- [x] `npx vitest run src/game/ui/__tests__/PerfOverlay.test.js` exits 0 (4 passed)
- [x] `grep -c "delay: 1000" src/game/ui/PerfOverlay.js` >= 1 (got 2)
- [x] `grep -c "actualFps" src/game/ui/PerfOverlay.js` >= 1 (got 1)
- [x] `grep -c "drawCount" src/game/ui/PerfOverlay.js` >= 1 (got 2)
- [x] `grep -c "typeof performance" src/game/ui/PerfOverlay.js` >= 1 (got 1)
- [x] `grep -c "destroy" src/game/ui/PerfOverlay.js` >= 1 (got 2)
- [x] File length >= 30 lines (got 73)
- [x] Pre-existing tests still green

Task 2:
- [x] `grep -c "PerfOverlay" src/game/PhaserGame.jsx` >= 1 (got 6)
- [x] `grep -c "await import" src/game/PhaserGame.jsx` >= 1 (got 2)
- [x] `grep -E "has\(.perf.\)|perf=1" src/game/PhaserGame.jsx | wc -l` >= 1 (got 1)
- [x] `npm run build` exits 0
- [x] `dist/assets/PerfOverlay-*.js` chunk exists (738 bytes)
- [x] Pre-existing tests still green (5739 passing; >= 5624)
- [ ] **Manual smoke (deferred to Plan 09 Playwright):** `npm run dev` → `http://localhost:3000/?perf=1` → overlay visible in top-left of canvas. *Not blocking — Plan 09 will assert this in the golden-path Playwright spec.*

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] Fixed jsdom-incompatible global mutation in Plan 01's RED test**

- **Found during:** Task 1 (first vitest run after writing PerfOverlay.js — 2/4 tests passing)
- **Issue:** Plan 01's `PerfOverlay.test.js` cross-browser test used `Object.defineProperty(globalThis, 'performance', { value: ..., configurable: true })` to simulate Firefox/Safari (no `performance.memory`). In jsdom, `globalThis.performance` is **non-configurable**, so the `defineProperty` call throws `TypeError: Cannot assign to read only property 'performance'`. The error blew through the `try/finally` cleanup, leaving the global in a bad state for the `destroy` test that followed and for the project-wide `setup.js` cleanup. The production code (`PerfOverlay.update`) handled `performance.memory === undefined` correctly — only the test simulation was broken.
- **Fix:** Switched to Vitest's `vi.stubGlobal('performance', { now: () => 0 })` + `vi.unstubAllGlobals()` (tracked by Vitest, restores cleanly even when jsdom protects the property). Added a defensive `afterEach(() => vi.unstubAllGlobals())` so no stubbed global leaks into other tests. Imported `afterEach` from vitest. Behavior under test is unchanged — the assertion is still `expect(() => overlay.update()).not.toThrow()`.
- **Files modified:** `src/game/ui/__tests__/PerfOverlay.test.js`
- **Commit:** ec18f07 (folded into Task 1's commit — the test fix was needed to verify Task 1's GREEN gate)

### Intentional test deletion

The Plan 01 RED scaffold included a deliberate hard-RED-gate test:

```js
it('RED gate: Plan 06 has not yet implemented PerfOverlay.js — this test fails by design', () => {
  throw new Error('not implemented — Plan 102-06 (PerfOverlay 1Hz overlay)');
});
```

This was a by-design failure marker (Plan 01's comment: "Hard RED gate"). Plan 06's job is to remove it and ship the implementation. Removed in commit ec18f07.

## Authentication Gates

None — this plan does NOT touch any auth surface, network, or external service. PerfOverlay is local-only debug instrumentation; no PostHog, no IndexedDB, no Redux.

## Known Stubs

None. PerfOverlay is fully functional — all four metrics (FPS, Δms, draws, heap) are real, live reads from the Phaser game loop and `performance.memory`. The `'n/a'` fallback for `drawCount` (canvas renderer) and heap (Firefox/Safari) is correct behavior, not a stub.

## Deferred Issues

**1. Manual visual smoke test of `?perf=1`** — punted to Plan 09's Playwright golden-path spec. The unit test already asserts every assertion the manual test would (1Hz timer, three metric reads, typeof guard, destroy cleanup). The remaining "did it actually paint on the canvas?" check is exactly what Plan 09's Playwright video-capture is for.

**2. Optional PostHog tag on overlay session** — TODO comment in PerfOverlay.js header notes that Plan 03 may later tag a perf-instrumented PostHog session with a feature flag. Not part of OBS-05 scope.

## Threat Flags

None. The plan's `<threat_model>` covered all three relevant threats (T-102-17 perf budget, T-102-18 heap disclosure, T-102-19 prod-bundle leakage) and they are all mitigated as documented above. No new trust boundaries were introduced.

## TDD Gate Compliance

Plan 06 is `tdd="true"` on both tasks. Gate sequence verified in `git log`:

- **RED:** Plan 01's `test(102-01)` commit (pre-existing, baseline 102-01-BASELINE.md) added the failing PerfOverlay.test.js.
- **GREEN:** `ec18f07 feat(102-06): implement PerfOverlay class with 1Hz update and typeof guards` turned the test GREEN.
- **GREEN (integration):** `994afd7 feat(102-06): gated dynamic import of PerfOverlay (?perf=1 || DEV)` wires the consumer with build-time verification.
- **REFACTOR:** None needed — the implementation matches RESEARCH Pattern 3 exactly; no cleanup pass required.

## Commits

| # | Hash | Message |
| --- | --- | --- |
| 1 | `ec18f07` | feat(102-06): implement PerfOverlay class with 1Hz update and typeof guards |
| 2 | `994afd7` | feat(102-06): gated dynamic import of PerfOverlay (?perf=1 || DEV) |

## Self-Check: PASSED

- [x] **`src/game/ui/PerfOverlay.js`** — exists (73 lines)
- [x] **`src/game/PhaserGame.jsx`** — modified (+35 lines for dynamic-import gate)
- [x] **`src/game/ui/__tests__/PerfOverlay.test.js`** — modified (RED gate removed, jsdom-compatible Firefox/Safari simulation)
- [x] **Commit `ec18f07`** — present in `git log`
- [x] **Commit `994afd7`** — present in `git log`
- [x] **`dist/assets/PerfOverlay-BVyOHynt.js`** — present (738 bytes) after `npm run build`
