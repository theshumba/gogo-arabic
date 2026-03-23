---
phase: 62
plan: 62-01
name: B1-B2 Grammar Lesson Expansion
subsystem: grammar
tags: [grammar, content, B1, B2, CEFR, exercises, data-integrity]
dependency_graph:
  requires: []
  provides: [grammar.js@50-lessons, grammarChecker@all-levels]
  affects: [GrammarModule, placementEngine, grammarSlice, ExerciseStage]
tech_stack:
  added: []
  patterns: [exercise-schema, quiz-schema, CEFR-gating]
key_files:
  created: []
  modified:
    - src/data/grammar.js
    - src/data/__tests__/grammarChecker.test.js
decisions:
  - "conjugation-drill paradigm field: 'future' added to allowed values for jussive/subjunctive mood drills"
  - "specification-tamyiz-2 uses paradigm:'past' as placeholder for a count-drill — ExerciseStage handles it via answer/options"
metrics:
  duration: "~3 hours (across 2 sessions)"
  completed: "2026-03-23"
  commits: [8d3d32f]
---

# Phase 62 Plan 01: B1-B2 Grammar Lesson Expansion Summary

## One-liner

Expanded all 23 B1/B2 stub lessons and added 7 new B2 lessons, reaching exactly 50 grammar lessons with 12+ exercises, 4+ distinct types, and 4+ quiz questions each; grammarChecker now validates all CEFR levels.

## What Was Built

grammar.js grew from 43 lessons (23 stubs at 1 exercise each) to 50 fully populated lessons. Every B1 and B2 lesson now meets the same standard as the A1/A2 lessons shipped in Phase 58.

### B1 Lessons Expanded (13 total, orders 25-37)

| ID | Order | Topic |
|----|-------|-------|
| verb-forms-2-5 | 25 | Verb forms II-V (فعّل / أفعل / فاعل / تفعّل) |
| verb-forms-6-10 | 26 | Verb forms VI-X |
| relative-clause | 27 | Relative clauses (الذي / التي) |
| passive-voice | 28 | Passive voice (المبني للمجهول) |
| verbal-noun | 29 | Verbal nouns (المصدر) |
| object-pronouns | 30 | Object pronouns (ضمائر المفعول) |
| adverbs | 31 | Adverbs of time/manner/place |
| conjunctions | 32 | Conjunctions (الروابط) |
| exception-illa | 33 | Exception with إلا |
| emphasis-inna | 34 | Emphasis with إنّ and أنّ |
| hal-clause | 35 | Circumstantial clause (الحال المفرد) |
| tamyiz | 36 | Specification (التمييز) |
| indirect-object | 37 | Indirect object |

### B2 Lessons Expanded (10 stubs, orders 38-47)

| ID | Order | Topic |
|----|-------|-------|
| complex-conditionals | 38 | Complex conditionals (لو / لولا) |
| oath-expressions | 39 | Oath expressions (القسم) |
| exclamation | 40 | Exclamation (التعجب) |
| wonder-verb | 41 | Verbs of wonder (أفعال التعجب) |
| praise-blame | 42 | نعم وبئس |
| absolute-object | 43 | Absolute object (المفعول المطلق) |
| mafuul-liajlih | 44 | Cause object (المفعول لأجله) |
| mafuul-maah | 45 | Accompanying object (المفعول معه) |
| literary-particles | 46 | Literary particles (لام / إن المخففة) |
| formal-letter | 47 | Formal letter writing |

### New B2 Lessons Added (7, orders 48-54)

| ID | Order | Topic |
|----|-------|-------|
| idafa-complex | 48 | Complex إضافة chains |
| jussive-mood | 49 | Jussive mood (المجزوم) |
| subjunctive-mood | 50 | Subjunctive mood (المنصوب) |
| vocative-case | 51 | Vocative (أسلوب النداء) |
| specification-tamyiz-2 | 52 | Number specification (تمييز العدد) |
| circumstantial-hal-2 | 53 | Sentential circumstantial (الحال الجملة) |
| style-variety | 54 | Rhetorical styles (الأساليب البلاغية) |

### grammarChecker.test.js Updates

- Added: `it('contains exactly 50 lessons', ...)`
- Added: `it('has at least 13 B1 and at least 17 B2 lessons', ...)`
- Added: 3 tests validating B1/B2 exercise count, distinct types, quiz count
- Added: B1/B2 exercise type coverage test (all 9 types appear)
- Changed: schema tests now use `allLessons` instead of `a1a2Lessons`
- Total tests in file: 23 (was 13)

## Verification Results

```
Total: 50
Stubs remaining: 0
B1: 13  B2: 17
B1/B2 with <4 quiz questions: 0
B1/B2 with <4 distinct types: 0
Order range: 1 - 54
```

grammarChecker.test.js: 23/23 tests pass
Full suite: 1406 pass, 1 pre-existing HUD failure (unrelated to grammar)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Single-quote characters inside JS string literals**
- **Found during:** Task 62-01-01 (writing B2 lesson explanations)
- **Issue:** Apostrophes in transliterations like `li'anna` and `la'alla` inside single-quoted strings caused SyntaxError
- **Fix:** Changed to hyphen separator: `li-anna`, `la-alla`
- **Files modified:** src/data/grammar.js
- **Commit:** 8d3d32f

**2. [Rule 1 - Bug] Multiple lessons ended up with 11 exercises after initial write**
- **Found during:** Post-write count verification
- **Issue:** Several lessons (tamyiz, indirect-object, complex-conditionals, exclamation, wonder-verb, absolute-object, mafuul-liajlih, mafuul-maah, literary-particles, idafa-complex, vocative-case) each had 11 exercises instead of 12
- **Fix:** Added one additional exercise (build-sentence or multiple-select) to each
- **Files modified:** src/data/grammar.js
- **Commit:** 8d3d32f

## Self-Check: PASSED

- FOUND: src/data/grammar.js
- FOUND: src/data/__tests__/grammarChecker.test.js
- FOUND: .planning/phases/62-grammar-b1-b2-cefr-gating/62-01-SUMMARY.md
- FOUND: commit 8d3d32f
