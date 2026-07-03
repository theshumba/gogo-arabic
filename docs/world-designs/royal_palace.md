# Zone Design — royal_palace (القَصر المَلَكي)

**Phase 1 design document, 2026-07-03. DOCUMENT ONLY — no code, maps, or zones.js changes flow from this file.**
Ground truth obeyed: `docs/WORLD-DESIGN-BIBLE.md` (§2 LAWs, §3.8 brief, §4 palette, §7 LINT),
`docs/world-design-research/contract-and-pipeline.md` §1 (royal_palace contract) + §8 (interior),
`docs/world-designs/world-connection-map.md` (exit ledger row: `palace-to-port` S ★ @0.50).

---

## 1. Concept

The Sultan's walled precinct at the edge of the sea — one dead-straight ceremonial axis runs from
the dressed south gate, through an obelisk inner gate and an empty stone forecourt, up two steps to
the golden temple-facade with the locked throne door, while everything off the axis softens into
two hedged gardens (the imam's prayer garden west, the poet's fountain garden east) and a working
service corner. The focal anchor is the palace facade composite (16 tiles of massing with the sea
glittering at its back) terminating the axis; the secondary focals are the two garden fountains.
It channels DQ3 Isis (walled desert palace, garden atriums, carpeted axis), the VectoRaith walled
garden courtyard (gate → banner-lined path → domed facade, palms flanking), and Zelda LttP Hyrule
Castle grounds (threshold stacking: outer gate → grounds → inner gate → facade).

**Reference steals (images studied in `/Users/theshumba/Desktop/Gogo-World-References/`):**

| Reference | What this composition steals |
|---|---|
| `04/dq3-snes-isis-arabian-palace-town-fullmap.png` | The whole genre: Arabian palace as a walled sand precinct; long carpeted/paved central axis to the throne; symmetric garden insets flanking the axis; water at the palace's back. Also the throne interior's full-length-carpet signature (kept in `palace_throne_interior`, INT-9). |
| `04/vectoraith-arabian-palace-walled-garden-courtyard.png` | The money shot. Crenellated wall wrapping an irregular (not rectangular) footprint; single wide stone path bottom-gate → facade; mirrored banner+statue pairs ON the path only; palm/grass garden blobs left and right kept informal; twin gate towers. My gate towers, axis banner pairs, and asymmetric garden blobs copy this directly. |
| `04/vectoraith-arabian-golden-dome-palace-plaza.png` | Big EMPTY stone plaza in front of the facade with pillar pairs at its mouth; minaret towers as vertical punctuation at the massing's corners; water visible beyond the built edge. My forecourt (15×6, kept clean) + obelisk minarets + sea-behind-palace read. |
| `04/zelda-lttp-hyrule-castle-grounds-overworld.png` | Threshold stacking as drama: bridge/outer gate → grounds → inner gate → facade steps, each narrower than the last; moat wrapping the massing. I stack south gate (y33) → obelisk inner gate (y20) → terrace steps (y13); the sea bay at the palace's back is my "moat". |
| `04/zelda-lttp-eastern-palace-grounds.png` | Statue pairs framing walkway mouths, hedge-bounded garden rooms off the approach. My statue pair at the plaza mouth and the two hedge-ringed garden rooms. |
| `04/golden-sun-tolbi-palace-town.png` | Fountain plaza offset from the palace approach; lantern posts marking the formal walk; how a palace town keeps its grandeur to ONE avenue and lets side areas stagger. |
| `04/vectoraith-arabian-town-square-fountain-scene.png` | Fountain in a grass-collared basin; lamp-post pairs; the pavement/sand/grass three-material grammar and a hard stone curb wherever grass meets other ground (my grass↔sand seam workaround). |
| `01/golden-sun-bilibin-town-fullmap.png` | The palace approach avenue: town gate below, mansion on the high ground at the end of a single widening path — the "walk out of the gate onto a road that leads somewhere" believability check. |

## 2. Dimensions

**50 × 40 tiles** (64px tiles) — unchanged from the contract (`mapWidth/mapHeight` 50×40); the
largest, most formal zone per bible §3.8.

## 3. Tile-grid sketch

Legend: `~` sea · `s` sand · `g` garden grass · `p` stone pavement (pavement-tiles) · `W` adobe wall
(desert-fencewall, doubled for depth) · `C` cliff/dune (desert-cliff-tiles) · `B` palace massing
(composite, see §7) · `o` obelisk (minaret / gate tower / inner-gate pillar) · `h` hedge on a 1-tile
pavement curb · `T` palm · `f` fountain (contract interactable) · `D` throne door (contract) ·
`*` spawn + `from_port` entry (25,37) · `x` exit cut `palace-to-port` (y39, x24–26).

Machine-verified grid (generated from the normative row spec below; every row exactly 50 chars):

```
          1111111111222222222233333333334444444444
     01234567890123456789012345678901234567890123456789
y00  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
y01  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
y02  ~~~~~~~~~sss~ssss~~~~~~~~~~ss~~~~sss~ssss~~~~~~~~~
y03  ~~~~ssssssssssssssss~~~~ssssssssssssssssssssssC~~~
y04  WWssssssssssssssoBBBBBBBBBBBBBBBBossssssssssssC~~~
y05  WWssTsTssssssssssBBBBBBBBBBBBBBBBssssTsTssssssCC~~
y06  WWsssTsssssssssssBBBBBBBBBBBBBBBBsssssTsssssssCC~~
y07  WWWssssssssssssssBBBBBBBBBBBBBBBBsssssssssssssCC~~
y08  WWWssssssssssssssBBBBBBBBBBBBBBBBsssssssssssssCC~~
y09  WWsssssssssssssssBBBBBBBBBBBBBBBBssssssssssssCC~~~
y10  WWsssssssssssssspppppppppDpppppppppssssssssssCC~~~
y11  WWsssssssssssssspppppppppppppppppppssssssssssCC~~~
y12  WWWssssssssssssspppppppppppppppppppssssssssssCC~~~
y13  WWWssssssssssssshhhhhhhhppphhhhhhhhsssssssssssCC~~
y14  WWWssssssssssssssspppppppppppppppsssssssssssssCC~~
y15  WWWssssssssssssssspppppppppppppppsssssssssssssCC~~
y16  WWWssssssssssssssspppppppppppppppsssssssssssssWWCC
y17  WWssssssTssssssssspppppppppppppppssssssTssssssWWCC
y18  WWsssssssssssssssspppppppppppppppsssssssssssssWWCC
y19  WWsssssssssssssssspppppppppppppppsssssssssssssWWCC
y20  WWssssssssssssssssssssospppsosssssssssssssssssWWCC
y21  WWshhhhhhhThhhhhhssssssspppsssshhhhhhhThhhhhhsWWCC
y22  WWshgTgggggggggghsssssssppppppppgggggggggggghsWWCC
y23  WWshggggggggTggghsssssssppppppppggggTggggggghsWWCC
y24  WWshgggggggggggghssssssspppsssshggggggfggggghWWWCC
y25  WWWTgggggfgggggghssssssspppsssshgggggggggggghWWWCC
y26  WWWhggggggggggggpppppppppppsssshggggggggggTghWWWCC
y27  WWWhgggggggggTggpppppppppppsssshgggggggggggghsWWCC
y28  WWWhgggggggggggghssssssspppsssshhhhhhThhhhhhhsWWCC
y29  WWshhhhhhThhhhhhhssssssspppsssssssssssTssssTssWWCC
y30  WWsssssssssssssssssssssspppssssssssssssssTssssWWCC
y31  WWsssssssssssssssssssssspppsssssssssssssssssssWWCC
y32  WWsssssssssssssssssssssspppsssssssssssssssssssWWCC
y33  WWWWWWWWWWWWWWWWWWWWWWWopppoWWWWWWWWWWWWWWWWWWWWCC
y34  WWWWWWWWWsssssssssssssspppppssssssssssWWWWWWWWssCC
y35  CCssssssssssssssssssssspppppssssssssssssssssssssCC
y36  CCCsssssssssssssssssssspppppsssssssssssssssssssCCC
y37  CCsssssssssssssssssssTssp*pssTssssssssssssssssssCC
y38  CCCCCssssCCCCssssCCCCssspppssssCCCCssssCCCCsssCCCC
y39  CCCCCCCCCCCCCCCCCCCCCCCCxxxCCCCCCCCCCCCCCCCCCCCCCC
```

Landmarks to read in the grid: `D`=(25,10) throne door · `f`=(9,25) west fountain, (38,24) east
fountain · inner gate `o` pair (22,20)/(28,20) · gate towers `o` (23,33)/(27,33) · minarets `o`
(16,4)/(33,4) · `*`=(25,37) spawn/`from_port` · `x` y39 x24–26 exit · statues sit on plaza `p` at
(22,19)/(28,19) · vista inscription on `s` at (44,12) · SE quiet palm grove `T` (38–43, 29–30) ·
lone strip palms (8,17)/(39,17) pacing the flank sands (LAW-33/45) · hedge-run palm breaks at
(10,21)/(38,21)/(3,25)/(37,28)/(9,29) keep every hedge run ≤8 (LAW-43).

**Normative row spec** (exact segment runs, x-ranges inclusive — the machine-readable form the
Tiled-authoring agent should build from; the grid above was generated from it):

| y | Row spec (x-ranges, inclusive) |
|---|---|
| 0 | ~ 0–49 |
| 1 | ~ 0–49 |
| 2 | ~ 0–8 · s 9–11 · ~ 12 · s 13–16 · ~ 17–26 · s 27–28 · ~ 29–32 · s 33–35 · ~ 36 · s 37–40 · ~ 41–49 (scalloped shore islets) |
| 3 | ~ 0–3 · s 4–19 · ~ 20–23 (sea bay at palace back) · s 24–45 · C 46 · ~ 47–49 |
| 4 | W 0–1 · s 2–15 · o 16 · B 17–32 · o 33 · s 34–45 · C 46 · ~ 47–49 |
| 5 | W 0–1 · s 2–3 · T 4 · s 5 · T 6 · s 7–16 · B 17–32 · s 33–36 · T 37 · s 38 · T 39 · s 40–45 · C 46–47 · ~ 48–49 |
| 6 | W 0–1 · s 2–4 · T 5 · s 6–16 · B 17–32 · s 33–37 · T 38 · s 39–45 · C 46–47 · ~ 48–49 |
| 7 | W 0–2 · s 3–16 · B 17–32 · s 33–45 · C 46–47 · ~ 48–49 |
| 8 | W 0–2 · s 3–16 · B 17–32 · s 33–45 · C 46–47 · ~ 48–49 |
| 9 | W 0–1 · s 2–16 · B 17–32 · s 33–44 · C 45–46 · ~ 47–49 |
| 10 | W 0–1 · s 2–15 · p 16–24 · **D 25** · p 26–34 · s 35–44 · C 45–46 · ~ 47–49 |
| 11 | W 0–1 · s 2–15 · p 16–34 · s 35–44 · C 45–46 · ~ 47–49 |
| 12 | W 0–2 · s 3–15 · p 16–34 · s 35–44 · C 45–46 · ~ 47–49 |
| 13 | W 0–2 · s 3–15 · h 16–23 · p 24–26 (steps) · h 27–34 · s 35–45 · C 46–47 · ~ 48–49 |
| 14 | W 0–2 · s 3–17 · p 18–32 (plaza) · s 33–45 · C 46–47 · ~ 48–49 |
| 15 | W 0–2 · s 3–17 · p 18–32 · s 33–45 · C 46–47 · ~ 48–49 (last sea row NE) |
| 16 | W 0–2 · s 3–17 · p 18–32 · s 33–45 · W 46–47 · C 48–49 |
| 17 | W 0–1 · s 2–7 · T 8 · s 9–17 · p 18–32 · s 33–38 · T 39 · s 40–45 · W 46–47 · C 48–49 (lone strip palms, LAW-33/45) |
| 18 | W 0–1 · s 2–17 · p 18–32 · s 33–45 · W 46–47 · C 48–49 |
| 19 | W 0–1 · s 2–17 · p 18–32 · s 33–45 · W 46–47 · C 48–49 |
| 20 | W 0–1 · s 2–21 · o 22 · s 23 · p 24–26 · s 27 · o 28 · s 29–45 · W 46–47 · C 48–49 |
| 21 | W 0–1 · s 2 · h 3–9 · T 10 · h 11–16 · s 17–23 · p 24–26 · s 27–30 · h 31–37 · T 38 · h 39–44 · s 45 · W 46–47 · C 48–49 (palms break hedge runs ≤8, LAW-43) |
| 22 | W 0–1 · s 2 · h 3 · g 4 · T 5 · g 6–15 · h 16 · s 17–23 · p 24–31 (axis + east path + mouth) · g 32–43 · h 44 · s 45 · W 46–47 · C 48–49 |
| 23 | W 0–1 · s 2 · h 3 · g 4–11 · T 12 · g 13–15 · h 16 · s 17–23 · p 24–31 · g 32–35 · T 36 · g 37–43 · h 44 · s 45 · W 46–47 · C 48–49 |
| 24 | W 0–1 · s 2 · h 3 · g 4–15 · h 16 · s 17–23 · p 24–26 · s 27–30 · h 31 · g 32–37 · **f 38** · g 39–43 · h 44 · W 45–47 (east wall thickens) · C 48–49 |
| 25 | W 0–2 · T 3 (hedge-column break) · g 4–8 · **f 9** · g 10–15 · h 16 · s 17–23 · p 24–26 · s 27–30 · h 31 · g 32–43 · h 44 · W 45–47 · C 48–49 |
| 26 | W 0–2 · h 3 · g 4–15 · p 16–26 (west mouth + path + axis) · s 27–30 · h 31 · g 32–41 · T 42 · g 43 · h 44 · W 45–47 · C 48–49 |
| 27 | W 0–2 · h 3 · g 4–12 · T 13 · g 14–15 · p 16–26 · s 27–30 · h 31 · g 32–43 · h 44 · s 45 · W 46–47 · C 48–49 |
| 28 | W 0–2 · h 3 · g 4–15 · h 16 · s 17–23 · p 24–26 · s 27–30 · h 31–36 · T 37 · h 38–44 · s 45 · W 46–47 · C 48–49 |
| 29 | W 0–1 · s 2 · h 3–8 · T 9 · h 10–16 · s 17–23 · p 24–26 · s 27–37 · T 38 · s 39–42 · T 43 · s 44–45 · W 46–47 · C 48–49 |
| 30 | W 0–1 · s 2–23 · p 24–26 · s 27–40 · T 41 · s 42–45 · W 46–47 · C 48–49 |
| 31 | W 0–1 · s 2–23 · p 24–26 · s 27–45 · W 46–47 · C 48–49 |
| 32 | W 0–1 · s 2–23 · p 24–26 · s 27–45 · W 46–47 · C 48–49 |
| 33 | W 0–22 · o 23 · p 24–26 (GATE) · o 27 · W 28–47 · C 48–49 |
| 34 | W 0–8 (SW bastion depth) · s 9–22 · p 23–27 (widened) · s 28–37 · W 38–45 (SE bastion depth) · s 46–47 · C 48–49 |
| 35 | C 0–1 · s 2–22 · p 23–27 · s 28–47 · C 48–49 (apron flanks sealed by dune) |
| 36 | C 0–2 · s 3–22 · p 23–27 · s 28–46 · C 47–49 |
| 37 | C 0–1 · s 2–20 · T 21 · s 22–23 · p 24 · **\* 25** · p 26 · s 27–28 · T 29 · s 30–47 · C 48–49 |
| 38 | C 0–4 · s 5–8 · C 9–12 · s 13–16 · C 17–20 · s 21–23 · p 24–26 · s 27–30 · C 31–34 · s 35–38 · C 39–42 · s 43–45 · C 46–49 (jogged dune band, LAW-48) |
| 39 | C 0–23 · **x 24–26** (exit `palace-to-port`) · C 27–49 |

Composition notes the grid encodes:
- **Ceremonial axis (LAW-29):** ONE straight 3-tile stone path x24–26 from gate (y33) to door
  (25,10) — the only straight run >8 tiles, licensed as the ceremonial axis; stacked thresholds at
  y33 (gate towers `o`), y20 (obelisk inner gate), y13 (terrace steps between hedge shoulders).
  Mirrored pairs sit ON the axis only; the flanking gardens are asymmetric blobs (west garden 13
  wide/8 deep, fountain NW-of-centre; east garden 14 wide/8 deep, fountain E-of-centre, palm
  accents unmatched).
- **Entrance framing (LAW-28):** approach widens 3→5 tiles over rows 36→34, torch pair decor at
  (22,36)/(28,36), palm pair (21,37)/(29,37) — doubling as the LAW-42 exit signpost cluster — and
  gate towers (23,33)/(27,33). Decision point: inner gate + garden-sign junction at y20–22.
- **Water placement:** the sea IS the container on north/east; a sea bay (x20–23, y3) laps the
  palace's back so the facade reads "palace with the sea at its back" (connection map §3). The two
  garden fountains are the walk-up water features.
- **Building clustering (LAW-11/12):** one oversized landmark only — the palace massing (16×6 B
  block + minaret pair), top-centre, axis-end. No other buildings; this is a precinct, not a town.
- **Diagonals (LAW-30):** the axis is the sanctioned symmetric exception; the secondary focals
  (west fountain x9, east fountain x38, vista point (44,12), service vignette (4–6,31)) pull the
  eye across both diagonals.
- **Path language (LAW-1/2/3/4):** main axis 3 wide (5 at the gate), garden side paths 2 wide
  (rows 22–23 east, 26–27 west — offset T-junctions, no crossroads), garden mouths 1–2. Every path
  ends at a door, the exit, a fountain, or the sea vista.
- **Container closure (LAW-41/48):** walls west+south, sea north, cliff east — and the outside-wall
  gate apron (rows 34–37) is sealed at BOTH map edges by jogged dune `C` (depth 1–3: y35 x0–1/48–49,
  y36 x0–2/47–49, y37 x0–1/48–49) meeting the y38–39 dune band, so no open sand touches the map
  border; the only cut is the 3-tile exit. The east sea-cliff jogs its column every 2–4 rows
  (x46 → x46–47 → x45–46 → x46–47) per LAW-48.
- **Sand-strip rhythm (LAW-33/45):** the flank sands are not bare — lone palms at (8,17) and
  (39,17) sit 8–15 tiles from the NW/NE palm triangles, the garden hedges, and the vista/grove
  POIs; hue-blob patches + ground decals per ~4×4 fill between (authoring dressing, not gridded).

## 4. Districts

| District | Tile rect (x,y,w,h) | Purpose |
|---|---|---|
| Sea & shore walk | (0,0,50,4) | Container + LAW-46 vista; sea bay behind the palace. |
| Palace terrace | (16,4,19,9) | The landmark: palace massing (rows 4–9) + paved terrace (rows 10–12) carrying the throne door, scholar alcoves (bookshelves), gallery paintings, golden-pot pair, throne chest. |
| Forecourt plaza | (18,13,15,7) | 15×6 empty stone forecourt (brief: 10–16 tiles) + ceremonial steps; statue pair at its mouth, lantern pair at the steps' foot (row 14); Vizier Abbas holds audience here. |
| West prayer garden | (3,21,14,9) | Hedge-ringed grass room; fountain-palace-2 + Imam Muhammad's prayer spot (rug decor beneath him, LAW-38); palms + flowers. |
| East poet's garden | (31,21,14,8) | Hedge-ringed grass room; fountain-palace-1, Poet Rumi + Princess Aisha vignette, poetry bookshelf under a pergola, two gallery paintings, hidden garden chest. |
| Axis & inner gate | (22,20,7,13) | The processional spine between gate and plaza; obelisk inner gate; garden signpost junction. |
| Service corner (SW) | (2,29,8,4) | Working palace: crate pair + camel-groom story vignette (camel, rug, water trough decor — explicit objects, ambient spawner stays OFF). |
| SE palm grove (QUIET corner) | (37,29,9,4) | LAW-31 quiet corner: 3 palms + one inscription, zero NPCs, zero buildings. |
| East vista strip | (33,4,13,16) | Open sand between plaza and the sea cliff; palm clusters, ground decals, clifftop inscription where the player sees the open sea (LAW-46). |
| Gate apron (outside walls) | (0,34,50,6) | Sand road to the port; dressed gate framing, sign-palace, dune band container with the south exit cut. |

(Contract §1 defines no `subAreas` for royal_palace — these districts guide decor/mood only; no new
IDs are created.)

## 5. Contract placement table

Every royal_palace contract ID from contract-and-pipeline.md §1, exactly once. Exit edge matches
world-connection-map (S ★, fraction 0.50 → centre x25 of 50). `spawnPoint` and entry `from_port`
both (25,37), 2 tiles inside the exit cut, on the paved approach.

| Contract ID | Type | Tile (x,y) | Rationale (analogous point of interest) |
|---|---|---|---|
| `palace-to-port` | exit | south edge y39, tileRange **[24,26]** → coastal_port/`from_palace` | Connection-map row: S ★ @0.50 (centre x25 = 25/50); 3-tile cut per LAW-41, aligned with the y38 paved road; the shore road from the port arrives dead-centre on the ceremonial axis (Bilibin approach avenue). |
| `from_port` (entry) + spawnPoint | entry | (25,37) | 2 tiles inside the cut, on the axis, palace visible straight ahead (LAW-25 axis rule). |
| `vizier-abbas` | NPC | (23,15) | Holds the forecourt beside the throne steps — gatekeeper of the locked audience (DQ3 Isis chancellor position), 2 off-axis per LAW-29. |
| `princess-aisha` | NPC | (37,26) | East garden, across the fountain from the poet — the "court listens to poetry" vignette (LAW-34). |
| `poet-rumi` | NPC | (40,24) | East poet's garden beside fountain-palace-1, his stage (brief: east poet's garden = fountain + paintings). |
| `imam-muhammad` | NPC | (9,27) | West prayer garden, south of fountain-palace-2, on a prayer rug (decor) — carpet under veneration (LAW-38). |
| `door-palace-throne` | door (locked: `palace_audience_granted`) → `palace_throne_interior` | (25,10) | Facade centre, axis terminus — the payoff of the whole zone (VectoRaith courtyard facade arch). ≥2 clear paved tiles in front at (25,11),(25,12). |
| `sign-palace` | sign | (28,35) | 1 tile off the widened approach, east/approach side, outside the gate (LAW-7). |
| `sign-throne` | sign | (23,12) | Top of the steps, 1 off-axis, announcing the locked throne hall; within 2 tiles of the door's facade run (LAW-16). |
| `sign-garden` | sign | (28,21) | At the inner-gate junction where both garden paths branch (LAW-7 junction sign). |
| `bookshelf-palace-adj` | bookshelf | (18,10) | Terrace west-wing scholar alcove against the facade (building-set proximity, LAW-16). |
| `bookshelf-palace-colors` | bookshelf | (32,10) | Terrace east-wing alcove, mirrored ON the ceremonial terrace only. |
| `bookshelf-palace-phrases` | bookshelf | (42,22) | Poetry shelf under the pergola in the poet's garden — phrases live with the poet. |
| `chest-palace-throne` | chest | (16,11) | Terrace far-west corner behind the minaret pillar — reward tucked off-axis. |
| `chest-palace-garden` | chest | (43,27) | SE hedge nook of the poet's garden (Eastern Palace hedge-garden secret). |
| `fountain-palace-1` | fountain | (38,24) | East poet's garden focal (secondary focal per LAW-26), grass collar per LAW-18. |
| `fountain-palace-2` | fountain | (9,25) | West prayer garden focal — ablution fountain by the prayer spot. |
| `painting-palace-1` | painting | (21,10) | Facade west gallery, between alcove and door (Isis palace murals). |
| `painting-palace-2` | painting | (29,10) | Facade east gallery, mirrored ON the ceremonial terrace. |
| `painting-palace-3` | painting | (35,22) | Poet's garden north gallery hedge. |
| `painting-palace-4` | painting | (41,27) | Poet's garden south wall — brief: east garden = fountain + paintings. |
| `lantern-palace-1` | lantern | (23,14) | Plaza tile at the west foot of the ceremonial steps (LAW-36 pair on the axis) — NOT on the y13 hedge shoulder, which is collision. |
| `lantern-palace-2` | lantern | (27,14) | East foot of the steps — mirrored pair. |
| `lantern-palace-3` | lantern | (27,32) | Just inside the gate, 1 off the axis — the gate lamp. |
| `statue-palace-1` | statue | (22,19) | West frame of the plaza mouth (Eastern Palace statue-pair grammar). |
| `statue-palace-2` | statue | (28,19) | East frame of the plaza mouth. |
| `crate-palace-1` | crate | (4,31) | Service-corner supply cluster against the west wall. |
| `crate-palace-2` | crate | (6,32) | Same cluster, staggered (LAW-10/32 cluster of 2). |
| `pot-palace-1` | pot | (23,10) | Golden pot flanking the throne door, west. |
| `pot-palace-2` | pot | (27,10) | Golden pot flanking the throne door, east (veneration frame, LAW-38 rug beneath the threshold). |
| `inscription-palace-1` | inscription | (4,36) | Outside the SW bastion on the apron — lore for players who wander off the road. |
| `inscription-palace-2` | inscription | (44,12) | Clifftop at the east vista — read it while the open sea fills the screen (LAW-46). |
| `inscription-palace-3` | inscription | (42,31) | In the SE quiet-corner palm grove. |
| Gathering spots | — | **NONE — 0 by contract** | Pre-existing anomaly preserved (contract §1: `gatheringSpots: true`, zero spots in GATHERING_SPOTS). Do NOT invent spots. |
| Step triggers / subAreas | — | none | Contract defines none for royal_palace. |

Count check: 4 NPCs + 1 exit + 27 interactables (3 sign, 3 bookshelf, 2 chest, 1 door, 2 fountain,
4 painting, 3 lantern, 2 statue, 2 crate, 2 pot, 3 inscription) + 0 gathering spots = complete.

## 6. Enterable interiors

| Door | Tile | interiorId (contract §8) | Notes |
|---|---|---|---|
| `door-palace-throne` | (25,10) | `palace_throne_interior` — Throne Room (قاعَة العَرش), 18×14 buildMosque | Locked (`palace_audience_granted`; lock fields carried over). Existing hand-crafted layout KEPT this phase (INT-9 full symmetry: full-length carpet to the dais, pillar pairs — the DQ3 Isis signature). All 11 interior interactables + `vizier-interior` NPC untouched; exterior door position (25,10) automatically becomes the return point (contract §8 wiring). |

No additional enterable filler houses: the precinct has no other buildings, and no
`house_royal_palace_<n>` procedural id is referenced by contract — none invented. The terrace east
wing stays roomy enough to slot a future "letter school" hall (connection-map §5) without touching
the LAW-11 budget.

## 7. Asset manifest

All verified against `docs/world-design-research/asset-inventory.md` / `kenmiCatalog.js` families:

| Grid element | Kenmi family (verified in inventory) | Notes |
|---|---|---|
| `s` sand | `desert-tiles-desert-beach-tiles-1/2/3` (3 hues) | Base ground; hue blobs break bare runs (LAW-33). |
| `~` sea | `desert-water-tiles-1/2/3` + `desert-water-foam-animation` | Sand↔water autotile proven (oasis template). |
| `p` pavement | `pavement-tiles` (9×8) | Status stone: axis, plaza, terrace, garden curbs. |
| `g` grass | `base-tiles-grass-grass-tiles-*` | Garden lawns — always curbed by pavement (see LINT-10 note). |
| `W` wall | `desert-fencewall` runs, doubled for depth | MISSING-ASSETS #11 workaround: height read from double runs + obelisk towers; wall runs broken every ≤8 tiles by banner poles / jar clusters / towers (LAW-43). |
| `C` cliff/dune | `desert-tiles-desert-cliff-tiles-1..3` | East sea-cliff + south dune band; edge jogs every 3–6 tiles (LAW-48). |
| `B` palace massing | Composite per MISSING-ASSETS #2: central `desert-temple` (4×4 rendered) + flanking limestone `house-2/3-*` wings + `desert-fencewall` connectors | The 16×6 block is a screen-space composite of 4–5 building sprites; `banners-anim` on the facade. |
| `o` obelisks | `desert-obelisk-1/2`, `desert-obelisk-small-1/2` | Minarets (16,4)/(33,4); gate towers (23,33)/(27,33); inner gate (22,20)/(28,20). MISSING #1 composite (no true dome/minaret). |
| `h` hedge | `hedge-tiles` (4×4) | Garden room walls; sits on the pavement curb tile. |
| `T` palm | `palm-tree-1/2` | Clusters of 2–3 in triangles/L's (LAW-45); pairs only at the dressed entrance. |
| `f` fountains | `fountain` / `fountain-anim` | The 2 contract fountains. |
| Banners/flags | `banners-anim`, `flags-anim` | Facade, inner-gate pair, gate towers. |
| Lamps/torches | `lanter-posts` (typo'd key used as-is, MISSING #12), `big-torch-anim`, `torch-anim` | Ceremonial pairs ONLY (LAW-36). |
| Rugs | `desert-rugs` (FLAT_GROUND) | Throne-door threshold, imam's prayer spot, garden bench spots (LAW-38). |
| Riches decor | `golden-pots`, `gold-piles`, `desert-pots-sacks` | Terrace + service-corner dressing. |
| Flowers/planters | `flowers`, `flower-grass-*-anim` | Garden beds, plaza corners, Ever-Grande-style approach accents. |
| Vignette props | `camel-1..3` (explicit zone object — ambient spawner stays OFF per bible §4), `water-troughs`, `barrels` | SW camel-groom vignette (LAW-34). |
| Pergola | `pergola` (32×64, 1×2 tiles) | Shade frame over the poet's-garden poetry shelf at (42,22) — the "under a pergola" read in §4/§5. |
| Statues (contract) | `desert-obelisk-small-1` 32×32 crop — the wired `statue` sprite in `InteractableManager.js` | `statue-palace-1/2` render via the interactable type map (as do fountain/painting/lantern/pot/crate crops); no separate zone-object key needed, nothing new invented. |
| Benches | `benches`, `split-log-benches` | Garden seating + vista dead-end dressing (LAW-4). |
| Rocks/decals | `desert-rocks`, `desert-grass` scrub blobs, `beach-decor-tiles` | LAW-33 point-of-interest rhythm on the sand strips (one POI per 8–15 tiles, decal per ~4×4). |

**Missing assets:** everything this design needs is covered by existing
`docs/WORLD-MISSING-ASSETS.md` rows #1 (dome/minaret → temple+obelisk composite), #2 (palace kit →
composite, applied above), #5 (sand↔grass → pavement-curb seam, applied), #11 (tall wall → doubled
fencewall + towers, applied), #12 (typo'd keys used as-is). **No new rows added; nothing faked** —
true dome, arched arcade, and an exterior throne remain un-buildable and are simply not drawn.

## 8. Lint self-check (LINT-1..11)

1. **LINT-1 no overlapping objects** — every contract object has a unique tile; nearest same-row
   neighbours on the terrace are ≥2 apart (x = 16, 18, 21, 23, [25 door], 27, 29, 32 across
   y10–12); rugs are FLAT and only underlie the door threshold / imam. Decorative clusters
   (crates, palms) staggered, never stacked.
2. **LINT-2 nothing on water/collision** — all NPCs/interactables sit on `s`, `p`, or `g` tiles per
   the row spec; nothing touches `~`, `W`, `C`, `B`, `h`, or `o` tiles. The sea and bay carry no
   props; no amphibious objects are used.
3. **LINT-3 rugs on plausible ground** — rugs only at (25,11) threshold (pavement), the imam's
   prayer spot (grass), and garden bench spots (grass); none straddle a material seam, shoreline,
   or cliff tile.
4. **LINT-4 density & spacing** — busiest screenful (terrace + plaza, ~x16–35/y4–18) holds ~12
   placed props ≤15 cap (LAW-31); garden screens ~8–10; quiet corner 4 (3 palms + inscription).
   Same-key pairs (pots, statues, lanterns, crates) are declared mirrored pairs/clusters of 2, and
   the only even-spaced repeats sit on the ceremonial axis where LAW-29 licenses them. No empty
   20×20 window: the flank sand strips carry DRAWN lone palms at (8,17)/(39,17) plus decal/hue-blob
   dressing per LAW-33 (see §3 composition notes).
5. **LINT-5 every door reachable** — flood-fill from spawn (25,37): apron → gate (24–26,33) → axis
   → inner-gate gap (24–26,20) → plaza → steps (24–26,13) → terrace → door (25,10) with clear
   (25,11),(25,12) in front (door faces south ✓). Garden mouths: east (31,22–23) via path x27–30;
   west (16,26–27) via path x17–23. Service corner via open sand x2–23 (rows 20–32); east vista via
   sand x33–45 off the plaza edge; outside-wall items via the apron. No orphaned islands; both
   fountains, all 4 NPCs, all 27 interactables, the exit range, and the entry tile reachable.
6. **LINT-6 exits present & connected** — exactly one exit `palace-to-port`, edge=south, tileRange
   [24,26] within bounds (a 2–3-tile cut per LAW-41), fraction 0.50 matching the connection-map ledger and its pair
   (`port-to-palace` N @0.50); `targetEntry` `from_palace` exists in coastal_port's entries; entry
   key `from_port` kept, walkable at (25,37), which is 2 rows off the trigger edge — no teleport
   loop.
7. **LINT-7 contract completeness** — §5 = the full §1 ID set exactly once (counts verified:
   4 NPCs / 1 exit / 27 interactables / 0 gathering spots); `door-palace-throne.interiorId`
   resolves to `palace_throne_interior`, which contains `exit-door` isExit:true (contract §8);
   locked/unlockFlag carried over. Building-set proximity: door, sign-throne, pots, paintings,
   bookshelves all hug the facade/terrace run (LAW-16 WARN window).
8. **LINT-8 dims & template integrity** — 50×40 preserved (= zones.js `mapWidth/mapHeight`); the
   build copies the oasis-village.json layer template (Ground/Collision/Exits by exact name,
   uncompressed GIDs, tileset names = catalog keys); spawn and entry tile are paved and walkable.
9. **LINT-9 asset legality** — §7 uses only inventoried catalog families; typo'd `lanter-posts`
   used as-is; ZERO cultural excludes (no church/cross — the dome read is the sanctioned
   temple+obelisk composite); any new crop from a multi-item sheet (golden-pots items, camel
   frames) gets a `PROP_CROP_REGIONS` entry — data-only.
10. **LINT-10 shoreline & seam sanity** — shoreline steps in 2–4 tile arcs across rows 2–3 (bay at
    x20–23), to be stamped with the sand↔water autotile so no straight seam exceeds 6; **grass
    never touches raw sand**: every garden is ringed by a 1-tile pavement curb (the ground beneath
    the `h` hedge line) with paved mouths — the MISSING #5 workaround; sand↔pavement district
    boundaries follow the jogged plaza/terrace outlines, with only the licensed ceremonial-axis
    edges running straight.
11. **LINT-11 collision coverage (manual authoring law)** — the Collision layer must paint: all `~`
    sea (including the bay), all `W` wall and `C` cliff/dune, the full 16×6 `B` palace footprint,
    all `o` obelisk tiles, all `h` hedge tiles, and `T` palm trunks. Walkable set = `s`/`p`/`g`
    only. Verify by hand + in-game walk-through (water-walk along rows 2–3 and the east cliff,
    wall-clip at both bastions) before acceptance — lint cannot catch unpainted water today.

**Believability walk:** a traveller from the port arrives on the shore road, sees the golden facade
dead ahead over the gate, passes the sign and torch pair as the road widens under the gate towers;
at the inner gate a signpost offers the two gardens; the plaza opens empty and formal with the
Vizier waiting at the steps; every garden path returns to the axis, the service corner explains who
feeds the palace, and the one locked door in the zone is the one the whole zone points at.

---

## 9. Review appendix (adversarial design review, 2026-07-03)

Scope: LAW compliance of the sketch, asset-manifest reality, coherence, and LINT self-check honesty.
Exits, edge fractions, dimensions, and contract-table completeness were locked by the earlier
cross-zone audit and were NOT touched.

**Checked and found sound (no change):**
- LAW-1/2/3 path hierarchy (axis 3, side paths 2, mouths 1–2; offset T-junctions, no crossroads);
  the single >8 straight run is the licensed LAW-29 axis with 3 stacked thresholds.
- LAW-5/16: door (25,10) faces south with paved (25,11)/(25,12) clear; door/sign/pots/paintings/
  bookshelves all hug the facade run.
- LAW-12/11: exactly one oversized landmark (16×6 composite massing), no other buildings.
- LAW-25/26/28/30/46: facade on the walk-in axis; two secondary fountain focals on opposing
  diagonals; dressed entrance (torch pair, palm pair, towers) with a junction 6–7 tiles inside the
  gate; clifftop vista at (44,12). Forecourt 15×6 matches the §3.8 brief's 10–16-tile plaza (wider
  than generic LAW-27 — brief overrides, axis-terminating).
- LAW-31/39: busiest screen ≈12 props ≤15; SE quiet corner = 3 palms + 1 inscription, 0 NPCs;
  forecourt kept empty.
- Coherence spot-checks (grid tile under 8+ placements): vizier (23,15)=p, aisha (37,26)=g,
  rumi (40,24)=g, imam (9,27)=g, sign-palace (28,35)=s beside road, bookshelf-adj (18,10)=p,
  chest-garden (43,27)=g hedge nook, lantern-3 (27,32)=s beside axis, statues (22,19)/(28,19)=p,
  inscriptions (4,36)/(44,12)/(42,31) on s — all sensible, all reachable by flood-fill from (25,37);
  no props on water; sea bay clean.
- Asset manifest: every listed family key grep-verified in `kenmiCatalog.js`; MISSING-ASSETS rows
  #1/#2/#5/#11/#12 correctly relied on; no unreal assets found, no new ledger row needed.

**Violations found and FIXED in this doc:**
1. **Grid ≠ row spec (doc claimed they were generated from each other).** 19 rows diverged
   (y2 shoreline scallops, y5–15 east-cliff jogs, y21/25/28/29 hedge palm-breaks, y24–28 wall
   thickening, y38 dune jogs existed only in the grid). The grid was the LAW-compliant version in
   every case (spec's y2 had an 8-tile straight seam violating LAW-17/LINT-10; spec's y21/y29 had
   13–14-tile unbroken hedge runs violating LAW-43). Row spec rewritten to match the grid;
   grid↔spec equality re-verified by script (all 40 rows, 50 chars each).
2. **LAW-41 container leak:** apron rows y35–37 ran open sand to the map border at x0 and
   x47–49 (a 3-row unmarked hole on each side, bigger than an exit cut). Fixed: jogged dune `C`
   (depth 1–3) added at both apron flanks in grid + spec, meeting the y38–39 dune band; exit cut
   remains the only opening. Inscription (4,36), palm pair, spawn all unaffected (script-checked).
3. **LAW-33 bare flank sands:** west strip (~x2–17, y10–20) and east strip (~x35–45, y14–20) had
   zero drawn POIs (only promised decals). Fixed: lone palms drawn at (8,17) and (39,17)
   (LAW-45 open-sand spacing 8–15 from the nearest palm triangle/hedge/vista POIs), plus an
   explicit composition note for hue-blob/decal dressing.
4. **Manifest omissions:** `pergola` was used by §4/§5 (poetry shelf) but absent from §7 — added
   (real key, 32×64). Statue rendering documented: `statue-palace-1/2` use InteractableManager's
   wired `desert-obelisk-small-1` crop, not a zone-object key — no invention.
5. **LINT-2 breach — lanterns on hedge collision:** `lantern-palace-1/2` were placed at
   (23,13)/(27,13), which the grid draws as `h` hedge (collision per LINT-11), directly
   contradicting the doc's own LINT-2 claim. Moved to the plaza tiles at the steps' foot,
   (23,14)/(27,14) — still a mirrored LAW-36 pair flanking the axis, off the walkway centre.
6. **LINT self-check honesty:** LINT-4's "every sand strip carries palm clusters" was aspirational
   (nothing drawn) — now true and cross-referenced; LINT-2's "nothing touches h" was false until
   fix 5; the "machine-verified grid" claim was FALSE at review time (19 divergent rows) and is
   true again after fix 1. All re-verified by script post-fix: 40 rows × 50 chars, spec↔grid
   0 mismatches, all 31 placements + exit + entry on legal tiles and flood-fill reachable from
   spawn (1298/1298 walkable tiles connected).

**Noted, deliberately not changed:** lantern-palace-3 is a single (contract forces an odd lantern
count; the entrance pair is the torch decor pair, LAW-36 satisfied there); SE grove palms are a
loose 3-palm scatter rather than a tight 1–2-gap cluster (reads as intended quiet-corner grove);
approach widens 3→5 rather than LAW-28's 3→4 (within the bible's ±1 tolerance); y34 x46–47 sand
pocket is an intentional dead dune nook outside the walls.
