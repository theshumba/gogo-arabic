# Domain Pitfalls

**Domain:** Infrastructure & Polish for React+Phaser game
**Researched:** 2026-02-08

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Breaking GameLayout Without Tests
**What goes wrong:** GameLayout has 607 lines, 20+ imports, 50+ EventBus listeners. Refactoring without test coverage = broken game state, lost EventBus subscriptions, overlay rendering bugs.
**Why it happens:** "I'll just move this hook..." → cascade of unexpected dependencies.
**Consequences:** Game freezes, overlays don't open, NPC interactions fail, quests don't progress. Days of debugging.
**Prevention:** Write integration tests BEFORE refactoring. Test EventBus listener cleanup, overlay state transitions, Phaser lifecycle.
**Detection:** CI fails, manual smoke test (walk to NPC, trigger dialogue, complete quiz).

### Pitfall 2: Race Conditions in Backend Sync
**What goes wrong:** Two tabs/devices update same user data simultaneously. syncVersion check happens AFTER reading old state → both writes succeed → last write wins, data lost.
**Why it happens:** No MongoDB transactions, check-then-update not atomic.
**Consequences:** User loses quest progress, XP, vocabulary cards. Support tickets, data recovery needed.
**Prevention:** Use MongoDB transactions (`session.startTransaction()`), atomic syncVersion increment within transaction.
**Detection:** Run concurrent sync requests in E2E tests, check for 409 conflict responses.

### Pitfall 3: EventBus Memory Leaks
**What goes wrong:** Component mounts, subscribes to EventBus, unmounts without cleanup → listener still attached → callback fires on unmounted component → "Can't update unmounted component" errors, memory leak.
**Why it happens:** Forgot `return () => EventBus.off(...)` in useEffect cleanup.
**Consequences:** Performance degrades over time, console errors, eventual crash.
**Prevention:** Always pair `EventBus.on()` with cleanup. Use ESLint exhaustive-deps rule.
**Detection:** Manual test: navigate between routes 10+ times, check DevTools memory profiler for detached listeners.

### Pitfall 4: Missing Database Indexes at Scale
**What goes wrong:** No indexes on User.email, User.lastSyncedAt → full collection scan for every login, every sync → MongoDB CPU spikes, 5s+ response times → users think app is broken.
**Why it happens:** Works fine with 10 users, silently degrades at 1K+ users.
**Consequences:** App unusable, MongoDB crashes, emergency scaling needed.
**Prevention:** Add indexes BEFORE launch. Profile queries with `explain()`, ensure `IXSCAN` not `COLLSCAN`.
**Detection:** Load test with 1K users, monitor MongoDB slow query log (>100ms).

### Pitfall 5: Inline Styles Block Code Splitting
**What goes wrong:** Inline style objects are JavaScript → can't be extracted to CSS file → included in main bundle → large bundle size → slow initial load.
**Why it happens:** Inline styles convenient, CSS modules more setup.
**Consequences:** Bundle size 2-3x larger than needed, poor Lighthouse score, users on slow networks bounce.
**Prevention:** Use CSS modules for all components, extract design tokens to variables.css.
**Detection:** `npm run build`, check bundle size. Run Lighthouse audit.

## Moderate Pitfalls

Annoying but fixable without major rewrites.

### Pitfall 6: Untested Middleware Logic
**What goes wrong:** Achievement middleware has complex threshold checks. Bug in logic → achievements unlock too early/late → user frustration, data inconsistency.
**Why it happens:** Middleware hard to test (needs full Redux store), skipped in initial tests.
**Consequences:** Wrong achievements, support tickets, manual data fixes.
**Prevention:** Mock Redux store in tests, test each achievement condition path.
**Detection:** Unit test coverage <60% on middleware files.

### Pitfall 7: Phaser Animation State Bugs
**What goes wrong:** Player has 16 animation states (walk×4, sprint×4, idle×4, boost×4). Transitions not managed → stuck in "walk-left" while moving right → visual glitch.
**Why it happens:** Ad-hoc animation switching, no state machine.
**Consequences:** Visual bugs, player looks wrong, immersion broken.
**Prevention:** Centralize animation logic in Player.js, document state transitions.
**Detection:** Manual test: walk in all directions, sprint, boost, check animations match movement.

### Pitfall 8: Over-Mocking in Tests
**What goes wrong:** Mock everything (EventBus, Redux, Phaser) → tests pass but real integration broken → "works in tests, fails in prod."
**Why it happens:** Integration tests hard, mocking easy.
**Consequences:** False confidence, bugs slip to production.
**Prevention:** Use real Redux store in component tests, real EventBus where possible. Mock only I/O (fetch, timers).
**Detection:** E2E tests catch what unit tests miss.

### Pitfall 9: Linting Rules Too Strict
**What goes wrong:** Enable all ESLint rules → 1000+ errors → team ignores linting → eslint-disable everywhere → rules useless.
**Why it happens:** Copy-paste strict config without gradual adoption.
**Consequences:** No linting benefit, code quality doesn't improve.
**Prevention:** Start with `eslint:recommended` + `react/recommended`, add rules incrementally.
**Detection:** >50 eslint-disable comments = rules too strict.

### Pitfall 10: CSS Specificity Wars
**What goes wrong:** Global CSS + CSS modules + inline styles → can't predict which style wins → !important everywhere → unmaintainable.
**Why it happens:** Mixed styling approaches over time.
**Consequences:** Hard to change styles, bugs when refactoring.
**Prevention:** Migrate to CSS modules only, use design tokens, ban inline styles.
**Detection:** Search codebase for `!important`, count inline style objects.

## Minor Pitfalls

Small issues, easy fixes.

### Pitfall 11: Hardcoded Magic Numbers
**What goes wrong:** `setTimeout(fn, 5000)` → what is 5000? Debounce? Animation? Hard to tune.
**Why it happens:** Quick implementation, no constants file.
**Consequences:** Hard to adjust timing, copy-paste errors.
**Prevention:** Extract to constants: `const SYNC_DEBOUNCE_MS = 5000;`
**Detection:** Search for raw numbers in code.

### Pitfall 12: Unnecessary Re-Renders
**What goes wrong:** Component re-renders on every Redux state change, even unrelated slices.
**Why it happens:** `useSelector(state => state)` instead of specific selector.
**Consequences:** Sluggish UI, wasted CPU.
**Prevention:** Use specific selectors, memoize with createSelector.
**Detection:** React DevTools Profiler shows excessive renders.

### Pitfall 13: Missing Alt Text / ARIA Labels
**What goes wrong:** Screen readers can't navigate HUD buttons, overlays.
**Why it happens:** A11y afterthought.
**Consequences:** Accessibility lawsuit risk, excludes users.
**Prevention:** Add aria-label to all interactive elements, alt text to images.
**Detection:** Run axe DevTools, Lighthouse accessibility audit.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **Testing Phase 1** | Mocking EventBus breaks real integration | Use real EventBus, mock only external APIs |
| **Testing Phase 1** | 100% coverage goal = wasted time | Target 60-70%, focus on critical paths |
| **Arch Phase 2** | GameLayout refactor breaks imports in 100+ files | Search codebase for GameLayout imports first |
| **Arch Phase 2** | Extracting hooks changes EventBus lifecycle | Test cleanup in each hook |
| **Backend Phase 3** | Adding indexes blocks MongoDB for minutes | Run index creation off-peak, use background:true |
| **Backend Phase 3** | Transactions require replica set | Dev: use replica set, or defer transactions to production |
| **Visual Phase 4** | Pixel art icons blurry on retina | Use 2x sprites (32x32) or image-rendering: pixelated CSS |
| **Visual Phase 4** | Animation state machine over-engineered | Start simple, add XState only if needed |

## Testing-Specific Pitfalls

### Pitfall 14: Vitest vs Jest Confusion
**What goes wrong:** Copy Jest config → Vitest syntax different → tests fail mysteriously.
**Why it happens:** Vitest mostly compatible but not 100%.
**Consequences:** Wasted time debugging config.
**Prevention:** Use Vitest docs, not Jest docs. Check vitest.config.js syntax.

### Pitfall 15: Phaser Scene Tests in JSDOM
**What goes wrong:** JSDOM has no WebGL → Phaser crashes → can't test scenes.
**Why it happens:** Phaser needs canvas/WebGL, JSDOM doesn't provide.
**Consequences:** Game logic untestable in unit tests.
**Prevention:** Mock Phaser APIs with vitest-canvas-mock, or skip scene tests (defer to E2E).

### Pitfall 16: Async Test Timeouts
**What goes wrong:** EventBus fires async → test finishes before event → assertion never runs → false pass.
**Why it happens:** Forgot await waitFor() in async tests.
**Consequences:** Flaky tests, bugs slip through.
**Prevention:** Always use waitFor() when testing EventBus, Redux async actions.

## Backend-Specific Pitfalls

### Pitfall 17: Mongoose Deprecation Warnings
**What goes wrong:** Mongoose 9 changed defaults → useNewUrlParser warnings → logs cluttered.
**Why it happens:** Old connection string options.
**Consequences:** Annoying but harmless warnings.
**Prevention:** Remove deprecated options from mongoose.connect().

### Pitfall 18: JWT Secret in Git
**What goes wrong:** Commit .env with JWT_SECRET → secret leaked → attacker forges tokens → account takeover.
**Why it happens:** .env not in .gitignore.
**Consequences:** Security breach, all sessions compromised.
**Prevention:** Add .env to .gitignore, use .env.example template.
**Detection:** Search git history for JWT_SECRET, rotate if found.

### Pitfall 19: bcrypt Rounds Too High
**What goes wrong:** bcrypt.hash(password, 15) → 5s+ login time → users think app broken.
**Why it happens:** "More rounds = more secure" misunderstanding.
**Consequences:** UX degradation.
**Prevention:** Use 13 rounds (current), max 14. Balance security vs UX.
**Detection:** Profile /api/auth/login response time.

## Visual-Specific Pitfalls

### Pitfall 20: Sprite Atlas Cache Issues
**What goes wrong:** Update sprite PNG → browser caches old version → players see wrong sprites.
**Why it happens:** No cache-busting in Phaser asset URLs.
**Consequences:** Visual bugs after deploy.
**Prevention:** Use Vite's asset hashing (automatic), or append ?v=timestamp to URLs.
**Detection:** Hard refresh (Ctrl+Shift+R) shows different sprite than normal refresh.

## Sources

Research based on codebase analysis and common React+Phaser patterns:
- GameLayout.jsx (607 lines, complex lifecycle)
- EventBus usage patterns across codebase
- Backend sync implementation (no transactions currently)
- MongoDB User model (no indexes on email/lastSyncedAt)
- Mixed styling approaches (CSS modules + inline)
- Existing test patterns (mocking EventBus in HUD.test.jsx)
- Phaser Player.js animation logic (16 states)
