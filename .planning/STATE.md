---
gsd_state_version: 1.0
milestone: v8.0
milestone_name: Visual Overhaul
status: in_progress
stopped_at: Phase 41 Plan 03 complete (auto tasks) — awaiting checkpoint:human-verify
last_updated: "2026-03-18T01:46:40Z"
last_activity: 2026-03-18 — Phase 41 Plan 03 complete (ENEMY_KENMI_MAP + ambient animals enabled)
progress:
  total_phases: 6
  completed_phases: 3
  total_plans: 7
  completed_plans: 13
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-16)

**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"
**Current focus:** v8.0 Visual Overhaul — Phase 41: Characters & Ambient Life (Plans 41-01 and 41-02 complete)

## Current Position

Milestone: v8.0 Visual Overhaul
Phase: 41 of 43 (characters-ambient-life) — IN PROGRESS (awaiting checkpoint)
Plan: 3/3 plans in phase 41 complete (pending human-verify checkpoint)
Status: All 3 plans shipped — awaiting visual verification before phase close
Last activity: 2026-03-18 — Phase 41 Plan 03 complete (ENEMY_KENMI_MAP + ambient animals enabled)

Progress (v8.0): [█████████░] 81% (13/16 plans)

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

### Blockers/Concerns

- Bundle already 862KB (well over 500KB target) — Kenmi assets increase this further; lazy loading deferred to post-v8.0 cleanup
- BootScene now loads ALL 969 Kenmi assets upfront (in addition to legacy 77 calls) — zone-based loading is a future optimization

### Pending Todos

- Visual verification complete (user-approved via checkpoint) — animated decorations, landmark obelisks, NPC-adjacent props all confirmed across 8 zones

## Session Continuity

Last session: 2026-03-18
Stopped at: Phase 41 Plan 03 — awaiting checkpoint:human-verify (all 3 plans complete, pending visual sign-off)
Resume file: .planning/phases/41-characters-ambient-life/41-03-PLAN.md (checkpoint:human-verify task — resume after user approves)
