# Zone Design — mountain_village (قَرية الجَبَل)

**Phase 1 design document (2026-07-03). DOCUMENT ONLY — no code, maps, or zones.js changes flow from this file directly.**
Obeys: `docs/WORLD-DESIGN-BIBLE.md` (§2 LAWs, §3.6 brief, §7 LINT), `docs/world-design-research/contract-and-pipeline.md` §1 (mountain_village contract) + §8 (interiors), `docs/world-designs/world-connection-map.md` (exit ledger), `docs/world-design-research/asset-inventory.md`, `docs/WORLD-MISSING-ASSETS.md`.

---

## 1. Concept

**One sentence:** *A stone village stacked on three cliff terraces where weavers and healers live above the desert, its spring falling band to band from the mosque at the top to the sheep pens at the gate.*

The player climbs in from the bedouin steppe through a cliff pinch at the south, crosses a working mid-terrace of stone houses strung along one road, and earns the mosque court at the top of a ceremonial stair — the spring cascade (two waterfalls + three pools) is the vertical thread that sells the elevation (LAW-51), and the east ledge road leaves the mid band toward the first glimpse of the sea (LAW-46). No snow: Arabian stone highland (WORLD-MISSING-ASSETS #6).

**What the composition steals from each reference studied:**

| Reference (looked at) | Stolen |
|---|---|
| `pokemon-crystal-blackthorn-city-fullmap.png` | The whole skeleton: dwellings on the broad lower/mid shelf, landmark + water on the top band, main entrance bottom-centre, second exit cut sideways through the cliff wall; cliffs ARE the container. |
| `pokemon-rs-lavaridge-town-fullmap.png` | Mid-band pool with buildings shoulder-to-shoulder around it; ground-hue patch variation (sand pocket in stone town); tiered one-screen readability at ~40×30 scale. |
| `golden-sun-vale-mountain-village.png` | The vertical water spine — stream + waterfalls dropping through terraces with the main road crossing it on a small bridge; homes flanking the watercourse. |
| `golden-sun-tla-garoh-cliff-village.png` | Desert cliff-shelf dwelling grammar: houses wedged 0–1 tiles against the rock, a cave-mouth dwelling carved straight into the cliff face, switchback approach between bands. |
| `secret-of-mana-mandala-mountain-village.png` | Sacred-on-top: the temple/mosque alone on the highest terrace at the end of a long stair climb; village life kept low, the climb itself is the ceremonial approach (LAW-29/50). |
| `golden-sun-tla-champa-cliffside-village.png` | One zigzag route threading all ledges — no redundant stairs; each band entered from a laterally offset climb (LAW-49). |

## 2. Dimensions

**40 × 30 tiles** (unchanged from zones.js `mapWidth/mapHeight` — LINT-8; same class as the oasis template). Three elevation bands (LAW-48): top terrace rows 2–7, mid terrace rows 10–17, lower terrace rows 21–27, with 2–3-tile cliff faces between and a full cliff container (LAW-41).

## 3. Tile-grid sketch (40 × 30, 1 char = 1 tile)

Legend:
```
#  cliff / rock container (impassable)     d  packed earth / village ground
v  waterfall (on cliff face, impassable)   ~  water (pool / stream)
B  plank bridge (walkable, over stream)    M  mosque footprint (desert-temple)
O  obelisk minaret (impassable prop)       H  house footprint (impassable)
D  door tile (on building facade)          C  cave-dwelling mouth (decor, impassable)
T  acacia / dead tree                      r  rock outcrop (ore host)
g  scrub grass (walkable)                  f  fence (sheep pen)
.  terrace ground (walkable rock/gravel)   :  packed-dirt/cobble path
E  exit cut
```

```
    0         1         2         3
    0123456789012345678901234567890123456789
 00 ........................................
 01 ........................................
 02 ........................................
 03 ...........................~~~~~~.......
 04 ............................~~~~........
 05 .............................vv.........
 06 .######...#####...#######....vv...#####.
 07 .###.#####..#######...######.vv...######
 08 ..########.....#######..####.vv...####..
 09 ....#####.......#####........vv....#####
 10 ...ggg.....................~~.~~~.......
 11 ............H.......C:H::::~~~~~........
 12 ........rr...........::::::~~~~~.......E
 13 ...........:::::::::::::::::..~~.......E
 14 ...........:::::::::::::::::..BB.......E
 15 ....gggg......................~~.......E
 16 ..............................~~.......E
 17 .#####..#..#...###.####..###.vv...#####E
 18 .#######....#####..####C###..vv...#####E
 19 ...####.......####....###....vv....####.
 20 dd...ddddddd.ddddddddddd.ddddd.~~ddddddd
 21 ddddd..dddggggd.dddMMMMMdd.d~~~~dddddddd
 22 dddd.dddddddd.d:::::M::::::d~~BBdddddddd
 23 ddddd.dddd.dddd::H:MMMMM:::gg~~~dddddddd
 24 dddddddd.dddddd::::HHH:::::.dd~~dddddddd
 25 dd.ddggggdd.ddd::::::::::::ddd~~dddddddd
 26 ddddd.dggggddd.ddd::::::dddddd~~dddddddd
 27 ddddddddd.dddddddd::::::.ddddd~~dddddddd
 28 dddd.ddddddddddddd::::::ddd.dd~~dddddddd
 29 .................EEEEEEE................
```

**Reading the composition:**
- **Path language:** one main road climbs from the south arrival into the lower plaza, then crosses the mid terrace and the east stream on the 2-tile plank crossing **B** at (30,14)–(31,14) before leaving through the port ledge. The upper and lower cliff bands use staggered 2–3-row faces with several walkable gaps rather than one continuous wall.
- **Water:** spring source pool on the top band → two-tile waterfall → scalloped mid pool → two-tile stream and bridge → second waterfall → scalloped lower pool and east-side outflow. The stream is deliberately two tiles wide so the existing shoreline autotiling supplies both banks.
- **Focal hierarchy:** the waterfall is the first strong visual anchor from the fullmap, with the mosque as the lower-village landmark and the bridge as the crossing detail.
- **Focal hierarchy:** primary = mosque + twin obelisk minarets terminating the x18 axis on the top band (LAW-12/50); secondary = the double waterfall thread; tertiary = the bridge. From spawn (20,26) the walk-in axis (x19–21 north) is 1 tile off the mosque-door axis (x18) — the landmark sits on the entry sightline (LAW-25) with both waterfalls animating on the way up.
- **Entrance framing (LAW-28):** south cut x19–21 through a 2-row cliff pinch, lantern pair at (18,27)/(22,27), sign 1 tile off-path at (22,25), plaza reached within 5 tiles of the cut.
- **Diagonal sweep (LAW-30):** gate (20,29) → lower plaza (20,25) → stairs (25,19) → bridge (29,13) → mosque (18,4) — the eye zigzags across the whole map.
- **Cliff-face jogs (LAW-48):** container depth varies 1–3 (see x2–3 vs x2, rows 10–17); jog outcrops drawn on EVERY long face — (7–8,10), (24–25,10) and (33–35,10) break the upper face (the wedged Salim house occludes it at x11–13, LAW-50); (10–11,21), (17–18,21) and (35–36,21) break the lower face (with the cave mouth C(23,19) as a fourth break); (12–13,27) + the (31–35,27) blob break the bottom container's inner edge; build agent adds further 1-tile jogs where any remaining straight run exceeds 6 when stamping tiles.

## 4. Districts

| District | Tile rect (x,y → x,y) | Purpose |
|---|---|---|
| **South Gate & Lower Terrace** | (2,21) → (37,27) + corridor (19,26)→(21,29) | Arrival: dressed entrance, plaza, two stone filler houses, sheep pen (LAW-47, gate at (9,24) facing the road), camel vignette at (23–25,26), lower pool + stream chest. |
| **Quiet corner (SW)** | (3,25) → (9,27) | LAW-31 deliberate quiet: dead tree, inscription, nothing else. |
| **Mid Terrace — Weavers' Street** | (2,10) → (37,17) | Working heart: Salim's home (enterable), healer's house, weaver vignette, mid pool + fountain, bridge, main road, stair connector. |
| **East Ledge Road** | (30,12) → (39,16) | The descent to the port: road, vista inscription, pot-cluster signpost — the sea glimpsed beyond the cut (LAW-46). |
| **Top Terrace — Mosque Court** | (2,2) → (37,7) | Sacred band (LAW-39, ≥40% empty): mosque + minarets, statue pair, court paving, spring source pool, peak chest pocket NW. |
| **Cliff faces & stairs** | rows 8–9 and 18–20 | The two climbs; cave-dwelling mouth **C**(23,19) with awning/pot dressing (LAW-50 cheap dwelling, decor only). |

## 5. Contract placement table

Every contract ID for mountain_village (contract-and-pipeline.md §1), placed exactly once.

**Spawn & entries** (keys preserved):

| Key | Tile | Rationale |
|---|---|---|
| `spawnPoint` | (20,27) | Frozen runtime spawn on the entrance corridor. |
| `entries.from_bedouin` | (20,27) | Frozen runtime entry from the south cut (= spawn). |
| `entries.from_port` | (38,15) | Frozen runtime entry from the east cut. |

**Exits** (edges match world-connection-map ledger exactly):

| Exit id | Edge | tileRange | Fraction | Target |
|---|---|---|---|---|
| `mountain-to-bedouin` ★ dressed | south | [17,23] | frozen runtime range | bedouin_camp / `from_mountain` |
| `mountain-to-port` (plain) | east | [12,18] | frozen runtime range | coastal_port / `from_mountain` |

**NPCs (3):**

| ID | Tile | Rationale |
|---|---|---|
| `guide-salim` | (20,13) | Frozen runtime position on the mid terrace. |
| `weaver-zahra` | (15,20) | Frozen runtime position beside the lower village home. |
| `healer-khadija` | (27,20) | Frozen runtime position beside the lower village home. |

**Interactables (23):**

| ID | Type | Tile | Rationale |
|---|---|---|---|
| `sign-mountain` | sign | (20,26) | Frozen runtime position. |
| `sign-weaver` | sign | (13,18) | Frozen runtime position. |
| `bookshelf-clothing` | bookshelf | (16,10) | Frozen runtime position. |
| `bookshelf-animals-mt` | bookshelf | (24,10) | Frozen runtime position. |
| `bookshelf-adj-mt` | bookshelf | (20,16) | Frozen runtime position. |
| `chest-mountain-stream` | chest | (32,15) | Frozen runtime position beside the stream. |
| `chest-mountain-peak` | chest | (5,3) | Frozen runtime peak position. |
| `door-mountain-home` | door → `mountain_home_interior` | (15,20) | Frozen runtime home door. |
| `door-mountain-mosque` | door → `mountain_mosque_interior` | (25,20) | Frozen runtime mosque door. |
| `statue-mountain-1` | statue | (20,10) | Frozen runtime position. |
| `statue-mountain-2` | statue | (16,14) | Frozen runtime position. |
| `painting-mountain-1` | painting | (17,19) | Frozen runtime position. |
| `painting-mountain-2` | painting | (24,19) | Frozen runtime position. |
| `pot-mountain-1` | pot | (14,12) | Frozen runtime position. |
| `pot-mountain-2` | pot | (26,12) | Frozen runtime position. |
| `lantern-mountain-1` | lantern | (19,22) | Frozen runtime position. |
| `lantern-mountain-2` | lantern | (21,22) | Frozen runtime position. |
| `fountain-mountain-1` | fountain | (29,10) | Frozen runtime spring position. |
| `barrel-mountain-1` | barrel | (13,21) | Frozen runtime position. |
| `crate-mountain-1` | crate | (27,21) | Frozen runtime position. |
| `inscription-mountain-1` | inscription | (2,3) | Frozen runtime peak position. |
| `inscription-mountain-2` | inscription | (37,27) | Frozen runtime position. |
| `inscription-mountain-3` | inscription | (6,27) | Frozen runtime position. |

**Gathering spots (8, `gatheringSpots: true` preserved — ore-heavy per brief, all veins on rock):**

| ID | Resource / type | Tile | Rationale |
|---|---|---|---|
| `spot_mountain_ore_01` | iron_ore / ore_vein | (10,8) | Frozen runtime position. |
| `spot_mountain_ore_02` | silver_ore / ore_vein | (25,12) | Frozen runtime position. |
| `spot_mountain_ore_03` | silver_ore / ore_vein | (18,18) | Frozen runtime position. |
| `spot_mountain_herbs_01` | thyme / herb_patch | (6,15) | Frozen runtime position. |
| `spot_mountain_water_01` | olive_oil / water_source | (30,20) | Frozen runtime position. |
| `spot_mountain_animal_01` | wool / animal_trace | (12,22) | Frozen runtime position. |
| `spot_mountain_herbs_02` | fenugreek / herb_patch | (28,6) | Frozen runtime position. |
| `spot_mountain_papyrus_01` | vellum / papyrus_stand | (35,15) | Frozen runtime position. |

Step triggers / sub-areas: none in the mountain_village contract — none added.

## 6. Enterable interiors

Exactly the contract's 2 doors; interiors keep their existing hand-crafted layouts this phase (contract §8):

| Exterior door | Tile | interiorId | Existing interior (unchanged) |
|---|---|---|---|
| `door-mountain-home` | (12,12) | `mountain_home_interior` | Elder's Home, 10×8 buildSmallHouse, NPC `mountain-elder-interior` (Guide Salim), 4 interactables incl. `exit-door`. |
| `door-mountain-mosque` | (18,5) | `mountain_mosque_interior` | Mosque, 18×14 buildMosque, NPC `imam-interior`, 7 interactables incl. `exit-door` + `sign-mihrab`. |

No locked doors in this zone. The two lower stone houses, the healer's house, and the cave mouth **C** are **non-enterable dressing** (no new interiorIds; the cave is a cliff-face decor tile, not a door interactable). The mosque court stays roomy enough for a future "letter school" slot (connection-map §5) without touching the LAW-11 budget.

## 7. Asset manifest (all verified in asset-inventory.md / kenmiCatalog)

| Grid element | Kenmi family (catalog keys) | Verified |
|---|---|---|
| `#` cliffs, container | `kenmi-desert-tiles-desert-cliff-tiles-1..3` (primary), `kenmi-base-tiles-cliff-stone-cliff-1..4-tile` (accents) | ✓ §1 |
| `C` cave dwelling | `stone-cliff-*-cave-entrance` | ✓ §1 |
| `d` lower village ground | packed earth base under the lower shelf | ✓ §1 |
| `.` mid/peak ground | stone/gravel base under working terrace and peak | ✓ §1 |
| `v` waterfalls | `kenmi-base-tiles-waterfall-waterfall-1..8` | ✓ §1 |
| `~` pools/stream | `desert-water-tiles-1..3` + `desert-water-foam-animation`; `water-stone-tile-*` for the hard fountain lip | ✓ §1 |
| `:` paths | `cobble-road-1/2` (stone village paving; contrasts base ground per LAW-6) | ✓ §1 |
| `g` scrub grass | `desert-tiles-desert-grass` blob (the sand↔green intermediary, MISSING #5) | ✓ §1 |
| `M` mosque | `desert-temple` facade — MISSING-ASSETS **#1 composite** | ✓ §2 |
| `O` minarets | `desert-obelisk-1/2` (mosque composite per #1) | ✓ §2 |
| `H` houses (×4) | `house-1-*` / `house-2-stone-*` / `house-4-*` stone & limestone variants (bible §1: allowed in mountain_village), varied colourways | ✓ §2 |
| `B` bridge | `bridge-wood` (or `desert-tiles-desert-bridge`) | ✓ §1 |
| `f` sheep pen | `stone-fence-small` (+ gate piece) | ✓ §3 farm |
| `T` trees | `acacia-tree`, `dead-tree` (SW corner), `halfdead-tree` | ✓ §3 |
| `r` rocks | `desert-rocks`; `ores` sheet dresses the vein spots | ✓ §3 |
| Props | `desert-rugs` (flat — weaver vignette + door mats), `desert-pots-sacks`, `barrels`, `crate-anim`, `signs`, `lantern`, `lanter-posts`, `hay-bales`, `water-troughs` (pen) | ✓ §3 |
| Animals (explicit objects only — ambient spawner is OFF) | `sheep` ×2 inside pen (6,23)/(8,24) — goat stand-in per MISSING #7; `camel-1` ×1 at (24,26) with rug+sacks (vignette 2) | ✓ §5 |
| Fountain | `fountain` / `fountain-anim` (interactable sprite via existing spriteKeyMap) | ✓ §3 |
| Ambience | `chimney-smoke-anim` on 1–2 houses | ✓ §5 |

**Missing / skipped (recorded in `docs/WORLD-MISSING-ASSETS.md`, not faked):**
- **Exterior cliff stair tiles** (`=`) — no exterior stair frames exist (verified: cliff sheets have none; only interior `wood-stairs` and dungeon stair images). → new row **#13**; workaround = 2-tile cut in the cliff face + `kenmi-dungeons-dungeon-1-stairs` stair image laid as a prop across the face (dungeon-2 palette for the ceremonial climb).
- **Weaver's loom / textile racks** — none. → new row **#14**; workaround = crate + wall-adjacent `desert-rugs` + pots reading as a dye/weave station.
- Snow (theme says `snow`): built as stone highland per existing row **#6** — no snow tiles anywhere; the weather-data decision stays deferred as that row says.
- Mosque & minarets: existing row **#1** composite, applied above. Goats: row **#7** (sheep stand-in), applied above.

## 8. Lint self-check (LINT-1..11)

- **LINT-1 (no overlapping objects):** every placed ID above has a unique tile; props hug building walls but sit outside the H/M footprints; the only flat-prop layering is rugs (weaver vignette, door mats) which are exempt as the lower layer.
- **LINT-2 (nothing on water/collision):** all NPC/interactable/spot anchors sit on `.`/`:`/`g` tiles (verified against the grid, incl. fountain moved to the (24,12) lip, not the pool). `spot_mountain_water_01` (28,23) uses the water_source shore-rim allowance. The plank crossing `B` (29,13)+(29,14) is on the amphibious allowlist. No door or NPC touches collision.
- **LINT-3 (rugs on plausible ground):** rugs only on flat terrace floor (weaver front x14–15/y13, camel vignette (23,26), door mats) — never on `~`, `=`, cliff GIDs, or shore-straddling tiles; none on the sand-hue boundary steps.
- **LINT-4 (density/spacing):** no ambient animals (spawner off; 3 explicit animal objects total). Prop counts per 20×15 window: mid core ≈ 12–13, lower ≈ 11, top ≈ 8, all ≤ 15 (LAW-31); quiet corner has 2 props + 0 NPCs. Same-key props (pots, lanterns, inscriptions, statues) all ≥ 2 tiles apart or declared pairs/clusters; no 3-in-a-row same-key lines (LAW-35). No empty 20×20 window: every quadrant holds a pool, pen, rocks, or trees + sand-hue blobs every ≤ 8 tiles (LAW-33).
- **LINT-5 (reachability):** flood-fill from spawn (20,26): corridor → lower plaza → west houses/pen (gate (9,24)) → stairs (25–26, y18–20) → mid road → bridge → east exit; ceremonial stairs (17–19, y8–9) → top band → mosque door. All 4 doors have a reachable orthogonal tile + ≥ 2 clear tiles in front (home (12,13)/(12,14); healer n/a — no door; mosque (18,6)/(18,7); house A (12,25)/(12,26); house B (17,26)/(17,27)). Both exits, all 3 NPCs, all 8 spots, both entries reachable; no islands (the (36,27) and (36,10) pockets connect via rows 26 and 11 respectively).
- **LINT-6 (exits present & connected):** exactly the 2 contract exit ids; edges (S/E) match zones.js today AND the connection-map ledger; fractions 0.50 / 0.43 within the ±0.10 windows; both targetEntries (`from_mountain` in bedouin_camp and coastal_port) exist in their zones' entries; landing tiles (20,26)/(37,14) walkable and outside any trigger range.
- **LINT-7 (contract completeness):** 3/3 NPCs, 23/23 interactables, 8/8 gathering spots, 2/2 exits, 2/2 entry keys — each exactly once, no strays. Both `interiorId`s resolve in the INTERIORS registry and each interior has its `isExit:true` `exit-door` (contract §8). Building-set interactables (doors, signs, wall paintings, corner pots, flank bookshelves) all within 2 tiles of their building (LAW-16).
- **LINT-8 (dims/template):** 40×30 matches zones.js `mapWidth/mapHeight`; the Tiled JSON will copy the oasis-village.json structure (Ground/Collision/Exits, uncompressed, catalog-named tilesets).
- **LINT-9 (asset legality):** every family in §7 verified in asset-inventory.md; nothing from CULTURAL_EXCLUDES (no church, no snow-pack christmas decor, no pigs); the two unsupported wants went to WORLD-MISSING-ASSETS rows 13–14 with workarounds, per the bible rule.
- **LINT-10 (shoreline/seams):** all three pools scallop with max straight seam 5 ≤ 6 (LAW-17); no raw grass GID touches raw sand — the only "grass" is the scrub-grass blob family which blends to sand (MISSING #5); district ground changes (cobble↔dirt, sand hues) step diagonally 1–2 tiles (LAW-44), enforced at stamping time.
- **LINT-11 (collision coverage — authoring law):** the Collision layer must paint EVERY `#`, `~` (except under the two `B` tiles), `v`, `M`/`H`/`O`/`C` footprint, `f` fence, `T` trunk and `r` tile; `=`, `B`, `.`, `:`, `g` stay walkable. Verify by hand + in-game walk before acceptance — lint cannot catch unpainted water/cliff today.

---

## 9. Review appendix (adversarial pass, 2026-07-03)

**Checked against ground truth (not the designer's claims):** contract-and-pipeline.md §1 mountain_village ID list + §8 interiors; world-connection-map.md exit ledger; WORLD-DESIGN-BIBLE.md §2 LAWs + §3.6 brief; asset-inventory.md; WORLD-MISSING-ASSETS.md. Grid parsed programmatically (30 rows × 40 cols exactly), every placement coordinate checked against its grid character, BFS flood-fill run from spawn (20,26).

**Verified clean:**
- CONTRACT: 3/3 NPCs, 23/23 interactables, 8/8 gathering spots (resources/types match), 2/2 exits, 2/2 entry keys, spawnPoint — each placed exactly once, zero strays. Both interiorIds match §8 (10×8 home / 18×14 mosque, both with `isExit` doors). Exits on correct edges: S [19,21] = 0.50 (ledger 0.50 ★), E [12,14] = 0.43 (ledger 0.40 ± 0.10). Destination entries `from_mountain` exist in bedouin_camp and coastal_port.
- REACHABILITY: flood-fill reaches both exits, both entries, all NPCs, all doors (with ≥2-tile fronts), all 8 spots, all chests/signs/props, the SW quiet corner and both edge pockets. No islands.
- ASSETS: all §7 families verified present in asset-inventory.md (cliff sheets + cave-entrance, desert-cliff-waterfall-1..3, desert-beach/water tiles, cobble-road-1/2, desert-grass blob, desert-temple + obelisks, house-1/2-stone/4 European variants — legal in mountain_village per bible §1, bridge-wood, stone-fence-small, acacia/dead trees, desert-rocks + ores, sheep/camel-1, fountain-anim, chimney-smoke-anim). MISSING-ASSETS rows #13 (exterior stairs) and #14 (loom) confirmed recorded with workarounds; no faked keys, no cultural excludes.
- COMPOSITION: mosque terminates the entry axis (LAW-25/29), three banded terraces with 2–3-tile faces (LAW-48), one 3-wide ceremonial + one 2-wide offset stair (LAW-49), water thread top-pool→falls→mid-pool→stream→falls→lower-pool all on column x29 (LAW-51), pools scallop 3/5/3 (LAW-17), pen gated toward the road (LAW-43/47), lantern pair + sign frame the south cut (LAW-28), vista inscription on the east ledge (LAW-46).

**Violations found and FIXED in this doc:**
1. **LAW-20/23 — 1×1 stream crossing.** `B` existed only at (29,13). Fixed: plank crossing now 2 tiles, (29,13)+(29,14); prose + LINT-2/11 updated.
2. **LAW-1 — main road drawn 1 tile wide** on the mid band (row 13 x10–18 only), the mosque connector (single `:` at (18,12)) and the east ledge (1-wide jogged legs). Fixed: row 14 x10–26 paved → true 2-wide main street; (17–19,12) → 3-wide ceremonial connector matching the x17–19 stair; row 13 x34–38 paved → 2-wide ledge road into the east exit. (The west house lane at y25 stays 1-wide deliberately — LAW-1 alley class.)
3. **LAW-48 — straight cliff runs > 6** with jogs only promised to "the build agent": upper face x0–16 unbroken, lower face x12–24 unbroken, bottom container inner edge x6–18 unbroken. Fixed: jogs drawn into the grid at (7–8,10), (17–18,21), (10–11,21) [pre-existing], (35–36,21), (12–13,27); post-fix no visible face segment exceeds ~6 (Salim's wedged house occludes x11–13 of the upper face; cave C breaks the lower face).
4. **LAW-18 — no scrub halo on any pool.** Only 3 `g` tiles existed (all at the stream). Fixed: partial scrub halo added at all three pools — (27,3), (32,4), (26,10), (32,11), (26,12), (27,21), (32,23) — grass stays water-adjacent only (bible §1, MISSING #5).
5. **Count error:** §8 summary claimed "5 houses"; the grid has 4 (Salim, healer, 2 lower fillers). Fixed to 4 + mosque + cave = 6 (LAW-11 ✓).
6. **Prose drift:** "two house doors (y25)" → y24–25; stream extent corrected to y15–17 (y13–14 planked).

**Post-fix machine re-check:** grid still 30×40; flood-fill from spawn reaches every contract anchor; bridge = 2 tiles; all claimed halo/jog coordinates match the grid; east ledge and mid-band roads measure 2 wide; no placement sits on `#`/`~`/`v`/footprint tiles. Verdict: **FIXED** — design is sound; no rewrite needed.

**Un-lintable law summary for screenshot review:** landmark on entry axis (LAW-25 ✓), one oversized landmark (LAW-12 ✓), stairs one-per-band + offset (LAW-49 ✓), water thread through bands (LAW-51 ✓), doors face south (LAW-5 ✓), two story vignettes (weaver loom; camel + wool sacks — LAW-34 ✓), symmetric pairs only on the mosque axis and the entrance (LAW-36 ✓), quiet corner SW (LAW-31 ✓), vista at the east ledge (LAW-46 ✓), building budget 4 houses + mosque + cave-dwelling = 6, within the 6–9 mid-town band (LAW-11 ✓).
