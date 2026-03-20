---
phase: 53-faction-reputation-engine
plan: 03
subsystem: ui
tags: [faction, vocabulary, fsrs, redux-middleware, react, framer-motion, world-state]

# Dependency graph
requires:
  - phase: 53-01
    provides: factionSlice with adjustAlignment, selectFactionRanks, FACTION_TIERS, factionMiddleware base structure
  - phase: 53-02
    provides: factionSlice selectFactionRanks, selectFactionTiers selectors
  - phase: 50-01
    provides: worldStateSlice setFlag, WORLD_STATE_KEYS with FACTION_*_FRIENDLY/TRUSTED/ALLIED flags
  - phase: 51-05
    provides: vocabularySlice addFsrsCard action
provides:
  - "144 faction vocabulary word IDs (12 per faction per tier, friendly + trusted tiers, 6 factions)"
  - "Threshold crossing detection in factionMiddleware with pre/post score comparison"
  - "WorldState flag guard preventing double-fire on score oscillation"
  - "FactionPanel UI showing all 6 factions with animated progress bars and tier labels"
  - "FactionPanel lazy-loaded in GameLayout, accessible via Pause Menu > Factions button"
affects: [54-gossip-rumour-system, phase-54, vocabulary-review, faction-gates]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Threshold crossing detection: capture preScore before next(action), check postScore after, guard with worldState flag"
    - "Faction vocab rewards: FACTION_VOCAB_REWARDS[factionId][tierKey] → addFsrsCard dispatch loop"
    - "Lazy overlay pattern: React.lazy + Suspense fallback=null, boolean state toggle in GameLayout"

key-files:
  created:
    - src/data/factionVocab.js
    - src/components/Faction/FactionPanel.jsx
  modified:
    - src/store/middleware/factionMiddleware.js
    - src/components/Router/GameLayout.jsx

key-decisions:
  - "factionVocab.js word IDs are symbolic (non-corpus) identifiers — guards against re-adding already-known words via fsrsCards[wordId] check"
  - "FACTION_*_FRIENDLY/TRUSTED/ALLIED world flags used as idempotency guards — reward fires exactly once regardless of score oscillation"
  - "FactionPanel sorts by score (selectFactionRanks) so highest-standing faction appears first"
  - "PauseMenu receives onOpenFactionPanel prop threaded from GameLayout — same prop-threading pattern as onOpenWardrobe/onOpenPathSwitch"

patterns-established:
  - "Tier vocab reward guard: check worldFlags[worldKey] before dispatch, setFlag immediately on first crossing"
  - "Pre-score capture: const preScore = action.type === 'faction/adjustAlignment' ? store.getState().faction?.alignment?.[factionId] : null — captured BEFORE next(action)"

requirements-completed: [FACT-06, FACT-01, FACT-03]

# Metrics
duration: 4min
completed: 2026-03-20
---

# Phase 53 Plan 03: Faction Vocab Rewards + FactionPanel Summary

**Faction vocabulary rewards via FSRS threshold crossing detection and FactionPanel UI showing all 6 faction scores with animated tier progress bars in English + Arabic**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-20T21:19:03Z
- **Completed:** 2026-03-20T21:23:32Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created `src/data/factionVocab.js` with 144 word IDs (12 per faction at friendly tier, 12 at trusted tier, 6 factions total)
- Extended `factionMiddleware.js` with `checkThresholdCrossings()` — pre/post score comparison guards with worldState flags preventing double-fire
- Created `FactionPanel.jsx` with animated progress bars, score overlays, English + Arabic tier labels, tier color legend
- Wired FactionPanel as lazy overlay in GameLayout with Factions button in PauseMenu

## Task Commits

Each task was committed atomically:

1. **Task 1: Create factionVocab.js and extend factionMiddleware with threshold vocab rewards** - `a83f086` (feat)
2. **Task 2: Create FactionPanel UI component and wire into GameLayout** - `46421ab` (feat)

**Plan metadata:** (committed with final docs commit)

## Files Created/Modified
- `src/data/factionVocab.js` — 144 word IDs, 12 per faction per tier at friendly + trusted thresholds
- `src/store/middleware/factionMiddleware.js` — added checkThresholdCrossings, TIER_THRESHOLDS, createDefaultCard, getFactionTierWorldKey; imports addFsrsCard, setFlag, WORLD_STATE_KEYS, FACTION_VOCAB_REWARDS
- `src/components/Faction/FactionPanel.jsx` — new React component, FactionBar sub-component, selectFactionRanks + getFactionTier integration
- `src/components/Router/GameLayout.jsx` — FactionPanel lazy import, showFactionPanel state, PauseMenu Factions button + onOpenFactionPanel prop

## Decisions Made
- `factionVocab.js` word IDs are symbolic identifiers (not validated against corpus) — existing `fsrsCards[wordId]` guard prevents duplicates at dispatch time
- WorldState flags (`FACTION_*_FRIENDLY/TRUSTED/ALLIED`) used as idempotency guards — reward fires exactly once even if score oscillates around threshold
- FactionPanel sorted by score (highest first) via `selectFactionRanks` — shows player's primary faction at top
- `onOpenFactionPanel` prop threaded from GameLayout → PauseMenu — same pattern as wardrobe/path switch

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- FACT-06, FACT-01, FACT-03 complete
- Faction vocabulary rewards fire on threshold crossing; FactionPanel visible in-game via Pause Menu
- Plan 53-02 (NPC faction context + gossip) can now reference FactionPanel and vocab reward patterns
- Phase 54 (gossip/rumour system) can use FACTION_*_FRIENDLY flags as prerequisites for rumour unlock

---
*Phase: 53-faction-reputation-engine*
*Completed: 2026-03-20*

## Self-Check: PASSED

- FOUND: src/data/factionVocab.js
- FOUND: src/store/middleware/factionMiddleware.js
- FOUND: src/components/Faction/FactionPanel.jsx
- FOUND: src/components/Router/GameLayout.jsx
- FOUND: .planning/phases/53-faction-reputation-engine/53-03-SUMMARY.md
- FOUND commit: a83f086 (Task 1)
- FOUND commit: 46421ab (Task 2)
