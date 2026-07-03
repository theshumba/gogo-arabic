# Zone Design — farmland (الأَرض الزِّراعِيَّة)

**Phase 1 design document (2026-07-03). DOCUMENT ONLY — no code, maps, or zones.js changes.**
Obeys: `docs/WORLD-DESIGN-BIBLE.md` (LAW-1..51, §3.4 brief), `docs/world-design-research/contract-and-pipeline.md` §1 (farmland contract) + §8 (interiors), `docs/world-designs/world-connection-map.md` (exit ledger), `docs/world-design-research/asset-inventory.md` (assets), `docs/WORLD-MISSING-ASSETS.md` (gaps #5, #7, #8, #15, #16).

---

## 0. Reference study — what the composition steals

Studied from `/Users/theshumba/Desktop/Gogo-World-References/` (8 images looked at directly):

| Reference | What this design steals |
|---|---|
| `09/harvestmoon-snes-farm-spring-fullmap.png` | House + barn + **silo touching** as one top-left cluster inside a fenced work-yard; the rest of the map is one big open field punctuated by lone trees/troughs. My homestead row + open crop land follows this split. |
| `09/harvestmoon-mfomt-farm-spring-fullmap.png` | **Building row along the top fence** (stable/silo/barn/huts in a staggered line), one huge field below, pond off to the side, river + bridge on the south edge. This is LAW-15 drawn perfectly — my top-edge homestead row and south exit road copy it. |
| `09/harvestmoon-gb-ranch-fullmap.png` | Hard perimeter fence/container with corner breaks; twin silos as the vertical landmark; small water troughs inset INTO the fence line; grass tufts + stumps as points of interest across open ground (LAW-33 rhythm). |
| `09/roots-of-pacha-crops-irrigation-channels.jpg` | **Irrigation channels running along plot edges** with wheel/sluice anchors at the corners, and a paved central plaza where the paths meet, ringed by crops. My falaj network + farm plaza are lifted straight from this. |
| `09/sun-haven-farm-barn-pens-windmill-crops.jpg` | Barn with hay-filled **animal pen directly adjacent**; windmill as a second vertical accent; fenced crop rows kept separate from the pen; water on the map edge doing the container work. |
| `09/fields-of-mistria-farmyard-house-well-croprows.jpg` | Farmhouse door opening onto a short stub with loose chickens/cows wandering the yard **between** house and fenced plots — the lived-in gap my yard road reproduces. |
| `11/goldensun-xian-bridge-fenced-field-paths.png` | A fenced crop field sitting OFF the path fork (never on the thoroughfare), junctions anchored by building corners, and a small bridge as a mini-focal on the main walk. |
| `11/kenmi-desert-oasis-waterfall-palm-edges.gif` | The exact Kenmi grammar for water in sand: **cliff waterfall feeding a pool**, scalloped grass halo ringing the water, palm clusters of 2–4 on the grass, scrub tufts mediating every grass↔sand seam. My wadi + pond corner is this scene. |

---

## 1. Concept

Farmland is **green fields wrested from the desert by wadi water** — a seasonal stream falls off the northern cliffs into a pond, and from that pond hand-dug falaj channels walk the water west along the plot edges, so every green tile is visibly *earned*. The zone's focal anchor is the **homestead row on the top edge** (farmhouse, barn + silo touching, turning windmill, coop — the HM-MFOMT building line under the cliffs), with the **waterfall-fed pond and falaj head** as the secondary signature in the north-east. It channels Harvest Moon's top-edge farm row, Roots of Pacha's edge-running channels and plaza, and Kenmi's own cliff-waterfall-oasis scene; one sentence: *"a wadi farm — one barn row under the cliffs, and every channel leads back to the water."*

## 2. Dimensions

**45 × 35 tiles** (64px each) — unchanged from the contract (`mapWidth/mapHeight` 45×35), the bible's large-zone size for the world's most gathering-dense zone. Map-north = cliff/highlands, per the connection map (wadi runs down off the highlands to the NE).

## 3. Tile-grid sketch

Legend: `C` cliff (container) · `W` waterfall face · `w` water (wadi/pond/basin) · `c` falaj channel (1-tile) · `b` plank bridge · `T` palm belt (container) · `s` sand · `,` scrub-grass (sand↔grass transition band) · `g` grass · `F` crop soil (fenced plots / herb beds) · `O` orchard soil (date palms + vine bower) · `f` fence · `.` path (trampled dirt) · `P` plaza (packed farmland-dry ground) · `B` building footprint · `D` door tile (`door-barn`) · `#` rock outcrop

```
012345678901234567890123456789012345678901234
CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCWWCCCCCCC  y0   cliff container; waterfall x36-37
CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCWWCCCCCCC  y1
CCCsssssssCCCCCCCCCCCCCCCsssssssssssww,,,CCCC  y2   cliff jogs; wadi emerges
TTssssssss,,ssssssssssssssss,,sssssswwsss,,CC  y3   sand strip under cliff
TTssssssssBBBBsssssssssssssssssssssswwsssssCC  y4   barn starts (x10-13)
TTTsBBBBssBBBBBssBBBBsssssssssssssswwss##sCCC  y5   farmhouse | barn+silo | windmill; wadi jogs W; belt+cliff deepen
TTTsBBBBssBBBBBssBBBBssBBBBsssssssswwss##sCCC  y6   + coop (x23-26); outcrop
TTTsBBBBssBBBBBssBBBBssBBBBsssssssswwsssssCCC  y7
TTTsBBBBsssssssssBBBBsssssssssssssswwsssssCCC  y8   facade/prop line
TTs...D.....................ssssgggwwwwggssCC  y9   yard road; door-barn (6,9); pond top
TTs.............................ggwwwwwwgssCC  y10  yard road → garden path → fountain (32,10)
TTsssssssfff.ffffgg..ggggggggggggwwwwwwwwssCC  y11  pen ring (gate x12); pond widest
TTsssssssfggggggfccbbccccccccccccwwwwwwwwssCC  y12  falaj main leg; bridge (19-20,12)
TTsssssssfggggggfcg..ggggggggggggwwwwwwwwsCCC  y13  E cliff jogs deeper (x42, y13-15)
TTs,,ssssfggggggfcg..ffffffffffgggwwwwwwgsCCC  y14  plot B top fence
TTsssssssffffffffc..gfFFFFFFFFfggggwwwwggsCCC  y15  pen bottom; plot B crops; path jogs
TTsssssss,,,,,,,,c..gfFFFFFFFFfgggggcggggssss  y16  scrub belt; branch channel x36; E cut floor
TTssffffffffffgggc..g.FFFFFFFFfgFFFFcgggg....  y17  plot A top; B gate (21,17); herb beds; E exit
TTssfFFFFFFFFfgggc..gfFFFFFFFFfgFFFFcggg..,ss  y18
TTssfFFFFFFFFfgggc..gfFFFFFFFFfgggggcgg..,,CC  y19
TTssfFFFFFFFF.gggcg..ffffffffffgggggcg..,g,CC  y20  plot A gate (13,20); plot B bottom
TTssfFFFFFFFFfgggcg..ggggggg........b..,g,gCC  y21  east road; plank bridge (36,21-22)
TTssfFFFFFFFFfgggcg..ggg............bgggg,,CC  y22
TTTsffffffffffgggcPPPPPPPgggggggggggcgg,,sCCC  y23  plot A bottom; plaza top; branch ends; belt+cliff deepen
TTTsgggggggggggggcPPPPPPPggfff.ffffffgg,,sCCC  y24  orchard top fence + gate (30,24)
TTTsggggggggggggwwPPPPPPPggfOOOOOOOOfgg,,sCCC  y25  falaj basin (16-17,25-26); orchard
TTTsffffffffffggwwPPPPPPPggfOOOOOOOOfgg,,sCCC  y26  plot C top fence
TTssfFFFFFFFFfggggPPPPPPPggfOOOOOOOOfgg,,ssCC  y27  plaza bottom
TTssfFFFFFFFFfsssss...sssssfOOOOOOOOfgg,,ssCC  y28  south road; beehives (37-38)
TTssfFFFFFFFF.sssss...sssssfOOOOOOOOfgg,,ssCC  y29  plot C gate (13,29)
TTssfFFFFFFFFfsssss...sssssfOOOOOOOOf,,ssssCC  y30
TTssfFFFFFFFFfsssss...sssssffffffffff,,sssCCC  y31  orchard bottom fence; E cliff jogs deeper
TTssffffffffffssss....sssssTTTssssssTTTsssCCC  y32  plot C bottom; road widens (x18-21); S belt palm bumps
TTTTTTTTTTTTTTTTTTT...TTTTTTTTTTTTTTTTTTTTTTT  y33  south palm belt + gate cut (x19-21)
TTTTTTTTTTTTTTTTTTT...TTTTTTTTTTTTTTTTTTTTTTT  y34
```

*(Every map row is exactly 45 chars — machine-validated against the canonical row list below; the trailing `yN` annotations are not tiles. Canonical rows for the build phase:)*

```
y0:  36×C, WW(36-37), 7×C
y1:  36×C, WW(36-37), 7×C
y2:  C(0-2) s(3-9) C(10-24) s(25-35) ww(36-37) ,(38-40) C(41-44)
y3:  T(0-1) s(2-9) ,(10-11) s(12-27) ,(28-29) s(30-35) ww(36-37) s(38-40) ,(41-42) C(43-44)
y4:  T(0-1) s(2-9) B(10-13) s(14-35) ww(36-37) s(38-42) C(43-44)
y5:  T(0-2) s(3) B(4-7) s(8-9) B(10-14) s(15-16) B(17-20) s(21-34) w(35-36) s(37-38) #(39-40) s(41) C(42-44)
y6:  T(0-2) s(3) B(4-7) s(8-9) B(10-14) s(15-16) B(17-20) s(21-22) B(23-26) s(27-34) w(35-36) s(37-38) #(39-40) s(41) C(42-44)
y7:  T(0-2) s(3) B(4-7) s(8-9) B(10-14) s(15-16) B(17-20) s(21-22) B(23-26) s(27-34) w(35-36) s(37-41) C(42-44)
y8:  T(0-2) s(3) B(4-7) s(8-16) B(17-20) s(21-34) w(35-36) s(37-41) C(42-44)
y9:  T(0-1) s(2) .(3-5) D(6) .(7-27) s(28-31) g(32-34) w(35-38) g(39-40) s(41-42) C(43-44)
y10: T(0-1) s(2) .(3-31) g(32-33) w(34-39) g(40) s(41-42) C(43-44)
y11: T(0-1) s(2-8) f(9-11) .(12) f(13-16) g(17-18) .(19-20) g(21-32) w(33-40) s(41-42) C(43-44)
y12: T(0-1) s(2-8) f(9) g(10-15) f(16) c(17-18) b(19-20) c(21-32) w(33-40) s(41-42) C(43-44)
y13: T(0-1) s(2-8) f(9) g(10-15) f(16) c(17) g(18) .(19-20) g(21-32) w(33-40) s(41) C(42-44)
y14: T(0-1) s(2) ,(3-4) s(5-8) f(9) g(10-15) f(16) c(17) g(18) .(19-20) f(21-30) g(31-33) w(34-39) g(40) s(41) C(42-44)
y15: T(0-1) s(2-8) f(9-16) c(17) .(18-19) g(20) f(21) F(22-29) f(30) g(31-34) w(35-38) g(39-40) s(41) C(42-44)
y16: T(0-1) s(2-8) ,(9-16) c(17) .(18-19) g(20) f(21) F(22-29) f(30) g(31-35) c(36) g(37-40) s(41-42) s(43-44=exit cut)
y17: T(0-1) s(2-3) f(4-13) g(14-16) c(17) .(18-19) g(20) .(21=B gate) F(22-29) f(30) g(31) F(32-35) c(36) g(37-40) .(41-44=to E exit)
y18: T(0-1) s(2-3) f(4) F(5-12) f(13) g(14-16) c(17) .(18-19) g(20) f(21) F(22-29) f(30) g(31) F(32-35) c(36) g(37-39) .(40-41) ,(42) s(43-44)
y19: T(0-1) s(2-3) f(4) F(5-12) f(13) g(14-16) c(17) .(18-19) g(20) f(21) F(22-29) f(30) g(31-35) c(36) g(37-38) .(39-40) ,(41-42) C(43-44)
y20: T(0-1) s(2-3) f(4) F(5-12) .(13=A gate) g(14-16) c(17) g(18) .(19-20) f(21-30) g(31-35) c(36) g(37) .(38-39) ,(40) g(41) ,(42) C(43-44)
y21: T(0-1) s(2-3) f(4) F(5-12) f(13) g(14-16) c(17) g(18) .(19-20) g(21-27) .(28-35) b(36) .(37-38) ,(39) g(40) ,(41) g(42) C(43-44)
y22: T(0-1) s(2-3) f(4) F(5-12) f(13) g(14-16) c(17) g(18) .(19-20) g(21-23) .(24-35) b(36) g(37-40) ,(41-42) C(43-44)
y23: T(0-2) s(3) f(4-13) g(14-16) c(17) P(18-24) g(25-35) c(36) g(37-38) ,(39-40) s(41) C(42-44)
y24: T(0-2) s(3) g(4-16) c(17) P(18-24) g(25-26) f(27-29) .(30=orchard gate) f(31-36) g(37-38) ,(39-40) s(41) C(42-44)
y25: T(0-2) s(3) g(4-15) w(16-17=basin) P(18-24) g(25-26) f(27) O(28-35) f(36) g(37-38) ,(39-40) s(41) C(42-44)
y26: T(0-2) s(3) f(4-13) g(14-15) w(16-17) P(18-24) g(25-26) f(27) O(28-35) f(36) g(37-38) ,(39-40) s(41) C(42-44)
y27: T(0-1) s(2-3) f(4) F(5-12) f(13) g(14-17) P(18-24) g(25-26) f(27) O(28-35) f(36) g(37-38) ,(39-40) s(41-42) C(43-44)
y28: T(0-1) s(2-3) f(4) F(5-12) f(13) s(14-18) .(19-21) s(22-26) f(27) O(28-35) f(36) g(37-38) ,(39-40) s(41-42) C(43-44)
y29: T(0-1) s(2-3) f(4) F(5-12) .(13=C gate) s(14-18) .(19-21) s(22-26) f(27) O(28-35) f(36) g(37-38) ,(39-40) s(41-42) C(43-44)
y30: T(0-1) s(2-3) f(4) F(5-12) f(13) s(14-18) .(19-21) s(22-26) f(27) O(28-35) f(36) ,(37-38) s(39-42) C(43-44)
y31: T(0-1) s(2-3) f(4) F(5-12) f(13) s(14-18) .(19-21) s(22-26) f(27-36) ,(37-38) s(39-41) C(42-44)
y32: T(0-1) s(2-3) f(4-13) s(14-17) .(18-21=widened) s(22-26) T(27-29) s(30-35) T(36-38) s(39-41) C(42-44)
y33: T(0-18) .(19-21=gate cut) T(22-44)
y34: T(0-18) .(19-21) T(22-44)
```

**Composition notes (the LAWs at work):**
- **Path language:** main south road 3 tiles (`x19-21`), widening to 4 at `y32` and framed by the palm-belt cut + lantern pair (LAW-28 ★ dressed entrance); yard road 2 tiles (`y9-10`); north path 2 tiles with a jog at `y15` (LAW-2); east road 2 tiles thinning to a 1-wide frayed climb into the steppe (LAW-6 soft language toward bedouin). Every run terminates at a door, gate, exit, fountain, or plaza (LAW-4).
- **Bridges (exactly 2, LAW-23):** plank crossing where the north path crosses the falaj main leg at (19-20,12); plank where the east road crosses the orchard branch at (36,21-22). Both sit ON main paths — mini-focals.
- **Water story:** waterfall (36-37,y0-1) → wadi (y2-8, 2-wide, **jogging 1 tile west at y5** so no straight water seam exceeds 4 — LAW-17) → pond (x33-40,y9-15, scalloped, 1-tile rim, grass halo + detached blobs) → falaj main leg west along y12 → south leg down x17 → 2×2 basin (16-17,y25-26) at the plaza junction; branch x36 (y16-23) waters herb beds + orchard. Channels run along plot EDGES per LAW-20; the composition bends toward the pond.
- **Diagonal (LAW-30):** south gate (20,34) → plaza focal (22,25) → homestead landmark (12,5) sweep one diagonal; the pond (36,12) pulls the eye the other way.
- **Focals:** primary = barn+silo+windmill row (tall + animated sails, LAW-26); secondary per district = waterfall/pond, plaza statue, basin, grapes-bower. Vertical punctuation every 8–12 tiles: silo, windmill, waterfall, palms, statue, bower.
- **Vignettes (LAW-34):** (1) "market-day loading" — hay bales ×3 (L-shape) + crates + a water trough + a standing camel in the farmhouse–barn gap (8-9, y5-8), spilling onto the facade line at (8,8) — beside, not ON, the yard road (no cart asset exists; see MISSING #17); (2) beehive + grapes-bower honey corner east of the orchard (37-38, y25-27).
- **Quiet corner (LAW-31):** NW pocket x2-8, y11-16 — no buildings, dead bush + rocks + `inscription-farmland-1`, zero NPCs.
- **Vista (LAW-46):** the NE road climb (y17-21, x38-42) crests a low dune lip where the container is only scrub — the player looks east over open steppe toward the bedouin camp (inscription-farmland-2 marks it).
- **Container (LAW-41/48):** N = desert cliff band (depth 2-3, jogging, waterfall break). E = cliff, depth 2 jogging to 3 (C at x42) on y5-8, y13-15, y23-26 and y31-32, so no straight cliff-edge run exceeds ~4 (LAW-48), with the 3-tile exit cut (y16-18). W = palm belt, depth 2 bulging to 3 (T at x2) on y5-8 and y23-26. S = palm belt with depth-3 palm bumps at x27-29 and x36-38 on y32 — no container run is constant-width. LAW-42 signposts: south exit framed by the palm belt itself + lanterns; east exit gets a palm pair at (40,14)+(41,15) and a camel-bones cluster at (42,18)-(42,19) (decor, no IDs — kept OFF the y17-19 road tiles).
- **Fence rhythm (LAW-43/35):** the 10-tile plot fence runs each get a break element at mid-run — scarecrows just inside the crops at (8,18) (plot A top y17), (25,15) (plot B top y14), (8,31) (plot C bottom y32-adjacent); jar/rock clusters just outside at (9,24) (plot A bottom y23), (26,21) (plot B bottom y20), (8,25) (plot C top y26), (32,32) (orchard bottom y31). Gates + corner posts break every other run at ≤8.
- **Sand↔grass rule (LAW-44 / MISSING #5):** the grid shows dominant material; at build time every raw g↔s seam receives a 1-tile `desert-grass` scrub band (`,`), and boundaries step diagonally 1-2 tiles per step. Scrub belts are already drawn at y16 (below pen), x39-42 (steppe), and the cliff foot.

## 4. Districts

| District | Tile rect (x,y,w,h) | Purpose |
|---|---|---|
| Homestead Row | (2,3)-(27,10) | Farmhouse + barn/silo + windmill + coop in a staggered top-edge line; yard road; the zone landmark |
| Paddock & Quiet Corner | (2,11)-(16,16) | Fenced livestock pen (cow, sheep; gate north to yard); NW quiet corner |
| Crop Quarters | (4,14)-(30,32) | Plot A wheat (5-12,18-22), Plot B barley (22-29,15-19), Plot C cotton/vegetables (5-12,27-31); falaj legs + service lanes |
| Pond & Falaj Head | (28,2)-(42,16) | Waterfall, wadi, pond, spring fountain, NE rock-outcrop pocket (chest + ore) |
| Herbalist's Garden | (31,15)-(36,19) | Maryam's herb beds + flax-drying racks, watered by the branch channel |
| Farm Plaza | (18,23)-(24,27) | Packed-earth plaza where all paths meet: harvest-shrine statue, produce stall, learning shelf |
| Date Orchard | (27,24)-(36,31) | Fenced palm rows + grapes-bower (the ONE regular-spacing block, LAW-45); beehives outside the east fence |
| Steppe Road & Vista | (37,15)-(44,23) | East road fraying into scrub, dune-lip vista, exit cut to bedouin_camp |
| South Approach | (14,28)-(31,34) | Dressed gate, widened road, lantern pair, open sand with cactus/rock interest |

## 5. Contract placement table

Every farmland ID from contract-and-pipeline.md §1, exactly once. Exits match the connection-map ledger (S at fraction 20/45≈0.44 vs 0.45; E at 17/35≈0.49 vs 0.50 — both within ±0.10, pairs preserved).

**Exits + entries**

| ID | Placement | Rationale |
|---|---|---|
| `farm-to-marketplace` | edge=**south**, tileRange=[19,21] → desert_marketplace/`from_farmland` | ★ dressed main entrance through the palm-belt cut, dead-on the main road axis |
| `farm-to-bedouin` | edge=**east**, tileRange=[16,18] → bedouin_camp/`from_farmland` | plain 2-3 tile cut through the east cliff at the end of the steppe road |
| entry `from_marketplace` | (20,32) | 2 tiles inside the south gate, on the widened road |
| entry `from_bedouin` | (42,17) | 2 tiles inside the east cut, on the road |
| spawnPoint | (20,32) | same as from_marketplace (south is the story approach) |

**NPCs**

| ID | Tile | Rationale |
|---|---|---|
| `farmer-omar` | (13,10) | On the yard road beside the pen gate, mid-task at the trough — the working heart of the homestead |
| `herbalist-maryam` | (33,19) | Among her herb beds between pond and orchard — the "nature" teacher lives with her plants |

**Interactables (24)**

| ID | Tile | Rationale |
|---|---|---|
| `sign-farm-entrance` | (22,31) | 1 tile off the main road, approach side, at the gate (LAW-7) |
| `sign-farm-barn` | (12,8) | Under the barn facade at the yard-road junction |
| `door-barn` → farmhouse_interior | (6,9) | Farmhouse threshold opening south onto the yard road; ≥2 clear tiles in front ((6,10),(6,11)) |
| `bookshelf-nature` | (8,9) | On the farmhouse facade line — Omar's almanac shelf by the door |
| `bookshelf-animals` | (17,11) | At the pen's NE corner post — read about the beasts while watching them |
| `bookshelf-body` | (18,27) | Plaza SW corner — the workers' rest spot |
| `chest-farm-hidden` | (42,4) | NE pocket behind the wadi, under the cliffs — reward for exploring past the pond |
| `chest-farm-pond` | (39,16) | In the reeds of the pond's SE shore |
| `pot-farm-1` | (4,9) | Farmhouse corner cluster (props hug architecture) |
| `pot-farm-2` | (21,8) | Windmill corner — grain jars |
| `pot-farm-3` | (31,19) | Herbalist's garden — Maryam's tincture jars |
| `barrel-farm-1` | (10,8) | Barn front, beside the sign — feed barrel |
| `barrel-farm-2` | (24,26) | Plaza east edge anchor (LAW-3 junction corner) |
| `barrel-farm-3` | (29,23) | Beside the orchard gate approach — date-syrup barrel |
| `crate-farm-1` | (18,25) | Flanking the produce stall — goods at the flank (LAW-37) |
| `stall-farm-1` | (18,24) | Plaza west side produce stand, rug beneath (LAW-38); off the walk lanes |
| `statue-farm-1` | (22,25) | Plaza focal, off-centre by 1 east of the plaza's true centre (21,25) (LAW-27) — old harvest-shrine stone |
| `fountain-farm-1` | (32,10) | Spring house on the pond's NW shore, terminus of the garden path (LAW-4) |
| `lantern-farm-1` | (17,32) | West flank of the dressed south gate (LAW-28/36 pair) |
| `lantern-farm-2` | (22,32) | East flank of the dressed south gate |
| `painting-farm-1` | (7,9) | On the farmhouse wall beside the door — family scene |
| `inscription-farmland-1` | (3,14) | NW quiet corner — a forgotten boundary stone |
| `inscription-farmland-2` | (40,21) | The dune-lip vista — travellers' mark overlooking the steppe |
| `inscription-farmland-3` | (34,3) | Cliff base near the waterfall — old flood-mark of the wadi |

**Gathering spots (10)**

| ID | Item/type | Tile | Rationale |
|---|---|---|---|
| `spot_farm_herbs_01` | wheat/herb_patch | (8,20) | Inside Plot A — the wheat field |
| `spot_farm_herbs_02` | barley/herb_patch | (25,17) | Inside Plot B — the barley field |
| `spot_farm_herbs_03` | dates/herb_patch | (31,27) | Inside the date orchard |
| `spot_farm_herbs_04` | honey/herb_patch | (37,26) | Beehive cluster outside the orchard's east fence |
| `spot_farm_animal_01` | wool/animal_trace | (12,13) | Inside the pen, among the sheep |
| `spot_farm_animal_02` | linen/animal_trace | (34,19) | Flax-drying racks in the herbalist's garden |
| `spot_farm_animal_03` | cotton/animal_trace | (8,29) | Inside Plot C — the cotton rows |
| `spot_farm_water_01` | olive_oil/water_source | (34,15) | Olive-press stone on the pond's south rim (water_source may touch the rim) |
| `spot_farm_ore_01` | iron_ore/ore_vein | (40,7) | Base of the NE rock outcrop under the cliffs |
| `spot_farm_papyrus_01` | papyrus/papyrus_stand | (38,16) | Reed stand on the pond's SE shore |

*(No stepTriggers or subAreas exist in the farmland contract — none invented.)*

## 6. Enterable interiors

| Door | Tile | interiorId | Notes |
|---|---|---|---|
| `door-barn` | (6,9) | `farmhouse_interior` | "Farmer's House" (بَيْت المُزارِع), 10×8 buildSmallHouse, `farmer-interior` + 4 interactables — **existing hand-crafted layout kept as-is this phase**; return point auto-follows the new door position (contract §8) |

Barn, silo, windmill, and coop are **not** enterable (no contract doors; no new interiorIds invented). Procedural `house_farmland_<n>` filler ids remain unused.

## 7. Asset manifest

All verified against `asset-inventory.md` (existing kenmiCatalog keys only):

| Need | Kenmi family (verified) |
|---|---|
| Farmhouse | `desert-house-3.x` (wide adobe, 4×3.5) — keeps the Arabian material family |
| Barn / silo / coop / windmill | `barn`, `silo`, `coop`, `windmill` + `windmill-sail-anim` |
| Crop plots | `farmland-tile` (+ `farmland-wet-tile`), `crops`, `crops-2`, `scarecrows` |
| Fences + gates | `fence-big` + gates, `fences` (pen, plots, orchard) |
| Orchard | `palm-tree-1/2` rows + `grapes-bower` trellis + `bee hive/nest` (dates per MISSING #8 workaround) |
| Water | `desert-water-tiles-1..3` + `desert-water-foam-animation` (pond/basin), `desert-cliff-waterfall-1..3` (wadi head) |
| Cliffs | `desert-tiles-desert-cliff-tiles-1..3` |
| Ground | `desert-beach-tiles-1/2/3` (3 sand hues incl. trampled paths per LAW-6), `desert-tiles-desert-grass` (scrub bands), grass autotile `grass-tiles-3` |
| Bridges/planks | `bridge-wood` / `desert-tiles-desert-bridge` |
| Plaza dressing | `market-stalls` (produce stall), `desert-rugs` (stall rug), `desert-pots-sacks`, `barrels`, crates, `signs`, `lantern`/`lanter-posts` |
| Homestead props | `hay-bales`, `water-troughs`, `well`-less (pond serves), `chimney-smoke-anim` on farmhouse |
| Animals (explicit objects — ambient spawner is OFF) | `cow`, `sheep` (also goat stand-in, MISSING #7), `chicken` ×3 + `rooster`, `camel-1` (cart vignette) |
| Interest props | `cactus`, `desert-rocks`, `dead-tree`, `dead-bush`, `desert-bones` (east vista), `acacia-tree` (1-2, pond halo), `flower-grass-*-anim` tufts near water |

**Missing / worked around (rows added to `docs/WORLD-MISSING-ASSETS.md`):**
- **#15 — 1-tile falaj channel water:** no 1-wide water autotile exists (the 5×3 desert-water blob can't render a 1-tile strip with banks on both sides). Workaround: render all `c` tiles as 1-wide **`farmland-wet-tile` strips** (reads as a wet irrigation furrow) with grass edging; real water autotile only for the pond, wadi (2-wide), and the 2×2 basin. Skipped: true stone-lined channel art.
- **#16 — waterwheel / shaduf at the falaj head:** none exists (Roots of Pacha reference). Workaround: `water-sack-on-stick` prop at the basin + `fountain-anim` as the spring house. Skipped: rotating wheel.
- **#17 — farm cart / hay wagon (market-day vignette):** no cart asset exists (`minecrats` are mine carts — wrong read). Workaround: compose the loading vignette from `hay-bales` + crates + `water-troughs` + a standing `camel-1`. Skipped: the cart itself.
- Already-ledgered gaps relied on: #5 (scrub band mediates every sand↔grass seam), #7 (sheep as goats), #8 (palms + grapes-bower as the date orchard).

## 8. Lint self-check (LINT-1..11)

1. **No overlapping objects** — all placement-table coordinates are unique tiles; building footprints (farmhouse 4-7×5-8, barn 10-13×4-7, silo 14×5-7, windmill 17-20×5-8, coop 23-26×6-7) don't intersect each other or any prop; the stall rug is FLAT (lower layer) under the stall front only.
2. **Nothing on water/collision** — every NPC/interactable/spot sits on `s/g/F/O/P/.` tiles per the grid; the only water-adjacent item is `spot_farm_water_01` (34,15) on the grass rim (water_source rim allowance); bridges `b` are on the amphibious allowlist; no doors/NPCs on collision.
3. **Rugs on plausible ground** — one rug, under the stall at (18,24-25), fully on flat plaza ground; no shoreline/cliff/material-seam straddle.
4. **Density caps & spacing** — busiest screen (homestead, 20×15 around 12,7) ≈ 13 non-flat props ≤15; plaza screen ≈ 10; quiet corner 3; same-key runs broken by variant alternation (LAW-35): 3 hay bales in an L, chickens ×3 scattered, palms alternate palm-1/palm-2, fence mid-runs broken by scarecrows/jar clusters (LAW-43 note, §3); no 20×20 empty window (south approach gets cactus (26,30), rocks (15,29), dead tree (17,31) — all on open sand, NOT inside fenced plots — + sand-blob decals; open field interest every 8-15 tiles).
5. **Every door reachable** — flood-fill from spawn (20,32): main road → plaza → north path → bridge (19-20,12) → yard road → `door-barn` (6,9) with (6,10),(6,11) clear; pen via gate (12,11); plots via gates (13,20)/(21,17)/(13,29)/(30,24); herb beds via the y13-16 grass band; pond shores via garden path + east road; NE pocket via the x41 sand strip (x42 is cliff on the jog rows y5-8/y13-15, but x41 stays sand the whole run and the chest tile (42,4) itself is clear); both exits, both entries, both NPCs, all 10 spots reachable — no orphaned islands (the NE pocket connects via the east shore strip).
6. **Contract exits present & connected** — exactly `farm-to-marketplace` (south edge, rect on y=34, range [19,21] in bounds) and `farm-to-bedouin` (east edge, rect on x=44, range [16,18]); targets/entry keys unchanged; destination entry tiles walkable; fractions match the connection map within ±0.10; both `entries` keys kept, tiles walkable and outside exit trigger ranges of other exits.
7. **Contract completeness** — 2 NPCs + 24 interactables + 10 gathering spots + 2 exits + 2 entries, each exactly once, no strays; `door-barn`→`farmhouse_interior` resolves in INTERIORS with its `exit-door` isExit ✓; building-set proximity: door/sign/painting/pot/bookshelf all within 2 tiles of their building sprites (LAW-16).
8. **Dims & template** — 45×35 matches zones.js `mapWidth/mapHeight`; build phase copies oasis-village.json structure (Ground/Collision/Exits, uncompressed, tileset names = catalog keys).
9. **Asset legality** — every family in §7 verified in asset-inventory.md; gaps ledgered as #15/#16; no cultural excludes (pen is cow/sheep/chicken — **no pigs**; no church/halloween).
10. **Shoreline & seam sanity** — pond scallops in 2-4-tile arcs (widths 4→6→8→8→8→6→4); longest straight water seam = 4 (wadi legs, after the y5 jog; pond west edge x33 = 3) ≤ 6; container edges also jog (E cliff runs ≤4 between depth changes, W/S palm belt varies 2→3); every grass↔sand seam receives a scrub `,` band at build time (global rule, §3 note) so no raw g|s adjacency ships; district ground boundaries step diagonally with the paths/channels as seams.
11. **Collision coverage (authoring law)** — at build time the Collision layer must paint: all `C W w c T B f #` tiles, the palm belt, and dense prop clusters; `b` bridge tiles and all `s g F O P . D ,` stay walkable; verified by hand-walk before acceptance since lint can't catch unpainted water today.

---

## 9. Review appendix (adversarial design review, 2026-07-03)

**Scope reviewed:** LAW compliance of the sketch (paths, spacing, density, water edges, focal, entrance), asset-manifest reality against `asset-inventory.md`, coherence (roads/doors/props/contract tiles vs grid — machine-checked ALL §5 placements against the grid, not just 8), and honesty of the §8 lint self-check. Exits, edge fractions, dimensions and region geography were locked by the prior cross-zone audit and were NOT changed. Grid re-validated after fixes: every row exactly 45 chars, ASCII ⇄ canonical row list identical, every §5 placement on its claimed tile class.

**Confirmed violations found and FIXED:**
1. **LAW-17/LINT-10 — wadi seam.** The wadi ran dead straight at x36-37 for y2-y8 (7-tile straight water-land seams both sides); §8.10 falsely claimed the longest seam was 3. Fixed: wadi jogs 1 tile west at y5 (x35-36 for y5-8, reconnecting to the pond at y9); §8.10 corrected.
2. **LAW-48 — east cliff.** C(43-44) ran arrow-straight for 14 rows (y2-y15) and 14 rows (y19-y32). Fixed: depth jogs to 3 (C at x42) on y5-8, y13-15, y23-26, y31-32 — no straight edge run >4. NE-pocket reachability preserved via the x41 sand strip (§8.5 updated).
3. **LAW-41 — constant-width containers.** W palm belt was exactly depth-2 for 30 rows; S belt uniform. Fixed: W belt bulges to depth 3 on y5-8 and y23-26; S belt gets palm bumps x27-29/x36-38 at y32.
4. **LAW-27 — plaza focal dead-centre.** `statue-farm-1` at (21,25) was the exact centre of the 7×5 plaza (x18-24 × y23-27) while the rationale claimed "off-centre by 1". Fixed: moved to (22,25); diagonal note updated.
5. **LAW-33/coherence — interest props inside the fenced orchard.** §8.4 placed "rocks (31,29), dead tree (35,30)" on `O` orchard soil (and a dead tree inside an irrigated orchard reads wrong). Fixed: rocks (15,29), dead tree (17,31) — open sand in the south approach.
6. **LAW-43 — 10-tile unbroken fence runs.** Plot A (y17/y23), plot B (y14/y20), plot C (y26/y32) and orchard bottom (y31) fences ran 10 tiles without a break (cap ≤8). Fixed: scarecrow/jar-cluster break elements added at mid-runs (new "Fence rhythm" note, §3); §8.4 updated.
7. **ASSETS — "hay cart" does not exist.** The LAW-34 vignette named a hay cart; no cart asset is in the catalog (`minecrats` = mine carts). Fixed: vignette recomposed from real assets (hay-bales + crates + water-trough + camel-1) and moved OFF the yard-road tiles into the farmhouse–barn gap (8-9, y5-8) per LAW-34 "near but not on the path"; new ledger row **#17** added to `docs/WORLD-MISSING-ASSETS.md`. Every other §7 manifest family verified present in `asset-inventory.md` (barn/silo/coop/windmill+sail-anim, farmland(-wet)-tile, crops/crops-2, scarecrows, fence-big+gates/fences, palm-tree-1/2, grapes-bower, bee hive/nest, desert-water-tiles-1..3+foam, desert-cliff-waterfall-1..3, desert-cliff-tiles-1..3, desert-beach-tiles-1/2/3, desert-grass, grass-tiles-3, bridge-wood/desert-bridge, market-stalls, desert-rugs, desert-pots-sacks, barrels, crate-anim, signs, lantern/lanter-posts, hay-bales, water-troughs, chimney-smoke-anim, cow/sheep/chicken/rooster/camel-1, cactus, desert-rocks, dead-tree, dead-bush, desert-bones, acacia-tree, flower-grass-*-anim, fountain-anim, water-sack-on-stick).
8. **LAW-42 — sloppy signpost coords.** The east-exit "palm pair + camel-bones at (40-41, y15-19)" range overlapped the diagonal road tiles ((41,17),(40,18),(40,19)…). Fixed: palm pair (40,14)+(41,15), bones (42,18)-(42,19), all off-road.

**Checked and PASSED (no change):** path hierarchy 3/2/1 (LAW-1) and termination (LAW-4 — yard-road west stub reads as a jar-dressed dead-end at the quiet corner, allowed); door-barn stub + 2-tile clearance (LAW-5); homestead one-edge cluster, barn+silo touching, 2-tile gaps, 1-2-tile facade stagger (LAW-9/10/15); 5-building budget (LAW-11); bridges ×2 on main paths at channel crossings (LAW-20/23); pond size/halo/scallop widths 4→6→8→8→8→6→4 (LAW-17/18); plaza 7×5 with unequal radiating paths, no full crossroads (LAW-3/27); dressed south entrance, lantern pair, decision point within 7 tiles (LAW-28/36); landmark on the walk-in path axis (LAW-25); quiet corner (LAW-31); vista + inscription-2 (LAW-46); orchard as the one regular-spacing block (LAW-45); east-road/plaza connection at (24,22)→(24,23) and every gate/door flood-fill route re-traced; all 24 interactables + 2 NPCs + 10 spots + both entries verified on walkable non-collision tiles matching their §5 rationale.
