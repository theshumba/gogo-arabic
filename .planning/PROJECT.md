# GoGo Arabic

## What This Is

An Arabic language learning RPG built with React 19, Phaser 3, Redux Toolkit, and Express 5 + MongoDB. Players explore a pixel-art world with 8 zones, 140 NPCs, and 52 quests while learning 1,220 Arabic vocabulary words and 28 letters through FSRS spaced repetition, 6 quiz types, sentence building, grammar lessons, and word duel battles. The game features quest guidance systems, a daily dashboard, fast-travel world map, player profile with stats, progressive tashkeel fading, and outfit customization.

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

### Active

(See next milestone's REQUIREMENTS.md)

### Out of Scope

- Multiplayer/real-time features — High complexity, single-player focus
- Mobile native app — Web-first, responsive CSS covers mobile
- TypeScript migration — Too large, not blocking UX issues
- OAuth login — Email/password sufficient
- Admin dashboard — Not user-facing

## Context

**v2.0 shipped (2026-02-08):** 9 phases, 14 plans, 253 files modified. Comprehensive UX overhaul driven by 8-agent audit findings. Major wins: quest guidance eliminated "what do I do?" problem, bundle splitting cut main chunk 91%, daily dashboard gives players a meaningful start screen.

**Codebase:** 35,391 LOC (JS/JSX/CSS frontend). React 19 + Phaser 3 + Redux Toolkit (12 slices, 2 middleware) + Express 5 + MongoDB.

**Known technical debt:**
- GameLayout god component (523 lines) — needs split into sub-components
- Mixed styling (CSS Modules + inline) in older components
- 1.85% test coverage — needs significant investment
- EventBus cleanup gaps in some components
- 3 visual polish requirements deferred (VPOL-01/02/04 need pixel art assets)

## Constraints

- **Tech stack**: React 19 + Phaser 3 + Redux Toolkit + Express 5 + MongoDB (established, no changes)
- **Browser**: Modern browsers, no IE11
- **Mobile**: Responsive web, minimum 375px viewport
- **Performance**: Main bundle < 500KB after splitting (achieved: 264KB)
- **Accessibility**: WCAG AA compliance for all overlays

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| CSS Modules for new components | Consistency, responsive breakpoints, accessibility | Good — used across all v2.0 components |
| useFocusTrap for all overlays | WCAG AA compliance, hook already exists | Good — wired to all 9 overlays |
| Phaser DOMOverlay for NPC markers | Existing system, minimal overhead | Good — quest markers render cleanly |
| Custom Framer Motion tooltips (not react-joyride) | React 19 incompatibility with joyride | Good — zero new dependencies |
| Skip TypeScript migration | UX fixes are higher priority, too large | Good — avoided scope creep |
| Skip new content this milestone | Fix discoverability of existing content first | Good — existing features now surfaced |
| Defer infrastructure to v3.0 | Player-facing features more impactful | Good — shipped fast, debt tracked |
| 5-agent parallel execution for phases 5-9 | Independent features, speed | Good — all 5 features shipped simultaneously |
| Vocabulary data imported directly (not in Redux) | Reduces store size, simplifies selectors | Good — cleaner architecture |
| HTML escaping in DOMOverlay | XSS prevention for NPC label names | Good — security hardening |
| Random dev JWT secret | Avoid hardcoded secrets in dev mode | Good — better security posture |

---
*Last updated: 2026-02-08 after v2.0 milestone*
