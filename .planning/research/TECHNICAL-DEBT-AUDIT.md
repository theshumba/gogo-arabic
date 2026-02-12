# Technical Debt Audit — GoGo Arabic v5.0

**Date**: 2026-02-12
**Scope**: Full codebase audit for scaling readiness (v6.0-v10.0 expansion)

---

## Critical Bug Status

### 3 Critical Bugs — ALL FIXED (commit 7c1430d)
1. **Loot Dirhams** — `useObjectEvents.js:215` now correctly checks `loot.type === 'dirhams'` with min/max randomization
2. **Rules of Hooks** — `DialogueOverlay.jsx` now has all hooks before early returns
3. **Zod Schema** — `dialogueSchema.js` now includes `'world_state'` and `'reward'` effect types

---

## 6 Warnings (Unfixed, Non-Blocking)

1. **InteractableManager.js**: `ONE_TIME_TYPES` includes `pot` but 23 pots have `repeatable: true` (config ignored)
2. **DialogueEngine.js**: Duplicate DIALOGUE_EFFECT_EXECUTED events (per-effect + summary)
3. **zones.js/interiors.js**: `stateChange: 'inspected'` is dead config — handler always dispatches `'used'`
4. **DialogueEngine.js:165**: `oldLevel` computed but never used
5. **useDialogue.js:200**: Stale `quests` closure on rapid teach_word dispatches
6. **No new tests for 10K LOC** across phases 20-26

---

## Scaling Concerns (Must Address for v6.0+)

### 1. localStorage Overflow (CRITICAL)
- Current: redux-persist writes all 13 slices to localStorage
- With 5K+ FSRS cards: estimated 5-10MB (localStorage limit is typically 5MB)
- **Fix**: Migrate heavy data (FSRS cards, world state) to IndexedDB; keep localStorage for lightweight slices only

### 2. BootScene Monolithic Loading (CRITICAL)
- Current: 77 `this.load.*()` calls in BootScene — loads ALL assets at startup
- With 350+ NPCs and 24 zones: estimated 30+ second initial load
- **Fix**: Zone-based lazy loading via AssetStreamingManager; only load current zone + adjacent zones

### 3. Monolithic Data Files (HIGH)
- `npcs.json`: 11,593 lines (424KB) for ~42 NPCs — will balloon to 3+ MB for 350+ NPCs
- `zones.js`: 1,031 lines for 8 zones — will become 3,000+ lines for 24 zones
- `vocabulary-final.json`: 1,220 entries — will need to be split for 5,000+ entries
- **Fix**: Split into per-zone JSON files loaded on demand; use backend API for vocabulary

### 4. Missing Test Infrastructure (HIGH)
- No mock factories for NPCs, quests, items, dialogue trees
- No Phaser scene mocks beyond basic `sceneMock.js`
- No E2E test framework (Playwright needed for v10.0)
- **Fix**: Build test factories early in v6.0; expand scene mocks for battle scenes

### 5. Asset Pipeline Gaps (MEDIUM)
- No word pronunciation audio files exist yet (needed for 5,000 words)
- Japanese-themed placeholder GIF backgrounds (22.4MB) need replacement
- Sprite sheets are ad-hoc, no automated atlas generation
- **Fix**: Set up audio generation pipeline (TTS or native recordings); replace placeholder assets; automate sprite atlas builds

---

## Actual LOC Count

| Area | LOC |
|------|-----|
| Source code (src/) | ~25,000 |
| Data files (JSON) | ~15,000 |
| Tests | ~8,000 |
| Config/tooling | ~2,000 |
| Planning docs | ~60,000 |
| **Total (code + data)** | **~50,000** |
| **Total (all files)** | **~110,000** |

Note: MEMORY.md states "~36K" which was accurate for source code only. With data and tests, actual is ~50K functional LOC.

---

## Pre-existing Test Failures (3)
- `DailyDashboard.test.jsx`: 2 failures (carried from v3.0)
- `HUD.test.jsx`: 1 failure (carried from v3.0)

---

*Generated: 2026-02-12*
*Source: Technical Debt Research Agent (Claude Opus 4.6)*
