---
phase: 30-companion-system
plan: 01
subsystem: companions
tags: [redux, indexeddb, redux-persist, companions, dialogue, phaser, relationships, teaching]

# Dependency graph
requires:
  - phase: 29-equipment-inventory-economy
    provides: IndexedDB nested persistReducer pattern for heavy slices
  - phase: 28-root-magic-elemental-affinity
    provides: magicSlice with IndexedDB persistence
  - phase: 27.1-indexeddb-migration
    provides: indexedDBAdapter and migration infrastructure
provides:
  - companionSlice with 12 companion entries, active party management (1 battle + 1 exploration), relationship tracking (0-100), gift system
  - 12 companion definitions covering all 6 zones, 4 battle roles, 4 teaching specialties with culturally appropriate faceless characters
  - 2,400+ contextual dialogue lines (200+ per companion) with Arabic, English, and transliteration
  - CEFR-based dialogue complexity scaling (A1=20% Arabic → C2=95% Arabic with immersion mode at C1+)
  - Relationship tier mapping (0-100 → 5 tiers) with battle bonuses and gift calculation
  - 12 new COMPANION_* EventBus events (recruited, dismissed, party-changed, gift-given, etc.)
affects: [30-02-companion-battle-ai, 30-03-companion-phaser-integration, 30-04-companion-react-ui, 30-05-companion-tests]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Nested persistReducer for heavy slices (IndexedDB) - 5th slice using this pattern"
    - "CEFR-based dialogue scaling for adaptive language learning"
    - "Relationship tier mapping with battle performance multipliers"
    - "Culturally appropriate companion design (faceless, Islamic art principles)"

key-files:
  created:
    - src/store/slices/companionSlice.js
    - src/data/companions.js
    - src/data/companionDialogue.js
    - src/utils/dialogueComplexity.js
    - src/utils/companionRelationship.js
  modified:
    - src/store/store.js
    - src/utils/eventBusTypes.js
    - src/test/testUtils.jsx

key-decisions:
  - "companionSlice uses IndexedDB nested persistReducer at 'gogo-arabic-companions' (same pattern as vocabulary/battle/magic/inventory)"
  - "12 companions initialized in initial state with recruited=false (all start unrecruited)"
  - "Active party has 2 slots: battle (for combat) and exploration (for world following)"
  - "A companion can only fill ONE slot at a time - setting in one slot clears the other"
  - "Relationship tracking uses 0-100 scale mapped to 5 tiers (stranger/acquaintance/friend/closeFriend/bestFriend)"
  - "Battle bonuses scale from 0% (stranger) to 20% (bestFriend) for companion damage/healing"
  - "Gift bonuses: 1.5x relationship gain for preferred gifts (defined in companion.preferredGifts array)"
  - "Dialogue history keeps last 50 entries per companion (FIFO)"
  - "CEFR dialogue scaling: A1-B1 (English primary), B1+ (Arabic primary), C1+ (Arabic only, immersion mode)"
  - "Transliteration shown only below B2 (ratio < 0.7) to aid pronunciation learning"
  - "All timestamps passed via action payloads (never Date.now() in reducers)"
  - "12 new COMPANION_* events follow strict source:category:action namespacing"

patterns-established:
  - "IndexedDB nested persistReducer: 5th usage (vocabulary, battle, magic, inventory, companions)"
  - "CEFR_ARABIC_RATIOS frozen object: deterministic dialogue scaling based on player proficiency"
  - "Relationship tier system: 0-100 score → named tier → battle bonus multiplier"
  - "Companion dialogue structure: greetings + zone_comments + object_comments + battle_comments + teaching + relationship + idle"
  - "Dialogue line format: {id, arabic, english, transliteration, trigger/context} for all 2,400+ lines"

# Metrics
duration: 19min
completed: 2026-02-13
---

# Phase 30 Plan 01: Companion Data Foundation Summary

**companionSlice with IndexedDB persistence managing 12 companions across 6 zones, 4 battle roles, and 4 teaching specialties; 2,400+ contextual dialogue lines with CEFR-based Arabic/English scaling; relationship tier system with battle bonuses**

## Performance

- **Duration:** 19 min
- **Started:** 2026-02-12T23:43:43Z
- **Completed:** 2026-02-13T00:02:30Z
- **Tasks:** 2
- **Files created:** 5
- **Files modified:** 3

## Accomplishments
- companionSlice with 9 reducers and 6 selectors managing 12 companions, active party (battle + exploration slots), relationships (0-100), gifting, and battle stats
- 12 culturally appropriate faceless companion definitions spanning all 6 zones (2 per zone), 4 battle roles (healer/attacker/defender/support, 3 of each), and 4 teaching specialties (grammar/vocabulary/pronunciation/culture, 3 of each)
- 2,400+ contextual dialogue lines (200+ per companion) with Arabic, English, and transliteration covering greetings, zone comments, object reactions, battle reviews, teaching moments, relationship tiers, and idle chatter
- CEFR-based dialogue complexity scaler enabling adaptive language learning (A1=20% Arabic → C2=95% Arabic, immersion mode at C1+, transliteration only below B2)
- Relationship tier mapper converting 0-100 scores to 5 named tiers with battle bonuses (0% stranger → 20% bestFriend)
- 12 new COMPANION_* EventBus events for recruitment, party changes, gifts, contextual comments, battle actions, following, and mood shifts

## Task Commits

Each task was committed atomically:

1. **Task 1: Create companionSlice, wire into store with IndexedDB persistence, add EventBus events, update testUtils** - `8ff4528` (feat)
2. **Task 2: Create companion data (12 definitions), dialogue lines (2,400+), and utility functions** - `87522a1` (feat)

## Files Created/Modified

**Created:**
- `src/store/slices/companionSlice.js` - Redux slice with 9 reducers (recruitCompanion, setActiveCompanion, removeActiveCompanion, giveGift, updateRelationship, setCompanionMood, recordDialogueLine, updateCompanionLevel, clearBattleCompanionState) and 6 selectors (selectAllCompanions, selectCompanion, selectActiveParty, selectRecruitedCompanions, selectCompanionRelationship, selectCompanionsByZone); 12 companion entries initialized with recruited=false; active party with battle/exploration slots; relationship tracking (0-100); gift history; dialogue history (last 50); battle stats
- `src/data/companions.js` - 12 companion definitions with unique personalities, Arabic names, battle roles, teaching specialties, preferred gifts, zone assignments, recruit conditions, base stats, sprite keys, and color palettes; COMPANION_ROLES, TEACHING_SPECIALTIES, GIFT_CATEGORIES constants; getCompanion() and getCompanionsByZone() utilities
- `src/data/companionDialogue.js` - 2,400+ dialogue lines (200+ per companion) with arabic/english/transliteration fields; structure: greetings (11+), zone_comments (45-60 per companion across 3-4 zones), object_comments (20+), battle_comments (15+), teaching (30+ per specialty), relationship (15 total: 5 low, 5 medium, 5 high), idle (15+); getDialogueForContext(), getTeachingDialogue(), getZoneDialogue() utilities
- `src/utils/dialogueComplexity.js` - CEFR_ARABIC_RATIOS (A1=0.2 → C2=0.95); getArabicRatio(); scaleDialogueComplexity() returns {primary, secondary, showTransliteration, isArabicPrimary} based on CEFR level; deterministic (no Math.random); C1+ immersion mode (secondary=null); transliteration only below B2
- `src/utils/companionRelationship.js` - RELATIONSHIP_TIERS (stranger 0-19, acquaintance 20-39, friend 40-59, closeFriend 60-79, bestFriend 80-100) with Arabic labels and battle bonuses (0%, 5%, 10%, 15%, 20%); getRelationshipTier(); getGiftBonus() with 1.5x multiplier for preferred gifts; getRelationshipMultiplier() for battle damage/healing scaling

**Modified:**
- `src/store/store.js` - Added companionReducer import, companionPersistConfig for IndexedDB ('gogo-arabic-companions'), persistedCompanionReducer wrapping, companions added to rootReducer (IndexedDB nested); updated Version 4 comment to mention companions (IndexedDB)
- `src/utils/eventBusTypes.js` - Added 12 new COMPANION_* events (COMPANION_RECRUITED, COMPANION_DISMISSED, COMPANION_PARTY_CHANGED, COMPANION_GIFT_GIVEN, COMPANION_RELATIONSHIP_UP, COMPANION_CONTEXTUAL_COMMENT, COMPANION_BATTLE_ACTION, COMPANION_BATTLE_TURN_START, COMPANION_BATTLE_TURN_END, COMPANION_FOLLOW_START, COMPANION_FOLLOW_STOP, COMPANION_MOOD_CHANGED); total events now 74 (62 existing + 12 new)
- `src/test/testUtils.jsx` - Added companionReducer import and companions: companionReducer to test store rootReducer

## Decisions Made

**IndexedDB Persistence:**
- companionSlice uses nested persistReducer with IndexedDB storage at key 'gogo-arabic-companions' (5th slice using this pattern after vocabulary, battle, magic, inventory)
- Version 4 storage migration comment updated to reflect companions on IndexedDB
- companions NOT added to root persistConfig whitelist (uses nested IndexedDB persistence)

**Active Party Design:**
- 2 slots: `battle` (companion participates in BattleScene) and `exploration` (companion follows in WorldScene)
- A companion can only fill ONE slot at a time - setActiveCompanion clears the other slot if same companion is already active elsewhere
- This prevents duplicate rendering and conflicting AI states

**Relationship System:**
- 0-100 scale mapped to 5 tiers (stranger/acquaintance/friend/closeFriend/bestFriend)
- Battle bonuses scale linearly: 0% (stranger) → 5% (acquaintance) → 10% (friend) → 15% (closeFriend) → 20% (bestFriend)
- Gift bonuses: base gain from GIFT_CATEGORIES, 1.5x multiplier if gift category is in companion's preferredGifts array
- Mood increases by 10 on gift (clamped 0-100), affects dialogue tone in future plans

**Dialogue Complexity Scaling:**
- CEFR levels A1-C2 map to Arabic ratios (0.2 → 0.95)
- A1-B1 (ratio < 0.6): English primary, Arabic secondary, show transliteration
- B1 (ratio = 0.6): Arabic primary, English secondary, show transliteration
- B2 (ratio = 0.7): Arabic primary, English secondary, NO transliteration
- C1+ (ratio >= 0.8): Arabic primary ONLY (secondary=null), immersion mode, NO transliteration
- Deterministic output (no Math.random) ensures consistent display per CEFR level

**Companion Coverage:**
- All 6 zones covered (2 companions per zone)
- All 4 battle roles balanced (3 healers, 3 attackers, 3 defenders, 3 supports)
- All 4 teaching specialties balanced (3 grammar, 3 vocabulary, 3 pronunciation, 3 culture)
- Mix of formality levels (formal: 7, casual: 5) and patience levels (high: 7, medium: 4, low: 1)
- All companions have Arabic names, catchphrases, distinct color palettes for visual recognition

**Timestamps in Reducers:**
- All timestamps passed via action payloads (giveGift, recordDialogueLine)
- Never use Date.now() in reducers (violates Redux serializability)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed successfully on first attempt. Build succeeded with zero errors. Imports resolved correctly. IndexedDB nested persistReducer pattern worked as expected.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 30 Plan 02 (Companion Battle AI):**
- companionSlice provides battle companion state (activeParty.battle, battleStats, level, relationship)
- Relationship tier system provides battle bonus multipliers (0-20%)
- COMPANION_BATTLE_ACTION, COMPANION_BATTLE_TURN_START, COMPANION_BATTLE_TURN_END events ready for BattleScene integration
- Companion data includes battleRole (healer/attacker/defender/support) for AI decision trees

**Ready for Phase 30 Plan 03 (Phaser Integration):**
- companionSlice provides exploration companion state (activeParty.exploration)
- COMPANION_FOLLOW_START, COMPANION_FOLLOW_STOP, COMPANION_CONTEXTUAL_COMMENT events ready for WorldScene
- Companion data includes spriteKey, zone assignment, color palettes for sprite rendering
- Zone comments (45-60 per companion) ready for contextual dialogue triggers

**Ready for Phase 30 Plan 04 (React UI):**
- selectAllCompanions, selectRecruitedCompanions, selectActiveParty selectors ready for UI components
- Relationship tier system provides UI labels (stranger/acquaintance/friend/closeFriend/bestFriend in English + Arabic)
- Dialogue complexity scaler ready for CompanionDialogue component
- Gift system reducers (giveGift, updateRelationship) ready for GiftingUI

**Ready for Phase 30 Plan 05 (Tests):**
- All 9 reducers ready for unit tests
- All 6 selectors ready for selector tests
- dialogueComplexity.js and companionRelationship.js pure functions ready for utility tests
- Companion data and dialogue files ready for data validation tests

**No Blockers.**

---
*Phase: 30-companion-system*
*Completed: 2026-02-13*
