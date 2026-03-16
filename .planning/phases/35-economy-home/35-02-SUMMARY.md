---
phase: 35-economy-home
plan: "02"
subsystem: npc
tags: [redux, middleware, friendship, npc, social-system]

# Dependency graph
requires:
  - phase: 33-world-zones
    provides: NPC system and npcSlice foundation
provides:
  - Per-NPC friendship state (0-100) in npcSlice with adjustFriendship/setFriendship reducers
  - Four friendship tiers: cold/cautious/friendly/close with threshold selectors
  - friendshipMiddleware auto-updating friendship from quiz answers, quest completions, and gifts
affects: [economy-home, companion-system, npc-dialogue, quest-rewards]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Friendship tiers via numeric threshold selectors (cold <25, cautious 25-49, friendly 50-74, close 75+)"
    - "Neutral start at 50 for all NPCs — established via adjustFriendship missing-key guard"
    - "Redux middleware pattern for cross-slice side effects (matches craftingVocabMiddleware pattern)"

key-files:
  created:
    - src/store/slices/friendshipMiddleware.js
  modified:
    - src/store/slices/npcSlice.js

key-decisions:
  - "Friendship neutral start is 50 (not 0) — players start with goodwill, negative actions push toward cold"
  - "adjustFriendship guard initializes missing npcId to 50 — no explicit init step needed at NPC spawn"
  - "friendshipMiddleware NOT wired to store yet — registration deferred to future plan"
  - "quests/completeQuest (not quest/completeQuest) — verified against slice name 'quests'"
  - "companions/giveGift (not companion/giveGift) — verified against slice name 'companions'"
  - "quiz/recordAnswer kept as-is — no quiz slice exists yet, this is a forward-looking listener"

patterns-established:
  - "Friendship middleware: listens to game events, dispatches adjustFriendship with npcId + delta + reason"
  - "Action type verification: always check slice name field to derive correct type string"

# Metrics
duration: 2min
completed: 2026-03-16
---

# Phase 35 Plan 02: Friendship System Summary

**Per-NPC friendship state (0-100) added to npcSlice with four tiers and a Redux middleware that auto-updates friendship from quiz answers, quest completions, and companion gifts**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-16T15:37:31Z
- **Completed:** 2026-03-16T15:39:10Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- npcSlice extended with `friendship: {}` map, `adjustFriendship` and `setFriendship` reducers
- Four friendship tiers via `selectFriendshipTier` selector (cold/cautious/friendly/close at 25/50/75 thresholds)
- `friendshipMiddleware` created listening to quiz answers, quest completions, and gifts — ready to wire into store

## Task Commits

Each task was committed atomically:

1. **Task 1: Add friendship state to npcSlice** - `4da58aa` (feat)
2. **Task 2: Create friendshipMiddleware** - `772d919` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `src/store/slices/npcSlice.js` - Added friendship initialState, adjustFriendship/setFriendship reducers, selectFriendship/selectFriendshipTier/selectAllFriendships selectors
- `src/store/slices/friendshipMiddleware.js` - New Redux middleware: FRIENDSHIP_DELTAS map, listens to quiz/quest/gift events, dispatches adjustFriendship

## Decisions Made
- Neutral start at 50 (not 0): players begin on good terms with all NPCs, rewards are above 50, failures push below
- `adjustFriendship` guard initializes missing key to 50 — no spawn-time init needed
- Middleware not wired to store yet — store registration deferred to future plan to avoid partial wiring
- Action type strings verified against actual slice names: `quests/completeQuest` and `companions/giveGift`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected action type strings for quest and companion slices**
- **Found during:** Task 2 (Create friendshipMiddleware)
- **Issue:** Plan specified `quest/completeQuest` and `companion/giveGift` but actual slice names are `quests` and `companions`, making the action types `quests/completeQuest` and `companions/giveGift`
- **Fix:** Used verified action type strings in friendshipMiddleware.js
- **Files modified:** src/store/slices/friendshipMiddleware.js
- **Verification:** Strings match slice `name:` fields in questSlice.js and companionSlice.js
- **Committed in:** `772d919` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — incorrect action type strings)
**Impact on plan:** Essential fix; using wrong action types would silently fail to trigger friendship updates on quest completions and gifts.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Friendship state ready for consumption by NPC dialogue, shop discounts, and quest unlock systems
- friendshipMiddleware needs to be added to store.js middleware chain when ready to activate
- selectFriendshipTier selector ready for use in DialogueEngine, ShopOverlay, and QuestManager

---
*Phase: 35-economy-home*
*Completed: 2026-03-16*

## Self-Check: PASSED

- FOUND: src/store/slices/npcSlice.js
- FOUND: src/store/slices/friendshipMiddleware.js
- FOUND: .planning/phases/35-economy-home/35-02-SUMMARY.md
- FOUND commit: 4da58aa (Task 1)
- FOUND commit: 772d919 (Task 2)
