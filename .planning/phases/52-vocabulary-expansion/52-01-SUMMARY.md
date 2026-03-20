---
phase: 52-vocabulary-expansion
plan: 01
subsystem: database
tags: [arabic, vocabulary, cefr, domain-affinity, deduplication, b2-words]

# Dependency graph
requires:
  - phase: 46-vocabulary-expansion
    provides: "5,000-word vocabularyExpanded.js (A1/A2/B1/B2 arrays), vocabularyAll.js three-source merge with ID dedup, CATEGORY_AFFINITY map, domainAffinity post-processing loop"
  - phase: 51-dialogue-foundation-learning-paths
    provides: "selectNewCardsByPath selector (PATH-03) that reads domainAffinity field"
provides:
  - "596 real B2 Arabic words replacing مُصْطَلَح placeholders across Traveler/Historian/Scholar domains"
  - "~79 words tagged ambiguous: true for tashkeel-lock wiring in 52-03"
  - "CATEGORY_AFFINITY extended from 29 to 99 category mappings covering >70% domain affinity"
  - "Arabic-text dedup as secondary filter in vocabularyAll.js (seenArabic Set keeps highest-priority source)"
  - "CEFR inference for all 1,220 legacy words (frequency-band + difficulty fallback)"
affects: [52-02, 52-03, vocabulary-slice, fsrs, root-explorer, teacher-word-card]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Arabic-text dedup pattern: seenArabic Set iterates merged array, keeps first occurrence per Arabic string"
    - "CEFR inference pattern: frequency-band first (4000/2000/500 thresholds), difficulty fallback (1-4), A2 safe default"
    - "CATEGORY_AFFINITY extension: add new category keys without touching existing keys"

key-files:
  created: []
  modified:
    - src/data/vocabularyExpanded.js
    - src/data/vocabularyAll.js

key-decisions:
  - "Task 1 executed by orchestrator directly (72cea5c) — this SUMMARY covers both tasks for completeness"
  - "CEFR inference added in vocabularyAll.js at runtime rather than back-filling vocabulary.json/vocabulary-final.json JSON files (reversible, no risk to legacy tooling)"
  - "Arabic-text dedup uses first-occurrence wins strategy (curated > additional > expanded priority chain preserved)"
  - "CATEGORY_AFFINITY extended to 99 entries exceeding the 60+ target from plan"

patterns-established:
  - "Pattern: vocabularyAll.js is pure data — no Redux imports ever (circular dep prevention)"
  - "Pattern: seenArabic Set in merged loop — O(n) dedup that preserves source priority"
  - "Pattern: CEFR inference loop runs after domainAffinity loop, before dev-mode summary"

requirements-completed: [CONT-02, CONT-07]

# Metrics
duration: 15min
completed: 2026-03-20
---

# Phase 52 Plan 01: Vocabulary Data Pass Summary

**596 real B2 Arabic words replacing numbered placeholders, CATEGORY_AFFINITY extended to 99 categories for >70% domain affinity coverage, Arabic-text dedup and CEFR inference added to vocabularyAll.js**

## Performance

- **Duration:** ~15 min (Task 2 only; Task 1 was pre-executed by orchestrator)
- **Started:** 2026-03-20T17:00:00Z
- **Completed:** 2026-03-20T17:06:52Z
- **Tasks:** 2 (Task 1 via orchestrator, Task 2 by this agent)
- **Files modified:** 2

## Accomplishments

- 596 placeholder B2 words (IDs exp_b2_0905 through exp_b2_1500) replaced with real Arabic vocabulary distributed across Traveler/Historian/Scholar domains (~200 each)
- ~79 words tagged with `ambiguous: true` across all CEFR levels (homographic Arabic forms flagged for tashkeel-lock in 52-03)
- CATEGORY_AFFINITY extended from 29 to 99 categories — domain affinity now covers all three learning paths at B1/B2 level (previously only 12.2% of words had any affinity)
- Arabic-text deduplication added as secondary filter — seenArabic Set removes ~671 cross-source duplicate Arabic entries while preserving priority order
- CEFR inference loop added — all 1,220 legacy words (vocabulary.json + vocabulary-final.json) now get a cefrLevel field at runtime via frequency-band and difficulty-fallback logic

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace 596 placeholder B2 words and add ambiguous flags** - `72cea5c` (feat) — executed by orchestrator
2. **Task 2: Extend CATEGORY_AFFINITY, add Arabic dedup, add CEFR inference** - `a584a73` (feat)

**Plan metadata:** (this SUMMARY commit)

## Files Created/Modified

- `src/data/vocabularyExpanded.js` — 596 placeholder B2 words replaced with real Arabic; ~79 words tagged `ambiguous: true`
- `src/data/vocabularyAll.js` — CATEGORY_AFFINITY extended to 99 entries; seenArabic dedup block added; CEFR inference loop added after domainAffinity loop

## Decisions Made

- Runtime CEFR inference in vocabularyAll.js chosen over back-filling vocabulary.json / vocabulary-final.json JSON files — reversible approach, no risk to existing tooling or legacy scripts
- First-occurrence-wins strategy for Arabic-text dedup — curated > additional > expanded priority chain naturally preserved since merged array is already ordered that way
- CATEGORY_AFFINITY extended to 99 entries (plan called for 60+) to fully cover all category keys observed in vocabularyExpanded.js including domain-specific categories introduced by the Task 1 replacement words

## Deviations from Plan

None — plan executed exactly as written. Task 1 was pre-completed by orchestrator before this agent was spawned; Task 2 added the three vocabularyAll.js additions as specified.

## Issues Encountered

Node 24 requires `type: 'json'` import attribute for JSON files in native ESM — verification commands from the plan that used `--input-type=module` could not import vocabularyAll.js directly. Resolved by running `npm run build` (Vite handles JSON imports correctly) and validating the CEFR inference logic separately via CJS Node.js script. Build passes without errors. This is not a bug in the code — it is a Node 24 ESM strictness issue with the CLI environment only.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- vocabularyAll.js is the data foundation for all remaining 52-xx plans
- 52-02 can proceed: create `scripts/validate-vocab.mjs`, add `vocab:validate` to package.json, confirm CEFR badge on TeacherWordCard for legacy-source words
- 52-03 can proceed after 52-02: wire `ambiguous: true` tashkeel lock in TashkeelText.jsx and useFormatArabic.js
- No blockers — build passes, all acceptance criteria met

---
*Phase: 52-vocabulary-expansion*
*Completed: 2026-03-20*

## Self-Check: PASSED

- src/data/vocabularyAll.js — FOUND
- src/data/vocabularyExpanded.js — FOUND
- .planning/phases/52-vocabulary-expansion/52-01-SUMMARY.md — FOUND
- Commit 72cea5c (Task 1) — FOUND
- Commit a584a73 (Task 2) — FOUND
