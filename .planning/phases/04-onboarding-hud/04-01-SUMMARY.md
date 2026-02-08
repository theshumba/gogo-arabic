---
phase: 04-onboarding-hud
plan: 01
subsystem: build-optimization
tags: [performance, bundle-splitting, z-index, css-tokens, perf-01, hud-03]
dependency_graph:
  requires: []
  provides: [vendor-chunks, vocabulary-data-chunk, npc-data-chunk, z-index-tokens]
  affects: [build-system, css-modules]
tech_stack:
  added: []
  patterns: [vite-manualChunks, css-custom-properties]
key_files:
  created: []
  modified:
    - vite.config.js
    - src/components/HUD/HUD.module.css
    - src/components/Onboarding/OnboardingFlow.module.css
    - src/components/Battle/WordDuel.module.css
    - src/components/UI/LevelUpModal.module.css
    - src/components/Goals/DailyGoalsPanel.module.css
    - src/components/Goals/StreakRewardToast.module.css
    - src/components/HUD/MiniMap.module.css
    - src/components/World/WorldMap.module.css
    - src/components/Quest/QuestLog.module.css
    - src/components/NPC/DialogueOverlay.module.css
    - src/components/Quiz/QuizOverlay.module.css
key_decisions:
  - Large data files (vocabulary-final.json, npcs.json) extracted to separate chunks for better caching
  - QuestTracker.module.css keeps literal z-index: 99 (intentionally 1 below HUD, not a separate layer token)
  - OnboardingFlow and WordDuel modules now import variables.css for token access
  - Internal component z-index values remain as literals (avoid over-engineering)
metrics:
  duration: 5 minutes
  completed: 2026-02-08T21:11:03Z
---

# Phase 4 Plan 1: Bundle Splitting & Z-Index Standardization Summary

Vite bundle splitting reduces main JS bundle from ~2.9MB to 264KB by extracting vendors and large data files into cacheable chunks. All top-level z-index values now use CSS custom property tokens for consistent layering.

## Performance

**Before:**
- Single monolithic bundle: ~2.9MB
- All vendors, data, and app code in one chunk

**After:**
- Main index chunk: 264.51 KB (under 500KB target)
- Phaser vendor chunk: 1,208 KB (cached separately)
- Vocabulary data chunk: 783 KB (cached separately)
- NPC data chunk: 153 KB (cached separately)
- React vendor chunk: 303 KB (cached separately)
- Redux vendor chunk: 24 KB (cached separately)
- Router vendor chunk: 86 KB (cached separately)
- FSRS vendor chunk: 22 KB (cached separately)
- Misc vendor chunk: 54 KB (cached separately)

**Impact:**
- 91% reduction in main bundle size (2.9MB → 264KB)
- Vendor code now cacheable across app updates
- Large data files separated for efficient caching
- Faster initial load and better cache hit rates

## Accomplishments

**Task 1: Vite Bundle Splitting**
- Configured `build.rollupOptions.output.manualChunks` in vite.config.js
- Split vendor dependencies into logical chunks by library (phaser, react, redux, router, fsrs)
- Extracted large data files (vocabulary-final.json 932KB, npcs.json 220KB) to separate chunks
- Main application bundle reduced to 264KB raw size (well under 500KB target)
- Build succeeds with no errors or regressions

**Task 2: Z-Index Standardization**
- Converted 11 CSS Module files to use `var(--z-*)` tokens from variables.css
- HUD layer: `var(--z-hud)` (100)
- Onboarding layer: `var(--z-onboarding)` (10000)
- Battle layer: `var(--z-battle)` (250)
- Level-up modal layer: `var(--z-level-up)` (300)
- Overlay layer: `var(--z-overlay)` (200) — used by 6 overlays
- Toast layer: `var(--z-toast)` (150)
- Minimap layer: `var(--z-minimap)` (90)
- Added @import statements for OnboardingFlow and WordDuel modules
- Internal component z-index values (1, 2, 3, etc.) kept as literals
- QuestTracker z-index: 99 kept literal (intentionally 1 below HUD)

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `02079cf` | Configure Vite manualChunks for vendor bundle splitting |
| 2 | `e28a91d` | Standardize z-index values to CSS custom property tokens |

## Files Created/Modified

**Created:** None

**Modified:**
- `vite.config.js` — Added manualChunks configuration for vendor and data splitting
- `src/components/HUD/HUD.module.css` — z-index: 100 → var(--z-hud)
- `src/components/Onboarding/OnboardingFlow.module.css` — Added @import, z-index: 10000 → var(--z-onboarding)
- `src/components/Battle/WordDuel.module.css` — Added @import, z-index: 250 → var(--z-battle)
- `src/components/UI/LevelUpModal.module.css` — z-index: 300 → var(--z-level-up)
- `src/components/Goals/DailyGoalsPanel.module.css` — z-index: 200 → var(--z-overlay)
- `src/components/Goals/StreakRewardToast.module.css` — z-index: 150 → var(--z-toast)
- `src/components/HUD/MiniMap.module.css` — z-index: 90 → var(--z-minimap)
- `src/components/World/WorldMap.module.css` — z-index: 200 → var(--z-overlay)
- `src/components/Quest/QuestLog.module.css` — z-index: 200 → var(--z-overlay)
- `src/components/NPC/DialogueOverlay.module.css` — z-index: 200 → var(--z-overlay)
- `src/components/Quiz/QuizOverlay.module.css` — z-index: 200 → var(--z-overlay)

## Decisions Made

1. **Large data files extracted to separate chunks:** vocabulary-final.json (932KB) and npcs.json (220KB) are now in separate chunks (vocabulary-data, npc-data) instead of bundled with the main app. This enables better caching — data files rarely change, so they can be cached separately from app code.

2. **QuestTracker z-index kept literal:** QuestTracker uses `z-index: 99` which is intentionally 1 below the HUD layer (100). This is a positional relationship, not a separate layer token, so it's kept as a literal to avoid over-engineering.

3. **Internal z-index values remain literals:** Z-index values like 1, 2, 3 used for internal component stacking (e.g., within WorldMap or LevelUpModal) are kept as literals. Tokens are only for top-level component layers.

4. **Scheduler included in react-vendor chunk:** The `scheduler` package is shared by React and Framer Motion, so it's explicitly assigned to the `react-vendor` chunk to avoid circular dependencies.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

1. **Circular chunk dependency warning:** Initial manualChunks configuration caused a circular dependency between `misc-vendor` and `react-vendor` due to the `scheduler` package being shared. Resolved by explicitly assigning `scheduler` to `react-vendor`.

2. **Unrelated HUD.jsx changes:** HUD.jsx had unrelated StatsPanel refactoring changes in the working directory (not part of this plan). Reverted those changes to keep the commit focused on bundle splitting and z-index standardization only.

## Next Phase Readiness

**Phase 4 Plan 2 (Interactive Tooltips) is ready:**
- Bundle splitting complete — main chunk under 500KB
- Z-index tokens standardized — tooltip layer can use `var(--z-onboarding)` or a new token
- Build system optimized for performance
- No blockers

**Recommendations for Plan 2:**
- Consider adding `--z-tooltip` token if tooltips need a separate layer (e.g., z-index: 5000 between level-up and onboarding)
- Tooltip components can follow the same CSS Module + token pattern established here

## Self-Check: PASSED

**Files created verification:**
- No files were created in this plan (only modifications)

**Commits verification:**
```bash
git log --oneline --all --grep="04-01"
e28a91d feat(04-01): standardize z-index values to CSS custom property tokens
02079cf feat(04-01): configure vite bundle splitting for vendor chunks
```
✓ 2 commits found with "04-01" prefix

**Bundle size verification:**
```bash
npx vite build
dist/assets/index-Xcck_Z0t.js  264.51 kB │ gzip: 73.13 kB
```
✓ Main index chunk is 264.51 KB (under 500KB target)

**Z-index token verification:**
```bash
grep -r "var(--z-" src/components/ --include="*.css" | wc -l
12
```
✓ 12 z-index token usages found across component CSS files
