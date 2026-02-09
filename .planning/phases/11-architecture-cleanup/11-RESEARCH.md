# Phase 11: Architecture Cleanup - Research

**Researched:** 2026-02-09
**Domain:** React component architecture, code quality tooling, Redux optimization
**Confidence:** HIGH

## Summary

Phase 11 focuses on refactoring the 607-line GameLayout component and establishing architecture standards with ESLint 9 + Prettier. The codebase currently has 37 components with inline styles (using `src/styles/theme.js` objects), 7 files with EventBus listeners (114 total usages), and mixed selector patterns across 12 Redux slices. The existing 548-test suite provides safety net for refactoring.

Key architectural challenges: GameLayout's 20+ EventBus listeners (lines 222-502) create tight coupling between Phaser and React; inline styles in 37 components reduce maintainability; 5 of 12 slices lack memoized selectors despite performing array filtering/object transformations.

**Primary recommendation:** Split GameLayout into sub-components using custom hooks for EventBus logic, migrate inline styles to CSS Modules with kebab-case naming, configure ESLint 9 flat config with React 19 support, and add createSelector to remaining slices.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ESLint | ^9.x | Linting | Industry standard, flat config is default in 2026, React 19 compatible |
| eslint-plugin-react | ^7.37.x | React linting | Official React plugin, supports React 19 jsx-runtime |
| eslint-plugin-react-hooks | ^5.x | Hooks rules | Official hooks plugin, catches common hook mistakes |
| Prettier | ^3.x | Code formatting | De facto formatter, exact versions prevent formatting drift |
| eslint-config-prettier | ^9.x | ESLint/Prettier compat | Turns off conflicting ESLint rules |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @eslint/js | ^9.x | ESLint base config | Required for flat config, provides recommended rules |
| globals | ^15.x | Environment globals | Required for browser/node global definitions in flat config |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ESLint | Biome | Biome is faster but ESLint has mature React ecosystem |
| Prettier | Biome formatter | Biome is all-in-one but less mature, Prettier is battle-tested |
| CSS Modules | Styled Components | CSS-in-JS adds runtime cost, CSS Modules are zero-runtime |
| CSS Modules | Tailwind CSS | Would require major rewrite, CSS Modules work with existing theme |

**Installation:**
```bash
npm install --save-dev eslint@^9 @eslint/js@^9 globals@^15 eslint-plugin-react@^7 eslint-plugin-react-hooks@^5 prettier@^3 eslint-config-prettier@^9 --save-exact
```

## Architecture Patterns

### Recommended Project Structure (Current State)

```
src/
├── components/
│   ├── Router/
│   │   ├── GameLayout.jsx (607 lines - REFACTOR TARGET)
│   │   └── GameLayout.module.css
│   ├── [feature]/
│   │   ├── Component.jsx
│   │   └── Component.module.css
├── hooks/
│   ├── useGameEvents.js (NEW - extract EventBus game logic)
│   ├── usePhaserBridge.js (NEW - extract Phaser communication)
│   ├── useOverlayManager.js (NEW - extract overlay state)
│   └── [existing hooks...]
├── store/
│   └── slices/
│       └── [slice].js (add createSelector to 5 remaining slices)
└── styles/
    └── theme.js (keep - shared constants)
```

### Pattern 1: EventBus Listener Extraction

**What:** Extract EventBus listener setup from components into reusable custom hooks
**When to use:** When a component has 5+ EventBus listeners or exceeds 300 lines
**Example:**

```javascript
// hooks/useGameEvents.js
export function useGameEvents() {
  const dispatch = useDispatch();
  const playSFX = useAudio().playSFX;

  useEffect(() => {
    const handleChestOpened = ({ amount, id }) => {
      playSFX('chest');
      dispatch(markChestOpened(id));
      dispatch(addDirhams(amount));
      // ... quest tracking logic
    };

    EventBus.on('chest-opened', handleChestOpened);
    return () => EventBus.off('chest-opened', handleChestOpened);
  }, [dispatch, playSFX]);
}

// GameLayout.jsx (after refactor)
function GameLayout() {
  useGameEvents();        // Handles chest, bookshelf, etc.
  usePhaserBridge();      // Handles zone transitions, fast travel
  useOverlayManager();    // Handles dialogue, quiz, sign overlays
  // ...component is now 200 lines instead of 607
}
```

**Source:** [Common Sense Refactoring of a Messy React Component](https://alexkondov.com/refactoring-a-messy-react-component/)

### Pattern 2: Memoized Selectors with createSelector

**What:** Use createSelector for selectors that derive/transform data to prevent unnecessary recalculations
**When to use:** Any selector that filters arrays, maps objects, or performs computations
**Example:**

```javascript
// playerSlice.js - BEFORE (unmemoized, recalculates every render)
export const selectActiveBoosts = (state) =>
  state.player.boosts.filter(b => b.expiresAt > Date.now());

// playerSlice.js - AFTER (memoized, only recalculates when boosts array changes)
export const selectActiveBoosts = createSelector(
  [(state) => state.player.boosts],
  (boosts) => boosts.filter(b => b.expiresAt > Date.now())
);
```

**Source:** [Redux Toolkit's createSelector: Advanced Performance Optimization](https://borstch.com/blog/development/redux-toolkits-createselector-advanced-performance-optimization-techniques)

### Pattern 3: CSS Modules Migration from Inline Styles

**What:** Move inline style objects to CSS Module files with kebab-case class names
**When to use:** For all components currently using `const styles = { ... }` pattern (37 files)
**Example:**

```javascript
// BEFORE - SignOverlay.jsx with inline styles
const styles = {
  overlay: {
    position: 'absolute',
    inset: 0,
    background: COLORS.overlay,
    // ... 50 lines of styles
  }
};
return <div style={styles.overlay}>...</div>;

// AFTER - SignOverlay.jsx with CSS Modules
import styles from './SignOverlay.module.css';
return <div className={styles.overlay}>...</div>;

// SignOverlay.module.css (NEW)
.overlay {
  position: absolute;
  inset: 0;
  background: var(--color-overlay);
  /* CSS variables from theme */
}
```

**Note:** Keep `src/styles/theme.js` for shared constants that need JS access (COLORS, FONTS), convert to CSS custom properties where appropriate.

**Source:** [CSS Modules best practices](https://github.com/css-modules/css-modules)

### Pattern 4: Component Splitting by Responsibility

**What:** Split 300+ line components into sub-components with single responsibilities
**When to use:** GameLayout (607 lines), GrammarLesson (655 lines), AlphabetModule (604 lines)
**Example:**

```javascript
// BEFORE - GameLayout.jsx (607 lines, all in one file)
function GameLayout() {
  // 280 lines of EventBus setup
  // 50 lines of session tracking
  // 50 lines of keyboard shortcuts
  // 200+ lines of JSX
}

// AFTER - GameLayout.jsx (target: <200 lines)
function GameLayout() {
  useGameEvents();       // 20 lines (defined in hooks/useGameEvents.js)
  usePhaserBridge();     // 15 lines (defined in hooks/usePhaserBridge.js)
  useOverlayManager();   // 15 lines (defined in hooks/useOverlayManager.js)
  useSessionTracking();  // 10 lines (extracted from GameLayout)
  useKeyboardShortcuts();// 10 lines (extracted from GameLayout)

  return (
    <div className={styles.container}>
      <PhaserGame ref={phaserRef} />
      <GameHUD />              {/* HUD + MiniMap + Toasts */}
      <GameOverlays />         {/* Dialogue, Quiz, Sign, etc. */}
      <Outlet />
    </div>
  );
}
```

**Source:** [Splitting Components in React: A Path to Cleaner and More Maintainable Code](https://thiraphat-ps-dev.medium.com/splitting-components-in-react-a-path-to-cleaner-and-more-maintainable-code-f0828eca627c)

### Anti-Patterns to Avoid

- **EventBus overuse:** While EventBus is necessary for Phaser↔React communication, don't add more EventBus patterns. Use Redux or prop drilling for pure React communication.
- **Premature abstraction:** Don't extract a component until it's actually reused or the parent exceeds 300 lines.
- **CSS Modules + inline styles mixing:** After migration, avoid mixing—commit to CSS Modules for all styling.
- **Over-memoization:** Don't wrap every selector in createSelector—only those performing transformations/filtering.

**Sources:**
- [EventBus in React Applications](https://tips.rstankov.com/p/eventbus-in-react-applications)
- [Popular patterns and anti-patterns with React Hooks](https://dev.to/justboris/popular-patterns-and-anti-patterns-with-react-hooks-4da2)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ESLint config | Custom linting rules from scratch | @eslint/js recommended + eslint-plugin-react | Years of community refinement, catches subtle bugs |
| CSS naming | Ad-hoc naming scheme | Kebab-case for CSS Modules (block-name__element-name--modifier) | Reduces cognitive load, prevents conflicts |
| Selector memoization | Manual caching with useRef | createSelector from @reduxjs/toolkit | Built-in shallow equality, composition support, battle-tested |
| Code formatting | Manual style guide | Prettier with defaults | Eliminates bikeshedding, auto-fixable |

**Key insight:** Architecture tooling is mature in 2026. Use established tools and patterns rather than custom solutions. Your competitive advantage is the game logic, not the linter.

## Common Pitfalls

### Pitfall 1: ESLint Flat Config Migration Errors

**What goes wrong:** Using old .eslintrc.* format with ESLint 9, or mixing flat/legacy configs
**Why it happens:** ESLint 8 supported both formats, ESLint 9+ requires flat config (eslint.config.js)
**How to avoid:**
- Delete any .eslintrc.* files before creating eslint.config.js
- Use `import` syntax, not `require` (flat config uses ESM)
- Use `export default` array of config objects
- Set `languageOptions.globals` instead of top-level `env`

**Warning signs:** Error "Invalid 'extends' value" or "env is not supported"

**Source:** [Evolving flat config with extends](https://eslint.org/blog/2025/03/flat-config-extends-define-config-global-ignores/)

### Pitfall 2: React Version Warning in ESLint

**What goes wrong:** `Warning: React version not specified in eslint-plugin-react settings`
**Why it happens:** eslint-plugin-react needs to know React version for version-specific rules
**How to avoid:** Add settings to eslint.config.js:
```javascript
{
  settings: {
    react: {
      version: 'detect'  // Auto-detect from package.json
    }
  }
}
```

**Warning signs:** ESLint warning during lint or build

**Source:** [Bug: React version not specified](https://github.com/jsx-eslint/eslint-plugin-react/issues/3802)

### Pitfall 3: Breaking Tests During EventBus Refactor

**What goes wrong:** Moving EventBus listeners to custom hooks breaks existing tests
**Why it happens:** Tests mock EventBus at component level, hooks change test surface area
**How to avoid:**
- Run `npm test` after each hook extraction
- Update test mocks to mock hooks instead of inline listeners
- Use existing `src/test/setup.js` global EventBus mock
- Test hooks in isolation first, then integration

**Warning signs:** Tests fail with "EventBus.on is not a function" or timeout waiting for events

**Source:** Project's existing testing.md patterns

### Pitfall 4: CSS Modules Variable Scope

**What goes wrong:** CSS custom properties defined in component module aren't available globally
**Why it happens:** CSS Modules scope styles to component by default
**How to avoid:**
- Keep global variables (COLORS, FONTS) in `:root` or separate global.css
- Use `composes` for shared styles across modules
- Convert theme.js constants to CSS custom properties in :root for dual access

**Example:**
```css
/* global.css */
:root {
  --color-overlay: rgba(0,0,0,0.85);
  --color-xp-gold: #e2b659;
}

/* Component.module.css */
.overlay {
  background: var(--color-overlay);  /* Works! */
}
```

**Warning signs:** Styles work locally but not when composed, or can't reference theme colors

**Source:** CSS Modules documentation

### Pitfall 5: Over-Splitting Components

**What goes wrong:** Creating too many tiny components (10-20 lines each) that aren't reused
**Why it happens:** Misunderstanding "single responsibility" as "one function per component"
**How to avoid:**
- Split only when component >300 lines OR logic is reused in 2+ places
- Keep related JSX together (don't split a 30-line render into 5 sub-components)
- Use custom hooks for logic extraction, not always components

**Warning signs:** 20+ import statements, components with 1-2 props only used once

**Source:** [How Many Lines of Code Until I Need to Refactor a React Component?](https://medium.com/geekculture/how-many-lines-of-code-until-i-need-to-refactor-a-react-component-c1b8d16f5a5b)

## Code Examples

Verified patterns from official sources:

### ESLint 9 Flat Config for React 19 + Vite

```javascript
// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,  // React 17+ no import React
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',  // Using Redux/hooks, not PropTypes
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  prettier,  // Must be last to override conflicting rules
];
```

**Source:** [Setting Up ESLint and Prettier in a React 19 Project with Vite](https://javascript.plainenglish.io/setting-up-eslint-and-prettier-in-a-react-19-project-with-vite-using-eslint-9-326147501971)

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100,
  "arrowParens": "always"
}
```

```
// .prettierignore
node_modules/
dist/
build/
coverage/
*.min.js
```

**Source:** [Prettier Configuration for React/Next.js Projects 2025](https://dev.to/vikasparmar/prettier-configuration-for-reactnextjs-projects-2025-4oh5)

### Package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,json,css}\"",
    "format:check": "prettier --check \"src/**/*.{js,jsx,json,css}\""
  }
}
```

### createSelector Migration Pattern

```javascript
// questSlice.js - BEFORE
export const selectActiveQuests = (state) =>
  Object.entries(state.quests.quests)
    .filter(([_, q]) => q.status === 'active')
    .map(([id, q]) => ({ id, ...q }));

// questSlice.js - AFTER
export const selectActiveQuests = createSelector(
  [(state) => state.quests.quests],
  (quests) =>
    Object.entries(quests)
      .filter(([_, q]) => q.status === 'active')
      .map(([id, q]) => ({ id, ...q }))
);
```

**Source:** [Redux Essentials Part 6: Performance, Normalizing Data](https://redux.js.org/tutorials/essentials/part-6-performance-normalization)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| .eslintrc.json | eslint.config.js (flat config) | ESLint 9.0 (2024) | Simpler config, better TypeScript support |
| Class components | Function components + hooks | React 16.8+ (2019), standard by 2026 | Less boilerplate, better composition |
| Inline styles everywhere | CSS Modules for components, CSS vars for theme | 2015+, standard by 2020 | Better performance, dev tools support |
| Plain selectors | Memoized selectors (createSelector) | Reselect 2.0+ (2015), RTK includes it | Prevents unnecessary re-renders |
| PropTypes | TypeScript or skip | 2020+ trend away from PropTypes | TS preferred for type safety, many skip types entirely in JS projects |

**Deprecated/outdated:**
- `.eslintrc.*` files: Use eslint.config.js (ESLint 9+ won't support legacy format in future)
- `react/react-in-jsx-scope` rule: Disable for React 17+ (automatic JSX runtime)
- Manual EventBus cleanup: Already using useEffect cleanup, keep pattern
- BEM naming in CSS Modules: Kebab-case simpler (`block-name` not `block__element--modifier`)

## Open Questions

1. **Should we extract PauseMenu and ActivitiesMenu from GameLayout.jsx?**
   - What we know: They're currently nested in GameLayout (lines 55-149, 148 lines total)
   - What's unclear: Should they move to separate files or stay colocated?
   - Recommendation: Move to `src/components/UI/PauseMenu.jsx` (already has test file at `src/components/UI/__tests__/PauseMenu.test.jsx`) to match existing structure

2. **How aggressively should we migrate inline styles?**
   - What we know: 37 files use inline styles, theme.js provides shared constants
   - What's unclear: Migrate all at once or prioritize high-traffic components?
   - Recommendation: Migrate incrementally—start with GameLayout and components >300 lines, leave smaller components for later phases

3. **Should we add ESLint pre-commit hooks?**
   - What we know: No Husky/lint-staged currently configured
   - What's unclear: User preference for enforcing linting in workflow
   - Recommendation: Configure scripts only in Phase 11, defer Husky to Phase 12 (Backend Hardening) if desired

4. **How to handle theme.js after CSS Modules migration?**
   - What we know: theme.js exports JS objects used in 37 components, some values needed in JS (e.g., dynamic calculations)
   - What's unclear: Keep theme.js + CSS custom properties or consolidate?
   - Recommendation: Dual approach—CSS custom properties in :root for static values, keep theme.js for values needed in JS logic (colors for Phaser, dynamic calculations)

## Sources

### Primary (HIGH confidence)

- [ESLint Official Docs - Flat Config](https://eslint.org/blog/2025/03/flat-config-extends-define-config-global-ignores/) - Flat config migration guide
- [Redux Toolkit Docs - Deriving Data with Selectors](https://redux.js.org/usage/deriving-data-selectors) - createSelector patterns
- [eslint-plugin-react GitHub](https://github.com/jsx-eslint/eslint-plugin-react) - React 19 compatibility
- [eslint-plugin-react-hooks npm](https://www.npmjs.com/package/eslint-plugin-react-hooks) - Hooks rules for ESLint 9

### Secondary (MEDIUM confidence)

- [Setting Up ESLint and Prettier in a React 19 Project with Vite (Using ESLint 9)](https://javascript.plainenglish.io/setting-up-eslint-and-prettier-in-a-react-19-project-with-vite-using-eslint-9-326147501971) - Practical setup guide
- [Common Sense Refactoring of a Messy React Component](https://alexkondov.com/refactoring-a-messy-react-component/) - Component splitting patterns
- [EventBus in React Applications](https://tips.rstankov.com/p/eventbus-in-react-applications) - EventBus patterns and tradeoffs
- [Redux Toolkit's createSelector: Advanced Performance Optimization](https://borstch.com/blog/development/redux-toolkits-createselector-advanced-performance-optimization-techniques) - Memoization techniques
- [Splitting Components in React: A Path to Cleaner and More Maintainable Code](https://thiraphat-ps-dev.medium.com/splitting-components-in-react-a-path-to-cleaner-and-more-maintainable-code-f0828eca627c) - Refactoring strategies
- [Prettier Configuration for React/Next.js Projects 2025](https://dev.to/vikasparmar/prettier-configuration-for-reactnextjs-projects-2025-4oh5) - Standard Prettier setup
- [Popular patterns and anti-patterns with React Hooks](https://dev.to/justboris/popular-patterns-and-anti-patterns-with-react-hooks-4da2) - Hook pitfalls
- [Master CSS Naming Conventions in 2025: BEM, OOCSS, SMACSS](https://medium.com/@wmukhtar/master-css-naming-conventions-in-2025-bem-oocss-smacss-suit-css-and-beyond-c3afe583c92b) - CSS naming patterns

### Tertiary (LOW confidence)

- [33 React JS Best Practices For 2026](https://technostacks.com/blog/react-best-practices/) - General best practices (marketing site, verify specifics)
- [How Many Lines of Code Until I Need to Refactor a React Component?](https://medium.com/geekculture/how-many-lines-of-code-until-i-need-to-refactor-a-react-component-c1b8d16f5a5b) - 300-line rule (opinion piece, not research)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official packages with version compatibility verified via npm/GitHub
- Architecture: HIGH - Patterns verified in Redux/React official docs + multiple secondary sources
- Pitfalls: MEDIUM-HIGH - Common issues documented in GitHub issues + community posts

**Research date:** 2026-02-09
**Valid until:** 2026-05-09 (90 days - stable ecosystem, ESLint/Prettier change slowly)

---

## Codebase-Specific Findings

### Current State Analysis

**GameLayout.jsx (607 lines):**
- Lines 1-54: Imports + ActivitiesMenu component (113 lines)
- Lines 115-149: PauseMenu component (35 lines)
- Lines 222-502: EventBus listener useEffect (280 lines) ← **PRIMARY REFACTOR TARGET**
- Lines 506-520: Session tracking useEffect (15 lines)
- Lines 523-545: Keyboard shortcuts useEffect (23 lines)
- Lines 547-607: JSX render (60 lines)

**Refactor breakdown:**
1. Extract EventBus listeners → `hooks/useGameEvents.js` (save 280 lines)
2. Extract PauseMenu/ActivitiesMenu → `components/UI/PauseMenu.jsx` (save 113 lines)
3. Extract session tracking → inline in GameLayout or `hooks/useSessionTracking.js` (save 15 lines)
4. Extract keyboard shortcuts → `hooks/useKeyboardShortcuts.js` (save 23 lines)
5. **Net result:** GameLayout.jsx ~175 lines (71% reduction)

**EventBus Usage:**
- 7 files use EventBus.on (GameLayout, ContextualOnboarding, HUD, QuestTracker, WorldScene, useEventBusListeners, PhaserGame)
- 114 total EventBus.on/emit calls across codebase
- **Note:** `useEventBusListeners.js` already exists but isn't used by GameLayout - investigate reuse potential

**Redux Slices Needing createSelector:**
- `achievementSlice.js` (190 lines) - Already has 7 createSelectors ✓
- `vocabularySlice.js` (73 lines) - Already has 4 createSelectors ✓
- `dailyGoalsSlice.js` (191 lines) - Already has 7 createSelectors ✓
- `playerSlice.js` (349 lines) - Already has 12 createSelectors ✓
- `questSlice.js` (323 lines) - Already has 7 createSelectors ✓
- `battleSlice.js` (140 lines) - Already has 6 createSelectors ✓
- `grammarSlice.js` (158 lines) - Already has 7 createSelectors ✓
- **Slices WITHOUT createSelector (need audit):**
  - `npcSlice.js` (47 lines) - Check if selectors exist
  - `alphabetSlice.js` (55 lines) - Check if selectors exist
  - `settingsSlice.js` (57 lines) - Check if selectors exist
  - `uiSlice.js` (78 lines) - Check if selectors exist
  - `syncSlice.js` (145 lines) - Check if selectors exist

**Inline Styles Migration Priority:**
1. **High Priority (>300 lines):** GameLayout, GrammarLesson, AlphabetModule, ReadingExercise, WordSearch, SentenceBuilder, ReviewSession
2. **Medium Priority (200-300 lines):** WorldMap, QuestLog, ShopOverlay, RootExplorer, AchievementPanel, SentencePractice, WordDuel
3. **Low Priority (<200 lines):** Remaining 20 files

**Testing Safety Net:**
- 548 tests across 31 files
- Component tests exist for: HUD, PauseMenu, DailyDashboard, WorldMap, PlayerProfile, QuizOverlay, DialogueOverlay
- **NOTE:** PauseMenu test exists but PauseMenu component currently embedded in GameLayout—test file likely targets different PauseMenu or is stale
- All EventBus usage already covered by test mocks in `src/test/setup.js`

**ESLint/Prettier Status:**
- No existing .eslintrc or prettier config files
- package.json has no lint/format scripts
- **Clean slate:** No migration needed, start fresh with ESLint 9 flat config
