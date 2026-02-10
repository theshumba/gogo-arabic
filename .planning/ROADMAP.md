# Roadmap: GoGo Arabic

## Milestones

- SHIPPED **v2.0 Player Experience Overhaul** — Phases 1-9 (shipped 2026-02-08) → [archive](milestones/v2.0-ROADMAP.md)
- PARTIAL **v3.0 Infrastructure & Polish** — Phases 10-11 complete, 12-13 deferred (2026-02-09) → [archive](milestones/v3.0-ROADMAP.md)
- IN PROGRESS **v4.0 Game Soul & Polish** — Phases 14-18 (started 2026-02-10)

## Phases

<details>
<summary>v2.0 Player Experience Overhaul (Phases 1-9) — SHIPPED 2026-02-08</summary>

- [x] Phase 1: Critical Fixes (2/2 plans) — 2026-02-08
- [x] Phase 2: Player Guidance (2/2 plans) — 2026-02-08
- [x] Phase 3: Feature Discoverability (2/2 plans) — 2026-02-08
- [x] Phase 4: Onboarding & HUD (3/3 plans) — 2026-02-08
- [x] Phase 5: Daily Dashboard (1/1 plan) — 2026-02-08
- [x] Phase 6: World Map Upgrade (1/1 plan) — 2026-02-08
- [x] Phase 7: Player Profile & Stats (1/1 plan) — 2026-02-08
- [x] Phase 8: Visual Polish & Sprites (1/1 plan) — 2026-02-08
- [x] Phase 9: Outfit System (1/1 plan) — 2026-02-08

</details>

<details>
<summary>v3.0 Infrastructure & Polish (Phases 10-11) — PARTIAL 2026-02-09</summary>

- [x] Phase 10: Testing Foundation (6/6 plans) — 2026-02-09
- [x] Phase 11: Architecture Cleanup (5/5 plans) — 2026-02-09
- [ ] Phase 12: Backend Hardening — DEFERRED
- [ ] Phase 13: Visual Polish — DEFERRED

</details>

### v4.0 Game Soul & Polish (In Progress)

**Milestone Goal:** Transform GoGo Arabic from a learning app with RPG graphics into a game that feels alive — with audio, atmosphere, clear progression, interactive world, and triple-A polish.

**Phase Numbering:** v4.0 continues from v3.0, starting at Phase 14.

---

#### Phase 14: Bug Fixes & Stability

**Goal:** Fix critical user-blocking issues before adding new sensory systems

**Depends on:** Phase 11 (v3.0 architecture complete)

**Requirements:** FIX-01, FIX-02, FIX-03

**Success Criteria** (what must be TRUE):
1. User does not experience overlay stuck states — clicking outside overlay, ESC key, and X button all properly close overlays
2. User does not experience character movement locks — player can move freely after all quiz/dialogue/menu interactions
3. User does not experience screen freezes — game remains responsive during zone transitions and fast-travel
4. User sees proper error states — "No words to review yet" instead of blank screens in quiz overlay
5. User sees properly formatted dialogue text — all NPC dialogue wraps correctly without overflow or cutoff

**Plans:** TBD (estimate 1 plan)

Plans:
- [ ] 14-01: TBD

---

#### Phase 15: Audio System

**Goal:** Add complete audio layer with zone music, UI sounds, quiz feedback, and action effects

**Depends on:** Phase 14 (stability fixes prevent audio trigger bugs)

**Requirements:** AUD-01, AUD-02, AUD-03, AUD-04, AUD-05

**Success Criteria** (what must be TRUE):
1. User hears zone-specific background music that changes when entering a new zone (8 zones + menu + quiz = 10 tracks)
2. User hears UI sound effects for button clicks, menu open/close, and error feedback (5+ sounds)
3. User hears quiz feedback sounds — correct answer, incorrect answer, quiz complete (5+ sounds)
4. User hears action SFX — footsteps (3 terrain types), door interaction, chest open, NPC interact (4+ sounds)
5. User can adjust volume via settings — master, BGM, and SFX sliders with immediate effect
6. User sees "Tap to Play" screen on mobile to unlock audio (prevents autoplay policy violations)

**Plans:** TBD (estimate 2 plans)

Plans:
- [ ] 15-01: TBD
- [ ] 15-02: TBD

---

#### Phase 16: Visual Juice

**Goal:** Add particle effects, screen shake, and celebration animations for sensory feedback

**Depends on:** Phase 15 (particles need audio triggers for full impact)

**Requirements:** VFX-01, VFX-02, VFX-03, VFX-04, VFX-05

**Success Criteria** (what must be TRUE):
1. User sees screen shake on quiz correct answer, level up, and achievement unlock (with reduced-motion support)
2. User sees particle effects on achievement unlock and level up (2+ effect types: burst and continuous)
3. User sees smooth fade transitions when overlays open/close and when changing zones
4. User sees a full-screen level-up celebration overlay with animation and sound
5. User sees enhanced achievement toast with celebration animation (particles + fade-in + bounce)

**Plans:** TBD (estimate 2 plans)

Plans:
- [ ] 16-01: TBD
- [ ] 16-02: TBD

---

#### Phase 17: Progression Clarity

**Goal:** Make letter learning discoverable and provide clear next-step guidance

**Depends on:** None (pure UI, can run parallel with Phase 16)

**Requirements:** PROG-01, PROG-02, PROG-03, PROG-04

**Success Criteria** (what must be TRUE):
1. User can access a Learning Path menu showing alphabet → vocabulary → grammar progression with clear "Start Here" for new players
2. User sees a Learning Dashboard with review queue, available lessons, and next-step indicators
3. User sees progress metrics — letters mastered (X/28), words learned (X/1220), quests done (X/52) — visible from HUD or dashboard
4. New player is guided to letter learning within first 3 onboarding steps (not hidden in menus)

**Plans:** TBD (estimate 1-2 plans)

Plans:
- [ ] 17-01: TBD

---

#### Phase 18: World Life

**Goal:** Animate NPCs and add environmental interactivity for living world feel

**Depends on:** Phase 16 (uses particles for NPC effects)

**Requirements:** LIFE-01, LIFE-02, LIFE-03

**Success Criteria** (what must be TRUE):
1. User sees NPC idle animations — all 140 NPCs have 2-frame idle (blink/shift weight) running continuously
2. User gets feedback when interacting with locked doors — "This door is locked" message instead of silent collision
3. User sees smooth camera follow (lerp-based) instead of snapping camera

**Plans:** 1 plan

Plans:
- [ ] 18-01-PLAN.md — NPC idle animations, locked door interactables, camera follow polish

---

## Progress

**Execution Order:**
Phases execute in dependency order: 14 → 15 → 16/17 (parallel) → 18

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Critical Fixes | v2.0 | 2/2 | Complete | 2026-02-08 |
| 2. Player Guidance | v2.0 | 2/2 | Complete | 2026-02-08 |
| 3. Feature Discoverability | v2.0 | 2/2 | Complete | 2026-02-08 |
| 4. Onboarding & HUD | v2.0 | 3/3 | Complete | 2026-02-08 |
| 5. Daily Dashboard | v2.0 | 1/1 | Complete | 2026-02-08 |
| 6. World Map Upgrade | v2.0 | 1/1 | Complete | 2026-02-08 |
| 7. Player Profile & Stats | v2.0 | 1/1 | Complete | 2026-02-08 |
| 8. Visual Polish & Sprites | v2.0 | 1/1 | Complete | 2026-02-08 |
| 9. Outfit System | v2.0 | 1/1 | Complete | 2026-02-08 |
| 10. Testing Foundation | v3.0 | 6/6 | Complete | 2026-02-09 |
| 11. Architecture Cleanup | v3.0 | 5/5 | Complete | 2026-02-09 |
| 12. Backend Hardening | v3.0 | — | Deferred | — |
| 13. Visual Polish | v3.0 | — | Deferred | — |
| 14. Bug Fixes & Stability | v4.0 | 0/TBD | Not started | — |
| 15. Audio System | v4.0 | 0/TBD | Not started | — |
| 16. Visual Juice | v4.0 | 0/TBD | Not started | — |
| 17. Progression Clarity | v4.0 | 0/TBD | Not started | — |
| 18. World Life | v4.0 | 0/1 | Not started | — |

---
*Roadmap created: 2026-02-08*
*Last updated: 2026-02-10 — Phase 18 planned (1 plan)*
