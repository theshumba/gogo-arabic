# Master Code Review — Gogo Arabic Under-the-Hood Audit
**Reviewed:** 2026-05-11 (started 2026-05-05)
**Scope:** All non-world code (Lucas working visual layer in parallel)
**Method:** 6 parallel `gsd-code-reviewer` agents, severity-classified, file:line-anchored

## Coverage map

| # | Domain | File | Findings |
|---|---|---|---|
| 1 | Redux state (slices, middleware, selectors, persist) | `01-redux-state.md` | 9 CRITICAL · 11 HIGH · 8 MEDIUM · 7 LOW |
| 2 | Game systems (battle / companions / equipment / magic) | `02-game-systems.md` | 5 CRITICAL (per summary) + ~25 total |
| 3 | Learning components (Quiz, Grammar, Reading, Writing, Phonetics, …) | `03-learning-components.md` | ~25 findings |
| 4 | Player & progression UI (Battle, Shop, Quest, HUD, Save/Load, …) | `04-player-progression-ui.md` | 6 CRITICAL · 13 HIGH · MEDIUM/LOW |
| 5 | Services, persistence, data (saveManager, server, ink, schemas) | `05-services-persistence-data.md` | 26 findings |
| 6 | Infra, utils, hooks, tests, build config, scripts | `06-infra-utils-tests.md` | 7 HIGH + MEDIUM/LOW |

**~150 findings total.** Excluded from scope (Lucas territory): `src/game/scenes/`, `src/game/sprites/`, `src/game/systems/world/`, `src/components/World/`, `src/world/`, `src/assets/maps/`, `src/data/zones/`, `src/data/interiors/`, `contracts/`, `ldtk-assets/`, `focal-length-visualiser/`.

---

## Top 10 cross-domain CRITICAL bugs (ranked by player-visible impact)

These are bugs the player is encountering *right now* in production. None of them are visual / Lucas's territory. All can be fixed independently while he works.

1. **Root persistConfig has no `version` or `migrate`** — every migration touching root-state slices (player, grammar, settings, home, stats, npc) silently no-ops. Migrations 6, 7, 11, 12 never run. Grammar lesson gate locked forever. *`src/store/store.js:217-269`*

2. **`addFsrsCard` payload contract is broken from 3 middlewares** — battle rewards, zone intros, poetry battles all dispatch flat FSRS fields instead of `{wordId, card, source}`. The reducer writes `card: undefined`. Every word taught via these paths is silently inert in SRS. *`src/store/middleware/{battleRewards,zoneIntro,poetryRewards}Middleware.js`*

3. **saveManager drops ~30 of the 50+ persisted slices** — loading a save slot returns ~16 slices; redux-persist whitelists 50+. Plus saveManager and redux-persist are unreconciled — loaded data gets overwritten on next rehydrate. *`src/services/storage/saveManager.js`*

4. **Magic spell double-damage / no-cancel race** — `RootMagicManager.castSpell` schedules an 800ms `delayedCall` with no cancellation token. Killing-blow spells leak damage into the next encounter. *`src/game/systems/magic/RootMagicManager.js:79-114`*

5. **Magic combo dispatches a second `dealDamage` mid-turn** — bumps `state.streak` and `state.currentRound`. Two casts produce a 4-streak from 2 turns, crossing the critical-hit threshold. Geometric damage compounding. *`src/game/systems/magic/RootMagicManager.js:165-208`*

6. **Daily-quest, daily-goals, and relationship-decay all use module-level state** — page refresh re-grants daily XP, re-decays NPC friendship multiple times per day. Trivial XP exploit. *`src/store/middleware/{dailyQuest,quizDailyGoals,relationshipDecay}Middleware.js`*

7. **ShopOverlay TDZ crash** — `shopId` read on line 47/50-69 before its `const` declaration on line 72. Throws `ReferenceError` whenever any shop opens. *`src/components/Shop/ShopOverlay.jsx`*

8. **Reentrant REHYDRATE race grants "first ever" login reward to returning players** — 10 REHYDRATEs fire on startup; nested ones run before root. Free XP/dirhams every cold start. *`src/store/middleware/loginRewardMiddleware.js:29-55`*

9. **`xpCalculator.getLevelFromXP` double-cumulates an already-cumulative table** — effective levelling curve is ~2× harder than designed; tests lock the wrong behaviour in. *`src/utils/xpCalculator.js:31-38`*

10. **`affixMatcher.getAffixMultiplier` permanently returns 0.5** — double-broken (wrong nesting + string vs ts-fsrs numeric `State` enum). The "learn Arabic to power up gear" mechanic is non-functional. *`src/utils/affixMatcher.js:15-31`*

---

## Cross-domain systemic concerns

These show up in 3+ domains. Fix the pattern, not just the instances.

### A. Module-level state as "once-per-day" guards
Pervasive in middleware (Redux review), present in game systems (`hitStop` uses `setTimeout` not Phaser time). Every guard like this resets on page reload. **Rule to adopt: any de-dup / cooldown state must live in Redux.**

### B. Action-type drift between slice and consumer
At least 6 dead middleware branches because someone typed `player/addXp` instead of `player/addXP`, `npc/giveGift` instead of `npc/giveNpcGift`, `battle/recordVictory` (doesn't exist) instead of `battle/endBattle`. **Rule: export action-type constants from slices and import them in middlewares — a typo becomes a compile error.**

### C. Selector fallback objects (`?? {}` / `?? []`)
Epidemic across slices and the Player-UI layer. Every fresh literal forces re-renders pre-rehydration. **Rule: cache empty fallbacks as module-level frozen constants.**

### D. Reducer side effects (`Date.now()`, `Math.random()`)
Pervasive. Breaks redux-devtools time-travel, makes tests non-deterministic. **Rule: compute at dispatch site.**

### E. Parallel save systems that don't reconcile
`saveManager.js` (16 slices), `redux-persist` (50+ slices), `redux-persist` nested IndexedDB configs (9 sub-stores). Three sources of truth, no `persistor.purge()` path on slot load. **Action: pick a canonical persistence system; the other should be a passthrough adapter.**

### F. Test infrastructure has holes
- `vitest.config.js` excludes `/tests/` so `tests/syncMerge.test.js` (cloud-sync logic) never runs
- 5/6 Playwright e2e specs do `page.evaluate(localStorage.setItem)` *before* `page.goto()` — writes land on `about:blank`, default empty-state is what's actually tested
- 4 middlewares are exported and tested but never wired into the store
- saveManager has zero tests (highest-risk file in the persistence layer)
**Action: pre-Lucas-merge, fix the e2e seeding bug so we have a regression net for visual changes.**

### G. Server-side trust gaps
- `/leaderboard/score` is `$max`-ed from client value — anyone can post `Number.MAX_SAFE_INTEGER`
- `/user/progress/snapshots` has no `validate()` middleware — arbitrary client values written to User docs
- No enum on `cefrLevel` server-side

### H. Docs drift
- README/OVERVIEW claim 29 slices; `testUtils.jsx` wires 35; actual count is ~60+
- "No music" hard constraint contradicted by `playBGM`/`stopBGM` and `ZONE_BGM_MAP` in audio config
- `scripts/ralph/CLAUDE.md` references non-existent paths

---

## Lucas integration risk assessment

**Short verdict: integration risk is LOW for the work itself, MEDIUM for the merge process.**

### Why the merge is fundamentally safe

Per `WORLD-VS-LOGIC-CONCERN.md` (your own audit) and `contracts/developer-brief.md`:

1. **String-ID decoupling** — game logic references `"merchant-fatima"`, not `(x=140, y=200)`. Zone names, NPC IDs, object IDs, quest names, vocab IDs are all strings. Lucas can rearrange every pixel and not touch any of them.
2. **`src/data/zones.js` is the only bridge** — coordinates live in one place. Updating that file is a mechanical, contained change.
3. **Contractual scope** — `contracts/developer-brief.md` explicitly says: *"You do NOT have access to: game logic, Redux state, middleware, data files, server code, or algorithms."* Lucas's deliverable lives in `src/game/{scenes,sprites,systems/world}`, `src/components/World/`, and `public/assets/`. Zero overlap with anything this audit flagged.
4. **Stripped repo** — Lucas pushes to `gogo-arabic-visual-fix` (public, ~71MB). You cherry-pick to private `main`. He can't merge anything you don't approve.

### Where the merge gets risky

1. **Hardcoded coordinates in non-world code** — `CinematicIntroSequencer.js` has tile (14,17), (14,18), (14,20) baked in. If Lucas redesigns a zone layout, these break. **Fix: post-merge, grep for hardcoded tile coords; 5-min fix per zone.**

2. **The 19 known-RED tests on snapshot drift will conflict** — Lucas changes tiles → snapshots regenerate. You need to re-baseline these after merge. **Action: have Lucas regenerate snapshots in his PR; verify they look correct visually.**

3. **The e2e regression net is broken** — 5/6 Playwright specs aren't actually seeding state (HIGH finding #3 in the infra review). You think you're protected; you're not. **Action: fix e2e seeding bug BEFORE Lucas merges, so the regression net actually works.**

4. **Cherry-pick mechanics are manual** — easy to lose commits or duplicate them on the private repo. **Mitigation: have Lucas do atomic commits with clean messages; cherry-pick in groups; verify `git log --oneline` matches expectations after.**

5. **Several CRITICAL bugs from this audit will mask visual issues during QA** — e.g., the `addFsrsCard` bug means SRS-related visual cues (highlights on freshly-learned words) may not appear regardless of Lucas's work. You'll waste cycles thinking it's a visual bug when it's a state bug. **Action: fix the top 3-5 CRITICAL state bugs BEFORE merging Lucas, so visual QA is a clean signal.**

### Recommended sequence

```
Now → Pre-Lucas-merge:
  1. Fix CRITICAL #1 (root persistConfig migrate)            — 30 min
  2. Fix CRITICAL #2 (addFsrsCard payload from 3 callers)    — 1 hr
  3. Fix HIGH #3 in infra (e2e localStorage seeding)         — 2 hrs
  4. Fix CRITICAL #6 (daily-quest grind exploit)             — 1 hr
  5. Run full test suite, snapshot the 19 known-RED list

Lucas delivers PR:
  6. Review diff in gogo-arabic-visual-fix
  7. Cherry-pick to private main as a single squashed merge commit
  8. Re-run full test suite; expect snapshots to regenerate
  9. Run Playwright e2e (now seeding correctly post-fix #3)
  10. Grep `*Sequencer*.js` for hardcoded tile coords; update if Lucas changed zone layouts

Post-Lucas:
  11. Phase 98 Code Health can proceed (was blocked on Lucas)
  12. Triage remaining ~140 findings into Phase 98 plan structure
```

### Should you be worried? No — but be deliberate

The architecture decision you made ages ago (string IDs everywhere) is paying off. The fence around Lucas's work is real. The bigger risk is your *own* QA process — you have ~10 CRITICAL bugs that will produce noisy visual artefacts unrelated to anything Lucas does, and your e2e regression net has holes.

**Spend 4-6 hours fixing the top 4 items above before Lucas's PR lands. That's your highest-leverage move.**

---

## What this review did NOT cover

- Anything in Lucas's hard-exclusion zone (intentional)
- Phaser scene lifecycle in world rendering (Lucas's domain)
- Asset pipeline (PNG dimensions, frame indices) — already audited in `WORLD-AUDIT.md`
- Performance profiling under load (no runtime profile run)
- Manual UX walk-through (no dev server started)
- Accessibility audit beyond keyboard/focus comments (no screen-reader pass)
- Security audit beyond obvious client-trust / secrets-in-source (no pen-test)

If you want any of these, spawn a new agent with that single scope.
