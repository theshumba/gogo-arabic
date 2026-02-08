# GoGo Arabic

## What This Is

An Arabic language learning RPG built with React 19, Phaser 3, Redux Toolkit, and Express 5 + MongoDB. Players explore a pixel-art world with 8 zones, 140 NPCs, and 52 quests while learning 1,220 Arabic vocabulary words and 28 letters through FSRS spaced repetition, 6 quiz types, sentence building, grammar lessons, and word duel battles.

## Core Value

Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"

## Current Milestone: v2.0 Comprehensive UX Overhaul

**Goal:** Fix critical UX gaps identified by 8-agent audit — add player guidance, expose hidden features, fix accessibility violations, optimize performance, and harden code quality.

**Target features:**
- Player guidance system (quest compass, NPC !/? markers, active quest objective on HUD)
- Feature discoverability (expose Grammar, Roots, Reading, Battles, Reviews in-game)
- Accessibility fixes (wire useFocusTrap, fix z-index bugs, mobile overflow)
- Bundle splitting (2.8MB → <500KB main chunk)
- HUD redesign (reduce information overload)
- Contextual onboarding (replace static slideshow)
- Code quality (ESLint, testing, architecture cleanup)
- Backend hardening (DB indexes, sync fixes, auth improvements)

## Requirements

### Validated

<!-- Shipped and confirmed valuable in v1.0 (Tiers 1-5). -->

- FSRS spaced repetition with 1,220 words and 6 quiz types
- 52 quests across 8 zones with prerequisite chains
- 7 structured grammar lessons with exercises
- Word Duel boss battles (8 bosses, adaptive difficulty)
- Root Explorer with search and category filtering
- Reading comprehension (8 passages, 4 levels)
- Word search mini-game
- Onboarding tutorial (6 steps)
- Daily goals, streak milestones, level-up rewards, 44 achievements
- Typewriter dialogue with cultural NPC content
- Sprint (Shift key), MiniMap (M key), World Map
- Cloud sync with version vectors and conflict resolution
- Backend: JWT cookies, CSRF, rate limiting, Zod, Helmet, pagination
- Framer Motion route transitions and overlay animations
- Accessibility: ARIA labels, keyboard nav, reduced motion support

### Active

<!-- v2.0 scope. See REQUIREMENTS.md for full REQ-IDs. -->

See `.planning/REQUIREMENTS.md`

### Out of Scope

- Multiplayer/real-time features — High complexity, single-player focus
- Mobile native app — Web-first, responsive CSS covers mobile
- TypeScript migration — Too large, not blocking UX issues
- New content (more words, quests, zones) — Fix UX first, add content later
- OAuth login — Email/password sufficient
- Admin dashboard — Not user-facing

## Context

**8-Agent Audit (2026-02-08):** Comprehensive codebase audit across UI/UX, frontend architecture, backend architecture, code quality, game design, data/content, Phaser systems, and frontend UI. Full findings in `.planning/AUDIT-SYNTHESIS.md` and `.planning/RESEARCH-REPORT-EXPANDED.md`.

**Key insight:** The game has substantial content and features, but players can't find or navigate them. The #1 problem is lack of in-world guidance — players complete onboarding and have zero directional cues among 140 NPCs and 8 zones.

**Technical debt:** GameLayout god component (523 lines), inconsistent styling (CSS Modules + inline), missing memoization, EventBus cleanup gaps, 2.8MB unsplit bundle, 1.85% test coverage.

## Constraints

- **Tech stack**: React 19 + Phaser 3 + Redux Toolkit + Express 5 + MongoDB (established, no changes)
- **Browser**: Modern browsers, no IE11
- **Mobile**: Responsive web, minimum 375px viewport
- **Performance**: Main bundle < 500KB after splitting
- **Accessibility**: WCAG AA compliance for all overlays

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| CSS Modules for new components | Consistency, responsive breakpoints, accessibility | — Pending |
| useFocusTrap for all overlays | WCAG AA compliance, hook already exists | — Pending |
| Phaser DOMOverlay for NPC markers | Existing system, minimal overhead | — Pending |
| Skip TypeScript migration | UX fixes are higher priority, too large | ✓ Good |
| Skip new content this milestone | Fix discoverability of existing content first | ✓ Good |

---
*Last updated: 2026-02-08 after v2.0 milestone initialization*
