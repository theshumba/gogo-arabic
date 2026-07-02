# Gogo Arabic — Visual Layer Close-Out Record

_Finalized 2026-07-02, branch `fix/redux-state-2026-05-15`. This is the definitive disposition of every visual issue ever reported (master list: `docs/VISUAL-CLOSEOUT-CHECKLIST.md`, items A1..H3). Every item was verified against the LIVE game (Playwright probes of `window.__PHASER_GAME__`) plus fresh screenshots (`npm run capture:world-screenshots` → `docs/world-shots/*.png`, captured 2026-07-02 04:39, after all fix commits)._

**Verdict: the visual layer is CLOSED across all 8 zones.** Final adversarial verifier pass: clean — zero blocking defects, two follow-up notes (one harness-only cosmetic, one pre-existing non-visual stability ticket) listed at the end.

Status legend: **VERIFIED-FIXED** (fixed in an earlier run, re-verified with fresh evidence this run) · **VERIFIED-NOT-A-BUG** (debunked with evidence) · **FIXED-THIS-PASS** (fixed by this run's commits, then verified) · **ACCEPTED-COSMETIC** (known, deliberately not fixed).

---

## A. Ground & terrain

| Item | Status | Commit(s) | Evidence |
|---|---|---|---|
| A1. Checkerboard / 2-tone mosaic sand | **VERIFIED-FIXED** | `ef5b1b5` | Fresh screenshots of all 8 zones + zoomed-out full-map captures of desert_marketplace / royal_palace / bedouin_camp / farmland: every sand region renders as one uniform sheet, no patchwork. |
| A2. Hard biome-edge seams | **VERIFIED-NOT-A-BUG** | — | 2x crops of the exact boundaries (royal_palace sand→grass edge; mountain_village sand-plot/water/grass edges) show proper autotiled transitions; original report was a camera-framing artifact. |
| A3. Desert zones reading as grassland | **VERIFIED-FIXED** | `5a93c9a`, `0962cfc` | Full-map zoomed-out live captures: desert_marketplace is overwhelmingly sand with stalls/rugs/obelisks scattered across it and only a modest central garden; royal_palace and bedouin_camp likewise sand-dominant. |

## B. Scale coherence (one world scale)

| Item | Status | Commit(s) | Evidence |
|---|---|---|---|
| B1. Giant rugs (3×2 tiles) | **VERIFIED-FIXED** | `0d0b95d` | Live probe: every `kenmi-desert-props-desert-rugs` instance (11 in oasis, present in 5 other zones) renders cropped at scaleX 1.333 with a 48x48 crop = 64px visible = exactly 1 tile. |
| B2. Player rendered 2× NPCs | **VERIFIED-FIXED** | `9a6e022` | Live probe across all 8 zones: player displayWidth/Height = 64x64 everywhere (body-simple-thobe), 20x16 feet physics body, 64x64 head-kufi overlay aligned. |
| B3. Buildings 5-tile balloon → person-sized | **VERIFIED-FIXED** | `46ecb15`, `4b2a70d` | Live probe object enumeration: all houses render 160–256px (2.5–4 tiles) — desert-house-1 160px, house-2 192x256, house-3 256x224, house-4 256x228; the 240px inn is footprint-capped. Clearly larger than 64px people, ≤4 tiles. |
| B4. Garbled/oversized NPC sprites | **VERIFIED-FIXED** | `24ee6f7` | Live probe cycling all 8 zones via loadZone(): every NPC (22 total) is exactly 64x64; ZERO frame-not-found/missing-texture console warnings across the whole run. |
| B5. Camels/animals scale | **VERIFIED-NOT-A-BUG** | — | Live display-list sweep of all 8 zones found ZERO camel/animal sprites — no camel/vulture/scarab/goat/horse texture key exists in any scene; `spawnAmbientAnimals()` is commented out. Nothing to scale. |
| B6. Miniature uncropped sprite-sheet strips | **VERIFIED-FIXED** | `5a4a64e`, `3a6f28e` | Live probe checked every textured object in all 8 zones: all multi-item strips (desert-rocks 192x32, golden-pots 48x16, pots-sacks 80x16, grass-props 48x16, acacia etc.) render cropped to a single item. |

## C. Objects & props

| Item | Status | Commit(s) | Evidence |
|---|---|---|---|
| C1. `__MISSING` black-diamond placeholders | **VERIFIED-FIXED** | `24ee6f7` | Live Playwright walk of the full display list in all 8 zones counting `texture.key === '__MISSING'` (visible && active && alpha>0 && displayWidth>0): 0 in every zone. |
| C2. Marketplace has no visible stalls | **VERIFIED-FIXED** | `5a93c9a` | Live census in desert_marketplace: 12 pergola instances — 8 full stall objects (scale 2, alpha 1) ringing the plaza + 4 cropped stall interactable markers; reads as a souk. |
| C3. No hero palace edifice | **VERIFIED-FIXED** | `5a93c9a` | royal_palace.png (+ 2x crop of the top band): two monumental sandstone gatehouse facades with arched doorways span the top of the zone, flanking the courtyard — clear palace presence from existing assets. |
| C4. Faint duplicate pergolas (scatter dup) | **VERIFIED-FIXED** | — (dead code) | The only call to `scatterDecorations()` is commented out at `src/game/systems/MapLoader.js:679`; live pergola census confirms no faint 0.7-scale duplicates remain. |
| C5. Strange "ladder" object in oasis | **VERIFIED-FIXED** | `4b2a70d` | Identified as `kenmi-desert-props-desert-ladder` and removed from zone data — removal comment at `src/data/zones.js:115` ("at 1x3 tiles it towered free-standing"). Absent from fresh oasis_village.png. |

## D. Labels & text

| Item | Status | Commit(s) | Evidence |
|---|---|---|---|
| D1. Vocab labels permanently on | **VERIFIED-FIXED** | `d2421df` | Live probe in oasis_village: player far → 0/25 interactable, 0/8 gathering, 0 vocab labels visible; teleported next to spot_oasis_herbs_01 → only that label reveals. |
| D2. Gathering/interactable label clutter (uncommitted diffs) | **FIXED-THIS-PASS** | `483b9fb` | GatheringSpotManager proximity reveal (hidden by default, fade-in within 3.5 tiles) committed as `483b9fb`; InteractableManager's equivalent (LABEL_RANGE) was already committed. Verified live: hidden at distance, visible at 40px, hidden again after walking away. |
| D3. Arabic text reversed/disconnected | **FIXED-THIS-PASS** | `3d29764` | Root cause machine-verified with 3 independent pixel analyses: canvas bidi already lays out RTL, so our manual reversal double-reversed the glyphs. Reversal removed; raw logical Arabic ('لب' test) now renders with the tall-lam column on the correct RIGHT side in both Noto and Pixel fonts. |

## E. Oasis Village authored Tiled map (new pipeline)

| Item | Status | Commit(s) | Evidence |
|---|---|---|---|
| E1. Pond water border broken behind big tree | **VERIFIED-FIXED** | `1b27009` | Fresh oasis_village.png: pond is a 7x5-tile rounded rect at map centre with a continuous dark-brown autotiled bank on all sides — no raw blue rectangle clipping out. |
| E2. Tiled path parity with procedural path | **VERIFIED-FIXED** | `77ff28d..1f5b003` | Live probe loaded oasis_village with usingTiledMap:true (40x30 map matching zones.js) and diffed rendered vs declared: all 68 declared objects plus interactables and collision present — no missing objects vs zones.js. |

## F. Instrumentation (never fly blind again)

| Item | Status | Commit(s) | Evidence |
|---|---|---|---|
| F1. Harness camera framed barren corner | **VERIFIED-FIXED** | `24ee6f7` | Fresh harness run: all 8 PNGs frame mid-map content (oasis pond dead-centre, palace courtyard + twin gate towers centred, etc.). |
| F2. Overlapping zone-title text + stale React HUD in captures | **FIXED-THIS-PASS** | `132dba1` | Harness now suppresses zone toasts and snapshots the Phaser framebuffer directly (pure game pixels) — the garbled stacked "MOROYALAPALACEGE" title and the stuck "OASIS VILLAGE" HUD card no longer appear in fresh captures. |
| F3. Harness/sandbox scripts + docs uncommitted | **FIXED-THIS-PASS** | `42d463c` (+ this run's docs commit) | docs/VISUAL-CLOSEOUT-CHECKLIST.md, docs/VISUAL-FIX-OPTIONS.md, scripts/shot-sandbox.mjs, scripts/create-visual-repo.sh now tracked; world-shots evidence PNGs committed with this record. |

## G. Findings from the 2026-07-01 diagnosis swarm (run wf_6c43697e-7bc)

| Item | Status | Commit(s) | Evidence |
|---|---|---|---|
| G1. All 5 sweep defects (cross-zone prop leak, Arabic labels, hijab slab, teal rocks, ladder) | **VERIFIED-FIXED** | `961a5f6` | Regenerated all 8 zone screenshots and zoom-cropped the critical regions: all 5 defects verified fixed on-pixel (e.g. cross-zone leak gone from harness captures). |
| G2. Palace fountain decor floating on open water (gold-cup marker at 25,20; golden-pots at 23,20/27,20) | **FIXED-THIS-PASS** | `210176e` | Decor moved off the 5x5 water rect onto the surrounding plaza tiles; fresh royal_palace.png crop shows clear water. |
| G3. Marketplace/palace/bedouin centres = large uniform green lawns | **FIXED-THIS-PASS** | `0962cfc` | The three desert-zone centres given real identity (not ~70% empty grass around the pond); verified in fresh full-map captures. |
| G4. Farmland central field = bare sand band | **FIXED-THIS-PASS** | `31b1e59` | Fields dressed with real crop rows / tilled soil; farmland.png no longer reads as desert intrusion. |
| G5. Harness: `WorldScene.loadZone()` without entry coords leaves camera at (0,0), not following player | **ACCEPTED-COSMETIC** | — (not applied) | Harness-only; the capture script sets its own camera framing so screenshots are unaffected (F1/F2 fixed). Filed as optional harness follow-up. |

## H. Close-out deliverables

| Item | Status | Commit(s) | Evidence |
|---|---|---|---|
| H1. All fixes committed atomically; forbidden files never staged | **VERIFIED-FIXED** | `4b2a70d..483b9fb` | 16 atomic `fix(world)`/`chore(world)` commits; `git status` confirms package.json, public/sw.js, src/routes.jsx, src/services/swRegistration.js, vite.config.js, test-results/ remain untouched in the working tree, absent from every commit. |
| H2. World-related tests green | **VERIFIED-FIXED** | — | Full `vitest run` on 2026-07-02 post-fixes: **290 test files passed, 5793 tests passed** (1 file / 11 tests skipped by design), including TiledMapLoader.collision and oasisVillageMap.validity. |
| H3. This document | **FIXED-THIS-PASS** | this commit | You are reading it. |

---

## Final tally

- **VERIFIED-FIXED:** 19 (A1, A3, B1, B2, B3, B4, B6, C1, C2, C3, C4, C5, D1, E1, E2, F1, G1, H1, H2)
- **VERIFIED-NOT-A-BUG:** 2 (A2, B5)
- **FIXED-THIS-PASS:** 8 (D2, D3, F2, F3, G2, G3, G4, H3)
- **ACCEPTED-COSMETIC:** 1 (G5 — harness-only camera follow on programmatic loadZone)
- **OPEN / BLOCKING:** 0

## Verifier's remaining follow-up notes (non-blocking)

1. **NEW-1 (harness-only, cosmetic):** the dev PerfOverlay (`src/game/ui/PerfOverlay.js`, mounted in DEV) is a scrollFactor-0 Phaser object, so `renderer.snapshot()` bakes its FPS/heap text into 7/8 world-shots PNGs (it overlapped Storyteller Noor's nameplate in bedouin_camp.png). Not player-visible in production (DEV/`?perf=1` gated). Fix when convenient: hide/destroy `window.__PERF_OVERLAY__` in `scripts/capture-world-screenshots.mjs` before each snapshot.
2. **NEW-2 (pre-existing, non-visual, stability ticket):** one pageerror "Cannot set properties of undefined (setting immovable)" during rapid programmatic zone cycling — `NPCManager.js:252` schedule-tween onComplete calls `npc.setImmovable(true)` after zone unload destroyed the NPC's physics body. A player leaving a zone mid-NPC-schedule-tween could hit the same unhandled error. NPCManager was untouched by this round; file separately: kill NPC schedule tweens in WorldScene zone teardown.

## What this unblocks

- **The visual layer is closed across all 8 zones.** Every reported ground/scale/prop/label/text defect is fixed or debunked with live-probe + on-pixel evidence, and the screenshot harness now produces trustworthy pure-game-pixel captures — future visual regressions will be visible, not hidden behind HUD/toast artifacts.
- **Oasis Village is on the authored Tiled pipeline** with verified parity (objects, interactables, collision) against the procedural path — the template for authoring the remaining zones exists and works.
- **Planning can move forward** (content, quests, gameplay phases) without a standing "world looks broken" caveat.

Remaining OPTIONAL follow-ups (none block planning):
1. Author the other 7 zones in Tiled (oasis_village is the proven template).
2. G5 — harness camera follow on programmatic `loadZone()` (harness-only).
3. NEW-1 — suppress PerfOverlay in screenshot captures (harness-only).
4. NEW-2 — NPC schedule-tween teardown guard (separate stability ticket, not visual).
