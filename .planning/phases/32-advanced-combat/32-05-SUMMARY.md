---
phase: 32-advanced-combat
plan: 05
subsystem: ui, battle
tags: [status-effects, combo-meter, arabic-numerals, framer-motion, css-modules, battle-ui]

# Dependency graph
requires:
  - phase: 32-01
    provides: "24 status effects, COMPOUND_EFFECTS, getStatusEffect() lookup"
  - phase: 32-03
    provides: "GrammarComboDetector, CompoundEffectResolver"
  - phase: 32-04
    provides: "battleSlice comboMeter, grammarComboState, playerEffects, enemyEffects selectors"
provides:
  - "StatusEffectBar component displaying active effects with Arabic names, buff/debuff/compound styling"
  - "ComboMeter component with vertical gauge, Arabic-Indic numerals, grammar combo type indicator"
  - "toArabicNumerals() inline helper for Western-to-Arabic digit conversion"
affects: [32-06, 32-07, 32-08, 32-09, 32-10, 32-11]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS Modules for battle UI components (.module.css)"
    - "Compound effect lookup via COMPOUND_EFFECTS Set for O(1) category detection"
    - "Arabic-Indic numeral display in battle UI (toArabicNumerals)"
    - "StatusEffectBar tooltip pattern: hover state reveals Arabic/transliteration/English/description"

key-files:
  created:
    - "src/components/Battle/StatusEffectBar.jsx"
    - "src/components/Battle/StatusEffectBar.module.css"
    - "src/components/Battle/ComboMeter.jsx"
    - "src/components/Battle/ComboMeter.module.css"
  modified: []

key-decisions:
  - "Amiri font for Arabic labels (12px in icons, 16px in tooltips) — matches existing battle Arabic styling"
  - "3-char truncation for icon Arabic labels — fits 36x36 icon size, full name in tooltip"
  - "ComboMeter hidden when comboMeter=0 and no active grammar combo — avoids visual clutter"

patterns-established:
  - "StatusEffectBar receives effects array as prop, looks up data from statusEffects.js — presentational component"
  - "ComboMeter uses inline toArabicNumerals helper — no shared utility needed yet"
  - "Both components use CSS variable tokens from variables.css, not hardcoded colors"

# Metrics
duration: 3min
completed: 2026-02-13
---

# Phase 32 Plan 05: Battle Effect & Combo UI Summary

**StatusEffectBar with Arabic effect labels, buff/debuff/compound styling, and ComboMeter with Arabic-Indic numerals and grammar combo type indicators**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-13T15:41:17Z
- **Completed:** 2026-02-13T15:44:20Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created StatusEffectBar component with horizontal RTL icon row, gold/red/purple borders for buff/debuff/compound effects, hover tooltips with full Arabic vocabulary info, and overflow badge
- Created ComboMeter component with vertical gauge bar, 4-tier color gradient, Arabic-Indic numeral display, grammar combo type labels, and ready-state pulse animation
- Both components use Framer Motion with prefers-reduced-motion fallback and CSS Modules following project patterns

## Task Commits

Each task was committed atomically:

1. **Task 1: Create StatusEffectBar component** - `d6dd048` (feat)
2. **Task 2: Create ComboMeter component** - `3ccf851` (feat)

## Files Created/Modified

- `src/components/Battle/StatusEffectBar.jsx` - Active status effect display with Arabic labels, tooltip, overflow badge (120 LOC)
- `src/components/Battle/StatusEffectBar.module.css` - CSS Module with buff/debuff/compound styling, tooltip layout (130 LOC)
- `src/components/Battle/ComboMeter.jsx` - Combo charge gauge with Arabic numerals, grammar combo indicators (112 LOC)
- `src/components/Battle/ComboMeter.module.css` - CSS Module with 4-tier gauge colors, ready pulse animation (118 LOC)

## Decisions Made

- **Amiri font for icon Arabic labels:** Plan specified Amiri 12px which matches the existing ComboCounter Arabic label styling. Used for consistency.
- **3-character truncation in icons:** Arabic effect names are often 4-6 characters which overflow the 36x36 icon. Truncating to 3 chars with full name in tooltip provides readable icon + full info on hover.
- **ComboMeter visibility threshold:** Component returns null when comboMeter is 0 and no grammarComboState is active. This avoids visual clutter during normal turns before any combo activity starts.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- StatusEffectBar ready for integration into BattleOverlay (32-06 or later integration plan)
- ComboMeter ready for integration alongside combo gauge fill logic in BattleTurnManager
- Both components are presentational — accept props, no Redux coupling — easy to wire from parent
- Build succeeds, all existing tests pass

## Self-Check: PASSED

All files verified present. All commit hashes found in git log.

---
*Phase: 32-advanced-combat*
*Completed: 2026-02-13*
