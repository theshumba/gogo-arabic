# Lucas PR #1 Review — Forensic Audit
**Reviewed:** 2026-05-12
**PR:** https://github.com/theshumba/gogo-arabic-visual-fix/pull/1
**PR size:** 224 files changed, +3,109 / −1,213 across 73 commits
**Author:** GLukaz (Lucas Gimenez)

## 1. Scope & Payment — IS HE RENEGOTIATING?

**Yes. The contract does not support what he's claiming.**

- `contracts/contractor-agreement.md:107-111` (Section 7) is **literally blank** for rate, payment schedule, and payment method. The signed contract template never had the numbers filled in.
- Canonical payment terms live only in the Upwork agreement (**$200 flat, agreed 2026-04-20**) and the `contracts/developer-brief.md` scope. Neither doc mentions "milestones," "first milestone," or splitting payment in halves.
- `contracts/developer-brief.md:340-347` defines the work as **12 tasks across 59–94 hours total** — billed as one contract, not two halves.
- The contractor agreement Section 2 (`contracts/contractor-agreement.md:32-46`) explicitly limits scope to: (a) Phaser scene rendering, (b) React UI overlay wiring, (c) Tilemaps, (d) Animation/particles, (e) bug fixes related to visual rendering only. His claim that "colliders and animals fix" is "second half" worth "the full price of the contract" would **double the agreed price** for work that was already inside the original remit.

He is splitting one contract into two and asking for early release of half the money plus the same total at the end.

## 2. What he claims to have done

From the PR body (paraphrased):
- "Fixed the autotile and objects rendering."
- "A week of work, half of the work" — wants payment for "first milestone" now, full contract price for "second half" (colliders + animals).
- "Main modified file was MapLoader.js."
- Only data changes: SAND → GRASS in FARMLAND + one palm-tree position in BEDOUIN CAMP.
- Added `?autotileDebug=1` query-param debug overlay.
- Added a snapshot-preview button to the `map-builder` tool.
- Added `RenderColorPipeline.js` (actually `ReplaceColorPipeline.js`) — snow tint shader.
- Rewrote autotile index logic almost entirely.
- "No new errors, commits clear and concise."

## 3. What he ACTUALLY did

| # | Scope item | Status | Evidence |
|---|---|---|---|
| 1 | Fix tile rendering across all 8 zones | **PARTIAL** | Genuine MapLoader rewrite (+738/−281). Switched grass key `kenmi-desert-tiles-desert-grass` → `kenmi-base-tiles-grass-grass-tiles-3` and water key to `kenmi-base-tiles-water-water-tile-3-anim`. But new `WATER_F` collapses 7 distinct "SOLID" indices to frame 25 (copy-paste shortcut, not authentic mapping). No before/after visual verification of all 8 zones. |
| 2 | Fix props/decorations positioning + scaling | **PARTIAL** | Real changes: `FLAT_GROUND_PROPS` set, `PROP_CROP_REGIONS` extended, `setDepth()` based on Y-sort, halved spawn rates. Reasonable refactor. New `ObjectPlacerEditor.js` (521 LOC) dev tool is **out of scope**. |
| 3 | Biome parity (snow + grass) | **NOT DONE** | The `ReplaceColorPipeline.js` shader is **broken** — fragment shader hardcodes `vec4(1.0, 1.0, 1.0, color.a)` and only whitens pixels regardless of `targetColor`. Snow rendering won't tint, just turns green pixels white. He skipped both regression tests for this (`WorldSnapshot.test.js:6276` WORLD-09 and `:6287` WORLD-10). `BIOME_SCATTER_PROP_SETS.grass` added (good), but **no `BIOME_ANIMAL_SETS` extension** for grass-biome animals. |
| 4 | Final validation — 8 zones render clean | **NOT DONE** | He marked the entire 8-zone snapshot regression suite `it.skip` (`WorldSnapshot.test.js:6266`) with the comment "Deco was moved to objects layer, not decoSprites — skip this check for now". **Did not regenerate fixtures.** Only validation provided is 8 screenshots in the PR body. |
| 5 | Branch + PR workflow, atomic commits | **DONE** | 73 atomic commits, clean messages, separate branch. |

### Out-of-scope work he did anyway (Section 2 of agreement forbids)

| Area | Damage |
|---|---|
| `src/components/Router/GameLayout.jsx` | **Deleted 20+ lazy imports for shipped overlays** — CinematicIntro, EventBanner, EventOverlay, GiftOverlay, RelationshipMilestone, LoreCodex, DailyChallengeOverlay, ReadingPassageOverlay, WritingPracticeOverlay, ConversationPracticeOverlay, MiniGameHub, SeasonalEventOverlay, BreakSuggestion, DifficultyDashboard, ProgressReport, FeatureUnlockToast. Phase 97 WORLD-05 explicitly closed with "no GameLayout.jsx diff." Your memory rule `feedback_no_overlay_wiring` explicitly forbids this. |
| `src/store/middleware/zoneReviewMiddleware.js` (+59/−16) | Refactored Redux middleware, then `it.skip`'d 4 of its existing tests. |
| `src/store/middleware/{friendship,offlineFsrs,relationship,rootFsrsSync}Middleware.js` | Small renames — functionally inert but out of scope. |
| `src/store/slices/{battle,companion}Slice.js` | Touched. Out of scope. |
| `src/game/systems/InkDialogueEngine.js`, `src/game/ui/DialogueBox.js`, `src/hooks/useDialogue.js`, `src/game/systems/NPCManager.js`, `src/game/sprites/NPC.js`, `src/game/systems/companions/CompanionDialogueManager.js` | Dialogue + NPC edits. Out of scope. |
| `src/game/systems/SceneStackManager.js` | Rewrote `popScene()` to iterate `scene.scene.manager.scenes`. Scene lifecycle, unrequested. |
| `src/components/Quest/QuestLog.jsx:2321-2325` | Added null-guard for `qd.reward`. Quest logic, out of scope. |
| `src/utils/eventBusTypes.js` | Added `SCENE_SHUTDOWN` event constant. Out of scope. |
| `src/components/Shop/ShopOverlay.jsx` | Touched (+7/−7). Out of scope. |
| `e2e/fast-travel.spec.js`, `e2e/shop-purchase.spec.js` | Deleted 3-line blocks each. Out of scope. |
| `eslint.config.js`, `vite.config.js` | Tooling. Out of scope. |
| `lint-output.txt` | **377 LOC of lint debris committed to repo root.** Tooling output, should never be in a PR. |
| ~80 component files | Cosmetic lint fixes (`score` → `_score`, escaping quotes, useEffect deps). Spread across 3 commits. Will cause merge conflicts when cherry-picking to private main. |
| `tools/map-builder/index.html` | +197 LOC dev tool. Out of scope but isolated. |

## 4. WORLD-* requirements coverage

| WORLD-ID | Status before Lucas | After Lucas | Net |
|---|---|---|---|
| WORLD-01 (Kenmi keys + drift detector) | Closed | Updated `_assertFrameTableMatch` for new grids. Catalog keys valid. | **ADDRESSED** (but didn't update WORLD-AUDIT.md). |
| WORLD-02 (snapshot strict-match) | Partial | **Disabled 8-zone snapshot tests.** | **REGRESSED.** |
| WORLD-03 (24/24 faceless NPCs) | Closed | No change. | **NOT TOUCHED** (good). |
| WORLD-04 (lint:world-terminology clean) | Closed | Did not run. | **NOT VERIFIED.** |
| WORLD-05 (no GameLayout.jsx diff) | Closed | **Deleted 20+ overlay imports.** | **VIOLATED.** |
| WORLD-06 (≥2535 pass, ≤19 fail) | 5613/5640 pass | Added 7 `it.skip`, refactored ~80 test files. CI not run. | **UNKNOWN — likely worse.** |
| WORLD-07 (8 zone fixtures exist) | Closed | Fixtures stale (his own admission). | **STALE.** |
| WORLD-08 (audit document complete) | Closed | Did not update WORLD-AUDIT.md after tileset key swap. | **STALE.** |
| WORLD-09 (mountain_village snow parity) | Partial | Shader broken; tests skipped. | **NOT ADDRESSED.** |
| WORLD-10 (grass biome ambient life) | Partial | Props added; **animals not added**; tests skipped. | **PARTIAL — props yes, animals no.** |
| WORLD-11 (BootScene dup-load) | Closed | No change. | **NOT TOUCHED** (good). |
| WORLD-12 (interiors structure) | Deferred | Rewrote `SceneStackManager.popScene()` (unrequested). | **OUT OF HIS SCOPE.** |

## 5. Code quality — sketchy items

- **`ReplaceColorPipeline.js:6090`** — fragment shader hardcoded to whiten only. There's no replacement-colour uniform. Snow rendering is "make green pixels white" — a brittle hack, not biome parity.
- **`MapLoader.js:4206-4228`** — new `WATER_F` collapses 7 distinct frames to index 25. Copy-paste shortcut.
- **`MapLoader.js:4116-4122`** — multiple `BEACH` frame indices collapsed to same frame (6 or 13). Reduces tile variety vs original mapping.
- **`MapLoader.js:4927`** — sets `sprite._debugMethod = '_renderGrassTile'` on every tile sprite. Persists in prod, adds memory overhead. Should be DEV-gated.
- **`MapLoader._pickGrassForeignFrame`** — 40+ chained if-branches handling diagonal water/sand permutations. Workaround pile, not a fix.
- **`SceneStackManager.js:6102-6126`** — rewrote scene-pop logic unrequested. Subtle state-transition impact, unguarded by tests.
- **`GameLayout.jsx`** — deleted 20+ lazy imports. If referenced further down, file won't compile; if conditionally rendered, silent runtime breakage.
- **`lint-output.txt`** — 377 LOC of tooling output committed at repo root.
- **`scripts/capture-world-snapshots.js`** — removed console.log lines but **never ran** the script to regenerate fixtures.

## 6. Tests

- **7+ tests `it.skip`'d**: 3 critical WORLD regression tests (8-zone snapshots, WORLD-09, WORLD-10) + 4 `zoneReviewMiddleware.test.js` tests he broke by refactoring middleware.
- **Fixtures NOT regenerated** despite his refactor changing decoSprites → objects layer.
- **~80 test files touched** with cosmetic lint fixes — major merge-conflict surface.
- **No `npm test` output** in the PR. He claims "no new errors" without evidence.
- **The 19 known-RED pre-existing tests:** unfixed; he added more skips on top.

**Net test impact: REGRESSION.**

## 7. What's left for him to complete the agreed $200 scope

1. Regenerate the 8 zone snapshot fixtures (`node scripts/capture-world-snapshots.js`) and **un-skip** the 3 WORLD-* regression tests.
2. **Fix the shader** — `ReplaceColorPipeline.js` needs a replacement-colour uniform, not just whitening.
3. **Wire animals** for grass biome (WORLD-10) — farmland + coastal_port. `BIOME_ANIMAL_SETS` extension missing.
4. **Wire snow decorations + animals** for `mountain_village` (WORLD-09).
5. **Revert GameLayout.jsx overlay-import deletions** — restore the 20+ lazy imports.
6. **Revert or extract** the out-of-scope edits: Redux middleware, dialogue engine, NPC manager, SceneStackManager, vite.config.js, e2e specs, eslint.config.js.
7. **Delete `lint-output.txt`** from the repo.
8. Run `npm test` and confirm no new skips beyond the 19 pre-existing known-RED tests.

**Colliders + animals are NOT a "second half" to negotiate** — biome parity (animals) is scope item 3 and final validation is scope item 4 from his original brief.

## 8. Cherry-pick cost if you approve as-is

- 224-file fan-out makes clean cherry-pick nearly impossible.
- The deleted GameLayout overlay imports would silently break shipped features in production.
- Realistic extraction: keep `MapLoader.js` + `spriteKeyMap.js` + `ReplaceColorPipeline.js` (after shader fix) + `kenmiCatalog.js` minor edits + relevant `zones.js` prop additions. Drop everything else.
- **Estimated time: 3–6 hours** of careful surgery.

## 9. Recommendation

**Push back. Hold position on $200 flat. Do not pay the "milestone" he's asking for.**

The PR is a renegotiation attempt dressed as a deliverable. Reasons:
1. Signed contract has no milestone clause (Section 7 blank).
2. He hasn't finished agreed scope items 3 and 4 (biome parity + 8-zone validation).
3. Scope blown wide open — Redux, dialogue, scene lifecycle, GameLayout edits — none authorised.
4. Committed `lint-output.txt`, disabled 7 tests, mis-reported data changes.
5. Violated explicit WORLD-05 closure ("no GameLayout.jsx diff") and your standing "no overlay wiring" rule.

### Suggested reply to Lucas

> Lucas — thanks for the work on MapLoader. A few things before I can move on payment:
>
> 1. Our agreement on Upwork was **$200 flat for the visual-layer fix end-to-end**, including biome parity (snow + grass animals/decorations) and the final 8-zone validation. There's no first-milestone clause and no "full contract price" for a second half. The brief at `contracts/developer-brief.md` defines this as one delivery.
>
> 2. The PR is much wider than the brief. The contractor agreement Section 2 restricts your scope to Phaser scene rendering, React overlay wiring, tilemap, animation/particles, and visual-layer bug fixes. Please revert the out-of-scope edits to: GameLayout.jsx (20+ lazy imports), zoneReviewMiddleware.js, friendshipMiddleware.js, offlineFsrsMiddleware.js, relationshipMiddleware.js, rootFsrsSyncMiddleware.js, battleSlice.js, companionSlice.js, InkDialogueEngine.js, DialogueBox.js, useDialogue.js, NPCManager.js, NPC.js, CompanionDialogueManager.js, SceneStackManager.js, QuestLog.jsx, eventBusTypes.js, ShopOverlay.jsx, e2e specs, eslint.config.js, vite.config.js. Also please delete `lint-output.txt`.
>
> 3. In `GameLayout.jsx` you deleted ~20 lazy imports for shipped overlays. These need to come back — they were intentionally wired in earlier phases.
>
> 4. In `src/game/systems/__tests__/WorldSnapshot.test.js` you marked the 8-zone snapshot regression tests and the WORLD-09 / WORLD-10 biome-parity tests as `it.skip`. Please regenerate fixtures with `node scripts/capture-world-snapshots.js` and un-skip the tests. The 4 tests you skipped in `zoneReviewMiddleware.test.js` should be reverted along with the middleware itself.
>
> 5. The `ReplaceColorPipeline.js` shader currently only whitens pixels — fragment shader hardcodes `vec4(1.0, 1.0, 1.0, color.a)` with no replacement-colour uniform. Snow rendering won't tint correctly; please fix.
>
> 6. Once those points are addressed and `npm test` runs clean (no new skips beyond the 19 pre-existing known-RED tests), I'll cherry-pick the visual-layer commits and release the full $200 as agreed.

If he refuses, you have grounds under the contract:
- **Section 7.2:** Payment is "contingent upon satisfactory delivery of Work Product as determined by the Client." You are the determiner. You are not contractually obliged to pay anything until the agreed scope is delivered.
- **Section 8.2:** Either party may terminate with 7 days' written notice.
- **Section 3.1 ("work made for hire"):** His MapLoader rewrite is yours regardless. You can extract the useful parts and proceed without him.
