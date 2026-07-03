# Zone Design — oasis_village (واحَة الحُروف)

**Status:** Phase 1 design document (2026-07-03). DOCUMENT ONLY — no code, maps, or zones.js changes flow from this file directly.
**Obeys:** `docs/WORLD-DESIGN-BIBLE.md` (§2 LAWs, §3.1 brief), `docs/world-design-research/contract-and-pipeline.md` §1 (contract) + §8 (interiors), `docs/world-designs/world-connection-map.md` (exit ledger).

---

## 0. Reference study — what this composition steals

Images studied from `/Users/theshumba/Desktop/Gogo-World-References/`:

| Reference | What we steal |
|---|---|
| `02/secret-of-mana-kakkara-snes-map.webp` | The whole container idea: a **packed palm-forest ring** enclosing a sand clearing, 3 huts loosely ringing a small sparkling pond. Our palm belt (W/S edges) + pool-as-social-centre are Kakkara. |
| `02/golden-sun-suhalla-gba-map.webp` | Tight adobe hamlet grammar: 4 staggered flat-roof houses, **jar/pot clusters hugging wall bases**, rock frame on the map edge, sandy plaza between homes. Drives our residential cluster + prop-cluster placement. |
| `02/earthbound-scaraba-snes-map.webp` | Market as a **bounded strip on one side** of town (not scattered stalls); palm+pond pockets punctuating open sand; **ruins landmark sitting apart in the sand**. Drives our market corner and the NE ruins pocket. |
| `02/golden-sun-lost-age-naribwe-gba-map.webp` | The clean **5-building budget** around a dirt plaza with a well; entrance paths anchored by paired totems (→ our lantern pair at the gate); one quiet scrub corner. |
| `01/pokemon-emerald-oldale-town-fullmap.png` | Scale + flow: entrance road reaches a **decision-point junction within ~6 tiles**, with building corners anchoring the junction (LAW-3/28). Our gate→plaza spacing is Oldale's. |
| `11/kenmi-desert-oasis-waterfall-palm-edges.gif` | The exact Kenmi **edge grammar for the pool**: water → wet rim → scrub-grass halo → sand, palm clusters of 2–3 ON the halo, cactus/bones/rock accents in the outer sand. We reuse everything except the waterfall (no cliff meets our pool). |
| `11/kenmi-desert-arabian-village-road-junction.gif` | Dirt-road bend with staggered adobe corners, and the **camel + carpet + trader vignette** beside (not on) the road — copied as our east-road rest-stop vignette. |
| `11/pokemon-emerald-route111-oasis-pond-house.png` | A building **overlooking the water from behind** (our market storehouse on the pool's NW shoulder) and dune/cliff framing that pinches the map edge. |

---

## 1. Concept

A palm-shaded spring hamlet where the journey begins — five adobe homes drinking from one pool, wrapped in a palm belt with the dune sea beyond. The **oasis pool is the primary focal**: the gate road from the library runs straight to a small spring-head fountain on the plaza, and the water spreads south below it, haloed in scrub grass, with the village well and Guide Amira on its far shore. Composition channels Kakkara's palm-ring-around-a-pond, Suhalla's staggered adobe cluster, and Scaraba's edge-market + sand-ruins pocket; the Kenmi oasis scene supplies the literal tile grammar.

One-sentence identity (LAW-24): **"Five adobe homes drinking from one palm-ringed pool."**

## 2. Dimensions

**40 × 30 tiles** (64px world tiles) — per bible §3.1 and contract (`mapWidth/mapHeight` must stay 40×30 in zones.js + Tiled JSON).

## 3. Tile-grid sketch

Legend — terrain: `C` dune-cliff (unwalkable) · `P` palm (unwalkable belt/cluster) · `.` sand · `,` sand decal/dune tuft · `g` scrub-grass (desert-grass blob) · `~` water · `w` wet/shore rim (sand↔water autotile edge) · `=` main road (packed dirt) · `-` lane/stub (secondary) · `p` plaza paving · `r` ruins rubble floor (walkable) · `o` rock outcrop (unwalkable) · `X` zone-exit cut.
Marks: `#` building footprint · `D` contract door · `F` fountain · `W` well · `S` stall · `T` statue · `c` chest · `i` inscription · `s` sign · `+` contract prop (lantern/barrel/pot/crate/painting/bookshelf) or vignette prop · `*` gathering spot · `@` spawnPoint · NPCs: `A` Amira, `Y` Yusuf, `M` Fatima, `K` Khalid.

```
          1111111111222222222233333333
0123456789012345678901234567890123456789
CCCCCCCCCCCCCCCCCCCXXXCCCCCCCCCCCCCCCCCC  0
CCC.PP..PP........,===,...CCCCCCCCCCCCCC  1
PPP......PP........===....CrrrrrrrrrCCCC  2
PPP..,.....,.....s+===+...CrrrirrrrrCCCC  3
PPP.............pppppppp..rrrrrrcrrrCCCC  4
PPP..PP.,.......pppppppp..rrTrrrrrrrCCCC  5
PPP...........--pppppppp..Crrrrrrr*rCCCC  6
PPP..........--.pppppppp..CrrrrrrrriCCCC  7
PPP.####...--...ppppFppp==CCCCCCCCCCCCCC  8
PPP.####..--..gw~~~~~~wg===..........CCC  9
PPP.####.--s.gw~~~~~~~~w===,,....+...CCC 10
PPP.####M--.g*w~~~~~~~~w===..........CCC 11
PPP.....S--.ggw~~~~~~~~w===..++......CCC 12
PPP....+.+..g*w~~~~~~~~w===..++......CCC 13
PPP......,....gw~~~~~~wg===.....,....CCC 14
PPP.........ggggwwwww*gg===..........CCC 15
PPP.........ggggWggAggg*===........o.CCC 16
PPP.###.............=======.........*CCC 17
PPP*###+....========@===-............CCC 18
PPP.###..###====........-......####..CCC 19
PPP+#D#..###+-...........--...+####..CCC 20
PPP.s-Y..#D#.-.............--.K####+.CCC 21
PPP...--------...............--#D##..CCC 22
PPP..###-............,.........---+..CCC 23
PPP..###...*.......,...........+.....CCC 24
PPP..###......,...........,..........CCC 25
PP.c.........,...........,...........CCC 26
PPi......PP....,,,,,PP......PP.......CCC 27
PPPPP.PPPPPPPP...+..PPPPPPPPPPPPPPPPPCCC 28
PPPPPPPPPPPPPPPCCCCCPPPPPPPPPPPPPPPPPPPP 29
```

> **Grid is exact**: every row is 40 characters and every mark sits at its §5 table coordinate (single-character marks replace the terrain glyph they stand on — `M` on lane, `A`/`W`/`*` on grass, `@` on road). Canonical geometry:
> - **Pool** (LAW-17/18): water x15–22 / y10–13, narrowing to x16–21 on the top (y9) and bottom (y14) rows — scalloped, longest straight seam = 6. Wet rim 1 tile on the west/east/south shores (x14 & x23 at y10–13; y15 at x16–21; corner wets at y9/y14). **North shore is the LAW-18 hard lip**: the plaza's paved edge (y8, x16–21) meets the y9 water row directly — that y9 row is the sand↔water autotile edge, and `fountain-oasis-1` stands ON plaza paving at (20,8), not on the rim.
> - **Grass halo**: 1–2 tiles beyond the rim (soft shores only) with detached scrub blobs at (12–13,11–13) and (12–15,15–16) — LAW-18 blobs.
> - **Plaza** x16–23 / y4–8; **gate road** x19–21 / y0–3; plaza→shore-road connector (24–25,8).
> - **East shore road** x24–26 / y9–16 (vertical run 8 — at the LAW-2 limit, not over it).
> - **South leg** (secondary street, 2-wide, edge-stepped so no straight material boundary exceeds 8 — LAW-2/LINT-10): x12–15 / y18–19 → x16–19 / y18 → x20–23 / y17–18 (spawn at (20,18)) → x24–26 / y17 joining the shore road's foot. The road's north edge steps up at x20 and its south edge steps up at x16, so every straight sand↔road boundary is ≤8 tiles.
> - **Market lane** 2-wide stepping (14–15,6)→(13–14,7)→(11–12,8)→(10–11,9)→(9–10,10–12) — contiguous at every step.
> - **Residential lane** (13,20–21) link → (6–13,22) with door stubs at (5,21) and (8,23).
> - **Guild branch** (24,18–19)→(25–26,20)→(27–28,21)→(29–30,22)→forecourt (31–33,23).
> - **Ruins pocket** floor x27–35 / y2–7, mouth at x26 / y4–5.

Buildings (5 — LAW-11 hamlet budget 3–5):

| # | Building | Asset | Footprint (x,y–x,y) | Door |
|---|---|---|---|---|
| B1 | Scholar's House | `desert-house-2.2` (renders 3×4 — 96×128) | (4,17)–(6,20) | `door-scholar-house` (5,20) |
| B2 | Merchant's House | `desert-house-1.3` (renders 2.5×2.5 — 80×80) | (9,19)–(11,21) | `door-merchant-house` (10,21) |
| B3 | Adventurers' Guild — the ONE oversized landmark (LAW-12), terminating the east road | `desert-house-4.1` (renders 4×3.6 capped — 144×128) | (31,19)–(34,22) | `door-oasis-guild` (32,22) |
| B4 | Market storehouse (filler, no enterable door) | `desert-house-3.2` (renders 4×3.5 — 128×112) | (4,8)–(7,11) | visual only |
| B5 | Palm-grove home (filler, no enterable door) | `desert-house-1.1` (renders 2.5×2.5 — 80×80) | (5,23)–(7,25) | visual only |

Rendered sizes per asset-inventory.md §2; the footprint rects are the collision/placement reservations (rounded up to whole tiles) and no other object claims a reserved tile. All doors face south (LAW-5). Facades staggered: bases at y20 / y21 / y22 / y11 / y25 — no three aligned (LAW-10). Residential cluster is an L (B1+B2+B5, 2-tile internal gaps); B4 sits 5 clear tiles above B1 (rows y12–y16 — within LAW-9's ±1 tolerance of the 6–10 inter-cluster gap) and B3 sits 17+ tiles from every other building.

## 4. Districts

| District | Tile rect (x,y,w,h) | Purpose |
|---|---|---|
| **Gate & plaza** | (16,0) 8×9 | Dressed north entrance (lantern pair + sign + palm clusters), 3-wide road reaching the plaza decision point in 4 tiles (LAW-28); spring-head fountain terminates the axis (LAW-27 centred-on-axis exception). |
| **Oasis shore** (subArea `oasis-shore`) | (13,8) 14×9 | The pool, wet rim, grass halo, well, Amira, rosewater/chamomile/mint/papyrus gathering, east shore road. |
| **Market corner** (subArea `market-square`) | (4,8) 8×6 | Storehouse + Fatima's stall overlooking the pool's west shore (Scaraba edge-market; Route-111 house-by-the-pond), goods clusters at the stall flanks (LAW-37). |
| **Residential** (subArea `residential`) | (3,17) 12×10 | Scholar + merchant + palm-grove homes on a curving lane off the main road; saffron garden, wool trace, painting/bookshelf/sign sets hugging facades. |
| **Ruins pocket** (subArea `ruins`) | (26,1) 11×8 | Cliff-framed rubble court NE of the gate: guardian statue at the mouth, chest, 2 inscriptions, copper vein — Scaraba's "old stones apart in the sand". |
| **Guild corner** | (27,18) 10×8 | East road ends at the oversized guild hall; Khalid reads at the outdoor shelf; forecourt with lantern/pot pair. |
| **Quiet corner** (LAW-31) | (1,23) 4×6 | SW pocket behind the palm belt (west of B5, which sits just outside the rect): hidden chest, one inscription, bones — 3 props, 0 NPCs, no buildings. |
| **Vista** (LAW-46) | (15,27) 5×3 | Gap in the south palm belt where a low dune ridge lets the eye run out over the open sand sea; dressed with bones + dune tufts. |

Diagonal composition (LAW-30): market corner (NW) → pool/plaza (centre) → guild (SE), with the ruins (NE) and quiet corner (SW) on the counter-diagonal — the eye sweeps the whole map.

## 5. Contract placement table

Every contract ID from contract-and-pipeline.md §1, exactly once.

**Zone data:** spawnPoint **(20,18)** (on the main road, pool + well + Amira in view — LAW-25).

**Exit + entry (per connection-map ledger — north edge, fraction 0.50 ★ dressed entrance):**

| ID | Placement | Rationale |
|---|---|---|
| `oasis-to-library` | edge=north, tileRange **[19,21]** (cut x19–21 through the cliff container) | Fraction 20/40 = 0.50 ★, matches library-to-oasis S/0.50; 3-wide dressed cut (LAW-28/41). |
| entry `from_library` | **(20,2)** | 2 tiles inside the cut, on the road, outside the exit trigger row (LINT-6). |

**NPCs (4):**

| ID | Tile | Rationale |
|---|---|---|
| `guide-amira` | (19,16) | On the grass halo beside the well — greets the player across the pool; cinematic Beat-5 pan target. |
| `scholar-yusuf` | (6,21) | In front of his own door (5,20); unlocking flag `met_scholar_yusuf` is earned face-to-face. |
| `merchant-fatima` | (8,11) | Vendor space BEHIND her stall counter (8,12), facing south across it (LAW-37 stall unit). |
| `student-khalid` | (30,21) | Beside the guild's outdoor bookshelf, reading — guild corner earns its 1 NPC. |

**Interactables (25):**

| ID | Tile | Rationale (analogous point of interest) |
|---|---|---|
| `sign-oasis` | (17,3) | 1 tile off the gate road on the approach side (LAW-7) — village welcome board. |
| `sign-market` | (11,10) | At the market-lane junction, pointing to the stall court. |
| `sign-study` | (4,21) | 1–2 tiles from the scholar's door (LAW-16) — "the Study" shingle. |
| `bookshelf-scholar` | (7,18) | Hugging the scholar house's east wall (outdoor shelf under the awning). |
| `bookshelf-student` | (30,20) | Against the guild's west wall, where Khalid studies. |
| `chest-ruins` | (32,4) | Deep in the ruins court, past the statue — the pocket's payoff. |
| `chest-hidden` | (3,26) | Quiet-corner secret behind the palm belt. |
| `door-scholar-house` | (5,20) | B1 facade base [locked: `met_scholar_yusuf`] → `scholar_house_interior`. |
| `door-merchant-house` | (10,21) | B2 facade base → `merchant_house_interior`. |
| `door-oasis-guild` | (32,22) | B3 facade base → `oasis_guild_interior`. |
| `fountain-oasis-1` | (20,8) | Spring head standing ON plaza paving at the plaza's south lip — the paved edge is the pool's LAW-18 hard shore — terminating the gate axis with the pool spreading behind it (LAW-27 exception, LAW-4). |
| `lantern-oasis-1` | (18,3) | West of the gate road — entrance framing pair (LAW-28/36). |
| `lantern-oasis-2` | (22,3) | East of the gate road — the matching pair. |
| `lantern-oasis-3` | (31,24) | Flanking the guild forecourt — evening light at the quest hall. |
| `statue-oasis-1` | (28,5) | Guardian statue just inside the ruins mouth — frames the threshold. |
| `stall-oasis-1` | (8,12) | Fatima's market stall facing the lane, pool at its back (rug beneath — LAW-38, decor). |
| `barrel-oasis-1` | (7,13) | Goods cluster at the stall's west flank (LAW-37 flanks). |
| `barrel-oasis-2` | (12,20) | Hugging the merchant house's east wall (LAW-32 cluster at architecture). |
| `pot-oasis-1` | (9,13) | Stall's east-flank jar — completes the 2–4 prop cluster. |
| `pot-oasis-2` | (34,23) | Guild forecourt jar, opposite flank from the lantern. |
| `crate-oasis-1` | (35,21) | Adventurers' supplies against the guild's east wall. |
| `painting-oasis-1` | (3,20) | Hung on the scholar house's west wall — the scholar's taste. |
| `inscription-oasis-1` | (2,27) | Weathered stone in the quiet corner, near the hidden chest. |
| `inscription-oasis-2` | (30,3) | Carved block on the ruins floor. |
| `inscription-oasis-3` | (35,7) | Carved into the ruins' east cliff base. |

**Gathering spots (8):**

| ID | Item/type | Tile | Rationale |
|---|---|---|---|
| `spot_oasis_herbs_01` | chamomile / herb_patch | (23,16) | SE grass halo — flowers where water meets sun. |
| `spot_oasis_herbs_02` | mint / herb_patch | (13,11) | Detached grass blob west of the pool (LAW-18 blobs). |
| `spot_oasis_water_01` | rosewater / water_source | (21,15) | On the pool's 1-tile south shore rim (allowed for `water_source`, LINT-2). |
| `spot_oasis_papyrus_01` | papyrus / papyrus_stand | (13,13) | Reeds on the walkable grass blob at the SW shore (kept OFF the rim — papyrus_stand is not rim-allowlisted). |
| `spot_oasis_animal_01` | wool / animal_trace | (11,24) | Sheltered yard between merchant + palm-grove homes where sheep bed down. |
| `spot_oasis_ore_01` | copper_ore / ore_vein | (34,6) | Ruins floor at the cliff base — old quarry seam. |
| `spot_oasis_herbs_03` | saffron / herb_patch | (3,18) | The scholar's precious garden bed beside his house. |
| `spot_oasis_ore_02` | iron_ore / ore_vein | (36,17) | East cliff base by the rock outcrop (35,16), off the guild road. |

**Step triggers (3):**

| ID | Rect | Rationale |
|---|---|---|
| `oasis-welcome` | (20,17) 2×1 | Exactly 1 tile north of spawnPoint (contract consistency note, pipeline §6). |
| `marketplace-hint` | (11,8) 3×1 | Across the market lane where it leaves the plaza — fires as the player heads toward commerce. |
| `ruins-echo` | (20,2) 2×1 | ON the `from_library` entry tile (contract consistency note). |

**Sub-areas (redrawn to the new districts):** `market-square` (4,8) 8×6 · `oasis-shore` (13,8) 14×9 · `residential` (3,17) 12×10 · `ruins` (26,1) 11×8.

**Cinematic hardcode checklist (pipeline §6 — update when this lands):** `WORD_SPAWN_X/Y` → **(20,16)** (grass halo, 2 tiles north of spawn, at the pool); Beat-2 pan → spawnPoint **(20,18)**; Beat-5 pan → `guide-amira` **(19,16)**.

## 6. Enterable interiors

Exactly the contract's 3 doors; interiors keep their existing hand-crafted layouts this phase (contract §8):

| Exterior door (new tile) | interiorId | Interior (unchanged) | Lock |
|---|---|---|---|
| `door-scholar-house` (5,20) | `scholar_house_interior` | Scholar's Study, 14×10, `scholar-yusuf-interior` + 6 interactables | `met_scholar_yusuf` |
| `door-merchant-house` (10,21) | `merchant_house_interior` | Merchant's Home, 10×8, `merchant-fatima-interior` + 4 interactables | — |
| `door-oasis-guild` (32,22) | `oasis_guild_interior` | Adventurers' Guild, 14×10, 6 interactables | — |

B4/B5 stay non-enterable (no new interiorIds this phase). Return wiring is automatic — exterior door position is the return point (contract §8).

## 7. Asset manifest

All families verified present in `docs/world-design-research/asset-inventory.md`:

| Use | Kenmi family/keys | Verified |
|---|---|---|
| Base sand (3 hues, variation blobs) | `desert-tiles-desert-beach-tiles-1/2/3` | ✓ §1 (THE current ground system) |
| Pool water + rim | `desert-water-tiles-1..3`, `desert-water-foam-animation` (sand↔water autotile) | ✓ §1 |
| Grass halo/blobs | `desert-tiles-desert-grass` (scrub blob — the ONLY legal sand↔green seam) | ✓ §1 |
| Cliff container (N edge, E edge, ruins frame, vista ridge) | `desert-tiles-desert-cliff-tiles-1..3` | ✓ §1 |
| Palm belt + shore clusters | `palm-tree-1` (large), `palm-tree-2` (small), `fallen-palm-leaves` | ✓ §3 |
| Buildings B1–B5 | `desert-house-1.1/1.3`, `desert-house-2.2`, `desert-house-3.2`, `desert-house-4.1` | ✓ §2 |
| Well | `well` (32×48) | ✓ §3 |
| Fountain | `fountain` / `fountain-anim` | ✓ §3 |
| Stall | `market-stalls` (wooden — accepted per WORLD-MISSING-ASSETS **#3**) | ✓ §2 |
| Rugs under stall/thresholds | `desert-rugs` (FLAT_GROUND) | ✓ §3 |
| Jars/sacks/barrels/crates/signs/lanterns | `desert-pots-sacks`, `barrels`, `crate-anim`, `signs`, `lantern`, `lanter-posts` (typo'd key, per MISSING #12) | ✓ §3 |
| Ruins dressing | `desert-obelisk-small-1/2` (broken columns), `desert-rocks`, `desert-bones` | ✓ §2/§3 |
| Open-sand POIs + vignette | `cactus`, `acacia-tree`, `dead-bush`, `desert-grass-props/anim`, `camel-1` + `desert-rugs` + `fire-pit` (east-road camel rest-stop, LAW-34; camel is an explicit zones.js object — ambient spawner stays OFF) | ✓ §3/§5 |
| Contract interactable sprites (statue, bookshelf, chest, painting, inscription) | existing `spriteKeyMap.js` mappings — unchanged | ✓ (pipeline) |

**Missing-asset handling:** nothing new to log. This design consumes three EXISTING `docs/WORLD-MISSING-ASSETS.md` workarounds: **#3** (wooden stall accepted as-is), **#5** (no sand↔grass blend → all green is `desert-grass` scrub, which blends with sand natively; grass never touches raw sand), **#8** (plain `palm-tree-1/2` clusters read as date palms; no fruited-palm art). No skips required.

## 8. Lint self-check (LINT-1..11)

1. **No overlapping objects** — every placed footprint in §3/§5 occupies distinct tiles; only `desert-rugs` (FLAT_GROUND) sit under the stall/forecourt, which is the permitted lower layer.
2. **Nothing on water/collision** — all NPCs, doors, spots and props sit on sand/grass/road/rubble. Sole rim contact is `spot_oasis_water_01` (water_source — allowlisted); papyrus was deliberately pulled onto the grass blob (13,13) because papyrus_stand is NOT rim-allowlisted.
3. **Rugs on plausible ground** — rugs only on flat sand (stall front, guild forecourt); none straddle rim, cliff, or material seams.
4. **Density caps & spacing** — per 20×15 screen: NW (storehouse+stall court) ≈ 11 non-flat props, NE (ruins) ≈ 8, SW (residential) ≈ 10, SE (guild+vignette) ≈ 8 — all ≤15 (LAW-31). Quiet corner holds 3 props/0 NPCs. Same-key props ≥2 apart except declared clusters ≤4 (stall flanks, gate lantern pair); palm belt is the LAW-41 container exemption. Open sand east of the pool gets the camel vignette (29–30,12–13), acacia (33,10 area), rocks (35,16), decal tufts every ≤8 tiles (LAW-33) — no empty 20×20 window.
5. **Every door reachable** — flood-fill from spawn (20,18): gate road ↔ plaza ↔ market lane ↔ shore road ↔ residential lane ↔ guild branch are one connected walk. Door fronts have ≥2 clear south tiles: scholar (5,21)(5,22), merchant (10,22)(10,23), guild (32,23)(32,24). Ruins reached via the x26/y4–5 mouth; quiet corner via open sand row 26; all 8 spots, 4 NPCs, exit range and entry tile connect to spawn — no islands.
6. **Contract exits present & connected** — exit set = {`oasis-to-library`} exactly; north edge, tileRange [19,21] within bounds, fraction 0.50 matches the ledger pair (library S/0.50); targets `ancient_library`/`from_oasis` (exists); our `from_library` entry (20,2) is walkable road, outside the exit trigger rows.
7. **Contract completeness** — 4 NPCs + 25 interactables + 8 spots + 3 stepTriggers placed exactly once (§5 counts cross-checked: 3 signs, 2 bookshelves, 2 chests, 3 doors, 1 fountain, 3 lanterns, 1 statue, 1 stall, 2 barrels, 2 pots, 1 crate, 1 painting, 3 inscriptions = 25). All 3 interiorIds resolve in the INTERIORS registry with `isExit` doors; every building-set interactable is within 2 tiles of its building (§5 rationales).
8. **Dims & template** — 40×30 everywhere; Ground/Collision/Exits layers per the oasis-village.json template; spawn (20,18) and entry (20,2) are walkable road tiles.
9. **Asset legality** — every key in §7 exists in kenmiCatalog (typo'd `lanter-posts` used as-is); nothing from CULTURAL_EXCLUDES; new crops from multi-item sheets (pots-sacks items, obelisk-smalls) need `PROP_CROP_REGIONS` rows at build time (data-only).
10. **Shoreline & seam sanity** — pool edges scallop (top/bottom water rows narrow by 1 each side; no water-land seam >6: longest straight run is 6 on the y9/y14 rows, side columns run 4); the north shore is the deliberate LAW-18 hard lip (plaza paving at y8 meets the y9 autotile water edge, span 6 ≤ the seam cap); grass is scrub-only so no raw grass↔sand adjacency; the south leg's road↔sand boundaries step at x16/x20 so no straight material boundary exceeds 8 (LAW-44/LINT-10); district ground changes (sand→plaza, sand→rubble) step diagonally at their corners (LAW-44).
11. **Collision coverage (authoring law)** — at build time paint non-zero Collision GIDs over: all pool water + rim water tiles, both cliff bands (N/E + ruins frame + vista ridge y29), the full palm belt, all 5 building footprints, and the rock outcrops; verify by in-game walk (lint's BFS cannot catch unpainted water).

Screenshot-review laws honoured by design: entrance framing (LAW-28), one oversized landmark (LAW-12: guild), focal hierarchy pool>fountain>guild (LAW-26), story vignette (LAW-34: camel rest-stop), quiet corner + vista (LAW-31/46), path hierarchy 3/2/1 with no straight run >8 (LAW-1/2), junction anchoring at plaza and lane mouths (LAW-3).

---

## Review (adversarial pass, 2026-07-03)

**Checked:**
- **Contract diff** against contract-and-pipeline.md §1 (oasis_village) + §8 (interiors): 4/4 NPC ids, 25/25 interactable ids (with `locked`/`unlockFlag` and all 3 `interiorId`s carried unchanged), 8/8 gathering-spot ids with matching item/type, 1/1 exit (`oasis-to-library` → ancient_library/`from_oasis`), entry key `from_library`, 3/3 stepTriggers, 4/4 subArea keys — every id exactly once, no strays. Pipeline §6 consistency notes hold: `oasis-welcome` 1 tile north of spawn (20,18); `ruins-echo` on the `from_library` entry tile (20,2).
- **Exit vs world-connection-map.md**: north edge, cut x19–21, fraction 20/40 = 0.50 ★ — matches the ledger pair (library S/0.50) within ±0.10.
- **LAWs on the grid** (programmatic re-check of row widths, mark coordinates, seam runs, clearances): LAW-1/2/3/5/7/9/10/11/12/16/17/18/25/26/27/28/30/31/33/34/41/42/44/46 audited; door fronts have ≥2 clear tiles; all districts flood-connect to spawn.
- **Assets**: spot-checked 12+ families (sand/water/grass/cliff tilesets, palms, all 4 house families with pixel sizes, well, fountain, market-stalls, rugs, `lanter-posts`, obelisk-smalls, camel-1, fire-pit) against asset-inventory.md §1–§5 — all present; WORLD-MISSING-ASSETS #3/#5/#8/#12 workarounds cited correctly, nothing new to log.

**Fixed (confirmed violations):**
1. **Grid misalignment** — 9 of 30 rows were 38–42 chars instead of 40, with marks drifting off their table coordinates (the old doc waved this off as "schematic"). Redrawn programmatically: every row exactly 40 chars, every §5 mark verified at its exact tile.
2. **LAW-2/LAW-44/LINT-10** — the south road leg's canonical geometry (`y18 x12–23`) was a 12-tile straight run/material boundary (>8). Reworked as an edge-stepped 2-wide street (x12–15/y18–19 → x16–19/y18 → x20–23/y17–18 → x24–26/y17); spawn (20,18) and `oasis-welcome` (20,17) stay on road; residential-lane and guild-branch junctions unchanged.
3. **LAW-17/18 contradiction** — "wet rim 1 tile all round" clashed with plaza paving at y8 and `fountain-oasis-1` at (20,8) (which would have sat on the rim → LINT-2 fail). Resolved: the north shore is now explicitly the LAW-18 hard (paved) lip; rim on the three soft shores only; fountain declared on paving. §5 rationale + lint item 10 updated.
4. **Market-lane discontinuity** — canonical stepping skipped y9 ((11–12,8)→(9–10,10–12) had no y9 tile). Bridged at (10–11,9); lane now contiguous.
5. **Quiet-corner rect overlapped a building** — (1,23) 6×6 contained B5's footprint (5,23)–(7,25), contradicting its own "no buildings" claim. Shrunk to (1,23) 4×6.
6. **LAW-9 claim overstated** — "B4 and B3 sit 6+ tiles from any cluster": the real B4↔B1 gap is 5 rows (y12–y16). Claim corrected to 5 tiles (within the bible's ±1 tolerance), B3 restated at 17+.
7. **Building asset sizes corrected to inventory truth** — house-1.x renders 2.5×2.5 (not "3×3"), house-3.2 renders 4×3.5, house-4.1 renders 4×3.6 capped; footprint rects clarified as rounded-up placement reservations.

**Verdict: FIXED** — contract coverage was already 100%; composition stands after the geometry corrections above. No rewrite of concept/districts needed.

---

## Review appendix — Phase 2 map-build notes (2026-07-03)

Map authored by `scripts/generate-map-from-design.mjs oasis_village` → `public/assets/maps/oasis-village.json` (old map kept as untracked `oasis-village.json.pre-rebuild`). Deliberate deviations / open items, none silent:

1. **`spot_oasis_water_01` (21,15) sits on painted rim collision.** §8.11 paints Collision over pool water + wet rim; lint's LINT-2 "spot on Collision tile" check is unconditional (the water_source rim allowance only covers the on-water check). Wiring agent must either nudge the spot 1 tile onto the y15 grass/sand shore or leave the single rim tile unpainted and accept the LINT-11 hit — flagged, not resolved here.
2. **Rim tiles are water-family GIDs.** `w` + `~` form one water body autotiled with `desert-water-tiles-1` frames 3/4/5/9/10/11/15/16/17 (bank transitions live inside the water tiles — verified opaque). Lint therefore counts the rim as open water: the y8/y9 north-shore seam reads as 8 (WARN LINT-10), though the §3 open-water span is 6 as designed. *[Resolved in the Phase-2 lint pass: linter false positive — `classifyGids` now knows the 6×3 pool sheet (straight bank frames = open water, corner frames = shore run-terminators); map unchanged, WARN gone. See lint-baseline-oasis.md Phase-2 addendum P2-1.]*
3. **`desert-water-foam-animation` not placed** — the Tiled path renders static tiles only; foam would need the animated-tile pipeline. Cosmetic, deferred to the screenshot-review phase.
4. **`,` dune-decal cells emitted as plain sand** plus a `Decals` object layer (20 hint points) — the LAW-33 decal/tuft pass belongs to the zones.js objects agent.
5. **Grass blobs:** `desert-grass` edge frames are partially transparent, so grass lives on a `GroundDetail` overlay tilelayer above sand (template extension; TiledMapLoader creates all tilelayers by name, lint ignores extras). 1-tile-wide strips fall back to the solid frame (hard edge) — polish candidate.
6. **Cliff container** rendered with the opaque rock-face column (frames 41/54/67 of `desert-cliff-tiles-1`); the sheet's scalloped rim frames are transparency overlays and were skipped. Ruins floor uses plateau/rubble frames 98/111/124/137 (+decorated variants). Straight map-edge cliff↔sand boundaries trip LINT-10 LAW-44 WARNs — LAW-41 container exemption, accepted. *[Phase-2 lint pass: the 3 WARNs (16@(3,1), 11@(26,9), 20@(37,9)) are REAL-but-accepted (warn-level, exit 0), triaged as P2-2..P2-4 in lint-baseline-oasis.md; re-sculpting the container edges would change approved §3 geometry — screenshot-review call.]*
7. **Palm belt / rock outcrop (`P`/`o`)** are sand + Collision only; palm and rock sprites are zones.js objects for the wiring agent (design §7 keys).
8. **Pre-existing, unrelated to this map:** LINT-9 `...lillypad-green-1-anim` has no PROP_CROP_REGIONS entry and LINT-8 entry `from_library` unwalkable-at-(20,3) — both also fire against the pre-rebuild map (old zones.js data; entry moves to (20,2) with the wiring pass).

All remaining lint ERRORs (21) are old zones.js/gatheringSpots.js coordinates checked against the new geometry — the Phase-2 wiring agents' queue.

---

## Review appendix — Phase 2 wiring notes (2026-07-03)

Logic layer wired to the new map: `src/data/zones.js` (spawn, objects re-dress, NPCs, all 25 interactables, exit tileRange [19,21], entry `from_library` (20,2), stepTriggers, subAreas), `src/data/gatheringSpots.js` (8 spots), `src/game/systems/CinematicIntroSequencer.js` (WORD_SPAWN → (20,16); Beat-2 pan → spawn (20,18); Beat-5 pan → Amira (19,16)). Deliberate deviations / open items, none silent:

1. **`spot_oasis_water_01` placed at (21,16), not the design's (21,15)** — resolves map-build note 1: the rim tile carries painted Collision (LINT-2 unconditional), so the spot sits 1 tile south on the walkable grass shore, still touching the rim. Design tile NOT changed in §5 (this appendix is the record).
2. **Camel omitted from the LAW-34 rest-stop vignette.** `camel-1` is a spritesheet (480×288 of 16×16 frames); `MapLoader.placeObjects` has no correct render path for spritesheet objects without a `PROP_CROP_REGIONS` row, and the crop-origin math assumes full-image frames (would anchor ~half a tile off). Adding the row = touching MapLoader crop machinery (out of Phase-2 scope). Vignette shipped as fire-pit + rug + water-sack + pots at (29–30,12–13); camel deferred to the screenshot-review phase (options: PROP_CROP_REGIONS row + origin fix, or ambient-spawner variant).
3. **Old lillypad object dropped** (`...lillypad-green-1-anim` at (20,15)) — not in the design; also clears the pre-existing LINT-9 (its crop region never existed).
4. **`buildOasisMap()` (procedural fallback ground) left as-is** — the authored Tiled map always wins for oasis_village (BootScene registers `map-oasis-village`); the fallback's old pool/grass geometry is dead code for ground but still feeds WorldSnapshot fixtures, which capture objects, not authored ground.
5. **Palm belt dressed as a SPARSE scatter (12 palms), not the grid's packed ring.** The lint enforces LAW-31's ≤15 non-flat props per 20×15 window with NO LAW-41 container exemption (lint-baseline-oasis.md finding 11 classifies the cap as REAL: "rebuild must respect the cap"), and §8.4's "palm belt exempt" claim is not implemented in the tool. A packed belt (~50+ sprites) fails LINT-4 in every window. Shipped: NW pocket 3, west edge 5, south edge 4, plus the design's decal tufts thinned 20→6 for the same budget. Collision still blankets every P cell from the map layer, so the belt walls the map even where unsprited. If the packed-ring LOOK is wanted, the exemption must first be added to lint + bible together (screenshot-review phase call).
6. **WorldSnapshot fixture for oasis_village must be regenerated** (`CAPTURE_WORLD_SNAPSHOTS=1 npx vitest run src/test/fixtures/captureViaVitest.test.js`) after this wiring — the objects/zones change breaks the stale fixture by design (pipeline §7).

---

## Review appendix — Phase 2 screenshot review + live probe (2026-07-03)

Live visual loop against the rendered zone (`npm run capture:world-screenshots` + zoomed/full-map probes → `docs/world-shots/oasis_village.png`, `oasis_village_fullmap.png`, `_probe_oasis_*.png`). Two fix iterations; all fixes verified by re-capture, `lint-world-map.mjs oasis_village` exit 0 (only the 3 accepted P2-2..P2-4 container WARNs), and a full green vitest run (290 files / 5793 tests) with the oasis WorldSnapshot fixture regenerated. Record, none silent:

1. **LINT-4 density fix (zones.js)** — the dressed south band was 1–2 props over LAW-31's ≤15/window cap (worst window 17 at (16,14)). Removed the mid-cluster `palm-tree-1` at (26,28) and the `desert-grass-props` tuft at (19,27) (vista keeps its bones dressing), and moved the south `fallen-palm-leaves` (22,27)→(23,26). Global window max is now exactly 15. Belt collision unchanged (map layer).
2. **Chest sprite remap (InteractableManager.js)** — the legacy `chest` mapping borrowed the desert-rocks TEAL water-ring pile (region 112,0), so `chest-ruins` (32,4) and `chest-hidden` (3,26) rendered as rocks-in-a-puddle on dry land. Remapped to the real Kenmi wooden chest (`kenmi-base-buildings-house-decor-chest-anim` frame 0). Affects chests in every zone (improvement); test expectation updated.
3. **Stall sprite remap (InteractableManager.js)** — `stall` mapped to a 32×64 pergola sliver, so Fatima's LAW-37 stall unit read as a tiny loom. Remapped to the design-manifested `market-stalls` sheet (blue-awning stall, 48×48 crop at ~2 tiles), per WORLD-MISSING-ASSETS #3.
4. **Interior-exit crash fix (SceneStackManager.js)** — the required door probe (spawn → road walk → `door-merchant-house` → InteriorScene → exit) found `popScene()` calling `scene.sys.scene.manager.getActiveScenes()`: Phaser 3 has no `getActiveScenes()` and `Scene` has no `.manager`, so EVERY live interior exit threw and stranded the player inside (pre-existing; unit mocks faked the nonexistent API). Fixed to `scene.scene.manager.getScenes(true)`; mocks/tests updated to the real API. Probe now green end-to-end: enter (10,21)→interior spawn (5,6)→exit back to (10,21), zero console errors.
5. **Yusuf/Khalid absent from captures is CORRECT behaviour** — `npcSchedules.js` places scholar-yusuf in ancient_library 08:00–17:00 and student-khalid there 07:00–12:00; at the capture hour only Amira + Fatima are due in-zone. No fix.
6. **26 `__MISSING`-texture children in the scene are invisible collider bodies** (palms/houses/well/rocks with `collide: true`) — verified `visible: false` on all; zero visible missing textures in any capture. No fix.
7. **Accepted as-is at screenshot level**: flat-cyan pool interior (foam anim still deferred, map-build note 3); subtle road/sand contrast (authored Ground-layer tile choice, lint-clean); sparse palm belt (wiring note 5); camel still deferred (wiring note 2); merchant interior's grass-patch floor is the UNCHANGED pre-existing interior layout (contract §8 — interiors out of Phase-2 scope).
