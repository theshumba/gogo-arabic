# Phase 0 Completeness Critique — WORLD-DESIGN-BIBLE + companions

Adversarial completeness review, 2026-07-03. Verdict: **GAPS** — the pack is close to ready
(contract solid, assets real, linter real and running), but 1 high + 4 medium gaps should be
closed before zone-build agents launch. Nothing here was fixed; this is findings only.

## What was verified (evidence)

- **Q1 — buildability from the bible:** §2 laws (51), §3 per-zone briefs (identity, anchor,
  districts, contract counts, reference categories), §4 palette, §6 pipeline, §7 lint spec are
  concrete and tile-quantified. The bible intentionally defers the authoritative ID list to
  `contract-and-pipeline.md` §1 and reference images to Desktop — both exist. An agent can build
  the 8 EXTERIOR zones without guessing, with the vagueness exceptions listed below (gaps 4, 5, 8).
- **Q2 — contract extraction:** all 8 zones present in contract-and-pipeline.md §1 with concrete
  ID lists. Spot-checked `src/data/zones.js` at runtime for **oasis_village** (4 NPCs, 1 exit,
  25 interactables, entries `from_library`, 3 stepTriggers — all IDs match the doc exactly) and
  **bedouin_camp** (3 NPCs, 2 exits, 20 interactables, entries `from_farmland`/`from_mountain` —
  match). `gatheringSpots.js`: oasis 8 / bedouin 8 / royal_palace 0 — matches, incl. the
  documented palace-zero anomaly and the 6 orphaned `baghdad_market` spots. stepTriggers/subAreas
  exist ONLY in oasis_village (verified) — consistent with the doc listing them only there.
- **Q3 — asset palette reality:** spot-checked 20+ palette references against
  `kenmiCatalog.js` (969 entries) and disk: well, volcano-tower, wooden-deck-tiles,
  fisherman-house (9 variants), water-sack-on-stick, grapes-bower, desert-cliff-waterfall-1..3,
  pole-and-bunting-1/2-anim, lanter-posts, military-tents, split-log-benches, campfire-pot-anim,
  market-stalls, desert-fencewall, boat + boat-anim, pavement-tiles, temple-house-interior,
  fountain(-anim), hedge-tiles, sleeping-mat, desert-rugs, obelisks ×4, silo, windmill(+sail-anim),
  banners-anim, desert-beach-tiles-1..3, water-tile-3(+anim), grass-tiles-3. **All real**; disk
  paths verified for 5 (note: military-tents lives in `kenmi/militarycamp/`, catalog path correct).
- **Q4 — linter:** `scripts/lint-world-map.mjs` (845 lines) implements **all** of LINT-1..10 with
  the sub-checks the bible specifies (LINT-4 a–d incl. even-spacing WARN + empty-20×20 WARN;
  LINT-5 doors/NPCs/spots/entries/exit-approach BFS; LINT-6 full connectivity + edge/bounds +
  teleport-loop; LINT-7 exactly-once + interiorId resolution + isExit + LAW-16 WARN; LINT-3
  transition-frame WARN; LINT-10 seam checks). Ran `node scripts/lint-world-map.mjs oasis_village`:
  runs clean as a program, reports 11 errors / 18 warnings on the current map, exit code 1. No
  bible LINT law is unimplemented.
- **Q5 — VISUAL-CLOSEOUT consistency:** the bible's MUST-NOT-TOUCH block matches
  VISUAL-CLOSEOUT.md verbatim in substance (MapLoader scale/crop, frame-table guards, Arabic RTL,
  never-stage file list). One stale-claim contradiction found (gap 3).

## Numbered gaps

1. **HIGH — Interior contract is not extracted anywhere.** Scope (bible line 14–16) includes
   interiors in the rebuild and the preserved contract covers "NPC IDs, interactable/object IDs".
   The 15 hand-crafted interiors in the INTERIORS registry contain **11 NPC IDs and 86
   interactable IDs** (e.g. `merchant-fatima-interior`, `chest-merchant-home`, `exit-door`) —
   none listed in contract-and-pipeline.md §1, and LINT-7 only checks door→interiorId + an
   isExit door, nothing inside the interior. An agent redesigning interiors per §5/INT-1..12 has
   no frozen ID manifest and could silently drop quest-referenced interior objects. Fix: extract
   a per-interior ID manifest the same way §1 was extracted.
2. **MEDIUM — Bible §5 door count is wrong: says "14 doors across the 8 zones" but enumerates 15**,
   and zones.js has 15 (oasis 3, library 2, market 3, farm 1, bedouin 1, mountain 2, port 2,
   palace 1 — verified at runtime). Off-by-one invites an agent to "reconcile" by dropping one.
3. **MEDIUM — Ambient-animals contradiction.** Bible §4: "`BIOME_ANIMAL_SETS` already wires
   desert/grass sets…". VISUAL-CLOSEOUT B5 (evidence-verified): `spawnAmbientAnimals()` is
   commented out; ZERO animal sprites exist in any zone. LINT-4(a) caps a system that is dead
   code. Risk: a builder re-enables commented game code (logic touch) or expects animals in
   acceptance screenshots. State explicitly whether ambient animals are in or out of scope.
4. **MEDIUM — No lint-clean baseline; false-positive risk unquantified.** The one "proven"
   template map (oasis-village.json, closeout E1/E2-verified) fails the new lint with 11 ERRORs —
   some look like linter artifacts rather than map defects (entry `from_library` "not walkable"
   at (20,3), LINT-4 window at (0,0), LINT-9 on the lillypad anim, LINT-2 on pond decor that the
   closeout explicitly verified). Old layouts are being thrown away so the errors are moot, but
   builders have no example proving lint-clean is achievable, and no triage note separating
   "real violation" from "known linter approximation". Recommend a one-pass triage of these 11.
5. **MEDIUM — Collision-layer authoring policy is unstated and engine≠linter walkability differs.**
   Engine (contract §3): player collides ONLY with the hidden Collision layer + `collide:true`
   object bodies — water does NOT block by itself on the Tiled path. Linter BFS treats water as
   unwalkable regardless. The bible never says "paint Collision GIDs over all water / container
   band / cliff faces", so a map can pass reachability lint yet let the player walk on water
   in-game. One sentence in §6 step 2 fixes this.
6. **LOW — Terrain-stamping fallback undocumented.** §6 step 2 leans on the tiled-mcp-server, but
   it has no `dist/` build and is not registered (no `.mcp.json`) — confirmed in contract §5. The
   manual alternative (choosing CORNER/EDGE/SOLID/INNER frame indices from
   `kenmiFrameTables.js`) is only hinted at in asset-inventory.md §1, never proceduralised.
7. **LOW — LAW-38 cross-reference error:** "(Rug placement rules: LINT-5.)" — rug rules are
   LINT-3; LINT-5 is door reachability.
8. **LOW — Reference-library location fragility.** The library exists ONLY at
   `~/Desktop/Gogo-World-References/` (verified: 11 category folders + README + loose maps);
   repo `docs/world-references/` is EMPTY. WORLD-REBUILD-PROMPT.md documents the split and a
   STOP-if-missing rule, but the bible itself cites only the Desktop path — any non-local or
   future-machine agent has zero references and no in-bible warning.

## Non-gaps confirmed

- Zone graph in the bible matches zones.js exits/entries (2-zone spot-check).
- Bible zone-brief counts (NPCs/exits/interactables/spots/entries) match the contract doc for
  both spot-checked zones, including royal_palace's deliberate 0-gathering-spots flag.
- MUST-NOT-TOUCH lists in bible §6 and VISUAL-CLOSEOUT/contract §3 agree; no untouchable rule is
  contradicted by any bible instruction (BootScene registration + zones.js coordinate edits are
  explicitly part of the sanctioned pipeline).
- WORLD-MISSING-ASSETS workarounds reference only real keys (spot-checked #1–#4, #9, #12).

## Close-out — re-verification 2026-07-03

All 8 gaps independently re-verified against the actual files (not agent claims) and confirmed CLOSED. (1) contract-and-pipeline.md §8 now holds the full per-interior manifest (15 interiors / 11 NPC ids / 86 interactable ids); `merchant_house_interior` and `palace_throne_interior` spot-checked line-by-line against `src/data/interiors/zones/*.js` — exact match. (2) Bible §5 now says 15 doors with the correct per-zone breakdown. (3) Bible §4 now states `spawnAmbientAnimals()` is dead code, zero ambient animals spawn, and re-enabling it is out of scope. (4) `lint-baseline-oasis.md` exists with every finding classified; a fresh `node scripts/lint-world-map.mjs oasis_village` run reproduces the documented baseline exactly — 6 errors / 16 warnings, all classified REAL old-layout defects, zero known false positives. (5) Bible §6 carries the COLLISION AUTHORING doctrine and the linter BFS (`walkable()` = Collision GID 0 + collide-object bodies) now matches the engine model, with LINT-11 automated (oasis pond passes). (6) §6 step 2 documents the tiled-mcp-server as unbuilt/unregistered and names direct Tiled-JSON generation as the supported path. (7) LAW-38 now cites LINT-3; the only other in-law LINT citations (LINT-4(a), LINT-11 §7) are correct. (8) The bible header names the Desktop reference library as canonical, flags repo `docs/world-references/` as an empty secondary drop-folder, and carries the STOP-if-missing rule. `git status --porcelain` shows no game code touched — only docs/, scripts/lint-world-map.mjs, and the known pre-existing dirty/untracked entries (plus a leftover temp probe `scripts/.probe-g4.tmp.mjs`, safe to delete). **Verdict: READY** — zone-build agents may launch.
