---
phase: 31-crafting-professions
plan: 04
subsystem: ui
tags: [react, css-modules, framer-motion, crafting-ui, vocabulary-gating]

# Dependency graph
requires:
  - phase: 31-01
    provides: PROFESSIONS, RECIPES, RESOURCES data, craftingSlice selectors
  - phase: 31-02
    provides: craftingLogic.js functions (calculateProfessionXP, getDisplayableIngredients, hasRequiredResources)
provides:
  - RecipeBook component (full-screen overlay with profession tabs and recipe grid)
  - ProfessionPanel component (sidebar profession progress display)
  - IngredientSelector component (recipe ingredients with vocabulary gating)
affects: [31-05, 31-06, 31-07, 31-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Full-screen overlay pattern (follows Wardrobe.jsx)
    - CSS Modules with RTL Arabic text (Amiri font)
    - Vocabulary-gating pattern (shows '???' for locked ingredients)
    - Event-driven UI (PLAYER_FREEZE/UNFREEZE, CRAFTING_RECIPE_BOOK_OPEN/CLOSE)

key-files:
  created:
    - src/components/Crafting/RecipeBook.jsx
    - src/components/Crafting/RecipeBook.module.css
    - src/components/Crafting/ProfessionPanel.jsx
    - src/components/Crafting/ProfessionPanel.module.css
    - src/components/Crafting/IngredientSelector.jsx
    - src/components/Crafting/IngredientSelector.module.css
  modified: []

key-decisions:
  - "RecipeBook uses 3 filter states (all/unlocked/craftable) with live search"
  - "ProfessionPanel displays Arabic numerals for level badge (٠-٩)"
  - "IngredientSelector emits REVIEW_SESSION_OPEN for locked ingredients"
  - "Craftable recipes get green glow animation (follows InventoryUI pattern)"

patterns-established:
  - "Vocabulary-gating UI pattern: show '???' for locked items, 'Learn word' button to emit REVIEW_SESSION_OPEN"
  - "Recipe card pattern: rarity border colors, lock icon for locked, green glow for craftable"
  - "Profession progress pattern: circular level badge with XP bar and skill tree"

# Metrics
duration: 18min
completed: 2026-02-13
---

# Phase 31 Plan 04: Crafting UI Components Summary

**RecipeBook overlay with 6 profession tabs, vocabulary-gated recipe grid, and ingredient selection with learn-word integration**

## Performance

- **Duration:** 18 min
- **Started:** 2026-02-13T02:30:00Z
- **Completed:** 2026-02-13T02:48:00Z
- **Tasks:** 2
- **Files created:** 6
- **Build:** Succeeds (723KB main bundle)
- **Tests:** 1070 passing (2 pre-existing failures in gatheringSpots.test.js from 31-01)

## Accomplishments

- RecipeBook component with 6 profession tabs (Arabic names), recipe grid with 3 filter states, search by Arabic/English
- ProfessionPanel component showing level badge with Arabic numerals, XP progress bar, skill tree (10 skills), craft stats
- IngredientSelector component with vocabulary-gated ingredients, 'Learn word' buttons, craft action with validation
- All components use CSS Modules, RTL Arabic text (Amiri font), consistent with Wardrobe.jsx/InventoryUI.jsx patterns
- Vocabulary-gating pattern: locked ingredients show '???' with hint, emit REVIEW_SESSION_OPEN on 'Learn' click

## Task Commits

Each task was committed atomically:

1. **Task 1: Create RecipeBook with profession tabs and recipe grid** - `4723df1` (feat)
2. **Task 2: Create ProfessionPanel and IngredientSelector** - `1bb21c7` (feat)

## Files Created

- `src/components/Crafting/RecipeBook.jsx` - Full-screen overlay with 6 profession tabs, recipe grid (locked/unlocked/craftable states), filter (all/unlocked/craftable), search by Arabic/English, useFocusTrap, emits PLAYER_FREEZE/UNFREEZE + CRAFTING_RECIPE_BOOK_OPEN/CLOSE
- `src/components/Crafting/RecipeBook.module.css` - Full-screen overlay styling, profession tabs (horizontal flex), recipe grid (responsive columns, 140px min-width), rarity borders, craftable glow animation, RTL Arabic text (Amiri font)
- `src/components/Crafting/ProfessionPanel.jsx` - Sidebar panel (250px) showing profession Arabic/English names, circular level badge with Arabic numerals (٠-٩), XP progress bar using calculateProfessionXP(), 10 skills (lock/unlock states), craft stats (recipes unlocked, items crafted)
- `src/components/Crafting/ProfessionPanel.module.css` - Sidebar styling, circular level badge (100px), XP bar gradient, skill list (scrollable, max-height 300px), RTL Arabic text
- `src/components/Crafting/IngredientSelector.jsx` - Recipe ingredient list using getDisplayableIngredients() and hasRequiredResources() from craftingLogic.js, shows Arabic names or '???' if locked, quantity needed/owned, 'Learn word' buttons (emit REVIEW_SESSION_OPEN), 'Craft' button (disabled if locked/insufficient), result preview, XP gain display
- `src/components/Crafting/IngredientSelector.module.css` - Ingredient list styling, color-coded quantity status (green/orange/gray), 'Learn word' button (orange), 'Craft' button (gold gradient), result preview box, missing resources hint

## Decisions Made

- **RecipeBook filter design:** 3 states (all/unlocked/craftable) + live search by Arabic/English - follows InventoryUI.jsx filter pattern
- **Arabic numeral display:** ProfessionPanel converts level to Arabic numerals (٠-٩) for level badge - enhances Arabic-first UI
- **Locked ingredient action:** 'Learn word' button emits REVIEW_SESSION_OPEN (wordId from RESOURCES[resourceId].wordId) - integrates crafting with vocabulary learning loop
- **Craftable glow effect:** Green border + pulse animation for recipes with all ingredients available - visual feedback follows InventoryUI.jsx pattern
- **Dependency injection:** Components use RECIPES/RESOURCES directly (not injected) - different from craftingLogic.js functions (which use injection for testing)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation followed Wardrobe.jsx and InventoryUI.jsx patterns without issues.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- RecipeBook, ProfessionPanel, IngredientSelector components ready for integration in plan 31-05 (CraftingOverlay)
- Components use selectors from craftingSlice (selectProfessions, selectDiscoveredRecipes, selectResources)
- Components use logic functions from craftingLogic.js (calculateProfessionXP, getDisplayableIngredients, hasRequiredResources)
- Event emission ready (PLAYER_FREEZE/UNFREEZE, CRAFTING_RECIPE_BOOK_OPEN/CLOSE, REVIEW_SESSION_OPEN)
- No blockers for plan 31-05 (CraftingOverlay integration)

---
*Phase: 31-crafting-professions*
*Completed: 2026-02-13*
