# Composition Research — Town Maps & Detail Language

Source: `/Users/theshumba/Desktop/Gogo-World-References/` categories `01-master-town-maps` and
`11-detail-language`. Images actually inspected: Golden Sun Lalivero, Suhalla, Alhafra, Garoh,
Kalay; Pokemon Emerald Mauville, Slateport, Oldale, Lavaridge, Route 104/111/115 crops; Golden Sun
Kalay/Tolbi square crops; all three Kenmi desert demo scenes.

All rules are stated in TILES. References are 16px-tile games; Gogo Arabic renders 16px art on a
64px grid — the tile counts transfer 1:1, only the pixel size differs. Treat every number here as
a default, not a straitjacket; ±1 tile is fine, ×2 is not.

---

## 1. Whole-Town Composition — how a town reads at a glance

1. **One town = one sentence.** Every good reference town can be summarised in one clause:
   "walled desert town around a tower" (golden-sun-lalivero-desert-town-fullmap.png), "crossroads
   hamlet with 4 houses" (pokemon-emerald-oldale-town-fullmap.png), "port with a market and a
   mansion on a hill" (alhafra). Before laying tiles, write that sentence for the zone; every
   element must serve it. Gogo: each of the 8 zones gets exactly one such identity sentence.
2. **The landmark is visible from the entrance.** Lalivero's golden obelisk tower sits on the
   path axis straight up from the south gate; Kenmi's pyramid dominates the frame the moment the
   scene loads (kenmi-desert-temple-torch-path.gif). Rule: from the tile the player spawns/enters
   on, the zone's landmark (minaret, palace dome, big tent, lighthouse) must be within ~12 tiles
   of the walk-in direction or on the same path axis.
3. **Town size budget:** hamlet = ~20x20 tiles with 3–5 buildings (Oldale, Suhalla); mid town =
   ~40x30 with 6–9 buildings (Mauville, Lalivero town area); large/city = ~40x60 with 10–14
   buildings split into districts (Slateport, Kalay). Never exceed ~14 exterior buildings — the
   references never do; more reads as noise.
4. **Buildings cluster in groups of 2–4 with 2–4 tile gaps** between buildings in a cluster and
   6–10 tile gaps between clusters (Kalay square crop, Alhafra plaza). Never place buildings at
   even intervals along a line — Mauville staggers every facade depth by 1–3 tiles.
5. **All doors face the camera (south) or a path.** Every reference building's door opens onto a
   path or gets a 1–2 tile stub path connecting the door to the nearest road
   (pokemon-emerald-mauville-city-fullmap.png). No door ever opens onto raw grass/sand.
6. **Enclose the town.** Every town has a hard visual container: sandstone wall (Lalivero),
   cliff bowl (Garoh, pokemon-emerald-lavaridge-cliff-enclosed-town crop of same map), tree ring
   1–3 deep (Oldale, Mauville), or sea (Slateport). The container is irregular — depth varies
   1–3 tiles along its run. Gogo: sandstone walls, dune cliffs, palm belts, and sea are the four
   Kenmi containers; pick one primary per zone.
7. **A quiet corner per town.** Each reference keeps one low-density pocket (Alhafra's orchard
   hill path, Lalivero's palm corner) — a small area with no buildings, 2–3 props, one NPC at
   most. Gives the eye a rest and makes the busy areas feel busy.

## 2. Entrance Framing

1. **One dressed main entrance per town, 2–3 tiles wide**, framed by a symmetric pair: gate
   towers (Lalivero south gate), fence ends + banner flags (Alhafra south entrance), tree pair
   (Slateport north avenue). Secondary exits stay plain 2-tile gaps in the container.
2. **Entrance leads to a decision point within 6–10 tiles.** From the gate, the path reaches the
   first junction or plaza in under 10 tiles in every reference (Alhafra: gate → plaza in ~7).
   Never a long dumb corridor into town.
3. **Signal the town before the gate:** fences funnel toward it (alhafra crop), path widens by
   1 tile in the last 3–4 tiles, or paired props (jars, torches, palms) flank the approach.
   Kenmi kit: paired torches, paired palms, or paired jars at every zone exit/entrance.
4. **Monumental entrances are symmetric ONLY on the approach axis.** Kenmi temple: torch pairs at
   ~4-tile intervals plus obelisk pairs flanking a 3-tile path — but everything off that axis
   (bones, cacti) is scattered asymmetrically. Use strict symmetry exclusively for palace/temple/
   library approaches; break it everywhere else.

## 3. Focal Points & Plazas

1. **One primary focal per town + one secondary per district.** Tolbi: statue fountain (primary)
   + palace dome (secondary). Lalivero: obelisk tower + gate. Slateport: lighthouse + museum.
   Focals are TALL or ANIMATED (tower, fountain, statue, waterfall) — they contrast the flat
   roofscape. Kenmi equivalents: minaret/tower, well, oasis pool, big carpet+camel vignette,
   pyramid, waterfall.
2. **Plazas are 6x5 to 10x8 tiles of distinct ground material** (stone in Tolbi, sand in Alhafra)
   with the focal placed off-centre by 1–2 tiles or centred only when the plaza terminates a
   monumental axis (goldensun-tolbi-fountain-square.png — round fountain on a raised 8x6 stone
   pad where 4 paths meet).
3. **3–5 paths radiate from the plaza**, entering at unequal angles/offsets — never a perfect
   plus. Kalay's square (goldensun-kalay-town-square-fountains.png) has the crossroads shifted so
   no two opposite arms align exactly.
4. **Focal points earn 2–3 NPCs.** References crowd people at fountains and market rows, and
   leave 1 NPC per side street. Place Gogo NPC spawn coordinates accordingly.
5. **Wells are the small-town focal.** Suhalla, Kalay and Garoh all use a well/firepit as the
   centre of a hut cluster. Kenmi has a well sprite — default centrepiece for oasis_village and
   bedouin_camp commons.

## 4. Districts & Ground-Material Zoning

1. **Change the ground material to change the district.** Slateport: grass → pale cobble market →
   stone harbour plaza → beach sand, each boundary irregular. Lalivero mixes sand, grey flag,
   and purple flagstone. Rule: 2–4 ground materials per town, each district owning one; blend
   boundaries with 1–2 tile jagged steps, never a straight seam.
2. **District recipe (large towns):** commerce (market/plaza) at the crossroads, civic/landmark
   at the END of an axis (palace up an avenue — goldensun-kalay-palace crop shows the approach
   avenue with stairs), residential filling the sides, and the "working" edge (docks, farms,
   pens) against the container.
3. **Elevate what matters.** Alhafra's mansion sits on a hill up a winding path; Kalay's palace
   is above stairs; Tolbi's fountain is on a raised pad. Give the palace/temple/library +1
   terrace level with a 2-tile stair — cheap hierarchy on a flat tile grid.
4. **Market district:** stall rows, 2 columns x 2–3 rows, stalls 2–3 tiles wide, aisles 2–3
   tiles between them, with loose goods (crates, jars, produce mats) stacked at row ends
   (pokemon-emerald-slateport-market-stalls.png). Border the market with a flower/jar line, not
   a wall. Kenmi: awning stalls + carpets + jar clusters; desert_marketplace should be exactly
   this pattern in a sand-cobble court.

## 5. Path Language

1. **Widths: main road 3–4 tiles, secondary streets 2, alleys/garden paths 1.** Mauville's spine
   is 4; Kenmi's village road is 3 (kenmi-desert-arabian-village-road-junction.gif); door stubs
   are 1–2. Width = importance; never make a side path wider than the road it leaves.
2. **Paths curve in 2–4 tile segments with soft scalloped edges.** The Kenmi road bends twice
   across one screen and its edge steps in/out every 2–3 tiles. Straight runs longer than ~8
   tiles are reserved for monumental axes (temple approach, palace avenue).
3. **Junctions are T's, not X's.** References overwhelmingly use T-junctions with the joining
   path offset (route104-path-junction-flowerbeds, Kenmi village). Full crossroads appear once
   per town at most, at the plaza. Anchor every junction corner with something: a building
   corner (Oldale), flowerbed (Route 104), sign, or jar cluster.
4. **Every path terminates at a reason:** a door, a gate/exit, a focal, or a vista (dead-ends
   onto the shoreline/cliff with a bench, jar or boat). No path may fade into blank ground —
   Route 110/104 crops always land paths at houses or shores.
5. **Signs sit 1 tile off the path at junctions and entrances,** on the approach side. Pokemon is
   rigorous about this; do the same with Gogo's Arabic-labelled signposts.
6. **Worn-path alternative for soft settlements:** Oldale's "roads" are just lighter worn grass
   blobs ~4 tiles wide. Kenmi equivalent: darker-packed sand as worn path through bedouin_camp
   and farmland instead of hard cobble — saves the paved look for towns.
7. **Path hierarchy carries the eye:** ground colour of the main road should contrast the base
   ground more strongly than side paths do (Lalivero: purple flagstone main path on sand;
   Kenmi temple: red-brown worn path on tan sand).

## 6. Edge Grammar — shorelines, cliffs, walls, fences, bridges

1. **Shorelines scallop in 2–4 tile arcs, never straight,** with a 1-tile wet/shallow rim between
   sand and deep water (pokemon-emerald-route104-beach-water-edge.png). Add 1–3 rocks or a boat
   in the shallows every 8–12 tiles of coast (route109 style). Coastal_port: moor 2–3 boats
   parallel to shore like Alhafra.
2. **Sand→grass and district boundaries step diagonally,** 1–2 tiles per step, echoing the
   shoreline (same Route 104 crop). Any biome boundary drawn as one straight line is wrong.
3. **Cliffs come in stacked terraces 3–6 tiles deep,** each ledge line staggered from the one
   below, connected by 2-tile stairs (pokemon-emerald-route115-mountain-terraces-stairs.png).
   Cave/door mouths are tucked into the cliff face and marked with torches (Garoh entrances).
   Mountain_village: 3 terrace levels max, one 2-tile stair per level, staggered horizontally.
4. **Oasis edge = grass ring.** Kenmi oasis (kenmi-desert-oasis-waterfall-palm-edges.gif): water
   pool wrapped by a 2–3 tile grass band, palms planted ON the band in clusters of 2–4, then
   desert. Waterfall enters from a cliff wall and connects by a 2-tile stream. This is the
   canonical oasis_village core.
5. **Walls and fences are punctuated, not continuous.** Lalivero's town wall changes height at
   corners and carries jar runs at its base; Pokemon fences run 4–8 tiles then break for a path
   or corner post (littleroot/fallarbor crops). Rule: any fence/wall run longer than 8 tiles
   must be interrupted (gate, jar cluster, tower, plant).
6. **Fences define yards and pens, waist-height only:** 1-tile fence outlining a 4x6–6x8 lot
   around a house or livestock pen (Mikasalla-style pens; Fuchsia paddocks). Farmland: fence
   crop plots in 4x6 rows with 1-tile gaps like goldensun-xian-bridge-fenced-field-paths.png.
7. **Bridges are short and framed:** 2 tiles wide, 3–6 tiles long, land "ramp" tiles at both
   ends, rails/pillars visible (route110-bridge-pillars crop, Vale rope bridge). A bridge is a
   mini-focal — never more than 2 per zone, always on the main path.
8. **The container leaks one vista.** Slateport's sea, Alhafra's beach with tide pools, Kalay's
   cliff-shore: leave one stretch where the player can stand at the container edge and see the
   "outside" (sea, dunes, mountains) for depth.

## 7. Prop Rhythm & Density Budgets

1. **Budget per 20x15-tile screenful (one camera view):** 8–15 props in town cores, 5–8 on
   routes/outskirts, 3–5 in deliberate quiet corners. The Kenmi village screen (~39x31 tiles)
   carries ~14 props total and reads rich, not cluttered.
2. **Cluster props in 2–4s; scatter singles between.** Golden Sun places jars in runs of 2–4
   against walls, then a single jar 6+ tiles away. Never distribute props evenly — 70% of props
   in clusters near buildings/paths, 30% loose.
3. **Props hug architecture:** jars/crates at house corners and along wall bases (Lalivero,
   Suhalla), barrels flanking doors, hay bales beside stairs (Kenmi). Open-ground props (rocks,
   cacti, bones) stay ≥2 tiles off paths.
4. **Build 1–2 story vignettes per town:** Kenmi's camel + spread carpet + trader + campfire is
   4 props telling one story in a 5x4 patch; Alhafra's two beached rowboats do the same. Each
   Gogo zone gets 1–2 such composed vignettes near (not on) the main path.
5. **Desert scatter rule (from route111-desert-cliff-rocks + Kenmi):** open sand fields carry
   ~10–14 small props per 30x22 screen — rocks in 1s and 3s spaced 5–8 tiles apart, cacti and
   bone piles as singles, plus 2–3 large irregular patches of lighter/darker sand (4–10 tiles
   across) so the ground itself varies. Never let bare sand run more than ~8 tiles without a
   ground-variation patch or prop.
6. **Repeat with variation:** flower/jar edging alternates 2–3 sprite variants and skips tiles
   (Slateport's market flower line skips every 3rd–4th tile). Identical props in an unbroken
   line read as machine fill.
7. **Torches/lamps mark meaning:** placed in pairs at entrances and every ~4 tiles along a
   ceremonial approach only (Kenmi temple). Don't line ordinary streets with them.

## 8. Asymmetry vs Grid Monotony

1. **Stagger everything by 1–3 tiles:** building facades off a shared baseline (Mauville),
   junction arms off-axis (Kalay), plaza focal off-centre (Tolbi pond crop). If any three
   elements align exactly, move one.
2. **Rotate cluster shapes:** a 3-building cluster forms an L or a triangle, never a row
   (Garoh's 3 huts around the firepit; Oldale's 4 houses pinwheel around the junction).
3. **Symmetry is a spice with exactly two uses:** monument approaches (Section 2.4) and paired
   entrance framing. Kalay's twin fountains sit symmetric at the head of the square — and
   everything below them is staggered. Copy that contrast.
4. **Vary the container depth:** tree/cliff/wall borders swell 1→3 tiles and back (Oldale's tree
   ring). A constant-width border is the fastest way to look procedural.
5. **Diagonal composition beats orthogonal:** Alhafra's mansion is NW, market centre, beach E,
   gate S — major elements sit on diagonals from each other, so the eye sweeps the whole map.
   Place each Gogo zone's landmark, plaza and main gate on a rough diagonal, not one axis.
6. **Break long horizontals** with a vertical element every 8–12 tiles: tower, palm, stair,
   waterfall (Vale/Champa pattern). Flat-roof Kenmi towns especially need palms and minarets as
   vertical punctuation.

## 9. Zone-Type Recipes (references → the 8 Gogo zones)

1. **oasis_village** — Kenmi oasis core (pool + grass ring + palm clusters) as the focal, Suhalla
   scale: ~5 buildings on a winding 2–3 tile worn path routing SW→NE through town, well by the
   pool, jar clusters at doors.
2. **desert_marketplace** — Slateport market grammar inside Lalivero walls: sand-cobble court,
   stall rows 2x3 with 2–3 tile aisles, carpet + goods vignettes, one dressed gate, market
   crowd NPCs at stalls.
3. **royal_palace** — Kalay palace approach: walled precinct, 3-tile straight avenue with paired
   pools/torches, stairs up one terrace to a domed facade; strict symmetry on this axis only.
4. **bedouin_camp** — Garoh logic with tents for huts: cliff/dune-bowl container, 3–4 tents in a
   triangle around a firepit/well common, worn-sand paths, camel + carpet vignette, torch-marked
   entrance gap.
5. **mountain_village** — Route 115 terraces + Vale: 3 cliff terraces, 2-tile stairs staggered,
   houses 2 per ledge, one bridge or waterfall thread as the vertical focal.
6. **coastal_port** — Alhafra: south gate, sand plaza core, docks/pier on the sea edge, 2–3
   moored boats, lighthouse-analogue tower focal, scalloped shoreline with tide-pool pockets.
7. **ancient_library** — Kenmi temple approach grammar: isolated monumental building, 3-tile
   ceremonial path with torch/obelisk pairs every ~4 tiles, bone/ruin scatter off-axis, quiet
   density budget (5–8 props/screen).
8. **farmland** — Xian fields: fenced 4x6 crop plots in staggered rows with 1-tile gaps, worn
   paths between plots, farmhouse cluster at one corner, well + hay/produce vignettes, stream
   with one 2-wide bridge.
