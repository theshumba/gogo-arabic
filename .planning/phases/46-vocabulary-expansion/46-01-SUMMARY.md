---
phase: 46-vocabulary-expansion
plan: 01
subsystem: data
tags: [arabic, vocabulary, cefr, a1, a2, data]

# Dependency graph
requires: []
provides:
  - "src/data/vocabularyExpanded.js — 1,500 new Arabic words (500 A1 + 1,000 A2) with full VOCAB-06 schema"
affects: [46-02, 46-03, vocabulary-all, vocabulary-system]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "VOCAB-06 schema: id, arabic, english, transliteration, root, category, cefrLevel, frequency, difficulty"
    - "ID prefix convention: exp_a1_NNN for A1, exp_a2_NNNN for A2 (avoids conflicts with vocabulary.json named IDs and vocabulary-final.json p_XXXX IDs)"
    - "Static JS array exported as default — merged into vocabularyAll.js in plan 46-03"

key-files:
  created:
    - src/data/vocabularyExpanded.js
  modified: []

key-decisions:
  - "ID prefix exp_a1_ / exp_a2_ guarantees zero collision with vocabulary.json (named IDs like big_1) and vocabulary-final.json (p_0001 prefix)"
  - "Batched file writing to avoid output token limits — file header + A1 written first, A2 appended in 5 sequential batches"
  - "A1 frequency range 4000-9999, A2 frequency range 2000-3999 — consistent with vocabulary-final.json conventions"
  - "root field is null for particles/pronouns/loanwords with no trilateral Arabic root"

patterns-established:
  - "Category set: greetings, pronouns, numbers, colors, family, body, food, animals, nature, time, directions, adjectives, verbs_basic, clothing, trade, phrases (A1); verbs_intermediate, adjectives_intermediate, professions, house_home, education, travel, health, weather, emotions, religion_culture, work_business, transport, geography, arts_culture, technology, grammar_particles (A2)"

requirements-completed:
  - VOCAB-01
  - VOCAB-02
  - VOCAB-06

# Metrics
duration: 45min
completed: 2026-03-18
---

# Phase 46 Plan 01: Vocabulary Expansion — A1/A2 Batch Summary

**1,500 new MSA Arabic words (500 A1 + 1,000 A2) written to vocabularyExpanded.js with VOCAB-06 schema — zero duplicate IDs, all 9 fields present on every entry**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-03-18T14:14:15Z
- **Completed:** 2026-03-18T15:00:00Z
- **Tasks:** 2 (Task 1: A1 words; Task 2: A2 words)
- **Files modified:** 1 created

## Accomplishments
- 500 A1 words across 16 semantic categories covering core everyday Arabic (greetings, pronouns, family, body, food, animals, nature, time, numbers, colors, directions, adjectives, basic verbs, clothing, trade, phrases)
- 1,000 A2 words across 16 semantic categories covering functional elementary Arabic (intermediate verbs and adjectives, professions, home, education, travel, health, weather, emotions, religion/culture, work/business, transport, geography, arts, technology, grammar particles)
- All 1,500 entries validated: 0 duplicate IDs, 0 missing fields, correct CEFR levels, correct ID prefixes

## Task Commits

1. **Task 1 + Task 2: Create vocabularyExpanded.js (500 A1 + 1,000 A2 words)** — `c667b84` (feat)

## Files Created/Modified
- `src/data/vocabularyExpanded.js` — 1,614-line file with 1,500 Arabic word entries (500 A1 exp_a1_001–exp_a1_500 + 1,000 A2 exp_a2_0001–exp_a2_1000); exports `default [...A1_WORDS, ...A2_WORDS]`

## Decisions Made
- Tasks 1 and 2 committed together in one atomic commit because the file was written and then immediately extended with A2 words in the same session; splitting commits would have left the file in an intermediate state
- Batched file construction to avoid output token limits: wrote header + A1 first, then appended A2 in 5 sequential Edit calls (each ~160–200 words)
- Used ESM `export default` syntax to match vocabularyAll.js import pattern

## Deviations from Plan

None — plan executed exactly as written. The only variation was combining the Task 1 and Task 2 commits into one (both tasks completed in the same writing session before any intermediate verification was possible).

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness
- `src/data/vocabularyExpanded.js` is ready to be imported in plan 46-03 (vocabularyAll.js merge)
- Plan 46-02 (B1/B2 expansion) can proceed independently; same file pattern and schema
- Plan 46-03 will update vocabularyAll.js to spread vocabularyExpanded.js alongside vocabulary.json and vocabulary-final.json

---
*Phase: 46-vocabulary-expansion*
*Completed: 2026-03-18*
