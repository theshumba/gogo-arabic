# Expansion Research: Infrastructure & Technical Systems

## Domain Overview

**Estimated LOC**: ~108,000
**Phases**: 52-57
**Core Principle**: Infrastructure that scales to support 500K+ LOC codebase with reliable performance, comprehensive testing, and maintainable architecture.

## Current State

- React 19 + Phaser 3 + Redux Toolkit (12 slices, 2 middleware) + Express 5 + MongoDB
- 589 tests (unit, component, integration, E2E)
- 294KB main bundle (after code splitting)
- localStorage + cloud sync (version vectors + conflict resolution)
- ESLint 9 + Prettier 3
- CSS Modules for newer components
- No TypeScript (deliberately deferred)

## Phase 52: Backend Expansion (~22K LOC)

### Goal
Scale backend from basic CRUD to support 350+ NPCs, 250+ quests, 5,000 words, real-time world state, and player progression.

### Systems

**API Expansion**
- RESTful endpoints for all new content types:
  - /api/v2/vocabulary (5,000+ words with filtering, pagination, search)
  - /api/v2/quests (250+ quests with chain resolution, state tracking)
  - /api/v2/npcs (350+ NPCs with schedule, relationship, dialogue state)
  - /api/v2/world-state (zone states, building states, event states)
  - /api/v2/factions (reputation, events, diplomatic state)
  - /api/v2/achievements (250+ achievements, progress tracking)
  - /api/v2/analytics (learning analytics, play stats, reports)
  - /api/v2/leaderboard (optional competitive features)
- API versioning (v1 → v2 migration path)
- Response caching with Redis
- Rate limiting per endpoint type

**Database Schema Expansion**
- MongoDB collections:
  - players (expanded: skills, factions, housing, journal, title)
  - vocabulary (5,000+ entries with relationships, clusters, audio refs)
  - quests (250+ with branching logic, prerequisites, rewards)
  - npcs (350+ with personality, schedule, memory, dialogue trees)
  - world_states (per-player world state snapshots)
  - factions (definitions + per-player reputation)
  - achievements (definitions + per-player progress)
  - content (lore entries, codex, books)
  - analytics (learning events, play sessions, performance data)
- Indexes for common query patterns
- Aggregation pipelines for analytics
- Data validation with Zod (server-side)

**Content Delivery**
- Static content CDN (dialogue JSON, NPC data, quest data)
- Asset pipeline for vocabulary audio files
- Incremental content updates (patch system, not full reload)
- Content versioning for backwards compatibility
- Offline-first with service worker caching

**Authentication & Security**
- JWT refresh token rotation
- Session management for concurrent devices
- CSRF token handling
- Input sanitization for all user-generated content (journal entries, Arabic input)
- Rate limiting on authentication endpoints
- Audit logging for admin actions

### Combinatorial Interactions
- Backend ← every game system needs API support
- Database ← all persistent state syncs through backend
- CDN ← all static content (dialogue, audio, images)
- Auth ← all player-specific data access
- Analytics ← all learning events feed into backend
- Caching → performance of all data-heavy systems

## Phase 53: State Management Overhaul (~18K LOC)

### Goal
Scale Redux from 12 slices to 25+ with proper normalization, selectors, and middleware for a 500K LOC application.

### Systems

**New Redux Slices**
- battleSlice (battle state, turn management, combo tracking)
- affinitySlice (root magic, elemental affinity, spell inventory)
- equipmentSlice (inventory, equipment slots, item management)
- companionSlice (roster, active party, AI state, mood)
- craftingSlice (professions, recipes, resources, work-in-progress)
- weatherSlice (current weather per zone, forecast, season)
- timeSlice (game time, day/night state, NPC schedule triggers)
- worldStateSlice (expanded: 500+ state variables, consequence chains)
- factionSlice (reputation per faction, event state, diplomacy)
- questSlice (expanded: 250+ quests, journal, active tracking)
- npcSlice (expanded: 350+ NPCs, memory, schedule, relationships)
- loreSlice (codex entries, discovered lore, reading progress)
- transportSlice (mount state, travel mode, caravan tracking)
- achievementSlice (expanded: 250+ achievements, progress, notifications)
- analyticsSlice (session data, learning events, performance metrics)
- uiSlice (expanded: overlay state, notification queue, tutorial state)

**Normalization**
- Entity adapter pattern for all collections (NPCs, quests, items, etc.)
- Normalized state shape (IDs + entities map)
- Denormalized selectors using createSelector (memoized)
- Cross-slice selectors for computed data
- Selector naming: select[Domain][Property] convention

**Middleware Expansion**
- analyticsMiddleware: captures all dispatches, logs learning events
- persistenceMiddleware: debounced localStorage writes (existing pattern)
- syncMiddleware: cloud sync for critical state changes
- validationMiddleware: Zod validation on dispatched payloads
- loggingMiddleware: development-only action logging

**Performance**
- Selector memoization with reselect
- Slice code splitting (lazy load slices with zones)
- Subscription batching (React 19 automatic batching)
- State migration system for schema changes
- Redux DevTools configuration for 25+ slices

### Combinatorial Interactions
- State management ← every game system uses Redux
- Slices ← backend sync (cloud persistence)
- Selectors ← UI components (render optimization)
- Middleware ← analytics + persistence + validation
- State migration ← version updates (backwards compatibility)
- Performance ← bundle size (code-split slices)

## Phase 54: Performance & Optimization (~18K LOC)

### Goal
Maintain <500KB bundle and <3s load time while scaling to 500K+ LOC.

### Systems

**Code Splitting Strategy**
- Route-based splitting (each page is a chunk)
- Zone-based splitting (each zone's content lazy loads)
- Feature-based splitting (combat, crafting, etc. on demand)
- Component-level splitting for heavy overlays
- Predicted loading (preload next likely zone/page)
- Target: initial load <200KB, total <2MB

**Asset Optimization**
- Tilemap streaming (load tiles for visible area + buffer)
- Sprite atlas management (per-zone sprite sheets)
- Audio lazy loading (ambient sounds load with zone)
- Image optimization (WebP with PNG fallback)
- Font subsetting for Arabic characters
- SVG for UI icons (no bitmap icons)

**Runtime Performance**
- Phaser object pooling (reuse sprites, particles, text)
- React component virtualization for long lists (inventory, codex, quest log)
- Web Worker for FSRS calculations (don't block main thread)
- Web Worker for content search/filter
- requestAnimationFrame optimization for Phaser
- Memory profiling targets per zone (<100MB heap)
- Garbage collection optimization (avoid allocation spikes)

**Loading & Caching**
- Service Worker for offline support
- IndexedDB for large data (vocabulary audio, tilemap data)
- Memory cache for frequently accessed data (active NPC data)
- Cache invalidation strategy (content versioning)
- Progressive loading screens with Arabic vocabulary tips
- Background loading of adjacent zones

**Monitoring**
- Performance metrics collection (FPS, load time, memory)
- Error boundary with crash reporting
- Bundle size tracking in CI (fail on regression)
- Lighthouse CI targets (90+ performance score)
- Client-side error logging to backend

### Combinatorial Interactions
- Performance ← every system (all code must be optimized)
- Code splitting ← zone system + routes + features
- Asset loading ← zone transitions + building entry
- Caching ← content delivery + offline support
- Monitoring → development workflow (catch regressions)
- Web Workers ← FSRS + search + heavy computation

## Phase 55: Testing Expansion (~16K LOC)

### Goal
Scale from 589 tests to 2,000+ covering all new systems with confidence for a 500K LOC codebase.

### Systems

**Test Categories**
- Unit tests (1,200+): pure functions, reducers, selectors, utilities
- Component tests (400+): React components, overlays, forms
- Integration tests (200+): cross-slice interactions, API integration
- E2E tests (100+): full user flows, quest completion, battle sequences
- Snapshot tests (100+): UI regression detection

**Test Infrastructure**
- Vitest for unit/component tests (existing)
- React Testing Library for component tests (existing)
- Playwright for E2E tests (new)
- Mock factories for all entity types (NPC, quest, item, etc.)
- Test data generators (randomized but deterministic)
- Redux store test utilities (create pre-populated stores)
- Phaser scene mocks (expanded for battle, interior, weather)

**Test Coverage Targets**
- Reducers: 100% coverage
- Selectors: 100% coverage
- Business logic: 95% coverage
- Components: 85% coverage (critical paths)
- API endpoints: 90% coverage
- E2E flows: cover all main quest paths

**Testing Patterns**
- Arrange-Act-Assert standard
- Custom test matchers for Arabic text (RTL, tashkeel)
- Accessibility testing (axe-core integration)
- Visual regression testing (Percy or Chromatic)
- Performance testing (measure render times)
- Memory leak testing for Phaser scenes

### Combinatorial Interactions
- Tests ← every system needs test coverage
- Test infrastructure → development confidence
- E2E tests ← quest system + dialogue + combat flows
- Mock factories ← all entity types (NPCs, quests, items)
- Coverage → CI/CD pipeline (gate on thresholds)
- Accessibility tests → all UI components

## Phase 56: Data Pipeline & Content Tools (~18K LOC)

### Goal
Tools and pipelines for managing 5,000 words, 350 NPCs, 250 quests, and 300+ lore entries efficiently.

### Systems

**Content Management**
- CLI tool for content CRUD:
  - Add/edit/delete vocabulary entries
  - Create/modify NPC dialogue trees
  - Build quest chains with prerequisite validation
  - Manage lore entries with category tagging
- Content validation pipeline:
  - Arabic text validation (correct tashkeel, valid characters)
  - Dialogue tree completeness (no dead ends)
  - Quest chain integrity (no broken prerequisites)
  - Cross-reference validation (NPC references exist, items exist)
- Content statistics dashboard

**Vocabulary Pipeline**
- Import from frequency lists (CSV/JSON)
- Audio generation pipeline (TTS or native speaker recordings)
- Root extraction and family linking automation
- CEFR level assignment (semi-automated from frequency)
- Semantic cluster auto-suggestion
- Duplicate detection and merge tool
- Export for external review (spreadsheet format)

**Dialogue Authoring**
- Dialogue tree visual editor (React-based)
- Condition/effect builder with validation
- Preview dialogue flow without running game
- Dialogue testing mode (walk through all paths)
- Arabic text input with tashkeel helper
- Dialogue templates for common patterns (greet → hub → topic → farewell)

**Quest Builder**
- Visual quest chain editor
- Objective templates (fetch, talk, discover, battle, puzzle)
- Reward calculator (balance XP, gold, items)
- Prerequisite chain validator
- Quest testing mode (skip to any state)

**Localization Infrastructure**
- String extraction for all user-facing text
- Translation file management (Arabic + English at minimum)
- RTL layout testing tools
- Arabic font rendering verification
- Tashkeel management tools (add/remove/verify)

### Combinatorial Interactions
- Content tools → all content-heavy systems
- Vocabulary pipeline → FSRS + dialogue + quests + objects
- Dialogue authoring → NPC system + quest system
- Quest builder → quest system + world state
- Validation → content integrity across all systems
- Localization → UI + dialogue + quest text + lore

## Phase 57: Save System & DevTools (~16K LOC)

### Goal
Robust save system for complex game state and developer tools for efficient development of remaining phases.

### Systems

**Save System**
- SaveManager handles:
  - Auto-save every 5 minutes
  - Manual save (3 save slots)
  - Quick save/load (keyboard shortcut)
  - Cloud save sync with conflict resolution
  - Save file versioning (migration between game versions)
- Save data includes:
  - Player state (level, skills, inventory, equipment)
  - World state (all 500+ state variables)
  - Quest state (all 250+ quests)
  - NPC state (all 350+ NPCs: relationship, memory, schedule)
  - Faction state (6 factions with reputation)
  - FSRS state (all vocabulary review data)
  - Achievement state (all 250+ achievements)
  - Time/weather state
  - Housing state
  - Companion state
- Save compression (LZ-string for localStorage)
- Save integrity verification (checksum)
- Save corruption recovery (backup save system)

**Development Tools**
- DevConsole (in-game developer panel):
  - Teleport to any zone
  - Set time/weather
  - Modify reputation/relationships
  - Grant items/gold
  - Complete/reset quests
  - Set player Arabic level
  - Trigger events
  - State inspector (view any Redux slice)
- Performance overlay:
  - FPS counter
  - Memory usage
  - Active entity count
  - Render call count
  - Redux action log
- Content preview:
  - Preview dialogue trees
  - Preview quest chains
  - Preview NPC schedules
  - Preview battle encounters
- Debug logging:
  - Filterable log levels
  - Category-based log channels
  - Log export for bug reports
  - Replay system (record and replay sessions)

**Migration System**
- Schema migration for save files between versions
- Migration scripts: v1 → v2, v2 → v3, etc.
- Automated migration testing
- Rollback support (downgrade save if needed)
- Player notification for major migrations

### Combinatorial Interactions
- Save system ← every persistent state in the game
- DevTools ← every system (debug access to all)
- Migration ← all state schema changes
- Cloud sync ← save system + backend
- Compression → storage limits (localStorage ~5MB)
- Integrity → data corruption prevention
- DevConsole → development speed for all phases

## Cross-Domain Integration Summary

| Infrastructure | Connects To |
|---------------|-------------|
| Backend | Every system that persists or syncs data |
| State Management | Every system that uses Redux (all of them) |
| Performance | Every system (optimization is universal) |
| Testing | Every system (confidence is universal) |
| Content Tools | Every content-heavy system |
| Save System | Every system with persistent state |

## LOC Breakdown

| Phase | Component | Estimated LOC |
|-------|-----------|--------------|
| 52 | Backend Expansion + API + DB + CDN | 22,000 |
| 53 | State Management (25+ slices) + Middleware | 18,000 |
| 54 | Performance + Code Splitting + Optimization | 18,000 |
| 55 | Testing Expansion (2,000+ tests) | 16,000 |
| 56 | Data Pipeline + Content Tools | 18,000 |
| 57 | Save System + DevTools + Migration | 16,000 |
| **Total** | | **108,000** |

## Technical Decisions

1. **No TypeScript**: Deliberately deferred. JSDoc + Zod validation provides type safety where needed. Migration would be ~100K LOC effort with marginal benefit at this stage.
2. **Redux for Everything**: Single state management solution. Complexity is in the selectors, not the store shape.
3. **Phaser 3 for Game**: Established, well-documented, handles tilemaps + sprites + scene management. No migration to Phaser 4.
4. **MongoDB**: Document model fits game data well. Nested dialogue trees, NPC personality objects, quest chain graphs — all natural in documents.
5. **localStorage + Cloud**: Offline-first. Cloud sync is backup, not primary. Game works without internet.
6. **Vitest + RTL + Playwright**: Proven testing stack. No need for specialized game testing frameworks.

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Bundle size explosion | Aggressive code splitting, lazy loading, tree shaking |
| State complexity (25+ slices) | Normalization, selector memoization, slice code splitting |
| Content volume (5K words, 350 NPCs) | Content pipeline tools, validation automation |
| Save file corruption | Checksum verification, backup saves, migration testing |
| Performance degradation | CI performance budgets, profiling tools, monitoring |
| Development velocity | DevTools, content authoring tools, comprehensive tests |
