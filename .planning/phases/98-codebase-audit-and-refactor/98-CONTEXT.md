# Phase 98: Codebase Audit & Refactor - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning
**Source:** Direct user conversation (locked decisions captured by orchestrator)

<domain>
## Phase Boundary

Audit the entire 210K LOC Gogo Arabic codebase in a single Opus 4.7 1M-context pass, produce a prioritised findings report (AUDIT.md), then execute a guardrailed refactor. The guiding principle: **audit first, act second** — nothing gets touched until the user has reviewed the findings and signed off. Explicit guardrails govern every modification: no feature removal, test coverage required BEFORE refactor of any system, every "dead code" removal gets user approval, feature preservation is the first success criterion.

This is the phase the user is most nervous about. Their stated concern: *"By a refactor, does this mean removing essential things from the app? I don't want you to end up removing certain things."* All planning must reflect this as the hardest constraint.

</domain>

<decisions>
## Implementation Decisions

### Hard Guardrails (non-negotiable)

1. **Audit-first, act-second** — Plan 01 produces `AUDIT.md` listing dead code, architectural drift, tangled dependencies, performance hotspots. Nothing gets modified until user reviews and signs off section by section.
2. **No deletions without explicit user approval** — Every candidate for removal goes onto a sign-off list the user approves item-by-item. Silent deletions are forbidden, even for code that "looks obviously dead."
3. **Test coverage before any refactor** — If a system being refactored has no test coverage, add tests FIRST (as a separate task/plan before the refactor task). A refactor without pre-existing green tests cannot prove behavior preservation.
4. **Feature preservation is the first verification gate** — Success criterion #1 for this phase: "All existing features continue to work." Every plan must include this as an acceptance criterion.
5. **All 2535 existing tests must continue to pass** — unchanged from Phase 97 standard.
6. **Every modification is atomic and reversible** — one refactor = one commit = one revert target. No multi-system sweeps in a single commit.

### Scope
- **In scope:** Dead code removal (with approval), architectural consolidation, tangled dependency unwinding, performance hotspot fixes, inconsistent pattern reconciliation, obsolete config/comment cleanup, import reorganization, file-size reduction where reasonable, deletion of `.planning/` artifacts that no longer reflect reality (e.g., completed phase stubs 86-96 review).
- **Out of scope:** New features, new systems, behavior changes, game-logic redesigns, performance *optimizations* that change semantics, migration to new frameworks (no TypeScript migration — already out of scope per PROJECT.md), Phaser/React version upgrades, backend architecture changes.
- **Not touched by refactor:** FSRS algorithm implementation, ink dialogue engine, Redux slice action names and types (public contract), test file assertions (only test infrastructure), any Arabic language data files (JSON content is sacred), any user-facing strings or i18n.

### Pre-existing Stubs (86-96) — Investigate and Decide
- Phase directories 86-96 exist with plan stubs (Ramadan events, difficulty curve, progression, NPC/quest expansion, content, leaderboards, tutorial, analytics, idioms, pronunciation, battle).
- Not currently assigned to any milestone.
- Audit should classify each: (a) still relevant → assign to future milestone, (b) superseded by shipped work → archive, (c) obsolete → remove with user approval.
- Do NOT bulk-delete. Each stub gets individual assessment in AUDIT.md.

### Audit Dimensions (what AUDIT.md must cover)
1. **Dead code** — unused exports, unreferenced files, commented-out code blocks, unreachable branches
2. **Duplicate logic** — same algorithm implemented in multiple places (candidates for consolidation)
3. **Architectural drift** — places where the established pattern is violated (e.g., Redux slice accessed directly instead of via selector)
4. **Tangled dependencies** — circular imports, God modules, over-coupled systems
5. **Performance hotspots** — known slow code paths, large bundle contributors, memory leaks
6. **Inconsistent patterns** — same concern handled differently across the codebase (e.g., error handling, logging)
7. **Test coverage gaps** — systems with no or weak tests that will need new tests before any refactor can touch them
8. **Comment rot** — stale comments, TODO/FIXME/HACK markers that are years old
9. **Configuration cruft** — unused env vars, config keys that no feature references
10. **Git-level drift** — files in `.planning/` that don't match ROADMAP/STATE reality (already partially fixed in v16.0 drift commit)

### 1M Context Strategy
- **Single-pass analysis** — load the entire source tree (`src/`, `server/`, `scripts/`, `public/assets/manifests/`, `.planning/phases/`) in one context. Reason across everything simultaneously.
- **Cross-module reference tracing** — when a dependency looks orphaned, verify globally before flagging. A 1M context lets us trace every import of every export in one pass.
- **Test ↔ source mapping** — with all test files + source files in one context, map which tests cover which systems. Output: test-coverage heatmap as part of AUDIT.md.

### Quality Expectations
- **Quality is the most important thing** — user's repeated signal.
- **Don't rush** — take as many passes as needed. If AUDIT.md needs to be 3000 lines, make it 3000 lines.
- **Conservative on deletions** — when in doubt, flag for user, don't remove.
- **Prefer consolidation over removal** — if two systems do similar things, propose merging them (with user approval) rather than deleting one.

### Depends on
- Phase 97 complete — the visual layer must be stable and tested before a refactor sweep. A refactor over a broken visual layer produces noise, not signal.

### Preserve
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project reality (current state)
- `.planning/PROJECT.md` — core value, validated features, out-of-scope boundaries
- `.planning/STATE.md` — shipped milestones, cumulative stats (85 phases, 2535 tests)
- `.planning/ROADMAP.md` — Phase 98 section + phases 86-96 stub status
- `.planning/REQUIREMENTS.md` — validated and active requirements

### Scope of audit
- `src/**/*.{js,jsx,css}` — frontend source
- `server/**/*.js` — backend source
- `scripts/**/*.{js,sh}` — build and Ralph scripts
- `public/assets/manifests/` — asset manifests (not the assets themselves)
- `.planning/phases/86-*/` through `.planning/phases/96-*/` — unassigned stubs
- `package.json`, `vite.config.js`, `vitest.config.js`, `playwright.config.js` — build + test config

### Prior audit/review work to reference (not repeat)
- `.planning/AUDIT-REPORT.md` (if exists)
- `.planning/AUDIT-SYNTHESIS.md` (if exists)
- `.planning/milestones/v4.0-MILESTONE-AUDIT.md`, `v6.0-MILESTONE-AUDIT.md`, `v6.1-MILESTONE-AUDIT.md`
- Phase 11 (v3.0 Architecture Cleanup) — prior refactor pass

### User guardrails (MUST honour)
- "I don't want you to end up removing certain things" — cited during planning; treat as hard safety constraint
- `feedback_gogo_build_approach.md` — Claude handles build but respects user guardrails
- `feedback_no_rush_visual.md` — extends to "don't rush" generally

</canonical_refs>

<specifics>
## Specific Ideas

- AUDIT.md produces a **priority table** (Critical / High / Medium / Low) with rationale for each finding. User reviews top-down.
- Test coverage gap heatmap: list every system module and show existing test file + coverage %. Systems with <50% coverage cannot be refactored until Wave 0 tests are added.
- "Sign-off required" list for deletions should be in a separate `98-DELETIONS.md` so the user can review it independently of the full AUDIT.md.
- Pre-existing phase stubs 86-96 get individual "keep/archive/delete" recommendations in AUDIT.md — user decides.
- Consider producing a visualisation of module dependency graph (`.planning/phases/98-.../dependency-graph.svg` or similar) to make tangled-dependency findings tangible.
- Ralph's `scripts/ralph/` system is IN scope for audit but should be treated carefully — it's an active autonomous agent pipeline the user relies on. Any changes coordinate with user first.
- `.planning/` drift — Phase 97 already fixed some (v13-15 shipped reconciliation). Phase 98 should verify no further drift and flag any remaining discrepancies.

</specifics>

<deferred>
## Deferred Ideas

- TypeScript migration — out of scope per PROJECT.md
- Phaser / React major version upgrades — defer to a separate version-upgrade phase
- Backend architecture rewrite — out of scope
- Performance optimisations that change behavior — defer; this phase only does semantic-preserving refactor
- Replacing Redux Toolkit with something else — out of scope
- New tooling (e.g., adopting Bun, Biome) — defer, not the goal of this phase
- Renaming public APIs that external callers (if any) depend on — defer
- Monorepo restructuring — defer

</deferred>

---

*Phase: 98-codebase-audit-and-refactor*
*Context gathered: 2026-04-17 via orchestrator-captured conversation*
