# Phase 98: Codebase Audit & Refactor — Research

**Researched:** 2026-04-17
**Domain:** Whole-codebase audit + guardrailed refactor for a 210K LOC React 19 + Phaser 3 + Redux Toolkit + Express 5 monorepo
**Confidence:** HIGH on tool selection and safety rails; MEDIUM on exact refactor sequencing (depends on what the audit finds); LOW on the disposition of 11 unassigned phase stubs (the user must decide, not research).

## Summary

Phase 98 is an audit-first, guardrailed cleanup phase. The dominant research question is not "which tool finds the most dead code" — it is **"which approach protects against false-positive deletions in a codebase that uses `import.meta.glob`, EventBus string constants, `redux-persist` slice keys, Phaser texture keys, ink story filenames, and 45 middleware wired by name."** Those are the six structural false-positive vectors in this codebase, and every tool decision flows from them.

The plan that follows has three phases inside the phase: **Audit (Plan 01)** — read-only, produces `AUDIT.md` + `DELETIONS.md` for user sign-off; **Gate (Plan 02)** — Wave-0 test infrastructure to cover any system the audit flagged for refactor; **Refactor (Plans 03-N)** — atomic, reversible refactors, one concern per commit, every modification preceded by green tests of the system being changed. Nothing gets deleted until the user ticks a box in `DELETIONS.md`.

**Primary recommendation:** Use **Knip 6.4.1** as the primary dead-code and unused-export detector (it handles ESM JS/JSX projects, is actively maintained, and has explicit documented patterns for resolving the exact false-positive vectors this codebase has). Layer **madge 8.0.0** for circular-import detection, **depcheck 1.4.7** for unused npm dependencies, and **dependency-cruiser 17.3.10** for the module dependency graph visualization the user asked for. Do NOT rely on `ts-prune` (TypeScript-only, this is a JS/JSX codebase). Every dead-code finding goes through a three-layer safety filter (Knip config → manual review in `AUDIT.md` → user sign-off in `DELETIONS.md`) before any `rm` runs.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Hard Guardrails (non-negotiable)

1. **Audit-first, act-second** — Plan 01 produces `AUDIT.md` listing dead code, architectural drift, tangled dependencies, performance hotspots. Nothing gets modified until user reviews and signs off section by section.
2. **No deletions without explicit user approval** — Every candidate for removal goes onto a sign-off list the user approves item-by-item. Silent deletions are forbidden, even for code that "looks obviously dead."
3. **Test coverage before any refactor** — If a system being refactored has no test coverage, add tests FIRST (as a separate task/plan before the refactor task). A refactor without pre-existing green tests cannot prove behavior preservation.
4. **Feature preservation is the first verification gate** — Success criterion #1 for this phase: "All existing features continue to work." Every plan must include this as an acceptance criterion.
5. **All 2535 existing tests must continue to pass** — unchanged from Phase 97 standard.
6. **Every modification is atomic and reversible** — one refactor = one commit = one revert target. No multi-system sweeps in a single commit.

#### Scope

- **In scope:** Dead code removal (with approval), architectural consolidation, tangled dependency unwinding, performance hotspot fixes, inconsistent pattern reconciliation, obsolete config/comment cleanup, import reorganization, file-size reduction where reasonable, deletion of `.planning/` artifacts that no longer reflect reality (e.g., completed phase stubs 86-96 review).
- **Out of scope:** New features, new systems, behavior changes, game-logic redesigns, performance *optimizations* that change semantics, migration to new frameworks (no TypeScript migration), Phaser/React version upgrades, backend architecture changes.
- **Not touched by refactor:** FSRS algorithm implementation, ink dialogue engine, Redux slice action names and types (public contract), test file assertions (only test infrastructure), any Arabic language data files (JSON content is sacred), any user-facing strings or i18n.

#### Pre-existing Stubs (86-96) — Investigate and Decide

- Phase directories 86-96 exist with plan stubs (Ramadan events, difficulty curve, progression, NPC/quest expansion, content, leaderboards, tutorial, analytics, idioms, pronunciation, battle).
- Not currently assigned to any milestone.
- Audit should classify each: (a) still relevant → assign to future milestone, (b) superseded by shipped work → archive, (c) obsolete → remove with user approval.
- Do NOT bulk-delete. Each stub gets individual assessment in AUDIT.md.

#### Audit Dimensions (what AUDIT.md must cover)

1. **Dead code** — unused exports, unreferenced files, commented-out code blocks, unreachable branches
2. **Duplicate logic** — same algorithm implemented in multiple places
3. **Architectural drift** — places where the established pattern is violated (e.g., Redux slice accessed directly instead of via selector)
4. **Tangled dependencies** — circular imports, God modules, over-coupled systems
5. **Performance hotspots** — known slow code paths, large bundle contributors, memory leaks
6. **Inconsistent patterns** — same concern handled differently across the codebase (e.g., error handling, logging)
7. **Test coverage gaps** — systems with no or weak tests that will need new tests before any refactor can touch them
8. **Comment rot** — stale comments, TODO/FIXME/HACK markers that are years old
9. **Configuration cruft** — unused env vars, config keys that no feature references
10. **Git-level drift** — files in `.planning/` that don't match ROADMAP/STATE reality

#### 1M Context Strategy

- **Single-pass analysis** — load the entire source tree in one context.
- **Cross-module reference tracing** — trace every import of every export globally before flagging.
- **Test ↔ source mapping** — with all test files + source files in one context, produce a test-coverage heatmap as part of AUDIT.md.

#### Quality Expectations

- Quality over speed. Don't rush. Conservative on deletions. Prefer consolidation over removal.

#### Depends on

- Phase 97 complete — visual layer must be stable and tested before a refactor sweep.

#### Preserve

- All 2535 existing tests
- All user-facing features (games, quizzes, quests, dialogue, NPCs, world, battles, companions, equipment, crafting, FSRS, etc.)
- All Arabic content (vocabulary, grammar data, NPC dialogue, quest text)
- All game save data compatibility
- All API endpoints and their contracts
- All keyboard shortcuts and UI interactions
- All localStorage + IndexedDB schemas

### Claude's Discretion

- Internal file organization proposals in AUDIT.md
- How to structure the AUDIT.md document (sections, tables, priority ranking)
- How granular to split the refactor plans (per-system vs per-concern)
- Which dead-code detection tools to use (ast-grep, ts-prune, etc.)
- How to represent "test coverage gap" visually in AUDIT.md
- Whether to produce a standalone `DELETIONS-APPROVED.md` sign-off file or inline the sign-off in AUDIT.md

### Deferred Ideas (OUT OF SCOPE)

- TypeScript migration — out of scope per PROJECT.md
- Phaser / React major version upgrades — defer to a separate version-upgrade phase
- Backend architecture rewrite — out of scope
- Performance optimisations that change behavior — defer
- Replacing Redux Toolkit — out of scope
- New tooling (Bun, Biome) — defer
- Renaming public APIs — defer
- Monorepo restructuring — defer
</user_constraints>

<phase_requirements>
## Phase Requirements

Phase 98 has no pre-registered requirement IDs yet — the roadmap records them as TBD. This research proposes **14 HEALTH-* IDs** below in the *Proposed Requirements* section. Plan 01 will add them to `.planning/REQUIREMENTS.md` as the first action of the phase. The mapping of each ID to research findings is:

| ID (proposed) | Description (short) | Research Section Providing Support |
|---|---|---|
| HEALTH-01 | AUDIT.md produced before any modifications | Audit Structure |
| HEALTH-02 | Every deletion candidate listed in DELETIONS.md with user checkbox | Sign-Off Mechanism |
| HEALTH-03 | Zero silent file deletions; git log proves every `rm` maps to an approved DELETIONS.md entry | Sign-Off Mechanism |
| HEALTH-04 | Test coverage ≥ baseline for every system refactored in this phase | Test Coverage Measurement |
| HEALTH-05 | All 2535 existing tests still pass after each commit in the phase | Validation Architecture |
| HEALTH-06 | Feature preservation smoke tests green (see list) | Feature Preservation Smoke Test |
| HEALTH-07 | Test-count invariant: `test count >= 2535` at every commit | Validation Architecture |
| HEALTH-08 | Dependency graph SVG artifact produced and committed to `.planning/phases/98-.../dependency-graph.svg` | Tool Selection |
| HEALTH-09 | Each of phases 86-96 has an explicit keep/archive/delete disposition in AUDIT.md | Pre-existing Stubs Disposition |
| HEALTH-10 | Ralph pipeline (`scripts/ralph/`) audited but any modification is user-confirmed before commit | Ralph Pipeline Safety |
| HEALTH-11 | Every refactor commit is atomic and independently revertable (one concern per commit) | Refactor Patterns |
| HEALTH-12 | Bundle-size invariant: production `dist/` total bytes ≤ pre-phase baseline (never grows) | Validation Architecture |
| HEALTH-13 | Test-runtime invariant: `vitest run` wall-clock time within 20% of pre-phase baseline | Validation Architecture |
| HEALTH-14 | LOC reduction measurable (target ≥ 10%) WITHOUT feature loss, proven by smoke-test pass | Validation Architecture + Feature Preservation |

The planner should register these in REQUIREMENTS.md as the first task of Plan 01. HEALTH-* is a new category specific to Phase 98 — no conflict with existing prefixes (FIX, SKILL, GRAM, QUIZ, CEFR, ACH, PERF, WIRE, IMM, TEST, NAR, AUD, DAILY, READ, WRITE, CONV, MINI, WORLD, STOR, MGIC, COMP, INTG, CRAFT, RSRC, CINT, STAT, COMBO, ADVB, ARENA).
</phase_requirements>

## Architectural Responsibility Map

Phase 98 is a meta-phase about the codebase itself, not about user-facing capabilities. The "responsibility" here is mapping each *audit output artifact* to the tier or process that produces it.

| Capability | Primary Tier / Process | Secondary | Rationale |
|---|---|---|---|
| Whole-codebase read-through (1M context) | Claude single-pass analysis | — | This is the core reason Phase 98 exists; no tool replaces it |
| Unused-export / unreferenced-file detection | Knip (static analyzer) | Manual cross-check with 1M context | Static analyzer is fast; 1M context is the authoritative false-positive filter |
| Unused npm dependency detection | depcheck | Knip | depcheck is purpose-built and simpler; Knip confirms |
| Circular import detection | madge | dependency-cruiser | madge is a single command; cruiser is the richer tool |
| Module dependency graph (SVG) | dependency-cruiser | — | Only tool that produces Graphviz SVG out of the box |
| Bundle composition / largest contributors | rollup-plugin-visualizer (already installed) | — | `ANALYZE=true npm run build` already produces `dist/bundle-report.html` |
| Coverage heatmap | vitest coverage-v8 (already installed) | manual mapping in AUDIT.md | `npm run test:coverage` already emits `json-summary`; Claude reads it + renders heatmap |
| Duplicate-logic detection | Claude manual review in 1M context | — | No tool finds semantic duplication reliably; the 1M context pass IS the tool |
| Architectural-drift detection | Claude manual review + grep checks | ESLint custom rules (out of scope) | Same reason — semantic, not syntactic |
| Deletion approval gate | DELETIONS.md user-checkbox file | Git pre-commit hook (optional) | The user's hardest constraint; must be a human artifact, not an automation |
| Feature-preservation verification | Playwright smoke tests + vitest suite | Manual in-browser run | Automated first, human second |
| Planning-doc drift reconciliation | Claude manual review of .planning vs STATE.md vs git history | — | No tool can infer intent; needs human decisions |

## Safety Rail — How We Protect Against False-Positive Deletions

**This is the load-bearing section of the research.** The user's #1 fear is essential code being removed. The guardrail must be concrete, not aspirational.

### The six structural false-positive vectors in THIS codebase

Every dead-code finding must be filtered through these six patterns before it ever reaches `DELETIONS.md`:

| # | Vector | How it fools static analyzers | Example in this codebase |
|---|---|---|---|
| 1 | **`import.meta.glob` dynamic imports** | Vite expands these at build time; static analyzers see the template string, not the resolved files | `src/data/npcDialogueLoader.js` loads `./npc-dialogue/${zoneName}.json` via `import.meta.glob('./npc-dialogue/*.json')` — every zone JSON will appear unreferenced |
| 2 | **Phaser texture/audio/atlas keys referenced by string** | Assets loaded via `this.load.image('key', 'path')` and referenced later via `this.add.sprite(x, y, 'key')`; no static import exists | BootScene loads ~1000 Kenmi assets by string key; many consumers reference those keys via data tables in `src/world/ZoneRegistry.js` |
| 3 | **EventBus event constants wired at runtime** | 74 namespaced event constants in `src/utils/eventBusTypes.js`; emitters and listeners live in different files, connected only by the string value | `eventBus.emit(EVENTS.ZONE_ENTERED, ...)` in one file, `eventBus.on(EVENTS.ZONE_ENTERED, ...)` in another — remove the constant and both sites silently stop talking |
| 4 | **`redux-persist` slice keys** | Keys live in `store.js` whitelist arrays; removing a slice file without updating the whitelist or migration breaks hydration, and a slice unreferenced in components may still be critical for persisted data read during migration | 60 slices × redux-persist × CURRENT_VERSION migrations (v0→v12 known); unused-looking migration functions are ESSENTIAL on first load |
| 5 | **ink dialogue files loaded by filename** | `scripts/compile-ink.mjs` compiles `.ink` → `.ink.json`; runtime code loads them by path string | `src/data/ink/*.ink.json` files referenced via dynamic import patterns |
| 6 | **Redux middleware wired by position in the middleware array** | 45 middleware files in `src/store/middleware/`; the chain order matters semantically (achievement middleware must run after slice reducers) | Removing an "unused-looking" middleware may not error but silently disables a cross-cutting concern like `achievementMiddleware` firing on grammar lesson completion |

### The three-layer safety filter

Every deletion candidate must pass all three layers before being added to `DELETIONS.md`:

**Layer 1 — Knip configuration that models the 6 vectors**

Plan 01 produces a `knip.json` at repo root containing:
```json
{
  "$schema": "https://unpkg.com/knip@6/schema.json",
  "entry": [
    "src/main.jsx",
    "src/routes.jsx",
    "server/src/server.js",
    "scripts/*.{js,mjs,sh}",
    "vite.config.js",
    "vitest.config.js",
    "src/store/store.js",
    "src/store/slices/*.js",
    "src/store/middleware/*.js",
    "src/game/scenes/*.js",
    "src/data/npc-dialogue/*.json",
    "src/data/ink/*.ink.json",
    "src/data/**/*.json",
    "public/assets/manifests/**/*.json",
    "scripts/ralph/*.{js,sh,json}"
  ],
  "project": ["src/**/*.{js,jsx}", "server/**/*.{js}", "scripts/**/*.{js,mjs}"],
  "ignore": ["dist", "node_modules", "e2e/**"],
  "ignoreDependencies": ["phaser", "inkjs", "howler", "ts-fsrs", "@reduxjs/toolkit"]
}
```
[VERIFIED: Knip 6.4.1 docs at https://knip.dev/guides/handling-issues — confirms dynamic imports via template strings and `import.meta.glob` require explicit entry patterns]. This config conservatively marks every slice, middleware, scene, dialogue, ink, manifest, and Ralph file as a named entry point, which means Knip will only flag files that have NO named reference AND no implicit entry.

**Layer 2 — Manual 1M-context cross-check**

For every file Knip flags, Claude does a grep of the filename stem (minus extension) across the entire tree. If ANY match surfaces in:
- EventBus constant names
- Redux action type strings
- Asset manifest JSON
- ink compiled output
- A saved `prd-*.json` under `scripts/ralph/`
- A comment containing `// lazy-load:` or `import.meta.glob`
- A `package.json` script
… the file is reclassified from "dead" to "indirect-reference — keep".

**Layer 3 — User sign-off in DELETIONS.md**

Every candidate that survives Layers 1 and 2 goes onto `98-DELETIONS.md` with:
- File path
- Size (bytes, LOC)
- Knip's evidence line
- The 1M-context reasoning for why it's safe to delete
- A checkbox `- [ ] Approved` that the user ticks
- A checkbox `- [ ] Rejected — keep` alternative

**No `rm` command runs against any file without a ticked `- [x] Approved` line.** The refactor plan MUST reference the DELETIONS.md line number in its commit message: `chore(cleanup): remove unused X (DELETIONS.md #42 approved)`.

### Why NOT `ts-prune`

`ts-prune` is TypeScript-only. This codebase is JS/JSX per CONTEXT.md ("no TypeScript migration"). Do not install it. Any references to `ts-prune` in general dead-code guides should be ignored for this phase. [VERIFIED: ts-prune npm page and README — tool consumes `tsconfig.json`; no JS-only mode].

### Why NOT "move all dead code to a `deprecated/` folder"

Tempting but wrong. It doubles LOC during the transition, breaks imports silently for anyone who had tooling cached, and produces an untracked midpoint state that the user cannot review in one view. DELETIONS.md is the single source of truth.

## Tool Selection (ranked with false-positive rates)

| Tool | Version | Purpose | False-positive rate (qualitative) | Verdict |
|---|---|---|---|---|
| **Knip** | 6.4.1 [VERIFIED: npm view knip version → 6.4.1, published 2026-04-12] | Unused files, exports, dependencies, binaries | **Medium** for this codebase without config; **Low** with the config above — handles JS/JSX ESM natively and documents `import.meta.glob` / template-string false positives [CITED: https://knip.dev/guides/handling-issues] | **PRIMARY** |
| **depcheck** | 1.4.7 [VERIFIED: npm view] | Unused npm dependencies only | **Medium** — flags side-effect-only imports like `howler` that have no import usage but are preloaded | **SECONDARY** — use with ignore list cross-checked against vite.config.js `manualChunks` |
| **madge** | 8.0.0 [VERIFIED: npm view] | Circular dependency detection | **Very low** — true/false reports | **USE** — `npx madge --circular --extensions js,jsx src/` |
| **dependency-cruiser** | 17.3.10 [VERIFIED: npm view] | Module graph visualization + custom rules | **Low** for graphing; ruleset depends on config | **USE for graph only** — `npx depcruise --output-type dot src/ \| dot -Tsvg > dependency-graph.svg` |
| **rollup-plugin-visualizer** | already installed (package.json line 61) | Bundle composition treemap | N/A (analysis, not detection) | **USE** — `ANALYZE=true npm run build` already wired |
| **vitest coverage-v8** | already installed (package.json line 51) | Per-file coverage % | N/A | **USE** — `npm run test:coverage` already wired, emits `coverage/coverage-summary.json` |
| ts-prune | — | unused exports (TS-only) | Irrelevant | **DO NOT USE** — wrong language |
| ast-grep | 0.42.1 | AST-level structural search | User-defined | **OPTIONAL** — useful for finding duplicate-logic patterns if Claude identifies a repeating AST shape, but not primary |
| unimported | — | older alternative to Knip | Higher on ESM projects | **DO NOT USE** — Knip superseded it |

**Installation (Plan 01 wave 0):**
```bash
npm install --save-dev knip@^6.4.1 depcheck@^1.4.7 madge@^8.0.0 dependency-cruiser@^17.3.10
```
All four are devDependencies, zero runtime footprint, removable in the final cleanup commit if desired (but keeping them enables future audits for cheap).

**Version verification:** All versions verified via `npm view <pkg> version` on 2026-04-17. Knip's release date (2026-04-12) is within 5 days of this research — very fresh.

## Audit Structure (how AUDIT.md should be organised)

The user has to be able to read the top of `AUDIT.md` and know what to do next. The structure below is optimised for **scan-ability** and **sign-off workflow**.

```markdown
# Phase 98 Audit — Gogo Arabic Codebase (v16.0 baseline)

**Generated:** <date>
**Scope:** src/, server/, scripts/, public/assets/manifests/, .planning/phases/
**Baseline:** <commit SHA at start of Phase 98>
**Total files audited:** <N> JS/JSX, <M> JSON, <K> MD
**Total LOC (pre-audit):** <N>

## Executive Summary (≤ 20 lines)
- <top 5 findings by priority>
- <what to sign off first>
- <out-of-scope acknowledgments>

## How To Use This Document (user-facing instructions)
1. Read the Executive Summary
2. Review Section 1 (Critical — blocking bugs)
3. Tick or reject each row in 98-DELETIONS.md (separate file)
4. Tell Claude "proceed with approved deletions"

## 1. Critical (must fix before any refactor proceeds)
Table: | Finding | File(s) | Severity | Fix effort | Recommendation |

## 2. High Priority — Consolidations (behaviour-preserving)
Table: | Duplicate logic | Locations | Proposed consolidation | Risk |

## 3. Medium Priority — Architectural Drift
Table: | Pattern | Violation sites | Canonical pattern | Refactor plan ref |

## 4. Low Priority — Cosmetic / Comment Rot
Table: | Type | File | Line | Proposed edit |

## 5. Dead Code Candidates — REQUIRES SIGN-OFF
→ See 98-DELETIONS.md for the full list (separate file for independent review)
Summary stats only here: N files, M exports, K npm deps flagged.

## 6. Test Coverage Heatmap
Per-directory table from vitest coverage-v8 JSON summary. Flag any system below 50% as "cannot-refactor-until-covered".

## 7. Dependency Graph — Module Relationships
Link to ./dependency-graph.svg
Narrative: circular imports found (N), god modules (list), leaf-only modules (list).

## 8. Pre-Existing Phase Stubs (86-96) Disposition
Per-phase row: stub title | shipped equivalent | keep / archive / delete recommendation | user decision (checkbox).

## 9. Planning-Doc Drift (`.planning/`)
Table: | Doc | Claim | Reality | Proposed edit |

## 10. Open Questions for User
Numbered list. Answers feed the refactor plans.

## Appendix A — Tool Output Artifacts
- knip.txt
- depcheck.txt
- madge-circular.txt
- dependency-graph.svg
- coverage-summary.json
- bundle-report.html (from ANALYZE=true build)
```

**Ordering rationale:**
- "Critical" first because if there's a real bug, the user needs to see it before the deletion sign-off work.
- "Dead code" references DELETIONS.md rather than inlining, so the user can review sign-off decisions in a smaller, narrower document without getting lost in 3000 lines.
- "Pre-existing stubs" and "planning drift" get their own sections because they require user decisions that aren't about code at all.

**Anti-pattern to avoid:** Do NOT mix categories. "Dead code + architectural drift + duplicate logic" in one table is unreadable. Each category is a separate section with its own table.

## Refactor Patterns (which patterns apply per system type)

The system types in this codebase and the safest refactor pattern for each:

| System type | Example modules | Safest refactor pattern | Why |
|---|---|---|---|
| **Pure utility function** | `src/utils/shuffle.js`, `arabicUtils.js`, `frechetDistance.js` | **Characterization tests + direct edit** — write tests that pin current output on representative inputs, then refactor | No React/Phaser coupling; easiest to test; lowest risk |
| **Redux slice** | `src/store/slices/*.js` | **Selectors-only edit; never touch reducers** unless a bug fix. Extract duplicate selector logic to shared helpers. | Reducers are the persistence contract; changing them can break redux-persist migration |
| **Redux middleware** | `src/store/middleware/*.js` | **Test-first extraction** — add middleware unit test, then extract cross-cutting helpers | Middleware order in `store.js` is load-bearing; any change must prove order-preservation |
| **React component (presentational)** | `src/components/**/*.jsx` that take props and render | **React Testing Library characterization snapshot** → refactor | Snapshot tests catch rendering drift cheaply |
| **React component (stateful / hooks-heavy)** | `GameLayout.jsx`, `HUD.jsx`, `DialogueOverlay.jsx` | **Extract hooks first** (which are pure functions), write hook tests, then simplify the component | Hook extraction is the least-risky path to a smaller component; already the established pattern (20 hooks in `src/hooks/`) |
| **Phaser scene** | `src/game/scenes/*.js` (`WorldScene.js`, `BattleScene.js`, `BootScene.js`) | **DO NOT TOUCH** in this phase unless the audit surfaces an outright bug. | Phase 97 is rebuilding the visual layer; Phase 98 must not race with 97's contract. Ralph's CLAUDE.md also prohibits visual/world layer edits. |
| **Phaser system (non-scene)** | `src/game/systems/*.js` (~45 files) | **Extract pure helpers; test helpers; leave lifecycle intact** | Scene wiring is fragile; helper extraction is safe |
| **Service / async logic** | `src/services/*.js` (~40 files) | **Mock-based unit tests + refactor** | Services are the easiest boundary to mock; tests ship with the refactor |
| **Data file** | `src/data/*.{js,json}` | **NEVER MODIFY CONTENT.** Can normalize field ordering, fix JSON formatting, add schema validation — nothing else. | CONTEXT.md: "any Arabic language data files (JSON content is sacred)". |
| **Ink dialogue** | `src/data/ink/*.ink`, compiled `.ink.json` | **NEVER MODIFY.** Out of scope per CONTEXT.md. | CONTEXT.md: "ink dialogue engine" not touched. |
| **Server controller** | `server/src/controllers/*.js` | **Contract-test then refactor** — write supertest against endpoint, refactor internals | Public API surface is preserved (CONTEXT.md); test is the contract |
| **Ralph agent scripts** | `scripts/ralph/*.{js,sh,json}` | **Review only, do not modify in Phase 98** unless user explicitly approves individual changes | Active autonomous pipeline; changes here are live-production risk |

### Cross-cutting anti-patterns

- **Big-bang rewrites** — forbidden by CONTEXT.md ("atomic, reversible, one-commit-one-revert").
- **Strangler-fig pattern** (running old + new in parallel) — not suitable for a 210K LOC refactor; the overhead of maintaining two paths exceeds the benefit. Use direct replacement with characterization tests instead.
- **Renaming public contracts** (Redux action types, API endpoints) — forbidden by CONTEXT.md.
- **Multi-system sweeps** — forbidden; split into atomic commits.

### Commit-size guideline

Each refactor commit should satisfy ALL of:
- Touches ≤ 10 files
- Adds or updates tests in the same commit
- `npm run test:run && npm run lint && npm run build` passes
- Has a one-line rationale in the commit body referencing the AUDIT.md section

If a refactor needs more than 10 files, split it. The LOC target (10% reduction) is a phase-total, not a per-commit.

## Test Coverage Measurement (using existing vitest coverage-v8)

The vitest config already emits a machine-readable coverage summary:

```js
// vitest.config.js (existing)
coverage: {
  provider: 'v8',
  reporter: ['text', 'html', 'json-summary'],  // ← json-summary is the key
  include: ['src/**/*.{js,jsx}'],
  exclude: ['src/test/**', 'src/data/**'],
  thresholds: { statements: 24, branches: 73, functions: 39, lines: 24 },
}
```

**Approach:**

1. Plan 01 runs `npm run test:coverage` once, producing `coverage/coverage-summary.json`.
2. Claude reads the JSON summary and aggregates per-directory coverage into a heatmap table in AUDIT.md section 6. Format:

    | Directory | Files | Statements % | Branches % | Functions % | Lines % | Refactor-safe? |
    |---|---|---|---|---|---|---|
    | `src/components/Battle/` | 14 | 18% | 42% | 21% | 19% | ❌ Wave-0 tests required |
    | `src/store/slices/` | 60 | 71% | 88% | 77% | 70% | ✅ |
    | `src/game/systems/` | 45 | 12% | 30% | 15% | 12% | ❌ Wave-0 tests required |

3. **Threshold for "refactor-safe":** ≥ 50% statements AND ≥ 50% branches for the specific directory. Below that, a Wave-0 task adds tests before any refactor touches the directory.

4. **Ratchet the thresholds at phase end.** After Phase 98 lands, the global thresholds in `vitest.config.js` go up (e.g., statements 24 → 30). This locks in the gain and prevents future regressions. [CITED: vitest docs — threshold field is enforced on `test:coverage`].

**What this measurement does NOT do:**
- Does not count integration coverage from Playwright E2E tests (those live in `e2e/` and are not instrumented).
- Does not include server coverage (server tests live in `server/test/`; separate vitest config).
- Does not detect semantic correctness — only branch/line coverage.

**What to flag as "coverage gap blocking refactor":**
- Any directory with statements < 50% that the audit wants to touch.
- Any single file > 300 LOC with 0 tests.
- Any middleware with no test (middleware is the highest-ROI test target — one test catches cross-cutting bugs).

## Feature Preservation Smoke Test (list of golden-path checks)

Phase 98 MUST NOT regress any user-visible feature. The smoke-test list below is the concrete verification artifact. Automated-first, manual-second.

### Automated smoke tests (Playwright — new file `e2e/phase98-smoke.spec.js`)

The e2e/ directory already has Playwright configured. Plan 01 adds a single smoke file covering the golden paths, runnable via `npx playwright test e2e/phase98-smoke.spec.js`.

Golden paths — one assertion per bullet:

1. **Boot** — App loads without console errors; loading screen renders; main menu shows.
2. **New player onboarding** — Click "New Game", tutorial overlay appears, first step visible.
3. **Zone travel** — World map opens; click zone; zone transition completes; Phaser scene renders.
4. **NPC interaction** — Approach NPC; press E/Space; dialogue overlay opens; dialogue text renders (Arabic + English).
5. **Quest flow** — Accept quest from Dialogue; quest journal shows new quest; complete first objective; reward dispatched.
6. **FSRS review** — Open review from HUD; 3 words presented; submit answer; card scheduled for next interval.
7. **Quiz** — Launch any quiz type; answer 3 questions; quiz completion screen shows score.
8. **Grammar lesson** — Open grammar section; select A1 lesson; complete one exercise; XP awarded.
9. **Battle** — Trigger boss from world; battle scene loads; cast one spell; victory screen shows.
10. **Equipment** — Open inventory; equip an item; stat change reflected.
11. **Companion** — Open companion roster; view companion; dialogue option available.
12. **Shop + haggling** — Open zone shop; attempt purchase; Arabic numeral haggling prompt appears.
13. **Crafting** — Open crafting panel; select recipe; craft; result in inventory.
14. **Save & reload** — Trigger autosave; reload page; state preserved (XP, level, zone, FSRS cards, inventory).
15. **Settings** — Open settings; toggle BGM; close; setting persists.

### Manual smoke checklist (for each refactor commit that touches a critical system)

Stored in AUDIT.md section 5, per refactor task: a "Manual verification" subsection with 3-5 checkboxes for the specific system being changed.

### Feature inventory quantities (from PROJECT.md — for "feature preservation" verification gate)

| Feature | Count | Verification source |
|---|---|---|
| Zones | 8 | Manual walkthrough in smoke test #3 |
| NPCs | 140 | Spot-check 5 NPCs per zone (smoke #4) |
| Quests | 52 | Quest journal shows ≥ 52 known quests (smoke #5) |
| Equipment items | 64 | Inventory JSON invariant test |
| Spells | 50 | Magic data file invariant test |
| Companions | 12 | Companion roster count (smoke #11) |
| Vocabulary words | 1,220 (active) — 5,029 total | `npm run vocab:validate` passes |
| Alphabet letters | 28 | Alphabet data file invariant |
| Achievements | 263 | Achievement panel count |
| Grammar lessons | 50 | Grammar section count |
| Quiz types | 18 | `QUIZ_TYPE_REGISTRY` length |
| Tests | ≥ 2535 | `vitest run` count |

Each row maps to a one-line test assertion. Plan 01 creates `src/test/phase98-invariants.test.js` asserting these counts. Any refactor that decreases a count fails this test.

## Sign-Off Mechanism — DELETIONS.md structure

**Separate file** from AUDIT.md, at `.planning/phases/98-codebase-audit-and-refactor/98-DELETIONS.md`. Rationale: the user asked for independent review of deletion decisions, and a standalone file is diff-able, bookmarkable, and small enough to read in one session.

### File structure

```markdown
# Phase 98 — Deletion Approval Ledger

**Generated:** <date>
**Format:** Tick the checkbox next to each row you approve. Rejected rows stay unticked; Claude will skip them.

## How to review
1. Skim all rows in Section 1 (files proposed for full deletion).
2. For each row: read the "Why Claude thinks it's dead" column. Read the "Risk if wrong" column.
3. Tick `- [x] Approved` or `- [x] Rejected — keep` for each row. One must be ticked. Untouched rows default to rejection.
4. Save the file. Tell Claude: "DELETIONS.md reviewed, proceed."

## Section 1 — Full file deletion candidates

### Row 1
- **File:** `src/utils/legacyRandom.js`
- **LOC:** 47
- **Last modified:** 2026-02-10 (v4.0 era)
- **Why Claude thinks it's dead:** Knip flags zero imports; manual grep across src/, server/, scripts/ finds zero references; no EventBus name match; no manifest entry.
- **Risk if wrong:** Low — if a test suddenly fails, `git revert` restores in 10 seconds.
- **1M-context reasoning:** Function `biasedShuffle` is present but every call site migrated to `src/utils/shuffle.js::fisherYates` in Phase 11 (v3.0 cleanup).
- [ ] Approved — delete
- [ ] Rejected — keep

### Row 2
… etc.

## Section 2 — Unused export removal (file stays, export removed)

### Row N
- **File:** `src/utils/arabicUtils.js`
- **Export:** `deprecatedTransliterate`
- **Why:** Knip flag + zero grep hits.
- **Risk:** Very low — tree-shaken anyway.
- [ ] Approved — remove export
- [ ] Rejected — keep export

## Section 3 — npm dependency removal

### Row M
- **Package:** `unused-package-foo`
- **Why:** depcheck flag + zero import across src/ + server/ + scripts/.
- **Risk:** Low — dev-time only.
- [ ] Approved — remove from package.json
- [ ] Rejected — keep

## Section 4 — Phase-stub disposition (phases 86-96)
Individual rows for each phase — see "Pre-existing Stubs Disposition" section below.

## Audit trail
Once all rows are processed, Claude appends to this file:

### Execution log
- 2026-04-XX: Rows 1, 3, 7, 9 approved. Executed in commit <SHA>.
- 2026-04-XX: Rows 2, 4, 5 rejected — kept.
- 2026-04-XX: Rows 6, 8 deferred — user requested further discussion.
```

### Automation guardrail

Every refactor commit that deletes a file MUST include in the commit body:

```
DELETIONS.md row: <N>
User approval: <YYYY-MM-DD>
```

A pre-commit hook (optional, Plan 02) grep-checks the diff for any `delete mode` line and rejects the commit if the corresponding DELETIONS.md row isn't ticked. Stretch goal — not required for Phase 98, but a good invariant to add if cheap.

## Pre-existing Stubs Disposition — handling phases 86-96 without fabricating intent

These 11 phase directories exist with one `*-01-PLAN.md` stub each. None are assigned to a milestone. None are in any REQUIREMENTS.md section. The stubs may represent: (a) real planned work not yet milestone-assigned, (b) work superseded by Phase 76-85 shipments, or (c) noise carried over from early planning experiments.

**Research finding:** From sampling `86-01-PLAN.md` (Ramadan & Eid events), the stubs appear to be fully-detailed implementation plans with files, decisions, and design notes — NOT placeholders. That means they represent planning effort that should not be discarded without evaluation.

### Disposition procedure

For each phase 86-96, Claude completes the following template in `AUDIT.md` section 8:

```markdown
### Phase 86 — Ramadan & Eid Seasonal Events
- **Stub file:** `.planning/phases/86-ramadan-eid-events/86-01-PLAN.md`
- **Stub summary (from plan):** <2-3 sentences from plan>
- **Overlap check against shipped work:**
  - v14.0 shipped? No — v14.0 covers narrative, social, audio (NAR-01 to NAR-04, AUD-01, AUD-02) — no seasonal calendar events overlap
  - seasonalEventSlice exists in src/store/slices/ → STUB ALREADY IMPLEMENTED or PARTIAL?
  - <additional evidence>
- **Recommended disposition:** <one of: keep / archive / delete>
  - **keep** → propose milestone assignment (e.g., "assign to v19.0 Cultural Events")
  - **archive** → move to `.planning/archive/phases-86-96/` with reason
  - **delete** → only if superseded AND user approves in DELETIONS.md row
- **Reasoning:** <why this disposition>
- **User decision:** `[ ] keep  [ ] archive  [ ] delete`
```

**CRITICAL — no fabrication:**
- Do NOT infer intent. If the stub references a feature and the feature ships, call it "overlap — user decides."
- Do NOT propose deletion based on age alone.
- Do NOT propose deletion based on "feels obsolete."
- ONLY delete if there's clear git-history evidence the work shipped under a different phase number OR the user approves based on their own recollection.

**Observation from codebase evidence:** `src/store/slices/seasonalEventSlice.js` exists. That means phase 86 MAY have been partially implemented and never flagged as shipped in ROADMAP.md. The audit must investigate this specifically and present the evidence to the user. This is exactly the "planning-doc drift" scenario CONTEXT.md mentions.

### Output of this analysis

A separate table in AUDIT.md section 8 listing all 11 phases with:
| Phase | Has implementation evidence? | Overlap with shipped? | Recommendation | User decision |

Plan 01 outputs this table; the user ticks the decision column before any archive/delete action.

## Ralph Pipeline Safety — how to audit autonomous agent code safely

Ralph is an active autonomous agent that reads `scripts/ralph/prd.json`, picks an unfinished user story, implements it, commits, and loops. It runs against the same codebase Phase 98 is auditing. There are three specific risks:

### Risk 1 — Auditing Ralph DURING a Ralph run

If Ralph is running on main while Phase 98 is in progress, commits can cross-collide. Ralph doesn't know about DELETIONS.md.

**Mitigation:**
- Plan 01 wave 0: **pause Ralph before audit starts**. Rename `scripts/ralph/prd.json` → `scripts/ralph/prd.json.paused-phase98` so the orchestrator can't find it. Restore at end of phase.
- Document in AUDIT.md: "Ralph pipeline paused from <date> to <date> during Phase 98."

### Risk 2 — Deleting files Ralph needs

Ralph reads `prd-*.json` files by filename. Some may look unused from a static analysis perspective but are Ralph's runtime input.

**Mitigation:**
- `scripts/ralph/*.json` is listed in `knip.json` as an entry point (see Safety Rail above).
- Ralph's `CLAUDE.md` lists "DO NOT TOUCH the loading screen" — extend Phase 98's guardrails: `scripts/ralph/` is READ-ONLY during audit phase. Every file in `scripts/ralph/` is pre-flagged as "do not delete" in DELETIONS.md section 0 (unapprovable).

### Risk 3 — Changing Ralph's prompt structure

`scripts/ralph/CLAUDE.md` defines Ralph's working contract. Changes there affect every future Ralph iteration.

**Mitigation:**
- Plan 01 diffs `scripts/ralph/CLAUDE.md` against repo history; any pending edits are staged in AUDIT.md for user review only — no commit.
- Do NOT consolidate duplicated instructions between Ralph's CLAUDE.md and the root-level directives.

### Audit approach for Ralph code specifically

Read-only pass for Plan 01:
1. Read every file in `scripts/ralph/` into 1M context.
2. Document in AUDIT.md section 11 any:
   - Duplicate prd-*.json files (archive candidates)
   - Broken references in prd.json (dead branchName, missing files)
   - Inconsistent progress.txt entries
3. Propose fixes but DO NOT apply without user approval.
4. Never modify `ralph.sh` or `ralph-grow.sh` in Phase 98 without a user-signed refactor task.

### `scripts/ralph/progress.txt` reading guidance

The user's process is: read the "Codebase Patterns" section at the top of `progress.txt` before starting. Any pattern there is an authoritative hint about what Ralph has discovered. Phase 98 should read it and USE it (it may contain "don't touch X" notes that predate CONTEXT.md).

## Validation Architecture (Nyquist contract for this phase)

Per `.planning/config.json` convention, Nyquist validation is presumed enabled. Phase 98 is unusual because it's a refactor — the validation story is about **regression detection**, not new-feature verification.

### Test Framework

| Property | Value |
|---|---|
| Framework | vitest 3.0 (already installed, see `vitest.config.js`) |
| Config file | `vitest.config.js` (root) |
| Quick run command | `npm run test:run` |
| Full suite command | `npm run test:run && npm run test:e2e` |
| Coverage command | `npm run test:coverage` |
| Coverage summary JSON | `coverage/coverage-summary.json` |
| Lint command | `npm run lint` |
| Build command | `npm run build` |
| Vocab validation | `npm run vocab:validate` |
| Ink compile | `npm run ink:compile` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|---|---|---|---|---|
| HEALTH-01 | AUDIT.md exists before any refactor commits | File-existence assertion | `test -f .planning/phases/98-.../98-AUDIT.md` | ❌ Wave 0 creates it |
| HEALTH-02 | Every deletion has a ticked DELETIONS.md row | Manual check + pre-commit hook | grep of commit body vs DELETIONS.md | ❌ Wave 0 optional hook |
| HEALTH-03 | Zero silent deletions (git invariant) | Git log grep for `delete mode` without DELETIONS reference | bash one-liner | ❌ Wave 0 |
| HEALTH-04 | Test coverage ≥ baseline per refactored directory | Coverage ratchet in vitest config | `npm run test:coverage` | ✅ wired |
| HEALTH-05 | All 2535 tests pass | `vitest run` exit 0 | `npm run test:run` | ✅ |
| HEALTH-06 | Feature smoke tests pass | Playwright spec | `npx playwright test e2e/phase98-smoke.spec.js` | ❌ Wave 0 creates file |
| HEALTH-07 | Test count invariant ≥ 2535 | grep `Tests ` line from vitest output | custom script | ❌ Wave 0 |
| HEALTH-08 | Dependency graph SVG artifact present | File-existence assertion | `test -f .planning/phases/98-.../dependency-graph.svg` | ❌ Wave 0 |
| HEALTH-09 | Phases 86-96 each have disposition | AUDIT.md section 8 row count = 11 | grep count | ❌ Wave 0 |
| HEALTH-10 | Ralph pipeline untouched OR each change has user sign-off | git diff scripts/ralph | manual | ❌ Wave 0 |
| HEALTH-11 | Every refactor commit is atomic | git log — one commit per AUDIT section reference | manual | — |
| HEALTH-12 | Bundle size ≤ baseline | `du -sb dist/ \| awk '{print $1}'` compared to baseline file | shell script | ❌ Wave 0 baseline |
| HEALTH-13 | Test runtime within 20% of baseline | time `vitest run` compared to baseline | shell script | ❌ Wave 0 baseline |
| HEALTH-14 | LOC reduced ≥ 10% without feature loss | `find src -name '*.js' -o -name '*.jsx' \| xargs wc -l` | shell script | ❌ Wave 0 baseline |

### Sampling Rate

- **Per task commit:** `npm run test:run && npm run lint` — must be green.
- **Per refactor that touches a system:** the invariant test for that system's feature count (e.g., if a companion refactor, companion count = 12).
- **Per wave merge:** full `npm run test:run && npm run test:coverage && npm run build`.
- **Phase gate:** All three invariants (test count ≥ 2535, bundle size ≤ baseline, test runtime within 20%) + `e2e/phase98-smoke.spec.js` green.

### Wave 0 Gaps — new artifacts Plan 01 must create

- [ ] `.planning/phases/98-codebase-audit-and-refactor/98-AUDIT.md` — generated from 1M-context pass
- [ ] `.planning/phases/98-codebase-audit-and-refactor/98-DELETIONS.md` — approval ledger
- [ ] `.planning/phases/98-codebase-audit-and-refactor/dependency-graph.svg` — depcruise output
- [ ] `.planning/phases/98-codebase-audit-and-refactor/phase98-baseline.json` — numeric baselines (LOC, test count, bundle size, test runtime, coverage by directory)
- [ ] `knip.json` at repo root (with entry-point config from Safety Rail section)
- [ ] `e2e/phase98-smoke.spec.js` — 15 golden-path smoke tests
- [ ] `src/test/phase98-invariants.test.js` — feature count invariants (zones, NPCs, quests, ...)
- [ ] devDependencies added: knip, depcheck, madge, dependency-cruiser

### Regression Detection Artifacts

The three numeric invariants are the key novel idea for a refactor phase:

1. **Test-count invariant** — `phase98-baseline.json` records `{"tests": 2535}`. Every commit runs `vitest run --reporter=json`, parses test count, asserts `>= 2535`. Anything less fails the commit.
2. **Bundle-size invariant** — `phase98-baseline.json` records pre-phase `dist/` size (after `npm run build`). Every commit touching build-relevant code runs `npm run build` and asserts new size ≤ baseline.
3. **Test-runtime invariant** — `phase98-baseline.json` records pre-phase `npm run test:run` wall time. 20% regression window is tolerated; beyond that, the commit is flagged for review (not auto-failed).

These three invariants together form the "this refactor didn't secretly break things" safety net.

## Pitfalls (common refactor-gone-wrong patterns specific to this stack)

### Pitfall 1: Removing a Redux slice that's referenced only via `redux-persist` migration

**What goes wrong:** Slice file looks unreferenced because all component code migrated away, but `redux-persist` migration function v7 reads it to convert old saves.
**Why it happens:** `migrations.js` keys are strings; no static import to the slice from the migration.
**How to avoid:** Plan 01 greps `src/store/migrations.js` (and any file named `migrations*.js`) for the slice name before any deletion. Cross-reference with CURRENT_VERSION in `store.js`.
**Warning signs:** User save from 2026-02-10 fails to load after the "unused" slice is removed.

### Pitfall 2: Removing an EventBus constant that's the only wiring between two files

**What goes wrong:** `eventBusTypes.js` has 74 namespaced constants. Removing one because "no emitter" may miss a listener in a lazy-loaded overlay.
**Why it happens:** Listeners register on mount; if the overlay hasn't been opened yet in static analysis, no emit site appears wired.
**How to avoid:** Plan 01 treats `src/utils/eventBusTypes.js` as read-only. Any event constant is only removed after manual grep of `EventBus.on\|EventBus.emit` across the entire tree (both sides).
**Warning signs:** Overlay stops responding to an action that previously worked.

### Pitfall 3: Consolidating "duplicate" algorithms that aren't actually duplicates

**What goes wrong:** Two shuffle implementations look identical but one has a seed parameter for deterministic quiz selection. Merging breaks determinism.
**Why it happens:** Semantic intent differs; syntactic similarity misleads.
**How to avoid:** Before any consolidation, Claude writes both implementations' characterization tests in parallel. If any test diverges, they stay separate. Name the consolidation safely (e.g., `shuffleDeterministic` vs `shuffleRandom`) rather than forcing one.
**Warning signs:** Daily challenge word-of-the-day stops being deterministic.

### Pitfall 4: Refactoring a middleware and changing its position in the chain

**What goes wrong:** Middleware order in `store.js` matters. `achievementMiddleware` must run AFTER the slice reducer that produces the triggering action — otherwise the achievement fires on an un-committed state.
**Why it happens:** Middleware array looks reorderable; it is not.
**How to avoid:** CONTEXT.md-locked rule — no middleware reordering in Phase 98. Only allowed edit is internal refactor of a single middleware's code; never its position.
**Warning signs:** Achievement toast fires at the wrong moment or not at all.

### Pitfall 5: Removing a Phaser texture key that's referenced only via a data table

**What goes wrong:** `BootScene` preloads key `'sprite_fox_idle'`. The only code that uses that string is a zone data file under `src/world/ZoneRegistry.js`. A static analyzer sees the string in BootScene as unused.
**Why it happens:** String-based decoupling is opaque to static tools.
**How to avoid:** `src/data/**/*.json` and `src/world/**/*.js` are knip entry points. Any BootScene preload is only removed after grepping ALL data files for the exact string.
**Warning signs:** Missing sprite in one zone only, on first entry.

### Pitfall 6: Breaking redux-persist key whitelist silently

**What goes wrong:** `store.js` has a whitelist of slices to persist. Renaming or merging a slice without updating the whitelist means the slice no longer persists. Player progress loss on next reload.
**Why it happens:** Whitelist arrays look passive; no code-path failure when they mismatch.
**How to avoid:** Any slice touch in Phase 98 requires a test that: dispatches an action → saves → reloads → asserts state preservation. `fake-indexeddb` 6.2.5 is already installed for this.
**Warning signs:** User reports "my progress reset."

### Pitfall 7: Modifying ink dialogue output by accident

**What goes wrong:** A refactor normalizes JSON formatting and accidentally reformats `src/data/ink/*.ink.json` files, which are machine-generated. Next `npm run ink:compile` either overwrites the change (good) or errors out (bad).
**Why it happens:** Blanket Prettier formatting.
**How to avoid:** `.prettierignore` (or equivalent) lists `src/data/ink/*.ink.json`. Plan 01 confirms this file exists before any format-everything commit.
**Warning signs:** ink compile errors on clean build.

### Pitfall 8: Treating test files as dead code

**What goes wrong:** A test file that tests a deprecated feature LOOKS unreferenced but is the only regression guard.
**Why it happens:** Tests import the source-under-test; nothing imports tests.
**How to avoid:** `knip.json` treats `**/*.test.{js,jsx}` and `**/__tests__/**` as entry points. Plan 01 explicitly verifies this before running knip.
**Warning signs:** `vitest run` finds fewer tests than before.

### Pitfall 9: Deleting an "unused" vite.config manualChunks branch

**What goes wrong:** A branch in `vite.config.js`'s `manualChunks` looks like it matches nothing if the referenced data file was moved. Removing the branch causes the file to land in `misc-vendor`, breaking lazy-loading and ballooning the initial bundle.
**Why it happens:** vite.config is config code — dead branches aren't a static analyzer concern.
**How to avoid:** Before any vite.config edit, run `ANALYZE=true npm run build` and compare `dist/bundle-report.html` before/after.
**Warning signs:** Initial page load jumps from 402KB to >1MB.

### Pitfall 10: Racing Phase 97

**What goes wrong:** Phase 97 rebuilds the visual layer (world, BootScene, tilemaps). Phase 98 refactor sweeps may edit files Phase 97 is simultaneously rebuilding.
**Why it happens:** CONTEXT.md says Phase 98 depends on Phase 97 complete; if Phase 97 is not actually merged, conflicts arise.
**How to avoid:** Plan 01 wave 0 hard-verifies Phase 97 merged to main. If not, Phase 98 blocks. Never attempt Phase 98 on a branch that's behind Phase 97.
**Warning signs:** Merge conflicts in `src/game/scenes/`, `src/world/`.

## Runtime State Inventory

(Included because Phase 98 involves code removal, which is a form of rename/refactor with runtime consequences.)

| Category | Items Found | Action Required |
|---|---|---|
| Stored data | IndexedDB slices (5 hybrid persist: player, vocabulary, grammar, battle, inventory). localStorage has daily goals, streak, onboarding. Save file format version currently v12+. | None from audit alone. If a slice is deleted, add a redux-persist migration to drop its persisted key. User data preservation is non-negotiable. |
| Live service config | None — this is a client-side game. No external service names to update. Ralph's `prd.json` contains branch names and story IDs that are runtime state for the autonomous agent — DO NOT modify without Ralph pause. | Pause Ralph (rename prd.json) before audit; restore at end. |
| OS-registered state | None — game runs in browser. No systemd/launchd/scheduled tasks. | None. |
| Secrets / env vars | Server uses `process.env.JWT_SECRET`, `MONGODB_URI`, etc. (observed in server/src/). Client has no secrets. | None — env vars are referenced by string name in server code; audit must not rename or remove. |
| Build artifacts | `dist/` regenerated per build; `coverage/` regenerated per test run; `node_modules/` not tracked. The compiled `src/data/ink/*.ink.json` files ARE tracked and are regenerated by `npm run ink:compile` from `.ink` source. | After any ink refactor, regenerate `*.ink.json` via `npm run ink:compile` and commit. Do not leave drift. |

**Canonical question answered:** After every file in the repo is updated, what runtime systems still have the old string cached?
- **IndexedDB saves on user browsers** — cannot update these remotely. The redux-persist migration chain handles old-save compat. Phase 98 MUST add a migration bump for any slice deletion or rename.
- **LocalStorage on user browsers** — same concern as IndexedDB. `src/store/migrations.js` is the single source of truth for shape changes.
- **Ralph's `prd.json`** — local file; updating is part of the Ralph pause/resume.

## Code Examples

### Example 1: Knip invocation — the exact command Plan 01 will run

```bash
# After installing knip and writing knip.json (see Safety Rail section)
npx knip --reporter text > .planning/phases/98-codebase-audit-and-refactor/knip.txt
npx knip --reporter json > .planning/phases/98-codebase-audit-and-refactor/knip.json

# Then Claude reads knip.json into 1M context and applies Layer-2 filter
```
[CITED: https://knip.dev/reference/cli — knip supports `--reporter text|json|markdown|etc`]

### Example 2: dependency graph generation

```bash
# Install Graphviz via brew if not present (macOS)
# brew install graphviz

npx depcruise --output-type dot src/ | dot -Tsvg > .planning/phases/98-codebase-audit-and-refactor/dependency-graph.svg
```
[VERIFIED: dependency-cruiser 17.3.10 CLI docs — `--output-type dot` produces Graphviz DOT output; `dot` converts to SVG]

### Example 3: Circular dependency check

```bash
npx madge --circular --extensions js,jsx src/ | tee .planning/phases/98-codebase-audit-and-refactor/madge-circular.txt
```
[VERIFIED: madge 8.0.0 README]

### Example 4: Coverage heatmap source

```bash
npm run test:coverage
# emits coverage/coverage-summary.json
# Claude reads this and produces the heatmap table in AUDIT.md section 6
```

### Example 5: Baseline capture (Plan 01 wave 0)

```bash
# Capture baselines BEFORE any modification
{
  echo '{'
  echo '  "commit": "'$(git rev-parse HEAD)'",'
  echo '  "generatedAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",'
  echo '  "loc": '$(find src server scripts -type f \( -name '*.js' -o -name '*.jsx' \) ! -name '*.test.*' ! -name '*.spec.*' | xargs wc -l | tail -1 | awk '{print $1}')','
  echo '  "testCount": 2535,'
  echo '  "bundleBytes": '$(du -sb dist 2>/dev/null | awk '{print $1}' || echo 'null')','
  echo '  "testRuntimeSeconds": null'
  echo '}'
} > .planning/phases/98-codebase-audit-and-refactor/phase98-baseline.json
```

### Example 6: Commit message template for a deletion

```
chore(cleanup): remove unused legacyRandom helper

Deletes src/utils/legacyRandom.js — superseded by fisherYates in Phase 11.

Evidence:
- Knip flagged (unused file)
- Zero grep hits in src/, server/, scripts/
- No EventBus constant reference
- No manifest entry
- No redux-persist migration reference

DELETIONS.md row: 4
User approval: 2026-04-XX

Refs: HEALTH-02, HEALTH-03
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact for Phase 98 |
|---|---|---|---|
| Manual code review + grep | Knip + vitest coverage + dependency-cruiser | 2023-2025 ecosystem shift | Use current tooling; don't try to replicate Knip by hand |
| ts-prune (TS-only) | Knip (TS + JS + JSX + package.json + binaries) | Knip 1.0 2022, mature 2024-2026 | ts-prune is not applicable here |
| unimported | Knip | Knip subsumed it | Use Knip |
| Big-bang refactors | Atomic commits + characterization tests | Industry standard since ~2010 (Feathers, Fowler) | CONTEXT.md already aligned |
| Manual dependency graphs | dependency-cruiser / madge / rollup-plugin-visualizer | 2019+ | Use dependency-cruiser for artifact |

## Assumptions Log

Every claim in this research that was not directly verified against code or current docs:

| # | Claim | Section | Risk if Wrong |
|---|---|---|---|
| A1 | The seasonalEventSlice.js in store/slices/ implies Phase 86 stub is partially implemented. | Pre-existing Stubs Disposition | Medium — audit must verify git history actually connects the slice to a phase 86 plan vs being independent work. If the slice is orphaned shipped work with no traceable plan, the disposition logic still holds; intent is the only thing at risk. |
| A2 | The bundle-size invariant target is "never grows." A refactor that removes a feature will shrink bundle, so "never grows" is valid — but if refactor accidentally adds a polyfill the invariant catches it. | Validation Architecture | Low — even a false positive here is just a prompt for review, not a blocker. |
| A3 | Test runtime within 20% is a reasonable tolerance window. | Validation Architecture | Low — number was chosen based on developer-intuition. If Phase 98 proves 20% too loose, tighten for Phase 99+. |
| A4 | 10% LOC reduction target is achievable. | Requirements HEALTH-14 | Medium — the number is aspirational. If audit finds less dead code, reducing the target is acceptable. The requirement is measurability, not the 10%. User may want to revise. |
| A5 | 45 middleware is an accurate count based on `ls src/store/middleware/`. | Research context | None — count is mechanical. |
| A6 | Ralph is "active" (currently iterating). It may be paused. | Ralph Pipeline Safety | Low — pausing an already-paused Ralph is a no-op. |
| A7 | `.planning/config.json` has `nyquist_validation` enabled (default). | Validation Architecture | Low — if disabled, the section is informational. Research followed instruction "absent = enabled." |
| A8 | 50% coverage is a reasonable "refactor-safe" threshold. | Test Coverage Measurement | Medium — industry heuristic. User may want 70% for high-risk systems (battle, FSRS). Open question below. |
| A9 | The 15 golden-path Playwright smoke tests are sufficient. | Feature Preservation | Medium — more tests = more confidence but more maintenance. User may want to cut or expand. Open question below. |

## Open Questions (RESOLVED)

1. **What's the LOC reduction target?**
   - What we know: CONTEXT.md's ROADMAP entry says "at least 10% reduction."
   - What's unclear: Is this aspirational or hard? If audit finds only 4% of genuine dead code, do we stop there or force-consolidate to hit 10%?
   - **RESOLVED:** Aspirational, not a hard gate (orchestrator decision 2026-04-17). HEALTH-14 requires measurability and no-feature-loss; it does NOT gate on the 10%. User's "don't delete essential things" concern dominates over the reduction metric.

2. **Should phases 86-96 stubs be deleted if the user has no memory of them?**
   - What we know: They exist; some may correspond to shipped work (e.g., seasonalEventSlice.js suggests 86 is partial).
   - What's unclear: User intent on "I don't remember why this exists" cases.
   - **RESOLVED:** Default is ARCHIVE, not DELETE (orchestrator decision 2026-04-17, matches CONTEXT.md). Moving to `.planning/archive/phases-86-96/` preserves discoverability with zero risk. Delete only if user ticks `[x] delete` in DELETIONS.md Section 4 — and even then, Plan 06 Task 1.5 adds a final pre-destructive confirmation checkpoint.

3. **Should the test-coverage-before-refactor threshold be 50%, 70%, or per-system?**
   - What we know: 50% is common industry heuristic.
   - What's unclear: FSRS, battle, and IndexedDB persistence are higher-risk systems where 70% may be warranted.
   - **RESOLVED:** 50% global, 70% for elevated-risk systems (orchestrator decision 2026-04-17). Elevated-risk list: FSRS algorithm (`src/game/systems/fsrs/`), redux-persist migrations (`src/store/slices/*/migrations/`), battle state machine (`src/game/systems/battle/BattleStateMachine.js`), IndexedDB hybrid persistence (`src/game/systems/IndexedDBAdapter*`).

4. **Does the Playwright smoke-test list need to grow or shrink?**
   - What we know: 15 golden paths proposed above.
   - What's unclear: User's appetite for Playwright test maintenance vs confidence.
   - **RESOLVED:** Ship 15 in Phase 98 (orchestrator decision 2026-04-17). Expansion tracked as a separate future phase concern.

5. **Should Phase 98 produce a DELETIONS-APPROVED.md sign-off file OR use inline sign-off in AUDIT.md?**
   - What we know: CONTEXT.md says this is Claude's discretion.
   - **RESOLVED:** Separate `98-DELETIONS.md` file (orchestrator decision 2026-04-17) — better diff-ability, smaller context for user review, easier to bookmark. Additionally, post-checker revision adds `98-CONSOLIDATIONS.md` (separate sign-off for Plan 04 consolidation rows) — same pattern, different scope.

6. **What happens to the Nyquist sampling frequency during the audit phase?**
   - What we know: Audit is read-only; Nyquist sampling of code changes is a no-op for Plan 01.
   - What's unclear: Whether to still run per-task validation or treat Plan 01 as a single "research" artifact.
   - **RESOLVED:** Plan 01 tasks that produce artifacts (knip.json, baseline.json) run validation (lint clean, no unintended source changes). Analysis tasks skip Nyquist. (Research recommendation preserved.)

7. **Does the existing `AUDIT-REPORT.md` from 2026-02-08 supersede parts of Phase 98, or is it reference-only?**
   - What we know: The document describes 5,500 LOC baseline (now 176K+) and Phase 11-era fixes — most findings are resolved.
   - **RESOLVED:** Treat as historical reference; preserve in place (orchestrator decision 2026-04-17). Phase 98's 98-AUDIT.md is a fresh pass. The old AUDIT-REPORT.md is linked from "Appendix B — Historical Audit Context" in the new 98-AUDIT.md. Do NOT delete or move the old document.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|---|---|---|---|---|
| Node.js | All tooling | Assumed ✓ (project already builds) | (per .nvmrc if present) | — |
| npm | Install | ✓ | — | — |
| knip | Plan 01 dead-code detection | ✗ (not in package.json) | — | Install via `npm i -D knip` |
| depcheck | Plan 01 dep detection | ✗ | — | Install via `npm i -D depcheck` |
| madge | Plan 01 circular check | ✗ | — | Install via `npm i -D madge` |
| dependency-cruiser | Dependency graph | ✗ | — | Install via `npm i -D dependency-cruiser` |
| Graphviz `dot` binary | Rendering SVG from depcruise | Likely ✗ on fresh macOS | — | `brew install graphviz`. If user rejects, fall back to Mermaid textual diagram in markdown. |
| vitest | Tests | ✓ (3.0) | 3.0 | — |
| Playwright | E2E smoke | ✓ (1.58.2) | 1.58.2 | — |
| rollup-plugin-visualizer | Bundle analysis | ✓ | 7.0.1 | — |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** Graphviz (Mermaid alternative).

## Security Domain

Phase 98 is a refactor phase with no new user input, no new endpoints, no new auth, no new crypto. ASVS applicability is minimal — listed for completeness.

| ASVS Category | Applies | Standard Control |
|---|---|---|
| V2 Authentication | No (unchanged) | Existing JWT cookie flow preserved |
| V3 Session Management | No (unchanged) | — |
| V4 Access Control | No (unchanged) | — |
| V5 Input Validation | Partial | If server/src/validation is refactored, existing zod schemas must be preserved |
| V6 Cryptography | No (unchanged) | — |

**Known threat patterns relevant to Phase 98:**

| Pattern | STRIDE | Standard Mitigation |
|---|---|---|
| Accidental removal of security middleware | Elevation | `server/src/middleware/` listed as knip entry point; NEVER flag as unused |
| Weakening of zod validation by refactor | Tampering | Any `server/src/validation/*.js` change requires test that asserts schema rejects invalid input |
| Removing CSRF / rate-limit wiring | Tampering / DoS | `server/src/app.js` middleware chain is read-only in Phase 98 unless explicit plan |

## Project Constraints (from repo files other than CLAUDE.md)

No root `CLAUDE.md` exists at `/Users/theshumba/Documents/GitHub/gogo-arabic/CLAUDE.md`. Project-level instructions live in:
- `.planning/PROJECT.md` — tech stack, out-of-scope, core value
- `scripts/ralph/CLAUDE.md` — Ralph agent contract (autonomous iteration rules)
- `README.md` at repo root (not read in this research — not listed as canonical by CONTEXT.md)

**Extracted directives:**
- Tech stack locked: React 19 + Phaser 3 + Redux Toolkit + Express 5 + MongoDB. No framework changes.
- No TypeScript migration (PROJECT.md).
- No new overlay wiring (user feedback_no_overlay_wiring).
- "World" terminology, not "map"/"UI" (user feedback_world_terminology).
- Quality > speed (user feedback_no_rush_visual extends to all phases).
- Ralph's rules: do not touch loading screen, do not modify visual/world layer files, follow existing patterns, read files first.
- `npm run test:run && npm run lint && npm run build` must all pass before any commit.

## Proposed Requirements

The 14 HEALTH-* IDs introduced in the `<phase_requirements>` section above. Here they are in full form, ready for Plan 01 to register in `.planning/REQUIREMENTS.md` under a new `## v17.0 Requirements — Code Health` section:

```markdown
## v17.0 Requirements — Code Health (Phase 98)

### Audit
- [ ] **HEALTH-01**: `98-AUDIT.md` exists before any refactor commit lands; generated from a single 1M-context pass covering src/, server/, scripts/, public/assets/manifests/, and .planning/phases/
- [ ] **HEALTH-02**: Every deletion candidate appears as a distinct row in `98-DELETIONS.md` with a user approval checkbox; no deletion proceeds without a ticked `- [x] Approved` line
- [ ] **HEALTH-03**: Git history invariant — every `delete mode` line in a Phase 98 commit references a DELETIONS.md row number and date of user approval in the commit body
- [ ] **HEALTH-09**: Each of phases 86-96 has an explicit keep/archive/delete disposition recorded in AUDIT.md section 8, backed by evidence and a user decision checkbox
- [ ] **HEALTH-10**: `scripts/ralph/*` is audited read-only; any proposed change is staged in AUDIT.md for user approval before the commit that applies it

### Testing and Coverage
- [ ] **HEALTH-04**: Test coverage for every refactored system is ≥ the baseline recorded in `phase98-baseline.json` — a commit that reduces directory-level coverage fails the phase gate
- [ ] **HEALTH-05**: All existing tests pass at every commit in the phase — `npm run test:run` exit code 0
- [ ] **HEALTH-06**: `e2e/phase98-smoke.spec.js` 15 golden-path checks all pass before phase is closed
- [ ] **HEALTH-07**: Test-count invariant — `vitest run` reports ≥ 2535 tests at every commit

### Artifacts
- [ ] **HEALTH-08**: `dependency-graph.svg` generated by dependency-cruiser is committed to `.planning/phases/98-.../` before any refactor commit

### Refactor Discipline
- [ ] **HEALTH-11**: Every refactor commit is atomic and independently revertable — touches ≤ 10 files, includes any new tests in the same commit, references a DELETIONS.md row or AUDIT.md section in its body
- [ ] **HEALTH-12**: Bundle-size invariant — production `dist/` byte size at phase end ≤ baseline recorded in `phase98-baseline.json` (never grows as a consequence of refactor)
- [ ] **HEALTH-13**: Test-runtime invariant — `vitest run` wall-clock time within 20% of `phase98-baseline.json` baseline
- [ ] **HEALTH-14**: LOC reduction ≥ target (10%) measurable via `find src server scripts -type f \( -name '*.js' -o -name '*.jsx' \) | xargs wc -l`, AND all feature-preservation smoke tests (HEALTH-06) pass
```

## Sources

### Primary (HIGH confidence)
- Context7 (via `ctx7` CLI) `/websites/knip_dev` — Knip handling-issues guide on dynamic imports and `import.meta.glob` false positives. Fetched 2026-04-17.
- `npm view knip version` → 6.4.1 published 2026-04-12. Verified 2026-04-17.
- `npm view depcheck version` → 1.4.7
- `npm view madge version` → 8.0.0
- `npm view dependency-cruiser version` → 17.3.10
- `/Users/theshumba/Documents/GitHub/gogo-arabic/package.json` — tech stack versions
- `/Users/theshumba/Documents/GitHub/gogo-arabic/vite.config.js` — build + manualChunks
- `/Users/theshumba/Documents/GitHub/gogo-arabic/vitest.config.js` — test thresholds and coverage reporters
- `/Users/theshumba/Documents/GitHub/gogo-arabic/eslint.config.js` — lint rules in force
- `/Users/theshumba/Documents/GitHub/gogo-arabic/src/data/npcDialogueLoader.js` — concrete `import.meta.glob` usage (direct evidence of false-positive vector #1)
- `/Users/theshumba/Documents/GitHub/gogo-arabic/scripts/ralph/CLAUDE.md` — Ralph agent contract
- `/Users/theshumba/Documents/GitHub/gogo-arabic/.planning/PROJECT.md` — out-of-scope, core value
- `/Users/theshumba/Documents/GitHub/gogo-arabic/.planning/STATE.md` — 2535 tests, v15.0 complete
- `/Users/theshumba/Documents/GitHub/gogo-arabic/.planning/ROADMAP.md` — Phase 98 definition
- `/Users/theshumba/Documents/GitHub/gogo-arabic/.planning/phases/98-codebase-audit-and-refactor/98-CONTEXT.md` — user decisions

### Secondary (MEDIUM confidence)
- `/Users/theshumba/Documents/GitHub/gogo-arabic/.planning/AUDIT-REPORT.md` (2026-02-08) — historical baseline
- `/Users/theshumba/Documents/GitHub/gogo-arabic/.planning/milestones/v6.0-MILESTONE-AUDIT.md` — format reference for audit docs

### Tertiary (LOW confidence)
- None required — all key tool claims verified against npm registry or Context7.

## Metadata

**Confidence breakdown:**
- Safety Rail design: HIGH — six vectors directly grounded in code samples (npcDialogueLoader.js, EventBus naming, store.js patterns).
- Tool Selection: HIGH — versions verified via npm on 2026-04-17.
- Audit Structure: HIGH — follows existing milestone audit format (v6.0-MILESTONE-AUDIT.md) plus CONTEXT.md dimensions.
- Refactor Patterns: HIGH — patterns are industry standard and grounded in this codebase's system types.
- Test Coverage Measurement: HIGH — vitest coverage-v8 already wired; only question is threshold.
- Feature Preservation: MEDIUM — 15 smoke tests is a judgment call; user may want different count.
- Sign-Off Mechanism: HIGH — file structure is ergonomic, user can review in one session.
- Pre-existing Stubs: LOW — no way to research user intent; MUST surface to user.
- Ralph Safety: HIGH — Ralph's CLAUDE.md is explicit; approach aligns.
- Validation Architecture: HIGH — invariants are mechanical; commands are verified working.
- Pitfalls: HIGH — every pitfall is observable in the codebase's structure.

**Research date:** 2026-04-17
**Valid until:** 2026-05-17 (30 days — ecosystem moves moderately; npm versions may bump, but Knip 6.x major is stable for months)
