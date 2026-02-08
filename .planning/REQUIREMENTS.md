# Requirements: GoGo Arabic

**Defined:** 2026-02-08
**Core Value:** Players naturally learn Arabic through guided exploration — never wondering "what should I do next?"

## v2.0 Requirements

Requirements for the UX overhaul milestone. Each maps to roadmap phases.

### Critical Fixes

- [ ] **CRIT-01**: Pause menu renders above all other UI elements (z-index fix)
- [ ] **CRIT-02**: Quest log and quiz overlay are usable on mobile screens < 450px
- [ ] **CRIT-03**: All 9 overlays trap keyboard focus (useFocusTrap wired)
- [ ] **CRIT-04**: Review badge in HUD is clickable and opens review session

### Player Guidance

- [ ] **GUID-01**: NPCs with available quests show exclamation mark (!) above their head
- [ ] **GUID-02**: NPCs with completable quests show question mark (?) above their head
- [ ] **GUID-03**: HUD shows active quest name and current objective with progress
- [ ] **GUID-04**: Player sees directional indicator pointing toward quest objective

### Feature Discoverability

- [ ] **DISC-01**: Grammar, Roots, Reading, and Mini-Games are accessible from in-game menu
- [ ] **DISC-02**: Word Duel bosses are accessible through zone NPCs or world map
- [ ] **DISC-03**: Daily review sessions can be started from the game HUD
- [ ] **DISC-04**: Hidden features are mentioned by NPCs through contextual dialogue hints

### Performance

- [ ] **PERF-01**: Main JavaScript bundle is under 500KB (code splitting configured)
- [ ] **PERF-02**: Phaser, React, Framer Motion, and game data are in separate chunks
- [ ] **PERF-03**: HUD, MiniMap, and overlay components are memoized with React.memo
- [ ] **PERF-04**: All 12 Redux slices export memoized selectors

### Onboarding

- [ ] **ONBD-01**: New players see contextual tooltips pointing at actual UI elements
- [ ] **ONBD-02**: Onboarding progresses through gameplay actions, not button clicks
- [ ] **ONBD-03**: First quest NPC is visually highlighted with guidance arrow

### HUD Redesign

- [ ] **HUD-01**: Primary HUD shows only Level/XP, active quest, and 3-4 action buttons
- [ ] **HUD-02**: Secondary stats (words, dirhams, streak) are in collapsible panel
- [ ] **HUD-03**: Z-index tokens are standardized in CSS variables

### Architecture

- [ ] **ARCH-01**: GameLayout is split into sub-components under 200 lines each
- [ ] **ARCH-02**: EventBus listeners have complete cleanup (no memory leaks)
- [ ] **ARCH-03**: Remaining inline-styled overlays are migrated to CSS Modules
- [ ] **ARCH-04**: ESLint and Prettier are configured with pre-commit enforcement

### Testing

- [ ] **TEST-01**: Quest, achievement, and battle Redux slices have unit tests
- [ ] **TEST-02**: QuizOverlay, ReviewSession, and DialogueOverlay have component tests
- [ ] **TEST-03**: Achievement and daily goals middleware have unit tests
- [ ] **TEST-04**: Backend has test infrastructure with auth and sync flow tests
- [ ] **TEST-05**: E2E tests cover onboarding → learn word → review → level-up flow

### Backend

- [ ] **BACK-01**: VocabCard.due, Quest.status, and User.level have database indexes
- [ ] **BACK-02**: Sync resolveConflict uses atomic version check
- [ ] **BACK-03**: Client auth uses httpOnly cookies only (no localStorage JWT)
- [ ] **BACK-04**: Password requires minimum 8 characters with complexity rules

## v3.0 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Content Expansion

- **CONT-01**: Additional vocabulary categories beyond 1,220 words
- **CONT-02**: New zones beyond 8 current zones
- **CONT-03**: Building interiors that players can enter

### Advanced Features

- **ADV-01**: Refresh token flow with short-lived access tokens
- **ADV-02**: Achievement system moved to backend with server-side validation
- **ADV-03**: Field-level sync versioning (avoid conflicts on non-overlapping changes)
- **ADV-04**: Daily dashboard shown on game start

### Polish

- **POL-01**: Custom pixel-art icons replacing emoji in HUD
- **POL-02**: Progressive tashkeel fading (diacritics fade as word is learned)
- **POL-03**: Streak freeze shop item
- **POL-04**: Fast travel from world map

## Out of Scope

| Feature | Reason |
|---------|--------|
| TypeScript migration | Too large (40+ hours), not blocking UX issues |
| Multiplayer/real-time | High complexity, single-player educational focus |
| Mobile native app | Responsive web covers mobile use case |
| OAuth/social login | Email/password sufficient for learning app |
| Admin dashboard | Not user-facing, doesn't improve learning |
| New content (words, quests) | Fix discoverability of existing content first |
| Storybook component library | Nice-to-have, not blocking UX |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CRIT-01 | — | Pending |
| CRIT-02 | — | Pending |
| CRIT-03 | — | Pending |
| CRIT-04 | — | Pending |
| GUID-01 | — | Pending |
| GUID-02 | — | Pending |
| GUID-03 | — | Pending |
| GUID-04 | — | Pending |
| DISC-01 | — | Pending |
| DISC-02 | — | Pending |
| DISC-03 | — | Pending |
| DISC-04 | — | Pending |
| PERF-01 | — | Pending |
| PERF-02 | — | Pending |
| PERF-03 | — | Pending |
| PERF-04 | — | Pending |
| ONBD-01 | — | Pending |
| ONBD-02 | — | Pending |
| ONBD-03 | — | Pending |
| HUD-01 | — | Pending |
| HUD-02 | — | Pending |
| HUD-03 | — | Pending |
| ARCH-01 | — | Pending |
| ARCH-02 | — | Pending |
| ARCH-03 | — | Pending |
| ARCH-04 | — | Pending |
| TEST-01 | — | Pending |
| TEST-02 | — | Pending |
| TEST-03 | — | Pending |
| TEST-04 | — | Pending |
| TEST-05 | — | Pending |
| BACK-01 | — | Pending |
| BACK-02 | — | Pending |
| BACK-03 | — | Pending |
| BACK-04 | — | Pending |

**Coverage:**
- v2.0 requirements: 35 total
- Mapped to phases: 0
- Unmapped: 35

---
*Requirements defined: 2026-02-08*
*Last updated: 2026-02-08 after initial definition*
