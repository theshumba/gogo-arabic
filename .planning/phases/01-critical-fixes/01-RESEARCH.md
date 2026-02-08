# Phase 1: Critical Fixes - Research

**Researched:** 2026-02-08
**Domain:** CSS layout (z-index, responsive design), React accessibility (focus traps), React event handling
**Confidence:** HIGH

## Summary

Phase 1 addresses four high-impact bugs that break basic usability and accessibility. All four requirements involve straightforward fixes to existing code — no new systems or complex architecture. The codebase already has the necessary infrastructure in place (useFocusTrap hook exists and is tested, CSS Modules with responsive breakpoints are the established pattern, z-index system exists but needs standardization).

Research confirms that all fixes are simple, low-risk changes with clear implementation paths. The main challenges are scope (9 overlays for CRIT-03) and testing thoroughness, not technical complexity.

**Primary recommendation:** Fix all four requirements sequentially in a single focused session. Each fix is independent and can be verified immediately. Total estimated time: 2-3 hours.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 19 | 19.x | Component framework | Project standard, already in use |
| CSS Modules | N/A (Vite) | Component-scoped styling | 16/24 components already use this pattern |
| Framer Motion | 11.x | Animation library | All overlays already use motion.div |
| useFocusTrap | Custom hook | Focus management | Already implemented, tested, ready to wire |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| CSS Custom Properties | N/A | Design tokens | Already in variables.css, should expand for z-index |
| @media queries | N/A | Responsive breakpoints | Standard CSS, already used in CSS Module components |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useFocusTrap hook | focus-trap-react library | Hook already exists, works, and is tested — no benefit to library |
| CSS Modules | Inline JS styles | Inline styles lack responsive breakpoints (the actual bug) |
| Custom z-index tokens | Arbitrary values | Current state causes conflicts — standardization required |

**Installation:**
No new dependencies required. All fixes use existing codebase infrastructure.

## Architecture Patterns

### Recommended z-index Token System
Add to `src/styles/variables.css`:
```css
/* Z-Index Tokens */
--z-phaser-overlay: 10;       /* DOMOverlay for Phaser sprites */
--z-pause-menu: 50;            /* Pause menu (was 20, conflicted with MiniMap 90) */
--z-minimap: 90;               /* MiniMap button (stays same) */
--z-hud: 100;                  /* HUD bar (stays same) */
--z-toast: 150;                /* Notifications, toasts (stays same) */
--z-overlay: 200;              /* Overlays (dialogue, quest log, quiz, achievements, etc) */
--z-battle: 250;               /* Battle system (stays same) */
--z-level-up: 300;             /* Level-up modal (stays same) */
--z-error: 9999;               /* Error boundary (stays same) */
--z-onboarding: 10000;         /* Onboarding (stays same) */
```

**Pattern: Critical fix for CRIT-01**
Change `src/App.module.css` line 55 from `z-index: 20` to `z-index: var(--z-pause-menu)` after defining token as 50.

### Recommended Responsive Overlay Pattern
CSS Modules pattern (already used by DailyGoalsPanel):
```css
.panel {
  width: 100%;
  max-width: 600px;
  /* NO minWidth */
}

@media (max-width: 768px) {
  .panel { max-width: 100%; }
}

@media (max-width: 480px) {
  .overlay { padding: 10px; }
  .panel { padding: 12px 16px; }
}
```

**Pattern: Critical fix for CRIT-02**
Migrate QuestLog and QuizOverlay from inline styles to CSS Modules, removing `minWidth: 450px` and `minWidth: 420px`.

### Recommended Focus Trap Integration
Pattern (from hook documentation):
```jsx
import { useFocusTrap } from '../../hooks/useFocusTrap.js';

function MyOverlay({ onClose }) {
  const focusTrapRef = useFocusTrap(true, onClose);

  return (
    <div ref={focusTrapRef} className={styles.overlay}>
      {/* content */}
    </div>
  );
}
```

**Pattern: Critical fix for CRIT-03**
Add 2 lines to each of 9 overlays: import statement + ref assignment.

### Recommended Clickable Badge Pattern
Current HUD.jsx lines 234-239 shows badge as display-only span. Pattern for clickable:
```jsx
<motion.button
  className={`${styles.btn} ${styles.reviewBtn}`}
  onClick={openReviewSession}
  aria-label={`Review ${reviewDueCount} due words`}
  {...buttonProps}
>
  Review
  {reviewDueCount > 0 && (
    <span className={`${styles.badge} ${styles.reviewBadge}`}>
      {reviewDueCount} due
    </span>
  )}
</motion.button>
```

**Pattern: Critical fix for CRIT-04**
Convert span badge (lines 234-239) to button wrapper. Wire to openReviewSession handler (needs EventBus.emit or navigation).

### Anti-Patterns to Avoid
- **Inline minWidth on overlays:** Breaks mobile responsiveness, no media query support
- **Arbitrary z-index values:** Current state has PauseMenu at 20 conflicting with MiniMap at 90
- **Escape-only focus traps:** Hook supports Escape callback, use it for onClose wiring
- **Focus trap without ref:** useFocusTrap returns a ref that MUST be assigned to trap element

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Focus trapping | Custom Tab/Shift-Tab logic | useFocusTrap hook (exists) | Already implemented, handles edge cases (no focusables, restore previous focus) |
| Responsive breakpoints | JavaScript window.innerWidth listeners | CSS @media queries | Performant, declarative, already standard in codebase |
| Z-index management | Ad-hoc numeric values | CSS custom properties tokens | Prevents conflicts, documents intent, single source of truth |
| Review session opening | New navigation logic | EventBus pattern (existing) | Consistent with rest of codebase (see GameLayout.jsx EventBus listeners) |

**Key insight:** All four fixes leverage existing patterns. No custom solutions needed. The bugs exist because existing patterns weren't applied consistently.

## Common Pitfalls

### Pitfall 1: Z-Index Stacking Context Confusion
**What goes wrong:** Changing PauseMenu z-index from 20 to 200 seems like it should work, but if parent element has `transform`, `filter`, or `position: fixed` with z-index, it creates a new stacking context and z-index values only compete within that context.

**Why it happens:** CSS properties that trigger new stacking contexts: transform, filter, opacity < 1, position fixed/sticky with z-index, will-change, isolation: isolate. (Source: [Josh Comeau - Stacking Contexts](https://www.joshwcomeau.com/css/stacking-contexts/), [MDN Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z_index/Stacking_context))

**How to avoid:**
1. Check if PauseMenu and MiniMap share the same stacking context (both are direct children of game container).
2. If not, add `isolation: isolate` to root App component to create predictable root stacking context.
3. Use browser DevTools to inspect computed stacking contexts (Chrome DevTools > Layers panel).

**Warning signs:** z-index change has no effect, or works in dev but breaks in production after new CSS is added.

### Pitfall 2: Focus Trap Without Focusable Elements
**What goes wrong:** useFocusTrap attempts to focus first focusable element. If overlay has no buttons/inputs/links, focus trap fails silently or throws error.

**Why it happens:** Hook queries for `button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])`. If none exist, firstFocusable is undefined.

**How to avoid:**
1. Ensure every overlay has at least one focusable element (close button, primary action).
2. If overlay is purely informational (SignOverlay), add tabindex="0" to container div.
3. Test with keyboard-only navigation (unplug mouse).

**Warning signs:** Tab key does nothing after overlay opens, focus remains on trigger button behind overlay.

### Pitfall 3: Responsive minWidth Override
**What goes wrong:** Changing `minWidth: 450px` to `maxWidth: 600px` still breaks on mobile if padding + border + content push actual width beyond screen.

**Why it happens:** CSS box model: width = content + padding + border. `maxWidth: 600px` with `padding: 28px` + `border: 4px` = 664px minimum. (Source: [BrowserStack CSS Media Queries Guide](https://www.browserstack.com/guide/what-are-css-and-media-query-breakpoints))

**How to avoid:**
1. Use `width: 100%` + `maxWidth` instead of minWidth.
2. Add `padding: 20px` to overlay parent container to prevent edge touch.
3. Test on 375px viewport (iPhone SE, smallest modern mobile).
4. Use `box-sizing: border-box` globally (already in codebase).

**Warning signs:** Overlay fits on desktop but horizontal scroll on mobile, close button cut off at screen edge.

### Pitfall 4: Review Button Navigation Ambiguity
**What goes wrong:** Clicking "Review" badge could open ReviewSession overlay, navigate to /review route, or trigger quiz with review-due words. Three possible destinations, unclear which is correct.

**Why it happens:** Codebase has ReviewSession component (src/components/Review/ReviewSession.jsx) AND game route structure. Need to verify which pattern matches user expectations.

**How to avoid:**
1. Check existing EventBus events in GameLayout.jsx for 'open-review' or similar.
2. If none exists, follow HUD pattern: create handler that emits EventBus event, GameLayout listens and opens overlay.
3. Match behavior of "Quests" button (lines 190-202) — opens overlay, not navigation.
4. Verify with REQUIREMENTS.md: "Daily review sessions can be started from the game HUD" (DISC-03) — implies in-game overlay, not route change.

**Warning signs:** Review button navigates away from game (wrong), review opens but player can still move (missing freeze-player event).

## Code Examples

Verified patterns from existing codebase:

### CRIT-01: Z-Index Fix
```css
/* src/styles/variables.css - ADD THIS */
:root {
  --z-pause-menu: 50;
  --z-minimap: 90;
  /* ... other tokens ... */
}
```
```css
/* src/App.module.css - CHANGE LINE 55 */
.pauseMenuOverlay {
  position: absolute;
  inset: 0;
  z-index: var(--z-pause-menu); /* was: z-index: 20; */
  /* ... rest unchanged ... */
}
```

### CRIT-02: Responsive Overlay Migration
```css
/* Create src/components/Quest/QuestLog.module.css */
@import '../../styles/variables.css';

.overlay {
  position: absolute;
  inset: 0;
  background: var(--color-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-overlay);
  padding: 20px; /* NEW - prevents edge touch */
}

.card {
  background: var(--color-beige);
  border: 4px solid var(--color-dark);
  padding: 20px;
  width: 100%;
  max-width: 600px; /* was minWidth: 450px */
  max-height: 80vh;
  overflow-y: auto;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .card {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .overlay {
    padding: 10px;
  }

  .card {
    padding: 16px;
  }
}
```
```jsx
/* src/components/Quest/QuestLog.jsx - UPDATE IMPORTS AND STYLES */
import styles from './QuestLog.module.css';
// Remove inline styles object
// Replace style={styles.overlay} with className={styles.overlay}
```

### CRIT-03: Focus Trap Integration
```jsx
// src/components/Quest/QuestLog.jsx - ADD 2 LINES
import { useFocusTrap } from '../../hooks/useFocusTrap.js'; // ADD THIS

export default function QuestLog() {
  const dispatch = useDispatch();
  const quests = useSelector((s) => s.quests.quests);
  const focusTrapRef = useFocusTrap(true, handleClose); // ADD THIS

  const handleClose = () => {
    dispatch(closeDialogue());
    EventBus.emit('unfreeze-player');
  };

  return (
    <div ref={focusTrapRef} style={styles.overlay}> {/* ADD ref={focusTrapRef} */}
      {/* ... rest unchanged ... */}
    </div>
  );
}
```

**All 9 overlays requiring this fix:**
1. DialogueOverlay.jsx
2. QuizOverlay.jsx
3. QuestLog.jsx
4. AchievementPanel.jsx
5. DailyGoalsPanel.jsx
6. SignOverlay.jsx
7. LevelUpModal.jsx
8. ShopOverlay.jsx
9. OnboardingFlow.jsx

### CRIT-04: Clickable Review Badge
```jsx
// src/components/HUD/HUD.jsx - REPLACE LINES 234-239
const openReviewSession = useCallback(() => {
  EventBus.emit('open-review-session'); // NEW
  EventBus.emit('freeze-player');
}, []);

// REPLACE:
// {reviewDueCount > 0 && (
//   <span className={`${styles.badge} ${styles.reviewBadge}`}>
//     {reviewDueCount} due
//   </span>
// )}

// WITH:
{reviewDueCount > 0 && (
  <motion.button
    className={`${styles.btn} ${styles.reviewBtn}`}
    onClick={openReviewSession}
    aria-label={`Open review session with ${reviewDueCount} due words`}
    {...buttonProps}
  >
    Review
    <span className={`${styles.badge} ${styles.reviewBadge}`} aria-hidden="true">
      {reviewDueCount}
    </span>
  </motion.button>
)}
```
```jsx
// src/components/Router/GameLayout.jsx - ADD EVENT LISTENER
useEffect(() => {
  // ... existing listeners ...

  const handleOpenReview = () => {
    // Open ReviewSession overlay with due cards
    const dueCards = /* get from vocabulary selector */;
    dispatch(openDialogue({ type: 'review-session', data: dueCards }));
  };

  EventBus.on('open-review-session', handleOpenReview);

  return () => {
    EventBus.off('open-review-session', handleOpenReview);
    // ... existing cleanup ...
  };
}, [dispatch]);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline JS styles for all overlays | CSS Modules with responsive breakpoints | 2024-2025 (16/24 components migrated) | Better maintainability, responsive design support |
| Ad-hoc z-index values | Standardized z-index tokens via CSS variables | Not yet implemented | This phase establishes the pattern |
| Manual focus management | useFocusTrap hook | 2024 (hook created but unused) | Accessibility compliance, DRY principle |
| `<dialog>` element focus trapping | Custom React hooks | 2026 web standards evolving | Native `<dialog>` auto-traps focus, but React ecosystem still prefers hooks for consistency |

**Deprecated/outdated:**
- **Manual Tab key listeners:** useFocusTrap handles this with proper edge cases
- **`minWidth` on overlays:** Mobile-first design uses `width: 100%` + `maxWidth` instead
- **Inline styles for complex components:** CSS Modules are project standard (see Memory.md, 16/24 components)

**Note on native `<dialog>`:** Research found that modern `<dialog>` element with `showModal()` automatically traps focus and handles Escape key. However, codebase uses Framer Motion's motion.div for all overlays with consistent animation patterns. Migrating to `<dialog>` would require rewriting animation system. Since useFocusTrap hook exists and works, use it for consistency. (Source: [CSS-Tricks - No Need to Trap Focus](https://css-tricks.com/there-is-no-need-to-trap-focus-on-a-dialog-element/))

## Open Questions

1. **Should z-index tokens be exhaustive or minimal?**
   - What we know: Current codebase has 27 files with z-index values ranging from 1-10000
   - What's unclear: Whether to define tokens for ALL values (including internal component z-index like WorldMap zones) or just top-level layers
   - Recommendation: Start with top-level tokens (phase-scoped, HUD-scoped, overlay-scoped). Internal component z-index (like WorldMap zone nodes at z-index 2, 10, 11) can stay as-is since they never conflict with top-level.

2. **What happens when review button is clicked but no cards are due?**
   - What we know: reviewDueCount selector exists, button only renders when > 0
   - What's unclear: Edge case if count changes between render and click (async sync?)
   - Recommendation: Add count check in openReviewSession handler, show notification if 0 cards: "No reviews due! Come back later."

3. **Should inline-styled overlays be migrated all at once or incrementally?**
   - What we know: 8 components use inline styles, QuestLog and QuizOverlay are CRIT-02 blockers
   - What's unclear: Whether fixing just 2 creates inconsistency debt
   - Recommendation: Fix 2 for Phase 1 (critical bugs). Remaining 6 migrate in Phase 6 (Architecture cleanup, ARCH-03).

## Sources

### Primary (HIGH confidence)
- Existing codebase files (useFocusTrap.js, HUD.jsx, DailyGoalsPanel.module.css, QuestLog.jsx, QuizOverlay.jsx, PauseMenu.jsx, MiniMap.module.css, App.module.css, variables.css, theme.js)
- [Josh Comeau - What The Heck, z-index? (Stacking Contexts)](https://www.joshwcomeau.com/css/stacking-contexts/)
- [MDN - Understanding CSS z-index: Stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z_index/Stacking_context)

### Secondary (MEDIUM confidence)
- [UXPin - How to Build Accessible Modals with Focus Traps](https://www.uxpin.com/studio/blog/how-to-build-accessible-modals-with-focus-traps/)
- [CSS-Tricks - There is No Need to Trap Focus on a Dialog Element](https://css-tricks.com/there-is-no-need-to-trap-focus-on-a-dialog-element/)
- [BrowserStack - A Complete Guide to CSS Media Query (2026)](https://www.browserstack.com/guide/what-are-css-and-media-query-breakpoints)
- [Smashing Magazine - Managing Z-Index In A Component-Based Web Application](https://www.smashingmagazine.com/2019/04/z-index-component-based-web-application/)

### Tertiary (LOW confidence, marked for validation)
- General web search findings about WCAG 2.2 focus trap requirements (needs official WCAG spec verification)
- Bootstrap breakpoint conventions (project doesn't use Bootstrap, but standards are industry reference)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All fixes use existing codebase infrastructure (React 19, CSS Modules, useFocusTrap hook, Framer Motion)
- Architecture: HIGH - Patterns verified from existing components (DailyGoalsPanel.module.css, HUD.jsx, GameLayout.jsx EventBus listeners)
- Pitfalls: HIGH - Stacking context behavior verified via MDN/Josh Comeau, responsive breakpoints verified via existing codebase patterns
- Code examples: HIGH - All examples copied/adapted from existing working components

**Research date:** 2026-02-08
**Valid until:** 2026-03-08 (30 days, stable patterns in mature React ecosystem)

**Scope clarity:**
- CRIT-01: 2 files to change (variables.css + App.module.css)
- CRIT-02: 4 files to change (create 2 new .module.css files, update 2 .jsx files)
- CRIT-03: 18 files to change (9 overlays × 2 lines each: import + ref)
- CRIT-04: 2-3 files to change (HUD.jsx handler + badge replacement, GameLayout.jsx listener, possibly vocabulary selector)

**Total files touched:** ~26 files across 4 independent fixes
**Estimated time:** 2-3 hours (simple changes, broad scope)
**Risk level:** LOW (all fixes are additive or isolated, no breaking changes to existing functionality)
