---
phase: 41-characters-ambient-life
plan: 02
subsystem: ui
tags: [phaser, kenmi, sprites, npc, animation, female-representation]

# Dependency graph
requires:
  - phase: 41-01
    provides: NPC_KEY_MAP mapping all 23 NPCs to Kenmi sprite keys, Kenmi animation setup in NPC.js

provides:
  - FEMALE_NPC_IDS Set (10 female NPC keys) exported from spriteKeyMap.js
  - NPC_HIJAB_TINT constant (0xF5E6D3 warm off-white) exported from spriteKeyMap.js
  - Hijab pixel overlay for all 10 female NPCs via tinted Graphics sprite in NPC.js
  - setFlipX override syncing hijab flip with NPC sprite on interaction
  - Hijab position sync in update(), setInteractionHint(), and depth tracking
  - Full hijab lifecycle cleanup in NPC.destroy()

affects:
  - 41-03 (any further NPC changes)
  - Phase 43 cleanup (placeholder removal references NPC logic)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Graphics.generateTexture() used to create NPC-specific overlay sprites at runtime
    - FEMALE_NPC_IDS Set as single source of truth — imported by NPC.js to avoid hardcoded checks

key-files:
  created: []
  modified:
    - src/data/spriteKeyMap.js
    - src/game/sprites/NPC.js

key-decisions:
  - "FEMALE_NPC_IDS checked using `key` (original NPC key like 'npc-merchant-fatima') not `id` (like 'merchant-fatima') — key includes npc- prefix and matches the Set entries exactly"
  - "Hijab texture generated per-NPC using unique hijab-overlay-{id} key — avoids texture collisions between female NPCs sharing same Kenmi sprite"
  - "_hijabSprite always initialized to null for non-Kenmi/non-female NPCs via post-constructor guard — prevents undefined errors in setFlipX/update/destroy"
  - "Hijab shape: fillRoundedRect(3,0,10,6,2) head cover + fillRect left/right drapes at 16x16 base scale — blends with Kenmi pixel art aesthetic"

patterns-established:
  - "Additive overlay pattern: secondary sprites added as scene.add.sprite(), not as children — position synced manually in update() and setInteractionHint()"
  - "setFlipX override pattern: super.setFlipX() called first, then overlay sprite synced — enables NPCManager to flip NPC+hijab together with single call"

requirements-completed: [CHAR-02, CHAR-03, CHAR-05, CHAR-06]

# Metrics
duration: 2min
completed: 2026-03-18
---

# Phase 41 Plan 02: NPC Hijab Overlay Summary

**FEMALE_NPC_IDS Set + tinted Graphics hijab overlay on 10 female Kenmi NPCs with full position/flip/depth sync**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-18T01:37:03Z
- **Completed:** 2026-03-18T01:39:21Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Exported `FEMALE_NPC_IDS` (Set of 10 female NPC keys) and `NPC_HIJAB_TINT` (0xF5E6D3) from `spriteKeyMap.js`
- NPC_KEY_MAP already had all 23 NPCs mapped from Plan 41-01 — no gaps found
- Added hijab overlay sprite for female Kenmi NPCs using `Graphics.generateTexture()` with head cover + drape shape
- Hijab syncs position in `update()` and `setInteractionHint()`, flips with NPC in `setFlipX()` override, cleans up in `destroy()`

## Task Commits

Each task was committed atomically:

1. **Task 1: Verify NPC_KEY_MAP coverage and add missing NPC mappings** - `92c426b` (feat)
2. **Task 2: Add hijab overlay to female NPC sprites in NPC.js** - `bf50a90` (feat)

## Files Created/Modified
- `src/data/spriteKeyMap.js` — Added `FEMALE_NPC_IDS` Set (10 female NPC keys) and `NPC_HIJAB_TINT` constant after existing `NPC_KEY_MAP`
- `src/game/sprites/NPC.js` — Updated import, added hijab Graphics sprite creation, `setFlipX` override, position sync in update/setInteractionHint, and destroy cleanup

## Decisions Made
- `FEMALE_NPC_IDS` checked against `key` (the original NPC key like `npc-merchant-fatima`) not `id` (`merchant-fatima`) — key includes the `npc-` prefix matching the Set entries
- Hijab texture generated with unique `hijab-overlay-{id}` key per NPC — avoids texture collisions when two female NPCs share the same base Kenmi sprite (e.g. npc-scribe-amina and npc-healer-khadija both use `kenmi-desert-npc-desert-person-4`)
- `_hijabSprite` initialized to `null` via post-constructor guard for legacy/non-female NPCs — prevents undefined errors in shared methods

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 23 NPCs now render as Kenmi pixel art sprites (CHAR-02, CHAR-05 from Plan 41-01)
- All NPCs have idle and walk animations (CHAR-06 from Plan 41-01)
- Female NPCs (10 of 23) have hijab overlay with full position/flip/depth sync (CHAR-03 — this plan)
- CHAR-02, CHAR-03, CHAR-05, CHAR-06 all satisfied
- Ready for Plan 41-03 (ambient life / player sprite, or next phase)

## Self-Check: PASSED

All expected files found. All commits (92c426b, bf50a90) verified in git log.

---
*Phase: 41-characters-ambient-life*
*Completed: 2026-03-18*
