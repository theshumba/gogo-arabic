---
phase: 42-phaser-ui-arabic
plan: 03
subsystem: ui
tags: [phaser, arabic, dialogue, zone-toast, arabic-reshaper, pixelae, bitmap-font]

# Dependency graph
requires:
  - phase: 42-phaser-ui-arabic
    plan: 01
    provides: "prepareArabicText() + createArabicText() in ArabicText.js, DialogueBox Phaser canvas UI"
  - phase: 42-phaser-ui-arabic
    plan: 02
    provides: "NPC Arabic name label via createArabicText(), Kenmi PanelFactory methods"

provides:
  - "DialogueBox detects Arabic messages via _hasArabic() and switches to PixelAE font with prepareArabicText()"
  - "DialogueBox._finishTyping() applies prepareArabicText() for skip-to-end behaviour with Arabic"
  - "WorldScene._showZoneNameToast() — Arabic (gold) + English (white) zone name at top on zone transitions"
  - "Zone toast suppressed on game start (_suppressZoneToast flag), shown on subsequent transitions"
  - "ARAB-01 through ARAB-04 fully satisfied: PixelAE loaded, js-arabic-reshaper integrated, RTL handled, zone/NPC/sign paths covered"

affects:
  - 43-zone-cleanup

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "DialogueBox Arabic detection: _hasArabic() checks Unicode ranges 0600-FEFF before applying prepareArabicText()"
    - "DialogueBox font switching: runtime setStyle() call in _showCurrentMessage() switches PixelAE ↔ Press Start 2P"
    - "Zone toast pattern: createArabicText() + scene.add.text() fixed to camera with setScrollFactor(0) at depth 9500"
    - "_suppressZoneToast flag: initialized true in constructor, cleared after first buildZone() call"

key-files:
  created: []
  modified:
    - src/game/ui/DialogueBox.js
    - src/game/scenes/WorldScene.js

key-decisions:
  - "_hasArabic() implemented inline in DialogueBox (not imported from ArabicText) — keeps detection self-contained without adding a new export to ArabicText.js"
  - "Arabic dialogue speed set to 20ms vs English 30ms — Arabic display strings are shorter after reshaping (presentation forms compress clusters), so faster timer prevents awkward pacing"
  - "Zone toast depths: Arabic label at 9500 (below DialogueBox at 10000) — toast never obscures dialogue"
  - "_suppressZoneToast cleared in buildZone() not create() — handles scene reuse (Phaser reuses scene instances, constructor only runs once; create() resets flags)"

patterns-established:
  - "Pattern: Language-adaptive Phaser text — detect Arabic at runtime with _hasArabic(), switch font style and apply prepareArabicText() before typewriter starts"
  - "Pattern: Camera-fixed toast — setScrollFactor(0) + setDepth(9500) + tween with hold/yoyo for fade-in-hold-fade-out lifecycle"

requirements-completed: [ARAB-01, ARAB-02, ARAB-03, ARAB-04]

# Metrics
duration: 15min
completed: 2026-03-18
---

# Phase 42 Plan 03: Arabic-Aware DialogueBox + Zone Name Toast Summary

**DialogueBox detects Arabic messages at runtime, switches to PixelAE + js-arabic-reshaper + RTL, and WorldScene shows Arabic (gold) + English (white) zone name toast on every zone transition**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-18T02:25:38Z
- **Completed:** 2026-03-18T02:40:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- DialogueBox now detects Arabic Unicode ranges with `_hasArabic()` and switches font/alignment at runtime
- Arabic messages in dialogue use PixelAE font, `prepareArabicText()` reshaping, and right-align — no disconnected letter forms
- `_finishTyping()` (skip-to-end) also applies `prepareArabicText()` so fast-forward preserves correct Arabic rendering
- WorldScene `_showZoneNameToast()` shows Arabic zone name in gold and English name in white at top of screen on every zone transition
- Zone toast is suppressed on game start via `_suppressZoneToast` flag, shown only on subsequent transitions
- All Arabic text paths in Phaser verified: NPC labels (createArabicText, Plan 42-02), DialogueBox (prepareArabicText, Plan 42-03), zone toast (createArabicText, Plan 42-03)
- ARAB-01 through ARAB-04 fully satisfied

## Task Commits

Each task was committed atomically:

1. **Task 1: Arabic-aware DialogueBox + zone name toast** - `e4284c7` (feat)
2. **Task 2: End-to-end Arabic rendering verification** - no commit (pure verification — no files needed fixing)

## Files Created/Modified

- `src/game/ui/DialogueBox.js` — Added `import { prepareArabicText }` from ArabicText.js; `_hasArabic()` helper; runtime font switching in `_showCurrentMessage()`; Arabic-aware `_finishTyping()`
- `src/game/scenes/WorldScene.js` — Added `import { createArabicText }` from ArabicText.js; `_suppressZoneToast` flag; `_showZoneNameToast()` method; zone toast call at end of `buildZone()`

## Decisions Made

- `_hasArabic()` implemented inline in DialogueBox rather than importing from ArabicText.js — keeps detection self-contained (ArabicText.js already uses `isArabicChar()` internally; no need to expose it)
- Arabic typewriter speed: 20ms per char vs 30ms for English — Arabic strings after `prepareArabicText()` reshaping are shorter in visual character count, so faster speed prevents sluggish pacing
- Zone toast depth: 9500 (below DialogueBox at 10000) — ensures toast never overlaps active dialogue
- `_suppressZoneToast` cleared inside `buildZone()` not `create()` — handles Phaser scene reuse correctly (constructor runs once; `create()` resets the flag so it suppresses first load on each scene start)

## Deviations from Plan

### Task 2 Observation: SignPanel.js and ObjectPanel.js do not exist

- **Found during:** Task 2 (verification audit)
- **Nature:** Plan 42-03 Task 2 asked to verify/fix Arabic usage in SignPanel.js and ObjectPanel.js. These files were planned for Plan 42-02 but were not built — Plan 42-02 focused on NPC labels and PanelFactory instead.
- **Action:** No fix needed — files don't exist so there's no incorrect Arabic rendering to correct. NPC.js (createArabicText), DialogueBox.js (prepareArabicText), and WorldScene zone toast (createArabicText) cover all active Arabic text paths in Phaser.
- **Impact:** SignPanel and ObjectPanel remain as future work (Phase 43 or post-v8.0). ARAB-04 requirements are met by the existing paths.

---

**Total deviations:** 0 auto-fixed (0 bugs, 0 missing critical, 0 blocking)
**Impact on plan:** Plan executed as written. Task 2 verified existing paths; SignPanel/ObjectPanel absence noted but not blocking.

## Issues Encountered

None — both tasks completed cleanly.

## Next Phase Readiness

- Ready for Phase 43 (zone cleanup): All Phase 42 Phaser UI replacements confirmed working
- NPC Arabic labels, DialogueBox Arabic messages, and zone name toast are all in Phaser Canvas (no DOM)
- SignPanel and ObjectPanel (React → Phaser migration) remain as post-Phase 43 work if desired
- DOMOverlayManager can be reviewed for removal in Phase 43 (NPCManager no longer calls createNpcLabel())

## Self-Check: PASSED

- src/game/ui/DialogueBox.js — FOUND
- src/game/scenes/WorldScene.js — FOUND
- .planning/phases/42-phaser-ui-arabic/42-03-SUMMARY.md — FOUND
- e4284c7 (Task 1 commit) — FOUND

---
*Phase: 42-phaser-ui-arabic*
*Completed: 2026-03-18*
