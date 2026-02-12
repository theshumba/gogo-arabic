# GoGo Arabic — MASTER PLAN

## How to Use This Document

**Every new session, say this:**
> "Continue executing the Master Plan. Check `.planning/MASTER-PLAN.md` for where we left off."

That's it. Claude will read this file, see exactly which phase is next, and pick up where things stopped.

---

## What We're Building

A full-fledged AAA Arabic learning RPG. ~800K+ lines of code. 120-160 hours of gameplay. The game equivalent of Pokemon meets Duolingo — but set in the historical Arabic world with pixel art, no music (ambient + SFX only), faceless characters (Islamic art tradition), and every single game mechanic teaching Arabic.

**Current codebase:** ~50K LOC (v5.0 shipped)
**Target:** 800K+ LOC across 37 phases

---

## Hard Constraints (NEVER violate)

- NO music — ambient sounds + SFX + Arabic voice lines only
- NO eyes/faces — Islamic art tradition, faceless pixel characters
- NO god/deity characters — no divine beings, no worship mechanics
- Arabic-first — every mechanic teaches Arabic, no grinding without learning
- Culturally respectful — accurate history, no stereotypes

---

## The Phases

### v6.0 — Combat & RPG (Phases 27-32, ~148K LOC)
*Give the game its core loop: turn-based battles where Arabic knowledge = combat power*

| # | Phase | ~LOC | Status |
|---|-------|------|--------|
| 27 | Turn-based battle engine (Arabic input = attack power) | 25K | NOT STARTED |
| 28 | Root magic system (Arabic 3-letter roots = 10 spell elements) | 24K | NOT STARTED |
| 29 | Equipment + inventory + economy (Arabic item names, haggling) | 26K | NOT STARTED |
| 30 | 12 companions (AI battle, teaching, personal quests) | 25K | NOT STARTED |
| 31 | 6 crafting professions (calligraphy, cooking, alchemy, etc.) | 24K | NOT STARTED |
| 32 | Status effects + grammar combos + arena | 24K | NOT STARTED |

**Detail doc:** `.planning/research/EXPANSION-COMBAT-RPG.md`

### v7.0 — World & Content (Phases 33-38, ~147K LOC)
*Fill the world with 24 historically authentic zones worth exploring*

| # | Phase | ~LOC | Status |
|---|-------|------|--------|
| 33 | 24 zones (Baghdad, Cordoba, Timbuktu, Damascus, Cairo, Fez, Samarkand, Granada + fantasy) | 28K | NOT STARTED |
| 34 | Weather + time system (8 weather types, day/night, seasons) | 22K | NOT STARTED |
| 35 | 100+ building interiors (residential, commercial, educational) | 25K | NOT STARTED |
| 36 | Dynamic world state engine (500+ variables, consequences) | 24K | NOT STARTED |
| 37 | 200+ secrets + 15 Arabic puzzle types + exploration rewards | 24K | NOT STARTED |
| 38 | Transport system (mounts, caravans, boats, fast travel) | 24K | NOT STARTED |

**Detail doc:** `.planning/research/EXPANSION-WORLD-CONTENT.md`

### v8.0 — Learning & Progression (Phases 39-44, ~164K LOC)
*Deepen Arabic teaching from basic A1 to intermediate B2*

| # | Phase | ~LOC | Status |
|---|-------|------|--------|
| 39 | 5,000+ vocabulary words (frequency-based, semantic clusters, root families) | 28K | NOT STARTED |
| 40 | 6 language skill trees (reading, writing, listening, conversation, grammar, culture) | 28K | NOT STARTED |
| 41 | 50 grammar lessons A1-B2 (12 exercise types) | 26K | NOT STARTED |
| 42 | 18 quiz types + adaptive engine | 28K | NOT STARTED |
| 43 | 250+ achievements + reward system + celebrations | 26K | NOT STARTED |
| 44 | Adaptive difficulty + learning analytics + personalization | 28K | NOT STARTED |

**Detail doc:** `.planning/research/EXPANSION-LEARNING-PROGRESSION.md`

### v9.0 — Narrative & Social (Phases 45-51, ~143K LOC)
*Weave the story that pulls players forward*

| # | Phase | ~LOC | Status |
|---|-------|------|--------|
| 45 | 8-act main storyline (time-traveling scholar, manuscript pages) | 25K | NOT STARTED |
| 46 | 250+ quests (main, zone, companion, faction, daily, discovery) | 22K | NOT STARTED |
| 47 | 350+ NPCs (personality, schedules, memory, gossip) | 22K | NOT STARTED |
| 48 | 6 factions (Scholars, Merchants, Artisans, Travelers, Guardians, Artists) | 20K | NOT STARTED |
| 49 | Gift + relationship system (100+ gifts, shared experiences) | 18K | NOT STARTED |
| 50 | Player identity (backgrounds, titles, housing, journal) | 18K | NOT STARTED |
| 51 | Lore + codex (300+ entries, environmental storytelling) | 18K | NOT STARTED |

**Detail doc:** `.planning/research/EXPANSION-NARRATIVE-SOCIAL.md`

### v10.0 — Infrastructure (Phases 52-57, ~108K LOC)
*Scale the technical foundation for 800K LOC*

| # | Phase | ~LOC | Status |
|---|-------|------|--------|
| 52 | Backend v2 (API, MongoDB 15+ collections, Redis, CDN) | 22K | NOT STARTED |
| 53 | State management overhaul (25+ Redux slices, normalization) | 18K | NOT STARTED |
| 54 | Performance optimization (code splitting, Web Workers, streaming) | 18K | NOT STARTED |
| 55 | Testing expansion (592 -> 2,000+ tests, Playwright E2E) | 18K | NOT STARTED |
| 56 | Content pipeline + authoring tools (vocabulary, dialogue, quest builders) | 16K | NOT STARTED |
| 57 | Save system + dev tools + migration (3 slots, cloud sync, compression) | 16K | NOT STARTED |

**Detail doc:** `.planning/research/EXPANSION-INFRASTRUCTURE.md`

### v11.0 — AAA Polish (Phases 58-63, ~88K LOC)
*The difference between "feature complete" and "feels like a real game"*

| # | Phase | ~LOC | Status |
|---|-------|------|--------|
| 58 | World polish (environmental animations, footsteps, transitions, loading tips) | 16K | NOT STARTED |
| 59 | Onboarding overhaul (gradual HUD reveal, tutorials, contextual hints) | 14K | NOT STARTED |
| 60 | Accessibility pass (color blind, font scale, screen reader, input remapping) | 14K | NOT STARTED |
| 61 | Game feel & juice (hit-stop, floating numbers, camera choreography) | 16K | NOT STARTED |
| 62 | UI polish (menu transitions, PixelButton system, HUD redesign, gamepad) | 14K | NOT STARTED |
| 63 | Endgame (New Game+, arena, completionist tracker, weekly rotation) | 14K | NOT STARTED |

**Detail doc:** `.planning/research/AAA-QUALITY-GAPS.md`

---

## Progress Tracker

| Version | Phases | LOC | Status |
|---------|--------|-----|--------|
| v1.0-v5.0 (foundation) | 1-26 | ~50K | SHIPPED |
| Phase 26.1 (critical fixes) | — | ~1K | SHIPPED |
| **v6.0 Combat & RPG** | **27-32** | **148K** | **UP NEXT** |
| v7.0 World & Content | 33-38 | 147K | WAITING |
| v8.0 Learning & Progression | 39-44 | 164K | WAITING |
| v9.0 Narrative & Social | 45-51 | 143K | WAITING |
| v10.0 Infrastructure | 52-57 | 108K | WAITING |
| v11.0 AAA Polish | 58-63 | 88K | WAITING |

**NEXT PHASE TO EXECUTE: Phase 27 — Turn-based battle engine**

---

## What Each Phase Execution Looks Like

1. Read the detail doc for that phase (e.g., `EXPANSION-COMBAT-RPG.md` for Phase 27)
2. Research the specific systems needed
3. Create an execution plan
4. Build it, test it, commit it
5. Update this file (change status from NOT STARTED to SHIPPED)
6. Move to next phase

---

## The Numbers

| Metric | Now (v5.0) | After All Phases |
|--------|-----------|-----------------|
| Lines of Code | ~50K | ~800K+ |
| Zones | 8 | 24 |
| NPCs | 140 | 350+ |
| Quests | 52 | 250+ |
| Vocabulary | 1,220 | 5,000+ |
| Grammar Lessons | 7 | 50 |
| Quiz Types | 6 | 18 |
| Achievements | 44 | 250+ |
| Tests | 592 | 2,000+ |
| CEFR Coverage | ~A1 | A1-B2 |
| Playtime | ~10 hours | 120-160 hours |

---

## Research Documents Reference

All in `.planning/research/`:

| File | What |
|------|------|
| EXPANSION-SUMMARY.md | High-level overview of the full expansion |
| EXPANSION-COMBAT-RPG.md | v6.0 detail (phases 27-32) |
| EXPANSION-WORLD-CONTENT.md | v7.0 detail (phases 33-38) |
| EXPANSION-LEARNING-PROGRESSION.md | v8.0 detail (phases 39-44) |
| EXPANSION-NARRATIVE-SOCIAL.md | v9.0 detail (phases 45-51) |
| EXPANSION-INFRASTRUCTURE.md | v10.0 detail (phases 52-57) |
| EXPANSION-PEDAGOGY-SLA.md | 47 pedagogical requirements (SLA research) |
| EXPANSION-CURRICULUM-ARABIC.md | 41 Arabic curriculum requirements |
| AAA-QUALITY-GAPS.md | 60 polish gaps for v11.0 |
| BATTLE-SYSTEM-ARCHITECTURE.md | Deep technical design for battle system |
| ASSET-PIPELINE.md | Sprite atlas, audio, Islamic art pipeline |
| UI-UX-DESIGN-SYSTEM.md | Design tokens, components, accessibility |
| BACKEND-ARCHITECTURE-V2.md | API v2, MongoDB, Redis, save system |
| TECHNICAL-DEBT-AUDIT.md | Known tech debt and scaling concerns |

---

## Story Premise

A young scholar discovers an ancient manuscript that enables travel between historical Arabic cities across time. Baghdad in 800 CE, Cordoba in 950 CE, Timbuktu in 1500 CE. The manuscript's pages are scattered across the world — to read them and travel further, you must learn Arabic. The more Arabic you know, the more of the world opens up.

---

*Last updated: 2026-02-12*
*Next phase: 27 (Turn-based battle engine)*
