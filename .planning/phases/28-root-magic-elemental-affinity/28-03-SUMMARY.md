---
phase: 28-root-magic-elemental-affinity
plan: 03
subsystem: magic
tags: [react, ui, vfx, spell-hotbar, spell-menu, toast-notifications, arabic-calligraphy]

# Dependency graph
requires:
  - phase: 28-01
    provides: magicSlice with selectors (selectEquippedSpells, selectAffinity), spellData.js, ELEMENT_INFO, MAGIC_* events
provides:
  - MagicOverlay: 6-slot spell hotbar with MP bar and affinity indicator during player turn
  - SpellMenu: full spell list with element filtering, mastery indicators, and hotbar assignment
  - RootDiscoveryToast: animated toast notifications for root discovery, level-up, and form unlock
  - playSpellEffect and playComboEffect methods in BattleEffectManager for spell VFX
  - MAGIC_VFX_START and MAGIC_COMBO_TRIGGERED event wiring in BattleScene
affects: [28-02-phaser-managers, 28-04-integration, 29-equipment-inventory]

# Tech tracking
tech-stack:
  added: []
  patterns: [inline-styles, framer-motion-animations, eventbus-cleanup, element-colored-ui, arabic-typography]

key-files:
  created:
    - src/components/Magic/MagicOverlay.jsx
    - src/components/Magic/SpellMenu.jsx
    - src/components/Magic/RootDiscoveryToast.jsx
  modified:
    - src/components/Router/GameLayout.jsx
    - src/game/systems/battle/BattleEffectManager.js
    - src/game/scenes/BattleScene.js

key-decisions:
  - "MP bar uses color gradient: green (>50%), yellow (20-50%), red (<20%)"
  - "Spell hotbar only visible during player turn (useSelector state.battle.currentTurn === 'player')"
  - "SpellMenu uses click-to-assign pattern: click slot then click spell, or auto-assign to next empty"
  - "Arabic calligraphy VFX: 32px root text floats up 50px over 800ms with element color"
  - "Combo VFX enhanced: 2x particle count, 1.5x duration, 48px combo name text"
  - "All 10 elements have distinct particle configs (tint, speed, lifespan, gravity, count, screen flash)"

patterns-established:
  - "React overlays follow BattleOverlay pattern: AnimatePresence, motion.div, inline styles, EventBus cleanup"
  - "Element filtering in SpellMenu uses ELEMENT_ORDER array for consistent tab ordering"
  - "Toast queue pattern: useState queue + currentToast, process one at a time with 3-second auto-dismiss"
  - "VFX methods emit SFX_CORRECT event for successful spell cast audio feedback"

# Metrics
duration: 9min
completed: 2026-02-12
---

# Phase 28 Plan 03: Magic UI & VFX Summary

**React spell hotbar with 6-slot MP system, full spell menu with element filtering, animated root discovery toasts, and Arabic calligraphy spell VFX for all 10 elements**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-12T17:12:42Z
- **Completed:** 2026-02-12T17:21:51Z
- **Tasks:** 2
- **Files modified:** 6 (3 created, 3 modified)

## Accomplishments

- MagicOverlay shows 6-slot hotbar with spell icons, MP bar, and affinity indicator during player turn
- SpellMenu provides full spell list with element filters (10 elements + "All"), mastery indicators, and hotbar assignment
- RootDiscoveryToast shows animated notifications for root discovery, level-up, and form unlock events
- BattleEffectManager extended with playSpellEffect (Arabic calligraphy + element particles) and playComboEffect (enhanced VFX)
- BattleScene wired to respond to MAGIC_VFX_START and MAGIC_COMBO_TRIGGERED events

## Task Commits

Each task was committed atomically:

1. **Task 1: Create MagicOverlay, SpellMenu, and RootDiscoveryToast React components** - `fea9851` (feat)
2. **Task 2: Extend BattleEffectManager with spell VFX and wire BattleScene** - `95d632d` (feat)

## Files Created/Modified

**Created:**
- `src/components/Magic/MagicOverlay.jsx` - 6-slot spell hotbar with MP bar, affinity indicator, right-click menu trigger
- `src/components/Magic/SpellMenu.jsx` - Full spell list with element filtering, mastery XP bars, hotbar assignment
- `src/components/Magic/RootDiscoveryToast.jsx` - Animated toast queue for magic events (discovered, levelup, form)

**Modified:**
- `src/components/Router/GameLayout.jsx` - Added MagicOverlay, SpellMenu, and RootDiscoveryToast to overlay stack
- `src/game/systems/battle/BattleEffectManager.js` - Added playSpellEffect and playComboEffect methods
- `src/game/scenes/BattleScene.js` - Wired MAGIC_VFX_START and MAGIC_COMBO_TRIGGERED event listeners

## Decisions Made

**MagicOverlay:**
- Only visible during player turn (useSelector state.battle.currentTurn === 'player')
- MP bar color gradient: green (>50%), yellow (20-50%), red (<20%)
- Flash spell slot on MAGIC_CAST_COMPLETE, shake MP bar on MAGIC_MP_DEPLETED
- Right-click any spell to open SpellMenu (onContextMenu event)

**SpellMenu:**
- Element filter tabs ordered consistently via ELEMENT_ORDER array
- Click-to-assign pattern: click slot then click spell, or auto-assign to next empty slot
- Click occupied slot to unequip
- Spell cards show root in Arabic (24px), English + Arabic name, level + XP bar, form + MP cost
- Locked spells (form not unlocked) shown grayed with "Requires Form X" message

**RootDiscoveryToast:**
- Queue pattern: multiple events can fire in quick succession, shown one at a time
- 3-second auto-dismiss with slideDown + fadeOut animation
- Position: top-center (z-index 600, above game but below modals)
- Element-colored left border (8px) for visual element association

**BattleEffectManager VFX:**
- playSpellEffect: Arabic root text (32px Amiri) floats up 50px over 800ms, fades to 0 alpha
- Particle config per element: tint, speed, lifespan, scale, gravity, count, screen flash
- playComboEffect: 2x particle count, 1.5x duration, 48px combo name text in Arabic
- Screen flash color matches element (or gold for combos)
- SFX_CORRECT event emitted on successful spell cast

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 04 (Integration & Testing) and Plan 05 (Documentation):**
- ✓ MagicOverlay renders 6-slot hotbar with MP bar
- ✓ SpellMenu provides element filtering for all 10 elements + "All"
- ✓ RootDiscoveryToast listens for 3 magic events (discovered, level-up, form-unlocked)
- ✓ BattleEffectManager has playSpellEffect and playComboEffect methods
- ✓ BattleScene wired with MAGIC_VFX_START and MAGIC_COMBO_TRIGGERED listeners
- ✓ All components follow existing codebase patterns (inline styles, Framer Motion, EventBus cleanup)
- ✓ All 10 element types have distinct visual treatments via ELEMENT_CONFIGS

**Blockers:** None.

**Verification:**
- ✓ `npx vite build` succeeds
- ✓ MagicOverlay.jsx, SpellMenu.jsx, RootDiscoveryToast.jsx export default
- ✓ All three components use EVENTS.MAGIC_* constants
- ✓ BattleEffectManager.js has playSpellEffect and playComboEffect methods
- ✓ BattleScene.js has MAGIC_VFX_START and MAGIC_COMBO_TRIGGERED listeners
- ✓ GameLayout.jsx renders MagicOverlay, SpellMenu, and RootDiscoveryToast
- ✓ Main bundle: 527.91 KB (144.96 KB gzipped, under 500 KB limit)

---
*Phase: 28-root-magic-elemental-affinity*
*Completed: 2026-02-12*

## Self-Check: PASSED

All created files exist on disk:
- ✓ src/components/Magic/MagicOverlay.jsx
- ✓ src/components/Magic/SpellMenu.jsx
- ✓ src/components/Magic/RootDiscoveryToast.jsx

All commits exist in git log:
- ✓ fea9851 (Task 1: MagicOverlay, SpellMenu, RootDiscoveryToast)
- ✓ 95d632d (Task 2: BattleEffectManager spell VFX, BattleScene wiring)
