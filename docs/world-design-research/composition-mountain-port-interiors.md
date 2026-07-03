# Composition Research: Mountain Village, Coastal Port, House Interiors

Source: /Users/theshumba/Desktop/Gogo-World-References (categories 06, 07, 10).
All tile counts are in GAMEPLAY tiles (one walkable cell = one tile). References are 16px-tile
games; Gogo Arabic renders 16px art on a 64px grid — the tile COUNTS transfer directly.
Every rule below was measured/observed in the named reference images.

---

## 1. Cliff & Terrace Composition (mountain_village)

### Elevation bands
1. **Two to three elevation bands are enough to read as "mountain town".** Blackthorn City
   (`pokemon-crystal-blackthorn-city-fullmap.png`) is exactly 3 bands: mountain/lake band (top),
   mid shelf with 2 houses, and the main town floor — nothing more. Lavaridge
   (`pokemon-rs-lavaridge-town-fullmap.png`) reads as a mountain town with just ONE flat floor
   plus a 2–3-tile-thick cliff frame on its north and west edges. → For Gogo: mountain_village
   needs 2–3 bands max; do not carve 5+ micro-ledges.
2. **Band height: each terrace floor is 6–12 tiles deep (N–S) before the next cliff line.**
   Mandala (`secret-of-mana-mandala-mountain-village.png`) stacks three terraces of ~6–10 tiles
   each under the temple. Blackthorn's town floor is ~14 tiles deep, its mid shelf ~6. Shallower
   than 5 tiles looks like a decorative ledge, not a place to build on.
3. **Cliff walls are drawn 2–3 tiles tall (the vertical face), never 1.** Vale
   (`golden-sun-vale-mountain-village.png`) and Blackthorn both use 2–3-tile faces; a 1-tile lip
   reads as a garden wall. Kenmi cliff tiles: always stack at least 2 rows of face tiles.
4. **Cliff lines are stepped, never straight.** Blackthorn's cliff edges jog every 3–6 tiles
   (staircase silhouette in plan view). Garoh (`golden-sun-tla-garoh-cliff-village.png`) canyon
   walls change direction every 2–5 tiles. Rule: no cliff edge runs straight for more than 6
   tiles without a 1–3-tile jog, spur, or outcrop.
5. **Put the landmark on the highest band, dwellings below.** Mandala: temple on top terrace,
   village at the base. Bilibin/Blackthorn: palace/gym at top, houses on the floor. → For Gogo:
   put the zone's key interactable (shrine/elder house/lesson building) on the top band so the
   climb has a payoff.

### Stairs, ramps, switchbacks
6. **Stairs are 2 tiles wide (3 for a grand/ceremonial climb), 2–4 tiles long per band.**
   Blackthorn's band-connecting stairs are 2 wide; Mandala's temple staircases are 3 wide and
   ~6 long because they're ceremonial. Never 1-wide stairs on a main route.
7. **One stair per band, laterally offset from the stair below → the route zigzags.** Mandala
   offsets each staircase several tiles sideways so the climb sweeps left-right across the butte.
   Garoh's entire approach is a switchback canyon: path doubles back 3–4 times, each leg 6–12
   tiles long. Stacking stairs in a straight vertical line kills the sense of height.
8. **Secondary connections may be ladders/rope bridges (1 tile wide) — flavour only, never the
   main route.** Vale uses wooden bridges between terraces; Champa
   (`golden-sun-tla-champa-cliffside-village.png`) uses 1-wide ladders between cave-shelf tiers.
9. **A water feature falling THROUGH the bands sells elevation better than more cliffs.** Vale's
   spine is a river with two waterfalls dropping band to band, crossed by 3-tile bridges; Xian
   (`golden-sun-xian-terraced-village.png`) has a waterfall feeding a lotus stream. → Gogo desert
   version: a falaj/aqueduct channel or a thin spring cascade down the cliff into an oasis pool.

### Buildings & floor dressing on terraces
10. **2–4 buildings per band, never more; footprints 4×4 to 6×5 tiles, with 2–4 tile gaps and
    fronts NOT co-linear.** Blackthorn floor band: 3 houses staggered; Lavaridge: 4 buildings on
    one floor, each offset from its neighbour by 1–2 rows. Never an even grid.
11. **Wedge buildings against the cliff wall — back wall touching or 1 tile from the face.**
    Lavaridge's herb shop and Vale's top houses sit tight to the cliff; that contact is what makes
    the town feel "carved into" the mountain. In Kenmi: back building sprites right up to cliff
    tiles, leave the 1-tile shadow line.
12. **Doors carved directly into the cliff face are the cheapest extra interior.** Garoh's homes
    are cave mouths (1-tile-wide black arch in the cliff wall, small awning/rug in front); Champa
    is entirely cave doors on tiers. → Perfect Arabian move: cliff-dwelling doors with a striped
    canvas awning + pot cluster outside, no building sprite needed.
13. **Break flat terrace floors with 1–2 rock outcrops (2×2 to 3×3) and a sand/scree patch.**
    Blackthorn scatters four 2×2 rock outcrops across its lawn; Lavaridge has a 4×3 sand patch.
    One outcrop per ~10×10 area of open floor.
14. **Frame the zone entrance through a cliff pinch 2–3 tiles wide.** Garoh's canyon entry,
    Lavaridge's south gap, Mandala's approach path: the map edge exit narrows to 2–3 tiles of
    walkable ground between cliff walls, then opens onto the town floor. Strong arrival beat.

---

## 2. Harbour Layout (coastal_port)

### Land/sea boundary
1. **The shoreline is a 3-layer gradient: land → 1-tile edge (seawall rim or wet sand) → 1–2
   tiles shallow water → deep water.** Slateport (`pokemon-emerald-slateport-city-port-fullmap.png`)
   and Alhafra (`golden-sun-lost-age-alhafra-port-town.png`) both show sand→shallow→deep;
   Freedom port (`terranigma-freedom-port.png`) uses a hard stone quay edge with bollard posts.
   Never butt grass/sand directly against deep water.
2. **Use TWO boundary types in one map: hard quay (stone, buildings behind it) + soft beach
   (sand, open).** Slateport: stone harbor plaza south-east, open beach south. Olivine
   (`pokemon-crystal-olivine-city-port-fullmap.png`): cliff coast + harbor inlet. The contrast is
   what makes it a port town, not a town near water.
3. **Cut the water INTO the town: an inlet 4–8 tiles wide penetrating 6–12 tiles into the land
   block beats a flat coastline.** Olivine's harbor inlet cuts north into the city; Lianport and
   Freedom are built around water fingers. → For Gogo coastal_port: let a bay bite into the
   south/east edge so docks face inward.
4. **Shore rocks: 1–3 single-tile rocks in the shallows per screen, in loose diagonal runs.**
   Slateport and Champa scatter sea rocks just offshore — they fill empty water cheaply.

### Piers, dock fingers, quays
5. **Walkway piers are 2–3 tiles wide; a 1-wide pier is only for a fishing-rod flavour spot.**
   Kalay Docks (`golden-sun-kalay-docks-harbor.png`): 3-wide plank pier. Olivine's S.S. pier:
   3 wide. Stardew beach pier: 3 wide. Champa's fishing piers: 2 wide.
6. **Every pier ends or elbows into a staging platform 4×4 to 6×6 tiles.** Kalay's pier widens
   into a platform holding barrels, pots and 3 NPCs; Olivine's pier ends in a T-cross. The
   platform is where cargo + NPCs live; the walkway stays clear.
7. **Piers run PERPENDICULAR to the shore, and 2–3 fingers is a full harbour.** Freedom port has
   three fingers of differing lengths (8–16 tiles); Champa has two short fingers. One long +
   one short finger is enough for Gogo — vary the lengths, never mirror them.
8. **Boats moor broadside along the pier/quay edge, on the DEEP side, with a 1–2-tile gangplank
   ramp connecting deck to dock.** Freedom and Litz (`terranigma-litz-port.png`) ships lie
   parallel to the quay occupying ~4×10 tiles; Kalay's ferry connects by a plank to the pier
   platform. Small rowboats instead dock nose-in at pier tips (Champa). → Kenmi: one large dhow
   broadside at the main quay + 1–2 small boats nose-in at the finger tips.
9. **Quay platforms (harbour plazas) are big: 8–14 tiles wide, paved in stone, with bollards or
   posts every 2–3 tiles along the water edge.** Freedom/Litz quays; Slateport's lighthouse
   plaza. This plaza is the port's "town square".

### Warehouses, cargo, market
10. **Warehouse row: 1–2 long, plain buildings (6×4 to 8×5) sit directly ON the quay, long side
    parallel to the water, 1–3 tiles back from the edge.** Litz and Freedom both place the
    warehouse at the quay's inland edge; Slateport's harbor building faces the sea across a
    3-tile stone apron.
11. **Cargo clutter comes in clusters of 3–8 crates/barrels at quay corners, platform edges and
    warehouse doors — never evenly sprinkled.** Freedom port: crate stacks 2×2/2×3 with barrels
    at the cluster's loose end; SS Anne dock does the same. Leave the central 2–3-tile walking
    lane through every cluster zone. → Kenmi: crates, amphorae, coiled rope, sacks in triangles.
12. **Fishing dressing goes at pier roots: nets, hanging fish, pots within 2 tiles of where pier
    meets land.** Palo (`seiken-densetsu-3-palo-fishing-harbor.png`) and Dewford put all fishing
    props at the shore joint, not out on the walkway.
13. **A market strip belongs 3–6 tiles inland from the quay, parallel to it: stall tents 4×3,
    two columns × three rows, 2-tile aisles.** Slateport's famous market: 6 awning stalls in a
    2×3 grid with produce/crate clutter beside each stall. → This is the template for the souk
    edge of Gogo's port: striped Arabian awnings, 2-tile aisles, goods baskets flanking poles.
14. **Vertical flow: sea → docks → market/warehouses → houses → land exit, in bands.** Slateport
    reads bottom-to-top beach→plaza→market→civic→route; Palo descends town→terraces→quay→water.
    Put the land exit on the OPPOSITE map edge from the water so the whole zone is crossed.
15. **One vertical landmark near the water: lighthouse/tower on the highest or outermost point.**
    Olivine's lighthouse on the SE cliff; Slateport's lighthouse on the plaza; Alhafra's tower on
    the hill (label 6). → Gogo: a minaret-like harbour tower at the quay end, visible over roofs.

---

## 3. House Interior Room Composition (all interiors)

### Room sizes & shell
1. **Standard dwelling room: 8×6 to 11×9 walkable tiles, single room.** Pokémon R/S player home
   1F (`pokemon-rubysapphire-players-house-1f.png`) ≈ 10×8; Stardew tier-1 farmhouse
   (`stardew-farmhouse-tier1-interior.png`) ≈ 11×9; Ashalam dwellings
   (`dw3-gbc-ashalam-arabian-town-interiors.png`) run 5×4 to 8×6. Shops/inns: 10×8 to 14×10
   (Medina Inn ≈ 14×7). Nothing needs to exceed ~16×12.
2. **The top wall is drawn 2 tiles tall (wall face) and is the prime furniture wall; side walls
   are 1 tile.** Every reference (Pokémon, Stardew, Chrono Trigger, WinLu) hangs
   windows/shelves/fireplaces on the top wall face and pushes tall furniture against it.
3. **Entrance on the bottom edge, centred or offset one tile, with a 1×1 doormat/rug and a clear
   2-tile-deep landing zone — nothing blocks the door.** True in ALL 8 interior refs.
4. **Stairs (if any) occupy a top corner, 1×2, opposite the busiest furniture wall.** Pokémon R/S
   stairs top-right; Palo inn and Chrono houses do the same.

### Entrance → focal point flow
5. **One focal point diagonal or straight-line visible from the door: hearth, seating circle, or
   counter.** Stardew tier-1: door bottom-centre → fireplace top-right diagonal. WinLu majlis
   (`winlu-oriental-interior-majlis-cushions-lanterns.png`): door side → cushion circle centre.
   Build every room by placing the focal point FIRST, on the far half of the room from the door.
6. **Shops: counter is a full-width or ¾-width bar 2–4 tiles in from the top wall; shopkeeper
   stands behind it; goods shelves line the wall behind the keeper.** Medina Inn reception
   (`chrono-trigger-medina-inn-interior.png`), Palo shop, and the pottery storeroom's central
   table (`winlu-oriental-interior-pottery-storeroom.png`) all follow this. Customer side keeps
   a 2–3-tile-deep clear apron.
7. **Inns: guest beds in a row against the top wall — 3 beds (1×2 each) separated by 1-tile gaps,
   with a rug strip running along their feet.** Medina Inn is exactly this; Ashalam's inn repeats
   it. Reception zone (counter + keeper) sits at the room's other end, floor texture change
   marking the split.

### Furniture grammar (what goes where)
8. **Perimeter-first rule: beds, shelves, kitchen runs, chests all touch a wall; the ONLY things
   allowed to float mid-room are (a) a table/seating group ON a rug, (b) a rug itself.**
   Every reference obeys this; Pokémon R/S centre table sits on a 6×5 rug, all else on walls.
9. **Bed placement: a corner, headboard against the top or side wall.** Stardew tier-1 bed
   bottom-right corner; Ashalam beds top corners; Chrono bedrooms likewise. Never mid-room.
10. **Kitchen/work run: 3–5 consecutive appliance/counter tiles along one wall, uninterrupted.**
    Pokémon R/S top-wall run (counter-sink-fridge); Medina Residence counters along top wall.
11. **Rugs define zones, not floors: a large rug (4×3 to 6×5) under the seating/table group,
    optional 1×2–1×3 runner rugs marking walking lanes, plus a small accent rug near the door or
    bed.** Pottery storeroom uses two runner rugs as browsing lanes; R/S house has table rug +
    accent rug; Stardew has one free rug between bed and table. Rug always extends ≥1 tile beyond
    the furniture it anchors on every open side (WinLu low dining table rug).

### Arabian-specific interior grammar (the Gogo default)
12. **Majlis seating replaces chairs+table: a ring/cluster of 6–10 floor cushions (1×1 each)
    around a low centre, on a room-dominating rug, placed off-centre toward a wall.** WinLu
    majlis: cushion circle occupies ~5×4, brass floor lanterns (1×1) at two corners of the
    cluster, potted palms in the two nearest room corners, low tray table (2×2) with fruit
    adjacent — this is the CLOSEST match to Gogo homes and should be the default living room.
13. **Low dining hall variant: long low table 8–10×2 centred on a rug that clears it by 1–2 tiles
    all round; one pouf/cushion seat every 2 tiles down both long sides; dishes/hookah ON the
    table.** WinLu low-dining (`winlu-oriental-interior-low-dining-hookah-rugs.png`). Use for the
    inn/majlis of a wealthy NPC.
14. **Walls carry the culture: hanging wall rug (2×2–3×2) on the top wall, arched windows with
    light pooling on the floor beneath, wall torches/lanterns between windows every 3–4 tiles.**
    WinLu majlis + low-dining both. In Kenmi: use arch-window tiles + wall-rug objects on the
    2-tall top wall face.
15. **Storeroom/shop clutter: goods in clusters of 2–4 (pot groups, basket pairs, crate stacks)
    along walls and shelf ends, one 2×2 amphora group as an anchor, floor lanes kept 2 wide.**
    WinLu pottery storeroom — clusters have varied heights (tall jar + low basket) and NEVER
    repeat the same pair twice in a row.
16. **Lived-in = 3 touches per room minimum: something mid-task (open book, food on table, pot on
    hearth), one asymmetric prop (leaning basket, off-angle accent rug), one plant.** Stardew
    tier-1 (mug on table, plant, off-centre rug) vs its empty corners shows the balance: 60–70%
    of floor stays walkable. Staged = symmetric, full perimeter, empty centre; avoid.
17. **Courtyard-house option (authentic Arabian, cheap to build): rooms open onto a shared sand
    courtyard with a central well/pool 2×3, instead of corridors.** Ashalam's whole town is
    open-roof rooms around a sand court with a central water basin; Isis
    (`dw3-gbc-isis-desert-town-interiors.png`) repeats it with garden courts. → For larger Gogo
    interiors (elder's house, school), make the "interior" map a walled courtyard with 2–3 small
    rooms off it.
18. **Palace/grand rooms: symmetric plan + a 2–3-tile-wide carpet runner from entrance straight
    to the throne/focal seat, flanked by pillars or plant pairs every 2–3 tiles.** Isis palace
    throne approach; WinLu throne room. Reserve strict symmetry for royal_palace only — ordinary
    rooms must stay asymmetric (rule 16).

---

## Images studied (22)
- 06: garoh-cliff-village, vale-mountain-village, xian-terraced-village, lavaridge-town,
  blackthorn-city (crystal), mandala-mountain-village
- 07: alhafra-port-town, kalay-docks, freedom-port, litz-port, slateport (emerald),
  olivine-city (crystal), palo-fishing-harbor, champa-coastal-village
- 10: ashalam-arabian-town-interiors, isis-desert-town-interiors, winlu-majlis,
  winlu-low-dining-hookah, winlu-pottery-storeroom, ct-medina-inn, pokemon-rs-players-house-1f,
  stardew-farmhouse-tier1
