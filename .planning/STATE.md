---
gsd_state_version: 1.0
milestone: v8.0
milestone_name: Visual Overhaul
status: in_progress
stopped_at: Phase 42 Plan 03 complete — Phase 42 done, ready for Phase 43 (zone cleanup)
last_updated: "2026-03-18T02:40:00Z"
last_activity: "2026-03-18 — 42-03 complete: Arabic-aware DialogueBox + zone name toast, ARAB-01 through ARAB-04 satisfied"
progress:
  total_phases: 6
  completed_phases: 4
  total_plans: 10
  completed_plans: 16
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-16)

**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"
**Current focus:** v8.0 Visual Overhaul — Phase 42 COMPLETE, Phase 43 (zone cleanup) next

## Current Position

Milestone: v8.0 Visual Overhaul
Phase: 42 of 43 (phaser-ui-arabic) — COMPLETE (3/3 plans done)
Plan: 3/3 complete — Phase 43 next (zone cleanup — remove DOM overlay infrastructure)
Status: 42-03 done — Phase 42 complete
Last activity: 2026-03-18 — 42-03: Arabic-aware DialogueBox + zone name toast, ARAB-01–04 satisfied

Progress (v8.0): [███████████░] 95% (19/20 plans total — Phase 42 done, Phase 43 remains)

### Shipped Milestones

| Version | Phases | Plans | Date |
|---------|--------|-------|------|
| v2.0 Player Experience | 1-9 | 14 | 2026-02-08 |
| v3.0 Infrastructure | 10-11 | 11 | 2026-02-09 |
| v4.0 Game Soul & Polish | 14-18 | 8 | 2026-02-10 |
| v5.0 The Real Game | 19-26 | 18 | 2026-02-11 |
| v6.0 Combat & RPG | 27.1, 28-30 | 16 | 2026-02-13 |
| v6.1 Crafting & Advanced Combat | 31-32 | 19 | 2026-02-18 |
| v7.0 World & Content | 33-37 | 18 | 2026-03-16 |

**Cumulative:** 37 phases, 113 plans, 7 milestones

## Accumulated Context

### Key v8.0 Context

- Assets at `public/assets/kenmi/` — 10 packs, 969 PNGs, 16x16 base tiles (PIPE-01 complete)
- KENMI_CATALOG at `src/data/kenmiCatalog.js` — 969 entries, 592 spritesheets, 377 images
- TILE constant = 64, so 16x16 tiles scale 4x — no game logic changes needed
- MapLoader BIOME_TILESETS has 6 biome types: desert, grass, snow, dungeon, volcano, mushroom
- Flat tile fallback (_renderFlatTiles) preserved for when Kenmi textures not loaded
- ALL 24 zones have tilesetTheme field (8 main zones.js + 8 fantasyZones.js + 8 realWorldZones.js)
- Current UI is React DOM overlays for everything — only in-game elements move to Phaser
- Current NPCs are 128x128 faceless silhouettes — replaced with 16x16 Kenmi sprites
- Phase 43 (cleanup) must run last — it removes placeholders after replacements are confirmed

### Decisions

All v2.0-v7.0 decisions logged in PROJECT.md Key Decisions table.

v8.0 decisions:
- Phase ordering: pipeline → terrain → buildings/deco → characters → UI/Arabic → cleanup
- UI-07 constraint: React overlays (HUD, menu, settings, profile, wardrobe) stay as React
- 38-01: Preserved internal subdirectory structure within each pack (not fully flattened) — keeps paths semantic
- 38-01: Characters pack (goblins, knights, orcs, angels) entirely spritesheet — all walk-cycle animation sheets
- 38-01: Catalog keys use shortened pack prefixes (char, shroom, military) to keep keys concise
- 38-01: Catalog sorted alphabetically by key for deterministic output and readable diffs
- 38-01: UI pack `ui-frames.png` is at `ui/ui/ui-frames.png` (nested Cute_Fantasy_UI/UI/ subdir)
- 38-02: All 969 Kenmi assets loaded upfront in BootScene — zone-based lazy loading deferred to post-v8.0
- 38-02: loaderror handler registered once before the catalog loop (not per-entry) — Phaser fires event per file
- 39-02: Snow biome uses kenmi-base-tiles-grass-grass-tiles-1 (spritesheet) with blue tints — kenmi-christmas-decorations-christmass-grass is type 'image' (no frame indices)
- 39-02: BIOME_TILESETS drives biome dispatch — extend this table in Plan 39-03 for dungeon/volcano/mushroom
- 39-02: royal_palace uses 'desert' tilesetTheme (mixed biome — ICE_GRASS tinted blue via _renderGrassTile)
- 39-02: Foam anim keys prefixed by foam spritesheet key (sanitised) to avoid cross-biome key collisions
- 39-03: Volcano uses volcano-tiles.png for all ground types (sand/grass/water); lava-buble.png (11 cols x 1 row) as foam
- 39-03: foamRows safety check added — Math.floor(totalFrames / foamCols) — single-row foam (volcano) only creates top animation
- 39-03: Dungeon biome uses cave-floor-1/2 spritesheets (dungeon-1.png is 'image' type, cannot use frame indices)
- 39-03: Mushroom water falls back to base water tiles — no dedicated shroom water spritesheet in catalog
- 39-03: desert_of_silence assigned 'volcano' (desolate wasteland, TILE-09); fortress_of_secrets assigned 'dungeon' (TILE-08); forest_of_tales assigned 'mushroom' (TILE-10)
- 39-03: All 8 real-world zones assigned 'desert' (historical Middle East/North Africa settings)
- 40-01: BIOME_BUILDING_SETS in spriteKeyMap.js is single source of truth for all biome building key arrays
- 40-01: getDefaultObjects(tilesetTheme) in mapPlaceholder.js replaces old 4-identical-ruin-pillar defaultObjects
- 40-01: gate-pillar key (royal_palace) replaced with kenmi-desert-temple-desert-obelisk-small-1 (no dedicated gate-pillar in Kenmi)
- 40-01: mapPlaceholder references BIOME_BUILDING_SETS via import, not inline strings — acceptance criteria grep was design-based not literal
- 40-02: PROP_CROP_REGIONS maps texture key to array of {x,y,w,h} regions for multi-item prop sheets
- 40-02: _createDecoSprite() uses setCrop() for multi-item sheets, native size for large single-object images
- 40-02: scatterDecorations() skips dungeon/volcano/mushroom/snow biomes — only desert and grass get prop scattering
- 40-02: Near-object chance increased to 0.25, near-water to 0.18, near-edge to 0.15 for density
- 40-03: Campfire animation uses kenmi-military-campfire-pot-anim (spritesheet) not kenmi-desert-props-desert-campfire (static image)
- 40-03: Flies placed at shore-adjacent WATER tiles with 15% sparse probability — avoids overwhelming water edges
- 40-03: NPC positions verified from actual zone data — plan's listed positions adjusted to match real coords
- 40-03: Guard Hamza prop placed in desert_marketplace (actual zone) not royal_palace (plan listed wrong zone)
- 41-01: NPC_KEY_MAP maps 23 NPCs to Kenmi sprites; NPC.js auto-detects Kenmi via texture key lookup; Kenmi uses 12-col × 20-row layout at 4x scale
- 41-02: FEMALE_NPC_IDS checked against `key` (includes `npc-` prefix) not `id` — matches Set entries
- 41-02: Hijab texture per-NPC with `hijab-overlay-{id}` key — avoids collision when two females share base sprite
- 41-02: _hijabSprite initialized null via post-constructor guard for legacy/non-female NPCs
- 41-02: Additive overlay pattern — hijab is a separate scene.add.sprite(), position synced in update() and setInteractionHint()
- 41-03: ENEMY_KENMI_MAP uses actual enemy IDs from enemies.js — plan had 18 wrong IDs; corrected to all 19 real enemy IDs
- 41-03: Kenmi battle fallback check: useKenmi = kenmiKey exists + Kenmi texture loaded + 256x256 NOT loaded — Kenmi is fallback only
- 41-03: Kenmi battle sprites at 6x scale (16px * 6 = 96px) for battle scene visibility
- 41-03: safeFrames() in _createAnimalAnimations uses Object.keys(tex.frames).length - 1 (subtracts Phaser __BASE pseudo-frame)
- 41-03: Desert-zone guard uses zone.tilesetTheme || 'desert' matching existing biome dispatch pattern
- 42-02: arabicNameLabel positioned at y-70 (above English nameLabel at y-56) — stacks cleanly, null when nameArabic is falsy
- 42-02: NineSlice.js kenmi preset uses texture 'kenmi-ui-frames-sheet' at cornerSize 6 — requires BootScene spritesheet registration (Plan 42-03)
- 42-02: UI-07 boundary documented as code comment in PanelFactory.js — clear React/Phaser ownership for future maintainers
- 42-03: _hasArabic() inline in DialogueBox (not imported from ArabicText) — keeps detection self-contained
- 42-03: Arabic typewriter speed 20ms vs English 30ms — Arabic strings shorter after reshaping, faster timer needed
- 42-03: Zone toast depth 9500 (below DialogueBox at 10000) — toast never obscures active dialogue
- 42-03: _suppressZoneToast cleared in buildZone() not create() — handles Phaser scene reuse correctly (constructor runs once)

### Blockers/Concerns

- Bundle already 862KB (well over 500KB target) — Kenmi assets increase this further; lazy loading deferred to post-v8.0 cleanup
- BootScene now loads ALL 969 Kenmi assets upfront (in addition to legacy 77 calls) — zone-based loading is a future optimization

### Pending Todos

- Phase 43: Zone cleanup — remove DOM overlay infrastructure after Phase 42 replacements confirmed
- Post-v8.0: SignPanel + ObjectPanel (React → Phaser NineSlice migration) deferred — Phase 42 Arabic requirements met without them
- Post-v8.0: kenmi-ui-frames-sheet spritesheet registration in BootScene (PanelFactory kenmi preset wiring)

## Session Continuity

Last session: 2026-03-18
Stopped at: Phase 42 Plan 03 complete — Phase 42 fully done
Resume file: .planning/phases/43-zone-cleanup/ (Phase 43 plans to be created)
