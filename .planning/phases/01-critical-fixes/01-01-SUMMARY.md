---
phase: 01-critical-fixes
plan: 01
subsystem: UI/HUD
tags:
  - z-index
  - review-session
  - accessibility
  - ux-fix
dependency_graph:
  requires: []
  provides:
    - z-index token system for top-level layers
    - clickable review badge with EventBus navigation
  affects:
    - src/styles/variables.css (global tokens)
    - src/components/Router/GameLayout.module.css (pause menu)
    - src/components/HUD/HUD.jsx (review button)
    - src/components/Router/GameLayout.jsx (navigation)
tech_stack:
  added: []
  patterns:
    - CSS custom properties for z-index tokens
    - EventBus event/listener pattern for review navigation
    - Framer Motion button with accessibility labels
key_files:
  created: []
  modified:
    - src/styles/variables.css
    - src/components/Router/GameLayout.module.css
    - src/components/HUD/HUD.jsx
    - src/components/HUD/HUD.module.css
    - src/components/Router/GameLayout.jsx
key_decisions:
  - decision: Set --z-pause-menu to 200 (overlay tier) instead of 50 as research suggested
    rationale: Pause menu is functionally a full-screen overlay and must render above MiniMap (90) and HUD (100). Value 200 matches overlay tier since pause menu IS an overlay.
    alternatives: ["Use 50 as suggested in research (rejected: too low, would still be hidden)"]
    impact: Pause menu now correctly appears above all UI elements
  - decision: Use EventBus pattern for review navigation (not direct navigate call in HUD)
    rationale: Consistent with existing patterns (alphabet button, world map). Maintains separation of concerns - HUD emits events, GameLayout handles navigation.
    alternatives: ["Direct navigate('/review') in HUD (rejected: breaks pattern consistency)"]
    impact: Clean architecture, easier to test and maintain
patterns_established:
  - Z-index token system in variables.css for incremental adoption across codebase
  - Top-level z-index tokens only (internal component z-index stays as literal values)
duration_minutes: 2
completed: 2026-02-08T14:00:18Z
---

# Phase 1 Plan 1: Z-Index Tokens + Review Badge Summary

**One-liner:** Added z-index token system with pause menu fix (now renders above MiniMap/HUD) and converted review badge to clickable button that navigates to review session via EventBus.

## Performance

- **Duration:** 2 minutes
- **Tasks completed:** 2/2 (100%)
- **Build status:** ✓ Success (no warnings)
- **Files modified:** 5 files
- **Lines changed:** +40 / -8
- **Commits:** 2 atomic task commits

## Accomplishments

### CRIT-01: Pause Menu Z-Index Fix

**Problem:** Pause menu rendered behind MiniMap (z-index 20 vs MiniMap 90), making it invisible when opened.

**Solution:**
- Created z-index token system in `variables.css` with 10 top-level layer tokens
- Set `--z-pause-menu: 200` (overlay tier) - above MiniMap (90) and HUD (100)
- Updated `GameLayout.module.css` to use `var(--z-pause-menu)` instead of literal `z-index: 20`

**Result:** Pause menu now correctly renders above all UI elements as a full-screen overlay.

### CRIT-04: Clickable Review Badge

**Problem:** Review badge in HUD displayed review count but was not interactive (just a `<span>` for display).

**Solution:**
- Converted review badge from `<span>` to `<motion.button>` with accessible label
- Added `openReviewSession` callback that emits `'open-review-session'` EventBus event
- Created `.reviewBtn` style (fire orange background) to visually distinguish from other buttons
- Updated `.reviewBadge` to work as child of button (removed standalone positioning overrides)
- Added `handleOpenReviewSession` listener in `GameLayout.jsx` that navigates to `/review`
- Registered EventBus listener with proper cleanup in useEffect return

**Result:** Review badge is now clickable, navigates to review session when clicked, and follows existing EventBus patterns.

## Task Commits

| Task | Description | Commit | Files Modified |
|------|-------------|--------|----------------|
| 1 | Add z-index tokens and fix pause menu z-index | 25a5e54 | variables.css, GameLayout.module.css |
| 2 | Make review badge clickable and wire to review session | 884e375 | HUD.jsx, HUD.module.css, GameLayout.jsx |

## Files Created

None - all changes were modifications to existing files.

## Files Modified

1. **src/styles/variables.css** (Task 1)
   - Added 10 z-index token custom properties (--z-phaser-overlay through --z-onboarding)
   - Tokens define top-level layer hierarchy for consistent z-index management

2. **src/components/Router/GameLayout.module.css** (Task 1)
   - Changed `.pauseMenuOverlay` z-index from `20` to `var(--z-pause-menu)`
   - Resolves to 200, placing pause menu in overlay tier

3. **src/components/HUD/HUD.jsx** (Task 2)
   - Added `openReviewSession` callback (line 115) that emits 'open-review-session' event
   - Converted review badge from `<span>` to `<motion.button>` (lines 235-245)
   - Button includes accessible label and badge as child element

4. **src/components/HUD/HUD.module.css** (Task 2)
   - Added `.reviewBtn` class (fire orange background, bold font)
   - Updated `.reviewBadge` to work as button child (removed standalone positioning)

5. **src/components/Router/GameLayout.jsx** (Task 2)
   - Added `handleOpenReviewSession` handler that navigates to '/review' (line 218)
   - Registered EventBus listener for 'open-review-session' (line 382)
   - Added cleanup in useEffect return (line 401)

## Decisions Made

### Decision 1: Z-Index Token Value for Pause Menu

**Context:** Research suggested `--z-pause-menu: 50`, but this would still be below MiniMap (90).

**Decision:** Set `--z-pause-menu: 200` (overlay tier).

**Rationale:** Pause menu is functionally a full-screen overlay that should render above all regular UI elements. Value 200 matches the `--z-overlay` tier, which is semantically correct since the pause menu IS an overlay.

**Impact:** Pause menu now correctly appears above MiniMap (90), HUD (100), and toasts (150).

### Decision 2: Top-Level Tokens Only (Not Internal Component Z-Index)

**Context:** WorldMap component has internal z-index values (nodes at 2/10/11) that could theoretically use tokens.

**Decision:** Only create tokens for top-level layers that can conflict across components. Internal component z-index stays as literal values.

**Rationale:** Internal z-index values (within a single component) never conflict with other components. Tokens are only needed for cross-component layer management. This keeps the token system focused and prevents over-engineering.

**Impact:** Token system remains maintainable and focused on solving actual cross-component z-index conflicts.

### Decision 3: EventBus Pattern for Review Navigation

**Context:** Could implement review navigation as direct `navigate('/review')` call in HUD.

**Decision:** Use EventBus pattern - HUD emits event, GameLayout navigates.

**Rationale:** Consistent with existing patterns (alphabet button at line 112 uses EventBus, world map button uses EventBus). Maintains separation of concerns - HUD component doesn't need to know about routing, it just signals intent.

**Impact:** Clean architecture, easier to test, consistent with codebase patterns. Future changes to routing logic only affect GameLayout.

## Deviations from Plan

None - plan executed exactly as written. No bugs encountered, no missing critical functionality, no blocking issues, and no architectural changes needed.

## Issues Encountered

None. Both tasks completed without errors or unexpected complications. Build succeeded on first attempt for both tasks.

## Next Phase Readiness

### Blockers

None.

### Dependencies Satisfied

This plan had no dependencies (`depends_on: []`).

### Provides for Future Plans

1. **Z-Index Token System:** Established in `variables.css` for use by future phases. Phase 5 (HUD-03) will incrementally adopt these tokens for other components.

2. **Review Navigation Pattern:** EventBus pattern demonstrated for future interactive HUD elements.

### Testing Recommendations

**Manual Testing:**
1. Open game, press Escape or click Menu button
2. Verify pause menu appears above MiniMap and HUD (should be fully visible with dark overlay)
3. Learn some words to trigger review count
4. Verify "Review" button appears in HUD with count badge
5. Click "Review" button
6. Verify navigation to `/review` route occurs

**Visual Regression:**
- Pause menu should have dark overlay (rgba(26, 26, 46, 0.85))
- Review button should have fire orange background (#f8a060)
- Review badge should show count in blue (#66d7ee) on dark background

**Accessibility:**
- Review button should have accessible label: "Start review session - N words due"
- Badge should have `aria-hidden="true"` (count already in button label)

## Self-Check: PASSED

### Files Verified

```
FOUND: /Users/theshumba/Documents/GitHub/gogo-arabic/src/styles/variables.css
FOUND: /Users/theshumba/Documents/GitHub/gogo-arabic/src/components/Router/GameLayout.module.css
FOUND: /Users/theshumba/Documents/GitHub/gogo-arabic/src/components/HUD/HUD.jsx
FOUND: /Users/theshumba/Documents/GitHub/gogo-arabic/src/components/HUD/HUD.module.css
FOUND: /Users/theshumba/Documents/GitHub/gogo-arabic/src/components/Router/GameLayout.jsx
```

### Commits Verified

```
FOUND: 25a5e54 (fix(01-01): add z-index tokens and fix pause menu z-index)
FOUND: 884e375 (feat(01-01): make review badge clickable and wire to review session)
```

### Content Verified

```
✓ variables.css contains --z-pause-menu: 200
✓ GameLayout.module.css uses var(--z-pause-menu)
✓ GameLayout.module.css does not contain z-index: 20 (old value removed)
✓ HUD.jsx contains EventBus.emit('open-review-session')
✓ HUD.jsx review badge is motion.button (not span)
✓ HUD.module.css contains .reviewBtn style
✓ GameLayout.jsx contains EventBus.on('open-review-session', handleOpenReviewSession)
✓ GameLayout.jsx contains EventBus.off('open-review-session', handleOpenReviewSession)
```

### Build Verified

```
✓ npx vite build completed successfully
✓ No warnings related to changed files
✓ All modules transformed (563 modules)
```

All claims in this summary have been verified. Self-check PASSED.
