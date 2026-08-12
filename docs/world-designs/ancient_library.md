# Zone Design — ancient_library (المَكتَبَة القَديمَة)

**Phase 1 design document (2026-07-03). DOCUMENT ONLY — no code, maps, or zones.js changes.**
Obeys: `docs/WORLD-DESIGN-BIBLE.md` (LAW-1..51, zone brief §3.2), `docs/world-design-research/contract-and-pipeline.md` §1 + §8, `docs/world-designs/world-connection-map.md` (exit ledger), `docs/world-design-research/asset-inventory.md`.

---

## 0. Reference study — what the composition steals

Images read from `/Users/theshumba/Desktop/Gogo-World-References/` (7):

| Reference | What this design steals |
|---|---|
| `08/ff5-snes-ancient-library-fullmap.png` | The exterior panel: ONE solitary monumental building owning the whole map — massed central facade with symmetric side wings, single bottom-centre entrance. → My desert-temple facade with bookshelf-bank "wings" and obelisk pair, top-centre on a raised dais. |
| `08/arabian-nights-snes-silver-shrine-fullmap.png` | Bottom-centre panel: shrine facade earned by a long winding climb out of raw desert, vegetation flanking only the final approach. → My south pilgrim track: bare dunes that wind, then a gate, then the formal axis. |
| `08/golden-sun-lama-temple-fullmap.png` | Temple at top, water thread running down the approach, a mini-focal crossing en route, monks posted along the path. → Fountain forecourt the axis skirts; librarian posted at the foot of the steps greeting pilgrims. |
| `08/dq3-snes-desert-shrine-fullmap.png` | The tiny scholarly hermitage — bed, bookshelf, pots, one room. → My scribe corner: a small study annexe (door-library-study) with a workaday papyrus-stand vignette outside. |
| `04/dq3-snes-isis-arabian-palace-town-fullmap.png` | Carpeted ceremonial axis into the holy building; green garden insets set INSIDE a stone precinct (grass only where tended/watered). → Rug runners on the axis; reading-garden scrub blob hugging the fountain, sand everywhere else. |
| `04/vectoraith-arabian-palace-walled-garden-courtyard.png` | The whole precinct grammar: wall container hugging the composition, banner/statue-lined straight approach with mirrored pairs ON the axis only, asymmetric palm clusters off-axis, facade top-centre. → My gate stubs + lantern pair + statue pair + torch pairs stacked up the axis; everything off-axis staggered. |
| `04/zelda-lttp-eastern-palace-grounds.png` | Statue-lined outdoor "rooms" — walled sub-courts off the main approach used as open-air chambers. → My two shelf courts: bookshelf banks used as outdoor architecture forming open-air reading yards flanking the forecourt. |

## 1. Concept

A solitary house of wisdom alone in the dunes — the only building on the horizon, earned by a
long south pilgrim track that passes a gate, a fountain forecourt, and a torch-paired stone axis
before climbing two steps to the temple facade (LAW-29). The identity sentence: **"a walled
reading precinct at the end of a dune road."** It channels FF5's Ancient Library (one monumental
building, wings, single entrance), the VectoRaith walled-garden approach (mirrored pairs on the
axis, informal palms off it), and Zelda's Eastern Palace grounds (open-air shelf courts as
outdoor rooms); the DQ3 desert shrine gives the scribe-corner intimacy. Quiet zone: LAW-39
emptiness, `mist` weather, 5–8 props per screen off the axis.

## 2. Dimensions

**35 × 30 tiles** (x 0–34, y 0–29) — unchanged per bible §3.2 and contract (`mapWidth/mapHeight`
must stay equal to zones.js dims). Map-north = screen-top. spawnPoint **(17,27)** = `from_oasis`.

## 3. Tile-grid sketch

Legend: `.` plain desert sand · `=` tan cobble-road-2 precinct floor and approach · `g` small
desert scrubgrass garden · `#` desert wall · `T` single temple · `H` study annexe · `D` door ·
`i` inscription · `z` ruin/rock dressing · `*` gathering spot or contract mark · `E` exit cut.
Pavement is reserved for compact straight architectural slabs and is not used as a patch.

```
      x0        x10       x20       x30
y0    ...................................
y1    ...................................
y2    ...............=========.........i.
y3    ...............=TTTTTTT=...........
y4    ...............=TTTTTTT=...........
y5    ..i.....z......=TTTTTTT=...........
y6    .......z.z.....zTTTTTTT=...........
y7    ...............=TTTTTTT=...........
y8    ......HHH========*=========........
y9    ......HHH======.....=======........
y10   ......HHH======.....=======.*......
y11   ......HHH======..*..=======........
y12   ......HHD==================........
y13   .........==================........
y14   .....i...==================........
y15   .........========================E.
y16   .........=========================.
y17   ...........*.=gggFggg=============.
y18   .....*.......=ggggggg=.............
y19   .............=ggggggg=.............
y20   .............=ggggggg=.............
y21   .............=ggggggg=.............
y22   .............###===###.............
y23   ................===................
y24   ................===..........*.....
y25   ................===.*.........z....
y26   ................===................
y27   ................===................
y28   ................===................
y29   .................E.................
```

Composition notes (the walk):
- **South pilgrim approach:** a three-tile cobble road rises from spawn `(17,27)` to the single
  wall opening at x16–18, widening into the threshold; the gate sign is `(17,23)`.
- **North axis:** one temple occupies the north precinct, with archive door `(20,8)` and
  phrases shelf `(17,8)` at the steps. Ruined pillars, arches and obelisks keep it from reading
  as an isolated sprite.
- **Reading courts:** west and east courts use cobble floor as contained outdoor rooms, with
  varied shelf dressing and the study annexe threshold at `(8,12)`.
- **Central court and garden:** the fountain `(17,13)` anchors the cobble court; a compact scrub
  blob south of it is the only green ground in the zone.
- **East scholars' road:** a cobble approach runs from the east edge entry `(33,15)` to the
  precinct side, while the southeast remains a sparse ruin pocket around the hidden chest.

## 4. Districts

| District | Tile rect (x,y,w,h) | Purpose |
|---|---|---|
| North Temple Precinct | (15,2) 9×7 | Single monumental temple, archive steps, phrases shelf, ruined pillars, arches and obelisks. |
| West Reading Court | (6,8) 9×5 | Open-air shelf room with numbers shelf, sign, crate, painting and papyrus stand. |
| East Reading Court | (20,8) 9×8 | Distinct shelf room with colors shelf, barrel, painting and vellum stand. |
| Central Court | (9,12) 18×5 | Tan cobble precinct floor, fountain, statues and scribe work corner. |
| Reading Garden | (14,17) 7×5 | Compact desert scrubgrass blob fed by the fountain, with pots and lantern edges. |
| South Threshold | (13,22) 9×2 | Desert wall run with one x16–18 opening and gate sign. |
| Pilgrim Approach | (16,23) 3×7 | Cobble path from spawn to the gate, with lantern and basin. |
| Scholars' Road (east) | (22,15) 13×3 | Cobble road from the east entry to a side entrance in the precinct wall. |
| Quiet Ruins (SE) | (28,24) 5×5 | Sparse rocks and ruins around the hidden chest. |

(Contract defines no `subAreas` for this zone — none invented.)

## 5. Contract placement table

Every ID from contract-and-pipeline.md §1 for ancient_library — placed exactly once.

**NPCs (2)**

| ID | Tile | Rationale |
|---|---|---|
| `librarian-ibrahim` | (17,11) | Between the two reading courts on the central axis, gatekeeper of the archive. |
| `scribe-amina` | (12,16) | At a working corner on the west side of the central court. |

**Exits (2)** — edges per world-connection-map ledger

| ID | Edge / tileRange | Target | Rationale |
|---|---|---|---|
| `library-to-oasis` | edge=south, tileRange **[15,19]** | oasis_village / `from_library` | Main threshold and pilgrim approach. |
| `library-to-marketplace` | edge=east, tileRange **[12,18]** | desert_marketplace / `from_library` | Scholars' road and side entrance. |

**Entries (keys preserved):** `from_oasis` → (17,27) (also the spawnPoint); `from_marketplace` → (33,15). Neither sits in another exit's trigger range.

**Interactables (24)**

| ID | Type | Tile | Rationale |
|---|---|---|---|
| `sign-library-gate` | sign | (17,23) | At the central opening in the south precinct wall. |
| `sign-reading-room` | sign | (14,11) | At the west reading court mouth. |
| `bookshelf-numbers` | bookshelf | (11,11) | West reading court anchor. |
| `bookshelf-colors` | bookshelf | (24,11) | Set into the east court's north bank, mirror-role of numbers. |
| `bookshelf-phrases` | bookshelf | (17,8) | At the top of the temple steps. |
| `chest-library` | chest | (7,6) | NW ruin cluster among fallen pillars and rubble. |
| `chest-library-hidden` | chest | (30,25) | SE ruin pocket among rocks. |
| `door-archive` | door → `library_archive_interior` [locked: `library_access_granted`] | (20,8) | The temple door terminating the axis. |
| `door-library-study` | door → `library_study_interior` | (8,12) | Study annexe threshold west of the reading courts. |
| `fountain-library-1` | fountain | (17,13) | Central court focal point and garden water source. |
| `statue-library-1` | statue | (15,15) | West statue facing the axis. |
| `statue-library-2` | statue | (19,15) | East statue facing the axis. |
| `painting-library-1` | painting | (12,9) | West court architectural dressing. |
| `painting-library-2` | painting | (22,9) | East court architectural dressing. |
| `lantern-library-1` | lantern | (11,17) | West edge of the garden. |
| `lantern-library-2` | lantern | (23,17) | East edge of the garden. |
| `lantern-library-3` | lantern | (17,26) | Pilgrim approach marker. |
| `crate-library-1` | crate | (9,10) | Manuscript crate in the west reading court. |
| `barrel-library-1` | barrel | (25,10) | East court scholars' clutter. |
| `pot-library-1` | pot | (14,19) | Garden dressing. |
| `pot-library-2` | pot | (20,19) | Garden dressing. |
| `inscription-library-1` | inscription | (33,2) | Isolated weathered stone in the far north-east. |
| `inscription-library-2` | inscription | (5,14) | Weathered stone outside the west precinct wall. |
| `inscription-library-3` | inscription | (2,5) | Remote north-west ruin inscription. |

Locked-door contract carried: `door-archive` keeps `library_access_granted`; interiorIds unchanged.

**Gathering spots (7, flag stays true)**

| ID | Resource/type | Tile | Rationale |
|---|---|---|---|
| `spot_library_papyrus_01` | papyrus / papyrus_stand | (12,8) | Papyrus stand beside the west reading court. |
| `spot_library_papyrus_02` | vellum / papyrus_stand | (28,10) | Vellum stand in the east reading court. |
| `spot_library_papyrus_03` | paper / papyrus_stand | (15,6) | Papyrus stand beside the temple steps. |
| `spot_library_herbs_01` | lavender / herb_patch | (5,18) | Herbs outside the west garden wall. |
| `spot_library_ore_01` | lapis_lazuli / ore_vein | (35,22) | Frozen out-of-bounds contract coordinate; runtime handling is documented below. |
| `spot_library_water_01` | rosewater / water_source | (20,25) | Basin or well beside the pilgrim approach. |
| `spot_library_animal_01` | wool / animal_trace | (8,12) | Traffic trace at the study-annexe threshold. |

No stepTriggers exist for this zone in the contract; none added.

## 6. Enterable interiors

Exactly the contract door list (§8) — both interiors keep their existing hand-crafted layouts
this phase; only the exterior door tiles move (return-point wiring is automatic, §8):

| Exterior door (new tile) | interiorId | Existing layout kept |
|---|---|---|
| `door-archive` (17,8), locked `library_access_granted` | `library_archive_interior` | Archives, 16×12 buildLibraryRoom, `librarian-interior` + 8 interactables incl. `exit-door` |
| `door-library-study` (10,21) | `library_study_interior` | Study Room, 10×8 buildSmallHouse, 5 interactables incl. `exit-door` |

No new enterable filler houses added (the study annexe is the only other building and it IS the
study door's building). The dais district stays roomy enough for a future letter-school hall
(connection-map §5 obligation) without breaching LAW-11.

## 7. Asset manifest

All keys verified present in `docs/world-design-research/asset-inventory.md` / kenmiCatalog:

| Grid use | Kenmi family / key | Verified |
|---|---|---|
| Sand ground (3 hues) | `desert-tiles-desert-beach-tiles-1/2/3` | ✓ §1 |
| Trampled track/road `d` | darker hue of the same beach-tile set (LAW-6 soft paving) | ✓ §1 |
| Stone axis/plaza/dais `S` | `pavement-tiles` (9×8) | ✓ §1 roads/paving |
| Container cliffs `C` | `desert-tiles-desert-cliff-tiles-1..3` | ✓ §1 |
| Scrub grass `g` | `desert-tiles-desert-grass` (scrub↔sand blend exists) | ✓ §1 |
| Temple facade `T` | `desert-temple` (128×128 → 4×4 tiles) | ✓ §2 |
| Study annexe `H` | `desert-house-1.x` (2.5×2.5) | ✓ §2 |
| Dais rim / gate stubs `w` | `desert-fencewall` | ✓ §2 |
| Obelisks `o` | `desert-obelisk-1/2` (+`-small` for gate posts if wanted) | ✓ §2 |
| Bookshelf banks `b` | house-decor `bookshelves` (192×112, multiple designs — alternate variants per LAW-35) | ✓ §4 |
| Fountain `F` | `fountain` / `fountain-anim` | ✓ §3 water |
| Torches `t` | `big-torch-anim` / `torch-anim` | ✓ §3 market |
| Lanterns `L` | `lantern` / `lanter-posts` (typo'd key, use as-is) | ✓ §3 |
| Rugs `r` | `desert-rugs` (FLAT_GROUND) | ✓ §3 |
| Palms `P` | `palm-tree-1/2` | ✓ §3 nature |
| Bones/rocks `z` | `desert-bones`, `desert-rocks` | ✓ §3 |
| Camel `M` | `camel-1..3` (explicit zone object — ambient spawner is OFF) | ✓ §5 |
| Pots/sacks decor | `desert-pots-sacks`, `golden-pots` | ✓ §3 |
| Barrel/crate/chest/sign | `barrels`, `crate-anim`, `chest-anim`, `signs` | ✓ §3 |
| Ruins pillars (nook decor) | dungeons `pillars` | ✓ §3 palace/treasure |

Approximations (no NEW missing-asset rows needed — existing rows already cover them):
- **Dais steps `=`**: no dedicated stair sprite for outdoor stone; drawn as a pavement strip
  through a fencewall gap flanked by torches (pure ground read, collision on the rim only).
- **Lecterns / scroll racks / astrolabes**: wanted, not in catalog — already logged as
  `WORLD-MISSING-ASSETS.md` **row #10**; workaround applied (bookshelves as architecture,
  tables + rugs for reading points, astrolabes skipped).
- **Tall precinct wall**: row **#11** — `desert-fencewall` used low, height read from the dais.
- Statue/painting/inscription interactables render via the existing spriteKeyMap wiring
  (unchanged, already live in the current zone).

## 8. Lint self-check (LINT-1..11)

- **LINT-1 (no overlapping objects):** every placed ID above has a unique tile; the only
  co-located reads are rugs (`r`), which are FLAT_GROUND (lower layer, exempt). Building
  footprints (T 4×4 @15–18,4–7; H 3×3 @9–11,19–21) contain no other non-flat object.
- **LINT-2 (nothing on water/collision):** the zone has no water tiles (the fountain is a prop);
  no object sits on cliff `C`, wall `w`, or a building footprint. The study door (10,21) sits on
  the annexe's bottom row (facade-set, LAW-16); the archive door (17,8) sits on the walkable
  paving row directly beneath the facade (T footprint ends at y7) — never on collision.
  `spot_library_water_01` (13,15) touches the fountain's SW rim, allowed for water_source.
- **LINT-3 (rugs plausible):** all 5 rugs — west court (6,13), east court (24,13), camel line
  (22,22), and scribe Amina's work rug (13,23), each on flat sand away from cliffs/seams/
  collision, plus the axis runner (17,9) on flat stone paving before the archive door (LAW-38;
  FLAT_GROUND, keeps the door approach walkable).
- **LINT-4 (density/spacing):** (a) 1 explicit animal (camel) — ambient spawner is off. (b) Worst
  20×15 window (forecourt+axis) holds ~13 non-flat props ≤15 — this count classes the bookshelf
  banks, fencewall runs, and buildings as ARCHITECTURE (like the container), not props. Caveat
  for build time: if `lint-world-map.mjs` counts each placed bank segment as a prop, the same
  window reads ~25 and the bank runs must ride the declared-cluster exemption / a WARN review —
  do not silently re-tag them as decor. Off-axis screens run 5–8; SE quiet
  corner has 3. (c) Same-key pairs (statues, pots, lanterns, torches, palms) are mirrored
  ceremonial pairs ≥3 tiles apart; the bookshelf banks are declared architecture clusters and
  alternate 2–3 sheet variants with a 1-tile skip mid-run — (8,11), (7,16), (26,11), staggered
  per LAW-10 — to dodge the straight-line WARN (LAW-35). (d) No empty 20×20: NW nook
  (chest+stele+pillars), lone palm (6,24), rocks
  (9,26), SE bones/chest, road stele + palms all seed the open sand every 8–15 tiles (LAW-33).
- **LINT-5 (reachability):** flood-fill from spawn (17,27): track→street→study door; track→gate
  →axis→forecourt→both courts (west mouth x11–12 y13–15; east mouth y14 + path T (25,15))→steps
  →dais→archive door; road→east entry/exit; NW nook via the x3–4 gap (y11–12); the y10
  cliff-base pockets open through the bank skips (8,11)/(26,11); ore (30,10) via (30,11);
  SE dunes open.
  Both doors face south with ≥2 clear tiles ((17,9)+(17,10); (10,22)+(10,23)). Every NPC, spot,
  entry, and exit range is on connected walkable ground; no islands.
- **LINT-6 (exits):** exactly `library-to-oasis` (south edge, [16,18]) and
  `library-to-marketplace` (east edge, [15,17]) — IDs, targets, entry keys unchanged; rects on
  their declared edges, in-bounds; both destination entries (`oasis_village.from_library`,
  `desert_marketplace.from_library`) keep their keys; my entry tiles (17,27)/(32,16) are
  walkable and outside any exit trigger range.
- **LINT-7 (contract complete, exactly once):** 2 NPCs + 24 interactables + 7 spots — the tables
  in §5 enumerate every contract ID exactly once, no strays; both `interiorId`s resolve in the
  INTERIORS registry and contain `exit-door` isExit:true (§8 of the contract); building-set
  interactables sit on/within 2 tiles of their buildings (archive door + paintings + phrases
  shelf on the facade; study door + crate on the annexe; gate signs/lanterns at the gate).
- **LINT-8 (dims/template):** 35×30 preserved = zones.js `mapWidth/mapHeight`; Tiled build will
  copy oasis-village.json layer structure (Ground/Collision/Exits, uncompressed, catalog-named
  tilesets); spawnPoint (17,27) and both entry tiles are walkable track/road.
- **LINT-9 (asset legality):** every family in §7 verified in asset-inventory.md; no
  CULTURAL_EXCLUDES anywhere (no church, no crosses — the "temple" is the desert-temple facade);
  new prop crops (if any sheet items are newly used) go to `PROP_CROP_REGIONS` data-only.
- **LINT-10 (seams):** no water-land seam exists (no water tiles); grass `g` meets only stone
  plaza and sand via the scrub-blob transition (the one sand-compatible grass, MISSING #5 —
  no raw grass↔sand adjacency); district boundaries (sand↔stone plaza, sand↔track) step
  diagonally 1–2 tiles per the scalloped grid, no straight boundary >8 (the east road jogs at
  x28–30; cliff faces tooth at y3 and y10 — longest cliff/road edge segment is 6).
- **LINT-11 (collision coverage — manual):** the Collision layer must paint: all `C` container,
  all `w` rim/stubs, both building footprints, obelisks, bookshelf banks, fountain tile, and the
  dais rim EXCEPT the 3-wide step gap (x16–18,y9–10). No water to paint. Verify by in-game
  walk-through before acceptance (linter cannot catch this today).

Un-lintable law compliance is argued in §3 (threshold stack, focal hierarchy, diagonal, quiet
corner, vignettes, vista) — judged at screenshot review against the §0 references.

---

## 9. Review appendix — adversarial design review (2026-07-03)

Scope: LAW compliance of the sketch, asset-manifest reality, coherence/spot-checks, LINT
self-check honesty. Exits, edge fractions, dimensions, and region geography were locked by the
prior cross-zone audit and were NOT touched.

**Checked, found sound:** grid parses at exactly 35×30 (every row 35 chars); path hierarchy
(LAW-1: 3-wide track widening to 4 at y28, 1-wide alley to the study door, 1-wide garden path);
track scallop + 7-tile decision point (LAW-2/28); dressed south entrance with palm pair vs plain
east cut (LAW-28/42, signposts within 3 of both cuts); one landmark top-centre on the walk-in
axis (LAW-12/25); threshold stack + platform + 12-tile forced approach (LAW-29); plaza 8×6 with
off-centre fountain and unequal radiating paths (LAW-27); torch/lamp pairs confined to gate +
axis (LAW-36); diagonal sweep (LAW-30); quiet SE corner 0 buildings / 3 props / 0 NPCs (LAW-31);
vignettes ×2 (LAW-34); vista note (LAW-46); no water tiles → no water-edge/props-on-water issues;
both doors face south with 2 clear tiles and every door/NPC/spot/exit flood-fills from spawn.
Spot-checked 20+ contract placements against grid glyphs (librarian (16,11), amina (12,23),
statues (15,12)/(19,12), pots (14,18)/(20,18), lanterns (15,20)/(19,20)/(12,21), paintings
(14,7)/(20,7), shelves (7,11)/(24,11)/(13,6), chests (3,10)/(29,24), barrel (27,13), crate
(8,20), signs (15,23)/(11,13), inscriptions (2,11)/(27,17)/(20,26), spots (11,23)/(25,12)/
(8,17)/(11,16)/(30,10)/(21,23), entries (17,27)/(32,16)) — all matched except the fountain pair
below. §5/§6 ID sets re-verified 1:1 against contract-and-pipeline §1/§8. Asset manifest: every
family re-verified against asset-inventory.md §1–5 (incl. typo'd `lanter-posts`, camel as
explicit object, dungeon `pillars`); approximations already covered by WORLD-MISSING-ASSETS
rows #5/#10/#11 — no new ledger rows needed, nothing unreal found.

**Violations found and FIXED (grid + text together):**
1. **Grid↔table mismatch (fountain):** grid drew `F` at (15,14) and the rosewater `*` at
   (14,14); tables say fountain (14,14), `spot_library_water_01` (13,15). Grid corrected to
   match the tables (F→(14,14), `*`→(13,15) on the SW rim).
2. **LAW-2/LAW-44/LINT-10 (east road):** the road ran dead straight x22–33 (12 tiles) on both
   edges — a straight run reserved for ceremonial axes, and the LINT-10 "no straight boundary
   >8" claim was false. Fixed: road jogs south to y16–17 for x28–30 (y16 spine continuous,
   2-wide throughout; entry (32,16) untouched); stele (27,17) now anchors the jog corner.
3. **LAW-48/LAW-41 (straight cliff faces):** container inner faces ran straight 9–13 tiles
   (west block south face x2–10, east block x24–33, dais back wall x12–22) with constant band
   depth. Fixed: teeth added at (6,10)–(7,10), (28,10)–(29,10), and (12,3)/(17,3)/(22,3) —
   all segments now ≤6, depth varies; no placement displaced, reachability preserved.
4. **LAW-35/LINT-4(c) honesty (bookshelf banks):** the claimed "1-tile gap" did not exist —
   banks were unbroken 6-runs. Fixed: skips at (8,11), (7,16), (26,11) (staggered per LAW-10;
   contract shelves at (7,11)/(24,11) unaffected); LINT-4(c) text now matches.
5. **LAW-38 + §0 claim (rug runner):** §0 promised "rug runners on the axis" but the grid had
   none, and the archive door (the zone's veneration point) had no carpet. Fixed: flat rug
   runner added at (17,9); LINT-3 updated (rug tally corrected again in the second pass below).
6. **LINT-2 wording:** claimed doors sit "on the building's bottom row" — true for the study
   door, false for the archive door (17,8), which sits on paving one row below the T footprint
   (y4–7). Wording corrected; no tile moved.
7. **§5 rationale nit:** `inscription-library-3` (20,26) is 2 tiles off the track (x18 edge,
   gap at x19), not "1 off" — text corrected, tile kept (LAW-7 binds signs, not inscriptions).
8. **LINT-5 wording:** the "y10 cliff-base corridor→NW nook" route changed with fix 3; the nook
   now floods via x3–4 (y11–12) and the y10 pockets open through the bank skips — text updated
   and re-verified (no islands: pockets x8–14/x24–27 reach via (8,11)/(26,11); ore (30,10) via
   (30,11); nook x2–5 via (3–4,11)).

**Accepted as-is (argued, not violations):** 2 buildings < LAW-11 hamlet floor (the brief's
"solitary house of wisdom" concept demands it); mirrored-pair rhythm pauses across the plaza
(LAW-29 pairs resume y18→y20; plaza centres stay clean per LAW-32); H drawn 3×3 for a 2.5×2.5
sprite (grid rounds up); the 3-row east exit trigger [15,17] vs the 2-wide dressed road
(trigger range is ledger-locked and may exceed the dressed surface).

### Second pass — independent verification (2026-07-03)

A fresh adversarial pass re-verified the first pass instead of trusting it. Method: the ASCII
grid was parsed programmatically — all 30 rows are exactly 35 chars; every glyph position was
extracted and diffed against §5/§3/§8 claims (47 placements checked: both NPCs, both doors +
their 2-tile clearances, both entries/spawn, all 24 interactables, all 7 spots, torch/obelisk/
palm pairs, exit cuts y29 x16–18 and x34 y15–17, bank skips (8,11)/(7,16)/(26,11), dais teeth
(12,3)/(17,3)/(22,3), y10 teeth (6,10)–(7,10)/(28,10)–(29,10), road jog rows). All first-pass
fixes 1–8 are genuinely present in the grid; asset manifest re-checked family-by-family against
asset-inventory.md §1–5 (all real, incl. typo'd `lanter-posts`; MISSING rows #5/#10/#11 cover
the approximations — no new ledger rows). Reachability re-walked: track→street→study door;
gate→axis→steps→dais→archive door; both court mouths; NW nook via (3–4,11); y10 pockets via the
bank skips; ore via (30,11); east road→entry (32,16) — no islands. LAW re-checks passed: LAW-1
(3/2/1 hierarchy), LAW-2 (track scallop y24–25, road jog x28–30, boundary segments ≤6), LAW-3
(one T at (16,22), anchored; single crossroads at the plaza), LAW-27/19 (8×6 plaza, fountain on
the west edge), LAW-28 (7-tile decision point, widened+framed south cut vs plain east cut),
LAW-29 (threshold stack, 12-tile forced approach + climb), LAW-31/33/39 (budgets, seeded sand,
sacred emptiness), LAW-36 (pairs only at gate/axis; lantern-3 is a LAW-3 junction anchor, not
street lining), LAW-41/43/48 (container teeth, wall runs ≤8; corner cliff masses run 10–11 deep
— within the bible's ×2 tolerance on the 2–6 band, read as the dune massif the dais is carved
into), LAW-42/45/46.

**Second-pass corrections (all applied):**
9. **LINT-3 rug tally (honesty):** the grid holds FIVE rugs — (17,9), (6,13), (24,13), (22,22),
   and scribe Amina's (13,23), which §3's vignette promises — but LINT-3 (and fix 5's note)
   said four, omitting (13,23). LINT-3 corrected to 5 with the scribe rug named; no tile moved.
10. **District overlap (LAW-31 bookkeeping):** the camel-vignette rug (22,22) sat inside the
    "Quiet Dunes (22,19) 11×10" rect, contradicting the quiet-corner "3 props, nothing else"
    claim. Quiet Dunes re-rected to (23,19) 10×10 and Pilgrim Approach widened to (13,19) 10×11
    so the whole vignette (M (21,21), rug (22,22), wool (21,23)) lives in the approach district.
    Quiet corner contents re-verified: chest (29,24) + bones (27,25) + a rock decal only.
11. **LINT-4(b) transparency:** the "~13 props ≤15" figure silently excluded ~12 bookshelf-bank
    tiles in the same window. Caveat added: banks/fencewalls are classed as architecture; if the
    linter counts bank segments as props the window reads ~25 and must go through the declared-
    cluster exemption / WARN review, not a silent re-tag.

Verdict: **FIXED** — sound after corrections; exits, edge fractions, dimensions, and region
geography untouched.
