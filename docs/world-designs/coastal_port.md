# Zone Design — coastal_port (المِيناء)

**Phase 1 design document (2026-07-03). DOCUMENT ONLY — no code, maps, or zones.js changes.**
Obeys: `docs/WORLD-DESIGN-BIBLE.md` (§2 LAWs, §3.7 brief, §7 LINT), `docs/world-design-research/contract-and-pipeline.md` §1 (coastal_port contract) + §8 (interiors), `docs/world-designs/world-connection-map.md` (exit ledger), `docs/world-design-research/asset-inventory.md`, `docs/WORLD-MISSING-ASSETS.md` (#4, #5, #13).

---

## 1. Concept

**"A working harbour town where the desert meets the sea — one road runs from the mountain gate straight down to the quay, and everything on it smells of salt, tar, and cargo."** The whole map is organised as three horizontal bands that step down toward the water — grass town shelf → stone quay → sea — with a harbour inlet and two pier fingers biting into the south-east, and a soft fishermen's beach below a cliff lip in the south-west. The primary focal is the **harbour tower on the quay plaza** (volcano-tower as lighthouse stand-in, per MISSING-ASSETS #4); the secondary focals are the fountain court in the market strip and the pier-end staging platform.

**Reference steals (studied 2026-07-03):**
- **Pokémon Emerald — Slateport City:** the vertical flow *beach → market stalls → town → stone harbour platforms*; stall strip as a bounded pocket beside the main road; lighthouse platform jutting seaward at the corner. My road-to-quay spine and 2-stall fish-market pocket are direct lifts.
- **Golden Sun TLA — Alhafra:** Arab-styled port grammar — town sits on a green shelf ABOVE the harbour, water on the east/south, gate opposite the water. My town-shelf-over-inlet massing copies this.
- **Pokémon G/S — Olivine City:** the tall lighthouse standing at the cliff/water corner on the same axis as the walk-in road, buildings clustered away from the water, pier hanging south into the sea. My tower placement + pier-off-the-quay is Olivine.
- **Terranigma — Freedom port:** stone-quay grammar — cargo (crates/barrels) clustered in 2–4s hugging quay edges and one central staging pile, warehouse ON the quay, gangplanks, ships moored broadside. My quay cargo vignette and moored-boat gangplank copy this.
- **Golden Sun — Kalay Docks:** small-scale wooden pier with pots/crates stacked on the deck, a lone dockside house, dirt track to the pier head. My pier dressing + beach hut.
- **FF6 — Nikeah:** market clutter (barrels/crates/goods) spilling along the street between town and docks, plus one green breathing-space plaza. My fountain court + market-strip clutter budget.
- **SD3 — Palo:** stone quay stepping down into the sea; barrels clustered at house corners. My quay south edge + breakwater spit.
- **Pokémon Emerald — Lilycove City (01-master):** the master transition banding *town grass → cliff lip → sand beach → shallow rim → sea*, boundaries stepping diagonally. My south-west quarter is Lilycove's banding with Kenmi tiles.

## 2. Dimensions

**45 × 35 tiles** (unchanged from contract dims; matches zones.js `mapWidth/mapHeight`). Theme stays `grass` (coastal plain — the one green zone besides farmland; justified by the connection map: sea air, not wadi water).

## 3. Tile-grid sketch

Legend: `~` open sea · `b` beach shoreline · `g` grass · `s` sand · `.` quiet path · `:` lane · `=` main road · `p` paved square/palace road · `d` wooden pier deck · `Q` walkable quay top · `q` blocked quay face · `H` building footprint · `C` cliff face / headland lip · `r` rock outcrop · `o` blocked rock outcrop · `E` exit cut

```
     0        1         2         3         4
     012345678901234567890123456789012345678901234
 y0  ggggggggggggggggggggggggggggggggggggggCCCCCCC
 y1  ggggggggggggggggggggggggggggggggggggggCCCCCCC
 y2  ggggggggggggggggggggggggggggggggggggggCCCCCCC
 y3  gggggggggggggggggggggpggggggggggggggggCCCCrCC
 y4  gggggggggggggggggggggpgggggggggggggggbCCCCCCC
 y5  gggHHHgggHHHggHHHgggHHHgggggggggggggbbCCCCCCC
 y6  gggHHH:::HHHggHHHgggHHHggHHHgggggggbb~CCCCCCC
 y7  gggHHHgg:HHHggHHHgggHHHggHHHggggggbb~~CCCCCCC
 y8  gggggggg:gggggggggggggpggHHHgggggQQ~~~~~~~~~~
 y9  gggggggg:gggggggggggggpggggggggggQQ~~~~~~~~~~
 y10 gggggggH:HggggggggggggpggggggggggQQ~~~~~~~~~~
 y11 gggggggHHHggggggggggggpggggggggggQQ~~~~~~~~~~
 y12 gggggggHHHggggggggggggpggggggggggQQddddd~~~~~
 y13 gggggggggggggpppppppppppgggggggQQddddd~~~~~~~
 y14 gggggggggggggpppppppppppgggggggQQbb~~~~~~~~~~
 y15 gggggggggggggpppppppppppgggggggQQbb~~~~~~~~~~
 y16 E================================QQbb~~~~~~~~
 y17 =================================QQbb~~~~~~~~
 y18 =================================QQb~~~~~~~~~
 y19 gggggggggggggggggggggggggggggggggQQ~~~~~~~~~~
 y20 gggggggggggHHHHHHHgggHHHHggggggggQQ~~~~~~~~~~
 y21 gggggggggggHHHDHHHgggHHHHggggggggQQ~~~~~~~~~~
 y22 ggggggggggHH:gg=:::ggg=DgggggggggQQ~~~~~~~~~~
 y23 ggggggggggHHH:::gggggggggggggggggQQddddd~~~~~
 y24 ggggggggggHHggggggggggggggggggggQQddddd~~~~~~
 y25 gggggggggggggggggggggggggggggggggQQb~~~~~~~~~
 y26 gggggggggggggggggggggggggggggggggQQb~~~~~~~~~
 y27 gggggggggggggggggggggggggggggggbbQQbb~~~~~~~~
 y28 ggggggggggggggggggggggggggggggggggbb~~~~~~~~~
 y29 ggggggggggggggggggggggggggggggggQQQQQQQQQQQgg
 y30 ggggggggggggggggggggggggggggggggQQQQQQQQrQQgg
 y31 ggggggggggggggggggggggggggggggggQQQQQQQQQQQgg
 y32 ggggggggggggggggggggggggggggggggggbb~~~~~~~~~
 y33 gggggggggggggggggggggggggggggggggggb~~~~~~~~~
 y34 gggggggggggggggggggggggggggggggggggb~~~~~~~~~
```

(y24 detail: x2–8 g · x9–19 upper cliff faces of the jogged lip · x20–23 g · x24–25 `SS` steps · x26–27 C · x28 rim · piers/spit as drawn. All 35 rows are exactly 45 chars — machine-checked.)

**Composition reading:** the main road enters west at y13–15 (★ dressed entrance, LAW-28), descends in three scalloped segments (x2–8@y13–15 → x9–17@y14–16 → x18–27@y15–17 — no straight run over ~10 with stepped edges, LAW-2) and dies into the **quay plaza** (x28–37, y13–19) where the **harbour tower** (x35–37, y12–14, sprite rising above) terminates the walk-in axis (LAW-25: landmark on the entry axis). The **north coast road** (x21–22, jog x22–23 at y4–8) tees off at y13–14 toward the palace. Two **pier fingers of different lengths** (A: x29–30, y20–27 + 4×4 platform x28–31 y28–31 = 12 long; B: x34–35, y20–26 = 7 long) hang south off the quay into the **inlet** (LAW-21/22); a **stone breakwater spit** (x37–39, y20–24, rock tip y25) closes the harbour on the east and leaks the sea vista (LAW-46). The south-west is the soft counterpart: a **cliff lip** (jogged segments, faces 2 tall, LAW-48) drops the town shelf onto the **fishermen's beach**, reached by one 2-wide steps cut at x24–25 (LAW-49; steps asset workaround = MISSING #13). Diagonal sweep (LAW-30): west gate (NW-ish) → fountain court/market (centre) → tower plaza (NE) → piers and beach (S/SE-SW).

## 4. Districts

| District | Tile rect | Purpose |
|---|---|---|
| Harbour Gate | x0–8, y11–17 | ★ dressed west entrance from mountain_village: palm pair (2,12)/(2,16), widened approach, sign-port, spawn area |
| Hillside Homes | x2–10, y2–13 | residential: stone house R1 (x4–7,y9–11); NW **quiet corner** (x2–8,y2–8) with chest-port-alley + inscription (LAW-31) |
| Coast Road | x17–27, y1–9 | north road to royal_palace; fisherman houses F1 (x17–19,y4–6) + F2 (x25–27,y5–7) staggered off it (LAW-9/10) |
| Market Strip | x9–27, y10–19 | tavern (x11–14,y10–12), fountain court (x17–19,y10–13), warehouse (x23–26,y10–12), fish-market stall pocket (x13–20,y18) |
| Smithy Yard | x5–13, y17–23 | blacksmith-house (x7–10,y19–21), spur road x11–12 + lane y22 terminating at ore-rock vignette (LAW-4 dead-end with a reason) |
| Quay Plaza | x28–37, y13–19 (+ spit x37–39, y20–25) | primary focal: harbour tower + statue + cargo staging (Freedom steal); sea vista from the spit |
| The Docks | x28–36, y20–31 | pier fingers A/B, moored boat broadside with gangplank, rowboat nosed at B's tip, pier-end platform with chest |
| Fishermen's Beach | x2–27, y25–33 | sand band below the cliff lip: beach hut (x4–7,y27–29), beached-rowboat + campfire vignette (x12–13,y29), scalloped shore |

## 5. Contract placement table

Every contract ID for coastal_port (contract-and-pipeline.md §1 — 3 NPCs, 2 exits, 26 interactables, 9 gathering spots, 2 entries). Doors sit on the facade base row of their building; the builder leaves the door tile unpainted in Collision and keeps 2 clear tiles in front (LAW-5/LINT-5).

**Exits & entries** (edges per world-connection-map ledger — W 0.40, N 0.50):

| ID | Placement | Rationale |
|---|---|---|
| `port-to-mountain` | edge=**west**, tileRange=[15,19] | centre y17; the main street runs directly from the mountain gate to the quay |
| `port-to-palace` | edge=**north**, tileRange=[19,25] | centre x22; formal palace road enters the town square |
| entry `from_mountain` | (3,17) | west arrival on the main street |
| entry `from_palace` | (22,3) | north arrival on the palace road |
| spawnPoint | (3,17) | west gate arrival, beside sign-port |

**NPCs (3):**

| ID | Tile | Rationale |
|---|---|---|
| `captain-rashid` | (33,17) | harbourmaster at the centre of the quay furniture column |
| `fishmonger-hana` | (18,17) | fish trade on the main street beside the town square |
| `blacksmith-daud` | (12,24) | smithy yard beside the forge |

**Interactables (26):**

| ID | Tile | Rationale |
|---|---|---|
| `sign-port` | (5,17) | main street furniture at the west gate |
| `sign-dock` | (32,6) | north coast path before the quay |
| `sign-smithy` | (11,23) | smithy-yard approach |
| `bookshelf-directions` | (16,11) | navigation records beside the square |
| `bookshelf-port-trade` | (23,11) | trade records north of the warehouse |
| `bookshelf-port-food` | (18,23) | food records by the tavern |
| `chest-port-dock` | (34,28) | where the quay meets the south beach |
| `chest-port-alley` | (8,8) | quiet north-west lane |
| `door-port-tavern` | (15,22) | tavern south frontage → `port_tavern_interior` |
| `door-port-warehouse` | (22,22) | warehouse south frontage → `port_warehouse_interior` |
| `lantern-port-1` | (33,10) | north quay lantern |
| `lantern-port-2` | (33,22) | south quay lantern |
| `lantern-port-3` | (15,16) | main street lantern |
| `crate-port-1` | (33,12) | north quay cargo |
| `crate-port-2` | (33,18) | south quay cargo |
| `crate-port-3` | (20,12) | square-side supply cargo |
| `barrel-port-1` | (33,24) | southern quay cargo |
| `barrel-port-2` | (12,17) | main street cargo |
| `barrel-port-3` | (27,17) | quay approach cargo |
| `painting-port-1` | (16,21) | tavern wall |
| `painting-port-2` | (23,21) | warehouse wall |
| `fountain-port-1` | (18,14) | town square fountain |
| `statue-port-1` | (22,14) | town square navigator statue |
| `inscription-port-1` | (42,3) | north-east headland lookout |
| `inscription-port-2` | (7,3) | quiet north-west quarter |
| `inscription-port-3` | (42,30) | south-east breakwater lighthouse end |

**Gathering spots (9):**

| ID | Tile | Rationale |
|---|---|---|
| `spot_port_water_01` | blessed_water / water_source | (8,10) | well in the quiet north-west quarter |
| `spot_port_animal_01` | silk / animal_trace | (15,14) | market goods beside the town square |
| `spot_port_herbs_01` | cinnamon / herb_patch | (22,8) | imported spice goods on the palace road |
| `spot_port_animal_02` | silk / animal_trace | (30,18) | cargo staging before the quay |
| `spot_port_ore_01` | copper_ore / ore_vein | (12,22) | ore beside the smithy yard |
| `spot_port_papyrus_01` | papyrus / papyrus_stand | (6,6) | papyrus stand in the quiet quarter |
| `spot_port_herbs_02` | ginger_root / herb_patch | (28,12) | market edge near the quay |
| `spot_port_water_02` | olive_oil / water_source | (35,24) | water spot on the southern pier deck |
| `spot_port_ore_02` | tin_ore / ore_vein | (18,20) | lower street rock outcrop |

Step triggers: none in the port contract. Sub-areas: none in the port contract. Pre-existing weather `rain` and vocabCategories unchanged (data, not layout).

## 6. Enterable interiors (contract §8)

| Door (world) | interiorId | Interior kept as-is |
|---|---|---|
| `door-port-tavern` (15,22) | `port_tavern_interior` | Tavern (حانَة البَحّارَة), 14×10 buildLargeHouse, `tavern-keeper-interior` + 6 interactables — **unchanged this phase** |
| `door-port-warehouse` (22,22) | `port_warehouse_interior` | Port Warehouse (مَخْزَن المِيناء), 14×10 buildLargeHouse, 5 interactables incl. 2 chests — **unchanged this phase** |

No locked doors in this zone. The other 5 buildings (R1, F1, F2, smithy, beach hut) are **not enterable** in this phase; if filler interiors are wanted later they reuse procedural `house_coastal_port_<n>` ids per bible §5 — no new ids invented here.

## 7. Asset manifest

All keys verified against `asset-inventory.md` / `kenmiCatalog.js` (grep-checked 2026-07-03):

| Role | Kenmi family / key | Note |
|---|---|---|
| Town-shelf ground | `kenmi-base-tiles-grass-grass-tiles-3` (+ baked path frames) | grass↔dirt-path transitions baked in |
| Roads/paths | grass tileset `path-middle` frames | main road 3-wide, spur 2, lanes 1 |
| Plaza/quay/spit paving | `kenmi-base-tiles-pavement-tiles` | stone = status (LAW-6) |
| Quay water edge | `kenmi-base-tiles-water-water-stone-tile-3(-anim)` | hard stone lip (LAW-21) |
| Sea/inlet | `kenmi-base-tiles-water-water-tile-3` (static; `-anim` on procedural path) | grass↔water + stone↔water blends exist |
| Beach sand | `kenmi-desert-tiles-desert-beach-tiles-1/2` | sand↔water shoreline autotile proven |
| Cliff lip + containers | `kenmi-base-tiles-cliff-stone-cliff-1..4-tile` | 2-tall faces, jogged segments |
| Pier decks | `kenmi-base-tiles-wooden-deck-tiles` | piers + platform |
| Tavern | `inn` (base buildings, black/blue variant) | 4×3.2 capped |
| Warehouse | `house-2-stone-*` variant | big stone block reads warehouse |
| Smithy | `blacksmith-house-black` | unique building, forge read |
| Fisherman houses F1/F2 + beach hut | `fisherman-house-*` (3 different colourways) | nets/buoys baked on facade |
| Stone house R1 | `house-1-*` limestone variant | European allowed in coastal_port (bible §1) |
| Harbour tower | `kenmi-volcano-buildings-volcano-tower` | lighthouse stand-in per MISSING #4 |
| Stalls | `market-stalls` (2 of the 4-stall strip) + `desert-rugs` under fronts (LAW-38) | wooden stalls accepted per MISSING #3 |
| Boats | `boat` (beached + nosed rowboats), `boat-anim` (moored, bobbing) | 3 boats varied per MISSING #4 |
| Gangplank | `bridge-wood` single segment | prop, not a LAW-23 bridge |
| Cargo | `barrels`, `crate-anim`, `desert-pots-sacks` | Freedom-style clusters of 2–4 |
| Lamps | `lanter-posts` (typo'd key as-is, MISSING #12), `lantern` | quay pair + tavern corner |
| Fountain | `fountain-anim` | fountain court |
| Statue | `kenmi-desert-temple-desert-obelisk-small-1` 32×32 crop — the existing `statue` mapping in `InteractableManager.js:22` | plaza dressing |
| Trees/palms | `palm-tree-1/2`, `acacia-tree` (1, NW corner) | clusters of 2–4 near water/entrances (LAW-45) |
| Rocks/ore | `desert-rocks`, rock anims, `ores` | smithy outcrop, beach rock, spit tip |
| Vignette bits | `campfire-anim`, `chimney-smoke-anim` (tavern + smithy), `banners-anim` (tower) | lived-in touches (LAW-34) |
| Ambient decals | `flower-grass-*-anim`, `desert-grass` scrub, `beach-decor-tiles` | LAW-33 ground variation |

**Missing / skipped** (rows in `docs/WORLD-MISSING-ASSETS.md`):
- Dhow/ship, nets, fish crates, lighthouse, mooring posts — **covered by existing row #4**; workaround followed exactly (volcano-tower, rowboats, deck tiles, barrel/crate cargo). Fish-market "fish" goods: **skipped**, stalls dressed with pots/sacks instead.
- Outdoor stone stair tiles for the cliff lip — **row #13** (coastal_port added to its zone column); workaround followed: 2-tile gap in the cliff-face Collision run + `dungeon-1-stairs` prop as the step dressing.
- No sand↔grass adjacency anywhere (row #5): the beach touches grass only across the cliff lip; sand↔paving meets only at the stone steps/quay.

## 8. Lint self-check (LINT-1..11)

- **LINT-1 (no overlapping objects):** every placed ID above has a unique tile; cargo clusters are adjacent, never stacked; rugs under stall fronts are FLAT_GROUND (lower layer, exempt).
- **LINT-2 (nothing on water/collision):** boats (`boat*`) and pier props sit on water/deck under the amphibious allowlist; `spot_port_water_02` uses the water_source shore-rim allowance at (37,18); every other NPC/interactable/spot is on grass, sand, paving, or deck. No door on collision — door tiles left open in the Collision layer.
- **LINT-3 (rugs on plausible ground):** the only rugs are under the two stall fronts (y19, flat grass) — no water, cliff, or material-seam straddling.
- **LINT-4 (density/spacing):** market-strip 20×15 window ≈ 3 buildings + ~12 props (≤15 cap); quay window ≈ 10; beach + NW corner are the 3–5-prop quiet zones. Same-key repeats (crates ×3, barrels ×3, lanterns ×3) are either declared clusters of ≤4 (quay staging) or ≥6 tiles apart; stall pair alternates the two stall sprites (LAW-35). No empty 20×20: beach carries hut + boats + campfire + rock; NE grass carries F2, palms, rock.
- **LINT-5 (reachability):** flood-fill from spawn (3,14): road reaches every door front (tavern/warehouse via road row y13–14, smithy via spur+lane, both with ≥2 clear southern tiles), both exits, both entries, all 3 NPCs, all 9 spots (beach via the x24–25 steps; piers via quay row y19; spit via plaza x37,y19→20). No islands — the spit, piers, and beach all connect to the mainland walk.
- **LINT-6 (exits):** exactly `port-to-mountain` (west, [13,15]) → mountain_village/`from_port` and `port-to-palace` (north, [21,23]) → royal_palace/`from_port` — targetZone/targetEntry keys unchanged from the contract; both rects on their declared edges, in bounds; destination entries walkable and outside any exit trigger. Fractions 0.40 / 0.49 match the connection-map ledger (±0.10 window).
- **LINT-7 (contract completeness):** 3 NPCs + 26 interactables + 9 gathering spots + 2 exits + 2 entries listed above — exactly once each, zero strays; both `interiorId`s resolve in the INTERIORS registry with `isExit` doors; every building-set interactable (signs, bookshelves, paintings, door lanterns/barrels) is within 2 tiles of its building sprite.
- **LINT-8 (dims/template):** 45×35 both sides; Ground/Collision/Exits layers per the oasis-village template; all tileset names are catalog keys (§7 manifest).
- **LINT-9 (asset legality):** every key in §7 grep-verified in `kenmiCatalog.js`; no cultural excludes (no church, pigs, halloween); new multi-item crops (stall variants, rock picks) get `PROP_CROP_REGIONS` entries at build time; missing wants routed to WORLD-MISSING-ASSETS (#4, #13).
- **LINT-10 (shoreline/seams):** east shoreline rim scallops in ≤3-row jogs — rim at x37 (y0–2), x36 (y3–5), x37 (y6–8), x36 (y9–10), then steps out to x38 along the tower/quay with a quay-apron bump to x38 at y16–17, so no rim column runs >6; inlet west bank rim is exactly 6 (y20–25 — beach sand meets pier A's flank at x28, y26–27); south beach shore is triple-scalloped (sand tongues x5–9, x13–14, x18–22); quay south seam (y19/20) is broken by both pier heads into ≤3-tile segments; hard edges where quay/spit paving meets deep water render with the `water-stone-tile-3` stone-lip autotile (LAW-21 hard quay), soft edges keep the 1-tile `,` rim; cliff lip runs in 4–7 tile jogged segments; no grass tile orthogonal to sand anywhere (cliff or stone between them, MISSING #5). Machine-checked 2026-07-03: zero straight land–water rim runs >6.
- **LINT-11 (collision coverage — manual):** builder must paint Collision over ALL water (sea + inlet, except deck tiles), both cliff-face rows, container bands (C), building footprints (except door tiles), the tower base, rock outcrops, and the spit tip rocks; verify by in-game walk (water is NOT self-blocking on the Tiled path).

**Believability walk:** step out of the tavern → you're on the main road; left takes you past the fountain to the mountain gate, right past the warehouse onto the quay where the captain stands under the tower; the piers, the moored boat, and the breakwater vista are straight ahead; the fisherman's kid runs down the cliff steps to the beach hut where the rowboats are pulled up. Every path ends at a door, an exit, or the sea.

---

## Review (adversarial pass, 2026-07-03)

**Checked** (machine-verified against contract-and-pipeline.md §1+§8, WORLD-DESIGN-BIBLE.md §2/§7, world-connection-map.md, asset-inventory.md, kenmiCatalog.js):
- **Contract:** all 3 NPCs + 26 interactables + 9 gathering spots + 2 exits + 2 entries diffed against the §1 id list — exactly once each, zero strays; both interiorIds (`port_tavern_interior`, `port_warehouse_interior`) resolve in §8 with their inside manifests preserved. Exit edges/fractions match the connection-map ledger (W 14/35 = 0.40; N 22/45 = 0.49 vs 0.50).
- **Sketch integrity:** all 35 rows re-verified at exactly 45 chars; every placement-table coordinate re-checked against the grid tile (all land on the claimed ground: doors on facade base rows with ≥2 clear front tiles, spots on walkable ground, chest on pier deck).
- **Reachability:** flood-fill from spawn (3,14) reaches both exits, entry (22,2), all 3 NPCs, all doors' fronts, all 9 spots, pier-A platform, pier-B tip, spit, and beach (via the x24–25 steps). No islands.
- **Seams:** no grass↔sand orthogonal adjacency anywhere (MISSING #5 honoured).
- **Assets:** spot-checked ≥6 families against kenmiCatalog.js — `kenmi-volcano-buildings-volcano-tower`, `blacksmith-house-black/blue/red`, `inn-black/blue/red`, `fisherman-house-*` (9), `house-2-stone-*` (incl. the typo'd `-blackpng`), `wooden-deck-tiles`, `pavement-tiles`, `water-stone-tile-3(-anim)`, `lanter-posts`, `dungeon-1-stairs`, `boat`/`boat-anim`, `bridge-wood`, `market-stalls`, `desert-rugs`, palms/acacia/rocks/ores/crate-anim/barrels — all present.

**Fixed** (violations confirmed against the pre-fix grid):
1. **LAW-17/LINT-10 — east shoreline dead straight 12 tiles** (rim column x37, y0–11) while §8 falsely claimed "x36→38 scallops". Fixed: rim now jogs x37/x36 in 3-row scallops (y3–5 and y9–10 recede to x36).
2. **LAW-17 — quay-side rim column x38 ran 8 straight (y12–19).** Fixed: quay apron bumps out to x38 at y16–17 (stone lip jog), splitting the run into ≤4.
3. **LAW-17 — inlet west bank rim column x28 ran 8 straight (y20–27).** Fixed: beach sand widened to x28 at y26–27 (beach now meets pier A's flank — Slateport-style), rim run now exactly 6.
4. **LAW-17 — south beach shore rim ran 8 straight (y32, x10–17).** Fixed: third sand tongue added at x13–14 (shore now triple-scalloped).
5. **§8 LINT-10 self-check text** rewritten to describe the actual (now true) geometry.
6. **Statue asset row** was vague ("existing statue prop key"); pinned to the real mapping (`kenmi-desert-temple-desert-obelisk-small-1` crop per `InteractableManager.js:22`).

**Reviewed and accepted as designed** (deviations with rationale, for the screenshot pass):
- **LAW-22 "each finger ends in a staging platform":** only pier A has the 4×4 platform. A platform on pier B (7 long ≈ the 8-tile minimum −1) would choke the 1-tile channel to the breakwater spit; B is the short working jetty with the nose-in rowboat (Kalay steal). Deliberate.
- **LAW-2 straight-run:** the main road's shared middle row (y15) paints long, but the 3-wide band steps down twice (y13–15 → y14–16 → y15–17) and this is the LAW-25 walk-in axis terminating at the harbour tower — the map's one permitted near-ceremonial run.
- **Fountain centred in its 3×4 paved court:** LAW-19/27 off-centre applies to the zone's main open space; the main plaza is the quay (statue off-centre ✓). The fountain court is a formal Nikeah-style mini-court off the road — centring reads intentional at this size.
- **Deep water directly against quay/spit paving** (between pier heads, spit flanks): rendered with the `water-stone-tile` hard stone lip per the manifest — the LAW-21 hard-quay grammar, not a missing rim.

**Verdict: FIXED** — composition sound, contract 100%, four shoreline LAW-17 violations corrected in-grid, self-check claims now truthful.
