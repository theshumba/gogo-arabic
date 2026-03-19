---
phase: 50-infrastructure-baseline
plan: 02
subsystem: infra
tags: [phaser, asset-loading, zone-transition, event-bus, performance]

# Dependency graph
requires:
  - phase: 50-01
    provides: lazy-wrapped GameLayout overlays and bundle optimization baseline
provides:
  - src/data/zoneAssetManifests.js with SHARED_ASSETS, ZONE_ASSET_MANIFESTS (8 zones), and loadZoneAssets()
  - BootScene loads only shared assets via manifest loop instead of hardcoded individual calls
  - ZoneTransition dynamically loads zone-specific assets during fade-out before each zone visit
  - ZONE_LOADING_START / ZONE_LOADING_END events in eventBusTypes.js
  - "Loading zone..." indicator in GameLayout.jsx shown during zone transition asset loading
affects:
  - phase: 51 (any future zone additions should add entries to ZONE_ASSET_MANIFESTS)
  - phase: 52 (any new zone-specific tilesets go in ZONE_ASSET_MANIFESTS, not BootScene)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Asset manifest pattern: all Phaser boot assets defined in SHARED_ASSETS array in zoneAssetManifests.js; BootScene loops over it"
    - "On-demand zone loading: loadZoneAssets() checks scene.textures.exists() before loading; noop on revisit"
    - "Non-fatal asset loading: loadZoneAssets wrapped in try/catch inside transitionTo; zone renders with missing textures rather than crashing"
    - "Zone loading events: ZONE_LOADING_START emitted before loadZoneAssets, ZONE_LOADING_END after; React listens for indicator"

key-files:
  created:
    - src/data/zoneAssetManifests.js
  modified:
    - src/game/scenes/BootScene.js
    - src/game/systems/ZoneTransition.js
    - src/components/Router/GameLayout.jsx
    - src/utils/eventBusTypes.js

key-decisions:
  - "KENMI_CATALOG kept in BootScene as-is (decorative sprites used across multiple zones, not zone-specific)"
  - "desert-beach-tiles-* / desert-grass / desert-water-tiles-* moved from BootScene to ZONE_ASSET_MANIFESTS for oasis_village, ancient_library, desert_marketplace, bedouin_camp, royal_palace"
  - "loadZoneAssets() called on this.scene (active WorldScene) not a new scene -- avoids Pitfall 3 (calling loader on inactive scene)"
  - "Loading indicator uses inline styles and gold color (#D4A843) matching BootScene loading bar -- no new CSS module needed"

patterns-established:
  - "Add new zone-specific tilesets to ZONE_ASSET_MANIFESTS[zoneId] array, not to BootScene"
  - "Add new shared assets (always needed regardless of zone) to SHARED_ASSETS array in zoneAssetManifests.js"

requirements-completed: [INFRA-02]

# Metrics
duration: 20min
completed: 2026-03-19
---

# Phase 50 Plan 02: Zone Asset Manifest Summary

**BootScene split into shared-only preload + per-zone on-demand loading via loadZoneAssets() called during ZoneTransition fade-out**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-03-19T21:50:00Z
- **Completed:** 2026-03-19T22:11:09Z
- **Tasks:** 2 of 2
- **Files modified:** 5

## Accomplishments
- Created `src/data/zoneAssetManifests.js` exporting `SHARED_ASSETS` (67 entries), `ZONE_ASSET_MANIFESTS` (8 zones), and `loadZoneAssets()` async utility
- Replaced 150+ lines of hardcoded individual `this.load.image/spritesheet()` calls in BootScene with a 9-line loop over `SHARED_ASSETS`
- ZoneTransition now loads zone-specific Kenmi desert tilesets on-demand during fade-to-black, with TextureManager cache skip on revisit
- Zone loading indicator ("Loading zone...") renders in GameLayout.jsx during asset loading phase of transition

## Task Commits

Each task was committed atomically:

1. **Task 1: Create zone asset manifest and refactor BootScene to shared-only loading** - `2fc7212` (feat)
2. **Task 2: Wire zone-based loading into ZoneTransition with loading indicator** - `ae0eb89` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/data/zoneAssetManifests.js` - SHARED_ASSETS array, ZONE_ASSET_MANIFESTS (8-zone object), loadZoneAssets() async function
- `src/game/scenes/BootScene.js` - Replaced hardcoded loads with SHARED_ASSETS loop; removed 7 desert tileset loads; removed 80+ individual body/head/NPC/UI load calls
- `src/game/systems/ZoneTransition.js` - Imports loadZoneAssets; calls it between fade-out and loadZone with ZONE_LOADING_START/END events
- `src/components/Router/GameLayout.jsx` - zoneLoading state + useEffect for ZONE_LOADING events + "Loading zone..." JSX indicator
- `src/utils/eventBusTypes.js` - Added ZONE_LOADING_START and ZONE_LOADING_END to EVENTS object and comment block

## Decisions Made
- KENMI_CATALOG stays in BootScene directly (not in SHARED_ASSETS) -- decorative sprites used across all zones, not zone-specific
- desert-beach-tiles-* / desert-grass / desert-water-tiles-* moved from BootScene to ZONE_ASSET_MANIFESTS (desert zones only)
- `loadZoneAssets(this.scene, ...)` receives the active WorldScene -- required to use the scene's loader, not BootScene loader
- Non-fatal loading: failed zone asset loads log a warning and continue; zone may show missing textures but game does not crash
- farmland, mountain_village, and coastal_port have empty manifests (no zone-specific Kenmi tilesets yet)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Zone asset split complete; Phase 51 can add new zone-specific assets to ZONE_ASSET_MANIFESTS without touching BootScene
- loadZoneAssets() is ready for new zones -- add array to ZONE_ASSET_MANIFESTS[newZoneId] and it auto-works
- farmland / mountain_village / coastal_port manifests are empty placeholders, ready for LDtk-exported tilesets

---
*Phase: 50-infrastructure-baseline*
*Completed: 2026-03-19*

## Self-Check: PASSED

- FOUND: src/data/zoneAssetManifests.js
- FOUND: src/game/scenes/BootScene.js
- FOUND: src/game/systems/ZoneTransition.js
- FOUND: src/components/Router/GameLayout.jsx
- FOUND: src/utils/eventBusTypes.js
- FOUND commit: 2fc7212 (Task 1)
- FOUND commit: ae0eb89 (Task 2)
