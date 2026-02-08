# Roadmap: GoGo Arabic

## Overview

Transform GoGo Arabic from a feature-rich but navigable-poor experience into a polished, guided learning RPG. This milestone addresses critical UX gaps identified by comprehensive audit: adding player guidance systems, exposing hidden features, fixing accessibility violations, optimizing performance, and hardening code quality. Phases progress from immediate bug fixes through user-facing guidance, performance optimization, and infrastructure improvements.

## Milestones

- 🚧 **v2.0 Comprehensive UX Overhaul** - Phases 1-8 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Critical Fixes** - Fix z-index bugs, mobile overflow, focus traps, HUD review button
- [ ] **Phase 2: Player Guidance** - NPC quest markers, active objective display, quest compass
- [ ] **Phase 3: Feature Discoverability** - Expose hidden features through in-game UI
- [ ] **Phase 4: Performance Optimization** - Bundle splitting and component memoization
- [ ] **Phase 5: Onboarding & HUD Redesign** - Contextual tooltips and streamlined HUD
- [ ] **Phase 6: Architecture Cleanup** - Refactor GameLayout, add linting, clean up EventBus
- [ ] **Phase 7: Testing** - Add unit, component, middleware, backend, and E2E tests
- [ ] **Phase 8: Backend Hardening** - Database indexes, sync fixes, auth improvements

## Phase Details

### Phase 1: Critical Fixes
**Goal**: Fix high-impact bugs blocking basic usability and accessibility
**Depends on**: Nothing (first phase)
**Requirements**: CRIT-01, CRIT-02, CRIT-03, CRIT-04
**Success Criteria** (what must be TRUE):
  1. Pause menu renders above MiniMap and all other UI elements
  2. Quest log and quiz overlays are fully usable on screens down to 375px width
  3. All 9 overlays (dialogue, quiz, quest log, achievements, goals, sign, level-up, shop, onboarding) trap keyboard focus and prevent Tab escaping
  4. Review badge in HUD opens review session when clicked
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Z-index tokens + clickable review badge (CRIT-01, CRIT-04)
- [ ] 01-02-PLAN.md — Responsive overlay migration + focus traps (CRIT-02, CRIT-03)

### Phase 2: Player Guidance
**Goal**: Eliminate "what do I do next?" confusion through visual guidance systems
**Depends on**: Phase 1
**Requirements**: GUID-01, GUID-02, GUID-03, GUID-04
**Success Criteria** (what must be TRUE):
  1. NPCs with available quests show exclamation mark (!) above their heads
  2. NPCs with completable quests show question mark (?) above their heads
  3. HUD displays active quest name with current objective and progress (e.g., "Village Explorer: Talk to Fatima 1/3")
  4. Player sees directional compass arrow pointing toward active quest objective location
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Feature Discoverability
**Goal**: Surface hidden features so players discover Grammar, Roots, Reading, Battles, and Reviews
**Depends on**: Phase 2
**Requirements**: DISC-01, DISC-02, DISC-03, DISC-04
**Success Criteria** (what must be TRUE):
  1. Grammar lessons, Roots explorer, Reading passages, and Mini-Games are accessible through pause menu or in-game Activities button
  2. Word Duel boss battles are accessible through zone NPCs or world map interface
  3. Review sessions can be started by clicking the review badge in game HUD
  4. At least 3 NPCs mention hidden features through contextual dialogue hints
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: Performance Optimization
**Goal**: Reduce main bundle size from 2.8MB to under 500KB and eliminate unnecessary re-renders
**Depends on**: Phase 3
**Requirements**: PERF-01, PERF-02, PERF-03, PERF-04
**Success Criteria** (what must be TRUE):
  1. Main JavaScript bundle is under 500KB after gzip
  2. Phaser, React/Redux, Framer Motion, and game data load as separate chunks
  3. HUD, MiniMap, QuestLog, and all overlay components use React.memo to prevent unnecessary re-renders
  4. All 12 Redux slices (player, vocabulary, quests, ui, alphabet, settings, npc, sync, achievements, battle, dailyGoals, grammar) export memoized selectors using createSelector
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Onboarding & HUD Redesign
**Goal**: Replace static onboarding slideshow with contextual guidance and reduce HUD information overload
**Depends on**: Phase 4
**Requirements**: ONBD-01, ONBD-02, ONBD-03, HUD-01, HUD-02, HUD-03
**Success Criteria** (what must be TRUE):
  1. New players see contextual tooltips pointing at actual UI elements (HUD, first NPC, dialogue interface) instead of static overlay
  2. Onboarding progresses through gameplay actions (moving, talking to NPC, completing word) not button clicks
  3. First quest NPC has visual highlight with guidance arrow during onboarding
  4. Primary HUD shows only Level/XP bar, active quest objective, and 3-4 essential action buttons
  5. Secondary stats (words learned, dirhams, streak count) are in collapsible panel that can be expanded/collapsed
  6. Z-index values are standardized using CSS custom properties in variables.css (no magic numbers)
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: Architecture Cleanup
**Goal**: Refactor god components, enforce code consistency, and eliminate memory leak risks
**Depends on**: Phase 5
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04
**Success Criteria** (what must be TRUE):
  1. GameLayout is split into sub-components (GameHUD, GameOverlays, GameDialogue) each under 200 lines
  2. All EventBus listeners in useBattle, useDialogue, and other hooks have matching cleanup in useEffect returns
  3. All remaining inline-styled overlay components (QuestLog, QuizOverlay, etc.) are migrated to CSS Modules with responsive breakpoints
  4. ESLint and Prettier are configured with pre-commit hooks enforcing code standards
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

### Phase 7: Testing
**Goal**: Establish test infrastructure and cover critical user paths with automated tests
**Depends on**: Phase 6
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04, TEST-05
**Success Criteria** (what must be TRUE):
  1. Quest, achievement, and battle Redux slices have unit tests covering state mutations and selectors
  2. QuizOverlay, ReviewSession, and DialogueOverlay have React Testing Library component tests
  3. Achievement middleware and daily goals middleware have unit tests verifying auto-unlock logic
  4. Backend has test infrastructure with passing tests for auth flows and sync conflict resolution
  5. E2E Playwright tests cover critical user journey: onboarding → learn word → review → level-up
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

### Phase 8: Backend Hardening
**Goal**: Improve database performance, fix sync race conditions, and strengthen auth security
**Depends on**: Phase 7
**Requirements**: BACK-01, BACK-02, BACK-03, BACK-04
**Success Criteria** (what must be TRUE):
  1. Database indexes exist on VocabCard.due, Quest.status, and User.level fields
  2. Sync resolveConflict endpoint uses atomic version checks to prevent race conditions
  3. Client removes localStorage JWT and uses httpOnly cookies exclusively for authentication
  4. Password validation requires minimum 8 characters with at least one uppercase, one lowercase, one number, and one special character
**Plans**: TBD

Plans:
- [ ] 08-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Critical Fixes | 0/2 | Planning complete | - |
| 2. Player Guidance | 0/0 | Not started | - |
| 3. Feature Discoverability | 0/0 | Not started | - |
| 4. Performance Optimization | 0/0 | Not started | - |
| 5. Onboarding & HUD Redesign | 0/0 | Not started | - |
| 6. Architecture Cleanup | 0/0 | Not started | - |
| 7. Testing | 0/0 | Not started | - |
| 8. Backend Hardening | 0/0 | Not started | - |

---
*Roadmap created: 2026-02-08*
*Last updated: 2026-02-08*
