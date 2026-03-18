---
phase: 42-phaser-ui-arabic
plan: 02
subsystem: ui
tags: [phaser, arabic, npc, nineslice, kenmi, dom-overlay-removal]

# Dependency graph
requires:
  - phase: 42-phaser-ui-arabic
    plan: 01
    provides: "createArabicText() + prepareArabicText() in ArabicText.js, NPC Phaser hint sprite"

provides:
  - "NPC Arabic name label rendered as Phaser text sprite via createArabicText()"
  - "domOverlay.createNpcLabel() removed from NPCManager — DOM NPC labels gone"
  - "PanelFactory.createKenmiPanel() + createKenmiTooltipPanel() using Kenmi UI frames"
  - "'kenmi' preset in NineSlice.js PANEL_PRESETS pointing to kenmi-ui-frames-sheet"
  - "UI-07 compliance comment in PanelFactory documenting React/Phaser boundary"

affects:
  - 42-phaser-ui-arabic
  - 43-zone-cleanup

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "NPC Arabic label: createArabicText() at y-70, depth 9999, gold (#d4a843) — tracks NPC in setInteractionHint()"
    - "Kenmi NineSlice preset: kenmi-ui-frames-sheet at cornerSize 6 (48x48 source, ~6px border)"
    - "PanelFactory static method pattern extended with Kenmi panel presets at depth 10000/10100"

key-files:
  created: []
  modified:
    - src/game/sprites/NPC.js
    - src/game/systems/NPCManager.js
    - src/game/ui/PanelFactory.js
    - src/game/ui/NineSlice.js

key-decisions:
  - "arabicNameLabel positioned at y-70 (above English nameLabel at y-56) to stack labels cleanly"
  - "arabicNameLabel uses null guard (only created when nameArabic is truthy) — safe for NPCs without Arabic names"
  - "NineSlice.js kenmi preset texture key is 'kenmi-ui-frames-sheet' — requires spritesheet registration in BootScene (Plan 42-03)"
  - "UI-07 boundary documented in code comment inside PanelFactory.js for future maintainers"

patterns-established:
  - "Pattern: DOM overlay label removal — stop calling domOverlay.createNpcLabel(), add Phaser text to NPC sprite instead"
  - "Pattern: Kenmi panel creation — use PanelFactory.createKenmiPanel() with preset 'kenmi' for in-game Phaser panels"

requirements-completed: [UI-02, UI-04, UI-05, UI-07]

# Metrics
duration: 12min
completed: 2026-03-18
---

# Phase 42 Plan 02: NPC Arabic Labels + Kenmi PanelFactory Summary

**NPC Arabic name labels migrated from DOM overlay to Phaser createArabicText() sprites, domOverlay.createNpcLabel() removed, and PanelFactory extended with Kenmi-themed panel creation methods**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-18T00:00:00Z
- **Completed:** 2026-03-18T00:12:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- NPC Arabic name label now rendered as Phaser text at y-70 via createArabicText() — in canvas, camera-correct, no DOM sync
- domOverlay.createNpcLabel() call removed from NPCManager.create() — no more DOM divs per NPC
- PanelFactory gets createKenmiPanel() and createKenmiTooltipPanel() for Kenmi-styled in-game panels
- 'kenmi' preset added to PANEL_PRESETS in NineSlice.js (kenmi-ui-frames-sheet, cornerSize 6)
- UI-07 compliance documented in PanelFactory — React overlay boundaries clearly stated for future maintainers

## Task Commits

Each task was committed atomically:

1. **Task 1: NPC Arabic name label + remove DOM overlay label** - `97ee482` (feat)
2. **Task 2: Kenmi PanelFactory methods + UI-07 compliance** - `ce6d5dc` (feat)

## Files Created/Modified
- `src/game/sprites/NPC.js` — Imports createArabicText; constructor accepts nameArabic; arabicNameLabel Phaser text at y-70; position tracking in setInteractionHint(); cleanup in destroy()
- `src/game/systems/NPCManager.js` — Passes cfg.nameArabic to NPC constructor; domOverlay.createNpcLabel() call removed
- `src/game/ui/NineSlice.js` — Added 'kenmi' preset to PANEL_PRESETS (kenmi-ui-frames-sheet, cornerSize 6)
- `src/game/ui/PanelFactory.js` — Added createKenmiPanel() at depth 10000, createKenmiTooltipPanel() at depth 10100, UI-07 compliance comment

## Decisions Made
- arabicNameLabel positioned at y-70 (vs English nameLabel at y-56) — 14px gap cleanly stacks the two labels
- `arabicNameLabel` is null when `nameArabic` is falsy — safe for any NPC config that doesn't have an Arabic name
- kenmi PANEL_PRESET points to `kenmi-ui-frames-sheet` — this key requires BootScene to register the Kenmi frames spritesheet; Plan 42-03 handles that wiring
- UI-07 comment placed at end of PanelFactory.js as a zone comment (not JSDoc) — makes the boundary immediately visible to any dev editing this file

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added 'kenmi' preset to NineSlice.js PANEL_PRESETS**
- **Found during:** Task 2 (PanelFactory Kenmi methods)
- **Issue:** Plan specified `preset: 'kenmi'` in PanelFactory methods, but 'kenmi' was not in PANEL_PRESETS — UIPanel would fall back to 'dark' silently, defeating the purpose
- **Fix:** Added `kenmi: { texture: 'kenmi-ui-frames-sheet', cornerSize: 6 }` to PANEL_PRESETS
- **Files modified:** `src/game/ui/NineSlice.js`
- **Verification:** Build passes; UIPanel will correctly resolve texture key for Kenmi panels
- **Committed in:** ce6d5dc (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Essential fix — without it, createKenmiPanel() would silently use 'dark' texture instead of Kenmi frames. No scope creep.

## Issues Encountered
None — both tasks completed cleanly.

## Next Phase Readiness
- Ready for Plan 42-03: BootScene must register kenmi-ui-frames-sheet as a spritesheet (required by the kenmi PANEL_PRESET); then SignPanel + ObjectPanel can use Kenmi NineSlice panels
- NPC Arabic labels now visible in all zones with NPCs that have nameArabic fields in zones.js
- React overlays (HUD, menu, settings, profile, wardrobe) confirmed untouched per UI-07

---
*Phase: 42-phaser-ui-arabic*
*Completed: 2026-03-18*
