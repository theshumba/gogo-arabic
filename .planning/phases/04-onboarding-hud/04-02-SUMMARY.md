---
phase: 04-onboarding-hud
plan: 02
subsystem: hud
tags: [ux, accessibility, cognitive-load, ui-simplification]
dependency_graph:
  requires: []
  provides: [collapsible-stats-panel, simplified-hud-layout]
  affects: [hud-rendering, stats-display]
tech_stack:
  added: [StatsPanel-component]
  patterns: [collapsible-ui, css-transitions, memoization]
key_files:
  created:
    - src/components/HUD/StatsPanel.jsx
    - src/components/HUD/StatsPanel.module.css
  modified:
    - src/components/HUD/HUD.jsx
    - src/components/HUD/HUD.module.css
key_decisions:
  - decision: "StatsPanel collapsed by default"
    rationale: "Reduces cognitive load on first load - secondary stats accessible via toggle"
    impact: "Cleaner initial HUD presentation"
  - decision: "Use CSS max-height transition for panel animation"
    rationale: "Smooth expand/collapse with standard CSS - no JS animation library needed"
    impact: "Lightweight, performant accordion animation"
  - decision: "Memoize StatsPanel with React.memo"
    rationale: "HUD re-renders frequently (stamina, XP updates) - prevent unnecessary StatsPanel re-renders"
    impact: "Performance optimization for secondary stats display"
metrics:
  duration: "4 minutes"
  completed: "2026-02-08"
---

# Phase 4 Plan 2: Streamlined HUD Summary

**One-liner:** Collapsible StatsPanel component with secondary stats (words, dirhams, streak) moves non-actionable info out of primary HUD bar.

## Performance Impact

- **Bundle size:** +1.6 KB (StatsPanel.jsx) + 2.0 KB (CSS) = ~3.6 KB unminified
- **Runtime:** StatsPanel memoized to prevent re-renders when HUD updates for stamina/XP
- **DOM reduction:** Primary HUD bar reduced from 3 sections (left/center/right with 5+ stat displays) to 2 sections (left/right with toggle button)
- **CSS cleanup:** Removed 4 unused classes (.streakText, .dirhams, .statLabel, .center) + 12 lines from media queries

## Accomplishments

### HUD-01: Primary HUD Shows Only Essential Info
- **Before:** Level, XP bar, stamina, streak, dirhams, words learned, sync indicator, 7 action buttons
- **After:** Level, XP bar, stamina (conditional), StatsPanel toggle, 7 action buttons
- **Result:** Primary bar now focuses on actionable elements (Level/XP progression, buttons) + active quest tracker below

### HUD-02: Secondary Stats Collapsible
- **StatsPanel component:**
  - Collapsed by default (0px max-height)
  - Toggle button with arrow indicator (▶/▼)
  - Smooth CSS transition (max-height 0→200px, padding 0→8px in 0.3s)
  - Shows: Words learned, Dirhams, Streak, SyncIndicator
- **Accessibility:**
  - `aria-expanded` on toggle button (true/false)
  - `aria-controls` links button to panel
  - `aria-hidden` on panel content when collapsed
  - `pointer-events: none` on hidden content (prevents tab-through)
  - `focus-visible` outline on toggle button
- **Mobile:** 44px minimum touch target on toggle button (WCAG AA)

### Code Quality
- **Separation of concerns:** Secondary stats logic isolated in StatsPanel, HUD.jsx simplified
- **Redux optimization:** HUD.jsx now only destructures `level, xp, xpToNextLevel` from selectPlayerStats (was 6 fields, now 3)
- **Performance:** StatsPanel wrapped with `React.memo` to prevent re-renders when parent HUD updates
- **Maintainability:** Stats display centralized in one component vs scattered across HUD JSX

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `ca6fcea` | feat(04-02): create collapsible StatsPanel component |
| 2 | `782926d` | feat(04-02): simplify HUD to show only essential info with StatsPanel |

**Total commits:** 2

## Files Created/Modified

### Created
1. **src/components/HUD/StatsPanel.jsx** (46 lines)
   - React.memo wrapped component
   - useState for toggle state (collapsed by default)
   - Renders: toggle button + collapsible panel with 3 stats + SyncIndicator
   - Full ARIA attributes for accessibility

2. **src/components/HUD/StatsPanel.module.css** (99 lines)
   - Container + toggle button styles (pixel art button aesthetic matching HUD)
   - Panel transition: max-height + padding with 0.3s ease-out
   - Pointer-events none on hidden panel
   - Mobile responsive: 44px touch targets at 480px breakpoint

### Modified
3. **src/components/HUD/HUD.jsx**
   - Removed: SyncIndicator import, center section JSX, secondary stat displays (dirhams, words, streak)
   - Added: StatsPanel import + render in right section
   - Redux selector reduced from 6 fields to 3 (level, xp, xpToNextLevel only)
   - Net reduction: ~10 lines

4. **src/components/HUD/HUD.module.css**
   - Removed: .center, .streakText, .dirhams, .statLabel (4 classes)
   - Removed: Media query references to removed classes
   - Net reduction: ~40 lines
   - Note: z-index changed to `var(--z-hud)` token by linter (acceptable improvement)

## Decisions Made

1. **StatsPanel collapsed by default:** First-time user sees clean HUD, can expand stats if interested. Reduces cognitive load without removing access.

2. **CSS transitions over JS animation:** max-height transition is standard, performant, and doesn't require framer-motion for simple accordion. Keeps bundle small.

3. **Memoization strategy:** HUD re-renders frequently (stamina bar updates every frame when sprinting, XP bar on every kill). StatsPanel doesn't need to re-render unless its own Redux slice changes (wordsLearned, dirhams, streak).

4. **Arrow indicators over icons:** Simple Unicode arrows (▶/▼) match pixel aesthetic better than emoji or icon library. Accessible with ARIA labels.

## Deviations from Plan

### Auto-fixed Issues

**None - plan executed exactly as written.**

## Issues Encountered

**None.** Build passed on first attempt after each task. No runtime errors, no type mismatches, no CSS conflicts.

## Next Phase Readiness

### Ready for 04-03 (Next Plan in Phase 4)
- [x] HUD simplified to essential info only
- [x] Secondary stats accessible via collapsible panel
- [x] No regressions in build or existing HUD functionality
- [x] Accessibility attributes implemented
- [x] Mobile responsive

### Technical Debt
- **None introduced.** Code quality improved (separation of concerns, Redux optimization).

### Blockers
- **None.**

## Self-Check: PASSED

**File verification:**
- [x] src/components/HUD/StatsPanel.jsx exists (1,630 bytes)
- [x] src/components/HUD/StatsPanel.module.css exists (2,004 bytes)

**Commit verification:**
- [x] Git log shows 2 commits with "04-02" in message
- [x] Commits: `ca6fcea`, `782926d`

**Build verification:**
- [x] `npx vite build` succeeds with no errors
- [x] No new warnings introduced

All verification checks passed.
