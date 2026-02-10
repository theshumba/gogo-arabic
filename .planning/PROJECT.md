# GoGo Arabic

## What This Is

An Arabic language learning RPG built with React 19, Phaser 3, Redux Toolkit, and Express 5 + MongoDB. Players explore a pixel-art world with 8 zones, 140 NPCs, and 52 quests while learning 1,220 Arabic vocabulary words and 28 letters through FSRS spaced repetition, 6 quiz types, sentence building, grammar lessons, and word duel battles. The game features zone-specific background music with crossfade, screen shake and particle effects, a 3-stage learning path (alphabet -> vocabulary -> grammar), quest guidance systems, daily dashboard, fast-travel world map, player profile with stats, NPC idle animations, and outfit customization.

## Core Value

Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"

## Requirements

### Validated

- FSRS spaced repetition with 1,220 words and 6 quiz types — v1.0
- 52 quests across 8 zones with prerequisite chains — v1.0
- 7 structured grammar lessons with exercises — v1.0
- Word Duel boss battles (8 bosses, adaptive difficulty) — v1.0
- Root Explorer with search and category filtering — v1.0
- Reading comprehension (8 passages, 4 levels) — v1.0
- Word search mini-game — v1.0
- Onboarding tutorial (6 steps) — v1.0
- Daily goals, streak milestones, level-up rewards, 44 achievements — v1.0
- Typewriter dialogue with cultural NPC content — v1.0
- Sprint (Shift key), MiniMap (M key), World Map — v1.0
- Cloud sync with version vectors and conflict resolution — v1.0
- Backend: JWT cookies, CSRF, rate limiting, Zod, Helmet, pagination — v1.0
- Framer Motion route transitions and overlay animations — v1.0
- Accessibility: ARIA labels, keyboard nav, reduced motion support — v1.0
- Z-index system + clickable review badge + mobile-responsive overlays + focus traps — v2.0
- NPC quest markers (!/?) + active quest HUD + compass arrow — v2.0
- Activities menu + boss nodes on map + NPC dialogue hints — v2.0
- Contextual onboarding tooltips + streamlined HUD + bundle splitting (264KB) — v2.0
- Daily Dashboard with streak, reviews, goals, activity suggestions — v2.0
- World Map fast travel + zone completion % + locked zone teasers — v2.0
- Player Profile with stats, streak calendar, achievement showcase — v2.0
- Progressive tashkeel fading based on FSRS mastery — v2.0
- Wardrobe system with 12 outfits, shop, and equip — v2.0
- 548-test suite (unit, component, integration, E2E) with coverage thresholds — v3.0
- GameLayout refactored (607->209 lines) + ESLint 9 + Prettier 3 — v3.0
- 7 components migrated to CSS Modules + 33 named Redux selectors — v3.0
- Zone BGM with 800ms crossfade + UI/quiz/action SFX + footstep system + 4 volume sliders + mute + mobile audio unlock — v4.0
- Screen shake (3 presets) + particle effects (burst/continuous) + zone fade transitions + level-up celebration + achievement toasts — v4.0
- Learning Path menu (3-stage) + DailyDashboard progress metrics + HUD progress strip + onboarding reorder — v4.0
- NPC idle animations (desynchronized) + locked door feedback + lerp camera follow — v4.0
- Overlay close guarantees + movement unlock safety nets + zone transition timeout + empty quiz states + dialogue overflow — v4.0

### Active

## Current Milestone: v5.0 The Real Game

**Goal:** Transform GoGo Arabic from a learning app with a game skin into an actual game — epic personalized narrative, living interactive world, and guided structure from minute one.

**Target features:**
- Complete onboarding overhaul with guide character, first mission, and clear purpose
- Personalized branching narrative that adapts to player choices and learning path
- Living world with enterable buildings, interactive objects, market stalls, signs, fountains
- Structured progression so players always know what to do and why
- Rich zone environments that feel like real places worth exploring
- NPC conversations that feel meaningful — tips, warnings, stories, personality

### Out of Scope

- Multiplayer/real-time features — High complexity, single-player focus
- Mobile native app — Web-first, responsive CSS covers mobile
- TypeScript migration — Too large, not blocking UX issues
- OAuth login — Email/password sufficient
- Admin dashboard — Not user-facing
- Voice recognition — Complex ML, accuracy issues, high dev cost
- Full NPC schedules (Stardew-style) — High complexity, frustrating for quest-finding
- Day/night cycle — Complex, not core to "soul" feeling
- Procedural quests — Educational content needs curation
- Arabic dialect switching — Confuses learners, exponential content

## Context

**v4.0 shipped (2026-02-10):** 5 phases, 8 plans, 28 files, 1,526 insertions. Audio system (BGM + SFX), visual juice (particles, shake, celebrations), learning progression (Learning Path + dashboard), world life (NPC idle, doors, camera), bug fixes (overlays, freezes, movement). All 20 requirements satisfied, all cross-phase integrations verified.

**v3.0 partial (2026-02-09):** Testing foundation + architecture cleanup complete. 548 tests, ESLint/Prettier, GameLayout refactored, CSS Modules migration. Backend hardening and visual polish deferred.

**v2.0 shipped (2026-02-08):** 9 phases, 14 plans, 253 files modified. Quest guidance, feature discoverability, daily dashboard, world map, player profile, outfits.

**Codebase:** 36,000+ LOC (JS/JSX/CSS frontend). React 19 + Phaser 3 + Redux Toolkit (12 slices, 2 middleware) + Express 5 + MongoDB.

**User feedback addressed in v4.0:**
- ~~Game freezes/gets stuck~~ -> Fixed (overlay close guarantees, movement safety nets, transition timeouts)
- ~~No sense of direction~~ -> Fixed (Learning Path menu, dashboard metrics, onboarding reorder)
- ~~Can't find letter/alphabet learning~~ -> Fixed (alphabet is onboarding step 2, Learning Path)
- ~~World feels empty~~ -> Fixed (NPC idle animations, locked door feedback, smooth camera)
- ~~No audio~~ -> Fixed (zone BGM, SFX, volume controls, mobile unlock)
- ~~Doesn't feel like a "real game"~~ -> Fixed (screen shake, particles, celebrations, toasts, transitions)

**v5.0 user feedback driving this milestone:**
- Onboarding is useless — only teaches controls, not purpose. Player has no idea what to do.
- World feels empty — just houses, pillars, a pond, trees. Nothing interactive.
- Can't enter buildings, chests are just rocks with text.
- No story or narrative pulling the player forward.
- No structure — player doesn't know who to talk to, where to go, or how to find Arabic learning.
- NPCs feel like signposts, not characters.
- Zones exist on map but feel disconnected and empty.
- "Every other game I play, I know where I'm supposed to go. I can't do that here."
- Audio assets (MP3 files) still need to be created/sourced

## Constraints

- **Tech stack**: React 19 + Phaser 3 + Redux Toolkit + Express 5 + MongoDB (established, no changes)
- **Browser**: Modern browsers, no IE11
- **Mobile**: Responsive web, minimum 375px viewport
- **Performance**: Main bundle < 500KB after splitting (achieved: 264KB)
- **Accessibility**: WCAG AA compliance for all overlays, prefers-reduced-motion for all VFX

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| CSS Modules for new components | Consistency, responsive breakpoints, accessibility | Good — used across all v2.0+ components |
| useFocusTrap for all overlays | WCAG AA compliance, hook already exists | Good — wired to all 9 overlays |
| Phaser DOMOverlay for NPC markers | Existing system, minimal overhead | Good — quest markers render cleanly |
| Custom Framer Motion tooltips (not react-joyride) | React 19 incompatibility with joyride | Good — zero new dependencies |
| Skip TypeScript migration | UX fixes are higher priority, too large | Good — avoided scope creep |
| Defer infrastructure to v3.0 | Player-facing features more impactful | Good — shipped fast, debt tracked |
| 5-agent parallel execution for phases 5-9 | Independent features, speed | Good — all 5 features shipped simultaneously |
| Vocabulary data imported directly (not in Redux) | Reduces store size, simplifies selectors | Good — cleaner architecture |
| HTML escaping in DOMOverlay | XSS prevention for NPC label names | Good — security hardening |
| Random dev JWT secret | Avoid hardcoded secrets in dev mode | Good — better security posture |
| Zero new dependencies for v4.0 | Howler.js + Phaser 3 + Framer Motion already installed | Good — no bloat, all features built with existing stack |
| audioManager singleton pattern | Central audio control, easy volume sync from Redux | Good — clean separation of concerns |
| Timer-based NPC idle (not state machines) | Simplicity, desynchronized via random delays | Good — natural-looking idle without complexity |
| useOverlayClose hook for overlay management | Centralize ESC/click-outside, prevent stuck states | Good — used in 6 overlays, eliminated freeze bugs |
| CSS keyframes for infinite animations | More performant than Framer Motion for continuous effects | Good — shimmer, sparkle, glow run smoothly |
| prefers-reduced-motion gate for all VFX | WCAG AA, respect user preferences | Good — 27 files check preference |
| Parallel execution of all v4.0 phases | User preference for speed, independent features | Good — shipped 5 phases in 1 day, minor cleanup needed |

---
*Last updated: 2026-02-10 after v5.0 milestone started*
