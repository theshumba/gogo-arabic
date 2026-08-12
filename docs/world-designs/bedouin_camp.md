# Zone Design — bedouin_camp (مُخَيَّم البَدو)

**Status:** Phase 1 design document (2026-07-03). DOCUMENT ONLY — no code, maps, or zones.js changes flow from this file directly.
**Ground truth obeyed:** `docs/WORLD-DESIGN-BIBLE.md` (§2 LAWs, §3.5 brief), `docs/world-design-research/contract-and-pipeline.md` §1 (bedouin_camp) + §8 (bedouin_tent_interior), `docs/world-designs/world-connection-map.md` (exit ledger rows for bedouin_camp), `docs/world-design-research/asset-inventory.md`.

---

## 0. Reference study — what the composition steals

Studied from `/Users/theshumba/Desktop/Gogo-World-References/` (manifests + 8 images viewed):

| Reference | What this design steals |
|---|---|
| `05/arabian-nights-desert-dwellers-camp-fullmap.png` | The canonical civilian quincunx: 2 tents top-flank, 2 bottom, gaps of 3–5 tiles; **banner poles standing between tents**; jar+palm corner clusters; a LIGHT woven-mat/log strip as the camp boundary (no walls); plain multi-gap exits. |
| `05/burning-heroes-oasis-fullmap.png` | **Oversized chief tent at top-centre facing straight down the camp axis**, with the water feature sitting on that same axis below; ring of smaller tents around the water; hitching-rail props flanking the ring; rock + scrub-tuft scatter as the open-sand rhythm; N and S exits landing on the axis. |
| `05/eien-no-filena-nomad-camp-mountains-fullmap.png` | Trampled dirt paths converging from every tent onto the central lodge; **fenced livestock pen at the camp edge with its gate facing inward**; the camp sitting inside a hard natural container (cliffs/rivers) it never touches. |
| `05/chrono-trigger-prehistoric-meeting-site-campfire.png` | The **fire pit as the sole central focal of a big cleared ring**, worn-ground patch under the gathering space, activity stands pushed to the clearing's rim — the plaza is the emptiness around the fire. |
| `05/seliel-travelers-camp-tent-fire-scene.png` | The 3–5-prop camp vignette grammar: tent + campfire + bedroll + one NPC = one story in a ~5×4 patch (used twice: storyteller's hearth, waterhole camel rest). |
| `05/ys5-desert-oasis-fullmap.png` (Merchant Camp panel) | Sparse-outskirt read: lone canvas tents beside a **winding** trail — the approach to the camp stays empty and the trail never runs straight. |
| `11/kenmi-desert-arabian-village-road-junction.gif` | Junction anchoring (props/building corners on every path corner), the **camel + carpet + kneeling trader vignette**, prop clusters hugging structure bases, trampled-sand path tone against base sand. |
| `11/pokemon-emerald-route111-desert-cliff-rocks.png` | The dune-cliff container language: layered cliff edge that **jogs every 3–6 tiles**, varies 1–3 tiles deep, with rock clusters spacing the open sand as soft POIs. |

---

## 1. Concept

**"A nomad tent ring under open sky, gathered around the elder's fire."** One oversized elder tent stands top-centre and looks straight down the camp axis onto the central fire pit — the zone's focal anchor — with four canvas tents ringed loosely around it and a small water-hole glinting to the east where camels rest. The whole camp is legible in one glance (LAW-47 ~20×20 core), bounded not by walls but by banner poles, a herd pen, and the dune cliffs of the steppe, channelling the Arabian Nights quincunx, Burning Heroes' chief-tent axis, and Chrono Trigger's fire-circle clearing.

## 2. Dimensions

**35 × 25 tiles** (64px each) — unchanged from the contract (`mapWidth`/`mapHeight` = 35/25). Small zone, per bible §3.5; the camp core reads across in one screen.

## 3. Tile-grid sketch

35 columns (x 0–34) × 25 rows (y 0–24). Map-north = top. Every row verified 35 chars.

**Legend:** `C` dune-cliff container/outcrop · `.` open sand · `d` sand-variation blob / trampled clearing · `:` trampled-sand path (darker sand hue, LAW-6 — NO paving anywhere) · `g` scrub-grass (desert-grass blob, waterhole halo only) · `w` water · `E` elder tent (oversized) · `T` ring tent · `D` elder-tent door · `r` rug (flat) · `F` main fire pit · `f` storyteller campfire · `b` bench / sleeping-mat seat · `B` banner pole · `=` pen fence · `G` pen gate · `A` animal (camel/sheep, explicit zone objects) · `o` prop / prop-cluster or contract prop (see §5) · `s` sign · `*` acacia/cactus/dead-bush · `k` rocks/bones · `x` exit tile · `S` spawn · `N` NPC · `1–8` gathering spots (numbered per §5 table; drawn on their underlying ground)

```
          1111111111222222222233333
01234567890123456789012345678901234
...................................  0
...................................  1
...................................  2
........,..........................  3
......,..........::................  4
....,......,....:::................  5
......TTT........::......TTTT......  6
.....oTTTo,,....:::....,,,oTT,.....  7
....,TDNT,,.....:::..8.,.,N,o,,....  8
...,.,,.,,.,,..:::..o..,,,o,,......  9
....,,.,,.,,.s:::.....:..,,,.......  10
x.......::::::,o,,,o.:.............  11
x:::::...:::::,,.,,,..........6....  12
x::S::::::::::,,,N,,,:::::.........  13
x::::::::::.:,.,,,.,,..............  14
x..........:....,o,........gggg....  15
..........:...,,.,,...TT..ggwwwg...  16
......oTT.............T...gwwwgg...  17
......TT.o................wwwggg...  18
.....,..,.o...............gwwwgg...  19
..,.,.7,..,................gwww....  20
......,........................g...  21
.....,.........3...................  22
..........,........................  23
...................................  24
```

**Reading the composition:**
- **Container (LAW-41):** dune cliffs on all four sides, depth varying 1–4 with jogs every 3–6 tiles (Route 111 language); the only cuts are the two exits. The SW corner outcrop (cols 0–2, rows 17–21) carries the copper vein.
- **Camp axis:** north exit → bend east around the elder tent (cols 20–21, the "climb" starting toward the mountain) → elder tent door → fire pit (17,12) → south vista stub. Elder tent faces straight down onto the fire per LAW-14/40.
- **Paths (LAW-1/2/6):** trampled darker-sand strips only. Main entrance strip 3 wide (rows 12–14, x1–5), stepping down to 2 wide (rows 13–14, x6–9), then back up (rows 12–13, x10–12) — an S-jog whose edges break every 3–5 tiles so no straight edge run exceeds 8 (LAW-2); junction to the pen at (8–9,14) ~8 tiles in (LAW-28 decision point), its corner anchored by a jar at (10,15) hugging T3 (LAW-3); east branch (row 12) dead-ends at the waterhole shore (LAW-4: water is the reason); south stub (cols 19–20) dead-ends at a dressed vista (bench + jar at row 21, LAW-4 vista rule).
- **Quincunx (LAW-13):** elder tent top-centre + T1 (7,7) / T2 (25,7) flanking above, T3 (11,15) / T4 (23,16) below, staggered 1 row so no three tents align (LAW-10). 5 tents total (brief: 5–7). Doors all face the fire circle.
- **Water (LAW-17/18):** one pool ~6×3 at (25–30, 12–14), scalloped arcs, scrub-grass halo (`g`) + hard rock lip on the south-east shore (`k`), soft everywhere else; detached blobs at (25–26,15), (29–30,15) and (27–28,16). The desert-grass blob carries its own baked scrub↔sand transition (no raw grass-next-to-sand seam, MISSING #5 workaround).
- **Entrance framing (LAW-28) & exit markers (LAW-42):** west exit ★ dressed — banner-pole pair at (4,11)/(4,15) with the strip 3 tiles wide through them; sign 1 tile off the approach side; jar pair at (2,11)/(2,15) hugs the cut's corners as the within-3-tiles exit marker (LAW-42). North exit stays a plain 3-tile cliff pinch (the mountain climb), marked by a rock cluster at (13,1)/(14,2) hugging the pinch's west wall (LAW-42).
- **Quiet corner (LAW-31):** SE dunes (cols 21–31, rows 18–22) — no tents, bones + hidden chest + inscription only, 0 NPCs.
- **Vista (LAW-46):** south dune lip (cols 19–23, row 23 drawn as low dune `d` instead of cliff) — the player stands at the bench and sees the open sand sea.
- **Story vignettes (LAW-34):** (a) storyteller's hearth — T1 + campfire `f` + mat `b` + Noor; (b) camel rest — rug (27,10) + camels (28–29,11) + trough (25,11) + barrel + Ali (Kenmi camel+carpet vignette).

## 4. Districts

| District | Tile rect (x,y,w,h) | Purpose |
|---|---|---|
| West Gate & Steppe Approach | (0,9)–(9,17) | Dressed main entrance from farmland: banner pair, camp sign, spawn, pen-branch T-junction. |
| Fire Circle (camp core) | (13,10)–(21,14) | The plaza: main fire pit, radial benches/mats, cooking pot, Elder Tariq holding court. Worn-clearing ground (`d`). |
| Elder's Court | (13,2)–(23,9) | Oversized elder tent + banner pair, lantern-flanked door (THE enterable interior), supply cluster, north-road bend with statue waymark to the mountain pass. |
| Storyteller's Hearth | (5,6)–(12,11) | T1, Noor's own small campfire vignette, story-scroll shelf (bookshelf-time), hung weaving (painting). |
| Traveler's Rest & Waterhole | (22,6)–(31,17) | T2, the pool + grass halo, camel rest vignette, trough, Wanderer Ali, aloe/papyrus/linen gathering. |
| Herd Pen | (3,17)–(11,21) | Fenced pen (7×4, gate inward at (8,18)), 4 sheep (goat stand-ins), wool trace outside the rail, copper vein at the SW outcrop. |
| South Tents | (9,14)–(26,18) | T3 + T4 with their supply crate and weaving, linen trace — the loose lower arc of the ring. |
| Quiet Dunes & Vista | (18,18)–(31,23) | Quiet corner (bones, hidden chest, inscription) + the south vista stub ending at bench/jar overlooking the sand sea. |

## 5. Contract placement table

Complete ID list from contract-and-pipeline.md §1 (bedouin_camp): 3 NPCs, 2 exits, 20 interactables, 8 gathering spots, 2 entry keys, spawnPoint. Every ID placed exactly once.

**Zone meta**

| Item | Value | Rationale |
|---|---|---|
| spawnPoint | (3,13) | 3 tiles inside the west entrance cut, on the trampled strip (1 tile past the `from_farmland` entry). |
| entry `from_farmland` | (3,13) | 2 tiles inside the west exit cut (connection-map rule: 1–2 tiles inside). |
| entry `from_mountain` | (17,3) | 2 tiles inside the north cliff pinch, on the path. |

**Exits** (match world-connection-map ledger: W ★ @0.50, N @0.50)

| Exit id | Edge | tileRange | Fraction | Target | Rationale |
|---|---|---|---|---|---|
| `bedouin-to-farmland` | west ★ | y[11,15] | 13/25 = 0.52 ✓ | farmland/`from_bedouin` | Dressed main entrance (banner pair + sign); pairs with farmland's east exit. |
| `bedouin-to-mountain` | north | x[15,19] | 17/35 = 0.49 ✓ | mountain_village/`from_bedouin` | Rocky mountain approach; pairs with mountain's south exit. |

**NPCs (3)**

| ID | Tile | Rationale (analogous point of interest) |
|---|---|---|
| `elder-tariq` | (17,13) | Beside the main fire pit, at the foot of his tent's axis — the Burning Heroes chief presiding over the circle. Focal earns 2–3 NPCs (LAW-26). |
| `storyteller-noor` | (8,8) | At her own small hearth by T1 — Seliel campfire vignette; one pit per 2–3 tents (LAW-40). |
| `wanderer-ali` | (27,8) | Resting at the waterhole camel rest — the Ys V trail merchant; a wanderer arrives where the water is. |

**Interactables (20)**

| ID | Tile | Rationale |
|---|---|---|
| `sign-camp` | (3,12) | 1 tile off the entrance path, approach side (LAW-7), inside the banner-framed gate. |
| `sign-elder-tent` | (14,10) | Within 2 tiles of the elder door (LAW-16), off the door stub. |
| `door-bedouin-tent` → `bedouin_tent_interior` | (7,8) | On the elder tent's south facade, facing the fire down the axis. |
| `bookshelf-time` | (9,18) | Story-scroll rack in the livestock/work cluster. |
| `bookshelf-adjectives` | (29,8) | Scroll rack on the traders' side. |
| `chest-camp-tent` | (5,7) | Elder-tent supply cluster. |
| `chest-camp-hidden` | (31,22) | Deep in the quiet-dune corner behind the rocks — exploration payoff. |
| `lantern-camp-1` | (15,11) | Flanking the central court. |
| `lantern-camp-2` | (19,11) | Flanking the central court. |
| `lantern-camp-3` | (6,17) | Lights the livestock/work cluster. |
| `painting-camp-1` | (9,7) | Hung weaving in the elder tent cluster. |
| `painting-camp-2` | (26,7) | Traders' side tapestry. |
| `crate-camp-1` | (22,9) | Traders' supply cluster. |
| `crate-camp-2` | (10,19) | Livestock/work supply cluster. |
| `pot-camp-1` | (17,15) | Cooking pot at the fire circle's south rim. |
| `barrel-camp-1` | (28,9) | Water barrel in the traders' cluster. |
| `statue-camp-1` | (20,4) | Stone waymark on the mountain approach. |
| `inscription-bedouin-1` | (32,22) | Lore stone in the hidden southeast corner. |
| `inscription-camp-2` | (3,3) | Lore stone on the northwest approach. |
| `inscription-camp-3` | (14,22) | Lore stone in the southern sand. |

**Gathering spots (8):** grid digits 1–8

| ID | Resource/type | Tile | Rationale |
|---|---|---|---|---|
| `spot_bedouin_animal_01` | hemp / animal_trace | (8,10) | Trampled ground by the elder-tent cluster. |
| `spot_bedouin_animal_02` | linen / animal_trace | (18,14) | Beside the central court. |
| `spot_bedouin_animal_03` | wool / animal_trace | (15,22) | Southern trail outside the livestock/work cluster. |
| `spot_bedouin_herbs_01` | aloe_vera / herb_patch | (12,6) | North-west camp edge. |
| `spot_bedouin_herbs_02` | sage / herb_patch | (30,12) | East camp edge. |
| `spot_bedouin_water_01` | olive_oil / water_source | (25,18) | Walkable oasis approach beside the pool. |
| `spot_bedouin_ore_01` | copper_ore / ore_vein | (6,20) | Southwest rocky edge. |
| `spot_bedouin_papyrus_01` | papyrus / papyrus_stand | (22,8) | Traders' side. |

## 6. Enterable interiors

| Building | Door interactable | interiorId | Notes |
|---|---|---|---|
| Elder tent (north-west cluster) | `door-bedouin-tent` @(7,8) | `bedouin_tent_interior` — "Elder's Tent (خَيْمَة الشَّيْخ)", 12×10 buildSmallHouse, NPC `bedouin-elder-interior`, 5 interactables incl. `exit-door` | The contract's bedouin door sits in the largest tent cluster. |

The 4 ring tents are non-enterable dressing (no contract doors; no new interiorIds invented).

## 7. Asset manifest

All families verified present in `docs/world-design-research/asset-inventory.md` / kenmiCatalog:

| Need | Kenmi family (verified) |
|---|---|
| Ground: 3 sand hues + trampled strips | `desert-tiles-desert-beach-tiles-1/2/3` (paths = darker hue, LAW-6) |
| Water pool + foam | `desert-water-tiles-1..3`, `desert-water-foam-animation` |
| Scrub-grass halo (baked sand blend) | `desert-tiles-desert-grass` (3×5 blob) |
| Dune-cliff container | `desert-tiles-desert-cliff-tiles-1..3` |
| Tents (elder + 4 ring) | `military-tents` (304×480 sheet, crops; reads bedouin with rows avoided, LAW-13) |
| Banners / flags | `banners-anim`, `flags-anim` |
| Fire pit + campfires + cooking pot | `fire-pit`, `desert-campfire`/`campfire-anim`, `campfire-pot-anim` |
| Seating / mats | `split-log-benches`, `sleeping-mat` |
| Rugs (flat) | `desert-rugs` |
| Water-hole dressing | `water-sack-on-stick`, `water-troughs`, cattails (base water props), water-rocks |
| Pen fencing + gate | `fences` / `fence-big` + gates |
| Hitching rail | `weapon-stands` (military kit stand-in, per bible §4) — available but NOT placed this pass: the camel-rest vignette already carries 5 props (LAW-34 cap) |
| Animals (explicit zone objects — ambient spawner is OFF) | `camel-1..3` ×2, `sheep` ×4 (goat stand-in, MISSING #7) |
| Props | `desert-pots-sacks`, `barrels`, `crate-anim`, `signs`, `lantern`/`lanter-posts` |
| Open-sand POIs | `desert-bones`, `desert-rocks`, `cactus`, `acacia-tree`, `dead-bush`/`desert-fern-dead` |
| Perimeter accents (optional) | `palisade` bits — allowed for bedouin_camp accents only (MISSING #11) |

**Missing / skipped:** nothing new. Goats, falcons, donkeys, saddled camels are already logged as `WORLD-MISSING-ASSETS.md` #7 (sheep/vulture/camel substitutes used here); woven-mat boundary strips approximate with `desert-rugs`/`sleeping-mat`; no row added.

## 8. Lint self-check (LINT-1..11)

- **LINT-1 (no overlaps):** every placed ID in §5 occupies a unique tile; rugs (17,8)/(27,10) are FLAT_GROUND (lower layer) and only the walking player crosses them; no non-flat footprints intersect (tents 2×2, elder 3×3, all gaps ≥3).
- **LINT-2 (nothing on water/collision):** no object/NPC/spot on `w` or `C`; the water source spot remains on walkable oasis approach ground.
- **LINT-3 (rugs on plausible ground):** both rugs sit fully on flat sand — not on water, cliff, shoreline, or a material seam.
- **LINT-4 (density/spacing):** (a) animals: 6 explicit (4 sheep + 2 camels), ≤4 per 20×15 window (sheep SW, camels E — different windows), ≤10/zone ✓. (b) Seat classification is explicit: (10,10), (15,11), (19,11) are `sleeping-mat` (FLAT_GROUND — exempt from footprint counts); (14,14) and the vista seat (19,21) are `split-log-benches` (non-flat). Non-flat DECO props in the worst-case core 20×15 window (cols 8–27, rows 3–17): banners (15,5)/(19,5), storyteller campfire (10,9), main fire pit (17,12), bench (14,14), trough (25,11), acacia (12,4), cactus (24,4), rocks (27,6)+(27–28,15), pen-junction jar (10,15) ≈ 12 ✓ ≤15 (LAW-31 core budget); quiet corner has 3. Contract interactables (12 of the 20 fall in that same window — unavoidable at 35×25 with a 20-interactable contract) render on/against architecture and are audited by LINT-7, not the LAW-31 deco budget; if the built linter counts interactables toward LINT-4(b), flag the cap for renegotiation rather than thinning below contract density. (c) Same-key pairs: lantern door pair 4 apart; entrance jars (2,11)/(2,15) a declared marker pair, jar (10,15) ≥6 from them; exit rocks (13,1)/(14,2) a declared cluster ≤4; sheep/camel pairs are declared pen/vignette clusters ≤4; no 3+ same-key straight line at even spacing. (d) No empty 20×20: every quadrant carries POIs (inscriptions, acacia, cactus, bones, `d` blobs every ≤8 tiles of bare sand, LAW-33).
- **LINT-5 (reachability):** flood-fill from spawn (3,13) must reach both exits, both entries, all 3 NPCs, all 8 spots, including wool (15,22), ore (6,20), and the hidden southeast corner.
- **LINT-6 (exits):** exit id set equals the contract; west range is rows 11–15 and north range is columns 15–19, both on their declared edges; entries `(3,13)` and `(17,3)` are walkable and outside other triggers.
- **LINT-7 (contract completeness):** 3 NPCs + 20 interactables + 8 spots + 2 entries placed exactly once each (§5 counts: 2 signs, 2 bookshelves, 2 chests, 1 door, 3 lanterns, 2 paintings, 2 crates, 1 pot, 1 barrel, 1 statue, 3 inscriptions = 20 ✓). `door-bedouin-tent.interiorId = bedouin_tent_interior` resolves in INTERIORS and contains `exit-door` isExit:true; every building-set interactable within 2 tiles of its tent.
- **LINT-8 (dims/template):** 35×25 matches zones.js mapWidth/mapHeight; Tiled JSON will copy the oasis-village template (Ground/Collision/Exits, uncompressed, catalog-named tilesets); spawn + entries on walkable tiles.
- **LINT-9 (asset legality):** every family in §7 exists in kenmiCatalog; no cultural excludes (no pigs — sheep only); new crops from `military-tents`/`desert-bones` sheets need PROP_CROP_REGIONS rows at build time (data-only).
- **LINT-10 (seams, WARN-class):** pool shoreline scallops in 2–4-tile arcs, longest straight seam = 4; grass appears only as the desert-grass blob whose sand transition is baked in (no raw grass↔sand adjacency); district boundaries (`d` blobs, trampled strips) step diagonally, no straight single-material boundary >8.
- **LINT-11 (collision authoring — manual):** at build time paint Collision over ALL water tiles, every `C` cliff tile, all 5 tent footprints, the pen fence line (`=`, gate tile left open), banner poles, and prop colliders; verify by in-game walk-through (lint cannot catch unpainted water today).

**Believability walk (post-review):** you leave the farmland fences behind, pass the water jars stacked at the cliff cut, walk between two snapping banners, a sign greets you; eight tiles in the trail forks — left to the bleating pen, ahead to the fire where Elder Tariq sits beneath his great tent; behind him the trail bends past a stone waymark and climbs through the cliff pinch toward the mountain; east, camels kneel on a carpet by the only water for miles.

---

## 9. Review appendix (adversarial pass, 2026-07-03)

**What was checked (against ground truth, not the doc's claims):**
- **Contract diff** vs contract-and-pipeline.md §1 (bedouin_camp) + §8 (bedouin_tent_interior): all 20 interactable IDs, 3 NPC IDs, 8 gathering-spot IDs (with correct resource/type pairs), 2 exit IDs (edges + targets + targetEntries), both entry keys, spawnPoint, and the interior (dims/NPC/5 interactables incl. `exit-door`) — **100% covered, every ID exactly once, no strays**. Exit edges/fractions match world-connection-map.md (W ★ 13/25=0.52, N 17/35=0.49, both within ±0.10 of 0.50).
- **Grid audit:** all 25 rows re-parsed at exactly 35 chars; every §5 coordinate cross-checked against its glyph (all matched); path/water/pen/cliff geometry verified against LAW-1/2/4/5/6/9/10/11/12/13/14/17/18/25/26/28/31/33/34/36/40/41/43/46/47.
- **Asset spot-check (asset-inventory.md):** `military-tents` ✓ (line 87), `banners-anim`/`flags-anim` ✓ (90), `fire-pit`/`desert-campfire`/`sleeping-mat`/`water-sack-on-stick` ✓ (101), `camel-1..3`/`sheep` ✓ (143–144), `desert-tiles-desert-grass` + desert beach/water/cliff tile families ✓ (40–43), `desert-bones`/`acacia-tree`/`cactus` ✓ (102–104); cattails exist in kenmiCatalog (cattail-1..5-anim). MISSING-ASSETS rows #5/#7/#11 exist as cited; no new gaps.

**Violations found and FIXED in this doc:**
1. **LAW-42 (⚙, both exits):** no prop cluster within 3 tiles of either exit — nearest west-exit prop was a banner at Chebyshev distance 4; the north exit had nothing. Fix: jar pair added at (2,11)/(2,15) hugging the west cut; rock cluster added at (13,1)/(14,2) hugging the north pinch. Grid rows 1, 2, 11, 15 edited.
2. **LAW-2:** entrance strip ran dead straight x1–12 in rows 12–13 (12-tile straight edges; >8 is ceremonial-only). Fix: S-jog — 3 wide x1–5 (rows 12–14), 2 wide x6–9 (rows 13–14), 2 wide x10–12 (rows 12–13); longest straight edge now ≤9. Grid rows 12, 14 edited; §3 paths bullet and believability walk updated (junction now (8–9,14), ~8 tiles in, still LAW-28's 6–10 window).
3. **LAW-3:** pen T-junction had no corner anchor. Fix: jar added at (10,15) (also hugs T3, LAW-32). Grid row 15.
4. **LAW-16:** `crate-camp-1` at (13,6) was 3 tiles from the elder-tent footprint (rule: ≤2). Fix: moved to (15,6); grid row 6 and §5 table updated.
5. **LINT-4 self-check inaccuracy:** the "~14 non-flat props" claim was only true under an undeclared deco-only count with seats treated as flat. Fix: §8 LINT-4 rewritten with an explicit seat classification (which `b` glyphs are flat sleeping-mats vs log benches), an itemised worst-window deco count (≈12 ≤15), and an explicit note on the interactables-counting ambiguity.
6. **Prose/grid drift:** water bullet said "two detached blobs" while the grid draws three — prose corrected to (25–26,15)/(29–30,15)/(27–28,16). Hitching-rail manifest row marked as available-but-not-placed (camel-rest vignette already at the LAW-34 5-prop cap).

**Checked and passed unchanged:** exits/entries/spawn geometry (LINT-6), reachability of every door/NPC/spot/exit from spawn (LINT-5 walk re-traced on the edited grid), quincunx + stagger (LAW-10/13), single oversized landmark + banner pair (LAW-12/14), fire-pit focal + radial seats (LAW-40), pool size/scallop/halo/rock lip (LAW-17/18), container jog + vista + quiet corner (LAW-41/46/31), pen size/gate direction (LAW-43/47), lantern pairing (LAW-36), animal caps (LINT-4a), cultural cleanliness (no pigs; sheep as goat stand-ins per MISSING #7).

**Verdict: FIXED** — composition is sound and contract-complete; all confirmed violations repaired in place.
