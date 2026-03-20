---
phase: 53-faction-reputation-engine
plan: 01
subsystem: faction-system
tags: [faction, redux, middleware, indexeddb, persistence, migration]
dependency_graph:
  requires:
    - src/store/slices/factionSlice.js (pre-existing)
    - src/data/factions.js (pre-existing)
    - src/store/store.js (pre-existing)
    - src/services/storage/migrations.js (pre-existing)
    - src/store/middleware/achievementMiddleware.js (pattern reference)
    - src/services/storage/indexedDBAdapter.js (pre-existing)
  provides:
    - FACTION_TIERS constant (Neutral/Friendly/Trusted/Allied/Revered with Arabic labels)
    - getFactionTier(score) helper
    - NPC_FACTION_MAP reverse lookup
    - selectFactionTiers memoized selector
    - factionMiddleware auto-adjustment on game events
    - Faction state persisted to IndexedDB (nested persistReducer)
    - Migration v9 cleans old localStorage faction data
  affects:
    - All components reading faction state (now IndexedDB-backed)
    - quest/completeQuest, economy/recordPurchase, narrative/recordDialogueChoice, npc/updateFriendship action handlers
tech_stack:
  added: []
  patterns:
    - Nested persistReducer for IndexedDB (matches vocabulary/battle/magic/etc pattern)
    - Re-entrancy guard with module-level flag (matches achievementMiddleware pattern)
    - Quest prefix map for faction routing (new pattern)
key_files:
  created:
    - src/store/middleware/factionMiddleware.js
  modified:
    - src/data/factions.js
    - src/store/slices/factionSlice.js
    - src/store/store.js
    - src/services/storage/migrations.js
decisions:
  - "FACTION_TIERS as Object.freeze with threshold + label + labelArabic — consistent with other constant patterns in codebase"
  - "NPC_FACTION_MAP derived from npcMembers arrays in FACTIONS — single source of truth, no duplication"
  - "factionMiddleware last in chain after worldStateMiddleware — consistent with project ordering convention"
  - "faction removed from localStorage whitelist, added as nested IndexedDB persistReducer — matches worldState Phase 50 migration pattern"
  - "QUEST_FACTION_MAP uses string prefix matching — simple O(prefixes) lookup, no external data dependency"
metrics:
  duration: "2 minutes"
  completed: "2026-03-20"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 53 Plan 01: Faction Core Data Layer Summary

**One-liner:** Faction tier constants (Neutral→Revered), 0-100 score clamp, IndexedDB persistence, and auto-adjustment middleware firing on quest/purchase/dialogue/NPC events via prefix-based faction routing.

## What Was Built

### Task 1: factions.js tier constants + factionSlice clamp + selectFactionTiers selector

Added three exports to `src/data/factions.js` after the existing `FACTION_BY_ID`:

- `FACTION_TIERS` — frozen object with 5 tier levels: Neutral (0), Friendly (25), Trusted (50), Allied (75), Revered (100). Each tier has English label, Arabic label, and threshold score.
- `getFactionTier(score)` — helper that takes a 0-100 score and returns the matching `FACTION_TIERS` entry.
- `NPC_FACTION_MAP` — frozen reverse-lookup map derived from `FACTIONS[*].npcMembers`, enabling O(1) npcId → factionId resolution.

Updated `src/store/slices/factionSlice.js`:

- Import updated to include `getFactionTier` from factions.js.
- `adjustAlignment` reducer: clamp changed from `Math.max(0, score + amount)` to `Math.max(0, Math.min(100, score + amount))` — enforces 100 ceiling.
- `selectFactionTiers` memoized selector added (via `createSelector`) — maps each factionId to its current tier object.

### Task 2: factionMiddleware + IndexedDB persistence + migration v9

Created `src/store/middleware/factionMiddleware.js`:

- Follows `achievementMiddleware` pass-through-first pattern with module-level re-entrancy guard.
- Skips `persist/` internal actions to avoid redux-persist interference.
- Four event handlers:
  - `quests/completeQuest` → QUEST_FACTION_MAP prefix lookup → +10 points
  - `economy/recordPurchase` (with factionId in payload) → +5 points
  - `narrative/recordDialogueChoice` (with factionId in payload) → +3 points (or payload.factionAmount if specified)
  - `npc/updateFriendship` → NPC_FACTION_MAP lookup → +2 points
- QUEST_FACTION_MAP covers 12 quest prefixes mapping to all 6 factions.

Updated `src/services/storage/migrations.js`:

- `CURRENT_VERSION` bumped from 8 to 9.
- Migration 9 added: schedules cleanup of old `localStorage['persist:gogo-arabic'].faction` key after 5s delay.

Updated `src/store/store.js`:

- Import added for `factionMiddleware`.
- `factionPersistConfig` added (key: `gogo-arabic-faction`, IndexedDB storage).
- `persistedFactionReducer` created via `persistReducer(factionPersistConfig, factionReducer)`.
- `faction` key in `combineReducers` changed from `factionReducer` to `persistedFactionReducer`.
- `'faction'` removed from root `persistConfig.whitelist`.
- `factionMiddleware` appended to middleware chain after `worldStateMiddleware`.
- Storage architecture comment updated to document v9/Phase 53.

## Verification Results

All plan-specified checks pass:

| Check | Result |
|-------|--------|
| `grep 'FACTION_TIERS' src/data/factions.js` | 6 matches |
| `grep 'getFactionTier' src/data/factions.js` | 1 match |
| `grep 'NPC_FACTION_MAP' src/data/factions.js` | 1 match |
| `grep 'Math.min(100' src/store/slices/factionSlice.js` | 1 match |
| `grep 'selectFactionTiers' src/store/slices/factionSlice.js` | 1 match |
| `grep 'CURRENT_VERSION = 9' src/services/storage/migrations.js` | 1 match |
| `grep 'factionMiddleware' src/store/store.js` | 2 matches (import + concat) |
| `grep 'persistedFactionReducer' src/store/store.js` | 2 matches (config + combineReducers) |
| `grep -c "'faction'" src/store/store.js` (whitelist) | 0 |
| `npm run build` | Exit code 0, built in 4.46s |

## Commits

| Task | Commit | Message |
|------|--------|---------|
| Task 1 | e0d81e6 | feat(53-01): add FACTION_TIERS, getFactionTier, NPC_FACTION_MAP; clamp scores 0-100; add selectFactionTiers selector |
| Task 2 | 002695c | feat(53-01): create factionMiddleware, wire IndexedDB persistence, migration v9 |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- [x] `src/data/factions.js` exists and exports FACTION_TIERS, getFactionTier, NPC_FACTION_MAP
- [x] `src/store/slices/factionSlice.js` has Math.min(100 clamp and selectFactionTiers
- [x] `src/store/middleware/factionMiddleware.js` exists and exports factionMiddleware
- [x] `src/services/storage/migrations.js` has CURRENT_VERSION = 9
- [x] `src/store/store.js` has factionMiddleware (2 refs), persistedFactionReducer (2 refs), factionPersistConfig, no 'faction' in whitelist
- [x] Commits e0d81e6 and 002695c exist in git log
- [x] Build passes (✓ built in 4.46s)
