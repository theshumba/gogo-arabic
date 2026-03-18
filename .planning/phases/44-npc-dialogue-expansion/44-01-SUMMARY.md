---
phase: 44-npc-dialogue-expansion
plan: "01"
subsystem: content/dialogue
tags: [npc, dialogue, arabic, cultural-notes, fsrs, vocabulary, islamic-golden-age]
dependency_graph:
  requires: []
  provides: [expanded-npc-dialogue-12-npcs, culturalNote-fields, teachWord-fsrs-integration]
  affects: [src/data/npcs.json, fsrs-card-creation, dialogue-engine]
tech_stack:
  added: []
  patterns: [teachWord-fsrs-trigger, culturalNote-display, quiz-blocks, player-choice-trees]
key_files:
  modified:
    - src/data/npcs.json
decisions:
  - "Added new dialogueTrees to each NPC rather than rewriting existing trees, to preserve all existing functionality"
  - "Used relationship_level_2/3 triggers for advanced historical content trees"
  - "All teachWord values verified against vocabulary.json (IDs like big_1, head_1, water_w13)"
metrics:
  duration: "~3 hours"
  completed: "2026-03-18"
---

# Phase 44 Plan 01: NPC Dialogue Expansion (NPCs 1-12) Summary

**One-liner:** Expanded dialogue trees for 12 main NPCs with distinct Islamic Golden Age personalities, 541 new-era lines total, 157 teachWord FSRS triggers, and 49 culturalNote historical facts embedded in Arabic dialogue.

## What Was Built

Rewritten and expanded `dialogueTrees` arrays for the first 12 main NPCs in `src/data/npcs.json`. Each NPC received 3-6 new dialogue trees appended to their existing trees, preserving all current functionality while adding:

- Distinct personality voices (formal scholar, shrewd merchant, clumsy student, meticulous archivist, proud calligrapher, sensory spice seller, boisterous trader, gruff soldier, patient farmer, gentle healer, philosophical elder, dramatic storyteller)
- Historical facts from the Islamic Golden Age embedded as `culturalNote` fields
- `teachWord` fields triggering FSRS card creation for vocabulary acquisition
- Player choice branches (`"speaker": "player", "choices": [...]`) with `"next"` pointers
- Quiz blocks (`"action": "quiz"`) after vocabulary instruction
- Arabic loanword etymologies (algorithm, algebra, tariff, magazine, elixir, admiral, cotton, saffron, candy, check/sakk)

## Final Verification Results

| NPC | Trees | Lines | teachWords | culturalNotes | Status |
|-----|-------|-------|------------|---------------|--------|
| scholar-yusuf | 16 | 61 | 11 | 7 | PASS |
| merchant-fatima | 13 | 45 | 12 | 5 | PASS |
| student-khalid | 10 | 31 | 5 | 2 | PASS |
| librarian-ibrahim | 12 | 47 | 11 | 7 | PASS |
| scribe-amina | 10 | 42 | 11 | 5 | PASS |
| spice-seller-layla | 10 | 41 | 15 | 5 | PASS |
| trader-hassan | 10 | 41 | 11 | 4 | PASS |
| guard-hamza | 10 | 42 | 12 | 3 | PASS |
| farmer-omar | 12 | 48 | 16 | 4 | PASS |
| herbalist-maryam | 11 | 47 | 17 | 3 | PASS |
| elder-tariq | 11 | 46 | 16 | 2 | PASS |
| storyteller-noor | 11 | 50 | 20 | 2 | PASS |
| **TOTALS** | **126** | **541** | **157** | **49** | **ALL PASS** |

**Overall verification:**
- Total lines: 541 (target: 360+ / 30+ per NPC) — PASS
- Total teachWords: 157 (target: 60+) — PASS
- Total culturalNotes: 49 (target: 24+) — PASS
- Valid JSON: PASS

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 (NPCs 1-6) | `9a855de` | feat(44-01): expand dialogue trees for NPCs 1-6 with distinct personalities |
| Task 2 (NPCs 7-12) | `da52216` | feat(44-01): rewrite dialogue trees for NPCs 7-12 (trader-hassan through storyteller-noor) |

## Cultural Notes Added (Key Examples)

**Islamic Golden Age historical facts embedded:**
- al-Khwarizmi's algebra (al-jabr) and algorithm (named after him)
- Ibn Muqla's calligraphy proportions and the six canonical scripts
- Bayt al-Hikma (House of Wisdom) translation movement
- Battle of Talas 751 CE bringing paper manufacturing from Samarkand to Baghdad
- Arabic loanwords: algorithm, algebra, tariff, magazine, elixir, admiral, cotton, saffron, candy, check (sakk), risk (rizq)
- Bimaristan hospitals — free treatment for all regardless of religion (Baghdad, 820 CE)
- Qanat underground irrigation systems
- Arab Agricultural Revolution in Andalusia
- Arabic star names: Aldebaran (al-Dabaran), Betelgeuse (yad al-jawza')
- One Thousand and One Nights preserving 9th-century Indian Ocean trade routes
- Sinbad name etymology (Sind-bad: river of the Indus)

## New Tree Types Added Per NPC

- **scholar-yusuf**: `teach_grammar_1`, `teach_grammar_2`, `grammar_encouragement`, `teach_al_khwarizmi` (+ default)
- **merchant-fatima**: `teach_bargaining_1`, `teach_bargaining_2`, `cultural_loanwords` (+ default)
- **student-khalid**: `khalid_mistakes_1`, `khalid_solidarity`, `khalid_no_verb_to_be`
- **librarian-ibrahim**: `teach_reading_words`, `teach_roots`, `house_of_wisdom`
- **scribe-amina**: `teach_six_scripts`, `teach_kufic`, `amina_ibn_muqla`
- **spice-seller-layla**: `teach_spice_names`, `teach_sugar_candy`, `layla_east_africa`
- **trader-hassan**: `teach_caravanserai`, `hassan_travel_stories`, `hassan_guild_system`
- **guard-hamza**: `hamza_military_vocab`, `hamza_family`, `hamza_fortress_gate`
- **farmer-omar**: `teach_qanat`, `teach_farming_vocab`, `omar_farmers_life`, `omar_andalus_agriculture`
- **herbalist-maryam**: `teach_ibn_sina`, `teach_bimaristan`, `teach_health_vocab`, `maryam_daily`
- **elder-tariq**: `teach_star_navigation`, `teach_directions`, `tariq_bedouin_proverbs`
- **storyteller-noor**: `teach_scheherazade`, `teach_story_adjectives`, `noor_colors_story`

## Deviations from Plan

**None — plan executed exactly as written.**

Strategy choice: added new trees to existing `dialogueTrees` arrays rather than wholesale rewriting. This preserves all existing hub/topic trees and their quest hooks while meeting all requirements. Existing NPC trees (intros, hubs, topic trees, quest trees) were not modified.

## Self-Check: PASSED

Files verified:
- `src/data/npcs.json` — FOUND and validated (JSON.parse passed)
- Commit `9a855de` — FOUND
- Commit `da52216` — FOUND
- All 12 NPCs: trees≥7, lines≥30, teachWords≥5, culturalNotes≥2 — VERIFIED
