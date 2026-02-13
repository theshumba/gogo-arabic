---
phase: 31-crafting-professions
plan: 06
subsystem: ui
tags: [react, css-modules, framer-motion, crafting-minigames, arabic-vocabulary]

# Dependency graph
requires:
  - phase: 31-02
    provides: craftingLogic.js functions (calculateCraftQuality, calculateXPGain)
  - phase: 31-04
    provides: Crafting UI patterns (RecipeBook, ProfessionPanel, IngredientSelector)
provides:
  - PlantIdentification mini-game (Herbalist)
  - PatternMatching mini-game (Weaver)
  - DirectionalPlacement mini-game (Builder)
  - Complete CraftingMiniGame router with all 6 mini-games
affects: [31-07, 31-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - CSS-based mini-games (no Canvas)
    - Multiple-choice with Arabic/English dual display
    - Grid-based pattern memory
    - Spatial placement with directional instructions
    - Difficulty scaling by profession level
    - Accuracy-based scoring (0-1 float)

key-files:
  created:
    - src/components/Crafting/minigames/PlantIdentification.jsx (361 lines)
    - src/components/Crafting/minigames/PlantIdentification.module.css (169 lines)
    - src/components/Crafting/minigames/PatternMatching.jsx (412 lines)
    - src/components/Crafting/minigames/PatternMatching.module.css (258 lines)
    - src/components/Crafting/minigames/DirectionalPlacement.jsx (376 lines)
    - src/components/Crafting/minigames/DirectionalPlacement.module.css (244 lines)
  modified:
    - src/components/Crafting/CraftingMiniGame.jsx (removed stub imports, added real imports)

key-decisions:
  - "PlantIdentification uses embedded plant descriptions (color/shape/use/smell) - no external data lookups"
  - "PatternMatching uses Unicode shape icons (■●▲★◆) for simplicity - no sprite assets needed"
  - "DirectionalPlacement uses emoji for building elements (🚪🪟🧱) - accessible visual feedback"
  - "All 3 mini-games follow same prop interface: { recipeId, professionLevel, onComplete }"
  - "Difficulty scaling consistent: level 1-3 (basic), 4-7 (intermediate), 8-10 (advanced)"

patterns-established:
  - "Mini-game structure: study/play/result phases with Framer Motion transitions"
  - "Arabic-first UI with optional English hints at lower levels"
  - "Timer countdown with visual bar for advanced levels"
  - "Feedback system: green for correct, red for incorrect, with Arabic messages"

# Metrics
duration: 8min
completed: 2026-02-13
---

# Phase 31 Plan 06: Crafting Mini-Games (PlantIdentification, PatternMatching, DirectionalPlacement) Summary

**Three profession-specific mini-games testing Arabic plant vocabulary, geometric patterns, and directional words**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-13T02:54:50Z
- **Completed:** 2026-02-13T03:02:50Z
- **Tasks:** 2
- **Files created:** 6
- **Files modified:** 1
- **Build:** Succeeds (723KB main bundle)
- **Tests:** Not run (no test files created for UI components in Phase 31)

## Accomplishments

- **PlantIdentification (Herbalist):** Multiple-choice plant identification using Arabic descriptions (color, shape, use, smell). 3-7 questions based on recipe ingredients. Difficulty scales: level 1-3 (3 questions, 4 choices, bilingual), level 4-7 (5 questions, Arabic-only), level 8-10 (7 questions, 6 choices, 20s timer).

- **PatternMatching (Weaver):** Grid-based geometric pattern memorization using Arabic shape names (مربع, دائرة, مثلث, نجمة, معين). Study phase shows target pattern, player reproduces from memory. Difficulty scales: level 1-3 (4×4 grid, 8s study), level 4-7 (5×5, 6s), level 8-10 (6×6, 4s). Result screen shows side-by-side comparison.

- **DirectionalPlacement (Builder):** Spatial placement mini-game using Arabic directional words (فوق, تحت, يمين, يسار, أمام, وراء, بجانب, وسط). 5×5 blueprint with pre-filled elements (door, window, wall). Player places materials based on Arabic instructions. Difficulty scales: level 1-3 (simple directions, bilingual), level 4-7 (compound directions, Arabic-only), level 8-10 (relative directions, 15s timer).

- **CraftingMiniGame.jsx updated:** Replaced stub imports (null constants) with real imports for PlantIdentification, PatternMatching, DirectionalPlacement. All 6 professions now have working mini-games.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create PlantIdentification and PatternMatching mini-games** - `32606a2` (feat)
   - PlantIdentification.jsx (361 lines)
   - PlantIdentification.module.css (169 lines)
   - PatternMatching.jsx (412 lines)
   - PatternMatching.module.css (258 lines)

2. **Task 2: Create DirectionalPlacement mini-game and update CraftingMiniGame imports** - `c02c548` (feat)
   - DirectionalPlacement.jsx (376 lines)
   - DirectionalPlacement.module.css (244 lines)
   - CraftingMiniGame.jsx (removed 3 stub lines, added 3 real imports)

## Files Created

### PlantIdentification (Herbalist)

**Component:** Multiple-choice plant identification using Arabic plant names and descriptions.

- **Questions:** Generated from recipe ingredients (plants/herbs). Reuses ingredients if needed to meet difficulty level.
- **Descriptions:** Arabic descriptions with 4 attributes: اللون (color), الشكل (shape), الاستخدام (use), الرائحة (smell).
- **Choices:** 4-6 answer buttons with Arabic plant names. English names shown at lower levels.
- **Scoring:** +1 per correct, -0.5 penalty per incorrect. Accuracy = max(0, (correct - 0.5 × incorrect) / total).
- **Visual:** Card flip animation between questions, green/red feedback, progress bar, timer for level 8-10.

**CSS Module:** Green color scheme, RTL layout, 2×2 or 2×3 grid for choices, description table, timer bar, correct/incorrect animations.

### PatternMatching (Weaver)

**Component:** Grid-based geometric pattern memorization using Arabic shape names.

- **Phases:** Study (view pattern with countdown), Reproduce (click cells to cycle shapes), Result (side-by-side comparison).
- **Shapes:** 3-5 shape types (square/circle/triangle/star/diamond) with Arabic names. Unicode icons (■●▲★◆).
- **Grid:** 4×4, 5×5, or 6×6 depending on profession level. Cells clickable, cycle through shapes on click.
- **Scoring:** Accuracy = matching_cells / total_cells (pure percentage).
- **Visual:** Study countdown timer, shape legend with Arabic names, hover hints, correct/incorrect cell highlighting in result phase.

**CSS Module:** Purple color scheme, RTL layout, responsive grid (flex on mobile), shape legend, timer bar, comparison grids.

### DirectionalPlacement (Builder)

**Component:** Spatial placement mini-game using Arabic directional vocabulary.

- **Blueprint:** 5×5 grid with pre-filled elements (door 🚪, window 🪟, wall 🧱 at fixed positions).
- **Tasks:** 3-6 placement tasks based on recipe ingredient count. Instructions like "ضع الحجر فوق الباب" (Place stone above door).
- **Directions:** 8 Arabic directions with row/col offsets (فوق/تحت/يمين/يسار/أمام/وراء/بجانب/وسط).
- **Scoring:** +1 per correct placement, -0.5 penalty per incorrect. Accuracy = max(0, (correct - 0.5 × incorrect) / total).
- **Visual:** Blueprint grid with emoji icons, hover hints show Arabic element names, target cell highlighted after placement, timer for level 8-10.

**CSS Module:** Orange/brown color scheme, RTL layout, 70px cells (55px on mobile), pre-filled/empty/target cell states, pulse/shake animations.

### CraftingMiniGame.jsx (modified)

**Change:** Replaced stub imports with real imports:

```diff
- // Plan 06 mini-games (stub imports - will be implemented later)
- const PlantIdentification = null;
- const PatternMatching = null;
- const DirectionalPlacement = null;
+ import PlantIdentification from './minigames/PlantIdentification.jsx';
+ import PatternMatching from './minigames/PatternMatching.jsx';
+ import DirectionalPlacement from './minigames/DirectionalPlacement.jsx';
```

**Result:** All 6 professions now route to working mini-games. No more "coming soon" fallback.

## Decisions Made

- **Embedded plant descriptions:** PlantIdentification uses hardcoded descriptions for 8 common plants. No need to extend RESOURCES data. Fallback descriptions for unknown plants.
- **Unicode shape icons:** PatternMatching uses ■●▲★◆ instead of sprite assets. Simpler, accessible, no asset loading.
- **Emoji building elements:** DirectionalPlacement uses 🚪🪟🧱 for door/window/wall. Clear visual feedback without sprites.
- **Consistent difficulty scaling:** All 3 mini-games use same level breakpoints (1-3, 4-7, 8-10) for consistent player experience.
- **No Canvas needed:** All 3 mini-games use CSS Grid + HTML buttons. Accessible, performant, easier to style.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**SmithingRhythm dependency:** Plan 31-05 was running in parallel and hadn't created SmithingRhythm.jsx yet. However, by the time Task 2 was executed, 31-05 had completed and SmithingRhythm existed. No blocking issue.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- **PlantIdentification, PatternMatching, DirectionalPlacement** ready for integration in plan 31-07 (CraftingOverlay).
- **CraftingMiniGame.jsx** now routes to all 6 mini-games. No stubs remain.
- **CRAFT-05 requirement complete:** All 6 professions have unique crafting mini-games.
- **Event emission ready:** Mini-games emit accuracy scores compatible with calculateCraftQuality (31-02).
- **No blockers for plan 31-07** (CraftingOverlay integration).

## Verification

All verification criteria met:

- ✅ `npx vite build` succeeds (723KB main bundle)
- ✅ All 3 components export default
- ✅ PlantIdentification has multiple-choice with Arabic plant names
- ✅ PatternMatching has grid-based pattern reproduction
- ✅ DirectionalPlacement has spatial placement with Arabic directions
- ✅ All 3 produce accuracy scores (0-1 float)
- ✅ All 3 scale difficulty with profession level
- ✅ CraftingMiniGame imports all 6 mini-game components
- ✅ `grep -c 'import.*from.*minigames' src/components/Crafting/CraftingMiniGame.jsx` outputs 6

## Self-Check

Verifying claims made in summary:

```bash
# Check created files exist
[ -f "src/components/Crafting/minigames/PlantIdentification.jsx" ] && echo "FOUND: PlantIdentification.jsx" || echo "MISSING"
[ -f "src/components/Crafting/minigames/PlantIdentification.module.css" ] && echo "FOUND: PlantIdentification CSS" || echo "MISSING"
[ -f "src/components/Crafting/minigames/PatternMatching.jsx" ] && echo "FOUND: PatternMatching.jsx" || echo "MISSING"
[ -f "src/components/Crafting/minigames/PatternMatching.module.css" ] && echo "FOUND: PatternMatching CSS" || echo "MISSING"
[ -f "src/components/Crafting/minigames/DirectionalPlacement.jsx" ] && echo "FOUND: DirectionalPlacement.jsx" || echo "MISSING"
[ -f "src/components/Crafting/minigames/DirectionalPlacement.module.css" ] && echo "FOUND: DirectionalPlacement CSS" || echo "MISSING"

# Check commits exist
git log --oneline --all | grep -q "32606a2" && echo "FOUND: Task 1 commit" || echo "MISSING"
git log --oneline --all | grep -q "c02c548" && echo "FOUND: Task 2 commit" || echo "MISSING"

# Verify import count
grep -c 'import.*from.*minigames' src/components/Crafting/CraftingMiniGame.jsx
# Expected: 6

# Verify no stubs remain
grep -c "= null" src/components/Crafting/CraftingMiniGame.jsx
# Expected: 0 (no stub assignments)
```

## Self-Check: PASSED

All verification checks passed:
- ✅ PlantIdentification.jsx exists (361 lines)
- ✅ PlantIdentification.module.css exists (169 lines)
- ✅ PatternMatching.jsx exists (412 lines)
- ✅ PatternMatching.module.css exists (258 lines)
- ✅ DirectionalPlacement.jsx exists (376 lines)
- ✅ DirectionalPlacement.module.css exists (244 lines)
- ✅ Task 1 commit 32606a2 exists
- ✅ Task 2 commit c02c548 exists
- ✅ 6 mini-game imports counted
- ✅ No stub assignments remain (0 occurrences of "= null")

---
*Phase: 31-crafting-professions*
*Completed: 2026-02-13*
