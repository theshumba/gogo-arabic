---
gsd_state_version: 1.0
milestone: v8.0
milestone_name: Visual Overhaul
status: in_progress
stopped_at: Phase 38 Plan 01 complete — ready for 38-02 (BootScene loader)
last_updated: "2026-03-16T22:43:00.000Z"
last_activity: 2026-03-16 — Completed 38-01 (asset copy + KENMI_CATALOG)
progress:
  total_phases: 6
  completed_phases: 0
  total_plans: 16
  completed_plans: 1
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-16)

**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"
**Current focus:** v8.0 Visual Overhaul — Phase 38: Asset Pipeline & BootScene

## Current Position

Milestone: v8.0 Visual Overhaul
Phase: 38 of 43 (Asset Pipeline & BootScene)
Plan: 1 of 2 in current phase (38-01 complete)
Status: In progress
Last activity: 2026-03-16 — Completed 38-01-PLAN.md (asset copy + KENMI_CATALOG)

Progress (v8.0): [░░░░░░░░░░] 6% (1/16 plans)

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
- Current MapLoader renders flat colored squares — TilesetRenderer replaces it
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

### Blockers/Concerns

- Bundle already 862KB (well over 500KB target) — Kenmi assets will increase this further; lazy loading needed
- BootScene currently loads ALL assets upfront (77 calls) — 38-02 should establish zone-based loading pattern

### Pending Todos

None.

## Session Continuity

Last session: 2026-03-16
Stopped at: 38-01 complete — asset copy + KENMI_CATALOG generated
Resume file: .planning/phases/38-asset-pipeline/38-02-PLAN.md
