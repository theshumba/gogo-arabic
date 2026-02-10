# Requirements: GoGo Arabic

**Defined:** 2026-02-09
**Core Value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"

## v3.0 Requirements (Completed/Deferred)

### Completed (Phases 10-11)
- [x] **TEST-01 through TEST-08**: Testing foundation — 548 tests, coverage thresholds
- [x] **ARCH-01 through ARCH-05, PERF-02**: Architecture cleanup — GameLayout refactored, ESLint, selectors, CSS Modules

### Deferred (Phases 12-13)
- **BACK-01 through BACK-06, PERF-01**: Backend hardening — deferred to future milestone
- **VPOL-01 through VPOL-05**: Visual polish — partially addressed in v4.0

---

## v4.0 Requirements (Completed)

All 20 requirements satisfied. Audited 2026-02-10.

### Audio

- [x] **AUD-01**: Player hears zone-specific background music that changes when entering a new zone (8 zones + menu + quiz = 10 tracks)
- [x] **AUD-02**: Player hears UI sound effects for button clicks, menu open/close, and error feedback (5+ sounds)
- [x] **AUD-03**: Player hears quiz feedback sounds — correct answer, incorrect answer, quiz complete (5+ sounds)
- [x] **AUD-04**: Player hears action SFX — footsteps (3 terrain types), door interaction, chest open, NPC interact (4+ sounds)
- [x] **AUD-05**: Player can adjust volume via settings — master, BGM, and SFX sliders with immediate effect

### Visual Juice

- [x] **VFX-01**: Player sees screen shake on quiz correct answer, level up, and achievement unlock (with reduced-motion support)
- [x] **VFX-02**: Player sees particle effects on achievement unlock and level up (2+ effect types)
- [x] **VFX-03**: Player sees smooth fade transitions when overlays open/close and when changing zones
- [x] **VFX-04**: Player sees a full-screen level-up celebration overlay with animation and sound
- [x] **VFX-05**: Player sees enhanced achievement toast with celebration animation

### Progression Clarity

- [x] **PROG-01**: Player can access a Learning Path menu showing alphabet → vocabulary → grammar progression with clear "Start Here" for new players
- [x] **PROG-02**: Player sees a Learning Dashboard with review queue, available lessons, and next-step indicators
- [x] **PROG-03**: Player sees progress metrics — letters mastered (X/28), words learned (X/1220), quests done (X/52) — visible from HUD or dashboard
- [x] **PROG-04**: New player is guided to letter learning within first 3 onboarding steps

### World Life

- [x] **LIFE-01**: Player sees NPC idle animations — all 140 NPCs have 2-frame idle (blink/shift weight) running continuously
- [x] **LIFE-02**: Player gets feedback when interacting with locked doors — "This door is locked" message instead of silent collision
- [x] **LIFE-03**: Player sees smooth camera follow (lerp-based) instead of snapping camera

### Bug Fixes & Polish

- [x] **FIX-01**: Player does not experience game freezes — overlay stuck states, character movement locks, and screen freezes are fixed
- [x] **FIX-02**: Player sees proper error states — "No words to review yet" instead of blank screens, empty state messages throughout
- [x] **FIX-03**: Player sees properly formatted text — dialogue wraps correctly, no overflow or cutoff in any overlay

## v4.x Requirements (Post-Launch)

Deferred enhancements after core soul is established.

### World Depth
- **DEPTH-01**: Player can enter 10-15 key buildings with interior maps
- **DEPTH-02**: Player sees NPC wandering behaviors in village zones
- **DEPTH-03**: Player sees NPC emote sprites for reactions beyond quest markers
- **DEPTH-04**: Player hears ambient zone sounds

### UI Polish
- **UIPOL-01**: Player sees consistent pixel art icons replacing all emoji in HUD
- **UIPOL-02**: Player sees UI micro-animations
- **UIPOL-03**: Player sees tooltip delays

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multiplayer/co-op | Massive complexity, single-player learning focus |
| Voice recognition | Complex ML, accuracy issues, high dev cost |
| Full NPC schedules (Stardew-style) | High complexity, frustrating for quest-finding |
| All 140 buildings enterable | Art explosion, most would be empty filler |
| Day/night cycle | Complex, not core to "soul" feeling |
| Weather effects | Visual variety but not essential for v4.0 |
| Procedural quests | Educational content needs curation |
| Arabic dialect switching | Confuses learners, exponential content |
| TypeScript migration | Too large, not blocking UX |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FIX-01 | Phase 14 | Satisfied |
| FIX-02 | Phase 14 | Satisfied |
| FIX-03 | Phase 14 | Satisfied |
| AUD-01 | Phase 15 | Satisfied |
| AUD-02 | Phase 15 | Satisfied |
| AUD-03 | Phase 15 | Satisfied |
| AUD-04 | Phase 15 | Satisfied |
| AUD-05 | Phase 15 | Satisfied |
| VFX-01 | Phase 16 | Satisfied |
| VFX-02 | Phase 16 | Satisfied |
| VFX-03 | Phase 16 | Satisfied |
| VFX-04 | Phase 16 | Satisfied |
| VFX-05 | Phase 16 | Satisfied |
| PROG-01 | Phase 17 | Satisfied |
| PROG-02 | Phase 17 | Satisfied |
| PROG-03 | Phase 17 | Satisfied |
| PROG-04 | Phase 17 | Satisfied |
| LIFE-01 | Phase 18 | Satisfied |
| LIFE-02 | Phase 18 | Satisfied |
| LIFE-03 | Phase 18 | Satisfied |

**Coverage:**
- v4.0 requirements: 20 total
- Satisfied: 20/20 (100%)
- Gaps: 0

---
*Requirements defined: 2026-02-09*
*Last updated: 2026-02-10 — v4.0 milestone audit passed, all 20 requirements satisfied*
