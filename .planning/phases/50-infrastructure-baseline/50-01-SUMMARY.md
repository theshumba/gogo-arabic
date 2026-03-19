---
phase: 50-infrastructure-baseline
plan: 01
subsystem: infra
tags: [vite, rollup-plugin-visualizer, react-lazy, code-splitting, bundle-optimization]

# Dependency graph
requires: []
provides:
  - "Initial JS bundle under 500KB (402KB, down from 1,235KB — 67% reduction)"
  - "rollup-plugin-visualizer dev dependency with build:analyze script"
  - "10 heavy GameLayout overlays converted to React.lazy + Suspense"
  - "GameLayout itself lazy-loaded in routes.jsx — game code defers until /game navigation"
affects:
  - phase-51-narrative-engine
  - phase-52-vocab-expansion
  - any-phase-adding-new-imports-to-GameLayout

# Tech tracking
tech-stack:
  added:
    - "rollup-plugin-visualizer 7.0.1 (dev dependency)"
  patterns:
    - "Lazy overlay pattern: React.lazy + Suspense fallback={null} for conditionally-rendered in-game overlays"
    - "Route-level lazy loading: GameLayout lazy in routes.jsx so all game code defers until /game"
    - "build:analyze script: ANALYZE=true vite build opens treemap in browser"

key-files:
  created: []
  modified:
    - "vite.config.js — conditional visualizer plugin gated behind ANALYZE=true env var"
    - "package.json — build:analyze script + rollup-plugin-visualizer devDependency"
    - "src/components/Router/GameLayout.jsx — 10 heavy overlays converted to lazy; Suspense wrapping"
    - "src/routes.jsx — GameLayout made lazy with Suspense fallback={null} LoadingScreen"

key-decisions:
  - "Made GameLayout itself lazy in routes.jsx (not just its overlay children) — this was the key to achieving 500KB; overlay-only lazy wrapping only reduced index from 1,235KB to 1,068KB; making GameLayout lazy pushed index to 402KB"
  - "fallback={null} for all in-game overlay Suspense boundaries — no loading spinner over Phaser canvas"
  - "LoadingScreen fallback for the GameLayout route Suspense — users navigating to /game see loading screen during initial game code load (acceptable, game wasn't running anyway)"
  - "PhaserGame stays eagerly imported within GameLayout — game canvas must render immediately once GameLayout loads"
  - "Visualizer gated behind ANALYZE=true — never opens browser on regular npm run build"

patterns-established:
  - "Lazy overlay pattern: const X = lazy(() => import('./X.jsx')); wrapped in <Suspense fallback={null}> at usage sites"
  - "Route lazy pattern for heavy feature areas: const GameLayout = lazy(() => import('...')); with <Suspense fallback={<LoadingScreen />}>"
  - "build:analyze workflow: ANALYZE=true npm run build -> dist/bundle-report.html treemap"

requirements-completed:
  - INFRA-01
  - INFRA-03

# Metrics
duration: 25min
completed: 2026-03-19
---

# Phase 50 Plan 01: Bundle Size Optimization Summary

**Initial JS bundle reduced from 1,235KB to 402KB (67% reduction) via React.lazy for 10 heavy GameLayout overlays plus lazy-loading GameLayout itself at the route level, with rollup-plugin-visualizer added for ongoing bundle visibility.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-03-19T21:59:20Z
- **Completed:** 2026-03-19T22:25:00Z
- **Tasks:** 2 (plus 1 auto-fix deviation)
- **Files modified:** 5

## Accomplishments

- Initial JS bundle: 1,235KB -> **402KB** (67% reduction, well under 500KB target)
- 10 heavy game overlays now async chunks: BattleOverlay (46KB), CraftingMiniGame (37KB), ShopOverlay (20KB), SpellMenu (17KB), InventoryUI (16KB), Wardrobe (7KB), RecipeBook (7KB), QuestJournal (6KB), MagicOverlay (4KB), RootDiscoveryToast (2KB)
- GameLayout itself now a 663KB async chunk that only loads when user navigates to /game
- `npm run build:analyze` opens treemap HTML report in browser for ongoing bundle visibility
- `npm run build` exits 0 cleanly; no regressions

## Task Commits

1. **Task 1: Install rollup-plugin-visualizer and add build:analyze script** - `e1e9dc4` (feat)
2. **Task 2: Lazy-wrap heavy GameLayout overlays + make GameLayout lazy** - `ad55d0e` (feat)

## Files Created/Modified

- `vite.config.js` — Added `import { visualizer }` + conditional plugin in plugins array with `.filter(Boolean)`
- `package.json` — Added `"build:analyze": "ANALYZE=true vite build"` script + `rollup-plugin-visualizer` devDependency
- `package-lock.json` — Updated by npm install (26 new packages)
- `src/components/Router/GameLayout.jsx` — Updated React import to include `lazy, Suspense`; converted 10 heavy imports to lazy consts; wrapped each lazy component usage in `<Suspense fallback={null}>`
- `src/routes.jsx` — Changed `import GameLayout from '...'` to `const GameLayout = lazy(() => import('...'))` with `<Suspense fallback={<LoadingScreen />}>` wrapper in /game route

## Decisions Made

- Made GameLayout itself lazy in routes.jsx — not just the overlays. Overlay-only approach reduced index from 1,235KB to 1,068KB (still over 500KB). Making GameLayout lazy pushed it to 402KB because all game system code (Phaser scenes via config.js, hooks with game system deps, all overlays) became deferred.
- `fallback={null}` for all overlay Suspense boundaries — no loading spinner appears over the Phaser canvas. When a user opens battle/inventory for the first time the overlay loads silently; Phaser canvas remains visible.
- `fallback={<LoadingScreen />}` for the GameLayout route Suspense in routes.jsx — users see the standard loading screen while the 663KB GameLayout chunk downloads on first navigation to /game. This is acceptable UX since the game wasn't running yet.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Made GameLayout lazy-loaded in routes.jsx**
- **Found during:** Task 2 (lazy-wrap heavy overlays)
- **Issue:** After converting all 10 overlay components to React.lazy, initial bundle only dropped to 1,068KB (plan requires under 500KB). The store.js eagerly imported by main.jsx pulls all slice reducers; config.js → WorldScene/BattleScene/InteriorScene pull game system code; both are in the static import chain through routes.jsx → GameLayout. Overlay-only lazy wrapping removes the component render code but not the store/scene transitive deps since those enter the bundle via different import paths.
- **Fix:** Changed `import GameLayout from './components/Router/GameLayout.jsx'` to `const GameLayout = lazy(() => import('./components/Router/GameLayout.jsx'))` in routes.jsx. Added `<Suspense fallback={<LoadingScreen />}>` wrapper in the /game route element. This makes GameLayout and all its transitive imports (Phaser scenes via PhaserGame → config, all hooks, all eager overlays) into an async chunk.
- **Files modified:** `src/routes.jsx`
- **Verification:** `npm run build` shows `index-*.js: 402KB` (under 500KB target); `GameLayout-*.js: 663KB` (async chunk loaded only on /game navigation)
- **Committed in:** `ad55d0e` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 — missing critical approach for meeting plan's own success criteria)
**Impact on plan:** Necessary to meet the plan's stated 500KB target. Changes are fully consistent with the plan's intent and the research doc's observation that "routing already uses React.lazy for every screen" — GameLayout was the one screen not yet lazy-loaded.

## Issues Encountered

- Bundle reduction from overlay lazy-wrapping alone was insufficient (1,068KB, not 500KB). Root cause: store.js is always eagerly loaded (correct behavior — store is the app root), and game scenes are eagerly imported by config.js which PhaserGame imports. The research doc noted GameLayout overlay imports as the bottleneck but the actual bottleneck included GameLayout itself in the static import graph. Resolved by applying route-level lazy loading to GameLayout.

## Next Phase Readiness

- Phase 50-02 (zone-based Phaser asset loading) can proceed — bundle baseline is clean
- Phase 50-03 (worldStateSlice expansion) can proceed — no bundle conflicts
- Phase 51 (inkjs + narrative engine) can proceed — initial bundle has room for new dependencies
- Any new lazy-loadable overlays should follow the established pattern: `const X = lazy(() => import(...))` + `<Suspense fallback={null}>`

## Self-Check

Files verified:
- `vite.config.js` — contains `visualizer` import and conditional plugin
- `package.json` — contains `build:analyze` script and `rollup-plugin-visualizer` devDependency
- `src/components/Router/GameLayout.jsx` — contains 10 lazy imports and Suspense wrapping
- `src/routes.jsx` — GameLayout is lazy with Suspense boundary

---
*Phase: 50-infrastructure-baseline*
*Completed: 2026-03-19*
