# Code Review: Infrastructure / Utils / Hooks / Tests
Reviewed: 2026-05-11
Files in scope: ~70 (utils 31, hooks 20, hook/util tests 22, e2e 6, scripts in-scope 8, configs 4, factories 3, theme 2, tools 5, docs 3)

## Summary
- **XP/level progression math is broken** (`getLevelFromXP` double-cumulates an already-cumulative XP table) — tests lock in the wrong behaviour. Real player-facing bug.
- **`getAffixMultiplier` is dead logic** — compares `card.state` (which is the wrapper `{card, log}`, not the inner card) against the string `'Review'`, but ts-fsrs uses a numeric `State` enum. Every affix bonus is permanently clamped to 0.5 regardless of mastery. Tests pass an incorrect shape and assert the buggy outcome.
- **E2E pre-seed pattern is silently broken in 5 of 6 specs.** Every `beforeEach` calls `page.evaluate(() => localStorage.setItem(...))` BEFORE `page.goto(...)` — Playwright is on `about:blank`, so the localStorage write lands on the wrong origin and the test app boots empty. Quest / review / shop / fast-travel / character-skip scenarios are not actually exercised.
- **Two `npm run` scripts point at a non-existent `client/` directory** (`build:alphabet`, `build:vocabulary`). They never validated anything in this repo.
- **Vitest never runs `/tests/syncMerge.test.js`** — config glob is `src/**/*.{test,spec}.{js,jsx}`, so the sole tests outside `src/` are orphaned.
- 5+ inline diacritic-stripping regexes with **different unicode ranges** across hooks/utils → silent normalization drift between quiz grading paths.
- 17 of 20 React hooks have no tests; `useDialogue` (435 lines), `useBattle` (310 lines), and the entire `useEventBusListeners` graph carry production logic with zero unit coverage.

## Findings

### HIGH `getLevelFromXP` double-counts an already-cumulative XP table
**File:** `src/utils/xpCalculator.js:31-38`
**Category:** bug
**Issue:** `XP_TABLE` stores cumulative thresholds (`100, 250, 450, 700, ...` = total XP needed at each level). `getXPForLevel` returns those values verbatim. But `getLevelFromXP` then sums them inside a loop (`cumulative += getXPForLevel(level)`), so to "reach level 4" the function demands `0+100+250+450 = 800` XP instead of the table's 450. The test file confirms this is wrong-on-purpose: line 56–61 of `__tests__/xpCalculator.test.js` documents "250 is still level 2" and "0+100+250+450=800 for level 4". Players who collect 450 XP show as level 3 instead of 4; effective levelling curve is ~2× harder than designed.
**Why it matters:** Core progression mechanic is mis-tuned. Players plateau slower than every quest reward / boss balance was scaled for. Tests prevent regression *toward* the correct behaviour.
**Suggested fix:**
```js
export function getLevelFromXP(totalXP) {
  if (totalXP < getXPForLevel(2)) return 1;
  for (let level = 2; level <= 100; level++) {
    if (totalXP < getXPForLevel(level + 1)) return level;
  }
  return 100;
}
```
Then rewrite the locked-in tests against the table’s actual thresholds.

### HIGH `getAffixMultiplier` accesses wrong nesting AND compares against wrong type
**File:** `src/utils/affixMatcher.js:15-31`
**Category:** bug
**Issue:** Two stacked bugs:
1. `vocabularyState.fsrsCards[wordId]` returns the persisted wrapper `{ card, log }`, not the FSRS card itself — so `card.state` is `undefined`.
2. Even if the inner card were reached, ts-fsrs's `State` is a **numeric enum** (`{New=0, Learning=1, Review=2, Relearning=3}`, confirmed in `node_modules/ts-fsrs/dist/*.d.ts`), so `card.state === 'Review'` is `false` no matter what.
Combined effect: every affix on every item returns `0.5`, regardless of how mastered the underlying word is. The whole "learn the Arabic affix to power up your gear" mechanic is non-functional.
**Why it matters:** Major game system silently broken. Tests in `__tests__/affixMatcher.test.js` feed `{ state: 'Review' }` (string) — they validate the bug, not the spec. Same string vs numeric mismatch will bite anywhere else `card.state === 'Review'` is written.
**Suggested fix:**
```js
import { State } from 'ts-fsrs';
export function getAffixMultiplier(wordId, vocabularyState) {
  const entry = vocabularyState?.fsrsCards?.[wordId];
  const card = entry?.card;
  if (!card) return 0.5;
  return card.state === State.Review ? 1.0 : 0.5;
}
```
Then fix the tests to pass `{ word_sharp: { card: { state: State.Review } } }`.

### HIGH E2E `beforeEach` pre-seeds localStorage before any navigation
**File:** `e2e/quest-completion.spec.js:4-80`, `e2e/review-session.spec.js:4-95`, `e2e/shop-purchase.spec.js:4-80`, `e2e/fast-travel.spec.js:4-?`, `e2e/auth.spec.js:80-132`
**Category:** test-fragility / test-gap
**Issue:** Each `beforeEach` calls `await page.evaluate(() => localStorage.setItem('persist:gogo-arabic', ...))` *before* the test body's `await page.goto('/')`. At that point Playwright's page is still on `about:blank` (or the previous test's origin in `reuseExistingServer` mode), so the write lands on the wrong origin. On the subsequent `goto('/')`, the app boots with no seeded state. Tests then proceed against a default new-player session, so the assertions ("quest is completed", "review session loads with seeded cards", "shop seeded with 1000 dirhams") aren't validating what they claim.
**Why it matters:** Five of the six e2e specs give false confidence — the only paths actually exercised are the empty-state defaults. Critical user flows (save/load, lesson completion, shop purchase, fast travel) have effectively zero coverage.
**Suggested fix:** Use Playwright's `context.addInitScript()` pattern (runs *before* every page script) or seed inside the test body after navigating to a no-op page on the right origin:
```js
test.beforeEach(async ({ page }) => {
  await page.goto('/'); // establish origin
  await page.evaluate((data) => localStorage.setItem('persist:gogo-arabic', JSON.stringify(data)), playerData);
  await page.reload();  // boot with seeded state
});
```

### HIGH `useQuiz.buildChoices` mutates shared vocabulary objects
**File:** `src/hooks/useQuiz.js:213, 235-240, 264, 284`
**Category:** bug
**Issue:** Inside `buildChoices` for several quiz types, the function writes onto the `word` object: `word.dialectItem = item`, `word.rootExpansion = { ... }`, `word.sentenceBuild = sentence`, `word.culturalItem = item`. These `word` objects come from `vocabulary` (`vocabularyAll.js`) which is a module-scope import shared across the entire app and across multiple `useQuiz` renders. So one quiz session contaminates the next — and contaminates `useBattle`, `useDialogue`, anything else reading vocabulary. Later quizzes on the same word will read stale `dialectItem` / `rootExpansion` data.
**Why it matters:** Cross-session bleed-through. Most visible failure mode: a `DialectIdentify` answered correctly on word X → next quiz uses word X for a different type but `answer()` falls into the dialect branch (via `word.dialectItem` still set) and grades against the wrong correct value. Also leaks: vocabulary objects accumulate properties forever — memory keeps growing within a long session.
**Suggested fix:** Return the contextual data as part of the choices list metadata or wrap in a session-local map keyed by `word.id`, rather than mutating the imported word.

### HIGH `useObjectEvents.handleBookshelfInteract` crashes when category has no words on reread
**File:** `src/hooks/useObjectEvents.js:112-146`
**Category:** bug
**Issue:** Line 124 picks `word = pool[Math.floor(Math.random() * pool.length)]`. If `pool` is empty (no words in that category and no unknown words), `word` is `undefined`. The `if (word && !reread)` branch at 126 correctly guards, but the `else if (reread)` branch at line 139 calls `word.arabic` and `word.english` with no guard — `TypeError: cannot read properties of undefined`. With the current vocabulary catalogue this is unlikely to hit, but any new bookshelf wired to a future/empty category crashes the React tree on reread.
**Why it matters:** Hard crash from a content-data state change, not a code change. Easy to introduce inadvertently.
**Suggested fix:** Wrap line 139 with `else if (reread && word)` and emit a benign "Nothing new here" notification when `word` is null.

### HIGH `npm run build:alphabet` / `build:vocabulary` reference a non-existent `client/` directory
**File:** `scripts/build-alphabet.js:13`, `scripts/build-vocabulary.js:16`
**Category:** bug / docs-drift
**Issue:** Both scripts read from `client/src/data/...`. No `client/` directory exists in the repo (paths are `src/data/...`). The scripts have *never* validated the current content. They also exit 0 due to `main().catch(console.error)` (see below), so CI couldn't tell.
**Why it matters:** Two `npm run` scripts in the public surface area are pure no-ops. Anybody auditing "we validate alphabet/vocab on every build" will be misled.
**Suggested fix:** Either update paths to `src/data/alphabet.json` / `src/data/vocabulary.json` or delete the scripts and remove from `package.json`. `scripts/validate-vocab.mjs` already does the right thing — consider folding the alphabet check there.

### HIGH Vitest config glob excludes `/tests/` directory
**File:** `vitest.config.js:11`
**Category:** test-gap
**Issue:** `include: ['src/**/*.{test,spec}.{js,jsx}']` matches only files under `src/`. `tests/syncMerge.test.js` (a real test suite, not a stub) never runs under `npm test`. The coverage thresholds (`statements: 24, lines: 24`) silently exclude it.
**Why it matters:** Orphaned test file gives the impression of coverage that doesn't exist; a future regression in `syncMerge.js` (which handles cloud-sync conflict resolution — i.e., save data) won't be caught.
**Suggested fix:** Either move the file to `src/utils/__tests__/syncMerge.test.js` or extend the include glob: `include: ['src/**/*.{test,spec}.{js,jsx}', 'tests/**/*.{test,spec}.{js,jsx}']`.

### MEDIUM Inconsistent diacritic-stripping ranges across utilities
**File:** `src/utils/arabicUtils.js:4`, `src/utils/sentenceParser.js:17`, `src/utils/tashkeelFading.js:16`, `src/utils/wordSearchGenerator.js:22`, `src/hooks/useQuiz.js:361`, `src/hooks/useBattle.js:152`
**Category:** bug / dead-code (DRY)
**Issue:** Five+ regex ranges in use:
- `arabicUtils` / `tashkeelFading`: `[ً-ٰٟۖ-ۭ]` (includes Quranic annotations)
- `sentenceParser`: `[ؐ-ًؚ-ٟـٰۖ-ۜ۟-ۤۧ-۪ۨ-ۭ]` (also strips kashida + Quranic annotation marks)
- `wordSearchGenerator` / `useQuiz` / `useBattle`: `[ً-ٰٟ]` (basic tashkeel only)
`useBattle` and `useQuiz` will mark answers wrong if the player types kashida or Quranic annotation characters that the expected string didn't normalize. Behaviour diverges depending on which code path runs.
**Why it matters:** Quiz/battle grading is inconsistent for the same input; subtle, will appear as flaky-feeling "wrong answers."
**Suggested fix:** Move all stripping to a single `stripDiacritics(text, { mode: 'basic' | 'all' })` in `arabicUtils.js` and replace the inline regexes. Decide one ground truth for what counts as a "diacritic" in grading.

### MEDIUM `useFormatArabic` mutates a `useCallback` return value every render
**File:** `src/hooks/useFormatArabic.js:152-157`
**Category:** hooks
**Issue:** The hook builds `formatArabic` via `useCallback`, then attaches properties (`returnValue.getTashkeelOpacity = ...`, `returnValue.renderArabic = ...`) on the memoized function every render. Memoization identity is preserved across renders (good for `useEffect` deps), but the attached fields point to *new* callbacks on every render — consumers reading `formatArabic.renderArabic` get stale-or-fresh inconsistently and can't memoize on `formatArabic` identity. Also `useMemo` is imported but never used.
**Why it matters:** Confusing API, breaks ref equality consumers might rely on, hard to test.
**Suggested fix:** Return a plain object `{ formatArabic, getTashkeelOpacity, renderArabic }` (with all three memoized via `useMemo`) and let consumers destructure. Drop the unused `useMemo` import (it's actually still needed once you switch — keep it).

### MEDIUM Stale closure in `useZoneEvents` micro-review cooldown
**File:** `src/hooks/useZoneEvents.js:91-95`
**Category:** hooks
**Issue:** Cooldown state is stored on the `handleZoneChange` function itself (`handleZoneChange._lastMicroReview = now`). But `handleZoneChange` is redeclared every time the effect re-runs (deps include `[dispatch, playSFX, phaserRef]`). Although `playSFX` from `useAudio` is currently stable (empty-deps `useCallback`), it's fragile — anyone tweaking `useAudio` to recompute callbacks will silently wipe the cooldown on every render, spamming micro-reviews.
**Why it matters:** Hidden coupling to the audio hook's implementation detail; an unrelated change can produce a "why am I getting a quiz every time I move" bug.
**Suggested fix:** Hoist `let lastMicroReview = 0` outside the hook to module scope (matches the pattern used by `eventBus.js`), or store in a `useRef`.

### MEDIUM `playwright.config.js` retries=1 with `reuseExistingServer: true` causes test pollution
**File:** `playwright.config.js:6,16`
**Category:** test-fragility
**Issue:** With `reuseExistingServer: true` *and* `trace: 'on-first-retry'` *and* `retries: 1`, when a test pollutes localStorage (which happens — the auth flow writes `persist:gogo-arabic`), the next test sees stale state because the dev server (and the localStorage origin) is reused. Combined with the pre-seed bug above, the tests are effectively running in non-deterministic order with state bleed-through.
**Why it matters:** Flaky CI; expensive trace files generated on already-broken retries.
**Suggested fix:** Add a global setup or per-test `await context.clearCookies()` + `localStorage.clear()` AFTER navigation in a `beforeEach`. Consider `reuseExistingServer: !process.env.CI` to force a clean server in CI.

### MEDIUM E2E uses brittle text/icon regex selectors and 31 `waitForTimeout` calls
**File:** all of `e2e/*.spec.js`
**Category:** test-fragility
**Issue:** Selectors like `getByText(/character|name|create/i)`, `getByRole('button', { name: /new game|start/i })`, `getByText(/correct|incorrect|next|continue/i)` will match anything containing those substrings — easy to false-positive against unrelated UI strings. 31 calls to `page.waitForTimeout(...)` (smoke: 2000ms; quest: 500ms; review: 800ms / 1000ms / 2000ms) are arbitrary sleeps that race the app's actual readiness signals.
**Why it matters:** Tests will pass or fail based on machine speed; selectors will silently match wrong UI as the codebase grows. Combined with the broken seed pattern, e2e is mostly theatre.
**Suggested fix:** Add `data-testid` attributes to the critical interaction points (new-game button, quiz feedback panel, completion banner, etc.) and assert on those. Replace `waitForTimeout` with `expect(...).toBeVisible({ timeout })` or `waitForResponse` / `waitForFunction` on real readiness state.

### MEDIUM Vitest coverage thresholds are too low to be meaningful
**File:** `vitest.config.js:17-23`
**Category:** test-gap
**Issue:** `statements: 24`, `lines: 24`, `functions: 39` thresholds — comment says "Ratcheted to actual coverage (2026-03-19) — prevents regression." With 24% statement coverage, the threshold is effectively cosmetic: removing every other test would not trip it. Combined with 17/20 hooks untested and the orphaned `tests/syncMerge.test.js`, real coverage of safety-critical code (sync merge, quiz grading, FSRS) is unknown.
**Why it matters:** False sense of safety — "tests are passing and coverage gates green" can coexist with critical paths having no tests at all.
**Suggested fix:** Either ratchet aggressively as new tests land (raise by 2–3% per landing) or set per-directory minimums (e.g. `src/utils/**` → 70%, `src/store/middleware/**` → 60%).

### MEDIUM `seed-db.js` connects to MongoDB but doesn't seed anything; misleading npm alias
**File:** `scripts/seed-db.js:11-21`, `package.json:14`
**Category:** docs-drift / dead-code
**Issue:** `npm run seed` connects to MongoDB just to log "Database ready. No seed data required." If MongoDB is unreachable, it errors out and `process.exit(1)`s — but it had nothing to seed. This script's existence (and its `npm` alias) implies the project does seeding; it doesn't.
**Why it matters:** New contributors will run this expecting actual seed data and get a confusing failure when the optional backend isn't running.
**Suggested fix:** Either delete it + remove the `seed` script, or make it actually seed something (e.g. validate vocab JSON shape, write to a local sqlite, etc.).

### MEDIUM Scripts use `.catch(console.error)` instead of `process.exit(1)`
**File:** `scripts/build-alphabet.js:50`, `scripts/build-vocabulary.js:62`
**Category:** security / bug
**Issue:** Top-level `main().catch(console.error)` logs the error but exits with code 0. In a CI pipeline these scripts can never fail — even if the JSON is malformed and parsing crashes, the build step returns success.
**Why it matters:** Silent CI failures. Same anti-pattern as the seed script.
**Suggested fix:**
```js
main().catch(err => { console.error(err); process.exit(1); });
```

### MEDIUM `ralph.sh` runs Claude with `--dangerously-skip-permissions` and auto-merges to `main`
**File:** `scripts/ralph/ralph.sh:101-131`
**Category:** security
**Issue:** Loop runs Claude Code (or amp) with `--dangerously-skip-permissions`/`--dangerously-allow-all`, then if it sees `<promise>COMPLETE</promise>` in stdout it `git checkout main && git merge "$BRANCH" --no-edit && git branch -d "$BRANCH"`. Any prompt-injection inside any file the agent reads (NPC dialogue, vocabulary JSON, web-fetched content, even an `eslint-disable-next-line` comment) that emits the literal string `<promise>COMPLETE</promise>` triggers an auto-merge of whatever's on the branch into `main`. There's no validation that tests pass before merging — only what the agent itself reports.
**Why it matters:** Supply-chain risk. Any contributor (or any data file an agent fetches) can forge the completion sentinel and push unreviewed code to `main`. CLAUDE.md says "All three must pass. Do NOT commit if any fail" but this is enforced by the agent's promise, not by `ralph.sh`.
**Suggested fix:** Before the auto-merge, gate on real verifications:
```bash
npm run test:run && npm run lint && npm run build || { echo "Checks failed"; exit 1; }
```
Also: refuse to auto-merge if `BRANCH` is `main` already, and add a confirmation prompt or env-var like `RALPH_AUTO_MERGE=1` to enable destructive merges.

### MEDIUM `ralph-grow.sh` writes Claude output directly to `prd.json` without validating contents
**File:** `scripts/ralph/ralph-grow.sh:36-84`
**Category:** security
**Issue:** Pipes `claude --dangerously-skip-permissions --print <<HEREDOC` into `prd.json.tmp`, then `jq empty` validates only that it parses as JSON. If parsing fails it falls back to `prd-growth.json`, but if parsing succeeds the JSON is fed back into `ralph.sh` and executed against the codebase with full permissions. Combined with the previous issue, a single rogue PRD instructs the next iteration to do anything.
**Why it matters:** Self-rewriting agent loop with no integrity check beyond syntactic JSON.
**Suggested fix:** Add schema validation (zod or `ajv`) for the prd.json structure, refuse stories without explicit `branchName` matching `^ralph/growth-`, and require human approval (interactive confirmation) before the first auto-batch.

### MEDIUM `useTypewriter` `prefersReducedMotion` is captured at first render only
**File:** `src/hooks/useTypewriter.js:44-47`
**Category:** hooks
**Issue:** `const prefersReducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches).current;` — captured once on mount and never updated. If the user toggles the OS-level reduced-motion setting while the app is open (or if the page is restored from bfcache after a settings change), text continues animating. Compare with the dedicated `useReducedMotion` hook in the same folder that listens for `change` events; this one ignores them.
**Why it matters:** Accessibility regression — settings change not honoured live.
**Suggested fix:** Use `useReducedMotion()` instead of capturing `.matches` once.

### LOW `useDialogue.resumeAfterQuiz` calls method on possibly-undefined `tree`
**File:** `src/hooks/useDialogue.js:316-330`
**Category:** bug
**Issue:** `const tree = npc.dialogueTrees.find(...)`. If `tree` is `undefined`, the `else` branch (line 321) calls `engineRef.current.shouldReturnToHub(tree)` passing undefined. Whether this throws depends on `DialogueEngine.shouldReturnToHub`'s internals.
**Why it matters:** Edge-case crash after a quiz triggered from a dialogue tree that was renamed/removed mid-session.
**Suggested fix:** Guard explicitly: `if (!tree) { close(); return; }` before the else.

### LOW `useGameNavigation.goToBattle` doesn't URL-encode bossId
**File:** `src/hooks/useGameNavigation.js:51-53`
**Category:** bug
**Issue:** `navigate(\`/battle?boss=\${bossId}\`)` — a bossId containing `&`, `#`, `?` or whitespace produces an invalid URL or splits incorrectly.
**Why it matters:** Currently boss IDs look safe (`boss_alpha_1`), but any future content (e.g. dynamic IDs) could break navigation silently.
**Suggested fix:** `navigate(\`/battle?boss=\${encodeURIComponent(bossId)}\`)`.

### LOW `useTutorialTrigger` imports `PATH_FIRST_QUESTS` but never uses it
**File:** `src/hooks/useTutorialTrigger.js:9`
**Category:** dead-code
**Issue:** `PATH_FIRST_QUESTS` is imported from playerSlice but no longer referenced — eslint's `no-unused-vars` doesn't catch it because of `argsIgnorePattern` and the rule is set to `warn`, not `error`.
**Why it matters:** Slightly bigger import graph, signals incomplete refactor.
**Suggested fix:** Remove the import.

### LOW `useAudio` `useEffect` re-runs on every settings change instead of memoizing volumes
**File:** `src/hooks/useAudio.js:21-41`
**Category:** hooks
**Issue:** `useSelector((state) => state.settings)` returns a new object reference whenever any unrelated settings field changes (e.g. toggling diacritics). The effect's deps array references specific fields, so this is mostly OK, but the selector itself causes re-renders of any component using `useAudio` for unrelated settings changes. Combined with the fact that `useAudio` is called in `App.jsx` near the root, this is a quiet re-render multiplier.
**Why it matters:** Minor perf; mostly a code-smell signal.
**Suggested fix:** Use individual `useSelector((s) => s.settings.masterVolume)` calls (each subscribes only to its slice) or wrap with `useSelector(..., shallowEqual)` and destructure.

### LOW `vite.config.js` `validateDialoguePlugin` reads NPC JSON synchronously at every build
**File:** `vite.config.js:11-26`
**Category:** build-config
**Issue:** Sync `readFileSync(npcsPath)` during `buildStart`. Trigger condition `if (process.env.NODE_ENV !== 'production' && !process.argv.includes('build')) return;` means it runs on `npm run build` and any time `NODE_ENV=production`. The check is fine, but the npc JSON is large (per `split-npc-data.js`, original `npcs.json` is ~MB-class). Build is blocked on parse before any compilation begins.
**Why it matters:** Cold builds slightly slower; first-time contributors hit a parse error on bad JSON with no source map. Minor.
**Suggested fix:** Move validation behind `transform()` for `npcs.json` so it only runs when that file is touched, or run async with `readFile`.

### LOW `index.html` sets `lang="ar"` but document is mostly English
**File:** `index.html:2`
**Category:** docs-drift / a11y
**Issue:** `<html lang="ar" dir="ltr">` claims the whole document is Arabic, while `dir="ltr"` says it's LTR. Screen readers may switch to Arabic voice for English UI text. The header has `<title>Gogo Arabic - يلا عربي</title>` which is mixed.
**Why it matters:** Screen-reader users get wrong language announcements for menus, buttons, settings.
**Suggested fix:** `lang="en" dir="ltr"` at the root, and mark Arabic regions individually with `lang="ar" dir="rtl"` (the CSS classes already exist: `.arabic-title`, `.arabic-body`, etc.).

### LOW `eslint.config.js` has `react/prop-types: 'off'` and `no-unused-vars: 'warn'`
**File:** `eslint.config.js:35-37`
**Category:** build-config
**Issue:** Both are set to weak levels. `no-unused-vars` as `warn` won't fail CI on dead imports (verified: `PATH_FIRST_QUESTS` is unused and lint passes). No rule for `react-hooks/exhaustive-deps` exceptions — the codebase relies heavily on `// eslint-disable-next-line react-hooks/exhaustive-deps` comments (`useDialogue` line 102, 135, etc.) which are easy to abuse.
**Why it matters:** Linter doesn't push back on the patterns most likely to introduce bugs (stale closures, dead imports).
**Suggested fix:** Promote `no-unused-vars` to `error` (keep `argsIgnorePattern: '^_'`), add `react-hooks/exhaustive-deps: 'error'`, audit existing disables.

### LOW Several scripts hard-code paths to sibling repos that don't exist on this machine
**File:** `scripts/extract-quran-vocab.js:26-27`, `scripts/extract-roots.js:28-30`, `scripts/fill-practical-vocab.js:21`, `scripts/merge-vocabulary.js`
**Category:** docs-drift
**Issue:** Scripts reference `../../quran-json/`, `../../gogo-arabic-assets/`, `../../quran101/`, `../../thousand-most-common-words/` — none of these directories exist alongside the project. The scripts are presumably one-shot pipeline generators that produced files now committed under `scripts/output/`. There's no documentation of where to obtain the sibling repos.
**Why it matters:** Pipeline is not reproducible. If `vocabulary-final.json` needs regenerating from a new Quran data source, the steps are undocumented and the inputs are missing.
**Suggested fix:** Either add README sections documenting the external corpus URLs and clone commands, or mark these scripts as archived and move them to `scripts/archive/`.

### LOW README and OVERVIEW counts are stale vs `testUtils.jsx`
**File:** `README.md:9,52,55`, `GOGO_ARABIC_OVERVIEW.md:75`
**Category:** docs-drift
**Issue:** README says "Redux Toolkit (29 slices, 9 middleware)"; OVERVIEW says "29 slices"; `testUtils.jsx` imports 35 reducers. README says "19 custom React hooks"; `src/hooks/*.js` is 20 files (21 if you count internal ones in subdirectories elsewhere). README and OVERVIEW both say "No music" but `useAudio.js` exposes `playBGM`/`stopBGM`/`pauseBGM`/`resumeBGM`, `audioConfig.js` defines `ZONE_BGM_MAP`/`ZONE_NIGHT_BGM_MAP`, and vite chunk config splits `bgm` data.
**Why it matters:** Anyone using the docs to onboard or assess scope gets the wrong picture; AI agents fed these docs build incorrect mental models.
**Suggested fix:** Either delete the specific counts and replace with "30+", or wire a `tools/content-stats.js` step that updates them on a content change.

### LOW `Ralph CLAUDE.md` references wrong project paths
**File:** `scripts/ralph/CLAUDE.md:11-19`
**Category:** docs-drift
**Issue:** Lists `src/slices/`, `src/middleware/`, `src/phaser/` — but actual paths are `src/store/slices/`, `src/store/middleware/`, `src/game/`. Agent instructions for autonomous coding point at non-existent directories.
**Why it matters:** Autonomous Ralph agent's first `ls src/slices` fails; instructions immediately go off-spec.
**Suggested fix:** Update to `src/store/slices/`, `src/store/middleware/`, `src/game/scenes/`, `src/game/systems/`.

### LOW `index.html` `?reset` handler races against `main.jsx` boot
**File:** `index.html:79-86`
**Category:** bug
**Issue:** The reset script does `indexedDB.databases().then(dbs => dbs.forEach(db => indexedDB.deleteDatabase(db.name))); window.location.href = window.location.origin;` — the location change happens **synchronously**, before the IDB delete promise resolves. Result: some databases survive the reset.
**Why it matters:** The "I'm stuck, let me reset" affordance is unreliable; users still see stale data.
**Suggested fix:**
```js
const dbs = await indexedDB.databases();
await Promise.all(dbs.map(db => new Promise(r => {
  const req = indexedDB.deleteDatabase(db.name);
  req.onsuccess = req.onerror = req.onblocked = r;
})));
window.location.href = window.location.origin;
```
(wrap in an async IIFE).

### LOW `syncMerge.mergeMax` rewards cheating
**File:** `src/utils/syncMerge.js:24-28,141-193`
**Category:** security
**Issue:** Cloud sync takes `Math.max` of every progress field (level, xp, dirhams, streak, wordsLearned, lettersLearned, totalQuizzes, correctAnswers). A user who edits localStorage to give themselves `xp: 999999` will see those numbers preserved on the server forever — they can never "go down." Same for inventory (`mergeArraysUnion`) — items granted locally persist server-side.
**Why it matters:** Not a security incident in a single-player educational app, but the design lets self-cheating compound across devices. If you ever add leaderboards, this is exploitable.
**Suggested fix:** Either accept this as a deliberate single-player trade-off (and document it), or merge on server with HMAC-signed snapshots and a server-side ground truth for "level >= LP_x at time T".

## Patterns / Systemic Concerns

- **Stale-closure hot patches.** Every event-handler hook (`useDialogueEvents`, `useZoneEvents`, `useObjectEvents`, `useNarrativeEvents`) reaches for `store.getState()` to dodge stale closures inside callbacks registered with the `EventBus`. This works but creates a parallel state-access path that bypasses React's render tracking, making the data flow hard to reason about. A handful of `// eslint-disable-next-line react-hooks/exhaustive-deps` directives appear alongside these — the suppression count itself is a quality signal. Consider migrating event handlers to a thin redux middleware listening for `EventBus` translations to actions.

- **Quest-progress logic duplicated 4+ times.** The `categoryToEvent` map and the surrounding `for (const qd of questsData)` loop appear nearly identically in `useDialogue.js:170-227`, `useObjectEvents.js:54-105`, and `useDialogueEvents.js:51-81`. Any change to a category-event mapping has to be made in three places. Move into a single `progressQuestsForEvent(eventName, dispatch, store)` helper.

- **Diacritic-stripping (5+ versions), Arabic detection (3+ versions).** `arabicUtils.isArabic` exists, but the regex `/[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/` is reinvented in `useTypewriter.js:8`. Centralize.

- **Vocabulary objects treated as both read-only data and scratch-pad.** `useQuiz.buildChoices` (and parallel paths in `useBattle`) mutate items from the imported `vocabularyAll` module. Make the import shape immutable (`Object.freeze`-wrapped at module export) to catch this at runtime.

- **Test setup mocks Phaser twice** (`src/test/setup.js` lines 36–64 mock `phaser` via `vi.mock`, then lines 112–138 assign a global `Phaser`). Both happen, neither is documented. Consolidate.

- **`useAccessibilitySync` and `useReducedMotion` overlap.** Both read `prefers-reduced-motion`, with `useAccessibilitySync` writing to a CSS custom property and `useReducedMotion` to component state. They don't coordinate — a user can have `reducedMotion=false` in Redux while the OS-level media query says `reduce: matches`, and the two will produce different answers in different components.

## Out of scope but flagged

- **`server/` and `index.html` `?reset`**: server directory is out of my slice but the reset handler in `index.html` touches IndexedDB which the persistence layer (slice 05) relies on; flagged above.

- **`vite.config.js` manualChunks is doing real work**: shipping vocabulary as separate chunks (`vocab-core`, `vocab-extended`) is fine, but `src/data/poems` and `src/components/Poetry/` are bundled into one chunk while many other component directories are not. The bundle-split decisions appear ad-hoc; consider documenting which chunks must be loaded eagerly vs lazily. Likely belongs in a learning-components review pass.

- **`fake-indexeddb` is loaded in `src/test/setup.js` but server (out of scope) also uses MongoDB**: server tests likely need a different fixture. Worth aligning when server slice is reviewed.

- **`scripts/ralph/prd-*.json` files**: not reviewed in detail, but if they contain instructions for the autonomous agent, the prompt-injection surface from MEDIUM ralph.sh finding extends to them.

- **`Phaser.Events.EventEmitter` as EventBus**: the entire EventBus contract relies on Phaser being available — but `eventBus.js` is imported by hooks that run in jsdom unit tests where Phaser is mocked. The mock in `setup.js` provides `EventEmitter` correctly, but any new hook that imports `eventBus.js` in a context where the Phaser mock isn't loaded (e.g. node-level scripts) would crash.
