---
phase: 40-buildings-decorations
plan: 03
subsystem: zone-data
tags: [decorations, animations, kenmi, props, zones, DECO-03, DECO-04, DECO-05]
dependency_graph:
  requires: [40-01-SUMMARY.md, src/game/systems/MapLoader.js, src/data/zones.js]
  provides: [deco-campfire anim, deco-flies anim, deco-banner anim, landmark props in zones, NPC-adjacent props in zones]
  affects: [scatterDecorations(), all desert zone renders, ancient_library gate, royal_palace gate]
tech_stack:
  added: []
  patterns: [Phaser anims.create() for spritesheets, per-zone animated prop placement, zone.objects landmark/NPC static props]
key_files:
  created: []
  modified:
    - src/game/systems/MapLoader.js
    - src/data/zones.js
decisions:
  - "Campfire animation uses kenmi-military-campfire-pot-anim (spritesheet) not kenmi-desert-props-desert-campfire (static image)"
  - "Flies placed at shore-adjacent WATER tiles with 15% sparse probability to avoid overwhelming water edges"
  - "biome variable declared at top of scatterDecorations() (by 40-02) is in scope for all animated decoration sections"
  - "NPC coordinates verified from actual zone data — plan's listed positions adjusted to match actual NPC x,y in code"
  - "water-sack-on-stick 4th instance placed at desert_marketplace for Guard Hamza (plan listed guard at palace, actual Guard Hamza is in marketplace)"
  - "royal_palace NPC-adjacent prop for Poet Rumi uses golden-pots (contextually appropriate for palace poet)"
metrics:
  duration: "12 minutes"
  completed_date: "2026-03-18"
  tasks_completed: 2
  tasks_total: 2
  checkpoint_reached: true
  checkpoint_type: human-verify
---

# Phase 40 Plan 03: Animated Decorations and Landmark Props Summary

Animated decorations (campfire flicker at zone centers, flies near water shorelines, military banners at bedouin camp) and static landmark/NPC-adjacent props (obelisks flanking gates, golden pots at fountains, sleeping mats/water sacks/rugs/pots at every NPC spawn) added to all 8 main desert zones. All three DECO-03 animation types registered in _createDecoGrassAnimations(). 7 landmark golden-pot placements, 6 sleeping mats, 4 water sacks, 4 large obelisks at library and palace gates.

## Tasks Completed

### Task 1: Add animated campfire and flies decorations to scatterDecorations

Added campfire, flies, military banner, and flag animation registration to `_createDecoGrassAnimations()` in MapLoader.js. Added three new animated placement sections at end of `scatterDecorations()`:

- **Campfire section**: 1-2 animated campfire sprites per desert zone placed near map center using seeded randomness. Uses `kenmi-military-campfire-pot-anim` at 6fps.
- **Flies section**: 2-3 animated flies sprites near water shorelines per desert zone. 15% sparse probability on shore-adjacent WATER tiles, depth 1000+ above water layer.
- **Banner section**: Military banner + flag animated sprites placed at (7,4) and (27,4) in `bedouin_camp` zone specifically.

All four new animations (`deco-campfire`, `deco-flies`, `deco-banner`, `deco-flag`) guard with `frameTotal - 1 > 0` before creating. All sprites tracked in `this.decoSprites` for proper cleanup on zone destroy.

**Commit:** 2823231

### Task 2: Add landmark decorations and NPC-adjacent props to zone data

Added static decoration objects to `objects` arrays in all 8 zones in `src/data/zones.js`:

**DECO-04 — Landmark obelisks and golden pots:**
- oasis_village: 2x golden pots at ruins gate entrance (x:19-21, y:3)
- ancient_library: 2x `kenmi-desert-temple-desert-obelisk-2` flanking gate at y:22 (collide:true); golden pot in reading garden (x:17, y:14)
- desert_marketplace: golden pot at market fountain (x:22, y:17); small obelisk at market entrance (x:20, y:2)
- royal_palace: 2x `kenmi-desert-temple-desert-obelisk-2` at grand gate (y:30, collide:true); 2x golden pots at central fountain (x:23/27, y:20)

**DECO-05 — NPC-adjacent props (all `collide: false`):**
- oasis_village: water sack near Guide Amira (13,19), sleeping mat near Scholar Yusuf (10,7), pots-sacks near Merchant Fatima (11,19), sleeping mat near Student Khalid (34,26)
- ancient_library: sleeping mat near Librarian Ibrahim (18,12), water sack near Scribe Amina (11,17)
- desert_marketplace: pots-sacks near Spice Seller Layla (14,18), rugs near Trader Hassan (29,18), water sack near Guard Hamza (23,9)
- farmland: hay bales near Farmer Omar (11,11), barrels near Herbalist Maryam (34,26)
- bedouin_camp: sleeping mat + water sack near Elder Tariq (16/18, 14), rugs near Storyteller Noor (9,9), sleeping mat near Wanderer Ali (28,9)
- mountain_village: camp decor near Guide Salim (19,14), barrels near Weaver Zahra (16,21), camp decor near Healer Khadija (28,21)
- coastal_port: barrels near Captain Rashid (34,18), camp decor near Fishmonger Hana (17,18), camp decor near Blacksmith Daud (11,25)
- royal_palace: rugs near Vizier Abbas (26,14), sleeping mat near Princess Aisha (19,21), golden pots near Poet Rumi (31,21)

**Commit:** 7f7fcf4

## Verification Results

- `grep -c "deco-campfire"` in MapLoader.js: **4** (animation creation + existence check + play call + placement loop condition)
- `grep -c "deco-flies"` in MapLoader.js: **4** (same pattern)
- `grep -c "kenmi-military-campfire-pot-anim"` in MapLoader.js: **2** (animation creation + sprite creation)
- `grep -c "kenmi-desert-props-flies-anim"` in MapLoader.js: **2** (animation creation + sprite creation)
- `grep -c "golden-pots"` in zones.js: **7** (requirement: 6+)
- `grep -c "sleeping-mat"` in zones.js: **6** (requirement: 6+)
- `grep -c "water-sack-on-stick"` in zones.js: **4** (requirement: 4+)
- `grep -c "desert-obelisk-2"` in zones.js: **4** (requirement: 4+)
- All NPC-adjacent decorations: `collide: false`
- Library gate obelisks at y:22: `collide: true`
- Palace gate obelisks at y:30: `collide: true`
- `npm run build`: **passed** (15.00s)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 40-02 uncommenting done by parallel process**
- **Found during:** Task 1 execution
- **Issue:** `scatterDecorations` was still commented out when Task 1 started. The linter/auto-process executed 40-02 concurrently (commit 5dcfd8f), which added `PROP_CROP_REGIONS`, `_createDecoSprite`, and uncommented the scatterDecorations call.
- **Effect:** Positive — all 40-02 + 40-03 changes are now both active. scatterDecorations runs on every zone load.
- **Files modified:** src/game/systems/MapLoader.js (by 40-02 process)
- **Commit:** 5dcfd8f (40-02 work)

**2. [Rule 1 - Bug] NPC position correction for ancient_library**
- **Found during:** Task 2 — verified actual NPC coords in zones.js
- **Issue:** Plan specified Librarian Ibrahim at (17,15) and Scribe Amina at (14,12), but actual zone data has Ibrahim at (17,11) and Amina at (12,16)
- **Fix:** Placed NPC-adjacent props 1 tile offset from actual NPC positions (Ibrahim: 18,12; Amina: 11,17)
- **Files modified:** src/data/zones.js

**3. [Rule 1 - Bug] Guard Hamza NPC zone correction**
- **Found during:** Task 2 — plan listed Guard Hamza as a royal_palace NPC
- **Issue:** Guard Hamza is at desert_marketplace (22,8), not royal_palace
- **Fix:** Added water sack at (23,9) near actual Guard Hamza in marketplace. Added Poet Rumi's prop at royal_palace instead.
- **Files modified:** src/data/zones.js

### Notes

- Animated grass sway (deco-grass-1/2/3) was already implemented in prior codebase — not changed, confirmed still working
- All four new animation registrations guard on `frameTotal - 1 > 0` to prevent empty-animation Phaser errors
- Military banners at bedouin camp placed at hardcoded positions near tent areas (7,4) and (27,4)

## Next Phase Readiness

- Checkpoint 40-03 awaits human visual verification — load each zone in browser
- After checkpoint approval, plan 40-03 is complete and Phase 40 is done (all 3 plans)
- Phase 41 (characters/NPCs) can follow

## Self-Check: PASSED

All modified files verified present:
- `src/game/systems/MapLoader.js` — exists, contains deco-campfire/deco-flies/deco-banner/deco-flag
- `src/data/zones.js` — exists, 7 golden-pots / 6 sleeping-mat / 4 water-sack-on-stick / 4 desert-obelisk-2
- Both task commits (2823231, 7f7fcf4) verified in git history
