# Gogo Arabic, Multi-World Rebuild Prompt

**Written 2026-08-11 on Melusi's direction. This document overrides `docs/WORLD-DESIGN-BIBLE.md` §1
and §4, and the substitution decisions in `docs/WORLD-MISSING-ASSETS.md`. Everything else in the
Bible stands unchanged.**

Read this before `docs/WORLD-REBUILD-INLINE-PROMPT.md`. Where the two disagree, this wins.

---

## 0. The correction

The Design Bible opens by declaring the game "one continuous desert civilisation strung along a
trade road", and locks a single material family: adobe, sandstone, palm wood. That was wrong.

**Gogo Arabic is many different worlds.** The art library holds nine genuinely distinct
environments and only one of them is desert. The single-material law was quietly flattening every
zone back into sand, and the missing-assets table made that worse by resolving each non-desert idea
into a desert substitute (the clearest case: the mountain village's snow theme was resolved as
"build it as Arabian stone highland instead", which threw away the highland kit that actually
exists).

**The good news is that this costs nothing to correct.** Three zones are already built and
committed, and all three were always meant to be desert:

| Built and committed | Look | Action |
|---|---|---|
| `oasis_village` (`cc3df39`, approved by Melusi) | Desert oasis | Keep exactly as is |
| `desert_marketplace` (`58cb88b`) | Desert souk | Keep exactly as is |
| `royal_palace` (`1f4ec2d`, awaiting Melusi's review) | Formal palace precinct | Keep, but see §3.8 for the garden palette |

The five zones that have **not** been built are precisely the five that become different worlds.
No rework, no reverts, no thrown-away commits.

---

## 1. What does NOT change

This is the part Melusi has already approved. Every rule below applies to **each individual place
in every world**, not just to the desert ones. Do not relax any of it because a world is new.

**The look.** Hand-drawn, never procedural. A person composed this place; a computer did not fill a
rectangle. The failure mode to design against is machine fill: identical props in a straight line,
constant-width borders, dead-straight ground seams, uniform lawns. Mirror the composition of proven
games rather than inventing one from nothing.

**The feel.** Somewhere people live, trade, study, herd or pray. Every outdoor place has exactly ONE
water feature and the composition bends toward it. A rug or mat marks every point where something
meaningful happens: stall fronts, counters, thrones, lecterns, prayer spots. Symmetry is a status
dial, reserved for ceremonial axes; everything else is staggered and organic. Every place is
summarisable in one clause, and every element on screen serves that clause.

**The size.** 35×25 tiles at the small end, 50×40 at the large end. Crossed in well under a minute.
Three to five buildings in a hamlet, six to nine in a mid-size town. Small places, one clear road
between them. Do not build sprawl.

**The detail.** Per 20×15-tile screenful: 8 to 15 props in a core, 5 to 8 on routes and outskirts,
3 to 5 in the one deliberate quiet corner every place keeps. Roughly 70 per cent of props cluster in
twos to fours hugging architecture, 30 per cent are loose singles at least 6 tiles from any cluster.
Open ground gets a point of interest every 8 to 15 tiles and no 20×20 window is ever empty. Walkway
and plaza centres stay clean. Exactly ONE oversized landmark per place, visible within about 12
tiles of where the player walks in. One or two story vignettes per place: three to five props in a
5×4 patch telling a single story, near but not on the main path.

**The scale law, and it is the only global material law left.** 64px tile grid, 16px art scaled ×4.
A person is one tile. A building is 2.5 to 4 tiles wide. Every reference tile-count transfers 1:1.

**The contract.** Zone IDs, NPC IDs, interactable IDs, gathering-spot IDs, exit connectivity, entry
keys and interior IDs are preserved exactly. Only coordinates move. Game logic is untouchable.
`docs/world-design-research/contract-and-pipeline.md` §1 is the authoritative ID list.

**Also unchanged:** every composition LAW in Bible §2, the collision doctrine, the linter rules, the
cultural excludes (no santa, reindeer, pumpkin, witch, halloween iconography, crosses; the church
sprite carries a cross and is banned), and the absolute rule that only existing catalogue keys are
used. Anything a design wants that does not exist gets recorded in `docs/WORLD-MISSING-ASSETS.md`
with a workaround, then skipped cleanly. Never invent a texture key.

The composition laws are about **how a place is put together**, not what it is made of. They carry
into a mushroom forest or a lava field completely unchanged.

---

## 2. The worlds

Nine distinct environments exist in the art. Verified against `public/assets/kenmi/` and
`src/data/kenmiCatalog.js` on 2026-08-11.

| World | Ground and terrain | Structures and props |
|---|---|---|
| **Desert** | `desert-beach-tiles-1..3` (three sand hues), `desert-water-tiles-1..3` + foam, `desert-grass` scrub blob, `desert-cliff-tiles-1..3`, `desert-cliff-waterfall-1..3`, `desert-bridge` | `desert-house-1.1..4.4` (adobe, four colourways each), `desert-temple`, obelisks large and small, palms, well, market stalls, rugs, pots and sacks, camels, lanterns |
| **Green country** | `grass-tiles-1..4` (four palettes) + `grass-N-middle`, `path-middle`, `path-decoration`, `farmland-tile` + `farmland-wet-tile`, `cobble-road-1/2`, `hedge-tiles`, `bridge-wood`, `bridge-stone-horizontal/vertical` | Real trees (base `trees/`), `crops` + `crops-2`, barns in three colourways, coops, silo, `windmill` + `windmill-sail-anim`, fences and gates, `grapes-bower`, hay bales, scarecrows, troughs, cows, chickens, sheep, picnic blankets |
| **Coast** | `beach-tiles` (30×3 animated shoreline), `beach-decor-tiles`, `water-tile-1..4-anim`, `wooden-deck-tiles` (5×6, the pier kit) | `boat` and `boat-anim` rowboats, barrels, crates, lookout towers, `desert-pots-sacks` as cargo |
| **Highland** | `stone-cliff-1..4-tile` (14×6 each) with matching `-cave-entrance`, `waterfall-1..8`, `cobble-road`, `pavement-tiles` | Stone and limestone `house-*` variants, hedges, standing lamps |
| **Caves and mines** | `cave-walls` (7×8), `cave-floor-1/2`, `cave-water` + `-animation`, `cave-doorway` | `cave-support-1/2`, `rails`, `minecrats` (typo is in the key), `dungeon-1-stairs` |
| **Dungeon halls** | `dungeon-1` (13×13 full roomset), `dungeon-2` (13×12, alternate palette), sewer tilesets | Pillars, `gates` and `gates-anim`, stairs, `golden-*` props, bookshelves, tables, standing lamps |
| **Volcano** | `volcano-tiles` (29×9 lava field), `volcano-lavafall`, `volcano-lava-buble`, `volcano-bridge` | Volcano buildings, volcano tower |
| **Shroomlands** | `shroomlands-grass-blue/green/purple-tiles` and `-tall-grass-` in all three, `shroomlands-cliff-tiles`, `shroomlands-cliff-waterfall` | Mushroom houses, shroomlings, snails, shroom props. The only fully alien palette in the pack |
| **Fortress camp** | Uses any base ground; the world is made by its enclosure | `palisade` + `palisade-gate-anim`, `lookout-towers`, `military-tents`, `banners-anim`, `flags-anim`, catapult, cannon, archery targets, target dummies, weapon stands, `split-log-benches`, spiked barriers, `campfire-pot-anim` |

**Snow does not exist.** There is no snow ground tile anywhere in the pack. Do not fake it and do not
substitute white. There is a `weather-effects` folder in the base pack worth evaluating for falling
snow as an overlay, but the ground stays what it is.

---

## 3. World assignment, the eight existing zones

Contract preserved in every case. This is a palette and identity change, not a structural one.

### 3.1 `oasis_village` (40×30) — Desert. BUILT, DO NOT TOUCH.
A palm-shaded spring hamlet where the journey begins. Warm sand, adobe, one pool. Approved by
Melusi and the cinematic intro hardcodes its coordinates.

### 3.2 `ancient_library` (35×30) — **Highland stone sanctuary.** Was: solitary temple in dunes.
A house of wisdom cut into a cliff face, cool grey stone and gold after the heat of the sand road in.
Use `stone-cliff-1..4-tile` for the cliff the library is carved into, a matching `-cave-entrance` as
the archive mouth, `pavement-tiles` for the ceremonial approach, dungeon pillars and animated gates
for the portal, bookshelves as architecture, torch pairs along the axis. The approach path arrives
from the desert so the first three tiles are sand, then it changes underfoot. That change is the
moment. Keep the long empty ceremonial forecourt: sacred places hold 40 per cent of their floor
empty and the emptiness IS the composition.

### 3.3 `desert_marketplace` (45×35) — Desert. BUILT, DO NOT TOUCH.
Walled caravan souk around a fountain plaza. The densest place in the game, top of the prop budget.

### 3.4 `farmland` (45×35) — **Green country.** Was: green plots wrested from the desert.
The largest visual departure in the game, and the richest asset kit in the entire library. Build it
as a proper green valley, not a desert with crops in it: four grass palettes blended, real trees not
palms, tilled and wet farmland soil, hedgerows, wooden and stone bridges over the channels, a
turning windmill, barn and silo and coop clustered on one edge, three to five fenced crop plots with
a different crop in each, cows and chickens and sheep in a pen by the barn. **Build this zone
first.** It proves the multi-world direction faster and more convincingly than any other.

### 3.5 `bedouin_camp` (35×25) — **Dry steppe, with the fortress-camp kit.**
The transitional world between the green valley and the stone wall: scrub grass blobs scattered over
open sand, no paving anywhere, worn-sand paths only. Take the enclosure and dressing from the
fortress camp kit, which is what these tents actually are: `military-tents` in a quincunx or ring,
`palisade` and `palisade-gate-anim` as light perimeter accents only, animated banners and flags at
the elder's court, `campfire-pot-anim` and `split-log-benches` radial around the central fire.
Camels and sheep at the livestock edge. Nomad, not military: keep catapult, cannon, targets and
weapon stands out of it.

### 3.6 `mountain_village` (40×30) — **True highland.** Was: Arabian stone highland as a snow substitute.
Stop treating this as a compromise. It is its own world: three stacked cliff terraces built from
`stone-cliff-1..4-tile`, a real spring cascade using the `waterfall-1..8` kit falling through the
bands, cave mouths in the rock face, cobble roads, stone and limestone houses wedged into the cliff.
The exterior stair problem is real, there are no stair frames in the cliff sheets, so cut a two to
three tile gap in the cliff-face collision run and lay `dungeon-1-stairs` as a prop spanning it.
The cave mouths are the natural door into a caves-and-mines interior later.

### 3.7 `coastal_port` (45×35) — **True coast.**
Salt, timber and sea, not sand with boats on it. Use the base `beach-tiles` animated shoreline (30×3)
rather than the desert beach set, `wooden-deck-tiles` for two or three pier fingers of different
lengths, rowboats moored at varied angles, cargo clusters of barrels and crates and sacks along the
quay, a lookout tower on the headland. Put real grass on the headland behind the town so the desert
visibly ends here. This zone has the weakest prop kit of the eight, so it leans on composition:
banded water depth, a deep inlet biting into the map, piers at different lengths, cargo rhythm.

### 3.8 `royal_palace` (50×40) — Formal sea garden. BUILT, review the gardens only.
The ceremonial axis, facade and forecourt stay exactly as built. The only change worth making, and
only if Melusi approves the zone first, is inside the two hedge-ringed garden rooms: they currently
sit on a pavement curb over sand because of the missing sand-to-grass blend. Real grass exists. With
the green-country palette unlocked, those garden rooms can hold actual lawn, meeting the surrounding
sand at the hedge line, which is a hard edge and therefore legal. Do not touch anything else.

**Region logic still holds.** The connection map in `docs/world-designs/world-connection-map.md`
already describes a genuine cross-section: deep desert in the south-west, the caravan belt and the
wadi farms in the centre, steppe at the mountains' feet, the mountain wall, then the coastal plain
and the sea. The geography always earned different worlds. Only the material law forbade them. Keep
every exit pair, edge and fraction in that document exactly as written; rewrite only its prose so
each road describes a real change of world underfoot.

---

## 4. The worlds not yet used

Volcano, shroomlands, caves and mines, dungeon halls and a true fortress camp have no zone. They are
the most visually striking things in the library and the game currently shows none of them.

**Two ways in, and they are not equal:**

**4a. Interiors, safe, do now.** Interiors are already a contract concept (`interiorIds`,
`InteriorScene.js` exists). Cave and dungeon worlds can be reached through doors that already exist
without adding a single new ID. The mountain village's cave mouths open into a caves-and-mines
interior. The library's archive door opens into a dungeon-hall stack. This adds two entire worlds at
zero contract risk and should be done as part of those zones' builds.

**4b. New zones, needs Melusi's approval first.** A volcano zone, a shroomlands zone or a fortress
zone means new zone IDs, new NPCs, new exits and new quest surface. That is a game-logic change, not
a layout change, and it sits outside the preserved contract that every rule in this repo is built
around. **Do not add new zones on your own initiative.** Build the five re-themed zones, show Melusi
the side-by-sides, and let him decide whether the region grows.

---

## 5. Edits to make before building anything

1. **`docs/WORLD-DESIGN-BIBLE.md` §1.** Replace the "one continuous desert civilisation" identity and
   the "one material family" law. The new §1 states that Gogo Arabic is many worlds, lists the nine,
   and keeps exactly one global material law: one world scale, 64px tile, person is one tile. Keep
   every other bullet in §1 (water is wealth, vertical punctuation, carpets mark meaning, symmetry
   is status, handmade in one sentence, culturally clean) because all of them are world-agnostic.
2. **`docs/WORLD-DESIGN-BIBLE.md` §4, the asset palette table.** Rewrite per world using §2 above.
3. **`docs/WORLD-DESIGN-BIBLE.md` §3, the zone briefs.** Rewrite the identity, anchor and palette
   lines for the five re-themed zones. Leave their contract counts untouched.
4. **`docs/WORLD-MISSING-ASSETS.md`.** Re-decide every row that resolves into a desert substitute,
   with the whole pack open this time. Row 6 (snow) stops being a compromise and becomes the
   highland world. Row 13 (exterior stairs) keeps the dungeon-stairs workaround. Rows about palace
   kit, library props and interior variety should be reconsidered against the dungeon roomsets.
   Any row you keep, keep with a stated reason.
5. **`docs/world-designs/<zone>.md`** for the five unbuilt zones. Rewrite §0 identity and the palette
   sections before generating a map. The ASCII grid and placement table are what the generator
   parses, so they must reflect the new world's legend.
6. **`scripts/generate-map-from-design.mjs`.** Each world needs its own `ZONE_PROFILES` entry with
   its tilesets and glyph legend. After ANY generator change, regenerate `oasis_village` and
   `git diff` it: the output must stay byte-identical. Same for `desert_marketplace` and
   `royal_palace` once you have touched their profiles.
7. **`scripts/lint-world-map.mjs`.** The laws are world-agnostic and must not be weakened. Two checks
   are sand-specific and need per-world equivalents: the bare-sand-run check (LAW-33) and the
   ground-material adjacency rules. A green world needs the same "no dead ground" pressure applied to
   grass. Fix the linter at the linter, negative-test the fix, record it in a lint baseline doc.

---

## 6. Build order and loop

Order: **farmland, mountain_village, coastal_port, bedouin_camp, ancient_library.** Farmland first
because it is the biggest departure and the richest kit, so it proves the direction fastest. This
replaces the order in `docs/WORLD-REBUILD-INLINE-PROMPT.md`.

Per zone, the loop from that prompt still applies and is proven over three builds. In short: read the
design doc and the Bible, generate the map with the generator (never hand-edit the JSON, never write
a one-off script), wire coordinates in `zones.js` and `gatheringSpots.js` with contract IDs
unchanged, lint to exit 0, full vitest green with only this zone's fixture regenerated, then **look
at the rendered screenshots and fix what you see**, then a live walk-and-enter probe, then one atomic
commit, then stop for Melusi's approval.

**Read the rendered screen, not the source and not the test output.** Every serious defect this
project has shipped passed its tests. Green tests prove almost nothing here.

**Never ask Melusi to play-test something to find out whether it works.** Screenshots and probes are
your job. He looks at the side-by-side and gives a verdict.

---

## 7. Traps that have already cost time

- Port 3000 is often Melusi's other project's dev server. Never kill it. Run
  `npm run dev -- --port 3001 --strictPort` and set `GOGO_BASE_URL` to match.
- Some Kenmi sheets contain fully transparent frames. Before mapping any new tileset's GIDs, render
  a 6× upscale of the sheet and look at it. Do not trust the frame count.
- The capture harness recaptures all eight zones and animation frames differ between runs.
  `git checkout` the zones you did not touch so the commit stays atomic. `docs/world-shots/` is
  gitignored, so this zone's PNGs need `git add -f`.
- `src/game/systems/MapLoader.js` is CLOSED. Its scale and crop rules are untouchable. If a prop needs
  a crop region it does not have, substitute or defer with a note. `git diff` on that file must come
  back empty before you commit.
- Anchor-centred even-width sprites claim five tile columns. Compose building massing flush, never
  layered.
- Door interactables render their own blue marker rug. Do not add a second one.
- A prop on the same tile as a contract interactable hides the interactable.
- Never stage these pre-existing dirty files: `package.json`, `public/sw.js`, `src/routes.jsx`,
  `src/services/swRegistration.js`, `vite.config.js`, `test-results/`.
- The visual reference library lives at `~/Desktop/Projects/Gogo-Arabic/Gogo-World-References/`,
  379 images in 11 category folders. It is not in the repo and an agent without access to that path
  has zero references. If you cannot reach it, say so rather than improvising.
- Do not reopen the closed visual defects. Thirty were diagnosed and fixed on 2 July with live
  evidence, recorded in `docs/VISUAL-CLOSEOUT.md`. If something looks wrong, regenerate the
  screenshots and diff against the committed evidence PNGs.

---

## 8. The one-line test

Before committing any zone, look at its screenshot and answer honestly: **would someone believe a
person drew this place, and could they tell in one glance which world they are standing in?**

If the answer to either half is no, it is not finished.
