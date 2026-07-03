# Kenmi Asset Inventory — What the Library Can Actually Build

> Phase 0 research for the full world rebuild. Source of truth: `public/assets/kenmi/` (969 PNGs),
> keyed by `src/data/kenmiCatalog.js` (auto-generated, 592 spritesheets / 377 images) and
> `src/data/kenmiFrameTables.js` (~106 tile sheets with 9-slice frame indices).
> Coverage today: only **101/969 (10.4%)** of the catalog is used by the current zones
> (`.planning/phases/97-visual-world-layer-rebuild/KENMI-COVERAGE.md`) — the rebuild has a huge unused palette.

## How assets are keyed (design constraint)

- **Texture key formula:** `kenmi-<packPrefix>-<dir-path>-<basename>`, e.g.
  `kenmi-desert-houses-desert-house-2.3`, `kenmi-base-tiles-grass-grass-tiles-3`.
  Pack prefixes: `base`, `desert`, `dungeons`, `ui`, `char`, `shroom`, `military`, `halloween`, `christmas`, `volcano`.
- **Everything in the catalog has a working key** — BootScene loads via `KENMI_CATALOG`; zone manifests add nothing extra.
- **Frame tables exist ONLY for `/tiles/` directories** (`KENMI_FRAME_TABLES`: cols/rows + CORNER/EDGE/SOLID/INNER indices).
  Props/sheets outside `/tiles/` are used via explicit **crop regions** declared in `MapLoader.js` / `spriteKeyMap.js` —
  a new prop from a multi-item sheet needs a crop region added (data-only, no logic change).
- **Scale policy (MapLoader):** art is 16px-baseline, world tile = 64px. Pure 16px props scale ×4 (=1 tile).
  Larger art (buildings) renders at ×2 with a **4-tile max-footprint cap** (`NATIVE_OBJECT_SCALE=2`,
  `MAX_OBJECT_FOOTPRINT_TILES=4`). Footprints below use this policy.
- **Cultural excludes (enforced at module load, `CULTURAL_EXCLUDES`):** no santa, reindeer, pumpkin, witch,
  halloween, crosses. Effectively the whole `halloween/` pack and most of `christmas/` are unusable; the church
  (448×144, has a cross) should be avoided.
- **Filename typos persist into keys** (catalog is filename-derived): `house-2-stone-base-blackpng`,
  `royal-pantst-1-red`, `lanter-posts`, `minecrats`, `with-hut`. Use the typo'd key or skip.

---

## 1. TERRAIN — ground, autotiles, transitions

All autotile sheets are 16px frames; frame indices come from `KENMI_FRAME_TABLES`. Wired-in constants in
`MapLoader.js`: `GRASS_KEY = grass-tiles-3` (16×10), `WATER_KEY = water-tile-3-anim` (24×5 animated),
`BEACH_KEYS = desert-beach-tiles-1/2/3` (5×3).

| Family | Keys / variants | Layout | Blends |
|---|---|---|---|
| Grass | `base-tiles-grass-grass-tiles-1..4` (4 palettes) + `grass-N-middle` fill + `path-middle`, `path-decoration` | 16×10 blob incl. inner corners | grass ↔ dirt path (edges baked in) |
| Water (animated) | `base-tiles-water-water-tile-1..4-anim` + static, `water-stone-tile-1..4(-anim)`, `water-middle(-anim-1/2)`, `water-foam-animation`, `fish-animated-tile`, `water-decoration` | 24×5 animated blob | water ↔ grass bank (tile-N) and water ↔ stone (stone-tile-N) |
| Sand/beach (base) | `base-tiles-beach-beach-tiles` (30×3 animated shoreline), `beach-decor-tiles` | 30×3 | sand ↔ water |
| Desert sand/water | `desert-tiles-desert-beach-tiles-1/2/3` (3 sand hues, THE current ground system), `desert-water-tiles-1/2/3`, `desert-water-foam-animation` | 5×3 | sand ↔ water pools/oasis |
| Desert grass patch | `desert-tiles-desert-grass` (3×5) | blob | scrub-grass ↔ sand |
| Cliffs | `base-tiles-cliff-stone-cliff-1..4-tile` (14×6) + matching `-cave-entrance`; `desert-tiles-desert-cliff-tiles-1..3` (13×11) | multi-row cliff faces | elevation edges; desert + stone palettes |
| Waterfalls | `base-tiles-waterfall-waterfall-1..8`, `desert-cliff-waterfall-1..3` | animated columns | pairs with cliffs |
| Roads/paving | `cobble-road-1/2` (3×5 blob), `pavement-tiles` (9×8), farmland `farmland-tile` + `farmland-wet-tile` (7×8 blob) | blobs | path ↔ grass/sand |
| Bridges | `bridge-stone-horizontal` (12×7), `bridge-stone-vertical`, `bridge-wood`, `bridge-wood-1`, `desert-tiles-desert-bridge`, `volcano-bridge` | segments | span water |
| Cave/underground | `cave-walls` (7×8), `cave-floor-1/2`, `cave-water(-animation)`, `cave-doorway`, `cave-support-1/2`, `rails` | roomset | interiors/mines |
| Dungeon | `dungeons-dungeon-1` (13×13 full roomset) and `dungeon-2` (13×12, alt palette), sewer tilesets, stairs | roomset | palace/library interiors candidate |
| Deck/misc | `wooden-deck-tiles` (5×6 — docks), `hedge-tiles` (4×4), `picnic-blankets`, `shroomlands-grass-*` (blue/green/purple), `volcano-tiles` (29×9 lava) | blobs | — |

**Transition matrix that actually exists:** sand↔water, grass↔water, stone↔water, grass↔dirt-path,
scrubgrass↔sand, farmland↔anything (blob), cliffs over any ground. **Missing:** direct grass↔sand blend
(must meet at a cliff, road, or hard edge), and any snow ground.

## 2. BUILDINGS — exteriors (source px → rendered 64px-tile footprint @ MapLoader policy)

Desert pack (the Arabian core — adobe/mudbrick, 4 colourways each `.1–.4`):

| Building | Source px | Rendered tiles |
|---|---|---|
| `desert-house-1.1–1.4` (small flat-roof) | 80×80 | 2.5 × 2.5 |
| `desert-house-2.1–2.4` (tall two-storey) | 96×128 | 3 × 4 |
| `desert-house-3.1–3.4` (wide) | 128×112 | 4 × 3.5 |
| `desert-house-4.1–4.4` (large) | 144×128 | 4 × 3.6 (capped) |
| `desert-temple` (grand stone facade) | 128×128 | 4 × 4 |
| `desert-obelisk-1/2` / `-small-1/2` | 32×80 / 32×32 | 1 × 2.5 / 1×1 |
| `pergola` (shade structure) | 32×64 | 1 × 2 |
| `desert-fencewall` (adobe wall segments, 16px autotile-ish sheet) | 64×64 | wall runs |

Base pack (European village — usable for mountain/coastal with palette care; wood/stone/limestone × roof colours, ~9 variants each):

| Building | Source px | Rendered tiles |
|---|---|---|
| `house-1-*` (small) | 96×128 | 3 × 4 |
| `house-2-*` / `house-3-*` | 144×128 | 4 × 3.6 |
| `house-4-*` (hut) | 112×96 | 3.5 × 3 |
| `house-5-*` (long) | 192×128 | 4 × 2.7 (capped) |
| `inn` (black/blue/red) | 240×192 | 4 × 3.2 (capped) |
| `barn` (9 variants) | 128×144 | 3.5 × 4 |
| `blacksmith-house` | 160×128 | 4 × 3.2 |
| `fisherman-house` (9 variants, nets/buoys on facade) | 96×112 | 3 × 3.5 |
| `shed` (9), `silo` 48×80, `coop` 240×128, `greenhouse` 384×128 (3 material variants strip) | — | 1–4 tiles |
| `windmill` 128×112 + `windmill-sail-anim` (256×80 animated sails) | — | 4 × 3.5 |
| `market-stalls` (strip of 4 wooden stalls, 48×48 each) | 192×48 | ~1.5 tiles per stall |
| `tent-big` 80×96, `tent-small` 48×96, `tent-interior` | — | 1.5–2.5 tiles |
| `church` 448×144 — **AVOID (cross)** | — | — |

Military camp (Bedouin-adjacent kit): `military-tents` 304×480 sheet (multiple canvas tents, footprint override
to 5×5 src tiles in MapLoader), `lookout-towers` 288×256 (wood watchtowers), `palisade` 224×96 + `palisade-gate-anim`,
`spiked-barriers`, `mantlet`, `catapult` 96×48, `cannon`, `weapon-stands`, `target-dummys`, `archery-target`,
`banners-anim` (544×320 animated banners!), `flags-anim`, `campfire-pot-anim`, `split-log-benches`.

Other: `volcano-tower` 96×144; `shroomlinng-house-1..3.5` (fantasy mushroom, off-theme);
`witch/with-hut` — excluded.

## 3. PROPS — by theme (source sheets; crop regions per item)

- **Market/souq:** `desert-pots-sacks` (80×16, 5 items), `golden-pots` (48×16), `desert-rugs` (96×96, 16px rug tiles
  — FLAT_GROUND prop), `barrels` (96×64), crates (`crate-anim` breakable), `signs` (96×528, huge sign set),
  `camp-decor` (80×16), `hay-bales`, `benches`, `water-troughs`, `picnic-basket`, `scarecrows`,
  `pole-and-bunting-1/2-anim` (festive market bunting), `lanter-posts` (192×576 lamp-post set), `lantern`, `big-torch-anim`, `torch-anim`.
- **Domestic/desert:** `sleeping-mat`, `fire-pit` (112×16), `desert-campfire`, `campfire-anim`, `water-sack-on-stick`,
  `desert-ladder`/`ladder`, `flies-anim`, `mummy` (16×32 prop), `desert-bones` (160×128 skeleton set).
- **Nature (desert):** `palm-tree-1` (144×64 — 3 large palms 48×64), `palm-tree-2` (96×48, 2 small),
  `acacia-tree` (240×64 wide canopy), `cactus` (224×256 big variety sheet), `dead-tree`, `halfdead-tree`, `dead-bush`,
  `desert-fern(-dead)`, `desert-grass-props`, `desert-grass-1..3-anim`, `fallen-palm-leaves(-dead)`,
  `ambarakaman-plant`, `desert-rocks` (192×32).
- **Nature (green):** oak/birch/spruce/fruit trees in small/medium/big (`base/trees/`, 96–192px), leaf particles,
  `flowers` (160×160), 15 `flower-grass-*-anim` + 3 `grass-*-anim` swaying tufts, 8 mushroom anims, 14 rock anims,
  `ores` (128×128), hedges.
- **Water/nautical:** `boat` 48×48 rowboat + `boat-anim` (192×48 bobbing), `well` 32×48, `fountain` 32×80 +
  `fountain-anim` (256×48), lillypads (green/brown/purple/red × 6 anims), cattails ×5, water-rocks ×10, floating logs,
  `wooden-deck-tiles` for docks, `beach-decor-tiles`, fish animated tile.
- **Palace/treasure:** dungeon `pillars` (48×48 both sets), arches, gates (+anims), `gold-piles` (64×48),
  `golden-chest-anim`, `golden-jeweled-chest-anim` (96×80), `chest-anim`, `dungeon-objects` (144×96),
  `metal-grills`, obelisks, `desert-temple` facade.
- **Farm:** `crops` (112×688 — many crops × growth stages), `crops-2` (112×256), `berries`, `grapes-bower`
  (288×160 vine trellis!), fruit-tree stages + fruit objects, apple/cherry/peach/pear trees, `farmland(-wet)-tile`,
  fences (`fences`, `fence-big`+gates, `stone-fence-small/big`, `white-fence`), `silo`, `coop`, `barn`, scarecrows,
  `minecrats` (mine carts), bee hive/nest.

## 4. INTERIORS — tilesets + furniture

- **Roomset:** `houses-interiors/` — `interior-walls` (224×96), `wood-floor-tiles` (128×96), `wood-stairs`,
  brick/stone/wood `wall-fillers`. One European style only.
- **Desert interior:** `desert/temple/temple-house-interior` (160×128) — the ONLY adobe/desert interior roomset.
- **Furniture (`house-decor/`):** `beds` (112×192, several), `chairs` (224×352, big set), `tables` (192×80),
  `bookshelves` (192×112), `drawers`, `planters`, `standing-lamps` (160×288), `doors` (176×384),
  `windows-single/double` (huge variant sheets), `indoor-decor` (96×256), `placeable-decoration`,
  `chest/metal-chest/golden-chest-anim`, `furnace-anim`, `anvil-anim`.
- **Dungeon/cave roomsets** (see §1) double as palace basement / ancient-library vaults.
- **UI:** `ui/ui/` full kit (`ui-all` 2048×2576, frames, buttons, ribbons, book-ui 1680×432 — great for library),
  pixel fonts. Not part of world rebuild but keys exist.

## 5. CHARACTERS & ANIMALS

Player + core NPCs use the game's own 128px faceless sprites (`/assets/sprites/...`), NOT Kenmi — leave alone.
Kenmi adds ambient life (all spritesheet-keyed, various frame sizes; `BIOME_ANIMAL_SETS` already wires desert/grass):

- **Desert people:** `desert-person-1..4` (192×320 walk sheets), `pharaoh`, `desert-trader-1..3` +
  `desert-trader-camp` (576×64 market vignette). Enemies: `desert-warrior-atgier/bow-1/2`, `mummy`.
- **Base NPCs (Western dress — use sparingly):** bartenders, chef, farmer-bob/buba, fisherman-fin, lumberjack, miner.
- **Faction sets:** knights (archer/spearman/swordman/templar), orcs, goblins, angels; skeletons (+mage/bowman), slimes (3 sizes × 5 colours), shroomlings, snails, volcano cowlings, flying skull.
- **Animals:** **camel-1..3** (480×288 — flagship), vulture ×4, scarab ×4; chicken ×18 + rooster, cow ×9,
  horse ×5 (+ rideable `player-mounts/horse` ×5 colours), sheep ×9, duck ×4, goose ×6, swan ×3, frog, mouse,
  butterfly, bee, capybara (idle/dive/emerge). **Pig ×16 exists — skip for cultural fit.**
- **Weather/ambience:** clouds, rain drop + impact, wind-anim, chimney-smoke-anim.

## 6. GAPS — what an Arabian world wants that the library lacks

Seed list for `docs/WORLD-MISSING-ASSETS.md`:

1. **Mosque / minaret / dome** — nothing. Only religious building is a church (cross → excluded). Biggest thematic hole; oasis_village and royal_palace both want one.
2. **Palace kit** — no palace walls, gates, throne, courtyard tiles, arched arcades. royal_palace must be composited from desert-temple + obelisks + dungeon pillars/gates + limestone houses.
3. **Souq awnings** — no fabric-canopy market stalls; only the European wooden `market-stalls` strip + rugs/pots. No hanging spice/textile displays.
4. **Boats/harbour** — one 48×48 rowboat. No dhow/sailing ship, pier posts, mooring ropes, nets, fish crates, lighthouse, harbor crane. coastal_port is the most under-served zone.
5. **Sand↔grass transition tileset** — absent; oasis edges need cliff/road/water seams or hard edges.
6. **Snow/high-mountain terrain** — none (christmas pack has only decor, mostly excluded). mountain_village must be cliff-and-stone, not alpine.
7. **Goats & falcons & donkeys** — Bedouin staples missing (sheep/camel/vulture are the substitutes). No saddled/pack camel; only horses are rideable.
8. **Date palms with fruit / olive / fig / wheat-specific art** — crops sheet is generic European produce; fruit trees are apple/cherry/peach/pear.
9. **Desert interior variety** — a single `temple-house-interior` roomset; no adobe walls, majlis cushions, low tables, carpets-as-interior-floors, arched doorways.
10. **Library props** — bookshelves + book-ui exist, but no scroll racks, lecterns, astrolabes, calligraphy desks for ancient_library.
11. **City wall / gate in Arabian style** — `desert-fencewall` is low; the only tall walls are wooden military palisade and dungeon walls.
12. **Minor QA:** typo'd keys (see top), `christmas`/`halloween` packs ~90% unusable after cultural excludes, `church` unusable.

**Zone-kit fit summary:** oasis_village ✓ (desert houses+palms+wells), desert_marketplace ◐ (stalls are European),
royal_palace ◐ (composite), bedouin_camp ✓ (military tents+camels+campfires), mountain_village ◐ (cliffs + stone/limestone houses, no snow),
coastal_port ✗-leaning (deck tiles+fisherman house+rowboat only), ancient_library ◐ (temple facade + dungeon interior + bookshelves),
farmland ✓ (richest kit: crops, barn, coop, windmill, fences, animals).
