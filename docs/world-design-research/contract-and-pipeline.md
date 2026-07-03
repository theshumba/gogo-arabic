# World Rebuild — Contract & Pipeline Ground Truth

Generated 2026-07-03 (Phase 0 audit) by extracting `src/data/zones.js` + `src/data/gatheringSpots.js` at runtime and auditing the map pipeline. This is the machine-readable contract for the full visual-world rebuild.

**Contract rule:** every ID below (zone / NPC / interactable / gathering spot / exit / entry key / interiorId) MUST exist in the rebuilt maps. Coordinates shown are the CURRENT layout — they are all free to change. Exit *connectivity* (which zone connects to which, via which `targetEntry` key) is preserved; the `edge` and `tileRange` of an exit may move. Decorative `objects[]` entries have no IDs and are fully replaceable.

Zone registry: `ZONES` in `src/data/zones.js` (8 core zones defined inline; 8 real-world zones from `src/data/zones/realWorldZones.js`; 8 fantasy zones from `src/data/zones/fantasyZones.js`). The rebuild targets the 8 core zones only. `ZONE_ORDER` lists all 24.

Zone graph (core 8, linear chain):
`oasis_village ⇄ ancient_library ⇄ desert_marketplace ⇄ farmland ⇄ bedouin_camp ⇄ mountain_village ⇄ coastal_port ⇄ royal_palace`

## 1. Per-zone preserved contract

### oasis_village — Oasis Village (واحَة الحُروف)
- dims: 40x30 tiles | theme: desert | spawnPoint: (14,20) | weather: clear | battleBg: bg-oasis
- unlock: null | vocabCategories: greetings, trade
- entries (targetEntry keys other zones jump to — MUST keep keys): from_library→(20,3)
- NPCs (4):
  - `guide-amira` "Guide Amira" spriteKey=npc-guide-amira @(14,18)
  - `scholar-yusuf` "Scholar Yusuf" spriteKey=npc-scholar-yusuf @(9,6)
  - `merchant-fatima` "Merchant Fatima" spriteKey=npc-merchant-fatima @(12,18)
  - `student-khalid` "Student Khalid" spriteKey=npc-student-khalid @(33,25)
- Exits (1):
  - `oasis-to-library`: edge=north tileRange=[17,23] → ancient_library/from_oasis
- Interactables (25):
  - sign: `sign-oasis`@(19,5), `sign-market`@(9,13), `sign-study`@(7,4)
  - bookshelf: `bookshelf-scholar`@(10,4), `bookshelf-student`@(31,23)
  - chest: `chest-ruins`@(21,3), `chest-hidden`@(2,26)
  - door: `door-scholar-house`@(8,5)→scholar_house_interior [locked:met_scholar_yusuf], `door-merchant-house`@(10,16)→merchant_house_interior, `door-oasis-guild`@(34,24)→oasis_guild_interior
  - fountain: `fountain-oasis-1`@(20,9)
  - lantern: `lantern-oasis-1`@(6,10), `lantern-oasis-2`@(34,13), `lantern-oasis-3`@(16,24)
  - statue: `statue-oasis-1`@(22,5)
  - stall: `stall-oasis-1`@(11,12)
  - barrel: `barrel-oasis-1`@(14,15), `barrel-oasis-2`@(26,12)
  - pot: `pot-oasis-1`@(31,25), `pot-oasis-2`@(9,9)
  - crate: `crate-oasis-1`@(37,22)
  - painting: `painting-oasis-1`@(4,6)
  - inscription: `inscription-oasis-1`@(2,27), `inscription-oasis-2`@(28,15), `inscription-oasis-3`@(36,5)
- Gathering spots (8, flag=true): `spot_oasis_herbs_01`@(15,14) chamomile/herb_patch, `spot_oasis_herbs_02`@(25,16) mint/herb_patch, `spot_oasis_water_01`@(19,12) rosewater/water_source, `spot_oasis_papyrus_01`@(21,18) papyrus/papyrus_stand, `spot_oasis_animal_01`@(8,23) wool/animal_trace, `spot_oasis_ore_01`@(36,14) copper_ore/ore_vein, `spot_oasis_herbs_03`@(6,6) saffron/herb_patch, `spot_oasis_ore_02`@(2,13) iron_ore/ore_vein
- Step triggers: `oasis-welcome`@(14,19) 2x1, `marketplace-hint`@(13,8) 3x1, `ruins-echo`@(20,3) 2x1
- Sub-areas: `market-square`@(12,6) 6x4, `oasis-shore`@(18,12) 5x4, `residential`@(6,18) 8x6, `ruins`@(18,2) 6x5
- Decorative objects: 68 placements (no IDs — fully replaceable), unique keys: 29

### ancient_library — Ancient Library (المَكتَبَة القَديمَة)
- dims: 35x30 tiles | theme: desert | spawnPoint: (17,27) | weather: mist | battleBg: bg-library
- unlock: {"quest":"words_of_oasis"} | vocabCategories: numbers, colors, phrases
- entries (targetEntry keys other zones jump to — MUST keep keys): from_oasis→(17,27), from_marketplace→(33,15)
- NPCs (2):
  - `librarian-ibrahim` "Librarian Ibrahim" spriteKey=npc-librarian-ibrahim @(17,11)
  - `scribe-amina` "Scribe Amina" spriteKey=npc-scribe-amina @(12,16)
- Exits (2):
  - `library-to-oasis`: edge=south tileRange=[15,19] → oasis_village/from_library
  - `library-to-marketplace`: edge=east tileRange=[12,18] → desert_marketplace/from_library
- Interactables (24):
  - sign: `sign-library-gate`@(17,23), `sign-reading-room`@(14,11)
  - bookshelf: `bookshelf-numbers`@(11,11), `bookshelf-colors`@(23,11), `bookshelf-phrases`@(17,8)
  - chest: `chest-library`@(7,6), `chest-library-hidden`@(30,25)
  - door: `door-archive`@(20,8)→library_archive_interior [locked:library_access_granted], `door-library-study`@(8,12)→library_study_interior
  - fountain: `fountain-library-1`@(17,13)
  - statue: `statue-library-1`@(15,15), `statue-library-2`@(19,15)
  - painting: `painting-library-1`@(12,9), `painting-library-2`@(22,9)
  - lantern: `lantern-library-1`@(11,17), `lantern-library-2`@(23,17), `lantern-library-3`@(17,26)
  - crate: `crate-library-1`@(9,10)
  - barrel: `barrel-library-1`@(25,10)
  - pot: `pot-library-1`@(14,19), `pot-library-2`@(20,19)
  - inscription: `inscription-library-1`@(33,2), `inscription-library-2`@(5,14), `inscription-library-3`@(2,5)
- Gathering spots (7, flag=true): `spot_library_papyrus_01`@(12,8) papyrus/papyrus_stand, `spot_library_papyrus_02`@(28,10) vellum/papyrus_stand, `spot_library_herbs_01`@(5,18) lavender/herb_patch, `spot_library_ore_01`@(35,22) lapis_lazuli/ore_vein, `spot_library_water_01`@(20,25) rosewater/water_source, `spot_library_animal_01`@(8,12) wool/animal_trace, `spot_library_papyrus_03`@(15,6) paper/papyrus_stand
- Decorative objects: 59 placements (no IDs — fully replaceable), unique keys: 24

### desert_marketplace — Desert Marketplace (سوق الصَّحراء)
- dims: 45x35 tiles | theme: desert | spawnPoint: (5,17) | weather: dust | battleBg: bg-desert
- unlock: {"quest":"master_of_letters","minLevel":5} | vocabCategories: trade, food, numbers
- entries (targetEntry keys other zones jump to — MUST keep keys): from_library→(3,17), from_farmland→(22,3)
- NPCs (3):
  - `spice-seller-layla` "Spice Seller Layla" spriteKey=npc-spice-seller-layla @(15,17)
  - `trader-hassan` "Trader Hassan" spriteKey=npc-trader-hassan @(29,17)
  - `guard-hamza` "Guard Hamza" spriteKey=npc-guard-hamza @(22,8)
- Exits (2):
  - `market-to-library`: edge=west tileRange=[15,19] → ancient_library/from_marketplace
  - `market-to-farmland`: edge=north tileRange=[19,25] → farmland/from_marketplace
- Interactables (28):
  - sign: `sign-market-main`@(22,3), `sign-spice-stall`@(12,17), `sign-trade-stall`@(32,17)
  - bookshelf: `bookshelf-market-food`@(11,13), `bookshelf-market-trade`@(31,13), `bookshelf-market-numbers`@(22,6)
  - chest: `chest-market-hidden`@(40,3), `chest-market-corner`@(3,32)
  - door: `door-warehouse`@(35,12)→market_warehouse_interior [locked:warehouse_key_obtained], `door-spice-shop`@(10,14)→spice_shop_interior, `door-textile-shop`@(30,14)→textile_shop_interior
  - fountain: `fountain-market-1`@(22,14)
  - stall: `stall-market-1`@(18,16), `stall-market-2`@(26,16), `stall-market-3`@(18,20), `stall-market-4`@(26,20)
  - barrel: `barrel-market-1`@(13,15), `barrel-market-2`@(33,15), `barrel-market-3`@(20,10)
  - pot: `pot-market-1`@(9,18), `pot-market-2`@(35,18)
  - crate: `crate-market-1`@(38,11), `crate-market-2`@(6,23)
  - lantern: `lantern-market-1`@(20,15), `lantern-market-2`@(24,19)
  - inscription: `inscription-marketplace-1`@(42,3), `inscription-marketplace-2`@(6,6), `inscription-marketplace-3`@(42,30)
- Gathering spots (9, flag=true): `spot_market_animal_01`@(8,12) silk/animal_trace, `spot_market_animal_02`@(32,15) wool/animal_trace, `spot_market_ore_01`@(18,8) gold_ore/ore_vein, `spot_market_ore_02`@(25,20) copper_ore/ore_vein, `spot_market_herbs_01`@(12,18) cumin/herb_patch, `spot_market_herbs_02`@(35,22) cardamom/herb_patch, `spot_market_water_01`@(20,12) olive_oil/water_source, `spot_market_papyrus_01`@(6,6) papyrus/papyrus_stand, `spot_market_animal_03`@(28,25) cotton/animal_trace
- Decorative objects: 90 placements (no IDs — fully replaceable), unique keys: 24

### farmland — Farmland (الأَرض الزِّراعِيَّة)
- dims: 45x35 tiles | theme: grass | spawnPoint: (22,33) | weather: clear | battleBg: bg-farmland
- unlock: {"quest":"merchant_master","minLevel":8,"minWords":400} | vocabCategories: nature, animals, body, verbs_basic
- entries (targetEntry keys other zones jump to — MUST keep keys): from_marketplace→(22,33), from_bedouin→(43,17)
- NPCs (2):
  - `farmer-omar` "Farmer Omar" spriteKey=npc-farmer-omar @(12,10)
  - `herbalist-maryam` "Herbalist Maryam" spriteKey=npc-herbalist-maryam @(33,25)
- Exits (2):
  - `farm-to-marketplace`: edge=south tileRange=[19,25] → desert_marketplace/from_farmland
  - `farm-to-bedouin`: edge=east tileRange=[15,19] → bedouin_camp/from_farmland
- Interactables (24):
  - sign: `sign-farm-entrance`@(22,32), `sign-farm-barn`@(10,4)
  - bookshelf: `bookshelf-nature`@(7,8), `bookshelf-animals`@(37,8), `bookshelf-body`@(20,25)
  - chest: `chest-farm-hidden`@(42,3), `chest-farm-pond`@(36,30)
  - door: `door-barn`@(15,8)→farmhouse_interior
  - pot: `pot-farm-1`@(8,10), `pot-farm-2`@(16,12), `pot-farm-3`@(30,23)
  - barrel: `barrel-farm-1`@(14,7), `barrel-farm-2`@(28,8), `barrel-farm-3`@(18,28)
  - statue: `statue-farm-1`@(12,22)
  - fountain: `fountain-farm-1`@(38,26)
  - lantern: `lantern-farm-1`@(8,17), `lantern-farm-2`@(38,17)
  - crate: `crate-farm-1`@(34,6)
  - painting: `painting-farm-1`@(9,24)
  - stall: `stall-farm-1`@(25,22)
  - inscription: `inscription-farmland-1`@(2,32), `inscription-farmland-2`@(42,32), `inscription-farmland-3`@(22,5)
- Gathering spots (10, flag=true): `spot_farm_herbs_01`@(10,8) wheat/herb_patch, `spot_farm_herbs_02`@(18,12) barley/herb_patch, `spot_farm_herbs_03`@(25,15) dates/herb_patch, `spot_farm_animal_01`@(6,18) wool/animal_trace, `spot_farm_animal_02`@(32,20) linen/animal_trace, `spot_farm_water_01`@(15,6) olive_oil/water_source, `spot_farm_herbs_04`@(28,8) honey/herb_patch, `spot_farm_ore_01`@(35,25) iron_ore/ore_vein, `spot_farm_animal_03`@(12,22) cotton/animal_trace, `spot_farm_papyrus_01`@(22,18) papyrus/papyrus_stand
- Decorative objects: 187 placements (no IDs — fully replaceable), unique keys: 22

### bedouin_camp — Bedouin Camp (مُخَيَّم البَدو)
- dims: 35x25 tiles | theme: desert | spawnPoint: (3,13) | weather: sandstorm | battleBg: bg-camp
- unlock: {"quest":"natures_scholar","minLevel":11,"minWords":600} | vocabCategories: time, phrases, adjectives
- entries (targetEntry keys other zones jump to — MUST keep keys): from_farmland→(3,13), from_mountain→(17,3)
- NPCs (3):
  - `elder-tariq` "Elder Tariq" spriteKey=npc-elder-tariq @(17,13)
  - `storyteller-noor` "Storyteller Noor" spriteKey=npc-storyteller-noor @(8,8)
  - `wanderer-ali` "Wanderer Ali" spriteKey=npc-wanderer-ali @(27,8)
- Exits (2):
  - `bedouin-to-farmland`: edge=west tileRange=[11,15] → farmland/from_bedouin
  - `bedouin-to-mountain`: edge=north tileRange=[15,19] → mountain_village/from_bedouin
- Interactables (20):
  - sign: `sign-camp`@(3,12), `sign-elder-tent`@(14,10)
  - bookshelf: `bookshelf-time`@(9,18), `bookshelf-adjectives`@(29,8)
  - chest: `chest-camp-hidden`@(31,22), `chest-camp-tent`@(5,7)
  - door: `door-bedouin-tent`@(7,8)→bedouin_tent_interior
  - lantern: `lantern-camp-1`@(15,11), `lantern-camp-2`@(19,11), `lantern-camp-3`@(6,17)
  - painting: `painting-camp-1`@(9,7), `painting-camp-2`@(26,7)
  - crate: `crate-camp-1`@(22,9), `crate-camp-2`@(10,19)
  - pot: `pot-camp-1`@(17,15)
  - barrel: `barrel-camp-1`@(28,9)
  - statue: `statue-camp-1`@(20,4)
  - inscription: `inscription-bedouin-1`@(32,22), `inscription-camp-2`@(3,3), `inscription-camp-3`@(14,22)
- Gathering spots (8, flag=true): `spot_bedouin_animal_01`@(8,10) hemp/animal_trace, `spot_bedouin_animal_02`@(18,14) linen/animal_trace, `spot_bedouin_herbs_01`@(12,6) aloe_vera/herb_patch, `spot_bedouin_water_01`@(25,18) olive_oil/water_source, `spot_bedouin_ore_01`@(6,20) copper_ore/ore_vein, `spot_bedouin_herbs_02`@(30,12) sage/herb_patch, `spot_bedouin_animal_03`@(15,22) wool/animal_trace, `spot_bedouin_papyrus_01`@(22,8) papyrus/papyrus_stand
- Decorative objects: 60 placements (no IDs — fully replaceable), unique keys: 21

### mountain_village — Mountain Village (قَرية الجَبَل)
- dims: 40x30 tiles | theme: snow | spawnPoint: (20,27) | weather: snow | battleBg: bg-mountain
- unlock: {"quest":"tales_of_desert","minLevel":14,"minWords":800} | vocabCategories: clothing, animals, adjectives
- entries (targetEntry keys other zones jump to — MUST keep keys): from_bedouin→(20,27), from_port→(38,15)
- NPCs (3):
  - `guide-salim` "Guide Salim" spriteKey=npc-guide-salim @(20,13)
  - `weaver-zahra` "Weaver Zahra" spriteKey=npc-weaver-zahra @(15,20)
  - `healer-khadija` "Healer Khadija" spriteKey=npc-healer-khadija @(27,20)
- Exits (2):
  - `mountain-to-bedouin`: edge=south tileRange=[17,23] → bedouin_camp/from_mountain
  - `mountain-to-port`: edge=east tileRange=[12,18] → coastal_port/from_mountain
- Interactables (23):
  - sign: `sign-mountain`@(20,26), `sign-weaver`@(13,18)
  - bookshelf: `bookshelf-clothing`@(16,10), `bookshelf-animals-mt`@(24,10), `bookshelf-adj-mt`@(20,16)
  - chest: `chest-mountain-stream`@(32,15), `chest-mountain-peak`@(5,3)
  - door: `door-mountain-home`@(15,20)→mountain_home_interior, `door-mountain-mosque`@(25,20)→mountain_mosque_interior
  - statue: `statue-mountain-1`@(20,10), `statue-mountain-2`@(16,14)
  - painting: `painting-mountain-1`@(17,19), `painting-mountain-2`@(24,19)
  - pot: `pot-mountain-1`@(14,12), `pot-mountain-2`@(26,12)
  - lantern: `lantern-mountain-1`@(19,22), `lantern-mountain-2`@(21,22)
  - fountain: `fountain-mountain-1`@(29,10)
  - barrel: `barrel-mountain-1`@(13,21)
  - crate: `crate-mountain-1`@(27,21)
  - inscription: `inscription-mountain-1`@(2,3), `inscription-mountain-2`@(37,27), `inscription-mountain-3`@(6,27)
- Gathering spots (8, flag=true): `spot_mountain_ore_01`@(10,8) iron_ore/ore_vein, `spot_mountain_ore_02`@(25,12) silver_ore/ore_vein, `spot_mountain_ore_03`@(18,18) silver_ore/ore_vein, `spot_mountain_herbs_01`@(6,15) thyme/herb_patch, `spot_mountain_water_01`@(30,20) olive_oil/water_source, `spot_mountain_animal_01`@(12,22) wool/animal_trace, `spot_mountain_herbs_02`@(28,6) fenugreek/herb_patch, `spot_mountain_papyrus_01`@(35,15) vellum/papyrus_stand
- Decorative objects: 74 placements (no IDs — fully replaceable), unique keys: 17

### coastal_port — Coastal Port (المِيناء)
- dims: 45x35 tiles | theme: grass | spawnPoint: (3,17) | weather: rain | battleBg: bg-port
- unlock: {"quest":"mountain_wisdom","minLevel":17,"minWords":1200} | vocabCategories: directions, trade, food
- entries (targetEntry keys other zones jump to — MUST keep keys): from_mountain→(3,17), from_palace→(22,3)
- NPCs (3):
  - `captain-rashid` "Captain Rashid" spriteKey=npc-captain-rashid @(33,17)
  - `fishmonger-hana` "Fishmonger Hana" spriteKey=npc-fishmonger-hana @(18,17)
  - `blacksmith-daud` "Blacksmith Daud" spriteKey=npc-blacksmith-daud @(12,24)
- Exits (2):
  - `port-to-mountain`: edge=west tileRange=[15,19] → mountain_village/from_port
  - `port-to-palace`: edge=north tileRange=[19,25] → royal_palace/from_port
- Interactables (26):
  - sign: `sign-port`@(5,17), `sign-dock`@(32,6), `sign-smithy`@(11,23)
  - bookshelf: `bookshelf-directions`@(16,11), `bookshelf-port-trade`@(23,11), `bookshelf-port-food`@(18,23)
  - chest: `chest-port-dock`@(34,28), `chest-port-alley`@(8,8)
  - door: `door-port-tavern`@(15,22)→port_tavern_interior, `door-port-warehouse`@(22,22)→port_warehouse_interior
  - lantern: `lantern-port-1`@(33,10), `lantern-port-2`@(33,22), `lantern-port-3`@(15,16)
  - crate: `crate-port-1`@(33,12), `crate-port-2`@(33,18), `crate-port-3`@(20,12)
  - barrel: `barrel-port-1`@(33,24), `barrel-port-2`@(12,17), `barrel-port-3`@(27,17)
  - painting: `painting-port-1`@(16,21), `painting-port-2`@(23,21)
  - fountain: `fountain-port-1`@(18,14)
  - statue: `statue-port-1`@(22,14)
  - inscription: `inscription-port-1`@(42,3), `inscription-port-2`@(7,3), `inscription-port-3`@(42,30)
- Gathering spots (9, flag=true): `spot_port_water_01`@(8,10) blessed_water/water_source, `spot_port_animal_01`@(15,14) silk/animal_trace, `spot_port_herbs_01`@(22,8) cinnamon/herb_patch, `spot_port_animal_02`@(30,18) silk/animal_trace, `spot_port_ore_01`@(12,22) copper_ore/ore_vein, `spot_port_papyrus_01`@(6,6) papyrus/papyrus_stand, `spot_port_herbs_02`@(28,12) ginger_root/herb_patch, `spot_port_water_02`@(35,24) olive_oil/water_source, `spot_port_ore_02`@(18,20) tin_ore/ore_vein
- Decorative objects: 106 placements (no IDs — fully replaceable), unique keys: 41

### royal_palace — Royal Palace (القَصر المَلَكي)
- dims: 50x40 tiles | theme: desert | spawnPoint: (25,37) | weather: clear | battleBg: bg-palace
- unlock: {"quest":"port_of_knowledge","minLevel":20,"minWords":1600} | vocabCategories: adjectives, colors, phrases
- entries (targetEntry keys other zones jump to — MUST keep keys): from_port→(25,37)
- NPCs (4):
  - `vizier-abbas` "Vizier Abbas" spriteKey=npc-vizier-abbas @(25,13)
  - `princess-aisha` "Princess Aisha" spriteKey=npc-princess-aisha @(20,20)
  - `poet-rumi` "Poet Rumi" spriteKey=npc-poet-rumi @(30,20)
  - `imam-muhammad` "Imam Muhammad" spriteKey=npc-imam-muhammad @(8,20)
- Exits (1):
  - `palace-to-port`: edge=south tileRange=[22,28] → coastal_port/from_palace
- Interactables (27):
  - sign: `sign-palace`@(25,36), `sign-throne`@(25,11), `sign-garden`@(20,16)
  - bookshelf: `bookshelf-palace-adj`@(17,10), `bookshelf-palace-colors`@(33,10), `bookshelf-palace-phrases`@(25,17)
  - chest: `chest-palace-throne`@(25,9), `chest-palace-garden`@(43,20)
  - door: `door-palace-throne`@(25,12)→palace_throne_interior [locked:palace_audience_granted]
  - fountain: `fountain-palace-1`@(24,23), `fountain-palace-2`@(8,18)
  - painting: `painting-palace-1`@(18,11), `painting-palace-2`@(32,11), `painting-palace-3`@(25,23), `painting-palace-4`@(40,18)
  - lantern: `lantern-palace-1`@(16,28), `lantern-palace-2`@(34,28), `lantern-palace-3`@(25,33)
  - statue: `statue-palace-1`@(20,28), `statue-palace-2`@(30,28)
  - crate: `crate-palace-1`@(6,15), `crate-palace-2`@(44,15)
  - pot: `pot-palace-1`@(21,17), `pot-palace-2`@(29,17)
  - inscription: `inscription-palace-1`@(2,37), `inscription-palace-2`@(47,20), `inscription-palace-3`@(47,38)
- Gathering spots (0, flag=true): NONE DEFINED
- Decorative objects: 124 placements (no IDs — fully replaceable), unique keys: 32

### Contract anomalies found (pre-existing, decide before building)
- `royal_palace` has `gatheringSpots: true` but ZERO spots in `GATHERING_SPOTS` (`src/data/gatheringSpots.js`). `GatheringSpotManager.create('royal_palace')` silently creates nothing. Either add palace spots or accept as-is.
- `GATHERING_SPOTS` contains 6 spots with `zoneId: 'baghdad_marketplace'` — no such zone exists (the real-world zone id is `baghdad`). Orphaned data; ignore for the core-8 rebuild.
- `zones.js` line 387 (ancient_library objects): duplicate `fire-pit` placement at (15,7) — harmless dup, disappears with the rebuild anyway.
- Interactable coordinates and their zone's decorative objects are NOT linked in code: e.g. `door-scholar-house`@(8,5) merely sits near the house sprite at (8,3). When you move a house, move its door/sign/bookshelf interactables as a set.

## 2. Tiled JSON template — `public/assets/maps/oasis-village.json`

This is the ONE proven authored map (VISUAL-CLOSEOUT E1/E2 verified). New zone maps must copy its structure exactly.

**Map-level:** `orientation: "orthogonal"`, `renderorder: "right-down"`, `infinite: false`, `tilewidth/tileheight: 16` (16px source tiles, scaled 4x at runtime to the 64px game grid), `width/height` = zone dims in tiles (40x30, matching `zones.js` `mapWidth/mapHeight` — MUST match, WorldScene derives `currentMapW/H` from the Tiled map when present), `version: "1.10"`, `tiledversion: "1.11.0"`, `type: "map"`.

**Layers (by exact name — TiledMapLoader looks them up by name):**
1. `Ground` — tilelayer, visible, `data` = flat array of `width*height` GIDs (plain JSON array, no compression — Phaser needs CSV/uncompressed encoding).
2. `Collision` — tilelayer, `visible: false`. Collision encoding: ANY non-zero GID = impassable (`setCollisionByExclusion([-1, 0])`). Current map uses GID 7 (a sand tile) as the marker; the layer is hidden at runtime, so any GID works. Accepted layer names: `Collision`, `collision`, `Walls`, `walls`.
3. `Exits` — objectgroup. Rectangle objects, `type: "exit"`, `name` = exit id, x/y/width/height in 16px map-pixel space (e.g. tile 17 → x=272). Custom properties (array of `{name, type, value}`): `targetZone` (string), `targetEntry` (string), `edge` (north|south|east|west). TiledMapLoader converts the rect to `tileRange` along the edge axis: north/south → x-range, east/west → y-range.

**Tilesets:** embedded (not external .tsx), `firstgid` ascending. CRITICAL: the tileset `name` must EXACTLY equal the Phaser texture key from `src/data/kenmiCatalog.js` (`map.addTilesetImage(name, name)` — same string for both). Current three:
- `kenmi-desert-tiles-desert-beach-tiles-1` (firstgid 1, 15 tiles, 5 cols) — sand + sand/water autotile
- `kenmi-base-tiles-grass-grass-tiles-3` (firstgid 16, 160 tiles, 16 cols) — grass autotile
- `kenmi-base-tiles-water-water-tile-3` (firstgid 176, 15 tiles, 3 cols) — static water (key verified present in kenmiCatalog.js:693; the animated variant `-anim` is a separate key used only by the procedural MapLoader)
`image` paths are relative (`../kenmi/desert/tiles/...`) — only used by the Tiled editor; Phaser uses the preloaded texture by name. Any Kenmi tileset can be added the same way as long as its catalog key is used as the tileset name (all catalog entries are preloaded in BootScene).

**Registration:** each new map needs one line in `src/game/scenes/BootScene.js` (~line 102): `this.load.tilemapTiledJSON('map-<zone-id-with-hyphens>', '/assets/maps/<zone>.json');`. Key convention is load-bearing: `TiledMapLoader.zoneIdToMapKey()` maps `oasis_village` → `map-oasis-village`, and `hasMap(zoneId)` checks the tilemap cache for that key. Drop-in detection: if the key exists in cache, the zone uses the Tiled path; otherwise the procedural `buildMap()` path. **This is the entire switch** — no per-zone flag anywhere else.

## 3. Runtime pipeline — WorldScene / TiledMapLoader / MapLoader

`WorldScene.buildZone(zoneName)` (src/game/scenes/WorldScene.js:314):
1. `stepTriggerSystem.load(zone)` — from zones.js data.
2. If `tiledMapLoader.hasMap(zoneName)`: `TiledMapLoader.load(mapKey)` creates all tile layers at `scale = TILE/tileWidth = 4`, hides the Collision layer, parses `Exits` objectgroup → `exitTriggers`; `currentMapW/H` come from the Tiled map size, overriding zones.js. Then `mapLoader.placeObjectsOnly(zone)` still renders every `zone.objects[]` prop/building sprite ON TOP of the authored ground at their zones.js coordinates (Tiled owns ground+collision+exits ONLY; buildings/props/NPCs/interactables stay data-driven from zones.js).
3. Else (procedural path): `mapLoader.create(zone, w, h)` builds ground from `zone.buildMap()` (tile codes SAND=0/GRASS=1/WATER=2/ICE_GRASS=3/STONE=4/WOOD=5, autotiled via the BEACH/GRASS_F/WATER_F frame tables) and places objects.
4. Player + NPCs collide with the hidden Collision layer (Tiled path) AND with `mapLoader.wallGroup` (prop colliders from `collide: true` objects — body size `collideW x collideH`, offset +20px below sprite centre).
5. `interactableManager.create(zone.interactables)`, floating Arabic labels, `GatheringSpotManager.create(zoneName)` if `zone.gatheringSpots`.
6. Exits: `ExitTriggerChecker.check()` uses `tiledExitTriggers` when `usingTiledMap`, else `mapLoader.getExitTriggers()` (from `zone.exits`). Trigger = player tile reaches the map edge row/col within `tileRange`. Target position = `ZONES[targetZone].entries[targetEntry]` (fallback: spawnPoint). So **every `targetEntry` named by any exit must remain a key in the destination zone's `entries` map** — its x,y can move.

**MUST NOT TOUCH (per docs/VISUAL-CLOSEOUT.md — visual layer CLOSED 2026-07-02, 5793 tests green):**
- `MapLoader.js` scale/crop machinery: `KENMI_SCALE = 4`, `croppedPropScale()` (1-tile normalization for cropped props, opt-out via `tiles` field), `nativeObjectScale()` (`NATIVE_OBJECT_SCALE = 2`, `MAX_OBJECT_FOOTPRINT_TILES = 4` cap), `PROP_CROP_REGIONS` (multi-item sheet crops), `FLAT_GROUND_PROPS` (rug depth), NPC/player 64px normalization. These fixed close-out items B1/B3/B6.
- Frame-table drift guards: `_assertFrameTableMatch()` at MapLoader module load throws if `KENMI_FRAME_TABLES` disagrees with BEACH (5x3), GRASS (16x10), WATER-anim (24x5) constants. Regenerate via `npm run generate:kenmi-frame-tables` only if PNGs change.
- Arabic text rendering (D3: no manual RTL reversal), label proximity-reveal (D1/D2).
- Files never to stage (H1): `package.json`, `public/sw.js`, `src/routes.jsx`, `src/services/swRegistration.js`, `vite.config.js`, `test-results/`.

## 4. Interiors — InteriorScene + data registry

- Interiors are **code-built, NOT Tiled**. `INTERIORS` registry: `src/data/interiors.js` → `src/data/interiors/registry.js`, which merges (a) hand-crafted interiors from `src/data/interiors/zones/{zone}.js` (one file per core zone; shapes built by `buildSmallHouse()/buildLargeHouse()` in `src/data/interiors/templates/common.js`) and (b) procedural filler interiors (`house_<zone>_<n>`) from `InteriorGenerator` per `ZONE_CONFIGS`.
- An interior definition = `{ id, name, nameArabic, zone, mapWidth, mapHeight, buildMap, spawnPoint, objects[], npcs[], interactables[] }` — same shape as a zone, rendered by the same `MapLoader.create()` procedural path inside `InteriorScene`.
- Entry flow: world interactable `{ type: 'door', interiorId, locked?, unlockFlag?, lockMessage? }` → interact → `InteractableManager` emits `DOOR_OPENED {interiorId, entryPosition}` → `WorldScene.handleDoorOpened()` → `sceneStackManager.pushScene('InteriorScene', {interiorId, entryPosition})`. Locked doors check `narrative.storyFlags[unlockFlag]`.
- Exit flow: the interior's interactables must include a door with `isExit: true` (e.g. `{ id: 'exit-door', type: 'door', x, y, isExit: true }`); SPACE within 2 tiles pops the scene and restores the player at `entryPosition` (the world-pixel position where they entered).
- **To make a NEW house enterable:** (1) add a `door` interactable with a fresh `interiorId` to the zone in zones.js; (2) add an interior with that id to the zone's file in `src/data/interiors/zones/` (or reuse a procedural `house_<zone>_<n>` id — those already exist); (3) include an `isExit: true` door interactable inside. No scene/loader changes needed. Optional BGM: `INTERIOR_BGM[interiorId]` in `src/data/audioConfig.js`.
- Legacy `.tmx` files in `public/assets/maps/` (`house.tmx`, `world.tmx`, `arena.tmx`, `fire.tmx`, `water.tmx`, `plant.tmx`, `ice-hospital.tmx`, `spawn-hospital.tmx` + `tilesets/*.tsx`) are **UNUSED** — zero references anywhere in `src/` or `scripts/`; they are 64px-tile leftovers from a template referencing `world.tsx/objects.tsx/indoor.tsx`. Do not model anything on them; safe to ignore (they ARE valid Tiled-structure study material at most).

## 5. Tiled MCP server — `.mcp/tiled-mcp-server`

Local TypeScript MCP server ("tiled-mcp-server" v0.1.0, bin `dist/index.js`, stdio JSON-RPC). NOT currently registered in this repo (no `.mcp.json`; nothing in `.claude/settings.local.json`), and no `dist/` build exists — build first (`npm install && npm run build` in `.mcp/tiled-mcp-server`) or run via `npx tsx src/index.ts`. Register with: `claude mcp add tiled -- node /Users/theshumba/Documents/GitHub/gogo-arabic/.mcp/tiled-mcp-server/dist/index.js --project-root /Users/theshumba/Documents/GitHub/gogo-arabic/public/assets` (project root = sandbox boundary for all file ops; must cover `maps/` and `kenmi/`).

43 tools: maps (`read_map`, `create_map`, `edit_map`, `set_map_properties`, `resize_map`, `get_map_info`); layers (`add_layer`, `remove_layer`, `edit_layer`, `set_tiles`, `get_tiles`, `fill_region`, `clear_layer`, `copy_region`, `replace_tiles`, `get_layer_stats`, `reorder_layer`); tilesets (`read_tileset`, `list_map_tilesets`, `add_tileset_to_map`, `remove_tileset_from_map`, `get_tile_info`, `search_tiles`, `calculate_gid`, `decode_gid`); objects (`add_object`, `remove_object`, `edit_object`, `list_objects`, `find_object`); **AutoMapping** (`read_rules_txt`, `edit_rules_txt`, `read_rule_map`, `create_rule_map`, `validate_rules`, `apply_rules` — dryRun=true by default, `debug_rule`, `create_terrain_rule_map` — 4way/4way-corners/8way terrain transitions, `create_wall_rule_map`); project (`list_maps`, `list_tilesets_in_dir`, `convert_format` TMX⇄TMJ); preview (`preview_map` — ASCII render). Plus 12 MCP resources (`tiled://docs/automapping`, `tiled://docs/gid`, quickstart etc.) and 7 guided prompts (`create_map_from_description`, `generate_terrain_rules`, ...).

Rebuild-relevant workflow: author each zone's Ground layer with coarse terrain codes, then `create_terrain_rule_map` + `apply_rules` to stamp the beach/grass/water autotile transitions programmatically instead of hand-picking the 15/160-frame GIDs; `preview_map` + `get_layer_stats` for cheap sanity checks; `convert_format` to emit the final `.json` (TMJ) Phaser loads. Caveat: writes uncompressed/CSV tile data — matches what Phaser needs.

## 6. Hardcoded tile coordinates in game logic (update when oasis_village layout changes)

The codebase is almost fully data-driven (NPC/interactable/gathering/trigger positions all come from data files). The ONLY logic hardcodes are the cinematic intro, all tied to the CURRENT oasis layout (spawn 14,20 / Amira 14,18 / pool north of spawn):

| File:line | Value | Meaning |
|---|---|---|
| `src/game/systems/CinematicIntroSequencer.js:20-21` | `WORD_SPAWN_X/Y = 14*64, 17*64` | floating-word object spawns near the oasis pool, 3 tiles north of player spawn |
| `src/game/systems/CinematicIntroSequencer.js:325-326` | `spawnX/Y = 14*64, 20*64` | Beat-2 camera pan target — must equal the zone's new `spawnPoint` |
| `src/game/systems/CinematicIntroSequencer.js:446-447` | `amiraWorldX/Y = 14*64, 18*64` | Beat-5 camera pan to Guide Amira — must equal `guide-amira`'s new position |
| `src/game/scenes/WorldScene.js:127` | boots into `'oasis_village'` at `zone.spawnPoint` | data-driven; no change needed, listed for awareness |

Everything else found by the sweep (`GatheringSpotManager.js:57`, `InteractableManager.js:70`, `NPCManager.js:58`, `useZoneEvents.js:184`, `questSlice.js:388`, `ExitTriggerChecker.js:57`) multiplies DATA coordinates by 64 — they follow the data automatically. Data that must stay internally consistent when relaying oasis_village: stepTrigger `oasis-welcome` sits 1 tile north of spawnPoint (comment at zones.js:238); `ruins-echo` sits on the `from_library` entry tile; `subAreas` rectangles should be redrawn to match the new districts.

Also note: `src/data/sideQuestChains.js:16` and `src/data/loreEntriesBatch2.js` use zone string `'oasis-village'` (hyphens, not the `oasis_village` id) — pre-existing inconsistency, unaffected by layout changes.

## 7. Verification harness — screenshots + world-snapshot fixtures

**Real screenshots** — `npm run capture:world-screenshots` (`scripts/capture-world-screenshots.mjs`): boots the real game in headless Chromium (Playwright) against `http://localhost:3000` (override `GOGO_BASE_URL`; needs `npm run dev` running). Seeds `localStorage['persist:gogo-arabic']` with a player snapshot (all 8 zones unlocked, onboarding done) so it lands straight in WorldScene, then for each core zone: `scene.loadZone(zoneId)` with `_suppressZoneToast = true`, waits render frames, `stopFollow()` + `centerOn(mapCentre)`, and snapshots **Phaser's own framebuffer** (`renderer.snapshot()` — pure game pixels, no React HUD contamination). Output: `docs/world-shots/{zoneId}.png` + `_index.html` contact sheet; logs per-zone console errors. This is THE acceptance loop for the rebuild — run after every zone.

**Structural snapshot regression** — `src/game/systems/__tests__/WorldSnapshot.test.js`: for each core zone, runs `MapLoader.create()` against a mock scene (frame counts seeded from `KENMI_FRAME_TABLES`), captures `{version, zoneId, biome, mapW, mapH, tiles[], objects[], decoCount, animalCount}` via `src/game/systems/world/WorldSnapshot.js`, and `expect(snapshot).toEqual(fixture)` against `src/test/fixtures/world-snapshots/{zoneId}.json`. NOTE: this exercises the PROCEDURAL path only (`zone.buildMap()` + objects) — it does not read Tiled JSON, so authored-map ground changes don't touch it, but any `zones.js` objects/buildMap change breaks it.
- `src/test/fixtures/__tests__/snapshotsExist.test.js` asserts all 8 fixtures exist with `version: 1`.
- **Regeneration** (this is exactly what commit `a0c2c45` did after the sand-key collapse): `CAPTURE_WORLD_SNAPSHOTS=1 npx vitest run src/test/fixtures/captureViaVitest.test.js` — the skip-gated generator in `src/test/fixtures/captureViaVitest.test.js` rebuilds each zone with the SAME mock and overwrites the fixtures. After the rebuild changes `zones.js` layouts, regenerate all 8 fixtures this way, then review the diff (a0c2c45's message models the expected discipline: state what changed and why the diff is exclusively that).
- `scripts/capture-world-snapshots.js` (`npm run capture:world-snapshots`) is the older headless-mock reporter; the vitest generator above is the canonical fixture writer.

Other checks that will fire on layout changes: `oasisVillageMap.validity` test (referenced in VISUAL-CLOSEOUT H2) and `TiledMapLoader.collision` tests under `src/game/systems/__tests__/`; full suite = `npm run test:run` (5793 tests green at close-out).

## 8. Per-interior preserved contract (15 hand-crafted interiors)

Extracted 2026-07-03 from `src/data/interiors/zones/*.js` (aggregated by `src/data/interiors/registry.js`), closing Phase-0 critique GAP 1. Same contract rule as §1: every ID below MUST exist in the rebuilt interiors; coordinates, room dimensions, `buildMap` template choice, and decorative `objects[]` (no IDs) are all free to change. Interiors ARE in rebuild scope (bible §5, INT-1..12) — layouts may change, IDs must survive.

**Verified totals: 15 hand-crafted interiors, 11 NPC IDs, 86 interactable IDs** (matches the critique's claim). The 86 includes one `exit-door` per interior (15 of them) — `exit-door` is the same literal id in every interior; it is scoped per-interior, not globally unique, so keep exactly one `isExit:true` door per interior with that id. All 11 interior NPC ids carry friendship titles in `src/data/relationshipRewards.js` (e.g. `merchant-fatima-interior` → "Patron of Fatima") — dropping one silently breaks the relationship system.

**How interiors key to doors (the wiring that must survive a zone rebuild):** the ONLY link is the `interiorId` field on a `door` interactable in `zones.js` (e.g. `door-merchant-house` has `interiorId: 'merchant_house_interior'`). On interact, `WorldScene.handleDoorOpened()` pushes `InteriorScene` with `{interiorId, entryPosition}`; `InteriorScene.init()` looks the id up in the `INTERIORS` registry. Exiting via the interior's `isExit:true` door pops the scene stack and restores the player at `entryPosition` — **no return coordinates are stored anywhere**; the exterior door's new position automatically becomes the return point. So a rebuilt zone keeps the wiring iff (a) the door interactable id survives, (b) its `interiorId` value is unchanged, and (c) any `locked/unlockFlag/lockMessage` fields are carried over. Door x/y is free. LINT-7 already enforces (a)+(b) resolution but nothing inside the interior — this section is the inside manifest. Procedural filler interiors (`house_<zone>_<n>` from `InteriorGenerator`) exist in the registry but **no zones.js door references any of them**; they are out of contract.

Locked doors (unlockFlag must survive): `door-scholar-house`→`met_scholar_yusuf`, `door-archive`→`library_access_granted`, `door-warehouse`→`warehouse_key_obtained`, `door-palace-throne`→`palace_audience_granted`.

### oasis_village — 3 interiors

**`scholar_house_interior` — Scholar's Study (مَكتَبَة الشَّيخ)** ← `door-scholar-house`@(8,5) [locked: met_scholar_yusuf]
- dims 14x10 (buildLargeHouse) | spawnPoint (7,8)
- NPCs (1): `scholar-yusuf-interior` "Scholar Yusuf" key=npc-scholar-yusuf @(7,3)
- Interactables (6): `exit-door` door@(7,9) isExit | `bookshelf-scholar-study-1`@(2,1) cat=greetings | `bookshelf-scholar-study-2`@(11,1) cat=phrases | `lantern-scholar-1`@(5,2) vocab=shukran | `painting-scholar-1`@(9,3) vocab=afwan | `pot-scholar-1`@(4,6) vocab=naam

**`merchant_house_interior` — Merchant's Home (بَيْت فاطِمَة)** ← `door-merchant-house`@(10,16)
- dims 10x8 (buildSmallHouse) | spawnPoint (5,6)
- NPCs (1): `merchant-fatima-interior` "Merchant Fatima" key=npc-merchant-fatima @(5,3)
- Interactables (4): `exit-door` door@(5,7) isExit | `chest-merchant-home` chest@(8,1) 10–30 dirhams | `barrel-merchant-1`@(3,1) vocab=coin_w47 | `pot-merchant-1`@(7,4) vocab=habibi

**`oasis_guild_interior` — Adventurer's Guild (نادي المُغامِرين)** ← `door-oasis-guild`@(34,24)
- dims 14x10 (buildLargeHouse) | spawnPoint (7,8)
- NPCs (0)
- Interactables (6): `exit-door` door@(7,9) isExit | `bookshelf-guild-quests`@(3,1) cat=phrases | `sign-guild-board` sign@(7,2) "Quest Board" | `lantern-guild-1`@(4,4) vocab=yalla | `crate-guild-1`@(10,3) loot 5–15, one-shot | `painting-guild-1`@(10,1) vocab=mashaallaah

### ancient_library — 2 interiors

**`library_archive_interior` — Archives (الأَرشيف)** ← `door-archive`@(20,8) [locked: library_access_granted]
- dims 16x12 (buildLibraryRoom) | spawnPoint (8,10)
- NPCs (1): `librarian-interior` "Librarian Ibrahim" key=npc-librarian-ibrahim @(8,4)
- Interactables (8): `exit-door` door@(8,11) isExit | `bookshelf-archive-1`@(4,2) cat=numbers | `bookshelf-archive-2`@(11,2) cat=colors | `bookshelf-archive-3`@(4,8) cat=phrases | `bookshelf-archive-4`@(11,8) cat=greetings | `lantern-archive-1`@(7,3) vocab=num_8 | `crate-archive-1`@(7,7) loot 10–25, one-shot | `painting-archive-1`@(8,2) vocab=color_brown

**`library_study_interior` — Study Room (غُرفَة الدِّراسَة)** ← `door-library-study`@(8,12)
- dims 10x8 (buildSmallHouse) | spawnPoint (5,6)
- NPCs (0)
- Interactables (5): `exit-door` door@(5,7) isExit | `bookshelf-study-1`@(3,1) cat=numbers | `bookshelf-study-2`@(6,1) cat=phrases | `lantern-study-1`@(5,3) vocab=num_6 | `pot-study-1`@(8,4) vocab=yes_1

### desert_marketplace — 3 interiors

**`spice_shop_interior` — Spice Shop (دُكّان البُهارات)** ← `door-spice-shop`@(10,14)
- dims 12x10 (buildShop) | spawnPoint (6,8)
- NPCs (1): `spice-merchant-interior` "Spice Seller Layla" key=npc-spice-seller-layla @(6,3)
- Interactables (5): `exit-door` door@(6,9) isExit | `sign-spice-counter` sign@(6,2) "Fresh Spices" | `barrel-spice-1`@(3,3) vocab=coffee_1 | `pot-spice-1`@(9,3) vocab=vegetables_1 | `pot-spice-2`@(4,7) vocab=weight_w39

**`textile_shop_interior` — Textile Shop (دُكّان الأَقمِشَة)** ← `door-textile-shop`@(30,14)
- dims 12x10 (buildShop) | spawnPoint (6,8)
- NPCs (1): `textile-merchant-interior` "Trader Hassan" key=npc-trader-hassan @(6,3)
- Interactables (5): `exit-door` door@(6,9) isExit | `sign-textile-counter` sign@(6,2) "Fine Textiles" | `crate-textile-1`@(3,3) vocab=customer_w40 | `barrel-textile-1`@(9,4) vocab=sandals_w3 | `painting-textile-1`@(3,7) vocab=quality_w41

**`market_warehouse_interior` — Warehouse (المَخزَن)** ← `door-warehouse`@(35,12) [locked: warehouse_key_obtained]
- dims 14x10 (buildLargeHouse) | spawnPoint (7,8)
- NPCs (0)
- Interactables (5): `exit-door` door@(7,9) isExit | `chest-warehouse-1` chest@(2,1) 20–60 | `chest-warehouse-2` chest@(11,1) 25–70 | `barrel-warehouse-1`@(4,4) vocab=trade_w42 | `crate-warehouse-1`@(9,4) loot 8–20, one-shot

### farmland — 1 interior

**`farmhouse_interior` — Farmer's House (بَيْت المُزارِع)** ← `door-barn`@(15,8)
- dims 10x8 (buildSmallHouse) | spawnPoint (5,6)
- NPCs (1): `farmer-interior` "Farmer Omar" key=npc-farmer-omar @(5,3)
- Interactables (4): `exit-door` door@(5,7) isExit | `bookshelf-farmhouse`@(4,1) cat=nature | `pot-farmhouse-1`@(7,3) vocab=fire_w25 | `barrel-farmhouse-1`@(2,4) vocab=desert_w17

### bedouin_camp — 1 interior

**`bedouin_tent_interior` — Elder's Tent (خَيْمَة الشَّيْخ)** ← `door-bedouin-tent`@(7,8)
- dims 12x10 (buildSmallHouse) | spawnPoint (6,8)
- NPCs (1): `bedouin-elder-interior` "Elder Tariq" key=npc-elder-tariq @(6,3)
- Interactables (5): `exit-door` door@(6,9) isExit | `bookshelf-tent`@(5,1) cat=time | `lantern-tent-1`@(3,3) vocab=week_1 | `pot-tent-1`@(8,3) vocab=year_1 | `painting-tent-1`@(8,1) vocab=do_you_speak_arabic_1

### mountain_village — 2 interiors

**`mountain_home_interior` — Elder's Home (بَيْت الشَّيْخ)** ← `door-mountain-home`@(15,20)
- dims 10x8 (buildSmallHouse) | spawnPoint (5,6)
- NPCs (1): `mountain-elder-interior` "Guide Salim" key=npc-guide-salim @(5,3)
- Interactables (4): `exit-door` door@(5,7) isExit | `bookshelf-mountain-home`@(4,1) cat=adjectives | `pot-mthome-1`@(7,3) vocab=small_1 | `painting-mthome-1`@(2,3) vocab=fast_1

**`mountain_mosque_interior` — Mosque (المَسْجِد)** ← `door-mountain-mosque`@(25,20)
- dims 18x14 (buildMosque) | spawnPoint (9,12)
- NPCs (1): `imam-interior` "Imam Muhammad" key=npc-imam-muhammad @(9,4)
- Interactables (7): `exit-door` door@(9,13) isExit | `bookshelf-mosque-1`@(5,2) cat=greetings | `bookshelf-mosque-2`@(12,2) cat=phrases | `sign-mihrab` sign@(9,2) "The Mihrab" | `lantern-mosque-1`@(6,5) vocab=bismillaah | `lantern-mosque-2`@(11,5) vocab=alhamdulillaah | `painting-mosque-1`@(9,4) vocab=thank_you_very_much_1

### coastal_port — 2 interiors

**`port_tavern_interior` — Tavern (حانَة البَحّارَة)** ← `door-port-tavern`@(15,22)
- dims 14x10 (buildLargeHouse) | spawnPoint (7,8)
- NPCs (1): `tavern-keeper-interior` "Captain Rashid" key=npc-captain-rashid @(7,3)
- Interactables (6): `exit-door` door@(7,9) isExit | `bookshelf-tavern`@(3,1) cat=food | `sign-tavern-menu` sign@(7,1) "Menu" | `barrel-tavern-1`@(10,1) vocab=juice_1 | `lantern-tavern-1`@(4,5) vocab=far_1 | `painting-tavern-1`@(10,4) vocab=chicken_1

**`port_warehouse_interior` — Port Warehouse (مَخْزَن المِيناء)** ← `door-port-warehouse`@(22,22)
- dims 14x10 (buildLargeHouse) | spawnPoint (7,8)
- NPCs (0)
- Interactables (5): `exit-door` door@(7,9) isExit | `chest-port-wh-1` chest@(2,1) 30–100 | `chest-port-wh-2` chest@(11,1) 35–110 | `barrel-portwh-1`@(5,3) loot 10–25, one-shot | `crate-portwh-1`@(9,5) vocab=port_w45

### royal_palace — 1 interior

**`palace_throne_interior` — Throne Room (قاعَة العَرش)** ← `door-palace-throne`@(25,12) [locked: palace_audience_granted]
- dims 18x14 (buildMosque) | spawnPoint (9,12)
- NPCs (1): `vizier-interior` "Vizier Abbas" key=npc-vizier-abbas @(9,4)
- Interactables (11): `exit-door` door@(9,13) isExit | `bookshelf-throne-1`@(5,2) cat=adjectives | `bookshelf-throne-2`@(12,2) cat=colors | `sign-throne` sign@(9,2) "The King's Throne" | `chest-throne-room` chest@(16,11) 80–250 | `lantern-throne-1`@(6,3) vocab=color_orange | `lantern-throne-2`@(11,3) vocab=no_1 | `painting-throne-1`@(6,6) vocab=rich_1 | `painting-throne-2`@(11,6) vocab=color_blue | `statue-throne-1`@(7,9) vocab=heavy_1 | `pot-throne-1`@(2,10) vocab=i_love_1

Interactable-count cross-check per interior: 6+4+6 (oasis) + 8+5 (library) + 5+5+5 (market) + 4 (farm) + 5 (camp) + 4+7 (mountain) + 6+5 (port) + 11 (palace) = **86**. NPC count: 11 (4 interiors have none: oasis_guild, library_study, market_warehouse, port_warehouse). Every interior has exactly one exit (`exit-door`, isExit:true).
