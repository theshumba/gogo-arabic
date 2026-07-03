# World Missing Assets

Seeded from the GAPS section of `docs/world-design-research/asset-inventory.md` (Phase 0, 2026-07-03).

**Rule (from WORLD-DESIGN-BIBLE.md §4):** the rebuild uses EXISTING Kenmi assets only. If a design
wants something not in `src/data/kenmiCatalog.js`, the builder records it here (add a row or update
the workaround column) and applies the workaround or skips cleanly — never invents keys, never
imports new art mid-build. New art is a separate, later decision.

| # | Wanted asset | Zone(s) that want it | Workaround / skip decision |
|---|---|---|---|
| 1 | Mosque / minaret / dome | oasis_village, royal_palace, mountain_village (door-mountain-mosque) | Composite: `desert-temple` facade + `desert-obelisk-1/2` as minaret stand-ins; mark the mosque door interactable on the temple facade. The `church` (448×144) is EXCLUDED (cross). |
| 2 | Palace kit (walls, gates, throne, arcades, courtyard tiles) | royal_palace | Composite: `desert-temple` + obelisk pairs + dungeon `pillars`/`gates(-anim)` + limestone `house-*` variants + `pavement-tiles` + `fountain-anim`. Throne room is an interior (code-built) using dungeon roomset + `golden-*` props. |
| 3 | Souq fabric awnings / hanging spice & textile displays | desert_marketplace, coastal_port | Use `market-stalls` (wooden, 4-stall strip) + `desert-rugs` + `pole-and-bunting-1/2-anim` + `desert-pots-sacks`/`golden-pots` baskets as stall dressing. Accept wooden stalls; no fabric canopy. |
| 4 | Dhow / sailing ship, pier posts, mooring ropes, nets, fish crates, lighthouse, crane | coastal_port | Piers from `wooden-deck-tiles`; boats = `boat`/`boat-anim` rowboats only (2–3 of them, varied rotation/position); lighthouse stand-in = `volcano-tower` or `desert-obelisk-1` on the quay; nets/fish = skip; cargo = `barrels` + crates + `desert-pots-sacks`. Most under-served zone — lean on composition, not props. |
| 5 | Sand↔grass transition tileset | oasis_village, farmland, every desert zone edge | No direct blend exists. Meet sand and grass at a hard seam: cliff line, road/path, water channel, or use `desert-tiles-desert-grass` scrub-blob (scrubgrass↔sand blend DOES exist) as the intermediary band. LINT-enforceable: no raw grass tile adjacent to raw sand tile. |
| 6 | Snow / alpine terrain | mountain_village (theme says "snow") | Build as Arabian stone-and-cliff highland instead: `desert-cliff-tiles`, `stone-cliff-*`, stone/limestone houses. No snow anywhere; weather stays `snow` in data (falls as-is, acceptable) or leave to a later data decision. |
| 7 | Goats, falcons, donkeys, pack/saddled camel | bedouin_camp, farmland, mountain_village | Substitutes: `sheep` (goat stand-in), `vulture` (falcon stand-in), `camel-1..3` (unsaddled). Donkeys: skip. Only horses are rideable — leave riding alone. |
| 8 | Date palms with fruit / olive / fig / wheat-specific crops | farmland, oasis_village | Use generic `crops`/`crops-2` rows + `palm-tree-1/2` orchard blocks + `grapes-bower` trellis as the "date orchard" read. Fruit trees are apple/cherry/peach/pear — use sparingly, prefer palms. |
| 9 | Desert/adobe interior variety (majlis cushions, low tables, arched doorways, carpet floors) | all interiors | One roomset: `desert/temple/temple-house-interior`. Use it for every adobe interior; zone flavour comes from furniture (`house-decor/*`) + `desert-rugs` + lantern props. Majlis cushion-circles: approximate with chairs+rug or skip cushions. |
| 10 | Library props (scroll racks, lecterns, astrolabes, calligraphy desks) | ancient_library | `bookshelves` (192×112) as architecture + `tables` + `standing-lamps` + `golden-pots`; lectern = small table + book from `indoor-decor`. Skip astrolabes. |
| 11 | Tall Arabian city wall / gate | desert_marketplace, royal_palace | `desert-fencewall` (low adobe) as the wall language everywhere; height read comes from placement (double run + towers of stacked obelisks/cliff tiles). Military `palisade` + `palisade-gate-anim` acceptable ONLY for bedouin_camp perimeter accents. |
| 12 | Clean keys for typo'd files | any | Use the typo'd catalog keys as-is (`house-2-stone-base-blackpng`, `lanter-posts`, `minecrats`, `with-hut`, `royal-pantst-1-red`) — the catalog is filename-derived; renaming files would regenerate keys and break nothing else, but is out of scope. `with-hut` (witch hut) is culturally excluded anyway: skip. |

Cultural excludes (hard, enforced at module load — never work around): santa, reindeer, pumpkin,
witch, halloween pack, crosses/church, pig sprites.
