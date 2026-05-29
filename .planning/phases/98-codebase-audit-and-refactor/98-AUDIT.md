# Phase 98 — Codebase Audit (read-only first pass)

**Date:** 2026-05-29
**Commit:** `0e6189f`
**Auditor:** Claude Opus 4.8 (1M context)
**Scope of THIS pass:** read-only static analysis only — no source changes, no tooling
installs, no smoke tests. See "Remaining for full Plan 01" at the bottom.

## Executive summary

The codebase is **larger than assumed**: **243,468 src LOC across 932 files** (the roadmap
and CONTEXT say ~210K). Of that, **~97,465 LOC (40%) is data** (`src/data/`), so the actual
*logic* surface is ~146K LOC. Debt markers are low (only 3 TODO/FIXME/HACK), but there is a
**large disconnection problem**: **101 source modules have zero internal importers** — features
built but never wired into the running app. This matches the project's history (many systems
built ahead of the integration/visual layer) and is the single biggest finding.

## Baseline (98-01-BASELINE.json)

| Metric | Value |
|---|---|
| src LOC | 243,468 |
| server LOC | 6,952 |
| data/ LOC (subset of src) | 97,465 (40%) |
| src files | 932 |
| test files | 287 |
| passing tests | 5,786 (11 skipped) |
| JS bundle | 8,747,701 B (8.34 MB) |
| prod / dev deps | 18 / 19 |
| eslint-disable directives | 52 |
| TODO/FIXME/HACK | 3 |

## Findings by severity

### HIGH — 101 orphaned modules (dead/disconnected code)
Modules with no internal importer and that are not entry points. Full sign-off list in
**98-DELETIONS.md**. Concentrations (whole feature folders appear unwired):
- **MiniGames** (Crossword, MemoryMatch, NumberChallenge, WordSearch)
- **Idioms** (DailyIdiom, IdiomExplorer, IdiomQuiz)
- **Phonetics** (MinimalPairChallenge, PhoneticsGuide, PronunciationChallenge)
- **Social** (Leaderboard, ProfileManager, StatsShareCard)
- **Crafting** (CraftingResult, IngredientSelector, ProfessionPanel)
- **Onboarding** (ContextualTip, FeatureIntroduction, FeatureSuggestion)
- **UI primitives** (PixelButton, PixelPanel, SkeletonLoader, PauseMenu)
- `HUD/StatsPanel.jsx` — **already confirmed dead and decoupled this session** (commit 8b93304).

⚠️ **These are candidates, not confirmed deletions.** Orphan detection has false positives:
lazy `import()` with computed paths, registry/map references, or genuine entry points won't be
seen by static import-graph analysis. Each must be verified before deletion (the knip pass in
full Plan 01, with its import.meta.glob config, will reduce this list to higher confidence).

### MEDIUM — oversized files (refactor candidates)
Largest source files (lines):
| LOC | File | Note |
|---|---|---|
| 7,584 | `src/data/dialectComparison.js` | data (acceptable, but consider splitting/JSON) |
| 5,156 | `src/data/vocabularyExpanded.js` | data |
| 2,471 | `src/game/systems/MapLoader.js` | **largest non-data code file** — Lucas-rewritten; prime refactor target |
| 2,092 | `src/data/zones.js` | data + Lucas prop placements |

Most large files are data; the standout *code* file is `MapLoader.js`.

### LOW — lint suppressions
52 `eslint-disable` directives across src — worth a pass to see which mask real issues.

## Doc-vs-reality drift noted
- Roadmap/CONTEXT cite "~210K LOC"; actual src is **243K**. Update planning baselines.
- (From Phase 101 assessment) `quests.json` is 133 quests, not the documented 52.

## Server (6,952 LOC)
Real Express 5 + Mongoose app under `server/`. `/api/v1/game/*` routes deprecated this session
(Phase 103-01) pending replacement by `/api/v1/cloudsave/*`. Not deeply audited in this pass.

## Open questions for the user
1. The 101 orphans include entire feature folders (MiniGames, Idioms, Phonetics, Social…). Are
   these **intentionally-staged future features**, or genuinely abandoned? This determines whether
   Phase 98 deletes them or wires them in.
2. Confirm the 243K LOC figure should replace "210K" in the roadmap.

## Remaining for full Plan 01 (not done in this read-only pass)
- Install + configure `knip` (with import.meta.glob entry points), `dependency-cruiser`,
  `depcheck`, `madge` — high-confidence dead-code/dep/circular analysis.
- `dependency-cruiser` → SVG graph (**needs graphviz `dot`, a system binary — conflicts with the
  no-sudo preference; needs a decision**).
- Per-directory **coverage heatmap** (requires a `vitest run --coverage` pass).
- **15 Playwright golden-path smoke tests** + feature-count invariant tests (the safety harness).
- Register HEALTH-01..14 in REQUIREMENTS.md; pause the Ralph pipeline.
These involve tool installs and test authoring (not read-only), so they were deferred per the
"audit (read-only)" scope chosen for this pass.
