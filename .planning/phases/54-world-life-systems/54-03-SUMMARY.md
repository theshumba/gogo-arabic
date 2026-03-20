---
phase: 54
plan: 03
subsystem: world-environment
tags: [inscriptions, fsrs, ink, vocabulary-gating, environmental-arabic]
dependency_graph:
  requires:
    - 51-01 (InkDialogueEngine adapter)
    - 51-02 (companion dialogue)
    - 52-01 (vocabulary expansion)
    - 54-01 (economy)
    - 54-02 (factions)
  provides:
    - 24 interactive inscriptions across all 8 zones
    - vocabulary-gated comprehension tiers via ink
    - FSRS queue seeding from inscription encounters
    - root family display in ObjectInteractionOverlay
  affects:
    - InteractableManager (inscription in WORLD_OBJECT_TYPES)
    - useObjectEvents (async ink routing)
    - ObjectInteractionOverlay (FSRS dispatch + inscription render)
    - InkDialogueEngine (2 new EXTERNAL bindings)
tech_stack:
  added:
    - 5 ink inscription source files (inscription-oasis/library/marketplace/camp/palace)
    - 5 compiled .ink.json files
    - inscriptionData.js (16 new inscription content definitions)
  patterns:
    - Vocabulary-gated ink comprehension tiers (full/partial/none)
    - Async ink routing in useObjectEvents before standard overlay
    - FSRS card seeding from inscription encounter (useEffect in overlay)
    - Root family batch-dispatch capped at 5 cards
key_files:
  created:
    - src/data/inscriptionData.js
    - src/data/ink-source/inscription-oasis.ink
    - src/data/ink-source/inscription-library.ink
    - src/data/ink-source/inscription-marketplace.ink
    - src/data/ink-source/inscription-camp.ink
    - src/data/ink-source/inscription-palace.ink
    - src/data/ink/inscription-oasis.ink.json
    - src/data/ink/inscription-library.ink.json
    - src/data/ink/inscription-marketplace.ink.json
    - src/data/ink/inscription-camp.ink.json
    - src/data/ink/inscription-palace.ink.json
  modified:
    - src/data/zones.js (16 new inscription interactables, 2 per zone)
    - src/data/worldStateKeys.js (16 new INSCRIPTION_*_DISCOVERED keys)
    - src/game/systems/InteractableManager.js (inscription in WORLD_OBJECT_SPRITES, rootFamily payload)
    - src/hooks/useObjectEvents.js (async ink routing for useInk inscriptions)
    - src/components/World/ObjectInteractionOverlay.jsx (FSRS dispatch + inscription + root family render)
    - src/components/World/ObjectInteractionOverlay.module.css (5 new CSS classes)
    - src/game/systems/InkDialogueEngine.js (getVocabMastery + addFsrsCardFromInk EXTERNAL bindings)
decisions:
  - "inscription type auto-fixed into WORLD_OBJECT_TYPES via WORLD_OBJECT_SPRITES key addition (Rule 2)"
  - "useObjectEvents handles async ink routing (not InteractableManager) — same pattern as useTutorialTrigger"
  - "Ink conditional syntax: separate {cond: -> knot} blocks not inline multi-branch (inkjs compiler requirement)"
  - "loadForNpc(inkFile) reused for inscription ink files — same ../data/ink/{id}.ink.json path pattern"
  - "FSRS root family words capped at 5 to avoid overwhelming the review queue"
metrics:
  duration: "~90 minutes"
  completed_date: "2026-03-20"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 54 Plan 03: Environmental Inscriptions Summary

**One-liner:** 24 environmental Arabic inscriptions across all 8 zones with FSRS queue seeding, root family display, and 5 vocabulary-gated ink comprehension dialogues using full/partial/none tiers.

## What Was Built

### Task 1 — Data files (commit 58d32ae)

- **`src/data/inscriptionData.js`** — 16 new inscription content definitions keyed by inscription ID. Each entry has: `arabicText`, `englishTranslation`, `wordIds`, `rootFamily`, `rootFamilyEnglish`, `culturalNote`, `cefrLevel`, `useInk`. Exactly 5 entries have `useInk: true` (oasis-2, library-2, marketplace-2, camp-2, palace-2).

- **`src/data/zones.js`** — 16 new inscription objects added across all 8 zones (2 per zone), joining the existing inscription-*-1 objects for 3 total inscriptions per zone. The 5 ink-gated inscriptions have `useInk: true` and `inkFile` set to the corresponding ink story ID.

- **`src/data/worldStateKeys.js`** — 16 new `INSCRIPTION_*_DISCOVERED` keys added (2 per zone), following the `{zone}_{action}_{target}` convention. Keys: `OASIS_INSCRIPTION_OASIS_2_DISCOVERED`, `OASIS_INSCRIPTION_OASIS_3_DISCOVERED`, and equivalents for all 8 zones.

### Task 2 — Wiring and ink files (commit 6ef5b76)

**InteractableManager:**
- Added `inscription: 'kenmi-desert-temple-desert-obelisk-small-2'` to `WORLD_OBJECT_SPRITES`, making `inscription` automatically included in `WORLD_OBJECT_TYPES`
- `handleWorldObject` now emits `rootFamily`, `rootFamilyEnglish`, `rootWords`, `useInk`, and `inkFile` fields in `OBJECT_INTERACT` payload

**useObjectEvents:**
- `handleObjectInteract` made async
- Routes `useInk: true` inscriptions through `InkDialogueEngine.loadForNpc(inkFile)` before the standard overlay
- On successful ink load: dispatches `setWorldObjectState`, emits `INK_DIALOGUE_START` with `{engine, npcData}`, and returns early
- Falls through to standard `ObjectInteractionOverlay` if ink file not found

**ObjectInteractionOverlay:**
- `useEffect` on `data` dispatches unknown inscription `wordIds` to FSRS queue via `addFsrsCard` (ENVR-03)
- If `data.rootFamily` set, batch-dispatches up to 5 root family words from `getRootWords()` (ENVR-04)
- Renders `TashkeelText` for inscription Arabic text (progressive diacritics based on FSRS reps)
- Renders root family display (Arabic root + English gloss)

**InkDialogueEngine:**
- Bound `getVocabMastery(wordId)` — returns 1 if player has reps > 0 for that word, else 0
- Bound `addFsrsCardFromInk(wordId, source)` — dispatches new FSRS card only if word not already known

**5 ink inscription files (ENVR-02):**
All follow the same pattern:
1. Declare `EXTERNAL getVocabMastery(wordId)` and `EXTERNAL addFsrsCardFromInk(wordId, source)`
2. Check mastery for each of the inscription's `wordIds`
3. Sum to a `comprehension_score`
4. Route to `tier_full` (score ≥ 3), `tier_partial` (score ≥ 1), or `tier_none`
5. Each tier has 2 player response choices, each calling `addFsrsCardFromInk` to seed cards

| File | Zone | Root | CEFR |
|------|------|------|------|
| inscription-oasis.ink | Oasis Village | س-ل-م peace | A1 |
| inscription-library.ink | Ancient Library | ق-ر-أ reading | A1 |
| inscription-marketplace.ink | Desert Marketplace | ب-ي-ع selling | A2 |
| inscription-camp.ink | Bedouin Camp | س-ف-ر travel | B1 |
| inscription-palace.ink | Royal Palace | ح-ك-م ruling | B2 |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] `inscription` type not in `WORLD_OBJECT_TYPES`**
- **Found during:** Task 2, verifying InteractableManager payload
- **Issue:** `inscription` was not in `WORLD_OBJECT_SPRITES` or `WORLD_OBJECT_TYPES`, so inscription objects were silently ignored in `handleInteractable()` — they would never fire `OBJECT_INTERACT`
- **Fix:** Added `inscription: 'kenmi-desert-temple-desert-obelisk-small-2'` to `WORLD_OBJECT_SPRITES`. Since `WORLD_OBJECT_TYPES = new Set(Object.keys(WORLD_OBJECT_SPRITES))`, inscription was automatically included in the set.
- **Files modified:** `src/game/systems/InteractableManager.js`
- **Commit:** 6ef5b76

**2. [Rule 1 - Bug] ink multi-branch conditional syntax incompatible with inkjs compiler**
- **Found during:** Task 2, `npm run ink:compile`
- **Issue:** Used `{cond: ... - cond2: ... - else: ...}` inline multi-branch syntax for divert routing. inkjs Compiler throws: "Expected an '- else:' clause here rather than an extra condition"
- **Fix:** Rewrote all 5 ink files to use separate `{cond: -> knot}` blocks followed by unconditional divert for the else case
- **Files modified:** All 5 inscription ink source files
- **Commit:** 6ef5b76

## Self-Check: PASSED

All key files exist and both task commits are present in git history:
- `src/data/inscriptionData.js` — FOUND
- `src/data/ink-source/inscription-oasis.ink` — FOUND
- `src/data/ink/inscription-palace.ink.json` — FOUND
- commit 58d32ae — FOUND
- commit 6ef5b76 — FOUND
