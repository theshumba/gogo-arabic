# World Connection Map — the one-page region plan

**Status:** Phase 1 design document (2026-07-03). Binding on all 8 zone designs. DOCUMENT ONLY — no code, maps, or zones.js changes flow from this file directly.
**Ground truth it obeys:** exit connectivity from `docs/world-design-research/contract-and-pipeline.md` §1 (every exit id, targetZone, targetEntry preserved); LAW-28/41/42/46 and the zone briefs in `docs/WORLD-DESIGN-BIBLE.md` §3.

---

## 1. The region in one sentence

**A caravan road climbs north-east out of the deep sand sea, through the trade towns and the wadi farms, over the mountain escarpment, and down to the Sultan's sea.**

Geographic logic (classic Arabian cross-section, Hejaz/Hajar pattern — desert interior, mountain wall, coastal plain):

- **South-west = deep desert interior.** The oasis spring is the only water for days; the library stands alone in the dunes north of it. Softest, emptiest corner of the region.
- **Centre = the caravan belt.** The walled souk sits where the library road meets the north road. Directly north of it, the **farmland hugs the wadi** — a seasonal river running down off the highlands to the north-east, which is exactly why green fields exist here and nowhere else (LAW-20 falaj channels tap the wadi/pond; "water is wealth").
- **North-centre = the steppe.** East of the farms the channels stop and the bedouin graze the scrubland at the mountains' feet.
- **North-east = the mountain wall, then the sea.** The stone village sits in the escarpment pass; over its eastern ledge the land drops to the coastal plain. The port works the harbour; the palace crowns the shore north of it. Sea bounds the region's entire north-east corner.

So: **coast on the north-east side, deep desert opposite on the south-west, mountains between steppe and sea, farmland on the water (wadi) — every zone sits where its biome is earned.**

Water gradient across the region (each zone's single water feature, LAW-18/19): oasis pool → library forecourt fountain → souk plaza fountain → farm pond + wadi channels → bedouin water-hole/trough pool → mountain spring cascade → harbour inlet → palace garden fountains by the sea.

## 2. Region diagram

Map-north = screen-top in every zone. The chain staircases from SW (start) to NE (endgame). `‖` / `=` are zone-to-zone roads; `~` is sea.

```
                                            ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
                                            ~   OPEN SEA (NE)   ~
                                        +--------------------+ ~ ~
                                        |    royal_palace    |~
                                        |  (sea at its back) |~
                                        +---------S----------+
                                                  ‖  coast road
                                        +---------N----------+
              MOUNTAIN WALL             |    coastal_port    |~
           +-----------------+  pass    | (harbour inlet E/S)|~
           | mountain_village E ======= W                    |
           |  (escarpment)   |  descent +--------------------+
           +--------S--------+
                    ‖  cliff climb
           +--------N--------+
 STEPPE    |   bedouin_camp  |
+---------+|  (scrub, dunes) |
| farmland E ====== W        |
| (wadi ~) | steppe +--------+
+----S----+  road
     ‖  green gate                         SW ←──────────→ NE
+----N--------------+                    deep desert    coast
| desert_marketplace|                   (start)      (endgame)
|   (walled souk)   |
+—W—----------------+
   ‖ scholars' road (E↔W)
+--E----------------+
|  ancient_library  |
| (alone in dunes)  |
+--------S----------+
     ‖  dune track
+----N----+
|  oasis_ |    DEEP DESERT / SAND SEA (SW)
| village |
+---------+
```

Reading it: four "rungs" of the ladder run south→north (oasis→library, market→farm, bedouin→mountain, port→palace) and three run west→east (library→market, farm→bedouin, mountain→port). The journey always moves up-and-right — the player *feels* the climb toward the sea.

## 3. Exit ledger — every exit pair, edge + position

**Conventions (binding on all zone designs):**

- Zone dims may change per design, so positions are **edge fractions, not tiles**. For a **north/south** edge the fraction runs **west→east** (`0.0` = west corner, `1.0` = east corner). For an **east/west** edge it runs **north→south** (`0.0` = north corner). The exit's fraction = centre of its 2–3-tile cut (LAW-41).
- **Facing rule:** the two exits of a pair sit on opposite edges (N↔S, E↔W — LINT-6 requires the rect on its declared edge) and their fractions must agree within **±0.10**, so walking out one side puts you on the *same road* coming in the other. The destination's `entries[targetEntry]` tile sits 1–2 tiles inside its own exit cut.
- Each zone's ONE dressed main entrance (LAW-28) is marked ★; other exits stay plain 2-tile gaps. Every exit gets its palm/prop signpost cluster within 3 tiles (LAW-42).
- Edges below **match the current zones.js edges exactly** — the contract's connectivity survives with zero edge churn; only tileRanges/positions move with the new layouts.

| Zone | Exit id | Destination (entry key) | Edge | Fraction on edge |
|---|---|---|---|---|
| oasis_village | `oasis-to-library` | ancient_library (`from_oasis`) | **N** ★ | 0.50 |
| ancient_library | `library-to-oasis` | oasis_village (`from_library`) | **S** ★ | 0.50 |
| ancient_library | `library-to-marketplace` | desert_marketplace (`from_library`) | **E** | 0.55 |
| desert_marketplace | `market-to-library` | ancient_library (`from_marketplace`) | **W** ★ | 0.50 |
| desert_marketplace | `market-to-farmland` | farmland (`from_marketplace`) | **N** | 0.45 |
| farmland | `farm-to-marketplace` | desert_marketplace (`from_farmland`) | **S** ★ | 0.45 |
| farmland | `farm-to-bedouin` | bedouin_camp (`from_farmland`) | **E** | 0.50 |
| bedouin_camp | `bedouin-to-farmland` | farmland (`from_bedouin`) | **W** ★ | 0.50 |
| bedouin_camp | `bedouin-to-mountain` | mountain_village (`from_bedouin`) | **N** | 0.50 |
| mountain_village | `mountain-to-bedouin` | bedouin_camp (`from_mountain`) | **S** ★ | 0.50 |
| mountain_village | `mountain-to-port` | coastal_port (`from_mountain`) | **E** | 0.40 |
| coastal_port | `port-to-mountain` | mountain_village (`from_port`) | **W** ★ | 0.40 |
| coastal_port | `port-to-palace` | royal_palace (`from_port`) | **N** | 0.50 |
| royal_palace | `palace-to-port` | coastal_port (`from_palace`) | **S** ★ | 0.50 |

Fraction rationale (zone designs may nudge within ±0.10 of these, keeping pairs matched):

- **0.50 pairs** sit on each zone's main axis: the oasis→library dune track continues straight into the library's ceremonial south approach (LAW-29); the bedouin north exit feeds the mountain entrance pinch (LAW-51); the port→palace road lands dead-centre on the palace's south-gate ceremonial axis (full symmetry ON the axis, LAW-29).
- **library E / market W at ~0.50–0.55** — slightly south of centre so the market's dressed west gate opens near its fountain-plaza latitude, and the library keeps its east road informal, off the sacred axis.
- **market N / farm S at 0.45** — a touch west of centre, keeping the farm's south gate clear of the pond/channel corner and giving the souk's north wall an off-axis gate (LAW-30 diagonal composition: west gate, plaza, north gate sweep a diagonal).
- **mountain E / port W at 0.40** — north of centre: the ledge road leaves from the mountain's mid/upper band (the climb pays off with the first sea vista, LAW-46), and enters the port high on its west side, above the inlet that bites into the port's east/south.

Sea edges (container, not exits): coastal_port — east + part of south is water (inlet per LAW-21); royal_palace — north and east edges are sea/cliff behind the palace walls. Both zones' LAW-46 vista is the sea itself; mountain_village's vista is the sea glimpsed from the east ledge; oasis/library/market/farm/bedouin vistas look back over dunes or up at the mountain wall.

## 4. Travel narratives — what each road feels like

| Route | One-liner |
|---|---|
| oasis ⇄ library | The palm shade thins to bare dunes until, alone on the horizon, the library's obelisk-flanked axis rises out of the sand — silence gets holier the further north you walk. |
| library ⇄ marketplace | Eastward the scholar's hush breaks: camel tracks multiply, bunting appears on poles, and the souk's adobe wall and gate banners swallow the horizon. |
| marketplace ⇄ farmland | Out the north gate the dust darkens to irrigated soil — after the souk's roar, green plots and a turning windmill read as a miracle bought with wadi water. |
| farmland ⇄ bedouin_camp | East past the last fence the channels stop, grass frays to scrub, and tent-tops and a thread of campfire smoke stand up out of open steppe. |
| bedouin_camp ⇄ mountain_village | North of the camp the ground tilts; cliffs pinch the trail into a zigzag climb with the spring cascade sounding somewhere above. |
| mountain_village ⇄ coastal_port | Over the eastern ledge the desert simply ends — salt wind, gull cries, and the whole sea filling the horizon as the trail drops to the quays. |
| coastal_port ⇄ royal_palace | The shore road leaves the harbour clamour behind; packed dirt turns to dressed stone underfoot as the palace walls and golden facade climb into view. |

## 5. Aside — letter schools as gyms (DOC-ONLY, future)

Future feature idea, recorded here so zone designs don't accidentally close the door on it: each of the 8 zones could one day host a **letter school** — a Pokémon-gym-style hall teaching one group of Arabic letters, cleared in chain order (oasis first, palace last), with the zone's landmark or an existing interior as its natural home (e.g. library study, mountain mosque school-room, palace court). **No logic, no new IDs, no doors, no map elements are added for this now.** The only design obligation: each zone's landmark district should remain roomy enough that a school could later be slotted in without breaking the LAW-11 building budget. Nothing else.

---

*Change control: any zone design that wants a different edge or a fraction outside the ±0.10 window must update THIS file first — both zones of the pair move together or not at all.*
