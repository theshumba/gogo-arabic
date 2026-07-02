# Gogo Arabic — Visual Close-Out Checklist (master list of every visual issue ever reported)

_Compiled 2026-07-01. Goal: verify every item below against the LIVE game + fresh screenshots, fix anything still broken, then declare the visual layer CLOSED so planning can move forward._

**CLOSED 2026-07-02.** Every item verified — final per-item status, commits and evidence in [`docs/VISUAL-CLOSEOUT.md`](./VISUAL-CLOSEOUT.md). (G5 accepted as harness-only cosmetic.)

Status legend: each item must end as **VERIFIED-FIXED** (with screenshot/probe evidence), **VERIFIED-NOT-A-BUG** (debunked, with evidence), or **FIXED-THIS-PASS**.

## A. Ground & terrain
- [x] A1. Chaotic checkerboard / "2-tone mosaic" sand (3 mismatched tan sheets randomly per tile). Fixed in `ef5b1b5` (collapse to one sheet). Verify: uniform sand, no patchwork, all 8 zones.
- [x] A2. Hard biome-edge seams (mountain_village, royal_palace). Debunked 2026-06-18 as camera-framing artifact. Verify smooth autotiled transitions still hold.
- [x] A3. Desert zones reading as GRASSLAND (desert_marketplace, royal_palace mostly green). In current fix run. Verify: desert zones have dominant sand/desert identity.

## B. Scale coherence (one world scale)
- [x] B1. Giant rugs (48x32 crop × blanket 4x = 3×2 tiles). Fixed in `0d0b95d` (croppedPropScale). Verify rugs ≈ 1 tile.
- [x] B2. Player rendered 2× NPCs (no normalization, 128px native). Fixed in `9a6e022`. Verify player ≈ NPC ≈ 64px, head overlay + physics body aligned.
- [x] B3. Buildings ballooned to 5 tiles (blanket 4×). Fixed in `46ecb15`… which made them person-sized. Re-fixed in current run (`nativeObjectScale`, target ~2-4 tiles). Verify buildings clearly larger than people, ≤4 tiles.
- [x] B4. Garbled/oversized NPC sprites ("Frame N not found", 512px NPCs). Fixed in `24ee6f7` (geometry-aware rowFrames + 64/frameWidth scale). Verify 0 frame warnings, NPCs 64px, hijab overlay aligned.
- [x] B5. Camels/animals scale consistent with NPCs (64px). Verify.
- [x] B6. Miniature sprite-sheet STRIPS floating in world (whole uncropped multi-item sheets at tiny scale). In current fix run. Verify none remain in any zone.

## C. Objects & props
- [x] C1. Black-diamond `__MISSING` placeholders on all 65 gathering nodes. Fixed in `24ee6f7` (GATHER_SPRITE_REMAP). Verify 0 visible `__MISSING` textures across all 8 zones (live probe, not just screenshots).
- [x] C2. Under-themed desert_marketplace (no visible stalls). Partially debunked 2026-06-18 (stalls exist mid-map); re-check post-fixes that stalls actually read as a souk.
- [x] C3. royal_palace has no hero palace edifice. Accepted as optional art 2026-06-18, but in scope for this close-out: place a palace presence from EXISTING assets.
- [x] C4. Faint duplicate pergolas in marketplace (scatter dup, scale 0.7/alpha 0.87/depth 0). Cosmetic. Fix (dedupe) or explicitly accept.
- [x] C5. Strange "ladder"-looking object(s) in oasis_village left side. In current fix run. Verify identified + correct.

## D. Labels & text
- [x] D1. All 8 floating vocab labels permanently on at full alpha for new players. Fixed in `d2421df` (proximity reveal). Verify only near labels show.
- [x] D2. Gathering-spot + interactable labels always-visible clutter — proximity-reveal diffs currently UNCOMMITTED in working tree (GatheringSpotManager.js, InteractableManager.js). Verify correct, then COMMIT them.
- [x] D3. Arabic text renders correctly (no reversed/disconnected glyphs) in world labels.

## E. Oasis Village authored Tiled map (new pipeline)
- [x] E1. Pond water border broken — raw blue rectangle clipping out behind the big tree (top-right of pond). In current fix run. Verify pond outline fully autotiled.
- [x] E2. Tiled map path renders objects + interactables + collision equivalent to the procedural path (commits 77ff28d..1f5b003). Verify no missing objects vs zones.js.

## F. Instrumentation (so we never fly blind again)
- [x] F1. Screenshot harness camera fix (was framing barren map corner for months). Fixed in `24ee6f7`. Verify harness centers on content.
- [x] F2. Harness artifacts: overlapping floating zone-title text + React HUD card stuck on "OASIS VILLAGE" in programmatic zone switches. FIX THE HARNESS so future screenshots are trustworthy (clear/settle title, or hide HUD during capture).
- [x] F3. All harness/sandbox scripts committed (capture-world-screenshots.mjs committed; check scripts/shot-sandbox.mjs, docs/ folder).

## G. Findings from 2026-07-01 diagnosis swarm
- [x] G1. Every defect reported by the sweep agent in run wf_6c43697e-7bc (cross-zone object issues etc.) — pull the list from the run journal and verify each fixed or explicitly triaged.

## H. Close-out deliverables
- [x] H1. All fixes committed atomically (never staging the unrelated dirty files: package.json, public/sw.js, src/routes.jsx, src/services/swRegistration.js, vite.config.js, test-results/).
- [x] H2. World-related tests green; snapshot fixtures regenerated where fixes legitimately changed them.
- [x] H3. `docs/VISUAL-CLOSEOUT.md` written: every item above → final status + evidence, so planning can proceed on a closed visual layer.
