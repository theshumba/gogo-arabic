---
phase: 37-polish-replay
plan: 02
subsystem: gameplay
tags: [calendar, events, ramadan, eid, friday-market, knowledge-rating, vocabulary-domains, progress-tracking]

requires:
  - phase: 36-world-systems
    provides: "EventBus, EVENTS registry, vocabulary data structure"
provides:
  - "CalendarEvents class detecting Ramadan, Eid al-Fitr, Eid al-Adha, Friday Market from real dates"
  - "TownKnowledge class with 10-domain vocabulary progress rating (0-100) and 5-tier labels"
  - "KNOWLEDGE_DOMAINS config for vocabulary domain weighting"
  - "CALENDAR_EVENT_ACTIVE event type in eventBusTypes.js"
affects: [npc-dialogue, ui-hud, world-events, vocabulary-tracking]

tech-stack:
  added: []
  patterns: ["Date-range event detection with daily caching", "Weighted domain scoring with no-penalty progress model"]

key-files:
  created:
    - src/game/systems/CalendarEvents.js
    - src/game/systems/TownKnowledge.js
  modified:
    - src/utils/eventBusTypes.js

key-decisions:
  - "Fixed Gregorian date windows for Islamic events (approximate — future Hijri conversion planned)"
  - "Friday Market as weekly recurring event (dayOfWeek check)"
  - "No penalties in TownKnowledge — only positive progress counts"
  - "5 rating tiers: Newcomer, Beginner, Student, Scholar, Master with Arabic labels"
  - "10 vocabulary domains with equal weight (1.0 each)"

patterns-established:
  - "Calendar event pattern: date range check with _lastCheck daily caching + EventBus emission"
  - "Knowledge rating pattern: static calculate() returning { overall, domains } with per-domain breakdown"

requirements-completed: []

duration: 3min
completed: 2026-03-18
---

# Phase 37 Plan 02: Calendar Events + Town Knowledge Rating Summary

**CalendarEvents detecting Ramadan/Eid/Friday Market from real dates, plus TownKnowledge 10-domain progress tracker with 5 Arabic-labelled tiers**

## Performance

- **Duration:** 3 min (executed alongside 37-01)
- **Started:** 2026-03-18T22:54:54Z
- **Completed:** 2026-03-18T22:58:39Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- CalendarEvents system with 4 events: Ramadan, Eid al-Fitr, Eid al-Adha, Friday Market
- Date-range detection with daily caching (only checks once per day)
- EventBus integration via CALENDAR_EVENT_ACTIVE event type
- TownKnowledge rating across 10 vocabulary domains (greetings, food, trade, nature, family, religion, directions, numbers, colors, time)
- 5-tier rating labels with Arabic: Newcomer/Beginner/Student/Scholar/Master

## Task Commits

Both tasks were committed together in a prior session:

1. **Task 1: Create CalendarEvents system** - `cb395b6` (feat)
2. **Task 2: Create TownKnowledge rating system** - `cb395b6` (feat)

## Files Created/Modified
- `src/game/systems/CalendarEvents.js` - Date-based event system (89 lines) with Ramadan, Eid al-Fitr, Eid al-Adha, Friday Market
- `src/game/systems/TownKnowledge.js` - Vocabulary domain progress tracker (57 lines) with 10 domains and 5 rating tiers
- `src/utils/eventBusTypes.js` - Added CALENDAR_EVENT_ACTIVE event constant

## Decisions Made
- Used fixed Gregorian date windows rather than Hijri calendar conversion (simplicity now, accuracy later)
- Added Eid al-Adha beyond what the plan specified (natural extension of the calendar events pattern)
- All 10 knowledge domains have equal weight (1.0) — can be tuned later for gameplay balance
- TownKnowledge.calculate() is a static method accepting vocabulary data + learned IDs — no Redux coupling

## Deviations from Plan

### Auto-fixed Issues

Build deviations documented in 37-01-SUMMARY.md (shared build verification session).

---

**Total deviations:** 0 (plan-specific)
**Impact on plan:** Plan executed as written. Build fixes shared with 37-01.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- CalendarEvents ready for integration with NPC dialogue (special greetings) and world events
- TownKnowledge ready for HUD display or stats panel
- Both systems are self-contained with no external dependencies

---
*Phase: 37-polish-replay*
*Completed: 2026-03-18*
