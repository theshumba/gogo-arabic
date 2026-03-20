---
phase: 53-faction-reputation-engine
plan: 02
subsystem: game-systems
tags: [factions, ActionSetExecutor, shopGenerator, content-gating, data-driven]

# Dependency graph
requires:
  - phase: 53-01
    provides: factionSlice with FACTION_TIERS, 0-100 clamping, selectFactionTiers selector, factionMiddleware

provides:
  - factionRequired requirement type in ActionSetExecutor for data-driven faction gating
  - factionScores field in buildActionContext from state.faction.alignment
  - shopGenerator reads correct faction state path with 15% Allied (75+) discount
  - factionGatedContent.js with bonus dialogue, side quests, and shop discounts for all 6 factions

affects: [ActionSetExecutor callers, NPCManager, WorldScene, shop UI, quest systems]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - factionRequired requirement type pattern: { type, factionId, minScore } evaluated by ActionSetExecutor
    - Faction-gated content data-driven: all gates in factionGatedContent.js, not in main quest definitions
    - Allied discount applied at threshold 75 via factionDiscount multiplier in price calculation

key-files:
  created:
    - src/data/factionGatedContent.js
  modified:
    - src/game/systems/ActionSetExecutor.js
    - src/game/systems/actionContext.js
    - src/data/shopGenerator.js

key-decisions:
  - "factionRequired case reads context.factionScores[factionId] ?? 0 with optional chaining — safe at faction score 0"
  - "factionScores added to buildActionContext after currentZone — all callers get faction scores automatically"
  - "shopGenerator reputation threshold changed from 50 to 75 (Allied) — content unlock aligns with FACTION_TIERS"
  - "factionDiscount only applied to reputation items, not base items — base shop accessible regardless of faction"
  - "getShopFaction null return (not 'neutral') for unmapped shops — cleaner than pseudo-faction string"

patterns-established:
  - "Faction-gated bonus content in factionGatedContent.js; main quest definitions never contain factionRequired"
  - "factionRequired requirement: { type: 'factionRequired', factionId: string, minScore: number }"
  - "All bonus dialogue organized by faction then tier (friendly/trusted) for O(1) lookup"

requirements-completed:
  - FACT-03
  - FACT-04
  - FACT-05

# Metrics
duration: 12min
completed: 2026-03-20
---

# Phase 53 Plan 02: Faction Content Gating Summary

**factionRequired gate in ActionSetExecutor, corrected shopGenerator faction path with 15% Allied discount, and data-driven bonus content (dialogue/quests/discounts) for all 6 factions**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-20T21:10:00Z
- **Completed:** 2026-03-20T21:22:00Z
- **Tasks:** 2
- **Files modified:** 4 (3 modified, 1 created)

## Accomplishments

- ActionSetExecutor now evaluates `factionRequired` requirements by reading `context.factionScores[factionId]` — any NPC action set can gate bonus content on faction alignment
- buildActionContext automatically provides `factionScores` from `state.faction.alignment` to all callers (NPCManager, WorldScene) without code changes required
- shopGenerator fixed to read `state.faction.alignment` (was stale `state.narrative.factionReputation`), reputation threshold raised to 75 (Allied), 15% discount applied to reputation items at Allied tier
- factionGatedContent.js created: 6 factions x (2 Friendly dialogue + 2 Trusted dialogue + 1 Trusted side quest) + FACTION_SHOP_DISCOUNTS constants — fully data-driven, no faction gates in main quest definitions

## Task Commits

Each task was committed atomically:

1. **Task 1: Add factionRequired to ActionSetExecutor and factionScores to actionContext** - `ba82cd2` (feat)
2. **Task 2: Fix shopGenerator faction path and create faction-gated content data** - `34ee509` (feat)

## Files Created/Modified

- `src/game/systems/ActionSetExecutor.js` - Added `factionRequired` case in evaluateRequirement switch; updated JSDoc
- `src/game/systems/actionContext.js` - Added `factionScores: state.faction?.alignment || {}` field; updated JSDoc return
- `src/data/shopGenerator.js` - Fixed state path, updated factionMap to correct FACTION_IDS, threshold 75, 15% Allied discount
- `src/data/factionGatedContent.js` - New: FACTION_GATED_DIALOGUE, FACTION_GATED_QUESTS, FACTION_SHOP_DISCOUNTS for all 6 factions

## Decisions Made

- factionRequired case uses optional chaining (`context.factionScores?.[req.factionId] ?? 0`) — safe when faction state not yet loaded, defaults to 0 which means no gated content unlocked
- shopGenerator changed getShopFaction to return `null` for unmapped shops (previously `'neutral'`) — avoids pollution from pseudo-faction string; callers get `reputation = 0` for unmapped shops
- factionGatedContent.js uses computed keys `[FACTION_IDS.SCHOLARS]` not string literals — consistent with FACTION_IDS usage, refactor-safe

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 53-03 (UI/HUD for faction reputation display) can proceed — all state and content gating infrastructure is in place
- All 6 factions have bonus content defined; factionMiddleware from 53-01 auto-fires scores; ActionSetExecutor can now evaluate faction gates
- Main storyline quests verified: no `factionRequired` found in `src/data/quests/` or `src/data/npcStoryArcs.js` (FACT-04 confirmed)

---
*Phase: 53-faction-reputation-engine*
*Completed: 2026-03-20*
