# Gogo Arabic, asset handoff for Devin

Written 2026-08-11 against `theshumba/gogo-arabic` (private), local branch `feat/world-rebuild`.

## Paste this to Devin

> Everything you need to build the world is already in the repo, nothing needs uploading. Read these
> four files before you place a single tile:
>
> 1. `src/data/kenmiCatalog.js` , auto-generated index of all 969 art assets (key, path, type, frame
>    size). Every key in it is already preloaded by `BootScene`, so any of them works with no wiring.
> 2. `src/data/kenmiFrameTables.js` , autotile frame indices (corner / edge / solid / inner) for the
>    ~106 tile sheets.
> 3. `src/data/spriteKeyMap.js` , crop regions for props that live inside multi-item sheets.
> 4. `src/game/systems/MapLoader.js` , the scale and footprint policy.
>
> Hard rules: art is 16px baseline, world tile is 64px, plain props scale x4, buildings render at x2
> with a 4-tile footprint cap. Cultural excludes are enforced at module load (no santa, reindeer,
> pumpkin, witch, halloween, crosses; the church sprite has a cross, do not use it). Some filenames
> carry typos that are baked into the keys (`house-2-stone-base-blackpng`, `royal-pantst-1-red`,
> `lanter-posts`, `minecrats`) so use the typo'd key or skip the asset. Never invent a texture key: if
> the art you want does not exist, log it and use a documented workaround.

## What is actually in the repo

**`public/assets/`, 1,602 files, 52MB.** This is what the game loads at runtime.

| Folder | Files | What it is |
|---|---|---|
| `kenmi/` | 969 | The main art pack, and the only one with a machine-readable index. Splits into base 708, desert 92, dungeons 51, shroomlands 33, ui 18, militarycamp 16, halloween 15, characters 14, volcano 13, christmas 9 |
| `characters/pipoya` | 236 | Pipoya character sheets |
| `ui/` | 131 | HUD, panels, RPG UI kit, bdragon panels |
| `sprites/` | 99 | Player, NPCs, objects, clothing and hair layers |
| `audio/` | 52 | Ambient, letter pronunciation, SFX |
| `objects/` | 33 | Legacy standalone props (houses, trees, gates) |
| `tilesets/` | 24 | Legacy tilesets (ancient-egypt, avalon-desert, desert-village, indoor, coast, world) |
| `portraits/` | 24 | 24 named NPC portraits, one per character |
| `maps/` | 19 | Tiled `.tmx` legacy maps plus the JSON zone maps |
| `fonts/` | 9 | Pixel Arabic and Latin faces |
| `backgrounds/` | 4 | Forest, ice, sand, animated fish |

**`ldtk-assets/`, 785 files, 11MB.** A flattened mirror of the same art for the LDtk level editor. It
is not referenced by any source file and never loads at runtime. Useful if Devin wants to lay out a
level visually rather than in code: buildings 207, characters 261, props-decorations 156,
terrain-16x16 81, terrain-32x32 8, ui 72.

## What the art can and cannot build

Of the 969 catalogued assets, only about 10 per cent were in use before the rebuild, so there is a
large unused palette. What exists in force: desert adobe houses in four colourways each, temples,
obelisks, market stalls, rugs, pots and sacks, palms, camels, fountains, cobble and pavement roads,
adobe fence walls, cliffs, water and sand autotiles with real transitions, a full dungeon roomset, one
adobe interior roomset, bookshelves, tables, lamps and lanterns.

What does not exist, with the agreed substitutes already worked out: no mosque or dome (compose from
temple plus obelisks), no palace kit (temple plus dungeon pillars plus limestone houses), no fabric
souq awnings (wooden stalls only), no dhow or pier furniture, no snow, no direct sand-to-grass blend
(they must meet at a cliff, road or water channel), no exterior cliff stairs, no loom, no farm cart,
no waterwheel. There are 17 of these gaps, each with a written workaround, in
`docs/WORLD-MISSING-ASSETS.md`.

## The real gap: GitHub is five weeks stale

GitHub's copy was last updated on 2 July. Ten commits sit on the local branch `feat/world-rebuild`
and have never been pushed. Devin has all the art but none of the knowledge layer:

- `docs/world-design-research/asset-inventory.md` , 168 lines, the single most useful file. Every
  asset family, source pixel size, rendered tile footprint, and the transition matrix that exists.
- `docs/WORLD-DESIGN-BIBLE.md` , 553 lines, the composition laws the zones are built against.
- `docs/WORLD-MISSING-ASSETS.md` , the 17 gaps and their workarounds.
- `docs/world-designs/` , written layouts for all 8 zones plus the connection map, 2,700 lines.
- `scripts/generate-map-from-design.mjs` , the generator that turns a written zone design into a map
  JSON, and `scripts/lint-world-map.mjs`, the linter that checks a built map against the bible.
- Three rebuilt zone maps: `oasis-village.json`, `desert-marketplace.json`, `royal-palace.json`.
- The fix for the bricked fresh-save cinematic intro (three root causes, commit `3142ea9`).

Also missing, and not in the repo at all: the visual reference library, 379 images and 97MB in
`~/Desktop/Projects/Gogo-Arabic/Gogo-World-References/`, organised into 11 category folders. That is
what the zone designs were drawn from. It is too large to commit sensibly and Devin cannot see the
Desktop.

## Closing the gap

Push `feat/world-rebuild` to GitHub and tell Devin to work from it. The branch is clean and
committed. The uncommitted files in the working tree (`package.json`, `public/sw.js`,
`src/routes.jsx`, `src/services/swRegistration.js`, `vite.config.js`, `test-results/`) are
pre-existing and must never be staged, so a push carries none of them.

If the branch stays local, paste the four file paths from the block at the top plus the hard rules,
and accept that Devin will rebuild zones the bible has already solved.
