# Zone Design — desert_marketplace (سوق الصَّحراء)

**Status:** Phase 1 design document (2026-07-03). DOCUMENT ONLY — no code, maps, or zones.js changes flow from this file directly.
**Obeys:** `docs/WORLD-DESIGN-BIBLE.md` (LAW-1..51, zone brief §3.3), `docs/world-design-research/contract-and-pipeline.md` §1 (contract) + §8 (interiors), `docs/world-designs/world-connection-map.md` (exit ledger), `docs/world-design-research/asset-inventory.md` (palette).

---

## 1. Concept

**One sentence: a walled caravan souk roaring around a fountain plaza — the world's commercial heart.** The player enters through the dressed west gate off the scholars' road, walks a widening caravan road past a just-arrived camel train straight to the fountain plaza, and everything commercial radiates from there: the rug-and-stall souk block to the south, the awninged spice and textile shops flanking the shop street, and the road terminating at the oversized warehouse whose locked door ends the axis. Around the commerce, ordinary life makes it believable — two residential clusters whose lanes all drain toward the plaza, a north road out to the farmland that feeds this market, and one quiet dusty corner where the wall crumbles and nobody trades anything.

**What the composition steals from each reference studied:**

| Reference | What was looked at | What this design steals |
|---|---|---|
| `03/pokemon-emerald-slateport-city-outdoor-market-fullmap.png` | GBA 16px outdoor bazaar | The market as a **bounded sub-district off the main road** (Slateport's stall rows sit in their own fenced block, never on the thoroughfare): 2 columns × 2 rows of stalls, goods crates at stall flanks, 2–3-tile aisles, one walkable loop — copied 1:1 into the souk block (LAW-37). |
| `01/golden-sun-lalivero-desert-town-fullmap.png` | Prime Arabian sandstone town | The **adobe wall container with corner towers and one gate**, rug-marked transaction points everywhere, and the tower/obelisk as vertical punctuation on the wall line. Lalivero's rug-filled shop fronts → rug under every door/stall here (LAW-38). |
| `03/terranigma-louran-west-desert-town-fullmap.png` | Silk-Road adobe streets | Flat-roof buildings **hugging the walls and each other at staggered offsets**, alleys reading as leftover space between masses — used for the NW/SE residential clusters and the wall-hugging warehouse corner. |
| `03/golden-sun-tla-alhafra-arabian-town-fullmap.png` | Arabian port/market town | District legibility on one map: gate → square → shops → working corner, each ground material change marking a district (LAW-44); the tiered "town square as the town's centre of gravity". |
| `03/bitsmall-bazaar-tileset-demo-anim1.gif` | Composed 16px desert bazaar | The **detail grammar of a souk floor**: jar clusters at wall bases, red rug+chest merchandise vignettes beside doors, a lone cactus in open ground, fountain visible from the courtyard mouth — drives prop clustering (LAW-32) and the caravan vignette. |
| `03/elvgames-marketplace-tileset-demo-1.png` | Dense stall rows | Alternating stall/awning variants and **breaking stall runs with prop gaps** so rows never read machine-filled (LAW-35/37). |
| `11/kenmi-desert-arabian-village-road-junction.gif` | Kenmi's own detail language | Scalloped dirt-road T-junctions with anchored corners, camel+rug+trader vignette near (not on) the road, house door stubs onto the road — the exact junction/vignette language used at the west gate and NW lane. |
| `11/goldensun-tolbi-fountain-square.png` | Fountain plaza close-up | **Fountain off-centre in a paved plaza with unequal radiating paths** and 2–3 NPCs earning the focal (LAW-26/27); stall+goods clusters at the plaza's shop mouths. |

## 2. Dimensions

**45 × 35 tiles** (64px world tiles) — matches contract dims and zones.js `mapWidth/mapHeight`. Densest zone in the world: top of the LAW-31 budget, one deliberate quiet corner.

## 3. Tile-grid sketch

Legend: `#` adobe wall (desert-fencewall, 1–2 deep, collision) · `T` wall tower (stacked obelisk-small accent) · `v` waist-high wall — dune **vista** (LAW-46) · `E` exit cut · `.` sand · `,` sand variation / trampled souk floor · `=` main caravan road (cobble/packed) · `-` lane / secondary street · `P` plaza stone paving · `F` fountain (focal) · `g` grass/planter tuft (only near the fountain) · `p` palm · `t` dead tree · `%` rock outcrop · `o` prop cluster (jars/sacks/crates/barrels/trough/cactus per district notes) · `+` pole-and-bunting · `*` lantern (contract pair) · `r` rug (flat, LINT-3) · `S` contract stall · `H` filler adobe house · `X` spice shop · `Y` textile shop · `V` warehouse (landmark) · `!` obelisk pair · `D` door · `C` chest · `s` sign · `b` bookshelf · `I` inscription · `N` NPC · `c` camel · `x` gathering spot

```
    0         1         2         3         4
    012345678901234567890123456789012345678901234
 0  #######T######T####EEE######T#######T########
 1  ######.............--..................######
 2  #...........,,,,.p.--s......................#
 3  #........HHH,,,,.o.--..................I.C..#
 4  #........HHH.......---...........p..........#
 5  #..IHHH..HHH...p.....--N.,,,,...............#
 6  #...HHH..HDHo........--..,,,,...............#
 7  #...HDH...-..........--...p.............%x..T
 8  T....--------...o....--..................%..#
 9  #.......---------...---....................##
10  ##...HHH.....---------.......YYY......,,,,.##
11  ##...HHH..XXX....-----...x...YYY......,,,,.##
12  ##...HDH.bXXX.....bPPPPPPPPp.YYYb..........##
13  ##p...-.x.XDX......PgPPPPPP..YDYs.!VVVV!....T
14  #.*...-..s.rN.=====PPPFPPPP===rN===VVVV.....#
15  #====.-..==========PPPPxPPP========VVVV.....#
16  E==================PPPPPgPP========VDVV.....#
17  E=============.....PPPPPPPP.......==r==o....#
18  E========..........PPPPPPPP.......=====o....#
19  #....................,,............--.......v
20  #.*.....o.....,+,,,,,,,,,,,,,+,....--.....o.v
21  #.p..cr.......,o,S,,,,,,,S,o,,,HHH.--.......v
22  #...x.oc......,,,r,,,,,,,r,,,,oHHH.--.......T
23  #............x,,,,,,,,,,,,,,,,,HDH.--.......#
24  #.............,o,S,,,,,,,S,,,,,.-----.HHH...#
25  T..,,,,.......,,,r,,,,,,,r,,x,,....--.HHH...#
26  #..,,,,.......,,,,,,,,,,,,,,,,,..x.--.HDH...#
27  #...........p......................----.....#
28  #....t..................,,,,................T
29  #...o.....,,,,..........,,,,............x%..#
30  #.........,.,,.................o.....,,,....#
31  #.....p..............................,,,.I..#
32  #..C........................................#
33  #######..............................########
34  ########T#######T#####T####T#####T###T#######
```

**Reading the composition:**
- **Path language:** main road enters the west gate 4 tiles wide (LAW-28 widening), scallops in 4–5-tile segments (y15–18 → y15–17 → y14–16), crosses the plaza and terminates at the warehouse door (LAW-4). North road is a 2-wide lane with two elbows (x19→x21→x20) so no straight run exceeds ~8 (LAW-2). NW lane descends in three scalloped steps from the house cluster into the plaza's NW corner; SE lane drops from the warehouse forecourt and dies at the two house doors. Side paths never out-width the road they leave (LAW-1). The plaza is the zone's ONE crossroads (LAW-3), with 5 mouths at unequal offsets (W road, E road, N road, NW lane, S souk mouth — LAW-27).
- **Entrance framing:** west gate ★ = palm+lantern symmetric pairs at (2,13/14) and (2,20/21); a decision point (the caravan-yard junction / plaza approach) lands within 10 tiles. North gate stays a plain cut with the LAW-42 palm+jar cluster at (17,2)/(17,3).
- **Focal hierarchy:** primary = fountain (22,14), animated water, off-centre 1 tile, earning 2 gathering spots (basin lip + NE-mouth papyrus stand) with the two shop NPCs framing its west/east road mouths (only 3 contract NPCs exist zone-wide, so the plaza's people-density comes from its shop-street flanks); secondary per district = warehouse facade + obelisk pair (east axis end), stall block bunting poles (souk), camel caravan vignette (west gate). Landmark visibility: from spawn (4,17) the fountain plaza sits dead ahead on the walk-in road axis (LAW-25).
- **Diagonal (LAW-30):** NW residential (top-left) → fountain plaza (centre) → SE homes/warehouse corner (bottom-right); gate–plaza–north-gate sweep the opposite diagonal.
- **Water:** the fountain is the zone's single water feature (LAW-19 dry-plaza rule — fountain in the main open space, off-centre, not against a wall). The only `g` grass sits beside it ("grass exists only near water").
- **Story vignettes (LAW-34):** (a) caravan just arrived inside the west gate — 2 kneeling camels + rug + trader-camp strip + pot, x4–8 y20–22, beside not on the road; (b) warehouse forecourt cargo — barrel+crate stack (39,17–18) waiting on a rug-fronted locked door.
- **Quiet corner (LAW-31):** SW x1–9 y27–33 — dead tree, jar cluster, one palm, the corner chest. No buildings, no NPCs.
- **Vista (LAW-46):** east wall dips to waist-height fencewall at x44 y19–21 (`v`) with a bench-and-jar rest spot (42,20) — the player looks out over open dunes toward the steppe.

## 4. Districts

| District | Tile rect (x,y → x,y) | Purpose |
|---|---|---|
| West Gate & Caravan Yard | (1,13)→(13,23) | Dressed main entrance ★, spawn, caravan-arrival vignette, silk/wool gathering |
| NW Residential | (2,2)→(13,12) | 3 filler adobe homes (H1–H3) on a scalloped lane — people live above the souk's noise |
| North Road | (17,1)→(23,11) | Farm-traffic lane, guard post, main sign, palm+jar exit cluster |
| Fountain Plaza | (19,12)→(26,18) | 8×7 paved heart; fountain focal; money-changer + letter-writer edges |
| Shop Street | (9,10)→(33,16) | Spice shop (W) and textile shop (E) flanking the plaza with rug-fronted doors on the main road |
| Souk (stall block) | (14,19)→(30,26) | Bounded LAW-37 stall grid: 4 stalls, 2×2, trampled floor, bunting mouths, goods flanks |
| Warehouse Corner | (34,13)→(43,18) + NE yard (34,2)→(43,12) | Oversized landmark (LAW-12) at the road's axis end; locked door; cargo forecourt; hidden chest + gold seam behind |
| SE Lane & Homes | (31,19)→(41,28) | 2 filler homes (H4–H5) off a lane that drains to the forecourt; cotton/copper gathering |
| Quiet Corner (SW) | (1,27)→(9,33) | LAW-31 quiet corner; corner chest payoff |

Filler building keys (decorative, replaceable): H1 `desert-house-1.2` (5,5–7 area), H2 `desert-house-2.3` (9,3), H3 `desert-house-1.4` (5,10), H4 `desert-house-1.1` (31,21), H5 `desert-house-1.3` (38,24); spice shop `desert-house-3.1` (wide, awning read), textile shop `desert-house-2.1` (tall), warehouse `desert-house-4.2` (largest mass) + obelisk pair + `banners-anim` on the facade. 8 buildings + 4 stalls — inside the LAW-11 budget (6–9 mid-town, large-zone max 14).

## 5. Contract placement table

Every contract ID for desert_marketplace (contract-and-pipeline.md §1), placed exactly once. `spawnPoint: (4,17)` on the road inside the west gate.

**Exits (2) — match world-connection-map ledger edges/fractions:**

| Exit id | Edge | tileRange | Fraction (ledger) | Target |
|---|---|---|---|---|
| `market-to-library` | west ★ | y[16,18] | 17/35 ≈ 0.49 (0.50 ✓) | ancient_library / `from_marketplace` |
| `market-to-farmland` | north | x[19,21] | 20/45 ≈ 0.44 (0.45 ✓) | farmland / `from_marketplace` |

**Entries (keys preserved):** `from_library` → (2,17) (1–2 tiles inside west cut, on road); `from_farmland` → (20,2) (inside north cut, on road).

**NPCs (3):**

| ID | Tile | Rationale (analogous point of interest) |
|---|---|---|
| `spice-seller-layla` | (12,14) | On the rug-fronted awning of her spice shop — Moonlighter's outdoor vendor at the shop door |
| `trader-hassan` | (31,14) | Outside the textile shop on the shop street, mid-haggle by the door rug |
| `guard-hamza` | (23,5) | One tile off the north-road elbow, watching the farm gate — Lalivero's gate watchman |

**Interactables (28):**

| ID | Tile | Rationale |
|---|---|---|
| `sign-market-main` | (21,2) | 1 tile off the north road on the approach side (LAW-7) — greets farm traffic entering the souk |
| `sign-spice-stall` | (9,14) | 1 off the main road at the spice-shop corner, within 2 of its door (LAW-16) |
| `sign-trade-stall` | (32,13) | Against the textile shop's east wall, off the road |
| `bookshelf-market-food` | (9,12) | Recipe ledger against the spice shop's west wall (building set) |
| `bookshelf-market-trade` | (32,12) | Trade ledgers stacked by the textile shop (building set) |
| `bookshelf-market-numbers` | (18,12) | Money-changer's ledger anchoring the plaza NW junction corner (LAW-3 anchor) |
| `chest-market-hidden` | (41,3) | Tucked in the NE wall shadow behind the warehouse — reward for poking off-road |
| `chest-market-corner` | (3,32) | SW quiet-corner payoff, beside the crumbling wall |
| `door-warehouse` [locked: `warehouse_key_obtained`] | (36,16) | Landmark facade door terminating the main-road axis (LAW-4/12); rug + cargo forecourt in front |
| `door-spice-shop` | (11,13) | Spice shop facade, rug at (11,14), road one tile below (LAW-5) |
| `door-textile-shop` | (30,13) | Textile shop facade, rug at (30,14) opening onto the shop street |
| `fountain-market-1` | (22,14) | THE plaza focal — off-centre 1 tile (LAW-27), the zone's single water feature (LAW-19) |
| `stall-market-1` | (17,21) | Souk row 1 west — Slateport stall grid, column W |
| `stall-market-2` | (25,21) | Souk row 1 east — column E, alternate stall variant (LAW-35) |
| `stall-market-3` | (17,24) | Souk row 2 west |
| `stall-market-4` | (25,24) | Souk row 2 east |
| `barrel-market-1` | (15,21) | Goods flank of stall-1 (LAW-37 goods at flanks) |
| `barrel-market-2` | (39,17) | Warehouse forecourt cargo cluster (vignette b) |
| `barrel-market-3` | (12,6) | Hugging H2's east wall — 70% of props hug architecture (LAW-32) |
| `pot-market-1` | (8,20) | Edge of the caravan vignette — unloaded wares |
| `pot-market-2` | (30,22) | Against H4's west wall |
| `crate-market-1` | (39,18) | Stacked with barrel-2 in the forecourt cluster |
| `crate-market-2` | (15,24) | Goods flank of stall-3 |
| `lantern-market-1` | (2,14) | North half of the dressed west-gate framing pair (LAW-28/36) |
| `lantern-market-2` | (2,20) | South half of the framing pair |
| `inscription-marketplace-1` | (39,3) | Caravan tally carved into the old NE wall, beside the hidden chest |
| `inscription-marketplace-2` | (3,5) | Dedication plaque on H1's west wall (residential lore) |
| `inscription-marketplace-3` | (41,31) | Worn boundary stone in the SE sand |

**Gathering spots (9, flag=true):**

| ID | Resource/type | Tile | Rationale |
|---|---|---|---|
| `spot_market_water_01` | olive_oil / water_source | (23,15) | Amphorae at the fountain basin lip — oil sold by the water |
| `spot_market_herbs_01` | cumin / herb_patch | (8,13) | Layla's planters behind the spice shop |
| `spot_market_herbs_02` | cardamom / herb_patch | (28,25) | Split sack at stall-4's goods flank |
| `spot_market_papyrus_01` | papyrus / papyrus_stand | (25,11) | Letter-writer's stand at the plaza's NE mouth |
| `spot_market_ore_01` | gold_ore / ore_vein | (41,7) | Assayer's seam in the NE rock outcrop behind the warehouse |
| `spot_market_ore_02` | copper_ore / ore_vein | (40,29) | Rocks at the SE wall base |
| `spot_market_animal_01` | silk / animal_trace | (4,22) | Bales beside the kneeling caravan camels |
| `spot_market_animal_02` | wool / animal_trace | (13,23) | Hitching rail at the souk's west mouth |
| `spot_market_animal_03` | cotton / animal_trace | (33,26) | Snagged on the H4/H5 yard fence line |

No stepTriggers or subAreas exist in this zone's contract (verified §1) — none invented.

## 6. Enterable interiors

Exactly the contract's 3 doors (contract §8 — market has 3 hand-crafted interiors). Interiors keep their existing hand-crafted layouts in this phase; only the exterior door tiles move (the return point follows the door automatically — no stored coordinates).

| Exterior door | New tile | interiorId (unchanged) | Lock (carried over) |
|---|---|---|---|
| `door-spice-shop` | (11,13) | `spice_shop_interior` (buildShop, 12×10, NPC `spice-merchant-interior`) | — |
| `door-textile-shop` | (30,13) | `textile_shop_interior` (buildShop, 12×10, NPC `textile-merchant-interior`) | — |
| `door-warehouse` | (36,16) | `market_warehouse_interior` (buildLargeHouse, 14×10, no NPC) | locked: `warehouse_key_obtained` |

Filler houses H1–H5 are NOT enterable (decorative doors only) — no zones.js door references procedural `house_<zone>_<n>` ids today, and none are added.

## 7. Asset manifest

Every family below verified against `docs/world-design-research/asset-inventory.md` / kenmiCatalog key formulas:

| Grid element | Kenmi family (verified) |
|---|---|
| Sand `.` `,` | `desert-tiles-desert-beach-tiles-1/2/3` (3 hues for variation patches) |
| Main road `=` | `cobble-road-1/2` (3×5 blob) |
| Lanes `-` | darker-sand hue of `desert-beach-tiles-*` (trampled read, LAW-6) |
| Plaza `P` | `pavement-tiles` (9×8) |
| Wall `#` | `desert-fencewall` (double run for height read — MISSING #11 workaround) |
| Towers `T`, obelisks `!` | `desert-obelisk-small-1/2`, `desert-obelisk-1/2` |
| Houses `H` | `desert-house-1.x` (80×80), `desert-house-2.x` (96×128) — colourway mix |
| Spice/textile/warehouse `X/Y/V` | `desert-house-3.1` / `desert-house-2.1` / `desert-house-4.2` + `banners-anim` facade |
| Stalls `S` | `market-stalls` (48×48 units, alternate variants — MISSING #3 accepted) |
| Rugs `r` | `desert-rugs` (FLAT_GROUND) |
| Fountain `F` | `fountain-anim` |
| Grass tufts `g` | `desert-tiles-desert-grass` (scrub blob) + `flowers` planter accents |
| Palms `p` | `palm-tree-1` (large) / `palm-tree-2` (small), clustered 2–4 (LAW-45) |
| Props `o` | `desert-pots-sacks`, `golden-pots`, `barrels`, `crate-anim`, `hay-bales`, `water-troughs`, `benches`, `cactus`, `desert-bones` (ground decal) |
| Bunting `+` | `pole-and-bunting-1/2-anim` |
| Lanterns `*` | `lantern` / `lanter-posts` (typo'd key used as-is, MISSING #12) |
| Dead tree `t` | `dead-tree`, `dead-bush` |
| Rocks `%` | `desert-rocks` |
| Camels `c` + vignette | `camel-1..3` (explicit zone objects — ambient spawner is OFF) + `desert-trader-camp` (576×64 strip) |
| Chests/signs/bookshelves | `chest-anim`, `signs`, `bookshelves` (as today's interactable sprites) |

**Missing-asset notes (no NEW rows needed — existing rows cover everything):** fabric souk awnings → WORLD-MISSING-ASSETS **#3** workaround applied (wooden `market-stalls` + rugs + bunting + pots as dressing); tall Arabian city wall → **#11** applied (`desert-fencewall` double run + obelisk-tower accents at corners/breaks). Nothing else the sketch needs is absent, so `docs/WORLD-MISSING-ASSETS.md` is unchanged.

## 8. Lint self-check (LINT-1..11)

- **LINT-1 (no overlapping objects):** every non-flat placement occupies a distinct tile in the grid; rugs (`r`) are the only layered element and are FLAT_GROUND (anything may stand on them). Building footprints (H/X/Y/V) contain nothing except their own facade door art.
- **LINT-2 (nothing on water/collision):** the zone has no water tiles (fountain is a prop). No NPC, interactable, or spot sits on a wall, tower, or building-footprint tile — doors sit on the facade tile per today's zones.js convention with walkable fronts.
- **LINT-3 (rugs on plausible ground):** all 8 rugs lie fully on flat walkable ground — trampled souk floor (4), road/stub tiles at shop doors (2), forecourt road (1), caravan-camp sand (1, at (6,21)). None straddle a material seam drawn in the grid.
- **LINT-4 (density/spacing):** (a) no ambient animals (spawner off; camels are 2 explicit objects, ≤4/window). (b) TWO windows sit exactly at the LAW-31 ceiling of 15 non-flat props (counting lanterns, planters, camels, and obelisks — the strictest reading), as the densest-zone brief demands: plaza+souk+west-obelisk (x15–34 y12–26: fountain, 2 planters, 1 palm, 4 stalls, 3 goods, 2 bunting, 1 pot, 1 obelisk) and west-gate/caravan/souk-west (x1–20 y17–31: gate lantern+palm, caravan vignette 2 camels+jar, pot, souk bunting+2 stalls+2 goods, quiet-corner dead tree+jar+palm, 1 palm); no 20×15 window exceeds 15 (verified by sliding-window count over the sketch); route/outskirt windows hold 5–8; quiet corner 3–4. (c) Same-key contract props (barrels ×3, pots ×2, crates ×2) are ≥5 tiles apart except declared clusters (barrel-2+crate-1 forecourt pair). No 3 same-key props in a line. (d) No empty 20×20 window: every open-sand quadrant carries a variation patch, palm, rocks, or bones decal within 8–15 tiles (LAW-33).
- **LINT-5 (reachability):** one connected walkable field — spawn (4,17) reaches: all 8 doors (each with ≥2 clear tiles in front: spice (11,14)+(11,15), textile (30,14)+(30,15), warehouse (36,17)+(36,18), H1 (5,8)+(5,9), H2 (10,7)+(10,8), H3 (6,13)+(6,14), H4 (32,24)+(32,25), H5 (39,27)+(39,28)); both exit ranges; all 3 NPCs; all 9 spots; both entries. No islands — NE yard reaches via open sand y2–9, SE corner via y27–32, souk via 2 mouths.
- **LINT-6 (contract exits):** exit set = {market-to-library, market-to-farmland} exactly; edges west/north match zones.js and the connection map (fractions 0.49/0.44, within ±0.10 of ledger 0.50/0.45, pair-matched to library-E@0.55 and farm-S@0.45); target zones/entries exist; both entry tiles (2,17) and (20,2) are walkable road, outside the other exit's trigger range.
- **LINT-7 (contract completeness):** 3 NPCs + 28 interactables + 9 gathering spots + 2 entries placed exactly once each (tables above; counts cross-checked: signs 3, bookshelves 3, chests 2, doors 3, fountain 1, stalls 4, barrels 3, pots 2, crates 2, lanterns 2, inscriptions 3 = 28). All 3 interiorIds resolve in the INTERIORS registry with `isExit:true` doors (contract §8); all building-set interactables sit within 2 tiles of their building.
- **LINT-8 (dims/template):** 45×35 matches zones.js; Tiled JSON will copy `oasis-village.json` structure (Ground/Collision/Exits, uncompressed, tileset names = catalog keys: `kenmi-desert-tiles-desert-beach-tiles-1`, pavement + cobble tilesets added the same way).
- **LINT-9 (asset legality):** every family in §7 exists in the catalog; no cultural excludes used (no church/pig/halloween/christmas); new crops from multi-item sheets (e.g. trader-camp, pots-sacks items) get `PROP_CROP_REGIONS` entries (data-only).
- **LINT-10 (shoreline/seams):** no water-land seam exists (fountain-only zone — WARN class vacuous); no raw grass touches raw sand (the only `g` tufts are scrub-blob planters on plaza edge, and scrub↔sand blends exist); district ground boundaries (sand↔trampled souk, sand↔plaza paving) step diagonally 1–2 tiles per step in the authored map, per LAW-44 — the souk mouth rows at y19–20 and the plaza's ragged prop-broken edge encode this.
- **LINT-11 (collision coverage — manual):** the Collision layer must paint: full perimeter wall incl. towers and the waist-high vista segment (x44 y19–21 — visually low, still impassable), all 8 building footprints, the 4 stalls, fountain tile, obelisks, palms/dead tree, rock outcrops, and prop-cluster tiles. Verify by in-game walk-through before acceptance; roads, plaza, souk floor, rugs, and all sand stay unpainted.

---

*Build notes for Phase 2: register `map-desert-marketplace`; move every contract coordinate in zones.js to the table in §5; keep `unlock`, `vocabCategories`, `weather: dust`, `battleBg` untouched; regenerate world-snapshot fixtures afterwards (pipeline §6–7 of the bible).*

---

## 9. Review appendix (adversarial design review, 2026-07-03)

**Verdict: FIXED** — composition sound and contract complete; four confirmed violations corrected in place.

**What was checked (scripted, character-by-character against the sketch):**
- **Contract diff (LINT-6/7):** all 42 contract IDs for desert_marketplace placed exactly once — 3 NPCs, 28 interactables (3 signs, 3 bookshelves, 2 chests, 3 doors, 1 fountain, 4 stalls, 3 barrels, 2 pots, 2 crates, 2 lanterns, 3 inscriptions), 9 gathering spots (resources/types match gatheringSpots.js), 2 exits, 2 entry keys, spawnPoint. All 3 interiorIds + `warehouse_key_obtained` lock carried (contract §8). No strays, no invented stepTriggers/subAreas. Exits on the ledger edges: west y[16,18] ≈ 0.49 (ledger 0.50 ★), north x[19,21] ≈ 0.44 (ledger 0.45) — both within ±0.10 and pair-matched.
- **Sketch↔table consistency:** every coordinate in §5/§6 (54 spot-checks incl. rugs, vista, gate pairs, exit-signpost clusters) matches its grid symbol. Grid is exactly 45×35.
- **Reachability (LINT-5):** flood-fill from spawn (4,17) reaches all 8 doors (each with ≥2 clear front tiles), all NPCs, all 9 spots, both exits, both entries. No islands.
- **Laws:** LAW-27 plaza 8×7 with off-centre fountain ✓; LAW-28 dressed west gate with symmetric palm+lantern pair and road widening ✓; LAW-12 warehouse landmark at axis end ✓; LAW-19 fountain placement ✓; LAW-30 diagonal ✓; LAW-42 exit clusters ✓; LAW-46 vista ✓; LAW-16 sign/bookshelf-to-building distances ✓; LAW-11 8 buildings ✓; LAW-33 no empty 20×20 ✓.
- **Assets (6+ families spot-checked against asset-inventory.md):** `desert-house-1/2/3/4.x` sizes ✓, `market-stalls` (192×48 strip, MISSING #3) ✓, `pavement-tiles` (9×8) ✓, `cobble-road-1/2` ✓, `desert-fencewall` (MISSING #11) ✓, `desert-rugs` FLAT_GROUND ✓, `fountain-anim` ✓, `pole-and-bunting-1/2-anim` ✓, `lanter-posts` typo'd key ✓, `camel-1..3` + `desert-trader-camp` (576×64) ✓, `desert-obelisk(-small)-1/2` ✓. No invented keys; no cultural excludes; no new WORLD-MISSING-ASSETS rows needed.

**Confirmed violations → fixed in this doc:**
1. **LAW-31/LINT-4(b) ERROR:** the true densest 20×15 window was the west-gate/caravan/souk-west band (x1–20 y17–31) at **17** non-flat props — over the 15 ceiling — not the souk+plaza window the doc claimed (13–15). Fixed: deleted three decorative (non-contract) jars at (20,27), (11,30), (27,24). Strictest sliding-window max is now exactly 15; LINT-4 text corrected to name both ceiling windows.
2. **LAW-43 ERROR (wall breaks every ≤8):** unbroken `#` runs — east wall y8–18 (11) and y23–34 (12), bottom wall x17–26 (10) and x28–36 (9). Fixed: tower breaks added at (44,13), (44,28), (22,34), (33,34). All perimeter runs now ≤9 (left wall's 9 is within the bible's ±1 tolerance).
3. **LINT-3 text error:** claimed 7 rugs; the grid draws 8 (the caravan-camp rug at (6,21) was uncounted). Corrected.
4. **LAW-26 overclaim:** text said the fountain "earns 2 NPCs" — no contract NPC stands in the plaza (only 3 exist zone-wide, all placed at shops/gate with good rationale). Reworded to the truthful framing (2 gathering spots at the focal; shop NPCs at its road mouths).

**Checked and accepted with justification (no change):**
- **LAW-2 straight runs:** row y16 carries an 18-tile `=` run. Accepted: it is interior fill of a 3–4-wide band whose edges scallop and whose y-extent steps north every 4–5 tiles (y15–18 → y15–17 → y14–16); the west-gate→plaza→warehouse line is the zone's deliberate commercial axis (Slateport/Alhafra precedent), and LAW-2 is screenshot-reviewed, not machine-checked.
- **bookshelf-market-numbers (18,12)** is not within 2 tiles of any building (LINT-7 WARN class): intentional — it anchors the plaza NW junction corner per LAW-3; it is not part of a building set.
- **Spice shop drawn 3×3** vs `desert-house-3.1`'s true 4×3.5 footprint: ASCII approximation; Phase 2 must reserve the full footprint (flagged for the builder).
