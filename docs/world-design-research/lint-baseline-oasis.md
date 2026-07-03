# Lint baseline triage — oasis_village (the one closeout-verified authored map)

2026-07-03, closing Phase-0 critique **GAP 4** (no lint-clean baseline; false-positive risk
unquantified). Every finding from `node scripts/lint-world-map.mjs oasis_village` was classified
as **REAL** (a genuine violation of the bible laws in the existing map — moot, since the rebuild
replaces all layouts) or **LINTER FALSE POSITIVE** (wrong model in the linter — fixed in
`scripts/lint-world-map.mjs`, no game code touched). Evidence for each call is inline.

**Headline: after fixes, the linter has zero known false positives on this map.** The 6 remaining
errors and 16 warnings are all verified defects of the OLD layout and disappear with the rebuild —
they are the concrete list of mistakes the new oasis_village must not repeat.

Baseline note: the critique measured **11 errors / 18 warnings**. By the time of this triage the
run showed **49 errors** — the 38 extra were a fresh false-positive flood introduced when contract
§8 (interiors) was appended, see finding 1.

## Triage table

| # | Finding (rule @ tile) | Classification | Evidence | Action |
|---|---|---|---|---|
| 1 | 38 × LINT-6/LINT-7 "…not in contract" flood (every NPC/interactable/spot/exit of the zone) | **FALSE POSITIVE** (contract parse) | `parseContractManifest()` split the whole doc on `^### ` headings; new §8 blocks (`### oasis_village — 3 interiors`) matched `^([a-z_]+) —` and **overwrote** the §1 manifest with empty sets | **FIXED** — parser now slices §1 only (`contractSection(md, 1)`); §8 gets its own parser for the interior lint |
| 2 | LINT-8 entry `from_library` not walkable @(20,3) | **REAL** | Ground @(20,3) is SAND_SOLID (GID 7), Collision 0 — the blocker is `kenmi-desert-temple-desert-obelisk-1@(20,2)` `collideW:120/collideH:40`: body centred (px, py+20) covers tiles (19–21)×(2–3). Linter collider math verified **identical** to `MapLoader.placeObjects` (`wallGroup.create(px, py+20)` + `setSize(collideW\|\|40, collideH\|\|20)`). Arriving players spawn overlapping a static body; arcade-physics separation shoves them out, so it "works" by accident | none (old map is replaced; rebuilt map must keep entry tiles clear of collider boxes) |
| 3–5 | LINT-1 footprint overlaps ×3: `halfdead-tree@(5,5)`×`obelisk-small-1@(6,3)`, `halfdead-tree@(12,5)`×`obelisk-small-2@(11,3)`, `halfdead-tree@(12,5)`×`fallen-palm-leaves@(11,4)` | **REAL** | Rendered-rect math checked by hand: halfdead-tree.png is 48×64, ×2 scale, origin (0.5,0.8) → tiles (4–6)×(3–5) from anchor (5,5); obelisk-small-1.png 32×32 → tiles (6)×(2–3). Rects genuinely intersect. Depth-sorting makes canopy-over-prop look deliberate, but it violates the non-overlap law | none (moot) |
| 6 | LINT-2 `palm-tree-1` anchor on water @(18,17) | **FALSE POSITIVE** (water model) | GID 183 = `water-tile-3` frame 7 = **EDGE_BOTTOM** per `kenmiFrameTables.js` — a part-water rim/transition frame. The palm stands on the pond rim, not open water | **FIXED** — 3×5 water autotile blobs now classify SOLID(4)+inner frames(9–14) as open water, corner/edge frames(0–3,5–8) as SHORE (mirrors the beach-tiles shore handling) |
| 7–8 | LINT-2 `outdoor-decor` anchor on water + on Collision @(20,17) | **FALSE POSITIVE** ×2 | Same rim frame (GID 183). The Collision GID there exists to enforce the pond (engine blocks ONLY via Collision layer — water never blocks itself), not a wall; rim decor is intentional and closeout-verified | **FIXED** — shore reclass + pond-band exemption: non-collide decor on a water/shore tile that carries Collision is not flagged |
| 9–10 | LINT-2 `flies-anim` anchor on water + on Collision @(21,13) | **FALSE POSITIVE** ×2 | GID 177 = frame 1 = **EDGE_TOP** rim; and a fly swarm is airborne — it may hover over open water anyway | **FIXED** — new `AIRBORNE_RE` (flies/bee/butterfly/bird/vulture/falcon/seagull) exempt from LINT-2 water/collision anchor checks, + shore reclass |
| 11 | LINT-4 >15 non-flat props in 20×15 window @(0,0) | **REAL** | Counted from zones.js: **18** non-flat props anchor inside (0,0)–(19,14) — over the LAW-31 cap of 15 | none (moot; rebuild must respect the cap) |
| 12 | LINT-9 `…lillypad-green-1-anim` no PROP_CROP_REGIONS @(20,15) | **REAL** | Catalog: `spritesheet`, PNG is 128×16 = eight 16×16 frames. Key is in neither `ANIMATED_DECO_PROPS` nor `PROP_CROP_REGIONS`, so `MapLoader.placeObjects` falls to `scene.add.image` → the **whole 8-frame sheet renders** as one strip and never animates. Genuine config gap the lint is designed to catch | none in Phase 0 (fix belongs to the rebuild: register a `deco-lillypad` animation in `ANIMATED_DECO_PROPS` — a `src/data/spriteKeyMap.js` change — or don't place the key) |
| W1 | WARN LINT-3 rug on material-transition frame GID 97 @(14,9) | **REAL** (warn-level as designed) | GID 97 is a grass-tileset transition frame, not a raw SOLID/variant; a rug straddling a material seam reads as floating | none (moot) |
| W2–W3 | WARN LINT-10 straight water-land seam 7 tiles @(17,13)/(17,18) | **FALSE POSITIVE** (same water model) | The "seam" was measured against rim frames classified as water. Against the true open-water boundary the straight run is ≤6 | **FIXED** by the frame reclassification (finding 6) — both warns gone |
| W4–W18 | WARN LINT-10 straight grass/sand district boundaries, 10–17 tiles ×15 | **REAL** | The old map's grass/sand borders are axis-aligned 10–17-tile runs — exactly the blocky look LAW-44 bans | none (moot; rebuild must break these edges) |

## Walkability model + LINT-11 (GAP 5 follow-through)

The linter BFS previously treated all water as unwalkable. That contradicted the engine (contract
§3: only the hidden **Collision layer** + `collide:true` bodies block; water never blocks itself
on the Tiled path). Fixed: `walkable()` is now **Collision-GID==0 && not under a collide-object
body** — identical to the engine — and a new automated **LINT-11** errors on any open-water tile
with no Collision GID painted (the "player walks on water" map bug the doctrine warns about).
The bible §7 listed LINT-11 as a manual authoring law "until the linter's walkability model
matches the engine's"; that condition is now met and the check is automated.
**oasis-village.json passes LINT-11** — its pond is fully collision-painted, which independently
confirms the doctrine describes how the shipped map was actually authored.

## Interior contract lint (GAP 1, linter half)

`lint-world-map.mjs` now parses contract §8 and lints all 15 hand-crafted interiors per zone
(reported as LINT-7): **legacy** interiors (no authored Tiled map — all 15 today) get contract
PRESENCE checks against `src/data/interiors` (every §8 NPC/interactable id exactly once, no
unknown ids, exactly one `exit-door` isExit:true); **authored** interiors (Tiled JSON at
`public/assets/maps/interiors/<id-with-hyphens>.json`) additionally get placement checks
(Ground/Collision layers, dims vs data, entities + spawnPoint in bounds and off Collision).
All 8 zones × 15 interiors currently pass (verified against a deliberate contract mutation and a
deliberately broken authored map — both were caught). `--all` now covers every core zone so
interior contracts are linted even for zones still on the procedural exterior path.

## Final output after fixes

```
$ node scripts/lint-world-map.mjs oasis_village
LINT-8 oasis_village entry "from_library" tile is not walkable at tile (20,3)
LINT-1 oasis_village footprints overlap: kenmi-desert-props-halfdead-tree@(5,5) x kenmi-desert-temple-desert-obelisk-small-1@(6,3) at tile (6,3)
LINT-1 oasis_village footprints overlap: kenmi-desert-props-halfdead-tree@(12,5) x kenmi-desert-temple-desert-obelisk-small-2@(11,3) at tile (11,3)
LINT-1 oasis_village footprints overlap: kenmi-desert-props-halfdead-tree@(12,5) x kenmi-desert-props-fallen-palm-leaves@(11,4) at tile (11,4)
WARN LINT-3 oasis_village flat prop kenmi-desert-props-desert-rugs on material-transition frame (GID 97) at tile (14,9)
LINT-4 oasis_village >15 non-flat props in 20x15 window (LAW-31) at tile (0,0)
LINT-9 oasis_village spritesheet prop "kenmi-base-outdoor-decoration-outdoor-decor-animations-water-decor-animations-water-plants-lillypad-green-1-anim" has no PROP_CROP_REGIONS entry (whole sheet would render) at tile (20,15)
WARN LINT-10 … 15 × straight grass/sand district boundary (LAW-44) …
-- oasis_village: 6 error(s), 16 warning(s)
```

`node scripts/lint-world-map.mjs --all` → 8 zones, same 6 errors/16 warnings (all from
oasis_village's old layout; other 7 zones have no authored map yet, interiors all clean),
exit code 1. **Every remaining finding is a REAL old-layout defect; a rebuilt map that follows
the bible will lint clean.**
