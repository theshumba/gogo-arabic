# Gogo Arabic, asset and visual-layer handoff for Devin

Written 2026-08-11 against `theshumba/gogo-arabic` (private), branch `feat/world-rebuild`.

Two things this covers: what art exists and how to use it, and the full state of the visual layer,
including what was broken, what was fixed, and what is still open.

## Paste this to Devin

> Everything you need to build the world is already in the repo, nothing needs uploading. Work from
> branch `feat/world-rebuild`, not `main`. Read `docs/DEVIN-ASSET-HANDOFF.md` first, then these:
>
> 1. `src/data/kenmiCatalog.js` , auto-generated index of all 969 art assets (key, path, type, frame
>    size). Every key in it is already preloaded by `BootScene`, so any of them works with no wiring.
> 2. `src/data/kenmiFrameTables.js` , autotile frame indices (corner / edge / solid / inner) for the
>    ~106 tile sheets.
> 3. `src/data/spriteKeyMap.js` , crop regions for props that live inside multi-item sheets.
> 4. `docs/WORLD-DESIGN-BIBLE.md` , the composition laws, and `docs/world-designs/` for the written
>    layout of each of the 8 zones.
>
> Hard rules: art is 16px baseline, world tile is 64px, plain props scale x4, buildings render at x2
> with a 4-tile footprint cap. Cultural excludes are enforced at module load (no santa, reindeer,
> pumpkin, witch, halloween, crosses; the church sprite has a cross, do not use it). Some filenames
> carry typos baked into the keys (`house-2-stone-base-blackpng`, `royal-pantst-1-red`,
> `lanter-posts`, `minecrats`) so use the typo'd key or skip the asset. Never invent a texture key: if
> the art you want does not exist, check `docs/WORLD-MISSING-ASSETS.md` for the agreed workaround.
>
> Before you fix anything visual, read `docs/VISUAL-CLOSEOUT.md`. Thirty visual defects were
> diagnosed and closed on 2 July with live-probe evidence. Do not restart that work from the old
> reports. If something looks wrong, regenerate the screenshots and diff against the committed
> evidence PNGs in `docs/world-shots/`.

## Part 1: what art is in the repo

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
is not referenced by any source file and never loads at runtime. Useful for laying out a level
visually rather than in code: buildings 207, characters 261, props-decorations 156, terrain-16x16 81,
terrain-32x32 8, ui 72.

**Not in the repo:** the visual reference library the zone designs were drawn from, 379 images and
97MB, sitting at `~/Desktop/Projects/Gogo-Arabic/Gogo-World-References/` in 11 category folders.
Devin cannot see it. If a design decision needs a reference, ask Melusi for that folder.

## Part 2: what the art can and cannot build

Of the 969 catalogued assets only about 10 per cent were in use before the rebuild, so there is a
large unused palette. What exists in force: desert adobe houses in four colourways each, temples,
obelisks, market stalls, rugs, pots and sacks, palms, camels, fountains, cobble and pavement roads,
adobe fence walls, cliffs, water and sand autotiles with real transitions, a full dungeon roomset,
one adobe interior roomset, bookshelves, tables, lamps and lanterns.

What does not exist, with the agreed substitutes already worked out: no mosque or dome (compose from
temple plus obelisks), no palace kit (temple plus dungeon pillars plus limestone houses), no fabric
souq awnings (wooden stalls only), no dhow or pier furniture, no snow, no direct sand-to-grass blend
(they must meet at a cliff, road or water channel), no exterior cliff stairs, no loom, no farm cart,
no waterwheel. There are 17 of these gaps, each with a written workaround, in
`docs/WORLD-MISSING-ASSETS.md`. The rule is absolute: use existing assets, record the gap, apply the
workaround or skip cleanly. Never invent a key and never import new art mid-build.

## Part 3: the visual layer, everything that was broken

This history matters because Melusi's read on this project is "the visual layer is broken", and most
of what he is remembering is already fixed. Devin needs to know which is which.

### 3.1 Closed, verified fixed, do not reopen

On 2 July 2026 every visual issue ever reported was diagnosed, fixed and adversarially verified
against the live game with Playwright probes of `window.__PHASER_GAME__` plus fresh screenshots.
Thirty items: 19 verified fixed, 2 debunked as not bugs, 8 fixed in that pass, 1 accepted as cosmetic,
zero left blocking. The item-by-item record with commits and evidence is `docs/VISUAL-CLOSEOUT.md`,
the master list is `docs/VISUAL-CLOSEOUT-CHECKLIST.md`.

The headline symptoms, so Devin recognises them if they ever recur:

| Symptom that was reported | Disposition |
|---|---|
| Black squares for terrain (the original March diagnosis in `VISUAL-LAYER-DIAGNOSIS.md`) | Fixed. That file is stale history, superseded by the closeout |
| Checkerboard or two-tone mosaic sand | Fixed, `ef5b1b5` |
| Hard biome-edge seams | Not a bug, it was a camera framing artifact |
| Desert zones reading as grassland | Fixed, `5a93c9a` and `0962cfc` |
| Giant three-by-two-tile rugs | Fixed, now cropped to exactly one tile |
| Player rendering at twice NPC size | Fixed, everything is 64x64 |
| Buildings ballooning to five tiles | Fixed, houses now 2.5 to 4 tiles with a hard cap |
| Garbled or oversized NPC sprites | Fixed, zero missing-texture warnings across all 8 zones |
| Miniature uncropped sprite-sheet strips floating in the world | Fixed |
| Black-diamond `__MISSING` placeholders | Fixed, zero in every zone |
| Marketplace with no visible stalls, palace with no palace | Fixed |
| Faint duplicate pergolas | Fixed, the scatter call is dead code |
| A strange free-standing ladder in the oasis | Fixed, removed from zone data |
| Vocabulary labels permanently on, label clutter | Fixed, now proximity-reveal within 3.5 tiles |
| Arabic text reversed and disconnected | Fixed, `3d29764`. Canvas already lays out RTL, so the manual reversal was double-reversing the glyphs |
| Oasis pond water border broken behind the big tree | Fixed, re-authored as a 7x5 rounded rect |
| Screenshot harness framing a barren corner, stale HUD baked into captures | Fixed, the harness now snapshots pure game pixels |

**Regression procedure, use this instead of restarting the old narrative:** run
`npm run capture:world-screenshots` with the dev server up, then diff the output against the frozen
evidence PNGs committed in `docs/world-shots/`. Diagnose the delta.

### 3.2 Genuinely open right now

| # | Issue | Notes |
|---|---|---|
| 1 | **Melusi reported the game "still broken" on 3 July after the intro fix landed, and nobody ever established what he was looking at.** | This is the top item. The project was paused that night. Likely candidates were a stale browser save he had not cleared, or something real in his flow the probes missed. Do not guess: get him to boot it and watch. |
| 2 | **The fresh-save and onboarding path has no automated coverage at all.** | Every capture and every test seeds `onboardingComplete=true`. That is exactly why the bricked intro survived so long. Any change near intro, onboarding or save loading must be probed by hand on a cleared browser save. |
| 3 | Royal Palace was rebuilt but its side-by-side was never reviewed or approved by Melusi. | `docs/world-shots/royal-palace-rebuild-side-by-side.png`. Get a verdict before building more zones. |
| 4 | Five of the eight zones are still procedural, not hand-designed. | `bedouin_camp`, `farmland`, `mountain_village`, `coastal_port`, `ancient_library`. They render correctly, they are just not composed. Their written designs already exist in `docs/world-designs/`. |
| 5 | The white rectangle above the player's head is the kufi head-covering sprite. | Not a bug, the art itself is a plain white cap. Melusi reads it as a rendering fault every time he sees it. It is an art-quality problem, not a code one. |
| 6 | `NPCManager.js:252` throws "Cannot set properties of undefined (setting immovable)". | A schedule tween's onComplete calls `setImmovable` after zone unload destroyed the NPC's physics body. Reproducible by rapid zone cycling, and a player leaving a zone mid-tween can hit it. Not visual, but real and unfixed. Fix by killing NPC schedule tweens in `WorldScene` zone teardown. |
| 7 | Ambient animals never spawn and decorations never scatter. | Both calls are commented out, `MapLoader.js:693` and `:691`. Deliberate, not a bug. If animals are re-enabled, fix the camel frame sizes first: `kenmiCatalog.js:748-750` declares 16x16 frames but the real camel art is roughly 48x32, so they will render as garbage. |
| 8 | The dev PerfOverlay bakes into screenshot captures. | Harness only, never player-visible. It once overlapped an NPC nameplate in `bedouin_camp.png`. Hide `window.__PERF_OVERLAY__` in the capture script. |
| 9 | Programmatic `loadZone()` without entry coordinates leaves the camera at (0,0). | Harness only, accepted cosmetic. The capture script sets its own framing. |

### 3.3 Accepted compromises, not defects

These will look like bugs to a fresh reader and are not. Do not "fix" them.

- **Straight ground seams flagged by the map linter.** Royal palace carries 12 accepted LAW-44
  warnings, marketplace 1, each triaged in `docs/world-design-research/lint-baseline-*.md`. They are
  real straight seams that the approved design draws on purpose (terrace fronts, hedge-ringed garden
  rooms, the ceremonial axis, map-rim containers).
- **Hedge garden rooms sit on a pavement curb painted under the hedge line.** That is the documented
  workaround for the missing sand-to-grass blend, not sloppy tiling.
- **The mosque is a temple facade with obelisks standing in for minarets.** No mosque art exists.
- **Mountain village has no snow** despite its theme, because no snow terrain exists. It is built as
  Arabian stone-and-cliff highland instead.
- **Interior variety is thin.** There is one adobe interior roomset, reused everywhere, with flavour
  coming from furniture and rugs.

### 3.4 Traps that cost time on previous builds

- Door interactables render their own blue marker rug. Do not place a second rug under a door unless
  the shopfront look is deliberate.
- Anchor-centred even-width sprites claim five tile columns. Compose building massing flush, never
  layered, or pieces occlude each other.
- Placing a prop on the same tile as a contract interactable hides the interactable.
- The capture harness recaptures all 8 zones every run and animation frames differ, so `git checkout`
  the zones you did not touch to keep commits atomic.
- Port 3000 is often Melusi's Awba dev server. Run Gogo on 3001 and set `GOGO_BASE_URL` to match.
- Never stage these pre-existing dirty files: `package.json`, `public/sw.js`, `src/routes.jsx`,
  `src/services/swRegistration.js`, `vite.config.js`, `test-results/`.

## Part 4: what the rebuild already produced

Ten commits on `feat/world-rebuild`, pushed to GitHub on 2026-08-11. Before that push, GitHub's copy
had been frozen since 2 July and none of this existed on the remote.

- `docs/WORLD-DESIGN-BIBLE.md`, 553 lines, the composition laws every zone is built and linted
  against.
- `docs/world-design-research/asset-inventory.md`, 168 lines, the single most useful file: every asset
  family, its source pixel size, its rendered tile footprint, and the transition matrix that exists.
- `docs/WORLD-MISSING-ASSETS.md`, the 17 gaps and their workarounds.
- `docs/world-designs/`, written layouts for all 8 zones plus the region connection map, 2,700 lines.
- `scripts/generate-map-from-design.mjs`, turns a written zone design into a map JSON via a per-zone
  profile engine, and `scripts/lint-world-map.mjs`, checks the built map against the bible.
- Three rebuilt zone maps: `oasis-village.json` (approved), `desert-marketplace.json`,
  `royal-palace.json` (unreviewed).
- The fix for the bricked fresh-save cinematic intro, commit `3142ea9`, three separate root causes in
  the Phaser fade and dialogue handling.

The generator and linter are proven: they produced three zones that pass lint and probe green. The
next zone in the sequence is `bedouin_camp`, and the process to build it is written out in
`docs/WORLD-REBUILD-INLINE-PROMPT.md`.
