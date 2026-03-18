---
phase: 45-quest-storylines
plan: "03"
subsystem: content
tags: [quests, inscriptions, learningPath, dialogue, root-families, branching, rpg]

# Dependency graph
requires:
  - phase: 45-quest-storylines plan 01
    provides: 8 act start arcs in npcStoryArcs.js (arc_act_1 through arc_act_8)
  - phase: 45-quest-storylines plan 02
    provides: 12 companion personal_quest trees in npcs.json
provides:
  - 8 hidden inscription interactables in zones.js (type: 'inscription', one per zone)
  - learningPath condition support in DialogueEngine.evaluateCondition + filterLines
  - learningPath registered as valid condition key in dialogueSchema.js
  - 3 learningPath-branched lines per act start arc (24 total variant lines in npcStoryArcs.js)
  - 3 learningPath-branched lines per companion personal_quest tree (36 total variant lines in npcs.json)
affects: [QUEST-04, QUEST-05, zones, DialogueEngine, dialogueSchema, npcStoryArcs, npcs.json]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "inscription interactable type: id, type:'inscription', rootFamily, rootWords[4], descriptionEnglish, descriptionArabic, culturalNote, repeatable:false, stateChange:'discovered'"
    - "learningPath condition: { learningPath: 'scholar'|'traveler'|'historian' } on dialogue lines or choices"
    - "DialogueEngine.filterLines: mirrors getFilteredChoices pattern for line-level condition evaluation"
    - "3-way path branches appended at end of lines array (scholar/traveler/historian), not replacing existing lines"

key-files:
  created: []
  modified:
    - src/data/zones.js
    - src/game/systems/DialogueEngine.js
    - src/data/dialogueSchema.js
    - src/data/npcStoryArcs.js
    - src/data/npcs.json

key-decisions:
  - "rootWords use real vocabulary IDs verified against vocabulary.json — no invented IDs"
  - "filterLines helper added to DialogueEngine following same pattern as getFilteredChoices"
  - "learningPath lines appended at end of lines array (indices 3,4,5) so non-path dialogue still shows for null learningPath"
  - "dialogueSchema uses z.enum for learningPath values to catch invalid path strings at validation time"

patterns-established:
  - "inscription interactable: placed in non-obvious corners (far edges, behind objects), stateChange:'discovered', repeatable:false"
  - "root family naming: Arabic trilateral root format 'ك-ت-ب' with English meaning label"
  - "learningPath variants: always 3 parallel conditional lines (one per path), structurally identical, tone varies"

requirements-completed:
  - QUEST-04
  - QUEST-05

# Metrics
duration: 12min
completed: 2026-03-18
---

# Phase 45 Plan 03: Hidden Inscriptions + Learning Path Branching Summary

**8 root-family inscription interactables placed across all zones + learningPath condition engine + 60 branched dialogue lines across 8 act arcs and 12 companion quests**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-18T13:20:18Z
- **Completed:** 2026-03-18T13:32:03Z
- **Tasks:** 2/2
- **Files modified:** 5

## Accomplishments

### Task 1: Hidden Inscription Interactables (QUEST-04)
- 8 inscription interactables added to all 8 main zones (one per zone), each placed in a non-obvious corner
- Each inscription has: `type: 'inscription'`, `rootFamily` (trilateral Arabic root), `rootWords[4]` (real vocabulary IDs), `descriptionEnglish`, `descriptionArabic`, `culturalNote` (Islamic Golden Age historical context), `repeatable: false`, `stateChange: 'discovered'`
- Root families by zone: ك-ت-ب (oasis — writing), ع-ل-م (library — knowledge), ت-ج-ر (marketplace — trade), ز-ر-ع (farmland — planting), س-ف-ر (bedouin — travel), ش-ف-ي (mountain — healing), ب-ح-ر (port — sea), م-ل-ك (palace — kingdom)
- All rootWords use real vocabulary IDs verified against vocabulary.json (write_1, read_1, learn_1, know_1, price_w31, sea_w23, etc.)

### Task 2: learningPath Condition Support + Dialogue Branches (QUEST-05)
- `DialogueEngine.evaluateCondition`: new block checks `condition.learningPath` against `state.player?.learningPath`
- `DialogueEngine.filterLines`: new helper method mirrors `getFilteredChoices` for line-level condition filtering
- `dialogueSchema.js`: `learningPath: z.enum(['scholar', 'traveler', 'historian']).optional()` added to conditionSchema
- `npcStoryArcs.js`: 3 learningPath-conditional lines added to each of the 8 act start arcs (32 total lines containing "learningPath") — scholarly/academic, practical/journey, and historical/cultural framings
- `npcs.json`: 3 learningPath-conditional lines added to each of the 12 companion personal_quest trees (36 total) — each flavored to match the companion's personality and specialty

## Task Commits

Each task was committed atomically:

1. **Task 1: Add 8 hidden inscription interactables** - `1208041` (feat)
2. **Task 2: learningPath condition + dialogue branches** - `7991ecc` (feat)

## Files Created/Modified

- `src/data/zones.js` — 8 inscription interactables added to all 8 zone interactables arrays
- `src/game/systems/DialogueEngine.js` — learningPath condition block + filterLines helper
- `src/data/dialogueSchema.js` — learningPath enum registered in conditionSchema
- `src/data/npcStoryArcs.js` — 3 learningPath lines × 8 act start arcs = 24 branched variant lines
- `src/data/npcs.json` — 3 learningPath lines × 12 companion personal_quest trees = 36 branched variant lines

## Decisions Made

- **rootWords use real vocabulary IDs:** Plan specified needing to find real matching IDs. All rootWords arrays use verified vocabulary.json IDs (write_1, read_1, learn_1, know_1, price_w31, money_w30, shop_w28, merchant_w44, tree_w27, water_w13, sun_w14, rain_w25, star_w16, moon_w15, desert_w18, camel_1, sea_w23, wind_w26, north_1, fish_animal_1, big_1, old_1, new_1, brave_1).
- **filterLines added to engine:** Plan noted lines may need engine-level filtering (not just choices). Added `filterLines()` as a helper following the exact same pattern as `getFilteredChoices()`.
- **Lines appended at end of existing lines array:** Ensures backward compatibility — null learningPath players still see all lines up to index 2; only players with a set path see the additional variant.

## Deviations from Plan

None — plan executed exactly as written. All 8 inscription placements, rootWord ID lookup, and learningPath branching implemented as specified.

## Issues Encountered

Minor: One arc's exact Arabic text differed slightly from what I initially searched (act_6 used `أُعطيكَ إيَّاها` not `أُعطيكَها`). Resolved by running grep with context to find the exact string before editing.

## Next Phase Readiness

- QUEST-04 COMPLETE: 8 hidden inscriptions with root families and vocabulary links
- QUEST-05 COMPLETE: learningPath condition in engine + 60 branched dialogue lines (24 in story arcs + 36 in companion quests)
- Phase 45 is now fully complete (plans 01, 02, 03 done)
- Ready for Phase 46 (Vocabulary Expansion — vocabularyAll.js to 5,000+ words)

## Self-Check: PASSED

- FOUND: src/data/zones.js (8 inscriptions confirmed by grep -c)
- FOUND: src/game/systems/DialogueEngine.js (condition.learningPath at line 90)
- FOUND: src/data/dialogueSchema.js (learningPath enum)
- FOUND: src/data/npcStoryArcs.js (32 learningPath entries)
- FOUND: src/data/npcs.json (36 learningPath entries)
- FOUND: commit 1208041 (Task 1)
- FOUND: commit 7991ecc (Task 2)
- Build: PASSED (✓ built in 4.04s)

---
*Phase: 45-quest-storylines*
*Completed: 2026-03-18*
