---
phase: 63-achievement-expansion
plan: 01
subsystem: achievements-data
tags: [achievements, tier-system, v12.0, data-layer, tdd]
dependency_graph:
  requires: []
  provides: [TIER, TIER_COLORS, RARITY_TO_TIER, SKILL_TREE category, QUIZ category, CEFR category, tier field on all entries]
  affects: [src/store/middleware/achievementMiddleware.js, any UI that renders achievement tiers]
tech_stack:
  added: []
  patterns: [RARITY_TO_TIER computed field derivation, TDD RED-GREEN on data layer]
key_files:
  created:
    - src/data/__tests__/achievements.test.js
  modified:
    - src/data/achievements.js
decisions:
  - tier field computed from RARITY_TO_TIER at data-definition time (not runtime)
  - RARITY_TO_TIER: common->Bronze, uncommon->Bronze, rare->Silver, epic->Gold, legendary->Legendary
  - 11 new v12.0 entries added (4 SKILL_TREE, 3 QUIZ, 4 CEFR); total count 263
metrics:
  duration: "<5 minutes"
  completed_date: "2026-03-23"
  tasks_completed: 1
  files_modified: 2
requirements: [ACH-01, ACH-02]
---

# Phase 63 Plan 01: Achievement Tier System + v12.0 Data Layer Summary

**One-liner:** Added TIER/TIER_COLORS/RARITY_TO_TIER constants, tier field on all 263 achievements, 3 new categories (SKILL_TREE/QUIZ/CEFR), and 11 v12.0 entries covering skill tree nodes, quiz streaks, CEFR levels, and placement completion.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 (RED) | Failing tests: 14 data integrity tests | ac6e14f | src/data/__tests__/achievements.test.js |
| 1 (GREEN) | TIER constants + tier fields + new entries | 806feed | src/data/achievements.js |

## What Was Built

### TIER Constants (new exports from achievements.js)

- `TIER`: 4 keys — BRONZE, SILVER, GOLD, LEGENDARY
- `TIER_COLORS`: hex colors for Bronze (#cd7f32), Silver (#c0c0c0), Gold (#FFD700), Legendary (#a855f7)
- `RARITY_TO_TIER`: maps all 5 RARITY values to their corresponding TIER value

### New ACHIEVEMENT_CATEGORIES (3 added, 23 total)

- `SKILL_TREE: 'skill_tree'`
- `QUIZ: 'quiz'`
- `CEFR: 'cefr'`

### Tier Field on All Entries

All 252 existing entries now have `tier: TIER.X` field derived from their `rarity` via RARITY_TO_TIER mapping. The field is set at data-definition time (not computed at runtime).

### New v12.0 Achievements (11 entries, total 263)

**SKILL_TREE category (4):**
- `skill_tree_first_node` — Unlock 1 node (Bronze)
- `skill_tree_10_nodes` — Unlock 10 nodes (Bronze)
- `skill_tree_50_nodes` — Unlock 50 nodes (Silver)
- `skill_tree_reading_complete` — Complete Reading skill tree (Gold)

**QUIZ category (3):**
- `quiz_streak_3` — 3 perfect quizzes in a row (Bronze)
- `quiz_streak_5` — 5 perfect quizzes in a row (Silver)
- `quiz_streak_10` — 10 perfect quizzes in a row (Gold)

**CEFR category (4):**
- `cefr_placement_done` — Complete placement test (Bronze)
- `cefr_reached_a2` — Reach A2 level (Bronze)
- `cefr_reached_b1` — Reach B1 level (Silver)
- `cefr_reached_b2` — Reach B2 level (Gold)

### Test Coverage (14 tests, all pass)

1. ACHIEVEMENTS.length >= 260
2. Every entry has `tier` field
3. Every `tier` value is one of Bronze/Silver/Gold/Legendary
4. TIER has exactly 4 keys
5. TIER_COLORS has all 4 tier entries
6. RARITY_TO_TIER maps all 5 rarity values correctly
7. ACHIEVEMENT_CATEGORIES has SKILL_TREE/QUIZ/CEFR
8-12. New requirement types present: skill_tree_nodes, skill_tree_complete, quiz_type_streak, cefr_level_reached, placement_complete
13. All IDs unique (no duplicates)
14. All entries have 9 required fields (including `tier`)

## Deviations from Plan

None — plan executed exactly as written. TDD RED-GREEN completed in sequence.

## Known Stubs

None. This plan is purely a data layer change. The new requirement types (skill_tree_nodes, skill_tree_complete, quiz_type_streak, cefr_level_reached, placement_complete) are intentionally not yet wired in achievementMiddleware.js — that is scope for a future plan (63-02 or 63-03).

## Self-Check: PASSED

- src/data/__tests__/achievements.test.js: FOUND
- src/data/achievements.js: FOUND (contains TIER, TIER_COLORS, RARITY_TO_TIER, SKILL_TREE, QUIZ, CEFR, tier fields)
- Commits ac6e14f and 806feed: verified via git log
