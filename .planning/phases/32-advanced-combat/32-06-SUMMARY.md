---
phase: 32-advanced-combat
plan: 06
subsystem: ui, battle
tags: [grammar-combos, battle-items, target-selector, flee-mode, react, css-modules, rtl, arabic]

# Dependency graph
requires:
  - phase: 32-02
    provides: "grammarCombos.js with NOUN_ADJ_COMBOS, VERB_CHAIN_PATTERNS, SENTENCE_TEMPLATES"
  - phase: 32-04
    provides: "battleSlice enemies[] array, selectEnemies, selectActiveEnemies selectors"
  - phase: 29-equipment
    provides: "inventorySlice with selectInventoryItems, EQUIPMENT_DATA"
provides:
  - "GrammarComboInput component with 3 combo modes (noun_adj, verb_chain, sentence)"
  - "BattleItemMenu component for consumable item usage during combat"
  - "TargetSelector component for multi-enemy target selection with row damage preview"
  - "BattleArabicInput flee mode (mode prop, 10s timer, flee header)"
affects: [32-07, 32-08, 32-09, 32-10, 32-11]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Multi-step grammar input: mode-specific sub-components (NounAdjMode, VerbChainMode, SentenceMode) within unified container"
    - "Field accuracy via Levenshtein distance with diacritic stripping"
    - "Keyboard shortcuts: 1-9 quick select in BattleItemMenu, arrow keys in TargetSelector"
    - "isBattleUsable() filter function — extensible for future consumable items"

key-files:
  created:
    - src/components/Battle/GrammarComboInput.jsx
    - src/components/Battle/GrammarComboInput.module.css
    - src/components/Battle/BattleItemMenu.jsx
    - src/components/Battle/BattleItemMenu.module.css
    - src/components/Battle/TargetSelector.jsx
    - src/components/Battle/TargetSelector.module.css
  modified:
    - src/components/Battle/BattleArabicInput.jsx

key-decisions:
  - "GrammarComboInput uses internal sub-components per mode rather than separate files — keeps related logic co-located"
  - "BattleItemMenu filters via isBattleUsable() function — currently checks usableInBattle flag, extensible when consumable data is added"
  - "TargetSelector uses double-click for immediate confirm, single-click for select — follows common targeting UX"
  - "Flee mode adds 3 changes to BattleArabicInput: mode prop, 10s timer, and red header text"

patterns-established:
  - "Grammar combo accuracy: Levenshtein distance with Arabic diacritic stripping for partial credit"
  - "Verb chain cumulative multiplier: each correct form multiplies base damage, incorrect = 1.0x for that link"
  - "Sentence mode accepts alternatives per slot for flexible Arabic expression"
  - "Row damage modifier preview in TargetSelector: Front 100%, Back 80%"

# Metrics
duration: 4min
completed: 2026-02-13
---

# Phase 32 Plan 06: Battle UI Components Summary

**GrammarComboInput with 3 multi-step Arabic input modes, BattleItemMenu for inventory consumables, TargetSelector for multi-enemy targeting, and flee mode on BattleArabicInput**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-13T15:41:27Z
- **Completed:** 2026-02-13T15:45:57Z
- **Tasks:** 2
- **Files created:** 6, modified: 1

## Accomplishments

- GrammarComboInput supports noun+adj (2 fields, 20s), verb_chain (sequential forms with chain display, 30s), and sentence (3 VSO fields, 45s) modes with per-field accuracy calculation
- BattleItemMenu reads Redux inventory, filters battle-usable items, displays Arabic names with quantity badges and keyboard shortcuts 1-9
- TargetSelector shows enemy list with HP bars, front/back row badges, row damage modifier preview, arrow key navigation
- BattleArabicInput gains mode prop for flee challenges: 10s timer, red Arabic header

## Task Commits

Each task was committed atomically:

1. **Task 1: Create GrammarComboInput component** - `bdaaf36` (feat)
2. **Task 2: Create BattleItemMenu and TargetSelector components** - `f6458f4` (feat)

## Files Created/Modified

- `src/components/Battle/GrammarComboInput.jsx` - Multi-step grammar combo input with NounAdjMode, VerbChainMode, SentenceMode sub-components
- `src/components/Battle/GrammarComboInput.module.css` - RTL layout, timer bar, chain progress, sentence slots grid
- `src/components/Battle/BattleItemMenu.jsx` - Inventory consumable selection during combat with Redux integration
- `src/components/Battle/BattleItemMenu.module.css` - Dark panel, scrollable list, quantity badges, shortcut keys
- `src/components/Battle/TargetSelector.jsx` - Multi-enemy target selection with HP bars, row indicators, damage preview
- `src/components/Battle/TargetSelector.module.css` - Enemy list with row badges, selected highlight, damage preview
- `src/components/Battle/BattleArabicInput.jsx` - Added mode prop, flee timer (10s), flee header text

## Decisions Made

- **Sub-component architecture for GrammarComboInput:** Rather than 3 separate files, each mode (NounAdjMode, VerbChainMode, SentenceMode) is a private sub-component within GrammarComboInput.jsx. This keeps related grammar input logic co-located while maintaining separation of concerns.
- **isBattleUsable() extensibility:** No items currently have `usableInBattle: true` in EQUIPMENT_DATA. The function checks for this flag and will work automatically when consumable items are added. Empty state ("No items") displays gracefully.
- **TargetSelector double-click UX:** Single click selects (highlights), double click confirms. Keyboard: arrows navigate, Enter confirms. Matches common RPG targeting patterns.
- **Flee mode minimal changes:** Only 3 modifications to BattleArabicInput: mode prop default 'attack', timerDuration conditional (10s vs 15s), and a red Arabic header for flee challenges.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- GrammarComboInput ready for integration with BattleOverlay grammar combo flow (32-07, 32-08)
- BattleItemMenu ready for consumable item data when added (currently shows empty state gracefully)
- TargetSelector ready for BattleStateMachine multi-target integration (32-07)
- BattleArabicInput flee mode ready for BATTLE_FLEE_CHALLENGE event handling (32-07, 32-08)
- All components use consistent patterns: CSS Modules, Framer Motion, reduced-motion support, RTL layout

## Self-Check: PASSED

- FOUND: src/components/Battle/GrammarComboInput.jsx
- FOUND: src/components/Battle/GrammarComboInput.module.css
- FOUND: src/components/Battle/BattleItemMenu.jsx
- FOUND: src/components/Battle/BattleItemMenu.module.css
- FOUND: src/components/Battle/TargetSelector.jsx
- FOUND: src/components/Battle/TargetSelector.module.css
- FOUND: src/components/Battle/BattleArabicInput.jsx (modified)
- FOUND: commit bdaaf36 (Task 1)
- FOUND: commit f6458f4 (Task 2)
- Build: succeeds

---
*Phase: 32-advanced-combat*
*Completed: 2026-02-13*
