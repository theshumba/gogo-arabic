# Composition Rules — Bazaar / Palace / Library-Temple

Source: visual study of reference images in `/Users/theshumba/Desktop/Gogo-World-References/`
(categories `03-bazaar-marketplace`, `04-palace-castle`, `08-library-temple`).
All tile counts are in GAME TILES (one walkable cell — for Gogo Arabic, one 64px cell of 16px Kenmi art scaled 4x).
These rules are written to be followed literally by agents building Tiled maps.

---

## 1. Market street & bazaar layout (desert_marketplace + shop streets in any zone)

### 1.1 District shape: the market is a ROOM, not scatter
1. Make the market a bounded sub-district off the main road, roughly 18–24 tiles wide by 18–24 tall, with 1–2 clear entry mouths. Slateport fences its bazaar with a flower/fence border and one canopy gate off the 4-tile main road (`pokemon-emerald-slateport-city-outdoor-market-fullmap.png`). Kenmi mapping: use low mud-brick wall / rope-and-post fence tiles + a fabric arch gate as the market boundary.
2. Main roads are 3–4 tiles wide; market aisles are 2–3 tiles; alleys between building backs are 1–2 tiles. Slateport's spine road is 4 tiles; Louran's adobe street canyons run 2–3 tiles between shared-wall houses (`terranigma-louran-west-desert-town-fullmap.png`). Kenmi: sand/cobble road tiles for the spine, packed-dirt for aisles.
3. Never lay stalls on the main thoroughfare itself. Stalls line the EDGES of a plaza or fill a dedicated stall block; the road stays clear for crossing traffic (Slateport, `vectoraith-arabian-town-fountain-plaza-scene.png` where the awning row hugs the west street edge only).

### 1.2 Stall rows vs plaza rings — use BOTH, in different places
4. Stall-block pattern (the souk core): stalls in 2 columns x 2–3 rows. Each stall unit = awning 3–4 tiles wide x 2 deep (1 tile counter + 1 tile vendor standing space behind), goods clusters (crates/baskets/pots) 1–2 tiles at the stall's FLANKS, never in front. Slateport does exactly this with six blue-awning stalls (`pokemon-emerald-slateport-city-outdoor-market-fullmap.png`). Kenmi: market stall + striped awning props on the 64px grid, date/spice baskets as flank props.
5. Aisle between two facing stall rows = 2–3 tiles — wide enough for two NPC crowd walkers to pass, narrow enough to feel like a souk. Elvgames demos keep the crowd corridor at 2 tiles with vendors behind counters on both sides (`elvgames-marketplace-tileset-demo-1.png`, `-4.png`).
6. Plaza-ring pattern (the square): one circular/oval focal object — fountain 3x3 to 5x5 — centered at a crossroads, with a paved apron ring 2–3 tiles wide around it, and stalls/benches on the ring's OUTER edge only (`vectoraith-arabian-town-fountain-plaza-scene.png` fountain roundabout; Moonlighter's Rynoka square). Kenmi: tiled fountain centerpiece, palm pair beside it.
7. Ratio guide for desert_marketplace: one fountain plaza (focal), one stall block (commerce density), one shop-front street (buildings with awning attachments). Alhafra composes the same three beats on terraces (`golden-sun-tla-alhafra-arabian-town-fullmap.png`).

### 1.3 Awning rhythm & stall dressing
8. Alternate awning colours along a row — never two identical awnings adjacent (red/white, then purple/white, then plain canvas...). Elvgames rows read as a rhythm: colour, colour, gap, colour (`elvgames-marketplace-tileset-demo-1.png`).
9. Break stall rows every 2–3 stalls with a 2-tile prop gap: barrel cluster, well, cart, rug pile, or a standing NPC. Continuous stall walls read as fences, not markets (`elvgames-marketplace-tileset-demo-4.png` inserts a cart + crate gap mid-row).
10. Attach awnings to buildings too: a shop building gets a 3–4 tile striped awning over its door with a 1-tile goods table under it, making the street itself sellable frontage (`vectoraith-arabian-town-fountain-plaza-scene.png`, the two shopfronts north of the fountain; also Elvgames' market-hall building ringed by stalls).
11. Ground-clutter law: goods sit in clusters of 2–4 props (pot+pot+basket, crate stack + sack), placed at corners and stall flanks. Solo props scattered evenly = noise. Kakkara clusters its pots at building corners and path junctions (`secret-of-mana-kakkara-desert-town-fullmap.png`).

### 1.4 Crowd walkways & building fabric
12. Keep a continuous 2-tile-minimum walkable loop through the whole market so crowd NPCs can circulate without dead ends; dead-end nooks (1 per market, 2–3 tiles deep) are for a beggar/cat/secret prop, not for stalls.
13. Desert-town fabric around the market: buildings share walls or sit 0–1 tiles apart in blocks of 2–4, blocks staggered by 2–3 tiles so no two block faces align across the street; streets read as canyons between flat adobe roofs (`terranigma-louran-west-desert-town-fullmap.png`, `-east-`). Kenmi: flat-roof mud-brick building pieces butted together, stagger every block.
14. Give every enterable shop door a 1-tile "apron" of distinct paving + a sign/lamp beside it so doors read at a glance (Slateport shops, Moonlighter's banner + barrels entrance in `moonlighter-rynoka-shop-exterior-banner.jpg`).

### 1.5 Shop interiors (market shops, any zone)
15. Shop interior formula (from `moonlighter-shop-interior-home-layout.jpg` and Alhafra/Xian shop interiors): door at south; entrance mat 1–2 tiles; counter with shopkeeper along a wall 2–4 tiles from the back, NOT blocking the door axis; 1–3 freestanding display tables in the middle with a full 1-tile walkaround each; wall-hugging decor (shelves, pots, rugs) fills the perimeter. Room size 8x8 to 12x10.
16. Carpet = importance: put one patterned rug under the transaction point (counter or central table). Every Xian and Alhafra shop centres a rug (`golden-sun-xian-town-fullmap.png`, `golden-sun-tla-alhafra-arabian-town-fullmap.png`).

---

## 2. Palace grounds composition (royal_palace)

### 2.1 The approach axis — status is a straight line
1. The palace gets ONE straight ceremonial axis: outer gate → forecourt → palace door, 40+ tiles of unbroken sightline if the zone allows. The approach path is 3–4 tiles wide (wider than any town road) and never bends (`vectoraith-arabian-palace-walled-garden-courtyard.png` runs a 3-tile path dead straight from south gate to the triple-arch; Zelda LttP runs causeway → bridge → gate → forecourt → door on one column of tiles, `zelda-lttp-hyrule-castle-grounds-overworld.png`).
2. Stack 2–3 THRESHOLDS on the axis: e.g. bridge/steps, then wall gate, then facade arch. Each threshold is a 2–4 tile pinch that resets the reveal (Zelda LttP crosses moat-bridge, wall-gate, inner-garden gate). Kenmi: sandstone arch gate, then carved wooden double door.
3. Flank the axis symmetrically with paired vertical props at a fixed rhythm — banner + statue + shrub repeating every 2–3 tiles, always in mirrored pairs (`vectoraith-arabian-palace-walled-garden-courtyard.png`: red banners, white/black statues, potted palms in matched pairs). SYMMETRY ON THE AXIS ONLY — this is the status language.
4. Gardens OFF the axis stay informal: scattered palms, irregular grass patches, a pot cluster in one corner. The Vectoraith walled garden is symmetric within 2 tiles of the path and loose everywhere else. Kenmi: palm + flowering shrub scatter on grass patches over sand.

### 2.2 Walls, gates, plaza
5. Wall the whole compound: crenellated wall ring with square corner towers (3x3–4x4 footprint) and exactly one public gate (plus at most one hidden side door). Both Vectoraith palaces and DQ3 Isis's grounds are fully enclosed (`dq3-snes-isis-arabian-palace-town-fullmap.png`, right-hand grounds map).
6. Put a hard-paved plaza 10–16 tiles wide directly in front of the palace facade — stone, not sand — edged by paired obelisks/lamp pillars and banners; keep its centre EMPTY (crowd/ceremony space). Secondary buildings (mosque, guard tower) sit at the plaza's flanks, never on the axis (`vectoraith-arabian-golden-dome-palace-plaza.png`).
7. Water as luxury: a pond, pool or twin water channels inside the walls, framing (not crossing) the axis. DQ3 Isis holds a pond at the top of its walled courtyard; the Vectoraith plaza runs channel pools down both sides. Kenmi: water tiles with tiled-edge border, lily/reed props.
8. Colonnades signal royalty outdoors too: a double row of free-standing pillars (1 pillar every 2 tiles, rows 3–5 tiles apart) flanking a courtyard walk (`dq3-snes-isis-arabian-palace-town-fullmap.png` grounds map, twin pillar rows; `arabian-nights-snes-palace-fullmap.png` facade arcade).

### 2.3 Facade & massing
9. Facade hierarchy: tallest dome/tower centered on the axis, smaller matched domes/minarets at the corners — 1 big + 2–4 small (`vectoraith-arabian-palace-walled-garden-courtyard.png`: gold central dome + 4 minaret domes). Build the palace facade 12–20 tiles wide so it terminates the axis visually.
10. Entrance = 3 arches (center one taller/decorated), with paired lamps or guards 1 tile either side of the center arch (`vectoraith-arabian-palace-walled-garden-courtyard.png`, `arabian-nights-snes-palace-fullmap.png` bottom exterior with paired lamp posts).
11. Forecourt garden formula (compact alternative to rule 6): central fountain 3x3 + four symmetric planting beds (palm + hedge, each bed 2x3–3x3) at the fountain's diagonals (`arabian-nights-snes-palace-fullmap.png` exterior forecourt).

### 2.4 Palace interiors
12. Throne hall: one red/patterned carpet 2–3 tiles wide running the FULL hall length (20–40 tiles) from door to throne dais; dais raised 1–2 steps at the far end; column pairs every 3–4 tiles along the carpet (`dq3-snes-isis-arabian-palace-town-fullmap.png` throne hall; every Arabian Nights hall runs the same carpet axis, `arabian-nights-snes-palace-fullmap.png`).
13. Flank the throne carpet with 2 or 4 symmetric sunken garden atriums or pool insets (3x4–4x5 each) cut into the hall floor — the DQ3 Isis signature that reads instantly as "Arabian palace". Kenmi: interior flower-bed/pool tiles inset in stone floor.
14. Interior wayfinding: carpet marks the important route; side rooms hang off carpeted corridors in a chamber–corridor–chamber rhythm; windows/arcade openings line the south walls so halls feel lit (`arabian-nights-snes-palace-fullmap.png` arched south arcades on every room).

---

## 3. Sacred & scholarly spaces (ancient_library + any shrine/mosque corner)

### 3.1 Approach — reverence is distance + effort
1. A sacred building is never entered straight off a road: force an approach of 8–20 tiles with at least one direction change or climb — winding hill path + bridge over water in Lama Temple (`golden-sun-lama-temple-fullmap.png`), long stepped desert forecourt in the Arabian Nights shrine (`arabian-nights-snes-silver-shrine-fullmap.png`). Kenmi: stone-stair tiles up a dune/terrace, palm-flanked path.
2. Station 2–4 idle "keeper" NPCs along the approach and at the door (monks on the Lama path). In Gogo: scholars/students for the library.
3. The building sits ELEVATED or set back on a platform 1–2 steps above the surrounding ground, facade centered on its own mini-axis even if the zone around it is informal (`golden-sun-lama-temple-fullmap.png`, `ff5-advance-library-of-the-ancients-fullmap.png` exterior on its walled mound).
4. Exterior massing for the library: modest cross- or T-shaped stone building, 10–14 tiles wide — grandeur lives INSIDE (both FF5 library exteriors are small compared to their interiors).

### 3.2 Library interiors — shelves are walls
5. Treat bookshelf banks as architecture: runs 4–10 tiles long, 1 tile deep, placed to FORM corridors and rooms, not lined against existing walls only (`ff5-snes-ancient-library-fullmap.png` — the entire dungeon's walls are shelves).
6. Shelf aisles are 1–2 tiles wide; a 1-tile aisle is a "stacks" moment (use sparingly, max 2 per map), 2-tile aisles are the norm so crowds/companions fit.
7. Reading room formula: an open pocket 6x8–10x8 containing 2–3 long tables (3x1 or 4x1) with chairs on both long sides, 1-tile walkaround per table, one lectern or globe as focal prop (`ff5-snes-ancient-library-fullmap.png` room A/B; `ff5-advance-library-of-the-ancients-fullmap.png` entry hall with desk + twin tables right of the stair).
8. Entry hall is symmetric: central door → central stair/lectern, shelf walls mirrored left/right; the maze-ness begins only past the first room (FF5 Advance entry hall). Reverence first, labyrinth second.
9. Hide exactly one secret: a 1-tile gap behind/among shelves leading to a hidden nook or passage (FF5's shelf passages). Map it to a Gogo collectible/lesson reward room.
10. Small scholar's room formula (for side rooms and NPC hermits): 8x8–11x11 with bed, 1–2 bookshelves, desk with open book, pot cluster — the whole DQ3 Desert Shrine is this one room and it reads perfectly (`dq3-snes-desert-shrine-fullmap.png`).

### 3.3 Prayer/ceremony halls — the nave pattern
11. Nave formula: central carpet aisle 2–3 tiles wide, flanked by mirrored rows of benches/prayer rugs (each 2–3 tiles long, 1-tile gaps between rows, 2 columns), leading to an altar/mihrab dais raised 1–2 steps at the far end, lit by windows behind it (`chrono-trigger-cathedral-600ad-fullmap.png` nave; scale it down to a 12x16 hall for Gogo).
12. Centered-shrine variant: circular dais 3x3 in room centre, big round carpet 4x5 in front of it, symmetric pillar pairs at the four corners with kneeling figures (`golden-sun-lama-temple-fullmap.png` prayer-hall interior). Good for the library's "wisdom shrine" or a mosque interior.
13. Reverence through emptiness: sacred rooms keep 40%+ of floor tiles empty; clutter density is HALF that of a shop or house. Long empty carpet runs before the focal point are the point (CT cathedral's 30-tile carpet; Arabian Nights' throne approaches).
14. Column discipline: pillars in pairs, aligned to the carpet, one pair every 3–4 tiles; torch/lamp props mounted at every second pillar (`arabian-nights-snes-palace-fullmap.png`, `chrono-trigger-cathedral-600ad-fullmap.png`).
15. Multi-room sacred complexes use chamber–corridor–chamber rhythm: small antechamber (5x5–7x7) → narrow corridor (2 wide) → large hall, repeating; never hall-directly-into-hall (`arabian-nights-snes-ancient-temple-fullmap.png` room chain, Pokemon League chamber rhythm per manifest).

---

## 4. Cross-cutting laws (apply to all three zone types)

1. No even grids, ever: buildings cluster in groups of 2–4 with 2–4 tile gaps; stagger every row/cluster by 2–3 tiles; align things ONLY on ceremonial axes (every reference town obeys this; Slateport's civic buildings stagger while only its market stalls grid).
2. One focal water feature per outdoor zone (oasis pond, fountain, channel) with paths that visibly bend toward it; buildings face it (`secret-of-mana-kakkara-desert-town-fullmap.png` pond, Vectoraith fountains).
3. Path hierarchy is legible by width AND material: axis 3–4 tiles paved > street 2–3 packed dirt > alley/garden trail 1–2 sand with stepping-stone or pot-cluster markers (Kakkara marks trails with stones and pots rather than full paving).
4. Symmetry = status dial: fully symmetric (palace axis, shrine) → partially symmetric (market plaza ring) → asymmetric organic (residential lanes, gardens off-axis). Choose per-area deliberately.
5. Prop clusters of 2–4 at corners, junctions and flanks; leave the centres of walkways and plazas clean.
6. Carpet/rug marks every transaction or veneration point — shop counters, thrones, altars, lecterns (universal across Xian, Alhafra, Isis, Arabian Nights, Moonlighter).
