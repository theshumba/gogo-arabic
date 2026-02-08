# Roadmap: GoGo Arabic

## Overview

Transform GoGo Arabic from a feature-rich but hard-to-navigate experience into a polished, guided, feature-packed learning RPG. This milestone prioritizes player-facing improvements: fixing critical bugs, adding guidance systems, surfacing hidden features, redesigning the HUD, then adding entirely new systems — a daily dashboard, upgraded world map, player profile, visual polish, and outfit customization. Infrastructure work (testing, architecture, backend) is deferred to v3.0.

## Milestones

- 🚧 **v2.0 Player Experience Overhaul** - Phases 1-9 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Critical Fixes** - Fix z-index bugs, mobile overflow, focus traps, HUD review button ✓ Complete
- [x] **Phase 2: Player Guidance** - NPC quest markers, active objective display, quest compass ✓ Complete
- [ ] **Phase 3: Feature Discoverability** - Expose hidden features through in-game UI
- [ ] **Phase 4: Onboarding & HUD** - Contextual tooltips, streamlined HUD, bundle splitting
- [ ] **Phase 5: Daily Dashboard** - Startup screen with streak, reviews, goals, suggested activity
- [ ] **Phase 6: World Map Upgrade** - Fast travel, zone completion %, locked zone teasers
- [ ] **Phase 7: Player Profile & Stats** - Stats page, achievement showcase, streak history
- [ ] **Phase 8: Visual Polish & Sprites** - Consistent sprite style, pixel-art icons, tashkeel fading
- [ ] **Phase 9: Outfit System** - Wardrobe UI, outfit shop, AI-generated sprite outfits

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
- [x] 01-01-PLAN.md — Z-index tokens + clickable review badge (CRIT-01, CRIT-04) ✓ 2 min
- [x] 01-02-PLAN.md — Responsive overlay migration + focus traps (CRIT-02, CRIT-03) ✓ 7 min

### Phase 2: Player Guidance
**Goal**: Eliminate "what do I do next?" confusion through visual guidance systems
**Depends on**: Phase 1
**Requirements**: GUID-01, GUID-02, GUID-03, GUID-04
**Success Criteria** (what must be TRUE):
  1. NPCs with available quests show exclamation mark (!) above their heads
  2. NPCs with completable quests show question mark (?) above their heads
  3. HUD displays active quest name with current objective and progress (e.g., "Village Explorer: Talk to Fatima 1/3")
  4. Player sees directional compass arrow pointing toward active quest objective location
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — Quest markers (!/?) on NPCs + activeQuestId state + QuestLog tracking (GUID-01, GUID-02) ✓ 7 min
- [x] 02-02-PLAN.md — HUD quest tracker + compass arrow (GUID-03, GUID-04) ✓ 1 min

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

### Phase 4: Onboarding & HUD
**Goal**: Replace static onboarding slideshow with contextual guidance, reduce HUD clutter, and split the bundle
**Depends on**: Phase 3
**Requirements**: ONBD-01, ONBD-02, ONBD-03, HUD-01, HUD-02, HUD-03, PERF-01
**Success Criteria** (what must be TRUE):
  1. New players see contextual tooltips pointing at actual UI elements instead of static overlay
  2. Onboarding progresses through gameplay actions (moving, talking to NPC, completing word) not button clicks
  3. First quest NPC has visual highlight with guidance arrow during onboarding
  4. Primary HUD shows only Level/XP bar, active quest objective, and 3-4 essential action buttons
  5. Secondary stats (words learned, dirhams, streak count) are in collapsible panel
  6. Z-index values are standardized using CSS custom properties in variables.css
  7. Main JavaScript bundle is under 500KB (code splitting configured)
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Daily Dashboard
**Goal**: Give players a meaningful start screen that shows progress and suggests what to do next
**Depends on**: Phase 4
**Requirements**: DASH-01, DASH-02, DASH-03
**Success Criteria** (what must be TRUE):
  1. Game shows a dashboard on startup with streak count, words due for review, and daily goals progress
  2. Dashboard suggests next activity based on player state (review if words due, continue quest if mid-quest, explore if idle)
  3. Dashboard shows learning stats summary (words learned this week, accuracy trend)
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: World Map Upgrade
**Goal**: Transform the world map from a simple zone selector into an informative navigation hub with fast travel
**Depends on**: Phase 5
**Requirements**: WMAP-01, WMAP-02, WMAP-03
**Success Criteria** (what must be TRUE):
  1. Players can fast-travel to any previously visited zone from the world map
  2. World map shows completion percentage for each zone (quests done, words learned, NPCs talked to)
  3. Locked zones show teaser info (zone name, difficulty, what's needed to unlock)
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

### Phase 7: Player Profile & Stats
**Goal**: Give players a dedicated space to see their learning journey, achievements, and progress over time
**Depends on**: Phase 6
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04
**Success Criteria** (what must be TRUE):
  1. Player profile page shows total words learned, accuracy rate, and time played
  2. Profile displays achievement showcase with pinned achievements
  3. Profile shows learning streak history and best streak record
  4. Profile is accessible from the game HUD or pause menu
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

### Phase 8: Visual Polish & Sprites
**Goal**: Unify the visual style and add polish that makes the game feel professionally crafted
**Depends on**: Phase 7
**Requirements**: VPOL-01, VPOL-02, VPOL-03, VPOL-04
**Success Criteria** (what must be TRUE):
  1. All NPC and player sprites follow a consistent pixel art style guide
  2. HUD uses custom pixel-art icons instead of emoji/text
  3. Learned words progressively fade diacritics (tashkeel) as mastery increases
  4. Idle animations added to player and key NPCs
**Plans**: TBD

Plans:
- [ ] 08-01: TBD

### Phase 9: Outfit System
**Goal**: Add character customization through purchasable outfits, giving players a rewarding way to spend dirhams
**Depends on**: Phase 8
**Requirements**: OUTF-01, OUTF-02, OUTF-03, OUTF-04
**Success Criteria** (what must be TRUE):
  1. Wardrobe UI accessible from pause menu showing available outfits
  2. Players can purchase outfits using in-game currency (dirhams) from shop
  3. Player sprite updates in real-time when outfit is changed
  4. At least 5 distinct outfit options available at launch (AI-generated pixel art)
**Plans**: TBD

Plans:
- [ ] 09-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Critical Fixes | 2/2 | ✓ Complete | 2026-02-08 |
| 2. Player Guidance | 2/2 | ✓ Complete | 2026-02-08 |
| 3. Feature Discoverability | 0/0 | Not started | - |
| 4. Onboarding & HUD | 0/0 | Not started | - |
| 5. Daily Dashboard | 0/0 | Not started | - |
| 6. World Map Upgrade | 0/0 | Not started | - |
| 7. Player Profile & Stats | 0/0 | Not started | - |
| 8. Visual Polish & Sprites | 0/0 | Not started | - |
| 9. Outfit System | 0/0 | Not started | - |

---
*Roadmap created: 2026-02-08*
*Last updated: 2026-02-08 — Phase 2 complete*
