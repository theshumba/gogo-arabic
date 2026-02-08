# Requirements: GoGo Arabic

**Defined:** 2026-02-08
**Revised:** 2026-02-08 — Shifted to player-facing features, moved infrastructure to v3.0
**Core Value:** Players naturally learn Arabic through guided exploration — never wondering "what should I do next?"

## v2.0 Requirements

Player-facing UX overhaul with new features. Infrastructure work deferred to v3.0.

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

### Onboarding & HUD

- [ ] **ONBD-01**: New players see contextual tooltips pointing at actual UI elements
- [ ] **ONBD-02**: Onboarding progresses through gameplay actions, not button clicks
- [ ] **ONBD-03**: First quest NPC is visually highlighted with guidance arrow
- [ ] **HUD-01**: Primary HUD shows only Level/XP, active quest, and 3-4 action buttons
- [ ] **HUD-02**: Secondary stats (words, dirhams, streak) are in collapsible panel
- [ ] **HUD-03**: Z-index tokens are standardized in CSS variables
- [ ] **PERF-01**: Main JavaScript bundle is under 500KB (code splitting configured)

### Daily Dashboard

- [ ] **DASH-01**: Game shows a dashboard on startup with streak count, words due for review, and daily goals progress
- [ ] **DASH-02**: Dashboard suggests next activity based on player state (review if words due, continue quest if mid-quest, explore if idle)
- [ ] **DASH-03**: Dashboard shows learning stats summary (words learned this week, accuracy trend)

### World Map Upgrade

- [ ] **WMAP-01**: Players can fast-travel to any previously visited zone from the world map
- [ ] **WMAP-02**: World map shows completion percentage for each zone (quests done, words learned, NPCs talked to)
- [ ] **WMAP-03**: Locked zones show teaser info (zone name, difficulty, what's needed to unlock)

### Player Profile & Stats

- [ ] **PROF-01**: Player profile page shows total words learned, accuracy rate, and time played
- [ ] **PROF-02**: Profile displays achievement showcase with pinned achievements
- [ ] **PROF-03**: Profile shows learning streak history and best streak record
- [ ] **PROF-04**: Profile is accessible from the game HUD or pause menu

### Visual Polish & Sprites

- [ ] **VPOL-01**: All NPC and player sprites follow a consistent pixel art style guide
- [ ] **VPOL-02**: HUD uses custom pixel-art icons instead of emoji/text
- [ ] **VPOL-03**: Learned words progressively fade diacritics (tashkeel) as mastery increases
- [ ] **VPOL-04**: Idle animations added to player and key NPCs

### Outfit System

- [ ] **OUTF-01**: Wardrobe UI accessible from pause menu showing available outfits
- [ ] **OUTF-02**: Players can purchase outfits using in-game currency (dirhams) from shop
- [ ] **OUTF-03**: Player sprite updates in real-time when outfit is changed
- [ ] **OUTF-04**: At least 5 distinct outfit options available at launch (AI-generated pixel art)

## v3.0 Requirements

Deferred to future milestone. Infrastructure + content expansion.

### Architecture

- **ARCH-01**: GameLayout is split into sub-components under 200 lines each
- **ARCH-02**: EventBus listeners have complete cleanup (no memory leaks)
- **ARCH-03**: Remaining inline-styled overlays are migrated to CSS Modules
- **ARCH-04**: ESLint and Prettier are configured with pre-commit enforcement

### Testing

- **TEST-01**: Quest, achievement, and battle Redux slices have unit tests
- **TEST-02**: QuizOverlay, ReviewSession, and DialogueOverlay have component tests
- **TEST-03**: Achievement and daily goals middleware have unit tests
- **TEST-04**: Backend has test infrastructure with auth and sync flow tests
- **TEST-05**: E2E tests cover onboarding -> learn word -> review -> level-up flow

### Backend

- **BACK-01**: VocabCard.due, Quest.status, and User.level have database indexes
- **BACK-02**: Sync resolveConflict uses atomic version check
- **BACK-03**: Client auth uses httpOnly cookies only (no localStorage JWT)
- **BACK-04**: Password requires minimum 8 characters with complexity rules

### Performance (remaining)

- **PERF-02**: Phaser, React, Framer Motion, and game data are in separate chunks
- **PERF-03**: HUD, MiniMap, and overlay components are memoized with React.memo
- **PERF-04**: All 12 Redux slices export memoized selectors

### Content Expansion

- **CONT-01**: Additional vocabulary categories beyond 1,220 words
- **CONT-02**: New zones beyond 8 current zones
- **CONT-03**: Building interiors that players can enter

### Advanced Features

- **ADV-01**: Refresh token flow with short-lived access tokens
- **ADV-02**: Achievement system moved to backend with server-side validation
- **ADV-03**: Field-level sync versioning (avoid conflicts on non-overlapping changes)

## Out of Scope

| Feature | Reason |
|---------|--------|
| TypeScript migration | Too large (40+ hours), not blocking UX issues |
| Multiplayer/real-time | High complexity, single-player educational focus |
| Mobile native app | Responsive web covers mobile use case |
| OAuth/social login | Email/password sufficient for learning app |
| Admin dashboard | Not user-facing, doesn't improve learning |
| Storybook component library | Nice-to-have, not blocking UX |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CRIT-01 | Phase 1 | Pending |
| CRIT-02 | Phase 1 | Pending |
| CRIT-03 | Phase 1 | Pending |
| CRIT-04 | Phase 1 | Pending |
| GUID-01 | Phase 2 | Pending |
| GUID-02 | Phase 2 | Pending |
| GUID-03 | Phase 2 | Pending |
| GUID-04 | Phase 2 | Pending |
| DISC-01 | Phase 3 | Pending |
| DISC-02 | Phase 3 | Pending |
| DISC-03 | Phase 3 | Pending |
| DISC-04 | Phase 3 | Pending |
| ONBD-01 | Phase 4 | Pending |
| ONBD-02 | Phase 4 | Pending |
| ONBD-03 | Phase 4 | Pending |
| HUD-01 | Phase 4 | Pending |
| HUD-02 | Phase 4 | Pending |
| HUD-03 | Phase 4 | Pending |
| PERF-01 | Phase 4 | Pending |
| DASH-01 | Phase 5 | Pending |
| DASH-02 | Phase 5 | Pending |
| DASH-03 | Phase 5 | Pending |
| WMAP-01 | Phase 6 | Pending |
| WMAP-02 | Phase 6 | Pending |
| WMAP-03 | Phase 6 | Pending |
| PROF-01 | Phase 7 | Pending |
| PROF-02 | Phase 7 | Pending |
| PROF-03 | Phase 7 | Pending |
| PROF-04 | Phase 7 | Pending |
| VPOL-01 | Phase 8 | Pending |
| VPOL-02 | Phase 8 | Pending |
| VPOL-03 | Phase 8 | Pending |
| VPOL-04 | Phase 8 | Pending |
| OUTF-01 | Phase 9 | Pending |
| OUTF-02 | Phase 9 | Pending |
| OUTF-03 | Phase 9 | Pending |
| OUTF-04 | Phase 9 | Pending |

**Coverage:**
- v2.0 requirements: 39 total
- Mapped to phases: 39
- Unmapped: 0

---
*Requirements defined: 2026-02-08*
*Last updated: 2026-02-08 — Revised roadmap: player-facing focus*
