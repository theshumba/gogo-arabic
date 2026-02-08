# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-08)

**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"
**Current focus:** Phase 2 - Player Guidance (COMPLETE)

## Current Position

Phase: 3 of 9 (Feature Discoverability) — IN PROGRESS
Plan: 2 of 3 completed
Status: Phase 3 in progress - NPC feature hints implemented
Last activity: 2026-02-08 — Completed 03-02-PLAN.md (NPC feature hints)

Progress: [█████░░░░░] 50% (5/10 plans complete across all phases)

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: 3.8 minutes
- Total execution time: 0.32 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 - Critical Fixes | 2/2 | 9 min | 4.5 min |
| 02 - Player Guidance | 2/2 | 8 min | 4 min |
| 03 - Feature Discoverability | 2/3 | 2 min | 2 min |

**Recent Trend:**
- Last 5 plans: 01-02 (7 min), 02-01 (7 min), 02-02 (1 min), 03-02 (2 min)
- Trend: Consistent execution speed, Phase 3 maintaining velocity

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- CSS Modules for new components (consistency, responsive breakpoints, accessibility)
- useFocusTrap for all overlays (WCAG AA compliance, hook already exists)
- Phaser DOMOverlay for NPC markers (existing system, minimal overhead)
- Revised v2.0 to prioritize player-facing features (cut Architecture, Testing, Backend phases to v3.0)
- Added 5 new player-facing phases: Daily Dashboard, World Map Upgrade, Player Profile, Visual Polish, Outfit System
- Outfit sprites to be AI-generated
- Bundle splitting (PERF-01) folded into Phase 4 (Onboarding & HUD)

**From 01-01 execution:**
- Set --z-pause-menu to 200 (overlay tier) instead of 50 - pause menu is functionally a full-screen overlay
- Top-level z-index tokens only (internal component z-index stays literal) - prevents over-engineering
- EventBus pattern for review navigation (consistent with existing alphabet/map patterns)

**From 01-02 execution:**
- CSS Modules pattern for overlays: width:100% + max-width (not minWidth) for responsive behavior
- useFocusTrap strategy: pass null for onEscape when existing Escape handler present (avoid duplicate handling)
- Hooks with early returns: use conditional active parameter (!!signData, !!reward) instead of conditional hook call
- Responsive breakpoints: 768px (tablet), 480px (mobile) with 44px touch targets on mobile

**From 02-01 execution:**
- Quest marker depth 10000 (above name label 9999, hint text 9999) for visibility
- Memoized selectors (createSelector) for Phaser-accessed Redux state prevent per-frame recalculation
- Auto-select first active quest on initialization and when tracked quest completes (reduces player friction)
- Quest marker priority system: turn-in marker (green ?) takes precedence over available marker (golden !) for same NPC
- Phaser Redux integration pattern: store.getState() in game loop (can't use React hooks in Phaser classes)

**From 02-02 execution:**
- Throttle player position updates to ~10Hz (every 6 frames) to avoid spamming React with 60fps updates
- Hide compass when objective is within 128px (2 tiles) - player is already close enough
- CSS transform for compass rotation with 0.15s transition for smooth rotation
- Phaser EventBus throttling pattern: Frame counter % N for controlled update rate
- Distance-based UI visibility: Show compass only when objective is far enough to need guidance

**From 03-02 execution:**
- Hint dialogue trees use trigger "hint" (never auto-selected by pickDialogueTree, only reachable via player choice)
- NPC hint selection based on thematic fit: scholar=grammar, librarian=roots, storyteller=reading, merchant=mini-games
- 3-line hint structure: introduction → benefit → explicit access instructions (pause menu → Activities)

### Pending Todos

None yet.

### Blockers/Concerns

- Phases 8-9 (Visual Polish, Outfits) depend on pixel art assets — AI generation quality TBD

## Session Continuity

Last session: 2026-02-08
Stopped at: Completed 03-02-PLAN.md (NPC feature hints)
Resume file: .planning/phases/03-feature-discoverability/03-02-SUMMARY.md

---
*State initialized: 2026-02-08*
*Last updated: 2026-02-08 18:18 UTC*
