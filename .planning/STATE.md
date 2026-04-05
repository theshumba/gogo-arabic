---
gsd_state_version: 1.0
milestone: v15.0
milestone_name: Core Learning Loop
status: complete
stopped_at: All 5 phases (81-85) shipped + integration wiring
last_updated: "2026-03-28"
progress:
  total_phases: 5
  completed_phases: 5
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-22)

**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"
**Current focus:** v15.0 COMPLETE — ready for v16.0 planning

## Current Position

Phase: 85 of 85 (v15.0 complete)
Plan: All shipped
Status: Milestone complete
Last activity: 2026-03-28 — v15.0 built and integrated, all tests passing

Progress: [█████████] 100% (v15.0) — 5/5 phases complete

### Shipped Milestones

| Version | Phases | Plans | Date |
|---------|--------|-------|------|
| v2.0 Player Experience | 1-9 | 14 | 2026-02-08 |
| v3.0 Infrastructure | 10-11 | 11 | 2026-02-09 |
| v4.0 Game Soul & Polish | 14-18 | 8 | 2026-02-10 |
| v5.0 The Real Game | 19-26 | 18 | 2026-02-11 |
| v6.0 Combat & RPG | 27.1, 28-30 | 16 | 2026-02-13 |
| v6.1 Crafting & Advanced Combat | 31-32 | 19 | 2026-02-18 |
| v7.0 World & Content | 33-37 | 18 | 2026-03-16 |
| v8.0 Visual Overhaul | 38-43 | ~18 | 2026-03-18 |
| v9.0 Content Depth | 44-46 | 9 | 2026-03-18 |
| v10.0 Onboarding | 47 | 3 | 2026-03-19 |
| v11.0 Deep Systems | 50-55 | 25 | 2026-03-21 |
| v12.0 Learning Systems | 56-64 | 22 | 2026-03-23 |
| v13.0 Systems Polish & Immersion | 65-71 | 16 | 2026-03-27 |
| v14.0 Narrative, Social & Audio | 76-80 | 10 | 2026-03-28 |
| v15.0 Core Learning Loop | 81-85 | 10 | 2026-03-28 |

**Cumulative:** 85 phases, 229+ plans, 15 milestones, 2535 tests

## v15.0 Completion Summary

### Phase 81: Daily Challenge System (DAILY-01, DAILY-02) — SHIPPED
- 4 rotating challenge types: Word of the Day, Grammar Challenge, Speed Quiz, Cultural Trivia
- Deterministic daily selection (xorshift32 hash — all players get same daily)
- Streak tracking with 5 reward tiers (3/7/14/30/60 days)
- XP multiplier based on streak length (+5%/day, max +150%)
- 83 tests

### Phase 82: Graded Reading Passages (READ-01, READ-02) — SHIPPED
- 60 graded passages (15 per CEFR level A1-B2) across 15 topics
- Inline vocabulary tooltips with "Add to review" FSRS integration
- 3-5 comprehension questions per passage (multiple choice + true/false)
- VocabTooltip component for tappable word definitions
- 68 tests

### Phase 83: Arabic Writing Practice (WRITE-01, WRITE-02) — SHIPPED
- Canvas-based tracing for all 28 Arabic letters with stroke order data
- 32 word exercises + 22 phrase exercises (progressive difficulty)
- Grid-based IoU (8x8) stroke validation with interpolation
- Touch + mouse support via Pointer Events API
- 59 tests

### Phase 84: Conversation Practice (CONV-01, CONV-02) — SHIPPED
- 40 conversation scenarios (5 per zone) with authentic Arabic dialogue
- Word bank sentence construction with RTL layout
- Chat-style UI with NPC portraits and feedback
- Scoring: exact=100%, 1 off=75%, 2+=50%, wrong=25%
- 70 tests

### Phase 85: Mini-Game Expansion (MINI-01 to MINI-04) — SHIPPED
- MiniGameHub selection screen
- Word Search: 20 pre-built 10x10 Arabic grids
- Crossword: 15 pre-built puzzles with English clues, Arabic answers
- Number Challenge: Arabic-Indic numerals (0-100), 4 difficulty levels
- Memory Match: 10 themed card sets with optional TTS
- 365 tests

### Integration Wiring
- store.js: Added 5 new reducers (dailyChallenge, reading, writing, conversation, miniGame)
- GameLayout.jsx: 5 new lazy-loaded overlay imports
- readingPassages.js: Added compatibility aliases for pre-existing ReadingExercise component

## Test Health

- **134 test files, 2535 tests — ALL PASSING**
- Build: production build passes (7.14s)

### Blockers/Concerns

- None

## Session Continuity

Last session: 2026-03-28
Stopped at: v15.0 milestone COMPLETE
Resume file: None
Next: v16.0 planning or backend/deployment
