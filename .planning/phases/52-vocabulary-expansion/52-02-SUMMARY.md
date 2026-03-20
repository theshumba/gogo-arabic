---
phase: 52-vocabulary-expansion
plan: 02
subsystem: testing
tags: [arabic, vocabulary, cefr, validation, build-tools, root-explorer, teacher-word-card]

# Dependency graph
requires:
  - phase: 52-01
    provides: "CEFR inference for all legacy words in vocabularyAll.js, Arabic-text dedup, 596 real B2 words replacing placeholders"
provides:
  - "scripts/validate-vocab.mjs — 5-check build-time quality gate for vocabulary data"
  - "vocab:validate npm script wired in package.json"
  - "CEFR badge confirmed rendering for all 5,029 words including legacy vocabulary.json entries (CONT-03)"
  - "Root Explorer vocabRootFamilies grouping confirmed working with expanded data (CONT-04)"
  - "Build passes (npm run build exits 0) after all vocabulary data changes"
affects: [52-03, vocabulary-slice, root-explorer, teacher-word-card]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "validate-vocab.mjs pattern: replicates vocabularyAll.js merge inline (readFile JSON + ESM import vocabularyExpanded.js) to avoid import.meta.env.DEV crash in Node 24 outside Vite"
    - "Validation script separates errors (exit 1) from warnings (exit 0) — missing root is a warning, missing CEFR or placeholder is an error"

key-files:
  created:
    - scripts/validate-vocab.mjs
  modified:
    - package.json

key-decisions:
  - "validate-vocab.mjs replicates merge logic inline rather than importing vocabularyAll.js — Node 24 requires 'type: json' import attribute for JSON files in ESM context, and vocabularyAll.js uses import.meta.env.DEV which crashes outside Vite"
  - "Missing root field is a WARN not an ERROR — 1,147 legacy/Quranic words legitimately lack root field; erroring would force back-filling all legacy JSON"
  - "No code changes needed in TeacherWordCard.jsx or RootExplorer.jsx — both already handle cefrLevel conditionally"

patterns-established:
  - "Pattern: validate-vocab.mjs is the canonical quality gate — run before shipping any vocabulary data changes"
  - "Pattern: Node 24 ESM CLI scripts must not import vocabularyAll.js directly; replicate merge inline or run via Vite"

requirements-completed: [CONT-03, CONT-04, CONT-08]

# Metrics
duration: 10min
completed: 2026-03-20
---

# Phase 52 Plan 02: Tooling + UI Confirmation Summary

**Build-time vocab:validate quality gate (5 checks, exits 0 on 5,029 words) plus confirmation that CEFR badges and Root Explorer work with expanded data — no UI code changes needed**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-20T17:09:48Z
- **Completed:** 2026-03-20T17:20:00Z
- **Tasks:** 2 (Task 1: create script; Task 2: verify components)
- **Files modified:** 2 (scripts/validate-vocab.mjs created, package.json updated)

## Accomplishments

- `scripts/validate-vocab.mjs` created — 5-check validation: duplicate Arabic text, missing root field (warn), missing CEFR on expanded words, missing CEFR after inference (legacy), leftover placeholder words
- `npm run vocab:validate` exits 0: 5,029 words, 0 errors, 1,147 warnings (all warnings are expected missing-root for legacy/Quranic entries)
- CEFR badge confirmed rendering on TeacherWordCard for all words including legacy vocabulary.json entries — `{word.cefrLevel && <div className={styles.cefrBadge}>}` already conditional on field presence; Plan 52-01 CEFR inference ensures all words have cefrLevel (CONT-03)
- RootExplorer `vocabRootFamilies` useMemo confirmed grouping words by root field, `viewMode` state confirmed switching Root Families / Word Clusters — no code changes needed (CONT-04)
- `npm run build` exits 0 — no build errors from vocabulary data changes

## Task Commits

Each task was committed atomically:

1. **Task 1: Create vocab:validate build-time validation script** - `2655318` (feat)
2. **Task 2: Verify CEFR badge and Root Explorer** — verification only, no files modified (no commit)

**Plan metadata:** (this SUMMARY commit)

## Files Created/Modified

- `scripts/validate-vocab.mjs` — Build-time vocabulary validation; replicates vocabularyAll.js merge inline; 5 checks; exits 0 on success
- `package.json` — Added `"vocab:validate": "node scripts/validate-vocab.mjs"` after ink:compile entry

## Decisions Made

- validate-vocab.mjs replicates the merge logic inline (readFile for JSON + ESM import for vocabularyExpanded.js) rather than importing vocabularyAll.js directly. Node 24 requires `with { type: 'json' }` import attributes for JSON files in ESM context, and vocabularyAll.js uses `import.meta.env.DEV` which crashes outside Vite. This is a CLI-environment-only constraint; the app itself works correctly via Vite.
- Missing root field raised as WARN (not ERROR) — 1,147 legacy and Quranic words have `root: undefined` because vocabulary.json and vocabulary-final.json never had root fields. These entries are linguistically valid; erroring would force a large JSON back-fill operation not planned for Phase 52.
- TeacherWordCard.jsx and RootExplorer.jsx confirmed requiring zero code changes — both components already handle the CEFR and root data dynamically.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] validate-vocab.mjs imports vocabularyAll.js inline rather than directly**

- **Found during:** Task 1 (creating validate-vocab.mjs)
- **Issue:** Plan specified `import vocabulary from '../src/data/vocabularyAll.js'` but Node 24 throws `ERR_IMPORT_ATTRIBUTE_MISSING` for `vocabulary.json` (requires `with { type: 'json' }`), and vocabularyAll.js uses `import.meta.env.DEV` which crashes without Vite
- **Fix:** Replicated merge logic inline in the script: `readFile` for the two JSON sources, direct ESM import for vocabularyExpanded.js (which has no meta.env usage). This approach is explicitly documented in RESEARCH.md Pattern 4 as the correct alternative.
- **Files modified:** scripts/validate-vocab.mjs
- **Verification:** `npm run vocab:validate` exits 0; 5,029 words validated
- **Committed in:** 2655318 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking)
**Impact on plan:** Fix necessary for Node 24 compatibility. No scope creep — the inline merge approach was already recommended in RESEARCH.md Pattern 4.

## Issues Encountered

Node 24 ESM strictness — `vocabulary.json` import requires `with { type: 'json' }` attribute, which is not used in the Vite-bundled source files (Vite handles this transparently). Resolved by reading JSON files via `readFile` in the CLI script. Not a bug in production code.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `npm run vocab:validate` is now the repeatable quality gate for all vocabulary edits
- 52-03 (wiring) can proceed: wire `ambiguous: true` tashkeel lock in TashkeelText.jsx and useFormatArabic.js, verify selectNewCardsByFrequency sorting, verify Word Clusters for newly mapped categories
- No blockers — build passes, all acceptance criteria met

---
*Phase: 52-vocabulary-expansion*
*Completed: 2026-03-20*

## Self-Check: PASSED

- scripts/validate-vocab.mjs — FOUND
- package.json — FOUND
- .planning/phases/52-vocabulary-expansion/52-02-SUMMARY.md — FOUND
- Commit 2655318 (Task 1) — FOUND
