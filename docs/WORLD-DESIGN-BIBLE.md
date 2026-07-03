# GOGO ARABIC — WORLD DESIGN BIBLE

**The one document every map-building agent follows.** Phase 0 output, 2026-07-03.

Sources (read them when a rule needs its evidence or more detail):
- `docs/world-design-research/composition-towns-and-detail.md` — town composition + detail grammar
- `docs/world-design-research/composition-desert-camps-farmland.md` — desert, camps, farms
- `docs/world-design-research/composition-bazaar-palace-library.md` — souk, palace, sacred spaces
- `docs/world-design-research/composition-mountain-port-interiors.md` — cliffs, harbours, interiors
- `docs/world-design-research/asset-inventory.md` — every usable Kenmi asset + gaps
- `docs/world-design-research/contract-and-pipeline.md` — the preserved contract + build pipeline (ground truth)
- Reference images — **canonical library:** `/Users/theshumba/Desktop/Gogo-World-References/`
  (11 category folders, manifests per folder). The repo's `docs/world-references/` is only a
  secondary drop-folder and is currently EMPTY — do not treat it as the library. Agents without
  access to the Desktop path have zero references and must STOP and say so, not improvise.

Scope: full layout rebuild of the 8 core zones + interiors. **Layouts are thrown away; the
contract (zone IDs, NPC IDs, interactable/object IDs, gathering-spot IDs, exit connectivity,
entry keys, interiorIds) is preserved. Game logic is untouchable.**

---

## 1. WORLD IDENTITY

Gogo Arabic's world is a **golden-age Arabian caravan land**: one continuous desert civilisation
strung along a trade road from a palm-shaded oasis to a Sultan's palace by the sea. Every zone is
a stop on that journey — a place people live, trade, study, herd, and pray. It should feel like
Golden Sun's Lalivero and DQ3's Isis: warm adobe under a hard sun, water as treasure, knowledge as
light. Handmade, lived-in, never procedural.

**The shared visual language (all 8 zones, no exceptions):**

- **One world scale.** 64px tile grid; 16px Kenmi art scaled ×4. A person is 1 tile. A house is
  2.5–4 tiles wide. A palm is ~1 tile of trunk. All reference tile-counts transfer 1:1.
- **One material family.** Adobe/mudbrick + sandstone + palm wood. Ground: sand (3 hues), scrub
  grass, packed-dirt paths, stone paving for status, farmland soil, water. Stone/limestone
  European houses appear only in mountain_village and coastal_port, weathered by context.
- **Water is wealth.** Every outdoor zone has exactly one water feature (pond, fountain, channel,
  stream, sea) and the composition bends toward it. Grass exists only near water.
- **Vertical punctuation.** Flat-roof desert towns need palms, obelisks, towers, and banners to
  break the horizontal every 8–12 tiles.
- **Carpets mark meaning.** A rug sits under every transaction and veneration point — stalls,
  counters, thrones, lecterns, prayer spots.
- **Symmetry is a status dial.** Fully symmetric = palace/temple ceremonial axes only. Partially
  symmetric = plaza rings and entrance framing. Everything else is staggered, organic, asymmetric.
- **Handmade, one sentence.** Every zone is summarisable in one clause ("walled souk around a
  fountain", "tent ring around a fire") and every element on the map serves that sentence.
- **Culturally clean.** No pigs, crosses, halloween/christmas iconography (enforced by
  `CULTURAL_EXCLUDES` at module load). Arabic labels render RTL via the existing fixed pipeline.

---

## 2. COMPOSITION LAWS

Merged and deduplicated from the four composition research docs. Each law is stated in tiles.
Numbers are defaults: **±1 tile is fine, ×2 is a violation.** Laws marked ⚙ are machine-checked
by lint (§7); the rest are enforced by screenshot review.

### 2A. Paths & roads

- **LAW-1** Path widths carry hierarchy: main road 3–4 tiles, secondary street 2, alley/garden
  path 1. A side path is never wider than the road it leaves. Door stubs 1–2 tiles.
- **LAW-2** Paths curve in 2–4-tile segments with scalloped edges (edge steps in/out every 2–3
  tiles). Straight runs longer than 8 tiles are reserved for ceremonial axes only.
- **LAW-3** Junctions are T's, offset so opposite arms don't align. At most ONE full crossroads
  per zone, at the plaza. Every junction corner is anchored (building corner, jar cluster, sign,
  flowerbed).
- **LAW-4** ⚙ Every path terminates at a reason: a door, a zone exit, a focal point, or a vista
  (shoreline/cliff dead-end dressed with a bench, jar, or boat). No path fades into blank ground.
- **LAW-5** ⚙ Every door opens onto a path (or gets a 1–2 tile stub to the nearest road) with
  ≥2 clear walkable tiles in front. Doors face south or the zone's central open space/water.
- **LAW-6** Soft settlements (bedouin_camp, farmland, oasis edges) use trampled/darker sand
  strips 2–3 tiles wide instead of paving; hard paving is for towns, stone for status. Main-road
  material must contrast the base ground more than side paths do.
- **LAW-7** Signs sit 1 tile off the path, on the approach side, at junctions and entrances.
- **LAW-8** Wilderness connectors: corridors 6–12 tiles wide, winding, a visible point of
  interest every screen; travel legs between landmarks 15–25 tiles.

### 2B. Building placement & clustering

- **LAW-9** Buildings cluster in groups of 2–4 with 2–4 tile gaps inside a cluster and 6–10 tile
  gaps between clusters. Never even grids, never equal spacing along a line.
- **LAW-10** Stagger everything by 1–3 tiles: facades off any shared baseline, cluster shapes as
  L's or triangles (never 3-in-a-row). If any three elements align exactly, move one.
- **LAW-11** Building budget: hamlet ≈ 3–5 buildings (20×20 core), mid town 6–9 (40×30), large
  zone 10–14 max. More than 14 exterior buildings reads as noise.
- **LAW-12** Exactly ONE oversized landmark structure per zone (temple, chief tent, tower,
  palace facade), placed top-centre / axis-end / top terrace, with an axial 2–3 tile approach.
- **LAW-13** Tents are 1.5–2.5 rendered tiles; the canonical bedouin patterns are the QUINCUNX
  (2 top, 1 centre, 2 bottom, 3–5 tile gaps) or a RING around a pool/fire with all doors inward.
  Rows + stockade walls = military camps only — never for bedouin_camp's civilian core.
- **LAW-14** The chief's tent is 1.5–2× bigger, top-centre, facing down the camp axis, flanked
  by 2 banner poles.
- **LAW-15** Farm buildings cluster on ONE edge or corner — never scattered among fields. Barn
  and silo touch; the silo/windmill is the farm's vertical landmark.
- **LAW-16** ⚙ A building's contract interactables (door, sign, adjacent bookshelf/pots) move as
  a SET with the building — door on the facade, sign within 2 tiles of the door.

### 2C. Water & shorelines

- **LAW-17** ⚙ Shorelines scallop in 2–4-tile arcs with a 1-tile shallow/wet rim between land
  and deep water. No straight shoreline longer than 6 tiles; never butt land against deep water.
- **LAW-18** Village pond 4×3–8×6 tiles; oasis lake up to 14×10; ringed by a 1–2 tile grass halo
  plus 2–4 detached grass blobs (3–6 tiles) within 4 tiles of shore, then sand. One shore gets a
  hard rock/stone lip; the rest stay soft. Doors face the water.
- **LAW-19** Wells substitute for ponds in dry plazas: 2–4 tiles off-centre in the main open
  space, never dead-centre, never against a wall.
- **LAW-20** Irrigation channels are 1 tile wide, run along plot EDGES (falaj style), originate
  at the water source, and get 2-tile plank crossings where paths cross.
- **LAW-21** Ports: 3-layer boundary (land → 1-tile edge → 1–2 tile shallows → deep). Use BOTH a
  hard stone quay and a soft beach in one map. Cut an inlet 4–8 tiles wide, 6–12 tiles into the
  land so docks face inward.
- **LAW-22** Piers are 2–3 tiles wide, perpendicular to shore, 2–3 fingers of DIFFERENT lengths
  (8–16 tiles), each ending in a 4×4–6×6 staging platform. Boats moor broadside on the deep side
  with a 1–2 tile gangplank; rowboats nose-in at finger tips.
- **LAW-23** ⚙ Bridges: 2 tiles wide, 3–6 long, on the main path, max 2 per zone, framed with
  end ramps/posts. A bridge is a mini-focal.

### 2D. Focal points & entrance framing

- **LAW-24** Write the zone's one-sentence identity FIRST (see §3); every element must serve it.
- **LAW-25** The zone landmark is visible within ~12 tiles of the entrance/spawn, or sits on the
  same path axis as the walk-in direction.
- **LAW-26** One primary focal per zone + one secondary per district. Focals are TALL or
  ANIMATED: tower, fountain, waterfall, fire, banner. Focals earn 2–3 NPCs; side streets get ≤1.
- **LAW-27** Plazas are 6×5–10×8 tiles of distinct ground material, focal off-centre by 1–2
  tiles (centred only when terminating a ceremonial axis), with 3–5 paths radiating at unequal
  offsets — never a perfect plus.
- **LAW-28** One dressed main entrance per zone, 2–3 tiles wide, framed by a symmetric pair
  (torches, palms, jars, gate posts); path widens 1 tile over the last 3–4 approach tiles.
  Secondary exits stay plain 2-tile gaps. The entrance reaches a decision point (junction or
  plaza) within 6–10 tiles — no long dumb corridors.
- **LAW-29** Ceremonial axes (palace, temple, library approach): ONE straight 3–4 tile path,
  2–3 stacked thresholds (bridge/steps → gate → facade arch), mirrored prop pairs every 2–3
  tiles ON the axis only; everything off-axis stays informal. Sacred buildings are never entered
  straight off a road — force 8–20 tiles of approach with a turn or a climb, set the building on
  a platform 1–2 steps up.
- **LAW-30** Compose on diagonals: landmark, plaza, and main gate sit on a rough diagonal from
  each other, never one axis, so the eye sweeps the whole map.

### 2E. Density budgets & prop rhythm

- **LAW-31** ⚙ Prop budget per 20×15-tile screenful: 8–15 in town cores, 5–8 on routes and
  outskirts, 3–5 in the quiet corner. Every zone keeps ONE deliberate quiet corner (no buildings,
  2–3 props, ≤1 NPC).
- **LAW-32** ⚙ Props cluster in 2–4s (70% of props in clusters hugging architecture — house
  corners, wall bases, door flanks; 30% loose singles ≥6 tiles from any cluster). Open-ground
  props stay ≥2 tiles off paths. Keep walkway and plaza centres clean.
- **LAW-33** ⚙ Open sand needs a point of interest every 8–15 tiles (jar clump, palm, rocks,
  cactus, bones) and a ground decal per ~4×4 area; no 20×20 area may be empty; bare sand never
  runs more than ~8 tiles without a ground-variation patch (lighter/darker sand blob 4–10 tiles)
  or a prop.
- **LAW-34** Build 1–2 story vignettes per zone (camel + rug + trader + campfire; two beached
  rowboats) — 3–5 props telling one story in a ~5×4 patch, near but not on the main path.
- **LAW-35** Repeat with variation: alternate 2–3 sprite variants in any run and skip every
  3rd–4th tile. Identical props in an unbroken line read as machine fill.
- **LAW-36** Torches/lamps come in pairs at entrances and every ~4 tiles along ceremonial
  approaches ONLY — never lining ordinary streets.
- **LAW-37** Market grammar: the market is a bounded sub-district (~18–24 tiles across) off the
  main road with 1–2 entry mouths, never stalls on the thoroughfare. Stall unit = 3–4 wide × 2
  deep (counter + vendor space), goods clusters at the FLANKS, aisles 2–3 tiles, rows of 2
  columns × 2–3 rows, broken every 2–3 stalls by a 2-tile prop gap; alternate stall/awning
  variants. Keep one continuous ≥2-tile walkable loop through the whole market.
- **LAW-38** Carpet marks every transaction and veneration point: stall fronts, shop counters,
  thrones, altars, lecterns. (Rug placement rules: LINT-3.)
- **LAW-39** Sacred spaces keep ≥40% of floor empty; clutter density is HALF a shop's. Long
  empty carpet runs before the focal ARE the composition.
- **LAW-40** Fire pits are focal: centre of a clearing, seats/bedrolls RADIAL at 2–3 tiles, one
  pit per 2–3 tents, the main pit on the camp's central axis.

### 2F. Edge treatments

- **LAW-41** ⚙ Enclose every zone with a hard container: sandstone/adobe wall, dune cliff, palm
  belt (packed 1 apart, 4–8 band, unwalkable), or sea. Container depth varies 1–3 tiles along its
  run (band 2–6 thick) — constant width reads procedural. Exits are 2–3 tile cuts through it.
- **LAW-42** ⚙ Mark every zone exit with a palm/prop cluster within 3 tiles (the signpost rule).
- **LAW-43** Walls/fences break every ≤8 tiles (gate, corner post, jar cluster, tower, plant).
  Fences are waist-height, outline 4×6–6×8 yards/pens, corners closed, gates facing the path or
  house.
- **LAW-44** ⚙ Biome/district ground boundaries step diagonally 1–2 tiles per step — any biome
  boundary drawn as one straight line is wrong. 2–4 ground materials per zone; changing material
  = changing district. (No direct sand↔grass blend exists — meet them at a cliff, path, water, or
  scrub-grass band; see WORLD-MISSING-ASSETS #5.)
- **LAW-45** Palms cluster in 2–4 (triangle or L, 1–2 tiles between trunks) near water; lone
  palms every 8–15 tiles in open sand; rows ONLY along formal roads or in a fenced date-orchard
  block (the one place regular spacing is allowed).
- **LAW-46** The container leaks one vista: one stretch where the player stands at the edge and
  sees the outside (sea, dunes, mountains).
- **LAW-47** Camp boundaries use LIGHT elements — woven-mat strips, banner poles, hitching
  rails, jar+palm corner clusters — not walls. The camp reads as a ~20×20 space you can see
  across. Livestock pen (5×4–8×6, fenced) at the camp/farm edge, gate facing inward.

### 2G. Elevation

- **LAW-48** 2–3 elevation bands maximum per zone. Each terrace floor is 6–12 tiles deep; cliff
  faces are drawn 2–3 tiles tall (never 1); cliff edges jog every 3–6 tiles — no straight cliff
  run longer than 6.
- **LAW-49** Stairs are 2 tiles wide (3 for ceremonial climbs), ONE per band, laterally offset
  from the stair below so the route zigzags. Ladders/rope links are 1-wide flavour, never the
  main route.
- **LAW-50** The landmark/key interactable goes on the TOP band — the climb has a payoff.
  2–4 buildings per band, wedged against the cliff wall (0–1 tile gap). Doors carved into the
  cliff face (cave-entrance tiles + awning + pot cluster) are the cheap extra dwelling.
- **LAW-51** A water thread falling through the bands (waterfall/falaj cascade into a pool)
  sells elevation better than more cliffs. Frame terrace-zone entrances through a 2–3 tile cliff
  pinch. Break flat terraces with 1–2 rock outcrops (2×2–3×3) per ~10×10 of open floor.

---

## 3. ZONE BRIEFS

Zone graph (linear chain — exits must preserve this connectivity):
`oasis_village ⇄ ancient_library ⇄ desert_marketplace ⇄ farmland ⇄ bedouin_camp ⇄ mountain_village ⇄ coastal_port ⇄ royal_palace`

Contract counts summarised from `docs/world-design-research/contract-and-pipeline.md` §1 — **that
doc is the full authoritative ID list**; every ID there must be placed exactly once. Reference
categories live in `/Users/theshumba/Desktop/Gogo-World-References/`.

### 3.1 oasis_village (40×30) — واحَة الحُروف
- **Identity:** A palm-shaded spring hamlet where the journey begins — five adobe homes drinking
  from one pool.
- **Anchor:** The oasis pool (grass halo + palm clusters + well at its edge), per LAW-18.
- **Study:** `02-desert-oasis-villages` (Suhalla, Kakkara, Kaipo), `11-detail-language` (Kenmi
  oasis scene), `01-master-town-maps` (Oldale scale).
- **Districts:** oasis shore (pool + well), market corner (1 stall), residential (scholar +
  merchant houses), ruins pocket (NE, chest + inscriptions), guild corner (SE). Redraw the four
  `subAreas` rectangles to match.
- **Contract:** 4 NPCs, 1 exit (north → ancient_library/from_oasis), 25 interactables (3 doors →
  scholar/merchant/guild interiors), 8 gathering spots, 3 stepTriggers, entries: `from_library`.
- **Special:** the cinematic intro hardcodes track this zone — spawnPoint, `guide-amira`, and the
  pool must stay coherent, then update `CinematicIntroSequencer.js` (§6 checklist).

### 3.2 ancient_library (35×30) — المَكتَبَة القَديمَة
- **Identity:** A solitary house of wisdom in the dunes, earned by a long ceremonial approach.
- **Anchor:** The temple-facade library building on a raised platform at the end of a torch-paired
  axis (LAW-29); its forecourt fountain is the secondary focal.
- **Study:** `08-library-temple` (FF5 Ancient Library, Arabian Nights shrine, Lama Temple),
  `11-detail-language` (Kenmi temple approach).
- **Districts:** approach path (south, from oasis), forecourt + reading garden (statue pair,
  fountain), shelf courts (bookshelf interactables as architecture), scribe corner, east road to
  the marketplace. Quiet zone overall: 5–8 props/screen, LAW-39 emptiness.
- **Contract:** 2 NPCs, 2 exits (south → oasis, east → marketplace), 24 interactables (2 doors →
  archive [locked] / study), 7 gathering spots, entries: `from_oasis`, `from_marketplace`.

### 3.3 desert_marketplace (45×35) — سوق الصَّحراء
- **Identity:** A walled caravan souk roaring around a fountain plaza — the world's commercial heart.
- **Anchor:** Central fountain plaza (LAW-27) with the 4 contract stalls in a stall-block off it
  (LAW-37).
- **Study:** `03-bazaar-marketplace` (Slateport market, Louran, elvgames demos), `02` (Lalivero
  walls, Scaraba), `01` (Alhafra).
- **Districts:** dressed west gate (from library), fountain plaza, stall block (souk core), shop
  street (spice + textile shop doors with awning frontage), warehouse corner (locked door), north
  road out to farmland. Adobe wall container with ONE dressed gate.
- **Contract:** 3 NPCs, 2 exits (west → library, north → farmland), 28 interactables (3 doors,
  4 stalls), 9 gathering spots, entries: `from_library`, `from_farmland`. Densest zone — top of
  the LAW-31 budget.

### 3.4 farmland (45×35) — الأَرض الزِّراعِيَّة
- **Identity:** Irrigated green fields wrested from the desert — crops, channels, and one proud barn.
- **Anchor:** Barn + silo/windmill cluster on the top edge (LAW-15); falaj channel network from
  the pond is the secondary signature (LAW-20).
- **Study:** `09-farmland` (Roots of Pacha channels, HM SNES/MFOMT, Sun Haven, Mistria), `02`
  (Wozz oasis-farm).
- **Districts:** farmhouse/barn row (top edge), 3–5 fenced crop plots (6×4–10×8, rows per
  LAW-listed geometry, different crop per plot), animal pen by the barn, pond + channels, farm
  plaza where paths meet, south gate (marketplace) and east road (bedouin).
- **Contract:** 2 NPCs, 2 exits (south → marketplace, east → bedouin_camp), 24 interactables
  (1 door → farmhouse), 10 gathering spots (most in the world), entries: `from_marketplace`,
  `from_bedouin`.

### 3.5 bedouin_camp (35×25) — مُخَيَّم البَدو
- **Identity:** A nomad tent ring under open sky, gathered around the elder's fire.
- **Anchor:** Central fire pit on the camp axis with radial seating (LAW-40); chief/elder tent
  1.5–2× at top-centre (LAW-14).
- **Study:** `05-camps-nomad` (Arabian Nights Desert Dwellers' Camp — the quincunx, Burning
  Heroes ring, Seliel fire vignettes).
- **Districts:** quincunx/ring tent core (5–7 military-kit tents), elder's court (banner pair),
  camel + livestock pen at the edge (LAW-47), storyteller's fire, dune-cliff container with light
  mat/banner boundary. Worn-sand paths only (LAW-6) — no paving anywhere.
- **Contract:** 3 NPCs, 2 exits (west → farmland, north → mountain_village), 20 interactables
  (1 door → bedouin tent interior), 8 gathering spots, entries: `from_farmland`, `from_mountain`.

### 3.6 mountain_village (40×30) — قَرية الجَبَل
- **Identity:** A stone village stacked on cliff terraces, where weavers and healers live above
  the desert.
- **Anchor:** The mosque (temple-facade composite, see WORLD-MISSING-ASSETS #1) on the top band
  (LAW-50); a spring cascade falling through the bands is the secondary focal (LAW-51).
- **Study:** `06-mountain-village` (Blackthorn, Mandala, Garoh, Vale, Lavaridge), `11` (Route 115
  terraces).
- **Districts:** 3 terraces max — south entrance pinch + lower floor (from bedouin), mid band
  (weaver + healer homes wedged to cliff, home door), top band (mosque door + statue court), east
  ledge road to the port. NO SNOW — Arabian stone highland (WORLD-MISSING-ASSETS #6).
- **Contract:** 3 NPCs, 2 exits (south → bedouin_camp, east → coastal_port), 23 interactables
  (2 doors → home / mosque), 8 gathering spots (ore-heavy — put ore veins on rock), entries:
  `from_bedouin`, `from_port`.

### 3.7 coastal_port (45×35) — المِيناء
- **Identity:** A working harbour town where the desert meets the sea — quays, cargo, and salt wind.
- **Anchor:** The quay plaza + harbour tower (obelisk/volcano-tower stand-in, LAW-22/26); the
  inlet biting into the east/south edge shapes the whole map (LAW-21).
- **Study:** `07-coastal-port` (Slateport, Alhafra, Freedom/Litz, Kalay docks, Olivine), `03`
  (Slateport market strip).
- **Districts:** banded sea → docks (2 pier fingers, rowboats, cargo clusters) → warehouse +
  market strip (tavern + warehouse doors, fish-market stall echo) → smithy/residential → west
  road (mountain) and north road (palace). Weakest asset kit — lean on composition
  (WORLD-MISSING-ASSETS #4).
- **Contract:** 3 NPCs, 2 exits (west → mountain_village, north → royal_palace), 26 interactables
  (2 doors → tavern / warehouse), 9 gathering spots, entries: `from_mountain`, `from_palace`.

### 3.8 royal_palace (50×40) — القَصر المَلَكي
- **Identity:** The Sultan's walled precinct — one ceremonial axis from gate to golden facade,
  gardens at its flanks.
- **Anchor:** The palace facade (desert-temple composite, 12+ tiles of massing) terminating a
  dead-straight 3–4 tile axis from the south gate, with a 10–16 tile empty forecourt plaza
  (LAW-29; full symmetry allowed ON the axis only).
- **Study:** `04-palace-castle` (Vectoraith walled garden + dome plazas, DQ3 Isis, Zelda LttP
  approach), `08` (Arabian Nights palace).
- **Districts:** south gate + walled approach (from port), forecourt plaza (lantern/statue
  pairs), throne door (locked, on the facade), west prayer garden (imam + fountain), east poet's
  garden (fountain + paintings), informal gardens off-axis (LAW-29). Largest, most formal zone.
- **Contract:** 4 NPCs, 1 exit (south → coastal_port/from_palace), 27 interactables (1 door →
  throne interior [locked]), **0 gathering spots defined** (pre-existing anomaly — flag stays
  true; do NOT invent spots), entries: `from_port`.

---

## 4. ASSET PALETTE

**Global rule:** existing catalog keys only (`src/data/kenmiCatalog.js`). Anything a design wants
that doesn't exist goes into `docs/WORLD-MISSING-ASSETS.md` with a workaround and is skipped
cleanly — no invented keys, no new art, no cultural excludes ever. New props from multi-item
sheets need a crop region in `PROP_CROP_REGIONS` (data-only). Full family tables:
`docs/world-design-research/asset-inventory.md`.

| Zone | Primary Kenmi families | Notes |
|---|---|---|
| oasis_village | desert houses 1–4 (adobe, 4 colourways), palms 1/2, well, desert-beach sand + desert-water tiles, desert-grass blobs, desert-pots-sacks, lanterns | Richest fit ✓. Sand↔water shoreline autotile is proven. |
| ancient_library | desert-temple facade, obelisks, big-torch/torch-anim, desert-rugs, bookshelves, pillars, desert bones/rocks off-axis | Interior: dungeon roomsets + bookshelves as walls. |
| desert_marketplace | desert houses (dense colourway mix), desert-fencewall, market-stalls, desert-rugs, pots/golden-pots, barrels, crates, signs, pole-and-bunting, lanter-posts, camel + desert-trader-camp vignette | Stalls are wooden/European — accept (MISSING #3). |
| farmland | barn, silo, coop, windmill(+sail-anim), crops/crops-2, farmland(-wet) tiles, fences + gates, grapes-bower, hay-bales, scarecrows, troughs, chicken/cow/sheep, palm orchard block | Richest kit in the library ✓. |
| bedouin_camp | military-tents (canvas), banners-anim, flags-anim, campfire-pot-anim, fire-pit, sleeping-mat, split-log-benches, camels 1–3, desert-rugs, water-sack-on-stick, hitching via weapon-stand/fence bits | Military kit reads bedouin when rows are avoided (LAW-13). |
| mountain_village | desert-cliff-tiles + stone-cliff, cave-entrances, stone/limestone house-* variants, desert-cliff-waterfall, desert-temple (mosque composite), rocks, acacia/dead trees | No snow — stone highland (MISSING #6). |
| coastal_port | wooden-deck-tiles (piers), boat/boat-anim, fisherman-house, water-stone tiles (quay edge), barrels/crates/pots, lanter-posts, volcano-tower or obelisk (harbour tower), market-stalls strip | Weakest kit ✗ — composition carries it (MISSING #4). |
| royal_palace | desert-temple + obelisk pairs, dungeon pillars/gates(+anim), limestone houses, pavement-tiles, fountain-anim, golden-pots/gold-piles, banners-anim, hedge, flowers, water channels | Fully composited (MISSING #2). |

Ambient life: `BIOME_ANIMAL_SETS` exists as data but is **NOT live** — `spawnAmbientAnimals()`
is commented out (VISUAL-CLOSEOUT.md B5), so ZERO ambient animals spawn in any zone. Animals
appear in a map ONLY as explicit zone objects placed in zones.js (e.g. farmland's
chicken/cow/sheep, bedouin camels). Design layouts accordingly: do not rely on ambient spawns,
do not expect animals in acceptance screenshots beyond the explicitly placed ones, and do NOT
re-enable the spawner — that is a game-logic change and out of scope for this rebuild.
(LINT-4(a)'s ambient-animal cap only matters if the system is ever re-enabled.) Pig sprites are
excluded. Player + named NPCs keep their own 128px sprites — never restyle them.

---

## 5. INTERIORS DOCTRINE

Interiors are **code-built via the INTERIORS registry — NOT Tiled** (`src/data/interiors/`,
rendered by `MapLoader.create()` inside `InteriorScene`). Legacy `.tmx` files are dead; ignore
them. Pipeline detail: contract-and-pipeline.md §4.

**Which buildings get enterable interiors:** exactly the contract door list — **15 doors** across
the 8 zones (oasis 3, library 2, market 3, farm 1, bedouin 1, mountain 2, port 2, palace 1 —
verified against zones.js): scholar house, merchant house, oasis guild; library archive + study;
market warehouse, spice shop, textile shop; farmhouse; bedouin tent; mountain home + mosque;
port tavern + warehouse; palace throne. Additional enterable filler houses may reuse the existing procedural
`house_<zone>_<n>` interiorIds. A NEW enterable house = door interactable with a fresh interiorId
in zones.js + an interior def in `src/data/interiors/zones/<zone>.js` + an `isExit: true` door
inside. No engine changes, ever.

**Room composition rules (from composition-mountain-port-interiors.md §3):**

- **INT-1** Dwelling rooms 8×6–11×9 walkable tiles; shops/inns 10×8–14×10; nothing exceeds
  ~16×12. Top wall drawn 2 tiles tall and carries the furniture; side walls 1 tile.
- **INT-2** Door on the bottom edge (centred or offset 1), doormat, and a clear 2-tile landing —
  nothing blocks the door. The interior's exit door sits where the player entered.
- **INT-3** Place the focal point FIRST, on the far half from the door: hearth, seating rug
  circle, or counter, visible on a straight or diagonal line from the entrance.
- **INT-4** Perimeter-first furniture: beds (corners, headboard to wall), shelves, kitchen runs
  (3–5 consecutive wall tiles), chests all touch walls. Only a rug, and a table/seating group ON
  a rug, may float mid-room.
- **INT-5** Rugs zone rooms, not floor them: one large rug (4×3–6×5) under the seating group,
  extending ≥1 tile beyond the furniture; optional runners; small accent rug by door or bed.
- **INT-6** Shop formula: counter 2–4 tiles from the top wall, off the door axis, shopkeeper
  behind, goods shelves behind the keeper, 2–3 tile clear customer apron, rug under the
  transaction point, 1–3 freestanding display tables with full 1-tile walkaround.
- **INT-7** Inn formula: 3 beds in a row on the top wall with 1-tile gaps + rug strip at their
  feet; reception counter at the other end; floor-texture change marks the split.
- **INT-8** The Gogo default living room is the majlis: rug-anchored low seating cluster (~5×4)
  toward a wall, floor lanterns at two corners, potted palms in the near corners, low table
  adjacent (approximate cushions per WORLD-MISSING-ASSETS #9).
- **INT-9** Lived-in = 3 touches minimum: something mid-task, one asymmetric prop, one plant;
  60–70% of floor stays walkable. Strict symmetry is reserved for the palace throne interior
  (full-length 2–3 tile carpet to a dais raised 1–2 steps, pillar pairs every 3–4 tiles,
  symmetric garden/pool insets — the DQ3 Isis signature).
- **INT-10** Large interiors (guild, school, elder house) may use the courtyard-house pattern:
  walled sand court with a central well/pool 2×3 and 2–3 small rooms opening onto it.
- **INT-11** Library interiors: bookshelf banks 4–10 long × 1 deep AS the walls; aisles 2 tiles
  (1-tile "stacks" moments max twice); reading pocket 6×8–10×8 with 2–3 long tables; symmetric
  entry hall, labyrinth only past the first room; hide exactly one 1-tile shelf-gap secret.
- **INT-12** Every interior uses the ONE desert roomset (`temple-house-interior`) or the
  European roomset (mountain/port only); flavour comes from furniture + rugs + lanterns.

---

## 6. BUILD PIPELINE

The authoring loop per zone (full ground truth: contract-and-pipeline.md §2–3, §5–7):

1. **Design doc** — write the zone's identity sentence, district sketch, and a tile-grid plan
   that satisfies §2 laws + §3 brief. List every contract ID with its NEW coordinate.
2. **Tiled JSON** — copy the structure of `public/assets/maps/oasis-village.json` EXACTLY:
   16px tiles, `width/height` = zone dims (MUST match zones.js `mapWidth/mapHeight`); layers by
   exact name — `Ground` (uncompressed GID array), `Collision` (hidden; any non-zero GID =
   impassable), `Exits` (objectgroup, rect per exit with `targetZone`/`targetEntry`/`edge`
   properties). Tileset `name` must EXACTLY equal the kenmiCatalog texture key.

   **COLLISION AUTHORING doctrine.** On the Tiled path, walkability is governed ONLY by the
   `Collision` layer plus `collide: true` object bodies — water tiles do NOT block by
   themselves. Therefore: every non-walkable region — water, walls, cliff faces, building
   footprints, dense vegetation/container bands — MUST be painted with non-zero GIDs in the
   `Collision` layer. A map that skips this can pass reachability lint yet let the player walk
   on water in-game. See LINT-11 (§7).

   **Terrain stamping — supported path.** The supported authoring path is DIRECT Tiled-JSON
   generation: choose GIDs manually (CORNER/EDGE/SOLID/INNER frame indices per
   `kenmiFrameTables.js`, hinted in asset-inventory.md §1) following the proven
   `oasis-village.json` template and its tileset `firstgid` tables. `.mcp/tiled-mcp-server`
   exists in the repo but is UNBUILT (no `dist/`) and UNREGISTERED (no `.mcp.json`) in this
   environment — AutoMapping via `create_terrain_rule_map` + `apply_rules` + `preview_map` is
   optional future tooling, not something a build agent may assume is available.
3. **Register** — one line in `BootScene.js` (~line 102): `map-<zone-id-with-hyphens>` →
   `/assets/maps/<zone>.json`. Cache presence of that key IS the Tiled-vs-procedural switch.
4. **zones.js coordinate update** — Tiled owns ground+collision+exits ONLY. Buildings, props,
   NPCs, interactables, gathering spots, stepTriggers, subAreas, spawnPoint, entries all still
   come from zones.js — update every coordinate to the new layout. Keep every ID; keep every
   `entries` key (exit landing resolves `ZONES[target].entries[targetEntry]`).
5. **Lint** — `scripts/lint-world-map.mjs` (§7) must pass.
6. **Screenshot** — `npm run capture:world-screenshots` (dev server running) →
   `docs/world-shots/{zoneId}.png`. Review against §2 laws + the zone's reference images. This is
   THE acceptance loop.
7. **Tests** — regenerate procedural fixtures after zones.js changes:
   `CAPTURE_WORLD_SNAPSHOTS=1 npx vitest run src/test/fixtures/captureViaVitest.test.js`, review
   the diff (only intended changes), then full `npm run test:run` (5793 green at close-out).

**MUST NOT TOUCH** (visual layer closed 2026-07-02 — docs/VISUAL-CLOSEOUT.md):
- `MapLoader.js` scale/crop machinery: `KENMI_SCALE=4`, `croppedPropScale()`,
  `NATIVE_OBJECT_SCALE=2`, `MAX_OBJECT_FOOTPRINT_TILES=4` cap, `PROP_CROP_REGIONS` semantics,
  `FLAT_GROUND_PROPS` depth, NPC/player 64px normalization.
- Frame-table drift guards (`_assertFrameTableMatch`); regenerate tables only if PNGs change.
- Arabic RTL text rendering and label proximity-reveal.
- Never stage: `package.json`, `public/sw.js`, `src/routes.jsx`,
  `src/services/swRegistration.js`, `vite.config.js`, `test-results/`.

**Hardcoded-coordinate checklist** (the ONLY logic hardcodes; update when oasis_village lands):
- [ ] `CinematicIntroSequencer.js:20-21` — `WORD_SPAWN_X/Y` → near the new oasis pool, ~3 tiles
      north of the new spawn.
- [ ] `CinematicIntroSequencer.js:325-326` — camera pan target = the new `spawnPoint`.
- [ ] `CinematicIntroSequencer.js:446-447` — pan target = `guide-amira`'s new position.
- [ ] zones.js internal consistency: stepTrigger `oasis-welcome` 1 tile north of spawnPoint;
      `ruins-echo` on the `from_library` entry tile; `subAreas` redrawn to the new districts.

---

## 7. LINT LAW

Machine-enforceable placement rules — the spec for `scripts/lint-world-map.mjs`. Input: the
zone's Tiled JSON (Ground/Collision/Exits) + its zones.js data (objects, NPCs, interactables,
gathering spots, exits, entries, spawnPoint) + gatheringSpots.js + the contract manifest
(contract-and-pipeline.md §1). Every rule is ERROR unless marked WARN.

- **LINT-1 — No overlapping placed objects.** Compute each placed object's rendered footprint in
  tiles (sprite size × MapLoader scale policy; rugs and other `FLAT_GROUND_PROPS` are exempt as
  the LOWER layer — anything may sit on a rug, but two non-flat footprints may not intersect).
  Any tile claimed by 2+ non-flat objects → ERROR listing both IDs/keys and the tile.
- **LINT-2 — No object on water/collision unless flagged.** For every object, NPC, interactable,
  and gathering spot: its anchor tile (and full footprint for buildings) must not be a water GID
  or a non-zero Collision GID, UNLESS the object key/type is on the amphibious allowlist
  (`boat*`, `bridge*`, lillypads, water-rocks, cattails, fish, `water_source` gathering spots may
  touch the 1-tile shore rim). Doors/NPCs are never allowed on collision.
- **LINT-3 — Rugs on plausible ground only.** `FLAT_GROUND_PROPS` (rugs/carpets/mats/picnic
  blankets) must sit fully on flat walkable ground tiles: not on water, not overlapping a cliff
  face/edge GID, not straddling a shoreline or a Collision tile, and (WARN) not on a tile
  diagonal-stepping between two ground materials (sand-dune edges).
- **LINT-4 — Density caps & spacing.** (a) Ambient animals: ≤4 per any 20×15 window, ≤10 per
  zone. (b) Non-flat props: ≤15 per 20×15 window (LAW-31 ceiling). (c) Min prop spacing: two
  copies of the SAME prop key may not be within 2 tiles unless part of a declared cluster of ≤4
  (3+ same-key props in a straight line at even spacing → WARN, LAW-35). (d) Empty-ground check
  (WARN): any fully empty 20×20 ground window with zero props/decals (LAW-33).
- **LINT-5 — Every door reachable.** Flood-fill walkable tiles (Ground minus Collision minus
  non-flat object footprints) from `spawnPoint`: every `door` interactable must have a walkable
  tile orthogonally adjacent that is reachable from spawn, with ≥2 clear tiles in front of the
  door face (LAW-5). Also: every exit tileRange, every NPC, every gathering spot, and every entry
  point must be reachable from spawn — no orphaned islands.
- **LINT-6 — Contract exits present & connected.** For each zone: the exit ID set exactly equals
  the contract's; each exit's `targetZone`/`targetEntry` names an existing zone and an existing
  key in that zone's `entries`; the exit rect lies ON its declared `edge` of the map and its
  tileRange is within map bounds; the destination entry tile is walkable and NOT inside another
  exit's trigger range (no teleport loops). Every `entries` key in the contract still exists.
- **LINT-7 — Contract completeness, exactly once.** Every contract NPC ID, interactable ID, and
  gathering-spot ID for the zone appears EXACTLY once (no dupes, no omissions, no strays with
  unknown IDs); every `door` interactable's `interiorId` resolves in the INTERIORS registry, and
  that interior contains an `isExit: true` door; every interactable in a building set sits within
  2 tiles of its building sprite (LAW-16; WARN).
- **LINT-8 — Dims & template integrity.** Tiled `width/height` === zones.js
  `mapWidth/mapHeight`; layers `Ground`/`Collision`/`Exits` present with exact names; tile data
  uncompressed; every tileset `name` is a valid kenmiCatalog key; every GID decodes into a loaded
  tileset range; spawnPoint and all entry tiles are walkable.
- **LINT-9 — Asset legality.** Every object spriteKey exists in kenmiCatalog, is not in
  `CULTURAL_EXCLUDES` (nor the church/pig/witch-hut list), and any cropped prop has a
  `PROP_CROP_REGIONS` entry. Unknown key → ERROR pointing at `docs/WORLD-MISSING-ASSETS.md`.
- **LINT-10 — Shoreline & seam sanity (WARN).** No straight water-land seam longer than 6 tiles
  (LAW-17); no raw grass GID orthogonally adjacent to raw sand GID (missing transition,
  WORLD-MISSING-ASSETS #5); no straight single-material district boundary longer than 8 tiles
  (LAW-44).
- **LINT-11 — Collision covers every non-walkable region (AUTHORING LAW — enforce manually).**
  Every water tile, wall, cliff face/edge, building footprint, and dense-vegetation/container
  band must carry a non-zero GID in the `Collision` layer (§6 COLLISION AUTHORING doctrine).
  The engine collides ONLY with the Collision layer + `collide: true` bodies — water does not
  block by itself — while the current linter BFS treats water as unwalkable regardless. That
  mismatch means lint CANNOT catch unpainted water/cliff collision today; until
  `scripts/lint-world-map.mjs` grows this check (its walkability model must then match the
  engine's), verify Collision coverage by hand + in-game walk-through before acceptance.

Lint exits non-zero on any ERROR. WARNs print but pass — they go to screenshot review, where the
un-lintable laws (composition, focal hierarchy, vignettes, asymmetry) are judged against §2 and
the zone's reference images.

### Linter usage

```
node scripts/lint-world-map.mjs <zone_id>   # one zone, e.g. oasis_village
node scripts/lint-world-map.mjs --all       # every core zone with an authored map in public/assets/maps/
```

Exit code 0 = clean (WARNs allowed), 1 = one or more ERRORs. Each finding prints as
`LINT-N <zone> <what> at tile (x,y)` (warnings prefixed `WARN `), followed by per-zone and
total counts. Plain Node ESM, zero dependencies — it imports `zones.js`, `gatheringSpots.js`,
`kenmiCatalog.js`, `spriteKeyMap.js` and `interiors.js` directly, extracts
`FLAT_GROUND_PROPS`/`PROP_CROP_REGIONS`/scale constants from `MapLoader.js` source text
(MapLoader itself needs Phaser), and parses the frozen ID sets out of
`docs/world-design-research/contract-and-pipeline.md` §1 for the LINT-6/7 contract checks.

Per-map metadata conventions (full detail in the script header):
- LINT-2 allow-flags: `allowWater: true` on a zones.js object entry; keys matching the
  amphibious regex (boat/bridge/lillypad/water-rock/cattail/fish); or a Tiled **map** custom
  property `waterAllowKeys` (string, comma-separated key substrings) for that map only.
  `water_source` gathering spots may sit on the 1-tile shore rim automatically.
- Documented approximations: door faces are assumed SOUTH for the LAW-5 clearance check;
  walkability = Collision layer + water + `collide:true` object collider boxes (physics truth,
  not visual footprints); exit triggers count as reachable if the player can get within 2 tiles
  of the exit's edge inside its tileRange.
